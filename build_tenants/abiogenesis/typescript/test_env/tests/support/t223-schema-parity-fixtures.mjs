import {
  admitDs1OperationRequest,
  digestCanonicalIJson
} from "../../../build/semantic/code/src/app/m04/index.js";

export function sha(character) {
  return `sha256:${character.repeat(64)}`;
}

export const CONTRACT_DIGEST = sha("a");
export const CATALOG_DIGEST = sha("b");
export const CATALOG_SCHEMA_DIGEST = sha("c");
export const ARTIFACT_DIGEST = sha("d");
export const CONTRIBUTION_DIGEST = sha("f");
export const DESCRIPTOR_DIGEST = sha("1");
export const LOCK_DIGEST = sha("2");
export const MANIFEST_DIGEST = sha("3");
export const INPUT_SCHEMA_DIGEST = sha("4");
export const PRODUCT_SET_DIGEST = sha("5");
export const WORKSPACE_MANIFEST_DIGEST = sha("6");
export const HANDLE = "graph-function://example/hello";
export const PRODUCT_ID = "example.hello";
export const PRODUCT_VERSION = "1.0.0";
export const WORKSPACE_ID = "workspace:t223-schema";
export const CATALOG_ID = "catalog:t223-schema";
export const BINDING_ID = "binding:t223-schema";
export const LOCK_ID = "lock:t223-schema";
export const ACTOR_REF = "actor:t223-schema";
export const RUNTIME_CATALOG_PROJECTION_REF =
  "runtime-catalog-projection:t223-schema";
export const RUNTIME_ENTRY_REF = "catalog-entry://example/hello";

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

export function effectiveSessionViewId(
  allowedEntryRefs = [RUNTIME_ENTRY_REF]
) {
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
export function publicContractCatalogFixture() {
  return {
    kind: "abg_public_contract_catalog",
    schemaVersion: 1,
    catalogId: "example.public-contracts",
    catalogVersion: PRODUCT_VERSION,
    catalogDigest: CATALOG_DIGEST,
    catalogSchemaPath: "contracts/schemas/public-contract-catalog.schema.json",
    catalogSchemaDigest: CATALOG_SCHEMA_DIGEST,
    profile: "catalog-product-v1",
    rows: [publicContractRow()]
  };
}

export function productManifestFixture() {
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
    publicContractCatalog: publicContractCatalogFixture(),
    runtimeSystemProfile: null,
    productRelativeLocators: [
      "contracts/public-contract-catalog.json",
      "catalog/hello.module.json"
    ]
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
    productManifest: productManifestFixture(),
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
    manifestPath:
      "/tmp/toolchain/products/example.hello/1.0.0/product/product-toolchain-manifest.json",
    manifestDigest: MANIFEST_DIGEST,
    descriptorId: "descriptor:example.hello:1.0.0",
    descriptorDigest: DESCRIPTOR_DIGEST,
    contributionId: "contribution:example.hello:1.0.0",
    contributionDigest: CONTRIBUTION_DIGEST,
    compatibilityRange: ">=4.6.0-rc.3 <6.0.0-0",
    compatibility: { productId: PRODUCT_ID, compatible: true, reason: null },
    commandRefs: [],
    publicContractCatalogId: "example.public-contracts",
    publicContractCatalogVersion: PRODUCT_VERSION,
    publicContractCatalogDigest: CATALOG_DIGEST,
    descriptorRecordPath:
      "/tmp/toolchain/records/example/hello/descriptor.json",
    contributionRecordPath:
      "/tmp/toolchain/records/example/hello/contribution.json",
    lockRecordPath: "/tmp/toolchain/records/example/hello/lock.json",
    provenanceRefs: ["publisher:example"]
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
    inputId: "input:t223-schema",
    inputSchemaId: "schema:example.hello.input",
    inputSchemaVersion: PRODUCT_VERSION,
    inputSchemaDigest: INPUT_SCHEMA_DIGEST,
    input: { greeting: "world" },
    requiredCapabilityRefs: [],
    actorRef: ACTOR_REF,
    transportSteering: null
  };
}

function rawOperationRequests() {
  return new Map([
    [
      "abg.operation.workspace.create",
      {
        targetRoot: "/tmp/workspace",
        authorityMode: "clean_no_project_authority"
      }
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
    [
      "abg.operation.read.result",
      { workspaceId: WORKSPACE_ID, graphCallId: "graph-call:t223-schema" }
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

export function admittedOperationRequestFixtures(operationIds) {
  const raw = rawOperationRequests();
  return new Map(
    operationIds.map((operationId) => {
      const request = raw.get(operationId);
      if (request === undefined) {
        throw new TypeError(`missing request fixture for ${operationId}`);
      }
      return [operationId, admitDs1OperationRequest(operationId, request)];
    })
  );
}

export function workspaceManifestFixture() {
  return {
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
}

export function catalogAssetAdmittedEventFixture() {
  return {
    kind: "catalog_asset_admitted",
    workspaceId: WORKSPACE_ID,
    bindingId: BINDING_ID,
    catalogId: CATALOG_ID,
    entryRef: "catalog-entry://example/default-overlay",
    declarationRef: "declaration://example/default-overlay",
    declarationDigest: CONTRACT_DIGEST,
    libraryScope: "product",
    assetKind: "overlay",
    namespace: "example",
    ownerRef: "owner://example",
    version: PRODUCT_VERSION,
    descriptorRef: "descriptor:example.hello:1.0.0",
    contributionManifestRef: "contribution:example.hello:1.0.0",
    resolvedLockRef: LOCK_ID,
    assetPath: "catalog/default-overlay.json",
    schemaId: "abg.schema.catalog-overlay-declaration",
    schemaVersion: "1.0.0",
    schemaDigest: CONTRACT_DIGEST,
    assetDigest: ARTIFACT_DIGEST,
    authorityRefs: ["REQ-P-CATALOG"],
    provenanceRefs: ["publisher:example"],
    readinessRefs: ["ready:example.hello"],
    proofRefs: ["proof:example.hello"],
    policyRefs: [],
    refinementOfEntryRef: null,
    overrideOfEntryRef: null,
    sourceEventRefs: ["event://binding-admitted"],
    causationEventRefs: ["event://binding-admitted"],
    correlationId: "correlation://t223-schema"
  };
}
