import assert from "node:assert/strict";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import test from "node:test";

import { installOncePerFile, installTenantOnce, setupInstalledRootExecutionBasis } from "../support/root-installed-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
// The installed cases share one packed, verified and installed Product for this
// file; each opens its own store, workspace and scratch root on it.
const sharedInstall = installOncePerFile(() => installTenantOnce(root));

function runtimeBasis(correlationId) {
  return {
    eventTime: "2026-07-21T00:00:00.000Z",
    correlationId,
    causationEventRefs: [],
  };
}

test("R9 admits the uniform CCall spine, terminal route, and exact closure chain", async (context) => {
  const environment = await setupInstalledRootExecutionBasis(context, root, { install: await sharedInstall() });
  const {
    abg,
    hog,
    store,
    durablePrefix,
    executionBasis,
  } = environment;
  const opened = abg.openTraversalScope(
    store,
    durablePrefix,
    { kind: "root", executionBasis },
    runtimeBasis("correlation://t286/r9/open"),
  );
  assert.equal(opened.kind, "traversal_scope_open_admission", JSON.stringify(opened));
  const completion = await hog.executeGraphTraversal({
    store,
    predecessorPrefix: opened.successorPrefix,
    executionBasis,
    openedTraversalScope: opened.scope,
    program: environment.program,
    programPublication: environment.publication,
    graphFunction: environment.graphFunction,
    graph: environment.graph,
    graphValidation: environment.graphValidation,
    programValidation: environment.programValidation,
    implementationSet: environment.implementationSet,
    interactionSet: environment.executionBasisAdmission.interactionSet,
    leafPort: environment.leafPort,
    closureContract: environment.closureContract,
    actorRuntimeBinding: {
      workspaceBinding: environment.workspaceBinding,
      artifactTruth: environment.artifactTruth,
    },
    input: environment.input,
    inputDigest: environment.rawInput.subjectDigest,
    eventTime: "2026-07-21T00:00:00.000Z",
    correlationId: "correlation://t286/r9/traversal",
  });
  assert.equal(completion.disposition, "closed", completion.diagnosticRef ?? completion.disposition);
  assert.deepEqual(completion.resultValue, {
    kind: "hello_world_output",
    schemaVersion: "5.0.0",
    message: "Hello World",
  });
  const finalReplay = abg.replay(store, { runId: opened.scope.runId });
  assert.equal(finalReplay.runtimeStatus, "closed");

  const events = store.readAll();
  const cCallEvents = events.filter((event) => event.aggregateId === completion.cCallRef);
  assert.deepEqual(cCallEvents.map((event) => event.kind), [
    "c_call_opened",
    "c_call_fibre_selected",
    "c_call_evidenced",
    "c_call_result_admitted",
    "c_call_judged",
  ]);
  assert.equal(
    cCallEvents[0].causationEventRefs[0],
    finalReplay.traversalCursorEventRef,
  );
  assert.equal("regime" in cCallEvents[0].payload, false);
  assert.equal("implementationRef" in cCallEvents[0].payload, false);
  assert.equal(cCallEvents[1].payload.regime, "F_D");
  assert.equal(events.some((event) => event.kind === "fd_advance_ready"), false);
  assert.equal(finalReplay.routes.length, 1);
  assert.equal(finalReplay.routes[0].routeKind, "terminal");
  assert.equal(finalReplay.routes[0].cCallRef, completion.cCallRef);
  assert.equal(finalReplay.routes[0].judgmentRef, completion.judgmentRef);
  assert.equal(finalReplay.routes[0].declarationRef, environment.graph.materializationRef);
  // The closure chain: each closing row is caused by the row before it,
  // and the first by the terminal route.
  const byId = new Map(events.map((event) => [event.eventId, event]));
  const chain = [
    finalReplay.routes[0].admissionEventRef,
    finalReplay.terminalReachedEventRef,
    finalReplay.frameClosedEventRef,
    finalReplay.graphCallClosedEventRef,
    finalReplay.runClosedEventRef,
  ].map((eventRef) => byId.get(eventRef));
  assert.deepEqual(chain.map((event) => event?.kind), [
    "traversal_route_admitted",
    "terminal_reached",
    "frame_closed",
    "graph_call_closed",
    "run_closed",
  ]);
  for (let index = 1; index < chain.length; index += 1) {
    assert.equal(chain[index].causationEventRefs[0], chain[index - 1].eventId, chain[index].kind);
  }
  assert.deepEqual(
    Object.keys(abg.ROOT_EVENT_CALCULUS).sort(),
    [...abg.ROOT_EVENT_KIND_VALUES].sort(),
  );
});

// Retired (C-18b, T-290 TD-04/05): the success case's manual ABG protocol --
// proposeJudgment, admitJudgment over a forged retry owner, proposeTerminalRoute,
// admitRoute, the pre-closure quiescence proof, and admitClosure with its stale,
// interleaved, live-retry-blocker and duplicate refusals -- drove writers that
// 415b58dc8 removed (the route and closure now go through HoG's traversal over
// admitTraversalTransition and admitScopeClosure), and its judgment used the
// built-in test program the 2026-10-06 owner correction removed. The design
// keeps that R1-R9 witness, with its abi5-root-r9*.json records, as evidence
// for its original cut (T287_R10_TYPED_TERMINAL_OUTCOME_DESIGN :39). The cases
// above restate the R9 obligation (M03 direct traversal design :1287) to the
// current surface.

test("R9 totalizes a real result-admission rejection on the same CCall spine", async (context) => {
  const environment = await setupInstalledRootExecutionBasis(context, root, { install: await sharedInstall() });
  const {
    abg,
    hog,
    store,
    durablePrefix,
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
  const opened = abg.openTraversalScope(
    store,
    durablePrefix,
    { kind: "root", executionBasis },
    runtimeBasis("correlation://t286/r9-rejection/open"),
  );
  assert.equal(opened.kind, "traversal_scope_open_admission", JSON.stringify(opened));
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
    opened.successorPrefix,
    executionBasis,
    opened.scope,
    graph,
    graphValidation,
    traversalStop.cursor,
    runtimeBasis("correlation://t286/r9-rejection/cursor"),
  );
  assert.equal(cursor.kind, "traversal_cursor_admission", JSON.stringify(cursor));
  const cCallAdmission = abg.openCCall({
    locusClass: "implementation",
    store,
    predecessorPrefix: cursor.successorPrefix,
    executionBasis,
    scope: opened.scope,
    program,
    graphFunction,
    graph,
    stop: traversalStop,
    implementationSet,
    resolution: implementationRow,
    basis: runtimeBasis("correlation://t286/r9-rejection/c-call-open"),
  });
  assert.equal(cCallAdmission.kind, "c_call_admission", JSON.stringify(cCallAdmission));
  const cCall = cCallAdmission.cCall;

  // The leaf lives in the installed Product its resolution names.
  const owningInstall = environment.installCandidates.filter((candidate) =>
    candidate.packageName === implementationResolution.packageName &&
    candidate.packageVersion === implementationResolution.packageVersion);
  assert.equal(owningInstall.length, 1);
  const implementationModule = await import(
    `${pathToFileURL(join(owningInstall[0].installedRoot, implementationResolution.modulePath)).href}?r9-rejection=${Date.now()}`
  );
  const leafCandidate = implementationModule[implementationResolution.namedSymbol](input);
  // The spine writers read the held store's validated prefix.
  const heldPrefix = () => abg.selectValidatedRuntimeEventPrefix(store.readAll());
  const evidence = abg.admitEvidence(
    store,
    heldPrefix(),
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
    heldPrefix(),
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
    heldPrefix(),
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
      heldPrefix(),
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
  // The refusal value is the test-owned language fixture's refusal contract.
  assert.equal(rows[4].payload.value.kind, "language_test_refusal");
  assert.equal(rows[5].payload.judgment, "blocked");
  assert.equal(store.readAll().some((event) => event.kind === "terminal_reached"), false);
  assert.equal(store.readAll().some((event) => event.kind === "run_closed"), false);
  const rejectedReplay = abg.replay(store);
  assert.equal(rejectedReplay.cCalls[0].status, "judged");
  assert.equal(rejectedReplay.cCalls[0].judgment, "blocked");

});
