import assert from "node:assert/strict";
import test from "node:test";

import {
  projectActorProcessLifecycle,
} from "../../build/code/src/abg/actor_process.js";
import {
  deriveRuntimeEventCalculusProjection,
  holdsAt,
  constructRuntimeFluent,
} from "../../build/code/src/abg/event_calculus.js";
import {
  selectValidatedRuntimeEventPrefix,
} from "../../build/code/src/abg/event_prefix.js";

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
