import {
  type AssetSurface,
  type Context,
  type EnvRef,
  type Evaluator,
  type Graph,
  type GraphFunction,
  type GraphVector,
  type HookRef,
  type Node,
  type Operator,
  type Rule,
  type SchemaRef,
  type SerializedAttrEntry,
  type SerializedAttrs,
  type SerializedAttrValue,
  type SerializedJsonValue,
  type TemplateRef
} from "../contracts/carriers.js";

export function serializeSerializedJsonValue(
  value: SerializedJsonValue
): SerializedJsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (value.kind === "array") {
    return Object.freeze({
      kind: "array",
      items: Object.freeze(value.items.map(serializeSerializedJsonValue))
    });
  }

  return Object.freeze({
    kind: "object",
    entries: Object.freeze(
      value.entries.map((entry) =>
        Object.freeze({
          key: entry.key,
          value: serializeSerializedJsonValue(entry.value)
        })
      )
    )
  });
}

export function serializeHookRef(hook: HookRef): HookRef {
  return Object.freeze({
    ref: hook.ref,
    config: serializeSerializedAttrs(hook.config)
  });
}

export function serializeSerializedAttrValue(
  value: SerializedAttrValue
): SerializedAttrValue {
  if (value.kind === "scalar") {
    return Object.freeze({
      kind: "scalar",
      value: value.value
    });
  }

  if (value.kind === "string_list") {
    return Object.freeze({
      kind: "string_list",
      value: Object.freeze([...value.value])
    });
  }

  if (value.kind === "hook_ref") {
    return Object.freeze({
      kind: "hook_ref",
      value: serializeHookRef(value.value)
    });
  }

  return Object.freeze({
    kind: "json_blob",
    value: serializeSerializedJsonValue(value.value)
  });
}

export function serializeSerializedAttrEntry(
  entry: SerializedAttrEntry
): SerializedAttrEntry {
  return Object.freeze({
    key: entry.key,
    value: serializeSerializedAttrValue(entry.value)
  });
}

export function serializeSerializedAttrs(attrs: SerializedAttrs): SerializedAttrs {
  return Object.freeze({
    entries: Object.freeze(attrs.entries.map(serializeSerializedAttrEntry))
  });
}

export function serializeContext(context: Context): Context {
  return Object.freeze({
    name: context.name,
    locator: context.locator,
    digest: context.digest
  });
}

export function serializeSchemaRef(schema: SchemaRef): SchemaRef {
  return Object.freeze({
    kind: schema.kind,
    ref: schema.ref
  });
}

export function serializeAssetSurface(surface: AssetSurface): AssetSurface {
  return Object.freeze({
    kind: surface.kind,
    requiredContexts: Object.freeze([...surface.requiredContexts]),
    standardsRefs: Object.freeze([...surface.standardsRefs]),
    outputContractRefs: Object.freeze([...surface.outputContractRefs])
  });
}

export function serializeNode(node: Node): Node {
  return Object.freeze({
    name: node.name,
    schema: serializeSchemaRef(node.schema),
    markov: Object.freeze([...node.markov]),
    assetSurface: serializeAssetSurface(node.assetSurface),
    tags: Object.freeze([...node.tags]),
    id: node.id
  });
}

export function serializeOperator(operator: Operator): Operator {
  return Object.freeze({
    name: operator.name,
    regime: operator.regime,
    binding: operator.binding,
    tags: Object.freeze([...operator.tags])
  });
}

export function serializeEvaluator(evaluator: Evaluator): Evaluator {
  return Object.freeze({
    name: evaluator.name,
    regime: evaluator.regime,
    description: evaluator.description,
    binding: evaluator.binding,
    tags: Object.freeze([...evaluator.tags])
  });
}

export function serializeRule(rule: Rule): Rule {
  return Object.freeze({
    name: rule.name,
    kind: rule.kind,
    config: serializeSerializedAttrs(rule.config),
    tags: Object.freeze([...rule.tags])
  });
}

export function serializeGraphVector(vector: GraphVector): GraphVector {
  return Object.freeze({
    name: vector.name,
    source: Object.freeze(vector.source.map(serializeNode)),
    target: serializeNode(vector.target),
    operators: Object.freeze(vector.operators.map(serializeOperator)),
    evaluators: Object.freeze(vector.evaluators.map(serializeEvaluator)),
    contexts: Object.freeze(vector.contexts.map(serializeContext)),
    rule: vector.rule === null ? null : serializeRule(vector.rule),
    allowsSubwork: vector.allowsSubwork,
    declarations: serializeSerializedAttrs(vector.declarations),
    tags: Object.freeze([...vector.tags]),
    id: vector.id
  });
}

export function serializeGraph(graph: Graph): Graph {
  return Object.freeze({
    name: graph.name,
    inputs: Object.freeze(graph.inputs.map(serializeNode)),
    outputs: Object.freeze(graph.outputs.map(serializeNode)),
    nodes: Object.freeze(graph.nodes.map(serializeNode)),
    vectors: Object.freeze(graph.vectors.map(serializeGraphVector)),
    contexts: Object.freeze(graph.contexts.map(serializeContext)),
    rules: Object.freeze(graph.rules.map(serializeRule)),
    effects: Object.freeze([...graph.effects]),
    tags: Object.freeze([...graph.tags]),
    id: graph.id
  });
}

export function serializeEnvRef(environment: EnvRef): EnvRef {
  return Object.freeze({
    requires: Object.freeze(environment.requires.map(serializeNode)),
    provides: Object.freeze(environment.provides.map(serializeNode)),
    carries: Object.freeze(environment.carries.map(serializeNode))
  });
}

export function serializeTemplateRef(template: TemplateRef): TemplateRef {
  if (template.kind === "inline_graph") {
    return Object.freeze({
      kind: "inline_graph",
      ref: template.ref,
      graph: serializeGraph(template.graph),
      version: null
    });
  }

  return Object.freeze({
    kind: "symbolic",
    ref: template.ref,
    graph: null,
    version: template.version
  });
}

export function serializeGraphFunction(
  graphFunction: GraphFunction
): GraphFunction {
  return Object.freeze({
    name: graphFunction.name,
    environment: serializeEnvRef(graphFunction.environment),
    inputs: Object.freeze(graphFunction.inputs.map(serializeNode)),
    outputs: Object.freeze(graphFunction.outputs.map(serializeNode)),
    template: serializeTemplateRef(graphFunction.template),
    effects: Object.freeze([...graphFunction.effects]),
    declarations: serializeSerializedAttrs(graphFunction.declarations),
    tags: Object.freeze([...graphFunction.tags]),
    id: graphFunction.id
  });
}
