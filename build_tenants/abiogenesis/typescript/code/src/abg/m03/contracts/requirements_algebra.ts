// Implements: REQ-R-ABG3-REQUIREMENTS-ALGEBRA
// Implements: REQ-R-ABG3-PROJECTION
// Implements: REQ-R-ABG3-ASSURANCE
// Supports: REQ-L-GTL3-REQUIREMENTS-ALGEBRA

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
  readonly status: "supported" | "partial" | "blocked";
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
}

export interface EdgeRequirementEnvironment {
  readonly kind: "edge_requirement_environment";
  readonly environmentRef: string;
  readonly edge: RequirementEdgeRef;
  readonly activeTerms: readonly RequirementTerm[];
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

const REQUIREMENT_EVENT_FORBIDDEN_RUNTIME_FIELDS = Object.freeze([
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
    status: enumValue(["supported", "partial", "blocked"] as const, input.status, "RequirementAssuranceClaim.status")
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
  if (kind === "requirement_projection_admitted") {
    assertAllowedFields(record, "RequirementEventPayload", ["kind", "eventRef", "projection"]);
    return Object.freeze({ kind, eventRef, projection: parseRequirementProjection(record["projection"]) });
  }
  if (kind === "requirement_evidence_bound") {
    assertAllowedFields(record, "RequirementEventPayload", ["kind", "eventRef", "binding"]);
    return Object.freeze({ kind, eventRef, binding: parseRequirementEvidenceBinding(record["binding"]) });
  }
  throw new TypeError(
    `RequirementEventPayload.kind ${kind} requires constructor admission in this first-slice API`
  );
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

  return Object.freeze({
    kind: "requirement_ledger_projection",
    ledgerRef: `requirement-ledger:${eventRefs.join(",")}`,
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
}

function spanCoversEdge(span: TraversalSpan, edge: RequirementEdgeRef): boolean {
  return (
    span.graphFunctionRef === edge.graphFunctionRef &&
    (span.graphVectorRefs.includes(edge.graphVectorRef) ||
      span.vectorIndexes.includes(edge.vectorIndex))
  );
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
  const activeTerms = input.ledger.terms.filter((term) => termHasActiveSpan(term, activeSpanIds));
  const activeRequirementIds = new Set(activeTerms.map((term) => term.requirementId));
  const activeRefs = new Set<string>([
    ...activeSpanIds,
    ...activeRequirementIds,
    input.edge.graphFunctionRef,
    input.edge.graphVectorRef,
    input.edge.edge
  ]);
  const priorFolds = input.ledger.folds.filter((fold) => activeRequirementIds.has(fold.requirementId));
  const carriedResiduals = input.ledger.residuals.filter((residual) =>
    activeRequirementIds.has(residual.requirementId)
  );

  return Object.freeze({
    kind: "edge_requirement_environment",
    environmentRef: [
      "edge-requirement-environment",
      input.edge.graphFunctionRef,
      input.edge.graphVectorRef,
      String(input.edge.vectorIndex),
      activeTerms.map((term) => term.requirementId).join(",")
    ].join(":"),
    edge: Object.freeze({ ...input.edge }),
    activeTerms: freezeArray(activeTerms),
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
  const activeSpans = input.ledger.spans.filter((span) => spanCoversEdge(span, input.edge));
  const activeSpanIds = new Set(activeSpans.map((span) => span.spanId));
  return freezeArray(
    input.ledger.terms.filter((term) => termHasActiveSpan(term, activeSpanIds))
  );
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
    .filter((term) => !explicitObligationIds.has(term.requirementId))
    .map((term) =>
      constructRequirementProjection({
        projectionRef: `projection:${term.requirementId}:obligation`,
        requirementId: term.requirementId,
        spanId: term.spanRefs[0] ?? "span:unknown",
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
  const evidenceRole = input.byproduct
    ? "byproduct"
    : input.path === null
      ? input.projection.evidenceRole ?? "asset"
      : classifyRequirementEvidenceRole({
        path: input.path,
        environment: input.environment
      });
  const bindingStatus: RequirementEvidenceBindingStatus =
    input.admitted && !input.byproduct ? "admitted" : "non_closing";
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

function foldStateFromEvidence(
  bindings: readonly RequirementEvidenceBinding[]
): RequirementFoldState {
  const current = currentEvidenceBindings(bindings);
  const admitted = current.filter((binding) => binding.bindingStatus === "admitted");
  const nonClosing = current.filter((binding) => binding.bindingStatus === "non_closing");
  const hasSemantic = admitted.some((binding) => binding.evidenceRole === "semantic_interpretation");
  const hasExecution = admitted.some((binding) => binding.evidenceRole === "test_execution");
  if (hasSemantic && hasExecution) {
    return "satisfied";
  }
  if (admitted.length > 0) {
    return "partial";
  }
  if (nonClosing.length > 0) {
    return "no_close_preserved";
  }
  return "partial";
}

export function foldRequirementEvidence(input: {
  readonly environment: EdgeRequirementEnvironment;
  readonly projections: readonly RequirementProjection[];
  readonly evidenceBindings: readonly RequirementEvidenceBinding[];
  readonly sourceAbgTruthRefs: readonly string[];
}): readonly RequirementFoldProjection[] {
  return freezeArray(
    input.environment.activeTerms.map((term) => {
      const projectionRefs = input.projections
        .filter((projection) => projection.requirementId === term.requirementId)
        .map((projection) => projection.projectionRef);
      const bindings = input.evidenceBindings.filter(
        (binding) => binding.requirementId === term.requirementId
      );
      const evidenceRefs = currentEvidenceBindings(bindings).map((binding) => binding.evidenceRef);
      const state = foldStateFromEvidence(bindings);
      return constructRequirementFoldProjection({
        foldRef: `requirement-fold:${term.requirementId}:${state}:${evidenceRefs.join(",")}`,
        requirementId: term.requirementId,
        projectionRefs,
        state,
        sourceAbgTruthRefs: input.sourceAbgTruthRefs,
        evidenceRefs,
        residualPressureRefs: state === "satisfied" ? [] : [`residual-pressure:${term.requirementId}:${state}`],
        reason: `requirement fold projected from ${evidenceRefs.length} current evidence binding(s)`
      });
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
        const spanId = term?.spanRefs[0] ?? input.environment.activeSpans[0]?.spanId ?? "span:unknown";
        return constructRequirementResidualProjection({
          residualRef: `requirement-residual:${fold.requirementId}:${fold.state}`,
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
  let attenuation: RequirementAttenuationKind = "unchanged";
  if (input.priorResiduals.length > 0 && input.residuals.length === 0) {
    attenuation = "cleared";
  } else if (input.residuals.length < input.priorResiduals.length) {
    attenuation = "narrowed";
  } else if (
    input.priorResiduals.some((prior, index) =>
      input.residuals[index] !== undefined &&
      input.residuals[index]?.pressureClass !== prior.pressureClass
    )
  ) {
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
      const status = residuals.length > 0
        ? "partial"
        : folds.every((fold) => fold.state === "satisfied")
          ? "supported"
          : "blocked";
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

export function evaluateRequirementCompleteness(input: {
  readonly environment: EdgeRequirementEnvironment;
  readonly projections: readonly RequirementProjection[];
  readonly folds: readonly RequirementFoldProjection[];
  readonly residuals: readonly RequirementResidualProjection[];
}): RequirementCompletenessReport {
  const rows: RequirementCompletenessGateRow[] = [];
  const activeRequirementIds = input.environment.activeTerms.map((term) => term.requirementId);
  const projectionRequirementIds = new Set(input.projections.map((projection) => projection.requirementId));
  const foldRequirementIds = new Set(input.folds.map((fold) => fold.requirementId));
  const residualRefs = input.residuals.map((residual) => residual.residualRef);

  rows.push(gateRow("span_coverage", input.environment.activeSpans.length > 0, activeRequirementIds));
  rows.push(gateRow("evidence_policy_coverage", input.environment.activeTerms.every((term) => term.evidencePolicyRefs.length > 0), activeRequirementIds));
  rows.push(gateRow("context_routing_coverage", input.environment.activeContextFragments.length > 0, activeRequirementIds));
  rows.push(gateRow("destination_topology_coverage", input.environment.activeDestinationTopologies.length > 0, activeRequirementIds));
  rows.push(gateRow("test_relation_coverage", input.environment.activeTestRelations.length > 0, activeRequirementIds));
  rows.push(gateRow("fold_attenuation_coverage", activeRequirementIds.every((id) => projectionRequirementIds.has(id) && foldRequirementIds.has(id)), residualRefs));

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

export function evaluateRequirementStructuralState(input: {
  readonly ledger: RequirementLedger | null;
  readonly unknownState?: boolean;
  readonly malformed?: boolean;
  readonly staleOrSuperseded?: boolean;
  readonly contradictoryAuthority?: boolean;
  readonly semanticAssessmentRequired?: boolean;
  readonly semanticResidualPreserved?: boolean;
  readonly humanDecisionRequired?: boolean;
  readonly nonClosingPreserved?: boolean;
}): RequirementStructuralEvaluation {
  if (input.unknownState === true || input.ledger === null) {
    return structuralEvaluation("unknown_state_rejected", "unknown or unclassified state is not F_D input", []);
  }
  if (input.malformed === true) {
    return structuralEvaluation("rejected_malformed", "malformed requirement-algebra state", []);
  }
  if (input.staleOrSuperseded === true) {
    return structuralEvaluation("stale_or_superseded", "stale or superseded replay evidence", []);
  }
  if (input.contradictoryAuthority === true) {
    return structuralEvaluation("contradictory_authority", "contradictory admitted authority", []);
  }
  if (input.semanticAssessmentRequired === true) {
    return structuralEvaluation("semantic_assessment_required", "semantic judgment belongs to F_P", []);
  }
  if (input.semanticResidualPreserved === true) {
    return structuralEvaluation("semantic_residual_preserved", "F_P rejection preserves residual pressure", []);
  }
  if (input.humanDecisionRequired === true) {
    return structuralEvaluation("human_decision_required", "owner decision or reprice required", []);
  }
  if (input.nonClosingPreserved === true) {
    return structuralEvaluation("non_closing_preserved", "non-closing evidence remains queryable", []);
  }
  if (input.ledger.terms.length === 0 || input.ledger.spans.length === 0) {
    return structuralEvaluation("incomplete_structural_pressure", "ledger lacks required terms or spans", input.ledger.eventRefs);
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
      input.evidenceBindings.map((binding) => binding.evidenceRef),
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
    sourceAbgTruth: "assurance_fold_fulfilled",
    closureAuthority: "existing_abg_assurance_fold"
  }),
  partial: Object.freeze({
    sourceAbgTruth: "assurance_or_continuation_partial",
    closureAuthority: "non_closing_residual_required"
  }),
  blocked: Object.freeze({
    sourceAbgTruth: "abg_block_or_blocked_prerequisite",
    closureAuthority: "existing_abg_block_or_evaluate_next"
  }),
  deferred: Object.freeze({
    sourceAbgTruth: "qualified_defer_or_continuation",
    closureAuthority: "existing_abg_continuation"
  }),
  repriced: Object.freeze({
    sourceAbgTruth: "abg_or_fh_reprice_truth",
    closureAuthority: "existing_reprice_surface"
  }),
  no_close_preserved: Object.freeze({
    sourceAbgTruth: "assurance_fold_no_close",
    closureAuthority: "non_closing_residual_query"
  })
} satisfies Record<RequirementFoldState, {
  readonly sourceAbgTruth: string;
  readonly closureAuthority: string;
}>);
