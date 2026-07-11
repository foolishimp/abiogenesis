import { createHash } from "node:crypto";
import {
  getNodeValue,
  parseTree,
  printParseErrorCode,
  type Node,
  type ParseError
} from "jsonc-parser";

export interface IJsonObject {
  readonly [key: string]: IJsonValue;
}

export type IJsonArray = readonly IJsonValue[];

export type IJsonValue =
  | null
  | boolean
  | number
  | string
  | IJsonArray
  | IJsonObject;

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

function nullPrototypeRecord(): Record<string, IJsonValue> {
  const value: Record<string, IJsonValue> = {};
  Object.setPrototypeOf(value, null);
  return value;
}

export function admitIJsonValue(
  input: unknown,
  label = "IJsonValue"
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
    return Object.is(input, -0) ? 0 : input;
  }
  if (Array.isArray(input)) {
    const admitted: IJsonValue[] = [];
    for (let index = 0; index < input.length; index += 1) {
      if (!Object.hasOwn(input, index)) {
        throw new TypeError(`${label}[${String(index)}]: sparse arrays are not I-JSON`);
      }
      admitted.push(admitIJsonValue(input[index], `${label}[${String(index)}]`));
    }
    return Object.freeze(admitted);
  }
  if (typeof input !== "object" || !isJsonObject(input)) {
    throw new TypeError(`${label}: expected an I-JSON value`);
  }

  const admitted = nullPrototypeRecord();
  for (const key of Object.keys(input)) {
    assertUnicodeScalarString(key, `${label} key`);
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor?.get !== undefined || descriptor?.set !== undefined) {
      throw new TypeError(`${label}.${key}: accessors are not I-JSON members`);
    }
    admitted[key] = admitIJsonValue(descriptor?.value, `${label}.${key}`);
  }
  return Object.freeze(admitted);
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
    const value = nullPrototypeRecord();
    for (const property of node.children ?? []) {
      const nameNode = property.children?.[0];
      const valueNode = property.children?.[1];
      if (nameNode === undefined || valueNode === undefined) {
        throw new TypeError(`${label}: malformed object property tree`);
      }
      const name = propertyName(nameNode, `${label} property`);
      if (seen.has(name)) {
        throw new TypeError(`${label}: duplicate object property ${JSON.stringify(name)}`);
      }
      seen.add(name);
      value[name] = reconstructIJsonNode(valueNode, `${label}.${name}`);
    }
    return Object.freeze(value);
  }
  if (node.type === "array") {
    return Object.freeze(
      (node.children ?? []).map((child, index) =>
        reconstructIJsonNode(child, `${label}[${String(index)}]`)
      )
    );
  }
  const value: unknown = getNodeValue(node);
  return admitIJsonValue(value, label);
}

export function admitIJsonText(
  input: string,
  label = "IJsonText"
): IJsonValue {
  const errors: ParseError[] = [];
  const root = parseTree(input, errors, {
    allowEmptyContent: false,
    allowTrailingComma: false,
    disallowComments: true
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

function isIJsonArray(value: IJsonValue): value is IJsonArray {
  return Array.isArray(value);
}

function serializeCanonical(value: IJsonValue): string {
  if (value === null) {
    return "null";
  }
  if (typeof value === "boolean" || typeof value === "number") {
    return JSON.stringify(value);
  }
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (isIJsonArray(value)) {
    return `[${value.map(serializeCanonical).join(",")}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${serializeCanonical(value[key] ?? null)}`)
    .join(",")}}`;
}

export function stableJson(input: unknown): string {
  return serializeCanonical(admitIJsonValue(input));
}

export function sha256HexForText(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

export function sha256DigestForText(content: string): `sha256:${string}` {
  return `sha256:${sha256HexForText(content)}`;
}

// D1.4 (T-209 escrow, delivered T-217 S2.2): THE canonical workspace
// file-digest law. Materialization baselines, kernel measurement, and
// hygiene observations must digest the same bytes under the same law or
// the clean/foreign_write comparison lies.
export function sha256DigestForBytes(content: Uint8Array): `sha256:${string}` {
  return `sha256:${createHash("sha256").update(content).digest("hex")}`;
}

export function stableSha256HexDigest(input: unknown): string {
  return sha256HexForText(stableJson(input));
}

export function stableSha256Digest(input: unknown): `sha256:${string}` {
  return sha256DigestForText(stableJson(input));
}

export function stableJsonEquals(left: unknown, right: unknown): boolean {
  return stableJson(left) === stableJson(right);
}

export function canonicalStringList(values: readonly string[]): readonly string[] {
  return Object.freeze([...values].sort());
}

export function deriveRegistrySessionViewRef(input: {
  readonly catalogId: string;
  readonly catalogProjectionRef: string;
  readonly allowedEntryRefs: readonly string[];
}): string {
  return `registry-session-view:${stableSha256Digest({
    catalogId: input.catalogId,
    catalogProjectionRef: input.catalogProjectionRef,
    allowedEntryRefs: canonicalStringList(input.allowedEntryRefs)
  })}`;
}
