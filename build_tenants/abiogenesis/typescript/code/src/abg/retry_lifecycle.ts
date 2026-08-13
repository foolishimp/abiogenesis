import type { JsonValue } from "../shared/canonical_json.js";
import type { RuntimeEvent } from "./event_store.js";

function isRecord(value: JsonValue): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export interface CompletedRetryProgressBridgeCoordinates {
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly cCallRef: string;
  readonly resultRef: string;
  readonly judgmentRef: string;
  readonly sourceCursorRef: string;
  readonly sourceCursorDigest: string;
  readonly targetCursorRef: string | null;
  readonly targetCursorDigest: string | null;
}

export interface StoppedRetryProgressBridgeCoordinates {
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly cCallRef: string;
  readonly resultRef: string;
  readonly judgmentRef: string;
  readonly sourceCursorRef: string;
  readonly sourceCursorDigest: string;
}

const COMPLETED_RETRY_PROGRESS_CLASSES = Object.freeze([
  "judged_success",
  "fan_out_success",
  "fh_resume_success",
] as const);

function sharesBridgeScope(
  event: RuntimeEvent,
  route: RuntimeEvent,
): boolean {
  return event.workflowVersion === route.workflowVersion &&
    event.scopeClass === route.scopeClass &&
    event.basisId === route.basisId &&
    event.runId === route.runId &&
    event.graphFunctionRef === route.graphFunctionRef &&
    event.materializationRef === route.materializationRef &&
    event.graphCallId === route.graphCallId &&
    event.frameId === route.frameId;
}

/**
 * Joins an already admitted terminal route to the completed retry-progress
 * suffix that encloses one exact judged CCall result. Retry projection remains
 * wholly owned by retry.ts; this predicate validates only the cross-owner
 * causal relation consumed by child foldback.
 */
export function hasExactCompletedRetryProgressBridge(
  events: readonly RuntimeEvent[],
  route: RuntimeEvent,
  judgment: RuntimeEvent,
  coordinates: CompletedRetryProgressBridgeCoordinates,
): boolean {
  if (
    route.kind !== "traversal_route_admitted" ||
    route.runId !== coordinates.runId ||
    route.graphCallId !== coordinates.graphCallId ||
    route.frameId !== coordinates.frameId ||
    !isRecord(route.payload) ||
    route.payload.routeKind !== "terminal" ||
    route.payload.cCallRef !== coordinates.cCallRef ||
    route.payload.judgmentRef !== coordinates.judgmentRef ||
    route.payload.sourceCursorRef !== coordinates.sourceCursorRef ||
    route.payload.sourceCursorDigest !== coordinates.sourceCursorDigest ||
    route.payload.targetCursorRef !== coordinates.targetCursorRef ||
    route.payload.targetCursorDigest !== coordinates.targetCursorDigest ||
    route.causationEventRefs.length === 0 ||
    judgment.kind !== "c_call_judged" ||
    judgment.runId !== coordinates.runId ||
    judgment.graphCallId !== coordinates.graphCallId ||
    judgment.frameId !== coordinates.frameId ||
    !isRecord(judgment.payload) ||
    judgment.payload.cCallRef !== coordinates.cCallRef ||
    judgment.payload.resultRef !== coordinates.resultRef ||
    judgment.payload.judgmentRef !== coordinates.judgmentRef
  ) return false;

  const byId = new Map(events.map((event) => [event.eventId, event]));
  let current = byId.get(route.causationEventRefs[0]!);
  const visited = new Set<string>();
  let completionClass: JsonValue | undefined;
  let completionWitnessEventRef: JsonValue | undefined;
  while (current?.kind === "retry_progress_recorded") {
    if (
      visited.has(current.eventId) ||
      current.admissionOrdinal >= route.admissionOrdinal ||
      !sharesBridgeScope(current, route) ||
      current.causationEventRefs.length < 2 ||
      !isRecord(current.payload) ||
      current.payload.progressClass !== "completed" ||
      !COMPLETED_RETRY_PROGRESS_CLASSES.includes(
        current.payload.completionClass as
          typeof COMPLETED_RETRY_PROGRESS_CLASSES[number],
      ) ||
      current.payload.cCallRef !== coordinates.cCallRef ||
      current.payload.resultRef !== coordinates.resultRef ||
      current.payload.judgmentRef !== coordinates.judgmentRef ||
      current.payload.sourceCursorRef !== coordinates.sourceCursorRef ||
      current.payload.sourceCursorDigest !== coordinates.sourceCursorDigest ||
      (current.payload.targetCursorRef ?? null) !==
        coordinates.targetCursorRef ||
      (current.payload.targetCursorDigest ?? null) !==
        coordinates.targetCursorDigest ||
      typeof current.payload.progressRef !== "string"
    ) return false;
    visited.add(current.eventId);
    completionClass ??= current.payload.completionClass;
    completionWitnessEventRef ??= current.payload.completionWitnessEventRef;
    if (
      current.payload.completionClass !== completionClass ||
      current.payload.completionWitnessEventRef !== completionWitnessEventRef
    ) return false;

    const predecessor = byId.get(current.causationEventRefs[1]!);
    if (current.payload.predecessorProgressRef === null) {
      if (
        predecessor === undefined ||
        predecessor.eventId !== completionWitnessEventRef ||
        (
          predecessor.eventId !== judgment.eventId &&
          !hasCausalAncestor(byId, predecessor, judgment.eventId)
        )
      ) return false;
      current = judgment;
      break;
    }
    if (
      predecessor?.kind !== "retry_progress_recorded" ||
      !isRecord(predecessor.payload) ||
      predecessor.payload.progressRef !==
        current.payload.predecessorProgressRef
    ) return false;
    current = predecessor;
  }
  return visited.size > 0 && current?.eventId === judgment.eventId;
}

/**
 * Joins an admitted blocked route to the exact stopped retry-progress suffix
 * that encloses one judged CCall failure. Retry projection remains owned by
 * retry.ts; this predicate validates only the cross-owner causal relation
 * consumed by application child foldback.
 */
export function hasExactStoppedRetryProgressBridge(
  events: readonly RuntimeEvent[],
  route: RuntimeEvent,
  judgment: RuntimeEvent,
  coordinates: StoppedRetryProgressBridgeCoordinates,
): boolean {
  if (
    route.kind !== "traversal_route_admitted" ||
    route.runId !== coordinates.runId ||
    route.graphCallId !== coordinates.graphCallId ||
    route.frameId !== coordinates.frameId ||
    route.aggregateType !== "frame" ||
    route.aggregateId !== coordinates.frameId ||
    route.parentAggregateId !== coordinates.graphCallId ||
    !isRecord(route.payload) ||
    route.payload.routeKind !== "blocked" ||
    route.payload.cCallRef !== coordinates.cCallRef ||
    route.payload.judgmentRef !== coordinates.judgmentRef ||
    route.payload.sourceCursorRef !== coordinates.sourceCursorRef ||
    route.payload.sourceCursorDigest !== coordinates.sourceCursorDigest ||
    route.payload.targetCursorRef !== null ||
    route.payload.targetCursorDigest !== null ||
    !Array.isArray(route.payload.consumedAvailabilityRefs) ||
    route.payload.consumedAvailabilityRefs.some(
      (value) => typeof value !== "string",
    ) ||
    route.payload.consumedAvailabilityRefs[0] !== coordinates.judgmentRef ||
    judgment.kind !== "c_call_judged" ||
    judgment.runId !== coordinates.runId ||
    judgment.graphCallId !== coordinates.graphCallId ||
    judgment.frameId !== coordinates.frameId ||
    judgment.aggregateType !== "c_call" ||
    judgment.aggregateId !== coordinates.cCallRef ||
    judgment.parentAggregateId !== coordinates.frameId ||
    !isRecord(judgment.payload) ||
    judgment.payload.cCallRef !== coordinates.cCallRef ||
    judgment.payload.resultRef !== coordinates.resultRef ||
    judgment.payload.judgmentRef !== coordinates.judgmentRef ||
    judgment.payload.judgment !== "blocked" ||
    typeof judgment.payload.reasonRef !== "string"
  ) return false;

  const progressRefs = route.payload.consumedAvailabilityRefs.slice(1);
  const progressRows = progressRefs.map((progressRef) =>
    events.filter(
      (event) =>
        event.kind === "retry_progress_recorded" &&
        isRecord(event.payload) &&
        event.payload.progressRef === progressRef,
    )
  );
  if (
    progressRows.length === 0 ||
    progressRows.some((rows) => rows.length !== 1)
  ) return false;
  const progresses = progressRows.map((rows) => rows[0]!);
  const expectedRouteCauses = [...progresses]
    .reverse()
    .map((event) => event.eventId);
  if (
    route.causationEventRefs.length !== expectedRouteCauses.length ||
    route.causationEventRefs.some(
      (eventRef, index) => eventRef !== expectedRouteCauses[index],
    )
  ) return false;

  const byId = new Map(events.map((event) => [event.eventId, event]));
  let predecessorEventId: string | null = null;
  let predecessorProgressRef: string | null = null;
  let predecessorAdmissionOrdinal: number | null = null;
  let failureClass: JsonValue | undefined;
  let failureSignalRef: JsonValue | undefined;
  for (const [index, progress] of progresses.entries()) {
    if (
      progress.admissionOrdinal >= route.admissionOrdinal ||
      !sharesBridgeScope(progress, route) ||
      progress.aggregateType !== "frame" ||
      progress.aggregateId !== coordinates.frameId ||
      progress.parentAggregateId !== coordinates.graphCallId ||
      progress.causationEventRefs.length !== 2 ||
      !isRecord(progress.payload) ||
      progress.payload.progressClass !== "stopped" ||
      progress.payload.cCallRef !== coordinates.cCallRef ||
      progress.payload.resultRef !== coordinates.resultRef ||
      progress.payload.judgmentRef !== coordinates.judgmentRef ||
      typeof progress.payload.progressRef !== "string" ||
      progress.payload.progressRef !== progressRefs[index] ||
      typeof progress.payload.attemptRef !== "string" ||
      typeof progress.payload.retryBoundaryRef !== "string" ||
      typeof progress.payload.failureClass !== "string" ||
      typeof progress.payload.failureSignalRef !== "string" ||
      progress.payload.failureSignalRef !== judgment.payload.reasonRef
    ) return false;
    const attempt = byId.get(progress.causationEventRefs[0]!);
    if (
      attempt?.kind !== "retry_attempt_opened" ||
      attempt.admissionOrdinal >= progress.admissionOrdinal ||
      !sharesBridgeScope(attempt, route) ||
      attempt.aggregateType !== "frame" ||
      attempt.aggregateId !== coordinates.frameId ||
      attempt.parentAggregateId !== coordinates.graphCallId ||
      !isRecord(attempt.payload) ||
      attempt.payload.attemptRef !== progress.payload.attemptRef ||
      attempt.payload.retryBoundaryRef !== progress.payload.retryBoundaryRef
    ) return false;
    failureClass ??= progress.payload.failureClass;
    failureSignalRef ??= progress.payload.failureSignalRef;
    if (
      progress.payload.failureClass !== failureClass ||
      progress.payload.failureSignalRef !== failureSignalRef ||
      (index === 0
        ? progress.payload.stopReason !== "boundary_terminal" ||
          progress.payload.predecessorProgressRef !== null ||
          progress.causationEventRefs[1] !== judgment.eventId
        : progress.payload.stopReason !== "propagated_inner_stop" ||
          predecessorAdmissionOrdinal === null ||
          predecessorAdmissionOrdinal >= progress.admissionOrdinal ||
          progress.payload.predecessorProgressRef !==
            predecessorProgressRef ||
          progress.causationEventRefs[1] !== predecessorEventId)
    ) return false;
    predecessorEventId = progress.eventId;
    predecessorProgressRef = progress.payload.progressRef;
    predecessorAdmissionOrdinal = progress.admissionOrdinal;
  }
  return true;
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
