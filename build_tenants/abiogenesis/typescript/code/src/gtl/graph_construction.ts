import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  cTermResultCardinality,
  type CProgramNode,
} from "./c_algebra.js";
import type {
  GraphFunction,
  GraphFunctionApplication,
  GtlNode,
} from "./contracts.js";
import {
  composeApplication,
  graphEdge,
} from "./graph_applications.js";

export interface ComposeGraphFunctionsInput {
  readonly name: string;
  readonly left: Readonly<GraphFunction>;
  readonly right: Readonly<GraphFunction>;
}

function requireRef(value: string, label: string): string {
  if (value.trim().length === 0) throw new TypeError(`${label} must be non-empty`);
  return value;
}

function stableUnion(values: readonly (readonly string[])[]): readonly string[] {
  return [...new Set(values.flat())];
}

function mergeDeclarations(
  left: Readonly<Record<string, string>>,
  right: Readonly<Record<string, string>>,
): Readonly<Record<string, string>> {
  const merged: Record<string, string> = { ...left };
  for (const [key, value] of Object.entries(right)) {
    if (merged[key] !== undefined && merged[key] !== value) {
      throw new TypeError(`compose GraphFunction declaration conflict at ${key}`);
    }
    merged[key] = value;
  }
  return merged;
}

function graphNodeRefs(
  graphFunction: Readonly<GraphFunction>,
  label: string,
): ReadonlySet<string> {
  requireRef(graphFunction.name, `${label} GraphFunction name`);
  const refs = graphFunction.template.nodes.map((node) => node.nodeRef);
  const refSet = new Set(refs);
  if (refSet.size !== refs.length) {
    throw new TypeError(`compose ${label} GraphFunction has duplicate node identities`);
  }
  if (
    !refSet.has(graphFunction.template.startNodeRef) ||
    graphFunction.template.terminalNodeRefs.length === 0 ||
    new Set(graphFunction.template.terminalNodeRefs).size !==
      graphFunction.template.terminalNodeRefs.length ||
    graphFunction.template.terminalNodeRefs.some((ref) => !refSet.has(ref))
  ) {
    throw new TypeError(
      `compose ${label} GraphFunction requires exact start and terminal nodes`,
    );
  }
  return refSet;
}

function rewriteCompositionTerm(
  term: Readonly<CProgramNode>,
  compositionRef: string,
  demoteResult: boolean,
): CProgramNode {
  switch (term.kind) {
    case "c_of":
      return {
        ...term,
        compositionRef,
        resultBearing: demoteResult ? false : term.resultBearing,
      };
    case "c_identity":
      return { ...term };
    case "c_compose":
      return {
        ...term,
        terms: term.terms.map((child) =>
          rewriteCompositionTerm(child, compositionRef, demoteResult)),
      };
    case "c_edge":
      return {
        ...term,
        transform: rewriteCompositionTerm(
          term.transform,
          compositionRef,
          demoteResult,
        ) as typeof term.transform,
        evaluate: rewriteCompositionTerm(
          term.evaluate,
          compositionRef,
          demoteResult,
        ) as typeof term.evaluate,
        consequence: rewriteCompositionTerm(
          term.consequence,
          compositionRef,
          demoteResult,
        ) as typeof term.consequence,
      };
    case "c_workflow":
      if (demoteResult) {
        throw new TypeError(
          "compose cannot demote an opaque workflow.C result; author an explicit result boundary",
        );
      }
      return { ...term };
    case "c_batch":
      return {
        ...term,
        tasks: term.tasks.map((child) =>
          rewriteCompositionTerm(child, compositionRef, demoteResult)),
      };
    case "c_retry":
      return {
        ...term,
        term: rewriteCompositionTerm(term.term, compositionRef, demoteResult),
      };
  }
}

function rewriteNodes(
  graphFunction: Readonly<GraphFunction>,
  compositionRef: string,
  demoteTerminalResults: boolean,
): readonly GtlNode[] {
  const terminalRefs = new Set(graphFunction.template.terminalNodeRefs);
  return graphFunction.template.nodes.map((node) => {
    const demoteResult = demoteTerminalResults && terminalRefs.has(node.nodeRef);
    if (demoteResult && cTermResultCardinality(node.term) !== "one") {
      throw new TypeError(
        `compose left terminal ${node.nodeRef} must declare exactly one result`,
      );
    }
    if (!demoteTerminalResults && terminalRefs.has(node.nodeRef) &&
      cTermResultCardinality(node.term) !== "one") {
      throw new TypeError(
        `compose right terminal ${node.nodeRef} must declare exactly one result`,
      );
    }
    const rewritten = rewriteCompositionTerm(
      node.term,
      compositionRef,
      demoteResult,
    );
    if (demoteResult && cTermResultCardinality(rewritten) !== "zero") {
      throw new TypeError(
        `compose left terminal ${node.nodeRef} did not become an intermediate result`,
      );
    }
    return {
      ...node,
      term: rewritten,
    };
  });
}

function mergeApplications(
  application: GraphFunctionApplication,
  left: Readonly<GraphFunction>,
  right: Readonly<GraphFunction>,
): readonly GraphFunctionApplication[] {
  const merged = [
    ...left.template.applications,
    ...right.template.applications,
    application,
  ];
  const byRef = new Map<string, GraphFunctionApplication>();
  for (const candidate of merged) {
    const existing = byRef.get(candidate.applicationRef);
    if (
      existing !== undefined &&
      canonicalJson(existing as unknown as JsonValue) !==
        canonicalJson(candidate as unknown as JsonValue)
    ) {
      throw new TypeError(
        `compose application identity conflict at ${candidate.applicationRef}`,
      );
    }
    byRef.set(candidate.applicationRef, candidate);
  }
  return [...byRef.values()];
}

export function composeGraphFunctions(
  input: ComposeGraphFunctionsInput,
): Readonly<GraphFunction> {
  const name = requireRef(input.name, "composed GraphFunction name");
  const { left, right } = input;
  if (name === left.name || name === right.name) {
    throw new TypeError("composed GraphFunction requires a distinct identity");
  }
  const leftNodeRefs = graphNodeRefs(left, "left");
  graphNodeRefs(right, "right");
  if (
    left.inputs.length !== 1 ||
    left.outputs.length !== 1 ||
    right.inputs.length !== 1 ||
    right.outputs.length !== 1 ||
    left.outputs[0] !== right.inputs[0]
  ) {
    throw new TypeError(
      "compose currently requires one exact left-output to right-input contract join",
    );
  }
  const available = new Set([
    ...left.environment.provides,
    ...left.environment.carries,
    ...left.outputs,
  ]);
  if (right.environment.requires.some((ref) => !available.has(ref))) {
    throw new TypeError(
      "compose right environment requires a binding absent from the left cumulative environment",
    );
  }
  if (right.template.nodes.some((node) => leftNodeRefs.has(node.nodeRef))) {
    throw new TypeError("compose operands contain a duplicate graph node identity");
  }

  const application = composeApplication({
    inputContractRef: left.inputs[0]!,
    outputContractRef: right.outputs[0]!,
    leftGraphFunctionRef: left.name,
    rightGraphFunctionRef: right.name,
  });
  const bridgeEdges = left.template.terminalNodeRefs.map((fromNodeRef) =>
    graphEdge({ fromNodeRef, toNodeRef: right.template.startNodeRef }));
  const edges = [
    ...left.template.edges,
    ...bridgeEdges,
    ...right.template.edges,
  ];
  if (new Set(edges.map((edge) => edge.edgeRef)).size !== edges.length) {
    throw new TypeError("compose operands produce a duplicate graph edge identity");
  }
  const graphIdentity = {
    name,
    leftGraphRef: left.template.graphRef,
    rightGraphRef: right.template.graphRef,
    applicationRef: application.applicationRef,
  };
  const graphDigest = sha256Canonical(graphIdentity as unknown as JsonValue);
  const graphFunction = {
    kind: "graph_function" as const,
    name,
    version: "5.0.0" as const,
    environment: {
      requires: [...left.environment.requires],
      provides: stableUnion([
        left.environment.provides,
        right.environment.provides,
      ]),
      carries: stableUnion([
        left.environment.carries,
        right.environment.carries,
      ]),
    },
    inputs: [...left.inputs],
    outputs: [...right.outputs],
    template: {
      kind: "inline_graph" as const,
      graphRef: `graph://abiogenesis/composed/${graphDigest.slice("sha256:".length)}`,
      startNodeRef: left.template.startNodeRef,
      terminalNodeRefs: [...right.template.terminalNodeRefs],
      nodes: [
        ...rewriteNodes(left, application.applicationRef, true),
        ...rewriteNodes(right, application.applicationRef, false),
      ],
      edges,
      applications: mergeApplications(application, left, right),
    },
    effects: stableUnion([left.effects, right.effects]),
    declarations: mergeDeclarations(left.declarations, right.declarations),
    tags: stableUnion([left.tags, right.tags]),
  };
  return deepFreeze(graphFunction) as Readonly<GraphFunction>;
}
