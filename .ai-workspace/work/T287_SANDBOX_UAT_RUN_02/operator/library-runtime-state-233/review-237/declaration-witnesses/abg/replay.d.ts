import type { RuntimeEventPrefix } from "./event_prefix.js";
import { type SelectedActionContinuation, type ConstructionIntentContinuation } from "./construction_continuation.js";
import type { RuntimeLivenessReadProjection } from "./runtime_liveness_contracts.js";
import type { RawAdmittedValue } from "../validator/raw_admission.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { Sha256Digest } from "../shared/digests.js";
import { type WorksiteObservation } from "../product/worksite_effect.js";
import { type RuntimeHeldFluentProjection } from "./event_calculus.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { type AbgEventStore, type DurablePrefixCoordinate, type RootEventKind, type RuntimeEvent, type RuntimeEventScope } from "./event_store.js";
import type { FanOutCompletionAdmission } from "./fan_out.js";
import { type ReplayContinuationState } from "./continuation.js";
import type { ConstructionIntent, GraphSpanReentryProjection, NextActionProjection, TraversalRouteKind } from "./traversal_route.js";
export interface ReplayCCallState {
    readonly cCallRef: string;
    readonly batchRef: string | null;
    readonly taskOrdinal: number | null;
    readonly attempt: number;
    readonly programLocusRef: string;
    readonly retryPath: readonly number[];
    readonly eventKinds: readonly RootEventKind[];
    readonly evidenceRefs: readonly string[];
    readonly resultRef: string | null;
    readonly resultDigest: Sha256Digest | null;
    readonly resultClass: string | null;
    readonly resultContractRef: string | null;
    readonly resultValueKind: string | null;
    readonly resultValue: JsonValue | null;
    readonly judgmentRef: string | null;
    readonly judgment: string | null;
    readonly status: "fibre_selected" | "judged" | "opened" | "result_admitted";
}
export interface ActiveRuntimeTransactionProjection {
    readonly authorityPrefix: ValidatedRuntimeEventPrefix;
    readonly runtimePrefix: ValidatedRuntimeEventPrefix;
    readonly replayState: ReplayState;
}
/** Prefix selection does not manufacture a discarded complete replay. */
export declare function projectRuntimePrefixesAtDurablePrefix(predecessorPrefix: DurablePrefixCoordinate, runId: string): Omit<ActiveRuntimeTransactionProjection, "replayState">;
export declare function projectRuntimeTruthAtDurablePrefix(predecessorPrefix: DurablePrefixCoordinate, runId: string, priorDerivation?: ReplayState): ActiveRuntimeTransactionProjection;
/** Projects staged transaction truth without exposing raw mutable store reads. */
export declare function projectActiveRuntimeTransaction(store: AbgEventStore, durablePredecessor: DurablePrefixCoordinate, runId: string, priorDerivation?: ReplayState): ActiveRuntimeTransactionProjection;
export interface ReplayRouteState {
    readonly boundInput?: RawAdmittedValue<Readonly<Record<string, JsonValue>>>;
    readonly registeredSelectionApplicationRef?: string;
    readonly routeRef: string;
    readonly routeDigest: Sha256Digest;
    readonly routeKind: TraversalRouteKind;
    readonly declarationRef: string;
    readonly declarationDigest: Sha256Digest;
    readonly sourceCursorRef: string;
    readonly sourceCursorDigest: Sha256Digest;
    readonly targetCursorRef: string | null;
    readonly targetCursorDigest: Sha256Digest | null;
    readonly cCallRef: string | null;
    readonly judgmentRef: string | null;
    readonly consumedAvailabilityRefs: readonly string[] | null;
    readonly contractRef: string | null;
    readonly replayStateDigest: Sha256Digest | null;
    readonly nextActionProjectionRef?: string;
    readonly nextActionProjectionDigest?: Sha256Digest;
    readonly nextActionProjection?: NextActionProjection;
    readonly graphSpanReentryProjectionRef?: string;
    readonly graphSpanReentryProjectionDigest?: Sha256Digest;
    readonly graphSpanReentryProjection?: GraphSpanReentryProjection;
    readonly constructionIntentRef?: string;
    readonly constructionIntentDigest?: Sha256Digest;
    readonly constructionIntent?: ConstructionIntent;
    readonly constructionIntentAdmissionEventRef?: string;
    readonly admissionEventRef: string;
}
export interface ReplayConstructionDeltaState {
    readonly deltaRef: string;
    readonly deltaDigest: Sha256Digest;
    readonly actionEvaluationAdmissionRef: string;
    readonly actionEvaluationAdmissionDigest: Sha256Digest;
    readonly actionEvaluationAdmission: Readonly<Record<string, JsonValue>>;
    readonly actionEvaluation: Readonly<Record<string, JsonValue>>;
    readonly constructionCompositionRef: string;
    readonly constructionCompositionDigest: Sha256Digest;
    readonly constructionIntentRef: string;
    readonly constructionIntentDigest: Sha256Digest;
    readonly targetOutcomeRef: string;
    readonly edgeFulfillmentLedgerRef: string;
    readonly edgeFulfillmentLedgerDigest: Sha256Digest;
    readonly edgeClosureDecisionRef: string;
    readonly edgeClosureDecisionDigest: Sha256Digest;
    readonly edgeClosureDecision: Readonly<Record<string, JsonValue>>;
    readonly semanticEvidenceAssetRefs: readonly string[];
    readonly runtimeEvidenceEventRefs: readonly string[];
    readonly admissionEventRef: string;
}
export interface ReplayActorProcessState {
    readonly actorInvocationRef: string;
    readonly actorRef: string | null;
    readonly transportBindingRef: string | null;
    readonly transportBindingDigest: Sha256Digest | null;
    readonly processRef: string | null;
    readonly streamEventRefs: readonly string[];
    readonly timeoutClass: "absolute" | "inactivity" | null;
    readonly timedOut: boolean;
    readonly signalSequence: readonly string[];
    readonly exitStatus: number | null;
    readonly exitSignal: string | null;
    readonly terminationConfirmed: boolean;
    readonly transportDigest: Sha256Digest | null;
    readonly status: "active" | "closed" | "failed";
}
export interface ReplayCurrentWorksiteObservation {
    readonly observation: WorksiteObservation;
    readonly sourceEventRef: string;
}
export interface RunQuiescenceProjection {
    readonly kind: "run_quiescence_projection";
    readonly runId: string;
    readonly prefixDigest: Sha256Digest;
    readonly rootGraphCallId: string | null;
    readonly rootFrameId: string | null;
    readonly terminalRouteRef: string | null;
    readonly terminalCCallRef: string | null;
    readonly disposition: "active" | "invalid" | "non_quiescent" | "quiescent_for_close";
    readonly blockingFluents: readonly string[];
}
export declare function projectRunQuiescence(prefix: ValidatedRuntimeEventPrefix): RunQuiescenceProjection;
export interface ReplayState {
    readonly nativeLiveness?: RuntimeLivenessReadProjection;
    readonly kind: "replay_state";
    readonly schemaVersion: "5.0.0";
    readonly replayRef: string;
    readonly replayDigest: Sha256Digest;
    readonly eventStoreDigest: Sha256Digest;
    readonly eventCount: number;
    readonly lastAdmissionOrdinal: number;
    readonly runId: string | null;
    readonly graphCallId: string | null;
    readonly frameId: string | null;
    readonly traversalCursorRef: string | null;
    readonly traversalCursorDigest: Sha256Digest | null;
    readonly traversalCursorEventRef: string | null;
    readonly cCalls: readonly ReplayCCallState[];
    readonly routes: readonly ReplayRouteState[];
    readonly constructionDeltas: readonly ReplayConstructionDeltaState[];
    readonly fanOutCompletions: readonly FanOutCompletionAdmission[];
    readonly continuations: readonly (ReplayContinuationState | ConstructionIntentContinuation | SelectedActionContinuation)[];
    readonly actorProcesses: readonly ReplayActorProcessState[];
    readonly currentWorksiteObservations: readonly ReplayCurrentWorksiteObservation[];
    readonly activeFluents: readonly string[];
    readonly terminalReachedEventRef: string | null;
    readonly frameClosedEventRef: string | null;
    readonly graphCallClosedEventRef: string | null;
    readonly runClosedEventRef: string | null;
    readonly runStoppedEventRef: string | null;
    readonly runStoppedDisposition: string | null;
    readonly invocationRefusalEventRef: string | null;
    readonly runtimeFailureEventRef: string | null;
    readonly runtimeStatus: "active" | "blocked" | "closed" | "failed" | "gap_stopped" | "held" | "refused" | "stopped" | "workspace";
}
export declare function replay(store: AbgEventStore, scope?: RuntimeEventScope): ReplayState;
/** The route's existing replay relation, independently consumable by historical authentication. */
export declare function projectReplayRouteAtPrefix(prefix: ValidatedRuntimeEventPrefix, event: RuntimeEvent, authorityPrefix?: ValidatedRuntimeEventPrefix): ReplayRouteState;
export declare function replayValidatedRuntimeEventPrefix(prefix: ValidatedRuntimeEventPrefix, authorityPrefix?: ValidatedRuntimeEventPrefix, priorDerivation?: ReplayState): ReplayState;
/** Preserve the complete owner validation path, without materializing/hashing a
 * complete ReplayState when only one authenticated historical route is consumed. */
export declare function projectValidatedReplayRouteAtPrefix(prefix: ValidatedRuntimeEventPrefix, admissionEventRef: string, authorityPrefix?: ValidatedRuntimeEventPrefix): ReplayRouteState | undefined;
export interface RunSemanticReplayPhysicalEventCoordinate {
    readonly eventRef: string;
    readonly eventId: string;
    readonly admissionOrdinal: number;
    readonly payloadDigest: Sha256Digest;
}
export interface RunSemanticReplayPhysicalCoordinates {
    readonly kind: "run_semantic_replay_physical_coordinates";
    readonly fullEventHistoryDigest: Sha256Digest;
    readonly scopedEventStoreDigest: Sha256Digest;
    readonly scopedReplayRef: string;
    readonly scopedReplayDigest: Sha256Digest;
    readonly events: readonly RunSemanticReplayPhysicalEventCoordinate[];
}
export interface RunSemanticEventAtom {
    readonly atomRef: string;
    readonly eventKind: RootEventKind;
    readonly semanticPayloadDigest: Sha256Digest;
    readonly eventTime: string;
    readonly correlationId: string;
    readonly workflowVersion: RuntimeEvent["workflowVersion"];
    readonly aggregateType: RuntimeEvent["aggregateType"];
    readonly aggregateId: string;
    readonly parentAggregateId: string | null;
    readonly scopeClass: RuntimeEvent["scopeClass"];
    readonly basisId: string | null;
    readonly runId: string | null;
    readonly graphFunctionRef: string | null;
    readonly materializationRef: string | null;
    readonly graphCallId: string | null;
    readonly frameId: string | null;
}
export interface RunSemanticRelationEdge {
    readonly sourceAtom: string;
    readonly relation: string;
    readonly targetAtom: string;
}
export interface RunSemanticRelationView {
    readonly kind: "run_semantic_relation_view";
    readonly schemaVersion: "5.0.0";
    readonly viewRef: string;
    readonly viewDigest: Sha256Digest;
    readonly eventContractDigest: Sha256Digest;
    readonly runId: string;
    readonly eventCount: number;
    readonly eventKinds: readonly RootEventKind[];
    readonly eventAtoms: readonly RunSemanticEventAtom[];
    readonly relations: readonly RunSemanticRelationEdge[];
    readonly ownerFacts: readonly Readonly<Record<string, JsonValue>>[];
    readonly lifecycle: Readonly<Record<string, JsonValue>>;
    readonly outcome: Readonly<Record<string, JsonValue>>;
    readonly holdsAt: readonly JsonValue[];
    readonly runtimeStatus: ReplayState["runtimeStatus"];
    readonly physicalCoordinates: RunSemanticReplayPhysicalCoordinates;
}
export type RunSemanticReplayProjection = RunSemanticRelationView;
/** Route-grade identity only. Reuse the live prefix index and the same semantic
 * payload owner as Public reads; no traversal, raw-input or Run reconstruction.
 * Native Run identity is an admitted opening field, never parsed from a URI. */
export declare function projectRunIdentityAtPrefix(prefix: ValidatedRuntimeEventPrefix, runId: string): Readonly<{
    run: {
        ref: string;
        digest: `sha256:${string}`;
    };
    nativeRun: {
        ref: string;
        digest: `sha256:${string}`;
    };
    executionBasis: {
        ref: string;
        digest: `sha256:${string}`;
    };
    runOpenEventRef: string;
}> | null;
/**
 * Projects one Run as a single replay-owned semantic relation view. Runtime
 * carriers remain immutable physical truth; only closed typed event-reference
 * paths become positional relation edges. Product-owned JSON is never walked.
 * An existing held coordinate only reidentifies historical source cuts; raw or
 * closed-owner callers retain the same complete cold authentication.
 */
export declare function projectRunSemanticReplayProjection(fullPrefix: ValidatedRuntimeEventPrefix, runId: string, currentOwnerPrefix?: DurablePrefixCoordinate): RunSemanticRelationView;
/** One replay-owned derivation for the read owner's joined projections. */
export declare function projectRunReplayContext(fullPrefix: ValidatedRuntimeEventPrefix, runId: string, currentOwnerPrefix?: DurablePrefixCoordinate): Readonly<{
    semanticReplay: RunSemanticRelationView;
    prefix: RuntimeEventPrefix;
    replay: ReplayState;
    calculus: RuntimeHeldFluentProjection;
}> | null;
