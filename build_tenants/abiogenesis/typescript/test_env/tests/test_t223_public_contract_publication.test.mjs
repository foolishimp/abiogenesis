// Validates: T-223 DS-1 deterministic public-contract publication
// Validates: REQ-P-PUBLIC-CONTRACTS-001..006A,008..011

import assert from "node:assert/strict";
import test from "node:test";
import { TextDecoder, TextEncoder } from "node:util";

import { RUNTIME_EVENT_KIND_VALUES } from "../../build/semantic/code/src/abg/m03/index.js";
import {
  DS1_BASELINE_SCHEMA_ASSET_REGISTER,
  DS1_CAPABILITY_CONTRACT_REGISTER,
  DS1_NATIVE_CONTRACT_REGISTER,
  DS1_PUBLIC_OPERATION_DEFINITION_REGISTER,
  buildDs1ProductPublication,
  buildDs1PublicationFoundation,
  publicContractAssetDigest
} from "../../build/semantic/code/src/app/m04/public_contracts/index.js";

const encoder = new TextEncoder();

function jsonBytes(value) {
  return encoder.encode(JSON.stringify(value));
}

function asset(relativePath, bytes) {
  return Object.freeze({
    relativePath,
    bytes,
    digest: publicContractAssetDigest(bytes)
  });
}

function schemaAsset(contractId, relativePath) {
  return Object.freeze({
    contractId,
    relativePath,
    mediaType: "application/schema+json",
    bytes: jsonBytes({
      $id: contractId,
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object"
    })
  });
}

function staticContractAssets() {
  const baseline = DS1_BASELINE_SCHEMA_ASSET_REGISTER.map((row) =>
    schemaAsset(row.contractId, row.relativePath)
  );
  const operationSchemas = DS1_PUBLIC_OPERATION_DEFINITION_REGISTER.flatMap(
    (definition) => {
      const slug = definition.operationId.slice("abg.operation.".length);
      return ["request", "result", "refusal"].map((member) =>
        schemaAsset(
          `abg.schema.operation.${slug}.${member}`,
          `contracts/schemas/operations/${slug}/${member}.schema.json`
        )
      );
    }
  );
  return Object.freeze([
    ...baseline,
    ...operationSchemas,
    Object.freeze({
      contractId: "abg.vocabulary.runtime-event-kind",
      relativePath: "contracts/vocabularies/runtime-event-kind.json",
      mediaType: "application/json",
      bytes: jsonBytes({
        kind: "abg_closed_vocabulary",
        schemaVersion: 1,
        vocabularyId: "abg.vocabulary.runtime-event-kind",
        values: RUNTIME_EVENT_KIND_VALUES
      })
    })
  ]);
}

function nativePublicationInputs() {
  const payloadAssets = [];
  const nativeInventories = [];
  for (const definition of DS1_NATIVE_CONTRACT_REGISTER) {
    const slug = definition.contractId.replaceAll(".", "-");
    const relativePath = `build/semantic/contracts/${slug}.d.ts`;
    const bytes = encoder.encode(
      `export interface ${slug.replaceAll("-", "_")}Contract { readonly id: string; }\n`
    );
    const declarationAsset = asset(relativePath, bytes);
    payloadAssets.push(declarationAsset);
    nativeInventories.push(Object.freeze({
      contractId: definition.contractId,
      rows: Object.freeze([
        Object.freeze({
          packageExport: definition.packageExport,
          declarationPath: relativePath,
          declarationDigest: declarationAsset.digest
        })
      ])
    }));
  }
  return Object.freeze({
    payloadAssets: Object.freeze(payloadAssets),
    nativeInventories: Object.freeze(nativeInventories)
  });
}

function publicationInput() {
  const native = nativePublicationInputs();
  return Object.freeze({
    publisher: "abiogenesis",
    packageVersion: "5.0.0-rc.1",
    catalogId: "abg.public-contracts.ds1",
    catalogVersion: "5.0.0-rc.1",
    runtimeSystemProfile: Object.freeze({
      runtimeIdentity: Object.freeze({
        workerId: "worker:t223",
        backendId: "backend:t223",
        buildId: "build:t223",
        resolvedRuntimeRef: "runtime:t223"
      }),
      resolvedPolicy: Object.freeze({
        resolvedPolicyBundleRef: "policy:t223",
        defaultRegime: "F_D",
        dispatchRef: null,
        approvalSubjectRef: null
      }),
      standardPluginRefs: Object.freeze([])
    }),
    basePayloadAssets: native.payloadAssets,
    staticContractAssets: staticContractAssets(),
    nativeInventories: native.nativeInventories
  });
}

test("T-223 publisher produces one deterministic exact DS-1 catalog", () => {
  const input = publicationInput();
  const first = buildDs1ProductPublication(input);
  const second = buildDs1ProductPublication(input);

  assert.equal(first.catalog.profile, "abg-5-ds1");
  const expectedCounts = {
    capability: DS1_CAPABILITY_CONTRACT_REGISTER.length,
    native_contract: DS1_NATIVE_CONTRACT_REGISTER.length,
    operation: DS1_PUBLIC_OPERATION_DEFINITION_REGISTER.length,
    schema_asset: DS1_BASELINE_SCHEMA_ASSET_REGISTER.length,
    vocabulary_asset: 1
  };
  assert.equal(
    first.catalog.rows.length,
    Object.values(expectedCounts).reduce((total, count) => total + count, 0)
  );
  assert.deepEqual(
    first.catalog.rows.reduce((counts, row) => {
      counts[row.contractKind] = (counts[row.contractKind] ?? 0) + 1;
      return counts;
    }, {}),
    expectedCounts
  );
  assert.equal(first.catalog.catalogDigest, second.catalog.catalogDigest);
  assert.equal(
    first.manifest.productContentDigest,
    second.manifest.productContentDigest
  );
  assert.equal(
    first.productContentInventory.some(
      (row) => row.relativePath === "product-toolchain-manifest.json"
    ),
    false
  );
  assert.equal(
    first.productContentInventory.some(
      (row) => row.relativePath === "contracts/public-contract-catalog.json"
    ),
    true
  );
  const schemaIds = new Set(
    first.catalog.rows
      .filter((row) => row.contractKind === "schema_asset")
      .map((row) => row.contractId)
  );
  for (const row of first.catalog.rows) {
    if (row.assetLocator !== null) {
      assert.equal(
        schemaIds.has(row.assetLocator.schemaId),
        true,
        `${row.contractId} has an unlocated asset schema ${row.assetLocator.schemaId}`
      );
    }
    if (row.operationContract !== null) {
      assert.equal(
        first.productContentInventory.some(
          (entry) => entry.relativePath === row.operationContract.requestSchemaPath
        ),
        true
      );
      assert.equal(
        first.productContentInventory.some(
          (entry) => entry.relativePath === row.operationContract.resultSchemaPath
        ),
        true
      );
      assert.equal(
        first.productContentInventory.some(
          (entry) => entry.relativePath === row.operationContract.refusalSchemaPath
        ),
        true
      );
      assert.equal(
        schemaIds.has(row.operationContract.invocationSchemaId),
        true
      );
    }
  }

  const invoke = first.catalog.rows.find(
    (row) => row.contractId === "abg.operation.catalog.invoke"
  );
  assert.ok(invoke);
  assert.equal(invoke.operationContract.operationDigest, invoke.digest);
  assert.equal(invoke.assetLocator.digest, invoke.digest);
  assert.deepEqual(invoke.operationContract.nonTerminalDispositions, [
    "stopped",
    "yielded",
    "blocked",
    "human_gate_required"
  ]);
  assert.equal(invoke.operationContract.adapterExitMap.acceptedNonTerminal, 3);

  const operationAsset = first.generatedAssets.find(
    (entry) => entry.relativePath === "contracts/operations/catalog.invoke.json"
  );
  assert.ok(operationAsset);
  const operationDefinition = JSON.parse(
    new TextDecoder().decode(operationAsset.bytes)
  );
  assert.equal(Object.hasOwn(operationDefinition, "operationDigest"), false);
  assert.equal(publicContractAssetDigest(operationAsset.bytes), invoke.digest);
});

test("T-223 foundation refuses the missing operation-definition schema row", () => {
  const input = publicationInput();
  assert.throws(
    () => buildDs1PublicationFoundation({
      staticAssets: input.staticContractAssets.filter(
        (row) =>
          !row.contractId.startsWith("abg.schema.operation.") &&
          row.contractId !== "abg.schema.public-operation-contract"
      ),
      nativeInventories: input.nativeInventories
    }),
    /missing abg\.schema\.public-operation-contract/u
  );
});

test("T-223 publisher refuses a native declaration tuple digest mismatch", () => {
  const input = publicationInput();
  const firstInventory = input.nativeInventories[0];
  assert.ok(firstInventory);
  const firstRow = firstInventory.rows[0];
  assert.ok(firstRow);
  const staleInventory = Object.freeze({
    ...firstInventory,
    rows: Object.freeze([
      Object.freeze({
        ...firstRow,
        declarationDigest: `sha256:${"f".repeat(64)}`
      })
    ])
  });
  assert.throws(
    () => buildDs1ProductPublication({
      ...input,
      nativeInventories: Object.freeze([
        staleInventory,
        ...input.nativeInventories.slice(1)
      ])
    }),
    /declaration digest mismatch/u
  );
});

test("T-223 operation publication refuses a missing request schema", () => {
  const input = publicationInput();
  assert.throws(
    () => buildDs1ProductPublication({
      ...input,
      staticContractAssets: input.staticContractAssets.filter(
        (row) => row.contractId !== "abg.schema.operation.catalog.invoke.request"
      )
    }),
    /missing abg\.schema\.operation\.catalog\.invoke\.request/u
  );
});
