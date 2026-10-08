import assert from "node:assert/strict";
import test from "node:test";

import {
  projectActorProcessLifecycle,
} from "../../build/code/src/abg/actor_process.js";
import {
  projectCCallPhase,
} from "../../build/code/src/abg/c_call.js";
import {
  deriveRuntimeEventCalculusProjection,
  holdsAt,
  constructRuntimeFluent,
} from "../../build/code/src/abg/event_calculus.js";
import {
  selectValidatedRuntimeEventPrefix,
} from "../../build/code/src/abg/event_prefix.js";
import { deepFreeze } from "../../build/code/src/shared/immutable.js";

function event(kind, ordinal, aggregateType, aggregateId, parentAggregateId, payload) {
  return Object.freeze({
    kind,
    eventTime: "2026-08-04T00:00:00.000Z",
    aggregateType,
    aggregateId,
    parentAggregateId,
    causationEventRefs: Object.freeze([]),
    correlationId: "correlation://t287/cleanup",
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: "basis://t287/cleanup",
    runId: "run://t287/cleanup",
    graphCallId: "graph-call://t287/cleanup",
    frameId: "frame://t287/cleanup",
    payload: Object.freeze(payload),
    eventId: `event://t287/cleanup/${ordinal}`,
    admissionOrdinal: ordinal,
    payloadDigest: `sha256:${"0".repeat(64)}`,
  });
}

function prefix(rows) {
  return selectValidatedRuntimeEventPrefix(Object.freeze(rows), {
    runId: "run://t287/cleanup",
  });
}

const actorRef = "actor-invocation://t287/cleanup";
const processRef = "process://t287/cleanup";
const cCallRef = "c-call:sha256:t287-atomic-open";

test("CCall opening is one atomic open-and-fibre transition", () => {
  const opened = event("c_call_opened", 1, "c_call", cCallRef, "frame://t287/cleanup", {
    cCallRef,
  });
  assert.throws(
    () => projectCCallPhase(prefix([opened]), cCallRef),
    /atomic open\/fibre pair/,
  );
  const fibre = Object.freeze({
    ...event("c_call_fibre_selected", 2, "c_call", cCallRef, "frame://t287/cleanup", {
      cCallRef,
    }),
    causationEventRefs: Object.freeze([opened.eventId]),
  });
  assert.equal(
    projectCCallPhase(prefix([opened, fibre]), cCallRef).phase,
    "selected_no_evidence",
  );
});

test("timeout and termination-unconfirmed never prove a started process absent", () => {
  const selected = prefix([
    event("actor_process_started", 1, "process", processRef, actorRef, {
      actorInvocationRef: actorRef,
      processRef,
    }),
    event("actor_process_timeout_observed", 2, "process", processRef, actorRef, {
      actorInvocationRef: actorRef,
      processRef,
    }),
    event("actor_process_termination_unconfirmed", 3, "process", processRef, actorRef, {
      actorInvocationRef: actorRef,
      processRef,
    }),
    event("run_stopped", 4, "run", "run://t287/cleanup", null, {}),
  ]);
  const calculus = deriveRuntimeEventCalculusProjection(selected);
  assert.equal(holdsAt(calculus, constructRuntimeFluent({
    name: "actor_process_live",
    identity: processRef,
  })), true);
  assert.deepEqual(projectActorProcessLifecycle(selected, actorRef), {
    kind: "actor_process_lifecycle_projection",
    actorInvocationRef: actorRef,
    processRef,
    processTerminalEventRef: null,
    processTerminalKind: null,
    actorTerminalEventRef: null,
    processLive: true,
    cleanupPending: true,
    terminationUnconfirmed: true,
    cleanupDisposition: "termination_unconfirmed",
  });
});

test("preterminal Process exit is the single cleanup confirmation", () => {
  const selected = prefix([
    event("actor_process_started", 1, "process", processRef, actorRef, {
      actorInvocationRef: actorRef,
      processRef,
    }),
    event("actor_process_exited", 2, "process", processRef, actorRef, {
      actorInvocationRef: actorRef,
      processRef,
    }),
  ]);
  const projected = projectActorProcessLifecycle(selected, actorRef);
  assert.equal(projected.processTerminalKind, "actor_process_exited");
  assert.equal(projected.processLive, false);
  assert.equal(projected.cleanupPending, true);
  assert.equal(projected.cleanupDisposition, "pending");
});

test("duplicate Process terminality and Actor terminal before confirmation fail closed", () => {
  assert.throws(() => projectActorProcessLifecycle(prefix([
    event("actor_process_started", 1, "process", processRef, actorRef, {}),
    event("actor_process_exited", 2, "process", processRef, actorRef, {}),
    event("actor_process_exited", 3, "process", processRef, actorRef, {}),
  ]), actorRef), /single terminal cardinality/);
  assert.throws(() => projectActorProcessLifecycle(prefix([
    event("actor_process_started", 1, "process", processRef, actorRef, {}),
    event("actor_invocation_failed", 2, "actor_invocation", actorRef, "c-call://t287", {}),
  ]), actorRef), /requires confirmed Process terminality/);
});

test('cold leader exit preserves unknown group cleanup across ordinary Run failure', () => {
  for (const order of ['exit-first', 'unconfirmed-first']) {
    const rows = [event('actor_process_started', 1, 'process', processRef, actorRef,
      { actorInvocationRef: actorRef, processRef })];
    const kinds = order === 'exit-first' ? ['actor_process_exited', 'actor_process_termination_unconfirmed'] :
      ['actor_process_termination_unconfirmed', 'actor_process_exited'];
    for (const kind of kinds) rows.push(event(kind, rows.length + 1, 'process', processRef, actorRef,
      { actorInvocationRef: actorRef, processRef, ...(kind === 'actor_process_exited' ? { status: 0, signal: null } : {}) }));
    rows.push(event('runtime_failure_observed', rows.length + 1, 'run', 'run://t287/cleanup', null, {}));
    const cold = prefix(deepFreeze(JSON.parse(JSON.stringify(rows)))), calculus = deriveRuntimeEventCalculusProjection(cold);
    const projected = projectActorProcessLifecycle(cold, actorRef);
    assert.equal(projected.processTerminalKind, 'actor_process_exited');
    assert.equal(projected.processLive, false, 'leader exit remains the true leader fact');
    assert.equal(projected.cleanupDisposition, 'termination_unconfirmed');
    for (const name of ['actor_cleanup_live', 'actor_cleanup_pending'])
      assert.equal(holdsAt(calculus, constructRuntimeFluent({ name, identity: processRef })), true, order);
    const terminal = event('actor_invocation_failed', rows.length + 1, 'actor_invocation', actorRef, cCallRef,
      { actorInvocationRef: actorRef, processRef });
    const closed = deriveRuntimeEventCalculusProjection(prefix([...rows, terminal]));
    for (const name of ['actor_cleanup_live', 'actor_cleanup_pending'])
      assert.equal(holdsAt(closed, constructRuntimeFluent({ name, identity: processRef })), false);
  }
});
