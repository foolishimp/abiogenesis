import type { GraphFunction, GtlGraph, GtlProgram } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type RuntimeLivenessBudgetFacts } from "./runtime_liveness.js";
import type { RuntimeInvocationScope } from "./runtime_liveness_contracts.js";
import type { AdmittedCCallRuntimeFailureClose, AdmittedCCallJudgment, AdmittedCCallResult, CCall, CCallPhaseProjection, CCallRuntimeFailureSource } from "./c_call.js";
import type { FhInteractionResumeAdmission } from "./continuation.js";
import type { CompleteFanOutAdmission } from "./fan_out.js";
import { type ExecutionBasis, type RuntimeAdmissionBasis } from "./execution_basis.js";
import { AbgEventStore, type DurablePrefixCoordinate, type RuntimeEvent, type RuntimeEventCandidate } from "./event_store.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { type ReplayState } from "./replay.js";
import { type TraversalCursorCandidate } from "./traversal_cursor.js";
import { type DeclaredStructuralAdvanceProjection, type HistoricalTraversalRouteProjection } from "./traversal_route.js";
import { type WorkerTransportFailureClass } from "./transport_contracts.js";
export { WORKER_TRANSPORT_FAILURE_CLASS_VALUES as RETRYABLE_RUNTIME_FAILURE_CLASS_VALUES, type WorkerTransportFailureClass as RetryableRuntimeFailureClass, } from "./transport_contracts.js";
export interface RetryInputBasis {
    readonly inputRef: string;
    readonly inputDigest: Sha256Digest;
    readonly inputContractRef: string;
    readonly inputValue: Readonly<Record<string, JsonValue>>;
}
export interface RetryEligibility {
    readonly kind: "retry_eligibility";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "retry" | "budget_exhausted" | "not_in_retry" | "not_retryable" | "replay_gap" | "stationary";
    readonly retryBoundaryRef: string | null;
    readonly retryTermPath: readonly string[];
    readonly wrappedTermPath: readonly string[];
    readonly attempt: number;
    readonly budget: number;
    readonly remainingBudget: number;
    readonly failureClass: WorkerTransportFailureClass;
    readonly failureSignalRef: string;
    readonly completedAttempts: readonly number[];
    readonly priorProgressRefs: readonly string[];
}
export interface RetryAttemptAdmission {
    readonly kind: "retry_attempt_admission";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly attemptRef: string;
    readonly attemptDigest: Sha256Digest;
    readonly attemptManifestRef: string;
    readonly retryBoundaryRef: string;
    readonly retryTermPath: readonly string[];
    readonly wrappedTermPath: readonly string[];
    readonly taskOrdinal: number | null;
    readonly attempt: number;
    readonly retryPath: readonly number[];
    readonly budget: number;
    readonly inputRef: string;
    readonly inputDigest: Sha256Digest;
    readonly inputContractRef: string;
    readonly inputValue: Readonly<Record<string, JsonValue>>;
    readonly retryableFailureClasses: readonly WorkerTransportFailureClass[];
    readonly priorJudgmentRef: string | null;
    readonly priorRouteRef: string;
    readonly admissionEventRef: string;
}
interface RetryProgressAdmissionBase {
    readonly kind: "retry_progress_admission";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly progressRef: string;
    readonly progressDigest: Sha256Digest;
    readonly progressClass: "retry" | "stopped" | "completed";
    readonly retryBoundaryRef: string;
    readonly attemptRef: string;
    readonly attempt: number;
    readonly retryPath: readonly number[];
    readonly admissionEventRef: string;
}
interface RetryFailureProgressAdmissionBase extends RetryProgressAdmissionBase {
    readonly cCallRef: string;
    readonly resultRef: string;
    readonly judgmentRef: string;
    readonly budget: number;
    readonly failureClass: WorkerTransportFailureClass;
    readonly failureSignalRef: string;
    readonly completedAttempts: readonly number[];
    readonly remainingBudget: number;
    readonly inputRef: string;
    readonly inputDigest: Sha256Digest;
    readonly inputContractRef: string;
}
export interface RetryContinuationProgressAdmission extends RetryFailureProgressAdmissionBase {
    readonly progressClass: "retry";
}
export interface RetryStoppedProgressAdmission extends RetryFailureProgressAdmissionBase {
    readonly progressClass: "stopped";
    readonly stopReason: "boundary_terminal" | "propagated_inner_stop";
    readonly predecessorProgressRef: string | null;
}
export type RetryBoundaryStoppedProgressAdmission = RetryStoppedProgressAdmission & Readonly<{
    readonly stopReason: "boundary_terminal";
    readonly predecessorProgressRef: null;
}>;
export type RetryPropagatedStoppedProgressAdmission = RetryStoppedProgressAdmission & Readonly<{
    readonly stopReason: "propagated_inner_stop";
    readonly predecessorProgressRef: string;
}>;
interface RetryCompletedProgressAdmissionBase extends RetryProgressAdmissionBase {
    readonly progressClass: "completed";
    readonly completedRetryDepth: number;
    readonly completionClass: RetrySuccessCompletionClass;
    readonly completionWitnessEventRef: string;
    readonly sourceCursorRef: string;
    readonly sourceCursorDigest: Sha256Digest;
    readonly targetCursorRef: string | null;
    readonly targetCursorDigest: Sha256Digest | null;
    readonly predecessorProgressRef: string | null;
}
export type RetrySuccessCompletionClass = "judged_success" | "fan_out_success" | "fh_resume_success" | "structural_identity_success";
export interface RetryCCallCompletedProgressAdmission extends RetryCompletedProgressAdmissionBase {
    readonly completionClass: "judged_success" | "fan_out_success" | "fh_resume_success";
    readonly cCallRef: string;
    readonly resultRef: string;
    readonly judgmentRef: string;
}
export interface RetryStructuralCompletedProgressAdmission extends RetryCompletedProgressAdmissionBase {
    readonly completionClass: "structural_identity_success";
}
export type RetryCompletedProgressAdmission = RetryCCallCompletedProgressAdmission | RetryStructuralCompletedProgressAdmission;
export interface CompletedRetryProgressPlan {
    readonly kind: "completed_retry_progress_plan";
    readonly schemaVersion: "5.0.0";
    readonly predecessorEventDigest: Sha256Digest;
    readonly eventCandidates: readonly RuntimeEventCandidate[];
    readonly projectedEvents: readonly RuntimeEvent[];
    readonly progresses: readonly RetryCompletedProgressAdmission[];
    readonly projectedPrefix: ValidatedRuntimeEventPrefix;
    readonly replayState: ReplayState;
}
export type RetrySuccessfulExitEvidence = Readonly<{
    completionClass: "judged_success";
    cCall: CCall;
    result: AdmittedCCallResult;
    judgment: AdmittedCCallJudgment;
}> | Readonly<{
    completionClass: "fan_out_success";
    cCall: CCall;
    result: AdmittedCCallResult;
    judgment: AdmittedCCallJudgment;
    completion: CompleteFanOutAdmission;
}> | Readonly<{
    completionClass: "fh_resume_success";
    cCall: CCall;
    result: AdmittedCCallResult;
    judgment: AdmittedCCallJudgment;
    resume: FhInteractionResumeAdmission;
}> | Readonly<{
    completionClass: "structural_identity_success";
    completionWitnessEventRef: string;
}>;
export type RetryProgressAdmission = RetryContinuationProgressAdmission | RetryStoppedProgressAdmission | RetryCompletedProgressAdmission;
export interface RetryAdmissionRefusal {
    readonly kind: "retry_admission_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "attempt_mismatch" | "basis_mismatch" | "cursor_mismatch" | "judgment_mismatch" | "progress_mismatch" | "retry_not_declared" | "route_mismatch";
    readonly message: string;
}
export type RetryAttemptAdmissionResult = RetryAttemptAdmission | RetryAdmissionRefusal;
export interface RetryRuntimeFailureTransitionAdmission {
    readonly kind: "retry_runtime_failure_transition_admission";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "retry";
    readonly close: AdmittedCCallRuntimeFailureClose;
    readonly progress: RetryContinuationProgressAdmission;
    readonly stoppedProgresses: readonly [];
    readonly eligibility: RetryEligibility;
    readonly successorPrefix: DurablePrefixCoordinate;
}
export interface StagedRetryRuntimeFailureTransitionAdmission {
    readonly kind: "retry_runtime_failure_transition_admission";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "blocked" | "retry";
    readonly close: AdmittedCCallRuntimeFailureClose;
    readonly progress: RetryContinuationProgressAdmission | RetryStoppedProgressAdmission;
    readonly stoppedProgresses: readonly RetryStoppedProgressAdmission[];
    readonly eligibility: RetryEligibility;
}
export interface RetryRuntimeFailureTransitionPlan {
    readonly kind: "retry_runtime_failure_transition_plan";
    readonly schemaVersion: "5.0.0";
    readonly predecessorEventDigest: Sha256Digest;
    readonly eventCandidates: readonly RuntimeEventCandidate[];
    readonly projectedEvents: readonly RuntimeEvent[];
    readonly transition: StagedRetryRuntimeFailureTransitionAdmission;
    readonly projectedPrefix: ValidatedRuntimeEventPrefix;
    readonly replayState: ReplayState;
}
export type RetryRuntimeFailureTransitionResult = RetryRuntimeFailureTransitionAdmission | RetryAdmissionRefusal;
export type RetryFrontierSourceEventKind = "retry_attempt_opened" | "c_call_opened" | "c_call_fibre_selected" | "c_call_evidenced" | "c_call_result_admitted" | "c_call_judged" | "retry_progress_recorded";
export interface RetryFrontierSource {
    readonly eventRef: string;
    readonly admissionOrdinal: number;
    readonly payloadDigest: Sha256Digest;
    readonly eventKind: RetryFrontierSourceEventKind;
    readonly ownerSurface: "abg_retry" | "abg_c_call";
}
export interface RetryAttemptFrontierRow {
    readonly kind: "retry_attempt_frontier_row";
    readonly schemaVersion: "5.0.0";
    readonly rowRef: string;
    readonly rowDigest: Sha256Digest;
    readonly retryBoundaryRef: string;
    readonly attempt: number;
    readonly retryPath: readonly number[];
    readonly attemptRef: string;
    readonly attemptDigest: Sha256Digest;
    readonly cCallRef: string;
    readonly cCallDigest: Sha256Digest;
    readonly progressRef: string;
    readonly progressDigest: Sha256Digest;
    readonly reasonClass: WorkerTransportFailureClass;
    readonly failureSignalRef: string;
    readonly inputContractRef: string;
    readonly inputRef: string;
    readonly inputDigest: Sha256Digest;
    readonly sources: Readonly<{
        attempt: RetryFrontierSource;
        cCallOpened: RetryFrontierSource;
        fibreSelected: RetryFrontierSource;
        evidence: RetryFrontierSource | null;
        result: RetryFrontierSource;
        judgment: RetryFrontierSource;
        progress: RetryFrontierSource;
    }>;
}
export interface RetryAttemptFrontier {
    readonly kind: "retry_attempt_frontier";
    readonly schemaVersion: "5.0.0";
    readonly isFullFrontier: true;
    readonly frontierRef: string;
    readonly frontierDigest: Sha256Digest;
    readonly declaredFrontierRef: string;
    readonly declaredFrontierDigest: Sha256Digest;
    readonly retryBoundaryRef: string;
    readonly runId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly rows: readonly RetryAttemptFrontierRow[];
    readonly attemptCoverage: readonly number[];
    readonly reasonClasses: readonly WorkerTransportFailureClass[];
    readonly ownerSurfaces: readonly ("abg_retry" | "abg_c_call")[];
    readonly sourceEventKinds: readonly RetryFrontierSourceEventKind[];
}
export interface RetryFrontierSelector {
    readonly kind: "retry_frontier_selector";
    readonly schemaVersion: "5.0.0";
    readonly runId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly retryBoundaryRef: string;
    readonly retryProgressRef: string;
}
export interface ProjectExecutableRetryInputRequest {
    readonly prefix: DurablePrefixCoordinate;
    readonly selector: RetryFrontierSelector;
    readonly program: Readonly<GtlProgram>;
    readonly graphFunction: Readonly<GraphFunction>;
    readonly graph: Readonly<GtlGraph>;
}
export interface ExecutableRetryInput {
    readonly kind: "executable_retry_input";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "projected";
    readonly projectionRef: string;
    readonly projectionDigest: Sha256Digest;
    readonly durablePrefixDigest: Sha256Digest;
    readonly lastAdmissionOrdinal: number;
    readonly selector: RetryFrontierSelector;
    readonly executionBasisRef: string;
    readonly executionBasisDigest: Sha256Digest;
    readonly traversalScopeRef: string;
    readonly traversalScopeDigest: Sha256Digest;
    readonly programRef: string;
    readonly programDigest: Sha256Digest;
    readonly graphFunctionRef: string;
    readonly graphFunctionDigest: Sha256Digest;
    readonly graphRef: string;
    readonly graphDigest: Sha256Digest;
    readonly retryFrontier: RetryAttemptFrontier;
    readonly selectedFrontierRowRef: string;
    readonly progressEventRef: string;
    readonly progress: RetryContinuationProgressAdmission;
    readonly sourceAttemptEventRef: string;
    readonly sourceAttempt: RetryAttemptAdmission;
    readonly sourceCursor: TraversalCursorCandidate;
    readonly cCall: CCall;
    readonly inputContractRef: string;
    readonly inputRef: string;
    readonly inputDigest: Sha256Digest;
    readonly inputValue: Readonly<Record<string, JsonValue>>;
    readonly nextAttempt: number;
    readonly nextRetryPath: readonly number[];
}
export interface ProjectedRetryResumeSuccess {
    readonly kind: "projected_retry_resume";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "resumed";
    readonly executableRetryInputRef: string;
    readonly executableRetryInputDigest: Sha256Digest;
    readonly retryFrontierRef: string;
    readonly retryFrontierDigest: Sha256Digest;
    readonly selectedFrontierRowRef: string;
    readonly progressEventRef: string;
    readonly routeAdmissionEventRef: string;
    readonly routeRef: string;
    readonly routeDigest: Sha256Digest;
    readonly nextCursor: TraversalCursorCandidate;
    readonly retryAttemptAdmissionEventRef: string;
    readonly retryAttemptRef: string;
    readonly retryAttemptDigest: Sha256Digest;
    readonly nextAttempt: number;
    readonly inputContractRef: string;
    readonly inputRef: string;
    readonly inputDigest: Sha256Digest;
    readonly inputValue: Readonly<Record<string, JsonValue>>;
    readonly successorPrefix: DurablePrefixCoordinate;
}
export interface RehydratedProjectedRetryResume {
    readonly cursor: TraversalCursorCandidate;
    readonly executionBasis: ExecutionBasis;
}
export type ExecutableRetryInputRefusalCode = "prefix_mismatch" | "basis_mismatch" | "frontier_absent" | "frontier_ambiguous" | "frontier_stale" | "frontier_lineage_mismatch" | "retry_declaration_mismatch" | "preimage_absent" | "preimage_digest_mismatch" | "preimage_contract_mismatch" | "retry_not_permitted";
export interface ExecutableRetryInputRefusal {
    readonly kind: "executable_retry_input_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: ExecutableRetryInputRefusalCode;
    readonly message: string;
    readonly selector: RetryFrontierSelector;
    readonly suppliedPrefixDigest: Sha256Digest | null;
    readonly citedSourceEventRefs: readonly string[];
}
export type ProjectExecutableRetryInputResult = ExecutableRetryInput | ExecutableRetryInputRefusal;
export declare function isProjectedRetryResumeCarrier(value: unknown): value is ProjectedRetryResumeSuccess;
export declare function projectRetryResumeAtDurablePrefix(carrier: ProjectedRetryResumeSuccess, expectedExecutionBasis: ExecutionBasis, graph: Readonly<GtlGraph>, graphFunction: Readonly<GraphFunction>): RehydratedProjectedRetryResume | null;
export declare function deriveRetryAttemptManifestRef(input: Readonly<{
    retryBoundaryRef: string;
    executionBasisRef: string;
    inputContractRef: string;
    inputRef: string;
    inputDigest: Sha256Digest;
    attempt: number;
    retryPath: readonly number[];
}>): string;
export interface DeclaredRetryAttemptCoordinates {
    readonly retryBoundaryRef: string;
    readonly retryTermPath: readonly string[];
    readonly wrappedTermPath: readonly string[];
    readonly taskOrdinal: number | null;
    readonly retryDepth: number;
    readonly budget: number;
    readonly inputCarrierRef: string;
}
export declare function projectDeclaredRetryAttemptCoordinates(graph: Readonly<GtlGraph>, cursor: TraversalCursorCandidate): DeclaredRetryAttemptCoordinates | null;
export interface DeclaredCRetryCCallSelectedPhase {
    readonly kind: "declared_c_retry_c_call_phase";
    readonly schemaVersion: "5.0.0";
    readonly phase: "selected_no_evidence" | "evidencing";
    readonly sourceCursor: TraversalCursorCandidate;
    readonly cCall: CCall;
    readonly phaseProjection: CCallPhaseProjection;
    readonly result: null;
    readonly judgment: null;
}
export interface DeclaredCRetryCCallResultPhase {
    readonly kind: "declared_c_retry_c_call_phase";
    readonly schemaVersion: "5.0.0";
    readonly phase: "result_admitted";
    readonly sourceCursor: TraversalCursorCandidate;
    readonly cCall: CCall;
    readonly phaseProjection: CCallPhaseProjection;
    readonly result: AdmittedCCallResult;
    readonly judgment: null;
}
export interface DeclaredCRetryCCallJudgedPhase {
    readonly kind: "declared_c_retry_c_call_phase";
    readonly schemaVersion: "5.0.0";
    readonly phase: "judged";
    readonly sourceCursor: TraversalCursorCandidate;
    readonly cCall: CCall;
    readonly phaseProjection: CCallPhaseProjection;
    readonly result: AdmittedCCallResult;
    readonly judgment: AdmittedCCallJudgment;
}
export type DeclaredCRetryCCallPhase = DeclaredCRetryCCallSelectedPhase | DeclaredCRetryCCallResultPhase | DeclaredCRetryCCallJudgedPhase;
interface DeclaredCRetryAttemptRowBase {
    readonly schemaVersion: "5.0.0";
    readonly attempt: RetryAttemptAdmission;
    readonly attemptEventRef: string;
    readonly attemptAdmissionOrdinal: number;
    readonly attemptManifestRef: string;
    readonly originRoute: DeclaredCRetryAttemptOrigin;
    readonly cursor: TraversalCursorCandidate;
}
export type DeclaredCRetryAttemptOrigin = HistoricalTraversalRouteProjection & Readonly<{
    readonly routeKind: "retry";
    readonly targetCursorRef: string;
    readonly targetCursorDigest: Sha256Digest;
    readonly cCallRef: string | null;
    readonly judgmentRef: string | null;
    readonly contractRef: string | null;
}>;
export type DeclaredCRetryRetryConsumption = HistoricalTraversalRouteProjection & Readonly<{
    readonly routeKind: "retry";
    readonly targetCursorRef: string;
    readonly targetCursorDigest: Sha256Digest;
    readonly cCallRef: string;
    readonly judgmentRef: string;
    readonly consumedAvailabilityRefs: readonly [string, string];
    readonly contractRef: string;
}>;
export type DeclaredCRetryExitConsumption = HistoricalTraversalRouteProjection & Readonly<{
    readonly routeKind: "advance" | "terminal" | "blocked" | "failed";
}>;
export type DeclaredCRetryProspectiveCCall = Readonly<{
    readonly kind: "declared_c_retry_prospective_c_call";
    readonly schemaVersion: "5.0.0";
    readonly callClass: "leaf" | "workflow";
    readonly cCallRef: string;
    readonly cCallDigest: Sha256Digest;
    readonly programLocusRef: string;
    readonly nodeRef: string;
    readonly termPath: readonly string[];
    readonly taskOrdinal: number | null;
    readonly attempt: number;
    readonly retryPath: readonly number[];
    readonly cursorRef: string;
    readonly cursorDigest: Sha256Digest;
}> | Readonly<{
    readonly kind: "declared_c_retry_prospective_structural_identity";
    readonly schemaVersion: "5.0.0";
    readonly nodeRef: string;
    readonly termPath: readonly string[];
    readonly taskOrdinal: number | null;
    readonly attempt: number;
    readonly retryPath: readonly number[];
    readonly cursorRef: string;
    readonly cursorDigest: Sha256Digest;
}>;
export interface DeclaredCRetryPreCCallAttemptRow extends DeclaredCRetryAttemptRowBase {
    readonly kind: "declared_c_retry_pre_c_call_attempt";
    readonly currentCursor: TraversalCursorCandidate;
    readonly cCallState: Readonly<{
        readonly kind: "not_open";
        readonly cursorRef: string;
        readonly cursorDigest: Sha256Digest;
        readonly prospective: DeclaredCRetryProspectiveCCall;
    }>;
    readonly cCalls: readonly DeclaredCRetryCCallPhase[];
    readonly structuralAdvanceLineage: readonly DeclaredStructuralAdvanceProjection[];
    readonly progress: null;
    readonly consumption: Readonly<{
        readonly kind: "attempt_active";
    }>;
}
export interface DeclaredCRetryActiveCCallAttemptRow extends DeclaredCRetryAttemptRowBase {
    readonly kind: "declared_c_retry_active_c_call_attempt";
    readonly currentCursor: TraversalCursorCandidate;
    readonly cCalls: readonly DeclaredCRetryCCallPhase[];
    readonly structuralAdvanceLineage: readonly DeclaredStructuralAdvanceProjection[];
    readonly progress: null;
    readonly consumption: Readonly<{
        readonly kind: "attempt_active" | "fh_pending" | "workflow_pending";
    }>;
}
export interface DeclaredCRetryNestedActiveAttemptRow extends DeclaredCRetryAttemptRowBase {
    readonly kind: "declared_c_retry_nested_active_attempt";
    readonly currentCursor: TraversalCursorCandidate;
    readonly cCalls: readonly DeclaredCRetryCCallPhase[];
    readonly structuralAdvanceLineage: readonly DeclaredStructuralAdvanceProjection[];
    readonly inner: DeclaredCRetryActiveFrontier;
    readonly progress: null;
    readonly consumption: Readonly<{
        readonly kind: "attempt_active";
    }>;
}
interface DeclaredCRetryProgressRowBase extends DeclaredCRetryAttemptRowBase {
    readonly cCalls: readonly DeclaredCRetryCCallPhase[];
    readonly structuralAdvanceLineage: readonly DeclaredStructuralAdvanceProjection[];
    readonly progressEventRef: string;
}
export interface DeclaredCRetryRetryProgressRow extends DeclaredCRetryProgressRowBase {
    readonly kind: "declared_c_retry_retry_progress";
    readonly progress: RetryContinuationProgressAdmission;
    readonly failureCCall: DeclaredCRetryCCallJudgedPhase;
    readonly consumption: Readonly<{
        readonly kind: "progress_available";
    }> | Readonly<{
        readonly kind: "progress_consumed_by_retry";
        readonly route: DeclaredCRetryRetryConsumption;
    }>;
}
export interface DeclaredCRetryBoundaryStoppedProgressRow extends DeclaredCRetryProgressRowBase {
    readonly kind: "declared_c_retry_boundary_stopped_progress";
    readonly progress: RetryBoundaryStoppedProgressAdmission;
    readonly failureCCall: DeclaredCRetryCCallJudgedPhase;
    readonly consumption: Readonly<{
        readonly kind: "progress_available";
    }> | Readonly<{
        readonly kind: "progress_consumed_by_exit";
        readonly route: DeclaredCRetryExitConsumption;
    }>;
}
export interface DeclaredCRetryPropagatedStoppedProgressRow extends DeclaredCRetryAttemptRowBase {
    readonly kind: "declared_c_retry_propagated_stopped_progress";
    readonly cCalls: readonly [];
    readonly progress: RetryPropagatedStoppedProgressAdmission;
    readonly progressEventRef: string;
    readonly predecessor: DeclaredCRetryBoundaryStoppedProgressRow | DeclaredCRetryPropagatedStoppedProgressRow;
    readonly consumption: Readonly<{
        readonly kind: "progress_available";
    }> | Readonly<{
        readonly kind: "progress_consumed_by_exit";
        readonly route: DeclaredCRetryExitConsumption;
    }>;
}
export interface DeclaredCRetryCCallCompletedProgressRow extends DeclaredCRetryProgressRowBase {
    readonly kind: "declared_c_retry_c_call_completed_progress";
    readonly progress: RetryCCallCompletedProgressAdmission;
    readonly completionCCall: DeclaredCRetryCCallJudgedPhase;
    readonly consumption: Readonly<{
        readonly kind: "progress_available";
    }> | Readonly<{
        readonly kind: "progress_consumed_by_exit";
        readonly route: DeclaredCRetryExitConsumption;
    }>;
}
export interface DeclaredCRetryPropagatedCompletedProgressRow extends DeclaredCRetryAttemptRowBase {
    readonly kind: "declared_c_retry_propagated_completed_progress";
    readonly cCalls: readonly [];
    readonly progress: RetryCompletedProgressAdmission & Readonly<{
        readonly predecessorProgressRef: string;
    }>;
    readonly progressEventRef: string;
    readonly predecessor: DeclaredCRetryCCallCompletedProgressRow | DeclaredCRetryStructuralCompletedProgressRow | DeclaredCRetryPropagatedCompletedProgressRow;
    readonly consumption: Readonly<{
        readonly kind: "progress_available";
    }> | Readonly<{
        readonly kind: "progress_consumed_by_exit";
        readonly route: DeclaredCRetryExitConsumption;
    }>;
}
export interface DeclaredCRetryStructuralCompletedProgressRow extends DeclaredCRetryAttemptRowBase {
    readonly kind: "declared_c_retry_structural_completed_progress";
    readonly cCalls: readonly [];
    readonly structuralAdvanceLineage: readonly DeclaredStructuralAdvanceProjection[];
    readonly progress: RetryStructuralCompletedProgressAdmission;
    readonly progressEventRef: string;
    readonly completionWitnessEventRef: string;
    readonly consumption: Readonly<{
        readonly kind: "progress_available";
    }> | Readonly<{
        readonly kind: "progress_consumed_by_exit";
        readonly route: DeclaredCRetryExitConsumption;
    }>;
}
export type DeclaredCRetryAttemptRow = DeclaredCRetryPreCCallAttemptRow | DeclaredCRetryActiveCCallAttemptRow | DeclaredCRetryNestedActiveAttemptRow | DeclaredCRetryRetryProgressRow | DeclaredCRetryBoundaryStoppedProgressRow | DeclaredCRetryPropagatedStoppedProgressRow | DeclaredCRetryCCallCompletedProgressRow | DeclaredCRetryPropagatedCompletedProgressRow | DeclaredCRetryStructuralCompletedProgressRow;
interface DeclaredCRetryFrontierBase {
    readonly schemaVersion: "5.0.0";
    readonly disposition: "projected";
    readonly projectionRef: string;
    readonly projectionDigest: Sha256Digest;
    readonly selectedPrefixDigest: Sha256Digest;
    readonly lastAdmissionOrdinal: number;
    readonly runId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly graphRef: string;
    readonly retryBoundaryRef: string;
    readonly retryTermPath: readonly string[];
    readonly wrappedTermPath: readonly string[];
    readonly taskOrdinal: number | null;
    readonly retryDepth: number;
    readonly budget: number;
    readonly inputCarrierRef: string;
    readonly attemptCoverage: readonly number[];
    readonly progressCoverage: readonly number[];
    readonly rows: readonly DeclaredCRetryAttemptRow[];
    readonly remainingBudget: number;
}
export interface DeclaredCRetryEligibleFrontier extends DeclaredCRetryFrontierBase {
    readonly kind: "declared_c_retry_eligible_frontier";
    readonly state: "eligible";
    readonly nextAttempt: number;
    readonly currentCursor: TraversalCursorCandidate;
    readonly eligibilityRoute: DeclaredCRetryAttemptOrigin | DeclaredCRetryRetryConsumption;
    readonly latestFailure: RetryContinuationProgressAdmission | null;
    readonly stationarity: Readonly<{
        readonly kind: "not_stationary";
    }> | Readonly<{
        readonly kind: "stationary";
        readonly failureSignalRef: string;
        readonly priorProgressRef: string;
        readonly currentProgressRef: string;
    }>;
}
export interface DeclaredCRetryActiveFrontier extends DeclaredCRetryFrontierBase {
    readonly kind: "declared_c_retry_active_frontier";
    readonly state: "attempt_active";
    readonly active: DeclaredCRetryPreCCallAttemptRow | DeclaredCRetryActiveCCallAttemptRow | DeclaredCRetryNestedActiveAttemptRow;
}
export interface DeclaredCRetryAvailableProgressFrontier extends DeclaredCRetryFrontierBase {
    readonly kind: "declared_c_retry_available_progress_frontier";
    readonly state: "progress_available";
    readonly available: DeclaredCRetryRetryProgressRow | DeclaredCRetryBoundaryStoppedProgressRow | DeclaredCRetryPropagatedStoppedProgressRow | DeclaredCRetryCCallCompletedProgressRow | DeclaredCRetryPropagatedCompletedProgressRow | DeclaredCRetryStructuralCompletedProgressRow;
}
export interface DeclaredCRetryConsumedFrontier extends DeclaredCRetryFrontierBase {
    readonly kind: "declared_c_retry_consumed_frontier";
    readonly state: "progress_consumed";
    readonly consumed: DeclaredCRetryBoundaryStoppedProgressRow | DeclaredCRetryPropagatedStoppedProgressRow | DeclaredCRetryCCallCompletedProgressRow | DeclaredCRetryPropagatedCompletedProgressRow | DeclaredCRetryStructuralCompletedProgressRow;
}
export type DeclaredCRetryFrontier = DeclaredCRetryEligibleFrontier | DeclaredCRetryActiveFrontier | DeclaredCRetryAvailableProgressFrontier | DeclaredCRetryConsumedFrontier;
export interface DeclaredCRetryProspectiveCCallCandidate {
    readonly kind: "declared_c_retry_prospective_c_call_candidate";
    readonly cCallRef: string;
    readonly cCallDigest: Sha256Digest;
}
export type DeclaredCRetryCCallCandidate = CCall | DeclaredCRetryProspectiveCCallCandidate;
export declare function projectRetryAttempt(prefix: ValidatedRuntimeEventPrefix, graph: Readonly<GtlGraph>, admissionEventRef: string): RetryAttemptAdmission | null;
export declare function projectDeclaredCRetryFrontier(prefix: ValidatedRuntimeEventPrefix, graph: Readonly<GtlGraph>, cursor: TraversalCursorCandidate, graphFunction: Readonly<GraphFunction>, retryDepth?: number, authorityPrefix?: ValidatedRuntimeEventPrefix): DeclaredCRetryFrontier | null;
export type DeclaredCRetryExitProgressProjection = Readonly<{
    kind: "declared_c_retry_exit_progress";
    schemaVersion: "5.0.0";
    progressClass: "none";
    exitedRetryDepths: readonly number[];
    progresses: readonly [];
}> | Readonly<{
    kind: "declared_c_retry_exit_progress";
    schemaVersion: "5.0.0";
    progressClass: "completed";
    exitedRetryDepths: readonly number[];
    progresses: readonly RetryCompletedProgressAdmission[];
}> | Readonly<{
    kind: "declared_c_retry_exit_progress";
    schemaVersion: "5.0.0";
    progressClass: "stopped";
    exitedRetryDepths: readonly number[];
    progresses: readonly RetryStoppedProgressAdmission[];
}>;
/**
 * Projects the one retry-owner progress chain for a GTL topology exit. Route
 * admission compares this owner projection; it must not recalculate retry
 * partitions or frontier ordering itself.
 */
export declare function projectDeclaredCRetryExitProgress(prefix: ValidatedRuntimeEventPrefix, graph: Readonly<GtlGraph>, graphFunction: Readonly<GraphFunction>, sourceCursor: TraversalCursorCandidate, targetCursor: TraversalCursorCandidate | null, authorityPrefix?: ValidatedRuntimeEventPrefix): DeclaredCRetryExitProgressProjection | null;
export declare function projectDeclaredCRetryCCallWriteAtPrefix(prefix: ValidatedRuntimeEventPrefix, authorityPrefix: ValidatedRuntimeEventPrefix, graph: Readonly<GtlGraph>, graphFunction: Readonly<GraphFunction>, cursor: TraversalCursorCandidate, candidate: DeclaredCRetryCCallCandidate, phase: CCallPhaseProjection["phase"]): DeclaredCRetryActiveFrontier | null;
export declare function assertFullRetryAttemptFrontier(frontier: RetryAttemptFrontier): asserts frontier is RetryAttemptFrontier;
export declare function projectExecutableRetryInput(request: ProjectExecutableRetryInputRequest): ProjectExecutableRetryInputResult;
export declare function admitRetryAttempt(store: AbgEventStore, prefix: ValidatedRuntimeEventPrefix, executionBasis: ExecutionBasis, graph: Readonly<GtlGraph>, graphFunction: Readonly<GraphFunction>, cursor: TraversalCursorCandidate, inputValue: Readonly<Record<string, JsonValue>>, routeAdmissionEventRef: string, basis: RuntimeAdmissionBasis): RetryAttemptAdmissionResult;
export declare function projectRetryEligibility(prefix: ValidatedRuntimeEventPrefix, graph: Readonly<GtlGraph>, graphFunction: Readonly<GraphFunction>, cursor: TraversalCursorCandidate, failureClass: WorkerTransportFailureClass, failureSignalRef: string): RetryEligibility;
/** Descriptive budget facts from existing native CRetry records. This helper
 * deliberately calls neither replay nor eligibility nor liveness. Actual retry
 * admission still verifies the full declared frontier, cursor and failure. */
export declare function projectRuntimeRetryBudgetFacts(prefix: ValidatedRuntimeEventPrefix, scope: RuntimeInvocationScope): RuntimeLivenessBudgetFacts;
export declare function planRetryRuntimeFailureTransition(store: AbgEventStore, prefix: ValidatedRuntimeEventPrefix, executionBasis: ExecutionBasis, graph: Readonly<GtlGraph>, graphFunction: Readonly<GraphFunction>, cursor: TraversalCursorCandidate, cCall: CCall, source: CCallRuntimeFailureSource, failureCandidate: JsonValue, failureValueKind: string, basis: RuntimeAdmissionBasis): RetryRuntimeFailureTransitionPlan | RetryAdmissionRefusal;
export declare function admitPlannedRetryRuntimeFailureTransitionInActiveTransaction(store: AbgEventStore, prefix: ValidatedRuntimeEventPrefix, executionBasis: ExecutionBasis, graph: Readonly<GtlGraph>, graphFunction: Readonly<GraphFunction>, cursor: TraversalCursorCandidate, cCall: CCall, source: CCallRuntimeFailureSource, failureCandidate: JsonValue, failureValueKind: string, basis: RuntimeAdmissionBasis, plan: RetryRuntimeFailureTransitionPlan): StagedRetryRuntimeFailureTransitionAdmission | RetryAdmissionRefusal;
export declare function admitRetryRuntimeFailureTransition(store: AbgEventStore, prefix: ValidatedRuntimeEventPrefix, executionBasis: ExecutionBasis, graph: Readonly<GtlGraph>, graphFunction: Readonly<GraphFunction>, cursor: TraversalCursorCandidate, cCall: CCall, source: CCallRuntimeFailureSource, failureCandidate: JsonValue, failureValueKind: string, basis: RuntimeAdmissionBasis): RetryRuntimeFailureTransitionResult;
/** Topology alone can discharge the absence of completed retry progress.
 * Route admission still owns the source, outcome, target and current cut. */
export declare function hasNoCompletedRetryExit(graph: Readonly<GtlGraph>, source: TraversalCursorCandidate, target: TraversalCursorCandidate | null): boolean;
export declare function planCompletedRetryProgress(predecessorPrefix: DurablePrefixCoordinate, graph: Readonly<GtlGraph>, graphFunction: Readonly<GraphFunction>, sourceCursor: TraversalCursorCandidate, targetCursor: TraversalCursorCandidate | null, completion: RetrySuccessfulExitEvidence, basis: RuntimeAdmissionBasis): CompletedRetryProgressPlan | RetryAdmissionRefusal;
/**
 * Admits exactly one pre-effect completed-retry plan inside the ABG transaction
 * that also admits its consuming HoG route. The plan is reprojected from the
 * durable predecessor before any event is staged.
 */
export declare function admitPlannedCompletedRetryProgressInActiveTransaction(store: AbgEventStore, predecessorPrefix: DurablePrefixCoordinate, graph: Readonly<GtlGraph>, graphFunction: Readonly<GraphFunction>, sourceCursor: TraversalCursorCandidate, targetCursor: TraversalCursorCandidate | null, completion: RetrySuccessfulExitEvidence, basis: RuntimeAdmissionBasis, plan: CompletedRetryProgressPlan): readonly RetryCompletedProgressAdmission[] | RetryAdmissionRefusal;
