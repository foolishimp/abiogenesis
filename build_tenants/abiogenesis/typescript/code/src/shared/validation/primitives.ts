import * as v from "valibot";

const nonEmptyStringSchema = v.pipe(v.string(), v.trim(), v.minLength(1));
const stringSchema = v.string();
const booleanSchema = v.boolean();
const unknownArraySchema = v.array(v.unknown());
const nonEmptyStringArraySchema = v.array(nonEmptyStringSchema);
const stringOrNullSchema = v.nullable(v.string());

export type PlainObject = Record<string, unknown>;

function describe(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "validation failed";
}

function wrapValidationError(label: string, error: unknown): never {
  throw new TypeError(`${label}: ${describe(error)}`, { cause: error });
}

export function parseString(input: unknown, label: string): string {
  try {
    return v.parse(stringSchema, input);
  } catch (error: unknown) {
    wrapValidationError(label, error);
  }
}

export function parseNonEmptyString(input: unknown, label: string): string {
  try {
    return v.parse(nonEmptyStringSchema, input);
  } catch (error: unknown) {
    wrapValidationError(label, error);
  }
}

export function parseBoolean(input: unknown, label: string): boolean {
  try {
    return v.parse(booleanSchema, input);
  } catch (error: unknown) {
    wrapValidationError(label, error);
  }
}

export function parseStringArray(input: unknown, label: string): readonly string[] {
  try {
    return Object.freeze(v.parse(nonEmptyStringArraySchema, input));
  } catch (error: unknown) {
    wrapValidationError(label, error);
  }
}

export function parseUnknownArray(input: unknown, label: string): readonly unknown[] {
  try {
    return Object.freeze(v.parse(unknownArraySchema, input));
  } catch (error: unknown) {
    wrapValidationError(label, error);
  }
}

export function parseNullableString(input: unknown, label: string): string | null {
  try {
    return v.parse(stringOrNullSchema, input);
  } catch (error: unknown) {
    wrapValidationError(label, error);
  }
}

export function isPlainObject(input: unknown): input is PlainObject {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

export function parsePlainObject(input: unknown, label: string): PlainObject {
  if (!isPlainObject(input)) {
    throw new TypeError(`${label}: expected a plain object`);
  }
  return input;
}

export function parseOptionalField(
  input: PlainObject,
  field: string
): unknown {
  if (Object.hasOwn(input, field)) {
    return input[field];
  }
  return undefined;
}
