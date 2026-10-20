import type { JsonValue } from "../shared/canonical_json.js";
import { type DurablePrefixCoordinate } from "./event_store.js";
import { type ReplayState } from "./replay.js";
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
export declare function projectDeferredApplicationAtPrefix(predecessorPrefix: DurablePrefixCoordinate, coordinates: Readonly<{
    runId: string;
    frameId: string;
    sourceCursorRef: string;
    cCallRef: string;
    resultRef: string;
    judgmentRef: string;
}>): DeferredApplicationProjection | null;
