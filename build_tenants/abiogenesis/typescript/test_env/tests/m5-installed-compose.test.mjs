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

test("M5 installed CLI traverses two composed GTL leaves through one ABG runtime", async (context) => {
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
  assert.equal(run.outcomes[3].result.admittedRows, 2);
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

  assert.equal(cCallOpened.length, 2);
  assert.equal(resultEvents.length, 2);
  assert.equal(judgmentEvents.length, 2);
  assert.deepEqual(routes.map((event) => event.payload.routeKind), [
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
  assert.equal(resultEvents[1].payload.contractRef, OUTPUT_CONTRACT_REF);
  assert.equal(resultEvents[0].aggregateId, cCallOpened[0].aggregateId);
  assert.equal(routes[1].payload.cCallRef, cCallOpened[0].aggregateId);
  assert.equal(routes[1].payload.judgmentRef, judgmentEvents[0].payload.judgmentRef);
  assert.equal(
    cCallOpened[1].causationEventRefs.includes(routes[1].eventId),
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
