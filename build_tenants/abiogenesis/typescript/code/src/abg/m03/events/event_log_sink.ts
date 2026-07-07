import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

import type { CanonicalRuntimeEvent } from "../contracts/carriers.js";
import type { RuntimeEventSink } from "./emit.js";

export interface RuntimeEventLogSink {
  readonly emittedEvents: readonly CanonicalRuntimeEvent[];
  readonly sink: RuntimeEventSink;
}

export function appendRuntimeEventsToLog(
  eventLogPath: string,
  events: readonly CanonicalRuntimeEvent[]
): void {
  if (events.length === 0) {
    return;
  }
  mkdirSync(dirname(eventLogPath), { recursive: true });
  appendFileSync(
    eventLogPath,
    `${events.map((event) => JSON.stringify(event)).join("\n")}\n`,
    "utf8"
  );
}

export function createRuntimeEventLogSink(
  eventLogPath: string
): RuntimeEventLogSink {
  const emittedEvents: CanonicalRuntimeEvent[] = [];
  const sink: RuntimeEventSink = (event) => {
    emittedEvents.push(event);
    appendRuntimeEventsToLog(eventLogPath, [event]);
  };
  return Object.freeze({
    emittedEvents,
    sink
  });
}
