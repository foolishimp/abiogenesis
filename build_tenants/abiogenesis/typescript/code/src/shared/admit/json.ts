import { types } from "node:util";

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
// same object. No getter runs, and a prototype or constructor that is a Proxy
// is no realm's, read nowhere.
function isRealmPrototype(prototype: object, name: "Array" | "Object"): boolean {
  const constructor = Object.getOwnPropertyDescriptor(prototype, "constructor");
  if (!isDataDescriptor(constructor) || typeof constructor.value !== "function" ||
    types.isProxy(constructor.value)) return false;
  const constructorName = Object.getOwnPropertyDescriptor(constructor.value, "name");
  const constructorPrototype = Object.getOwnPropertyDescriptor(constructor.value, "prototype");
  return isDataDescriptor(constructorName) && constructorName.value === name &&
    isDataDescriptor(constructorPrototype) && constructorPrototype.value === prototype;
}

function isRealmObjectPrototype(prototype: object | null): boolean {
  if (prototype === Object.prototype) return true;
  return prototype !== null && !types.isProxy(prototype) && Object.getPrototypeOf(prototype) === null &&
    isRealmPrototype(prototype, "Object");
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
  return prototype !== null && !types.isProxy(prototype) && Array.isArray(prototype) && isRealmPrototype(prototype, "Array") &&
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

// The nesting bound: a container more than this many containers deep (the
// root container is 1) is refused. See `admitJson`.
const NESTING_BOUND = 512;

// This realm's native error prototypes, for naming a value thrown while a
// container is inspected.
const NATIVE_ERRORS: readonly (readonly [object, string])[] = Object.freeze([
  [Error.prototype, "Error"],
  [AggregateError.prototype, "AggregateError"],
  [EvalError.prototype, "EvalError"],
  [RangeError.prototype, "RangeError"],
  [ReferenceError.prototype, "ReferenceError"],
  [SyntaxError.prototype, "SyntaxError"],
  [TypeError.prototype, "TypeError"],
  [URIError.prototype, "URIError"],
] as const);

/** @internal The class of a thrown value, read without running user code: its
 * prototype chain is walked to the nearest of this realm's native error
 * prototypes, so a subclass is named by its native ancestor. A proxy on the
 * chain is not inspected, and no member of the thrown value is read. */
export function thrownClass(thrown: unknown): string {
  let link: unknown = thrown;
  while (typeof link === "object" && link !== null && !types.isProxy(link)) {
    const prototype: unknown = Object.getPrototypeOf(link);
    const native = NATIVE_ERRORS.find(([candidate]) => candidate === prototype);
    if (native !== undefined) return native[1];
    link = prototype;
  }
  return "a value that is not a native error";
}

// A Proxy is refused before any read, so an inspection read (`Object.getPrototypeOf`,
// `Reflect.ownKeys`, `Object.getOwnPropertyDescriptor`, and the prototype reads
// of D12) meets an ordinary or engine exotic object. Two such objects can still
// throw: a module namespace throws ReferenceError for an uninitialized binding,
// and a host object with interceptors (a vm context's global over a Proxy
// sandbox, which `types.isProxy` does not see) forwards the read to the
// sandbox's trap. A throw refuses the value being inspected, at its own location.
function trapped(path: readonly string[], at: string, thrown: unknown): StructuralRefusal {
  return refuse("non_ijson_value", path, at, `inspecting the value threw ${thrownClass(thrown)}`);
}

function admitArray(
  input: unknown[],
  path: readonly string[],
  at: string,
  open: Set<object>,
): Outcome<JsonValue> {
  let length: number;
  try {
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
    length = lengthDescriptor.value;
    if (ownKeys.length !== length + 1) {
      return refuse("non_ijson_value", path, at, "arrays must contain exactly dense indices and length");
    }
  } catch (thrown) {
    return trapped(path, at, thrown);
  }
  const admitted: JsonValue[] = [];
  for (let index = 0; index < length; index += 1) {
    const memberPath = [...path, String(index)];
    const memberAt = `${at}[${String(index)}]`;
    let descriptor: PropertyDescriptor | undefined;
    try {
      descriptor = Object.getOwnPropertyDescriptor(input, String(index));
    } catch (thrown) {
      return trapped(path, at, thrown);
    }
    if (!isDataDescriptor(descriptor) || descriptor.enumerable !== true) {
      return refuse(
        "non_ijson_value",
        memberPath,
        memberAt,
        "array indices must be enumerable data members",
      );
    }
    const member = admitAt(descriptor.value, memberPath, memberAt, open);
    if (member.kind !== "ok") return member;
    admitted.push(member.value);
  }
  return ok(deepFreeze(admitted));
}

function admitRecord(
  input: object,
  path: readonly string[],
  at: string,
  open: Set<object>,
): Outcome<JsonValue> {
  let keys: (string | symbol)[];
  try {
    if (!isJsonObject(input)) {
      return refuse("non_ijson_value", path, at, "expected an I-JSON value");
    }
    keys = Reflect.ownKeys(input);
  } catch (thrown) {
    return trapped(path, at, thrown);
  }
  const admitted: Record<string, JsonValue> = {};
  for (const key of keys) {
    if (typeof key !== "string") {
      return refuse("non_ijson_value", path, at, "symbol object members are not I-JSON");
    }
    const admittedKey = admitScalarString(key, path, `${at} key`);
    if (admittedKey.kind !== "ok") return admittedKey;
    const memberPath = [...path, key];
    const memberAt = `${at}.${key}`;
    let descriptor: PropertyDescriptor | undefined;
    try {
      descriptor = Object.getOwnPropertyDescriptor(input, key);
    } catch (thrown) {
      return trapped(path, at, thrown);
    }
    if (!isDataDescriptor(descriptor) || descriptor.enumerable !== true) {
      return refuse(
        "non_ijson_value",
        memberPath,
        memberAt,
        "object members must be enumerable data properties",
      );
    }
    const member = admitAt(descriptor.value, memberPath, memberAt, open);
    if (member.kind !== "ok") return member;
    defineMember(admitted, key, member.value);
  }
  return ok(deepFreeze(admitted));
}

// `open` holds the containers on the path from the root to `input`, not every
// container seen: a container shared by two members (a DAG) is admitted at each.
function admitAt(
  input: unknown,
  path: readonly string[],
  at: string,
  open: Set<object>,
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
  if (typeof input !== "object") {
    return refuse("non_ijson_value", path, at, "expected an I-JSON value");
  }
  // Before any inspection read: no trap of a Proxy runs.
  if (types.isProxy(input)) return refuse("non_ijson_value", path, at, "a Proxy is not I-JSON");
  if (open.has(input)) {
    return refuse("non_ijson_value", path, at, "a container that encloses itself (a cycle) is not I-JSON");
  }
  if (open.size >= NESTING_BOUND) {
    return refuse(
      "non_ijson_value",
      path,
      at,
      `containers nested more than ${String(NESTING_BOUND)} deep exceed the admission bound`,
    );
  }
  open.add(input);
  try {
    // `Array.isArray` of an object that is not a Proxy reads nothing and cannot throw.
    return Array.isArray(input) ? admitArray(input, path, at, open) : admitRecord(input, path, at, open);
  } finally {
    open.delete(input);
  }
}

/**
 * I-JSON value admission: returns a detached, deeply frozen `JsonValue` with
 * `-0` as `0`, or the first refusal in member order. It returns an outcome for
 * every input of its domain and throws for none. Four refusals make it total, each
 * `non_ijson_value` at the member where it occurs: a Proxy, before any of its
 * traps runs; a container already on the path from the root (a cycle); a
 * container nested more than 512 deep (the root container is 1); and a throw
 * from an inspection read of an exotic object that is not a Proxy, naming the
 * thrown class. No getter runs. The domain excludes one class of input: a
 * host object with interceptors that forward a read to a trap (a vm context's
 * global over a Proxy sandbox) is no Proxy to `types.isProxy`, and a trap that
 * does not return holds admission with it. A container shared by two members
 * is admitted at each, so the work is the number of root-to-leaf paths. The
 * bound keeps the recursion, and the recursive writers that read an admitted value, inside
 * the stack with room for the caller: called from 2,000 frames deep in
 * `node:test` and a VM module, before the engine optimizes it, this recursion
 * overflows past 1,476 nested records and `canonicalJson` past 3,220. The
 * deepest value the test lanes admit is 17 containers, and the deepest
 * fixture value 40.
 */
export function admitJson(raw: unknown): Outcome<JsonValue> {
  return admitAt(raw, [], "", new Set());
}
