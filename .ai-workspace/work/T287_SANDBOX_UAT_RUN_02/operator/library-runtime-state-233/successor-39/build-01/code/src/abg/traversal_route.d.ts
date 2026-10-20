import { type RawAdmittedValue } from "../validator/raw_admission.js";
import type { FanOutApplication, GraphFunction, GtlGraph, RecurseApplication } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { Sha256Digest } from "../shared/digests.js";
import { type AdmittedCCallJudgment, type AdmittedCCallResult, type CCall, type CCallRuntimeFailureSource } from "./c_call.js";
import type { FanOutCompletionAdmission } from "./fan_out.js";
import type { FhInteractionResumeAdmission } from "./continuation.js";
import { type ApplicationChildFoldbackAdmission, type ApplicationChildPreparationRefusalAdmission } from "./graph_application.js";
import { type ExecutionBasis, type RuntimeAdmissionBasis } from "./execution_basis.js";
import { AbgEventStore, type DurablePrefixCoordinate, type RuntimeEvent } from "./event_store.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { type ReplayState } from "./replay.js";
import { type CompletedRetryProgressPlan, type RetryAttemptAdmission, type RetryAdmissionRefusal, type RetryCompletedProgressAdmission, type RetryProgressAdmission, type RetryRuntimeFailureTransitionPlan, type RetryStoppedProgressAdmission, type RetrySuccessfulExitEvidence } from "./retry.js";
import { type TraversalTransitionCandidate } from "./traversal_transition.js";
import { type TraversalCursorCandidate } from "./traversal_cursor.js";
export type TraversalRouteKind = "advance" | "re_enter" | "retry" | "hold" | "gap_stop" | "blocked" | "failed" | "terminal";
export interface RouteCandidate {
    readonly kind: "traversal_route_candidate";
    readonly schemaVersion: "5.0.0";
    readonly candidateRef: string;
    readonly candidateDigest: Sha256Digest;
    readonly routeKind: TraversalRouteKind;
    readonly declarationRef: string;
    readonly declarationDigest: Sha256Digest;
    readonly sourceCursorRef: string;
    readonly sourceCursorDigest: Sha256Digest;
    readonly targetCursorRef: string | null;
    readonly targetCursorDigest: Sha256Digest | null;
    readonly cCallRef: string | null;
    readonly judgmentRef: string | null;
    readonly consumedAvailabilityRefs: readonly string[];
    readonly contractRef: string | null;
    readonly replayStateDigest: Sha256Digest;
    readonly boundInput?: RawAdmittedValue<Readonly<Record<string, JsonValue>>>;
    readonly registeredSelectionApplicationRef?: string;
    readonly nextActionProjectionRef?: string;
    readonly nextActionProjectionDigest?: Sha256Digest;
    readonly nextActionProjection?: Readonly<Record<string, JsonValue>>;
    readonly graphSpanReentryProjectionRef?: string;
    readonly graphSpanReentryProjectionDigest?: Sha256Digest;
    readonly graphSpanReentryProjection?: Readonly<Record<string, JsonValue>>;
}
export interface AdmittedRoute {
    readonly kind: "admitted_traversal_route";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
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
    readonly consumedAvailabilityRefs: readonly string[];
    readonly contractRef: string | null;
    readonly replayStateDigest: Sha256Digest;
    readonly constructionIntentRef: string | null;
    readonly constructionIntentDigest: Sha256Digest | null;
    readonly constructionIntentAdmissionEventRef: string | null;
    readonly admissionEventRef: string;
    readonly runStoppedEventRef: string | null;
    readonly boundInput?: RawAdmittedValue<Readonly<Record<string, JsonValue>>>;
    readonly registeredSelectionApplicationRef?: string;
    readonly nextActionProjectionRef?: string;
    readonly nextActionProjectionDigest?: Sha256Digest;
    readonly nextActionProjection?: NextActionProjection;
    readonly graphSpanReentryProjectionRef?: string;
    readonly graphSpanReentryProjectionDigest?: Sha256Digest;
    readonly graphSpanReentryProjection?: GraphSpanReentryProjection;
}
export interface GraphSpanReentryProjection {
    readonly kind: "graph_span_selection";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "re_enter";
    readonly projectionRef: string;
    readonly projectionDigest: Sha256Digest;
    readonly applicationRef: string;
    readonly graphFunctionRef: string;
    readonly sourceProgramLocusRef: string;
    readonly targetProgramLocusRef: string;
    readonly targetInputRef: string;
    readonly targetInputDigest: Sha256Digest;
    readonly targetInput: Readonly<Record<string, JsonValue>>;
}
export interface SelectedNextActionProjection {
    readonly kind: "next_action_projection";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "selected";
    readonly projectionRef: string;
    readonly projectionDigest: Sha256Digest;
    readonly targetOutcomeRef: string;
    readonly selectedActionRef: string;
    readonly actionKind: string;
    readonly programRef: string;
    readonly graphFunctionRef: string;
    readonly targetProgramLocusRef: string;
    readonly targetObligationRefs: readonly string[];
    readonly targetObligationBindings: readonly Readonly<Record<string, JsonValue>>[];
    readonly priorityProjection: Readonly<Record<string, JsonValue>>;
    readonly inputAssetRefs: readonly string[];
    readonly outputAssetRefs: readonly string[];
    readonly gapRef: string;
    readonly expectedDeltaRef: string;
    readonly progressConditionRef: string;
    readonly stopConditionRef: string;
    readonly lawfulBasisRefs: readonly string[];
    readonly rejectedAlternativeRefs: readonly string[];
    readonly nextActionBasisRef: string;
    readonly nextActionBasisDigest: Sha256Digest;
}
export interface NoActionNextActionProjection {
    readonly kind: "next_action_projection";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "no_action";
    readonly noActionDisposition: NoActionDisposition;
    readonly projectionRef: string;
    readonly projectionDigest: Sha256Digest;
    readonly targetOutcomeRef: string;
    readonly programRef: string;
    readonly gapRef: string;
    readonly targetObligationRefs: readonly string[];
    readonly targetObligationBindings: readonly Readonly<Record<string, JsonValue>>[];
    readonly priorityProjection: Readonly<Record<string, JsonValue>>;
    readonly missingAssetRefs: readonly string[];
    readonly reasonRef: string;
    readonly lawfulBasisRefs: readonly string[];
    readonly rejectedActionRefs: readonly string[];
    readonly nextActionBasisRef: string;
    readonly nextActionBasisDigest: Sha256Digest;
}
export type NoActionDisposition = "gap_stop" | "reprice_required" | "repair" | "inspect_runtime_archive" | "reprice" | "escalate";
export type NextActionProjection = NoActionNextActionProjection | SelectedNextActionProjection;
export interface ConstructionIntent {
    readonly kind: "construction_intent";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly constructionIntentRef: string;
    readonly constructionIntentDigest: Sha256Digest;
    readonly nextActionProjectionRef: string;
    readonly nextActionProjectionDigest: Sha256Digest;
    readonly nextActionBasisRef: string;
    readonly nextActionBasisDigest: Sha256Digest;
    readonly targetOutcomeRef: string;
    readonly selectedActionRef: string;
    readonly actionKind: string;
    readonly selectedGraphFunctionRef: string;
    readonly targetProgramLocusRef: string;
    readonly targetInputRef: string | null;
    readonly targetInputDigest: Sha256Digest | null;
    readonly targetInput: Readonly<Record<string, JsonValue>> | null;
    readonly targetObligationRefs: readonly string[];
    readonly inputAssetRefs: readonly string[];
    readonly outputAssetRefs: readonly string[];
    readonly expectedDeltaRef: string;
    readonly progressConditionRef: string;
    readonly stopConditionRef: string;
    readonly actionCatalogRef: string;
    readonly actionCatalogDigest: Sha256Digest;
    readonly actionCatalogRowDigest: Sha256Digest;
    readonly constructionCompositionRef: string;
    readonly constructionCompositionDigest: Sha256Digest;
    readonly nextActionAuthorityRef: string;
    readonly workspaceBindingId: string;
    readonly workspaceBindingDigest: Sha256Digest;
    readonly invocationAdmissionRef: string;
    readonly invocationRef: string;
    readonly invocationDigest: Sha256Digest;
    readonly programRef: string;
    readonly programDigest: Sha256Digest;
    readonly graphFunctionRef: string;
    readonly graphFunctionDigest: Sha256Digest;
    readonly executionBasisRef: string;
    readonly executionBasisDigest: Sha256Digest;
    readonly runId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly sourceCCallRef: string;
    readonly sourceResultRef: string;
    readonly sourceResultDigest: Sha256Digest;
    readonly sourceJudgmentRef: string;
    readonly targetCursorRef: string;
    readonly targetCursorDigest: Sha256Digest;
}
export interface ConstructionIntentAdmission extends ConstructionIntent {
    readonly admissionEventRef: string;
}
export interface RouteAdmissionRefusal {
    readonly kind: "traversal_route_admission_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "basis_mismatch" | "candidate_mismatch" | "cursor_mismatch" | "gap_environment_mismatch" | "gap_projection_mismatch" | "gap_semantics_mismatch" | "graph_span_reentry_mismatch" | "judgment_mismatch" | "replay_mismatch" | "route_already_admitted" | "route_kind_not_supported" | "terminal_not_declared";
    readonly message: string;
}
export type RouteAdmissionResult = AdmittedRoute | RouteAdmissionRefusal;
export interface RouteAdmissionEvidence {
    readonly evidenceClass: "judged";
    readonly graphFunction: Readonly<GraphFunction>;
    readonly cCall: CCall;
    readonly result: AdmittedCCallResult;
    readonly judgment: AdmittedCCallJudgment;
    readonly completedProgresses: readonly RetryCompletedProgressAdmission[];
}
export interface BlockedRouteAdmissionEvidence {
    readonly evidenceClass: "blocked";
    readonly graphFunction: Readonly<GraphFunction>;
    readonly cCall: CCall;
    readonly resultRef: string;
    readonly judgmentRef: string;
    readonly judgmentEventRef: string;
    readonly reasonRef: string;
    readonly stoppedProgresses: readonly RetryStoppedProgressAdmission[];
}
export interface HoldRouteAdmissionEvidence {
    readonly evidenceClass: "hold";
    readonly graphFunction: Readonly<GraphFunction>;
    readonly cCall: CCall;
    readonly result: AdmittedCCallResult;
    readonly judgment: AdmittedCCallJudgment;
}
export interface InteractionResumeRouteAdmissionEvidence {
    readonly evidenceClass: "interaction_resume";
    readonly graphFunction: Readonly<GraphFunction>;
    readonly cCall: CCall;
    readonly result: AdmittedCCallResult;
    readonly judgment: AdmittedCCallJudgment;
    readonly resume: FhInteractionResumeAdmission;
    readonly completedProgresses: readonly RetryCompletedProgressAdmission[];
}
export interface RetryRouteAdmissionEvidence {
    readonly evidenceClass: "retry";
    readonly graphFunction: Readonly<GraphFunction>;
    readonly cCall: CCall;
    readonly progress: RetryProgressAdmission;
}
export interface FanOutRouteAdmissionEvidence {
    readonly evidenceClass: "fan_out";
    readonly graphFunction: Readonly<GraphFunction>;
    readonly cCall: CCall;
    readonly result: AdmittedCCallResult;
    readonly judgment: AdmittedCCallJudgment;
    readonly application: Readonly<FanOutApplication>;
    readonly completion: FanOutCompletionAdmission;
    readonly completedProgresses: readonly RetryCompletedProgressAdmission[];
}
export interface StructuralIdentityRouteAdmissionEvidence {
    readonly evidenceClass: "structural_identity";
    readonly graphFunction: Readonly<GraphFunction>;
    readonly completionClass: "structural_identity_success";
    readonly completionWitnessEventRef: string;
    readonly completedProgresses: readonly RetryCompletedProgressAdmission[];
}
export interface RouteAdmissionOptions {
    readonly terminalizeRun?: boolean;
}
export interface RecursionRouteAdmissionEvidence {
    readonly evidenceClass: "recursion";
    readonly application: Readonly<RecurseApplication>;
    readonly cCall: CCall;
    readonly result: AdmittedCCallResult;
    readonly judgment: AdmittedCCallJudgment;
    readonly foldback: ApplicationChildFoldbackAdmission | null;
    readonly preparationRefusal: ApplicationChildPreparationRefusalAdmission | null;
}
export interface HistoricalTraversalRouteProjection {
    readonly kind: "historical_traversal_route_projection";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "projected";
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
    readonly consumedAvailabilityRefs: readonly string[];
    readonly contractRef: string | null;
    readonly replayStateDigest: Sha256Digest;
    readonly admissionEventRef: string;
    readonly admissionOrdinal: number;
    readonly causationEventRefs: readonly string[];
    readonly runId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly executionBasisRef: string;
    readonly materializationRef: string;
    readonly boundInput?: RawAdmittedValue<Readonly<Record<string, JsonValue>>>;
    readonly registeredSelectionApplicationRef?: string;
    readonly nextActionProjectionRef?: string;
    readonly nextActionProjectionDigest?: Sha256Digest;
    readonly nextActionProjection?: NextActionProjection;
    readonly graphSpanReentryProjectionRef?: string;
    readonly graphSpanReentryProjectionDigest?: Sha256Digest;
    readonly graphSpanReentryProjection?: GraphSpanReentryProjection;
}
export type DeclaredStructuralAdvanceRoute = HistoricalTraversalRouteProjection & Readonly<{
    readonly routeKind: "advance";
    readonly targetCursorRef: string;
    readonly targetCursorDigest: Sha256Digest;
    readonly cCallRef: null;
    readonly judgmentRef: null;
    readonly consumedAvailabilityRefs: readonly [];
    readonly contractRef: null;
}>;
export interface DeclaredStructuralAdvanceProjection {
    readonly kind: "declared_structural_advance_projection";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "projected";
    readonly route: DeclaredStructuralAdvanceRoute;
    readonly sourceCursor: TraversalCursorCandidate;
    readonly targetCursor: TraversalCursorCandidate;
}
export declare function projectHistoricalTraversalRouteAtPrefix(prefix: ValidatedRuntimeEventPrefix, admissionEventRef: string, authorityPrefix?: ValidatedRuntimeEventPrefix): HistoricalTraversalRouteProjection | null;
export declare function projectHistoricalTraversalRoutesAtPrefix(prefix: ValidatedRuntimeEventPrefix, authorityPrefix?: ValidatedRuntimeEventPrefix): readonly HistoricalTraversalRouteProjection[] | null;
export declare function projectAdmittedRouteAtPrefix(prefix: ValidatedRuntimeEventPrefix, admissionEventRef: string, authorityPrefix?: ValidatedRuntimeEventPrefix): AdmittedRoute | null;
export declare function isAdmittedRoute(prefix: ValidatedRuntimeEventPrefix, route: AdmittedRoute, authorityPrefix?: ValidatedRuntimeEventPrefix): boolean;
export declare function isCurrentRecursionRouteSourceAtPrefix(prefix: ValidatedRuntimeEventPrefix, coordinates: Readonly<{
    runId: string;
    frameId: string;
    sourceCursorRef: string;
}>): boolean;
export declare function rehydrateConstructionIntentForCursorAtDurablePrefix(predecessorPrefix: DurablePrefixCoordinate, cursor: TraversalCursorCandidate): ConstructionIntentAdmission | null;
export declare function rehydrateConstructionIntentForCursorAtPrefix(prefix: ValidatedRuntimeEventPrefix, cursor: TraversalCursorCandidate): ConstructionIntentAdmission | null;
export declare function deriveGraphFunctionActionEvaluationBasis(predecessorPrefix: DurablePrefixCoordinate, executionBasis: ExecutionBasis, cursor: TraversalCursorCandidate, input: Readonly<{
    childGraphFunctionRef: string;
    childResultRef: string;
    childResultValue: Readonly<Record<string, JsonValue>>;
    childJudgmentRef: string;
    childClosureRef: string;
}>): Readonly<Record<string, JsonValue>> | null;
export declare function hasResolvedRunConstructionIntentLineage(events: readonly RuntimeEvent[], runId: string, constructionCompositionRef: string, constructionCompositionDigest: string, continuedUse?: ExecutionBasis["constructionContinuationUse"]): boolean;
export declare function projectDeclaredStructuralAdvanceAtPrefix(prefix: ValidatedRuntimeEventPrefix, graph: Readonly<GtlGraph>, graphFunction: Readonly<GraphFunction>, sourceCursor: TraversalCursorCandidate, admissionEventRef: string, authorityPrefix?: ValidatedRuntimeEventPrefix): DeclaredStructuralAdvanceProjection | null;
type RetainedCCallInput = Readonly<{
    registeredSelectionApplicationRef?: string;
    input: RawAdmittedValue<Readonly<Record<string, JsonValue>>>;
    causationEventRefs: readonly string[];
}>;
/** Pure owner derivation. The existing prefix computation territory retains
 * only this exact immutable relation. A new cut or changed/raw input must
 * discharge every admission and child-foldback premise again. Nothing here
 * admits an input, authorizes an effect, or replaces current route admission. */
export declare function deriveRetainedCCallInputAtPrefix(prefix: ValidatedRuntimeEventPrefix, basis: ExecutionBasis | string, graph: Readonly<GtlGraph>, source: TraversalCursorCandidate, cCall: CCall, result: AdmittedCCallResult, judgment: AdmittedCCallJudgment): RetainedCCallInput | null;
export interface RouteTransitionAdmission {
    readonly kind: "route_transition_admission";
    readonly route: AdmittedRoute;
    readonly retryAttempt: RetryAttemptAdmission | null;
    readonly replayState: ReplayState;
    readonly successorPrefix: DurablePrefixCoordinate;
}
export type RouteTransitionResult = RouteTransitionAdmission | RetryAdmissionRefusal | RouteAdmissionRefusal;
export interface StagedRouteTransitionAdmission {
    readonly kind: "staged_route_transition_admission";
    readonly route: AdmittedRoute;
    readonly retryAttempt: RetryAttemptAdmission | null;
    readonly replayState: ReplayState;
    readonly runtimePrefix: ValidatedRuntimeEventPrefix;
}
export type StagedRouteTransitionResult = StagedRouteTransitionAdmission | RetryAdmissionRefusal | RouteAdmissionRefusal;
export interface AdmitTraversalTransitionInput {
    readonly predecessorPrefix: DurablePrefixCoordinate;
    store: AbgEventStore;
    executionBasis: ExecutionBasis;
    graph: Readonly<GtlGraph>;
    graphFunction: Readonly<GraphFunction>;
    source: TraversalCursorCandidate;
    target: TraversalCursorCandidate | null;
    candidate: TraversalTransitionCandidate;
    basis: RuntimeAdmissionBasis;
}
export interface StageTraversalTransitionInput extends Omit<AdmitTraversalTransitionInput, "predecessorPrefix"> {
    readonly durablePredecessorPrefix: DurablePrefixCoordinate;
    readonly stagedPrefix: ValidatedRuntimeEventPrefix;
    readonly priorDerivation?: ReplayState;
}
/**
 * Stages one completed HoG transition inside the caller-owned ABG transaction.
 * The caller supplies both the exact durable transaction base and the exact
 * transaction-local predecessor. ABG validates but never selects the route.
 */
export declare function admitTraversalTransitionInActiveTransaction(input: Readonly<StageTraversalTransitionInput>): StagedRouteTransitionResult;
/**
 * Atomically admits one transition already derived by HoG from the exact GTL
 * topology. ABG validates the completed candidate against admitted runtime
 * truth at the caller-selected immutable prefix; it never selects a route
 * variant or derives a successor.
 */
export declare function admitTraversalTransition(input: Readonly<AdmitTraversalTransitionInput>): RouteTransitionResult;
export interface AdmitCompletedRetryTraversalTransitionInput extends AdmitTraversalTransitionInput {
    readonly progressPlan: CompletedRetryProgressPlan;
    readonly completion: RetrySuccessfulExitEvidence;
    readonly progressBasis: RuntimeAdmissionBasis;
}
/**
 * Atomically admits the pre-effect completed-retry progress plan and its one
 * HoG-selected consuming route. HoG supplies candidates; ABG alone owns the
 * combined expected-prefix commit and revalidates both relations.
 */
export declare function admitCompletedRetryTraversalTransition(input: Readonly<AdmitCompletedRetryTraversalTransitionInput>): RouteTransitionResult;
export interface AdmitBlockedRetryTraversalTransitionInput extends AdmitTraversalTransitionInput {
    readonly failureSource: CCallRuntimeFailureSource;
    readonly failureCandidate: JsonValue;
    readonly failureValueKind: string;
    readonly failureBasis: RuntimeAdmissionBasis;
    readonly failurePlan: RetryRuntimeFailureTransitionPlan;
}
/**
 * Atomically admits one planned blocked runtime-failure closure and its one
 * HoG-selected consuming route. The caller supplies selection; ABG rederives
 * and commits the complete event relation at the exact predecessor.
 */
export declare function admitBlockedRetryTraversalTransition(input: Readonly<AdmitBlockedRetryTraversalTransitionInput>): RouteTransitionResult;
export {};
