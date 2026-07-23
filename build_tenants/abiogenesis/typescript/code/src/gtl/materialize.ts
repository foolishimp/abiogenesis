import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  FanOutMaterialization,
  GraphFunction,
  GraphMaterializationBasis,
  GraphTemplate,
  GtlGraph,
} from "./contracts.js";
import type { CProgramNode } from "./c_algebra.js";

const materializedGraphs = new WeakSet<object>();

export function isMaterializedGtlGraph(value: object): boolean {
  return materializedGraphs.has(value);
}

export interface MaterializedGraphShape {
  readonly template: GraphTemplate;
  readonly fanOutMaterializations: readonly FanOutMaterialization[];
}

function isRecord(
  value: unknown,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fanOutMembers(
  basis: GraphMaterializationBasis,
): FanOutMaterialization["members"] {
  const rows = basis.admittedInput.members;
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new TypeError(
      "fan_out materialization requires one admitted non-empty ordered member vector",
    );
  }
  return deepFreeze(rows.map((row, ordinal) => {
    if (!isRecord(row)) {
      throw new TypeError(
        "fan_out members require stable zero-based ordinals, refs, and record values",
      );
    }
    const value = row.value;
    if (
      row.ordinal !== ordinal ||
      typeof row.memberRef !== "string" ||
      row.memberRef.length === 0 ||
      !isRecord(value)
    ) {
      throw new TypeError(
        "fan_out members require stable zero-based ordinals, refs, and record values",
      );
    }
    return {
      ordinal,
      memberRef: row.memberRef,
      memberDigest: sha256Canonical(value),
      value,
    };
  }));
}

function projectBatch(
  term: Readonly<CProgramNode>,
  batchRef: string,
  elementGraphFunctionRef: string,
  taskCount: number,
): { readonly term: CProgramNode; readonly matchCount: number } {
  switch (term.kind) {
    case "c_of":
    case "c_identity":
      return { term, matchCount: 0 };
    case "c_workflow":
      return { term, matchCount: 0 };
    case "c_compose": {
      const children = term.terms.map((child) =>
        projectBatch(child, batchRef, elementGraphFunctionRef, taskCount));
      return {
        term: { ...term, terms: children.map((child) => child.term) },
        matchCount: children.reduce((sum, child) => sum + child.matchCount, 0),
      };
    }
    case "c_edge": {
      const transform = projectBatch(
        term.transform,
        batchRef,
        elementGraphFunctionRef,
        taskCount,
      );
      const evaluate = projectBatch(
        term.evaluate,
        batchRef,
        elementGraphFunctionRef,
        taskCount,
      );
      const consequence = projectBatch(
        term.consequence,
        batchRef,
        elementGraphFunctionRef,
        taskCount,
      );
      return {
        term: {
          ...term,
          transform: transform.term as typeof term.transform,
          evaluate: evaluate.term as typeof term.evaluate,
          consequence: consequence.term as typeof term.consequence,
        },
        matchCount:
          transform.matchCount + evaluate.matchCount + consequence.matchCount,
      };
    }
    case "c_batch": {
      const children = term.tasks.map((child) =>
        projectBatch(child, batchRef, elementGraphFunctionRef, taskCount));
      if (term.batchRef !== batchRef) {
        return {
          term: { ...term, tasks: children.map((child) => child.term) },
          matchCount: children.reduce((sum, child) => sum + child.matchCount, 0),
        };
      }
      if (
        term.tasks.length !== 1 ||
        term.tasks[0]?.kind !== "c_workflow" ||
        term.tasks[0].graphFunctionRef !== elementGraphFunctionRef
      ) {
        throw new TypeError(
          "fan_out batch requires one declared workflow.C element task seed",
        );
      }
      return {
        term: {
          ...term,
          tasks: Array.from({ length: taskCount }, () => term.tasks[0]!),
        },
        matchCount:
          1 + children.reduce((sum, child) => sum + child.matchCount, 0),
      };
    }
    case "c_retry": {
      const child = projectBatch(
        term.term,
        batchRef,
        elementGraphFunctionRef,
        taskCount,
      );
      return {
        term: { ...term, term: child.term },
        matchCount: child.matchCount,
      };
    }
  }
}

export function deriveMaterializedGraphShape(
  graphFunction: Readonly<GraphFunction>,
  basis: GraphMaterializationBasis,
): MaterializedGraphShape {
  const fanOutApplications = graphFunction.template.applications.filter(
    (application) => application.relationKind === "fan_out",
  );
  if (fanOutApplications.length === 0) {
    return deepFreeze({
      template: graphFunction.template,
      fanOutMaterializations: [],
    });
  }
  if (
    sha256Canonical(basis.admittedInput as unknown as JsonValue) !==
      basis.admittedInputDigest
  ) {
    throw new TypeError(
      "graph materialization input value differs from the admitted input digest",
    );
  }
  const members = fanOutMembers(basis);
  let nodes = [...graphFunction.template.nodes];
  const fanOutMaterializations = fanOutApplications.map((application) => {
    let matchCount = 0;
    nodes = nodes.map((node) => {
      const projected = projectBatch(
        node.term,
        application.batchRef,
        application.elementGraphFunctionRef,
        members.length,
      );
      matchCount += projected.matchCount;
      return { ...node, term: projected.term };
    });
    if (matchCount !== 1) {
      throw new TypeError(
        "fan_out application must bind exactly one declared C.batch",
      );
    }
    return {
      applicationRef: application.applicationRef,
      batchRef: application.batchRef,
      inputVectorRef: application.inputVectorRef,
      outputVectorRef: application.outputVectorRef,
      inputMemberContractRef: application.inputMemberContractRef,
      outputMemberContractRef: application.outputMemberContractRef,
      members,
    };
  });
  return deepFreeze({
    template: {
      ...graphFunction.template,
      nodes,
    },
    fanOutMaterializations,
  });
}

export function materializeGraph(
  graphFunction: Readonly<GraphFunction>,
  basis: GraphMaterializationBasis,
): Readonly<GtlGraph> {
  const graphFunctionDigest = sha256Canonical(graphFunction as unknown as JsonValue);
  const shape = deriveMaterializedGraphShape(graphFunction, basis);
  const body = {
    graphFunctionRef: graphFunction.name,
    graphFunctionDigest,
    invocationAdmissionRef: basis.invocationAdmissionRef,
    admittedInputRef: basis.admittedInputRef,
    admittedInputDigest: basis.admittedInputDigest,
    fanOutMaterializations: shape.fanOutMaterializations,
    template: shape.template,
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
