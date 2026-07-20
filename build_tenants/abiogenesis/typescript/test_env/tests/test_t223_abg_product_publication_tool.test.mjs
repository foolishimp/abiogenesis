// Validates: T-223 actual ABG product publication and pack preparation
// Validates: REQ-P-PUBLIC-CONTRACTS-001..011

import assert from "node:assert/strict";
import test from "node:test";

import {
  assertAbgReleaseContractCatalog,
  assertProductProfileMatrix,
  publicContractCatalogDigest
} from "../../build/semantic/code/src/app/m04/product_intake/index.js";
import {
  DS1_BASELINE_SCHEMA_ASSET_REGISTER,
  DS1_CAPABILITY_CONTRACT_REGISTER,
  DS1_NATIVE_CONTRACT_REGISTER
} from "../../build/semantic/code/src/app/m04/public_contracts/index.js";
import {
  T270_ABG_SYSTEM_ONE_SURFACE_MODULE_PATH,
  T270_ABG_SYSTEM_SUNNY_MODULE_PATH,
  T223_ABG_SYSTEM_MODULE_PATH,
  checkAbgProductPublication,
  deriveNativeDeclarationInventories,
  prepareAbgDetachedCatalogPublication,
  prepareAbgProductPublication
} from "../tools/publish_abg_product_contracts.mjs";

test("T-223 publication tool derives the exact immutable npm payload", async () => {
  const prepared = await prepareAbgProductPublication();
  const repeated = await prepareAbgProductPublication();
  const operationRows = prepared.publication.catalog.rows.filter(
    (row) => row.contractKind === "operation"
  );

  const expectedSchemaCount =
    DS1_BASELINE_SCHEMA_ASSET_REGISTER.length + 196;
  const expectedCatalogRowCount =
    DS1_NATIVE_CONTRACT_REGISTER.length +
    DS1_CAPABILITY_CONTRACT_REGISTER.length +
    operationRows.length +
    DS1_BASELINE_SCHEMA_ASSET_REGISTER.length +
    1;
  assert.equal(prepared.schemaAssets.length, expectedSchemaCount);
  assert.equal(
    prepared.nativeInventories.length,
    DS1_NATIVE_CONTRACT_REGISTER.length
  );
  assert.equal(
    prepared.publication.catalog.rows.length,
    expectedCatalogRowCount
  );
  assert.equal(
    assertAbgReleaseContractCatalog(prepared.publication.catalog),
    prepared.publication.catalog
  );
  assert.equal(
    assertProductProfileMatrix(prepared.publication.manifest),
    prepared.publication.manifest
  );
  assert.equal(
    prepared.outputs.length,
    new Set(prepared.outputs.map((output) => output.relativePath)).size
  );
  assert.equal(
    prepared.publication.manifest.packageVersion,
    prepared.packageManifest.version
  );
  assert.equal(
    prepared.publication.manifest.productContentDigest,
    repeated.publication.manifest.productContentDigest
  );
  assert.equal(
    prepared.publication.catalog.catalogDigest,
    repeated.publication.catalog.catalogDigest
  );

  const basePaths = prepared.basePayloadAssets.map((asset) => asset.relativePath);
  assert.equal(basePaths.includes("README.md"), true);
  assert.equal(basePaths.includes("package.json"), true);
  assert.equal(
    basePaths.includes("config/publication-runtime-profile.json"),
    true
  );
  assert.equal(basePaths.some((entry) => entry.startsWith("build/semantic/")), true);
  assert.deepEqual(
    basePaths.filter((entry) => entry.startsWith("contracts/")),
    [
      T223_ABG_SYSTEM_MODULE_PATH,
      T270_ABG_SYSTEM_SUNNY_MODULE_PATH,
      T270_ABG_SYSTEM_ONE_SURFACE_MODULE_PATH
    ]
  );
  assert.equal(basePaths.includes("product-toolchain-manifest.json"), false);

  const payloadPaths = prepared.publication.productContentInventory.map(
    (row) => row.relativePath
  );
  const expectedPayloadCount =
    prepared.basePayloadAssets.length +
    prepared.schemaAssets.length +
    DS1_NATIVE_CONTRACT_REGISTER.length +
    DS1_CAPABILITY_CONTRACT_REGISTER.length +
    operationRows.length +
    1 +
    1 +
    1;
  assert.equal(payloadPaths.length, expectedPayloadCount);
  assert.deepEqual(
    prepared.publication.manifest.productRelativeLocators,
    payloadPaths
  );
  assert.equal(payloadPaths.includes("product-toolchain-manifest.json"), false);
  assert.equal(payloadPaths.includes("contracts/public-contract-catalog.json"), true);
  assert.equal(
    payloadPaths.includes("contracts/tenant-conformance-manifest.json"),
    true
  );
  assert.equal(payloadPaths.includes(T223_ABG_SYSTEM_MODULE_PATH), true);
  assert.equal(
    payloadPaths.includes("contracts/vocabularies/runtime-event-kind.json"),
    true
  );

  const payloadSet = new Set(basePaths);
  for (const inventory of prepared.nativeInventories) {
    assert.equal(inventory.rows.length > 0, true);
    for (const row of inventory.rows) {
      assert.equal(row.declarationPath.endsWith(".d.ts"), true);
      assert.equal(payloadSet.has(row.declarationPath), true);
    }
  }
});

test("T-223 product verification refuses legacy profile and mutated operation rows", async () => {
  const prepared = await prepareAbgProductPublication();
  const current = prepared.publication.catalog;
  const withCurrentDigest = (catalog) => {
    const basis = { ...catalog, catalogDigest: `sha256:${"0".repeat(64)}` };
    return { ...basis, catalogDigest: publicContractCatalogDigest(basis) };
  };

  const legacyProfile = withCurrentDigest({
    ...current,
    profile: "abg-5-ds1"
  });
  assert.throws(
    () => assertAbgReleaseContractCatalog(legacyProfile),
    /requires the singular abg-5-release contract profile/u
  );

  const rows = current.rows.map((row) => ({ ...row }));
  const operation = rows.find((row) => row.contractKind === "operation");
  assert.ok(operation);
  operation.contractId = "abg.operation.catalog.invoke";
  const mutatedRowCatalog = withCurrentDigest({ ...current, rows });
  assert.throws(
    () => assertAbgReleaseContractCatalog(mutatedRowCatalog),
    /operation row metadata is incomplete or incoherent/u
  );
});

test("T-223 detached catalog publication is one projection of the packed product truth", async () => {
  const prepared = await prepareAbgProductPublication();
  const distributionArtifactDigest = `sha256:${"d".repeat(64)}`;
  const sidecars = prepareAbgDetachedCatalogPublication({
    distributionArtifactDigest,
    publication: prepared
  });
  const repeated = prepareAbgDetachedCatalogPublication({
    distributionArtifactDigest,
    publication: prepared
  });
  const moduleAsset = prepared.basePayloadAssets.find(
    (asset) => asset.relativePath === T223_ABG_SYSTEM_MODULE_PATH
  );
  assert.ok(moduleAsset);

  assert.deepEqual(sidecars, repeated);
  assert.equal(
    sidecars.descriptor.productContentDigest,
    prepared.publication.manifest.productContentDigest
  );
  assert.equal(
    sidecars.descriptor.distributionArtifactDigest,
    distributionArtifactDigest
  );
  assert.equal(sidecars.contribution.artifactDigest, distributionArtifactDigest);
  assert.equal(
    sidecars.contribution.descriptorDigest,
    sidecars.descriptor.descriptorDigest
  );
  assert.equal(
    sidecars.descriptor.contributionManifestDigest,
    sidecars.contribution.contributionDigest
  );
  assert.equal(
    sidecars.contribution.rows[0]?.locator.moduleDigest,
    moduleAsset.digest
  );
  assert.equal(
    prepared.publication.manifest.productRelativeLocators.some(
      (relativePath) =>
        relativePath.endsWith("product-descriptor.json") ||
        relativePath.endsWith("contribution-manifest.json")
    ),
    false,
    "archive-bound sidecars must remain detached from their own digest basis"
  );
});

test("T-223 checked-in generated publication equals the current build", async () => {
  const prepared = await prepareAbgProductPublication();
  await checkAbgProductPublication(prepared);
});

test("T-223 native inventory refuses a declaration outside the payload census", async () => {
  const prepared = await prepareAbgProductPublication();
  const firstInventory = prepared.nativeInventories[0];
  assert.ok(firstInventory);
  const firstDeclaration = firstInventory.rows[0];
  assert.ok(firstDeclaration);
  await assert.rejects(
    deriveNativeDeclarationInventories({
      packageManifest: prepared.packageManifest,
      basePayloadAssets: prepared.basePayloadAssets.filter(
        (asset) => asset.relativePath !== firstDeclaration.declarationPath
      )
    }),
    /declaration closure is outside the payload/u
  );
});
