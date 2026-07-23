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
const PROGRAM_REF =
  "program://abiogenesis/conformance/bounded-recursion@5";
const GRAPH_FUNCTION_REF =
  "graph-function://abiogenesis/conformance/bounded-recursion@5";
const CHILD_GRAPH_FUNCTION_REF =
  "graph-function://abiogenesis/conformance/bounded-recursion-step@5";

async function readEvents(path) {
  try {
    const text = await readFile(path, "utf8");
    return text.trim().split(/\r?\n/u).map((line) => JSON.parse(line));
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

async function runRecursion(context, label, remaining) {
  const harness = await setupInstalledCliHarness(context, root);
  const scenario = await buildRootCliScenario(
    harness,
    label,
    (payload) => payload,
    {
      programRef: PROGRAM_REF,
      graphFunctionRef: GRAPH_FUNCTION_REF,
      allowlist: [GRAPH_FUNCTION_REF, CHILD_GRAPH_FUNCTION_REF],
      input: {
        kind: "bounded_recursion_state",
        schemaVersion: "5.0.0",
        remaining,
        terminal: remaining === 0,
        trace: [],
      },
    },
  );
  const run = await runInstalledCli(harness, scenario);
  return {
    run,
    events: await readEvents(scenario.eventLogPath),
  };
}

test("M5 installed graph recursion re-enters its parent through admitted child foldback", async (context) => {
  const { run, events } = await runRecursion(
    context,
    "m5-bounded-recursion-success",
    3,
  );

  assert.equal(run.exitCode, 0, run.stdout);
  assert.equal(run.outcomes.every((outcome) => outcome.disposition === "succeeded"), true);
  assert.deepEqual(run.outcomes[5].result, {
    kind: "bounded_recursion_state",
    schemaVersion: "5.0.0",
    remaining: 0,
    terminal: true,
    trace: [2, 1, 0],
  });
  assert.equal(run.outcomes[5].replayAgreement, true);

  const parentCalls = events.filter(
    (event) =>
      event.kind === "c_call_opened" &&
      event.graphFunctionRef === GRAPH_FUNCTION_REF,
  );
  const childCalls = events.filter(
    (event) =>
      event.kind === "c_call_opened" &&
      event.graphFunctionRef === CHILD_GRAPH_FUNCTION_REF,
  );
  const childGraphCalls = events.filter(
    (event) =>
      event.kind === "graph_call_opened" &&
      event.graphFunctionRef === CHILD_GRAPH_FUNCTION_REF,
  );
  const foldbacks = events.filter(
    (event) =>
      event.kind === "child_foldback_admitted" &&
      event.payload.applicationRef !== undefined,
  );
  const applicationRoutes = events.filter(
    (event) =>
      event.kind === "traversal_route_admitted" &&
      event.payload.declarationRef === foldbacks[0]?.payload.applicationRef,
  );

  assert.deepEqual(parentCalls.map((event) => event.payload.attempt), [1, 2, 3, 4]);
  assert.equal(new Set(parentCalls.map((event) => event.frameId)).size, 1);
  assert.equal(childCalls.length, 3);
  assert.equal(childGraphCalls.length, 3);
  assert.equal(foldbacks.length, 3);
  assert.equal(applicationRoutes.length, 3);
  assert.equal(applicationRoutes.every((event) => event.payload.routeKind === "advance"), true);
  assert.equal(events.filter((event) => event.kind === "run_closed").length, 1);
  assert.equal(events.at(-1).kind, "run_closed");
});

test("M5 installed graph recursion blocks at its declared bound without another child", async (context) => {
  const { run, events } = await runRecursion(
    context,
    "m5-bounded-recursion-bound",
    5,
  );

  assert.equal(run.exitCode, 2, run.stdout);
  assert.equal(run.outcomes[5].disposition, "blocked");
  const parentCalls = events.filter(
    (event) =>
      event.kind === "c_call_opened" &&
      event.graphFunctionRef === GRAPH_FUNCTION_REF,
  );
  const childGraphCalls = events.filter(
    (event) =>
      event.kind === "graph_call_opened" &&
      event.graphFunctionRef === CHILD_GRAPH_FUNCTION_REF,
  );
  const boundRoute = events.find(
    (event) =>
      event.kind === "traversal_route_admitted" &&
      event.payload.routeKind === "blocked" &&
      event.payload.declarationRef?.startsWith(
        "graph-function-application://abiogenesis/",
      ),
  );
  assert.deepEqual(parentCalls.map((event) => event.payload.attempt), [1, 2, 3, 4]);
  assert.equal(childGraphCalls.length, 3);
  assert.notEqual(boundRoute, undefined);
  assert.equal(events.some((event) => event.kind === "run_closed"), false);
  assert.equal(events.at(-1).kind, "run_stopped");
});
