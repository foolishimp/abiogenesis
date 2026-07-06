// Implements: REQ-R-ABG3-CCALL-014 syntax isolation (T-200 P2a.2).
// This module is the ONLY place that knows AUTHORED program syntax.
// The engine consumes exclusively the normalized HogProgramDeclaration
// (hog_program.ts); every authored syntax — today's flat v1, future
// compose trees / workflow.C lifts / batch groupings — COMPILES here to
// that same normalized carrier. Upgrading the syntax never touches the
// engine seam; adding a version extends the dispatch below.

import type { SerializedAttrs } from "../../../gtl/m01/contracts/carriers.js";
import { serializedJsonValueToPlain } from "../../../gtl/m01/contracts/constructors.js";
import type { HogProgramAdmission } from "./hog_program.js";
import { admitHogProgram } from "./hog_program.js";

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
  const record = input as Partial<HogProgramSyntaxV1> | null;
  if (record === null || typeof record !== "object") {
    return Object.freeze({
      accepted: false,
      program: null,
      issues: Object.freeze(["program syntax must be an object"])
    });
  }
  // Fail-closed forward compatibility: an unknown syntax version is
  // rejected, never guessed at.
  if (
    !(HOG_PROGRAM_SYNTAX_VERSIONS as readonly string[]).includes(
      record.syntaxVersion as string
    )
  ) {
    return Object.freeze({
      accepted: false,
      program: null,
      issues: Object.freeze([
        `unknown program syntaxVersion ${JSON.stringify(record.syntaxVersion)}; known: ${JSON.stringify(HOG_PROGRAM_SYNTAX_VERSIONS)}`
      ])
    });
  }
  // hog-syntax/1 normalization: shape-preserving lowering into the
  // normalized declaration, judged by the one admission.
  return admitHogProgram({
    kind: "hog_program_declaration",
    programRef: record.programRef,
    stages: record.stages,
    proportionalityClass: record.proportionalityClass ?? null
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
