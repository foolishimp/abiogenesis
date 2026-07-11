import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TextEncoder } from "node:util";

import { createGenerator } from "ts-json-schema-generator";

import {
  DS1_BASELINE_SCHEMA_ASSET_REGISTER,
  DS1_PUBLIC_OPERATION_DEFINITION_REGISTER
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

function operationSchemaDefinitions() {
  return DS1_PUBLIC_OPERATION_DEFINITION_REGISTER.flatMap((operation) => {
    const slug = operation.operationId.slice("abg.operation.".length);
    return [
      ["request", operation.requestSymbol],
      ["result", operation.resultSymbol],
      ["refusal", operation.refusalSymbol]
    ].map(([member, nativeType]) => Object.freeze({
      contractId: `abg.schema.operation.${slug}.${member}`,
      relativePath:
        `contracts/schemas/operations/${slug}/${member}.schema.json`,
      nativeType
    }));
  });
}

function schemaDefinitions() {
  const definitions = [
    ...DS1_BASELINE_SCHEMA_ASSET_REGISTER,
    ...operationSchemaDefinitions()
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
  for (const row of generated) {
    const absolutePath = path.join(PACKAGE_ROOT, row.relativePath);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, row.bytes);
  }
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
  if (stale.length > 0) {
    throw new TypeError(`public contract schemas are not current:\n${stale.join("\n")}`);
  }
}

async function main() {
  const mode = process.argv[2];
  if (mode !== "--write" && mode !== "--check") {
    throw new TypeError("expected --write or --check");
  }
  const generator = createGenerator({
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
  const generated = schemaDefinitions().map((definition) => Object.freeze({
    ...definition,
    bytes: schemaBytes(generator, definition)
  }));
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
