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
const PROGRAM_REF = "program://abiogenesis/conformance/hello-gate@5";
const GRAPH_FUNCTION_REF =
  "graph-function://abiogenesis/conformance/hello-gate@5";
const TARGET_GRAPH_FUNCTION_REF =
  "graph-function://abiogenesis/conformance/hello-gate-target@5";
const GATE_INPUT_CONTRACT_REF =
  "contract://abiogenesis/conformance/hello-gate-admitted-input@5";

async function readEvents(path) {
  try {
    const text = await readFile(path, "utf8");
    return text.trim().length === 0
      ? []
      : text.trim().split(/\r?\n/u).map((line) => JSON.parse(line));
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

async function runGateScenario(context, subject) {
  const harness = await setupInstalledCliHarness(context, root);
  const scenario = await buildRootCliScenario(
    harness,
    `m5-gate-${subject.toLowerCase()}`,
    (payload) => payload,
    {
      programRef: PROGRAM_REF,
      graphFunctionRef: GRAPH_FUNCTION_REF,
      allowlist: [GRAPH_FUNCTION_REF, TARGET_GRAPH_FUNCTION_REF],
      subject,
    },
  );
  const run = await runInstalledCli(harness, scenario);
  return {
    run,
    events: await readEvents(scenario.eventLogPath),
  };
}

test("M5 installed gate advances from admitted evaluator truth into its named target", async (context) => {
  const { run, events } = await runGateScenario(context, "World");

  assert.equal(run.exitCode, 0, run.stdout);
  assert.equal(run.outcomes.every((outcome) => outcome.disposition === "succeeded"), true);
  assert.deepEqual(run.outcomes[5].result, {
    kind: "hello_world_output",
    schemaVersion: "5.0.0",
    message: "Hello World",
  });
  assert.equal(run.outcomes[5].replayAgreement, true);

  const calls = events.filter((event) => event.kind === "c_call_opened");
  const evaluatorCall = calls.find(
    (event) => event.payload.stageRole === "evaluate",
  );
  assert.notEqual(evaluatorCall, undefined);
  const evaluatorFibre = events.find(
    (event) =>
      event.kind === "c_call_fibre_selected" &&
      event.aggregateId === evaluatorCall.aggregateId,
  );
  assert.notEqual(evaluatorFibre, undefined);
  assert.match(
    evaluatorFibre.payload.compositionRef,
    /^graph-function-application:\/\/abiogenesis\/[a-f0-9]{64}$/u,
  );
  const evaluatorResult = events.find(
    (event) =>
      event.kind === "c_call_result_admitted" &&
      event.aggregateId === evaluatorCall.aggregateId,
  );
  const evaluatorJudgment = events.find(
    (event) =>
      event.kind === "c_call_judged" &&
      event.aggregateId === evaluatorCall.aggregateId,
  );
  assert.equal(evaluatorResult.payload.contractRef, GATE_INPUT_CONTRACT_REF);
  assert.equal(evaluatorJudgment.payload.judgment, "advance");

  const gateRoute = events.find(
    (event) =>
      event.kind === "traversal_route_admitted" &&
      event.payload.cCallRef === evaluatorCall.aggregateId,
  );
  assert.equal(gateRoute.payload.routeKind, "advance");
  assert.equal(
    gateRoute.causationEventRefs.includes(evaluatorJudgment.eventId),
    true,
  );

  const workflowCall = calls.find(
    (event) => event.payload.callClass === "workflow",
  );
  assert.equal(
    workflowCall.payload.childGraphFunctionRef,
    TARGET_GRAPH_FUNCTION_REF,
  );
  assert.equal(
    events.some(
      (event) =>
        event.kind === "graph_call_opened" &&
        event.graphFunctionRef === TARGET_GRAPH_FUNCTION_REF,
    ),
    true,
  );
  assert.equal(events.at(-1).kind, "run_closed");
  assert.equal(JSON.stringify(events).includes("publicControlLoop"), false);
});

test("M5 installed gate admits a valid evaluator result and blocks before target traversal", async (context) => {
  const { run, events } = await runGateScenario(context, "Blocked");

  assert.equal(run.exitCode, 2, run.stdout);
  assert.equal(run.outcomes[5].disposition, "blocked");
  const calls = events.filter((event) => event.kind === "c_call_opened");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].payload.stageRole, "evaluate");
  const evaluatorFibre = events.find(
    (event) =>
      event.kind === "c_call_fibre_selected" &&
      event.aggregateId === calls[0].aggregateId,
  );
  assert.notEqual(evaluatorFibre, undefined);
  assert.match(
    evaluatorFibre.payload.compositionRef,
    /^graph-function-application:\/\/abiogenesis\/[a-f0-9]{64}$/u,
  );
  assert.equal(
    events.some(
      (event) =>
        event.kind === "c_call_result_admitted" &&
        event.aggregateId === calls[0].aggregateId &&
        event.payload.contractRef === GATE_INPUT_CONTRACT_REF,
    ),
    true,
  );
  const judgment = events.find(
    (event) =>
      event.kind === "c_call_judged" &&
      event.aggregateId === calls[0].aggregateId,
  );
  assert.equal(judgment.payload.judgment, "blocked");
  assert.equal(
    events.some(
      (event) =>
        event.kind === "traversal_route_admitted" &&
        event.payload.routeKind === "blocked" &&
        event.payload.cCallRef === calls[0].aggregateId,
    ),
    true,
  );
  assert.equal(
    events.some(
      (event) =>
        event.kind === "graph_call_opened" &&
        event.graphFunctionRef === TARGET_GRAPH_FUNCTION_REF,
    ),
    false,
  );
  assert.equal(events.some((event) => event.kind === "run_closed"), false);
  assert.equal(events.at(-1).kind, "run_stopped");
});
