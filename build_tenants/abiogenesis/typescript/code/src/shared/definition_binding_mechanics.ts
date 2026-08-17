import { canonicalJson, compareUnicodeCodeUnits, type JsonValue } from
  "./canonical_json.js";
import type {
  DefinitionExecutionFault,
} from "./effect_definition.js";
import { deepFreeze } from "./immutable.js";
import {
  admitRuntimeContract,
  type OwnerContractSourceDeclaration,
  type OwnerSemanticOutput,
} from "./public_function_contracts.js";
import type {
  PublicDefinitionKeyLike,
  ReferenceDigest,
} from "./public_invocation.js";

export function isRecord(
  value: unknown,
): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function hasExactKeys(
  value: Readonly<Record<string, unknown>>,
  keys: readonly string[],
): boolean {
  return Object.keys(value).sort(compareUnicodeCodeUnits).join("\0") ===
    [...keys].sort(compareUnicodeCodeUnits).join("\0");
}

export function sameJson(left: unknown, right: unknown): boolean {
  try {
    return canonicalJson(left as JsonValue) === canonicalJson(right as JsonValue);
  } catch {
    return false;
  }
}

export function sameCoordinate(
  left: ReferenceDigest,
  right: ReferenceDigest,
): boolean {
  return left.ref === right.ref && left.digest === right.digest;
}

export function reference<T = unknown>(
  ref: string,
  digest: ReferenceDigest["digest"],
): ReferenceDigest<T> {
  return deepFreeze({ ref, digest });
}

export function definitionFault<K extends PublicDefinitionKeyLike>(
  definitionKey: K,
  stage: string,
  code: string,
  message: string,
): DefinitionExecutionFault<K> {
  return deepFreeze({
    kind: "definition_execution_fault" as const,
    schemaVersion: "5.0.0" as const,
    definitionKey,
    stage,
    code,
    message,
    evidence: {},
  });
}

export function isDefinitionFault(
  value: unknown,
): value is DefinitionExecutionFault {
  return isRecord(value) && value.kind === "definition_execution_fault";
}

export function validatedOwnerOutput<
  TPacket extends OwnerContractSourceDeclaration,
>(
  packet: TPacket,
  output: OwnerSemanticOutput<TPacket>,
  ownerLabel: string,
): OwnerSemanticOutput<TPacket> {
  const schema = output.outcomeKind === "result"
    ? packet.resultSchema
    : output.outcomeKind === "refusal"
    ? packet.refusalSchema
    : packet.nonTerminalSchema;
  if (
    schema === null ||
    admitRuntimeContract(schema, output.value).disposition !== "admitted"
  ) {
    throw new TypeError(`${ownerLabel} output differs from its exact contract`);
  }
  return output;
}
