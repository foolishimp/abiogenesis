import { canonicalJson, compareUnicodeCodeUnits, type JsonValue } from
  "./canonical_json.js";
import type {
  DefinitionExecutionFault,
} from "./effect_definition.js";
import { deepFreeze } from "./immutable.js";
import {
  admitRuntimeContract,
  PUBLIC_AUTHORITY_SLOTS,
  type PublicAuthoritySlot,
  type PublicAuthoritySlotRequirement,
  type OwnerContractSourceDeclaration,
  type OwnerSemanticOutput,
} from "./public_function_contracts.js";
import {
  PUBLIC_FUNCTION_DEFINITION_FAMILY,
  PUBLIC_OPERATION_CONTRACT_PROJECTIONS,
  type IntrinsicPublicFunctionDefinition,
} from "./public_function_family.js";
import { PUBLIC_PROJECTION_PAYLOADS } from "./public_function_projections.js";
import { sha256Canonical } from "./digests.js";
import type {
  AdmittedPublicInvocation,
  PublicDefinitionKeyLike,
  PublicContractCoordinate,
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

function selectedDefinition(
  packet: OwnerContractSourceDeclaration,
): IntrinsicPublicFunctionDefinition | null {
  const matches = PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.filter(
    (definition) => sameJson(definition.definitionKey, packet.definitionKey),
  );
  return matches.length === 1 ? matches[0]! : null;
}

function valueAtPath(value: unknown, path: readonly string[]): unknown {
  return path.reduce<unknown>(
    (selected, part) => isRecord(selected) ? selected[part] : undefined,
    value,
  );
}

function requiredSlot(
  requirement: PublicAuthoritySlotRequirement,
  request: unknown,
): PublicAuthoritySlot | null {
  if (typeof requirement === "string") return requirement;
  const selected = valueAtPath(request, requirement.requiredWhen.requestPath);
  return requirement.requiredWhen.equalsAny.some((value) =>
      sameJson(selected, value)
    )
    ? requirement.slot
    : null;
}

function exactContractCoordinate(
  value: unknown,
  expected: PublicContractCoordinate,
): boolean {
  return sameJson(value, expected);
}

function expectedContractCoordinates(
  invocation: AdmittedPublicInvocation<
    PublicDefinitionKeyLike,
    Readonly<Record<string, JsonValue>>
  >,
  definition: IntrinsicPublicFunctionDefinition,
): Readonly<{
  request: PublicContractCoordinate;
  result: PublicContractCoordinate;
  refusal: PublicContractCoordinate;
  nonTerminal: PublicContractCoordinate | null;
}> | null {
  const projection = PUBLIC_OPERATION_CONTRACT_PROJECTIONS.find((candidate) =>
    candidate.operationId === definition.definitionKey.operationId
  );
  const asset = PUBLIC_PROJECTION_PAYLOADS.operationContractAssets.find(
    (candidate) =>
      candidate.operationId === definition.definitionKey.operationId,
  );
  const member = projection?.definitions.find((candidate) =>
    sameJson(candidate.definitionKey, definition.definitionKey)
  );
  if (projection === undefined || asset === undefined || member === undefined) {
    return null;
  }
  const coordinate = (
    slot: "request" | "result" | "refusal" | "non_terminal",
    definitionRef: string,
  ): PublicContractCoordinate => deepFreeze({
    contractCatalog: invocation.contractCatalog,
    flatRow: {
      contractId: definition.definitionKey.operationId,
      contractVersion: "5.0.0" as const,
      contractDigest: asset.contentDigest,
    },
    nestedSelector: {
      selectorKind: "operation_definition_slot" as const,
      definitionKey: definition.definitionKey,
      slot,
      definitionRef,
    },
  });
  return deepFreeze({
    request: coordinate("request", member.requestContract.definitionRef),
    result: coordinate("result", member.resultContract.definitionRef),
    refusal: coordinate("refusal", member.refusalContract.definitionRef),
    nonTerminal: member.nonTerminalContract === null
      ? null
      : coordinate(
        "non_terminal",
        member.nonTerminalContract.definitionRef,
      ),
  });
}

/** Revalidates the complete admitted call identity at a definition boundary. */
export function exactDefinitionCallMatches(
  call: Readonly<{ readonly invocation: unknown }>,
  packet: OwnerContractSourceDeclaration,
): boolean {
  if (!isRecord(call.invocation)) return false;
  const invocation = call.invocation as unknown as AdmittedPublicInvocation<
    PublicDefinitionKeyLike,
    Readonly<Record<string, JsonValue>>
  >;
  const definition = selectedDefinition(packet);
  if (
    definition === null ||
    !hasExactKeys(invocation as unknown as Readonly<Record<string, unknown>>, [
      "contractCatalog",
      "correlationRef",
      "definitionDigest",
      "definitionKey",
      "definitionRef",
      "definitionVersion",
      "eventTime",
      "expectedNonTerminalContract",
      "expectedRefusalContract",
      "expectedResultContract",
      "invocationAuthority",
      "invocationContract",
      "invocationDigest",
      "invocationRef",
      "kind",
      "provenanceRefs",
      "request",
      "requestContract",
      "requestDigest",
      "requestRef",
      "schemaVersion",
    ]) ||
    invocation.kind !== "public_invocation" ||
    invocation.schemaVersion !== "5.0.0" ||
    invocation.definitionVersion !== "5.0.0" ||
    invocation.definitionRef !== definition.definitionRef ||
    invocation.definitionDigest !== definition.definitionDigest ||
    !sameJson(invocation.definitionKey, definition.definitionKey) ||
    invocation.requestDigest !== sha256Canonical(invocation.request) ||
    admitRuntimeContract(packet.requestSchema, invocation.request).disposition !==
      "admitted" ||
    !isRecord(invocation.invocationAuthority) ||
    !hasExactKeys(invocation.invocationAuthority, [
      "authorityDigest",
      "definitionKey",
      "kind",
      "slots",
    ]) ||
    invocation.invocationAuthority.kind !== "invocation_authority" ||
    !sameJson(
      invocation.invocationAuthority.definitionKey,
      definition.definitionKey,
    ) ||
    !isRecord(invocation.invocationAuthority.slots) ||
    !hasExactKeys(
      invocation.invocationAuthority.slots,
      PUBLIC_AUTHORITY_SLOTS,
    ) ||
    invocation.invocationAuthority.authorityDigest !==
      sha256Canonical(
        invocation.invocationAuthority.slots as unknown as JsonValue,
      ) ||
    invocation.invocationDigest !== sha256Canonical({
      definitionKey: definition.definitionKey,
      definitionDigest: definition.definitionDigest,
      invocationRef: invocation.invocationRef,
      requestDigest: invocation.requestDigest,
      authorityDigest: invocation.invocationAuthority.authorityDigest,
    } as unknown as JsonValue)
  ) return false;

  const operationProjection = PUBLIC_OPERATION_CONTRACT_PROJECTIONS.find(
    (candidate) =>
      candidate.operationId === definition.definitionKey.operationId,
  );
  const operationAsset = PUBLIC_PROJECTION_PAYLOADS.operationContractAssets.find(
    (candidate) =>
      candidate.operationId === definition.definitionKey.operationId,
  );
  const expected = expectedContractCoordinates(invocation, definition);
  const invocationContract: PublicContractCoordinate = deepFreeze({
    contractCatalog: invocation.contractCatalog,
    flatRow: {
      contractId: "abg.schema.public-operation-invocation",
      contractVersion: "5.0.0" as const,
      contractDigest: PUBLIC_PROJECTION_PAYLOADS.commonSchemaAsset.contentDigest,
    },
    nestedSelector: {
      selectorKind: "schema_definition" as const,
      definitionKey: null,
      slot: null,
      definitionRef: "#/$defs/PublicInvocation",
    },
  });
  if (
    expected === null ||
    operationProjection === undefined ||
    operationAsset === undefined ||
    !exactContractCoordinate(invocation.invocationContract, invocationContract) ||
    !exactContractCoordinate(invocation.requestContract, expected.request) ||
    !exactContractCoordinate(
      invocation.expectedResultContract,
      expected.result,
    ) ||
    !exactContractCoordinate(
      invocation.expectedRefusalContract,
      expected.refusal,
    ) ||
    !sameJson(invocation.expectedNonTerminalContract, expected.nonTerminal)
  ) return false;

  const required = new Set(
    definition.authoritySlotRequirements
      .flatMap((requirement) => {
        const slot = requiredSlot(requirement, invocation.request);
        return slot === null ? [] : [slot];
      }),
  );
  for (const slot of PUBLIC_AUTHORITY_SLOTS) {
    const value = invocation.invocationAuthority.slots[slot];
    if ((value !== null) !== required.has(slot)) return false;
  }
  const capability = invocation.invocationAuthority.slots.capability_grants;
  return isRecord(capability) &&
    sameJson(
      capability.requiredCapabilityRefs,
      definition.capabilityRefs,
    ) &&
    Array.isArray(capability.grants) &&
    capability.grants.length > 0;
}
