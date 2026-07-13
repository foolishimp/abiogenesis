// Validates: T-223 actual ABG product publication and pack preparation
// Validates: REQ-P-PUBLIC-CONTRACTS-001..011

import assert from "node:assert/strict";
import test from "node:test";

import { assertDs1ContractRoster } from "../../build/semantic/code/src/app/m04/product_intake/index.js";
import {
  DS1_BASELINE_SCHEMA_ASSET_REGISTER,
  DS1_CAPABILITY_CONTRACT_REGISTER,
  DS1_NATIVE_CONTRACT_REGISTER,
  DS1_PUBLIC_OPERATION_DEFINITION_REGISTER
} from "../../build/semantic/code/src/app/m04/public_contracts/index.js";
import {
  T223_ABG_SYSTEM_MODULE_PATH,
  checkAbgProductPublication,
  deriveNativeDeclarationInventories,
  prepareAbgProductPublication
} from "../tools/publish_abg_product_contracts.mjs";

test("T-223 publication tool derives the exact immutable npm payload", async () => {
  const prepared = await prepareAbgProductPublication();
  const repeated = await prepareAbgProductPublication();

  const expectedSchemaCount =
    DS1_BASELINE_SCHEMA_ASSET_REGISTER.length +
    DS1_PUBLIC_OPERATION_DEFINITION_REGISTER.length * 3;
  const expectedCatalogRowCount =
    DS1_NATIVE_CONTRACT_REGISTER.length +
    DS1_CAPABILITY_CONTRACT_REGISTER.length +
    DS1_PUBLIC_OPERATION_DEFINITION_REGISTER.length +
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
    assertDs1ContractRoster(prepared.publication.catalog),
    prepared.publication.catalog
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
    [T223_ABG_SYSTEM_MODULE_PATH]
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
    DS1_PUBLIC_OPERATION_DEFINITION_REGISTER.length +
    1 +
    1;
  assert.equal(payloadPaths.length, expectedPayloadCount);
  assert.deepEqual(
    prepared.publication.manifest.productRelativeLocators,
    payloadPaths
  );
  assert.equal(payloadPaths.includes("product-toolchain-manifest.json"), false);
  assert.equal(payloadPaths.includes("contracts/public-contract-catalog.json"), true);
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
