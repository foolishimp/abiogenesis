import type {
  AdvancementTransition,
  ExecutionBasis,
  RuntimeEvent,
  TerminalTransition
} from "../../../abg/m03/contracts/carriers.js";
import type {
  ConfiguredRuntimeSelector,
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

function projectTrace(
  basis: ExecutionBasis,
  events: readonly RuntimeEvent[]
): PublicKernelTraceRef {
  return Object.freeze({
    basisId: basis.id,
    runId: basis.runId,
    workKey: basis.workKey,
    frameId: basis.frameId,
    frameLineageId: basis.frameLineageId,
    eventKinds: Object.freeze(events.map((event) => event.kind))
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
  events: readonly RuntimeEvent[]
): PublicStartAdvanced {
  return Object.freeze({
    kind: "advanced",
    runtimeIdentity: projectRuntimeIdentity(basis),
    trace: projectTrace(basis, events)
  });
}

function constructBlockedOutcome(
  basis: ExecutionBasis,
  events: readonly RuntimeEvent[],
  stopPredicate: PublicStartBlocked["stopPredicate"],
  transition: AdvancementTransition
): PublicStartBlocked {
  return Object.freeze({
    kind: "blocked",
    stopPredicate,
    runtimeIdentity: projectRuntimeIdentity(basis),
    trace: projectTrace(basis, events),
    stopDetail: projectStopDetail(transition)
  });
}

function constructYieldedOutcome(
  basis: ExecutionBasis,
  events: readonly RuntimeEvent[],
  transition: TerminalTransition
): PublicStartYielded {
  return Object.freeze({
    kind: "yielded",
    runtimeIdentity: projectRuntimeIdentity(basis),
    trace: projectTrace(basis, events),
    stopDetail: projectStopDetail(transition)
  });
}

function constructConvergedOutcome(
  basis: ExecutionBasis,
  events: readonly RuntimeEvent[],
  terminalKind: PublicStartConverged["terminalKind"]
): PublicStartConverged {
  return Object.freeze({
    kind: "converged",
    terminalKind,
    runtimeIdentity: projectRuntimeIdentity(basis),
    trace: projectTrace(basis, events)
  });
}

export function constructPublicStartOutcome(
  basis: ExecutionBasis,
  transition: AdvancementTransition,
  events: readonly RuntimeEvent[],
  until: ExecutionBasis["startIntent"]["until"]
): PublicStartOutcome {
  switch (transition.kind) {
    case "fd_advance":
      return constructAdvancedOutcome(basis, events);
    case "fp_dispatch":
      return constructBlockedOutcome(
        basis,
        events,
        "dispatch_required",
        transition
      );
    case "fh_escalation":
      return constructBlockedOutcome(
        basis,
        events,
        "human_gate_required",
        transition
      );
    case "terminal":
      switch (transition.terminalKind) {
        case "yielded":
          return constructYieldedOutcome(basis, events, transition);
        case "converged":
        case "nothing_to_do":
          return constructConvergedOutcome(
            basis,
            events,
            transition.terminalKind
          );
        case "gap_stop":
          return constructBlockedOutcome(basis, events, "gap_stop", transition);
        case "traversal_applied":
          if (until === "first_traversal") {
            return constructAdvancedOutcome(basis, events);
          }
          return constructBlockedOutcome(basis, events, "gap_stop", transition);
        case "dispatch_required":
          return constructBlockedOutcome(
            basis,
            events,
            "dispatch_required",
            transition
          );
        case "human_gate_required":
          return constructBlockedOutcome(
            basis,
            events,
            "human_gate_required",
            transition
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
