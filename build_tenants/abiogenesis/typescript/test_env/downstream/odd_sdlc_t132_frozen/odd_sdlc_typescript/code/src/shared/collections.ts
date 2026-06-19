export function uniqueSorted<T extends string>(values: readonly T[]): readonly T[] {
  return Object.freeze([...new Set(values)].sort());
}

export function sortedStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...values].sort());
}

export function uniqueLocaleSorted(
  values: readonly string[]
): readonly string[] {
  return Object.freeze(
    [...new Set(values)].sort((left, right) => left.localeCompare(right))
  );
}

export function uniquePresentSorted(
  values: readonly string[]
): readonly string[] {
  return Object.freeze(
    [...new Set(values.filter((value) => value.length > 0))].sort()
  );
}

export function uniqueNonEmptySorted(
  values: readonly string[]
): readonly string[] {
  return Object.freeze(
    [...new Set(values.filter((value) => value.trim().length > 0))].sort()
  );
}

export function uniqueTrimmedSorted(
  values: readonly string[]
): readonly string[] {
  return Object.freeze(
    [
      ...new Set(
        values.map((value) => value.trim()).filter((value) => value.length > 0)
      )
    ].sort()
  );
}
