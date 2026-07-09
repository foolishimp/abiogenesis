// Implements: REQ-R-ABG3-CCALL-014 (declared edge programs), -003
// (census from the admitted program), §15 stratification law (the baked
// bootstrap triple is P0; everything richer is admitted GTL).
// HoG.GTL carrier: an edge program is DATA — a declared composition of
// C calls the engine interprets. The engine never carries a program
// richer than HOG_BOOTSTRAP_TRIPLE in code.

import type { CCallRegime, CCallStageRole } from "./carriers.js";
import { C_CALL_REGIME_VALUES } from "./carriers.js";

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

export interface HogProgramDeclaration {
  readonly kind: "hog_program_declaration";
  readonly programRef: string;
  readonly stages: readonly HogProgramStage[];
  readonly proportionalityClass: string | null;
}

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
  "proportionalityClass"
]);
const HOG_STAGE_KEYS = Object.freeze([
  "stageRole",
  "defaultRegime",
  "armId",
  "resultBearing",
  "instructionCategoryRefs"
]);

export function admitHogProgram(input: unknown): HogProgramAdmission {
  const issues: string[] = [];
  const record = input as Partial<HogProgramDeclaration> | null;
  if (record === null || typeof record !== "object") {
    return Object.freeze({ accepted: false, program: null, issues: Object.freeze(["program declaration must be an object"]) });
  }
  // CLOSED KEY SET (codex P1): the program surface is the monad's
  // configuration — unknown siblings are rejected, never carried as a
  // metadata bag (second-truth-surface guard).
  for (const key of Object.keys(record)) {
    if (!HOG_PROGRAM_KEYS.includes(key)) {
      issues.push(`unknown program field ${JSON.stringify(key)} (closed key set)`);
    }
  }
  if (record.kind !== "hog_program_declaration") {
    issues.push("kind must be hog_program_declaration");
  }
  if (!isNonEmptyString(record.programRef)) {
    issues.push("programRef must be a non-empty string");
  }
  const stages = Array.isArray(record.stages) ? record.stages : null;
  if (stages === null || stages.length === 0) {
    issues.push("stages must be a non-empty array");
  }
  const roles = new Set<string>();
  let resultBearingCount = 0;
  for (const [index, stage] of (stages ?? []).entries()) {
    const at = `stages[${index}]`;
    if (stage === null || typeof stage !== "object") {
      issues.push(`${at} must be an object`);
      continue;
    }
    for (const key of Object.keys(stage as Record<string, unknown>)) {
      if (!HOG_STAGE_KEYS.includes(key)) {
        issues.push(`${at}: unknown stage field ${JSON.stringify(key)} (closed key set)`);
      }
    }
    if (!isNonEmptyString(stage.stageRole)) {
      issues.push(`${at}.stageRole must be a non-empty string`);
    } else if (roles.has(stage.stageRole)) {
      issues.push(`${at}.stageRole duplicates ${JSON.stringify(stage.stageRole)}`);
    } else {
      roles.add(stage.stageRole);
    }
    if (!(C_CALL_REGIME_VALUES as readonly string[]).includes(stage.defaultRegime as string)) {
      issues.push(`${at}.defaultRegime must be one of ${JSON.stringify(C_CALL_REGIME_VALUES)}`);
    }
    if (!isNonEmptyString(stage.armId)) {
      issues.push(`${at}.armId must be a non-empty string`);
    }
    if (typeof stage.resultBearing !== "boolean") {
      issues.push(`${at}.resultBearing must be a boolean`);
    } else if (stage.resultBearing) {
      resultBearingCount += 1;
    }
    if (
      stage.instructionCategoryRefs !== undefined &&
      (!Array.isArray(stage.instructionCategoryRefs) ||
        !stage.instructionCategoryRefs.every(isNonEmptyString))
    ) {
      issues.push(`${at}.instructionCategoryRefs must be non-empty strings`);
    }
  }
  if (stages !== null && stages.length > 0 && resultBearingCount !== 1) {
    issues.push(`exactly one result-bearing stage required, got ${resultBearingCount}`);
  }
  if (record.proportionalityClass !== null && !isNonEmptyString(record.proportionalityClass)) {
    issues.push("proportionalityClass must be null or a non-empty string");
  }
  if (issues.length > 0) {
    return Object.freeze({ accepted: false, program: null, issues: Object.freeze(issues) });
  }
  const admitted = record as HogProgramDeclaration;
  return Object.freeze({
    accepted: true,
    program: Object.freeze({
      kind: "hog_program_declaration",
      programRef: admitted.programRef,
      stages: Object.freeze(
        admitted.stages.map((stage) =>
          Object.freeze({
            stageRole: stage.stageRole,
            defaultRegime: stage.defaultRegime,
            armId: stage.armId,
            resultBearing: stage.resultBearing,
            ...(stage.instructionCategoryRefs === undefined
              ? {}
              : { instructionCategoryRefs: Object.freeze([...stage.instructionCategoryRefs]) })
          })
        )
      ),
      proportionalityClass: admitted.proportionalityClass ?? null
    }),
    issues: Object.freeze([])
  });
}

// The census the resolver asserts (-003): every (stageRole × regime ×
// armId) triple lawful for this program.
export function hogProgramCensus(
  program: HogProgramDeclaration
): ReadonlySet<string> {
  return new Set(
    program.stages.map((stage) =>
      [stage.stageRole, stage.defaultRegime, stage.armId].join("|")
    )
  );
}
