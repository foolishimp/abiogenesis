// Implements: REQ-L-GTL3-HOF-001/-005/-006.

import { createHash } from "node:crypto";

import type {
  Node,
  SchemaRef,
  SerializedAttrEntry,
  SerializedAttrs,
  SerializedJsonValue
} from "./carriers.js";

export const HOF_APPLICATION_DECLARATION_KEY = "gtl.hof_application" as const;
export const HOF_APPLICATION_SYNTAX_VERSION = "gtl-hof-application/1" as const;
export const HOF_APPLICATION_ORDERING_LAW =
  "preserve_input_ordinal_when_wholly_successful" as const;
export const HOF_APPLICATION_CARDINALITY_LAW =
  "one_slot_per_input_when_wholly_successful" as const;

export function admitHofVectorMemberSchema(
  vectorNode: Node,
  memberNode: Node,
  label = "HofVector"
): SchemaRef {
  const match = /^Vector\[([^\[\]]+)\]$/u.exec(vectorNode.schema.ref);
  const memberRef = match?.[1];
  if (
    memberRef === undefined ||
    memberRef.length === 0 ||
    memberRef !== memberRef.trim()
  ) {
    throw new TypeError(
      `${label}.vector.schema.ref: expected exactly one canonical Vector[member] boundary`
    );
  }
  if (
    vectorNode.schema.kind !== memberNode.schema.kind ||
    memberRef !== memberNode.schema.ref
  ) {
    throw new TypeError(
      `${label}.vector: Vector member schema does not match the explicit member contract`
    );
  }
  return Object.freeze({ kind: vectorNode.schema.kind, ref: memberRef });
}

const HOF_APPLICATION_FIELD_ORDER = Object.freeze([
  "syntax_version",
  "relation_ref",
  "operator_kind",
  "wrapper_graph_vector_ref",
  "child_graph_function_ref",
  "input_member_node_ref",
  "input_member_contract_key",
  "output_member_node_ref",
  "output_member_contract_key",
  "input_vector_node_ref",
  "input_vector_contract_key",
  "output_vector_node_ref",
  "output_vector_contract_key",
  "ordering_law",
  "cardinality_law"
] as const);

type HofApplicationField = (typeof HOF_APPLICATION_FIELD_ORDER)[number];

function isHofApplicationField(value: string): value is HofApplicationField {
  return HOF_APPLICATION_FIELD_ORDER.some((field) => field === value);
}

function isUnknownRecord(
  value: unknown
): value is Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertExactOwnKeys(
  value: Readonly<Record<string, unknown>>,
  allowed: readonly string[],
  label: string
): void {
  const allowedKeys = new Set(allowed);
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) {
      admissionError(
        "gtl-hof-unknown-field",
        `${label}.${key}`,
        "field is not admitted by the tagged HOF object syntax"
      );
    }
  }
}

export interface HofApplicationDeclaration {
  readonly syntaxVersion: typeof HOF_APPLICATION_SYNTAX_VERSION;
  readonly relationRef: string;
  readonly operatorKind: "fan_out";
  readonly wrapperGraphVectorRef: string;
  readonly childGraphFunctionRef: string;
  readonly inputMemberNodeRef: string;
  readonly inputMemberContractKey: string;
  readonly outputMemberNodeRef: string;
  readonly outputMemberContractKey: string;
  readonly inputVectorNodeRef: string;
  readonly inputVectorContractKey: string;
  readonly outputVectorNodeRef: string;
  readonly outputVectorContractKey: string;
  readonly orderingLaw: typeof HOF_APPLICATION_ORDERING_LAW;
  readonly cardinalityLaw: typeof HOF_APPLICATION_CARDINALITY_LAW;
}

export interface HofApplicationDeclarationEntry extends SerializedAttrEntry {
  readonly key: typeof HOF_APPLICATION_DECLARATION_KEY;
  readonly value: {
    readonly kind: "json_blob";
    readonly value: SerializedJsonValue;
  };
}

export type HofApplicationDeclarationInit = Omit<
  HofApplicationDeclaration,
  "syntaxVersion" | "relationRef" | "operatorKind" | "orderingLaw" | "cardinalityLaw"
>;

export type HofApplicationAdmissionDiagnosticId =
  | "gtl-hof-missing-field"
  | "gtl-hof-unknown-field"
  | "gtl-hof-duplicate-field"
  | "gtl-hof-invalid-operator-kind"
  | "gtl-hof-contract-mismatch";

export class HofApplicationAdmissionError extends TypeError {
  public readonly diagnosticId: HofApplicationAdmissionDiagnosticId;
  public readonly path: string;

  public constructor(input: {
    readonly diagnosticId: HofApplicationAdmissionDiagnosticId;
    readonly path: string;
    readonly message: string;
  }) {
    super(`${input.diagnosticId}: ${input.path}: ${input.message}`);
    this.name = "HofApplicationAdmissionError";
    this.diagnosticId = input.diagnosticId;
    this.path = input.path;
  }
}

function admissionError(
  diagnosticId: HofApplicationAdmissionDiagnosticId,
  path: string,
  message: string
): never {
  throw new HofApplicationAdmissionError({ diagnosticId, path, message });
}

function nonEmpty(value: string, path: string): string {
  if (value.length === 0) {
    return admissionError(
      "gtl-hof-contract-mismatch",
      path,
      "expected a non-empty string"
    );
  }
  return value;
}

function relationCore(input: HofApplicationDeclarationInit): Readonly<Record<string, string>> {
  return Object.freeze({
    syntax_version: HOF_APPLICATION_SYNTAX_VERSION,
    operator_kind: "fan_out",
    wrapper_graph_vector_ref: input.wrapperGraphVectorRef,
    child_graph_function_ref: input.childGraphFunctionRef,
    input_member_node_ref: input.inputMemberNodeRef,
    input_member_contract_key: input.inputMemberContractKey,
    output_member_node_ref: input.outputMemberNodeRef,
    output_member_contract_key: input.outputMemberContractKey,
    input_vector_node_ref: input.inputVectorNodeRef,
    input_vector_contract_key: input.inputVectorContractKey,
    output_vector_node_ref: input.outputVectorNodeRef,
    output_vector_contract_key: input.outputVectorContractKey,
    ordering_law: HOF_APPLICATION_ORDERING_LAW,
    cardinality_law: HOF_APPLICATION_CARDINALITY_LAW
  });
}

function deriveHofApplicationRelationRef(
  input: HofApplicationDeclarationInit
): string {
  const digest = createHash("sha256")
    .update(JSON.stringify(relationCore(input)))
    .digest("hex");
  return `gtl://hof/application/${digest}`;
}

export function constructHofApplicationDeclaration(
  input: HofApplicationDeclarationInit
): HofApplicationDeclaration {
  const admitted: HofApplicationDeclarationInit = Object.freeze({
    wrapperGraphVectorRef: nonEmpty(
      input.wrapperGraphVectorRef,
      "HofApplicationDeclaration.wrapperGraphVectorRef"
    ),
    childGraphFunctionRef: nonEmpty(
      input.childGraphFunctionRef,
      "HofApplicationDeclaration.childGraphFunctionRef"
    ),
    inputMemberNodeRef: nonEmpty(
      input.inputMemberNodeRef,
      "HofApplicationDeclaration.inputMemberNodeRef"
    ),
    inputMemberContractKey: nonEmpty(
      input.inputMemberContractKey,
      "HofApplicationDeclaration.inputMemberContractKey"
    ),
    outputMemberNodeRef: nonEmpty(
      input.outputMemberNodeRef,
      "HofApplicationDeclaration.outputMemberNodeRef"
    ),
    outputMemberContractKey: nonEmpty(
      input.outputMemberContractKey,
      "HofApplicationDeclaration.outputMemberContractKey"
    ),
    inputVectorNodeRef: nonEmpty(
      input.inputVectorNodeRef,
      "HofApplicationDeclaration.inputVectorNodeRef"
    ),
    inputVectorContractKey: nonEmpty(
      input.inputVectorContractKey,
      "HofApplicationDeclaration.inputVectorContractKey"
    ),
    outputVectorNodeRef: nonEmpty(
      input.outputVectorNodeRef,
      "HofApplicationDeclaration.outputVectorNodeRef"
    ),
    outputVectorContractKey: nonEmpty(
      input.outputVectorContractKey,
      "HofApplicationDeclaration.outputVectorContractKey"
    )
  });

  return Object.freeze({
    syntaxVersion: HOF_APPLICATION_SYNTAX_VERSION,
    relationRef: deriveHofApplicationRelationRef(admitted),
    operatorKind: "fan_out",
    ...admitted,
    orderingLaw: HOF_APPLICATION_ORDERING_LAW,
    cardinalityLaw: HOF_APPLICATION_CARDINALITY_LAW
  });
}

function declarationFieldValues(
  declaration: HofApplicationDeclaration
): Readonly<Record<HofApplicationField, string>> {
  return Object.freeze({
    syntax_version: declaration.syntaxVersion,
    relation_ref: declaration.relationRef,
    operator_kind: declaration.operatorKind,
    wrapper_graph_vector_ref: declaration.wrapperGraphVectorRef,
    child_graph_function_ref: declaration.childGraphFunctionRef,
    input_member_node_ref: declaration.inputMemberNodeRef,
    input_member_contract_key: declaration.inputMemberContractKey,
    output_member_node_ref: declaration.outputMemberNodeRef,
    output_member_contract_key: declaration.outputMemberContractKey,
    input_vector_node_ref: declaration.inputVectorNodeRef,
    input_vector_contract_key: declaration.inputVectorContractKey,
    output_vector_node_ref: declaration.outputVectorNodeRef,
    output_vector_contract_key: declaration.outputVectorContractKey,
    ordering_law: declaration.orderingLaw,
    cardinality_law: declaration.cardinalityLaw
  });
}

export function serializeHofApplicationDeclaration(
  declaration: HofApplicationDeclaration
): SerializedJsonValue {
  const values = declarationFieldValues(declaration);
  return Object.freeze({
    kind: "object",
    entries: Object.freeze(
      HOF_APPLICATION_FIELD_ORDER.map((key) =>
        Object.freeze({ key, value: values[key] })
      )
    )
  });
}

function recordFromTaggedObject(
  input: unknown,
  label: string
): Readonly<Record<HofApplicationField, string>> {
  if (!isUnknownRecord(input)) {
    return admissionError(
      "gtl-hof-contract-mismatch",
      label,
      "expected a tagged object"
    );
  }
  assertExactOwnKeys(input, ["kind", "entries"], label);
  const entries = input["entries"];
  if (input["kind"] !== "object" || !Array.isArray(entries)) {
    return admissionError(
      "gtl-hof-contract-mismatch",
      label,
      "expected { kind: object, entries: [...] }"
    );
  }

  const admitted = new Map<HofApplicationField, string>();
  for (const [index, candidate] of entries.entries()) {
    if (!isUnknownRecord(candidate)) {
      return admissionError(
        "gtl-hof-contract-mismatch",
        `${label}.entries[${index}]`,
        "expected a field entry"
      );
    }
    assertExactOwnKeys(
      candidate,
      ["key", "value"],
      `${label}.entries[${index}]`
    );
    const entryKey = candidate["key"];
    const entryValue = candidate["value"];
    if (typeof entryKey !== "string" || entryKey.length === 0) {
      return admissionError(
        "gtl-hof-contract-mismatch",
        `${label}.entries[${index}].key`,
        "expected a non-empty field name"
      );
    }
    if (!isHofApplicationField(entryKey)) {
      return admissionError(
        "gtl-hof-unknown-field",
        `${label}.${entryKey}`,
        "field is not admitted by the HOF application syntax"
      );
    }
    const key = entryKey;
    if (admitted.has(key)) {
      return admissionError(
        "gtl-hof-duplicate-field",
        `${label}.${key}`,
        "field has more than one authority"
      );
    }
    if (typeof entryValue !== "string" || entryValue.length === 0) {
      return admissionError(
        "gtl-hof-contract-mismatch",
        `${label}.${key}`,
        "expected a non-empty string"
      );
    }
    admitted.set(key, entryValue);
  }

  for (const key of HOF_APPLICATION_FIELD_ORDER) {
    if (!admitted.has(key)) {
      return admissionError(
        "gtl-hof-missing-field",
        `${label}.${key}`,
        "required field is absent"
      );
    }
  }
  function value(key: HofApplicationField): string {
    const entry = admitted.get(key);
    return entry === undefined
      ? admissionError(
          "gtl-hof-missing-field",
          `${label}.${key}`,
          "required field is absent"
        )
      : entry;
  }
  return Object.freeze({
    syntax_version: value("syntax_version"),
    relation_ref: value("relation_ref"),
    operator_kind: value("operator_kind"),
    wrapper_graph_vector_ref: value("wrapper_graph_vector_ref"),
    child_graph_function_ref: value("child_graph_function_ref"),
    input_member_node_ref: value("input_member_node_ref"),
    input_member_contract_key: value("input_member_contract_key"),
    output_member_node_ref: value("output_member_node_ref"),
    output_member_contract_key: value("output_member_contract_key"),
    input_vector_node_ref: value("input_vector_node_ref"),
    input_vector_contract_key: value("input_vector_contract_key"),
    output_vector_node_ref: value("output_vector_node_ref"),
    output_vector_contract_key: value("output_vector_contract_key"),
    ordering_law: value("ordering_law"),
    cardinality_law: value("cardinality_law")
  });
}

export function admitHofApplicationDeclaration(
  input: unknown,
  label = "HofApplicationDeclaration"
): HofApplicationDeclaration {
  const values = recordFromTaggedObject(input, label);
  if (values.syntax_version !== HOF_APPLICATION_SYNTAX_VERSION) {
    return admissionError(
      "gtl-hof-contract-mismatch",
      `${label}.syntax_version`,
      `expected ${HOF_APPLICATION_SYNTAX_VERSION}`
    );
  }
  if (values.operator_kind !== "fan_out") {
    return admissionError(
      "gtl-hof-invalid-operator-kind",
      `${label}.operator_kind`,
      "expected fan_out"
    );
  }
  if (values.ordering_law !== HOF_APPLICATION_ORDERING_LAW) {
    return admissionError(
      "gtl-hof-contract-mismatch",
      `${label}.ordering_law`,
      `expected ${HOF_APPLICATION_ORDERING_LAW}`
    );
  }
  if (values.cardinality_law !== HOF_APPLICATION_CARDINALITY_LAW) {
    return admissionError(
      "gtl-hof-contract-mismatch",
      `${label}.cardinality_law`,
      `expected ${HOF_APPLICATION_CARDINALITY_LAW}`
    );
  }

  const canonical = constructHofApplicationDeclaration({
    wrapperGraphVectorRef: values.wrapper_graph_vector_ref,
    childGraphFunctionRef: values.child_graph_function_ref,
    inputMemberNodeRef: values.input_member_node_ref,
    inputMemberContractKey: values.input_member_contract_key,
    outputMemberNodeRef: values.output_member_node_ref,
    outputMemberContractKey: values.output_member_contract_key,
    inputVectorNodeRef: values.input_vector_node_ref,
    inputVectorContractKey: values.input_vector_contract_key,
    outputVectorNodeRef: values.output_vector_node_ref,
    outputVectorContractKey: values.output_vector_contract_key
  });
  if (values.relation_ref !== canonical.relationRef) {
    return admissionError(
      "gtl-hof-contract-mismatch",
      `${label}.relation_ref`,
      `expected derived relation ref ${canonical.relationRef}`
    );
  }
  return canonical;
}

export function canonicalizeHofApplicationDeclarationValue(
  input: unknown,
  label = "HofApplicationDeclaration"
): SerializedJsonValue {
  return serializeHofApplicationDeclaration(
    admitHofApplicationDeclaration(input, label)
  );
}

export function constructHofApplicationDeclarationEntry(
  declaration: HofApplicationDeclaration
): HofApplicationDeclarationEntry {
  return Object.freeze({
    key: HOF_APPLICATION_DECLARATION_KEY,
    value: Object.freeze({
      kind: "json_blob",
      value: serializeHofApplicationDeclaration(declaration)
    })
  });
}

export function hofApplicationDeclarationFromDeclarations(
  declarations: SerializedAttrs,
  label = "GraphFunction.declarations"
): HofApplicationDeclaration | null {
  const entries = declarations.entries.filter(
    (entry) => entry.key === HOF_APPLICATION_DECLARATION_KEY
  );
  if (entries.length === 0) {
    return null;
  }
  if (entries.length > 1) {
    return admissionError(
      "gtl-hof-duplicate-field",
      `${label}.${HOF_APPLICATION_DECLARATION_KEY}`,
      "declaration key has more than one authority"
    );
  }
  const entry = entries[0]!;
  if (entry.value.kind !== "json_blob") {
    return admissionError(
      "gtl-hof-contract-mismatch",
      `${label}.${HOF_APPLICATION_DECLARATION_KEY}`,
      "expected json_blob"
    );
  }
  return admitHofApplicationDeclaration(
    entry.value.value,
    `${label}.${HOF_APPLICATION_DECLARATION_KEY}`
  );
}
