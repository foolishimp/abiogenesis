import {
  getNodeValue,
  parseTree,
  printParseErrorCode,
  type Node,
  type ParseError,
} from "jsonc-parser";

import type { JsonValue } from "./canonical_json.js";
import { deepFreeze } from "./immutable.js";

export type IJsonValue = JsonValue;

export interface IJsonObject {
  readonly [key: string]: IJsonValue;
}

function assertUnicodeScalarString(value: string, label: string): string {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    if (codeUnit < 0xd800 || codeUnit > 0xdfff) {
      continue;
    }
    if (codeUnit >= 0xdc00) {
      throw new TypeError(`${label}: lone low surrogate is not I-JSON`);
    }
    const next = value.charCodeAt(index + 1);
    if (!(next >= 0xdc00 && next <= 0xdfff)) {
      throw new TypeError(`${label}: lone high surrogate is not I-JSON`);
    }
    index += 1;
  }
  return value;
}

function isJsonObject(input: object): boolean {
  const prototype: unknown = Object.getPrototypeOf(input);
  return prototype === Object.prototype || prototype === null;
}

function isDataDescriptor(
  descriptor: PropertyDescriptor | undefined,
): descriptor is PropertyDescriptor & { readonly value: unknown } {
  return descriptor !== undefined &&
    Object.hasOwn(descriptor, "value") &&
    !Object.hasOwn(descriptor, "get") &&
    !Object.hasOwn(descriptor, "set");
}

function admitIJsonArray(input: unknown[], label: string): IJsonValue {
  if (Object.getPrototypeOf(input) !== Array.prototype) {
    throw new TypeError(`${label}: custom-prototype arrays are not I-JSON`);
  }

  const ownKeys = Reflect.ownKeys(input);
  if (ownKeys.some((key) => typeof key === "symbol")) {
    throw new TypeError(`${label}: symbol array members are not I-JSON`);
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
    throw new TypeError(`${label}: array length is not an ordinary data member`);
  }

  const length = lengthDescriptor.value;
  if (ownKeys.length !== length + 1) {
    throw new TypeError(
      `${label}: arrays must contain exactly dense indices and length`,
    );
  }

  const admitted: IJsonValue[] = [];
  for (let index = 0; index < length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(input, String(index));
    if (!isDataDescriptor(descriptor) || descriptor.enumerable !== true) {
      throw new TypeError(
        `${label}[${String(index)}]: array indices must be enumerable data members`,
      );
    }
    admitted.push(
      admitIJsonValue(descriptor.value, `${label}[${String(index)}]`),
    );
  }
  return deepFreeze(admitted);
}

function defineIJsonMember(
  target: Record<string, IJsonValue>,
  key: string,
  value: IJsonValue,
): void {
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: true,
    value,
    writable: true,
  });
}

export function admitIJsonValue(
  input: unknown,
  label = "IJsonValue",
): IJsonValue {
  if (input === null || typeof input === "boolean") {
    return input;
  }
  if (typeof input === "string") {
    return assertUnicodeScalarString(input, label);
  }
  if (typeof input === "number") {
    if (!Number.isFinite(input)) {
      throw new TypeError(`${label}: non-finite numbers are not I-JSON`);
    }
    if (Number.isInteger(input) && !Number.isSafeInteger(input)) {
      throw new TypeError(`${label}: unsafe integral numbers are not I-JSON`);
    }
    return Object.is(input, -0) ? 0 : input;
  }
  if (Array.isArray(input)) {
    return admitIJsonArray(input, label);
  }
  if (typeof input !== "object" || !isJsonObject(input)) {
    throw new TypeError(`${label}: expected an I-JSON value`);
  }

  const admitted: Record<string, IJsonValue> = {};
  for (const key of Reflect.ownKeys(input)) {
    if (typeof key !== "string") {
      throw new TypeError(`${label}: symbol object members are not I-JSON`);
    }
    assertUnicodeScalarString(key, `${label} key`);
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (!isDataDescriptor(descriptor) || descriptor.enumerable !== true) {
      throw new TypeError(
        `${label}.${key}: object members must be enumerable data properties`,
      );
    }
    defineIJsonMember(
      admitted,
      key,
      admitIJsonValue(descriptor.value, `${label}.${key}`),
    );
  }
  return deepFreeze(admitted);
}

function propertyName(node: Node, label: string): string {
  const value: unknown = getNodeValue(node);
  if (typeof value !== "string") {
    throw new TypeError(`${label}: invalid object property name`);
  }
  return assertUnicodeScalarString(value, label);
}

function reconstructIJsonNode(node: Node, label: string): IJsonValue {
  if (node.type === "object") {
    const seen = new Set<string>();
    const value: Record<string, IJsonValue> = {};
    for (const property of node.children ?? []) {
      const nameNode = property.children?.[0];
      const valueNode = property.children?.[1];
      if (nameNode === undefined || valueNode === undefined) {
        throw new TypeError(`${label}: malformed object property tree`);
      }
      const name = propertyName(nameNode, `${label} property`);
      if (seen.has(name)) {
        throw new TypeError(
          `${label}: duplicate object property ${JSON.stringify(name)}`,
        );
      }
      seen.add(name);
      defineIJsonMember(
        value,
        name,
        reconstructIJsonNode(valueNode, `${label}.${name}`),
      );
    }
    return deepFreeze(value);
  }
  if (node.type === "array") {
    return deepFreeze(
      (node.children ?? []).map((child, index) =>
        reconstructIJsonNode(child, `${label}[${String(index)}]`),
      ),
    );
  }
  return admitIJsonValue(getNodeValue(node), label);
}

export function admitIJsonText(
  input: string,
  label = "IJsonText",
): IJsonValue {
  const errors: ParseError[] = [];
  const root = parseTree(input, errors, {
    allowEmptyContent: false,
    allowTrailingComma: false,
    disallowComments: true,
  });
  const firstError = errors[0];
  if (root === undefined || firstError !== undefined) {
    const detail =
      firstError === undefined
        ? "empty or malformed JSON"
        : `${printParseErrorCode(firstError.error)} at offset ${String(firstError.offset)}`;
    throw new TypeError(`${label}: ${detail}`);
  }
  return reconstructIJsonNode(root, label);
}
