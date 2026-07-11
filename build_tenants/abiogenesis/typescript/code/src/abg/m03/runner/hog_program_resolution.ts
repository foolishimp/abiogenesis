// Implements: REQ-R-ABG3-HANDLERS-011/-012 (the ONE interpretation
// seam, fail-closed) over REQ-R-ABG3-CCALL-014/-016 (declared programs,
// labelled catalogs). This module is the only place programs, catalogs,
// and selections are consumed; the engine draws stages BY ROLE from the
// resolved program and stamps its programRef on every selection row.
// The baked bootstrap triple is the undeclared default (§15
// stratification law).
//
// STAGED EARN (honest scope): until the standard handlers land (T-205
// B3), the engine can only EXECUTE triple-shaped programs — declared
// programs whose stage roles are exactly a subset of
// {transform, evaluate, consequence} with the baked execution shape.
// A lawfully admitted but not-yet-executable program FAILS CLOSED here
// with a typed reason (HANDLERS-012) — it never half-runs.

import type { HogProgramDeclaration, HogProgramStage } from "../contracts/hog_program.js";
import type { CompiledHogProgramPlan } from "../contracts/execution_declaration_compiler.js";
import {
  effectiveHogProgramCatalog,
  ladderRungForAttempt
} from "../contracts/hog_program_syntax.js";

const EXECUTABLE_STAGE_ROLES = Object.freeze(["transform", "evaluate", "consequence"]);

export interface ResolvedHogProgram {
  readonly program: HogProgramDeclaration;
  readonly source: "declared" | "declared_catalog" | "declared_ladder" | "default";
}

// Executability is an ENTRY-GATE concern, separate from resolution:
// a triple role executes on the baked path; any other role executes
// IFF the admitted handler registry binds (programRef × stageRole ×
// armId). No registry = triple-only (the pre-B3 wall, now narrowed).
export function assertHogProgramExecutable(
  resolved: ResolvedHogProgram,
  registry: {
    readonly bindings: readonly {
      readonly programRef: string;
      readonly stageRole: string;
      readonly armId: string;
      readonly regime: string;
      readonly handlerRef: string;
    }[];
    readonly handlers: ReadonlyMap<string, unknown>;
  } | null
): void {
  const program = resolved.program;
  // BINDING-COMPLETE entry gate (codex MEDIUM): a non-triple stage is
  // executable IFF exactly the full binding holds — program × stage ×
  // arm match, REGIME equals the stage's declared regime, and the
  // handlerRef resolves to a registered handler. Registry-level shape,
  // duplicates, and classes are enforced by admitHandlerRegistry at
  // entry before this check runs.
  const unsupported = program.stages
    .filter((stage: HogProgramStage) => {
      if (EXECUTABLE_STAGE_ROLES.includes(stage.stageRole)) return false;
      if (registry === null) return true;
      const binding = registry.bindings.find(
        (row) =>
          row.programRef === program.programRef &&
          row.stageRole === stage.stageRole &&
          row.armId === stage.armId
      );
      if (binding === undefined) return true;
      if (binding.regime !== stage.defaultRegime) return true;
      return !registry.handlers.has(binding.handlerRef);
    })
    .map((stage: HogProgramStage) => stage.stageRole);
  if (unsupported.length > 0) {
    throw new TypeError(
      `unsupported_stage_set: hog program ${program.programRef} declares stage ` +
        `roles ${JSON.stringify(unsupported)} with no COMPLETE handler binding ` +
        `(program×stage×arm + regime match + registered handler; triple roles ` +
        `run baked: ${JSON.stringify(EXECUTABLE_STAGE_ROLES)})`
    );
  }
  // POSITION LAW: extra stages execute at two anchors only —
  // (transform..evaluate] and (evaluate..consequence). Before transform
  // or after consequence there is no lawful anchor yet: fail closed.
  const roleIndex = (role: string): number =>
    program.stages.findIndex((stage) => stage.stageRole === role);
  const transformAt = roleIndex("transform");
  const consequenceAt = roleIndex("consequence");
  const misplaced = program.stages
    .filter((stage, index) => {
      if (EXECUTABLE_STAGE_ROLES.includes(stage.stageRole)) return false;
      if (transformAt !== -1 && index < transformAt) return true;
      if (consequenceAt !== -1 && index > consequenceAt) return true;
      return false;
    })
    .map((stage) => stage.stageRole);
  if (misplaced.length > 0) {
    throw new TypeError(
      `unsupported_stage_position: hog program ${program.programRef} places ` +
        `${JSON.stringify(misplaced)} outside the lawful anchors ` +
        `(after transform, before consequence)`
    );
  }
}

export function assertHogProgramPlanExecutable(
  plan: CompiledHogProgramPlan,
  registry: Parameters<typeof assertHogProgramExecutable>[1]
): void {
  const reachable = new Map<string, HogProgramDeclaration>();
  switch (plan.mode) {
    case "default": {
      const resolved = resolveHogProgram(plan);
      reachable.set(resolved.program.programRef, resolved.program);
      break;
    }
    case "single":
      reachable.set(plan.program.programRef, plan.program);
      break;
    case "catalog": {
      const resolved = resolveHogProgram(plan);
      reachable.set(resolved.program.programRef, resolved.program);
      break;
    }
    case "ladder":
      for (const rung of plan.rungs) {
        const program = plan.programs.find(
          (candidate) => candidate.programRef === rung.programRef
        );
        if (program === undefined) {
          throw new TypeError("compiled HoG ladder selection is incoherent");
        }
        reachable.set(program.programRef, program);
      }
      break;
  }
  for (const program of reachable.values()) {
    assertHogProgramExecutable(
      Object.freeze({ program, source: "declared" as const }),
      registry
    );
  }
}

// The two anchor segments, derived from declared order.
export function extraHogStageSegments(program: HogProgramDeclaration): {
  readonly postTransform: readonly HogProgramStage[];
  readonly postEvaluate: readonly HogProgramStage[];
} {
  const roleIndex = (role: string): number =>
    program.stages.findIndex((stage) => stage.stageRole === role);
  const transformAt = roleIndex("transform");
  const evaluateAt = roleIndex("evaluate");
  const consequenceAt = roleIndex("consequence");
  const extras = program.stages
    .map((stage, index) => ({ stage, index }))
    .filter(({ stage }) => !EXECUTABLE_STAGE_ROLES.includes(stage.stageRole));
  return Object.freeze({
    postTransform: Object.freeze(
      extras
        .filter(({ index }) =>
          transformAt !== -1 && index > transformAt &&
          (evaluateAt === -1 || index < evaluateAt)
        )
        .map(({ stage }) => stage)
    ),
    postEvaluate: Object.freeze(
      extras
        .filter(({ index }) =>
          evaluateAt !== -1 && index > evaluateAt &&
          (consequenceAt === -1 || index < consequenceAt)
        )
        .map(({ stage }) => stage)
    )
  });
}

// The ONE seam (HANDLERS-011). Resolution order:
// catalog + selection ref -> single program declaration -> baked default.
// Every failure is fail-closed BEFORE any interior runs (HANDLERS-012).
// -017: attempt-aware resolution. A declared LADDER (over the catalog)
// outranks the static selection ref; the rung for the observed attempt
// governs. attempt defaults to 1 (first window).
export function resolveHogProgram(
  plan: CompiledHogProgramPlan,
  attempt: number = 1
): ResolvedHogProgram {
  if (!Number.isInteger(attempt) || attempt < 1) {
    throw new TypeError("HoG program selection attempt must be a positive integer");
  }
  switch (plan.mode) {
    case "single":
      return Object.freeze({ program: plan.program, source: "declared" as const });
    case "catalog": {
      const program = plan.programs.find(
        (candidate) => candidate.programRef === plan.selectionRef
      );
      if (program === undefined) {
        throw new TypeError("compiled HoG catalog selection is incoherent");
      }
      return Object.freeze({ program, source: "declared_catalog" as const });
    }
    case "ladder": {
      const rung = ladderRungForAttempt(plan.rungs, attempt);
      const program = plan.programs.find(
        (candidate) => candidate.programRef === rung.programRef
      );
      if (program === undefined) {
        throw new TypeError("compiled HoG ladder selection is incoherent");
      }
      return Object.freeze({ program, source: "declared_ladder" as const });
    }
    case "default": {
      const effective = effectiveHogProgramCatalog(null);
      const defaultProgram = effective.programs.get(effective.defaultProgramRef);
      if (defaultProgram === undefined) {
        throw new TypeError("effective catalog must carry the bootstrap default");
      }
      return Object.freeze({ program: defaultProgram, source: "default" as const });
    }
  }
}

// Stage lookup BY ROLE from the resolved program — the engine never
// indexes stages positionally against a declared program.
export function hogStageByRole(
  resolved: ResolvedHogProgram,
  stageRole: string
): HogProgramStage | null {
  return (
    resolved.program.stages.find((stage) => stage.stageRole === stageRole) ?? null
  );
}
