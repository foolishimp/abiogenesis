// Implements: REQ-L-GTL3-GRAPHFUNCTION-004/-006/-007/-009/-011/-012.
// Implements: REQ-L-GTL3-HOF-002/-003/-005/-006.
// Implements: REQ-L-GTL3-RECURSE-001..008.

import { createHash } from "node:crypto";

import {
  isAdmittedGraphFunction,
  nodeContractKey,
  type Evaluator,
  type GraphFunction,
  type Node,
  type Rule,
  type SerializedAttrEntry,
  type SerializedAttrs,
  type SerializedAttrValue,
  type SerializedJsonValue,
  type SerializedScalar
} from "./carriers.js";

export const GRAPH_FUNCTION_APPLICATION_DECLARATION_KEY =
  "gtl.graph_function_application" as const;
export const GRAPH_FUNCTION_APPLICATION_SYNTAX_VERSION =
  "gtl-graph-function-application/1" as const;

export const GRAPH_FUNCTION_APPLICATION_OPERATOR_KINDS = Object.freeze([
  "recurse",
  "fan_in",
  "gate"
] as const);

export type GraphFunctionApplicationOperatorKind =
  (typeof GRAPH_FUNCTION_APPLICATION_OPERATOR_KINDS)[number];

const COMMON_PREFIX_FIELD_ORDER = Object.freeze([
  "syntax_version",
  "application_ref",
  "operator_kind",
  "operand_graph_function_ref"
] as const);

export const GRAPH_FUNCTION_APPLICATION_FIELD_ORDER = Object.freeze({
  recurse: Object.freeze([
    ...COMMON_PREFIX_FIELD_ORDER,
    "termination_evaluator",
    "foldback"
  ] as const),
  fan_in: Object.freeze([
    ...COMMON_PREFIX_FIELD_ORDER,
    "over_vector_node_ref",
    "over_vector_contract_key"
  ] as const),
  gate: Object.freeze([
    ...COMMON_PREFIX_FIELD_ORDER,
    "rule",
    "evaluators"
  ] as const)
});

const EVALUATOR_FIELD_ORDER = Object.freeze([
  "name",
  "regime",
  "description",
  "binding",
  "consumed_field_refs",
  "tags"
] as const);

const RULE_FIELD_ORDER = Object.freeze([
  "name",
  "kind",
  "config",
  "tags"
] as const);

const FOLDBACK_FIELD_ORDER = Object.freeze([
  "mode",
  "binding",
  "requires_parent_evaluation",
  "additional"
] as const);

export interface CanonicalGraphFunctionFoldbackDeclaration {
  readonly mode: "rebind";
  readonly binding: string;
  readonly requiresParentEvaluation: true;
  readonly additional: SerializedAttrs;
}

export interface GraphFunctionFoldbackDeclarationInit {
  readonly mode: "rebind";
  readonly binding: string;
  readonly requiresParentEvaluation: boolean;
  readonly additional?: SerializedAttrs | undefined;
}

interface GraphFunctionApplicationDeclarationBase {
  readonly syntaxVersion: typeof GRAPH_FUNCTION_APPLICATION_SYNTAX_VERSION;
  readonly applicationRef: string;
  readonly operatorKind: GraphFunctionApplicationOperatorKind;
  readonly operandGraphFunctionRef: string;
}

export interface RecurseGraphFunctionApplicationDeclaration
  extends GraphFunctionApplicationDeclarationBase {
  readonly operatorKind: "recurse";
  readonly terminationEvaluator: Evaluator;
  readonly foldback: CanonicalGraphFunctionFoldbackDeclaration;
}

export interface FanInGraphFunctionApplicationDeclaration
  extends GraphFunctionApplicationDeclarationBase {
  readonly operatorKind: "fan_in";
  readonly overVectorNodeRef: string;
  readonly overVectorContractKey: string;
}

export interface GateGraphFunctionApplicationDeclaration
  extends GraphFunctionApplicationDeclarationBase {
  readonly operatorKind: "gate";
  readonly rule: Rule;
  readonly evaluators: readonly Evaluator[];
}

export type GraphFunctionApplicationDeclaration =
  | RecurseGraphFunctionApplicationDeclaration
  | FanInGraphFunctionApplicationDeclaration
  | GateGraphFunctionApplicationDeclaration;

export type GraphFunctionApplicationDeclarationInput =
  | {
      readonly operatorKind: "recurse";
      readonly operandGraphFunction: GraphFunction;
      readonly terminationEvaluator: Evaluator;
      readonly foldback: GraphFunctionFoldbackDeclarationInit;
    }
  | {
      readonly operatorKind: "fan_in";
      readonly operandGraphFunction: GraphFunction;
      readonly overVectorNode: Node;
    }
  | {
      readonly operatorKind: "gate";
      readonly operandGraphFunction: GraphFunction;
      readonly rule: Rule;
      readonly evaluators: readonly Evaluator[];
    };

export interface GraphFunctionApplicationDeclarationEntry
  extends SerializedAttrEntry {
  readonly key: typeof GRAPH_FUNCTION_APPLICATION_DECLARATION_KEY;
  readonly value: {
    readonly kind: "json_blob";
    readonly value: SerializedJsonValue;
  };
}

export type GraphFunctionApplicationAdmissionDiagnosticId =
  | "gtl-application-missing-field"
  | "gtl-application-unknown-field"
  | "gtl-application-duplicate-authority"
  | "gtl-application-invalid-operator"
  | "gtl-application-identity-mismatch"
  | "gtl-application-contract-mismatch";

export class GraphFunctionApplicationAdmissionError extends TypeError {
  public readonly diagnosticId: GraphFunctionApplicationAdmissionDiagnosticId;
  public readonly path: string;

  public constructor(input: {
    readonly diagnosticId: GraphFunctionApplicationAdmissionDiagnosticId;
    readonly path: string;
    readonly message: string;
  }) {
    super(`${input.diagnosticId}: ${input.path}: ${input.message}`);
    this.name = "GraphFunctionApplicationAdmissionError";
    this.diagnosticId = input.diagnosticId;
    this.path = input.path;
  }
}

type TaggedObjectEntry = Readonly<{
  key: string;
  value: SerializedJsonValue;
}>;

type TaggedObject = Readonly<{
  kind: "object";
  entries: readonly TaggedObjectEntry[];
}>;

function admissionError(
  diagnosticId: GraphFunctionApplicationAdmissionDiagnosticId,
  path: string,
  message: string
): never {
  throw new GraphFunctionApplicationAdmissionError({
    diagnosticId,
    path,
    message
  });
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertOwnKeyOrder(
  value: Readonly<Record<string, unknown>>,
  expected: readonly string[],
  label: string
): void {
  const actual = Object.keys(value);
  if (actual.length !== expected.length) {
    for (const key of actual) {
      if (!expected.includes(key)) {
        admissionError(
          "gtl-application-unknown-field",
          `${label}.${key}`,
          "field is not admitted"
        );
      }
    }
    for (const key of expected) {
      if (!Object.hasOwn(value, key)) {
        admissionError(
          "gtl-application-missing-field",
          `${label}.${key}`,
          "required field is absent"
        );
      }
    }
  }
  if (actual.some((key, index) => key !== expected[index])) {
    admissionError(
      "gtl-application-contract-mismatch",
      label,
      `expected exact field order ${expected.join(",")}`
    );
  }
}

function taggedObject(entries: readonly TaggedObjectEntry[]): TaggedObject {
  return Object.freeze({
    kind: "object",
    entries: Object.freeze(
      entries.map((entry) =>
        Object.freeze({ key: entry.key, value: entry.value })
      )
    )
  });
}

function taggedArray(
  items: readonly SerializedJsonValue[]
): SerializedJsonValue {
  return Object.freeze({
    kind: "array",
    items: Object.freeze([...items])
  });
}

function nonEmptyString(value: unknown, path: string): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value !== value.trim()
  ) {
    return admissionError(
      "gtl-application-contract-mismatch",
      path,
      "expected a canonical non-empty string"
    );
  }
  return value;
}

function stringValue(value: unknown, path: string): string {
  if (typeof value !== "string") {
    return admissionError(
      "gtl-application-contract-mismatch",
      path,
      "expected a string"
    );
  }
  return value;
}

function stringArray(
  value: unknown,
  path: string
): readonly string[] {
  if (!Array.isArray(value)) {
    return admissionError(
      "gtl-application-contract-mismatch",
      path,
      "expected an array of canonical non-empty strings"
    );
  }
  return Object.freeze(
    value.map((item, index) => nonEmptyString(item, `${path}[${index}]`))
  );
}

function canonicalSerializedJsonValue(
  value: unknown,
  path: string
): SerializedJsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return admissionError(
        "gtl-application-contract-mismatch",
        path,
        "expected a finite serialized number"
      );
    }
    return value;
  }
  if (!isRecord(value)) {
    return admissionError(
      "gtl-application-contract-mismatch",
      path,
      "expected a canonical serialized JSON value"
    );
  }
  const kind = value["kind"];
  if (kind === "array") {
    assertOwnKeyOrder(value, ["kind", "items"], path);
    const items = value["items"];
    if (!Array.isArray(items)) {
      return admissionError(
        "gtl-application-contract-mismatch",
        `${path}.items`,
        "expected an array"
      );
    }
    return taggedArray(
      items.map((item, index) =>
        canonicalSerializedJsonValue(item, `${path}.items[${index}]`)
      )
    );
  }
  if (kind !== "object") {
    return admissionError(
      "gtl-application-contract-mismatch",
      `${path}.kind`,
      "expected object or array"
    );
  }
  return taggedObject(readTaggedEntries(value, path));
}

function readTaggedEntries(
  input: unknown,
  label: string
): readonly TaggedObjectEntry[] {
  if (!isRecord(input)) {
    return admissionError(
      "gtl-application-contract-mismatch",
      label,
      "expected a tagged object"
    );
  }
  assertOwnKeyOrder(input, ["kind", "entries"], label);
  if (input["kind"] !== "object" || !Array.isArray(input["entries"])) {
    return admissionError(
      "gtl-application-contract-mismatch",
      label,
      "expected { kind: object, entries: [...] }"
    );
  }
  const seen = new Set<string>();
  return Object.freeze(
    input["entries"].map((candidate, index) => {
      const entryLabel = `${label}.entries[${index}]`;
      if (!isRecord(candidate)) {
        return admissionError(
          "gtl-application-contract-mismatch",
          entryLabel,
          "expected a tagged-object field entry"
        );
      }
      assertOwnKeyOrder(candidate, ["key", "value"], entryLabel);
      const key = nonEmptyString(candidate["key"], `${entryLabel}.key`);
      if (seen.has(key)) {
        return admissionError(
          "gtl-application-duplicate-authority",
          `${label}.${key}`,
          "field has more than one authority"
        );
      }
      seen.add(key);
      return Object.freeze({
        key,
        value: canonicalSerializedJsonValue(
          candidate["value"],
          `${entryLabel}.value`
        )
      });
    })
  );
}

function closedTaggedFields(
  input: unknown,
  expectedOrder: readonly string[],
  label: string
): ReadonlyMap<string, SerializedJsonValue> {
  const entries = readTaggedEntries(input, label);
  const expected = new Set(expectedOrder);
  for (const entry of entries) {
    if (!expected.has(entry.key)) {
      admissionError(
        "gtl-application-unknown-field",
        `${label}.${entry.key}`,
        "field is not admitted by this closed variant"
      );
    }
  }
  const present = new Set(entries.map((entry) => entry.key));
  for (const key of expectedOrder) {
    if (!present.has(key)) {
      admissionError(
        "gtl-application-missing-field",
        `${label}.${key}`,
        "required field is absent"
      );
    }
  }
  if (entries.some((entry, index) => entry.key !== expectedOrder[index])) {
    admissionError(
      "gtl-application-contract-mismatch",
      label,
      `expected exact field order ${expectedOrder.join(",")}`
    );
  }
  return new Map(entries.map((entry) => [entry.key, entry.value]));
}

function requiredField(
  fields: ReadonlyMap<string, SerializedJsonValue>,
  key: string,
  label: string
): SerializedJsonValue {
  const value = fields.get(key);
  return value === undefined
    ? admissionError(
        "gtl-application-missing-field",
        `${label}.${key}`,
        "required field is absent"
      )
    : value;
}

function canonicalSerializedAttrValue(
  value: unknown,
  path: string
): SerializedAttrValue {
  if (!isRecord(value)) {
    return admissionError(
      "gtl-application-contract-mismatch",
      path,
      "expected a serialized attribute value"
    );
  }
  assertOwnKeyOrder(value, ["kind", "value"], path);
  const kind = value["kind"];
  const raw = value["value"];
  if (kind === "scalar") {
    const scalar = canonicalSerializedJsonValue(raw, `${path}.value`);
    if (typeof scalar === "object" && scalar !== null) {
      return admissionError(
        "gtl-application-contract-mismatch",
        `${path}.value`,
        "expected a serialized scalar"
      );
    }
    return Object.freeze({ kind, value: scalar as SerializedScalar });
  }
  if (kind === "string_list") {
    return Object.freeze({
      kind,
      value: stringArray(raw, `${path}.value`)
    });
  }
  if (kind === "json_blob") {
    return Object.freeze({
      kind,
      value: canonicalSerializedJsonValue(raw, `${path}.value`)
    });
  }
  if (kind === "hook_ref") {
    if (!isRecord(raw)) {
      return admissionError(
        "gtl-application-contract-mismatch",
        `${path}.value`,
        "expected a hook-ref value"
      );
    }
    assertOwnKeyOrder(raw, ["ref", "config"], `${path}.value`);
    return Object.freeze({
      kind,
      value: Object.freeze({
        ref: nonEmptyString(raw["ref"], `${path}.value.ref`),
        config: canonicalSerializedAttrs(raw["config"], `${path}.value.config`)
      })
    });
  }
  return admissionError(
    "gtl-application-contract-mismatch",
    `${path}.kind`,
    "unsupported serialized attribute value kind"
  );
}

function canonicalSerializedAttrs(value: unknown, path: string): SerializedAttrs {
  if (!isRecord(value)) {
    return admissionError(
      "gtl-application-contract-mismatch",
      path,
      "expected serialized attributes"
    );
  }
  assertOwnKeyOrder(value, ["entries"], path);
  const entries = value["entries"];
  if (!Array.isArray(entries)) {
    return admissionError(
      "gtl-application-contract-mismatch",
      `${path}.entries`,
      "expected an array"
    );
  }
  const seen = new Set<string>();
  return Object.freeze({
    entries: Object.freeze(
      entries.map((entry, index) => {
        const entryPath = `${path}.entries[${index}]`;
        if (!isRecord(entry)) {
          return admissionError(
            "gtl-application-contract-mismatch",
            entryPath,
            "expected an attribute entry"
          );
        }
        assertOwnKeyOrder(entry, ["key", "value"], entryPath);
        const key = nonEmptyString(entry["key"], `${entryPath}.key`);
        if (seen.has(key)) {
          return admissionError(
            "gtl-application-duplicate-authority",
            `${path}.${key}`,
            "attribute key has more than one authority"
          );
        }
        seen.add(key);
        return Object.freeze({
          key,
          value: canonicalSerializedAttrValue(
            entry["value"],
            `${entryPath}.value`
          )
        });
      })
    )
  });
}

function serializedAttrValueJson(value: SerializedAttrValue): SerializedJsonValue {
  if (value.kind === "hook_ref") {
    return taggedObject([
      { key: "kind", value: value.kind },
      {
        key: "value",
        value: taggedObject([
          { key: "ref", value: value.value.ref },
          { key: "config", value: serializedAttrsJson(value.value.config) }
        ])
      }
    ]);
  }
  if (value.kind === "string_list") {
    return taggedObject([
      { key: "kind", value: value.kind },
      { key: "value", value: taggedArray(value.value) }
    ]);
  }
  return taggedObject([
    { key: "kind", value: value.kind },
    { key: "value", value: value.value }
  ]);
}

function serializedAttrsJson(attrs: SerializedAttrs): SerializedJsonValue {
  return taggedObject([
    {
      key: "entries",
      value: taggedArray(
        attrs.entries.map((entry) =>
          taggedObject([
            { key: "key", value: entry.key },
            { key: "value", value: serializedAttrValueJson(entry.value) }
          ])
        )
      )
    }
  ]);
}

function attrsFromJson(value: unknown, label: string): SerializedAttrs {
  const fields = closedTaggedFields(value, ["entries"], label);
  const rawEntries = requiredField(fields, "entries", label);
  if (
    typeof rawEntries !== "object" ||
    rawEntries === null ||
    rawEntries.kind !== "array"
  ) {
    return admissionError(
      "gtl-application-contract-mismatch",
      `${label}.entries`,
      "expected a tagged array"
    );
  }
  return canonicalSerializedAttrs(
    {
      entries: rawEntries.items.map((entry, index) => {
        const entryFields = closedTaggedFields(
          entry,
          ["key", "value"],
          `${label}.entries[${index}]`
        );
        const key = requiredField(
          entryFields,
          "key",
          `${label}.entries[${index}]`
        );
        const attr = requiredField(
          entryFields,
          "value",
          `${label}.entries[${index}]`
        );
        const attrFields = closedTaggedFields(
          attr,
          ["kind", "value"],
          `${label}.entries[${index}].value`
        );
        const kind = requiredField(
          attrFields,
          "kind",
          `${label}.entries[${index}].value`
        );
        const attrValue = requiredField(
          attrFields,
          "value",
          `${label}.entries[${index}].value`
        );
        let plainValue: unknown = attrValue;
        if (kind === "string_list") {
          if (
            typeof attrValue !== "object" ||
            attrValue === null ||
            attrValue.kind !== "array"
          ) {
            return admissionError(
              "gtl-application-contract-mismatch",
              `${label}.entries[${index}].value.value`,
              "expected a tagged array"
            );
          }
          plainValue = attrValue.items;
        } else if (kind === "hook_ref") {
          const hookFields = closedTaggedFields(
            attrValue,
            ["ref", "config"],
            `${label}.entries[${index}].value.value`
          );
          plainValue = {
            ref: requiredField(
              hookFields,
              "ref",
              `${label}.entries[${index}].value.value`
            ),
            config: attrsFromJson(
              requiredField(
                hookFields,
                "config",
                `${label}.entries[${index}].value.value`
              ),
              `${label}.entries[${index}].value.value.config`
            )
          };
        }
        return {
          key,
          value: { kind, value: plainValue }
        };
      })
    },
    label
  );
}

function canonicalEvaluator(value: Evaluator, label: string): Evaluator {
  if (!isRecord(value)) {
    return admissionError(
      "gtl-application-contract-mismatch",
      label,
      "expected an evaluator"
    );
  }
  assertOwnKeyOrder(value, [
    "name",
    "regime",
    "description",
    "binding",
    "consumedFieldRefs",
    "tags"
  ], label);
  const regime = value["regime"];
  if (regime !== "F_D" && regime !== "F_P" && regime !== "F_H") {
    return admissionError(
      "gtl-application-contract-mismatch",
      `${label}.regime`,
      "expected F_D, F_P, or F_H"
    );
  }
  return Object.freeze({
    name: nonEmptyString(value["name"], `${label}.name`),
    regime,
    description: stringValue(value["description"], `${label}.description`),
    binding: stringValue(value["binding"], `${label}.binding`),
    consumedFieldRefs: stringArray(
      value["consumedFieldRefs"],
      `${label}.consumedFieldRefs`
    ),
    tags: stringArray(value["tags"], `${label}.tags`)
  });
}

function evaluatorJson(evaluator: Evaluator): SerializedJsonValue {
  return taggedObject([
    { key: "name", value: evaluator.name },
    { key: "regime", value: evaluator.regime },
    { key: "description", value: evaluator.description },
    { key: "binding", value: evaluator.binding },
    { key: "consumed_field_refs", value: taggedArray(evaluator.consumedFieldRefs) },
    { key: "tags", value: taggedArray(evaluator.tags) }
  ]);
}

function evaluatorFromJson(value: unknown, label: string): Evaluator {
  const fields = closedTaggedFields(value, EVALUATOR_FIELD_ORDER, label);
  const regime = requiredField(fields, "regime", label);
  if (regime !== "F_D" && regime !== "F_P" && regime !== "F_H") {
    return admissionError(
      "gtl-application-contract-mismatch",
      `${label}.regime`,
      "expected F_D, F_P, or F_H"
    );
  }
  const consumed = requiredField(fields, "consumed_field_refs", label);
  const tags = requiredField(fields, "tags", label);
  if (
    typeof consumed !== "object" ||
    consumed === null ||
    consumed.kind !== "array" ||
    typeof tags !== "object" ||
    tags === null ||
    tags.kind !== "array"
  ) {
    return admissionError(
      "gtl-application-contract-mismatch",
      label,
      "evaluator string lists must use tagged arrays"
    );
  }
  return canonicalEvaluator(
    {
      name: requiredField(fields, "name", label),
      regime,
      description: requiredField(fields, "description", label),
      binding: requiredField(fields, "binding", label),
      consumedFieldRefs: consumed.items,
      tags: tags.items
    } as Evaluator,
    label
  );
}

function canonicalRule(value: Rule, label: string): Rule {
  if (!isRecord(value)) {
    return admissionError(
      "gtl-application-contract-mismatch",
      label,
      "expected a rule"
    );
  }
  assertOwnKeyOrder(value, ["name", "kind", "config", "tags"], label);
  return Object.freeze({
    name: nonEmptyString(value["name"], `${label}.name`),
    kind: stringValue(value["kind"], `${label}.kind`),
    config: canonicalSerializedAttrs(value["config"], `${label}.config`),
    tags: stringArray(value["tags"], `${label}.tags`)
  });
}

function ruleJson(rule: Rule): SerializedJsonValue {
  return taggedObject([
    { key: "name", value: rule.name },
    { key: "kind", value: rule.kind },
    { key: "config", value: serializedAttrsJson(rule.config) },
    { key: "tags", value: taggedArray(rule.tags) }
  ]);
}

function ruleFromJson(value: unknown, label: string): Rule {
  const fields = closedTaggedFields(value, RULE_FIELD_ORDER, label);
  const tags = requiredField(fields, "tags", label);
  if (typeof tags !== "object" || tags === null || tags.kind !== "array") {
    return admissionError(
      "gtl-application-contract-mismatch",
      `${label}.tags`,
      "expected a tagged array"
    );
  }
  return canonicalRule(
    {
      name: requiredField(fields, "name", label),
      kind: requiredField(fields, "kind", label),
      config: attrsFromJson(requiredField(fields, "config", label), `${label}.config`),
      tags: tags.items
    } as Rule,
    label
  );
}

function canonicalFoldback(
  value: GraphFunctionFoldbackDeclarationInit,
  label: string
): CanonicalGraphFunctionFoldbackDeclaration {
  if (!isRecord(value)) {
    return admissionError(
      "gtl-application-contract-mismatch",
      label,
      "expected a foldback declaration"
    );
  }
  const expected = value["additional"] === undefined
    ? ["mode", "binding", "requiresParentEvaluation"]
    : ["mode", "binding", "requiresParentEvaluation", "additional"];
  assertOwnKeyOrder(value, expected, label);
  if (value["mode"] !== "rebind") {
    return admissionError(
      "gtl-application-contract-mismatch",
      `${label}.mode`,
      "expected rebind"
    );
  }
  if (value["requiresParentEvaluation"] !== true) {
    return admissionError(
      "gtl-application-contract-mismatch",
      `${label}.requiresParentEvaluation`,
      "expected true"
    );
  }
  return Object.freeze({
    mode: "rebind",
    binding: nonEmptyString(value["binding"], `${label}.binding`),
    requiresParentEvaluation: true,
    additional: canonicalSerializedAttrs(
      value["additional"] ?? { entries: [] },
      `${label}.additional`
    )
  });
}

function foldbackJson(
  foldback: CanonicalGraphFunctionFoldbackDeclaration
): SerializedJsonValue {
  return taggedObject([
    { key: "mode", value: foldback.mode },
    { key: "binding", value: foldback.binding },
    { key: "requires_parent_evaluation", value: true },
    { key: "additional", value: serializedAttrsJson(foldback.additional) }
  ]);
}

function foldbackFromJson(
  value: unknown,
  label: string
): CanonicalGraphFunctionFoldbackDeclaration {
  const fields = closedTaggedFields(value, FOLDBACK_FIELD_ORDER, label);
  return canonicalFoldback(
    {
      mode: requiredField(fields, "mode", label) as "rebind",
      binding: requiredField(fields, "binding", label) as string,
      requiresParentEvaluation: requiredField(
        fields,
        "requires_parent_evaluation",
        label
      ) as boolean,
      additional: attrsFromJson(
        requiredField(fields, "additional", label),
        `${label}.additional`
      )
    },
    label
  );
}

type CanonicalApplicationInput =
  | {
      readonly operatorKind: "recurse";
      readonly operandGraphFunctionRef: string;
      readonly terminationEvaluator: Evaluator;
      readonly foldback: GraphFunctionFoldbackDeclarationInit;
    }
  | {
      readonly operatorKind: "fan_in";
      readonly operandGraphFunctionRef: string;
      readonly overVectorNodeRef: string;
      readonly overVectorContractKey: string;
    }
  | {
      readonly operatorKind: "gate";
      readonly operandGraphFunctionRef: string;
      readonly rule: Rule;
      readonly evaluators: readonly Evaluator[];
    };

type GraphFunctionApplicationCore =
  | Omit<RecurseGraphFunctionApplicationDeclaration, "applicationRef">
  | Omit<FanInGraphFunctionApplicationDeclaration, "applicationRef">
  | Omit<GateGraphFunctionApplicationDeclaration, "applicationRef">;

function applicationCoreEntries(
  declaration: GraphFunctionApplicationCore
): readonly TaggedObjectEntry[] {
  const common: TaggedObjectEntry[] = [
    {
      key: "syntax_version",
      value: GRAPH_FUNCTION_APPLICATION_SYNTAX_VERSION
    },
    { key: "operator_kind", value: declaration.operatorKind },
    {
      key: "operand_graph_function_ref",
      value: declaration.operandGraphFunctionRef
    }
  ];
  if (declaration.operatorKind === "recurse") {
    if (declaration.terminationEvaluator === undefined || declaration.foldback === undefined) {
      return admissionError(
        "gtl-application-contract-mismatch",
        "GraphFunctionApplicationDeclaration",
        "recurse fields are incomplete"
      );
    }
    return Object.freeze([
      ...common,
      {
        key: "termination_evaluator",
        value: evaluatorJson(declaration.terminationEvaluator)
      },
      { key: "foldback", value: foldbackJson(declaration.foldback) }
    ]);
  }
  if (declaration.operatorKind === "fan_in") {
    if (
      declaration.overVectorNodeRef === undefined ||
      declaration.overVectorContractKey === undefined
    ) {
      return admissionError(
        "gtl-application-contract-mismatch",
        "GraphFunctionApplicationDeclaration",
        "fan_in fields are incomplete"
      );
    }
    return Object.freeze([
      ...common,
      { key: "over_vector_node_ref", value: declaration.overVectorNodeRef },
      {
        key: "over_vector_contract_key",
        value: declaration.overVectorContractKey
      }
    ]);
  }
  if (declaration.rule === undefined || declaration.evaluators === undefined) {
    return admissionError(
      "gtl-application-contract-mismatch",
      "GraphFunctionApplicationDeclaration",
      "gate fields are incomplete"
    );
  }
  return Object.freeze([
    ...common,
    { key: "rule", value: ruleJson(declaration.rule) },
    {
      key: "evaluators",
      value: taggedArray(declaration.evaluators.map(evaluatorJson))
    }
  ]);
}

function deriveApplicationRef(
  declaration: GraphFunctionApplicationCore
): string {
  const digest = createHash("sha256")
    .update(JSON.stringify(taggedObject(applicationCoreEntries(declaration))))
    .digest("hex");
  return `gtl://graph-function/application/${digest}`;
}

function constructCanonicalApplication(
  input: CanonicalApplicationInput,
  label: string
): GraphFunctionApplicationDeclaration {
  const operandGraphFunctionRef = nonEmptyString(
    input.operandGraphFunctionRef,
    `${label}.operandGraphFunctionRef`
  );
  if (input.operatorKind === "recurse") {
    const terminationEvaluator = canonicalEvaluator(
      input.terminationEvaluator,
      `${label}.terminationEvaluator`
    );
    const foldback = canonicalFoldback(input.foldback, `${label}.foldback`);
    const core = {
      syntaxVersion: GRAPH_FUNCTION_APPLICATION_SYNTAX_VERSION,
      operatorKind: "recurse" as const,
      operandGraphFunctionRef,
      terminationEvaluator,
      foldback
    };
    return Object.freeze({
      ...core,
      applicationRef: deriveApplicationRef(core)
    });
  }
  if (input.operatorKind === "fan_in") {
    const core = {
      syntaxVersion: GRAPH_FUNCTION_APPLICATION_SYNTAX_VERSION,
      operatorKind: "fan_in" as const,
      operandGraphFunctionRef,
      overVectorNodeRef: nonEmptyString(
        input.overVectorNodeRef,
        `${label}.overVectorNodeRef`
      ),
      overVectorContractKey: nonEmptyString(
        input.overVectorContractKey,
        `${label}.overVectorContractKey`
      )
    };
    return Object.freeze({
      ...core,
      applicationRef: deriveApplicationRef(core)
    });
  }
  if (input.evaluators.length === 0) {
    return admissionError(
      "gtl-application-contract-mismatch",
      `${label}.evaluators`,
      "gate requires at least one evaluator"
    );
  }
  const core = {
    syntaxVersion: GRAPH_FUNCTION_APPLICATION_SYNTAX_VERSION,
    operatorKind: "gate" as const,
    operandGraphFunctionRef,
    rule: canonicalRule(input.rule, `${label}.rule`),
    evaluators: Object.freeze(
      input.evaluators.map((evaluator, index) =>
        canonicalEvaluator(evaluator, `${label}.evaluators[${index}]`)
      )
    )
  };
  return Object.freeze({
    ...core,
    applicationRef: deriveApplicationRef(core)
  });
}

function admittedOperand(
  operand: GraphFunction,
  label: string
): GraphFunction {
  if (!isAdmittedGraphFunction(operand)) {
    return admissionError(
      "gtl-application-identity-mismatch",
      label,
      "operand must be an admitted GraphFunction value"
    );
  }
  nonEmptyString(operand.id, `${label}.id`);
  return operand;
}

export function constructGraphFunctionApplicationDeclaration(
  input: GraphFunctionApplicationDeclarationInput
): GraphFunctionApplicationDeclaration {
  const operand = admittedOperand(
    input.operandGraphFunction,
    "GraphFunctionApplicationDeclaration.operandGraphFunction"
  );
  if (input.operatorKind === "recurse") {
    return constructCanonicalApplication(
      {
        operatorKind: "recurse",
        operandGraphFunctionRef: operand.id,
        terminationEvaluator: input.terminationEvaluator,
        foldback: input.foldback
      },
      "GraphFunctionApplicationDeclaration"
    );
  }
  if (input.operatorKind === "fan_in") {
    const over = input.overVectorNode;
    const match = /^Vector\[([^\[\]]+)\]$/u.exec(over.schema.ref);
    if (
      match?.[1] === undefined ||
      match[1].length === 0 ||
      over.schema.ref !== over.schema.ref.trim()
    ) {
      return admissionError(
        "gtl-application-contract-mismatch",
        "GraphFunctionApplicationDeclaration.overVectorNode.schema.ref",
        "expected exactly one canonical Vector[member] boundary"
      );
    }
    return constructCanonicalApplication(
      {
        operatorKind: "fan_in",
        operandGraphFunctionRef: operand.id,
        overVectorNodeRef: over.id,
        overVectorContractKey: nodeContractKey(over)
      },
      "GraphFunctionApplicationDeclaration"
    );
  }
  return constructCanonicalApplication(
    {
      operatorKind: "gate",
      operandGraphFunctionRef: operand.id,
      rule: input.rule,
      evaluators: input.evaluators
    },
    "GraphFunctionApplicationDeclaration"
  );
}

function declarationEntries(
  declaration: GraphFunctionApplicationDeclaration
): readonly TaggedObjectEntry[] {
  const core = applicationCoreEntries(declaration);
  return Object.freeze([
    core[0]!,
    { key: "application_ref", value: declaration.applicationRef },
    ...core.slice(1)
  ]);
}

export function serializeGraphFunctionApplicationDeclaration(
  declaration: GraphFunctionApplicationDeclaration
): SerializedJsonValue {
  return taggedObject(declarationEntries(declaration));
}

function operatorKindFromRaw(
  input: unknown,
  label: string
): GraphFunctionApplicationOperatorKind {
  const entries = readTaggedEntries(input, label);
  const operator = entries.find((entry) => entry.key === "operator_kind");
  if (operator === undefined) {
    return admissionError(
      "gtl-application-missing-field",
      `${label}.operator_kind`,
      "required field is absent"
    );
  }
  if (
    operator.value !== "recurse" &&
    operator.value !== "fan_in" &&
    operator.value !== "gate"
  ) {
    return admissionError(
      "gtl-application-invalid-operator",
      `${label}.operator_kind`,
      "expected recurse, fan_in, or gate"
    );
  }
  return operator.value;
}

export function admitGraphFunctionApplicationDeclaration(
  input: unknown,
  label = "GraphFunctionApplicationDeclaration"
): GraphFunctionApplicationDeclaration {
  const operatorKind = operatorKindFromRaw(input, label);
  const fields = closedTaggedFields(
    input,
    GRAPH_FUNCTION_APPLICATION_FIELD_ORDER[operatorKind],
    label
  );
  const syntaxVersion = requiredField(fields, "syntax_version", label);
  if (syntaxVersion !== GRAPH_FUNCTION_APPLICATION_SYNTAX_VERSION) {
    return admissionError(
      "gtl-application-contract-mismatch",
      `${label}.syntax_version`,
      `expected ${GRAPH_FUNCTION_APPLICATION_SYNTAX_VERSION}`
    );
  }
  const operandGraphFunctionRef = requiredField(
    fields,
    "operand_graph_function_ref",
    label
  );
  let canonical: GraphFunctionApplicationDeclaration;
  if (operatorKind === "recurse") {
    canonical = constructCanonicalApplication(
      {
        operatorKind,
        operandGraphFunctionRef: operandGraphFunctionRef as string,
        terminationEvaluator: evaluatorFromJson(
          requiredField(fields, "termination_evaluator", label),
          `${label}.termination_evaluator`
        ),
        foldback: foldbackFromJson(
          requiredField(fields, "foldback", label),
          `${label}.foldback`
        )
      },
      label
    );
  } else if (operatorKind === "fan_in") {
    canonical = constructCanonicalApplication(
      {
        operatorKind,
        operandGraphFunctionRef: operandGraphFunctionRef as string,
        overVectorNodeRef: requiredField(
          fields,
          "over_vector_node_ref",
          label
        ) as string,
        overVectorContractKey: requiredField(
          fields,
          "over_vector_contract_key",
          label
        ) as string
      },
      label
    );
  } else {
    const evaluators = requiredField(fields, "evaluators", label);
    if (
      typeof evaluators !== "object" ||
      evaluators === null ||
      evaluators.kind !== "array"
    ) {
      return admissionError(
        "gtl-application-contract-mismatch",
        `${label}.evaluators`,
        "expected a tagged array"
      );
    }
    canonical = constructCanonicalApplication(
      {
        operatorKind,
        operandGraphFunctionRef: operandGraphFunctionRef as string,
        rule: ruleFromJson(
          requiredField(fields, "rule", label),
          `${label}.rule`
        ),
        evaluators: evaluators.items.map((evaluator, index) =>
          evaluatorFromJson(evaluator, `${label}.evaluators[${index}]`)
        )
      },
      label
    );
  }
  const suppliedApplicationRef = requiredField(
    fields,
    "application_ref",
    label
  );
  if (suppliedApplicationRef !== canonical.applicationRef) {
    return admissionError(
      "gtl-application-contract-mismatch",
      `${label}.application_ref`,
      `expected derived application ref ${canonical.applicationRef}`
    );
  }
  return canonical;
}

export function canonicalizeGraphFunctionApplicationDeclarationValue(
  input: unknown,
  label = "GraphFunctionApplicationDeclaration"
): SerializedJsonValue {
  return serializeGraphFunctionApplicationDeclaration(
    admitGraphFunctionApplicationDeclaration(input, label)
  );
}

export function constructGraphFunctionApplicationDeclarationEntry(
  declaration: GraphFunctionApplicationDeclaration
): GraphFunctionApplicationDeclarationEntry {
  return Object.freeze({
    key: GRAPH_FUNCTION_APPLICATION_DECLARATION_KEY,
    value: Object.freeze({
      kind: "json_blob",
      value: serializeGraphFunctionApplicationDeclaration(declaration)
    })
  });
}

export function graphFunctionApplicationDeclarationFromDeclarations(
  declarations: SerializedAttrs,
  label = "GraphFunction.declarations"
): GraphFunctionApplicationDeclaration | null {
  const entries = declarations.entries.filter(
    (entry) => entry.key === GRAPH_FUNCTION_APPLICATION_DECLARATION_KEY
  );
  if (entries.length === 0) {
    return null;
  }
  if (entries.length > 1) {
    return admissionError(
      "gtl-application-duplicate-authority",
      `${label}.${GRAPH_FUNCTION_APPLICATION_DECLARATION_KEY}`,
      "declaration key has more than one authority"
    );
  }
  const entry = entries[0]!;
  if (entry.value.kind !== "json_blob") {
    return admissionError(
      "gtl-application-contract-mismatch",
      `${label}.${GRAPH_FUNCTION_APPLICATION_DECLARATION_KEY}`,
      "expected json_blob"
    );
  }
  return admitGraphFunctionApplicationDeclaration(
    entry.value.value,
    `${label}.${GRAPH_FUNCTION_APPLICATION_DECLARATION_KEY}`
  );
}
