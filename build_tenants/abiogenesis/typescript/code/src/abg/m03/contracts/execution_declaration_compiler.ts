// Implements: REQ-L-GTL3-C-ALGEBRA-013/-014/-016.
// Authored GraphFunction declarations compile once at ExecutionBasis admission.
// The runner selects from this carrier; it never reparses declaration data.

import type { GraphFunction } from "../../../gtl/m01/contracts/carriers.js";
import {
  HOG_HANDLER_BINDINGS_DECLARATION_KEY,
  HOG_HANDLER_CONFIGS_DECLARATION_KEY,
  HOG_PROGRAM_CATALOG_DECLARATION_KEY,
  HOG_PROGRAM_DECLARATION_KEY,
  HOG_PROGRAM_LADDER_DECLARATION_KEY,
  HOG_PROGRAM_SELECTION_KEY,
  hogHandlerBindingsFromDeclarationAttrs,
  hogHandlerConfigsFromDeclarationAttrs,
  hogProgramCatalogFromDeclarationAttrs,
  hogProgramFromDeclarationAttrs,
  hogProgramLadderFromDeclarationAttrs,
  effectiveHogProgramCatalog,
  type HogProgramLadderRung
} from "./hog_program_syntax.js";
import {
  HOG_BOOTSTRAP_TRIPLE,
  isHogRetryProgram,
  isHogWorkflowProgram,
  type HogProgramDeclaration
} from "./hog_program.js";
import {
  admitHogHandlerBindings,
  type CCallHandlerBinding
} from "./hog_handler_bindings.js";
import {
  pluginSelectionFromDeclarationAttrs,
  type PluginSelectionSeam
} from "./plugin_selection.js";

export type CompiledHogProgramPlan =
  | {
      readonly mode: "default";
    }
  | {
      readonly mode: "single";
      readonly program: HogProgramDeclaration;
    }
  | {
      readonly mode: "catalog";
      readonly programs: readonly HogProgramDeclaration[];
      readonly selectionRef: string;
    }
  | {
      readonly mode: "ladder";
      readonly programs: readonly HogProgramDeclaration[];
      readonly rungs: readonly HogProgramLadderRung[];
    };

export interface CompiledExecutionDeclarations {
  readonly kind: "compiled_execution_declarations";
  readonly sourceRef: string;
  readonly hogProgramPlan: CompiledHogProgramPlan;
  readonly handlerBindingRows: readonly CCallHandlerBinding[] | null;
  readonly handlerConfigs: Readonly<Record<string, unknown>> | null;
  readonly pluginSelection: Readonly<
    Partial<Record<PluginSelectionSeam, string>>
  > | null;
}

function selectionRef(graphFunction: GraphFunction): string | null {
  const entry = graphFunction.declarations.entries.find(
    (row) => row.key === HOG_PROGRAM_SELECTION_KEY
  );
  if (entry === undefined) return null;
  if (
    entry.value.kind !== "scalar" ||
    typeof entry.value.value !== "string" ||
    entry.value.value.length === 0
  ) {
    throw new TypeError(
      `${HOG_PROGRAM_SELECTION_KEY} on ${graphFunction.name} must be a non-empty string declaration`
    );
  }
  return entry.value.value;
}

function declaredPrograms(
  programs: ReadonlyMap<string, HogProgramDeclaration>
): readonly HogProgramDeclaration[] {
  return Object.freeze([...programs.values()]);
}

function programIn(
  programs: readonly HogProgramDeclaration[],
  programRef: string
): boolean {
  return programs.some((program) => program.programRef === programRef);
}

function compileHogProgramPlan(
  graphFunction: GraphFunction
): CompiledHogProgramPlan {
  const attrs = graphFunction.declarations;
  const sourceRef = graphFunction.name;
  const single = hogProgramFromDeclarationAttrs(attrs, sourceRef);
  const catalog = hogProgramCatalogFromDeclarationAttrs(attrs, sourceRef);
  const ladder = hogProgramLadderFromDeclarationAttrs(attrs, sourceRef);
  const selectedRef = selectionRef(graphFunction);

  if (single !== null && (!single.accepted || single.program === null)) {
    throw new TypeError(
      `${HOG_PROGRAM_DECLARATION_KEY} on ${sourceRef} failed admission: ${single.issues.join("; ")}`
    );
  }
  if (catalog !== null && (!catalog.accepted || catalog.catalog === null)) {
    throw new TypeError(
      `${HOG_PROGRAM_CATALOG_DECLARATION_KEY} on ${sourceRef} failed admission: ${catalog.issues.join("; ")}`
    );
  }
  if (ladder !== null && (!ladder.accepted || ladder.rungs === null)) {
    throw new TypeError(
      `${HOG_PROGRAM_LADDER_DECLARATION_KEY} on ${sourceRef} failed admission: ${ladder.issues.join("; ")}`
    );
  }

  const hasSingle = single?.program !== null && single?.program !== undefined;
  const hasCatalog = catalog?.catalog !== null && catalog?.catalog !== undefined;
  const hasLadder = ladder?.rungs !== null && ladder?.rungs !== undefined;
  if (hasSingle && (hasCatalog || hasLadder || selectedRef !== null)) {
    throw new TypeError(
      `hog_program_authority_conflict: ${sourceRef} declares both a single program and catalog selection authority`
    );
  }
  if (hasLadder && !hasCatalog) {
    throw new TypeError(
      `${HOG_PROGRAM_LADDER_DECLARATION_KEY} on ${sourceRef} requires an admitted ${HOG_PROGRAM_CATALOG_DECLARATION_KEY}`
    );
  }
  if (hasLadder && selectedRef !== null) {
    throw new TypeError(
      `hog_program_authority_conflict: ${sourceRef} declares both fixed and attempt-ladder selectors`
    );
  }
  if (selectedRef !== null && !hasCatalog) {
    throw new TypeError(
      `${HOG_PROGRAM_SELECTION_KEY} on ${sourceRef} requires a declared ${HOG_PROGRAM_CATALOG_DECLARATION_KEY}`
    );
  }

  if (hasCatalog && catalog?.catalog !== null && catalog?.catalog !== undefined) {
    const programs = declaredPrograms(
      effectiveHogProgramCatalog(catalog.catalog).programs
    );
    if (hasLadder && ladder?.rungs !== null && ladder?.rungs !== undefined) {
      for (const rung of ladder.rungs) {
        if (!programIn(programs, rung.programRef)) {
          throw new TypeError(
            `ladder rung ${rung.programRef} on ${sourceRef} does not name a program in the declared catalog`
          );
        }
      }
      return Object.freeze({
        mode: "ladder" as const,
        programs,
        rungs: ladder.rungs
      });
    }
    if (selectedRef === null) {
      throw new TypeError(
        `${HOG_PROGRAM_CATALOG_DECLARATION_KEY} on ${sourceRef} requires ${HOG_PROGRAM_SELECTION_KEY} to select a program`
      );
    }
    if (!programIn(programs, selectedRef)) {
      throw new TypeError(
        `${HOG_PROGRAM_SELECTION_KEY} ${selectedRef} on ${sourceRef} does not name a program in the declared catalog`
      );
    }
    return Object.freeze({
      mode: "catalog" as const,
      programs,
      selectionRef: selectedRef
    });
  }

  if (hasSingle && single?.program !== null && single?.program !== undefined) {
    return Object.freeze({ mode: "single" as const, program: single.program });
  }
  return Object.freeze({ mode: "default" as const });
}

function programsInPlan(
  plan: CompiledHogProgramPlan
): readonly HogProgramDeclaration[] {
  switch (plan.mode) {
    case "default": {
      const catalog = effectiveHogProgramCatalog(null);
      const program = catalog.programs.get(catalog.defaultProgramRef);
      if (program === undefined) {
        throw new TypeError("effective HoG catalog must contain its default program");
      }
      return Object.freeze([program]);
    }
    case "single":
      return Object.freeze([plan.program]);
    case "catalog":
    case "ladder":
      return plan.programs;
  }
}

function assertHandlerBindingsMatchPlan(input: {
  readonly sourceRef: string;
  readonly plan: CompiledHogProgramPlan;
  readonly bindings: readonly CCallHandlerBinding[];
  readonly configs: Readonly<Record<string, unknown>> | null;
}): void {
  const programs = programsInPlan(input.plan);
  const bakedRoles = new Set(
    HOG_BOOTSTRAP_TRIPLE.stages.map((stage) => stage.stageRole)
  );
  for (const binding of input.bindings) {
    const program = programs.find(
      (candidate) => candidate.programRef === binding.programRef
    );
    if (program === undefined) {
      throw new TypeError(
        `handler_binding_outside_program: ${input.sourceRef} binds undeclared program ${binding.programRef}`
      );
    }
    const programStages = isHogRetryProgram(program)
      ? [program.retry.stage]
      : program.stages;
    const stage = programStages.find(
      (candidate) =>
        candidate.stageRole === binding.stageRole &&
        candidate.armId === binding.armId
    );
    if (stage === undefined) {
      throw new TypeError(
        `handler_binding_outside_program: ${input.sourceRef} binds undeclared stage/arm ${binding.stageRole}/${binding.armId} in ${binding.programRef}`
      );
    }
    if (stage.defaultRegime !== binding.regime) {
      throw new TypeError(
        `handler_binding_regime_mismatch: ${input.sourceRef} binds ${binding.programRef}/${binding.stageRole}/${binding.armId} as ${binding.regime}, declared ${stage.defaultRegime}`
      );
    }
    if (bakedRoles.has(binding.stageRole)) {
      throw new TypeError(
        `handler_binding_baked_authority_conflict: ${input.sourceRef} binds baked stage role ${binding.stageRole}; the current runtime does not consume a handler binding for that role`
      );
    }
    if (
      binding.handlerConfigRef !== null &&
      (input.configs === null ||
        !Object.hasOwn(input.configs, binding.handlerConfigRef))
    ) {
      throw new TypeError(
        `handler_config_unresolvable: ${input.sourceRef} binding ${binding.handlerRef} names missing config ${binding.handlerConfigRef}`
      );
    }
  }
  for (const program of programs) {
    assertProgramMatchesCurrentInterpreter(
      program,
      input.sourceRef
    );
  }
}

const BAKED_STAGE_REGIMES: Readonly<
  Record<string, readonly ("F_D" | "F_P" | "F_H")[]>
> = Object.freeze({
  transform: Object.freeze(["F_D", "F_P", "F_H"] as const),
  evaluate: Object.freeze(["F_D", "F_P"] as const),
  consequence: Object.freeze(["F_D"] as const)
});

function assertProgramMatchesCurrentInterpreter(
  program: HogProgramDeclaration,
  sourceRef: string
): void {
  if (isHogWorkflowProgram(program) || isHogRetryProgram(program)) {
    return;
  }
  const missingAnchors = HOG_BOOTSTRAP_TRIPLE.stages
    .map((stage) => stage.stageRole)
    .filter(
      (stageRole) =>
        !program.stages.some((stage) => stage.stageRole === stageRole)
    );
  if (missingAnchors.length > 0) {
    throw new TypeError(
      `semantic_not_realized: ${sourceRef} program ${program.programRef} omits current interpreter anchors ${missingAnchors.join(", ")}`
    );
  }
  const transformAt = program.stages.findIndex(
    (stage) => stage.stageRole === "transform"
  );
  const evaluateAt = program.stages.findIndex(
    (stage) => stage.stageRole === "evaluate"
  );
  const consequenceAt = program.stages.findIndex(
    (stage) => stage.stageRole === "consequence"
  );
  if (!(transformAt < evaluateAt && evaluateAt < consequenceAt)) {
    throw new TypeError(
      `semantic_not_realized: ${sourceRef} program ${program.programRef} must order current interpreter anchors as transform, evaluate, consequence`
    );
  }
  for (const [index, stage] of program.stages.entries()) {
    const baked = HOG_BOOTSTRAP_TRIPLE.stages.find(
      (candidate) => candidate.stageRole === stage.stageRole
    );
    if (baked !== undefined) {
      const admittedRegimes = BAKED_STAGE_REGIMES[stage.stageRole] ?? [];
      if (!admittedRegimes.includes(stage.defaultRegime)) {
        throw new TypeError(
          `semantic_not_realized: ${sourceRef} program ${program.programRef} declares ${stage.stageRole}.${stage.defaultRegime}; the current baked interpreter admits ${JSON.stringify(admittedRegimes)}`
        );
      }
      continue;
    }
    if (
      (transformAt !== -1 && index < transformAt) ||
      (consequenceAt !== -1 && index > consequenceAt)
    ) {
      throw new TypeError(
        `semantic_not_realized: ${sourceRef} program ${program.programRef} places ${stage.stageRole} outside the current lawful handler anchors`
      );
    }
  }
}

export function compileExecutionDeclarations(
  graphFunction: GraphFunction
): CompiledExecutionDeclarations {
  let handlerBindingRows: readonly CCallHandlerBinding[] | null;
  let handlerConfigs: Readonly<Record<string, unknown>> | null;
  try {
    const rawHandlerBindingRows = hogHandlerBindingsFromDeclarationAttrs(
      graphFunction.declarations,
      graphFunction.name
    );
    handlerBindingRows =
      rawHandlerBindingRows === null
        ? null
        : admitHogHandlerBindings(
            rawHandlerBindingRows,
            graphFunction.name
          );
    handlerConfigs = hogHandlerConfigsFromDeclarationAttrs(
      graphFunction.declarations,
      graphFunction.name
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "invalid handler declarations";
    throw new TypeError(
      `${HOG_HANDLER_BINDINGS_DECLARATION_KEY}/${HOG_HANDLER_CONFIGS_DECLARATION_KEY} on ${graphFunction.name} failed admission: ${message}`
    );
  }
  const hogProgramPlan = compileHogProgramPlan(graphFunction);
  assertHandlerBindingsMatchPlan({
    sourceRef: graphFunction.name,
    plan: hogProgramPlan,
    bindings: handlerBindingRows ?? Object.freeze([]),
    configs: handlerConfigs
  });
  const compiled: CompiledExecutionDeclarations = {
    kind: "compiled_execution_declarations",
    sourceRef: graphFunction.name,
    hogProgramPlan,
    handlerBindingRows,
    handlerConfigs,
    pluginSelection: pluginSelectionFromDeclarationAttrs(
      graphFunction.declarations,
      graphFunction.name
    )
  };
  return Object.freeze(compiled);
}
