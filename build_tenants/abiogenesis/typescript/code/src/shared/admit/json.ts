import type { JsonValue } from "../canonical_json.js";
import { deepFreeze } from "../immutable.js";
import { ok, type Outcome, type StructuralRefusal } from "../refusal.js";
import { validateRefusal } from "./validate_refusal.js";

/**
 * The closed I-JSON admission codes. The value domain of `admitJson` yields
 * `invalid_unicode_scalar`, `non_finite_number`, `non_ijson_value` and
 * `unsafe_integral_number`; the text front end of `i_json.ts` adds
 * `duplicate_object_key`, `invalid_json_framing` and `malformed_json`.
 */
export const JSON_ADMISSION_CODES = Object.freeze([
  "duplicate_object_key",
  "invalid_json_framing",
  "invalid_unicode_scalar",
  "malformed_json",
  "non_finite_number",
  "non_ijson_value",
  "unsafe_integral_number",
] as const);

export type JsonAdmissionCode = typeof JSON_ADMISSION_CODES[number];

// A refusal's `path` holds the JSON pointer segments of the refused member;
// its evidence holds `at`, the location suffix in the existing label grammar
// (`.key`, `[index]`, ` key`), and `reason`. A labelled lift renders
// `${label}${at}: ${reason}`.
function refuse(
  code: JsonAdmissionCode,
  path: readonly string[],
  at: string,
  reason: string,
): StructuralRefusal {
  return validateRefusal(code, path, { at, reason });
}

function admitScalarString(
  value: string,
  path: readonly string[],
  at: string,
): Outcome<string> {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    if (codeUnit < 0xd800 || codeUnit > 0xdfff) continue;
    if (codeUnit >= 0xdc00) {
      return refuse("invalid_unicode_scalar", path, at, "lone low surrogate is not I-JSON");
    }
    const next = value.charCodeAt(index + 1);
    if (!(next >= 0xdc00 && next <= 0xdfff)) {
      return refuse("invalid_unicode_scalar", path, at, "lone high surrogate is not I-JSON");
    }
    index += 1;
  }
  return ok(value);
}

// D12: a plain record or array of any realm is admitted by structure; a
// prototype confers nothing, because admission copies own data members into
// fresh ordinary containers. A prototype is a realm's `Object.prototype` when it
// is this realm's, or when its own prototype is `null` and its own data
// `constructor` is a function named `Object` whose own data `prototype` is that
// same object. No getter runs.
function isRealmPrototype(prototype: object, name: "Array" | "Object"): boolean {
  const constructor = Object.getOwnPropertyDescriptor(prototype, "constructor");
  if (!isDataDescriptor(constructor) || typeof constructor.value !== "function") return false;
  const constructorName = Object.getOwnPropertyDescriptor(constructor.value, "name");
  const constructorPrototype = Object.getOwnPropertyDescriptor(constructor.value, "prototype");
  return isDataDescriptor(constructorName) && constructorName.value === name &&
    isDataDescriptor(constructorPrototype) && constructorPrototype.value === prototype;
}

function isRealmObjectPrototype(prototype: object | null): boolean {
  if (prototype === Object.prototype) return true;
  return prototype !== null && Object.getPrototypeOf(prototype) === null && isRealmPrototype(prototype, "Object");
}

// A record's prototype is `null` or a realm's `Object.prototype`.
function isJsonObject(input: object): boolean {
  const prototype = Object.getPrototypeOf(input) as object | null;
  return prototype === null || isRealmObjectPrototype(prototype);
}

// An array's prototype is a realm's `Array.prototype`: this realm's, or an
// array whose own data `constructor` is a function named `Array` whose own data
// `prototype` is that same object, with a realm's `Object.prototype` above it.
// A subclass prototype or a plain array prototype is not.
function isRealmArrayPrototype(prototype: object | null): boolean {
  if (prototype === Array.prototype) return true;
  return prototype !== null && Array.isArray(prototype) && isRealmPrototype(prototype, "Array") &&
    isRealmObjectPrototype(Object.getPrototypeOf(prototype) as object | null);
}

function isDataDescriptor(
  descriptor: PropertyDescriptor | undefined,
): descriptor is PropertyDescriptor & { readonly value: unknown } {
  return descriptor !== undefined &&
    Object.hasOwn(descriptor, "value") &&
    !Object.hasOwn(descriptor, "get") &&
    !Object.hasOwn(descriptor, "set");
}

function defineMember(
  target: Record<string, JsonValue>,
  key: string,
  value: JsonValue,
): void {
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: true,
    value,
    writable: true,
  });
}

function admitArray(
  input: unknown[],
  path: readonly string[],
  at: string,
): Outcome<JsonValue> {
  // D12: an array of any realm (see `isRealmArrayPrototype`).
  if (!isRealmArrayPrototype(Object.getPrototypeOf(input) as object | null)) {
    return refuse("non_ijson_value", path, at, "custom-prototype arrays are not I-JSON");
  }
  const ownKeys = Reflect.ownKeys(input);
  if (ownKeys.some((key) => typeof key === "symbol")) {
    return refuse("non_ijson_value", path, at, "symbol array members are not I-JSON");
  }
  const lengthDescriptor = Object.getOwnPropertyDescriptor(input, "length");
  if (
    !isDataDescriptor(lengthDescriptor) ||
    lengthDescriptor.enumerable !== false ||
    lengthDescriptor.configurable !== false ||
    typeof lengthDescriptor.value !== "number" ||
    !Number.isInteger(lengthDescriptor.value) ||
    lengthDescriptor.value < 0 ||
    lengthDescriptor.value > 0xffff_ffff
  ) {
    return refuse("non_ijson_value", path, at, "array length is not an ordinary data member");
  }
  const length = lengthDescriptor.value;
  if (ownKeys.length !== length + 1) {
    return refuse("non_ijson_value", path, at, "arrays must contain exactly dense indices and length");
  }
  const admitted: JsonValue[] = [];
  for (let index = 0; index < length; index += 1) {
    const memberPath = [...path, String(index)];
    const memberAt = `${at}[${String(index)}]`;
    const descriptor = Object.getOwnPropertyDescriptor(input, String(index));
    if (!isDataDescriptor(descriptor) || descriptor.enumerable !== true) {
      return refuse(
        "non_ijson_value",
        memberPath,
        memberAt,
        "array indices must be enumerable data members",
      );
    }
    const member = admitAt(descriptor.value, memberPath, memberAt);
    if (member.kind !== "ok") return member;
    admitted.push(member.value);
  }
  return ok(deepFreeze(admitted));
}

function admitAt(
  input: unknown,
  path: readonly string[],
  at: string,
): Outcome<JsonValue> {
  if (input === null || typeof input === "boolean") return ok(input);
  if (typeof input === "string") return admitScalarString(input, path, at);
  if (typeof input === "number") {
    if (!Number.isFinite(input)) {
      return refuse("non_finite_number", path, at, "non-finite numbers are not I-JSON");
    }
    if (Number.isInteger(input) && !Number.isSafeInteger(input)) {
      return refuse("unsafe_integral_number", path, at, "unsafe integral numbers are not I-JSON");
    }
    return ok(Object.is(input, -0) ? 0 : input);
  }
  if (Array.isArray(input)) return admitArray(input, path, at);
  if (typeof input !== "object" || !isJsonObject(input)) {
    return refuse("non_ijson_value", path, at, "expected an I-JSON value");
  }
  const admitted: Record<string, JsonValue> = {};
  for (const key of Reflect.ownKeys(input)) {
    if (typeof key !== "string") {
      return refuse("non_ijson_value", path, at, "symbol object members are not I-JSON");
    }
    const admittedKey = admitScalarString(key, path, `${at} key`);
    if (admittedKey.kind !== "ok") return admittedKey;
    const memberPath = [...path, key];
    const memberAt = `${at}.${key}`;
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (!isDataDescriptor(descriptor) || descriptor.enumerable !== true) {
      return refuse(
        "non_ijson_value",
        memberPath,
        memberAt,
        "object members must be enumerable data properties",
      );
    }
    const member = admitAt(descriptor.value, memberPath, memberAt);
    if (member.kind !== "ok") return member;
    defineMember(admitted, key, member.value);
  }
  return ok(deepFreeze(admitted));
}

/**
 * I-JSON value admission: returns a detached, deeply frozen `JsonValue` with
 * `-0` as `0`, or the first refusal in member order. Defects (a throwing proxy
 * trap) still throw.
 */
export function admitJson(raw: unknown): Outcome<JsonValue> {
  return admitAt(raw, [], "");
}
