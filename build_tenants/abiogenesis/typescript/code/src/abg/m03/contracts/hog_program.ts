// Implements: REQ-R-ABG3-CCALL-014 (declared edge programs), -003
// (census from the admitted program), §15 stratification law (the baked
// bootstrap triple is P0; everything richer is admitted GTL).
// HoG.GTL carrier: an edge program is DATA — a declared composition of
// C calls the engine interprets. The engine never carries a program
// richer than HOG_BOOTSTRAP_TRIPLE in code.

import type { CCallRegime, CCallStageRole } from "./carriers.js";
import { C_CALL_REGIME_VALUES } from "./carriers.js";
import { isPlainRecord } from "./admission_hygiene.js";
import {
  C_RETRY_POLICY_REF,
  deriveCRetryPolicyProjection
} from "./c_retry_policy.js";

export interface HogProgramStage {
  readonly stageRole: CCallStageRole;
  readonly defaultRegime: CCallRegime;
  readonly armId: string;
  readonly resultBearing: boolean;
  // -015/-016 prompt-level tuning: the INLINED form of cognitive stages —
  // instruction categories folded into this stage's prompt (T-191
  // section machinery consumes these at render).
  readonly instructionCategoryRefs?: readonly string[] | undefined;
}

export interface HogWorkflowLift {
  readonly kind: "hog_workflow_lift";
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly graphFunctionRef: string;
}

export interface HogBatchStageTask {
  readonly kind: "hog_batch_stage_task";
  readonly ordinal: number;
  readonly stage: HogProgramStage;
}

export interface HogBatchDeclaration {
  readonly kind: "hog_batch_declaration";
  readonly batchRef: string;
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly tasks: readonly HogBatchStageTask[];
}

export interface HogRetryDeclaration {
  readonly kind: "hog_retry_declaration";
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly maxAttempts: number;
  readonly stage: HogProgramStage;
  readonly retryPolicyRef: typeof C_RETRY_POLICY_REF;
  readonly retryPolicyDigest: `sha256:${string}`;
}

export interface HogFlatProgramDeclaration {
  readonly kind: "hog_program_declaration";
  readonly programRef: string;
  readonly stages: readonly HogProgramStage[];
  readonly proportionalityClass: string | null;
  readonly workflow?: never;
  readonly batch?: never;
  readonly retry?: never;
}

export interface HogWorkflowProgramDeclaration {
  readonly kind: "hog_program_declaration";
  readonly programRef: string;
  readonly stages: readonly [];
  readonly proportionalityClass: string | null;
  readonly workflow: HogWorkflowLift;
  readonly batch?: never;
  readonly retry?: never;
}

export interface HogBatchProgramDeclaration {
  readonly kind: "hog_program_declaration";
  readonly programRef: string;
  readonly stages: readonly [];
  readonly proportionalityClass: string | null;
  readonly workflow?: never;
  readonly batch: HogBatchDeclaration;
  readonly retry?: never;
}

export interface HogRetryProgramDeclaration {
  readonly kind: "hog_program_declaration";
  readonly programRef: string;
  readonly stages: readonly [];
  readonly proportionalityClass: string | null;
  readonly workflow?: never;
  readonly batch?: never;
  readonly retry: HogRetryDeclaration;
}

export type HogProgramDeclaration =
  | HogFlatProgramDeclaration
  | HogWorkflowProgramDeclaration
  | HogBatchProgramDeclaration
  | HogRetryProgramDeclaration;

export interface HogProgramAdmission {
  readonly accepted: boolean;
  readonly program: HogProgramDeclaration | null;
  readonly issues: readonly string[];
}

// The ONE program the engine carries in code: bootstrap P0. Never
// removed, never extended — richer programs are admitted GTL
// declarations that override per overlay/edge (§15 stratification law).
export const HOG_BOOTSTRAP_TRIPLE: HogProgramDeclaration = Object.freeze({
  kind: "hog_program_declaration",
  programRef: "gtl://abg/hog/bootstrap-triple",
  stages: Object.freeze([
    Object.freeze({
      stageRole: "transform",
      defaultRegime: "F_P",
      armId: "arm://abg/hog/transform",
      resultBearing: true
    }),
    Object.freeze({
      stageRole: "evaluate",
      defaultRegime: "F_P",
      armId: "arm://abg/hog/evaluate",
      resultBearing: false
    }),
    Object.freeze({
      stageRole: "consequence",
      defaultRegime: "F_D",
      armId: "arm://abg/hog/consequence",
      resultBearing: false
    })
  ]),
  proportionalityClass: null
});

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

// Fail-closed admission for declared programs (-014): non-empty stage
// list, unique roles, exactly one result-bearing role, lawful regimes,
// named arms. The (role × fibre) census derives from what admits here.
const HOG_PROGRAM_KEYS = Object.freeze([
  "kind",
  "programRef",
  "stages",
  "proportionalityClass",
  "workflow",
  "batch",
  "retry"
]);
const HOG_STAGE_KEYS = Object.freeze([
  "stageRole",
  "defaultRegime",
  "armId",
  "resultBearing",
  "instructionCategoryRefs"
]);
const HOG_WORKFLOW_KEYS = Object.freeze([
  "kind",
  "inputCarrierRef",
  "outputCarrierRef",
  "graphFunctionRef"
]);
const HOG_BATCH_KEYS = Object.freeze([
  "kind",
  "batchRef",
  "inputCarrierRef",
  "outputCarrierRef",
  "tasks"
]);
const HOG_BATCH_TASK_KEYS = Object.freeze([
  "kind",
  "ordinal",
  "stage"
]);
const HOG_RETRY_KEYS = Object.freeze([
  "kind",
  "inputCarrierRef",
  "outputCarrierRef",
  "maxAttempts",
  "stage",
  "retryPolicyRef",
  "retryPolicyDigest"
]);

function admitStageRaw(
  stageRaw: unknown,
  at: string,
  issues: string[]
): HogProgramStage | null {
  if (!isPlainRecord(stageRaw)) {
    issues.push(`${at} must be an object`);
    return null;
  }
  for (const key of Object.keys(stageRaw)) {
    if (!HOG_STAGE_KEYS.includes(key)) {
      issues.push(
        `${at}: unknown stage field ${JSON.stringify(key)} (closed key set)`
      );
    }
  }
  const stageRole = stageRaw["stageRole"];
  if (!isNonEmptyString(stageRole)) {
    issues.push(`${at}.stageRole must be a non-empty string`);
  }
  const defaultRegime = stageRaw["defaultRegime"];
  const regimeValid = C_CALL_REGIME_VALUES.some(
    (regime): boolean => regime === defaultRegime
  );
  if (!regimeValid) {
    issues.push(
      `${at}.defaultRegime must be one of ${JSON.stringify(C_CALL_REGIME_VALUES)}`
    );
  }
  const armId = stageRaw["armId"];
  if (!isNonEmptyString(armId)) {
    issues.push(`${at}.armId must be a non-empty string`);
  }
  const resultBearing = stageRaw["resultBearing"];
  if (typeof resultBearing !== "boolean") {
    issues.push(`${at}.resultBearing must be a boolean`);
  }
  const categoryRefsRaw = stageRaw["instructionCategoryRefs"];
  let instructionCategoryRefs: readonly string[] | undefined;
  if (categoryRefsRaw !== undefined) {
    if (
      !Array.isArray(categoryRefsRaw) ||
      !categoryRefsRaw.every(isNonEmptyString)
    ) {
      issues.push(`${at}.instructionCategoryRefs must be non-empty strings`);
    } else {
      instructionCategoryRefs = Object.freeze([...categoryRefsRaw]);
    }
  }
  if (
    !isNonEmptyString(stageRole) ||
    !isNonEmptyString(armId) ||
    typeof resultBearing !== "boolean" ||
    !regimeValid ||
    !isCCallRegime(defaultRegime)
  ) {
    return null;
  }
  return Object.freeze({
    stageRole,
    defaultRegime,
    armId,
    resultBearing,
    ...(instructionCategoryRefs === undefined
      ? {}
      : { instructionCategoryRefs })
  });
}

export function admitHogProgram(input: unknown): HogProgramAdmission {
  const issues: string[] = [];
  if (!isPlainRecord(input)) {
    return Object.freeze({ accepted: false, program: null, issues: Object.freeze(["program declaration must be an object"]) });
  }
  const record = input;
  // CLOSED KEY SET (codex P1): the program surface is the monad's
  // configuration — unknown siblings are rejected, never carried as a
  // metadata bag (second-truth-surface guard).
  for (const key of Object.keys(record)) {
    if (!HOG_PROGRAM_KEYS.includes(key)) {
      issues.push(`unknown program field ${JSON.stringify(key)} (closed key set)`);
    }
  }
  if (record["kind"] !== "hog_program_declaration") {
    issues.push("kind must be hog_program_declaration");
  }
  const programRefRaw = record["programRef"];
  if (!isNonEmptyString(programRefRaw)) {
    issues.push("programRef must be a non-empty string");
  }
  const stagesRaw = record["stages"];
  const stages: readonly unknown[] | null = Array.isArray(stagesRaw) ? stagesRaw : null;
  const workflowRaw = record["workflow"];
  let workflow: HogWorkflowLift | null = null;
  if (workflowRaw !== undefined) {
    if (!isPlainRecord(workflowRaw)) {
      issues.push("workflow must be an object when present");
    } else {
      for (const key of Object.keys(workflowRaw)) {
        if (!HOG_WORKFLOW_KEYS.includes(key)) {
          issues.push(`workflow: unknown field ${JSON.stringify(key)} (closed key set)`);
        }
      }
      if (workflowRaw["kind"] !== "hog_workflow_lift") {
        issues.push("workflow.kind must be hog_workflow_lift");
      }
      const inputCarrierRef = workflowRaw["inputCarrierRef"];
      const outputCarrierRef = workflowRaw["outputCarrierRef"];
      const graphFunctionRef = workflowRaw["graphFunctionRef"];
      if (!isNonEmptyString(inputCarrierRef)) {
        issues.push("workflow.inputCarrierRef must be a non-empty string");
      }
      if (!isNonEmptyString(outputCarrierRef)) {
        issues.push("workflow.outputCarrierRef must be a non-empty string");
      }
      if (!isNonEmptyString(graphFunctionRef)) {
        issues.push("workflow.graphFunctionRef must be a non-empty string");
      }
      if (
        isNonEmptyString(inputCarrierRef) &&
        isNonEmptyString(outputCarrierRef) &&
        isNonEmptyString(graphFunctionRef)
      ) {
        workflow = Object.freeze({
          kind: "hog_workflow_lift" as const,
          inputCarrierRef,
          outputCarrierRef,
          graphFunctionRef
        });
      }
    }
  }
  const batchRaw = record["batch"];
  let batch: HogBatchDeclaration | null = null;
  if (batchRaw !== undefined) {
    if (!isPlainRecord(batchRaw)) {
      issues.push("batch must be an object when present");
    } else {
      for (const key of Object.keys(batchRaw)) {
        if (!HOG_BATCH_KEYS.includes(key)) {
          issues.push(
            `batch: unknown field ${JSON.stringify(key)} (closed key set)`
          );
        }
      }
      if (batchRaw["kind"] !== "hog_batch_declaration") {
        issues.push("batch.kind must be hog_batch_declaration");
      }
      const batchRef = batchRaw["batchRef"];
      const inputCarrierRef = batchRaw["inputCarrierRef"];
      const outputCarrierRef = batchRaw["outputCarrierRef"];
      if (!isNonEmptyString(batchRef)) {
        issues.push("batch.batchRef must be a non-empty string");
      }
      if (!isNonEmptyString(inputCarrierRef)) {
        issues.push("batch.inputCarrierRef must be a non-empty string");
      }
      if (!isNonEmptyString(outputCarrierRef)) {
        issues.push("batch.outputCarrierRef must be a non-empty string");
      }
      const tasksRaw = batchRaw["tasks"];
      const tasks: HogBatchStageTask[] = [];
      if (!Array.isArray(tasksRaw) || tasksRaw.length === 0) {
        issues.push("batch.tasks must be a non-empty array");
      } else {
        let resultBearing: boolean | null = null;
        for (const [index, taskRaw] of tasksRaw.entries()) {
          const at = `batch.tasks[${String(index)}]`;
          if (!isPlainRecord(taskRaw)) {
            issues.push(`${at} must be an object`);
            continue;
          }
          for (const key of Object.keys(taskRaw)) {
            if (!HOG_BATCH_TASK_KEYS.includes(key)) {
              issues.push(
                `${at}: unknown field ${JSON.stringify(key)} (closed key set)`
              );
            }
          }
          if (taskRaw["kind"] !== "hog_batch_stage_task") {
            issues.push(`${at}.kind must be hog_batch_stage_task`);
          }
          if (taskRaw["ordinal"] !== index) {
            issues.push(`${at}.ordinal must equal its zero-based list position`);
          }
          const stage = admitStageRaw(taskRaw["stage"], `${at}.stage`, issues);
          if (stage === null || taskRaw["ordinal"] !== index) {
            continue;
          }
          if (resultBearing === null) {
            resultBearing = stage.resultBearing;
          } else if (stage.resultBearing !== resultBearing) {
            issues.push(
              `${at}.stage.resultBearing must match batch.tasks[0]`
            );
          }
          tasks.push(
            Object.freeze({
              kind: "hog_batch_stage_task" as const,
              ordinal: index,
              stage
            })
          );
        }
      }
      if (
        isNonEmptyString(batchRef) &&
        isNonEmptyString(inputCarrierRef) &&
        isNonEmptyString(outputCarrierRef) &&
        Array.isArray(tasksRaw) &&
        tasks.length === tasksRaw.length &&
        tasks.length > 0
      ) {
        batch = Object.freeze({
          kind: "hog_batch_declaration" as const,
          batchRef,
          inputCarrierRef,
          outputCarrierRef,
          tasks: Object.freeze(tasks)
        });
      }
    }
  }
  const retryRaw = record["retry"];
  let retry: HogRetryDeclaration | null = null;
  if (retryRaw !== undefined) {
    if (!isPlainRecord(retryRaw)) {
      issues.push("retry must be an object when present");
    } else {
      for (const key of Object.keys(retryRaw)) {
        if (!HOG_RETRY_KEYS.includes(key)) {
          issues.push(
            `retry: unknown field ${JSON.stringify(key)} (closed key set)`
          );
        }
      }
      if (retryRaw["kind"] !== "hog_retry_declaration") {
        issues.push("retry.kind must be hog_retry_declaration");
      }
      const inputCarrierRef = retryRaw["inputCarrierRef"];
      const outputCarrierRef = retryRaw["outputCarrierRef"];
      const maxAttempts = retryRaw["maxAttempts"];
      if (!isNonEmptyString(inputCarrierRef)) {
        issues.push("retry.inputCarrierRef must be a non-empty string");
      }
      if (!isNonEmptyString(outputCarrierRef)) {
        issues.push("retry.outputCarrierRef must be a non-empty string");
      }
      if (
        typeof maxAttempts !== "number" ||
        !Number.isInteger(maxAttempts) ||
        maxAttempts < 1
      ) {
        issues.push("retry.maxAttempts must be a positive integer");
      }
      const stage = admitStageRaw(retryRaw["stage"], "retry.stage", issues);
      if (stage !== null && stage.resultBearing !== true) {
        issues.push("retry.stage must be result-bearing");
      }
      const policy = deriveCRetryPolicyProjection();
      if (retryRaw["retryPolicyRef"] !== policy.policyRef) {
        issues.push("retry.retryPolicyRef must equal the shared C.retry policy ref");
      }
      if (retryRaw["retryPolicyDigest"] !== policy.policyDigest) {
        issues.push(
          "retry.retryPolicyDigest must equal the shared C.retry policy digest"
        );
      }
      if (
        isNonEmptyString(inputCarrierRef) &&
        isNonEmptyString(outputCarrierRef) &&
        typeof maxAttempts === "number" &&
        Number.isInteger(maxAttempts) &&
        maxAttempts >= 1 &&
        stage !== null &&
        stage.resultBearing === true &&
        retryRaw["retryPolicyRef"] === policy.policyRef &&
        retryRaw["retryPolicyDigest"] === policy.policyDigest
      ) {
        retry = Object.freeze({
          kind: "hog_retry_declaration" as const,
          inputCarrierRef,
          outputCarrierRef,
          maxAttempts,
          stage,
          retryPolicyRef: policy.policyRef,
          retryPolicyDigest: policy.policyDigest
        });
      }
    }
  }
  const variantCount = [workflowRaw, batchRaw, retryRaw].filter(
    (value) => value !== undefined
  ).length;
  if (variantCount > 1) {
    issues.push("workflow, batch, and retry program variants are mutually exclusive");
  }
  if (stages === null) {
    issues.push("stages must be an array");
  } else if (
    variantCount === 0 &&
    stages.length === 0
  ) {
    issues.push("flat program stages must be a non-empty array");
  } else if (
    variantCount > 0 &&
    stages.length !== 0
  ) {
    issues.push(
      retryRaw === undefined
        ? "workflow and batch program stages must be empty"
        : "workflow, batch, and retry program stages must be empty"
    );
  }
  let resultBearingCount = 0;
  const admittedStages: HogProgramStage[] = [];
  for (const [index, stageRaw] of (
    variantCount === 0 ? (stages ?? []) : []
  ).entries()) {
    const at = `stages[${index}]`;
    const stage = admitStageRaw(stageRaw, at, issues);
    if (stage === null) {
      continue;
    }
    if (stage.resultBearing) {
      resultBearingCount += 1;
    }
    admittedStages.push(stage);
  }
  if (
    variantCount === 0 &&
    stages !== null &&
    stages.length > 0 &&
    resultBearingCount !== 1
  ) {
    issues.push(`exactly one result-bearing stage required, got ${resultBearingCount}`);
  }
  const proportionalityRaw = record["proportionalityClass"];
  // Fail-closed at the public boundary (dual review 2026-07-10 F3): the
  // key must be PRESENT — explicitly null or a non-empty string. An
  // absent key is an undeclared surface, not an implicit null (the GTL
  // syntax path coalesces `?? null` before calling, so lawful authoring
  // always arrives explicit).
  if (proportionalityRaw !== null && !isNonEmptyString(proportionalityRaw)) {
    issues.push("proportionalityClass must be null or a non-empty string");
  }
  if (issues.length > 0) {
    return Object.freeze({ accepted: false, program: null, issues: Object.freeze(issues) });
  }
  if (!isNonEmptyString(programRefRaw)) {
    return Object.freeze({ accepted: false, program: null, issues: Object.freeze(["programRef must be a non-empty string"]) });
  }
  const proportionalityClass = isNonEmptyString(proportionalityRaw)
    ? proportionalityRaw
    : null;
  if (workflow !== null) {
    const program: HogWorkflowProgramDeclaration = Object.freeze({
      kind: "hog_program_declaration" as const,
      programRef: programRefRaw,
      stages: Object.freeze([] as const),
      proportionalityClass,
      workflow
    });
    return Object.freeze({
      accepted: true,
      program,
      issues: Object.freeze([])
    });
  }
  if (batch !== null) {
    const program: HogBatchProgramDeclaration = Object.freeze({
      kind: "hog_program_declaration" as const,
      programRef: programRefRaw,
      stages: Object.freeze([] as const),
      proportionalityClass,
      batch
    });
    return Object.freeze({
      accepted: true,
      program,
      issues: Object.freeze([])
    });
  }
  if (retry !== null) {
    const program: HogRetryProgramDeclaration = Object.freeze({
      kind: "hog_program_declaration" as const,
      programRef: programRefRaw,
      stages: Object.freeze([] as const),
      proportionalityClass,
      retry
    });
    return Object.freeze({
      accepted: true,
      program,
      issues: Object.freeze([])
    });
  }
  const program: HogFlatProgramDeclaration = Object.freeze({
    kind: "hog_program_declaration" as const,
    programRef: programRefRaw,
    stages: Object.freeze(admittedStages.map((stage) => Object.freeze(stage))),
    proportionalityClass
  });
  return Object.freeze({
    accepted: true,
    program,
    issues: Object.freeze([])
  });
}

export function isHogWorkflowProgram(
  program: HogProgramDeclaration
): program is HogWorkflowProgramDeclaration {
  return Object.hasOwn(program, "workflow");
}

export function isHogBatchProgram(
  program: HogProgramDeclaration
): program is HogBatchProgramDeclaration {
  return Object.hasOwn(program, "batch");
}

export function isHogRetryProgram(
  program: HogProgramDeclaration
): program is HogRetryProgramDeclaration {
  return Object.hasOwn(program, "retry");
}

function isCCallRegime(
  value: unknown
): value is (typeof C_CALL_REGIME_VALUES)[number] {
  return C_CALL_REGIME_VALUES.some((regime): boolean => regime === value);
}

// The census the resolver asserts (-003): every (stageRole × regime ×
// armId) triple lawful for this program.
export function hogProgramCensus(
  program: HogProgramDeclaration
): ReadonlySet<string> {
  const stages = isHogBatchProgram(program)
    ? program.batch.tasks.map((task) => task.stage)
    : isHogRetryProgram(program)
      ? [program.retry.stage]
    : program.stages;
  return new Set(
    stages.map((stage) =>
      [stage.stageRole, stage.defaultRegime, stage.armId].join("|")
    )
  );
}
