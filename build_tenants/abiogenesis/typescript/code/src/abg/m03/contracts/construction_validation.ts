// Implements: T-140
// Implements: REQ-R-ABG3-FP-CONSCIOUSNESS

import {
  assertNonEmptyString,
  freezeStringArray
} from "./runtime_support.js";
import type { ConstructionActionKind } from "./construction_action_kinds.js";

export function assertAllowedString<T extends string>(
  value: string,
  allowed: readonly T[],
  label: string
): T {
  for (const candidate of allowed) {
    if (candidate === value) {
      return candidate;
    }
  }
  throw new TypeError(`${label} has unsupported value ${JSON.stringify(value)}`);
}

export function assertNonNegativeFiniteNumber(
  value: number,
  label: string
): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`${label} must be a non-negative finite number`);
  }
}

export function assertNullableNonNegativeFiniteNumber(
  value: number | null,
  label: string
): void {
  if (value !== null) {
    assertNonNegativeFiniteNumber(value, label);
  }
}

export function freezeNonEmptyStrings(
  values: readonly string[],
  label: string
): readonly string[] {
  const seen = new Set<string>();
  for (const [index, value] of values.entries()) {
    assertNonEmptyString(value, `${label}[${index}]`);
    if (seen.has(value)) {
      throw new TypeError(`${label} contains duplicate value ${JSON.stringify(value)}`);
    }
    seen.add(value);
  }
  return freezeStringArray(values);
}

export function uniqueNonEmptyStrings(
  values: readonly string[],
  label: string
): readonly string[] {
  values.forEach((value, index) =>
    assertNonEmptyString(value, `${label}[${index}]`)
  );
  return freezeStringArray([...new Set(values)].sort());
}

export function nullableString(value: string | null, label: string): string | null {
  if (value === null) {
    return null;
  }
  assertNonEmptyString(value, label);
  return value;
}

export function assertPlainRecord(
  value: unknown,
  label: string
): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
  return Object.freeze(Object.fromEntries(Object.entries(value)));
}

export function requiredStringField(
  record: Record<string, unknown>,
  key: string,
  label: string
): string {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label}.${key} must be a non-empty string`);
  }
  return value;
}

export function optionalStringArrayField(
  record: Record<string, unknown>,
  key: string,
  label: string
): readonly string[] {
  const value = record[key];
  if (value === undefined) {
    return Object.freeze([]);
  }
  if (!Array.isArray(value)) {
    throw new TypeError(`${label}.${key} must be an array`);
  }
  return freezeNonEmptyStrings(value, `${label}.${key}`);
}

export function optionalNumberField(
  record: Record<string, unknown>,
  key: string,
  fallback: number,
  label: string
): number {
  const value = record[key];
  if (value === undefined) {
    return fallback;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new TypeError(`${label}.${key} must be a non-negative finite number`);
  }
  return value;
}

export function optionalNullableNumberField(
  record: Record<string, unknown>,
  key: string,
  label: string
): number | null {
  const value = record[key];
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new TypeError(`${label}.${key} must be null or a non-negative finite number`);
  }
  return value;
}

export function configValueByAliases(
  record: Record<string, unknown>,
  aliases: readonly string[]
): unknown {
  const key = aliases.find((candidate) => record[candidate] !== undefined);
  return key === undefined ? undefined : record[key];
}

export function optionalStringArrayConfigByAliases(
  record: Record<string, unknown>,
  aliases: readonly string[],
  label: string
): readonly string[] {
  const value = configValueByAliases(record, aliases);
  if (value === undefined) {
    return Object.freeze([]);
  }
  if (!Array.isArray(value)) {
    throw new TypeError(`${label} must be an array`);
  }
  return uniqueNonEmptyStrings(
    value.map((entry, index) => {
      if (typeof entry !== "string" || entry.length === 0) {
        throw new TypeError(`${label}[${index}] must be a non-empty string`);
      }
      return entry;
    }),
    label
  );
}

export function optionalStringConfigByAliases(
  record: Record<string, unknown>,
  aliases: readonly string[],
  fallback: string,
  label: string
): string {
  const value = configValueByAliases(record, aliases);
  if (value === undefined) {
    return fallback;
  }
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

export function optionalNumberConfigByAliases(
  record: Record<string, unknown>,
  aliases: readonly string[],
  fallback: number,
  label: string
): number {
  const value = configValueByAliases(record, aliases);
  if (value === undefined) {
    return fallback;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new TypeError(`${label} must be a non-negative finite number`);
  }
  return value;
}

export function intersects(left: readonly string[], right: readonly string[]): boolean {
  const rightSet = new Set(right);
  return left.some((value) => rightSet.has(value));
}

export function matchesOptionalStrings(
  allowed: readonly string[],
  candidate: string
): boolean {
  return allowed.length === 0 || allowed.includes(candidate);
}

export function matchesOptionalActionKinds(
  allowed: readonly ConstructionActionKind[],
  candidate: ConstructionActionKind
): boolean {
  return allowed.length === 0 || allowed.includes(candidate);
}
