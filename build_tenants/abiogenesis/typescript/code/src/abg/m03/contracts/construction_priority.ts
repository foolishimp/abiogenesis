// Implements: T-140
// Implements: REQ-R-ABG3-FP-CONSCIOUSNESS
// Implements: REQ-R-ABG3-PROJECTION

import {
  CONSTRUCTION_ACTION_KIND_VALUES,
  type ConstructionActionKind
} from "./construction_action_kinds.js";
import type {
  ConstructionActionCatalogProjection,
  ObservationToActionBindingProjection
} from "./construction_action_catalog.js";
import {
  CONSTRUCTION_AFFECT_SIGNAL_KIND_VALUES,
  type ConstructionAffectSignalKind,
  type ConstructionObservationSnapshot,
  type ObservationPressureRow
} from "./construction_observation.js";
import type { ConstructionHookResolution } from "./construction_hook_resolution.js";
import {
  assertNonEmptyString,
  freezeStringArray
} from "./runtime_support.js";
import {
  assertAllowedString,
  assertNonNegativeFiniteNumber,
  assertNullableNonNegativeFiniteNumber,
  assertPlainRecord,
  freezeNonEmptyStrings,
  matchesOptionalActionKinds,
  matchesOptionalStrings,
  optionalNullableNumberField,
  optionalNumberConfigByAliases,
  optionalNumberField,
  optionalStringArrayConfigByAliases,
  optionalStringArrayField,
  optionalStringConfigByAliases,
  requiredStringField
} from "./construction_validation.js";
import { stableSha256HexDigest as stableDigest } from "../../../shared/runtime_identity.js";

export const CONSTRUCTION_PRIORITY_AXIS_VALUES = Object.freeze([
  "steel_thread",
  "full_breadth",
  "gap_repair",
  "danger_first",
  "operator_requested",
  "release_blocking",
  "deadline_sensitive",
  "workspace_risk",
  "highest_expected_delta",
  "lowest_missing_binding",
  "least_recently_attempted"
] as const);

export type ConstructionPriorityAxis =
  (typeof CONSTRUCTION_PRIORITY_AXIS_VALUES)[number];

export const AFFECT_PRIORITY_ADJUSTMENT_VALUES = Object.freeze([
  "boost",
  "attenuate",
  "force_review",
  "request_fh_input",
  "escalate"
] as const);

export type AffectPriorityAdjustmentKind =
  (typeof AFFECT_PRIORITY_ADJUSTMENT_VALUES)[number];

export const CONSTRUCTION_TERMINAL_DISPOSITION_VALUES = Object.freeze([
  "none",
  "force_review",
  "request_fh_input",
  "escalate"
] as const);

export type ConstructionTerminalDisposition =
  (typeof CONSTRUCTION_TERMINAL_DISPOSITION_VALUES)[number];

export interface ConstructionPriorityScheme {
  readonly kind: "construction_priority_scheme";
  readonly schemeRef: string;
  readonly sourcePolicyRef: string;
  readonly rules: readonly ConstructionPriorityRule[];
}

export interface ConstructionPriorityRule {
  readonly kind: "construction_priority_rule";
  readonly priorityRuleRef: string;
  readonly axis: ConstructionPriorityAxis;
  readonly weight: number;
  readonly appliesToActionKinds: readonly ConstructionActionKind[];
  readonly appliesToOutcomeRefs: readonly string[];
  readonly sourcePolicyRef: string;
  readonly strategyLabel: string;
}

export interface AffectPriorityPolicy {
  readonly kind: "affect_priority_policy";
  readonly policyRef: string;
  readonly signalKind: ConstructionAffectSignalKind;
  readonly appliesToOutcomeRefs: readonly string[];
  readonly appliesToActionKinds: readonly ConstructionActionKind[];
  readonly boostWeight: number;
  readonly attenuationWeight: number;
  readonly forceReviewThreshold: number | null;
  readonly fhInputThreshold: number | null;
  readonly escalationThreshold: number | null;
  readonly terminalRouteRefs: readonly string[];
  readonly sourcePolicyRef: string;
}

export interface AffectPriorityAdjustment {
  readonly kind: "affect_priority_adjustment";
  readonly affectRef: string;
  readonly bindingRef: string;
  readonly signalKind: ConstructionAffectSignalKind;
  readonly sourceRef: string;
  readonly targetOutcomeRefs: readonly string[];
  readonly affectedActionRefs: readonly string[];
  readonly intensity: number;
  readonly adjustment: AffectPriorityAdjustmentKind;
  readonly weightDelta: number;
  readonly policyRef: string;
  readonly reviewReasonRefs: readonly string[];
  readonly terminalRouteRef: string | null;
  readonly escalationRequired: boolean;
  readonly evidenceRefs: readonly string[];
}

export interface ConstructionPriorityProjection {
  readonly kind: "construction_priority_projection";
  readonly projectionRef: string;
  readonly episodeId: string;
  readonly bindingProjectionRef: string;
  readonly prioritySchemeRef: string;
  readonly affectPolicyRefs: readonly string[];
  readonly affectAdjustments: readonly AffectPriorityAdjustment[];
  readonly rows: readonly ConstructionPriorityRow[];
}

export interface ConstructionPriorityRow {
  readonly kind: "construction_priority_row";
  readonly rankInputRef: string;
  readonly bindingRef: string;
  readonly pressureRef: string;
  readonly actionRef: string;
  readonly targetOutcomeRef: string;
  readonly sourcePolicyRef: string;
  readonly rankOrdinal: number;
  readonly baseScore: number;
  readonly priorityScore: number;
  readonly affectAdjustmentRefs: readonly string[];
  readonly finalScore: number;
  readonly rankReasonRefs: readonly string[];
  readonly forcedReview: boolean;
  readonly fhInputRequired: boolean;
  readonly escalationRequired: boolean;
  readonly terminalRouteRef: string | null;
  readonly reviewReasonRefs: readonly string[];
  readonly terminalDisposition: ConstructionTerminalDisposition;
  readonly tieBreakKey: string;
}

function terminalOrder(disposition: ConstructionTerminalDisposition): number {
  switch (disposition) {
    case "escalate":
      return 0;
    case "request_fh_input":
      return 1;
    case "force_review":
      return 2;
    case "none":
      return 3;
  }
}

export function constructConstructionPriorityScheme(input: {
  readonly schemeRef: string;
  readonly sourcePolicyRef: string;
  readonly rules: readonly ConstructionPriorityRule[];
}): ConstructionPriorityScheme {
  assertNonEmptyString(input.schemeRef, "ConstructionPriorityScheme.schemeRef");
  assertNonEmptyString(input.sourcePolicyRef, "ConstructionPriorityScheme.sourcePolicyRef");
  const ruleRefs = new Set<string>();
  for (const rule of input.rules) {
    if (ruleRefs.has(rule.priorityRuleRef)) {
      throw new TypeError(
        `ConstructionPriorityScheme has duplicate priorityRuleRef ${JSON.stringify(rule.priorityRuleRef)}`
      );
    }
    ruleRefs.add(rule.priorityRuleRef);
  }
  return Object.freeze({
    kind: "construction_priority_scheme",
    schemeRef: input.schemeRef,
    sourcePolicyRef: input.sourcePolicyRef,
    rules: Object.freeze([...input.rules])
  });
}

export function admitConstructionPriorityRule(
  input: unknown,
  label = "ConstructionPriorityRule"
): ConstructionPriorityRule {
  const record = assertPlainRecord(input, label);
  if (record["kind"] !== "construction_priority_rule") {
    throw new TypeError(`${label}.kind must be construction_priority_rule`);
  }
  return constructConstructionPriorityRule({
    priorityRuleRef: requiredStringField(record, "priorityRuleRef", label),
    axis: assertAllowedString(
      requiredStringField(record, "axis", label),
      CONSTRUCTION_PRIORITY_AXIS_VALUES,
      `${label}.axis`
    ),
    weight: optionalNumberField(record, "weight", 0, label),
    appliesToActionKinds: optionalStringArrayField(
      record,
      "appliesToActionKinds",
      label
    ).map((actionKind) =>
      assertAllowedString(
        actionKind,
        CONSTRUCTION_ACTION_KIND_VALUES,
        `${label}.appliesToActionKinds`
      )
    ),
    appliesToOutcomeRefs: optionalStringArrayField(
      record,
      "appliesToOutcomeRefs",
      label
    ),
    sourcePolicyRef: requiredStringField(record, "sourcePolicyRef", label),
    strategyLabel: requiredStringField(record, "strategyLabel", label)
  });
}

export function admitConstructionPriorityScheme(
  input: unknown,
  label = "ConstructionPriorityScheme"
): ConstructionPriorityScheme {
  const record = assertPlainRecord(input, label);
  if (record["kind"] !== "construction_priority_scheme") {
    throw new TypeError(`${label}.kind must be construction_priority_scheme`);
  }
  const rulesInput = record["rules"];
  if (!Array.isArray(rulesInput)) {
    throw new TypeError(`${label}.rules must be an array`);
  }
  return constructConstructionPriorityScheme({
    schemeRef: requiredStringField(record, "schemeRef", label),
    sourcePolicyRef: requiredStringField(record, "sourcePolicyRef", label),
    rules: Object.freeze(
      rulesInput.map((rule, index) =>
        admitConstructionPriorityRule(rule, `${label}.rules[${index}]`)
      )
    )
  });
}

export function constructConstructionPriorityRule(input: {
  readonly priorityRuleRef: string;
  readonly axis: ConstructionPriorityAxis;
  readonly weight: number;
  readonly appliesToActionKinds?: readonly ConstructionActionKind[];
  readonly appliesToOutcomeRefs?: readonly string[];
  readonly sourcePolicyRef: string;
  readonly strategyLabel: string;
}): ConstructionPriorityRule {
  assertNonEmptyString(input.priorityRuleRef, "ConstructionPriorityRule.priorityRuleRef");
  assertAllowedString(
    input.axis,
    CONSTRUCTION_PRIORITY_AXIS_VALUES,
    "ConstructionPriorityRule.axis"
  );
  assertNonNegativeFiniteNumber(input.weight, "ConstructionPriorityRule.weight");
  assertNonEmptyString(input.sourcePolicyRef, "ConstructionPriorityRule.sourcePolicyRef");
  assertNonEmptyString(input.strategyLabel, "ConstructionPriorityRule.strategyLabel");
  return Object.freeze({
    kind: "construction_priority_rule",
    priorityRuleRef: input.priorityRuleRef,
    axis: input.axis,
    weight: input.weight,
    appliesToActionKinds: Object.freeze([...(input.appliesToActionKinds ?? [])]),
    appliesToOutcomeRefs: freezeNonEmptyStrings(
      input.appliesToOutcomeRefs ?? [],
      "ConstructionPriorityRule.appliesToOutcomeRefs"
    ),
    sourcePolicyRef: input.sourcePolicyRef,
    strategyLabel: input.strategyLabel
  });
}

function priorityRuleFromHookConfig(input: {
  readonly hookResolution: ConstructionHookResolution;
  readonly entry: unknown;
  readonly index: number;
}): ConstructionPriorityRule {
  const label = `${input.hookResolution.sourceRef}.priorityRules[${input.index}]`;
  const record = assertPlainRecord(input.entry, label);
  return constructConstructionPriorityRule({
    priorityRuleRef: optionalStringConfigByAliases(
      record,
      ["priorityRuleRef", "priority_rule_ref"],
      [
        "priority-rule",
        input.hookResolution.source,
        input.hookResolution.sourceRef,
        String(input.index)
      ].join(":"),
      `${label}.priorityRuleRef`
    ),
    axis: assertAllowedString(
      optionalStringConfigByAliases(record, ["axis"], "gap_repair", `${label}.axis`),
      CONSTRUCTION_PRIORITY_AXIS_VALUES,
      `${label}.axis`
    ),
    weight: optionalNumberConfigByAliases(record, ["weight"], 1, `${label}.weight`),
    appliesToActionKinds: optionalStringArrayConfigByAliases(
      record,
      ["appliesToActionKinds", "applies_to_action_kinds"],
      `${label}.appliesToActionKinds`
    ).map((actionKind) =>
      assertAllowedString(
        actionKind,
        CONSTRUCTION_ACTION_KIND_VALUES,
        `${label}.appliesToActionKinds`
      )
    ),
    appliesToOutcomeRefs: optionalStringArrayConfigByAliases(
      record,
      ["appliesToOutcomeRefs", "applies_to_outcome_refs"],
      `${label}.appliesToOutcomeRefs`
    ),
    sourcePolicyRef: optionalStringConfigByAliases(
      record,
      ["sourcePolicyRef", "source_policy_ref"],
      input.hookResolution.sourceRef,
      `${label}.sourcePolicyRef`
    ),
    strategyLabel: optionalStringConfigByAliases(
      record,
      ["strategyLabel", "strategy_label"],
      input.hookResolution.source,
      `${label}.strategyLabel`
    )
  });
}

function priorityRulesFromConstructionHookResolution(
  hookResolution: ConstructionHookResolution
): readonly ConstructionPriorityRule[] {
  const rulesConfig =
    hookResolution.config["priorityRules"] ??
    hookResolution.config["priority_rules"];
  if (rulesConfig === undefined) {
    return Object.freeze([]);
  }
  if (!Array.isArray(rulesConfig)) {
    throw new TypeError(
      `${hookResolution.sourceRef}.priorityRules must be an array`
    );
  }
  return Object.freeze(
    rulesConfig.map((entry, index) =>
      priorityRuleFromHookConfig({ hookResolution, entry, index })
    )
  );
}

export function deriveConstructionPrioritySchemeFromHookResolutions(input: {
  readonly schemeRef: string;
  readonly sourcePolicyRef: string;
  readonly hookResolutions: readonly ConstructionHookResolution[];
}): ConstructionPriorityScheme {
  assertNonEmptyString(
    input.schemeRef,
    "deriveConstructionPrioritySchemeFromHookResolutions.schemeRef"
  );
  assertNonEmptyString(
    input.sourcePolicyRef,
    "deriveConstructionPrioritySchemeFromHookResolutions.sourcePolicyRef"
  );
  const uniqueHookResolutions = Object.freeze(
    [
      ...new Map(
        input.hookResolutions.map((resolution) => [
          `${resolution.resolutionRef}:${resolution.configDigest}`,
          resolution
        ])
      ).values()
    ].sort((left, right) =>
      `${left.resolutionRef}:${left.configDigest}`.localeCompare(
        `${right.resolutionRef}:${right.configDigest}`
      )
    )
  );
  return constructConstructionPriorityScheme({
    schemeRef: input.schemeRef,
    sourcePolicyRef: input.sourcePolicyRef,
    rules: Object.freeze(
      uniqueHookResolutions.flatMap(priorityRulesFromConstructionHookResolution)
    )
  });
}

export function admitAffectPriorityPolicy(
  input: unknown,
  label = "AffectPriorityPolicy"
): AffectPriorityPolicy {
  const record = assertPlainRecord(input, label);
  if (record["kind"] !== "affect_priority_policy") {
    throw new TypeError(`${label}.kind must be affect_priority_policy`);
  }
  return constructAffectPriorityPolicy({
    policyRef: requiredStringField(record, "policyRef", label),
    signalKind: assertAllowedString(
      requiredStringField(record, "signalKind", label),
      CONSTRUCTION_AFFECT_SIGNAL_KIND_VALUES,
      `${label}.signalKind`
    ),
    appliesToOutcomeRefs: optionalStringArrayField(
      record,
      "appliesToOutcomeRefs",
      label
    ),
    appliesToActionKinds: optionalStringArrayField(
      record,
      "appliesToActionKinds",
      label
    ).map((actionKind) =>
      assertAllowedString(
        actionKind,
        CONSTRUCTION_ACTION_KIND_VALUES,
        `${label}.appliesToActionKinds`
      )
    ),
    boostWeight: optionalNumberField(record, "boostWeight", 0, label),
    attenuationWeight: optionalNumberField(record, "attenuationWeight", 0, label),
    forceReviewThreshold: optionalNullableNumberField(
      record,
      "forceReviewThreshold",
      label
    ),
    fhInputThreshold: optionalNullableNumberField(record, "fhInputThreshold", label),
    escalationThreshold: optionalNullableNumberField(
      record,
      "escalationThreshold",
      label
    ),
    terminalRouteRefs: optionalStringArrayField(
      record,
      "terminalRouteRefs",
      label
    ),
    sourcePolicyRef: requiredStringField(record, "sourcePolicyRef", label)
  });
}

export function admitAffectPriorityPolicies(
  input: unknown,
  label = "AffectPriorityPolicies"
): readonly AffectPriorityPolicy[] {
  if (!Array.isArray(input)) {
    throw new TypeError(`${label} must be an array`);
  }
  return Object.freeze(
    input.map((policy, index) =>
      admitAffectPriorityPolicy(policy, `${label}[${index}]`)
    )
  );
}

export function constructAffectPriorityPolicy(input: {
  readonly policyRef: string;
  readonly signalKind: ConstructionAffectSignalKind;
  readonly appliesToOutcomeRefs?: readonly string[];
  readonly appliesToActionKinds?: readonly ConstructionActionKind[];
  readonly boostWeight?: number;
  readonly attenuationWeight?: number;
  readonly forceReviewThreshold?: number | null;
  readonly fhInputThreshold?: number | null;
  readonly escalationThreshold?: number | null;
  readonly terminalRouteRefs?: readonly string[];
  readonly sourcePolicyRef: string;
}): AffectPriorityPolicy {
  assertNonEmptyString(input.policyRef, "AffectPriorityPolicy.policyRef");
  assertAllowedString(
    input.signalKind,
    CONSTRUCTION_AFFECT_SIGNAL_KIND_VALUES,
    "AffectPriorityPolicy.signalKind"
  );
  const boostWeight = input.boostWeight ?? 0;
  const attenuationWeight = input.attenuationWeight ?? 0;
  assertNonNegativeFiniteNumber(boostWeight, "AffectPriorityPolicy.boostWeight");
  assertNonNegativeFiniteNumber(
    attenuationWeight,
    "AffectPriorityPolicy.attenuationWeight"
  );
  const forceReviewThreshold = input.forceReviewThreshold ?? null;
  const fhInputThreshold = input.fhInputThreshold ?? null;
  const escalationThreshold = input.escalationThreshold ?? null;
  assertNullableNonNegativeFiniteNumber(
    forceReviewThreshold,
    "AffectPriorityPolicy.forceReviewThreshold"
  );
  assertNullableNonNegativeFiniteNumber(
    fhInputThreshold,
    "AffectPriorityPolicy.fhInputThreshold"
  );
  assertNullableNonNegativeFiniteNumber(
    escalationThreshold,
    "AffectPriorityPolicy.escalationThreshold"
  );
  assertNonEmptyString(input.sourcePolicyRef, "AffectPriorityPolicy.sourcePolicyRef");
  return Object.freeze({
    kind: "affect_priority_policy",
    policyRef: input.policyRef,
    signalKind: input.signalKind,
    appliesToOutcomeRefs: freezeNonEmptyStrings(
      input.appliesToOutcomeRefs ?? [],
      "AffectPriorityPolicy.appliesToOutcomeRefs"
    ),
    appliesToActionKinds: Object.freeze([...(input.appliesToActionKinds ?? [])]),
    boostWeight,
    attenuationWeight,
    forceReviewThreshold,
    fhInputThreshold,
    escalationThreshold,
    terminalRouteRefs: freezeNonEmptyStrings(
      input.terminalRouteRefs ?? [],
      "AffectPriorityPolicy.terminalRouteRefs"
    ),
    sourcePolicyRef: input.sourcePolicyRef
  });
}

function adjustmentKindForAffect(
  pressure: ObservationPressureRow,
  policy: AffectPriorityPolicy
): AffectPriorityAdjustmentKind {
  if (
    policy.escalationThreshold !== null &&
    pressure.severity >= policy.escalationThreshold
  ) {
    return "escalate";
  }
  if (policy.fhInputThreshold !== null && pressure.severity >= policy.fhInputThreshold) {
    return "request_fh_input";
  }
  if (
    policy.forceReviewThreshold !== null &&
    pressure.severity >= policy.forceReviewThreshold
  ) {
    return "force_review";
  }
  if (pressure.affectSignalKind === "confidence") {
    return "attenuate";
  }
  return "boost";
}

function weightDeltaForAdjustment(
  adjustment: AffectPriorityAdjustmentKind,
  policy: AffectPriorityPolicy
): number {
  switch (adjustment) {
    case "boost":
      return policy.boostWeight;
    case "attenuate":
      return -policy.attenuationWeight;
    case "force_review":
    case "request_fh_input":
    case "escalate":
      return 0;
  }
}

function terminalDispositionForAdjustment(
  adjustment: AffectPriorityAdjustmentKind
): ConstructionTerminalDisposition {
  switch (adjustment) {
    case "force_review":
      return "force_review";
    case "request_fh_input":
      return "request_fh_input";
    case "escalate":
      return "escalate";
    case "boost":
    case "attenuate":
      return "none";
  }
}

function selectedTerminalAdjustmentFor(
  adjustments: readonly AffectPriorityAdjustment[],
  disposition: ConstructionTerminalDisposition
): AffectPriorityAdjustment | undefined {
  if (disposition === "none") {
    return undefined;
  }
  return adjustments
    .filter(
      (adjustment) =>
        terminalDispositionForAdjustment(adjustment.adjustment) === disposition &&
        adjustment.terminalRouteRef !== null
    )
    .sort((left, right) => {
      const routeComparison = (left.terminalRouteRef ?? "").localeCompare(
        right.terminalRouteRef ?? ""
      );
      return routeComparison !== 0
        ? routeComparison
        : left.affectRef.localeCompare(right.affectRef);
    })[0];
}

export function deriveConstructionPriorityProjection(input: {
  readonly observation: ConstructionObservationSnapshot;
  readonly actionCatalog: ConstructionActionCatalogProjection;
  readonly bindingProjection: ObservationToActionBindingProjection;
  readonly priorityScheme: ConstructionPriorityScheme;
  readonly affectPolicies?: readonly AffectPriorityPolicy[];
}): ConstructionPriorityProjection {
  if (input.observation.episodeId !== input.bindingProjection.episodeId) {
    throw new TypeError("Observation/binding projection episode mismatch");
  }
  if (input.actionCatalog.catalogRef !== input.bindingProjection.catalogRef) {
    throw new TypeError("Action catalog/binding projection catalog mismatch");
  }
  const actions = new Map(input.actionCatalog.rows.map((row) => [row.actionRef, row]));
  const pressures = new Map(
    input.observation.pressureRows.map((row) => [row.pressureRef, row])
  );
  const affectPolicies = Object.freeze([...(input.affectPolicies ?? [])]);
  const adjustments: AffectPriorityAdjustment[] = [];
  for (const pressure of input.observation.pressureRows) {
    if (pressure.pressureKind !== "affect_signal" || pressure.affectSignalKind === null) {
      continue;
    }
    for (const policy of affectPolicies) {
      if (policy.signalKind !== pressure.affectSignalKind) {
        continue;
      }
      for (const binding of input.bindingProjection.rows) {
        const action = actions.get(binding.actionRef);
        if (action === undefined) {
          throw new TypeError(
            `Binding row references missing action ${JSON.stringify(binding.actionRef)}`
          );
        }
        if (!matchesOptionalStrings(policy.appliesToOutcomeRefs, binding.targetOutcomeRef)) {
          continue;
        }
        if (!matchesOptionalActionKinds(policy.appliesToActionKinds, action.actionKind)) {
          continue;
        }
        if (!pressure.targetOutcomeRefs.includes(binding.targetOutcomeRef)) {
          continue;
        }
        const adjustment = adjustmentKindForAffect(pressure, policy);
        const terminalDisposition = terminalDispositionForAdjustment(adjustment);
        adjustments.push(
          Object.freeze({
            kind: "affect_priority_adjustment",
            affectRef: [
              "affect-adjustment",
              input.observation.episodeId,
              pressure.pressureRef,
              policy.policyRef,
              binding.bindingRef
            ].join(":"),
            bindingRef: binding.bindingRef,
            signalKind: pressure.affectSignalKind,
            sourceRef: pressure.sourceRef,
            targetOutcomeRefs: freezeStringArray(pressure.targetOutcomeRefs),
            affectedActionRefs: freezeStringArray([action.actionRef]),
            intensity: pressure.severity,
            adjustment,
            weightDelta: weightDeltaForAdjustment(adjustment, policy),
            policyRef: policy.policyRef,
            reviewReasonRefs: freezeStringArray([pressure.pressureRef, policy.policyRef]),
            terminalRouteRef:
              terminalDisposition === "none"
                ? null
                : policy.terminalRouteRefs[0] ?? `${policy.policyRef}:${adjustment}`,
            escalationRequired: adjustment === "escalate",
            evidenceRefs: freezeStringArray(pressure.evidenceRefs)
          })
        );
      }
    }
  }
  const rows = input.bindingProjection.rows.map((binding): ConstructionPriorityRow => {
    const pressure = pressures.get(binding.pressureRef);
    const action = actions.get(binding.actionRef);
    if (pressure === undefined) {
      throw new TypeError(
        `Binding row references missing pressure ${JSON.stringify(binding.pressureRef)}`
      );
    }
    if (action === undefined) {
      throw new TypeError(
        `Binding row references missing action ${JSON.stringify(binding.actionRef)}`
      );
    }
    const matchedRules = input.priorityScheme.rules.filter(
      (rule) =>
        matchesOptionalStrings(rule.appliesToOutcomeRefs, binding.targetOutcomeRef) &&
        matchesOptionalActionKinds(rule.appliesToActionKinds, action.actionKind)
    );
    const priorityScore = matchedRules.reduce((score, rule) => score + rule.weight, 0);
    const rowAdjustments = adjustments.filter(
      (adjustment) => adjustment.bindingRef === binding.bindingRef
    );
    const terminalDisposition = rowAdjustments.reduce<ConstructionTerminalDisposition>(
      (selected, adjustment) => {
        const candidate = terminalDispositionForAdjustment(adjustment.adjustment);
        return terminalOrder(candidate) < terminalOrder(selected) ? candidate : selected;
      },
      "none"
    );
    const selectedTerminalAdjustment = selectedTerminalAdjustmentFor(
      rowAdjustments,
      terminalDisposition
    );
    const affectScore = rowAdjustments.reduce(
      (score, adjustment) => score + adjustment.weightDelta,
      0
    );
    const rankReasonRefs = [
      input.priorityScheme.sourcePolicyRef,
      ...matchedRules.map((rule) => rule.priorityRuleRef),
      ...binding.matchReasonRefs
    ];
    const sourcePolicyRef =
      matchedRules[0]?.sourcePolicyRef ?? input.priorityScheme.sourcePolicyRef;
    const finalScore = binding.bindingScore + priorityScore + affectScore;
    return Object.freeze({
      kind: "construction_priority_row",
      rankInputRef: `construction-rank:${input.observation.episodeId}:${binding.bindingRef}`,
      bindingRef: binding.bindingRef,
      pressureRef: pressure.pressureRef,
      actionRef: action.actionRef,
      targetOutcomeRef: binding.targetOutcomeRef,
      sourcePolicyRef,
      rankOrdinal: 0,
      baseScore: binding.bindingScore,
      priorityScore,
      affectAdjustmentRefs: freezeStringArray(
        rowAdjustments.map((adjustment) => adjustment.affectRef)
      ),
      finalScore,
      rankReasonRefs: freezeStringArray(rankReasonRefs),
      forcedReview: terminalDisposition === "force_review",
      fhInputRequired: terminalDisposition === "request_fh_input",
      escalationRequired: terminalDisposition === "escalate",
      terminalRouteRef: selectedTerminalAdjustment?.terminalRouteRef ?? null,
      reviewReasonRefs: freezeStringArray(
        (selectedTerminalAdjustment === undefined
          ? rowAdjustments
          : [selectedTerminalAdjustment]
        ).flatMap((adjustment) => adjustment.reviewReasonRefs)
      ),
      terminalDisposition,
      tieBreakKey: [
        terminalDisposition,
        binding.targetOutcomeRef,
        action.actionRef,
        binding.bindingRef,
        sourcePolicyRef
      ].join("|")
    });
  });
  const sortedRows = rows
    .sort((left, right) => {
      const terminalComparison =
        terminalOrder(left.terminalDisposition) - terminalOrder(right.terminalDisposition);
      if (terminalComparison !== 0) {
        return terminalComparison;
      }
      if (left.terminalDisposition === "none" && left.finalScore !== right.finalScore) {
        return right.finalScore - left.finalScore;
      }
      const targetComparison = left.targetOutcomeRef.localeCompare(right.targetOutcomeRef);
      if (targetComparison !== 0) {
        return targetComparison;
      }
      const actionComparison = left.actionRef.localeCompare(right.actionRef);
      if (actionComparison !== 0) {
        return actionComparison;
      }
      const bindingComparison = left.bindingRef.localeCompare(right.bindingRef);
      if (bindingComparison !== 0) {
        return bindingComparison;
      }
      return left.sourcePolicyRef.localeCompare(right.sourcePolicyRef);
    })
    .map((row, index) =>
      Object.freeze({
        ...row,
        rankOrdinal: index,
        tieBreakKey: [
          String(index),
          row.terminalDisposition,
          row.targetOutcomeRef,
          row.actionRef,
          row.bindingRef,
          row.sourcePolicyRef
        ].join("|")
      })
    );
  return Object.freeze({
    kind: "construction_priority_projection",
    projectionRef: [
      "construction-priority-projection",
      input.observation.episodeId,
      input.observation.observationId,
      input.priorityScheme.schemeRef,
      stableDigest({
        priorityScheme: input.priorityScheme,
        affectPolicyRefs: affectPolicies.map((policy) => policy.policyRef)
      })
    ].join(":"),
    episodeId: input.observation.episodeId,
    bindingProjectionRef: input.bindingProjection.projectionRef,
    prioritySchemeRef: input.priorityScheme.schemeRef,
    affectPolicyRefs: freezeStringArray(affectPolicies.map((policy) => policy.policyRef)),
    affectAdjustments: Object.freeze(
      adjustments.sort((left, right) => left.affectRef.localeCompare(right.affectRef))
    ),
    rows: Object.freeze(sortedRows)
  });
}
