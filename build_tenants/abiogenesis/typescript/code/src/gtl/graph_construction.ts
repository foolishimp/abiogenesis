import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { requireRef } from "../shared/references.js";
import {
  cCarrier,
  cIdentity,
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
  graphFunctionApplicationRef,
  identityApplication,
  promoteApplication,
  substituteApplication,
} from "./graph_applications.js";

export interface ComposeGraphFunctionsInput {
  readonly name: string;
  readonly left: Readonly<GraphFunction>;
  readonly right: Readonly<GraphFunction>;
}

export interface SubstituteGraphFunctionInput {
  readonly name: string;
  readonly outer: Readonly<GraphFunction>;
  readonly targetVectorRef: string;
  readonly inner: Readonly<GraphFunction>;
}

export interface IdentityGraphFunctionInput {
  readonly name: string;
  readonly contractRef: string;
}

export interface PromoteGraphFunctionInput {
  readonly name: string;
  readonly source: Readonly<GraphFunction>;
  readonly sourceRef: string;
  readonly targetRef: string;
}

function stableUnion(values: readonly (readonly string[])[]): readonly string[] {
  return [...new Set(values.flat())];
}

function mergeDeclarations(
  left: Readonly<Record<string, string>>,
  right: Readonly<Record<string, string>>,
  relation: "compose" | "substitute",
): Readonly<Record<string, string>> {
  const merged: Record<string, string> = { ...left };
  for (const [key, value] of Object.entries(right)) {
    if (merged[key] !== undefined && merged[key] !== value) {
      if (
        key === "abg.compute_regime" &&
        ["F_D", "F_P", "F_H", "mixed"].includes(merged[key]!) &&
        ["F_D", "F_P", "F_H", "mixed"].includes(value)
      ) {
        merged[key] = "mixed";
        continue;
      }
      throw new TypeError(`${relation} GraphFunction declaration conflict at ${key}`);
    }
    merged[key] = value;
  }
  return merged;
}

function graphNodeRefs(
  graphFunction: Readonly<GraphFunction>,
  label: string,
  relation: "compose" | "promote" | "substitute",
): ReadonlySet<string> {
  requireRef(graphFunction.name, `${label} GraphFunction name`);
  const refs = graphFunction.template.nodes.map((node) => node.nodeRef);
  const refSet = new Set(refs);
  if (refSet.size !== refs.length) {
    throw new TypeError(
      `${relation} ${label} GraphFunction has duplicate node identities`,
    );
  }
  if (
    !refSet.has(graphFunction.template.startNodeRef) ||
    graphFunction.template.terminalNodeRefs.length === 0 ||
    new Set(graphFunction.template.terminalNodeRefs).size !==
      graphFunction.template.terminalNodeRefs.length ||
    graphFunction.template.terminalNodeRefs.some((ref) => !refSet.has(ref))
  ) {
    throw new TypeError(
      `${relation} ${label} GraphFunction requires exact start and terminal nodes`,
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
  sources: readonly Readonly<GraphFunction>[],
  relation: "compose" | "promote" | "substitute",
): readonly GraphFunctionApplication[] {
  const merged = [
    ...sources.flatMap((source) => source.template.applications),
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
        `${relation} application identity conflict at ${candidate.applicationRef}`,
      );
    }
    byRef.set(candidate.applicationRef, candidate);
  }
  return [...byRef.values()];
}

function isIdentityGraphFunction(
  graphFunction: Readonly<GraphFunction>,
): boolean {
  if (
    graphFunction.inputs.length !== 1 ||
    graphFunction.outputs.length !== 1 ||
    graphFunction.inputs[0] !== graphFunction.outputs[0] ||
    graphFunction.environment.requires.length !== 0 ||
    graphFunction.environment.provides.length !== 0 ||
    graphFunction.environment.carries.length !== 0 ||
    graphFunction.effects.length !== 0 ||
    graphFunction.template.nodes.length !== 1 ||
    graphFunction.template.edges.length !== 0 ||
    graphFunction.template.terminalNodeRefs.length !== 1 ||
    graphFunction.template.startNodeRef !== graphFunction.template.terminalNodeRefs[0]
  ) return false;
  const node = graphFunction.template.nodes[0]!;
  const contractRef = graphFunction.inputs[0]!;
  if (
    node.nodeRef !== graphFunction.template.startNodeRef ||
    node.term.kind !== "c_identity" ||
    node.term.inputCarrierRef !== contractRef ||
    node.term.outputCarrierRef !== contractRef
  ) return false;
  return graphFunction.template.applications.some((application) =>
    application.relationKind === "identity" &&
    application.targetRef === graphFunction.name &&
    application.inputContractRef === contractRef &&
    application.outputContractRef === contractRef &&
    application.applicationRef === graphFunctionApplicationRef(application));
}

export function identityGraphFunction(
  input: IdentityGraphFunctionInput,
): Readonly<GraphFunction> {
  const name = requireRef(input.name, "identity GraphFunction name");
  const contractRef = requireRef(input.contractRef, "identity contractRef");
  const application = identityApplication({
    inputContractRef: contractRef,
    outputContractRef: contractRef,
    targetRef: name,
  });
  const identity = {
    name,
    contractRef,
    applicationRef: application.applicationRef,
  };
  const digest = sha256Canonical(identity as unknown as JsonValue);
  const nodeRef =
    `node://abiogenesis/identity/${digest.slice("sha256:".length)}`;
  return deepFreeze({
    kind: "graph_function" as const,
    name,
    version: "5.0.0" as const,
    environment: { requires: [], provides: [], carries: [] },
    inputs: [contractRef],
    outputs: [contractRef],
    template: {
      kind: "inline_graph" as const,
      graphRef: `graph://abiogenesis/identity/${digest.slice("sha256:".length)}`,
      startNodeRef: nodeRef,
      terminalNodeRefs: [nodeRef],
      nodes: [{
        nodeRef,
        nodeKind: "c_locus" as const,
        term: cIdentity(cCarrier(contractRef)),
      }],
      edges: [],
      applications: [application],
    },
    effects: [],
    declarations: {},
    tags: [],
  }) as Readonly<GraphFunction>;
}

export function promoteGraphFunction(
  input: PromoteGraphFunctionInput,
): Readonly<GraphFunction> {
  const name = requireRef(input.name, "promoted GraphFunction name");
  const sourceRef = requireRef(input.sourceRef, "promotion sourceRef");
  const targetRef = requireRef(input.targetRef, "promotion targetRef");
  const { source } = input;
  if (name === source.name) {
    throw new TypeError("promoted GraphFunction requires a distinct identity");
  }
  graphNodeRefs(source, "source", "promote");
  if (
    source.inputs.length !== 1 ||
    source.outputs.length !== 1 ||
    source.inputs[0] !== sourceRef ||
    source.outputs[0] !== targetRef
  ) {
    throw new TypeError(
      "promote must bind the exact source GraphFunction input and output contracts",
    );
  }
  const application = promoteApplication({
    inputContractRef: sourceRef,
    outputContractRef: targetRef,
    sourceRef,
    targetRef,
  });
  const graphDigest = sha256Canonical({
    name,
    sourceGraphRef: source.template.graphRef,
    applicationRef: application.applicationRef,
  });
  return deepFreeze({
    kind: "graph_function" as const,
    name,
    version: "5.0.0" as const,
    environment: {
      requires: [...source.environment.requires],
      provides: [...source.environment.provides],
      carries: [...source.environment.carries],
    },
    inputs: [sourceRef],
    outputs: [targetRef],
    template: {
      kind: "inline_graph" as const,
      graphRef: `graph://abiogenesis/promoted/${graphDigest.slice("sha256:".length)}`,
      startNodeRef: source.template.startNodeRef,
      terminalNodeRefs: [...source.template.terminalNodeRefs],
      nodes: [...source.template.nodes],
      edges: [...source.template.edges],
      applications: mergeApplications(application, [source], "promote"),
    },
    effects: [...source.effects],
    declarations: { ...source.declarations },
    tags: [...source.tags],
  }) as Readonly<GraphFunction>;
}

export function composeGraphFunctions(
  input: ComposeGraphFunctionsInput,
): Readonly<GraphFunction> {
  const name = requireRef(input.name, "composed GraphFunction name");
  const { left, right } = input;
  if (name === left.name || name === right.name) {
    throw new TypeError("composed GraphFunction requires a distinct identity");
  }
  const leftNodeRefs = graphNodeRefs(left, "left", "compose");
  graphNodeRefs(right, "right", "compose");
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

  const leftIsIdentity = isIdentityGraphFunction(left);
  const rightIsIdentity = isIdentityGraphFunction(right);

  const application = composeApplication({
    inputContractRef: left.inputs[0]!,
    outputContractRef: right.outputs[0]!,
    leftGraphFunctionRef: left.name,
    rightGraphFunctionRef: right.name,
  });
  const bridgeEdges = leftIsIdentity || rightIsIdentity
    ? []
    : left.template.terminalNodeRefs.map((fromNodeRef) =>
      graphEdge({ fromNodeRef, toNodeRef: right.template.startNodeRef }));
  const edges = [
    ...(leftIsIdentity ? [] : left.template.edges),
    ...bridgeEdges,
    ...(rightIsIdentity ? [] : right.template.edges),
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
  if (leftIsIdentity && rightIsIdentity) {
    const base = identityGraphFunction({ name, contractRef: left.inputs[0]! });
    return deepFreeze({
      ...base,
      template: {
        ...base.template,
        graphRef:
          `graph://abiogenesis/composed/${graphDigest.slice("sha256:".length)}`,
        applications: mergeApplications(
          application,
          [left, right, base],
          "compose",
        ),
      },
    }) as Readonly<GraphFunction>;
  }
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
      startNodeRef: leftIsIdentity
        ? right.template.startNodeRef
        : left.template.startNodeRef,
      terminalNodeRefs: [
        ...(rightIsIdentity
          ? left.template.terminalNodeRefs
          : right.template.terminalNodeRefs),
      ],
      nodes: [
        ...(leftIsIdentity
          ? []
          : rewriteNodes(left, application.applicationRef, !rightIsIdentity)),
        ...(rightIsIdentity
          ? []
          : rewriteNodes(right, application.applicationRef, false)),
      ],
      edges,
      applications: mergeApplications(application, [left, right], "compose"),
    },
    effects: stableUnion([left.effects, right.effects]),
    declarations: mergeDeclarations(left.declarations, right.declarations, "compose"),
    tags: stableUnion([left.tags, right.tags]),
  };
  return deepFreeze(graphFunction) as Readonly<GraphFunction>;
}

export function substituteGraphFunction(
  input: SubstituteGraphFunctionInput,
): Readonly<GraphFunction> {
  const name = requireRef(input.name, "substituted GraphFunction name");
  const targetVectorRef = requireRef(input.targetVectorRef, "targetVectorRef");
  const { outer, inner } = input;
  if (name === outer.name || name === inner.name) {
    throw new TypeError("substituted GraphFunction requires a distinct identity");
  }
  const outerNodeRefs = graphNodeRefs(outer, "outer", "substitute");
  graphNodeRefs(inner, "inner", "substitute");
  if (
    outer.inputs.length !== 1 ||
    outer.outputs.length !== 1 ||
    inner.inputs.length !== 1 ||
    inner.outputs.length !== 1
  ) {
    throw new TypeError(
      "substitute currently requires one exact outer and inner interface",
    );
  }
  const targetEdges = outer.template.edges.filter(
    (edge) => edge.edgeRef === targetVectorRef,
  );
  if (targetEdges.length !== 1) {
    throw new TypeError(
      "substitute target vector must identify exactly one outer graph edge",
    );
  }
  const targetEdge = targetEdges[0]!;
  const sourceNode = outer.template.nodes.find(
    (node) => node.nodeRef === targetEdge.fromNodeRef,
  );
  const targetNode = outer.template.nodes.find(
    (node) => node.nodeRef === targetEdge.toNodeRef,
  );
  if (sourceNode === undefined || targetNode === undefined) {
    throw new TypeError("substitute target vector endpoints must resolve in the outer graph");
  }
  if (
    targetEdge.edgeRef !== graphEdge({
      fromNodeRef: targetEdge.fromNodeRef,
      toNodeRef: targetEdge.toNodeRef,
    }).edgeRef
  ) {
    throw new TypeError("substitute target vector must have one canonical graph identity");
  }
  if (
    sourceNode.term.outputCarrierRef !== inner.inputs[0] ||
    inner.outputs[0] !== targetNode.term.inputCarrierRef
  ) {
    throw new TypeError(
      "substitute inner interface must exactly join the target vector endpoints",
    );
  }
  const availableAtTarget = new Set([
    ...outer.environment.requires,
    ...outer.environment.provides,
    ...outer.environment.carries,
    sourceNode.term.outputCarrierRef,
  ]);
  if (inner.environment.requires.some((ref) => !availableAtTarget.has(ref))) {
    throw new TypeError(
      "substitute inner environment requires a binding absent from the outer graph",
    );
  }
  if (inner.template.nodes.some((node) => outerNodeRefs.has(node.nodeRef))) {
    throw new TypeError("substitute operands contain a duplicate graph node identity");
  }

  const application = substituteApplication({
    inputContractRef: outer.inputs[0]!,
    outputContractRef: outer.outputs[0]!,
    outerGraphFunctionRef: outer.name,
    targetVectorRef,
    innerGraphFunctionRef: inner.name,
  });
  const replacementEdges = [
    graphEdge({
      fromNodeRef: targetEdge.fromNodeRef,
      toNodeRef: inner.template.startNodeRef,
    }),
    ...inner.template.terminalNodeRefs.map((fromNodeRef) =>
      graphEdge({ fromNodeRef, toNodeRef: targetEdge.toNodeRef })),
  ];
  const edges = [
    ...outer.template.edges.filter((edge) => edge.edgeRef !== targetVectorRef),
    ...inner.template.edges,
    ...replacementEdges,
  ];
  if (new Set(edges.map((edge) => edge.edgeRef)).size !== edges.length) {
    throw new TypeError("substitute operands produce a duplicate graph edge identity");
  }
  const graphIdentity = {
    name,
    outerGraphRef: outer.template.graphRef,
    targetVectorRef,
    innerGraphRef: inner.template.graphRef,
    applicationRef: application.applicationRef,
  };
  const graphDigest = sha256Canonical(graphIdentity as unknown as JsonValue);
  const graphFunction = {
    kind: "graph_function" as const,
    name,
    version: "5.0.0" as const,
    environment: {
      requires: [...outer.environment.requires],
      provides: stableUnion([
        outer.environment.provides,
        inner.environment.provides,
      ]),
      carries: stableUnion([
        outer.environment.carries,
        inner.environment.carries,
      ]),
    },
    inputs: [...outer.inputs],
    outputs: [...outer.outputs],
    template: {
      kind: "inline_graph" as const,
      graphRef:
        `graph://abiogenesis/substituted/${graphDigest.slice("sha256:".length)}`,
      startNodeRef: outer.template.startNodeRef,
      terminalNodeRefs: [...outer.template.terminalNodeRefs],
      nodes: [
        ...outer.template.nodes,
        ...rewriteNodes(inner, application.applicationRef, true),
      ],
      edges,
      applications: mergeApplications(
        application,
        [outer, inner],
        "substitute",
      ),
    },
    effects: stableUnion([outer.effects, inner.effects]),
    declarations: mergeDeclarations(
      outer.declarations,
      inner.declarations,
      "substitute",
    ),
    tags: stableUnion([outer.tags, inner.tags]),
  };
  return deepFreeze(graphFunction) as Readonly<GraphFunction>;
}
