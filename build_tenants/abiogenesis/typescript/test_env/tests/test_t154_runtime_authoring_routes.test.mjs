// Validates: T-154
// Validates: REQ-R-ABG3-EVENTS
// Validates: REQ-R-ABG3-PROJECTION
// Validates: REQ-R-ABG3-CONTINUATION

import test from "node:test";
import assert from "node:assert/strict";

import {
  applyExplicitGraphVectorResumeCursor,
  applyGraphSpanReentryRoute,
  constructVectorClosedEvent,
  deriveIterationAdvanceDecision
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  assessmentFor,
  buildSchedule,
  dropped,
  fulfilledRow,
  gapRow,
  spanBySource
} from "./support/t103-graph-span-fixtures.mjs";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function collectSink() {
  const events = [];
  return {
    events,
    sink(event) {
      events.push(event);
    }
  };
}

test("T-154 explicit resume cursor advances target without synthetic prior closures", () => {
  const basis = buildThreeStageBasis({ runId: "run://t154/resume-cursor" });
  const collector = collectSink();

  const result = applyExplicitGraphVectorResumeCursor({
    basis,
    eventSink: collector.sink,
    targetVectorIndex: 2,
    reason: "downstream requested direct proof resume"
  });
  const decision = deriveIterationAdvanceDecision(basis, result.projection);

  assert.deepEqual(
    result.emittedEvents.map((event) => event.kind),
    ["basis_admitted", "graph_vector_resume_cursor_applied"]
  );
  assert.equal(result.projection.nextVectorIndex, 2);
  assert.deepEqual(result.projection.closedVectorIndexes, []);
  assert.equal(decision.kind, "advance_vector");
  assert.equal(decision.vectorIndex, 2);
  assert.equal(result.transitionRef, result.cursorEvent.resumeCursorRef);
  assert.equal(
    collector.events.filter((event) => event.kind === "vector_closed").length,
    0
  );
});

test("T-154 explicit resume cursor rejects out-of-range target", () => {
  const basis = buildThreeStageBasis({ runId: "run://t154/resume-reject" });
  const collector = collectSink();

  assert.throws(
    () =>
      applyExplicitGraphVectorResumeCursor({
        basis,
        eventSink: collector.sink,
        targetVectorIndex: 5,
        reason: "invalid target"
      }),
    /outside graph vector range/
  );
  assert.deepEqual(collector.events, []);
});

test("T-154 graph-span route authors foldback and reentry events for downstream-shaped assessment candidates", () => {
  const { basis, schedule } = buildSchedule({
    runId: "run://t154/graph-span-route"
  });
  const assessments = [
    assessmentFor({
      basis,
      span: spanBySource(schedule, 2),
      assessmentId: "assessment://t154/c-d/close",
      rows: [fulfilledRow("C-REQ-1")]
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 1),
      assessmentId: "assessment://t154/b-d/gap",
      rows: [gapRow("B-REQ-1", [dropped(1, 2)])]
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 0),
      assessmentId: "assessment://t154/a-d/close",
      rows: [fulfilledRow("A-REQ-1", ["evidence://A-REQ-1/terminal"])]
    })
  ];
  const runtimeEvents = [
    constructVectorClosedEvent({ basis, vectorIndex: 0, closureKind: "assessed" }),
    constructVectorClosedEvent({ basis, vectorIndex: 1, closureKind: "assessed" }),
    constructVectorClosedEvent({ basis, vectorIndex: 2, closureKind: "assessed" })
  ];
  const collector = collectSink();

  const result = applyGraphSpanReentryRoute({
    basis,
    runtimeEvents,
    eventSink: collector.sink,
    terminalVectorIndex: 2,
    assessments
  });

  assert.deepEqual(
    result.emittedEvents.map((event) => event.kind),
    [
      "basis_admitted",
      "graph_span_evaluation_scheduled",
      "graph_span_assessed",
      "graph_span_assessed",
      "graph_span_assessed",
      "graph_span_foldback_evaluated",
      "graph_reentry_planned",
      "graph_reentry_applied"
    ]
  );
  assert.equal(result.foldback.decision, "reenter_at_vector");
  assert.equal(result.frontier.decision, "reenter");
  assert.ok(result.plan);
  assert.equal(result.plan.targetVectorIndex, 1);
  assert.equal(result.transition.kind, "reenter_graph_vector");
  assert.equal(result.transition.vectorIndex, 1);
  assert.equal(result.transitionRef, result.plan.planRef);
  assert.equal(result.projection.nextVectorIndex, 1);
  assert.deepEqual(result.projection.closedVectorIndexes, [0]);
  assert.equal(
    collector.events.filter((event) => event.kind === "graph_reentry_applied").length,
    1
  );
});
