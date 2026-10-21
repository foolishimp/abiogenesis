import { ok, type Outcome, type StructuralRefusal } from "../refusal.js";

/** The closed `select` codomain: `one` is `exact`, `many` is `ambiguous`. */
export type ExactMatch<T> =
  | Readonly<{
      kind: "absent";
    }>
  | Readonly<{
      kind: "one";
      value: T;
    }>
  | Readonly<{
      kind: "many";
      values: readonly T[];
    }>;

/** A finite selection source: an array, or an ordered view with `filter`. */
export type ExactMatchSource<T> =
  | readonly T[]
  | Readonly<{ filter(predicate: (value: T) => boolean): readonly T[] }>;

const ABSENT: ExactMatch<never> = Object.freeze({ kind: "absent" });

/** The count decision for an already selected array. */
export function exactMatchCardinality(length: number): "absent" | "one" | "many" {
  if (!Number.isSafeInteger(length) || length < 0) {
    throw new RangeError("exact-match cardinality requires a non-negative integral length");
  }
  return length === 0 ? "absent" : length === 1 ? "one" : "many";
}

/** Cardinality of an already selected array; every occurrence is kept. */
export function onlyExactMatch<T>(selected: readonly T[]): ExactMatch<T> {
  switch (exactMatchCardinality(selected.length)) {
    case "absent":
      return ABSENT;
    case "one":
      return Object.freeze({ kind: "one", value: selected[0]! });
    case "many":
      return Object.freeze({ kind: "many", values: Object.freeze([...selected]) });
  }
}

/**
 * Selects every occurrence the predicate accepts, in source order, then
 * decides cardinality. No early exit, deduplication, default or first-match
 * substitution; a predicate exception propagates.
 */
export function resolveExactMatch<T>(
  values: ExactMatchSource<T>,
  predicate: (value: T) => boolean,
): ExactMatch<T> {
  const source: Readonly<{ filter(predicate: (value: T) => boolean): readonly T[] }> = values;
  return onlyExactMatch(source.filter(predicate));
}

function selectRefusal(code: "absent" | "many", matches: number): StructuralRefusal {
  return Object.freeze({
    kind: "structural_refusal" as const,
    stage: "select" as const,
    code,
    path: Object.freeze([]),
    evidence: Object.freeze({ matches }),
  });
}

/** Lifts `absent` and `many` to `select` refusals for sequential composition. */
export function exactMatchOutcome<T>(match: ExactMatch<T>): Outcome<T> {
  switch (match.kind) {
    case "one":
      return ok(match.value);
    case "absent":
      return selectRefusal("absent", 0);
    case "many":
      return selectRefusal("many", match.values.length);
  }
}
