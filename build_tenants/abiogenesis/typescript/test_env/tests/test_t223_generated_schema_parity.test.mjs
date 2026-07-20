// Validates: T-223 generated schema and published-carrier parity.
// Validates: REQ-P-PUBLIC-CONTRACTS-003,006,008,013

import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import Ajv from "ajv";
import { Ajv2020 } from "ajv/dist/2020.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(HERE, "../..");
const SCHEMA_ROOT = path.join(PACKAGE_ROOT, "contracts/schemas");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  }))).flat();
}

async function loadJson(absolutePath) {
  return JSON.parse(await readFile(absolutePath, "utf8"));
}

const schemaPaths = (await walk(SCHEMA_ROOT))
  .filter((entry) => entry.endsWith(".schema.json"))
  .sort();
const schemas = await Promise.all(schemaPaths.map(async (absolutePath) => ({
  absolutePath,
  relativePath: path.relative(PACKAGE_ROOT, absolutePath).split(path.sep).join("/"),
  schema: await loadJson(absolutePath)
})));
const schemaById = new Map(schemas.map((entry) => [entry.schema.$id, entry.schema]));

function ajv(schema) {
  const options = { strict: false, allowUnionTypes: true, allErrors: true };
  return schema.$schema === "https://json-schema.org/draft/2020-12/schema"
    ? new Ajv2020(options)
    : new Ajv(options);
}

function assertNoUnconstrainedSchema(value, location) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      assertNoUnconstrainedSchema(entry, `${location}[${index}]`)
    );
    return;
  }
  if (value === null || typeof value !== "object") return;
  const entries = Object.entries(value);
  if (!location.endsWith(".not") && !location.endsWith(".properties")) {
    assert.notEqual(entries.length, 0, `${location}: unconstrained empty schema`);
  }
  for (const [key, entry] of entries) {
    assertNoUnconstrainedSchema(entry, `${location}.${key}`);
  }
}

function validate(schemaId, value) {
  const schema = schemaById.get(schemaId);
  assert.ok(schema, `missing schema ${schemaId}`);
  const check = ajv(schema).compile(schema);
  assert.equal(check(value), true, JSON.stringify(check.errors));
}

test("T-223 every generated schema compiles without fallback", () => {
  assert.equal(schemas.length, 222);
  for (const { relativePath, schema } of schemas) {
    assertNoUnconstrainedSchema(schema, relativePath);
    assert.doesNotThrow(() => ajv(schema).compile(schema), relativePath);
  }
});

test("T-223 generated manifest, catalog and operation assets satisfy exact schemas", async () => {
  const manifest = await loadJson(path.join(PACKAGE_ROOT, "product-toolchain-manifest.json"));
  const catalog = await loadJson(
    path.join(PACKAGE_ROOT, "contracts/public-contract-catalog.json")
  );
  validate("abg.schema.product-toolchain-manifest", manifest);
  validate("abg.schema.public-contract-catalog", catalog);

  const operationRows = catalog.rows.filter((row) => row.contractKind === "operation");
  assert.equal(operationRows.length, 19);
  const operationSchema = schemaById.get("abg.schema.public-operation-contract");
  assert.ok(operationSchema);
  const checkOperation = ajv(operationSchema).compile(operationSchema);
  for (const row of operationRows) {
    const metaSchemaRow = catalog.rows.find(
      (candidate) => candidate.contractId === row.assetLocator.schemaId
    );
    assert.ok(metaSchemaRow, `${row.contractId}: missing operation meta-schema row`);
    assert.equal(row.assetLocator.schemaVersion, metaSchemaRow.version);
    const asset = await loadJson(path.join(PACKAGE_ROOT, row.assetLocator.relativePath));
    assert.equal(checkOperation(asset), true, JSON.stringify(checkOperation.errors));
    assert.equal(asset.operationId, row.contractId);
    assert.equal(asset.familyDigest, row.operationContract.familyDigest);
  }
});

test("T-223 exact operation schema projection is closed and addressable", () => {
  const operationSchemas = schemas.filter((entry) =>
    entry.relativePath.startsWith("contracts/schemas/operations/")
  );
  assert.equal(operationSchemas.length, 196);
  assert.equal(new Set(operationSchemas.map((entry) => entry.schema.$id)).size, 196);
  for (const { relativePath, schema } of operationSchemas) {
    const root = schema.$ref === undefined
      ? schema
      : schema.definitions?.[decodeURIComponent(schema.$ref.slice("#/definitions/".length))];
    assert.ok(root, `${relativePath}: unresolved root`);
    for (const branch of root.anyOf ?? root.oneOf ?? [root]) {
      assert.equal(branch.type, "object", relativePath);
      assert.equal(branch.additionalProperties, false, relativePath);
      assert.ok(branch.required?.length > 0, relativePath);
    }
  }
});
