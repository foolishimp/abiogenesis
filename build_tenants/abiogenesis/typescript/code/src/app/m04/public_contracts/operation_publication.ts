// Implements: REQ-P-PUBLIC-CONTRACTS-008 through REQ-P-PUBLIC-CONTRACTS-010

import { admitPublicContractRow } from "../public_sdk/carrier_admission.js";
import { canonicalizeIJson } from "../public_sdk/canonical.js";
import type {
  PublicContractRow,
  PublicOperationContractMetadata,
  PublicOperationId
} from "../public_sdk/carriers.js";
import {
  admitDs1StaticContractAsset,
  publicContractAssetDigest,
  type Ds1StaticContractAssetDefinition,
  type PublishedContractAsset
} from "./foundation.js";
import {
  DS1_PUBLIC_OPERATION_DEFINITION_REGISTER,
  publicOperationSlug,
  type Ds1OperationDefinition
} from "./operations.js";

const PACKAGE_NAME = "@abiogenesis/typescript-tenant";
const PRODUCT_ID = "abiogenesis";
const CONTRACT_VERSION = "1.0.0";
const OPERATION_DEFINITION_SCHEMA_ID = "abg.schema.public-operation-contract";

export interface Ds1OperationPublication {
  readonly rows: readonly PublicContractRow[];
  readonly generatedAssets: readonly PublishedContractAsset[];
}

export interface PublicOperationDefinitionAsset
  extends Omit<PublicOperationContractMetadata, "operationDigest"> {
  readonly kind: "abg_public_operation_contract";
  readonly schemaVersion: 1;
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function assetMap(
  assets: readonly Ds1StaticContractAssetDefinition[]
): ReadonlyMap<string, Ds1StaticContractAssetDefinition> {
  const byId = new Map<string, Ds1StaticContractAssetDefinition>();
  for (const rawAsset of assets) {
    const asset = admitDs1StaticContractAsset(rawAsset);
    if (byId.has(asset.contractId)) {
      throw new TypeError(`operation schema assets: duplicate ${asset.contractId}`);
    }
    byId.set(asset.contractId, asset);
  }
  return byId;
}

function requiredSchemaAsset(input: {
  readonly assets: ReadonlyMap<string, Ds1StaticContractAssetDefinition>;
  readonly schemaId: string;
  readonly schemaPath: string;
}): Ds1StaticContractAssetDefinition {
  const asset = input.assets.get(input.schemaId);
  if (asset === undefined) {
    throw new TypeError(`operation schema assets: missing ${input.schemaId}`);
  }
  if (
    asset.relativePath !== input.schemaPath ||
    asset.mediaType !== "application/schema+json"
  ) {
    throw new TypeError(`operation schema assets: locator mismatch for ${input.schemaId}`);
  }
  return asset;
}

function operationMetadataBasis(input: {
  readonly definition: Ds1OperationDefinition;
  readonly assets: ReadonlyMap<string, Ds1StaticContractAssetDefinition>;
}): Omit<PublicOperationContractMetadata, "operationDigest"> {
  const slug = publicOperationSlug(input.definition.operationId);
  const requestSchemaId = `abg.schema.operation.${slug}.request`;
  const resultSchemaId = `abg.schema.operation.${slug}.result`;
  const refusalSchemaId = `abg.schema.operation.${slug}.refusal`;
  const requestSchemaPath =
    `contracts/schemas/operations/${slug}/request.schema.json`;
  const resultSchemaPath =
    `contracts/schemas/operations/${slug}/result.schema.json`;
  const refusalSchemaPath =
    `contracts/schemas/operations/${slug}/refusal.schema.json`;
  const invocationSchemaId = "abg.schema.public-operation-invocation";
  const invocationSchemaPath =
    "contracts/schemas/public-operation-invocation.schema.json";
  const requestAsset = requiredSchemaAsset({
    assets: input.assets,
    schemaId: requestSchemaId,
    schemaPath: requestSchemaPath
  });
  const resultAsset = requiredSchemaAsset({
    assets: input.assets,
    schemaId: resultSchemaId,
    schemaPath: resultSchemaPath
  });
  const refusalAsset = requiredSchemaAsset({
    assets: input.assets,
    schemaId: refusalSchemaId,
    schemaPath: refusalSchemaPath
  });
  const invocationAsset = requiredSchemaAsset({
    assets: input.assets,
    schemaId: invocationSchemaId,
    schemaPath: invocationSchemaPath
  });
  return Object.freeze({
    operationId: input.definition.operationId,
    operationVersion: CONTRACT_VERSION,
    requestSchemaId,
    requestSchemaVersion: CONTRACT_VERSION,
    requestSchemaDigest: publicContractAssetDigest(requestAsset.bytes),
    requestSchemaPath,
    resultSchemaId,
    resultSchemaVersion: CONTRACT_VERSION,
    resultSchemaDigest: publicContractAssetDigest(resultAsset.bytes),
    resultSchemaPath,
    refusalSchemaId,
    refusalSchemaVersion: CONTRACT_VERSION,
    refusalSchemaDigest: publicContractAssetDigest(refusalAsset.bytes),
    refusalSchemaPath,
    invocationSchemaId,
    invocationSchemaVersion: CONTRACT_VERSION,
    invocationSchemaDigest: publicContractAssetDigest(invocationAsset.bytes),
    invocationSchemaPath,
    defaults: input.definition.defaults,
    closedDomains: input.definition.closedDomains,
    actorPolicy: input.definition.actorPolicy,
    authorityClass: input.definition.authorityClass,
    effectClass: input.definition.effectClass,
    eventAdmission: input.definition.eventAdmission,
    terminalDispositions: input.definition.terminalDispositions,
    nonTerminalDispositions: input.definition.nonTerminalDispositions,
    adapterExitMap: Object.freeze({
      acceptedTerminal: 0,
      refused: 1,
      invalidInvocation: 2,
      acceptedNonTerminal:
        input.definition.nonTerminalDispositions.length === 0 ? null : 3,
      adapterFailure: 70
    })
  });
}

function operationAsset(input: {
  readonly operationId: PublicOperationId;
  readonly metadata: Omit<PublicOperationContractMetadata, "operationDigest">;
}): PublishedContractAsset {
  const slug = publicOperationSlug(input.operationId);
  const definition: PublicOperationDefinitionAsset = Object.freeze({
    kind: "abg_public_operation_contract",
    schemaVersion: 1,
    ...input.metadata
  });
  const bytes = new TextEncoder().encode(canonicalizeIJson(definition));
  return Object.freeze({
    relativePath: `contracts/operations/${slug}.json`,
    bytes,
    digest: publicContractAssetDigest(bytes)
  });
}

function operationRow(input: {
  readonly definition: Ds1OperationDefinition;
  readonly metadata: Omit<PublicOperationContractMetadata, "operationDigest">;
  readonly asset: PublishedContractAsset;
}): PublicContractRow {
  const invocationSymbols =
    input.definition.operationId === "abg.operation.catalog.invoke"
      ? ["PublicOperationInvocationEnvelope", "HostInvocationDescriptor"]
      : ["PublicOperationInvocationEnvelope"];
  return admitPublicContractRow({
    contractId: input.definition.operationId,
    contractKind: "operation",
    owningProductId: PRODUCT_ID,
    version: CONTRACT_VERSION,
    digest: input.asset.digest,
    authorityRefs: [
      "specification/requirements/product/REQ-P-POLICY.md",
      "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md",
      "build_tenants/abiogenesis/typescript/design/M02_M04_INSTALLED_CATALOG_SDK_CLI_PUBLIC_OPERATION_REGISTER.md"
    ],
    capabilityRefs: input.definition.capabilityRefs,
    nativeLocator: {
      kind: "native",
      packageName: PACKAGE_NAME,
      packageExport: `${PACKAGE_NAME}/app/m04`,
      symbols: [
        input.definition.handlerSymbol,
        input.definition.requestSymbol,
        input.definition.resultSymbol,
        input.definition.refusalSymbol,
        ...invocationSymbols
      ]
    },
    assetLocator: {
      kind: "asset",
      relativePath: input.asset.relativePath,
      schemaId: OPERATION_DEFINITION_SCHEMA_ID,
      schemaVersion: CONTRACT_VERSION,
      mediaType: "application/json",
      digest: input.asset.digest
    },
    operationContract: {
      ...input.metadata,
      operationDigest: input.asset.digest
    }
  });
}

export function buildDs1OperationPublication(input: {
  readonly schemaAssets: readonly Ds1StaticContractAssetDefinition[];
}): Ds1OperationPublication {
  const assets = assetMap(input.schemaAssets);
  requiredSchemaAsset({
    assets,
    schemaId: OPERATION_DEFINITION_SCHEMA_ID,
    schemaPath: "contracts/schemas/public-operation-contract.schema.json"
  });
  const rows: PublicContractRow[] = [];
  const generatedAssets: PublishedContractAsset[] = [];
  for (const definition of DS1_PUBLIC_OPERATION_DEFINITION_REGISTER) {
    const metadata = operationMetadataBasis({ definition, assets });
    const asset = operationAsset({
      operationId: definition.operationId,
      metadata
    });
    generatedAssets.push(asset);
    rows.push(operationRow({ definition, metadata, asset }));
  }
  rows.sort((left, right) => compareText(left.contractId, right.contractId));
  generatedAssets.sort((left, right) =>
    compareText(left.relativePath, right.relativePath)
  );
  return Object.freeze({
    rows: Object.freeze(rows),
    generatedAssets: Object.freeze(generatedAssets)
  });
}
