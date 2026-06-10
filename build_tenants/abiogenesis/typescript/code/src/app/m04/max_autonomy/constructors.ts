import type {
  PublicCallableStartOutcome,
  PublicCallableStartRejected,
  PublicCallableStartRequest,
  PublicCallableStartResolved,
  PublicCallableStartTraceRef,
  PublicStopClass,
  PublicStopClassKind
} from "./carriers.js";
import type {
  PublicControlLoopOutcome,
  PublicControlLoopRequest
} from "../control/carriers.js";
import type { PublicStartRequest } from "../contracts/carriers.js";
import type { PublicLiveStatusProjection } from "../live_status/carriers.js";
import type { RuntimeFailureClass } from "../../../abg/m03/transport/index.js";
import type { M04RequestDefaultsResolution } from "../../../shared/lever_registry/overrides.js";

function freezeStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

export function constructPublicCallableStartRequest(
  startRequest: PublicStartRequest,
  leverResolution: M04RequestDefaultsResolution
): PublicCallableStartRequest {
  return Object.freeze({
    kind: "callable_start_request",
    startRequest,
    leverResolution
  });
}

export function constructPublicStopClass(input: {
  readonly kind: PublicStopClassKind;
  readonly detail: string;
  readonly source: PublicStopClass["source"];
  readonly runtimeFailureClass?: RuntimeFailureClass | null;
}): PublicStopClass {
  return Object.freeze({
    kind: input.kind,
    detail: input.detail,
    source: input.source,
    runtimeFailureClass: input.runtimeFailureClass ?? null
  });
}

export function projectPublicStopClass(
  liveStatus: PublicLiveStatusProjection
): PublicStopClass {
  switch (liveStatus.kind) {
    case "idle":
      return constructPublicStopClass({
        kind: "not_started",
        detail: liveStatus.runStatus,
        source: "live_status"
      });
    case "ready":
      switch (liveStatus.runStatus) {
        case "active":
          return constructPublicStopClass({
            kind: "advanced",
            detail: liveStatus.runStatus,
            source: "live_status"
          });
        case "assessed":
          return constructPublicStopClass({
            kind: "assessed",
            detail: liveStatus.runStatus,
            source: "live_status"
          });
        case "converged":
          return constructPublicStopClass({
            kind: "converged",
            detail: liveStatus.runStatus,
            source: "live_status"
          });
        default: {
          const exhaustive: never = liveStatus;
          throw new TypeError(
            `Unsupported ready live-status run status ${JSON.stringify(exhaustive)}`
          );
        }
      }
    case "attention":
      switch (liveStatus.runStatus) {
        case "transport_failure":
        case "no_output":
        case "contract_failure":
        case "runtime_unavailable":
        case "capability_missing":
        case "runtime_failure":
        case "payload_contract_failure":
          return constructPublicStopClass({
            kind: liveStatus.runStatus,
            detail: liveStatus.reason,
            source: "live_status",
            runtimeFailureClass: liveStatus.runStatus
          });
        case "blocked":
          if (liveStatus.reason === "human_gate_required") {
            return constructPublicStopClass({
              kind: "human_decision_required",
              detail: liveStatus.reason,
              source: "live_status"
            });
          }
          if (liveStatus.reason === "dispatch_required") {
            return constructPublicStopClass({
              kind: "worker_dispatch_required",
              detail: liveStatus.reason,
              source: "live_status"
            });
          }
          if (liveStatus.reason === "gap_stop") {
            return constructPublicStopClass({
              kind: "blocked",
              detail: liveStatus.reason,
              source: "live_status"
            });
          }
          return constructPublicStopClass({
            kind: "rejected",
            detail: liveStatus.reason,
            source: "live_status"
          });
        case "yielded":
          return constructPublicStopClass({
            kind: "yielded",
            detail: liveStatus.reason,
            source: "live_status"
          });
        case "rejected":
          return constructPublicStopClass({
            kind: "rejected",
            detail: liveStatus.reason,
            source: "live_status"
          });
        default: {
          const exhaustive: never = liveStatus;
          throw new TypeError(
            `Unsupported attention live-status run status ${JSON.stringify(exhaustive)}`
          );
        }
      }
    default: {
      const exhaustive: never = liveStatus;
      throw new TypeError(
        `Unsupported live-status projection ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

export function constructPublicCallableStartTraceRef(input: {
  readonly controlOutcome: PublicControlLoopOutcome;
  readonly liveStatus: PublicLiveStatusProjection;
}): PublicCallableStartTraceRef {
  return Object.freeze({
    controlOutcomeKind: input.controlOutcome.kind,
    liveStatusKind: input.liveStatus.kind,
    liveRunStatus: input.liveStatus.runStatus,
    resultAssessmentStatus:
      input.liveStatus.resultAssessment?.status ?? null,
    eventKinds: freezeStringArray(input.controlOutcome.trace.eventKinds)
  });
}

function constructResolvedPublicCallableStartOutcome(input: {
  readonly request: PublicCallableStartRequest;
  readonly controlRequest: PublicControlLoopRequest;
  readonly controlOutcome: PublicControlLoopOutcome;
  readonly liveStatus: PublicLiveStatusProjection;
  readonly stopClass: PublicStopClass;
  readonly trace: PublicCallableStartTraceRef;
}): PublicCallableStartResolved {
  return Object.freeze({
    kind: "resolved",
    request: input.request,
    controlRequest: input.controlRequest,
    controlOutcome: input.controlOutcome,
    liveStatus: input.liveStatus,
    stopClass: input.stopClass,
    trace: input.trace
  });
}

function constructRejectedPublicCallableStartOutcome(input: {
  readonly request: PublicCallableStartRequest;
  readonly controlRequest: PublicControlLoopRequest;
  readonly controlOutcome: PublicControlLoopOutcome;
  readonly liveStatus: PublicLiveStatusProjection;
  readonly stopClass: PublicStopClass;
  readonly trace: PublicCallableStartTraceRef;
  readonly reason: string;
}): PublicCallableStartRejected {
  return Object.freeze({
    kind: "rejected",
    request: input.request,
    controlRequest: input.controlRequest,
    controlOutcome: input.controlOutcome,
    liveStatus: input.liveStatus,
    stopClass: input.stopClass,
    trace: input.trace,
    reason: input.reason
  });
}

export function constructPublicCallableStartOutcome(input: {
  readonly request: PublicCallableStartRequest;
  readonly controlRequest: PublicControlLoopRequest;
  readonly controlOutcome: PublicControlLoopOutcome;
  readonly liveStatus: PublicLiveStatusProjection;
  readonly stopClass: PublicStopClass;
}): PublicCallableStartOutcome {
  const trace = constructPublicCallableStartTraceRef({
    controlOutcome: input.controlOutcome,
    liveStatus: input.liveStatus
  });

  if (input.controlOutcome.kind === "rejected") {
    return constructRejectedPublicCallableStartOutcome({
      ...input,
      trace,
      reason: input.controlOutcome.reason
    });
  }

  return constructResolvedPublicCallableStartOutcome({
    ...input,
    trace
  });
}
