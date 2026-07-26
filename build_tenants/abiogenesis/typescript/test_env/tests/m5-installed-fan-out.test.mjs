import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import * as abg from "../../build/code/src/abg/index.js";
import {
  buildRootCliScenario,
  runInstalledCli,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PROGRAM_REF =
  "program://abiogenesis/conformance/fan-out-hello@5";
const GRAPH_FUNCTION_REF =
  "graph-function://abiogenesis/conformance/fan-out-hello@5";
const ELEMENT_REF =
  "graph-function://abiogenesis/conformance/fan-out-hello-element@5";
const REDUCER_REF =
  "graph-function://abiogenesis/conformance/fan-out-hello-reducer@5";
const BATCH_REF =
  "batch://abiogenesis/conformance/fan-out-hello@5";

async function readEvents(path) {
  return (await readFile(path, "utf8"))
    .trim()
    .split(/\r?\n/u)
    .map((line) => JSON.parse(line));
}

function input(subjects, blockedOrdinal = null) {
  return {
    kind: "fan_out_hello_vector_input",
    schemaVersion: "5.0.0",
    members: subjects.map((subject, ordinal) => ({
      ordinal,
      memberRef: `member://developer/${encodeURIComponent(subject.toLowerCase())}`,
      value: {
        kind: "fan_out_hello_member_input",
        schemaVersion: "5.0.0",
        block: ordinal === blockedOrdinal,
        subject,
      },
    })),
  };
}

async function runFanOut(context, label, subjects, blockedOrdinal = null) {
  const harness = await setupInstalledCliHarness(context, root);
  const submittedInput = input(subjects, blockedOrdinal);
  const scenario = await buildRootCliScenario(
    harness,
    label,
    (payload) => payload,
    {
      programRef: PROGRAM_REF,
      graphFunctionRef: GRAPH_FUNCTION_REF,
      allowlist: [GRAPH_FUNCTION_REF, ELEMENT_REF, REDUCER_REF],
      input: submittedInput,
    },
  );
  const run = await runInstalledCli(harness, scenario);
  let events;
  try {
    events = await readEvents(scenario.eventLogPath);
  } catch (error) {
    throw new Error(
      `fan-out event log unavailable: ${error.message}\nstdout:\n${run.stdout}\nstderr:\n${run.stderr}`,
    );
  }
  return {
    run,
    events,
    submittedInput,
  };
}

function activeFluents(events) {
  const active = new Set();
  for (const event of events) {
    const effect = abg.eventCalculusEffect(event);
    effect.terminates.forEach((fluent) => active.delete(fluent));
    effect.initiates.forEach((fluent) => active.add(fluent));
  }
  return [...active].sort();
}

test("M5 installed fan-out admits one ordered vector before one fan-in reducer", async (context) => {
  const { run, events, submittedInput } = await runFanOut(
    context,
    "m5-fan-out-complete",
    ["Alpha", "Beta", "Gamma"],
  );

  assert.equal(run.exitCode, 0, run.stdout);
  assert.equal(run.outcomes.every((outcome) => outcome.disposition === "succeeded"), true);
  assert.deepEqual(run.outcomes[5].result, {
    kind: "fan_out_hello_summary",
    schemaVersion: "5.0.0",
    count: 3,
    messages: ["Hello Alpha", "Hello Beta", "Hello Gamma"],
  });

  const taskCalls = events.filter(
    (event) =>
      event.kind === "c_call_opened" &&
      event.graphFunctionRef === GRAPH_FUNCTION_REF &&
      event.payload.callClass === "workflow" &&
      event.payload.batchRef === BATCH_REF,
  );
  const completion = events.find(
    (event) =>
      event.kind === "fan_out_completion_admitted" &&
      event.payload.completionKind === "complete_vector",
  );
  const reducerCall = events.find(
    (event) =>
      event.kind === "c_call_opened" &&
      event.graphFunctionRef === REDUCER_REF,
  );
  assert.deepEqual(taskCalls.map((event) => event.payload.taskOrdinal), [0, 1, 2]);
  assert.equal(completion.payload.taskRows.length, 3);
  assert.deepEqual(
    completion.payload.outputVector.members.map((member) => member.ordinal),
    [0, 1, 2],
  );
  assert.deepEqual(
    completion.payload.taskRows.map((row) => row.inputMemberRef),
    submittedInput.members.map((member) => member.memberRef),
  );
  assert.deepEqual(
    completion.payload.outputVector.members.map((member) =>
      member.inputMemberRef
    ),
    submittedInput.members.map((member) => member.memberRef),
  );
  assert.deepEqual(
    completion.payload.outputVector.members.map((member) => member.value.message),
    ["Hello Alpha", "Hello Beta", "Hello Gamma"],
  );
  assert.notEqual(reducerCall, undefined);
  assert.equal(
    completion.admissionOrdinal < reducerCall.admissionOrdinal,
    true,
  );
  assert.equal(
    events.filter(
      (event) =>
        event.kind === "graph_call_opened" &&
        event.graphFunctionRef === REDUCER_REF,
    ).length,
    1,
  );
  const route = events.find(
    (event) =>
      event.kind === "traversal_route_admitted" &&
      event.payload.consumedAvailabilityRefs?.includes(
        completion.payload.applicationRef,
      ),
  );
  assert.notEqual(route, undefined);
  assert.deepEqual(route.payload.consumedAvailabilityRefs, [
    completion.payload.taskRows.at(-1).judgmentRef,
    completion.payload.applicationRef,
  ]);
  assert.equal(
    activeFluents(events).some((fluent) =>
      fluent.startsWith("c_call_judgment_available(") ||
      fluent.startsWith("fan_out_vector_available(") ||
      fluent.startsWith("fan_out_partial_stop_available(")
    ),
    false,
  );
  assert.equal(events.at(-1).kind, "run_closed");
});

test("M5 installed fan-out admits a partial stop and never enters fan-in", async (context) => {
  const { run, events, submittedInput } = await runFanOut(
    context,
    "m5-fan-out-partial-stop",
    ["Alpha", "Beta", "Gamma"],
    1,
  );

  assert.equal(run.exitCode, 2, run.stdout);
  assert.equal(run.outcomes.slice(0, 5).every((outcome) => outcome.disposition === "succeeded"), true);
  assert.equal(
    run.outcomes[5].disposition,
    "blocked",
    JSON.stringify(run.outcomes[5]),
  );
  const completion = events.find(
    (event) =>
      event.kind === "fan_out_completion_admitted" &&
      event.payload.completionKind === "partial_stop",
  );
  assert.notEqual(
    completion,
    undefined,
    JSON.stringify(events.map((event) => ({
      kind: event.kind,
      graphFunctionRef: event.graphFunctionRef,
      payload: event.payload,
    }))),
  );
  assert.deepEqual(
    completion.payload.completedRows.map((row) => row.ordinal),
    [0],
  );
  assert.equal(completion.payload.stoppingRow.ordinal, 1);
  assert.deepEqual(
    [
      ...completion.payload.completedRows.map((row) => row.inputMemberRef),
      completion.payload.stoppingRow.inputMemberRef,
      ...completion.payload.unstartedRows.map((row) => row.inputMemberRef),
    ],
    submittedInput.members.map((member) => member.memberRef),
  );
  assert.deepEqual(
    completion.payload.unstartedRows.map((row) => row.ordinal),
    [2],
  );
  assert.equal(Object.hasOwn(completion.payload, "outputVector"), false);
  assert.equal(
    events.some(
      (event) =>
        event.kind === "graph_call_opened" &&
        event.graphFunctionRef === REDUCER_REF,
    ),
    false,
  );
  const route = events.find(
    (event) =>
      event.kind === "traversal_route_admitted" &&
      event.payload.consumedAvailabilityRefs?.includes(
        completion.payload.applicationRef,
      ),
  );
  assert.notEqual(route, undefined);
  assert.deepEqual(route.payload.consumedAvailabilityRefs, [
    completion.payload.stoppingRow.judgmentRef,
    completion.payload.applicationRef,
  ]);
  assert.equal(
    activeFluents(events).some((fluent) =>
      fluent.startsWith("c_call_judgment_available(") ||
      fluent.startsWith("fan_out_vector_available(") ||
      fluent.startsWith("fan_out_partial_stop_available(")
    ),
    false,
  );
  assert.equal(events.filter((event) => event.kind === "run_stopped").length, 1);
  assert.equal(events.at(-1).kind, "run_stopped");
});
