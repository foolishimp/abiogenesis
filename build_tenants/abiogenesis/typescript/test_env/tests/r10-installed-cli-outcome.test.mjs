import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  buildRootCliScenario,
  runInstalledCli,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("R10 installed abg.cli returns the same typed outcome as two ABG replay folds", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const scenario = await buildRootCliScenario(harness, "r10");
  const run = await runInstalledCli(harness, scenario);
  assert.equal(run.exitCode, 0, run.stdout);
  assert.equal(run.stderr, "");
  assert.equal(run.outcomes.length, 6, run.stdout);
  assert.deepEqual(run.outcomes.map((outcome) => outcome.disposition), [
    "succeeded",
    "succeeded",
    "succeeded",
    "succeeded",
    "succeeded",
    "succeeded",
  ]);
  const outcome = run.outcomes.at(-1);
  assert.equal(outcome.kind, "public_outcome");
  assert.equal(outcome.operationId, "abg.operation.run.invoke");
  assert.equal(outcome.invocationRef, scenario.refs.run);
  assert.equal(outcome.runtimeInvocationRef.startsWith("invocation://abiogenesis/"), true);
  assert.equal(outcome.outputContractRef, "contract://abiogenesis/conformance/hello-output@5");
  assert.equal(outcome.admittedResultContractRef, outcome.outputContractRef);
  assert.deepEqual(outcome.result, {
    kind: "hello_world_output",
    message: "Hello World",
    schemaVersion: "5.0.0",
  });
  assert.equal(outcome.replayAgreement, true);
  assert.equal(outcome.replayDigest.startsWith("sha256:"), true);
  assert.equal(outcome.runId.startsWith("run://abiogenesis/"), true);
  assert.equal(outcome.graphCallId.startsWith("graph-call://abiogenesis/"), true);
  assert.equal(outcome.frameId.startsWith("frame://abiogenesis/"), true);
  assert.equal(outcome.cCallRef.startsWith("c-call:sha256:"), true);

  const persisted = JSON.parse(await readFile(scenario.eventLogPath, "utf8"));
  assert.equal(persisted.kind, "abg_event_log");
  assert.deepEqual(persisted.events.slice(-10).map((event) => event.kind), [
    "c_call_opened",
    "c_call_fibre_selected",
    "c_call_evidenced",
    "c_call_result_admitted",
    "c_call_judged",
    "fd_advance_ready",
    "terminal_reached",
    "frame_closed",
    "graph_call_closed",
    "run_closed",
  ]);
  assert.equal(persisted.events.at(-1).causationEventRefs[0], persisted.events.at(-2).eventId);
  assert.equal(
    persisted.events.some((event) =>
      JSON.stringify(event).includes("CompiledCProgramPlan") ||
      JSON.stringify(event).includes("publicControlLoop")),
    false,
  );

  const evidenceDirectory = join(root, "test_env/evidence");
  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(
    join(evidenceDirectory, "abi5-root-r10.json"),
    `${JSON.stringify({
      kind: "abi5_root_obligation_evidence",
      schemaVersion: "5.0.0",
      bindingId: "ABI5-ROOT-001",
      obligation: "R10_replay_and_cli_typed_outcome_agree",
      result: "satisfied",
      sourceImportUsed: false,
      cliPath: harness.cliPath,
      artifactDigest: run.outcomes[0].result.artifactDigest,
      productInstallId: run.outcomes[1].result.installId,
      workspaceBindingId: run.outcomes[2].result.bindingId,
      catalogId: run.outcomes[3].result.catalogId,
      catalogViewId: run.outcomes[4].result.viewId,
      publicOutcome: outcome,
      replayAgreement: outcome.replayAgreement,
      durableEventCount: persisted.events.length,
      eventKinds: persisted.events.map((event) => event.kind),
      authorityBoundary: {
        callerAuthoredOperationOrder: true,
        cliConstructedExecutionBasis: false,
        cliWroteRuntimeEvents: false,
        cliSelectedHiddenTarget: false,
        publicOutcomeDerivedFromReplay: true,
      },
    }, null, 2)}\n`,
    "utf8",
  );
});
