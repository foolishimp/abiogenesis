// Implements: T-182

import { existsSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import {
  admitGtlContractFulfillmentBinding,
  constructGtlContractFulfillmentBinding,
  type GtlContractFulfillmentBinding
} from "@abiogenesis/typescript-tenant";
import {
  parseArray,
  parseClosedRecord,
  parseEnumValue,
  parseNonEmptyString,
  parseStringList
} from "../shared/validation.js";
import { uniqueLocaleSorted as uniqueSorted } from "../shared/collections.js";
import {
  SDLC_REPAIR_SURFACE_TRIAGE_DISPOSITIONS,
  SDLC_REVIEW_GRADE_FAILURE_CLASSES,
  type SdlcRepairSurfaceTriageCarrier,
  type SdlcReviewGradeEdgeFulfillmentAdmission,
  type SdlcReviewGradeEdgeFulfillmentAssessment,
  type SdlcReviewGradeDimensionObservation,
  type SdlcReviewGradeObligationCoverageFold,
  type SdlcReviewGradeObligationFinding,
  type SdlcComponentDepthRegister,
  type SdlcComponentRealizationRow,
  type SdlcComponentTopologyRow,
  type SdlcRequirementFunctionFulfillmentBinding,
  type SdlcWorkerObligationAssessment,
  type SdlcWorkerHandoffManifest
} from "./carriers.js";
import {
  isSdlcLiveFpParallelMaterializationFrontier
} from "./live_fp_parallel_materialization_frontier.js";
import {
  sdlcReviewGradeEdgeFulfillmentAssessmentRequired
} from "./edge_output_policy.js";
import { sha256Text } from "../shared/digest.js";
import { admitComponentDepthRegisterFromArtifact } from "./component_depth_register.js";

export const REVIEW_GRADE_EDGE_FULFILLMENT_ASSESSMENT_FILE =
  "review_grade_edge_fulfillment_assessment.json";

export const REVIEW_GRADE_EDGE_FULFILLMENT_RULE_OUTCOME_FILE =
  "review_grade_edge_fulfillment_rule_outcome.json";

export const REVIEW_GRADE_EDGE_FULFILLMENT_RULE_REF =
  "evaluation-rule://odd-sdlc/review-grade-edge-fulfillment/fp";

const REVIEW_GRADE_PROMPT_NULL_BINDING_REF_PREFIX =
  "prompt-null://odd-sdlc/review-grade/fulfillment-binding";

const LIVE_FP_PARALLEL_MATERIALIZATION_FRONTIER_FILE =
  "sdlc_live_fp_parallel_materialization_frontier.json";

export interface SdlcReviewGradeReadOnlyInputFileState {
  readonly path: string;
  readonly state: "file" | "missing" | "not_file" | "unreadable";
  readonly digest: string | null;
  readonly detail: string | null;
}

export interface SdlcReviewGradeReadOnlyInputSnapshot {
  readonly kind: "sdlc_review_grade_read_only_input_snapshot";
  readonly files: readonly SdlcReviewGradeReadOnlyInputFileState[];
}

function readOnlyInputFileState(filePath: string): SdlcReviewGradeReadOnlyInputFileState {
  const resolvedPath = resolve(filePath);
  try {
    if (!existsSync(resolvedPath)) {
      return Object.freeze({
        path: resolvedPath,
        state: "missing" as const,
        digest: null,
        detail: null
      });
    }
    const stat = statSync(resolvedPath);
    if (!stat.isFile()) {
      return Object.freeze({
        path: resolvedPath,
        state: "not_file" as const,
        digest: null,
        detail: null
      });
    }
    return Object.freeze({
      path: resolvedPath,
      state: "file" as const,
      digest: sha256Text(readFileSync(resolvedPath, "utf8")),
      detail: null
    });
  } catch (error) {
    return Object.freeze({
      path: resolvedPath,
      state: "unreadable" as const,
      digest: null,
      detail: error instanceof Error ? error.message : String(error)
    });
  }
}

export function snapshotReviewGradeReadOnlyInputFiles(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: {
    readonly outputFile: string;
    readonly materializedFiles: readonly {
      readonly absolutePath: string;
    }[];
  };
  readonly additionalInputFiles?: readonly string[];
}): SdlcReviewGradeReadOnlyInputSnapshot {
  const paths = uniqueSorted([
    input.manifest.outputFile,
    input.report.outputFile,
    ...input.report.materializedFiles.map((file) => file.absolutePath),
    ...(input.additionalInputFiles ?? [])
  ].map((filePath) => resolve(filePath)));
  return Object.freeze({
    kind: "sdlc_review_grade_read_only_input_snapshot" as const,
    files: Object.freeze(paths.map(readOnlyInputFileState))
  });
}

function objectRecord(input: unknown): Record<string, unknown> | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return null;
  }
  return Object.fromEntries(Object.entries(input));
}

function readOnlyInputFileStateChanged(input: {
  readonly before: SdlcReviewGradeReadOnlyInputFileState;
  readonly after: SdlcReviewGradeReadOnlyInputFileState;
}): boolean {
  return (
    input.before.state !== input.after.state ||
    input.before.digest !== input.after.digest ||
    input.before.detail !== input.after.detail
  );
}

export function reviewGradeReadOnlyInputMutationReasons(input: {
  readonly snapshot: SdlcReviewGradeReadOnlyInputSnapshot;
}): readonly string[] {
  return uniqueSorted(
    input.snapshot.files.flatMap((before) => {
      const after = readOnlyInputFileState(before.path);
      return readOnlyInputFileStateChanged({ before, after })
        ? [
            `review_grade_evaluator_mutated_input:${pathToFileURL(before.path).href}`
          ]
        : [];
    })
  );
}

export function reviewGradeEdgeFulfillmentAssessmentRequired(
  manifest: SdlcWorkerHandoffManifest
): boolean {
  return sdlcReviewGradeEdgeFulfillmentAssessmentRequired(manifest);
}

function reviewGradeFindingIsDownstreamStagePressure(input: {
  readonly finding: SdlcReviewGradeObligationFinding;
  readonly targetAssetType?: string | undefined;
}): boolean {
  const nonMaterializedPlanningSurface = reviewGradeTargetAllowsRequirementCarryover(
    input.targetAssetType
  );
  const carryoverStatus =
    input.finding.fulfillmentStatus === "partial" ||
    input.finding.fulfillmentStatus === "blocked";
  if (
    !input.finding.obligationId.startsWith("requirement:") ||
    !carryoverStatus
  ) {
    return false;
  }
  if (input.finding.repairSurfaceTriage?.disposition === "downstream_deferred") {
    return true;
  }
  const action = input.finding.requiredAction?.toLowerCase() ?? "";
  const actionNamesDownstreamTestOrExecution =
    (action.includes("downstream") ||
      action.includes("later") ||
      action.includes("carry")) &&
    (action.includes("test") ||
      action.includes("execution") ||
      action.includes("execution evidence") ||
      action.includes("executionevidence") ||
      action.includes("test carrier") ||
      action.includes("test/execution") ||
      action.includes("derive_test_execution_result_surface") ||
      action.includes("prepare_test_execution_surface"));
  const actionNamesDownstreamRequirementRealization =
    (action.includes("downstream") ||
      action.includes("later") ||
      action.includes("carry")) &&
    (action.includes("design") ||
      action.includes("materialization") ||
      action.includes("component") ||
      action.includes("code") ||
      action.includes("test") ||
      action.includes("execution") ||
      action.includes("realization") ||
      action.includes("closure"));
  if (input.finding.failureClass === "wrong_stage") {
    return (
      (input.targetAssetType === "component_code_surface" &&
        actionNamesDownstreamTestOrExecution) ||
      (nonMaterializedPlanningSurface &&
        reviewGradePlanningTargetActionNamesLawfulDownstream({
          targetAssetType: input.targetAssetType,
          action,
          actionNamesDownstreamRequirementRealization,
          actionNamesDownstreamTestOrExecution
        }))
    );
  }
  if (
    input.targetAssetType === "component_code_surface" &&
    (input.finding.failureClass === "test_overlap_missing" ||
      input.finding.failureClass === "execution_environment")
  ) {
    return (
      action.includes("component_test_surface") ||
      action.includes("test-execution") ||
      action.includes("test execution") ||
      action.includes("execution evidence") ||
      action.includes("executionevidence") ||
      action.includes("process-exit-plus-stdout") ||
      action.includes("generated test")
    );
  }
  if (
    input.targetAssetType === "component_test_surface" &&
    input.finding.failureClass === "execution_environment"
  ) {
    return (
      action.includes("test-execution") ||
      action.includes("test execution") ||
      action.includes("execution evidence") ||
      action.includes("execution_result_surface") ||
      action.includes("runtime_execution_surface")
    );
  }
  return false;
}

function reviewGradePlanningTargetActionNamesLawfulDownstream(input: {
  readonly targetAssetType: string | undefined;
  readonly action: string;
  readonly actionNamesDownstreamRequirementRealization: boolean;
  readonly actionNamesDownstreamTestOrExecution: boolean;
}): boolean {
  if (input.targetAssetType === "test_design_surface") {
    return (
      input.action.includes("component_test_surface") ||
      input.action.includes("component test surface") ||
      input.action.includes("test-execution") ||
      input.action.includes("test execution") ||
      input.action.includes("execution evidence") ||
      input.action.includes("executionevidence") ||
      input.action.includes("derive_test_execution_result_surface") ||
      input.action.includes("prepare_test_execution_surface")
    );
  }
  return input.actionNamesDownstreamRequirementRealization;
}

function reviewGradeTargetAllowsRequirementCarryover(
  targetAssetType: string | undefined
): boolean {
  return (
    targetAssetType === "intent_surface" ||
    targetAssetType === "product_surface" ||
    targetAssetType === "goal_surface" ||
    targetAssetType === "requirement_surface" ||
    targetAssetType === "uat_testcases_surface" ||
    targetAssetType === "testcase_authority_surface" ||
    targetAssetType === "feature_decomp_surface" ||
    targetAssetType === "design_surface" ||
    targetAssetType === "scenario_surface" ||
    targetAssetType === "implementation_design_surface" ||
    targetAssetType === "test_design_surface" ||
    targetAssetType === "component_repair_schedule_surface"
  );
}

export function reviewGradeFindingsAreDownstreamStagePressure(
  findings: readonly SdlcReviewGradeObligationFinding[],
  input: { readonly targetAssetType?: string | undefined } = {}
): boolean {
  return (
    findings.length > 0 &&
    findings.every((finding) =>
      reviewGradeFindingIsDownstreamStagePressure({
        finding,
        targetAssetType: input.targetAssetType
      })
    )
  );
}

export function reviewGradeEdgeFulfillmentOpenPressureRefs(input: {
  readonly runRef: string;
  readonly assessments: readonly SdlcWorkerObligationAssessment[];
}): readonly string[] {
  return uniqueSorted(
    input.assessments.flatMap((assessment) => {
      const downstreamCarryover =
        assessment.reviewFailureClass === "wrong_stage" &&
        assessment.blockingReasons.some((reason) =>
          reason.startsWith("requirement_carried_for_downstream_closure:")
        );
      return assessment.reviewGrade === true &&
        assessment.fulfillmentStatus !== "fulfilled" &&
        !downstreamCarryover
          ? [
              `pressure://odd-sdlc/review-grade/${input.runRef}/${encodeURIComponent(assessment.obligationId)}`
            ]
          : [];
    })
  );
}

export interface SdlcReviewGradeRepairSurfaceTriageRow {
  readonly kind: "sdlc_review_grade_repair_surface_triage_row";
  readonly pressureRef: string;
  readonly obligationId: string;
  readonly triage: SdlcRepairSurfaceTriageCarrier;
}

function defaultRepairSurfaceTriageForFinding(input: {
  readonly finding: SdlcReviewGradeObligationFinding;
  readonly targetAssetType?: string | undefined;
}): SdlcRepairSurfaceTriageCarrier {
  const downstreamDeferred = reviewGradeFindingIsDownstreamStagePressure({
    finding: input.finding,
    targetAssetType: input.targetAssetType
  });
  return Object.freeze({
    kind: "sdlc_repair_surface_triage" as const,
    disposition: downstreamDeferred
      ? "downstream_deferred"
      : "current_edge_repair",
    repairGraphFunctionRef: null,
    repairGraphVectorRef: null,
    repairAssetRef: null,
    evidenceRefs: uniqueSorted([
      ...input.finding.evidenceRefs,
      ...input.finding.acceptedAuthorityRefs
    ]),
    rationale: downstreamDeferred
      ? "Finding names a lawful downstream stage, so current edge closure defers this pressure."
      : "Finding remains current-edge repair pressure until F_D admits a nonlocal repair surface."
  });
}

export function reviewGradeEdgeFulfillmentRepairSurfaceTriageRows(input: {
  readonly runRef: string;
  readonly targetAssetType?: string | undefined;
  readonly assessment: SdlcReviewGradeEdgeFulfillmentAssessment;
}): readonly SdlcReviewGradeRepairSurfaceTriageRow[] {
  return Object.freeze(
    input.assessment.findings
      .filter((finding) => finding.fulfillmentStatus !== "fulfilled")
      .map((finding) =>
        Object.freeze({
          kind: "sdlc_review_grade_repair_surface_triage_row" as const,
          pressureRef:
            `pressure://odd-sdlc/review-grade/${input.runRef}/${encodeURIComponent(finding.obligationId)}`,
          obligationId: finding.obligationId,
          triage:
            finding.repairSurfaceTriage ??
            defaultRepairSurfaceTriageForFinding({
              finding,
              targetAssetType: input.targetAssetType
            })
        })
      )
  );
}

export function reviewGradeEdgeFulfillmentAssessmentPressureRefs(input: {
  readonly runRef: string;
  readonly targetAssetType?: string | undefined;
  readonly assessment: SdlcReviewGradeEdgeFulfillmentAssessment;
}): readonly string[] {
  const openFindings = input.assessment.findings.filter(
    (finding) => finding.fulfillmentStatus !== "fulfilled"
  );
  const triageRows = reviewGradeEdgeFulfillmentRepairSurfaceTriageRows(input);
  const currentEdgePressureRows = triageRows.filter(
    (row) => row.triage.disposition !== "downstream_deferred"
  );
  if (openFindings.length > 0 && currentEdgePressureRows.length === 0) {
    return Object.freeze([]);
  }
  if (openFindings.length === 0 && input.assessment.status === "passed") {
    return Object.freeze([]);
  }
  const openPressureRefs = uniqueSorted(
    currentEdgePressureRows.map((row) => row.pressureRef)
  );
  return openPressureRefs.length > 0
    ? openPressureRefs
    : Object.freeze([
        `pressure://odd-sdlc/review-grade/${input.runRef}/assessment-status/${input.assessment.status}`
      ]);
}

function parseNullableFailureClass(
  input: unknown,
  label: string
): SdlcReviewGradeObligationFinding["failureClass"] {
  if (input === null) {
    return null;
  }
  return parseEnumValue(input, label, SDLC_REVIEW_GRADE_FAILURE_CLASSES);
}

function parseNullableRequiredAction(
  input: unknown,
  label: string
): string | null {
  if (input === null) {
    return null;
  }
  return parseNonEmptyString(input, label);
}

function parseReviewRefList(input: unknown, label: string): readonly string[] {
  if (!Array.isArray(input)) {
    return parseStringList(input, label);
  }
  return parseStringList(
    input.filter((item) => item !== null && item !== undefined),
    label
  );
}

function parseNullableRepairSurfaceTriage(
  input: unknown,
  label: string
): SdlcRepairSurfaceTriageCarrier | null {
  if (input === undefined || input === null) {
    return null;
  }
  const record = parseClosedRecord(input, label, [
    "kind",
    "disposition",
    "repairGraphFunctionRef",
    "repairGraphVectorRef",
    "repairAssetRef",
    "evidenceRefs",
    "rationale"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_repair_surface_triage") {
    throw new TypeError(`${label}.kind: unexpected repair-surface triage kind`);
  }
  const disposition = parseEnumValue(
    record["disposition"],
    `${label}.disposition`,
    SDLC_REPAIR_SURFACE_TRIAGE_DISPOSITIONS
  );
  const repairGraphFunctionRef = parseNullableRequiredAction(
    record["repairGraphFunctionRef"],
    `${label}.repairGraphFunctionRef`
  );
  const repairGraphVectorRef = parseNullableRequiredAction(
    record["repairGraphVectorRef"],
    `${label}.repairGraphVectorRef`
  );
  const repairAssetRef = parseNullableRequiredAction(
    record["repairAssetRef"],
    `${label}.repairAssetRef`
  );
  const evidenceRefs = parseReviewRefList(record["evidenceRefs"], `${label}.evidenceRefs`);
  if (evidenceRefs.length === 0) {
    throw new TypeError(`${label}.evidenceRefs: expected non-empty array`);
  }
  if (
    disposition === "upstream_reentry" &&
    (repairGraphFunctionRef === null ||
      repairGraphVectorRef === null ||
      repairAssetRef === null)
  ) {
    throw new TypeError(
      `${label}: upstream_reentry requires repairGraphFunctionRef, repairGraphVectorRef, and repairAssetRef`
    );
  }
  return Object.freeze({
    kind: "sdlc_repair_surface_triage" as const,
    disposition,
    repairGraphFunctionRef,
    repairGraphVectorRef,
    repairAssetRef,
    evidenceRefs,
    rationale: parseNonEmptyString(record["rationale"], `${label}.rationale`)
  });
}

function parseFulfillmentBinding(
  input: unknown,
  label: string,
  context: { readonly obligationId?: string } = {}
): GtlContractFulfillmentBinding {
  const record = parseClosedRecord(input, label, [
    "bindingRef",
    "kind",
    "obligationRef",
    "requirementRef",
    "productRequirementRef",
    "designObligationRef",
    "componentRef",
    "productTargetRef",
    "outputSurfaceRef",
    "functionOrEntrypointRef",
    "realizationEvidenceRefs",
    "testOrExecutionEvidenceRefs",
    "evaluatorFindingRef",
    "authorityRefs",
    "evidenceRefs"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "gtl_contract_fulfillment_binding") {
    throw new TypeError(`${label}.kind: unexpected fulfillment binding kind`);
  }
  const nullSentinel = (fieldName: string): string =>
    `${REVIEW_GRADE_PROMPT_NULL_BINDING_REF_PREFIX}/${encodeURIComponent(
      context.obligationId ?? "unknown-obligation"
    )}/${fieldName}`;
  const parseBindingString = (
    value: unknown,
    fieldLabel: string,
    fieldName: string
  ): string => {
    if (value === null) {
      return nullSentinel(fieldName);
    }
    return parseNonEmptyString(value, fieldLabel);
  };
  const obligationRef = context.obligationId ?? "";
  const bindingObligationRef =
    obligationRef.length > 0
      ? obligationRef
      : parseBindingString(
          record["obligationRef"],
          `${label}.obligationRef`,
          "obligationRef"
        );
  const nonRequirementObligation =
    !bindingObligationRef.startsWith("requirement:");
  const nonRequirementFallbackRef = (fieldName: string): string =>
    `binding-fallback://odd-sdlc/review-grade/${encodeURIComponent(
      bindingObligationRef
    )}/${fieldName}`;
  const parseBindingStringWithFallback = (
    value: unknown,
    fieldLabel: string,
    fieldName: string,
    fallback: string | null,
    options: { readonly admitNullAsFallback?: boolean } = {}
  ): string => {
    if (
      (value === undefined || (options.admitNullAsFallback === true && value === null)) &&
      fallback !== null
    ) {
      return fallback;
    }
    return parseBindingString(value, fieldLabel, fieldName);
  };
  const parseBindingStringList = (
    value: unknown,
    fieldLabel: string,
    fieldName: string
  ): readonly string[] => {
    if (value === null) {
      return Object.freeze([nullSentinel(fieldName)]);
    }
    return uniqueSorted(parseReviewRefList(value, fieldLabel));
  };
  const productTargetRef = parseBindingString(
    record["productTargetRef"],
    `${label}.productTargetRef`,
    "productTargetRef"
  );
  const productTargetFieldFallback = (fieldName: string): string =>
    `${productTargetRef}#${fieldName}`;
  const requirementRef = parseBindingStringWithFallback(
    record["requirementRef"],
    `${label}.requirementRef`,
    "requirementRef",
    nonRequirementObligation ? bindingObligationRef : null,
    { admitNullAsFallback: nonRequirementObligation }
  );
  const binding = constructGtlContractFulfillmentBinding({
    bindingRef:
      record["bindingRef"] === undefined
        ? undefined
        : parseBindingString(record["bindingRef"], `${label}.bindingRef`, "bindingRef"),
    obligationRef: bindingObligationRef,
    requirementRef,
    productRequirementRef: parseBindingStringWithFallback(
      record["productRequirementRef"],
      `${label}.productRequirementRef`,
      "productRequirementRef",
      nonRequirementObligation ? requirementRef : null,
      { admitNullAsFallback: nonRequirementObligation }
    ),
    designObligationRef: parseBindingStringWithFallback(
      record["designObligationRef"],
      `${label}.designObligationRef`,
      "designObligationRef",
      nonRequirementObligation
        ? nonRequirementFallbackRef("designObligationRef")
        : productTargetFieldFallback("designObligationRef"),
      { admitNullAsFallback: true }
    ),
    componentRef: parseBindingStringWithFallback(
      record["componentRef"],
      `${label}.componentRef`,
      "componentRef",
      nonRequirementObligation
        ? nonRequirementFallbackRef("componentRef")
        : productTargetFieldFallback("componentRef"),
      { admitNullAsFallback: true }
    ),
    productTargetRef,
    outputSurfaceRef: parseBindingString(
      record["outputSurfaceRef"],
      `${label}.outputSurfaceRef`,
      "outputSurfaceRef"
    ),
    functionOrEntrypointRef: parseBindingStringWithFallback(
      record["functionOrEntrypointRef"],
      `${label}.functionOrEntrypointRef`,
      "functionOrEntrypointRef",
      nonRequirementObligation
        ? nonRequirementFallbackRef("functionOrEntrypointRef")
        : productTargetRef,
      { admitNullAsFallback: true }
    ),
    realizationEvidenceRefs: parseBindingStringList(
      record["realizationEvidenceRefs"],
      `${label}.realizationEvidenceRefs`,
      "realizationEvidenceRefs"
    ),
    testOrExecutionEvidenceRefs: parseBindingStringList(
      record["testOrExecutionEvidenceRefs"],
      `${label}.testOrExecutionEvidenceRefs`,
      "testOrExecutionEvidenceRefs"
    ),
    evaluatorFindingRef: parseBindingString(
      record["evaluatorFindingRef"],
      `${label}.evaluatorFindingRef`,
      "evaluatorFindingRef"
    ),
    authorityRefs: parseBindingStringList(
      record["authorityRefs"],
      `${label}.authorityRefs`,
      "authorityRefs"
    ),
    evidenceRefs: parseBindingStringList(
      record["evidenceRefs"],
      `${label}.evidenceRefs`,
      "evidenceRefs"
    )
  });
  return admitGtlContractFulfillmentBinding(binding);
}

function parseNullableFulfillmentBinding(
  input: unknown,
  label: string,
  context: { readonly obligationId?: string } = {}
): SdlcRequirementFunctionFulfillmentBinding | null {
  if (input === null) {
    return null;
  }
  return parseFulfillmentBinding(input, label, context);
}

function parseReviewFinding(
  input: unknown,
  label: string
): SdlcReviewGradeObligationFinding {
  const record = parseClosedRecord(input, label, [
    "kind",
    "obligationId",
    "fulfillmentStatus",
    "failureClass",
    "requiredAction",
    "evidenceRefs",
    "acceptedAuthorityRefs",
    "fulfillmentBinding",
    "repairSurfaceTriage",
    "rationale"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_review_grade_obligation_finding") {
    throw new TypeError(`${label}.kind: unexpected review finding kind`);
  }
  const obligationId = parseNonEmptyString(
    record["obligationId"],
    `${label}.obligationId`
  );
  return Object.freeze({
    kind: "sdlc_review_grade_obligation_finding" as const,
    obligationId,
    fulfillmentStatus: parseEnumValue(
      record["fulfillmentStatus"],
      `${label}.fulfillmentStatus`,
      ["fulfilled", "partial", "blocked", "unassessed"] as const
    ),
    failureClass: parseNullableFailureClass(record["failureClass"], `${label}.failureClass`),
    requiredAction: parseNullableRequiredAction(record["requiredAction"], `${label}.requiredAction`),
    evidenceRefs: parseReviewRefList(record["evidenceRefs"], `${label}.evidenceRefs`),
    acceptedAuthorityRefs: parseReviewRefList(
      record["acceptedAuthorityRefs"],
      `${label}.acceptedAuthorityRefs`
    ),
    fulfillmentBinding: parseNullableFulfillmentBinding(
      record["fulfillmentBinding"],
      `${label}.fulfillmentBinding`,
      { obligationId }
    ),
    repairSurfaceTriage: parseNullableRepairSurfaceTriage(
      record["repairSurfaceTriage"],
      `${label}.repairSurfaceTriage`
    ),
    rationale: parseNonEmptyString(record["rationale"], `${label}.rationale`)
  });
}

function parseNonNegativeInteger(input: unknown, label: string): number {
  if (typeof input !== "number" || !Number.isInteger(input) || input < 0) {
    throw new TypeError(`${label}: expected non-negative integer`);
  }
  return input;
}

function parseOptionalReviewGradeDimensionObservation(
  input: unknown,
  label: string
): SdlcReviewGradeDimensionObservation | null {
  if (input === undefined || input === null) {
    return null;
  }
  const record = parseClosedRecord(input, label, [
    "dimension",
    "status",
    "rationale"
  ]);
  return Object.freeze({
    dimension: parseNonEmptyString(record["dimension"], `${label}.dimension`),
    status: parseNonEmptyString(record["status"], `${label}.status`),
    rationale: parseNonEmptyString(record["rationale"], `${label}.rationale`)
  });
}

function parseOptionalReviewGradeObligationCoverageFold(
  input: unknown,
  label: string
): SdlcReviewGradeObligationCoverageFold | null {
  if (input === undefined || input === null) {
    return null;
  }
  const record = parseClosedRecord(input, label, [
    "dimension",
    "coveredCount",
    "totalCount",
    "status",
    "rationale"
  ]);
  return Object.freeze({
    dimension: parseNonEmptyString(record["dimension"], `${label}.dimension`),
    coveredCount: parseNonNegativeInteger(
      record["coveredCount"],
      `${label}.coveredCount`
    ),
    totalCount: parseNonNegativeInteger(record["totalCount"], `${label}.totalCount`),
    status: parseNonEmptyString(record["status"], `${label}.status`),
    rationale: parseNonEmptyString(record["rationale"], `${label}.rationale`)
  });
}

function parseReviewAssessment(
  input: unknown,
  label: string
): SdlcReviewGradeEdgeFulfillmentAssessment {
  const record = parseClosedRecord(input, label, [
    "kind",
    "assessmentVersion",
    "graphFunctionName",
    "edgeName",
    "targetAssetType",
    "status",
    "reviewedObligationIds",
    "findings",
    "stageBoundaryConformance",
    "materializationBindingRelation",
    "obligationCoverageFold",
    "evidenceRefs",
    "summary"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_review_grade_edge_fulfillment_assessment") {
    throw new TypeError(`${label}.kind: unexpected review-grade assessment kind`);
  }
  const version = parseNonEmptyString(
    record["assessmentVersion"],
    `${label}.assessmentVersion`
  );
  if (version !== "ts-review-grade-v1") {
    throw new TypeError(`${label}.assessmentVersion: unsupported version`);
  }
  return Object.freeze({
    kind: "sdlc_review_grade_edge_fulfillment_assessment" as const,
    assessmentVersion: "ts-review-grade-v1" as const,
    graphFunctionName: parseNonEmptyString(
      record["graphFunctionName"],
      `${label}.graphFunctionName`
    ),
    edgeName: parseNonEmptyString(record["edgeName"], `${label}.edgeName`),
    targetAssetType: parseNonEmptyString(
      record["targetAssetType"],
      `${label}.targetAssetType`
    ),
    status: parseEnumValue(record["status"], `${label}.status`, [
      "passed",
      "blocked"
    ] as const),
    reviewedObligationIds: parseReviewRefList(
      record["reviewedObligationIds"],
      `${label}.reviewedObligationIds`
    ),
    findings: parseArray(record["findings"], `${label}.findings`, parseReviewFinding),
    stageBoundaryConformance: parseOptionalReviewGradeDimensionObservation(
      record["stageBoundaryConformance"],
      `${label}.stageBoundaryConformance`
    ),
    materializationBindingRelation: parseOptionalReviewGradeDimensionObservation(
      record["materializationBindingRelation"],
      `${label}.materializationBindingRelation`
    ),
    obligationCoverageFold: parseOptionalReviewGradeObligationCoverageFold(
      record["obligationCoverageFold"],
      `${label}.obligationCoverageFold`
    ),
    evidenceRefs: parseReviewRefList(record["evidenceRefs"], `${label}.evidenceRefs`),
    summary: parseNonEmptyString(record["summary"], `${label}.summary`)
  });
}

function fulfillmentBindingRequirementRefAdmitted(input: {
  readonly obligationId: string;
  readonly requirementRef: string;
  readonly productRequirementRef: string;
  readonly declaredRequirementRefs: ReadonlySet<string>;
}): boolean {
  if (input.requirementRef === input.obligationId) {
    return true;
  }
  if (input.obligationId.startsWith("requirement:")) {
    return false;
  }
  return (
    input.productRequirementRef === input.requirementRef &&
    input.declaredRequirementRefs.has(input.requirementRef)
  );
}

function fulfillmentBindingContainsPromptNullSentinel(
  binding: SdlcRequirementFunctionFulfillmentBinding
): boolean {
  const refs = [
    binding.bindingRef,
    binding.obligationRef,
    binding.requirementRef,
    binding.productRequirementRef,
    binding.designObligationRef,
    binding.componentRef,
    binding.productTargetRef,
    binding.outputSurfaceRef,
    binding.functionOrEntrypointRef,
    binding.evaluatorFindingRef,
    ...binding.realizationEvidenceRefs,
    ...binding.testOrExecutionEvidenceRefs,
    ...binding.authorityRefs,
    ...binding.evidenceRefs
  ];
  return refs.some((ref) =>
    ref.startsWith(REVIEW_GRADE_PROMPT_NULL_BINDING_REF_PREFIX)
  );
}

function slashPath(input: string): string {
  return input.split(sep).join("/");
}

function workspaceRefForPath(input: {
  readonly workspaceRoot: string;
  readonly absolutePath: string;
}): string {
  return `workspace://${slashPath(relative(input.workspaceRoot, input.absolutePath))}`;
}

function requirementRefMatches(left: string, right: string): boolean {
  return left === right || left.replace(/^requirement:/u, "") === right.replace(/^requirement:/u, "");
}

function rowRequirementRefs(
  row: SdlcComponentRealizationRow | SdlcComponentTopologyRow
): readonly string[] {
  return row.requirementIds;
}

function componentRowsForBinding(
  register: SdlcComponentDepthRegister
): readonly (SdlcComponentRealizationRow | SdlcComponentTopologyRow)[] {
  return Object.freeze([
    ...register.componentRealizationRows,
    ...register.componentTopologyRows
  ]);
}

function selectComponentRowForObligation(input: {
  readonly register: SdlcComponentDepthRegister;
  readonly obligationId: string;
  readonly requirementRef: string;
}): SdlcComponentRealizationRow | SdlcComponentTopologyRow | null {
  const rows = componentRowsForBinding(input.register);
  if (rows.length === 0) {
    return null;
  }
  if (input.obligationId.startsWith("module:")) {
    const moduleName = input.obligationId.slice("module:".length);
    return rows.find((row) => row.moduleName === moduleName) ?? null;
  }
  if (input.obligationId.startsWith("requirement:")) {
    return (
      rows.find((row) =>
        rowRequirementRefs(row).some((candidate) =>
          requirementRefMatches(candidate, input.obligationId)
        )
      ) ??
      rows.find((row) =>
        rowRequirementRefs(row).some((candidate) =>
          requirementRefMatches(candidate, input.requirementRef)
        )
      ) ?? null
    );
  }
  return (
    rows.find((row) =>
      rowRequirementRefs(row).some((candidate) =>
        requirementRefMatches(candidate, input.requirementRef)
      )
    ) ?? null
  );
}

function moduleRootWorkspaceRef(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly row: SdlcComponentRealizationRow | SdlcComponentTopologyRow;
}): string {
  const outputRef = workspaceRefForPath({
    workspaceRoot: input.manifest.workspaceRoot,
    absolutePath: input.manifest.outputFile
  }).slice("workspace://".length);
  const moduleRoot = `build_tenants/${input.row.moduleName}/`;
  const moduleIndex = outputRef.indexOf(moduleRoot);
  return moduleIndex >= 0 ? outputRef.slice(0, moduleIndex + moduleRoot.length) : "";
}

function productTargetRefForRow(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly row: SdlcComponentRealizationRow | SdlcComponentTopologyRow;
}): string {
  return `workspace://${moduleRootWorkspaceRef(input)}${slashPath(input.row.relativePath)}`;
}

function requirementRefForBinding(input: {
  readonly obligationId: string;
  readonly row: SdlcComponentRealizationRow | SdlcComponentTopologyRow;
  readonly declaredRequirementRefs: readonly string[];
}): string | null {
  if (input.obligationId.startsWith("requirement:")) {
    return input.obligationId;
  }
  const rowRef = rowRequirementRefs(input.row).find((candidate) =>
    input.declaredRequirementRefs.some((declared) =>
      requirementRefMatches(candidate, declared)
    )
  );
  if (rowRef !== undefined) {
    return input.declaredRequirementRefs.find((declared) =>
      requirementRefMatches(rowRef, declared)
    ) ?? rowRef;
  }
  return input.declaredRequirementRefs.length === 1
    ? input.declaredRequirementRefs[0] ?? null
    : null;
}

function deriveFulfillmentBindingForFinding(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly register: SdlcComponentDepthRegister;
  readonly finding: SdlcReviewGradeObligationFinding;
  readonly declaredRequirementRefs: readonly string[];
}): GtlContractFulfillmentBinding | null {
  const outputSurfaceRef = workspaceRefForPath({
    workspaceRoot: input.manifest.workspaceRoot,
    absolutePath: input.manifest.outputFile
  });
  const findingEvidenceRefs = uniqueSorted(input.finding.evidenceRefs);
  const acceptedAuthorityRefs = uniqueSorted(input.finding.acceptedAuthorityRefs);
  if (input.finding.obligationId.startsWith("source_asset:")) {
    const sourceRef =
      acceptedAuthorityRefs[0] ??
      findingEvidenceRefs.find((ref) => ref !== outputSurfaceRef) ??
      findingEvidenceRefs[0] ??
      outputSurfaceRef;
    const binding = constructGtlContractFulfillmentBinding({
      obligationRef: input.finding.obligationId,
      requirementRef: input.finding.obligationId,
      productRequirementRef: input.finding.obligationId,
      designObligationRef: sourceRef,
      componentRef: input.finding.obligationId,
      productTargetRef: sourceRef,
      outputSurfaceRef,
      functionOrEntrypointRef: `${sourceRef}#source-asset`,
      realizationEvidenceRefs: uniqueSorted([sourceRef, outputSurfaceRef]),
      testOrExecutionEvidenceRefs: findingEvidenceRefs,
      evaluatorFindingRef: `evaluation-finding://odd-sdlc/review-grade/${encodeURIComponent(input.finding.obligationId)}`,
      authorityRefs:
        acceptedAuthorityRefs.length > 0
          ? acceptedAuthorityRefs
          : Object.freeze([sourceRef]),
      evidenceRefs: findingEvidenceRefs
    });
    return admitGtlContractFulfillmentBinding(binding);
  }
  const requirementRefForRowSelection = input.finding.obligationId.startsWith(
    "requirement:"
  )
    ? input.finding.obligationId
    : input.declaredRequirementRefs[0] ?? input.finding.obligationId;
  const row = selectComponentRowForObligation({
    register: input.register,
    obligationId: input.finding.obligationId,
    requirementRef: requirementRefForRowSelection
  });
  if (row === null) {
    return null;
  }
  const requirementRef = requirementRefForBinding({
    obligationId: input.finding.obligationId,
    row,
    declaredRequirementRefs: input.declaredRequirementRefs
  });
  const designObligationRef =
    row.sourceAssetRefs[0] ??
    acceptedAuthorityRefs[0] ??
    findingEvidenceRefs[0] ??
    null;
  if (requirementRef === null || designObligationRef === null) {
    return null;
  }
  const productTargetRef = productTargetRefForRow({
    manifest: input.manifest,
    row
  });
  const gtlBinding = constructGtlContractFulfillmentBinding({
    obligationRef: input.finding.obligationId,
    requirementRef,
    productRequirementRef: requirementRef,
    designObligationRef,
    componentRef: row.componentId,
    productTargetRef,
    outputSurfaceRef,
    functionOrEntrypointRef: `${productTargetRef}#component:${row.componentId}`,
    realizationEvidenceRefs: Object.freeze([productTargetRef, outputSurfaceRef]),
    testOrExecutionEvidenceRefs: findingEvidenceRefs,
    evaluatorFindingRef: `evaluation-finding://odd-sdlc/review-grade/${encodeURIComponent(input.finding.obligationId)}`,
    authorityRefs: acceptedAuthorityRefs,
    evidenceRefs: findingEvidenceRefs
  });
  return admitGtlContractFulfillmentBinding(gtlBinding);
}

function normalizeModuleNameForReview(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "");
}

function moduleNameMatchesObligation(input: {
  readonly rowModuleName: string;
  readonly obligationModuleName: string;
}): boolean {
  return (
    input.rowModuleName === input.obligationModuleName ||
    normalizeModuleNameForReview(input.rowModuleName) ===
      normalizeModuleNameForReview(input.obligationModuleName)
  );
}

function componentRowsForModuleObligation(input: {
  readonly register: SdlcComponentDepthRegister;
  readonly obligationId: string;
}): readonly (SdlcComponentRealizationRow | SdlcComponentTopologyRow)[] {
  if (!input.obligationId.startsWith("module:")) {
    return Object.freeze([]);
  }
  const moduleName = input.obligationId.slice("module:".length);
  return Object.freeze(
    componentRowsForBinding(input.register).filter((row) =>
      moduleNameMatchesObligation({
        rowModuleName: row.moduleName,
        obligationModuleName: moduleName
      })
    )
  );
}

function declaredRequirementRefsForModuleRows(input: {
  readonly rows: readonly (SdlcComponentRealizationRow | SdlcComponentTopologyRow)[];
  readonly declaredRequirementRefs: readonly string[];
}): readonly string[] {
  return uniqueSorted(
    input.rows
      .flatMap(rowRequirementRefs)
      .flatMap((rowRef) => {
        const declared = input.declaredRequirementRefs.find((candidate) =>
          requirementRefMatches(candidate, rowRef)
        );
        return declared === undefined ? [] : [declared];
      })
  );
}

function findingIsFulfilled(
  finding: SdlcReviewGradeObligationFinding | undefined
): boolean {
  return finding?.fulfillmentStatus === "fulfilled";
}

function structuralReviewPrerequisitesFulfilled(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly findingsById: ReadonlyMap<string, SdlcReviewGradeObligationFinding>;
}): boolean {
  return input.manifest.traversalObligationContext.obligations
    .filter(
      (obligation) =>
        obligation.obligationId.startsWith("target_asset:") ||
        obligation.obligationId.startsWith("source_asset:")
    )
    .every((obligation) =>
      findingIsFulfilled(input.findingsById.get(obligation.obligationId))
    );
}

function synthesizeFulfilledModuleReviewFinding(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly register: SdlcComponentDepthRegister;
  readonly obligationId: string;
  readonly declaredRequirementRefs: readonly string[];
  readonly findingsById: ReadonlyMap<string, SdlcReviewGradeObligationFinding>;
}): SdlcReviewGradeObligationFinding | null {
  const rows = componentRowsForModuleObligation({
    register: input.register,
    obligationId: input.obligationId
  });
  if (rows.length === 0) {
    return null;
  }
  const moduleRequirementRefs = declaredRequirementRefsForModuleRows({
    rows,
    declaredRequirementRefs: input.declaredRequirementRefs
  });
  if (
    moduleRequirementRefs.length === 0 ||
    moduleRequirementRefs.some(
      (requirementRef) => !findingIsFulfilled(input.findingsById.get(requirementRef))
    ) ||
    !structuralReviewPrerequisitesFulfilled({
      manifest: input.manifest,
      findingsById: input.findingsById
    })
  ) {
    return null;
  }
  const outputSurfaceRef = workspaceRefForPath({
    workspaceRoot: input.manifest.workspaceRoot,
    absolutePath: input.manifest.outputFile
  });
  const rowProductTargets = uniqueSorted(
    rows.map((row) =>
      productTargetRefForRow({
        manifest: input.manifest,
        row
      })
    )
  );
  const requirementFindings = moduleRequirementRefs.flatMap((requirementRef) => {
    const finding = input.findingsById.get(requirementRef);
    return finding === undefined ? [] : [finding];
  });
  const evidenceRefs = uniqueSorted([
    outputSurfaceRef,
    ...rowProductTargets,
    ...requirementFindings.flatMap((finding) => finding.evidenceRefs)
  ]);
  const acceptedAuthorityRefs = uniqueSorted([
    ...rows.flatMap((row) => row.sourceAssetRefs),
    ...requirementFindings.flatMap((finding) => finding.acceptedAuthorityRefs)
  ]);
  const findingWithoutBinding: SdlcReviewGradeObligationFinding = Object.freeze({
    kind: "sdlc_review_grade_obligation_finding" as const,
    obligationId: input.obligationId,
    fulfillmentStatus: "fulfilled" as const,
    failureClass: null,
    requiredAction: null,
    evidenceRefs,
    acceptedAuthorityRefs:
      acceptedAuthorityRefs.length > 0
        ? acceptedAuthorityRefs
        : Object.freeze([`module://${input.obligationId.slice("module:".length)}`]),
    fulfillmentBinding: null,
    repairSurfaceTriage: null,
    rationale:
      "Deterministic module coverage fold: all admitted requirement findings owned by this module are fulfilled and the component-depth carrier binds the module to materialized product targets."
  });
  const fulfillmentBinding = deriveFulfillmentBindingForFinding({
    manifest: input.manifest,
    register: input.register,
    finding: findingWithoutBinding,
    declaredRequirementRefs: input.declaredRequirementRefs
  });
  return fulfillmentBinding === null
    ? null
    : Object.freeze({
        ...findingWithoutBinding,
        fulfillmentBinding
      });
}

function canonicalizeReviewAssessmentModuleCoverage(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly register: SdlcComponentDepthRegister;
  readonly assessment: SdlcReviewGradeEdgeFulfillmentAssessment;
  readonly declaredRequirementRefs: readonly string[];
}): SdlcReviewGradeEdgeFulfillmentAssessment {
  const reviewed = new Set(input.assessment.reviewedObligationIds);
  const findingsById = new Map(
    input.assessment.findings.map((finding) => [finding.obligationId, finding])
  );
  const synthesizedFindings = input.manifest.traversalObligationContext.obligations
    .filter(
      (obligation) =>
        obligation.obligationId.startsWith("module:") &&
        !reviewed.has(obligation.obligationId)
    )
    .flatMap((obligation) => {
      const finding = synthesizeFulfilledModuleReviewFinding({
        manifest: input.manifest,
        register: input.register,
        obligationId: obligation.obligationId,
        declaredRequirementRefs: input.declaredRequirementRefs,
        findingsById
      });
      if (finding !== null) {
        findingsById.set(finding.obligationId, finding);
      }
      return finding === null ? [] : [finding];
    });
  if (synthesizedFindings.length === 0) {
    return input.assessment;
  }
  const reviewedObligationIds = Object.freeze([
    ...input.assessment.reviewedObligationIds,
    ...synthesizedFindings.map((finding) => finding.obligationId)
  ]);
  const findings = Object.freeze([
    ...input.assessment.findings,
    ...synthesizedFindings
  ]);
  const fulfilledCount = findings.filter(
    (finding) => finding.fulfillmentStatus === "fulfilled"
  ).length;
  const obligationCoverageFold =
    input.assessment.obligationCoverageFold === null
      ? null
      : Object.freeze({
          ...input.assessment.obligationCoverageFold,
          coveredCount: fulfilledCount,
          totalCount: reviewedObligationIds.length,
          status:
            fulfilledCount === reviewedObligationIds.length
              ? "covered"
              : input.assessment.obligationCoverageFold.status,
          rationale:
            `${input.assessment.obligationCoverageFold.rationale} Deterministic module coverage synthesis added ${synthesizedFindings.length} fulfilled module finding(s).`
        });
  return Object.freeze({
    ...input.assessment,
    reviewedObligationIds,
    findings,
    obligationCoverageFold,
    evidenceRefs: uniqueSorted([
      ...input.assessment.evidenceRefs,
      ...synthesizedFindings.flatMap((finding) => finding.evidenceRefs)
    ])
  });
}

function fullComponentCodeBuilderReviewEdge(
  manifest: SdlcWorkerHandoffManifest
): boolean {
  return (
    manifest.graphFunctionName === "derive_component_code_surface" &&
    manifest.edgeName === "derive_component_code_surface" &&
    manifest.targetAssetType === "component_code_surface" &&
    manifest.productMaterialization.required
  );
}

function codeBuilderFrontierReviewGap(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
}): {
  readonly code:
    | "code_builder_parallel_frontier_missing"
    | "code_builder_parallel_test_lanes_missing";
  readonly detail: string;
  readonly evidenceRefs: readonly string[];
} | null {
  if (!fullComponentCodeBuilderReviewEdge(input.manifest)) {
    return null;
  }
  const frontierPath = join(
    input.manifest.archiveRoot,
    LIVE_FP_PARALLEL_MATERIALIZATION_FRONTIER_FILE
  );
  const frontierRef = pathToFileURL(frontierPath).href;
  if (!existsSync(frontierPath) || !statSync(frontierPath).isFile()) {
    return Object.freeze({
      code: "code_builder_parallel_frontier_missing" as const,
      detail: LIVE_FP_PARALLEL_MATERIALIZATION_FRONTIER_FILE,
      evidenceRefs: Object.freeze([frontierRef])
    });
  }
  try {
    const parsed: unknown = JSON.parse(readFileSync(frontierPath, "utf8"));
    if (!isSdlcLiveFpParallelMaterializationFrontier(parsed)) {
      throw new TypeError("frontier carrier shape invalid");
    }
    if (
      parsed.devLaneCount <= 0 ||
      parsed.componentTestLaneCount <= 0 ||
      parsed.uatTestLaneCount <= 0
    ) {
      return Object.freeze({
        code: "code_builder_parallel_test_lanes_missing" as const,
        detail:
          `dev=${parsed.devLaneCount}; componentTest=${parsed.componentTestLaneCount}; uatTest=${parsed.uatTestLaneCount}`,
        evidenceRefs: Object.freeze([frontierRef])
      });
    }
  } catch (error) {
    return Object.freeze({
      code: "code_builder_parallel_frontier_missing" as const,
      detail: error instanceof Error ? error.message : "frontier_parse_failed",
      evidenceRefs: Object.freeze([frontierRef])
    });
  }
  return null;
}

function canonicalizeReviewAssessmentCodeBuilderFrontier(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly assessment: SdlcReviewGradeEdgeFulfillmentAssessment;
}): SdlcReviewGradeEdgeFulfillmentAssessment {
  const gap = codeBuilderFrontierReviewGap({ manifest: input.manifest });
  if (gap === null) {
    return input.assessment;
  }
  const fallbackObligationId =
    input.assessment.reviewedObligationIds.find((obligationId) =>
      obligationId.startsWith("target_asset:")
    ) ??
    input.assessment.reviewedObligationIds[0] ??
    input.manifest.traversalObligationContext.obligations[0]?.obligationId ??
    "target_asset:component_code_surface";
  const existingFinding = input.assessment.findings.find(
    (finding) => finding.obligationId === fallbackObligationId
  );
  const outputRef = pathToFileURL(input.manifest.outputFile).href;
  const evidenceRefs = uniqueSorted([
    ...(existingFinding?.evidenceRefs ?? []),
    outputRef,
    ...gap.evidenceRefs
  ]);
  const acceptedAuthorityRefs = uniqueSorted([
    ...(existingFinding?.acceptedAuthorityRefs ?? []),
    outputRef
  ]);
  const blockedFinding: SdlcReviewGradeObligationFinding = Object.freeze({
    kind: "sdlc_review_grade_obligation_finding" as const,
    obligationId: fallbackObligationId,
    fulfillmentStatus: "blocked" as const,
    failureClass: "test_overlap_missing" as const,
    requiredAction:
      "Materialize the code-builder frontier with nonzero source, component-test, and UAT-test lanes, then retry derive_component_code_surface.",
    evidenceRefs,
    acceptedAuthorityRefs,
    fulfillmentBinding: existingFinding?.fulfillmentBinding ?? null,
    repairSurfaceTriage: Object.freeze({
      kind: "sdlc_repair_surface_triage" as const,
      disposition: "current_edge_repair" as const,
      repairGraphFunctionRef: null,
      repairGraphVectorRef: null,
      repairAssetRef: null,
      evidenceRefs,
      rationale:
        "Full component-code review cannot pass without the source/component-test/UAT frontier; retry the current code-builder edge."
    }),
    rationale:
      `Deterministic code-builder review failed: ${gap.code} (${gap.detail}).`
  });
  const findings = Object.freeze(
    existingFinding === undefined
      ? [...input.assessment.findings, blockedFinding]
      : input.assessment.findings.map((finding) =>
          finding.obligationId === fallbackObligationId ? blockedFinding : finding
        )
  );
  const fulfilledCount = findings.filter(
    (finding) => finding.fulfillmentStatus === "fulfilled"
  ).length;
  const reviewedObligationIds = uniqueSorted([
    ...input.assessment.reviewedObligationIds,
    fallbackObligationId
  ]);
  return Object.freeze({
    ...input.assessment,
    status: "blocked" as const,
    reviewedObligationIds,
    findings,
    obligationCoverageFold:
      input.assessment.obligationCoverageFold === null
        ? null
        : Object.freeze({
            ...input.assessment.obligationCoverageFold,
            coveredCount: fulfilledCount,
            totalCount: findings.length,
            status: "blocked",
            rationale:
              `${input.assessment.obligationCoverageFold.rationale} Deterministic code-builder frontier validation blocked source-only closure.`
          }),
    evidenceRefs: uniqueSorted([
      ...input.assessment.evidenceRefs,
      outputRef,
      ...gap.evidenceRefs
    ]),
    summary:
      `${input.assessment.summary} Deterministic code-builder frontier validation blocked source-only closure: ${gap.code}.`
  });
}

function canonicalizeReviewAssessmentFulfillmentBindings(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly assessment: SdlcReviewGradeEdgeFulfillmentAssessment;
}): SdlcReviewGradeEdgeFulfillmentAssessment {
  const frontierAssessment = canonicalizeReviewAssessmentCodeBuilderFrontier({
    manifest: input.manifest,
    assessment: input.assessment
  });
  if (input.manifest.targetAssetType !== "component_code_surface") {
    return frontierAssessment;
  }
  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: input.manifest.targetAssetType,
    outputFile: input.manifest.outputFile
  });
  if (admission.status !== "admitted" || admission.register === null) {
    return frontierAssessment;
  }
  const register = admission.register;
  const declaredRequirementRefs = input.manifest.traversalObligationContext.obligations
    .filter(
      (obligation) =>
        obligation.obligationKind === "requirement" ||
        obligation.obligationId.startsWith("requirement:")
      )
      .map((obligation) => obligation.obligationId);
  const boundAssessment = Object.freeze({
    ...frontierAssessment,
    findings: Object.freeze(
      frontierAssessment.findings.map((finding) => {
        if (finding.fulfillmentStatus !== "fulfilled") {
          return finding;
        }
        const fulfillmentBinding = deriveFulfillmentBindingForFinding({
          manifest: input.manifest,
          register,
          finding,
          declaredRequirementRefs
        });
        return fulfillmentBinding === null
          ? finding
          : Object.freeze({
              ...finding,
              fulfillmentBinding
            });
      })
    )
  });
  return canonicalizeReviewAssessmentModuleCoverage({
    manifest: input.manifest,
    register,
    assessment: boundAssessment,
    declaredRequirementRefs
  });
}

function expectedReviewObligationIdsForManifest(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  const fallback = manifest.traversalObligationContext.obligations.map(
    (obligation) => obligation.obligationId
  );
  if (manifest.featureScope.mode === "full_breadth") {
    return Object.freeze(fallback);
  }
  const invocationPackagePath = join(
    manifest.archiveRoot,
    "worker_invocation_package.json"
  );
  if (!existsSync(invocationPackagePath) || !statSync(invocationPackagePath).isFile()) {
    return Object.freeze(fallback);
  }
  try {
    const candidate: unknown = JSON.parse(readFileSync(invocationPackagePath, "utf8"));
    const record = objectRecord(candidate);
    if (record === null) {
      return Object.freeze(fallback);
    }
    const kind = parseNonEmptyString(
      record["kind"],
      "ReviewGrade.workerInvocationPackage.kind"
    );
    if (kind !== "sdlc_worker_invocation_package") {
      return Object.freeze(fallback);
    }
    const inlineObligationIds = parseStringList(
      record["inlineObligationIds"],
      "ReviewGrade.workerInvocationPackage.inlineObligationIds"
    );
    return inlineObligationIds.length === 0
      ? Object.freeze(fallback)
      : uniqueSorted(inlineObligationIds);
  } catch {
    return Object.freeze(fallback);
  }
}

function assessmentValidationErrors(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly assessment: SdlcReviewGradeEdgeFulfillmentAssessment;
}): readonly string[] {
  const errors: string[] = [];
  const { manifest, assessment } = input;
  if (assessment.graphFunctionName !== manifest.graphFunctionName) {
    errors.push("review_grade_graph_function_mismatch");
  }
  if (assessment.edgeName !== manifest.edgeName) {
    errors.push("review_grade_edge_mismatch");
  }
  if (assessment.targetAssetType !== manifest.targetAssetType) {
    errors.push("review_grade_target_asset_mismatch");
  }
  const expectedReviewObligationIds =
    expectedReviewObligationIdsForManifest(manifest);
  const declared = new Set(expectedReviewObligationIds);
  const declaredRequirementRefs = new Set(
    manifest.traversalObligationContext.obligations
      .filter(
        (obligation) =>
          obligation.obligationKind === "requirement" ||
          obligation.obligationId.startsWith("requirement:")
      )
      .map((obligation) => obligation.obligationId)
  );
  const reviewed = new Set(assessment.reviewedObligationIds);
  const findingsById = new Map(
    assessment.findings.map((finding) => [finding.obligationId, finding])
  );
  if (assessment.evidenceRefs.length === 0) {
    errors.push("review_grade_assessment_evidence_missing");
  }
  if (reviewed.size !== assessment.reviewedObligationIds.length) {
    errors.push("review_grade_reviewed_obligation_duplicate");
  }
  if (findingsById.size !== assessment.findings.length) {
    errors.push("review_grade_finding_duplicate");
  }
  const sparseRequirementCarryoverAllowed =
    reviewGradeTargetAllowsRequirementCarryover(manifest.targetAssetType);
  for (const obligation of manifest.traversalObligationContext.obligations) {
    if (!declared.has(obligation.obligationId)) {
      continue;
    }
    const requirementObligation =
      obligation.obligationKind === "requirement" ||
      obligation.obligationId.startsWith("requirement:");
    if (
      !reviewed.has(obligation.obligationId) &&
      !(sparseRequirementCarryoverAllowed && requirementObligation)
    ) {
      errors.push(`review_grade_obligation_unreviewed:${obligation.obligationId}`);
    }
  }
  for (const obligationId of assessment.reviewedObligationIds) {
    if (!declared.has(obligationId)) {
      errors.push(`review_grade_obligation_extra:${obligationId}`);
    }
  }
  for (const finding of assessment.findings) {
    if (!declared.has(finding.obligationId)) {
      errors.push(`review_grade_finding_extra:${finding.obligationId}`);
    }
    if (finding.evidenceRefs.length === 0) {
      errors.push(`review_grade_finding_evidence_missing:${finding.obligationId}`);
    }
    if (finding.acceptedAuthorityRefs.length === 0) {
      errors.push(`review_grade_finding_authority_missing:${finding.obligationId}`);
    }
    if (
      finding.fulfillmentBinding !== null &&
      fulfillmentBindingContainsPromptNullSentinel(finding.fulfillmentBinding)
    ) {
      errors.push(`review_grade_fulfillment_binding_prompt_null:${finding.obligationId}`);
    }
    if (
      finding.fulfillmentBinding !== null &&
      !fulfillmentBindingRequirementRefAdmitted({
        obligationId: finding.obligationId,
        requirementRef: finding.fulfillmentBinding.requirementRef,
        productRequirementRef: finding.fulfillmentBinding.productRequirementRef,
        declaredRequirementRefs
      })
    ) {
      errors.push(`review_grade_fulfillment_binding_requirement_mismatch:${finding.obligationId}`);
    }
    if (
      manifest.targetAssetType === "component_code_surface" &&
      finding.fulfillmentStatus === "fulfilled" &&
      finding.fulfillmentBinding === null
    ) {
      errors.push(`review_grade_function_binding_missing:${finding.obligationId}`);
    }
    if (
      finding.fulfillmentBinding !== null &&
      finding.fulfillmentBinding.realizationEvidenceRefs.length === 0
    ) {
      errors.push(`review_grade_realization_evidence_missing:${finding.obligationId}`);
    }
    if (finding.fulfillmentStatus === "fulfilled") {
      if (finding.failureClass !== null) {
        errors.push(`review_grade_fulfilled_failure_class:${finding.obligationId}`);
      }
      if (finding.requiredAction !== null) {
        errors.push(`review_grade_fulfilled_required_action:${finding.obligationId}`);
      }
    } else {
      if (finding.failureClass === null) {
        errors.push(`review_grade_open_failure_class_missing:${finding.obligationId}`);
      }
      if (finding.requiredAction === null) {
        errors.push(`review_grade_open_required_action_missing:${finding.obligationId}`);
      }
    }
  }
  for (const obligationId of assessment.reviewedObligationIds) {
    if (!findingsById.has(obligationId)) {
      errors.push(`review_grade_finding_missing:${obligationId}`);
    }
  }
  const openFindings = assessment.findings.filter(
    (finding) => finding.fulfillmentStatus !== "fulfilled"
  );
  const openFindingsAreDownstreamStagePressure =
    openFindings.length > 0 &&
    reviewGradeFindingsAreDownstreamStagePressure(openFindings, {
      targetAssetType: manifest.targetAssetType
    });
  if (
    assessment.status === "passed" &&
    openFindings.length > 0 &&
    !openFindingsAreDownstreamStagePressure
  ) {
    errors.push("review_grade_passed_with_open_findings");
  }
  if (
    assessment.status === "blocked" &&
    assessment.findings.every((finding) => finding.fulfillmentStatus === "fulfilled")
  ) {
    errors.push("review_grade_blocked_without_open_findings");
  }
  if (
    assessment.status === "blocked" &&
    openFindingsAreDownstreamStagePressure
  ) {
    errors.push("review_grade_blocked_with_only_downstream_stage_pressure");
  }
  return uniqueSorted(errors);
}

export function admitReviewGradeEdgeFulfillmentAssessmentFromArtifact(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly outputFile: string;
}): SdlcReviewGradeEdgeFulfillmentAdmission {
  const evidenceRefs = Object.freeze([pathToFileURL(input.outputFile).href]);
  if (!reviewGradeEdgeFulfillmentAssessmentRequired(input.manifest)) {
    return Object.freeze({
      kind: "sdlc_review_grade_edge_fulfillment_admission" as const,
      status: "not_required" as const,
      targetAssetType: input.manifest.targetAssetType,
      assessment: null,
      blockingReasons: Object.freeze([]),
      evidenceRefs
    });
  }
  if (!existsSync(input.outputFile) || !statSync(input.outputFile).isFile()) {
    return Object.freeze({
      kind: "sdlc_review_grade_edge_fulfillment_admission" as const,
      status: "rejected" as const,
      targetAssetType: input.manifest.targetAssetType,
      assessment: null,
      blockingReasons: Object.freeze(["review_grade_assessment_missing"]),
      evidenceRefs
    });
  }
  let candidate: unknown;
  try {
    candidate = JSON.parse(readFileSync(input.outputFile, "utf8"));
  } catch {
    return Object.freeze({
      kind: "sdlc_review_grade_edge_fulfillment_admission" as const,
      status: "rejected" as const,
      targetAssetType: input.manifest.targetAssetType,
      assessment: null,
      blockingReasons: Object.freeze(["review_grade_assessment_json_required"]),
      evidenceRefs
    });
  }
  try {
    const assessment = canonicalizeReviewAssessmentFulfillmentBindings({
      manifest: input.manifest,
      assessment: parseReviewAssessment(candidate, "review_grade_assessment")
    });
    const errors = assessmentValidationErrors({
      manifest: input.manifest,
      assessment
    });
    if (errors.length > 0) {
      return Object.freeze({
        kind: "sdlc_review_grade_edge_fulfillment_admission" as const,
        status: "rejected" as const,
        targetAssetType: input.manifest.targetAssetType,
        assessment,
        blockingReasons: errors,
        evidenceRefs: uniqueSorted([...evidenceRefs, ...assessment.evidenceRefs])
      });
    }
    return Object.freeze({
      kind: "sdlc_review_grade_edge_fulfillment_admission" as const,
      status: "admitted" as const,
      targetAssetType: input.manifest.targetAssetType,
      assessment,
      blockingReasons: Object.freeze([]),
      evidenceRefs: uniqueSorted([...evidenceRefs, ...assessment.evidenceRefs])
    });
  } catch (error) {
    return Object.freeze({
      kind: "sdlc_review_grade_edge_fulfillment_admission" as const,
      status: "rejected" as const,
      targetAssetType: input.manifest.targetAssetType,
      assessment: null,
      blockingReasons: Object.freeze([
        `review_grade_assessment_invalid:${error instanceof Error ? error.message : String(error)}`
      ]),
      evidenceRefs
    });
  }
}
