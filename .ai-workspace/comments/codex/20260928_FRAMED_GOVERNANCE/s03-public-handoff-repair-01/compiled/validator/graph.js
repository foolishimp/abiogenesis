import { deriveMaterializedGraphShape, isMaterializedGtlGraph, } from "../gtl/materialize.js";
import { canonicalJson } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isProgramValidation, } from "./validation.js";
const graphValidations = new WeakSet();
export function isGraphValidation(value) {
    return graphValidations.has(value);
}
function invalid(graphDigest, message) {
    return {
        kind: "static_validation_refusal",
        schemaVersion: "5.0.0",
        disposition: "invalid",
        stage: "graph",
        subjectDigest: graphDigest,
        diagnostics: [{ code: "topology_mismatch", path: "$", message }],
    };
}
export function validateGraph(graph, programValidation, graphFunction, basis) {
    if (!isMaterializedGtlGraph(graph) || !isProgramValidation(programValidation)) {
        return invalid(graph.materializationDigest, "Graph or ProgramValidation lacks package construction identity");
    }
    let expectedShape;
    try {
        expectedShape = deriveMaterializedGraphShape(graphFunction, basis);
    }
    catch (error) {
        return invalid(graph.materializationDigest, error instanceof Error
            ? error.message
            : "Graph materialization basis cannot reproduce the declared graph");
    }
    const graphBody = {
        graphFunctionRef: graph.graphFunctionRef,
        graphFunctionDigest: graph.graphFunctionDigest,
        invocationAdmissionRef: graph.invocationAdmissionRef,
        admittedInputRef: graph.admittedInputRef,
        admittedInputDigest: graph.admittedInputDigest,
        fanOutMaterializations: graph.fanOutMaterializations,
        template: graph.template,
    };
    const graphFunctionDigest = sha256Canonical(graphFunction);
    if (graph.materializationDigest !== sha256Canonical(graphBody) ||
        graph.graphFunctionRef !== graphFunction.name ||
        graph.graphFunctionDigest !== graphFunctionDigest ||
        !programValidation.graphFunctionDigests.includes(graphFunctionDigest) ||
        graph.invocationAdmissionRef !== basis.invocationAdmissionRef ||
        graph.admittedInputRef !== basis.admittedInputRef ||
        graph.admittedInputDigest !== basis.admittedInputDigest ||
        canonicalJson(graph.fanOutMaterializations) !==
            canonicalJson(expectedShape.fanOutMaterializations) ||
        canonicalJson(graph.template) !==
            canonicalJson(expectedShape.template)) {
        return invalid(graph.materializationDigest, "materialized Graph does not preserve exact function, topology, input, and invocation basis");
    }
    const body = {
        graphRef: graph.materializationRef,
        graphDigest: graph.materializationDigest,
        graphFunctionRef: graph.graphFunctionRef,
        graphFunctionDigest: graph.graphFunctionDigest,
        programValidationRef: programValidation.validationRef,
        invocationAdmissionRef: graph.invocationAdmissionRef,
        admittedInputRef: graph.admittedInputRef,
        admittedInputDigest: graph.admittedInputDigest,
    };
    const validationDigest = sha256Canonical(body);
    const validation = deepFreeze({
        kind: "graph_validation",
        schemaVersion: "5.0.0",
        disposition: "valid",
        validationRef: `graph-validation://abiogenesis/${validationDigest.slice("sha256:".length)}`,
        validationDigest,
        ...body,
        diagnostics: [],
    });
    graphValidations.add(validation);
    return validation;
}
