import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "../..");

function sourceSlice(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(startIndex, -1, `missing source boundary: ${start}`);
  assert.notEqual(endIndex, -1, `missing source boundary: ${end}`);
  return source.slice(startIndex, endIndex);
}

test("declared C.retry frontier is the sole retry-attempt lifecycle owner", async () => {
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

  const retrySource = await readFile(join(root, "code/src/abg/retry.ts"), "utf8");
  const frontierOwner = sourceSlice(
    retrySource,
    "export function projectDeclaredCRetryFrontier(",
    "export function projectDeclaredCRetryCCallWriteAtPrefix(",
  );
  for (const relation of [
    "const calculus = deriveRuntimeEventCalculusProjection(prefix);",
    "attemptEvents.length > context.budget",
    "constructScopedRetryFluent(\"retry_attempt_active\"",
    "new Set(projectedAttempts.map",
    "rows.length >= context.budget",
  ]) {
    assert.equal(
      frontierOwner.includes(relation),
      true,
      `declared retry frontier lost owner relation: ${relation}`,
    );
  }
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

test("CCall retry writes require the exact current declared retry frontier", async () => {
  const cCallSource = await readFile(join(root, "code/src/abg/c_call.ts"), "utf8");
  const retrySource = await readFile(join(root, "code/src/abg/retry.ts"), "utf8");
  const openCCall = sourceSlice(
    cCallSource,
    "export function openCCall(",
    "export function openInteractionCCall(",
  );
  for (const relation of [
    "projectDeclaredCRetryCCallWriteAtPrefix(",
    "openingPrefix,",
    "openingAuthorityPrefix,",
    "stop.retryPath.length !== 0 && retryOwner === null",
    "retry CCall open requires the exact declared active retry frontier",
  ]) {
    assert.equal(
      openCCall.includes(relation),
      true,
      `CCall opening lost retry owner relation: ${relation}`,
    );
  }

  const writeOwner = sourceSlice(
    retrySource,
    "export function projectDeclaredCRetryCCallWriteAtPrefix(",
    "const RETRY_FRONTIER_SOURCE_KINDS",
  );
  for (const relation of [
    "frontier?.state !== \"attempt_active\"",
    "frontier.active.currentCursor.cursorRef !== cursor.cursorRef",
    "frontier.active.currentCursor.cursorDigest !== cursor.cursorDigest",
    "sha256Canonical(exact.cCall as unknown as JsonValue)",
    "matches.length === 1 && matches[0] === frontier.active.cCalls.at(-1)",
  ]) {
    assert.equal(
      writeOwner.includes(relation),
      true,
      `retry CCall writer lost exact frontier relation: ${relation}`,
    );
  }
  assert.doesNotMatch(writeOwner, /\.at\(-1\)\?\? null|findLast/u);
});

test("production judgment writers remain closed behind the CCall owner", async () => {
  const cCallSource = await readFile(join(root, "code/src/abg/c_call.ts"), "utf8");
  const abgExports = await readFile(join(root, "code/src/abg/index.ts"), "utf8");
  const exportedFunctions = [...cCallSource.matchAll(
    /^export function (?<name>[A-Za-z0-9_]+)\(/gmu,
  )];
  const judgmentOwners = [...cCallSource.matchAll(/kind: "c_call_judged"/gu)]
    .map((writer) => exportedFunctions.findLast(
      (candidate) => candidate.index < writer.index,
    )?.groups?.name);
  assert.deepEqual(judgmentOwners, [
    "admitPlannedCCallRuntimeFailureClose",
    "admitPlannedPendingInteraction",
    "admitJudgment",
    "completeRejectedCCall",
  ]);
  assert.equal(/kind: "c_call_judged"/u.test(await readFile(
    join(root, "code/src/abg/event_store.ts"), "utf8",
  )), false);
  assert.equal(/\badmitRuntimeEvent(?:Batch)?\b/u.test(abgExports), false);
  assert.doesNotMatch(abgExports, /\badmitRuntimeEventTransaction\b/u);
});

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
  const graphExecuteSource = await readFile(
    join(root, "code/src/hog/graph_execute.ts"),
    "utf8",
  );
  const rawResumeBranch = sourceSlice(
    graphExecuteSource,
    "else if (initialInput?.resume !== undefined)",
    "} else {",
  );
  assert.match(
    rawResumeBranch,
    /initialInput\.resume\.cursor\.retryPath\.length !== 0/u,
  );
  assert.doesNotMatch(rawResumeBranch, /projectedRetryResume/u);
});
