import { indexedRuntimeEvents } from "./event_prefix.js";
import { isJsonRecord as isRecord } from "../shared/admission_predicates.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  constructRuntimeFluent,
  deriveRuntimeHeldFluentProjection,
  holdsAt,
} from "./event_calculus.js";
import {
  readRuntimeEventsAtDurablePrefix,
  type DurablePrefixCoordinate,
} from "./event_store.js";
import {
  projectOwnedRuntimeEventPrefixAtDurablePrefix,
  selectRuntimeEventPrefixFromAuthority,
  selectValidatedRuntimeEventPrefix,
  type RuntimeEventPrefix,
} from "./event_prefix.js";
import {
  materializeRuntimeReplayGuard,
  projectRuntimeReplayGuard,
  type ReplayState,
  type RuntimeReplayGuard,
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
  const projected = projectDeferredApplication(currentPrefix, fullPrefix, coordinates);
  return projected === null ? null : deepFreeze({
    ...projected,
    replayState: materializeRuntimeReplayGuard(projected.replayState),
  });
}

/** @internal Same canonical deferred truth at the genuine selected owner cut. */
export type OwnedDeferredApplicationProjection =
  Omit<DeferredApplicationProjection, "replayState"> & {
    readonly replayState: RuntimeReplayGuard;
  };

/** @internal */
type DeferredApplicationCoordinates = Readonly<{
  runId: string;
  frameId: string;
  sourceCursorRef: string;
  cCallRef: string;
  resultRef: string;
  judgmentRef: string;
}>;

/** @internal Ordinary restoration does not request a complete historical output. */
export function projectOwnedDeferredApplicationAtPrefix(
  predecessorPrefix: DurablePrefixCoordinate,
  coordinates: DeferredApplicationCoordinates,
): OwnedDeferredApplicationProjection | null {
  const authority = projectOwnedRuntimeEventPrefixAtDurablePrefix(predecessorPrefix);
  const current = selectRuntimeEventPrefixFromAuthority(authority, { runId: coordinates.runId });
  return projectDeferredApplication(current, authority, coordinates);
}

function projectDeferredApplication(
  currentPrefix: RuntimeEventPrefix,
  fullPrefix: RuntimeEventPrefix,
  coordinates: DeferredApplicationCoordinates,
): OwnedDeferredApplicationProjection | null {
  const judgmentEvent = indexedRuntimeEvents(currentPrefix, "related:" + coordinates.cCallRef).find(
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
  const resultEvent = indexedRuntimeEvents(currentPrefix, "related:" + coordinates.cCallRef).find(
    (event) =>
      event.admissionOrdinal < judgmentEvent.admissionOrdinal &&
      event.kind === "c_call_result_admitted" &&
      event.aggregateId === coordinates.cCallRef &&
      isRecord(event.payload) &&
      event.payload.cCallRef === coordinates.cCallRef &&
      event.payload.resultRef === coordinates.resultRef,
  );
  if (resultEvent === undefined || !isRecord(resultEvent.payload)) return null;
  const eventCalculus = deriveRuntimeHeldFluentProjection(currentPrefix);
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
    // The producer remains the original judgment, while restoration must bind
    // the exact supplied completion prefix, including later probe facts. The
    // live Run/frame/locus/judgment checks above still govern that prefix.
    replayState: projectRuntimeReplayGuard(
      currentPrefix,
      fullPrefix,
    ),
  });
}
