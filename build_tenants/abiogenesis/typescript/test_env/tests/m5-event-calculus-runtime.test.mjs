import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import test from "node:test";

import { setupInstalledRootExecutionBasis } from "../support/root-installed-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

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
  eventStore.admitRuntimeEvent(environment.store, {
    kind: "run_stopped",
    eventTime: "2026-07-21T00:00:00.000Z",
    aggregateType: "run",
    aggregateId: opened.scope.runId,
    parentAggregateId: opened.scope.frameId,
    causationEventRefs: [opened.scope.frameOpenEventRef],
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
      routeRef: "traversal-route://t287/stopped",
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
  environment.store.closeDurableLog();
});
