import type {
  AdvancementTransition,
  ActorInvocation,
  ActorInvocationClosedEvent,
  ActorProcessExitedEvent,
  ActorProcessHeartbeatEvent,
  ActorProcessSignalSentEvent,
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
  RuntimeEvent,
  TerminalReachedEvent,
  TerminalTransition,
  VectorClosedEvent,
  VectorEvaluatedEvent,
  VectorTraversalPlannedEvent
} from "./carriers.js";
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
    basisId: invocation.basisId,
    graphCallId: invocation.graphCallId,
    frameId: invocation.frameId,
    vectorIndex: invocation.vectorIndex,
    edge: invocation.edge,
    actorInvocationId: invocation.actorInvocationId,
    attemptIndex: invocation.attemptIndex,
    dispatchRef: invocation.dispatchRef,
    workerId: invocation.workerId,
    backendId: invocation.backendId,
    resultRef: invocation.resultRef
  });
}

export function constructActorResultArtifactObservedEvent(input: {
  readonly invocation: ActorInvocation;
  readonly artifactRef: string;
}): ActorResultArtifactObservedEvent {
  return Object.freeze({
    kind: "actor_result_artifact_observed",
    basisId: input.invocation.basisId,
    graphCallId: input.invocation.graphCallId,
    frameId: input.invocation.frameId,
    vectorIndex: input.invocation.vectorIndex,
    edge: input.invocation.edge,
    actorInvocationId: input.invocation.actorInvocationId,
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
    basisId: input.invocation.basisId,
    graphCallId: input.invocation.graphCallId,
    frameId: input.invocation.frameId,
    vectorIndex: input.invocation.vectorIndex,
    edge: input.invocation.edge,
    actorInvocationId: input.invocation.actorInvocationId,
    closureStatus: input.closureStatus,
    resultRef: input.resultRef,
    detail: input.detail
  });
}

export function constructActorProcessStartedEvent(input: {
  readonly invocation: ActorInvocation;
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly pid: number | null;
  readonly timeoutMs: number;
  readonly stdoutRef: string;
  readonly stderrRef: string;
}): ActorProcessStartedEvent {
  return Object.freeze({
    kind: "actor_process_started",
    basisId: input.invocation.basisId,
    graphCallId: input.invocation.graphCallId,
    frameId: input.invocation.frameId,
    vectorIndex: input.invocation.vectorIndex,
    edge: input.invocation.edge,
    actorInvocationId: input.invocation.actorInvocationId,
    command: input.command,
    args: freezeStringArray(input.args),
    cwd: input.cwd,
    pid: input.pid,
    timeoutMs: input.timeoutMs,
    stdoutRef: input.stdoutRef,
    stderrRef: input.stderrRef
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
    basisId: input.invocation.basisId,
    graphCallId: input.invocation.graphCallId,
    frameId: input.invocation.frameId,
    vectorIndex: input.invocation.vectorIndex,
    edge: input.invocation.edge,
    actorInvocationId: input.invocation.actorInvocationId,
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
    basisId: input.invocation.basisId,
    graphCallId: input.invocation.graphCallId,
    frameId: input.invocation.frameId,
    vectorIndex: input.invocation.vectorIndex,
    edge: input.invocation.edge,
    actorInvocationId: input.invocation.actorInvocationId,
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
    basisId: input.invocation.basisId,
    graphCallId: input.invocation.graphCallId,
    frameId: input.invocation.frameId,
    vectorIndex: input.invocation.vectorIndex,
    edge: input.invocation.edge,
    actorInvocationId: input.invocation.actorInvocationId,
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
    basisId: input.invocation.basisId,
    graphCallId: input.invocation.graphCallId,
    frameId: input.invocation.frameId,
    vectorIndex: input.invocation.vectorIndex,
    edge: input.invocation.edge,
    actorInvocationId: input.invocation.actorInvocationId,
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
    basisId: input.invocation.basisId,
    graphCallId: input.invocation.graphCallId,
    frameId: input.invocation.frameId,
    vectorIndex: input.invocation.vectorIndex,
    edge: input.invocation.edge,
    actorInvocationId: input.invocation.actorInvocationId,
    status: input.status,
    signal: input.signal,
    elapsedMs: input.elapsedMs,
    timedOut: input.timedOut,
    error: input.error
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
