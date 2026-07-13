// Validates: T-223 DS-1 generated schema and native-carrier parity
// Validates: REQ-P-PUBLIC-CONTRACTS-003,006,008,013

import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { TextEncoder } from "node:util";
import { fileURLToPath } from "node:url";

import Ajv from "ajv";

import {
  RUNTIME_EVENT_KIND_VALUES,
  admitWorkspaceRuntimeEventBytes,
  createRuntimeEventEmitterContext,
  emitWithContext,
  projectRuntimePublicReplay,
  projectRuntimePublicResult
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  DS1_BASELINE_SCHEMA_ASSET_REGISTER,
  DS1_NATIVE_CONTRACT_REGISTER,
  DS1_PUBLIC_OPERATION_DEFINITION_REGISTER,
  buildDs1ProductPublication,
  publicContractAssetDigest
} from "../../build/semantic/code/src/app/m04/public_contracts/index.js";
import {
  DS1_PUBLIC_OPERATION_IDS,
  admitHostInvocationDescriptor,
  admitProductToolchainManifest,
  admitPublicContractCatalog,
  admitPublicSdkWorkspaceManifest,
  canonicalizeIJson,
  resolvePublicOperationContract
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  serializeGraphFunction
} from "../../build/semantic/code/src/gtl/m01/index.js";
import {
  serializeModule
} from "../../build/semantic/code/src/gtl/m02/index.js";
import { buildT155ZoomedBasis } from "./support/t155-graph-function-zoom-fixtures.mjs";
import {
  ACTOR_REF,
  BINDING_ID,
  CATALOG_DIGEST,
  CATALOG_ID,
  HANDLE,
  INPUT_SCHEMA_DIGEST,
  LOCK_ID,
  PRODUCT_SET_DIGEST,
  PRODUCT_VERSION,
  RUNTIME_CATALOG_PROJECTION_REF,
  RUNTIME_ENTRY_REF,
  WORKSPACE_ID,
  WORKSPACE_MANIFEST_DIGEST,
  admittedOperationRequestFixtures,
  catalogAssetAdmittedEventFixture,
  effectiveSessionViewId,
  workspaceManifestFixture
} from "./support/t223-schema-parity-fixtures.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(HERE, "../..");
const SCHEMA_ROOT = path.join(PACKAGE_ROOT, "contracts/schemas");
const encoder = new TextEncoder();

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(target) : [target];
    })
  );
  return nested.flat();
}

async function loadSchemas() {
  const paths = (await walk(SCHEMA_ROOT))
    .filter((entry) => entry.endsWith(".schema.json"))
    .sort();
  return Promise.all(
    paths.map(async (absolutePath) => {
      const bytes = await readFile(absolutePath);
      return Object.freeze({
        absolutePath,
        relativePath: path
          .relative(PACKAGE_ROOT, absolutePath)
          .split(path.sep)
          .join("/"),
        bytes,
        schema: JSON.parse(bytes.toString("utf8"))
      });
    })
  );
}

const schemas = await loadSchemas();
const schemaById = new Map(schemas.map((entry) => [entry.schema.$id, entry]));

function ajv() {
  return new Ajv({
    strict: true,
    allowUnionTypes: true,
    allErrors: true
  });
}

function assertNoEmptySchema(value, location) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      assertNoEmptySchema(entry, `${location}[${String(index)}]`)
    );
    return;
  }
  if (value === null || typeof value !== "object") {
    return;
  }
  const entries = Object.entries(value);
  assert.notEqual(entries.length, 0, `${location}: unconstrained empty schema`);
  for (const [key, entry] of entries) {
    assertNoEmptySchema(entry, `${location}.${key}`);
  }
}

function localDefinition(schema, ref) {
  const prefix = "#/definitions/";
  assert.equal(ref.startsWith(prefix), true, `unsupported non-local ref ${ref}`);
  const key = decodeURIComponent(ref.slice(prefix.length));
  const definition = schema.definitions?.[key];
  assert.notEqual(definition, undefined, `unresolved local ref ${ref}`);
  return definition;
}

function dereference(schema, node) {
  return node.$ref === undefined
    ? node
    : dereference(schema, localDefinition(schema, node.$ref));
}

function cloneIJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function schemaWitness(schema, input) {
  const node = dereference(schema, input);
  if (node.const !== undefined) {
    return cloneIJson(node.const);
  }
  if (Array.isArray(node.enum)) {
    return cloneIJson(node.enum[0]);
  }
  if (Array.isArray(node.anyOf)) {
    return schemaWitness(schema, node.anyOf[0]);
  }
  if (Array.isArray(node.oneOf)) {
    return schemaWitness(schema, node.oneOf[0]);
  }
  const types = Array.isArray(node.type) ? node.type : [node.type];
  const type = types.find((candidate) => candidate !== "null") ?? types[0];
  switch (type) {
    case "object": {
      const result = {};
      for (const key of node.required ?? []) {
        result[key] = schemaWitness(schema, node.properties[key]);
      }
      return result;
    }
    case "array":
      return Array.from(
        { length: node.minItems ?? 0 },
        () => schemaWitness(schema, node.items)
      );
    case "string":
      if (node.pattern === "^sha256:[0-9a-f]{64}$") {
        return `sha256:${"a".repeat(64)}`;
      }
      return "fixture";
    case "number":
    case "integer":
      return node.minimum ?? 0;
    case "boolean":
      return false;
    case "null":
      return null;
    default:
      throw new TypeError(`unsupported schema witness node ${JSON.stringify(node)}`);
  }
}

function rootObjectShapes(schema) {
  const node = dereference(schema, schema);
  const branches = node.anyOf ?? node.oneOf ?? [node];
  return branches.map((branch) => {
    const shape = dereference(schema, branch);
    assert.equal(shape.type, "object");
    assert.equal(shape.additionalProperties, false);
    assert.ok(Array.isArray(shape.required) && shape.required.length > 0);
    return shape;
  });
}

function schemaAssetDefinitions() {
  return schemas.map((entry) => Object.freeze({
    contractId: entry.schema.$id,
    relativePath: entry.relativePath,
    mediaType: "application/schema+json",
    bytes: entry.bytes
  }));
}

function nativePublicationInputs() {
  const basePayloadAssets = [];
  const nativeInventories = [];
  for (const definition of DS1_NATIVE_CONTRACT_REGISTER) {
    const relativePath =
      `build/semantic/contracts/${definition.contractId.replaceAll(".", "-")}.d.ts`;
    const bytes = encoder.encode(
      "export interface SchemaParityContract { readonly id: string; }\n"
    );
    const digest = publicContractAssetDigest(bytes);
    basePayloadAssets.push(Object.freeze({ relativePath, bytes, digest }));
    nativeInventories.push(Object.freeze({
      contractId: definition.contractId,
      rows: Object.freeze([
        Object.freeze({
          packageExport: definition.packageExport,
          declarationPath: relativePath,
          declarationDigest: digest
        })
      ])
    }));
  }
  return Object.freeze({
    basePayloadAssets: Object.freeze(basePayloadAssets),
    nativeInventories: Object.freeze(nativeInventories)
  });
}

function buildPublication() {
  const native = nativePublicationInputs();
  const vocabulary = {
    kind: "abg_closed_vocabulary",
    schemaVersion: 1,
    vocabularyId: "abg.vocabulary.runtime-event-kind",
    values: RUNTIME_EVENT_KIND_VALUES
  };
  return buildDs1ProductPublication({
    publisher: "abiogenesis",
    packageVersion: "5.0.0-rc.1",
    catalogId: "abg.public-contracts.ds1",
    catalogVersion: "5.0.0-rc.1",
    runtimeSystemProfile: {
      runtimeIdentity: {
        workerId: "worker:t223-schema",
        backendId: "backend:t223-schema",
        buildId: "build:t223-schema",
        resolvedRuntimeRef: "runtime:t223-schema"
      },
      resolvedPolicy: {
        resolvedPolicyBundleRef: "policy:t223-schema",
        defaultRegime: "F_D",
        dispatchRef: null,
        approvalSubjectRef: null
      },
      standardPluginRefs: []
    },
    basePayloadAssets: native.basePayloadAssets,
    staticContractAssets: Object.freeze([
      ...schemaAssetDefinitions(),
      Object.freeze({
        contractId: vocabulary.vocabularyId,
        relativePath: "contracts/vocabularies/runtime-event-kind.json",
        mediaType: "application/json",
        bytes: encoder.encode(canonicalizeIJson(vocabulary))
      })
    ]),
    nativeInventories: native.nativeInventories
  });
}

function hostInvocation(publication) {
  const operationId = "abg.operation.catalog.invoke";
  const operation = resolvePublicOperationContract(
    publication.catalog,
    operationId
  );
  const contract = operation.row.operationContract;
  assert.notEqual(contract, null);
  const request = admittedOperationRequestFixtures([operationId]).get(operationId);
  assert.notEqual(request, undefined);
  const hostSchema = publication.catalog.rows.find(
    (row) => row.contractId === "abg.schema.host-invocation"
  );
  assert.notEqual(hostSchema, undefined);
  const common = {
    schemaVersion: 1,
    invocationSchemaId: contract.invocationSchemaId,
    invocationSchemaVersion: contract.invocationSchemaVersion,
    invocationSchemaDigest: contract.invocationSchemaDigest,
    invocationId: "invocation:t223-schema",
    operationId,
    operationContractVersion: contract.operationVersion,
    operationContractDigest: contract.operationDigest,
    requestId: "request:t223-schema",
    requestSchemaId: contract.requestSchemaId,
    requestSchemaVersion: contract.requestSchemaVersion,
    requestSchemaDigest: contract.requestSchemaDigest,
    resultSchemaId: contract.resultSchemaId,
    resultSchemaVersion: contract.resultSchemaVersion,
    resultSchemaDigest: contract.resultSchemaDigest,
    refusalSchemaId: contract.refusalSchemaId,
    refusalSchemaVersion: contract.refusalSchemaVersion,
    refusalSchemaDigest: contract.refusalSchemaDigest,
    request,
    actorRef: ACTOR_REF,
    provenanceRefs: [],
    adapter: { kind: "native_sdk", ref: "sdk:t223-schema" },
    correlationId: "invocation:t223-schema"
  };
  return admitHostInvocationDescriptor({
    ...common,
    contractCatalogVersion: publication.catalog.catalogVersion,
    contractCatalogDigest: publication.catalog.catalogDigest,
    workspaceId: WORKSPACE_ID,
    workspaceManifestDigest: WORKSPACE_MANIFEST_DIGEST,
    productSetDigest: PRODUCT_SET_DIGEST,
    productBindingRefs: ["installed:example.hello:1.0.0"],
    bindingId: BINDING_ID,
    resolvedLockId: LOCK_ID,
    catalogId: CATALOG_ID,
    catalogVersion: PRODUCT_VERSION,
    catalogDigest: CATALOG_DIGEST,
    runtimeCatalogProjectionRef: RUNTIME_CATALOG_PROJECTION_REF,
    effectiveSessionViewId: effectiveSessionViewId(),
    allowedHandles: [HANDLE],
    allowedEntryRefs: [RUNTIME_ENTRY_REF],
    graphFunctionHandle: HANDLE,
    interfaceRef: "interface:example.hello.v1",
    inputId: "input:t223-schema",
    inputSchemaId: "schema:example.hello.input",
    inputSchemaVersion: PRODUCT_VERSION,
    inputSchemaDigest: INPUT_SCHEMA_DIGEST,
    input: { greeting: "world" },
    requiredCapabilityRefs: [],
    transportSteering: null,
    mode: "invoke",
    scope: "graph_function",
    target: HANDLE,
    until: "converged"
  }, operation, hostSchema);
}

function runtimeProjections() {
  const context = createRuntimeEventEmitterContext({
    source: "live",
    startOrdinal: 0
  });
  const events = emitWithContext(
    context,
    [
      catalogAssetAdmittedEventFixture(),
      {
        kind: "graph_call_opened",
        basisId: "basis:t223-schema",
        graphCallId: "graph-call:t223-schema",
        graphFunctionId: HANDLE,
        jobId: "job:t223-schema",
        runId: "run:t223-schema",
        workKey: "work:t223-schema"
      },
      {
        kind: "terminal_reached",
        basisId: "basis:t223-schema",
        terminalKind: "converged",
        reason: null
      }
    ],
    () => {}
  );
  const bytes = encoder.encode(
    `${events.map((event) => canonicalizeIJson(event)).join("\n")}\n`
  );
  const replay = admitWorkspaceRuntimeEventBytes(bytes);
  const result = projectRuntimePublicResult({
    replay,
    graphCallId: "graph-call:t223-schema"
  });
  const publicReplay = projectRuntimePublicReplay({
    replay,
    subject: { kind: "workspace", workspaceId: WORKSPACE_ID },
    fromOrdinal: 0,
    limit: 100
  });
  assert.notEqual(result, null);
  assert.notEqual(publicReplay, null);
  return Object.freeze({ events, result, publicReplay });
}

function validate(id, value) {
  const entry = schemaById.get(id);
  assert.notEqual(entry, undefined, `missing schema ${id}`);
  const validator = ajv().compile(entry.schema);
  assert.equal(
    validator(value),
    true,
    `${id}: ${JSON.stringify(validator.errors)}`
  );
}

test("T-223 every registered generated schema compiles without fallback or brands", () => {
  const expectedSchemaCount =
    DS1_BASELINE_SCHEMA_ASSET_REGISTER.length +
    DS1_PUBLIC_OPERATION_DEFINITION_REGISTER.length * 3;
  assert.equal(schemas.length, expectedSchemaCount);
  assert.equal(schemaById.size, expectedSchemaCount);
  const compiler = ajv();
  for (const entry of schemas) {
    assert.equal(
      entry.schema.$schema,
      "http://json-schema.org/draft-07/schema#",
      entry.relativePath
    );
    assertNoEmptySchema(entry.schema, entry.schema.$id);
    assert.equal(entry.bytes.includes(encoder.encode('"__@')), false);
    assert.doesNotThrow(() => compiler.compile(entry.schema), entry.relativePath);
  }
});

test("T-223 native-admitted GTL and DS-1 public carriers satisfy their schemas", () => {
  const basis = buildT155ZoomedBasis();
  validate("abg.schema.gtl-graph-function", serializeGraphFunction(basis.zoomed));
  validate("abg.schema.gtl-module", serializeModule(basis.module));

  const workspaceManifest = admitPublicSdkWorkspaceManifest(
    workspaceManifestFixture()
  );
  validate("abg.schema.workspace-manifest", workspaceManifest);

  const publication = buildPublication();
  const catalog = admitPublicContractCatalog(publication.catalog);
  const manifest = admitProductToolchainManifest(publication.manifest);
  validate("abg.schema.public-contract-catalog", catalog);
  validate("abg.schema.product-toolchain-manifest", manifest);
  validate("abg.schema.host-invocation", hostInvocation(publication));

  const runtime = runtimeProjections();
  const catalogEvent = runtime.events.find(
    (event) => event.kind === "catalog_asset_admitted"
  );
  assert.notEqual(catalogEvent, undefined);
  assert.equal(Number.isSafeInteger(catalogEvent.eventAdmissionOrdinal), true);
  validate("abg.schema.runtime-event", catalogEvent);
  validate("abg.schema.runtime-result", runtime.result);
  validate("abg.schema.runtime-replay", runtime.publicReplay);
});

test("T-223 every DS-1 operation schema is closed and requires structure", () => {
  assert.deepEqual(
    DS1_PUBLIC_OPERATION_DEFINITION_REGISTER.map((row) => row.operationId),
    [...DS1_PUBLIC_OPERATION_IDS]
  );
  const requests = admittedOperationRequestFixtures([
    ...DS1_PUBLIC_OPERATION_IDS
  ]);
  const schemaOnlyFixtureFamilies = [];

  for (const operationId of DS1_PUBLIC_OPERATION_IDS) {
    const slug = operationId.slice("abg.operation.".length);
    for (const member of ["request", "result", "refusal"]) {
      const id = `abg.schema.operation.${slug}.${member}`;
      const entry = schemaById.get(id);
      assert.notEqual(entry, undefined, id);
      const validator = ajv().compile(entry.schema);
      const fixture = member === "request"
        ? requests.get(operationId)
        : schemaWitness(entry.schema, entry.schema);
      if (member !== "request") {
        schemaOnlyFixtureFamilies.push(`${operationId}.${member}`);
      }
      assert.notEqual(fixture, undefined, id);
      assert.equal(
        validator(fixture),
        true,
        `${id}: ${JSON.stringify(validator.errors)}`
      );

      const shapes = rootObjectShapes(entry.schema);
      const requiredKey = shapes[0].required.find(
        (key) =>
          Object.hasOwn(fixture, key) &&
          shapes.every((shape) => shape.required.includes(key))
      );
      assert.notEqual(requiredKey, undefined, `${id}: no shared required key`);
      const missing = cloneIJson(fixture);
      delete missing[requiredKey];
      assert.equal(validator(missing), false, `${id}: admitted missing ${requiredKey}`);

      const unknown = { ...cloneIJson(fixture), unexpected: true };
      assert.equal(validator(unknown), false, `${id}: admitted unknown key`);
    }
  }

  assert.deepEqual(
    schemaOnlyFixtureFamilies,
    DS1_PUBLIC_OPERATION_IDS.flatMap((operationId) => [
      `${operationId}.result`,
      `${operationId}.refusal`
    ])
  );
});
