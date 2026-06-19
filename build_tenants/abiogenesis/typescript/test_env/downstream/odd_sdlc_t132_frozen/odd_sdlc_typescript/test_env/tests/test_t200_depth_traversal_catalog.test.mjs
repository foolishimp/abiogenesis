// Validates: T-200 D3

import test from "node:test";
import assert from "node:assert/strict";
import { materializeGraphFunction } from "@abiogenesis/typescript-tenant";

import {
  constructSdlcGtlModule,
  FG_DECOMPOSE_DEPTH_BETWEEN_NODES,
  projectSdlcQueryDomain,
  admitSdlcProjectConstraints,
  deriveSdlcWorkspaceIngressReport,
  SDLC_EDGE_GAIN_CLOSURE_CONTRACTS,
  constructSdlcGraphFunctionCatalog
} from "../../build/semantic/code/src/index.js";

function queryDomainForModule(module) {
  const projectConstraints = admitSdlcProjectConstraints({
    projectSlug: "t200_depth",
    activeTenant: "typescript",
    selectedOutputRoot: "build_tenants/typescript",
    ambiguityRiskAppetite: "low",
    capabilityContracts: ["trivial_product"]
  });
  const ingressReport = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: "file:///workspace/t200-depth",
    projectConstraints,
    sourceInputs: []
  });
  return projectSdlcQueryDomain({ module, ingressReport });
}

test("T-200 D3 publishes depth decomposition graph function through catalog, module, and query-domain", () => {
  const catalog = constructSdlcGraphFunctionCatalog();
  const catalogEntry = catalog.functions.find(
    (candidate) => candidate.name === FG_DECOMPOSE_DEPTH_BETWEEN_NODES
  );
  assert(catalogEntry);
  assert.equal(catalogEntry.graphTrackPublication, "overlay_only");
  assert.deepEqual(catalogEntry.inputs, [
    "source_node_ref",
    "target_node_ref",
    "parent_obligation_ref",
    "graph_catalog_digest_ref",
    "edge_contract_refs",
    "depth_policy_ref",
    "evidence_policy_ref"
  ]);
  assert.deepEqual(catalogEntry.outputs, ["sdlc_depth_traversal_outcome"]);

  const module = constructSdlcGtlModule();
  const graphFunction = module.graphFunctions.find(
    (candidate) => candidate.name === FG_DECOMPOSE_DEPTH_BETWEEN_NODES
  );
  assert(graphFunction);
  const graph = materializeGraphFunction(graphFunction);
  assert.equal(graph.vectors.length, 1);
  assert.equal(graph.vectors[0].name, FG_DECOMPOSE_DEPTH_BETWEEN_NODES);
  assert.equal(graph.vectors[0].target.name, "sdlc_depth_traversal_outcome");

  const queryDomain = queryDomainForModule(module);
  assert(
    queryDomain.graphFunctions.some(
      (candidate) => candidate.name === FG_DECOMPOSE_DEPTH_BETWEEN_NODES
    )
  );
  assert(
    queryDomain.optimisingOverlays[0].candidateGraphFunctionRefs.includes(
      FG_DECOMPOSE_DEPTH_BETWEEN_NODES
    )
  );
  assert(
    queryDomain.targetCarriers.rows.some(
      (row) =>
        row.edgeRef === FG_DECOMPOSE_DEPTH_BETWEEN_NODES &&
        row.targetAssetType === "sdlc_depth_traversal_outcome"
    )
  );
  assert.equal(queryDomain.targetCarriers.diagnostics.length, 0);

  const contract = SDLC_EDGE_GAIN_CLOSURE_CONTRACTS.find(
    (candidate) => candidate.edgeRef === FG_DECOMPOSE_DEPTH_BETWEEN_NODES
  );
  assert(contract);
  assert.equal(contract.targetAssetType, "sdlc_depth_traversal_outcome");
  assert.equal(contract.closureClassification, "close_capable");
});
