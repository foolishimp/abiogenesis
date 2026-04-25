import type {
  AdvancementTransition,
  ExecutionBasis,
  FdAdvanceTransition,
  FhEscalationTransition,
  FpDispatchTransition,
  IterationAdvanceDecision,
  RuntimeAggregateProjection,
  RuntimeEvent,
  TerminalTransition
} from "./carriers.js";
import {
  constructGraphCallOpenedEvent,
  constructFrameOpenedEvent,
  constructTerminalReachedEvent,
  constructVectorTraversalPlannedEvent
} from "./event_factories.js";
import { deriveRuntimeAggregateProjection } from "./projection.js";
import { vectorEdge } from "./runtime_support.js";

export function deriveIterationAdvanceDecision(
  basis: ExecutionBasis,
  projection: RuntimeAggregateProjection
): IterationAdvanceDecision {
  if (projection.basisId !== basis.id) {
    throw new TypeError("IterationAdvanceDecision requires matching basis projection");
  }
  if (basis.graph.vectors.length === 0) {
    return Object.freeze({
      kind: "converged",
      basis,
      terminalKind: "nothing_to_do",
      reason: "materialized graph has no vectors"
    });
  }
  if (projection.nextVectorIndex === null) {
    return Object.freeze({
      kind: "converged",
      basis,
      terminalKind: "converged",
      reason: "all graph-function vectors are closed by replay"
    });
  }
  return Object.freeze({
    kind: "advance_vector",
    basis,
    vectorIndex: projection.nextVectorIndex,
    edge: vectorEdge(basis, projection.nextVectorIndex),
    regime: basis.resolvedPolicy.defaultRegime
  });
}

export function deriveAdvancementTransition(
  basis: ExecutionBasis,
  events: readonly RuntimeEvent[] = Object.freeze([])
): AdvancementTransition {
  const projection = deriveRuntimeAggregateProjection(basis, events);
  const decision = deriveIterationAdvanceDecision(basis, projection);

  if (decision.kind === "converged") {
    return Object.freeze({
      kind: "terminal",
      basis,
      terminalKind: decision.terminalKind,
      reason: decision.reason
    } satisfies TerminalTransition);
  }

  switch (basis.resolvedPolicy.defaultRegime) {
    case "F_D":
      return Object.freeze({
        kind: "fd_advance",
        basis,
        vectorIndex: decision.vectorIndex,
        edge: decision.edge,
        status: "ready"
      } satisfies FdAdvanceTransition);
    case "F_P": {
      const dispatchRef = basis.resolvedPolicy.dispatchRef;
      if (dispatchRef === null) {
        throw new TypeError(
          `ExecutionBasis(${JSON.stringify(basis.id)}) requires dispatchRef for F_P`
        );
      }
      return Object.freeze({
        kind: "fp_dispatch",
        basis,
        vectorIndex: decision.vectorIndex,
        edge: decision.edge,
        dispatchRef
      } satisfies FpDispatchTransition);
    }
    case "F_H":
      if (basis.resolvedPolicy.approvalSubjectRef === null) {
        throw new TypeError(
          `ExecutionBasis(${JSON.stringify(basis.id)}) requires approvalSubjectRef for F_H`
        );
      }
      return Object.freeze({
        kind: "fh_escalation",
        basis,
        vectorIndex: decision.vectorIndex,
        edge: decision.edge,
        approvalSubjectRef: basis.resolvedPolicy.approvalSubjectRef,
        gateReason: "fh_gate"
      } satisfies FhEscalationTransition);
    default: {
      const exhaustive: never = basis.resolvedPolicy.defaultRegime;
      throw new TypeError(`Unsupported runtime regime ${JSON.stringify(exhaustive)}`);
    }
  }
}

export function runtimeEventsForIterationDecision(
  decision: IterationAdvanceDecision
): readonly RuntimeEvent[] {
  if (decision.kind === "converged") {
    return Object.freeze([
      constructTerminalReachedEvent({
        kind: "terminal",
        basis: decision.basis,
        terminalKind: decision.terminalKind,
        reason: decision.reason
      })
    ]);
  }
  return Object.freeze([
    constructGraphCallOpenedEvent(decision.basis),
    constructFrameOpenedEvent(decision.basis),
    constructVectorTraversalPlannedEvent({
      basis: decision.basis,
      vectorIndex: decision.vectorIndex
    })
  ]);
}
