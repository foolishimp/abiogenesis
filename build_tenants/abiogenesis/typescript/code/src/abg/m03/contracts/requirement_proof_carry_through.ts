// Implements: T-188
// Implements: REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH

import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import type { GtlContractFulfillmentBinding } from "../../../gtl/m02/contracts/index.js";
import type {
  DerivedDependencyInstructionTruth,
  DerivedProofDepthInstructionTruth
} from "./instruction_assembly.js";
export { isPlainRecord } from "./admission_hygiene.js";
import { isPlainRecord } from "./admission_hygiene.js";

export const REQUIREMENT_PROOF_COMPUTE_STAGE_ROLE_VALUES = Object.freeze([
  "transform",
  "evaluate",
  "consequence"
] as const);

export type RequirementProofComputeStageRole =
  (typeof REQUIREMENT_PROOF_COMPUTE_STAGE_ROLE_VALUES)[number];

export type RequirementProofCarryThroughIssueKind =
  | "stage_role_mismatch"
  | "candidate_kind_not_allowed"
  | "candidate_classification_mismatch"
  | "candidate_classification_ambiguous"
  | "admission_target_not_allowed"
  | "dependency_sufficiency_gap"
  | "source_obligation_gap"
  | "fulfillment_binding_gap"
  | "proof_pairing_mismatch"
  | "evidence_role_gap"
  | "proof_obligation_gap"
  | "proof_policy_gap"
  | "proof_shape_gap"
  | "proof_strength_gap"
  | "weaker_contract_proof"
  | "depth_policy_gap"
  | "missing_depth_obligation_class"
  | "depth_class_not_applicable_unjustified"
  | "proof_strength_not_admitted"
  | "proof_strength_not_adversarially_verified"
  | "adversarial_counterexample_found"
  | "response_contract_gap"
  | "result_interface_mismatch"
  | "composition_mismatch"
  | "replay_digest_mismatch"
  | "category_collision";

export type RequirementProofClosureStatus =
  | "eligible"
  | "residual"
  | "blocked";

export interface RequirementProofCarryThroughIssue {
  readonly kind: "requirement_proof_carry_through_issue";
  readonly issueKind: RequirementProofCarryThroughIssueKind;
  readonly message: string;
  readonly evidenceRefs: readonly string[];
}

export interface RequirementProofCandidateClassificationRule {
  readonly kind: "requirement_proof_candidate_classification_rule";
  readonly ruleRef: string;
  readonly stageRole: RequirementProofComputeStageRole;
  readonly outputCandidateKind: string;
  readonly admissionTargetKind: string;
  readonly evidenceRoleRefs: readonly string[];
}

export interface RequirementProofCandidateClassificationTable {
  readonly kind: "requirement_proof_candidate_classification_table";
  readonly tableRef: string;
  readonly sourceRef: string;
  readonly rules: readonly RequirementProofCandidateClassificationRule[];
  readonly tableDigest: string;
}

export interface RequirementProofCarryThroughContract {
  readonly kind: "requirement_proof_carry_through_contract";
  readonly contractRef: string;
  readonly pluginRef: string;
  readonly stageRole: RequirementProofComputeStageRole;
  readonly resultInterfaceRef: string;
  readonly responseContractRefs: readonly string[];
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly fulfillmentBindings: readonly GtlContractFulfillmentBinding[];
  readonly proofPolicyRefs: readonly string[];
  readonly expectedEvidenceShapeRefs: readonly string[];
  readonly proofStrengthRefs: readonly string[];
  readonly depthPolicyRefs: readonly string[];
  readonly requiredDepthClassRefs: readonly string[];
  readonly fdStrengthCriterionRefs: readonly string[];
  readonly requiredAdversarialCheckRefs: readonly string[];
  // T-209 break 1 (execution-authority provenance design D1.1): the
  // closed execution-authority vocabulary. worker_turn is the default —
  // execution belongs to the typed F_P worker turn (execution-default
  // law). annealed_fd_handler is admissible ONLY carrying a ratified
  // equivalence contract ref (the T-206 annealing path); without it the
  // value is an admission error, never a silent downgrade.
  readonly executionAuthority: "worker_turn" | "annealed_fd_handler";
  readonly equivalenceContractRef: string | null;
  // T-210 break 3 (-039): the depth classes whose admitted map rows
  // project kill obligations. Domain knowledge — DECLARED downstream on
  // the contract; the kernel owns only the projection mechanism. Empty
  // means the contract projects no kill obligations (transitional).
  readonly adversarialDepthClassRefs: readonly string[];
  readonly evidenceRoleRefs: readonly string[];
  readonly outputCandidateKinds: readonly string[];
  readonly admissionTargetKinds: readonly string[];
  readonly classificationTableRef: string;
  readonly classificationTableDigest: string;
}

export interface RequirementProofCarryThroughOutputEnvelope {
  readonly kind: "requirement_proof_carry_through_output_envelope";
  readonly envelopeRef: string;
  readonly contractRef: string;
  readonly stageRole: RequirementProofComputeStageRole;
  readonly taskRole: string | null;
  readonly outputCandidateKind: string;
  readonly admissionTargetKind: string;
  readonly sourceRequirementObligationRefs: readonly string[];
  readonly evidenceRoleRefs: readonly string[];
  readonly proofObligationRefs: readonly string[];
  readonly proofPolicyRefs: readonly string[];
  readonly expectedEvidenceShapeRefs: readonly string[];
  readonly positiveEvidenceShapeRefs: readonly string[];
  readonly negativeEvidenceShapeRefs: readonly string[];
  readonly proofStrengthRefs: readonly string[];
  readonly depthPolicyRefs: readonly string[];
  readonly depthClassRefs: readonly string[];
  readonly proofStrengthAdmissionRefs: readonly string[];
  readonly fdStrengthCriterionRefs: readonly string[];
  readonly adversarialAttemptRefs: readonly string[];
  readonly counterexampleRefs: readonly string[];
  readonly responseContractRef: string;
  readonly resultInterfaceRef: string;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly replayIdentity: string;
  readonly replayDigest: string;
  readonly evidenceRefs: readonly string[];
}

export interface RequirementProofCarryThroughAdmissionAccepted {
  readonly kind: "requirement_proof_carry_through_admission_accepted";
  readonly accepted: true;
  readonly envelope: RequirementProofCarryThroughOutputEnvelope;
  readonly categoryKey: string;
  readonly issues: readonly RequirementProofCarryThroughIssue[];
}

export interface RequirementProofCarryThroughAdmissionRejected {
  readonly kind: "requirement_proof_carry_through_admission_rejected";
  readonly accepted: false;
  readonly envelope: RequirementProofCarryThroughOutputEnvelope;
  readonly categoryKey: string;
  readonly issues: readonly RequirementProofCarryThroughIssue[];
}

export type RequirementProofCarryThroughAdmission =
  | RequirementProofCarryThroughAdmissionAccepted
  | RequirementProofCarryThroughAdmissionRejected;

export interface RequirementProofCoverageProjection {
  readonly kind: "requirement_proof_coverage_projection";
  readonly projectionRef: string;
  readonly requirementId: string;
  readonly status: RequirementProofClosureStatus;
  readonly closureEligible: boolean;
  readonly requiredRequirementObligationRefs: readonly string[];
  readonly coveredRequirementObligationRefs: readonly string[];
  readonly proofObligationRefs: readonly string[];
  readonly depthPolicyRefs: readonly string[];
  readonly depthClassRefs: readonly string[];
  readonly proofStrengthAdmissionRefs: readonly string[];
  readonly dependencyGraphRefs: readonly string[];
  readonly sourceEnvelopeRefs: readonly string[];
  readonly sourceDependencyTruthRefs: readonly string[];
  readonly sourceProofDepthTruthRefs: readonly string[];
  readonly issueKinds: readonly RequirementProofCarryThroughIssueKind[];
  readonly diagnosticRefs: readonly string[];
}

function uniqueSorted<T extends string>(input: readonly T[]): readonly T[] {
  return Object.freeze([...new Set(input)].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
}

function requireRecord(
  input: unknown,
  label: string
): Readonly<Record<string, unknown>> {
  if (!isPlainRecord(input)) {
    throw new TypeError(`${label} must be an object`);
  }
  return input;
}

function requireNonEmptyString(input: unknown, label: string): string {
  if (typeof input !== "string" || input.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return input;
}

function requireNullableNonEmptyString(
  input: unknown,
  label: string
): string | null {
  if (input === undefined || input === null) {
    return null;
  }
  return requireNonEmptyString(input, label);
}

function requireStringArray(input: unknown, label: string): readonly string[] {
  if (
    !Array.isArray(input) ||
    !input.every(
      (value): value is string => typeof value === "string" && value.length > 0
    )
  ) {
    throw new TypeError(`${label} must be an array of non-empty strings`);
  }
  const rows: readonly string[] = input;
  return Object.freeze([...rows]);
}

function requireFulfillmentBindings(
  input: unknown,
  label: string
): readonly GtlContractFulfillmentBinding[] {
  if (!Array.isArray(input)) {
    throw new TypeError(`${label} must be an array`);
  }
  const rows: readonly unknown[] = input;
  return Object.freeze(
    rows.map((row, index) => {
      const prefix = `${label}[${index}]`;
      const binding = requireRecord(row, prefix);
      if (binding["kind"] !== "gtl_contract_fulfillment_binding") {
        throw new TypeError(`${prefix}.kind must be gtl_contract_fulfillment_binding`);
      }
      return Object.freeze({
        kind: "gtl_contract_fulfillment_binding" as const,
        bindingRef: requireNonEmptyString(binding["bindingRef"], `${prefix}.bindingRef`),
        obligationRef: requireNonEmptyString(binding["obligationRef"], `${prefix}.obligationRef`),
        requirementRef: requireNonEmptyString(binding["requirementRef"], `${prefix}.requirementRef`),
        productRequirementRef: requireNonEmptyString(
          binding["productRequirementRef"],
          `${prefix}.productRequirementRef`
        ),
        designObligationRef: requireNonEmptyString(
          binding["designObligationRef"],
          `${prefix}.designObligationRef`
        ),
        componentRef: requireNonEmptyString(binding["componentRef"], `${prefix}.componentRef`),
        productTargetRef: requireNonEmptyString(
          binding["productTargetRef"],
          `${prefix}.productTargetRef`
        ),
        outputSurfaceRef: requireNonEmptyString(
          binding["outputSurfaceRef"],
          `${prefix}.outputSurfaceRef`
        ),
        functionOrEntrypointRef: requireNonEmptyString(
          binding["functionOrEntrypointRef"],
          `${prefix}.functionOrEntrypointRef`
        ),
        realizationEvidenceRefs: uniqueSorted(
          requireStringArray(binding["realizationEvidenceRefs"], `${prefix}.realizationEvidenceRefs`)
        ),
        testOrExecutionEvidenceRefs: uniqueSorted(
          requireStringArray(
            binding["testOrExecutionEvidenceRefs"],
            `${prefix}.testOrExecutionEvidenceRefs`
          )
        ),
        evaluatorFindingRef: requireNonEmptyString(
          binding["evaluatorFindingRef"],
          `${prefix}.evaluatorFindingRef`
        ),
        authorityRefs: uniqueSorted(
          requireStringArray(binding["authorityRefs"], `${prefix}.authorityRefs`)
        ),
        evidenceRefs: uniqueSorted(
          requireStringArray(binding["evidenceRefs"], `${prefix}.evidenceRefs`)
        )
      });
    })
  );
}

function requireStageRole(
  input: unknown,
  label: string
): RequirementProofComputeStageRole {
  if (input !== "transform" && input !== "evaluate" && input !== "consequence") {
    throw new TypeError(`${label}: unsupported stage role ${JSON.stringify(input)}`);
  }
  return input;
}

function requireClassificationRules(
  input: unknown,
  label: string
): readonly RequirementProofCandidateClassificationRule[] {
  if (!Array.isArray(input)) {
    throw new TypeError(`${label} must be an array`);
  }
  const rows: readonly unknown[] = input;
  return Object.freeze(
    rows.map((row, index) => {
      const rule = requireRecord(row, `${label}[${index}]`);
      const evidenceRoleRefs = uniqueSorted(
        requireStringArray(rule["evidenceRoleRefs"], `${label}[${index}].evidenceRoleRefs`)
      );
      if (evidenceRoleRefs.length === 0) {
        throw new TypeError(`${label}[${index}].evidenceRoleRefs must not be empty`);
      }
      return Object.freeze({
        kind: "requirement_proof_candidate_classification_rule" as const,
        ruleRef: requireNonEmptyString(rule["ruleRef"], `${label}[${index}].ruleRef`),
        stageRole: requireStageRole(rule["stageRole"], `${label}[${index}].stageRole`),
        outputCandidateKind: requireNonEmptyString(
          rule["outputCandidateKind"],
          `${label}[${index}].outputCandidateKind`
        ),
        admissionTargetKind: requireNonEmptyString(
          rule["admissionTargetKind"],
          `${label}[${index}].admissionTargetKind`
        ),
        evidenceRoleRefs
      });
    })
  );
}

function classificationTableDigestPayload(
  input: Omit<RequirementProofCandidateClassificationTable, "kind" | "tableDigest">
): Readonly<Record<string, unknown>> {
  return Object.freeze({
    kind: "requirement_proof_candidate_classification_table",
    tableRef: input.tableRef,
    sourceRef: input.sourceRef,
    rules: input.rules
  });
}

export function requirementProofCandidateClassificationTableDigest(
  input: Omit<RequirementProofCandidateClassificationTable, "kind" | "tableDigest">
): string {
  return stableSha256Digest(classificationTableDigestPayload(input));
}

export function constructRequirementProofCandidateClassificationTable(
  rawInput: unknown
): RequirementProofCandidateClassificationTable {
  // ingress admit boundary: the body IS the validator, so the parameter
  // is honestly unknown — typed callers still assign
  const input = requireRecord(rawInput, "classification_table");
  const withoutDigest = Object.freeze({
    tableRef: requireNonEmptyString(input["tableRef"], "tableRef"),
    sourceRef: requireNonEmptyString(input["sourceRef"], "sourceRef"),
    rules: requireClassificationRules(input["rules"], "rules")
  });
  return Object.freeze({
    kind: "requirement_proof_candidate_classification_table",
    ...withoutDigest,
    tableDigest: verifiedSuppliedCarryDigest(
      input["tableDigest"],
      requirementProofCandidateClassificationTableDigest(withoutDigest),
      "classification_table.tableDigest"
    )
  });
}

function verifiedSuppliedCarryDigest(
  supplied: unknown,
  computed: string,
  label: string
): string {
  if (supplied !== undefined && supplied !== computed) {
    throw new TypeError(
      `${label}: supplied digest ${supplied} does not match computed ${computed}`
    );
  }
  return computed;
}

function issue(input: {
  readonly issueKind: RequirementProofCarryThroughIssueKind;
  readonly message: string;
  readonly evidenceRefs?: readonly string[] | undefined;
}): RequirementProofCarryThroughIssue {
  return Object.freeze({
    kind: "requirement_proof_carry_through_issue",
    issueKind: input.issueKind,
    message: input.message,
    evidenceRefs: uniqueSorted(input.evidenceRefs ?? [])
  });
}

function includesAll(
  actual: readonly string[],
  expected: readonly string[]
): boolean {
  return expected.every((item) => actual.includes(item));
}

function intersects(
  actual: readonly string[],
  expected: readonly string[]
): boolean {
  return actual.some((item) => expected.includes(item));
}

const EMPTY_CARRY_THROUGH_ISSUES: readonly RequirementProofCarryThroughIssue[] =
  Object.freeze([]);

function requireClosureStatus(
  input: unknown,
  label: string
): RequirementProofClosureStatus {
  if (input !== "eligible" && input !== "residual" && input !== "blocked") {
    throw new TypeError(`${label}: unsupported closure status ${JSON.stringify(input)}`);
  }
  return input;
}

function fulfillmentRequirementObligationRefs(
  bindings: readonly GtlContractFulfillmentBinding[]
): readonly string[] {
  return uniqueSorted(bindings.map((binding) => binding.obligationRef));
}

function fulfillmentProofObligationRefs(
  bindings: readonly GtlContractFulfillmentBinding[]
): readonly string[] {
  return uniqueSorted(bindings.flatMap((binding) => binding.testOrExecutionEvidenceRefs));
}

function replayDigestPayload(
  input: Omit<RequirementProofCarryThroughOutputEnvelope, "kind" | "replayDigest">
): Readonly<Record<string, unknown>> {
  return Object.freeze({
    kind: "requirement_proof_carry_through_output_replay",
    envelopeRef: input.envelopeRef,
    contractRef: input.contractRef,
    stageRole: input.stageRole,
    taskRole: input.taskRole,
    outputCandidateKind: input.outputCandidateKind,
    admissionTargetKind: input.admissionTargetKind,
    sourceRequirementObligationRefs: input.sourceRequirementObligationRefs,
    evidenceRoleRefs: input.evidenceRoleRefs,
    proofObligationRefs: input.proofObligationRefs,
    proofPolicyRefs: input.proofPolicyRefs,
    expectedEvidenceShapeRefs: input.expectedEvidenceShapeRefs,
    positiveEvidenceShapeRefs: input.positiveEvidenceShapeRefs,
    negativeEvidenceShapeRefs: input.negativeEvidenceShapeRefs,
    proofStrengthRefs: input.proofStrengthRefs,
    depthPolicyRefs: input.depthPolicyRefs,
    depthClassRefs: input.depthClassRefs,
    proofStrengthAdmissionRefs: input.proofStrengthAdmissionRefs,
    fdStrengthCriterionRefs: input.fdStrengthCriterionRefs,
    adversarialAttemptRefs: input.adversarialAttemptRefs,
    counterexampleRefs: input.counterexampleRefs,
    responseContractRef: input.responseContractRef,
    resultInterfaceRef: input.resultInterfaceRef,
    selectedCompositionRef: input.selectedCompositionRef,
    selectedCompositionDigest: input.selectedCompositionDigest,
    replayIdentity: input.replayIdentity,
    evidenceRefs: input.evidenceRefs
  });
}

export function requirementProofCarryThroughReplayDigest(
  input: Omit<RequirementProofCarryThroughOutputEnvelope, "kind" | "replayDigest">
): string {
  return stableSha256Digest(replayDigestPayload(input));
}

export function requirementProofCarryThroughCategoryKey(input: {
  readonly replayIdentity: string;
  readonly stageRole: RequirementProofComputeStageRole;
  readonly outputCandidateKind: string;
  readonly admissionTargetKind: string;
}): string {
  return [
    input.replayIdentity,
    input.stageRole,
    input.outputCandidateKind,
    input.admissionTargetKind
  ].join("|");
}

export const REQUIREMENT_PROOF_COVERAGE_TRUTH_REF_PREFIX =
  "abg://requirement-proof-coverage" as const;

export interface ParsedRequirementProofCoverageTruthRef {
  readonly status: RequirementProofClosureStatus;
  readonly projectionRef: string;
  readonly requirementId: string;
}

// Implements: T-188 adjudication item 6 — coverage truth refs are parseable
// and integrity-checked so event fields can be cross-validated against them.
export function parseRequirementProofCoverageTruthRef(
  ref: string
): ParsedRequirementProofCoverageTruthRef {
  const prefix = REQUIREMENT_PROOF_COVERAGE_TRUTH_REF_PREFIX + "/";
  if (!ref.startsWith(prefix)) {
    throw new TypeError(`not a requirement proof coverage truth ref: ${ref}`);
  }
  const parts = ref.slice(prefix.length).split("/");
  if (parts.length !== 4) {
    throw new TypeError(`malformed coverage truth ref: ${ref}`);
  }
  const status = requireClosureStatus(parts[0], "coverage truth ref status");
  const projectionRef = decodeURIComponent(parts[2] ?? "");
  const requirementId = decodeURIComponent(parts[3] ?? "");
  if (stableSha256Digest([projectionRef, requirementId]) !== parts[1]) {
    throw new TypeError(`coverage truth ref digest mismatch: ${ref}`);
  }
  return Object.freeze({ status, projectionRef, requirementId });
}

export function requirementAbgTruthRefFromRequirementProofCoverage(
  input: Pick<
    RequirementProofCoverageProjection,
    "kind" | "projectionRef" | "requirementId" | "status"
  >
): string {
  if (input.kind !== "requirement_proof_coverage_projection") {
    throw new TypeError(
      "requirement proof coverage truth requires RequirementProofCoverageProjection"
    );
  }
  const status = requireClosureStatus(input.status, "RequirementProofCoverageProjection.status");
  return [
    REQUIREMENT_PROOF_COVERAGE_TRUTH_REF_PREFIX,
    status,
    stableSha256Digest([input.projectionRef, input.requirementId]),
    encodeURIComponent(input.projectionRef),
    encodeURIComponent(input.requirementId)
  ].join("/");
}

export function requirementProofCoverageStatusFromTruthRef(
  ref: string
): {
  readonly status: RequirementProofClosureStatus;
  readonly projectionRef: string;
  readonly requirementId: string;
} | null {
  const prefix = `${REQUIREMENT_PROOF_COVERAGE_TRUTH_REF_PREFIX}/`;
  if (!ref.startsWith(prefix)) {
    return null;
  }
  const parts = ref.slice(prefix.length).split("/");
  if (parts.length !== 4 || !parts[1]?.startsWith("sha256:")) {
    return null;
  }
  let status: RequirementProofClosureStatus;
  let projectionRef: string;
  let requirementId: string;
  try {
    status = requireClosureStatus(parts[0], "status");
    projectionRef = decodeURIComponent(parts[2] ?? "");
    requirementId = decodeURIComponent(parts[3] ?? "");
  } catch {
    return null;
  }
  if (
    projectionRef.length === 0 ||
    requirementId.length === 0 ||
    stableSha256Digest([projectionRef, requirementId]) !== parts[1]
  ) {
    return null;
  }
  return Object.freeze({ status, projectionRef, requirementId });
}

export function projectRequirementProofCoverage(input: {
  readonly projectionRef: string;
  readonly requirementId: string;
  readonly requiredRequirementObligationRefs: readonly string[];
  readonly admissions: readonly RequirementProofCarryThroughAdmission[];
  readonly dependencyInstructionTruth: DerivedDependencyInstructionTruth | null;
  readonly proofDepthInstructionTruth: DerivedProofDepthInstructionTruth | null;
}): RequirementProofCoverageProjection {
  const projectionRef = requireNonEmptyString(input.projectionRef, "projectionRef");
  const requirementId = requireNonEmptyString(input.requirementId, "requirementId");
  const requiredRequirementObligationRefs = uniqueSorted(
    requireStringArray(
      input.requiredRequirementObligationRefs,
      "requiredRequirementObligationRefs"
    )
  );
  const acceptedAdmissions = input.admissions.filter(
    (admission): admission is RequirementProofCarryThroughAdmissionAccepted =>
      admission.accepted
  );
  const coveredRequirementObligationRefs = uniqueSorted(
    acceptedAdmissions.flatMap((admission) =>
      admission.envelope.sourceRequirementObligationRefs
    )
  );
  const proofObligationRefs = uniqueSorted(
    acceptedAdmissions.flatMap((admission) => admission.envelope.proofObligationRefs)
  );
  const depthPolicyRefs = uniqueSorted(
    acceptedAdmissions.flatMap((admission) => admission.envelope.depthPolicyRefs)
  );
  const depthClassRefs = uniqueSorted(
    acceptedAdmissions.flatMap((admission) => admission.envelope.depthClassRefs)
  );
  const proofStrengthAdmissionRefs = uniqueSorted(
    acceptedAdmissions.flatMap((admission) =>
      admission.envelope.proofStrengthAdmissionRefs
    )
  );
  const dependencyGraphRefs = uniqueSorted(
    input.dependencyInstructionTruth?.dependencyGraphRef === null ||
      input.dependencyInstructionTruth === null
      ? []
      : [input.dependencyInstructionTruth.dependencyGraphRef]
  );
  const issues: RequirementProofCarryThroughIssueKind[] = [];
  const diagnosticRefs: string[] = [];
  if (input.dependencyInstructionTruth === null) {
    issues.push("dependency_sufficiency_gap");
  } else if (
    input.dependencyInstructionTruth.workKind === "target_work" &&
    (!input.dependencyInstructionTruth.dependencyClosed ||
      input.dependencyInstructionTruth.typedPrerequisiteGapRefs.length > 0)
  ) {
    issues.push("dependency_sufficiency_gap");
    diagnosticRefs.push(...input.dependencyInstructionTruth.typedPrerequisiteGapRefs);
  }
  if (input.proofDepthInstructionTruth === null) {
    issues.push("depth_policy_gap");
  } else {
    if (!input.proofDepthInstructionTruth.depthComplete) {
      issues.push("missing_depth_obligation_class");
    }
    if (input.proofDepthInstructionTruth.typedDepthGapRefs.length > 0) {
      issues.push("missing_depth_obligation_class");
      diagnosticRefs.push(...input.proofDepthInstructionTruth.typedDepthGapRefs);
    }
    if (!input.proofDepthInstructionTruth.proofStrengthAdmitted) {
      issues.push("proof_strength_not_admitted");
    }
    if (input.proofDepthInstructionTruth.proofStrengthAdmissionRefs.length === 0) {
      issues.push("proof_strength_not_admitted");
    }
    if (
      input.proofDepthInstructionTruth.fdStrengthCriterionRefs.length === 0 &&
      input.proofDepthInstructionTruth.adversarialVerificationRefs.length === 0
    ) {
      issues.push("proof_strength_not_adversarially_verified");
    }
    if (input.proofDepthInstructionTruth.adversarialCounterexampleRefs.length > 0) {
      issues.push("adversarial_counterexample_found");
      diagnosticRefs.push(...input.proofDepthInstructionTruth.adversarialCounterexampleRefs);
    }
  }
  if (
    requiredRequirementObligationRefs.length === 0 ||
    !includesAll(coveredRequirementObligationRefs, requiredRequirementObligationRefs)
  ) {
    issues.push("source_obligation_gap");
  }
  if (proofObligationRefs.length === 0) {
    issues.push("proof_obligation_gap");
  }
  if (proofStrengthAdmissionRefs.length === 0) {
    issues.push("proof_strength_not_admitted");
  }
  const uniqueIssues: readonly RequirementProofCarryThroughIssueKind[] =
    uniqueSorted(issues);
  const blocked = uniqueIssues.includes("adversarial_counterexample_found");
  const closureEligible = uniqueIssues.length === 0;
  return Object.freeze({
    kind: "requirement_proof_coverage_projection",
    projectionRef,
    requirementId,
    status: closureEligible ? "eligible" : blocked ? "blocked" : "residual",
    closureEligible,
    requiredRequirementObligationRefs,
    coveredRequirementObligationRefs,
    proofObligationRefs,
    depthPolicyRefs: uniqueSorted([
      ...depthPolicyRefs,
      ...(input.proofDepthInstructionTruth?.depthPolicyRef === null ||
      input.proofDepthInstructionTruth === null
        ? []
        : [input.proofDepthInstructionTruth.depthPolicyRef])
    ]),
    depthClassRefs: uniqueSorted([
      ...depthClassRefs,
      ...(input.proofDepthInstructionTruth?.declaredDepthClassRefs ?? [])
    ]),
    // T-210 break 5 (read-model honesty): when depth truth is present its
    // strength refs are the CARRIER-RESOLVED closure-bearing set (T-197)
    // and the projection exposes ONLY that — a template-declared ref with
    // disposition not_admitted must not display as strength in any read
    // model. Envelope refs remain the declared surface for the
    // declaration-completeness gate above and for truth-less
    // (authoring/compile-time) callers.
    proofStrengthAdmissionRefs:
      input.proofDepthInstructionTruth === null
        ? uniqueSorted(proofStrengthAdmissionRefs)
        : uniqueSorted([
            ...input.proofDepthInstructionTruth.proofStrengthAdmissionRefs
          ]),
    dependencyGraphRefs,
    sourceEnvelopeRefs: uniqueSorted(
      acceptedAdmissions.map((admission) => admission.envelope.envelopeRef)
    ),
    sourceDependencyTruthRefs:
      input.dependencyInstructionTruth === null
        ? Object.freeze([])
        : Object.freeze([input.dependencyInstructionTruth.truthRef]),
    sourceProofDepthTruthRefs:
      input.proofDepthInstructionTruth === null
        ? Object.freeze([])
        : Object.freeze([input.proofDepthInstructionTruth.truthRef]),
    issueKinds: uniqueIssues,
    diagnosticRefs: uniqueSorted(diagnosticRefs)
  });
}

function requireExecutionAuthority(
  value: unknown,
  equivalenceContractRef: unknown
): "worker_turn" | "annealed_fd_handler" {
  const authority = value ?? "worker_turn";
  if (authority !== "worker_turn" && authority !== "annealed_fd_handler") {
    throw new TypeError(
      `executionAuthority must be worker_turn or annealed_fd_handler`
    );
  }
  if (
    authority === "annealed_fd_handler" &&
    (typeof equivalenceContractRef !== "string" ||
      equivalenceContractRef.length === 0)
  ) {
    throw new TypeError(
      "executionAuthority annealed_fd_handler requires a ratified equivalenceContractRef — F_D execution interiors arrive only by annealing (T-206), never by declaration alone"
    );
  }
  return authority;
}

export function constructRequirementProofCarryThroughContract(
  rawInput: unknown
): RequirementProofCarryThroughContract {
  const input = requireRecord(rawInput, "carry_through_contract");
  return Object.freeze({
    kind: "requirement_proof_carry_through_contract",
    contractRef: requireNonEmptyString(input["contractRef"], "contractRef"),
    pluginRef: requireNonEmptyString(input["pluginRef"], "pluginRef"),
    stageRole: requireStageRole(input["stageRole"], "stageRole"),
    resultInterfaceRef: requireNonEmptyString(input["resultInterfaceRef"], "resultInterfaceRef"),
    responseContractRefs: uniqueSorted(
      requireStringArray(input["responseContractRefs"], "responseContractRefs")
    ),
    selectedCompositionRef: requireNonEmptyString(
      input["selectedCompositionRef"],
      "selectedCompositionRef"
    ),
    selectedCompositionDigest: requireNonEmptyString(
      input["selectedCompositionDigest"],
      "selectedCompositionDigest"
    ),
    fulfillmentBindings: requireFulfillmentBindings(
      input["fulfillmentBindings"],
      "fulfillmentBindings"
    ),
    proofPolicyRefs: uniqueSorted(
      requireStringArray(input["proofPolicyRefs"], "proofPolicyRefs")
    ),
    expectedEvidenceShapeRefs: uniqueSorted(
      requireStringArray(input["expectedEvidenceShapeRefs"], "expectedEvidenceShapeRefs")
    ),
    proofStrengthRefs: uniqueSorted(
      requireStringArray(input["proofStrengthRefs"], "proofStrengthRefs")
    ),
    depthPolicyRefs: uniqueSorted(
      requireStringArray(input["depthPolicyRefs"], "depthPolicyRefs")
    ),
    requiredDepthClassRefs: uniqueSorted(
      requireStringArray(input["requiredDepthClassRefs"], "requiredDepthClassRefs")
    ),
    fdStrengthCriterionRefs: uniqueSorted(
      requireStringArray(input["fdStrengthCriterionRefs"], "fdStrengthCriterionRefs")
    ),
    requiredAdversarialCheckRefs: uniqueSorted(
      requireStringArray(
        input["requiredAdversarialCheckRefs"],
        "requiredAdversarialCheckRefs"
      )
    ),
    adversarialDepthClassRefs: uniqueSorted(
      requireStringArray(
        input["adversarialDepthClassRefs"] ?? [],
        "adversarialDepthClassRefs"
      )
    ),
    executionAuthority: requireExecutionAuthority(
      input["executionAuthority"],
      input["equivalenceContractRef"]
    ),
    equivalenceContractRef: requireNullableNonEmptyString(
      input["equivalenceContractRef"],
      "equivalenceContractRef"
    ),
    evidenceRoleRefs: uniqueSorted(
      requireStringArray(input["evidenceRoleRefs"], "evidenceRoleRefs")
    ),
    outputCandidateKinds: uniqueSorted(
      requireStringArray(input["outputCandidateKinds"], "outputCandidateKinds")
    ),
    admissionTargetKinds: uniqueSorted(
      requireStringArray(input["admissionTargetKinds"], "admissionTargetKinds")
    ),
    classificationTableRef: requireNonEmptyString(
      input["classificationTableRef"],
      "classificationTableRef"
    ),
    classificationTableDigest: requireNonEmptyString(
      input["classificationTableDigest"],
      "classificationTableDigest"
    )
  });
}

export function constructRequirementProofCarryThroughOutputEnvelope(
  rawInput: unknown
): RequirementProofCarryThroughOutputEnvelope {
  const input = requireRecord(rawInput, "carry_through_output_envelope");
  const withoutDigest = Object.freeze({
    envelopeRef: requireNonEmptyString(input["envelopeRef"], "envelopeRef"),
    contractRef: requireNonEmptyString(input["contractRef"], "contractRef"),
    stageRole: requireStageRole(input["stageRole"], "stageRole"),
    taskRole: requireNullableNonEmptyString(input["taskRole"], "taskRole"),
    outputCandidateKind: requireNonEmptyString(
      input["outputCandidateKind"],
      "outputCandidateKind"
    ),
    admissionTargetKind: requireNonEmptyString(
      input["admissionTargetKind"],
      "admissionTargetKind"
    ),
    sourceRequirementObligationRefs: uniqueSorted(
      requireStringArray(
        input["sourceRequirementObligationRefs"],
        "sourceRequirementObligationRefs"
      )
    ),
    evidenceRoleRefs: uniqueSorted(
      requireStringArray(input["evidenceRoleRefs"], "evidenceRoleRefs")
    ),
    proofObligationRefs: uniqueSorted(
      requireStringArray(input["proofObligationRefs"], "proofObligationRefs")
    ),
    proofPolicyRefs: uniqueSorted(
      requireStringArray(input["proofPolicyRefs"], "proofPolicyRefs")
    ),
    expectedEvidenceShapeRefs: uniqueSorted(
      requireStringArray(input["expectedEvidenceShapeRefs"], "expectedEvidenceShapeRefs")
    ),
    positiveEvidenceShapeRefs: uniqueSorted(
      requireStringArray(input["positiveEvidenceShapeRefs"], "positiveEvidenceShapeRefs")
    ),
    negativeEvidenceShapeRefs: uniqueSorted(
      requireStringArray(input["negativeEvidenceShapeRefs"], "negativeEvidenceShapeRefs")
    ),
    proofStrengthRefs: uniqueSorted(
      requireStringArray(input["proofStrengthRefs"], "proofStrengthRefs")
    ),
    depthPolicyRefs: uniqueSorted(
      requireStringArray(input["depthPolicyRefs"], "depthPolicyRefs")
    ),
    depthClassRefs: uniqueSorted(
      requireStringArray(input["depthClassRefs"], "depthClassRefs")
    ),
    proofStrengthAdmissionRefs: uniqueSorted(
      requireStringArray(
        input["proofStrengthAdmissionRefs"],
        "proofStrengthAdmissionRefs"
      )
    ),
    fdStrengthCriterionRefs: uniqueSorted(
      requireStringArray(input["fdStrengthCriterionRefs"], "fdStrengthCriterionRefs")
    ),
    adversarialAttemptRefs: uniqueSorted(
      requireStringArray(input["adversarialAttemptRefs"], "adversarialAttemptRefs")
    ),
    counterexampleRefs: uniqueSorted(
      requireStringArray(input["counterexampleRefs"], "counterexampleRefs")
    ),
    responseContractRef: requireNonEmptyString(
      input["responseContractRef"],
      "responseContractRef"
    ),
    resultInterfaceRef: requireNonEmptyString(input["resultInterfaceRef"], "resultInterfaceRef"),
    selectedCompositionRef: requireNonEmptyString(
      input["selectedCompositionRef"],
      "selectedCompositionRef"
    ),
    selectedCompositionDigest: requireNonEmptyString(
      input["selectedCompositionDigest"],
      "selectedCompositionDigest"
    ),
    replayIdentity: requireNonEmptyString(input["replayIdentity"], "replayIdentity"),
    evidenceRefs: uniqueSorted(requireStringArray(input["evidenceRefs"], "evidenceRefs"))
  });
  return Object.freeze({
    kind: "requirement_proof_carry_through_output_envelope",
    ...withoutDigest,
    replayDigest: verifiedSuppliedCarryDigest(
      input["replayDigest"],
      requirementProofCarryThroughReplayDigest(withoutDigest),
      "carry_through_output.replayDigest"
    )
  });
}

export function admitRequirementProofCarryThroughOutput(input: {
  readonly contract: RequirementProofCarryThroughContract;
  readonly classificationTable: RequirementProofCandidateClassificationTable;
  readonly envelope: RequirementProofCarryThroughOutputEnvelope;
  readonly existingReplayIdentities?: readonly string[] | undefined;
}): RequirementProofCarryThroughAdmission {
  const contract = constructRequirementProofCarryThroughContract(input.contract);
  const classificationTable = constructRequirementProofCandidateClassificationTable(
    input.classificationTable
  );
  // T-195 P1-9: admission canonicalizes WITHOUT trusting the claimed
  // replayDigest (the constructor rejects forged digests outright);
  // admission's own comparison below turns drift into the typed
  // replay_digest_mismatch issue instead of an exception.
  const claimedReplayDigest = input.envelope.replayDigest;
  const envelope = constructRequirementProofCarryThroughOutputEnvelope({
    ...input.envelope,
    replayDigest: undefined
  });
  const issues: RequirementProofCarryThroughIssue[] = [];
  if (
    classificationTable.tableRef !== contract.classificationTableRef ||
    classificationTable.tableDigest !== contract.classificationTableDigest
  ) {
    issues.push(
      issue({
        issueKind: "candidate_classification_mismatch",
        message: "classification table identity does not match selected plugin contract",
        evidenceRefs: [
          contract.contractRef,
          contract.classificationTableRef,
          classificationTable.tableRef
        ]
      })
    );
  }
  if (envelope.contractRef !== contract.contractRef) {
    issues.push(
      issue({
        issueKind: "result_interface_mismatch",
        message: "output envelope contract ref does not match selected plugin contract",
        evidenceRefs: [envelope.envelopeRef, contract.contractRef]
      })
    );
  }
  if (envelope.stageRole !== contract.stageRole) {
    issues.push(
      issue({
        issueKind: "stage_role_mismatch",
        message: "output envelope stage role does not match selected composition stage",
        evidenceRefs: [envelope.envelopeRef, contract.contractRef]
      })
    );
  }
  if (!contract.outputCandidateKinds.includes(envelope.outputCandidateKind)) {
    issues.push(
      issue({
        issueKind: "candidate_kind_not_allowed",
        message: "output candidate kind is not allowed by the plugin contract",
        evidenceRefs: [envelope.envelopeRef, envelope.outputCandidateKind]
      })
    );
  }
  if (!contract.admissionTargetKinds.includes(envelope.admissionTargetKind)) {
    issues.push(
      issue({
        issueKind: "admission_target_not_allowed",
        message: "admission target kind is not allowed by the plugin contract",
        evidenceRefs: [envelope.envelopeRef, envelope.admissionTargetKind]
      })
    );
  }
  const classificationMatches = classificationTable.rules.filter(
    (rule) =>
      rule.stageRole === envelope.stageRole &&
      rule.admissionTargetKind === envelope.admissionTargetKind &&
      includesAll(envelope.evidenceRoleRefs, rule.evidenceRoleRefs)
  );
  const derivedOutputCandidateKinds = uniqueSorted(
    classificationMatches.map((rule) => rule.outputCandidateKind)
  );
  if (classificationMatches.length === 0) {
    issues.push(
      issue({
        issueKind: "candidate_classification_mismatch",
        message:
          "output candidate kind is not derived from stage, admission target, and evidence role",
        evidenceRefs: [
          envelope.envelopeRef,
          envelope.outputCandidateKind,
          envelope.admissionTargetKind,
          ...envelope.evidenceRoleRefs
        ]
      })
    );
  } else if (derivedOutputCandidateKinds.length > 1) {
    issues.push(
      issue({
        issueKind: "candidate_classification_ambiguous",
        message: "output candidate kind matches more than one deterministic classification rule",
        evidenceRefs: [
          envelope.envelopeRef,
          ...classificationMatches.map((rule) => rule.ruleRef)
        ]
      })
    );
  } else if (derivedOutputCandidateKinds[0] !== envelope.outputCandidateKind) {
    issues.push(
      issue({
        issueKind: "candidate_classification_mismatch",
        message:
          "output candidate kind assertion does not match substrate-derived classification",
        evidenceRefs: [
          envelope.envelopeRef,
          envelope.outputCandidateKind,
          derivedOutputCandidateKinds[0] ?? "",
          ...classificationMatches.map((rule) => rule.ruleRef)
        ]
      })
    );
  }
  const derivedRequirementObligationRefs = fulfillmentRequirementObligationRefs(
    contract.fulfillmentBindings
  );
  const derivedProofObligationRefs = fulfillmentProofObligationRefs(
    contract.fulfillmentBindings
  );
  if (contract.fulfillmentBindings.length === 0) {
    issues.push(
      issue({
        issueKind: "fulfillment_binding_gap",
        message: "plugin contract does not carry GTL contract fulfillment binding truth",
        evidenceRefs: [contract.contractRef]
      })
    );
  }
  if (derivedProofObligationRefs.length === 0) {
    issues.push(
      issue({
        issueKind: "proof_pairing_mismatch",
        message: "plugin contract fulfillment bindings do not carry proof obligations",
        evidenceRefs: [
          contract.contractRef,
          ...contract.fulfillmentBindings.map((binding) => binding.bindingRef)
        ]
      })
    );
  }
  for (const binding of contract.fulfillmentBindings) {
    if (
      !envelope.sourceRequirementObligationRefs.includes(binding.obligationRef) ||
      !includesAll(envelope.proofObligationRefs, binding.testOrExecutionEvidenceRefs)
    ) {
      issues.push(
        issue({
          issueKind: "proof_pairing_mismatch",
          message:
            "output envelope does not preserve the requirement-to-proof pairing from GTL fulfillment binding",
          evidenceRefs: [
            envelope.envelopeRef,
            binding.bindingRef,
            binding.obligationRef,
            ...binding.testOrExecutionEvidenceRefs
          ]
        })
      );
    }
  }
  if (
    envelope.sourceRequirementObligationRefs.length === 0 ||
    !includesAll(envelope.sourceRequirementObligationRefs, derivedRequirementObligationRefs)
  ) {
    issues.push(
      issue({
        issueKind: "source_obligation_gap",
        message: "output envelope does not carry the selected requirement obligations",
        evidenceRefs: [envelope.envelopeRef, ...derivedRequirementObligationRefs]
      })
    );
  }
  if (
    envelope.evidenceRoleRefs.length === 0 ||
    !intersects(envelope.evidenceRoleRefs, contract.evidenceRoleRefs)
  ) {
    issues.push(
      issue({
        issueKind: "evidence_role_gap",
        message: "output envelope evidence role is missing or incompatible",
        evidenceRefs: [envelope.envelopeRef, ...contract.evidenceRoleRefs]
      })
    );
  }
  if (
    envelope.proofObligationRefs.length === 0 ||
    !includesAll(envelope.proofObligationRefs, derivedProofObligationRefs)
  ) {
    issues.push(
      issue({
        issueKind: "proof_obligation_gap",
        message: "output envelope does not carry expected proof-obligation identity",
        evidenceRefs: [envelope.envelopeRef, ...derivedProofObligationRefs]
      })
    );
  }
  if (
    envelope.proofPolicyRefs.length === 0 ||
    !includesAll(envelope.proofPolicyRefs, contract.proofPolicyRefs)
  ) {
    issues.push(
      issue({
        issueKind: "proof_policy_gap",
        message: "output envelope does not carry expected proof policy identity",
        evidenceRefs: [envelope.envelopeRef, ...contract.proofPolicyRefs]
      })
    );
  }
  if (
    contract.depthPolicyRefs.length > 0 &&
    (envelope.depthPolicyRefs.length === 0 ||
      !includesAll(envelope.depthPolicyRefs, contract.depthPolicyRefs))
  ) {
    issues.push(
      issue({
        issueKind: "depth_policy_gap",
        message: "output envelope does not carry expected proof-depth policy identity",
        evidenceRefs: [envelope.envelopeRef, ...contract.depthPolicyRefs]
      })
    );
  }
  // T-032 campaign BUG #10 (T-210 migration completed at this seam):
  // the envelope's DECLARED depth classes are template data demoted from
  // closure authority — requiring them to enumerate the contract's
  // required classes was the old self-declaration law, and it rejected
  // the lawful map-or-residual design (declared [] + admitted map =
  // earned depth). Depth closure is owned by the coverage projector's
  // DERIVED truth: earned classes, typed gaps, and kill obligations from
  // the admitted map. No admission check on declaration completeness.
  if (
    envelope.expectedEvidenceShapeRefs.length === 0 ||
    !includesAll(envelope.expectedEvidenceShapeRefs, contract.expectedEvidenceShapeRefs)
  ) {
    issues.push(
      issue({
        issueKind: "proof_shape_gap",
        message: "output envelope does not carry expected evidence-shape identity",
        evidenceRefs: [envelope.envelopeRef, ...contract.expectedEvidenceShapeRefs]
      })
    );
  }
  if (
    envelope.positiveEvidenceShapeRefs.length === 0 ||
    envelope.negativeEvidenceShapeRefs.length === 0
  ) {
    issues.push(
      issue({
        issueKind: "proof_shape_gap",
        message: "output envelope must preserve positive and negative proof shapes",
        evidenceRefs: [envelope.envelopeRef]
      })
    );
  }
  if (envelope.proofStrengthRefs.length === 0) {
    issues.push(
      issue({
        issueKind: "proof_strength_gap",
        message: "output envelope does not carry proof-strength identity",
        evidenceRefs: [envelope.envelopeRef]
      })
    );
  } else if (!includesAll(envelope.proofStrengthRefs, contract.proofStrengthRefs)) {
    issues.push(
      issue({
        issueKind: "weaker_contract_proof",
        message: "output envelope proof strength is weaker than the selected contract",
        evidenceRefs: [envelope.envelopeRef, ...contract.proofStrengthRefs]
      })
    );
  }
  if (envelope.proofStrengthAdmissionRefs.length === 0) {
    issues.push(
      issue({
        issueKind: "proof_strength_not_admitted",
        message: "output envelope carries no admitted proof-strength basis",
        evidenceRefs: [envelope.envelopeRef]
      })
    );
  }
  if (
    envelope.proofStrengthAdmissionRefs.length > 0 &&
    envelope.fdStrengthCriterionRefs.length === 0 &&
    envelope.adversarialAttemptRefs.length === 0
  ) {
    issues.push(
      issue({
        issueKind: "proof_strength_not_adversarially_verified",
        message:
          "output envelope proof strength is not backed by total F_D criteria or adversarial verification",
        evidenceRefs: [envelope.envelopeRef, ...envelope.proofStrengthAdmissionRefs]
      })
    );
  }
  if (
    contract.fdStrengthCriterionRefs.length > 0 &&
    !includesAll(envelope.fdStrengthCriterionRefs, contract.fdStrengthCriterionRefs)
  ) {
    issues.push(
      issue({
        issueKind: "proof_strength_not_admitted",
        message: "output envelope is missing required F_D strength criterion refs",
        evidenceRefs: [envelope.envelopeRef, ...contract.fdStrengthCriterionRefs]
      })
    );
  }
  if (
    contract.requiredAdversarialCheckRefs.length > 0 &&
    !intersects(envelope.adversarialAttemptRefs, contract.requiredAdversarialCheckRefs)
  ) {
    issues.push(
      issue({
        issueKind: "proof_strength_not_adversarially_verified",
        message: "output envelope is missing required adversarial verification refs",
        evidenceRefs: [envelope.envelopeRef, ...contract.requiredAdversarialCheckRefs]
      })
    );
  }
  if (envelope.counterexampleRefs.length > 0) {
    issues.push(
      issue({
        issueKind: "adversarial_counterexample_found",
        message: "admitted adversarial verification found a blocking counterexample",
        evidenceRefs: [envelope.envelopeRef, ...envelope.counterexampleRefs]
      })
    );
  }
  if (!contract.responseContractRefs.includes(envelope.responseContractRef)) {
    issues.push(
      issue({
        issueKind: "response_contract_gap",
        message: "output envelope response contract is not selected by the plugin contract",
        evidenceRefs: [envelope.envelopeRef, envelope.responseContractRef]
      })
    );
  }
  if (envelope.resultInterfaceRef !== contract.resultInterfaceRef) {
    issues.push(
      issue({
        issueKind: "result_interface_mismatch",
        message: "output envelope result interface does not match selected contract",
        evidenceRefs: [envelope.envelopeRef, contract.resultInterfaceRef]
      })
    );
  }
  if (
    envelope.selectedCompositionRef !== contract.selectedCompositionRef ||
    envelope.selectedCompositionDigest !== contract.selectedCompositionDigest
  ) {
    issues.push(
      issue({
        issueKind: "composition_mismatch",
        message: "output envelope composition identity does not match selected ABG composition",
        evidenceRefs: [envelope.envelopeRef, contract.selectedCompositionRef]
      })
    );
  }
  const expectedDigest = requirementProofCarryThroughReplayDigest(envelope);
  if (claimedReplayDigest !== undefined && claimedReplayDigest !== expectedDigest) {
    issues.push(
      issue({
        issueKind: "replay_digest_mismatch",
        message: "output envelope replay digest does not recompute",
        evidenceRefs: [envelope.envelopeRef, envelope.replayIdentity]
      })
    );
  }
  if ((input.existingReplayIdentities ?? []).includes(envelope.replayIdentity)) {
    issues.push(
      issue({
        issueKind: "category_collision",
        message: "output replay identity is already admitted under another category",
        evidenceRefs: [envelope.envelopeRef, envelope.replayIdentity]
      })
    );
  }
  const categoryKey = requirementProofCarryThroughCategoryKey({
    replayIdentity: envelope.replayIdentity,
    stageRole: envelope.stageRole,
    outputCandidateKind: envelope.outputCandidateKind,
    admissionTargetKind: envelope.admissionTargetKind
  });
  if (issues.length === 0) {
    return Object.freeze({
      kind: "requirement_proof_carry_through_admission_accepted",
      accepted: true,
      envelope,
      categoryKey,
      issues: EMPTY_CARRY_THROUGH_ISSUES
    });
  }
  return Object.freeze({
    kind: "requirement_proof_carry_through_admission_rejected",
    accepted: false,
    envelope,
    categoryKey,
    issues: Object.freeze(issues)
  });
}
