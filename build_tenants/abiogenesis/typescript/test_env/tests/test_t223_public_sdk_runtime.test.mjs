// Validates: T-223 DS-1 installed public SDK runtime slice
// Validates: REQ-P-CATALOG, REQ-P-PUBLIC-CONTRACTS

import assert from "node:assert/strict";
import test from "node:test";
import { mkdir, readFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { TextEncoder } from "node:util";

import {
  admitWorkspaceRuntimeEventBytes,
  constructAbgFnCompositionDeclarations,
  projectRuntimePublicResult,
  runEngineStartAsync
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  abiogenesisPublicSdk,
  constructLiveCapabilityBinding,
  constructToolchainWorkspaceBindingV3,
  digestCanonicalIJson
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  constructNode,
  constructNodeTypeGraphFunction,
  edge,
  emptySerializedAttrs,
  graphFunctionForVector
} from "../../build/semantic/code/src/gtl/m01/index.js";
import {
  constructContractRef,
  constructJob,
  constructModule,
  constructRole
} from "../../build/semantic/code/src/gtl/m02/index.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  buildT223HelloWorldModule
} from "../tools/t223_hello_world_fixture.mjs";

function sha(character) {
  return `sha256:${character.repeat(64)}`;
}

const HELLO_INPUT_SCHEMA = Object.freeze({
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  additionalProperties: false,
  required: ["greeting"],
  properties: {
    greeting: {
      type: "string",
      minLength: 1
    }
  }
});
const CONTRACT_DIGEST = stableSha256Digest(HELLO_INPUT_SCHEMA);
const CATALOG_DIGEST = sha("b");
const CATALOG_SCHEMA_DIGEST = sha("c");
const ABG_ARTIFACT_DIGEST = sha("d");
const FIXTURE_ARTIFACT_DIGEST = sha("e");
const ABG_CONTRIBUTION_DIGEST = sha("f");
const FIXTURE_CONTRIBUTION_DIGEST = sha("1");
const ABG_DESCRIPTOR_DIGEST = sha("2");
const FIXTURE_DESCRIPTOR_DIGEST = sha("3");
const LOCK_DIGEST = sha("4");
const ABG_CONTENT_DIGEST = sha("6");
const FIXTURE_CONTENT_DIGEST = sha("7");
const MANIFEST_DIGEST = sha("8");
const WORKSPACE_ID = "workspace:t223-sdk";
const WORKSPACE_ROOT = "/tmp/t223-sdk-workspace";
const TOOLCHAIN_ROOT = "/tmp/t223-sdk-toolchain";
const LOCK_ID = "lock:t223-sdk";
const ACTOR_REF = "actor:t223-sdk";
const GRAPH_HANDLE = "graph-function://fixture/hello-world";
const NODE_HANDLE = "node-type://fixture/hello-input";
const OVERLAY_HANDLE = "overlay://fixture/default";
const INTERFACE_REF = "interface://fixture/hello-world/v1";

const SDK_OPERATION_IDS = Object.freeze([
  "abg.operation.workspace.create",
  "abg.operation.catalog.verify",
  "abg.operation.catalog.admit",
  "abg.operation.catalog.list",
  "abg.operation.catalog.describe",
  "abg.operation.catalog.allow",
  "abg.operation.catalog.invoke",
  "abg.operation.read.result",
  "abg.operation.read.replay"
]);

function assetSurface(kind) {
  return {
    kind,
    requiredContexts: ["context://t223-sdk"],
    standardsRefs: ["specification/requirements/product/REQ-P-CATALOG.md"],
    outputContractRefs: [`contract://t223-sdk/${kind}`],
    constructorRefs: [],
    constructorInputAssetKinds: [],
    rendererRefs: [],
    renderedViewDigestPolicyRef: null,
    sectionKindRefs: [],
    clauseKindRefs: [],
    authoritySlots: [],
    proofObligationRefs: [`proof://t223-sdk/${kind}`]
  };
}

function node(name, typeRef = null) {
  return constructNode({
    name,
    schema: { kind: "symbolic", ref: `schema://t223-sdk/${name}` },
    typeRef,
    markov: ["catalog:ready"],
    assetSurface: assetSurface(name.toLowerCase()),
    tags: ["t223-sdk"]
  });
}

function fixtureModule() {
  const input = node("HelloInput");
  const output = node("HelloOutput");
  const vector = edge([input], output, {
    name: "hello-input-to-output",
    declarations: { entries: [] },
    tags: ["t223-sdk"]
  }).vectors[0];
  assert.notEqual(vector, undefined);
  const graphFunction = graphFunctionForVector(vector, {
    name: GRAPH_HANDLE,
    declarations: constructAbgFnCompositionDeclarations({
      contractRef: "abg.fn_composition://fixture/hello-world",
      hookRef: "hook://fixture/hello-world/composition",
      regimes: [
        {
          bindingRef: "regime-binding://fixture/hello-world/evaluate/fd",
          stageRole: "evaluate",
          regime: "F_D",
          role: "validate",
          order: 0,
          authority: "closure",
          inputCarrierRefs: ["EnginePluginInput"],
          outputCarrierRefs: ["FdEvaluationOutcome"],
          evidenceRefs: ["evidence://fixture/hello-world/fd"]
        },
        {
          bindingRef: "regime-binding://fixture/hello-world/consequence/fd",
          stageRole: "consequence",
          regime: "F_D",
          role: "observe",
          order: 1,
          authority: "evidence",
          inputCarrierRefs: ["EnginePluginInput"],
          outputCarrierRefs: ["ConsequenceProjectionOutcome"],
          evidenceRefs: ["evidence://fixture/hello-world/consequence"]
        }
      ],
      standardsContextRefs: ["standard://fixture/hello-world"],
      policyContextRefs: ["policy://fixture/default"],
      carrierContextRefs: ["carrier://fixture/hello-world"],
      assuranceContextRefs: ["assurance://fixture/hello-world"],
      closureContractRef: "closure://fixture/hello-world"
    }),
    tags: ["t223-sdk"]
  });
  const nodeType = constructNodeTypeGraphFunction(
    node("HelloInputType", NODE_HANDLE)
  );
  const role = constructRole({
    name: "fixture_hello_role",
    tags: ["t223-sdk"],
    policyHooks: emptySerializedAttrs()
  });
  const job = constructJob({
    name: "fixture_hello_job",
    contracts: [constructContractRef({
      kind: "graph_function",
      targetId: graphFunction.id
    })],
    roles: [role],
    tags: ["t223-sdk"],
    policyHooks: emptySerializedAttrs()
  });
  return constructModule({
    name: "fixture-hello-world",
    graphs: [],
    graphFunctions: [graphFunction, nodeType],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [job],
    roles: [role],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    policyHooks: emptySerializedAttrs(),
    metadata: emptySerializedAttrs()
  });
}

function operationContractRow(operationId) {
  const slug = operationId.slice("abg.operation.".length);
  const actorPolicy = new Set([
    "abg.operation.workspace.create",
    "abg.operation.catalog.admit",
    "abg.operation.catalog.invoke"
  ]).has(operationId)
    ? "required"
    : "forbidden";
  const effectClassByOperation = {
    "abg.operation.workspace.create": "workspace_manifest_write",
    "abg.operation.catalog.verify": "temporary_artifact_read",
    "abg.operation.catalog.admit": "runtime_catalog_admission",
    "abg.operation.catalog.list": "runtime_catalog_projection",
    "abg.operation.catalog.describe": "runtime_catalog_projection",
    "abg.operation.catalog.allow": "runtime_session_projection",
    "abg.operation.catalog.invoke": "runtime_graph_function_invoke",
    "abg.operation.read.result": "runtime_result_projection",
    "abg.operation.read.replay": "runtime_replay_projection"
  };
  const terminalDispositions =
    operationId === "abg.operation.workspace.create"
      ? ["created"]
      : operationId === "abg.operation.catalog.verify"
        ? ["verified"]
        : operationId === "abg.operation.catalog.admit"
      ? ["admitted"]
      : operationId === "abg.operation.catalog.list"
        ? ["listed"]
        : operationId === "abg.operation.catalog.describe"
          ? ["described"]
          : operationId === "abg.operation.catalog.allow"
            ? ["allowed"]
            : operationId === "abg.operation.catalog.invoke"
              ? ["converged"]
              : ["projected"];
  const nonTerminalDispositions =
    operationId === "abg.operation.catalog.invoke"
      ? ["stopped", "yielded", "blocked", "human_gate_required"]
      : [];
  const invocationSchemaId = "abg.schema.public-operation-invocation";
  return {
    contractId: operationId,
    contractKind: "operation",
    owningProductId: "abiogenesis",
    version: "1.0.0",
    digest: CONTRACT_DIGEST,
    authorityRefs: ["REQ-P-PUBLIC-CONTRACTS"],
    capabilityRefs: [],
    nativeLocator: {
      kind: "native",
      packageName: "@abiogenesis/typescript-tenant",
      packageExport: "./app/m04",
      symbols: [
        operationId.slice("abg.operation.".length).replace(/\.([a-z])/gu, (_, c) => c.toUpperCase())
      ]
    },
    assetLocator: {
      kind: "asset",
      relativePath: `contracts/operations/${slug}.json`,
      schemaId: "abg.schema.public-operation-contract",
      schemaVersion: "1.0.0",
      mediaType: "application/json",
      digest: CONTRACT_DIGEST
    },
    operationContract: {
      operationId,
      operationVersion: "1.0.0",
      operationDigest: CONTRACT_DIGEST,
      requestSchemaId: `abg.schema.operation.${slug}.request`,
      requestSchemaVersion: "1.0.0",
      requestSchemaDigest: CONTRACT_DIGEST,
      requestSchemaPath: `contracts/schemas/operations/${slug}/request.schema.json`,
      resultSchemaId: `abg.schema.operation.${slug}.result`,
      resultSchemaVersion: "1.0.0",
      resultSchemaDigest: CONTRACT_DIGEST,
      resultSchemaPath: `contracts/schemas/operations/${slug}/result.schema.json`,
      refusalSchemaId: `abg.schema.operation.${slug}.refusal`,
      refusalSchemaVersion: "1.0.0",
      refusalSchemaDigest: CONTRACT_DIGEST,
      refusalSchemaPath: `contracts/schemas/operations/${slug}/refusal.schema.json`,
      invocationSchemaId,
      invocationSchemaVersion: "1.0.0",
      invocationSchemaDigest: CONTRACT_DIGEST,
      invocationSchemaPath:
        "contracts/schemas/public-operation-invocation.schema.json",
      defaults: [],
      closedDomains: [{
        fieldPath: "request",
        kind: "closed_carrier",
        required: true,
        nullable: false,
        values: [],
        minimum: null,
        maximum: null
      }],
      actorPolicy,
      authorityClass:
        operationId === "abg.operation.workspace.create" ||
        operationId === "abg.operation.catalog.admit" ||
        operationId === "abg.operation.catalog.invoke"
          ? "write"
          : "read",
      effectClass: effectClassByOperation[operationId],
      eventAdmission:
        operationId === "abg.operation.catalog.admit"
          ? "catalog_admission_events"
          : operationId === "abg.operation.catalog.invoke"
            ? "runtime_execution_events"
            : "none",
      terminalDispositions,
      nonTerminalDispositions,
      adapterExitMap: {
        acceptedTerminal: 0,
        refused: 1,
        invalidInvocation: 2,
        acceptedNonTerminal: nonTerminalDispositions.length === 0 ? null : 3,
        adapterFailure: 70
      }
    }
  };
}

function abgContractCatalog() {
  return {
    kind: "abg_public_contract_catalog",
    schemaVersion: 1,
    catalogId: "abg.public-contracts.ds1",
    catalogVersion: "1.0.0",
    catalogDigest: CATALOG_DIGEST,
    catalogSchemaPath: "contracts/schemas/public-contract-catalog.schema.json",
    catalogSchemaDigest: CATALOG_SCHEMA_DIGEST,
    profile: "abg-5-ds1",
    rows: [
      ...SDK_OPERATION_IDS.map(operationContractRow),
      {
        contractId: "abg.schema.host-invocation",
        contractKind: "schema_asset",
        owningProductId: "abiogenesis",
        version: "1.0.0",
        digest: CONTRACT_DIGEST,
        authorityRefs: ["REQ-P-PUBLIC-CONTRACTS"],
        capabilityRefs: ["abg.capability.catalog.invoke-graph-function@5"],
        nativeLocator: null,
        assetLocator: {
          kind: "asset",
          relativePath: "contracts/schemas/host-invocation.schema.json",
          schemaId: "abg.schema.host-invocation",
          schemaVersion: "1.0.0",
          mediaType: "application/schema+json",
          digest: CONTRACT_DIGEST
        },
        operationContract: null
      }
    ]
  };
}

function fixtureContractCatalog() {
  return {
    kind: "abg_public_contract_catalog",
    schemaVersion: 1,
    catalogId: "fixture.public-contracts",
    catalogVersion: "0.1.0",
    catalogDigest: sha("9"),
    catalogSchemaPath: "contracts/public-contract-catalog.schema.json",
    catalogSchemaDigest: CATALOG_SCHEMA_DIGEST,
    profile: "catalog-product-v1",
    rows: [{
      contractId: "fixture.contract.hello",
      contractKind: "schema_asset",
      owningProductId: "fixture.hello",
      version: "0.1.0",
      digest: CONTRACT_DIGEST,
      authorityRefs: ["fixture://hello"],
      capabilityRefs: [],
      nativeLocator: null,
      assetLocator: {
        kind: "asset",
        relativePath: "contracts/hello.schema.json",
        schemaId: "fixture.schema.hello",
        schemaVersion: "1.0.0",
        mediaType: "application/schema+json",
        digest: CONTRACT_DIGEST
      },
      operationContract: null
    }]
  };
}

function productManifest(productId, runtimeSystemProfile = undefined) {
  const isAbg = productId === "abiogenesis";
  const catalog = isAbg ? abgContractCatalog() : fixtureContractCatalog();
  return {
    kind: "abg_product_toolchain_manifest",
    schemaVersion: 1,
    publisher: isAbg ? "abiogenesis" : "fixture",
    productId,
    packageName: isAbg
      ? "@abiogenesis/typescript-tenant"
      : "@fixture/hello",
    packageVersion: isAbg ? "5.0.0" : "0.1.0",
    productContentDigest: isAbg ? ABG_CONTENT_DIGEST : FIXTURE_CONTENT_DIGEST,
    publicContractCatalogPath: "contracts/public-contract-catalog.json",
    publicContractCatalogDigest: catalog.catalogDigest,
    publicContractCatalog: catalog,
    runtimeSystemProfile: isAbg
      ? runtimeSystemProfile ?? {
          kind: "abg_runtime_system_profile",
          runtimeIdentity: {
            workerId: "worker:abg",
            backendId: "backend:abg",
            buildId: "build:abg",
            resolvedRuntimeRef: "runtime:abg:5.0.0"
          },
          resolvedPolicy: {
            resolvedPolicyBundleRef: "policy:abg:default",
            defaultRegime: "F_D",
            dispatchRef: null,
            approvalSubjectRef: null
          },
          standardPluginRefs: [],
          profileDigest: CONTRACT_DIGEST
        }
      : null,
    productRelativeLocators: isAbg
      ? ["contracts/public-contract-catalog.json"]
      : [
          "catalog/hello.module.json",
          "catalog/default-overlay.json",
          "contracts/public-contract-catalog.json"
        ]
  };
}

function contributionRow(input, module = fixtureModule()) {
  return {
    canonicalHandle: input.handle,
    publicKind: input.kind,
    ownerProductId: "fixture.hello",
    ownerVersion: "0.1.0",
    declarationRef: input.declarationRef,
    contractRef: "fixture.contract.hello",
    interfaceRef: input.kind === "overlay" ? null : input.interfaceRef,
    locator:
      input.kind === "overlay"
        ? {
            kind: "opaque_overlay_asset",
            assetPath: "catalog/default-overlay.json",
            schemaId: "abg.schema.catalog-overlay-declaration",
            schemaVersion: "1.0.0",
            schemaDigest: CONTRACT_DIGEST,
            assetDigest: sha("0")
          }
        : {
            kind: "module_declaration",
            modulePath: "catalog/hello.module.json",
            moduleDigest: stableSha256Digest(module),
            declarationRef: input.declarationRef
          },
    compatibility: {
      abgVersionRange: ">=5.0.0 <6.0.0-0",
      requiredProductRefs: ["abiogenesis"],
      requiredContractRefs: [],
      requiredCapabilityRefs: []
    },
    readinessRefs: ["readiness://fixture/ready"],
    proofRefs: ["proof://fixture/declared"],
    policyRefs: ["policy://fixture/default"],
    capabilityRefs: input.capabilityRefs ?? [],
    provenanceRefs: ["provenance://fixture/0.1.0"],
    refinementOfHandle: null,
    overrideOfHandle: null
  };
}

function contributionManifest(productId, options = {}) {
  const isAbg = productId === "abiogenesis";
  return {
    kind: "catalog_contribution_manifest",
    schemaVersion: 1,
    contributionId: isAbg
      ? "contribution:abiogenesis:5.0.0"
      : "contribution:fixture.hello:0.1.0",
    contributionDigest: isAbg
      ? ABG_CONTRIBUTION_DIGEST
      : FIXTURE_CONTRIBUTION_DIGEST,
    descriptorId: isAbg
      ? "descriptor:abiogenesis:5.0.0"
      : "descriptor:fixture.hello:0.1.0",
    descriptorDigest: isAbg
      ? ABG_DESCRIPTOR_DIGEST
      : FIXTURE_DESCRIPTOR_DIGEST,
    productId,
    productVersion: isAbg ? "5.0.0" : "0.1.0",
    artifactDigest: isAbg ? ABG_ARTIFACT_DIGEST : FIXTURE_ARTIFACT_DIGEST,
    rows: isAbg
      ? []
      : [
          contributionRow({
            handle: GRAPH_HANDLE,
            kind: "graph_function",
            interfaceRef: INTERFACE_REF,
            declarationRef: GRAPH_HANDLE,
            capabilityRefs: options.graphCapabilityRefs ?? []
          }, options.module),
          contributionRow({
            handle: NODE_HANDLE,
            kind: "node_type",
            interfaceRef: "interface://fixture/hello-input/v1",
            declarationRef: NODE_HANDLE
          }, options.module),
          contributionRow({
            handle: OVERLAY_HANDLE,
            kind: "overlay",
            interfaceRef: null,
            declarationRef: OVERLAY_HANDLE
          }, options.module)
        ]
  };
}

function productBinding(productId) {
  const isAbg = productId === "abiogenesis";
  const version = isAbg ? "5.0.0" : "0.1.0";
  const publisher = isAbg ? "abiogenesis" : "fixture";
  const artifactDigest = isAbg ? ABG_ARTIFACT_DIGEST : FIXTURE_ARTIFACT_DIGEST;
  const root = path.join(TOOLCHAIN_ROOT, "products", productId, version);
  const catalog = isAbg ? abgContractCatalog() : fixtureContractCatalog();
  return {
    installedProductId: `installed:${productId}:${version}`,
    publisher,
    productId,
    packageName: isAbg
      ? "@abiogenesis/typescript-tenant"
      : "@fixture/hello",
    version,
    productContentDigest: isAbg ? ABG_CONTENT_DIGEST : FIXTURE_CONTENT_DIGEST,
    descriptorId: isAbg
      ? "descriptor:abiogenesis:5.0.0"
      : "descriptor:fixture.hello:0.1.0",
    descriptorDigest: isAbg
      ? ABG_DESCRIPTOR_DIGEST
      : FIXTURE_DESCRIPTOR_DIGEST,
    contributionId: isAbg
      ? "contribution:abiogenesis:5.0.0"
      : "contribution:fixture.hello:0.1.0",
    contributionDigest: isAbg
      ? ABG_CONTRIBUTION_DIGEST
      : FIXTURE_CONTRIBUTION_DIGEST,
    artifactDigest,
    installedRoot: root,
    productRoot: root,
    packageRoot: root,
    manifestPath: path.join(root, "product-toolchain-manifest.json"),
    manifestDigest: MANIFEST_DIGEST,
    compatibilityRange: isAbg ? "5.0.0" : ">=5.0.0 <6.0.0-0",
    compatibility: { productId, compatible: true, reason: null },
    commandRefs: isAbg ? ["abg.cli"] : [],
    publicContractCatalogId: catalog.catalogId,
    publicContractCatalogVersion: catalog.catalogVersion,
    publicContractCatalogDigest: catalog.catalogDigest
  };
}

function workspaceManifest() {
  return {
    kind: "abg_workspace_manifest",
    schemaVersion: 1,
    workspaceId: WORKSPACE_ID,
    root: WORKSPACE_ROOT,
    authorityMode: "clean_no_project_authority",
    scaffoldState: "none",
    bindingRef: ".abiogenesis/toolchain-binding.json",
    configurationRefs: [],
    createdAt: "2026-07-11T00:00:00.000Z",
    actorRef: ACTOR_REF,
    provenanceRefs: ["provenance://t223-sdk/workspace"]
  };
}

function mutableStateRoots() {
  return {
    observedWorkspaceRoot: WORKSPACE_ROOT,
    observerStateRoot: path.join(WORKSPACE_ROOT, ".ai-workspace/observer"),
    executorStateRoot: path.join(WORKSPACE_ROOT, ".ai-workspace/executor"),
    eventRoot: path.join(WORKSPACE_ROOT, ".ai-workspace/events"),
    eventLogPath: path.join(WORKSPACE_ROOT, ".ai-workspace/events/events.jsonl"),
    runtimeRoot: path.join(WORKSPACE_ROOT, ".ai-workspace/runtime"),
    projectionRoot: path.join(WORKSPACE_ROOT, ".ai-workspace/projections"),
    archiveRoot: path.join(WORKSPACE_ROOT, ".ai-workspace/archives")
  };
}

function recordPath(binding, product, filename) {
  return path.join(
    binding.toolchainRoot,
    "records",
    product.publisher,
    product.productId,
    product.version,
    product.artifactDigest.slice("sha256:".length),
    filename
  );
}

function createFixture(options = {}) {
  const module = options.module ?? fixtureModule();
  const manifest = workspaceManifest();
  const products = [productBinding("abiogenesis"), productBinding("fixture.hello")];
  const binding = constructToolchainWorkspaceBindingV3({
    workspaceId: manifest.workspaceId,
    workspaceManifestDigest: digestCanonicalIJson(manifest),
    targetRoot: manifest.root,
    toolchainRoot: TOOLCHAIN_ROOT,
    resolvedLockId: LOCK_ID,
    resolvedLockDigest: LOCK_DIGEST,
    products,
    mutableStateRoots: mutableStateRoots(),
    provenanceRefs: [ACTOR_REF]
  });
  const records = new Map();
  for (const product of products) {
    records.set(
      product.manifestPath,
      productManifest(product.productId, options.runtimeSystemProfile)
    );
    records.set(
      recordPath(binding, product, "contribution-manifest.json"),
      contributionManifest(
        product.productId,
        product.productId === "fixture.hello"
          ? {
              module,
              graphCapabilityRefs: options.graphCapabilityRefs ?? []
            }
          : {}
      )
    );
  }
  records.set(
    path.join(products[1].productRoot, "catalog/hello.module.json"),
    module
  );
  records.set(
    path.join(products[1].productRoot, "contracts/hello.schema.json"),
    HELLO_INPUT_SCHEMA
  );
  const events = [];
  const context = {
    kind: "bound_workspace",
    workspaceManifest: manifest,
    binding,
    publicContractCatalog: abgContractCatalog(),
    effects: {
      readRecord: async (absolutePath) => records.get(absolutePath) ?? null,
      readInputAsset: async (inputRef) => records.get(inputRef) ?? null,
      readRuntimeEventBytes: async () =>
        new TextEncoder().encode(events.map((event) => JSON.stringify(event)).join("\n")),
      createRuntimeEventSink: () => (event) => events.push(event),
      operatorCapabilityFactories: {}
    }
  };
  return { context, events, records };
}

function envelope(operationId, request) {
  const slug = operationId.slice("abg.operation.".length);
  const actorRequired =
    operationId === "abg.operation.workspace.create" ||
    operationId === "abg.operation.catalog.admit" ||
    operationId === "abg.operation.catalog.invoke";
  return {
    schemaVersion: 1,
    invocationSchemaId: "abg.schema.public-operation-invocation",
    invocationSchemaVersion: "1.0.0",
    invocationSchemaDigest: CONTRACT_DIGEST,
    invocationId: `invocation:${slug}:${Math.random().toString(36).slice(2)}`,
    operationId,
    operationContractVersion: "1.0.0",
    operationContractDigest: CONTRACT_DIGEST,
    requestId: `request:${slug}:${Math.random().toString(36).slice(2)}`,
    requestSchemaId: `abg.schema.operation.${slug}.request`,
    requestSchemaVersion: "1.0.0",
    requestSchemaDigest: CONTRACT_DIGEST,
    resultSchemaId: `abg.schema.operation.${slug}.result`,
    resultSchemaVersion: "1.0.0",
    resultSchemaDigest: CONTRACT_DIGEST,
    refusalSchemaId: `abg.schema.operation.${slug}.refusal`,
    refusalSchemaVersion: "1.0.0",
    refusalSchemaDigest: CONTRACT_DIGEST,
    request,
    actorRef: actorRequired ? ACTOR_REF : null,
    provenanceRefs: ["provenance://t223-sdk/test"],
    adapter: { kind: "native_sdk", ref: "sdk://t223-test" },
    correlationId: `correlation:${slug}`
  };
}

function catalogVerifyRequest() {
  const contribution = contributionManifest("fixture.hello");
  const descriptor = {
    kind: "catalog_product_descriptor",
    schemaVersion: 1,
    descriptorId: "descriptor:fixture.hello:0.1.0",
    descriptorDigest: FIXTURE_DESCRIPTOR_DIGEST,
    publisher: "fixture",
    productId: "fixture.hello",
    packageName: "@fixture/hello",
    version: "0.1.0",
    distributionArtifactDigest: FIXTURE_ARTIFACT_DIGEST,
    productContentDigest: FIXTURE_CONTENT_DIGEST,
    contributionManifestId: contribution.contributionId,
    contributionManifestDigest: contribution.contributionDigest,
    dependencies: [],
    abgCompatibility: ">=5.0.0 <6.0.0-0",
    contractRefs: ["fixture.contract.hello"],
    capabilityRefs: [],
    provenanceRefs: ["provenance://fixture/0.1.0"]
  };
  return {
    artifact: {
      format: "abg_product_tar_v1",
      artifactPath: "/tmp/fixture.hello-0.1.0.tar",
      expectedArtifactDigest: FIXTURE_ARTIFACT_DIGEST,
      expectedProductContentDigest: FIXTURE_CONTENT_DIGEST
    },
    descriptor,
    contributionManifest: contribution,
    resolvedLock: {
      kind: "resolved_product_lock",
      schemaVersion: 1,
      lockId: LOCK_ID,
      lockDigest: LOCK_DIGEST,
      requirements: [{
        productId: "fixture.hello",
        versionConstraint: "0.1.0",
        requiredContractRefs: ["fixture.contract.hello"],
        requiredCapabilityRefs: []
      }],
      products: [{
        publisher: descriptor.publisher,
        productId: descriptor.productId,
        version: descriptor.version,
        descriptorId: descriptor.descriptorId,
        descriptorDigest: descriptor.descriptorDigest,
        contributionId: contribution.contributionId,
        contributionDigest: contribution.contributionDigest,
        artifactDigest: descriptor.distributionArtifactDigest,
        productContentDigest: descriptor.productContentDigest
      }],
      dependencyEdges: [],
      compatibility: [{
        productId: "fixture.hello",
        compatible: true,
        reason: null
      }]
    }
  };
}

async function admitFixture(fixture) {
  const request = {
    workspaceId: WORKSPACE_ID,
    bindingId: fixture.context.binding.bindingId,
    resolvedLockId: LOCK_ID,
    productSetDigest: fixture.context.binding.productSetDigest
  };
  return await abiogenesisPublicSdk.catalogAdmit(
    fixture.context,
    envelope("abg.operation.catalog.admit", request)
  );
}

function sessionRequest(catalog, overrides = {}) {
  return {
    workspaceId: WORKSPACE_ID,
    catalogId: catalog.catalogId,
    kinds: ["graph_function", "node_type", "overlay"],
    allowedHandles: null,
    sessionView: null,
    ...overrides
  };
}

function hostDescriptor(fixture, catalog, view, handle, interfaceRef) {
  const request = {
    workspaceId: WORKSPACE_ID,
    bindingId: fixture.context.binding.bindingId,
    resolvedLockId: LOCK_ID,
    catalogId: catalog.catalogId,
    catalogVersion: catalog.catalogVersion,
    catalogDigest: catalog.catalogDigest,
    allowedHandles: view.allowedHandles,
    sessionView: null,
    graphFunctionHandle: handle,
    interfaceRef,
    inputId: "input:t223-sdk",
    inputSchemaId: "fixture.schema.hello",
    inputSchemaVersion: "1.0.0",
    inputSchemaDigest: CONTRACT_DIGEST,
    input: { greeting: "world" },
    requiredCapabilityRefs: [],
    actorRef: ACTOR_REF,
    transportSteering: null
  };
  return envelope("abg.operation.catalog.invoke", request);
}

test("T-223 SDK binds pre-workspace operations to the installed public contract before effects", async () => {
  let workspaceEffects = 0;
  const workspaceContext = {
    kind: "workspace_path",
    targetRoot: WORKSPACE_ROOT,
    publicContractCatalog: abgContractCatalog(),
    effects: {
      readBytes: async () => {
        workspaceEffects += 1;
        return null;
      },
      writeBytes: async () => {
        workspaceEffects += 1;
      },
      makeDirectory: async () => {
        workspaceEffects += 1;
      }
    }
  };
  const invalidWorkspaceInvocation = {
    ...envelope("abg.operation.workspace.create", {
      targetRoot: WORKSPACE_ROOT,
      authorityMode: "clean_no_project_authority"
    }),
    operationContractDigest: sha("f")
  };
  await assert.rejects(
    abiogenesisPublicSdk.workspaceCreate(
      workspaceContext,
      invalidWorkspaceInvocation
    ),
    /not bound to the resolved operation row/u
  );
  assert.equal(workspaceEffects, 0);

  let intakeEffects = 0;
  const touched = async () => {
    intakeEffects += 1;
    throw new Error("product intake effect must not run");
  };
  const productContext = {
    kind: "product_intake",
    publicContractCatalog: abgContractCatalog(),
    effects: {
      readArtifactBytes: touched,
      readInstalledBytes: touched,
      inspectArtifact: touched,
      readRecord: touched,
      writeRecord: touched,
      materializeVerifiedArtifact: touched,
      readEnvironment: () => {
        intakeEffects += 1;
        return null;
      },
      readWorkspaceBinding: touched
    }
  };
  const invalidVerifyInvocation = {
    ...envelope("abg.operation.catalog.verify", catalogVerifyRequest()),
    requestSchemaDigest: sha("f")
  };
  await assert.rejects(
    abiogenesisPublicSdk.catalogVerify(productContext, invalidVerifyInvocation),
    /not bound to the resolved operation row/u
  );
  assert.equal(intakeEffects, 0);

  const fixture = createFixture();
  let boundReads = 0;
  const originalReadRecord = fixture.context.effects.readRecord;
  const boundContext = {
    ...fixture.context,
    effects: {
      ...fixture.context.effects,
      readRecord: async (absolutePath) => {
        boundReads += 1;
        return await originalReadRecord(absolutePath);
      }
    }
  };
  const invalidListInvocation = {
    ...envelope("abg.operation.catalog.list", {
      workspaceId: WORKSPACE_ID,
      catalogId: "catalog:unread",
      kinds: ["graph_function"],
      allowedHandles: null,
      sessionView: null
    }),
    resultSchemaDigest: sha("f")
  };
  await assert.rejects(
    abiogenesisPublicSdk.catalogList(boundContext, invalidListInvocation),
    /not bound to the resolved operation row/u
  );
  assert.equal(boundReads, 0);
});

test("T-223 SDK admits, lists, describes, and narrows one replay-derived catalog", async () => {
  const fixture = createFixture();
  const admission = await admitFixture(fixture);
  assert.equal(admission.kind, "accepted", JSON.stringify(admission));
  assert.equal(admission.value.rows.length, 3);
  const admissionAttribution = fixture.events.find(
    (event) =>
      event.kind === "public_operation_admitted" &&
      event.operationId === "abg.operation.catalog.admit"
  );
  assert.notEqual(admissionAttribution, undefined);
  assert.equal(admissionAttribution.actorRef, ACTOR_REF);
  const graphAdmissionEvent = fixture.events.find(
    (event) =>
      event.kind === "registry_entry_admitted" &&
      event.entryRef === GRAPH_HANDLE
  );
  assert.notEqual(graphAdmissionEvent, undefined);
  assert.deepEqual(
    graphAdmissionEvent.causationEventRefs,
    [admissionAttribution.eventId]
  );

  const listed = await abiogenesisPublicSdk.catalogList(
    fixture.context,
    envelope(
      "abg.operation.catalog.list",
      sessionRequest(admission.value)
    )
  );
  assert.equal(listed.kind, "accepted");
  assert.deepEqual(
    listed.value.map((row) => [row.kind, row.callable]),
    [
      ["graph_function", true],
      ["node_type", false],
      ["overlay", false]
    ]
  );
  const listedGraph = listed.value.find(
    (row) => row.canonicalHandle === GRAPH_HANDLE
  );
  assert.notEqual(listedGraph, undefined);
  assert.equal(
    listedGraph.provenanceRefs.includes(graphAdmissionEvent.eventId),
    true
  );

  const described = await abiogenesisPublicSdk.catalogDescribe(
    fixture.context,
    envelope("abg.operation.catalog.describe", {
      workspaceId: WORKSPACE_ID,
      catalogId: admission.value.catalogId,
      handle: OVERLAY_HANDLE,
      allowedHandles: null,
      sessionView: null
    })
  );
  assert.equal(described.kind, "accepted");
  assert.equal(described.value.kind, "overlay");
  assert.equal(described.value.callable, false);
  const overlayAdmissionEvent = fixture.events.find(
    (event) =>
      event.kind === "catalog_asset_admitted" &&
      event.entryRef === OVERLAY_HANDLE
  );
  assert.notEqual(overlayAdmissionEvent, undefined);
  assert.deepEqual(
    overlayAdmissionEvent.causationEventRefs,
    [admissionAttribution.eventId]
  );
  assert.equal(
    described.value.provenanceRefs.includes(overlayAdmissionEvent.eventId),
    true
  );

  const allowed = await abiogenesisPublicSdk.catalogAllow(
    fixture.context,
    envelope("abg.operation.catalog.allow", {
      workspaceId: WORKSPACE_ID,
      catalogId: admission.value.catalogId,
      handles: [GRAPH_HANDLE]
    })
  );
  assert.equal(allowed.kind, "accepted");
  assert.deepEqual(allowed.value.allowedHandles, [GRAPH_HANDLE]);
  assert.deepEqual(allowed.value.allowedEntryRefs, [GRAPH_HANDLE]);

  const constrainedList = await abiogenesisPublicSdk.catalogList(
    fixture.context,
    envelope("abg.operation.catalog.list", {
      ...sessionRequest(admission.value),
      sessionView: allowed.value
    })
  );
  assert.equal(constrainedList.kind, "accepted");
  assert.deepEqual(
    constrainedList.value.map((row) => row.canonicalHandle),
    [GRAPH_HANDLE]
  );

  const empty = await abiogenesisPublicSdk.catalogAllow(
    fixture.context,
    envelope("abg.operation.catalog.allow", {
      workspaceId: WORKSPACE_ID,
      catalogId: admission.value.catalogId,
      handles: []
    })
  );
  assert.equal(empty.kind, "accepted");
  assert.deepEqual(empty.value.rows, []);

  const unresolved = await abiogenesisPublicSdk.catalogAllow(
    fixture.context,
    envelope("abg.operation.catalog.allow", {
      workspaceId: WORKSPACE_ID,
      catalogId: admission.value.catalogId,
      handles: ["graph-function://fixture/missing"]
    })
  );
  assert.equal(unresolved.kind, "refused");
  assert.equal(unresolved.code, "unknown_handle");
});

test("T-223 catalog admission classifies a malformed installed Module at its boundary", async () => {
  const fixture = createFixture();
  const fixtureProduct = fixture.context.binding.products.find(
    (product) => product.productId === "fixture.hello"
  );
  assert.notEqual(fixtureProduct, undefined);
  fixture.records.set(
    path.join(fixtureProduct.productRoot, "catalog/hello.module.json"),
    { malformed: true }
  );
  const admission = await admitFixture(fixture);
  assert.equal(admission.kind, "refused");
  assert.equal(admission.code, "malformed_declaration");
  assert.equal(fixture.events.length, 0);
});

test("T-223 SDK invokes only GraphFunction and does not re-admit registry startup", async () => {
  const fixture = createFixture();
  const admission = await admitFixture(fixture);
  assert.equal(admission.kind, "accepted", JSON.stringify(admission));

  const overlayView = await abiogenesisPublicSdk.catalogAllow(
    fixture.context,
    envelope("abg.operation.catalog.allow", {
      workspaceId: WORKSPACE_ID,
      catalogId: admission.value.catalogId,
      handles: [OVERLAY_HANDLE]
    })
  );
  assert.equal(overlayView.kind, "accepted");
  const nonCallable = await abiogenesisPublicSdk.catalogInvoke(
    fixture.context,
    hostDescriptor(
      fixture,
      admission.value,
      overlayView.value,
      OVERLAY_HANDLE,
      "interface://fixture/overlay/v1"
    )
  );
  assert.equal(nonCallable.kind, "refused");
  assert.equal(nonCallable.code, "non_callable");

  const graphView = await abiogenesisPublicSdk.catalogAllow(
    fixture.context,
    envelope("abg.operation.catalog.allow", {
      workspaceId: WORKSPACE_ID,
      catalogId: admission.value.catalogId,
      handles: [GRAPH_HANDLE]
    })
  );
  assert.equal(graphView.kind, "accepted");
  const invalidInputDescriptor = hostDescriptor(
    fixture,
    admission.value,
    graphView.value,
    GRAPH_HANDLE,
    INTERFACE_REF
  );
  const beforeInvalidInput = fixture.events.length;
  const invalidInput = await abiogenesisPublicSdk.catalogInvoke(
    fixture.context,
    {
      ...invalidInputDescriptor,
      request: {
        ...invalidInputDescriptor.request,
        inputSchemaDigest: sha("5")
      }
    }
  );
  assert.equal(invalidInput.kind, "refused");
  assert.equal(invalidInput.code, "input_invalid");
  assert.equal(fixture.events.length, beforeInvalidInput);

  const malformedInlineDescriptor = hostDescriptor(
    fixture,
    admission.value,
    graphView.value,
    GRAPH_HANDLE,
    INTERFACE_REF
  );
  const malformedInline = await abiogenesisPublicSdk.catalogInvoke(
    fixture.context,
    {
      ...malformedInlineDescriptor,
      request: {
        ...malformedInlineDescriptor.request,
        input: { greeting: 42 }
      }
    }
  );
  assert.equal(malformedInline.kind, "refused");
  assert.equal(malformedInline.code, "input_invalid");
  assert.equal(fixture.events.length, beforeInvalidInput);

  const invalidInputRef = "/tmp/t223-sdk-invalid-input.json";
  fixture.records.set(invalidInputRef, { greeting: 42 });
  const inlineDescriptor = hostDescriptor(
    fixture,
    admission.value,
    graphView.value,
    GRAPH_HANDLE,
    INTERFACE_REF
  );
  const { input: ignoredRequestInput, ...requestWithoutInput } = inlineDescriptor.request;
  assert.deepEqual(ignoredRequestInput, { greeting: "world" });
  const malformedReferenced = await abiogenesisPublicSdk.catalogInvoke(
    fixture.context,
    {
      ...inlineDescriptor,
      request: {
        ...requestWithoutInput,
        inputRef: invalidInputRef
      }
    }
  );
  assert.equal(malformedReferenced.kind, "refused");
  assert.equal(malformedReferenced.code, "input_invalid");
  assert.equal(fixture.events.length, beforeInvalidInput);

  const beforeInvoke = fixture.events.length;
  const invoked = await abiogenesisPublicSdk.catalogInvoke(
    fixture.context,
    hostDescriptor(
      fixture,
      admission.value,
      graphView.value,
      GRAPH_HANDLE,
      INTERFACE_REF
    )
  );
  assert.equal(invoked.kind, "accepted", JSON.stringify(invoked));
  assert.equal(invoked.disposition, "converged");
  const invokeEvents = fixture.events.slice(beforeInvoke);
  const selectedIndex = invokeEvents.findIndex(
    (event) => event.kind === "graph_function_selected"
  );
  const graphCallIndex = invokeEvents.findIndex(
    (event) => event.kind === "graph_call_opened"
  );
  assert.notEqual(selectedIndex, -1);
  assert.notEqual(graphCallIndex, -1);
  assert.equal(selectedIndex < graphCallIndex, true);
  const selectedEvent = invokeEvents[selectedIndex];
  assert.equal(selectedEvent.kind, "graph_function_selected");
  assert.equal(selectedEvent.causationEventRefs.includes(ACTOR_REF), false);
  const invokeAttributionEvent = invokeEvents.find(
    (event) =>
      event.kind === "public_operation_admitted" &&
      event.operationId === "abg.operation.catalog.invoke"
  );
  assert.notEqual(invokeAttributionEvent, undefined);
  assert.equal(invokeAttributionEvent.actorRef, ACTOR_REF);
  assert.deepEqual(
    selectedEvent.causationEventRefs,
    [invokeAttributionEvent.eventId]
  );
  assert.equal(invoked.provenanceRefs.includes(ACTOR_REF), true);
  assert.equal(
    invokeEvents.some((event) => event.kind.startsWith("registry_entry_")),
    false
  );
  const ordinals = fixture.events.map((event) => event.eventAdmissionOrdinal);
  assert.equal(new Set(ordinals).size, ordinals.length);
  assert.deepEqual(ordinals, [...ordinals].sort((left, right) => left - right));
});

test("T-223 SDK keeps dispatch identity distinct from standard plugin identities", async () => {
  const livePluginRefs = [
    "plugin://abg/fp-dispatch-live",
    "plugin://abg/fp-evaluator-live"
  ];
  const fixture = createFixture({
    runtimeSystemProfile: {
      kind: "abg_runtime_system_profile",
      runtimeIdentity: {
        workerId: "worker:abg",
        backendId: "backend:abg",
        buildId: "build:abg",
        resolvedRuntimeRef: "runtime:abg:5.0.0"
      },
      resolvedPolicy: {
        resolvedPolicyBundleRef: "policy:abg:live",
        defaultRegime: "F_P",
        dispatchRef: "dispatch://abg/fp/live",
        approvalSubjectRef: null
      },
      standardPluginRefs: livePluginRefs,
      profileDigest: CONTRACT_DIGEST
    }
  });
  const admission = await admitFixture(fixture);
  assert.equal(admission.kind, "accepted", JSON.stringify(admission));
  const graphView = await abiogenesisPublicSdk.catalogAllow(
    fixture.context,
    envelope("abg.operation.catalog.allow", {
      workspaceId: WORKSPACE_ID,
      catalogId: admission.value.catalogId,
      handles: [GRAPH_HANDLE]
    })
  );
  assert.equal(graphView.kind, "accepted");
  const foreignCapabilityRef = "capability://t223/foreign-plugin";
  fixture.context.effects.operatorCapabilityFactories[foreignCapabilityRef] = () => ({
    kind: "live_capability_binding",
    projection: {
      kind: "live_capability_projection",
      capabilityRef: foreignCapabilityRef,
      capabilityDigest: sha("a"),
      executionContractDigest: sha("b"),
      agentKey: "codex",
      agentKeySource: "flag",
      executorProfile: "local-spawn",
      executorProfileSource: "flag",
      timeoutMs: 1000,
      timeoutMsSource: "flag",
      availableLivePluginRefs: ["plugin://foreign/fp-dispatch"]
    },
    pluginCapabilities: {}
  });
  const baseDescriptor = hostDescriptor(
    fixture,
    admission.value,
    graphView.value,
    GRAPH_HANDLE,
    INTERFACE_REF
  );
  const steering = {
    agent: "codex",
    model: null,
    profile: "local-spawn",
    timeoutMs: 1000
  };
  const beforeForeign = fixture.events.length;
  const foreign = await abiogenesisPublicSdk.catalogInvoke(fixture.context, {
    ...baseDescriptor,
    request: {
      ...baseDescriptor.request,
      requiredCapabilityRefs: [foreignCapabilityRef],
      transportSteering: steering
    }
  });
  assert.equal(foreign.kind, "refused");
  assert.equal(foreign.code, "preflight_failure");
  assert.equal(fixture.events.length, beforeForeign);
  const invoked = await abiogenesisPublicSdk.catalogInvoke(
    fixture.context,
    hostDescriptor(
      fixture,
      admission.value,
      graphView.value,
      GRAPH_HANDLE,
      INTERFACE_REF
    )
  );
  assert.equal(invoked.kind, "refused");
  assert.equal(invoked.code, "runtime_refused");
  assert.match(invoked.message, /regime binding/u);
  assert.equal(
    fixture.events.some((event) => event.kind === "graph_function_selected"),
    true
  );
});

test("T-223 catalog invoke derives instruction startup and reaches the standard fake transport", async (t) => {
  const capabilityRef = "abg.capability.catalog.invoke-graph-function@5";
  const callCountPath = path.join(WORKSPACE_ROOT, "fake-transport-calls.txt");
  await rm(WORKSPACE_ROOT, { recursive: true, force: true });
  await mkdir(WORKSPACE_ROOT, { recursive: true });
  t.after(() => rm(WORKSPACE_ROOT, { recursive: true, force: true }));
  const workerScript = [
    "const fs = require('node:fs');",
    `fs.appendFileSync(${JSON.stringify(callCountPath)}, 'called\\n');`,
    "const prompt = process.argv[1] ?? '';",
    "const output = prompt.includes('Run evaluate')",
    "  ? { accepted: true, assessmentIds: [] }",
    "  : {",
    "      edge: 'hello-input-to-output',",
    "      actor: 'fake-agent',",
    "      message: 'Hello, world!',",
    "      fulfillment_assessments: [{",
    "        id: 'instruction_response_admitted',",
    "        evaluator: 'instruction_response_admitted',",
    "        fulfillment_status: 'fulfilled',",
    "        fulfillment_detail: 'fake transport admitted',",
    "        blocking_reasons: [],",
    "        evidence_refs: ['evidence://t223/fake-transport']",
    "      }],",
    "      selected_worker_id: 'worker://t223/fake',",
    "      selected_backend: 'backend://node',",
    "      role_id: 'role://t223/fake',",
    "      assignment_source: 'policy_resolution',",
    "      resolved_runtime_ref: 'runtime://t223/fake'",
    "    };",
    "process.stdout.write(JSON.stringify(output));"
  ].join("\n");
  const fixture = createFixture({
    module: buildT223HelloWorldModule(),
    graphCapabilityRefs: [capabilityRef],
    runtimeSystemProfile: {
      kind: "abg_runtime_system_profile",
      runtimeIdentity: {
        workerId: "worker:abg",
        backendId: "backend:abg",
        buildId: "build:abg",
        resolvedRuntimeRef: "runtime:abg:5.0.0"
      },
      resolvedPolicy: {
        resolvedPolicyBundleRef: "policy:abg:live",
        defaultRegime: "F_P",
        dispatchRef: "dispatch://abg/fp/live",
        approvalSubjectRef: null
      },
      standardPluginRefs: [
        "plugin://abg/consensus/fp-dispatch-live",
        "plugin://abg/consensus/fp-evaluator",
        "plugin://abg/fp-dispatch-live",
        "plugin://abg/fp-evaluator-live"
      ],
      profileDigest: CONTRACT_DIGEST
    }
  });
  fixture.context.effects.operatorCapabilityFactories[capabilityRef] = ({
    workspaceRoot,
    archiveRoot,
    steering
  }) => {
    const capability = Object.freeze({
      agentContract: Object.freeze({
        agentKey: "generic",
        command: process.execPath,
        argsTemplate: Object.freeze(["-e", workerScript, "{prompt}"]),
        sanitizedEnvironmentPolicy: Object.freeze({ prefixes: Object.freeze([]) })
      }),
      archiveRoot,
      cwd: workspaceRoot,
      timeoutMs: steering.timeoutMs,
      executorProfile: steering.profile
    });
    return constructLiveCapabilityBinding({
      workspaceRoot,
      agentKey: "generic",
      agentKeySource: "flag",
      executorProfile: steering.profile,
      executorProfileSource: "flag",
      timeoutMs: steering.timeoutMs,
      timeoutMsSource: "flag",
      pluginCapabilities: Object.freeze({
        liveFpDispatch: capability,
        liveFpEvaluator: capability
      })
    });
  };
  const admission = await admitFixture(fixture);
  assert.equal(admission.kind, "accepted", JSON.stringify(admission));
  const graphView = await abiogenesisPublicSdk.catalogAllow(
    fixture.context,
    envelope("abg.operation.catalog.allow", {
      workspaceId: WORKSPACE_ID,
      catalogId: admission.value.catalogId,
      handles: [GRAPH_HANDLE]
    })
  );
  assert.equal(graphView.kind, "accepted", JSON.stringify(graphView));
  const invocation = hostDescriptor(
    fixture,
    admission.value,
    graphView.value,
    GRAPH_HANDLE,
    INTERFACE_REF
  );
  const beforeInvoke = fixture.events.length;
  const result = await abiogenesisPublicSdk.catalogInvoke(fixture.context, {
    ...invocation,
    request: {
      ...invocation.request,
      requiredCapabilityRefs: [capabilityRef],
      transportSteering: {
        agent: "generic",
        model: null,
        profile: "local-spawn",
        timeoutMs: 30000
      }
    }
  });
  const invokeEvents = fixture.events.slice(beforeInvoke);
  const callCount = (await readFile(callCountPath, "utf8"))
    .trim()
    .split("\n")
    .filter(Boolean).length;
  assert.equal(callCount, 2);
  assert.equal(result.kind, "accepted", JSON.stringify(result));
  assert.equal(result.disposition, "blocked", JSON.stringify(result));
  assert.match(result.value.result.terminalReason, /assurance_block/u);
  assert.equal(
    invokeEvents.filter(
      (event) => event.kind === "instruction_prompt_manifest_projected"
    ).length,
    2
  );
  const archiveEntries = await readdir(
    path.join(WORKSPACE_ROOT, ".ai-workspace/archives/by-c-call")
  );
  const prompts = await Promise.all(
    archiveEntries.map((entry) =>
      readFile(
        path.join(
          WORKSPACE_ROOT,
          ".ai-workspace/archives/by-c-call",
          entry,
          "prompt.txt"
        ),
        "utf8"
      )
    )
  );
  const transformPrompt = prompts.find((prompt) =>
    prompt.includes("Run transform")
  );
  const evaluatePrompt = prompts.find((prompt) =>
    prompt.includes("Run evaluate")
  );
  assert.notEqual(transformPrompt, undefined);
  assert.match(transformPrompt, /Standard live dispatch response protocol:/u);
  assert.match(transformPrompt, /Expected assessment ids derived from this vector: \[\]/u);
  assert.match(transformPrompt, /identity are ABG-owned/u);
  assert.doesNotMatch(transformPrompt, /selected_worker_id/u);
  assert.match(transformPrompt, /slot: input_asset/u);
  assert.match(transformPrompt, /contentRef: fixture\.schema\.hello/u);
  assert.match(transformPrompt, /contentExcerpt: "\{\\"greeting\\":\\"world\\"\}"/u);
  assert.notEqual(evaluatePrompt, undefined);
  assert.match(evaluatePrompt, /Standard live review response protocol:/u);
  assert.match(evaluatePrompt, /assessmentIds must equal the expected ids derived from this vector: \[\]/u);
  assert.equal(
    invokeEvents.some(
      (event) => event.kind.startsWith("registry_entry_")
    ),
    false
  );
  const selected = invokeEvents.find(
    (event) => event.kind === "graph_function_selected"
  );
  assert.equal(selected?.selectedEntryRef, GRAPH_HANDLE);
  const actorStarted = invokeEvents.find(
    (event) => event.kind === "actor_invocation_started"
  );
  const targetPayload = invokeEvents.find(
    (event) =>
      event.kind === "payload_observed" &&
      event.payloadClass === "hellooutput"
  );
  assert.notEqual(actorStarted, undefined);
  assert.equal(targetPayload?.producerRef, actorStarted?.workerId);
  assert.notEqual(targetPayload?.producerRef, "worker://t223/fake");
  assert.equal(targetPayload?.schemaRef, null);
  const admittedArtifact = result.value.admittedArtifact;
  assert.notEqual(admittedArtifact, undefined);
  assert.equal(admittedArtifact.body.message, "Hello, world!");
  assert.equal(admittedArtifact.contractRef, targetPayload?.contractRef);
  assert.equal(admittedArtifact.schemaRef, targetPayload?.schemaRef);
  const observedArtifact = invokeEvents.find(
    (event) =>
      event.kind === "actor_result_artifact_observed" &&
      event.resultRef === admittedArtifact.resultRef
  );
  assert.equal(admittedArtifact.artifactRef, observedArtifact?.artifactRef);
  assert.equal(
    admittedArtifact.artifactDigest,
    observedArtifact?.artifactContentDigest
  );
  const responseAdmission = invokeEvents.find(
    (event) =>
      event.kind === "instruction_response_contract_admitted" &&
      event.resultRef === admittedArtifact.resultRef
  );
  assert.equal(admittedArtifact.outputContractRefs.length > 0, true);
  assert.deepEqual(
    admittedArtifact.outputContractRefs,
    responseAdmission?.outputContractRefs
  );
  const reread = await abiogenesisPublicSdk.readResult(
    fixture.context,
    envelope("abg.operation.read.result", {
      workspaceId: WORKSPACE_ID,
      graphCallId: result.value.graphCallId
    })
  );
  assert.equal(reread.kind, "accepted", JSON.stringify(reread));
  assert.deepEqual(reread.value.admittedArtifact, admittedArtifact);
  const withoutPayloadAdmission = projectRuntimePublicResult({
    replay: {
      kind: "admitted_workspace_replay",
      orderedEvents: invokeEvents.filter(
        (event) => event.kind !== "payload_validated"
      )
    },
    graphCallId: result.value.graphCallId
  });
  assert.equal(withoutPayloadAdmission?.admittedArtifact, undefined);
});

test("T-223 capability construction failure is typed preflight before GraphCall", async () => {
  const capabilityRef = "abg.capability.catalog.invoke-graph-function@5";
  const fixture = createFixture({
    module: buildT223HelloWorldModule(),
    graphCapabilityRefs: [capabilityRef],
    runtimeSystemProfile: {
      kind: "abg_runtime_system_profile",
      runtimeIdentity: {
        workerId: "worker:abg",
        backendId: "backend:abg",
        buildId: "build:abg",
        resolvedRuntimeRef: "runtime:abg:5.0.0"
      },
      resolvedPolicy: {
        resolvedPolicyBundleRef: "policy:abg:live",
        defaultRegime: "F_P",
        dispatchRef: "dispatch://abg/fp/live",
        approvalSubjectRef: null
      },
      standardPluginRefs: [
        "plugin://abg/fp-dispatch-live",
        "plugin://abg/fp-evaluator-live"
      ],
      profileDigest: CONTRACT_DIGEST
    }
  });
  fixture.context.effects.operatorCapabilityFactories[capabilityRef] = () => {
    throw new TypeError("live transport command is unavailable: missing-worker");
  };
  const admission = await admitFixture(fixture);
  assert.equal(admission.kind, "accepted", JSON.stringify(admission));
  const graphView = await abiogenesisPublicSdk.catalogAllow(
    fixture.context,
    envelope("abg.operation.catalog.allow", {
      workspaceId: WORKSPACE_ID,
      catalogId: admission.value.catalogId,
      handles: [GRAPH_HANDLE]
    })
  );
  assert.equal(graphView.kind, "accepted", JSON.stringify(graphView));
  const invocation = hostDescriptor(
    fixture,
    admission.value,
    graphView.value,
    GRAPH_HANDLE,
    INTERFACE_REF
  );
  const beforeInvoke = fixture.events.length;
  const result = await abiogenesisPublicSdk.catalogInvoke(fixture.context, {
    ...invocation,
    request: {
      ...invocation.request,
      requiredCapabilityRefs: [capabilityRef],
      transportSteering: {
        agent: "generic",
        model: null,
        profile: "local-spawn",
        timeoutMs: 30000
      }
    }
  });
  assert.equal(result.kind, "refused");
  assert.equal(result.code, "preflight_failure");
  assert.match(result.message, /missing-worker/u);
  assert.equal(fixture.events.length, beforeInvoke);
});

test("T-223 pre-machine plugin refusal preserves store ordinal monotonicity", async () => {
  const fixture = createFixture();
  const admission = await admitFixture(fixture);
  assert.equal(admission.kind, "accepted", JSON.stringify(admission));
  const priorMax = Math.max(
    ...fixture.events.map((event) => event.eventAdmissionOrdinal)
  );
  const result = await runEngineStartAsync({
    startIntent: {
      scope: {
        kind: "workspace",
        workspaceRoot: WORKSPACE_ROOT,
        moduleName: fixtureModule().name
      },
      target: {
        kind: "graph_function",
        handle: GRAPH_HANDLE
      },
      until: "converged",
      inputBindings: []
    },
    module: fixtureModule(),
    runtimeIdentity: {
      workerId: "worker:t223-ordinal",
      backendId: "backend:t223-ordinal",
      buildId: "build:t223-ordinal",
      resolvedRuntimeRef: "runtime:t223-ordinal"
    },
    resolvedPolicy: {
      resolvedPolicyBundleRef: "policy:t223-ordinal",
      defaultRegime: "F_D",
      dispatchRef: null,
      approvalSubjectRef: null
    },
    runtimeEvents: fixture.events,
    eventSink: fixture.context.effects.createRuntimeEventSink(),
    plugins: {
      handlerRegistry: {
        kind: "malformed_handler_registry"
      }
    }
  });
  assert.equal(result.transition.kind, "terminal");
  const laterEvents = fixture.events.filter(
    (event) => event.eventAdmissionOrdinal > priorMax
  );
  assert.equal(
    laterEvents.some((event) => event.kind === "runtime_failure_observed"),
    true
  );
  assert.equal(
    laterEvents.every((event) => event.eventAdmissionOrdinal > priorMax),
    true
  );
  const ordinals = fixture.events.map((event) => event.eventAdmissionOrdinal);
  assert.equal(new Set(ordinals).size, ordinals.length);
  assert.deepEqual(ordinals, [...ordinals].sort((left, right) => left - right));
});

test("T-223 SDK reads typed result and bounded replay projections", async () => {
  const fixture = createFixture();
  const admission = await admitFixture(fixture);
  assert.equal(admission.kind, "accepted", JSON.stringify(admission));
  const graphView = await abiogenesisPublicSdk.catalogAllow(
    fixture.context,
    envelope("abg.operation.catalog.allow", {
      workspaceId: WORKSPACE_ID,
      catalogId: admission.value.catalogId,
      handles: [GRAPH_HANDLE]
    })
  );
  assert.equal(graphView.kind, "accepted");
  const invoked = await abiogenesisPublicSdk.catalogInvoke(
    fixture.context,
    hostDescriptor(
      fixture,
      admission.value,
      graphView.value,
      GRAPH_HANDLE,
      INTERFACE_REF
    )
  );
  assert.equal(invoked.kind, "accepted", JSON.stringify(invoked));

  const result = await abiogenesisPublicSdk.readResult(
    fixture.context,
    envelope("abg.operation.read.result", {
      workspaceId: WORKSPACE_ID,
      graphCallId: invoked.value.graphCallId
    })
  );
  assert.equal(
    result.kind,
    "accepted",
    JSON.stringify({
      result,
      events: fixture.events.map((event) => [
        event.eventAdmissionOrdinal,
        event.kind,
        event.eventId
      ])
    })
  );
  assert.equal(result.value.graphCallId, invoked.value.graphCallId);
  assert.equal(result.value.disposition, "converged");
  assert.equal(result.value.replayRefs.length > 0, true);

  const replay = await abiogenesisPublicSdk.readReplay(
    fixture.context,
    envelope("abg.operation.read.replay", {
      workspaceId: WORKSPACE_ID,
      subject: {
        kind: "graph_call",
        graphCallId: invoked.value.graphCallId
      },
      fromOrdinal: 0,
      limit: 3
    })
  );
  assert.equal(replay.kind, "accepted");
  assert.equal(replay.value.events.length > 0, true);
  assert.equal(replay.value.events.length <= 3, true);
  assert.equal(replay.value.returnedThroughOrdinal !== null, true);
});

test("T-223 result projection collapses retry opens and excludes sibling GraphCall facts", () => {
  const canonical = (event, ordinal) => ({
    ...event,
    eventId: `event://t223-sdk/${ordinal}`,
    eventTime: new Date(ordinal).toISOString(),
    eventTimeUnixMs: ordinal,
    eventAdmissionOrdinal: ordinal
  });
  const events = [
    canonical({
      kind: "graph_call_opened",
      basisId: "basis://shared",
      graphCallId: "graph-call://a",
      graphFunctionId: GRAPH_HANDLE,
      jobId: "job://fixture",
      runId: "run://shared",
      workKey: null
    }, 0),
    canonical({
      kind: "graph_call_opened",
      basisId: "basis://shared",
      graphCallId: "graph-call://b",
      graphFunctionId: GRAPH_HANDLE,
      jobId: "job://fixture",
      runId: "run://shared",
      workKey: null
    }, 1),
    canonical({
      kind: "leaf_task_completed",
      basisId: "basis://shared",
      leafTaskId: "leaf://a",
      runId: "run://shared",
      graphCallId: "graph-call://a",
      frameId: "frame://a",
      vectorIndex: 0,
      edge: "edge://a",
      outputSchemaRef: "schema://output",
      resultRef: "result://a",
      outputPayloadRef: "payload://a"
    }, 2),
    canonical({
      kind: "leaf_task_completed",
      basisId: "basis://shared",
      leafTaskId: "leaf://b",
      runId: "run://shared",
      graphCallId: "graph-call://b",
      frameId: "frame://b",
      vectorIndex: 0,
      edge: "edge://b",
      outputSchemaRef: "schema://output",
      resultRef: "result://b",
      outputPayloadRef: "payload://b"
    }, 3),
    canonical({
      kind: "graph_call_opened",
      basisId: "basis://shared",
      graphCallId: "graph-call://a",
      graphFunctionId: GRAPH_HANDLE,
      jobId: "job://fixture",
      runId: "run://shared",
      workKey: null
    }, 4),
    canonical({
      kind: "terminal_reached",
      basisId: "basis://shared",
      terminalKind: "converged",
      reason: "complete"
    }, 5)
  ];
  const replay = admitWorkspaceRuntimeEventBytes(
    new TextEncoder().encode(events.map((event) => JSON.stringify(event)).join("\n"))
  );
  const result = projectRuntimePublicResult({
    replay,
    graphCallId: "graph-call://a"
  });
  assert.notEqual(result, null);
  assert.equal(result.resultId, "result://a");
  assert.equal(result.replayRefs.includes("event://t223-sdk/3"), false);
});
