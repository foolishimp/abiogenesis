import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  GraphFunction,
  GraphMaterializationBasis,
  GtlGraph,
} from "./contracts.js";

const materializedGraphs = new WeakSet<object>();

export function isMaterializedGtlGraph(value: object): boolean {
  return materializedGraphs.has(value);
}

export function materializeGraph(
  graphFunction: Readonly<GraphFunction>,
  basis: GraphMaterializationBasis,
): Readonly<GtlGraph> {
  const graphFunctionDigest = sha256Canonical(graphFunction as unknown as JsonValue);
  const body = {
    graphFunctionRef: graphFunction.name,
    graphFunctionDigest,
    invocationAdmissionRef: basis.invocationAdmissionRef,
    admittedInputRef: basis.admittedInputRef,
    admittedInputDigest: basis.admittedInputDigest,
    template: graphFunction.template,
  };
  const materializationDigest = sha256Canonical(body as unknown as JsonValue);
  const graph = deepFreeze({
    kind: "gtl_graph" as const,
    schemaVersion: "5.0.0" as const,
    materializationRef: `graph-materialization://abiogenesis/${materializationDigest.slice("sha256:".length)}`,
    materializationDigest,
    ...body,
  }) as GtlGraph;
  materializedGraphs.add(graph);
  return graph;
}
