import {
  canonicalJson,
  compareUnicodeCodeUnits,
  type JsonValue,
} from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { requireRef } from "../shared/references.js";
import type { GraphFunction } from "./contracts.js";
import { graphFunctionApplicationRef } from "./graph_applications.js";
import { serializeGraphFunction } from "./serialization.js";
import { assertUniqueStringValues } from "./unique_strings.js";

const GENERATED_GRAPH_FUNCTION_PREFIX =
  "graph-function://abiogenesis/canonical/";
const GENERATED_GRAPH_FUNCTION_SELF =
  "graph-function://abiogenesis/canonical/self";
const GENERATED_SELF_TARGET_EQUATION = Object.freeze({
  kind: "generated_graph_function_self_target_equation",
});
const GENERATED_SELF_APPLICATION_EQUATION = Object.freeze({
  kind: "generated_graph_function_self_application_equation",
});

export type GraphFunctionInit = Omit<GraphFunction, "id" | "kind" | "version"> & {
  readonly id?: string;
};

type GraphFunctionBody = Omit<GraphFunctionInit, "id" | "name">;

function completeGraphFunction(
  id: string,
  name: string,
  body: Readonly<GraphFunctionBody>,
): Readonly<GraphFunction> {
  assertUniqueStringValues(body.effects, "GraphFunction.effects");
  assertUniqueStringValues(body.tags, "GraphFunction.tags");
  return serializeGraphFunction({
    kind: "graph_function",
    id,
    name,
    version: "5.0.0",
    environment: {
      requires: body.environment.requires,
      provides: body.environment.provides,
      carries: body.environment.carries,
    },
    inputs: body.inputs,
    outputs: body.outputs,
    template: body.template,
    effects: body.effects,
    declarations: body.declarations,
    tags: body.tags,
  });
}

function normalizedCompleteBody(
  graphFunction: Readonly<GraphFunction>,
): Readonly<Record<string, unknown>> {
  const canonical = serializeGraphFunction(graphFunction);
  const applications: unknown[] = canonical.template.applications.map((application) => {
    if (
      application.relationKind !== "identity" ||
      application.targetRef !== canonical.id ||
      application.applicationRef !== graphFunctionApplicationRef(application)
    ) {
      return application;
    }
    return {
      ...application,
      applicationRef: GENERATED_SELF_APPLICATION_EQUATION,
      targetRef: GENERATED_SELF_TARGET_EQUATION,
    };
  });
  applications.sort((left, right) =>
    compareUnicodeCodeUnits(
      canonicalJson(left as JsonValue),
      canonicalJson(right as JsonValue),
    )
  );
  const { id: _id, ...body } = canonical;
  return {
    ...body,
    template: {
      ...body.template,
      applications,
    },
  };
}

function generatedGraphFunctionId(
  graphFunction: Readonly<GraphFunction>,
): string {
  const digest = sha256Canonical(
    normalizedCompleteBody(graphFunction) as JsonValue,
  );
  return `${GENERATED_GRAPH_FUNCTION_PREFIX}${digest.slice("sha256:".length)}`;
}

/** Internal two-phase finalizer for constructors with canonical self references. */
export function finalizeGraphFunction(input: {
  readonly id?: string;
  readonly name: string;
  readonly assemble: (hostRef: string) => Readonly<GraphFunctionBody>;
}): Readonly<GraphFunction> {
  const name = requireRef(input.name, "GraphFunction name");
  const explicitId = input.id === undefined
    ? undefined
    : requireRef(input.id, "GraphFunction id");
  const provisionalHostRef = explicitId ?? GENERATED_GRAPH_FUNCTION_SELF;
  const provisional = completeGraphFunction(
    provisionalHostRef,
    name,
    input.assemble(provisionalHostRef),
  );
  const id = explicitId ?? generatedGraphFunctionId(provisional);
  if (id === name) {
    throw new TypeError("GraphFunction id must be distinct from its human-readable name");
  }
  const graphFunction = explicitId === undefined
    ? completeGraphFunction(id, name, input.assemble(id))
    : provisional;
  if (
    id.startsWith(GENERATED_GRAPH_FUNCTION_PREFIX) &&
    generatedGraphFunctionId(graphFunction) !== id
  ) {
    throw new TypeError(
      "reserved generated GraphFunction id must equal its complete canonical authoring identity",
    );
  }
  return graphFunction;
}

export function constructGraphFunction(
  input: GraphFunctionInit,
): Readonly<GraphFunction> {
  return finalizeGraphFunction({
    ...(input.id === undefined ? {} : { id: input.id }),
    name: input.name,
    assemble: () => ({
      environment: input.environment,
      inputs: input.inputs,
      outputs: input.outputs,
      template: input.template,
      effects: input.effects,
      declarations: input.declarations,
      tags: input.tags,
    }),
  });
}

export function hasCanonicalGraphFunctionId(
  graphFunction: Readonly<GraphFunction>,
): boolean {
  if (!graphFunction.id.startsWith(GENERATED_GRAPH_FUNCTION_PREFIX)) return true;
  return generatedGraphFunctionId(graphFunction) === graphFunction.id;
}
