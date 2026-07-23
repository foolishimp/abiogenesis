import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
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

async function activeLifecycleFluents(installedRoot, events, label) {
  const abg = await import(
    `${pathToFileURL(resolve(
      installedRoot,
      "build/code/src/abg/index.js",
    )).href}?lifecycle=${encodeURIComponent(label)}`
  );
  const active = new Set();
  for (const event of events) {
    const effect = abg.eventCalculusEffect(event);
    for (const fluent of effect.terminates) active.delete(fluent);
    for (const fluent of effect.initiates) active.add(fluent);
  }
  return [...active].filter((fluent) =>
    [
      "run_active(",
      "graph_call_active(",
      "frame_active(",
      "locus_active(",
      "c_call_active(",
      "parent_waiting_on_child(",
      "child_foldback_available(",
      "terminal_route_available(",
    ].some((prefix) => fluent.startsWith(prefix))
  );
}

async function runRecursion(
  context,
  label,
  remaining,
  blockedChildRemaining = null,
) {
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
        blockedChildRemaining,
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
    installedRoot: scenario.installedRoot,
  };
}

test("M5 installed graph recursion re-enters its parent through admitted child foldback", async (context) => {
  const { run, events, installedRoot } = await runRecursion(
    context,
    "m5-bounded-recursion-success",
    3,
  );

  assert.equal(run.exitCode, 0, run.stdout);
  assert.equal(run.outcomes.every((outcome) => outcome.disposition === "succeeded"), true);
  assert.deepEqual(run.outcomes[5].result, {
    kind: "bounded_recursion_state",
    schemaVersion: "5.0.0",
    blockedChildRemaining: null,
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
  assert.equal(events.filter((event) => event.kind === "terminal_reached").length, 4);
  assert.equal(events.filter((event) => event.kind === "frame_closed").length, 4);
  assert.equal(events.filter((event) => event.kind === "graph_call_closed").length, 4);
  for (const childGraphCall of childGraphCalls) {
    const childFrame = events.find(
      (event) =>
        event.kind === "frame_opened" &&
        event.graphCallId === childGraphCall.graphCallId,
    );
    const terminal = events.find(
      (event) =>
        event.kind === "terminal_reached" &&
        event.frameId === childFrame?.frameId,
    );
    const frameClosed = events.find(
      (event) =>
        event.kind === "frame_closed" &&
        event.frameId === childFrame?.frameId &&
        event.causationEventRefs.includes(terminal?.eventId),
    );
    const graphCallClosed = events.find(
      (event) =>
        event.kind === "graph_call_closed" &&
        event.graphCallId === childGraphCall.graphCallId &&
        event.causationEventRefs.includes(frameClosed?.eventId),
    );
    const foldback = foldbacks.find(
      (event) =>
        event.payload.childGraphCallId === childGraphCall.graphCallId,
    );
    assert.notEqual(childFrame, undefined);
    assert.notEqual(terminal, undefined);
    assert.notEqual(frameClosed, undefined);
    assert.notEqual(graphCallClosed, undefined);
    assert.equal(foldback?.payload.childDisposition, "closed");
    assert.equal(
      foldback?.payload.childTerminalEventRef,
      graphCallClosed.eventId,
    );
    assert.equal(
      foldback?.causationEventRefs.includes(graphCallClosed.eventId),
      true,
    );
  }
  assert.equal(events.filter((event) => event.kind === "run_closed").length, 1);
  assert.equal(events.at(-1).kind, "run_closed");
  assert.deepEqual(
    await activeLifecycleFluents(
      installedRoot,
      events,
      "m5-bounded-recursion-success",
    ),
    [],
  );
});

test("M5 installed graph recursion propagates one lawfully blocked child", async (context) => {
  const { run, events, installedRoot } = await runRecursion(
    context,
    "m5-bounded-recursion-child-blocked",
    3,
    2,
  );

  assert.equal(run.exitCode, 2, run.stdout);
  assert.equal(run.outcomes[5].disposition, "blocked");
  const childBlockedRoute = events.find(
    (event) =>
      event.kind === "traversal_route_admitted" &&
      event.graphFunctionRef === CHILD_GRAPH_FUNCTION_REF &&
      event.payload.routeKind === "blocked",
  );
  const foldback = events.find(
    (event) =>
      event.kind === "child_foldback_admitted" &&
      event.payload.applicationRef !== undefined &&
      event.payload.childDisposition === "blocked",
  );
  const parentBlockedRoute = events.find(
    (event) =>
      event.kind === "traversal_route_admitted" &&
      event.graphFunctionRef === GRAPH_FUNCTION_REF &&
      event.payload.routeKind === "blocked" &&
      event.payload.consumedAvailabilityRefs.includes(
        foldback?.payload.foldbackRef,
      ),
  );

  assert.notEqual(childBlockedRoute, undefined);
  assert.notEqual(foldback, undefined);
  assert.equal(foldback.payload.childClosureRef, null);
  assert.equal(
    foldback.payload.childTerminalEventRef,
    childBlockedRoute.eventId,
  );
  assert.notEqual(parentBlockedRoute, undefined);
  assert.equal(
    parentBlockedRoute.causationEventRefs.includes(foldback.eventId),
    true,
  );
  assert.equal(events.filter((event) => event.kind === "run_stopped").length, 1);
  assert.equal(events.at(-1).kind, "run_stopped");
  assert.deepEqual(
    await activeLifecycleFluents(
      installedRoot,
      events,
      "m5-bounded-recursion-child-blocked",
    ),
    [],
  );
});

test("M5 installed graph recursion blocks at its declared bound without another child", async (context) => {
  const { run, events, installedRoot } = await runRecursion(
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
  assert.deepEqual(
    await activeLifecycleFluents(
      installedRoot,
      events,
      "m5-bounded-recursion-bound",
    ),
    [],
  );
});
