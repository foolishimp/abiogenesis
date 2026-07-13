// Validates: REQ-P-CATALOG
// Validates: REQ-P-INSTALL
// Validates: REQ-P-POLICY
// Validates: REQ-P-PUBLIC-CONTRACTS
// Validates: T-223

import assert from "node:assert/strict";
import test from "node:test";

import {
  DS1_PUBLIC_OPERATION_IDS,
  admitCatalogContributionManifest,
  admitCatalogContributionRow,
  admitCatalogProductDescriptor,
  admitDs1OperationRequest,
  admitHostInvocationDescriptor,
  admitIJsonText,
  admitProductRequirement,
  admitProductToolchainManifest,
  admitProductVerificationRecord,
  admitPublicCatalogRow,
  admitPublicContractCatalog,
  admitPublicContractRow,
  admitPublicOperationInvocationEnvelope,
  admitPublicSdkWorkspaceManifest,
  admitPublicSessionCatalogView,
  admitResolvedProductLock,
  admitToolchainWorkspaceBindingV3,
  admitVerifiedProductArtifact,
  canonicalizeIJson,
  digestCanonicalIJson,
  parsePublicOperationInvocationEnvelope,
  parsePublicOperationInvocationText,
  resolvePublicOperationContract
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  stableJson,
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";

function sha(character) {
  return `sha256:${character.repeat(64)}`;
}

const CONTRACT_DIGEST = sha("a");
const CATALOG_DIGEST = sha("b");
const CATALOG_SCHEMA_DIGEST = sha("c");
const ARTIFACT_DIGEST = sha("d");
const CONTRIBUTION_DIGEST = sha("f");
const DESCRIPTOR_DIGEST = sha("1");
const LOCK_DIGEST = sha("2");
const MANIFEST_DIGEST = sha("3");
const INPUT_SCHEMA_DIGEST = sha("4");
const PRODUCT_SET_DIGEST = sha("5");
const WORKSPACE_MANIFEST_DIGEST = sha("6");
const BINDING_DIGEST = sha("7");
const HANDLE = "graph-function://example/hello";
const PRODUCT_ID = "example.hello";
const PRODUCT_VERSION = "1.0.0";
const WORKSPACE_ID = "workspace:t223";
const CATALOG_ID = "catalog:t223";
const BINDING_ID = "binding:t223";
const LOCK_ID = "lock:t223";
const ACTOR_REF = "actor:t223";
const RUNTIME_CATALOG_PROJECTION_REF = "runtime-catalog-projection:t223";
const RUNTIME_ENTRY_REF = "catalog-entry://example/hello";
const PRODUCT_CONTENT_INVENTORY = Object.freeze([
  Object.freeze({
    relativePath: "catalog/hello.module.json",
    digest: CONTRACT_DIGEST
  }),
  Object.freeze({
    relativePath: "contracts/public-contract-catalog.json",
    digest: CATALOG_DIGEST
  })
]);
const CONTENT_DIGEST = digestCanonicalIJson(
  PRODUCT_CONTENT_INVENTORY.map((row) => [row.relativePath, row.digest])
);

function effectiveSessionViewId(allowedEntryRefs = [RUNTIME_ENTRY_REF]) {
  return `registry-session-view:${digestCanonicalIJson({
    catalogId: CATALOG_ID,
    catalogProjectionRef: RUNTIME_CATALOG_PROJECTION_REF,
    allowedEntryRefs: [...allowedEntryRefs].sort()
  })}`;
}

function publicContractRow() {
  return {
    contractId: "abg.contract.example.hello",
    contractKind: "native_contract",
    owningProductId: PRODUCT_ID,
    version: PRODUCT_VERSION,
    digest: CONTRACT_DIGEST,
    authorityRefs: ["REQ-P-PUBLIC-CONTRACTS"],
    capabilityRefs: [],
    nativeLocator: {
      kind: "native",
      packageName: "@example/hello",
      packageExport: "./catalog",
      symbols: ["helloGraphFunction"]
    },
    assetLocator: null,
    operationContract: null
  };
}

function publicContractCatalog() {
  return {
    kind: "abg_public_contract_catalog",
    schemaVersion: 1,
    catalogId: "abg.public-contracts.ds1",
    catalogVersion: PRODUCT_VERSION,
    catalogDigest: CATALOG_DIGEST,
    catalogSchemaPath: "contracts/schemas/public-contract-catalog.schema.json",
    catalogSchemaDigest: CATALOG_SCHEMA_DIGEST,
    profile: "catalog-product-v1",
    rows: [publicContractRow()]
  };
}

function productManifest() {
  return {
    kind: "abg_product_toolchain_manifest",
    schemaVersion: 1,
    publisher: "example",
    productId: PRODUCT_ID,
    packageName: "@example/hello",
    packageVersion: PRODUCT_VERSION,
    productContentDigest: CONTENT_DIGEST,
    publicContractCatalogPath: "contracts/public-contract-catalog.json",
    publicContractCatalogDigest: CATALOG_DIGEST,
    publicContractCatalog: publicContractCatalog(),
    runtimeSystemProfile: null,
    productRelativeLocators: [
      "contracts/public-contract-catalog.json",
      "catalog/hello.module.json"
    ]
  };
}

function runtimeSystemProfile() {
  return {
    kind: "abg_runtime_system_profile",
    runtimeIdentity: {
      workerId: "worker:abg",
      backendId: "backend:abg",
      buildId: "build:abg",
      resolvedRuntimeRef: "runtime:abg"
    },
    resolvedPolicy: {
      resolvedPolicyBundleRef: "policy:abg",
      defaultRegime: "F_D",
      dispatchRef: null,
      approvalSubjectRef: null
    },
    standardPluginRefs: [],
    profileDigest: CONTRACT_DIGEST
  };
}

function requirement() {
  return {
    productId: PRODUCT_ID,
    versionConstraint: PRODUCT_VERSION,
    requiredContractRefs: ["abg.contract.example.hello"],
    requiredCapabilityRefs: []
  };
}

function descriptor() {
  return {
    kind: "catalog_product_descriptor",
    schemaVersion: 1,
    descriptorId: "descriptor:example.hello:1.0.0",
    descriptorDigest: DESCRIPTOR_DIGEST,
    publisher: "example",
    productId: PRODUCT_ID,
    packageName: "@example/hello",
    version: PRODUCT_VERSION,
    distributionArtifactDigest: ARTIFACT_DIGEST,
    productContentDigest: CONTENT_DIGEST,
    contributionManifestId: "contribution:example.hello:1.0.0",
    contributionManifestDigest: CONTRIBUTION_DIGEST,
    dependencies: [],
    abgCompatibility: ">=4.6.0-rc.3 <6.0.0-0",
    contractRefs: ["abg.contract.example.hello"],
    capabilityRefs: [],
    provenanceRefs: ["publisher:example"]
  };
}

function contributionRow() {
  return {
    canonicalHandle: HANDLE,
    publicKind: "graph_function",
    ownerProductId: PRODUCT_ID,
    ownerVersion: PRODUCT_VERSION,
    declarationRef: "declaration:example.hello",
    contractRef: "abg.contract.example.hello",
    interfaceRef: "interface:example.hello.v1",
    locator: {
      kind: "module_declaration",
      modulePath: "catalog/hello.module.json",
      moduleDigest: CONTRACT_DIGEST,
      declarationRef: "declaration:example.hello"
    },
    compatibility: {
      abgVersionRange: ">=4.6.0-rc.3 <6.0.0-0",
      requiredProductRefs: [],
      requiredContractRefs: ["abg.contract.example.hello"],
      requiredCapabilityRefs: []
    },
    readinessRefs: ["ready:example.hello"],
    proofRefs: ["proof:example.hello"],
    policyRefs: [],
    capabilityRefs: [],
    provenanceRefs: ["publisher:example"],
    refinementOfHandle: null,
    overrideOfHandle: null
  };
}

function contributionManifest() {
  return {
    kind: "catalog_contribution_manifest",
    schemaVersion: 1,
    contributionId: "contribution:example.hello:1.0.0",
    contributionDigest: CONTRIBUTION_DIGEST,
    descriptorId: "descriptor:example.hello:1.0.0",
    descriptorDigest: DESCRIPTOR_DIGEST,
    productId: PRODUCT_ID,
    productVersion: PRODUCT_VERSION,
    artifactDigest: ARTIFACT_DIGEST,
    rows: [contributionRow()]
  };
}

function resolvedLock() {
  return {
    kind: "resolved_product_lock",
    schemaVersion: 1,
    lockId: LOCK_ID,
    lockDigest: LOCK_DIGEST,
    requirements: [requirement()],
    products: [
      {
        publisher: "example",
        productId: PRODUCT_ID,
        version: PRODUCT_VERSION,
        descriptorId: "descriptor:example.hello:1.0.0",
        descriptorDigest: DESCRIPTOR_DIGEST,
        contributionId: "contribution:example.hello:1.0.0",
        contributionDigest: CONTRIBUTION_DIGEST,
        artifactDigest: ARTIFACT_DIGEST,
        productContentDigest: CONTENT_DIGEST
      }
    ],
    dependencyEdges: [],
    compatibility: [
      { productId: PRODUCT_ID, compatible: true, reason: null }
    ]
  };
}

function suppliedArtifact() {
  return {
    format: "npm_package_tgz",
    artifactPath: "/tmp/example-hello-1.0.0.tgz",
    expectedArtifactDigest: ARTIFACT_DIGEST,
    expectedProductContentDigest: CONTENT_DIGEST
  };
}

function verifiedArtifact() {
  return {
    kind: "verified_product_artifact",
    artifact: suppliedArtifact(),
    descriptor: descriptor(),
    contributionManifest: contributionManifest(),
    productManifest: productManifest(),
    resolvedLock: resolvedLock(),
    productContentInventory: PRODUCT_CONTENT_INVENTORY,
    verificationChecks: [
      {
        field: "artifactDigest",
        accepted: true,
        expected: ARTIFACT_DIGEST,
        actual: ARTIFACT_DIGEST
      }
    ],
    verifiedAt: "2026-07-11T00:00:00Z"
  };
}

function installedProductRecord() {
  return {
    kind: "installed_product_record",
    schemaVersion: 1,
    installedProductId: "installed:example.hello:1.0.0",
    publisher: "example",
    productId: PRODUCT_ID,
    packageName: "@example/hello",
    version: PRODUCT_VERSION,
    artifactDigest: ARTIFACT_DIGEST,
    productContentDigest: CONTENT_DIGEST,
    installedRoot: "/tmp/toolchain/products/example.hello/1.0.0",
    productRoot: "/tmp/toolchain/products/example.hello/1.0.0/product",
    packageRoot: "/tmp/toolchain/products/example.hello/1.0.0/product/package",
    manifestPath: "/tmp/toolchain/products/example.hello/1.0.0/product/product-toolchain-manifest.json",
    manifestDigest: MANIFEST_DIGEST,
    descriptorId: "descriptor:example.hello:1.0.0",
    descriptorDigest: DESCRIPTOR_DIGEST,
    contributionId: "contribution:example.hello:1.0.0",
    contributionDigest: CONTRIBUTION_DIGEST,
    compatibilityRange: ">=4.6.0-rc.3 <6.0.0-0",
    compatibility: { productId: PRODUCT_ID, compatible: true, reason: null },
    commandRefs: [],
    publicContractCatalogId: "abg.public-contracts.ds1",
    publicContractCatalogVersion: PRODUCT_VERSION,
    publicContractCatalogDigest: CATALOG_DIGEST,
    descriptorRecordPath: "/tmp/toolchain/records/example/hello/descriptor.json",
    contributionRecordPath: "/tmp/toolchain/records/example/hello/contribution.json",
    lockRecordPath: "/tmp/toolchain/records/example/hello/lock.json",
    provenanceRefs: ["publisher:example"]
  };
}

function mutableStateRoots() {
  return {
    observedWorkspaceRoot: "/tmp/workspace",
    observerStateRoot: "/tmp/workspace/.ai-workspace/observer",
    executorStateRoot: "/tmp/workspace/.ai-workspace/executor",
    eventRoot: "/tmp/workspace/.ai-workspace/events",
    eventLogPath: "/tmp/workspace/.ai-workspace/events/runtime.jsonl",
    runtimeRoot: "/tmp/workspace/.ai-workspace/runtime",
    projectionRoot: "/tmp/workspace/.ai-workspace/projections",
    archiveRoot: "/tmp/workspace/.ai-workspace/archives"
  };
}

function productBinding() {
  const record = installedProductRecord();
  return {
    installedProductId: record.installedProductId,
    publisher: record.publisher,
    productId: record.productId,
    packageName: record.packageName,
    version: record.version,
    productContentDigest: record.productContentDigest,
    descriptorId: record.descriptorId,
    descriptorDigest: record.descriptorDigest,
    contributionId: record.contributionId,
    contributionDigest: record.contributionDigest,
    artifactDigest: record.artifactDigest,
    installedRoot: record.installedRoot,
    productRoot: record.productRoot,
    packageRoot: record.packageRoot,
    manifestPath: record.manifestPath,
    manifestDigest: record.manifestDigest,
    compatibilityRange: record.compatibilityRange,
    compatibility: record.compatibility,
    commandRefs: record.commandRefs,
    publicContractCatalogId: record.publicContractCatalogId,
    publicContractCatalogVersion: record.publicContractCatalogVersion,
    publicContractCatalogDigest: record.publicContractCatalogDigest
  };
}

function workspaceBinding() {
  return {
    kind: "abg_toolchain_workspace_binding",
    schemaVersion: "3",
    bindingId: BINDING_ID,
    bindingDigest: BINDING_DIGEST,
    workspaceId: WORKSPACE_ID,
    workspaceManifestDigest: WORKSPACE_MANIFEST_DIGEST,
    targetRoot: "/tmp/workspace",
    toolchainRoot: "/tmp/toolchain",
    resolvedLockId: LOCK_ID,
    resolvedLockDigest: LOCK_DIGEST,
    productSetDigest: PRODUCT_SET_DIGEST,
    productBindingRefs: ["installed:example.hello:1.0.0"],
    products: [productBinding()],
    mutableStateRoots: mutableStateRoots(),
    provenanceRefs: [ACTOR_REF]
  };
}

function publicCatalogRow() {
  return {
    canonicalHandle: HANDLE,
    runtimeEntryRef: RUNTIME_ENTRY_REF,
    kind: "graph_function",
    ownerProductId: PRODUCT_ID,
    ownerVersion: PRODUCT_VERSION,
    descriptorId: "descriptor:example.hello:1.0.0",
    contributionId: "contribution:example.hello:1.0.0",
    artifactDigest: ARTIFACT_DIGEST,
    resolvedLockId: LOCK_ID,
    compatible: true,
    ready: true,
    readinessBlockers: [],
    eligible: true,
    callable: true,
    sessionVisible: true,
    contractRef: "abg.contract.example.hello",
    schemaRefs: ["schema:example.hello.input"],
    provenanceRefs: ["publisher:example"]
  };
}

function sessionView() {
  return {
    kind: "public_session_catalog_view",
    workspaceId: WORKSPACE_ID,
    catalogId: CATALOG_ID,
    catalogVersion: PRODUCT_VERSION,
    catalogDigest: CATALOG_DIGEST,
    runtimeCatalogProjectionRef: RUNTIME_CATALOG_PROJECTION_REF,
    effectiveSessionViewId: effectiveSessionViewId(),
    allowedHandles: [HANDLE],
    allowedEntryRefs: [RUNTIME_ENTRY_REF],
    rows: [publicCatalogRow()]
  };
}

function invokeRequest() {
  return {
    workspaceId: WORKSPACE_ID,
    bindingId: BINDING_ID,
    resolvedLockId: LOCK_ID,
    catalogId: CATALOG_ID,
    catalogVersion: PRODUCT_VERSION,
    catalogDigest: CATALOG_DIGEST,
    allowedHandles: [HANDLE],
    graphFunctionHandle: HANDLE,
    interfaceRef: "interface:example.hello.v1",
    inputId: "input:t223",
    inputSchemaId: "schema:example.hello.input",
    inputSchemaVersion: PRODUCT_VERSION,
    inputSchemaDigest: INPUT_SCHEMA_DIGEST,
    input: { greeting: "world" },
    requiredCapabilityRefs: [],
    actorRef: ACTOR_REF,
    transportSteering: null
  };
}

function requestFixtures() {
  return new Map([
    [
      "abg.operation.workspace.create",
      { targetRoot: "/tmp/workspace", authorityMode: "clean_no_project_authority" }
    ],
    ["abg.operation.workspace.open", { targetRoot: "/tmp/workspace" }],
    [
      "abg.operation.catalog.resolve",
      { requirements: [requirement()], candidateDescriptors: [descriptor()] }
    ],
    [
      "abg.operation.catalog.verify",
      {
        artifact: suppliedArtifact(),
        descriptor: descriptor(),
        contributionManifest: contributionManifest(),
        resolvedLock: resolvedLock()
      }
    ],
    ["abg.operation.install.install", { verifiedArtifact: verifiedArtifact() }],
    [
      "abg.operation.catalog.bind",
      {
        workspaceId: WORKSPACE_ID,
        workspaceManifestDigest: WORKSPACE_MANIFEST_DIGEST,
        resolvedLock: resolvedLock(),
        installedProductRecords: [installedProductRecord()]
      }
    ],
    [
      "abg.operation.catalog.admit",
      {
        workspaceId: WORKSPACE_ID,
        bindingId: BINDING_ID,
        resolvedLockId: LOCK_ID,
        productSetDigest: PRODUCT_SET_DIGEST
      }
    ],
    [
      "abg.operation.catalog.list",
      { workspaceId: WORKSPACE_ID, catalogId: CATALOG_ID }
    ],
    [
      "abg.operation.catalog.describe",
      { workspaceId: WORKSPACE_ID, catalogId: CATALOG_ID, handle: HANDLE }
    ],
    [
      "abg.operation.catalog.allow",
      { workspaceId: WORKSPACE_ID, catalogId: CATALOG_ID, handles: [] }
    ],
    ["abg.operation.catalog.invoke", invokeRequest()],
    ...[
      "abg.operation.fh.select",
      "abg.operation.fh.approve",
      "abg.operation.fh.reject",
      "abg.operation.fh.assess",
      "abg.operation.fh.answer-escalation"
    ].map((operationId) => [
      operationId,
      {
        workspaceId: WORKSPACE_ID,
        interactionRef: "abg://fh-interaction/t223",
        interactionBasisDigest: CONTRACT_DIGEST,
        responseContractRef: "contract://t223/fh-response",
        choiceRef:
          operationId === "abg.operation.fh.select"
            ? "choice://t223/selected"
            : null,
        value: { kind: "t223_fh_response" },
        evidenceRefs: ["evidence://t223/fh-response"],
        capabilityRefs: [],
        capabilityProvenanceRefs: []
      }
    ]),
    [
      "abg.operation.run.resume",
      {
        workspaceId: WORKSPACE_ID,
        interactionRef: "abg://fh-interaction/t223",
        interactionBasisDigest: CONTRACT_DIGEST,
        responseRef: "abg://fh-response/t223",
        continuationRef: "abg://fh-continuation/t223"
      }
    ],
    [
      "abg.operation.read.result",
      { workspaceId: WORKSPACE_ID, graphCallId: "graph-call:t223" }
    ],
    [
      "abg.operation.read.replay",
      {
        workspaceId: WORKSPACE_ID,
        subject: { kind: "workspace", workspaceId: WORKSPACE_ID }
      }
    ]
  ]);
}

function operationContractRow(operationId) {
  const slug = operationId.slice("abg.operation.".length);
  const invocationSchemaId = "abg.schema.public-operation-invocation";
  const actorPolicy = new Set([
    "abg.operation.workspace.create",
    "abg.operation.install.install",
    "abg.operation.catalog.bind",
    "abg.operation.catalog.admit",
    "abg.operation.catalog.invoke",
    "abg.operation.fh.select",
    "abg.operation.fh.approve",
    "abg.operation.fh.reject",
    "abg.operation.fh.assess",
    "abg.operation.fh.answer-escalation",
    "abg.operation.run.resume"
  ]).has(operationId)
    ? "required"
    : "forbidden";
  const effectClassByOperation = {
    "abg.operation.workspace.create": "workspace_manifest_write",
    "abg.operation.workspace.open": "none",
    "abg.operation.catalog.resolve": "product_resolution",
    "abg.operation.catalog.verify": "temporary_artifact_read",
    "abg.operation.install.install": "immutable_product_install",
    "abg.operation.catalog.bind": "workspace_binding_write",
    "abg.operation.catalog.admit": "runtime_catalog_admission",
    "abg.operation.catalog.list": "runtime_catalog_projection",
    "abg.operation.catalog.describe": "runtime_catalog_projection",
    "abg.operation.catalog.allow": "runtime_session_projection",
    "abg.operation.catalog.invoke": "runtime_graph_function_invoke",
    "abg.operation.fh.select": "runtime_fh_response_admission",
    "abg.operation.fh.approve": "runtime_fh_response_admission",
    "abg.operation.fh.reject": "runtime_fh_response_admission",
    "abg.operation.fh.assess": "runtime_fh_response_admission",
    "abg.operation.fh.answer-escalation": "runtime_fh_response_admission",
    "abg.operation.run.resume": "runtime_resume_admission",
    "abg.operation.read.result": "runtime_result_projection",
    "abg.operation.read.replay": "runtime_replay_projection"
  };
  const terminalDispositionsByOperation = {
    "abg.operation.workspace.create": ["created"],
    "abg.operation.workspace.open": ["ready", "unbound"],
    "abg.operation.catalog.resolve": ["resolved"],
    "abg.operation.catalog.verify": ["verified"],
    "abg.operation.install.install": ["installed", "already_installed_exact"],
    "abg.operation.catalog.bind": ["bound", "already_bound_exact"],
    "abg.operation.catalog.admit": ["admitted"],
    "abg.operation.catalog.list": ["listed"],
    "abg.operation.catalog.describe": ["described"],
    "abg.operation.catalog.allow": ["allowed"],
    "abg.operation.catalog.invoke": ["converged"],
    "abg.operation.fh.select": [],
    "abg.operation.fh.approve": [],
    "abg.operation.fh.reject": [],
    "abg.operation.fh.assess": [],
    "abg.operation.fh.answer-escalation": [],
    "abg.operation.run.resume": [],
    "abg.operation.read.result": ["projected"],
    "abg.operation.read.replay": ["projected"]
  };
  const nonTerminalDispositions =
    operationId === "abg.operation.catalog.invoke"
      ? ["stopped", "yielded", "blocked", "human_gate_required"]
      : operationId === "abg.operation.run.resume"
        ? ["resume_admitted"]
        : operationId.startsWith("abg.operation.fh.")
          ? ["responded", "held"]
          : [];
  return {
    contractId: operationId,
    contractKind: "operation",
    owningProductId: "abiogenesis",
    version: "1.0.0",
    digest: CONTRACT_DIGEST,
    authorityRefs: ["REQ-P-POLICY"],
    capabilityRefs: [],
    nativeLocator: {
      kind: "native",
      packageName: "@abiogenesis/typescript-tenant",
      packageExport: "./app/m04",
      symbols: ["AbiogenesisPublicSdk", "PublicOperationInvocationEnvelope"]
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
      closedDomains: [
        {
          fieldPath: "request",
          kind: "closed_carrier",
          required: true,
          nullable: false,
          values: [],
          minimum: null,
          maximum: null
        }
      ],
      actorPolicy,
      authorityClass:
        operationId.includes("read.") ||
        operationId === "abg.operation.workspace.open" ||
        operationId === "abg.operation.catalog.list" ||
        operationId === "abg.operation.catalog.describe" ||
        operationId === "abg.operation.catalog.allow"
          ? "read"
          : operationId === "abg.operation.catalog.resolve"
            ? "pure"
            : "write",
      effectClass: effectClassByOperation[operationId],
      eventAdmission:
        operationId === "abg.operation.catalog.admit"
          ? "catalog_admission_events"
          : operationId === "abg.operation.catalog.invoke"
            ? "runtime_execution_events"
            : operationId.startsWith("abg.operation.fh.") ||
                operationId === "abg.operation.run.resume"
              ? "runtime_interaction_events"
              : "none",
      terminalDispositions: terminalDispositionsByOperation[operationId],
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

function operationContractCatalog(
  operationId,
  catalogDigest = CATALOG_DIGEST,
  row = operationContractRow(operationId)
) {
  return {
    kind: "abg_public_contract_catalog",
    schemaVersion: 1,
    catalogId: "abg.public-contracts.ds1",
    catalogVersion: PRODUCT_VERSION,
    catalogDigest,
    catalogSchemaPath: "contracts/schemas/public-contract-catalog.schema.json",
    catalogSchemaDigest: CATALOG_SCHEMA_DIGEST,
    profile: "abg-5-ds1",
    rows: [row]
  };
}

function resolvedOperationContract(
  operationId,
  catalogDigest = CATALOG_DIGEST,
  row = operationContractRow(operationId)
) {
  return resolvePublicOperationContract(
    operationContractCatalog(operationId, catalogDigest, row),
    operationId
  );
}

function hostInvocationSchemaRow(digest = CONTRACT_DIGEST) {
  return {
    contractId: "abg.schema.host-invocation",
    contractKind: "schema_asset",
    owningProductId: "abiogenesis",
    version: "1.0.0",
    digest,
    authorityRefs: ["REQ-P-PUBLIC-CONTRACTS"],
    capabilityRefs: ["abg.capability.catalog.invoke-graph-function@5"],
    nativeLocator: null,
    assetLocator: {
      kind: "asset",
      relativePath: "contracts/schemas/host-invocation.schema.json",
      schemaId: "abg.schema.host-invocation",
      schemaVersion: "1.0.0",
      mediaType: "application/schema+json",
      digest
    },
    operationContract: null
  };
}

function envelope(operationId, request) {
  const slug = operationId.slice("abg.operation.".length);
  const actorRequired = new Set([
    "abg.operation.workspace.create",
    "abg.operation.install.install",
    "abg.operation.catalog.bind",
    "abg.operation.catalog.admit",
    "abg.operation.catalog.invoke",
    "abg.operation.fh.select",
    "abg.operation.fh.approve",
    "abg.operation.fh.reject",
    "abg.operation.fh.assess",
    "abg.operation.fh.answer-escalation",
    "abg.operation.run.resume"
  ]).has(operationId);
  return {
    schemaVersion: 1,
    invocationSchemaId: "abg.schema.public-operation-invocation",
    invocationSchemaVersion: "1.0.0",
    invocationSchemaDigest: CONTRACT_DIGEST,
    invocationId: `invocation:${slug}`,
    operationId,
    operationContractVersion: "1.0.0",
    operationContractDigest: CONTRACT_DIGEST,
    requestId: `request:${slug}`,
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
    adapter: { kind: "native_sdk", ref: "sdk:t223" }
  };
}

test("T-223 canonical I-JSON uses RFC 8785 serialization and one digest law", () => {
  assert.equal(
    canonicalizeIJson({
      numbers: [333333333.33333329, 1e30, 4.5, 2e-3, 1e-27],
      string: "€$\u000f\nA'B\"\\\"/",
      literals: [null, true, false]
    }),
    "{\"literals\":[null,true,false],\"numbers\":[333333333.3333333,1e+30,4.5,0.002,1e-27],\"string\":\"€$\\u000f\\nA'B\\\"\\\\\\\"/\"}"
  );
  assert.equal(
    canonicalizeIJson({
      "€": "Euro Sign",
      "\r": "Carriage Return",
      "דּ": "Hebrew Letter Dalet With Dagesh",
      "1": "One",
      "😀": "Emoji: Grinning Face",
      "\u0080": "Control",
      "ö": "Latin Small Letter O With Diaeresis"
    }),
    "{\"\\r\":\"Carriage Return\",\"1\":\"One\",\"\":\"Control\",\"ö\":\"Latin Small Letter O With Diaeresis\",\"€\":\"Euro Sign\",\"😀\":\"Emoji: Grinning Face\",\"דּ\":\"Hebrew Letter Dalet With Dagesh\"}"
  );
  assert.equal(
    digestCanonicalIJson({ b: 2, a: 1 }),
    "sha256:43258cff783fe7036d8a43033f830adfc60ec037382473548ac742b888292777"
  );
  assert.equal(canonicalizeIJson({ value: -0 }), "{\"value\":0}");
  assert.equal(stableJson({ b: 2, a: 1 }), canonicalizeIJson({ a: 1, b: 2 }));
  assert.equal(
    stableSha256Digest({ b: 2, a: 1 }),
    digestCanonicalIJson({ a: 1, b: 2 })
  );
});

test("T-223 I-JSON text admission rejects duplicate names and unsupported values", () => {
  assert.throws(() => admitIJsonText('{"a":1,"a":2}'), /duplicate object property/u);
  assert.throws(
    () => admitIJsonText('{"a":1,"\\u0061":2}'),
    /duplicate object property/u
  );
  assert.throws(() => admitIJsonText('{"a":1,}'), /PropertyNameExpected|CloseBraceExpected/u);
  assert.throws(() => admitIJsonText('{/* no comments */"a":1}'), /InvalidCommentToken/u);
  assert.throws(() => admitIJsonText('{"a":1e400}'), /non-finite/u);
  assert.throws(() => admitIJsonText('{"a":"\\ud800"}'), /lone high surrogate/u);
  assert.throws(() => canonicalizeIJson({ value: undefined }), /expected an I-JSON value/u);
  assert.throws(() => canonicalizeIJson([, 1]), /sparse arrays/u);

  const parsedPrototypeKey = admitIJsonText(
    '{"__proto__":{"polluted":true},"safe":1}'
  );
  assert.equal(Object.getPrototypeOf(parsedPrototypeKey), null);
  assert.equal(Object.hasOwn(parsedPrototypeKey, "__proto__"), true);
  assert.equal(Object.getPrototypeOf(parsedPrototypeKey.__proto__), null);
  assert.equal({}.polluted, undefined);

  const nativePrototypeKey = Object.create(null);
  Object.defineProperty(nativePrototypeKey, "__proto__", {
    value: { retained: true },
    enumerable: true
  });
  assert.equal(
    canonicalizeIJson(nativePrototypeKey),
    '{"__proto__":{"retained":true}}'
  );
  assert.equal({}.retained, undefined);
});

test("T-223 core carriers are closed, coherent, and normalize standard SemVer ranges", () => {
  assert.equal(admitPublicContractCatalog(publicContractCatalog()).rows.length, 1);
  assert.equal(admitProductToolchainManifest(productManifest()).packageVersion, PRODUCT_VERSION);
  assert.equal(admitCatalogProductDescriptor(descriptor()).productId, PRODUCT_ID);
  assert.equal(admitCatalogContributionManifest(contributionManifest()).rows[0].canonicalHandle, HANDLE);
  assert.equal(admitResolvedProductLock(resolvedLock()).lockId, LOCK_ID);
  assert.equal(admitVerifiedProductArtifact(verifiedArtifact()).resolvedLock.lockId, LOCK_ID);
  assert.equal(
    admitProductVerificationRecord({
      kind: "product_verification_record",
      schemaVersion: 1,
      disposition: "verified",
      verifiedArtifact: verifiedArtifact(),
      installedProductRecord: {
        ...installedProductRecord(),
        manifestDigest: digestCanonicalIJson(productManifest())
      }
    }).installedProductRecord.productId,
    PRODUCT_ID
  );
  assert.equal(admitToolchainWorkspaceBindingV3(workspaceBinding()).schemaVersion, "3");
  assert.equal(admitPublicSessionCatalogView(sessionView()).allowedHandles[0], HANDLE);
  assert.equal(
    admitProductRequirement({ ...requirement(), versionConstraint: "^1.0.0" })
      .versionConstraint,
    ">=1.0.0 <2.0.0-0"
  );

  const workspaceManifest = {
    kind: "abg_workspace_manifest",
    schemaVersion: 1,
    workspaceId: WORKSPACE_ID,
    root: "/tmp/workspace",
    authorityMode: "clean_no_project_authority",
    scaffoldState: "none",
    bindingRef: null,
    configurationRefs: [],
    createdAt: "2026-07-11T00:00:00Z",
    actorRef: ACTOR_REF,
    provenanceRefs: []
  };
  assert.equal(admitPublicSdkWorkspaceManifest(workspaceManifest).workspaceId, WORKSPACE_ID);

  assert.throws(
    () => admitPublicContractCatalog({ ...publicContractCatalog(), unexpected: true }),
    /unknown field/u
  );
  assert.throws(
    () =>
      admitPublicContractRow({
        ...publicContractRow(),
        nativeLocator: {
          ...publicContractRow().nativeLocator,
          symbols: ["helloGraphFunction", "helloGraphFunction"]
        }
      }),
    /duplicate value/u
  );
  assert.equal(
    admitPublicContractRow(
      operationContractRow("abg.operation.workspace.open")
    ).operationContract.operationId,
    "abg.operation.workspace.open"
  );
  assert.throws(
    () => admitProductRequirement({ ...requirement(), versionConstraint: "latest-ish" }),
    /SemVer range/u
  );
  assert.throws(
    () => admitCatalogProductDescriptor({ ...descriptor(), version: "v1.0.0" }),
    /canonical SemVer/u
  );
  assert.throws(
    () =>
      admitProductToolchainManifest({
        ...productManifest(),
        productRelativeLocators: ["contracts/./catalog.json"]
      }),
    /confined product-relative path/u
  );
  assert.throws(
    () =>
      admitProductToolchainManifest({
        ...productManifest(),
        publicContractCatalogPath: "contracts\\catalog.json"
      }),
    /confined product-relative path/u
  );
  assert.throws(
    () => admitPublicSdkWorkspaceManifest({ ...workspaceManifest, createdAt: "2026-07-11" }),
    /UTC timestamp/u
  );
  assert.throws(
    () => admitToolchainWorkspaceBindingV3({ ...workspaceBinding(), schemaVersion: "2" }),
    /expected "3"/u
  );
  assert.throws(
    () =>
      admitPublicCatalogRow({
        ...publicCatalogRow(),
        kind: "overlay",
        callable: true
      }),
    /only graph_function/u
  );
  assert.throws(
    () =>
      admitPublicCatalogRow({
        ...publicCatalogRow(),
        ready: false,
        readinessBlockers: ["not-ready"],
        sessionVisible: false,
        eligible: false,
        callable: true
      }),
    /compatible, ready, and eligible/u
  );
  assert.throws(
    () =>
      admitPublicCatalogRow({
        ...publicCatalogRow(),
        sessionVisible: false,
        eligible: true,
        callable: false
      }),
    /eligible: requires session visibility/u
  );
  assert.throws(
    () =>
      admitPublicSessionCatalogView({
        ...sessionView(),
        allowedHandles: [HANDLE, "graph-function://example/missing"]
      }),
    /handle absent from rows/u
  );
  assert.throws(
    () =>
      admitPublicSessionCatalogView({
        ...sessionView(),
        effectiveSessionViewId: "registry-session-view:arbitrary"
      }),
    /derived identity mismatch/u
  );

  assert.throws(
    () =>
      admitCatalogContributionRow({
        ...contributionRow(),
        locator: {
          ...contributionRow().locator,
          declarationRef: "declaration:elsewhere"
        }
      }),
    /row identity mismatch/u
  );
  const overlayRow = {
    ...contributionRow(),
    canonicalHandle: "overlay://example/default",
    publicKind: "overlay",
    interfaceRef: null,
    locator: {
      kind: "opaque_overlay_asset",
      assetPath: "catalog/default-overlay.json",
      schemaId: "abg.schema.catalog-overlay-declaration",
      schemaVersion: "1.0.0",
      schemaDigest: CONTRACT_DIGEST,
      assetDigest: ARTIFACT_DIGEST
    }
  };
  assert.equal(admitCatalogContributionRow(overlayRow).publicKind, "overlay");
  assert.throws(
    () =>
      admitCatalogContributionRow({
        ...overlayRow,
        locator: { ...overlayRow.locator, schemaId: "schema:invented" }
      }),
    /catalog-overlay-declaration/u
  );
});

test("T-223 manifest and contract-catalog profiles preserve product sovereignty", () => {
  assert.throws(
    () =>
      admitProductToolchainManifest({
        ...productManifest(),
        runtimeSystemProfile: runtimeSystemProfile()
      }),
    /cannot publish ABG runtime authority/u
  );
  assert.throws(
    () =>
      admitProductToolchainManifest({
        ...productManifest(),
        productId: "different.product",
        packageName: "@different/product"
      }),
    /publisher-owned/u
  );
  assert.throws(
    () =>
      admitPublicContractCatalog({
        ...publicContractCatalog(),
        rows: [operationContractRow("abg.operation.workspace.open")]
      }),
    /cannot publish ABG or operation authority/u
  );

  const abgRow = {
    ...publicContractRow(),
    owningProductId: "abiogenesis",
    nativeLocator: {
      ...publicContractRow().nativeLocator,
      packageName: "@abiogenesis/typescript-tenant"
    }
  };
  const abgCatalog = {
    ...publicContractCatalog(),
    profile: "abg-5-ds1",
    rows: [abgRow]
  };
  const abgManifest = {
    ...productManifest(),
    productId: "abiogenesis",
    packageName: "@abiogenesis/typescript-tenant",
    publicContractCatalog: abgCatalog,
    runtimeSystemProfile: runtimeSystemProfile()
  };
  assert.equal(
    admitProductToolchainManifest(abgManifest).productId,
    "abiogenesis"
  );
  assert.throws(
    () =>
      admitProductToolchainManifest({
        ...abgManifest,
        runtimeSystemProfile: null
      }),
    /requires exact ABG identity and runtime/u
  );
});

test("T-223 admits every registered request and common-envelope row", () => {
  const fixtures = requestFixtures();
  assert.deepEqual([...fixtures.keys()], [...DS1_PUBLIC_OPERATION_IDS]);

  for (const operationId of DS1_PUBLIC_OPERATION_IDS) {
    const request = fixtures.get(operationId);
    assert.notEqual(request, undefined, operationId);
    assert.doesNotThrow(() => admitDs1OperationRequest(operationId, request), operationId);
    assert.throws(
      () => admitDs1OperationRequest(operationId, { ...request, unexpected: true }),
      /unknown field/u,
      operationId
    );
    const rawEnvelope = envelope(operationId, request);
    const parsed = parsePublicOperationInvocationEnvelope(rawEnvelope);
    assert.equal(parsed.operationId, operationId);
    assert.equal(parsed.correlationId, parsed.invocationId);
    assert.deepEqual(parsed.provenanceRefs, []);
    if (operationId !== "abg.operation.catalog.invoke") {
      const admitted = admitPublicOperationInvocationEnvelope(
        rawEnvelope,
        resolvedOperationContract(operationId)
      );
      assert.equal(admitted.operationId, operationId);
    }
  }

  assert.equal(
    admitDs1OperationRequest("abg.operation.workspace.open", {
      targetRoot: "/tmp/workspace"
    }).expectedWorkspaceSchemaVersion,
    1
  );
  assert.deepEqual(
    admitDs1OperationRequest("abg.operation.catalog.list", {
      workspaceId: WORKSPACE_ID,
      catalogId: CATALOG_ID
    }).kinds,
    ["graph_function", "node_type", "overlay"]
  );
  assert.equal(
    admitDs1OperationRequest("abg.operation.read.replay", {
      workspaceId: WORKSPACE_ID,
      subject: { kind: "run", runId: "run:t223" }
    }).limit,
    1000
  );
  assert.deepEqual(
    admitDs1OperationRequest("abg.operation.catalog.allow", {
      workspaceId: WORKSPACE_ID,
      catalogId: CATALOG_ID,
      handles: ["z", "a"]
    }).handles,
    ["a", "z"]
  );
});

test("T-223 union and envelope admissions fail closed before effects", () => {
  assert.throws(
    () =>
      admitDs1OperationRequest("abg.operation.read.result", {
        workspaceId: WORKSPACE_ID,
        resultId: "result:t223",
        graphCallId: "graph-call:t223"
      }),
    /exactly one/u
  );
  assert.throws(
    () =>
      admitDs1OperationRequest("abg.operation.read.replay", {
        workspaceId: WORKSPACE_ID,
        subject: {
          kind: "workspace",
          workspaceId: WORKSPACE_ID,
          runId: "run:t223"
        }
      }),
    /forbidden for workspace subject/u
  );
  assert.throws(
    () =>
      admitDs1OperationRequest("abg.operation.catalog.invoke", {
        ...invokeRequest(),
        inputRef: "input-ref:t223"
      }),
    /exactly one of input or inputRef/u
  );

  const openEnvelope = envelope(
    "abg.operation.workspace.open",
    { targetRoot: "/tmp/workspace" }
  );
  assert.throws(
    () => parsePublicOperationInvocationEnvelope({ ...openEnvelope, actorRef: ACTOR_REF }),
    /actor rule mismatch/u
  );
  assert.throws(
    () =>
      parsePublicOperationInvocationEnvelope({
        ...openEnvelope,
        requestSchemaId: "abg.schema.operation.catalog.invoke.request"
      }),
    /schema identity does not match/u
  );
  assert.throws(
    () => parsePublicOperationInvocationEnvelope({ ...openEnvelope, extra: true }),
    /unknown field/u
  );
  assert.throws(
    () => parsePublicOperationInvocationText('{"schemaVersion":1,"schemaVersion":1}'),
    /duplicate object property/u
  );
  assert.throws(
    () =>
      admitPublicOperationInvocationEnvelope(openEnvelope, {
        catalogId: "abg.public-contracts.ds1",
        catalogVersion: PRODUCT_VERSION,
        catalogDigest: CATALOG_DIGEST,
        row: operationContractRow("abg.operation.workspace.open")
      }),
    /must be resolved from a catalog/u
  );
  const mismatchedRow = operationContractRow("abg.operation.workspace.open");
  mismatchedRow.operationContract.requestSchemaDigest = CATALOG_DIGEST;
  assert.throws(
    () =>
      admitPublicOperationInvocationEnvelope(
        openEnvelope,
        resolvedOperationContract(
          "abg.operation.workspace.open",
          CATALOG_DIGEST,
          mismatchedRow
        )
      ),
    /not bound to the resolved operation row/u
  );
});

test("T-223 host invocation specialization retains one complete admitted basis", () => {
  const request = invokeRequest();
  const host = {
    ...envelope("abg.operation.catalog.invoke", request),
    contractCatalogVersion: PRODUCT_VERSION,
    contractCatalogDigest: CATALOG_DIGEST,
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
    inputId: "input:t223",
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
  };
  const invokeOperation = resolvedOperationContract(
    "abg.operation.catalog.invoke"
  );
  const hostSchema = hostInvocationSchemaRow();
  const admitted = admitHostInvocationDescriptor(
    host,
    invokeOperation,
    hostSchema
  );
  assert.equal(admitted.operationId, "abg.operation.catalog.invoke");
  assert.equal(admitted.actorRef, ACTOR_REF);
  assert.equal(admitted.target, HANDLE);
  assert.deepEqual(admitted.productBindingRefs, ["installed:example.hello:1.0.0"]);

  assert.throws(
    () =>
      admitHostInvocationDescriptor(
        { ...host, target: "graph-function://wrong" },
        invokeOperation,
        hostSchema
      ),
    /must equal graphFunctionHandle/u
  );
  assert.throws(
    () =>
      admitHostInvocationDescriptor(
        { ...host, input: { greeting: "elsewhere" } },
        invokeOperation,
        hostSchema
      ),
    /input: request mismatch/u
  );
  assert.throws(
    () =>
      admitHostInvocationDescriptor(
        { ...host, productBindingRefs: [] },
        invokeOperation,
        hostSchema
      ),
    /non-empty array/u
  );
  assert.throws(
    () =>
      admitHostInvocationDescriptor(
        { ...host, effectiveSessionViewId: "registry-session-view:arbitrary" },
        invokeOperation,
        hostSchema
      ),
    /derived identity mismatch/u
  );
  assert.throws(
    () =>
      admitHostInvocationDescriptor(
        host,
        resolvedOperationContract(
          "abg.operation.catalog.invoke",
          sha("e")
        ),
        hostSchema
      ),
    /contract catalog basis mismatch/u
  );
  assert.throws(
    () =>
      admitHostInvocationDescriptor(
        host,
        invokeOperation,
        {
          ...hostSchema,
          contractId: "abg.schema.not-host-invocation",
          assetLocator: {
            ...hostSchema.assetLocator,
            schemaId: "abg.schema.not-host-invocation"
          }
        }
      ),
    /host specialization is not bound to the exact host-invocation schema row/u
  );
});
