// Validates: T-120
// Validates: REQ-R-ABG3-EVENTS-018
// Validates: REQ-R-ABG3-PROJECTION-013

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitRuntimeEventCalculusAxioms,
  constructBasisAdmittedEvent,
  constructFrameOpenedEvent,
  constructGraphCallOpenedEvent,
  constructRuntimeFluent,
  constructRuntimeFluentPattern,
  constructVectorClosedEvent,
  constructVectorClosedRuntimeFluent,
  constructVectorEvaluatedEvent,
  constructVectorRuntimeFluent,
  constructVectorTraversalPlannedEvent,
  deriveRuntimeAggregateProjection,
  deriveRuntimeEventCalculusProjection,
  eventCalculusEffectsForEvent,
  holdsAt
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function resetEvent(input = {}) {
  return Object.freeze({
    kind: "reset",
    scope: input.scope ?? "workspace",
    actor: "operator://t120",
    reason: input.reason ?? "t120 reset",
    workflowVersion: "3.5.0-rc.2",
    runId: input.runId ?? "run://m03-iteration",
    workKey: input.workKey ?? null,
    edge: input.edge ?? null
  });
}

function coreEventsForVector(basis, vectorIndex) {
  return Object.freeze([
    constructBasisAdmittedEvent(basis),
    constructGraphCallOpenedEvent(basis),
    constructFrameOpenedEvent(basis),
    constructVectorTraversalPlannedEvent({ basis, vectorIndex }),
    constructVectorEvaluatedEvent({ basis, vectorIndex, status: "accepted" }),
    constructVectorClosedEvent({ basis, vectorIndex, closureKind: "accepted" })
  ]);
}

test("T-120 derives HoldsAt from declared Initiates law and matches aggregate vector closure", () => {
  const basis = buildThreeStageBasis();
  const events = coreEventsForVector(basis, 0);
  const ecProjection = deriveRuntimeEventCalculusProjection({ basis, events });
  const aggregate = deriveRuntimeAggregateProjection(basis, events);

  assert.deepEqual(aggregate.closedVectorIndexes, [0]);
  assert.equal(
    holdsAt(
      ecProjection,
      constructRuntimeFluent({
        name: "graph_call_open",
        scope: "graph_call",
        basisId: basis.id,
        graphFunctionId: basis.graphFunction.id,
        graphCallId: aggregate.graphCallId,
        runId: basis.runId,
        workKey: basis.workKey
      })
    ),
    true
  );
  assert.equal(
    holdsAt(
      ecProjection,
      constructRuntimeFluent({
        name: "frame_open",
        scope: "frame",
        basisId: basis.id,
        graphFunctionId: basis.graphFunction.id,
        graphCallId: aggregate.graphCallId,
        frameId: aggregate.frameId,
        runId: basis.runId,
        workKey: basis.workKey
      })
    ),
    true
  );
  assert.equal(
    holdsAt(
      ecProjection,
      constructVectorClosedRuntimeFluent({
        basis,
        vectorIndex: 0,
        graphCallId: aggregate.graphCallId,
        frameId: aggregate.frameId
      })
    ),
    true
  );
  assert.equal(
    holdsAt(
      ecProjection,
      constructVectorRuntimeFluent({
        basis,
        name: "vector_traversal_planned",
        vectorIndex: 0,
        graphCallId: aggregate.graphCallId,
        frameId: aggregate.frameId
      })
    ),
    true
  );
});

test("T-120 preserves inertia and clips only the reset scope", () => {
  const basis = buildThreeStageBasis();
  const vector0Events = coreEventsForVector(basis, 0);
  const vector1Events = Object.freeze([
    constructVectorTraversalPlannedEvent({ basis, vectorIndex: 1 }),
    constructVectorEvaluatedEvent({ basis, vectorIndex: 1, status: "accepted" }),
    constructVectorClosedEvent({ basis, vectorIndex: 1, closureKind: "accepted" })
  ]);
  const projection = deriveRuntimeEventCalculusProjection({
    basis,
    events: Object.freeze([
      ...vector0Events,
      ...vector1Events,
      resetEvent({
        scope: "edge",
        runId: basis.runId,
        workKey: basis.workKey,
        edge: basis.graph.vectors[0].name
      })
    ])
  });

  assert.equal(
    holdsAt(
      projection,
      constructVectorClosedRuntimeFluent({
        basis,
        vectorIndex: 0,
        graphCallId: constructGraphCallOpenedEvent(basis).graphCallId,
        frameId: constructFrameOpenedEvent(basis).frameId
      })
    ),
    false
  );
  assert.equal(
    holdsAt(
      projection,
      constructVectorClosedRuntimeFluent({
        basis,
        vectorIndex: 1,
        graphCallId: constructGraphCallOpenedEvent(basis).graphCallId,
        frameId: constructFrameOpenedEvent(basis).frameId
      })
    ),
    true
  );
});

test("T-120 rejects undeclared event kinds for EC replay", () => {
  assert.throws(
    () =>
      eventCalculusEffectsForEvent({
        event: Object.freeze({ kind: "actor_process_started" })
      }),
    /No Event Calculus axiom declared/
  );
});

test("T-120 rejects malformed fluents and duplicate or contradictory EC law", () => {
  assert.throws(
    () => constructRuntimeFluentPattern({ name: "not_a_runtime_fluent" }),
    /Unsupported RuntimeFluent.name/
  );

  assert.throws(
    () =>
      admitRuntimeEventCalculusAxioms([
        {
          kind: "event_calculus_axiom",
          eventKind: "basis_admitted",
          deriveEffects: () => ({
            initiates: [],
            terminates: [],
            clips: [],
            declips: []
          })
        },
        {
          kind: "event_calculus_axiom",
          eventKind: "basis_admitted",
          deriveEffects: () => ({
            initiates: [],
            terminates: [],
            clips: [],
            declips: []
          })
        }
      ]),
    /Duplicate Event Calculus axiom/
  );

  const basis = buildThreeStageBasis();
  const fluent = constructRuntimeFluent({
    name: "basis_admitted",
    scope: "basis",
    basisId: basis.id,
    graphFunctionId: basis.graphFunction.id,
    runId: basis.runId,
    workKey: basis.workKey
  });
  assert.throws(
    () =>
      eventCalculusEffectsForEvent({
        event: constructBasisAdmittedEvent(basis),
        axioms: [
          {
            kind: "event_calculus_axiom",
            eventKind: "basis_admitted",
            deriveEffects: () => ({
              initiates: [fluent],
              terminates: [fluent],
              clips: [],
              declips: []
            })
          }
        ]
      }),
    /cannot both initiate and terminate/
  );
});
