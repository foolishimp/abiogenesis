import { readFile, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TextEncoder } from "node:util";

import { createGenerator } from "ts-json-schema-generator";

import {
  DS1_BASELINE_SCHEMA_ASSET_REGISTER,
  buildPublicOperationSchemaAssetDefinitions
} from "../../build/semantic/code/src/app/m04/public_contracts/index.js";
import { canonicalizeIJson } from "../../build/semantic/code/src/app/m04/public_sdk/index.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(HERE, "../..");
const DECLARATION_GLOB = path.join(
  PACKAGE_ROOT,
  "build/semantic/code/src/**/*.d.ts"
);
const TSCONFIG_PATH = path.join(PACKAGE_ROOT, "tsconfig.semantic-strict.json");
const DRAFT_07 = "http://json-schema.org/draft-07/schema#";

async function schemaDefinitions() {
  const definitions = [
    ...DS1_BASELINE_SCHEMA_ASSET_REGISTER,
    ...await buildPublicOperationSchemaAssetDefinitions()
  ];
  const contractIds = new Set();
  const relativePaths = new Set();
  for (const definition of definitions) {
    if (contractIds.has(definition.contractId)) {
      throw new TypeError(`duplicate schema contract ${definition.contractId}`);
    }
    if (relativePaths.has(definition.relativePath)) {
      throw new TypeError(`duplicate schema path ${definition.relativePath}`);
    }
    contractIds.add(definition.contractId);
    relativePaths.add(definition.relativePath);
  }
  return definitions;
}

function createSchemaGenerator() {
  return createGenerator({
    path: DECLARATION_GLOB,
    tsconfig: TSCONFIG_PATH,
    type: "*",
    expose: "none",
    jsDoc: "extended",
    functions: "fail",
    strictTuples: true,
    additionalProperties: false,
    skipTypeCheck: false
  });
}

function schemaGenerationSegments(definitions) {
  // The generator mutates its alias graph between calls. Isolate the host
  // specialization and reset afterward so no schema loses shared definitions.
  const hostIndex = definitions.findIndex(
    ({ nativeType }) => nativeType === "HostInvocationDescriptor"
  );
  if (hostIndex === -1) {
    throw new TypeError("host invocation schema definition is missing");
  }
  return [
    definitions.slice(0, hostIndex),
    definitions.slice(hostIndex, hostIndex + 1),
    definitions.slice(hostIndex + 1)
  ].filter((segment) => segment.length > 0);
}

function generateSchemas(definitions) {
  const nativeDefinitions = definitions.filter((definition) =>
    !Object.hasOwn(definition, "bytes")
  );
  const projectedDefinitions = definitions.filter((definition) =>
    Object.hasOwn(definition, "bytes")
  );
  return [...schemaGenerationSegments(nativeDefinitions).flatMap((segment) => {
    const generator = createSchemaGenerator();
    return segment.map((definition) => Object.freeze({
      ...definition,
      bytes: schemaBytes(generator, definition)
    }));
  }), ...projectedDefinitions];
}

function assertNoUnconstrainedSchema(value, location) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      assertNoUnconstrainedSchema(entry, `${location}[${index}]`)
    );
    return;
  }
  if (typeof value !== "object" || value === null) {
    return;
  }
  const entries = Object.entries(value);
  if (entries.length === 0) {
    if (location.endsWith(".not")) return;
    throw new TypeError(`${location}: unconstrained schema fallback`);
  }
  for (const [key, entry] of entries) {
    assertNoUnconstrainedSchema(entry, `${location}.${key}`);
  }
}

function schemaBytes(generator, definition) {
  const generated = generator.createSchema(definition.nativeType);
  const schema = {
    ...generated,
    $id: definition.contractId
  };
  if (schema.$schema !== DRAFT_07) {
    throw new TypeError(
      `${definition.contractId}: generator did not emit JSON Schema draft-07`
    );
  }
  assertNoUnconstrainedSchema(schema, definition.contractId);
  const canonical = canonicalizeIJson(schema);
  if (canonical.includes('"__@')) {
    throw new TypeError(
      `${definition.contractId}: native symbol brand leaked into serialization`
    );
  }
  return new TextEncoder().encode(canonical);
}

async function writeSchemas(generated) {
  await rm(path.join(PACKAGE_ROOT, "contracts/schemas/operations"), {
    recursive: true,
    force: true
  });
  for (const row of generated) {
    const absolutePath = path.join(PACKAGE_ROOT, row.relativePath);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, row.bytes);
  }
}

async function walkSchemaFiles(absoluteRoot) {
  let entries;
  try {
    entries = await readdir(absoluteRoot, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
  const paths = [];
  for (const entry of entries) {
    const absolute = path.join(absoluteRoot, entry.name);
    if (entry.isDirectory()) {
      paths.push(...await walkSchemaFiles(absolute));
    } else if (entry.isFile()) {
      paths.push(path.relative(PACKAGE_ROOT, absolute).split(path.sep).join("/"));
    }
  }
  return paths.sort();
}

async function checkSchemas(generated) {
  const stale = [];
  for (const row of generated) {
    const absolutePath = path.join(PACKAGE_ROOT, row.relativePath);
    let actual;
    try {
      actual = await readFile(absolutePath);
    } catch {
      stale.push(`${row.relativePath}: missing`);
      continue;
    }
    if (!actual.equals(row.bytes)) {
      stale.push(`${row.relativePath}: stale`);
    }
  }
  const expectedOperationPaths = generated
    .map((row) => row.relativePath)
    .filter((relativePath) => relativePath.startsWith("contracts/schemas/operations/"))
    .sort();
  const actualOperationPaths = await walkSchemaFiles(
    path.join(PACKAGE_ROOT, "contracts/schemas/operations")
  );
  if (
    JSON.stringify(actualOperationPaths) !== JSON.stringify(expectedOperationPaths)
  ) {
    stale.push("contracts/schemas/operations: legacy, missing, or extra assets");
  }
  if (stale.length > 0) {
    throw new TypeError(`public contract schemas are not current:\n${stale.join("\n")}`);
  }
}

async function main() {
  const mode = process.argv[2];
  if (mode !== "--write" && mode !== "--check") {
    throw new TypeError("expected --write or --check");
  }
  const generated = generateSchemas(await schemaDefinitions());
  if (mode === "--write") {
    await writeSchemas(generated);
  } else {
    await checkSchemas(generated);
  }
  process.stdout.write(
    `${mode === "--write" ? "wrote" : "verified"} ${generated.length} public contract schemas\n`
  );
}

await main();
