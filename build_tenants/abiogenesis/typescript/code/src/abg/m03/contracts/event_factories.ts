import type {
  AdvancementTransition,
  BasisAdmittedEvent,
  ExecutionBasis,
  FdAdvanceReadyEvent,
  FdAdvanceTransition,
  FhEscalatedEvent,
  FhEscalationTransition,
  FpDispatchRequestedEvent,
  FpDispatchTransition,
  FrameOpenedEvent,
  GraphCallOpenedEvent,
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
