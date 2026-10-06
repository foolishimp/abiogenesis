import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { runInstalledLanguageTest } from "../support/installed-language-test.mjs";
import { prepareLanguageStructuralFixture } from "../support/language-structural-fixture.mjs";
import { GRAPH_EDGE_IDS, STRUCTURAL_IDS, constructStructuralInput } from "../fixtures/language-structural/program.mjs";
const packageRoot = fileURLToPath(new URL("../..", import.meta.url));

test("M5 installed HoG traverses an independently declared composed GraphFunction", async context => {
  const proof = await runInstalledLanguageTest(context, packageRoot, {
    prepareFixture: prepareLanguageStructuralFixture,
    programRef: GRAPH_EDGE_IDS.programRef,
    catalogHandle: GRAPH_EDGE_IDS.graphFunctionRef,
    allowlist: [GRAPH_EDGE_IDS.graphFunctionRef],
    declaredStartRef: GRAPH_EDGE_IDS.startRef,
    input: constructStructuralInput("  Qualification  "),
    identity: "structural-graph-edge",
  });
  assert.equal(proof.receipt.exitCode, 0);
  assert.equal(proof.receipt.ownerOutput.outcomeKind, "result");
  const { events, reads, environment, resolution } = proof;
  const owner = environment.additionalProducts[0].basis.productId;
  assert.equal(resolution.resolution.programOwner.productId, owner);
  assert.equal(resolution.declarationClosure.semanticsOwner.productId, owner);
  assert.equal(resolution.implementationSetCandidate.rows.every(row => row.implementationOwnerProductId === owner), true);
  assert.notEqual(owner, environment.verified.productId);
  const calls = events.filter(event => event.kind === "c_call_opened");
  const results = events.filter(event => event.kind === "c_call_result_admitted");
  const fibres = events.filter(event => event.kind === "c_call_fibre_selected");
  const routes = events.filter(event => event.kind === "traversal_route_admitted");
  assert.equal(calls.length, 2);
  assert.equal(fibres.length, 2);
  assert.equal(results.length, 2);
  assert.deepEqual(results[0].payload.value, { kind: "normalized_data", schemaVersion: "5.0.0", subject: "Qualification" });
  assert.equal(results[1].payload.contractRef, STRUCTURAL_IDS.outputContractRef);
  assert.deepEqual(results[1].payload.value, { kind: "data_output", schemaVersion: "5.0.0", message: "Qualification" });
  assert.equal(new Set(fibres.map(event => event.payload.compositionRef)).size, 1);
  assert.deepEqual(routes.map(event => event.payload.routeKind), ["advance", "terminal"]);
  assert.notEqual(routes[0].payload.targetCursorRef, null);
  assert.equal(routes[1].payload.targetCursorRef, null);
  assert.equal(events.filter(event => event.kind === "run_closed").length, 1);
  assert.deepEqual(reads.map(read => read.memberKey), ["run_result", "run_replay"]);
  assert.equal(reads.every(read => read.receipt.exitCode === 0), true);
  assert.equal(JSON.stringify(events).includes("CompiledCProgramPlan"), false);
  assert.equal(JSON.stringify(events).includes("compiled_execution"), false);
});
