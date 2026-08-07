import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { C_TERM_KIND_VALUES } from "../gtl/c_algebra.js";
import {
  admitCProgramSyntax,
  admitGraphFunction,
  admitModule,
  admitProgram,
} from "../gtl/admission.js";
import { admitIJsonText, admitIJsonValue } from "../gtl/canonical_ingest.js";

export const RAW_SUBJECT_KIND_VALUES = [
  "module_publication",
  "catalog_contribution",
  "gtl_program",
  "graph_function",
  "gtl_graph",
  "c_program_term",
  "contract_declaration",
  "implementation_binding",
  "closure_contract",
  "invocation_input",
  "public_operation_request",
] as const;

export type RawSubjectKind = (typeof RAW_SUBJECT_KIND_VALUES)[number];

export interface RawAdmittedValue<S> {
  readonly kind: "raw_admitted_value";
  readonly schemaVersion: "5.0.0";
  readonly admissionRef: string;
  readonly subjectKind: RawSubjectKind;
  readonly contractRef: string;
  readonly subjectDigest: Sha256Digest;
  readonly value: Readonly<S>;
}

export interface RawAdmissionRefusal {
  readonly kind: "raw_admission_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: "invalid_contract" | "invalid_kind" | "non_canonical_value";
  readonly message: string;
}

export type RawAdmissionResult<S> = RawAdmittedValue<S> | RawAdmissionRefusal;

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExpectedKind(
  value: Readonly<Record<string, unknown>>,
  expectedKind: RawSubjectKind,
): boolean {
  switch (expectedKind) {
    case "catalog_contribution":
      return (
        value.kind === "graph_function" ||
        value.kind === "node_type" ||
        value.kind === "overlay"
      );
    case "contract_declaration":
      return (
        typeof value.contractRef === "string" &&
        (value.contractKind === "input" ||
          value.contractKind === "output" ||
          value.contractKind === "evidence" ||
          value.contractKind === "failure" ||
          value.contractKind === "refusal" ||
          value.contractKind === "judgment" ||
          value.contractKind === "transition" ||
          value.contractKind === "closure")
      );
    case "c_program_term":
      return C_TERM_KIND_VALUES.some((kind) => kind === value.kind);
    case "invocation_input":
      return typeof value.kind === "string" && value.kind.length !== 0;
    case "public_operation_request":
      return value.kind === "public_invocation";
    default:
      return value.kind === expectedKind;
  }
}

const RAW_ADMISSION: unique symbol = Symbol("abiogenesis.validator.raw-admission");

export function isRawAdmittedValue(value: object): boolean {
  return Object.hasOwn(value, RAW_ADMISSION);
}

function admitSubject(value: unknown, expectedKind: RawSubjectKind): unknown {
  switch (expectedKind) {
    case "module_publication":
      return admitModule(value);
    case "gtl_program":
      return admitProgram(value);
    case "graph_function":
      return admitGraphFunction(value);
    case "c_program_term": {
      const admission = admitCProgramSyntax(value);
      if (!admission.accepted) throw new TypeError(admission.diagnostics[0].message);
      return admission.program;
    }
    case "catalog_contribution":
    case "contract_declaration":
    case "implementation_binding":
    case "closure_contract":
    case "gtl_graph":
    case "invocation_input":
    case "public_operation_request":
      return typeof value === "string"
        ? admitIJsonText(value)
        : admitIJsonValue(value);
  }
}

export function rawAdmitValue<S>(
  value: unknown,
  expectedKind: RawSubjectKind,
  contractRef: string,
): RawAdmissionResult<S> {
  if (contractRef.length === 0) {
    return {
      kind: "raw_admission_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "invalid_contract",
      message: "raw admission requires one exact non-empty contract reference",
    };
  }
  let parsed: unknown;
  try {
    parsed = typeof value === "string"
      ? admitIJsonText(value)
      : admitIJsonValue(value);
  } catch (error) {
    return {
      kind: "raw_admission_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "non_canonical_value",
      message: error instanceof Error
        ? error.message
        : "raw value is not representable as canonical JSON",
    };
  }
  if (!isRecord(parsed) || !hasExpectedKind(parsed, expectedKind)) {
    return {
      kind: "raw_admission_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "invalid_kind",
      message: `raw value does not satisfy expected kind ${expectedKind}`,
    };
  }
  try {
    const admittedValue = admitSubject(parsed, expectedKind) as Readonly<S>;
    if (!isRecord(admittedValue) || !hasExpectedKind(admittedValue, expectedKind)) {
      throw new TypeError(`admitted value does not satisfy expected kind ${expectedKind}`);
    }
    const subjectDigest = sha256Canonical(admittedValue as unknown as JsonValue);
    const admissionDigest = sha256Canonical({
      contractRef,
      expectedKind,
      subjectDigest,
    });
    const admitted = {
      kind: "raw_admitted_value",
      schemaVersion: "5.0.0",
      admissionRef: `raw-admission://abiogenesis/${admissionDigest.slice("sha256:".length)}`,
      subjectKind: expectedKind,
      contractRef,
      subjectDigest,
      value: admittedValue,
    } as RawAdmittedValue<S>;
    Object.defineProperty(admitted, RAW_ADMISSION, {
      configurable: false,
      enumerable: false,
      value: true,
      writable: false,
    });
    return deepFreeze(admitted) as RawAdmittedValue<S>;
  } catch (error) {
    return {
      kind: "raw_admission_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "non_canonical_value",
      message: error instanceof Error
        ? error.message
        : "raw value is not representable as canonical JSON",
    };
  }
}
