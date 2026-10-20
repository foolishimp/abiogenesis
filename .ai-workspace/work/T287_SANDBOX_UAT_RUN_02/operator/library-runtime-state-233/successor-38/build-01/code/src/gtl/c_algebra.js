import { deepFreeze } from "../shared/immutable.js";
import { requireRef } from "../shared/references.js";
export const COMPUTE_REGIME_VALUES = ["F_D", "F_P", "F_H"];
export const C_TERM_KIND_VALUES = [
    "c_of",
    "c_identity",
    "c_compose",
    "c_edge",
    "c_workflow",
    "c_batch",
    "c_retry",
];
const C_CARRIER_TYPE = Symbol("abiogenesis.gtl.c.carrier");
const C_TERM_TYPE = Symbol("abiogenesis.gtl.c.term");
const nativeTerms = new WeakSet();
function assertCarrier(value, label) {
    if (!Object.hasOwn(value, C_CARRIER_TYPE)) {
        throw new TypeError(`${label} must be created by cCarrier`);
    }
}
function assertTerm(value, label) {
    if (!nativeTerms.has(value)) {
        throw new TypeError(`${label} must be created by a C constructor`);
    }
}
function witness() {
    return Object.freeze({});
}
function freezeTerm(term, termWitness) {
    assertCProgramLocalRelations(term);
    Object.defineProperty(term, C_TERM_TYPE, {
        configurable: false,
        enumerable: false,
        value: termWitness,
        writable: false,
    });
    const frozen = deepFreeze(term);
    nativeTerms.add(frozen);
    return frozen;
}
function combineCardinality(left, right) {
    if (left === "many" || right === "many")
        return "many";
    if (left === "zero")
        return right;
    if (right === "zero")
        return left;
    return "many";
}
export function cTermResultCardinality(term) {
    switch (term.kind) {
        case "c_of":
            return term.resultBearing ? "one" : "zero";
        case "c_identity":
            return "zero";
        case "c_compose":
            return term.terms.reduce((cardinality, child) => combineCardinality(cardinality, cTermResultCardinality(child)), "zero");
        case "c_edge":
            return [term.transform, term.evaluate, term.consequence].reduce((cardinality, child) => combineCardinality(cardinality, cTermResultCardinality(child)), "zero");
        case "c_workflow":
            return "one";
        case "c_batch":
            if (term.inputCarrierRef !== term.taskInputCarrierRef ||
                term.outputCarrierRef !== term.taskOutputCarrierRef) {
                return "zero";
            }
            return term.tasks[0] === undefined ? "zero" : cTermResultCardinality(term.tasks[0]);
        case "c_retry":
            return cTermResultCardinality(term.term);
    }
}
export function cLeafTerms(term) {
    switch (term.kind) {
        case "c_of":
            return [term];
        case "c_identity":
        case "c_workflow":
            return [];
        case "c_compose":
            return term.terms.flatMap((child) => cLeafTerms(child));
        case "c_edge":
            return [term.transform, term.evaluate, term.consequence];
        case "c_batch":
            return term.tasks.flatMap((child) => cLeafTerms(child));
        case "c_retry":
            return cLeafTerms(term.term);
    }
}
export function isExecutableCLeaf(term) {
    return term.kind === "c_of" &&
        term.fibre !== "F_H" &&
        term.requirement.kind === "executable_leaf_requirement";
}
export function isInteractionCLeaf(term) {
    return term.kind === "c_of" &&
        term.fibre === "F_H" &&
        term.requirement.kind === "interaction_leaf_requirement";
}
export function isNativeCProgramTerm(term) {
    return nativeTerms.has(term);
}
/** Constructor-local laws shared by native construction and erased syntax.
 * Declaration membership and Program result obligations belong to validateProgram. */
export function assertCProgramLocalRelations(term, path = "$") {
    const require = (condition, suffix, message) => {
        if (!condition)
            throw new TypeError(`${path}${suffix}: ${message}`);
    };
    switch (term.kind) {
        case "c_of":
            require((term.fibre === "F_H") === (term.requirement.kind === "interaction_leaf_requirement"), "/requirement/kind", "C.of requirement kind must match its compute regime");
            break;
        case "c_identity":
            require(term.inputCarrierRef === term.outputCarrierRef, "/outputCarrierRef", "C.id must retain its carrier");
            break;
        case "c_compose":
            term.terms.forEach((child, index) => {
                require(child.kind !== "c_compose" && child.kind !== "c_identity", `/terms/${index}`, "canonical C.compose contains flat non-identity terms");
                assertCProgramLocalRelations(child, `${path}/terms/${index}`);
                if (index > 0)
                    require(term.terms[index - 1].outputCarrierRef === child.inputCarrierRef, `/terms/${index}/inputCarrierRef`, "C.compose carrier chain is discontinuous");
            });
            require(term.terms.length >= 2, "/terms", "C.compose requires at least two terms");
            require(term.inputCarrierRef === term.terms[0].inputCarrierRef, "/inputCarrierRef", "C.compose input differs from its first term");
            require(term.outputCarrierRef === term.terms.at(-1).outputCarrierRef, "/outputCarrierRef", "C.compose output differs from its final term");
            break;
        case "c_edge":
            for (const role of ["transform", "evaluate", "consequence"]) {
                require(term[role].stageRole === role, `/${role}/stageRole`, "C.edge leaf must retain its declared role");
                assertCProgramLocalRelations(term[role], `${path}/${role}`);
            }
            require(term.inputCarrierRef === term.transform.inputCarrierRef, "/inputCarrierRef", "C.edge input differs from transform input");
            require(term.transform.outputCarrierRef === term.evaluate.inputCarrierRef, "/evaluate/inputCarrierRef", "C.edge transform/evaluate carriers differ");
            require(term.evaluate.outputCarrierRef === term.consequence.inputCarrierRef, "/consequence/inputCarrierRef", "C.edge evaluate/consequence carriers differ");
            require(term.outputCarrierRef === term.consequence.outputCarrierRef, "/outputCarrierRef", "C.edge output differs from consequence output");
            break;
        case "c_workflow":
            break;
        case "c_batch":
            require(term.tasks.length > 0, "/tasks", "C.batch requires a non-empty ordered task family");
            term.tasks.forEach((child, index) => {
                assertCProgramLocalRelations(child, `${path}/tasks/${index}`);
                require(child.inputCarrierRef === term.taskInputCarrierRef && child.outputCarrierRef === term.taskOutputCarrierRef, `/tasks/${index}`, "C.batch task carrier pair differs from its declared pair");
                require(cTermResultCardinality(child) === cTermResultCardinality(term.tasks[0]), `/tasks/${index}`, "C.batch tasks have different result cardinality");
            });
            break;
        case "c_retry":
            assertCProgramLocalRelations(term.term, `${path}/term`);
            require(term.inputCarrierRef === term.term.inputCarrierRef && term.outputCarrierRef === term.term.outputCarrierRef, "/term", "C.retry must preserve the wrapped carrier pair");
            break;
    }
}
/** Erase only this owner's verified non-data term witness. Preserve every other
 * descriptor so I-JSON admission can refuse unknown symbols/accessors/metadata. */
export function eraseNativeCProofMetadata(value) {
    const ancestors = new WeakSet();
    const visit = (input) => {
        if (input === null || typeof input !== "object")
            return input;
        if (ancestors.has(input))
            throw new TypeError("cyclic authored data is not I-JSON");
        const prototype = Object.getPrototypeOf(input);
        if (prototype !== Object.prototype && prototype !== null && prototype !== Array.prototype)
            return input;
        ancestors.add(input);
        const output = Array.isArray(input) ? [] : Object.create(prototype);
        for (const key of Reflect.ownKeys(input)) {
            if (key === C_TERM_TYPE && nativeTerms.has(input))
                continue;
            const descriptor = Object.getOwnPropertyDescriptor(input, key);
            Object.defineProperty(output, key, Object.hasOwn(descriptor, "value")
                ? { ...descriptor, value: visit(descriptor.value) }
                : descriptor);
        }
        ancestors.delete(input);
        return output;
    };
    return visit(value);
}
export function cCarrier(ref) {
    const carrier = {
        kind: "c_carrier",
        ref: requireRef(ref, "C carrier ref"),
        [C_CARRIER_TYPE]: (value) => value,
    };
    Object.defineProperty(carrier, C_CARRIER_TYPE, { enumerable: false });
    return Object.freeze(carrier);
}
export function cGraphFunctionRef(input) {
    assertCarrier(input.input, "GraphFunction input carrier");
    assertCarrier(input.output, "GraphFunction output carrier");
    return Object.freeze({
        kind: "c_graph_function_ref",
        graphFunctionRef: requireRef(input.graphFunctionRef, "GraphFunction ref"),
        inputCarrierRef: input.input.ref,
        outputCarrierRef: input.output.ref,
        input: input.input,
        output: input.output,
    });
}
export function cOf(input) {
    assertCarrier(input.input, "C.of input");
    assertCarrier(input.output, "C.of output");
    if (!COMPUTE_REGIME_VALUES.includes(input.fibre)) {
        throw new TypeError(`C.of fibre must be one of ${COMPUTE_REGIME_VALUES.join(", ")}`);
    }
    if ((input.fibre === "F_H" && input.requirement.kind !== "interaction_leaf_requirement") ||
        (input.fibre !== "F_H" && input.requirement.kind !== "executable_leaf_requirement")) {
        throw new TypeError("C.of requirement kind must match its compute regime");
    }
    if (!Number.isSafeInteger(input.vectorIndex) || input.vectorIndex < 0) {
        throw new TypeError("C.of vectorIndex must be a non-negative safe integer");
    }
    const node = {
        kind: "c_of",
        inputCarrierRef: input.input.ref,
        outputCarrierRef: input.output.ref,
        programLocusRef: requireRef(input.programLocusRef, "C.of programLocusRef"),
        stageRole: requireRef(input.stageRole, "C.of stageRole"),
        fibre: input.fibre,
        armId: requireRef(input.armId, "C.of armId"),
        compositionRef: input.compositionRef === null
            ? null
            : requireRef(input.compositionRef, "C.of compositionRef"),
        vectorIndex: input.vectorIndex,
        judgmentPredicateRef: requireRef(input.judgmentPredicateRef, "C.of judgmentPredicateRef"),
        resultBearing: input.resultBearing,
        requirement: input.requirement,
    };
    return freezeTerm(node, witness());
}
export function cIdentity(carrier) {
    assertCarrier(carrier, "C.id carrier");
    return freezeTerm({
        kind: "c_identity",
        inputCarrierRef: carrier.ref,
        outputCarrierRef: carrier.ref,
    }, witness());
}
function flattenedComposition(term) {
    if (term.kind === "c_identity")
        return [];
    if (term.kind === "c_compose")
        return term.terms;
    return [term];
}
export function cCompose(left, right) {
    assertTerm(left, "C.compose left");
    assertTerm(right, "C.compose right");
    if (left.outputCarrierRef !== right.inputCarrierRef) {
        throw new TypeError(`C.compose carrier mismatch: ${left.outputCarrierRef} != ${right.inputCarrierRef}`);
    }
    const terms = [...flattenedComposition(left), ...flattenedComposition(right)];
    if (terms.length === 0) {
        return cIdentity(cCarrier(left.inputCarrierRef));
    }
    if (terms.length === 1) {
        return terms[0];
    }
    return freezeTerm({
        kind: "c_compose",
        inputCarrierRef: left.inputCarrierRef,
        outputCarrierRef: right.outputCarrierRef,
        terms,
    }, witness());
}
export function cEdge(input) {
    for (const [role, term] of Object.entries(input)) {
        assertTerm(term, `C.edge ${role}`);
        if (term.kind !== "c_of" || term.stageRole !== role) {
            throw new TypeError(`C.edge ${role} must be one C.of leaf with stageRole ${role}`);
        }
    }
    if (input.transform.outputCarrierRef !== input.evaluate.inputCarrierRef) {
        throw new TypeError("C.edge transform output must match evaluate input");
    }
    if (input.evaluate.outputCarrierRef !== input.consequence.inputCarrierRef) {
        throw new TypeError("C.edge evaluate output must match consequence input");
    }
    return freezeTerm({
        kind: "c_edge",
        inputCarrierRef: input.transform.inputCarrierRef,
        outputCarrierRef: input.consequence.outputCarrierRef,
        transform: input.transform,
        evaluate: input.evaluate,
        consequence: input.consequence,
    }, witness());
}
export function cWorkflow(graphFunction) {
    assertCarrier(graphFunction.input, "workflow.C input carrier");
    assertCarrier(graphFunction.output, "workflow.C output carrier");
    return freezeTerm({
        kind: "c_workflow",
        inputCarrierRef: graphFunction.inputCarrierRef,
        outputCarrierRef: graphFunction.outputCarrierRef,
        graphFunctionRef: requireRef(graphFunction.graphFunctionRef, "workflow.C GraphFunction ref"),
    }, witness());
}
export function cBatch(tasks, batchRef, outerCarriers) {
    if (tasks.length === 0)
        throw new TypeError("C.batch tasks must be non-empty");
    const head = tasks[0];
    assertTerm(head, "C.batch tasks[0]");
    if (outerCarriers !== undefined) {
        assertCarrier(outerCarriers.input, "C.batch outer input carrier");
        assertCarrier(outerCarriers.output, "C.batch outer output carrier");
    }
    const headCardinality = cTermResultCardinality(head);
    for (const [index, task] of tasks.entries()) {
        assertTerm(task, `C.batch tasks[${index}]`);
        if (task.inputCarrierRef !== head.inputCarrierRef ||
            task.outputCarrierRef !== head.outputCarrierRef) {
            throw new TypeError(`C.batch tasks[${index}] has a different carrier pair`);
        }
        if (cTermResultCardinality(task) !== headCardinality) {
            throw new TypeError(`C.batch tasks[${index}] has a different result cardinality`);
        }
    }
    return freezeTerm({
        kind: "c_batch",
        inputCarrierRef: outerCarriers?.input.ref ?? head.inputCarrierRef,
        outputCarrierRef: outerCarriers?.output.ref ?? head.outputCarrierRef,
        taskInputCarrierRef: head.inputCarrierRef,
        taskOutputCarrierRef: head.outputCarrierRef,
        batchRef: requireRef(batchRef, "C.batch batchRef"),
        tasks: [...tasks],
    }, witness());
}
export function cRetry(term, budget) {
    assertTerm(term, "C.retry term");
    if (!Number.isSafeInteger(budget) || budget < 1) {
        throw new TypeError("C.retry budget must be a positive safe integer");
    }
    return freezeTerm({
        kind: "c_retry",
        inputCarrierRef: term.inputCarrierRef,
        outputCarrierRef: term.outputCarrierRef,
        budget,
        term,
    }, witness());
}
export const C = Object.freeze({
    of: cOf,
    id: cIdentity,
    compose: cCompose,
    edge: cEdge,
    batch: cBatch,
    retry: cRetry,
});
export const workflow = Object.freeze({ C: cWorkflow });
