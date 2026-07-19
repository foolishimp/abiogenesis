// Validates: T-223 DS-1 declarations-only Hello World catalog fixture
// Validates: REQ-P-CATALOG, REQ-P-INSTALL, REQ-P-PUBLIC-CONTRACTS

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdtemp,
  readFile,
  readdir,
  rm
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { TextDecoder } from "node:util";

import {
  admitBoundWorkspaceCatalog,
  admitCatalogContributionManifest,
  admitCatalogProductDescriptor,
  admitCProgramSyntax,
  admitIJsonText,
  admitModule,
  admitOpaqueCatalogAssetDeclaration,
  admitProductToolchainManifest,
  canonicalizeIJson,
  catalogResolve,
  catalogVerify,
  compileGraphVectorCProgramSelection,
  compileGraphVectorExecutionHandoff,
  constructGtlLibraryEntryDeclaration,
  constructModuleLookupAuthority,
  constructProductRegistryStartupConfig,
  contributionManifestDigest,
  createNodeProductIntakeEffects,
  deriveRegistrySessionView,
  descriptorDigest,
  installProduct,
  loadGtlTargetCarrierDefaultsBundle,
  materializeNodeType,
  publicContractCatalogDigest,
  resolvePublishedGraphFunction
} from "../../build/semantic/code/src/index.js";
import {
  admittedTenantManifestFixture
} from "../fixtures/admitted_tenant_manifest.mjs";
import {
  T223_FIXTURE_GRAPH_HANDLE,
  T223_FIXTURE_INTERFACE_REF,
  T223_FIXTURE_NODE_HANDLE,
  T223_FIXTURE_OVERLAY_HANDLE,
  T223_FIXTURE_PRODUCT_ID,
  T223_FIXTURE_ROOT,
  T223_FIXTURE_VERSION,
  checkT223HelloWorldFixture,
  generateT223HelloWorldFixture
} from "../tools/t223_hello_world_fixture.mjs";

const ZERO_DIGEST = `sha256:${"0".repeat(64)}`;
const EXPECTED_PACKAGE_FILES = Object.freeze([
  "catalog/default-overlay.json",
  "catalog/hello-world.module.json",
  "contracts/catalog-overlay-declaration.schema.json",
  "contracts/hello-input.schema.json",
  "contracts/hello-output.schema.json",
  "contracts/hello-world.interface.json",
  "contracts/public-contract-catalog.json",
  "contracts/public-contract-catalog.schema.json",
  "package.json",
  "product-toolchain-manifest.json"
]);

function sha256(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function cProgramLeaves(term) {
  switch (term.kind) {
    case "c_of":
      return [[term.stageRole, term.fibre, term.armId]];
    case "c_identity":
    case "c_workflow":
      return [];
    case "c_compose":
      return [...cProgramLeaves(term.left), ...cProgramLeaves(term.right)];
    case "c_edge":
      return [
        ...cProgramLeaves(term.transform),
        ...cProgramLeaves(term.evaluate),
        ...cProgramLeaves(term.consequence)
      ];
    case "c_batch":
      return term.tasks.flatMap(cProgramLeaves);
    case "c_retry":
      return cProgramLeaves(term.term);
    default:
      throw new TypeError(`unknown C-program node ${JSON.stringify(term.kind)}`);
  }
}

async function readJson(absolutePath) {
  const text = new TextDecoder("utf-8", { fatal: true }).decode(
    await readFile(absolutePath)
  );
  return Object.freeze({
    text,
    value: admitIJsonText(text, absolutePath)
  });
}

async function jsonFile(absolutePath) {
  const { text, value } = await readJson(absolutePath);
  assert.equal(text, canonicalizeIJson(value), `${absolutePath} is not canonical JSON`);
  return value;
}

async function fileTable(root, prefix = "") {
  const rows = [];
  for (const entry of await readdir(path.join(root, prefix), {
    withFileTypes: true
  })) {
    const relativePath = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      rows.push(...(await fileTable(root, relativePath)));
      continue;
    }
    assert.equal(entry.isFile(), true, `unexpected fixture entry ${relativePath}`);
    rows.push(relativePath);
  }
  return rows.sort();
}

function descriptorWithDigest(input) {
  const provisional = Object.freeze({
    ...input,
    descriptorDigest: ZERO_DIGEST
  });
  return Object.freeze({
    ...provisional,
    descriptorDigest: descriptorDigest(provisional)
  });
}

function abgDescriptor(abgVersion) {
  return descriptorWithDigest({
    kind: "catalog_product_descriptor",
    schemaVersion: 1,
    descriptorId: `descriptor://abiogenesis/${abgVersion}`,
    publisher: "abiogenesis",
    productId: "abiogenesis",
    packageName: "@abiogenesis/typescript-tenant",
    version: abgVersion,
    distributionArtifactDigest: `sha256:${"a".repeat(64)}`,
    productContentDigest: `sha256:${"b".repeat(64)}`,
    contributionManifestId: `contribution://abiogenesis/${abgVersion}`,
    contributionManifestDigest: `sha256:${"c".repeat(64)}`,
    dependencies: [],
    abgCompatibility: abgVersion,
    contractRefs: ["abg.contract.gtl.m01", "abg.contract.gtl.m02"],
    capabilityRefs: [
      "abg.capability.gtl.admit@5",
      "abg.capability.module.publish@5",
      "abg.capability.catalog.invoke-graph-function@5"
    ],
    provenanceRefs: ["proof://t223/abiogenesis-candidate"]
  });
}

function productIntakeContext(catalog, root) {
  return Object.freeze({
    kind: "product_intake",
    publicContractCatalog: catalog,
    effects: createNodeProductIntakeEffects({
      temporaryRoot: path.join(root, "temporary")
    })
  });
}

function resolveFixture(input) {
  return catalogResolve(
    {
      requirements: [
        {
          productId: "abiogenesis",
          versionConstraint: input.abgVersion,
          requiredContractRefs: [],
          requiredCapabilityRefs: []
        },
        {
          productId: T223_FIXTURE_PRODUCT_ID,
          versionConstraint: T223_FIXTURE_VERSION,
          requiredContractRefs: input.descriptor.contractRefs,
          requiredCapabilityRefs: []
        }
      ],
      candidateDescriptors: [
        abgDescriptor(input.abgVersion),
        input.descriptor
      ]
    },
    input.context
  );
}

function runtimeDeclaration(input) {
  const locator = input.row.locator;
  assert.equal(locator.kind, "module_declaration");
  return Object.freeze({
    kind: "runtime_library_entry",
    moduleRef: input.moduleRef,
    module: input.module,
    declaration: constructGtlLibraryEntryDeclaration({
      declarationRef: input.row.declarationRef,
      entryRef: input.row.canonicalHandle,
      libraryScope: "product",
      entryKind: input.row.publicKind,
      namespace: T223_FIXTURE_PRODUCT_ID,
      ownerRef: "fixture",
      version: T223_FIXTURE_VERSION,
      graphFunctionRef: locator.declarationRef,
      interfaceRef: input.row.interfaceRef,
      sourceContractRef: input.row.contractRef,
      targetContractRef: input.row.contractRef,
      contextRefs: [],
      authorityRefs: [input.row.contractRef],
      overlayRefs: [],
      provenanceRefs: input.row.provenanceRefs,
      readinessRefs: input.row.readinessRefs,
      proofRefs: input.row.proofRefs,
      policyRefs: input.row.policyRefs,
      declarationSourceRefs: [input.moduleRef],
      refinementOfEntryRef: input.row.refinementOfHandle,
      overrideOfEntryRef: input.row.overrideOfHandle
    })
  });
}

function opaqueDeclaration(input) {
  const locator = input.row.locator;
  assert.equal(locator.kind, "opaque_overlay_asset");
  return Object.freeze({
    kind: "opaque_catalog_asset",
    declaration: admitOpaqueCatalogAssetDeclaration({
      kind: "opaque_catalog_asset_declaration",
      workspaceId: input.workspaceId,
      bindingId: input.bindingId,
      catalogId: input.catalogId,
      entryRef: input.row.canonicalHandle,
      declarationRef: input.row.declarationRef,
      declarationDigest: locator.assetDigest,
      libraryScope: "product",
      assetKind: "overlay",
      namespace: T223_FIXTURE_PRODUCT_ID,
      ownerRef: "fixture",
      version: T223_FIXTURE_VERSION,
      descriptorRef: input.descriptor.descriptorId,
      contributionManifestRef: input.contribution.contributionId,
      resolvedLockRef: input.lockRef,
      assetPath: locator.assetPath,
      schemaId: locator.schemaId,
      schemaVersion: locator.schemaVersion,
      schemaDigest: locator.schemaDigest,
      assetDigest: locator.assetDigest,
      authorityRefs: [input.row.contractRef],
      provenanceRefs: input.row.provenanceRefs,
      readinessRefs: input.row.readinessRefs,
      proofRefs: input.row.proofRefs,
      policyRefs: input.row.policyRefs,
      refinementOfEntryRef: input.row.refinementOfHandle,
      overrideOfEntryRef: input.row.overrideOfHandle,
      causationEventRefs: ["event://t223/fixture-bound"],
      correlationId: "correlation://t223/fixture-catalog"
    })
  });
}

test("T-223 Hello World fixture is a canonical declarations-only package", async () => {
  const packageRoot = path.join(T223_FIXTURE_ROOT, "package");
  const sidecarRoot = path.join(T223_FIXTURE_ROOT, "sidecars");
  assert.deepEqual(await fileTable(packageRoot), EXPECTED_PACKAGE_FILES);
  assert.deepEqual(await fileTable(sidecarRoot), [
    "contribution-manifest.json",
    "product-descriptor.json"
  ]);

  for (const relativePath of EXPECTED_PACKAGE_FILES) {
    assert.equal(path.extname(relativePath), ".json");
    await jsonFile(path.join(packageRoot, relativePath));
  }
  await jsonFile(path.join(sidecarRoot, "contribution-manifest.json"));
  await jsonFile(path.join(sidecarRoot, "product-descriptor.json"));

  const metadata = await jsonFile(path.join(packageRoot, "package.json"));
  assert.equal(metadata.private, true);
  for (const executableField of ["bin", "exports", "main", "scripts"]) {
    assert.equal(Object.hasOwn(metadata, executableField), false);
  }
  const module = admitModule(
    await jsonFile(path.join(packageRoot, "catalog/hello-world.module.json"))
  );
  assert.deepEqual(module.imports, []);
  assert.deepEqual(module.graphFunctions.map((value) => value.effects), [[], []]);
  assert.deepEqual(module.graphs, []);
  assert.deepEqual(module.operators, []);
  assert.deepEqual(module.evaluators, []);
  assert.deepEqual(module.rules, []);
  const hello = module.graphFunctions.find(
    (value) => value.name === T223_FIXTURE_GRAPH_HANDLE
  );
  assert.notEqual(hello, undefined);
  assert.equal(hello.template.kind, "inline_graph");
  const helloVector = hello.template.graph.vectors[0];
  assert.notEqual(helloVector, undefined);
  assert.deepEqual(
    helloVector.operators.map((operator) => operator.regime),
    ["F_P", "F_D"]
  );
  const programSelection = compileGraphVectorCProgramSelection({
    graphFunction: hello,
    graphVector: helloVector
  });
  assert.equal(programSelection.observed, true);
  assert.equal(
    programSelection.accepted,
    true,
    JSON.stringify(programSelection.diagnostics)
  );
  assert.equal(
    programSelection.binding?.selectedProgramRef,
    "program://fixture/hello-world/input-to-output"
  );
  assert.equal(programSelection.selectedCandidates.length, 1);
  const programAdmission = admitCProgramSyntax(
    programSelection.selectedCandidates[0].candidate
  );
  assert.equal(programAdmission.accepted, true);
  assert.notEqual(programAdmission.program, null);
  assert.deepEqual(cProgramLeaves(programAdmission.program.term), [
    ["transform", "F_P", "arm://fixture/hello-world/transform/fp"],
    ["evaluate", "F_D", "arm://fixture/hello-world/evaluate/fd"],
    ["evaluate", "F_P", "arm://fixture/hello-world/evaluate/fp"],
    ["consequence", "F_D", "arm://fixture/hello-world/consequence/fd"]
  ]);
  const handoff = compileGraphVectorExecutionHandoff({
    graphFunction: hello,
    graphVector: helloVector,
    graphFunctions: module.graphFunctions,
    module,
    targetCarrierDefaults: loadGtlTargetCarrierDefaultsBundle(),
    admittedTenantConformanceManifest: admittedTenantManifestFixture({
      fixtureId: "t223-hello-runtime",
      capabilityContractId: "abg.contract.t223-hello",
      capabilityId: "abg.capability.catalog.invoke-graph-function@5",
      effectRefs: []
    })
  });
  assert.equal(
    handoff.status,
    "published_startup_blocked",
    JSON.stringify(handoff.diagnostics)
  );
  const composition = hello?.declarations.entries.find(
    (entry) => entry.key === "abg.fn_composition"
  );
  assert.equal(composition?.value.kind, "hook_ref");
  const regimeBindings = composition.value.value.config.entries.find(
    (entry) => entry.key === "regime_bindings"
  );
  assert.equal(regimeBindings?.value.kind, "json_blob");
  assert.equal(regimeBindings.value.value.kind, "array");
  assert.deepEqual(
    regimeBindings.value.value.items.map((item) => {
      assert.equal(item.kind, "object");
      const fields = Object.fromEntries(
        item.entries.map((entry) => [entry.key, entry.value])
      );
      return [fields.stageRole, fields.regime, fields.role];
    }),
    [
      ["transform", "F_P", "construct"],
      ["evaluate", "F_D", "validate"],
      ["evaluate", "F_P", "validate"],
      ["consequence", "F_D", "observe"]
    ]
  );
});

test("T-223 Hello World fixture generation, sidecars, and packing are deterministic", async (t) => {
  const packageMetadata = JSON.parse(
    await readFile(path.resolve("package.json"), "utf8")
  );
  const abgVersion = packageMetadata.version;
  await checkT223HelloWorldFixture({
    root: T223_FIXTURE_ROOT,
    abgVersion
  });

  const root = await mkdtemp(path.join(tmpdir(), "abg-t223-fixture-determinism-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const first = await generateT223HelloWorldFixture({
    root: path.join(root, "first"),
    abgVersion
  });
  const second = await generateT223HelloWorldFixture({
    root: path.join(root, "second"),
    abgVersion
  });
  assert.deepEqual(
    await readFile(first.artifactPath),
    await readFile(second.artifactPath)
  );
  assert.equal(first.sidecars.artifactDigest, second.sidecars.artifactDigest);

  const descriptor = admitCatalogProductDescriptor(
    await jsonFile(path.join(first.root, "sidecars/product-descriptor.json"))
  );
  const contribution = admitCatalogContributionManifest(
    await jsonFile(path.join(first.root, "sidecars/contribution-manifest.json"))
  );
  const manifest = admitProductToolchainManifest(
    await jsonFile(path.join(first.packageRoot, "product-toolchain-manifest.json"))
  );
  assert.equal(descriptor.descriptorDigest, descriptorDigest(descriptor));
  assert.equal(
    contribution.contributionDigest,
    contributionManifestDigest(contribution)
  );
  assert.equal(
    manifest.publicContractCatalog.catalogDigest,
    publicContractCatalogDigest(manifest.publicContractCatalog)
  );
  assert.equal(
    descriptor.distributionArtifactDigest,
    sha256(await readFile(first.artifactPath))
  );
  assert.equal(contribution.artifactDigest, descriptor.distributionArtifactDigest);
  assert.equal(contribution.descriptorDigest, descriptor.descriptorDigest);
  assert.equal(descriptor.abgCompatibility, abgVersion);
  assert.equal(descriptor.dependencies[0].versionConstraint, abgVersion);
});

test("T-223 Hello World package resolves, verifies, and installs for the supplied ABG prerelease", async (t) => {
  const packageMetadata = JSON.parse(
    await readFile(path.resolve("package.json"), "utf8")
  );
  const abgVersion = packageMetadata.version;
  const root = await mkdtemp(path.join(tmpdir(), "abg-t223-fixture-install-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const generated = await generateT223HelloWorldFixture({
    root: path.join(root, "fixture"),
    abgVersion
  });
  const descriptor = admitCatalogProductDescriptor(
    await jsonFile(path.join(generated.root, "sidecars/product-descriptor.json"))
  );
  const contribution = admitCatalogContributionManifest(
    await jsonFile(path.join(generated.root, "sidecars/contribution-manifest.json"))
  );
  const manifest = admitProductToolchainManifest(
    await jsonFile(path.join(generated.packageRoot, "product-toolchain-manifest.json"))
  );
  const graphRow = contribution.rows.find(
    (row) => row.canonicalHandle === T223_FIXTURE_GRAPH_HANDLE
  );
  assert.notEqual(graphRow, undefined);
  assert.equal(graphRow.contractRef, "fixture.contract.hello-input");
  assert.deepEqual(graphRow.capabilityRefs, [
    "abg.capability.catalog.invoke-graph-function@5"
  ]);
  assert.deepEqual(descriptor.capabilityRefs, []);
  const graphContract = manifest.publicContractCatalog.rows.find(
    (row) => row.contractId === graphRow.contractRef
  );
  assert.equal(
    graphContract?.assetLocator?.relativePath,
    "contracts/hello-input.schema.json"
  );

  const context = productIntakeContext(manifest.publicContractCatalog, root);
  const resolution = resolveFixture({ abgVersion, context, descriptor });
  assert.equal(resolution.kind, "accepted");
  const verification = await catalogVerify(
    {
      artifact: {
        format: "npm_package_tgz",
        artifactPath: generated.artifactPath,
        expectedArtifactDigest: descriptor.distributionArtifactDigest,
        expectedProductContentDigest: descriptor.productContentDigest
      },
      descriptor,
      contributionManifest: contribution,
      resolvedLock: resolution.value
    },
    context
  );
  assert.equal(verification.kind, "accepted", verification.message);
  const toolchainRoot = path.join(root, "toolchain");
  const installation = await installProduct(
    {
      verifiedArtifact: verification.value,
      toolchainRoot,
      workspaceBindingRef: null
    },
    context,
    {
      actorRef: "actor://t223/fixture-test",
      provenanceRefs: ["proof://t223/fixture-install"]
    }
  );
  assert.equal(installation.kind, "accepted", installation.message);
  assert.equal(installation.value.productId, T223_FIXTURE_PRODUCT_ID);
  assert.deepEqual(
    await fileTable(installation.value.productRoot),
    EXPECTED_PACKAGE_FILES
  );
  assert.equal(
    await readJson(installation.value.descriptorRecordPath).then(
      ({ value }) => value.descriptorDigest
    ),
    descriptor.descriptorDigest
  );
  assert.equal(
    await readJson(installation.value.contributionRecordPath).then(
      ({ value }) => value.contributionDigest
    ),
    contribution.contributionDigest
  );
});

test("T-223 fixture exposes one callable GraphFunction while node and overlay rows stay non-callable", async () => {
  const packageRoot = path.join(T223_FIXTURE_ROOT, "package");
  const sidecarRoot = path.join(T223_FIXTURE_ROOT, "sidecars");
  const module = admitModule(
    await jsonFile(path.join(packageRoot, "catalog/hello-world.module.json"))
  );
  const descriptor = admitCatalogProductDescriptor(
    await jsonFile(path.join(sidecarRoot, "product-descriptor.json"))
  );
  const contribution = admitCatalogContributionManifest(
    await jsonFile(path.join(sidecarRoot, "contribution-manifest.json"))
  );
  const authority = constructModuleLookupAuthority(module);
  const graphFunction = resolvePublishedGraphFunction(
    authority,
    T223_FIXTURE_GRAPH_HANDLE
  );
  assert.equal(graphFunction.name, T223_FIXTURE_GRAPH_HANDLE);
  assert.deepEqual(
    graphFunction.declarations.entries.find(
      (entry) => entry.key === "abg.plugin_selection"
    )?.value,
    {
      kind: "json_blob",
      value: {
        kind: "object",
        entries: [
          {
            key: "fdEvaluator",
            value: "plugin://abg/fd-evaluator"
          },
          {
            key: "fpEvaluator",
            value: "plugin://abg/fp-evaluator-live"
          },
          {
            key: "fpDispatch",
            value: "plugin://abg/fp-dispatch-live"
          }
        ]
      }
    }
  );
  assert.equal(
    resolvePublishedGraphFunction(authority, T223_FIXTURE_NODE_HANDLE).name,
    T223_FIXTURE_NODE_HANDLE
  );
  assert.equal(
    materializeNodeType({
      typeRef: T223_FIXTURE_NODE_HANDLE,
      graphFunctions: module.graphFunctions
    }).satisfied,
    true
  );
  assert.throws(
    () => resolvePublishedGraphFunction(authority, T223_FIXTURE_OVERLAY_HANDLE),
    /publishes no graph function/u
  );

  const workspaceId = "workspace://t223/fixture";
  const bindingId = "binding://t223/fixture";
  const catalogId = "catalog://t223/fixture";
  const lockRef = "lock://t223/fixture";
  const moduleRef = `${contribution.contributionId}#catalog/hello-world.module.json`;
  const declarations = contribution.rows.map((row) =>
    row.publicKind === "overlay"
      ? opaqueDeclaration({
          bindingId,
          catalogId,
          contribution,
          descriptor,
          lockRef,
          row,
          workspaceId
        })
      : runtimeDeclaration({ module, moduleRef, row })
  );
  const events = [];
  const admitted = admitBoundWorkspaceCatalog(
    {
      kind: "bound_catalog_admission_batch",
      workspaceId,
      bindingId,
      catalogId,
      resolvedLockRef: lockRef,
      systemDeclarations: [],
      orderedProductBatches: [
        {
          kind: "bound_catalog_product_batch",
          descriptorRef: descriptor.descriptorId,
          contributionManifestRef: contribution.contributionId,
          productStartupConfig: constructProductRegistryStartupConfig({
            configRef: "product-registry-startup://t223/fixture",
            productNamespace: T223_FIXTURE_PRODUCT_ID,
            ownerRef: "fixture",
            version: T223_FIXTURE_VERSION,
            enabledLibraryRefs: [],
            readinessRefs: ["readiness://fixture/hello-world/declared"],
            proofRefs: ["proof://fixture/hello-world/declared"],
            policyRefs: ["policy://fixture/default"],
            configSourceRefs: [contribution.contributionId]
          }),
          declarations
        }
      ],
      causationEventRefs: ["event://t223/fixture-bound"],
      correlationId: "correlation://t223/fixture-catalog"
    },
    (event) => events.push(event)
  );
  assert.equal(admitted.accepted, true);
  assert.notEqual(admitted.basis, null);
  const session = deriveRegistrySessionView({ basis: admitted.basis });
  assert.equal(session.accepted, true);
  assert.deepEqual(
    session.view.entries.map((entry) => [entry.entryRef, entry.callable]),
    [
      [T223_FIXTURE_GRAPH_HANDLE, true],
      [T223_FIXTURE_NODE_HANDLE, false],
      [T223_FIXTURE_OVERLAY_HANDLE, false]
    ]
  );
  assert.equal(
    session.view.entries.find(
      (entry) => entry.entryRef === T223_FIXTURE_GRAPH_HANDLE
    ).interfaceRef,
    T223_FIXTURE_INTERFACE_REF
  );
  assert.equal(events.length, 3);
});
