import { type Sha256Digest } from "../shared/digests.js";
import { type AbgEventStore, type DurablePrefixCoordinate, type RuntimeEvent, type RuntimeEventCandidate } from "./event_store.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import type { OpenedTraversalScope } from "./open_call.js";
export interface ChildFoldbackTruth {
    readonly childDisposition: "blocked" | "closed" | "failed";
    readonly childResultDigest: Sha256Digest;
    readonly childReasonRef: string | null;
    readonly childTerminalEventRef: string;
    readonly outputDigest: Sha256Digest;
    readonly routeEventRef: string;
}
export declare function projectChildFoldbackTruth(input: Readonly<{
    prefix: ValidatedRuntimeEventPrefix;
    childScope: OpenedTraversalScope;
    childResultRef: string;
    childJudgmentRef: string;
    childClosureRef: string | null;
    selectedRouteEventRef: string | null;
    allowedDispositions: readonly ChildFoldbackTruth["childDisposition"][];
    directCausation: "includes" | "terminal_first";
    allowRetryBridges: boolean;
}>): ChildFoldbackTruth | null;
export declare function admitChildLifecycleEvent(input: Readonly<{
    store: AbgEventStore;
    expectedPrefixDigest: Sha256Digest;
    event: RuntimeEventCandidate;
}>): Readonly<{
    event: RuntimeEvent;
    successorPrefix: DurablePrefixCoordinate;
}>;
