// Implements: T-200

import {
  parseArray,
  parseClosedRecord,
  parseEnumValue,
  parseKind,
  parseNonEmptyString,
  parseStringList
} from "../shared/validation.js";
import { uniqueTrimmedSorted as uniqueSorted } from "../shared/collections.js";
import type { SdlcReviewGradeEdgeFulfillmentAssessment } from "./carriers.js";
import { reviewGradeEdgeFulfillmentRepairSurfaceTriageRows } from "./review_grade_edge_fulfillment.js";

export const SDLC_DECOMPOSITION_TRACE_CHILD_STATUSES = Object.freeze([
  "open",
  "closed",
  "blocked",
  "rejected"
] as const);

export type SdlcDecompositionTraceChildStatus =
  (typeof SDLC_DECOMPOSITION_TRACE_CHILD_STATUSES)[number];

export const SDLC_DEPTH_TRAVERSAL_OUTCOME_STATUSES = Object.freeze([
  "admitted",
  "blocked",
  "rejected"
] as const);

export type SdlcDepthTraversalOutcomeStatus =
  (typeof SDLC_DEPTH_TRAVERSAL_OUTCOME_STATUSES)[number];

export const SDLC_DECOMPOSITION_TRACE_CLOSURE_STATUSES = Object.freeze([
  "closed",
  "blocked"
] as const);

export type SdlcDecompositionTraceClosureStatus =
  (typeof SDLC_DECOMPOSITION_TRACE_CLOSURE_STATUSES)[number];

export interface SdlcDecompositionTraceChildRow {
  readonly kind: "sdlc_decomposition_trace_child_row";
  readonly childObligationRef: string;
  readonly parentObligationRef: string;
  readonly ownerEdgeRef: string;
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly closureCriteriaRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly sourceTestRefs: readonly string[];
  readonly executionShardRefs: readonly string[];
  readonly consolidationRefs: readonly string[];
  readonly requirementRefs: readonly string[];
  readonly sourceReviewFindingRefs: readonly string[];
  readonly status: SdlcDecompositionTraceChildStatus;
}

export interface SdlcDecompositionTraceRegister {
  readonly kind: "sdlc_decomposition_trace_register";
  readonly registerRef: string;
  readonly sourceNodeRef: string;
  readonly targetNodeRef: string;
  readonly parentObligationRef: string;
  readonly graphCatalogDigestRef: string;
  readonly edgeContractRefs: readonly string[];
  readonly depthPolicyRef: string;
  readonly evidencePolicyRef: string;
  readonly rows: readonly SdlcDecompositionTraceChildRow[];
  readonly evidenceRefs: readonly string[];
  readonly requiredLedgerRefs: readonly string[];
  readonly consolidationRef: string;
}

export interface SdlcDepthTraversalOutcome {
  readonly kind: "sdlc_depth_traversal_outcome";
  readonly status: SdlcDepthTraversalOutcomeStatus;
  readonly depthPlanRef: string;
  readonly sourceNodeRef: string;
  readonly targetNodeRef: string;
  readonly parentObligationRef: string;
  readonly graphCatalogDigestRef: string;
  readonly edgeContractRefs: readonly string[];
  readonly depthPolicyRef: string;
  readonly evidencePolicyRef: string;
  readonly decompositionTraceRegisterRef: string | null;
  readonly childObligationRefs: readonly string[];
  readonly graphVectorRefs: readonly string[];
  readonly requiredLedgerRefs: readonly string[];
  readonly consolidationRef: string | null;
  readonly nonAdmissionReasonRefs: readonly string[];
  readonly decompositionTraceRegister: SdlcDecompositionTraceRegister | null;
}

export interface SdlcDecompositionTraceClosure {
  readonly kind: "sdlc_decomposition_trace_closure";
  readonly status: SdlcDecompositionTraceClosureStatus;
  readonly registerRef: string;
  readonly parentObligationRef: string;
  readonly expectedChildObligationRefs: readonly string[];
  readonly closedChildObligationRefs: readonly string[];
  readonly openChildObligationRefs: readonly string[];
  readonly blockedChildObligationRefs: readonly string[];
  readonly rejectedChildObligationRefs: readonly string[];
  readonly missingChildObligationRefs: readonly string[];
  readonly missingSourceTestChildObligationRefs: readonly string[];
  readonly missingExecutionShardChildObligationRefs: readonly string[];
  readonly commandOnlyEvidenceChildObligationRefs: readonly string[];
  readonly blockingReasonRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly consolidationRef: string | null;
}

export interface SdlcDecompositionTraceChildRowInput {
  readonly childObligationRef: string;
  readonly parentObligationRef: string;
  readonly ownerEdgeRef: string;
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly closureCriteriaRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly sourceTestRefs?: readonly string[] | undefined;
  readonly executionShardRefs?: readonly string[] | undefined;
  readonly consolidationRefs: readonly string[];
  readonly requirementRefs?: readonly string[] | undefined;
  readonly sourceReviewFindingRefs?: readonly string[] | undefined;
  readonly status?: SdlcDecompositionTraceChildStatus | undefined;
}

export interface SdlcDecompositionTraceRegisterInput {
  readonly registerRef: string;
  readonly sourceNodeRef: string;
  readonly targetNodeRef: string;
  readonly parentObligationRef: string;
  readonly graphCatalogDigestRef: string;
  readonly edgeContractRefs: readonly string[];
  readonly depthPolicyRef: string;
  readonly evidencePolicyRef: string;
  readonly rows: readonly SdlcDecompositionTraceChildRowInput[];
  readonly evidenceRefs?: readonly string[] | undefined;
  readonly requiredLedgerRefs?: readonly string[] | undefined;
  readonly consolidationRef: string;
}

export interface SdlcDepthTraversalOutcomeInput {
  readonly status: SdlcDepthTraversalOutcomeStatus;
  readonly depthPlanRef: string;
  readonly sourceNodeRef: string;
  readonly targetNodeRef: string;
  readonly parentObligationRef: string;
  readonly graphCatalogDigestRef: string;
  readonly edgeContractRefs: readonly string[];
  readonly depthPolicyRef: string;
  readonly evidencePolicyRef: string;
  readonly decompositionTraceRegister?: SdlcDecompositionTraceRegister | null | undefined;
  readonly requiredLedgerRefs?: readonly string[] | undefined;
  readonly nonAdmissionReasonRefs?: readonly string[] | undefined;
}

export interface SdlcDecompositionTraceRegisterFromReviewInput {
  readonly runRef: string;
  readonly targetAssetType?: string | undefined;
  readonly assessment: SdlcReviewGradeEdgeFulfillmentAssessment;
  readonly registerRef: string;
  readonly sourceNodeRef: string;
  readonly targetNodeRef: string;
  readonly parentObligationRef: string;
  readonly graphCatalogDigestRef: string;
  readonly edgeContractRefs: readonly string[];
  readonly depthPolicyRef: string;
  readonly evidencePolicyRef: string;
  readonly ownerEdgeRef: string;
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly closureCriteriaRefs: readonly string[];
  readonly requiredLedgerRefs?: readonly string[] | undefined;
  readonly consolidationRef: string;
}

export interface SdlcDecompositionTraceClosureInput {
  readonly register: SdlcDecompositionTraceRegister;
  readonly expectedChildObligationRefs?: readonly string[] | undefined;
}

const CHILD_ROW_KEYS = Object.freeze([
  "kind",
  "childObligationRef",
  "parentObligationRef",
  "ownerEdgeRef",
  "graphFunctionRef",
  "graphVectorRef",
  "closureCriteriaRefs",
  "evidenceRefs",
  "sourceTestRefs",
  "executionShardRefs",
  "consolidationRefs",
  "requirementRefs",
  "sourceReviewFindingRefs",
  "status"
] as const);

const REGISTER_KEYS = Object.freeze([
  "kind",
  "registerRef",
  "sourceNodeRef",
  "targetNodeRef",
  "parentObligationRef",
  "graphCatalogDigestRef",
  "edgeContractRefs",
  "depthPolicyRef",
  "evidencePolicyRef",
  "rows",
  "evidenceRefs",
  "requiredLedgerRefs",
  "consolidationRef"
] as const);

const OUTCOME_KEYS = Object.freeze([
  "kind",
  "status",
  "depthPlanRef",
  "sourceNodeRef",
  "targetNodeRef",
  "parentObligationRef",
  "graphCatalogDigestRef",
  "edgeContractRefs",
  "depthPolicyRef",
  "evidencePolicyRef",
  "decompositionTraceRegisterRef",
  "childObligationRefs",
  "graphVectorRefs",
  "requiredLedgerRefs",
  "consolidationRef",
  "nonAdmissionReasonRefs",
  "decompositionTraceRegister"
] as const);

function ref(input: unknown, label: string): string {
  const value = parseNonEmptyString(input, label);
  if (value.trim() !== value) {
    throw new TypeError(`${label}: expected trimmed ref`);
  }
  return value;
}

function refs(input: unknown, label: string): readonly string[] {
  return uniqueSorted(parseStringList(input, label));
}

function requiredRefs(input: unknown, label: string): readonly string[] {
  const values = refs(input, label);
  if (values.length === 0) {
    throw new TypeError(`${label}: expected at least one ref`);
  }
  return values;
}

function optionalRefs(input: unknown, label: string): readonly string[] {
  return input === undefined ? Object.freeze([]) : refs(input, label);
}

function requireSameRef(input: {
  readonly actual: string;
  readonly expected: string;
  readonly label: string;
}): void {
  if (input.actual !== input.expected) {
    throw new TypeError(
      `${input.label}: expected ${input.expected}, received ${input.actual}`
    );
  }
}

export function admitSdlcDecompositionTraceChildRow(
  input: unknown
): SdlcDecompositionTraceChildRow {
  const record = parseClosedRecord(input, "sdlc_decomposition_trace_child_row", CHILD_ROW_KEYS);
  parseKind(
    record["kind"] ?? "sdlc_decomposition_trace_child_row",
    "sdlc_decomposition_trace_child_row",
    "sdlc_decomposition_trace_child_row.kind"
  );
  return Object.freeze({
    kind: "sdlc_decomposition_trace_child_row" as const,
    childObligationRef: ref(record["childObligationRef"], "sdlc_decomposition_trace_child_row.childObligationRef"),
    parentObligationRef: ref(record["parentObligationRef"], "sdlc_decomposition_trace_child_row.parentObligationRef"),
    ownerEdgeRef: ref(record["ownerEdgeRef"], "sdlc_decomposition_trace_child_row.ownerEdgeRef"),
    graphFunctionRef: ref(record["graphFunctionRef"], "sdlc_decomposition_trace_child_row.graphFunctionRef"),
    graphVectorRef: ref(record["graphVectorRef"], "sdlc_decomposition_trace_child_row.graphVectorRef"),
    closureCriteriaRefs: requiredRefs(record["closureCriteriaRefs"], "sdlc_decomposition_trace_child_row.closureCriteriaRefs"),
    evidenceRefs: requiredRefs(record["evidenceRefs"], "sdlc_decomposition_trace_child_row.evidenceRefs"),
    sourceTestRefs: optionalRefs(record["sourceTestRefs"], "sdlc_decomposition_trace_child_row.sourceTestRefs"),
    executionShardRefs: optionalRefs(record["executionShardRefs"], "sdlc_decomposition_trace_child_row.executionShardRefs"),
    consolidationRefs: requiredRefs(record["consolidationRefs"], "sdlc_decomposition_trace_child_row.consolidationRefs"),
    requirementRefs: optionalRefs(record["requirementRefs"], "sdlc_decomposition_trace_child_row.requirementRefs"),
    sourceReviewFindingRefs: optionalRefs(record["sourceReviewFindingRefs"], "sdlc_decomposition_trace_child_row.sourceReviewFindingRefs"),
    status: parseEnumValue(
      record["status"] ?? "open",
      "sdlc_decomposition_trace_child_row.status",
      SDLC_DECOMPOSITION_TRACE_CHILD_STATUSES
    )
  });
}

export function constructSdlcDecompositionTraceChildRow(
  input: SdlcDecompositionTraceChildRowInput
): SdlcDecompositionTraceChildRow {
  return admitSdlcDecompositionTraceChildRow({
    kind: "sdlc_decomposition_trace_child_row",
    childObligationRef: input.childObligationRef,
    parentObligationRef: input.parentObligationRef,
    ownerEdgeRef: input.ownerEdgeRef,
    graphFunctionRef: input.graphFunctionRef,
    graphVectorRef: input.graphVectorRef,
    closureCriteriaRefs: input.closureCriteriaRefs,
    evidenceRefs: input.evidenceRefs,
    sourceTestRefs: input.sourceTestRefs ?? [],
    executionShardRefs: input.executionShardRefs ?? [],
    consolidationRefs: input.consolidationRefs,
    requirementRefs: input.requirementRefs ?? [],
    sourceReviewFindingRefs: input.sourceReviewFindingRefs ?? [],
    status: input.status ?? "open"
  });
}

export function admitSdlcDecompositionTraceRegister(
  input: unknown
): SdlcDecompositionTraceRegister {
  const record = parseClosedRecord(input, "sdlc_decomposition_trace_register", REGISTER_KEYS);
  parseKind(
    record["kind"] ?? "sdlc_decomposition_trace_register",
    "sdlc_decomposition_trace_register",
    "sdlc_decomposition_trace_register.kind"
  );
  const parentObligationRef = ref(
    record["parentObligationRef"],
    "sdlc_decomposition_trace_register.parentObligationRef"
  );
  const rows = parseArray(
    record["rows"],
    "sdlc_decomposition_trace_register.rows",
    admitSdlcDecompositionTraceChildRow
  );
  if (rows.length === 0) {
    throw new TypeError("sdlc_decomposition_trace_register.rows: expected at least one child row");
  }
  rows.forEach((row, index) => {
    requireSameRef({
      actual: row.parentObligationRef,
      expected: parentObligationRef,
      label: `sdlc_decomposition_trace_register.rows[${index}].parentObligationRef`
    });
  });
  return Object.freeze({
    kind: "sdlc_decomposition_trace_register" as const,
    registerRef: ref(record["registerRef"], "sdlc_decomposition_trace_register.registerRef"),
    sourceNodeRef: ref(record["sourceNodeRef"], "sdlc_decomposition_trace_register.sourceNodeRef"),
    targetNodeRef: ref(record["targetNodeRef"], "sdlc_decomposition_trace_register.targetNodeRef"),
    parentObligationRef,
    graphCatalogDigestRef: ref(record["graphCatalogDigestRef"], "sdlc_decomposition_trace_register.graphCatalogDigestRef"),
    edgeContractRefs: requiredRefs(record["edgeContractRefs"], "sdlc_decomposition_trace_register.edgeContractRefs"),
    depthPolicyRef: ref(record["depthPolicyRef"], "sdlc_decomposition_trace_register.depthPolicyRef"),
    evidencePolicyRef: ref(record["evidencePolicyRef"], "sdlc_decomposition_trace_register.evidencePolicyRef"),
    rows,
    evidenceRefs: optionalRefs(record["evidenceRefs"], "sdlc_decomposition_trace_register.evidenceRefs"),
    requiredLedgerRefs: optionalRefs(record["requiredLedgerRefs"], "sdlc_decomposition_trace_register.requiredLedgerRefs"),
    consolidationRef: ref(record["consolidationRef"], "sdlc_decomposition_trace_register.consolidationRef")
  });
}

export function constructSdlcDecompositionTraceRegister(
  input: SdlcDecompositionTraceRegisterInput
): SdlcDecompositionTraceRegister {
  return admitSdlcDecompositionTraceRegister({
    kind: "sdlc_decomposition_trace_register",
    registerRef: input.registerRef,
    sourceNodeRef: input.sourceNodeRef,
    targetNodeRef: input.targetNodeRef,
    parentObligationRef: input.parentObligationRef,
    graphCatalogDigestRef: input.graphCatalogDigestRef,
    edgeContractRefs: input.edgeContractRefs,
    depthPolicyRef: input.depthPolicyRef,
    evidencePolicyRef: input.evidencePolicyRef,
    rows: input.rows.map((row) => constructSdlcDecompositionTraceChildRow(row)),
    evidenceRefs: input.evidenceRefs ?? [],
    requiredLedgerRefs: input.requiredLedgerRefs ?? [],
    consolidationRef: input.consolidationRef
  });
}

function nullableRegister(input: unknown): SdlcDecompositionTraceRegister | null {
  if (input === null || input === undefined) {
    return null;
  }
  return admitSdlcDecompositionTraceRegister(input);
}

export function admitSdlcDepthTraversalOutcome(
  input: unknown
): SdlcDepthTraversalOutcome {
  const record = parseClosedRecord(input, "sdlc_depth_traversal_outcome", OUTCOME_KEYS);
  parseKind(
    record["kind"] ?? "sdlc_depth_traversal_outcome",
    "sdlc_depth_traversal_outcome",
    "sdlc_depth_traversal_outcome.kind"
  );
  const status = parseEnumValue(
    record["status"],
    "sdlc_depth_traversal_outcome.status",
    SDLC_DEPTH_TRAVERSAL_OUTCOME_STATUSES
  );
  const register = nullableRegister(record["decompositionTraceRegister"]);
  const nonAdmissionReasonRefs = optionalRefs(
    record["nonAdmissionReasonRefs"],
    "sdlc_depth_traversal_outcome.nonAdmissionReasonRefs"
  );
  if (status === "rejected") {
    if (register !== null) {
      throw new TypeError("sdlc_depth_traversal_outcome.decompositionTraceRegister: rejected outcome must not carry a register");
    }
    if (nonAdmissionReasonRefs.length === 0) {
      throw new TypeError("sdlc_depth_traversal_outcome.nonAdmissionReasonRefs: rejected outcome requires at least one reason ref");
    }
  } else if (register === null) {
    throw new TypeError("sdlc_depth_traversal_outcome.decompositionTraceRegister: admitted or blocked outcome requires a register");
  }
  const sourceNodeRef = ref(record["sourceNodeRef"], "sdlc_depth_traversal_outcome.sourceNodeRef");
  const targetNodeRef = ref(record["targetNodeRef"], "sdlc_depth_traversal_outcome.targetNodeRef");
  const parentObligationRef = ref(record["parentObligationRef"], "sdlc_depth_traversal_outcome.parentObligationRef");
  const graphCatalogDigestRef = ref(record["graphCatalogDigestRef"], "sdlc_depth_traversal_outcome.graphCatalogDigestRef");
  const edgeContractRefs = requiredRefs(record["edgeContractRefs"], "sdlc_depth_traversal_outcome.edgeContractRefs");
  const depthPolicyRef = ref(record["depthPolicyRef"], "sdlc_depth_traversal_outcome.depthPolicyRef");
  const evidencePolicyRef = ref(record["evidencePolicyRef"], "sdlc_depth_traversal_outcome.evidencePolicyRef");
  if (register !== null) {
    requireSameRef({
      actual: register.sourceNodeRef,
      expected: sourceNodeRef,
      label: "sdlc_depth_traversal_outcome.decompositionTraceRegister.sourceNodeRef"
    });
    requireSameRef({
      actual: register.targetNodeRef,
      expected: targetNodeRef,
      label: "sdlc_depth_traversal_outcome.decompositionTraceRegister.targetNodeRef"
    });
    requireSameRef({
      actual: register.parentObligationRef,
      expected: parentObligationRef,
      label: "sdlc_depth_traversal_outcome.decompositionTraceRegister.parentObligationRef"
    });
    requireSameRef({
      actual: register.graphCatalogDigestRef,
      expected: graphCatalogDigestRef,
      label: "sdlc_depth_traversal_outcome.decompositionTraceRegister.graphCatalogDigestRef"
    });
    requireSameRef({
      actual: register.depthPolicyRef,
      expected: depthPolicyRef,
      label: "sdlc_depth_traversal_outcome.decompositionTraceRegister.depthPolicyRef"
    });
    requireSameRef({
      actual: register.evidencePolicyRef,
      expected: evidencePolicyRef,
      label: "sdlc_depth_traversal_outcome.decompositionTraceRegister.evidencePolicyRef"
    });
  }
  const childObligationRefs = register === null
    ? Object.freeze([])
    : uniqueSorted(register.rows.map((row) => row.childObligationRef));
  const graphVectorRefs = register === null
    ? Object.freeze([])
    : uniqueSorted(register.rows.map((row) => row.graphVectorRef));
  const requiredLedgerRefs = uniqueSorted([
    ...optionalRefs(record["requiredLedgerRefs"], "sdlc_depth_traversal_outcome.requiredLedgerRefs"),
    ...(register?.requiredLedgerRefs ?? [])
  ]);
  return Object.freeze({
    kind: "sdlc_depth_traversal_outcome" as const,
    status,
    depthPlanRef: ref(record["depthPlanRef"], "sdlc_depth_traversal_outcome.depthPlanRef"),
    sourceNodeRef,
    targetNodeRef,
    parentObligationRef,
    graphCatalogDigestRef,
    edgeContractRefs,
    depthPolicyRef,
    evidencePolicyRef,
    decompositionTraceRegisterRef: register?.registerRef ?? null,
    childObligationRefs,
    graphVectorRefs,
    requiredLedgerRefs,
    consolidationRef: register?.consolidationRef ?? null,
    nonAdmissionReasonRefs,
    decompositionTraceRegister: register
  });
}

export function constructSdlcDepthTraversalOutcome(
  input: SdlcDepthTraversalOutcomeInput
): SdlcDepthTraversalOutcome {
  return admitSdlcDepthTraversalOutcome({
    kind: "sdlc_depth_traversal_outcome",
    status: input.status,
    depthPlanRef: input.depthPlanRef,
    sourceNodeRef: input.sourceNodeRef,
    targetNodeRef: input.targetNodeRef,
    parentObligationRef: input.parentObligationRef,
    graphCatalogDigestRef: input.graphCatalogDigestRef,
    edgeContractRefs: input.edgeContractRefs,
    depthPolicyRef: input.depthPolicyRef,
    evidencePolicyRef: input.evidencePolicyRef,
    decompositionTraceRegister: input.decompositionTraceRegister ?? null,
    requiredLedgerRefs: input.requiredLedgerRefs ?? [],
    nonAdmissionReasonRefs: input.nonAdmissionReasonRefs ?? []
  });
}

export function constructSdlcDecompositionTraceRegisterFromReviewGrade(
  input: SdlcDecompositionTraceRegisterFromReviewInput
): SdlcDecompositionTraceRegister {
  const findingsByObligation = new Map(
    input.assessment.findings.map((finding) => [
      finding.obligationId,
      finding
    ])
  );
  const downstreamRows = reviewGradeEdgeFulfillmentRepairSurfaceTriageRows({
    runRef: input.runRef,
    targetAssetType: input.targetAssetType ?? input.assessment.targetAssetType,
    assessment: input.assessment
  }).filter((row) => row.triage.disposition === "downstream_deferred");
  if (downstreamRows.length === 0) {
    throw new TypeError("sdlc_decomposition_trace_register.reviewGradeRows: expected at least one downstream_deferred finding");
  }
  const rows = downstreamRows.map((row) => {
    const finding = findingsByObligation.get(row.obligationId);
    const evidenceRefs = uniqueSorted([
      row.pressureRef,
      ...row.triage.evidenceRefs,
      ...(finding?.evidenceRefs ?? []),
      ...(finding?.acceptedAuthorityRefs ?? []),
      ...input.assessment.evidenceRefs
    ]);
    return constructSdlcDecompositionTraceChildRow({
      childObligationRef:
        `obligation://odd-sdlc/decomposition/${encodeURIComponent(input.runRef)}/${encodeURIComponent(row.obligationId)}`,
      parentObligationRef: input.parentObligationRef,
      ownerEdgeRef: row.triage.repairGraphFunctionRef ?? input.ownerEdgeRef,
      graphFunctionRef: row.triage.repairGraphFunctionRef ?? input.graphFunctionRef,
      graphVectorRef: row.triage.repairGraphVectorRef ?? input.graphVectorRef,
      closureCriteriaRefs: input.closureCriteriaRefs,
      evidenceRefs,
      consolidationRefs: [input.consolidationRef],
      requirementRefs: [row.obligationId],
      sourceReviewFindingRefs: [row.pressureRef],
      status: "open"
    });
  });
  return constructSdlcDecompositionTraceRegister({
    registerRef: input.registerRef,
    sourceNodeRef: input.sourceNodeRef,
    targetNodeRef: input.targetNodeRef,
    parentObligationRef: input.parentObligationRef,
    graphCatalogDigestRef: input.graphCatalogDigestRef,
    edgeContractRefs: input.edgeContractRefs,
    depthPolicyRef: input.depthPolicyRef,
    evidencePolicyRef: input.evidencePolicyRef,
    rows,
    evidenceRefs: uniqueSorted([
      ...input.assessment.evidenceRefs,
      ...rows.flatMap((row) => row.evidenceRefs)
    ]),
    requiredLedgerRefs: input.requiredLedgerRefs ?? [],
    consolidationRef: input.consolidationRef
  });
}

function rowsByChildRef(
  rows: readonly SdlcDecompositionTraceChildRow[]
): ReadonlyMap<string, SdlcDecompositionTraceChildRow> {
  return new Map(rows.map((row) => [row.childObligationRef, row]));
}

function commandEvidenceRef(refValue: string): boolean {
  return (
    refValue.startsWith("command://") ||
    refValue.startsWith("cmd://") ||
    refValue.startsWith("shell-command://")
  );
}

function requirementBoundRow(row: SdlcDecompositionTraceChildRow): boolean {
  return row.requirementRefs.length > 0;
}

export function evaluateSdlcDecompositionTraceClosure(
  input: SdlcDecompositionTraceClosureInput
): SdlcDecompositionTraceClosure {
  const expectedChildObligationRefs = uniqueSorted([
    ...input.register.rows.map((row) => row.childObligationRef),
    ...(input.expectedChildObligationRefs ?? [])
  ]);
  const rowByChildRef = rowsByChildRef(input.register.rows);
  const missingChildObligationRefs = expectedChildObligationRefs.filter(
    (childRef) => !rowByChildRef.has(childRef)
  );
  const rowsForClosure = expectedChildObligationRefs.flatMap((childRef) => {
    const row = rowByChildRef.get(childRef);
    return row === undefined ? [] : [row];
  });
  const closedChildObligationRefs = uniqueSorted(
    rowsForClosure
      .filter((row) => row.status === "closed")
      .map((row) => row.childObligationRef)
  );
  const openChildObligationRefs = uniqueSorted(
    rowsForClosure
      .filter((row) => row.status === "open")
      .map((row) => row.childObligationRef)
  );
  const blockedChildObligationRefs = uniqueSorted(
    rowsForClosure
      .filter((row) => row.status === "blocked")
      .map((row) => row.childObligationRef)
  );
  const rejectedChildObligationRefs = uniqueSorted(
    rowsForClosure
      .filter((row) => row.status === "rejected")
      .map((row) => row.childObligationRef)
  );
  const closedRequirementRows = rowsForClosure.filter(
    (row) => row.status === "closed" && requirementBoundRow(row)
  );
  const missingSourceTestChildObligationRefs = uniqueSorted(
    closedRequirementRows
      .filter((row) => row.sourceTestRefs.length === 0)
      .map((row) => row.childObligationRef)
  );
  const missingExecutionShardChildObligationRefs = uniqueSorted(
    closedRequirementRows
      .filter((row) => row.executionShardRefs.length === 0)
      .map((row) => row.childObligationRef)
  );
  const commandOnlyEvidenceChildObligationRefs = uniqueSorted(
    closedRequirementRows
      .filter((row) => row.evidenceRefs.every(commandEvidenceRef))
      .map((row) => row.childObligationRef)
  );
  const blockingReasonRefs = uniqueSorted([
    ...missingChildObligationRefs.map(
      (childRef) => `decomposition_child_missing:${childRef}`
    ),
    ...openChildObligationRefs.map(
      (childRef) => `decomposition_child_open:${childRef}`
    ),
    ...blockedChildObligationRefs.map(
      (childRef) => `decomposition_child_blocked:${childRef}`
    ),
    ...rejectedChildObligationRefs.map(
      (childRef) => `decomposition_child_rejected:${childRef}`
    ),
    ...missingSourceTestChildObligationRefs.map(
      (childRef) => `decomposition_child_missing_source_test:${childRef}`
    ),
    ...missingExecutionShardChildObligationRefs.map(
      (childRef) => `decomposition_child_missing_execution_shard:${childRef}`
    ),
    ...commandOnlyEvidenceChildObligationRefs.map(
      (childRef) => `decomposition_child_command_only_evidence:${childRef}`
    )
  ]);
  const status: SdlcDecompositionTraceClosureStatus =
    blockingReasonRefs.length === 0 &&
    closedChildObligationRefs.length === expectedChildObligationRefs.length
      ? "closed"
      : "blocked";
  return Object.freeze({
    kind: "sdlc_decomposition_trace_closure" as const,
    status,
    registerRef: input.register.registerRef,
    parentObligationRef: input.register.parentObligationRef,
    expectedChildObligationRefs,
    closedChildObligationRefs,
    openChildObligationRefs,
    blockedChildObligationRefs,
    rejectedChildObligationRefs,
    missingChildObligationRefs,
    missingSourceTestChildObligationRefs,
    missingExecutionShardChildObligationRefs,
    commandOnlyEvidenceChildObligationRefs,
    blockingReasonRefs,
    evidenceRefs: uniqueSorted([
      ...input.register.evidenceRefs,
      ...rowsForClosure.flatMap((row) => row.evidenceRefs)
    ]),
    consolidationRef: status === "closed" ? input.register.consolidationRef : null
  });
}
