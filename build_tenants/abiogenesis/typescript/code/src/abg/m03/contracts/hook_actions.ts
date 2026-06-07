// Implements: T-130
// Implements: REQ-L-GTL3-HOOKS
// Implements: REQ-R-ABG3-ASSURANCE
// Implements: REQ-R-ABG3-PAYLOAD

import {
  parseNonEmptyString,
  parseOptionalField,
  parsePlainObject,
  parseString,
  parseStringArray
} from "../../../shared/validation/primitives.js";
import {
  ENGINE_AUTHORITY_FIELD_KEYS
} from "../../../shared/engine_authority_fields.js";
import { freezeStringArray } from "./runtime_support.js";

export const HOOK_ACTION_CLASS_VALUES = Object.freeze([
  "traversal",
  "evaluate",
  "transform",
  "admission",
  "projection"
] as const);

export const HOOK_FINDING_ADMISSION_STATUS_VALUES = Object.freeze([
  "admitted",
  "rejected"
] as const);

export type HookActionClass = (typeof HOOK_ACTION_CLASS_VALUES)[number];

export type HookFindingAdmissionStatus =
  (typeof HOOK_FINDING_ADMISSION_STATUS_VALUES)[number];

export interface HookActionRecord {
  readonly kind: "hook_action_record";
  readonly hookActionRef: string;
  readonly hookClass: HookActionClass;
  readonly hookContractRef: string;
  readonly pluginRef: string;
  readonly inputBasisRefs: readonly string[];
  readonly policyRefs: readonly string[];
  readonly configRefs: readonly string[];
  readonly returnedFindingRefs: readonly string[];
  readonly admissionRefs: readonly string[];
  readonly predecessorRefs: readonly string[];
  readonly outputSurfaceRef: string;
}

export interface HookFindingAdmission {
  readonly kind: "hook_finding_admission";
  readonly admissionRef: string;
  readonly hookActionRef: string;
  readonly findingRef: string;
  readonly status: HookFindingAdmissionStatus;
  readonly owningSurfaceRef: string;
  readonly evidenceRefs: readonly string[];
  readonly policyRefs: readonly string[];
  readonly predecessorRefs: readonly string[];
  readonly reason: string | null;
}

const FORBIDDEN_HOOK_ACTION_AUTHORITY_FIELDS = ENGINE_AUTHORITY_FIELD_KEYS;

function freezeUniqueStringArray(
  values: readonly string[],
  label: string,
  options?: { readonly allowEmpty?: boolean }
): readonly string[] {
  if (values.length === 0 && options?.allowEmpty !== true) {
    throw new TypeError(`${label}: expected at least one ref`);
  }
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    parseNonEmptyString(value, label);
    if (seen.has(value)) {
      throw new TypeError(`${label}: duplicate ref ${JSON.stringify(value)}`);
    }
    seen.add(value);
    result.push(value);
  }
  return freezeStringArray(result);
}

function parseOptionalStringList(
  input: Readonly<Record<string, unknown>>,
  field: string,
  label: string,
  options?: { readonly allowEmpty?: boolean }
): readonly string[] {
  const value = parseOptionalField(input, field);
  if (value === undefined) {
    return Object.freeze([]);
  }
  return freezeUniqueStringArray(
    parseStringArray(value, `${label}.${field}`),
    `${label}.${field}`,
    options
  );
}

function normalizeNullableString(
  value: unknown,
  label: string
): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  return parseNonEmptyString(value, label);
}

function rejectForbiddenHookAuthorityFields(
  input: Readonly<Record<string, unknown>>,
  label: string
): void {
  for (const field of FORBIDDEN_HOOK_ACTION_AUTHORITY_FIELDS) {
    if (Object.hasOwn(input, field)) {
      throw new TypeError(
        `${label}.${field}: hook action/finding admission cannot own engine authority`
      );
    }
  }
}

export function assertHookActionClass(
  value: string,
  label: string
): HookActionClass {
  for (const candidate of HOOK_ACTION_CLASS_VALUES) {
    if (value === candidate) {
      return candidate;
    }
  }
  throw new TypeError(`${label}: expected hook action class`);
}

export function assertHookFindingAdmissionStatus(
  value: string,
  label: string
): HookFindingAdmissionStatus {
  for (const candidate of HOOK_FINDING_ADMISSION_STATUS_VALUES) {
    if (value === candidate) {
      return candidate;
    }
  }
  throw new TypeError(`${label}: expected hook finding admission status`);
}

export function constructHookActionRecord(input: {
  readonly hookActionRef: string;
  readonly hookClass: HookActionClass;
  readonly hookContractRef: string;
  readonly pluginRef: string;
  readonly inputBasisRefs: readonly string[];
  readonly policyRefs?: readonly string[] | undefined;
  readonly configRefs?: readonly string[] | undefined;
  readonly returnedFindingRefs?: readonly string[] | undefined;
  readonly admissionRefs?: readonly string[] | undefined;
  readonly predecessorRefs?: readonly string[] | undefined;
  readonly outputSurfaceRef: string;
}): HookActionRecord {
  return Object.freeze({
    kind: "hook_action_record",
    hookActionRef: parseNonEmptyString(
      input.hookActionRef,
      "HookActionRecord.hookActionRef"
    ),
    hookClass: assertHookActionClass(
      input.hookClass,
      "HookActionRecord.hookClass"
    ),
    hookContractRef: parseNonEmptyString(
      input.hookContractRef,
      "HookActionRecord.hookContractRef"
    ),
    pluginRef: parseNonEmptyString(input.pluginRef, "HookActionRecord.pluginRef"),
    inputBasisRefs: freezeUniqueStringArray(
      input.inputBasisRefs,
      "HookActionRecord.inputBasisRefs"
    ),
    policyRefs: freezeUniqueStringArray(
      input.policyRefs ?? Object.freeze([]),
      "HookActionRecord.policyRefs",
      { allowEmpty: true }
    ),
    configRefs: freezeUniqueStringArray(
      input.configRefs ?? Object.freeze([]),
      "HookActionRecord.configRefs",
      { allowEmpty: true }
    ),
    returnedFindingRefs: freezeUniqueStringArray(
      input.returnedFindingRefs ?? Object.freeze([]),
      "HookActionRecord.returnedFindingRefs",
      { allowEmpty: true }
    ),
    admissionRefs: freezeUniqueStringArray(
      input.admissionRefs ?? Object.freeze([]),
      "HookActionRecord.admissionRefs",
      { allowEmpty: true }
    ),
    predecessorRefs: freezeUniqueStringArray(
      input.predecessorRefs ?? Object.freeze([]),
      "HookActionRecord.predecessorRefs",
      { allowEmpty: true }
    ),
    outputSurfaceRef: parseNonEmptyString(
      input.outputSurfaceRef,
      "HookActionRecord.outputSurfaceRef"
    )
  });
}

export function admitHookActionRecord(
  input: unknown,
  label = "HookActionRecord"
): HookActionRecord {
  const record = parsePlainObject(input, label);
  rejectForbiddenHookAuthorityFields(record, label);
  const kind = parseString(record["kind"], `${label}.kind`);
  if (kind !== "hook_action_record") {
    throw new TypeError(
      `${label}.kind: expected "hook_action_record", got ${JSON.stringify(kind)}`
    );
  }
  return constructHookActionRecord({
    hookActionRef: parseNonEmptyString(
      record["hookActionRef"],
      `${label}.hookActionRef`
    ),
    hookClass: assertHookActionClass(
      parseString(record["hookClass"], `${label}.hookClass`),
      `${label}.hookClass`
    ),
    hookContractRef: parseNonEmptyString(
      record["hookContractRef"],
      `${label}.hookContractRef`
    ),
    pluginRef: parseNonEmptyString(record["pluginRef"], `${label}.pluginRef`),
    inputBasisRefs: parseStringArray(
      record["inputBasisRefs"],
      `${label}.inputBasisRefs`
    ),
    policyRefs: parseOptionalStringList(record, "policyRefs", label, {
      allowEmpty: true
    }),
    configRefs: parseOptionalStringList(record, "configRefs", label, {
      allowEmpty: true
    }),
    returnedFindingRefs: parseOptionalStringList(
      record,
      "returnedFindingRefs",
      label,
      { allowEmpty: true }
    ),
    admissionRefs: parseOptionalStringList(record, "admissionRefs", label, {
      allowEmpty: true
    }),
    predecessorRefs: parseOptionalStringList(
      record,
      "predecessorRefs",
      label,
      { allowEmpty: true }
    ),
    outputSurfaceRef: parseNonEmptyString(
      record["outputSurfaceRef"],
      `${label}.outputSurfaceRef`
    )
  });
}

export function constructHookFindingAdmission(input: {
  readonly admissionRef: string;
  readonly hookActionRef: string;
  readonly findingRef: string;
  readonly status: HookFindingAdmissionStatus;
  readonly owningSurfaceRef: string;
  readonly evidenceRefs?: readonly string[] | undefined;
  readonly policyRefs?: readonly string[] | undefined;
  readonly predecessorRefs?: readonly string[] | undefined;
  readonly reason?: string | null | undefined;
}): HookFindingAdmission {
  return Object.freeze({
    kind: "hook_finding_admission",
    admissionRef: parseNonEmptyString(
      input.admissionRef,
      "HookFindingAdmission.admissionRef"
    ),
    hookActionRef: parseNonEmptyString(
      input.hookActionRef,
      "HookFindingAdmission.hookActionRef"
    ),
    findingRef: parseNonEmptyString(
      input.findingRef,
      "HookFindingAdmission.findingRef"
    ),
    status: assertHookFindingAdmissionStatus(
      input.status,
      "HookFindingAdmission.status"
    ),
    owningSurfaceRef: parseNonEmptyString(
      input.owningSurfaceRef,
      "HookFindingAdmission.owningSurfaceRef"
    ),
    evidenceRefs: freezeUniqueStringArray(
      input.evidenceRefs ?? Object.freeze([]),
      "HookFindingAdmission.evidenceRefs",
      { allowEmpty: true }
    ),
    policyRefs: freezeUniqueStringArray(
      input.policyRefs ?? Object.freeze([]),
      "HookFindingAdmission.policyRefs",
      { allowEmpty: true }
    ),
    predecessorRefs: freezeUniqueStringArray(
      input.predecessorRefs ?? Object.freeze([]),
      "HookFindingAdmission.predecessorRefs",
      { allowEmpty: true }
    ),
    reason: normalizeNullableString(
      input.reason,
      "HookFindingAdmission.reason"
    )
  });
}

export function admitHookFindingAdmission(
  input: unknown,
  label = "HookFindingAdmission"
): HookFindingAdmission {
  const admission = parsePlainObject(input, label);
  rejectForbiddenHookAuthorityFields(admission, label);
  const kind = parseString(admission["kind"], `${label}.kind`);
  if (kind !== "hook_finding_admission") {
    throw new TypeError(
      `${label}.kind: expected "hook_finding_admission", got ${JSON.stringify(kind)}`
    );
  }
  return constructHookFindingAdmission({
    admissionRef: parseNonEmptyString(
      admission["admissionRef"],
      `${label}.admissionRef`
    ),
    hookActionRef: parseNonEmptyString(
      admission["hookActionRef"],
      `${label}.hookActionRef`
    ),
    findingRef: parseNonEmptyString(admission["findingRef"], `${label}.findingRef`),
    status: assertHookFindingAdmissionStatus(
      parseString(admission["status"], `${label}.status`),
      `${label}.status`
    ),
    owningSurfaceRef: parseNonEmptyString(
      admission["owningSurfaceRef"],
      `${label}.owningSurfaceRef`
    ),
    evidenceRefs: parseOptionalStringList(admission, "evidenceRefs", label, {
      allowEmpty: true
    }),
    policyRefs: parseOptionalStringList(admission, "policyRefs", label, {
      allowEmpty: true
    }),
    predecessorRefs: parseOptionalStringList(
      admission,
      "predecessorRefs",
      label,
      { allowEmpty: true }
    ),
    reason: normalizeNullableString(
      parseOptionalField(admission, "reason"),
      `${label}.reason`
    )
  });
}

export function assertHookFindingAdmissionMatchesAction(input: {
  readonly hookAction: HookActionRecord;
  readonly admission: HookFindingAdmission;
}): void {
  if (input.admission.hookActionRef !== input.hookAction.hookActionRef) {
    throw new TypeError(
      "HookFindingAdmission.hookActionRef does not match HookActionRecord"
    );
  }
  if (!input.hookAction.returnedFindingRefs.includes(input.admission.findingRef)) {
    throw new TypeError(
      "HookFindingAdmission.findingRef was not returned by HookActionRecord"
    );
  }
  if (
    input.hookAction.admissionRefs.length > 0 &&
    !input.hookAction.admissionRefs.includes(input.admission.admissionRef)
  ) {
    throw new TypeError(
      "HookFindingAdmission.admissionRef is not recorded by HookActionRecord"
    );
  }
}
