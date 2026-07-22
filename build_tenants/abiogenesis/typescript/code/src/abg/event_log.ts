import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Bytes, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  selectRuntimeEvents,
  type AbgEventStore,
  type RuntimeEvent,
  type RuntimeEventScope,
} from "./event_store.js";

export interface PersistedEventLog {
  readonly kind: "persisted_abg_event_log";
  readonly schemaVersion: "5.0.0";
  readonly eventLogPath: string;
  readonly eventLogDigest: Sha256Digest;
  readonly durableByteLength: number;
  readonly eventCount: number;
  readonly durableEventCount: number;
  readonly events: readonly RuntimeEvent[];
}

export async function persistEventLog(
  store: AbgEventStore,
  eventLogPath: string,
  scope?: RuntimeEventScope,
): Promise<PersistedEventLog> {
  store.configureDurableLog(eventLogPath);
  const configuredPath = store.configuredDurableLogPath();
  if (configuredPath === null || configuredPath !== resolve(eventLogPath)) {
    throw new TypeError("ABG persisted log path differs from the configured event sink");
  }
  const encoded = await readFile(configuredPath);
  const lines = encoded.toString("utf8").split(/\r?\n/u).filter((line) => line.length !== 0);
  const durableEvents = lines.map((line) => JSON.parse(line) as RuntimeEvent);
  if (
    canonicalJson(durableEvents as unknown as JsonValue) !==
    canonicalJson(store.readAll() as unknown as JsonValue)
  ) {
    throw new TypeError("durable ABG event log differs from admitted in-memory truth");
  }
  const events = selectRuntimeEvents(durableEvents, scope);
  const eventLogDigest = sha256Bytes(encoded);
  return deepFreeze({
    kind: "persisted_abg_event_log" as const,
    schemaVersion: "5.0.0" as const,
    eventLogPath,
    eventLogDigest,
    durableByteLength: encoded.byteLength,
    eventCount: events.length,
    durableEventCount: durableEvents.length,
    events,
  }) as PersistedEventLog;
}
