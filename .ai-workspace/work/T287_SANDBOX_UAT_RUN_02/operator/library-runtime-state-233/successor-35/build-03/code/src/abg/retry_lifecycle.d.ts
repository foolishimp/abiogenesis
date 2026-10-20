import type { RuntimeEvent } from "./event_store.js";
export interface CompletedRetryProgressBridgeCoordinates {
    readonly runId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly cCallRef: string;
    readonly resultRef: string;
    readonly judgmentRef: string;
    readonly sourceCursorRef: string;
    readonly sourceCursorDigest: string;
    readonly targetCursorRef: string | null;
    readonly targetCursorDigest: string | null;
}
export interface StoppedRetryProgressBridgeCoordinates {
    readonly runId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly cCallRef: string;
    readonly resultRef: string;
    readonly judgmentRef: string;
    readonly sourceCursorRef: string;
    readonly sourceCursorDigest: string;
}
/**
 * Joins an already admitted terminal route to the completed retry-progress
 * suffix that encloses one exact judged CCall result. Retry projection remains
 * wholly owned by retry.ts; this predicate validates only the cross-owner
 * causal relation consumed by child foldback.
 */
export declare function hasExactCompletedRetryProgressBridge(events: readonly RuntimeEvent[], route: RuntimeEvent, judgment: RuntimeEvent, coordinates: CompletedRetryProgressBridgeCoordinates): boolean;
/**
 * Joins an admitted blocked route to the exact stopped retry-progress suffix
 * that encloses one judged CCall failure. Retry projection remains owned by
 * retry.ts; this predicate validates only the cross-owner causal relation
 * consumed by application child foldback.
 */
export declare function hasExactStoppedRetryProgressBridge(events: readonly RuntimeEvent[], route: RuntimeEvent, judgment: RuntimeEvent, coordinates: StoppedRetryProgressBridgeCoordinates): boolean;
