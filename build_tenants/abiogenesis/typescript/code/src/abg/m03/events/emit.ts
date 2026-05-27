import { randomUUID } from "node:crypto";

import type {
  CanonicalRuntimeEvent,
  RuntimeEvent
} from "../contracts/carriers.js";
import {
  assertCanonicalRuntimeEvent,
  assertCanonicalRuntimeEventSequence,
  assertRuntimeEvent
} from "../contracts/event_admission.js";

export type RuntimeEventSink = (event: CanonicalRuntimeEvent) => void;

let runtimeEventAdmissionOrdinal = 0;

function isRuntimeEventBatch(
  events: RuntimeEvent | readonly RuntimeEvent[]
): events is readonly RuntimeEvent[] {
  return Array.isArray(events);
}

function nextRuntimeEventAdmissionOrdinal(): number {
  const ordinal = runtimeEventAdmissionOrdinal;
  runtimeEventAdmissionOrdinal += 1;
  return ordinal;
}

function hasCanonicalRuntimeEventEnvelope(event: RuntimeEvent): boolean {
  return (
    "eventId" in event ||
    "eventTime" in event ||
    "eventTimeUnixMs" in event ||
    "eventAdmissionOrdinal" in event
  );
}

function canonicalRuntimeEvent(event: RuntimeEvent): CanonicalRuntimeEvent {
  assertRuntimeEvent(event);
  if (hasCanonicalRuntimeEventEnvelope(event)) {
    assertCanonicalRuntimeEvent(event);
    return event;
  }
  const eventTimeUnixMs = Date.now();
  const eventTime = new Date(eventTimeUnixMs).toISOString();
  const eventAdmissionOrdinal = nextRuntimeEventAdmissionOrdinal();
  const eventId = [
    "runtime-event",
    eventTime,
    String(eventAdmissionOrdinal),
    randomUUID()
  ].join(":");
  const canonical = Object.freeze({
    ...event,
    eventId,
    eventTime,
    eventTimeUnixMs,
    eventAdmissionOrdinal
  });
  assertCanonicalRuntimeEvent(canonical);
  return canonical;
}

function normalizeEvents(
  events: RuntimeEvent | readonly RuntimeEvent[]
): readonly CanonicalRuntimeEvent[] {
  const batch = isRuntimeEventBatch(events) ? Object.freeze([...events]) : Object.freeze([events]);
  const canonical = Object.freeze(batch.map((event) => canonicalRuntimeEvent(event)));
  assertCanonicalRuntimeEventSequence(canonical, "emit.events");
  return canonical;
}

export function emit(
  events: RuntimeEvent | readonly RuntimeEvent[],
  sink: RuntimeEventSink
): readonly CanonicalRuntimeEvent[] {
  const normalized = normalizeEvents(events);
  for (const event of normalized) {
    sink(event);
  }
  return normalized;
}
