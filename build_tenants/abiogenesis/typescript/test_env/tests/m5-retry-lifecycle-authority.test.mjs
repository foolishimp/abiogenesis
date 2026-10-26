import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

import {
  acquireNewEmptyAppendSinkFixture,
} from "../support/new-empty-append-sink.mjs";

const root = resolve(import.meta.dirname, "../..");

function sourceSlice(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(startIndex, -1, `missing source boundary: ${start}`);
  assert.notEqual(endIndex, -1, `missing source boundary: ${end}`);
  return source.slice(startIndex, endIndex);
}

test("retry lifecycle exports only the progress bridges beside the declared retry frontier owners", async () => {
  const lifecycle = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/retry_lifecycle.js",
  )).href);
  const retry = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/retry.js",
  )).href);
  assert.deepEqual(Object.keys(lifecycle).sort(), [
    "hasExactCompletedRetryProgressBridge",
    "hasExactStoppedRetryProgressBridge",
  ]);
  assert.equal("selectExactRetryAttemptEvent" in lifecycle, false);
  assert.equal("hasExactRetryContinuationProgressOwnership" in lifecycle, false);
  assert.equal(typeof retry.projectDeclaredCRetryFrontier, "function");
  assert.equal(typeof retry.projectDeclaredCRetryCCallWriteAtPrefix, "function");
  assert.equal(typeof retry.projectRetryAttempt, "function");
  // Retired: a census of five source strings inside the frontier owner's text
  // (the calculus projection's old name among them). No design sentence names
  // that text; the frontier's behavior is the retry lanes' claim.
});

test("stopped retry foldback bridge requires the exact consumed causal suffix", async () => {
  const { hasExactStoppedRetryProgressBridge } = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/retry_lifecycle.js",
  )).href);
  const scope = {
    eventTime: "2026-08-11T00:00:00.000Z",
    correlationId: "correlation://a5-f03/stopped-retry-bridge",
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: "basis://a5-f03/stopped-retry-bridge",
    runId: "run://a5-f03/stopped-retry-bridge",
    graphFunctionRef: "graph-function://a5-f03/stopped-retry-bridge",
    materializationRef: "materialization://a5-f03/stopped-retry-bridge",
    graphCallId: "graph-call://a5-f03/stopped-retry-bridge",
    frameId: "frame://a5-f03/stopped-retry-bridge",
  };
  const cCallRef = "c-call://a5-f03/stopped-retry-bridge";
  const resultRef = "result://a5-f03/stopped-retry-bridge";
  const judgmentRef = "judgment://a5-f03/stopped-retry-bridge";
  const reasonRef = "failure-signal://a5-f03/stopped-retry-bridge";
  const event = (
    kind,
    eventId,
    admissionOrdinal,
    causationEventRefs,
    payload,
    aggregateType = "frame",
    aggregateId = scope.frameId,
    parentAggregateId = scope.graphCallId,
  ) => ({
    ...scope,
    kind,
    eventId,
    admissionOrdinal,
    payloadDigest: `sha256:${"0".repeat(64)}`,
    aggregateType,
    aggregateId,
    parentAggregateId,
    causationEventRefs,
    payload,
  });
  const outerAttempt = event(
    "retry_attempt_opened",
    "event://a5-f03/stopped-retry-bridge/outer-attempt",
    1,
    [],
    {
      attemptRef: "retry-attempt://a5-f03/stopped-retry-bridge/outer",
      retryBoundaryRef: "retry-boundary://a5-f03/stopped-retry-bridge/outer",
    },
  );
  const innerAttempt = event(
    "retry_attempt_opened",
    "event://a5-f03/stopped-retry-bridge/inner-attempt",
    2,
    [],
    {
      attemptRef: "retry-attempt://a5-f03/stopped-retry-bridge/inner",
      retryBoundaryRef: "retry-boundary://a5-f03/stopped-retry-bridge/inner",
    },
  );
  const judgment = event(
    "c_call_judged",
    "event://a5-f03/stopped-retry-bridge/judgment",
    3,
    ["event://a5-f03/stopped-retry-bridge/result"],
    { cCallRef, resultRef, judgmentRef, judgment: "blocked", reasonRef },
    "c_call",
    cCallRef,
    scope.frameId,
  );
  const innerProgress = event(
    "retry_progress_recorded",
    "event://a5-f03/stopped-retry-bridge/inner-progress",
    4,
    [innerAttempt.eventId, judgment.eventId],
    {
      progressClass: "stopped",
      stopReason: "boundary_terminal",
      predecessorProgressRef: null,
      progressRef: "retry-progress://a5-f03/stopped-retry-bridge/inner",
      retryBoundaryRef: innerAttempt.payload.retryBoundaryRef,
      attemptRef: innerAttempt.payload.attemptRef,
      cCallRef,
      resultRef,
      judgmentRef,
      failureClass: "transport_failure",
      failureSignalRef: reasonRef,
    },
  );
  const outerProgress = event(
    "retry_progress_recorded",
    "event://a5-f03/stopped-retry-bridge/outer-progress",
    5,
    [outerAttempt.eventId, innerProgress.eventId],
    {
      ...innerProgress.payload,
      stopReason: "propagated_inner_stop",
      predecessorProgressRef: innerProgress.payload.progressRef,
      progressRef: "retry-progress://a5-f03/stopped-retry-bridge/outer",
      retryBoundaryRef: outerAttempt.payload.retryBoundaryRef,
      attemptRef: outerAttempt.payload.attemptRef,
    },
  );
  const route = event(
    "traversal_route_admitted",
    "event://a5-f03/stopped-retry-bridge/route",
    6,
    [outerProgress.eventId, innerProgress.eventId],
    {
      routeKind: "blocked",
      cCallRef,
      judgmentRef,
      sourceCursorRef: "cursor://a5-f03/stopped-retry-bridge",
      sourceCursorDigest: `sha256:${"1".repeat(64)}`,
      targetCursorRef: null,
      targetCursorDigest: null,
      consumedAvailabilityRefs: [
        judgmentRef,
        innerProgress.payload.progressRef,
        outerProgress.payload.progressRef,
      ],
    },
  );
  const events = [outerAttempt, innerAttempt, judgment, innerProgress, outerProgress, route];
  const coordinates = {
    runId: scope.runId,
    graphCallId: scope.graphCallId,
    frameId: scope.frameId,
    cCallRef,
    resultRef,
    judgmentRef,
    sourceCursorRef: route.payload.sourceCursorRef,
    sourceCursorDigest: route.payload.sourceCursorDigest,
  };
  assert.equal(
    hasExactStoppedRetryProgressBridge(events, route, judgment, coordinates),
    true,
  );
  assert.equal(
    hasExactStoppedRetryProgressBridge(
      events,
      { ...route, causationEventRefs: [...route.causationEventRefs].reverse() },
      judgment,
      coordinates,
    ),
    false,
  );
  assert.equal(
    hasExactStoppedRetryProgressBridge(
      events.map((row) => row.eventId === outerProgress.eventId
        ? {
            ...row,
            payload: {
              ...row.payload,
              predecessorProgressRef: "retry-progress://substituted",
            },
          }
        : row),
      route,
      judgment,
      coordinates,
    ),
    false,
  );
  assert.equal(
    hasExactStoppedRetryProgressBridge(
      events,
      route,
      { ...judgment, payload: { ...judgment.payload, reasonRef: "failure-signal://substituted" } },
      coordinates,
    ),
    false,
  );
});

// Retired: "CCall retry writes require the exact current declared retry
// frontier" sliced openCCall's and the retry write owner's text between export
// markers (openInteractionCCall no longer exists) and asserted ten strings in
// it; "production judgment writers remain closed behind the CCall owner"
// assigned each `kind: "c_call_judged"` literal to the nearest preceding
// exported function by text. No design sentence names either text. The writer
// closure the second claimed is the exported surface, which the next case
// checks on the built modules.

test("runtime package exports expose no raw or candidate-factory event writer", async () => {
  const abg = await import(pathToFileURL(join(root, "build/code/src/abg/index.js")).href);
  const rootApi = await import(pathToFileURL(join(root, "build/code/src/index.js")).href);
  for (const api of [abg, rootApi]) {
    assert.equal("compareAndAppendExpectedPrefix" in api, false);
    assert.equal("admitRuntimeEvent" in api, false);
    assert.equal("admitRuntimeEventBatch" in api, false);
    assert.equal("AbgEventStore" in api, false);
    assert.equal("admitRuntimeEventTransaction" in api, false);
    assert.equal("createNewEmptyAppendSink" in api, true);
    assert.equal("reopenEventStore" in api, true);
    assert.equal("admitJudgment" in api, true);
  }
  await assert.rejects(
    import("@abiogenesis/typescript-tenant/build/code/src/abg/event_store.js"),
    /not defined by "exports"|Package subpath/u,
  );
});

test("raw executor resume remains closed to every retry cursor", async () => {
  // M05_S06 design :1983-1985: "Its raw `resume.cursor.retryPath` must remain
  // empty; a caller cannot use it to author retry cursor or input truth." The
  // branch lives in the traversal entry owner.
  const entrySource = await readFile(
    join(root, "code/src/hog/entry.ts"),
    "utf8",
  );
  const rawResumeBranch = sourceSlice(
    entrySource,
    "else if (initialInput?.resume !== undefined)",
    "} else {",
  );
  assert.match(
    rawResumeBranch,
    /initialInput\.resume\.cursor\.retryPath\.length !== 0/u,
  );
  assert.doesNotMatch(rawResumeBranch, /projectedRetryResume/u);
});

test("entry frame runtime is an exact common projection and retry composition stays disjoint", async () => {
  const entrySource = await readFile(
    join(root, "code/src/hog/entry.ts"),
    "utf8",
  );
  const traversalContractSource = await readFile(
    join(root, "code/src/hog/traversal_contract.ts"),
    "utf8",
  );
  const graphExecuteSource = await readFile(
    join(root, "code/src/hog/graph_execute.ts"),
    "utf8",
  );
  const commonContract = sourceSlice(
    traversalContractSource,
    "export interface ExecuteGraphTraversalCommonInput {",
    "\n}\n\nexport interface InitialOrNonRetryResumeEntry",
  );
  const declaredCommonFields = [...commonContract.matchAll(
    /^\s*readonly ([A-Za-z][A-Za-z0-9]*)(?:\?)?:/gmu,
  )].map((match) => match[1]);
  const commonProjection = sourceSlice(
    entrySource,
    "const commonRuntime: ExecuteGraphTraversalCommonInput = Object.freeze({",
    "  let activeRuntime = commonRuntime;",
  );
  const projectedCommonFields = [...commonProjection.matchAll(
    /\b([A-Za-z][A-Za-z0-9]*): input\.\1\b/gu,
  )].map((match) => match[1]);
  assert.deepEqual(projectedCommonFields, declaredCommonFields);
  assert.doesNotMatch(commonProjection, /\.\.\.input\b/u);

  const variantFields = [
    "input",
    "inputDigest",
    "resume",
    "projectedRetryResume",
  ];
  const initialEntry = Object.fromEntries([
    ...declaredCommonFields.map((field) => [field, `common:${field}`]),
    ...variantFields.map((field) => [field, `variant:${field}`]),
  ]);
  const frameRuntime = Object.freeze(Object.fromEntries(
    projectedCommonFields.map((field) => [field, initialEntry[field]]),
  ));
  assert.equal(Object.isFrozen(frameRuntime), true);
  for (const field of variantFields) {
    assert.equal(Object.hasOwn(frameRuntime, field), false, field);
  }

  const cursorUpdate = sourceSlice(
    entrySource,
    "activeRuntime = Object.freeze({",
    "  }\n  return {",
  );
  assert.match(cursorUpdate, /\.\.\.commonRuntime,/u);
  assert.doesNotMatch(cursorUpdate, /\.\.\.input\b/u);
  const retryComposition = sourceSlice(
    graphExecuteSource,
    'if (owner.kind === "retry_request") {',
    'if (owner.kind === "workflow_child_request" ||',
  );
  assert.match(retryComposition, /\.\.\.frame\.runtime,/u);
  assert.match(retryComposition, /projectedRetryResume: owner\.resume,/u);
  assert.doesNotMatch(
    retryComposition,
    /^\s*(?:input|inputDigest|resume):/mu,
  );
  const projectedRetryInput = {
    ...frameRuntime,
    predecessorPrefix: "retry-prefix",
    correlationId: "retry-correlation",
    projectedRetryResume: "retry-resume",
  };
  assert.deepEqual(
    variantFields.filter((field) => Object.hasOwn(projectedRetryInput, field)),
    ["projectedRetryResume"],
  );
});

test("projected retry entry consumes only its exact admitted successor prefix without effects", async (context) => {
  const abg = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/index.js",
  )).href);
  const cursorOwner = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/traversal_cursor.js",
  )).href);
  const entry = await import(pathToFileURL(join(
    root,
    "build/code/src/hog/entry.js",
  )).href);
  const product = await import(pathToFileURL(join(
    root,
    "build/code/src/product/index.js",
  )).href);
  const predecessor = await acquireNewEmptyAppendSinkFixture(
    context,
    abg.createNewEmptyAppendSink,
    "abi5-retry-entry-predecessor-",
  );
  const successor = await acquireNewEmptyAppendSinkFixture(
    context,
    abg.createNewEmptyAppendSink,
    "abi5-retry-entry-successor-",
  );
  const inputValue = Object.freeze({ retryEntry: "exact-successor" });
  const inputDigest = product.sha256Canonical(inputValue);
  const nextCursor = cursorOwner.constructTraversalCursorCandidate({
    programRef: "program://m5/retry-entry-currentness@5",
    executionBasisRef: "execution-basis://m5/retry-entry-currentness",
    traversalScopeRef: "traversal-scope://m5/retry-entry-currentness",
    runId: "run://m5/retry-entry-currentness",
    graphCallId: "graph-call://m5/retry-entry-currentness",
    frameId: "frame://m5/retry-entry-currentness",
    graphRef: "graph://m5/retry-entry-currentness@5",
    inputRef: "input://m5/retry-entry-currentness",
    inputDigest,
    currentNodeRef: "node://m5/retry-entry-currentness@5",
    position: "at_term",
    termPath: ["node", "node://m5/retry-entry-currentness@5", "c"],
    taskOrdinal: null,
    attempt: 2,
    retryPath: [1, 2],
  });
  const executableRetryInputDigest = product.sha256Canonical({
    owner: "executable-retry-input",
  });
  const retryFrontierDigest = product.sha256Canonical({
    owner: "retry-frontier",
  });
  const routeDigest = product.sha256Canonical({ owner: "retry-route" });
  const retryAttemptDigest = product.sha256Canonical({
    owner: "retry-attempt",
  });
  const carrier = Object.freeze({
    kind: "projected_retry_resume",
    schemaVersion: "5.0.0",
    disposition: "resumed",
    executableRetryInputRef:
      `executable-retry-input://abiogenesis/${
        executableRetryInputDigest.slice("sha256:".length)
      }`,
    executableRetryInputDigest,
    retryFrontierRef:
      `retry-attempt-frontier://abiogenesis/${
        retryFrontierDigest.slice("sha256:".length)
      }`,
    retryFrontierDigest,
    selectedFrontierRowRef: "retry-frontier-row://m5/currentness",
    progressEventRef: "event://m5/retry-entry/progress",
    routeAdmissionEventRef: "event://m5/retry-entry/route",
    routeRef:
      `traversal-route://abiogenesis/${routeDigest.slice("sha256:".length)}`,
    routeDigest,
    nextCursor,
    retryAttemptAdmissionEventRef: "event://m5/retry-entry/attempt",
    retryAttemptRef:
      `retry-attempt://abiogenesis/${
        retryAttemptDigest.slice("sha256:".length)
      }`,
    retryAttemptDigest,
    nextAttempt: 2,
    inputContractRef: "contract://m5/retry-entry-input@5",
    inputRef: nextCursor.inputRef,
    inputDigest,
    inputValue,
    successorPrefix: successor.prefix,
  });
  const beforeEvents = predecessor.store.readAll();
  const beforeDigest = predecessor.store.digest();
  const beforeBytes = await readFile(new URL(predecessor.prefix.eventLogRef));

  assert.throws(
    () => entry.enterTraversal({
      store: predecessor.store,
      predecessorPrefix: predecessor.prefix,
      projectedRetryResume: carrier,
    }),
    (error) =>
      error instanceof TypeError &&
      error.message ===
        "diagnostic://abiogenesis/hog/projected-retry-prefix-mismatch@5",
  );
  assert.deepEqual(predecessor.store.readAll(), beforeEvents);
  assert.equal(predecessor.store.digest(), beforeDigest);
  assert.deepEqual(
    await readFile(new URL(predecessor.prefix.eventLogRef)),
    beforeBytes,
  );
});

test("F04 payload refusal composes one pure result rejection while authority refusal cannot retry", async (context) => {
  // Retired: slices of c_call_outcome.ts, c_call.ts and retry.ts by comment
  // and export markers (the judgment admission's doc comment moved), with the
  // retry-eligible case list, stage text and scratch-selection counts asserted
  // in them. No design sentence names that text; the behavior is below.
  const abg = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/index.js",
  )).href);
  const acquired = await acquireNewEmptyAppendSinkFixture(
    context,
    abg.createNewEmptyAppendSink,
    "abi5-f04-pure-rejection-",
  );
  const prefix = abg.selectValidatedRuntimeEventPrefix(
    abg.readRuntimeEventsAtDurablePrefix(acquired.prefix),
  );
  const cCall = Object.freeze({
    cCallRef: "c-call://m5/f04-pure-rejection",
    runId: "run://m5/f04-pure-rejection",
    graphCallId: "graph-call://m5/f04-pure-rejection",
    frameId: "frame://m5/f04-pure-rejection",
    programLocusRef: "locus://m5/f04-pure-rejection",
    taskOrdinal: null,
    attempt: 1,
    retryPath: [1],
    outputContractRef: "contract://m5/f04-output@5",
    failureContractRef: "contract://m5/f04-failure@5",
  });
  const malformed = Object.freeze({
    kind: "malformed_fp_output",
    schemaVersion: "5.0.0",
    rawOutputDigest: `sha256:${"a".repeat(64)}`,
  });
  const changed = Object.freeze({
    ...malformed,
    rawOutputDigest: `sha256:${"b".repeat(64)}`,
  });
  const reject = (candidate) => abg.admitResult(
    acquired.store,
    prefix,
    {},
    {},
    {},
    cCall,
    candidate,
    "success",
    cCall.outputContractRef,
    "fp_hello_output",
    () => false,
    [],
    {
      eventTime: "2026-08-16T00:00:00.000Z",
      correlationId: "correlation://m5/f04-pure-rejection",
      causationEventRefs: [],
    },
  );
  const first = reject(malformed);
  const stationary = reject(structuredClone(malformed));
  const different = reject(changed);
  for (const rejection of [first, stationary, different]) {
    assert.equal(rejection.kind, "c_call_admission_rejection");
    assert.equal(rejection.stage, "result");
    assert.equal(rejection.contractRef, cCall.outputContractRef);
  }
  assert.equal(first.candidateDigest, stationary.candidateDigest);
  assert.notEqual(first.candidateDigest, different.candidateDigest);

  const beforeEvents = acquired.store.readAll();
  const beforeDigest = acquired.store.digest();
  const beforeBytes = await readFile(new URL(acquired.prefix.eventLogRef));
  assert.throws(
    () => abg.admitCCallResult({
      outcomeClass: "leaf",
      regime: "F_P",
      store: acquired.store,
      predecessorPrefix: acquired.prefix,
      executionBasis: {},
      implementationSet: {},
      graph: {},
      graphFunction: {},
      cursor: {},
      cCall,
      resolution: {},
      leafPort: {},
      input: {},
      inputDigest: `sha256:${"c".repeat(64)}`,
      ownerReceipt: {
        candidate: { resultCandidate: malformed },
        receipt: {
          computeRegime: "F_P",
          actorProcessExchange: { request: {}, observation: {} },
        },
      },
      outputValueKind: "fp_hello_output",
      failureValueKind: "fp_hello_failure",
      actorRuntimeBinding: { artifactTruth: {} },
      basis: {
        eventTime: "2026-08-16T00:00:00.000Z",
        correlationId: "correlation://m5/f04-authority-refusal",
        causationEventRefs: [],
      },
    }),
    (error) =>
      error instanceof TypeError &&
      error.message ===
        "F04 probabilistic result authority refused: unadmitted_contract_capability",
  );
  assert.deepEqual(acquired.store.readAll(), beforeEvents);
  assert.equal(acquired.store.digest(), beforeDigest);
  assert.deepEqual(
    await readFile(new URL(acquired.prefix.eventLogRef)),
    beforeBytes,
  );
});
