import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  constructRuntimeFluent,
  deriveRuntimeEventCalculusProjection,
  holdsAt,
} from "./event_calculus.js";
import {
  readRuntimeEventsAtDurablePrefix,
  type DurablePrefixCoordinate,
} from "./event_store.js";
import {
  runtimeEventsFromValidatedPrefix,
  selectValidatedRuntimeEventPrefix,
  validatedRuntimeEventPrefixThroughEvent,
} from "./event_prefix.js";
import {
  replayValidatedRuntimeEventPrefix,
  type ReplayState,
} from "./replay.js";

export interface DeferredApplicationProjection {
  readonly kind: "deferred_application_projection";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "application_ready";
  readonly runId: string;
  readonly cCallRef: string;
  readonly resultRef: string;
  readonly judgmentRef: string;
  readonly judgmentEventRef: string;
  readonly judgmentAdmissionOrdinal: number;
  readonly resultValue: JsonValue;
  readonly replayState: ReplayState;
}

function isRecord(
  value: JsonValue,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function projectDeferredApplicationAtPrefix(
  predecessorPrefix: DurablePrefixCoordinate,
  coordinates: Readonly<{
    runId: string;
    frameId: string;
    sourceCursorRef: string;
    cCallRef: string;
    resultRef: string;
    judgmentRef: string;
  }>,
): DeferredApplicationProjection | null {
  const snapshot = readRuntimeEventsAtDurablePrefix(predecessorPrefix);
  const fullPrefix = selectValidatedRuntimeEventPrefix(snapshot);
  const currentPrefix = selectValidatedRuntimeEventPrefix(snapshot, {
    runId: coordinates.runId,
  });
  const events = runtimeEventsFromValidatedPrefix(currentPrefix);
  const judgmentEvent = events.find(
    (event) =>
      event.kind === "c_call_judged" &&
      event.aggregateId === coordinates.cCallRef &&
      isRecord(event.payload) &&
      event.payload.cCallRef === coordinates.cCallRef &&
      event.payload.resultRef === coordinates.resultRef &&
      event.payload.judgmentRef === coordinates.judgmentRef &&
      event.payload.judgment === "advance",
  );
  if (judgmentEvent === undefined) return null;
  const resultEvent = events.find(
    (event) =>
      event.admissionOrdinal < judgmentEvent.admissionOrdinal &&
      event.kind === "c_call_result_admitted" &&
      event.aggregateId === coordinates.cCallRef &&
      isRecord(event.payload) &&
      event.payload.cCallRef === coordinates.cCallRef &&
      event.payload.resultRef === coordinates.resultRef,
  );
  if (resultEvent === undefined || !isRecord(resultEvent.payload)) return null;
  const eventCalculus = deriveRuntimeEventCalculusProjection(currentPrefix);
  if (![
    constructRuntimeFluent({ name: "run_active", identity: coordinates.runId }),
    constructRuntimeFluent({ name: "frame_active", identity: coordinates.frameId }),
    constructRuntimeFluent({
      name: "locus_active",
      identity: coordinates.sourceCursorRef,
    }),
    constructRuntimeFluent({
      name: "c_call_judgment_available",
      identity: coordinates.judgmentRef,
    }),
  ].every((fluent) => holdsAt(eventCalculus, fluent))) {
    return null;
  }
  const historicalPrefix = validatedRuntimeEventPrefixThroughEvent(
    currentPrefix,
    judgmentEvent.eventId,
  );
  const historicalAuthorityPrefix = validatedRuntimeEventPrefixThroughEvent(
    fullPrefix,
    judgmentEvent.eventId,
  );
  return deepFreeze({
    kind: "deferred_application_projection" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "application_ready" as const,
    runId: coordinates.runId,
    cCallRef: coordinates.cCallRef,
    resultRef: coordinates.resultRef,
    judgmentRef: coordinates.judgmentRef,
    judgmentEventRef: judgmentEvent.eventId,
    judgmentAdmissionOrdinal: judgmentEvent.admissionOrdinal,
    resultValue: resultEvent.payload.value ?? null,
    replayState: replayValidatedRuntimeEventPrefix(
      historicalPrefix,
      historicalAuthorityPrefix,
    ),
  });
}
