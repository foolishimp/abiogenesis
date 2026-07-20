// Validates: T-268; REQ-M-GTL3-CAPABILITY-001..015.

import assert from "node:assert/strict";
import test from "node:test";

import {
  admitTenantConformanceManifest,
  projectAbgTenantConformanceManifest,
  publicContractCatalogDigest
} from "../../build/semantic/code/src/app/m04/product_intake/index.js";
import {
  DS1_CAPABILITY_CONTRACT_REGISTER,
  DS1_CAPABILITY_DEFINITION_GRAPH
} from "../../build/semantic/code/src/app/m04/public_contracts/index.js";
import {
  buildAbgSystemSunnyGraphFunctionModule
} from "../../build/semantic/code/src/app/m04/public_contracts/abg_system_sunny_graph_function.js";
import {
  prepareAbgProductPublication
} from "../tools/publish_abg_product_contracts.mjs";

const CURRENT_SUNNY_CAPABILITIES = Object.freeze([
  "abg.capability.catalog.contribute@5",
  "abg.capability.catalog.invoke-graph-function@5",
  "abg.capability.gtl.admit@5",
  "abg.capability.gtl.declare@5",
  "abg.capability.gtl.serialize@5",
  "abg.capability.install.bind-products@5",
  "abg.capability.module.publish@5",
  "abg.capability.runtime.execute-seven-term-c@5"
]);

test("T-268 projects one truthful current ABG manifest from DS1 and the exact catalog", async () => {
  const prepared = await prepareAbgProductPublication();
  const publication = prepared.publication;
  const manifest = publication.tenantConformanceManifest;
  const admitted = admitTenantConformanceManifest(
    manifest,
    publication.catalog
  );

  assert.equal(manifest.kind, "abg_tenant_conformance_manifest");
  assert.equal(
    manifest.capabilityDefinitionGraph.graphDigest,
    DS1_CAPABILITY_DEFINITION_GRAPH.graphDigest
  );
  assert.deepEqual(
    manifest.capabilityClaims.map((row) => row.capabilityId),
    CURRENT_SUNNY_CAPABILITIES
  );
  assert.deepEqual(
    [...DS1_CAPABILITY_CONTRACT_REGISTER]
      .map((row) => row.capabilityId)
      .sort(),
    CURRENT_SUNNY_CAPABILITIES
  );
  assert.equal(
    manifest.capabilityClaims.some(
      (row) => row.capabilityId === "abg.capability.fh.interact@5"
    ),
    false
  );
  assert.equal(
    manifest.capabilityClaims.some(
      (row) => row.capabilityId ===
        "abg.capability.graph-function.consensus@5"
    ),
    false
  );
  const sunnyGraphFunction =
    buildAbgSystemSunnyGraphFunctionModule().graphFunctions[0];
  assert.notEqual(sunnyGraphFunction, undefined);
  assert.deepEqual(sunnyGraphFunction.effects, []);
  assert.deepEqual(manifest.effectBindings, []);
  assert.equal(
    manifest.capabilityClaims.some((row) =>
      row.capabilityId ===
        "abg.capability.runtime.execute-seven-term-c@5"
    ),
    true
  );
  assert.equal(Object.hasOwn(manifest, "runtimeAddressable"), false);
  assert.equal(Object.hasOwn(manifest, "publicOperationDelivery"), false);
  assert.equal(
    manifest.publicContractClaims.every((claim) =>
      publication.catalog.rows.some((row) =>
        row.contractId === claim.contractId &&
        row.version === claim.contractVersion &&
        row.digest === claim.contractDigest
      )
    ),
    true
  );
  assert.equal(
    manifest.enforcementClaims.every(
      (claim) => claim.boundedProofRefs.length > 0
    ),
    true
  );
  assert.equal(admitted.manifest.manifestDigest, manifest.manifestDigest);
  assert.equal(
    publication.productContentInventory.some(
      (row) => row.relativePath ===
        "contracts/tenant-conformance-manifest.json"
    ),
    true
  );
});

test("T-268 projection refuses a stale graph digest and missing required catalog row", async () => {
  const prepared = await prepareAbgProductPublication();
  const publication = prepared.publication;
  assert.throws(
    () => projectAbgTenantConformanceManifest({
      manifestId: "abg.tenant-conformance.abiogenesis",
      manifestVersion: prepared.packageManifest.version,
      engineId: "abg.engine.abiogenesis",
      engineVersion: prepared.packageManifest.version,
      capabilityDefinitionGraph: Object.freeze({
        ...DS1_CAPABILITY_DEFINITION_GRAPH,
        graphDigest: `sha256:${"f".repeat(64)}`
      }),
      publicContractCatalog: publication.catalog
    }),
    /capability-definition graph digest/u
  );

  const missingRuntimeResultBasis = Object.freeze({
    ...publication.catalog,
    catalogDigest: `sha256:${"0".repeat(64)}`,
    rows: Object.freeze(publication.catalog.rows.filter(
      (row) => row.contractId !== "abg.schema.runtime-result"
    ))
  });
  const missingRuntimeResult = Object.freeze({
    ...missingRuntimeResultBasis,
    catalogDigest: publicContractCatalogDigest(missingRuntimeResultBasis)
  });
  assert.throws(
    () => projectAbgTenantConformanceManifest({
      manifestId: "abg.tenant-conformance.abiogenesis",
      manifestVersion: prepared.packageManifest.version,
      engineId: "abg.engine.abiogenesis",
      engineVersion: prepared.packageManifest.version,
      capabilityDefinitionGraph: DS1_CAPABILITY_DEFINITION_GRAPH,
      publicContractCatalog: missingRuntimeResult
    }),
    /requires one exact catalog row for abg\.schema\.runtime-result/u
  );
});
