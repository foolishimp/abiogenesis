// Implements: T-140
// Implements: REQ-R-ABG3-FP-CONSCIOUSNESS

import type { ConstructionObservationSnapshot } from "./construction_observation.js";
import {
  CONSTRUCTION_ACTION_KIND_VALUES,
  isConstructiveConstructionActionKind,
  type ConstructionActionKind
} from "./construction_action_kinds.js";
import {
  assertNonEmptyString,
  freezeStringArray
} from "./runtime_support.js";
import {
  assertAllowedString,
  freezeNonEmptyStrings,
  intersects,
  nullableString
} from "./construction_validation.js";

export interface ConstructionActionCatalogProjection {
  readonly kind: "construction_action_catalog_projection";
  readonly catalogRef: string;
  readonly episodeId: string;
  readonly hookResolutionRef: string;
  readonly fallbackConfigDigest: string;
  readonly rows: readonly ConstructionActionRow[];
}

export interface ConstructionActionRow {
  readonly kind: "construction_action_row";
  readonly actionRef: string;
  readonly actionKind: ConstructionActionKind;
  readonly graphFunctionRef: string | null;
  readonly graphVectorRef: string | null;
  readonly refinementBoundaryRef: string | null;
  readonly candidateFamilyRef: string | null;
  readonly publishedTraversalTargetRef: string | null;
  readonly targetOutcomeRef: string;
  readonly inputAssetRefs: readonly string[];
  readonly expectedOutputAssetRefs: readonly string[];
  readonly requiredAuthorityRefs: readonly string[];
  readonly eligibleReasonRefs: readonly string[];
  readonly ineligibleReasonRefs: readonly string[];
  readonly hookSourceRefs: readonly string[];
  readonly defaultPolicyRefs: readonly string[];
}

export interface ObservationToActionBindingProjection {
  readonly kind: "observation_to_action_binding_projection";
  readonly projectionRef: string;
  readonly episodeId: string;
  readonly observationId: string;
  readonly catalogRef: string;
  readonly rows: readonly ObservationToActionBindingRow[];
}

export interface ObservationToActionBindingRow {
  readonly kind: "observation_to_action_binding_row";
  readonly bindingRef: string;
  readonly pressureRef: string;
  readonly actionRef: string;
  readonly targetOutcomeRef: string;
  readonly providedOutputRefs: readonly string[];
  readonly requiredInputRefs: readonly string[];
  readonly availableInputRefs: readonly string[];
  readonly missingInputRefs: readonly string[];
  readonly matchReasonRefs: readonly string[];
  readonly ineligibleReasonRefs: readonly string[];
  readonly bindingScore: number;
}

export function constructConstructionActionRow(input: {
  readonly actionRef: string;
  readonly actionKind: ConstructionActionKind;
  readonly graphFunctionRef?: string | null;
  readonly graphVectorRef?: string | null;
  readonly refinementBoundaryRef?: string | null;
  readonly candidateFamilyRef?: string | null;
  readonly publishedTraversalTargetRef?: string | null;
  readonly targetOutcomeRef: string;
  readonly inputAssetRefs?: readonly string[];
  readonly expectedOutputAssetRefs?: readonly string[];
  readonly requiredAuthorityRefs?: readonly string[];
  readonly eligibleReasonRefs?: readonly string[];
  readonly ineligibleReasonRefs?: readonly string[];
  readonly hookSourceRefs?: readonly string[];
  readonly defaultPolicyRefs?: readonly string[];
}): ConstructionActionRow {
  assertNonEmptyString(input.actionRef, "ConstructionActionRow.actionRef");
  assertAllowedString(
    input.actionKind,
    CONSTRUCTION_ACTION_KIND_VALUES,
    "ConstructionActionRow.actionKind"
  );
  assertNonEmptyString(input.targetOutcomeRef, "ConstructionActionRow.targetOutcomeRef");
  const graphFunctionRef = nullableString(
    input.graphFunctionRef ?? null,
    "ConstructionActionRow.graphFunctionRef"
  );
  const graphVectorRef = nullableString(
    input.graphVectorRef ?? null,
    "ConstructionActionRow.graphVectorRef"
  );
  const refinementBoundaryRef = nullableString(
    input.refinementBoundaryRef ?? null,
    "ConstructionActionRow.refinementBoundaryRef"
  );
  const candidateFamilyRef = nullableString(
    input.candidateFamilyRef ?? null,
    "ConstructionActionRow.candidateFamilyRef"
  );
  const publishedTraversalTargetRef = nullableString(
    input.publishedTraversalTargetRef ?? null,
    "ConstructionActionRow.publishedTraversalTargetRef"
  );
  if (
    graphVectorRef !== null &&
    isConstructiveConstructionActionKind(input.actionKind) &&
    refinementBoundaryRef === null &&
    candidateFamilyRef === null &&
    publishedTraversalTargetRef === null
  ) {
    throw new TypeError(
      "ConstructionActionRow targeting an internal graph vector requires RefinementBoundary, CandidateFamily, or published traversal target authority"
    );
  }
  return Object.freeze({
    kind: "construction_action_row",
    actionRef: input.actionRef,
    actionKind: input.actionKind,
    graphFunctionRef,
    graphVectorRef,
    refinementBoundaryRef,
    candidateFamilyRef,
    publishedTraversalTargetRef,
    targetOutcomeRef: input.targetOutcomeRef,
    inputAssetRefs: freezeNonEmptyStrings(
      input.inputAssetRefs ?? [],
      "ConstructionActionRow.inputAssetRefs"
    ),
    expectedOutputAssetRefs: freezeNonEmptyStrings(
      input.expectedOutputAssetRefs ?? [],
      "ConstructionActionRow.expectedOutputAssetRefs"
    ),
    requiredAuthorityRefs: freezeNonEmptyStrings(
      input.requiredAuthorityRefs ?? [],
      "ConstructionActionRow.requiredAuthorityRefs"
    ),
    eligibleReasonRefs: freezeNonEmptyStrings(
      input.eligibleReasonRefs ?? [],
      "ConstructionActionRow.eligibleReasonRefs"
    ),
    ineligibleReasonRefs: freezeNonEmptyStrings(
      input.ineligibleReasonRefs ?? [],
      "ConstructionActionRow.ineligibleReasonRefs"
    ),
    hookSourceRefs: freezeNonEmptyStrings(
      input.hookSourceRefs ?? [],
      "ConstructionActionRow.hookSourceRefs"
    ),
    defaultPolicyRefs: freezeNonEmptyStrings(
      input.defaultPolicyRefs ?? [],
      "ConstructionActionRow.defaultPolicyRefs"
    )
  });
}

export function constructConstructionActionRefForTraversalTarget(input: {
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
}): string {
  assertNonEmptyString(
    input.graphFunctionRef,
    "ConstructionActionRef.graphFunctionRef"
  );
  assertNonEmptyString(
    input.graphVectorRef,
    "ConstructionActionRef.graphVectorRef"
  );
  return [
    "construction-action",
    input.graphFunctionRef,
    input.graphVectorRef
  ].join(":");
}

export function constructConstructionActionCatalogProjection(input: {
  readonly catalogRef: string;
  readonly episodeId: string;
  readonly hookResolutionRef: string;
  readonly fallbackConfigDigest: string;
  readonly rows: readonly ConstructionActionRow[];
}): ConstructionActionCatalogProjection {
  assertNonEmptyString(input.catalogRef, "ConstructionActionCatalogProjection.catalogRef");
  assertNonEmptyString(input.episodeId, "ConstructionActionCatalogProjection.episodeId");
  assertNonEmptyString(
    input.hookResolutionRef,
    "ConstructionActionCatalogProjection.hookResolutionRef"
  );
  assertNonEmptyString(
    input.fallbackConfigDigest,
    "ConstructionActionCatalogProjection.fallbackConfigDigest"
  );
  const actionRefs = new Set<string>();
  for (const row of input.rows) {
    if (actionRefs.has(row.actionRef)) {
      throw new TypeError(
        `ConstructionActionCatalogProjection has duplicate actionRef ${JSON.stringify(row.actionRef)}`
      );
    }
    actionRefs.add(row.actionRef);
  }
  return Object.freeze({
    kind: "construction_action_catalog_projection",
    catalogRef: input.catalogRef,
    episodeId: input.episodeId,
    hookResolutionRef: input.hookResolutionRef,
    fallbackConfigDigest: input.fallbackConfigDigest,
    rows: Object.freeze([...input.rows])
  });
}

export function deriveObservationToActionBindingProjection(input: {
  readonly observation: ConstructionObservationSnapshot;
  readonly actionCatalog: ConstructionActionCatalogProjection;
  readonly availableInputRefs?: readonly string[];
}): ObservationToActionBindingProjection {
  if (input.observation.episodeId !== input.actionCatalog.episodeId) {
    throw new TypeError("Observation/action catalog episode mismatch");
  }
  const availableInputRefs = freezeNonEmptyStrings(
    [
      ...input.observation.passedInputRefs,
      ...input.observation.linkedAssetRefs,
      ...(input.availableInputRefs ?? [])
    ],
    "deriveObservationToActionBindingProjection.availableInputRefs"
  );
  const available = new Set(availableInputRefs);
  const rows: ObservationToActionBindingRow[] = [];
  for (const pressure of input.observation.pressureRows) {
    for (const action of input.actionCatalog.rows) {
      if (!pressure.targetOutcomeRefs.includes(action.targetOutcomeRef)) {
        continue;
      }
      if (
        pressure.pressureKind === "affect_signal" &&
        isConstructiveConstructionActionKind(action.actionKind)
      ) {
        continue;
      }
      if (
        pressure.pressureKind === "admitted_error" &&
        pressure.affectedAssetRefs.length > 0 &&
        !intersects(pressure.affectedAssetRefs, [
          ...action.inputAssetRefs,
          ...action.expectedOutputAssetRefs
        ])
      ) {
        continue;
      }
      if (
        pressure.pressureKind === "gap_row" &&
        pressure.affectedAssetRefs.length > 0 &&
        !intersects(pressure.affectedAssetRefs, action.expectedOutputAssetRefs)
      ) {
        continue;
      }
      const missingInputRefs = action.inputAssetRefs.filter((ref) => !available.has(ref));
      const ineligibleReasonRefs = [
        ...action.ineligibleReasonRefs,
        ...missingInputRefs.map((ref) => `missing_input:${ref}`)
      ];
      const matchReasonRefs = [
        `pressure:${pressure.pressureKind}`,
        `outcome:${action.targetOutcomeRef}`,
        ...pressure.evidenceRefs.map((ref) => `evidence:${ref}`)
      ];
      const bindingScore = Math.max(
        0,
        1 + pressure.severity + action.expectedOutputAssetRefs.length - missingInputRefs.length
      );
      rows.push(
        Object.freeze({
          kind: "observation_to_action_binding_row",
          bindingRef: [
            "construction-binding",
            input.observation.episodeId,
            pressure.pressureRef,
            action.actionRef
          ].join(":"),
          pressureRef: pressure.pressureRef,
          actionRef: action.actionRef,
          targetOutcomeRef: action.targetOutcomeRef,
          providedOutputRefs: freezeStringArray(action.expectedOutputAssetRefs),
          requiredInputRefs: freezeStringArray(action.inputAssetRefs),
          availableInputRefs: freezeStringArray(availableInputRefs),
          missingInputRefs: freezeStringArray(missingInputRefs),
          matchReasonRefs: freezeStringArray(matchReasonRefs),
          ineligibleReasonRefs: freezeStringArray(ineligibleReasonRefs),
          bindingScore
        })
      );
    }
  }
  return Object.freeze({
    kind: "observation_to_action_binding_projection",
    projectionRef: `construction-binding-projection:${input.observation.episodeId}:${input.observation.observationId}`,
    episodeId: input.observation.episodeId,
    observationId: input.observation.observationId,
    catalogRef: input.actionCatalog.catalogRef,
    rows: Object.freeze(rows.sort((left, right) => left.bindingRef.localeCompare(right.bindingRef)))
  });
}
