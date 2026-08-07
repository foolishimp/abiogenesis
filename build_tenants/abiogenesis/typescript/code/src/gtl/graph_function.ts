import { type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { requireRef } from "../shared/references.js";
import type { GraphFunction } from "./contracts.js";
import { serializeGraphFunction } from "./serialization.js";

export type GraphFunctionInit = Omit<GraphFunction, "id" | "kind" | "version"> & {
  readonly id?: string;
};

export function resolveGraphFunctionId(input: {
  readonly id?: string;
  readonly name: string;
  readonly canonicalBasis: unknown;
}): string {
  const name = requireRef(input.name, "GraphFunction name");
  const id = input.id === undefined
    ? `graph-function://abiogenesis/canonical/${sha256Canonical(
      input.canonicalBasis as JsonValue,
    ).slice("sha256:".length)}`
    : requireRef(input.id, "GraphFunction id");
  if (id === name) {
    throw new TypeError("GraphFunction id must be distinct from its human-readable name");
  }
  return id;
}

export function constructGraphFunction(
  input: GraphFunctionInit,
): Readonly<GraphFunction> {
  const name = requireRef(input.name, "GraphFunction name");
  const provisional = {
    kind: "graph_function",
    id: "graph-function://abiogenesis/canonical-basis",
    name,
    version: "5.0.0",
    environment: input.environment,
    inputs: input.inputs,
    outputs: input.outputs,
    template: input.template,
    effects: input.effects,
    declarations: input.declarations,
    tags: input.tags,
  } as const;
  const { id: _provisionalId, ...canonicalBasis } =
    serializeGraphFunction(provisional);
  const id = resolveGraphFunctionId({
    ...(input.id === undefined ? {} : { id: input.id }),
    name,
    canonicalBasis,
  });
  return serializeGraphFunction({
    kind: "graph_function",
    id,
    name,
    version: "5.0.0",
    environment: {
      requires: input.environment.requires,
      provides: input.environment.provides,
      carries: input.environment.carries,
    },
    inputs: input.inputs,
    outputs: input.outputs,
    template: input.template,
    effects: input.effects,
    declarations: input.declarations,
    tags: input.tags,
  });
}

export function hasCanonicalGraphFunctionId(
  graphFunction: Readonly<GraphFunction>,
): boolean {
  const prefix = "graph-function://abiogenesis/canonical/";
  if (!graphFunction.id.startsWith(prefix)) return true;

  const bases: unknown[] = [{
    kind: "graph_function",
    name: graphFunction.name,
    version: "5.0.0",
    environment: graphFunction.environment,
    inputs: graphFunction.inputs,
    outputs: graphFunction.outputs,
    template: graphFunction.template,
    effects: graphFunction.effects,
    declarations: graphFunction.declarations,
    tags: graphFunction.tags,
  }];
  for (const application of graphFunction.template.applications) {
    switch (application.relationKind) {
      case "identity":
        if (
          application.targetRef === graphFunction.id &&
          graphFunction.inputs.length === 1 &&
          graphFunction.inputs[0] === graphFunction.outputs[0]
        ) {
          bases.push({
            relationKind: "identity",
            name: graphFunction.name,
            contractRef: graphFunction.inputs[0],
          });
        }
        break;
      case "compose":
        bases.push({
          relationKind: "compose",
          name: graphFunction.name,
          leftGraphFunctionId: application.leftGraphFunctionRef,
          rightGraphFunctionId: application.rightGraphFunctionRef,
          applicationRef: application.applicationRef,
        });
        break;
      case "substitute":
        bases.push({
          relationKind: "substitute",
          name: graphFunction.name,
          outerGraphFunctionId: application.outerGraphFunctionRef,
          targetVectorRef: application.targetVectorRef,
          innerGraphFunctionId: application.innerGraphFunctionRef,
          applicationRef: application.applicationRef,
        });
        break;
      case "promote":
        bases.push({
          relationKind: "promote",
          name: graphFunction.name,
          sourceRef: application.sourceRef,
          targetRef: application.targetRef,
          applicationRef: application.applicationRef,
        });
        break;
      case "recurse":
      case "fan_out":
      case "fan_in":
      case "gate":
      case "re_enter":
      case "same_object":
        break;
    }
  }
  return bases.some((canonicalBasis) =>
    resolveGraphFunctionId({
      name: graphFunction.name,
      canonicalBasis,
    }) === graphFunction.id);
}
