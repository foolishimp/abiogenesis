// Validates: REQ-R-ABG3-INTERPRET
// Validates: REQ-R-ABG3-EVENTS
// Validates: REQ-R-ABG3-GRAPHCALL
// Validates: REQ-R-ABG3-FRAME

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructVectorClosedEvent,
  constructVectorEvaluatedEvent,
  deriveAdvancementTransition,
  deriveRuntimeAggregateProjection,
  dispatchRequestsForTransition,
  emit,
  runtimeEventsForIterationDecision,
  deriveIterationAdvanceDecision
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

test("M03 iteration integration: composed graph function advances beyond first vector from replay-derived events", () => {
  const basis = buildThreeStageBasis();
  const runtimeEvents = [];
  const emittedKinds = [];
  const observedEdges = [];

  for (let index = 0; index < basis.graph.vectors.length; index += 1) {
    const transition = deriveAdvancementTransition(basis, runtimeEvents);
    const projection = deriveRuntimeAggregateProjection(basis, runtimeEvents);
    const decision = deriveIterationAdvanceDecision(basis, projection);
    const dispatchRequest = dispatchRequestsForTransition(transition)[0];

    assert.equal(transition.kind, "fp_dispatch");
    assert.equal(decision.kind, "advance_vector");
    assert.equal(dispatchRequest.expectedEdge, decision.edge);

    observedEdges.push(dispatchRequest.expectedEdge);
    runtimeEvents.push(
      ...emit(runtimeEventsForIterationDecision(decision), (event) => {
        emittedKinds.push(event.kind);
      }),
      constructVectorEvaluatedEvent({
        basis,
        vectorIndex: transition.vectorIndex,
        status: "accepted"
      }),
      constructVectorClosedEvent({
        basis,
        vectorIndex: transition.vectorIndex,
        closureKind: "assessed"
      })
    );
  }

  const finalTransition = deriveAdvancementTransition(basis, runtimeEvents);

  assert.deepStrictEqual(observedEdges, [
    "input_set→requirements",
    "requirements→design",
    "design→code"
  ]);
  assert.equal(finalTransition.kind, "terminal");
  assert.equal(finalTransition.terminalKind, "converged");
  assert.deepStrictEqual(
    emittedKinds.filter((kind) => kind === "vector_traversal_planned"),
    [
      "vector_traversal_planned",
      "vector_traversal_planned",
      "vector_traversal_planned"
    ]
  );
});
