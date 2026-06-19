import { isPlainRecord } from "../admission/codecs.js";

export function parseClosedRecord(
  input: unknown,
  label: string,
  allowedKeys: readonly string[]
): Readonly<Record<string, unknown>> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new TypeError(`${label}: expected closed object`);
  }
  if (!isPlainRecord(input)) {
    throw new TypeError(`${label}: expected plain object`);
  }
  const record = input;
  const allowed = new Set(allowedKeys);
  const unexpectedKeys = Object.keys(record).filter((key) => !allowed.has(key));
  if (unexpectedKeys.length === 1) {
    throw new TypeError(`${label}.${unexpectedKeys[0]}: unexpected field`);
  }
  if (unexpectedKeys.length > 1) {
    throw new TypeError(
      unexpectedKeys
        .map((key) => `${label}.${key}: unexpected field`)
        .join("; ")
    );
  }
  return record;
}

export function parseString(input: unknown, label: string): string {
  if (typeof input !== "string") {
    throw new TypeError(`${label}: expected string`);
  }
  return input;
}

export function parseNonEmptyString(input: unknown, label: string): string {
  const value = parseString(input, label);
  if (value.length === 0) {
    throw new TypeError(`${label}: expected non-empty string`);
  }
  return value;
}

export function parseBoolean(input: unknown, label: string): boolean {
  if (typeof input !== "boolean") {
    throw new TypeError(`${label}: expected boolean`);
  }
  return input;
}

export function parseNullableNonEmptyString(
  input: unknown,
  label: string
): string | null {
  if (input === null) {
    return null;
  }
  return parseNonEmptyString(input, label);
}

export function parseStringList(
  input: unknown,
  label: string
): readonly string[] {
  if (!Array.isArray(input)) {
    throw new TypeError(`${label}: expected array`);
  }
  return Object.freeze(
    input.map((item, index) => parseNonEmptyString(item, `${label}[${index}]`))
  );
}

export function parseArray<T>(
  input: unknown,
  label: string,
  parseItem: (item: unknown, itemLabel: string) => T
): readonly T[] {
  if (!Array.isArray(input)) {
    throw new TypeError(`${label}: expected array`);
  }
  return Object.freeze(
    input.map((item, index) => parseItem(item, `${label}[${index}]`))
  );
}

export function parseOptionalArray<T>(
  input: unknown,
  label: string,
  parseItem: (item: unknown, itemLabel: string) => T
): readonly T[] {
  if (input === undefined) {
    return Object.freeze([]);
  }
  return parseArray(input, label, parseItem);
}

export function parseEnumValue<T extends string>(
  input: unknown,
  label: string,
  values: readonly T[]
): T {
  const value = parseString(input, label);
  for (const allowed of values) {
    if (value === allowed) {
      return allowed;
    }
  }
  throw new TypeError(
    `${label}: expected one of ${values.map((item) => JSON.stringify(item)).join(", ")}`
  );
}

export function parseOptionalField(
  record: Readonly<Record<string, unknown>>,
  key: string
): unknown {
  return record[key];
}

export function parseKind(
  input: unknown,
  expectedKind: string,
  label: string
): string {
  const value = parseNonEmptyString(input, label);
  if (value !== expectedKind) {
    throw new TypeError(`${label}: expected ${expectedKind}`);
  }
  return value;
}
