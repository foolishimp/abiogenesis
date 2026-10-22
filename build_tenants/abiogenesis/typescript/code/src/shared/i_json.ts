import {
  getNodeValue,
  parseTree,
  printParseErrorCode,
  type Node,
  type ParseError,
} from "jsonc-parser";

import { admitJson, JSON_ADMISSION_CODES, type JsonAdmissionCode } from "./admit/json.js";
import type { JsonValue } from "./canonical_json.js";
import { deepFreeze } from "./immutable.js";
import type { Outcome } from "./refusal.js";

export type IJsonValue = JsonValue;

export type IJsonObject = {
  readonly [key: string]: IJsonValue;
};

export type IJsonAdmissionFailureCode = JsonAdmissionCode;

export class IJsonAdmissionError extends TypeError {
  constructor(
    readonly code: IJsonAdmissionFailureCode,
    message: string,
  ) {
    super(message);
    this.name = "IJsonAdmissionError";
  }
}

function refuse(
  code: IJsonAdmissionFailureCode,
  message: string,
): never {
  throw new IJsonAdmissionError(code, message);
}

/** The throwing lift over `admitJson` (D4): admit, then throw on refusal. */
function liftIJson(outcome: Outcome<JsonValue>, label: string): IJsonValue {
  if (outcome.kind === "ok") return outcome.value;
  const code = JSON_ADMISSION_CODES.find((candidate) => candidate === outcome.code);
  const { at, reason } = outcome.evidence;
  if (code === undefined || typeof at !== "string" || typeof reason !== "string") {
    throw new TypeError("admitJson returned a refusal outside its closed code set");
  }
  return refuse(code, `${label}${at}: ${reason}`);
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
  return liftIJson(admitJson(input), label);
}

function propertyName(node: Node, label: string): string {
  const value: unknown = getNodeValue(node);
  if (typeof value !== "string") {
    refuse("malformed_json", `${label}: invalid object property name`);
  }
  liftIJson(admitJson(value), label);
  return value;
}

function reconstructIJsonNode(node: Node, label: string): IJsonValue {
  if (node.type === "object") {
    const seen = new Set<string>();
    const value: Record<string, IJsonValue> = {};
    for (const property of node.children ?? []) {
      const nameNode = property.children?.[0];
      const valueNode = property.children?.[1];
      if (nameNode === undefined || valueNode === undefined) {
        refuse("malformed_json", `${label}: malformed object property tree`);
      }
      const name = propertyName(nameNode, `${label} property`);
      if (seen.has(name)) {
        refuse(
          "duplicate_object_key",
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
        reconstructIJsonNode(child, `${label}[${String(index)}]`)
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
    const detail = firstError === undefined
      ? "empty or malformed JSON"
      : `${printParseErrorCode(firstError.error)} at offset ${String(firstError.offset)}`;
    let completeRoot = false;
    let rootEnd: number | null = null;
    if (root !== undefined) {
      rootEnd = root.offset + root.length;
      try {
        JSON.parse(input.slice(root.offset, rootEnd));
        completeRoot = true;
      } catch {
        completeRoot = false;
      }
    }
    const afterCompleteRoot = completeRoot &&
      firstError !== undefined &&
      rootEnd !== null &&
      firstError.offset >= rootEnd;
    refuse(
      afterCompleteRoot
        ? "invalid_json_framing"
        : "malformed_json",
      `${label}: ${detail}`,
    );
  }
  return reconstructIJsonNode(root, label);
}
