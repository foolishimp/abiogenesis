// Validates: T-223 DS-1 product resolution, verification, and installation
// Validates: REQ-P-CATALOG-010..013, REQ-P-INSTALL-043..048, REQ-P-INSTALL-052

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import path from "node:path";
import test from "node:test";
import { TextEncoder } from "node:util";

import {
  assertDs1ContractRoster,
  assertProductProfileMatrix,
  assertResolvedProductLockCoherence,
  catalogResolve,
  catalogVerify,
  compareCanonicalStrings,
  contributionManifestDigest,
  descriptorDigest,
  installProduct,
  publicContractCatalogDigest,
  resolvedProductLockDigest,
  resolvedProductLockId
} from "../../build/semantic/code/src/app/m04/product_intake/index.js";
import {
  canonicalizeIJson,
  digestCanonicalIJson
} from "../../build/semantic/code/src/app/m04/public_sdk/canonical.js";

const encoder = new TextEncoder();
const ZERO_DIGEST = `sha256:${"0".repeat(64)}`;

function sha256Bytes(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function jsonBytes(value) {
  return encoder.encode(canonicalizeIJson(value));
}

function descriptorWithDigest(input) {
  const provisional = {
    ...input,
    descriptorDigest: ZERO_DIGEST
  };
  return Object.freeze({
    ...provisional,
    descriptorDigest: descriptorDigest(provisional)
  });
}

function publicRow(input) {
  const digest = sha256Bytes(input.bytes);
  return Object.freeze({
    contractId: input.contractId,
    contractKind: input.contractKind,
    owningProductId: "hello-product",
    version: "1.0.0",
    digest,
    authorityRefs: ["requirement://hello"],
    capabilityRefs: input.capabilityRefs ?? [],
    nativeLocator: null,
    assetLocator: {
      kind: "asset",
      relativePath: input.relativePath,
      schemaId: `schema://${input.contractId}`,
      schemaVersion: "1.0.0",
      mediaType: "application/json",
      digest
    },
    operationContract: null
  });
}

function productContentDigest(files) {
  const inventory = [...files.entries()]
    .map(([relativePath, bytes]) => [relativePath, sha256Bytes(bytes)])
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));
  return digestCanonicalIJson(inventory);
}

function buildFixture(options = {}) {
  const schemaBytes = options.schemaBytes ?? encoder.encode('{"type":"object"}');
  const abgVersion = options.abgVersion ?? "5.0.0";
  const dependencyVersionConstraint =
    options.dependencyVersionConstraint ?? "5.0.0";
  const helloAbgCompatibility =
    options.helloAbgCompatibility ?? ">=5.0.0 <6.0.0";
  const capabilityBytes = encoder.encode('{"kind":"capability"}');
  const catalogSchemaBytes =
    options.catalogSchemaBytes ?? encoder.encode('{"type":"catalog"}');
  const moduleBytes = encoder.encode('{"kind":"module","id":"hello"}');
  const rows = [
    publicRow({
      contractId: "hello.contract",
      contractKind: "schema_asset",
      relativePath: "contracts/hello.schema.json",
      bytes: schemaBytes
    }),
    publicRow({
      contractId: "hello.capability",
      contractKind: "capability",
      relativePath: "contracts/hello.capability.json",
      bytes: capabilityBytes,
      capabilityRefs: ["hello.capability"]
    })
  ];
  const catalogWithoutDigest = {
    kind: "abg_public_contract_catalog",
    schemaVersion: 1,
    catalogId: "catalog://hello/1",
    catalogVersion: "1.0.0",
    catalogDigest: ZERO_DIGEST,
    catalogSchemaPath: "contracts/catalog.schema.json",
    catalogSchemaDigest: sha256Bytes(catalogSchemaBytes),
    profile: "catalog-product-v1",
    rows
  };
  const catalog = Object.freeze({
    ...catalogWithoutDigest,
    catalogDigest: publicContractCatalogDigest(catalogWithoutDigest)
  });
  const files = new Map([
    ["contracts/hello.schema.json", schemaBytes],
    ["contracts/hello.capability.json", capabilityBytes],
    ["contracts/catalog.schema.json", catalogSchemaBytes],
    ["contracts/catalog.json", jsonBytes(catalog)],
    ["modules/hello.module.json", moduleBytes]
  ]);
  const contentDigest = productContentDigest(files);
  const manifest = Object.freeze({
    kind: "abg_product_toolchain_manifest",
    schemaVersion: 1,
    publisher: "example",
    productId: "hello-product",
    packageName: "@example/hello-product",
    packageVersion: "1.0.0",
    productContentDigest: contentDigest,
    publicContractCatalogPath: "contracts/catalog.json",
    publicContractCatalogDigest: catalog.catalogDigest,
    publicContractCatalog: catalog,
    runtimeSystemProfile: null,
    productRelativeLocators: [...files.keys()]
  });
  files.set("product-toolchain-manifest.json", jsonBytes(manifest));

  const artifactBytes = encoder.encode("npm-tgz-fixture:hello-product@1.0.0");
  const artifactDigest = sha256Bytes(artifactBytes);
  const artifact = Object.freeze({
    format: "npm_package_tgz",
    artifactPath: "/fixtures/hello-product-1.0.0.tgz",
    expectedArtifactDigest: artifactDigest,
    expectedProductContentDigest: contentDigest
  });
  const contributionWithoutDigests = {
    kind: "catalog_contribution_manifest",
    schemaVersion: 1,
    contributionId: "contribution://hello/1",
    contributionDigest: ZERO_DIGEST,
    descriptorId: "descriptor://hello/1",
    descriptorDigest: ZERO_DIGEST,
    productId: "hello-product",
    productVersion: "1.0.0",
    artifactDigest,
    rows: [
      {
        canonicalHandle: "graph-function://hello/world",
        publicKind: "graph_function",
        ownerProductId: "hello-product",
        ownerVersion: "1.0.0",
        declarationRef: "declaration://hello/world",
        contractRef: "hello.contract",
        interfaceRef: "interface://hello/world",
        locator: {
          kind: "module_declaration",
          modulePath: "modules/hello.module.json",
          moduleDigest: sha256Bytes(moduleBytes),
          declarationRef: "declaration://hello/world"
        },
        compatibility: {
          abgVersionRange: ">=5.0.0 <6.0.0",
          requiredProductRefs: ["abiogenesis"],
          requiredContractRefs: ["hello.contract"],
          requiredCapabilityRefs: ["hello.capability"]
        },
        readinessRefs: [],
        proofRefs: [],
        policyRefs: [],
        capabilityRefs: ["hello.capability"],
        provenanceRefs: ["provenance://hello"],
        refinementOfHandle: null,
        overrideOfHandle: null
      }
    ]
  };
  const contributionDigest = contributionManifestDigest(
    contributionWithoutDigests
  );
  const dependency = Object.freeze({
    productId: "abiogenesis",
    versionConstraint: dependencyVersionConstraint,
    requiredContractRefs: ["abg.contract.gtl.m01"],
    requiredCapabilityRefs: ["abg.capability.gtl.declare@5"]
  });
  const helloDescriptor = descriptorWithDigest({
    kind: "catalog_product_descriptor",
    schemaVersion: 1,
    descriptorId: "descriptor://hello/1",
    publisher: "example",
    productId: "hello-product",
    packageName: "@example/hello-product",
    version: "1.0.0",
    distributionArtifactDigest: artifactDigest,
    productContentDigest: contentDigest,
    contributionManifestId: "contribution://hello/1",
    contributionManifestDigest: contributionDigest,
    dependencies: [dependency],
    abgCompatibility: helloAbgCompatibility,
    contractRefs: ["hello.contract"],
    capabilityRefs: ["hello.capability"],
    provenanceRefs: ["provenance://hello"]
  });
  const contribution = Object.freeze({
    ...contributionWithoutDigests,
    contributionDigest,
    descriptorDigest: helloDescriptor.descriptorDigest
  });
  const abgDescriptor = descriptorWithDigest({
    kind: "catalog_product_descriptor",
    schemaVersion: 1,
    descriptorId: "descriptor://abiogenesis/5",
    publisher: "abiogenesis",
    productId: "abiogenesis",
    packageName: "@abiogenesis/typescript-tenant",
    version: abgVersion,
    distributionArtifactDigest: `sha256:${"a".repeat(64)}`,
    productContentDigest: `sha256:${"b".repeat(64)}`,
    contributionManifestId: "contribution://abiogenesis/5",
    contributionManifestDigest: `sha256:${"c".repeat(64)}`,
    dependencies: [],
    abgCompatibility: `>=${abgVersion} <6.0.0`,
    contractRefs: ["abg.contract.gtl.m01"],
    capabilityRefs: ["abg.capability.gtl.declare@5"],
    provenanceRefs: ["provenance://abiogenesis"]
  });
  const artifactEntries = [...files.entries()].map(([relativePath, bytes]) => ({
    relativePath: `package/${relativePath}`,
    bytes
  }));
  return {
    artifact,
    artifactBytes,
    artifactEntries,
    manifest,
    catalog,
    contribution,
    helloDescriptor,
    abgDescriptor
  };
}

function productContext(fixture) {
  const records = new Map();
  const installedBytes = new Map();
  const calls = {
    artifactReads: 0,
    inspections: 0,
    materializations: 0,
    materializationDestinations: []
  };
  const context = {
    kind: "product_intake",
    effects: {
      readArtifactBytes: async () => {
        calls.artifactReads += 1;
        return fixture.artifactBytes;
      },
      readInstalledBytes: async (absolutePath) =>
        installedBytes.get(absolutePath) ?? null,
      inspectArtifact: async () => {
        calls.inspections += 1;
        return fixture.artifactEntries;
      },
      readRecord: async (absolutePath) => records.get(absolutePath) ?? null,
      writeRecord: async (absolutePath, value) => {
        records.set(absolutePath, value);
      },
      materializeVerifiedArtifact: async (artifact, destinationRoot) => {
        calls.materializations += 1;
        calls.materializationDestinations.push(destinationRoot);
        records.set(
          path.join(destinationRoot, "product-toolchain-manifest.json"),
          artifact.productManifest
        );
        for (const entry of fixture.artifactEntries) {
          const relativePath = entry.relativePath.startsWith("package/")
            ? entry.relativePath.slice("package/".length)
            : entry.relativePath;
          installedBytes.set(path.join(destinationRoot, relativePath), entry.bytes);
        }
      },
      readEnvironment: () => null,
      readWorkspaceBinding: async () => null
    }
  };
  return { context, records, installedBytes, calls };
}

function resolveFixture(fixture, context) {
  return catalogResolve(
    {
      requirements: [
        {
          productId: "abiogenesis",
          versionConstraint: fixture.abgDescriptor.version,
          requiredContractRefs: [],
          requiredCapabilityRefs: []
        },
        {
          productId: "hello-product",
          versionConstraint: "1.0.0",
          requiredContractRefs: ["hello.contract"],
          requiredCapabilityRefs: ["hello.capability"]
        }
      ],
      candidateDescriptors: [fixture.helloDescriptor, fixture.abgDescriptor]
    },
    context
  );
}

async function resolveAndVerify(fixture, context) {
  const resolveOutcome = resolveFixture(fixture, context);
  assert.equal(resolveOutcome.kind, "accepted");
  assert.deepEqual(
    resolveOutcome.value.products.map((product) => product.productId),
    ["abiogenesis", "hello-product"]
  );
  const verifyOutcome = await catalogVerify(
    {
      artifact: fixture.artifact,
      descriptor: fixture.helloDescriptor,
      contributionManifest: fixture.contribution,
      resolvedLock: resolveOutcome.value
    },
    context
  );
  assert.equal(verifyOutcome.kind, "accepted");
  return { lock: resolveOutcome.value, verified: verifyOutcome.value };
}

test("T-223 product resolver derives one exact coherent lock", async () => {
  const fixture = buildFixture();
  const { context } = productContext(fixture);
  const { lock } = await resolveAndVerify(fixture, context);

  assert.deepEqual(assertResolvedProductLockCoherence(lock), lock);
  assert.equal(compareCanonicalStrings("Z", "a"), -1);

  const callerId = {
    ...lock,
    lockId: "lock:caller-chosen"
  };
  const callerIdWithDigest = {
    ...callerId,
    lockDigest: resolvedProductLockDigest(callerId)
  };
  assert.throws(
    () => assertResolvedProductLockCoherence(callerIdWithDigest),
    /lockId: identity mismatch/u
  );

  const duplicatedCompatibility = {
    ...lock,
    compatibility: [lock.compatibility[0], lock.compatibility[0]]
  };
  const duplicateWithId = {
    ...duplicatedCompatibility,
    lockId: resolvedProductLockId(duplicatedCompatibility)
  };
  const duplicateWithDigest = {
    ...duplicateWithId,
    lockDigest: resolvedProductLockDigest(duplicateWithId)
  };
  assert.throws(
    () => assertResolvedProductLockCoherence(duplicateWithDigest),
    /compatibility: incomplete or incompatible/u
  );
});

test("T-223 verifier preserves the acyclic contribution back-reference law", () => {
  const fixture = buildFixture();
  const changedBackReference = {
    ...fixture.contribution,
    descriptorDigest: `sha256:${"f".repeat(64)}`
  };
  assert.equal(
    contributionManifestDigest(changedBackReference),
    fixture.contribution.contributionDigest
  );
  assert.equal(assertProductProfileMatrix(fixture.manifest), fixture.manifest);
  assert.throws(
    () =>
      assertProductProfileMatrix({
        ...fixture.manifest,
        publicContractCatalog: {
          ...fixture.catalog,
          profile: "abg-5-ds1"
        }
      }),
    /catalog products require catalog-product-v1/u
  );
  assert.throws(
    () =>
      assertDs1ContractRoster({
        ...fixture.catalog,
        profile: "abg-5-ds1"
      }),
    /DS-1 native_contract roster mismatch/u
  );
  assert.throws(
    () =>
      assertProductProfileMatrix({
        ...fixture.manifest,
        publicContractCatalog: {
          ...fixture.catalog,
          rows: [
            {
              ...fixture.catalog.rows[0],
              contractId: "abg.operation.catalog.invoke"
            }
          ]
        }
      }),
    /cannot claim the ABIogenesis native or operation roster/u
  );
});

test("T-223 verifier rejects invalid UTF-8 and duplicate archive paths", async () => {
  const fixture = buildFixture();
  const base = productContext(fixture);
  const { lock } = await resolveAndVerify(fixture, base.context);

  const invalidUtf8Context = {
    ...base.context,
    effects: {
      ...base.context.effects,
      inspectArtifact: async () =>
        fixture.artifactEntries.map((entry) =>
          entry.relativePath === "package/product-toolchain-manifest.json"
            ? { ...entry, bytes: Uint8Array.of(0xff) }
            : entry
        )
    }
  };
  const invalidUtf8 = await catalogVerify(
    {
      artifact: fixture.artifact,
      descriptor: fixture.helloDescriptor,
      contributionManifest: fixture.contribution,
      resolvedLock: lock
    },
    invalidUtf8Context
  );
  assert.equal(invalidUtf8.kind, "refused");
  assert.equal(invalidUtf8.code, "unsupported_contract");

  const duplicateContext = {
    ...base.context,
    effects: {
      ...base.context.effects,
      inspectArtifact: async () => [
        ...fixture.artifactEntries,
        fixture.artifactEntries[0]
      ]
    }
  };
  const duplicate = await catalogVerify(
    {
      artifact: fixture.artifact,
      descriptor: fixture.helloDescriptor,
      contributionManifest: fixture.contribution,
      resolvedLock: lock
    },
    duplicateContext
  );
  assert.equal(duplicate.kind, "refused");
  assert.equal(duplicate.code, "unsafe_archive");

  const malformedAssetFixture = buildFixture({
    schemaBytes: Uint8Array.of(0xff)
  });
  const malformedAssetContext = productContext(malformedAssetFixture).context;
  const malformedAssetLock = resolveFixture(
    malformedAssetFixture,
    malformedAssetContext
  );
  assert.equal(malformedAssetLock.kind, "accepted");
  const malformedAsset = await catalogVerify(
    {
      artifact: malformedAssetFixture.artifact,
      descriptor: malformedAssetFixture.helloDescriptor,
      contributionManifest: malformedAssetFixture.contribution,
      resolvedLock: malformedAssetLock.value
    },
    malformedAssetContext
  );
  assert.equal(malformedAsset.kind, "refused");
  assert.equal(malformedAsset.code, "unsupported_contract");

  const malformedCatalogSchemaFixture = buildFixture({
    catalogSchemaBytes: Uint8Array.of(0xff)
  });
  const malformedCatalogSchemaContext = productContext(
    malformedCatalogSchemaFixture
  ).context;
  const malformedCatalogSchemaLock = resolveFixture(
    malformedCatalogSchemaFixture,
    malformedCatalogSchemaContext
  );
  assert.equal(malformedCatalogSchemaLock.kind, "accepted");
  const malformedCatalogSchema = await catalogVerify(
    {
      artifact: malformedCatalogSchemaFixture.artifact,
      descriptor: malformedCatalogSchemaFixture.helloDescriptor,
      contributionManifest: malformedCatalogSchemaFixture.contribution,
      resolvedLock: malformedCatalogSchemaLock.value
    },
    malformedCatalogSchemaContext
  );
  assert.equal(malformedCatalogSchema.kind, "refused");
  assert.equal(malformedCatalogSchema.code, "unsupported_contract");
});

test("T-223 resolver does not admit prerelease compatibility by implication", () => {
  const fixture = buildFixture({
    abgVersion: "5.0.0-rc.1",
    dependencyVersionConstraint: ">=5.0.0-rc.1 <6.0.0",
    helloAbgCompatibility: ">=5.0.0 <6.0.0"
  });
  const outcome = resolveFixture(fixture, productContext(fixture).context);
  assert.equal(outcome.kind, "refused");
  assert.equal(outcome.code, "incompatible");
});

test("T-223 install is source-blind, npm-layout exact, distinct, and idempotent", async () => {
  const fixture = buildFixture();
  const harness = productContext(fixture);
  const { verified } = await resolveAndVerify(fixture, harness.context);
  const request = {
    verifiedArtifact: verified,
    toolchainRoot: "/tmp/t223-toolchain",
    workspaceBindingRef: null
  };

  const blankActor = await installProduct(request, harness.context, {
    actorRef: ""
  });
  assert.equal(blankActor.kind, "refused");
  assert.equal(blankActor.code, "unverified");
  assert.equal(harness.calls.materializations, 0);

  const first = await installProduct(request, harness.context, {
    actorRef: "actor://t223/test",
    provenanceRefs: ["provenance://t223/test"]
  });
  assert.equal(first.kind, "accepted");
  assert.equal(first.disposition, "installed");
  assert.equal(
    first.value.packageRoot,
    "/tmp/t223-toolchain/products/hello-product/1.0.0"
  );
  assert.match(
    first.value.descriptorRecordPath,
    /records\/example\/hello-product\/1\.0\.0\/[0-9a-f]{64}\/product-descriptor\.json$/u
  );
  assert.equal(harness.calls.materializations, 1);
  assert.deepEqual(harness.calls.materializationDestinations, [
    "/tmp/t223-toolchain/products/hello-product/1.0.0"
  ]);
  assert.equal(
    canonicalizeIJson(harness.records.get(first.value.lockRecordPath)),
    canonicalizeIJson(verified.resolvedLock)
  );

  const second = await installProduct(request, harness.context, {
    actorRef: "actor://t223/second"
  });
  assert.equal(second.kind, "accepted");
  assert.equal(second.disposition, "already_installed_exact");
  assert.equal(second.value.installedProductId, first.value.installedProductId);
  assert.equal(harness.calls.materializations, 1);
  const verificationRecordPath = path.join(
    path.dirname(first.value.descriptorRecordPath),
    "verification-result.json"
  );
  const verificationRecord = harness.records.get(verificationRecordPath);
  assert.equal(verificationRecord.kind, "product_verification_record");
  assert.equal(verificationRecord.disposition, "verified");
  assert.equal(verificationRecord.verifiedArtifact.verificationChecks.length > 0, true);

  harness.installedBytes.delete(
    path.join(first.value.productRoot, verified.productContentInventory[0].relativePath)
  );
  const incomplete = await installProduct(request, harness.context, {
    actorRef: "actor://t223/third"
  });
  assert.equal(incomplete.kind, "refused");
  assert.equal(incomplete.code, "installed_identity_conflict");

  const staleBindingContext = {
    ...harness.context,
    effects: {
      ...harness.context.effects,
      readEnvironment: () => "/tmp/ambient-toolchain",
      readWorkspaceBinding: async () => null
    }
  };
  const staleBinding = await installProduct(
    {
      verifiedArtifact: verified,
      toolchainRoot: null,
      workspaceBindingRef: "binding://missing"
    },
    staleBindingContext,
    { actorRef: "actor://t223/test" }
  );
  assert.equal(staleBinding.kind, "refused");
  assert.equal(staleBinding.code, "toolchain_unresolved");
});
