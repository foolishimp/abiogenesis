// Validates: REQ-R-ABG3-INTERPRET
// Validates: REQ-R-ABG3-EVENTS
// Validates: REQ-R-ABG3-CONVERGENCE
// Investigates: T-066

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructVectorClosedEvent,
  constructVectorEvaluatedEvent,
  deriveAdvancementTransition,
  deriveIterationAdvanceDecision,
  deriveRuntimeAggregateProjection,
  deriveTraversalStructureProbe,
  runtimeEventsForIterationDecision
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

test("T-066 control loop: start truth traverses, evaluates, closes, and iterates to convergence", () => {
  const basis = buildThreeStageBasis();
  const runtimeEvents = [];
  const traversedEdges = [];

  for (let step = 0; step < basis.graph.vectors.length; step += 1) {
    const projection = deriveRuntimeAggregateProjection(basis, runtimeEvents);
    const decision = deriveIterationAdvanceDecision(basis, projection);
    const transition = deriveAdvancementTransition(basis, runtimeEvents);
    const probe = deriveTraversalStructureProbe(basis, runtimeEvents);

    assert.equal(decision.kind, "advance_vector");
    assert.equal(transition.kind, "fp_dispatch");
    assert.equal(probe.currentVectorIndex, transition.vectorIndex);
    assert.equal(probe.currentVectorEvidence.edge, transition.edge);

    traversedEdges.push(transition.edge);
    runtimeEvents.push(
      ...runtimeEventsForIterationDecision(decision),
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

  const terminalProjection = deriveRuntimeAggregateProjection(basis, runtimeEvents);
  const terminalDecision = deriveIterationAdvanceDecision(basis, terminalProjection);
  const terminalTransition = deriveAdvancementTransition(basis, runtimeEvents);
  const terminalProbe = deriveTraversalStructureProbe(basis, runtimeEvents);
  runtimeEvents.push(...runtimeEventsForIterationDecision(terminalDecision));

  assert.deepStrictEqual(traversedEdges, [
    "input_set→requirements",
    "requirements→design",
    "design→code"
  ]);
  assert.equal(terminalDecision.kind, "converged");
  assert.equal(terminalTransition.kind, "terminal");
  assert.equal(terminalTransition.terminalKind, "converged");
  assert.equal(terminalProbe.structureKind, "terminal");
  assert.equal(terminalProbe.currentVectorEvidence, null);
  assert.deepStrictEqual(runtimeEvents.map((event) => event.kind), [
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
    "vector_evaluated",
    "vector_closed",
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
    "vector_evaluated",
    "vector_closed",
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
    "vector_evaluated",
    "vector_closed",
    "terminal_reached"
  ]);
});
