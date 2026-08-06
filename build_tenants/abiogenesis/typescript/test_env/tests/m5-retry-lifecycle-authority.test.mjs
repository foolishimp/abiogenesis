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

test("retry lifecycle selects only the exact route target and boundary site", async () => {
  const lifecycle = await import(pathToFileURL(join(
    root,
    "build/code/src/abg/retry_lifecycle.js",
  )).href);
  const source = event("traversal_cursor_entered", "event://cursor/source", {
    cursorRef: "cursor://source",
    cursorDigest: "sha256:source",
    termPath: ["node", "retry"],
  });
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
  }, [source.eventId]);
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
  const opened = event("c_call_opened", "event://c-call/opened", {
    cCallRef: "c-call:sha256:exact-target",
    cursorRef: "cursor://target/a",
    cursorDigest: "sha256:target-a",
    taskOrdinal: 3,
    attempt: 1,
    retryPath: [1],
    programLocusRef: "locus://exact-target",
  }, [routeA.eventId]);
  const selected = lifecycle.selectExactRetryAttemptEvent(
    [source, routeA, routeB, attemptA, attemptB, opened],
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
  const prefix = [source, routeA, routeB, attemptA, attemptB, opened];
  const before = structuredClone(prefix);
  assert.equal(lifecycle.selectExactRetryAttemptEvent(prefix, {
    ...coordinates,
    programLocusRef: "locus://other",
  }), null, "locus mismatch refuses");
  assert.equal(lifecycle.selectExactRetryAttemptEvent([
    ...prefix,
    { ...attemptA, eventId: "event://attempt/a-duplicate" },
  ], coordinates), null, "duplicate attempt cardinality refuses");
  assert.equal(lifecycle.selectExactRetryAttemptEvent([
    ...prefix,
    { ...routeA, eventId: "event://route/a-duplicate" },
    { ...opened, causationEventRefs: [routeA.eventId, "event://route/a-duplicate"] },
  ], coordinates), null, "duplicate route cardinality refuses");
  assert.deepEqual(prefix, before, "selector refusals append zero events");
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
  assert.equal(lifecycle.hasExactRetryProgressOwnership(
    attempt, judgment, attempt.payload.retryBoundaryRef,
  ), true);
  const mismatch = { ...judgment, payload: {
    ...judgment.payload,
    retryAttemptRef: "retry-attempt://other",
  } };
  assert.equal(lifecycle.hasExactRetryProgressOwnership(
    attempt, mismatch, attempt.payload.retryBoundaryRef,
  ), false);
  assert.equal(lifecycle.hasExactRetryProgressOwnership(
    attempt, judgment, "retry-boundary://stale",
  ), false);
});

test("production judgment writers remain closed behind the CCall owner", async () => {
  const cCallSource = await readFile(join(root, "code/src/abg/c_call.ts"), "utf8");
  const abgExports = await readFile(join(root, "code/src/abg/index.ts"), "utf8");
  assert.equal([...cCallSource.matchAll(/kind: "c_call_judged"/gu)].length, 3);
  assert.equal(/kind: "c_call_judged"/u.test(await readFile(
    join(root, "code/src/abg/event_store.ts"), "utf8",
  )), false);
  assert.equal(/\badmitRuntimeEvent(?:Batch)?\b/u.test(abgExports), false);
  assert.match(abgExports, /\badmitRuntimeEventTransaction\b/u);
});
