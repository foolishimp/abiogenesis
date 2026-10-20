import type { RawAdmittedValue } from "../validator/raw_admission.js";
import type { AdmittedCCallJudgment, AdmittedCCallResult, CCall } from "../abg/c_call.js";
import type { BlockedCCallOutcomeReceipt, JudgedCCallOutcomeReceipt } from "../abg/c_call_outcome.js";
import type { FanOutCompletionAdmission } from "../abg/fan_out.js";
import type { FhInteractionResumeAdmission } from "../abg/continuation.js";
import type { CompletedRetryProgressPlan, RetryCompletedProgressAdmission, RetryProgressAdmission } from "../abg/retry.js";
import type { ReplayState } from "../abg/replay.js";
import type { GraphSpanReentryProjection, RouteCandidate } from "../abg/traversal_route.js";
import { type ApplicationChildFoldbackAdmission, type ApplicationChildPreparationRefusalAdmission } from "../abg/graph_application.js";
import type { FanOutApplication, GraphFunction, GtlGraph, RecurseApplication } from "../gtl/contracts.js";
import { type TraversalCursorCandidate as TraversalCursor } from "../abg/traversal_cursor.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { type TraversalTransitionCandidate } from "../abg/traversal_transition.js";
type RouteSourceLocus = Readonly<{
    stopClass: "executable" | "interaction";
    nodeRef: string;
    programLocusRef: string;
    cursor: TraversalCursor;
}>;
export interface RouteProposalRefusal {
    readonly kind: "traversal_route_proposal_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "gap_stop_not_declared" | "graph_span_reentry_not_declared" | "judgment_not_advance" | "judgment_not_pending" | "resume_not_admitted" | "retry_progress_missing" | "structural_step_missing" | "terminal_not_declared";
    readonly message: string;
}
export declare function proposeStructuralRoute(graph: Readonly<GtlGraph>, sourceCursor: TraversalCursor, targetCursor: TraversalCursor, routeKind: "advance" | "retry", replayState: ReplayState, completedProgresses?: readonly RetryCompletedProgressAdmission[], boundInput?: RawAdmittedValue<Readonly<Record<string, JsonValue>>>): RouteCandidate | RouteProposalRefusal;
export declare function proposeRetryRoute(graph: Readonly<GtlGraph>, sourceCursor: TraversalCursor, targetCursor: TraversalCursor, cCall: CCall, progress: RetryProgressAdmission, replayState: ReplayState, contractRef: string): RouteCandidate | RouteProposalRefusal;
export declare function proposeTerminalRoute(graph: Readonly<GtlGraph>, stop: RouteSourceLocus, cCall: CCall, judgment: AdmittedCCallJudgment, replayState: ReplayState, contractRef: string): RouteCandidate | RouteProposalRefusal;
export declare function proposeJudgedRoute(graph: Readonly<GtlGraph>, sourceCursor: TraversalCursor, targetCursor: TraversalCursor | null, cCall: CCall, result: AdmittedCCallResult, judgment: AdmittedCCallJudgment, replayState: ReplayState, contractRef: string, completedProgresses?: readonly RetryCompletedProgressAdmission[], boundInput?: RawAdmittedValue<Readonly<Record<string, JsonValue>>>, definitionDigests?: Readonly<Record<string, `sha256:${string}`>>): RouteCandidate | RouteProposalRefusal;
export declare function proposeGraphSpanReentryRoute(graph: Readonly<GtlGraph>, sourceCursor: TraversalCursor, targetCursor: TraversalCursor, cCall: CCall, result: AdmittedCCallResult, judgment: AdmittedCCallJudgment, replayState: ReplayState, contractRef: string, projection: Readonly<GraphSpanReentryProjection>): RouteCandidate | RouteProposalRefusal;
export declare function proposeGapStopRoute(graph: Readonly<GtlGraph>, stop: RouteSourceLocus, cCall: CCall, result: AdmittedCCallResult, judgment: AdmittedCCallJudgment, replayState: ReplayState, contractRef: string): RouteCandidate | RouteProposalRefusal;
export declare function proposeBlockedRoute(graph: Readonly<GtlGraph>, stop: RouteSourceLocus, cCall: CCall, judgmentRef: string, replayState: ReplayState, contractRef: string, stoppedProgressRefs?: readonly string[]): RouteCandidate | RouteProposalRefusal;
export declare function proposeFailedRoute(graph: Readonly<GtlGraph>, stop: RouteSourceLocus, cCall: CCall, result: AdmittedCCallResult, judgment: AdmittedCCallJudgment, replayState: ReplayState, contractRef: string): RouteCandidate | RouteProposalRefusal;
/** Undefined retains ordinary continuation; null is the selected no-action stop. */
export declare function deriveSelectedCCallOutcomeTarget(graph: Readonly<GtlGraph>, source: TraversalCursor, outcome: JudgedCCallOutcomeReceipt | BlockedCCallOutcomeReceipt, definitionDigests?: Readonly<Record<string, `sha256:${string}`>>, boundInput?: RawAdmittedValue<Readonly<Record<string, JsonValue>>>): TraversalCursor | RouteProposalRefusal | null | undefined;
export declare function proposeCCallOutcomeTransition(input: Readonly<{
    graph: Readonly<GtlGraph>;
    graphFunction: Readonly<GraphFunction>;
    sourceCursor: TraversalCursor;
    targetCursor: TraversalCursor | null;
    outcome: JudgedCCallOutcomeReceipt | BlockedCCallOutcomeReceipt;
    completedRetryProgress?: CompletedRetryProgressPlan;
    boundInput?: RawAdmittedValue<Readonly<Record<string, JsonValue>>>;
    terminalizeNonAdvance: boolean;
    registeredSelectionDefinitionDigests?: Readonly<Record<string, `sha256:${string}`>>;
}>): TraversalTransitionCandidate | RouteProposalRefusal;
export declare function proposeHoldRoute(graph: Readonly<GtlGraph>, stop: RouteSourceLocus, cCall: CCall, judgment: AdmittedCCallJudgment, replayState: ReplayState, contractRef: string): RouteCandidate | RouteProposalRefusal;
export declare function proposeInteractionResumeTerminalRoute(graph: Readonly<GtlGraph>, cursor: RouteSourceLocus["cursor"], cCall: CCall, judgment: AdmittedCCallJudgment, resume: FhInteractionResumeAdmission, replayState: ReplayState, contractRef: string): RouteCandidate | RouteProposalRefusal;
export declare function proposeInteractionResumeRoute(graph: Readonly<GtlGraph>, cursor: TraversalCursor, targetCursor: TraversalCursor | null, cCall: CCall, judgment: AdmittedCCallJudgment, resume: FhInteractionResumeAdmission, replayState: ReplayState, contractRef: string, completedProgresses?: readonly RetryCompletedProgressAdmission[], boundInput?: RawAdmittedValue<Readonly<Record<string, JsonValue>>>, definitionDigests?: Readonly<Record<string, `sha256:${string}`>>): RouteCandidate | RouteProposalRefusal;
export declare function proposeFanOutRoute(graph: Readonly<GtlGraph>, application: Readonly<FanOutApplication>, sourceCursor: TraversalCursor, targetCursor: TraversalCursor | null, cCall: CCall, completion: FanOutCompletionAdmission, replayState: ReplayState, contractRef: string, completedProgresses?: readonly RetryCompletedProgressAdmission[], boundInput?: RawAdmittedValue<Readonly<Record<string, JsonValue>>>, definitionDigests?: Readonly<Record<string, `sha256:${string}`>>): RouteCandidate | RouteProposalRefusal;
export declare function proposeRecursionRoute(graph: Readonly<GtlGraph>, application: Readonly<RecurseApplication>, sourceCursor: RouteSourceLocus["cursor"], targetCursor: RouteSourceLocus["cursor"] | null, cCall: CCall, judgment: AdmittedCCallJudgment, foldback: ApplicationChildFoldbackAdmission | null, replayState: ReplayState, contractRef: string, routeKind: "advance" | "blocked", preparationRefusal?: ApplicationChildPreparationRefusalAdmission | null): RouteCandidate | RouteProposalRefusal;
export {};
