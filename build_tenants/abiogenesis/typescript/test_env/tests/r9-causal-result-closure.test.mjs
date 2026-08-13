import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import test from "node:test";

import { cloneEventPrefixFixture } from "../support/new-empty-append-sink.mjs";
import { proveFreshProcessRuntimeProjectionEquality } from
  "../support/fresh-process-runtime-proof.mjs";
import { setupInstalledRootExecutionBasis } from "../support/root-installed-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function runtimeBasis(correlationId) {
  return {
    eventTime: "2026-07-21T00:00:00.000Z",
    correlationId,
    causationEventRefs: [],
  };
}

async function cloneEventStore(
  context,
  abg,
  eventStore,
  events,
  label,
) {
  const acquired = await cloneEventPrefixFixture(
    context,
    abg,
    eventStore,
    events,
    label,
  );
  return acquired.store;
}

function admitInitialCursor(environment, opened, traversalStop, correlationId) {
  const admission = environment.abg.admitInitialTraversalCursor(
    environment.store,
    environment.executionBasis,
    opened.scope,
    environment.graph,
    environment.graphValidation,
    traversalStop.cursor,
    runtimeBasis(correlationId),
  );
  assert.equal(admission.kind, "traversal_cursor_admission", JSON.stringify(admission));
  return admission;
}

test("R9 admits the uniform CCall spine, terminal route, and exact closure chain", async (context) => {
  const environment = await setupInstalledRootExecutionBasis(context, root);
  const {
    abg,
    gtl,
    hog,
    store,
    installedRoot,
    verified,
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
    product,
  } = environment;
  const eventStore = await import(
    pathToFileURL(join(
      installedRoot,
      "build/code/src/abg/event_store.js",
    )).href
  );
  const retryOwner = await import(
    pathToFileURL(join(
      installedRoot,
      "build/code/src/abg/retry.js",
    )).href
  );
  const opened = abg.openCall(
    store,
    executionBasis,
    runtimeBasis("correlation://t286/r9/open"),
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
  const cursorAdmission = admitInitialCursor(
    environment,
    opened,
    traversalStop,
    "correlation://t286/r9/cursor",
  );
  assert.equal(abg.hasAdmittedTraversalCursor(store, traversalStop.cursor), true);
  const cursorReplay = abg.replay(store, { runId: opened.scope.runId });
  assert.equal(cursorReplay.traversalCursorRef, traversalStop.cursor.cursorRef);
  assert.equal(cursorReplay.traversalCursorDigest, traversalStop.cursor.cursorDigest);
  assert.equal(cursorReplay.traversalCursorEventRef, cursorAdmission.admissionEventRef);
  const eventCountAtCursor = store.readAll().length;
  const forgedCursor = structuredClone(traversalStop.cursor);
  forgedCursor.termPath = ["node", graph.template.startNodeRef, "c", "terms", "0"];
  assert.equal(abg.hasAdmittedTraversalCursor(store, forgedCursor), false);
  const forgedCursorAdmission = abg.admitInitialTraversalCursor(
    store,
    executionBasis,
    opened.scope,
    graph,
    graphValidation,
    forgedCursor,
    runtimeBasis("correlation://t286/r9/forged-cursor"),
  );
  assert.equal(forgedCursorAdmission.kind, "traversal_cursor_admission_refusal");
  assert.equal(forgedCursorAdmission.code, "cursor_mismatch");
  const duplicateCursorAdmission = abg.admitInitialTraversalCursor(
    store,
    executionBasis,
    opened.scope,
    graph,
    graphValidation,
    structuredClone(traversalStop.cursor),
    runtimeBasis("correlation://t286/r9/duplicate-cursor"),
  );
  assert.equal(duplicateCursorAdmission.kind, "traversal_cursor_admission_refusal");
  assert.equal(duplicateCursorAdmission.code, "cursor_repeated");
  assert.equal(store.readAll().length, eventCountAtCursor);

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
    runtimeBasis("correlation://t286/r9/c-call-open"),
  );
  assert.equal(cCallAdmission.kind, "c_call_admission", JSON.stringify(cCallAdmission));
  const cCall = cCallAdmission.cCall;
  assert.equal(cCall.cCallRef.startsWith("c-call:sha256:"), true);
  assert.equal(cCall.regime, "F_D");
  assert.equal(cCall.programLocusRef, traversalStop.nodeRef);
  assert.deepEqual(cCall.retryPath, []);
  assert.ok(abg.projectCCallCarrierPhaseAtPrefix(
    abg.selectValidatedRuntimeEventPrefix(store.readAll(), { runId: cCall.runId }),
    cCall,
  ));
  assert.equal(
    store.readAll().find((event) => event.kind === "c_call_opened")
      .causationEventRefs[0],
    cursorAdmission.admissionEventRef,
  );

  const implementationModuleUrl = pathToFileURL(
    join(installedRoot, implementationResolution.modulePath),
  ).href;
  const implementationModule = await import(`${implementationModuleUrl}?r9=${Date.now()}`);
  const realize = implementationModule[implementationResolution.namedSymbol];
  assert.equal(typeof realize, "function");
  const leafCandidate = realize(input);
  assert.equal(leafCandidate.kind, "leaf_realization_candidate");
  assert.equal(leafCandidate.disposition, "success");
  assert.equal("event" in leafCandidate, false);
  assert.equal("transition" in leafCandidate, false);
  assert.equal("judgment" in leafCandidate, false);

  const evidence = abg.admitEvidence(
    store,
    graph,
    graphFunction,
    traversalStop.cursor,
    cCall,
    leafCandidate.evidenceCandidates[0],
    closureContract.evidenceContractRef,
    rawInput.subjectDigest,
    runtimeBasis("correlation://t286/r9/evidence"),
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
    runtimeBasis("correlation://t286/r9/result"),
  );
  assert.equal(result.kind, "admitted_c_call_result", JSON.stringify(result));
  assert.deepEqual(result.value, {
    kind: "hello_world_output",
    schemaVersion: "5.0.0",
    message: "Hello World",
  });

  const replayScope = { runId: cCall.runId };
  const resultReplay = abg.replay(store, replayScope);
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
  const forgedOwnerCandidate = {
    ...judgmentCandidate,
    retryAttemptRef: "retry-attempt://abiogenesis/forged-owner-bypass",
  };
  forgedOwnerCandidate.candidateDigest = product.sha256Canonical({
    cCallRef: forgedOwnerCandidate.cCallRef,
    resultRef: forgedOwnerCandidate.resultRef,
    resultDigest: forgedOwnerCandidate.resultDigest,
    judgment: forgedOwnerCandidate.judgment,
    reasonRef: forgedOwnerCandidate.reasonRef,
    contractRef: forgedOwnerCandidate.contractRef,
    predicateRef: forgedOwnerCandidate.predicateRef,
    replayStateDigest: forgedOwnerCandidate.replayStateDigest,
    retryAttemptRef: forgedOwnerCandidate.retryAttemptRef,
  });
  forgedOwnerCandidate.candidateRef =
    `judgment-candidate://abiogenesis/${forgedOwnerCandidate.candidateDigest.slice("sha256:".length)}`;
  const ownerPrefix = store.readAll();
  const forgedOwnerJudgment = abg.admitJudgment(
    store,
    graph,
    graphFunction,
    traversalStop.cursor,
    cCall,
    result,
    forgedOwnerCandidate,
    resultReplay,
    runtimeBasis("correlation://t286/r9/forged-retry-owner"),
  );
  assert.equal(forgedOwnerJudgment.kind, "c_call_admission_rejection");
  assert.deepEqual(store.readAll(), ownerPrefix);
  const judgment = abg.admitJudgment(
    store,
    graph,
    graphFunction,
    traversalStop.cursor,
    cCall,
    result,
    judgmentCandidate,
    resultReplay,
    runtimeBasis("correlation://t286/r9/judgment"),
  );
  assert.equal(judgment.kind, "admitted_c_call_judgment", JSON.stringify(judgment));
  assert.equal(judgment.judgment, "advance");
  const postJudgmentPrefix = store.readAll();
  const duplicateOwnerJudgment = abg.admitJudgment(
    store,
    graph,
    graphFunction,
    traversalStop.cursor,
    cCall,
    result,
    judgmentCandidate,
    resultReplay,
    runtimeBasis("correlation://t286/r9/post-judgment-owner-refusal"),
  );
  assert.equal(duplicateOwnerJudgment.kind, "c_call_admission_rejection");
  assert.deepEqual(store.readAll(), postJudgmentPrefix);
  const admittedJudgmentEvent = store.readAll().at(-1);
  assert.equal(admittedJudgmentEvent.kind, "c_call_judged");
  const judgmentPrefix = store.readAll().slice(0, -1);
  for (const [label, mutate] of [
    ["missing", (payload) => delete payload.retryAttemptRef],
    ["numeric", (payload) => { payload.retryAttemptRef = 1; }],
  ]) {
    const refusalStore = await cloneEventStore(
      context,
      abg,
      eventStore,
      judgmentPrefix,
      `abi5-r9-judgment-${label}-`,
    );
    const candidate = structuredClone(admittedJudgmentEvent);
    delete candidate.eventId;
    delete candidate.admissionOrdinal;
    delete candidate.payloadDigest;
    mutate(candidate.payload);
    const before = refusalStore.readAll();
    assert.throws(
      () => eventStore.admitRuntimeEvent(refusalStore, candidate),
      /retry attempt|event-contract variant|invalid required identity/u,
      label,
    );
    assert.deepEqual(refusalStore.readAll(), before, label);
  }

  const judgedReplay = abg.replay(store, replayScope);
  const routeCandidate = hog.proposeTerminalRoute(
    graph,
    traversalStop,
    cCall,
    judgment,
    judgedReplay,
    closureContract.transitionContractRef,
  );
  assert.equal(routeCandidate.kind, "traversal_route_candidate", JSON.stringify(routeCandidate));
  const preRouteEventCount = store.readAll().length;
  const forgedRoute = abg.admitRoute(
    store,
    executionBasis,
    graph,
    traversalStop.cursor,
    null,
    judgedReplay,
    {
      ...routeCandidate,
      sourceCursorDigest: `sha256:${"0".repeat(64)}`,
    },
    runtimeBasis("correlation://t286/r9/forged-route"),
    { cCall, graphFunction, result, judgment },
  );
  assert.equal(forgedRoute.kind, "traversal_route_admission_refusal");
  assert.equal(forgedRoute.code, "cursor_mismatch");
  assert.equal(store.readAll().length, preRouteEventCount);
  const route = abg.admitRoute(
    store,
    executionBasis,
    graph,
    traversalStop.cursor,
    null,
    judgedReplay,
    routeCandidate,
    runtimeBasis("correlation://t286/r9/route"),
    { cCall, graphFunction, result, judgment },
  );
  assert.equal(route.kind, "admitted_traversal_route", JSON.stringify(route));

  const routeReplay = abg.replay(store, replayScope);
  assert.equal(routeReplay.routes.length, 1);
  assert.deepEqual(routeReplay.routes[0], {
    routeRef: route.routeRef,
    routeDigest: route.routeDigest,
    routeKind: "terminal",
    declarationRef: graph.materializationRef,
    declarationDigest: graph.materializationDigest,
    sourceCursorRef: traversalStop.cursor.cursorRef,
    sourceCursorDigest: traversalStop.cursor.cursorDigest,
    targetCursorRef: null,
    targetCursorDigest: null,
    cCallRef: cCall.cCallRef,
    judgmentRef: judgment.judgmentRef,
    consumedAvailabilityRefs: route.consumedAvailabilityRefs,
    contractRef: route.contractRef,
    replayStateDigest: route.replayStateDigest,
    admissionEventRef: route.admissionEventRef,
  });
  const controlStore = await cloneEventStore(
    context,
    abg,
    eventStore,
    store.readAll(),
    "abi5-r9-control-",
  );
  const freshProcessStore = await cloneEventStore(
    context,
    abg,
    eventStore,
    store.readAll(),
    "abi5-r9-fresh-process-closure-",
  );
  const freshProcessClosureProof =
    await proveFreshProcessRuntimeProjectionEquality({
      abg,
      product,
      installedPackageRoot: installedRoot,
      requests: [{
        rowId: "root_closure_quiescence",
        exportName: "projectRunQuiescence",
        input: "validated_run_prefix",
        prefixScope: { runId: cCall.runId },
      }],
      store: freshProcessStore,
    });
  assert.equal(freshProcessClosureProof.freshProcessIds.length, 2);
  assert.equal(
    freshProcessClosureProof.retainedRows[0].projection.disposition,
    "quiescent_for_close",
  );
  assert.equal(
    freshProcessClosureProof.retainedRows[0].projection.terminalRouteRef,
    route.routeRef,
  );
  const unrelatedRouteStore = await cloneEventStore(
    context,
    abg,
    eventStore,
    store.readAll(),
    "abi5-r9-unrelated-route-",
  );
  const blockingStore = await cloneEventStore(
    context,
    abg,
    eventStore,
    store.readAll(),
    "abi5-r9-blocking-",
  );
  const staleStore = await cloneEventStore(
    context,
    abg,
    eventStore,
    store.readAll(),
    "abi5-r9-stale-prefix-",
  );
  const blockingRetryBoundaryRef =
    "retry-boundary://abiogenesis/r9/live-closure-blocker";
  const blockingAttemptBody = {
    attemptManifestRef: retryOwner.deriveRetryAttemptManifestRef({
      retryBoundaryRef: blockingRetryBoundaryRef,
      executionBasisRef: cCall.basisId,
      inputContractRef: cCall.inputContractRef,
      inputRef: traversalStop.cursor.inputRef,
      inputDigest: traversalStop.cursor.inputDigest,
      attempt: cCall.attempt,
      retryPath: cCall.retryPath,
    }),
    retryBoundaryRef: blockingRetryBoundaryRef,
    attempt: cCall.attempt,
    retryPath: cCall.retryPath,
  };
  const blockingAttemptDigest = product.sha256Canonical(blockingAttemptBody);
  const blockingAttemptRef =
    `retry-attempt://abiogenesis/${blockingAttemptDigest.slice("sha256:".length)}`;
  const blockingAttemptEvent = eventStore.admitRuntimeEvent(blockingStore, {
    kind: "retry_attempt_opened",
    eventTime: "2026-07-21T00:00:00.000Z",
    aggregateType: "frame",
    aggregateId: cCall.frameId,
    parentAggregateId: cCall.graphCallId,
    causationEventRefs: [route.admissionEventRef],
    correlationId: "correlation://t286/r9/live-closure-blocker",
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: cCall.basisId,
    runId: cCall.runId,
    graphFunctionRef: cCall.graphFunctionRef,
    graphCallId: cCall.graphCallId,
    frameId: cCall.frameId,
    payload: {
      attemptRef: blockingAttemptRef,
      attemptDigest: blockingAttemptDigest,
      ...blockingAttemptBody,
    },
  });
  assert.equal(
    retryOwner.projectRetryAttempt(
      abg.selectValidatedRuntimeEventPrefix(blockingStore.readAll(), {
        runId: cCall.runId,
      }),
      graph,
      blockingAttemptEvent.eventId,
    ),
    null,
    "terminal-route-caused synthetic retry attempt must not rehydrate as an owner attempt",
  );
  const unrelatedRouteBody = {
    routeKind: "advance",
    declarationRef: graph.materializationRef,
    declarationDigest: graph.materializationDigest,
    sourceCursorRef: "cursor://abiogenesis/r9/unrelated-r2-source",
    sourceCursorDigest: product.sha256Canonical({ cursor: "r2-source" }),
    targetCursorRef: "cursor://abiogenesis/r9/unrelated-r2-target",
    targetCursorDigest: product.sha256Canonical({ cursor: "r2-target" }),
    cCallRef: "c-call:sha256:unrelated-r2",
    judgmentRef: "judgment://abiogenesis/r9/unrelated-r2",
    consumedAvailabilityRefs: [],
    contractRef: route.contractRef,
    replayStateDigest: routeReplay.replayDigest,
  };
  const unrelatedRouteDigest = product.sha256Canonical(unrelatedRouteBody);
  const unrelatedRouteRef =
    `traversal-route://abiogenesis/${unrelatedRouteDigest.slice("sha256:".length)}`;
  const unrelatedRouteCandidate = {
    kind: "traversal_route_admitted",
    eventTime: "2026-07-21T00:00:00.000Z",
    aggregateType: "frame",
    aggregateId: cCall.frameId,
    parentAggregateId: cCall.graphCallId,
    causationEventRefs: [route.admissionEventRef],
    correlationId: "correlation://t286/r9/unrelated-r2",
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: cCall.basisId,
    runId: cCall.runId,
    graphFunctionRef: cCall.graphFunctionRef,
    graphCallId: cCall.graphCallId,
    frameId: cCall.frameId,
    payload: {
      routeRef: unrelatedRouteRef,
      routeDigest: unrelatedRouteDigest,
      ...unrelatedRouteBody,
    },
  };
  eventStore.admitRuntimeEvent(unrelatedRouteStore, unrelatedRouteCandidate);
  const staleCoordinate = eventStore.selectHeldEventStoreDurablePrefix(staleStore);
  eventStore.admitRuntimeEvent(staleStore, unrelatedRouteCandidate);
  const stalePostInterleave = {
    coordinate: eventStore.selectHeldEventStoreDurablePrefix(staleStore),
    digest: staleStore.digest(),
    eventCount: staleStore.readAll().length,
  };
  const staleClosure = abg.admitClosure(
    staleStore,
    staleCoordinate,
    cCall,
    result,
    judgment,
    route,
    closureContract,
    runtimeBasis("correlation://t286/r9/stale-prefix"),
  );
  assert.equal(staleClosure.kind, "closure_admission_refusal");
  assert.equal(staleClosure.code, "stale_prefix");
  assert.equal(staleClosure.failureEventRef, null);
  assert.deepEqual({
    coordinate: eventStore.selectHeldEventStoreDurablePrefix(staleStore),
    digest: staleStore.digest(),
    eventCount: staleStore.readAll().length,
  }, stalePostInterleave);
  const controlClosure = abg.admitClosure(
    controlStore,
    eventStore.selectHeldEventStoreDurablePrefix(controlStore),
    cCall,
    result,
    judgment,
    route,
    closureContract,
    runtimeBasis("correlation://t286/r9/route-selection-control"),
  );
  const unrelatedRoutePrefix = unrelatedRouteStore.readAll();
  const unrelatedRouteClosure = abg.admitClosure(
    unrelatedRouteStore,
    eventStore.selectHeldEventStoreDurablePrefix(unrelatedRouteStore),
    cCall,
    result,
    judgment,
    route,
    closureContract,
    runtimeBasis("correlation://t286/r9/route-selection-counterexample"),
  );
  const blockingPrefix = blockingStore.readAll();
  const blockingClosure = abg.admitClosure(
    blockingStore,
    eventStore.selectHeldEventStoreDurablePrefix(blockingStore),
    cCall,
    result,
    judgment,
    route,
    closureContract,
    runtimeBasis("correlation://t286/r9/live-closure-blocker"),
  );
  assert.equal(controlClosure.kind, "closure_admission", JSON.stringify(controlClosure));
  assert.equal(unrelatedRouteClosure.kind, "closure_admission_refusal");
  assert.equal(unrelatedRouteClosure.failureEventRef, null);
  assert.deepEqual(unrelatedRouteStore.readAll(), unrelatedRoutePrefix);
  assert.equal(blockingClosure.kind, "closure_admission_refusal");
  assert.equal(blockingClosure.failureEventRef, null);
  const blockingRetryIdentityDigest = product.sha256Canonical({
    kind: "retry_fluent_identity",
    schemaVersion: "5.0.0",
    name: "retry_attempt_active",
    runId: cCall.runId,
    graphCallId: cCall.graphCallId,
    frameId: cCall.frameId,
    retryBoundaryRef: blockingRetryBoundaryRef,
    authorityRef: blockingAttemptRef,
  });
  const blockingRetryIdentity =
    `retry-fluent://abiogenesis/${blockingRetryIdentityDigest.slice("sha256:".length)}`;
  assert.equal(
    blockingClosure.message.includes(
      `retry_attempt_active(${blockingRetryIdentity})`,
    ),
    true,
  );
  assert.deepEqual(blockingStore.readAll(), blockingPrefix);
  assert.equal(
    blockingStore.readAll().some((event) =>
      ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"]
        .includes(event.kind)
    ),
    false,
  );
  assert.equal(controlClosure.routeRef, route.routeRef);
  const closure = abg.admitClosure(
    store,
    eventStore.selectHeldEventStoreDurablePrefix(store),
    cCall,
    result,
    judgment,
    route,
    closureContract,
    runtimeBasis("correlation://t286/r9/closure"),
  );
  assert.equal(closure.kind, "closure_admission", JSON.stringify(closure));
  const finalReplay = abg.replay(store, replayScope);
  assert.equal(finalReplay.runtimeStatus, "closed");
  assert.equal(finalReplay.runId, opened.run.runId);
  assert.equal(finalReplay.cCalls.length, 1);
  assert.equal(finalReplay.cCalls[0].status, "judged");
  assert.equal(finalReplay.cCalls[0].resultRef, result.resultRef);
  assert.equal(finalReplay.cCalls[0].judgment, "advance");

  const closedEventCount = store.readAll().length;
  const duplicateClosure = abg.admitClosure(
    store,
    eventStore.selectHeldEventStoreDurablePrefix(store),
    cCall,
    result,
    judgment,
    route,
    closureContract,
    runtimeBasis("correlation://t286/r9/duplicate-closure"),
  );
  assert.equal(duplicateClosure.kind, "closure_admission_refusal");
  assert.equal(duplicateClosure.failureEventRef, null);
  assert.equal(store.readAll().length, closedEventCount);
  assert.equal(abg.replay(store, replayScope).runtimeStatus, "closed");

  const events = store.readAll();
  const cCallEvents = events.filter((event) => event.aggregateId === cCall.cCallRef);
  assert.deepEqual(cCallEvents.map((event) => event.kind), [
    "c_call_opened",
    "c_call_fibre_selected",
    "c_call_evidenced",
    "c_call_result_admitted",
    "c_call_judged",
  ]);
  assert.equal("regime" in cCallEvents[0].payload, false);
  assert.equal("implementationRef" in cCallEvents[0].payload, false);
  assert.equal(cCallEvents[1].payload.regime, "F_D");
  assert.equal(events.some((event) => event.kind === "fd_advance_ready"), false);
  assert.deepEqual(events.slice(-5).map((event) => event.kind), [
    "traversal_route_admitted",
    "terminal_reached",
    "frame_closed",
    "graph_call_closed",
    "run_closed",
  ]);
  assert.equal(events.at(-4).causationEventRefs[0], events.at(-5).eventId);
  assert.equal(events.at(-3).causationEventRefs[0], events.at(-4).eventId);
  assert.equal(events.at(-2).causationEventRefs[0], events.at(-3).eventId);
  assert.equal(events.at(-1).causationEventRefs[0], events.at(-2).eventId);
  assert.equal(finalReplay.terminalReachedEventRef, closure.terminalReachedEventRef);
  assert.equal(finalReplay.frameClosedEventRef, closure.frameClosedEventRef);
  assert.equal(finalReplay.graphCallClosedEventRef, closure.graphCallClosedEventRef);
  assert.equal(finalReplay.runClosedEventRef, closure.runClosedEventRef);
  assert.deepEqual(
    Object.keys(abg.ROOT_EVENT_CALCULUS).sort(),
    [...abg.ROOT_EVENT_KIND_VALUES].sort(),
  );

  const evidenceDirectory = join(root, "test_env/evidence");
  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(
    join(evidenceDirectory, "abi5-root-r9.json"),
    `${JSON.stringify({
      kind: "abi5_root_obligation_evidence",
      schemaVersion: "5.0.0",
      bindingId: "ABI5-ROOT-001",
      obligation: "R9_abg_admitted_causal_result_and_closure_events",
      result: "satisfied",
      sourceImportUsed: false,
      artifactDigest: verified.artifactDigest,
      runId: opened.run.runId,
      graphCallId: opened.graphCall.graphCallId,
      frameId: opened.frame.frameId,
      cCallRef: cCall.cCallRef,
      evidenceRef: evidence.evidenceRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      routeRef: route.routeRef,
      closureRef: closure.closureRef,
      replayDigest: finalReplay.replayDigest,
      replayStatus: finalReplay.runtimeStatus,
      eventStoreDigest: store.digest(),
      eventKinds: events.map((event) => event.kind),
      cCallEventKinds: cCallEvents.map((event) => event.kind),
      closureEventKinds: events.slice(-4).map((event) => event.kind),
      authorityBoundary: {
        implementationWroteEvents: false,
        hogWroteEvents: false,
        fixtureWroteEvents: false,
        abgOnlyEventAdmission: true,
        compiledRepresentationUsed: false,
        controllerUsed: false,
        replayDerivedState: true,
      },
    }, null, 2)}\n`,
    "utf8",
  );
});

test("R9 totalizes a real result-admission rejection on the same CCall spine", async (context) => {
  const environment = await setupInstalledRootExecutionBasis(context, root);
  const {
    abg,
    hog,
    store,
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
  const opened = abg.openCall(
    store,
    executionBasis,
    runtimeBasis("correlation://t286/r9-rejection/open"),
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
  admitInitialCursor(
    environment,
    opened,
    traversalStop,
    "correlation://t286/r9-rejection/cursor",
  );
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
    runtimeBasis("correlation://t286/r9-rejection/c-call-open"),
  );
  assert.equal(cCallAdmission.kind, "c_call_admission", JSON.stringify(cCallAdmission));
  const cCall = cCallAdmission.cCall;

  const implementationModule = await import(
    `${pathToFileURL(join(installedRoot, implementationResolution.modulePath)).href}?r9-rejection=${Date.now()}`
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
    runtimeBasis("correlation://t286/r9-rejection/evidence"),
  );
  assert.equal(evidence.kind, "admitted_c_call_evidence", JSON.stringify(evidence));
  const alteredResult = structuredClone(leafCandidate.resultCandidate);
  alteredResult.message = "Wrong result";
  const resultRejection = abg.admitResult(
    store,
    graph,
    graphFunction,
    traversalStop.cursor,
    cCall,
    alteredResult,
    "success",
    closureContract.resultContractRef,
    "hello_world_output",
    (value) => value?.kind === "hello_world_output" && value?.schemaVersion === "5.0.0",
    [evidence],
    runtimeBasis("correlation://t286/r9-rejection/result"),
  );
  assert.equal(resultRejection.kind, "c_call_admission_rejection");
  assert.equal(resultRejection.stage, "result");
  const completion = abg.completeRejectedCCall(
    store,
    graph,
    graphFunction,
    traversalStop.cursor,
    cCall,
    structuredClone(resultRejection),
    runtimeBasis("correlation://t286/r9-rejection/completion"),
  );
  assert.equal(completion.kind, "rejected_c_call_completion");
  assert.equal(completion.disposition, "blocked");
  const eventCountAfterCompletion = store.readAll().length;
  assert.throws(
    () => abg.completeRejectedCCall(
      store,
      graph,
      graphFunction,
      traversalStop.cursor,
      cCall,
      resultRejection,
      runtimeBasis("correlation://t286/r9-rejection/stale-duplicate"),
    ),
    /authentic open-call admission rejection/,
  );
  assert.equal(store.readAll().length, eventCountAfterCompletion);

  const rows = store.readAll().filter((event) => event.aggregateId === cCall.cCallRef);
  assert.deepEqual(rows.map((event) => event.kind), [
    "c_call_opened",
    "c_call_fibre_selected",
    "c_call_evidenced",
    "c_call_evidenced",
    "c_call_result_admitted",
    "c_call_judged",
  ]);
  assert.equal(rows[3].payload.evidenceClass, "admission_rejection");
  assert.equal(rows[3].payload.rejectedStage, "result");
  assert.equal(rows[4].payload.resultClass, "refusal");
  assert.equal(rows[4].payload.value.kind, "hello_world_refusal");
  assert.equal(rows[5].payload.judgment, "blocked");
  assert.equal(store.readAll().some((event) => event.kind === "terminal_reached"), false);
  assert.equal(store.readAll().some((event) => event.kind === "run_closed"), false);
  const rejectedReplay = abg.replay(store);
  assert.equal(rejectedReplay.cCalls[0].status, "judged");
  assert.equal(rejectedReplay.cCalls[0].judgment, "blocked");

  const evidenceDirectory = join(root, "test_env/evidence");
  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(
    join(evidenceDirectory, "abi5-root-r9-rejection.json"),
    `${JSON.stringify({
      kind: "abi5_root_mutation_evidence",
      schemaVersion: "5.0.0",
      bindingId: "ABI5-ROOT-001",
      mutation: "result_candidate_digest_mismatch",
      result: "refused_on_uniform_spine",
      cCallRef: cCall.cCallRef,
      rejectionStage: resultRejection.stage,
      rejectionDiagnosticRef: resultRejection.diagnosticRef,
      rejectionEvidenceRef: completion.rejectionEvidenceRef,
      refusalResultRef: completion.refusalResultRef,
      rejectionJudgmentRef: completion.rejectionJudgmentRef,
      cCallEventKinds: rows.map((event) => event.kind),
      closureAbsent: true,
      forgedRejectionCarrierRefused: true,
    }, null, 2)}\n`,
    "utf8",
  );
});

test("R9 admits and durably appends a post-open CCall refusal", async (context) => {
  const environment = await setupInstalledRootExecutionBasis(context, root);
  const {
    abg,
    hog,
    hogExecute,
    store,
    program,
    graph,
    graphValidation,
    input,
    rawInput,
    implementationSet,
    implementationRow,
    leafPort,
    executionBasis,
    closureContract,
    durablePrefix,
  } = environment;
  const durablePath = fileURLToPath(durablePrefix.eventLogRef);
  const opened = abg.openCall(
    store,
    executionBasis,
    runtimeBasis("correlation://t286/r9-post-open/open"),
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
  const cursorAdmission = admitInitialCursor(
    environment,
    opened,
    traversalStop,
    "correlation://t286/r9-post-open/cursor",
  );
  const alteredStop = structuredClone(traversalStop);
  alteredStop.frameId = "frame://mutation/wrong-lineage";
  const completion = await hogExecute.completeExecutableTraversal({
    store,
    executionBasis,
    openedTraversalScope: opened.scope,
    program,
    graph,
    traversalStop: alteredStop,
    implementationSet,
    implementationResolution: implementationRow,
    leafPort,
    input,
    inputDigest: rawInput.subjectDigest,
    closureContract,
    clock: {
      eventTime: "2026-07-21T00:00:00.000Z",
      correlationId: "correlation://t286/r9-post-open/hog",
    },
  });
  assert.equal(completion.disposition, "failed");
  assert.match(completion.diagnosticRef, /locus_mismatch/u);
  const replay = abg.replay(store, { runId: opened.scope.runId });
  assert.equal(replay.runtimeStatus, "failed");
  assert.equal(replay.cCalls.length, 0);
  const events = store.readAll();
  const failure = events.at(-1);
  assert.equal(failure.kind, "runtime_failure_observed");
  assert.equal(failure.payload.stage, "c_call_open");
  assert.equal(failure.causationEventRefs[0], cursorAdmission.admissionEventRef);
  const durableEvents = (await readFile(durablePath, "utf8"))
    .trim().split(/\r?\n/u).map((line) => JSON.parse(line));
  assert.equal(durableEvents.length, events.length);
  assert.equal(durableEvents.at(-1).eventId, failure.eventId);
  assert.equal(durableEvents.at(-1).kind, "runtime_failure_observed");
});

test("R9 refuses a leaf input that differs from the admitted input digest", async (context) => {
  const environment = await setupInstalledRootExecutionBasis(context, root);
  const {
    abg,
    hog,
    hogExecute,
    store,
    program,
    graph,
    graphValidation,
    input,
    rawInput,
    implementationSet,
    implementationRow,
    leafPort,
    executionBasis,
    closureContract,
  } = environment;
  const opened = abg.openCall(
    store,
    executionBasis,
    runtimeBasis("correlation://t286/r9-input-basis/open"),
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
  const cursorAdmission = admitInitialCursor(
    environment,
    opened,
    traversalStop,
    "correlation://t286/r9-input-basis/cursor",
  );
  const alteredInput = { ...input, subject: "Not the admitted subject" };
  const completion = await hogExecute.completeExecutableTraversal({
    store,
    executionBasis,
    openedTraversalScope: opened.scope,
    program,
    graph,
    traversalStop,
    implementationSet,
    implementationResolution: implementationRow,
    leafPort,
    input: alteredInput,
    inputDigest: rawInput.subjectDigest,
    closureContract,
    clock: {
      eventTime: "2026-07-21T00:00:00.000Z",
      correlationId: "correlation://t286/r9-input-basis/hog",
    },
  });
  assert.equal(completion.disposition, "failed");
  assert.equal(
    completion.diagnosticRef,
    "diagnostic://abiogenesis/hog/input-basis-mismatch@5",
  );
  const events = store.readAll();
  assert.equal(events.some((event) => event.kind === "c_call_opened"), false);
  assert.equal(events.at(-1).kind, "runtime_failure_observed");
  assert.equal(events.at(-1).payload.stage, "c_call_open");
  assert.equal(events.at(-1).causationEventRefs[0], cursorAdmission.admissionEventRef);
});
