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

import type { GraphFunction } from "../../../gtl/m01/contracts/carriers.js";
import type { HogProgramDeclaration, HogProgramStage } from "../contracts/hog_program.js";
import { HOG_BOOTSTRAP_TRIPLE } from "../contracts/hog_program.js";
import {
  HOG_PROGRAM_DECLARATION_KEY,
  HOG_PROGRAM_CATALOG_DECLARATION_KEY,
  HOG_PROGRAM_SELECTION_KEY,
  hogProgramFromDeclarationAttrs,
  hogProgramCatalogFromDeclarationAttrs,
  selectHogProgram
} from "../contracts/hog_program_syntax.js";

const EXECUTABLE_STAGE_ROLES = Object.freeze(["transform", "evaluate", "consequence"]);

export interface ResolvedHogProgram {
  readonly program: HogProgramDeclaration;
  readonly source: "declared" | "declared_catalog" | "default";
}

function selectionRefFromDeclarations(graphFunction: GraphFunction): string | null {
  const entry = graphFunction.declarations.entries.find(
    (row) => row.key === HOG_PROGRAM_SELECTION_KEY
  );
  if (entry === undefined) {
    return null;
  }
  if (
    entry.value.kind !== "scalar" ||
    typeof entry.value.value !== "string" ||
    entry.value.value.length === 0
  ) {
    throw new TypeError(
      `${HOG_PROGRAM_SELECTION_KEY} on ${graphFunction.id} must be a non-empty string declaration`
    );
  }
  return entry.value.value;
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
    }[];
  } | null
): void {
  const program = resolved.program;
  const unsupported = program.stages
    .filter((stage: HogProgramStage) => {
      if (EXECUTABLE_STAGE_ROLES.includes(stage.stageRole)) return false;
      if (registry === null) return true;
      return !registry.bindings.some(
        (binding) =>
          binding.programRef === program.programRef &&
          binding.stageRole === stage.stageRole &&
          binding.armId === stage.armId
      );
    })
    .map((stage: HogProgramStage) => stage.stageRole);
  if (unsupported.length > 0) {
    throw new TypeError(
      `unsupported_stage_set: hog program ${program.programRef} declares stage ` +
        `roles ${JSON.stringify(unsupported)} with no admitted handler binding ` +
        `(triple roles run baked; other roles need a registry binding; ` +
        `baked roles: ${JSON.stringify(EXECUTABLE_STAGE_ROLES)})`
    );
  }
}

// The ONE seam (HANDLERS-011). Resolution order:
// catalog + selection ref -> single program declaration -> baked default.
// Every failure is fail-closed BEFORE any interior runs (HANDLERS-012).
export function resolveHogProgram(graphFunction: GraphFunction): ResolvedHogProgram {
  // messages use the function NAME — ids are structural blobs and bury
  // the typed reason tag past any truncation window.
  const sourceRef = graphFunction.name;
  const catalogCompilation = hogProgramCatalogFromDeclarationAttrs(
    graphFunction.declarations,
    sourceRef
  );
  const selectionRef = selectionRefFromDeclarations(graphFunction);
  if (catalogCompilation !== null) {
    if (!catalogCompilation.accepted || catalogCompilation.catalog === null) {
      throw new TypeError(
        `${HOG_PROGRAM_CATALOG_DECLARATION_KEY} on ${sourceRef} failed admission: ` +
          catalogCompilation.issues.join("; ")
      );
    }
    if (selectionRef === null) {
      throw new TypeError(
        `${HOG_PROGRAM_CATALOG_DECLARATION_KEY} on ${sourceRef} requires ` +
          `${HOG_PROGRAM_SELECTION_KEY} to select a program`
      );
    }
    const selected = selectHogProgram(catalogCompilation.catalog, selectionRef);
    if (selected === null) {
      throw new TypeError(
        `${HOG_PROGRAM_SELECTION_KEY} ${selectionRef} on ${sourceRef} does not ` +
          `name a program in the declared catalog`
      );
    }
    return Object.freeze({ program: selected, source: "declared_catalog" as const });
  }
  if (selectionRef !== null) {
    throw new TypeError(
      `${HOG_PROGRAM_SELECTION_KEY} on ${sourceRef} requires a declared ` +
        `${HOG_PROGRAM_CATALOG_DECLARATION_KEY}`
    );
  }
  const single = hogProgramFromDeclarationAttrs(graphFunction.declarations, sourceRef);
  if (single !== null) {
    if (!single.accepted || single.program === null) {
      throw new TypeError(
        `${HOG_PROGRAM_DECLARATION_KEY} on ${sourceRef} failed admission: ` +
          single.issues.join("; ")
      );
    }
    return Object.freeze({ program: single.program, source: "declared" as const });
  }
  return Object.freeze({ program: HOG_BOOTSTRAP_TRIPLE, source: "default" as const });
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
