// Validates: T-121
// Validates: REQ-R-ABG3-EVENTS-018
// Validates: REQ-R-ABG3-PROJECTION-013

import test from "node:test";
import assert from "node:assert/strict";

import {
  RUNTIME_EVENT_CALCULUS_AXIOMS,
  constructRuntimeFluent,
  deriveRetryRepairDecision,
  deriveRuntimeAggregateProjection,
  deriveRuntimeEventCalculusProjection,
  holdsAt,
  runtimeEventsForRetryRepairDecision
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function emptyEffect() {
  return Object.freeze({
    initiates: Object.freeze([]),
    terminates: Object.freeze([]),
    clips: Object.freeze([]),
    declips: Object.freeze([])
  });
}

function replaceAxiom(eventKind, deriveEffects) {
  return Object.freeze(
    RUNTIME_EVENT_CALCULUS_AXIOMS.map((axiom) =>
      axiom.eventKind === eventKind
        ? Object.freeze({
            kind: "event_calculus_axiom",
            eventKind,
            deriveEffects
          })
        : axiom
    )
  );
}

function removeAxiom(eventKind) {
  return Object.freeze(
    RUNTIME_EVENT_CALCULUS_AXIOMS.filter(
      (axiom) => axiom.eventKind !== eventKind
    )
  );
}

function retryWithContinuation() {
  const basis = buildThreeStageBasis();
  const projection = deriveRuntimeAggregateProjection(basis, []);
  const decision = deriveRetryRepairDecision({
    basis,
    projection,
    failedVectorIndex: 0,
    priorManifestId: "manifest://t121/attempt-0",
    candidateManifestId: "manifest://t121/attempt-1",
    maxAttempts: 3,
    stationary: false,
    continuationRepair: {
      terminatedContinuationId: "continuation://t121/old",
      reopenedContinuationId: "continuation://t121/new"
    }
  });
  assert.equal(decision.kind, "retry_planned");
  return Object.freeze({
    basis,
    decision,
    events: runtimeEventsForRetryRepairDecision(decision)
  });
}

test("T-121 retry and continuation projection consume declared EC fluents", () => {
  const { basis, decision, events } = retryWithContinuation();
  const aggregate = deriveRuntimeAggregateProjection(basis, events);
  const eventCalculus = deriveRuntimeEventCalculusProjection({
    basis,
    events,
    undeclaredEventBehavior: "ignore"
  });
  const retryEvent = events.find((event) => event.kind === "retry_repair_planned");
  const reopenedEvent = events.find(
    (event) => event.kind === "continuation_reopened"
  );
  const terminatedEvent = events.find(
    (event) => event.kind === "continuation_terminated"
  );
  assert.notEqual(retryEvent, undefined);
  assert.notEqual(reopenedEvent, undefined);
  assert.notEqual(terminatedEvent, undefined);

  assert.deepEqual(aggregate.retryAttemptRunIds, [decision.attempt.runId]);
  assert.deepEqual(aggregate.retryAttemptManifestIds, [
    decision.attempt.manifestId
  ]);
  assert.deepEqual(aggregate.retryAttemptRefs.map((ref) => ref.vectorIndex), [
    0
  ]);
  assert.equal(
    holdsAt(
      eventCalculus,
      constructRuntimeFluent({
        name: "retry_repair_planned",
        scope: "vector",
        basisId: basis.id,
        graphFunctionId: basis.graphFunction.id,
        graphCallId: retryEvent.graphCallId,
        frameId: retryEvent.frameId,
        runId: basis.runId,
        workKey: basis.workKey,
        vectorIndex: retryEvent.vectorIndex,
        edge: retryEvent.edge
      })
    ),
    true
  );
  assert.equal(
    holdsAt(
      eventCalculus,
      constructRuntimeFluent({
        name: "continuation_terminated",
        scope: "continuation",
        basisId: basis.id,
        graphFunctionId: basis.graphFunction.id,
        graphCallId: terminatedEvent.graphCallId,
        frameId: terminatedEvent.frameId,
        runId: basis.runId,
        workKey: basis.workKey,
        vectorIndex: terminatedEvent.vectorIndex,
        edge: terminatedEvent.edge,
        continuationId: "continuation://t121/old",
        ref: decision.attempt.runId
      })
    ),
    true
  );
  assert.equal(
    holdsAt(
      eventCalculus,
      constructRuntimeFluent({
        name: "continuation_open",
        scope: "continuation",
        basisId: basis.id,
        graphFunctionId: basis.graphFunction.id,
        graphCallId: reopenedEvent.graphCallId,
        frameId: reopenedEvent.frameId,
        runId: basis.runId,
        workKey: basis.workKey,
        vectorIndex: reopenedEvent.vectorIndex,
        edge: reopenedEvent.edge,
        continuationId: "continuation://t121/new",
        ref: decision.attempt.runId
      })
    ),
    true
  );
});

test("T-121 projection rejects retry events with no declared EC axiom", () => {
  const { basis, events } = retryWithContinuation();
  assert.throws(
    () =>
      deriveRuntimeAggregateProjection(basis, events, {
        eventCalculusAxioms: removeAxiom("retry_repair_planned")
      }),
    /No Event Calculus axiom declared/
  );
});

test("T-121 projection rejects stale private retry transition law", () => {
  const { basis, events } = retryWithContinuation();
  assert.throws(
    () =>
      deriveRuntimeAggregateProjection(basis, events, {
        eventCalculusAxioms: replaceAxiom("retry_repair_planned", emptyEffect)
      }),
    /retry repair without declared Event Calculus law/
  );
});

test("T-121 projection rejects continuation EC effects with wrong scope", () => {
  const { basis, events } = retryWithContinuation();
  const wrongScopeAxioms = replaceAxiom(
    "continuation_reopened",
    (event, context) => {
      assert.notEqual(context.basis, undefined);
      return Object.freeze({
        initiates: Object.freeze([
          constructRuntimeFluent({
            name: "continuation_open",
            scope: "vector",
            basisId: event.basisId,
            graphFunctionId: context.basis.graphFunction.id,
            graphCallId: event.graphCallId,
            frameId: event.frameId,
            runId: context.basis.runId,
            workKey: context.basis.workKey,
            vectorIndex: event.vectorIndex,
            edge: event.edge,
            continuationId: event.continuationId,
            ref: event.causedByRetryRunId
          })
        ]),
        terminates: Object.freeze([]),
        clips: Object.freeze([]),
        declips: Object.freeze([])
      });
    }
  );

  assert.throws(
    () =>
      deriveRuntimeAggregateProjection(basis, events, {
        eventCalculusAxioms: wrongScopeAxioms
      }),
    /continuation reopen without declared Event Calculus law/
  );
});
