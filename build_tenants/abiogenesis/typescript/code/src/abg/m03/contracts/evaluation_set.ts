// Implements: REQ-L-GTL3-COMPUTE-NOTATION
// Implements: REQ-R-ABG3-FN-COMPOSITION
// Implements: REQ-R-ABG3-ASSURANCE

import type { RuntimeRegime } from "./carriers.js";
import {
  parseBoolean,
  parseNonEmptyString,
  parseOptionalField,
  parsePlainObject,
  parseString,
  parseStringArray
} from "../../../shared/validation/primitives.js";
import { freezeStringArray } from "./runtime_support.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";

export const EVALUATION_RULE_ROLE_VALUES = Object.freeze([
  "register",
  "semantic_judgment",
  "external_human_callout"
] as const);

export type EvaluationRuleRole =
  (typeof EVALUATION_RULE_ROLE_VALUES)[number];

export interface EvaluationRuleDeclaration {
  readonly kind: "evaluation_rule_declaration";
  readonly ruleRef: string;
  readonly ruleRole: EvaluationRuleRole;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
  readonly stageRole: "evaluate";
  readonly computeMeans: RuntimeRegime;
  readonly inputLedgerRefs: readonly string[];
  readonly outputCarrierRefs: readonly string[];
  readonly required: boolean;
  readonly parallelGroupRef: string | null;
  readonly dependencyRefs: readonly string[];
  readonly readOnly: true;
}

export interface EvaluationSetPlan {
  readonly kind: "evaluation_set_plan";
  readonly planRef: string;
  readonly planDigest: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
  readonly ruleBatches: readonly (readonly EvaluationRuleDeclaration[])[];
  readonly requiredRuleRefs: readonly string[];
  readonly readOnlyInputRefs: readonly string[];
}

export interface EvaluationRuleOutcome {
  readonly kind: "evaluation_rule_outcome";
  readonly status: "accepted" | "blocked";
  readonly ruleRef: string;
  readonly ruleRole: EvaluationRuleRole;
  readonly computeMeans: RuntimeRegime;
  readonly producedRegisterRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly findingRefs: readonly string[];
  readonly humanResponseRefs: readonly string[];
  readonly residualPressureRefs: readonly string[];
  readonly continuationRefs: readonly string[];
  readonly diagnosticRefs: readonly string[];
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
  readonly compositionContributionRef: string;
  readonly reason: string | null;
}

export interface EvaluationSetAdmission {
  readonly kind: "evaluation_set_admission";
  readonly admissionRef: string;
  readonly evaluationSetRef: string;
  readonly planRef: string;
  readonly planDigest: string;
  readonly admittedRuleOutcomes: readonly EvaluationRuleOutcome[];
  readonly rejectedRuleOutcomes: readonly EvaluationRuleOutcome[];
  readonly missingRequiredRuleRefs: readonly string[];
  readonly diagnosticRefs: readonly string[];
}

export interface EvaluationSetProjection {
  readonly kind: "evaluation_set_projection";
  readonly projectionRef: string;
  readonly evaluationSetRef: string;
  readonly planRef: string;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
  readonly admittedRuleRefs: readonly string[];
  readonly registerRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly semanticFindingRefs: readonly string[];
  readonly humanResponseRefs: readonly string[];
  readonly residualPressureRefs: readonly string[];
  readonly continuationRefs: readonly string[];
  readonly diagnosticRefs: readonly string[];
  readonly foldInputRefs: readonly string[];
}

const FORBIDDEN_EVALUATION_RULE_AUTHORITY_FIELDS = Object.freeze([
  "runtimeEvents",
  "events",
  "nextVectorIndex",
  "closedVectorIndexes",
  "transition",
  "closureKind",
  "graphCallId",
  "frameId",
  "vectorIndex",
  "actorInvocationId",
  "actorInvocationRef",
  "writeLedgers",
  "emitRuntimeEvents",
  "selectTraversal",
  "closeTraversal",
  "replayContinuation"
] as const);

function normalizeNullableString(
  input: string | null | undefined,
  label: string
): string | null {
  if (input === undefined || input === null) {
    return null;
  }
  return parseNonEmptyString(input, label);
}

function parseOptionalNullableStringField(
  input: Readonly<Record<string, unknown>>,
  field: string,
  label: string
): string | null | undefined {
  const value = parseOptionalField(input, field);
  if (value === undefined || value === null) {
    return value;
  }
  return parseNonEmptyString(value, label);
}

function normalizeReason(
  input: string | null | undefined,
  label: string
): string | null {
  if (input === undefined || input === null) {
    return null;
  }
  return parseNonEmptyString(input, label);
}

function assertRuntimeRegime(value: string, label: string): RuntimeRegime {
  if (value === "F_D" || value === "F_P" || value === "F_H") {
    return value;
  }
  throw new TypeError(
    `${label}: expected runtime regime, got ${JSON.stringify(value)}`
  );
}

function assertEvaluationRuleOutcomeStatus(
  value: string,
  label: string
): EvaluationRuleOutcome["status"] {
  if (value === "accepted" || value === "blocked") {
    return value;
  }
  throw new TypeError(
    `${label}: expected evaluation rule outcome status, got ${JSON.stringify(value)}`
  );
}

function assertEvaluationRuleRole(
  value: string,
  label: string
): EvaluationRuleRole {
  for (const role of EVALUATION_RULE_ROLE_VALUES) {
    if (value === role) {
      return role;
    }
  }
  throw new TypeError(
    `${label}: expected evaluation rule role, got ${JSON.stringify(value)}`
  );
}

function defaultRuleRoleForMeans(computeMeans: RuntimeRegime): EvaluationRuleRole {
  switch (computeMeans) {
    case "F_D":
      return "register";
    case "F_P":
      return "semantic_judgment";
    case "F_H":
      return "external_human_callout";
    default: {
      const exhaustive: never = computeMeans;
      throw new TypeError(
        `Unsupported evaluation rule compute means ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

function rejectForbiddenEvaluationRuleAuthorityFields(
  input: Readonly<Record<string, unknown>>,
  label: string
): void {
  for (const field of FORBIDDEN_EVALUATION_RULE_AUTHORITY_FIELDS) {
    if (Object.hasOwn(input, field)) {
      throw new TypeError(
        `${label}.${field}: evaluation rule outcome cannot own engine authority`
      );
    }
  }
}

function stableRef(prefix: string, input: unknown): string {
  return `${prefix}:${stableSha256Digest(input)}`;
}

function uniqueStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)]);
}

function assertEvaluationRuleDeclarationMatchesPlan(input: {
  readonly declaration: EvaluationRuleDeclaration;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
}): void {
  if (
    input.declaration.selectedCompositionRef !== input.selectedCompositionRef
  ) {
    throw new TypeError(
      "EvaluationRuleDeclaration.selectedCompositionRef does not match evaluation set plan"
    );
  }
  if (
    input.declaration.selectedCompositionDigest !==
    input.selectedCompositionDigest
  ) {
    throw new TypeError(
      "EvaluationRuleDeclaration.selectedCompositionDigest does not match evaluation set plan"
    );
  }
  if (
    input.declaration.selectedCompositionSelectionRef !==
    input.selectedCompositionSelectionRef
  ) {
    throw new TypeError(
      "EvaluationRuleDeclaration.selectedCompositionSelectionRef does not match evaluation set plan"
    );
  }
}

function assertEvaluationRuleOutcomeMatchesDeclaration(input: {
  readonly declaration: EvaluationRuleDeclaration;
  readonly outcome: EvaluationRuleOutcome;
}): void {
  if (input.outcome.ruleRef !== input.declaration.ruleRef) {
    throw new TypeError("EvaluationRuleOutcome.ruleRef does not match declaration");
  }
  if (input.outcome.ruleRole !== input.declaration.ruleRole) {
    throw new TypeError(
      "EvaluationRuleOutcome.ruleRole does not match declaration"
    );
  }
  if (input.outcome.computeMeans !== input.declaration.computeMeans) {
    throw new TypeError(
      "EvaluationRuleOutcome.computeMeans does not match declaration"
    );
  }
  if (
    input.outcome.selectedCompositionRef !==
    input.declaration.selectedCompositionRef
  ) {
    throw new TypeError(
      "EvaluationRuleOutcome.selectedCompositionRef does not match selected abg.fn_composition"
    );
  }
  if (
    input.outcome.selectedCompositionDigest !==
    input.declaration.selectedCompositionDigest
  ) {
    throw new TypeError(
      "EvaluationRuleOutcome.selectedCompositionDigest does not match selected abg.fn_composition"
    );
  }
  if (
    input.outcome.selectedCompositionSelectionRef !==
    input.declaration.selectedCompositionSelectionRef
  ) {
    throw new TypeError(
      "EvaluationRuleOutcome.selectedCompositionSelectionRef does not match selected abg.fn_composition"
    );
  }
  if (
    input.outcome.selectedRegimeBindingRef !==
    input.declaration.selectedRegimeBindingRef
  ) {
    throw new TypeError(
      "EvaluationRuleOutcome.selectedRegimeBindingRef does not match declaration"
    );
  }
  const expectedContributionRef =
    input.declaration.selectedRegimeBindingRef ??
    input.declaration.selectedCompositionRef;
  if (input.outcome.compositionContributionRef !== expectedContributionRef) {
    throw new TypeError(
      "EvaluationRuleOutcome.compositionContributionRef does not match selected regime binding"
    );
  }
}

export function constructEvaluationRuleDeclaration(input: {
  readonly ruleRef: string;
  readonly ruleRole?: EvaluationRuleRole | undefined;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
  readonly selectedRegimeBindingRef?: string | null | undefined;
  readonly computeMeans: RuntimeRegime;
  readonly inputLedgerRefs?: readonly string[] | undefined;
  readonly outputCarrierRefs?: readonly string[] | undefined;
  readonly required?: boolean | undefined;
  readonly parallelGroupRef?: string | null | undefined;
  readonly dependencyRefs?: readonly string[] | undefined;
}): EvaluationRuleDeclaration {
  const ruleRole = input.ruleRole ?? defaultRuleRoleForMeans(input.computeMeans);
  if (input.computeMeans === "F_H" && ruleRole !== "external_human_callout") {
    throw new TypeError(
      "EvaluationRuleDeclaration F_H rule must be external_human_callout"
    );
  }
  return Object.freeze({
    kind: "evaluation_rule_declaration",
    ruleRef: parseNonEmptyString(
      input.ruleRef,
      "EvaluationRuleDeclaration.ruleRef"
    ),
    ruleRole,
    selectedCompositionRef: parseNonEmptyString(
      input.selectedCompositionRef,
      "EvaluationRuleDeclaration.selectedCompositionRef"
    ),
    selectedCompositionDigest: parseNonEmptyString(
      input.selectedCompositionDigest,
      "EvaluationRuleDeclaration.selectedCompositionDigest"
    ),
    selectedCompositionSelectionRef: parseNonEmptyString(
      input.selectedCompositionSelectionRef,
      "EvaluationRuleDeclaration.selectedCompositionSelectionRef"
    ),
    selectedRegimeBindingRef: normalizeNullableString(
      input.selectedRegimeBindingRef,
      "EvaluationRuleDeclaration.selectedRegimeBindingRef"
    ),
    stageRole: "evaluate",
    computeMeans: input.computeMeans,
    inputLedgerRefs: freezeStringArray(input.inputLedgerRefs ?? Object.freeze([])),
    outputCarrierRefs: freezeStringArray(
      input.outputCarrierRefs ?? Object.freeze([])
    ),
    required: input.required ?? true,
    parallelGroupRef: normalizeNullableString(
      input.parallelGroupRef,
      "EvaluationRuleDeclaration.parallelGroupRef"
    ),
    dependencyRefs: freezeStringArray(input.dependencyRefs ?? Object.freeze([])),
    readOnly: true
  });
}

export function constructEvaluationSetPlan(input: {
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
  readonly ruleBatches: readonly (readonly EvaluationRuleDeclaration[])[];
  readonly requiredRuleRefs?: readonly string[] | undefined;
  readonly readOnlyInputRefs?: readonly string[] | undefined;
}): EvaluationSetPlan {
  const selectedCompositionRef = parseNonEmptyString(
    input.selectedCompositionRef,
    "EvaluationSetPlan.selectedCompositionRef"
  );
  const selectedCompositionDigest = parseNonEmptyString(
    input.selectedCompositionDigest,
    "EvaluationSetPlan.selectedCompositionDigest"
  );
  const selectedCompositionSelectionRef = parseNonEmptyString(
    input.selectedCompositionSelectionRef,
    "EvaluationSetPlan.selectedCompositionSelectionRef"
  );
  const ruleBatches = Object.freeze(
    input.ruleBatches.map((batch) => Object.freeze([...batch]))
  );
  const ruleRefs = new Set<string>();
  const ruleBatchIndexes = new Map<string, number>();
  for (const [batchIndex, batch] of ruleBatches.entries()) {
    for (const rule of batch) {
      assertEvaluationRuleDeclarationMatchesPlan({
        declaration: rule,
        selectedCompositionRef,
        selectedCompositionDigest,
        selectedCompositionSelectionRef
      });
      if (ruleRefs.has(rule.ruleRef)) {
        throw new TypeError(`Duplicate evaluation rule ref ${rule.ruleRef}`);
      }
      ruleRefs.add(rule.ruleRef);
      ruleBatchIndexes.set(rule.ruleRef, batchIndex);
    }
  }
  for (const [batchIndex, batch] of ruleBatches.entries()) {
    for (const rule of batch) {
      for (const dependencyRef of rule.dependencyRefs) {
        const dependencyBatchIndex = ruleBatchIndexes.get(dependencyRef);
        if (dependencyBatchIndex === undefined) {
          throw new TypeError(
            `EvaluationRuleDeclaration.dependencyRefs contains unknown rule ${dependencyRef}`
          );
        }
        if (dependencyRef === rule.ruleRef) {
          throw new TypeError(
            `EvaluationRuleDeclaration.dependencyRefs cannot self-reference ${rule.ruleRef}`
          );
        }
        if (dependencyBatchIndex >= batchIndex) {
          throw new TypeError(
            "EvaluationRuleDeclaration.dependencyRefs must reference an earlier evaluation-set batch"
          );
        }
      }
    }
  }
  const requiredRuleRefs = uniqueStrings([
    ...ruleBatches.flatMap((batch) =>
      batch.filter((rule) => rule.required).map((rule) => rule.ruleRef)
    ),
    ...(input.requiredRuleRefs ?? Object.freeze([]))
  ]);
  const planDigest = stableSha256Digest({
    basisId: input.basisId,
    graphFunctionId: input.graphFunctionId,
    vectorIndex: input.vectorIndex,
    edge: input.edge,
    selectedCompositionRef,
    selectedCompositionDigest,
    ruleBatches: ruleBatches.map((batch) =>
      batch.map((rule) => ({
        ruleRef: rule.ruleRef,
        ruleRole: rule.ruleRole,
        computeMeans: rule.computeMeans,
        required: rule.required,
        parallelGroupRef: rule.parallelGroupRef,
        dependencyRefs: rule.dependencyRefs
      }))
    ),
    requiredRuleRefs
  });
  return Object.freeze({
    kind: "evaluation_set_plan",
    planRef: `evaluation-set-plan:${planDigest}`,
    planDigest: `sha256:${planDigest}`,
    basisId: parseNonEmptyString(input.basisId, "EvaluationSetPlan.basisId"),
    graphFunctionId: parseNonEmptyString(
      input.graphFunctionId,
      "EvaluationSetPlan.graphFunctionId"
    ),
    vectorIndex: input.vectorIndex,
    edge: parseNonEmptyString(input.edge, "EvaluationSetPlan.edge"),
    selectedCompositionRef,
    selectedCompositionDigest,
    selectedCompositionSelectionRef,
    ruleBatches,
    requiredRuleRefs,
    readOnlyInputRefs: freezeStringArray(
      input.readOnlyInputRefs ?? Object.freeze([])
    )
  });
}

export function constructEvaluationRuleOutcome(input: {
  readonly status: EvaluationRuleOutcome["status"];
  readonly ruleRef: string;
  readonly ruleRole?: EvaluationRuleRole | undefined;
  readonly computeMeans: RuntimeRegime;
  readonly producedRegisterRefs?: readonly string[] | undefined;
  readonly evidenceRefs?: readonly string[] | undefined;
  readonly findingRefs?: readonly string[] | undefined;
  readonly humanResponseRefs?: readonly string[] | undefined;
  readonly residualPressureRefs?: readonly string[] | undefined;
  readonly continuationRefs?: readonly string[] | undefined;
  readonly diagnosticRefs?: readonly string[] | undefined;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
  readonly selectedRegimeBindingRef?: string | null | undefined;
  readonly compositionContributionRef?: string | undefined;
  readonly reason?: string | null | undefined;
}): EvaluationRuleOutcome {
  if (input.status !== "accepted" && input.status !== "blocked") {
    throw new TypeError(
      `EvaluationRuleOutcome.status: expected accepted or blocked, got ${JSON.stringify(input.status)}`
    );
  }
  const ruleRole = input.ruleRole ?? defaultRuleRoleForMeans(input.computeMeans);
  const producedRegisterRefs = freezeStringArray(
    input.producedRegisterRefs ?? Object.freeze([])
  );
  const evidenceRefs = freezeStringArray(input.evidenceRefs ?? Object.freeze([]));
  const findingRefs = freezeStringArray(input.findingRefs ?? Object.freeze([]));
  const humanResponseRefs = freezeStringArray(
    input.humanResponseRefs ?? Object.freeze([])
  );
  if (
    input.status === "accepted" &&
    producedRegisterRefs.length === 0 &&
    evidenceRefs.length === 0 &&
    findingRefs.length === 0 &&
    humanResponseRefs.length === 0
  ) {
    throw new TypeError(
      "EvaluationRuleOutcome accepted status requires at least one produced register, evidence, finding, or human response ref"
    );
  }
  const selectedRegimeBindingRef = normalizeNullableString(
    input.selectedRegimeBindingRef,
    "EvaluationRuleOutcome.selectedRegimeBindingRef"
  );
  return Object.freeze({
    kind: "evaluation_rule_outcome",
    status: input.status,
    ruleRef: parseNonEmptyString(input.ruleRef, "EvaluationRuleOutcome.ruleRef"),
    ruleRole,
    computeMeans: input.computeMeans,
    producedRegisterRefs,
    evidenceRefs,
    findingRefs,
    humanResponseRefs,
    residualPressureRefs: freezeStringArray(
      input.residualPressureRefs ?? Object.freeze([])
    ),
    continuationRefs: freezeStringArray(
      input.continuationRefs ?? Object.freeze([])
    ),
    diagnosticRefs: freezeStringArray(
      input.diagnosticRefs ?? Object.freeze([])
    ),
    selectedCompositionRef: parseNonEmptyString(
      input.selectedCompositionRef,
      "EvaluationRuleOutcome.selectedCompositionRef"
    ),
    selectedCompositionDigest: parseNonEmptyString(
      input.selectedCompositionDigest,
      "EvaluationRuleOutcome.selectedCompositionDigest"
    ),
    selectedCompositionSelectionRef: parseNonEmptyString(
      input.selectedCompositionSelectionRef,
      "EvaluationRuleOutcome.selectedCompositionSelectionRef"
    ),
    selectedRegimeBindingRef,
    compositionContributionRef: parseNonEmptyString(
      input.compositionContributionRef ??
        selectedRegimeBindingRef ??
        input.selectedCompositionRef,
      "EvaluationRuleOutcome.compositionContributionRef"
    ),
    reason: normalizeReason(input.reason, "EvaluationRuleOutcome.reason")
  });
}

export function admitEvaluationRuleOutcome(
  input: unknown,
  label = "EvaluationRuleOutcome"
): EvaluationRuleOutcome {
  const outcome = parsePlainObject(input, label);
  rejectForbiddenEvaluationRuleAuthorityFields(outcome, label);
  const kind = parseString(outcome["kind"], `${label}.kind`);
  if (kind !== "evaluation_rule_outcome") {
    throw new TypeError(
      `${label}.kind: expected "evaluation_rule_outcome", got ${JSON.stringify(kind)}`
    );
  }
  return constructEvaluationRuleOutcome({
    status: assertEvaluationRuleOutcomeStatus(
      parseString(outcome["status"], `${label}.status`),
      `${label}.status`
    ),
    ruleRef: parseNonEmptyString(outcome["ruleRef"], `${label}.ruleRef`),
    ruleRole: assertEvaluationRuleRole(
      parseString(outcome["ruleRole"], `${label}.ruleRole`),
      `${label}.ruleRole`
    ),
    computeMeans: assertRuntimeRegime(
      parseString(outcome["computeMeans"], `${label}.computeMeans`),
      `${label}.computeMeans`
    ),
    producedRegisterRefs: parseStringArray(
      parseOptionalField(outcome, "producedRegisterRefs") ?? [],
      `${label}.producedRegisterRefs`
    ),
    evidenceRefs: parseStringArray(
      parseOptionalField(outcome, "evidenceRefs") ?? [],
      `${label}.evidenceRefs`
    ),
    findingRefs: parseStringArray(
      parseOptionalField(outcome, "findingRefs") ?? [],
      `${label}.findingRefs`
    ),
    humanResponseRefs: parseStringArray(
      parseOptionalField(outcome, "humanResponseRefs") ?? [],
      `${label}.humanResponseRefs`
    ),
    residualPressureRefs: parseStringArray(
      parseOptionalField(outcome, "residualPressureRefs") ?? [],
      `${label}.residualPressureRefs`
    ),
    continuationRefs: parseStringArray(
      parseOptionalField(outcome, "continuationRefs") ?? [],
      `${label}.continuationRefs`
    ),
    diagnosticRefs: parseStringArray(
      parseOptionalField(outcome, "diagnosticRefs") ?? [],
      `${label}.diagnosticRefs`
    ),
    selectedCompositionRef: parseNonEmptyString(
      outcome["selectedCompositionRef"],
      `${label}.selectedCompositionRef`
    ),
    selectedCompositionDigest: parseNonEmptyString(
      outcome["selectedCompositionDigest"],
      `${label}.selectedCompositionDigest`
    ),
    selectedCompositionSelectionRef: parseNonEmptyString(
      outcome["selectedCompositionSelectionRef"],
      `${label}.selectedCompositionSelectionRef`
    ),
    selectedRegimeBindingRef: normalizeNullableString(
      parseOptionalNullableStringField(
        outcome,
        "selectedRegimeBindingRef",
        `${label}.selectedRegimeBindingRef`
      ),
      `${label}.selectedRegimeBindingRef`
    ),
    compositionContributionRef: parseNonEmptyString(
      outcome["compositionContributionRef"],
      `${label}.compositionContributionRef`
    ),
    reason: normalizeReason(
      parseOptionalNullableStringField(outcome, "reason", `${label}.reason`),
      `${label}.reason`
    )
  });
}

export function admitEvaluationSetPlan(
  input: unknown,
  label = "EvaluationSetPlan"
): EvaluationSetPlan {
  const plan = parsePlainObject(input, label);
  const kind = parseString(plan["kind"], `${label}.kind`);
  if (kind !== "evaluation_set_plan") {
    throw new TypeError(
      `${label}.kind: expected "evaluation_set_plan", got ${JSON.stringify(kind)}`
    );
  }
  const batchesRaw = parseOptionalField(plan, "ruleBatches");
  if (!Array.isArray(batchesRaw)) {
    throw new TypeError(`${label}.ruleBatches: expected list`);
  }
  return constructEvaluationSetPlan({
    basisId: parseNonEmptyString(plan["basisId"], `${label}.basisId`),
    graphFunctionId: parseNonEmptyString(
      plan["graphFunctionId"],
      `${label}.graphFunctionId`
    ),
    vectorIndex: Number(plan["vectorIndex"]),
    edge: parseNonEmptyString(plan["edge"], `${label}.edge`),
    selectedCompositionRef: parseNonEmptyString(
      plan["selectedCompositionRef"],
      `${label}.selectedCompositionRef`
    ),
    selectedCompositionDigest: parseNonEmptyString(
      plan["selectedCompositionDigest"],
      `${label}.selectedCompositionDigest`
    ),
    selectedCompositionSelectionRef: parseNonEmptyString(
      plan["selectedCompositionSelectionRef"],
      `${label}.selectedCompositionSelectionRef`
    ),
    ruleBatches: batchesRaw.map((batch, batchIndex) => {
      if (!Array.isArray(batch)) {
        throw new TypeError(`${label}.ruleBatches[${batchIndex}]: expected list`);
      }
      return batch.map((rule, ruleIndex) =>
        admitEvaluationRuleDeclaration(
          rule,
          `${label}.ruleBatches[${batchIndex}][${ruleIndex}]`
        )
      );
    }),
    requiredRuleRefs: parseStringArray(
      parseOptionalField(plan, "requiredRuleRefs") ?? [],
      `${label}.requiredRuleRefs`
    ),
    readOnlyInputRefs: parseStringArray(
      parseOptionalField(plan, "readOnlyInputRefs") ?? [],
      `${label}.readOnlyInputRefs`
    )
  });
}

export function admitEvaluationRuleDeclaration(
  input: unknown,
  label = "EvaluationRuleDeclaration"
): EvaluationRuleDeclaration {
  const declaration = parsePlainObject(input, label);
  const kind = parseString(declaration["kind"], `${label}.kind`);
  if (kind !== "evaluation_rule_declaration") {
    throw new TypeError(
      `${label}.kind: expected "evaluation_rule_declaration", got ${JSON.stringify(kind)}`
    );
  }
  const stageRole = parseString(declaration["stageRole"], `${label}.stageRole`);
  if (stageRole !== "evaluate") {
    throw new TypeError(`${label}.stageRole: expected evaluate`);
  }
  return constructEvaluationRuleDeclaration({
    ruleRef: parseNonEmptyString(declaration["ruleRef"], `${label}.ruleRef`),
    ruleRole: assertEvaluationRuleRole(
      parseString(declaration["ruleRole"], `${label}.ruleRole`),
      `${label}.ruleRole`
    ),
    selectedCompositionRef: parseNonEmptyString(
      declaration["selectedCompositionRef"],
      `${label}.selectedCompositionRef`
    ),
    selectedCompositionDigest: parseNonEmptyString(
      declaration["selectedCompositionDigest"],
      `${label}.selectedCompositionDigest`
    ),
    selectedCompositionSelectionRef: parseNonEmptyString(
      declaration["selectedCompositionSelectionRef"],
      `${label}.selectedCompositionSelectionRef`
    ),
    selectedRegimeBindingRef: normalizeNullableString(
      parseOptionalNullableStringField(
        declaration,
        "selectedRegimeBindingRef",
        `${label}.selectedRegimeBindingRef`
      ),
      `${label}.selectedRegimeBindingRef`
    ),
    computeMeans: assertRuntimeRegime(
      parseString(declaration["computeMeans"], `${label}.computeMeans`),
      `${label}.computeMeans`
    ),
    inputLedgerRefs: parseStringArray(
      parseOptionalField(declaration, "inputLedgerRefs") ?? [],
      `${label}.inputLedgerRefs`
    ),
    outputCarrierRefs: parseStringArray(
      parseOptionalField(declaration, "outputCarrierRefs") ?? [],
      `${label}.outputCarrierRefs`
    ),
    required: parseBoolean(
      parseOptionalField(declaration, "required") ?? true,
      `${label}.required`
    ),
    parallelGroupRef: normalizeNullableString(
      parseOptionalNullableStringField(
        declaration,
        "parallelGroupRef",
        `${label}.parallelGroupRef`
      ),
      `${label}.parallelGroupRef`
    ),
    dependencyRefs: parseStringArray(
      parseOptionalField(declaration, "dependencyRefs") ?? [],
      `${label}.dependencyRefs`
    )
  });
}

export function constructEvaluationSetAdmission(input: {
  readonly plan: EvaluationSetPlan;
  readonly outcomes: readonly EvaluationRuleOutcome[];
  readonly diagnosticRefs?: readonly string[] | undefined;
}): EvaluationSetAdmission {
  const outcomes = Object.freeze([...input.outcomes]);
  const declarationsByRef = new Map<string, EvaluationRuleDeclaration>();
  for (const declaration of input.plan.ruleBatches.flatMap((batch) => batch)) {
    declarationsByRef.set(declaration.ruleRef, declaration);
  }
  const outcomeRefs = new Set<string>();
  for (const outcome of outcomes) {
    if (outcomeRefs.has(outcome.ruleRef)) {
      throw new TypeError(`Duplicate evaluation rule outcome ${outcome.ruleRef}`);
    }
    outcomeRefs.add(outcome.ruleRef);
    const declaration = declarationsByRef.get(outcome.ruleRef);
    if (declaration === undefined) {
      throw new TypeError(
        `EvaluationRuleOutcome.ruleRef ${outcome.ruleRef} is not declared by evaluation set plan`
      );
    }
    assertEvaluationRuleOutcomeMatchesDeclaration({ declaration, outcome });
  }
  const admittedRuleOutcomes = Object.freeze(
    outcomes.filter((outcome) => outcome.status === "accepted")
  );
  const rejectedRuleOutcomes = Object.freeze(
    outcomes.filter((outcome) => outcome.status === "blocked")
  );
  const observedRuleRefs = new Set(outcomes.map((outcome) => outcome.ruleRef));
  const missingRequiredRuleRefs = Object.freeze(
    input.plan.requiredRuleRefs.filter((ruleRef) => !observedRuleRefs.has(ruleRef))
  );
  const evaluationSetDigest = stableSha256Digest({
    planRef: input.plan.planRef,
    planDigest: input.plan.planDigest,
    admittedRuleRefs: admittedRuleOutcomes.map((outcome) => outcome.ruleRef),
    rejectedRuleRefs: rejectedRuleOutcomes.map((outcome) => outcome.ruleRef),
    missingRequiredRuleRefs
  });
  return Object.freeze({
    kind: "evaluation_set_admission",
    admissionRef: `evaluation-set-admission:${evaluationSetDigest}`,
    evaluationSetRef: `evaluation-set:${evaluationSetDigest}`,
    planRef: input.plan.planRef,
    planDigest: input.plan.planDigest,
    admittedRuleOutcomes,
    rejectedRuleOutcomes,
    missingRequiredRuleRefs,
    diagnosticRefs: freezeStringArray(input.diagnosticRefs ?? Object.freeze([]))
  });
}

export function constructEvaluationSetProjection(input: {
  readonly plan: EvaluationSetPlan;
  readonly admission: EvaluationSetAdmission;
}): EvaluationSetProjection {
  if (input.admission.planRef !== input.plan.planRef) {
    throw new TypeError(
      "EvaluationSetAdmission.planRef does not match evaluation set plan"
    );
  }
  if (input.admission.planDigest !== input.plan.planDigest) {
    throw new TypeError(
      "EvaluationSetAdmission.planDigest does not match evaluation set plan"
    );
  }
  const admitted = input.admission.admittedRuleOutcomes;
  const registerRefs = uniqueStrings(
    admitted.flatMap((outcome) => outcome.producedRegisterRefs)
  );
  const evidenceRefs = uniqueStrings(admitted.flatMap((outcome) => outcome.evidenceRefs));
  const semanticFindingRefs = uniqueStrings(
    admitted.flatMap((outcome) => outcome.findingRefs)
  );
  const humanResponseRefs = uniqueStrings(
    admitted.flatMap((outcome) => outcome.humanResponseRefs)
  );
  const residualPressureRefs = uniqueStrings(
    admitted.flatMap((outcome) => outcome.residualPressureRefs)
  );
  const continuationRefs = uniqueStrings(
    admitted.flatMap((outcome) => outcome.continuationRefs)
  );
  const diagnosticRefs = uniqueStrings([
    ...input.admission.diagnosticRefs,
    ...input.admission.rejectedRuleOutcomes.flatMap(
      (outcome) => outcome.diagnosticRefs
    ),
    ...input.admission.missingRequiredRuleRefs.map(
      (ruleRef) => `diagnostic:evaluation-rule-missing:${ruleRef}`
    )
  ]);
  const foldInputRefs = uniqueStrings([
    input.plan.planRef,
    input.admission.evaluationSetRef,
    ...registerRefs,
    ...evidenceRefs,
    ...semanticFindingRefs,
    ...humanResponseRefs
  ]);
  const projectionRef = stableRef("evaluation-set-projection", {
    evaluationSetRef: input.admission.evaluationSetRef,
    foldInputRefs,
    diagnostics: diagnosticRefs
  });
  return Object.freeze({
    kind: "evaluation_set_projection",
    projectionRef,
    evaluationSetRef: input.admission.evaluationSetRef,
    planRef: input.plan.planRef,
    selectedCompositionRef: input.plan.selectedCompositionRef,
    selectedCompositionDigest: input.plan.selectedCompositionDigest,
    selectedCompositionSelectionRef: input.plan.selectedCompositionSelectionRef,
    admittedRuleRefs: admitted.map((outcome) => outcome.ruleRef),
    registerRefs,
    evidenceRefs,
    semanticFindingRefs,
    humanResponseRefs,
    residualPressureRefs,
    continuationRefs,
    diagnosticRefs,
    foldInputRefs
  });
}
