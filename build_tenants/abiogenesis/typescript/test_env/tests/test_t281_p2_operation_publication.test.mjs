// Validates: T-281 P2 exact public-operation family projection.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { TextDecoder, TextEncoder } from "node:util";

import Ajv from "ajv";

import {
  DS1_PUBLIC_OPERATION_IDS,
  buildPublicOperationFamilyPublication,
  buildPublicOperationSchemaAssetDefinitions,
  publicContractAssetDigest
} from "../../build/semantic/code/src/app/m04/public_contracts/index.js";
import {
  admitPublicContractCatalog,
  canonicalizeIJson,
  publicContractCatalogDigest
} from "../../build/semantic/code/src/app/m04/public_sdk/index.js";

const decoder = new TextDecoder();
const encoder = new TextEncoder();
const PACKAGE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const OPERATION_SCHEMA_PATH =
  "contracts/schemas/public-operation-contract.schema.json";

async function operationDefinitionSchemaAsset() {
  return Object.freeze({
    contractId: "abg.schema.public-operation-contract",
    relativePath: OPERATION_SCHEMA_PATH,
    mediaType: "application/schema+json",
    bytes: await readFile(path.join(PACKAGE_ROOT, OPERATION_SCHEMA_PATH))
  });
}

async function publication() {
  const schemas = await buildPublicOperationSchemaAssetDefinitions();
  return Object.freeze({
    schemas,
    publication: await buildPublicOperationFamilyPublication({
      schemaAssets: Object.freeze([await operationDefinitionSchemaAsset(), ...schemas])
    })
  });
}

async function packedOperationSchema() {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t281-p2-pack-"));
  try {
    const tarballName = execFileSync(
      "npm",
      ["pack", "--pack-destination", root, "--silent"],
      { cwd: PACKAGE_ROOT, encoding: "utf8" }
    ).trim().split(/\r?\n/u).at(-1);
    assert.ok(tarballName?.endsWith(".tgz"));
    execFileSync("tar", ["-xzf", path.join(root, tarballName), "-C", root]);
    return JSON.parse(await readFile(
      path.join(root, "package", OPERATION_SCHEMA_PATH),
      "utf8"
    ));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function withPackedM04(callback) {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t281-p2-admission-pack-"));
  try {
    const tarballName = execFileSync(
      "npm",
      ["pack", "--pack-destination", root, "--silent"],
      { cwd: PACKAGE_ROOT, encoding: "utf8" }
    ).trim().split(/\r?\n/u).at(-1);
    assert.ok(tarballName?.endsWith(".tgz"));
    const installRoot = path.join(root, "install");
    execFileSync(
      "npm",
      [
        "install",
        "--prefix",
        installRoot,
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
        path.join(root, tarballName)
      ],
      { encoding: "utf8" }
    );
    const packedM04 = await import(pathToFileURL(path.join(
      installRoot,
      "node_modules/@abiogenesis/typescript-tenant",
      "build/semantic/code/src/app/m04/index.js"
    )).href);
    return await callback(packedM04);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

function catalogFrom(rows) {
  const basis = {
    kind: "abg_public_contract_catalog",
    schemaVersion: 1,
    catalogId: "abg.public-contracts.release",
    catalogVersion: "5.0.0",
    catalogSchemaPath: "contracts/schemas/public-contract-catalog.schema.json",
    catalogSchemaDigest: `sha256:${"a".repeat(64)}`,
    profile: "abg-5-release",
    rows
  };
  const candidate = {
    ...basis,
    catalogDigest: `sha256:${"0".repeat(64)}`
  };
  return { ...candidate, catalogDigest: publicContractCatalogDigest(candidate) };
}

test("T-281 P2 publishes exact 19/62/196 family truth without legacy rows", async () => {
  const result = await publication();
  const { rows, generatedAssets, familyDigest } = result.publication;
  assert.equal(rows.length, 19);
  assert.equal(generatedAssets.length, 19);
  assert.equal(result.schemas.length, 196);
  assert.equal(
    rows.reduce((count, row) => count + row.operationContract.definitions.length, 0),
    62
  );
  assert.equal(
    rows.reduce((count, row) => count + row.operationContract.definitions.reduce(
      (memberCount, definition) => memberCount + [
        definition.schemaCoordinates.request,
        definition.schemaCoordinates.result,
        definition.schemaCoordinates.refusal,
        definition.schemaCoordinates.nonterminal
      ].filter((coordinate) => coordinate !== null).length,
      0
    ), 0),
    196
  );
  assert.equal(
    rows.reduce((count, row) => count + row.operationContract.definitions.filter(
      (definition) => definition.schemaCoordinates.nonterminal === null
    ).length, 0),
    52
  );
  assert.deepEqual(
    [...new Set(rows.map((row) => row.operationContract.familyDigest))],
    [familyDigest]
  );
  assert.equal(
    rows.filter((row) => DS1_PUBLIC_OPERATION_IDS.includes(row.contractId)).length,
    3
  );
  assert.equal(
    rows.some((row) => row.operationContract.operationVersion !== "5.0.0"),
    false
  );
  assert.doesNotThrow(() => admitPublicContractCatalog(catalogFrom(rows)));

  for (const asset of generatedAssets) {
    const value = JSON.parse(decoder.decode(asset.bytes));
    assert.equal(value.kind, "abg_public_operation_definition_family");
    assert.equal(value.familyDigest, familyDigest);
    assert.equal(canonicalizeIJson(value).includes("private_source_module"), false);
  }
});

test("T-281 P2 refuses missing schema and divergent family digest", async () => {
  const result = await publication();
  const operationSchema = await operationDefinitionSchemaAsset();
  const missingSchemaId =
    "abg.schema.operation.workspace.bind.bind.request";
  await assert.rejects(
    () => buildPublicOperationFamilyPublication({
      schemaAssets: Object.freeze([
        operationSchema,
        ...result.schemas.filter((schema) => schema.contractId !== missingSchemaId)
      ])
    }),
    new RegExp(`missing schema ${missingSchemaId.replaceAll(".", "\\.")}`, "u")
  );

  const rawRows = JSON.parse(JSON.stringify(result.publication.rows));
  rawRows[0].operationContract.familyDigest = `sha256:${"f".repeat(64)}`;
  assert.throws(
    () => admitPublicContractCatalog(catalogFrom(rawRows)),
    /operation family digest differs/u
  );
});

test("T-281 installed admission binds semantic definition and catalog digests", async () => {
  const result = await publication();
  const rows = structuredClone(result.publication.rows);
  const operationRow = rows.find(
    (row) => row.contractId === "abg.operation.workspace.open"
  );
  assert.ok(operationRow);
  const definition = operationRow.operationContract.definitions[0];
  assert.ok(definition);
  const originalDefinitionDigest = definition.definitionDigest;
  definition.eventAdmission = "owning_semantic_authority";
  assert.equal(definition.definitionDigest, originalDefinitionDigest);

  const operationAsset = {
    kind: "abg_public_operation_definition_family",
    schemaVersion: 1,
    operationId: operationRow.operationContract.operationId,
    operationVersion: operationRow.operationContract.operationVersion,
    familyDigest: operationRow.operationContract.familyDigest,
    definitions: operationRow.operationContract.definitions
  };
  const operationDigest = publicContractAssetDigest(
    encoder.encode(canonicalizeIJson(operationAsset))
  );
  operationRow.digest = operationDigest;
  operationRow.assetLocator.digest = operationDigest;
  operationRow.operationContract.operationDigest = operationDigest;
  assert.throws(
    () => admitPublicContractCatalog(catalogFrom(rows)),
    /definitionDigest: semantic projection differs/u
  );

  const currentCatalog = catalogFrom(result.publication.rows);
  assert.throws(
    () => admitPublicContractCatalog({
      ...currentCatalog,
      catalogVersion: "5.0.1"
    }),
    /catalogDigest: canonical catalog projection differs/u
  );

  await withPackedM04((packed) => {
    assert.throws(
      () => packed.admitPublicContractCatalog(catalogFrom(rows)),
      /definitionDigest: semantic projection differs/u
    );
    assert.throws(
      () => packed.admitPublicContractCatalog({
        ...currentCatalog,
        catalogVersion: "5.0.1"
      }),
      /catalogDigest: canonical catalog projection differs/u
    );
  });
});

test("T-281 P2 packed exact meta-schema and family admission reject drift", async () => {
  const result = await publication();
  const validate = new Ajv({ strict: false }).compile(
    await packedOperationSchema()
  );
  const validAsset = JSON.parse(
    decoder.decode(result.publication.generatedAssets[0].bytes)
  );
  assert.equal(validate(validAsset), true, JSON.stringify(validate.errors));

  for (const [label, mutate] of [
    ["definition key", (value) => {
      value.definitions[0].definitionKey.memberKind = "unknown";
    }],
    ["definition digest", (value) => {
      value.definitions[0].definitionDigest = "sha256:bad";
    }],
    ["event admission", (value) => {
      value.definitions[0].eventAdmission = "implicit";
    }],
    ["definition count", (value) => { value.definitions = []; }],
    ["absent nonterminal", (value) => {
      delete value.definitions[0].schemaCoordinates.nonterminal;
    }]
  ]) {
    const candidate = structuredClone(validAsset);
    mutate(candidate);
    assert.equal(validate(candidate), false, label);
  }

  const missingDefinition = structuredClone(result.publication.rows);
  const multiDefinitionRow = missingDefinition.find(
    (row) => row.operationContract.definitions.length > 1
  );
  assert.ok(multiDefinitionRow);
  multiDefinitionRow.operationContract.definitions.pop();
  multiDefinitionRow.capabilityRefs = [...new Set(
    multiDefinitionRow.operationContract.definitions.flatMap(
      (definition) => definition.capabilityRefs
    )
  )].sort();
  assert.throws(
    () => admitPublicContractCatalog(catalogFrom(missingDefinition)),
    /expected 62 definitions/u
  );

  const changedAbsence = structuredClone(result.publication.rows);
  const absent = changedAbsence
    .flatMap((row) => row.operationContract.definitions)
    .find((definition) => definition.schemaCoordinates.nonterminal === null);
  assert.ok(absent);
  absent.schemaCoordinates.nonterminal = structuredClone(
    absent.schemaCoordinates.refusal
  );
  absent.adapterExitMap.acceptedNonTerminal = 3;
  assert.throws(
    () => admitPublicContractCatalog(catalogFrom(changedAbsence)),
    /definitionDigest: semantic projection differs|duplicate operation schema|expected 62 definitions, 196 schemas, and 52 absent/u
  );
});
