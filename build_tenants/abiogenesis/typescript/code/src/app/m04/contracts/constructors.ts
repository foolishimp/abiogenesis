import type {
  AdvancementTransition,
  ExecutionBasis,
  RuntimeEvent,
  TerminalTransition
} from "../../../abg/m03/contracts/carriers.js";
import type { EngineAssuranceGateResult } from "../../../abg/m03/runner/index.js";
import type {
  ConfiguredRuntimeSelector,
  PublicAssuranceTraceRef,
  PublicControlModes,
  PublicKernelTraceRef,
  PublicRuntimeIdentityProjection,
  PublicStartAdvanced,
  PublicStartBlocked,
  PublicStartConverged,
  PublicStartOutcome,
  PublicStartRequest,
  PublicStartRejected,
  PublicStartYielded,
  PublicStopDetail
} from "./carriers.js";

export function constructPublicControlModes(
  fhMode: PublicControlModes["fhMode"],
  rootMode: PublicControlModes["rootMode"]
): PublicControlModes {
  return Object.freeze({
    fhMode,
    rootMode
  });
}

export function constructConfiguredRuntimeSelector(
  workerRef: string | null,
  runtimeRef: string | null
): ConfiguredRuntimeSelector {
  return Object.freeze({
    workerRef,
    runtimeRef
  });
}

export function constructPublicStartRequest(input: {
  readonly startIntent: PublicStartRequest["startIntent"];
  readonly controlModes: PublicControlModes;
  readonly runtimeSelector: ConfiguredRuntimeSelector | null;
}): PublicStartRequest {
  return Object.freeze({
    startIntent: input.startIntent,
    controlModes: input.controlModes,
    runtimeSelector: input.runtimeSelector
  });
}

function projectRuntimeIdentity(
  basis: ExecutionBasis
): PublicRuntimeIdentityProjection {
  return Object.freeze({
    workerId: basis.runtimeIdentity.workerId,
    backendId: basis.runtimeIdentity.backendId,
    buildId: basis.runtimeIdentity.buildId,
    resolvedRuntimeRef: basis.runtimeIdentity.resolvedRuntimeRef
  });
}

function projectRuntimeIdentityInput(
  runtimeIdentity: ExecutionBasis["runtimeIdentity"]
): PublicRuntimeIdentityProjection {
  return Object.freeze({
    workerId: runtimeIdentity.workerId,
    backendId: runtimeIdentity.backendId,
    buildId: runtimeIdentity.buildId,
    resolvedRuntimeRef: runtimeIdentity.resolvedRuntimeRef
  });
}

function projectAssuranceTrace(
  assuranceGate: EngineAssuranceGateResult
): PublicAssuranceTraceRef {
  return Object.freeze({
    status: assuranceGate.kind,
    reason: assuranceGate.reason,
    projectionRefs: Object.freeze([...assuranceGate.projectionRefs]),
    closureDecisions: Object.freeze([...assuranceGate.closureDecisions]),
    blockingStatuses: Object.freeze([...assuranceGate.blockingStatuses])
  });
}

function projectTrace(
  basis: ExecutionBasis,
  events: readonly RuntimeEvent[],
  assuranceGate?: EngineAssuranceGateResult
): PublicKernelTraceRef {
  return Object.freeze({
    basisId: basis.id,
    runId: basis.runId,
    workKey: basis.workKey,
    frameId: basis.frameId,
    frameLineageId: basis.frameLineageId,
    eventKinds: Object.freeze(events.map((event) => event.kind)),
    ...(assuranceGate === undefined
      ? {}
      : { assurance: projectAssuranceTrace(assuranceGate) })
  });
}

function projectStopDetail(
  transition: AdvancementTransition
): PublicStopDetail {
  switch (transition.kind) {
    case "fd_advance":
      return Object.freeze({
        terminalKind: null,
        gateReason: null,
        dispatchRef: null,
        approvalSubjectRef: null
      });
    case "fp_dispatch":
      return Object.freeze({
        terminalKind: null,
        gateReason: null,
        dispatchRef: transition.dispatchRef,
        approvalSubjectRef: null
      });
    case "fh_escalation":
      return Object.freeze({
        terminalKind: null,
        gateReason: transition.gateReason,
        dispatchRef: null,
        approvalSubjectRef: transition.approvalSubjectRef
      });
    case "terminal":
      return Object.freeze({
        terminalKind: transition.terminalKind,
        gateReason: null,
        dispatchRef: null,
        approvalSubjectRef: null
      });
    default: {
      const exhaustive: never = transition;
      throw new TypeError(`Unsupported transition ${JSON.stringify(exhaustive)}`);
    }
  }
}

export function constructRejectedPublicStartOutcome(
  reason: string,
  runtimeIdentity: ExecutionBasis["runtimeIdentity"] | null = null
): PublicStartRejected {
  return Object.freeze({
    kind: "rejected",
    reason,
    runtimeIdentity:
      runtimeIdentity === null ? null : projectRuntimeIdentityInput(runtimeIdentity)
  });
}

function constructAdvancedOutcome(
  basis: ExecutionBasis,
  events: readonly RuntimeEvent[],
  assuranceGate?: EngineAssuranceGateResult
): PublicStartAdvanced {
  return Object.freeze({
    kind: "advanced",
    runtimeIdentity: projectRuntimeIdentity(basis),
    trace: projectTrace(basis, events, assuranceGate)
  });
}

function constructBlockedOutcome(
  basis: ExecutionBasis,
  events: readonly RuntimeEvent[],
  stopPredicate: PublicStartBlocked["stopPredicate"],
  transition: AdvancementTransition,
  assuranceGate?: EngineAssuranceGateResult
): PublicStartBlocked {
  return Object.freeze({
    kind: "blocked",
    stopPredicate,
    runtimeIdentity: projectRuntimeIdentity(basis),
    trace: projectTrace(basis, events, assuranceGate),
    stopDetail: projectStopDetail(transition)
  });
}

function constructYieldedOutcome(
  basis: ExecutionBasis,
  events: readonly RuntimeEvent[],
  transition: TerminalTransition,
  assuranceGate?: EngineAssuranceGateResult
): PublicStartYielded {
  return Object.freeze({
    kind: "yielded",
    runtimeIdentity: projectRuntimeIdentity(basis),
    trace: projectTrace(basis, events, assuranceGate),
    stopDetail: projectStopDetail(transition)
  });
}

function constructConvergedOutcome(
  basis: ExecutionBasis,
  events: readonly RuntimeEvent[],
  terminalKind: PublicStartConverged["terminalKind"],
  assuranceGate?: EngineAssuranceGateResult
): PublicStartConverged {
  return Object.freeze({
    kind: "converged",
    terminalKind,
    runtimeIdentity: projectRuntimeIdentity(basis),
    trace: projectTrace(basis, events, assuranceGate)
  });
}

export function constructPublicStartOutcome(
  basis: ExecutionBasis,
  transition: AdvancementTransition,
  events: readonly RuntimeEvent[],
  until: ExecutionBasis["startIntent"]["until"],
  assuranceGate?: EngineAssuranceGateResult
): PublicStartOutcome {
  switch (transition.kind) {
    case "fd_advance":
      return constructAdvancedOutcome(basis, events, assuranceGate);
    case "fp_dispatch":
      return constructBlockedOutcome(
        basis,
        events,
        "dispatch_required",
        transition,
        assuranceGate
      );
    case "fh_escalation":
      return constructBlockedOutcome(
        basis,
        events,
        "human_gate_required",
        transition,
        assuranceGate
      );
    case "terminal":
      switch (transition.terminalKind) {
        case "yielded":
          return constructYieldedOutcome(basis, events, transition, assuranceGate);
        case "converged":
        case "nothing_to_do":
          return constructConvergedOutcome(
            basis,
            events,
            transition.terminalKind,
            assuranceGate
          );
        case "gap_stop":
          return constructBlockedOutcome(
            basis,
            events,
            "gap_stop",
            transition,
            assuranceGate
          );
        case "traversal_applied":
          if (until === "first_traversal") {
            return constructAdvancedOutcome(basis, events, assuranceGate);
          }
          return constructBlockedOutcome(
            basis,
            events,
            "gap_stop",
            transition,
            assuranceGate
          );
        case "dispatch_required":
          return constructBlockedOutcome(
            basis,
            events,
            "dispatch_required",
            transition,
            assuranceGate
          );
        case "human_gate_required":
          return constructBlockedOutcome(
            basis,
            events,
            "human_gate_required",
            transition,
            assuranceGate
          );
        default: {
          const exhaustive: never = transition.terminalKind;
          throw new TypeError(
            `Unsupported terminal kind ${JSON.stringify(exhaustive)}`
          );
        }
      }
    default: {
      const exhaustive: never = transition;
      throw new TypeError(`Unsupported transition ${JSON.stringify(exhaustive)}`);
    }
  }
}
