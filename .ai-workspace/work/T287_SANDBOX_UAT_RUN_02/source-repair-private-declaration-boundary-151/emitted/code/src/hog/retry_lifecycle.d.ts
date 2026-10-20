import type { RuntimeAdmissionBasis } from "../abg/execution_basis.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import * as AbgRetry from "../abg/retry.js";
import type { GraphFunction, GtlGraph } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { type TraversalCursor } from "./traversal.js";
import type { ExecuteGraphTraversalCommonInput } from "./traversal_contract.js";
import { type ExecutableTraversalCompletion } from "./traversal_completion.js";
export interface RetryResumeStep {
    readonly kind: "retry_resume";
    readonly resume: AbgRetry.ProjectedRetryResumeSuccess;
    readonly correlationId: string;
}
export interface RetryBlockedStep {
    readonly kind: "retry_blocked";
    readonly completion: ExecutableTraversalCompletion;
    readonly outputValueKind: string;
    readonly outputContractRef: string;
}
export type RetryLifecycleStep = RetryResumeStep | RetryBlockedStep;
export type ResumeProjectedRetryRuntime = Pick<ExecuteGraphTraversalCommonInput, "executionBasis" | "openedTraversalScope" | "program" | "graphFunction" | "graph" | "graphValidation" | "eventTime" | "correlationId">;
export interface ResumeProjectedRetryRequest {
    readonly store: ExecuteGraphTraversalCommonInput["store"];
    readonly predecessorPrefix: DurablePrefixCoordinate;
    readonly retry: AbgRetry.ExecutableRetryInput;
    readonly runtime: ResumeProjectedRetryRuntime;
}
export type ProjectedRetryResumeRefusalCode = "projection_mismatch" | "prefix_mismatch" | "runtime_basis_mismatch" | "retry_step_refused" | "retry_route_refused" | "retry_attempt_refused";
export interface ProjectedRetryResumeRefusal {
    readonly kind: "projected_retry_resume_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: ProjectedRetryResumeRefusalCode;
    readonly message: string;
    readonly executableRetryInputRef: string | null;
    readonly executableRetryInputDigest: `sha256:${string}` | null;
    readonly lowerCause: JsonValue;
}
export type ProjectedRetryResumeResult = AbgRetry.ProjectedRetryResumeSuccess | ProjectedRetryResumeRefusal;
export type SuccessfulRetryExitPlan = Readonly<{
    kind: "successful_retry_exit_not_applicable";
}> | Readonly<{
    kind: "successful_retry_exit_plan";
    plan: AbgRetry.CompletedRetryProgressPlan;
    completion: AbgRetry.RetrySuccessfulExitEvidence;
    basis: RuntimeAdmissionBasis;
}> | Readonly<{
    kind: "successful_retry_exit_plan_refusal";
    code: AbgRetry.RetryAdmissionRefusal["code"];
    message: string;
    refusal: AbgRetry.RetryAdmissionRefusal;
}>;
export declare function planSuccessfulRetryExit(input: Readonly<{
    predecessorPrefix: DurablePrefixCoordinate;
    graph: Readonly<GtlGraph>;
    graphFunction: Readonly<GraphFunction>;
    source: TraversalCursor;
    target: TraversalCursor | null;
    completion: AbgRetry.RetrySuccessfulExitEvidence;
    basis: RuntimeAdmissionBasis;
}>): SuccessfulRetryExitPlan;
export declare function resumeProjectedRetry(request: ResumeProjectedRetryRequest): ProjectedRetryResumeResult;
