import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { GraphFunction, GtlGraph, ModulePublication } from "../gtl/contracts.js";
import { materializeGraph } from "../gtl/materialize.js";
import { constructWorksiteConstructionModulePublication, constructWorksitePreservedResultRecoveryGraphFunction,
  worksitePreservedResultSourceOfGraphFunction } from "../gtl/worksite_construction.js";
import { constructSemanticBridgeGraphFunction, constructSemanticStageGraphFunction } from "../gtl/semantic_stage_publication.js";
import { SEMANTIC_STAGE_IDS } from "../gtl/semantic_stage_identity.js";
import { ABI5_PRODUCT_ID } from "../product/contracts.js";
import { deriveSemanticWorksitePreparation, isSemanticStageEnvelope, type SemanticStageEnvelope } from "../product/semantic_stage.js";
import { isWorksitePreparationInput } from "../product/worksite_preparation.js";
import { WORKSITE_CONSTRUCTION_IDS, constructWorksiteConstructionWorkerResult, isWorksiteConstructionTask,
  worksiteConstructionWorkerResultSchema, type WorksiteConstructionTask } from "../product/worksite_construction.js";
import { WORKSITE_PRESERVED_RESULT_IDS as ids, WORKSITE_PRESERVED_RESULT_IMPLEMENTATION_REFS, constructWorksitePreservedResultSource,
  constructWorksitePreservedResultArtifact, derivePreservedWorksiteCandidateBundle, isWorksitePreservedResultArtifact,
  type WorksitePreservedResultSource, type WorksitePreservedResultArtifact, type WorksitePreservedSourceProof,
  type PreservedProtocolRecord } from "../product/worksite_construction_recovery.js";
import { constructWorksiteObservation } from "../product/worksite_effect.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Bytes, sha256Canonical } from "../shared/digests.js";
import { admitIJsonText } from "../shared/i_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { projectActorProcessLifecycle, validateActorProcessCarrierPair } from "./actor_process.js";
import { projectOpenedCCallCarrierAtPrefix, projectCCallCarrierPhaseAtPrefix, projectAdmittedCCallStateAtPrefix, type CCall } from "./c_call.js";
import { projectExactPrefixWorkspaceEnvironment } from "./environment_admission.js";
import { authenticateRuntimePrefixAncestry, readRuntimeEventsAtDurablePrefix, validateDurablePrefixCoordinate, type DurablePrefixCoordinate, type RuntimeEvent } from "./event_store.js";
import { runtimeEventsFromValidatedPrefix, selectValidatedRuntimeEventPrefix, type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { rehydrateExecutionBasisAtPrefix, rehydrateAdmittedImplementationSetAtPrefix, type ExecutionBasis } from "./execution_basis.js";
import { rehydrateInvocationAdmissionAtPrefix } from "./invocation_admission.js";
import { hasAdmittedTraversalCursorAtPrefix, type TraversalCursorCandidate } from "./traversal_cursor.js";

export interface WorksitePreservedResultNativeBasis {
  readonly publication: Readonly<ModulePublication>;
  readonly graph: Readonly<GtlGraph>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly executionBasis: Readonly<ExecutionBasis>;
  readonly cCall: Readonly<CCall>;
  readonly cursor: Readonly<TraversalCursorCandidate>;
  readonly predecessorPrefix: Readonly<DurablePrefixCoordinate>;
}
const hash = (value: unknown) => sha256Canonical(value as JsonValue);
const same = (a: unknown, b: unknown) => canonicalJson(a as JsonValue) === canonicalJson(b as JsonValue);
function record(value: unknown): value is Readonly<Record<string, JsonValue>> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function one<T>(rows: readonly T[], test: (row: T) => boolean): T | null {
  const selected = rows.filter(test); return selected.length === 1 ? selected[0]! : null;
}
function materialized(execution: ExecutionBasis, graphFunction: GraphFunction) {
  if (graphFunction.name !== execution.graphFunctionRef || hash(graphFunction) !== execution.graphFunctionDigest) return null;
  const graph = materializeGraph(graphFunction, { invocationAdmissionRef: execution.invocationAdmissionRef,
    admittedInputRef: execution.rawInputAdmissionRef, admittedInputDigest: execution.rawInputDigest, admittedInput: execution.rawInputValue });
  return graph.materializationRef === execution.graphRef && graph.materializationDigest === execution.graphDigest ? graph : null;
}
function admittedLeaf(prefix: ValidatedRuntimeEventPrefix, callRef: string, graphFunction: GraphFunction) {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const opened = one(events, e => e.kind === "c_call_opened" && e.aggregateId === callRef);
  const execution = opened?.basisId === undefined ? null : rehydrateExecutionBasisAtPrefix(prefix, opened.basisId);
  const graph = execution === null ? null : materialized(execution, graphFunction);
  const call = graph === null ? null : projectOpenedCCallCarrierAtPrefix(prefix, graph, callRef);
  const result = one(events, e => e.kind === "c_call_result_admitted" && e.aggregateId === callRef);
  const judgment = one(events, e => e.kind === "c_call_judged" && e.aggregateId === callRef);
  if (execution === null || call === null || call.callClass !== "leaf" || result === null || judgment === null ||
    !record(result.payload) || !record(judgment.payload)) return null;
  const state = projectAdmittedCCallStateAtPrefix(prefix, call as unknown as Readonly<Record<string, JsonValue>>,
    { kind: "admitted_c_call_result", schemaVersion: "5.0.0", disposition: "admitted", ...result.payload, admissionEventRef: result.eventId },
    { kind: "admitted_c_call_judgment", schemaVersion: "5.0.0", disposition: "admitted", ...judgment.payload, admissionEventRef: judgment.eventId });
  return state === null ? null : { ...state, execution, resultEvent: result, judgmentEvent: judgment };
}
function sameInvocation(a: ExecutionBasis, b: ExecutionBasis) {
  return a.invocationAdmissionRef === b.invocationAdmissionRef && a.invocationRef === b.invocationRef &&
    a.invocationDigest === b.invocationDigest && a.programRef === b.programRef && a.programDigest === b.programDigest &&
    a.workspaceBindingId === b.workspaceBindingId && a.workspaceBindingDigest === b.workspaceBindingDigest &&
    a.rootImplementationSetRef === b.rootImplementationSetRef && a.rootImplementationSetDigest === b.rootImplementationSetDigest;
}

/** Reconstruct the published closed bridge/assessor arms from native coordinates,
 * not from today's callable closure or a caller-supplied historical definition. */
function taskBridge(prefix: ValidatedRuntimeEventPrefix, execution: ExecutionBasis, task: WorksiteConstructionTask) {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  if (execution.parentExecutionBasisRef === null || execution.parentCCallRef === null) return null;
  const entry = rehydrateExecutionBasisAtPrefix(prefix, execution.parentExecutionBasisRef);
  if (entry === null || !sameInvocation(entry, execution) || !isWorksitePreparationInput(entry.rawInputValue) ||
    entry.rawInputValue.kind !== "worksite_command_preparation_input" || !same(entry.rawInputValue.constructionTask, task)) return null;
  const entryValue = entry.rawInputValue;
  const sources = events.filter(e => e.kind === "c_call_result_admitted" && record(e.payload) && same(e.payload.value, entryValue))
    .map(event => {
      const opened = one(events, e => e.kind === "c_call_opened" && e.aggregateId === event.aggregateId);
      const owner = opened?.basisId === undefined ? null : rehydrateExecutionBasisAtPrefix(prefix, opened.basisId);
      if (owner === null || !sameInvocation(owner, entry) || !record(opened?.payload) || typeof opened.payload.programLocusRef !== "string" ||
        !isSemanticStageEnvelope(owner.rawInputValue) || owner.rawInputValue.worksite === null) return null;
      const graph = constructSemanticBridgeGraphFunction({ graphFunctionRef: owner.graphFunctionRef,
        nodeRef: opened.payload.programLocusRef, closureContractRef: owner.closureContractRef, operation: "design_worksite" });
      const bridge = admittedLeaf(prefix, event.aggregateId, graph);
      if (bridge === null || bridge.cCall.implementationRef !== SEMANTIC_STAGE_IDS.bridgeImplementationRef ||
        bridge.result.resultClass !== "success" || bridge.judgment.judgment !== "advance" ||
        !same(bridge.result.value, entryValue) || !same(deriveSemanticWorksitePreparation(owner.rawInputValue, task), entryValue)) return null;
      const envelope = owner.rawInputValue;
      const last = envelope.assets.at(-1);
      if (last?.assessment === null || last?.assessment === undefined || last.candidate.worksiteDesign === null) return null;
      const assessmentOpen = one(events, e => e.kind === "c_call_opened" && e.aggregateId === last.assessment!.source.cCallRef);
      const assessmentExecution = assessmentOpen?.basisId === undefined ? null : rehydrateExecutionBasisAtPrefix(prefix, assessmentOpen.basisId);
      const stage = envelope.lifecycle.stages.find(s => s.declarationRef === last.stageRef);
      if (assessmentExecution === null || stage === undefined) return null;
      const assessment = admittedLeaf(prefix, last.assessment.source.cCallRef,
        constructSemanticStageGraphFunction(stage, assessmentExecution.closureContractRef));
      if (assessment === null || assessment.cCall.implementationRef !== SEMANTIC_STAGE_IDS.assessorImplementationRef ||
        assessment.result.resultClass !== "success" || assessment.judgment.judgment !== "advance" || !same(assessment.result.value, envelope) ||
        assessment.resultEvent.admissionOrdinal >= event.admissionOrdinal || event.admissionOrdinal >=
          events.find(e => e.eventId === entry.admissionEventRef)!.admissionOrdinal) return null;
      return { envelope, bridge };
    }).filter((x): x is NonNullable<typeof x> => x !== null);
  return sources.length === 1 ? sources[0]! : null;
}
function currentTaskPhysical(task: WorksiteConstructionTask): boolean {
  const root = task.workspaceAuthorityBasis.canonicalRoot;
  if (resolve(root) !== root || realpathSync(root) !== root || lstatSync(root).isSymbolicLink()) return false;
  for (const target of task.targets) {
    const path = fileURLToPath(target.subject.subjectUri), rel = relative(root, path);
    if (rel !== target.subject.relativePath || rel.length === 0 || rel.startsWith("..") || isAbsolute(rel)) return false;
    let observation;
    try {
      if (realpathSync(path) !== path) return false;
      const stat = lstatSync(path);
      if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1) return false;
      const bytes = readFileSync(path);
      observation = constructWorksiteObservation({ subject: target.subject, state: "file", fileIdentity: `${stat.dev}:${stat.ino}`,
        fileDigest: sha256Bytes(bytes), byteLength: bytes.length });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      observation = constructWorksiteObservation({ subject: target.subject, state: "absent" });
    }
    if (!same(observation, target.predecessorObservation)) return false;
  }
  return true;
}

/** Protocol parsing is local to preserved-source authentication, never the transport parser. */
export function projectPreservedStructuredProposal(stdout: Uint8Array) {
  const bytes = Buffer.from(stdout), text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  if (!Buffer.from(text).equals(bytes)) throw new TypeError("preserved stdout changes Unicode bytes");
  const proposals: { input: JsonValue; id: string; session: string; location: PreservedProtocolRecord }[] = [];
  const acknowledgments: { id: string; session: string; location: PreservedProtocolRecord }[] = [];
  let offset = 0, line = 0;
  while (offset < bytes.length) {
    const end = bytes.indexOf(10, offset);
    if (end === -1) break; // The incomplete trailing record remains failure evidence.
    ++line;
    const raw = bytes.subarray(offset, end + 1);
    const value = admitIJsonText(raw.toString("utf8"), "preserved protocol record");
    const location = { line, startByte: offset, endByte: end + 1, digest: sha256Bytes(raw) };
    offset = end + 1;
    if (!record(value)) throw new TypeError("preserved protocol record is not an object");
    if (value.type === "result" || value.type === "error" || value.is_error === true ||
      (value.error !== undefined && value.error !== null) || (value.type === "stream_event" && record(value.event) &&
        (value.event.type === "error" || value.event.is_error === true))) throw new TypeError("preserved protocol contradicts incomplete terminality");
    if (value.type === "stream_event" && record(value.event) && record(value.event.content_block) &&
      value.event.content_block.type === "tool_use" && value.event.content_block.name !== "StructuredOutput") throw new TypeError("ordinary tool in preserved closed lane");
    if ((value.type !== "assistant" && value.type !== "user") || !record(value.message) || !Array.isArray(value.message.content)) continue;
    for (const block of value.message.content) {
      if (!record(block)) continue;
      if (block.type === "tool_use") {
        if (value.type !== "assistant" || block.name !== "StructuredOutput" || typeof block.id !== "string" ||
          typeof value.session_id !== "string" || !record(block.input)) throw new TypeError("foreign or malformed preserved tool use");
        proposals.push({ input: block.input, id: block.id, session: value.session_id, location });
      }
      if (block.type === "tool_result") {
        if (value.type !== "user" || block.is_error === true || block.content !== "Structured output provided successfully" ||
          typeof block.tool_use_id !== "string" || typeof value.session_id !== "string") throw new TypeError("unsuccessful preserved acknowledgment");
        acknowledgments.push({ id: block.tool_use_id, session: value.session_id, location });
      }
    }
  }
  if (proposals.length !== 1 || acknowledgments.length !== 1) throw new TypeError("preserved proposal and acknowledgment must be unique");
  const proposal = proposals[0]!, acknowledgment = acknowledgments[0]!;
  if (proposal.id !== acknowledgment.id || proposal.session !== acknowledgment.session || proposal.location.endByte > acknowledgment.location.startByte) {
    throw new TypeError("preserved acknowledgment crosses proposal/session/order");
  }
  return { workerCandidate: proposal.input, proposal: proposal.location, acknowledgment: acknowledgment.location,
    toolUseId: proposal.id, sessionId: proposal.session };
}
function originalRequest(task: WorksiteConstructionTask) {
  return { actorRef: WORKSITE_CONSTRUCTION_IDS.workerActorRef, workerBindingRef: WORKSITE_CONSTRUCTION_IDS.workerBindingRef,
    implementationRef: WORKSITE_CONSTRUCTION_IDS.candidateImplementationRef, inputDigest: hash(task),
    materializationPlanRef: WORKSITE_CONSTRUCTION_IDS.materializationPlanRef, rendererRef: WORKSITE_CONSTRUCTION_IDS.rendererRef,
    instructionContractRef: WORKSITE_CONSTRUCTION_IDS.taskContractRef, resultContractRef: WORKSITE_CONSTRUCTION_IDS.workerResultContractRef,
    transportLane: WORKSITE_CONSTRUCTION_IDS.transportLane, prompt: task.prompt, responseJsonSchema: worksiteConstructionWorkerResultSchema(task) };
}

/** Native historical read projection. This admits neither the old proposal nor a new effect. */
export function projectPreservedWorksiteProposal(selector: WorksitePreservedResultSource) {
  try {
    const source = constructWorksitePreservedResultSource(selector);
    const events = readRuntimeEventsAtDurablePrefix(source.historicalPrefix), prefix = selectValidatedRuntimeEventPrefix(events);
    const opened = one(events, e => e.kind === "c_call_opened" && e.aggregateId === source.sourceCCallRef);
    const execution = opened?.basisId === undefined ? null : rehydrateExecutionBasisAtPrefix(prefix, opened.basisId);
    if (execution === null || execution.graphFunctionRef !== WORKSITE_CONSTRUCTION_IDS.graphFunctionRef || !isWorksiteConstructionTask(execution.rawInputValue)) return null;
    const environment = projectExactPrefixWorkspaceEnvironment(source.historicalPrefix,
      { ref: execution.workspaceBindingId, digest: execution.workspaceBindingDigest });
    if (environment.kind !== "exact_prefix_workspace_environment") return null;
    const install = one(environment.productInstalls, p => p.productId === ABI5_PRODUCT_ID);
    if (install === null) return null;
    const publication = constructWorksiteConstructionModulePublication({ productId: install.productId, artifactDigest: install.artifactDigest,
      productContentDigest: install.productContentDigest, productManifestDigest: install.manifestDigest, packageName: install.packageName, packageVersion: install.packageVersion });
    const graph = publication.graphFunctions.find(g => g.name === WORKSITE_CONSTRUCTION_IDS.graphFunctionRef)!;
    const old = admittedLeaf(prefix, source.sourceCCallRef, graph), task = execution.rawInputValue;
    if (old === null || old.cCall.implementationRef !== WORKSITE_CONSTRUCTION_IDS.candidateImplementationRef ||
      old.cCall.implementationBindingRef !== WORKSITE_CONSTRUCTION_IDS.candidateImplementationBindingRef || old.cCall.regime !== "F_P" ||
      old.result.resultClass !== "failure" || old.judgment.judgment !== "blocked") return null;
    const bridge = taskBridge(prefix, execution, task);
    if (bridge === null) return null;
    const started = one(events, e => e.kind === "actor_invocation_started" && e.aggregateId === source.actorInvocationRef && e.parentAggregateId === source.sourceCCallRef);
    const artifact = one(events, e => e.kind === "actor_result_artifact_observed" && e.aggregateId === source.actorInvocationRef && e.parentAggregateId === source.sourceCCallRef);
    const failed = one(events, e => e.kind === "actor_invocation_failed" && e.aggregateId === source.actorInvocationRef && e.parentAggregateId === source.sourceCCallRef);
    if (!record(started?.payload) || !record(artifact?.payload) || !record(failed?.payload)) return null;
    const startedPayload = started.payload;
    const binding = one(events, e => e.kind === "actor_transport_binding_admitted" && e.aggregateId === startedPayload.transportBindingRef &&
      e.parentAggregateId === source.sourceCCallRef && e.basisId === execution.basisRef);
    if (!record(binding?.payload)) return null;
    const b = binding.payload, a = artifact.payload;
    const request = originalRequest(task), requestDigest = hash(request);
    const { transportBindingRef, transportBindingDigest, ...bindingBody } = b;
    const observation = Object.fromEntries(Object.entries(a).filter(([k]) => k !== "cCallRef" && k !== "requestRef" && k !== "requestDigest"));
    const pair = validateActorProcessCarrierPair(request, observation);
    if (pair.kind !== "actor_process_carrier_validation" || pair.observation.disposition !== "failure" || pair.observation.failureClass !== "no_output" ||
      pair.observation.finalOutput !== "" || pair.observation.processStatus !== 0 || pair.observation.processSignal !== null ||
      pair.observation.timedOut || !pair.observation.terminationConfirmed || !pair.observation.exitObserved || pair.observation.toolCallCount !== 0 ||
      pair.observation.toolInvocations.length !== 0 || b.lane !== "closed_prompt_proof" || b.parser !== "claude_stream_json" ||
      b.implementationBindingRef !== old.cCall.implementationBindingRef || b.implementationRef !== old.cCall.implementationRef ||
      b.inputDigest !== hash(task) || b.promptDigest !== hash(task.prompt) || b.responseJsonSchemaDigest !== hash(request.responseJsonSchema) ||
      hash(bindingBody) !== transportBindingDigest || transportBindingRef !== `transport-binding://abiogenesis/${String(transportBindingDigest).slice(7)}` ||
      [started.payload, a].some(p => p.requestDigest !== requestDigest || p.requestRef !== `probabilistic-request://abiogenesis/${requestDigest.slice(7)}` ||
        p.transportBindingRef !== transportBindingRef || p.transportBindingDigest !== transportBindingDigest) ||
      typeof b.dispatchOrdinal !== "number" || !record(b.paths) || typeof b.archiveRoot !== "string") return null;
    const attemptDigest = hash({ basisRef: execution.basisRef, cCallRef: old.cCall.cCallRef, attempt: old.cCall.attempt,
      dispatchOrdinal: b.dispatchOrdinal, actorRef: request.actorRef, workerBindingRef: request.workerBindingRef,
      implementationBindingRef: old.cCall.implementationBindingRef, implementationRef: request.implementationRef, inputDigest: request.inputDigest, promptDigest: hash(task.prompt) });
    if (source.actorInvocationRef !== `actor-invocation://abiogenesis/${hash({ attemptDigest, transportBindingRef, transportBindingDigest }).slice(7)}` ||
      a.processRef !== `process://abiogenesis/${hash({ actorInvocationRef: source.actorInvocationRef }).slice(7)}`) return null;
    const lifecycle = projectActorProcessLifecycle(prefix, source.actorInvocationRef);
    const exit = one(events, e => e.eventId === lifecycle.processTerminalEventRef);
    if (lifecycle.processLive || lifecycle.cleanupDisposition !== "complete" || lifecycle.processTerminalKind !== "actor_process_exited" ||
      lifecycle.actorTerminalEventRef !== failed.eventId || !record(exit?.payload) || exit.payload.status !== 0 || exit.payload.signal !== null ||
      !(binding.admissionOrdinal < started.admissionOrdinal && started.admissionOrdinal < exit.admissionOrdinal && exit.admissionOrdinal < artifact.admissionOrdinal &&
        artifact.admissionOrdinal < failed.admissionOrdinal && failed.admissionOrdinal < old.resultEvent.admissionOrdinal)) return null;
    const artifacts = {} as Record<"output" | "prompt" | "stderr" | "stdout" | "transport", Buffer>;
    for (const key of ["output", "prompt", "stderr", "stdout", "transport"] as const) {
      const path = b.paths[key];
      if (typeof path !== "string" || resolve(path) !== path || realpathSync(path) !== path || relative(b.archiveRoot, path).startsWith("..") ||
        isAbsolute(relative(b.archiveRoot, path))) return null;
      const stat = lstatSync(path);
      if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1) return null;
      artifacts[key] = readFileSync(path);
      if (sha256Bytes(artifacts[key]) !== pair.observation.artifactDigests[key]) return null;
    }
    const transport = admitIJsonText(artifacts.transport.toString("utf8"));
    if (!record(transport) || !artifacts.prompt.equals(Buffer.from(task.prompt)) || artifacts.output.length !== 0 ||
      artifacts.stdout.length !== pair.observation.stdoutByteLength || artifacts.stderr.length !== pair.observation.stderrByteLength ||
      transport.stdout !== artifacts.stdout.toString("utf8") || transport.stderr !== artifacts.stderr.toString("utf8") || transport.finalOutput !== "" ||
      transport.disposition !== "failure" || transport.failureClass !== "no_output" || transport.status !== 0 || transport.signal !== null ||
      transport.toolCallCount !== 0 || !same(transport.toolInvocations, []) || transport.timedOut !== false || transport.exitObserved !== true || transport.terminationConfirmed !== true) return null;
    const chunks = events.filter(e => e.kind === "actor_process_stdout_observed" || e.kind === "actor_process_stderr_observed")
      .filter(e => record(e.payload) && e.payload.actorInvocationRef === source.actorInvocationRef);
    let stdoutOffset = 0, stderrOffset = 0;
    for (const [index, event] of chunks.entries()) {
      if (!record(event.payload) || event.payload.streamOrdinal !== index + 1 || event.aggregateId !== a.processRef ||
        event.parentAggregateId !== source.actorInvocationRef || event.basisId !== execution.basisRef ||
        event.runId !== old.cCall.runId || event.admissionOrdinal <= started.admissionOrdinal || event.admissionOrdinal >= exit.admissionOrdinal ||
        !Number.isSafeInteger(event.payload.byteLength) || Number(event.payload.byteLength) < 0) return null;
      const stream = event.kind === "actor_process_stdout_observed" ? "stdout" : "stderr";
      const offset = stream === "stdout" ? stdoutOffset : stderrOffset;
      const bytes = artifacts[stream].subarray(offset, offset + Number(event.payload.byteLength));
      if (bytes.length !== event.payload.byteLength || hash(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) !== event.payload.chunkDigest) return null;
      if (stream === "stdout") stdoutOffset += bytes.length; else stderrOffset += bytes.length;
    }
    const stdoutChunkEventRefs = chunks.filter(e => e.kind === "actor_process_stdout_observed").map(e => e.eventId);
    if (stdoutOffset !== artifacts.stdout.length || stderrOffset !== artifacts.stderr.length ||
      !same(failed.payload.consumedStdoutEventRefs, stdoutChunkEventRefs) ||
      !same(failed.payload.consumedStderrEventRefs, chunks.filter(e => e.kind === "actor_process_stderr_observed").map(e => e.eventId))) return null;
    const protocol = projectPreservedStructuredProposal(artifacts.stdout);
    const workerResult = constructWorksiteConstructionWorkerResult(task, protocol.workerCandidate);
    const proof: WorksitePreservedSourceProof = { sourceExecutionBasisRef: execution.basisRef, sourceExecutionBasisDigest: execution.basisDigest,
      sourceRunId: old.cCall.runId, sourceAttempt: old.cCall.attempt, requestDigest, transportBindingRef: String(transportBindingRef),
      transportBindingDigest: pair.observation.transportBindingDigest, processRef: pair.observation.processRef, artifactEventRef: artifact.eventId,
      originalResultRef: old.result.resultRef, originalResultDigest: old.result.resultDigest,
      originalJudgmentRef: old.judgment.judgmentRef, originalJudgmentDigest: old.judgment.judgmentDigest,
      assessedEnvelopeDigest: hash(bridge.envelope), artifactDigests: pair.observation.artifactDigests,
      artifactByteLengths: { output: artifacts.output.length, prompt: artifacts.prompt.length, stderr: artifacts.stderr.length, stdout: artifacts.stdout.length, transport: artifacts.transport.length },
      stdoutChunkEventRefs, proposal: protocol.proposal, acknowledgment: protocol.acknowledgment, toolUseId: protocol.toolUseId, sessionId: protocol.sessionId };
    return deepFreeze({ source, originalTask: task, workerResult, proof, envelope: bridge.envelope });
  } catch { return null; }
}

export function authenticateWorksitePreservedResultBasis(basis: WorksitePreservedResultNativeBasis) {
  try {
    const source = worksitePreservedResultSourceOfGraphFunction(basis.graphFunction);
    if (source === null || !validateDurablePrefixCoordinate(basis.predecessorPrefix) ||
      !authenticateRuntimePrefixAncestry(source.historicalPrefix, basis.predecessorPrefix)) return null;
    const events = readRuntimeEventsAtDurablePrefix(basis.predecessorPrefix), prefix = selectValidatedRuntimeEventPrefix(events);
    const execution = rehydrateExecutionBasisAtPrefix(prefix, basis.executionBasis.basisRef);
    if (execution === null || !same(execution, basis.executionBasis) || !isWorksiteConstructionTask(execution.rawInputValue)) return null;
    const graph = materialized(execution, basis.graphFunction);
    if (graph === null || !same(graph, basis.graph)) return null;
    const call = projectOpenedCCallCarrierAtPrefix(prefix, graph, basis.cCall.cCallRef);
    const opened = one(events, e => e.eventId === call?.openedEventRef);
    if (call === null || !same(call, basis.cCall) || call.callClass !== "leaf" || call.regime !== "F_D" ||
      !WORKSITE_PRESERVED_RESULT_IMPLEMENTATION_REFS.includes(call.implementationRef ?? "") ||
      !hasAdmittedTraversalCursorAtPrefix(prefix, basis.cursor) || !record(opened?.payload) ||
      opened.payload.cursorRef !== basis.cursor.cursorRef || opened.payload.cursorDigest !== basis.cursor.cursorDigest ||
      basis.cursor.executionBasisRef !== execution.basisRef || basis.cursor.graphCallId !== call.graphCallId || basis.cursor.frameId !== call.frameId ||
      projectCCallCarrierPhaseAtPrefix(prefix, call)?.phase !== "selected_no_evidence") return null;
    const set = rehydrateAdmittedImplementationSetAtPrefix(prefix, execution.implementationSetRef);
    const rootSet = rehydrateAdmittedImplementationSetAtPrefix(prefix, execution.rootImplementationSetRef);
    if (set === null || rootSet === null || set.implementationSetDigest !== execution.implementationSetDigest ||
      rootSet.implementationSetDigest !== execution.rootImplementationSetDigest || rootSet.publicationDigest !== hash(basis.publication) ||
      !basis.publication.programs.some(p => p.programRef === execution.programRef && hash(p) === execution.programDigest) ||
      set.rows.filter(row => row.graphFunctionRef === call.graphFunctionRef && row.programLocusRef === call.programLocusRef &&
        row.implementationRef === call.implementationRef && row.implementationBindingRef === call.implementationBindingRef &&
        row.inputContractRef === call.inputContractRef && row.outputContractRef === call.outputContractRef && row.computeRegime === "F_D").length !== 1) return null;
    const environment = projectExactPrefixWorkspaceEnvironment(basis.predecessorPrefix,
      { ref: execution.workspaceBindingId, digest: execution.workspaceBindingDigest });
    const invocation = rehydrateInvocationAdmissionAtPrefix(prefix, execution.invocationAdmissionRef), task = execution.rawInputValue;
    if (environment.kind !== "exact_prefix_workspace_environment" || invocation?.capabilityGrants.length !== 1 ||
      !same(environment.workspaceAuthorityBasis, task.workspaceAuthorityBasis) || !same(environment.workspaceBinding, task.workspaceBinding) ||
      !same(invocation.capabilityGrants[0], task.capabilityGrant)) return null;
    const bridge = taskBridge(prefix, execution, task);
    if (bridge === null) return null;
    const inputValue = basis.cursor.inputRef === execution.rawInputAdmissionRef ? task : one(events, e => e.kind === "c_call_result_admitted" &&
      record(e.payload) && e.payload.resultRef === basis.cursor.inputRef)?.payload;
    const input = record(inputValue) && "value" in inputValue ? inputValue.value : inputValue;
    if (hash(input) !== basis.cursor.inputDigest) return null;
    return { source, events, prefix, execution, call, task, input, bridge };
  } catch { return null; }
}
export function constructWorksitePreservedResultNativeBasis(basis: WorksitePreservedResultNativeBasis) {
  return authenticateWorksitePreservedResultBasis(basis) === null ? null : deepFreeze(basis);
}
export function projectWorksitePreservedResultArtifact(basis: WorksitePreservedResultNativeBasis, input: unknown) {
  try {
    const owner = authenticateWorksitePreservedResultBasis(basis);
    if (owner === null || owner.call.implementationRef !== ids.authenticateImplementationRef || !same(owner.input, input) ||
      !same(input, owner.task) || !currentTaskPhysical(owner.task)) return null;
    const preserved = projectPreservedWorksiteProposal(owner.source);
    if (preserved === null || !same(preserved.envelope, owner.bridge.envelope)) return null;
    return constructWorksitePreservedResultArtifact({ source: preserved.source, proof: preserved.proof, originalTask: preserved.originalTask,
      workerResult: preserved.workerResult, currentTask: owner.task, owner: { graphFunctionRef: owner.execution.graphFunctionRef,
        executionBasisRef: owner.execution.basisRef, executionBasisDigest: owner.execution.basisDigest, cCallRef: owner.call.cCallRef } });
  } catch { return null; }
}
export function projectWorksitePreservedCandidateBundle(basis: WorksitePreservedResultNativeBasis, input: unknown) {
  try {
    const owner = authenticateWorksitePreservedResultBasis(basis);
    if (owner === null || owner.call.implementationRef !== ids.deriveImplementationRef || !isWorksitePreservedResultArtifact(input) ||
      !same(owner.input, input) || !same(input.currentTask, owner.task) || !currentTaskPhysical(owner.task)) return null;
    const admitted = admittedLeaf(owner.prefix, input.owner.cCallRef, basis.graphFunction);
    if (admitted === null || admitted.execution.basisRef !== owner.execution.basisRef || admitted.cCall.implementationRef !== ids.authenticateImplementationRef ||
      admitted.result.resultClass !== "success" || admitted.judgment.judgment !== "advance" ||
      admitted.result.resultRef !== basis.cursor.inputRef || !same(admitted.result.value, input)) return null;
    const preserved = projectPreservedWorksiteProposal(owner.source);
    if (preserved === null || !same(preserved.envelope, owner.bridge.envelope)) return null;
    const expected = constructWorksitePreservedResultArtifact({ source: preserved.source, proof: preserved.proof, originalTask: preserved.originalTask,
      workerResult: preserved.workerResult, currentTask: owner.task, owner: input.owner });
    return same(expected, input) ? derivePreservedWorksiteCandidateBundle(input) : null;
  } catch { return null; }
}
export function worksitePreservedResultMatchesBasis(basis: WorksitePreservedResultNativeBasis, input: unknown, value: unknown) {
  const expected = basis.cCall.implementationRef === ids.authenticateImplementationRef
    ? projectWorksitePreservedResultArtifact(basis, input) : projectWorksitePreservedCandidateBundle(basis, input);
  return expected !== null && same(expected, value);
}

/** Replay/C2 recognizes the exact admitted recovery owner and both F_D producers.
 * It reads no original application bytes or temporary command snapshot. */
export function nativeWorksiteRecoverySourceAtPrefix(prefix: ValidatedRuntimeEventPrefix, execution: ExecutionBasis): boolean {
  try {
    if (!isWorksiteConstructionTask(execution.rawInputValue)) return false;
    const events = runtimeEventsFromValidatedPrefix(prefix);
    const artifacts = events.filter(e => e.kind === "c_call_result_admitted" && e.basisId === execution.basisRef && record(e.payload) &&
      isWorksitePreservedResultArtifact(e.payload.value)).map(e => e.payload as Readonly<Record<string, JsonValue>>);
    if (artifacts.length !== 1) return false;
    const artifact = artifacts[0]!.value as unknown as WorksitePreservedResultArtifact;
    if (artifact.owner.executionBasisRef !== execution.basisRef || artifact.owner.executionBasisDigest !== execution.basisDigest ||
      artifact.owner.graphFunctionRef !== execution.graphFunctionRef || !same(artifact.currentTask, execution.rawInputValue)) return false;
    const graph = constructWorksitePreservedResultRecoveryGraphFunction({ graphFunctionRef: execution.graphFunctionRef, source: artifact.source });
    if (materialized(execution, graph) === null) return false;
    const admitted = admittedLeaf(prefix, artifact.owner.cCallRef, graph);
    if (admitted === null || admitted.cCall.implementationRef !== ids.authenticateImplementationRef || admitted.result.resultClass !== "success" ||
      admitted.judgment.judgment !== "advance" || !same(admitted.result.value, artifact)) return false;
    const bundle = derivePreservedWorksiteCandidateBundle(artifact);
    const candidates = events.filter(e => e.kind === "c_call_result_admitted" && e.basisId === execution.basisRef && record(e.payload) && same(e.payload.value, bundle))
      .map(event => admittedLeaf(prefix, event.aggregateId, graph)).filter(candidate => candidate !== null &&
        candidate.cCall.implementationRef === ids.deriveImplementationRef && candidate.result.resultClass === "success" && candidate.judgment.judgment === "advance" &&
        candidate.resultEvent.admissionOrdinal > admitted.resultEvent.admissionOrdinal);
    return candidates.length === 1;
  } catch { return false; }
}
