import { prepareWorkflowChildExecutionBasis } from "../abg/execution_basis.js";
import { admitChildExecutionBasis, openTraversalScope, } from "../abg/index.js";
import { materializeGraph, } from "../gtl/index.js";
import { deepFreeze } from "../shared/immutable.js";
import { validateGraph, } from "../validator/index.js";
export function constructChildTraversalBasis(input) {
    return deepFreeze({
        kind: "child_traversal_basis",
        schemaVersion: "5.0.0",
        ...input,
    });
}
function refusal(stage, diagnosticRef, message, successorPrefix) {
    return deepFreeze({
        kind: "child_traversal_preparation_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        stage,
        diagnosticRef,
        message,
        successorPrefix,
    });
}
/**
 * Exact synchronous owner composition for one child traversal. The immutable
 * basis supplies installed definition data; GTL, Validator, and ABG retain
 * their existing semantic and admission authority.
 */
export function prepareChildTraversal(store, basis, request) {
    return prepareChildTraversalWithAdmission(store, basis, request, admitChildExecutionBasis);
}
export function prepareWorkflowChildTraversalAtCursor(store, basis, predecessorPrefix, cursor) {
    const preparation = prepareWorkflowChildExecutionBasis(store, predecessorPrefix, cursor, basis);
    return Object.freeze({ intent: preparation.intent, prepare(request) {
            return request.predecessorPrefix === predecessorPrefix
                ? prepareChildTraversalWithAdmission(store, basis, request, (_store, _prefix, input, admissionBasis) => preparation.admit(input, admissionBasis))
                : prepareChildTraversal(store, basis, request);
        } });
}
function prepareChildTraversalWithAdmission(store, basis, request, admitBasis) {
    if (basis.kind !== "child_traversal_basis" ||
        basis.schemaVersion !== "5.0.0" ||
        request.parentExecutionBasis.programRef !== basis.program.programRef ||
        request.parentExecutionBasis.programValidationRef !==
            basis.programValidation.validationRef ||
        request.parentTraversalScope.executionBasisRef !==
            request.parentExecutionBasis.basisRef ||
        !basis.program.callableMembership.includes(request.childGraphFunctionRef)) {
        return refusal("membership", "diagnostic://abiogenesis/child-traversal/program-membership-mismatch@5", "child traversal request differs from the installed admitted Program root", request.predecessorPrefix);
    }
    const graphFunction = basis.graphFunctionByRef(request.childGraphFunctionRef);
    if (graphFunction === null) {
        return refusal("membership", "diagnostic://abiogenesis/child-traversal/graph-function-absent@5", "declared child GraphFunction is absent from the installed publication", request.predecessorPrefix);
    }
    const closureContractRef = graphFunction.declarations["abg.child_closure_contract"];
    const closureContract = closureContractRef === undefined
        ? null
        : basis.closureContractByRef(closureContractRef);
    if (closureContract === null) {
        return refusal("membership", "diagnostic://abiogenesis/child-traversal/closure-contract-absent@5", "declared child closure contract is absent from the installed publication", request.predecessorPrefix);
    }
    const graph = materializeGraph(graphFunction, {
        invocationAdmissionRef: request.parentExecutionBasis.invocationAdmissionRef,
        admittedInputRef: request.inputRef,
        admittedInputDigest: request.inputDigest,
        admittedInput: request.input,
    });
    const graphValidation = validateGraph(graph, basis.programValidation, graphFunction, {
        invocationAdmissionRef: request.parentExecutionBasis.invocationAdmissionRef,
        admittedInputRef: request.inputRef,
        admittedInputDigest: request.inputDigest,
        admittedInput: request.input,
    });
    if (graphValidation.kind !== "graph_validation") {
        return refusal("graph_validation", `diagnostic://abiogenesis/child-traversal/${graphValidation.diagnostics[0]?.code ?? "invalid-graph"}@5`, "child Graph failed exact non-lowering validation", request.predecessorPrefix);
    }
    const childBasis = admitBasis(store, request.predecessorPrefix, {
        parentExecutionBasis: request.parentExecutionBasis,
        parentTraversalScope: request.parentTraversalScope,
        parentCCallRef: request.parentCCallRef,
        program: basis.program,
        ...(basis.programPublication === undefined ? {} : { programPublication: basis.programPublication }),
        programValidation: basis.programValidation,
        graphFunction,
        graph,
        graphValidation,
        rootImplementationSet: basis.rootImplementationSet,
        rootInteractionSet: basis.rootInteractionSet,
        closureContract,
        admittedInputRef: request.inputRef,
        admittedInputDigest: request.inputDigest,
        rawInputValue: request.input,
    }, {
        eventTime: request.eventTime,
        correlationId: `${request.correlationId}/basis`,
        causationEventRefs: [],
    });
    if (childBasis.kind !== "child_execution_basis_admission") {
        return refusal("basis_admission", `diagnostic://abiogenesis/child-traversal/${childBasis.code}@5`, childBasis.message, request.predecessorPrefix);
    }
    const opened = openTraversalScope(store, childBasis.successorPrefix, {
        kind: "child",
        executionBasis: childBasis.executionBasis,
        parentScope: request.parentTraversalScope,
    }, {
        eventTime: request.eventTime,
        correlationId: `${request.correlationId}/open`,
        causationEventRefs: [],
    });
    if (opened.kind !== "traversal_scope_open_admission") {
        return refusal("scope_open", `diagnostic://abiogenesis/child-traversal/${opened.code}@5`, opened.message, childBasis.successorPrefix);
    }
    return deepFreeze({
        kind: "prepared_child_traversal",
        schemaVersion: "5.0.0",
        disposition: "prepared",
        program: basis.program,
        programValidation: basis.programValidation,
        graphFunction,
        graph,
        graphValidation,
        executionBasis: childBasis.executionBasis,
        openedTraversalScope: opened.scope,
        implementationSet: basis.rootImplementationSet,
        interactionSet: basis.rootInteractionSet,
        closureContract,
        inputRef: request.inputRef,
        inputDigest: request.inputDigest,
        input: request.input,
        successorPrefix: opened.successorPrefix,
    });
}
