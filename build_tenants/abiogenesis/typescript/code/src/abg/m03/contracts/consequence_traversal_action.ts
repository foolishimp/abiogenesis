// Implements: T-152
// Implements: REQ-R-ABG3-FP-CONSCIOUSNESS

import {
  CONSTRUCTIVE_CONSTRUCTION_ACTION_KIND_VALUES,
  type ConstructionActionKind
} from "./construction_action_kinds.js";
import {
  constructConstructionActionRow,
  type ConstructionActionRow,
  type ObservationToActionBindingRow
} from "./construction_action_catalog.js";
import {
  constructConstructionIntentCandidate,
  type ConstructionIntentCandidate
} from "./construction_intent.js";
import type { ConstructionPriorityRow } from "./construction_priority.js";
import {
  assertNonEmptyString
} from "./runtime_support.js";
import {
  assertAllowedString,
  assertPlainRecord,
  freezeNonEmptyStrings,
  nullableString,
  optionalStringArrayField,
  requiredStringField
} from "./construction_validation.js";
import { assertNoEngineAuthorityFields } from "../../../shared/engine_authority_fields.js";
import {
  ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILY_VALUES,
  admitConsequenceTraversalActionAgainstAllowedCatalog,
  type AllowedConsequenceTraversalAdmission,
  type AllowedConsequenceTraversalCatalog,
  type AllowedConsequenceTraversalFamily
} from "./allowed_consequence_traversal_catalog.js";

export const CONSEQUENCE_TRAVERSAL_ACTION_KIND_VALUES = Object.freeze([
  ...CONSTRUCTIVE_CONSTRUCTION_ACTION_KIND_VALUES,
  "non_admit"
] as const);

export type ConsequenceTraversalActionKind =
  (typeof CONSEQUENCE_TRAVERSAL_ACTION_KIND_VALUES)[number];

export interface ConsequenceTraversalAction {
  readonly kind: "consequence_traversal_action";
  readonly actionRef: string;
  readonly consequenceRef: string;
  readonly strategyDecisionRef: string;
  readonly parentObligationRef: string;
  readonly actionKind: ConsequenceTraversalActionKind;
  readonly selectedTraversalFamily: AllowedConsequenceTraversalFamily | null;
  readonly selectedGraphFunctionRef: string | null;
  readonly selectedOverlayRef: string | null;
  readonly selectedCandidateFamilyRef: string | null;
  readonly selectedRefinementBoundaryRef: string | null;
  readonly selectedTraversalTargetRef: string | null;
  readonly sourceNodeRef: string;
  readonly targetNodeRef: string;
  readonly graphVectorRef: string | null;
  readonly graphSpanRef: string | null;
  readonly reentryTargetRef: string | null;
  readonly targetOutcomeRef: string;
  readonly inputAssetRefs: readonly string[];
  readonly expectedOutputAssetRefs: readonly string[];
  readonly requiredAuthorityRefs: readonly string[];
  readonly proportionalityBasisRefs: readonly string[];
  readonly evidencePolicyRef: string;
  readonly foldbackPolicyRef: string;
  readonly nonAdmissionReasonRefs: readonly string[];
}

function optionalNullableStringField(
  record: Readonly<Record<string, unknown>>,
  key: string,
  label: string
): string | null {
  const value = record[key];
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label}.${key} must be null or a non-empty string`);
  }
  return value;
}

function assertExecutableConsequenceAction(action: ConsequenceTraversalAction): void {
  if (action.actionKind === "non_admit") {
    return;
  }
  if (action.selectedGraphFunctionRef === null) {
    throw new TypeError(
      "ConsequenceTraversalAction.selectedGraphFunctionRef is required for executable actions"
    );
  }
  if (action.requiredAuthorityRefs.length === 0) {
    throw new TypeError(
      "ConsequenceTraversalAction.requiredAuthorityRefs is required for executable actions"
    );
  }
  if (
    action.graphVectorRef !== null &&
    action.selectedRefinementBoundaryRef === null &&
    action.selectedCandidateFamilyRef === null &&
    action.selectedTraversalTargetRef === null
  ) {
    throw new TypeError(
      "ConsequenceTraversalAction targeting an internal graph vector requires refinement boundary, candidate family, or published traversal target authority"
    );
  }
  if (action.actionKind === "reenter_graph_span") {
    if (action.graphVectorRef === null) {
      throw new TypeError(
        "ConsequenceTraversalAction.graphVectorRef is required for reenter_graph_span"
      );
    }
    if (action.reentryTargetRef === null) {
      throw new TypeError(
        "ConsequenceTraversalAction.reentryTargetRef is required for reenter_graph_span"
      );
    }
  }
}

function executableConstructionActionKind(
  actionKind: ConsequenceTraversalActionKind
): ConstructionActionKind {
  if (actionKind === "non_admit") {
    throw new TypeError(
      "A non_admit consequence traversal action cannot be projected into construction execution"
    );
  }
  return actionKind;
}

export function constructConsequenceTraversalAction(input: {
  readonly actionRef: string;
  readonly consequenceRef: string;
  readonly strategyDecisionRef: string;
  readonly parentObligationRef: string;
  readonly actionKind: ConsequenceTraversalActionKind;
  readonly selectedTraversalFamily?: AllowedConsequenceTraversalFamily | null;
  readonly selectedGraphFunctionRef?: string | null;
  readonly selectedOverlayRef?: string | null;
  readonly selectedCandidateFamilyRef?: string | null;
  readonly selectedRefinementBoundaryRef?: string | null;
  readonly selectedTraversalTargetRef?: string | null;
  readonly sourceNodeRef: string;
  readonly targetNodeRef: string;
  readonly graphVectorRef?: string | null;
  readonly graphSpanRef?: string | null;
  readonly reentryTargetRef?: string | null;
  readonly targetOutcomeRef: string;
  readonly inputAssetRefs?: readonly string[];
  readonly expectedOutputAssetRefs?: readonly string[];
  readonly requiredAuthorityRefs?: readonly string[];
  readonly proportionalityBasisRefs?: readonly string[];
  readonly evidencePolicyRef: string;
  readonly foldbackPolicyRef: string;
  readonly nonAdmissionReasonRefs?: readonly string[];
}): ConsequenceTraversalAction {
  assertNonEmptyString(input.actionRef, "ConsequenceTraversalAction.actionRef");
  assertNonEmptyString(input.consequenceRef, "ConsequenceTraversalAction.consequenceRef");
  assertNonEmptyString(
    input.strategyDecisionRef,
    "ConsequenceTraversalAction.strategyDecisionRef"
  );
  assertNonEmptyString(
    input.parentObligationRef,
    "ConsequenceTraversalAction.parentObligationRef"
  );
  const actionKind = assertAllowedString(
    input.actionKind,
    CONSEQUENCE_TRAVERSAL_ACTION_KIND_VALUES,
    "ConsequenceTraversalAction.actionKind"
  );
  assertNonEmptyString(input.sourceNodeRef, "ConsequenceTraversalAction.sourceNodeRef");
  assertNonEmptyString(input.targetNodeRef, "ConsequenceTraversalAction.targetNodeRef");
  assertNonEmptyString(
    input.targetOutcomeRef,
    "ConsequenceTraversalAction.targetOutcomeRef"
  );
  assertNonEmptyString(
    input.evidencePolicyRef,
    "ConsequenceTraversalAction.evidencePolicyRef"
  );
  assertNonEmptyString(
    input.foldbackPolicyRef,
    "ConsequenceTraversalAction.foldbackPolicyRef"
  );
  const action = Object.freeze({
    kind: "consequence_traversal_action",
    actionRef: input.actionRef,
    consequenceRef: input.consequenceRef,
    strategyDecisionRef: input.strategyDecisionRef,
    parentObligationRef: input.parentObligationRef,
    actionKind,
    selectedTraversalFamily:
      input.selectedTraversalFamily === undefined ||
      input.selectedTraversalFamily === null
        ? null
        : assertAllowedString(
            input.selectedTraversalFamily,
            ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILY_VALUES,
            "ConsequenceTraversalAction.selectedTraversalFamily"
          ),
    selectedGraphFunctionRef: nullableString(
      input.selectedGraphFunctionRef ?? null,
      "ConsequenceTraversalAction.selectedGraphFunctionRef"
    ),
    selectedOverlayRef: nullableString(
      input.selectedOverlayRef ?? null,
      "ConsequenceTraversalAction.selectedOverlayRef"
    ),
    selectedCandidateFamilyRef: nullableString(
      input.selectedCandidateFamilyRef ?? null,
      "ConsequenceTraversalAction.selectedCandidateFamilyRef"
    ),
    selectedRefinementBoundaryRef: nullableString(
      input.selectedRefinementBoundaryRef ?? null,
      "ConsequenceTraversalAction.selectedRefinementBoundaryRef"
    ),
    selectedTraversalTargetRef: nullableString(
      input.selectedTraversalTargetRef ?? null,
      "ConsequenceTraversalAction.selectedTraversalTargetRef"
    ),
    sourceNodeRef: input.sourceNodeRef,
    targetNodeRef: input.targetNodeRef,
    graphVectorRef: nullableString(
      input.graphVectorRef ?? null,
      "ConsequenceTraversalAction.graphVectorRef"
    ),
    graphSpanRef: nullableString(
      input.graphSpanRef ?? null,
      "ConsequenceTraversalAction.graphSpanRef"
    ),
    reentryTargetRef: nullableString(
      input.reentryTargetRef ?? null,
      "ConsequenceTraversalAction.reentryTargetRef"
    ),
    targetOutcomeRef: input.targetOutcomeRef,
    inputAssetRefs: freezeNonEmptyStrings(
      input.inputAssetRefs ?? [],
      "ConsequenceTraversalAction.inputAssetRefs"
    ),
    expectedOutputAssetRefs: freezeNonEmptyStrings(
      input.expectedOutputAssetRefs ?? [],
      "ConsequenceTraversalAction.expectedOutputAssetRefs"
    ),
    requiredAuthorityRefs: freezeNonEmptyStrings(
      input.requiredAuthorityRefs ?? [],
      "ConsequenceTraversalAction.requiredAuthorityRefs"
    ),
    proportionalityBasisRefs: freezeNonEmptyStrings(
      input.proportionalityBasisRefs ?? [],
      "ConsequenceTraversalAction.proportionalityBasisRefs"
    ),
    evidencePolicyRef: input.evidencePolicyRef,
    foldbackPolicyRef: input.foldbackPolicyRef,
    nonAdmissionReasonRefs: freezeNonEmptyStrings(
      input.nonAdmissionReasonRefs ?? [],
      "ConsequenceTraversalAction.nonAdmissionReasonRefs"
    )
  } satisfies ConsequenceTraversalAction);
  assertExecutableConsequenceAction(action);
  return action;
}

export function admitConsequenceTraversalAction(
  input: unknown,
  label = "ConsequenceTraversalAction"
): ConsequenceTraversalAction {
  const record = assertPlainRecord(input, label);
  assertNoEngineAuthorityFields(
    record,
    label,
    "consequence traversal action cannot own engine authority"
  );
  if (record["kind"] !== "consequence_traversal_action") {
    throw new TypeError(`${label}.kind must be consequence_traversal_action`);
  }
  const selectedTraversalFamily = optionalNullableStringField(
    record,
    "selectedTraversalFamily",
    label
  );
  return constructConsequenceTraversalAction({
    actionRef: requiredStringField(record, "actionRef", label),
    consequenceRef: requiredStringField(record, "consequenceRef", label),
    strategyDecisionRef: requiredStringField(record, "strategyDecisionRef", label),
    parentObligationRef: requiredStringField(record, "parentObligationRef", label),
    actionKind: assertAllowedString(
      requiredStringField(record, "actionKind", label),
      CONSEQUENCE_TRAVERSAL_ACTION_KIND_VALUES,
      `${label}.actionKind`
    ),
    selectedTraversalFamily:
      selectedTraversalFamily === null
        ? null
        : assertAllowedString(
            selectedTraversalFamily,
            ALLOWED_CONSEQUENCE_TRAVERSAL_FAMILY_VALUES,
            `${label}.selectedTraversalFamily`
          ),
    selectedGraphFunctionRef: optionalNullableStringField(
      record,
      "selectedGraphFunctionRef",
      label
    ),
    selectedOverlayRef: optionalNullableStringField(record, "selectedOverlayRef", label),
    selectedCandidateFamilyRef: optionalNullableStringField(
      record,
      "selectedCandidateFamilyRef",
      label
    ),
    selectedRefinementBoundaryRef: optionalNullableStringField(
      record,
      "selectedRefinementBoundaryRef",
      label
    ),
    selectedTraversalTargetRef: optionalNullableStringField(
      record,
      "selectedTraversalTargetRef",
      label
    ),
    sourceNodeRef: requiredStringField(record, "sourceNodeRef", label),
    targetNodeRef: requiredStringField(record, "targetNodeRef", label),
    graphVectorRef: optionalNullableStringField(record, "graphVectorRef", label),
    graphSpanRef: optionalNullableStringField(record, "graphSpanRef", label),
    reentryTargetRef: optionalNullableStringField(record, "reentryTargetRef", label),
    targetOutcomeRef: requiredStringField(record, "targetOutcomeRef", label),
    inputAssetRefs: optionalStringArrayField(record, "inputAssetRefs", label),
    expectedOutputAssetRefs: optionalStringArrayField(
      record,
      "expectedOutputAssetRefs",
      label
    ),
    requiredAuthorityRefs: optionalStringArrayField(
      record,
      "requiredAuthorityRefs",
      label
    ),
    proportionalityBasisRefs: optionalStringArrayField(
      record,
      "proportionalityBasisRefs",
      label
    ),
    evidencePolicyRef: requiredStringField(record, "evidencePolicyRef", label),
    foldbackPolicyRef: requiredStringField(record, "foldbackPolicyRef", label),
    nonAdmissionReasonRefs: optionalStringArrayField(
      record,
      "nonAdmissionReasonRefs",
      label
    )
  });
}

export function admitConsequenceTraversalActionForAllowedCatalog(input: {
  readonly catalog: AllowedConsequenceTraversalCatalog;
  readonly action: ConsequenceTraversalAction;
}): AllowedConsequenceTraversalAdmission {
  return admitConsequenceTraversalActionAgainstAllowedCatalog({
    catalog: input.catalog,
    action: input.action
  });
}

export function constructConstructionActionRowFromConsequenceTraversalAction(
  action: ConsequenceTraversalAction
): ConstructionActionRow {
  const actionKind = executableConstructionActionKind(action.actionKind);
  return constructConstructionActionRow({
    actionRef: action.actionRef,
    actionKind,
    graphFunctionRef: action.selectedGraphFunctionRef,
    graphVectorRef: action.graphVectorRef,
    refinementBoundaryRef: action.selectedRefinementBoundaryRef,
    candidateFamilyRef: action.selectedCandidateFamilyRef,
    publishedTraversalTargetRef: action.selectedTraversalTargetRef,
    targetOutcomeRef: action.targetOutcomeRef,
    inputAssetRefs: action.inputAssetRefs,
    expectedOutputAssetRefs: action.expectedOutputAssetRefs,
    requiredAuthorityRefs: action.requiredAuthorityRefs,
    eligibleReasonRefs: [
      action.consequenceRef,
      action.strategyDecisionRef,
      ...[action.graphSpanRef].filter((ref): ref is string => ref !== null),
      ...action.proportionalityBasisRefs
    ],
    hookSourceRefs: [
      ...[action.selectedOverlayRef, action.graphSpanRef].filter(
        (ref): ref is string => ref !== null
      )
    ],
    defaultPolicyRefs: [action.evidencePolicyRef, action.foldbackPolicyRef]
  });
}

export function constructConstructionIntentCandidateFromConsequenceTraversalAction(input: {
  readonly action: ConsequenceTraversalAction;
  readonly episodeId: string;
  readonly bindingRow: ObservationToActionBindingRow;
  readonly priorityRow: ConstructionPriorityRow;
  readonly candidateId?: string | undefined;
  readonly valueScore?: number | undefined;
  readonly priorityScore?: number | undefined;
}): ConstructionIntentCandidate {
  executableConstructionActionKind(input.action.actionKind);
  assertNonEmptyString(input.episodeId, "ConsequenceTraversalBridge.episodeId");
  if (input.bindingRow.actionRef !== input.action.actionRef) {
    throw new TypeError(
      "ConsequenceTraversalBridge binding row must target the consequence action"
    );
  }
  if (input.bindingRow.targetOutcomeRef !== input.action.targetOutcomeRef) {
    throw new TypeError(
      "ConsequenceTraversalBridge binding row must target the consequence outcome"
    );
  }
  if (input.priorityRow.bindingRef !== input.bindingRow.bindingRef) {
    throw new TypeError(
      "ConsequenceTraversalBridge priority row must rank the selected binding"
    );
  }
  if (input.priorityRow.actionRef !== input.action.actionRef) {
    throw new TypeError(
      "ConsequenceTraversalBridge priority row must rank the consequence action"
    );
  }
  const targetReentryRef =
    input.action.reentryTargetRef ?? input.bindingRow.targetReentryRef;
  return constructConstructionIntentCandidate({
    candidateId:
      input.candidateId ??
      `${input.action.actionRef}:candidate:${input.priorityRow.rankOrdinal}`,
    episodeId: input.episodeId,
    rank: input.priorityRow.rankOrdinal,
    valueScore: input.valueScore ?? input.priorityRow.finalScore,
    priorityScore: input.priorityScore ?? input.priorityRow.finalScore,
    affectAdjustmentRefs: input.priorityRow.affectAdjustmentRefs,
    selectedActionRef: input.action.actionRef,
    selectedBindingRef: input.bindingRow.bindingRef,
    selectedOutcomeRef: input.bindingRow.targetOutcomeRef,
    targetGraphFunctionRef: input.action.selectedGraphFunctionRef,
    targetVectorRef: input.action.graphVectorRef,
    targetReentryRef,
    inputAssetRefs: input.action.inputAssetRefs,
    expectedOutputAssetRefs: input.action.expectedOutputAssetRefs,
    gapRefs: [
      input.action.consequenceRef,
      input.action.strategyDecisionRef,
      ...[input.action.graphSpanRef].filter((ref): ref is string => ref !== null)
    ],
    obligationRefs: [input.action.parentObligationRef],
    lawfulBasisRefs: input.action.requiredAuthorityRefs,
    rejectedAlternativeRefs: input.action.nonAdmissionReasonRefs,
    rationale: `selected by consequence traversal action ${input.action.actionRef}`
  });
}
