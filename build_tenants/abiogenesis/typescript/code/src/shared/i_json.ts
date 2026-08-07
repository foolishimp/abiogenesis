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
    const admitted: IJsonValue[] = [];
    for (let index = 0; index < input.length; index += 1) {
      if (!Object.hasOwn(input, index)) {
        throw new TypeError(
          `${label}[${String(index)}]: sparse arrays are not I-JSON`,
        );
      }
      admitted.push(admitIJsonValue(input[index], `${label}[${String(index)}]`));
    }
    return deepFreeze(admitted);
  }
  if (typeof input !== "object" || !isJsonObject(input)) {
    throw new TypeError(`${label}: expected an I-JSON value`);
  }

  const admitted: Record<string, IJsonValue> = {};
  for (const key of Object.keys(input)) {
    assertUnicodeScalarString(key, `${label} key`);
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor?.get !== undefined || descriptor?.set !== undefined) {
      throw new TypeError(`${label}.${key}: accessors are not I-JSON members`);
    }
    defineIJsonMember(
      admitted,
      key,
      admitIJsonValue(descriptor?.value, `${label}.${key}`),
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
