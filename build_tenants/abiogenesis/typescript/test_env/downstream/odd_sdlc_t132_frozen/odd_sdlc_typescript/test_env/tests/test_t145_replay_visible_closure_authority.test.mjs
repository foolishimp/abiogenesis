// Validates: T-145

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
  invokeOddSdlcSpecMethodCommandSync
} from "../../build/semantic/code/src/index.js";

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function makeConformantWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t145-"));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  mkdirSync(path.join(root, "build_tenants"), { recursive: true });
  writeFileSync(
    path.join(root, "README.md"),
    ["# T-145 Fixture", "", "REQ-T145-001: Preserve replay closure authority."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/GOALS.md"),
    ["# Goals", "", "GOAL-T145-001: Exercise replay-visible closure authority."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    ["# Intent", "", "**Project**: T-145 Fixture", "", "INT-T145-001: Govern T-145 fixture."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/PRODUCT.md"),
    ["# Product", "", "PRODUCT-T145-001: T-145 fixture product surface."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/00-imported-sources.md"),
    ["# Imported Sources", "", "- README.md", "- specification/INTENT.md"].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/01-t145.md"),
    ["# Requirements", "", "REQ-T145-002: Archive-only state cannot close a public gap."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t145_fixture",
      "active_tenant: typescript",
      "selected_output_root: build_tenants/typescript",
      "ambiguity_risk_appetite: medium"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_bootstrap.md"),
    ["# Project Bootstrap", "", "Source package: T-145 fixture."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "build_tenants/TENANT_REGISTRY.md"),
    ["# Tenant Registry", "", "- typescript: build_tenants/typescript"].join("\n"),
    "utf8"
  );
  return root;
}

function operatorRunRoot(workspace, name) {
  const archiveRoot = path.join(
    workspace,
    ".ai-workspace/runtime/odd_sdlc/operator-runs",
    name
  );
  mkdirSync(archiveRoot, { recursive: true });
  return archiveRoot;
}

function writeArchiveOnlyTerminalClosure(workspace) {
  const archiveRoot = operatorRunRoot(workspace, "20260511T000000000Z_pid145");
  const decisionRef = "closure-decision://t145/archive-only-terminal";
  writeJson(path.join(archiveRoot, "worker_invocation_package.json"), {
    kind: "sdlc_worker_invocation_package",
    graphFunctionName: FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
    edgeName: FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
  });
  writeJson(path.join(archiveRoot, "sdlc_edge_closure_decision.json"), {
    kind: "sdlc_edge_closure_decision",
    decisionRef,
    disposition: "close"
  });
  writeJson(path.join(archiveRoot, "sdlc_edge_fulfillment_ledger.json"), {
    kind: "sdlc_edge_fulfillment_ledger",
    ledgerRef: "ledger://t145/archive-only-terminal",
    ledgerVersionRef: "ledger-version://t145/archive-only-terminal/1",
    counts: {
      expected: 1,
      fulfilled: 1,
      partial: 0,
      blocked: 0,
      unfulfilled: 0,
      missing: 0,
      extra: 0
    },
    edgeConverged: true
  });
  writeJson(path.join(archiveRoot, "sdlc_next_action_projection.json"), {
    kind: "sdlc_next_action_projection",
    choosesNextTraversal: false,
    selectedActionRef: null,
    nextActionProjectionRef: "construction-priority-projection://t145/archive-only-terminal",
    nextGraphFunctionRef: null,
    predecessorRefs: [decisionRef]
  });
}

function writeWorkerReport(workspace, input) {
  const archiveRoot = operatorRunRoot(workspace, "20260511T000100000Z_pid145");
  writeJson(path.join(archiveRoot, "worker_result_report.json"), {
    kind: "sdlc_worker_result_report",
    summary: input.summary,
    unresolvedReasons: input.unresolvedReasons,
    obligationAssessments: []
  });
}

function runTargetedGaps(workspace) {
  const result = invokeOddSdlcSpecMethodCommandSync([
    "gaps",
    "--workspace",
    workspace,
    "--target",
    `graph_function:${FG_MATERIALIZE_DECLARED_PRODUCT_ASSET}`
  ]);
  assert.equal(result.status, "ok");
  return result;
}

function authorityFields(result) {
  return Object.freeze({
    startTarget: result.payload.start.executionContract.targetGraphFunction,
    projectionStatus: result.payload.projection.status,
    projectionCurrentEdge: result.payload.projection.currentEdge,
    dossierStatus: result.payload.dossier.status,
    dossierEdge: result.payload.dossier.edge,
    bestActionRef: result.payload.dossier.bestActionRef,
    bestGraphFunctionRef: result.payload.dossier.bestGraphFunctionRef,
    nextActionProjectionRef: result.payload.dossier.nextActionProjectionRef,
    nextLawfulActions: result.payload.dossier.nextLawfulActions
  });
}

test("T-145 archive-only terminal closure cannot converge public gaps", () => {
  const workspace = makeConformantWorkspace();
  writeArchiveOnlyTerminalClosure(workspace);

  const result = runTargetedGaps(workspace);

  assert.equal(result.payload.projection.status, "open");
  assert.equal(
    result.payload.projection.currentEdge,
    FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
  );
  assert.equal(result.payload.projection.nextVectorIndex, 0);
  assert.deepEqual(result.payload.projection.closedVectorIndexes, []);
  assert.equal(result.payload.dossier.status, "open");
  assert.equal(result.payload.dossier.edge, FG_MATERIALIZE_DECLARED_PRODUCT_ASSET);
  assert.equal(
    result.payload.dossier.bestGraphFunctionRef,
    FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
  );
  assert.equal(
    result.payload.dossier.rankingReasonRefs.some((ref) =>
      ref.startsWith("terminal_closed_edge_replayed:")
    ),
    false
  );
  assert.equal(
    result.payload.dossier.gapPressureRefs.some((ref) => ref.startsWith("closed-edge://")),
    false
  );
  assert.notEqual(
    result.payload.dossier.nextActionProjectionRef,
    "construction-priority-projection://t145/archive-only-terminal"
  );
});

test("T-145 worker report prose cannot change closure or routing authority", () => {
  const workspace = makeConformantWorkspace();
  const before = authorityFields(runTargetedGaps(workspace));

  writeWorkerReport(workspace, {
    summary: "This prose claims the worker is done.",
    unresolvedReasons: []
  });
  const proseClaim = authorityFields(runTargetedGaps(workspace));

  writeWorkerReport(workspace, {
    summary: "This prose claims the worker is blocked.",
    unresolvedReasons: ["operator narrative says retry another action"]
  });
  const proseMutation = authorityFields(runTargetedGaps(workspace));

  assert.deepEqual(proseClaim, before);
  assert.deepEqual(proseMutation, before);
});
