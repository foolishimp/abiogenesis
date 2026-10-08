import { framedSynthesisAtLocus } from "../gtl/stdo_run_environment.js";
import { resolveRegisteredSelection } from "../gtl/registered_selection.js";
import { isFramedSynthesisTask, isFramedSynthesisResult, type FramedSynthesisTask } from "../product/default_library.js";
import { isDeepStrictEqual as same } from "node:util";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { authenticateNativeInstructionAssemblyBasis, type NativeInstructionAssemblyBasis } from "./execution_basis.js";
import { projectExactInvocationAdmissionAtPrefix, projectExactExecutionBasisAtPrefix, hasAdmittedGovernanceSourceUse } from "./invocation_execution_truth.js";
import { indexedRuntimeEvents } from "./event_prefix.js";
import { worksiteCommandSourcesInvalidatedAfter, projectNativeWorkspaceWorkSourceAtPrefix } from "./native_worksite_execution.js";
import { isGovernanceWorkState, governanceTestingConfiguration, governanceAssessmentContract, governanceVerdict, GOVERNANCE_POLICIES,
  GOVERNANCE_IMPLEMENTATION_REFS, governanceRef as ref, governanceContract as contract, type GovernanceWorkState, type GovernancePurpose } from "../product/default_library.js";
import { isRetainedGraphInput } from "../product/worksite_preparation_contracts.js";
import { constructNativeWorkspaceWorkTask, isNativeWorkspaceWorkTask, isNativeWorkspaceWorkObservation } from "../product/native_workspace_work.js";
import { constructObservedWorksiteCommandExecutionTask, constructNativeWorksiteCommandExecutionTask, worksiteCommandConfigurationMatches,
  isObservedWorksiteCommandExecutionTask, isNativeWorksiteCommandExecutionTask, isObservedWorksiteCommandExecutionObservation,
  isNativeWorksiteCommandExecutionObservation, type ObservedWorksiteCommandExecutionTaskInput } from "../product/worksite_command_execution.js";
import { constructWorksiteSubject, isWorksiteContextObservation, type WorksiteContextObservation } from "../product/worksite_effect.js";
import { observeWorksiteContext, observeWorksiteSubject } from "../product/worksite_operations.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { RuntimeEvent } from "./event_store.js";
import { governanceFulfillmentSelection, initialGovernanceFulfillment, governanceFulfillmentSourceMatches, deriveGovernanceObligations,
  bindGovernanceFulfillmentAssessment, projectGovernanceFulfillment, invalidateGovernanceFulfillment, governanceFulfillmentActive,
  type GovernanceFulfillmentEvidence } from "../product/default_library_fulfillment.js";
import { framedSynthesisEvidenceRefs, governanceSubjectEvidenceRefs } from "../product/default_library.js";
const record = (x: unknown): x is Readonly<Record<string, JsonValue>> => typeof x === "object" && x !== null && !Array.isArray(x);
const asJson = (x: unknown) => x as Readonly<Record<string, JsonValue>>;
function owner(basis: NativeInstructionAssemblyBasis, input: unknown) {
  const owned = authenticateNativeInstructionAssemblyBasis(basis);
  if (owned === null || !same(owned.inputValue, input) || !GOVERNANCE_IMPLEMENTATION_REFS.includes(owned.call.implementationRef ?? "") || owned.environment.kind !== "exact_prefix_workspace_environment") return null;
  const invocation = projectExactInvocationAdmissionAtPrefix(owned.prefix, owned.execution.invocationAdmissionRef);
  if (invocation === null || invocation.capabilityGrants.length !== 1) return null;
  const roots = indexedRuntimeEvents(owned.prefix, "invocation:" + invocation.invocationRef).filter(e =>
    e.kind === "basis_admitted" && record(e.payload) && e.payload.basisClass === "root" &&
    e.payload.invocationAdmissionRef === invocation.invocationAdmissionRef && e.payload.implementationSetRef === owned.execution.rootImplementationSetRef);
  const initial = roots.length === 1 && record(roots[0]!.payload) ? roots[0]!.payload.rawInputValue : null;
  // The ingress already admitted exact source -> raw input equality. Consume
  // those bound identities rather than revalidate/hash the retained state here.
  const retained = invocation.sourceResultBasis?.sourceResultContractRef === contract("state") &&
    invocation.sourceResultBasis.sourceResultValueDigest === invocation.rawInputDigest;
  if (!isGovernanceWorkState(initial) || initial.terminal || (!retained &&
    (initial.observations.length !== 0 || initial.synthesis !== null))) return null;
  if (governanceFulfillmentSelection(owned.program, initial.original) === "invalid" || initial.original.fulfillment !== undefined &&
    !retained && !same(initial.fulfillment, initialGovernanceFulfillment(initial.original.fulfillment))) return null;
  const state = isRetainedGraphInput(input) ? input.entry : isFramedSynthesisTask(input) || isFramedSynthesisResult(input) ? input.state : input;
  if (isGovernanceWorkState(state) && !same(state.original, initial.original)) return null;
  return { ...owned, environment: owned.environment, invocation, grant: invocation.capabilityGrants[0]! };
}
type Owner = NonNullable<ReturnType<typeof owner>>;
function operating(o: Owner) { return { workspaceAuthorityBasis: o.environment.workspaceAuthorityBasis, workspaceBinding: o.environment.workspaceBinding,
  capabilityGrant: o.grant }; }
function contextMatches(o: Owner, state: GovernanceWorkState, context: WorksiteContextObservation) {
  return isWorksiteContextObservation(context) && context.workspaceAuthorityBasisRef === o.environment.workspaceAuthorityBasis.authorityBasisId &&
    context.workspaceAuthorityBasisDigest === o.environment.workspaceAuthorityBasis.authorityBasisDigest && context.workspaceBindingIdentity === o.execution.workspaceBindingId &&
    context.workspaceBindingDigest === o.execution.workspaceBindingDigest && same(context.readRoots, state.original.readRoots) &&
    context.maxFiles === state.original.maxContextFiles && context.maxBytes === state.original.maxContextBytes &&
    state.original.sources.every(s => context.entries.some(e => e.relativePath === s.path && e.state === "file" && e.digest === s.digest));
}
async function currentContext(o: Owner, state: GovernanceWorkState) {
  const context = await observeWorksiteContext({ ...operating(o), protectedInstallRoots: o.environment.productInstalls.map(i => i.installedRoot), readRoots: state.original.readRoots, maxFiles: state.original.maxContextFiles, maxBytes: state.original.maxContextBytes });
  return isWorksiteContextObservation(context) && contextMatches(o, state, context) ? context : null;
}
function result(o: Owner, resultRef: string, resultDigest?: string): RuntimeEvent | null {
  const rows = indexedRuntimeEvents(o.prefix, "payload:resultRef:" + resultRef).filter(e => e.kind === "c_call_result_admitted" &&
    (e.runId === o.call.runId || hasAdmittedGovernanceUse(o, e)) && record(e.payload) && e.payload.resultClass === "success" && (resultDigest === undefined || e.payload.resultDigest === resultDigest));
  return rows.length === 1 ? rows[0]! : null;
}
function hasAdmittedGovernanceUse(o: Owner, event: RuntimeEvent): boolean {
  return hasAdmittedGovernanceSourceUse(o.invocation, event);
}
function sourceResult(o: Owner, input: unknown) {
  const retained = o.inputOrigin.retainedProjection;
  return retained !== undefined && retained.entryBasis.basisRef === o.execution.basisRef &&
    retained.input.admissionRef === o.inputRef && same(retained.input.value, input) ? retained.sourceResult : null;
}
function selectionTask(state: GovernanceWorkState, context: WorksiteContextObservation): FramedSynthesisTask {
  if (state.terminal) throw new TypeError("completed parent cannot select work");
  return { kind: "framed_synthesis_task", schemaVersion: "5.0.0", state, context };
}
export function projectGovernanceChoice(basis: NativeInstructionAssemblyBasis, input: unknown) {
  const o = owner(basis, input); if (o === null || !isFramedSynthesisResult(input)) return null;
  const profile = framedSynthesisAtLocus(basis.graphFunction, basis.graphFunction.declarations["abg.framed_synthesis_locus"] ?? "");
  const event = o.inputOrigin.event;
  if (!profile || profile.projection.nodeRef !== basis.cursor.currentNodeRef || event?.kind !== "c_call_result_admitted" ||
    event.runId !== o.call.runId || event.basisId !== o.execution.basisRef || event.graphCallId !== o.call.graphCallId ||
    !record(event.payload) || event.payload.resultClass !== "success" || event.payload.resultRef !== o.inputRef || typeof event.payload.resultDigest !== "string") return null;
  const opened = indexedRuntimeEvents(o.prefix, "related:" + event.aggregateId).filter(e => e.kind === "c_call_opened" &&
    e.runId === o.call.runId && e.basisId === o.execution.basisRef && record(e.payload) && e.payload.programLocusRef === profile.node.nodeRef);
  if (opened.length !== 1) return null;
  const j = input.judgment, common = { kind: "registered_graph_choice", schemaVersion: "5.0.0", reason: j.nextReason, evidenceRefs: j.nextEvidenceRefs };
  let projected = input.state;
  if (input.state.original.fulfillment !== undefined) {
    // The selector's actual admitted input owns this context. Do not reread a
    // mutable worksite or reconstruct the proposal from arbitrary payloads.
    const inputEvents = indexedRuntimeEvents(o.prefix, "payload:resultRef:" + input.basis.inputRef)
      .filter(e => e.kind === "c_call_result_admitted" && e.runId === o.call.runId && e.basisId === event.basisId &&
        record(e.payload) && e.payload.valueDigest === input.basis.inputDigest && isFramedSynthesisTask(e.payload.value));
    const inputEvent = inputEvents.length === 1 ? inputEvents[0] : undefined;
    const task = record(inputEvent?.payload) && isFramedSynthesisTask(inputEvent.payload.value) ? inputEvent.payload.value : null;
    if (task === null || j.requirementProposals === undefined || !same(task.state, input.state)) return null;
    const fulfillment = deriveGovernanceObligations(input.state.original.fulfillment, input.state.fulfillment!, j.requirementProposals,
      input.state.original.taskRef, o.inputRef, task.context, framedSynthesisEvidenceRefs(task));
    if (fulfillment === null) return null;
    projected = { ...input.state, fulfillment, unresolvedSupportRefs: fulfillment.coverage.filter(r => r.disposition !== "eligible").map(r => r.obligationRef) };
  }
  if (j.nextGraphFunctionRef === null) return { ...common, evidenceRefs: projected.fulfillment === undefined ? common.evidenceRefs : [...new Set([...common.evidenceRefs, o.inputRef])],
    disposition: "gap", missingSupportRefs: [...new Set([...j.gaps.flatMap(g => g.supportRefs), ...(projected.fulfillment === undefined ? [] : projected.unresolvedSupportRefs)])] };
  const next: GovernanceWorkState = { ...projected, synthesis: { resultRef: o.inputRef, resultDigest: event.payload.resultDigest as `sha256:${string}`,
    basis: input.basis, judgment: j } };
  const choice = { ...common, disposition: "selected", graphFunctionRef: j.nextGraphFunctionRef,
    definitionDigest: o.execution.registeredSelectionDefinitionDigests?.[j.nextGraphFunctionRef], input: { contractRef: contract("state"), value: asJson(next) } };
  try { return resolveRegisteredSelection(o.graph.template, basis.cursor, o.call.outputContractRef, choice as unknown as JsonValue,
    o.execution.registeredSelectionDefinitionDigests ?? {})?.disposition === "selected" ? choice : null; } catch { return null; }
}
export async function projectGovernanceSelection(basis: NativeInstructionAssemblyBasis, input: unknown) {
  const o = owner(basis, input); if (o === null || !isGovernanceWorkState(input)) return null;
  const context = await currentContext(o, input);
  if (context === null || input.original.fulfillment !== undefined && input.synthesis === null &&
    !governanceFulfillmentSourceMatches(input.original.fulfillment, context)) return null;
  return selectionTask(input, context);
}
function subjectEvidence(o: Owner, state: GovernanceWorkState, purpose: GovernancePurpose) {
  const ref = state.synthesis?.judgment.subjectEvidenceRef;
  if (ref === null || ref === undefined || !governanceSubjectEvidenceRefs(state, purpose).includes(ref)) return null;
  const selected = state.observations.filter(r => r.resultRef === ref);
  if (selected.length !== 1) return null;
  const event = result(o, ref, selected[0]!.resultDigest);
  if (event === null || !record(event.payload) || event.aggregateId !== selected[0]!.cCallRef || typeof event.basisId !== "string") return null;
  const sourceBasis = projectExactExecutionBasisAtPrefix(o.prefix, event.basisId);
  const retainedUse = hasAdmittedGovernanceUse(o, event);
  if (sourceBasis === null || !retainedUse && (sourceBasis.invocationAdmissionRef !== o.execution.invocationAdmissionRef ||
    sourceBasis.rootImplementationSetRef !== o.execution.rootImplementationSetRef) || sourceBasis.workspaceBindingId !== o.execution.workspaceBindingId ||
    sourceBasis.workspaceBindingDigest !== o.execution.workspaceBindingDigest) return null;
  const value = event.payload.value;
  if (!(isNativeWorkspaceWorkObservation(value) && value.task.assessment === undefined) &&
    !isObservedWorksiteCommandExecutionObservation(value) && !isNativeWorksiteCommandExecutionObservation(value)) return null;
  if (value.provenance.actorInvocationRef !== selected[0]!.actorInvocationRef) return null;
  return { event, value };
}
function nativeTask(o: Owner, state: GovernanceWorkState, purpose: GovernancePurpose, context: WorksiteContextObservation) {
  const order = state.original.workOrders[purpose]; if (order === undefined || !contextMatches(o, state, context)) return null;
  const instructions = [GOVERNANCE_POLICIES[purpose], ...order.instructions,
    `Conserved original task: ${state.original.task}`, `Unresolved parent outcomes: ${JSON.stringify(state.unresolvedSupportRefs)}`,
    `Actual admitted observations: ${JSON.stringify(state.observations)}`];
  const synthesis = state.synthesis, judgment = synthesis?.judgment;
  const selectedContribution = judgment !== undefined && judgment.nextGraphFunctionRef === ref("graph-function", purpose)
    ? judgment.contributions.find(c => c.graphFunctionRef === judgment.nextGraphFunctionRef) : undefined;
  const outcome = selectedContribution?.contribution ?? order.outcome;
  if (synthesis !== null && judgment !== undefined && judgment.nextGraphFunctionRef === ref("graph-function", purpose)) instructions.push(
    purpose === "uat" ? `Governing full-original assessment outcome: ${order.outcome}` : `Supplied purpose outcome (parent context): ${order.outcome}`,
    `Current admitted selection for this work unit: ${JSON.stringify({ resultRef: synthesis.resultRef, resultDigest: synthesis.resultDigest,
      interpretation: judgment.interpretation, contributions: judgment.contributions.filter(c => c.graphFunctionRef === judgment.nextGraphFunctionRef),
      nextReason: judgment.nextReason, nextEvidenceRefs: judgment.nextEvidenceRefs })}`,
    purpose === "uat"
      ? "The full original outcome, complete original sources, exact consumer rubric and all current criteria govern this independent assessment, including unmet and unresolved outcomes. Assess the exact declared subject against all of them. Return one consumer assessment object matching the exact declared JSON schema, preserving every unmet or indeterminate criterion. A judgment about only the selected contribution cannot establish full-original satisfaction."
      : "This native task's outcome is the selected bounded contribution. The supplied purpose outcome, conserved original task and unresolved outcomes are parent context. Work within the supplied order and write roots; return a truthful partial report with remaining gaps for parent reassessment when this work unit does not complete the parent obligations.");
  if (state.original.fulfillment !== undefined) instructions.push(`Active source-grounded paired obligations: ${JSON.stringify(governanceFulfillmentActive(state.original.fulfillment, state.fulfillment!))}`);
  if (purpose !== "uat") return constructNativeWorkspaceWorkTask({ ...operating(o), context, ...order, outcome, instructions });
  const p = subjectEvidence(o, state, purpose), selection = governanceAssessmentContract(state);
  if (p === null || !record(p.event.payload) || typeof p.event.payload.resultRef !== "string" || typeof p.event.payload.resultDigest !== "string") return null;
  const candidate = context.entries.find(e => e.relativePath === selection.candidatePath);
  if (candidate?.state !== "file") return null;
  if (isNativeWorkspaceWorkObservation(p.value)) {
    const native = projectNativeWorkspaceWorkSourceAtPrefix(o.prefix, p.value);
    if (native === null || native.sourceBasis.invocationAdmissionRef !== o.execution.invocationAdmissionRef && !hasAdmittedGovernanceUse(o, p.event)) return null;
  }
  // Producer support keeps its admitted dependency set. Fresh assessment-only
  // inputs are bound below to the current context, not to the producer's time.
  const dependencies = isNativeWorkspaceWorkObservation(p.value)
    ? p.value.after.entries.flatMap(e => e.state === "file" ? [{ path: e.relativePath, digest: e.digest }] : [])
    : p.value.task.protectedObservations.map(e => ({ path: e.subject.relativePath, digest: e.observation.fileDigest }));
  if (!dependencies.some(e => e.path === candidate.relativePath && e.digest === candidate.digest) ||
    !dependencies.every(e => context.entries.some(c => c.relativePath === e.path && c.state === "file" && c.digest === e.digest)) ||
    worksiteCommandSourcesInvalidatedAfter(o.prefix, p.event.admissionOrdinal,
      o.environment.workspaceAuthorityBasis.canonicalRoot, dependencies.map(e => e.path))) return null;
  const asset = (path: string) => { const e = context.entries.find(e => e.relativePath === path); if (e?.state !== "file") throw new TypeError("assessment file missing"); return { path, digest: e.digest }; };
  if (state.original.fulfillment !== undefined) instructions.push(
    "Return the installed structural fulfillment response. Use exactly one row per current obligation, criterion, depth class and discovery class. Meanings and sufficiency are your independent judgments. Unknown support is indeterminate, never implicit success.",
    "Select only prior Result refs, roles, paths and command ids from the owned domains below. Do not emit digests, CCall/actor identities or your own future Result ref. The owner attaches this assessment after admission. Realization and verifier artifacts are different selected subjects. Current support must match current dependency bytes. AdverseEvidenceRefs are historical C2 counterevidence for the declared adverse-command criterion, not proof of current behavior.",
    `Selected policy and dynamic domains: ${JSON.stringify({ declaration: state.original.fulfillment,
      active: governanceFulfillmentActive(state.original.fulfillment, state.fulfillment!), evidence: state.observations.map(o => o.fulfillmentEvidence).filter(Boolean) })}`);
  const readFirst = [...order.readFirst];
  for (const path of [...selection.sources, selection.candidatePath, selection.rubricPath])
    if (!readFirst.includes(path)) readFirst.push(path);
  return constructNativeWorkspaceWorkTask({ ...operating(o), context, ...order, outcome, instructions, readFirst, writeRoots: [],
    assessment: { resultContract: selection.resultContract, schemaAsset: selection.schemaAsset, sources: selection.sources.map(asset),
      candidate: asset(selection.candidatePath), rubric: asset(selection.rubricPath), producer: { resultRef: p.event.payload.resultRef,
        resultDigest: p.event.payload.resultDigest as `sha256:${string}`, cCallRef: p.event.aggregateId, actorInvocationRef: p.value.provenance.actorInvocationRef } } });
}
export async function projectGovernanceNativeTask(basis: NativeInstructionAssemblyBasis, input: unknown) {
  const o = owner(basis, input), purpose = basis.graphFunction.declarations["abg.default_library_purpose"] as GovernancePurpose;
  if (o === null || !isGovernanceWorkState(input) || !Object.hasOwn(GOVERNANCE_POLICIES, purpose) || purpose === "testing") return null;
  const context = await currentContext(o, input); return context === null ? null : nativeTask(o, input, purpose, context);
}
/** Shared pure task/input relation for preparation admission and observed child provenance. */
export function observedGovernanceTaskMatches(state: unknown, task: unknown): boolean {
  if (!isGovernanceWorkState(state) || (state.synthesis !== null && state.synthesis.judgment.subjectEvidenceRef !== null) || !isObservedWorksiteCommandExecutionTask(task) ||
    !same(state.original.testing.selectedPaths, task.protectedObservations.map(p => p.subject.relativePath))) return false;
  return worksiteCommandConfigurationMatches({ ...governanceTestingConfiguration(state), workspaceAuthorityBasis: task.workspaceAuthorityBasis, workspaceBinding: task.workspaceBinding,
    protectedSubjects: task.protectedObservations.map(row => row.subject) },
  { commands: task.commands, predicates: task.outcomePredicates, allowedWriteTerritories: task.allowedWriteTerritories });
}
export async function projectGovernanceTestingTask(basis: NativeInstructionAssemblyBasis, input: unknown) {
  const o = owner(basis, input); if (o === null || !isGovernanceWorkState(input) || basis.graphFunction.declarations["abg.default_library_purpose"] !== "testing") return null;
  const context = await currentContext(o, input); if (context === null) return null;
  const current = operating(o), selectedSource = input.synthesis?.judgment.subjectEvidenceRef, p = subjectEvidence(o, input, "testing");
  if (selectedSource !== null && selectedSource !== undefined) {
    if (p === null || !isNativeWorkspaceWorkObservation(p.value) || p.value.task.assessment !== undefined || !same(p.value.after, context)) return null;
    return constructNativeWorksiteCommandExecutionTask({ ...current, sourceNativeWork: p.value,
    selectedSources: input.original.testing.selectedPaths.map(relativePath => ({ relativePath, subjectUri: pathToFileURL(resolve(current.workspaceAuthorityBasis.canonicalRoot, relativePath)).href })),
    ...governanceTestingConfiguration(input) });
  }
  const observedFiles: ObservedWorksiteCommandExecutionTaskInput["observedFiles"][number][] = [];
  for (const relativePath of input.original.testing.selectedPaths) {
    const subject = constructWorksiteSubject({ ...current, relativePath, subjectUri: pathToFileURL(resolve(current.workspaceAuthorityBasis.canonicalRoot, relativePath)).href });
    if (subject.kind !== "worksite_subject") return null;
    const observation = await observeWorksiteSubject(current.workspaceAuthorityBasis, current.workspaceBinding, subject);
    if (observation.kind !== "worksite_observation" || observation.state !== "file") return null;
    observedFiles.push({ subject, observation });
  }
  return constructObservedWorksiteCommandExecutionTask({ ...current, observedFiles, ...governanceTestingConfiguration(input) });
}
export function projectGovernanceFold(basis: NativeInstructionAssemblyBasis, input: unknown): GovernanceWorkState | null {
  const o = owner(basis, input), purpose = basis.graphFunction.declarations["abg.default_library_purpose"] as GovernancePurpose;
  if (o === null || !isRetainedGraphInput(input) || !isGovernanceWorkState(input.entry) || !Object.hasOwn(GOVERNANCE_POLICIES, purpose) ||
    input.entry.synthesis === null || input.entry.synthesis.judgment.nextGraphFunctionRef !== basis.graphFunction.name) return null;
  const event = sourceResult(o, input); if (event === null || !record(event.payload) || typeof event.payload.resultRef !== "string" || typeof event.payload.resultDigest !== "string") return null;
  const source = input.source;
  let value: Readonly<Record<string, JsonValue>>, actorInvocationRef: string | null;
  if (purpose === "testing") {
    if (!isObservedWorksiteCommandExecutionObservation(source) && !isNativeWorksiteCommandExecutionObservation(source)) return null;
    const stream = (row: typeof source.commandResults[number]["stdout"]) => {
      const bytes = Buffer.from(row.payload, "base64");
      try { return { digest: row.digest, byteLength: row.byteLength, encoding: "utf8", text: new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes) }; }
      catch { return row; }
    };
    value = asJson({ commandResults: source.commandResults.map(r => ({ ...r, stdout: stream(r.stdout), stderr: stream(r.stderr) })), predicateObservations: source.predicateObservations }); actorInvocationRef = source.provenance.actorInvocationRef;
  } else {
    if (!isNativeWorkspaceWorkObservation(source) || !same(source.task, nativeTask(o, input.entry, purpose, source.before))) return null;
    value = purpose === "uat" ? source.assessment ?? null! : asJson({ report: source.report, changedPaths: source.changedPaths });
    if (!record(value)) return null; actorInvocationRef = source.provenance.actorInvocationRef;
  }
  const observation = { purpose, resultRef: event.payload.resultRef,
    resultDigest: event.payload.resultDigest as `sha256:${string}`, cCallRef: event.aggregateId, actorInvocationRef,
    synthesisResultRef: input.entry.synthesis.resultRef, selectedGraphFunctionRef: basis.graphFunction.name, value };
  if (input.entry.original.fulfillment === undefined) return { ...input.entry, observations: [...input.entry.observations, observation],
    terminal: false, unresolvedSupportRefs: [...input.entry.original.requiredSupportRefs] };
  if (typeof event.payload.contractRef !== "string" || actorInvocationRef === null) return null;
  const native = isNativeWorkspaceWorkObservation(source), execution = !native && (isObservedWorksiteCommandExecutionObservation(source) || isNativeWorksiteCommandExecutionObservation(source));
  if (!native && !execution) return null;
  const files = native ? source.after.entries.flatMap(e => e.state === "file" ? [{ path: e.relativePath, digest: e.digest }] : [])
    : source.snapshotMembers.map(e => ({ path: e.relativePath, digest: e.digest }));
  const producer = native ? source.task.assessment?.producer : undefined;
  const fact: GovernanceFulfillmentEvidence = { resultRef: observation.resultRef, resultDigest: observation.resultDigest,
    contractRef: event.payload.contractRef, cCallRef: event.aggregateId, actorInvocationRef, kind: purpose === "uat" ? "assessment" : native ? "native" : "execution",
    files, dependencies: files, commands: native ? [] : source.commandResults.map(c => ({ commandId: c.commandId, exitStatus: c.exitStatus, timedOut: c.timedOut })),
    assessmentContractRef: native ? source.task.assessment?.resultContract.contractRef ?? null : null,
    producerResultRef: producer?.resultRef ?? null, producerActorRef: producer?.actorInvocationRef ?? null };
  let fulfillment = input.entry.fulfillment!;
  if (purpose === "uat") {
    const facts = input.entry.observations.flatMap(o => o.fulfillmentEvidence === undefined ? [] : [o.fulfillmentEvidence]);
    const assessment = bindGovernanceFulfillmentAssessment(input.entry.original.fulfillment, fulfillment, value.fulfillment, facts);
    if (assessment === null) return null;
    fulfillment = projectGovernanceFulfillment(input.entry.original.fulfillment, fulfillment, assessment, fact, facts);
  } else if (native) fulfillment = invalidateGovernanceFulfillment(fulfillment, files, source.changedPaths);
  return { ...input.entry, observations: [...input.entry.observations, { ...observation, fulfillmentEvidence: fact }], fulfillment,
    terminal: false, unresolvedSupportRefs: fulfillment.coverage.filter(r => r.disposition !== "eligible").map(r => r.obligationRef) };
}
export function projectGovernanceParent(basis: NativeInstructionAssemblyBasis, input: unknown): GovernanceWorkState | null {
  const o = owner(basis, input); if (o === null || !isGovernanceWorkState(input)) return null;
  let terminal = false;
  if (governanceVerdict(input)) {
    const last = input.observations.at(-1)!, event = result(o, last.resultRef, last.resultDigest);
    if (event === null || !record(event.payload) || !isNativeWorkspaceWorkObservation(event.payload.value) || event.payload.value.assessment === undefined ||
      !same(event.payload.value.assessment, last.value) || event.aggregateId !== last.cCallRef || event.payload.value.provenance.actorInvocationRef !== last.actorInvocationRef) return null;
    const source = projectNativeWorkspaceWorkSourceAtPrefix(o.prefix, event.payload.value);
    if (source === null || source.sourceBasis.invocationAdmissionRef !== o.execution.invocationAdmissionRef && !hasAdmittedGovernanceUse(o, event)) return null;
    // Retained assessment/coverage is attributed history. A fresh invocation
    // must acquire its current context and obtain its own parent outcome.
    if (event.runId !== o.call.runId) return { ...input, terminal: false };
    terminal = !worksiteCommandSourcesInvalidatedAfter(o.prefix, event.admissionOrdinal, event.payload.value.task.workspaceAuthorityBasis.canonicalRoot,
      [], event.payload.value.after.readRoots);
  }
  if (input.fulfillment !== undefined) {
    terminal = terminal && input.fulfillment.coverage.length > 0 && input.fulfillment.coverage.every(r => r.disposition === "eligible" && r.assessmentResultRef === input.observations.at(-1)?.resultRef);
    return { ...input, terminal, unresolvedSupportRefs: input.fulfillment.coverage.filter(r => r.disposition !== "eligible").map(r => r.obligationRef) };
  }
  return { ...input, terminal, unresolvedSupportRefs: terminal ? [] : [...input.original.requiredSupportRefs] };
}
/** Reuses the exact constructed occurrence; admission adds no second definition authentication. */
export function governanceResultMatches(basis: NativeInstructionAssemblyBasis, input: unknown, output: unknown): boolean {
  try {
    const o = owner(basis, input); if (o === null) return false;
    const implementation = o.call.implementationRef;
    if (implementation === ref("implementation", "fold")) return same(output, projectGovernanceFold(basis, input));
    if (implementation === ref("implementation", "evaluate-parent")) return same(output, projectGovernanceParent(basis, input));
    if (implementation === ref("implementation", "project-choice")) return same(output, projectGovernanceChoice(basis, input));
    if (!isGovernanceWorkState(input)) return false;
    if (implementation === ref("implementation", "prepare-selection")) return isFramedSynthesisTask(output) &&
      contextMatches(o, input, output.context) && same(output, selectionTask(input, output.context));
    if (implementation === ref("implementation", "prepare-native")) return isNativeWorkspaceWorkTask(output) && same(output,
      nativeTask(o, input, basis.graphFunction.declarations["abg.default_library_purpose"] as GovernancePurpose, output.context));
    if (implementation === ref("implementation", "prepare-testing")) {
      if (!isObservedWorksiteCommandExecutionTask(output) && !isNativeWorksiteCommandExecutionTask(output)) return false;
      if (!same(output.workspaceAuthorityBasis, o.environment.workspaceAuthorityBasis) || !same(output.workspaceBinding, o.environment.workspaceBinding) || !same(output.capabilityGrant, o.grant)) return false;
      if (isObservedWorksiteCommandExecutionTask(output)) return observedGovernanceTaskMatches(input, output);
      const p = subjectEvidence(o, input, "testing");
      return p !== null && isNativeWorkspaceWorkObservation(p.value) && same(output, constructNativeWorksiteCommandExecutionTask({ ...operating(o), sourceNativeWork: p.value,
        selectedSources: input.original.testing.selectedPaths.map(relativePath => ({ relativePath, subjectUri: pathToFileURL(resolve(o.environment.workspaceAuthorityBasis.canonicalRoot, relativePath)).href })),
        ...governanceTestingConfiguration(input) }));
    }
    return false;
  } catch { return false; }
}
