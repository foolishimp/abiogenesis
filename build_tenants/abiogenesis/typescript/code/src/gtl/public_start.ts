import type { GtlProgram, ProgramStart } from "./contracts.js";

export type ProgramStartUntil = "converged";
export type ProgramRootMode = "direct" | "supervised";

export interface ProgramStartRequest {
  readonly scope: "program";
  readonly target: string;
  readonly until: ProgramStartUntil;
  readonly rootMode: ProgramRootMode;
  readonly startRef?: string;
}

export interface ResolvedProgramStart {
  readonly kind: "resolved_program_start";
  readonly targetKind: "asset" | "declared_start" | "next";
  readonly start: Readonly<ProgramStart>;
  readonly assetRef: string | null;
}

export interface ProgramStartRefusal {
  readonly kind: "program_start_refusal";
  readonly code:
    | "ambiguous_target"
    | "missing_target"
    | "unsupported_control";
  readonly message: string;
}

function refusal(
  code: ProgramStartRefusal["code"],
  message: string,
): ProgramStartRefusal {
  return {
    kind: "program_start_refusal",
    code,
    message,
  };
}

function scopeRefusal(
  request: Pick<ProgramStartRequest, "scope">,
): ProgramStartRefusal | null {
  return request.scope === "program" ? null : refusal(
    "unsupported_control",
    "public start scope must name the admitted Program",
  );
}

const DIRECT_START_REFUSAL =
  "direct public control requires next or asset target with until converged and no caller-selected start";

// The direct start law (REQ-P-POLICY-013): until converged, no caller-selected
// start, and a Program whose root-mode policy is direct. An absent policy is
// the supervised default.
function directStartRefusal(
  program: Readonly<GtlProgram>,
  request: Pick<ProgramStartRequest, "until" | "startRef">,
): ProgramStartRefusal | null {
  return request.until !== "converged" ||
      request.startRef !== undefined ||
      program.policies["abg.root_mode"] !== "direct"
    ? refusal("unsupported_control", DIRECT_START_REFUSAL)
    : null;
}

/** @internal A `graph_function` start target selects one callable member as a
 * direct start, so it passes the same direct start law as `next` and asset
 * targets; the Product and ABG admission both call this owner. The caller's
 * stated root mode is recorded as stated and not read here. */
export function graphFunctionStartRefusal(
  program: Readonly<GtlProgram>,
  request: Pick<ProgramStartRequest, "scope" | "until">,
): ProgramStartRefusal | null {
  return scopeRefusal(request) ??
    directStartRefusal(program, { until: request.until });
}

export function resolveProgramStart(
  program: Readonly<GtlProgram>,
  request: ProgramStartRequest,
): ResolvedProgramStart | ProgramStartRefusal {
  const outOfScope = scopeRefusal(request);
  if (outOfScope !== null) return outOfScope;
  if (
    request.until === "converged" &&
    request.rootMode === "supervised" &&
    request.startRef !== undefined &&
    request.target === request.startRef &&
    program.policies["abg.root_mode"] === "supervised"
  ) {
    const matches = program.starts.filter(
      (start) => start.startRef === request.startRef,
    );
    return matches.length === 1
      ? {
          kind: "resolved_program_start",
          targetKind: "declared_start",
          start: matches[0]!,
          assetRef: null,
        }
      : refusal(
          matches.length === 0 ? "missing_target" : "ambiguous_target",
          "supervised start must resolve one exact declared Program start",
        );
  }
  const notDirect = request.rootMode === "direct"
    ? directStartRefusal(program, request)
    : refusal("unsupported_control", DIRECT_START_REFUSAL);
  if (notDirect !== null) return notDirect;
  if (request.target === "next") {
    const defaultStartRef = program.policies["abg.default_start_ref"];
    const matches = program.starts.filter(
      (start) => start.startRef === defaultStartRef,
    );
    return matches.length === 1
      ? {
          kind: "resolved_program_start",
          targetKind: "next",
          start: matches[0]!,
          assetRef: null,
        }
      : refusal(
          matches.length === 0 ? "missing_target" : "ambiguous_target",
          "next requires one Product-declared default Program start",
        );
  }
  if (request.target.startsWith("asset:")) {
    const handle = request.target.slice("asset:".length);
    const matches = (program.publicAssetTargets ?? []).filter(
      (target) => target.handle === handle,
    );
    if (matches.length !== 1) {
      return refusal(
        matches.length === 0 ? "missing_target" : "ambiguous_target",
        "asset target must resolve exactly once in the Product-published Program registry",
      );
    }
    const [target] = matches;
    const starts = program.starts.filter(
      (start) => start.startRef === target!.startRef,
    );
    return starts.length === 1
      ? {
          kind: "resolved_program_start",
          targetKind: "asset",
          start: starts[0]!,
          assetRef: target!.assetRef,
        }
      : refusal(
          starts.length === 0 ? "missing_target" : "ambiguous_target",
          "asset target owner must be one exact declared Program start",
        );
  }
  return refusal(
    "missing_target",
    "public start target is neither next nor a published asset handle",
  );
}
