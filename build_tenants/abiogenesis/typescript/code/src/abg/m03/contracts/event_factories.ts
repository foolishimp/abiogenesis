import { createHash } from "node:crypto";
import type {
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
  ExecutionBasis,
  FdAdvanceReadyEvent,
  FdAdvanceTransition,
  FhEscalatedEvent,
  FhEscalationTransition,
  FpDispatchRequestedEvent,
  FpDispatchTransition,
  FrameOpenedEvent,
  GraphCallOpenedEvent,
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
  VectorTraversalPlannedEvent
} from "./carriers.js";
import type { PluginTraversalObserverBindingSelection } from "./plugin_traversal_observer.js";
import {
  assertVectorIndexInRange,
  frameIdForBasis,
  freezeStringArray,
  graphCallIdForBasis,
  vectorEdge
} from "./runtime_support.js";

export function constructGraphCallOpenedEvent(
  basis: ExecutionBasis
): GraphCallOpenedEvent {
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
}): VectorTraversalPlannedEvent {
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  return Object.freeze({
    kind: "vector_traversal_planned",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    vectorIndex: input.vectorIndex,
    edge: vectorEdge(input.basis, input.vectorIndex)
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
}): ActorResultArtifactObservedEvent {
  return Object.freeze({
    kind: "actor_result_artifact_observed",
    ...actorRuntimeScope(input.invocation),
    resultRef: input.invocation.resultRef,
    artifactRef: input.artifactRef
  });
}

export function constructActorInvocationClosedEvent(input: {
  readonly invocation: ActorInvocation;
  readonly closureStatus: ActorInvocationClosedEvent["closureStatus"];
  readonly resultRef: string | null;
  readonly detail: string | null;
}): ActorInvocationClosedEvent {
  return Object.freeze({
    kind: "actor_invocation_closed",
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

function sha256Text(input: string): string {
  return `sha256:${createHash("sha256").update(input).digest("hex")}`;
}

function stableJson(input: unknown): string {
  if (input === null || typeof input !== "object") {
    return JSON.stringify(input);
  }
  if (Array.isArray(input)) {
    return `[${input.map((entry) => stableJson(entry)).join(",")}]`;
  }
  const entries = Object.entries(input).sort(([left], [right]) =>
    left.localeCompare(right)
  );
  return `{${entries
    .map(([key, value]) => `${JSON.stringify(key)}:${stableJson(value)}`)
    .join(",")}}`;
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
  const materializationDigest = sha256Text(stableJson(materializationBasis));
  const materializationRef =
    `plugin-traversal-prompt-materialized:${materializationDigest}`;
  const promptInputDigest = sha256Text(stableJson({
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
