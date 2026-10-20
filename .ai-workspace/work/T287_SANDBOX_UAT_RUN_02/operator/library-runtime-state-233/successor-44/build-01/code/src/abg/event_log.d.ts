import { type Sha256Digest } from "../shared/digests.js";
import { type AbgEventStore, type RuntimeEvent, type RuntimeEventScope } from "./event_store.js";
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
export declare function persistEventLog(store: AbgEventStore, eventLogPath: string, scope?: RuntimeEventScope): Promise<PersistedEventLog>;
