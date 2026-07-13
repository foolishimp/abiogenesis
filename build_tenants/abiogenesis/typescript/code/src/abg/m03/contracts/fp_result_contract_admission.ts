// Implements: REQ-L-GTL3-C-ALGEBRA-018
// Implements: REQ-R-ABG3-INSTRUCTION-ASSEMBLY-014
// Implements: REQ-R-ABG3-PAYLOAD-006

import {
  admitIJsonValue,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import { isPlainObject } from "../../../shared/validation/primitives.js";

export const FP_RESULT_WIRE_PROFILE_VALUES = Object.freeze([
  "attached_result_artifact",
  "standard_live_review"
] as const);

export type FpResultWireProfile =
  (typeof FP_RESULT_WIRE_PROFILE_VALUES)[number];

export const FP_RESULT_CONTRACT_FAILURE_CLASS_VALUES = Object.freeze([
  "missing_selected_contract",
  "malformed_result",
  "missing_contract_identity",
  "contract_identity_mismatch",
  "missing_required_field",
  "undeclared_field"
] as const);

export type FpResultContractFailureClass =
  (typeof FP_RESULT_CONTRACT_FAILURE_CLASS_VALUES)[number];

export interface AdmittedFpResultContractEnvelope {
  readonly kind: "admitted_fp_result_contract_envelope";
  readonly profile: FpResultWireProfile;
  readonly resultContractRef: string;
  readonly payloadDigest: `sha256:${string}`;
  readonly payload: Readonly<Record<string, unknown>>;
}

export interface FpResultContractAdmissionAccepted {
  readonly kind: "fp_result_contract_admission_accepted";
  readonly accepted: true;
  readonly envelope: AdmittedFpResultContractEnvelope;
  readonly failure: null;
}

export interface FpResultContractFailure {
  readonly kind: "fp_result_contract_failure";
  readonly profile: FpResultWireProfile;
  readonly failureClass: FpResultContractFailureClass;
  readonly detail: string;
  readonly selectedResultContractRef: string | null;
  readonly submittedResultContractRef: string | null;
}

export interface FpResultContractAdmissionRejected {
  readonly kind: "fp_result_contract_admission_rejected";
  readonly accepted: false;
  readonly envelope: null;
  readonly failure: FpResultContractFailure;
}

export type FpResultContractAdmissionOutcome =
  | FpResultContractAdmissionAccepted
  | FpResultContractAdmissionRejected;

interface FpResultWireProfileDefinition {
  readonly contractRefField: "result_contract_ref" | "resultContractRef";
  readonly allowedFields: readonly string[];
  readonly requiredFields: readonly string[];
}

const ATTACHED_RESULT_ARTIFACT_FIELDS = Object.freeze([
  "result_contract_ref",
  "edge",
  "actor",
  "fulfillment_assessments"
]);

const STANDARD_LIVE_REVIEW_FIELDS = Object.freeze([
  "resultContractRef",
  "accepted",
  "closeDisposition",
  "assessmentIds",
  "reasons"
]);

const PROFILE_DEFINITIONS: Readonly<
  Record<FpResultWireProfile, FpResultWireProfileDefinition>
> = Object.freeze({
  attached_result_artifact: Object.freeze({
    contractRefField: "result_contract_ref",
    allowedFields: ATTACHED_RESULT_ARTIFACT_FIELDS,
    requiredFields: ATTACHED_RESULT_ARTIFACT_FIELDS
  }),
  standard_live_review: Object.freeze({
    contractRefField: "resultContractRef",
    allowedFields: STANDARD_LIVE_REVIEW_FIELDS,
    requiredFields: STANDARD_LIVE_REVIEW_FIELDS
  })
});

export function internalFpResultWireProfileFields(
  profile: FpResultWireProfile
): readonly string[] {
  return PROFILE_DEFINITIONS[profile].allowedFields;
}

function rejected(input: {
  readonly profile: FpResultWireProfile;
  readonly failureClass: FpResultContractFailureClass;
  readonly detail: string;
  readonly selectedResultContractRef: string | null;
  readonly submittedResultContractRef?: string | null | undefined;
}): FpResultContractAdmissionRejected {
  return Object.freeze({
    kind: "fp_result_contract_admission_rejected",
    accepted: false,
    envelope: null,
    failure: Object.freeze({
      kind: "fp_result_contract_failure",
      profile: input.profile,
      failureClass: input.failureClass,
      detail: input.detail,
      selectedResultContractRef: input.selectedResultContractRef,
      submittedResultContractRef: input.submittedResultContractRef ?? null
    })
  });
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" &&
    value.length > 0 &&
    value.trim() === value
    ? value
    : null;
}

export function admitFpResultContractEnvelope(input: {
  readonly profile: FpResultWireProfile;
  readonly selectedResultContractRef: string | null;
  readonly rawResult: unknown;
}): FpResultContractAdmissionOutcome {
  const selectedResultContractRef = nonEmptyString(
    input.selectedResultContractRef
  );
  if (selectedResultContractRef === null) {
    return rejected({
      profile: input.profile,
      failureClass: "missing_selected_contract",
      detail: "F_P result admission requires one selected result-contract ref",
      selectedResultContractRef: null
    });
  }
  if (!isPlainObject(input.rawResult)) {
    return rejected({
      profile: input.profile,
      failureClass: "malformed_result",
      detail: "F_P result must be one plain object",
      selectedResultContractRef
    });
  }
  const rawResult = input.rawResult;

  const definition = PROFILE_DEFINITIONS[input.profile];
  const submittedResultContractRef = nonEmptyString(
    rawResult[definition.contractRefField]
  );
  if (submittedResultContractRef === null) {
    return rejected({
      profile: input.profile,
      failureClass: "missing_contract_identity",
      detail: `F_P result requires ${definition.contractRefField}`,
      selectedResultContractRef
    });
  }
  if (submittedResultContractRef !== selectedResultContractRef) {
    return rejected({
      profile: input.profile,
      failureClass: "contract_identity_mismatch",
      detail: "F_P result contract does not match the selected contract",
      selectedResultContractRef,
      submittedResultContractRef
    });
  }

  const allowed = new Set(definition.allowedFields);
  const unknownFields = Object.keys(rawResult)
    .filter((field) => !allowed.has(field))
    .sort();
  if (unknownFields.length > 0) {
    return rejected({
      profile: input.profile,
      failureClass: "undeclared_field",
      detail: `F_P result contains undeclared fields: ${unknownFields.join(", ")}`,
      selectedResultContractRef,
      submittedResultContractRef
    });
  }

  const missingFields = definition.requiredFields.filter(
    (field) => !Object.hasOwn(rawResult, field)
  );
  if (missingFields.length > 0) {
    return rejected({
      profile: input.profile,
      failureClass: "missing_required_field",
      detail: `F_P result is missing required fields: ${missingFields.join(", ")}`,
      selectedResultContractRef,
      submittedResultContractRef
    });
  }

  let payload: Readonly<Record<string, unknown>>;
  let payloadDigest: `sha256:${string}`;
  try {
    const admittedPayload = admitIJsonValue(rawResult, "FpResultContractPayload");
    if (!isPlainObject(admittedPayload)) {
      throw new TypeError("expected one I-JSON object");
    }
    payload = admittedPayload;
    payloadDigest = stableSha256Digest(payload);
  } catch (error) {
    return rejected({
      profile: input.profile,
      failureClass: "malformed_result",
      detail: `F_P result is not canonical I-JSON: ${
        error instanceof Error ? error.message : String(error)
      }`,
      selectedResultContractRef,
      submittedResultContractRef
    });
  }
  return Object.freeze({
    kind: "fp_result_contract_admission_accepted",
    accepted: true,
    envelope: Object.freeze({
      kind: "admitted_fp_result_contract_envelope",
      profile: input.profile,
      resultContractRef: selectedResultContractRef,
      payloadDigest,
      payload
    }),
    failure: null
  });
}

export function requireFpResultContractEnvelope(input: {
  readonly profile: FpResultWireProfile;
  readonly selectedResultContractRef: string | null;
  readonly rawResult: unknown;
  readonly label: string;
}): AdmittedFpResultContractEnvelope {
  const outcome = admitFpResultContractEnvelope(input);
  if (!outcome.accepted) {
    throw new TypeError(
      `${input.label}: ${outcome.failure.failureClass}: ${outcome.failure.detail}`
    );
  }
  return outcome.envelope;
}
