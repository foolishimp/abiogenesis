import type { PersistedEventLog, ReplayState } from "../abg/index.js";
import {
  sha256Canonical,
  type JsonValue,
} from "../product/index.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  PublicOutcome,
  RootPublicInvocation,
} from "./contracts.js";

function hasClosedRetryChain(
  replay: ReplayState,
  callIndex: number,
): boolean {
  const cCall = replay.cCalls[callIndex];
  const successor = replay.cCalls[callIndex + 1];
  if (
    cCall === undefined ||
    cCall.judgment !== "retry" ||
    cCall.judgmentRef === null ||
    successor === undefined
  ) {
    return false;
  }
  const retryRoute = replay.routes.find((route) =>
    route.routeKind === "retry" &&
    route.cCallRef === cCall.cCallRef &&
    route.judgmentRef === cCall.judgmentRef
  );
  return retryRoute !== undefined &&
    successor.programLocusRef === cCall.programLocusRef &&
    successor.attempt === cCall.attempt + 1 &&
    successor.retryPath.length === cCall.retryPath.length &&
    successor.retryPath.slice(0, -1).join("\0") ===
      cCall.retryPath.slice(0, -1).join("\0") &&
    successor.retryPath.at(-1) === (cCall.retryPath.at(-1) ?? 0) + 1;
}

function diagnosticFromValue(value: JsonValue | null): string | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const diagnosticRef = (value as Readonly<Record<string, JsonValue>>).diagnosticRef;
  return typeof diagnosticRef === "string" ? diagnosticRef : null;
}

function diagnosticFromEvent(
  eventLog: PersistedEventLog,
  eventRef: string | null,
): string | null {
  const event = eventLog.events.find((row) => row.eventId === eventRef);
  if (event === undefined || typeof event.payload !== "object" || event.payload === null || Array.isArray(event.payload)) {
    return null;
  }
  const payload = event.payload as Readonly<Record<string, JsonValue>>;
  if (typeof payload.diagnosticRef === "string") return payload.diagnosticRef;
  const refs = payload.contractOrDiagnosticRefs;
  return Array.isArray(refs) && typeof refs[0] === "string" ? refs[0] : null;
}

const TRANSIENT_LIFECYCLE_FLUENT_PREFIXES = Object.freeze([
  "run_active(",
  "graph_call_active(",
  "frame_active(",
  "frame_blocked(",
  "frame_failed(",
  "locus_active(",
  "c_call_active(",
  "c_call_judgment_available(",
  "construction_intent_available(",
  "parent_waiting_on_child(",
  "child_foldback_available(",
  "fan_out_vector_available(",
  "fan_out_partial_stop_available(",
  "terminal_route_available(",
]);

function hasOpenLifecycleTruth(replay: ReplayState): boolean {
  return replay.activeFluents.some((fluent) =>
    TRANSIENT_LIFECYCLE_FLUENT_PREFIXES.some((prefix) =>
      fluent.startsWith(prefix)
    )
  );
}

function hasResolvedInteractionRoute(
  replay: ReplayState,
  cCallRef: string,
  judgmentRef: string | null,
): boolean {
  const continuation = replay.continuations.find(
    (row) => row.cCallRef === cCallRef && row.status === "resolved",
  );
  return continuation !== undefined &&
    judgmentRef !== null &&
    replay.routes.some(
      (route) =>
        (route.routeKind === "advance" || route.routeKind === "terminal") &&
        route.cCallRef === cCallRef &&
        route.judgmentRef === judgmentRef &&
        route.sourceCursorRef === continuation.successorCursorRef,
    );
}

export function projectOutcome(
  invocation: RootPublicInvocation,
  firstReplay: ReplayState,
  secondReplay: ReplayState,
  outputContractRef: string,
  runtimeInvocationRef: string,
  eventLog: PersistedEventLog,
  continuationAuthority: JsonValue | null = null,
  gapAuthority: JsonValue | null = null,
): PublicOutcome {
  const latestCall = firstReplay.cCalls.at(-1);
  const latestCallContinuation = latestCall === undefined
    ? undefined
    : firstReplay.continuations.find(
        (continuation) => continuation.cCallRef === latestCall.cCallRef,
      );
  const latestContinuation =
    latestCallContinuation ?? firstReplay.continuations.at(-1);
  const replayAgreement =
    firstReplay.replayDigest === secondReplay.replayDigest &&
    firstReplay.eventStoreDigest === secondReplay.eventStoreDigest;
  const eventLogAgreement =
    eventLog.eventCount === firstReplay.eventCount &&
    sha256Canonical(eventLog.events as unknown as JsonValue) ===
      firstReplay.eventStoreDigest;
  const latestInteractionClosed =
    latestCall !== undefined &&
    latestCall.resultClass === "pending" &&
    latestCallContinuation?.status === "resolved" &&
    hasResolvedInteractionRoute(
      firstReplay,
      latestCall.cCallRef,
      latestCall.judgmentRef,
    );
  const resultContractRef = latestInteractionClosed
    ? latestCallContinuation!.responseContractRef
    : latestCall?.resultContractRef ?? null;
  const resultRef = latestInteractionClosed
    ? latestCallContinuation!.responseRef
    : latestCall?.resultRef ?? null;
  const resultValue = latestInteractionClosed
    ? latestCallContinuation!.responseValue
    : latestCall?.resultValue ?? null;
  const closed =
    replayAgreement &&
    firstReplay.cCalls.length > 0 &&
    firstReplay.cCalls.every((cCall, index) =>
      cCall.status === "judged" &&
      (
        cCall.judgment === "advance" ||
        hasClosedRetryChain(firstReplay, index) ||
        hasResolvedInteractionRoute(
          firstReplay,
          cCall.cCallRef,
          cCall.judgmentRef,
        )
      )) &&
    firstReplay.runtimeStatus === "closed" &&
    (latestCall?.judgment === "advance" || latestInteractionClosed) &&
    resultContractRef === outputContractRef &&
    resultRef !== null &&
    latestCall.judgmentRef !== null &&
    firstReplay.terminalReachedEventRef !== null &&
    firstReplay.frameClosedEventRef !== null &&
    firstReplay.graphCallClosedEventRef !== null &&
    firstReplay.runClosedEventRef !== null &&
    !hasOpenLifecycleTruth(firstReplay) &&
    eventLogAgreement;
  const held =
    replayAgreement &&
    eventLogAgreement &&
    firstReplay.runtimeStatus === "held" &&
    latestCall?.resultClass === "pending" &&
    latestCall.judgment === "pending" &&
    latestCallContinuation !== undefined &&
    (
      latestCallContinuation.status === "open" ||
      latestCallContinuation.status === "responded"
    );
  const gapRoute = latestCall === undefined
    ? undefined
    : firstReplay.routes.find(
        (route) =>
          route.routeKind === "gap_stop" &&
          route.cCallRef === latestCall.cCallRef &&
          route.judgmentRef === latestCall.judgmentRef,
      );
  const gapStopped =
    replayAgreement &&
    eventLogAgreement &&
    firstReplay.runtimeStatus === "gap_stopped" &&
    firstReplay.runStoppedEventRef !== null &&
    latestCall?.status === "judged" &&
    latestCall.judgment === "advance" &&
    gapRoute?.nextActionProjection?.disposition === "no_action" &&
    gapRoute.nextActionProjection.noActionDisposition === "gap_stop" &&
    !hasOpenLifecycleTruth(firstReplay);
  const disposition = closed
    ? "succeeded" as const
    : held
      ? "held" as const
      : gapStopped
        ? "gap_stop" as const
      : firstReplay.runtimeStatus === "blocked"
      ? "blocked" as const
      : firstReplay.runtimeStatus === "failed"
        ? "failed" as const
        : "refused" as const;
  const body = {
    operationId: invocation.operationId,
    variant: invocation.variant,
    invocationRef: invocation.invocationRef,
    runtimeInvocationRef,
    disposition,
    result: held && latestContinuation !== undefined
      ? {
          kind: "fh_interaction_hold",
          schemaVersion: "5.0.0",
          continuationRef: latestContinuation.continuationRef,
          continuationStatus: latestContinuation.status,
          requestRef: latestContinuation.requestRef,
          requestDigest: latestContinuation.requestDigest,
          responseContractRef: latestContinuation.responseContractRef,
          responseRef: latestContinuation.responseRef,
          continuationAuthority,
        }
      : gapStopped && gapRoute?.nextActionProjection !== undefined
        ? {
            kind: "construction_gap_stop",
            schemaVersion: "5.0.0",
            gapRef: gapRoute.nextActionProjection.gapRef,
            routeRef: gapRoute.routeRef,
            routeDigest: gapRoute.routeDigest,
            nextActionProjection:
              gapRoute.nextActionProjection as unknown as JsonValue,
            gapAuthority,
          }
      : resultValue,
    diagnosticRef: closed || held || gapStopped
      ? null
      : diagnosticFromEvent(eventLog, firstReplay.runtimeFailureEventRef) ??
        diagnosticFromEvent(eventLog, firstReplay.invocationRefusalEventRef) ??
        diagnosticFromValue(latestCall?.resultValue ?? null) ??
        "diagnostic://abiogenesis/public/non-terminal-replay@5",
    runId: firstReplay.runId,
    graphCallId: firstReplay.graphCallId,
    frameId: firstReplay.frameId,
    cCallRef: latestCall?.cCallRef ?? null,
    resultRef,
    judgmentRef: latestCall?.judgmentRef ?? null,
    outputContractRef,
    admittedResultContractRef: resultContractRef,
    replayRef: firstReplay.replayRef,
    replayDigest: firstReplay.replayDigest,
    replayAgreement,
    eventLogPath: eventLog.eventLogPath,
    eventLogDigest: eventLog.eventLogDigest,
    eventLogByteLength: eventLog.durableByteLength,
    durableEventCount: eventLog.durableEventCount,
    continuationRef: latestContinuation?.continuationRef ?? null,
    continuationStatus: latestContinuation?.status ?? null,
  };
  const outcomeDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "public_outcome" as const,
    schemaVersion: "5.0.0" as const,
    outcomeDigest,
    ...body,
  }) as PublicOutcome;
}

export function attachContinuationAuthority(
  outcome: PublicOutcome,
  continuationAuthority: JsonValue,
): PublicOutcome {
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    outcomeDigest: _outcomeDigest,
    ...priorBody
  } = outcome;
  const body = {
    ...priorBody,
    continuationAuthority,
  };
  return deepFreeze({
    kind: "public_outcome" as const,
    schemaVersion: "5.0.0" as const,
    outcomeDigest: sha256Canonical(body as unknown as JsonValue),
    ...body,
  }) as PublicOutcome;
}
