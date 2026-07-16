import { isAbsolute, resolve } from "node:path";

import { valid as validSemVer } from "semver";
import * as v from "valibot";

import { admitIJsonValue } from "../runtime_identity.js";

type NativeSchema = v.GenericSchema;

export const SEMANTIC_VERSION_PATTERN =
  /^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?:-(?:0|[1-9][0-9]*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9][0-9]*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/u;
const NON_EMPTY_TEXT_PATTERN = /^(?=\s*\S)[\s\S]+$/u;
const REF_PATTERN = /^(?=\S+$)[^\u0000-\u0020\u007f]+$/u;
const CONTRACT_ID_PATTERN = /^[a-z][a-z0-9._-]+$/u;
const CAPABILITY_ID_PATTERN = /^[a-z][a-z0-9._-]+@[1-9][0-9]*$/u;
const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/u;

function isAbsoluteNormalizedPosixPath(input: string): boolean {
  return isAbsolute(input) && !input.includes("\\") && resolve(input) === input;
}

function isCanonicalSemanticVersion(input: string): boolean {
  return validSemVer(input) === input;
}

function hasCanonicalIJsonHostShape(
  input: unknown,
  ancestors: Set<object>
): boolean {
  if (input === null || typeof input === "boolean" || typeof input === "string") {
    return true;
  }
  if (typeof input === "number") {
    return Number.isFinite(input) && !Object.is(input, -0);
  }
  if (typeof input !== "object" || ancestors.has(input)) {
    return false;
  }
  ancestors.add(input);
  try {
    if (Array.isArray(input)) {
      const lengthDescriptor = Object.getOwnPropertyDescriptor(input, "length");
      if (
        lengthDescriptor === undefined ||
        !("value" in lengthDescriptor) ||
        typeof lengthDescriptor.value !== "number"
      ) {
        return false;
      }
      const keys = Reflect.ownKeys(input);
      if (keys.length !== lengthDescriptor.value + 1) {
        return false;
      }
      for (let index = 0; index < lengthDescriptor.value; index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(input, String(index));
        if (
          descriptor === undefined ||
          !("value" in descriptor) ||
          descriptor.enumerable !== true ||
          !hasCanonicalIJsonHostShape(descriptor.value, ancestors)
        ) {
          return false;
        }
      }
      return keys.every(
        (key) =>
          typeof key === "string" &&
          (key === "length" ||
            (/^(?:0|[1-9][0-9]*)$/u.test(key) &&
              Number(key) < lengthDescriptor.value))
      );
    }
    const prototype: unknown = Object.getPrototypeOf(input);
    if (prototype !== Object.prototype && prototype !== null) {
      return false;
    }
    for (const key of Reflect.ownKeys(input)) {
      if (typeof key !== "string") {
        return false;
      }
      const descriptor = Object.getOwnPropertyDescriptor(input, key);
      if (
        descriptor === undefined ||
        !("value" in descriptor) ||
        descriptor.enumerable !== true ||
        !hasCanonicalIJsonHostShape(descriptor.value, ancestors)
      ) {
        return false;
      }
    }
    return true;
  } finally {
    ancestors.delete(input);
  }
}

function requireCanonicalIJson(input: unknown): true {
  try {
    if (!hasCanonicalIJsonHostShape(input, new Set<object>())) {
      throw new TypeError("expected a canonical I-JSON value");
    }
    admitIJsonValue(input);
  } catch {
    throw new TypeError("expected a canonical I-JSON value");
  }
  return true;
}

function identityOf(input: unknown): string | null {
  if (typeof input === "string") {
    return input;
  }
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return null;
  }
  for (const field of ["grantRef", "ref", "identity"] as const) {
    const value: unknown = Reflect.get(input, field);
    if (typeof value === "string") {
      return value;
    }
  }
  return null;
}

export function hasUniqueNativeIdentity(input: unknown): boolean {
  if (!Array.isArray(input)) {
    return false;
  }
  const identities = input.map(identityOf);
  return (
    identities.every((identity) => identity !== null) &&
    new Set(identities).size === identities.length
  );
}

export const ABSOLUTE_POSIX_PATH_ACTION = v.check(
  isAbsoluteNormalizedPosixPath,
  "expected an absolute normalized POSIX path"
);
export const SEMANTIC_VERSION_ACTION = v.check(
  isCanonicalSemanticVersion,
  "expected a canonical semantic version"
);
export const CANONICAL_IJSON_ACTION = v.check(
  requireCanonicalIJson,
  "expected a canonical I-JSON value"
);
export const POSITIVE_INTEGER_ACTION = v.integer("expected an integer");
export const SAFE_INTEGER_ACTION = v.safeInteger("expected a safe integer");
export const MINIMUM_ONE_ACTION = v.minValue<
  number,
  1,
  "expected a positive integer"
>(1, "expected a positive integer");

function unicodeText(pattern: RegExp) {
  return v.pipe(v.string(), v.regex(pattern));
}

function brandedText<const Name extends v.BrandName>(
  pattern: RegExp,
  name: Name
) {
  return v.pipe(unicodeText(pattern), v.brand(name));
}

export const nonEmptyTextSchema = unicodeText(NON_EMPTY_TEXT_PATTERN);
export const refTextSchema = unicodeText(REF_PATTERN);
export const refSchema = v.pipe(refTextSchema, v.brand("Ref"));
export const contractIdSchema = brandedText(CONTRACT_ID_PATTERN, "ContractId");
export const capabilityIdSchema = brandedText(
  CAPABILITY_ID_PATTERN,
  "CapabilityId"
);
export const sha256DigestSchema = brandedText(SHA256_PATTERN, "Sha256Digest");
export const semanticVersionSchema = v.pipe(
  v.string(),
  SEMANTIC_VERSION_ACTION,
  v.brand("SemanticVersion")
);
export const absolutePosixPathSchema = v.pipe(
  v.string(),
  ABSOLUTE_POSIX_PATH_ACTION,
  v.brand("AbsolutePosixPath")
);
export const safePositiveIntegerSchema = v.pipe(
  v.number(),
  POSITIVE_INTEGER_ACTION,
  SAFE_INTEGER_ACTION,
  MINIMUM_ONE_ACTION
);
export const canonicalIJsonSchema = v.pipe(
  v.unknown(),
  CANONICAL_IJSON_ACTION
);

export function uniqueByNativeIdentityArray<const S extends NativeSchema>(
  schema: S
) {
  return v.pipe(
    v.array(schema),
    v.check<v.InferOutput<S>[], "duplicate or missing stable identity">(
      hasUniqueNativeIdentity,
      "duplicate or missing stable identity"
    )
  );
}
