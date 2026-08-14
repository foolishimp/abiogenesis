import type {
  FanOutApplication,
  GraphFunction,
  GtlGraph,
  GtlProgram,
} from "../gtl/contracts.js";
import {
  isExecutableCLeaf,
  type CProgramNode,
} from "../gtl/c_algebra.js";
import {
  deriveCEnclosingRetryTopology,
  deriveCContinuationTarget,
  deriveCSourceContinuation,
  resolveEnclosingCBatchRef,
  resolveEnclosingCRetryContexts,
  resolveCProgramTermAtSourcePath,
  type CEnclosingRetryContext,
} from "../gtl/source_path.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  deriveCanonicalRootedTopologyPartition,
  type CanonicalRootedTopologyPartition,
} from "../shared/rooted_topology_partition.js";
import type {
  AdmittedCCallRuntimeFailureClose,
  AdmittedCCallJudgment,
  AdmittedCCallResult,
  CCall,
  CCallPhaseProjection,
  CCallRuntimeFailureSource,
} from "./c_call.js";
import type { FhInteractionResumeAdmission } from "./continuation.js";
import type { CompleteFanOutAdmission } from "./fan_out.js";
import { projectExactFanOutCompletion } from "./fan_out_projection.js";
import {
  admitPlannedCCallRuntimeFailureClose,
  isCCallRuntimeFailureCloseError,
  projectAdmittedCCallOutcomeAtPrefix,
  projectAdmittedCCallResultAtPrefix,
  planCCallRuntimeFailureClose,
  projectCCallCarrierPhaseAtPrefix,
  projectCCallPhase,
  projectCCallRuntimeFailureSignal,
  projectOpenedCCallCarrierAtPrefix,
} from "./c_call.js";
import {
  hasAdmittedExecutionBasis,
  rehydrateAdmittedImplementationSetAtPrefix,
  rehydrateExecutionBasis,
  rehydrateExecutionBasisAtPrefix,
  type ExecutionBasis,
  type RuntimeAdmissionBasis,
} from "./execution_basis.js";
import {
  AbgEventStore,
  admitRuntimeEvent,
  admitRuntimeEventTransactionAtExpectedPrefix,
  assertRuntimeEventTransactionActive,
  compareAndAppendExpectedPrefix,
  readRuntimeEventsAtDurablePrefix,
  type DurablePrefixCoordinate,
  type RuntimeEvent,
} from "./event_store.js";
import {
  constructRuntimeFluent,
  constructScopedRetryFluent,
  deriveRuntimeEventCalculusProjection,
  holdsAt,
  type RuntimeEventCalculusProjection,
} from "./event_calculus.js";
import { projectFhContinuations } from "./fh_continuation_projection.js";
import {
  runtimeEventsFromValidatedPrefix,
  selectValidatedRuntimeEventPrefix,
  validatedRuntimeEventPrefixThroughEvent,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import {
  hasAdmittedTraversalCursor,
  hasAdmittedTraversalCursorAtPrefix,
  isInteractionResumeCursorSuccessorAtPrefix,
  isTraversalCursorCandidate,
  traversalCursorAdmissionEventRef,
  type TraversalCursorCandidate,
} from "./traversal_cursor.js";
import {
  rehydrateOpenedTraversalScopeAtPrefix,
  type OpenedTraversalScope,
} from "./open_call.js";
import {
  projectDeclaredStructuralAdvanceAtPrefix,
  projectHistoricalTraversalRoutesAtPrefix,
  type DeclaredStructuralAdvanceProjection,
  type HistoricalTraversalRouteProjection,
} from "./traversal_route.js";
import {
  WORKER_TRANSPORT_FAILURE_CLASS_VALUES,
  type WorkerTransportFailureClass,
} from "./transport_contracts.js";

export {
  WORKER_TRANSPORT_FAILURE_CLASS_VALUES as RETRYABLE_RUNTIME_FAILURE_CLASS_VALUES,
  type WorkerTransportFailureClass as RetryableRuntimeFailureClass,
} from "./transport_contracts.js";

export interface RetryInputBasis {
  readonly inputRef: string;
  readonly inputDigest: Sha256Digest;
  readonly inputContractRef: string;
  readonly inputValue: Readonly<Record<string, JsonValue>>;
}

export interface RetryEligibility {
  readonly kind: "retry_eligibility";
  readonly schemaVersion: "5.0.0";
  readonly disposition:
    | "retry"
    | "budget_exhausted"
    | "not_in_retry"
    | "not_retryable"
    | "replay_gap"
    | "stationary";
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

interface RetryFailureProgressAdmissionBase
  extends RetryProgressAdmissionBase {
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

export interface RetryContinuationProgressAdmission
  extends RetryFailureProgressAdmissionBase {
  readonly progressClass: "retry";
}

export interface RetryStoppedProgressAdmission
  extends RetryFailureProgressAdmissionBase {
  readonly progressClass: "stopped";
  readonly stopReason: "boundary_terminal" | "propagated_inner_stop";
  readonly predecessorProgressRef: string | null;
}

export type RetryBoundaryStoppedProgressAdmission =
  RetryStoppedProgressAdmission & Readonly<{
    readonly stopReason: "boundary_terminal";
    readonly predecessorProgressRef: null;
  }>;

export type RetryPropagatedStoppedProgressAdmission =
  RetryStoppedProgressAdmission & Readonly<{
    readonly stopReason: "propagated_inner_stop";
    readonly predecessorProgressRef: string;
  }>;

interface RetryCompletedProgressAdmissionBase
  extends RetryProgressAdmissionBase {
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

export type RetrySuccessCompletionClass =
  | "judged_success"
  | "fan_out_success"
  | "fh_resume_success"
  | "structural_identity_success";

export interface RetryCCallCompletedProgressAdmission
  extends RetryCompletedProgressAdmissionBase {
  readonly completionClass:
    | "judged_success"
    | "fan_out_success"
    | "fh_resume_success";
  readonly cCallRef: string;
  readonly resultRef: string;
  readonly judgmentRef: string;
}

export interface RetryStructuralCompletedProgressAdmission
  extends RetryCompletedProgressAdmissionBase {
  readonly completionClass: "structural_identity_success";
}

export type RetryCompletedProgressAdmission =
  | RetryCCallCompletedProgressAdmission
  | RetryStructuralCompletedProgressAdmission;

export type RetrySuccessfulExitEvidence =
  | Readonly<{
    completionClass: "judged_success";
    cCall: CCall;
    result: AdmittedCCallResult;
    judgment: AdmittedCCallJudgment;
  }>
  | Readonly<{
    completionClass: "fan_out_success";
    cCall: CCall;
    result: AdmittedCCallResult;
    judgment: AdmittedCCallJudgment;
    completion: CompleteFanOutAdmission;
  }>
  | Readonly<{
    completionClass: "fh_resume_success";
    cCall: CCall;
    result: AdmittedCCallResult;
    judgment: AdmittedCCallJudgment;
    resume: FhInteractionResumeAdmission;
  }>
  | Readonly<{
    completionClass: "structural_identity_success";
    completionWitnessEventRef: string;
  }>;

export type RetryProgressAdmission =
  | RetryContinuationProgressAdmission
  | RetryStoppedProgressAdmission
  | RetryCompletedProgressAdmission;

export interface RetryAdmissionRefusal {
  readonly kind: "retry_admission_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "attempt_mismatch"
    | "basis_mismatch"
    | "cursor_mismatch"
    | "judgment_mismatch"
    | "progress_mismatch"
    | "retry_not_declared"
    | "route_mismatch";
  readonly message: string;
}

export type RetryAttemptAdmissionResult =
  | RetryAttemptAdmission
  | RetryAdmissionRefusal;

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
  readonly progress:
    | RetryContinuationProgressAdmission
    | RetryStoppedProgressAdmission;
  readonly stoppedProgresses: readonly RetryStoppedProgressAdmission[];
  readonly eligibility: RetryEligibility;
}

type StagedRetryRuntimeFailureTransitionResult =
  | StagedRetryRuntimeFailureTransitionAdmission
  | RetryAdmissionRefusal;

export type RetryRuntimeFailureTransitionResult =
  | RetryRuntimeFailureTransitionAdmission
  | RetryAdmissionRefusal;

export type RetryFrontierSourceEventKind =
  | "retry_attempt_opened"
  | "c_call_opened"
  | "c_call_fibre_selected"
  | "c_call_evidenced"
  | "c_call_result_admitted"
  | "c_call_judged"
  | "retry_progress_recorded";

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

export type ExecutableRetryInputRefusalCode =
  | "prefix_mismatch"
  | "basis_mismatch"
  | "frontier_absent"
  | "frontier_ambiguous"
  | "frontier_stale"
  | "frontier_lineage_mismatch"
  | "retry_declaration_mismatch"
  | "preimage_absent"
  | "preimage_digest_mismatch"
  | "preimage_contract_mismatch"
  | "retry_not_permitted";

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

export type ProjectExecutableRetryInputResult =
  | ExecutableRetryInput
  | ExecutableRetryInputRefusal;

function refusal(
  code: RetryAdmissionRefusal["code"],
  message: string,
): RetryAdmissionRefusal {
  return deepFreeze({
    kind: "retry_admission_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    message,
  });
}

function isExpectedPrefixMismatch(error: unknown): boolean {
  return error instanceof TypeError &&
    error.message ===
      "runtime event append requires the exact expected immutable prefix";
}

function isRecord(
  value: unknown,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type RuntimeEventWithBody = RuntimeEvent & {
  readonly payload: Readonly<Record<string, JsonValue>>;
};

function sameStrings(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return left.length === right.length &&
    left.every((value, index) => value === right[index]);
}

function sameNumbers(
  left: readonly number[],
  right: readonly number[],
): boolean {
  return left.length === right.length &&
    left.every((value, index) => value === right[index]);
}

function contextForCursor(
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursorCandidate,
): CEnclosingRetryContext | null | RetryAdmissionRefusal {
  const contexts = resolveEnclosingCRetryContexts(
    graph.template,
    cursor.currentNodeRef,
    cursor.termPath,
  );
  if ("kind" in contexts) {
    return refusal("retry_not_declared", contexts.message);
  }
  const context = contexts.at(-1);
  if (context === undefined) return null;
  if (
    context.retryDepth !== cursor.retryPath.length ||
    cursor.attempt !== cursor.retryPath.at(-1)
  ) {
    return refusal(
      "cursor_mismatch",
      "retry cursor coordinates differ from the exact enclosing GTL retry path",
    );
  }
  return context;
}

function retryBoundaryRef(
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursorCandidate,
  context: CEnclosingRetryContext,
): string {
  const digest = sha256Canonical({
    graphRef: graph.materializationRef,
    frameId: cursor.frameId,
    nodeRef: cursor.currentNodeRef,
    retryTermPath: context.retryTermPath,
    taskOrdinal: context.taskOrdinal,
  });
  return `retry-boundary://abiogenesis/${digest.slice("sha256:".length)}`;
}

export function deriveRetryAttemptManifestRef(input: Readonly<{
  retryBoundaryRef: string;
  executionBasisRef: string;
  inputContractRef: string;
  inputRef: string;
  inputDigest: Sha256Digest;
  attempt: number;
  retryPath: readonly number[];
}>): string {
  const digest = sha256Canonical(input as unknown as JsonValue);
  return `retry-attempt-manifest://abiogenesis/${digest.slice("sha256:".length)}`;
}

export interface DeclaredRetryAttemptCoordinates {
  readonly retryBoundaryRef: string;
  readonly retryTermPath: readonly string[];
  readonly wrappedTermPath: readonly string[];
  readonly taskOrdinal: number | null;
  readonly retryDepth: number;
  readonly budget: number;
  readonly inputCarrierRef: string;
}

export function projectDeclaredRetryAttemptCoordinates(
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursorCandidate,
): DeclaredRetryAttemptCoordinates | null {
  const context = contextForCursor(graph, cursor);
  if (
    context === null ||
    (typeof context === "object" && "kind" in context)
  ) return null;
  return deepFreeze({
    retryBoundaryRef: retryBoundaryRef(graph, cursor, context),
    retryTermPath: context.retryTermPath,
    wrappedTermPath: context.wrappedTermPath,
    taskOrdinal: context.taskOrdinal,
    retryDepth: context.retryDepth,
    budget: context.budget,
    inputCarrierRef: context.inputCarrierRef,
  });
}

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

export type DeclaredCRetryCCallPhase =
  | DeclaredCRetryCCallSelectedPhase
  | DeclaredCRetryCCallResultPhase
  | DeclaredCRetryCCallJudgedPhase;

interface DeclaredCRetryAttemptRowBase {
  readonly schemaVersion: "5.0.0";
  readonly attempt: RetryAttemptAdmission;
  readonly attemptEventRef: string;
  readonly attemptAdmissionOrdinal: number;
  readonly attemptManifestRef: string;
  readonly originRoute: DeclaredCRetryAttemptOrigin;
  readonly cursor: TraversalCursorCandidate;
}

export type DeclaredCRetryAttemptOrigin =
  HistoricalTraversalRouteProjection & Readonly<{
  readonly routeKind: "retry";
  readonly targetCursorRef: string;
  readonly targetCursorDigest: Sha256Digest;
  readonly cCallRef: string | null;
  readonly judgmentRef: string | null;
  readonly contractRef: string | null;
}>;

export type DeclaredCRetryRetryConsumption =
  HistoricalTraversalRouteProjection & Readonly<{
  readonly routeKind: "retry";
  readonly targetCursorRef: string;
  readonly targetCursorDigest: Sha256Digest;
  readonly cCallRef: string;
  readonly judgmentRef: string;
  readonly consumedAvailabilityRefs: readonly [string, string];
  readonly contractRef: string;
}>;

export type DeclaredCRetryExitConsumption =
  HistoricalTraversalRouteProjection & Readonly<{
  readonly routeKind: "advance" | "terminal" | "blocked" | "failed";
}>;

export type DeclaredCRetryProspectiveCCall =
  | Readonly<{
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
  }>
  | Readonly<{
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

export interface DeclaredCRetryPreCCallAttemptRow
  extends DeclaredCRetryAttemptRowBase {
  readonly kind: "declared_c_retry_pre_c_call_attempt";
  readonly currentCursor: TraversalCursorCandidate;
  readonly cCallState: Readonly<{
    readonly kind: "not_open";
    readonly cursorRef: string;
    readonly cursorDigest: Sha256Digest;
    readonly prospective: DeclaredCRetryProspectiveCCall;
  }>;
  readonly cCalls: readonly DeclaredCRetryCCallPhase[];
  readonly structuralAdvanceLineage:
    readonly DeclaredStructuralAdvanceProjection[];
  readonly progress: null;
  readonly consumption: Readonly<{ readonly kind: "attempt_active" }>;
}

export interface DeclaredCRetryActiveCCallAttemptRow
  extends DeclaredCRetryAttemptRowBase {
  readonly kind: "declared_c_retry_active_c_call_attempt";
  readonly currentCursor: TraversalCursorCandidate;
  readonly cCalls: readonly DeclaredCRetryCCallPhase[];
  readonly structuralAdvanceLineage:
    readonly DeclaredStructuralAdvanceProjection[];
  readonly progress: null;
  readonly consumption: Readonly<{
    readonly kind: "attempt_active" | "fh_pending" | "workflow_pending";
  }>;
}

export interface DeclaredCRetryNestedActiveAttemptRow
  extends DeclaredCRetryAttemptRowBase {
  readonly kind: "declared_c_retry_nested_active_attempt";
  readonly currentCursor: TraversalCursorCandidate;
  readonly cCalls: readonly DeclaredCRetryCCallPhase[];
  readonly structuralAdvanceLineage:
    readonly DeclaredStructuralAdvanceProjection[];
  readonly inner: DeclaredCRetryActiveFrontier;
  readonly progress: null;
  readonly consumption: Readonly<{ readonly kind: "attempt_active" }>;
}

interface DeclaredCRetryProgressRowBase
  extends DeclaredCRetryAttemptRowBase {
  readonly cCalls: readonly DeclaredCRetryCCallPhase[];
  readonly structuralAdvanceLineage:
    readonly DeclaredStructuralAdvanceProjection[];
  readonly progressEventRef: string;
}

export interface DeclaredCRetryRetryProgressRow
  extends DeclaredCRetryProgressRowBase {
  readonly kind: "declared_c_retry_retry_progress";
  readonly progress: RetryContinuationProgressAdmission;
  readonly failureCCall: DeclaredCRetryCCallJudgedPhase;
  readonly consumption:
    | Readonly<{ readonly kind: "progress_available" }>
    | Readonly<{
      readonly kind: "progress_consumed_by_retry";
      readonly route: DeclaredCRetryRetryConsumption;
    }>;
}

export interface DeclaredCRetryBoundaryStoppedProgressRow
  extends DeclaredCRetryProgressRowBase {
  readonly kind: "declared_c_retry_boundary_stopped_progress";
  readonly progress: RetryBoundaryStoppedProgressAdmission;
  readonly failureCCall: DeclaredCRetryCCallJudgedPhase;
  readonly consumption:
    | Readonly<{ readonly kind: "progress_available" }>
    | Readonly<{
      readonly kind: "progress_consumed_by_exit";
      readonly route: DeclaredCRetryExitConsumption;
    }>;
}

export interface DeclaredCRetryPropagatedStoppedProgressRow
  extends DeclaredCRetryAttemptRowBase {
  readonly kind: "declared_c_retry_propagated_stopped_progress";
  readonly cCalls: readonly [];
  readonly progress: RetryPropagatedStoppedProgressAdmission;
  readonly progressEventRef: string;
  readonly predecessor: DeclaredCRetryBoundaryStoppedProgressRow |
    DeclaredCRetryPropagatedStoppedProgressRow;
  readonly consumption:
    | Readonly<{ readonly kind: "progress_available" }>
    | Readonly<{
      readonly kind: "progress_consumed_by_exit";
      readonly route: DeclaredCRetryExitConsumption;
    }>;
}

export interface DeclaredCRetryCCallCompletedProgressRow
  extends DeclaredCRetryProgressRowBase {
  readonly kind: "declared_c_retry_c_call_completed_progress";
  readonly progress: RetryCCallCompletedProgressAdmission;
  readonly completionCCall: DeclaredCRetryCCallJudgedPhase;
  readonly consumption:
    | Readonly<{ readonly kind: "progress_available" }>
    | Readonly<{
      readonly kind: "progress_consumed_by_exit";
      readonly route: DeclaredCRetryExitConsumption;
    }>;
}

export interface DeclaredCRetryPropagatedCompletedProgressRow
  extends DeclaredCRetryAttemptRowBase {
  readonly kind: "declared_c_retry_propagated_completed_progress";
  readonly cCalls: readonly [];
  readonly progress: RetryCompletedProgressAdmission & Readonly<{
    readonly predecessorProgressRef: string;
  }>;
  readonly progressEventRef: string;
  readonly predecessor:
    | DeclaredCRetryCCallCompletedProgressRow
    | DeclaredCRetryStructuralCompletedProgressRow
    | DeclaredCRetryPropagatedCompletedProgressRow;
  readonly consumption:
    | Readonly<{ readonly kind: "progress_available" }>
    | Readonly<{
      readonly kind: "progress_consumed_by_exit";
      readonly route: DeclaredCRetryExitConsumption;
    }>;
}

export interface DeclaredCRetryStructuralCompletedProgressRow
  extends DeclaredCRetryAttemptRowBase {
  readonly kind: "declared_c_retry_structural_completed_progress";
  readonly cCalls: readonly [];
  readonly structuralAdvanceLineage:
    readonly DeclaredStructuralAdvanceProjection[];
  readonly progress: RetryStructuralCompletedProgressAdmission;
  readonly progressEventRef: string;
  readonly completionWitnessEventRef: string;
  readonly consumption:
    | Readonly<{ readonly kind: "progress_available" }>
    | Readonly<{
      readonly kind: "progress_consumed_by_exit";
      readonly route: DeclaredCRetryExitConsumption;
    }>;
}

export type DeclaredCRetryAttemptRow =
  | DeclaredCRetryPreCCallAttemptRow
  | DeclaredCRetryActiveCCallAttemptRow
  | DeclaredCRetryNestedActiveAttemptRow
  | DeclaredCRetryRetryProgressRow
  | DeclaredCRetryBoundaryStoppedProgressRow
  | DeclaredCRetryPropagatedStoppedProgressRow
  | DeclaredCRetryCCallCompletedProgressRow
  | DeclaredCRetryPropagatedCompletedProgressRow
  | DeclaredCRetryStructuralCompletedProgressRow;

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

export interface DeclaredCRetryEligibleFrontier
  extends DeclaredCRetryFrontierBase {
  readonly kind: "declared_c_retry_eligible_frontier";
  readonly state: "eligible";
  readonly nextAttempt: number;
  readonly currentCursor: TraversalCursorCandidate;
  readonly eligibilityRoute: DeclaredCRetryAttemptOrigin |
    DeclaredCRetryRetryConsumption;
  readonly latestFailure: RetryContinuationProgressAdmission | null;
  readonly stationarity:
    | Readonly<{ readonly kind: "not_stationary" }>
    | Readonly<{
      readonly kind: "stationary";
      readonly failureSignalRef: string;
      readonly priorProgressRef: string;
      readonly currentProgressRef: string;
    }>;
}

export interface DeclaredCRetryActiveFrontier
  extends DeclaredCRetryFrontierBase {
  readonly kind: "declared_c_retry_active_frontier";
  readonly state: "attempt_active";
  readonly active: DeclaredCRetryPreCCallAttemptRow |
    DeclaredCRetryActiveCCallAttemptRow |
    DeclaredCRetryNestedActiveAttemptRow;
}

export interface DeclaredCRetryAvailableProgressFrontier
  extends DeclaredCRetryFrontierBase {
  readonly kind: "declared_c_retry_available_progress_frontier";
  readonly state: "progress_available";
  readonly available:
    | DeclaredCRetryRetryProgressRow
    | DeclaredCRetryBoundaryStoppedProgressRow
    | DeclaredCRetryPropagatedStoppedProgressRow
    | DeclaredCRetryCCallCompletedProgressRow
    | DeclaredCRetryPropagatedCompletedProgressRow
    | DeclaredCRetryStructuralCompletedProgressRow;
}

export interface DeclaredCRetryConsumedFrontier
  extends DeclaredCRetryFrontierBase {
  readonly kind: "declared_c_retry_consumed_frontier";
  readonly state: "progress_consumed";
  readonly consumed:
    | DeclaredCRetryBoundaryStoppedProgressRow
    | DeclaredCRetryPropagatedStoppedProgressRow
    | DeclaredCRetryCCallCompletedProgressRow
    | DeclaredCRetryPropagatedCompletedProgressRow
    | DeclaredCRetryStructuralCompletedProgressRow;
}

export type DeclaredCRetryFrontier =
  | DeclaredCRetryEligibleFrontier
  | DeclaredCRetryActiveFrontier
  | DeclaredCRetryAvailableProgressFrontier
  | DeclaredCRetryConsumedFrontier;

export interface DeclaredCRetryProspectiveCCallCandidate {
  readonly kind: "declared_c_retry_prospective_c_call_candidate";
  readonly cCallRef: string;
  readonly cCallDigest: Sha256Digest;
}

export type DeclaredCRetryCCallCandidate =
  | CCall
  | DeclaredCRetryProspectiveCCallCandidate;

type WithoutProjectionIdentity<T> = T extends unknown
  ? Omit<T, "projectionRef" | "projectionDigest">
  : never;

type DeclaredCRetryFrontierBody = WithoutProjectionIdentity<
  DeclaredCRetryFrontier
>;

function deriveRetryAttemptCursorCarrier(
  events: readonly RuntimeEvent[],
  event: RuntimeEvent,
): TraversalCursorCandidate | null {
  if (
    event.kind !== "retry_attempt_opened" ||
    event.aggregateType !== "frame" ||
    event.runId === undefined || event.graphCallId === undefined ||
    event.frameId === undefined || event.basisId === undefined ||
    event.materializationRef === undefined || !isRecord(event.payload)
  ) return null;
  const payload = event.payload;
  const wrappedTermPath = stringValues(payload.wrappedTermPath);
  const retryPath = positiveIntegerValues(payload.retryPath);
  if (
    wrappedTermPath === null || wrappedTermPath[0] !== "node" ||
    !nonEmptyString(wrappedTermPath[1]) || retryPath === null ||
    !positiveInteger(payload.attempt) ||
    payload.attempt !== retryPath.at(-1) ||
    !nonEmptyString(payload.inputRef) || !digestValue(payload.inputDigest) ||
    (payload.taskOrdinal !== null && !nonNegativeInteger(payload.taskOrdinal))
  ) return null;
  const initialRows = events.filter((candidate) =>
    candidate.kind === "traversal_cursor_entered" &&
    candidate.admissionOrdinal < event.admissionOrdinal &&
    candidate.runId === event.runId &&
    candidate.graphCallId === event.graphCallId &&
    candidate.frameId === event.frameId &&
    candidate.basisId === event.basisId && isRecord(candidate.payload) &&
    nonEmptyString(candidate.payload.programRef) &&
    nonEmptyString(candidate.payload.traversalScopeRef)
  );
  if (initialRows.length !== 1) return null;
  const initial = initialRows[0]!.payload as Readonly<Record<string, JsonValue>>;
  const body = {
    programRef: initial.programRef as string,
    executionBasisRef: event.basisId,
    traversalScopeRef: initial.traversalScopeRef as string,
    runId: event.runId,
    graphCallId: event.graphCallId,
    frameId: event.frameId,
    graphRef: event.materializationRef,
    inputRef: payload.inputRef as string,
    inputDigest: payload.inputDigest as Sha256Digest,
    currentNodeRef: wrappedTermPath[1]!,
    position: "at_term" as const,
    termPath: wrappedTermPath,
    taskOrdinal: payload.taskOrdinal as number | null,
    attempt: Number(payload.attempt),
    retryPath,
  };
  const cursorDigest = sha256Canonical(body as unknown as JsonValue);
  const cursor = deepFreeze({
    kind: "traversal_cursor" as const,
    schemaVersion: "5.0.0" as const,
    cursorRef:
      `traversal-cursor://abiogenesis/${cursorDigest.slice("sha256:".length)}`,
    cursorDigest,
    ...body,
  });
  return isTraversalCursorCandidate(cursor) ? cursor : null;
}

function deriveRetryAttemptCursor(
  prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  event: RuntimeEvent,
): TraversalCursorCandidate | null {
  if (
    event.materializationRef !== graph.materializationRef ||
    event.graphFunctionRef !== graph.graphFunctionRef ||
    event.causationEventRefs.length !== 1 || !isRecord(event.payload)
  ) return null;
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const payload = event.payload;
  const cursor = deriveRetryAttemptCursorCarrier(events, event);
  if (cursor === null) return null;
  const routeRows = events.filter((candidate) =>
    candidate.eventId === event.causationEventRefs[0] &&
    candidate.kind === "traversal_route_admitted" &&
    candidate.admissionOrdinal < event.admissionOrdinal &&
    candidate.runId === event.runId &&
    candidate.graphCallId === event.graphCallId &&
    candidate.frameId === event.frameId &&
    candidate.materializationRef === graph.materializationRef &&
    isRecord(candidate.payload) &&
    candidate.payload.routeKind === "retry" &&
    candidate.payload.routeRef === payload.priorRouteRef &&
    candidate.payload.judgmentRef === payload.priorJudgmentRef
  );
  const route = routeRows.length === 1 ? routeRows[0]! : null;
  return route !== null && isRecord(route.payload) &&
      route.payload.targetCursorRef === cursor.cursorRef &&
      route.payload.targetCursorDigest === cursor.cursorDigest
    ? cursor
    : null;
}

export function projectRetryAttempt(
  prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  admissionEventRef: string,
): RetryAttemptAdmission | null {
  if (!isMaterializedGtlGraph(graph) || admissionEventRef.length === 0) {
    return null;
  }
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const matches = events.filter((event) =>
    event.kind === "retry_attempt_opened" && isRecord(event.payload) &&
    event.eventId === admissionEventRef
  );
  if (matches.length !== 1) return null;
  const event = matches[0]!;
  const cursor = deriveRetryAttemptCursor(prefix, graph, event);
  if (cursor === null || !isRecord(event.payload)) return null;
  const context = contextForCursor(graph, cursor);
  if (context === null || (typeof context === "object" && "kind" in context)) {
    return null;
  }
  const payload = event.payload;
  const retryTermPath = stringValues(payload.retryTermPath);
  const wrappedTermPath = stringValues(payload.wrappedTermPath);
  const retryable = stringValues(payload.retryableFailureClasses);
  if (
    event.aggregateId !== cursor.frameId ||
    event.parentAggregateId !== cursor.graphCallId ||
    event.basisId !== cursor.executionBasisRef ||
    !nonEmptyString(payload.attemptRef) || !digestValue(payload.attemptDigest) ||
    !nonEmptyString(payload.attemptManifestRef) ||
    payload.retryBoundaryRef !== retryBoundaryRef(graph, cursor, context) ||
    payload.attempt !== cursor.attempt ||
    payload.taskOrdinal !== cursor.taskOrdinal || payload.budget !== context.budget ||
    retryTermPath === null || !sameStrings(retryTermPath, context.retryTermPath) ||
    wrappedTermPath === null || !sameStrings(wrappedTermPath, context.wrappedTermPath) ||
    retryable === null ||
    !sameStrings(retryable, WORKER_TRANSPORT_FAILURE_CLASS_VALUES) ||
    !nonEmptyString(payload.priorRouteRef) ||
    (payload.priorJudgmentRef !== null && !nonEmptyString(payload.priorJudgmentRef)) ||
    payload.inputRef !== cursor.inputRef || payload.inputDigest !== cursor.inputDigest ||
    payload.inputContractRef !== context.inputCarrierRef ||
    !isRecord(payload.inputValue) ||
    sha256Canonical(payload.inputValue) !== payload.inputDigest
  ) return null;
  const expectedAttemptManifestRef = deriveRetryAttemptManifestRef({
    retryBoundaryRef: payload.retryBoundaryRef as string,
    executionBasisRef: cursor.executionBasisRef,
    inputContractRef: context.inputCarrierRef,
    inputRef: cursor.inputRef,
    inputDigest: cursor.inputDigest,
    attempt: cursor.attempt,
    retryPath: cursor.retryPath,
  });
  if (payload.attemptManifestRef !== expectedAttemptManifestRef) return null;
  const { attemptRef: _attemptRef, attemptDigest: _attemptDigest, ...attemptBody } =
    payload;
  const computedAttemptDigest = sha256Canonical(
    attemptBody as unknown as JsonValue,
  );
  if (
    payload.attemptDigest !== computedAttemptDigest ||
    payload.attemptRef !==
      `retry-attempt://abiogenesis/${computedAttemptDigest.slice("sha256:".length)}`
  ) return null;
  if (cursor.attempt > 1) {
    const priorRetryPath = [
      ...cursor.retryPath.slice(0, -1),
      cursor.attempt - 1,
    ];
    const priorEvents = events.filter((candidate) =>
      candidate.kind === "retry_attempt_opened" &&
      candidate.admissionOrdinal < event.admissionOrdinal &&
      candidate.runId === event.runId &&
      candidate.graphCallId === event.graphCallId &&
      candidate.frameId === event.frameId &&
      isRecord(candidate.payload) &&
      candidate.payload.retryBoundaryRef === payload.retryBoundaryRef &&
      candidate.payload.taskOrdinal === payload.taskOrdinal &&
      candidate.payload.attempt === cursor.attempt - 1 &&
      sameNumbers(
        positiveIntegerValues(candidate.payload.retryPath) ?? [],
        priorRetryPath,
      )
    );
    if (
      priorEvents.length !== 1 ||
      projectRetryAttempt(prefix, graph, priorEvents[0]!.eventId) === null
    ) return null;
  }
  const { attemptRef, attemptDigest, ...body } = payload;
  return deepFreeze({
    kind: "retry_attempt_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    attemptRef,
    attemptDigest,
    ...body,
    admissionEventRef: event.eventId,
  }) as unknown as RetryAttemptAdmission;
}

function positiveNumberArray(value: JsonValue | undefined): readonly number[] {
  return Array.isArray(value) &&
      value.every((row) => Number.isSafeInteger(row) && Number(row) > 0)
    ? value.map(Number)
    : [];
}

const RETRY_CONTINUATION_PROGRESS_KEYS = Object.freeze([
  "attempt", "attemptRef", "budget", "cCallRef", "completedAttempts",
  "failureClass", "failureSignalRef", "inputContractRef", "inputDigest",
  "inputRef", "judgmentRef", "progressClass", "progressDigest", "progressRef",
  "remainingBudget", "resultRef", "retryBoundaryRef", "retryPath",
].sort());
const RETRY_STOPPED_PROGRESS_KEYS = Object.freeze([
  ...RETRY_CONTINUATION_PROGRESS_KEYS,
  "predecessorProgressRef", "stopReason",
].sort());
const COMPLETED_PROGRESS_TERMINAL_KEYS = Object.freeze([
  "attempt", "attemptRef", "cCallRef", "completedRetryDepth",
  "completionClass", "completionWitnessEventRef", "judgmentRef",
  "predecessorProgressRef", "progressClass", "progressDigest", "progressRef",
  "resultRef", "retryBoundaryRef", "retryPath", "sourceCursorDigest",
  "sourceCursorRef",
].sort());
const COMPLETED_PROGRESS_ADVANCE_KEYS = Object.freeze([
  ...COMPLETED_PROGRESS_TERMINAL_KEYS, "targetCursorDigest", "targetCursorRef",
].sort());
const STRUCTURAL_COMPLETED_PROGRESS_ADVANCE_KEYS = Object.freeze([
  "attempt", "attemptRef", "completedRetryDepth", "completionClass",
  "completionWitnessEventRef", "predecessorProgressRef", "progressClass",
  "progressDigest", "progressRef", "retryBoundaryRef", "retryPath",
  "sourceCursorDigest", "sourceCursorRef", "targetCursorDigest",
  "targetCursorRef",
].sort());
function exactPayloadKeys(
  payload: Readonly<Record<string, JsonValue>>,
  expected: readonly string[],
): boolean {
  return sameStrings(Object.keys(payload).sort(), expected);
}

function progressBody(
  payload: Readonly<Record<string, JsonValue>>,
): Readonly<Record<string, JsonValue>> | null {
  if (payload.progressClass === "retry") {
    if (!exactPayloadKeys(payload, RETRY_CONTINUATION_PROGRESS_KEYS)) return null;
    const { progressRef: _ref, progressDigest: _digest, ...body } = payload;
    return body;
  }
  if (payload.progressClass === "stopped") {
    if (!exactPayloadKeys(payload, RETRY_STOPPED_PROGRESS_KEYS)) return null;
    const { progressRef: _ref, progressDigest: _digest, ...body } = payload;
    return body;
  }
  if (payload.progressClass !== "completed") return null;
  if (payload.completionClass === "structural_identity_success") {
    if (!exactPayloadKeys(payload, STRUCTURAL_COMPLETED_PROGRESS_ADVANCE_KEYS)) {
      return null;
    }
    const { progressRef: _ref, progressDigest: _digest, ...body } = payload;
    return body;
  }
  if (
    payload.completionClass !== "judged_success" &&
    payload.completionClass !== "fan_out_success" &&
    payload.completionClass !== "fh_resume_success"
  ) return null;
  const terminal = !Object.hasOwn(payload, "targetCursorRef") &&
    !Object.hasOwn(payload, "targetCursorDigest");
  if (!exactPayloadKeys(
    payload,
    terminal ? COMPLETED_PROGRESS_TERMINAL_KEYS : COMPLETED_PROGRESS_ADVANCE_KEYS,
  )) return null;
  const { progressRef: _ref, progressDigest: _digest, ...storedBody } = payload;
  return terminal
    ? { ...storedBody, targetCursorRef: null, targetCursorDigest: null }
    : storedBody;
}

function nonEmptyString(value: JsonValue | undefined): value is string {
  return typeof value === "string" && value.length > 0;
}

function digestValue(value: JsonValue | undefined): value is Sha256Digest {
  return typeof value === "string" && value.startsWith("sha256:");
}

function positiveInteger(value: JsonValue | undefined): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

function nonNegativeInteger(value: JsonValue | undefined): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

function positiveIntegerValues(
  value: JsonValue | undefined,
): readonly number[] | null {
  return Array.isArray(value) && value.length > 0 && value.every(positiveInteger)
    ? value.map(Number)
    : null;
}

function stringValues(value: JsonValue | undefined): readonly string[] | null {
  return Array.isArray(value) && value.every(nonEmptyString)
    ? value as readonly string[]
    : null;
}

function sharesProgressScope(
  candidate: RuntimeEvent,
  progress: RuntimeEvent,
): boolean {
  return candidate.workflowVersion === "5.0.0" &&
    candidate.scopeClass === "run" &&
    candidate.basisId === progress.basisId &&
    candidate.runId === progress.runId &&
    candidate.graphFunctionRef === progress.graphFunctionRef &&
    candidate.graphCallId === progress.graphCallId &&
    candidate.frameId === progress.frameId;
}

function exactAttemptEvent(
  prior: readonly RuntimeEvent[],
  progress: RuntimeEvent,
  body: Readonly<Record<string, JsonValue>>,
): RuntimeEvent | null {
  const rows = prior.filter((candidate) =>
    candidate.kind === "retry_attempt_opened" &&
    isRecord(candidate.payload) &&
    candidate.payload.attemptRef === body.attemptRef
  );
  if (rows.length !== 1) return null;
  const event = rows[0]!;
  const payload = event.payload as Readonly<Record<string, JsonValue>>;
  const { attemptRef: _ref, attemptDigest: _digest, ...attemptBody } = payload;
  const retryPath = positiveIntegerValues(payload.retryPath);
  const retryTermPath = stringValues(payload.retryTermPath);
  const wrappedTermPath = stringValues(payload.wrappedTermPath);
  const retryable = stringValues(payload.retryableFailureClasses);
  const attemptDigest = sha256Canonical(attemptBody as unknown as JsonValue);
  const routeRows = prior.filter((candidate) =>
    candidate.kind === "traversal_route_admitted" &&
    sharesProgressScope(candidate, progress) &&
    isRecord(candidate.payload) &&
    candidate.payload.routeKind === "retry" &&
    candidate.payload.routeRef === payload.priorRouteRef &&
    event.causationEventRefs.includes(candidate.eventId)
  );
  return sharesProgressScope(event, progress) &&
      event.aggregateType === "frame" &&
      event.aggregateId === progress.frameId &&
      event.parentAggregateId === progress.graphCallId &&
      event.materializationRef === progress.materializationRef &&
      nonEmptyString(payload.attemptRef) &&
      digestValue(payload.attemptDigest) &&
      payload.attemptDigest === attemptDigest &&
      payload.attemptRef ===
        `retry-attempt://abiogenesis/${attemptDigest.slice("sha256:".length)}` &&
      payload.retryBoundaryRef === body.retryBoundaryRef &&
      payload.attempt === body.attempt &&
      retryPath !== null && sameNumbers(retryPath, body.retryPath as number[]) &&
      positiveInteger(payload.budget) &&
      Number(payload.attempt) <= Number(payload.budget) &&
      retryTermPath !== null && retryTermPath.length >= 3 &&
      wrappedTermPath !== null &&
      sameStrings(wrappedTermPath, [...retryTermPath, "term"]) &&
      retryable !== null &&
      sameStrings(retryable, WORKER_TRANSPORT_FAILURE_CLASS_VALUES) &&
      (payload.taskOrdinal === null || nonNegativeInteger(payload.taskOrdinal)) &&
      (payload.priorJudgmentRef === null || nonEmptyString(payload.priorJudgmentRef)) &&
      nonEmptyString(payload.priorRouteRef) &&
      event.causationEventRefs.length === 1 && routeRows.length === 1 &&
      event.causationEventRefs[0] === routeRows[0]!.eventId &&
      nonEmptyString(payload.inputRef) && digestValue(payload.inputDigest) &&
      nonEmptyString(payload.inputContractRef) &&
      isRecord(payload.inputValue) &&
      sha256Canonical(payload.inputValue) === payload.inputDigest
    ? event
    : null;
}

function hasHistoricalAttemptCCallDescent(
  events: readonly RuntimeEvent[],
  attemptEvent: RuntimeEvent,
  openedEvent: RuntimeEvent,
): boolean {
  if (
    !isRecord(attemptEvent.payload) || !isRecord(openedEvent.payload) ||
    openedEvent.kind !== "c_call_opened" ||
    openedEvent.payload.attempt !== attemptEvent.payload.attempt ||
    !nonEmptyString(openedEvent.payload.programLocusRef) ||
    !sameNumbers(
      positiveIntegerValues(openedEvent.payload.retryPath) ?? [],
      positiveIntegerValues(attemptEvent.payload.retryPath) ?? [],
    )
  ) return false;
  const attemptPayload = attemptEvent.payload;
  const openedPayload = openedEvent.payload;
  const immediateRoutes = events.filter((event) =>
    event.kind === "traversal_route_admitted" &&
    openedEvent.causationEventRefs.includes(event.eventId) &&
    event.runId === openedEvent.runId &&
    event.graphCallId === openedEvent.graphCallId &&
    event.frameId === openedEvent.frameId &&
    isRecord(event.payload) &&
    event.payload.targetCursorRef === openedPayload.cursorRef &&
    event.payload.targetCursorDigest === openedPayload.cursorDigest
  );
  const originRoutes = events.filter((event) =>
    event.kind === "traversal_route_admitted" &&
    attemptEvent.causationEventRefs.includes(event.eventId) &&
    event.runId === attemptEvent.runId &&
    event.graphCallId === attemptEvent.graphCallId &&
    event.frameId === attemptEvent.frameId &&
    isRecord(event.payload) && event.payload.routeKind === "retry" &&
    event.payload.routeRef === attemptPayload.priorRouteRef
  );
  if (immediateRoutes.length !== 1 || originRoutes.length !== 1) return false;
  const origin = originRoutes[0]!;
  const pending = [immediateRoutes[0]!.eventId];
  const visited = new Set<string>();
  const byId = new Map(events.map((event) => [event.eventId, event]));
  while (pending.length !== 0) {
    const eventRef = pending.pop()!;
    if (eventRef === origin.eventId) return true;
    if (visited.has(eventRef)) continue;
    visited.add(eventRef);
    const event = byId.get(eventRef);
    if (event !== undefined) pending.push(...event.causationEventRefs);
  }
  return false;
}

function exactCCallPhaseEvents(
  prefix: ValidatedRuntimeEventPrefix,
  events: readonly RuntimeEvent[],
  progress: RuntimeEvent,
  cCallRef: string,
  resultRef: string,
  judgmentRef: string,
): Readonly<{
  opened: RuntimeEvent;
  fibre: RuntimeEvent;
  result: RuntimeEvent;
  judgment: RuntimeEvent;
}> | null {
  let phase;
  try {
    phase = projectCCallPhase(prefix, cCallRef);
  } catch {
    return null;
  }
  if (
    phase.phase !== "judged" || phase.fibreEventRef === null ||
    phase.resultEventRef === null ||
    phase.judgmentEventRef === null
  ) return null;
  const opened = events.find((candidate) =>
    candidate.eventId === phase.openedEventRef && candidate.kind === "c_call_opened"
  );
  const fibre = events.find((candidate) =>
    candidate.eventId === phase.fibreEventRef &&
    candidate.kind === "c_call_fibre_selected"
  );
  const result = events.find((candidate) =>
    candidate.eventId === phase.resultEventRef &&
    candidate.kind === "c_call_result_admitted"
  );
  const judgment = events.find((candidate) =>
    candidate.eventId === phase.judgmentEventRef && candidate.kind === "c_call_judged"
  );
  if (
    opened === undefined || fibre === undefined || result === undefined ||
    judgment === undefined || !isRecord(opened.payload) ||
    !isRecord(fibre.payload) || !isRecord(result.payload) ||
    !isRecord(judgment.payload)
  ) return null;
  const resultPayload = result.payload as Readonly<Record<string, JsonValue>>;
  const judgmentPayload = judgment.payload as Readonly<Record<string, JsonValue>>;
  if (
    !sharesProgressScope(opened, progress) ||
    !sharesProgressScope(fibre, progress) ||
    !sharesProgressScope(result, progress) ||
    !sharesProgressScope(judgment, progress) ||
    opened.aggregateType !== "c_call" || opened.aggregateId !== cCallRef ||
    opened.materializationRef !== progress.materializationRef ||
    opened.payload.cCallRef !== cCallRef ||
    fibre.aggregateType !== "c_call" || fibre.aggregateId !== cCallRef ||
    fibre.parentAggregateId !== opened.parentAggregateId ||
    fibre.materializationRef !== progress.materializationRef ||
    fibre.payload.cCallRef !== cCallRef ||
    fibre.causationEventRefs.length !== 1 ||
    fibre.causationEventRefs[0] !== opened.eventId ||
    result.aggregateType !== "c_call" || result.aggregateId !== cCallRef ||
    resultPayload.cCallRef !== cCallRef || resultPayload.resultRef !== resultRef ||
    judgment.aggregateType !== "c_call" || judgment.aggregateId !== cCallRef ||
    judgmentPayload.cCallRef !== cCallRef ||
    judgmentPayload.judgmentRef !== judgmentRef ||
    judgmentPayload.resultRef !== resultRef ||
    judgmentPayload.resultDigest !== resultPayload.resultDigest ||
    !judgment.causationEventRefs.includes(result.eventId)
  ) return null;
  return Object.freeze({ opened, fibre, result, judgment });
}

function hasExactRetryFailureProvenance(
  prefix: ValidatedRuntimeEventPrefix,
  _events: readonly RuntimeEvent[],
  result: RuntimeEvent,
  judgment: RuntimeEvent,
  failureClass: JsonValue | undefined,
  failureSignalRef: JsonValue | undefined,
): boolean {
  if (
    !WORKER_TRANSPORT_FAILURE_CLASS_VALUES.includes(
      failureClass as WorkerTransportFailureClass,
    ) ||
    !nonEmptyString(failureSignalRef) ||
    !isRecord(result.payload) || !isRecord(judgment.payload) ||
    result.payload.resultClass !== "failure" ||
    judgment.payload.reasonRef !== failureSignalRef ||
    typeof result.payload.resultRef !== "string" ||
    typeof judgment.payload.judgmentRef !== "string"
  ) return false;
  const signal = projectCCallRuntimeFailureSignal(
    prefix,
    result.aggregateId,
    result.payload.resultRef,
    judgment.payload.judgmentRef,
  );
  return signal !== null && signal.failureClass === failureClass &&
    signal.failureSignalRef === failureSignalRef;
}
function exactSourceCursorEvent(
  prior: readonly RuntimeEvent[],
  cCallEvent: RuntimeEvent,
  sourceCursorRef: JsonValue | undefined,
  sourceCursorDigest: JsonValue | undefined,
): RuntimeEvent | null {
  if (
    !nonEmptyString(sourceCursorRef) || !digestValue(sourceCursorDigest) ||
    !isRecord(cCallEvent.payload) ||
    cCallEvent.payload.cursorRef !== sourceCursorRef ||
    cCallEvent.payload.cursorDigest !== sourceCursorDigest
  ) return null;
  const rows = prior.filter((candidate) => {
    if (!isRecord(candidate.payload)) return false;
    return (candidate.kind === "traversal_cursor_entered" &&
        candidate.payload.cursorRef === sourceCursorRef &&
        candidate.payload.cursorDigest === sourceCursorDigest) ||
      (candidate.kind === "traversal_route_admitted" &&
        candidate.payload.targetCursorRef === sourceCursorRef &&
        candidate.payload.targetCursorDigest === sourceCursorDigest) ||
      (candidate.kind === "fh_interaction_resume_admitted" &&
        candidate.payload.successorCursorRef === sourceCursorRef &&
        candidate.payload.successorCursorDigest === sourceCursorDigest);
  });
  return rows.length === 1 && rows[0]!.admissionOrdinal < cCallEvent.admissionOrdinal
    ? rows[0]!
    : null;
}

function exactCursorCarrierEvent(
  prior: readonly RuntimeEvent[],
  progress: RuntimeEvent,
  sourceCursorRef: JsonValue | undefined,
  sourceCursorDigest: JsonValue | undefined,
  witnessEventRef: JsonValue | undefined,
): RuntimeEvent | null {
  if (
    !nonEmptyString(sourceCursorRef) || !digestValue(sourceCursorDigest) ||
    !nonEmptyString(witnessEventRef)
  ) return null;
  const candidate = prior.find((event) => event.eventId === witnessEventRef);
  if (candidate === undefined || !isRecord(candidate.payload)) return null;
  const candidatePayload = candidate.payload;
  const materializationRef = candidate.kind === "fh_interaction_resume_admitted"
    ? prior.find((event) =>
        event.kind === "fh_interaction_opened" &&
        event.aggregateId === candidate.aggregateId &&
        event.eventId === candidatePayload.openedEventRef
      )?.materializationRef
    : candidate.materializationRef;
  if (
    candidate.workflowVersion !== "5.0.0" ||
    candidate.scopeClass !== "run" || candidate.runId !== progress.runId ||
    candidate.graphCallId !== progress.graphCallId ||
    candidate.frameId !== progress.frameId ||
    materializationRef !== progress.materializationRef
  ) return null;
  const matches = (candidate.kind === "traversal_cursor_entered" &&
      candidate.payload.cursorRef === sourceCursorRef &&
      candidate.payload.cursorDigest === sourceCursorDigest) ||
    (candidate.kind === "traversal_route_admitted" &&
      candidate.payload.targetCursorRef === sourceCursorRef &&
      candidate.payload.targetCursorDigest === sourceCursorDigest) ||
    (candidate.kind === "fh_interaction_resume_admitted" &&
      candidate.payload.successorCursorRef === sourceCursorRef &&
      candidate.payload.successorCursorDigest === sourceCursorDigest);
  return matches ? candidate : null;
}

function exactFanOutCompletionWitness(
  prefix: ValidatedRuntimeEventPrefix,
  prior: readonly RuntimeEvent[],
  progress: RuntimeEvent,
  body: Readonly<Record<string, JsonValue>>,
  cCallEvent: RuntimeEvent,
  resultEvent: RuntimeEvent,
  judgmentEvent: RuntimeEvent,
): RuntimeEvent | null {
  const witness = prior.find((candidate) =>
    candidate.eventId === body.completionWitnessEventRef &&
    candidate.kind === "fan_out_completion_admitted"
  );
  const projected = typeof body.completionWitnessEventRef === "string"
    ? projectExactFanOutCompletion(prefix, {
        mode: "event_canonical",
        admissionEventRef: body.completionWitnessEventRef,
      })
    : null;
  if (
    witness === undefined || !sharesProgressScope(witness, progress) ||
    !isRecord(witness.payload) || !isRecord(cCallEvent.payload) ||
    !isRecord(resultEvent.payload) || !isRecord(judgmentEvent.payload) ||
    projected?.kind !== "fan_out_completion_admission" ||
    projected.completionKind !== "complete_vector" ||
    projected.taskRows.length === 0
  ) return null;
  const lastRow = projected.taskRows.at(-1)!;
  return lastRow.cCallRef === body.cCallRef &&
      lastRow.resultRef === body.resultRef &&
      lastRow.judgmentRef === body.judgmentRef &&
      cCallEvent.payload.batchRef === projected.batchRef &&
      resultEvent.payload.resultClass === "success" &&
      judgmentEvent.payload.judgment === "advance" &&
      witness.causationEventRefs.includes(judgmentEvent.eventId)
    ? witness
    : null;
}

function exactFhResumeCompletionWitness(
  prefix: ValidatedRuntimeEventPrefix,
  calculus: RuntimeEventCalculusProjection,
  authorityPrefix: ValidatedRuntimeEventPrefix,
  body: Readonly<Record<string, JsonValue>>,
  cCallEvent: RuntimeEvent,
  fibreEvent: RuntimeEvent,
  resultEvent: RuntimeEvent,
  judgmentEvent: RuntimeEvent,
): RuntimeEvent | null {
  if (
    !isRecord(cCallEvent.payload) || !isRecord(fibreEvent.payload) ||
    !isRecord(resultEvent.payload) || !isRecord(judgmentEvent.payload) ||
    fibreEvent.payload.cCallRef !== body.cCallRef ||
    fibreEvent.payload.callClass !== "leaf" ||
    fibreEvent.payload.regime !== "F_H" ||
    resultEvent.payload.resultClass !== "pending" ||
    judgmentEvent.payload.judgment !== "pending"
  ) return null;
  const continuation = projectFhContinuations(
    prefix,
    calculus,
    authorityPrefix,
  ).find((row) =>
    row.status === "resolved" &&
    row.cCallRef === body.cCallRef &&
    row.resumedEventRef === body.completionWitnessEventRef &&
    row.successorCursorRef === body.sourceCursorRef &&
    row.successorCursorDigest === body.sourceCursorDigest
  );
  if (continuation === undefined || continuation.resumedEventRef === null) {
    return null;
  }
  return runtimeEventsFromValidatedPrefix(prefix).find((event) =>
    event.kind === "fh_interaction_resume_admitted" &&
    event.eventId === continuation.resumedEventRef
  ) ?? null;
}

function projectRetryProgressAt(
  prefix: ValidatedRuntimeEventPrefix,
  events: readonly RuntimeEvent[],
  eventIndex: number,
  visiting: ReadonlySet<string>,
  authorityPrefix: ValidatedRuntimeEventPrefix,
): RetryProgressAdmission | null {
  const event = events[eventIndex];
  if (
    event?.kind !== "retry_progress_recorded" ||
    event.runId === undefined || event.graphCallId === undefined ||
    event.frameId === undefined || event.graphFunctionRef === undefined ||
    event.materializationRef === undefined || !isRecord(event.payload) ||
    event.workflowVersion !== "5.0.0" || event.scopeClass !== "run" ||
    event.aggregateType !== "frame" || event.aggregateId !== event.frameId ||
    event.parentAggregateId !== event.graphCallId ||
    visiting.has(event.eventId)
  ) return null;
  const body = progressBody(event.payload);
  if (body === null ||
    typeof event.payload.progressDigest !== "string" ||
    typeof event.payload.progressRef !== "string") return null;
  const digest = sha256Canonical(body as unknown as JsonValue);
  const progressRef =
    `retry-progress://abiogenesis/${digest.slice("sha256:".length)}`;
  if (event.payload.progressDigest !== digest || event.payload.progressRef !== progressRef) {
    return null;
  }
  const attemptRef = body.attemptRef;
  const structuralCompletion =
    body.completionClass === "structural_identity_success";
  const cCallRef = nonEmptyString(body.cCallRef) ? body.cCallRef : null;
  const resultRef = nonEmptyString(body.resultRef) ? body.resultRef : null;
  const judgmentRef = nonEmptyString(body.judgmentRef)
    ? body.judgmentRef
    : null;
  const retryPath = positiveIntegerValues(body.retryPath);
  if (
    !nonEmptyString(attemptRef) ||
    (!structuralCompletion &&
      (cCallRef === null || resultRef === null || judgmentRef === null)) ||
    !nonEmptyString(body.retryBoundaryRef) ||
    !positiveInteger(body.attempt) ||
    retryPath === null || body.attempt !== retryPath.at(-1) || eventIndex === 0
  ) return null;
  const prior = events.slice(0, eventIndex);
  const priorPrefix = validatedRuntimeEventPrefixThroughEvent(
    prefix,
    events[eventIndex - 1]!.eventId,
  );
  let priorAuthorityPrefix: ValidatedRuntimeEventPrefix;
  try {
    priorAuthorityPrefix = validatedRuntimeEventPrefixThroughEvent(
      authorityPrefix,
      events[eventIndex - 1]!.eventId,
    );
  } catch {
    return null;
  }
  const priorCalculus = deriveRuntimeEventCalculusProjection(priorPrefix);
  const attemptEvent = exactAttemptEvent(prior, event, body);
  const phase = structuralCompletion || cCallRef === null ||
      resultRef === null || judgmentRef === null
    ? null
    : exactCCallPhaseEvents(
        priorPrefix,
        prior,
        event,
        cCallRef,
        resultRef,
        judgmentRef,
      );
  const cCallEvent = phase?.opened ?? null;
  const fibreEvent = phase?.fibre ?? null;
  const resultEvent = phase?.result ?? null;
  const judgmentEvent = phase?.judgment ?? null;
  const cCallPayload = cCallEvent !== null && isRecord(cCallEvent.payload)
    ? cCallEvent.payload
    : null;
  const resultPayload = resultEvent !== null && isRecord(resultEvent.payload)
    ? resultEvent.payload
    : null;
  const judgmentPayload = judgmentEvent !== null && isRecord(judgmentEvent.payload)
    ? judgmentEvent.payload
    : null;
  if (
    attemptEvent === null ||
    event.causationEventRefs.length !== 2 ||
    event.causationEventRefs[0] !== attemptEvent.eventId ||
    (!structuralCompletion && (
      cCallEvent === null || fibreEvent === null || resultEvent === null ||
      judgmentEvent === null || cCallPayload === null || resultPayload === null ||
      judgmentPayload === null ||
      cCallPayload.cCallRef !== cCallRef ||
      resultPayload.resultRef !== resultRef ||
      judgmentPayload.judgmentRef !== judgmentRef
    )) ||
    !holdsAt(
      priorCalculus,
      constructScopedRetryFluent("retry_attempt_active", {
        runId: event.runId,
        graphCallId: event.graphCallId,
        frameId: event.frameId,
        retryBoundaryRef: body.retryBoundaryRef as string,
        authorityRef: attemptRef,
      }),
    )
  ) return null;

  const failureProgress = event.payload.progressClass === "retry" ||
    event.payload.progressClass === "stopped";
  const propagatedStop = event.payload.progressClass === "stopped" &&
    body.stopReason === "propagated_inner_stop";
  const directCCallOwnership = !propagatedStop &&
    !structuralCompletion &&
    (failureProgress || body.predecessorProgressRef === null);
  const callRetryPath = cCallPayload === null
    ? null
    : positiveIntegerValues(cCallPayload.retryPath);
  if (directCCallOwnership) {
    if (cCallPayload === null || cCallRef === null) return null;
    if (
      callRetryPath === null ||
      (cCallPayload.taskOrdinal !== null &&
        !nonNegativeInteger(cCallPayload.taskOrdinal)) ||
      !positiveInteger(cCallPayload.attempt) ||
      !nonEmptyString(cCallPayload.programLocusRef) ||
      cCallPayload.attempt !== body.attempt ||
      !sameNumbers(callRetryPath, retryPath) ||
      cCallEvent === null ||
      !hasHistoricalAttemptCCallDescent(prior, attemptEvent, cCallEvent)
    ) return null;
  }

  if (failureProgress) {
    if (
      cCallPayload === null || resultPayload === null ||
      judgmentPayload === null || cCallRef === null ||
      resultRef === null || judgmentRef === null ||
      resultEvent === null || judgmentEvent === null
    ) return null;
    const completedAttempts = positiveIntegerValues(body.completedAttempts);
    const expectedAttempts = Array.from(
      { length: Number(body.attempt) },
      (_, index) => index + 1,
    );
    const priorFailureProgresses = prior.flatMap((candidate, index) => {
      if (
        candidate.kind !== "retry_progress_recorded" ||
        !isRecord(candidate.payload) ||
        candidate.payload.retryBoundaryRef !== body.retryBoundaryRef ||
        candidate.payload.progressClass !== "retry"
      ) return [];
      const projected = projectRetryProgressAt(
        prefix,
        events,
        index,
        new Set([...visiting, event.eventId]),
        authorityPrefix,
      );
      return projected?.progressClass === "retry" ? [projected] : [];
    });
    const immediatelyPrecedingFailure = priorFailureProgresses.at(-1);
    const stationary = immediatelyPrecedingFailure?.failureSignalRef ===
      body.failureSignalRef;
    const budgetExhausted = Number(body.attempt) >= Number(body.budget);
    const stopped = event.payload.progressClass === "stopped";
    if (
      !positiveInteger(body.budget) ||
      completedAttempts === null ||
      !sameNumbers(completedAttempts, expectedAttempts) ||
      !nonNegativeInteger(body.remainingBudget) ||
      body.remainingBudget !==
        Math.max(0, Number(body.budget) - Number(body.attempt)) ||
      !WORKER_TRANSPORT_FAILURE_CLASS_VALUES.includes(
        body.failureClass as WorkerTransportFailureClass,
      ) ||
      !nonEmptyString(body.failureSignalRef) ||
      !nonEmptyString(body.inputRef) || !digestValue(body.inputDigest) ||
      !nonEmptyString(body.inputContractRef) ||
      !isRecord(attemptEvent.payload) ||
      attemptEvent.payload.budget !== body.budget ||
      attemptEvent.payload.inputRef !== body.inputRef ||
      attemptEvent.payload.inputDigest !== body.inputDigest ||
      attemptEvent.payload.inputContractRef !== body.inputContractRef ||
      !hasExactRetryFailureProvenance(
        priorPrefix,
        prior,
        resultEvent,
        judgmentEvent,
        body.failureClass,
        body.failureSignalRef,
      ) ||
      callRetryPath === null ||
      (stopped
        ? body.stopReason !== "boundary_terminal" &&
          body.stopReason !== "propagated_inner_stop"
        : Object.hasOwn(body, "stopReason") ||
          Object.hasOwn(body, "predecessorProgressRef"))
    ) return null;
    if (!propagatedStop) {
      if (
        judgmentPayload.judgment !== (stopped ? "blocked" : "retry") ||
        judgmentPayload.retryAttemptRef !== attemptRef ||
        event.causationEventRefs[1] !== judgmentEvent.eventId ||
        (stopped
          ? body.stopReason !== "boundary_terminal" ||
            body.predecessorProgressRef !== null ||
            (!budgetExhausted && !stationary)
          : budgetExhausted || stationary)
      ) return null;
    } else {
      const predecessorIndex = prior.findIndex((candidate) =>
        candidate.eventId === event.causationEventRefs[1]
      );
      const predecessor = predecessorIndex < 0 ? null : projectRetryProgressAt(
        prefix,
        events,
        predecessorIndex,
        new Set([...visiting, event.eventId]),
        authorityPrefix,
      );
      if (
        judgmentPayload.judgment !== "blocked" ||
        !nonEmptyString(body.predecessorProgressRef) ||
        predecessorIndex !== eventIndex - 1 ||
        predecessor?.progressClass !== "stopped" ||
        predecessor.progressRef !== body.predecessorProgressRef ||
        predecessor.retryBoundaryRef === body.retryBoundaryRef ||
        predecessor.cCallRef !== cCallRef ||
        predecessor.resultRef !== resultRef ||
        predecessor.judgmentRef !== judgmentRef ||
        predecessor.failureClass !== body.failureClass ||
        predecessor.failureSignalRef !== body.failureSignalRef ||
        !sameNumbers(predecessor.retryPath.slice(0, -1), retryPath) ||
        !sameNumbers(callRetryPath.slice(0, retryPath.length), retryPath) ||
        callRetryPath.length <= retryPath.length
      ) return null;
    }
  } else {
    const completionClass = body.completionClass;
    if (
      completionClass !== "judged_success" &&
      completionClass !== "fan_out_success" &&
      completionClass !== "fh_resume_success" &&
      completionClass !== "structural_identity_success"
    ) return null;
    let sourceCursorEvent: RuntimeEvent | null = null;
    let completionWitness: RuntimeEvent | null = null;
    if (completionClass === "structural_identity_success") {
      sourceCursorEvent = exactCursorCarrierEvent(
        prior,
        event,
        body.sourceCursorRef,
        body.sourceCursorDigest,
        body.completionWitnessEventRef,
      );
      completionWitness = sourceCursorEvent;
    } else {
      if (
        cCallEvent === null || fibreEvent === null || resultEvent === null ||
        judgmentEvent === null || cCallPayload === null || resultPayload === null ||
        judgmentPayload === null || cCallRef === null || resultRef === null ||
        judgmentRef === null
      ) return null;
      if (completionClass === "fh_resume_success") {
        completionWitness = exactFhResumeCompletionWitness(
          priorPrefix,
          priorCalculus,
          priorAuthorityPrefix,
          body,
          cCallEvent,
          fibreEvent,
          resultEvent,
          judgmentEvent,
        );
        sourceCursorEvent = completionWitness;
      } else {
        sourceCursorEvent = exactSourceCursorEvent(
          prior,
          cCallEvent,
          body.sourceCursorRef,
          body.sourceCursorDigest,
        );
        completionWitness = completionClass === "fan_out_success"
          ? exactFanOutCompletionWitness(
              priorPrefix,
              prior,
              event,
              body,
              cCallEvent,
              resultEvent,
              judgmentEvent,
            )
          : body.completionWitnessEventRef === judgmentEvent.eventId &&
              resultPayload.resultClass === "success" &&
              judgmentPayload.judgment === "advance"
            ? judgmentEvent
            : null;
      }
    }
    const targetPairValid =
      (body.targetCursorRef === null && body.targetCursorDigest === null) ||
      (nonEmptyString(body.targetCursorRef) && digestValue(body.targetCursorDigest));
    if (
      !positiveInteger(body.completedRetryDepth) ||
      body.completedRetryDepth !== retryPath.length ||
      sourceCursorEvent === null || completionWitness === null ||
      !targetPairValid ||
      (completionClass === "structural_identity_success" &&
        (body.targetCursorRef === null || body.targetCursorDigest === null)) ||
      !holdsAt(
        priorCalculus,
        constructRuntimeFluent({
          name: "locus_active",
          identity: body.sourceCursorRef as string,
        }),
      ) ||
      (body.predecessorProgressRef !== null &&
        !nonEmptyString(body.predecessorProgressRef))
    ) return null;
    if (body.predecessorProgressRef === null) {
      if (
        (completionClass !== "structural_identity_success" &&
          judgmentPayload?.retryAttemptRef !== attemptRef) ||
        event.causationEventRefs[1] !== completionWitness.eventId
      ) return null;
    } else {
      const predecessorIndex = prior.findIndex((candidate) =>
        candidate.eventId === event.causationEventRefs[1]
      );
      const predecessor = predecessorIndex < 0 ? null : projectRetryProgressAt(
        prefix,
        events,
        predecessorIndex,
        new Set([...visiting, event.eventId]),
        authorityPrefix,
      );
      if (
        predecessorIndex !== eventIndex - 1 ||
        predecessor?.progressClass !== "completed" ||
        predecessor.progressRef !== body.predecessorProgressRef ||
        predecessor.completedRetryDepth !== Number(body.completedRetryDepth) + 1 ||
        predecessor.retryBoundaryRef === body.retryBoundaryRef ||
        predecessor.completionClass !== completionClass ||
        predecessor.completionWitnessEventRef !==
          body.completionWitnessEventRef ||
        (completionClass === "structural_identity_success"
          ? "cCallRef" in predecessor
          : !("cCallRef" in predecessor) ||
            predecessor.cCallRef !== cCallRef ||
            predecessor.resultRef !== resultRef ||
            predecessor.judgmentRef !== judgmentRef) ||
        predecessor.sourceCursorRef !== body.sourceCursorRef ||
        predecessor.sourceCursorDigest !== body.sourceCursorDigest ||
        predecessor.targetCursorRef !== body.targetCursorRef ||
        predecessor.targetCursorDigest !== body.targetCursorDigest ||
        !sameNumbers(predecessor.retryPath.slice(0, -1), retryPath)
      ) return null;
    }
  }
  return deepFreeze({
    kind: "retry_progress_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    progressRef,
    progressDigest: digest,
    ...body,
    admissionEventRef: event.eventId,
  }) as unknown as RetryProgressAdmission;
}

function projectAdmittedRetryProgress(
  prefix: ValidatedRuntimeEventPrefix,
  admissionEventRef: string,
  authorityPrefix: ValidatedRuntimeEventPrefix = prefix,
): RetryProgressAdmission | null {
  try {
    const historicalPrefix = validatedRuntimeEventPrefixThroughEvent(
      prefix,
      admissionEventRef,
    );
    const historicalAuthorityPrefix = validatedRuntimeEventPrefixThroughEvent(
      authorityPrefix,
      admissionEventRef,
    );
    const events = runtimeEventsFromValidatedPrefix(historicalPrefix);
    const eventIndex = events.findIndex((event) =>
      event.eventId === admissionEventRef
    );
    return eventIndex < 0
      ? null
      : projectRetryProgressAt(
          historicalPrefix,
          events,
          eventIndex,
          new Set(),
          historicalAuthorityPrefix,
        );
  } catch {
    return null;
  }
}

function routeConsumesRetryProgress(
  route: HistoricalTraversalRouteProjection,
  progressEvent: RuntimeEvent,
  progress: RetryProgressAdmission,
): boolean {
  return route.admissionOrdinal > progressEvent.admissionOrdinal &&
    route.runId === progressEvent.runId &&
    route.graphCallId === progressEvent.graphCallId &&
    route.frameId === progressEvent.frameId &&
    route.materializationRef === progressEvent.materializationRef &&
    route.consumedAvailabilityRefs.includes(progress.progressRef) &&
    route.causationEventRefs.includes(progressEvent.eventId);
}

function isDeclaredCRetryAttemptOrigin(
  route: HistoricalTraversalRouteProjection,
): route is DeclaredCRetryAttemptOrigin {
  return route.routeKind === "retry" &&
    route.targetCursorRef !== null && route.targetCursorDigest !== null &&
    (route.cCallRef === null) === (route.judgmentRef === null) &&
    (route.cCallRef === null
      ? route.consumedAvailabilityRefs.length === 0
      : route.consumedAvailabilityRefs.length === 2);
}

function isDeclaredCRetryRetryConsumption(
  route: HistoricalTraversalRouteProjection,
): route is DeclaredCRetryRetryConsumption {
  return route.routeKind === "retry" &&
    route.targetCursorRef !== null && route.targetCursorDigest !== null &&
    route.cCallRef !== null && route.judgmentRef !== null &&
    route.contractRef !== null && route.consumedAvailabilityRefs.length === 2;
}

function isDeclaredCRetryExitConsumption(
  route: HistoricalTraversalRouteProjection,
): route is DeclaredCRetryExitConsumption {
  return route.routeKind === "advance" || route.routeKind === "terminal" ||
    route.routeKind === "blocked" || route.routeKind === "failed";
}

type ProspectiveTerm = Readonly<{
  term: Extract<CProgramNode, { kind: "c_of" | "c_workflow" | "c_identity" }>;
  nodeRef: string;
  termPath: readonly string[];
  taskOrdinal: number | null;
  attempt: number;
  retryPath: readonly number[];
}>;

function firstProspectiveTerm(
  term: Readonly<CProgramNode>,
  nodeRef: string,
  termPath: readonly string[],
  taskOrdinal: number | null,
  attempt: number,
  retryPath: readonly number[],
): ProspectiveTerm | null {
  switch (term.kind) {
    case "c_of":
    case "c_workflow":
    case "c_identity":
      return { term, nodeRef, termPath, taskOrdinal, attempt, retryPath };
    case "c_compose":
      return term.terms[0] === undefined ? null : firstProspectiveTerm(
        term.terms[0], nodeRef, [...termPath, "terms", "0"], taskOrdinal,
        attempt, retryPath,
      );
    case "c_edge":
      return firstProspectiveTerm(
        term.transform, nodeRef, [...termPath, "transform"], taskOrdinal,
        attempt, retryPath,
      );
    case "c_batch":
      return term.tasks[0] === undefined ? null : firstProspectiveTerm(
        term.tasks[0], nodeRef, [...termPath, "tasks", "0"], 0,
        attempt, retryPath,
      );
    case "c_retry":
      return firstProspectiveTerm(
        term.term, nodeRef, [...termPath, "term"], taskOrdinal, 1,
        [...retryPath, 1],
      );
  }
}

function deriveProspectiveCCall(
  prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursorCandidate,
): DeclaredCRetryProspectiveCCall | null {
  const declared = resolveCProgramTermAtSourcePath(
    graph.template,
    cursor.currentNodeRef,
    cursor.termPath,
  );
  if (declared.kind === "c_source_path_refusal") return null;
  const prospective = firstProspectiveTerm(
    declared,
    cursor.currentNodeRef,
    cursor.termPath,
    cursor.taskOrdinal,
    cursor.attempt,
    cursor.retryPath,
  );
  if (prospective === null) return null;
  const cursorBody = {
    programRef: cursor.programRef,
    executionBasisRef: cursor.executionBasisRef,
    traversalScopeRef: cursor.traversalScopeRef,
    runId: cursor.runId,
    graphCallId: cursor.graphCallId,
    frameId: cursor.frameId,
    graphRef: cursor.graphRef,
    inputRef: cursor.inputRef,
    inputDigest: cursor.inputDigest,
    currentNodeRef: prospective.nodeRef,
    position: "at_term" as const,
    termPath: prospective.termPath,
    taskOrdinal: prospective.taskOrdinal,
    attempt: prospective.attempt,
    retryPath: prospective.retryPath,
  };
  const cursorDigest = sha256Canonical(cursorBody as unknown as JsonValue);
  const cursorRef =
    `traversal-cursor://abiogenesis/${cursorDigest.slice("sha256:".length)}`;
  if (prospective.term.kind === "c_identity") {
    return deepFreeze({
      kind: "declared_c_retry_prospective_structural_identity" as const,
      schemaVersion: "5.0.0" as const,
      nodeRef: prospective.nodeRef,
      termPath: prospective.termPath,
      taskOrdinal: prospective.taskOrdinal,
      attempt: prospective.attempt,
      retryPath: prospective.retryPath,
      cursorRef,
      cursorDigest,
    });
  }
  const basis = rehydrateExecutionBasisAtPrefix(
    prefix,
    cursor.executionBasisRef,
  );
  if (basis === null) return null;
  const commonIdentity = {
    basisId: basis.basisRef,
    graphCallId: cursor.graphCallId,
    frameId: cursor.frameId,
    vectorIndex: prospective.term.kind === "c_of"
      ? prospective.term.vectorIndex
      : 0,
    stageRole: prospective.term.kind === "c_of"
      ? prospective.term.stageRole
      : "workflow",
    taskOrdinal: prospective.taskOrdinal,
    attempt: prospective.attempt,
    retryPath: prospective.retryPath,
  };
  let programLocusRef: string;
  let identity: Readonly<Record<string, JsonValue>>;
  if (prospective.term.kind === "c_of") {
    programLocusRef = prospective.term.programLocusRef;
    identity = { ...commonIdentity, programLocusRef } as unknown as Readonly<
      Record<string, JsonValue>
    >;
  } else if (prospective.term.kind === "c_workflow") {
    const childGraphFunctionRef = prospective.term.graphFunctionRef;
    const implementationSet = rehydrateAdmittedImplementationSetAtPrefix(
      prefix,
      basis.rootImplementationSetRef,
    );
    const failureContracts = implementationSet === null ? [] : [
      ...new Set(implementationSet.rows.filter((row) =>
        row.graphFunctionRef === childGraphFunctionRef
      ).map((row) => row.failureContractRef)),
    ];
    if (failureContracts.length !== 1) return null;
    const locusDigest = sha256Canonical({
      graphFunctionRef: basis.graphFunctionRef,
      nodeRef: prospective.nodeRef,
      termPath: prospective.termPath,
      childGraphFunctionRef,
    } as unknown as JsonValue);
    programLocusRef =
      `workflow-locus://abiogenesis/${locusDigest.slice("sha256:".length)}`;
    identity = {
      ...commonIdentity,
      programLocusRef,
      childGraphFunctionRef,
      failureContractRef: failureContracts[0]!,
    } as unknown as Readonly<Record<string, JsonValue>>;
  } else return null;
  const cCallDigest = sha256Canonical(identity as unknown as JsonValue);
  return deepFreeze({
    kind: "declared_c_retry_prospective_c_call" as const,
    schemaVersion: "5.0.0" as const,
    callClass: prospective.term.kind === "c_of" ? "leaf" as const : "workflow" as const,
    cCallRef: `c-call:${cCallDigest}`,
    cCallDigest,
    programLocusRef,
    nodeRef: prospective.nodeRef,
    termPath: prospective.termPath,
    taskOrdinal: prospective.taskOrdinal,
    attempt: prospective.attempt,
    retryPath: prospective.retryPath,
    cursorRef,
    cursorDigest,
  });
}

function typedCCallPhase(
  prefix: ValidatedRuntimeEventPrefix,
  events: readonly RuntimeEvent[],
  graph: Readonly<GtlGraph>,
  graphFunction: Readonly<GraphFunction>,
  cCallRef: string,
  sourceCursors: readonly TraversalCursorCandidate[],
): DeclaredCRetryCCallPhase | null {
  const opened = events.find((event) =>
    event.kind === "c_call_opened" && event.aggregateId === cCallRef &&
    isRecord(event.payload)
  );
  if (opened === undefined || !isRecord(opened.payload)) return null;
  const openedPayload = opened.payload;
  const sourceCursor = sourceCursors.find((cursor) =>
    cursor.cursorRef === openedPayload.cursorRef &&
    cursor.cursorDigest === openedPayload.cursorDigest
  );
  if (sourceCursor === undefined) return null;
  const cCall = projectOpenedCCallCarrierAtPrefix(
    prefix,
    graph,
    cCallRef,
    sourceCursor,
    graphFunction,
  );
  if (cCall === null) return null;
  const phaseProjection = projectCCallCarrierPhaseAtPrefix(prefix, cCall);
  if (phaseProjection === null || phaseProjection.phase === "not_open") return null;
  if (
    phaseProjection.phase === "selected_no_evidence" ||
    phaseProjection.phase === "evidencing"
  ) return deepFreeze({
    kind: "declared_c_retry_c_call_phase" as const,
    schemaVersion: "5.0.0" as const,
    phase: phaseProjection.phase,
    sourceCursor,
    cCall,
    phaseProjection,
    result: null,
    judgment: null,
  });
  const resultEvent = phaseProjection.resultEventRef === null ? undefined :
    events.find((event) => event.eventId === phaseProjection.resultEventRef);
  if (
    resultEvent?.kind !== "c_call_result_admitted" ||
    !isRecord(resultEvent.payload)
  ) return null;
  const result = deepFreeze({
    ...resultEvent.payload,
    kind: "admitted_c_call_result" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    admissionEventRef: resultEvent.eventId,
  }) as unknown as AdmittedCCallResult;
  if (projectAdmittedCCallResultAtPrefix(prefix, cCall, result) === null) {
    return null;
  }
  if (phaseProjection.phase === "result_admitted") return deepFreeze({
    kind: "declared_c_retry_c_call_phase" as const,
    schemaVersion: "5.0.0" as const,
    phase: "result_admitted" as const,
    sourceCursor,
    cCall,
    phaseProjection,
    result,
    judgment: null,
  });
  const judgmentEvent = phaseProjection.judgmentEventRef === null ? undefined :
    events.find((event) => event.eventId === phaseProjection.judgmentEventRef);
  if (
    judgmentEvent?.kind !== "c_call_judged" ||
    !isRecord(judgmentEvent.payload)
  ) return null;
  const judgment = deepFreeze({
    ...judgmentEvent.payload,
    kind: "admitted_c_call_judgment" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    admissionEventRef: judgmentEvent.eventId,
  }) as unknown as AdmittedCCallJudgment;
  if (
    projectAdmittedCCallOutcomeAtPrefix(prefix, cCall, result, judgment) === null
  ) return null;
  return deepFreeze({
    kind: "declared_c_retry_c_call_phase" as const,
    schemaVersion: "5.0.0" as const,
    phase: "judged" as const,
    sourceCursor,
    cCall,
    phaseProjection,
    result,
    judgment,
  });
}

function deriveHistoricalContinuationCursor(
  prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  source: TraversalCursorCandidate,
  completedInput: Readonly<{
    inputRef: string;
    inputDigest: Sha256Digest;
  }>,
  target: Readonly<{
    cursorRef: string;
    cursorDigest: Sha256Digest;
  }>,
): TraversalCursorCandidate | null {
  const continuation = deriveCContinuationTarget(graph, {
    nodeRef: source.currentNodeRef,
    termPath: source.termPath,
    taskOrdinal: source.taskOrdinal,
    attempt: source.attempt,
    retryPath: source.retryPath,
    inputRef: source.inputRef,
    inputDigest: source.inputDigest,
  }, completedInput);
  if (
    continuation.kind === "c_source_path_refusal" ||
    continuation.disposition !== "advance" ||
    continuation.nodeRef === null || continuation.termPath === null ||
    continuation.inputRef === null || continuation.inputDigest === null ||
    continuation.attempt === null
  ) return null;
  const cursorBody = {
    programRef: source.programRef,
    executionBasisRef: source.executionBasisRef,
    traversalScopeRef: source.traversalScopeRef,
    runId: source.runId,
    graphCallId: source.graphCallId,
    frameId: source.frameId,
    graphRef: source.graphRef,
    inputRef: continuation.inputRef,
    inputDigest: continuation.inputDigest,
    currentNodeRef: continuation.nodeRef,
    position: "at_term" as const,
    termPath: continuation.termPath,
    taskOrdinal: continuation.taskOrdinal,
    attempt: continuation.attempt,
    retryPath: continuation.retryPath,
  };
  const cursorDigest = sha256Canonical(cursorBody as unknown as JsonValue);
  const candidate = deepFreeze({
    kind: "traversal_cursor" as const,
    schemaVersion: "5.0.0" as const,
    cursorRef:
      `traversal-cursor://abiogenesis/${cursorDigest.slice("sha256:".length)}`,
    cursorDigest,
    ...cursorBody,
  });
  return candidate.cursorRef === target.cursorRef &&
      candidate.cursorDigest === target.cursorDigest &&
      hasAdmittedTraversalCursorAtPrefix(prefix, candidate)
    ? candidate
    : null;
}

interface UniqueStructuralAdvanceLineage {
  readonly currentCursor: TraversalCursorCandidate;
  readonly lineage: readonly DeclaredStructuralAdvanceProjection[];
}

function projectUniqueStructuralAdvanceLineage(
  prefix: ValidatedRuntimeEventPrefix,
  authorityPrefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  graphFunction: Readonly<GraphFunction>,
  routeEvents: readonly HistoricalTraversalRouteProjection[],
  sourceCursor: TraversalCursorCandidate,
  target: Readonly<{
    cursorRef: string;
    cursorDigest: Sha256Digest;
  }>,
  afterAdmissionOrdinal: number,
  beforeAdmissionOrdinal: number,
): UniqueStructuralAdvanceLineage | null {
  const isTarget = (candidate: TraversalCursorCandidate): boolean =>
    candidate.cursorRef === target.cursorRef &&
    candidate.cursorDigest === target.cursorDigest;
  if (isTarget(sourceCursor)) return deepFreeze({
    currentCursor: sourceCursor,
    lineage: Object.freeze([]) as readonly DeclaredStructuralAdvanceProjection[],
  });

  const lineage: DeclaredStructuralAdvanceProjection[] = [];
  const seen = new Set<string>([
    `${sourceCursor.cursorRef}\0${sourceCursor.cursorDigest}`,
  ]);
  let current = sourceCursor;
  let priorOrdinal = afterAdmissionOrdinal;
  for (let step = 0; step <= routeEvents.length; step += 1) {
    const outgoing = routeEvents.filter((route) =>
      route.admissionOrdinal > afterAdmissionOrdinal &&
      route.admissionOrdinal < beforeAdmissionOrdinal &&
      route.admissionOrdinal > priorOrdinal &&
      route.sourceCursorRef === current.cursorRef &&
      route.sourceCursorDigest === current.cursorDigest
    );
    if (outgoing.length !== 1) return null;
    const route = outgoing[0]!;
    if (
      route.routeKind !== "advance" ||
      route.cCallRef !== null || route.judgmentRef !== null ||
      route.contractRef !== null ||
      route.consumedAvailabilityRefs.length !== 0
    ) return null;
    const projection = projectDeclaredStructuralAdvanceAtPrefix(
      prefix,
      graph,
      graphFunction,
      current,
      route.admissionEventRef,
      authorityPrefix,
    );
    if (projection === null) return null;
    const targetIdentity =
      `${projection.targetCursor.cursorRef}\0${projection.targetCursor.cursorDigest}`;
    if (seen.has(targetIdentity)) return null;
    lineage.push(projection);
    seen.add(targetIdentity);
    current = projection.targetCursor;
    priorOrdinal = route.admissionOrdinal;
    if (isTarget(current)) return deepFreeze({
      currentCursor: current,
      lineage: Object.freeze([...lineage]),
    });
  }
  return null;
}

function projectExactInteractionResumeSuccessorAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  heldCursor: TraversalCursorCandidate,
): Readonly<{
  readonly cursor: TraversalCursorCandidate;
  readonly resumeEventRef: string;
}> | null {
  if (!isTraversalCursorCandidate(heldCursor)) return null;
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const projections = events.flatMap((resumeEvent) => {
    if (
      resumeEvent.kind !== "fh_interaction_resume_admitted" ||
      resumeEvent.runId !== heldCursor.runId ||
      resumeEvent.graphCallId !== heldCursor.graphCallId ||
      resumeEvent.frameId !== heldCursor.frameId ||
      !isRecord(resumeEvent.payload) ||
      !nonEmptyString(resumeEvent.payload.openedEventRef) ||
      !nonEmptyString(resumeEvent.payload.continuationRef) ||
      resumeEvent.payload.continuationRef !== resumeEvent.aggregateId ||
      !nonEmptyString(resumeEvent.payload.successorInputRef) ||
      !digestValue(resumeEvent.payload.successorInputDigest) ||
      !nonEmptyString(resumeEvent.payload.successorCursorRef) ||
      !digestValue(resumeEvent.payload.successorCursorDigest)
    ) return [];
    const resumePayload = resumeEvent.payload;
    const successorInputRef = resumePayload.successorInputRef as string;
    const successorInputDigest =
      resumePayload.successorInputDigest as Sha256Digest;
    const successorCursorRef = resumePayload.successorCursorRef as string;
    const successorCursorDigest =
      resumePayload.successorCursorDigest as Sha256Digest;
    const opened = events.filter((event) =>
      event.kind === "fh_interaction_opened" &&
      event.eventId === resumePayload.openedEventRef &&
      event.aggregateId === resumeEvent.aggregateId &&
      event.runId === heldCursor.runId &&
      event.graphCallId === heldCursor.graphCallId &&
      event.frameId === heldCursor.frameId &&
      event.admissionOrdinal < resumeEvent.admissionOrdinal &&
      isRecord(event.payload) &&
      event.payload.continuationRef === event.aggregateId &&
      event.payload.heldCursorRef === heldCursor.cursorRef &&
      event.payload.heldCursorDigest === heldCursor.cursorDigest &&
      sha256Canonical(event.payload.heldCursor as JsonValue) ===
        sha256Canonical(heldCursor as unknown as JsonValue)
    );
    if (opened.length !== 1) return [];
    const body = {
      programRef: heldCursor.programRef,
      executionBasisRef: heldCursor.executionBasisRef,
      traversalScopeRef: heldCursor.traversalScopeRef,
      runId: heldCursor.runId,
      graphCallId: heldCursor.graphCallId,
      frameId: heldCursor.frameId,
      graphRef: heldCursor.graphRef,
      inputRef: successorInputRef,
      inputDigest: successorInputDigest,
      currentNodeRef: heldCursor.currentNodeRef,
      position: heldCursor.position,
      termPath: heldCursor.termPath,
      taskOrdinal: heldCursor.taskOrdinal,
      attempt: heldCursor.attempt,
      retryPath: heldCursor.retryPath,
    };
    const cursorDigest = sha256Canonical(body as unknown as JsonValue);
    const cursor = deepFreeze({
      kind: "traversal_cursor" as const,
      schemaVersion: "5.0.0" as const,
      cursorRef:
        `traversal-cursor://abiogenesis/${cursorDigest.slice("sha256:".length)}`,
      cursorDigest,
      ...body,
    });
    return cursor.cursorRef !== heldCursor.cursorRef &&
        cursor.cursorDigest !== heldCursor.cursorDigest &&
        cursor.cursorRef === successorCursorRef &&
        cursor.cursorDigest === successorCursorDigest &&
        isInteractionResumeCursorSuccessorAtPrefix(
          prefix,
          heldCursor,
          {
            inputRef: successorInputRef,
            inputDigest: successorInputDigest,
          },
          cursor,
        ) &&
        hasAdmittedTraversalCursorAtPrefix(prefix, cursor)
      ? [deepFreeze({ cursor, resumeEventRef: resumeEvent.eventId })]
      : [];
  });
  return projections.length === 1 ? projections[0]! : null;
}

export function projectDeclaredCRetryFrontier(
  prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursorCandidate,
  graphFunction: Readonly<GraphFunction>,
  retryDepth: number = cursor.retryPath.length,
  authorityPrefix: ValidatedRuntimeEventPrefix = prefix,
): DeclaredCRetryFrontier | null {
  if (
    !isMaterializedGtlGraph(graph) ||
    !isTraversalCursorCandidate(cursor) ||
    !hasAdmittedTraversalCursorAtPrefix(prefix, cursor) ||
    cursor.graphRef !== graph.materializationRef ||
    graphFunction.name !== graph.graphFunctionRef ||
    sha256Canonical(graphFunction as unknown as JsonValue) !==
      graph.graphFunctionDigest ||
    !Number.isSafeInteger(retryDepth) || retryDepth < 1 ||
    retryDepth > cursor.retryPath.length
  ) return null;
  const contexts = resolveEnclosingCRetryContexts(
    graph.template,
    cursor.currentNodeRef,
    cursor.termPath,
  );
  if ("kind" in contexts) return null;
  const context = contexts.find((candidate) => candidate.retryDepth === retryDepth);
  if (context === undefined) return null;

  const events = runtimeEventsFromValidatedPrefix(prefix);
  const calculus = deriveRuntimeEventCalculusProjection(prefix);
  const boundaryRef = retryBoundaryRef(graph, cursor, context);
  const sameBoundaryEvent = (event: RuntimeEvent): boolean =>
    event.runId === cursor.runId &&
    event.graphCallId === cursor.graphCallId &&
    event.frameId === cursor.frameId &&
    event.aggregateType === "frame" &&
    event.aggregateId === cursor.frameId &&
    event.parentAggregateId === cursor.graphCallId &&
    event.basisId === cursor.executionBasisRef &&
    event.materializationRef === graph.materializationRef &&
    isRecord(event.payload) &&
    event.payload.retryBoundaryRef === boundaryRef;
  const runActive = holdsAt(calculus, constructRuntimeFluent({
    name: "run_active",
    identity: cursor.runId,
  }));

  const attemptEvents = events.filter((event) =>
    event.kind === "retry_attempt_opened" && sameBoundaryEvent(event)
  );
  const projectedAttempts = attemptEvents.map((event) => ({
    event,
    attempt: projectRetryAttempt(prefix, graph, event.eventId),
    derivedCursor: deriveRetryAttemptCursor(prefix, graph, event),
  })).sort((left, right) => {
    const leftAttempt = left.attempt?.attempt ?? Number.MAX_SAFE_INTEGER;
    const rightAttempt = right.attempt?.attempt ?? Number.MAX_SAFE_INTEGER;
    return leftAttempt - rightAttempt ||
      left.event.admissionOrdinal - right.event.admissionOrdinal;
  });
  const retryPathPrefix = cursor.retryPath.slice(0, retryDepth - 1);
  if (
    attemptEvents.length > context.budget ||
    projectedAttempts.some(({ attempt, derivedCursor }, index) =>
      attempt === null || derivedCursor === null ||
      attempt.attempt !== index + 1 ||
      attempt.retryBoundaryRef !== boundaryRef ||
      attempt.budget !== context.budget ||
      attempt.retryTermPath.length !== context.retryTermPath.length ||
      !sameStrings(attempt.retryTermPath, context.retryTermPath) ||
      !sameStrings(attempt.wrappedTermPath, context.wrappedTermPath) ||
      attempt.taskOrdinal !== context.taskOrdinal ||
      attempt.inputContractRef !== context.inputCarrierRef ||
      !sameNumbers(attempt.retryPath, [...retryPathPrefix, index + 1]) ||
      derivedCursor.runId !== cursor.runId ||
      derivedCursor.graphCallId !== cursor.graphCallId ||
      derivedCursor.frameId !== cursor.frameId
    ) ||
    new Set(projectedAttempts.map(({ attempt }) =>
      attempt?.attemptManifestRef)).size !== projectedAttempts.length
  ) return null;

  const progressEvents = events.filter((event) =>
    event.kind === "retry_progress_recorded" && sameBoundaryEvent(event)
  );
  const projectedProgresses = progressEvents.map((event) => ({
    event,
    progress: projectAdmittedRetryProgress(
      prefix,
      event.eventId,
      authorityPrefix,
    ),
  }));
  if (
    projectedProgresses.some(({ progress }) => progress === null) ||
    projectedProgresses.length > projectedAttempts.length
  ) return null;
  const allRouteProjections = projectHistoricalTraversalRoutesAtPrefix(
    prefix,
    authorityPrefix,
  );
  if (allRouteProjections === null) return null;
  const routeEvents = allRouteProjections.filter((route) =>
    route.runId === cursor.runId &&
    route.graphCallId === cursor.graphCallId &&
    route.frameId === cursor.frameId &&
    route.executionBasisRef === cursor.executionBasisRef &&
    route.materializationRef === graph.materializationRef
  );
  if (projectedAttempts.length === 0) {
    const entryRoutes = routeEvents.filter((route) =>
      isDeclaredCRetryAttemptOrigin(route) &&
      route.targetCursorRef === cursor.cursorRef &&
      route.targetCursorDigest === cursor.cursorDigest
    );
    const entryRouteCandidate = entryRoutes.length === 1
      ? entryRoutes[0]!
      : null;
    const entryRoute = entryRouteCandidate !== null &&
        isDeclaredCRetryAttemptOrigin(entryRouteCandidate)
      ? entryRouteCandidate
      : null;
    if (
      entryRoute === null || progressEvents.length !== 0 ||
      entryRoute.cCallRef !== null || entryRoute.judgmentRef !== null ||
      entryRoute.consumedAvailabilityRefs.length !== 0 ||
      !runActive ||
      !holdsAt(calculus, constructRuntimeFluent({
        name: "locus_active",
        identity: cursor.cursorRef,
      }))
    ) return null;
    const body = {
      kind: "declared_c_retry_eligible_frontier" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "projected" as const,
      selectedPrefixDigest: sha256Canonical(events as unknown as JsonValue),
      lastAdmissionOrdinal: events.at(-1)?.admissionOrdinal ?? 0,
      runId: cursor.runId,
      graphCallId: cursor.graphCallId,
      frameId: cursor.frameId,
      graphRef: graph.materializationRef,
      retryBoundaryRef: boundaryRef,
      retryTermPath: context.retryTermPath,
      wrappedTermPath: context.wrappedTermPath,
      taskOrdinal: context.taskOrdinal,
      retryDepth,
      budget: context.budget,
      inputCarrierRef: context.inputCarrierRef,
      state: "eligible" as const,
      attemptCoverage: Object.freeze([]) as readonly number[],
      progressCoverage: Object.freeze([]) as readonly number[],
      rows: Object.freeze([]) as readonly DeclaredCRetryAttemptRow[],
      remainingBudget: context.budget,
      nextAttempt: 1,
      currentCursor: cursor,
      eligibilityRoute: entryRoute,
      latestFailure: null,
      stationarity: deepFreeze({ kind: "not_stationary" as const }),
    };
    const projectionDigest = sha256Canonical(body as unknown as JsonValue);
    return deepFreeze({
      ...body,
      projectionRef:
        `declared-c-retry-frontier://abiogenesis/${projectionDigest.slice("sha256:".length)}`,
      projectionDigest,
    });
  }

  const rows: DeclaredCRetryAttemptRow[] = [];
  for (const [index, projectedAttempt] of projectedAttempts.entries()) {
    const attempt = projectedAttempt.attempt!;
    const attemptEvent = projectedAttempt.event;
    const originRoutes = routeEvents.filter((route) =>
      isDeclaredCRetryAttemptOrigin(route) &&
      attemptEvent.causationEventRefs.length === 1 &&
      attemptEvent.causationEventRefs[0] === route.admissionEventRef &&
      route.admissionOrdinal < attemptEvent.admissionOrdinal &&
      route.routeRef === attempt.priorRouteRef &&
      route.targetCursorRef === projectedAttempt.derivedCursor!.cursorRef &&
      route.targetCursorDigest === projectedAttempt.derivedCursor!.cursorDigest
    );
    if (originRoutes.length !== 1) return null;
    const originRouteCandidate = originRoutes[0]!;
    if (!isDeclaredCRetryAttemptOrigin(originRouteCandidate)) return null;
    const originRoute = originRouteCandidate;
    const progressRows = projectedProgresses.filter(({ progress }) =>
      progress!.attempt === attempt.attempt
    );
    if (progressRows.length > 1 || (index < projectedAttempts.length - 1 &&
      progressRows.length !== 1)) return null;
    const progressRow = progressRows[0] ?? null;
    const progress = progressRow?.progress ?? null;
    const progressEvent = progressRow?.event ?? null;
    if (
      progress !== null && (
        progress.retryBoundaryRef !== boundaryRef ||
        progress.attemptRef !== attempt.attemptRef ||
        !sameNumbers(progress.retryPath, attempt.retryPath) ||
        progressEvent === null ||
        progressEvent.admissionOrdinal <= attemptEvent.admissionOrdinal
      )
    ) return null;

    const nextAttemptOrdinal = projectedAttempts[index + 1]?.event
      .admissionOrdinal ?? Number.MAX_SAFE_INTEGER;
    const progressOrdinal = progressEvent?.admissionOrdinal ??
      Number.MAX_SAFE_INTEGER;
    const intervalEnd = Math.min(nextAttemptOrdinal, progressOrdinal);
    const openedEvents = events.filter((event) =>
      event.kind === "c_call_opened" &&
      event.runId === cursor.runId &&
      event.graphCallId === cursor.graphCallId &&
      event.frameId === cursor.frameId &&
      event.basisId === cursor.executionBasisRef &&
      event.materializationRef === graph.materializationRef &&
      event.admissionOrdinal > attemptEvent.admissionOrdinal &&
      event.admissionOrdinal < intervalEnd && isRecord(event.payload) &&
      event.payload.attempt === attempt.attempt &&
      sameNumbers(
        positiveIntegerValues(event.payload.retryPath) ?? [],
        attempt.retryPath,
      )
    );
    const sourceCursors: TraversalCursorCandidate[] = [
      projectedAttempt.derivedCursor!,
    ];
    const exactCCalls: DeclaredCRetryCCallPhase[] = [];
    const structuralAdvanceLineage: DeclaredStructuralAdvanceProjection[] = [];
    let foldCursor = projectedAttempt.derivedCursor!;
    let foldAdmissionOrdinal = attemptEvent.admissionOrdinal;
    let latestContinuationRoute: HistoricalTraversalRouteProjection | null =
      null;
    for (const [openedIndex, opened] of openedEvents.entries()) {
      if (!isRecord(opened.payload)) return null;
      const openedPayload = opened.payload;
      if (
        typeof openedPayload.cursorRef !== "string" ||
        !digestValue(openedPayload.cursorDigest)
      ) return null;
      const sourceLineage = projectUniqueStructuralAdvanceLineage(
        prefix,
        authorityPrefix,
        graph,
        graphFunction,
        routeEvents,
        foldCursor,
        {
          cursorRef: openedPayload.cursorRef,
          cursorDigest: openedPayload.cursorDigest,
        },
        foldAdmissionOrdinal,
        opened.admissionOrdinal,
      );
      if (sourceLineage === null) return null;
      structuralAdvanceLineage.push(...sourceLineage.lineage);
      const sourceCursor = sourceLineage.currentCursor;
      if (!sourceCursors.some((candidate) =>
        candidate.cursorRef === sourceCursor.cursorRef &&
        candidate.cursorDigest === sourceCursor.cursorDigest
      )) sourceCursors.push(sourceCursor);
      const phase = typedCCallPhase(
        prefix,
        events,
        graph,
        graphFunction,
        opened.aggregateId,
        [sourceCursor],
      );
      if (phase === null) return null;
      exactCCalls.push(phase);
      foldCursor = sourceCursor;
      foldAdmissionOrdinal = opened.admissionOrdinal;
      latestContinuationRoute = null;
      if (phase.phase !== "judged") continue;
      const judgmentEvent = events.find((event) =>
        event.eventId === phase.judgment.admissionEventRef
      );
      if (judgmentEvent === undefined) return null;
      const nextOpenedOrdinal = openedEvents[openedIndex + 1]
        ?.admissionOrdinal ?? intervalEnd;
      const continuationRoutes = routeEvents.filter((route) =>
        route.admissionOrdinal > judgmentEvent.admissionOrdinal &&
        route.admissionOrdinal < nextOpenedOrdinal &&
        route.sourceCursorRef === sourceCursor.cursorRef &&
        route.sourceCursorDigest === sourceCursor.cursorDigest &&
        route.cCallRef === phase.cCall.cCallRef &&
        route.judgmentRef === phase.judgment.judgmentRef
      );
      if (continuationRoutes.length > 1) return null;
      const continuationRoute = continuationRoutes[0] ?? null;
      latestContinuationRoute = continuationRoute;
      if (
        continuationRoute?.routeKind === "advance" &&
        continuationRoute.targetCursorRef !== null &&
        continuationRoute.targetCursorDigest !== null
      ) {
        const targetCursor = deriveHistoricalContinuationCursor(
          prefix,
          graph,
          sourceCursor,
          {
            inputRef: phase.result.resultRef,
            inputDigest: phase.result.valueDigest,
          },
          {
            cursorRef: continuationRoute.targetCursorRef,
            cursorDigest: continuationRoute.targetCursorDigest,
          },
        );
        if (targetCursor === null) return null;
        sourceCursors.push(targetCursor);
        foldCursor = targetCursor;
        foldAdmissionOrdinal = continuationRoute.admissionOrdinal;
      } else {
        foldAdmissionOrdinal = judgmentEvent.admissionOrdinal;
      }
    }
    if (
      new Set(exactCCalls.map((phase) => phase.cCall.cCallRef)).size !==
        exactCCalls.length ||
      new Set(structuralAdvanceLineage.map((edge) =>
        edge.route.admissionEventRef)).size !== structuralAdvanceLineage.length
    ) return null;

    const attemptActive = holdsAt(
      calculus,
      constructScopedRetryFluent("retry_attempt_active", {
        runId: cursor.runId,
        graphCallId: cursor.graphCallId,
        frameId: cursor.frameId,
        retryBoundaryRef: boundaryRef,
        authorityRef: attempt.attemptRef,
      }),
    );
    if ((progress === null) !== attemptActive) return null;
    const progressAvailable = progress === null ? false : holdsAt(
      calculus,
      constructScopedRetryFluent("retry_progress_available", {
        runId: cursor.runId,
        graphCallId: cursor.graphCallId,
        frameId: cursor.frameId,
        retryBoundaryRef: boundaryRef,
        authorityRef: progress.progressRef,
      }),
    );
    const citingRoutes = progress === null || progressEvent === null
      ? []
      : routeEvents.filter((route) =>
        route.admissionOrdinal > progressEvent.admissionOrdinal &&
        route.consumedAvailabilityRefs.includes(progress.progressRef)
      );
    const consumingRoutes = progress === null || progressEvent === null
      ? []
      : citingRoutes.filter((route) =>
        routeConsumesRetryProgress(route, progressEvent, progress)
      );
    if (
      citingRoutes.length !== consumingRoutes.length ||
      consumingRoutes.length > 1 ||
      (progress !== null && progressAvailable !== (consumingRoutes.length === 0))
    ) return null;
    const consumingRoute = consumingRoutes[0] ?? null;

    if (index === 0) {
      if (
        attempt.priorJudgmentRef !== null ||
        originRoute.cCallRef !== null || originRoute.judgmentRef !== null ||
        originRoute.consumedAvailabilityRefs.length !== 0
      ) return null;
    } else {
      const prior = rows[index - 1]!;
      if (
        prior.progress === null || prior.progress.progressClass !== "retry" ||
        prior.consumption.kind !== "progress_consumed_by_retry" ||
        prior.consumption.route.admissionEventRef !==
          originRoute.admissionEventRef ||
        attempt.priorJudgmentRef !== prior.progress.judgmentRef ||
        originRoute.cCallRef !== prior.progress.cCallRef ||
        originRoute.judgmentRef !== prior.progress.judgmentRef ||
        !sameStrings(
          originRoute.consumedAvailabilityRefs,
          [prior.progress.judgmentRef, prior.progress.progressRef],
        ) ||
        originRoute.causationEventRefs[0] !== prior.progressEventRef
      ) return null;
    }
    if (
      progress !== null && index < projectedAttempts.length - 1 &&
      progress.progressClass !== "retry"
    ) return null;
    const rowBase = {
      schemaVersion: "5.0.0" as const,
      attempt,
      attemptEventRef: attemptEvent.eventId,
      attemptAdmissionOrdinal: attemptEvent.admissionOrdinal,
      attemptManifestRef: attempt.attemptManifestRef,
      originRoute,
      cursor: projectedAttempt.derivedCursor!,
    };
    if (progress === null) {
      if (index !== projectedAttempts.length - 1) return null;
      const unfinished = exactCCalls.filter((phase) => phase.phase !== "judged");
      if (unfinished.length > 1 ||
        (unfinished.length === 1 && unfinished[0] !== exactCCalls.at(-1))) {
        return null;
      }
      const latestCall = exactCCalls.at(-1) ?? null;
      const latestAdvanced = latestCall?.phase === "judged" &&
        latestContinuationRoute?.routeKind === "advance" &&
        latestContinuationRoute.targetCursorRef === foldCursor.cursorRef &&
        latestContinuationRoute.targetCursorDigest === foldCursor.cursorDigest;
      const isAtDirectFrontier = exactCCalls.length === 0 || latestAdvanced;
      const historicalCalls = isAtDirectFrontier
        ? exactCCalls
        : exactCCalls.slice(0, -1);
      for (const historical of historicalCalls) {
        if (historical.phase !== "judged") return null;
        const historicalJudgmentEvent = events.find((event) =>
          event.eventId === historical.judgment.admissionEventRef
        );
        if (historicalJudgmentEvent === undefined) return null;
        const consumers = routeEvents.filter((route) =>
          route.admissionOrdinal > historicalJudgmentEvent.admissionOrdinal &&
          route.causationEventRefs.includes(
            historicalJudgmentEvent.eventId,
          ) &&
          route.cCallRef === historical.cCall.cCallRef &&
          route.judgmentRef === historical.judgment.judgmentRef &&
          route.consumedAvailabilityRefs.includes(
            historical.judgment.judgmentRef,
          )
        );
        if (consumers.length !== 1) return null;
      }
      if (
        isAtDirectFrontier && cursor.retryPath.length === retryDepth
      ) {
        if (!sameNumbers(cursor.retryPath, attempt.retryPath)) return null;
        const finalLineage = projectUniqueStructuralAdvanceLineage(
          prefix,
          authorityPrefix,
          graph,
          graphFunction,
          routeEvents,
          foldCursor,
          cursor,
          foldAdmissionOrdinal,
          intervalEnd,
        );
        if (finalLineage === null) return null;
        structuralAdvanceLineage.push(...finalLineage.lineage);
        if (new Set(structuralAdvanceLineage.map((edge) =>
          edge.route.admissionEventRef)).size !==
          structuralAdvanceLineage.length) return null;
        const ownedCursors = [
          projectedAttempt.derivedCursor!,
          ...sourceCursors,
          ...structuralAdvanceLineage.map((edge) => edge.targetCursor),
        ].filter((candidate, candidateIndex, candidates) =>
          candidates.findIndex((prior) =>
            prior.cursorRef === candidate.cursorRef &&
            prior.cursorDigest === candidate.cursorDigest
          ) === candidateIndex
        );
        const activeCursors = ownedCursors.filter((candidate) =>
          holdsAt(calculus, constructRuntimeFluent({
            name: "locus_active",
            identity: candidate.cursorRef,
          }))
        );
        if (
          activeCursors.length !== 1 ||
          activeCursors[0]!.cursorRef !== cursor.cursorRef ||
          activeCursors[0]!.cursorDigest !== cursor.cursorDigest
        ) return null;
        const prospective = deriveProspectiveCCall(prefix, graph, cursor);
        if (prospective === null) return null;
        rows.push(deepFreeze({
          ...rowBase,
          kind: "declared_c_retry_pre_c_call_attempt" as const,
          currentCursor: cursor,
          cCallState: deepFreeze({
            kind: "not_open" as const,
            cursorRef: cursor.cursorRef,
            cursorDigest: cursor.cursorDigest,
            prospective,
          }),
          cCalls: Object.freeze([...exactCCalls]),
          structuralAdvanceLineage:
            Object.freeze([...structuralAdvanceLineage]),
          progress: null,
          consumption: deepFreeze({ kind: "attempt_active" as const }),
        }));
        continue;
      }
      if (
        isAtDirectFrontier && cursor.retryPath.length > retryDepth &&
        sameNumbers(
          cursor.retryPath.slice(0, retryDepth),
          attempt.retryPath,
        )
      ) {
        const inner = projectDeclaredCRetryFrontier(
          prefix,
          graph,
          cursor,
          graphFunction,
          retryDepth + 1,
          authorityPrefix,
        );
        const innerEntry = inner?.rows[0] ?? null;
        if (
          inner?.state !== "attempt_active" ||
          inner.retryDepth !== retryDepth + 1 ||
          inner.active.currentCursor.cursorRef !== cursor.cursorRef ||
          inner.active.currentCursor.cursorDigest !== cursor.cursorDigest ||
          !sameNumbers(
            inner.active.attempt.retryPath.slice(0, retryDepth),
            attempt.retryPath,
          ) ||
          innerEntry === null
        ) return null;
        const lineageToInnerSource = projectUniqueStructuralAdvanceLineage(
          prefix,
          authorityPrefix,
          graph,
          graphFunction,
          routeEvents,
          foldCursor,
          {
            cursorRef: innerEntry.originRoute.sourceCursorRef,
            cursorDigest: innerEntry.originRoute.sourceCursorDigest,
          },
          foldAdmissionOrdinal,
          innerEntry.originRoute.admissionOrdinal,
        );
        if (lineageToInnerSource === null) return null;
        structuralAdvanceLineage.push(...lineageToInnerSource.lineage);
        if (new Set(structuralAdvanceLineage.map((edge) =>
          edge.route.admissionEventRef)).size !==
          structuralAdvanceLineage.length) return null;
        rows.push(deepFreeze({
          ...rowBase,
          kind: "declared_c_retry_nested_active_attempt" as const,
          currentCursor: cursor,
          cCalls: Object.freeze([...exactCCalls]),
          structuralAdvanceLineage:
            Object.freeze([...structuralAdvanceLineage]),
          inner,
          progress: null,
          consumption: deepFreeze({ kind: "attempt_active" as const }),
        }));
        continue;
      }
      if (latestCall === null) return null;
      const pending = latestCall.phase === "judged" &&
          latestCall.judgment.judgment === "pending"
        ? latestCall.cCall.regime === "F_H"
          ? "fh_pending" as const
          : "workflow_pending" as const
        : latestCall.cCall.callClass === "workflow" &&
            latestCall.phase !== "judged"
          ? "workflow_pending" as const
          : "attempt_active" as const;
      const resumed = pending === "fh_pending"
        ? projectExactInteractionResumeSuccessorAtPrefix(
            prefix,
            latestCall.sourceCursor,
          )
        : null;
      if (resumed !== null && (
        resumed.cursor.cursorRef !== cursor.cursorRef ||
        resumed.cursor.cursorDigest !== cursor.cursorDigest
      )) return null;
      rows.push(deepFreeze({
        ...rowBase,
        kind: "declared_c_retry_active_c_call_attempt" as const,
        currentCursor: resumed?.cursor ?? latestCall.sourceCursor,
        cCalls: Object.freeze([...exactCCalls]),
        structuralAdvanceLineage:
          Object.freeze([...structuralAdvanceLineage]),
        progress: null,
        consumption: deepFreeze({ kind: pending }),
      }));
      continue;
    }

    if (progressEvent === null) return null;
    if (
      consumingRoute !== null &&
      (progress.progressClass === "retry"
        ? !isDeclaredCRetryRetryConsumption(consumingRoute)
        : !isDeclaredCRetryExitConsumption(consumingRoute))
    ) return null;
    const consumption = progressAvailable
      ? deepFreeze({ kind: "progress_available" as const })
      : progress.progressClass === "retry"
        ? consumingRoute !== null &&
            isDeclaredCRetryRetryConsumption(consumingRoute)
          ? deepFreeze({
              kind: "progress_consumed_by_retry" as const,
              route: consumingRoute,
            })
          : null
        : consumingRoute === null
          ? null
          : isDeclaredCRetryExitConsumption(consumingRoute)
          ? deepFreeze({
              kind: "progress_consumed_by_exit" as const,
              route: consumingRoute,
            })
          : null;
    if (consumption === null) return null;
    const exactTerminalCall = "cCallRef" in progress
      ? typedCCallPhase(
          prefix,
          events,
          graph,
          graphFunction,
          progress.cCallRef,
          sourceCursors,
        )
      : null;
    if (progress.progressClass === "retry") {
      if (
        exactTerminalCall?.phase !== "judged" ||
        exactTerminalCall.result.resultRef !== progress.resultRef ||
        exactTerminalCall.judgment.judgmentRef !== progress.judgmentRef ||
        exactTerminalCall.judgment.judgment !== "retry" ||
        exactTerminalCall.judgment.retryAttemptRef !== attempt.attemptRef
      ) return null;
      const signal = projectCCallRuntimeFailureSignal(
        prefix,
        progress.cCallRef,
        progress.resultRef,
        progress.judgmentRef,
      );
      if (
        signal?.failureClass !== progress.failureClass ||
        signal.failureSignalRef !== progress.failureSignalRef
      ) return null;
      rows.push(deepFreeze({
        ...rowBase,
        kind: "declared_c_retry_retry_progress" as const,
        cCalls: Object.freeze([...exactCCalls]),
        structuralAdvanceLineage:
          Object.freeze([...structuralAdvanceLineage]),
        progress,
        progressEventRef: progressEvent.eventId,
        failureCCall: exactTerminalCall,
        consumption: consumption as DeclaredCRetryRetryProgressRow[
          "consumption"
        ],
      }));
      continue;
    }
    if (progress.progressClass === "stopped") {
      if (progress.stopReason === "boundary_terminal") {
        if (
          progress.predecessorProgressRef !== null ||
          exactTerminalCall?.phase !== "judged" ||
          exactTerminalCall.result.resultRef !== progress.resultRef ||
          exactTerminalCall.judgment.judgmentRef !== progress.judgmentRef ||
          exactTerminalCall.judgment.judgment !== "blocked"
        ) return null;
        rows.push(deepFreeze({
          ...rowBase,
          kind: "declared_c_retry_boundary_stopped_progress" as const,
          cCalls: Object.freeze([...exactCCalls]),
          structuralAdvanceLineage:
            Object.freeze([...structuralAdvanceLineage]),
          progress: progress as RetryBoundaryStoppedProgressAdmission,
          progressEventRef: progressEvent.eventId,
          failureCCall: exactTerminalCall,
          consumption: consumption as DeclaredCRetryBoundaryStoppedProgressRow[
            "consumption"
          ],
        }));
        continue;
      }
      if (
        progress.stopReason !== "propagated_inner_stop" ||
        progress.predecessorProgressRef === null || exactCCalls.length !== 0 ||
        retryDepth >= cursor.retryPath.length
      ) return null;
      const inner = projectDeclaredCRetryFrontier(
        prefix,
        graph,
        cursor,
        graphFunction,
        retryDepth + 1,
        authorityPrefix,
      );
      const predecessor = inner?.rows.find(
        (candidate): candidate is
          | DeclaredCRetryBoundaryStoppedProgressRow
          | DeclaredCRetryPropagatedStoppedProgressRow =>
          (candidate.kind === "declared_c_retry_boundary_stopped_progress" ||
            candidate.kind === "declared_c_retry_propagated_stopped_progress") &&
          candidate.progress.progressRef === progress.predecessorProgressRef,
      );
      if (
        predecessor === undefined ||
        progressEvent.causationEventRefs[1] !== predecessor.progressEventRef
      ) return null;
      rows.push(deepFreeze({
        ...rowBase,
        kind: "declared_c_retry_propagated_stopped_progress" as const,
        cCalls: Object.freeze([]) as readonly [],
        progress: progress as RetryPropagatedStoppedProgressAdmission,
        progressEventRef: progressEvent.eventId,
        predecessor,
        consumption: consumption as DeclaredCRetryPropagatedStoppedProgressRow[
          "consumption"
        ],
      }));
      continue;
    }
    if (progress.predecessorProgressRef !== null) {
      if (exactCCalls.length !== 0 ||
        retryDepth >= cursor.retryPath.length) return null;
      const inner = projectDeclaredCRetryFrontier(
        prefix,
        graph,
        cursor,
        graphFunction,
        retryDepth + 1,
        authorityPrefix,
      );
      const predecessor = inner?.rows.find(
        (candidate): candidate is
          | DeclaredCRetryCCallCompletedProgressRow
          | DeclaredCRetryStructuralCompletedProgressRow
          | DeclaredCRetryPropagatedCompletedProgressRow =>
          (candidate.kind === "declared_c_retry_c_call_completed_progress" ||
            candidate.kind ===
              "declared_c_retry_structural_completed_progress" ||
            candidate.kind ===
              "declared_c_retry_propagated_completed_progress") &&
          candidate.progress.progressRef === progress.predecessorProgressRef,
      );
      if (
        inner === null || inner.retryDepth !== retryDepth + 1 ||
        predecessor === undefined ||
        predecessor.progress.completedRetryDepth !== retryDepth + 1 ||
        !sameNumbers(
          predecessor.attempt.retryPath.slice(0, retryDepth),
          attempt.retryPath,
        ) ||
        progressEvent.causationEventRefs[1] !== predecessor.progressEventRef
      ) return null;
      rows.push(deepFreeze({
        ...rowBase,
        kind: "declared_c_retry_propagated_completed_progress" as const,
        cCalls: Object.freeze([]) as readonly [],
        progress: progress as RetryCompletedProgressAdmission & Readonly<{
          readonly predecessorProgressRef: string;
        }>,
        progressEventRef: progressEvent.eventId,
        predecessor,
        consumption: consumption as
          DeclaredCRetryPropagatedCompletedProgressRow["consumption"],
      }));
      continue;
    }
    if (progress.completionClass === "structural_identity_success") {
      const witness = events.find((event) =>
        event.eventId === progress.completionWitnessEventRef
      );
      const completionLineage = projectUniqueStructuralAdvanceLineage(
        prefix,
        authorityPrefix,
        graph,
        graphFunction,
        routeEvents,
        foldCursor,
        {
          cursorRef: progress.sourceCursorRef,
          cursorDigest: progress.sourceCursorDigest,
        },
        foldAdmissionOrdinal,
        progressEvent.admissionOrdinal,
      );
      if (
        witness === undefined || completionLineage === null ||
        exactCCalls.length !== 0 ||
        progress.predecessorProgressRef !== null ||
        progressEvent.causationEventRefs[1] !== witness.eventId
      ) return null;
      structuralAdvanceLineage.push(...completionLineage.lineage);
      if (new Set(structuralAdvanceLineage.map((edge) =>
        edge.route.admissionEventRef)).size !==
        structuralAdvanceLineage.length) return null;
      rows.push(deepFreeze({
        ...rowBase,
        kind: "declared_c_retry_structural_completed_progress" as const,
        cCalls: Object.freeze([]) as readonly [],
        structuralAdvanceLineage:
          Object.freeze([...structuralAdvanceLineage]),
        progress,
        progressEventRef: progressEvent.eventId,
        completionWitnessEventRef: witness.eventId,
        consumption: consumption as
          DeclaredCRetryStructuralCompletedProgressRow["consumption"],
      }));
      continue;
    }
    if (
      progress.predecessorProgressRef !== null ||
      exactTerminalCall?.phase !== "judged" ||
      exactTerminalCall.result.resultRef !== progress.resultRef ||
      exactTerminalCall.judgment.judgmentRef !== progress.judgmentRef ||
      (progress.completionClass === "fh_resume_success"
        ? exactTerminalCall.judgment.judgment !== "pending"
        : exactTerminalCall.judgment.judgment !== "advance")
    ) return null;
    rows.push(deepFreeze({
      ...rowBase,
      kind: "declared_c_retry_c_call_completed_progress" as const,
      cCalls: Object.freeze([...exactCCalls]),
      structuralAdvanceLineage:
        Object.freeze([...structuralAdvanceLineage]),
      progress,
      progressEventRef: progressEvent.eventId,
      completionCCall: exactTerminalCall,
      consumption: consumption as
        DeclaredCRetryCCallCompletedProgressRow["consumption"],
    }));
  }

  const latest = rows.at(-1) ?? null;
  if (latest === null) return null;
  const retryFailureProgresses = rows.flatMap(({ progress }) =>
    progress?.progressClass === "retry" ? [progress] : []
  );
  const latestFailure = retryFailureProgresses.at(-1) ?? null;
  const priorFailure = retryFailureProgresses.at(-2) ?? null;
  const common = {
    schemaVersion: "5.0.0" as const,
    disposition: "projected" as const,
    selectedPrefixDigest: sha256Canonical(events as unknown as JsonValue),
    lastAdmissionOrdinal: events.at(-1)?.admissionOrdinal ?? 0,
    runId: cursor.runId,
    graphCallId: cursor.graphCallId,
    frameId: cursor.frameId,
    graphRef: graph.materializationRef,
    retryBoundaryRef: boundaryRef,
    retryTermPath: context.retryTermPath,
    wrappedTermPath: context.wrappedTermPath,
    taskOrdinal: context.taskOrdinal,
    retryDepth,
    budget: context.budget,
    inputCarrierRef: context.inputCarrierRef,
    attemptCoverage: rows.map((row) => row.attempt.attempt),
    progressCoverage: rows.flatMap((row) =>
      row.progress === null ? [] : [row.progress.attempt]
    ),
    rows,
    remainingBudget: Math.max(0, context.budget - rows.length),
  };
  let body: DeclaredCRetryFrontierBody;
  if (latest.progress === null) {
    if (!runActive) return null;
    body = {
      ...common,
      kind: "declared_c_retry_active_frontier" as const,
      state: "attempt_active" as const,
      active: latest,
    };
  } else if (latest.consumption.kind === "progress_available") {
    if (!runActive) return null;
    body = {
      ...common,
      kind: "declared_c_retry_available_progress_frontier" as const,
      state: "progress_available" as const,
      available: latest,
    };
  } else if (
    latest.progress.progressClass === "retry" &&
    latest.consumption.kind === "progress_consumed_by_retry"
  ) {
    if (
      !runActive ||
      rows.length >= context.budget ||
      latest.consumption.route.targetCursorRef !== cursor.cursorRef ||
      latest.consumption.route.targetCursorDigest !== cursor.cursorDigest ||
      !holdsAt(calculus, constructRuntimeFluent({
        name: "locus_active",
        identity: cursor.cursorRef,
      }))
    ) return null;
    const stationary = priorFailure !== null && latestFailure !== null &&
        priorFailure.failureSignalRef === latestFailure.failureSignalRef
      ? deepFreeze({
          kind: "stationary" as const,
          failureSignalRef: latestFailure.failureSignalRef,
          priorProgressRef: priorFailure.progressRef,
          currentProgressRef: latestFailure.progressRef,
        })
      : deepFreeze({ kind: "not_stationary" as const });
    body = {
      ...common,
      kind: "declared_c_retry_eligible_frontier" as const,
      state: "eligible" as const,
      nextAttempt: rows.length + 1,
      currentCursor: cursor,
      eligibilityRoute: latest.consumption.route,
      latestFailure,
      stationarity: stationary,
    };
  } else {
    if (
      latest.consumption.kind !== "progress_consumed_by_exit" ||
      latest.progress.progressClass === "retry" ||
      latest.kind === "declared_c_retry_retry_progress"
    ) return null;
    body = {
      ...common,
      kind: "declared_c_retry_consumed_frontier" as const,
      state: "progress_consumed" as const,
      consumed: latest,
    };
  }
  const projectionDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    ...body,
    projectionRef:
      `declared-c-retry-frontier://abiogenesis/${projectionDigest.slice("sha256:".length)}`,
    projectionDigest,
  });
}

export function projectDeclaredCRetryCCallWriteAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  authorityPrefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  graphFunction: Readonly<GraphFunction>,
  cursor: TraversalCursorCandidate,
  candidate: DeclaredCRetryCCallCandidate,
  phase: CCallPhaseProjection["phase"],
): DeclaredCRetryActiveFrontier | null {
  const frontier = projectDeclaredCRetryFrontier(
    prefix,
    graph,
    cursor,
    graphFunction,
    cursor.retryPath.length,
    authorityPrefix,
  );
  if (
    frontier?.state !== "attempt_active" ||
    frontier.active.currentCursor.cursorRef !== cursor.cursorRef ||
    frontier.active.currentCursor.cursorDigest !== cursor.cursorDigest
  ) return null;
  if (phase === "not_open") {
    return candidate.kind === "declared_c_retry_prospective_c_call_candidate" &&
        frontier.active.kind === "declared_c_retry_pre_c_call_attempt" &&
        frontier.active.cCallState.prospective.kind ===
          "declared_c_retry_prospective_c_call" &&
        frontier.active.cCallState.prospective.cCallRef === candidate.cCallRef &&
        frontier.active.cCallState.prospective.cCallDigest ===
          candidate.cCallDigest &&
        frontier.active.cCallState.cursorRef === cursor.cursorRef &&
        frontier.active.cCallState.cursorDigest === cursor.cursorDigest
      ? frontier
      : null;
  }
  if (
    candidate.kind !== "c_call" ||
    candidate.retryPath.length === 0 ||
    candidate.runId !== cursor.runId ||
    candidate.graphCallId !== cursor.graphCallId ||
    candidate.frameId !== cursor.frameId ||
    candidate.basisId !== cursor.executionBasisRef ||
    candidate.graphFunctionRef !== graphFunction.name ||
    candidate.attempt !== cursor.attempt ||
    !sameNumbers(candidate.retryPath, cursor.retryPath) ||
    frontier.active.kind !== "declared_c_retry_active_c_call_attempt"
  ) return null;
  const matches = frontier.active.cCalls.filter((exact) =>
    exact.phase === phase &&
    exact.sourceCursor.cursorRef === cursor.cursorRef &&
    exact.sourceCursor.cursorDigest === cursor.cursorDigest &&
    sha256Canonical(exact.cCall as unknown as JsonValue) ===
      sha256Canonical(candidate as unknown as JsonValue)
  );
  return matches.length === 1 && matches[0] === frontier.active.cCalls.at(-1)
    ? frontier
    : null;
}

const RETRY_FRONTIER_SOURCE_KINDS = Object.freeze([
  "retry_attempt_opened",
  "c_call_opened",
  "c_call_fibre_selected",
  "c_call_evidenced",
  "c_call_result_admitted",
  "c_call_judged",
  "retry_progress_recorded",
] as const);

function executableRetryInputRefusal(
  request: ProjectExecutableRetryInputRequest,
  code: ExecutableRetryInputRefusalCode,
  message: string,
  citedSourceEventRefs: readonly string[] = [],
): ExecutableRetryInputRefusal {
  const prefixDigest = typeof request.prefix?.prefixDigest === "string" &&
      request.prefix.prefixDigest.startsWith("sha256:")
    ? request.prefix.prefixDigest
    : null;
  return deepFreeze({
    kind: "executable_retry_input_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    message,
    selector: request.selector,
    suppliedPrefixDigest: prefixDigest,
    citedSourceEventRefs: [...citedSourceEventRefs],
  });
}

function isRetryFrontierSelector(value: RetryFrontierSelector): boolean {
  return value.kind === "retry_frontier_selector" &&
    value.schemaVersion === "5.0.0" &&
    Object.keys(value).length === 7 &&
    nonEmptyString(value.runId) &&
    nonEmptyString(value.graphCallId) &&
    nonEmptyString(value.frameId) &&
    nonEmptyString(value.retryBoundaryRef) &&
    nonEmptyString(value.retryProgressRef);
}

function retryFrontierSource(
  event: RuntimeEvent,
  ownerSurface: RetryFrontierSource["ownerSurface"],
): RetryFrontierSource | null {
  if (!RETRY_FRONTIER_SOURCE_KINDS.includes(
    event.kind as RetryFrontierSourceEventKind,
  )) return null;
  return deepFreeze({
    eventRef: event.eventId,
    admissionOrdinal: event.admissionOrdinal,
    payloadDigest: event.payloadDigest,
    eventKind: event.kind as RetryFrontierSourceEventKind,
    ownerSurface,
  });
}

function retryFrontierRowBody(
  row: RetryAttemptFrontierRow,
): Omit<RetryAttemptFrontierRow, "rowRef" | "rowDigest"> {
  const { rowRef: _rowRef, rowDigest: _rowDigest, ...body } = row;
  return body;
}

function retryFrontierBody(
  frontier: RetryAttemptFrontier,
): Omit<RetryAttemptFrontier, "frontierRef" | "frontierDigest"> {
  const {
    frontierRef: _frontierRef,
    frontierDigest: _frontierDigest,
    ...body
  } = frontier;
  return body;
}

function sortedUnique<T extends string>(values: readonly T[]): readonly T[] {
  return [...new Set(values)].sort();
}

function structurallyFullRetryAttemptFrontier(
  frontier: RetryAttemptFrontier,
): boolean {
  if (
    frontier.kind !== "retry_attempt_frontier" ||
    frontier.schemaVersion !== "5.0.0" ||
    frontier.isFullFrontier !== true ||
    frontier.rows.length === 0 ||
    !nonEmptyString(frontier.declaredFrontierRef) ||
    !digestValue(frontier.declaredFrontierDigest) ||
    !nonEmptyString(frontier.retryBoundaryRef) ||
    !nonEmptyString(frontier.runId) ||
    !nonEmptyString(frontier.graphCallId) ||
    !nonEmptyString(frontier.frameId)
  ) return false;
  for (const [index, row] of frontier.rows.entries()) {
    const sources = row.sources;
    const sourceVector = [
      sources.attempt,
      sources.cCallOpened,
      sources.fibreSelected,
      ...(sources.evidence === null ? [] : [sources.evidence]),
      sources.result,
      sources.judgment,
      sources.progress,
    ];
    const expectedDigest = sha256Canonical(
      retryFrontierRowBody(row) as unknown as JsonValue,
    );
    if (
      row.kind !== "retry_attempt_frontier_row" ||
      row.schemaVersion !== "5.0.0" ||
      row.retryBoundaryRef !== frontier.retryBoundaryRef ||
      row.attempt !== index + 1 ||
      row.retryPath.at(-1) !== row.attempt ||
      row.rowDigest !== expectedDigest ||
      row.rowRef !==
        `retry-attempt-frontier-row://abiogenesis/${expectedDigest.slice("sha256:".length)}` ||
      sources.attempt.eventKind !== "retry_attempt_opened" ||
      sources.attempt.ownerSurface !== "abg_retry" ||
      sources.cCallOpened.eventKind !== "c_call_opened" ||
      sources.cCallOpened.ownerSurface !== "abg_c_call" ||
      sources.fibreSelected.eventKind !== "c_call_fibre_selected" ||
      sources.fibreSelected.ownerSurface !== "abg_c_call" ||
      (sources.evidence !== null &&
        (sources.evidence.eventKind !== "c_call_evidenced" ||
          sources.evidence.ownerSurface !== "abg_c_call")) ||
      sources.result.eventKind !== "c_call_result_admitted" ||
      sources.result.ownerSurface !== "abg_c_call" ||
      sources.judgment.eventKind !== "c_call_judged" ||
      sources.judgment.ownerSurface !== "abg_c_call" ||
      sources.progress.eventKind !== "retry_progress_recorded" ||
      sources.progress.ownerSurface !== "abg_retry" ||
      sourceVector.some((source) =>
        !nonEmptyString(source.eventRef) ||
        !Number.isSafeInteger(source.admissionOrdinal) ||
        source.admissionOrdinal < 0 ||
        !digestValue(source.payloadDigest)
      )
    ) return false;
  }
  const expectedCoverage = frontier.rows.map((row) => row.attempt);
  const expectedReasons = sortedUnique(
    frontier.rows.map((row) => row.reasonClass),
  );
  const allSources = frontier.rows.flatMap((row) => [
    row.sources.attempt,
    row.sources.cCallOpened,
    row.sources.fibreSelected,
    ...(row.sources.evidence === null ? [] : [row.sources.evidence]),
    row.sources.result,
    row.sources.judgment,
    row.sources.progress,
  ]);
  const expectedOwners = sortedUnique(
    allSources.map((source) => source.ownerSurface),
  );
  const expectedKinds = sortedUnique(
    allSources.map((source) => source.eventKind),
  );
  const expectedDigest = sha256Canonical(
    retryFrontierBody(frontier) as unknown as JsonValue,
  );
  return sameNumbers(frontier.attemptCoverage, expectedCoverage) &&
    sameStrings(frontier.reasonClasses, expectedReasons) &&
    sameStrings(frontier.ownerSurfaces, expectedOwners) &&
    sameStrings(frontier.sourceEventKinds, expectedKinds) &&
    frontier.frontierDigest === expectedDigest &&
    frontier.frontierRef ===
      `retry-attempt-frontier://abiogenesis/${expectedDigest.slice("sha256:".length)}`;
}

export function assertFullRetryAttemptFrontier(
  frontier: RetryAttemptFrontier,
): asserts frontier is RetryAttemptFrontier {
  if (!structurallyFullRetryAttemptFrontier(frontier)) {
    throw new TypeError("retry attempt frontier is not structurally full");
  }
}

function constructRetryAttemptFrontierRow(input: {
  retryBoundaryRef: string;
  attempt: RetryAttemptAdmission;
  cCall: CCall;
  progress: RetryContinuationProgressAdmission;
  attemptEvent: RuntimeEvent;
  openedEvent: RuntimeEvent;
  fibreEvent: RuntimeEvent;
  evidenceEvent: RuntimeEvent | null;
  resultEvent: RuntimeEvent;
  judgmentEvent: RuntimeEvent;
  progressEvent: RuntimeEvent;
}): RetryAttemptFrontierRow | null {
  const sources = {
    attempt: retryFrontierSource(input.attemptEvent, "abg_retry"),
    cCallOpened: retryFrontierSource(input.openedEvent, "abg_c_call"),
    fibreSelected: retryFrontierSource(input.fibreEvent, "abg_c_call"),
    evidence: input.evidenceEvent === null
      ? null
      : retryFrontierSource(input.evidenceEvent, "abg_c_call"),
    result: retryFrontierSource(input.resultEvent, "abg_c_call"),
    judgment: retryFrontierSource(input.judgmentEvent, "abg_c_call"),
    progress: retryFrontierSource(input.progressEvent, "abg_retry"),
  };
  if (
    sources.attempt === null || sources.cCallOpened === null ||
    sources.fibreSelected === null || sources.result === null ||
    sources.judgment === null || sources.progress === null ||
    (input.evidenceEvent !== null && sources.evidence === null)
  ) return null;
  const body = {
    kind: "retry_attempt_frontier_row" as const,
    schemaVersion: "5.0.0" as const,
    retryBoundaryRef: input.retryBoundaryRef,
    attempt: input.attempt.attempt,
    retryPath: input.attempt.retryPath,
    attemptRef: input.attempt.attemptRef,
    attemptDigest: input.attempt.attemptDigest,
    cCallRef: input.cCall.cCallRef,
    cCallDigest: input.cCall.cCallDigest,
    progressRef: input.progress.progressRef,
    progressDigest: input.progress.progressDigest,
    reasonClass: input.progress.failureClass,
    failureSignalRef: input.progress.failureSignalRef,
    inputContractRef: input.attempt.inputContractRef,
    inputRef: input.attempt.inputRef,
    inputDigest: input.attempt.inputDigest,
    sources: deepFreeze(sources) as RetryAttemptFrontierRow["sources"],
  };
  const rowDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    ...body,
    rowRef:
      `retry-attempt-frontier-row://abiogenesis/${rowDigest.slice("sha256:".length)}`,
    rowDigest,
  });
}

function rehydrateRetryTraversalScope(
  prefix: ValidatedRuntimeEventPrefix,
  events: readonly RuntimeEvent[],
  executionBasis: ExecutionBasis,
  cursor: TraversalCursorCandidate,
): OpenedTraversalScope | null {
  const graphCallRows = events.filter((event) =>
    event.kind === "graph_call_opened" &&
    event.aggregateId === cursor.graphCallId &&
    event.runId === cursor.runId &&
    event.basisId === executionBasis.basisRef &&
    isRecord(event.payload) && digestValue(event.payload.graphCallDigest)
  );
  const runRows = events.filter((event) =>
    event.kind === "run_segment_opened" &&
    event.aggregateId === cursor.runId &&
    graphCallRows.some((graphCall) =>
      graphCall.causationEventRefs.includes(event.eventId)
    ) &&
    isRecord(event.payload) && digestValue(event.payload.runDigest)
  );
  const frameRows = events.filter((event) =>
    event.kind === "frame_opened" &&
    event.aggregateId === cursor.frameId &&
    event.runId === cursor.runId &&
    event.graphCallId === cursor.graphCallId &&
    event.basisId === executionBasis.basisRef &&
    isRecord(event.payload) && digestValue(event.payload.frameDigest) &&
    nonEmptyString(event.payload.frameLineageId)
  );
  if (
    runRows.length !== 1 || graphCallRows.length !== 1 || frameRows.length !== 1
  ) return null;
  const run = runRows[0]!;
  const graphCall = graphCallRows[0]!;
  const frame = frameRows[0]!;
  const scopeBody = {
    executionBasisRef: executionBasis.basisRef,
    executionBasisDigest: executionBasis.basisDigest,
    invocationAdmissionRef: executionBasis.invocationAdmissionRef,
    invocationRef: executionBasis.invocationRef,
    programRef: executionBasis.programRef,
    graphFunctionRef: executionBasis.graphFunctionRef,
    graphRef: executionBasis.graphRef,
    runId: cursor.runId,
    runDigest: (run.payload as Readonly<Record<string, JsonValue>>)
      .runDigest as Sha256Digest,
    runOpenEventRef: run.eventId,
    graphCallId: cursor.graphCallId,
    graphCallDigest: (graphCall.payload as Readonly<Record<string, JsonValue>>)
      .graphCallDigest as Sha256Digest,
    graphCallOpenEventRef: graphCall.eventId,
    frameId: cursor.frameId,
    frameDigest: (frame.payload as Readonly<Record<string, JsonValue>>)
      .frameDigest as Sha256Digest,
    frameLineageId: (frame.payload as Readonly<Record<string, JsonValue>>)
      .frameLineageId as string,
    frameOpenEventRef: frame.eventId,
  };
  const scopeDigest = sha256Canonical(scopeBody as unknown as JsonValue);
  const scopeRef =
    `traversal-scope://abiogenesis/${scopeDigest.slice("sha256:".length)}`;
  if (scopeRef !== cursor.traversalScopeRef) return null;
  return rehydrateOpenedTraversalScopeAtPrefix(prefix, {
    scopeRef,
    scopeDigest,
    ...scopeBody,
  });
}

export function projectExecutableRetryInput(
  request: ProjectExecutableRetryInputRequest,
): ProjectExecutableRetryInputResult {
  if (!isRetryFrontierSelector(request.selector)) {
    return executableRetryInputRefusal(
      request,
      "frontier_lineage_mismatch",
      "retry frontier selector is not one exact closed selector",
    );
  }
  let prefix: ValidatedRuntimeEventPrefix;
  let authorityPrefix: ValidatedRuntimeEventPrefix;
  let events: readonly RuntimeEvent[];
  let lastAdmissionOrdinal: number;
  try {
    const durableEvents = readRuntimeEventsAtDurablePrefix(request.prefix);
    lastAdmissionOrdinal = durableEvents.at(-1)?.admissionOrdinal ?? -1;
    authorityPrefix = selectValidatedRuntimeEventPrefix(durableEvents);
    prefix = selectValidatedRuntimeEventPrefix(
      runtimeEventsFromValidatedPrefix(authorityPrefix),
      { runId: request.selector.runId },
    );
    events = runtimeEventsFromValidatedPrefix(prefix);
  } catch {
    return executableRetryInputRefusal(
      request,
      "prefix_mismatch",
      "retry input projection requires one exact durable event prefix",
    );
  }
  const selector = request.selector;
  const selectedProgressEvents = events.filter((event) =>
    event.kind === "retry_progress_recorded" &&
    event.runId === selector.runId &&
    event.graphCallId === selector.graphCallId &&
    event.frameId === selector.frameId &&
    isRecord(event.payload) &&
    event.payload.retryBoundaryRef === selector.retryBoundaryRef &&
    event.payload.progressRef === selector.retryProgressRef
  );
  if (selectedProgressEvents.length !== 1) {
    return executableRetryInputRefusal(
      request,
      selectedProgressEvents.length === 0
        ? "frontier_absent"
        : "frontier_ambiguous",
      "retry frontier selector must identify exactly one admitted progress event",
      selectedProgressEvents.map((event) => event.eventId),
    );
  }
  const selectedProgressEvent = selectedProgressEvents[0]!;
  const selectorProgress = projectAdmittedRetryProgress(
    prefix,
    selectedProgressEvent.eventId,
    authorityPrefix,
  );
  if (
    selectorProgress === null || selectorProgress.progressClass !== "retry" ||
    selectedProgressEvent.causationEventRefs.length !== 2
  ) {
    return executableRetryInputRefusal(
      request,
      "frontier_lineage_mismatch",
      "selected retry progress is not one exact executable retry continuation",
      [selectedProgressEvent.eventId],
    );
  }
  const citedAttemptEventRef = selectedProgressEvent.causationEventRefs[0]!;
  const citedAttemptEvents = events.filter((event) =>
    event.kind === "retry_attempt_opened" &&
    event.eventId === citedAttemptEventRef &&
    isRecord(event.payload) &&
    event.payload.attemptRef === selectorProgress.attemptRef
  );
  if (citedAttemptEvents.length !== 1) {
    return executableRetryInputRefusal(
      request,
      "frontier_lineage_mismatch",
      "selected retry progress must cite exactly one matching attempt event",
      [selectedProgressEvent.eventId, citedAttemptEventRef],
    );
  }
  const selectedAttemptEvent = citedAttemptEvents[0]!;
  const sourceCursor = deriveRetryAttemptCursor(
    prefix,
    request.graph,
    selectedAttemptEvent,
  );
  if (sourceCursor === null) {
    return executableRetryInputRefusal(
      request,
      "frontier_lineage_mismatch",
      "selected retry attempt does not derive one exact admitted source cursor",
      [selectedProgressEvent.eventId, selectedAttemptEvent.eventId],
    );
  }
  const executionBasis = rehydrateExecutionBasisAtPrefix(
    prefix,
    sourceCursor.executionBasisRef,
  );
  const programDigest = sha256Canonical(request.program as unknown as JsonValue);
  const graphFunctionDigest = sha256Canonical(
    request.graphFunction as unknown as JsonValue,
  );
  if (
    executionBasis === null ||
    !hasAdmittedTraversalCursorAtPrefix(prefix, sourceCursor) ||
    !isMaterializedGtlGraph(request.graph) ||
    request.program.kind !== "gtl_program" ||
    request.graphFunction.kind !== "graph_function" ||
    sourceCursor.executionBasisRef !== executionBasis.basisRef ||
    sourceCursor.programRef !== executionBasis.programRef ||
    sourceCursor.graphRef !== executionBasis.graphRef ||
    request.program.programRef !== executionBasis.programRef ||
    programDigest !== executionBasis.programDigest ||
    request.graphFunction.name !== executionBasis.graphFunctionRef ||
    graphFunctionDigest !== executionBasis.graphFunctionDigest ||
    request.graph.materializationRef !== executionBasis.graphRef ||
    request.graph.materializationDigest !== executionBasis.graphDigest ||
    request.graph.graphFunctionRef !== executionBasis.graphFunctionRef ||
    request.graph.graphFunctionDigest !== executionBasis.graphFunctionDigest ||
    !request.program.callableMembership.includes(executionBasis.graphFunctionRef) ||
    sourceCursor.runId !== selector.runId ||
    sourceCursor.graphCallId !== selector.graphCallId ||
    sourceCursor.frameId !== selector.frameId
  ) {
    return executableRetryInputRefusal(
      request,
      "basis_mismatch",
      "retry frontier declarations differ from their admitted execution basis",
    );
  }
  const historicalRoutes = projectHistoricalTraversalRoutesAtPrefix(
    prefix,
    authorityPrefix,
  );
  if (historicalRoutes === null) {
    return executableRetryInputRefusal(
      request,
      "frontier_lineage_mismatch",
      "retry input projection requires exact historical route truth",
    );
  }
  const spentSourceRoutes = historicalRoutes.filter((route) =>
    route.runId === sourceCursor.runId &&
    route.graphCallId === sourceCursor.graphCallId &&
    route.frameId === sourceCursor.frameId &&
    route.executionBasisRef === sourceCursor.executionBasisRef &&
    route.materializationRef === request.graph.materializationRef &&
    route.sourceCursorRef === sourceCursor.cursorRef &&
    route.sourceCursorDigest === sourceCursor.cursorDigest
  );
  if (spentSourceRoutes.length > 0) {
    return executableRetryInputRefusal(
      request,
      "frontier_stale",
      "selected retry source cursor already has an admitted outgoing route",
      spentSourceRoutes.map((route) => route.admissionEventRef),
    );
  }
  const owner = projectDeclaredCRetryFrontier(
    prefix,
    request.graph,
    sourceCursor,
    request.graphFunction,
    sourceCursor.retryPath.length,
    authorityPrefix,
  );
  if (
    owner === null || owner.state !== "progress_available" ||
    owner.retryBoundaryRef !== selector.retryBoundaryRef ||
    owner.runId !== selector.runId || owner.graphCallId !== selector.graphCallId ||
    owner.frameId !== selector.frameId ||
    owner.available.kind !== "declared_c_retry_retry_progress" ||
    owner.available.progress.progressRef !== selector.retryProgressRef
  ) {
    return executableRetryInputRefusal(
      request,
      owner === null ? "frontier_absent" : "frontier_stale",
      "selected retry progress is not the exact declared C.retry frontier",
    );
  }
  const ownerRows = owner.rows.filter(
    (row): row is DeclaredCRetryRetryProgressRow =>
      row.kind === "declared_c_retry_retry_progress",
  );
  if (
    ownerRows.length !== owner.rows.length ||
    !sameNumbers(owner.attemptCoverage, ownerRows.map((row) =>
      row.attempt.attempt
    )) ||
    !sameNumbers(owner.progressCoverage, owner.attemptCoverage)
  ) return executableRetryInputRefusal(
    request,
    "frontier_lineage_mismatch",
    "D17 requires every owner row through the selected retry progress",
    owner.rows.flatMap((row) => [row.attemptEventRef]),
  );
  const rows: RetryAttemptFrontierRow[] = [];
  const cited = new Set<string>();
  for (const ownerRow of ownerRows) {
    const phase = ownerRow.failureCCall.phaseProjection;
    const attemptEvent = events.find((event) =>
      event.eventId === ownerRow.attemptEventRef
    );
    const progressEvent = events.find((event) =>
      event.eventId === ownerRow.progressEventRef
    );
    const openedEvent = events.find((event) =>
      event.eventId === phase.openedEventRef
    );
    const fibreEvent = phase.fibreEventRef === null ? undefined : events.find(
      (event) => event.eventId === phase.fibreEventRef,
    );
    const resultEvent = phase.resultEventRef === null ? undefined : events.find(
      (event) => event.eventId === phase.resultEventRef,
    );
    const judgmentEvent = phase.judgmentEventRef === null
      ? undefined
      : events.find((event) => event.eventId === phase.judgmentEventRef);
    const resultEvidenceEvents = resultEvent === undefined
      ? []
      : phase.evidenceEventRefs
        .map((eventRef) => events.find((event) => event.eventId === eventRef))
        .filter((event): event is RuntimeEvent =>
          event !== undefined &&
          resultEvent.causationEventRefs.includes(event.eventId)
        );
    const evidenceEvent = resultEvidenceEvents.length === 0
      ? null
      : resultEvidenceEvents[0]!;
    if (
      attemptEvent === undefined || progressEvent === undefined ||
      openedEvent === undefined || fibreEvent === undefined ||
      resultEvent === undefined || judgmentEvent === undefined ||
      resultEvidenceEvents.length > 1 ||
      (phase.evidenceEventRefs.length > 0 && evidenceEvent === null)
    ) {
      return executableRetryInputRefusal(
        request,
        "frontier_lineage_mismatch",
        "owner-specialized retry frontier cites a missing source event",
        [...cited, ownerRow.attemptEventRef, ownerRow.progressEventRef],
      );
    }
    const row = constructRetryAttemptFrontierRow({
      retryBoundaryRef: selector.retryBoundaryRef,
      attempt: ownerRow.attempt,
      cCall: ownerRow.failureCCall.cCall,
      progress: ownerRow.progress,
      attemptEvent,
      openedEvent,
      fibreEvent,
      evidenceEvent,
      resultEvent,
      judgmentEvent,
      progressEvent,
    });
    if (row === null) {
      return executableRetryInputRefusal(
        request,
        "frontier_lineage_mismatch",
        "retry frontier source kinds do not match their owning slots",
        [...cited, attemptEvent.eventId, progressEvent.eventId],
      );
    }
    for (const source of [
      row.sources.attempt,
      row.sources.cCallOpened,
      row.sources.fibreSelected,
      ...(row.sources.evidence === null ? [] : [row.sources.evidence]),
      row.sources.result,
      row.sources.judgment,
      row.sources.progress,
    ]) cited.add(source.eventRef);
    rows.push(row);
  }
  const frontierBody = {
    kind: "retry_attempt_frontier" as const,
    schemaVersion: "5.0.0" as const,
    isFullFrontier: true as const,
    retryBoundaryRef: selector.retryBoundaryRef,
    runId: selector.runId,
    graphCallId: selector.graphCallId,
    frameId: selector.frameId,
    declaredFrontierRef: owner.projectionRef,
    declaredFrontierDigest: owner.projectionDigest,
    rows,
    attemptCoverage: rows.map((row) => row.attempt),
    reasonClasses: sortedUnique(rows.map((row) => row.reasonClass)),
    ownerSurfaces: sortedUnique(rows.flatMap((row) => [
      row.sources.attempt.ownerSurface,
      row.sources.cCallOpened.ownerSurface,
      row.sources.progress.ownerSurface,
    ])),
    sourceEventKinds: sortedUnique(rows.flatMap((row) => [
      row.sources.attempt.eventKind,
      row.sources.cCallOpened.eventKind,
      row.sources.fibreSelected.eventKind,
      ...(row.sources.evidence === null ? [] : [row.sources.evidence.eventKind]),
      row.sources.result.eventKind,
      row.sources.judgment.eventKind,
      row.sources.progress.eventKind,
    ])),
  };
  const frontierDigest = sha256Canonical(frontierBody as unknown as JsonValue);
  const retryFrontier = deepFreeze({
    ...frontierBody,
    frontierRef:
      `retry-attempt-frontier://abiogenesis/${frontierDigest.slice("sha256:".length)}`,
    frontierDigest,
  }) as RetryAttemptFrontier;
  try {
    assertFullRetryAttemptFrontier(retryFrontier);
  } catch {
    return executableRetryInputRefusal(
      request,
      "frontier_lineage_mismatch",
      "retry frontier failed its complete structural assertion",
      [...cited],
    );
  }
  const selected = owner.available;
  const selectedProgress = selected.progress;
  const sourceAttempt = selected.attempt;
  const ownerSourceCursor = selected.failureCCall.sourceCursor;
  const selectedCCall = selected.failureCCall.cCall;
  const scope = rehydrateRetryTraversalScope(
    prefix,
    events,
    executionBasis,
    sourceCursor,
  );
  const declaration = projectDeclaredRetryAttemptCoordinates(
    request.graph,
    sourceCursor,
  );
  if (
    scope === null || declaration === null ||
    ownerSourceCursor.cursorRef !== sourceCursor.cursorRef ||
    ownerSourceCursor.cursorDigest !== sourceCursor.cursorDigest ||
    selected.progressEventRef !== selectedProgressEvent.eventId ||
    selected.attemptEventRef !== selectedAttemptEvent.eventId ||
    selectedProgress.progressRef !== selectorProgress.progressRef ||
    selectedProgress.progressDigest !== selectorProgress.progressDigest ||
    declaration.retryBoundaryRef !== selector.retryBoundaryRef ||
    declaration.budget !== sourceAttempt.budget ||
    declaration.inputCarrierRef !== sourceAttempt.inputContractRef ||
    scope.scopeRef !== sourceCursor.traversalScopeRef ||
    scope.executionBasisRef !== executionBasis.basisRef ||
    selectedProgress.progressRef !== selector.retryProgressRef ||
    selectedProgress.attemptRef !== sourceAttempt.attemptRef
  ) {
    return executableRetryInputRefusal(
      request,
      "retry_declaration_mismatch",
      "selected retry frontier differs from its exact declared runtime lineage",
      [...cited],
    );
  }
  if (!isRecord(sourceAttempt.inputValue)) {
    return executableRetryInputRefusal(
      request,
      "preimage_absent",
      "selected retry attempt has no canonical executable input preimage",
      [...cited],
    );
  }
  if (sha256Canonical(sourceAttempt.inputValue) !== sourceAttempt.inputDigest) {
    return executableRetryInputRefusal(
      request,
      "preimage_digest_mismatch",
      "selected retry input preimage differs from its admitted digest",
      [...cited],
    );
  }
  if (
    sourceAttempt.inputContractRef !== declaration.inputCarrierRef ||
    sourceAttempt.inputRef !== selectedProgress.inputRef ||
    sourceAttempt.inputDigest !== selectedProgress.inputDigest
  ) {
    return executableRetryInputRefusal(
      request,
      "preimage_contract_mismatch",
      "selected retry input differs from its declared contract coordinate",
      [...cited],
    );
  }
  const nextAttempt = sourceAttempt.attempt + 1;
  if (
    nextAttempt > sourceAttempt.budget ||
    selectedProgress.remainingBudget < 1
  ) {
    return executableRetryInputRefusal(
      request,
      "retry_not_permitted",
      "selected retry frontier has no remaining declared attempt",
      [...cited],
    );
  }
  const body = {
    kind: "executable_retry_input" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "projected" as const,
    durablePrefixDigest: request.prefix.prefixDigest,
    lastAdmissionOrdinal,
    selector,
    executionBasisRef: executionBasis.basisRef,
    executionBasisDigest: executionBasis.basisDigest,
    traversalScopeRef: scope.scopeRef,
    traversalScopeDigest: scope.scopeDigest,
    programRef: executionBasis.programRef,
    programDigest: executionBasis.programDigest,
    graphFunctionRef: executionBasis.graphFunctionRef,
    graphFunctionDigest: executionBasis.graphFunctionDigest,
    graphRef: executionBasis.graphRef,
    graphDigest: executionBasis.graphDigest,
    retryFrontier,
    selectedFrontierRowRef: retryFrontier.rows.at(-1)!.rowRef,
    progressEventRef: selectedProgressEvent.eventId,
    progress: selectedProgress,
    sourceAttemptEventRef: selected.attemptEventRef,
    sourceAttempt,
    sourceCursor,
    cCall: selectedCCall,
    inputContractRef: sourceAttempt.inputContractRef,
    inputRef: sourceAttempt.inputRef,
    inputDigest: sourceAttempt.inputDigest,
    inputValue: sourceAttempt.inputValue,
    nextAttempt,
    nextRetryPath: [
      ...sourceAttempt.retryPath.slice(0, -1),
      nextAttempt,
    ],
  };
  const projectionDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    ...body,
    projectionRef:
      `executable-retry-input://abiogenesis/${projectionDigest.slice("sha256:".length)}`,
    projectionDigest,
  });
}

export function admitRetryAttempt(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  graphFunction: Readonly<GraphFunction>,
  cursor: TraversalCursorCandidate,
  inputValue: Readonly<Record<string, JsonValue>>,
  routeAdmissionEventRef: string,
  basis: RuntimeAdmissionBasis,
): RetryAttemptAdmissionResult {
  if (
    !hasAdmittedExecutionBasis(store, executionBasis) ||
    executionBasis.graphRef !== graph.materializationRef ||
    executionBasis.basisRef !== cursor.executionBasisRef
  ) {
    return refusal(
      "basis_mismatch",
      "retry attempt requires the exact admitted execution basis and GTL Graph",
    );
  }
  if (!hasAdmittedTraversalCursor(store, cursor)) {
    return refusal(
      "cursor_mismatch",
      "retry attempt requires the admitted target cursor of one retry route",
    );
  }
  if (!isRecord(inputValue) || sha256Canonical(inputValue) !== cursor.inputDigest) {
    return refusal(
      "cursor_mismatch",
      "retry attempt input value differs from the admitted cursor input digest",
    );
  }
  const context = contextForCursor(graph, cursor);
  if (context === null || (typeof context === "object" && "kind" in context)) {
    return context ??
      refusal("retry_not_declared", "cursor has no enclosing declared C.retry term");
  }
  const snapshot = store.readAll();
  const prefix = selectValidatedRuntimeEventPrefix(snapshot);
  const frontier = projectDeclaredCRetryFrontier(
    prefix,
    graph,
    cursor,
    graphFunction,
  );
  if (
    frontier?.state !== "eligible" ||
    frontier.nextAttempt !== cursor.attempt ||
    frontier.currentCursor.cursorRef !== cursor.cursorRef ||
    frontier.currentCursor.cursorDigest !== cursor.cursorDigest ||
    frontier.eligibilityRoute.admissionEventRef !== routeAdmissionEventRef ||
    frontier.eligibilityRoute.targetCursorRef !== cursor.cursorRef ||
    frontier.eligibilityRoute.targetCursorDigest !== cursor.cursorDigest
  ) {
    return refusal(
      "route_mismatch",
      "retry attempt must extend the exact admitted retry route",
    );
  }
  if (
    cursor.attempt < 1 ||
    cursor.attempt > context.budget ||
    context.retryDepth !== cursor.retryPath.length
  ) {
    return refusal(
      "attempt_mismatch",
      "retry attempt is outside the declared positive budget",
    );
  }
  const boundaryRef = frontier.retryBoundaryRef;
  const attemptManifestRef = deriveRetryAttemptManifestRef({
    retryBoundaryRef: boundaryRef,
    executionBasisRef: cursor.executionBasisRef,
    inputContractRef: context.inputCarrierRef,
    inputRef: cursor.inputRef,
    inputDigest: cursor.inputDigest,
    attempt: cursor.attempt,
    retryPath: cursor.retryPath,
  });
  const body = {
    attemptManifestRef,
    retryBoundaryRef: boundaryRef,
    retryTermPath: context.retryTermPath,
    wrappedTermPath: context.wrappedTermPath,
    taskOrdinal: context.taskOrdinal,
    attempt: cursor.attempt,
    retryPath: cursor.retryPath,
    budget: context.budget,
    retryableFailureClasses: WORKER_TRANSPORT_FAILURE_CLASS_VALUES,
    priorJudgmentRef: frontier.eligibilityRoute.judgmentRef,
    priorRouteRef: frontier.eligibilityRoute.routeRef,
    inputRef: cursor.inputRef,
    inputDigest: cursor.inputDigest,
    inputContractRef: context.inputCarrierRef,
    inputValue: deepFreeze(inputValue),
  };
  const attemptDigest = sha256Canonical(body as unknown as JsonValue);
  const attemptRef =
    `retry-attempt://abiogenesis/${attemptDigest.slice("sha256:".length)}`;
  let event: RuntimeEvent;
  try {
    event = compareAndAppendExpectedPrefix(
      store,
      sha256Canonical(snapshot as unknown as JsonValue),
      [() => ({
        kind: "retry_attempt_opened",
        eventTime: basis.eventTime,
        aggregateType: "frame",
        aggregateId: cursor.frameId,
        parentAggregateId: cursor.graphCallId,
        causationEventRefs: [routeAdmissionEventRef],
        correlationId: basis.correlationId,
        workflowVersion: "5.0.0",
        scopeClass: "run",
        basisId: executionBasis.basisRef,
        runId: cursor.runId,
        graphFunctionRef: executionBasis.graphFunctionRef,
        materializationRef: graph.materializationRef,
        graphCallId: cursor.graphCallId,
        frameId: cursor.frameId,
        payload: { attemptRef, attemptDigest, ...body } as unknown as JsonValue,
      })],
    )[0]!;
  } catch (error) {
    if (isExpectedPrefixMismatch(error)) {
      return refusal(
        "attempt_mismatch",
        "retry attempt authority changed after immutable-prefix validation",
      );
    }
    throw error;
  }
  const admission = deepFreeze({
    kind: "retry_attempt_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    attemptRef,
    attemptDigest,
    ...body,
    admissionEventRef: event.eventId,
  }) as RetryAttemptAdmission;
  return admission;
}

export function projectRetryEligibility(
  prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  graphFunction: Readonly<GraphFunction>,
  cursor: TraversalCursorCandidate,
  failureClass: WorkerTransportFailureClass,
  failureSignalRef: string,
): RetryEligibility {
  const context = contextForCursor(graph, cursor);
  if (
    context === null ||
    (typeof context === "object" && "kind" in context)
  ) {
    return deepFreeze({
      kind: "retry_eligibility",
      schemaVersion: "5.0.0",
      disposition: "not_in_retry",
      retryBoundaryRef: null,
      retryTermPath: [],
      wrappedTermPath: [],
      attempt: cursor.attempt,
      budget: 0,
      remainingBudget: 0,
      failureClass,
      failureSignalRef,
      completedAttempts: [],
      priorProgressRefs: [],
    }) as RetryEligibility;
  }
  const boundaryRef = retryBoundaryRef(graph, cursor, context);
  const frontier = projectDeclaredCRetryFrontier(
    prefix,
    graph,
    cursor,
    graphFunction,
  );
  const priorProgresses = frontier === null ? [] : frontier.rows.flatMap((row) =>
    row.progress === null ? [] : [row.progress]
  );
  const immediatelyPrecedingFailure = priorProgresses
    .filter((progress): progress is RetryContinuationProgressAdmission =>
      progress.progressClass === "retry"
    )
    .at(-1);
  const stationary = immediatelyPrecedingFailure?.progressClass === "retry" &&
    immediatelyPrecedingFailure.failureSignalRef === failureSignalRef;
  const retryable = WORKER_TRANSPORT_FAILURE_CLASS_VALUES.includes(failureClass);
  const expectedAttemptCoverage = Array.from(
    { length: cursor.attempt },
    (_, index) => index + 1,
  );
  const currentAttemptIsActive = frontier?.state === "attempt_active" &&
    frontier.retryBoundaryRef === boundaryRef &&
    frontier.active.attempt.attempt === cursor.attempt &&
    sameNumbers(frontier.active.attempt.retryPath, cursor.retryPath) &&
    frontier.active.currentCursor.cursorRef === cursor.cursorRef &&
    frontier.active.currentCursor.cursorDigest === cursor.cursorDigest;
  const disposition: RetryEligibility["disposition"] =
    frontier === null ||
      !sameNumbers(frontier.attemptCoverage, expectedAttemptCoverage) ||
      !sameNumbers(
        frontier.progressCoverage,
        expectedAttemptCoverage.slice(0, -1),
      ) ||
      !currentAttemptIsActive
      ? "replay_gap"
      : !retryable
        ? "not_retryable"
        : stationary
          ? "stationary"
          : cursor.attempt >= context.budget
            ? "budget_exhausted"
            : "retry";
  return deepFreeze({
    kind: "retry_eligibility" as const,
    schemaVersion: "5.0.0" as const,
    disposition,
    retryBoundaryRef: boundaryRef,
    retryTermPath: context.retryTermPath,
    wrappedTermPath: context.wrappedTermPath,
    attempt: cursor.attempt,
    budget: context.budget,
    remainingBudget: Math.max(0, context.budget - cursor.attempt),
    failureClass,
    failureSignalRef,
    completedAttempts: expectedAttemptCoverage,
    priorProgressRefs: priorProgresses.map((progress) => progress.progressRef),
  }) as RetryEligibility;
}

function retryRuntimeFailureTransitionError(message: string): TypeError {
  return new TypeError(`retry runtime failure transition refusal: ${message}`);
}

export function admitRetryRuntimeFailureTransitionInActiveTransaction(
  store: AbgEventStore,
  prefix: ValidatedRuntimeEventPrefix,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  graphFunction: Readonly<GraphFunction>,
  cursor: TraversalCursorCandidate,
  cCall: CCall,
  source: CCallRuntimeFailureSource,
  failureCandidate: JsonValue,
  failureValueKind: string,
  basis: RuntimeAdmissionBasis,
): StagedRetryRuntimeFailureTransitionResult {
  assertRuntimeEventTransactionActive(store);
  const expectedPrefixDigest = sha256Canonical(
    runtimeEventsFromValidatedPrefix(prefix) as unknown as JsonValue,
  );
  if (store.digest() !== expectedPrefixDigest) {
    return refusal(
      "progress_mismatch",
      "runtime failure transition requires its exact immutable entry prefix",
    );
  }
  const projectedBasis = rehydrateExecutionBasisAtPrefix(
    prefix,
    executionBasis.basisRef,
  );
  const frontier = projectDeclaredCRetryFrontier(
    prefix,
    graph,
    cursor,
    graphFunction,
  );
  const activeRow = frontier?.state === "attempt_active"
    ? frontier.active
    : null;
  const activeCCall = activeRow?.cCalls.find((phase) =>
    phase.cCall.cCallRef === cCall.cCallRef
  ) ?? null;
  const declaredTerm = resolveCProgramTermAtSourcePath(
    graph.template,
    cursor.currentNodeRef,
    cursor.termPath,
  );
  if (
    !isMaterializedGtlGraph(graph) ||
    projectedBasis === null ||
    sha256Canonical(projectedBasis as unknown as JsonValue) !==
      sha256Canonical(executionBasis as unknown as JsonValue) ||
    activeRow === null || activeCCall === null ||
    activeRow.currentCursor.cursorRef !== cursor.cursorRef ||
    activeRow.currentCursor.cursorDigest !== cursor.cursorDigest ||
    activeCCall !== activeRow.cCalls.at(-1) ||
    sha256Canonical(activeCCall.cCall as unknown as JsonValue) !==
      sha256Canonical(cCall as unknown as JsonValue) ||
    declaredTerm.kind === "c_source_path_refusal" ||
    !isExecutableCLeaf(declaredTerm) ||
    executionBasis.basisRef !== cursor.executionBasisRef ||
    executionBasis.basisRef !== cCall.basisId ||
    executionBasis.graphRef !== graph.materializationRef ||
    executionBasis.graphDigest !== graph.materializationDigest ||
    cursor.graphRef !== graph.materializationRef ||
    cCall.graphFunctionRef !== executionBasis.graphFunctionRef ||
    cCall.programLocusRef !== declaredTerm.programLocusRef ||
    cCall.stageRole !== declaredTerm.stageRole ||
    cCall.regime !== declaredTerm.fibre ||
    cCall.armId !== declaredTerm.armId ||
    cCall.compositionRef !== declaredTerm.compositionRef ||
    cCall.vectorIndex !== declaredTerm.vectorIndex ||
    cCall.implementationBindingRef !==
      declaredTerm.requirement.implementationBindingRef ||
    cCall.inputContractRef !== declaredTerm.requirement.inputContractRef ||
    cCall.outputContractRef !== declaredTerm.requirement.outputContractRef ||
    cCall.evidenceContractRef !== declaredTerm.requirement.evidenceContractRef ||
    cCall.failureContractRef !== declaredTerm.requirement.failureContractRef ||
    cCall.refusalContractRef !== declaredTerm.requirement.refusalContractRef ||
    cCall.judgmentContractRef !== declaredTerm.requirement.judgmentContractRef ||
    cCall.judgmentPredicateRef !== declaredTerm.judgmentPredicateRef
  ) {
    return refusal(
      "basis_mismatch",
      "runtime failure transition requires the exact admitted basis, graph, and cursor",
    );
  }
  const plan = planCCallRuntimeFailureClose(
    store,
    prefix,
    graph,
    graphFunction,
    cursor,
    cCall,
    source,
    failureCandidate,
    failureValueKind,
  );
  if (plan.kind !== "c_call_runtime_failure_close_plan") {
    return refusal("judgment_mismatch", plan.message);
  }
  const eligibility = projectRetryEligibility(
    prefix,
    graph,
    graphFunction,
    cursor,
    plan.signal.failureClass,
    plan.signal.failureSignalRef,
  );
  const disposition = eligibility.disposition === "retry"
    ? "retry" as const
    : eligibility.disposition === "stationary" ||
        eligibility.disposition === "budget_exhausted"
      ? "blocked" as const
      : null;
  if (disposition === null || eligibility.retryBoundaryRef === null) {
    return refusal(
      "progress_mismatch",
      "runtime failure transition requires one exact bounded retry eligibility",
    );
  }
  if (
    cCall.frameId !== cursor.frameId ||
    cCall.graphCallId !== cursor.graphCallId ||
    cCall.attempt !== cursor.attempt ||
    !sameNumbers(cCall.retryPath, cursor.retryPath)
  ) {
    return refusal(
      "attempt_mismatch",
      "runtime failure CCall differs from the current retry coordinate",
    );
  }
  const projectedAttempt = activeRow.attempt;
  if (
    projectedAttempt.attempt !== cursor.attempt ||
    !sameNumbers(projectedAttempt.retryPath, cursor.retryPath) ||
    sha256Canonical(projectedAttempt.inputValue as unknown as JsonValue) !==
      projectedAttempt.inputDigest
  ) {
    return refusal(
      "attempt_mismatch",
      "runtime failure transition requires the exact active retry attempt",
    );
  }
  const enclosingTopology = deriveCEnclosingRetryTopology(graph, {
    nodeRef: cursor.currentNodeRef,
    termPath: cursor.termPath,
  });
  if (enclosingTopology.kind === "c_source_path_refusal") {
    return refusal("attempt_mismatch", enclosingTopology.message);
  }
  const enclosingContexts = enclosingTopology.entries.map(
    (entry) => entry.context,
  );
  let stoppedPartition: CanonicalRootedTopologyPartition | null = null;
  let stoppedExitContexts: readonly CEnclosingRetryContext[] = [];
  if (disposition === "blocked") {
    const targetTopology = deriveCEnclosingRetryTopology(graph, null);
    if (targetTopology.kind === "c_source_path_refusal") {
      return refusal("attempt_mismatch", targetTopology.message);
    }
    const partition = deriveCanonicalRootedTopologyPartition(
      enclosingTopology.witness,
      targetTopology.witness,
    );
    if (partition.kind === "canonical_rooted_topology_partition_refusal") {
      return refusal(
        partition.code === "basis_mismatch"
          ? "basis_mismatch"
          : "attempt_mismatch",
        partition.message,
      );
    }
    const contextBySegmentRef = new Map(
      enclosingTopology.entries.map((entry) => [
        entry.segmentRef,
        entry.context,
      ] as const),
    );
    const exitedContexts = partition.exited.map((segmentRef) =>
      contextBySegmentRef.get(segmentRef)
    );
    if (
      partition.preserved.length !== 0 ||
      partition.entered.length !== 0 ||
      exitedContexts.length !== enclosingTopology.entries.length ||
      exitedContexts.some((context) => context === undefined)
    ) {
      return refusal(
        "attempt_mismatch",
        "blocked retry transition requires one exact rooted topology exit",
      );
    }
    stoppedPartition = partition;
    stoppedExitContexts = exitedContexts as readonly CEnclosingRetryContext[];
  }
  const stoppedCascadeAttempts = disposition === "blocked"
    ? stoppedExitContexts.slice(1).map((context) => {
        const path = cursor.retryPath.slice(0, context.retryDepth);
        const outer = projectDeclaredCRetryFrontier(
          prefix,
          graph,
          cursor,
          graphFunction,
          context.retryDepth,
        );
        return outer?.state === "attempt_active" &&
            outer.active.attempt.attempt === path.at(-1) &&
            sameNumbers(outer.active.attempt.retryPath, path)
          ? { context, row: outer.active, path }
          : null;
      })
    : [];
  if (stoppedCascadeAttempts.some((value) => value === null)) {
    return refusal(
      "attempt_mismatch",
      "blocked retry transition requires every exited enclosing retry attempt",
    );
  }
  const body = {
    progressClass: disposition === "retry"
      ? "retry" as const
      : "stopped" as const,
    ...(disposition === "blocked"
      ? {
          stopReason: "boundary_terminal" as const,
          predecessorProgressRef: null,
        }
      : {}),
    retryBoundaryRef: eligibility.retryBoundaryRef,
    attemptRef: projectedAttempt.attemptRef,
    attempt: cursor.attempt,
    retryPath: cursor.retryPath,
    budget: eligibility.budget,
    failureClass: plan.signal.failureClass,
    failureSignalRef: plan.signal.failureSignalRef,
    completedAttempts: eligibility.completedAttempts,
    remainingBudget: eligibility.remainingBudget,
    cCallRef: cCall.cCallRef,
    inputRef: projectedAttempt.inputRef,
    inputDigest: projectedAttempt.inputDigest,
    inputContractRef: projectedAttempt.inputContractRef,
  };
  const close = admitPlannedCCallRuntimeFailureClose(
    store,
    graph,
    graphFunction,
    cursor,
    cCall,
    source,
    failureCandidate,
    plan,
    disposition,
    basis,
  );
  const progressBody = {
    ...body,
    resultRef: close.result.resultRef,
    judgmentRef: close.judgment.judgmentRef,
  };
  const progressDigest = sha256Canonical(
    progressBody as unknown as JsonValue,
  );
  const progressRef =
    `retry-progress://abiogenesis/${progressDigest.slice("sha256:".length)}`;
  const progressEvent = admitRuntimeEvent(store, {
    kind: "retry_progress_recorded",
    eventTime: basis.eventTime,
    aggregateType: "frame",
    aggregateId: cursor.frameId,
    parentAggregateId: cursor.graphCallId,
    causationEventRefs: [
      activeRow.attemptEventRef,
      close.judgment.admissionEventRef,
    ],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: cCall.basisId,
    runId: cCall.runId,
    graphFunctionRef: cCall.graphFunctionRef,
    materializationRef: graph.materializationRef,
    graphCallId: cCall.graphCallId,
    frameId: cCall.frameId,
    payload: { progressRef, progressDigest, ...progressBody },
  });
  const progress = deepFreeze({
    kind: "retry_progress_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    progressRef,
    progressDigest,
    ...progressBody,
    admissionEventRef: progressEvent.eventId,
  }) as RetryContinuationProgressAdmission | RetryStoppedProgressAdmission;
  const stoppedProgresses: RetryStoppedProgressAdmission[] = [];
  if (disposition === "blocked") {
    stoppedProgresses.push(progress as RetryStoppedProgressAdmission);
    let predecessorEvent = progressEvent;
    for (const cascade of stoppedCascadeAttempts) {
      if (cascade === null) {
        throw retryRuntimeFailureTransitionError(
          "stopped cascade attempt disappeared",
        );
      }
      const attempt = cascade.path.at(-1)!;
      const cascadeBody = {
        progressClass: "stopped" as const,
        stopReason: "propagated_inner_stop" as const,
        predecessorProgressRef: stoppedProgresses.at(-1)!.progressRef,
        retryBoundaryRef: retryBoundaryRef(
          graph,
          cursor,
          cascade.context,
        ),
        attemptRef: cascade.row.attempt.attemptRef,
        attempt,
        retryPath: cascade.path,
        budget: cascade.context.budget,
        failureClass: plan.signal.failureClass,
        failureSignalRef: plan.signal.failureSignalRef,
        completedAttempts: Array.from(
          { length: attempt },
          (_, index) => index + 1,
        ),
        remainingBudget: Math.max(0, cascade.context.budget - attempt),
        cCallRef: cCall.cCallRef,
        inputRef: cascade.row.attempt.inputRef,
        inputDigest: cascade.row.attempt.inputDigest,
        inputContractRef: cascade.row.attempt.inputContractRef,
        resultRef: close.result.resultRef,
        judgmentRef: close.judgment.judgmentRef,
      };
      const cascadeDigest = sha256Canonical(
        cascadeBody as unknown as JsonValue,
      );
      const cascadeRef =
        `retry-progress://abiogenesis/${cascadeDigest.slice("sha256:".length)}`;
      const cascadeEvent = admitRuntimeEvent(store, {
        kind: "retry_progress_recorded",
        eventTime: basis.eventTime,
        aggregateType: "frame",
        aggregateId: cursor.frameId,
        parentAggregateId: cursor.graphCallId,
        causationEventRefs: [
          cascade.row.attemptEventRef,
          predecessorEvent.eventId,
        ],
        correlationId: basis.correlationId,
        workflowVersion: "5.0.0",
        scopeClass: "run",
        basisId: cCall.basisId,
        runId: cCall.runId,
        graphFunctionRef: cCall.graphFunctionRef,
        materializationRef: graph.materializationRef,
        graphCallId: cCall.graphCallId,
        frameId: cCall.frameId,
        payload: {
          progressRef: cascadeRef,
          progressDigest: cascadeDigest,
          ...cascadeBody,
        },
      });
      stoppedProgresses.push(deepFreeze({
        kind: "retry_progress_admission" as const,
        schemaVersion: "5.0.0" as const,
        disposition: "admitted" as const,
        progressRef: cascadeRef,
        progressDigest: cascadeDigest,
        ...cascadeBody,
        admissionEventRef: cascadeEvent.eventId,
      }));
      predecessorEvent = cascadeEvent;
    }
  }
  const admittedPrefix = selectValidatedRuntimeEventPrefix(store.readAll());
  const projectedSignal = projectCCallRuntimeFailureSignal(
    admittedPrefix,
    cCall.cCallRef,
    close.result.resultRef,
    close.judgment.judgmentRef,
  );
  const projectedFrontiers = enclosingContexts.map((context) =>
    projectDeclaredCRetryFrontier(
      admittedPrefix,
      graph,
      cursor,
      graphFunction,
      context.retryDepth,
    )
  );
  const projectedProgress = projectedFrontiers.find((candidate) =>
    candidate?.retryBoundaryRef === progress.retryBoundaryRef
  );
  if (
    projectedSignal?.failureSignalRef !== plan.signal.failureSignalRef ||
    projectedSignal.failureClass !== plan.signal.failureClass ||
    projectedProgress?.state !== "progress_available" ||
    sha256Canonical(
      projectedProgress.available.progress as unknown as JsonValue,
    ) !==
      sha256Canonical(progress as unknown as JsonValue) ||
    stoppedProgresses.some((stopped) => {
      const projected = projectedFrontiers.find((candidate) =>
        candidate?.retryBoundaryRef === stopped.retryBoundaryRef
      );
      return projected?.state !== "progress_available" ||
        projected.available.progress.progressClass !== "stopped" ||
        sha256Canonical(
          projected.available.progress as unknown as JsonValue,
        ) !== sha256Canonical(stopped as unknown as JsonValue);
    }) ||
    (disposition === "retry" && stoppedProgresses.length !== 0) ||
    (disposition === "blocked" &&
      stoppedProgresses.length !== stoppedPartition!.exited.length) ||
    (disposition === "blocked" && stoppedProgresses[0] !== progress)
  ) throw retryRuntimeFailureTransitionError(
    "atomic close or progress does not reproject exactly",
  );
  return deepFreeze({
    kind: "retry_runtime_failure_transition_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition,
    close,
    progress,
    stoppedProgresses,
    eligibility,
  });
}

export function admitRetryRuntimeFailureTransition(
  store: AbgEventStore,
  prefix: ValidatedRuntimeEventPrefix,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  graphFunction: Readonly<GraphFunction>,
  cursor: TraversalCursorCandidate,
  cCall: CCall,
  source: CCallRuntimeFailureSource,
  failureCandidate: JsonValue,
  failureValueKind: string,
  basis: RuntimeAdmissionBasis,
): RetryRuntimeFailureTransitionResult {
  const expectedPrefixDigest = sha256Canonical(
    runtimeEventsFromValidatedPrefix(prefix) as unknown as JsonValue,
  );
  try {
    const transaction = admitRuntimeEventTransactionAtExpectedPrefix(
      store,
      expectedPrefixDigest,
      () => {
        const staged = admitRetryRuntimeFailureTransitionInActiveTransaction(
          store,
          prefix,
          executionBasis,
          graph,
          graphFunction,
          cursor,
          cCall,
          source,
          failureCandidate,
          failureValueKind,
          basis,
        );
        if (
          staged.kind === "retry_runtime_failure_transition_admission" &&
          staged.disposition === "blocked"
        ) {
          throw retryRuntimeFailureTransitionError(
            "blocked disposition requires the HoG atomic route owner",
          );
        }
        return staged;
      },
    );
    if (transaction.value.kind !== "retry_runtime_failure_transition_admission") {
      return transaction.value;
    }
    if (
      transaction.value.disposition !== "retry" ||
      transaction.value.progress.progressClass !== "retry" ||
      transaction.value.stoppedProgresses.length !== 0
    ) {
      throw retryRuntimeFailureTransitionError(
        "standalone admission produced a non-retry transition",
      );
    }
    if (transaction.successorPrefix === null) {
      throw retryRuntimeFailureTransitionError(
        "durable runtime failure transition produced no successor prefix",
      );
    }
    return deepFreeze({
      kind: transaction.value.kind,
      schemaVersion: transaction.value.schemaVersion,
      disposition: "retry" as const,
      close: transaction.value.close,
      progress: transaction.value.progress,
      stoppedProgresses: Object.freeze([]) as readonly [],
      eligibility: transaction.value.eligibility,
      successorPrefix: transaction.successorPrefix,
    });
  } catch (error) {
    if (
      isExpectedPrefixMismatch(error) ||
      isCCallRuntimeFailureCloseError(error) ||
      (error instanceof TypeError && error.message.startsWith(
        "retry runtime failure transition refusal: ",
      ))
    ) {
      return refusal(
        "progress_mismatch",
        "standalone runtime failure transition rolled back without one admitted retry disposition",
      );
    }
    throw error;
  }
}

export function admitCompletedRetryProgress(
  store: AbgEventStore,
  graph: Readonly<GtlGraph>,
  graphFunction: Readonly<GraphFunction>,
  sourceCursor: TraversalCursorCandidate,
  targetCursor: TraversalCursorCandidate | null,
  completion: RetrySuccessfulExitEvidence,
  basis: RuntimeAdmissionBasis,
): readonly RetryCompletedProgressAdmission[] | RetryAdmissionRefusal {
  assertRuntimeEventTransactionActive(store);
  const snapshot = store.readAll();
  const expectedPrefixDigest = sha256Canonical(
    snapshot as unknown as JsonValue,
  );
  if (store.digest() !== expectedPrefixDigest) {
    return refusal(
      "progress_mismatch",
      "completed retry progress requires its exact immutable entry prefix",
    );
  }
  const prefix = selectValidatedRuntimeEventPrefix(snapshot);
  const cCall = "cCall" in completion ? completion.cCall : null;
  const result = "result" in completion ? completion.result : null;
  const judgment = "judgment" in completion ? completion.judgment : null;
  const completionWitnessEventRef = completion.completionClass ===
      "structural_identity_success"
    ? completion.completionWitnessEventRef
    : completion.completionClass === "fan_out_success"
      ? completion.completion.admissionEventRef
      : completion.completionClass === "fh_resume_success"
        ? completion.resume.admissionEventRef
        : completion.judgment.admissionEventRef;
  const completedInput = completion.completionClass === "fan_out_success"
    ? {
        inputRef: completion.completion.outputVectorRef,
        inputDigest: completion.completion.outputVectorDigest,
      }
    : completion.completionClass === "fh_resume_success"
      ? {
          inputRef: completion.resume.successorInputRef,
          inputDigest: completion.resume.successorInputDigest,
        }
      : completion.completionClass === "structural_identity_success"
        ? {
            inputRef: sourceCursor.inputRef,
            inputDigest: sourceCursor.inputDigest,
          }
        : {
            inputRef: completion.result.resultRef,
            inputDigest: completion.result.valueDigest,
          };
  const continuation = deriveCContinuationTarget(graph, {
    nodeRef: sourceCursor.currentNodeRef,
    termPath: sourceCursor.termPath,
    taskOrdinal: sourceCursor.taskOrdinal,
    attempt: sourceCursor.attempt,
    retryPath: sourceCursor.retryPath,
    inputRef: sourceCursor.inputRef,
    inputDigest: sourceCursor.inputDigest,
  }, completedInput);
  const sourceTopology = deriveCEnclosingRetryTopology(graph, {
    nodeRef: sourceCursor.currentNodeRef,
    termPath: sourceCursor.termPath,
  });
  const targetTopology = deriveCEnclosingRetryTopology(
    graph,
    targetCursor === null
      ? null
      : {
          nodeRef: targetCursor.currentNodeRef,
          termPath: targetCursor.termPath,
        },
  );
  const sourceTerm = resolveCProgramTermAtSourcePath(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  const sourceContextCount = sourceTopology.kind === "c_source_path_refusal"
    ? null
    : sourceTopology.entries.length;
  const targetSemanticsMatch = continuation.kind === "c_source_path_refusal"
    ? false
    : continuation.disposition === "terminal"
      ? targetCursor === null && continuation.termPath === null
      : targetCursor !== null && continuation.termPath !== null &&
        isTraversalCursorCandidate(targetCursor) &&
        !hasAdmittedTraversalCursor(store, targetCursor) &&
        targetCursor.programRef === sourceCursor.programRef &&
        targetCursor.executionBasisRef === sourceCursor.executionBasisRef &&
        targetCursor.traversalScopeRef === sourceCursor.traversalScopeRef &&
        targetCursor.runId === sourceCursor.runId &&
        targetCursor.graphCallId === sourceCursor.graphCallId &&
        targetCursor.frameId === sourceCursor.frameId &&
        targetCursor.graphRef === sourceCursor.graphRef &&
        targetCursor.inputRef === continuation.inputRef &&
        targetCursor.inputDigest === continuation.inputDigest &&
        targetCursor.position === "at_term" &&
        targetCursor.currentNodeRef === continuation.nodeRef &&
        sameStrings(targetCursor.termPath, continuation.termPath) &&
        targetCursor.taskOrdinal === continuation.taskOrdinal &&
        targetCursor.attempt === continuation.attempt &&
        sameNumbers(targetCursor.retryPath, continuation.retryPath);
  const sourceLocusMatches = completion.completionClass ===
      "structural_identity_success"
    ? sourceTerm.kind === "c_identity"
    : cCall !== null && (sourceTerm.kind === "c_of"
      ? cCall.callClass === "leaf" &&
        cCall.programLocusRef === sourceTerm.programLocusRef
      : sourceTerm.kind === "c_workflow" &&
        cCall.callClass === "workflow" &&
        cCall.childGraphFunctionRef === sourceTerm.graphFunctionRef);
  const cCallCompletionMatches = cCall === null || result === null ||
      judgment === null
    ? completion.completionClass === "structural_identity_success"
    : cCall.cCallRef === result.cCallRef &&
      cCall.cCallRef === judgment.cCallRef &&
      cCall.runId === sourceCursor.runId &&
      cCall.graphCallId === sourceCursor.graphCallId &&
      cCall.frameId === sourceCursor.frameId &&
      cCall.taskOrdinal === sourceCursor.taskOrdinal &&
      cCall.attempt === sourceCursor.attempt &&
      sameNumbers(cCall.retryPath, sourceCursor.retryPath) &&
      sourceContextCount !== null &&
      cCall.retryPath.length === sourceContextCount &&
      (completion.completionClass === "fh_resume_success"
        ? cCall.regime === "F_H" && result.resultClass === "pending" &&
          judgment.judgment === "pending"
        : result.resultClass === "success" && judgment.judgment === "advance");
  const fanOutApplication = completion.completionClass === "fan_out_success"
    ? graph.template.applications.find(
        (application): application is Readonly<FanOutApplication> =>
          application.relationKind === "fan_out" &&
          application.applicationRef === completion.completion.applicationRef,
      ) ?? null
    : null;
  const projectedFanOutCompletion = completion.completionClass ===
        "fan_out_success" && fanOutApplication !== null
    ? projectExactFanOutCompletion(prefix, {
        mode: "graph_bound",
        admissionEventRef: completion.completion.admissionEventRef,
        authority: {
          graph,
          application: fanOutApplication,
          basisId: sourceCursor.executionBasisRef,
          runId: sourceCursor.runId,
          graphCallId: sourceCursor.graphCallId,
          frameId: sourceCursor.frameId,
        },
      })
    : null;
  const completionVariantMatches = completion.completionClass ===
      "fan_out_success"
    ? projectedFanOutCompletion?.kind === "fan_out_completion_admission" &&
      projectedFanOutCompletion.completionKind === "complete_vector" &&
      sha256Canonical(projectedFanOutCompletion as unknown as JsonValue) ===
        sha256Canonical(completion.completion as unknown as JsonValue) &&
      projectedFanOutCompletion.taskRows.at(-1)?.cCallRef === cCall?.cCallRef &&
      projectedFanOutCompletion.taskRows.at(-1)?.resultRef === result?.resultRef &&
      projectedFanOutCompletion.taskRows.at(-1)?.judgmentRef === judgment?.judgmentRef
    : completion.completionClass === "fh_resume_success"
      ? completion.resume.successorCursorRef === sourceCursor.cursorRef &&
        completion.resume.successorCursorDigest === sourceCursor.cursorDigest
      : completion.completionClass === "structural_identity_success"
        ? traversalCursorAdmissionEventRef(store, sourceCursor) ===
          completionWitnessEventRef
        : completionWitnessEventRef === judgment?.admissionEventRef;
  if (
    sourceTopology.kind === "c_source_path_refusal" ||
    targetTopology.kind === "c_source_path_refusal" ||
    !isMaterializedGtlGraph(graph) ||
    !hasAdmittedTraversalCursor(store, sourceCursor) ||
    sourceCursor.graphRef !== graph.materializationRef ||
    !targetSemanticsMatch ||
    !sourceLocusMatches ||
    !cCallCompletionMatches || !completionVariantMatches
  ) return refusal("attempt_mismatch", "completed retry progress requires one exact GTL continuation");

  const topologyPartition = deriveCanonicalRootedTopologyPartition(
    sourceTopology.witness,
    targetTopology.witness,
  );
  if (
    topologyPartition.kind ===
      "canonical_rooted_topology_partition_refusal"
  ) {
    return refusal(
      topologyPartition.code === "basis_mismatch"
        ? "basis_mismatch"
        : "attempt_mismatch",
      topologyPartition.message,
    );
  }
  if (topologyPartition.exited.length === 0) {
    return Object.freeze([]);
  }
  const contextBySegmentRef = new Map(
    sourceTopology.entries.map((entry) => [
      entry.segmentRef,
      entry.context,
    ] as const),
  );
  const exited = topologyPartition.exited.map((segmentRef) =>
    contextBySegmentRef.get(segmentRef)
  );
  if (
    topologyPartition.entered.length !== 0 ||
    topologyPartition.preserved.length !== targetTopology.entries.length ||
    exited.some((context) => context === undefined)
  ) {
    return refusal(
      "attempt_mismatch",
      "completed retry progress requires one exact ancestor topology exit",
    );
  }

  const events = runtimeEventsFromValidatedPrefix(prefix);
  const executionBasisRef = cCall?.basisId ?? sourceCursor.executionBasisRef;
  const basisEvents = events.filter((event) =>
    event.kind === "basis_admitted" && event.basisId === executionBasisRef &&
    isRecord(event.payload) && event.payload.basisRef === executionBasisRef
  );
  const basisEvent = basisEvents.length === 1 ? basisEvents[0] : undefined;
  if (
    basisEvent === undefined || !isRecord(basisEvent.payload) ||
    basisEvent.payload.graphRef !== graph.materializationRef ||
    basisEvent.payload.graphDigest !== graph.materializationDigest
  ) return refusal("basis_mismatch", "completed retry progress requires the exact materialized execution-basis Graph");
  const progressGraphFunctionRef = cCall?.graphFunctionRef ??
    (typeof basisEvent.payload.graphFunctionRef === "string"
      ? basisEvent.payload.graphFunctionRef
      : null);
  if (progressGraphFunctionRef === null ||
    progressGraphFunctionRef !== graphFunction.name) {
    return refusal(
      "basis_mismatch",
      "completed retry progress requires one exact graph-function basis",
    );
  }
  const completionWitnessEvent = events.find((event) =>
    event.eventId === completionWitnessEventRef
  );
  const plannedAttempts: Array<{
    readonly context: CEnclosingRetryContext;
    readonly retryPath: readonly number[];
    readonly boundaryRef: string;
    readonly attemptEventRef: string;
    readonly attemptRef: string;
    readonly row: DeclaredCRetryPreCCallAttemptRow |
      DeclaredCRetryActiveCCallAttemptRow |
      DeclaredCRetryNestedActiveAttemptRow;
  }> = [];
  for (const [index, contextValue] of exited.entries()) {
    const context = contextValue!;
    const retryPath = sourceCursor.retryPath.slice(0, context.retryDepth);
    const owner = projectDeclaredCRetryFrontier(
      prefix,
      graph,
      sourceCursor,
      graphFunction,
      context.retryDepth,
    );
    const row = owner?.state === "attempt_active" ? owner.active : null;
    if (owner === null || row === null || completionWitnessEvent === undefined ||
      owner.retryBoundaryRef !== retryBoundaryRef(graph, sourceCursor, context) ||
      row.attempt.attempt !== retryPath.at(-1) ||
      !sameNumbers(row.attempt.retryPath, retryPath) ||
      (index > 0 && (
        exited[index - 1]!.retryDepth !== context.retryDepth + 1 ||
        !sameNumbers(
          plannedAttempts[index - 1]!.retryPath.slice(0, -1),
          retryPath,
        )
      ))) return refusal(
        "attempt_mismatch",
        "completed retry progress requires one exact active owner chain",
      );
    plannedAttempts.push({
      context,
      retryPath,
      boundaryRef: owner.retryBoundaryRef,
      attemptEventRef: row.attemptEventRef,
      attemptRef: row.attempt.attemptRef,
      row,
    });
  }
  const directRow = plannedAttempts[0]?.row ?? null;
  const directPhase = directRow?.kind ===
      "declared_c_retry_active_c_call_attempt"
    ? directRow.cCalls.at(-1) ?? null
    : null;
  const directCursorMatches = directRow !== null &&
    directRow.currentCursor.cursorRef === sourceCursor.cursorRef &&
    directRow.currentCursor.cursorDigest === sourceCursor.cursorDigest;
  const directResume = directPhase === null
    ? null
    : projectExactInteractionResumeSuccessorAtPrefix(
        prefix,
        directPhase.sourceCursor,
      );
  const directPhaseSourceMatches = directPhase !== null && (
    (
      directPhase.sourceCursor.cursorRef === sourceCursor.cursorRef &&
      directPhase.sourceCursor.cursorDigest === sourceCursor.cursorDigest
    ) || (
      completion.completionClass === "fh_resume_success" &&
      directResume?.resumeEventRef === completion.resume.admissionEventRef &&
      directResume.cursor.cursorRef === sourceCursor.cursorRef &&
      directResume.cursor.cursorDigest === sourceCursor.cursorDigest
    )
  );
  const directCompletionOwned = completion.completionClass ===
      "structural_identity_success"
    ? directRow?.kind === "declared_c_retry_pre_c_call_attempt" &&
      directCursorMatches &&
      directRow.cCallState.prospective.kind ===
        "declared_c_retry_prospective_structural_identity"
    : directRow?.kind === "declared_c_retry_active_c_call_attempt" &&
      directCursorMatches && directPhase?.phase === "judged" &&
      directPhase === directRow.cCalls.at(-1) &&
      directPhaseSourceMatches &&
      cCall !== null && result !== null && judgment !== null &&
      sha256Canonical(directPhase.cCall as unknown as JsonValue) ===
        sha256Canonical(cCall as unknown as JsonValue) &&
      sha256Canonical(directPhase.result as unknown as JsonValue) ===
        sha256Canonical(result as unknown as JsonValue) &&
      sha256Canonical(directPhase.judgment as unknown as JsonValue) ===
        sha256Canonical(judgment as unknown as JsonValue);
  if (!directCompletionOwned) return refusal(
    "attempt_mismatch",
    "completed retry progress requires the exact active owner phase",
  );
  const planned = plannedAttempts.map((attempt, index) => {
    const common = {
      progressClass: "completed" as const,
      retryBoundaryRef: attempt.boundaryRef,
      attemptRef: attempt.attemptRef,
      attempt: attempt.retryPath.at(-1)!,
      retryPath: attempt.retryPath,
      completedRetryDepth: attempt.context.retryDepth,
      completionClass: completion.completionClass,
      completionWitnessEventRef,
      sourceCursorRef: sourceCursor.cursorRef,
      sourceCursorDigest: sourceCursor.cursorDigest,
      targetCursorRef: targetCursor?.cursorRef ?? null,
      targetCursorDigest: targetCursor?.cursorDigest ?? null,
      predecessorProgressRef: index === 0 ? null : "",
    };
    return completion.completionClass === "structural_identity_success"
      ? common
      : {
          ...common,
          completionClass: completion.completionClass,
          cCallRef: completion.cCall.cCallRef,
          resultRef: completion.result.resultRef,
          judgmentRef: completion.judgment.judgmentRef,
        };
  });
  for (let index = 1; index < planned.length; index += 1) {
    const predecessorDigest = sha256Canonical(
      planned[index - 1]! as unknown as JsonValue,
    );
    planned[index] = {
      ...planned[index]!,
      predecessorProgressRef:
        `retry-progress://abiogenesis/${
          predecessorDigest.slice("sha256:".length)
        }`,
    };
  }
  const identities = planned.map((body) => {
    const progressDigest = sha256Canonical(body as unknown as JsonValue);
    const progressRef =
      `retry-progress://abiogenesis/${
        progressDigest.slice("sha256:".length)
      }`;
    return { body, progressDigest, progressRef };
  });
  try {
    const admittedEvents = compareAndAppendExpectedPrefix(
      store,
      expectedPrefixDigest,
      identities.map((identity, index) =>
      (priorEvents) => {
      const {
        targetCursorRef,
        targetCursorDigest,
        ...commonBody
      } = identity.body;
      return {
      kind: "retry_progress_recorded",
      eventTime: basis.eventTime,
      aggregateType: "frame",
      aggregateId: sourceCursor.frameId,
      parentAggregateId: sourceCursor.graphCallId,
      causationEventRefs: [
        plannedAttempts[index]!.attemptEventRef,
        index === 0
          ? completionWitnessEventRef
          : priorEvents[index - 1]!.eventId,
      ],
      correlationId:
        `${basis.correlationId}/completed-${identity.body.completedRetryDepth}`,
      workflowVersion: "5.0.0",
      scopeClass: "run",
      basisId: executionBasisRef,
      runId: sourceCursor.runId,
      graphFunctionRef: progressGraphFunctionRef,
      materializationRef: graph.materializationRef,
      graphCallId: sourceCursor.graphCallId,
      frameId: sourceCursor.frameId,
      payload: targetCursorRef === null
        ? {
          progressRef: identity.progressRef,
          progressDigest: identity.progressDigest,
          ...commonBody,
        }
        : {
          progressRef: identity.progressRef,
          progressDigest: identity.progressDigest,
          ...commonBody,
          targetCursorRef,
          targetCursorDigest,
        },
      };
    }
      ),
    );
    const admissions = identities.map((identity, index) => {
      return deepFreeze({
        kind: "retry_progress_admission" as const,
        schemaVersion: "5.0.0" as const,
        disposition: "admitted" as const,
        progressRef: identity.progressRef,
        progressDigest: identity.progressDigest,
        ...identity.body,
        admissionEventRef: admittedEvents[index]!.eventId,
      }) as RetryCompletedProgressAdmission;
    });
    const admittedPrefix = selectValidatedRuntimeEventPrefix(store.readAll());
    const ownerMismatch = plannedAttempts.some((attempt, index) => {
      const owner = projectDeclaredCRetryFrontier(
        admittedPrefix,
        graph,
        sourceCursor,
        graphFunction,
        attempt.context.retryDepth,
      );
      const available = owner?.state === "progress_available"
        ? owner.available
        : null;
      return available === null ||
        available.progressEventRef !== admittedEvents[index]!.eventId ||
        available.progress.progressRef !== admissions[index]!.progressRef ||
        sha256Canonical(available.progress as unknown as JsonValue) !==
          sha256Canonical(admissions[index] as unknown as JsonValue);
    });
    if (ownerMismatch) throw new TypeError(
      "completed retry progress does not reproject through every declared owner",
    );
    return Object.freeze(admissions);
  } catch (error) {
    if (isExpectedPrefixMismatch(error) ||
      (error instanceof TypeError && error.message.startsWith(
        "completed retry progress does not reproject",
      ))) {
      return refusal(
        "progress_mismatch",
        "completed retry authority changed after immutable-prefix validation",
      );
    }
    throw error;
  }
}
