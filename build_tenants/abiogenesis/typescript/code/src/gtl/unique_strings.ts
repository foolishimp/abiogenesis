export function assertUniqueStringValues(
  values: readonly string[],
  label: string,
): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      throw new TypeError(
        `${label} contains duplicate value ${JSON.stringify(value)}`,
      );
    }
    seen.add(value);
  }
}
