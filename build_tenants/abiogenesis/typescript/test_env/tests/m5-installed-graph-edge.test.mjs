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
const PROGRAM_REF = "program://abiogenesis/conformance/hello-graph-edge@5";
const GRAPH_FUNCTION_REF =
  "graph-function://abiogenesis/conformance/hello-graph-edge@5";

async function readEvents(path) {
  return (await readFile(path, "utf8"))
    .trim()
    .split(/\r?\n/u)
    .map((line) => JSON.parse(line));
}

test("M5 installed HoG advances across one exact declared GTL graph edge", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const scenario = await buildRootCliScenario(
    harness,
    "m5-graph-edge",
    (payload) => payload,
    {
      programRef: PROGRAM_REF,
      graphFunctionRef: GRAPH_FUNCTION_REF,
      allowlist: [GRAPH_FUNCTION_REF],
    },
  );
  const run = await runInstalledCli(harness, scenario);

  assert.equal(run.exitCode, 0, run.stdout);
  assert.equal(run.outcomes.length, 6);
  assert.equal(run.outcomes.every((outcome) => outcome.disposition === "succeeded"), true);
  assert.deepEqual(run.outcomes[5].result, {
    kind: "hello_world_output",
    schemaVersion: "5.0.0",
    message: "Hello World",
  });
  assert.equal(run.outcomes[5].replayAgreement, true);

  const events = await readEvents(scenario.eventLogPath);
  const cCalls = events.filter((event) => event.kind === "c_call_opened");
  const routes = events.filter((event) => event.kind === "traversal_route_admitted");
  assert.equal(cCalls.length, 2);
  assert.deepEqual(
    cCalls.map((event) => event.payload.programLocusRef),
    [
      "locus://abiogenesis/conformance/hello-graph-edge/normalize@5",
      "locus://abiogenesis/conformance/hello-graph-edge/render@5",
    ],
  );
  assert.deepEqual(
    routes.map((event) => event.payload.routeKind),
    ["advance", "terminal"],
  );
  assert.notEqual(routes[0].payload.targetCursorRef, null);
  assert.equal(routes[1].payload.targetCursorRef, null);
  assert.equal(events.at(-1).kind, "run_closed");
  assert.equal(JSON.stringify(events).includes("CompiledCProgramPlan"), false);
  assert.equal(JSON.stringify(events).includes("compiled_execution"), false);
});
