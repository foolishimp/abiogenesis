import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { join, resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");
const runId = "run://retry/lifecycle-authority";
const graphCallId = "graph-call://retry/lifecycle-authority";
const frameId = "frame://retry/lifecycle-authority";

function event(kind, eventId, payload, causationEventRefs = []) {
  return {
    kind,
    eventId,
    payload,
    causationEventRefs,
    runId,
    graphCallId,
    frameId,
    aggregateId: kind === "c_call_opened" ? payload.cCallRef : frameId,
  };
}

test("retry lifecycle follows retry attempt ancestry through structural advance", async () => {
  const lifecycle = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/retry_lifecycle.js",
  )).href);
  const source = event("traversal_cursor_entered", "event://cursor/source", {
    cursorRef: "cursor://source",
    cursorDigest: "sha256:source",
    termPath: ["node", "retry"],
  });
  const predecessorA = event("traversal_route_admitted", "event://route/predecessor-a", {
    routeKind: "advance",
    routeRef: "route://predecessor-a",
    sourceCursorRef: "cursor://before-source",
    sourceCursorDigest: "sha256:before-source",
    targetCursorRef: source.payload.cursorRef,
    targetCursorDigest: source.payload.cursorDigest,
  }, [source.eventId]);
  const routeA = event("traversal_route_admitted", "event://route/a", {
    routeKind: "retry",
    routeRef: "route://a",
    sourceCursorRef: "cursor://source",
    sourceCursorDigest: "sha256:source",
    targetCursorRef: "cursor://target/a",
    targetCursorDigest: "sha256:target-a",
    cCallRef: null,
    judgmentRef: null,
    consumedAvailabilityRefs: [],
  }, [predecessorA.eventId]);
  const routeB = event("traversal_route_admitted", "event://route/b", {
    ...routeA.payload,
    routeRef: "route://b",
    targetCursorRef: "cursor://target/b",
    targetCursorDigest: "sha256:target-b",
  }, [source.eventId]);
  const attempt = (suffix, route, boundary) => event(
    "retry_attempt_opened",
    `event://attempt/${suffix}`,
    {
      attemptRef: `retry-attempt://${suffix}`,
      retryBoundaryRef: boundary,
      retryTermPath: ["node", "retry"],
      wrappedTermPath: ["node", "retry", "term"],
      taskOrdinal: 3,
      attempt: 1,
      retryPath: [1],
      priorJudgmentRef: null,
      priorRouteRef: route.payload.routeRef,
    },
    [route.eventId],
  );
  const attemptA = attempt("a", routeA, "retry-boundary://a");
  const attemptB = attempt("b", routeB, "retry-boundary://b");
  const advanceA = event("traversal_route_admitted", "event://route/advance-a", {
    routeKind: "advance",
    routeRef: "route://advance-a",
    sourceCursorRef: "cursor://target/a",
    sourceCursorDigest: "sha256:target-a",
    targetCursorRef: "cursor://wrapped/a",
    targetCursorDigest: "sha256:wrapped-a",
  }, [routeA.eventId]);
  const opened = event("c_call_opened", "event://c-call/opened", {
    cCallRef: "c-call:sha256:exact-target",
    cursorRef: "cursor://wrapped/a",
    cursorDigest: "sha256:wrapped-a",
    taskOrdinal: 3,
    attempt: 1,
    retryPath: [1],
    programLocusRef: "locus://exact-target",
  }, [advanceA.eventId]);
  const selected = lifecycle.selectExactRetryAttemptEvent(
    [source, predecessorA, routeA, routeB, attemptA, attemptB, advanceA, opened],
    {
      cCallRef: opened.payload.cCallRef,
      runId,
      graphCallId,
      frameId,
      taskOrdinal: 3,
      attempt: 1,
      retryPath: [1],
      programLocusRef: "locus://exact-target",
    },
  );
  assert.equal(selected?.payload.attemptRef, attemptA.payload.attemptRef);
  assert.notEqual(selected?.payload.retryBoundaryRef, attemptB.payload.retryBoundaryRef);
  const coordinates = {
    cCallRef: opened.payload.cCallRef,
    runId,
    graphCallId,
    frameId,
    taskOrdinal: 3,
    attempt: 1,
    retryPath: [1],
    programLocusRef: "locus://exact-target",
  };
  const prefix = [
    source, predecessorA, routeA, routeB, attemptA, attemptB, advanceA, opened,
  ];
  const before = structuredClone(prefix);
  const directRoute = {
    ...routeA,
    eventId: "event://route/direct",
    payload: {
      ...routeA.payload,
      routeRef: "route://direct",
      targetCursorRef: "cursor://wrapped/direct",
      targetCursorDigest: "sha256:wrapped-direct",
    },
  };
  const directAttempt = attempt("direct", directRoute, "retry-boundary://direct");
  const directOpened = {
    ...opened,
    eventId: "event://c-call/opened-direct",
    payload: {
      ...opened.payload,
      cursorRef: directRoute.payload.targetCursorRef,
      cursorDigest: directRoute.payload.targetCursorDigest,
    },
    causationEventRefs: [directRoute.eventId],
  };
  assert.equal(lifecycle.selectExactRetryAttemptEvent([
    source, predecessorA, directRoute, directAttempt, directOpened,
  ], {
    ...coordinates,
    cCallRef: directOpened.payload.cCallRef,
  })?.eventId, directAttempt.eventId, "direct retry route owns its immediate opening");
  const siblingRoute = {
    ...directRoute,
    eventId: "event://route/direct-sibling",
  };
  const siblingAttempt = attempt("direct-sibling", siblingRoute, "retry-boundary://direct-sibling");
  assert.equal(lifecycle.selectExactRetryAttemptEvent([
    source, predecessorA, directRoute, siblingRoute, siblingAttempt, directOpened,
  ], {
    ...coordinates,
    cCallRef: directOpened.payload.cCallRef,
  }), null, "same-shaped sibling route does not own the direct opening");
  assert.equal(lifecycle.selectExactRetryAttemptEvent([
    source, predecessorA, directRoute, {
      ...directAttempt,
      causationEventRefs: ["event://route/missing-direct"],
    }, directOpened,
  ], {
    ...coordinates,
    cCallRef: directOpened.payload.cCallRef,
  }), null, "broken direct retry cause refuses");
  assert.equal(lifecycle.selectExactRetryAttemptEvent(prefix, {
    ...coordinates,
    programLocusRef: "locus://other",
  }), null, "locus mismatch refuses");
  assert.equal(lifecycle.selectExactRetryAttemptEvent([
    ...prefix,
    { ...advanceA, eventId: "event://route/advance-duplicate" },
    { ...opened, causationEventRefs: [
      advanceA.eventId,
      "event://route/advance-duplicate",
    ] },
  ], coordinates), null, "ambiguous immediate structural route refuses");
  assert.equal(lifecycle.selectExactRetryAttemptEvent([
    ...prefix.filter((candidate) => candidate.eventId !== advanceA.eventId),
    { ...advanceA, causationEventRefs: ["event://route/missing"] },
  ], coordinates), null, "broken attempt ancestry refuses");
  assert.equal(lifecycle.selectExactRetryAttemptEvent([
    ...prefix.filter((candidate) => candidate.eventId !== routeA.eventId),
    { ...routeA, causationEventRefs: ["event://route/missing-predecessor"] },
  ], coordinates), null, "broken retry source predecessor refuses");
  const duplicatePredecessor = {
    ...predecessorA,
    eventId: "event://route/predecessor-duplicate",
  };
  assert.equal(lifecycle.selectExactRetryAttemptEvent([
    ...prefix.filter((candidate) => candidate.eventId !== routeA.eventId),
    duplicatePredecessor,
    { ...routeA, causationEventRefs: [
      predecessorA.eventId,
      duplicatePredecessor.eventId,
    ] },
  ], coordinates), null, "ambiguous retry source predecessor refuses");
  assert.deepEqual(prefix, before, "selector refusals append zero events");
});

test("retry lifecycle refuses multiple exact attempts in the opening ancestry", async () => {
  const lifecycle = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/retry_lifecycle.js",
  )).href);
  const source = event("traversal_cursor_entered", "event://cursor/ambiguous", {
    cursorRef: "cursor://ambiguous/source",
    cursorDigest: "sha256:ambiguous-source",
    termPath: ["node", "retry"],
  });
  const retryRoute = (suffix) => event(
    "traversal_route_admitted",
    `event://route/retry-${suffix}`,
    {
      routeKind: "retry",
      routeRef: `route://retry-${suffix}`,
      sourceCursorRef: source.payload.cursorRef,
      sourceCursorDigest: source.payload.cursorDigest,
      targetCursorRef: `cursor://retry-${suffix}`,
      targetCursorDigest: `sha256:retry-${suffix}`,
      cCallRef: null,
      judgmentRef: null,
      consumedAvailabilityRefs: [],
    },
    [source.eventId],
  );
  const routeA = retryRoute("a");
  const routeB = retryRoute("b");
  const attempt = (suffix, route) => event(
    "retry_attempt_opened",
    `event://attempt/ambiguous-${suffix}`,
    {
      attemptRef: `retry-attempt://ambiguous-${suffix}`,
      retryBoundaryRef: `retry-boundary://ambiguous-${suffix}`,
      retryTermPath: ["node", "retry"],
      wrappedTermPath: ["node", "retry", "term"],
      taskOrdinal: 3,
      attempt: 1,
      retryPath: [1],
      priorJudgmentRef: null,
      priorRouteRef: route.payload.routeRef,
    },
    [route.eventId],
  );
  const attemptA = attempt("a", routeA);
  const attemptB = attempt("b", routeB);
  const advance = event("traversal_route_admitted", "event://route/ambiguous-advance", {
    routeKind: "advance",
    routeRef: "route://ambiguous-advance",
    targetCursorRef: "cursor://ambiguous/wrapped",
    targetCursorDigest: "sha256:ambiguous-wrapped",
  }, [routeA.eventId, routeB.eventId]);
  const opened = event("c_call_opened", "event://c-call/ambiguous", {
    cCallRef: "c-call:sha256:ambiguous",
    cursorRef: advance.payload.targetCursorRef,
    cursorDigest: advance.payload.targetCursorDigest,
    taskOrdinal: 3,
    attempt: 1,
    retryPath: [1],
    programLocusRef: "locus://ambiguous",
  }, [advance.eventId]);
  assert.equal(lifecycle.selectExactRetryAttemptEvent(
    [source, routeA, routeB, attemptA, attemptB, advance, opened],
    {
      cCallRef: opened.payload.cCallRef,
      runId,
      graphCallId,
      frameId,
      taskOrdinal: 3,
      attempt: 1,
      retryPath: [1],
      programLocusRef: opened.payload.programLocusRef,
    },
  ), null);
});

test("retry progress ownership refuses mismatched and stale boundary identity", async () => {
  const lifecycle = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/retry_lifecycle.js",
  )).href);
  const attempt = event("retry_attempt_opened", "event://attempt/exact", {
    attemptRef: "retry-attempt://exact",
    retryBoundaryRef: "retry-boundary://exact",
  });
  const judgment = event("c_call_judged", "event://judgment/exact", {
    judgment: "retry",
    retryAttemptRef: attempt.payload.attemptRef,
  });
  assert.equal(lifecycle.hasExactRetryContinuationProgressOwnership(
    attempt, judgment, attempt.payload.retryBoundaryRef,
  ), true);
  const mismatch = { ...judgment, payload: {
    ...judgment.payload,
    retryAttemptRef: "retry-attempt://other",
  } };
  assert.equal(lifecycle.hasExactRetryContinuationProgressOwnership(
    attempt, mismatch, attempt.payload.retryBoundaryRef,
  ), false);
  assert.equal(lifecycle.hasExactRetryContinuationProgressOwnership(
    attempt, judgment, "retry-boundary://stale",
  ), false);
});

test("CCall retry ownership requires the exact attempt to remain active in Event Calculus", async () => {
  const cCallSource = await readFile(join(root, "code/src/abg/c_call.ts"), "utf8");
  const helper = cCallSource.slice(
    cCallSource.indexOf("function exactRetryAttemptRef("),
    cCallSource.indexOf("function hasAdmittedActorEvidence", cCallSource.indexOf(
      "function exactRetryAttemptRef(",
    )),
  );
  assert.match(helper, /selectValidatedRuntimeEventPrefix\(store\.readAll\(\),/u);
  assert.match(helper, /selectExactRetryAttemptEvent\(events, cCall\)/u);
  assert.match(helper, /holdsAt\(projection, constructRuntimeFluent\(\{/u);
  assert.match(helper, /name: "retry_attempt_active"/u);
  assert.doesNotMatch(helper, /\.at\(-1\)|findLast|retryAttemptRef:\s*null/u);
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
    "admitPendingInteraction",
    "admitJudgment",
    "completeRejectedCCall",
  ]);
  assert.equal(/kind: "c_call_judged"/u.test(await readFile(
    join(root, "code/src/abg/event_store.ts"), "utf8",
  )), false);
  assert.equal(/\badmitRuntimeEvent(?:Batch)?\b/u.test(abgExports), false);
  assert.match(abgExports, /\badmitRuntimeEventTransaction\b/u);
});

test("runtime package exports expose no raw or candidate-factory event writer", async () => {
  const abg = await import(pathToFileURL(join(root, "build/code/src/abg/index.js")).href);
  const rootApi = await import(pathToFileURL(join(root, "build/code/src/index.js")).href);
  for (const api of [abg, rootApi]) {
    assert.equal("compareAndAppendExpectedPrefix" in api, false);
    assert.equal("admitRuntimeEvent" in api, false);
    assert.equal("admitRuntimeEventBatch" in api, false);
    assert.equal("AbgEventStore" in api, true);
    assert.equal("admitRuntimeEventTransaction" in api, true);
    assert.equal("admitJudgment" in api, true);
  }
  await assert.rejects(
    import("@abiogenesis/typescript-tenant/build/code/src/abg/event_store.js"),
    /not defined by "exports"|Package subpath/u,
  );
});
