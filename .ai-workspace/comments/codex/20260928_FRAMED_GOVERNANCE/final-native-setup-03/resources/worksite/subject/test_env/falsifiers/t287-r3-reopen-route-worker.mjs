#!/usr/bin/env node

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const input = JSON.parse(await readFile(process.argv[2], "utf8"));
const moduleUrl = (relativePath) => pathToFileURL(join(
  input.packageRoot,
  "build/code/src",
  relativePath,
)).href;
const [eventStoreApi, prefixApi, cCallApi, retryApi, materializeApi,
  digestApi, immutableApi] = await Promise.all([
    import(moduleUrl("abg/event_store.js")),
    import(moduleUrl("abg/event_prefix.js")),
    import(moduleUrl("abg/c_call.js")),
    import(moduleUrl("abg/retry.js")),
    import(moduleUrl("gtl/materialize.js")),
    import(moduleUrl("shared/digests.js")),
    import(moduleUrl("shared/immutable.js")),
  ]);

const bytesBefore = await readFile(input.eventLogPath);
const identity = await stat(input.eventLogPath);
const authorityBody = {
  kind: "event_store_reopen_authority",
  schemaVersion: "5.0.0",
  eventLogPath: input.eventLogPath,
  device: identity.dev,
  inode: identity.ino,
  eventLogDigest:
    `sha256:${createHash("sha256").update(bytesBefore).digest("hex")}`,
  durableByteLength: bytesBefore.byteLength,
  eventContractDigest: eventStoreApi.ROOT_EVENT_CONTRACT_DIGEST,
};
const reopened = eventStoreApi.reopenEventStore({
  ...authorityBody,
  authorityDigest: digestApi.sha256Canonical(authorityBody),
});
assert.equal(reopened.kind, "reopened_event_store_context",
  JSON.stringify(reopened));
const store = reopened.store;
const initialEvents = store.readAll();
const initialDigest = store.digest();
const prefix = prefixApi.selectValidatedRuntimeEventPrefix(initialEvents);

const isRecord = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const openedEvents = initialEvents.filter((event) =>
  event.kind === "c_call_opened" && event.aggregateId === input.cCallRef);
assert.equal(openedEvents.length, 1,
  "owner-internal selector resolves one exact CCall");
const openedEvent = openedEvents[0];
assert.ok(isRecord(openedEvent.payload));
const resultEvents = initialEvents.filter((event) =>
  event.kind === "c_call_result_admitted" &&
  event.aggregateId === input.cCallRef);
const judgmentEvents = initialEvents.filter((event) =>
  event.kind === "c_call_judged" && event.aggregateId === input.cCallRef);
const blockedRouteEvents = initialEvents.filter((event) =>
  event.kind === "traversal_route_admitted" &&
  isRecord(event.payload) &&
  event.payload.routeKind === "blocked" &&
  event.payload.cCallRef === input.cCallRef);
assert.equal(resultEvents.length, 1,
  "selected CCall has one exact admitted result");
assert.equal(judgmentEvents.length, 1,
  "selected CCall has one exact admitted judgment");
assert.equal(blockedRouteEvents.length, 1,
  "selected CCall has one exact admitted blocked route");
const resultEvent = resultEvents[0];
const judgmentEvent = judgmentEvents[0];
const blockedRouteEvent = blockedRouteEvents[0];
assert.ok(isRecord(resultEvent.payload));
assert.ok(isRecord(judgmentEvent.payload));
assert.ok(isRecord(blockedRouteEvent.payload));
assert.equal(judgmentEvent.payload.resultRef, resultEvent.payload.resultRef);

const attemptEvents = initialEvents.filter((event) =>
  event.kind === "retry_attempt_opened" &&
  event.runId === openedEvent.runId &&
  event.graphCallId === openedEvent.graphCallId &&
  event.frameId === openedEvent.frameId &&
  event.basisId === openedEvent.basisId &&
  event.materializationRef === openedEvent.materializationRef &&
  event.admissionOrdinal < openedEvent.admissionOrdinal &&
  isRecord(event.payload) &&
  event.payload.attemptRef === judgmentEvent.payload.retryAttemptRef &&
  event.payload.attempt === openedEvent.payload.attempt &&
  digestApi.sha256Canonical(event.payload.retryPath) ===
    digestApi.sha256Canonical(openedEvent.payload.retryPath));
assert.equal(attemptEvents.length, 1,
  "the selected judgment names one exact retry attempt preimage");
const attemptEvent = attemptEvents[0];
assert.ok(isRecord(attemptEvent.payload));
assert.ok(isRecord(attemptEvent.payload.inputValue));
const basisEvent = initialEvents.find((event) =>
  event.kind === "basis_admitted" && event.basisId === openedEvent.basisId);
assert.ok(basisEvent);
assert.ok(isRecord(basisEvent.payload));
assert.equal(
  digestApi.sha256Canonical(attemptEvent.payload.inputValue),
  basisEvent.payload.rawInputDigest,
  "retry-attempt input value equals the admitted invocation-input digest",
);
const graphFunction = immutableApi.deepFreeze(input.graphFunction);
const graph = materializeApi.materializeGraph(graphFunction, {
  invocationAdmissionRef: basisEvent.payload.invocationAdmissionRef,
  admittedInputRef: basisEvent.payload.rawInputAdmissionRef,
  admittedInputDigest: basisEvent.payload.rawInputDigest,
  admittedInput: immutableApi.deepFreeze(attemptEvent.payload.inputValue),
});
assert.equal(graph.materializationRef, openedEvent.materializationRef);
assert.equal(graph.materializationRef, basisEvent.payload.graphRef);
assert.equal(graph.materializationDigest, basisEvent.payload.graphDigest);
const projectedAttempt = retryApi.projectRetryAttempt(
  prefix,
  graph,
  attemptEvent.eventId,
);
assert.ok(projectedAttempt,
  "owner-internal attempt projection revalidates against materialized GTL");
assert.equal(projectedAttempt.attemptRef, attemptEvent.payload.attemptRef);

const initialCursorEvent = initialEvents.find((event) =>
  event.kind === "traversal_cursor_entered" &&
  event.runId === openedEvent.runId &&
  event.graphCallId === openedEvent.graphCallId &&
  event.frameId === openedEvent.frameId);
assert.ok(initialCursorEvent);
assert.ok(isRecord(initialCursorEvent.payload));
const cursorBody = {
  programRef: initialCursorEvent.payload.programRef,
  executionBasisRef: initialCursorEvent.payload.executionBasisRef,
  traversalScopeRef: initialCursorEvent.payload.traversalScopeRef,
  runId: openedEvent.runId,
  graphCallId: openedEvent.graphCallId,
  frameId: openedEvent.frameId,
  graphRef: graph.materializationRef,
  inputRef: attemptEvent.payload.inputRef,
  inputDigest: attemptEvent.payload.inputDigest,
  currentNodeRef: attemptEvent.payload.wrappedTermPath[1],
  position: "at_term",
  termPath: attemptEvent.payload.wrappedTermPath,
  taskOrdinal: attemptEvent.payload.taskOrdinal,
  attempt: attemptEvent.payload.attempt,
  retryPath: attemptEvent.payload.retryPath,
};
const cursorDigest = digestApi.sha256Canonical(cursorBody);
const sourceCursor = immutableApi.deepFreeze({
  kind: "traversal_cursor",
  schemaVersion: "5.0.0",
  cursorRef:
    `traversal-cursor://abiogenesis/${cursorDigest.slice("sha256:".length)}`,
  cursorDigest,
  ...cursorBody,
});
assert.equal(sourceCursor.cursorRef, openedEvent.payload.cursorRef);
assert.equal(sourceCursor.cursorDigest, openedEvent.payload.cursorDigest);
const cCall = cCallApi.projectOpenedCCallCarrier(
  store,
  prefix,
  graph,
  input.cCallRef,
);
assert.ok(cCall, "owner-internal reconstruction projects the opened CCall");

const consumedOwners = Array.from(
  { length: projectedAttempt.retryPath.length },
  (_, index) => {
    const retryDepth = projectedAttempt.retryPath.length - index;
    const owner = retryApi.projectDeclaredCRetryFrontier(
      prefix,
      graph,
      sourceCursor,
      graphFunction,
      retryDepth,
    );
    assert.equal(owner?.state, "progress_consumed",
      `stopped depth ${retryDepth} is consumed in the final prefix`);
    assert.equal(
      owner.consumed.kind,
      index === 0
        ? "declared_c_retry_boundary_stopped_progress"
        : "declared_c_retry_propagated_stopped_progress",
    );
    assert.equal(owner.consumed.consumption.kind,
      "progress_consumed_by_exit");
    assert.equal(
      owner.consumed.consumption.route.admissionEventRef,
      blockedRouteEvent.eventId,
    );
    return owner;
  },
);
const stoppedProgresses = consumedOwners.map((owner) =>
  owner.consumed.progress
);
const stoppedRows = consumedOwners.map((owner) => {
  const rows = initialEvents.filter((event) =>
    event.eventId === owner.consumed.progressEventRef);
  assert.equal(rows.length, 1,
    "each consumed owner row names one admitted stopped event");
  return rows[0];
});
for (const [index, progress] of stoppedProgresses.entries()) {
  const expectedPath = projectedAttempt.retryPath.slice(
    0,
    projectedAttempt.retryPath.length - index,
  );
  assert.deepEqual(progress.retryPath, expectedPath,
    "consumed stopped coordinates equal the selected CCall retry path");
  assert.equal(progress.cCallRef, cCall.cCallRef);
  assert.equal(progress.resultRef, resultEvent.payload.resultRef);
  assert.equal(progress.judgmentRef, judgmentEvent.payload.judgmentRef);
  assert.equal(progress.attempt, expectedPath.at(-1));
  if (index === 0) {
    assert.equal(progress.stopReason, "boundary_terminal");
    assert.equal(progress.predecessorProgressRef, null);
  } else {
    assert.equal(progress.stopReason, "propagated_inner_stop");
    assert.equal(
      progress.predecessorProgressRef,
      stoppedProgresses[index - 1].progressRef,
    );
  }
}
assert.deepEqual(blockedRouteEvent.payload.consumedAvailabilityRefs, [
  judgmentEvent.payload.judgmentRef,
  ...stoppedProgresses.map((progress) => progress.progressRef),
]);
assert.deepEqual(
  blockedRouteEvent.causationEventRefs,
  stoppedRows.toReversed().map((event) => event.eventId),
);
const runStoppedEvents = initialEvents.filter((event) =>
  event.kind === "run_stopped" &&
  event.runId === openedEvent.runId &&
  event.causationEventRefs.includes(blockedRouteEvent.eventId));
assert.equal(runStoppedEvents.length, 1,
  "the final blocked route has one exact run_stopped consequence");
assert.deepEqual(store.readAll(), initialEvents,
  "fresh-process reconstruction appends no in-memory event");
assert.equal(store.digest(), initialDigest,
  "fresh-process reconstruction preserves the event-store digest");
store.closeDurableLog();
const bytesAfter = await readFile(input.eventLogPath);
assert.deepEqual(bytesAfter, bytesBefore,
  "fresh-process reconstruction changes no durable byte");

process.stdout.write(`${JSON.stringify({
  pid: process.pid,
  reconstructionKind: "owner_internal_consumed_retry_frontier",
  ownerInternalProjectionEqual: true,
  ownerInternalProjection: {
    cCallRef: cCall.cCallRef,
    attemptRef: projectedAttempt.attemptRef,
    attemptDigest: projectedAttempt.attemptDigest,
    inputRef: projectedAttempt.inputRef,
    inputDigest: projectedAttempt.inputDigest,
    inputContractRef: projectedAttempt.inputContractRef,
    stoppedProgressRefs: stoppedProgresses.map((progress) =>
      progress.progressRef),
    stoppedProgressDigests: stoppedProgresses.map((progress) =>
      progress.progressDigest),
  },
  consumedAvailabilityRefs: blockedRouteEvent.payload.consumedAvailabilityRefs,
  causationEventRefs: blockedRouteEvent.causationEventRefs,
  routeAdmissionEventRef: blockedRouteEvent.eventId,
  runStoppedEventRef: runStoppedEvents[0].eventId,
})}\n`);
