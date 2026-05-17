// Implements: T-140
// Implements: REQ-R-ABG3-FP-CONSCIOUSNESS

import {
  isConstructiveConstructionActionKind
} from "./construction_action_kinds.js";
import type {
  ConstructionActionCatalogProjection,
  ConstructionActionRow,
  ObservationToActionBindingProjection,
  ObservationToActionBindingRow
} from "./construction_action_catalog.js";
import type { ConstructionObservationSnapshot } from "./construction_observation.js";
import type {
  ConstructionPriorityProjection,
  ConstructionPriorityRow
} from "./construction_priority.js";
import {
  assertNonEmptyString,
  assertNonNegativeInteger,
  freezeStringArray
} from "./runtime_support.js";
import {
  assertNonNegativeFiniteNumber,
  freezeNonEmptyStrings,
  nullableString
} from "./construction_validation.js";

export const CONSTRUCTION_INTENT_ADMISSION_DECISION_VALUES = Object.freeze([
  "admitted",
  "rejected"
] as const);

export type ConstructionIntentAdmissionDecision =
  (typeof CONSTRUCTION_INTENT_ADMISSION_DECISION_VALUES)[number];

export interface ConstructionIntentCandidate {
  readonly kind: "construction_intent_candidate";
  readonly candidateId: string;
  readonly episodeId: string;
  readonly rank: number;
  readonly valueScore: number;
  readonly priorityScore: number;
  readonly affectAdjustmentRefs: readonly string[];
  readonly selectedActionRef: string;
  readonly selectedBindingRef: string;
  readonly selectedOutcomeRef: string;
  readonly targetGraphFunctionRef: string | null;
  readonly targetVectorRef: string | null;
  readonly targetReentryRef: string | null;
  readonly inputAssetRefs: readonly string[];
  readonly expectedOutputAssetRefs: readonly string[];
  readonly gapRefs: readonly string[];
  readonly obligationRefs: readonly string[];
  readonly lawfulBasisRefs: readonly string[];
  readonly expectedDelta: string;
  readonly progressCondition: string;
  readonly stopCondition: string;
  readonly escalationCondition: string;
  readonly rejectedAlternativeRefs: readonly string[];
  readonly rationale: string;
  readonly hiddenConfigRefs: readonly string[];
  readonly runtimeEventPayloadRefs: readonly string[];
  readonly fdSemanticCanonicalizationRequired: boolean;
}

export interface ConstructionIntentAdmission {
  readonly kind: "construction_intent_admission";
  readonly admissionRef: string;
  readonly candidateId: string;
  readonly episodeId: string;
  readonly selectedBindingRef: string;
  readonly selectedOutcomeRef: string;
  readonly candidateRank: number;
  readonly iterationOrdinal: number;
  readonly basisProjectionRef: string;
  readonly priorIntentId: string | null;
  readonly causationRef: string;
  readonly correlationId: string;
  readonly decision: ConstructionIntentAdmissionDecision;
  readonly rejectionReasonRefs: readonly string[];
  readonly admittedIntent: AdmittedConstructionIntent | null;
}

export interface AdmittedConstructionIntent {
  readonly kind: "admitted_construction_intent";
  readonly intentId: string;
  readonly candidateId: string;
  readonly episodeId: string;
  readonly selectedActionRef: string;
  readonly selectedBindingRef: string;
  readonly selectedOutcomeRef: string;
  readonly iterationOrdinal: number;
  readonly basisProjectionRef: string;
  readonly priorIntentId: string | null;
  readonly causationRef: string;
  readonly selectedGraphFunctionRef: string | null;
  readonly selectedVectorRef: string | null;
  readonly selectedReentryRef: string | null;
  readonly runtimeInvocationPlanRef: string | null;
  readonly lineageRefs: readonly string[];
  readonly authorityRefs: readonly string[];
  readonly admissionDecisionRef: string;
  readonly correlationId: string;
}

export function constructConstructionIntentCandidate(input: {
  readonly candidateId: string;
  readonly episodeId: string;
  readonly rank: number;
  readonly valueScore?: number;
  readonly priorityScore?: number;
  readonly affectAdjustmentRefs?: readonly string[];
  readonly selectedActionRef: string;
  readonly selectedBindingRef: string;
  readonly selectedOutcomeRef: string;
  readonly targetGraphFunctionRef?: string | null;
  readonly targetVectorRef?: string | null;
  readonly targetReentryRef?: string | null;
  readonly inputAssetRefs?: readonly string[];
  readonly expectedOutputAssetRefs?: readonly string[];
  readonly gapRefs?: readonly string[];
  readonly obligationRefs?: readonly string[];
  readonly lawfulBasisRefs?: readonly string[];
  readonly expectedDelta?: string;
  readonly progressCondition?: string;
  readonly stopCondition?: string;
  readonly escalationCondition?: string;
  readonly rejectedAlternativeRefs?: readonly string[];
  readonly rationale?: string;
  readonly hiddenConfigRefs?: readonly string[];
  readonly runtimeEventPayloadRefs?: readonly string[];
  readonly fdSemanticCanonicalizationRequired?: boolean;
}): ConstructionIntentCandidate {
  assertNonEmptyString(input.candidateId, "ConstructionIntentCandidate.candidateId");
  assertNonEmptyString(input.episodeId, "ConstructionIntentCandidate.episodeId");
  assertNonNegativeInteger(input.rank, "ConstructionIntentCandidate.rank");
  const valueScore = input.valueScore ?? 0;
  const priorityScore = input.priorityScore ?? 0;
  assertNonNegativeFiniteNumber(valueScore, "ConstructionIntentCandidate.valueScore");
  assertNonNegativeFiniteNumber(priorityScore, "ConstructionIntentCandidate.priorityScore");
  assertNonEmptyString(
    input.selectedActionRef,
    "ConstructionIntentCandidate.selectedActionRef"
  );
  assertNonEmptyString(
    input.selectedBindingRef,
    "ConstructionIntentCandidate.selectedBindingRef"
  );
  assertNonEmptyString(
    input.selectedOutcomeRef,
    "ConstructionIntentCandidate.selectedOutcomeRef"
  );
  const expectedDelta = input.expectedDelta ?? "delta_expected";
  const progressCondition = input.progressCondition ?? "progress_required";
  const stopCondition = input.stopCondition ?? "stop_when_projection_terminal";
  const escalationCondition = input.escalationCondition ?? "escalate_when_policy_blocks";
  const rationale = input.rationale ?? "selected by construction evaluator";
  assertNonEmptyString(expectedDelta, "ConstructionIntentCandidate.expectedDelta");
  assertNonEmptyString(progressCondition, "ConstructionIntentCandidate.progressCondition");
  assertNonEmptyString(stopCondition, "ConstructionIntentCandidate.stopCondition");
  assertNonEmptyString(escalationCondition, "ConstructionIntentCandidate.escalationCondition");
  assertNonEmptyString(rationale, "ConstructionIntentCandidate.rationale");
  return Object.freeze({
    kind: "construction_intent_candidate",
    candidateId: input.candidateId,
    episodeId: input.episodeId,
    rank: input.rank,
    valueScore,
    priorityScore,
    affectAdjustmentRefs: freezeNonEmptyStrings(
      input.affectAdjustmentRefs ?? [],
      "ConstructionIntentCandidate.affectAdjustmentRefs"
    ),
    selectedActionRef: input.selectedActionRef,
    selectedBindingRef: input.selectedBindingRef,
    selectedOutcomeRef: input.selectedOutcomeRef,
    targetGraphFunctionRef: nullableString(
      input.targetGraphFunctionRef ?? null,
      "ConstructionIntentCandidate.targetGraphFunctionRef"
    ),
    targetVectorRef: nullableString(
      input.targetVectorRef ?? null,
      "ConstructionIntentCandidate.targetVectorRef"
    ),
    targetReentryRef: nullableString(
      input.targetReentryRef ?? null,
      "ConstructionIntentCandidate.targetReentryRef"
    ),
    inputAssetRefs: freezeNonEmptyStrings(
      input.inputAssetRefs ?? [],
      "ConstructionIntentCandidate.inputAssetRefs"
    ),
    expectedOutputAssetRefs: freezeNonEmptyStrings(
      input.expectedOutputAssetRefs ?? [],
      "ConstructionIntentCandidate.expectedOutputAssetRefs"
    ),
    gapRefs: freezeNonEmptyStrings(input.gapRefs ?? [], "ConstructionIntentCandidate.gapRefs"),
    obligationRefs: freezeNonEmptyStrings(
      input.obligationRefs ?? [],
      "ConstructionIntentCandidate.obligationRefs"
    ),
    lawfulBasisRefs: freezeNonEmptyStrings(
      input.lawfulBasisRefs ?? [],
      "ConstructionIntentCandidate.lawfulBasisRefs"
    ),
    expectedDelta,
    progressCondition,
    stopCondition,
    escalationCondition,
    rejectedAlternativeRefs: freezeNonEmptyStrings(
      input.rejectedAlternativeRefs ?? [],
      "ConstructionIntentCandidate.rejectedAlternativeRefs"
    ),
    rationale,
    hiddenConfigRefs: freezeNonEmptyStrings(
      input.hiddenConfigRefs ?? [],
      "ConstructionIntentCandidate.hiddenConfigRefs"
    ),
    runtimeEventPayloadRefs: freezeNonEmptyStrings(
      input.runtimeEventPayloadRefs ?? [],
      "ConstructionIntentCandidate.runtimeEventPayloadRefs"
    ),
    fdSemanticCanonicalizationRequired:
      input.fdSemanticCanonicalizationRequired ?? false
  });
}

interface ConstructionIntentAdmissionRuleInput {
  readonly candidate: ConstructionIntentCandidate;
  readonly observation: ConstructionObservationSnapshot;
  readonly action: ConstructionActionRow | undefined;
  readonly binding: ObservationToActionBindingRow | undefined;
  readonly priorityRow: ConstructionPriorityRow | undefined;
  readonly sourceAssets: ReadonlySet<string>;
}

type ConstructionIntentAdmissionRule = (
  input: ConstructionIntentAdmissionRuleInput
) => readonly string[];

function constructionIntentAdmissionReason(reason: string | null): readonly string[] {
  return reason === null ? Object.freeze([]) : Object.freeze([reason]);
}

function constructionIntentAdmissionReasons(
  reasons: readonly (string | null)[]
): readonly string[] {
  return Object.freeze(
    reasons.filter((reason): reason is string => reason !== null)
  );
}

const CONSTRUCTION_INTENT_ADMISSION_RULES: readonly ConstructionIntentAdmissionRule[] =
  Object.freeze([
    ({ candidate, observation }) =>
      constructionIntentAdmissionReason(
        candidate.episodeId !== observation.episodeId ? "episode_mismatch" : null
      ),
    ({ candidate }) =>
      constructionIntentAdmissionReason(
        candidate.selectedOutcomeRef.length === 0 ? "missing_target_outcome" : null
      ),
    ({ candidate }) =>
      constructionIntentAdmissionReason(
        candidate.hiddenConfigRefs.length > 0 ? "hidden_runtime_config" : null
      ),
    ({ candidate }) =>
      constructionIntentAdmissionReason(
        candidate.runtimeEventPayloadRefs.length > 0
          ? "direct_runtime_event_payload"
          : null
      ),
    ({ candidate }) =>
      constructionIntentAdmissionReason(
        candidate.fdSemanticCanonicalizationRequired
          ? "fd_semantic_canonicalization_without_source_authority"
          : null
      ),
    ({ action }) =>
      constructionIntentAdmissionReason(
        action === undefined ? "action_ref_absent_from_catalog" : null
      ),
    ({ action, candidate }) => {
      if (action === undefined) {
        return Object.freeze([]);
      }
      return constructionIntentAdmissionReasons([
        action.ineligibleReasonRefs.length > 0 ? "action_catalog_row_ineligible" : null,
        action.targetOutcomeRef !== candidate.selectedOutcomeRef
          ? "selected_outcome_contradicts_action"
          : null,
        isConstructiveConstructionActionKind(action.actionKind) &&
        action.graphFunctionRef === null
          ? "graph_function_unavailable_from_gtl_truth"
          : null,
        action.graphVectorRef !== null &&
        isConstructiveConstructionActionKind(action.actionKind) &&
        action.refinementBoundaryRef === null &&
        action.candidateFamilyRef === null &&
        action.publishedTraversalTargetRef === null
          ? "internal_vector_missing_published_traversal_authority"
          : null,
        candidate.targetGraphFunctionRef !== null &&
        action.graphFunctionRef !== candidate.targetGraphFunctionRef
          ? "target_graph_function_contradicts_catalog"
          : null,
        candidate.targetVectorRef !== null &&
        action.graphVectorRef !== candidate.targetVectorRef
          ? "target_vector_contradicts_catalog"
          : null
      ]);
    },
    ({ binding }) =>
      constructionIntentAdmissionReason(
        binding === undefined ? "candidate_without_observation_action_binding" : null
      ),
    ({ binding, candidate }) => {
      if (binding === undefined) {
        return Object.freeze([]);
      }
      return constructionIntentAdmissionReasons([
        binding.actionRef !== candidate.selectedActionRef
          ? "selected_binding_contradicts_action"
          : null,
        binding.targetOutcomeRef !== candidate.selectedOutcomeRef
          ? "selected_binding_contradicts_outcome"
          : null,
        binding.missingInputRefs.length > 0 ? "binding_has_missing_inputs" : null,
        binding.ineligibleReasonRefs.length > 0 ? "binding_ineligible" : null
      ]);
    },
    ({ candidate, sourceAssets }) =>
      Object.freeze(
        candidate.inputAssetRefs
          .filter((assetRef) => !sourceAssets.has(assetRef))
          .map((assetRef) => `source_asset_not_in_observation:${assetRef}`)
      ),
    ({ priorityRow }) =>
      constructionIntentAdmissionReason(
        priorityRow === undefined ? "priority_row_absent_for_binding" : null
      ),
    ({ action, priorityRow }) =>
      constructionIntentAdmissionReason(
        priorityRow !== undefined &&
        action !== undefined &&
        isConstructiveConstructionActionKind(action.actionKind) &&
        priorityRow.terminalDisposition !== "none"
          ? "terminal_priority_projection_blocks_invocation"
          : null
      )
  ]);

function constructionIntentAdmissionRejectionReasons(input: {
  readonly candidate: ConstructionIntentCandidate;
  readonly observation: ConstructionObservationSnapshot;
  readonly actionCatalog: ConstructionActionCatalogProjection;
  readonly bindingProjection: ObservationToActionBindingProjection;
  readonly priorityProjection: ConstructionPriorityProjection;
}): readonly string[] {
  const candidate = input.candidate;
  const action = input.actionCatalog.rows.find(
    (row) => row.actionRef === candidate.selectedActionRef
  );
  const binding = input.bindingProjection.rows.find(
    (row) => row.bindingRef === candidate.selectedBindingRef
  );
  const priorityRow = input.priorityProjection.rows.find(
    (row) => row.bindingRef === candidate.selectedBindingRef
  );
  const sourceAssets = new Set([
    ...input.observation.linkedAssetRefs,
    ...input.observation.passedInputRefs
  ]);
  const ruleInput = Object.freeze({
    candidate,
    observation: input.observation,
    action,
    binding,
    priorityRow,
    sourceAssets
  } satisfies ConstructionIntentAdmissionRuleInput);
  return freezeStringArray(
    CONSTRUCTION_INTENT_ADMISSION_RULES.flatMap((rule) => rule(ruleInput))
  );
}

export function admitConstructionIntentCandidate(input: {
  readonly candidate: ConstructionIntentCandidate;
  readonly observation: ConstructionObservationSnapshot;
  readonly actionCatalog: ConstructionActionCatalogProjection;
  readonly bindingProjection: ObservationToActionBindingProjection;
  readonly priorityProjection: ConstructionPriorityProjection;
}): ConstructionIntentAdmission {
  const candidate = input.candidate;
  const action = input.actionCatalog.rows.find(
    (row) => row.actionRef === candidate.selectedActionRef
  );
  const reasons = constructionIntentAdmissionRejectionReasons(input);
  const admissionRef = `construction-admission:${candidate.episodeId}:${candidate.candidateId}`;
  if (reasons.length > 0 || action === undefined) {
    return Object.freeze({
      kind: "construction_intent_admission",
      admissionRef,
      candidateId: candidate.candidateId,
      episodeId: candidate.episodeId,
      selectedBindingRef: candidate.selectedBindingRef,
      selectedOutcomeRef: candidate.selectedOutcomeRef,
      candidateRank: candidate.rank,
      iterationOrdinal: input.observation.iterationOrdinal,
      basisProjectionRef: input.observation.basisProjectionRef,
      priorIntentId: input.observation.priorIntentId,
      causationRef: input.observation.causationRef,
      correlationId: input.observation.correlationId,
      decision: "rejected",
      rejectionReasonRefs: freezeStringArray(reasons),
      admittedIntent: null
    });
  }
  const lineageRefs = [
    input.observation.observationId,
    input.actionCatalog.catalogRef,
    input.bindingProjection.projectionRef,
    input.priorityProjection.projectionRef,
    candidate.selectedBindingRef
  ];
  const authorityRefs = [
    ...candidate.lawfulBasisRefs,
    ...action.requiredAuthorityRefs,
    input.observation.authorityDigest
  ];
  return Object.freeze({
    kind: "construction_intent_admission",
    admissionRef,
    candidateId: candidate.candidateId,
    episodeId: candidate.episodeId,
    selectedBindingRef: candidate.selectedBindingRef,
    selectedOutcomeRef: candidate.selectedOutcomeRef,
    candidateRank: candidate.rank,
    iterationOrdinal: input.observation.iterationOrdinal,
    basisProjectionRef: input.observation.basisProjectionRef,
    priorIntentId: input.observation.priorIntentId,
    causationRef: input.observation.causationRef,
    correlationId: input.observation.correlationId,
    decision: "admitted",
    rejectionReasonRefs: Object.freeze([]),
    admittedIntent: Object.freeze({
      kind: "admitted_construction_intent",
      intentId: `construction-intent:${candidate.episodeId}:${candidate.candidateId}`,
      candidateId: candidate.candidateId,
      episodeId: candidate.episodeId,
      selectedActionRef: candidate.selectedActionRef,
      selectedBindingRef: candidate.selectedBindingRef,
      selectedOutcomeRef: candidate.selectedOutcomeRef,
      iterationOrdinal: input.observation.iterationOrdinal,
      basisProjectionRef: input.observation.basisProjectionRef,
      priorIntentId: input.observation.priorIntentId,
      causationRef: input.observation.causationRef,
      selectedGraphFunctionRef: action.graphFunctionRef,
      selectedVectorRef: action.graphVectorRef,
      selectedReentryRef: candidate.targetReentryRef,
      runtimeInvocationPlanRef: isConstructiveConstructionActionKind(action.actionKind)
        ? `runtime-invocation-plan:${candidate.episodeId}:${candidate.candidateId}`
        : null,
      lineageRefs: freezeStringArray(lineageRefs),
      authorityRefs: freezeStringArray(authorityRefs),
      admissionDecisionRef: admissionRef,
      correlationId: input.observation.correlationId
    })
  });
}

export function selectAdmittedConstructionIntentByPriority(input: {
  readonly admissions: readonly ConstructionIntentAdmission[];
  readonly priorityProjection: ConstructionPriorityProjection;
}): AdmittedConstructionIntent | null {
  const rankRows = new Map(
    input.priorityProjection.rows.map((row) => [row.bindingRef, row])
  );
  const admitted = input.admissions.filter(
    (admission): admission is ConstructionIntentAdmission & {
      readonly admittedIntent: AdmittedConstructionIntent;
    } => admission.admittedIntent !== null
  );
  if (admitted.length === 0) {
    return null;
  }
  const ranked = admitted.map((admission) => {
    const priorityRow = rankRows.get(admission.selectedBindingRef);
    if (priorityRow === undefined) {
      throw new TypeError(
        `Admitted construction intent ${JSON.stringify(admission.candidateId)} lacks a priority row`
      );
    }
    return Object.freeze({
      admission,
      priorityRow
    });
  });
  ranked.sort((left, right) => {
    if (left.priorityRow.rankOrdinal !== right.priorityRow.rankOrdinal) {
      return left.priorityRow.rankOrdinal - right.priorityRow.rankOrdinal;
    }
    if (left.admission.candidateRank !== right.admission.candidateRank) {
      return left.admission.candidateRank - right.admission.candidateRank;
    }
    const outcomeComparison = left.admission.selectedOutcomeRef.localeCompare(
      right.admission.selectedOutcomeRef
    );
    if (outcomeComparison !== 0) {
      return outcomeComparison;
    }
    const actionComparison =
      left.admission.admittedIntent.selectedActionRef.localeCompare(
        right.admission.admittedIntent.selectedActionRef
      );
    if (actionComparison !== 0) {
      return actionComparison;
    }
    return left.admission.candidateId.localeCompare(right.admission.candidateId);
  });
  return ranked[0]?.admission.admittedIntent ?? null;
}
