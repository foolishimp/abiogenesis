import { materializeGraphFunction } from "../../../gtl/m01/contracts/carriers.js";
import type { Module } from "../../../gtl/m02/contracts/carriers.js";
import {
  resolvePublishedGraphFunction,
  resolveSemanticJobForGraphFunction,
  type ModuleLookupAuthority
} from "../../../gtl/m02/contracts/lookup.js";
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
  RuntimeEvent,
  StartIntent,
  TerminalReachedEvent,
  TerminalTransition
} from "./carriers.js";

export interface ExecutionBasisInit {
  readonly basisId: string;
  readonly startIntent: StartIntent;
  readonly module: Module;
  readonly lookupAuthority: ModuleLookupAuthority;
  readonly runtimeIdentity: ExecutionBasis["runtimeIdentity"];
  readonly resolvedPolicy: ExecutionBasis["resolvedPolicy"];
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly frameId: string | null;
  readonly frameLineageId: string | null;
}

export function constructExecutionBasis(input: ExecutionBasisInit): ExecutionBasis {
  const graphFunction = resolvePublishedGraphFunction(
    input.lookupAuthority,
    input.startIntent.target.handle
  );
  const job = resolveSemanticJobForGraphFunction(
    input.lookupAuthority,
    graphFunction.id
  );
  const graph = materializeGraphFunction(graphFunction);

  return Object.freeze({
    id: input.basisId,
    workspaceRoot: input.startIntent.scope.workspaceRoot,
    moduleName: input.module.name,
    graphFunction,
    graph,
    job,
    runtimeIdentity: input.runtimeIdentity,
    resolvedPolicy: input.resolvedPolicy,
    startIntent: input.startIntent,
    runId: input.runId,
    workKey: input.workKey,
    frameId: input.frameId,
    frameLineageId: input.frameLineageId
  });
}

export function deriveAdvancementTransition(
  basis: ExecutionBasis
): AdvancementTransition {
  if (basis.graph.vectors.length === 0) {
    return Object.freeze({
      kind: "terminal",
      basis,
      terminalKind: "nothing_to_do",
      reason: "materialized graph has no vectors"
    } satisfies TerminalTransition);
  }

  switch (basis.resolvedPolicy.defaultRegime) {
    case "F_D":
      return Object.freeze({
        kind: "fd_advance",
        basis,
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
        approvalSubjectRef: basis.resolvedPolicy.approvalSubjectRef,
        gateReason: "fh_gate"
      } satisfies FhEscalationTransition);
    default: {
      const exhaustive: never = basis.resolvedPolicy.defaultRegime;
      throw new TypeError(`Unsupported runtime regime ${JSON.stringify(exhaustive)}`);
    }
  }
}

function constructBasisAdmittedEvent(basis: ExecutionBasis): BasisAdmittedEvent {
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

function constructFdAdvanceReadyEvent(
  transition: FdAdvanceTransition
): FdAdvanceReadyEvent {
  return Object.freeze({
    kind: "fd_advance_ready",
    basisId: transition.basis.id,
    graphFunctionId: transition.basis.graphFunction.id,
    status: transition.status
  });
}

function constructFpDispatchRequestedEvent(
  transition: FpDispatchTransition
): FpDispatchRequestedEvent {
  return Object.freeze({
    kind: "fp_dispatch_requested",
    basisId: transition.basis.id,
    dispatchRef: transition.dispatchRef
  });
}

function constructFhEscalatedEvent(
  transition: FhEscalationTransition
): FhEscalatedEvent {
  return Object.freeze({
    kind: "fh_escalated",
    basisId: transition.basis.id,
    approvalSubjectRef: transition.approvalSubjectRef,
    gateReason: transition.gateReason
  });
}

function constructTerminalReachedEvent(
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
