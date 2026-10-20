import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { canonicalJson } from "../shared/canonical_json.js";
import { sha256Bytes } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { selectRuntimeEvents, validateHistoricalEvents, } from "./event_store.js";
export async function persistEventLog(store, eventLogPath, scope) {
    const configuredPath = store.configuredDurableLogPath();
    if (configuredPath === null || configuredPath !== resolve(eventLogPath)) {
        throw new TypeError("ABG persisted log path differs from the configured event sink");
    }
    const encoded = await readFile(configuredPath);
    const durableEvents = validateHistoricalEvents(encoded);
    if (canonicalJson(durableEvents) !==
        canonicalJson(store.readAll())) {
        throw new TypeError("durable ABG event log differs from admitted in-memory truth");
    }
    const events = selectRuntimeEvents(durableEvents, scope);
    const eventLogDigest = sha256Bytes(encoded);
    return deepFreeze({
        kind: "persisted_abg_event_log",
        schemaVersion: "5.0.0",
        eventLogPath,
        eventLogDigest,
        durableByteLength: encoded.byteLength,
        eventCount: events.length,
        durableEventCount: durableEvents.length,
        events,
    });
}
