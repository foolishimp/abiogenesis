// Validates: T-223 deterministic exact release publication.
// Validates: REQ-P-PUBLIC-CONTRACTS-001..006A,008..011

import assert from "node:assert/strict";
import test from "node:test";
import { TextDecoder } from "node:util";

import {
  DS1_CAPABILITY_CONTRACT_REGISTER,
  DS1_NATIVE_CONTRACT_REGISTER,
  buildAbgProductPublication,
  publicContractAssetDigest
} from "../../build/semantic/code/src/app/m04/public_contracts/index.js";
import {
  prepareAbgProductPublication
} from "../tools/publish_abg_product_contracts.mjs";

function operationRows(publication) {
  return publication.catalog.rows.filter((row) => row.contractKind === "operation");
}

function staticAssets(prepared) {
  const vocabulary = prepared.outputs.find(
    (row) => row.relativePath === "contracts/vocabularies/runtime-event-kind.json"
  );
  assert.ok(vocabulary);
  return [
    ...prepared.schemaAssets,
    {
      contractId: "abg.vocabulary.runtime-event-kind",
      relativePath: vocabulary.relativePath,
      mediaType: "application/json",
      bytes: vocabulary.bytes
    }
  ];
}

test("T-223 publisher produces one deterministic exact 5.0 release catalog", async () => {
  const first = await prepareAbgProductPublication();
  const second = await prepareAbgProductPublication();
  const publication = first.publication;

  assert.equal(publication.catalog.profile, "abg-5-release");
  assert.equal(operationRows(publication).length, 19);
  assert.equal(
    publication.catalog.rows.filter((row) => row.contractKind === "capability").length,
    DS1_CAPABILITY_CONTRACT_REGISTER.length
  );
  assert.equal(
    publication.catalog.rows.filter((row) => row.contractKind === "native_contract").length,
    DS1_NATIVE_CONTRACT_REGISTER.length
  );
  assert.equal(publication.catalog.catalogDigest, second.publication.catalog.catalogDigest);
  assert.equal(
    publication.manifest.productContentDigest,
    second.publication.manifest.productContentDigest
  );
  assert.equal(
    publication.productContentInventory.some(
      (row) => row.relativePath === "product-toolchain-manifest.json"
    ),
    false
  );

  const payloadPaths = new Set(
    publication.productContentInventory.map((row) => row.relativePath)
  );
  assert.equal(payloadPaths.has("contracts/public-contract-catalog.json"), true);
  assert.equal(
    payloadPaths.has("contracts/tenant-conformance-manifest.json"),
    true
  );
  let definitionCount = 0;
  let schemaCount = 0;
  let absentNonterminalCount = 0;
  for (const row of operationRows(publication)) {
    assert.equal(row.operationContract.kind, "abg_public_operation_definition_family");
    assert.equal(row.operationContract.operationVersion, "5.0.0");
    assert.equal(row.operationContract.operationDigest, row.digest);
    assert.equal(row.assetLocator.digest, row.digest);
    definitionCount += row.operationContract.definitions.length;
    for (const definition of row.operationContract.definitions) {
      for (const coordinate of Object.values(definition.schemaCoordinates)) {
        if (coordinate === null) {
          absentNonterminalCount += 1;
        } else {
          schemaCount += 1;
          assert.equal(payloadPaths.has(coordinate.assetLocator.relativePath), true);
        }
      }
    }
  }
  assert.deepEqual(
    { definitionCount, schemaCount, absentNonterminalCount },
    { definitionCount: 62, schemaCount: 196, absentNonterminalCount: 52 }
  );

  const invoke = operationRows(publication).find(
    (row) => row.contractId === "abg.operation.run.invoke"
  );
  assert.ok(invoke);
  const operationAsset = publication.generatedAssets.find(
    (entry) => entry.relativePath === "contracts/operations/run.invoke.json"
  );
  assert.ok(operationAsset);
  const operationDefinition = JSON.parse(
    new TextDecoder().decode(operationAsset.bytes)
  );
  assert.equal(operationDefinition.familyDigest, invoke.operationContract.familyDigest);
  assert.equal(publicContractAssetDigest(operationAsset.bytes), invoke.digest);
});

test("T-223 publisher refuses missing operation schema and stale native digest", async () => {
  const prepared = await prepareAbgProductPublication();
  const preparedStaticAssets = staticAssets(prepared);
  const missingRequest = "abg.schema.operation.run.invoke.invoke.request";
  await assert.rejects(
    () => buildAbgProductPublication({
      publisher: "abiogenesis",
      packageVersion: prepared.packageManifest.version,
      catalogId: "abg.public-contracts.release",
      catalogVersion: prepared.packageManifest.version,
      runtimeSystemProfile: prepared.publication.manifest.runtimeSystemProfile,
      basePayloadAssets: prepared.basePayloadAssets,
      staticContractAssets: preparedStaticAssets.filter(
        (row) => row.contractId !== missingRequest
      ),
      nativeInventories: prepared.nativeInventories
    }),
    new RegExp(`missing schema ${missingRequest.replaceAll(".", "\\.")}`, "u")
  );

  const [firstInventory, ...remainingInventories] = prepared.nativeInventories;
  assert.ok(firstInventory);
  const [firstRow, ...remainingRows] = firstInventory.rows;
  assert.ok(firstRow);
  await assert.rejects(
    () => buildAbgProductPublication({
      publisher: "abiogenesis",
      packageVersion: prepared.packageManifest.version,
      catalogId: "abg.public-contracts.release",
      catalogVersion: prepared.packageManifest.version,
      runtimeSystemProfile: prepared.publication.manifest.runtimeSystemProfile,
      basePayloadAssets: prepared.basePayloadAssets,
      staticContractAssets: preparedStaticAssets,
      nativeInventories: [{
        ...firstInventory,
        rows: [{ ...firstRow, declarationDigest: `sha256:${"f".repeat(64)}` }, ...remainingRows]
      }, ...remainingInventories]
    }),
    /declaration digest mismatch/u
  );
});
