import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import {
  constructRuntimeFluent,
  holdsAt,
  type RuntimeEventCalculusProjection,
} from "./event_calculus.js";
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

function hasCausalAncestor(
  eventsById: ReadonlyMap<string, RuntimeEvent>,
  descendant: RuntimeEvent,
  ancestorEventId: string,
): boolean {
  const pending = [...descendant.causationEventRefs];
  const visited = new Set<string>();
  while (pending.length !== 0) {
    const eventId = pending.pop()!;
    if (eventId === ancestorEventId) return true;
    if (visited.has(eventId)) continue;
    visited.add(eventId);
    const event = eventsById.get(eventId);
    if (event !== undefined) pending.push(...event.causationEventRefs);
  }
  return false;
}

export function selectExactRetryAttemptEvent(
  events: readonly RuntimeEvent[],
  coordinates: RetryOwnedCCallCoordinates,
  projection: RuntimeEventCalculusProjection,
): RuntimeEvent | null {
  if (coordinates.retryPath.length === 0) return null;
  const openedRows = events.filter((event) =>
    event.kind === "c_call_opened" && event.aggregateId === coordinates.cCallRef
  );
  if (openedRows.length !== 1) return null;
  const opened = openedRows[0]!;
  if (!isRecord(opened.payload)) return null;
  const openedPayload = opened.payload;
  const immediateRoutes = events.filter((event) =>
    event.kind === "traversal_route_admitted" &&
    opened.causationEventRefs.includes(event.eventId) &&
    event.runId === coordinates.runId &&
    event.graphCallId === coordinates.graphCallId &&
    event.frameId === coordinates.frameId &&
    isRecord(event.payload) &&
    event.payload.targetCursorRef === openedPayload.cursorRef &&
    event.payload.targetCursorDigest === openedPayload.cursorDigest
  );
  if (immediateRoutes.length !== 1) return null;
  const immediateRoute = immediateRoutes[0]!;
  if (openedPayload.taskOrdinal !== coordinates.taskOrdinal ||
    openedPayload.attempt !== coordinates.attempt ||
    openedPayload.programLocusRef !== coordinates.programLocusRef ||
    sha256Canonical(openedPayload.retryPath as JsonValue) !==
      sha256Canonical(coordinates.retryPath as unknown as JsonValue)) return null;
  const eventsById = new Map(events.map((event) => [event.eventId, event]));
  const matches = events.filter((attemptEvent) => {
    if (
      attemptEvent.kind !== "retry_attempt_opened" ||
      attemptEvent.runId !== coordinates.runId ||
      attemptEvent.graphCallId !== coordinates.graphCallId ||
      attemptEvent.frameId !== coordinates.frameId ||
      !isRecord(attemptEvent.payload) ||
      attemptEvent.payload.attempt !== coordinates.attempt ||
      typeof attemptEvent.payload.attemptRef !== "string" ||
      !Array.isArray(attemptEvent.payload.retryPath) ||
      !Array.isArray(attemptEvent.payload.wrappedTermPath) ||
      sha256Canonical(attemptEvent.payload.retryPath) !==
        sha256Canonical(coordinates.retryPath as unknown as JsonValue)
    ) return false;
    const attemptPayload = attemptEvent.payload;
    if (!holdsAt(projection, constructRuntimeFluent({
      name: "retry_attempt_active",
      identity: attemptPayload.attemptRef as string,
    }))) return false;
    const priorRoutes = events.filter((event) =>
      event.kind === "traversal_route_admitted" &&
      attemptEvent.causationEventRefs.includes(event.eventId) &&
      event.runId === coordinates.runId &&
      event.graphCallId === coordinates.graphCallId &&
      event.frameId === coordinates.frameId &&
      isRecord(event.payload) && event.payload.routeKind === "retry" &&
      event.payload.routeRef === attemptPayload.priorRouteRef &&
      (immediateRoute.eventId === event.eventId ||
        hasCausalAncestor(eventsById, immediateRoute, event.eventId))
    );
    if (priorRoutes.length !== 1) return false;
    const route = priorRoutes[0]!;
    const routePayload = route.payload as Readonly<Record<string, JsonValue>>;
    const sourceBases = events.filter((event) =>
      route.causationEventRefs.includes(event.eventId) &&
      isRecord(event.payload) &&
      (
        (event.kind === "traversal_cursor_entered" &&
          event.payload.cursorRef === routePayload.sourceCursorRef &&
          event.payload.cursorDigest === routePayload.sourceCursorDigest) ||
        (event.kind === "traversal_route_admitted" &&
          event.payload.targetCursorRef === routePayload.sourceCursorRef &&
          event.payload.targetCursorDigest === routePayload.sourceCursorDigest)
      )
    );
    const causedProgress = events.filter((progressEvent) =>
      progressEvent.kind === "retry_progress_recorded" &&
      route.causationEventRefs.includes(progressEvent.eventId) &&
      isRecord(progressEvent.payload)
    );
    if (attemptPayload.priorJudgmentRef === null) {
      const sourceBasis = sourceBases.length === 1 ? sourceBases[0]! : null;
      const sourcePayload = sourceBasis !== null && isRecord(sourceBasis.payload)
        ? sourceBasis.payload
        : null;
      const exactRetryBoundary = sourceBasis?.kind === "traversal_cursor_entered"
        ? sourcePayload !== null &&
          Array.isArray(attemptPayload.retryTermPath) &&
          Array.isArray(sourcePayload.termPath) &&
          sha256Canonical(attemptPayload.retryTermPath) ===
            sha256Canonical(sourcePayload.termPath)
        : sourceBasis?.kind === "traversal_route_admitted";
      return exactRetryBoundary &&
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

export function hasExactRetryContinuationProgressOwnership(
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

export function hasExactRetryCompletionOwnership(
  attemptEvent: RuntimeEvent,
  judgmentEvent: RuntimeEvent,
  currentBoundaryRef: string,
  retryPath: readonly number[],
): boolean {
  return isRecord(attemptEvent.payload) && isRecord(judgmentEvent.payload) &&
    typeof attemptEvent.payload.attemptRef === "string" &&
    judgmentEvent.payload.judgment === "advance" &&
    judgmentEvent.payload.retryAttemptRef === attemptEvent.payload.attemptRef &&
    attemptEvent.payload.retryBoundaryRef === currentBoundaryRef &&
    Array.isArray(attemptEvent.payload.retryPath) &&
    sha256Canonical(attemptEvent.payload.retryPath) ===
      sha256Canonical(retryPath as unknown as JsonValue);
}
