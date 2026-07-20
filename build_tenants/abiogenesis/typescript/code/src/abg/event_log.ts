import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import {
  canonicalJson,
  sha256Canonical,
  type JsonValue,
  type Sha256Digest,
} from "../product/index.js";
import { deepFreeze } from "../product/immutable.js";
import type { AbgEventStore, RuntimeEvent } from "./event_store.js";

export interface PersistedEventLog {
  readonly kind: "persisted_abg_event_log";
  readonly schemaVersion: "5.0.0";
  readonly eventLogPath: string;
  readonly eventLogDigest: Sha256Digest;
  readonly eventCount: number;
  readonly events: readonly RuntimeEvent[];
}

export async function persistEventLog(
  store: AbgEventStore,
  eventLogPath: string,
): Promise<PersistedEventLog> {
  const events = store.readAll();
  const body = {
    kind: "abg_event_log" as const,
    schemaVersion: "5.0.0" as const,
    events,
  };
  const eventLogDigest = sha256Canonical(body as unknown as JsonValue);
  await mkdir(dirname(eventLogPath), { recursive: true });
  await writeFile(eventLogPath, `${canonicalJson(body as unknown as JsonValue)}\n`, "utf8");
  return deepFreeze({
    kind: "persisted_abg_event_log" as const,
    schemaVersion: "5.0.0" as const,
    eventLogPath,
    eventLogDigest,
    eventCount: events.length,
    events,
  }) as PersistedEventLog;
}
