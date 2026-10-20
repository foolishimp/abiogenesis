import * as Effect from "effect/Effect";
import { resumeProjectedRetry, type ProjectedRetryResumeRefusal, type ProjectedRetryResumeRefusalCode, type ProjectedRetryResumeResult, type ResumeProjectedRetryRequest, type ResumeProjectedRetryRuntime } from "./retry_lifecycle.js";
import { GraphTraversalFailure } from "./traversal_failure.js";
import type { ExecuteGraphTraversalCommonInput, ExecuteGraphTraversalInput, ExecuteGraphTraversalRequest, GraphTraversalEntryRefusal, GraphTraversalFailureResult, InitialOrNonRetryExecuteGraphTraversalInput, InteractionResumeTraversalEntryInput, ResumeHeldInteractionInput } from "./traversal_contract.js";
import { type ExecutableTraversalCompletion, type HeldInteractionTraversal, type HeldParentTraversalSuspension, type HeldRecursionSuspension, type HeldWorkflowSuspension } from "./traversal_completion.js";
export { GraphTraversalFailure };
export { resumeProjectedRetry };
export type { ExecuteGraphTraversalCommonInput, ExecuteGraphTraversalInput, ExecuteGraphTraversalRequest, GraphTraversalEntryRefusal, GraphTraversalFailureResult, ExecutableTraversalCompletion, HeldInteractionTraversal, HeldParentTraversalSuspension, HeldRecursionSuspension, HeldWorkflowSuspension, InitialOrNonRetryExecuteGraphTraversalInput, InteractionResumeTraversalEntryInput, ResumeHeldInteractionInput, ProjectedRetryResumeRefusal, ProjectedRetryResumeRefusalCode, ProjectedRetryResumeResult, ResumeProjectedRetryRequest, ResumeProjectedRetryRuntime, };
export type ProjectedRetryResumeSuccess = import("../abg/retry.js").ProjectedRetryResumeSuccess;
export type ExecuteGraphTraversalResult = ExecutableTraversalCompletion | GraphTraversalEntryRefusal | GraphTraversalFailureResult;
/** Effect-native HoG entry used by definition programs before the host membrane. */
export declare function executeGraphTraversalEffect(input: ExecuteGraphTraversalRequest): Effect.Effect<ExecuteGraphTraversalResult, never>;
export declare function executeGraphTraversal(input: ExecuteGraphTraversalRequest): Promise<ExecuteGraphTraversalResult>;
