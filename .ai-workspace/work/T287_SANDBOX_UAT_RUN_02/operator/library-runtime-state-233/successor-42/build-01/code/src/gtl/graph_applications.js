import { isGraphInputRetentionContractRelation } from "../product/worksite_preparation_contracts.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { requireRef } from "../shared/references.js";
function requireRefs(values, label) {
    if (values.length === 0 || values.some((value) => value.trim().length === 0)) {
        throw new TypeError(`${label} must contain at least one non-empty reference`);
    }
    return values;
}
function validateBase(input) {
    requireRef(input.inputContractRef, "inputContractRef");
    requireRef(input.outputContractRef, "outputContractRef");
}
export function graphEdge(input) {
    requireRef(input.fromNodeRef, "fromNodeRef");
    requireRef(input.toNodeRef, "toNodeRef");
    if (input.inputBinding !== undefined && !isGraphInputRetentionContractRelation(input.inputBinding)) {
        throw new TypeError("graph edge retention requires the exact ABI-owned E/S/T schema relation");
    }
    return deepFreeze({
        edgeRef: graphEdgeRef(input),
        ...input,
    });
}
export function graphEdgeRef(input) {
    const digest = sha256Canonical({
        fromNodeRef: input.fromNodeRef,
        toNodeRef: input.toNodeRef,
        ...(input.inputBinding === undefined ? {} : { inputBinding: input.inputBinding }),
    });
    return `graph-vector://abiogenesis/${digest.slice("sha256:".length)}`;
}
function constructApplication(relationKind, input) {
    validateBase(input);
    const body = {
        kind: "graph_function_application",
        relationKind,
        ...input,
    };
    const digest = sha256Canonical(body);
    return deepFreeze({
        ...body,
        applicationRef: `graph-function-application://abiogenesis/${digest.slice("sha256:".length)}`,
    });
}
export function graphFunctionApplicationRef(application) {
    const { applicationRef: _applicationRef, ...body } = application;
    const digest = sha256Canonical(body);
    return `graph-function-application://abiogenesis/${digest.slice("sha256:".length)}`;
}
export function foldbackRef(foldback) {
    const digest = sha256Canonical(foldback);
    return `foldback://abiogenesis/${digest.slice("sha256:".length)}`;
}
export function composeApplication(input) {
    requireRef(input.leftGraphFunctionRef, "leftGraphFunctionRef");
    requireRef(input.rightGraphFunctionRef, "rightGraphFunctionRef");
    return constructApplication("compose", input);
}
export function substituteApplication(input) {
    requireRef(input.outerGraphFunctionRef, "outerGraphFunctionRef");
    requireRef(input.targetVectorRef, "targetVectorRef");
    requireRef(input.innerGraphFunctionRef, "innerGraphFunctionRef");
    return constructApplication("substitute", input);
}
export function recurseApplication(input) {
    requireRef(input.graphFunctionRef, "graphFunctionRef");
    requireRef(input.terminationRuleRef, "terminationRuleRef");
    requireRefs(input.terminationEvaluatorRefs, "terminationEvaluatorRefs");
    if (!/^\$\.[A-Za-z_][A-Za-z0-9_.]*$/u.test(input.terminationFieldRef)) {
        throw new TypeError("terminationFieldRef must be one declared JSON field path");
    }
    if (!Number.isSafeInteger(input.bound) || input.bound < 1) {
        throw new TypeError("bound must be one positive safe integer");
    }
    if (input.foldback.mode !== "rebind" ||
        input.foldback.binding.trim().length === 0 ||
        input.foldback.requiresParentEvaluation !== true) {
        throw new TypeError("foldback must declare rebind mode, one binding, and parent re-evaluation");
    }
    const canonicalFoldback = deepFreeze({ ...input.foldback });
    return constructApplication("recurse", {
        ...input,
        terminationEvaluatorRefs: [...input.terminationEvaluatorRefs],
        foldbackRef: foldbackRef(canonicalFoldback),
        foldback: canonicalFoldback,
    });
}
export function recursionTerminationDecision(application, value) {
    if (application.relationKind !== "recurse" ||
        !/^\$\.[A-Za-z_][A-Za-z0-9_.]*$/u.test(application.terminationFieldRef)) {
        return null;
    }
    let current = value;
    for (const segment of application.terminationFieldRef.slice(2).split(".")) {
        if (typeof current !== "object" ||
            current === null ||
            Array.isArray(current) ||
            !Object.hasOwn(current, segment)) {
            return null;
        }
        current = current[segment];
    }
    return typeof current === "boolean" ? current : null;
}
export function fanOutApplication(input) {
    requireRef(input.batchRef, "batchRef");
    requireRef(input.elementGraphFunctionRef, "elementGraphFunctionRef");
    requireRef(input.inputVectorRef, "inputVectorRef");
    requireRef(input.outputVectorRef, "outputVectorRef");
    requireRef(input.inputMemberContractRef, "inputMemberContractRef");
    requireRef(input.outputMemberContractRef, "outputMemberContractRef");
    if (input.inputContractRef !== input.inputVectorRef ||
        input.outputContractRef !== input.outputVectorRef) {
        throw new TypeError("fan-out outer contracts must equal the declared input and output vectors");
    }
    return constructApplication("fan_out", input);
}
export function fanInApplication(input) {
    requireRef(input.reducerGraphFunctionRef, "reducerGraphFunctionRef");
    requireRef(input.inputVectorRef, "inputVectorRef");
    if (input.inputContractRef !== input.inputVectorRef) {
        throw new TypeError("fan-in outer input contract must equal the declared input vector");
    }
    return constructApplication("fan_in", input);
}
export function gateApplication(input) {
    requireRef(input.targetRef, "targetRef");
    requireRef(input.ruleRef, "ruleRef");
    requireRefs(input.evaluatorRefs, "evaluatorRefs");
    return constructApplication("gate", {
        ...input,
        evaluatorRefs: [...input.evaluatorRefs],
    });
}
export function reenterApplication(input) {
    requireRef(input.graphFunctionRef, "graphFunctionRef");
    requireRef(input.sourceProgramLocusRef, "sourceProgramLocusRef");
    requireRef(input.targetProgramLocusRef, "targetProgramLocusRef");
    if (input.sourceProgramLocusRef === input.targetProgramLocusRef ||
        !Number.isSafeInteger(input.maxApplications) ||
        input.maxApplications < 1) {
        throw new TypeError("re-enter requires distinct source and target loci and one positive application bound");
    }
    return constructApplication("re_enter", input);
}
export function promoteApplication(input) {
    requireRef(input.sourceRef, "sourceRef");
    requireRef(input.targetRef, "targetRef");
    if (input.sourceRef !== input.inputContractRef ||
        input.targetRef !== input.outputContractRef) {
        throw new TypeError("promote source and target must bind the declared outer contracts");
    }
    return constructApplication("promote", input);
}
export function identityApplication(input) {
    requireRef(input.targetRef, "targetRef");
    if (input.inputContractRef !== input.outputContractRef) {
        throw new TypeError("identity must preserve one exact interface");
    }
    return constructApplication("identity", input);
}
export function sameObjectApplication(input) {
    requireRef(input.leftRef, "leftRef");
    requireRef(input.rightRef, "rightRef");
    if (input.leftRef !== input.rightRef) {
        throw new TypeError("same-object requires one exact opaque identity");
    }
    return constructApplication("same_object", {
        ...input,
        witnessRef: sameObjectWitnessRef(input.leftRef),
    });
}
export function sameObjectWitnessRef(objectRef) {
    requireRef(objectRef, "objectRef");
    const digest = sha256Canonical({ objectRef });
    return `identity-witness://abiogenesis/${digest.slice("sha256:".length)}`;
}
export function registeredSelectionApplication(input) {
    requireRef(input.sourceProgramLocusRef, "sourceProgramLocusRef");
    requireRef(input.evaluatorRef, "evaluatorRef");
    requireRef(input.ruleRef, "ruleRef");
    return constructApplication("registered_selection", input);
}
