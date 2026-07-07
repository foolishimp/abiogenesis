import type {
  RequirementProofCarryThroughAdmittedEvent,
  AdvancementTransition,
  ActorInvocation,
  ActorInvocationClosedEvent,
  ActorProcessExitedEvent,
  ActorProcessHeartbeatEvent,
  ActorProcessSignalSentEvent,
  ActorProcessStartFailedEvent,
  ActorProcessStartedEvent,
  ActorProcessStreamObservedEvent,
  ActorProcessTimeoutEvent,
  ActorInvocationStartedEvent,
  ActorResultArtifactObservedEvent,
  AmbiguityObservationAdmittedRuntimeEvent,
  AuthoritySnapshotAdmittedRuntimeEvent,
  BasisAdmittedEvent,
  ClosureInputPublishedRuntimeEvent,
  EvidenceAdmittedRuntimeEvent,
  EffectiveVectorRegime,
  ExecutionBasis,
  FdAuthorityOutcomeAdmittedRuntimeEvent,
  FdAuthoritySeverityClass,
  FdAdvanceReadyEvent,
  FdAdvanceTransition,
  FdPressureRoutingDecision,
  FhEscalatedEvent,
  FhEscalationTransition,
  FpDispatchRequestedEvent,
  FpDispatchTransition,
  FrameOpenedEvent,
  GraphCallOpenedEvent,
  GraphVectorResumeCursorAppliedEvent,
  InstructionCausalContextBoundEvent,
  InstructionPromptManifestProjectedEvent,
  InstructionResponseContractAdmittedEvent,
  ObservedStateAdmittedRuntimeEvent,
  ObservedStateSourceKind,
  PayloadObservedRuntimeEvent,
  PayloadRejectedRuntimeEvent,
  PayloadValidatedRuntimeEvent,
  PluginTraversalPromptMaterializedEvent,
  RuntimeEvent,
  RuntimeActivityProbeObservedEvent,
  RuntimeExternalInterruptionObservedEvent,
  TerminalReachedEvent,
  TerminalTransition,
  VectorClosedEvent,
  VectorEvaluatedEvent,
  VectorTraversalPlannedEvent,
  CCallEvidencedEvent,
  CCallFibreSelectedEvent,
  CCallJudgedEvent,
  CCallOpenedEvent,
  CCallResultAdmittedEvent,
  CCallStageRole,
  RuntimeFailureClass,
  RuntimeFailureObservedEvent,
  TemporalPropertyVerdictProjectedEvent
} from "./carriers.js";
import type {
  InstructionCausalContextProjection
} from "./payload_ledger.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import {
  FD_AUTHORITY_SEVERITY_CLASS_VALUES,
  FD_PRESSURE_ROUTING_DECISION_VALUES,
  OBSERVED_STATE_SOURCE_KIND_VALUES
} from "./carriers.js";
import type { PluginTraversalObserverBindingSelection } from "./plugin_traversal_observer.js";
import type { PromptManifest } from "./instruction_assembly.js";
import { deriveEffectiveVectorRegime } from "./regime_resolution.js";
import {
  assertNonEmptyString,
  assertNonNegativeInteger,
  assertVectorIndexInRange,
  frameIdForBasis,
  freezeStringArray,
  graphCallIdForBasis,
  vectorEdge
} from "./runtime_support.js";
import {
  sha256DigestForText,
  stableJson
} from "../../../shared/runtime_identity.js";
import { parseRequirementProofCoverageTruthRef } from "./requirement_proof_carry_through.js";
import {
  GTL_NODE_TYPE_GRAPH_FUNCTION_TAG
} from "../../../gtl/m01/contracts/carriers.js";

export function constructGraphCallOpenedEvent(
  basis: ExecutionBasis
): GraphCallOpenedEvent {
  if (basis.graphFunction.tags.includes(GTL_NODE_TYPE_GRAPH_FUNCTION_TAG)) {
    throw new TypeError("GraphCall.open rejects non-callable node-type GraphFunction");
  }
  return Object.freeze({
    kind: "graph_call_opened",
    basisId: basis.id,
    graphCallId: graphCallIdForBasis(basis),
    graphFunctionId: basis.graphFunction.id,
    jobId: basis.job.id,
    runId: basis.runId,
    workKey: basis.workKey
  });
}

export function constructFrameOpenedEvent(
  basis: ExecutionBasis
): FrameOpenedEvent {
  return Object.freeze({
    kind: "frame_opened",
    basisId: basis.id,
    graphCallId: graphCallIdForBasis(basis),
    frameId: frameIdForBasis(basis),
    frameLineageId: basis.frameLineageId,
    vectorCount: basis.graph.vectors.length
  });
}

export function constructVectorTraversalPlannedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly effectiveRegime?: EffectiveVectorRegime | undefined;
}): VectorTraversalPlannedEvent {
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  const effectiveRegime =
    input.effectiveRegime ??
    deriveEffectiveVectorRegime({
      basis: input.basis,
      vectorIndex: input.vectorIndex
    });
  if (
    effectiveRegime.basisId !== input.basis.id ||
    effectiveRegime.vectorIndex !== input.vectorIndex
  ) {
    throw new TypeError(
      "VectorTraversalPlannedEvent requires matching effective regime"
    );
  }
  return Object.freeze({
    kind: "vector_traversal_planned",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    vectorIndex: input.vectorIndex,
    edge: vectorEdge(input.basis, input.vectorIndex),
    regime: effectiveRegime.regime,
    regimeSource: effectiveRegime.source,
    regimeSourceRef: effectiveRegime.sourceRef,
    regimeDiagnosticRefs: effectiveRegime.diagnosticRefs
  });
}

export function constructVectorEvaluatedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly status: VectorEvaluatedEvent["status"];
}): VectorEvaluatedEvent {
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  const vector = input.basis.graph.vectors[input.vectorIndex];
  if (vector === undefined) {
    throw new TypeError("VectorEvaluatedEvent requires a graph vector");
  }
  return Object.freeze({
    kind: "vector_evaluated",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    vectorIndex: input.vectorIndex,
    edge: vector.name,
    evaluatorIds: freezeStringArray(vector.evaluators.map((evaluator) => evaluator.name)),
    status: input.status
  });
}

export function constructVectorClosedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly closureKind: VectorClosedEvent["closureKind"];
}): VectorClosedEvent {
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  return Object.freeze({
    kind: "vector_closed",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    vectorIndex: input.vectorIndex,
    edge: vectorEdge(input.basis, input.vectorIndex),
    closureKind: input.closureKind
  });
}

export function constructGraphVectorResumeCursorAppliedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly targetVectorIndex: number;
  readonly reason: string;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}): GraphVectorResumeCursorAppliedEvent {
  assertVectorIndexInRange(input.basis, input.targetVectorIndex);
  assertNonEmptyString(input.reason, "GraphVectorResumeCursorAppliedEvent.reason");
  const targetEdge = vectorEdge(input.basis, input.targetVectorIndex);
  const resumeCursorRef = `graph-vector-resume-cursor:${JSON.stringify({
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    targetVectorIndex: input.targetVectorIndex,
    reason: input.reason
  })}`;
  return Object.freeze({
    kind: "graph_vector_resume_cursor_applied",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    frameLineageId: input.basis.frameLineageId,
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    targetVectorIndex: input.targetVectorIndex,
    targetEdge,
    resumeCursorRef,
    reason: input.reason,
    causationEventRefs: freezeStringArray(
      input.causationEventRefs ?? Object.freeze([])
    ),
    correlationId: input.correlationId ?? resumeCursorRef
  } satisfies GraphVectorResumeCursorAppliedEvent);
}

export function constructBasisAdmittedEvent(basis: ExecutionBasis): BasisAdmittedEvent {
  return Object.freeze({
    kind: "basis_admitted",
    basisId: basis.id,
    graphFunctionId: basis.graphFunction.id,
    jobId: basis.job.id,
    resolvedRuntimeRef: basis.runtimeIdentity.resolvedRuntimeRef,
    resolvedPolicyBundleRef: basis.resolvedPolicy.resolvedPolicyBundleRef,
    runId: basis.runId,
    workKey: basis.workKey
  });
}

export function constructFdAdvanceReadyEvent(
  transition: FdAdvanceTransition
): FdAdvanceReadyEvent {
  return Object.freeze({
    kind: "fd_advance_ready",
    basisId: transition.basis.id,
    graphFunctionId: transition.basis.graphFunction.id,
    status: transition.status
  });
}

export function constructFpDispatchRequestedEvent(
  transition: FpDispatchTransition
): FpDispatchRequestedEvent {
  return Object.freeze({
    kind: "fp_dispatch_requested",
    basisId: transition.basis.id,
    dispatchRef: transition.dispatchRef
  });
}

export function constructActorInvocationStartedEvent(
  invocation: ActorInvocation
): ActorInvocationStartedEvent {
  return Object.freeze({
    kind: "actor_invocation_started",
    ...actorRuntimeScope(invocation),
    attemptIndex: invocation.attemptIndex,
    dispatchRef: invocation.dispatchRef,
    resultRef: invocation.resultRef
  });
}

export function constructActorResultArtifactObservedEvent(input: {
  readonly invocation: ActorInvocation;
  readonly artifactRef: string;
  readonly artifactPayload?: unknown;
}): ActorResultArtifactObservedEvent {
  const artifactContent = input.artifactPayload === undefined
    ? null
    : stableJson(input.artifactPayload);
  const artifactExcerpt = input.artifactPayload === undefined
    ? null
    : artifactContentExcerptFor(input.artifactPayload, artifactContent);
  return Object.freeze({
    kind: "actor_result_artifact_observed",
    ...actorRuntimeScope(input.invocation),
    resultRef: input.invocation.resultRef,
    artifactRef: input.artifactRef,
    artifactContentDigest:
      artifactContent === null ? null : sha256DigestForText(artifactContent),
    artifactContentExcerpt: artifactExcerpt
  });
}

const MAX_ACTOR_ARTIFACT_EXCERPT_CHARS = 60000;

function artifactContentExcerptFor(payload: unknown, stableContent: string | null): string | null {
  const materializedExcerpt = materializedFileSummaryExcerptFor(payload);
  const excerpt = materializedExcerpt ?? stableContent;
  if (excerpt === null) {
    return null;
  }
  return excerpt.length > MAX_ACTOR_ARTIFACT_EXCERPT_CHARS
    ? `${excerpt.slice(0, MAX_ACTOR_ARTIFACT_EXCERPT_CHARS)}...[truncated:${excerpt.length}]`
    : excerpt;
}

function materializedFileSummaryExcerptFor(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return null;
  }
  const summaries = (payload as Readonly<Record<string, unknown>>)["materializedFileSummaries"];
  if (!Array.isArray(summaries) || summaries.length === 0) {
    return null;
  }
  const rendered = summaries.flatMap((summary, index) => {
    if (typeof summary !== "object" || summary === null || Array.isArray(summary)) {
      return [];
    }
    const record = summary as Readonly<Record<string, unknown>>;
    const path = typeof record["path"] === "string" ? record["path"] : `materialized-file-${String(index)}`;
    const sha256 = typeof record["sha256"] === "string" ? record["sha256"] : "sha256:unknown";
    const byteLength = typeof record["byteLength"] === "number" ? String(record["byteLength"]) : "unknown";
    const lineCount = typeof record["lineCount"] === "number" ? String(record["lineCount"]) : "unknown";
    const preview = typeof record["contentPreview"] === "string" ? record["contentPreview"] : "";
    return [
      [
        `### materialized_file ${path}`,
        `sha256: ${sha256}`,
        `byteLength: ${byteLength}`,
        `lineCount: ${lineCount}`,
        "contentPreview:",
        preview
      ].join("\n")
    ];
  });
  return rendered.length === 0 ? null : rendered.join("\n\n");
}

// F6: the ONE construction-boundary parser for the P4 trio markers —
// the typed class rides the event; consumers never parse prose.
function closureFailureClassFromDetail(
  detail: string | null
): ActorInvocationClosedEvent["closureFailureClass"] {
  if (detail === null) return null;
  if (detail.includes("(contract_failure)")) return "contract_failure";
  if (detail.includes("(transport_failure)")) return "transport_failure";
  if (detail.includes("(no_output)")) return "no_output";
  return null;
}

export function constructActorInvocationClosedEvent(input: {
  readonly invocation: ActorInvocation;
  readonly closureStatus: ActorInvocationClosedEvent["closureStatus"];
  readonly resultRef: string | null;
  readonly detail: string | null;
}): ActorInvocationClosedEvent {
  return Object.freeze({
    kind: "actor_invocation_closed",
    closureFailureClass: closureFailureClassFromDetail(input.detail),
    ...actorRuntimeScope(input.invocation),
    closureStatus: input.closureStatus,
    resultRef: input.resultRef,
    detail: input.detail
  });
}

function actorRuntimeScope(invocation: ActorInvocation) {
  return Object.freeze({
    basisId: invocation.basisId,
    graphFunctionId: invocation.graphFunctionId,
    runId: invocation.runId,
    workKey: invocation.workKey,
    graphCallId: invocation.graphCallId,
    frameId: invocation.frameId,
    vectorIndex: invocation.vectorIndex,
    edge: invocation.edge,
    actorInvocationId: invocation.actorInvocationId,
    workerId: invocation.workerId,
    backendId: invocation.backendId,
    causationEventRefs: freezeStringArray(invocation.causationEventRefs),
    correlationId: invocation.correlationId
  });
}

export function constructActorProcessStartedEvent(input: {
  readonly invocation: ActorInvocation;
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly pid: number | null;
  readonly terminalSessionId: string | null;
  readonly timeoutMs: number;
  readonly stdoutRef: string;
  readonly stderrRef: string;
}): ActorProcessStartedEvent {
  return Object.freeze({
    kind: "actor_process_started",
    ...actorRuntimeScope(input.invocation),
    command: input.command,
    args: freezeStringArray(input.args),
    cwd: input.cwd,
    pid: input.pid,
    terminalSessionId: input.terminalSessionId,
    timeoutMs: input.timeoutMs,
    stdoutRef: input.stdoutRef,
    stderrRef: input.stderrRef
  });
}

export function constructActorProcessStartFailedEvent(input: {
  readonly invocation: ActorInvocation;
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly timeoutMs: number;
  readonly stdoutRef: string;
  readonly stderrRef: string;
  readonly terminalSessionId: string | null;
  readonly failureKind: ActorProcessStartFailedEvent["failureKind"];
  readonly detail: string;
}): ActorProcessStartFailedEvent {
  return Object.freeze({
    kind: "actor_process_start_failed",
    ...actorRuntimeScope(input.invocation),
    command: input.command,
    args: freezeStringArray(input.args),
    cwd: input.cwd,
    timeoutMs: input.timeoutMs,
    stdoutRef: input.stdoutRef,
    stderrRef: input.stderrRef,
    terminalSessionId: input.terminalSessionId,
    failureKind: input.failureKind,
    detail: input.detail
  });
}

export function constructActorProcessStreamObservedEvent(input: {
  readonly invocation: ActorInvocation;
  readonly streamName: ActorProcessStreamObservedEvent["streamName"];
  readonly streamRef: string;
  readonly chunkIndex: number;
  readonly byteLength: number;
}): ActorProcessStreamObservedEvent {
  return Object.freeze({
    kind: "actor_process_stream_observed",
    ...actorRuntimeScope(input.invocation),
    streamName: input.streamName,
    streamRef: input.streamRef,
    chunkIndex: input.chunkIndex,
    byteLength: input.byteLength
  });
}

export function constructActorProcessHeartbeatEvent(input: {
  readonly invocation: ActorInvocation;
  readonly heartbeatIndex: number;
  readonly elapsedMs: number;
}): ActorProcessHeartbeatEvent {
  return Object.freeze({
    kind: "actor_process_heartbeat",
    ...actorRuntimeScope(input.invocation),
    heartbeatIndex: input.heartbeatIndex,
    elapsedMs: input.elapsedMs
  });
}

export function constructActorProcessTimeoutEvent(input: {
  readonly invocation: ActorInvocation;
  readonly timeoutMs: number;
  readonly elapsedMs: number;
}): ActorProcessTimeoutEvent {
  return Object.freeze({
    kind: "actor_process_timeout",
    ...actorRuntimeScope(input.invocation),
    timeoutMs: input.timeoutMs,
    elapsedMs: input.elapsedMs
  });
}

export function constructActorProcessSignalSentEvent(input: {
  readonly invocation: ActorInvocation;
  readonly signal: ActorProcessSignalSentEvent["signal"];
  readonly elapsedMs: number;
}): ActorProcessSignalSentEvent {
  return Object.freeze({
    kind: "actor_process_signal_sent",
    ...actorRuntimeScope(input.invocation),
    signal: input.signal,
    elapsedMs: input.elapsedMs
  });
}

export function constructActorProcessExitedEvent(input: {
  readonly invocation: ActorInvocation;
  readonly status: number | null;
  readonly signal: string | null;
  readonly elapsedMs: number;
  readonly timedOut: boolean;
  readonly error: string | null;
}): ActorProcessExitedEvent {
  return Object.freeze({
    kind: "actor_process_exited",
    ...actorRuntimeScope(input.invocation),
    status: input.status,
    signal: input.signal,
    elapsedMs: input.elapsedMs,
    timedOut: input.timedOut,
    error: input.error
  });
}

export function constructRuntimeActivityProbeObservedEvent(input: {
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly graphCallId: string | null;
  readonly frameId: string | null;
  readonly vectorIndex: number | null;
  readonly edge: string | null;
  readonly actorInvocationId: string | null;
  readonly workerId: string | null;
  readonly backendId: string | null;
  readonly systemRef: string;
  readonly probeRef: string;
  readonly probeSource: RuntimeActivityProbeObservedEvent["probeSource"];
  readonly activityRef: string;
  readonly elapsedMs: number;
  readonly observedAtMs: number;
  readonly evidenceRefs?: readonly string[];
  readonly detail?: string | null;
  readonly causationEventRefs?: readonly string[];
  readonly correlationId: string;
}): RuntimeActivityProbeObservedEvent {
  return Object.freeze({
    kind: "runtime_activity_probe_observed",
    basisId: input.basisId,
    graphFunctionId: input.graphFunctionId,
    runId: input.runId,
    workKey: input.workKey,
    graphCallId: input.graphCallId,
    frameId: input.frameId,
    vectorIndex: input.vectorIndex,
    edge: input.edge,
    actorInvocationId: input.actorInvocationId,
    workerId: input.workerId,
    backendId: input.backendId,
    systemRef: input.systemRef,
    probeRef: input.probeRef,
    probeSource: input.probeSource,
    activityRef: input.activityRef,
    elapsedMs: input.elapsedMs,
    observedAtMs: input.observedAtMs,
    evidenceRefs: freezeStringArray(input.evidenceRefs ?? Object.freeze([])),
    detail: input.detail ?? null,
    causationEventRefs: freezeStringArray(
      input.causationEventRefs ?? Object.freeze([])
    ),
    correlationId: input.correlationId
  });
}

export function constructRuntimeExternalInterruptionObservedEvent(input: {
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly graphCallId: string | null;
  readonly frameId: string | null;
  readonly vectorIndex: number | null;
  readonly edge: string | null;
  readonly actorInvocationId: string | null;
  readonly workerId: string | null;
  readonly backendId: string | null;
  readonly systemRef: string;
  readonly interruptionRef: string;
  readonly interruptionSource:
    RuntimeExternalInterruptionObservedEvent["interruptionSource"];
  readonly signal: string | null;
  readonly elapsedMs: number;
  readonly observedAtMs: number;
  readonly evidenceRefs?: readonly string[];
  readonly detail?: string | null;
  readonly causationEventRefs?: readonly string[];
  readonly correlationId: string;
}): RuntimeExternalInterruptionObservedEvent {
  return Object.freeze({
    kind: "runtime_external_interruption_observed",
    basisId: input.basisId,
    graphFunctionId: input.graphFunctionId,
    runId: input.runId,
    workKey: input.workKey,
    graphCallId: input.graphCallId,
    frameId: input.frameId,
    vectorIndex: input.vectorIndex,
    edge: input.edge,
    actorInvocationId: input.actorInvocationId,
    workerId: input.workerId,
    backendId: input.backendId,
    systemRef: input.systemRef,
    interruptionRef: input.interruptionRef,
    interruptionSource: input.interruptionSource,
    signal: input.signal,
    elapsedMs: input.elapsedMs,
    observedAtMs: input.observedAtMs,
    evidenceRefs: freezeStringArray(input.evidenceRefs ?? Object.freeze([])),
    detail: input.detail ?? null,
    causationEventRefs: freezeStringArray(
      input.causationEventRefs ?? Object.freeze([])
    ),
    correlationId: input.correlationId
  });
}

export function constructPluginTraversalPromptMaterializedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly selection: PluginTraversalObserverBindingSelection;
  readonly invocation?: ActorInvocation | null;
  readonly causationEventRefs?: readonly string[];
  readonly correlationId: string;
}): PluginTraversalPromptMaterializedEvent {
  const causationEventRefs = freezeStringArray(input.causationEventRefs ?? []);
  const materializationBasis = {
    basisId: input.basis.id,
    vectorIndex: input.vectorIndex,
    selectionRef: input.selection.selectionRef,
    graphFunctionId: input.basis.graphFunction.id,
    configDigest: input.selection.binding.configDigest,
    actorInvocationId: input.invocation?.actorInvocationId ?? null,
    workerId: input.invocation?.workerId ?? null,
    backendId: input.invocation?.backendId ?? null,
    causationEventRefs,
    correlationId: input.correlationId
  };
  const materializationDigest = sha256DigestForText(stableJson(materializationBasis));
  const materializationRef =
    `plugin-traversal-prompt-materialized:${materializationDigest}`;
  const promptInputDigest = sha256DigestForText(stableJson({
    ...materializationBasis,
    observerPromptRef: input.selection.binding.observerPromptRef,
    promptTemplateRef: input.selection.binding.promptTemplateRef,
    promptInputContractRef: input.selection.binding.promptInputContractRef,
    expectedOutputContractRef:
      input.selection.binding.expectedOutputContractRef
  }));
  return Object.freeze({
    kind: "plugin_traversal_prompt_materialized",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    frameLineageId: input.basis.frameLineageId,
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    vectorIndex: input.vectorIndex,
    edge: vectorEdge(input.basis, input.vectorIndex),
    traversalKind: input.selection.traversalKind,
    materializationRef,
    selectionRef: input.selection.selectionRef,
    selectionSource: input.selection.source,
    sourceRef: input.selection.sourceRef,
    attrKey: input.selection.attrKey,
    hookRef: input.selection.hookRef,
    actorInvocationId: input.invocation?.actorInvocationId ?? null,
    workerId: input.invocation?.workerId ?? null,
    backendId: input.invocation?.backendId ?? null,
    observerPromptRef: input.selection.binding.observerPromptRef,
    renderedPromptRef: `rendered-prompt:${materializationRef}`,
    promptInputDigest,
    promptTemplateRef: input.selection.binding.promptTemplateRef,
    promptInputContractRef: input.selection.binding.promptInputContractRef,
    expectedOutputContractRef:
      input.selection.binding.expectedOutputContractRef,
    progressSignalRefs: freezeStringArray(
      input.selection.binding.progressSignalRefs
    ),
    continuationRequestRefs: freezeStringArray(
      input.selection.binding.continuationRequestRefs
    ),
    policyRefs: freezeStringArray(input.selection.binding.policyRefs),
    configDigest: input.selection.binding.configDigest,
    defaultsBundleRef: input.selection.fallbackBundleRef?.bundleRef ?? null,
    defaultsBundleDigest:
      input.selection.fallbackBundleRef?.bundleDigest ?? null,
    defaultsPath: input.selection.fallbackBundleRef?.bundlePath ?? null,
    defaultKey: input.selection.defaultKey,
    causationEventRefs,
    correlationId: input.correlationId
  });
}

export function constructRequirementProofCarryThroughAdmittedEvent(input: {
  readonly invocation: ActorInvocation;
  readonly frameLineageId?: string | null | undefined;
  readonly causationEventRefs?: readonly string[];
  readonly correlationId: string;
  readonly envelopeRef: string;
  readonly contractRef: string;
  readonly categoryKey: string;
  readonly accepted: boolean;
  readonly sourceRequirementObligationRefs: readonly string[];
  readonly proofObligationRefs: readonly string[];
  readonly evidenceRoleRefs: readonly string[];
  readonly issueKinds: readonly string[];
  readonly coverageRequirementIds: readonly string[];
  readonly coverageStatuses: readonly string[];
  readonly coverageIssueKinds: readonly string[];
  readonly coverageTruthRefs: readonly string[];
  readonly replayIdentity: string;
  readonly replayDigest: string;
}): RequirementProofCarryThroughAdmittedEvent {
  if (
    input.coverageStatuses.length !== input.coverageRequirementIds.length ||
    input.coverageTruthRefs.length !== input.coverageRequirementIds.length
  ) {
    throw new TypeError(
      "carry-through coverage arrays must be parallel per requirementId"
    );
  }
  input.coverageTruthRefs.forEach((truthRef, index) => {
    const parsed = parseRequirementProofCoverageTruthRef(truthRef);
    if (
      parsed.status !== input.coverageStatuses[index] ||
      parsed.requirementId !== input.coverageRequirementIds[index]
    ) {
      throw new TypeError(
        "carry-through coverage fields disagree with the truth ref: " + truthRef
      );
    }
  });
  return Object.freeze({
    ...actorRuntimeScope(input.invocation),
    frameLineageId: input.frameLineageId ?? null,
    causationEventRefs: Object.freeze([...(input.causationEventRefs ?? [])]),
    correlationId: input.correlationId,
    kind: "requirement_proof_carry_through_admitted",
    envelopeRef: input.envelopeRef,
    contractRef: input.contractRef,
    categoryKey: input.categoryKey,
    accepted: input.accepted,
    sourceRequirementObligationRefs: Object.freeze([
      ...input.sourceRequirementObligationRefs
    ]),
    proofObligationRefs: Object.freeze([...input.proofObligationRefs]),
    evidenceRoleRefs: Object.freeze([...input.evidenceRoleRefs]),
    issueKinds: Object.freeze([...input.issueKinds]),
    coverageRequirementIds: Object.freeze([...input.coverageRequirementIds]),
    coverageStatuses: Object.freeze([...input.coverageStatuses]),
    coverageIssueKinds: Object.freeze([...input.coverageIssueKinds]),
    coverageTruthRefs: Object.freeze([...input.coverageTruthRefs]),
    replayIdentity: input.replayIdentity,
    replayDigest: input.replayDigest
  });
}

export function constructInstructionPromptManifestProjectedEvent(input: {
  readonly invocation: ActorInvocation;
  readonly manifest: PromptManifest;
  readonly causationEventRefs?: readonly string[];
  readonly correlationId: string;
}): InstructionPromptManifestProjectedEvent {
  return Object.freeze({
    kind: "instruction_prompt_manifest_projected",
    basisId: input.invocation.basisId,
    graphFunctionId: input.invocation.graphFunctionId,
    runId: input.invocation.runId,
    workKey: input.invocation.workKey,
    graphCallId: input.invocation.graphCallId,
    frameId: input.invocation.frameId,
    frameLineageId: null,
    vectorIndex: input.invocation.vectorIndex,
    edge: input.invocation.edge,
    actorInvocationId: input.invocation.actorInvocationId,
    workerId: input.invocation.workerId,
    backendId: input.invocation.backendId,
    causationEventRefs: freezeStringArray(input.causationEventRefs ?? []),
    correlationId: input.correlationId,
    manifestRef: input.manifest.manifestRef,
    manifestDigest: input.manifest.manifestDigest,
    planRef: input.manifest.planRef,
    planDigest: input.manifest.planDigest,
    envelopeRef: input.manifest.envelopeRef,
    envelopeDigest: input.manifest.envelopeDigest,
    rendererRef: input.manifest.rendererRef,
    promptDigest: input.manifest.promptDigest,
    includedCarrierRefs: freezeStringArray(input.manifest.includedCarrierRefs),
    omittedCarrierRefs: freezeStringArray(input.manifest.omittedCarrierRefs),
    refOnlyCarrierRefs: freezeStringArray(input.manifest.refOnlyCarrierRefs),
    gapRefs: freezeStringArray(input.manifest.gapRefs),
    forbiddenCarrierRefs: freezeStringArray(input.manifest.forbiddenCarrierRefs),
    requirementPressureRefs: freezeStringArray(input.manifest.requirementPressureRefs),
    outputContractRefs: freezeStringArray(input.manifest.outputContractRefs)
  });
}

export function constructInstructionResponseContractAdmittedEvent(input: {
  readonly invocation: ActorInvocation;
  readonly manifest: PromptManifest;
  readonly artifactEvent: ActorResultArtifactObservedEvent;
  readonly causationEventRefs?: readonly string[];
  readonly correlationId: string;
}): InstructionResponseContractAdmittedEvent {
  if (input.artifactEvent.artifactContentDigest === null) {
    throw new TypeError(
      "Instruction response admission requires an observed result artifact digest"
    );
  }
  const responseAdmissionRef = [
    "instruction-response-admission",
    input.invocation.actorInvocationId,
    input.manifest.manifestDigest,
    input.artifactEvent.artifactContentDigest
  ].join(":");
  return Object.freeze({
    kind: "instruction_response_contract_admitted",
    basisId: input.invocation.basisId,
    graphFunctionId: input.invocation.graphFunctionId,
    runId: input.invocation.runId,
    workKey: input.invocation.workKey,
    graphCallId: input.invocation.graphCallId,
    frameId: input.invocation.frameId,
    frameLineageId: null,
    vectorIndex: input.invocation.vectorIndex,
    edge: input.invocation.edge,
    actorInvocationId: input.invocation.actorInvocationId,
    workerId: input.invocation.workerId,
    backendId: input.invocation.backendId,
    causationEventRefs: freezeStringArray(input.causationEventRefs ?? []),
    correlationId: input.correlationId,
    responseAdmissionRef,
    manifestRef: input.manifest.manifestRef,
    manifestDigest: input.manifest.manifestDigest,
    planRef: input.manifest.planRef,
    envelopeRef: input.manifest.envelopeRef,
    resultRef: input.artifactEvent.resultRef,
    artifactRef: input.artifactEvent.artifactRef,
    artifactContentDigest: input.artifactEvent.artifactContentDigest,
    outputContractRefs: freezeStringArray(input.manifest.outputContractRefs),
    promptDigest: input.manifest.promptDigest
  });
}

export function constructInstructionCausalContextBoundEvent(input: {
  readonly basis: ExecutionBasis;
  readonly context: InstructionCausalContextProjection;
  readonly invocation?: ActorInvocation | null;
  readonly causationEventRefs?: readonly string[];
  readonly correlationId: string;
}): InstructionCausalContextBoundEvent {
  if (input.context.basisId !== input.basis.id) {
    throw new TypeError("Instruction causal context basis drift");
  }
  if (input.context.graphFunctionId !== input.basis.graphFunction.id) {
    throw new TypeError("Instruction causal context graph-function drift");
  }
  assertVectorIndexInRange(input.basis, input.context.vectorIndex);
  if (input.context.edge !== vectorEdge(input.basis, input.context.vectorIndex)) {
    throw new TypeError("Instruction causal context edge drift");
  }
  return Object.freeze({
    kind: "instruction_causal_context_bound",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    frameLineageId: input.basis.frameLineageId,
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    vectorIndex: input.context.vectorIndex,
    edge: input.context.edge,
    actorInvocationId: input.invocation?.actorInvocationId ?? null,
    contextRef: input.context.contextRef,
    status: input.context.status,
    bindingRefs: freezeStringArray(input.context.bindingRefs),
    bindingPolicyRefs: freezeStringArray(input.context.bindingPolicyRefs),
    contentModes: freezeStringArray(input.context.contentModes),
    contentRefs: freezeStringArray(input.context.contentRefs),
    contentDigests: freezeStringArray(input.context.contentDigests),
    contentExcerpts: freezeStringArray(input.context.contentExcerpts),
    payloadRefs: freezeStringArray(input.context.payloadRefs),
    payloadDigests: freezeStringArray(input.context.payloadDigests),
    evidenceRefs: freezeStringArray(input.context.evidenceRefs),
    sourceProjectionRefs: freezeStringArray(input.context.sourceProjectionRefs),
    requiredInputRefs: freezeStringArray(input.context.requiredInputRefs),
    missingInputRefs: freezeStringArray(input.context.missingInputRefs),
    causationEventRefs: freezeStringArray(input.causationEventRefs ?? []),
    correlationId: input.correlationId
  });
}

export function constructFhEscalatedEvent(
  transition: FhEscalationTransition
): FhEscalatedEvent {
  return Object.freeze({
    kind: "fh_escalated",
    basisId: transition.basis.id,
    approvalSubjectRef: transition.approvalSubjectRef,
    gateReason: transition.gateReason
  });
}

export function constructTemporalPropertyVerdictProjectedEvent(input: {
  readonly basisId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly propertyRef: string;
  readonly formulaDigest: string;
  readonly consequenceClass: string;
  readonly gatePoint: string;
  readonly evaluationPoint: string;
  readonly status: string;
  readonly vacuous: boolean;
  readonly witnessCount: number | null;
  readonly implicatedEventRefs: readonly string[];
}): TemporalPropertyVerdictProjectedEvent {
  return Object.freeze({
    kind: "temporal_property_verdict_projected",
    basisId: input.basisId,
    runId: input.runId,
    workKey: input.workKey,
    propertyRef: input.propertyRef,
    formulaDigest: input.formulaDigest,
    consequenceClass: input.consequenceClass,
    gatePoint: input.gatePoint,
    evaluationPoint: input.evaluationPoint,
    status: input.status,
    vacuous: input.vacuous,
    witnessCount: input.witnessCount,
    implicatedEventRefs: Object.freeze([...input.implicatedEventRefs])
  });
}

// Implements: REQ-R-ABG3-CCALL-004 — the ONE cCallRef mint (full replay
// identity; recursive frames, repeated calls, composed tasks distinct).
export function mintCCallRef(input: {
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly stageRole: CCallStageRole;
  readonly taskOrdinal: number | null;
  readonly attempt: number;
}): string {
  // INJECTIVE by construction: identity fields may themselves contain
  // ":" so a delimiter join collides across field splits (codex round 4
  // reproduced it). The digest of the typed tuple cannot; the readable
  // locus lives on c_call_opened itself.
  return `c-call:${stableSha256Digest({
    basisId: input.basisId,
    graphCallId: input.graphCallId,
    frameId: input.frameId,
    vectorIndex: input.vectorIndex,
    stageRole: input.stageRole,
    taskOrdinal: input.taskOrdinal,
    attempt: input.attempt
  })}`;
}

export function constructCCallOpenedEvent(input: Omit<CCallOpenedEvent, "kind" | "cCallRef">): CCallOpenedEvent {
  return Object.freeze({
    kind: "c_call_opened",
    cCallRef: mintCCallRef(input),
    basisId: input.basisId,
    graphFunctionId: input.graphFunctionId,
    graphCallId: input.graphCallId,
    frameId: input.frameId,
    edge: input.edge,
    vectorIndex: input.vectorIndex,
    stageRole: input.stageRole,
    taskOrdinal: input.taskOrdinal,
    attempt: input.attempt,
    batchRef: input.batchRef
  });
}

export function constructCCallFibreSelectedEvent(input: Omit<CCallFibreSelectedEvent, "kind">): CCallFibreSelectedEvent {
  return Object.freeze({
    kind: "c_call_fibre_selected",
    cCallRef: input.cCallRef,
    basisId: input.basisId,
    regime: input.regime,
    armId: input.armId,
    programRef: input.programRef,
    compositionRef: input.compositionRef
  });
}

export function constructCCallEvidencedEvent(input: Omit<CCallEvidencedEvent, "kind">): CCallEvidencedEvent {
  return Object.freeze({
    kind: "c_call_evidenced",
    cCallRef: input.cCallRef,
    basisId: input.basisId,
    evidenceClass: input.evidenceClass,
    evidenceRefs: Object.freeze([...input.evidenceRefs])
  });
}

export function constructCCallResultAdmittedEvent(input: Omit<CCallResultAdmittedEvent, "kind">): CCallResultAdmittedEvent {
  return Object.freeze({
    kind: "c_call_result_admitted",
    cCallRef: input.cCallRef,
    basisId: input.basisId,
    outcomeStatus: input.outcomeStatus,
    payloadRef: input.payloadRef,
    responseContractRef: input.responseContractRef
  });
}

export function constructCCallJudgedEvent(input: Omit<CCallJudgedEvent, "kind">): CCallJudgedEvent {
  return Object.freeze({
    kind: "c_call_judged",
    cCallRef: input.cCallRef,
    basisId: input.basisId,
    judgment: input.judgment,
    reasonRef: input.reasonRef
  });
}

export function constructRuntimeFailureObservedEvent(input: {
  readonly basisId: string | null;
  readonly surface: string;
  readonly failureClass: RuntimeFailureClass;
  readonly message: string;
  readonly stackExcerpt: string | null;
}): RuntimeFailureObservedEvent {
  return Object.freeze({
    kind: "runtime_failure_observed",
    basisId: input.basisId,
    surface: input.surface,
    failureClass: input.failureClass,
    message: input.message,
    stackExcerpt: input.stackExcerpt
  });
}

export function constructTerminalReachedEvent(
  transition: TerminalTransition
): TerminalReachedEvent {
  return Object.freeze({
    kind: "terminal_reached",
    basisId: transition.basis.id,
    terminalKind: transition.terminalKind,
    reason: transition.reason
  });
}

function runtimeEventScope(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
}): {
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
} {
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  return Object.freeze({
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    vectorIndex: input.vectorIndex,
    edge: vectorEdge(input.basis, input.vectorIndex)
  });
}

export function constructPayloadObservedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly payloadRef: string;
  readonly payloadClass: string;
  readonly schemaRef?: string | null;
  readonly contractRef?: string | null;
  readonly digest: string;
  readonly producerRef: string;
  readonly sourceEventRef?: string | null;
  readonly actorInvocationId?: string | null;
  readonly authorityRef?: string | null;
  readonly inputDigest?: string | null;
  readonly policyRefs?: readonly string[];
}): PayloadObservedRuntimeEvent {
  return Object.freeze({
    kind: "payload_observed",
    ...runtimeEventScope(input),
    payloadRef: input.payloadRef,
    payloadClass: input.payloadClass,
    schemaRef: input.schemaRef ?? null,
    contractRef: input.contractRef ?? null,
    digest: input.digest,
    producerRef: input.producerRef,
    sourceEventRef: input.sourceEventRef ?? null,
    actorInvocationId: input.actorInvocationId ?? null,
    authorityRef: input.authorityRef ?? null,
    inputDigest: input.inputDigest ?? null,
    policyRefs: freezeStringArray(input.policyRefs ?? Object.freeze([]))
  });
}

export function constructPayloadValidatedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly payloadRef: string;
  readonly schemaRef?: string | null;
  readonly contractRef?: string | null;
  readonly contractDigest?: string | null;
  readonly digest: string;
  readonly validationRef: string;
  readonly evidenceRef?: string | null;
  readonly policyRefs?: readonly string[];
}): PayloadValidatedRuntimeEvent {
  return Object.freeze({
    kind: "payload_validated",
    ...runtimeEventScope(input),
    payloadRef: input.payloadRef,
    schemaRef: input.schemaRef ?? null,
    contractRef: input.contractRef ?? null,
    contractDigest: input.contractDigest ?? null,
    digest: input.digest,
    validationRef: input.validationRef,
    evidenceRef: input.evidenceRef ?? null,
    policyRefs: freezeStringArray(input.policyRefs ?? Object.freeze([]))
  });
}

export function constructPayloadRejectedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly payloadRef: string;
  readonly rejectionClass: PayloadRejectedRuntimeEvent["rejectionClass"];
  readonly schemaRef?: string | null;
  readonly contractRef?: string | null;
  readonly contractDigest?: string | null;
  readonly digest?: string | null;
  readonly reason: string;
  readonly policyRefs?: readonly string[];
}): PayloadRejectedRuntimeEvent {
  return Object.freeze({
    kind: "payload_rejected",
    ...runtimeEventScope(input),
    payloadRef: input.payloadRef,
    rejectionClass: input.rejectionClass,
    schemaRef: input.schemaRef ?? null,
    contractRef: input.contractRef ?? null,
    contractDigest: input.contractDigest ?? null,
    digest: input.digest ?? null,
    reason: input.reason,
    policyRefs: freezeStringArray(input.policyRefs ?? Object.freeze([]))
  });
}

export function constructAuthoritySnapshotAdmittedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly authoritySnapshotRef: string;
  readonly authorityRefs: readonly string[];
  readonly inputRefs: readonly string[];
  readonly authorityDigest: string;
  readonly inputDigest: string;
  readonly closureCapable?: boolean;
  readonly contradictoryAuthority?: boolean;
  readonly deferredAuthorityRefs?: readonly string[];
  readonly providerRefs?: readonly string[];
  readonly policyRefs?: readonly string[];
}): AuthoritySnapshotAdmittedRuntimeEvent {
  return Object.freeze({
    kind: "authority_snapshot_admitted",
    ...runtimeEventScope(input),
    authoritySnapshotRef: input.authoritySnapshotRef,
    authorityRefs: freezeStringArray(input.authorityRefs),
    inputRefs: freezeStringArray(input.inputRefs),
    authorityDigest: input.authorityDigest,
    inputDigest: input.inputDigest,
    closureCapable: input.closureCapable ?? true,
    contradictoryAuthority: input.contradictoryAuthority ?? false,
    deferredAuthorityRefs: freezeStringArray(
      input.deferredAuthorityRefs ?? Object.freeze([])
    ),
    providerRefs: freezeStringArray(input.providerRefs ?? Object.freeze([])),
    policyRefs: freezeStringArray(input.policyRefs ?? Object.freeze([]))
  });
}

export function constructEvidenceAdmittedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly evidenceRef: string;
  readonly payloadRef: string;
  readonly authorityRef?: string | null;
  readonly authorityDigest?: string | null;
  readonly inputDigest?: string | null;
  readonly providerRefs?: readonly string[];
  readonly policyRefs?: readonly string[];
  readonly complete?: boolean;
  readonly shallow?: boolean;
  readonly contradictsAuthority?: boolean;
  readonly deferred?: boolean;
}): EvidenceAdmittedRuntimeEvent {
  return Object.freeze({
    kind: "evidence_admitted",
    ...runtimeEventScope(input),
    evidenceRef: input.evidenceRef,
    payloadRef: input.payloadRef,
    authorityRef: input.authorityRef ?? null,
    authorityDigest: input.authorityDigest ?? null,
    inputDigest: input.inputDigest ?? null,
    providerRefs: freezeStringArray(input.providerRefs ?? Object.freeze([])),
    policyRefs: freezeStringArray(input.policyRefs ?? Object.freeze([])),
    complete: input.complete ?? true,
    shallow: input.shallow ?? false,
    contradictsAuthority: input.contradictsAuthority ?? false,
    deferred: input.deferred ?? false
  });
}

export function constructAmbiguityObservationAdmittedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly ambiguityRef: string;
  readonly ambiguityStatus: AmbiguityObservationAdmittedRuntimeEvent["ambiguityStatus"];
  readonly authorityRef?: string | null;
  readonly evidenceRef?: string | null;
  readonly payloadRef?: string | null;
  readonly reason: string;
  readonly providerRefs?: readonly string[];
  readonly policyRefs?: readonly string[];
}): AmbiguityObservationAdmittedRuntimeEvent {
  return Object.freeze({
    kind: "ambiguity_observation_admitted",
    ...runtimeEventScope(input),
    ambiguityRef: input.ambiguityRef,
    ambiguityStatus: input.ambiguityStatus,
    authorityRef: input.authorityRef ?? null,
    evidenceRef: input.evidenceRef ?? null,
    payloadRef: input.payloadRef ?? null,
    reason: input.reason,
    providerRefs: freezeStringArray(input.providerRefs ?? Object.freeze([])),
    policyRefs: freezeStringArray(input.policyRefs ?? Object.freeze([]))
  });
}

export function constructClosureInputPublishedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly closureInputRef: string;
  readonly projectionRef: string;
  readonly closureDecision: ClosureInputPublishedRuntimeEvent["closureDecision"];
  readonly rowRefs?: readonly string[];
  readonly sourceProjectionRefs?: readonly string[];
  readonly policyRefs?: readonly string[];
}): ClosureInputPublishedRuntimeEvent {
  return Object.freeze({
    kind: "closure_input_published",
    ...runtimeEventScope(input),
    closureInputRef: input.closureInputRef,
    projectionRef: input.projectionRef,
    closureDecision: input.closureDecision,
    rowRefs: freezeStringArray(input.rowRefs ?? Object.freeze([])),
    sourceProjectionRefs: freezeStringArray(
      input.sourceProjectionRefs ?? Object.freeze([])
    ),
    policyRefs: freezeStringArray(input.policyRefs ?? Object.freeze([]))
  });
}

function assertObservedStateSourceKind(
  value: ObservedStateSourceKind,
  label: string
): void {
  for (const allowed of OBSERVED_STATE_SOURCE_KIND_VALUES) {
    if (value === allowed) {
      return;
    }
  }
  throw new TypeError(`${label}: unsupported observed state source kind ${value}`);
}

function assertFdAuthoritySeverityClass(
  value: FdAuthoritySeverityClass | null,
  label: string
): void {
  if (value === null) {
    return;
  }
  for (const allowed of FD_AUTHORITY_SEVERITY_CLASS_VALUES) {
    if (value === allowed) {
      return;
    }
  }
  throw new TypeError(`${label}: unsupported F_D authority severity class ${value}`);
}

function assertFdPressureRoutingDecision(
  value: FdPressureRoutingDecision,
  label: string
): void {
  for (const allowed of FD_PRESSURE_ROUTING_DECISION_VALUES) {
    if (value === allowed) {
      return;
    }
  }
  throw new TypeError(`${label}: unsupported F_D pressure routing decision ${value}`);
}

export function constructObservedStateAdmittedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly observedStateRef: string;
  readonly sourceKind: ObservedStateSourceKind;
  readonly scopeRef: string;
  readonly sourceRef: string;
  readonly digest: string;
  readonly version?: string | null | undefined;
  readonly eventWatermark: number;
  readonly freshnessPolicyRef: string;
  readonly derivationBasisRef: string;
  readonly basisProjectionRef: string;
  readonly derivedFromRefs: readonly string[];
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}): ObservedStateAdmittedRuntimeEvent {
  assertNonEmptyString(input.observedStateRef, "ObservedState.observedStateRef");
  assertObservedStateSourceKind(input.sourceKind, "ObservedState.sourceKind");
  assertNonEmptyString(input.scopeRef, "ObservedState.scopeRef");
  assertNonEmptyString(input.sourceRef, "ObservedState.sourceRef");
  assertNonEmptyString(input.digest, "ObservedState.digest");
  if (input.version !== undefined && input.version !== null) {
    assertNonEmptyString(input.version, "ObservedState.version");
  }
  assertNonNegativeInteger(input.eventWatermark, "ObservedState.eventWatermark");
  assertNonEmptyString(input.freshnessPolicyRef, "ObservedState.freshnessPolicyRef");
  assertNonEmptyString(input.derivationBasisRef, "ObservedState.derivationBasisRef");
  assertNonEmptyString(input.basisProjectionRef, "ObservedState.basisProjectionRef");
  const derivedFromRefs = freezeStringArray(input.derivedFromRefs);
  if (derivedFromRefs.length === 0) {
    throw new TypeError("ObservedState requires derivedFromRefs");
  }
  return Object.freeze({
    kind: "observed_state_admitted",
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    observedStateRef: input.observedStateRef,
    sourceKind: input.sourceKind,
    scopeRef: input.scopeRef,
    sourceRef: input.sourceRef,
    digest: input.digest,
    version: input.version ?? null,
    eventWatermark: input.eventWatermark,
    freshnessPolicyRef: input.freshnessPolicyRef,
    derivationBasisRef: input.derivationBasisRef,
    basisProjectionRef: input.basisProjectionRef,
    derivedFromRefs,
    causationEventRefs: freezeStringArray(
      input.causationEventRefs ?? Object.freeze([])
    ),
    correlationId:
      input.correlationId ??
      [
        "observed-state",
        input.basis.id,
        input.observedStateRef,
        String(input.eventWatermark)
      ].join(":")
  } satisfies ObservedStateAdmittedRuntimeEvent);
}

export function constructFdAuthorityOutcomeAdmittedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly status: FdAuthorityOutcomeAdmittedRuntimeEvent["status"];
  readonly severityClass: FdAuthoritySeverityClass | null;
  readonly routingDecision: FdPressureRoutingDecision;
  readonly affectedFieldRefs?: readonly string[] | undefined;
  readonly consumedFieldRefs?: readonly string[] | undefined;
  readonly pressureRefs?: readonly string[] | undefined;
  readonly diagnosticRefs?: readonly string[] | undefined;
  readonly evidenceRefs?: readonly string[] | undefined;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}): FdAuthorityOutcomeAdmittedRuntimeEvent {
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  assertFdAuthoritySeverityClass(input.severityClass, "FdAuthority.severityClass");
  assertFdPressureRoutingDecision(
    input.routingDecision,
    "FdAuthority.routingDecision"
  );
  const edge = vectorEdge(input.basis, input.vectorIndex);
  const affectedFieldRefs = freezeStringArray(
    input.affectedFieldRefs ?? Object.freeze([])
  );
  const consumedFieldRefs = freezeStringArray(
    input.consumedFieldRefs ?? Object.freeze([])
  );
  const pressureRefs = freezeStringArray(
    input.pressureRefs ?? Object.freeze([])
  );
  const diagnosticRefs = freezeStringArray(
    input.diagnosticRefs ?? Object.freeze([])
  );
  const evidenceRefs = freezeStringArray(
    input.evidenceRefs ?? Object.freeze([])
  );
  return Object.freeze({
    kind: "fd_authority_outcome_admitted",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    vectorIndex: input.vectorIndex,
    edge,
    outcomeRef: [
      "fd-authority-outcome",
      input.basis.id,
      String(input.vectorIndex),
      input.routingDecision,
      input.severityClass ?? "accepted"
    ].join(":"),
    status: input.status,
    severityClass: input.severityClass,
    routingDecision: input.routingDecision,
    affectedFieldRefs,
    consumedFieldRefs,
    pressureRefs,
    diagnosticRefs,
    evidenceRefs,
    causationEventRefs: freezeStringArray(
      input.causationEventRefs ?? Object.freeze([])
    ),
    correlationId:
      input.correlationId ??
      [
        "fd-authority",
        input.basis.id,
        String(input.vectorIndex),
        input.routingDecision
      ].join(":")
  } satisfies FdAuthorityOutcomeAdmittedRuntimeEvent);
}

export function runtimeEventsForTransition(
  basis: ExecutionBasis,
  transition: AdvancementTransition
): readonly RuntimeEvent[] {
  const events: RuntimeEvent[] = [constructBasisAdmittedEvent(basis)];
  switch (transition.kind) {
    case "fd_advance":
      events.push(constructFdAdvanceReadyEvent(transition));
      break;
    case "fp_dispatch":
      events.push(constructFpDispatchRequestedEvent(transition));
      break;
    case "fh_escalation":
      events.push(constructFhEscalatedEvent(transition));
      break;
    case "terminal":
      events.push(constructTerminalReachedEvent(transition));
      break;
    default: {
      const exhaustive: never = transition;
      throw new TypeError(
        `Unsupported advancement transition ${JSON.stringify(exhaustive)}`
      );
    }
  }
  return Object.freeze(events);
}
