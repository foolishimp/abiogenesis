import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import test from "node:test";

import {
  admitRuntimeEvent,
  createNewEmptyAppendSink,
} from "../../build/code/src/abg/event_store.js";
import {
  projectCurrentApplicationChildFoldback,
  projectCurrentApplicationChildPreparationRefusal,
} from "../../build/code/src/abg/graph_application.js";
import { sha256Canonical } from "../../build/code/src/shared/digests.js";

import { acquireNewEmptyAppendSinkFixture } from "../support/new-empty-append-sink.mjs";
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
  graphCallId = `graph-call://${runId}`,
  frameId = `frame://${runId}`,
  retryBoundaryRef = `retry-boundary://${runId}`,
  attemptRef,
  progressRef,
  causationEventRefs = [],
  consumedAvailabilityRefs = [],
}) {
  return deeplyFreeze({
    ...fakeEvent(eventId, admissionOrdinal, runId, causationEventRefs),
    kind,
    aggregateType: "frame",
    aggregateId: frameId,
    graphCallId,
    frameId,
    payload: kind === "retry_attempt_opened"
      ? { attemptRef, retryBoundaryRef }
      : kind === "retry_progress_recorded"
        ? { attemptRef, progressRef, retryBoundaryRef }
        : {
            routeKind: "retry",
            consumedAvailabilityRefs,
          },
  });
}

function scopedRetryFluent(eventCalculus, name, event, authorityRef) {
  return eventCalculus.constructScopedRetryFluent(name, {
    runId: event.runId,
    graphCallId: event.graphCallId,
    frameId: event.frameId,
    retryBoundaryRef: event.payload.retryBoundaryRef,
    authorityRef,
  });
}

function cursorEvent({
  eventId,
  admissionOrdinal,
  runId,
  cursorRef,
  causationEventRefs = [],
}) {
  return deeplyFreeze({
    ...fakeEvent(eventId, admissionOrdinal, runId, causationEventRefs),
    kind: "traversal_cursor_entered",
    aggregateType: "frame",
    aggregateId: `frame://${runId}`,
    graphCallId: `graph-call://${runId}`,
    frameId: `frame://${runId}`,
    payload: { cursorRef },
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
    graphFunction,
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
    graphFunction,
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
    graph,
    graphFunction,
    traversalStop.cursor,
    cCall,
    leafCandidate.evidenceCandidates[0],
    closureContract.evidenceContractRef,
    rawInput.subjectDigest,
    runtimeBasis(`${correlationRoot}/evidence`),
  );
  assert.equal(evidence.kind, "admitted_c_call_evidence", JSON.stringify(evidence));
  const result = abg.admitResult(
    store,
    graph,
    graphFunction,
    traversalStop.cursor,
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
    graph,
    graphFunction,
    traversalStop.cursor,
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
    { cCall, graphFunction, result, judgment },
  );
  assert.equal(route.kind, "admitted_traversal_route", JSON.stringify(route));
  const closure = abg.admitClosure(
    store,
    abg.selectHeldEventStoreDurablePrefix(store),
    cCall,
    result,
    judgment,
    route,
    closureContract,
    runtimeBasis(`${correlationRoot}/closure`),
  );
  assert.equal(closure.kind, "closure_admission", JSON.stringify(closure));
  return closure;
}

test("A5-F10 exact CCall opening accepts rehydrated carriers and refuses repeat or stale prefixes with zero append", async (context) => {
  const environment = await setupInstalledRootExecutionBasis(context, root);
  const {
    abg,
    store,
    executionBasis,
    program,
    graphFunction,
    graph,
    graphValidation,
    implementationSet,
    implementationRow,
    hog,
  } = environment;
  const opened = abg.openCall(
    store,
    structuredClone(executionBasis),
    runtimeBasis("correlation://t287/a5-f10/root-open"),
  );
  assert.equal(opened.kind, "open_call_admission", JSON.stringify(opened));
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
    runtimeBasis("correlation://t287/a5-f10/cursor"),
  );
  assert.equal(cursor.kind, "traversal_cursor_admission", JSON.stringify(cursor));

  const beforeOpen = store.readAll().length;
  const first = abg.openCCall(
    store,
    structuredClone(executionBasis),
    structuredClone(opened.scope),
    program,
    graphFunction,
    graph,
    structuredClone(traversalStop),
    structuredClone(implementationSet),
    structuredClone(implementationRow),
    runtimeBasis("correlation://t287/a5-f10/c-call"),
  );
  assert.equal(first.kind, "c_call_admission", JSON.stringify(first));
  assert.equal(store.readAll().length, beforeOpen + 2);
  const beforeRepeat = store.readAll().length;
  const repeated = abg.openCCall(
    store,
    executionBasis,
    opened.scope,
    program,
    graphFunction,
    graph,
    traversalStop,
    implementationSet,
    implementationRow,
    runtimeBasis("correlation://t287/a5-f10/c-call-repeat"),
  );
  assert.equal(repeated.kind, "c_call_open_refusal", JSON.stringify(repeated));
  assert.equal(store.readAll().length, beforeRepeat);

  const staleEnvironment = await setupInstalledRootExecutionBasis(context, root);
  const staleOpened = staleEnvironment.abg.openCall(
    staleEnvironment.store,
    staleEnvironment.executionBasis,
    runtimeBasis("correlation://t287/a5-f10/stale/root-open"),
  );
  assert.equal(staleOpened.kind, "open_call_admission", JSON.stringify(staleOpened));
  const staleStop = staleEnvironment.hog.traverse({
    program: staleEnvironment.program,
    graph: staleEnvironment.graph,
    graphValidation: staleEnvironment.graphValidation,
    executionBasis: staleEnvironment.executionBasis,
    openedTraversalScope: staleOpened.scope,
  });
  assert.equal(staleStop.kind, "traversal_stop_ref", JSON.stringify(staleStop));
  const staleCursor = staleEnvironment.abg.admitInitialTraversalCursor(
    staleEnvironment.store,
    staleEnvironment.executionBasis,
    staleOpened.scope,
    staleEnvironment.graph,
    staleEnvironment.graphValidation,
    staleStop.cursor,
    runtimeBasis("correlation://t287/a5-f10/stale/cursor"),
  );
  assert.equal(staleCursor.kind, "traversal_cursor_admission", JSON.stringify(staleCursor));
  const stopped = staleEnvironment.abg.admitRuntimeFailure(
    staleEnvironment.store,
    staleEnvironment.executionBasis,
    staleOpened.scope,
    "hog_traversal",
    { kind: "a5_f10_stale_open_probe" },
    "diagnostic://t287/a5-f10/stale-open",
    runtimeBasis("correlation://t287/a5-f10/stale/stop"),
  );
  assert.equal(stopped.kind, "runtime_failure_admission", JSON.stringify(stopped));
  const beforeStale = staleEnvironment.store.readAll().length;
  const stale = staleEnvironment.abg.openCCall(
    staleEnvironment.store,
    staleEnvironment.executionBasis,
    staleOpened.scope,
    staleEnvironment.program,
    staleEnvironment.graphFunction,
    staleEnvironment.graph,
    staleStop,
    staleEnvironment.implementationSet,
    staleEnvironment.implementationRow,
    runtimeBasis("correlation://t287/a5-f10/stale/c-call"),
  );
  assert.equal(stale.kind, "c_call_open_refusal", JSON.stringify(stale));
  assert.equal(staleEnvironment.store.readAll().length, beforeStale);
});

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

test("historical traversal-route projection ignores later construction enrichment and still refuses a forged admission body", async () => {
  const routeApi = await import(
    `${pathToFileURL(join(root, "build/code/src/abg/traversal_route.js")).href}?historical-route=${Date.now()}`
  );
  const prefixApi = await import(
    pathToFileURL(join(root, "build/code/src/abg/event_prefix.js")).href
  );
  const replayApi = await import(
    `${pathToFileURL(join(root, "build/code/src/abg/replay.js")).href}?historical-route=${Date.now()}`
  );
  const routeBody = {
    routeKind: "advance",
    declarationRef: "graph-materialization://historical-route",
    declarationDigest: sha256Canonical({ declaration: "historical-route" }),
    sourceCursorRef: "traversal-cursor://historical-route/source",
    sourceCursorDigest: sha256Canonical({ cursor: "source" }),
    targetCursorRef: "traversal-cursor://historical-route/target",
    targetCursorDigest: sha256Canonical({ cursor: "target" }),
    cCallRef: null,
    judgmentRef: null,
    consumedAvailabilityRefs: [],
    contractRef: null,
    replayStateDigest: sha256Canonical({ replay: "route-admission" }),
  };
  const routeDigest = sha256Canonical(routeBody);
  const routeRef =
    `traversal-route://abiogenesis/${routeDigest.slice("sha256:".length)}`;
  const routeEvent = deeplyFreeze({
    kind: "traversal_route_admitted",
    eventTime: "2026-08-09T00:00:00.000Z",
    aggregateType: "frame",
    aggregateId: "frame://historical-route",
    parentAggregateId: "graph-call://historical-route",
    causationEventRefs: [],
    correlationId: "correlation://historical-route/admit",
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: "execution-basis://historical-route",
    runId: "run://historical-route",
    graphFunctionRef: "graph-function://historical-route@5",
    materializationRef: routeBody.declarationRef,
    graphCallId: "graph-call://historical-route",
    frameId: "frame://historical-route",
    payload: { routeRef, routeDigest, ...routeBody },
    eventId: "event://historical-route/admitted",
    admissionOrdinal: 1,
    payloadDigest: sha256Canonical({ routeRef, routeDigest, ...routeBody }),
  });
  const nextActionProjection = {
    kind: "next_action_projection",
    schemaVersion: "5.0.0",
    disposition: "selected",
  };
  const constructionIntent = {
    kind: "construction_intent",
    schemaVersion: "5.0.0",
    actionKind: "invoke_graph_function",
  };
  const enrichmentEvent = deeplyFreeze({
    ...routeEvent,
    kind: "construction_intent_selected",
    causationEventRefs: [routeEvent.eventId],
    correlationId: "correlation://historical-route/enrich",
    payload: {
      routeRef,
      nextActionProjectionRef: "next-action-projection://historical-route",
      nextActionProjectionDigest: sha256Canonical(nextActionProjection),
      nextActionProjection,
      constructionIntentRef: "construction-intent://historical-route",
      constructionIntentDigest: sha256Canonical(constructionIntent),
      constructionIntent,
    },
    eventId: "event://historical-route/enriched",
    admissionOrdinal: 2,
    payloadDigest: sha256Canonical({ routeRef, constructionIntent }),
  });
  const fullPrefix = prefixApi.selectValidatedRuntimeEventPrefix(
    deeplyFreeze([routeEvent, enrichmentEvent]),
  );
  const enrichedReplayRoute = replayApi
    .replayValidatedRuntimeEventPrefix(fullPrefix).routes[0];
  assert.equal(
    enrichedReplayRoute.nextActionProjectionRef,
    enrichmentEvent.payload.nextActionProjectionRef,
  );
  const projected = routeApi.projectHistoricalTraversalRouteAtPrefix(
    fullPrefix,
    routeEvent.eventId,
  );
  assert.ok(projected);
  assert.equal(projected.routeRef, routeRef);
  assert.equal(projected.routeDigest, routeDigest);
  assert.equal(projected.sourceCursorRef, routeBody.sourceCursorRef);
  assert.equal(projected.targetCursorRef, routeBody.targetCursorRef);

  const forgedRouteEvent = deeplyFreeze({
    ...routeEvent,
    payload: {
      ...routeEvent.payload,
      sourceCursorRef: "traversal-cursor://historical-route/forged",
    },
  });
  const forgedPrefix = prefixApi.selectValidatedRuntimeEventPrefix(
    deeplyFreeze([forgedRouteEvent, enrichmentEvent]),
  );
  assert.equal(
    routeApi.projectHistoricalTraversalRouteAtPrefix(
      forgedPrefix,
      forgedRouteEvent.eventId,
    ),
    null,
  );
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
  const attemptRFluent = scopedRetryFluent(
    eventCalculus,
    "retry_attempt_active",
    attemptR,
    attemptR.payload.attemptRef,
  );
  const attemptSFluent = scopedRetryFluent(
    eventCalculus,
    "retry_attempt_active",
    attemptS,
    attemptS.payload.attemptRef,
  );
  const progressSFluent = scopedRetryFluent(
    eventCalculus,
    "retry_progress_available",
    progressS,
    progressS.payload.progressRef,
  );
  const expected = [
    attemptRFluent.fluentRef,
    "run_active(run://retry/r)",
  ].sort();

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
  assert.equal(global.includes(attemptRFluent.fluentRef), true);
  assert.equal(global.includes(attemptSFluent.fluentRef), false);
  assert.equal(global.includes(progressSFluent.fluentRef), false);
});

test("retry fluent identity is exact across graph-call, frame, and boundary scopes before and after consumption", async () => {
  const eventCalculus = await import(
    `${pathToFileURL(join(root, "build/code/src/abg/event_calculus.js")).href}?t287-retry-composite=${Date.now()}`
  );
  const prefixModule = await import(
    pathToFileURL(join(root, "build/code/src/abg/event_prefix.js")).href
  );
  const runId = "run://retry/composite";
  const attemptRef = "retry-attempt://retry/composite/shared";
  const progressRef = "retry-progress://retry/composite/shared";
  const scopes = [
    ["graph-call://retry/composite/a", "frame://retry/composite/a", "retry-boundary://retry/composite/a"],
    ["graph-call://retry/composite/b", "frame://retry/composite/a", "retry-boundary://retry/composite/a"],
    ["graph-call://retry/composite/a", "frame://retry/composite/b", "retry-boundary://retry/composite/a"],
    ["graph-call://retry/composite/a", "frame://retry/composite/a", "retry-boundary://retry/composite/b"],
  ];
  const run = fakeEvent("event://retry/composite/run", 1, runId);
  const attempts = scopes.map(([graphCallId, frameId, retryBoundaryRef], index) =>
    retryEvent({
      kind: "retry_attempt_opened",
      eventId: `event://retry/composite/attempt/${index}`,
      admissionOrdinal: index + 2,
      runId,
      graphCallId,
      frameId,
      retryBoundaryRef,
      attemptRef,
      causationEventRefs: [run.eventId],
    })
  );
  const progresses = scopes.map(([graphCallId, frameId, retryBoundaryRef], index) =>
    retryEvent({
      kind: "retry_progress_recorded",
      eventId: `event://retry/composite/progress/${index}`,
      admissionOrdinal: attempts.length + index + 2,
      runId,
      graphCallId,
      frameId,
      retryBoundaryRef,
      attemptRef,
      progressRef,
      causationEventRefs: [attempts[index].eventId],
    })
  );
  const before = eventCalculus.deriveRuntimeEventCalculusProjection(
    prefixModule.selectValidatedRuntimeEventPrefix(
      deeplyFreeze([run, ...attempts, ...progresses]),
    ),
  );
  const progressFluents = progresses.map((event) => scopedRetryFluent(
    eventCalculus,
    "retry_progress_available",
    event,
    progressRef,
  ));
  assert.equal(new Set(progressFluents.map((fluent) => fluent.fluentRef)).size, 4);
  assert.equal(progressFluents.every((fluent) =>
    eventCalculus.holdsAt(before, fluent)
  ), true, "all differently scoped shared refs hold before consumption");
  assert.equal(
    scopedRetryFluent(
      eventCalculus,
      "retry_progress_available",
      progresses[0],
      progressRef,
    ).fluentRef,
    progressFluents[0].fluentRef,
    "the exact same scope and authority ref reconstruct one identical fluent",
  );
  const route = retryEvent({
    kind: "traversal_route_admitted",
    eventId: "event://retry/composite/route/a",
    admissionOrdinal: attempts.length + progresses.length + 2,
    runId,
    graphCallId: scopes[0][0],
    frameId: scopes[0][1],
    retryBoundaryRef: scopes[0][2],
    causationEventRefs: [progresses[0].eventId],
    consumedAvailabilityRefs: [progressRef],
  });
  const after = eventCalculus.deriveRuntimeEventCalculusProjection(
    prefixModule.selectValidatedRuntimeEventPrefix(
      deeplyFreeze([run, ...attempts, ...progresses, route]),
    ),
  );
  assert.equal(eventCalculus.holdsAt(after, progressFluents[0]), false);
  assert.equal(progressFluents.slice(1).every((fluent) =>
    eventCalculus.holdsAt(after, fluent)
  ), true, "one exact consumed scope does not consume equal refs in other scopes");
});

test("retry handoff route matrix keeps retry, blocked, advance, and terminal effects decision-exact", async () => {
  const eventCalculus = await import(
    `${pathToFileURL(join(root, "build/code/src/abg/event_calculus.js")).href}?t287-retry-route-matrix=${Date.now()}`
  );
  const runId = "run://retry/route-matrix";
  const frameId = "frame://retry/route-matrix";
  const sourceCursorRef = "cursor://retry/route-matrix/source";
  const targetCursorRef = "cursor://retry/route-matrix/target";
  const routeRef = "route://retry/route-matrix";
  const judgmentRef = "judgment://retry/route-matrix";
  const routeEvent = (routeKind, admissionOrdinal) => deeplyFreeze({
    ...fakeEvent(
      `event://retry/route-matrix/${routeKind}`,
      admissionOrdinal,
      runId,
    ),
    kind: "traversal_route_admitted",
    aggregateType: "frame",
    aggregateId: frameId,
    graphCallId: "graph-call://retry/route-matrix",
    frameId,
    payload: {
      routeKind,
      sourceCursorRef,
      targetCursorRef:
        routeKind === "terminal" || routeKind === "blocked"
          ? null
          : targetCursorRef,
      routeRef,
      judgmentRef,
      consumedAvailabilityRefs: [],
    },
  });
  const rows = ["retry", "blocked", "advance", "terminal"].map(
    (routeKind, index) => {
      const effect = eventCalculus.eventCalculusEffect(
        routeEvent(routeKind, index + 1),
      );
      return {
        routeKind,
        initiates: effect.initiates.map((fluent) => fluent.fluentRef).sort(),
        terminates: effect.terminates.map((fluent) => fluent.fluentRef).sort(),
      };
    },
  );
  assert.deepEqual(rows, [
    {
      routeKind: "retry",
      initiates: [`locus_active(${targetCursorRef})`],
      terminates: [`locus_active(${sourceCursorRef})`],
    },
    {
      routeKind: "blocked",
      initiates: [`frame_blocked(${frameId})`],
      terminates: [
        `frame_active(${frameId})`,
        `locus_active(${sourceCursorRef})`,
      ].sort(),
    },
    {
      routeKind: "advance",
      initiates: [`locus_active(${targetCursorRef})`],
      terminates: [`locus_active(${sourceCursorRef})`],
    },
    {
      routeKind: "terminal",
      initiates: [`terminal_route_available(${routeRef})`],
      terminates: [
        `c_call_judgment_available(${judgmentRef})`,
        `locus_active(${sourceCursorRef})`,
      ].sort(),
    },
  ]);
});

test("retry judgment preserves attempt activity until exact progress consumption", async () => {
  const eventCalculus = await import(
    `${pathToFileURL(join(root, "build/code/src/abg/event_calculus.js")).href}?t287-retry-consumption=${Date.now()}`
  );
  const prefixModule = await import(
    pathToFileURL(join(root, "build/code/src/abg/event_prefix.js")).href
  );
  const runId = "run://retry/consumption";
  const attemptRef = "retry-attempt://retry/consumption/1";
  const run = fakeEvent("event://retry/consumption/run", 1, runId);
  const opened = retryEvent({
    kind: "retry_attempt_opened",
    eventId: "event://retry/consumption/opened",
    admissionOrdinal: 2,
    runId,
    attemptRef,
    causationEventRefs: [run.eventId],
  });
  const attemptFluent = scopedRetryFluent(
    eventCalculus,
    "retry_attempt_active",
    opened,
    attemptRef,
  );
  const judgmentEvent = (judgment, eventId, admissionOrdinal, cause) => deeplyFreeze({
    ...fakeEvent(eventId, admissionOrdinal, runId, [cause]),
    kind: "c_call_judged",
    aggregateType: "c_call",
    aggregateId: "c-call:sha256:retry-consumption",
    parentAggregateId: `frame://${runId}`,
    graphCallId: `graph-call://${runId}`,
    frameId: `frame://${runId}`,
    payload: {
      judgment,
      judgmentRef: `judgment://retry/consumption/${judgment}`,
      resultRef: "result://retry/consumption",
      retryAttemptRef: attemptRef,
    },
  });
  const advance = judgmentEvent(
    "advance",
    "event://retry/consumption/advance",
    3,
    opened.eventId,
  );
  const advanceProjection = eventCalculus.deriveRuntimeEventCalculusProjection(
    prefixModule.selectValidatedRuntimeEventPrefix(Object.freeze([run, opened, advance])),
  );
  assert.equal(eventCalculus.holdsAt(advanceProjection, attemptFluent), true);
  assert.deepEqual(
    [...new Set(advanceProjection.effectRows.at(-1).terminates.map((row) => row.name))]
      .sort(),
    [...eventCalculus.declaredRuntimeEventCalculusTerminationNames(advance)].sort(),
  );

  const retry = judgmentEvent(
    "retry",
    "event://retry/consumption/retry",
    3,
    opened.eventId,
  );
  const retryProjection = eventCalculus.deriveRuntimeEventCalculusProjection(
    prefixModule.selectValidatedRuntimeEventPrefix(Object.freeze([run, opened, retry])),
  );
  assert.equal(eventCalculus.holdsAt(retryProjection, attemptFluent), true);
  assert.deepEqual(
    [...new Set(retryProjection.effectRows.at(-1).terminates.map((row) => row.name))]
      .sort(),
    [...eventCalculus.declaredRuntimeEventCalculusTerminationNames(retry)].sort(),
  );
  const progress = retryEvent({
    kind: "retry_progress_recorded",
    eventId: "event://retry/consumption/progress",
    admissionOrdinal: 4,
    runId,
    attemptRef,
    progressRef: "retry-progress://retry/consumption/1",
    causationEventRefs: [retry.eventId],
  });
  const progressedProjection = eventCalculus.deriveRuntimeEventCalculusProjection(
    prefixModule.selectValidatedRuntimeEventPrefix(Object.freeze([
      run,
      opened,
      retry,
      progress,
    ])),
  );
  assert.equal(eventCalculus.holdsAt(progressedProjection, attemptFluent), false);
  assert.deepEqual(
    [...new Set(progressedProjection.effectRows.at(-1).terminates.map((row) => row.name))]
      .sort(),
    [...eventCalculus.ROOT_EVENT_CALCULUS.retry_progress_recorded.terminates]
      .sort(),
  );

  const staleTerminal = judgmentEvent(
    "advance",
    "event://retry/consumption/stale-terminal",
    5,
    progress.eventId,
  );
  const staleProjection = eventCalculus.deriveRuntimeEventCalculusProjection(
    prefixModule.selectValidatedRuntimeEventPrefix(Object.freeze([
      run,
      opened,
      retry,
      progress,
      staleTerminal,
    ])),
  );
  assert.equal(
    eventCalculus.holdsAt(staleProjection, attemptFluent),
    false,
    "a consumed attempt cannot be rebound by a later judgment",
  );
});

test("run_stopped terminates every exact active retry attempt and available retry progress", async () => {
  const eventCalculus = await import(
    `${pathToFileURL(join(root, "build/code/src/abg/event_calculus.js")).href}?t287-retry-stop=${Date.now()}`
  );
  const prefixModule = await import(
    pathToFileURL(join(root, "build/code/src/abg/event_prefix.js")).href
  );
  const runId = "run://retry/stopped";
  const otherRunId = "run://retry/still-active";
  const otherRun = fakeEvent("event://retry/still-active/run", 1, otherRunId);
  const otherAttempt = retryEvent({
    kind: "retry_attempt_opened",
    eventId: "event://retry/still-active/attempt-1",
    admissionOrdinal: 2,
    runId: otherRunId,
    attemptRef: "retry-attempt://still-active/1",
    causationEventRefs: [otherRun.eventId],
  });
  const run = fakeEvent("event://retry/stopped/run", 3, runId);
  const firstAttempt = retryEvent({
    kind: "retry_attempt_opened",
    eventId: "event://retry/stopped/attempt-1",
    admissionOrdinal: 4,
    runId,
    attemptRef: "retry-attempt://stopped/1",
    causationEventRefs: [run.eventId],
  });
  const progress = retryEvent({
    kind: "retry_progress_recorded",
    eventId: "event://retry/stopped/progress-1",
    admissionOrdinal: 5,
    runId,
    attemptRef: "retry-attempt://stopped/1",
    progressRef: "retry-progress://stopped/1",
    causationEventRefs: [firstAttempt.eventId],
  });
  const secondAttempt = retryEvent({
    kind: "retry_attempt_opened",
    eventId: "event://retry/stopped/attempt-2",
    admissionOrdinal: 6,
    runId,
    attemptRef: "retry-attempt://stopped/2",
    causationEventRefs: [progress.eventId],
  });
  const stopped = deeplyFreeze({
    ...fakeEvent(
      "event://retry/stopped/terminal",
      7,
      runId,
      [progress.eventId, secondAttempt.eventId],
    ),
    kind: "run_stopped",
    aggregateType: "run",
    aggregateId: runId,
    graphCallId: `graph-call://${runId}`,
    frameId: `frame://${runId}`,
    payload: {
      routeRef: "traversal-route://retry/stopped",
      reasonRef: "reason://retry/stopped",
      disposition: "blocked",
    },
  });
  const before = eventCalculus.deriveRuntimeEventCalculusProjection(
    prefixModule.selectValidatedRuntimeEventPrefix(
      Object.freeze([otherRun, otherAttempt, run, firstAttempt, progress, secondAttempt]),
      { runId },
    ),
  );
  const beforeRefs = before.holds.map((fluent) => fluent.fluentRef);
  const secondAttemptFluent = scopedRetryFluent(
    eventCalculus,
    "retry_attempt_active",
    secondAttempt,
    secondAttempt.payload.attemptRef,
  );
  const progressFluent = scopedRetryFluent(
    eventCalculus,
    "retry_progress_available",
    progress,
    progress.payload.progressRef,
  );
  const otherAttemptFluent = scopedRetryFluent(
    eventCalculus,
    "retry_attempt_active",
    otherAttempt,
    otherAttempt.payload.attemptRef,
  );
  assert.equal(beforeRefs.includes(secondAttemptFluent.fluentRef), true);
  assert.equal(beforeRefs.includes(progressFluent.fluentRef), true);

  const after = eventCalculus.deriveRuntimeEventCalculusProjection(
    prefixModule.selectValidatedRuntimeEventPrefix(
      Object.freeze([otherRun, otherAttempt, run, firstAttempt, progress, secondAttempt, stopped]),
      { runId },
    ),
  );
  assert.deepEqual(
    after.holds.filter((fluent) =>
      fluent.name === "retry_attempt_active" ||
      fluent.name === "retry_progress_available"
    ),
    [],
  );
  const globalAfter = eventCalculus.deriveRuntimeEventCalculusProjection(
    prefixModule.selectValidatedRuntimeEventPrefix(
      Object.freeze([otherRun, otherAttempt, run, firstAttempt, progress, secondAttempt, stopped]),
    ),
  );
  assert.equal(
    globalAfter.holds.some((fluent) =>
      fluent.fluentRef === otherAttemptFluent.fluentRef
    ),
    true,
  );
  const terminalEffect = after.effectRows.at(-1);
  assert.equal(terminalEffect.eventKind, "run_stopped");
  assert.deepEqual(
    terminalEffect.terminates
      .filter((fluent) =>
        fluent.name === "retry_attempt_active" ||
        fluent.name === "retry_progress_available"
      )
      .map((fluent) => fluent.fluentRef)
      .sort(),
    [
      secondAttemptFluent.fluentRef,
      progressFluent.fluentRef,
    ],
  );
});

test("terminal projection rows realize static locus law for the exact Run and preserve unrelated loci", async () => {
  const eventCalculus = await import(
    `${pathToFileURL(join(root, "build/code/src/abg/event_calculus.js")).href}?t287-terminal-locus=${Date.now()}`
  );
  const prefixModule = await import(
    pathToFileURL(join(root, "build/code/src/abg/event_prefix.js")).href
  );
  for (const terminalKind of [
    "runtime_failure_observed",
    "run_stopped",
    "run_closed",
  ]) {
    const targetRunId = `run://terminal-locus/${terminalKind}/target`;
    const unrelatedRunId = `run://terminal-locus/${terminalKind}/unrelated`;
    const unrelatedRun = fakeEvent(
      `event://terminal-locus/${terminalKind}/unrelated-run`,
      1,
      unrelatedRunId,
    );
    const unrelatedCursor = cursorEvent({
      eventId: `event://terminal-locus/${terminalKind}/unrelated-cursor`,
      admissionOrdinal: 2,
      runId: unrelatedRunId,
      cursorRef: `cursor://terminal-locus/${terminalKind}/unrelated`,
      causationEventRefs: [unrelatedRun.eventId],
    });
    const targetRun = fakeEvent(
      `event://terminal-locus/${terminalKind}/target-run`,
      3,
      targetRunId,
    );
    const targetCursorA = cursorEvent({
      eventId: `event://terminal-locus/${terminalKind}/target-cursor-a`,
      admissionOrdinal: 4,
      runId: targetRunId,
      cursorRef: `cursor://terminal-locus/${terminalKind}/target-a`,
      causationEventRefs: [targetRun.eventId],
    });
    const targetCursorB = cursorEvent({
      eventId: `event://terminal-locus/${terminalKind}/target-cursor-b`,
      admissionOrdinal: 5,
      runId: targetRunId,
      cursorRef: `cursor://terminal-locus/${terminalKind}/target-b`,
      causationEventRefs: [targetCursorA.eventId],
    });
    const rows = [
      unrelatedRun,
      unrelatedCursor,
      targetRun,
      targetCursorA,
      targetCursorB,
    ];
    if (terminalKind === "run_stopped") {
      const attempt = retryEvent({
        kind: "retry_attempt_opened",
        eventId: "event://terminal-locus/run-stopped/attempt-1",
        admissionOrdinal: 6,
        runId: targetRunId,
        attemptRef: "retry-attempt://terminal-locus/run-stopped/1",
        causationEventRefs: [targetCursorB.eventId],
      });
      const progress = retryEvent({
        kind: "retry_progress_recorded",
        eventId: "event://terminal-locus/run-stopped/progress-1",
        admissionOrdinal: 7,
        runId: targetRunId,
        attemptRef: "retry-attempt://terminal-locus/run-stopped/1",
        progressRef: "retry-progress://terminal-locus/run-stopped/1",
        causationEventRefs: [attempt.eventId],
      });
      const nextAttempt = retryEvent({
        kind: "retry_attempt_opened",
        eventId: "event://terminal-locus/run-stopped/attempt-2",
        admissionOrdinal: 8,
        runId: targetRunId,
        attemptRef: "retry-attempt://terminal-locus/run-stopped/2",
        causationEventRefs: [progress.eventId],
      });
      rows.push(attempt, progress, nextAttempt);
    }
    const terminalOrdinal = rows.length + 1;
    const terminal = deeplyFreeze({
      ...fakeEvent(
        `event://terminal-locus/${terminalKind}/terminal`,
        terminalOrdinal,
        targetRunId,
        [rows.at(-1).eventId],
      ),
      kind: terminalKind,
      aggregateType: terminalKind === "runtime_failure_observed"
        ? "frame"
        : "run",
      aggregateId: terminalKind === "runtime_failure_observed"
        ? `frame://${targetRunId}`
        : targetRunId,
      graphCallId: `graph-call://${targetRunId}`,
      frameId: `frame://${targetRunId}`,
      payload: terminalKind === "run_stopped"
        ? {
            disposition: "blocked",
            routeRef: "traversal-route://terminal-locus/run-stopped",
            reasonRef: "reason://terminal-locus/run-stopped",
          }
        : {},
    });
    rows.push(terminal);
    const projection = eventCalculus.deriveRuntimeEventCalculusProjection(
      prefixModule.selectValidatedRuntimeEventPrefix(deeplyFreeze(rows)),
    );
    const heldRefs = projection.holds.map((fluent) => fluent.fluentRef);
    assert.equal(
      heldRefs.includes(
        `locus_active(cursor://terminal-locus/${terminalKind}/target-a)`,
      ) || heldRefs.includes(
        `locus_active(cursor://terminal-locus/${terminalKind}/target-b)`,
      ),
      false,
      terminalKind,
    );
    assert.equal(
      heldRefs.includes(
        `locus_active(cursor://terminal-locus/${terminalKind}/unrelated)`,
      ),
      true,
      terminalKind,
    );
    assert.equal(
      heldRefs.includes(`run_active(${unrelatedRunId})`),
      true,
      terminalKind,
    );
    const terminalEffect = projection.effectRows.at(-1);
    const dynamicTerminationNames = new Set(
      terminalEffect.terminates.map((fluent) => fluent.name),
    );
    for (const staticName of eventCalculus.ROOT_EVENT_CALCULUS[terminalKind]
      .terminates) {
      assert.equal(
        dynamicTerminationNames.has(staticName),
        true,
        `${terminalKind}/${staticName}`,
      );
    }
    if (terminalKind === "run_stopped") {
      assert.equal(
        projection.holds.some((fluent) =>
          fluent.name === "retry_attempt_active" ||
          fluent.name === "retry_progress_available"
        ),
        false,
      );
    }
  }
});

test("run HoldsAt truth survives durable reopen and a lawful closure", async (context) => {
  const environment = await setupInstalledRootExecutionBasis(context, root);
  const { abg, executionBasis } = environment;
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

  const firstHandoff = environment.store.projectReopenAuthorityAndClose();
  const firstReopen = abg.reopenEventStore(firstHandoff.reopenAuthority);
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

  const secondHandoff = firstReopen.store.projectReopenAuthorityAndClose();
  const secondReopen = abg.reopenEventStore(secondHandoff.reopenAuthority);
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
  const beforeClosedReopen = secondReopen.store.readAll().length;
  const closedReopen = abg.openCall(
    secondReopen.store,
    structuredClone(executionBasis),
    runtimeBasis("correlation://t287/event-calculus/closed/reopen"),
  );
  assert.equal(closedReopen.kind, "open_call_refusal", JSON.stringify(closedReopen));
  assert.equal(closedReopen.code, "execution_basis_already_opened");
  assert.equal(secondReopen.store.readAll().length, beforeClosedReopen);
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
  const beforeFailedReopen = environment.store.readAll().length;
  const failedReopen = abg.openCall(
    environment.store,
    structuredClone(executionBasis),
    runtimeBasis("correlation://t287/event-calculus/failed/reopen"),
  );
  assert.equal(failedReopen.kind, "open_call_refusal", JSON.stringify(failedReopen));
  assert.equal(failedReopen.code, "execution_basis_already_opened");
  assert.equal(environment.store.readAll().length, beforeFailedReopen);
});

test("run_stopped makes runtime failure throw before memory or durable append", async (context) => {
  const environment = await setupInstalledRootExecutionBasis(context, root);
  const { abg, executionBasis } = environment;
  const eventLogPath = fileURLToPath(environment.durablePrefix.eventLogRef);
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
  const beforeStoppedReopen = environment.store.readAll().length;
  const stoppedReopen = abg.openCall(
    environment.store,
    structuredClone(executionBasis),
    runtimeBasis("correlation://t287/event-calculus/stopped/reopen"),
  );
  assert.equal(stoppedReopen.kind, "open_call_refusal", JSON.stringify(stoppedReopen));
  assert.equal(stoppedReopen.code, "execution_basis_already_opened");
  assert.equal(environment.store.readAll().length, beforeStoppedReopen);

  const closeHandoff = environment.store.projectReopenAuthorityAndClose();
  const reopened = abg.reopenEventStore(closeHandoff.reopenAuthority);
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

test("M5 application preparation refusal is exact across fresh processes until its route consumes it", async (context) => {
  const { store } = await acquireNewEmptyAppendSinkFixture(
    context,
    createNewEmptyAppendSink,
    "abi5-preparation-refusal-",
  );
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

test("M5 generic CCall child foldback cannot project as application foldback", async (context) => {
  const { store } = await acquireNewEmptyAppendSinkFixture(
    context,
    createNewEmptyAppendSink,
    "abi5-generic-child-foldback-",
  );
  const runId = "run://abiogenesis/m5/generic-child-foldback";
  const body = {
    parentCCallRef: "c-call://abiogenesis/m5/generic-child-foldback",
    childExecutionBasisRef:
      "basis://abiogenesis/m5/generic-child-foldback-child",
    childExecutionBasisDigest: sha256Canonical({ childBasis: true }),
    childGraphCallId:
      "graph-call://abiogenesis/m5/generic-child-foldback-child",
    childFrameId: "frame://abiogenesis/m5/generic-child-foldback-child",
    childDisposition: "closed",
    childResultRef: "result://abiogenesis/m5/generic-child-foldback",
    childResultDigest: sha256Canonical({ result: true }),
    childJudgmentRef: "judgment://abiogenesis/m5/generic-child-foldback",
    childClosureRef: "closure://abiogenesis/m5/generic-child-foldback",
    childReasonRef: null,
    childTerminalEventRef:
      "event://abiogenesis/m5/generic-child-foldback-terminal",
    outputDigest: sha256Canonical({ output: true }),
  };
  const foldbackDigest = sha256Canonical(body);
  const foldbackRef =
    `child-foldback://abiogenesis/${foldbackDigest.slice("sha256:".length)}`;
  admitRuntimeEvent(store, {
    kind: "child_foldback_admitted",
    eventTime: "2026-08-04T00:00:00.000Z",
    aggregateType: "frame",
    aggregateId: "frame://abiogenesis/m5/generic-child-foldback",
    parentAggregateId:
      "graph-call://abiogenesis/m5/generic-child-foldback",
    causationEventRefs: [],
    correlationId: "correlation://abiogenesis/m5/generic-child-foldback",
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: "basis://abiogenesis/m5/generic-child-foldback",
    runId,
    graphFunctionRef:
      "graph-function://abiogenesis/m5/generic-child-foldback@5",
    graphCallId: "graph-call://abiogenesis/m5/generic-child-foldback",
    frameId: "frame://abiogenesis/m5/generic-child-foldback",
    payload: { foldbackRef, foldbackDigest, ...body },
  });
  assert.equal(
    projectCurrentApplicationChildFoldback(store, { runId, foldbackRef }),
    null,
  );
});

test("M5 incomplete application child foldback cannot project through an open payload cast", async (context) => {
  const { store } = await acquireNewEmptyAppendSinkFixture(
    context,
    createNewEmptyAppendSink,
    "abi5-incomplete-application-foldback-",
  );
  const runId = "run://abiogenesis/m5/incomplete-application-foldback";
  const body = {
    applicationRef:
      "graph-function-application://abiogenesis/m5/incomplete-foldback",
    parentCCallRef: "c-call://abiogenesis/m5/incomplete-foldback",
    childExecutionBasisRef:
      "basis://abiogenesis/m5/incomplete-foldback-child",
    childExecutionBasisDigest: sha256Canonical({ childBasis: true }),
    childGraphCallId:
      "graph-call://abiogenesis/m5/incomplete-foldback-child",
    childFrameId: "frame://abiogenesis/m5/incomplete-foldback-child",
    childDisposition: "closed",
    childResultRef: "result://abiogenesis/m5/incomplete-foldback",
    childResultDigest: sha256Canonical({ result: true }),
    childJudgmentRef: "judgment://abiogenesis/m5/incomplete-foldback",
    childClosureRef: "closure://abiogenesis/m5/incomplete-foldback",
    childReasonRef: null,
    childTerminalEventRef:
      "event://abiogenesis/m5/incomplete-foldback-terminal",
    outputDigest: sha256Canonical({ output: true }),
  };
  const foldbackDigest = sha256Canonical(body);
  const foldbackRef =
    `child-foldback://abiogenesis/${foldbackDigest.slice("sha256:".length)}`;
  admitRuntimeEvent(store, {
    kind: "child_foldback_admitted",
    eventTime: "2026-08-04T00:00:00.000Z",
    aggregateType: "frame",
    aggregateId: "frame://abiogenesis/m5/incomplete-foldback",
    parentAggregateId: "graph-call://abiogenesis/m5/incomplete-foldback",
    causationEventRefs: [],
    correlationId: "correlation://abiogenesis/m5/incomplete-foldback",
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: "basis://abiogenesis/m5/incomplete-foldback",
    runId,
    graphFunctionRef:
      "graph-function://abiogenesis/m5/incomplete-foldback@5",
    graphCallId: "graph-call://abiogenesis/m5/incomplete-foldback",
    frameId: "frame://abiogenesis/m5/incomplete-foldback",
    payload: { foldbackRef, foldbackDigest, ...body },
  });
  assert.equal(
    projectCurrentApplicationChildFoldback(store, { runId, foldbackRef }),
    null,
  );
});

test("M5 application foldback projection rejects every empty semantic reference and malformed digest", async (context) => {
  const baseBody = {
    applicationRef: "graph-function-application://abiogenesis/m5/closed-foldback",
    applicationFoldbackRef: "application-foldback://abiogenesis/m5/closed-foldback",
    parentCCallRef: "c-call://abiogenesis/m5/closed-foldback",
    parentJudgmentRef: "judgment://abiogenesis/m5/closed-foldback/parent",
    sourceCursorRef: "cursor://abiogenesis/m5/closed-foldback/source",
    sourceCursorDigest: sha256Canonical({ source: true }),
    childExecutionBasisRef: "basis://abiogenesis/m5/closed-foldback/child",
    childExecutionBasisDigest: sha256Canonical({ basis: true }),
    childGraphCallId: "graph-call://abiogenesis/m5/closed-foldback/child",
    childFrameId: "frame://abiogenesis/m5/closed-foldback/child",
    childDisposition: "closed",
    childResultRef: "result://abiogenesis/m5/closed-foldback/child",
    childResultDigest: sha256Canonical({ result: true }),
    childJudgmentRef: "judgment://abiogenesis/m5/closed-foldback/child",
    childClosureRef: "closure://abiogenesis/m5/closed-foldback/child",
    childReasonRef: "reason://abiogenesis/m5/closed-foldback/child",
    childTerminalEventRef: "event://abiogenesis/m5/closed-foldback/terminal",
    outputDigest: sha256Canonical({ output: true }),
  };
  const projectBody = async (body, suffix) => {
    const { store } = await acquireNewEmptyAppendSinkFixture(
      context,
      createNewEmptyAppendSink,
      `abi5-application-foldback-${suffix}-`,
    );
    const runId = `run://abiogenesis/m5/closed-foldback/${suffix}`;
    const foldbackDigest = sha256Canonical(body);
    const foldbackRef =
      `child-foldback://abiogenesis/${foldbackDigest.slice("sha256:".length)}`;
    try {
      admitRuntimeEvent(store, {
        kind: "child_foldback_admitted",
        eventTime: "2026-08-04T00:00:00.000Z",
        aggregateType: "frame",
        aggregateId: `frame://abiogenesis/m5/closed-foldback/${suffix}`,
        parentAggregateId: `graph-call://abiogenesis/m5/closed-foldback/${suffix}`,
        causationEventRefs: [],
        correlationId: `correlation://abiogenesis/m5/closed-foldback/${suffix}`,
        workflowVersion: "5.0.0",
        scopeClass: "run",
        basisId: "basis://abiogenesis/m5/closed-foldback",
        runId,
        graphFunctionRef: "graph-function://abiogenesis/m5/closed-foldback@5",
        graphCallId: `graph-call://abiogenesis/m5/closed-foldback/${suffix}`,
        frameId: `frame://abiogenesis/m5/closed-foldback/${suffix}`,
        payload: { foldbackRef, foldbackDigest, ...body },
      });
    } catch (error) {
      assert.match(error.message, /invalid required identity|invalid required digest/);
      return null;
    }
    return projectCurrentApplicationChildFoldback(store, { runId, foldbackRef });
  };

  assert.ok(await projectBody(baseBody, "valid"));
  for (const field of [
    "applicationRef",
    "applicationFoldbackRef",
    "parentCCallRef",
    "parentJudgmentRef",
    "sourceCursorRef",
    "childExecutionBasisRef",
    "childGraphCallId",
    "childFrameId",
    "childResultRef",
    "childJudgmentRef",
    "childClosureRef",
    "childReasonRef",
    "childTerminalEventRef",
  ]) {
    assert.equal(
      await projectBody({ ...baseBody, [field]: "" }, `empty-${field}`),
      null,
      field,
    );
  }
  for (const field of [
    "sourceCursorDigest",
    "childExecutionBasisDigest",
    "childResultDigest",
    "outputDigest",
  ]) {
    assert.equal(
      await projectBody(
        { ...baseBody, [field]: "sha256:not-a-digest" },
        `digest-${field}`,
      ),
      null,
      field,
    );
  }
});
