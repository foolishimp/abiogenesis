// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS
// Validates: REQ-L-GTL3-COMPOSE
// Validates: REQ-L-GTL3-GRAPHFUNCTION
// Validates: REQ-R-ABG3-INTERPRET
// Validates: REQ-R-ABG3-EVENTS

import test from "node:test";
import assert from "node:assert/strict";

import {
  installPackedTenantPackage,
  installedThreeStageGraphFunctionSandboxSource,
  provisionInstalledRoot,
  runInstalledNodeScript
} from "./support/m05-installed-fixtures.mjs";

test("M05 installed sandbox: composed graph stops at the first assessment lacking replay evidence", async () => {
  const { targetRoot } = await provisionInstalledRoot();
  await installPackedTenantPackage(targetRoot);

  const run = await runInstalledNodeScript(
    targetRoot,
    installedThreeStageGraphFunctionSandboxSource()
  );

  assert.equal(run.status, 0, run.stderr);
  const payload = JSON.parse(run.stdout);

  assert.equal(payload.target, "graph_function:capture_requirements;synthesize_design;implement_code");
  assert.equal(payload.passed, false);
  assert.equal(payload.assessmentBoundaryObserved, true);
  assert.equal(payload.sandboxTraversalMode, "replay_derived_core_iteration");
  assert.equal(payload.coreProgressionClaimed, false);
  assert.equal(payload.selectedGraphFunctionId, payload.executiveGraphFunctionId);
  assert.equal(payload.stageCount, 3);
  assert.equal(payload.graphFunctionVectorCount, 3);
  assert.deepStrictEqual(payload.materializedVectorNames, [
    "input_set→requirements",
    "requirements→design",
    "design→code"
  ]);
  assert.equal(payload.publicStartEdge, "input_set→requirements");
  assert.equal(payload.stopPredicate, "dispatch_required");
  assert.equal(payload.allStageDispatchesShareGraphFunctionId, true);
  assert.equal(payload.assessmentCount, 1);
  assert.deepStrictEqual(payload.assessmentKinds, ["rejected"]);
  assert.equal(payload.finalRunStatus, "blocked");
  assert.deepStrictEqual(payload.environmentCarries, [
    "input_set",
    "requirements",
    "design",
    "code"
  ]);
  assert.deepStrictEqual(payload.observedEdges, ["input_set→requirements"]);
  assert.deepStrictEqual(payload.eventKinds, [
    "lever_resolution_admitted",
    "basis_admitted",
    "registry_entry_admitted",
    "graph_function_selected",
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
    "instruction_prompt_manifest_projected",
    "c_call_opened",
    "c_call_fibre_selected",
    "fp_dispatch_requested",
    "actor_invocation_started",
    "payload_observed",
    "payload_validated",
    "actor_invocation_closed",
    "c_call_evidenced",
    "c_call_result_admitted",
    "c_call_judged",
    "public_operation_admitted"
  ]);
});
