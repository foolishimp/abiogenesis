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
const [eventStoreApi, prefixApi, cCallApi, retryApi, routeApi, replayApi,
  executionApi, materializeApi, sourcePathApi, hogRouteApi, digestApi,
  immutableApi] = await Promise.all([
    import(moduleUrl("abg/event_store.js")),
    import(moduleUrl("abg/event_prefix.js")),
    import(moduleUrl("abg/c_call.js")),
    import(moduleUrl("abg/retry.js")),
    import(moduleUrl("abg/traversal_route.js")),
    import(moduleUrl("abg/replay.js")),
    import(moduleUrl("abg/execution_basis.js")),
    import(moduleUrl("gtl/materialize.js")),
    import(moduleUrl("gtl/source_path.js")),
    import(moduleUrl("hog/traversal_route.js")),
    import(moduleUrl("shared/digests.js")),
    import(moduleUrl("shared/immutable.js")),
  ]);

const bytes = await readFile(input.eventLogPath);
const identity = await stat(input.eventLogPath);
const authorityBody = {
  kind: "event_store_reopen_authority",
  schemaVersion: "5.0.0",
  eventLogPath: input.eventLogPath,
  device: identity.dev,
  inode: identity.ino,
  eventLogDigest:
    `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
  durableByteLength: bytes.byteLength,
  eventContractDigest: eventStoreApi.ROOT_EVENT_CONTRACT_DIGEST,
};
const reopened = eventStoreApi.reopenEventStore({
  ...authorityBody,
  authorityDigest: digestApi.sha256Canonical(authorityBody),
});
assert.equal(reopened.kind, "reopened_event_store_context",
  JSON.stringify(reopened));
const store = reopened.store;

function eventCandidate(event, overrides = {}) {
  const {
    eventId: _eventId,
    admissionOrdinal: _admissionOrdinal,
    payloadDigest: _payloadDigest,
    ...candidate
  } = event;
  return { ...candidate, ...overrides };
}

const initialEvents = store.readAll();
const openedEvent = initialEvents.find((event) =>
  event.kind === "c_call_opened" && event.aggregateId === input.cCallRef);
assert.ok(openedEvent);
const basisEvent = initialEvents.find((event) =>
  event.kind === "basis_admitted" && event.basisId === openedEvent.basisId);
assert.ok(basisEvent);
const graphFunction = immutableApi.deepFreeze(input.graphFunction);
const graph = materializeApi.materializeGraph(graphFunction, {
  invocationAdmissionRef: basisEvent.payload.invocationAdmissionRef,
  admittedInputRef: basisEvent.payload.rawInputAdmissionRef,
  admittedInputDigest: basisEvent.payload.rawInputDigest,
  admittedInput: immutableApi.deepFreeze(input.inputValue),
});
const beforePrefix = prefixApi.selectValidatedRuntimeEventPrefix(
  store.readAll(),
);
const beforeCCall = cCallApi.projectOpenedCCallCarrier(
  store,
  beforePrefix,
  graph,
  input.cCallRef,
);
assert.ok(beforeCCall, "fresh process reconstructs the opened CCall");

// Event-contract-valid mutation control only: this deliberately bypasses the
// semantic admitExecutionBasis/openCall owners. It proves whole-prefix
// projection invariance, not unrelated-Run authority.
const { basisRef: _basisRef, basisDigest: _basisDigest, ...basisBody } =
  basisEvent.payload;
const unrelatedBasisBody = {
  ...basisBody,
  invocationRef: `${basisBody.invocationRef}/t287-r3-unrelated`,
};
const unrelatedBasisDigest = digestApi.sha256Canonical(unrelatedBasisBody);
const unrelatedBasisRef =
  `basis://t287-r3/${unrelatedBasisDigest.slice("sha256:".length)}`;
const unrelatedBasisEvent = eventStoreApi.admitRuntimeEvent(store,
  eventCandidate(basisEvent, {
    basisId: unrelatedBasisRef,
    correlationId: "correlation://t287/r3/unrelated-basis",
    payload: {
      basisRef: unrelatedBasisRef,
      basisDigest: unrelatedBasisDigest,
      ...unrelatedBasisBody,
    },
  }));
const targetRunEvent = initialEvents.find((event) =>
  event.kind === "run_segment_opened" && event.runId === openedEvent.runId);
assert.ok(targetRunEvent);
const { runId: _runId, runDigest: _runDigest, ...runBody } =
  targetRunEvent.payload;
const unrelatedRunBody = {
  ...runBody,
  executionBasisRef: unrelatedBasisRef,
  executionBasisDigest: unrelatedBasisDigest,
  invocationRef: `${runBody.invocationRef}/t287-r3-unrelated`,
};
const unrelatedRunDigest = digestApi.sha256Canonical(unrelatedRunBody);
const unrelatedRunId =
  `run://abiogenesis/${unrelatedRunDigest.slice("sha256:".length)}`;
const unrelatedRunEvent = eventStoreApi.admitRuntimeEvent(store,
  eventCandidate(targetRunEvent, {
    aggregateId: unrelatedRunId,
    causationEventRefs: [unrelatedBasisEvent.eventId],
    correlationId: "correlation://t287/r3/unrelated-run",
    basisId: unrelatedBasisRef,
    runId: unrelatedRunId,
    payload: {
      runId: unrelatedRunId,
      runDigest: unrelatedRunDigest,
      ...unrelatedRunBody,
    },
  }));

const interleavedPrefix = prefixApi.selectValidatedRuntimeEventPrefix(
  store.readAll(),
);
const interleavedCCall = cCallApi.projectOpenedCCallCarrier(
  store,
  interleavedPrefix,
  graph,
  input.cCallRef,
);
assert.ok(interleavedCCall);
assert.equal(
  digestApi.sha256Canonical(interleavedCCall),
  digestApi.sha256Canonical(beforeCCall),
  "unrelated global Run interleaving does not alter CCall projection",
);
const stoppedProgresses = input.stoppedProgressEventRefs.map((eventRef) =>
  retryApi.projectAdmittedRetryProgress(interleavedPrefix, eventRef));
assert.deepEqual(stoppedProgresses.map((progress) => progress?.progressClass),
  ["stopped", "stopped"]);
const initialCursorEvent = initialEvents.find((event) =>
  event.kind === "traversal_cursor_entered" &&
  event.runId === openedEvent.runId);
assert.ok(initialCursorEvent);
const locus = sourcePathApi.resolveCProgramLocus(
  graph.template,
  interleavedCCall.programLocusRef,
);
assert.notEqual(locus.kind, "c_source_path_refusal", JSON.stringify(locus));
const cursorBody = {
  programRef: initialCursorEvent.payload.programRef,
  executionBasisRef: initialCursorEvent.payload.executionBasisRef,
  traversalScopeRef: initialCursorEvent.payload.traversalScopeRef,
  runId: openedEvent.runId,
  graphCallId: openedEvent.graphCallId,
  frameId: openedEvent.frameId,
  graphRef: graph.materializationRef,
  inputRef: initialCursorEvent.payload.inputRef,
  inputDigest: initialCursorEvent.payload.inputDigest,
  currentNodeRef: locus.nodeRef,
  position: "at_term",
  termPath: locus.termPath,
  taskOrdinal: openedEvent.payload.taskOrdinal,
  attempt: openedEvent.payload.attempt,
  retryPath: openedEvent.payload.retryPath,
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
const executionBasis = executionApi.rehydrateExecutionBasis(
  store,
  openedEvent.basisId,
);
assert.ok(executionBasis);
const judgmentEvent = initialEvents.find((event) =>
  event.kind === "c_call_judged" && event.aggregateId === input.cCallRef);
assert.ok(judgmentEvent);
const targetReplay = replayApi.replay(store, { runId: openedEvent.runId });
const proposal = hogRouteApi.proposeBlockedRoute(
  graph,
  { cursor: sourceCursor, programLocusRef: interleavedCCall.programLocusRef },
  interleavedCCall,
  judgmentEvent.payload.judgmentRef,
  targetReplay,
  interleavedCCall.transitionContractRef,
  stoppedProgresses.map((progress) => progress.progressRef),
);
assert.equal(proposal.kind, "traversal_route_candidate", JSON.stringify(proposal));
const route = routeApi.admitRoute(
  store,
  executionBasis,
  graph,
  sourceCursor,
  null,
  targetReplay,
  proposal,
  {
    eventTime: input.eventTime,
    correlationId: "correlation://t287/r3/fresh-process-route",
    causationEventRefs: [],
  },
  {
    cCall: interleavedCCall,
    resultRef: judgmentEvent.payload.resultRef,
    judgmentRef: judgmentEvent.payload.judgmentRef,
    judgmentEventRef: judgmentEvent.eventId,
    reasonRef: judgmentEvent.payload.reasonRef,
    stoppedProgresses,
  },
  { terminalizeRun: false },
);
assert.equal(route.kind, "admitted_traversal_route", JSON.stringify(route));
const admittedRouteEvent = store.readAll().find((event) =>
  event.eventId === route.admissionEventRef);
assert.ok(admittedRouteEvent);
store.closeDurableLog();
process.stdout.write(`${JSON.stringify({
  pid: process.pid,
  cCallProjectionEqual: true,
  unrelatedBasisEventRef: unrelatedBasisEvent.eventId,
  unrelatedRunEventRef: unrelatedRunEvent.eventId,
  consumedAvailabilityRefs: route.consumedAvailabilityRefs,
  causationEventRefs: admittedRouteEvent.causationEventRefs,
})}\n`);
