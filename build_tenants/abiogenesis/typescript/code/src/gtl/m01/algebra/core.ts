// Implements: REQ-L-GTL3-COMPOSE
// Implements: REQ-L-GTL3-SUBSTITUTE
// Implements: REQ-L-GTL3-HOF
// Implements: REQ-L-GTL3-LAWS
// Implements: REQ-L-GTL3-IDENTITY
// Implements: REQ-L-GTL3-SELECTION-BOUNDARY
// Implements: REQ-L-GTL3-SYNTHESIS

import {
  constructEnvRef,
  constructGraph,
  constructGraphFunction,
  constructGraphVector,
  constructTemplateRef,
  emptySerializedAttrs
} from "../contracts/constructors.js";
import {
  type Context,
  type Evaluator,
  type Graph,
  type GraphFunction,
  type GraphVector,
  type Node,
  type Operator,
  type Rule,
  type SerializedAttrEntry,
  type SerializedAttrs,
  type SerializedAttrValue,
  type SerializedJsonValue
} from "../contracts/carriers.js";
import {
  materializeGraphFunction,
  nodeContractKey
} from "../contracts/carriers.js";

function stableUnion(values: readonly (readonly string[])[]): readonly string[] {
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const group of values) {
    for (const value of group) {
      if (!seen.has(value)) {
        seen.add(value);
        merged.push(value);
      }
    }
  }
  return Object.freeze(merged);
}

function entriesEqual(left: SerializedAttrEntry, right: SerializedAttrEntry): boolean {
  return (
    left.key === right.key &&
    JSON.stringify(left.value) === JSON.stringify(right.value)
  );
}

function mergeSerializedAttrs(values: readonly SerializedAttrs[]): SerializedAttrs {
  const merged: SerializedAttrEntry[] = [];

  for (const attrs of values) {
    for (const entry of attrs.entries) {
      const existing = merged.find((candidate) => candidate.key === entry.key);
      if (existing === undefined) {
        merged.push(entry);
        continue;
      }
      if (!entriesEqual(existing, entry)) {
        throw new TypeError(
          `Conflicting serialized declaration for key ${entry.key}`
        );
      }
    }
  }

  return Object.freeze({
    entries: Object.freeze(merged)
  });
}

function attrsFromEntries(entries: readonly SerializedAttrEntry[]): SerializedAttrs {
  return Object.freeze({
    entries: Object.freeze([...entries])
  });
}

function jsonObjectValue(
  entries: readonly {
    readonly key: string;
    readonly value: SerializedJsonValue;
  }[]
): SerializedJsonValue {
  return Object.freeze({
    kind: "object",
    entries: Object.freeze(
      entries.map((entry) =>
        Object.freeze({
          key: entry.key,
          value: entry.value
        })
      )
    )
  });
}

function jsonArrayValue(values: readonly SerializedJsonValue[]): SerializedJsonValue {
  return Object.freeze({
    kind: "array",
    items: Object.freeze([...values])
  });
}

function serializedAttrValueToJson(value: SerializedAttrValue): SerializedJsonValue {
  if (value.kind === "scalar") {
    return value.value;
  }
  if (value.kind === "string_list") {
    return jsonArrayValue(value.value);
  }
  if (value.kind === "hook_ref") {
    return jsonObjectValue([
      { key: "ref", value: value.value.ref },
      {
        key: "config",
        value: serializedAttrsToJsonObject(value.value.config)
      }
    ]);
  }
  return value.value;
}

function serializedAttrsToJsonObject(attrs: SerializedAttrs): SerializedJsonValue {
  return jsonObjectValue(
    attrs.entries.map((entry) => ({
      key: entry.key,
      value: serializedAttrValueToJson(entry.value)
    }))
  );
}

function jsonBlobEntry(
  key: string,
  entries: readonly {
    readonly key: string;
    readonly value: SerializedJsonValue;
  }[]
): SerializedAttrEntry {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "json_blob",
      value: jsonObjectValue(entries)
    })
  });
}

function stableNodes(values: readonly (readonly Node[])[]): readonly Node[] {
  const seen = new Set<string>();
  const merged: Node[] = [];

  for (const group of values) {
    for (const node of group) {
      const key = nodeContractKey(node);
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(node);
      }
    }
  }

  return Object.freeze(merged);
}

function stableRules(values: readonly (readonly Rule[])[]): readonly Rule[] {
  const seen = new Set<string>();
  const merged: Rule[] = [];

  for (const group of values) {
    for (const rule of group) {
      if (!seen.has(rule.name)) {
        seen.add(rule.name);
        merged.push(rule);
      }
    }
  }

  return Object.freeze(merged);
}

function evaluatorDeclaration(evaluator: Evaluator): SerializedJsonValue {
  return jsonObjectValue([
    { key: "name", value: evaluator.name },
    { key: "regime", value: evaluator.regime },
    { key: "binding", value: evaluator.binding },
    { key: "description", value: evaluator.description }
  ]);
}

function ruleDeclaration(rule: Rule): SerializedJsonValue {
  return jsonObjectValue([
    { key: "name", value: rule.name },
    { key: "kind", value: rule.kind },
    { key: "config", value: serializedAttrsToJsonObject(rule.config) }
  ]);
}

function isVectorBoundary(node: Node): boolean {
  const ref = node.schema.ref.trim();
  return ref.startsWith("Vector[") && ref.endsWith("]");
}

function mergeContexts(values: readonly (readonly Context[])[]): readonly Context[] {
  const byName = new Map<string, Context>();

  for (const group of values) {
    for (const context of group) {
      const existing = byName.get(context.name);
      if (existing === undefined) {
        byName.set(context.name, context);
        continue;
      }
      if (
        existing.locator !== context.locator ||
        existing.digest !== context.digest
      ) {
        throw new TypeError(
          `Conflicting context declaration for ${context.name}`
        );
      }
    }
  }

  return Object.freeze([...byName.values()]);
}

function requireCompatibleContexts(
  left: readonly Context[],
  right: readonly Context[]
): void {
  void mergeContexts([left, right]);
}

function requireCompatibleNodes(
  label: string,
  available: readonly Node[],
  required: readonly Node[]
): void {
  const availableByName = new Map<string, string>();
  for (const node of available) {
    availableByName.set(node.name, nodeContractKey(node));
  }

  const missing: string[] = [];
  const mismatched: string[] = [];

  for (const node of required) {
    const contract = availableByName.get(node.name);
    if (contract === undefined) {
      missing.push(node.name);
      continue;
    }
    if (contract !== nodeContractKey(node)) {
      mismatched.push(node.name);
    }
  }

  if (missing.length > 0) {
    throw new TypeError(
      `${label}: required environment bindings are missing: ${missing.join(", ")}`
    );
  }
  if (mismatched.length > 0) {
    throw new TypeError(
      `${label}: required environment bindings are not structurally satisfied: ${mismatched.join(", ")}`
    );
  }
}

function rejectConflictingProvidedBindings(
  label: string,
  available: readonly Node[],
  required: readonly Node[],
  provided: readonly Node[]
): void {
  const requiredNames = new Set(required.map((node) => node.name));
  const availableByName = new Map<string, string>();
  for (const node of available) {
    availableByName.set(node.name, nodeContractKey(node));
  }

  const duplicates: string[] = [];
  for (const node of provided) {
    const existing = availableByName.get(node.name);
    if (existing !== undefined && !requiredNames.has(node.name)) {
      duplicates.push(node.name);
    }
  }

  if (duplicates.length > 0) {
    throw new TypeError(
      `${label}: duplicate output names in carried environment: ${duplicates.join(", ")}`
    );
  }
}

function materializeTemplateGraph(graphFunction: GraphFunction): Graph | null {
  if (graphFunction.template.kind === "inline_graph") {
    return materializeGraphFunction(graphFunction);
  }
  return null;
}

function mergeGraphTemplates(
  left: GraphFunction,
  right: GraphFunction
): GraphFunction["template"] {
  const leftGraph = materializeTemplateGraph(left);
  const rightGraph = materializeTemplateGraph(right);

  if (leftGraph === null || rightGraph === null) {
    return Object.freeze({
      kind: "symbolic",
      ref: `compose:${left.template.ref};${right.template.ref}`,
      graph: null,
      version: null
    });
  }

  const graph = constructGraph({
    name: `${left.name};${right.name}`,
    inputs: leftGraph.inputs,
    outputs: rightGraph.outputs,
    nodes: stableNodes([leftGraph.nodes, rightGraph.nodes]),
    vectors: Object.freeze([...leftGraph.vectors, ...rightGraph.vectors]),
    contexts: mergeContexts([leftGraph.contexts, rightGraph.contexts]),
    rules: stableRules([leftGraph.rules, rightGraph.rules]),
    effects: stableUnion([leftGraph.effects, rightGraph.effects]),
    tags: stableUnion([leftGraph.tags, rightGraph.tags])
  });

  return constructTemplateRef({
    kind: "inline_graph",
    ref: `compose:${left.name};${right.name}`,
    graph,
    version: null
  });
}

export function sameObject(
  left: { readonly id: string },
  right: { readonly id: string }
): boolean {
  return left.id === right.id;
}

export function edge(
  source: readonly Node[],
  target: Node,
  options?: {
    readonly name?: string;
    readonly operators?: readonly Operator[];
    readonly evaluators?: readonly Evaluator[];
    readonly contexts?: readonly Context[];
    readonly rule?: Rule | null;
    readonly allowsSubwork?: boolean;
    readonly declarations?: SerializedAttrs;
    readonly tags?: readonly string[];
    readonly id?: string;
  }
): Graph {
  const sourceNodes = Object.freeze([...source]);
  const vectorName =
    options?.name ??
    `${sourceNodes.map((node) => node.name).join("+")}→${target.name}`;

  const vector = constructGraphVector({
    id: options?.id,
    name: vectorName,
    source: sourceNodes,
    target,
    operators: options?.operators ?? [],
    evaluators: options?.evaluators ?? [],
    contexts: options?.contexts ?? [],
    rule: options?.rule ?? null,
    allowsSubwork: options?.allowsSubwork ?? false,
    declarations: options?.declarations ?? emptySerializedAttrs(),
    tags: options?.tags ?? []
  });

  return constructGraph({
    name: vectorName,
    inputs: sourceNodes,
    outputs: [target],
    nodes: stableNodes([sourceNodes, [target]]),
    vectors: [vector],
    contexts: options?.contexts ?? [],
    rules: options?.rule === undefined || options?.rule === null ? [] : [options.rule],
    effects: [],
    tags: options?.tags ?? []
  });
}

export function identity(
  inputs: readonly Node[],
  options?: {
    readonly name?: string;
    readonly tags?: readonly string[];
    readonly declarations?: SerializedAttrs;
  }
): GraphFunction {
  const name =
    options?.name ??
    `identity:${inputs.map((node) => node.name).join("+") || "empty"}`;

  return constructGraphFunction({
    name,
    environment: constructEnvRef({
      requires: inputs,
      provides: inputs,
      carries: inputs
    }),
    inputs,
    outputs: inputs,
    template: {
      kind: "inline_graph",
      ref: `inline:${name}`,
      version: null,
      graph: constructGraph({
        name,
        inputs,
        outputs: inputs,
        nodes: inputs,
        vectors: [],
        contexts: [],
        rules: [],
        effects: [],
        tags: options?.tags ?? []
      })
    },
    effects: [],
    declarations: options?.declarations ?? emptySerializedAttrs(),
    tags: options?.tags ?? []
  });
}

export function graphFunctionForVector(
  vector: GraphVector,
  options?: {
    readonly name?: string;
    readonly tags?: readonly string[];
    readonly declarations?: SerializedAttrs;
  }
): GraphFunction {
  const name = options?.name ?? vector.name;

  return constructGraphFunction({
    name,
    environment: constructEnvRef({
      requires: vector.source,
      provides: [vector.target],
      carries: stableNodes([vector.source, [vector.target]])
    }),
    inputs: vector.source,
    outputs: [vector.target],
    template: {
      kind: "inline_graph",
      ref: `inline:${name}`,
      version: null,
      graph: constructGraph({
        name: `${name}_workflow`,
        inputs: vector.source,
        outputs: [vector.target],
        nodes: stableNodes([vector.source, [vector.target]]),
        vectors: [vector],
        contexts: vector.contexts,
        rules: vector.rule === null ? [] : [vector.rule],
        effects: [],
        tags: options?.tags ?? []
      })
    },
    effects: [],
    declarations: mergeSerializedAttrs([
      vector.declarations,
      options?.declarations ?? emptySerializedAttrs()
    ]),
    tags: options?.tags ?? []
  });
}

export function substitute(
  outer: Graph,
  contractVectorId: string,
  inner: Graph
): Graph {
  const targetVector = outer.vectors.find((vector) => vector.id === contractVectorId);

  if (targetVector === undefined) {
    throw new TypeError(
      `substitute(): vector ${JSON.stringify(contractVectorId)} not found in graph ${JSON.stringify(outer.name)}`
    );
  }

  const innerInputContracts = new Set(
    inner.inputs.map((node) => nodeContractKey(node))
  );
  const vectorSourceContracts = new Set(
    targetVector.source.map((node) => nodeContractKey(node))
  );

  for (const contract of innerInputContracts) {
    if (!vectorSourceContracts.has(contract)) {
      throw new TypeError(
        `substitute(): inner.inputs ${JSON.stringify([...innerInputContracts].sort())} not subset of vector source ${JSON.stringify([...vectorSourceContracts].sort())}`
      );
    }
  }

  const innerOutputContracts = new Set(
    inner.outputs.map((node) => nodeContractKey(node))
  );
  const targetContract = nodeContractKey(targetVector.target);
  if (!innerOutputContracts.has(targetContract)) {
    throw new TypeError(
      `substitute(): vector target ${JSON.stringify(targetContract)} not in inner.outputs ${JSON.stringify([...innerOutputContracts].sort())}`
    );
  }

  const substitutedVectors: GraphVector[] = [];
  for (const vector of outer.vectors) {
    if (vector.id === targetVector.id) {
      substitutedVectors.push(...inner.vectors);
      continue;
    }
    substitutedVectors.push(vector);
  }

  return constructGraph({
    name: outer.name,
    inputs: outer.inputs,
    outputs: outer.outputs,
    nodes: stableNodes([outer.nodes, inner.nodes]),
    vectors: substitutedVectors,
    contexts: mergeContexts([outer.contexts, inner.contexts]),
    rules: outer.rules,
    effects: outer.effects,
    tags: stableUnion([outer.tags, [`substituted:${targetVector.name}`]])
  });
}

export interface FoldbackDeclaration {
  readonly binding: string;
  readonly mode: "rebind";
  readonly requiresParentEvaluation: boolean;
  readonly additional?: SerializedAttrs;
}

export function recurse(
  graphFunction: GraphFunction,
  termination: Evaluator,
  foldback: FoldbackDeclaration
): GraphFunction {
  if (foldback.mode !== "rebind") {
    throw new TypeError("recurse(...): foldback.mode must be 'rebind'");
  }
  if (foldback.binding.length === 0) {
    throw new TypeError("recurse(...): foldback.binding is required");
  }
  if (foldback.requiresParentEvaluation !== true) {
    throw new TypeError(
      "recurse(...): foldback.requiresParentEvaluation must be true"
    );
  }

  const foldbackEntries: readonly {
    readonly key: string;
    readonly value: SerializedJsonValue;
  }[] = [
    { key: "mode", value: "rebind" },
    { key: "binding", value: foldback.binding },
    { key: "requires_parent_evaluation", value: true },
    ...((foldback.additional?.entries ?? []).map((entry) => ({
      key: entry.key,
      value: serializedAttrValueToJson(entry.value)
    })))
  ];

  return constructGraphFunction({
    name: `recurse(${graphFunction.name})`,
    environment: graphFunction.environment,
    inputs: graphFunction.inputs,
    outputs: graphFunction.outputs,
    template: graphFunction.template,
    effects: graphFunction.effects,
    declarations: mergeSerializedAttrs([
      graphFunction.declarations,
      attrsFromEntries([
        jsonBlobEntry("recursion", [
          { key: "termination", value: evaluatorDeclaration(termination) },
          { key: "foldback", value: jsonObjectValue(foldbackEntries) }
        ])
      ])
    ]),
    tags: stableUnion([
      graphFunction.tags,
      [`termination:${termination.name}`, `foldback:${foldback.binding}`]
    ])
  });
}

export function fan_out(
  graphFunction: GraphFunction,
  over: Node
): GraphFunction {
  if (!isVectorBoundary(over)) {
    throw new TypeError(
      `fan_out(${graphFunction.name}): over must declare an explicit Vector[...] boundary`
    );
  }

  return constructGraphFunction({
    name: `fan_out(${graphFunction.name})`,
    environment: constructEnvRef({
      requires: [over],
      provides: [over],
      carries: [over]
    }),
    inputs: [over],
    outputs: [over],
    template: graphFunction.template,
    effects: graphFunction.effects,
    declarations: graphFunction.declarations,
    tags: stableUnion([graphFunction.tags, [`over:${over.name}`]])
  });
}

export function fan_in(
  reducer: GraphFunction,
  over: Node
): GraphFunction {
  if (!isVectorBoundary(over)) {
    throw new TypeError(
      `fan_in(${reducer.name}): over must declare an explicit Vector[...] boundary`
    );
  }

  return constructGraphFunction({
    name: `fan_in(${reducer.name})`,
    environment: constructEnvRef({
      requires: [over],
      provides: reducer.environment.provides,
      carries: stableNodes([[over], reducer.environment.provides])
    }),
    inputs: [over],
    outputs: reducer.outputs,
    template: reducer.template,
    effects: reducer.effects,
    declarations: reducer.declarations,
    tags: stableUnion([reducer.tags, [`over:${over.name}`]])
  });
}

export function gate(
  target: GraphFunction,
  rule: Rule,
  evaluators: readonly Evaluator[]
): GraphFunction {
  if (evaluators.length === 0) {
    throw new TypeError("gate(): requires at least one evaluator");
  }

  return constructGraphFunction({
    name: `gate(${target.name})`,
    environment: target.environment,
    inputs: target.inputs,
    outputs: target.outputs,
    template: target.template,
    effects: target.effects,
    declarations: mergeSerializedAttrs([
      target.declarations,
      attrsFromEntries([
        jsonBlobEntry("gate", [
          { key: "target", value: target.name },
          { key: "target_kind", value: "GraphFunction" },
          { key: "rule", value: ruleDeclaration(rule) },
          {
            key: "evaluators",
            value: jsonArrayValue(evaluators.map(evaluatorDeclaration))
          }
        ])
      ])
    ]),
    tags: stableUnion([target.tags, [`rule:${rule.name}`]])
  });
}

export function promote(
  source: Node,
  to: Node
): GraphFunction {
  return constructGraphFunction({
    name: `promote(${source.name}->${to.name})`,
    environment: constructEnvRef({
      requires: [source],
      provides: [to],
      carries: [source, to]
    }),
    inputs: [source],
    outputs: [to],
    template: constructTemplateRef({
      kind: "symbolic",
      ref: `promote:${source.name}->${to.name}`,
      graph: null,
      version: null
    }),
    effects: [],
    declarations: emptySerializedAttrs(),
    tags: [`source:${source.name}`, `to:${to.name}`]
  });
}

function composePair(left: GraphFunction, right: GraphFunction): GraphFunction {
  requireCompatibleNodes(
    `compose(${left.name}, ${right.name})`,
    left.environment.carries,
    right.environment.requires
  );
  rejectConflictingProvidedBindings(
    `compose(${left.name}, ${right.name})`,
    left.environment.carries,
    right.environment.requires,
    right.environment.provides
  );
  requireCompatibleContexts(
    materializeTemplateGraph(left)?.contexts ?? [],
    materializeTemplateGraph(right)?.contexts ?? []
  );

  return constructGraphFunction({
    name: `${left.name};${right.name}`,
    environment: constructEnvRef({
      requires: left.environment.requires,
      provides: stableNodes([
        left.environment.provides,
        right.environment.provides
      ]),
      carries: stableNodes([
        left.environment.carries,
        right.environment.carries
      ])
    }),
    inputs: left.inputs,
    outputs: right.outputs,
    template: mergeGraphTemplates(left, right),
    effects: stableUnion([left.effects, right.effects]),
    declarations: mergeSerializedAttrs([left.declarations, right.declarations]),
    tags: stableUnion([left.tags, right.tags])
  });
}

export function compose(
  first: GraphFunction,
  second: GraphFunction,
  ...rest: readonly GraphFunction[]
): GraphFunction {
  let composed = composePair(first, second);
  for (const next of rest) {
    composed = composePair(composed, next);
  }
  return composed;
}
