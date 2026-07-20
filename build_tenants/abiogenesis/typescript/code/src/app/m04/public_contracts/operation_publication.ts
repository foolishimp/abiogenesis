// Implements: REQ-P-PUBLIC-CONTRACTS-008 through REQ-P-PUBLIC-CONTRACTS-010

import {
  admitPublicContractRow,
  admitPublishedPublicOperationDefinitionMember,
  publishedPublicOperationDefinitionDigest,
  publishedPublicOperationFamilyDigest
} from "../public_sdk/carrier_admission.js";
import {
  admitIJsonValue,
  canonicalizeIJson,
} from "../public_sdk/canonical.js";
import type {
  PublishedPublicOperationContractMetadata,
  PublishedPublicOperationDefinitionMember,
  PublishedPublicOperationSchemaCoordinate,
  PublicContractRow
} from "../public_sdk/carriers.js";
import {
  publicContractAssetDigest,
  type Ds1StaticContractAssetDefinition,
  type PublishedContractAsset
} from "./foundation.js";
import { buildPrivatePublicOperationDefinitionFamily } from
  "./public_operation_definition_family.js";

const PACKAGE_NAME = "@abiogenesis/typescript-tenant";
const PRODUCT_ID = "abiogenesis";
const CONTRACT_VERSION = "5.0.0";
const OPERATION_DEFINITION_SCHEMA_ID = "abg.schema.public-operation-contract";
const OPERATION_DEFINITION_SCHEMA_VERSION = "1.0.0";
const OPERATION_DEFINITION_SCHEMA_PATH =
  "contracts/schemas/public-operation-contract.schema.json";

export interface PublicOperationFamilyPublication {
  readonly familyDigest: `sha256:${string}`;
  readonly rows: readonly PublicContractRow[];
  readonly generatedAssets: readonly PublishedContractAsset[];
}

export interface PublicOperationDefinitionAsset {
  readonly kind: "abg_public_operation_definition_family";
  readonly schemaVersion: 1;
  readonly operationId: string;
  readonly operationVersion: "5.0.0";
  readonly familyDigest: `sha256:${string}`;
  readonly definitions: readonly [
    PublishedPublicOperationDefinitionMember,
    ...PublishedPublicOperationDefinitionMember[]
  ];
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function nonEmptyDefinitions(
  input: readonly PublishedPublicOperationDefinitionMember[],
  label: string
): readonly [
  PublishedPublicOperationDefinitionMember,
  ...PublishedPublicOperationDefinitionMember[]
] {
  const [first, ...rest] = input;
  if (first === undefined) throw new TypeError(`${label}: expected non-empty family`);
  return Object.freeze([first, ...rest]);
}

function objectValue(input: unknown, label: string): Record<string, unknown> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new TypeError(`${label}: expected object`);
  }
  return Object.fromEntries(Object.keys(input).map((key) => [
    key,
    Object.getOwnPropertyDescriptor(input, key)?.value
  ]));
}

function textValue(input: unknown, label: string): string {
  if (typeof input !== "string" || input.length === 0) {
    throw new TypeError(`${label}: expected non-empty string`);
  }
  return input;
}

function digestValue(input: unknown, label: string): `sha256:${string}` {
  const value = textValue(input, label);
  if (!isSha256Digest(value)) {
    throw new TypeError(`${label}: expected SHA-256 digest`);
  }
  return value;
}

function isSha256Digest(input: string): input is `sha256:${string}` {
  return /^sha256:[0-9a-f]{64}$/u.test(input);
}

function privateSchemaCoordinate(input: unknown) {
  const value = objectValue(input, "private schema coordinate");
  if (
    value["contractVersion"] !== CONTRACT_VERSION ||
    value["schemaVersion"] !== CONTRACT_VERSION
  ) {
    throw new TypeError("private schema coordinate: version mismatch");
  }
  return Object.freeze({
    contractId: textValue(value["contractId"], "private schema coordinate.contractId"),
    contractVersion: CONTRACT_VERSION,
    contractDigest: digestValue(
      value["contractDigest"], "private schema coordinate.contractDigest"
    ),
    schemaId: textValue(value["schemaId"], "private schema coordinate.schemaId"),
    schemaVersion: CONTRACT_VERSION,
    schemaDigest: digestValue(
      value["schemaDigest"], "private schema coordinate.schemaDigest"
    )
  });
}

function schemaProjection(input: unknown) {
  const row = objectValue(input, "public operation schema projection");
  const key = objectValue(
    row["definitionKey"],
    "public operation schema projection.definitionKey"
  );
  const operationId = textValue(
    key["operationId"],
    "public operation schema projection.definitionKey.operationId"
  );
  const member = key["memberKind"] === "variant"
    ? textValue(
        key["variant"], "public operation schema projection.definitionKey.variant"
      )
    : key["memberKind"] === "project_read_case" &&
        operationId === "abg.operation.project.read"
      ? textValue(
          key["caseKey"], "public operation schema projection.definitionKey.caseKey"
        )
      : null;
  const slot = textValue(row["slot"], "public operation schema projection.slot");
  if (member === null || !["request", "result", "refusal", "nonterminal"].includes(slot)) {
    throw new TypeError("public operation schema projection: invalid coordinate");
  }
  return Object.freeze({
    operationId,
    member,
    slot,
    schemaCoordinate: privateSchemaCoordinate(row["schemaCoordinate"]),
    schema: admitIJsonValue(
      row["schema"],
      "public operation schema projection.schema"
    )
  });
}

function operationSlug(operationId: string): string {
  const prefix = "abg.operation.";
  if (!operationId.startsWith(prefix) || operationId.length === prefix.length) {
    throw new TypeError(`public operation family: invalid identity ${operationId}`);
  }
  return operationId.slice(prefix.length);
}

function schemaPath(input: {
  readonly operationId: string;
  readonly member: string;
  readonly slot: string;
}): string {
  if (!/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/u.test(input.member)) {
    throw new TypeError(`public operation family: invalid member ${input.member}`);
  }
  return `contracts/schemas/operations/${operationSlug(input.operationId)}/${input.member}/${input.slot}.schema.json`;
}

async function exactPrivateFamily() {
  const admitted = await buildPrivatePublicOperationDefinitionFamily();
  if (admitted.kind !== "exact_family_admitted") {
    throw new TypeError(
      `public operation family: private family is not admitted: ${canonicalizeIJson(admitted)}`
    );
  }
  return admitted;
}

export async function buildPublicOperationSchemaAssetDefinitions(): Promise<
  readonly Ds1StaticContractAssetDefinition[]
> {
  const admitted = await exactPrivateFamily();
  const assets = admitted.privateProjections.jsonSchemas.map((inputRow) => {
    const row = schemaProjection(inputRow);
    const relativePath = schemaPath({
      operationId: row.operationId,
      member: row.member,
      slot: row.slot
    });
    const bytes = new TextEncoder().encode(canonicalizeIJson(row.schema));
    const actualDigest = publicContractAssetDigest(bytes);
    if (actualDigest !== row.schemaCoordinate.schemaDigest) {
      throw new TypeError(
        `public operation family: schema digest differs for ${row.schemaCoordinate.schemaId}`
      );
    }
    return Object.freeze({
      contractId: row.schemaCoordinate.schemaId,
      relativePath,
      mediaType: "application/schema+json" as const,
      bytes
    });
  }).sort((left, right) => compareText(left.relativePath, right.relativePath));
  if (assets.length !== 196) {
    throw new TypeError("public operation family: expected exact 196 schema assets");
  }
  return Object.freeze(assets);
}

function schemaAssetMap(
  assets: readonly Ds1StaticContractAssetDefinition[]
): ReadonlyMap<string, Ds1StaticContractAssetDefinition> {
  const byId = new Map<string, Ds1StaticContractAssetDefinition>();
  for (const asset of assets) {
    if (byId.has(asset.contractId)) {
      throw new TypeError(`public operation family: duplicate schema ${asset.contractId}`);
    }
    byId.set(asset.contractId, asset);
  }
  return byId;
}

function definitionMember(input: unknown): Readonly<{
  operationId: string;
  member: string;
}> {
  const key = objectValue(input, "public operation definition key");
  const operationId = textValue(
    key["operationId"],
    "public operation definition key.operationId"
  );
  if (key["memberKind"] === "variant") {
    return Object.freeze({
      operationId,
      member: textValue(
        key["variant"],
        "public operation definition key.variant"
      )
    });
  }
  if (
    key["memberKind"] === "project_read_case" &&
    operationId === "abg.operation.project.read"
  ) {
    return Object.freeze({
      operationId,
      member: textValue(
        key["caseKey"],
        "public operation definition key.caseKey"
      )
    });
  }
  throw new TypeError("public operation definition key: invalid member");
}

function projectedPublishedSchemaCoordinate(input: {
  readonly raw: {
    readonly contractId: string;
    readonly contractVersion: string;
    readonly contractDigest: `sha256:${string}`;
    readonly schemaId: string;
    readonly schemaVersion: string;
    readonly schemaDigest: `sha256:${string}`;
  };
  readonly operationId: string;
  readonly member: string;
  readonly slot: "request" | "result" | "refusal" | "nonterminal";
}): PublishedPublicOperationSchemaCoordinate {
  if (
    input.raw.contractVersion !== CONTRACT_VERSION ||
    input.raw.schemaVersion !== CONTRACT_VERSION ||
    input.raw.contractDigest !== input.raw.schemaDigest ||
    !isSha256Digest(input.raw.schemaDigest)
  ) {
    throw new TypeError(
      `public operation family: divergent schema ${input.raw.schemaId}`
    );
  }
  return Object.freeze({
    contractId: input.raw.contractId,
    contractVersion: CONTRACT_VERSION,
    contractDigest: input.raw.contractDigest,
    schemaId: input.raw.schemaId,
    schemaVersion: CONTRACT_VERSION,
    schemaDigest: input.raw.schemaDigest,
    assetLocator: Object.freeze({
      kind: "asset" as const,
      relativePath: schemaPath({
        operationId: input.operationId,
        member: input.member,
        slot: input.slot
      }),
      schemaId: input.raw.schemaId,
      schemaVersion: CONTRACT_VERSION,
      mediaType: "application/schema+json",
      digest: input.raw.schemaDigest
    })
  });
}

/** @internal */
export function projectPublishedPublicOperationDefinitionFromPrivate(
  input: unknown
): PublishedPublicOperationDefinitionMember {
  const definition = objectValue(input, "public operation definition");
  const key = definitionMember(definition["definitionKey"]);
  const schemaCoordinates = objectValue(
    definition["schemaCoordinates"],
    "public operation definition.schemaCoordinates"
  );
  const nonterminal = schemaCoordinates["nonterminal"];
  const basis = {
    definitionKey: definition["definitionKey"],
    version: definition["version"],
    semanticAuthorityRef: definition["semanticAuthorityRef"],
    semanticAuthorityDigest: definition["semanticAuthorityDigest"],
    authorityClass: definition["authorityClass"],
    effectClass: definition["effectClass"],
    eventAdmission: definition["eventAdmission"],
    authoritySlotRequirements: definition["authoritySlotRequirements"],
    capabilityRefs: definition["capabilityRefs"],
    workspaceBindingRequirement: definition["workspaceBindingRequirement"],
    defaults: definition["defaults"],
    schemaCoordinates: Object.freeze({
      request: projectedPublishedSchemaCoordinate({
        raw: privateSchemaCoordinate(schemaCoordinates["request"]),
        ...key,
        slot: "request"
      }),
      result: projectedPublishedSchemaCoordinate({
        raw: privateSchemaCoordinate(schemaCoordinates["result"]),
        ...key,
        slot: "result"
      }),
      refusal: projectedPublishedSchemaCoordinate({
        raw: privateSchemaCoordinate(schemaCoordinates["refusal"]),
        ...key,
        slot: "refusal"
      }),
      nonterminal: nonterminal === null
        ? null
        : projectedPublishedSchemaCoordinate({
            raw: privateSchemaCoordinate(nonterminal),
            ...key,
            slot: "nonterminal"
          })
    }),
    sdkCoordinate: definition["sdkCoordinate"],
    cliCoordinate: definition["cliCoordinate"],
    adapterExitMap: definition["adapterExitMap"]
  };
  return admitPublishedPublicOperationDefinitionMember({
    ...basis,
    definitionDigest: publishedPublicOperationDefinitionDigest(basis)
  }, "public operation definition");
}

function publishDefinition(input: {
  readonly definition: unknown;
  readonly assets: ReadonlyMap<string, Ds1StaticContractAssetDefinition>;
}): PublishedPublicOperationDefinitionMember {
  const published = projectPublishedPublicOperationDefinitionFromPrivate(
    input.definition
  );
  for (const coordinate of Object.values(published.schemaCoordinates)) {
    if (coordinate === null) continue;
    const asset = input.assets.get(coordinate.schemaId);
    if (
      asset === undefined ||
      asset.relativePath !== coordinate.assetLocator.relativePath ||
      publicContractAssetDigest(asset.bytes) !== coordinate.schemaDigest
    ) {
      throw new TypeError(
        `public operation family: missing schema ${coordinate.schemaId}`
      );
    }
  }
  return published;
}

function operationAsset(input: {
  readonly operationId: string;
  readonly familyDigest: `sha256:${string}`;
  readonly definitions: PublicOperationDefinitionAsset["definitions"];
}): PublishedContractAsset {
  const definition: PublicOperationDefinitionAsset = Object.freeze({
    kind: "abg_public_operation_definition_family",
    schemaVersion: 1,
    operationId: input.operationId,
    operationVersion: CONTRACT_VERSION,
    familyDigest: input.familyDigest,
    definitions: input.definitions
  });
  const bytes = new TextEncoder().encode(canonicalizeIJson(definition));
  return Object.freeze({
    relativePath: `contracts/operations/${operationSlug(input.operationId)}.json`,
    bytes,
    digest: publicContractAssetDigest(bytes)
  });
}

export async function buildPublicOperationFamilyPublication(input: {
  readonly schemaAssets: readonly Ds1StaticContractAssetDefinition[];
}): Promise<PublicOperationFamilyPublication> {
  const admitted = await exactPrivateFamily();
  const assets = schemaAssetMap(input.schemaAssets);
  const operationDefinitionSchema = assets.get(OPERATION_DEFINITION_SCHEMA_ID);
  if (
    operationDefinitionSchema === undefined ||
    operationDefinitionSchema.relativePath !== OPERATION_DEFINITION_SCHEMA_PATH
  ) {
    throw new TypeError(
      `public operation family: missing ${OPERATION_DEFINITION_SCHEMA_ID}`
    );
  }
  const rows: PublicContractRow[] = [];
  const generatedAssets: PublishedContractAsset[] = [];
  const publishedCandidates = admitted.privateProjections.candidateCatalogRows.map(
    (candidate) => Object.freeze({
      operationId: candidate.operationId,
      definitions: nonEmptyDefinitions(
      candidate.definitions.map((definition) => publishDefinition({ definition, assets })),
      `public operation family.${candidate.operationId}`
      )
    })
  );
  const familyDigest = publishedPublicOperationFamilyDigest(publishedCandidates);
  for (const candidate of publishedCandidates) {
    const { definitions } = candidate;
    const asset = operationAsset({
      operationId: candidate.operationId,
      familyDigest,
      definitions
    });
    const metadata: PublishedPublicOperationContractMetadata = Object.freeze({
      kind: "abg_public_operation_definition_family",
      operationId: candidate.operationId,
      operationVersion: CONTRACT_VERSION,
      operationDigest: asset.digest,
      familyDigest,
      definitions
    });
    const capabilityRefs = Object.freeze(
      [...new Set(definitions.flatMap((definition) => definition.capabilityRefs))]
        .sort(compareText)
    );
    generatedAssets.push(asset);
    rows.push(admitPublicContractRow({
      contractId: candidate.operationId,
      contractKind: "operation",
      owningProductId: PRODUCT_ID,
      version: CONTRACT_VERSION,
      digest: asset.digest,
      authorityRefs: [
        "specification/requirements/product/REQ-P-POLICY.md",
        "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md",
        "build_tenants/abiogenesis/typescript/design/M04_PUBLIC_OPERATION_DEFINITION_FAMILY_BEHAVIOR_DESIGN.md"
      ],
      capabilityRefs,
      nativeLocator: {
        kind: "native",
        packageName: PACKAGE_NAME,
        packageExport: `${PACKAGE_NAME}/app/m04`,
        symbols: [
          "PublishedPublicOperationContractMetadata",
          "PublishedPublicOperationDefinitionMember"
        ]
      },
      assetLocator: {
        kind: "asset",
        relativePath: asset.relativePath,
        schemaId: OPERATION_DEFINITION_SCHEMA_ID,
        schemaVersion: OPERATION_DEFINITION_SCHEMA_VERSION,
        mediaType: "application/json",
        digest: asset.digest
      },
      operationContract: metadata
    }));
  }
  rows.sort((left, right) => compareText(left.contractId, right.contractId));
  generatedAssets.sort((left, right) =>
    compareText(left.relativePath, right.relativePath)
  );
  if (
    rows.length !== 19 ||
    rows.reduce(
      (count, row) => count + (
        row.operationContract?.kind === "abg_public_operation_definition_family"
          ? row.operationContract.definitions.length
          : 0
      ),
      0
    ) !== 62
  ) {
    throw new TypeError("public operation family: exact 19/62 parity failed");
  }
  return Object.freeze({
    familyDigest,
    rows: Object.freeze(rows),
    generatedAssets: Object.freeze(generatedAssets)
  });
}
