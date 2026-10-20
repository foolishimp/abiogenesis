import { isRecord } from "../shared/admission_predicates.js";
import { COMPUTE_REGIME_VALUES, C_TERM_KIND_VALUES, cTermResultCardinality, } from "../gtl/c_algebra.js";
function diagnostic(code, path, message) {
    return { code, path, message };
}
function hasOnlyKeys(value, allowed, path, diagnostics) {
    for (const key of Object.keys(value)) {
        if (!allowed.includes(key)) {
            diagnostics.push(diagnostic("invalid_constructor", `${path}.${key}`, `C declaration carries unknown field ${key}`));
        }
    }
}
function nonEmptyString(value, path, diagnostics) {
    if (typeof value === "string" && value.length !== 0)
        return true;
    diagnostics.push(diagnostic("invalid_reference", path, "expected one non-empty reference"));
    return false;
}
function carrierPair(value, path, diagnostics) {
    return nonEmptyString(value.inputCarrierRef, `${path}.inputCarrierRef`, diagnostics) &&
        nonEmptyString(value.outputCarrierRef, `${path}.outputCarrierRef`, diagnostics);
}
function inspectExecutableRequirement(value, path, fibre, context, diagnostics) {
    if (!isRecord(value) || value.kind !== "executable_leaf_requirement") {
        diagnostics.push(diagnostic("invalid_leaf_requirement", path, `${fibre} requires one executable leaf requirement`));
        return false;
    }
    const keys = [
        "kind",
        "implementationBindingRef",
        "inputContractRef",
        "outputContractRef",
        "evidenceContractRef",
        "failureContractRef",
        "refusalContractRef",
        "judgmentContractRef",
    ];
    hasOnlyKeys(value, keys, path, diagnostics);
    let valid = true;
    for (const key of keys.slice(1)) {
        if (!nonEmptyString(value[key], `${path}.${key}`, diagnostics))
            valid = false;
    }
    if (!valid)
        return false;
    const requirement = value;
    const binding = context.bindingByRef.get(requirement.implementationBindingRef);
    if (binding === undefined) {
        diagnostics.push(diagnostic("missing_binding", `${path}.implementationBindingRef`, `missing implementation binding ${requirement.implementationBindingRef}`));
    }
    else if (binding.computeRegime !== fibre ||
        binding.inputContractRef !== requirement.inputContractRef ||
        binding.outputContractRef !== requirement.outputContractRef ||
        binding.failureContractRef !== requirement.failureContractRef ||
        binding.refusalContractRef !== requirement.refusalContractRef) {
        diagnostics.push(diagnostic("invalid_leaf_requirement", path, "executable requirement and implementation binding disagree"));
    }
    for (const contractRef of [
        requirement.inputContractRef,
        requirement.outputContractRef,
        requirement.evidenceContractRef,
        requirement.failureContractRef,
        requirement.refusalContractRef,
        requirement.judgmentContractRef,
    ]) {
        if (!context.contractRefs.has(contractRef)) {
            diagnostics.push(diagnostic("missing_contract", path, `missing executable leaf contract ${contractRef}`));
        }
    }
    return true;
}
function inspectInteractionRequirement(value, path, context, diagnostics) {
    if (!isRecord(value) || value.kind !== "interaction_leaf_requirement") {
        diagnostics.push(diagnostic("invalid_leaf_requirement", path, "F_H requires one interaction leaf requirement and no implementation binding"));
        return false;
    }
    const keys = [
        "kind",
        "interactionKind",
        "actorCapabilityRef",
        "requestContractRef",
        "responseContractRef",
        "continuationContractRef",
    ];
    hasOnlyKeys(value, keys, path, diagnostics);
    let valid = true;
    for (const key of keys.slice(1)) {
        if (!nonEmptyString(value[key], `${path}.${key}`, diagnostics))
            valid = false;
    }
    if (!valid)
        return false;
    const requirement = value;
    for (const contractRef of [
        requirement.requestContractRef,
        requirement.responseContractRef,
        requirement.continuationContractRef,
    ]) {
        if (!context.contractRefs.has(contractRef)) {
            diagnostics.push(diagnostic("missing_contract", path, `missing interaction leaf contract ${contractRef}`));
        }
    }
    return true;
}
function inspectLeaf(value, path, context, diagnostics) {
    hasOnlyKeys(value, [
        "kind",
        "inputCarrierRef",
        "outputCarrierRef",
        "programLocusRef",
        "stageRole",
        "fibre",
        "armId",
        "compositionRef",
        "vectorIndex",
        "judgmentPredicateRef",
        "resultBearing",
        "requirement",
    ], path, diagnostics);
    let valid = carrierPair(value, path, diagnostics);
    for (const key of ["programLocusRef", "stageRole", "armId", "judgmentPredicateRef"]) {
        if (!nonEmptyString(value[key], `${path}.${key}`, diagnostics))
            valid = false;
    }
    if (value.compositionRef !== null &&
        !nonEmptyString(value.compositionRef, `${path}.compositionRef`, diagnostics)) {
        valid = false;
    }
    if (!Number.isSafeInteger(value.vectorIndex) || value.vectorIndex < 0) {
        diagnostics.push(diagnostic("invalid_reference", `${path}.vectorIndex`, "C.of vectorIndex must be a non-negative safe integer"));
        valid = false;
    }
    if (typeof value.resultBearing !== "boolean") {
        diagnostics.push(diagnostic("invalid_result_cardinality", `${path}.resultBearing`, "C.of resultBearing must be boolean"));
        valid = false;
    }
    if (!COMPUTE_REGIME_VALUES.some((candidate) => candidate === value.fibre)) {
        diagnostics.push(diagnostic("invalid_fibre", `${path}.fibre`, "C.of fibre must be F_D, F_P, or F_H"));
        return null;
    }
    const fibre = value.fibre;
    const requirementValid = fibre === "F_H"
        ? inspectInteractionRequirement(value.requirement, `${path}.requirement`, context, diagnostics)
        : inspectExecutableRequirement(value.requirement, `${path}.requirement`, fibre, context, diagnostics);
    return valid && requirementValid ? value : null;
}
function inspectTerm(value, path, context, diagnostics) {
    if (!isRecord(value) || !C_TERM_KIND_VALUES.some((kind) => kind === value.kind)) {
        diagnostics.push(diagnostic("invalid_constructor", `${path}.kind`, "expected one of the seven C constructor discriminants"));
        return null;
    }
    switch (value.kind) {
        case "c_of":
            return inspectLeaf(value, path, context, diagnostics);
        case "c_identity": {
            hasOnlyKeys(value, ["kind", "inputCarrierRef", "outputCarrierRef"], path, diagnostics);
            if (!carrierPair(value, path, diagnostics))
                return null;
            if (value.inputCarrierRef !== value.outputCarrierRef) {
                diagnostics.push(diagnostic("carrier_mismatch", path, "C.id input and output carriers differ"));
                return null;
            }
            return value;
        }
        case "c_compose": {
            hasOnlyKeys(value, ["kind", "inputCarrierRef", "outputCarrierRef", "terms"], path, diagnostics);
            if (!carrierPair(value, path, diagnostics))
                return null;
            if (!Array.isArray(value.terms) || value.terms.length < 2) {
                diagnostics.push(diagnostic("invalid_constructor", `${path}.terms`, "canonical C.compose requires at least two non-identity flat terms"));
                return null;
            }
            const terms = value.terms.map((term, index) => inspectTerm(term, `${path}.terms[${index}]`, context, diagnostics));
            if (terms.some((term) => term === null))
                return null;
            const admittedTerms = terms;
            if (admittedTerms.some((term) => term.kind === "c_compose" || term.kind === "c_identity")) {
                diagnostics.push(diagnostic("invalid_constructor", `${path}.terms`, "C.compose must be canonically flat and contain no explicit identity term"));
            }
            if (value.inputCarrierRef !== admittedTerms[0]?.inputCarrierRef ||
                value.outputCarrierRef !== admittedTerms.at(-1)?.outputCarrierRef ||
                admittedTerms.slice(1).some((term, index) => admittedTerms[index]?.outputCarrierRef !== term.inputCarrierRef)) {
                diagnostics.push(diagnostic("carrier_mismatch", path, "C.compose terms do not form one continuous carrier chain"));
            }
            return value;
        }
        case "c_edge": {
            hasOnlyKeys(value, [
                "kind",
                "inputCarrierRef",
                "outputCarrierRef",
                "transform",
                "evaluate",
                "consequence",
            ], path, diagnostics);
            if (!carrierPair(value, path, diagnostics))
                return null;
            const roleTerms = ["transform", "evaluate", "consequence"].map((role) => [
                role,
                inspectTerm(value[role], `${path}.${role}`, context, diagnostics),
            ]);
            if (roleTerms.some(([, term]) => term === null))
                return null;
            for (const [role, term] of roleTerms) {
                if (term?.kind !== "c_of" || term.stageRole !== role) {
                    diagnostics.push(diagnostic("invalid_constructor", `${path}.${role}`, `C.edge ${role} must be a direct C.of leaf with the same role`));
                }
            }
            const [transform, evaluate, consequence] = roleTerms.map(([, term]) => term);
            if (value.inputCarrierRef !== transform?.inputCarrierRef ||
                transform?.outputCarrierRef !== evaluate?.inputCarrierRef ||
                evaluate?.outputCarrierRef !== consequence?.inputCarrierRef ||
                value.outputCarrierRef !== consequence?.outputCarrierRef) {
                diagnostics.push(diagnostic("carrier_mismatch", path, "C.edge carriers do not form transform -> evaluate -> consequence"));
            }
            return value;
        }
        case "c_workflow": {
            hasOnlyKeys(value, [
                "kind",
                "inputCarrierRef",
                "outputCarrierRef",
                "graphFunctionRef",
            ], path, diagnostics);
            const validCarrierPair = carrierPair(value, path, diagnostics);
            const validGraphFunctionRef = nonEmptyString(value.graphFunctionRef, `${path}.graphFunctionRef`, diagnostics);
            if (!validCarrierPair || !validGraphFunctionRef)
                return null;
            const graphFunctionRef = value.graphFunctionRef;
            if (!context.availableGraphFunctionRefs.has(graphFunctionRef) ||
                !context.callableGraphFunctionRefs.has(graphFunctionRef)) {
                diagnostics.push(diagnostic("invalid_reference", `${path}.graphFunctionRef`, `workflow.C GraphFunction ${graphFunctionRef} is not in the admitted Program root`));
            }
            return value;
        }
        case "c_batch": {
            hasOnlyKeys(value, [
                "kind",
                "inputCarrierRef",
                "outputCarrierRef",
                "taskInputCarrierRef",
                "taskOutputCarrierRef",
                "batchRef",
                "tasks",
            ], path, diagnostics);
            const valid = carrierPair(value, path, diagnostics) &&
                nonEmptyString(value.taskInputCarrierRef, `${path}.taskInputCarrierRef`, diagnostics) &&
                nonEmptyString(value.taskOutputCarrierRef, `${path}.taskOutputCarrierRef`, diagnostics) &&
                nonEmptyString(value.batchRef, `${path}.batchRef`, diagnostics);
            if (!Array.isArray(value.tasks) || value.tasks.length === 0) {
                diagnostics.push(diagnostic("invalid_result_cardinality", `${path}.tasks`, "C.batch requires one non-empty ordered task family"));
                return null;
            }
            const tasks = value.tasks.map((task, index) => inspectTerm(task, `${path}.tasks[${index}]`, context, diagnostics));
            if (!valid || tasks.some((task) => task === null))
                return null;
            const admittedTasks = tasks;
            const head = admittedTasks[0];
            if (admittedTasks.some((task) => task.inputCarrierRef !== value.taskInputCarrierRef ||
                task.outputCarrierRef !== value.taskOutputCarrierRef ||
                cTermResultCardinality(task) !== cTermResultCardinality(head))) {
                diagnostics.push(diagnostic("invalid_result_cardinality", path, "C.batch tasks must preserve the declared member carrier pair and equal per-task result cardinality"));
            }
            return value;
        }
        case "c_retry": {
            hasOnlyKeys(value, [
                "kind",
                "inputCarrierRef",
                "outputCarrierRef",
                "budget",
                "term",
            ], path, diagnostics);
            const valid = carrierPair(value, path, diagnostics);
            if (!Number.isSafeInteger(value.budget) || value.budget < 1) {
                diagnostics.push(diagnostic("invalid_constructor", `${path}.budget`, "C.retry budget must be a positive safe integer"));
            }
            const term = inspectTerm(value.term, `${path}.term`, context, diagnostics);
            if (!valid || term === null)
                return null;
            if (value.inputCarrierRef !== term.inputCarrierRef ||
                value.outputCarrierRef !== term.outputCarrierRef) {
                diagnostics.push(diagnostic("carrier_mismatch", path, "C.retry must preserve the wrapped term carrier pair"));
            }
            return value;
        }
    }
    return null;
}
export function inspectCProgramTerm(value, context) {
    const diagnostics = [];
    const term = inspectTerm(value, context.path, context, diagnostics);
    const expectedCardinality = context.expectedRootResultCardinality ?? "one";
    if (term !== null && expectedCardinality !== "consumed" && cTermResultCardinality(term) !== expectedCardinality) {
        diagnostics.push(diagnostic("invalid_result_cardinality", context.path, expectedCardinality === "one"
            ? "terminal compute-locus C term requires exactly one result-bearing path"
            : "non-terminal compute-locus C term must not declare a result-bearing path"));
    }
    return { term, diagnostics };
}
