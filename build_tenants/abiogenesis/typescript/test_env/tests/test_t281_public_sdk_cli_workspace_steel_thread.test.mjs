import assert from "node:assert/strict";
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";

import {
  appendRuntimeEventsToLog,
  createRuntimeEventLogSink,
  constructRuntimeFluent,
  derivePublicOperationArtifactReplayProjection,
  holdsAt
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  buildPrivatePublicOperationDefinitionFamily
} from "../../build/semantic/code/src/app/m04/public_contracts/public_operation_definition_family.js";
import {
  runAbgCli
} from "../../build/semantic/code/src/app/m04/public_cli/index.js";
import {
  contributionManifestDigest
} from "../../build/semantic/code/src/app/m04/product_intake/verify.js";
import {
  abiogenesisPublicSdk,
  canonicalizeIJson,
  createNodeBoundWorkspaceContext,
  createNodeWorkspacePathContext,
  readNodeCanonicalJsonFile
} from "../../build/semantic/code/src/app/m04/public_sdk/index.js";
import {
  admitWorkspaceRuntimeEventBytes
} from "../../build/semantic/code/src/abg/m03/runner/public_runtime_projections.js";
import {
  defaultToolchainMutableStateRoots,
  TOOLCHAIN_BINDING_RELATIVE_PATH
} from "../../build/semantic/code/src/app/m04/toolchain_binding/resolve.js";
import {
  resolvedProductLockId
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  WORKSPACE_MANIFEST_RELATIVE_PATH
} from "../../build/semantic/code/src/app/m04/workspace/operations.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  T223_ABG_SYSTEM_GRAPH_FUNCTION_HANDLE,
  T223_ABG_SYSTEM_MODULE_PATH,
  prepareAbgProductPublication
} from "../tools/publish_abg_product_contracts.mjs";
import {
  constructT281PrivateP1Invocation
} from "./support/t281-private-ingress-fixture.mjs";

const tenantRoot = resolve(import.meta.dirname, "../..");
const contractCatalogPath = join(
  tenantRoot,
  "contracts",
  "public-contract-catalog.json"
);
const ZERO_DIGEST = `sha256:${"0".repeat(64)}`;

let publicationPromise = null;

async function currentPublication() {
  publicationPromise ??= prepareAbgProductPublication();
  return await publicationPromise;
}

async function exactFamily() {
  const admitted = await buildPrivatePublicOperationDefinitionFamily();
  assert.equal(admitted.kind, "exact_family_admitted", JSON.stringify(admitted));
  return admitted.family;
}

function installedCatalogIdentity(catalog) {
  return {
    kind: "public_contract_catalog_coordinate",
    catalogId: catalog.catalogId,
    catalogVersion: catalog.catalogVersion,
    catalogDigest: catalog.catalogDigest
  };
}

function nodeRuntime(catalog, overrides = {}) {
  return {
    sdk: abiogenesisPublicSdk,
    readCanonicalJsonFile: readNodeCanonicalJsonFile,
    async readBytes(absolutePath) {
      return new Uint8Array(await readFile(absolutePath));
    },
    async loadPublicContractCatalog() {
      return catalog;
    },
    createWorkspacePathContext: createNodeWorkspacePathContext,
    async createWorkspaceBindingContext() {
      throw new Error("workspace binding context is not configured");
    },
    createBoundWorkspaceContext: createNodeBoundWorkspaceContext,
    appendRuntimeEvents: appendRuntimeEventsToLog,
    createRuntimeEventLog: createRuntimeEventLogSink,
    ...overrides
  };
}

function exactResolvedLock(record) {
  const identityBasis = Object.freeze({
    requirements: Object.freeze([Object.freeze({
      productId: record.productId,
      versionConstraint: record.version,
      requiredContractRefs: Object.freeze([]),
      requiredCapabilityRefs: Object.freeze([])
    })]),
    products: Object.freeze([Object.freeze({
      publisher: record.publisher,
      productId: record.productId,
      version: record.version,
      descriptorId: record.descriptorId,
      descriptorDigest: record.descriptorDigest,
      contributionId: record.contributionId,
      contributionDigest: record.contributionDigest,
      artifactDigest: record.artifactDigest,
      productContentDigest: record.productContentDigest
    })]),
    dependencyEdges: Object.freeze([]),
    compatibility: Object.freeze([record.compatibility])
  });
  const basis = Object.freeze({
    kind: "resolved_product_lock",
    schemaVersion: 1,
    lockId: resolvedProductLockId(identityBasis),
    ...identityBasis
  });
  return Object.freeze({ ...basis, lockDigest: stableSha256Digest(basis) });
}

async function installedAbgFixture(root) {
  const prepared = await currentPublication();
  const { catalog, manifest } = prepared.publication;
  const version = manifest.packageVersion;
  const artifactDigest = stableSha256Digest({
    product: "abiogenesis",
    version,
    fixture: "t281-installed"
  });
  const descriptorId = `descriptor://abiogenesis/${version}`;
  const descriptorDigest = stableSha256Digest({ descriptorId });
  const contributionId = `contribution://abiogenesis/${version}`;
  const modulePath = T223_ABG_SYSTEM_MODULE_PATH;
  const module = JSON.parse(
    await readFile(join(tenantRoot, modulePath), "utf8")
  );
  const moduleDigest = stableSha256Digest(module);
  const contributionBasis = Object.freeze({
    kind: "catalog_contribution_manifest",
    schemaVersion: 1,
    contributionId,
    contributionDigest: ZERO_DIGEST,
    descriptorId,
    descriptorDigest,
    productId: "abiogenesis",
    productVersion: version,
    artifactDigest,
    rows: Object.freeze([Object.freeze({
      canonicalHandle: T223_ABG_SYSTEM_GRAPH_FUNCTION_HANDLE,
      publicKind: "graph_function",
      ownerProductId: "abiogenesis",
      ownerVersion: version,
      declarationRef: T223_ABG_SYSTEM_GRAPH_FUNCTION_HANDLE,
      contractRef: "abg.schema.gtl-graph-function",
      interfaceRef: "abg.schema.gtl-graph-function",
      locator: Object.freeze({
        kind: "module_declaration",
        modulePath,
        moduleDigest,
        declarationRef: T223_ABG_SYSTEM_GRAPH_FUNCTION_HANDLE
      }),
      compatibility: Object.freeze({
        abgVersionRange: version,
        requiredProductRefs: Object.freeze(["abiogenesis"]),
        requiredContractRefs: Object.freeze([
          "abg.schema.gtl-graph-function",
          "abg.schema.gtl-module"
        ]),
        requiredCapabilityRefs: Object.freeze([
          "abg.capability.catalog.invoke-graph-function@5",
          "abg.capability.module.publish@5"
        ])
      }),
      readinessRefs: Object.freeze([
        "readiness://abiogenesis/system-catalog/t281"
      ]),
      proofRefs: Object.freeze(["proof://t281/installed-system-catalog"]),
      policyRefs: Object.freeze([
        manifest.runtimeSystemProfile.resolvedPolicy.resolvedPolicyBundleRef
      ]),
      capabilityRefs: Object.freeze([
        "abg.capability.catalog.invoke-graph-function@5"
      ]),
      provenanceRefs: Object.freeze(["proof://t281/installed-abg-fixture"]),
      refinementOfHandle: null,
      overrideOfHandle: null
    })])
  });
  const contribution = Object.freeze({
    ...contributionBasis,
    contributionDigest: contributionManifestDigest(contributionBasis)
  });
  const toolchainRoot = join(root, "toolchain");
  const productRoot = join(
    toolchainRoot,
    "products",
    "abiogenesis",
    version
  );
  const recordRoot = join(
    toolchainRoot,
    "records",
    "abiogenesis",
    "abiogenesis",
    version,
    artifactDigest.slice("sha256:".length)
  );
  const manifestPath = join(productRoot, "product-toolchain-manifest.json");
  await mkdir(dirname(join(productRoot, modulePath)), { recursive: true });
  await mkdir(recordRoot, { recursive: true });
  await writeFile(manifestPath, canonicalizeIJson(manifest), "utf8");
  await writeFile(
    join(productRoot, modulePath),
    canonicalizeIJson(module),
    "utf8"
  );
  await writeFile(
    join(recordRoot, "contribution-manifest.json"),
    canonicalizeIJson(contribution),
    "utf8"
  );
  const record = Object.freeze({
    kind: "installed_product_record",
    schemaVersion: 1,
    installedProductId: `installed://abiogenesis/${version}/t281`,
    publisher: "abiogenesis",
    productId: "abiogenesis",
    packageName: manifest.packageName,
    version,
    artifactDigest,
    productContentDigest: manifest.productContentDigest,
    installedRoot: productRoot,
    productRoot,
    packageRoot: productRoot,
    manifestPath,
    manifestDigest: stableSha256Digest(manifest),
    descriptorId,
    descriptorDigest,
    contributionId,
    contributionDigest: contribution.contributionDigest,
    compatibilityRange: version,
    compatibility: Object.freeze({
      productId: "abiogenesis",
      compatible: true,
      reason: null
    }),
    commandRefs: Object.freeze(["command://abiogenesis/abg.cli"]),
    publicContractCatalogId: catalog.catalogId,
    publicContractCatalogVersion: catalog.catalogVersion,
    publicContractCatalogDigest: catalog.catalogDigest,
    descriptorRecordPath: join(recordRoot, "product-descriptor.json"),
    contributionRecordPath: join(recordRoot, "contribution-manifest.json"),
    lockRecordPath: join(recordRoot, "resolved-product-lock.json"),
    provenanceRefs: Object.freeze(["proof://t281/installed-abg-fixture"])
  });
  return Object.freeze({
    catalog,
    contribution,
    manifest,
    record,
    resolvedLock: exactResolvedLock(record),
    toolchainRoot
  });
}

function io(cwd) {
  const stdout = [];
  const stderr = [];
  return {
    stdout,
    stderr,
    adapter: {
      cwd: () => cwd,
      stdout: (text) => stdout.push(text),
      stderr: (text) => stderr.push(text)
    }
  };
}

async function createFixtureWorkspaceBindingContext(input) {
  const workspaceManifest = await readNodeCanonicalJsonFile(
    join(input.workspaceRoot, WORKSPACE_MANIFEST_RELATIVE_PATH),
    "workspace manifest"
  );
  const bindingPath = join(
    input.workspaceRoot,
    TOOLCHAIN_BINDING_RELATIVE_PATH
  );
  return Object.freeze({
    kind: "workspace_binding",
    workspaceManifest,
    publicContractCatalog: input.catalog,
    effects: Object.freeze({
      async readBinding() {
        try {
          return await readNodeCanonicalJsonFile(bindingPath, "workspace binding");
        } catch (error) {
          if (error?.code === "ENOENT") return null;
          throw error;
        }
      },
      async readInstalledProductRecord(installedProductId) {
        return installedProductId === input.record.installedProductId
          ? input.record
          : null;
      },
      async writeBinding(binding) {
        await mkdir(dirname(bindingPath), { recursive: true });
        await writeFile(bindingPath, canonicalizeIJson(binding), "utf8");
      },
      async createMutableRoot(path) {
        await mkdir(path, { recursive: true });
      }
    })
  });
}

async function writeInvocation(input) {
  const invocation = constructT281PrivateP1Invocation(input);
  await writeFile(
    input.path,
    canonicalizeIJson(invocation),
    "utf8"
  );
  return invocation;
}

async function runCli(input) {
  const output = io(input.cwd);
  const exitCode = await runAbgCli(
    [
      ...input.semanticArgv,
      "--invocation",
      input.invocationPath,
      "--contract-catalog",
      contractCatalogPath,
      ...input.adapterArgv
    ],
    output.adapter,
    input.runtime
  );
  return Object.freeze({ exitCode, output });
}

test("T-281 abg.cli creates a workspace through the exact P1 family and persists the Rule-B replay delta", async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "abg-t281-cli-create-"));
  const workspaceRoot = join(temporaryRoot, "workspace");
  const invocationPath = join(temporaryRoot, "invocation.json");
  try {
    const catalog = (await currentPublication()).publication.catalog;
    const family = await exactFamily();
    const definition = family["abg.operation.workspace.create"].clean;
    const invocation = constructT281PrivateP1Invocation({
      family,
      definition,
      request: {
        targetRoot: workspaceRoot,
        createPolicy: "clean",
        scaffoldPolicy: "no_scaffold"
      },
      actorRef: "actor://t281/cli-sunny",
      contractCatalogCoordinate: installedCatalogIdentity(catalog)
    });
    await writeFile(invocationPath, JSON.stringify(invocation), "utf8");
    const output = io(temporaryRoot);
    const exitCode = await runAbgCli([
      "workspace",
      "create",
      "--policy",
      "clean",
      "--invocation",
      invocationPath,
      "--contract-catalog",
      contractCatalogPath,
      "--workspace-root",
      workspaceRoot
    ], output.adapter, nodeRuntime(catalog));

    assert.equal(exitCode, 0, output.stderr.join(""));
    assert.deepEqual(output.stderr, []);
    const outcome = JSON.parse(output.stdout[0]);
    assert.equal(outcome.outcomeKind, "result");
    assert.deepEqual(outcome.definitionKey, definition.definitionKey);

    const eventLogPath = defaultToolchainMutableStateRoots({
      targetRoot: workspaceRoot
    }).eventLogPath;
    const replay = admitWorkspaceRuntimeEventBytes(
      new Uint8Array(await readFile(eventLogPath))
    );
    assert.deepEqual(
      replay.orderedEvents.map((event) => event.kind),
      ["public_operation_admitted", "public_operation_artifact_admitted"]
    );
    const boundary = replay.orderedEvents[1];
    assert.equal(boundary.kind, "public_operation_artifact_admitted");
    const projection = derivePublicOperationArtifactReplayProjection({
      events: replay.orderedEvents,
      scopeRef: boundary.scopeRef,
      scopeDigest: boundary.scopeDigest
    });
    assert.equal(
      holdsAt(
        projection,
        constructRuntimeFluent({
          name: "public_operation_artifact_available",
          scope: "public_operation",
          constraintRef: boundary.scopeRef,
          ref: boundary.artifactRef
        })
      ),
      true
    );
    assert.deepEqual(outcome.evidenceRefs, [boundary.eventId]);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("T-281 abg.cli does not synthesize missing invocation authority", async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "abg-t281-cli-authority-"));
  const workspaceRoot = join(temporaryRoot, "workspace");
  const invocationPath = join(temporaryRoot, "invocation.json");
  try {
    const catalog = (await currentPublication()).publication.catalog;
    const family = await exactFamily();
    const definition = family["abg.operation.workspace.create"].clean;
    const invocation = constructT281PrivateP1Invocation({
      family,
      definition,
      request: {
        targetRoot: workspaceRoot,
        createPolicy: "clean",
        scaffoldPolicy: "no_scaffold"
      },
      contractCatalogCoordinate: installedCatalogIdentity(catalog)
    });
    const malformed = JSON.parse(JSON.stringify(invocation));
    delete malformed.authority.capabilityGrants;
    await writeFile(invocationPath, JSON.stringify(malformed), "utf8");
    const output = io(temporaryRoot);
    const exitCode = await runAbgCli([
      "workspace",
      "create",
      "--policy",
      "clean",
      "--invocation",
      invocationPath,
      "--contract-catalog",
      contractCatalogPath,
      "--workspace-root",
      workspaceRoot
    ], output.adapter, nodeRuntime(catalog));

    assert.equal(exitCode, definition.adapterExitMap.adapterFailure);
    assert.equal(output.stdout.length, 0);
    assert.match(output.stderr[0], /capabilityGrants/u);
    await assert.rejects(readFile(workspaceRoot), /ENOENT/u);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("T-281 workspace.bind refuses filesystem-installed product truth without an admitted product.install boundary", async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "abg-t281-cli-thread-"));
  const workspaceRoot = join(temporaryRoot, "workspace");
  try {
    const family = await exactFamily();
    const fixture = await installedAbgFixture(temporaryRoot);
    const catalogCoordinate = installedCatalogIdentity(fixture.catalog);
    const runtime = nodeRuntime(fixture.catalog, {
      async createWorkspaceBindingContext(input) {
        return await createFixtureWorkspaceBindingContext({
          workspaceRoot: input.workspaceRoot,
          catalog: fixture.catalog,
          record: fixture.record
        });
      }
    });

    const createDefinition = family["abg.operation.workspace.create"].clean;
    const createPath = join(temporaryRoot, "workspace-create.json");
    await writeInvocation({
      family,
      definition: createDefinition,
      request: {
        targetRoot: workspaceRoot,
        createPolicy: "clean",
        scaffoldPolicy: "no_scaffold"
      },
      actorRef: "actor://t281/cli-thread",
      contractCatalogCoordinate: catalogCoordinate,
      path: createPath
    });
    const created = await runCli({
      cwd: temporaryRoot,
      semanticArgv: ["workspace", "create", "--policy", "clean"],
      invocationPath: createPath,
      adapterArgv: ["--workspace-root", workspaceRoot],
      runtime
    });
    assert.equal(created.exitCode, 0, created.output.stderr.join(""));

    const workspaceManifest = await readNodeCanonicalJsonFile(
      join(workspaceRoot, WORKSPACE_MANIFEST_RELATIVE_PATH),
      "created workspace manifest"
    );
    const mutableStateRoots = defaultToolchainMutableStateRoots({
      targetRoot: workspaceRoot
    });
    const ownerRequest = Object.freeze({
      workspaceId: workspaceManifest.workspaceId,
      workspaceManifestDigest: stableSha256Digest(workspaceManifest),
      resolvedLock: fixture.resolvedLock,
      installedProductRecords: Object.freeze([fixture.record]),
      mutableStateRoots
    });
    const ownerRequestPath = join(temporaryRoot, "workspace-bind-owner.json");
    await writeFile(
      ownerRequestPath,
      canonicalizeIJson(ownerRequest),
      "utf8"
    );
    const declaredRoots = [...new Set([
      mutableStateRoots.observedWorkspaceRoot,
      mutableStateRoots.observerStateRoot,
      mutableStateRoots.executorStateRoot,
      mutableStateRoots.eventRoot,
      mutableStateRoots.runtimeRoot,
      mutableStateRoots.projectionRoot,
      mutableStateRoots.archiveRoot
    ])];
    const bindDefinition = family["abg.operation.workspace.bind"].bind;
    const bindPath = join(temporaryRoot, "workspace-bind.json");
    await writeInvocation({
      family,
      definition: bindDefinition,
      request: {
        workspaceAuthorityRef: workspaceManifest.workspaceId,
        workspaceAuthorityDigest: stableSha256Digest(workspaceManifest),
        installedSet: [{
          ref: fixture.record.installedProductId,
          digest: stableSha256Digest(fixture.record)
        }],
        resolvedLockRef: fixture.resolvedLock.lockId,
        resolvedLockDigest: fixture.resolvedLock.lockDigest,
        declaredRoots
      },
      actorRef: "actor://t281/cli-thread",
      dependencyLock: {
        ref: fixture.resolvedLock.lockId,
        digest: fixture.resolvedLock.lockDigest
      },
      contractCatalogCoordinate: catalogCoordinate,
      path: bindPath
    });
    await readNodeCanonicalJsonFile(
      fixture.record.manifestPath,
      "filesystem-installed product manifest"
    );
    await readNodeCanonicalJsonFile(
      fixture.record.contributionRecordPath,
      "filesystem-installed contribution manifest"
    );
    const eventLogPath = mutableStateRoots.eventLogPath;
    const eventBytesBeforeBind = new Uint8Array(await readFile(eventLogPath));
    assert.deepEqual(
      admitWorkspaceRuntimeEventBytes(eventBytesBeforeBind).orderedEvents.map(
        (event) => event.kind
      ),
      ["public_operation_admitted", "public_operation_artifact_admitted"],
      "workspace.create must not imply product.install admission"
    );

    const refused = await runCli({
      cwd: temporaryRoot,
      semanticArgv: ["workspace", "bind"],
      invocationPath: bindPath,
      adapterArgv: [
        "--workspace-root",
        workspaceRoot,
        "--owner-request",
        ownerRequestPath
      ],
      runtime
    });
    assert.equal(
      refused.exitCode,
      bindDefinition.adapterExitMap.adapterFailure
    );
    assert.deepEqual(refused.output.stdout, []);
    assert.match(
      refused.output.stderr[0],
      /abg\.operation\.product\.install artifact is not available in admitted replay truth/u
    );
    await assert.rejects(
      readFile(join(workspaceRoot, TOOLCHAIN_BINDING_RELATIVE_PATH)),
      /ENOENT/u
    );
    const replayAfterRefusal = admitWorkspaceRuntimeEventBytes(
      new Uint8Array(await readFile(eventLogPath))
    );
    assert.deepEqual(
      replayAfterRefusal.orderedEvents.map((event) => event.kind),
      [
        "public_operation_admitted",
        "public_operation_artifact_admitted",
        "public_operation_admitted"
      ],
      "the admitted bind command may be recorded, but refusal must emit no bind artifact"
    );
    assert.equal(
      replayAfterRefusal.orderedEvents.at(-1)?.definitionKey.operationId,
      "abg.operation.workspace.bind"
    );
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
