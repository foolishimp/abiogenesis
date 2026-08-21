import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

import * as product from "../../build/code/src/product/index.js";
import { parseProductManifest } from "../../build/code/src/product/verify_product.js";
import {
  PUBLIC_OPERATION_CONTRACT_PROJECTIONS,
} from "../../build/code/src/shared/public_function_family.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const execFileAsync = promisify(execFile);
const graphPath = join(
  root,
  product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH,
);
const manifestPath = join(root, "product-toolchain-manifest.json");
const crossedDigest = `sha256:${"f".repeat(64)}`;

function uniqueOwnerCoordinates(graph) {
  return [...new Map(graph.rows.flatMap((row) => row.owningPublicContracts)
    .map((coordinate) => [product.canonicalJson(coordinate), coordinate]))
    .values()];
}

function rehashRow(row) {
  const {
    capabilityDefinitionDigest: _digest,
    capabilityDefinitionRef: _ref,
    ...body
  } = row;
  const capabilityDefinitionDigest = product.sha256Canonical(body);
  return {
    ...body,
    capabilityDefinitionRef:
      `capability-definition://abiogenesis/${capabilityDefinitionDigest.slice(7)}`,
    capabilityDefinitionDigest,
  };
}

function rehashGraph(graph, rows) {
  const { graphDigest: _digest, ...body } = graph;
  const nextBody = { ...body, rows };
  return {
    ...nextBody,
    graphDigest: product.sha256Canonical(nextBody),
  };
}

test("ST-2A-G publishes one exact immutable capability graph", async () => {
  const [graphBytes, manifestBytes] = await Promise.all([
    readFile(graphPath),
    readFile(manifestPath),
  ]);
  const graph = JSON.parse(graphBytes.toString("utf8"));
  const manifest = JSON.parse(manifestBytes.toString("utf8"));

  assert.equal(product.isCapabilityDefinitionGraph(graph), true);
  assert.equal(Object.isFrozen(product.DS1_CAPABILITY_CONTRACT_REGISTER), true);
  assert.equal(Object.isFrozen(
    product.capabilityRefsForContract("abg.operation.run.invoke"),
  ), true);
  assert.equal(Object.isFrozen(product.capabilityRefsForDefinition({
    operationId: "abg.operation.catalog.apply",
    memberKey: "node_type",
  })), true);
  assert.equal(graph.graphId, product.CAPABILITY_DEFINITION_GRAPH_ID);
  assert.equal(graph.graphVersion, product.CAPABILITY_DEFINITION_GRAPH_VERSION);
  assert.equal(graph.rows.length, 16);
  assert.deepEqual(
    graph.rows.map(({ capabilityId }) => capabilityId).sort(),
    [...product.MANDATORY_ABI5_CAPABILITY_IDS].sort(),
  );
  assert.deepEqual(
    product.DS1_CAPABILITY_CONTRACT_REGISTER
      .map(({ capabilityId }) => capabilityId).sort(),
    [...product.MANDATORY_ABI5_CAPABILITY_IDS].sort(),
  );
  assert.equal(
    product.sha256Bytes(graphBytes),
    manifest.capabilityDefinitionGraph.assetLocator.contentDigest,
  );
  assert.equal(
    manifest.productRelativeLocators.includes(
      product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH,
    ),
    false,
    "the full catalog coordinate cannot self-enter its Product content digest",
  );
  assert.deepEqual(
    manifest.contributionManifest.capabilityDefinitionGraph,
    product.capabilityDefinitionGraphCoordinate(graph),
  );
  assert.equal(
    manifest.capabilityDefinitionGraph.graphDigest,
    graph.graphDigest,
  );

  for (const row of graph.rows) {
    const {
      capabilityDefinitionDigest,
      capabilityDefinitionRef,
      ...body
    } = row;
    assert.equal(capabilityDefinitionDigest, product.sha256Canonical(body));
    assert.equal(
      capabilityDefinitionRef,
      `capability-definition://abiogenesis/${capabilityDefinitionDigest.slice(7)}`,
    );
    for (const owner of row.owningPublicContracts) {
      assert.deepEqual(Object.keys(owner).sort(), [
        "contractCatalog",
        "flatRow",
        "nestedSelector",
      ]);
      assert.equal(
        owner.contractCatalog.catalogDigest,
        manifest.publicContractCatalog.catalogDigest,
      );
      assert.equal(
        owner.contractCatalog.productContentDigest,
        manifest.productContentDigest,
      );
      const catalogRow = manifest.publicContractCatalog.rows.find(
        ({ contractId }) => contractId === owner.flatRow.contractId,
      );
      assert.ok(catalogRow);
      assert.deepEqual(owner.flatRow, {
        contractId: catalogRow.contractId,
        contractVersion: catalogRow.contractVersion,
        contractDigest: catalogRow.contractDigest,
      });
      if (owner.nestedSelector.selectorKind === "operation_definition_slot") {
        assert.equal(
          owner.nestedSelector.definitionKey.operationId,
          owner.flatRow.contractId,
        );
      }
    }
    for (const dependency of row.dependentCapabilities) {
      const target = graph.rows.find(
        ({ capabilityId }) => capabilityId === dependency.capabilityId,
      );
      assert.ok(target);
      assert.equal(
        dependency.capabilityDefinitionRef,
        target.capabilityDefinitionRef,
      );
      assert.equal(
        dependency.capabilityDefinitionDigest,
        target.capabilityDefinitionDigest,
      );
    }
  }
  assert.equal(
    graph.graphDigest,
    product.capabilityDefinitionGraphDigest(graph),
  );
  for (const projection of PUBLIC_OPERATION_CONTRACT_PROJECTIONS) {
    for (const capabilityProjection of Object.values(
      projection.capabilityRefsByDefinition,
    )) {
      assert.equal(Object.isFrozen(capabilityProjection.value), true);
      assert.deepEqual(
        capabilityProjection.value,
        product.capabilityRefsForDefinition(capabilityProjection.definitionKey),
      );
    }
  }
  assert.deepEqual(product.capabilityRefsForDefinition({
    operationId: "abg.operation.catalog.apply",
    memberKey: "node_type",
  }), ["abg.capability.catalog.apply-node-type@5"]);
  assert.deepEqual(product.capabilityRefsForDefinition({
    operationId: "abg.operation.catalog.apply",
    memberKey: "overlay",
  }), ["abg.capability.catalog.apply-overlay@5"]);

  const projectReadExpected = {
    assessment_evidence: "abg.capability.runtime.admit-fp-result@5",
    c_call_replay: "abg.capability.runtime.replay-continuation@5",
    catalog_describe: "abg.capability.operator.public-contract@5",
    catalog_list: "abg.capability.operator.public-contract@5",
    continuation_replay: "abg.capability.runtime.replay-continuation@5",
    graph_call_evidence: "abg.capability.runtime.replay-continuation@5",
    graph_call_replay: "abg.capability.runtime.replay-continuation@5",
    graph_call_result: "abg.capability.runtime.replay-continuation@5",
    graph_call_status: "abg.capability.runtime.replay-continuation@5",
    install_evidence: "abg.capability.install.bind-products@5",
    interaction_replay: "abg.capability.runtime.replay-continuation@5",
    release_evidence: "abg.capability.operator.public-contract@5",
    result_evidence: "abg.capability.runtime.replay-continuation@5",
    run_evidence: "abg.capability.runtime.replay-continuation@5",
    run_gaps: "abg.capability.runtime.replay-continuation@5",
    run_lawful_actions: "abg.capability.runtime.replay-continuation@5",
    run_replay: "abg.capability.runtime.replay-continuation@5",
    run_result: "abg.capability.runtime.replay-continuation@5",
    run_status: "abg.capability.runtime.replay-continuation@5",
    ticket_consensus: "abg.capability.operator.public-contract@5",
    witness_evidence: "abg.capability.operator.public-contract@5",
    workspace_gaps: "abg.capability.operator.public-contract@5",
    workspace_replay: "abg.capability.runtime.replay-continuation@5",
    workspace_status: "abg.capability.operator.public-contract@5",
  };
  for (const [memberKey, capabilityId] of Object.entries(projectReadExpected)) {
    assert.deepEqual(product.capabilityRefsForDefinition({
      operationId: "abg.operation.project.read",
      memberKey,
    }), [capabilityId], memberKey);
  }
  for (const registerRow of product.DS1_CAPABILITY_CONTRACT_REGISTER) {
    const graphRow = graph.rows.find(
      ({ capabilityId }) => capabilityId === registerRow.capabilityId,
    );
    assert.ok(graphRow);
    const actualDefinitionKeys = [...new Map(graphRow.owningPublicContracts
      .filter(({ nestedSelector }) =>
        nestedSelector.selectorKind === "operation_definition_slot"
      )
      .map(({ nestedSelector }) => [
        `${nestedSelector.definitionKey.operationId}\0${nestedSelector.definitionKey.memberKey}`,
        nestedSelector.definitionKey,
      ])).values()];
    assert.deepEqual(
      actualDefinitionKeys.map((key) => `${key.operationId}\0${key.memberKey}`).sort(),
      registerRow.owningPublicDefinitionKeys
        .map((key) => `${key.operationId}\0${key.memberKey}`).sort(),
      registerRow.capabilityId,
    );
  }
  for (const row of manifest.publicContractCatalog.rows) {
    assert.ok(
      row.capabilityIdentities.length > 0,
      `missing capability projection for ${row.contractId}`,
    );
    assert.deepEqual(
      row.capabilityIdentities,
      product.capabilityRefsForContract(row.contractId),
    );
  }
});

test("ST-2A-G rejects crossed catalog coordinates, selectors, dependencies, and manifests", async () => {
  const graph = JSON.parse(await readFile(graphPath, "utf8"));
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const ownerCoordinates = uniqueOwnerCoordinates(graph);
  const selected = ownerCoordinates.find(({ nestedSelector }) =>
    nestedSelector.selectorKind === "operation_definition_slot"
  );
  assert.ok(selected);

  const crossedCatalog = structuredClone(selected);
  crossedCatalog.contractCatalog.catalogDigest = crossedDigest;
  assert.throws(
    () => product.constructCapabilityDefinitionGraph([
      ...ownerCoordinates,
      crossedCatalog,
    ]),
    /crossed operation definition catalog/u,
  );

  const crossedMember = structuredClone(selected);
  crossedMember.nestedSelector.definitionKey.memberKey = "crossed-owner";
  assert.throws(
    () => product.constructCapabilityDefinitionGraph([
      ...ownerCoordinates.filter((coordinate) =>
        product.canonicalJson(coordinate) !== product.canonicalJson(selected)
      ),
      crossedMember,
    ]),
    /incomplete operation definition slots|missing graph owner definition/u,
  );

  const crossedSlot = structuredClone(selected);
  crossedSlot.nestedSelector.slot = "result";
  assert.throws(
    () => product.constructCapabilityDefinitionGraph([
      ...ownerCoordinates.filter((coordinate) =>
        product.canonicalJson(coordinate) !== product.canonicalJson(selected)
      ),
      crossedSlot,
    ]),
    /crossed operation definition ref|duplicate operation definition slot/u,
  );

  const crossedRef = structuredClone(selected);
  crossedRef.nestedSelector.definitionRef =
    "#/definitions/999/requestContract/identity";
  assert.throws(
    () => product.constructCapabilityDefinitionGraph([
      ...ownerCoordinates.filter((coordinate) =>
        product.canonicalJson(coordinate) !== product.canonicalJson(selected)
      ),
      crossedRef,
    ]),
    /crossed operation definition ref|incomplete operation definition slots/u,
  );

  const consensusIndex = graph.rows.findIndex(
    ({ capabilityId }) =>
      capabilityId === "abg.capability.graph-function.consensus@5",
  );
  assert.notEqual(consensusIndex, -1);
  const crossedRows = structuredClone(graph.rows);
  const consensus = crossedRows[consensusIndex];
  assert.ok(consensus.dependentCapabilities.length > 0);
  const wrongTarget = graph.rows.find(
    ({ capabilityId }) =>
      capabilityId !== consensus.dependentCapabilities[0].capabilityId,
  );
  assert.ok(wrongTarget);
  consensus.dependentCapabilities[0] = {
    capabilityId: wrongTarget.capabilityId,
    capabilityDefinitionRef: wrongTarget.capabilityDefinitionRef,
    capabilityDefinitionDigest: wrongTarget.capabilityDefinitionDigest,
  };
  crossedRows[consensusIndex] = rehashRow(consensus);
  const crossedDependencyGraph = rehashGraph(graph, crossedRows);
  assert.equal(
    product.isCapabilityDefinitionGraph(crossedDependencyGraph),
    false,
  );

  const crossedManifest = structuredClone(manifest);
  crossedManifest.capabilityDefinitionGraph.graphDigest = crossedDigest;
  assert.equal(parseProductManifest(crossedManifest), null);
  const crossedContribution = structuredClone(manifest);
  crossedContribution.contributionManifest.capabilityDefinitionGraph.graphDigest =
    crossedDigest;
  assert.equal(parseProductManifest(crossedContribution), null);

  const nativeContractWithoutProjection = structuredClone(
    manifest.publicContractCatalog.rows.find(
      ({ contractId }) => contractId === "abg.contract.product.verification",
    ),
  );
  assert.ok(nativeContractWithoutProjection);
  nativeContractWithoutProjection.capabilityIdentities = [];
  assert.equal(
    product.parseProductPublicContract(
      nativeContractWithoutProjection,
      manifest.productId,
    ),
    null,
  );
});

test("ST-2A-G conserves the graph through packed verification, lock, install, and provenance", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-st2a-g-"));
  context.after(() => rm(scratch, { force: true, recursive: true }));
  const artifacts = join(scratch, "artifacts");
  await mkdir(artifacts);
  const { stdout } = await execFileAsync(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts],
    { cwd: root, maxBuffer: 10 * 1024 * 1024 },
  );
  const [packed] = JSON.parse(stdout);
  const artifactPath = join(artifacts, packed.filename);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const verified = await product.verifyProduct({
    artifactPath,
    artifactRef: packed.filename,
    expectedArtifactDigest: await product.sha256File(artifactPath),
    expectedProductContentDigest: manifest.productContentDigest,
    expectedManifestDigest: product.sha256Canonical(manifest),
    expectedProductId: manifest.productId,
    expectedPackageName: manifest.packageName,
    expectedPackageVersion: manifest.packageVersion,
  });
  assert.equal(verified.disposition, "verified", JSON.stringify(verified));
  const lock = product.constructResolvedProductLock([verified]);
  assert.equal(lock.kind, "resolved_product_lock", JSON.stringify(lock));
  const installCandidate = await product.installProduct({
    artifactPath,
    targetRoot: join(scratch, "consumer"),
    verifiedArtifact: verified,
    resolvedLock: lock,
  });
  assert.equal(
    installCandidate.disposition,
    "materialized",
    JSON.stringify(installCandidate),
  );
  const graph = verified.capabilityDefinitionGraph;

  assert.equal(product.isVerifiedProductArtifact(verified), true);
  assert.equal(product.isResolvedProductLock(lock), true);
  assert.equal(
    product.isProductInstallCandidate(installCandidate, lock),
    true,
  );
  assert.equal(await product.installedProductContentMatches(installCandidate), true);
  assert.deepEqual(lock.rows[0].capabilityDefinitionGraph, graph);
  assert.deepEqual(installCandidate.capabilityDefinitionGraph, graph);
  assert.equal(verified.provenanceRef, installCandidate.provenanceRef);
  assert.equal(lock.rows[0].provenanceRef, verified.provenanceRef);
  assert.deepEqual(
    JSON.parse(await readFile(join(
      installCandidate.installedRoot,
      product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH,
    ), "utf8")),
    graph,
  );
  const crossedInstall = structuredClone(installCandidate);
  crossedInstall.capabilityDefinitionGraph.rows[0].owningPublicContracts[0]
    .contractCatalog.catalogDigest = crossedDigest;
  assert.equal(
    product.isProductInstallCandidate(crossedInstall, lock),
    false,
  );

  const crossedLock = structuredClone(lock);
  crossedLock.rows[0].contributionManifest.capabilityDefinitionGraph.graphDigest =
    crossedDigest;
  crossedLock.rows[0].contributionManifestDigest =
    product.sha256Canonical(
      crossedLock.rows[0].contributionManifest,
    );
  crossedLock.lockDigest = product.sha256Canonical({
    rows: crossedLock.rows,
    dependencyEdges: crossedLock.dependencyEdges,
    nativeContractClosureDigest: crossedLock.nativeContractClosureDigest,
  });
  crossedLock.lockId =
    `product-lock://abiogenesis/${crossedLock.lockDigest.slice(7)}`;
  assert.equal(product.isResolvedProductLock(crossedLock), false);
});
