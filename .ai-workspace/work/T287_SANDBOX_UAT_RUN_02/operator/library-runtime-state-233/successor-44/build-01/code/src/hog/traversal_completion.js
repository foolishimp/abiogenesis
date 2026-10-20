import { deepFreeze } from "../shared/immutable.js";
import { completePublicOutcome } from "../abg/c_call_outcome.js";
/** @internal Same owner computation with a selected guard receipt. */
export function projectOwnedExecutableTraversalCompletion(disposition, replayState, successorPrefix, values = {}) {
    return deepFreeze({
        kind: "executable_traversal_completion",
        schemaVersion: "5.0.0",
        disposition,
        cCallRef: values.cCallRef ?? null,
        resultRef: values.resultRef ?? null,
        judgmentRef: values.judgmentRef ?? null,
        closureRef: values.closureRef ?? null,
        nextCursor: values.nextCursor ?? null,
        resultValue: values.resultValue ?? null,
        continuationKind: values.continuationKind ?? null,
        nextInputContractRef: values.nextInputContractRef ?? null,
        replayState,
        successorPrefix,
        diagnosticRef: values.diagnosticRef ?? null,
        continuationRef: values.continuationRef ?? null,
        heldCursor: values.heldCursor ?? null,
        heldInteraction: values.heldInteraction ?? null,
        heldGraph: values.heldGraph ?? null,
        heldClosureContract: values.heldClosureContract ?? null,
        parentSuspensions: values.parentSuspensions ?? [],
    });
}
/** @internal Same owner computation with a selected guard receipt. */
export function projectOwnedHeldTraversalCompletion(input) {
    return projectOwnedExecutableTraversalCompletion("held", input.replayState, input.hold.successorPrefix, {
        cCallRef: input.hold.pending.cCall.cCallRef,
        resultRef: input.hold.pending.result.resultRef,
        judgmentRef: input.hold.pending.judgment.judgmentRef,
        resultValue: input.hold.pending.result.value,
        continuationRef: input.hold.continuation.continuationRef,
        heldCursor: input.cursor,
        heldGraph: input.graph,
        heldClosureContract: input.closureContract,
        heldInteraction: {
            cCall: input.hold.pending.cCall,
            result: input.hold.pending.result,
            judgment: input.hold.pending.judgment,
            cursor: input.cursor,
        },
        parentSuspensions: input.parentSuspensions,
    });
}
/** @internal Same owner computation with a selected guard receipt. */
export function projectOwnedBlockedRetryTraversalCompletion(input) {
    const transition = input.plan.transition;
    if (transition.disposition !== "blocked") {
        throw new TypeError("blocked retry completion requires one exact blocked transition plan");
    }
    return projectOwnedExecutableTraversalCompletion("blocked", input.route.replayState, input.route.successorPrefix, {
        cCallRef: transition.close.cCallRef,
        resultRef: transition.close.result.resultRef,
        judgmentRef: transition.close.judgment.judgmentRef,
        resultValue: transition.close.result.value,
        diagnosticRef: transition.close.judgment.reasonRef,
    });
}
export function projectExecutableTraversalCompletion(disposition, replayState, successorPrefix, values = {}) {
    return completePublicOutcome(projectOwnedExecutableTraversalCompletion(disposition, replayState, successorPrefix, values));
}
export function projectHeldTraversalCompletion(input) {
    return completePublicOutcome(projectOwnedHeldTraversalCompletion(input));
}
export function projectBlockedRetryTraversalCompletion(input) {
    return completePublicOutcome(projectOwnedBlockedRetryTraversalCompletion(input));
}
