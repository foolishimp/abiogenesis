import type { RuntimeEvent } from "../contracts/carriers.js";
import { assertRuntimeEvent } from "../contracts/event_admission.js";

export type RuntimeEventSink = (event: RuntimeEvent) => void;

function isRuntimeEventBatch(
  events: RuntimeEvent | readonly RuntimeEvent[]
): events is readonly RuntimeEvent[] {
  return Array.isArray(events);
}

function normalizeEvents(
  events: RuntimeEvent | readonly RuntimeEvent[]
): readonly RuntimeEvent[] {
  const batch = isRuntimeEventBatch(events) ? Object.freeze([...events]) : Object.freeze([events]);
  for (const event of batch) {
    assertRuntimeEvent(event);
  }
  return batch;
}

export function emit(
  events: RuntimeEvent | readonly RuntimeEvent[],
  sink: RuntimeEventSink
): readonly RuntimeEvent[] {
  const normalized = normalizeEvents(events);
  for (const event of normalized) {
    sink(event);
  }
  return normalized;
}
