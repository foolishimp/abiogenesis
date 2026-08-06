import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { RuntimeEvent } from "./event_store.js";

function isRecord(value: JsonValue): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export interface RetryOwnedCCallCoordinates {
  readonly cCallRef: string;
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly taskOrdinal: number | null;
  readonly attempt: number;
  readonly retryPath: readonly number[];
  readonly programLocusRef: string;
}

export function selectExactRetryAttemptEvent(
  events: readonly RuntimeEvent[],
  coordinates: RetryOwnedCCallCoordinates,
): RuntimeEvent | null {
  if (coordinates.retryPath.length === 0) return null;
  const openedRows = events.filter((event) =>
    event.kind === "c_call_opened" && event.aggregateId === coordinates.cCallRef
  );
  if (openedRows.length !== 1) return null;
  const opened = openedRows[0]!;
  const routeEvents = events.filter((event) =>
    event.kind === "traversal_route_admitted" &&
    opened.causationEventRefs.includes(event.eventId) &&
    event.runId === coordinates.runId &&
    event.graphCallId === coordinates.graphCallId &&
    event.frameId === coordinates.frameId &&
    isRecord(event.payload) && event.payload.routeKind === "retry"
  );
  if (routeEvents.length !== 1) return null;
  const route = routeEvents[0]!;
  const routePayload = route.payload as Readonly<Record<string, JsonValue>>;
  const openedPayload = opened.payload as Readonly<Record<string, JsonValue>>;
  if (openedPayload.cursorRef !== routePayload.targetCursorRef ||
    openedPayload.cursorDigest !== routePayload.targetCursorDigest ||
    openedPayload.taskOrdinal !== coordinates.taskOrdinal ||
    openedPayload.attempt !== coordinates.attempt ||
    openedPayload.programLocusRef !== coordinates.programLocusRef ||
    sha256Canonical(openedPayload.retryPath as JsonValue) !==
      sha256Canonical(coordinates.retryPath as unknown as JsonValue)) return null;
  const sourceCursors = events.filter((event) =>
    event.kind === "traversal_cursor_entered" &&
    route.causationEventRefs.includes(event.eventId) &&
    isRecord(event.payload) &&
    event.payload.cursorRef === routePayload.sourceCursorRef &&
    event.payload.cursorDigest === routePayload.sourceCursorDigest
  );
  const matches = events.filter((attemptEvent) => {
    if (
      attemptEvent.kind !== "retry_attempt_opened" ||
      attemptEvent.runId !== coordinates.runId ||
      attemptEvent.graphCallId !== coordinates.graphCallId ||
      attemptEvent.frameId !== coordinates.frameId ||
      !isRecord(attemptEvent.payload) ||
      attemptEvent.payload.taskOrdinal !== coordinates.taskOrdinal ||
      attemptEvent.payload.attempt !== coordinates.attempt ||
      !Array.isArray(attemptEvent.payload.retryPath) ||
      !Array.isArray(attemptEvent.payload.wrappedTermPath) ||
      sha256Canonical(attemptEvent.payload.retryPath) !==
        sha256Canonical(coordinates.retryPath as unknown as JsonValue)
    ) return false;
    const attemptPayload = attemptEvent.payload;
    if (!attemptEvent.causationEventRefs.includes(route.eventId) ||
      routePayload.routeRef !== attemptPayload.priorRouteRef) return false;
    const causedProgress = events.filter((progressEvent) =>
      progressEvent.kind === "retry_progress_recorded" &&
      route.causationEventRefs.includes(progressEvent.eventId) &&
      isRecord(progressEvent.payload)
    );
    if (attemptPayload.priorJudgmentRef === null) {
      const sourceCursorPayload = sourceCursors.length === 1 &&
          isRecord(sourceCursors[0]!.payload)
        ? sourceCursors[0]!.payload
        : null;
      return sourceCursorPayload !== null &&
        Array.isArray(attemptPayload.retryTermPath) &&
        Array.isArray(sourceCursorPayload.termPath) &&
        sha256Canonical(attemptPayload.retryTermPath) ===
          sha256Canonical(sourceCursorPayload.termPath) &&
        causedProgress.length === 0 &&
        routePayload.judgmentRef === null && routePayload.cCallRef === null &&
        Array.isArray(routePayload.consumedAvailabilityRefs) &&
        routePayload.consumedAvailabilityRefs.length === 0;
    }
    return causedProgress.length === 1 && isRecord(causedProgress[0]!.payload) &&
      causedProgress[0]!.payload.retryBoundaryRef === attemptPayload.retryBoundaryRef &&
      causedProgress[0]!.payload.judgmentRef === attemptPayload.priorJudgmentRef;
  });
  return matches.length === 1 ? matches[0]! : null;
}

export function hasExactRetryProgressOwnership(
  attemptEvent: RuntimeEvent,
  judgmentEvent: RuntimeEvent,
  currentBoundaryRef: string,
): boolean {
  return isRecord(attemptEvent.payload) && isRecord(judgmentEvent.payload) &&
    typeof attemptEvent.payload.attemptRef === "string" &&
    judgmentEvent.payload.judgment === "retry" &&
    judgmentEvent.payload.retryAttemptRef === attemptEvent.payload.attemptRef &&
    attemptEvent.payload.retryBoundaryRef === currentBoundaryRef;
}
