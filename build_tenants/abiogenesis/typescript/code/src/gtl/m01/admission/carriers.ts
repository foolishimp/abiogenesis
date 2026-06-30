// Implements: REQ-L-GTL3-ATTRS
// Implements: REQ-L-GTL3-CONTEXT
// Implements: REQ-L-GTL3-ASSET-SURFACE
// Implements: REQ-L-GTL3-NODE
// Implements: REQ-L-GTL3-GRAPHVECTOR
// Implements: REQ-L-GTL3-GRAPH
// Implements: REQ-L-GTL3-GRAPHFUNCTION

import {
  constructAssetSurface,
  constructEnvRef,
  constructGraph,
  constructGraphFunction,
  constructGraphVector,
  constructNode,
  constructTemplateRef
} from "../contracts/constructors.js";
import {
  ASSET_SURFACE_AUTHORITY_SLOT_DISPOSITIONS,
  type AssetSurface,
  type AssetSurfaceAuthoritySlotDisposition,
  type Context,
  type EnvRef,
  type Evaluator,
  type Graph,
  type GraphFunction,
  type GraphVector,
  type HookRef,
  type Node,
  type Operator,
  type Regime,
  type Rule,
  type SchemaRef,
  type SerializedAttrEntry,
  type SerializedAttrs,
  type SerializedAttrValue,
  type SerializedJsonValue,
  type SerializedScalar,
  type TemplateRef
} from "../contracts/carriers.js";
import {
  parseBoolean,
  parseNonEmptyString,
  parseNullableString,
  parseOptionalField,
  parsePlainObject,
  parseString,
  parseStringArray,
  parseUnknownArray
} from "../../../shared/validation/primitives.js";

const CONTEXT_SCHEMES = ["git://", "workspace://", "event://", "registry://"];

function isAssetSurfaceAuthoritySlotDisposition(
  value: string
): value is AssetSurfaceAuthoritySlotDisposition {
  return ASSET_SURFACE_AUTHORITY_SLOT_DISPOSITIONS.some(
    (disposition) => disposition === value
  );
}

function parseOptionalId(input: unknown, label: string): string | undefined {
  if (input === undefined) {
    return undefined;
  }
  return parseNonEmptyString(input, `${label}.id`);
}

function admitsKnownContextScheme(locator: string): boolean {
  return CONTEXT_SCHEMES.some((scheme) => locator.startsWith(scheme));
}

function admitSerializedScalar(input: unknown, label: string): SerializedScalar {
  if (
    input === null ||
    typeof input === "string" ||
    typeof input === "number" ||
    typeof input === "boolean"
  ) {
    return input;
  }
  throw new TypeError(`${label}: expected a serialized scalar`);
}

export function admitSerializedJsonValue(
  input: unknown,
  label = "SerializedJsonValue"
): SerializedJsonValue {
  if (
    input === null ||
    typeof input === "string" ||
    typeof input === "number" ||
    typeof input === "boolean"
  ) {
    return admitSerializedScalar(input, label);
  }

  const valueObject = parsePlainObject(input, label);
  const kind = parseString(valueObject["kind"], `${label}.kind`);

  if (kind === "array") {
    const itemsInput = parseUnknownArray(valueObject["items"], `${label}.items`);
    const items = Object.freeze(
      itemsInput.map((item, index) =>
        admitSerializedJsonValue(item, `${label}.items[${index}]`)
      )
    );
    return Object.freeze({
      kind: "array",
      items
    });
  }

  if (kind === "object") {
    const entriesInput = parseUnknownArray(valueObject["entries"], `${label}.entries`);
    const entries = Object.freeze(
      entriesInput.map((entryInput, index) => {
        const entryObject = parsePlainObject(
          entryInput,
          `${label}.entries[${index}]`
        );
        return Object.freeze({
          key: parseNonEmptyString(entryObject["key"], `${label}.entries[${index}].key`),
          value: admitSerializedJsonValue(
            entryObject["value"],
            `${label}.entries[${index}].value`
          )
        });
      })
    );
    return Object.freeze({
      kind: "object",
      entries
    });
  }

  throw new TypeError(`${label}.kind: unsupported serialized json kind ${kind}`);
}

export function admitHookRef(input: unknown, label = "HookRef"): HookRef {
  const hookObject = parsePlainObject(input, label);
  return Object.freeze({
    ref: parseNonEmptyString(hookObject["ref"], `${label}.ref`),
    config: admitSerializedAttrs(hookObject["config"], `${label}.config`)
  });
}

export function admitSerializedAttrValue(
  input: unknown,
  label = "SerializedAttrValue"
): SerializedAttrValue {
  const valueObject = parsePlainObject(input, label);
  const kind = parseString(valueObject["kind"], `${label}.kind`);

  if (kind === "scalar") {
    return Object.freeze({
      kind: "scalar",
      value: admitSerializedScalar(valueObject["value"], `${label}.value`)
    });
  }

  if (kind === "string_list") {
    return Object.freeze({
      kind: "string_list",
      value: parseStringArray(valueObject["value"], `${label}.value`)
    });
  }

  if (kind === "hook_ref") {
    return Object.freeze({
      kind: "hook_ref",
      value: admitHookRef(valueObject["value"], `${label}.value`)
    });
  }

  if (kind === "json_blob") {
    return Object.freeze({
      kind: "json_blob",
      value: admitSerializedJsonValue(valueObject["value"], `${label}.value`)
    });
  }

  throw new TypeError(`${label}.kind: unsupported serialized attr value kind ${kind}`);
}

export function admitSerializedAttrEntry(
  input: unknown,
  label = "SerializedAttrEntry"
): SerializedAttrEntry {
  const entryObject = parsePlainObject(input, label);
  return Object.freeze({
    key: parseNonEmptyString(entryObject["key"], `${label}.key`),
    value: admitSerializedAttrValue(entryObject["value"], `${label}.value`)
  });
}

export function admitSerializedAttrs(
  input: unknown,
  label = "SerializedAttrs"
): SerializedAttrs {
  const attrsObject = parsePlainObject(input, label);
  const entriesInput = parseUnknownArray(attrsObject["entries"], `${label}.entries`);
  const entries = Object.freeze(
    entriesInput.map((entryInput, index) =>
      admitSerializedAttrEntry(entryInput, `${label}.entries[${index}]`)
    )
  );
  return Object.freeze({ entries });
}

export function admitContext(input: unknown, label = "Context"): Context {
  const contextObject = parsePlainObject(input, label);
  const locator = parseNonEmptyString(contextObject["locator"], `${label}.locator`);
  const digest = parseNonEmptyString(contextObject["digest"], `${label}.digest`);

  if (!digest.startsWith("sha256:")) {
    throw new TypeError(`${label}.digest: expected a sha256: digest`);
  }
  if (!admitsKnownContextScheme(locator)) {
    throw new TypeError(`${label}.locator: unsupported context locator scheme`);
  }

  return Object.freeze({
    name: parseNonEmptyString(contextObject["name"], `${label}.name`),
    locator,
    digest
  });
}

export function admitSchemaRef(input: unknown, label = "SchemaRef"): SchemaRef {
  const schemaObject = parsePlainObject(input, label);
  const kind = parseString(schemaObject["kind"], `${label}.kind`);
  const ref = parseString(schemaObject["ref"], `${label}.ref`);

  if (kind !== "symbolic" && kind !== "runtime_ref") {
    throw new TypeError(`${label}.kind: unsupported schema kind ${kind}`);
  }

  return Object.freeze({ kind, ref });
}

export function admitAssetSurface(
  input: unknown,
  label = "AssetSurface"
): AssetSurface {
  const assetObject = parsePlainObject(input, label);
  const authoritySlotsInput = parseUnknownArray(
    parseOptionalField(assetObject, "authoritySlots") ?? [],
    `${label}.authoritySlots`
  );
  return constructAssetSurface({
    kind: parseString(parseOptionalField(assetObject, "kind") ?? "", `${label}.kind`),
    requiredContexts: parseStringArray(
      parseOptionalField(assetObject, "requiredContexts") ?? [],
      `${label}.requiredContexts`
    ),
    standardsRefs: parseStringArray(
      parseOptionalField(assetObject, "standardsRefs") ?? [],
      `${label}.standardsRefs`
    ),
    outputContractRefs: parseStringArray(
      parseOptionalField(assetObject, "outputContractRefs") ?? [],
      `${label}.outputContractRefs`
    ),
    constructorRefs: parseStringArray(
      parseOptionalField(assetObject, "constructorRefs") ?? [],
      `${label}.constructorRefs`
    ),
    constructorInputAssetKinds: parseStringArray(
      parseOptionalField(assetObject, "constructorInputAssetKinds") ?? [],
      `${label}.constructorInputAssetKinds`
    ),
    rendererRefs: parseStringArray(
      parseOptionalField(assetObject, "rendererRefs") ?? [],
      `${label}.rendererRefs`
    ),
    renderedViewDigestPolicyRef: parseNullableString(
      parseOptionalField(assetObject, "renderedViewDigestPolicyRef") ?? null,
      `${label}.renderedViewDigestPolicyRef`
    ),
    sectionKindRefs: parseStringArray(
      parseOptionalField(assetObject, "sectionKindRefs") ?? [],
      `${label}.sectionKindRefs`
    ),
    clauseKindRefs: parseStringArray(
      parseOptionalField(assetObject, "clauseKindRefs") ?? [],
      `${label}.clauseKindRefs`
    ),
    authoritySlots: Object.freeze(
      authoritySlotsInput.map((slotInput, index) => {
        const slotObject = parsePlainObject(
          slotInput,
          `${label}.authoritySlots[${index}]`
        );
        const disposition = parseString(
          slotObject["disposition"],
          `${label}.authoritySlots[${index}].disposition`
        );
        if (!isAssetSurfaceAuthoritySlotDisposition(disposition)) {
          throw new TypeError(
            `${label}.authoritySlots[${index}].disposition: unsupported asset-surface authority slot disposition ${disposition}`
          );
        }
        return Object.freeze({
          authorityKindRef: parseNonEmptyString(
            slotObject["authorityKindRef"],
            `${label}.authoritySlots[${index}].authorityKindRef`
          ),
          disposition,
          fallbackPreconditionRefs: parseStringArray(
            parseOptionalField(slotObject, "fallbackPreconditionRefs") ?? [],
            `${label}.authoritySlots[${index}].fallbackPreconditionRefs`
          )
        });
      })
    ),
    proofObligationRefs: parseStringArray(
      parseOptionalField(assetObject, "proofObligationRefs") ?? [],
      `${label}.proofObligationRefs`
    )
  });
}

export function admitNode(input: unknown, label = "Node"): Node {
  const nodeObject = parsePlainObject(input, label);
  return constructNode({
    name: parseNonEmptyString(nodeObject["name"], `${label}.name`),
    schema: admitSchemaRef(nodeObject["schema"], `${label}.schema`),
    typeRef: parseNullableString(
      parseOptionalField(nodeObject, "typeRef") ?? null,
      `${label}.typeRef`
    ),
    markov: parseStringArray(parseOptionalField(nodeObject, "markov") ?? [], `${label}.markov`),
    assetSurface: admitAssetSurface(nodeObject["assetSurface"], `${label}.assetSurface`),
    tags: parseStringArray(parseOptionalField(nodeObject, "tags") ?? [], `${label}.tags`),
    id: parseOptionalId(parseOptionalField(nodeObject, "id"), label)
  });
}

export function admitRegime(input: unknown, label = "Regime"): Regime {
  const regime = parseNonEmptyString(input, label);
  if (regime === "F_D") {
    return "F_D";
  }
  if (regime === "F_P") {
    return "F_P";
  }
  if (regime === "F_H") {
    return "F_H";
  }
  throw new TypeError(`${label}: unsupported regime ${regime}`);
}

export function admitOperator(input: unknown, label = "Operator"): Operator {
  const operatorObject = parsePlainObject(input, label);
  return Object.freeze({
    name: parseNonEmptyString(operatorObject["name"], `${label}.name`),
    regime: admitRegime(
      parseOptionalField(operatorObject, "regime") ?? "F_D",
      `${label}.regime`
    ),
    binding: parseString(
      parseOptionalField(operatorObject, "binding") ?? "",
      `${label}.binding`
    ),
    tags: parseStringArray(
      parseOptionalField(operatorObject, "tags") ?? [],
      `${label}.tags`
    )
  });
}

export function admitEvaluator(input: unknown, label = "Evaluator"): Evaluator {
  const evaluatorObject = parsePlainObject(input, label);
  return Object.freeze({
    name: parseNonEmptyString(evaluatorObject["name"], `${label}.name`),
    regime: admitRegime(
      parseOptionalField(evaluatorObject, "regime") ?? "F_D",
      `${label}.regime`
    ),
    description: parseString(
      parseOptionalField(evaluatorObject, "description") ?? "",
      `${label}.description`
    ),
    binding: parseString(
      parseOptionalField(evaluatorObject, "binding") ?? "",
      `${label}.binding`
    ),
    consumedFieldRefs: parseStringArray(
      parseOptionalField(evaluatorObject, "consumedFieldRefs") ?? [],
      `${label}.consumedFieldRefs`
    ),
    tags: parseStringArray(
      parseOptionalField(evaluatorObject, "tags") ?? [],
      `${label}.tags`
    )
  });
}

export function admitRule(input: unknown, label = "Rule"): Rule {
  const ruleObject = parsePlainObject(input, label);
  return Object.freeze({
    name: parseNonEmptyString(ruleObject["name"], `${label}.name`),
    kind: parseString(parseOptionalField(ruleObject, "kind") ?? "policy", `${label}.kind`),
    config: admitSerializedAttrs(
      parseOptionalField(ruleObject, "config") ?? { entries: [] },
      `${label}.config`
    ),
    tags: parseStringArray(
      parseOptionalField(ruleObject, "tags") ?? [],
      `${label}.tags`
    )
  });
}

function admitNodeArray(
  input: unknown,
  label: string
): readonly Node[] {
  const nodesInput = parseUnknownArray(input, label);
  return Object.freeze(
    nodesInput.map((item, index) => admitNode(item, `${label}[${index}]`))
  );
}

function admitNonEmptyNodeBoundary(
  input: unknown,
  label: string
): readonly Node[] {
  const source = admitNodeArray(input, label);
  if (source.length === 0) {
    throw new TypeError(`${label}: expected at least one source node`);
  }
  return source;
}

export function admitGraphVector(
  input: unknown,
  label = "GraphVector"
): GraphVector {
  const vectorObject = parsePlainObject(input, label);
  return constructGraphVector({
    name: parseNonEmptyString(vectorObject["name"], `${label}.name`),
    source: admitNonEmptyNodeBoundary(vectorObject["source"], `${label}.source`),
    target: admitNode(vectorObject["target"], `${label}.target`),
    operators: Object.freeze(
      parseUnknownArray(parseOptionalField(vectorObject, "operators") ?? [], `${label}.operators`).map(
        (operatorInput, index) => admitOperator(operatorInput, `${label}.operators[${index}]`)
      )
    ),
    evaluators: Object.freeze(
      parseUnknownArray(parseOptionalField(vectorObject, "evaluators") ?? [], `${label}.evaluators`).map(
        (evaluatorInput, index) => admitEvaluator(evaluatorInput, `${label}.evaluators[${index}]`)
      )
    ),
    contexts: Object.freeze(
      parseUnknownArray(parseOptionalField(vectorObject, "contexts") ?? [], `${label}.contexts`).map(
        (contextInput, index) => admitContext(contextInput, `${label}.contexts[${index}]`)
      )
    ),
    rule:
      parseOptionalField(vectorObject, "rule") === undefined ||
      parseOptionalField(vectorObject, "rule") === null
        ? null
        : admitRule(vectorObject["rule"], `${label}.rule`),
    allowsSubwork: parseBoolean(
      parseOptionalField(vectorObject, "allowsSubwork") ?? false,
      `${label}.allowsSubwork`
    ),
    declarations: admitSerializedAttrs(
      parseOptionalField(vectorObject, "declarations") ?? { entries: [] },
      `${label}.declarations`
    ),
    tags: parseStringArray(parseOptionalField(vectorObject, "tags") ?? [], `${label}.tags`),
    id: parseOptionalId(parseOptionalField(vectorObject, "id"), label)
  });
}

export function admitGraph(input: unknown, label = "Graph"): Graph {
  const graphObject = parsePlainObject(input, label);
  return constructGraph({
    name: parseNonEmptyString(graphObject["name"], `${label}.name`),
    inputs: admitNodeArray(parseOptionalField(graphObject, "inputs") ?? [], `${label}.inputs`),
    outputs: admitNodeArray(parseOptionalField(graphObject, "outputs") ?? [], `${label}.outputs`),
    nodes: admitNodeArray(parseOptionalField(graphObject, "nodes") ?? [], `${label}.nodes`),
    vectors: Object.freeze(
      parseUnknownArray(parseOptionalField(graphObject, "vectors") ?? [], `${label}.vectors`).map(
        (vectorInput, index) => admitGraphVector(vectorInput, `${label}.vectors[${index}]`)
      )
    ),
    contexts: Object.freeze(
      parseUnknownArray(parseOptionalField(graphObject, "contexts") ?? [], `${label}.contexts`).map(
        (contextInput, index) => admitContext(contextInput, `${label}.contexts[${index}]`)
      )
    ),
    rules: Object.freeze(
      parseUnknownArray(parseOptionalField(graphObject, "rules") ?? [], `${label}.rules`).map(
        (ruleInput, index) => admitRule(ruleInput, `${label}.rules[${index}]`)
      )
    ),
    effects: parseStringArray(parseOptionalField(graphObject, "effects") ?? [], `${label}.effects`),
    tags: parseStringArray(parseOptionalField(graphObject, "tags") ?? [], `${label}.tags`),
    id: parseOptionalId(parseOptionalField(graphObject, "id"), label)
  });
}

export function admitEnvRef(input: unknown, label = "EnvRef"): EnvRef {
  const environmentObject = parsePlainObject(input, label);
  return constructEnvRef({
    requires: admitNodeArray(environmentObject["requires"], `${label}.requires`),
    provides: admitNodeArray(environmentObject["provides"], `${label}.provides`),
    carries: admitNodeArray(environmentObject["carries"], `${label}.carries`)
  });
}

export function admitTemplateRef(
  input: unknown,
  label = "TemplateRef"
): TemplateRef {
  const templateObject = parsePlainObject(input, label);
  const kind = parseString(templateObject["kind"], `${label}.kind`);
  const ref = parseNonEmptyString(templateObject["ref"], `${label}.ref`);

  if (kind === "inline_graph") {
    return constructTemplateRef({
      kind: "inline_graph",
      ref,
      graph: admitGraph(templateObject["graph"], `${label}.graph`),
      version: null
    });
  }

  if (kind === "symbolic") {
    return constructTemplateRef({
      kind: "symbolic",
      ref,
      graph: null,
      version: parseNullableString(
        parseOptionalField(templateObject, "version") ?? null,
        `${label}.version`
      )
    });
  }

  throw new TypeError(`${label}.kind: unsupported template kind ${kind}`);
}

export function admitGraphFunction(
  input: unknown,
  label = "GraphFunction"
): GraphFunction {
  const functionObject = parsePlainObject(input, label);
  const name = parseNonEmptyString(functionObject["name"], `${label}.name`);
  const environment = admitEnvRef(functionObject["environment"], `${label}.environment`);
  const inputs = admitNodeArray(parseOptionalField(functionObject, "inputs") ?? [], `${label}.inputs`);
  const outputs = admitNodeArray(parseOptionalField(functionObject, "outputs") ?? [], `${label}.outputs`);
  const template = admitTemplateRef(functionObject["template"], `${label}.template`);

  return constructGraphFunction({
    name,
    environment,
    inputs,
    outputs,
    template,
    effects: parseStringArray(parseOptionalField(functionObject, "effects") ?? [], `${label}.effects`),
    declarations: admitSerializedAttrs(
      parseOptionalField(functionObject, "declarations") ?? { entries: [] },
      `${label}.declarations`
    ),
    tags: parseStringArray(parseOptionalField(functionObject, "tags") ?? [], `${label}.tags`),
    id: parseOptionalId(parseOptionalField(functionObject, "id"), label)
  });
}
