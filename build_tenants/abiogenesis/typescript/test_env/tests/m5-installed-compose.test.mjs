import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  buildRootCliScenario,
  runInstalledCli,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PROGRAM_REF = "program://abiogenesis/conformance/hello-compose@5";
const GRAPH_FUNCTION_REF =
  "graph-function://abiogenesis/conformance/hello-compose@5";
const NORMALIZED_CONTRACT_REF =
  "contract://abiogenesis/conformance/normalized-hello-input@5";
const OUTPUT_CONTRACT_REF =
  "contract://abiogenesis/conformance/hello-output@5";

test("M5 installed CLI traverses ordered C.batch, successful C.retry, and C.edge through one ABG runtime", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const scenario = await buildRootCliScenario(
    harness,
    "m5-compose",
    (payload) => payload,
    {
      programRef: PROGRAM_REF,
      graphFunctionRef: GRAPH_FUNCTION_REF,
      subject: "  World  ",
    },
  );
  const run = await runInstalledCli(harness, scenario);

  assert.equal(run.exitCode, 0, run.stdout);
  assert.equal(run.stderr, "");
  assert.equal(run.outcomes.length, 6, run.stdout);
  assert.equal(run.outcomes.every((outcome) => outcome.disposition === "succeeded"), true);
  assert.equal(run.outcomes[3].result.admittedRows >= 1, true);
  assert.deepEqual(run.outcomes[4].result.allowlist, [GRAPH_FUNCTION_REF]);

  const outcome = run.outcomes[5];
  assert.equal(outcome.outputContractRef, OUTPUT_CONTRACT_REF);
  assert.equal(outcome.admittedResultContractRef, OUTPUT_CONTRACT_REF);
  assert.deepEqual(outcome.result, {
    kind: "hello_world_output",
    schemaVersion: "5.0.0",
    message: "Hello World",
  });
  assert.equal(outcome.replayAgreement, true);

  const events = (await readFile(scenario.eventLogPath, "utf8"))
    .trim()
    .split(/\r?\n/u)
    .map((line) => JSON.parse(line));
  const cCallOpened = events.filter((event) => event.kind === "c_call_opened");
  const resultEvents = events.filter((event) => event.kind === "c_call_result_admitted");
  const judgmentEvents = events.filter((event) => event.kind === "c_call_judged");
  const routes = events.filter((event) => event.kind === "traversal_route_admitted");

  assert.equal(cCallOpened.length, 6);
  assert.equal(resultEvents.length, 6);
  assert.equal(judgmentEvents.length, 6);
  assert.deepEqual(routes.map((event) => event.payload.routeKind), [
    "advance",
    "advance",
    "advance",
    "advance",
    "advance",
    "retry",
    "advance",
    "advance",
    "advance",
    "terminal",
  ]);
  assert.equal(resultEvents[0].payload.contractRef, NORMALIZED_CONTRACT_REF);
  assert.deepEqual(resultEvents[0].payload.value, {
    kind: "normalized_hello_input",
    schemaVersion: "5.0.0",
    subject: "World",
  });
  assert.equal(resultEvents[1].payload.contractRef, NORMALIZED_CONTRACT_REF);
  assert.equal(resultEvents[2].payload.contractRef, NORMALIZED_CONTRACT_REF);
  assert.equal(resultEvents[3].payload.contractRef, NORMALIZED_CONTRACT_REF);
  assert.equal(resultEvents[4].payload.contractRef, NORMALIZED_CONTRACT_REF);
  assert.equal(resultEvents[5].payload.contractRef, OUTPUT_CONTRACT_REF);
  assert.equal(resultEvents[0].aggregateId, cCallOpened[0].aggregateId);
  assert.equal(routes[1].payload.cCallRef, cCallOpened[0].aggregateId);
  assert.equal(routes[1].payload.judgmentRef, judgmentEvents[0].payload.judgmentRef);
  assert.deepEqual(
    cCallOpened.slice(1, 3).map((event) => ({
      batchRef: event.payload.batchRef,
      taskOrdinal: event.payload.taskOrdinal,
    })),
    [
      { batchRef: "batch://abiogenesis/conformance/hello-compose/checks@5", taskOrdinal: 0 },
      { batchRef: "batch://abiogenesis/conformance/hello-compose/checks@5", taskOrdinal: 1 },
    ],
  );
  assert.equal(routes[3].payload.cCallRef, cCallOpened[1].aggregateId);
  assert.equal(routes[4].payload.cCallRef, cCallOpened[2].aggregateId);
  for (const opened of cCallOpened.slice(3)) {
    assert.equal(opened.payload.attempt, 1);
    assert.deepEqual(opened.payload.retryPath, [1]);
  }
  assert.equal(routes[7].payload.cCallRef, cCallOpened[3].aggregateId);
  assert.equal(routes[8].payload.cCallRef, cCallOpened[4].aggregateId);
  assert.equal(
    cCallOpened[5].causationEventRefs.includes(routes[8].eventId),
    true,
  );
  assert.equal(events.filter((event) => event.kind === "run_closed").length, 1);
  assert.equal(
    events.some((event) =>
      JSON.stringify(event).includes("CompiledCProgramPlan") ||
      JSON.stringify(event).includes("publicControlLoop")),
    false,
  );
});
