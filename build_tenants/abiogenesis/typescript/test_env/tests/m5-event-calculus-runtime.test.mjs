import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import test from "node:test";

import {
  AbgEventStore,
  admitRuntimeEvent,
} from "../../build/code/src/abg/event_store.js";
import {
  projectCurrentApplicationChildPreparationRefusal,
} from "../../build/code/src/abg/graph_application.js";
import { sha256Canonical } from "../../build/code/src/shared/digests.js";

import { setupInstalledRootExecutionBasis } from "../support/root-installed-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

async function runPreparationRefusalWorker(input) {
  const worker = resolve(
    root,
    "test_env/falsifiers/runtime-preparation-refusal-worker.mjs",
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
        reject(new Error(
          `preparation-refusal projection worker failed ${code}: ${stderr}`,
        ));
        return;
      }
      resolveResult(JSON.parse(stdout));
    });
    child.stdin.end(JSON.stringify(input));
  });
}

function runtimeBasis(correlationId) {
  return {
    eventTime: "2026-07-21T00:00:00.000Z",
    correlationId,
    causationEventRefs: [],
  };
}

function fakeEvent(eventId, admissionOrdinal, runId, causationEventRefs = []) {
  return Object.freeze({
    kind: "run_segment_opened",
    eventTime: "2026-07-21T00:00:00.000Z",
    aggregateType: "run",
    aggregateId: runId ?? "workspace://event-calculus-test",
    parentAggregateId: null,
    causationEventRefs: Object.freeze([...causationEventRefs]),
    correlationId: "correlation://t287/event-prefix",
    workflowVersion: "5.0.0",
    scopeClass: runId === undefined ? "workspace" : "run",
    basisId: "basis://t287/event-prefix",
    ...(runId === undefined ? {} : { runId }),
    payload: Object.freeze({}),
    eventId,
    admissionOrdinal,
    payloadDigest: `sha256:${"0".repeat(64)}`,
  });
}

function deeplyFreeze(value) {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value)) deeplyFreeze(child);
  return Object.freeze(value);
}

function retryEvent({
  kind,
  eventId,
  admissionOrdinal,
  runId,
  attemptRef,
  progressRef,
  causationEventRefs = [],
  consumedAvailabilityRefs = [],
}) {
  return deeplyFreeze({
    ...fakeEvent(eventId, admissionOrdinal, runId, causationEventRefs),
    kind,
    aggregateType: "frame",
    aggregateId: `frame://${runId}`,
    graphCallId: `graph-call://${runId}`,
    frameId: `frame://${runId}`,
    payload: kind === "retry_attempt_opened"
      ? { attemptRef }
      : kind === "retry_progress_recorded"
        ? { attemptRef, progressRef }
        : {
            routeKind: "retry",
            consumedAvailabilityRefs,
          },
  });
}

async function installedInternal(installedRoot, moduleName, cacheBust = true) {
  const moduleUrl = pathToFileURL(
    join(installedRoot, `build/code/src/abg/${moduleName}.js`),
  ).href;
  return import(
    cacheBust ? `${moduleUrl}?t287=${Date.now()}-${moduleName}` : moduleUrl
  );
}

function runProjection(abg, prefixModule, store, runId) {
  const prefix = abg.selectValidatedRuntimeEventPrefix(
    store.readAll(),
    { runId },
  );
  return abg.deriveRuntimeEventCalculusProjection(prefix);
}

async function admitStandardClosure(environment, store, opened, correlationRoot) {
  const {
    abg,
    gtl,
    hog,
    installedRoot,
    program,
    graph,
    graphValidation,
    input,
    rawInput,
    implementationSet,
    implementationRow,
    implementationResolution,
    executionBasis,
    closureContract,
  } = environment;
  const traversalStop = hog.traverse({
    program,
    graph,
    graphValidation,
    executionBasis,
    openedTraversalScope: opened.scope,
  });
  assert.equal(traversalStop.kind, "traversal_stop_ref", JSON.stringify(traversalStop));
  const cursor = abg.admitInitialTraversalCursor(
    store,
    executionBasis,
    opened.scope,
    graph,
    graphValidation,
    traversalStop.cursor,
    runtimeBasis(`${correlationRoot}/cursor`),
  );
  assert.equal(cursor.kind, "traversal_cursor_admission", JSON.stringify(cursor));
  const cCallAdmission = abg.openCCall(
    store,
    executionBasis,
    opened.scope,
    program,
    graph,
    traversalStop,
    implementationSet,
    implementationRow,
    runtimeBasis(`${correlationRoot}/c-call-open`),
  );
  assert.equal(cCallAdmission.kind, "c_call_admission", JSON.stringify(cCallAdmission));
  const cCall = cCallAdmission.cCall;
  const implementationModule = await import(
    `${pathToFileURL(join(installedRoot, implementationResolution.modulePath)).href}?t287-closure=${Date.now()}`
  );
  const leafCandidate = implementationModule[implementationResolution.namedSymbol](input);
  const evidence = abg.admitEvidence(
    store,
    cCall,
    leafCandidate.evidenceCandidates[0],
    closureContract.evidenceContractRef,
    rawInput.subjectDigest,
    runtimeBasis(`${correlationRoot}/evidence`),
  );
  assert.equal(evidence.kind, "admitted_c_call_evidence", JSON.stringify(evidence));
  const result = abg.admitResult(
    store,
    cCall,
    leafCandidate.resultCandidate,
    "success",
    closureContract.resultContractRef,
    "hello_world_output",
    (value) => value?.kind === "hello_world_output" && value?.schemaVersion === "5.0.0",
    [evidence],
    runtimeBasis(`${correlationRoot}/result`),
  );
  assert.equal(result.kind, "admitted_c_call_result", JSON.stringify(result));
  const resultReplay = abg.replay(store, { runId: opened.scope.runId });
  const judgmentCandidate = hog.proposeJudgment(
    cCall,
    result,
    resultReplay,
    input,
    {
      predicateRef: gtl.HELLO_WORLD_IDS.judgmentPredicateRef,
      advanceReasonRef: "reason://abiogenesis/conformance/hello-world-satisfied@5",
      rejectionReasonRef: "reason://abiogenesis/conformance/hello-world-rejected@5",
      evaluate: gtl.evaluateHelloWorldResult,
    },
    closureContract.judgmentContractRef,
  );
  const judgment = abg.admitJudgment(
    store,
    cCall,
    result,
    judgmentCandidate,
    resultReplay,
    runtimeBasis(`${correlationRoot}/judgment`),
  );
  assert.equal(judgment.kind, "admitted_c_call_judgment", JSON.stringify(judgment));
  const judgedReplay = abg.replay(store, { runId: opened.scope.runId });
  const routeCandidate = hog.proposeTerminalRoute(
    graph,
    traversalStop,
    cCall,
    judgment,
    judgedReplay,
    closureContract.transitionContractRef,
  );
  const route = abg.admitRoute(
    store,
    executionBasis,
    graph,
    traversalStop.cursor,
    null,
    judgedReplay,
    routeCandidate,
    runtimeBasis(`${correlationRoot}/route`),
    { cCall, result, judgment },
  );
  assert.equal(route.kind, "admitted_traversal_route", JSON.stringify(route));
  const routeReplay = abg.replay(store, { runId: opened.scope.runId });
  const closure = abg.admitClosure(
    store,
    cCall,
    result,
    judgment,
    route,
    routeReplay,
    closureContract,
    runtimeBasis(`${correlationRoot}/closure`),
  );
  assert.equal(closure.kind, "closure_admission", JSON.stringify(closure));
  return closure;
}

test("validated event-prefix selection is immutable, ordered, and causally run-local", async () => {
  const prefixModule = await import(
    `${pathToFileURL(join(root, "build/code/src/abg/event_prefix.js")).href}?t287-prefix=${Date.now()}`
  );
  const workspace = fakeEvent("event://workspace", 1, undefined);
  const runA = fakeEvent("event://run-a", 2, "run://a", [workspace.eventId]);
  const runB = fakeEvent("event://run-b", 3, "run://b", [workspace.eventId]);
  const runAChild = fakeEvent("event://run-a-child", 4, "run://a", [runA.eventId]);
  const events = Object.freeze([workspace, runA, runB, runAChild]);

  assert.deepEqual(
    prefixModule.selectValidatedRuntimeEventPrefix(events, { runId: "run://a" })
      .events.map((event) => event.eventId),
    [workspace.eventId, runA.eventId, runAChild.eventId],
  );
  assert.equal(
    Object.isFrozen(
      prefixModule.selectValidatedRuntimeEventPrefix(events).events,
    ),
    true,
  );
  assert.deepEqual(
    prefixModule.selectValidatedRuntimeEventPrefix(Object.freeze([])).events,
    [],
  );
  assert.throws(
    () => prefixModule.selectValidatedRuntimeEventPrefix(Object.freeze([
      Object.freeze({ ...workspace, payload: {} }),
    ])),
    /explicit immutable snapshot/,
  );
  assert.throws(
    () => prefixModule.selectValidatedRuntimeEventPrefix(
      Object.freeze([workspace, Object.freeze({ ...runA, admissionOrdinal: 3 })]),
    ),
    /gap-free admission-ordinal order/,
  );
  assert.throws(
    () => prefixModule.selectValidatedRuntimeEventPrefix(Object.freeze([
      workspace,
      Object.freeze({ ...runA, causationEventRefs: Object.freeze(["event://unknown"]) }),
    ]), { runId: "run://a" }),
    /unknown causation event|unknown causal predecessor/,
  );
  assert.throws(
    () => prefixModule.selectValidatedRuntimeEventPrefix(Object.freeze([
      workspace,
      runA,
      Object.freeze({ ...runB, causationEventRefs: Object.freeze([runA.eventId]) }),
    ]), { runId: "run://b" }),
    /cross a run causation boundary/,
  );
});

test("closed typed Event Calculus law refuses missing, duplicate, malformed, and contradictory input", async () => {
  const eventCalculus = await import(
    `${pathToFileURL(join(root, "build/code/src/abg/event_calculus.js")).href}?t287-law=${Date.now()}`
  );
  const eventKinds = Object.freeze(Object.keys(eventCalculus.ROOT_EVENT_CALCULUS));
  assert.throws(
    () => eventCalculus.validateRuntimeEventCalculusAxiomKindsForModuleTest(
      Object.freeze(eventKinds.slice(1)),
    ),
    /Missing Event Calculus axiom/,
  );
  assert.throws(
    () => eventCalculus.validateRuntimeEventCalculusAxiomKindsForModuleTest(
      Object.freeze([...eventKinds, eventKinds[0]]),
    ),
    /Duplicate Event Calculus axiom/,
  );
  assert.throws(
    () => eventCalculus.constructRuntimeFluentPattern({}),
    /must constrain name or identity/,
  );
  const runActive = eventCalculus.constructRunActiveFluent("run://contradiction");
  assert.throws(
    () => eventCalculus.validateRuntimeEventCalculusEffectForModuleTest({
      initiates: Object.freeze([runActive]),
      terminates: Object.freeze([runActive]),
      clips: Object.freeze([]),
      declips: Object.freeze([]),
    }),
    /both initiate and terminate/,
  );
  assert.throws(
    () => eventCalculus.deriveRuntimeEventCalculusProjection(Object.freeze({
      kind: "validated_runtime_event_prefix",
      events: Object.freeze([]),
    })),
    /nominal validated immutable event prefix/,
  );
  const prefixModule = await import(
    pathToFileURL(join(root, "build/code/src/abg/event_prefix.js")).href
  );
  const pureProjection = eventCalculus.deriveRuntimeEventCalculusProjection(
    prefixModule.selectValidatedRuntimeEventPrefix(Object.freeze([
      fakeEvent("event://pure-input", 1, "run://pure-input"),
    ])),
  );
  assert.equal(Object.isFrozen(pureProjection.effectRows[0].sourceEvent), true);
});

test("retry HoldsAt truth is exact-keyed, interleaving-invariant, and reconstruction-stable", async () => {
  const eventCalculus = await import(
    `${pathToFileURL(join(root, "build/code/src/abg/event_calculus.js")).href}?t287-retry-law=${Date.now()}`
  );
  const prefixModule = await import(
    pathToFileURL(join(root, "build/code/src/abg/event_prefix.js")).href
  );
  const runR = fakeEvent("event://retry/run-r", 1, "run://retry/r");
  const attemptR = retryEvent({
    kind: "retry_attempt_opened",
    eventId: "event://retry/r/attempt-1",
    admissionOrdinal: 2,
    runId: "run://retry/r",
    attemptRef: "retry-attempt://r/1",
    causationEventRefs: [runR.eventId],
  });
  const runS = fakeEvent("event://retry/run-s", 3, "run://retry/s");
  const attemptS = retryEvent({
    kind: "retry_attempt_opened",
    eventId: "event://retry/s/attempt-1",
    admissionOrdinal: 4,
    runId: "run://retry/s",
    attemptRef: "retry-attempt://s/1",
    causationEventRefs: [runS.eventId],
  });
  const progressS = retryEvent({
    kind: "retry_progress_recorded",
    eventId: "event://retry/s/progress-1",
    admissionOrdinal: 5,
    runId: "run://retry/s",
    attemptRef: "retry-attempt://s/1",
    progressRef: "retry-progress://s/1",
    causationEventRefs: [attemptS.eventId],
  });
  const routeS = retryEvent({
    kind: "traversal_route_admitted",
    eventId: "event://retry/s/route-1",
    admissionOrdinal: 6,
    runId: "run://retry/s",
    causationEventRefs: [progressS.eventId],
    consumedAvailabilityRefs: ["retry-progress://s/1"],
  });
  const events = Object.freeze([runR, attemptR, runS, attemptS, progressS, routeS]);
  const project = (rows) => eventCalculus.deriveRuntimeEventCalculusProjection(
    prefixModule.selectValidatedRuntimeEventPrefix(rows, {
      runId: "run://retry/r",
    }),
  ).holds.map((fluent) => fluent.fluentRef);
  const expected = [
    "retry_attempt_active(retry-attempt://r/1)",
    "run_active(run://retry/r)",
  ];

  assert.deepEqual(project(events), expected);
  assert.deepEqual(
    project(Object.freeze([runR, attemptR])),
    expected,
  );
  const reconstructed = deeplyFreeze(JSON.parse(JSON.stringify(events)));
  assert.deepEqual(project(reconstructed), expected);

  const global = eventCalculus.deriveRuntimeEventCalculusProjection(
    prefixModule.selectValidatedRuntimeEventPrefix(events),
  ).holds.map((fluent) => fluent.fluentRef);
  assert.equal(global.includes("retry_attempt_active(retry-attempt://r/1)"), true);
  assert.equal(global.includes("retry_attempt_active(retry-attempt://s/1)"), false);
  assert.equal(global.includes("retry_progress_available(retry-progress://s/1)"), false);
});

test("run HoldsAt truth survives durable reopen and a lawful closure", async (context) => {
  const environment = await setupInstalledRootExecutionBasis(context, root);
  const { abg, executionBasis } = environment;
  environment.store.configureDurableLog(join(environment.scratch, "t287-event-calculus.events.jsonl"));
  const first = abg.openCall(
    environment.store,
    executionBasis,
    runtimeBasis("correlation://t287/event-calculus/first/open"),
  );
  assert.equal(first.kind, "open_call_admission", JSON.stringify(first));
  const prefixModule = await installedInternal(environment.installedRoot, "event_prefix");
  const openProjection = runProjection(
    abg,
    prefixModule,
    environment.store,
    first.scope.runId,
  );
  assert.equal(abg.holdsAt(openProjection, abg.constructRunActiveFluent(first.scope.runId)), true);
  assert.equal(abg.holdsAt(openProjection, abg.constructRunClosedFluent(first.scope.runId)), false);
  assert.equal(openProjection.effectRows.some((row) => row.eventKind === "frame_opened"), true);

  const firstAuthority = environment.store.projectReopenAuthorityAndClose();
  const firstReopen = abg.reopenEventStore(firstAuthority);
  assert.equal(firstReopen.kind, "reopened_event_store_context", JSON.stringify(firstReopen));
  assert.deepEqual(
    runProjection(abg, prefixModule, firstReopen.store, first.scope.runId),
    openProjection,
  );

  assert.equal(
    abg.holdsAt(openProjection, abg.constructRunActiveFluent("run://t287/other")),
    false,
  );

  await admitStandardClosure(
    environment,
    firstReopen.store,
    first,
    "correlation://t287/event-calculus/first",
  );
  const closedProjection = runProjection(
    abg,
    prefixModule,
    firstReopen.store,
    first.scope.runId,
  );
  assert.equal(abg.holdsAt(closedProjection, abg.constructRunActiveFluent(first.scope.runId)), false);
  assert.equal(abg.holdsAt(closedProjection, abg.constructRunClosedFluent(first.scope.runId)), true);
  const replayBeforeReopen = abg.replay(firstReopen.store, { runId: first.scope.runId });
  assert.equal(replayBeforeReopen.runtimeStatus, "closed");

  const secondAuthority = firstReopen.store.projectReopenAuthorityAndClose();
  const secondReopen = abg.reopenEventStore(secondAuthority);
  assert.equal(secondReopen.kind, "reopened_event_store_context", JSON.stringify(secondReopen));
  assert.deepEqual(
    runProjection(abg, prefixModule, secondReopen.store, first.scope.runId),
    closedProjection,
  );
  const replayAfterReopen = abg.replay(secondReopen.store, { runId: first.scope.runId });
  assert.equal(replayAfterReopen.runtimeStatus, replayBeforeReopen.runtimeStatus);
  assert.equal(replayAfterReopen.replayDigest, replayBeforeReopen.replayDigest);
  const finalProjection = abg.deriveRuntimeEventCalculusProjection(
    abg.selectValidatedRuntimeEventPrefix(secondReopen.store.readAll()),
  );
  assert.equal(abg.holdsAt(finalProjection, abg.constructRunActiveFluent(first.scope.runId)), false);
  assert.equal(abg.holdsAt(finalProjection, abg.constructRunActiveFluent("run://t287/other")), false);
  secondReopen.store.closeDurableLog();
});

test("runtime_failure_observed terminates the exact active Run", async (context) => {
  const environment = await setupInstalledRootExecutionBasis(context, root);
  const { abg, executionBasis } = environment;
  const opened = abg.openCall(
    environment.store,
    executionBasis,
    runtimeBasis("correlation://t287/event-calculus/runtime-failure/open"),
  );
  assert.equal(opened.kind, "open_call_admission", JSON.stringify(opened));
  const failure = abg.admitRuntimeFailure(
    environment.store,
    executionBasis,
    opened.scope,
    "hog_traversal",
    { kind: "t287_runtime_failure_probe" },
    "diagnostic://t287/runtime-failure",
    runtimeBasis("correlation://t287/event-calculus/runtime-failure/admit"),
  );
  assert.equal(failure.kind, "runtime_failure_admission", JSON.stringify(failure));
  const prefixModule = await installedInternal(environment.installedRoot, "event_prefix");
  const projection = runProjection(
    abg,
    prefixModule,
    environment.store,
    opened.scope.runId,
  );
  assert.equal(
    abg.holdsAt(projection, abg.constructRunActiveFluent(opened.scope.runId)),
    false,
  );
  assert.equal(abg.replay(environment.store, { runId: opened.scope.runId }).runtimeStatus, "failed");
});

test("run_stopped makes runtime failure throw before memory or durable append", async (context) => {
  const environment = await setupInstalledRootExecutionBasis(context, root);
  const { abg, executionBasis } = environment;
  const eventLogPath = join(environment.scratch, "t287-stopped-runtime.events.jsonl");
  environment.store.configureDurableLog(eventLogPath);
  const opened = abg.openCall(
    environment.store,
    executionBasis,
    runtimeBasis("correlation://t287/event-calculus/stopped/open"),
  );
  assert.equal(opened.kind, "open_call_admission", JSON.stringify(opened));
  const eventStore = await installedInternal(
    environment.installedRoot,
    "event_store",
    false,
  );
  const routeRef = "traversal-route://t287/stopped";
  const route = eventStore.admitRuntimeEvent(environment.store, {
    kind: "traversal_route_admitted",
    eventTime: "2026-07-21T00:00:00.000Z",
    aggregateType: "frame",
    aggregateId: opened.scope.frameId,
    parentAggregateId: opened.scope.graphCallId,
    causationEventRefs: [opened.scope.frameOpenEventRef],
    correlationId: "correlation://t287/event-calculus/stopped/route",
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: executionBasis.basisRef,
    runId: opened.scope.runId,
    graphFunctionRef: executionBasis.graphFunctionRef,
    materializationRef: executionBasis.graphRef,
    graphCallId: opened.scope.graphCallId,
    frameId: opened.scope.frameId,
    frameLineageId: opened.scope.frameLineageId,
    payload: {
      routeRef,
      routeDigest: `sha256:${"1".repeat(64)}`,
      routeKind: "blocked",
      declarationRef: "declaration://t287/stopped",
      declarationDigest: `sha256:${"2".repeat(64)}`,
      sourceCursorRef: "cursor://t287/stopped",
      sourceCursorDigest: `sha256:${"3".repeat(64)}`,
    },
  });
  const stopped = eventStore.admitRuntimeEvent(environment.store, {
    kind: "run_stopped",
    eventTime: "2026-07-21T00:00:00.000Z",
    aggregateType: "run",
    aggregateId: opened.scope.runId,
    parentAggregateId: opened.scope.frameId,
    causationEventRefs: [route.eventId],
    correlationId: "correlation://t287/event-calculus/stopped",
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: executionBasis.basisRef,
    runId: opened.scope.runId,
    graphFunctionRef: executionBasis.graphFunctionRef,
    materializationRef: executionBasis.graphRef,
    graphCallId: opened.scope.graphCallId,
    frameId: opened.scope.frameId,
    frameLineageId: opened.scope.frameLineageId,
    payload: {
      disposition: "blocked",
      routeRef,
      reasonRef: "reason://t287/stopped",
    },
  });
  const countBeforeCall = environment.store.readAll().length;
  const bytesBeforeCall = await readFile(eventLogPath);
  assert.throws(
    () => abg.admitRuntimeFailure(
      environment.store,
      executionBasis,
      opened.scope,
      "hog_traversal",
      { kind: "t287_stopped_runtime_probe" },
      "diagnostic://t287/stopped-runtime",
      runtimeBasis("correlation://t287/event-calculus/stopped/failure"),
    ),
    /runtime failure requires one exact active admitted traversal scope/,
  );
  assert.equal(environment.store.readAll().length, countBeforeCall);
  assert.deepEqual(await readFile(eventLogPath), bytesBeforeCall);
  const prefixModule = await installedInternal(environment.installedRoot, "event_prefix");
  const stoppedProjection = runProjection(
    abg,
    prefixModule,
    environment.store,
    opened.scope.runId,
  );
  assert.equal(
    abg.holdsAt(
      stoppedProjection,
      abg.constructRunTerminalFluent(opened.scope.runId),
    ),
    true,
  );
  assert.equal(
    abg.holdsAt(
      stoppedProjection,
      abg.constructRunActiveFluent(opened.scope.runId),
    ),
    false,
  );
  const replayBeforeReopen = abg.replay(environment.store, {
    runId: opened.scope.runId,
  });
  assert.equal(replayBeforeReopen.runtimeStatus, "blocked");
  assert.equal(replayBeforeReopen.runStoppedEventRef, stopped.eventId);
  assert.equal(replayBeforeReopen.runStoppedDisposition, "blocked");

  const reopenAuthority = environment.store.projectReopenAuthorityAndClose();
  const reopened = abg.reopenEventStore(reopenAuthority);
  assert.equal(reopened.kind, "reopened_event_store_context", JSON.stringify(reopened));
  assert.deepEqual(
    runProjection(abg, prefixModule, reopened.store, opened.scope.runId),
    stoppedProjection,
  );
  assert.deepEqual(
    abg.replay(reopened.store, { runId: opened.scope.runId }),
    replayBeforeReopen,
  );

  eventStore.admitRuntimeEvent(reopened.store, {
    kind: "run_stopped",
    eventTime: "2026-07-21T00:00:01.000Z",
    aggregateType: "run",
    aggregateId: opened.scope.runId,
    parentAggregateId: opened.scope.frameId,
    causationEventRefs: [route.eventId],
    correlationId: "correlation://t287/event-calculus/stopped/duplicate",
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: executionBasis.basisRef,
    runId: opened.scope.runId,
    graphFunctionRef: executionBasis.graphFunctionRef,
    materializationRef: executionBasis.graphRef,
    graphCallId: opened.scope.graphCallId,
    frameId: opened.scope.frameId,
    frameLineageId: opened.scope.frameLineageId,
    payload: {
      disposition: "blocked",
      routeRef,
      reasonRef: "reason://t287/stopped/duplicate",
    },
  });
  assert.throws(
    () => abg.replay(reopened.store, { runId: opened.scope.runId }),
    /replay requires zero or one exact run_stopped event/,
  );
  reopened.store.closeDurableLog();
});

test("M5 application preparation refusal is exact across fresh processes until its route consumes it", async () => {
  const store = new AbgEventStore();
  const runId = "run://abiogenesis/m5/preparation-refusal";
  const graphCallId = "graph-call://abiogenesis/m5/preparation-refusal";
  const frameId = "frame://abiogenesis/m5/preparation-refusal";
  const basisId = "basis://abiogenesis/m5/preparation-refusal";
  const graphFunctionRef =
    "graph-function://abiogenesis/m5/preparation-refusal-parent@5";
  const applicationRef =
    "graph-function-application://abiogenesis/m5/preparation-refusal@5";
  const parentCCallRef = "c-call://abiogenesis/m5/preparation-refusal";
  const parentJudgmentRef = "judgment://abiogenesis/m5/preparation-refusal";
  const sourceCursorRef =
    "traversal-cursor://abiogenesis/m5/preparation-refusal";
  const refusalBody = {
    applicationRef,
    parentCCallRef,
    parentJudgmentRef,
    sourceCursorRef,
    childGraphFunctionRef:
      "graph-function://abiogenesis/m5/preparation-refusal-child@5",
    inputRef: "result://abiogenesis/m5/preparation-refusal",
    inputDigest: sha256Canonical({ input: "preparation-refusal" }),
    stage: "membership",
    diagnosticRef:
      "diagnostic://abiogenesis/m5/preparation-refusal-membership@5",
    message: "declared child is absent from the admitted preparation basis",
  };
  const refusalDigest = sha256Canonical(refusalBody);
  const refusalRef =
    `child-preparation-refusal://abiogenesis/${refusalDigest.slice("sha256:".length)}`;
  const refusalEvent = admitRuntimeEvent(store, {
    kind: "child_preparation_refused",
    eventTime: "2026-08-04T00:00:00.000Z",
    aggregateType: "frame",
    aggregateId: frameId,
    parentAggregateId: graphCallId,
    causationEventRefs: [],
    correlationId: "correlation://abiogenesis/m5/preparation-refusal",
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId,
    runId,
    graphFunctionRef,
    materializationRef:
      "materialization://abiogenesis/m5/preparation-refusal",
    graphCallId,
    frameId,
    payload: { refusalRef, refusalDigest, ...refusalBody },
  });
  const refusalPrefix = store.readAll();
  const projected = projectCurrentApplicationChildPreparationRefusal(store, {
    runId,
    refusalRef,
  });
  assert.deepEqual(projected, {
    kind: "application_child_preparation_refusal_admission",
    schemaVersion: "5.0.0",
    disposition: "admitted",
    refusalRef,
    refusalDigest,
    ...refusalBody,
    admissionEventRef: refusalEvent.eventId,
  });

  const routeBody = {
    routeKind: "blocked",
    declarationRef: applicationRef,
    declarationDigest: sha256Canonical({ applicationRef }),
    sourceCursorRef,
    sourceCursorDigest: sha256Canonical({ sourceCursorRef }),
    targetCursorRef: null,
    targetCursorDigest: null,
    cCallRef: parentCCallRef,
    judgmentRef: parentJudgmentRef,
    consumedAvailabilityRefs: [parentJudgmentRef, refusalRef],
    contractRef: "contract://abiogenesis/m5/preparation-refusal@5",
    replayStateDigest: sha256Canonical({ state: "preparation-refused" }),
  };
  const routeDigest = sha256Canonical(routeBody);
  const routeRef =
    `traversal-route://abiogenesis/${routeDigest.slice("sha256:".length)}`;
  admitRuntimeEvent(store, {
    kind: "traversal_route_admitted",
    eventTime: "2026-08-04T00:00:01.000Z",
    aggregateType: "frame",
    aggregateId: frameId,
    parentAggregateId: graphCallId,
    causationEventRefs: [refusalEvent.eventId],
    correlationId:
      "correlation://abiogenesis/m5/preparation-refusal/blocked-route",
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId,
    runId,
    graphFunctionRef,
    materializationRef:
      "materialization://abiogenesis/m5/preparation-refusal",
    graphCallId,
    frameId,
    payload: { routeRef, routeDigest, ...routeBody },
  });
  assert.equal(
    projectCurrentApplicationChildPreparationRefusal(store, {
      runId,
      refusalRef,
    }),
    null,
  );

  const workerInput = {
    installedPackageRoot: root,
    runId,
    refusalRef,
    refusalPrefix,
    consumedPrefix: store.readAll(),
  };
  const [firstProjection, secondProjection] = await Promise.all([
    runPreparationRefusalWorker(workerInput),
    runPreparationRefusalWorker(workerInput),
  ]);
  assert.notEqual(firstProjection.processId, process.pid);
  assert.notEqual(secondProjection.processId, process.pid);
  assert.notEqual(firstProjection.processId, secondProjection.processId);
  const { processId: _firstProcessId, ...firstTruth } = firstProjection;
  const { processId: _secondProcessId, ...secondTruth } = secondProjection;
  assert.deepEqual(secondTruth, firstTruth);
  assert.deepEqual(firstTruth.refusal, projected);
  assert.equal(firstTruth.consumedRefusal, null);
  assert.equal(firstTruth.currentBeforeRoute, true);
  assert.equal(firstTruth.currentAfterRoute, false);
});
