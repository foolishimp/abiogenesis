// Implements: REQ-L-GTL3-COMPUTE-NOTATION
// Implements: REQ-R-ABG3-FN-COMPOSITION
// Implements: REQ-R-ABG3-PAYLOAD

import type { RuntimeRegime } from "./carriers.js";
import {
  parseNonEmptyString,
  parseOptionalField,
  parsePlainObject,
  parseString,
  parseStringArray
} from "../../../shared/validation/primitives.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import { freezeStringArray } from "./runtime_support.js";

export const COMPOSED_STAGE_ROLE_VALUES = Object.freeze([
  "transform",
  "evaluate",
  "consequence"
] as const);

export type ComposedStageRole = (typeof COMPOSED_STAGE_ROLE_VALUES)[number];

export const COMPOSED_STAGE_TASK_ROLE_VALUES = Object.freeze([
  "candidate",
  "register",
  "semantic_judgment",
  "projection",
  "external_human_callout"
] as const);

export type ComposedStageTaskRole =
  (typeof COMPOSED_STAGE_TASK_ROLE_VALUES)[number];

export interface ComposedStageTaskDeclaration {
  readonly kind: "composed_stage_task_declaration";
  readonly taskRef: string;
  readonly stageRole: ComposedStageRole;
  readonly taskRole: ComposedStageTaskRole;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
  readonly computeMeans: RuntimeRegime;
  readonly inputLedgerRefs: readonly string[];
  readonly outputCarrierRefs: readonly string[];
  readonly required: boolean;
  readonly parallelGroupRef: string | null;
  readonly dependencyRefs: readonly string[];
  readonly readOnly: true;
}

export interface ComposedStageSetPlan {
  readonly kind: "composed_stage_set_plan";
  readonly planRef: string;
  readonly planDigest: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly stageRole: ComposedStageRole;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
  readonly taskBatches: readonly (readonly ComposedStageTaskDeclaration[])[];
  readonly requiredTaskRefs: readonly string[];
  readonly readOnlyInputRefs: readonly string[];
}

export interface ComposedStageTaskOutcome {
  readonly kind: "composed_stage_task_outcome";
  readonly status: "accepted" | "blocked";
  readonly taskRef: string;
  readonly stageRole: ComposedStageRole;
  readonly taskRole: ComposedStageTaskRole;
  readonly computeMeans: RuntimeRegime;
  readonly candidateRefs: readonly string[];
  readonly registerRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly findingRefs: readonly string[];
  readonly projectionRefs: readonly string[];
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

export interface ComposedStageAdmission {
  readonly kind: "composed_stage_admission";
  readonly admissionRef: string;
  readonly stageSetRef: string;
  readonly stageRole: ComposedStageRole;
  readonly planRef: string;
  readonly planDigest: string;
  readonly admittedTaskOutcomes: readonly ComposedStageTaskOutcome[];
  readonly rejectedTaskOutcomes: readonly ComposedStageTaskOutcome[];
  readonly missingRequiredTaskRefs: readonly string[];
  readonly diagnosticRefs: readonly string[];
}

export interface ComposedStageProjection {
  readonly kind: "composed_stage_projection";
  readonly projectionRef: string;
  readonly stageSetRef: string;
  readonly stageRole: ComposedStageRole;
  readonly planRef: string;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
  readonly admittedTaskRefs: readonly string[];
  readonly candidateRefs: readonly string[];
  readonly registerRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly findingRefs: readonly string[];
  readonly projectionRefs: readonly string[];
  readonly humanResponseRefs: readonly string[];
  readonly residualPressureRefs: readonly string[];
  readonly continuationRefs: readonly string[];
  readonly diagnosticRefs: readonly string[];
  readonly foldInputRefs: readonly string[];
}

const FORBIDDEN_STAGE_TASK_AUTHORITY_FIELDS = Object.freeze([
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
  "replayContinuation",
  "mutateGraphCall",
  "mutateFrame"
] as const);

function stableRef(prefix: string, input: unknown): string {
  return `${prefix}:${stableSha256Digest(input)}`;
}

function uniqueStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)]);
}

function normalizeNullableString(
  input: string | null | undefined,
  label: string
): string | null {
  if (input === undefined || input === null) {
    return null;
  }
  return parseNonEmptyString(input, label);
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

function assertRuntimeRegime(value: string, label: string): RuntimeRegime {
  if (value === "F_D" || value === "F_P" || value === "F_H") {
    return value;
  }
  throw new TypeError(
    `${label}: expected runtime regime, got ${JSON.stringify(value)}`
  );
}

function assertComposedStageRole(
  value: string,
  label: string
): ComposedStageRole {
  for (const role of COMPOSED_STAGE_ROLE_VALUES) {
    if (value === role) {
      return role;
    }
  }
  throw new TypeError(
    `${label}: expected composed stage role, got ${JSON.stringify(value)}`
  );
}

function assertComposedStageTaskRole(
  value: string,
  label: string
): ComposedStageTaskRole {
  for (const role of COMPOSED_STAGE_TASK_ROLE_VALUES) {
    if (value === role) {
      return role;
    }
  }
  throw new TypeError(
    `${label}: expected composed stage task role, got ${JSON.stringify(value)}`
  );
}

function assertOutcomeStatus(
  value: string,
  label: string
): ComposedStageTaskOutcome["status"] {
  if (value === "accepted" || value === "blocked") {
    return value;
  }
  throw new TypeError(
    `${label}: expected composed stage outcome status, got ${JSON.stringify(value)}`
  );
}

function rejectForbiddenStageTaskAuthorityFields(
  input: Readonly<Record<string, unknown>>,
  label: string
): void {
  for (const field of FORBIDDEN_STAGE_TASK_AUTHORITY_FIELDS) {
    if (Object.hasOwn(input, field)) {
      throw new TypeError(
        `${label}.${field}: composed stage task outcome cannot own engine authority`
      );
    }
  }
}

function assertTaskDeclarationMatchesPlan(input: {
  readonly declaration: ComposedStageTaskDeclaration;
  readonly stageRole: ComposedStageRole;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
}): void {
  if (input.declaration.stageRole !== input.stageRole) {
    throw new TypeError(
      "ComposedStageTaskDeclaration.stageRole does not match stage set plan"
    );
  }
  if (
    input.declaration.selectedCompositionRef !== input.selectedCompositionRef
  ) {
    throw new TypeError(
      "ComposedStageTaskDeclaration.selectedCompositionRef does not match stage set plan"
    );
  }
  if (
    input.declaration.selectedCompositionDigest !==
    input.selectedCompositionDigest
  ) {
    throw new TypeError(
      "ComposedStageTaskDeclaration.selectedCompositionDigest does not match stage set plan"
    );
  }
  if (
    input.declaration.selectedCompositionSelectionRef !==
    input.selectedCompositionSelectionRef
  ) {
    throw new TypeError(
      "ComposedStageTaskDeclaration.selectedCompositionSelectionRef does not match stage set plan"
    );
  }
}

export function assertComposedStageTaskOutcomeMatchesDeclaration(input: {
  readonly declaration: ComposedStageTaskDeclaration;
  readonly outcome: ComposedStageTaskOutcome;
}): void {
  if (input.outcome.taskRef !== input.declaration.taskRef) {
    throw new TypeError(
      "ComposedStageTaskOutcome.taskRef does not match declaration"
    );
  }
  if (input.outcome.stageRole !== input.declaration.stageRole) {
    throw new TypeError(
      "ComposedStageTaskOutcome.stageRole does not match declaration"
    );
  }
  if (input.outcome.taskRole !== input.declaration.taskRole) {
    throw new TypeError(
      "ComposedStageTaskOutcome.taskRole does not match declaration"
    );
  }
  if (input.outcome.computeMeans !== input.declaration.computeMeans) {
    throw new TypeError(
      "ComposedStageTaskOutcome.computeMeans does not match declaration"
    );
  }
  if (
    input.outcome.selectedCompositionRef !==
    input.declaration.selectedCompositionRef
  ) {
    throw new TypeError(
      "ComposedStageTaskOutcome.selectedCompositionRef does not match selected abg.fn_composition"
    );
  }
  if (
    input.outcome.selectedCompositionDigest !==
    input.declaration.selectedCompositionDigest
  ) {
    throw new TypeError(
      "ComposedStageTaskOutcome.selectedCompositionDigest does not match selected abg.fn_composition"
    );
  }
  if (
    input.outcome.selectedCompositionSelectionRef !==
    input.declaration.selectedCompositionSelectionRef
  ) {
    throw new TypeError(
      "ComposedStageTaskOutcome.selectedCompositionSelectionRef does not match selected abg.fn_composition"
    );
  }
  if (
    input.outcome.selectedRegimeBindingRef !==
    input.declaration.selectedRegimeBindingRef
  ) {
    throw new TypeError(
      "ComposedStageTaskOutcome.selectedRegimeBindingRef does not match declaration"
    );
  }
  const expectedContributionRef =
    input.declaration.selectedRegimeBindingRef ??
    input.declaration.selectedCompositionRef;
  if (input.outcome.compositionContributionRef !== expectedContributionRef) {
    throw new TypeError(
      "ComposedStageTaskOutcome.compositionContributionRef does not match selected regime binding"
    );
  }
}

export function constructComposedStageTaskDeclaration(input: {
  readonly taskRef: string;
  readonly stageRole: ComposedStageRole;
  readonly taskRole: ComposedStageTaskRole;
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
}): ComposedStageTaskDeclaration {
  if (input.computeMeans === "F_H" && input.taskRole !== "external_human_callout") {
    throw new TypeError(
      "ComposedStageTaskDeclaration F_H task must be external_human_callout"
    );
  }
  return Object.freeze({
    kind: "composed_stage_task_declaration",
    taskRef: parseNonEmptyString(
      input.taskRef,
      "ComposedStageTaskDeclaration.taskRef"
    ),
    stageRole: input.stageRole,
    taskRole: input.taskRole,
    selectedCompositionRef: parseNonEmptyString(
      input.selectedCompositionRef,
      "ComposedStageTaskDeclaration.selectedCompositionRef"
    ),
    selectedCompositionDigest: parseNonEmptyString(
      input.selectedCompositionDigest,
      "ComposedStageTaskDeclaration.selectedCompositionDigest"
    ),
    selectedCompositionSelectionRef: parseNonEmptyString(
      input.selectedCompositionSelectionRef,
      "ComposedStageTaskDeclaration.selectedCompositionSelectionRef"
    ),
    selectedRegimeBindingRef: normalizeNullableString(
      input.selectedRegimeBindingRef,
      "ComposedStageTaskDeclaration.selectedRegimeBindingRef"
    ),
    computeMeans: input.computeMeans,
    inputLedgerRefs: freezeStringArray(input.inputLedgerRefs ?? Object.freeze([])),
    outputCarrierRefs: freezeStringArray(
      input.outputCarrierRefs ?? Object.freeze([])
    ),
    required: input.required ?? true,
    parallelGroupRef: normalizeNullableString(
      input.parallelGroupRef,
      "ComposedStageTaskDeclaration.parallelGroupRef"
    ),
    dependencyRefs: freezeStringArray(input.dependencyRefs ?? Object.freeze([])),
    readOnly: true
  });
}

export function constructComposedStageSetPlan(input: {
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly stageRole: ComposedStageRole;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
  readonly taskBatches: readonly (readonly ComposedStageTaskDeclaration[])[];
  readonly requiredTaskRefs?: readonly string[] | undefined;
  readonly readOnlyInputRefs?: readonly string[] | undefined;
}): ComposedStageSetPlan {
  const selectedCompositionRef = parseNonEmptyString(
    input.selectedCompositionRef,
    "ComposedStageSetPlan.selectedCompositionRef"
  );
  const selectedCompositionDigest = parseNonEmptyString(
    input.selectedCompositionDigest,
    "ComposedStageSetPlan.selectedCompositionDigest"
  );
  const selectedCompositionSelectionRef = parseNonEmptyString(
    input.selectedCompositionSelectionRef,
    "ComposedStageSetPlan.selectedCompositionSelectionRef"
  );
  const taskBatches = Object.freeze(
    input.taskBatches.map((batch) => Object.freeze([...batch]))
  );
  const taskRefs = new Set<string>();
  const taskBatchIndexes = new Map<string, number>();
  for (const [batchIndex, batch] of taskBatches.entries()) {
    for (const task of batch) {
      assertTaskDeclarationMatchesPlan({
        declaration: task,
        stageRole: input.stageRole,
        selectedCompositionRef,
        selectedCompositionDigest,
        selectedCompositionSelectionRef
      });
      if (taskRefs.has(task.taskRef)) {
        throw new TypeError(`Duplicate composed stage task ref ${task.taskRef}`);
      }
      taskRefs.add(task.taskRef);
      taskBatchIndexes.set(task.taskRef, batchIndex);
    }
  }
  for (const [batchIndex, batch] of taskBatches.entries()) {
    for (const task of batch) {
      for (const dependencyRef of task.dependencyRefs) {
        const dependencyBatchIndex = taskBatchIndexes.get(dependencyRef);
        if (dependencyBatchIndex === undefined) {
          throw new TypeError(
            `ComposedStageTaskDeclaration.dependencyRefs contains unknown task ${dependencyRef}`
          );
        }
        if (dependencyRef === task.taskRef) {
          throw new TypeError(
            `ComposedStageTaskDeclaration.dependencyRefs cannot self-reference ${task.taskRef}`
          );
        }
        if (dependencyBatchIndex >= batchIndex) {
          throw new TypeError(
            "ComposedStageTaskDeclaration.dependencyRefs must reference an earlier stage-set batch"
          );
        }
      }
    }
  }
  const requiredTaskRefs = uniqueStrings([
    ...taskBatches.flatMap((batch) =>
      batch.filter((task) => task.required).map((task) => task.taskRef)
    ),
    ...(input.requiredTaskRefs ?? Object.freeze([]))
  ]);
  const planDigest = stableSha256Digest({
    basisId: input.basisId,
    graphFunctionId: input.graphFunctionId,
    vectorIndex: input.vectorIndex,
    edge: input.edge,
    stageRole: input.stageRole,
    selectedCompositionRef,
    selectedCompositionDigest,
    taskBatches: taskBatches.map((batch) =>
      batch.map((task) => ({
        taskRef: task.taskRef,
        taskRole: task.taskRole,
        computeMeans: task.computeMeans,
        required: task.required,
        parallelGroupRef: task.parallelGroupRef,
        dependencyRefs: task.dependencyRefs
      }))
    ),
    requiredTaskRefs
  });
  return Object.freeze({
    kind: "composed_stage_set_plan",
    planRef: `composed-stage-set-plan:${planDigest}`,
    planDigest,
    basisId: parseNonEmptyString(input.basisId, "ComposedStageSetPlan.basisId"),
    graphFunctionId: parseNonEmptyString(
      input.graphFunctionId,
      "ComposedStageSetPlan.graphFunctionId"
    ),
    vectorIndex: input.vectorIndex,
    edge: parseNonEmptyString(input.edge, "ComposedStageSetPlan.edge"),
    stageRole: input.stageRole,
    selectedCompositionRef,
    selectedCompositionDigest,
    selectedCompositionSelectionRef,
    taskBatches,
    requiredTaskRefs,
    readOnlyInputRefs: freezeStringArray(
      input.readOnlyInputRefs ?? Object.freeze([])
    )
  });
}

export function constructComposedStageTaskOutcome(input: {
  readonly status: ComposedStageTaskOutcome["status"];
  readonly taskRef: string;
  readonly stageRole: ComposedStageRole;
  readonly taskRole: ComposedStageTaskRole;
  readonly computeMeans: RuntimeRegime;
  readonly candidateRefs?: readonly string[] | undefined;
  readonly registerRefs?: readonly string[] | undefined;
  readonly evidenceRefs?: readonly string[] | undefined;
  readonly findingRefs?: readonly string[] | undefined;
  readonly projectionRefs?: readonly string[] | undefined;
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
}): ComposedStageTaskOutcome {
  if (input.status !== "accepted" && input.status !== "blocked") {
    throw new TypeError(
      `ComposedStageTaskOutcome.status: expected accepted or blocked, got ${JSON.stringify(input.status)}`
    );
  }
  const candidateRefs = freezeStringArray(input.candidateRefs ?? Object.freeze([]));
  const registerRefs = freezeStringArray(input.registerRefs ?? Object.freeze([]));
  const evidenceRefs = freezeStringArray(input.evidenceRefs ?? Object.freeze([]));
  const findingRefs = freezeStringArray(input.findingRefs ?? Object.freeze([]));
  const projectionRefs = freezeStringArray(
    input.projectionRefs ?? Object.freeze([])
  );
  const humanResponseRefs = freezeStringArray(
    input.humanResponseRefs ?? Object.freeze([])
  );
  if (
    input.status === "accepted" &&
    candidateRefs.length === 0 &&
    registerRefs.length === 0 &&
    evidenceRefs.length === 0 &&
    findingRefs.length === 0 &&
    projectionRefs.length === 0 &&
    humanResponseRefs.length === 0
  ) {
    throw new TypeError(
      "ComposedStageTaskOutcome accepted status requires at least one candidate, register, evidence, finding, projection, or human response ref"
    );
  }
  const selectedRegimeBindingRef = normalizeNullableString(
    input.selectedRegimeBindingRef,
    "ComposedStageTaskOutcome.selectedRegimeBindingRef"
  );
  return Object.freeze({
    kind: "composed_stage_task_outcome",
    status: input.status,
    taskRef: parseNonEmptyString(
      input.taskRef,
      "ComposedStageTaskOutcome.taskRef"
    ),
    stageRole: input.stageRole,
    taskRole: input.taskRole,
    computeMeans: input.computeMeans,
    candidateRefs,
    registerRefs,
    evidenceRefs,
    findingRefs,
    projectionRefs,
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
      "ComposedStageTaskOutcome.selectedCompositionRef"
    ),
    selectedCompositionDigest: parseNonEmptyString(
      input.selectedCompositionDigest,
      "ComposedStageTaskOutcome.selectedCompositionDigest"
    ),
    selectedCompositionSelectionRef: parseNonEmptyString(
      input.selectedCompositionSelectionRef,
      "ComposedStageTaskOutcome.selectedCompositionSelectionRef"
    ),
    selectedRegimeBindingRef,
    compositionContributionRef: parseNonEmptyString(
      input.compositionContributionRef ??
        selectedRegimeBindingRef ??
        input.selectedCompositionRef,
      "ComposedStageTaskOutcome.compositionContributionRef"
    ),
    reason: normalizeReason(input.reason, "ComposedStageTaskOutcome.reason")
  });
}

export function admitComposedStageTaskOutcome(
  input: unknown,
  label = "ComposedStageTaskOutcome"
): ComposedStageTaskOutcome {
  const outcome = parsePlainObject(input, label);
  rejectForbiddenStageTaskAuthorityFields(outcome, label);
  const kind = parseString(outcome["kind"], `${label}.kind`);
  if (kind !== "composed_stage_task_outcome") {
    throw new TypeError(
      `${label}.kind: expected "composed_stage_task_outcome", got ${JSON.stringify(kind)}`
    );
  }
  return constructComposedStageTaskOutcome({
    status: assertOutcomeStatus(
      parseString(outcome["status"], `${label}.status`),
      `${label}.status`
    ),
    taskRef: parseNonEmptyString(outcome["taskRef"], `${label}.taskRef`),
    stageRole: assertComposedStageRole(
      parseString(outcome["stageRole"], `${label}.stageRole`),
      `${label}.stageRole`
    ),
    taskRole: assertComposedStageTaskRole(
      parseString(outcome["taskRole"], `${label}.taskRole`),
      `${label}.taskRole`
    ),
    computeMeans: assertRuntimeRegime(
      parseString(outcome["computeMeans"], `${label}.computeMeans`),
      `${label}.computeMeans`
    ),
    candidateRefs: parseStringArray(
      parseOptionalField(outcome, "candidateRefs") ?? [],
      `${label}.candidateRefs`
    ),
    registerRefs: parseStringArray(
      parseOptionalField(outcome, "registerRefs") ?? [],
      `${label}.registerRefs`
    ),
    evidenceRefs: parseStringArray(
      parseOptionalField(outcome, "evidenceRefs") ?? [],
      `${label}.evidenceRefs`
    ),
    findingRefs: parseStringArray(
      parseOptionalField(outcome, "findingRefs") ?? [],
      `${label}.findingRefs`
    ),
    projectionRefs: parseStringArray(
      parseOptionalField(outcome, "projectionRefs") ?? [],
      `${label}.projectionRefs`
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

export function constructComposedStageAdmission(input: {
  readonly plan: ComposedStageSetPlan;
  readonly outcomes: readonly ComposedStageTaskOutcome[];
  readonly diagnosticRefs?: readonly string[] | undefined;
}): ComposedStageAdmission {
  const outcomes = Object.freeze([...input.outcomes]);
  const declarationsByRef = new Map<string, ComposedStageTaskDeclaration>();
  for (const declaration of input.plan.taskBatches.flatMap((batch) => batch)) {
    declarationsByRef.set(declaration.taskRef, declaration);
  }
  const outcomeRefs = new Set<string>();
  for (const outcome of outcomes) {
    if (outcomeRefs.has(outcome.taskRef)) {
      throw new TypeError(`Duplicate composed stage task outcome ${outcome.taskRef}`);
    }
    outcomeRefs.add(outcome.taskRef);
    const declaration = declarationsByRef.get(outcome.taskRef);
    if (declaration === undefined) {
      throw new TypeError(
        `ComposedStageTaskOutcome.taskRef ${outcome.taskRef} is not declared by composed stage set plan`
      );
    }
    assertComposedStageTaskOutcomeMatchesDeclaration({ declaration, outcome });
  }
  const admittedTaskOutcomes = Object.freeze(
    outcomes.filter((outcome) => outcome.status === "accepted")
  );
  const rejectedTaskOutcomes = Object.freeze(
    outcomes.filter((outcome) => outcome.status === "blocked")
  );
  const observedTaskRefs = new Set(outcomes.map((outcome) => outcome.taskRef));
  const missingRequiredTaskRefs = Object.freeze(
    input.plan.requiredTaskRefs.filter((taskRef) => !observedTaskRefs.has(taskRef))
  );
  const stageSetDigest = stableSha256Digest({
    planRef: input.plan.planRef,
    planDigest: input.plan.planDigest,
    stageRole: input.plan.stageRole,
    admittedTaskRefs: admittedTaskOutcomes.map((outcome) => outcome.taskRef),
    rejectedTaskRefs: rejectedTaskOutcomes.map((outcome) => outcome.taskRef),
    missingRequiredTaskRefs
  });
  return Object.freeze({
    kind: "composed_stage_admission",
    admissionRef: `composed-stage-admission:${stageSetDigest}`,
    stageSetRef: `composed-stage-set:${stageSetDigest}`,
    stageRole: input.plan.stageRole,
    planRef: input.plan.planRef,
    planDigest: input.plan.planDigest,
    admittedTaskOutcomes,
    rejectedTaskOutcomes,
    missingRequiredTaskRefs,
    diagnosticRefs: freezeStringArray(input.diagnosticRefs ?? Object.freeze([]))
  });
}

export function constructComposedStageProjection(input: {
  readonly plan: ComposedStageSetPlan;
  readonly admission: ComposedStageAdmission;
}): ComposedStageProjection {
  if (input.admission.stageRole !== input.plan.stageRole) {
    throw new TypeError(
      "ComposedStageAdmission.stageRole does not match composed stage set plan"
    );
  }
  if (input.admission.planRef !== input.plan.planRef) {
    throw new TypeError(
      "ComposedStageAdmission.planRef does not match composed stage set plan"
    );
  }
  if (input.admission.planDigest !== input.plan.planDigest) {
    throw new TypeError(
      "ComposedStageAdmission.planDigest does not match composed stage set plan"
    );
  }
  const admitted = input.admission.admittedTaskOutcomes;
  const candidateRefs = uniqueStrings(
    admitted.flatMap((outcome) => outcome.candidateRefs)
  );
  const registerRefs = uniqueStrings(
    admitted.flatMap((outcome) => outcome.registerRefs)
  );
  const evidenceRefs = uniqueStrings(admitted.flatMap((outcome) => outcome.evidenceRefs));
  const findingRefs = uniqueStrings(admitted.flatMap((outcome) => outcome.findingRefs));
  const projectionRefs = uniqueStrings(
    admitted.flatMap((outcome) => outcome.projectionRefs)
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
    ...input.admission.rejectedTaskOutcomes.flatMap(
      (outcome) => outcome.diagnosticRefs
    ),
    ...input.admission.missingRequiredTaskRefs.map(
      (taskRef) => `diagnostic:composed-stage-task-missing:${taskRef}`
    )
  ]);
  const foldInputRefs = uniqueStrings([
    input.plan.planRef,
    input.admission.stageSetRef,
    ...candidateRefs,
    ...registerRefs,
    ...evidenceRefs,
    ...findingRefs,
    ...projectionRefs,
    ...humanResponseRefs
  ]);
  const projectionRef = stableRef("composed-stage-projection", {
    stageSetRef: input.admission.stageSetRef,
    stageRole: input.plan.stageRole,
    foldInputRefs,
    diagnostics: diagnosticRefs
  });
  return Object.freeze({
    kind: "composed_stage_projection",
    projectionRef,
    stageSetRef: input.admission.stageSetRef,
    stageRole: input.plan.stageRole,
    planRef: input.plan.planRef,
    selectedCompositionRef: input.plan.selectedCompositionRef,
    selectedCompositionDigest: input.plan.selectedCompositionDigest,
    selectedCompositionSelectionRef: input.plan.selectedCompositionSelectionRef,
    admittedTaskRefs: admitted.map((outcome) => outcome.taskRef),
    candidateRefs,
    registerRefs,
    evidenceRefs,
    findingRefs,
    projectionRefs,
    humanResponseRefs,
    residualPressureRefs,
    continuationRefs,
    diagnosticRefs,
    foldInputRefs
  });
}
