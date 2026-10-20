#!/usr/bin/env node

import assert from "node:assert/strict";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

let bytes = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) bytes += chunk;
const input = JSON.parse(bytes);

assert.notEqual(process.pid, input.originProcessId);

const moduleUrl = (relativePath) => pathToFileURL(join(
  input.installedRoot,
  "build/code/src",
  relativePath,
)).href;

const [
  eventStoreApi,
  eventPrefixApi,
  traversalCursorApi,
  retryApi,
  routeApi,
  replayApi,
  materializeApi,
  digestApi,
  immutableApi,
] = await Promise.all([
  import(moduleUrl("abg/event_store.js")),
  import(moduleUrl("abg/event_prefix.js")),
  import(moduleUrl("abg/traversal_cursor.js")),
  import(moduleUrl("abg/retry.js")),
  import(moduleUrl("abg/traversal_route.js")),
  import(moduleUrl("abg/replay.js")),
  import(moduleUrl("gtl/materialize.js")),
  import(moduleUrl("shared/digests.js")),
  import(moduleUrl("shared/immutable.js")),
]);

const reopened = eventStoreApi.reopenEventStore(input.reopenAuthority);
assert.equal(
  reopened.kind,
  "reopened_event_store_context",
  JSON.stringify(reopened),
);
assert.deepEqual(reopened.prefix, input.prefix);

try {
  const events = reopened.store.readAll();
  const authorityPrefix = eventPrefixApi.selectValidatedRuntimeEventPrefix(
    events,
  );
  const prefix = eventPrefixApi.selectValidatedRuntimeEventPrefix(events, {
    runId: input.runId,
  });
  const scopedRunHasGlobalOrdinalGap = prefix.events.some(
    (event, index) => event.admissionOrdinal !== index + 1,
  );
  assert.equal(
    scopedRunHasGlobalOrdinalGap,
    true,
    "PID-2 retains the real Run view's global admission-ordinal gap",
  );
  const authorityEventRefs = new Set(authorityPrefix.events.map((event) =>
    event.eventId
  ));
  const runEventRefs = new Set(prefix.events.map((event) => event.eventId));
  for (const eventRef of input.targetInvocationEventRefs) {
    assert.equal(
      runEventRefs.has(eventRef),
      true,
      "PID-2 target Run retains its own invocation owner pair",
    );
  }
  for (const eventRef of input.unrelatedInvocationEventRefs) {
    assert.equal(
      authorityEventRefs.has(eventRef),
      true,
      "PID-2 full authority retains the unrelated invocation owner pair",
    );
    assert.equal(
      runEventRefs.has(eventRef),
      false,
      "PID-2 target Run excludes the unrelated invocation owner pair",
    );
  }
  const unrelatedOrdinals = authorityPrefix.events
    .filter((event) => input.unrelatedInvocationEventRefs.includes(
      event.eventId,
    ))
    .map((event) => event.admissionOrdinal);
  assert.equal(unrelatedOrdinals.length, 2);
  const lastUnrelatedOrdinal = Math.max(...unrelatedOrdinals);
  const postUnrelatedRunIndex = prefix.events.findIndex((event) =>
    event.admissionOrdinal > lastUnrelatedOrdinal
  );
  const postUnrelatedRunEvent = prefix.events[postUnrelatedRunIndex];
  const preGapRunEvent = prefix.events[postUnrelatedRunIndex - 1];
  assert.ok(postUnrelatedRunEvent);
  assert.ok(preGapRunEvent);
  assert.ok(postUnrelatedRunEvent.admissionOrdinal > lastUnrelatedOrdinal);
  assert.ok(
    postUnrelatedRunEvent.admissionOrdinal - preGapRunEvent.admissionOrdinal >
      1,
  );
  const globalOrdinalGap = {
    precedingRunEventRef: preGapRunEvent.eventId,
    precedingRunOrdinal: preGapRunEvent.admissionOrdinal,
    excludedEventRefs: input.unrelatedInvocationEventRefs,
    excludedOrdinals: unrelatedOrdinals,
    followingRunEventRef: postUnrelatedRunEvent.eventId,
    followingRunOrdinal: postUnrelatedRunEvent.admissionOrdinal,
  };
  const graph = materializeApi.rehydrateMaterializedGtlGraph(input.graph);
  assert.ok(graph, "PID-2 rehydrates the exact materialized graph");
  immutableApi.deepFreeze(graph);
  const graphFunction = immutableApi.deepFreeze(input.graphFunction);
  assert.equal(graph.graphFunctionRef, graphFunction.name);
  assert.equal(
    graph.graphFunctionDigest,
    digestApi.sha256Canonical(graphFunction),
  );
  const basisMatches = events.filter((event) =>
    event.kind === "basis_admitted" &&
    event.basisId === input.executionBasisRef &&
    event.payload.basisRef === input.executionBasisRef
  );
  assert.equal(basisMatches.length, 1);
  const basisEvent = basisMatches[0];
  assert.equal(basisEvent.payload.graphRef, graph.materializationRef);
  assert.equal(basisEvent.payload.graphDigest, graph.materializationDigest);
  assert.equal(basisEvent.payload.graphFunctionRef, graphFunction.name);
  assert.equal(
    basisEvent.payload.graphFunctionDigest,
    digestApi.sha256Canonical(graphFunction),
  );

  const completed = events.filter((event) =>
    event.kind === "retry_progress_recorded" &&
    event.runId === input.runId &&
    event.payload.progressClass === "completed" &&
    event.payload.completionClass === "fh_resume_success"
  );
  assert.equal(completed.length, 2);
  assert.deepEqual(
    completed.map((event) => event.payload.completedRetryDepth),
    [2, 1],
  );
  assert.deepEqual(
    completed.map((event) => event.payload.predecessorProgressRef),
    [null, completed[0].payload.progressRef],
  );
  assert.equal(
    new Set(completed.map((event) =>
      event.payload.completionWitnessEventRef)).size,
    1,
  );
  assert.equal(
    completed.every((event) =>
      event.payload.completionWitnessEventRef ===
        input.completionWitnessEventRef),
    true,
  );

  const resumeMatches = events.filter((event) =>
    event.kind === "fh_interaction_resume_admitted" &&
    event.eventId === completed[0].payload.completionWitnessEventRef &&
    event.runId === input.runId
  );
  assert.equal(resumeMatches.length, 1);
  const resume = resumeMatches[0];
  const openedMatches = events.filter((event) =>
    event.kind === "fh_interaction_opened" &&
    event.aggregateId === resume.aggregateId &&
    event.runId === input.runId
  );
  assert.equal(openedMatches.length, 1);
  const opened = openedMatches[0];
  const heldCursor = immutableApi.deepFreeze(opened.payload.heldCursor);
  assert.equal(
    traversalCursorApi.isTraversalCursorCandidate(heldCursor),
    true,
  );
  assert.equal(heldCursor.cursorRef, opened.payload.heldCursorRef);
  assert.equal(heldCursor.cursorDigest, opened.payload.heldCursorDigest);

  const successorBody = {
    programRef: heldCursor.programRef,
    executionBasisRef: heldCursor.executionBasisRef,
    traversalScopeRef: heldCursor.traversalScopeRef,
    runId: heldCursor.runId,
    graphCallId: heldCursor.graphCallId,
    frameId: heldCursor.frameId,
    graphRef: heldCursor.graphRef,
    inputRef: resume.payload.successorInputRef,
    inputDigest: resume.payload.successorInputDigest,
    currentNodeRef: heldCursor.currentNodeRef,
    position: heldCursor.position,
    termPath: heldCursor.termPath,
    taskOrdinal: heldCursor.taskOrdinal,
    attempt: heldCursor.attempt,
    retryPath: heldCursor.retryPath,
  };
  const successorDigest = digestApi.sha256Canonical(successorBody);
  const successorCursor = immutableApi.deepFreeze({
    kind: "traversal_cursor",
    schemaVersion: "5.0.0",
    cursorRef:
      `traversal-cursor://abiogenesis/${successorDigest.slice("sha256:".length)}`,
    cursorDigest: successorDigest,
    ...successorBody,
  });
  assert.equal(successorCursor.executionBasisRef, input.executionBasisRef);
  assert.equal(successorCursor.cursorRef, resume.payload.successorCursorRef);
  assert.equal(successorCursor.cursorDigest, resume.payload.successorCursorDigest);
  assert.notEqual(successorCursor.cursorRef, heldCursor.cursorRef);
  assert.notEqual(successorCursor.inputRef, heldCursor.inputRef);
  assert.notEqual(successorCursor.inputDigest, heldCursor.inputDigest);
  assert.equal(
    traversalCursorApi.isTraversalCursorCandidate(successorCursor),
    true,
  );
  assert.equal(
    traversalCursorApi.isInteractionResumeCursorSuccessorAtPrefix(
      prefix,
      heldCursor,
      {
        inputRef: resume.payload.successorInputRef,
        inputDigest: resume.payload.successorInputDigest,
      },
      successorCursor,
    ),
    true,
  );
  assert.equal(
    traversalCursorApi.hasAdmittedTraversalCursorAtPrefix(
      prefix,
      successorCursor,
    ),
    true,
  );

  const progressRefs = completed.map((event) => event.payload.progressRef);
  const routeMatches = events.filter((event) =>
    event.kind === "traversal_route_admitted" &&
    event.runId === input.runId &&
    event.payload.sourceCursorRef === successorCursor.cursorRef &&
    event.payload.sourceCursorDigest === successorCursor.cursorDigest &&
    progressRefs.every((progressRef) =>
      event.payload.consumedAvailabilityRefs.includes(progressRef))
  );
  assert.equal(routeMatches.length, 1);
  const routeEvent = routeMatches[0];
  assert.equal(routeEvent.eventId, input.routeEventRef);
  assert.ok(
    routeEvent.payload.routeKind === "advance" ||
      routeEvent.payload.routeKind === "terminal",
  );

  const historicalRoute = routeApi.projectHistoricalTraversalRouteAtPrefix(
    prefix,
    routeEvent.eventId,
    authorityPrefix,
  );
  assert.ok(historicalRoute, "PID-2 projects the exact historical exit route");
  const replay = replayApi.replayValidatedRuntimeEventPrefix(
    prefix,
    authorityPrefix,
  );
  const replayRouteMatches = replay.routes.filter((candidate) =>
    candidate.admissionEventRef === routeEvent.eventId
  );
  assert.equal(replayRouteMatches.length, 1);
  const replayRoute = replayRouteMatches[0];
  const routeFieldNames = [
    "routeRef",
    "routeDigest",
    "routeKind",
    "declarationRef",
    "declarationDigest",
    "sourceCursorRef",
    "sourceCursorDigest",
    "targetCursorRef",
    "targetCursorDigest",
    "cCallRef",
    "judgmentRef",
    "consumedAvailabilityRefs",
    "contractRef",
    "replayStateDigest",
    "admissionEventRef",
  ];
  for (const fieldName of routeFieldNames) {
    assert.deepEqual(historicalRoute[fieldName], replayRoute[fieldName]);
  }

  const frontiers = completed.map((progressEvent) => {
    const depth = progressEvent.payload.completedRetryDepth;
    const frontier = retryApi.projectDeclaredCRetryFrontier(
      prefix,
      graph,
      successorCursor,
      graphFunction,
      depth,
      authorityPrefix,
    );
    assert.equal(frontier?.state, "progress_consumed");
    assert.equal(
      frontier.consumed.progress.progressRef,
      progressEvent.payload.progressRef,
    );
    assert.equal(
      frontier.consumed.progress.progressDigest,
      progressEvent.payload.progressDigest,
    );
    assert.equal(frontier.consumed.progressEventRef, progressEvent.eventId);
    assert.equal(
      frontier.consumed.consumption.kind,
      "progress_consumed_by_exit",
    );
    assert.equal(
      frontier.consumed.consumption.route.admissionEventRef,
      historicalRoute.admissionEventRef,
    );
    assert.equal(
      frontier.consumed.consumption.route.routeRef,
      historicalRoute.routeRef,
    );
    assert.equal(
      frontier.consumed.consumption.route.routeDigest,
      historicalRoute.routeDigest,
    );
    assert.equal(
      frontier.consumed.progress.sourceCursorRef,
      successorCursor.cursorRef,
    );
    assert.equal(
      frontier.consumed.progress.sourceCursorDigest,
      successorCursor.cursorDigest,
    );
    assert.equal(
      frontier.consumed.progress.targetCursorRef,
      historicalRoute.targetCursorRef,
    );
    assert.equal(
      frontier.consumed.progress.targetCursorDigest,
      historicalRoute.targetCursorDigest,
    );
    return {
      depth,
      state: frontier.state,
      progressRef: frontier.consumed.progress.progressRef,
      progressDigest: frontier.consumed.progress.progressDigest,
      progressEventRef: frontier.consumed.progressEventRef,
      routeRef: frontier.consumed.consumption.route.routeRef,
      routeDigest: frontier.consumed.consumption.route.routeDigest,
      routeEventRef: frontier.consumed.consumption.route.admissionEventRef,
    };
  });

  const routeSummary = (route) => ({
    routeRef: route.routeRef,
    routeDigest: route.routeDigest,
    routeKind: route.routeKind,
    sourceCursorRef: route.sourceCursorRef,
    sourceCursorDigest: route.sourceCursorDigest,
    targetCursorRef: route.targetCursorRef,
    targetCursorDigest: route.targetCursorDigest,
    consumedAvailabilityRefs: route.consumedAvailabilityRefs,
    admissionEventRef: route.admissionEventRef,
  });
  process.stdout.write(JSON.stringify({
    kind: "t287_tv5_success_reconstruction_observation",
    processId: process.pid,
    eventLogDigest: reopened.eventLogDigest,
    historicalEventCount: reopened.historicalEventCount,
    scopedRunHasGlobalOrdinalGap,
    targetInvocationRetained: true,
    unrelatedInvocationExcluded: true,
    globalOrdinalGap,
    replayDigest: replay.replayDigest,
    heldCursor: {
      cursorRef: heldCursor.cursorRef,
      cursorDigest: heldCursor.cursorDigest,
      inputRef: heldCursor.inputRef,
      inputDigest: heldCursor.inputDigest,
    },
    successorCursor: {
      cursorRef: successorCursor.cursorRef,
      cursorDigest: successorCursor.cursorDigest,
      inputRef: successorCursor.inputRef,
      inputDigest: successorCursor.inputDigest,
      currentNodeRef: successorCursor.currentNodeRef,
      termPath: successorCursor.termPath,
      retryPath: successorCursor.retryPath,
    },
    progresses: completed.map((event) => ({
      depth: event.payload.completedRetryDepth,
      eventRef: event.eventId,
      progressRef: event.payload.progressRef,
      progressDigest: event.payload.progressDigest,
      predecessorProgressRef: event.payload.predecessorProgressRef,
      sourceCursorRef: event.payload.sourceCursorRef,
      sourceCursorDigest: event.payload.sourceCursorDigest,
      targetCursorRef: event.payload.targetCursorRef,
      targetCursorDigest: event.payload.targetCursorDigest,
    })),
    frontiers,
    historicalRoute: routeSummary(historicalRoute),
    replayRoute: routeSummary(replayRoute),
  }));
} finally {
  reopened.store.closeDurableLog();
}
