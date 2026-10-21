import type { JsonValue } from "./canonical_json.js";

/**
 * The one expected-failure carrier of the pure library layer (`validate`,
 * `select`, `derive`). It carries no owner meaning; an owner maps it into its
 * own union exactly once at the owner boundary.
 */
export type StructuralRefusal = Readonly<{
  kind: "structural_refusal";
  stage: "validate" | "select" | "derive";
  code: string;
  path: readonly string[];
  evidence: Readonly<Record<string, JsonValue>>;
}>;

export type Outcome<A> = Readonly<{ kind: "ok"; value: A }> | StructuralRefusal;

export function ok<A>(value: A): Outcome<A> {
  return Object.freeze({ kind: "ok", value });
}

export function refused(outcome: unknown): outcome is StructuralRefusal {
  return typeof outcome === "object" &&
    outcome !== null &&
    (outcome as Readonly<{ kind?: unknown }>).kind === "structural_refusal";
}

/** Sequential composition: a refusal passes through unchanged. */
export function then<A, B>(
  outcome: Outcome<A>,
  next: (value: A) => Outcome<B>,
): Outcome<B> {
  return outcome.kind === "ok" ? next(outcome.value) : outcome;
}
