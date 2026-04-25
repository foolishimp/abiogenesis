// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS
// Validates: REQ-R-ABG3-INTERPRET
// Validates: REQ-R-ABG3-EVENTS

import test from "node:test";
import assert from "node:assert/strict";

import {
  installPackedTenantPackage,
  installedGraphFunctionTargetSource,
  provisionInstalledRoot,
  runInstalledNodeScript
} from "./support/m05-installed-fixtures.mjs";

test("M05 installed graph-function target integration: packaged sandbox start selects the requested graph function and no sibling graph", async () => {
  const { targetRoot } = await provisionInstalledRoot();
  await installPackedTenantPackage(targetRoot);

  const run = await runInstalledNodeScript(
    targetRoot,
    installedGraphFunctionTargetSource()
  );

  assert.equal(run.status, 0, run.stderr);
  const payload = JSON.parse(run.stdout);

  assert.equal(payload.target, "graph_function:code_flow");
  assert.equal(payload.edge, "design→code");
  assert.equal(payload.stopPredicate, "dispatch_required");
  assert.equal(payload.manifest.edge, "design→code");
  assert.equal(payload.selectedGraphFunctionId, payload.codeGraphFunctionId);
  assert.notEqual(payload.selectedGraphFunctionId, payload.reviewGraphFunctionId);
  assert.deepStrictEqual(payload.dispatchedEdges, ["design→code"]);
  assert.deepStrictEqual(payload.assessedEdges, ["design→code"]);
  assert.equal(payload.dispatchedEdges.includes("design→review"), false);
  assert.equal(payload.assessedEdges.includes("design→review"), false);
  assert.deepStrictEqual(payload.eventKinds, [
    "basis_admitted",
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
    "fp_dispatch_requested",
    "assessed"
  ]);
  assert.equal(payload.assessmentKind, "accepted");
});
