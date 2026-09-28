import type { ModulePublication } from "../gtl/contracts.js";
import type { ClosureContract, GraphFunction, GtlGraph } from "../gtl/contracts.js";
import type { ClosedLeafOwnerReceipt, LeafInvocationPort } from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { WorkspaceBinding } from "../product/environment.js";
import type { ActorRuntimeBinding } from "./actor_process.js";
import { type AdmittedCCallResult, type CCall, type CCallAdmissionRejection, type CCallRuntimeFailureSource, type ChildFoldbackAdmission, type RehydratedAdmittedCCallState, type JudgmentCandidate, type RejectedCCallCompletion } from "./c_call.js";
import type { AdmittedImplementationResolutionRow, AdmittedImplementationSet, ExecutionBasis, RuntimeAdmissionBasis } from "./execution_basis.js";
import type { AbgEventStore, RuntimeEvent } from "./event_store.js";
import { type DurablePrefixCoordinate } from "./event_store.js";
import type { ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { type ReplayState } from "./replay.js";
import { type CompletedRetryProgressPlan, type RetryAdmissionRefusal, type RetrySuccessfulExitEvidence } from "./retry.js";
import type { TraversalCursorCandidate } from "./traversal_cursor.js";
import type { OpenedTraversalScope } from "./open_call.js";
import { type ScopeClosureAdmission, type ScopeClosureAdmissionRefusal } from "./closure.js";
import { type RouteTransitionAdmission, type RouteTransitionResult } from "./traversal_route.js";
import type { TraversalTransitionCandidate } from "./traversal_transition.js";
/** Reconstructs C0's Product-owned failure join from admitted bytes, with no I/O. */
export declare function projectWorksiteFailureBasis(events: readonly RuntimeEvent[], cCallRef: string, value: unknown): {
    request: (JsonValue | undefined) & import("../product/worksite_effect.js").WorksiteFileReplaceRequest;
    authorization: import("../product/worksite_effect.js").WorksiteEffectAuthorization;
    executionBasis: ExecutionBasis;
    implementationSet: AdmittedImplementationSet;
    workspaceBinding: WorkspaceBinding;
    cCall: CCall;
} | null;
interface CCallAdmissionContext {
    readonly store: AbgEventStore;
    readonly graph: Readonly<GtlGraph>;
    readonly graphFunction: Readonly<GraphFunction>;
    readonly cursor: TraversalCursorCandidate;
    readonly cCall: CCall;
    readonly basis: RuntimeAdmissionBasis;
}
interface CCallOutcomeCommonInput extends CCallAdmissionContext {
    readonly programPublication?: Readonly<ModulePublication>;
    readonly predecessorPrefix: DurablePrefixCoordinate;
    readonly executionBasis: ExecutionBasis;
    readonly leafPort: LeafInvocationPort;
    readonly input: Readonly<Record<string, JsonValue>>;
    readonly inputDigest: `sha256:${string}`;
    readonly outputValueKind: string;
    readonly failureValueKind: string;
}
interface LeafCCallOutcomeInput extends CCallOutcomeCommonInput {
    readonly outcomeClass: "leaf";
    readonly implementationSet: AdmittedImplementationSet;
    readonly resolution: AdmittedImplementationResolutionRow;
    readonly ownerReceipt: Readonly<ClosedLeafOwnerReceipt>;
}
export type AdmitCCallResultInput = (LeafCCallOutcomeInput & Readonly<{
    regime: "F_D";
}>) | (LeafCCallOutcomeInput & Readonly<{
    regime: "F_P";
    actorRuntimeBinding: ActorRuntimeBinding;
}>) | (CCallOutcomeCommonInput & Readonly<{
    outcomeClass: "workflow";
    resultDisposition: "success";
    resultCandidate: Readonly<Record<string, JsonValue>>;
    foldback: ChildFoldbackAdmission;
}>) | (CCallOutcomeCommonInput & Readonly<{
    outcomeClass: "workflow";
    resultDisposition: "failure";
    resultCandidate: Readonly<Record<string, JsonValue>>;
    failureDiagnosticRef: string;
    foldback: ChildFoldbackAdmission;
}>);
interface CCallOutcomeReceiptBase {
    readonly kind: "admitted_c_call_outcome";
    readonly schemaVersion: "5.0.0";
    readonly replayState: ReplayState;
    readonly runtimePrefix: ValidatedRuntimeEventPrefix;
    readonly successorPrefix: DurablePrefixCoordinate;
}
export interface ResultCCallOutcomeReceipt extends CCallOutcomeReceiptBase {
    readonly disposition: "result";
    readonly cCall: CCall;
    readonly result: AdmittedCCallResult;
}
export interface JudgedCCallOutcomeReceipt extends CCallOutcomeReceiptBase {
    readonly disposition: "judged";
    readonly admitted: RehydratedAdmittedCCallState;
}
export interface RetryCCallOutcomeReceipt extends CCallOutcomeReceiptBase {
    readonly disposition: "retry";
    readonly cCall: CCall;
    readonly source: CCallRuntimeFailureSource;
    readonly failureCandidate: JsonValue;
    readonly failureValueKind: string;
}
export interface BlockedCCallOutcomeReceipt extends CCallOutcomeReceiptBase {
    readonly disposition: "blocked";
    readonly cCall: CCall;
    readonly result: AdmittedCCallResult;
    readonly completion: RejectedCCallCompletion;
    readonly diagnosticRef: string;
}
export type AdmittedCCallOutcomeReceipt = ResultCCallOutcomeReceipt | JudgedCCallOutcomeReceipt | RetryCCallOutcomeReceipt | BlockedCCallOutcomeReceipt;
export interface AdmitCCallJudgmentInput {
    readonly store: AbgEventStore;
    readonly graph: Readonly<GtlGraph>;
    readonly graphFunction: Readonly<GraphFunction>;
    readonly cursor: TraversalCursorCandidate;
    readonly outcome: ResultCCallOutcomeReceipt;
    readonly candidate: JudgmentCandidate;
    readonly basis: RuntimeAdmissionBasis;
}
export interface AdmitCCallRejectionInput extends CCallAdmissionContext {
    readonly predecessorPrefix: DurablePrefixCoordinate;
    readonly rejection: CCallAdmissionRejection;
}
export type AdmitCCallJudgmentResult = JudgedCCallOutcomeReceipt | BlockedCCallOutcomeReceipt;
export interface AdmitCCallCompletionInput {
    readonly store: AbgEventStore;
    readonly predecessorPrefix: DurablePrefixCoordinate;
    readonly executionBasis: ExecutionBasis;
    readonly graph: Readonly<GtlGraph>;
    readonly graphFunction: Readonly<GraphFunction>;
    readonly source: TraversalCursorCandidate;
    readonly target: TraversalCursorCandidate | null;
    readonly outcome: JudgedCCallOutcomeReceipt | BlockedCCallOutcomeReceipt;
    readonly candidate: TraversalTransitionCandidate | null;
    readonly openedTraversalScope: OpenedTraversalScope;
    readonly closureContract: Readonly<ClosureContract>;
    readonly basis: RuntimeAdmissionBasis;
    readonly completedRetryProgress?: Readonly<{
        readonly plan: CompletedRetryProgressPlan;
        readonly completion: RetrySuccessfulExitEvidence;
        readonly basis: RuntimeAdmissionBasis;
    }>;
    readonly deferToApplication?: true;
}
type CCallCompletionPayload = Readonly<{
    disposition: "application_ready";
    outcome: JudgedCCallOutcomeReceipt;
    replayState: ReplayState;
}> | Readonly<{
    disposition: "advanced";
    outcome: JudgedCCallOutcomeReceipt;
    transition: RouteTransitionAdmission;
    reentryInputContractRef: string | null;
}> | Readonly<{
    disposition: "blocked";
    outcome: BlockedCCallOutcomeReceipt | JudgedCCallOutcomeReceipt;
    transition: RouteTransitionAdmission;
}> | Readonly<{
    disposition: "failed";
    outcome: JudgedCCallOutcomeReceipt;
    transition: RouteTransitionAdmission;
}> | Readonly<{
    disposition: "gap_stop";
    outcome: JudgedCCallOutcomeReceipt;
    transition: RouteTransitionAdmission;
}> | Readonly<{
    disposition: "closed";
    outcome: JudgedCCallOutcomeReceipt;
    transition: RouteTransitionAdmission;
    closure: ScopeClosureAdmission;
}>;
export type CCallCompletionAdmission = Readonly<{
    kind: "c_call_completion_admission";
    schemaVersion: "5.0.0";
}> & CCallCompletionPayload;
export type CCallCompletionResult = CCallCompletionAdmission | Exclude<RouteTransitionResult, RouteTransitionAdmission> | RetryAdmissionRefusal | ScopeClosureAdmissionRefusal;
export type CCallOutcomeProjectionBasis = Readonly<{
    disposition: "judged";
    admitted: RehydratedAdmittedCCallState;
}> | Readonly<{
    disposition: "blocked";
    cCall: CCall;
    completion: RejectedCCallCompletion;
    diagnosticRef: string;
}>;
/**
 * Rehydrates a judged or blocked outcome from its exact durable successor.
 * The owner authenticates the exact durable prefix and any prior derivation;
 * absent or untrusted derivations take the same complete reconstruction path.
 */
export declare function projectCCallOutcomeReceiptAtPrefix(successorPrefix: DurablePrefixCoordinate, basis: CCallOutcomeProjectionBasis, priorDerivation?: ReplayState): JudgedCCallOutcomeReceipt | BlockedCCallOutcomeReceipt | null;
/**
 * Admits owner evidence and one result at the caller-selected predecessor.
 * HoG must separately propose the judgment from the returned exact receipt.
 */
export declare function admitCCallResult(input: AdmitCCallResultInput): ResultCCallOutcomeReceipt | RetryCCallOutcomeReceipt | BlockedCCallOutcomeReceipt;
/**
 * Admits only the judgment candidate already derived by HoG from the exact
 * admitted result receipt and declared relation.
 */
export declare function admitCCallJudgment(input: Readonly<AdmitCCallJudgmentInput>): AdmitCCallJudgmentResult;
/**
 * Admits one already-produced owner admission rejection at an exact durable
 * predecessor and returns only its rehydrated durable outcome.
 */
export declare function admitCCallRejection(input: Readonly<AdmitCCallRejectionInput>): BlockedCCallOutcomeReceipt;
/**
 * Admits only the runtime transition selected after HoG/GTL derives a target.
 * ABG validates and admits that target; it never derives traversal topology.
 */
export declare function admitCCallCompletion(input: AdmitCCallCompletionInput): CCallCompletionResult;
export {};
