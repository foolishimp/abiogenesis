import type { GraphFunction, GtlGraph } from "../gtl/contracts.js";
import {
  deriveMaterializedGraphShape,
  isMaterializedGtlGraph,
} from "../gtl/materialize.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  isProgramValidation,
  type ProgramValidation,
  type StaticValidationRefusal,
} from "./validation.js";

export interface GraphValidationBasis {
  readonly invocationAdmissionRef: string;
  readonly admittedInputRef: string;
  readonly admittedInputDigest: Sha256Digest;
  readonly admittedInput: Readonly<Record<string, JsonValue>>;
}

export interface GraphValidation {
  readonly kind: "graph_validation";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "valid";
  readonly validationRef: string;
  readonly validationDigest: Sha256Digest;
  readonly graphRef: string;
  readonly graphDigest: Sha256Digest;
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: Sha256Digest;
  readonly programValidationRef: string;
  readonly invocationAdmissionRef: string;
  readonly admittedInputRef: string;
  readonly admittedInputDigest: Sha256Digest;
  readonly diagnostics: readonly [];
}

export type GraphValidationResult = GraphValidation | StaticValidationRefusal;

const graphValidations = new WeakSet<object>();

export function isGraphValidation(value: object): boolean {
  return graphValidations.has(value);
}

function invalid(graphDigest: Sha256Digest, message: string): StaticValidationRefusal {
  return {
    kind: "static_validation_refusal",
    schemaVersion: "5.0.0",
    disposition: "invalid",
    stage: "graph",
    subjectDigest: graphDigest,
    diagnostics: [{ code: "topology_mismatch", path: "$", message }],
  };
}

export function validateGraph(
  graph: Readonly<GtlGraph>,
  programValidation: ProgramValidation,
  graphFunction: Readonly<GraphFunction>,
  basis: GraphValidationBasis,
): GraphValidationResult {
  if (!isMaterializedGtlGraph(graph) || !isProgramValidation(programValidation)) {
    return invalid(graph.materializationDigest, "Graph or ProgramValidation lacks package construction identity");
  }
  let expectedShape;
  try {
    expectedShape = deriveMaterializedGraphShape(graphFunction, basis);
  } catch (error) {
    return invalid(
      graph.materializationDigest,
      error instanceof Error
        ? error.message
        : "Graph materialization basis cannot reproduce the declared graph",
    );
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
  const graphFunctionDigest = sha256Canonical(graphFunction as unknown as JsonValue);
  if (
    graph.materializationDigest !== sha256Canonical(graphBody as unknown as JsonValue) ||
    graph.graphFunctionRef !== graphFunction.name ||
    graph.graphFunctionDigest !== graphFunctionDigest ||
    !programValidation.graphFunctionDigests.includes(graphFunctionDigest) ||
    graph.invocationAdmissionRef !== basis.invocationAdmissionRef ||
    graph.admittedInputRef !== basis.admittedInputRef ||
    graph.admittedInputDigest !== basis.admittedInputDigest ||
    canonicalJson(graph.fanOutMaterializations as unknown as JsonValue) !==
      canonicalJson(expectedShape.fanOutMaterializations as unknown as JsonValue) ||
    canonicalJson(graph.template as unknown as JsonValue) !==
      canonicalJson(expectedShape.template as unknown as JsonValue)
  ) {
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
  const validationDigest = sha256Canonical(body as unknown as JsonValue);
  const validation = deepFreeze({
    kind: "graph_validation" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "valid" as const,
    validationRef: `graph-validation://abiogenesis/${validationDigest.slice("sha256:".length)}`,
    validationDigest,
    ...body,
    diagnostics: [] as const,
  }) as GraphValidation;
  graphValidations.add(validation);
  return validation;
}
