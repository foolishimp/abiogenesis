// Implements: REQ-P-PUBLIC-CONTRACTS-001 through REQ-P-PUBLIC-CONTRACTS-004

import {
  admitAbgRuntimeSystemProfile,
  admitProductToolchainManifest,
  admitPublicContractCatalog,
  canonicalizeIJson,
  digestCanonicalIJson,
  publicContractCatalogDigest
} from "../public_sdk/index.js";
import type {
  AbgResolvedPolicyIdentity,
  AbgRuntimeIdentity,
  AbgRuntimeSystemProfile,
  ProductContentInventoryRow,
  ProductToolchainManifest,
  PublicContractCatalog,
  PublicContractRow,
  Sha256Digest
} from "../public_sdk/index.js";
import type {
  TenantConformanceManifest
} from "../../../shared/abg_library/tenant_conformance_manifest.js";
import {
  projectAbgTenantConformanceManifest,
  TENANT_CONFORMANCE_MANIFEST_RELATIVE_PATH
} from "../product_intake/tenant_conformance_manifest.js";
import { relativePath } from "../public_sdk/admission_primitives.js";
import {
  admitDs1StaticContractAsset,
  buildDs1PublicationFoundation,
  DS1_CAPABILITY_DEFINITION_GRAPH,
  publicContractAssetDigest,
  type Ds1NativeDeclarationInventory,
  type Ds1StaticContractAssetDefinition,
  type PublishedContractAsset
} from "./foundation.js";
import { buildPublicOperationFamilyPublication } from "./operation_publication.js";

const CATALOG_PATH = "contracts/public-contract-catalog.json";
const CATALOG_SCHEMA_ID = "abg.schema.public-contract-catalog";
const MANIFEST_PATH = "product-toolchain-manifest.json";

export interface AbgRuntimeSystemProfileInput {
  readonly runtimeIdentity: AbgRuntimeIdentity;
  readonly resolvedPolicy: AbgResolvedPolicyIdentity;
  readonly standardPluginRefs: readonly string[];
}

export interface AbgProductPublicationInput {
  readonly publisher: string;
  readonly packageVersion: string;
  readonly catalogId: string;
  readonly catalogVersion: string;
  readonly runtimeSystemProfile: AbgRuntimeSystemProfileInput;
  readonly basePayloadAssets: readonly PublishedContractAsset[];
  readonly staticContractAssets: readonly Ds1StaticContractAssetDefinition[];
  readonly nativeInventories: readonly Ds1NativeDeclarationInventory[];
}

export interface AbgProductPublication {
  readonly manifest: ProductToolchainManifest;
  readonly catalog: PublicContractCatalog;
  readonly tenantConformanceManifest: TenantConformanceManifest;
  readonly productContentInventory: readonly ProductContentInventoryRow[];
  readonly generatedAssets: readonly PublishedContractAsset[];
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function canonicalAsset(
  relativePath: string,
  value: unknown
): PublishedContractAsset {
  const bytes = new TextEncoder().encode(canonicalizeIJson(value));
  return Object.freeze({
    relativePath,
    bytes,
    digest: publicContractAssetDigest(bytes)
  });
}

function assetInventory(
  assets: readonly PublishedContractAsset[]
): readonly ProductContentInventoryRow[] {
  const paths = new Set<string>();
  const rows: ProductContentInventoryRow[] = [];
  for (const asset of assets) {
    relativePath(asset.relativePath, "product payload path");
    if (asset.relativePath === MANIFEST_PATH) {
      throw new TypeError(`${MANIFEST_PATH}: excluded from product content inventory`);
    }
    if (paths.has(asset.relativePath)) {
      throw new TypeError(`product payload: duplicate ${asset.relativePath}`);
    }
    const actualDigest = publicContractAssetDigest(asset.bytes);
    if (actualDigest !== asset.digest) {
      throw new TypeError(`product payload: stale digest for ${asset.relativePath}`);
    }
    paths.add(asset.relativePath);
    rows.push(Object.freeze({
      relativePath: asset.relativePath,
      digest: asset.digest
    }));
  }
  rows.sort((left, right) => compareText(left.relativePath, right.relativePath));
  return Object.freeze(rows);
}

function productContentDigest(
  inventory: readonly ProductContentInventoryRow[]
): Sha256Digest {
  return digestCanonicalIJson(
    inventory.map((row) => [row.relativePath, row.digest])
  );
}

function runtimeSystemProfile(
  input: AbgRuntimeSystemProfileInput
): AbgRuntimeSystemProfile {
  const basis = Object.freeze({
    kind: "abg_runtime_system_profile" as const,
    runtimeIdentity: input.runtimeIdentity,
    resolvedPolicy: input.resolvedPolicy,
    standardPluginRefs: Object.freeze(
      [...input.standardPluginRefs].sort(compareText)
    )
  });
  return admitAbgRuntimeSystemProfile({
    ...basis,
    profileDigest: digestCanonicalIJson(basis)
  });
}

function staticAssets(
  definitions: readonly Ds1StaticContractAssetDefinition[]
): readonly PublishedContractAsset[] {
  return Object.freeze(
    definitions
      .map((definition) => admitDs1StaticContractAsset(definition))
      .map((definition) => Object.freeze({
        relativePath: definition.relativePath,
        bytes: definition.bytes,
        digest: publicContractAssetDigest(definition.bytes)
      }))
      .sort((left, right) => compareText(left.relativePath, right.relativePath))
  );
}

function assertNativeInventoriesMatchPayload(input: {
  readonly inventories: readonly Ds1NativeDeclarationInventory[];
  readonly payload: readonly PublishedContractAsset[];
}): void {
  const digestByPath = new Map(
    input.payload.map((asset) => [asset.relativePath, asset.digest])
  );
  for (const inventory of input.inventories) {
    for (const row of inventory.rows) {
      const payloadDigest = digestByPath.get(row.declarationPath);
      if (payloadDigest === undefined) {
        throw new TypeError(
          `${inventory.contractId}: declaration is absent from product payload: ${row.declarationPath}`
        );
      }
      if (payloadDigest !== row.declarationDigest) {
        throw new TypeError(
          `${inventory.contractId}: declaration digest mismatch: ${row.declarationPath}`
        );
      }
    }
  }
}

export async function buildAbgProductPublication(
  input: AbgProductPublicationInput
): Promise<AbgProductPublication> {
  assertNativeInventoriesMatchPayload({
    inventories: input.nativeInventories,
    payload: input.basePayloadAssets
  });
  const foundation = buildDs1PublicationFoundation({
    staticAssets: input.staticContractAssets.filter(
      (asset) => !asset.contractId.startsWith("abg.schema.operation.")
    ),
    nativeInventories: input.nativeInventories
  });
  const operations = await buildPublicOperationFamilyPublication({
    schemaAssets: input.staticContractAssets
  });
  const rows: PublicContractRow[] = [
    ...foundation.rows,
    ...operations.rows
  ];
  rows.sort((left, right) => compareText(left.contractId, right.contractId));

  const catalogSchema = input.staticContractAssets.find(
    (asset) => asset.contractId === CATALOG_SCHEMA_ID
  );
  if (catalogSchema === undefined) {
    throw new TypeError(`static contract assets: missing ${CATALOG_SCHEMA_ID}`);
  }
  const catalogWithoutDigest: PublicContractCatalog = {
    kind: "abg_public_contract_catalog",
    schemaVersion: 1,
    catalogId: input.catalogId,
    catalogVersion: input.catalogVersion,
    catalogDigest: `sha256:${"0".repeat(64)}`,
    catalogSchemaPath: catalogSchema.relativePath,
    catalogSchemaDigest: publicContractAssetDigest(catalogSchema.bytes),
    profile: "abg-5-release",
    rows: Object.freeze(rows)
  };
  const catalog = admitPublicContractCatalog({
    ...catalogWithoutDigest,
    catalogDigest: publicContractCatalogDigest(catalogWithoutDigest)
  });
  const catalogAsset = canonicalAsset(CATALOG_PATH, catalog);
  const tenantConformanceManifest = projectAbgTenantConformanceManifest({
    manifestId: "abg.tenant-conformance.abiogenesis",
    manifestVersion: input.packageVersion,
    engineId: "abg.engine.abiogenesis",
    engineVersion: input.packageVersion,
    capabilityDefinitionGraph: DS1_CAPABILITY_DEFINITION_GRAPH,
    publicContractCatalog: catalog
  });
  const tenantConformanceManifestAsset = canonicalAsset(
    TENANT_CONFORMANCE_MANIFEST_RELATIVE_PATH,
    tenantConformanceManifest
  );
  const allPayload = [
    ...input.basePayloadAssets,
    ...staticAssets(input.staticContractAssets),
    ...foundation.generatedAssets,
    ...operations.generatedAssets,
    catalogAsset,
    tenantConformanceManifestAsset
  ];
  const inventory = assetInventory(allPayload);
  const profile = runtimeSystemProfile(input.runtimeSystemProfile);
  const productRelativeLocators = Object.freeze(
    inventory.map((row) => row.relativePath)
  );
  const manifest = admitProductToolchainManifest({
    kind: "abg_product_toolchain_manifest",
    schemaVersion: 1,
    publisher: input.publisher,
    productId: "abiogenesis",
    packageName: "@abiogenesis/typescript-tenant",
    packageVersion: input.packageVersion,
    productContentDigest: productContentDigest(inventory),
    publicContractCatalogPath: CATALOG_PATH,
    publicContractCatalogDigest: catalog.catalogDigest,
    publicContractCatalog: catalog,
    runtimeSystemProfile: profile,
    productRelativeLocators
  });
  const manifestAsset = canonicalAsset(MANIFEST_PATH, manifest);
  return Object.freeze({
    manifest,
    catalog,
    tenantConformanceManifest,
    productContentInventory: inventory,
    generatedAssets: Object.freeze([
      ...foundation.generatedAssets,
      ...operations.generatedAssets,
      catalogAsset,
      tenantConformanceManifestAsset,
      manifestAsset
    ])
  });
}
