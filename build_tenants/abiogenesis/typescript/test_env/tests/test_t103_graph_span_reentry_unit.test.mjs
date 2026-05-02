// Validates: T-103
// Validates: REQ-R-ABG3-EVENTS
// Validates: REQ-R-ABG3-PROJECTION
// Validates: REQ-R-ABG3-LINEAGE
// Validates: REQ-R-ABG3-CORRECTION

import test from "node:test";
import assert from "node:assert/strict";

import {
  assertRuntimeEvent,
  constructGraphReentryAppliedEvent,
  constructGraphReentryPlannedEvent,
  constructVectorClosedEvent,
  deriveAdvancementTransitionWithReentry,
  deriveGraphReentryFrontierProjection,
  deriveGraphReentryPlan,
  deriveIterationAdvanceDecision,
  deriveGraphSpanAssessmentsFromEvents,
  deriveGraphSpanFoldbackEvaluationFromEvents,
  deriveRuntimeAggregateProjection,
  foldGraphSpanAssessments
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  assessmentFor,
  buildSchedule,
  carried,
  constitutionalGapRow,
  dropped,
  fulfilledRow,
  gapRow,
  materializeEvents,
  spanBySource
} from "./support/t103-graph-span-fixtures.mjs";

test("T-103 derives endpoint span schedule C->D, B->D, A->D after terminal close", () => {
  const { schedule } = buildSchedule();

  assert.deepEqual(
    schedule.spanRefs.map((span) => span.sourceVectorIndex),
    [2, 1, 0]
  );
  assert.deepEqual(
    schedule.spanRefs.map((span) => span.coveredVectorIndexes),
    [[2], [1, 2], [0, 1, 2]]
  );
});

test("T-103 closes graph-span foldback when C->D, B->D, and A->D all fulfill", () => {
  const { basis, schedule } = buildSchedule();
  const assessments = [
    assessmentFor({
      basis,
      span: spanBySource(schedule, 2),
      assessmentId: "assessment://t103/c-d/close",
      rows: [fulfilledRow("C-REQ-1")]
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 1),
      assessmentId: "assessment://t103/b-d/close",
      rows: [fulfilledRow("B-REQ-1")]
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 0),
      assessmentId: "assessment://t103/a-d/close",
      rows: [fulfilledRow("A-REQ-1")]
    })
  ];
  const foldback = foldGraphSpanAssessments({
    basis,
    terminalVectorIndex: 2,
    schedule,
    assessments
  });
  const events = materializeEvents(basis, schedule, assessments, foldback);
  const replayedAssessments = deriveGraphSpanAssessmentsFromEvents({ basis, events });
  const replayedFoldback = deriveGraphSpanFoldbackEvaluationFromEvents({
    basis,
    schedule,
    events
  });
  const frontier = deriveGraphReentryFrontierProjection({ basis, events });

  assert.equal(foldback.decision, "close");
  assert.equal(replayedAssessments.length, 3);
  assert.equal(replayedFoldback.decision, "close");
  assert.equal(frontier.decision, "advance");
  assert.deepEqual(frontier.activeRows, []);
});

test("T-103 derives terminal C->D reentry from terminal span failure", () => {
  const { basis, schedule } = buildSchedule();
  const assessments = [
    assessmentFor({
      basis,
      span: spanBySource(schedule, 2),
      assessmentId: "assessment://t103/c-d/gap",
      rows: [gapRow("C-REQ-1")]
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 1),
      assessmentId: "assessment://t103/b-d/close",
      rows: [fulfilledRow("B-REQ-1")]
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 0),
      assessmentId: "assessment://t103/a-d/close",
      rows: [fulfilledRow("A-REQ-1")]
    })
  ];
  const foldback = foldGraphSpanAssessments({
    basis,
    terminalVectorIndex: 2,
    schedule,
    assessments
  });
  const events = materializeEvents(basis, schedule, assessments, foldback);
  const frontier = deriveGraphReentryFrontierProjection({ basis, events });
  const plan = deriveGraphReentryPlan({
    basis,
    runtimeProjection: deriveRuntimeAggregateProjection(basis, []),
    frontier
  });

  assert.ok(plan);
  assert.equal(foldback.decision, "retry_terminal_edge");
  assert.equal(frontier.decision, "reenter");
  assert.equal(frontier.activeTargetVectorIndex, 2);
  assert.equal(plan.targetVectorIndex, 2);
});

test("T-103 derives B->C reentry when B obligation is dropped during B->C", () => {
  const { basis, schedule } = buildSchedule();
  const assessments = [
    assessmentFor({
      basis,
      span: spanBySource(schedule, 2),
      assessmentId: "assessment://t103/c-d/close",
      rows: [fulfilledRow("C-REQ-1")]
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 1),
      assessmentId: "assessment://t103/b-d/gap",
      rows: [gapRow("B-REQ-1", [dropped(1, 2)])]
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 0),
      assessmentId: "assessment://t103/a-d/close",
      rows: [fulfilledRow("A-REQ-1")]
    })
  ];
  const foldback = foldGraphSpanAssessments({
    basis,
    terminalVectorIndex: 2,
    schedule,
    assessments
  });
  const events = materializeEvents(basis, schedule, assessments, foldback);
  const frontier = deriveGraphReentryFrontierProjection({ basis, events });
  const plan = deriveGraphReentryPlan({
    basis,
    runtimeProjection: deriveRuntimeAggregateProjection(basis, []),
    frontier
  });
  assert.ok(plan);
  const planned = constructGraphReentryPlannedEvent({ basis, plan });
  const applied = constructGraphReentryAppliedEvent({ basis, plan });
  assertRuntimeEvent(planned);
  assertRuntimeEvent(applied);
  const transition = deriveAdvancementTransitionWithReentry({
    basis,
    runtimeProjection: deriveRuntimeAggregateProjection(basis, [applied]),
    frontier
  });

  assert.equal(foldback.decision, "reenter_at_vector");
  assert.equal(frontier.decision, "reenter");
  assert.equal(frontier.activeTargetVectorIndex, 1);
  assert.equal(plan.targetVectorIndex, 1);
  assert.deepEqual(plan.shadowedVectorIndexes, [1, 2]);
  assert.equal(transition.kind, "reenter_graph_vector");
  assert.equal(transition.vectorIndex, 1);
});

test("T-103 applied reentry shadows prior downstream closures by replay", () => {
  const { basis, schedule } = buildSchedule();
  const assessments = [
    assessmentFor({
      basis,
      span: spanBySource(schedule, 2),
      assessmentId: "assessment://t103/c-d/close",
      rows: [fulfilledRow("C-REQ-1")]
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 1),
      assessmentId: "assessment://t103/b-d/gap",
      rows: [gapRow("B-REQ-1", [dropped(1, 2)])]
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 0),
      assessmentId: "assessment://t103/a-d/close",
      rows: [fulfilledRow("A-REQ-1")]
    })
  ];
  const foldback = foldGraphSpanAssessments({
    basis,
    terminalVectorIndex: 2,
    schedule,
    assessments
  });
  const frontier = deriveGraphReentryFrontierProjection({
    basis,
    events: materializeEvents(basis, schedule, assessments, foldback)
  });
  const plan = deriveGraphReentryPlan({
    basis,
    runtimeProjection: deriveRuntimeAggregateProjection(basis, []),
    frontier
  });
  assert.ok(plan);
  const applied = constructGraphReentryAppliedEvent({ basis, plan });
  const projection = deriveRuntimeAggregateProjection(basis, [
    constructVectorClosedEvent({ basis, vectorIndex: 0, closureKind: "assessed" }),
    constructVectorClosedEvent({ basis, vectorIndex: 1, closureKind: "assessed" }),
    constructVectorClosedEvent({ basis, vectorIndex: 2, closureKind: "assessed" }),
    applied
  ]);
  const decision = deriveIterationAdvanceDecision(basis, projection);

  assert.deepEqual(projection.closedVectorIndexes, [0]);
  assert.equal(projection.nextVectorIndex, 1);
  assert.equal(decision.kind, "advance_vector");
  assert.equal(decision.vectorIndex, 1);
});

test("T-103 chooses earliest implicated vector when root A obligation is dropped", () => {
  const { basis, schedule } = buildSchedule();
  const assessments = [
    assessmentFor({
      basis,
      span: spanBySource(schedule, 2),
      assessmentId: "assessment://t103/c-d/close",
      rows: [fulfilledRow("C-REQ-1")]
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 1),
      assessmentId: "assessment://t103/b-d/gap",
      rows: [gapRow("B-REQ-1", [dropped(1, 2)])]
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 0),
      assessmentId: "assessment://t103/a-d/gap",
      rows: [gapRow("A-REQ-1", [dropped(0, 1), carried(1, 2)])]
    })
  ];
  const foldback = foldGraphSpanAssessments({
    basis,
    terminalVectorIndex: 2,
    schedule,
    assessments
  });
  const events = materializeEvents(basis, schedule, assessments, foldback);
  const frontier = deriveGraphReentryFrontierProjection({ basis, events });

  assert.equal(foldback.decision, "reenter_at_vector");
  assert.deepEqual(foldback.reentryCandidateVectorIndexes, [0, 1]);
  assert.equal(foldback.earliestReentryVectorIndex, 0);
  assert.equal(frontier.activeTargetVectorIndex, 0);
});

test("T-103 ambiguous upstream span gap reprices instead of guessing a retry vector", () => {
  const { basis, schedule } = buildSchedule();
  const assessments = [
    assessmentFor({
      basis,
      span: spanBySource(schedule, 2),
      assessmentId: "assessment://t103/c-d/close",
      rows: [fulfilledRow("C-REQ-1")]
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 1),
      assessmentId: "assessment://t103/b-d/close",
      rows: [fulfilledRow("B-REQ-1")]
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 0),
      assessmentId: "assessment://t103/a-d/ambiguous",
      rows: [gapRow("A-REQ-1")]
    })
  ];
  const foldback = foldGraphSpanAssessments({
    basis,
    terminalVectorIndex: 2,
    schedule,
    assessments
  });
  const events = materializeEvents(basis, schedule, assessments, foldback);
  const frontier = deriveGraphReentryFrontierProjection({ basis, events });

  assert.equal(foldback.decision, "reprice_required");
  assert.equal(frontier.decision, "reprice");
});

test("T-103 carries intent_reprice as constitutional reentry separate from graph vector retry", () => {
  const { basis, schedule } = buildSchedule();
  const constitutionalReentry = {
    kind: "graph_constitutional_reentry",
    changeClass: "intent_reprice",
    reEntryPoint: "intent",
    targetGraphFunctionRef: "graph_function://derive_intent_surface",
    targetVectorIndex: null,
    routeContractRefs: ["route-contract://odd-sdlc/intent-reentry"],
    authorityRefs: ["ticket://T-103", "intent://current"],
    rationale: "Endpoint feedback shows the governing target condition is insufficient"
  };
  const assessments = [
    assessmentFor({
      basis,
      span: spanBySource(schedule, 2),
      assessmentId: "assessment://t103/c-d/close",
      rows: [fulfilledRow("C-REQ-1")]
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 1),
      assessmentId: "assessment://t103/b-d/close",
      rows: [fulfilledRow("B-REQ-1")]
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 0),
      assessmentId: "assessment://t103/a-d/intent-reprice",
      rows: [constitutionalGapRow("A-INTENT-1")],
      constitutionalReentry
    })
  ];
  const foldback = foldGraphSpanAssessments({
    basis,
    terminalVectorIndex: 2,
    schedule,
    assessments
  });
  const events = materializeEvents(basis, schedule, assessments, foldback);
  const frontier = deriveGraphReentryFrontierProjection({ basis, events });
  const plan = deriveGraphReentryPlan({
    basis,
    runtimeProjection: deriveRuntimeAggregateProjection(basis, []),
    frontier
  });
  assert.ok(plan);
  const transition = deriveAdvancementTransitionWithReentry({
    basis,
    runtimeProjection: deriveRuntimeAggregateProjection(basis, []),
    frontier
  });

  assert.equal(foldback.decision, "constitutional_reentry");
  assert.equal(frontier.decision, "constitutional_reentry");
  assert.equal(frontier.activeChangeClass, "intent_reprice");
  assert.equal(frontier.activeReEntryPoint, "intent");
  assert.equal(plan.targetVectorIndex, null);
  assert.deepEqual(plan.routeContractRefs, [
    "route-contract://odd-sdlc/intent-reentry"
  ]);
  assert.equal(transition.kind, "reenter_constitutional_route");
  assert.equal(transition.changeClass, "intent_reprice");
});
