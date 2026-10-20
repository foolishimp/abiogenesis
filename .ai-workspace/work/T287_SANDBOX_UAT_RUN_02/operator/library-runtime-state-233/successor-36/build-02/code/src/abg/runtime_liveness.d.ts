import { type BigIntStats } from "node:fs";
import { type Sha256Digest } from "../shared/digests.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { type AbgEventStore, type DurablePrefixCoordinate, type RuntimeEvent } from "./event_store.js";
import { type RuntimeInvocationScope, type RuntimeLivenessBinding, type RuntimeLivenessObserverProjection, type RuntimeProbeObservation, type RuntimeProbeSource, type RuntimeSystemProbeContract, type RuntimeLivenessReadProjection } from "./runtime_liveness_contracts.js";
/** File revision identifies the producer observation; these timestamps are
 * never an elapsed clock or an inference of liveness/termination. */
export declare function runtimeAssetRevisionDigest(stat: Pick<BigIntStats, "dev" | "ino" | "size" | "mtimeNs" | "ctimeNs">): Sha256Digest;
export interface RuntimeLivenessContext {
    readonly scope: RuntimeInvocationScope;
    readonly binding: RuntimeLivenessBinding;
    readonly probes: readonly RuntimeSystemProbeContract[];
    readonly declarationEventRef: string;
}
export interface RuntimeLivenessBudgetFacts {
    readonly remaining: number | null;
    readonly retryEligible: boolean;
    readonly continuationRef: string | null;
    readonly terminalPolicy: "block" | "escalate" | "reprice_policy";
    /** Existing CCall owner failure signal, not a worker-authored rejection. */
    readonly resultRejectionRef?: string | null;
}
export interface NativeFrameBoundarySample {
    readonly kind: "native_frame_boundary_sample";
}
export declare function captureNativeFrameBoundary(store: AbgEventStore): NativeFrameBoundarySample;
/** Captured by the opening owner before admission, retained only after commit. */
export declare function retainNativeFrameClock(store: AbgEventStore, opening: RuntimeEvent, sample: NativeFrameBoundarySample): void;
export declare function discardNativeFrameClock(store: AbgEventStore, frameId: string): void;
/** Actual owner boundary. Missing original physical capability means no fresh sample. */
export declare function observeNativeFrameLiveness(store: AbgEventStore, underlying: RuntimeEvent, sample?: NativeFrameBoundarySample, openingOrigin?: NativeFrameBoundarySample): void;
/** All native readers consume the same affected-declaration relation as replay. */
export declare function projectActorLivenessContext(prefix: ValidatedRuntimeEventPrefix, actorInvocationRef: string): RuntimeLivenessContext | null;
export declare function projectCCallLivenessContext(prefix: ValidatedRuntimeEventPrefix, cCallRef: string): RuntimeLivenessContext | null;
export declare function projectFrameLivenessContext(prefix: ValidatedRuntimeEventPrefix, frameId: string): RuntimeLivenessContext | null;
export declare function observeNativeCCallLiveness(store: AbgEventStore, underlying: RuntimeEvent): void;
export interface RuntimeLivenessSample {
    readonly clockOriginRef: string;
    readonly elapsedMs: number;
    readonly eventRef: string | null;
}
export declare function validateRuntimeLivenessEventAtPrefix(prefix: ValidatedRuntimeEventPrefix, event: RuntimeEvent, admittedAfter?: ValidatedRuntimeEventPrefix): boolean;
/** Original identity and ordinal membership prevent borrowing another event,
 * computation, or later cut. The derivation is owned by the exact source. */
export declare function createRuntimeLivenessEventValidator(prefix: ValidatedRuntimeEventPrefix): (event: RuntimeEvent) => boolean;
/** One IO-free native relation. Candidate elapsed/budget inputs are not admission authority. */
export declare function deriveRuntimeLiveness(prefix: ValidatedRuntimeEventPrefix, context: RuntimeLivenessContext, sample: RuntimeLivenessSample, selectedBudget?: RuntimeLivenessBudgetFacts): RuntimeLivenessObserverProjection | null;
/** Replay/read is as-of admitted facts and never samples a host clock or filesystem. */
export declare function projectRuntimeLivenessAtPrefix(prefix: ValidatedRuntimeEventPrefix, occurrenceRef: string, budget?: RuntimeLivenessBudgetFacts): RuntimeLivenessObserverProjection | null;
export declare function projectRuntimeLivenessForScope(prefix: ValidatedRuntimeEventPrefix, runId: string | null, graphCallId?: string): readonly RuntimeLivenessObserverProjection[];
export declare function projectNativeLivenessRead(prefix: ValidatedRuntimeEventPrefix, runId: string | null, graphCallId?: string): RuntimeLivenessReadProjection | null;
/** Owner observes one declared source, joins its actual native producer, and admits at the exact prefix. */
export declare function admitRuntimeActivityProbe(input: Readonly<{
    store: AbgEventStore;
    predecessorPrefix: DurablePrefixCoordinate;
    actorInvocationRef?: string;
    cCallRef?: string;
    source: RuntimeProbeSource;
    observation: RuntimeProbeObservation;
    eventTime: string;
    correlationId: string;
}>): import("./event_store.js").NonEmptyRuntimeEventTransactionResult<RuntimeEvent>;
/** Timers request this relation; only a current native threshold admits containment evidence. */
export declare function admitRuntimeThreshold(input: Readonly<{
    store: AbgEventStore;
    predecessorPrefix: DurablePrefixCoordinate;
    actorInvocationRef: string;
    processRef: string;
    elapsedMs: number;
    eventTime: string;
    correlationId: string;
}>): {
    kind: "runtime_threshold_not_reached";
    projection: RuntimeLivenessObserverProjection;
    event?: never;
    timeoutClass?: never;
} | {
    kind: "runtime_threshold_admitted";
    value: RuntimeEvent;
    successorPrefix: DurablePrefixCoordinate;
    projection: RuntimeLivenessObserverProjection;
    timeoutClass: "absolute" | "inactivity";
};
