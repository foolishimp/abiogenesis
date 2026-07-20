import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
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

test("R9 admits the uniform CCall spine, terminal transition, and exact closure chain", async (context) => {
  const environment = await setupInstalledRootExecutionBasis(context, root);
  const {
    abg,
    gtl,
    hog,
    store,
    installedRoot,
    verified,
    program,
    graph,
    graphValidation,
    input,
    rawInput,
    implementationResolution,
    executionBasis,
    closureContract,
  } = environment;
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

  const cCallAdmission = abg.openCCall(
    store,
    executionBasis,
    opened.scope,
    program,
    graph,
    traversalStop,
    implementationResolution,
    runtimeBasis("correlation://t286/r9/c-call-open"),
  );
  assert.equal(cCallAdmission.kind, "c_call_admission", JSON.stringify(cCallAdmission));
  const cCall = cCallAdmission.cCall;
  assert.equal(cCall.cCallRef.startsWith("c-call:sha256:"), true);
  assert.equal(cCall.regime, "F_D");
  assert.equal(cCall.programLocusRef, traversalStop.nodeRef);
  assert.deepEqual(cCall.retryPath, []);
  assert.equal(abg.hasOpenedCCall(store, cCall), true);

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
    cCall,
    leafCandidate.evidenceCandidates[0],
    closureContract.evidenceContractRef,
    rawInput.subjectDigest,
    runtimeBasis("correlation://t286/r9/evidence"),
  );
  assert.equal(evidence.kind, "admitted_c_call_evidence", JSON.stringify(evidence));
  const result = abg.admitResult(
    store,
    cCall,
    leafCandidate.resultCandidate,
    "success",
    closureContract.resultContractRef,
    "hello_world_output",
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
  const judgment = abg.admitJudgment(
    store,
    cCall,
    result,
    judgmentCandidate,
    resultReplay,
    runtimeBasis("correlation://t286/r9/judgment"),
  );
  assert.equal(judgment.kind, "admitted_c_call_judgment", JSON.stringify(judgment));
  assert.equal(judgment.judgment, "advance");

  const judgedReplay = abg.replay(store, replayScope);
  const transitionCandidate = hog.proposeTerminalTransition(
    graph,
    traversalStop,
    cCall,
    judgment,
    judgedReplay,
    closureContract.transitionContractRef,
  );
  assert.equal(transitionCandidate.kind, "transition_proposal", JSON.stringify(transitionCandidate));
  const transition = abg.admitTransition(
    store,
    graph,
    cCall,
    judgment,
    judgedReplay,
    transitionCandidate,
    runtimeBasis("correlation://t286/r9/transition"),
  );
  assert.equal(transition.kind, "admitted_transition", JSON.stringify(transition));

  const transitionReplay = abg.replay(store, replayScope);
  const closure = abg.admitClosure(
    store,
    cCall,
    result,
    judgment,
    transition,
    transitionReplay,
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
    cCall,
    result,
    judgment,
    transition,
    transitionReplay,
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
  assert.deepEqual(events.slice(-5).map((event) => event.kind), [
    "fd_advance_ready",
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
      transitionRef: transition.transitionRef,
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
    graph,
    graphValidation,
    input,
    rawInput,
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
  const cCallAdmission = abg.openCCall(
    store,
    executionBasis,
    opened.scope,
    program,
    graph,
    traversalStop,
    implementationResolution,
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
    cCall,
    alteredResult,
    "success",
    closureContract.resultContractRef,
    "hello_world_output",
    [evidence],
    runtimeBasis("correlation://t286/r9-rejection/result"),
  );
  assert.equal(resultRejection.kind, "c_call_admission_rejection");
  assert.equal(resultRejection.stage, "result");
  const eventCountBeforeForgedCompletion = store.readAll().length;
  assert.throws(
    () => abg.completeRejectedCCall(
      store,
      cCall,
      structuredClone(resultRejection),
      runtimeBasis("correlation://t286/r9-rejection/forged-completion"),
    ),
    /authentic open-call admission rejection/,
  );
  assert.equal(store.readAll().length, eventCountBeforeForgedCompletion);
  const completion = abg.completeRejectedCCall(
    store,
    cCall,
    resultRejection,
    runtimeBasis("correlation://t286/r9-rejection/completion"),
  );
  assert.equal(completion.kind, "rejected_c_call_completion");
  assert.equal(completion.disposition, "blocked");

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
    gtl,
    hog,
    store,
    program,
    graph,
    graphValidation,
    input,
    rawInput,
    implementationResolution,
    executionBasis,
    closureContract,
    publication,
    workspaceBinding,
  } = environment;
  const durablePath = join(
    workspaceBinding.roots.eventLogRoot,
    "r9-post-open-refusal.events.jsonl",
  );
  store.configureDurableLog(durablePath);
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
  const alteredStop = structuredClone(traversalStop);
  alteredStop.frameId = "frame://mutation/wrong-lineage";
  const outputContract = publication.contracts.find((value) => value.contractKind === "output");
  const failureContract = publication.contracts.find((value) => value.contractKind === "failure");
  const completion = hog.completeDeterministicTraversal({
    store,
    executionBasis,
    openedTraversalScope: opened.scope,
    program,
    graph,
    traversalStop: alteredStop,
    implementationResolution,
    input,
    inputDigest: rawInput.subjectDigest,
    failureValueKind: failureContract.valueKind,
    resultValueKind: outputContract.valueKind,
    validateSuccessResult: gtl.isHelloWorldOutput,
    closureContract,
    judgmentRelation: {
      predicateRef: gtl.HELLO_WORLD_IDS.judgmentPredicateRef,
      advanceReasonRef: "reason://abiogenesis/conformance/hello-world-satisfied@5",
      rejectionReasonRef: "reason://abiogenesis/conformance/hello-world-rejected@5",
      evaluate: gtl.evaluateHelloWorldResult,
    },
    realize: () => {
      throw new Error("unreachable leaf");
    },
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
  assert.equal(failure.causationEventRefs[0], opened.scope.frameOpenEventRef);
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
    gtl,
    hog,
    store,
    program,
    graph,
    graphValidation,
    input,
    rawInput,
    implementationResolution,
    executionBasis,
    closureContract,
    publication,
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
  const outputContract = publication.contracts.find((value) => value.contractKind === "output");
  const failureContract = publication.contracts.find((value) => value.contractKind === "failure");
  const alteredInput = { ...input, subject: "Not the admitted subject" };
  const completion = hog.completeDeterministicTraversal({
    store,
    executionBasis,
    openedTraversalScope: opened.scope,
    program,
    graph,
    traversalStop,
    implementationResolution,
    input: alteredInput,
    inputDigest: rawInput.subjectDigest,
    failureValueKind: failureContract.valueKind,
    resultValueKind: outputContract.valueKind,
    validateSuccessResult: gtl.isHelloWorldOutput,
    closureContract,
    judgmentRelation: {
      predicateRef: gtl.HELLO_WORLD_IDS.judgmentPredicateRef,
      advanceReasonRef: "reason://abiogenesis/conformance/hello-world-satisfied@5",
      rejectionReasonRef: "reason://abiogenesis/conformance/hello-world-rejected@5",
      evaluate: gtl.evaluateHelloWorldResult,
    },
    realize: () => {
      throw new Error("input mismatch must stop before leaf realization");
    },
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
});
