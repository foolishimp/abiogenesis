// Implements: T-107
// Implements: T-112
// Implements: REQ-L-GTL3-GRAPHVECTOR-010
// Implements: REQ-R-ABG3-EVENTS-020
// Implements: REQ-R-ABG3-PROJECTION-012
// Implements: REQ-R-ABG3-ASSURANCE

import type {
  ExecutionBasis,
  TraversalAttemptDispatchedEvent,
  TraversalAttemptEnvelopeDerivedEvent,
  TraversalAttemptNonProgressClassifiedEvent,
  TraversalAttemptProgressObservedEvent,
  TraversalForcedReviewProjectedEvent,
  TraversalModulationExhaustedEvent,
  TraversalModulationResolvedEvent,
  TraversalSameEdgeContinuationPlannedEvent
} from "./carriers.js";
import type {
  GraphFunction,
  GraphVector,
  HookRef,
  SerializedAttrs,
  SerializedAttrValue
} from "../../../gtl/m01/contracts/carriers.js";
import type { Role } from "../../../gtl/m02/contracts/carriers.js";
import {
  assertNonEmptyString,
  assertNonNegativeInteger,
  assertVectorIndexInRange,
  frameIdForBasis,
  freezeStringArray,
  graphCallIdForBasis,
  vectorEdge
} from "./runtime_support.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";

export const TRAVERSAL_SCHEDULING_PRIMITIVE_VALUES = Object.freeze([
  "atomic_attempt",
  "bounded_batch",
  "ordered_schedule_prefix",
  "single_vertical_slice",
  "phase_gate",
  "gap_repair_slice",
  "agent_proposed_slice_requires_admission"
] as const);

export type TraversalSchedulingPrimitive =
  (typeof TRAVERSAL_SCHEDULING_PRIMITIVE_VALUES)[number];

export const TRAVERSAL_STRATEGY_VECTOR_ATTR_KEYS = Object.freeze([
  "abg.traversal_strategy"
] as const);

export const TRAVERSAL_STRATEGY_GRAPH_FUNCTION_DEFAULT_ATTR_KEYS =
  Object.freeze([
    "abg.default_traversal_strategy"
  ] as const);

export const TRAVERSAL_STRATEGY_ROLE_ATTR_KEYS = Object.freeze([
  "abg.traversal_strategy"
] as const);

export const AGENTIC_BACKEND_KIND_VALUES = Object.freeze([
  "claude",
  "codex",
  "generic_process"
] as const);

export type AgenticBackendKind = (typeof AGENTIC_BACKEND_KIND_VALUES)[number];

export const TRAVERSAL_MODULATION_CONFIG_KEY_VALUES = Object.freeze([
  "directive_ref",
  "strategy_owner_ref",
  "strategy_label",
  "enforcement_primitives",
  "obligation_schedule_refs",
  "ordering_constraint_refs",
  "phase_gate_refs",
  "target_item_count",
  "max_item_count",
  "max_token_pressure"
] as const);

export const TRAVERSAL_ATTEMPT_PROGRESS_OUTCOME_VALUES = Object.freeze([
  "fulfilled",
  "partial",
  "blocked",
  "not_attempted"
] as const);

export type TraversalAttemptProgressOutcome =
  (typeof TRAVERSAL_ATTEMPT_PROGRESS_OUTCOME_VALUES)[number];

export const TRAVERSAL_FORCED_REVIEW_TRIGGER_VALUES = Object.freeze([
  "missing_progress_row",
  "duplicate_progress_row",
  "partial_without_remaining_work",
  "evidence_missing",
  "summary_projection_disagreement",
  "backend_progress_ambiguous",
  "retry_budget_exhausted",
  "semantic_gap_requires_review"
] as const);

export type TraversalForcedReviewTrigger =
  (typeof TRAVERSAL_FORCED_REVIEW_TRIGGER_VALUES)[number];

export const TRAVERSAL_MODULATION_ACTION_VALUES = Object.freeze([
  "continue_same_edge",
  "forced_review",
  "foldback_ready"
] as const);

export type TraversalModulationAction =
  (typeof TRAVERSAL_MODULATION_ACTION_VALUES)[number];

export const AGENTIC_BACKEND_PROGRESS_CLASSIFICATION_VALUES = Object.freeze([
  "progress_observed",
  "no_progress_observed",
  "progress_required_missed",
  "buffered_final_output_possible"
] as const);

export type AgenticBackendProgressClassification =
  (typeof AGENTIC_BACKEND_PROGRESS_CLASSIFICATION_VALUES)[number];

export type TraversalAffect =
  | { readonly kind: "urgency"; readonly level: "low" | "normal" | "high" }
  | { readonly kind: "risk"; readonly level: "low" | "medium" | "high" }
  | { readonly kind: "confidence"; readonly level: "low" | "medium" | "high" }
  | { readonly kind: "precision"; readonly level: "low" | "medium" | "high" }
  | { readonly kind: "exploration"; readonly level: "low" | "medium" | "high" };

export type TraversalModulationGtlQualifierSource =
  | "graph_vector_declarations"
  | "graph_function_declarations"
  | "role_policy_hooks";

export type TraversalStrategySelectionSource =
  | "graph_vector"
  | "graph_function"
  | "role_policy"
  | "runtime_default";

export interface TraversalStrategyDirective {
  readonly kind: "traversal_strategy_directive";
  readonly directiveRef: string;
  readonly strategyOwnerRef: string;
  readonly strategyLabel: string;
  readonly enforcementPrimitives: readonly TraversalSchedulingPrimitive[];
  readonly obligationScheduleRefs: readonly string[];
  readonly orderingConstraintRefs: readonly string[];
  readonly phaseGateRefs: readonly string[];
  readonly batch: TraversalModulationBatch;
}

export interface TraversalModulationGtlQualifierResolution {
  readonly kind: "traversal_modulation_gtl_qualifier_resolution";
  readonly source: TraversalModulationGtlQualifierSource;
  readonly sourceRef: string;
  readonly attrKey: string;
  readonly hookRef: string;
  readonly directive: TraversalStrategyDirective;
}

export interface TraversalStrategySelection {
  readonly kind: "traversal_strategy_selection";
  readonly selectionRef: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly source: TraversalStrategySelectionSource;
  readonly sourceRef: string;
  readonly attrKey: string | null;
  readonly hookRef: string | null;
  readonly directiveRef: string;
  readonly strategyOwnerRef: string;
  readonly strategyLabel: string;
  readonly enforcementPrimitives: readonly TraversalSchedulingPrimitive[];
  readonly obligationScheduleRefs: readonly string[];
  readonly orderingConstraintRefs: readonly string[];
  readonly phaseGateRefs: readonly string[];
  readonly batch: TraversalModulationBatch;
  readonly configDigest: string;
}

export interface AgenticBackendProgressProfile {
  readonly kind: "agentic_backend_progress_profile";
  readonly backendKind: AgenticBackendKind;
  readonly profileRef: string;
  readonly processProtocolSignals: readonly string[];
  readonly streamProgressSignals: readonly string[];
  readonly declaredArtifactProgressSignals: readonly string[];
  readonly finalOutputMayBeBuffered: boolean;
  readonly progressSignalRequiredBeforeInactivityMs: number;
}

export interface AgenticBackendProgressObservation {
  readonly elapsedSinceProgressMs: number;
  readonly processProtocolSignals: readonly string[];
  readonly streamProgressSignals: readonly string[];
  readonly declaredArtifactProgressSignals: readonly string[];
}

export interface AgenticBackendProgressProjection {
  readonly kind: "agentic_backend_progress_projection";
  readonly profileRef: string;
  readonly backendKind: AgenticBackendKind;
  readonly classification: AgenticBackendProgressClassification;
  readonly observedSignalRefs: readonly string[];
  readonly progressObserved: boolean;
  readonly reviewRequired: boolean;
}

export interface TraversalModulationBatch {
  readonly targetItemCount?: number;
  readonly maxItemCount?: number;
  readonly maxTokenPressure?: number;
}

export interface TraversalProgressContract {
  readonly progressArtifactRequired: boolean;
  readonly allowedProgressArtifactKinds: readonly string[];
  readonly noProgressClass: "runtime_non_progress";
}

export interface TraversalContinuationContract {
  readonly sameEdgeUntil: "foldback_closed" | "retry_budget_exhausted";
  readonly maxAttemptsWithoutNewSignal: number;
  readonly maxTotalAttempts: number;
}

export interface TraversalModulationProfile {
  readonly kind: "traversal_modulation_profile";
  readonly profileRef: string;
  readonly strategySelectionRef: string;
  readonly strategySelectionSource: TraversalStrategySelectionSource;
  readonly strategySelectionSourceRef: string;
  readonly strategySelectionAttrKey: string | null;
  readonly strategySelectionHookRef: string | null;
  readonly strategyConfigDigest: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly strategyDirectiveRef: string;
  readonly strategyOwnerRef: string;
  readonly strategyLabel: string;
  readonly enforcementPrimitives: readonly TraversalSchedulingPrimitive[];
  readonly orderingConstraintRefs: readonly string[];
  readonly phaseGateRefs: readonly string[];
  readonly backendProfileRef: string;
  readonly policyRefs: readonly string[];
  readonly obligationScheduleRefs: readonly string[];
  readonly gapPressureRefs: readonly string[];
  readonly affectRefs: readonly string[];
  readonly affects: readonly TraversalAffect[];
  readonly batch: TraversalModulationBatch;
  readonly progressContract: TraversalProgressContract;
  readonly continuation: TraversalContinuationContract;
}

export interface TraversalAttemptEnvelope {
  readonly kind: "traversal_attempt_envelope";
  readonly envelopeRef: string;
  readonly profileRef: string;
  readonly strategySelectionRef: string;
  readonly strategySelectionSource: TraversalStrategySelectionSource;
  readonly strategyConfigDigest: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly strategyDirectiveRef: string;
  readonly backendProfileRef: string;
  readonly actorInvocationId: string;
  readonly selectedScheduleItemRefs: readonly string[];
  readonly orderingConstraintRefs: readonly string[];
  readonly phaseGateRefs: readonly string[];
  readonly requiredProgressArtifactRefs: readonly string[];
  readonly gapPressureRefs: readonly string[];
  readonly affectRefs: readonly string[];
  readonly retryBudgetRemaining: number;
  readonly mustExitAfterBoundedAttempt: boolean;
}

export interface TraversalAttemptProgressRow {
  readonly kind: "traversal_attempt_progress_row";
  readonly rowRef: string;
  readonly envelopeRef: string;
  readonly scheduleItemRef: string;
  readonly declaredOutcome: TraversalAttemptProgressOutcome;
  readonly artifactRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly remainingWorkRefs: readonly string[];
  readonly reviewRequired: boolean;
}

export interface TraversalForcedReviewGate {
  readonly kind: "traversal_forced_review_gate";
  readonly gateRef: string;
  readonly envelopeRef: string;
  readonly trigger: TraversalForcedReviewTrigger;
  readonly triggeredScheduleItemRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly requiredRegime: "F_P" | "F_H";
  readonly publicAction: "forced_review";
  readonly blocksPrivateContinuation: true;
}

export interface TraversalModulationAssuranceProjection {
  readonly kind: "traversal_modulation_assurance_projection";
  readonly projectionRef: string;
  readonly envelopeRef: string;
  readonly action: TraversalModulationAction;
  readonly publicSummaryAction: TraversalModulationAction;
  readonly selectedScheduleItemRefs: readonly string[];
  readonly fulfilledScheduleItemRefs: readonly string[];
  readonly remainingScheduleItemRefs: readonly string[];
  readonly missingProgressRowRefs: readonly string[];
  readonly duplicateProgressRowRefs: readonly string[];
  readonly evidenceMissingScheduleItemRefs: readonly string[];
  readonly remainingWorkMissingScheduleItemRefs: readonly string[];
  readonly forcedReviewGates: readonly TraversalForcedReviewGate[];
  readonly ignoredInferenceRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface TraversalModulationSummary {
  readonly kind: "traversal_modulation_summary";
  readonly action: TraversalModulationAction;
  readonly envelopeRef: string;
  readonly selectedScheduleItemRefs: readonly string[];
  readonly remainingScheduleItemRefs: readonly string[];
  readonly forcedReviewGateRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface TraversalModulationProfileInput {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly directive: TraversalStrategyDirective;
  readonly strategySelection?: TraversalStrategySelection | undefined;
  readonly backendProfile: AgenticBackendProgressProfile;
  readonly policyRefs?: readonly string[];
  readonly obligationScheduleRefs?: readonly string[];
  readonly gapPressureRefs?: readonly string[];
  readonly affectRefs?: readonly string[];
  readonly affects?: readonly TraversalAffect[];
  readonly batch?: TraversalModulationBatch;
  readonly progressContract?: Partial<TraversalProgressContract>;
  readonly continuation?: Partial<TraversalContinuationContract>;
  readonly profileRef?: string;
}

export interface TraversalAttemptEnvelopeInput {
  readonly basis: ExecutionBasis;
  readonly profile: TraversalModulationProfile;
  readonly actorInvocationId: string;
  readonly retryBudgetRemaining: number;
  readonly proposedScheduleItemRefs?: readonly string[];
  readonly proposedSliceAdmissionEvidenceRefs?: readonly string[];
  readonly gapPressureScheduleItemRefs?: readonly string[];
  readonly requiredProgressArtifactRefs?: readonly string[];
  readonly mustExitAfterBoundedAttempt?: boolean;
  readonly envelopeRef?: string;
}

interface TraversalHookMatch {
  readonly source: TraversalModulationGtlQualifierSource;
  readonly sourceRef: string;
  readonly attrKey: string;
  readonly hookRef: HookRef;
}

function assertAllowed<T extends string>(
  value: T,
  allowedValues: readonly T[],
  label: string
): void {
  if (!allowedValues.includes(value)) {
    throw new TypeError(`Unsupported ${label} ${JSON.stringify(value)}`);
  }
}

function freezeUniqueNonEmptyStrings(
  values: readonly string[],
  label: string,
  options?: { readonly allowEmpty?: boolean }
): readonly string[] {
  if (values.length === 0 && options?.allowEmpty !== true) {
    throw new TypeError(`${label} must include at least one ref`);
  }
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    assertNonEmptyString(value, label);
    if (seen.has(value)) {
      throw new TypeError(`${label} contains duplicate ref ${JSON.stringify(value)}`);
    }
    seen.add(value);
    result.push(value);
  }
  return freezeStringArray(result);
}

function freezeOptionalUniqueStrings(
  values: readonly string[] | undefined,
  label: string
): readonly string[] {
  return freezeUniqueNonEmptyStrings(values ?? Object.freeze([]), label, {
    allowEmpty: true
  });
}

function assertPrimitive(value: string): asserts value is TraversalSchedulingPrimitive {
  if (!TRAVERSAL_SCHEDULING_PRIMITIVE_VALUES.some((allowed) => allowed === value)) {
    throw new TypeError(`Unsupported scheduling primitive ${JSON.stringify(value)}`);
  }
}

function assertBackendKind(value: AgenticBackendKind): void {
  assertAllowed(value, AGENTIC_BACKEND_KIND_VALUES, "agentic backend kind");
}

function assertProgressOutcome(value: TraversalAttemptProgressOutcome): void {
  assertAllowed(value, TRAVERSAL_ATTEMPT_PROGRESS_OUTCOME_VALUES, "progress outcome");
}

function freezeSchedulingPrimitives(
  values: readonly string[]
): readonly TraversalSchedulingPrimitive[] {
  const primitives: TraversalSchedulingPrimitive[] = [];
  for (const value of values) {
    assertPrimitive(value);
    primitives.push(value);
  }
  return Object.freeze(primitives);
}

function attrValueForKey(
  attrs: SerializedAttrs,
  key: string
): SerializedAttrValue | null {
  const matching = attrs.entries.filter((entry) => entry.key === key);
  if (matching.length > 1) {
    throw new TypeError(`Duplicate GTL attr ${JSON.stringify(key)}`);
  }
  const entry = matching[0];
  return entry?.value ?? null;
}

function configScalarString(
  attrs: SerializedAttrs,
  key: string,
  label: string,
  fallback?: string
): string {
  const value = attrValueForKey(attrs, key);
  if (value === null) {
    if (fallback !== undefined) {
      assertNonEmptyString(fallback, label);
      return fallback;
    }
    throw new TypeError(`${label} requires ${key}`);
  }
  if (value.kind !== "scalar" || typeof value.value !== "string") {
    throw new TypeError(`${label}.${key} must be a scalar string`);
  }
  assertNonEmptyString(value.value, `${label}.${key}`);
  return value.value;
}

function configOptionalNonNegativeInteger(
  attrs: SerializedAttrs,
  key: string,
  label: string
): number | undefined {
  const value = attrValueForKey(attrs, key);
  if (value === null) {
    return undefined;
  }
  if (
    value.kind !== "scalar" ||
    typeof value.value !== "number" ||
    !Number.isInteger(value.value) ||
    value.value < 0
  ) {
    throw new TypeError(`${label}.${key} must be a non-negative integer scalar`);
  }
  return value.value;
}

function configStringList(
  attrs: SerializedAttrs,
  key: string,
  label: string,
  options?: { readonly allowEmpty?: boolean }
): readonly string[] {
  const value = attrValueForKey(attrs, key);
  if (value === null) {
    return freezeUniqueNonEmptyStrings(Object.freeze([]), `${label}.${key}`, {
      allowEmpty: options?.allowEmpty ?? false
    });
  }
  if (value.kind !== "string_list") {
    throw new TypeError(`${label}.${key} must be a string_list`);
  }
  return freezeUniqueNonEmptyStrings(value.value, `${label}.${key}`, {
    allowEmpty: options?.allowEmpty ?? false
  });
}

function batchFromHookConfig(attrs: SerializedAttrs): TraversalModulationBatch {
  const targetItemCount = configOptionalNonNegativeInteger(
    attrs,
    "target_item_count",
    "TraversalStrategyDirective"
  );
  const maxItemCount = configOptionalNonNegativeInteger(
    attrs,
    "max_item_count",
    "TraversalStrategyDirective"
  );
  const maxTokenPressure = configOptionalNonNegativeInteger(
    attrs,
    "max_token_pressure",
    "TraversalStrategyDirective"
  );
  return batchWithDefaults({
    ...(targetItemCount === undefined ? {} : { targetItemCount }),
    ...(maxItemCount === undefined ? {} : { maxItemCount }),
    ...(maxTokenPressure === undefined ? {} : { maxTokenPressure })
  });
}

function traversalHookMatch(input: {
  readonly attrs: SerializedAttrs;
  readonly keys: readonly string[];
  readonly source: TraversalModulationGtlQualifierSource;
  readonly sourceRef: string;
}): TraversalHookMatch | null {
  const matches = input.attrs.entries.filter((entry) =>
    input.keys.includes(entry.key)
  );
  if (matches.length > 1) {
    throw new TypeError(
      `Duplicate traversal modulation qualifier at ${input.source}`
    );
  }
  const match = matches[0];
  if (match === undefined) {
    return null;
  }
  if (match.value.kind !== "hook_ref") {
    throw new TypeError("Traversal modulation qualifier must be a hook_ref");
  }
  assertNonEmptyString(match.value.value.ref, "Traversal modulation HookRef.ref");
  return Object.freeze({
    source: input.source,
    sourceRef: input.sourceRef,
    attrKey: match.key,
    hookRef: match.value.value
  });
}

function directiveFromHook(match: TraversalHookMatch): TraversalStrategyDirective {
  const config = match.hookRef.config;
  const directiveRef = configScalarString(
    config,
    "directive_ref",
    "TraversalStrategyDirective",
    match.hookRef.ref
  );
  const strategyOwnerRef = configScalarString(
    config,
    "strategy_owner_ref",
    "TraversalStrategyDirective"
  );
  const strategyLabel = configScalarString(
    config,
    "strategy_label",
    "TraversalStrategyDirective",
    match.hookRef.ref
  );
  const enforcementPrimitives = freezeSchedulingPrimitives(
    configStringList(config, "enforcement_primitives", "TraversalStrategyDirective")
  );
  const obligationScheduleRefs = configStringList(
    config,
    "obligation_schedule_refs",
    "TraversalStrategyDirective",
    { allowEmpty: true }
  );
  const orderingConstraintRefs = configStringList(
    config,
    "ordering_constraint_refs",
    "TraversalStrategyDirective",
    { allowEmpty: true }
  );
  const phaseGateRefs = configStringList(
    config,
    "phase_gate_refs",
    "TraversalStrategyDirective",
    { allowEmpty: true }
  );
  return admitTraversalStrategyDirective({
    directiveRef,
    strategyOwnerRef,
    strategyLabel,
    enforcementPrimitives,
    obligationScheduleRefs,
    orderingConstraintRefs,
    phaseGateRefs,
    batch: batchFromHookConfig(config)
  });
}

function singleRoleHookMatch(roles: readonly Role[]): TraversalHookMatch | null {
  const matches: TraversalHookMatch[] = [];
  for (const role of roles) {
    const match = traversalHookMatch({
      attrs: role.policyHooks,
      keys: TRAVERSAL_STRATEGY_ROLE_ATTR_KEYS,
      source: "role_policy_hooks",
      sourceRef: role.id
    });
    if (match !== null) {
      matches.push(match);
    }
  }
  if (matches.length > 1) {
    throw new TypeError(
      "Multiple role traversal modulation defaults require explicit resolved-policy choice"
    );
  }
  return matches[0] ?? null;
}

function assertAffect(affect: TraversalAffect): void {
  switch (affect.kind) {
    case "urgency":
      assertAllowed(affect.level, Object.freeze(["low", "normal", "high"] as const), "urgency level");
      return;
    case "risk":
    case "confidence":
    case "precision":
    case "exploration":
      assertAllowed(affect.level, Object.freeze(["low", "medium", "high"] as const), `${affect.kind} level`);
      return;
    default: {
      const exhaustive: never = affect;
      throw new TypeError(`Unsupported traversal affect ${JSON.stringify(exhaustive)}`);
    }
  }
}

function hasPrimitive(
  primitives: readonly TraversalSchedulingPrimitive[],
  primitive: TraversalSchedulingPrimitive
): boolean {
  return primitives.some((candidate) => candidate === primitive);
}

function sortedUniqueStrings(values: Iterable<string>): readonly string[] {
  return freezeStringArray([...new Set(values)].sort());
}

function runtimeLineageFields(input: {
  readonly basis: ExecutionBasis;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId: string;
}): {
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly frameLineageId: string | null;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
} {
  assertNonEmptyString(input.correlationId, "Traversal modulation correlationId");
  return Object.freeze({
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    frameLineageId: input.basis.frameLineageId,
    causationEventRefs: freezeStringArray(input.causationEventRefs ?? []),
    correlationId: input.correlationId
  });
}

function batchWithDefaults(input: TraversalModulationBatch | undefined): TraversalModulationBatch {
  const batch: {
    targetItemCount?: number;
    maxItemCount?: number;
    maxTokenPressure?: number;
  } = {};
  if (input?.targetItemCount !== undefined) {
    assertNonNegativeInteger(input.targetItemCount, "targetItemCount");
    if (input.targetItemCount === 0) {
      throw new TypeError("targetItemCount must be greater than zero");
    }
    batch.targetItemCount = input.targetItemCount;
  }
  if (input?.maxItemCount !== undefined) {
    assertNonNegativeInteger(input.maxItemCount, "maxItemCount");
    if (input.maxItemCount === 0) {
      throw new TypeError("maxItemCount must be greater than zero");
    }
    batch.maxItemCount = input.maxItemCount;
  }
  if (input?.maxTokenPressure !== undefined) {
    assertNonNegativeInteger(input.maxTokenPressure, "maxTokenPressure");
    if (input.maxTokenPressure === 0) {
      throw new TypeError("maxTokenPressure must be greater than zero");
    }
    batch.maxTokenPressure = input.maxTokenPressure;
  }
  if (
    batch.targetItemCount !== undefined &&
    batch.maxItemCount !== undefined &&
    batch.targetItemCount > batch.maxItemCount
  ) {
    throw new TypeError("targetItemCount must not exceed maxItemCount");
  }
  return Object.freeze(batch);
}

function continuationWithDefaults(
  input: Partial<TraversalContinuationContract> | undefined
): TraversalContinuationContract {
  const sameEdgeUntil = input?.sameEdgeUntil ?? "foldback_closed";
  if (
    sameEdgeUntil !== "foldback_closed" &&
    sameEdgeUntil !== "retry_budget_exhausted"
  ) {
    throw new TypeError(`Unsupported sameEdgeUntil ${JSON.stringify(sameEdgeUntil)}`);
  }
  const maxAttemptsWithoutNewSignal = input?.maxAttemptsWithoutNewSignal ?? 1;
  const maxTotalAttempts = input?.maxTotalAttempts ?? 3;
  assertNonNegativeInteger(
    maxAttemptsWithoutNewSignal,
    "maxAttemptsWithoutNewSignal"
  );
  assertNonNegativeInteger(maxTotalAttempts, "maxTotalAttempts");
  if (maxTotalAttempts === 0) {
    throw new TypeError("maxTotalAttempts must be greater than zero");
  }
  return Object.freeze({
    sameEdgeUntil,
    maxAttemptsWithoutNewSignal,
    maxTotalAttempts
  });
}

function progressContractWithDefaults(
  input: Partial<TraversalProgressContract> | undefined
): TraversalProgressContract {
  const noProgressClass = input?.noProgressClass ?? "runtime_non_progress";
  if (noProgressClass !== "runtime_non_progress") {
    throw new TypeError("Traversal modulation composes with T-106 runtime_non_progress");
  }
  return Object.freeze({
    progressArtifactRequired: input?.progressArtifactRequired ?? false,
    allowedProgressArtifactKinds: freezeOptionalUniqueStrings(
      input?.allowedProgressArtifactKinds,
      "allowedProgressArtifactKinds"
    ),
    noProgressClass
  });
}

function assertBasisOwnedProfile(
  basis: ExecutionBasis,
  profile: TraversalModulationProfile
): void {
  if (profile.basisId !== basis.id) {
    throw new TypeError("Traversal modulation profile must share execution basis");
  }
  if (profile.graphFunctionId !== basis.graphFunction.id) {
    throw new TypeError("Traversal modulation profile must share graph function");
  }
}

function assertEnvelopeBasis(
  envelope: TraversalAttemptEnvelope
): void {
  assertNonEmptyString(envelope.envelopeRef, "TraversalAttemptEnvelope.envelopeRef");
  assertNonEmptyString(envelope.profileRef, "TraversalAttemptEnvelope.profileRef");
  freezeUniqueNonEmptyStrings(
    envelope.selectedScheduleItemRefs,
    "TraversalAttemptEnvelope.selectedScheduleItemRefs"
  );
}

function assertBasisOwnedEnvelope(
  basis: ExecutionBasis,
  envelope: TraversalAttemptEnvelope
): void {
  assertEnvelopeBasis(envelope);
  if (envelope.basisId !== basis.id) {
    throw new TypeError("Traversal attempt envelope must share execution basis");
  }
  if (envelope.graphFunctionId !== basis.graphFunction.id) {
    throw new TypeError("Traversal attempt envelope must share graph function");
  }
  assertVectorIndexInRange(basis, envelope.vectorIndex);
}

function assertRefsWithin(
  refs: readonly string[],
  allowedRefs: readonly string[],
  label: string
): void {
  const allowed = new Set(allowedRefs);
  const unknown = refs.filter((ref) => !allowed.has(ref));
  if (unknown.length > 0) {
    throw new TypeError(`${label} contains unknown refs: ${unknown.join(", ")}`);
  }
}

function assertOrderedPrefix(input: {
  readonly selectedRefs: readonly string[];
  readonly orderedRefs: readonly string[];
}): void {
  const expectedPrefix = input.orderedRefs.slice(0, input.selectedRefs.length);
  if (JSON.stringify(input.selectedRefs) !== JSON.stringify(expectedPrefix)) {
    throw new TypeError(
      "ordered_schedule_prefix requires selected schedule refs to be the ordered prefix"
    );
  }
}

function derivedSelectionLimit(profile: TraversalModulationProfile): number {
  const maxItemCount =
    profile.batch.maxItemCount ?? profile.obligationScheduleRefs.length;
  const targetItemCount = profile.batch.targetItemCount ?? maxItemCount;
  return Math.min(maxItemCount, targetItemCount, profile.obligationScheduleRefs.length);
}

function selectScheduleItemRefs(input: {
  readonly profile: TraversalModulationProfile;
  readonly proposedScheduleItemRefs: readonly string[];
  readonly proposedSliceAdmissionEvidenceRefs: readonly string[];
  readonly gapPressureScheduleItemRefs: readonly string[];
}): readonly string[] {
  const profile = input.profile;
  if (
    hasPrimitive(
      profile.enforcementPrimitives,
      "agent_proposed_slice_requires_admission"
    )
  ) {
    if (input.proposedScheduleItemRefs.length === 0) {
      throw new TypeError("Agent-proposed slice requires proposed schedule refs");
    }
    if (input.proposedSliceAdmissionEvidenceRefs.length === 0) {
      throw new TypeError("Agent-proposed slice requires admission evidence refs");
    }
    assertRefsWithin(
      input.proposedScheduleItemRefs,
      profile.obligationScheduleRefs,
      "proposedScheduleItemRefs"
    );
    return freezeStringArray(input.proposedScheduleItemRefs);
  }

  const limit = derivedSelectionLimit(profile);
  if (
    hasPrimitive(profile.enforcementPrimitives, "gap_repair_slice") &&
    input.gapPressureScheduleItemRefs.length > 0
  ) {
    assertRefsWithin(
      input.gapPressureScheduleItemRefs,
      profile.obligationScheduleRefs,
      "gapPressureScheduleItemRefs"
    );
    const pressureRefs = new Set(input.gapPressureScheduleItemRefs);
    return freezeStringArray(
      profile.obligationScheduleRefs
        .filter((ref) => pressureRefs.has(ref))
        .slice(0, limit)
    );
  }

  if (hasPrimitive(profile.enforcementPrimitives, "single_vertical_slice")) {
    const first = profile.obligationScheduleRefs[0];
    if (first === undefined) {
      throw new TypeError("single_vertical_slice requires at least one schedule ref");
    }
    return freezeStringArray([first]);
  }

  if (
    hasPrimitive(profile.enforcementPrimitives, "bounded_batch") ||
    hasPrimitive(profile.enforcementPrimitives, "ordered_schedule_prefix")
  ) {
    return freezeStringArray(profile.obligationScheduleRefs.slice(0, limit));
  }

  return freezeStringArray(profile.obligationScheduleRefs);
}

function firstForcedReviewGate(input: {
  readonly envelope: TraversalAttemptEnvelope;
  readonly trigger: TraversalForcedReviewTrigger;
  readonly triggeredScheduleItemRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly requiredRegime?: "F_P" | "F_H";
}): TraversalForcedReviewGate {
  const triggeredScheduleItemRefs = freezeUniqueNonEmptyStrings(
    input.triggeredScheduleItemRefs,
    "TraversalForcedReviewGate.triggeredScheduleItemRefs"
  );
  const evidenceRefs = freezeOptionalUniqueStrings(
    input.evidenceRefs,
    "TraversalForcedReviewGate.evidenceRefs"
  );
  return Object.freeze({
    kind: "traversal_forced_review_gate",
    gateRef: [
      "traversal_forced_review",
      input.envelope.envelopeRef,
      input.trigger,
      ...triggeredScheduleItemRefs
    ].join(":"),
    envelopeRef: input.envelope.envelopeRef,
    trigger: input.trigger,
    triggeredScheduleItemRefs,
    evidenceRefs,
    requiredRegime: input.requiredRegime ?? "F_P",
    publicAction: "forced_review",
    blocksPrivateContinuation: true
  } satisfies TraversalForcedReviewGate);
}

export function admitTraversalStrategyDirective(input: {
  readonly directiveRef: string;
  readonly strategyOwnerRef: string;
  readonly strategyLabel: string;
  readonly enforcementPrimitives: readonly TraversalSchedulingPrimitive[];
  readonly obligationScheduleRefs?: readonly string[];
  readonly orderingConstraintRefs?: readonly string[];
  readonly phaseGateRefs?: readonly string[];
  readonly batch?: TraversalModulationBatch;
}): TraversalStrategyDirective {
  assertNonEmptyString(input.directiveRef, "TraversalStrategyDirective.directiveRef");
  assertNonEmptyString(
    input.strategyOwnerRef,
    "TraversalStrategyDirective.strategyOwnerRef"
  );
  assertNonEmptyString(input.strategyLabel, "TraversalStrategyDirective.strategyLabel");
  const enforcementPrimitives = freezeSchedulingPrimitives(
    freezeUniqueNonEmptyStrings(
      input.enforcementPrimitives,
      "TraversalStrategyDirective.enforcementPrimitives"
    )
  );
  return Object.freeze({
    kind: "traversal_strategy_directive",
    directiveRef: input.directiveRef,
    strategyOwnerRef: input.strategyOwnerRef,
    strategyLabel: input.strategyLabel,
    enforcementPrimitives,
    obligationScheduleRefs: freezeOptionalUniqueStrings(
      input.obligationScheduleRefs,
      "TraversalStrategyDirective.obligationScheduleRefs"
    ),
    orderingConstraintRefs: freezeOptionalUniqueStrings(
      input.orderingConstraintRefs,
      "TraversalStrategyDirective.orderingConstraintRefs"
    ),
    phaseGateRefs: freezeOptionalUniqueStrings(
      input.phaseGateRefs,
      "TraversalStrategyDirective.phaseGateRefs"
    ),
    batch: batchWithDefaults(input.batch)
  } satisfies TraversalStrategyDirective);
}

function directiveFromSelection(
  selection: TraversalStrategySelection
): TraversalStrategyDirective {
  return admitTraversalStrategyDirective({
    directiveRef: selection.directiveRef,
    strategyOwnerRef: selection.strategyOwnerRef,
    strategyLabel: selection.strategyLabel,
    enforcementPrimitives: selection.enforcementPrimitives,
    obligationScheduleRefs: selection.obligationScheduleRefs,
    orderingConstraintRefs: selection.orderingConstraintRefs,
    phaseGateRefs: selection.phaseGateRefs,
    batch: selection.batch
  });
}

function selectionSourceForQualifier(
  source: TraversalModulationGtlQualifierSource
): TraversalStrategySelectionSource {
  switch (source) {
    case "graph_vector_declarations":
      return "graph_vector";
    case "graph_function_declarations":
      return "graph_function";
    case "role_policy_hooks":
      return "role_policy";
    default: {
      const exhaustive: never = source;
      throw new TypeError(
        `Unsupported traversal strategy source ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

function selectionFromDirective(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly source: TraversalStrategySelectionSource;
  readonly sourceRef: string;
  readonly attrKey: string | null;
  readonly hookRef: string | null;
  readonly directive: TraversalStrategyDirective;
  readonly selectionRef?: string | undefined;
}): TraversalStrategySelection {
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  assertNonEmptyString(input.sourceRef, "TraversalStrategySelection.sourceRef");
  if (input.attrKey !== null) {
    assertNonEmptyString(input.attrKey, "TraversalStrategySelection.attrKey");
  }
  if (input.hookRef !== null) {
    assertNonEmptyString(input.hookRef, "TraversalStrategySelection.hookRef");
  }
  const directive = admitTraversalStrategyDirective(input.directive);
  const graphCallId = graphCallIdForBasis(input.basis);
  const frameId = frameIdForBasis(input.basis);
  const edge = vectorEdge(input.basis, input.vectorIndex);
  const digestInput = Object.freeze({
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    vectorIndex: input.vectorIndex,
    edge,
    source: input.source,
    sourceRef: input.sourceRef,
    attrKey: input.attrKey,
    hookRef: input.hookRef,
    directive
  });
  const configDigest = stableSha256Digest(digestInput);
  return Object.freeze({
    kind: "traversal_strategy_selection",
    selectionRef:
      input.selectionRef ??
      [
        "traversal_strategy_selection",
        input.basis.id,
        String(input.vectorIndex),
        input.source,
        directive.directiveRef,
        configDigest
      ].join(":"),
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    graphCallId,
    frameId,
    vectorIndex: input.vectorIndex,
    edge,
    source: input.source,
    sourceRef: input.sourceRef,
    attrKey: input.attrKey,
    hookRef: input.hookRef,
    directiveRef: directive.directiveRef,
    strategyOwnerRef: directive.strategyOwnerRef,
    strategyLabel: directive.strategyLabel,
    enforcementPrimitives: directive.enforcementPrimitives,
    obligationScheduleRefs: directive.obligationScheduleRefs,
    orderingConstraintRefs: directive.orderingConstraintRefs,
    phaseGateRefs: directive.phaseGateRefs,
    batch: directive.batch,
    configDigest
  } satisfies TraversalStrategySelection);
}

function selectionFromResolution(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly resolution: TraversalModulationGtlQualifierResolution;
}): TraversalStrategySelection {
  return selectionFromDirective({
    basis: input.basis,
    vectorIndex: input.vectorIndex,
    source: selectionSourceForQualifier(input.resolution.source),
    sourceRef: input.resolution.sourceRef,
    attrKey: input.resolution.attrKey,
    hookRef: input.resolution.hookRef,
    directive: input.resolution.directive
  });
}

function resolveTraversalHookMatch(input: {
  readonly vector: GraphVector;
  readonly graphFunction: GraphFunction;
  readonly roles?: readonly Role[];
}): TraversalHookMatch | null {
  const vectorMatch = traversalHookMatch({
    attrs: input.vector.declarations,
    keys: TRAVERSAL_STRATEGY_VECTOR_ATTR_KEYS,
    source: "graph_vector_declarations",
    sourceRef: input.vector.id
  });
  const graphFunctionMatch =
    vectorMatch ??
      traversalHookMatch({
        attrs: input.graphFunction.declarations,
        keys: TRAVERSAL_STRATEGY_GRAPH_FUNCTION_DEFAULT_ATTR_KEYS,
        source: "graph_function_declarations",
        sourceRef: input.graphFunction.id
      });
  const match =
    graphFunctionMatch ?? singleRoleHookMatch(input.roles ?? Object.freeze([]));
  return match;
}

export function tryResolveTraversalStrategyDirectiveFromGtl(input: {
  readonly vector: GraphVector;
  readonly graphFunction: GraphFunction;
  readonly roles?: readonly Role[];
}): TraversalModulationGtlQualifierResolution | null {
  const match = resolveTraversalHookMatch(input);
  if (match === null) {
    return null;
  }
  return Object.freeze({
    kind: "traversal_modulation_gtl_qualifier_resolution",
    source: match.source,
    sourceRef: match.sourceRef,
    attrKey: match.attrKey,
    hookRef: match.hookRef.ref,
    directive: directiveFromHook(match)
  } satisfies TraversalModulationGtlQualifierResolution);
}

export function resolveTraversalStrategyDirectiveFromGtl(input: {
  readonly vector: GraphVector;
  readonly graphFunction: GraphFunction;
  readonly roles?: readonly Role[];
}): TraversalModulationGtlQualifierResolution {
  const resolution = tryResolveTraversalStrategyDirectiveFromGtl(input);
  if (resolution === null) {
    throw new TypeError(
      "Traversal modulation requires a GTL qualifier or explicit resolved-policy default"
    );
  }
  return resolution;
}

export function tryDeriveTraversalStrategySelectionFromGtl(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly vector: GraphVector;
  readonly graphFunction: GraphFunction;
  readonly roles?: readonly Role[];
}): TraversalStrategySelection | null {
  const resolutionInput = {
    vector: input.vector,
    graphFunction: input.graphFunction,
    ...(input.roles !== undefined ? { roles: input.roles } : {})
  };
  const resolution = tryResolveTraversalStrategyDirectiveFromGtl(resolutionInput);
  if (resolution === null) {
    return null;
  }
  return selectionFromResolution({
    basis: input.basis,
    vectorIndex: input.vectorIndex,
    resolution
  });
}

export function deriveTraversalStrategySelectionFromGtl(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly vector: GraphVector;
  readonly graphFunction: GraphFunction;
  readonly roles?: readonly Role[];
}): TraversalStrategySelection {
  const selection = tryDeriveTraversalStrategySelectionFromGtl(input);
  if (selection === null) {
    throw new TypeError(
      "Traversal strategy selection requires a GTL qualifier or explicit runtime default"
    );
  }
  return selection;
}

export function deriveTraversalModulationProfileFromGtl(input: Omit<
  TraversalModulationProfileInput,
  "directive"
> & {
  readonly vector: GraphVector;
  readonly graphFunction: GraphFunction;
  readonly roles?: readonly Role[];
}): TraversalModulationProfile {
  const selection = deriveTraversalStrategySelectionFromGtl({
    basis: input.basis,
    vectorIndex: input.vectorIndex,
    vector: input.vector,
    graphFunction: input.graphFunction,
    ...(input.roles !== undefined ? { roles: input.roles } : {})
  });
  const profileInput = {
    basis: input.basis,
    vectorIndex: input.vectorIndex,
    directive: directiveFromSelection(selection),
    strategySelection: selection,
    backendProfile: input.backendProfile,
    obligationScheduleRefs:
      input.obligationScheduleRefs ?? selection.obligationScheduleRefs,
    ...(input.policyRefs !== undefined ? { policyRefs: input.policyRefs } : {}),
    ...(input.gapPressureRefs !== undefined
      ? { gapPressureRefs: input.gapPressureRefs }
      : {}),
    ...(input.affectRefs !== undefined ? { affectRefs: input.affectRefs } : {}),
    ...(input.affects !== undefined ? { affects: input.affects } : {}),
    batch: input.batch ?? selection.batch,
    ...(input.progressContract !== undefined
      ? { progressContract: input.progressContract }
      : {}),
    ...(input.continuation !== undefined ? { continuation: input.continuation } : {}),
    ...(input.profileRef !== undefined ? { profileRef: input.profileRef } : {})
  } satisfies TraversalModulationProfileInput;
  return deriveTraversalModulationProfile(profileInput);
}

export function constructAgenticBackendProgressProfile(input: {
  readonly backendKind: AgenticBackendKind;
  readonly profileRef: string;
  readonly processProtocolSignals?: readonly string[];
  readonly streamProgressSignals?: readonly string[];
  readonly declaredArtifactProgressSignals?: readonly string[];
  readonly finalOutputMayBeBuffered: boolean;
  readonly progressSignalRequiredBeforeInactivityMs: number;
}): AgenticBackendProgressProfile {
  assertBackendKind(input.backendKind);
  assertNonEmptyString(input.profileRef, "AgenticBackendProgressProfile.profileRef");
  assertNonNegativeInteger(
    input.progressSignalRequiredBeforeInactivityMs,
    "progressSignalRequiredBeforeInactivityMs"
  );
  return Object.freeze({
    kind: "agentic_backend_progress_profile",
    backendKind: input.backendKind,
    profileRef: input.profileRef,
    processProtocolSignals: freezeOptionalUniqueStrings(
      input.processProtocolSignals,
      "AgenticBackendProgressProfile.processProtocolSignals"
    ),
    streamProgressSignals: freezeOptionalUniqueStrings(
      input.streamProgressSignals,
      "AgenticBackendProgressProfile.streamProgressSignals"
    ),
    declaredArtifactProgressSignals: freezeOptionalUniqueStrings(
      input.declaredArtifactProgressSignals,
      "AgenticBackendProgressProfile.declaredArtifactProgressSignals"
    ),
    finalOutputMayBeBuffered: input.finalOutputMayBeBuffered,
    progressSignalRequiredBeforeInactivityMs:
      input.progressSignalRequiredBeforeInactivityMs
  } satisfies AgenticBackendProgressProfile);
}

export function classifyAgenticBackendProgress(input: {
  readonly profile: AgenticBackendProgressProfile;
  readonly observation: AgenticBackendProgressObservation;
}): AgenticBackendProgressProjection {
  assertBackendKind(input.profile.backendKind);
  assertNonNegativeInteger(
    input.observation.elapsedSinceProgressMs,
    "elapsedSinceProgressMs"
  );
  const observedSignalRefs = sortedUniqueStrings([
    ...input.observation.processProtocolSignals.filter((signal) =>
      input.profile.processProtocolSignals.includes(signal)
    ),
    ...input.observation.streamProgressSignals.filter((signal) =>
      input.profile.streamProgressSignals.includes(signal)
    ),
    ...input.observation.declaredArtifactProgressSignals.filter((signal) =>
      input.profile.declaredArtifactProgressSignals.includes(signal)
    )
  ]);
  const progressObserved = observedSignalRefs.length > 0;
  let classification: AgenticBackendProgressClassification;
  if (progressObserved) {
    classification = "progress_observed";
  } else if (
    input.observation.elapsedSinceProgressMs >=
    input.profile.progressSignalRequiredBeforeInactivityMs
  ) {
    classification = input.profile.finalOutputMayBeBuffered
      ? "buffered_final_output_possible"
      : "progress_required_missed";
  } else {
    classification = "no_progress_observed";
  }
  return Object.freeze({
    kind: "agentic_backend_progress_projection",
    profileRef: input.profile.profileRef,
    backendKind: input.profile.backendKind,
    classification,
    observedSignalRefs,
    progressObserved,
    reviewRequired:
      classification === "progress_required_missed" ||
      classification === "buffered_final_output_possible"
  } satisfies AgenticBackendProgressProjection);
}

export function deriveTraversalModulationProfile(
  input: TraversalModulationProfileInput
): TraversalModulationProfile {
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  const directive = admitTraversalStrategyDirective(input.directive);
  const selection =
    input.strategySelection ??
    selectionFromDirective({
      basis: input.basis,
      vectorIndex: input.vectorIndex,
      source: "runtime_default",
      sourceRef: input.basis.resolvedPolicy.resolvedPolicyBundleRef,
      attrKey: null,
      hookRef: null,
      directive
    });
  if (selection.basisId !== input.basis.id) {
    throw new TypeError("Traversal strategy selection must share execution basis");
  }
  if (selection.graphFunctionId !== input.basis.graphFunction.id) {
    throw new TypeError("Traversal strategy selection must share graph function");
  }
  if (selection.vectorIndex !== input.vectorIndex) {
    throw new TypeError("Traversal strategy selection must share vector index");
  }
  if (selection.directiveRef !== directive.directiveRef) {
    throw new TypeError("Traversal strategy selection must share directive ref");
  }
  const obligationScheduleRefs = freezeUniqueNonEmptyStrings(
    input.obligationScheduleRefs ?? directive.obligationScheduleRefs,
    "TraversalModulationProfile.obligationScheduleRefs"
  );
  if (
    directive.enforcementPrimitives.includes("phase_gate") &&
    directive.phaseGateRefs.length === 0
  ) {
    throw new TypeError("phase_gate primitive requires phaseGateRefs");
  }
  const affects = Object.freeze([...(input.affects ?? Object.freeze([]))]);
  for (const affect of affects) {
    assertAffect(affect);
  }
  const policyRefs = freezeOptionalUniqueStrings(
    input.policyRefs,
    "TraversalModulationProfile.policyRefs"
  );
  const gapPressureRefs = freezeOptionalUniqueStrings(
    input.gapPressureRefs,
    "TraversalModulationProfile.gapPressureRefs"
  );
  const affectRefs = freezeOptionalUniqueStrings(
    input.affectRefs,
    "TraversalModulationProfile.affectRefs"
  );
  const batch = batchWithDefaults(input.batch ?? directive.batch);
  const progressContract = progressContractWithDefaults(input.progressContract);
  const continuation = continuationWithDefaults(input.continuation);
  const graphCallId = graphCallIdForBasis(input.basis);
  const frameId = frameIdForBasis(input.basis);
  const edge = vectorEdge(input.basis, input.vectorIndex);
  return Object.freeze({
    kind: "traversal_modulation_profile",
    profileRef:
      input.profileRef ??
      [
        "traversal_modulation_profile",
        input.basis.id,
        String(input.vectorIndex),
        directive.directiveRef
      ].join(":"),
    strategySelectionRef: selection.selectionRef,
    strategySelectionSource: selection.source,
    strategySelectionSourceRef: selection.sourceRef,
    strategySelectionAttrKey: selection.attrKey,
    strategySelectionHookRef: selection.hookRef,
    strategyConfigDigest: selection.configDigest,
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    graphCallId,
    frameId,
    vectorIndex: input.vectorIndex,
    edge,
    strategyDirectiveRef: directive.directiveRef,
    strategyOwnerRef: directive.strategyOwnerRef,
    strategyLabel: directive.strategyLabel,
    enforcementPrimitives: directive.enforcementPrimitives,
    orderingConstraintRefs: directive.orderingConstraintRefs,
    phaseGateRefs: directive.phaseGateRefs,
    backendProfileRef: input.backendProfile.profileRef,
    policyRefs,
    obligationScheduleRefs,
    gapPressureRefs,
    affectRefs,
    affects,
    batch,
    progressContract,
    continuation
  } satisfies TraversalModulationProfile);
}

export function deriveTraversalAttemptEnvelope(
  input: TraversalAttemptEnvelopeInput
): TraversalAttemptEnvelope {
  assertBasisOwnedProfile(input.basis, input.profile);
  assertNonEmptyString(input.actorInvocationId, "TraversalAttemptEnvelope.actorInvocationId");
  assertNonNegativeInteger(input.retryBudgetRemaining, "retryBudgetRemaining");
  const proposedScheduleItemRefs = freezeOptionalUniqueStrings(
    input.proposedScheduleItemRefs,
    "TraversalAttemptEnvelope.proposedScheduleItemRefs"
  );
  const proposedSliceAdmissionEvidenceRefs = freezeOptionalUniqueStrings(
    input.proposedSliceAdmissionEvidenceRefs,
    "TraversalAttemptEnvelope.proposedSliceAdmissionEvidenceRefs"
  );
  const gapPressureScheduleItemRefs = freezeOptionalUniqueStrings(
    input.gapPressureScheduleItemRefs,
    "TraversalAttemptEnvelope.gapPressureScheduleItemRefs"
  );
  const selectedScheduleItemRefs = selectScheduleItemRefs({
    profile: input.profile,
    proposedScheduleItemRefs,
    proposedSliceAdmissionEvidenceRefs,
    gapPressureScheduleItemRefs
  });
  if (selectedScheduleItemRefs.length === 0) {
    throw new TypeError("Traversal attempt envelope requires selected schedule refs");
  }
  if (
    hasPrimitive(input.profile.enforcementPrimitives, "ordered_schedule_prefix")
  ) {
    assertOrderedPrefix({
      selectedRefs: selectedScheduleItemRefs,
      orderedRefs: input.profile.obligationScheduleRefs
    });
  }
  return Object.freeze({
    kind: "traversal_attempt_envelope",
    envelopeRef:
      input.envelopeRef ??
      [
        "traversal_attempt_envelope",
        input.profile.profileRef,
        input.actorInvocationId
      ].join(":"),
    profileRef: input.profile.profileRef,
    strategySelectionRef: input.profile.strategySelectionRef,
    strategySelectionSource: input.profile.strategySelectionSource,
    strategyConfigDigest: input.profile.strategyConfigDigest,
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    graphCallId: input.profile.graphCallId,
    frameId: input.profile.frameId,
    vectorIndex: input.profile.vectorIndex,
    edge: input.profile.edge,
    strategyDirectiveRef: input.profile.strategyDirectiveRef,
    backendProfileRef: input.profile.backendProfileRef,
    actorInvocationId: input.actorInvocationId,
    selectedScheduleItemRefs,
    orderingConstraintRefs: input.profile.orderingConstraintRefs,
    phaseGateRefs: input.profile.phaseGateRefs,
    requiredProgressArtifactRefs: freezeOptionalUniqueStrings(
      input.requiredProgressArtifactRefs,
      "TraversalAttemptEnvelope.requiredProgressArtifactRefs"
    ),
    gapPressureRefs: input.profile.gapPressureRefs,
    affectRefs: input.profile.affectRefs,
    retryBudgetRemaining: input.retryBudgetRemaining,
    mustExitAfterBoundedAttempt:
      input.mustExitAfterBoundedAttempt ??
      !hasPrimitive(input.profile.enforcementPrimitives, "atomic_attempt")
  } satisfies TraversalAttemptEnvelope);
}

export function constructTraversalModulationResolvedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly profile: TraversalModulationProfile;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}): TraversalModulationResolvedEvent {
  assertBasisOwnedProfile(input.basis, input.profile);
  assertVectorIndexInRange(input.basis, input.profile.vectorIndex);
  const lineage = runtimeLineageFields({
    basis: input.basis,
    causationEventRefs: input.causationEventRefs,
    correlationId: input.correlationId ?? input.profile.profileRef
  });
  return Object.freeze({
    kind: "traversal_modulation_resolved",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    frameLineageId: lineage.frameLineageId,
    graphFunctionId: input.basis.graphFunction.id,
    runId: lineage.runId,
    workKey: lineage.workKey,
    vectorIndex: input.profile.vectorIndex,
    edge: input.profile.edge,
    profileRef: input.profile.profileRef,
    strategySelectionRef: input.profile.strategySelectionRef,
    strategySelectionSource: input.profile.strategySelectionSource,
    strategySelectionSourceRef: input.profile.strategySelectionSourceRef,
    strategySelectionAttrKey: input.profile.strategySelectionAttrKey,
    strategySelectionHookRef: input.profile.strategySelectionHookRef,
    strategyConfigDigest: input.profile.strategyConfigDigest,
    strategyDirectiveRef: input.profile.strategyDirectiveRef,
    strategyOwnerRef: input.profile.strategyOwnerRef,
    strategyLabel: input.profile.strategyLabel,
    enforcementPrimitives: freezeStringArray(input.profile.enforcementPrimitives),
    obligationScheduleRefs: freezeStringArray(input.profile.obligationScheduleRefs),
    orderingConstraintRefs: freezeStringArray(input.profile.orderingConstraintRefs),
    phaseGateRefs: freezeStringArray(input.profile.phaseGateRefs),
    backendProfileRef: input.profile.backendProfileRef,
    policyRefs: freezeStringArray(input.profile.policyRefs),
    gapPressureRefs: freezeStringArray(input.profile.gapPressureRefs),
    affectRefs: freezeStringArray(input.profile.affectRefs),
    causationEventRefs: lineage.causationEventRefs,
    correlationId: lineage.correlationId
  } satisfies TraversalModulationResolvedEvent);
}

export function constructTraversalAttemptEnvelopeDerivedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly envelope: TraversalAttemptEnvelope;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}): TraversalAttemptEnvelopeDerivedEvent {
  assertBasisOwnedEnvelope(input.basis, input.envelope);
  const lineage = runtimeLineageFields({
    basis: input.basis,
    causationEventRefs: input.causationEventRefs ?? [input.envelope.profileRef],
    correlationId: input.correlationId ?? input.envelope.envelopeRef
  });
  return Object.freeze({
    kind: "traversal_attempt_envelope_derived",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    frameLineageId: lineage.frameLineageId,
    graphFunctionId: input.basis.graphFunction.id,
    runId: lineage.runId,
    workKey: lineage.workKey,
    vectorIndex: input.envelope.vectorIndex,
    edge: input.envelope.edge,
    envelopeRef: input.envelope.envelopeRef,
    profileRef: input.envelope.profileRef,
    strategySelectionRef: input.envelope.strategySelectionRef,
    strategySelectionSource: input.envelope.strategySelectionSource,
    strategyConfigDigest: input.envelope.strategyConfigDigest,
    strategyDirectiveRef: input.envelope.strategyDirectiveRef,
    backendProfileRef: input.envelope.backendProfileRef,
    actorInvocationId: input.envelope.actorInvocationId,
    selectedScheduleItemRefs: freezeStringArray(
      input.envelope.selectedScheduleItemRefs
    ),
    orderingConstraintRefs: freezeStringArray(input.envelope.orderingConstraintRefs),
    phaseGateRefs: freezeStringArray(input.envelope.phaseGateRefs),
    requiredProgressArtifactRefs: freezeStringArray(
      input.envelope.requiredProgressArtifactRefs
    ),
    gapPressureRefs: freezeStringArray(input.envelope.gapPressureRefs),
    affectRefs: freezeStringArray(input.envelope.affectRefs),
    retryBudgetRemaining: input.envelope.retryBudgetRemaining,
    mustExitAfterBoundedAttempt: input.envelope.mustExitAfterBoundedAttempt,
    causationEventRefs: lineage.causationEventRefs,
    correlationId: lineage.correlationId
  } satisfies TraversalAttemptEnvelopeDerivedEvent);
}

export function constructTraversalAttemptDispatchedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly envelope: TraversalAttemptEnvelope;
  readonly dispatchRef: string;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}): TraversalAttemptDispatchedEvent {
  assertBasisOwnedEnvelope(input.basis, input.envelope);
  assertNonEmptyString(input.dispatchRef, "TraversalAttemptDispatchedEvent.dispatchRef");
  const lineage = runtimeLineageFields({
    basis: input.basis,
    causationEventRefs: input.causationEventRefs ?? [input.envelope.envelopeRef],
    correlationId: input.correlationId ?? input.dispatchRef
  });
  return Object.freeze({
    kind: "traversal_attempt_dispatched",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    frameLineageId: lineage.frameLineageId,
    graphFunctionId: input.basis.graphFunction.id,
    runId: lineage.runId,
    workKey: lineage.workKey,
    vectorIndex: input.envelope.vectorIndex,
    edge: input.envelope.edge,
    envelopeRef: input.envelope.envelopeRef,
    actorInvocationId: input.envelope.actorInvocationId,
    dispatchRef: input.dispatchRef,
    causationEventRefs: lineage.causationEventRefs,
    correlationId: lineage.correlationId
  } satisfies TraversalAttemptDispatchedEvent);
}

export function admitTraversalAttemptProgressRow(input: {
  readonly envelope: TraversalAttemptEnvelope;
  readonly scheduleItemRef: string;
  readonly declaredOutcome: TraversalAttemptProgressOutcome;
  readonly artifactRefs?: readonly string[];
  readonly evidenceRefs?: readonly string[];
  readonly remainingWorkRefs?: readonly string[];
  readonly reviewRequired?: boolean;
  readonly rowRef?: string;
}): TraversalAttemptProgressRow {
  assertEnvelopeBasis(input.envelope);
  assertNonEmptyString(input.scheduleItemRef, "TraversalAttemptProgressRow.scheduleItemRef");
  if (!input.envelope.selectedScheduleItemRefs.includes(input.scheduleItemRef)) {
    throw new TypeError("TraversalAttemptProgressRow references a schedule item outside the envelope");
  }
  assertProgressOutcome(input.declaredOutcome);
  return Object.freeze({
    kind: "traversal_attempt_progress_row",
    rowRef:
      input.rowRef ??
      [
        "traversal_attempt_progress_row",
        input.envelope.envelopeRef,
        input.scheduleItemRef
      ].join(":"),
    envelopeRef: input.envelope.envelopeRef,
    scheduleItemRef: input.scheduleItemRef,
    declaredOutcome: input.declaredOutcome,
    artifactRefs: freezeOptionalUniqueStrings(
      input.artifactRefs,
      "TraversalAttemptProgressRow.artifactRefs"
    ),
    evidenceRefs: freezeOptionalUniqueStrings(
      input.evidenceRefs,
      "TraversalAttemptProgressRow.evidenceRefs"
    ),
    remainingWorkRefs: freezeOptionalUniqueStrings(
      input.remainingWorkRefs,
      "TraversalAttemptProgressRow.remainingWorkRefs"
    ),
    reviewRequired: input.reviewRequired ?? false
  } satisfies TraversalAttemptProgressRow);
}

export function constructTraversalAttemptProgressObservedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly envelope: TraversalAttemptEnvelope;
  readonly row: TraversalAttemptProgressRow;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}): TraversalAttemptProgressObservedEvent {
  assertBasisOwnedEnvelope(input.basis, input.envelope);
  if (input.row.envelopeRef !== input.envelope.envelopeRef) {
    throw new TypeError("Traversal progress observed event row envelope drift");
  }
  const lineage = runtimeLineageFields({
    basis: input.basis,
    causationEventRefs: input.causationEventRefs ?? [
      input.envelope.envelopeRef,
      ...input.row.evidenceRefs,
      ...input.row.artifactRefs
    ],
    correlationId: input.correlationId ?? input.row.rowRef
  });
  return Object.freeze({
    kind: "traversal_attempt_progress_observed",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    frameLineageId: lineage.frameLineageId,
    graphFunctionId: input.basis.graphFunction.id,
    runId: lineage.runId,
    workKey: lineage.workKey,
    vectorIndex: input.envelope.vectorIndex,
    edge: input.envelope.edge,
    envelopeRef: input.envelope.envelopeRef,
    rowRef: input.row.rowRef,
    scheduleItemRef: input.row.scheduleItemRef,
    declaredOutcome: input.row.declaredOutcome,
    artifactRefs: freezeStringArray(input.row.artifactRefs),
    evidenceRefs: freezeStringArray(input.row.evidenceRefs),
    remainingWorkRefs: freezeStringArray(input.row.remainingWorkRefs),
    reviewRequired: input.row.reviewRequired,
    causationEventRefs: lineage.causationEventRefs,
    correlationId: lineage.correlationId
  } satisfies TraversalAttemptProgressObservedEvent);
}

export function deriveTraversalModulationAssuranceProjection(input: {
  readonly envelope: TraversalAttemptEnvelope;
  readonly progressRows: readonly TraversalAttemptProgressRow[];
  readonly backendProgressProjection?: AgenticBackendProgressProjection;
  readonly untypedObservedFileRefs?: readonly string[];
  readonly workerNarrativeRefs?: readonly string[];
}): TraversalModulationAssuranceProjection {
  assertEnvelopeBasis(input.envelope);
  const progressRows = Object.freeze([...input.progressRows]);
  const selectedRefs = input.envelope.selectedScheduleItemRefs;
  const missingProgressRowRefs: string[] = [];
  const duplicateProgressRowRefs: string[] = [];
  const evidenceMissingScheduleItemRefs: string[] = [];
  const remainingWorkMissingScheduleItemRefs: string[] = [];
  const fulfilledScheduleItemRefs: string[] = [];
  const remainingScheduleItemRefs: string[] = [];
  const evidenceRefs: string[] = [input.envelope.envelopeRef];

  for (const row of progressRows) {
    if (row.envelopeRef !== input.envelope.envelopeRef) {
      throw new TypeError("Traversal progress row envelope drift");
    }
    if (!selectedRefs.includes(row.scheduleItemRef)) {
      throw new TypeError("Traversal progress row references non-selected schedule item");
    }
    evidenceRefs.push(row.rowRef, ...row.evidenceRefs, ...row.artifactRefs);
  }

  for (const scheduleItemRef of selectedRefs) {
    const rowsForItem = progressRows.filter(
      (row) => row.scheduleItemRef === scheduleItemRef
    );
    if (rowsForItem.length === 0) {
      missingProgressRowRefs.push(scheduleItemRef);
      continue;
    }
    if (rowsForItem.length > 1) {
      duplicateProgressRowRefs.push(scheduleItemRef);
      continue;
    }
    const row = rowsForItem[0];
    if (row === undefined) {
      missingProgressRowRefs.push(scheduleItemRef);
      continue;
    }
    if (
      row.declaredOutcome !== "not_attempted" &&
      row.evidenceRefs.length === 0 &&
      row.artifactRefs.length === 0
    ) {
      evidenceMissingScheduleItemRefs.push(scheduleItemRef);
    }
    if (row.declaredOutcome === "fulfilled") {
      fulfilledScheduleItemRefs.push(scheduleItemRef);
    } else {
      remainingScheduleItemRefs.push(...row.remainingWorkRefs);
      if (row.remainingWorkRefs.length === 0) {
        remainingWorkMissingScheduleItemRefs.push(scheduleItemRef);
      }
    }
    if (row.reviewRequired) {
      remainingScheduleItemRefs.push(scheduleItemRef);
    }
  }

  const forcedReviewGates: TraversalForcedReviewGate[] = [];
  if (missingProgressRowRefs.length > 0) {
    forcedReviewGates.push(
      firstForcedReviewGate({
        envelope: input.envelope,
        trigger: "missing_progress_row",
        triggeredScheduleItemRefs: missingProgressRowRefs,
        evidenceRefs
      })
    );
  }
  if (duplicateProgressRowRefs.length > 0) {
    forcedReviewGates.push(
      firstForcedReviewGate({
        envelope: input.envelope,
        trigger: "duplicate_progress_row",
        triggeredScheduleItemRefs: duplicateProgressRowRefs,
        evidenceRefs
      })
    );
  }
  if (evidenceMissingScheduleItemRefs.length > 0) {
    forcedReviewGates.push(
      firstForcedReviewGate({
        envelope: input.envelope,
        trigger: "evidence_missing",
        triggeredScheduleItemRefs: evidenceMissingScheduleItemRefs,
        evidenceRefs
      })
    );
  }
  if (remainingWorkMissingScheduleItemRefs.length > 0) {
    forcedReviewGates.push(
      firstForcedReviewGate({
        envelope: input.envelope,
        trigger: "partial_without_remaining_work",
        triggeredScheduleItemRefs: remainingWorkMissingScheduleItemRefs,
        evidenceRefs
      })
    );
  }
  if (input.envelope.retryBudgetRemaining === 0 && remainingScheduleItemRefs.length > 0) {
    forcedReviewGates.push(
      firstForcedReviewGate({
        envelope: input.envelope,
        trigger: "retry_budget_exhausted",
        triggeredScheduleItemRefs: selectedRefs,
        evidenceRefs
      })
    );
  }
  if (input.backendProgressProjection?.reviewRequired === true) {
    forcedReviewGates.push(
      firstForcedReviewGate({
        envelope: input.envelope,
        trigger: "backend_progress_ambiguous",
        triggeredScheduleItemRefs: selectedRefs,
        evidenceRefs: [
          ...evidenceRefs,
          input.backendProgressProjection.profileRef,
          ...input.backendProgressProjection.observedSignalRefs
        ]
      })
    );
  }

  const ignoredInferenceRefs = sortedUniqueStrings([
    ...(input.untypedObservedFileRefs ?? Object.freeze([])),
    ...(input.workerNarrativeRefs ?? Object.freeze([]))
  ]);
  const uniqueRemainingRefs = sortedUniqueStrings(remainingScheduleItemRefs);
  const action: TraversalModulationAction =
    forcedReviewGates.length > 0
      ? "forced_review"
      : uniqueRemainingRefs.length > 0
        ? "continue_same_edge"
        : "foldback_ready";

  return Object.freeze({
    kind: "traversal_modulation_assurance_projection",
    projectionRef: [
      "traversal_modulation_assurance",
      input.envelope.envelopeRef,
      action
    ].join(":"),
    envelopeRef: input.envelope.envelopeRef,
    action,
    publicSummaryAction: action,
    selectedScheduleItemRefs: selectedRefs,
    fulfilledScheduleItemRefs: sortedUniqueStrings(fulfilledScheduleItemRefs),
    remainingScheduleItemRefs: uniqueRemainingRefs,
    missingProgressRowRefs: sortedUniqueStrings(missingProgressRowRefs),
    duplicateProgressRowRefs: sortedUniqueStrings(duplicateProgressRowRefs),
    evidenceMissingScheduleItemRefs: sortedUniqueStrings(
      evidenceMissingScheduleItemRefs
    ),
    remainingWorkMissingScheduleItemRefs: sortedUniqueStrings(
      remainingWorkMissingScheduleItemRefs
    ),
    forcedReviewGates: Object.freeze(forcedReviewGates),
    ignoredInferenceRefs,
    evidenceRefs: sortedUniqueStrings(evidenceRefs)
  } satisfies TraversalModulationAssuranceProjection);
}

export function constructTraversalAttemptNonProgressClassifiedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly envelope: TraversalAttemptEnvelope;
  readonly sourceCarrierRef: string;
  readonly actionProjectionRef: string;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}): TraversalAttemptNonProgressClassifiedEvent {
  assertBasisOwnedEnvelope(input.basis, input.envelope);
  assertNonEmptyString(
    input.sourceCarrierRef,
    "TraversalAttemptNonProgressClassifiedEvent.sourceCarrierRef"
  );
  assertNonEmptyString(
    input.actionProjectionRef,
    "TraversalAttemptNonProgressClassifiedEvent.actionProjectionRef"
  );
  const lineage = runtimeLineageFields({
    basis: input.basis,
    causationEventRefs: input.causationEventRefs ?? [
      input.envelope.envelopeRef,
      input.sourceCarrierRef,
      input.actionProjectionRef
    ],
    correlationId: input.correlationId ?? input.actionProjectionRef
  });
  return Object.freeze({
    kind: "traversal_attempt_non_progress_classified",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    frameLineageId: lineage.frameLineageId,
    graphFunctionId: input.basis.graphFunction.id,
    runId: lineage.runId,
    workKey: lineage.workKey,
    vectorIndex: input.envelope.vectorIndex,
    edge: input.envelope.edge,
    envelopeRef: input.envelope.envelopeRef,
    sourceCarrierRef: input.sourceCarrierRef,
    actionProjectionRef: input.actionProjectionRef,
    causationEventRefs: lineage.causationEventRefs,
    correlationId: lineage.correlationId
  } satisfies TraversalAttemptNonProgressClassifiedEvent);
}

export function constructTraversalForcedReviewProjectedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly envelope: TraversalAttemptEnvelope;
  readonly gate: TraversalForcedReviewGate;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}): TraversalForcedReviewProjectedEvent {
  assertBasisOwnedEnvelope(input.basis, input.envelope);
  if (input.gate.envelopeRef !== input.envelope.envelopeRef) {
    throw new TypeError("Traversal forced review event gate envelope drift");
  }
  const lineage = runtimeLineageFields({
    basis: input.basis,
    causationEventRefs: input.causationEventRefs ?? [
      input.envelope.envelopeRef,
      ...input.gate.evidenceRefs
    ],
    correlationId: input.correlationId ?? input.gate.gateRef
  });
  return Object.freeze({
    kind: "traversal_forced_review_projected",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    frameLineageId: lineage.frameLineageId,
    graphFunctionId: input.basis.graphFunction.id,
    runId: lineage.runId,
    workKey: lineage.workKey,
    vectorIndex: input.envelope.vectorIndex,
    edge: input.envelope.edge,
    envelopeRef: input.envelope.envelopeRef,
    gateRef: input.gate.gateRef,
    trigger: input.gate.trigger,
    triggeredScheduleItemRefs: freezeStringArray(
      input.gate.triggeredScheduleItemRefs
    ),
    evidenceRefs: freezeStringArray(input.gate.evidenceRefs),
    requiredRegime: input.gate.requiredRegime,
    publicAction: "forced_review",
    blocksPrivateContinuation: true,
    causationEventRefs: lineage.causationEventRefs,
    correlationId: lineage.correlationId
  } satisfies TraversalForcedReviewProjectedEvent);
}

export function constructTraversalSameEdgeContinuationPlannedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly envelope: TraversalAttemptEnvelope;
  readonly projection: TraversalModulationAssuranceProjection;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}): TraversalSameEdgeContinuationPlannedEvent {
  assertBasisOwnedEnvelope(input.basis, input.envelope);
  if (input.projection.envelopeRef !== input.envelope.envelopeRef) {
    throw new TypeError("Traversal continuation event projection envelope drift");
  }
  if (input.projection.action !== "continue_same_edge") {
    throw new TypeError("Traversal continuation event requires continue_same_edge");
  }
  const lineage = runtimeLineageFields({
    basis: input.basis,
    causationEventRefs: input.causationEventRefs ?? input.projection.evidenceRefs,
    correlationId: input.correlationId ?? input.projection.projectionRef
  });
  return Object.freeze({
    kind: "traversal_same_edge_continuation_planned",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    frameLineageId: lineage.frameLineageId,
    graphFunctionId: input.basis.graphFunction.id,
    runId: lineage.runId,
    workKey: lineage.workKey,
    vectorIndex: input.envelope.vectorIndex,
    edge: input.envelope.edge,
    envelopeRef: input.envelope.envelopeRef,
    remainingScheduleItemRefs: freezeStringArray(
      input.projection.remainingScheduleItemRefs
    ),
    evidenceRefs: freezeStringArray(input.projection.evidenceRefs),
    causationEventRefs: lineage.causationEventRefs,
    correlationId: lineage.correlationId
  } satisfies TraversalSameEdgeContinuationPlannedEvent);
}

export function constructTraversalModulationExhaustedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly envelope: TraversalAttemptEnvelope;
  readonly reason: string;
  readonly evidenceRefs?: readonly string[] | undefined;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}): TraversalModulationExhaustedEvent {
  assertBasisOwnedEnvelope(input.basis, input.envelope);
  assertNonEmptyString(input.reason, "TraversalModulationExhaustedEvent.reason");
  const evidenceRefs = freezeOptionalUniqueStrings(
    input.evidenceRefs,
    "TraversalModulationExhaustedEvent.evidenceRefs"
  );
  const lineage = runtimeLineageFields({
    basis: input.basis,
    causationEventRefs: input.causationEventRefs ?? [
      input.envelope.envelopeRef,
      ...evidenceRefs
    ],
    correlationId:
      input.correlationId ??
      ["traversal_modulation_exhausted", input.envelope.envelopeRef].join(":")
  });
  return Object.freeze({
    kind: "traversal_modulation_exhausted",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    frameLineageId: lineage.frameLineageId,
    graphFunctionId: input.basis.graphFunction.id,
    runId: lineage.runId,
    workKey: lineage.workKey,
    vectorIndex: input.envelope.vectorIndex,
    edge: input.envelope.edge,
    envelopeRef: input.envelope.envelopeRef,
    reason: input.reason,
    evidenceRefs,
    causationEventRefs: lineage.causationEventRefs,
    correlationId: lineage.correlationId
  } satisfies TraversalModulationExhaustedEvent);
}

export function deriveTraversalModulationSummary(
  projection: TraversalModulationAssuranceProjection
): TraversalModulationSummary {
  return Object.freeze({
    kind: "traversal_modulation_summary",
    action: projection.publicSummaryAction,
    envelopeRef: projection.envelopeRef,
    selectedScheduleItemRefs: projection.selectedScheduleItemRefs,
    remainingScheduleItemRefs: projection.remainingScheduleItemRefs,
    forcedReviewGateRefs: freezeStringArray(
      projection.forcedReviewGates.map((gate) => gate.gateRef)
    ),
    evidenceRefs: projection.evidenceRefs
  } satisfies TraversalModulationSummary);
}

export function assertTraversalModulationSummaryAgreement(input: {
  readonly projection: TraversalModulationAssuranceProjection;
  readonly summary: TraversalModulationSummary;
}): void {
  if (input.summary.action !== input.projection.publicSummaryAction) {
    throw new TypeError("Traversal modulation summary action drift");
  }
  if (input.summary.envelopeRef !== input.projection.envelopeRef) {
    throw new TypeError("Traversal modulation summary envelope drift");
  }
  if (
    JSON.stringify(input.summary.selectedScheduleItemRefs) !==
    JSON.stringify(input.projection.selectedScheduleItemRefs)
  ) {
    throw new TypeError("Traversal modulation summary selected schedule drift");
  }
  if (
    JSON.stringify(input.summary.remainingScheduleItemRefs) !==
    JSON.stringify(input.projection.remainingScheduleItemRefs)
  ) {
    throw new TypeError("Traversal modulation summary remaining schedule drift");
  }
  const projectionGateRefs = input.projection.forcedReviewGates.map(
    (gate) => gate.gateRef
  );
  if (
    JSON.stringify(input.summary.forcedReviewGateRefs) !==
    JSON.stringify(projectionGateRefs)
  ) {
    throw new TypeError("Traversal modulation summary forced review drift");
  }
}
