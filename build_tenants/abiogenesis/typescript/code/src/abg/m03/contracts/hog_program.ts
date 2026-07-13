// Implements: REQ-R-ABG3-CCALL-014 (declared edge programs), -003
// (census from the admitted program), §15 stratification law (the baked
// bootstrap triple is P0; everything richer is admitted GTL).
// HoG.GTL carrier: an edge program is DATA — a declared composition of
// C calls the engine interprets. The engine never carries a program
// richer than HOG_BOOTSTRAP_TRIPLE in code.

import type { CCallRegime, CCallStageRole } from "./carriers.js";
import { C_CALL_REGIME_VALUES } from "./carriers.js";
import { isPlainRecord } from "./admission_hygiene.js";

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

export interface HogFlatProgramDeclaration {
  readonly kind: "hog_program_declaration";
  readonly programRef: string;
  readonly stages: readonly HogProgramStage[];
  readonly proportionalityClass: string | null;
  readonly workflow?: never;
}

export interface HogWorkflowProgramDeclaration {
  readonly kind: "hog_program_declaration";
  readonly programRef: string;
  readonly stages: readonly [];
  readonly proportionalityClass: string | null;
  readonly workflow: HogWorkflowLift;
}

export type HogProgramDeclaration =
  | HogFlatProgramDeclaration
  | HogWorkflowProgramDeclaration;

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
  "workflow"
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
  if (stages === null) {
    issues.push("stages must be an array");
  } else if (workflowRaw === undefined && stages.length === 0) {
    issues.push("flat program stages must be a non-empty array");
  } else if (workflowRaw !== undefined && stages.length !== 0) {
    issues.push("workflow program stages must be empty");
  }
  const roles = new Set<string>();
  let resultBearingCount = 0;
  const admittedStages: {
    readonly stageRole: string;
    readonly defaultRegime: (typeof C_CALL_REGIME_VALUES)[number];
    readonly armId: string;
    readonly resultBearing: boolean;
    readonly instructionCategoryRefs?: readonly string[];
  }[] = [];
  for (const [index, stageRaw] of (workflowRaw === undefined ? (stages ?? []) : []).entries()) {
    const at = `stages[${index}]`;
    if (!isPlainRecord(stageRaw)) {
      issues.push(`${at} must be an object`);
      continue;
    }
    const stage = stageRaw;
    for (const key of Object.keys(stage)) {
      if (!HOG_STAGE_KEYS.includes(key)) {
        issues.push(`${at}: unknown stage field ${JSON.stringify(key)} (closed key set)`);
      }
    }
    const stageRole = stage["stageRole"];
    if (!isNonEmptyString(stageRole)) {
      issues.push(`${at}.stageRole must be a non-empty string`);
    } else if (roles.has(stageRole)) {
      issues.push(`${at}.stageRole duplicates ${JSON.stringify(stageRole)}`);
    } else {
      roles.add(stageRole);
    }
    const defaultRegime = stage["defaultRegime"];
    const regimeValid = C_CALL_REGIME_VALUES.some(
      (regime): boolean => regime === defaultRegime
    );
    if (!regimeValid) {
      issues.push(`${at}.defaultRegime must be one of ${JSON.stringify(C_CALL_REGIME_VALUES)}`);
    }
    const armId = stage["armId"];
    if (!isNonEmptyString(armId)) {
      issues.push(`${at}.armId must be a non-empty string`);
    }
    const resultBearing = stage["resultBearing"];
    if (typeof resultBearing !== "boolean") {
      issues.push(`${at}.resultBearing must be a boolean`);
    } else if (resultBearing) {
      resultBearingCount += 1;
    }
    const categoryRefsRaw = stage["instructionCategoryRefs"];
    let categoryRefs: readonly string[] | undefined;
    if (categoryRefsRaw !== undefined) {
      if (
        !Array.isArray(categoryRefsRaw) ||
        !categoryRefsRaw.every(isNonEmptyString)
      ) {
        issues.push(`${at}.instructionCategoryRefs must be non-empty strings`);
      } else {
        const refs: readonly string[] = categoryRefsRaw;
        categoryRefs = refs;
      }
    }
    if (
      isNonEmptyString(stageRole) &&
      isNonEmptyString(armId) &&
      typeof resultBearing === "boolean" &&
      regimeValid &&
      isCCallRegime(defaultRegime)
    ) {
      admittedStages.push(
        Object.freeze({
          stageRole,
          defaultRegime,
          armId,
          resultBearing,
          ...(categoryRefs === undefined
            ? {}
            : { instructionCategoryRefs: Object.freeze([...categoryRefs]) })
        })
      );
    }
  }
  if (
    workflowRaw === undefined &&
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
  return new Set(
    program.stages.map((stage) =>
      [stage.stageRole, stage.defaultRegime, stage.armId].join("|")
    )
  );
}
