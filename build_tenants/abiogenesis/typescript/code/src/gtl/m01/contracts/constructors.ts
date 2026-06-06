import {
  interfaceContract,
  type AssetSurface,
  type AssetSurfaceAuthoritySlot,
  type AssetSurfaceAuthoritySlotDisposition,
  ASSET_SURFACE_AUTHORITY_SLOT_DISPOSITIONS,
  type Context,
  type EnvRef,
  type Graph,
  type GraphFunction,
  type GraphVector,
  type Node,
  type SerializedAttrEntry,
  type SerializedAttrs,
  type SerializedAttrValue,
  type SerializedJsonValue,
  type TemplateRef
} from "./carriers.js";

export interface AssetSurfaceAuthoritySlotInit {
  readonly authorityKindRef: string;
  readonly disposition: AssetSurfaceAuthoritySlotDisposition;
  readonly fallbackPreconditionRefs?: readonly string[] | undefined;
}

export interface AssetSurfaceInit {
  readonly kind: string;
  readonly requiredContexts?: readonly string[] | undefined;
  readonly standardsRefs?: readonly string[] | undefined;
  readonly outputContractRefs?: readonly string[] | undefined;
  readonly constructorRefs?: readonly string[] | undefined;
  readonly constructorInputAssetKinds?: readonly string[] | undefined;
  readonly rendererRefs?: readonly string[] | undefined;
  readonly renderedViewDigestPolicyRef?: string | null | undefined;
  readonly sectionKindRefs?: readonly string[] | undefined;
  readonly clauseKindRefs?: readonly string[] | undefined;
  readonly authoritySlots?: readonly AssetSurfaceAuthoritySlotInit[] | undefined;
  readonly proofObligationRefs?: readonly string[] | undefined;
}

export interface NodeInit {
  readonly name: string;
  readonly schema: Node["schema"];
  readonly markov: readonly string[];
  readonly assetSurface: AssetSurfaceInit;
  readonly tags: readonly string[];
  readonly id?: string | undefined;
}

export interface GraphVectorInit {
  readonly name: string;
  readonly source: readonly Node[];
  readonly target: Node;
  readonly operators: GraphVector["operators"];
  readonly evaluators: GraphVector["evaluators"];
  readonly contexts: readonly Context[];
  readonly rule: GraphVector["rule"];
  readonly allowsSubwork: boolean;
  readonly declarations: SerializedAttrs;
  readonly tags: readonly string[];
  readonly id?: string | undefined;
}

export interface GraphInit {
  readonly name: string;
  readonly inputs: readonly Node[];
  readonly outputs: readonly Node[];
  readonly nodes: readonly Node[];
  readonly vectors: readonly GraphVector[];
  readonly contexts: readonly Context[];
  readonly rules: Graph["rules"];
  readonly effects: readonly string[];
  readonly tags: readonly string[];
  readonly id?: string | undefined;
}

export interface EnvRefInit {
  readonly requires: readonly Node[];
  readonly provides: readonly Node[];
  readonly carries: readonly Node[];
}

export interface InlineTemplateInit {
  readonly kind: "inline_graph";
  readonly ref: string;
  readonly graph: Graph;
  readonly version: null;
}

export interface SymbolicTemplateInit {
  readonly kind: "symbolic";
  readonly ref: string;
  readonly graph: null;
  readonly version: string | null;
}

export type TemplateRefInit = InlineTemplateInit | SymbolicTemplateInit;

export interface GraphFunctionInit {
  readonly name: string;
  readonly environment: EnvRef;
  readonly inputs: readonly Node[];
  readonly outputs: readonly Node[];
  readonly template: TemplateRef;
  readonly effects: readonly string[];
  readonly declarations: SerializedAttrs;
  readonly tags: readonly string[];
  readonly id?: string | undefined;
}

const EMPTY_SERIALIZED_ATTRS: SerializedAttrs = Object.freeze({
  entries: Object.freeze([])
});

function freezeStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

function freezeOptionalStrings(
  values: readonly string[] | undefined
): readonly string[] {
  return freezeStrings(values ?? []);
}

function freezeNodes(values: readonly Node[]): readonly Node[] {
  return Object.freeze([...values]);
}

function freezeContexts(values: readonly Context[]): readonly Context[] {
  return Object.freeze([...values]);
}

function freezeAttrEntries(values: readonly SerializedAttrEntry[]): readonly SerializedAttrEntry[] {
  return Object.freeze([...values]);
}

function freezeSerializedAttrs(values: SerializedAttrs): SerializedAttrs {
  return Object.freeze({
    entries: freezeAttrEntries(values.entries)
  });
}

function requireKnownAuthoritySlotDisposition(
  disposition: AssetSurfaceAuthoritySlotDisposition,
  label: string
): void {
  if (!ASSET_SURFACE_AUTHORITY_SLOT_DISPOSITIONS.includes(disposition)) {
    throw new TypeError(
      `${label}: unsupported asset-surface authority slot disposition ${disposition}`
    );
  }
}

function constructAssetSurfaceAuthoritySlot(
  input: AssetSurfaceAuthoritySlotInit,
  label: string
): AssetSurfaceAuthoritySlot {
  requireKnownAuthoritySlotDisposition(input.disposition, `${label}.disposition`);
  const fallbackPreconditionRefs = freezeOptionalStrings(
    input.fallbackPreconditionRefs
  );
  if (
    input.disposition === "bounded_fallback" &&
    fallbackPreconditionRefs.length === 0
  ) {
    throw new TypeError(
      `${label}.fallbackPreconditionRefs: bounded_fallback authority slots require at least one fallback precondition ref`
    );
  }
  if (
    input.disposition !== "bounded_fallback" &&
    fallbackPreconditionRefs.length > 0
  ) {
    throw new TypeError(
      `${label}.fallbackPreconditionRefs: fallback precondition refs are only valid on bounded_fallback authority slots`
    );
  }
  if (input.authorityKindRef.length === 0) {
    throw new TypeError(`${label}.authorityKindRef: expected non-empty ref`);
  }
  return Object.freeze({
    authorityKindRef: input.authorityKindRef,
    disposition: input.disposition,
    fallbackPreconditionRefs
  });
}

export function constructAssetSurface(input: AssetSurfaceInit): AssetSurface {
  const authoritySlots = Object.freeze(
    (input.authoritySlots ?? []).map((slot, index) =>
      constructAssetSurfaceAuthoritySlot(slot, `AssetSurface.authoritySlots[${index}]`)
    )
  );
  return Object.freeze({
    kind: input.kind,
    requiredContexts: freezeOptionalStrings(input.requiredContexts),
    standardsRefs: freezeOptionalStrings(input.standardsRefs),
    outputContractRefs: freezeOptionalStrings(input.outputContractRefs),
    constructorRefs: freezeOptionalStrings(input.constructorRefs),
    constructorInputAssetKinds: freezeOptionalStrings(input.constructorInputAssetKinds),
    rendererRefs: freezeOptionalStrings(input.rendererRefs),
    renderedViewDigestPolicyRef: input.renderedViewDigestPolicyRef ?? null,
    sectionKindRefs: freezeOptionalStrings(input.sectionKindRefs),
    clauseKindRefs: freezeOptionalStrings(input.clauseKindRefs),
    authoritySlots,
    proofObligationRefs: freezeOptionalStrings(input.proofObligationRefs)
  });
}

function sameOrderedContract(left: readonly Node[], right: readonly Node[]): boolean {
  return JSON.stringify(interfaceContract(left)) === JSON.stringify(interfaceContract(right));
}

function canonicalSerializedJsonValue(value: SerializedJsonValue): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (value.kind === "array") {
    return {
      kind: "array",
      items: value.items.map(canonicalSerializedJsonValue)
    };
  }

  return {
    kind: "object",
    entries: value.entries.map((entry) => ({
      key: entry.key,
      value: canonicalSerializedJsonValue(entry.value)
    }))
  };
}

function canonicalSerializedAttrValue(value: SerializedAttrValue): unknown {
  if (value.kind === "scalar") {
    return {
      kind: "scalar",
      value: value.value
    };
  }

  if (value.kind === "string_list") {
    return {
      kind: "string_list",
      value: [...value.value]
    };
  }

  if (value.kind === "hook_ref") {
    return {
      kind: "hook_ref",
      value: {
        ref: value.value.ref,
        config: canonicalSerializedAttrs(value.value.config)
      }
    };
  }

  return {
    kind: "json_blob",
    value: canonicalSerializedJsonValue(value.value)
  };
}

function canonicalSerializedAttrs(attrs: SerializedAttrs): unknown {
  return {
    entries: attrs.entries.map((entry) => ({
      key: entry.key,
      value: canonicalSerializedAttrValue(entry.value)
    }))
  };
}

function canonicalContext(context: Context): unknown {
  return {
    name: context.name,
    locator: context.locator,
    digest: context.digest
  };
}

function canonicalNodeCore(node: NodeInit) {
  const assetSurface = constructAssetSurface(node.assetSurface);
  return {
    name: node.name,
    schema: {
      kind: node.schema.kind,
      ref: node.schema.ref
    },
    markov: [...node.markov],
    assetSurface: canonicalAssetSurface(assetSurface),
    tags: [...node.tags]
  };
}

function canonicalAssetSurface(assetSurfaceInput: AssetSurface | AssetSurfaceInit): unknown {
  const assetSurface = constructAssetSurface(assetSurfaceInput);
  return {
    kind: assetSurface.kind,
    requiredContexts: [...assetSurface.requiredContexts],
    standardsRefs: [...assetSurface.standardsRefs],
    outputContractRefs: [...assetSurface.outputContractRefs],
    constructorRefs: [...assetSurface.constructorRefs],
    constructorInputAssetKinds: [...assetSurface.constructorInputAssetKinds],
    rendererRefs: [...assetSurface.rendererRefs],
    renderedViewDigestPolicyRef: assetSurface.renderedViewDigestPolicyRef,
    sectionKindRefs: [...assetSurface.sectionKindRefs],
    clauseKindRefs: [...assetSurface.clauseKindRefs],
    authoritySlots: assetSurface.authoritySlots.map((slot) => ({
      authorityKindRef: slot.authorityKindRef,
      disposition: slot.disposition,
      fallbackPreconditionRefs: [...slot.fallbackPreconditionRefs]
    })),
    proofObligationRefs: [...assetSurface.proofObligationRefs]
  };
}

function canonicalNode(node: Node): unknown {
  return {
    name: node.name,
    schema: {
      kind: node.schema.kind,
      ref: node.schema.ref
    },
    markov: [...node.markov],
    assetSurface: canonicalAssetSurface(node.assetSurface),
    tags: [...node.tags],
    id: node.id
  };
}

function canonicalGraphVector(vector: GraphVector): unknown {
  return {
    name: vector.name,
    source: vector.source.map(canonicalNode),
    target: canonicalNode(vector.target),
    operators: vector.operators.map((operator) => ({
      name: operator.name,
      regime: operator.regime,
      binding: operator.binding,
      tags: [...operator.tags]
    })),
    evaluators: vector.evaluators.map((evaluator) => ({
      name: evaluator.name,
      regime: evaluator.regime,
      description: evaluator.description,
      binding: evaluator.binding,
      consumedFieldRefs: [...(evaluator.consumedFieldRefs ?? [])],
      tags: [...evaluator.tags]
    })),
    contexts: vector.contexts.map(canonicalContext),
    rule:
      vector.rule === null
        ? null
        : {
            name: vector.rule.name,
            kind: vector.rule.kind,
            config: canonicalSerializedAttrs(vector.rule.config),
            tags: [...vector.rule.tags]
          },
    allowsSubwork: vector.allowsSubwork,
    declarations: canonicalSerializedAttrs(vector.declarations),
    tags: [...vector.tags],
    id: vector.id
  };
}

function canonicalGraph(graph: Graph): unknown {
  return {
    name: graph.name,
    inputs: graph.inputs.map(canonicalNode),
    outputs: graph.outputs.map(canonicalNode),
    nodes: graph.nodes.map(canonicalNode),
    vectors: graph.vectors.map(canonicalGraphVector),
    contexts: graph.contexts.map(canonicalContext),
    rules: graph.rules.map((rule) => ({
      name: rule.name,
      kind: rule.kind,
      config: canonicalSerializedAttrs(rule.config),
      tags: [...rule.tags]
    })),
    effects: [...graph.effects],
    tags: [...graph.tags]
  };
}

function canonicalTemplateRef(template: TemplateRef): unknown {
  if (template.kind === "inline_graph") {
    return {
      kind: "inline_graph",
      ref: template.ref,
      graph: canonicalGraph(template.graph),
      version: null
    };
  }

  return {
    kind: "symbolic",
    ref: template.ref,
    graph: null,
    version: template.version
  };
}

function deriveIdentity(prefix: string, payload: unknown): string {
  return `${prefix}:${JSON.stringify(payload)}`;
}

export function emptySerializedAttrs(): SerializedAttrs {
  return EMPTY_SERIALIZED_ATTRS;
}

export function constructNode(input: NodeInit): Node {
  const assetSurface = constructAssetSurface(input.assetSurface);
  const node = Object.freeze({
    name: input.name,
    schema: Object.freeze({
      kind: input.schema.kind,
      ref: input.schema.ref
    }),
    markov: freezeStrings(input.markov),
    assetSurface,
    tags: freezeStrings(input.tags),
    id: input.id ?? deriveIdentity("node", canonicalNodeCore(input))
  });

  return node;
}

export function constructGraphVector(input: GraphVectorInit): GraphVector {
  if (input.source.length === 0) {
    throw new TypeError("GraphVector.source: expected at least one source node");
  }

  const vector = Object.freeze({
    name: input.name,
    source: freezeNodes(input.source),
    target: input.target,
    operators: Object.freeze([...input.operators]),
    evaluators: Object.freeze(
      input.evaluators.map((evaluator) =>
        Object.freeze({
          name: evaluator.name,
          regime: evaluator.regime,
          description: evaluator.description,
          binding: evaluator.binding,
          consumedFieldRefs: freezeStrings(evaluator.consumedFieldRefs ?? []),
          tags: freezeStrings(evaluator.tags)
        })
      )
    ),
    contexts: freezeContexts(input.contexts),
    rule: input.rule,
    allowsSubwork: input.allowsSubwork,
    declarations: freezeSerializedAttrs(input.declarations),
    tags: freezeStrings(input.tags),
    id:
      input.id ??
      deriveIdentity("graph_vector", {
        name: input.name,
        source: input.source.map(canonicalNode),
        target: canonicalNode(input.target),
        operators: input.operators.map((operator) => ({
          name: operator.name,
          regime: operator.regime,
          binding: operator.binding,
          tags: [...operator.tags]
        })),
        evaluators: input.evaluators.map((evaluator) => ({
          name: evaluator.name,
          regime: evaluator.regime,
          description: evaluator.description,
          binding: evaluator.binding,
          consumedFieldRefs: [...(evaluator.consumedFieldRefs ?? [])],
          tags: [...evaluator.tags]
        })),
        contexts: input.contexts.map(canonicalContext),
        rule:
          input.rule === null
            ? null
            : {
                name: input.rule.name,
                kind: input.rule.kind,
                config: canonicalSerializedAttrs(input.rule.config),
                tags: [...input.rule.tags]
              },
        allowsSubwork: input.allowsSubwork,
        declarations: canonicalSerializedAttrs(input.declarations),
        tags: [...input.tags]
      })
  });

  return vector;
}

export function constructGraph(input: GraphInit): Graph {
  const graph = Object.freeze({
    name: input.name,
    inputs: freezeNodes(input.inputs),
    outputs: freezeNodes(input.outputs),
    nodes: freezeNodes(input.nodes),
    vectors: Object.freeze([...input.vectors]),
    contexts: freezeContexts(input.contexts),
    rules: Object.freeze([...input.rules]),
    effects: freezeStrings(input.effects),
    tags: freezeStrings(input.tags),
    id: input.id ?? deriveIdentity("graph", canonicalGraph({
      name: input.name,
      inputs: freezeNodes(input.inputs),
      outputs: freezeNodes(input.outputs),
      nodes: freezeNodes(input.nodes),
      vectors: Object.freeze([...input.vectors]),
      contexts: freezeContexts(input.contexts),
      rules: Object.freeze([...input.rules]),
      effects: freezeStrings(input.effects),
      tags: freezeStrings(input.tags),
      id: ""
    }))
  });

  return graph;
}

export function constructEnvRef(input: EnvRefInit): EnvRef {
  const requires = freezeNodes(input.requires);
  const provides = freezeNodes(input.provides);
  const carries = freezeNodes(input.carries);
  const carryContracts = new Set(interfaceContract(carries));

  for (const contract of interfaceContract(requires)) {
    if (!carryContracts.has(contract)) {
      throw new TypeError("EnvRef.carries: missing required environment contract");
    }
  }

  for (const contract of interfaceContract(provides)) {
    if (!carryContracts.has(contract)) {
      throw new TypeError("EnvRef.carries: missing provided environment contract");
    }
  }

  return Object.freeze({
    requires,
    provides,
    carries
  });
}

export function constructTemplateRef(input: TemplateRefInit): TemplateRef {
  if (input.kind === "inline_graph") {
    return Object.freeze({
      kind: "inline_graph",
      ref: input.ref,
      graph: input.graph,
      version: null
    });
  }

  return Object.freeze({
    kind: "symbolic",
    ref: input.ref,
    graph: null,
    version: input.version
  });
}

export function constructGraphFunction(input: GraphFunctionInit): GraphFunction {
  if (!sameOrderedContract(input.environment.requires, input.inputs)) {
    throw new TypeError("GraphFunction.inputs: must match environment.requires");
  }

  const providedContracts = new Set(interfaceContract(input.environment.provides));
  for (const contract of interfaceContract(input.outputs)) {
    if (!providedContracts.has(contract)) {
      throw new TypeError(
        "GraphFunction.outputs: must be represented in environment.provides"
      );
    }
  }

  if (input.template.kind === "inline_graph") {
    if (!sameOrderedContract(input.template.graph.inputs, input.inputs)) {
      throw new TypeError(
        "GraphFunction.template.graph.inputs: must preserve outer contract"
      );
    }
    if (!sameOrderedContract(input.template.graph.outputs, input.outputs)) {
      throw new TypeError(
        "GraphFunction.template.graph.outputs: must preserve outer contract"
      );
    }
  }

  const graphFunction = Object.freeze({
    name: input.name,
    environment: input.environment,
    inputs: freezeNodes(input.inputs),
    outputs: freezeNodes(input.outputs),
    template: input.template,
    effects: freezeStrings(input.effects),
    declarations: freezeSerializedAttrs(input.declarations),
    tags: freezeStrings(input.tags),
    id:
      input.id ??
      deriveIdentity("graph_function", {
        name: input.name,
        environment: {
          requires: input.environment.requires.map(canonicalNode),
          provides: input.environment.provides.map(canonicalNode),
          carries: input.environment.carries.map(canonicalNode)
        },
        inputs: input.inputs.map(canonicalNode),
        outputs: input.outputs.map(canonicalNode),
        template: canonicalTemplateRef(input.template),
        effects: [...input.effects],
        declarations: canonicalSerializedAttrs(input.declarations),
        tags: [...input.tags]
      })
  });

  return graphFunction;
}
