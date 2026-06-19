// Implements: T-175

export type JsonGuard<T = unknown> = (value: unknown) => value is T;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isPlainRecord(
  value: unknown
): value is Record<string, unknown> {
  if (!isRecord(value)) {
    return false;
  }
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function recordHasKind(value: unknown, expected: string): boolean {
  return isRecord(value) && value["kind"] === expected;
}

export function isTrimmedNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.trim() === value;
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function isNonNegativeFiniteNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0;
}

export function arrayOf<T>(guard: JsonGuard<T>): JsonGuard<readonly T[]> {
  return (value: unknown): value is readonly T[] =>
    Array.isArray(value) && value.every((entry) => guard(entry));
}

export function nullable<T>(guard: JsonGuard<T>): JsonGuard<T | null> {
  return (value: unknown): value is T | null => value === null || guard(value);
}

export function oneOf<T extends string>(values: readonly T[]): JsonGuard<T> {
  const allowed = new Set<string>(values);
  return (value: unknown): value is T =>
    typeof value === "string" && allowed.has(value);
}

export function recordShape<T>(input: {
  readonly kind?: string;
  readonly fields: Readonly<Record<string, JsonGuard>>;
}): JsonGuard<T> {
  return (value: unknown): value is T => {
    const record = isRecord(value) ? value : null;
    if (record === null) {
      return false;
    }
    if (input.kind !== undefined && record["kind"] !== input.kind) {
      return false;
    }
    return Object.entries(input.fields).every(([fieldName, guard]) =>
      guard(record[fieldName])
    );
  };
}

export function guardKind<T extends { readonly kind: string }>(
  expected: T["kind"]
): JsonGuard<T> {
  return (value: unknown): value is T => recordHasKind(value, expected);
}

export function guardKinds<T extends { readonly kind: string }>(
  expectedKinds: readonly T["kind"][]
): JsonGuard<T> {
  const set = new Set<string>(expectedKinds);
  return (value: unknown): value is T =>
    isRecord(value) &&
    typeof value["kind"] === "string" &&
    set.has(value["kind"]);
}
