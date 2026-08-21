import * as v from "valibot";

import { canonicalJson, compareUnicodeCodeUnits, type JsonValue } from
  "./canonical_json.js";
import type {
  DefinitionCall,
  PreDefinitionExecutionFault,
} from "./effect_definition.js";
import { preDefinitionFault } from "./effect_definition.js";
import { deepFreeze } from "./immutable.js";
import {
  admitRuntimeContract,
  contractBoundValueSchema,
  digestSchema,
  nonblankSchema,
  nonemptyRefDigestSetSchema,
  nonemptyUniqueArray,
  publicContractCatalogCoordinateSchema,
  publicContractCoordinateSchema,
  refDigestSchema,
  rfc3339Schema,
  uniqueArray,
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
): PreDefinitionExecutionFault<K> {
  return preDefinitionFault(
    definitionKey,
    stage,
    code,
    message,
  );
}

export function validatedOwnerOutput<
  TPacket extends OwnerContractSourceDeclaration,
>(
  packet: TPacket,
  output: OwnerSemanticOutput<TPacket>,
  ownerLabel: string,
): OwnerSemanticOutput<TPacket> {
  const resultEnvelope = v.strictObject({
    outcomeKind: v.literal("result"),
    value: packet.resultSchema as v.GenericSchema,
  });
  const refusalEnvelope = v.strictObject({
    outcomeKind: v.literal("refusal"),
    value: packet.refusalSchema as v.GenericSchema,
  });
  const envelope = packet.nonTerminalSchema === null
    ? v.union([resultEnvelope, refusalEnvelope])
    : v.union([
        resultEnvelope,
        refusalEnvelope,
        v.strictObject({
          outcomeKind: v.literal("nonterminal"),
          value: packet.nonTerminalSchema as v.GenericSchema,
        }),
      ]);
  if (admitRuntimeContract(envelope, output).disposition !== "admitted") {
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

function authorityValueRuntimeSchema(
  slot: PublicAuthoritySlot,
  definition: IntrinsicPublicFunctionDefinition,
): v.GenericSchema {
  switch (slot) {
    case "product_set":
      return nonemptyRefDigestSetSchema;
    case "catalog_scope":
      return v.union([
        refDigestSchema,
        v.strictObject({
          catalog: refDigestSchema,
          view: refDigestSchema,
          allowlist: uniqueArray(nonblankSchema),
        }),
      ]);
    case "graph_function":
      return v.strictObject({
        graphFunction: refDigestSchema,
        membership: refDigestSchema,
      });
    case "input_contract":
      return contractBoundValueSchema;
    case "capability_grants":
      return v.strictObject({
        requiredCapabilityRefs: v.pipe(
          uniqueArray(nonblankSchema),
          v.check(
            (refs) => sameJson(refs, definition.capabilityRefs),
            "required_capability_refs",
          ),
        ),
        grants: nonemptyRefDigestSetSchema,
      });
    case "actor":
      return v.strictObject({
        actor: refDigestSchema,
        attribution: refDigestSchema,
      });
    case "verification_references":
      return nonemptyUniqueArray(v.strictObject({
        invocation: refDigestSchema,
        outcome: refDigestSchema,
      }));
    default:
      return refDigestSchema;
  }
}

function admittedInvocationRuntimeSchema(
  packet: OwnerContractSourceDeclaration,
  definition: IntrinsicPublicFunctionDefinition,
  request: unknown,
): v.GenericSchema {
  const required = new Set(
    definition.authoritySlotRequirements.flatMap((requirement) => {
      const slot = requiredSlot(requirement, request);
      return slot === null ? [] : [slot];
    }),
  );
  const slotSchema = (slot: PublicAuthoritySlot): v.GenericSchema =>
    required.has(slot)
      ? authorityValueRuntimeSchema(slot, definition)
      : v.null();
  const definitionKeySchema = v.strictObject({
    operationId: v.literal(definition.definitionKey.operationId),
    memberKey: v.literal(definition.definitionKey.memberKey),
  });
  return v.strictObject({
    kind: v.literal("public_invocation"),
    schemaVersion: v.literal("5.0.0"),
    invocationContract: publicContractCoordinateSchema,
    invocationRef: nonblankSchema,
    invocationDigest: digestSchema,
    definitionRef: v.literal(definition.definitionRef),
    definitionVersion: v.literal("5.0.0"),
    definitionDigest: v.literal(definition.definitionDigest),
    definitionKey: definitionKeySchema,
    contractCatalog: publicContractCatalogCoordinateSchema,
    invocationAuthority: v.strictObject({
      kind: v.literal("invocation_authority"),
      definitionKey: definitionKeySchema,
      authorityDigest: digestSchema,
      slots: v.strictObject({
        workspace_binding: slotSchema("workspace_binding"),
        product_set: slotSchema("product_set"),
        dependency_lock: slotSchema("dependency_lock"),
        catalog_scope: slotSchema("catalog_scope"),
        execution_program: slotSchema("execution_program"),
        graph_function: slotSchema("graph_function"),
        input_contract: slotSchema("input_contract"),
        session_policy: slotSchema("session_policy"),
        capability_grants: slotSchema("capability_grants"),
        actor: slotSchema("actor"),
        transport_steering: slotSchema("transport_steering"),
        verification_references: slotSchema("verification_references"),
        execution_basis: slotSchema("execution_basis"),
      }),
    }),
    requestContract: publicContractCoordinateSchema,
    requestRef: nonblankSchema,
    requestDigest: digestSchema,
    request: packet.requestSchema as v.GenericSchema,
    expectedResultContract: publicContractCoordinateSchema,
    expectedRefusalContract: publicContractCoordinateSchema,
    expectedNonTerminalContract: definition.nonTerminalContract === null
      ? v.null()
      : publicContractCoordinateSchema,
    correlationRef: nonblankSchema,
    eventTime: rfc3339Schema,
    provenanceRefs: uniqueArray(nonblankSchema),
  });
}

/** Admits and revalidates the complete call identity at a definition boundary. */
export function admitExactDefinitionCall<
  TPacket extends OwnerContractSourceDeclaration,
>(
  call: Readonly<{ readonly invocation: unknown }>,
  packet: TPacket,
): DefinitionCall<TPacket, never>["invocation"] | null {
  if (!isRecord(call.invocation)) return null;
  const rawInvocation = call.invocation as unknown as AdmittedPublicInvocation<
    PublicDefinitionKeyLike,
    Readonly<Record<string, JsonValue>>
  >;
  const definition = selectedDefinition(packet);
  if (definition === null) return null;
  const admittedRequest = admitRuntimeContract(
    packet.requestSchema,
    rawInvocation.request,
  );
  if (admittedRequest.disposition !== "admitted") return null;
  const admitted = admitRuntimeContract(
    admittedInvocationRuntimeSchema(
      packet,
      definition,
      admittedRequest.value,
    ),
    rawInvocation,
  );
  if (admitted.disposition !== "admitted") return null;
  const invocation = admitted.value as AdmittedPublicInvocation<
    PublicDefinitionKeyLike,
    Readonly<Record<string, JsonValue>>
  >;
  const {
    authorityDigest: _authorityDigest,
    ...authorityBody
  } = invocation.invocationAuthority;
  if (
    invocation.requestDigest !== sha256Canonical(invocation.request) ||
    invocation.invocationAuthority.authorityDigest !==
      sha256Canonical(authorityBody as unknown as JsonValue) ||
    (() => {
      const {
        invocationRef,
        invocationDigest,
        ...invocationBody
      } = invocation;
      const expectedDigest = sha256Canonical(
        invocationBody as unknown as JsonValue,
      );
      return invocationDigest !== expectedDigest ||
        invocationRef !==
          `invocation://abiogenesis/${expectedDigest.slice("sha256:".length)}`;
    })()
  ) return null;

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
  ) return null;
  return deepFreeze(invocation) as DefinitionCall<TPacket, never>["invocation"];
}

/** Revalidates the complete admitted call identity at a definition boundary. */
export function exactDefinitionCallMatches(
  call: Readonly<{ readonly invocation: unknown }>,
  packet: OwnerContractSourceDeclaration,
): boolean {
  return admitExactDefinitionCall(call, packet) !== null;
}
