// Implements: REQ-R-ABG3-REQUIREMENTS-ALGEBRA
// Implements: REQ-R-ABG3-PROJECTION
// Implements: REQ-R-ABG3-ASSURANCE
// Supports: REQ-L-GTL3-REQUIREMENTS-ALGEBRA

import {
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  ASSURANCE_CLOSURE_DECISION_KIND_VALUES,
  type AssuranceClosureDecision,
  type AssuranceClosureDecisionKind
} from "./assurance.js";

export const REQUIREMENT_STAGE_VALUES = Object.freeze([
  "homeostatic_gap",
  "problem",
  "solution_space",
  "intent",
  "product",
  "requirements",
  "destination_topology",
  "instruction_set",
  "runtime",
  "assurance"
] as const);

export type RequirementStage = (typeof REQUIREMENT_STAGE_VALUES)[number];

export const REQUIREMENT_RELATION_KIND_VALUES = Object.freeze([
  "refinement",
  "dependency",
  "conflict",
  "obstruction",
  "mitigation",
  "assignment",
  "operationalization",
  "test",
  "assurance",
  "evidence",
  "contribution",
  "weakening",
  "restoration",
  "supersession"
] as const);

export type RequirementRelationKind =
  (typeof REQUIREMENT_RELATION_KIND_VALUES)[number];

export const REQUIREMENT_TERM_KIND_VALUES = Object.freeze([
  "atom",
  "composition",
  "relation_ref",
  "projection_ref",
  "test_relation_ref",
  "evidence_binding_ref",
  "fold_projection_ref",
  "residual_projection_ref"
] as const);

export type RequirementTermKind = (typeof REQUIREMENT_TERM_KIND_VALUES)[number];

export const REQUIREMENT_PROJECTION_ROLE_VALUES = Object.freeze([
  "obligation",
  "materialization_target",
  "execution_schedule",
  "evidence_expectation"
] as const);

export type RequirementProjectionRole =
  (typeof REQUIREMENT_PROJECTION_ROLE_VALUES)[number];

export const REQUIREMENT_AUTHORITY_ROLE_VALUES = Object.freeze([
  "tenant_stack",
  "requirement",
  "design_materialization",
  "fallback"
] as const);

export type RequirementAuthorityRole =
  (typeof REQUIREMENT_AUTHORITY_ROLE_VALUES)[number];

export const REQUIREMENT_EVIDENCE_ROLE_VALUES = Object.freeze([
  "asset",
  "test_source",
  "test_execution",
  "semantic_interpretation",
  "byproduct"
] as const);

export type RequirementEvidenceRole =
  (typeof REQUIREMENT_EVIDENCE_ROLE_VALUES)[number];

export const REQUIREMENT_EVIDENCE_BINDING_STATUS_VALUES = Object.freeze([
  "admitted",
  "rejected",
  "non_closing"
] as const);

export type RequirementEvidenceBindingStatus =
  (typeof REQUIREMENT_EVIDENCE_BINDING_STATUS_VALUES)[number];

export const REQUIREMENT_FOLD_STATE_VALUES = Object.freeze([
  "satisfied",
  "partial",
  "blocked",
  "deferred",
  "repriced",
  "no_close_preserved"
] as const);

export type RequirementFoldState =
  (typeof REQUIREMENT_FOLD_STATE_VALUES)[number];

export const REQUIREMENT_RESIDUAL_PRESSURE_CLASS_VALUES = Object.freeze([
  "missing_span",
  "missing_evidence_policy",
  "missing_context_route",
  "missing_destination_topology",
  "missing_test_relation",
  "missing_execution_evidence",
  "continuation_deferred",
  "semantic_assessment_required",
  "human_decision_required",
  "blocked_prerequisite",
  "non_closing_evidence"
] as const);

export type RequirementResidualPressureClass =
  (typeof REQUIREMENT_RESIDUAL_PRESSURE_CLASS_VALUES)[number];

export const REQUIREMENT_ATTENUATION_KIND_VALUES = Object.freeze([
  "unchanged",
  "narrowed",
  "transformed",
  "moved_to_prerequisite",
  "escalated",
  "cleared"
] as const);

export type RequirementAttenuationKind =
  (typeof REQUIREMENT_ATTENUATION_KIND_VALUES)[number];

export const REQUIREMENT_FD_OUTCOME_VALUES = Object.freeze([
  "admitted_valid",
  "unknown_state_rejected",
  "rejected_malformed",
  "incomplete_structural_pressure",
  "stale_or_superseded",
  "contradictory_authority",
  "semantic_assessment_required",
  "semantic_residual_preserved",
  "human_decision_required",
  "non_closing_preserved"
] as const);

export type RequirementFdOutcome = (typeof REQUIREMENT_FD_OUTCOME_VALUES)[number];

export const REQUIREMENT_EVENT_PAYLOAD_KIND_VALUES = Object.freeze([
  "requirement_term_admitted",
  "requirement_relation_admitted",
  "traversal_span_admitted",
  "authority_context_fragment_admitted",
  "destination_topology_admitted",
  "requirement_test_relation_admitted",
  "requirement_projection_admitted",
  "requirement_evidence_bound",
  "requirement_fold_projected",
  "requirement_residual_projected"
] as const);

export type RequirementEventPayloadKind =
  (typeof REQUIREMENT_EVENT_PAYLOAD_KIND_VALUES)[number];

export interface RequirementTerm {
  readonly kind: "requirement_term";
  readonly requirementId: string;
  readonly termKind: RequirementTermKind;
  readonly stableId: string;
  readonly sourceRef: string;
  readonly sourceDigest: string;
  readonly text: string;
  readonly relationRefs: readonly string[];
  readonly spanRefs: readonly string[];
  readonly contextRefs: readonly string[];
  readonly evidencePolicyRefs: readonly string[];
  readonly projectionRefs: readonly string[];
}

export interface RequirementRelation {
  readonly kind: "requirement_relation";
  readonly relationId: string;
  readonly relationKind: RequirementRelationKind;
  readonly fromRequirementId: string;
  readonly toRequirementId: string;
  readonly sourceRef: string;
  readonly evidenceRefs: readonly string[];
}

export interface TraversalSpan {
  readonly kind: "traversal_span";
  readonly spanId: string;
  readonly graphFunctionRef: string;
  readonly graphVectorRefs: readonly string[];
  readonly vectorIndexes: readonly number[];
  readonly sourceNodeRef: string;
  readonly targetNodeRef: string;
  readonly frameRefs: readonly string[];
  readonly zoomRefs: readonly string[];
  readonly foldbackRefs: readonly string[];
  readonly aliasRefs: readonly string[];
}

export interface AuthorityContextFragment {
  readonly kind: "authority_context_fragment";
  readonly fragmentRef: string;
  readonly stage: RequirementStage;
  readonly constraintScope: string;
  readonly digest: string;
  readonly promotionPolicyRef: string;
  readonly appliesToRefs: readonly string[];
  readonly routingOutcome: "constraint_only" | "promoted_requirement" | "fp_required";
}

export interface DestinationTopology {
  readonly kind: "destination_topology";
  readonly topologyRef: string;
  readonly frameworkRef: string;
  readonly constraintRefs: readonly string[];
  readonly appliesToRefs: readonly string[];
}

export interface RequirementTestRelation {
  readonly kind: "requirement_test_relation";
  readonly relationRef: string;
  readonly requirementId: string;
  readonly assetProjectionRef: string;
  readonly testSourceProjectionRef: string;
  readonly testExecutionProjectionRef: string;
  readonly interpretationProjectionRef: string;
  readonly componentTestRootRefs: readonly string[];
  readonly evidencePolicyRef: string;
}

export interface RequirementProjection {
  readonly kind: "requirement_projection";
  readonly projectionRef: string;
  readonly requirementId: string;
  readonly spanId: string;
  readonly projectionRole: RequirementProjectionRole;
  readonly authorityRole: RequirementAuthorityRole;
  readonly targetPath: string | null;
  readonly command: string | null;
  readonly fallbackCommand: string | null;
  readonly evidenceRole: RequirementEvidenceRole | null;
  readonly current: boolean;
  readonly sourceRefs: readonly string[];
  readonly supersedesProjectionRefs: readonly string[];
}

export interface RequirementEvidenceBinding {
  readonly kind: "requirement_evidence_binding";
  readonly evidenceRef: string;
  readonly requirementId: string;
  readonly projectionRef: string;
  readonly evidenceRole: RequirementEvidenceRole;
  readonly bindingStatus: RequirementEvidenceBindingStatus;
  readonly path: string | null;
  readonly digest: string | null;
  readonly current: boolean;
  readonly supersedesEvidenceRefs: readonly string[];
  readonly reason: string;
}

export interface RequirementFoldProjection {
  readonly kind: "requirement_fold_projection";
  readonly foldRef: string;
  readonly requirementId: string;
  readonly projectionRefs: readonly string[];
  readonly state: RequirementFoldState;
  readonly sourceAbgTruthRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly residualPressureRefs: readonly string[];
  readonly reason: string;
}

export interface RequirementResidualProjection {
  readonly kind: "requirement_residual_projection";
  readonly residualRef: string;
  readonly requirementId: string;
  readonly spanId: string;
  readonly pressureClass: RequirementResidualPressureClass;
  readonly ownerSurface: RequirementStage;
  readonly sourceFoldRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly remainingProjectionRefs: readonly string[];
  readonly reason: string;
}

export interface RequirementAssuranceClaim {
  readonly kind: "requirement_assurance_claim";
  readonly claimRef: string;
  readonly requirementId: string;
  readonly contextRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly foldRefs: readonly string[];
  readonly residualRefs: readonly string[];
  readonly status: "supported" | "partial" | "blocked" | "no_evidence";
}

export interface RequirementTermAdmittedPayload {
  readonly kind: "requirement_term_admitted";
  readonly eventRef: string;
  readonly term: RequirementTerm;
}

export interface RequirementRelationAdmittedPayload {
  readonly kind: "requirement_relation_admitted";
  readonly eventRef: string;
  readonly relation: RequirementRelation;
}

export interface TraversalSpanAdmittedPayload {
  readonly kind: "traversal_span_admitted";
  readonly eventRef: string;
  readonly span: TraversalSpan;
}

export interface AuthorityContextFragmentAdmittedPayload {
  readonly kind: "authority_context_fragment_admitted";
  readonly eventRef: string;
  readonly fragment: AuthorityContextFragment;
}

export interface DestinationTopologyAdmittedPayload {
  readonly kind: "destination_topology_admitted";
  readonly eventRef: string;
  readonly topology: DestinationTopology;
}

export interface RequirementTestRelationAdmittedPayload {
  readonly kind: "requirement_test_relation_admitted";
  readonly eventRef: string;
  readonly testRelation: RequirementTestRelation;
}

export interface RequirementProjectionAdmittedPayload {
  readonly kind: "requirement_projection_admitted";
  readonly eventRef: string;
  readonly projection: RequirementProjection;
}

export interface RequirementEvidenceBoundPayload {
  readonly kind: "requirement_evidence_bound";
  readonly eventRef: string;
  readonly binding: RequirementEvidenceBinding;
}

export interface RequirementFoldProjectedPayload {
  readonly kind: "requirement_fold_projected";
  readonly eventRef: string;
  readonly fold: RequirementFoldProjection;
}

export interface RequirementResidualProjectedPayload {
  readonly kind: "requirement_residual_projected";
  readonly eventRef: string;
  readonly residual: RequirementResidualProjection;
}

export type RequirementEventPayload =
  | RequirementTermAdmittedPayload
  | RequirementRelationAdmittedPayload
  | TraversalSpanAdmittedPayload
  | AuthorityContextFragmentAdmittedPayload
  | DestinationTopologyAdmittedPayload
  | RequirementTestRelationAdmittedPayload
  | RequirementProjectionAdmittedPayload
  | RequirementEvidenceBoundPayload
  | RequirementFoldProjectedPayload
  | RequirementResidualProjectedPayload;

export interface RequirementLedger {
  readonly kind: "requirement_ledger_projection";
  readonly ledgerRef: string;
  readonly eventRefs: readonly string[];
  readonly terms: readonly RequirementTerm[];
  readonly relations: readonly RequirementRelation[];
  readonly spans: readonly TraversalSpan[];
  readonly contextFragments: readonly AuthorityContextFragment[];
  readonly destinationTopologies: readonly DestinationTopology[];
  readonly testRelations: readonly RequirementTestRelation[];
  readonly projections: readonly RequirementProjection[];
  readonly evidenceBindings: readonly RequirementEvidenceBinding[];
  readonly folds: readonly RequirementFoldProjection[];
  readonly residuals: readonly RequirementResidualProjection[];
}

export interface RequirementEdgeRef {
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly sourceNodeRef?: string | undefined;
  readonly targetNodeRef?: string | undefined;
  readonly frameRefs?: readonly string[] | undefined;
  readonly zoomRefs?: readonly string[] | undefined;
  readonly foldbackRefs?: readonly string[] | undefined;
  readonly aliasRefs?: readonly string[] | undefined;
}

export interface EdgeRequirementEnvironment {
  readonly kind: "edge_requirement_environment";
  readonly environmentRef: string;
  readonly edge: RequirementEdgeRef;
  readonly activeTerms: readonly RequirementTerm[];
  readonly activeRelations: readonly RequirementRelation[];
  readonly activeSpans: readonly TraversalSpan[];
  readonly activeContextFragments: readonly AuthorityContextFragment[];
  readonly activeDestinationTopologies: readonly DestinationTopology[];
  readonly activeTestRelations: readonly RequirementTestRelation[];
  readonly priorFolds: readonly RequirementFoldProjection[];
  readonly carriedResiduals: readonly RequirementResidualProjection[];
}

export interface RequirementExecutionScheduleProjection {
  readonly kind: "requirement_execution_schedule_projection";
  readonly projectionRef: string;
  readonly requirementId: string;
  readonly command: string;
  readonly source: "admitted_schedule" | "fallback";
}

export interface RequirementCompletenessGateRow {
  readonly gate: "span_coverage" | "evidence_policy_coverage" | "context_routing_coverage" | "destination_topology_coverage" | "test_relation_coverage" | "fold_attenuation_coverage";
  readonly status: "passed" | "failed";
  readonly missingRefs: readonly string[];
}

export interface RequirementCompletenessReport {
  readonly kind: "requirement_completeness_report";
  readonly status: "passed" | "failed";
  readonly rows: readonly RequirementCompletenessGateRow[];
}

export interface RequirementContextRouteProjection {
  readonly kind: "requirement_context_route_projection";
  readonly fragmentRef: string;
  readonly stage: RequirementStage;
  readonly route:
    | "constraint_only"
    | "active_requirement_context"
    | "semantic_assessment_required";
  readonly applies: boolean;
  readonly appliesToRefs: readonly string[];
}

export interface RequirementStructuralEvaluation {
  readonly kind: "requirement_structural_evaluation";
  readonly outcome: RequirementFdOutcome;
  readonly reason: string;
  readonly diagnosticRefs: readonly string[];
}

export interface RequirementAttenuationProjection {
  readonly kind: "requirement_attenuation_projection";
  readonly attenuation: RequirementAttenuationKind;
  readonly priorResidualRefs: readonly string[];
  readonly residualRefs: readonly string[];
  readonly reason: string;
}

export interface RequirementGraphPairProjection {
  readonly kind: "requirement_graph_pair_projection";
  readonly relationRef: string;
  readonly relationKind: RequirementRelationKind;
  readonly parentRequirementId: string;
  readonly childRequirementId: string;
  readonly sourceRef: string;
}

export interface RequirementGraphProjection {
  readonly kind: "requirement_graph_projection";
  readonly graphRef: string;
  readonly requirementIds: readonly string[];
  readonly relationRefs: readonly string[];
  readonly activeRequirementIds: readonly string[];
  readonly activeRelationRefs: readonly string[];
  readonly rootRequirementIds: readonly string[];
  readonly leafRequirementIds: readonly string[];
  readonly parentChildPairs: readonly RequirementGraphPairProjection[];
  readonly sourceRefs: readonly string[];
}

export interface RequirementAggregateStateProjection {
  readonly kind: "requirement_aggregate_state_projection";
  readonly aggregateRef: string;
  readonly requirementId: string;
  readonly childRequirementIds: readonly string[];
  readonly state: RequirementFoldState | "no_evidence";
  readonly childFoldRefs: readonly string[];
  readonly residualRefs: readonly string[];
  readonly sourceRelationRefs: readonly string[];
  readonly sourceRequirementRefs: readonly string[];
  readonly reason: string;
}

export interface RequirementSpanLineageProjection {
  readonly kind: "requirement_span_lineage_projection";
  readonly lineageRef: string;
  readonly spanId: string;
  readonly graphFunctionRef: string;
  readonly graphVectorRefs: readonly string[];
  readonly vectorIndexes: readonly number[];
  readonly sourceNodeRef: string;
  readonly targetNodeRef: string;
  readonly frameRefs: readonly string[];
  readonly zoomRefs: readonly string[];
  readonly foldbackRefs: readonly string[];
  readonly aliasRefs: readonly string[];
  readonly active: boolean;
  readonly sourceRefs: readonly string[];
}

export interface RequirementQueryReadModel {
  readonly kind: "requirement_query_read_model";
  readonly edge: RequirementEdgeRef;
  readonly contextFragmentRefs: readonly string[];
  readonly requirementIds: readonly string[];
  readonly obligationProjectionRefs: readonly string[];
  readonly materializationTargetRefs: readonly string[];
  readonly executionScheduleRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly foldRefs: readonly string[];
  readonly residualRefs: readonly string[];
  readonly attenuation: RequirementAttenuationKind;
  readonly assuranceClaimRefs: readonly string[];
}

type PlainRecord = Readonly<Record<string, unknown>>;

const AUTHORITY_ROLE_PRECEDENCE: Readonly<Record<RequirementAuthorityRole, number>> =
  Object.freeze({
    tenant_stack: 40,
    requirement: 30,
    design_materialization: 20,
    fallback: 10
  });

export const REQUIREMENT_EVENT_FORBIDDEN_RUNTIME_FIELDS = Object.freeze([
  "runtimeEvents",
  "events",
  "ledger",
  "ledgers",
  "runtimeProjection",
  "graphCall",
  "graphCallId",
  "frame",
  "frameId",
  "intent",
  "selectedIntentRef",
  "actorInvocationEvent",
  "actorInvocationId",
  "actorInvocationRef",
  "vectorIndex",
  "closureDecision",
  "closureKind",
  "decision",
  "terminalKind",
  "terminalReason",
  "transition",
  "transitionKind",
  "nextVectorIndex",
  "closedVectorIndexes",
  "mayCloseTraversal",
  "mayEmitRuntimeEvents",
  "mayOwnIterationLoop",
  "mayWriteLedgers",
  "maySelectTraversal",
  "mayWriteProjection",
  "mayWriteLedger",
  "maySelectNextVector"
] as const);

function freezeArray<T>(values: readonly T[]): readonly T[] {
  return Object.freeze([...values]);
}

function freezeStringArray(values: readonly string[], label: string): readonly string[] {
  for (const [index, value] of values.entries()) {
    assertNonEmptyString(value, `${label}[${index}]`);
  }
  return freezeArray(values);
}

function freezeNumberArray(values: readonly number[], label: string): readonly number[] {
  for (const [index, value] of values.entries()) {
    if (!Number.isInteger(value) || value < 0) {
      throw new TypeError(`${label}[${index}] must be a non-negative integer`);
    }
  }
  return freezeArray(values);
}

function requirementResidualRef(requirementId: string, state: RequirementFoldState): string {
  return `requirement-residual:${requirementId}:${state}`;
}

function freezeRequirementEdgeRef(edge: RequirementEdgeRef): RequirementEdgeRef {
  return Object.freeze({
    graphFunctionRef: edge.graphFunctionRef,
    graphVectorRef: edge.graphVectorRef,
    vectorIndex: edge.vectorIndex,
    edge: edge.edge,
    ...(edge.sourceNodeRef === undefined ? {} : { sourceNodeRef: edge.sourceNodeRef }),
    ...(edge.targetNodeRef === undefined ? {} : { targetNodeRef: edge.targetNodeRef }),
    ...(edge.frameRefs === undefined ? {} : { frameRefs: freezeStringArray(edge.frameRefs, "RequirementEdgeRef.frameRefs") }),
    ...(edge.zoomRefs === undefined ? {} : { zoomRefs: freezeStringArray(edge.zoomRefs, "RequirementEdgeRef.zoomRefs") }),
    ...(edge.foldbackRefs === undefined ? {} : { foldbackRefs: freezeStringArray(edge.foldbackRefs, "RequirementEdgeRef.foldbackRefs") }),
    ...(edge.aliasRefs === undefined ? {} : { aliasRefs: freezeStringArray(edge.aliasRefs, "RequirementEdgeRef.aliasRefs") })
  });
}

function assertNonEmptyString(value: string, label: string): void {
  if (value.length === 0) {
    throw new TypeError(`${label} must be non-empty`);
  }
}

function nullableString(value: string | null | undefined, label: string): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  assertNonEmptyString(value, label);
  return value;
}

function enumValue<T extends string>(
  values: readonly T[],
  value: T,
  label: string
): T {
  if (!values.includes(value)) {
    throw new TypeError(`${label}: unsupported value ${JSON.stringify(value)}`);
  }
  return value;
}

function parseEnumValue<T extends string>(
  values: readonly T[],
  value: string,
  label: string
): T {
  for (const allowed of values) {
    if (value === allowed) {
      return allowed;
    }
  }
  throw new TypeError(`${label}: unsupported value ${JSON.stringify(value)}`);
}

function plainRecord(input: unknown, label: string): PlainRecord {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new TypeError(`${label} must be a plain object`);
  }
  const record: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    record[key] = value;
  }
  return Object.freeze(record);
}

function stringField(input: PlainRecord, key: string, label: string): string {
  const value = input[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label}.${key} must be a non-empty string`);
  }
  return value;
}

function booleanField(input: PlainRecord, key: string, label: string): boolean {
  const value = input[key];
  if (typeof value !== "boolean") {
    throw new TypeError(`${label}.${key} must be a boolean`);
  }
  return value;
}

function nullableStringField(input: PlainRecord, key: string, label: string): string | null {
  const value = input[key];
  if (value === null) {
    return null;
  }
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label}.${key} must be a non-empty string or null`);
  }
  return value;
}

function stringArrayField(input: PlainRecord, key: string, label: string): readonly string[] {
  const value = input[key];
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new TypeError(`${label}.${key} must be a string array`);
  }
  return freezeStringArray(value, `${label}.${key}`);
}

function numberArrayField(input: PlainRecord, key: string, label: string): readonly number[] {
  const value = input[key];
  if (!Array.isArray(value) || !value.every((item) => typeof item === "number")) {
    throw new TypeError(`${label}.${key} must be a number array`);
  }
  return freezeNumberArray(value, `${label}.${key}`);
}

function assertAllowedFields(
  input: PlainRecord,
  label: string,
  allowedFields: readonly string[]
): void {
  for (const field of Object.keys(input)) {
    if (!allowedFields.includes(field)) {
      throw new TypeError(`${label}.${field}: unknown field`);
    }
  }
}

export function constructRequirementTerm(
  input: Omit<RequirementTerm, "kind">
): RequirementTerm {
  assertNonEmptyString(input.requirementId, "RequirementTerm.requirementId");
  assertNonEmptyString(input.stableId, "RequirementTerm.stableId");
  assertNonEmptyString(input.sourceRef, "RequirementTerm.sourceRef");
  assertNonEmptyString(input.sourceDigest, "RequirementTerm.sourceDigest");
  assertNonEmptyString(input.text, "RequirementTerm.text");
  return Object.freeze({
    kind: "requirement_term",
    requirementId: input.requirementId,
    termKind: enumValue(REQUIREMENT_TERM_KIND_VALUES, input.termKind, "RequirementTerm.termKind"),
    stableId: input.stableId,
    sourceRef: input.sourceRef,
    sourceDigest: input.sourceDigest,
    text: input.text,
    relationRefs: freezeStringArray(input.relationRefs, "RequirementTerm.relationRefs"),
    spanRefs: freezeStringArray(input.spanRefs, "RequirementTerm.spanRefs"),
    contextRefs: freezeStringArray(input.contextRefs, "RequirementTerm.contextRefs"),
    evidencePolicyRefs: freezeStringArray(input.evidencePolicyRefs, "RequirementTerm.evidencePolicyRefs"),
    projectionRefs: freezeStringArray(input.projectionRefs, "RequirementTerm.projectionRefs")
  });
}

export function constructRequirementRelation(
  input: Omit<RequirementRelation, "kind">
): RequirementRelation {
  assertNonEmptyString(input.relationId, "RequirementRelation.relationId");
  assertNonEmptyString(input.fromRequirementId, "RequirementRelation.fromRequirementId");
  assertNonEmptyString(input.toRequirementId, "RequirementRelation.toRequirementId");
  assertNonEmptyString(input.sourceRef, "RequirementRelation.sourceRef");
  return Object.freeze({
    kind: "requirement_relation",
    relationId: input.relationId,
    relationKind: enumValue(REQUIREMENT_RELATION_KIND_VALUES, input.relationKind, "RequirementRelation.relationKind"),
    fromRequirementId: input.fromRequirementId,
    toRequirementId: input.toRequirementId,
    sourceRef: input.sourceRef,
    evidenceRefs: freezeStringArray(input.evidenceRefs, "RequirementRelation.evidenceRefs")
  });
}

export function constructTraversalSpan(
  input: Omit<TraversalSpan, "kind">
): TraversalSpan {
  assertNonEmptyString(input.spanId, "TraversalSpan.spanId");
  assertNonEmptyString(input.graphFunctionRef, "TraversalSpan.graphFunctionRef");
  assertNonEmptyString(input.sourceNodeRef, "TraversalSpan.sourceNodeRef");
  assertNonEmptyString(input.targetNodeRef, "TraversalSpan.targetNodeRef");
  if (input.graphVectorRefs.length === 0 && input.vectorIndexes.length === 0) {
    throw new TypeError("TraversalSpan requires at least one graph vector ref or vector index");
  }
  return Object.freeze({
    kind: "traversal_span",
    spanId: input.spanId,
    graphFunctionRef: input.graphFunctionRef,
    graphVectorRefs: freezeStringArray(input.graphVectorRefs, "TraversalSpan.graphVectorRefs"),
    vectorIndexes: freezeNumberArray(input.vectorIndexes, "TraversalSpan.vectorIndexes"),
    sourceNodeRef: input.sourceNodeRef,
    targetNodeRef: input.targetNodeRef,
    frameRefs: freezeStringArray(input.frameRefs, "TraversalSpan.frameRefs"),
    zoomRefs: freezeStringArray(input.zoomRefs, "TraversalSpan.zoomRefs"),
    foldbackRefs: freezeStringArray(input.foldbackRefs, "TraversalSpan.foldbackRefs"),
    aliasRefs: freezeStringArray(input.aliasRefs, "TraversalSpan.aliasRefs")
  });
}

export function constructAuthorityContextFragment(
  input: Omit<AuthorityContextFragment, "kind">
): AuthorityContextFragment {
  assertNonEmptyString(input.fragmentRef, "AuthorityContextFragment.fragmentRef");
  assertNonEmptyString(input.constraintScope, "AuthorityContextFragment.constraintScope");
  assertNonEmptyString(input.digest, "AuthorityContextFragment.digest");
  assertNonEmptyString(input.promotionPolicyRef, "AuthorityContextFragment.promotionPolicyRef");
  return Object.freeze({
    kind: "authority_context_fragment",
    fragmentRef: input.fragmentRef,
    stage: enumValue(REQUIREMENT_STAGE_VALUES, input.stage, "AuthorityContextFragment.stage"),
    constraintScope: input.constraintScope,
    digest: input.digest,
    promotionPolicyRef: input.promotionPolicyRef,
    appliesToRefs: freezeStringArray(input.appliesToRefs, "AuthorityContextFragment.appliesToRefs"),
    routingOutcome: enumValue(
      ["constraint_only", "promoted_requirement", "fp_required"] as const,
      input.routingOutcome,
      "AuthorityContextFragment.routingOutcome"
    )
  });
}

export function constructDestinationTopology(
  input: Omit<DestinationTopology, "kind">
): DestinationTopology {
  assertNonEmptyString(input.topologyRef, "DestinationTopology.topologyRef");
  assertNonEmptyString(input.frameworkRef, "DestinationTopology.frameworkRef");
  return Object.freeze({
    kind: "destination_topology",
    topologyRef: input.topologyRef,
    frameworkRef: input.frameworkRef,
    constraintRefs: freezeStringArray(input.constraintRefs, "DestinationTopology.constraintRefs"),
    appliesToRefs: freezeStringArray(input.appliesToRefs, "DestinationTopology.appliesToRefs")
  });
}

export function constructRequirementTestRelation(
  input: Omit<RequirementTestRelation, "kind">
): RequirementTestRelation {
  assertNonEmptyString(input.relationRef, "RequirementTestRelation.relationRef");
  assertNonEmptyString(input.requirementId, "RequirementTestRelation.requirementId");
  assertNonEmptyString(input.assetProjectionRef, "RequirementTestRelation.assetProjectionRef");
  assertNonEmptyString(input.testSourceProjectionRef, "RequirementTestRelation.testSourceProjectionRef");
  assertNonEmptyString(input.testExecutionProjectionRef, "RequirementTestRelation.testExecutionProjectionRef");
  assertNonEmptyString(input.interpretationProjectionRef, "RequirementTestRelation.interpretationProjectionRef");
  assertNonEmptyString(input.evidencePolicyRef, "RequirementTestRelation.evidencePolicyRef");
  return Object.freeze({
    kind: "requirement_test_relation",
    relationRef: input.relationRef,
    requirementId: input.requirementId,
    assetProjectionRef: input.assetProjectionRef,
    testSourceProjectionRef: input.testSourceProjectionRef,
    testExecutionProjectionRef: input.testExecutionProjectionRef,
    interpretationProjectionRef: input.interpretationProjectionRef,
    componentTestRootRefs: freezeStringArray(input.componentTestRootRefs, "RequirementTestRelation.componentTestRootRefs"),
    evidencePolicyRef: input.evidencePolicyRef
  });
}

export function constructRequirementProjection(
  input: Omit<RequirementProjection, "kind">
): RequirementProjection {
  assertNonEmptyString(input.projectionRef, "RequirementProjection.projectionRef");
  assertNonEmptyString(input.requirementId, "RequirementProjection.requirementId");
  assertNonEmptyString(input.spanId, "RequirementProjection.spanId");
  return Object.freeze({
    kind: "requirement_projection",
    projectionRef: input.projectionRef,
    requirementId: input.requirementId,
    spanId: input.spanId,
    projectionRole: enumValue(REQUIREMENT_PROJECTION_ROLE_VALUES, input.projectionRole, "RequirementProjection.projectionRole"),
    authorityRole: enumValue(REQUIREMENT_AUTHORITY_ROLE_VALUES, input.authorityRole, "RequirementProjection.authorityRole"),
    targetPath: nullableString(input.targetPath, "RequirementProjection.targetPath"),
    command: nullableString(input.command, "RequirementProjection.command"),
    fallbackCommand: nullableString(input.fallbackCommand, "RequirementProjection.fallbackCommand"),
    evidenceRole:
      input.evidenceRole === null
        ? null
        : enumValue(REQUIREMENT_EVIDENCE_ROLE_VALUES, input.evidenceRole, "RequirementProjection.evidenceRole"),
    current: input.current,
    sourceRefs: freezeStringArray(input.sourceRefs, "RequirementProjection.sourceRefs"),
    supersedesProjectionRefs: freezeStringArray(input.supersedesProjectionRefs, "RequirementProjection.supersedesProjectionRefs")
  });
}

export function constructRequirementEvidenceBinding(
  input: Omit<RequirementEvidenceBinding, "kind">
): RequirementEvidenceBinding {
  assertNonEmptyString(input.evidenceRef, "RequirementEvidenceBinding.evidenceRef");
  assertNonEmptyString(input.requirementId, "RequirementEvidenceBinding.requirementId");
  assertNonEmptyString(input.projectionRef, "RequirementEvidenceBinding.projectionRef");
  assertNonEmptyString(input.reason, "RequirementEvidenceBinding.reason");
  return Object.freeze({
    kind: "requirement_evidence_binding",
    evidenceRef: input.evidenceRef,
    requirementId: input.requirementId,
    projectionRef: input.projectionRef,
    evidenceRole: enumValue(REQUIREMENT_EVIDENCE_ROLE_VALUES, input.evidenceRole, "RequirementEvidenceBinding.evidenceRole"),
    bindingStatus: enumValue(REQUIREMENT_EVIDENCE_BINDING_STATUS_VALUES, input.bindingStatus, "RequirementEvidenceBinding.bindingStatus"),
    path: nullableString(input.path, "RequirementEvidenceBinding.path"),
    digest: nullableString(input.digest, "RequirementEvidenceBinding.digest"),
    current: input.current,
    supersedesEvidenceRefs: freezeStringArray(input.supersedesEvidenceRefs, "RequirementEvidenceBinding.supersedesEvidenceRefs"),
    reason: input.reason
  });
}

export function constructRequirementFoldProjection(
  input: Omit<RequirementFoldProjection, "kind">
): RequirementFoldProjection {
  assertNonEmptyString(input.foldRef, "RequirementFoldProjection.foldRef");
  assertNonEmptyString(input.requirementId, "RequirementFoldProjection.requirementId");
  assertNonEmptyString(input.reason, "RequirementFoldProjection.reason");
  return Object.freeze({
    kind: "requirement_fold_projection",
    foldRef: input.foldRef,
    requirementId: input.requirementId,
    projectionRefs: freezeStringArray(input.projectionRefs, "RequirementFoldProjection.projectionRefs"),
    state: enumValue(REQUIREMENT_FOLD_STATE_VALUES, input.state, "RequirementFoldProjection.state"),
    sourceAbgTruthRefs: freezeStringArray(input.sourceAbgTruthRefs, "RequirementFoldProjection.sourceAbgTruthRefs"),
    evidenceRefs: freezeStringArray(input.evidenceRefs, "RequirementFoldProjection.evidenceRefs"),
    residualPressureRefs: freezeStringArray(input.residualPressureRefs, "RequirementFoldProjection.residualPressureRefs"),
    reason: input.reason
  });
}

export function constructRequirementResidualProjection(
  input: Omit<RequirementResidualProjection, "kind">
): RequirementResidualProjection {
  assertNonEmptyString(input.residualRef, "RequirementResidualProjection.residualRef");
  assertNonEmptyString(input.requirementId, "RequirementResidualProjection.requirementId");
  assertNonEmptyString(input.spanId, "RequirementResidualProjection.spanId");
  assertNonEmptyString(input.reason, "RequirementResidualProjection.reason");
  return Object.freeze({
    kind: "requirement_residual_projection",
    residualRef: input.residualRef,
    requirementId: input.requirementId,
    spanId: input.spanId,
    pressureClass: enumValue(REQUIREMENT_RESIDUAL_PRESSURE_CLASS_VALUES, input.pressureClass, "RequirementResidualProjection.pressureClass"),
    ownerSurface: enumValue(REQUIREMENT_STAGE_VALUES, input.ownerSurface, "RequirementResidualProjection.ownerSurface"),
    sourceFoldRefs: freezeStringArray(input.sourceFoldRefs, "RequirementResidualProjection.sourceFoldRefs"),
    evidenceRefs: freezeStringArray(input.evidenceRefs, "RequirementResidualProjection.evidenceRefs"),
    remainingProjectionRefs: freezeStringArray(input.remainingProjectionRefs, "RequirementResidualProjection.remainingProjectionRefs"),
    reason: input.reason
  });
}

export function constructRequirementAssuranceClaim(
  input: Omit<RequirementAssuranceClaim, "kind">
): RequirementAssuranceClaim {
  assertNonEmptyString(input.claimRef, "RequirementAssuranceClaim.claimRef");
  assertNonEmptyString(input.requirementId, "RequirementAssuranceClaim.requirementId");
  return Object.freeze({
    kind: "requirement_assurance_claim",
    claimRef: input.claimRef,
    requirementId: input.requirementId,
    contextRefs: freezeStringArray(input.contextRefs, "RequirementAssuranceClaim.contextRefs"),
    evidenceRefs: freezeStringArray(input.evidenceRefs, "RequirementAssuranceClaim.evidenceRefs"),
    foldRefs: freezeStringArray(input.foldRefs, "RequirementAssuranceClaim.foldRefs"),
    residualRefs: freezeStringArray(input.residualRefs, "RequirementAssuranceClaim.residualRefs"),
    status: enumValue(["supported", "partial", "blocked", "no_evidence"] as const, input.status, "RequirementAssuranceClaim.status")
  });
}

function constructPayloadBase(input: PlainRecord, label: string): string {
  for (const field of REQUIREMENT_EVENT_FORBIDDEN_RUNTIME_FIELDS) {
    if (Object.hasOwn(input, field)) {
      throw new TypeError(`${label}.${field}: requirement event payloads cannot carry ABG runtime authority fields`);
    }
  }
  return stringField(input, "eventRef", label);
}

function parseRequirementTerm(input: unknown): RequirementTerm {
  const record = plainRecord(input, "RequirementTerm");
  assertAllowedFields(record, "RequirementTerm", [
    "kind",
    "requirementId",
    "termKind",
    "stableId",
    "sourceRef",
    "sourceDigest",
    "text",
    "relationRefs",
    "spanRefs",
    "contextRefs",
    "evidencePolicyRefs",
    "projectionRefs"
  ]);
  if (record["kind"] !== "requirement_term") {
    throw new TypeError("RequirementTerm.kind must be requirement_term");
  }
  return constructRequirementTerm({
    requirementId: stringField(record, "requirementId", "RequirementTerm"),
    termKind: parseEnumValue(REQUIREMENT_TERM_KIND_VALUES, stringField(record, "termKind", "RequirementTerm"), "RequirementTerm.termKind"),
    stableId: stringField(record, "stableId", "RequirementTerm"),
    sourceRef: stringField(record, "sourceRef", "RequirementTerm"),
    sourceDigest: stringField(record, "sourceDigest", "RequirementTerm"),
    text: stringField(record, "text", "RequirementTerm"),
    relationRefs: stringArrayField(record, "relationRefs", "RequirementTerm"),
    spanRefs: stringArrayField(record, "spanRefs", "RequirementTerm"),
    contextRefs: stringArrayField(record, "contextRefs", "RequirementTerm"),
    evidencePolicyRefs: stringArrayField(record, "evidencePolicyRefs", "RequirementTerm"),
    projectionRefs: stringArrayField(record, "projectionRefs", "RequirementTerm")
  });
}

function parseRequirementRelation(input: unknown): RequirementRelation {
  const record = plainRecord(input, "RequirementRelation");
  assertAllowedFields(record, "RequirementRelation", [
    "kind",
    "relationId",
    "relationKind",
    "fromRequirementId",
    "toRequirementId",
    "sourceRef",
    "evidenceRefs"
  ]);
  if (record["kind"] !== "requirement_relation") {
    throw new TypeError("RequirementRelation.kind must be requirement_relation");
  }
  return constructRequirementRelation({
    relationId: stringField(record, "relationId", "RequirementRelation"),
    relationKind: parseEnumValue(REQUIREMENT_RELATION_KIND_VALUES, stringField(record, "relationKind", "RequirementRelation"), "RequirementRelation.relationKind"),
    fromRequirementId: stringField(record, "fromRequirementId", "RequirementRelation"),
    toRequirementId: stringField(record, "toRequirementId", "RequirementRelation"),
    sourceRef: stringField(record, "sourceRef", "RequirementRelation"),
    evidenceRefs: stringArrayField(record, "evidenceRefs", "RequirementRelation")
  });
}

function parseTraversalSpan(input: unknown): TraversalSpan {
  const record = plainRecord(input, "TraversalSpan");
  assertAllowedFields(record, "TraversalSpan", [
    "kind",
    "spanId",
    "graphFunctionRef",
    "graphVectorRefs",
    "vectorIndexes",
    "sourceNodeRef",
    "targetNodeRef",
    "frameRefs",
    "zoomRefs",
    "foldbackRefs",
    "aliasRefs"
  ]);
  if (record["kind"] !== "traversal_span") {
    throw new TypeError("TraversalSpan.kind must be traversal_span");
  }
  return constructTraversalSpan({
    spanId: stringField(record, "spanId", "TraversalSpan"),
    graphFunctionRef: stringField(record, "graphFunctionRef", "TraversalSpan"),
    graphVectorRefs: stringArrayField(record, "graphVectorRefs", "TraversalSpan"),
    vectorIndexes: numberArrayField(record, "vectorIndexes", "TraversalSpan"),
    sourceNodeRef: stringField(record, "sourceNodeRef", "TraversalSpan"),
    targetNodeRef: stringField(record, "targetNodeRef", "TraversalSpan"),
    frameRefs: stringArrayField(record, "frameRefs", "TraversalSpan"),
    zoomRefs: stringArrayField(record, "zoomRefs", "TraversalSpan"),
    foldbackRefs: stringArrayField(record, "foldbackRefs", "TraversalSpan"),
    aliasRefs: stringArrayField(record, "aliasRefs", "TraversalSpan")
  });
}

function parseAuthorityContextFragment(input: unknown): AuthorityContextFragment {
  const record = plainRecord(input, "AuthorityContextFragment");
  assertAllowedFields(record, "AuthorityContextFragment", [
    "kind",
    "fragmentRef",
    "stage",
    "constraintScope",
    "digest",
    "promotionPolicyRef",
    "appliesToRefs",
    "routingOutcome"
  ]);
  if (record["kind"] !== "authority_context_fragment") {
    throw new TypeError("AuthorityContextFragment.kind must be authority_context_fragment");
  }
  return constructAuthorityContextFragment({
    fragmentRef: stringField(record, "fragmentRef", "AuthorityContextFragment"),
    stage: parseEnumValue(REQUIREMENT_STAGE_VALUES, stringField(record, "stage", "AuthorityContextFragment"), "AuthorityContextFragment.stage"),
    constraintScope: stringField(record, "constraintScope", "AuthorityContextFragment"),
    digest: stringField(record, "digest", "AuthorityContextFragment"),
    promotionPolicyRef: stringField(record, "promotionPolicyRef", "AuthorityContextFragment"),
    appliesToRefs: stringArrayField(record, "appliesToRefs", "AuthorityContextFragment"),
    routingOutcome: parseEnumValue(["constraint_only", "promoted_requirement", "fp_required"] as const, stringField(record, "routingOutcome", "AuthorityContextFragment"), "AuthorityContextFragment.routingOutcome")
  });
}

function parseDestinationTopology(input: unknown): DestinationTopology {
  const record = plainRecord(input, "DestinationTopology");
  assertAllowedFields(record, "DestinationTopology", [
    "kind",
    "topologyRef",
    "frameworkRef",
    "constraintRefs",
    "appliesToRefs"
  ]);
  if (record["kind"] !== "destination_topology") {
    throw new TypeError("DestinationTopology.kind must be destination_topology");
  }
  return constructDestinationTopology({
    topologyRef: stringField(record, "topologyRef", "DestinationTopology"),
    frameworkRef: stringField(record, "frameworkRef", "DestinationTopology"),
    constraintRefs: stringArrayField(record, "constraintRefs", "DestinationTopology"),
    appliesToRefs: stringArrayField(record, "appliesToRefs", "DestinationTopology")
  });
}

function parseRequirementTestRelation(input: unknown): RequirementTestRelation {
  const record = plainRecord(input, "RequirementTestRelation");
  assertAllowedFields(record, "RequirementTestRelation", [
    "kind",
    "relationRef",
    "requirementId",
    "assetProjectionRef",
    "testSourceProjectionRef",
    "testExecutionProjectionRef",
    "interpretationProjectionRef",
    "componentTestRootRefs",
    "evidencePolicyRef"
  ]);
  if (record["kind"] !== "requirement_test_relation") {
    throw new TypeError("RequirementTestRelation.kind must be requirement_test_relation");
  }
  return constructRequirementTestRelation({
    relationRef: stringField(record, "relationRef", "RequirementTestRelation"),
    requirementId: stringField(record, "requirementId", "RequirementTestRelation"),
    assetProjectionRef: stringField(record, "assetProjectionRef", "RequirementTestRelation"),
    testSourceProjectionRef: stringField(record, "testSourceProjectionRef", "RequirementTestRelation"),
    testExecutionProjectionRef: stringField(record, "testExecutionProjectionRef", "RequirementTestRelation"),
    interpretationProjectionRef: stringField(record, "interpretationProjectionRef", "RequirementTestRelation"),
    componentTestRootRefs: stringArrayField(record, "componentTestRootRefs", "RequirementTestRelation"),
    evidencePolicyRef: stringField(record, "evidencePolicyRef", "RequirementTestRelation")
  });
}

function parseRequirementProjection(input: unknown): RequirementProjection {
  const record = plainRecord(input, "RequirementProjection");
  assertAllowedFields(record, "RequirementProjection", [
    "kind",
    "projectionRef",
    "requirementId",
    "spanId",
    "projectionRole",
    "authorityRole",
    "targetPath",
    "command",
    "fallbackCommand",
    "evidenceRole",
    "current",
    "sourceRefs",
    "supersedesProjectionRefs"
  ]);
  if (record["kind"] !== "requirement_projection") {
    throw new TypeError("RequirementProjection.kind must be requirement_projection");
  }
  const evidenceRole = record["evidenceRole"] === null
    ? null
    : parseEnumValue(REQUIREMENT_EVIDENCE_ROLE_VALUES, stringField(record, "evidenceRole", "RequirementProjection"), "RequirementProjection.evidenceRole");
  return constructRequirementProjection({
    projectionRef: stringField(record, "projectionRef", "RequirementProjection"),
    requirementId: stringField(record, "requirementId", "RequirementProjection"),
    spanId: stringField(record, "spanId", "RequirementProjection"),
    projectionRole: parseEnumValue(REQUIREMENT_PROJECTION_ROLE_VALUES, stringField(record, "projectionRole", "RequirementProjection"), "RequirementProjection.projectionRole"),
    authorityRole: parseEnumValue(REQUIREMENT_AUTHORITY_ROLE_VALUES, stringField(record, "authorityRole", "RequirementProjection"), "RequirementProjection.authorityRole"),
    targetPath: nullableStringField(record, "targetPath", "RequirementProjection"),
    command: nullableStringField(record, "command", "RequirementProjection"),
    fallbackCommand: nullableStringField(record, "fallbackCommand", "RequirementProjection"),
    evidenceRole,
    current: booleanField(record, "current", "RequirementProjection"),
    sourceRefs: stringArrayField(record, "sourceRefs", "RequirementProjection"),
    supersedesProjectionRefs: stringArrayField(record, "supersedesProjectionRefs", "RequirementProjection")
  });
}

function parseRequirementEvidenceBinding(input: unknown): RequirementEvidenceBinding {
  const record = plainRecord(input, "RequirementEvidenceBinding");
  assertAllowedFields(record, "RequirementEvidenceBinding", [
    "kind",
    "evidenceRef",
    "requirementId",
    "projectionRef",
    "evidenceRole",
    "bindingStatus",
    "path",
    "digest",
    "current",
    "supersedesEvidenceRefs",
    "reason"
  ]);
  if (record["kind"] !== "requirement_evidence_binding") {
    throw new TypeError("RequirementEvidenceBinding.kind must be requirement_evidence_binding");
  }
  return constructRequirementEvidenceBinding({
    evidenceRef: stringField(record, "evidenceRef", "RequirementEvidenceBinding"),
    requirementId: stringField(record, "requirementId", "RequirementEvidenceBinding"),
    projectionRef: stringField(record, "projectionRef", "RequirementEvidenceBinding"),
    evidenceRole: parseEnumValue(REQUIREMENT_EVIDENCE_ROLE_VALUES, stringField(record, "evidenceRole", "RequirementEvidenceBinding"), "RequirementEvidenceBinding.evidenceRole"),
    bindingStatus: parseEnumValue(REQUIREMENT_EVIDENCE_BINDING_STATUS_VALUES, stringField(record, "bindingStatus", "RequirementEvidenceBinding"), "RequirementEvidenceBinding.bindingStatus"),
    path: nullableStringField(record, "path", "RequirementEvidenceBinding"),
    digest: nullableStringField(record, "digest", "RequirementEvidenceBinding"),
    current: booleanField(record, "current", "RequirementEvidenceBinding"),
    supersedesEvidenceRefs: stringArrayField(record, "supersedesEvidenceRefs", "RequirementEvidenceBinding"),
    reason: stringField(record, "reason", "RequirementEvidenceBinding")
  });
}

function parseRequirementFoldProjection(input: unknown): RequirementFoldProjection {
  const record = plainRecord(input, "RequirementFoldProjection");
  assertAllowedFields(record, "RequirementFoldProjection", [
    "kind",
    "foldRef",
    "requirementId",
    "projectionRefs",
    "state",
    "sourceAbgTruthRefs",
    "evidenceRefs",
    "residualPressureRefs",
    "reason"
  ]);
  if (record["kind"] !== "requirement_fold_projection") {
    throw new TypeError("RequirementFoldProjection.kind must be requirement_fold_projection");
  }
  return constructRequirementFoldProjection({
    foldRef: stringField(record, "foldRef", "RequirementFoldProjection"),
    requirementId: stringField(record, "requirementId", "RequirementFoldProjection"),
    projectionRefs: stringArrayField(record, "projectionRefs", "RequirementFoldProjection"),
    state: parseEnumValue(REQUIREMENT_FOLD_STATE_VALUES, stringField(record, "state", "RequirementFoldProjection"), "RequirementFoldProjection.state"),
    sourceAbgTruthRefs: stringArrayField(record, "sourceAbgTruthRefs", "RequirementFoldProjection"),
    evidenceRefs: stringArrayField(record, "evidenceRefs", "RequirementFoldProjection"),
    residualPressureRefs: stringArrayField(record, "residualPressureRefs", "RequirementFoldProjection"),
    reason: stringField(record, "reason", "RequirementFoldProjection")
  });
}

function parseRequirementResidualProjection(input: unknown): RequirementResidualProjection {
  const record = plainRecord(input, "RequirementResidualProjection");
  assertAllowedFields(record, "RequirementResidualProjection", [
    "kind",
    "residualRef",
    "requirementId",
    "spanId",
    "pressureClass",
    "ownerSurface",
    "sourceFoldRefs",
    "evidenceRefs",
    "remainingProjectionRefs",
    "reason"
  ]);
  if (record["kind"] !== "requirement_residual_projection") {
    throw new TypeError("RequirementResidualProjection.kind must be requirement_residual_projection");
  }
  return constructRequirementResidualProjection({
    residualRef: stringField(record, "residualRef", "RequirementResidualProjection"),
    requirementId: stringField(record, "requirementId", "RequirementResidualProjection"),
    spanId: stringField(record, "spanId", "RequirementResidualProjection"),
    pressureClass: parseEnumValue(REQUIREMENT_RESIDUAL_PRESSURE_CLASS_VALUES, stringField(record, "pressureClass", "RequirementResidualProjection"), "RequirementResidualProjection.pressureClass"),
    ownerSurface: parseEnumValue(REQUIREMENT_STAGE_VALUES, stringField(record, "ownerSurface", "RequirementResidualProjection"), "RequirementResidualProjection.ownerSurface"),
    sourceFoldRefs: stringArrayField(record, "sourceFoldRefs", "RequirementResidualProjection"),
    evidenceRefs: stringArrayField(record, "evidenceRefs", "RequirementResidualProjection"),
    remainingProjectionRefs: stringArrayField(record, "remainingProjectionRefs", "RequirementResidualProjection"),
    reason: stringField(record, "reason", "RequirementResidualProjection")
  });
}

export function admitRequirementEventPayload(input: unknown): RequirementEventPayload {
  const record = plainRecord(input, "RequirementEventPayload");
  const kind = parseEnumValue(
    REQUIREMENT_EVENT_PAYLOAD_KIND_VALUES,
    stringField(record, "kind", "RequirementEventPayload"),
    "RequirementEventPayload.kind"
  );
  const eventRef = constructPayloadBase(record, "RequirementEventPayload");

  if (kind === "requirement_term_admitted") {
    assertAllowedFields(record, "RequirementEventPayload", ["kind", "eventRef", "term"]);
    return Object.freeze({ kind, eventRef, term: parseRequirementTerm(record["term"]) });
  }
  if (kind === "requirement_relation_admitted") {
    assertAllowedFields(record, "RequirementEventPayload", ["kind", "eventRef", "relation"]);
    return Object.freeze({ kind, eventRef, relation: parseRequirementRelation(record["relation"]) });
  }
  if (kind === "traversal_span_admitted") {
    assertAllowedFields(record, "RequirementEventPayload", ["kind", "eventRef", "span"]);
    return Object.freeze({ kind, eventRef, span: parseTraversalSpan(record["span"]) });
  }
  if (kind === "authority_context_fragment_admitted") {
    assertAllowedFields(record, "RequirementEventPayload", ["kind", "eventRef", "fragment"]);
    return Object.freeze({ kind, eventRef, fragment: parseAuthorityContextFragment(record["fragment"]) });
  }
  if (kind === "destination_topology_admitted") {
    assertAllowedFields(record, "RequirementEventPayload", ["kind", "eventRef", "topology"]);
    return Object.freeze({ kind, eventRef, topology: parseDestinationTopology(record["topology"]) });
  }
  if (kind === "requirement_test_relation_admitted") {
    assertAllowedFields(record, "RequirementEventPayload", ["kind", "eventRef", "testRelation"]);
    return Object.freeze({ kind, eventRef, testRelation: parseRequirementTestRelation(record["testRelation"]) });
  }
  if (kind === "requirement_projection_admitted") {
    assertAllowedFields(record, "RequirementEventPayload", ["kind", "eventRef", "projection"]);
    return Object.freeze({ kind, eventRef, projection: parseRequirementProjection(record["projection"]) });
  }
  if (kind === "requirement_evidence_bound") {
    assertAllowedFields(record, "RequirementEventPayload", ["kind", "eventRef", "binding"]);
    return Object.freeze({ kind, eventRef, binding: parseRequirementEvidenceBinding(record["binding"]) });
  }
  if (kind === "requirement_fold_projected") {
    assertAllowedFields(record, "RequirementEventPayload", ["kind", "eventRef", "fold"]);
    return Object.freeze({ kind, eventRef, fold: parseRequirementFoldProjection(record["fold"]) });
  }
  assertAllowedFields(record, "RequirementEventPayload", ["kind", "eventRef", "residual"]);
  return Object.freeze({ kind, eventRef, residual: parseRequirementResidualProjection(record["residual"]) });
}

function duplicateValues(values: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }
  return freezeArray([...duplicates].sort());
}

function pushDuplicateRefs(
  diagnostics: string[],
  label: string,
  values: readonly string[]
): void {
  for (const duplicate of duplicateValues(values)) {
    diagnostics.push(`${label} has duplicate ref ${duplicate}`);
  }
}

function pushMissingRefs(input: {
  readonly diagnostics: string[];
  readonly ownerRef: string;
  readonly fieldName: string;
  readonly refs: readonly string[];
  readonly allowedRefs: ReadonlySet<string>;
}): void {
  for (const ref of input.refs) {
    if (!input.allowedRefs.has(ref)) {
      input.diagnostics.push(`${input.ownerRef}.${input.fieldName} has dangling ref ${ref}`);
    }
  }
}

function diagnoseRequirementLedgerIntegrity(ledger: RequirementLedger): readonly string[] {
  const diagnostics: string[] = [];
  pushDuplicateRefs(diagnostics, "RequirementLedger.eventRefs", ledger.eventRefs);
  pushDuplicateRefs(
    diagnostics,
    "RequirementLedger.terms.requirementId",
    ledger.terms.map((term) => term.requirementId)
  );
  pushDuplicateRefs(
    diagnostics,
    "RequirementLedger.terms.stableId",
    ledger.terms.map((term) => term.stableId)
  );
  pushDuplicateRefs(
    diagnostics,
    "RequirementLedger.relations.relationId",
    ledger.relations.map((relation) => relation.relationId)
  );
  pushDuplicateRefs(
    diagnostics,
    "RequirementLedger.spans.spanId",
    ledger.spans.map((span) => span.spanId)
  );
  pushDuplicateRefs(
    diagnostics,
    "RequirementLedger.contextFragments.fragmentRef",
    ledger.contextFragments.map((fragment) => fragment.fragmentRef)
  );
  pushDuplicateRefs(
    diagnostics,
    "RequirementLedger.destinationTopologies.topologyRef",
    ledger.destinationTopologies.map((topology) => topology.topologyRef)
  );
  pushDuplicateRefs(
    diagnostics,
    "RequirementLedger.testRelations.relationRef",
    ledger.testRelations.map((relation) => relation.relationRef)
  );
  pushDuplicateRefs(
    diagnostics,
    "RequirementLedger.projections.projectionRef",
    ledger.projections.map((projection) => projection.projectionRef)
  );
  pushDuplicateRefs(
    diagnostics,
    "RequirementLedger.evidenceBindings.evidenceRef",
    ledger.evidenceBindings.map((binding) => binding.evidenceRef)
  );
  pushDuplicateRefs(
    diagnostics,
    "RequirementLedger.folds.foldRef",
    ledger.folds.map((fold) => fold.foldRef)
  );
  pushDuplicateRefs(
    diagnostics,
    "RequirementLedger.residuals.residualRef",
    ledger.residuals.map((residual) => residual.residualRef)
  );

  const requirementIds = new Set(ledger.terms.map((term) => term.requirementId));
  const relationIds = new Set(ledger.relations.map((relation) => relation.relationId));
  const spanIds = new Set(ledger.spans.map((span) => span.spanId));
  const contextRefs = new Set(
    ledger.contextFragments.map((fragment) => fragment.fragmentRef)
  );
  const projectionRefs = new Set(
    ledger.projections.map((projection) => projection.projectionRef)
  );
  const evidenceRefs = new Set(
    ledger.evidenceBindings.map((binding) => binding.evidenceRef)
  );
  const foldRefs = new Set(ledger.folds.map((fold) => fold.foldRef));
  const residualRefs = new Set(
    ledger.residuals.map((residual) => residual.residualRef)
  );

  for (const term of ledger.terms) {
    pushMissingRefs({
      diagnostics,
      ownerRef: term.requirementId,
      fieldName: "relationRefs",
      refs: term.relationRefs,
      allowedRefs: relationIds
    });
    pushMissingRefs({
      diagnostics,
      ownerRef: term.requirementId,
      fieldName: "spanRefs",
      refs: term.spanRefs,
      allowedRefs: spanIds
    });
    pushMissingRefs({
      diagnostics,
      ownerRef: term.requirementId,
      fieldName: "contextRefs",
      refs: term.contextRefs,
      allowedRefs: contextRefs
    });
    pushMissingRefs({
      diagnostics,
      ownerRef: term.requirementId,
      fieldName: "projectionRefs",
      refs: term.projectionRefs,
      allowedRefs: projectionRefs
    });
  }

  for (const relation of ledger.relations) {
    pushMissingRefs({
      diagnostics,
      ownerRef: relation.relationId,
      fieldName: "fromRequirementId",
      refs: [relation.fromRequirementId],
      allowedRefs: requirementIds
    });
    pushMissingRefs({
      diagnostics,
      ownerRef: relation.relationId,
      fieldName: "toRequirementId",
      refs: [relation.toRequirementId],
      allowedRefs: requirementIds
    });
    pushMissingRefs({
      diagnostics,
      ownerRef: relation.relationId,
      fieldName: "evidenceRefs",
      refs: relation.evidenceRefs,
      allowedRefs: evidenceRefs
    });
  }

  for (const testRelation of ledger.testRelations) {
    pushMissingRefs({
      diagnostics,
      ownerRef: testRelation.relationRef,
      fieldName: "requirementId",
      refs: [testRelation.requirementId],
      allowedRefs: requirementIds
    });
  }

  for (const projection of ledger.projections) {
    pushMissingRefs({
      diagnostics,
      ownerRef: projection.projectionRef,
      fieldName: "requirementId",
      refs: [projection.requirementId],
      allowedRefs: requirementIds
    });
    pushMissingRefs({
      diagnostics,
      ownerRef: projection.projectionRef,
      fieldName: "spanId",
      refs: [projection.spanId],
      allowedRefs: spanIds
    });
    pushMissingRefs({
      diagnostics,
      ownerRef: projection.projectionRef,
      fieldName: "supersedesProjectionRefs",
      refs: projection.supersedesProjectionRefs,
      allowedRefs: projectionRefs
    });
  }

  for (const binding of ledger.evidenceBindings) {
    pushMissingRefs({
      diagnostics,
      ownerRef: binding.evidenceRef,
      fieldName: "requirementId",
      refs: [binding.requirementId],
      allowedRefs: requirementIds
    });
    pushMissingRefs({
      diagnostics,
      ownerRef: binding.evidenceRef,
      fieldName: "projectionRef",
      refs: [binding.projectionRef],
      allowedRefs: projectionRefs
    });
    pushMissingRefs({
      diagnostics,
      ownerRef: binding.evidenceRef,
      fieldName: "supersedesEvidenceRefs",
      refs: binding.supersedesEvidenceRefs,
      allowedRefs: evidenceRefs
    });
  }

  for (const fold of ledger.folds) {
    pushMissingRefs({
      diagnostics,
      ownerRef: fold.foldRef,
      fieldName: "requirementId",
      refs: [fold.requirementId],
      allowedRefs: requirementIds
    });
    pushMissingRefs({
      diagnostics,
      ownerRef: fold.foldRef,
      fieldName: "projectionRefs",
      refs: fold.projectionRefs,
      allowedRefs: projectionRefs
    });
    pushMissingRefs({
      diagnostics,
      ownerRef: fold.foldRef,
      fieldName: "evidenceRefs",
      refs: fold.evidenceRefs,
      allowedRefs: evidenceRefs
    });
    pushMissingRefs({
      diagnostics,
      ownerRef: fold.foldRef,
      fieldName: "residualPressureRefs",
      refs: fold.residualPressureRefs,
      allowedRefs: residualRefs
    });
  }

  for (const residual of ledger.residuals) {
    pushMissingRefs({
      diagnostics,
      ownerRef: residual.residualRef,
      fieldName: "requirementId",
      refs: [residual.requirementId],
      allowedRefs: requirementIds
    });
    pushMissingRefs({
      diagnostics,
      ownerRef: residual.residualRef,
      fieldName: "spanId",
      refs: [residual.spanId],
      allowedRefs: spanIds
    });
    pushMissingRefs({
      diagnostics,
      ownerRef: residual.residualRef,
      fieldName: "sourceFoldRefs",
      refs: residual.sourceFoldRefs,
      allowedRefs: foldRefs
    });
    pushMissingRefs({
      diagnostics,
      ownerRef: residual.residualRef,
      fieldName: "evidenceRefs",
      refs: residual.evidenceRefs,
      allowedRefs: evidenceRefs
    });
    pushMissingRefs({
      diagnostics,
      ownerRef: residual.residualRef,
      fieldName: "remainingProjectionRefs",
      refs: residual.remainingProjectionRefs,
      allowedRefs: projectionRefs
    });
  }

  return freezeArray(diagnostics);
}

export function projectRequirementLedger(
  events: readonly RequirementEventPayload[]
): RequirementLedger {
  const terms: RequirementTerm[] = [];
  const relations: RequirementRelation[] = [];
  const spans: TraversalSpan[] = [];
  const contextFragments: AuthorityContextFragment[] = [];
  const destinationTopologies: DestinationTopology[] = [];
  const testRelations: RequirementTestRelation[] = [];
  const projections: RequirementProjection[] = [];
  const evidenceBindings: RequirementEvidenceBinding[] = [];
  const folds: RequirementFoldProjection[] = [];
  const residuals: RequirementResidualProjection[] = [];
  const eventRefs: string[] = [];

  for (const event of events) {
    eventRefs.push(event.eventRef);
    switch (event.kind) {
      case "requirement_term_admitted":
        terms.push(event.term);
        break;
      case "requirement_relation_admitted":
        relations.push(event.relation);
        break;
      case "traversal_span_admitted":
        spans.push(event.span);
        break;
      case "authority_context_fragment_admitted":
        contextFragments.push(event.fragment);
        break;
      case "destination_topology_admitted":
        destinationTopologies.push(event.topology);
        break;
      case "requirement_test_relation_admitted":
        testRelations.push(event.testRelation);
        break;
      case "requirement_projection_admitted":
        projections.push(event.projection);
        break;
      case "requirement_evidence_bound":
        evidenceBindings.push(event.binding);
        break;
      case "requirement_fold_projected":
        folds.push(event.fold);
        break;
      case "requirement_residual_projected":
        residuals.push(event.residual);
        break;
    }
  }

  const ledger = Object.freeze({
    kind: "requirement_ledger_projection",
    ledgerRef: `requirement-ledger:${stableSha256Digest(eventRefs)}`,
    eventRefs: freezeStringArray(eventRefs, "RequirementLedger.eventRefs"),
    terms: freezeArray(terms),
    relations: freezeArray(relations),
    spans: freezeArray(spans),
    contextFragments: freezeArray(contextFragments),
    destinationTopologies: freezeArray(destinationTopologies),
    testRelations: freezeArray(testRelations),
    projections: freezeArray(projections),
    evidenceBindings: freezeArray(evidenceBindings),
    folds: freezeArray(folds),
    residuals: freezeArray(residuals)
  });
  const diagnostics = diagnoseRequirementLedgerIntegrity(ledger);
  if (diagnostics.length > 0) {
    throw new TypeError(
      `RequirementLedger integrity failure: ${diagnostics.join("; ")}`
    );
  }
  return ledger;
}

function overlaps(left: readonly string[] | undefined, right: readonly string[]): boolean {
  if (left === undefined || left.length === 0) {
    return true;
  }
  const rightSet = new Set(right);
  return left.some((value) => rightSet.has(value));
}

function optionalStringMatches(
  value: string | undefined,
  allowed: readonly string[]
): boolean {
  return value === undefined || allowed.includes(value);
}

function vectorIndexRange(
  vectorIndexes: readonly number[]
): { readonly min: number; readonly max: number } | null {
  if (vectorIndexes.length < 2) {
    return null;
  }
  return Object.freeze({
    min: Math.min(...vectorIndexes),
    max: Math.max(...vectorIndexes)
  });
}

function spanEndpointRefs(span: TraversalSpan): readonly string[] {
  return Object.freeze([span.sourceNodeRef, span.targetNodeRef, ...span.aliasRefs]);
}

function edgeEndpointsFallWithinSpan(span: TraversalSpan, edge: RequirementEdgeRef): boolean {
  if (edge.sourceNodeRef === undefined || edge.targetNodeRef === undefined) {
    return false;
  }
  const endpointRefs = spanEndpointRefs(span);
  return endpointRefs.includes(edge.sourceNodeRef) && endpointRefs.includes(edge.targetNodeRef);
}

function spanCoversEdge(span: TraversalSpan, edge: RequirementEdgeRef): boolean {
  if (span.graphFunctionRef !== edge.graphFunctionRef) {
    return false;
  }

  const explicitVectorMatch = span.graphVectorRefs.includes(edge.graphVectorRef);
  const boundaryVectorMatch = span.vectorIndexes.includes(edge.vectorIndex);
  const range = vectorIndexRange(span.vectorIndexes);
  const interiorIndexMatch =
    range !== null && edge.vectorIndex > range.min && edge.vectorIndex < range.max;
  const endpointRangeMatch = edgeEndpointsFallWithinSpan(span, edge);
  const vectorMatches =
    explicitVectorMatch ||
    boundaryVectorMatch ||
    interiorIndexMatch ||
    endpointRangeMatch;
  if (!vectorMatches) {
    return false;
  }

  if (!interiorIndexMatch && !endpointRangeMatch) {
    if (!optionalStringMatches(edge.sourceNodeRef, [span.sourceNodeRef, ...span.aliasRefs])) {
      return false;
    }
    if (!optionalStringMatches(edge.targetNodeRef, [span.targetNodeRef, ...span.aliasRefs])) {
      return false;
    }
  }

  if (!overlaps(edge.frameRefs, span.frameRefs)) {
    return false;
  }
  if (!overlaps(edge.zoomRefs, span.zoomRefs)) {
    return false;
  }
  if (!overlaps(edge.foldbackRefs, span.foldbackRefs)) {
    return false;
  }
  return overlaps(edge.aliasRefs, [edge.edge, ...span.aliasRefs]);
}

function termHasActiveSpan(
  term: RequirementTerm,
  activeSpanIds: ReadonlySet<string>
): boolean {
  return term.spanRefs.some((spanRef) => activeSpanIds.has(spanRef));
}

function appliesToAny(
  appliesToRefs: readonly string[],
  refs: ReadonlySet<string>
): boolean {
  return appliesToRefs.some((ref) => refs.has(ref));
}

export function buildEdgeRequirementEnvironment(input: {
  readonly ledger: RequirementLedger;
  readonly edge: RequirementEdgeRef;
}): EdgeRequirementEnvironment {
  const activeSpans = input.ledger.spans.filter((span) => spanCoversEdge(span, input.edge));
  const activeSpanIds = new Set(activeSpans.map((span) => span.spanId));
  const residualsOnActiveSpans = input.ledger.residuals.filter((residual) =>
    activeSpanIds.has(residual.spanId)
  );
  const residualRequirementIds = new Set(
    residualsOnActiveSpans.map((residual) => residual.requirementId)
  );
  const directlyActiveTerms = input.ledger.terms.filter((term) =>
    termHasActiveSpan(term, activeSpanIds) ||
    residualRequirementIds.has(term.requirementId)
  );
  const directlyActiveRequirementIds = new Set(
    directlyActiveTerms.map((term) => term.requirementId)
  );
  const directlyReferencedRelationRefs = new Set(
    directlyActiveTerms.flatMap((term) => term.relationRefs)
  );
  const activeRelations = input.ledger.relations.filter((relation) =>
    directlyReferencedRelationRefs.has(relation.relationId) ||
    directlyActiveRequirementIds.has(relation.fromRequirementId) ||
    directlyActiveRequirementIds.has(relation.toRequirementId)
  );
  const relatedRequirementIds = new Set([
    ...directlyActiveRequirementIds,
    ...activeRelations.flatMap((relation) => [
      relation.fromRequirementId,
      relation.toRequirementId
    ])
  ]);
  const activeTerms = input.ledger.terms.filter((term) =>
    relatedRequirementIds.has(term.requirementId)
  );
  const activeRequirementIds = new Set(activeTerms.map((term) => term.requirementId));
  const priorFolds = input.ledger.folds.filter((fold) => activeRequirementIds.has(fold.requirementId));
  const carriedResiduals = input.ledger.residuals.filter((residual) =>
    activeRequirementIds.has(residual.requirementId)
  );
  const activeRefs = new Set<string>([
    ...activeSpanIds,
    ...activeRequirementIds,
    ...activeRelations.flatMap((relation) => [
      relation.relationId,
      relation.sourceRef,
      relation.fromRequirementId,
      relation.toRequirementId
    ]),
    ...activeSpans.flatMap((span) => [
      span.sourceNodeRef,
      span.targetNodeRef,
      ...span.frameRefs,
      ...span.zoomRefs,
      ...span.foldbackRefs,
      ...span.aliasRefs
    ]),
    input.edge.graphFunctionRef,
    input.edge.graphVectorRef,
    input.edge.edge,
    ...(input.edge.sourceNodeRef === undefined ? [] : [input.edge.sourceNodeRef]),
    ...(input.edge.targetNodeRef === undefined ? [] : [input.edge.targetNodeRef]),
    ...(input.edge.frameRefs ?? []),
    ...(input.edge.zoomRefs ?? []),
    ...(input.edge.foldbackRefs ?? []),
    ...(input.edge.aliasRefs ?? []),
    ...priorFolds.map((fold) => fold.foldRef),
    ...carriedResiduals.flatMap((residual) => [
      residual.residualRef,
      ...residual.sourceFoldRefs,
      ...residual.remainingProjectionRefs
    ])
  ]);

  return Object.freeze({
    kind: "edge_requirement_environment",
    environmentRef: [
      "edge-requirement-environment",
      input.edge.graphFunctionRef,
      input.edge.graphVectorRef,
      String(input.edge.vectorIndex),
      activeTerms.map((term) => term.requirementId).join(",")
    ].join(":"),
    edge: freezeRequirementEdgeRef(input.edge),
    activeTerms: freezeArray(activeTerms),
    activeRelations: freezeArray(activeRelations),
    activeSpans: freezeArray(activeSpans),
    activeContextFragments: freezeArray(
      input.ledger.contextFragments.filter((fragment) => appliesToAny(fragment.appliesToRefs, activeRefs))
    ),
    activeDestinationTopologies: freezeArray(
      input.ledger.destinationTopologies.filter((topology) => appliesToAny(topology.appliesToRefs, activeRefs))
    ),
    activeTestRelations: freezeArray(
      input.ledger.testRelations.filter((relation) => activeRequirementIds.has(relation.requirementId))
    ),
    priorFolds: freezeArray(priorFolds),
    carriedResiduals: freezeArray(carriedResiduals)
  });
}

export function activeRequirements(input: {
  readonly ledger: RequirementLedger;
  readonly edge: RequirementEdgeRef;
}): readonly RequirementTerm[] {
  return buildEdgeRequirementEnvironment(input).activeTerms;
}

export function projectRequirementGraph(input: {
  readonly ledger: RequirementLedger;
  readonly environment?: EdgeRequirementEnvironment | undefined;
}): RequirementGraphProjection {
  const requirementIds = input.ledger.terms.map((term) => term.requirementId);
  const relationRefs = input.ledger.relations.map((relation) => relation.relationId);
  const activeRequirementIds =
    input.environment?.activeTerms.map((term) => term.requirementId) ??
    requirementIds;
  const activeRequirementIdSet = new Set(activeRequirementIds);
  const activeRelations =
    input.environment?.activeRelations ??
    input.ledger.relations.filter((relation) =>
      activeRequirementIdSet.has(relation.fromRequirementId) ||
      activeRequirementIdSet.has(relation.toRequirementId)
    );
  const activeRelationRefs = activeRelations.map((relation) => relation.relationId);
  const parentChildRelations = activeRelations.filter((relation) =>
    relation.relationKind === "refinement" &&
    activeRequirementIdSet.has(relation.fromRequirementId) &&
    activeRequirementIdSet.has(relation.toRequirementId)
  );
  const parentIds = new Set(
    parentChildRelations.map((relation) => relation.fromRequirementId)
  );
  const childIds = new Set(
    parentChildRelations.map((relation) => relation.toRequirementId)
  );
  const rootRequirementIds = activeRequirementIds.filter((requirementId) =>
    !childIds.has(requirementId)
  );
  const leafRequirementIds = activeRequirementIds.filter((requirementId) =>
    !parentIds.has(requirementId)
  );
  const parentChildPairs = parentChildRelations.map((relation) =>
    Object.freeze({
      kind: "requirement_graph_pair_projection" as const,
      relationRef: relation.relationId,
      relationKind: relation.relationKind,
      parentRequirementId: relation.fromRequirementId,
      childRequirementId: relation.toRequirementId,
      sourceRef: relation.sourceRef
    })
  );
  const sourceRefs = [
    ...input.ledger.terms
      .filter((term) => activeRequirementIdSet.has(term.requirementId))
      .map((term) => term.sourceRef),
    ...activeRelations.map((relation) => relation.sourceRef)
  ];
  return Object.freeze({
    kind: "requirement_graph_projection",
    graphRef: `requirement-graph:${stableSha256Digest({
      requirementIds,
      relationRefs,
      activeRequirementIds,
      activeRelationRefs
    })}`,
    requirementIds: freezeStringArray(requirementIds, "RequirementGraphProjection.requirementIds"),
    relationRefs: freezeStringArray(relationRefs, "RequirementGraphProjection.relationRefs"),
    activeRequirementIds: freezeStringArray(activeRequirementIds, "RequirementGraphProjection.activeRequirementIds"),
    activeRelationRefs: freezeStringArray(activeRelationRefs, "RequirementGraphProjection.activeRelationRefs"),
    rootRequirementIds: freezeStringArray(rootRequirementIds, "RequirementGraphProjection.rootRequirementIds"),
    leafRequirementIds: freezeStringArray(leafRequirementIds, "RequirementGraphProjection.leafRequirementIds"),
    parentChildPairs: freezeArray(parentChildPairs),
    sourceRefs: freezeStringArray(sourceRefs, "RequirementGraphProjection.sourceRefs")
  });
}

export function projectRequirementSpanLineage(input: {
  readonly ledger: RequirementLedger;
  readonly environment?: EdgeRequirementEnvironment | undefined;
}): readonly RequirementSpanLineageProjection[] {
  const activeSpanIds = new Set(
    input.environment?.activeSpans.map((span) => span.spanId) ?? []
  );
  const sourceRefsBySpan = new Map<string, string[]>();
  for (const term of input.ledger.terms) {
    for (const spanRef of term.spanRefs) {
      sourceRefsBySpan.set(spanRef, [
        ...(sourceRefsBySpan.get(spanRef) ?? []),
        term.sourceRef
      ]);
    }
  }
  return freezeArray(
    input.ledger.spans.map((span) => Object.freeze({
      kind: "requirement_span_lineage_projection" as const,
      lineageRef: `requirement-span-lineage:${stableSha256Digest({
        spanId: span.spanId,
        graphFunctionRef: span.graphFunctionRef,
        graphVectorRefs: span.graphVectorRefs,
        vectorIndexes: span.vectorIndexes,
        frameRefs: span.frameRefs,
        zoomRefs: span.zoomRefs,
        foldbackRefs: span.foldbackRefs,
        aliasRefs: span.aliasRefs,
        active: activeSpanIds.has(span.spanId)
      })}`,
      spanId: span.spanId,
      graphFunctionRef: span.graphFunctionRef,
      graphVectorRefs: freezeStringArray(span.graphVectorRefs, "RequirementSpanLineageProjection.graphVectorRefs"),
      vectorIndexes: freezeNumberArray(span.vectorIndexes, "RequirementSpanLineageProjection.vectorIndexes"),
      sourceNodeRef: span.sourceNodeRef,
      targetNodeRef: span.targetNodeRef,
      frameRefs: freezeStringArray(span.frameRefs, "RequirementSpanLineageProjection.frameRefs"),
      zoomRefs: freezeStringArray(span.zoomRefs, "RequirementSpanLineageProjection.zoomRefs"),
      foldbackRefs: freezeStringArray(span.foldbackRefs, "RequirementSpanLineageProjection.foldbackRefs"),
      aliasRefs: freezeStringArray(span.aliasRefs, "RequirementSpanLineageProjection.aliasRefs"),
      active: activeSpanIds.has(span.spanId),
      sourceRefs: freezeStringArray(
        sourceRefsBySpan.get(span.spanId) ?? [],
        "RequirementSpanLineageProjection.sourceRefs"
      )
    }))
  );
}

function hasActiveRefinementChildren(
  term: RequirementTerm,
  environment: EdgeRequirementEnvironment
): boolean {
  const activeRequirementIds = new Set(
    environment.activeTerms.map((activeTerm) => activeTerm.requirementId)
  );
  return environment.activeRelations.some((relation) =>
    relation.relationKind === "refinement" &&
    relation.fromRequirementId === term.requirementId &&
    activeRequirementIds.has(relation.toRequirementId)
  );
}

function shouldDeriveLeafRequirementProjection(
  term: RequirementTerm,
  environment: EdgeRequirementEnvironment
): boolean {
  return term.termKind !== "composition" ||
    !hasActiveRefinementChildren(term, environment);
}

export function routeContextConstraint(input: {
  readonly fragment: AuthorityContextFragment;
  readonly activeRefs: readonly string[];
}): RequirementContextRouteProjection {
  const activeRefSet = new Set(input.activeRefs);
  const applies = appliesToAny(input.fragment.appliesToRefs, activeRefSet);
  let route: RequirementContextRouteProjection["route"] = "constraint_only";
  if (input.fragment.routingOutcome === "promoted_requirement" && applies) {
    route = "active_requirement_context";
  } else if (input.fragment.routingOutcome === "fp_required" && applies) {
    route = "semantic_assessment_required";
  }
  return Object.freeze({
    kind: "requirement_context_route_projection",
    fragmentRef: input.fragment.fragmentRef,
    stage: input.fragment.stage,
    route,
    applies,
    appliesToRefs: freezeStringArray(input.fragment.appliesToRefs, "RequirementContextRouteProjection.appliesToRefs")
  });
}

export function projectRequirements(input: {
  readonly ledger: RequirementLedger;
  readonly environment: EdgeRequirementEnvironment;
}): readonly RequirementProjection[] {
  const activeRequirementIds = new Set(
    input.environment.activeTerms.map((term) => term.requirementId)
  );
  const activeSpanIds = new Set(input.environment.activeSpans.map((span) => span.spanId));
  const explicit = input.ledger.projections.filter(
    (projection) =>
      projection.current &&
      activeRequirementIds.has(projection.requirementId) &&
      activeSpanIds.has(projection.spanId)
  );
  const explicitObligationIds = new Set(
    explicit
      .filter((projection) => projection.projectionRole === "obligation")
      .map((projection) => projection.requirementId)
  );
  const derived = input.environment.activeTerms
    .filter((term) =>
      !explicitObligationIds.has(term.requirementId) &&
      shouldDeriveLeafRequirementProjection(term, input.environment)
    )
    .map((term) =>
      constructRequirementProjection({
        projectionRef: `projection:${term.requirementId}:obligation`,
        requirementId: term.requirementId,
        spanId: activeSpanIdForTerm(term, input.environment) ?? "span:unknown",
        projectionRole: "obligation",
        authorityRole: "requirement",
        targetPath: null,
        command: null,
        fallbackCommand: null,
        evidenceRole: null,
        current: true,
        sourceRefs: [term.sourceRef],
        supersedesProjectionRefs: []
      })
    );
  return freezeArray([...explicit, ...derived]);
}

export function projectMaterializationTargets(
  projections: readonly RequirementProjection[]
): readonly RequirementProjection[] {
  const bestByTarget = new Map<string, RequirementProjection>();
  for (const projection of projections) {
    if (projection.projectionRole !== "materialization_target" || projection.targetPath === null) {
      continue;
    }
    const key = `${projection.requirementId}:${projection.targetPath}`;
    const existing = bestByTarget.get(key);
    if (
      existing === undefined ||
      AUTHORITY_ROLE_PRECEDENCE[projection.authorityRole] >
        AUTHORITY_ROLE_PRECEDENCE[existing.authorityRole]
    ) {
      bestByTarget.set(key, projection);
    }
  }
  return freezeArray([...bestByTarget.values()]);
}

export function projectExecutionSchedules(
  projections: readonly RequirementProjection[]
): readonly RequirementExecutionScheduleProjection[] {
  const schedules = projections.filter(
    (projection) => projection.projectionRole === "execution_schedule"
  );
  return freezeArray(
    schedules.map((projection) => {
      const command = projection.command ?? projection.fallbackCommand;
      if (command === null) {
        throw new TypeError(`Execution schedule ${projection.projectionRef} has no command`);
      }
      return Object.freeze({
        kind: "requirement_execution_schedule_projection" as const,
        projectionRef: projection.projectionRef,
        requirementId: projection.requirementId,
        command,
        source: projection.command === null ? "fallback" as const : "admitted_schedule" as const
      });
    })
  );
}

export function classifyRequirementEvidenceRole(input: {
  readonly path: string;
  readonly environment: EdgeRequirementEnvironment;
}): RequirementEvidenceRole {
  for (const relation of input.environment.activeTestRelations) {
    for (const root of relation.componentTestRootRefs) {
      const normalizedRoot = root.endsWith("/") ? root : `${root}/`;
      if (input.path === root || input.path.startsWith(normalizedRoot)) {
        return "test_source";
      }
    }
  }
  return "asset";
}

export function bindRequirementEvidence(input: {
  readonly environment: EdgeRequirementEnvironment;
  readonly projection: RequirementProjection;
  readonly evidenceRef: string;
  readonly path: string | null;
  readonly digest: string | null;
  readonly admitted: boolean;
  readonly byproduct: boolean;
  readonly current: boolean;
  readonly supersedesEvidenceRefs?: readonly string[];
}): RequirementEvidenceBinding {
  const pathEvidenceRole = input.path === null
    ? null
    : classifyRequirementEvidenceRole({
      path: input.path,
      environment: input.environment
    });
  const evidenceRole = input.byproduct
    ? "byproduct"
    : input.projection.evidenceRole ??
      pathEvidenceRole ??
      "asset";
  const testSourceOutsideAdmittedRoots =
    !input.byproduct &&
    input.projection.evidenceRole === "test_source" &&
    input.path !== null &&
    pathEvidenceRole !== "test_source";
  const bindingStatus: RequirementEvidenceBindingStatus =
    input.byproduct
      ? "non_closing"
      : testSourceOutsideAdmittedRoots || !input.admitted
        ? "rejected"
        : "admitted";
  return constructRequirementEvidenceBinding({
    evidenceRef: input.evidenceRef,
    requirementId: input.projection.requirementId,
    projectionRef: input.projection.projectionRef,
    evidenceRole,
    bindingStatus,
    path: input.path,
    digest: input.digest,
    current: input.current,
    supersedesEvidenceRefs: input.supersedesEvidenceRefs ?? [],
    reason: bindingStatus === "admitted"
      ? "admitted requirement evidence"
      : bindingStatus === "rejected"
        ? testSourceOutsideAdmittedRoots
          ? "test_source evidence path is outside admitted test roots"
          : "evidence rejected for the active requirement projection"
      : "evidence is non-closing for the active requirement projection"
  });
}

export function currentEvidenceBindings(
  bindings: readonly RequirementEvidenceBinding[]
): readonly RequirementEvidenceBinding[] {
  const superseded = new Set<string>();
  for (const binding of bindings) {
    if (binding.current) {
      for (const ref of binding.supersedesEvidenceRefs) {
        superseded.add(ref);
      }
    }
  }
  return freezeArray(
    bindings.filter((binding) => binding.current && !superseded.has(binding.evidenceRef))
  );
}

export const REQUIREMENT_ABG_ASSURANCE_CLOSURE_DECISION_REF_PREFIX =
  "abg://assurance-closure-decision" as const;

function parseAssuranceClosureDecisionKind(
  value: string
): AssuranceClosureDecisionKind | null {
  for (const decision of ASSURANCE_CLOSURE_DECISION_KIND_VALUES) {
    if (value === decision) {
      return decision;
    }
  }
  return null;
}

export function requirementAbgTruthRefFromAssuranceClosureDecision(
  input: Pick<AssuranceClosureDecision, "kind" | "decision" | "projectionRef">
): string {
  if (input.kind !== "assurance_closure_decision") {
    throw new TypeError("requirement fold source requires an AssuranceClosureDecision");
  }
  const decision = parseAssuranceClosureDecisionKind(input.decision);
  if (decision === null) {
    throw new TypeError(
      `Unsupported assurance closure decision ${JSON.stringify(input.decision)}`
    );
  }
  return [
    REQUIREMENT_ABG_ASSURANCE_CLOSURE_DECISION_REF_PREFIX,
    decision,
    stableSha256Digest([input.projectionRef]),
    encodeURIComponent(input.projectionRef)
  ].join("/");
}

function assuranceClosureDecisionFromTruthRef(
  ref: string
): {
  readonly decision: AssuranceClosureDecisionKind;
  readonly projectionRef: string;
} | null {
  const prefix = `${REQUIREMENT_ABG_ASSURANCE_CLOSURE_DECISION_REF_PREFIX}/`;
  if (!ref.startsWith(prefix)) {
    return null;
  }
  const parts = ref.slice(prefix.length).split("/");
  if (parts.length !== 3 || !parts[1]?.startsWith("sha256:") || parts[2] === undefined) {
    return null;
  }
  const decision = parseAssuranceClosureDecisionKind(parts[0] ?? "");
  if (decision === null) {
    return null;
  }
  let projectionRef: string;
  try {
    projectionRef = decodeURIComponent(parts[2]);
  } catch {
    return null;
  }
  if (projectionRef.length === 0 || stableSha256Digest([projectionRef]) !== parts[1]) {
    return null;
  }
  return Object.freeze({ decision, projectionRef });
}

function requirementFoldStateFromAssuranceDecision(
  decision: AssuranceClosureDecisionKind
): RequirementFoldState {
  switch (decision) {
    case "close":
      return "satisfied";
    case "retry":
      return "partial";
    case "block":
      return "blocked";
    case "qualified_defer":
      return "deferred";
    case "reprice":
      return "repriced";
  }
}

function foldStateFromEvidence(
  sourceAbgTruthRefs: readonly string[]
): RequirementFoldState {
  for (const sourceRef of sourceAbgTruthRefs) {
    const decision = assuranceClosureDecisionFromTruthRef(sourceRef);
    if (decision !== null) {
      return requirementFoldStateFromAssuranceDecision(decision.decision);
    }
  }
  return "no_close_preserved";
}

function activeSpanIdForTerm(
  term: RequirementTerm,
  environment: EdgeRequirementEnvironment
): string | null {
  const activeSpanIds = new Set(environment.activeSpans.map((span) => span.spanId));
  const direct = term.spanRefs.find((spanRef) => activeSpanIds.has(spanRef));
  if (direct !== undefined) {
    return direct;
  }
  return environment.carriedResiduals.find((residual) =>
    residual.requirementId === term.requirementId &&
    activeSpanIds.has(residual.spanId)
  )?.spanId ?? null;
}

export function foldRequirementEvidence(input: {
  readonly environment: EdgeRequirementEnvironment;
  readonly projections: readonly RequirementProjection[];
  readonly evidenceBindings: readonly RequirementEvidenceBinding[];
  readonly sourceAbgTruthRefs: readonly string[];
  readonly sourceAbgTruthRefsByRequirementId?: Readonly<Record<string, readonly string[]>>;
}): readonly RequirementFoldProjection[] {
  return freezeArray(
    input.environment.activeTerms.flatMap((term) => {
      const projectionRefs = input.projections
        .filter((projection) => projection.requirementId === term.requirementId)
        .map((projection) => projection.projectionRef);
      if (
        projectionRefs.length === 0 &&
        !shouldDeriveLeafRequirementProjection(term, input.environment)
      ) {
        return [];
      }
      const bindings = input.evidenceBindings.filter(
        (binding) => binding.requirementId === term.requirementId
      );
      const evidenceRefs = currentEvidenceBindings(bindings).map((binding) => binding.evidenceRef);
      const sourceAbgTruthRefs =
        input.sourceAbgTruthRefsByRequirementId?.[term.requirementId] ??
        (input.environment.activeTerms.length === 1 ? input.sourceAbgTruthRefs : []);
      const state = foldStateFromEvidence(sourceAbgTruthRefs);
      return [constructRequirementFoldProjection({
        foldRef: `requirement-fold:${term.requirementId}:${state}:${evidenceRefs.join(",")}`,
        requirementId: term.requirementId,
        projectionRefs,
        state,
        sourceAbgTruthRefs,
        evidenceRefs,
        residualPressureRefs: state === "satisfied" ? [] : [requirementResidualRef(term.requirementId, state)],
        reason: `requirement fold projected from ${evidenceRefs.length} current evidence binding(s)`
      })];
    })
  );
}

function residualClassForFold(fold: RequirementFoldProjection): RequirementResidualPressureClass {
  if (fold.state === "blocked") {
    return "blocked_prerequisite";
  }
  if (fold.state === "repriced") {
    return "human_decision_required";
  }
  if (fold.state === "no_close_preserved") {
    return "non_closing_evidence";
  }
  if (fold.state === "deferred") {
    return "continuation_deferred";
  }
  return "missing_execution_evidence";
}

export function residualizeRequirementFolds(input: {
  readonly environment: EdgeRequirementEnvironment;
  readonly folds: readonly RequirementFoldProjection[];
}): readonly RequirementResidualProjection[] {
  return freezeArray(
    input.folds
      .filter((fold) => fold.state !== "satisfied")
      .map((fold) => {
        const term = input.environment.activeTerms.find((candidate) =>
          candidate.requirementId === fold.requirementId
        );
        const spanId =
          term === undefined
            ? input.environment.activeSpans[0]?.spanId ?? "span:unknown"
            : activeSpanIdForTerm(term, input.environment) ?? "span:unknown";
        return constructRequirementResidualProjection({
          residualRef: requirementResidualRef(fold.requirementId, fold.state),
          requirementId: fold.requirementId,
          spanId,
          pressureClass: residualClassForFold(fold),
          ownerSurface: fold.state === "repriced" ? "requirements" : "runtime",
          sourceFoldRefs: [fold.foldRef],
          evidenceRefs: fold.evidenceRefs,
          remainingProjectionRefs: fold.projectionRefs,
          reason: `requirement fold ${fold.state} preserves non-closing pressure`
        });
      })
  );
}

export function classifyRequirementAttenuation(input: {
  readonly priorResiduals: readonly RequirementResidualProjection[];
  readonly residuals: readonly RequirementResidualProjection[];
}): RequirementAttenuationProjection {
  const priorRefs = input.priorResiduals.map((residual) => residual.residualRef);
  const residualRefs = input.residuals.map((residual) => residual.residualRef);
  const residualKey = (residual: RequirementResidualProjection): string =>
    `${residual.requirementId}:${residual.spanId}`;
  const priorByKey = new Map(
    input.priorResiduals.map((residual) => [residualKey(residual), residual])
  );
  const residualByKey = new Map(
    input.residuals.map((residual) => [residualKey(residual), residual])
  );
  const newResiduals = input.residuals.filter(
    (residual) => !priorByKey.has(residualKey(residual))
  );
  const movedToPrerequisite = input.residuals.some((residual) => {
    const prior = priorByKey.get(residualKey(residual));
    return (
      residual.pressureClass === "blocked_prerequisite" &&
      prior !== undefined &&
      prior.pressureClass !== "blocked_prerequisite"
    );
  });
  const escalated = newResiduals.length > 0 || input.residuals.some((residual) => {
    const prior = priorByKey.get(residualKey(residual));
    return (
      residual.pressureClass === "human_decision_required" &&
      prior !== undefined &&
      prior.pressureClass !== "human_decision_required"
    );
  });
  const transformed = input.residuals.some((residual) => {
    const prior = priorByKey.get(residualKey(residual));
    return prior !== undefined && prior.pressureClass !== residual.pressureClass;
  });
  const narrowed = input.priorResiduals.some(
    (residual) => !residualByKey.has(residualKey(residual))
  );
  let attenuation: RequirementAttenuationKind = "unchanged";
  if (input.priorResiduals.length > 0 && input.residuals.length === 0) {
    attenuation = "cleared";
  } else if (movedToPrerequisite) {
    attenuation = "moved_to_prerequisite";
  } else if (escalated) {
    attenuation = "escalated";
  } else if (narrowed) {
    attenuation = "narrowed";
  } else if (transformed) {
    attenuation = "transformed";
  }
  return Object.freeze({
    kind: "requirement_attenuation_projection",
    attenuation,
    priorResidualRefs: freezeStringArray(priorRefs, "RequirementAttenuationProjection.priorResidualRefs"),
    residualRefs: freezeStringArray(residualRefs, "RequirementAttenuationProjection.residualRefs"),
    reason: `attenuation classified as ${attenuation}`
  });
}

export function projectAssuranceCase(input: {
  readonly environment: EdgeRequirementEnvironment;
  readonly folds: readonly RequirementFoldProjection[];
  readonly residuals: readonly RequirementResidualProjection[];
}): readonly RequirementAssuranceClaim[] {
  return freezeArray(
    input.environment.activeTerms.map((term) => {
      const folds = input.folds.filter((fold) => fold.requirementId === term.requirementId);
      const residuals = input.residuals.filter((residual) => residual.requirementId === term.requirementId);
      const status = folds.length === 0
        ? "no_evidence"
        : folds.some((fold) => fold.state === "blocked")
          ? "blocked"
          : residuals.length > 0 || folds.some((fold) => fold.state !== "satisfied")
          ? "partial"
          : "supported";
      return constructRequirementAssuranceClaim({
        claimRef: `requirement-assurance-claim:${term.requirementId}`,
        requirementId: term.requirementId,
        contextRefs: term.contextRefs,
        evidenceRefs: folds.flatMap((fold) => fold.evidenceRefs),
        foldRefs: folds.map((fold) => fold.foldRef),
        residualRefs: residuals.map((residual) => residual.residualRef),
        status
      });
    })
  );
}

const AGGREGATE_FOLD_STATE_PRECEDENCE: readonly (RequirementFoldState | "no_evidence")[] =
  Object.freeze([
    "blocked",
    "repriced",
    "partial",
    "deferred",
    "no_close_preserved",
    "satisfied",
    "no_evidence"
  ]);

function aggregateFoldState(
  folds: readonly RequirementFoldProjection[]
): RequirementFoldState | "no_evidence" {
  if (folds.length === 0) {
    return "no_evidence";
  }
  const states = new Set(folds.map((fold) => fold.state));
  for (const state of AGGREGATE_FOLD_STATE_PRECEDENCE) {
    if (state !== "no_evidence" && states.has(state)) {
      return state;
    }
  }
  return "no_evidence";
}

export function projectRequirementAggregateStates(input: {
  readonly ledger: RequirementLedger;
  readonly environment: EdgeRequirementEnvironment;
  readonly folds: readonly RequirementFoldProjection[];
  readonly residuals: readonly RequirementResidualProjection[];
}): readonly RequirementAggregateStateProjection[] {
  const graph = projectRequirementGraph({
    ledger: input.ledger,
    environment: input.environment
  });
  const childrenByParent = new Map<string, string[]>();
  const relationRefsByParent = new Map<string, string[]>();
  for (const pair of graph.parentChildPairs) {
    childrenByParent.set(pair.parentRequirementId, [
      ...(childrenByParent.get(pair.parentRequirementId) ?? []),
      pair.childRequirementId
    ]);
    relationRefsByParent.set(pair.parentRequirementId, [
      ...(relationRefsByParent.get(pair.parentRequirementId) ?? []),
      pair.relationRef
    ]);
  }

  return freezeArray(
    [...childrenByParent.entries()].map(([parentRequirementId, childRequirementIds]) => {
      const childIdSet = new Set(childRequirementIds);
      const childFolds = input.folds.filter((fold) =>
        childIdSet.has(fold.requirementId)
      );
      const residuals = input.residuals.filter((residual) =>
        childIdSet.has(residual.requirementId)
      );
      const state = aggregateFoldState(childFolds);
      const childFoldRefs = childFolds.map((fold) => fold.foldRef);
      const residualRefs = residuals.map((residual) => residual.residualRef);
      const sourceRelationRefs = relationRefsByParent.get(parentRequirementId) ?? [];
      return Object.freeze({
        kind: "requirement_aggregate_state_projection" as const,
        aggregateRef: `requirement-aggregate:${stableSha256Digest({
          parentRequirementId,
          childRequirementIds,
          childFoldRefs,
          residualRefs,
          state
        })}`,
        requirementId: parentRequirementId,
        childRequirementIds: freezeStringArray(childRequirementIds, "RequirementAggregateStateProjection.childRequirementIds"),
        state,
        childFoldRefs: freezeStringArray(childFoldRefs, "RequirementAggregateStateProjection.childFoldRefs"),
        residualRefs: freezeStringArray(residualRefs, "RequirementAggregateStateProjection.residualRefs"),
        sourceRelationRefs: freezeStringArray(sourceRelationRefs, "RequirementAggregateStateProjection.sourceRelationRefs"),
        sourceRequirementRefs: freezeStringArray(
          [parentRequirementId, ...childRequirementIds],
          "RequirementAggregateStateProjection.sourceRequirementRefs"
        ),
        reason: state === "no_evidence"
          ? "aggregate parent has no admitted child fold truth"
          : `aggregate parent projected from ${childFolds.length} child fold(s) and ${residuals.length} child residual(s)`
      });
    })
  );
}

export function evaluateRequirementCompleteness(input: {
  readonly environment: EdgeRequirementEnvironment;
  readonly projections: readonly RequirementProjection[];
  readonly folds: readonly RequirementFoldProjection[];
  readonly residuals: readonly RequirementResidualProjection[];
}): RequirementCompletenessReport {
  const rows: RequirementCompletenessGateRow[] = [];
  const activeRequirementIds = input.environment.activeTerms.map((term) => term.requirementId);
  const currentProjectionRefs = new Set(
    input.projections
      .filter((projection) => projection.current)
      .map((projection) => projection.projectionRef)
  );
  const projectionRequirementIds = new Set(
    input.projections
      .filter((projection) => projection.current)
      .map((projection) => projection.requirementId)
  );
  const foldRequirementIds = new Set(
    input.folds
      .filter((fold) =>
        fold.projectionRefs.some((projectionRef) =>
          currentProjectionRefs.has(projectionRef)
        )
      )
      .map((fold) => fold.requirementId)
  );

  const refsForTerm = (term: RequirementTerm): ReadonlySet<string> =>
    new Set([term.requirementId, ...term.spanRefs, ...term.contextRefs]);
  const missingTermRefs = (
    predicate: (term: RequirementTerm, refs: ReadonlySet<string>) => boolean
  ): readonly string[] =>
    input.environment.activeTerms
      .filter((term) => !predicate(term, refsForTerm(term)))
      .map((term) => term.requirementId);
  const missingSpanCoverage =
    input.environment.activeSpans.length === 0 ? activeRequirementIds : [];
  const missingEvidencePolicy = missingTermRefs((candidate) =>
    candidate.evidencePolicyRefs.length > 0
  );
  const missingContextRouting = missingTermRefs((term, refs) =>
    term.contextRefs.length === 0 ||
    input.environment.activeContextFragments.some((fragment) =>
      appliesToAny(fragment.appliesToRefs, refs)
    )
  );
  const missingDestinationTopology = missingTermRefs((term) =>
    input.environment.activeDestinationTopologies.some((topology) =>
      topology.appliesToRefs.includes(term.requirementId) ||
      term.spanRefs.some((spanRef) => topology.appliesToRefs.includes(spanRef))
    )
  );
  const missingTestRelation = missingTermRefs((term) =>
    input.environment.activeTestRelations.some((relation) =>
      relation.requirementId === term.requirementId
    )
  );
  const missingFoldAttenuation = activeRequirementIds.filter(
    (id) => !projectionRequirementIds.has(id) || !foldRequirementIds.has(id)
  );

  rows.push(gateRow("span_coverage", missingSpanCoverage.length === 0, missingSpanCoverage));
  rows.push(gateRow("evidence_policy_coverage", missingEvidencePolicy.length === 0, missingEvidencePolicy));
  rows.push(gateRow("context_routing_coverage", missingContextRouting.length === 0, missingContextRouting));
  rows.push(gateRow("destination_topology_coverage", missingDestinationTopology.length === 0, missingDestinationTopology));
  rows.push(gateRow("test_relation_coverage", missingTestRelation.length === 0, missingTestRelation));
  rows.push(gateRow("fold_attenuation_coverage", missingFoldAttenuation.length === 0, missingFoldAttenuation));

  return Object.freeze({
    kind: "requirement_completeness_report",
    status: rows.every((row) => row.status === "passed") ? "passed" : "failed",
    rows: freezeArray(rows)
  });
}

function gateRow(
  gate: RequirementCompletenessGateRow["gate"],
  passed: boolean,
  missingRefs: readonly string[]
): RequirementCompletenessGateRow {
  return Object.freeze({
    gate,
    status: passed ? "passed" : "failed",
    missingRefs: passed ? freezeArray([]) : freezeStringArray(missingRefs, `RequirementCompletenessGateRow.${gate}.missingRefs`)
  });
}

const REQUIREMENT_CONFLICT_CONTRADICTORY_RELATION_KINDS: ReadonlySet<RequirementRelationKind> =
  new Set([
    "refinement",
    "dependency",
    "mitigation",
    "assignment",
    "operationalization",
    "test",
    "assurance",
    "evidence",
    "contribution",
    "restoration",
    "supersession"
  ]);

function requirementRelationPairKey(relation: RequirementRelation): string {
  return [relation.fromRequirementId, relation.toRequirementId].sort().join("||");
}

function contradictoryRequirementRelationRefs(ledger: RequirementLedger): readonly string[] {
  const relationsByPair = new Map<string, RequirementRelation[]>();
  for (const relation of ledger.relations) {
    const pairKey = requirementRelationPairKey(relation);
    relationsByPair.set(pairKey, [
      ...(relationsByPair.get(pairKey) ?? []),
      relation
    ]);
  }

  const contradictoryRefs = new Set<string>();
  for (const relations of relationsByPair.values()) {
    if (!relations.some((relation) => relation.relationKind === "conflict")) {
      continue;
    }
    if (
      !relations.some((relation) =>
        REQUIREMENT_CONFLICT_CONTRADICTORY_RELATION_KINDS.has(
          relation.relationKind
        )
      )
    ) {
      continue;
    }
    for (const relation of relations) {
      contradictoryRefs.add(relation.relationId);
    }
  }
  return freezeArray([...contradictoryRefs].sort());
}

function staleOrSupersededProjectionRefs(ledger: RequirementLedger): readonly string[] {
  const projectionsByRef = new Map(
    ledger.projections.map((projection) => [projection.projectionRef, projection])
  );
  const staleRefs = new Set<string>();
  for (const term of ledger.terms) {
    if (term.projectionRefs.length === 0) {
      continue;
    }
    const projections = term.projectionRefs
      .map((projectionRef) => projectionsByRef.get(projectionRef))
      .filter((projection): projection is RequirementProjection => projection !== undefined);
    if (
      projections.length === term.projectionRefs.length &&
      projections.every((projection) => !projection.current)
    ) {
      for (const projection of projections) {
        staleRefs.add(projection.projectionRef);
      }
    }
  }
  return freezeArray([...staleRefs].sort());
}

export function evaluateRequirementStructuralState(input: {
  readonly ledger: RequirementLedger | null;
}): RequirementStructuralEvaluation {
  if (input.ledger === null) {
    return structuralEvaluation("unknown_state_rejected", "unknown or unclassified state is not F_D input", []);
  }
  const diagnostics = diagnoseRequirementLedgerIntegrity(input.ledger);
  if (diagnostics.length > 0) {
    return structuralEvaluation("rejected_malformed", "malformed requirement-algebra state", diagnostics);
  }
  if (input.ledger.terms.length === 0 || input.ledger.spans.length === 0) {
    return structuralEvaluation("incomplete_structural_pressure", "ledger lacks required terms or spans", input.ledger.eventRefs);
  }
  const staleRefs = staleOrSupersededProjectionRefs(input.ledger);
  if (staleRefs.length > 0) {
    return structuralEvaluation("stale_or_superseded", "stale or superseded replay evidence", staleRefs);
  }
  const contradictoryRefs = contradictoryRequirementRelationRefs(input.ledger);
  if (contradictoryRefs.length > 0) {
    return structuralEvaluation("contradictory_authority", "contradictory admitted authority", contradictoryRefs);
  }
  const fpRequiredRefs = input.ledger.contextFragments
    .filter((fragment) => fragment.routingOutcome === "fp_required")
    .map((fragment) => fragment.fragmentRef);
  if (fpRequiredRefs.length > 0) {
    return structuralEvaluation("semantic_assessment_required", "semantic judgment belongs to F_P", fpRequiredRefs);
  }
  const semanticResidualRefs = input.ledger.residuals
    .filter((residual) => residual.pressureClass === "semantic_assessment_required")
    .map((residual) => residual.residualRef);
  if (semanticResidualRefs.length > 0) {
    return structuralEvaluation("semantic_residual_preserved", "F_P rejection preserves residual pressure", semanticResidualRefs);
  }
  const humanDecisionRefs = [
    ...input.ledger.folds
      .filter((fold) => fold.state === "repriced")
      .map((fold) => fold.foldRef),
    ...input.ledger.residuals
      .filter((residual) => residual.pressureClass === "human_decision_required")
      .map((residual) => residual.residualRef)
  ];
  if (humanDecisionRefs.length > 0) {
    return structuralEvaluation("human_decision_required", "owner decision or reprice required", humanDecisionRefs);
  }
  const nonClosingRefs = [
    ...input.ledger.folds
      .filter((fold) => fold.state === "no_close_preserved")
      .map((fold) => fold.foldRef),
    ...input.ledger.residuals
      .filter((residual) => residual.pressureClass === "non_closing_evidence")
      .map((residual) => residual.residualRef)
  ];
  if (nonClosingRefs.length > 0) {
    return structuralEvaluation("non_closing_preserved", "non-closing evidence remains queryable", nonClosingRefs);
  }
  return structuralEvaluation("admitted_valid", "admitted requirement-algebra state is structurally valid", input.ledger.eventRefs);
}

function structuralEvaluation(
  outcome: RequirementFdOutcome,
  reason: string,
  diagnosticRefs: readonly string[]
): RequirementStructuralEvaluation {
  return Object.freeze({
    kind: "requirement_structural_evaluation",
    outcome,
    reason,
    diagnosticRefs: freezeStringArray(diagnosticRefs, "RequirementStructuralEvaluation.diagnosticRefs")
  });
}

export function wrapCompatibilityObligationRef(input: {
  readonly obligationRef: string;
  readonly requirementId: string;
  readonly spanId: string;
}): RequirementProjection {
  return constructRequirementProjection({
    projectionRef: `compat-obligation:${input.obligationRef}`,
    requirementId: input.requirementId,
    spanId: input.spanId,
    projectionRole: "obligation",
    authorityRole: "fallback",
    targetPath: null,
    command: null,
    fallbackCommand: null,
    evidenceRole: null,
    current: true,
    sourceRefs: [input.obligationRef],
    supersedesProjectionRefs: []
  });
}

export function queryRequirements(input: {
  readonly environment: EdgeRequirementEnvironment;
  readonly projections: readonly RequirementProjection[];
  readonly evidenceBindings: readonly RequirementEvidenceBinding[];
  readonly folds: readonly RequirementFoldProjection[];
  readonly residuals: readonly RequirementResidualProjection[];
  readonly attenuation: RequirementAttenuationProjection;
  readonly assuranceClaims: readonly RequirementAssuranceClaim[];
}): RequirementQueryReadModel {
  return Object.freeze({
    kind: "requirement_query_read_model",
    edge: input.environment.edge,
    contextFragmentRefs: freezeStringArray(
      input.environment.activeContextFragments.map((fragment) => fragment.fragmentRef),
      "RequirementQueryReadModel.contextFragmentRefs"
    ),
    requirementIds: freezeStringArray(
      input.environment.activeTerms.map((term) => term.requirementId),
      "RequirementQueryReadModel.requirementIds"
    ),
    obligationProjectionRefs: freezeStringArray(
      input.projections
        .filter((projection) => projection.projectionRole === "obligation")
        .map((projection) => projection.projectionRef),
      "RequirementQueryReadModel.obligationProjectionRefs"
    ),
    materializationTargetRefs: freezeStringArray(
      input.projections
        .filter((projection) => projection.projectionRole === "materialization_target")
        .map((projection) => projection.projectionRef),
      "RequirementQueryReadModel.materializationTargetRefs"
    ),
    executionScheduleRefs: freezeStringArray(
      input.projections
        .filter((projection) => projection.projectionRole === "execution_schedule")
        .map((projection) => projection.projectionRef),
      "RequirementQueryReadModel.executionScheduleRefs"
    ),
    evidenceRefs: freezeStringArray(
      currentEvidenceBindings(input.evidenceBindings)
        .filter((binding) => binding.bindingStatus !== "rejected")
        .map((binding) => binding.evidenceRef),
      "RequirementQueryReadModel.evidenceRefs"
    ),
    foldRefs: freezeStringArray(
      input.folds.map((fold) => fold.foldRef),
      "RequirementQueryReadModel.foldRefs"
    ),
    residualRefs: freezeStringArray(
      input.residuals.map((residual) => residual.residualRef),
      "RequirementQueryReadModel.residualRefs"
    ),
    attenuation: input.attenuation.attenuation,
    assuranceClaimRefs: freezeStringArray(
      input.assuranceClaims.map((claim) => claim.claimRef),
      "RequirementQueryReadModel.assuranceClaimRefs"
    )
  });
}

export const REQUIREMENT_FOLD_STATE_MAPPING = Object.freeze({
  satisfied: Object.freeze({
    sourceAbgTruth: "AssuranceClosureDecision.decision=close",
    closureAuthority: "existing_abg_assurance_fold"
  }),
  partial: Object.freeze({
    sourceAbgTruth: "AssuranceClosureDecision.decision=retry",
    closureAuthority: "non_closing_residual_required"
  }),
  blocked: Object.freeze({
    sourceAbgTruth: "AssuranceClosureDecision.decision=block",
    closureAuthority: "existing_abg_block_or_evaluate_next"
  }),
  deferred: Object.freeze({
    sourceAbgTruth: "AssuranceClosureDecision.decision=qualified_defer",
    closureAuthority: "existing_abg_continuation"
  }),
  repriced: Object.freeze({
    sourceAbgTruth: "AssuranceClosureDecision.decision=reprice",
    closureAuthority: "existing_reprice_surface"
  }),
  no_close_preserved: Object.freeze({
    sourceAbgTruth: "no admitted AssuranceClosureDecision",
    closureAuthority: "non_closing_residual_query"
  })
} satisfies Record<RequirementFoldState, {
  readonly sourceAbgTruth: string;
  readonly closureAuthority: string;
}>);
