// Validates: T-223 packed ABG candidate and detached publication sidecars
// Validates: REQ-P-CATALOG, REQ-P-INSTALL, REQ-P-PUBLIC-CONTRACTS

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { TextDecoder } from "node:util";

import {
  admitIJsonText,
  admitModule,
  catalogResolve,
  catalogVerify,
  constructModuleLookupAuthority,
  createNodeProductIntakeEffects,
  resolvePublishedGraphFunction
} from "../../build/semantic/code/src/index.js";
import {
  T223_ABG_SYSTEM_GRAPH_FUNCTION_HANDLE,
  T223_ABG_SYSTEM_MODULE_PATH
} from "../tools/publish_abg_product_contracts.mjs";
import { prepareT223AbgCandidate } from "../tools/t223_abg_candidate.mjs";

function productIntakeContext(candidate, root) {
  return Object.freeze({
    kind: "product_intake",
    publicContractCatalog: candidate.publication.publication.catalog,
    effects: createNodeProductIntakeEffects({
      temporaryRoot: path.join(root, "temporary")
    })
  });
}

test("T-223 ABG candidate packs one Module-backed SYSTEM GraphFunction and verifies source-blind", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t223-candidate-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const candidate = await prepareT223AbgCandidate({
    outputRoot: path.join(root, "candidate")
  });
  const catalog = candidate.publication.publication.catalog;
  const manifest = candidate.publication.publication.manifest;

  assert.equal(candidate.descriptor.version, manifest.packageVersion);
  assert.equal(
    candidate.descriptor.distributionArtifactDigest,
    candidate.artifact.expectedArtifactDigest
  );
  assert.equal(candidate.contribution.rows.length, 1);
  const systemRow = candidate.contribution.rows[0];
  assert.ok(systemRow);
  assert.equal(systemRow.canonicalHandle, T223_ABG_SYSTEM_GRAPH_FUNCTION_HANDLE);
  assert.equal(systemRow.publicKind, "graph_function");
  assert.equal(systemRow.ownerProductId, "abiogenesis");
  assert.equal(systemRow.locator.kind, "module_declaration");
  assert.equal(systemRow.locator.modulePath, T223_ABG_SYSTEM_MODULE_PATH);
  assert.equal(systemRow.locator.declarationRef, systemRow.declarationRef);

  const contractRefs = catalog.rows
    .filter((row) => row.contractKind !== "capability")
    .map((row) => row.contractId)
    .sort();
  const capabilityRefs = catalog.rows
    .filter((row) => row.contractKind === "capability")
    .map((row) => row.contractId)
    .sort();
  assert.deepEqual(candidate.descriptor.contractRefs, contractRefs);
  assert.deepEqual(candidate.descriptor.capabilityRefs, capabilityRefs);

  const context = productIntakeContext(candidate, root);
  const packedEntries = await context.effects.inspectArtifact(candidate.artifact);
  const packedPaths = packedEntries.map((entry) => entry.relativePath);
  assert.equal(packedPaths.some((entry) => entry.startsWith("package/test_env/")), false);
  assert.equal(packedPaths.some((entry) => entry.startsWith("package/code/")), false);
  const packedModule = packedEntries.find(
    (entry) => entry.relativePath === `package/${T223_ABG_SYSTEM_MODULE_PATH}`
  );
  assert.notEqual(packedModule, undefined);
  const module = admitModule(
    admitIJsonText(
      new TextDecoder("utf-8", { fatal: true }).decode(packedModule.bytes),
      T223_ABG_SYSTEM_MODULE_PATH
    )
  );
  const graphFunction = resolvePublishedGraphFunction(
    constructModuleLookupAuthority(module),
    T223_ABG_SYSTEM_GRAPH_FUNCTION_HANDLE
  );
  assert.equal(graphFunction.name, T223_ABG_SYSTEM_GRAPH_FUNCTION_HANDLE);
  assert.equal(graphFunction.template.kind, "inline_graph");
  assert.equal(graphFunction.template.graph.vectors.length, 0);
  assert.deepEqual(
    graphFunction.inputs.map((node) => node.schema.ref),
    ["abg.schema.gtl-graph-function"]
  );
  assert.deepEqual(graphFunction.outputs, graphFunction.inputs);

  const resolution = catalogResolve(
    {
      requirements: [
        {
          productId: "abiogenesis",
          versionConstraint: manifest.packageVersion,
          requiredContractRefs: ["abg.contract.gtl.m02"],
          requiredCapabilityRefs: ["abg.capability.catalog.contribute@5"]
        }
      ],
      candidateDescriptors: [candidate.descriptor]
    },
    context
  );
  assert.equal(resolution.kind, "accepted", resolution.message);
  const verification = await catalogVerify(
    {
      artifact: candidate.artifact,
      descriptor: candidate.descriptor,
      contributionManifest: candidate.contribution,
      resolvedLock: resolution.value
    },
    context
  );
  assert.equal(verification.kind, "accepted", verification.message);
  assert.equal(
    verification.value.productManifest.productContentDigest,
    candidate.descriptor.productContentDigest
  );
  assert.equal(
    verification.value.productContentInventory.some(
      (row) => row.relativePath === T223_ABG_SYSTEM_MODULE_PATH
    ),
    true
  );
});
