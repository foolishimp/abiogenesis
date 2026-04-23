import type {
  PublicControlLoopConverged,
  PublicControlLoopDispatchRequired,
  PublicControlLoopOutcome,
  PublicControlLoopRejected,
  PublicControlLoopRequest,
  PublicControlLoopStopDetail,
  PublicControlLoopTraceRef,
  PublicControlLoopYielded,
  PublicControlLoopHumanGateRequired,
  HumanProxyApprovalHint
} from "./carriers.js";
import type {
  PublicControlModes,
  PublicRuntimeIdentityProjection,
  PublicStartBlocked,
  PublicStartOutcome,
  PublicStartRequest,
  PublicStartYielded
} from "../contracts/carriers.js";

export function constructPublicControlLoopRequest(
  startRequest: PublicStartRequest
): PublicControlLoopRequest {
  return Object.freeze({
    startRequest
  });
}

function collectRuntimeIdentity(
  outcomes: readonly PublicStartOutcome[]
): PublicRuntimeIdentityProjection | null {
  for (let index = outcomes.length - 1; index >= 0; index -= 1) {
    const outcome = outcomes[index];
    if (outcome === undefined) {
      continue;
    }
    if (outcome.kind !== "rejected") {
      return outcome.runtimeIdentity;
    }
    if (outcome.runtimeIdentity !== null) {
      return outcome.runtimeIdentity;
    }
  }
  return null;
}

function flattenEventKinds(
  outcomes: readonly PublicStartOutcome[]
): readonly string[] {
  const eventKinds: string[] = [];
  for (const outcome of outcomes) {
    if (outcome.kind === "rejected") {
      continue;
    }
    for (const eventKind of outcome.trace.eventKinds) {
      eventKinds.push(eventKind);
    }
  }
  return Object.freeze(eventKinds);
}

export function constructPublicControlLoopTraceRef(
  outcomes: readonly PublicStartOutcome[]
): PublicControlLoopTraceRef {
  return Object.freeze({
    stepKinds: Object.freeze(outcomes.map((outcome) => outcome.kind)),
    basisIds: Object.freeze(
      outcomes.flatMap((outcome) =>
        outcome.kind === "rejected" ? [] : [outcome.trace.basisId]
      )
    ),
    eventKinds: flattenEventKinds(outcomes)
  });
}

function constructAdvancedReentryStopDetail(): PublicControlLoopStopDetail {
  return Object.freeze({
    kind: "advanced_reentry_required",
    terminalKind: null,
    gateReason: null,
    dispatchRef: null,
    approvalSubjectRef: null
  });
}

function constructStopDetailFromBlocked(
  kind: PublicControlLoopStopDetail["kind"],
  outcome: PublicStartBlocked
): PublicControlLoopStopDetail {
  return Object.freeze({
    kind,
    terminalKind: outcome.stopDetail.terminalKind,
    gateReason: outcome.stopDetail.gateReason,
    dispatchRef: outcome.stopDetail.dispatchRef,
    approvalSubjectRef: outcome.stopDetail.approvalSubjectRef
  });
}

function constructStopDetailFromYielded(
  outcome: PublicStartYielded
): PublicControlLoopStopDetail {
  return Object.freeze({
    kind: "yielded",
    terminalKind: outcome.stopDetail.terminalKind,
    gateReason: outcome.stopDetail.gateReason,
    dispatchRef: outcome.stopDetail.dispatchRef,
    approvalSubjectRef: outcome.stopDetail.approvalSubjectRef
  });
}

function constructHumanProxyApprovalHint(
  approvalSubjectRef: string
): HumanProxyApprovalHint {
  return Object.freeze({
    actor: "human-proxy",
    approvalSubjectRef
  });
}

function requireLastOutcome(
  outcomes: readonly PublicStartOutcome[]
): PublicStartOutcome {
  const outcome = outcomes.at(-1);
  if (outcome === undefined) {
    throw new TypeError("control loop requires at least one public-start outcome");
  }
  return outcome;
}

function requireRuntimeIdentity(
  outcomes: readonly PublicStartOutcome[]
): PublicRuntimeIdentityProjection {
  const runtimeIdentity = collectRuntimeIdentity(outcomes);
  if (runtimeIdentity === null) {
    throw new TypeError("control loop could not project runtime identity");
  }
  return runtimeIdentity;
}

function constructConvergedOutcome(
  outcomes: readonly PublicStartOutcome[]
): PublicControlLoopConverged {
  const last = requireLastOutcome(outcomes);
  if (last.kind !== "converged") {
    throw new TypeError("constructConvergedOutcome requires a converged public outcome");
  }
  return Object.freeze({
    kind: "converged",
    terminalKind: last.terminalKind,
    runtimeIdentity: requireRuntimeIdentity(outcomes),
    trace: constructPublicControlLoopTraceRef(outcomes)
  });
}

function constructYieldedOutcome(
  outcomes: readonly PublicStartOutcome[],
  stopDetail: PublicControlLoopStopDetail
): PublicControlLoopYielded {
  return Object.freeze({
    kind: "yielded",
    runtimeIdentity: requireRuntimeIdentity(outcomes),
    trace: constructPublicControlLoopTraceRef(outcomes),
    stopDetail
  });
}

function constructDispatchRequiredOutcome(
  outcomes: readonly PublicStartOutcome[],
  stopDetail: PublicControlLoopStopDetail
): PublicControlLoopDispatchRequired {
  return Object.freeze({
    kind: "dispatch_required",
    runtimeIdentity: requireRuntimeIdentity(outcomes),
    trace: constructPublicControlLoopTraceRef(outcomes),
    stopDetail
  });
}

function constructHumanGateRequiredOutcome(
  outcomes: readonly PublicStartOutcome[],
  stopDetail: PublicControlLoopStopDetail,
  approvalHint: HumanProxyApprovalHint | null
): PublicControlLoopHumanGateRequired {
  return Object.freeze({
    kind: "human_gate_required",
    runtimeIdentity: requireRuntimeIdentity(outcomes),
    trace: constructPublicControlLoopTraceRef(outcomes),
    stopDetail,
    approvalHint
  });
}

function constructRejectedOutcome(
  outcomes: readonly PublicStartOutcome[],
  reason: string,
  stopDetail: PublicControlLoopStopDetail | null = null
): PublicControlLoopRejected {
  return Object.freeze({
    kind: "rejected",
    reason,
    runtimeIdentity: collectRuntimeIdentity(outcomes),
    trace: constructPublicControlLoopTraceRef(outcomes),
    stopDetail
  });
}

export function constructPublicControlLoopOutcome(
  outcomes: readonly PublicStartOutcome[],
  controlModes: PublicControlModes
): PublicControlLoopOutcome {
  const last = requireLastOutcome(outcomes);
  switch (last.kind) {
    case "advanced":
      return constructYieldedOutcome(outcomes, constructAdvancedReentryStopDetail());
    case "converged":
      return constructConvergedOutcome(outcomes);
    case "yielded":
      return constructYieldedOutcome(
        outcomes,
        constructStopDetailFromYielded(last)
      );
    case "blocked":
      switch (last.stopPredicate) {
        case "dispatch_required":
          return constructDispatchRequiredOutcome(
            outcomes,
            constructStopDetailFromBlocked("dispatch_required", last)
          );
        case "human_gate_required": {
          const stopDetail = constructStopDetailFromBlocked(
            "human_gate_required",
            last
          );
          const approvalHint =
            controlModes.fhMode === "human-proxy" &&
            stopDetail.approvalSubjectRef !== null
              ? constructHumanProxyApprovalHint(stopDetail.approvalSubjectRef)
              : null;
          return constructHumanGateRequiredOutcome(
            outcomes,
            stopDetail,
            approvalHint
          );
        }
        case "gap_stop":
          return constructRejectedOutcome(
            outcomes,
            "unsupported control-loop stop predicate: gap_stop",
            constructStopDetailFromBlocked("gap_stop", last)
          );
        default: {
          const exhaustive: never = last.stopPredicate;
          throw new TypeError(
            `Unsupported public-start stop predicate ${JSON.stringify(exhaustive)}`
          );
        }
      }
    case "rejected":
      return constructRejectedOutcome(outcomes, last.reason);
    default: {
      const exhaustive: never = last;
      throw new TypeError(
        `Unsupported public-start outcome ${JSON.stringify(exhaustive)}`
      );
    }
  }
}
