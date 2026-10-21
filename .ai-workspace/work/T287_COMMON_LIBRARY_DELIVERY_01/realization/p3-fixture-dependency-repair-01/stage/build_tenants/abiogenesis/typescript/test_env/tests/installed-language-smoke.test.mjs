import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { runInstalledLanguageTest } from "../support/installed-language-test.mjs";
import { LANGUAGE_TEST_IDS, evaluateLanguageTestResult } from "../support/language-smoke-fixture.mjs";
const packageRoot = fileURLToPath(new URL("../..", import.meta.url));

test("Hello World is an external minimal GTL program through installed Public execution and fresh reads", async context => {
  const proof = await runInstalledLanguageTest(context, packageRoot);
  const { resolution, environment, events, reads } = proof;
  const fixture = environment.additionalProducts[0];
  assert.equal(resolution.resolution.programOwner.productId, fixture.basis.productId);
  assert.equal(resolution.declarationClosure.semanticsOwner.productId, fixture.basis.productId);
  assert.equal(resolution.implementationSetCandidate.rows[0].implementationOwnerProductId, fixture.basis.productId);
  assert.notEqual(fixture.basis.productId, environment.verified.productId);
  assert.equal(proof.receipt.exitCode, 0);
  assert.equal(proof.receipt.ownerOutput.outcomeKind, "result");
  const result = events.find(event => event.kind === "c_call_result_admitted");
  assert.ok(result, "native ABG admits an actual leaf result");
  assert.equal(result.payload.contractRef, LANGUAGE_TEST_IDS.outputContractRef);
  assert.equal(evaluateLanguageTestResult({ kind: "hello_world_input", subject: "World" }, result.payload.value), true);
  assert.equal(events.filter(event => event.kind === "run_closed").length, 1);
  assert.equal(events.filter(event => event.kind === "c_call_opened").length, 1);
  assert.deepEqual(reads.map(read => read.memberKey), ["run_result", "run_replay"]);
  assert.equal(reads.every(read => read.receipt.exitCode === 0), true);
});
