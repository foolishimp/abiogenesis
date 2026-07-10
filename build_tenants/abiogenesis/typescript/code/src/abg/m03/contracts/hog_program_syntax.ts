// Implements: REQ-R-ABG3-CCALL-014 syntax isolation (T-200 P2a.2).
// This module is the ONLY place that knows AUTHORED program syntax.
// The engine consumes exclusively the normalized HogProgramDeclaration
// (hog_program.ts); every authored syntax — today's flat v1, future
// compose trees / workflow.C lifts / batch groupings — COMPILES here to
// that same normalized carrier. Upgrading the syntax never touches the
// engine seam; adding a version extends the dispatch below.

import type { SerializedAttrs } from "../../../gtl/m01/contracts/carriers.js";
import { serializedJsonValueToPlain } from "../../../gtl/m01/contracts/constructors.js";
import type { HogProgramAdmission, HogProgramDeclaration } from "./hog_program.js";
import { HOG_BOOTSTRAP_TRIPLE } from "./hog_program.js";
import { admitHogProgram } from "./hog_program.js";
import { isPlainRecord } from "./admission_hygiene.js";

export const HOG_PROGRAM_SYNTAX_VERSIONS = Object.freeze([
  "hog-syntax/1"
] as const);
export type HogProgramSyntaxVersion =
  (typeof HOG_PROGRAM_SYNTAX_VERSIONS)[number];

// hog-syntax/1: a flat stage list — deliberately basic. Richer algebra
// (compose/lift/batch) arrives as hog-syntax/2+ compiling to the same
// normalized form.
export interface HogProgramSyntaxV1 {
  readonly syntaxVersion: "hog-syntax/1";
  readonly programRef: string;
  readonly stages: readonly unknown[];
  readonly proportionalityClass: string | null;
}

export function compileHogProgramSyntax(input: unknown): HogProgramAdmission {
  if (!isPlainRecord(input)) {
    return Object.freeze({
      accepted: false,
      program: null,
      issues: Object.freeze(["program syntax must be an object"])
    });
  }
  const record = input;
  // Fail-closed forward compatibility: an unknown syntax version is
  // rejected, never guessed at.
  if (
    !HOG_PROGRAM_SYNTAX_VERSIONS.some(
      (version): boolean => version === record["syntaxVersion"]
    )
  ) {
    return Object.freeze({
      accepted: false,
      program: null,
      issues: Object.freeze([
        `unknown program syntaxVersion ${JSON.stringify(record["syntaxVersion"])}; known: ${JSON.stringify(HOG_PROGRAM_SYNTAX_VERSIONS)}`
      ])
    });
  }
  // closed key set at the SYNTAX layer too (codex P1 uniformity):
  // unknown authored fields are rejected with a message, never
  // silently dropped by the lowering.
  const SYNTAX_KEYS = ["syntaxVersion", "programRef", "stages", "proportionalityClass"];
  const unknownKeys = Object.keys(record).filter(
    (key) => !SYNTAX_KEYS.includes(key)
  );
  if (unknownKeys.length > 0) {
    return Object.freeze({
      accepted: false,
      program: null,
      issues: Object.freeze([
        `unknown program syntax fields ${JSON.stringify(unknownKeys)} (closed key set)`
      ])
    });
  }
  // hog-syntax/1 normalization: shape-preserving lowering into the
  // normalized declaration, judged by the one admission (stage-row
  // closed keys are enforced there).
  return admitHogProgram({
    kind: "hog_program_declaration",
    programRef: record["programRef"],
    stages: record["stages"],
    proportionalityClass: record["proportionalityClass"] ?? null
  });
}

// P3-F: the GTL-lawful authoring surface — products declare programs as
// tagged json_blob attrs under this key (declarations-are-data); the
// engine's interpreter consumes the compiled result at strangler step 2.
export const HOG_PROGRAM_DECLARATION_KEY = "abg.hog_program";

export function hogProgramFromDeclarationAttrs(
  attrs: SerializedAttrs,
  sourceRef: string
): HogProgramAdmission | null {
  const entry = attrs.entries.find((row) => row.key === HOG_PROGRAM_DECLARATION_KEY);
  if (entry === undefined) {
    return null;
  }
  if (entry.value.kind !== "json_blob") {
    return Object.freeze({
      accepted: false,
      program: null,
      issues: Object.freeze([
        `${HOG_PROGRAM_DECLARATION_KEY} on ${sourceRef} must be a json_blob declaration`
      ])
    });
  }
  return compileHogProgramSyntax(serializedJsonValueToPlain(entry.value.value));
}

// -016: HoG configurations are LABELLED, never a singleton — a catalog
// of named programs coexists; edges select by programRef. Tuning is
// addressable at both levels: workflow shape (the program) and prompt
// level (per-stage instructionCategoryRefs).
export const HOG_PROGRAM_CATALOG_DECLARATION_KEY = "abg.hog_program_catalog";
export const HOG_PROGRAM_SELECTION_KEY = "abg.hog_program_ref";

export interface HogProgramCatalog {
  readonly programs: ReadonlyMap<string, HogProgramDeclaration>;
}

export function compileHogProgramCatalog(input: unknown): {
  readonly accepted: boolean;
  readonly catalog: HogProgramCatalog | null;
  readonly issues: readonly string[];
} {
  if (!Array.isArray(input)) {
    return Object.freeze({ accepted: false, catalog: null, issues: Object.freeze(["catalog must be an array of program syntaxes"]) });
  }
  const issues: string[] = [];
  const programs = new Map<string, HogProgramDeclaration>();
  for (const [index, entry] of input.entries()) {
    const compiled = compileHogProgramSyntax(entry);
    if (!compiled.accepted || compiled.program === null) {
      issues.push(`catalog[${index}]: ${compiled.issues.join("; ")}`);
      continue;
    }
    if (programs.has(compiled.program.programRef)) {
      issues.push(`catalog[${index}]: duplicate programRef ${compiled.program.programRef}`);
      continue;
    }
    programs.set(compiled.program.programRef, compiled.program);
  }
  if (issues.length > 0) {
    return Object.freeze({ accepted: false, catalog: null, issues: Object.freeze(issues) });
  }
  return Object.freeze({ accepted: true, catalog: Object.freeze({ programs }), issues: Object.freeze([]) });
}

export function selectHogProgram(
  catalog: HogProgramCatalog,
  programRef: string
): HogProgramDeclaration | null {
  return catalog.programs.get(programRef) ?? null;
}

export function hogProgramCatalogFromDeclarationAttrs(
  attrs: SerializedAttrs,
  sourceRef: string
): ReturnType<typeof compileHogProgramCatalog> | null {
  const entry = attrs.entries.find((row) => row.key === HOG_PROGRAM_CATALOG_DECLARATION_KEY);
  if (entry === undefined) {
    return null;
  }
  if (entry.value.kind !== "json_blob") {
    return Object.freeze({
      accepted: false,
      catalog: null,
      issues: Object.freeze([
        `${HOG_PROGRAM_CATALOG_DECLARATION_KEY} on ${sourceRef} must be a json_blob declaration`
      ])
    });
  }
  return compileHogProgramCatalog(serializedJsonValueToPlain(entry.value.value));
}

// -017: the selection LADDER — ordered rungs over the declared catalog;
// the rung whose fromAttempt is the highest <= the observed attempt
// governs. Retry escalates the program (compression descent) instead of
// re-running the same shape blindly.
export const HOG_PROGRAM_LADDER_DECLARATION_KEY = "abg.hog_program_ladder";

export interface HogProgramLadderRung {
  readonly programRef: string;
  readonly fromAttempt: number;
}

export function compileHogProgramLadder(input: unknown): {
  readonly accepted: boolean;
  readonly rungs: readonly HogProgramLadderRung[] | null;
  readonly issues: readonly string[];
} {
  if (!Array.isArray(input) || input.length === 0) {
    return Object.freeze({ accepted: false, rungs: null, issues: Object.freeze(["ladder must be a non-empty array of rungs"]) });
  }
  const issues: string[] = [];
  const rungs: HogProgramLadderRung[] = [];
  let lastFrom = 0;
  for (const [index, entry] of input.entries()) {
    const at = `ladder[${index}]`;
    if (!isPlainRecord(entry)) {
      issues.push(`${at} must be a rung object`);
      continue;
    }
    const programRefRaw = entry["programRef"];
    const fromAttemptRaw = entry["fromAttempt"];
    if (typeof programRefRaw !== "string" || programRefRaw.length === 0 ||
        typeof fromAttemptRaw !== "number" || !Number.isInteger(fromAttemptRaw) || fromAttemptRaw < 1) {
      issues.push(`${at}: rung must carry {programRef, fromAttempt >= 1}`);
      continue;
    }
    if (index === 0 && fromAttemptRaw !== 1) {
      issues.push(`${at}: the first rung must start at attempt 1`);
    }
    if (fromAttemptRaw <= lastFrom && index > 0) {
      issues.push(`${at}: fromAttempt must strictly increase (escalation never skips back)`);
    }
    lastFrom = fromAttemptRaw;
    rungs.push(Object.freeze({ programRef: programRefRaw, fromAttempt: fromAttemptRaw }));
  }
  if (issues.length > 0) {
    return Object.freeze({ accepted: false, rungs: null, issues: Object.freeze(issues) });
  }
  return Object.freeze({ accepted: true, rungs: Object.freeze(rungs), issues: Object.freeze([]) });
}

export function ladderRungForAttempt(
  rungs: readonly HogProgramLadderRung[],
  attempt: number
): HogProgramLadderRung {
  let selected = rungs[0];
  for (const rung of rungs) {
    if (rung.fromAttempt <= attempt) selected = rung;
  }
  if (selected === undefined) {
    throw new TypeError("ladder must carry at least one rung");
  }
  return selected;
}

export function hogProgramLadderFromDeclarationAttrs(
  attrs: SerializedAttrs,
  sourceRef: string
): ReturnType<typeof compileHogProgramLadder> | null {
  const entry = attrs.entries.find((row) => row.key === HOG_PROGRAM_LADDER_DECLARATION_KEY);
  if (entry === undefined) return null;
  if (entry.value.kind !== "json_blob") {
    return Object.freeze({
      accepted: false, rungs: null,
      issues: Object.freeze([`${HOG_PROGRAM_LADDER_DECLARATION_KEY} on ${sourceRef} must be a json_blob declaration`])
    });
  }
  return compileHogProgramLadder(serializedJsonValueToPlain(entry.value.value));
}

// HANDLERS write surface: handler BINDINGS are declared data — the
// census rows {programRef, stageRole, armId, regime, handlerRef,
// handlerClass, handlerConfigRef} authored as GTL declarations; handler
// IMPLEMENTATIONS arrive by ref (standard set shipped by the substrate,
// custom impls via the plugin seam). Configs are declared per
// handlerConfigRef.
export const HOG_HANDLER_BINDINGS_DECLARATION_KEY = "abg.hog_handler_bindings";
export const HOG_HANDLER_CONFIGS_DECLARATION_KEY = "abg.hog_handler_configs";

export function hogHandlerBindingsFromDeclarationAttrs(
  attrs: SerializedAttrs,
  sourceRef: string
): readonly unknown[] | null {
  const entry = attrs.entries.find((row) => row.key === HOG_HANDLER_BINDINGS_DECLARATION_KEY);
  if (entry === undefined) return null;
  if (entry.value.kind !== "json_blob") {
    throw new TypeError(
      `${HOG_HANDLER_BINDINGS_DECLARATION_KEY} on ${sourceRef} must be a json_blob declaration`
    );
  }
  const plain: unknown = serializedJsonValueToPlain(entry.value.value);
  if (!Array.isArray(plain)) {
    throw new TypeError(
      `${HOG_HANDLER_BINDINGS_DECLARATION_KEY} on ${sourceRef} must be an array of binding rows`
    );
  }
  const rows: readonly unknown[] = plain;
  return rows;
}

export function hogHandlerConfigsFromDeclarationAttrs(
  attrs: SerializedAttrs,
  sourceRef: string
): Readonly<Record<string, unknown>> | null {
  const entry = attrs.entries.find((row) => row.key === HOG_HANDLER_CONFIGS_DECLARATION_KEY);
  if (entry === undefined) return null;
  if (entry.value.kind !== "json_blob") {
    throw new TypeError(
      `${HOG_HANDLER_CONFIGS_DECLARATION_KEY} on ${sourceRef} must be a json_blob declaration`
    );
  }
  const plain: unknown = serializedJsonValueToPlain(entry.value.value);
  if (!isPlainRecord(plain)) {
    throw new TypeError(
      `${HOG_HANDLER_CONFIGS_DECLARATION_KEY} on ${sourceRef} must be an object keyed by handlerConfigRef`
    );
  }
  return plain;
}

// USER RULING (2026-07-07): the HoG default program is a TYPED, LABELLED
// CATALOG ENTRY, not an invisible code fallback. The effective catalog
// ALWAYS contains the bootstrap triple under its reserved ref (marked
// default) so higher-order functions dynamically choose against the
// FULL set. Declared entries may not shadow the reserved ref.
export const HOG_BOOTSTRAP_PROGRAM_REF = HOG_BOOTSTRAP_TRIPLE.programRef;

export interface EffectiveHogProgramCatalog {
  readonly programs: ReadonlyMap<string, HogProgramDeclaration>;
  readonly defaultProgramRef: string;
}

export function effectiveHogProgramCatalog(
  declared: HogProgramCatalog | null
): EffectiveHogProgramCatalog {
  const programs = new Map<string, HogProgramDeclaration>();
  programs.set(HOG_BOOTSTRAP_PROGRAM_REF, HOG_BOOTSTRAP_TRIPLE);
  if (declared !== null) {
    for (const [ref, program] of declared.programs) {
      if (ref === HOG_BOOTSTRAP_PROGRAM_REF) {
        throw new TypeError(
          `hog_program_catalog_reserved_ref: ${HOG_BOOTSTRAP_PROGRAM_REF} is the ` +
            `substrate default and may not be shadowed by a declared entry`
        );
      }
      programs.set(ref, program);
    }
  }
  return Object.freeze({
    programs,
    defaultProgramRef: HOG_BOOTSTRAP_PROGRAM_REF
  });
}
