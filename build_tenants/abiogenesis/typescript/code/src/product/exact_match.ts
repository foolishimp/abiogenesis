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

export function resolveExactMatch<T>(
  values: readonly T[],
  predicate: (value: T) => boolean,
): ExactMatch<T> {
  const matches = values.filter(predicate);
  if (matches.length === 0) return Object.freeze({ kind: "absent" });
  if (matches.length === 1) {
    return Object.freeze({ kind: "one", value: matches[0]! });
  }
  return Object.freeze({
    kind: "many",
    values: Object.freeze([...matches]),
  });
}
