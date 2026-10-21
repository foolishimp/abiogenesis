import assert from "node:assert/strict";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";

import { acquireNewEmptyAppendSinkFixture } from "../support/new-empty-append-sink.mjs";
import { setupInstalledRootCatalog } from "../support/root-installed-environment.mjs";

function candidate(kind, runId, causationEventRefs = []) {
  const digest = `sha256:${"1".repeat(64)}`;
  const payload = kind === "run_closed"
    ? {
        runId,
        graphCallClosedEventRef: "event://abiogenesis/synthetic-graph-call-close",
        closureContractRef: "closure-contract://abiogenesis/synthetic",
      }
    : {
        failureRef: `runtime-failure://abiogenesis/${runId}`,
        failureDigest: digest,
        stage: "hog_traversal",
        subjectDigest: digest,
      };
  return {
    kind,
    eventTime: "2026-07-21T00:00:00.000Z",
    aggregateType: "run",
    aggregateId: runId,
    parentAggregateId: null,
    causationEventRefs,
    correlationId: `correlation://t286/runtime-scope/${runId}`,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: `basis://t286/${runId}`,
    runId,
    payload,
  };
}

test("ABG rejects cross-run causation before scoped replay", async (context) => {
  const environment = await setupInstalledRootCatalog(context, process.cwd());
  const internal = await import(pathToFileURL(join(
    environment.installedRoot,
    "build/code/src/abg/event_store.js",
  )).href);
  const { store } = await acquireNewEmptyAppendSinkFixture(
    context,
    environment.abg.createNewEmptyAppendSink,
    "abi5-runtime-scope-cross-run-",
  );
  const runB = "run://abiogenesis/runtime-scope-b";
  const closedB = internal.admitRuntimeEvent(store, candidate("run_closed", runB));
  assert.throws(
    () => internal.admitRuntimeEvent(
      store,
      candidate(
        "runtime_failure_observed",
        "run://abiogenesis/runtime-scope-a",
        [closedB.eventId],
      ),
    ),
    /cannot cross a run scope/u,
  );
  assert.equal(store.readAll().length, 1);
});

test("ABG replay fails closed when a failure follows a close", async (context) => {
  const environment = await setupInstalledRootCatalog(context, process.cwd());
  const internal = await import(pathToFileURL(join(
    environment.installedRoot,
    "build/code/src/abg/event_store.js",
  )).href);
  const { store } = await acquireNewEmptyAppendSinkFixture(
    context,
    environment.abg.createNewEmptyAppendSink,
    "abi5-runtime-scope-precedence-",
  );
  const runId = "run://abiogenesis/runtime-failure-precedence";
  const closed = internal.admitRuntimeEvent(store, candidate("run_closed", runId));
  const failure = internal.admitRuntimeEvent(
    store,
    candidate("runtime_failure_observed", runId, [closed.eventId]),
  );
  const replay = environment.abg.replay(store, { runId });
  assert.equal(replay.runtimeStatus, "failed");
  assert.equal(replay.runClosedEventRef, closed.eventId);
  assert.equal(replay.runtimeFailureEventRef, failure.eventId);
});
