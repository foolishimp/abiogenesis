import { isAbsolute } from "node:path";
import { valid, validRange } from "semver";

import { admitIJsonValue, type IJsonValue } from "./canonical.js";
import type { Sha256Digest } from "./carriers.js";

export type RawObject = Record<string, unknown>;

function isRawObject(input: unknown): input is RawObject {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return false;
  }
  const prototype: unknown = Object.getPrototypeOf(input);
  return prototype === Object.prototype || prototype === null;
}

export function closedObject(
  input: unknown,
  allowedKeys: readonly string[],
  label: string
): RawObject {
  if (!isRawObject(input)) {
    throw new TypeError(`${label}: expected a plain object`);
  }
  const allowed = new Set(allowedKeys);
  for (const key of Object.keys(input)) {
    if (!allowed.has(key)) {
      throw new TypeError(`${label}.${key}: unknown field`);
    }
  }
  return input;
}

export function requiredField(
  input: RawObject,
  field: string,
  label: string
): unknown {
  if (!Object.hasOwn(input, field)) {
    throw new TypeError(`${label}.${field}: required`);
  }
  return input[field];
}

export function optionalField(input: RawObject, field: string): unknown {
  return Object.hasOwn(input, field) ? input[field] : undefined;
}

export function nonEmptyString(input: unknown, label: string): string {
  if (typeof input !== "string" || input.trim().length === 0) {
    throw new TypeError(`${label}: expected a non-empty string`);
  }
  return input;
}

export function exactSemVer(input: unknown, label: string): string {
  const value = nonEmptyString(input, label);
  if (valid(value) !== value) {
    throw new TypeError(`${label}: expected an exact canonical SemVer`);
  }
  return value;
}

export function canonicalSemVerRange(input: unknown, label: string): string {
  const value = nonEmptyString(input, label);
  const canonical = validRange(value);
  if (canonical === null) {
    throw new TypeError(`${label}: expected a valid SemVer range`);
  }
  return canonical;
}

export function utcTimestamp(input: unknown, label: string): string {
  const value = nonEmptyString(input, label);
  const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,3}))?Z$/u.exec(
    value
  );
  if (match === null) {
    throw new TypeError(`${label}: expected an ISO-8601 UTC timestamp`);
  }
  const second = match[1];
  const fraction = match[2] ?? "";
  const canonical = `${second}.${fraction.padEnd(3, "0")}Z`;
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.valueOf()) || parsed.toISOString() !== canonical) {
    throw new TypeError(`${label}: expected a valid ISO-8601 UTC timestamp`);
  }
  return value;
}

export function nullableString(input: unknown, label: string): string | null {
  return input === null ? null : nonEmptyString(input, label);
}

export function booleanValue(input: unknown, label: string): boolean {
  if (typeof input !== "boolean") {
    throw new TypeError(`${label}: expected a boolean`);
  }
  return input;
}

export function integerInRange(
  input: unknown,
  minimum: number,
  maximum: number,
  label: string
): number {
  if (
    typeof input !== "number" ||
    !Number.isSafeInteger(input) ||
    input < minimum ||
    input > maximum
  ) {
    throw new TypeError(
      `${label}: expected a safe integer in ${String(minimum)}..${String(maximum)}`
    );
  }
  return input;
}

export function oneOf<T extends string>(
  input: unknown,
  values: readonly T[],
  label: string
): T {
  const value = nonEmptyString(input, label);
  for (const candidate of values) {
    if (value === candidate) {
      return candidate;
    }
  }
  throw new TypeError(`${label}: expected one of ${values.join(", ")}`);
}

export function literal<T extends string | number>(
  input: unknown,
  expected: T,
  label: string
): T {
  if (input !== expected) {
    throw new TypeError(`${label}: expected ${JSON.stringify(expected)}`);
  }
  return expected;
}

export function arrayOf<T>(
  input: unknown,
  label: string,
  admit: (value: unknown, valueLabel: string) => T
): readonly T[] {
  if (!Array.isArray(input)) {
    throw new TypeError(`${label}: expected an array`);
  }
  return Object.freeze(
    input.map((value, index) => admit(value, `${label}[${String(index)}]`))
  );
}

export function uniqueStrings(
  input: unknown,
  label: string,
  allowEmpty = true
): readonly string[] {
  const values = arrayOf(input, label, nonEmptyString);
  if (!allowEmpty && values.length === 0) {
    throw new TypeError(`${label}: expected a non-empty array`);
  }
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      throw new TypeError(`${label}: duplicate value ${JSON.stringify(value)}`);
    }
    seen.add(value);
  }
  return values;
}

export function digest(input: unknown, label: string): Sha256Digest {
  const value = nonEmptyString(input, label);
  if (!isSha256Digest(value)) {
    throw new TypeError(`${label}: expected sha256:<64 lowercase hex>`);
  }
  return value;
}

function isSha256Digest(value: string): value is Sha256Digest {
  return /^sha256:[0-9a-f]{64}$/u.test(value);
}

export function absolutePath(input: unknown, label: string): string {
  const value = nonEmptyString(input, label);
  if (!isAbsolute(value)) {
    throw new TypeError(`${label}: expected an absolute path`);
  }
  return value;
}

export function relativePath(input: unknown, label: string): string {
  const value = nonEmptyString(input, label);
  if (
    isAbsolute(value) ||
    value.includes("\\") ||
    value
      .split("/")
      .some(
        (segment) =>
          segment === "." || segment === ".." || segment.length === 0
      )
  ) {
    throw new TypeError(`${label}: expected a confined product-relative path`);
  }
  return value;
}

export function iJson(input: unknown, label: string): IJsonValue {
  return admitIJsonValue(input, label);
}

export function equalStringArrays(
  left: readonly string[],
  right: readonly string[]
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}
