import { hasAdmittedImplementationSetAtPrefix, rehydrateExecutionBasisAtPrefix, } from "../abg/execution_basis.js";
import { projectAdmittedCCallOutcomeAtPrefix, projectCurrentChildParentCCallAtPrefix, rehydrateWorkflowCCallAtPrefix, } from "../abg/c_call.js";
import { projectCCallOutcomeReceiptAtPrefix } from "../abg/c_call_outcome.js";
import { readRuntimeEventsAtDurablePrefix, } from "../abg/event_store.js";
import { selectValidatedRuntimeEventPrefix } from "../abg/event_prefix.js";
import { projectOpenedTraversalScopeClassAtPrefix, rehydrateOpenedTraversalScopeAtPrefix, } from "../abg/open_call.js";
import { recursionTerminationDecision } from "../gtl/graph_applications.js";
import { isAdmittedLeafInvocationPort } from "../implementation/leaf_invocation_port.js";
import { sha256Canonical } from "../shared/digests.js";
import { validateGraph } from "../validator/graph.js";
import { projectParentSuspensions, } from "./evaluation_frame.js";
import { rehydrateHeldInteractionCursor, resolveTraversalTerm, traverseFromCursor, } from "./traversal.js";
function sameCanonical(left, right) {
    return sha256Canonical(left) ===
        sha256Canonical(right);
}
function rehydrated(value) {
    return Object.freeze({ kind: "rehydrated", value });
}
function rehydrationFailure(stage) {
    return Object.freeze({
        kind: "parent_rehydration_refusal",
        schemaVersion: "5.0.0",
        stage,
        diagnosticRef: `diagnostic://abiogenesis/hog/parent-rehydration-${stage}@5`,
    });
}
function exactParentTraversal(input, prefix, suspension, executionBasis, scope) {
    const graphFunction = input.leafPort.graphFunctionByRef(suspension.parentGraph.graphFunctionRef);
    if (graphFunction === null)
        return rehydrationFailure("graph-function");
    const graphValidation = validateGraph(suspension.parentGraph, input.programValidation, graphFunction, {
        invocationAdmissionRef: suspension.parentGraph.invocationAdmissionRef,
        admittedInputRef: suspension.parentGraph.admittedInputRef,
        admittedInputDigest: suspension.parentGraph.admittedInputDigest,
        admittedInput: suspension.parentGraphInput,
    });
    if (graphValidation.kind !== "graph_validation" ||
        graphValidation.validationRef !== executionBasis.graphValidationRef ||
        executionBasis.programRef !== input.program.programRef ||
        executionBasis.graphRef !== suspension.parentGraph.materializationRef ||
        executionBasis.graphDigest !== suspension.parentGraph.materializationDigest ||
        executionBasis.closureContractRef !==
            suspension.parentClosureContract.closureContractRef ||
        scope.executionBasisRef !== executionBasis.basisRef ||
        suspension.parentGraphInputDigest !==
            suspension.parentGraph.admittedInputDigest ||
        sha256Canonical(suspension.parentGraphInput) !== suspension.parentGraphInputDigest ||
        !hasAdmittedImplementationSetAtPrefix(prefix, input.implementationSet) ||
        input.implementationSet.implementationSetRef !==
            executionBasis.rootImplementationSetRef ||
        input.implementationSet.implementationSetDigest !==
            executionBasis.rootImplementationSetDigest ||
        !isAdmittedLeafInvocationPort(input.leafPort) ||
        input.leafPort.implementationSetRef !==
            input.implementationSet.implementationSetRef ||
        input.leafPort.implementationSetDigest !==
            input.implementationSet.implementationSetDigest) {
        return rehydrationFailure("parent-runtime");
    }
    return rehydrated(Object.freeze({
        program: input.program,
        graphFunction,
        graph: suspension.parentGraph,
        graphValidation,
        executionBasis,
        openedTraversalScope: scope,
    }));
}
function exactWorkflowReturn(input, prefix, suspension, parentExecutionBasis, parentScope, childExecutionBasis, childScope, terminalMode) {
    const traversalResult = exactParentTraversal(input, prefix, suspension, parentExecutionBasis, parentScope);
    if (traversalResult.kind === "parent_rehydration_refusal") {
        return traversalResult;
    }
    const traversal = traversalResult.value;
    const sourceCursor = rehydrateHeldInteractionCursor(prefix, suspension.sourceCursor);
    if (sourceCursor === null)
        return rehydrationFailure("workflow-cursor");
    const atCursor = traverseFromCursor(traversal, sourceCursor);
    const term = atCursor.kind === "traversal_cursor"
        ? resolveTraversalTerm(traversal.graph, atCursor)
        : null;
    const parentCCall = rehydrateWorkflowCCallAtPrefix(prefix, parentExecutionBasis, input.implementationSet, parentScope, traversal.graphFunction, traversal.graph, sourceCursor, suspension.parentCCall);
    const application = suspension.application === null
        ? null
        : traversal.graph.template.applications.find((candidate) => candidate.relationKind === "fan_out" &&
            candidate.applicationRef === suspension.application.applicationRef &&
            candidate.batchRef === suspension.application.batchRef) ?? null;
    if (term?.kind !== "c_workflow" ||
        term.graphFunctionRef !== childExecutionBasis.graphFunctionRef ||
        parentCCall === null ||
        parentCCall.cCallRef !== suspension.parentCCall.cCallRef ||
        (suspension.application === null
            ? application !== null || parentCCall.batchRef !== null
            : application === null ||
                !sameCanonical(application, suspension.application) ||
                parentCCall.batchRef !== application.batchRef) ||
        sha256Canonical(suspension.parentInput) !== suspension.parentInputDigest ||
        suspension.parentInputDigest !== sourceCursor.inputDigest) {
        return rehydrationFailure("workflow-relation");
    }
    return rehydrated(Object.freeze({
        relation: "workflow",
        parent: Object.freeze({
            traversal,
            implementationSet: input.implementationSet,
            leafPort: input.leafPort,
            closureContract: suspension.parentClosureContract,
            graphEntryInput: suspension.parentGraphInput,
            graphEntryInputDigest: suspension.parentGraphInputDigest,
            cursor: sourceCursor,
            input: suspension.parentInput,
            terminalMode,
        }),
        parentCall: parentCCall,
        application,
        childExecutionBasis,
        childTraversalScope: childScope,
        childInput: suspension.childInput,
        childInputDigest: suspension.childInputDigest,
    }));
}
function exactRecursionReturn(input, prefix, suspension, parentExecutionBasis, parentScope, childExecutionBasis, childScope, terminalMode) {
    const traversalResult = exactParentTraversal(input, prefix, suspension, parentExecutionBasis, parentScope);
    if (traversalResult.kind === "parent_rehydration_refusal") {
        return traversalResult;
    }
    const traversal = traversalResult.value;
    const sourceCursor = rehydrateHeldInteractionCursor(prefix, suspension.sourceCursor);
    const application = traversal.graph.template.applications.find((candidate) => candidate.relationKind === "recurse" &&
        candidate.applicationRef === suspension.application.applicationRef);
    const admitted = projectAdmittedCCallOutcomeAtPrefix(prefix, suspension.evaluatorCCall, suspension.evaluatorResult, suspension.evaluatorJudgment);
    const outcome = admitted === null
        ? null
        : projectCCallOutcomeReceiptAtPrefix(input.predecessorPrefix, {
            disposition: "judged",
            admitted,
        });
    if (sourceCursor === null ||
        application === undefined ||
        !sameCanonical(application, suspension.application) ||
        outcome?.disposition !== "judged" ||
        outcome.admitted.cCall.cCallRef !== suspension.evaluatorCCall.cCallRef ||
        recursionTerminationDecision(application, suspension.evaluatorResult.value) !== false ||
        sha256Canonical(suspension.evaluatorInput) !== suspension.evaluatorInputDigest ||
        suspension.evaluatorInputDigest !== sourceCursor.inputDigest ||
        application.graphFunctionRef !== childExecutionBasis.graphFunctionRef) {
        return rehydrationFailure("recursion-relation");
    }
    return rehydrated(Object.freeze({
        relation: "recursion",
        parent: Object.freeze({
            traversal,
            implementationSet: input.implementationSet,
            leafPort: input.leafPort,
            closureContract: suspension.parentClosureContract,
            graphEntryInput: suspension.parentGraphInput,
            graphEntryInputDigest: suspension.parentGraphInputDigest,
            cursor: sourceCursor,
            input: suspension.evaluatorInput,
            terminalMode,
        }),
        parentOutcome: outcome,
        application,
        childExecutionBasis,
        childTraversalScope: childScope,
        childInput: suspension.childInput,
        childInputDigest: suspension.childInputDigest,
    }));
}
export function rehydrateParentReturnFrames(input) {
    const prefix = selectValidatedRuntimeEventPrefix(readRuntimeEventsAtDurablePrefix(input.predecessorPrefix));
    let childExecutionBasis = rehydrateExecutionBasisAtPrefix(prefix, input.currentChildExecutionBasis.basisRef);
    let childScope = rehydrateOpenedTraversalScopeAtPrefix(prefix, input.currentChildTraversalScope);
    if (childExecutionBasis === null ||
        childScope === null ||
        !sameCanonical(childExecutionBasis, input.currentChildExecutionBasis) ||
        !sameCanonical(childScope, input.currentChildTraversalScope)) {
        return rehydrationFailure("current-child");
    }
    const inward = [];
    for (const [index, suspension] of input.suspensions.entries()) {
        const parentExecutionBasis = rehydrateExecutionBasisAtPrefix(prefix, suspension.parentExecutionBasisRef);
        const parentScope = rehydrateOpenedTraversalScopeAtPrefix(prefix, suspension.parentTraversalScope);
        const parentCCallRef = suspension.kind === "held_workflow_suspension"
            ? suspension.parentCCall.cCallRef
            : suspension.evaluatorCCall.cCallRef;
        const parentScopeClass = parentScope === null
            ? null
            : projectOpenedTraversalScopeClassAtPrefix(prefix, parentScope);
        const terminalMode = parentScopeClass === "root"
            ? "close_run"
            : "return_to_parent";
        if (parentExecutionBasis === null ||
            parentScope === null ||
            parentScopeClass === null ||
            suspension.childExecutionBasisRef !== childExecutionBasis.basisRef ||
            suspension.childTraversalScopeRef !== childScope.scopeRef ||
            childExecutionBasis.parentCCallRef !== parentCCallRef ||
            childExecutionBasis.parentExecutionBasisRef !==
                parentExecutionBasis.basisRef ||
            childExecutionBasis.parentTraversalScopeRef !== parentScope.scopeRef ||
            childScope.executionBasisRef !== childExecutionBasis.basisRef ||
            suspension.terminalMode !== terminalMode ||
            sha256Canonical(suspension.childInput) !== suspension.childInputDigest ||
            suspension.childInputDigest !== childExecutionBasis.rawInputDigest) {
            return rehydrationFailure("child-lineage");
        }
        const owner = projectCurrentChildParentCCallAtPrefix(prefix, {
            parentCCallRef,
            parentExecutionBasisRef: parentExecutionBasis.basisRef,
            runId: parentScope.runId,
            graphCallId: parentScope.graphCallId,
            frameId: parentScope.frameId,
            childGraphFunctionRef: childExecutionBasis.graphFunctionRef,
            admittedInputRef: childExecutionBasis.rawInputAdmissionRef,
            admittedInputDigest: childExecutionBasis.rawInputDigest,
        });
        if (owner?.cCallRef !== parentCCallRef ||
            (suspension.kind === "held_workflow_suspension"
                ? owner.disposition !== "workflow_open" ||
                    owner.resultRef !== null || owner.judgmentRef !== null
                : owner.disposition !== "deferred_application_ready" ||
                    owner.resultRef !== suspension.evaluatorResult.resultRef ||
                    owner.judgmentRef !== suspension.evaluatorJudgment.judgmentRef)) {
            return rehydrationFailure("parent-owner");
        }
        const frame = suspension.kind === "held_workflow_suspension"
            ? exactWorkflowReturn(input, prefix, suspension, parentExecutionBasis, parentScope, childExecutionBasis, childScope, terminalMode)
            : exactRecursionReturn(input, prefix, suspension, parentExecutionBasis, parentScope, childExecutionBasis, childScope, terminalMode);
        if (frame.kind === "parent_rehydration_refusal")
            return frame;
        inward.push(frame.value);
        childExecutionBasis = parentExecutionBasis;
        childScope = parentScope;
    }
    const returns = Object.freeze(inward.reverse());
    if (sha256Canonical(projectParentSuspensions(returns)) !== sha256Canonical(input.suspensions)) {
        return rehydrationFailure("outward-projection");
    }
    return Object.freeze({
        kind: "rehydrated_parent_return_frames",
        frames: returns,
    });
}
