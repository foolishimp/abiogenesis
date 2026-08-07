// Implements: REQ-L-GTL3-C-ALGEBRA-018.
// Implements: REQ-R-ABG3-PAYLOAD-006, -012, -021, -024, -028.

import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import {
  admitIJsonText,
  admitIJsonValue,
  type IJsonObject,
  type IJsonValue,
} from "../shared/i_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { isNonBlankRef } from "../shared/references.js";

export const FP_RESULT_WIRE_PROFILE_VALUES = Object.freeze([
  "attached_transform_result",
  "standard_live_review",
] as const);

export type FpResultWireProfile =
  (typeof FP_RESULT_WIRE_PROFILE_VALUES)[number];

export type FpResultCompositionStageRole =
  | "transform"
  | "evaluate"
  | "consequence"
  | "human_callout";

export interface FpResultLocusContractDefinition {
  readonly compositionStageRole: "transform" | "evaluate";
  readonly wireProfile: FpResultWireProfile;
}

const TRANSFORM_LOCUS: FpResultLocusContractDefinition = deepFreeze({
  compositionStageRole: "transform",
  wireProfile: "attached_transform_result",
});

const EVALUATE_LOCUS: FpResultLocusContractDefinition = deepFreeze({
  compositionStageRole: "evaluate",
  wireProfile: "standard_live_review",
});

export function fpResultLocusContractDefinition(
  compositionStageRole: FpResultCompositionStageRole,
): FpResultLocusContractDefinition | null {
  switch (compositionStageRole) {
    case "transform":
      return TRANSFORM_LOCUS;
    case "evaluate":
      return EVALUATE_LOCUS;
    case "consequence":
    case "human_callout":
    default:
      return null;
  }
}

export type FpResultContractFailureClass =
  | "unsupported_locus"
  | "missing_selected_contract"
  | "malformed_result"
  | "missing_contract_identity"
  | "contract_identity_mismatch"
  | "missing_required_field"
  | "undeclared_field"
  | "edge_mismatch"
  | "actor_mismatch"
  | "assessment_roster_mismatch"
  | "incomplete_result"
  | "contradictory_result";

interface AdmittedFpResultContractEnvelopeBase {
  readonly kind: "admitted_fp_result_contract_envelope";
  readonly profile: FpResultWireProfile;
  readonly resultContractRef: string;
  readonly payloadDigest: Sha256Digest;
}

export interface AdmittedFpTransformResultContractEnvelope
  extends AdmittedFpResultContractEnvelopeBase {
  readonly profile: "attached_transform_result";
  readonly resultArtifactCandidate: {
    readonly result_contract_ref: string;
    readonly edge: string;
    readonly actor: string;
    readonly fulfillment_assessments: readonly {
      readonly id: string;
      readonly evaluator: string;
      readonly fulfillment_status: "fulfilled";
      readonly fulfillment_detail: string;
      readonly blocking_reasons: readonly string[];
      readonly evidence_refs: readonly string[];
    }[];
  };
  readonly targetValueCandidate: JsonValue;
}

export interface AdmittedFpReviewResultContractEnvelope
  extends AdmittedFpResultContractEnvelopeBase {
  readonly profile: "standard_live_review";
  readonly reviewCandidate: {
    readonly resultContractRef: string;
    readonly accepted: true;
    readonly closeDisposition: "close";
    readonly assessmentIds: readonly string[];
    readonly reasons: readonly string[];
  };
}

export type AdmittedFpResultContractEnvelope =
  | AdmittedFpTransformResultContractEnvelope
  | AdmittedFpReviewResultContractEnvelope;

export interface FpResultContractFailure {
  readonly kind: "fp_result_contract_failure";
  readonly compositionStageRole: FpResultCompositionStageRole;
  readonly profile: FpResultWireProfile | null;
  readonly failureClass: FpResultContractFailureClass;
  readonly detail: string;
  readonly selectedResultContractRef: string | null;
  readonly submittedResultContractRef: string | null;
}

export interface FpResultContractAdmissionAccepted {
  readonly kind: "fp_result_contract_admission_accepted";
  readonly accepted: true;
  readonly envelope: AdmittedFpResultContractEnvelope;
  readonly failure: null;
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

interface FpResultContractAdmissionBasis {
  readonly compositionStageRole: FpResultCompositionStageRole;
  readonly selectedResultContractRef: string | null;
  readonly expectedEdge: string | null;
  readonly expectedActorRef: string | null;
  readonly expectedAssessmentRefs: readonly string[];
}

export interface FpResultContractAdmissionInput
  extends FpResultContractAdmissionBasis {
  readonly rawResult: unknown;
}

export interface FpResultContractTextAdmissionInput
  extends FpResultContractAdmissionBasis {
  readonly rawResultText: string;
}

const TRANSFORM_FIELDS = Object.freeze([
  "result_contract_ref",
  "edge",
  "actor",
  "fulfillment_assessments",
  "target_value",
]);

const REVIEW_FIELDS = Object.freeze([
  "resultContractRef",
  "accepted",
  "closeDisposition",
  "assessmentIds",
  "reasons",
]);

const ASSESSMENT_FIELDS = Object.freeze([
  "id",
  "evaluator",
  "fulfillment_status",
  "fulfillment_detail",
  "blocking_reasons",
  "evidence_refs",
]);

class AdmissionFailure extends Error {
  constructor(
    readonly failureClass: FpResultContractFailureClass,
    detail: string,
  ) {
    super(detail);
  }
}

function refuse(
  failureClass: FpResultContractFailureClass,
  detail: string,
): never {
  throw new AdmissionFailure(failureClass, detail);
}

function rejected(input: {
  readonly compositionStageRole: FpResultCompositionStageRole;
  readonly profile: FpResultWireProfile | null;
  readonly failureClass: FpResultContractFailureClass;
  readonly detail: string;
  readonly selectedResultContractRef: string | null;
  readonly submittedResultContractRef?: string | null;
}): FpResultContractAdmissionRejected {
  return deepFreeze({
    kind: "fp_result_contract_admission_rejected",
    accepted: false,
    envelope: null,
    failure: {
      kind: "fp_result_contract_failure",
      compositionStageRole: input.compositionStageRole,
      profile: input.profile,
      failureClass: input.failureClass,
      detail: input.detail,
      selectedResultContractRef: input.selectedResultContractRef,
      submittedResultContractRef: input.submittedResultContractRef ?? null,
    },
  });
}

function accepted(
  envelope: AdmittedFpResultContractEnvelope,
): FpResultContractAdmissionAccepted {
  return deepFreeze({
    kind: "fp_result_contract_admission_accepted",
    accepted: true,
    envelope,
    failure: null,
  });
}

function isPlainObject(
  value: unknown,
): value is Readonly<Record<string, unknown>> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isIJsonObject(value: IJsonValue): value is IJsonObject {
  return isPlainObject(value);
}

function isIJsonArray(value: IJsonValue): value is readonly IJsonValue[] {
  return Array.isArray(value);
}

function isUnknownArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

function isExactRef(value: unknown): value is string {
  return isNonBlankRef(value) && value.trim() === value;
}

function assertFields(
  value: Readonly<Record<string, unknown>>,
  fields: readonly string[],
  missingClass: FpResultContractFailureClass,
  label: string,
): void {
  const allowed = new Set(fields);
  const undeclared = Object.keys(value)
    .filter((field) => !allowed.has(field))
    .sort();
  if (undeclared.length > 0) {
    refuse(
      "undeclared_field",
      `${label} contains undeclared fields: ${undeclared.join(", ")}`,
    );
  }
  const missing = fields.filter((field) => !Object.hasOwn(value, field));
  if (missing.length > 0) {
    refuse(missingClass, `${label} is missing fields: ${missing.join(", ")}`);
  }
}

function required(payload: IJsonObject, field: string): IJsonValue {
  const value = payload[field];
  if (value === undefined) {
    refuse("missing_required_field", `F_P result is missing ${field}`);
  }
  return value;
}

function refArray(value: IJsonValue, label: string): readonly string[] {
  if (!isIJsonArray(value)) {
    refuse("malformed_result", `${label} must be an array`);
  }
  const refs: string[] = [];
  for (const entry of value) {
    if (!isExactRef(entry)) {
      refuse("malformed_result", `${label} must contain exact refs`);
    }
    refs.push(entry);
  }
  return Object.freeze(refs);
}

function textArray(value: IJsonValue, label: string): readonly string[] {
  if (!isIJsonArray(value)) {
    refuse("malformed_result", `${label} must be an array`);
  }
  const entries: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string" || entry.trim().length === 0) {
      refuse("malformed_result", `${label} must contain non-blank strings`);
    }
    entries.push(entry);
  }
  return Object.freeze(entries);
}

function expectedAssessmentRefs(value: unknown): readonly string[] {
  if (!isUnknownArray(value)) {
    refuse(
      "assessment_roster_mismatch",
      "F_P result admission requires a request-owned assessment roster",
    );
  }
  const refs: string[] = [];
  const seen = new Set<string>();
  for (const entry of value) {
    if (!isExactRef(entry)) {
      refuse(
        "assessment_roster_mismatch",
        "expected assessment roster contains an invalid ref",
      );
    }
    if (seen.has(entry)) {
      refuse(
        "contradictory_result",
        "expected assessment roster contains a duplicate ref",
      );
    }
    seen.add(entry);
    refs.push(entry);
  }
  return Object.freeze(refs);
}

function assertExactRoster(
  expected: readonly string[],
  actual: readonly string[],
  label: string,
): void {
  const actualSet = new Set<string>();
  for (const ref of actual) {
    if (actualSet.has(ref)) {
      refuse("contradictory_result", `${label} repeats ${JSON.stringify(ref)}`);
    }
    actualSet.add(ref);
  }
  const expectedSet = new Set(expected);
  const unexpected = actual.filter((ref) => !expectedSet.has(ref));
  if (unexpected.length > 0) {
    refuse(
      "assessment_roster_mismatch",
      `${label} contains unexpected assessments: ${unexpected.join(", ")}`,
    );
  }
  const missing = expected.filter((ref) => !actualSet.has(ref));
  if (missing.length > 0) {
    refuse(
      "incomplete_result",
      `${label} is missing assessments: ${missing.join(", ")}`,
    );
  }
}

type AdmittedAssessment = AdmittedFpTransformResultContractEnvelope[
  "resultArtifactCandidate"
]["fulfillment_assessments"][number];

function admitAssessment(value: IJsonValue, index: number): AdmittedAssessment {
  if (!isIJsonObject(value)) {
    refuse(
      "malformed_result",
      `transform assessment ${String(index)} must be an object`,
    );
  }
  assertFields(
    value,
    ASSESSMENT_FIELDS,
    "incomplete_result",
    `transform assessment ${String(index)}`,
  );
  const id = required(value, "id");
  const evaluator = required(value, "evaluator");
  const status = required(value, "fulfillment_status");
  const detail = required(value, "fulfillment_detail");
  if (!isExactRef(id) || !isExactRef(evaluator)) {
    refuse(
      "incomplete_result",
      `transform assessment ${String(index)} lacks identity attribution`,
    );
  }
  if (status !== "fulfilled") {
    if (status === "partial" || status === "blocked" || status === "unfulfilled") {
      refuse("incomplete_result", `transform assessment ${id} is not fulfilled`);
    }
    refuse("malformed_result", `transform assessment ${id} has invalid status`);
  }
  if (typeof detail !== "string" || detail.trim().length === 0) {
    refuse("incomplete_result", `transform assessment ${id} lacks detail`);
  }
  const blockingReasons = textArray(
    required(value, "blocking_reasons"),
    `transform assessment ${id} blocking_reasons`,
  );
  const evidenceRefs = refArray(
    required(value, "evidence_refs"),
    `transform assessment ${id} evidence_refs`,
  );
  if (blockingReasons.length > 0) {
    refuse(
      "contradictory_result",
      `fulfilled assessment ${id} cannot carry blocking reasons`,
    );
  }
  if (evidenceRefs.length === 0) {
    refuse("incomplete_result", `fulfilled assessment ${id} requires evidence`);
  }
  return {
    id,
    evaluator,
    fulfillment_status: "fulfilled",
    fulfillment_detail: detail,
    blocking_reasons: blockingReasons,
    evidence_refs: evidenceRefs,
  };
}

function admitTransformEnvelope(input: {
  readonly payload: IJsonObject;
  readonly selectedResultContractRef: string;
  readonly payloadDigest: Sha256Digest;
  readonly expectedEdge: string | null;
  readonly expectedActorRef: string | null;
  readonly expectedAssessmentRefs: readonly string[];
}): AdmittedFpTransformResultContractEnvelope {
  if (!isExactRef(input.expectedEdge)) {
    refuse("edge_mismatch", "transform admission requires a request-owned edge");
  }
  const edge = required(input.payload, "edge");
  if (!isExactRef(edge) || edge !== input.expectedEdge) {
    refuse("edge_mismatch", "transform result edge does not match its request");
  }
  if (!isExactRef(input.expectedActorRef)) {
    refuse("actor_mismatch", "transform admission requires a request-owned actor");
  }
  const actor = required(input.payload, "actor");
  if (!isExactRef(actor) || actor !== input.expectedActorRef) {
    refuse("actor_mismatch", "transform result actor does not match its request");
  }

  const rawAssessments = required(input.payload, "fulfillment_assessments");
  if (!isIJsonArray(rawAssessments)) {
    refuse("malformed_result", "fulfillment_assessments must be an array");
  }
  if (rawAssessments.length === 0) {
    refuse("incomplete_result", "transform result requires assessments");
  }
  const assessments = rawAssessments.map((value, index) =>
    admitAssessment(value, index),
  );
  assertExactRoster(
    input.expectedAssessmentRefs,
    assessments.map(({ id }) => id),
    "transform result",
  );
  return {
    kind: "admitted_fp_result_contract_envelope",
    profile: "attached_transform_result",
    resultContractRef: input.selectedResultContractRef,
    payloadDigest: input.payloadDigest,
    resultArtifactCandidate: {
      result_contract_ref: input.selectedResultContractRef,
      edge,
      actor,
      fulfillment_assessments: assessments,
    },
    targetValueCandidate: required(input.payload, "target_value"),
  };
}

function admitReviewEnvelope(input: {
  readonly payload: IJsonObject;
  readonly selectedResultContractRef: string;
  readonly payloadDigest: Sha256Digest;
  readonly expectedAssessmentRefs: readonly string[];
}): AdmittedFpReviewResultContractEnvelope {
  const accepted = required(input.payload, "accepted");
  const closeDisposition = required(input.payload, "closeDisposition");
  if (
    typeof accepted !== "boolean" ||
    (closeDisposition !== "close" && closeDisposition !== "retry")
  ) {
    refuse("malformed_result", "live review has invalid decision fields");
  }
  const assessmentIds = refArray(
    required(input.payload, "assessmentIds"),
    "live review assessmentIds",
  );
  const reasons = textArray(required(input.payload, "reasons"), "live review reasons");
  assertExactRoster(input.expectedAssessmentRefs, assessmentIds, "live review");
  if (
    (accepted && closeDisposition !== "close") ||
    (!accepted && closeDisposition !== "retry")
  ) {
    refuse(
      "contradictory_result",
      "live review accepted and closeDisposition are contradictory",
    );
  }
  if (!accepted) {
    refuse(
      "incomplete_result",
      reasons.length === 0
        ? "live review retry requires at least one reason"
        : "live review proposes retry rather than a complete result",
    );
  }
  return {
    kind: "admitted_fp_result_contract_envelope",
    profile: "standard_live_review",
    resultContractRef: input.selectedResultContractRef,
    payloadDigest: input.payloadDigest,
    reviewCandidate: {
      resultContractRef: input.selectedResultContractRef,
      accepted: true,
      closeDisposition: "close",
      assessmentIds,
      reasons,
    },
  };
}

export function admitFpResultContractEnvelope(
  input: FpResultContractAdmissionInput,
): FpResultContractAdmissionOutcome {
  const locus = fpResultLocusContractDefinition(input.compositionStageRole);
  if (locus === null) {
    return rejected({
      compositionStageRole: input.compositionStageRole,
      profile: null,
      failureClass: "unsupported_locus",
      detail: `F_P result admission does not support ${JSON.stringify(input.compositionStageRole)}`,
      selectedResultContractRef: null,
    });
  }
  const selectedResultContractRef = isExactRef(input.selectedResultContractRef)
    ? input.selectedResultContractRef
    : null;
  if (selectedResultContractRef === null) {
    return rejected({
      compositionStageRole: input.compositionStageRole,
      profile: locus.wireProfile,
      failureClass: "missing_selected_contract",
      detail: "F_P result admission requires one selected result-contract ref",
      selectedResultContractRef: null,
    });
  }

  let submittedResultContractRef: string | null = null;
  try {
    if (!isPlainObject(input.rawResult)) {
      refuse("malformed_result", "F_P result must be one plain I-JSON object");
    }
    const contractField =
      locus.wireProfile === "attached_transform_result"
        ? "result_contract_ref"
        : "resultContractRef";
    const fields =
      locus.wireProfile === "attached_transform_result"
        ? TRANSFORM_FIELDS
        : REVIEW_FIELDS;
    const descriptor = Object.getOwnPropertyDescriptor(
      input.rawResult,
      contractField,
    );
    if (descriptor?.get !== undefined || descriptor?.set !== undefined) {
      refuse("malformed_result", `${contractField} must be an I-JSON data member`);
    }
    if (!isExactRef(descriptor?.value)) {
      refuse("missing_contract_identity", `F_P result requires ${contractField}`);
    }
    submittedResultContractRef = descriptor.value;
    if (submittedResultContractRef !== selectedResultContractRef) {
      refuse(
        "contract_identity_mismatch",
        "F_P result contract does not match the selected contract",
      );
    }
    assertFields(input.rawResult, fields, "missing_required_field", "F_P result");

    let admittedValue: IJsonValue;
    try {
      admittedValue = admitIJsonValue(input.rawResult, "FpResultContractPayload");
    } catch (error) {
      refuse(
        "malformed_result",
        `F_P result is not exact I-JSON: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
    if (!isIJsonObject(admittedValue)) {
      refuse("malformed_result", "F_P result must admit as one I-JSON object");
    }
    const expectedRefs = expectedAssessmentRefs(input.expectedAssessmentRefs);
    const payloadDigest = sha256Canonical(admittedValue);
    const envelope =
      locus.wireProfile === "attached_transform_result"
        ? admitTransformEnvelope({
            payload: admittedValue,
            selectedResultContractRef,
            payloadDigest,
            expectedEdge: input.expectedEdge,
            expectedActorRef: input.expectedActorRef,
            expectedAssessmentRefs: expectedRefs,
          })
        : admitReviewEnvelope({
            payload: admittedValue,
            selectedResultContractRef,
            payloadDigest,
            expectedAssessmentRefs: expectedRefs,
          });
    return accepted(envelope);
  } catch (error) {
    const failureClass =
      error instanceof AdmissionFailure ? error.failureClass : "malformed_result";
    const detail = error instanceof Error ? error.message : String(error);
    return rejected({
      compositionStageRole: input.compositionStageRole,
      profile: locus.wireProfile,
      failureClass,
      detail,
      selectedResultContractRef,
      submittedResultContractRef,
    });
  }
}

export function admitFpResultContractText(
  input: FpResultContractTextAdmissionInput,
): FpResultContractAdmissionOutcome {
  const locus = fpResultLocusContractDefinition(input.compositionStageRole);
  if (locus === null) {
    return rejected({
      compositionStageRole: input.compositionStageRole,
      profile: null,
      failureClass: "unsupported_locus",
      detail: `F_P result admission does not support ${JSON.stringify(input.compositionStageRole)}`,
      selectedResultContractRef: null,
    });
  }
  const selectedResultContractRef = isExactRef(input.selectedResultContractRef)
    ? input.selectedResultContractRef
    : null;
  if (selectedResultContractRef === null) {
    return rejected({
      compositionStageRole: input.compositionStageRole,
      profile: locus.wireProfile,
      failureClass: "missing_selected_contract",
      detail: "F_P result admission requires one selected result-contract ref",
      selectedResultContractRef: null,
    });
  }
  try {
    return admitFpResultContractEnvelope({
      compositionStageRole: input.compositionStageRole,
      selectedResultContractRef,
      expectedEdge: input.expectedEdge,
      expectedActorRef: input.expectedActorRef,
      expectedAssessmentRefs: input.expectedAssessmentRefs,
      rawResult: admitIJsonText(input.rawResultText, "FpResultContractText"),
    });
  } catch (error) {
    return rejected({
      compositionStageRole: input.compositionStageRole,
      profile: locus.wireProfile,
      failureClass: "malformed_result",
      detail: `F_P result text is not exactly one I-JSON value: ${
        error instanceof Error ? error.message : String(error)
      }`,
      selectedResultContractRef,
    });
  }
}
