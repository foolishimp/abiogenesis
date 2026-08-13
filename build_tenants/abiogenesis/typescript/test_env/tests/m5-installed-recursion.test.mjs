import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

import {
  buildRootCliScenario,
  runInstalledCli,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";
import { cloneEventPrefixFixture } from "../support/new-empty-append-sink.mjs";

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

function deepFreezeJson(value) {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value)) deepFreezeJson(child);
  return Object.freeze(value);
}

async function activeLifecycleFluents(installedRoot, events, label) {
  const abg = await import(
    `${pathToFileURL(resolve(
      installedRoot,
      "build/code/src/abg/index.js",
    )).href}?lifecycle=${encodeURIComponent(label)}`
  );
  const prefix = abg.selectValidatedRuntimeEventPrefix(
    deepFreezeJson([...events]),
  );
  return abg
    .deriveRuntimeEventCalculusProjection(prefix)
    .holds
    .map(abg.runtimeFluentKey)
    .filter((fluent) =>
    [
      "run_active(",
      "graph_call_active(",
      "frame_active(",
      "frame_blocked(",
      "frame_failed(",
      "locus_active(",
      "c_call_active(",
      "parent_waiting_on_child(",
      "child_foldback_available(",
      "terminal_route_available(",
    ].some((prefix) => fluent.startsWith(prefix))
  );
}

async function pairedChildRouteProjection(
  context,
  installedRoot,
  events,
  targetRoute,
) {
  const abg = await import(
    `${pathToFileURL(resolve(installedRoot, "build/code/src/abg/index.js")).href}?child-route=${Date.now()}`
  );
  const product = await import(
    `${pathToFileURL(resolve(installedRoot, "build/code/src/product/index.js")).href}?child-route=${Date.now()}`
  );
  const eventStore = await import(
    pathToFileURL(resolve(
      installedRoot,
      "build/code/src/abg/event_store.js",
    )).href
  );
  const controlStore = (await cloneEventPrefixFixture(
    context,
    abg,
    eventStore,
    events,
    "abi5-recursion-control-",
  )).store;
  const unrelatedRouteStore = (await cloneEventPrefixFixture(
    context,
    abg,
    eventStore,
    events,
    "abi5-recursion-unrelated-route-",
  )).store;
  const body = {
    ...targetRoute.payload,
    sourceCursorRef: "cursor://abiogenesis/m5/unrelated-r2-source",
    sourceCursorDigest: product.sha256Canonical({ cursor: "r2-source" }),
    cCallRef: "c-call:sha256:unrelated-r2",
    consumedAvailabilityRefs: [],
  };
  delete body.routeRef;
  delete body.routeDigest;
  const routeDigest = product.sha256Canonical(body);
  const routeRef =
    `traversal-route://abiogenesis/${routeDigest.slice("sha256:".length)}`;
  eventStore.admitRuntimeEvent(unrelatedRouteStore, {
    kind: "traversal_route_admitted",
    eventTime: "2026-08-04T00:00:00.000Z",
    aggregateType: "frame",
    aggregateId: targetRoute.frameId,
    parentAggregateId: targetRoute.graphCallId,
    causationEventRefs: [events.at(-1).eventId],
    correlationId: "correlation://abiogenesis/m5/unrelated-r2",
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: targetRoute.basisId,
    runId: targetRoute.runId,
    graphFunctionRef: targetRoute.graphFunctionRef,
    graphCallId: targetRoute.graphCallId,
    frameId: targetRoute.frameId,
    payload: { routeRef, routeDigest, ...body },
  });
  const coordinates = {
    runId: targetRoute.runId,
    graphCallId: targetRoute.graphCallId,
    frameId: targetRoute.frameId,
    cCallRef: targetRoute.payload.cCallRef,
    judgmentRef: targetRoute.payload.judgmentRef,
  };
  return {
    control: abg.projectCurrentApplicationChildRoute(controlStore, coordinates),
    unrelatedLaterRoute: abg.projectCurrentApplicationChildRoute(
      unrelatedRouteStore,
      coordinates,
    ),
    unrelatedRouteRef: routeRef,
  };
}

async function terminalizedBlockedChildRouteProjection(
  context,
  installedRoot,
  events,
  targetRoute,
) {
  const abg = await import(
    `${pathToFileURL(resolve(installedRoot, "build/code/src/abg/index.js")).href}?blocked-child=${Date.now()}`
  );
  const eventStore = await import(
    pathToFileURL(resolve(
      installedRoot,
      "build/code/src/abg/event_store.js",
    )).href
  );
  const prefixEvents = events.slice(0, targetRoute.admissionOrdinal);
  const stopTemplate = events.find((event) => event.kind === "run_stopped");
  const runTemplate = prefixEvents.find(
    (event) => event.kind === "run_segment_opened",
  );
  assert.ok(stopTemplate && runTemplate);
  const reopen = async (label) => (await cloneEventPrefixFixture(
    context,
    abg,
    eventStore,
    prefixEvents,
    label,
  )).store;
  const coordinates = {
    runId: targetRoute.runId,
    graphCallId: targetRoute.graphCallId,
    frameId: targetRoute.frameId,
    cCallRef: targetRoute.payload.cCallRef,
    judgmentRef: targetRoute.payload.judgmentRef,
  };
  const appendStop = (store, overrides = {}) => {
    const candidate = structuredClone(stopTemplate);
    delete candidate.eventId;
    delete candidate.admissionOrdinal;
    delete candidate.payloadDigest;
    candidate.aggregateId = overrides.runId ?? targetRoute.runId;
    candidate.runId = overrides.runId ?? targetRoute.runId;
    candidate.graphCallId = overrides.graphCallId ?? targetRoute.graphCallId;
    candidate.frameId = overrides.frameId ?? targetRoute.frameId;
    candidate.causationEventRefs = overrides.causationEventRefs ??
      [targetRoute.eventId];
    candidate.payload = {
      ...candidate.payload,
      disposition: "blocked",
      routeRef: overrides.routeRef ?? targetRoute.payload.routeRef,
      cCallRef: targetRoute.payload.cCallRef,
      judgmentRef: targetRoute.payload.judgmentRef,
    };
    return eventStore.admitRuntimeEvent(store, candidate);
  };

  const positiveStore = await reopen("abi5-recursion-blocked-positive-");
  appendStop(positiveStore);
  const positive = abg.projectCurrentApplicationChildRoute(
    positiveStore,
    coordinates,
  );
  const positiveProjection = abg.deriveRuntimeEventCalculusProjection(
    abg.selectValidatedRuntimeEventPrefix(positiveStore.readAll(), {
      runId: targetRoute.runId,
    }),
  );

  const wrongStopStore = await reopen("abi5-recursion-blocked-wrong-stop-");
  appendStop(wrongStopStore, {
    routeRef: "traversal-route://abiogenesis/wrong-blocked-child-stop",
  });
  let wrongStopRejected = false;
  try {
    abg.projectCurrentApplicationChildRoute(wrongStopStore, coordinates);
  } catch (error) {
    assert.match(
      error.message,
      /contradictory route, causation, disposition, or terminal truth/,
    );
    wrongStopRejected = true;
  }

  const crossRunStore = await reopen("abi5-recursion-blocked-cross-run-");
  const crossRunId = "run://abiogenesis/m5/cross-run-blocked-child-stop";
  const crossGraphCallId =
    "graph-call://abiogenesis/m5/cross-run-blocked-child-stop";
  const crossFrameId = "frame://abiogenesis/m5/cross-run-blocked-child-stop";
  const crossRun = structuredClone(runTemplate);
  delete crossRun.eventId;
  delete crossRun.admissionOrdinal;
  delete crossRun.payloadDigest;
  crossRun.aggregateId = crossRunId;
  crossRun.runId = crossRunId;
  crossRun.payload.runId = crossRunId;
  crossRun.correlationId =
    "correlation://abiogenesis/m5/cross-run-blocked-child-stop";
  const admittedCrossRun = eventStore.admitRuntimeEvent(crossRunStore, crossRun);
  appendStop(crossRunStore, {
    runId: crossRunId,
    graphCallId: crossGraphCallId,
    frameId: crossFrameId,
    causationEventRefs: [admittedCrossRun.eventId],
  });
  const crossRunStop = abg.projectCurrentApplicationChildRoute(
    crossRunStore,
    coordinates,
  );
  const crossRunProjection = abg.deriveRuntimeEventCalculusProjection(
    abg.selectValidatedRuntimeEventPrefix(crossRunStore.readAll(), {
      runId: targetRoute.runId,
    }),
  );
  const holds = (projection, name, identity) => abg.holdsAt(
    projection,
    abg.constructRuntimeFluent({ name, identity }),
  );
  return {
    positive,
    positiveRunTerminal: holds(
      positiveProjection,
      "run_terminal",
      targetRoute.runId,
    ),
    positiveRunActive: holds(
      positiveProjection,
      "run_active",
      targetRoute.runId,
    ),
    positiveFrameBlocked: holds(
      positiveProjection,
      "frame_blocked",
      targetRoute.frameId,
    ),
    wrongStopRejected,
    crossRunStop,
    crossRunTerminalizedTarget: holds(
      crossRunProjection,
      "run_terminal",
      targetRoute.runId,
    ),
  };
}

async function runRecursionWorker(workerName, input) {
  const worker = resolve(
    root,
    `test_env/falsifiers/${workerName}`,
  );
  return await new Promise((resolveResult, reject) => {
    const child = spawn(process.execPath, [worker], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`${workerName} failed ${code}: ${stderr}`));
        return;
      }
      resolveResult(JSON.parse(stdout));
    });
    child.stdin.end(JSON.stringify(input));
  });
}

function runRecursionProjectionWorker(input) {
  return runRecursionWorker("runtime-recursion-route-worker.mjs", input);
}

function runDeferredApplicationWorker(input) {
  return runRecursionWorker("runtime-deferred-application-worker.mjs", input);
}

function runRecursionLifecycleWorker(input) {
  return runRecursionWorker("runtime-recursion-lifecycle-worker.mjs", input);
}

function runStaleRehydrateWorker(input) {
  return runRecursionWorker("runtime-stale-rehydrate-worker.mjs", input);
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
      catalogApplications: [],
      programRef: PROGRAM_REF,
      catalogHandle: GRAPH_FUNCTION_REF,
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
  assert.deepEqual(run.outcomes[6].result, {
    kind: "bounded_recursion_state",
    schemaVersion: "5.0.0",
    blockedChildRemaining: null,
    remaining: 0,
    terminal: true,
    trace: [2, 1, 0],
  });
  assert.equal(run.outcomes[6].replayAgreement, true);

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
  const firstChildTerminalRoute = events.find(
    (event) =>
      event.kind === "traversal_route_admitted" &&
      event.graphFunctionRef === CHILD_GRAPH_FUNCTION_REF &&
      event.payload.routeKind === "terminal",
  );
  assert.ok(firstChildTerminalRoute);
  const pairedChildRoute = await pairedChildRouteProjection(
    context,
    installedRoot,
    events,
    firstChildTerminalRoute,
  );
  assert.equal(pairedChildRoute.control.routeRef, firstChildTerminalRoute.payload.routeRef);
  assert.equal(
    pairedChildRoute.unrelatedLaterRoute.routeRef,
    firstChildTerminalRoute.payload.routeRef,
  );
  assert.notEqual(
    pairedChildRoute.unrelatedLaterRoute.routeRef,
    pairedChildRoute.unrelatedRouteRef,
  );
  const exactFoldback = foldbacks[0];
  const exactRoute = applicationRoutes.find(
    (event) =>
      event.payload.consumedAvailabilityRefs.includes(
        exactFoldback.payload.foldbackRef,
      ),
  );
  assert.ok(exactRoute);
  const projectionInput = {
    installedPackageRoot: installedRoot,
    runId: exactFoldback.runId,
    foldbackRef: exactFoldback.payload.foldbackRef,
    routeRef: exactRoute.payload.routeRef,
    foldbackPrefix: events.slice(0, exactFoldback.admissionOrdinal),
    routePrefix: events.slice(0, exactRoute.admissionOrdinal),
  };
  const [firstProjection, secondProjection] = await Promise.all([
    runRecursionProjectionWorker(projectionInput),
    runRecursionProjectionWorker(projectionInput),
  ]);
  assert.notEqual(firstProjection.processId, process.pid);
  assert.notEqual(secondProjection.processId, process.pid);
  assert.notEqual(firstProjection.processId, secondProjection.processId);
  const { processId: _firstProcessId, ...firstTruth } = firstProjection;
  const { processId: _secondProcessId, ...secondTruth } = secondProjection;
  assert.deepEqual(secondTruth, firstTruth);
  assert.equal(firstTruth.foldback.foldbackRef, exactFoldback.payload.foldbackRef);
  assert.equal(firstTruth.foldback.admissionEventRef, exactFoldback.eventId);
  assert.equal(firstTruth.route.routeRef, exactRoute.payload.routeRef);
  assert.equal(firstTruth.route.admissionEventRef, exactRoute.eventId);
  assert.equal(firstTruth.consumedFoldback, null);
  const exactJudgment = events.find(
    (event) =>
      event.kind === "c_call_judged" &&
      event.payload.judgmentRef === exactRoute.payload.judgmentRef,
  );
  assert.ok(exactJudgment);
  const beforeRoutePrefix = events.slice(0, exactRoute.admissionOrdinal - 1);
  const deferredInput = {
    installedPackageRoot: installedRoot,
    coordinates: {
      runId: exactRoute.runId,
      cCallRef: exactRoute.payload.cCallRef,
      resultRef: exactJudgment.payload.resultRef,
      judgmentRef: exactRoute.payload.judgmentRef,
    },
    beforeRoutePrefix,
    afterRoutePrefix: projectionInput.routePrefix,
  };
  const [firstDeferred, secondDeferred] = await Promise.all([
    runDeferredApplicationWorker(deferredInput),
    runDeferredApplicationWorker(deferredInput),
  ]);
  assert.notEqual(firstDeferred.processId, process.pid);
  assert.notEqual(secondDeferred.processId, process.pid);
  assert.notEqual(firstDeferred.processId, secondDeferred.processId);
  const { processId: _firstDeferredProcessId, ...firstDeferredTruth } =
    firstDeferred;
  const { processId: _secondDeferredProcessId, ...secondDeferredTruth } =
    secondDeferred;
  assert.deepEqual(secondDeferredTruth, firstDeferredTruth);
  assert.equal(firstDeferredTruth.completion.disposition, "application_ready");
  assert.equal(firstDeferredTruth.consumedCompletion, null);
  assert.equal(firstDeferredTruth.currentBeforeRoute, true);
  assert.equal(firstDeferredTruth.currentAfterRoute, false);
  assert.equal(firstDeferredTruth.reopenedBeforeRoute, true);
  assert.equal(firstDeferredTruth.reopenedAfterRoute, true);
  const staleRehydrate = await runStaleRehydrateWorker({
    installedPackageRoot: installedRoot,
    coordinates: deferredInput.coordinates,
    events: projectionInput.routePrefix,
  });
  assert.notEqual(staleRehydrate.processId, process.pid);
  assert.ok(staleRehydrate.state);
  assert.equal(staleRehydrate.sameCCallBranded, true);
  assert.equal(staleRehydrate.sameResultBranded, true);
  assert.equal(staleRehydrate.sameJudgmentBranded, true);
  assert.equal(staleRehydrate.currentOutcome, true);

  const lifecycleInput = {
    installedPackageRoot: installedRoot,
    runId: exactRoute.runId,
    frameId: exactRoute.frameId,
    routeRef: exactRoute.payload.routeRef,
    routeKind: "advance",
    sourceCursorRef: exactRoute.payload.sourceCursorRef,
    targetCursorRef: exactRoute.payload.targetCursorRef,
    beforeRoutePrefix,
    afterRoutePrefix: projectionInput.routePrefix,
    terminalPrefix: events,
  };
  const [firstLifecycle, secondLifecycle] = await Promise.all([
    runRecursionLifecycleWorker(lifecycleInput),
    runRecursionLifecycleWorker(lifecycleInput),
  ]);
  assert.notEqual(firstLifecycle.processId, process.pid);
  assert.notEqual(secondLifecycle.processId, process.pid);
  assert.notEqual(firstLifecycle.processId, secondLifecycle.processId);
  const { processId: _firstLifecycleProcessId, ...firstLifecycleTruth } =
    firstLifecycle;
  const { processId: _secondLifecycleProcessId, ...secondLifecycleTruth } =
    secondLifecycle;
  assert.deepEqual(secondLifecycleTruth, firstLifecycleTruth);
  assert.equal(firstLifecycleTruth.sourceCurrentBeforeRoute, true);
  assert.equal(firstLifecycleTruth.sourceCurrentAfterRoute, false);
  assert.equal(firstLifecycleTruth.sourceActiveAfterRoute, false);
  assert.equal(firstLifecycleTruth.targetActiveAfterRoute, true);
  assert.equal(firstLifecycleTruth.runTerminalAfterRoute, false);
  assert.equal(firstLifecycleTruth.routeAfterTerminal, null);
  assert.equal(events.filter((event) => event.kind === "terminal_reached").length, 4);
  assert.equal(events.filter((event) => event.kind === "frame_closed").length, 4);
  assert.equal(events.filter((event) => event.kind === "graph_call_closed").length, 4);
  const abg = await import(
    `${pathToFileURL(resolve(
      installedRoot,
      "build/code/src/abg/index.js",
    )).href}?wait-identity=m5-bounded-recursion-success`
  );
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
    assert.deepEqual(
      abg.eventCalculusEffect(childGraphCall).initiates
        .map(abg.runtimeFluentKey)
        .filter((fluent) => fluent.startsWith("parent_waiting_on_child(")),
      [`parent_waiting_on_child(${childGraphCall.graphCallId})`],
    );
    assert.equal(
      abg.eventCalculusEffect(foldback).terminates.some((fluent) =>
        abg.runtimeFluentKey(fluent) ===
          `parent_waiting_on_child(${childGraphCall.graphCallId})`
      ),
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
  assert.equal(run.outcomes[6].disposition, "blocked");
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
  const terminalizedBlockedChild =
    await terminalizedBlockedChildRouteProjection(
      context,
      installedRoot,
      events,
      childBlockedRoute,
    );
  assert.equal(
    terminalizedBlockedChild.positive.routeRef,
    childBlockedRoute.payload.routeRef,
  );
  assert.equal(terminalizedBlockedChild.positiveRunTerminal, true);
  assert.equal(terminalizedBlockedChild.positiveRunActive, false);
  assert.equal(terminalizedBlockedChild.positiveFrameBlocked, false);
  assert.equal(terminalizedBlockedChild.wrongStopRejected, true);
  assert.equal(
    terminalizedBlockedChild.crossRunStop.routeRef,
    childBlockedRoute.payload.routeRef,
  );
  assert.equal(terminalizedBlockedChild.crossRunTerminalizedTarget, false);
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
  const blockedLifecycleInput = {
    installedPackageRoot: installedRoot,
    runId: parentBlockedRoute.runId,
    frameId: parentBlockedRoute.frameId,
    routeRef: parentBlockedRoute.payload.routeRef,
    routeKind: "blocked",
    sourceCursorRef: parentBlockedRoute.payload.sourceCursorRef,
    targetCursorRef: null,
    beforeRoutePrefix: events.slice(
      0,
      parentBlockedRoute.admissionOrdinal - 1,
    ),
    afterRoutePrefix: events,
  };
  const [firstBlockedLifecycle, secondBlockedLifecycle] = await Promise.all([
    runRecursionLifecycleWorker(blockedLifecycleInput),
    runRecursionLifecycleWorker(blockedLifecycleInput),
  ]);
  assert.notEqual(firstBlockedLifecycle.processId, process.pid);
  assert.notEqual(secondBlockedLifecycle.processId, process.pid);
  assert.notEqual(
    firstBlockedLifecycle.processId,
    secondBlockedLifecycle.processId,
  );
  const {
    processId: _firstBlockedLifecycleProcessId,
    ...firstBlockedLifecycleTruth
  } = firstBlockedLifecycle;
  const {
    processId: _secondBlockedLifecycleProcessId,
    ...secondBlockedLifecycleTruth
  } = secondBlockedLifecycle;
  assert.deepEqual(secondBlockedLifecycleTruth, firstBlockedLifecycleTruth);
  assert.equal(firstBlockedLifecycleTruth.sourceCurrentBeforeRoute, true);
  assert.equal(firstBlockedLifecycleTruth.sourceCurrentAfterRoute, false);
  assert.equal(firstBlockedLifecycleTruth.sourceActiveAfterRoute, false);
  assert.equal(firstBlockedLifecycleTruth.targetActiveAfterRoute, false);
  assert.equal(firstBlockedLifecycleTruth.runTerminalAfterRoute, true);
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
  assert.equal(run.outcomes[6].disposition, "blocked");
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
