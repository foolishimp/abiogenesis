import {
  canonicalJson,
  compareUnicodeCodeUnits,
  type JsonValue,
} from "./canonical_json.js";
import {
  EXACT_OWNER_CONTRACT_KEY_SET_DIGEST,
  OWNER_CONTRACT_SOURCES,
  type ExactOwnerContractReference,
  type ExecutionBindingSpecification,
  type IntrinsicOwnerContractSlot as OwnerContractSlot,
  type OwnerNativeSchemaIdentity,
  type ResolvedOwnerContractBinding,
  type ResolvedOwnerContractSource,
} from "./owner_contract_source_set.js";
import { sha256Canonical, type Sha256Digest } from "./digests.js";
import { deepFreeze } from "./immutable.js";
import type {
  PublicAdapterExitMap,
  PublicAuthorityClass,
  PublicAuthoritySlotRequirement,
  PublicEventAdmission,
} from "./public_function_contracts.js";
import type { PublicDefinitionKeyLike } from "./public_invocation.js";

const FAMILY_REQUIREMENT_AUTHORITY_REFS = Object.freeze([
  "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-009",
  "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-010",
]);

export type IntrinsicOwnerContractSlot = OwnerContractSlot;
export interface IntrinsicOwnerContractIdentity {
  readonly definitionKey: PublicDefinitionKeyLike;
  readonly slot: IntrinsicOwnerContractSlot;
  readonly contractId: string;
  readonly contractVersion: "5.0.0";
  readonly ownerAuthorityRef: string;
  readonly ownerAuthorityDigest: Sha256Digest;
  readonly nativeSchemaIdentity: OwnerNativeSchemaIdentity;
}
export type IntrinsicExecutionBindingSpecification =
  ExecutionBindingSpecification;
export type IntrinsicOwnerNativeSchemaIdentity = OwnerNativeSchemaIdentity;

export interface IntrinsicSchemaCoordinate {
  readonly schemaId: string;
  readonly schemaVersion: "5.0.0";
  readonly definitionRef: string;
  readonly nativeExport: "PUBLIC_OPERATION_SCHEMAS";
  readonly nativeMemberPath: readonly [
    operationId: string,
    memberKey: string,
    slot: IntrinsicOwnerContractSlot,
  ];
}

export interface IntrinsicSchemaCoordinateSet {
  readonly request: IntrinsicSchemaCoordinate;
  readonly result: IntrinsicSchemaCoordinate;
  readonly refusal: IntrinsicSchemaCoordinate;
  readonly nonTerminal: IntrinsicSchemaCoordinate | null;
}

export interface IntrinsicPublicFunctionDefinition {
  readonly definitionKey: PublicDefinitionKeyLike;
  readonly definitionRef: string;
  readonly version: "5.0.0";
  readonly requestContract: ResolvedOwnerContractBinding;
  readonly resultContract: ResolvedOwnerContractBinding;
  readonly refusalContract: ResolvedOwnerContractBinding;
  readonly nonTerminalContract: ResolvedOwnerContractBinding | null;
  readonly executionBindingSpecification:
    IntrinsicExecutionBindingSpecification;
  readonly executionBindingSpecificationDigest: Sha256Digest;
  readonly semanticAuthorityRef: string;
  readonly semanticAuthorityDigest: Sha256Digest;
  readonly authorityClass: PublicAuthorityClass;
  readonly effectClass: string;
  readonly eventAdmission: PublicEventAdmission;
  readonly actorRequirement: "forbidden" | "required";
  readonly workspaceBindingRequirement: "forbidden" | "exactly_one";
  readonly authoritySlotRequirements:
    readonly PublicAuthoritySlotRequirement[];
  readonly capabilityRefs: readonly string[];
  readonly defaults: Readonly<Record<string, JsonValue>>;
  readonly closedDomains: Readonly<Record<string, readonly JsonValue[]>>;
  readonly schemaCoordinates: IntrinsicSchemaCoordinateSet;
  readonly sdkCoordinate: string;
  readonly cliCoordinate: string;
  readonly adapterExitMap: PublicAdapterExitMap;
  readonly definitionDigest: Sha256Digest;
}

export interface IntrinsicPublicFunctionFamily {
  readonly kind: "intrinsic_public_function_family";
  readonly schemaVersion: "5.0.0";
  readonly familyVersion: "5.0.0";
  readonly familyRef: string;
  readonly familyDigest: Sha256Digest;
  readonly keySetDigest: Sha256Digest;
  readonly requirementAuthorityRefs: readonly string[];
  readonly definitions: readonly IntrinsicPublicFunctionDefinition[];
}

export interface IntrinsicPublicFunctionFamilyCoordinate {
  readonly requirementAuthorityRefs: readonly string[];
  readonly familyRef: string;
  readonly familyVersion: "5.0.0";
  readonly familyDigest: Sha256Digest;
}

export interface IntrinsicProjectedDefinitionSlot {
  readonly identity: IntrinsicOwnerContractIdentity;
  readonly definitionRef: string;
}

export interface IntrinsicPublicOperationContractProjection {
  readonly rowKind: "public_operation_contract";
  readonly rowRef: string;
  readonly rowDigest: Sha256Digest;
  readonly requirementAuthorityRefs: readonly string[];
  readonly operationId: string;
  readonly operationVersion: "5.0.0";
  readonly family: IntrinsicPublicFunctionFamilyCoordinate;
  readonly definitions: readonly Readonly<{
    readonly definitionKey: PublicDefinitionKeyLike;
    readonly definitionRef: string;
    readonly definitionDigest: Sha256Digest;
    readonly requestContract: IntrinsicProjectedDefinitionSlot;
    readonly resultContract: IntrinsicProjectedDefinitionSlot;
    readonly refusalContract: IntrinsicProjectedDefinitionSlot;
    readonly nonTerminalContract: IntrinsicProjectedDefinitionSlot | null;
    readonly executionBindingSpecification:
      IntrinsicExecutionBindingSpecification;
  }>[];
  readonly invocationContractId: "abg.schema.public-operation-invocation";
  readonly outcomeContractId: "abg.schema.public-operation-outcome";
  readonly projectionRefusalContract: Readonly<{
    readonly contractId: "abg.schema.public-operation-outcome";
    readonly definitionRef: "#/$defs/OutcomeProjectionRefusal";
  }>;
  readonly authorityClassByDefinition: readonly Readonly<{
    readonly definitionKey: PublicDefinitionKeyLike;
    readonly value: PublicAuthorityClass;
  }>[];
  readonly effectClassByDefinition: readonly Readonly<{
    readonly definitionKey: PublicDefinitionKeyLike;
    readonly value: string;
  }>[];
  readonly workspaceBindingRequirementByDefinition: readonly Readonly<{
    readonly definitionKey: PublicDefinitionKeyLike;
    readonly value: "forbidden" | "exactly_one";
  }>[];
  readonly capabilityRefsByDefinition: readonly Readonly<{
    readonly definitionKey: PublicDefinitionKeyLike;
    readonly value: readonly string[];
  }>[];
  readonly adapterCoordinateByDefinition: readonly Readonly<{
    readonly definitionKey: PublicDefinitionKeyLike;
    readonly sdkCoordinate: string;
    readonly cliCoordinate: string;
    readonly adapterExitMap: PublicAdapterExitMap;
  }>[];
}

function publicDefinitionRef(
  definitionKey: PublicDefinitionKeyLike,
): string {
  const operationPath = definitionKey.operationId
    .replace(/^abg\.operation\./u, "")
    .replaceAll(".", "/");
  return `public-function://abiogenesis/${operationPath}/${definitionKey.memberKey}@5`;
}

function sameCanonical(left: unknown, right: unknown): boolean {
  return canonicalJson(left as JsonValue) === canonicalJson(right as JsonValue);
}

function contractReferenceProjection(
  binding: ResolvedOwnerContractBinding,
): ExactOwnerContractReference {
  const { schema: _schema, ...reference } = binding;
  return reference;
}

export function projectOwnerContractIdentity(
  binding: ResolvedOwnerContractBinding,
): IntrinsicOwnerContractIdentity {
  const {
    schema: _schema,
    source: _source,
    ...identity
  } = binding;
  return identity;
}

function assertSourceAgreement(source: ResolvedOwnerContractSource): void {
  const packet = source.packet;
  const bindings = source.contracts;
  const contracts = [
    ["request", packet.requestContract, bindings.request],
    ["result", packet.resultContract, bindings.result],
    ["refusal", packet.refusalContract, bindings.refusal],
    ...(packet.nonTerminalContract === null || bindings.nonTerminal === null
      ? []
      : [[
        "non_terminal",
        packet.nonTerminalContract,
        bindings.nonTerminal,
      ] as const]),
  ] as const;
  if (
    (packet.nonTerminalContract === null) !==
      (bindings.nonTerminal === null) ||
    contracts.some(([slot, contract, binding]) =>
      contract.slot !== slot ||
      !sameCanonical(contract.definitionKey, packet.definitionKey) ||
      !sameCanonical(contract, contractReferenceProjection(binding)) ||
      !sameCanonical(contract.source, packet.metadata.source) ||
      contract.ownerAuthorityRef !== source.metadata.ownerAuthorityRef ||
      contract.ownerAuthorityDigest !== source.metadata.ownerAuthorityDigest
    ) ||
    !sameCanonical(
      packet.executionBindingSpecification.definitionKey,
      packet.definitionKey,
    ) ||
    packet.executionBindingSpecification.semanticOwnerRef !==
      source.metadata.ownerAuthorityRef ||
    packet.executionBindingSpecification.callable.ownerAuthorityRef !==
      source.metadata.ownerAuthorityRef ||
    sha256Canonical(
      packet.executionBindingSpecification as unknown as JsonValue,
    ) !== packet.executionBindingSpecificationDigest
  ) {
    throw new TypeError(
      "owner contract packet identity, authority, or binding specification diverged",
    );
  }
}

function schemaCoordinate(
  definitionKey: PublicDefinitionKeyLike,
  slot: IntrinsicOwnerContractSlot,
): IntrinsicSchemaCoordinate {
  const operationSuffix = definitionKey.operationId.replace(
    /^abg\.operation\./u,
    "",
  );
  const schemaSlot = slot === "non_terminal" ? "non-terminal" : slot;
  return deepFreeze({
    schemaId: `abg.schema.operation.${operationSuffix}.${schemaSlot}`,
    schemaVersion: "5.0.0" as const,
    definitionRef:
      `#/definitions/${definitionKey.operationId}/` +
      `${definitionKey.memberKey}/${slot}`,
    nativeExport: "PUBLIC_OPERATION_SCHEMAS" as const,
    nativeMemberPath: [
      definitionKey.operationId,
      definitionKey.memberKey,
      slot,
    ] as const,
  });
}

function definitionFromSource(
  source: ResolvedOwnerContractSource,
): IntrinsicPublicFunctionDefinition {
  assertSourceAgreement(source);
  const { packet, metadata } = source;
  const schemaCoordinates = deepFreeze({
    request: schemaCoordinate(packet.definitionKey, "request"),
    result: schemaCoordinate(packet.definitionKey, "result"),
    refusal: schemaCoordinate(packet.definitionKey, "refusal"),
    nonTerminal: packet.nonTerminalContract === null
      ? null
      : schemaCoordinate(packet.definitionKey, "non_terminal"),
  });
  const definitionFields = {
    definitionKey: packet.definitionKey,
    definitionRef: publicDefinitionRef(packet.definitionKey),
    version: "5.0.0" as const,
    requestContract: source.contracts.request,
    resultContract: source.contracts.result,
    refusalContract: source.contracts.refusal,
    nonTerminalContract: source.contracts.nonTerminal,
    executionBindingSpecification: packet.executionBindingSpecification,
    executionBindingSpecificationDigest:
      packet.executionBindingSpecificationDigest,
    semanticAuthorityRef: metadata.ownerAuthorityRef,
    semanticAuthorityDigest: metadata.ownerAuthorityDigest,
    authorityClass: metadata.authorityClass,
    effectClass: metadata.effectClass,
    eventAdmission: metadata.eventAdmission,
    actorRequirement: metadata.actorRequirement,
    workspaceBindingRequirement: metadata.workspaceBindingRequirement,
    authoritySlotRequirements: metadata.authoritySlotRequirements,
    capabilityRefs: metadata.capabilityRefs,
    defaults: metadata.defaults,
    closedDomains: metadata.closedDomains,
    schemaCoordinates,
    sdkCoordinate: metadata.sdkCoordinate,
    cliCoordinate: metadata.cliCoordinate,
    adapterExitMap: metadata.adapterExitMap,
  };
  const digestProjection = deepFreeze({
    ...definitionFields,
    requestContract: projectOwnerContractIdentity(source.contracts.request),
    resultContract: projectOwnerContractIdentity(source.contracts.result),
    refusalContract: projectOwnerContractIdentity(source.contracts.refusal),
    nonTerminalContract: source.contracts.nonTerminal === null
      ? null
      : projectOwnerContractIdentity(source.contracts.nonTerminal),
  });
  return deepFreeze({
    ...definitionFields,
    definitionDigest: sha256Canonical(
      digestProjection as unknown as JsonValue,
    ),
  });
}

function familyDigestProjection(
  definitions: readonly IntrinsicPublicFunctionDefinition[],
): JsonValue {
  return {
    operations: [...new Set(
      definitions.map((definition) => definition.definitionKey.operationId),
    )].sort(compareUnicodeCodeUnits).map((operationId) => ({
      operationId,
      members: definitions
        .filter((definition) =>
          definition.definitionKey.operationId === operationId
        )
        .map((definition) => ({
          memberKey: definition.definitionKey.memberKey,
          definitionDigest: definition.definitionDigest,
        })),
    })),
  } as JsonValue;
}

function constructFamily(): IntrinsicPublicFunctionFamily {
  const definitions = OWNER_CONTRACT_SOURCES.map(definitionFromSource);
  const familyDigest = sha256Canonical(familyDigestProjection(definitions));
  return deepFreeze({
    kind: "intrinsic_public_function_family" as const,
    schemaVersion: "5.0.0" as const,
    familyVersion: "5.0.0" as const,
    familyRef:
      `public-function-family://abiogenesis/${familyDigest.slice("sha256:".length)}`,
    familyDigest,
    keySetDigest: EXACT_OWNER_CONTRACT_KEY_SET_DIGEST,
    requirementAuthorityRefs: FAMILY_REQUIREMENT_AUTHORITY_REFS,
    definitions,
  });
}

function operationPath(operationId: string): string {
  return operationId.replace(/^abg\.operation\./u, "").replaceAll(".", "/");
}

function projectedSlot(
  binding: ResolvedOwnerContractBinding,
  definitionIndex: number,
  fieldName: string,
): IntrinsicProjectedDefinitionSlot {
  return deepFreeze({
    identity: projectOwnerContractIdentity(binding),
    definitionRef: `#/definitions/${definitionIndex}/${fieldName}/identity`,
  });
}

function constructOperationProjection(
  family: IntrinsicPublicFunctionFamily,
  operationId: string,
): IntrinsicPublicOperationContractProjection {
  const operationDefinitions = family.definitions.filter((definition) =>
    definition.definitionKey.operationId === operationId
  );
  const definitions = operationDefinitions.map((definition, index) =>
    deepFreeze({
      definitionKey: definition.definitionKey,
      definitionRef: definition.definitionRef,
      definitionDigest: definition.definitionDigest,
      requestContract: projectedSlot(
        definition.requestContract,
        index,
        "requestContract",
      ),
      resultContract: projectedSlot(
        definition.resultContract,
        index,
        "resultContract",
      ),
      refusalContract: projectedSlot(
        definition.refusalContract,
        index,
        "refusalContract",
      ),
      nonTerminalContract: definition.nonTerminalContract === null
        ? null
        : projectedSlot(
          definition.nonTerminalContract,
          index,
          "nonTerminalContract",
        ),
      executionBindingSpecification:
        definition.executionBindingSpecification,
    })
  );
  const familyCoordinate = deepFreeze({
    requirementAuthorityRefs: family.requirementAuthorityRefs,
    familyRef: family.familyRef,
    familyVersion: family.familyVersion,
    familyDigest: family.familyDigest,
  });
  const body = deepFreeze({
    rowKind: "public_operation_contract" as const,
    requirementAuthorityRefs: family.requirementAuthorityRefs,
    operationId,
    operationVersion: "5.0.0" as const,
    family: familyCoordinate,
    definitions,
    invocationContractId:
      "abg.schema.public-operation-invocation" as const,
    outcomeContractId: "abg.schema.public-operation-outcome" as const,
    projectionRefusalContract: {
      contractId: "abg.schema.public-operation-outcome" as const,
      definitionRef: "#/$defs/OutcomeProjectionRefusal" as const,
    },
    authorityClassByDefinition: operationDefinitions.map((definition) => ({
      definitionKey: definition.definitionKey,
      value: definition.authorityClass,
    })),
    effectClassByDefinition: operationDefinitions.map((definition) => ({
      definitionKey: definition.definitionKey,
      value: definition.effectClass,
    })),
    workspaceBindingRequirementByDefinition: operationDefinitions.map(
      (definition) => ({
        definitionKey: definition.definitionKey,
        value: definition.workspaceBindingRequirement,
      }),
    ),
    capabilityRefsByDefinition: operationDefinitions.map((definition) => ({
      definitionKey: definition.definitionKey,
      value: definition.capabilityRefs,
    })),
    adapterCoordinateByDefinition: operationDefinitions.map((definition) => ({
      definitionKey: definition.definitionKey,
      sdkCoordinate: definition.sdkCoordinate,
      cliCoordinate: definition.cliCoordinate,
      adapterExitMap: definition.adapterExitMap,
    })),
  });
  const rowDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    ...body,
    rowRef:
      `public-operation-contract://abiogenesis/${operationPath(operationId)}/` +
      rowDigest.slice("sha256:".length),
    rowDigest,
  });
}

/** Exact intrinsic 18-operation/56-definition family closure. */
export const PUBLIC_FUNCTION_DEFINITION_FAMILY = constructFamily();

/** PFC-F07's deterministic operation projection over only the closed family. */
export function derivePublicOperationContractProjections(
  family: IntrinsicPublicFunctionFamily,
): readonly IntrinsicPublicOperationContractProjection[] {
  return deepFreeze([...new Set(family.definitions.map(
    (definition) => definition.definitionKey.operationId,
  ))].sort(compareUnicodeCodeUnits).map((operationId) =>
    constructOperationProjection(family, operationId)
  ));
}

export const PUBLIC_OPERATION_CONTRACT_PROJECTIONS =
  derivePublicOperationContractProjections(PUBLIC_FUNCTION_DEFINITION_FAMILY);
