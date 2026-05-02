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
  constructGraphSpanAssessedEvent,
  constructGraphSpanEvaluationScheduledEvent,
  constructGraphSpanFoldbackEvaluatedEvent,
  constructVectorClosedEvent,
  constructVectorEvaluatedEvent,
  constructVectorTraversalPlannedEvent,
  deriveAdvancementTransitionWithReentry,
  deriveEndpointSpanSchedule,
  deriveGraphReentryFrontierProjection,
  deriveGraphReentryPlan,
  deriveGraphSpanFoldbackEvaluationFromEvents,
  deriveRuntimeAggregateProjection,
  foldGraphSpanAssessments,
  runEngineIterate
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";
import {
  assessmentFor,
  blockedRow,
  buildSchedule,
  constitutionalGapRow,
  constitutionalReentry,
  contradictoryEvidenceRow,
  dropped,
  fulfilledRow,
  gapRow,
  materializeEvents,
  spanBySource,
  staleInputRow
} from "./support/t103-graph-span-fixtures.mjs";

function foldFor(basis, schedule, assessments, generation = undefined) {
  const input = {
    basis,
    terminalVectorIndex: schedule.terminalVectorIndex,
    schedule,
    assessments
  };
  if (generation === undefined) {
    return foldGraphSpanAssessments(input);
  }
  return foldGraphSpanAssessments({ ...input, generation });
}

function foldbackEvent(basis, foldback) {
  const event = constructGraphSpanFoldbackEvaluatedEvent({ basis, foldback });
  assertRuntimeEvent(event);
  return event;
}

function assessedEvent(basis, assessment) {
  const event = constructGraphSpanAssessedEvent({ basis, assessment });
  assertRuntimeEvent(event);
  return event;
}

function closeAssessments(basis, schedule, generation = 0) {
  return [
    assessmentFor({
      basis,
      span: spanBySource(schedule, 2),
      assessmentId: `assessment://t103/deep/c-d/close/${generation}`,
      rows: [fulfilledRow("C-REQ-1")],
      generation
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 1),
      assessmentId: `assessment://t103/deep/b-d/close/${generation}`,
      rows: [fulfilledRow("B-REQ-1")],
      generation
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 0),
      assessmentId: `assessment://t103/deep/a-d/close/${generation}`,
      rows: [fulfilledRow("A-REQ-1")],
      generation
    })
  ];
}

function bReentryAssessments(basis, schedule, generation = 0) {
  return [
    assessmentFor({
      basis,
      span: spanBySource(schedule, 2),
      assessmentId: `assessment://t103/deep/c-d/close/${generation}`,
      rows: [fulfilledRow("C-REQ-1")],
      generation
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 1),
      assessmentId: `assessment://t103/deep/b-d/gap/${generation}`,
      rows: [gapRow("B-REQ-1", [dropped(1, 2)])],
      generation
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 0),
      assessmentId: `assessment://t103/deep/a-d/close/${generation}`,
      rows: [fulfilledRow("A-REQ-1")],
      generation
    })
  ];
}

function bReentryPlan() {
  const { basis, schedule } = buildSchedule({
    runId: "run://t103/deep/reentry-plan"
  });
  const assessments = bReentryAssessments(basis, schedule);
  const foldback = foldFor(basis, schedule, assessments);
  const events = materializeEvents(basis, schedule, assessments, foldback);
  const frontier = deriveGraphReentryFrontierProjection({ basis, events });
  const plan = deriveGraphReentryPlan({
    basis,
    runtimeProjection: deriveRuntimeAggregateProjection(basis, []),
    frontier
  });
  assert.ok(plan);
  return { basis, frontier, plan };
}

function zoomFoldback(decision, foldbackRef) {
  return {
    kind: "zoom_foldback_evaluation",
    foldbackRef,
    zoomFrameId: `zoom-frame://${foldbackRef}`,
    scheduleRef: `schedule://${foldbackRef}`,
    decision,
    carryConverged: decision === "close",
    fulfillmentConverged: decision === "close",
    admitted: true,
    targetCertificationPassed: decision === "close",
    fdRecheckPassed: decision === "close",
    retryAllowlist: ["transport_failure", "no_output", "contract_failure"],
    fulfilledCount: decision === "close" ? 1 : 0,
    openCount: decision === "retry_scheduled_slice" ? 1 : 0,
    blockedCount: decision === "blocked" ? 1 : 0,
    runtimeFailureCount: decision === "retry_scheduled_slice" ? 1 : 0,
    missingAssessmentCount: decision === "carry_loopback_pressure" ? 1 : 0,
    conflictingCount: decision === "reprice_required" ? 1 : 0,
    semanticFulfillmentGapCount: 0,
    traceabilityReferenceGapCount: 0,
    findingClassCounts: {
      fulfilled: decision === "close" ? 1 : 0,
      semantic_fulfillment_gap: 0,
      traceability_reference_gap: 0
    },
    fulfilledItemRefs: decision === "close" ? [`item://${foldbackRef}`] : [],
    openItemRefs: decision === "retry_scheduled_slice" ? [`item://${foldbackRef}`] : [],
    blockedItemRefs: decision === "blocked" ? [`item://${foldbackRef}`] : [],
    runtimeFailureItemRefs:
      decision === "retry_scheduled_slice" ? [`item://${foldbackRef}`] : [],
    missingAssessmentItemRefs:
      decision === "carry_loopback_pressure" ? [`item://${foldbackRef}`] : [],
    conflictingItemRefs:
      decision === "reprice_required" ? [`item://${foldbackRef}`] : [],
    salvagedItemRefs: []
  };
}

test("T-103 semantic rejects endpoint span scheduling before every covered vector is closed", () => {
  const basis = buildThreeStageBasis({ runId: "run://t103/deep/schedule-open" });

  assert.throws(
    () =>
      deriveEndpointSpanSchedule({
        basis,
        terminalVectorIndex: 2,
        closedVectorIndexes: [0, 2]
      }),
    /every covered vector closed/
  );
});

test("T-103 semantic events carry run, work, frame lineage, causation, and correlation", () => {
  const { basis, schedule } = buildSchedule({
    runId: "run://t103/deep/event-fields",
    workKey: "wk://t103/deep/event-fields",
    frameId: "frame://t103/deep/event-fields",
    frameLineageId: "frame-lineage://t103/deep/event-fields"
  });
  const assessments = bReentryAssessments(basis, schedule);
  const foldback = foldFor(basis, schedule, assessments);
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

  const events = [
    constructGraphSpanEvaluationScheduledEvent({
      basis,
      schedule,
      causationEventRefs: ["event://terminal-closed"],
      correlationId: "correlation://schedule"
    }),
    constructGraphSpanAssessedEvent({
      basis,
      assessment: assessments[1],
      causationEventRefs: ["event://span-scheduled"],
      correlationId: "correlation://assessment"
    }),
    constructGraphSpanFoldbackEvaluatedEvent({
      basis,
      foldback,
      causationEventRefs: ["event://span-assessed"],
      correlationId: "correlation://foldback"
    }),
    constructGraphReentryPlannedEvent({
      basis,
      plan,
      causationEventRefs: ["event://frontier-projected"],
      correlationId: "correlation://planned"
    }),
    constructGraphReentryAppliedEvent({
      basis,
      plan,
      causationEventRefs: ["event://reentry-planned"],
      correlationId: "correlation://applied"
    })
  ];

  for (const event of events) {
    assertRuntimeEvent(event);
    assert.equal(event.runId, basis.runId);
    assert.equal(event.workKey, basis.workKey);
    assert.equal(event.frameLineageId, basis.frameLineageId);
    assert.equal(event.causationEventRefs.length, 1);
    assert.match(event.correlationId, /^correlation:\/\//);
  }
});

test("T-103 semantic keeps F_D out of semantic gap judgment", () => {
  const { basis, schedule } = buildSchedule({
    runId: "run://t103/deep/fd-boundary"
  });

  assert.throws(
    () =>
      assessmentFor({
        basis,
        span: spanBySource(schedule, 2),
        assessmentId: "assessment://t103/deep/fd-semantic-gap",
        assessmentRegime: "F_D",
        rows: [gapRow("C-REQ-1")]
      }),
    /Semantic graph span gaps require F_P assessment/
  );

  const deterministicFulfillment = assessmentFor({
    basis,
    span: spanBySource(schedule, 2),
    assessmentId: "assessment://t103/deep/fd-fulfilled",
    assessmentRegime: "F_D",
    rows: [fulfilledRow("C-REQ-1")]
  });
  assert.equal(deterministicFulfillment.assessmentRegime, "F_D");
});

test("T-103 semantic requires terminal evidence and span-bounded carry observations", () => {
  const { basis, schedule } = buildSchedule({
    runId: "run://t103/deep/admission-guard"
  });

  assert.throws(
    () =>
      assessmentFor({
        basis,
        span: spanBySource(schedule, 2),
        assessmentId: "assessment://t103/deep/no-terminal-evidence",
        rows: [fulfilledRow("C-REQ-1", [])]
      }),
    /terminal evidence refs/
  );

  assert.throws(
    () =>
      assessmentFor({
        basis,
        span: spanBySource(schedule, 1),
        assessmentId: "assessment://t103/deep/outside-carry",
        rows: [gapRow("B-REQ-1", [dropped(0, 2)])]
      }),
    /inside the graph span/
  );
});

test("T-103 semantic uses the latest span attempt to admit a repair instead of unioning old gap truth", () => {
  const { basis, schedule } = buildSchedule({
    runId: "run://t103/deep/latest-repair"
  });
  const oldGap = assessmentFor({
    basis,
    span: spanBySource(schedule, 1),
    assessmentId: "assessment://t103/deep/b-d/00-gap",
    attemptIndex: 0,
    rows: [gapRow("B-REQ-1", [dropped(1, 2)])]
  });
  const repaired = assessmentFor({
    basis,
    span: spanBySource(schedule, 1),
    assessmentId: "assessment://t103/deep/b-d/01-repaired",
    attemptIndex: 1,
    rows: [fulfilledRow("B-REQ-1")]
  });
  const assessments = [
    assessmentFor({
      basis,
      span: spanBySource(schedule, 2),
      assessmentId: "assessment://t103/deep/c-d/close/latest-repair",
      rows: [fulfilledRow("C-REQ-1")]
    }),
    oldGap,
    repaired,
    assessmentFor({
      basis,
      span: spanBySource(schedule, 0),
      assessmentId: "assessment://t103/deep/a-d/close/latest-repair",
      rows: [fulfilledRow("A-REQ-1")]
    })
  ];
  const directFoldback = foldFor(basis, schedule, assessments);
  const replayFoldback = deriveGraphSpanFoldbackEvaluationFromEvents({
    basis,
    schedule,
    events: assessments.map((assessment) => assessedEvent(basis, assessment))
  });

  assert.equal(directFoldback.decision, "close");
  assert.equal(replayFoldback.decision, "close");
  assert.equal(directFoldback.gapCount, 0);
  assert.equal(directFoldback.spanAssessmentRefs.includes(oldGap.assessmentId), false);
  assert.equal(directFoldback.spanAssessmentRefs.includes(repaired.assessmentId), true);
});

test("T-103 semantic uses the latest span attempt to reopen a previously fulfilled span", () => {
  const { basis, schedule } = buildSchedule({
    runId: "run://t103/deep/latest-gap"
  });
  const earlierClose = assessmentFor({
    basis,
    span: spanBySource(schedule, 1),
    assessmentId: "assessment://t103/deep/b-d/00-close",
    attemptIndex: 0,
    rows: [fulfilledRow("B-REQ-1")]
  });
  const laterGap = assessmentFor({
    basis,
    span: spanBySource(schedule, 1),
    assessmentId: "assessment://t103/deep/b-d/01-gap",
    attemptIndex: 1,
    rows: [gapRow("B-REQ-1", [dropped(1, 2)])]
  });
  const foldback = foldFor(basis, schedule, [
    assessmentFor({
      basis,
      span: spanBySource(schedule, 2),
      assessmentId: "assessment://t103/deep/c-d/close/latest-gap",
      rows: [fulfilledRow("C-REQ-1")]
    }),
    earlierClose,
    laterGap,
    assessmentFor({
      basis,
      span: spanBySource(schedule, 0),
      assessmentId: "assessment://t103/deep/a-d/close/latest-gap",
      rows: [fulfilledRow("A-REQ-1")]
    })
  ]);

  assert.equal(foldback.decision, "reenter_at_vector");
  assert.deepEqual(foldback.reentryCandidateVectorIndexes, [1]);
  assert.equal(foldback.spanAssessmentRefs.includes(earlierClose.assessmentId), false);
  assert.equal(foldback.spanAssessmentRefs.includes(laterGap.assessmentId), true);
});

test("T-103 semantic clears old frontier rows on later close and can reopen them on a later gap", () => {
  const { basis, schedule } = buildSchedule({
    runId: "run://t103/deep/frontier-clear"
  });
  const retryFoldback = foldFor(basis, schedule, bReentryAssessments(basis, schedule));
  const closeFoldback = foldFor(
    basis,
    schedule,
    closeAssessments(basis, schedule, 1),
    1
  );
  const reopenedFoldback = foldFor(
    basis,
    schedule,
    bReentryAssessments(basis, schedule, 2),
    2
  );

  const clearedFrontier = deriveGraphReentryFrontierProjection({
    basis,
    events: [foldbackEvent(basis, retryFoldback), foldbackEvent(basis, closeFoldback)]
  });
  const reopenedFrontier = deriveGraphReentryFrontierProjection({
    basis,
    events: [
      foldbackEvent(basis, retryFoldback),
      foldbackEvent(basis, closeFoldback),
      foldbackEvent(basis, reopenedFoldback)
    ]
  });

  assert.equal(retryFoldback.decision, "reenter_at_vector");
  assert.equal(closeFoldback.decision, "close");
  assert.equal(clearedFrontier.decision, "advance");
  assert.deepEqual(clearedFrontier.activeRows, []);
  assert.equal(reopenedFrontier.decision, "reenter");
  assert.equal(reopenedFrontier.activeTargetVectorIndex, 1);
});

test("T-103 semantic graph-vector reentry shadows planned, evaluated, and closed downstream runtime facts", () => {
  const { basis, frontier, plan } = bReentryPlan();
  const applied = constructGraphReentryAppliedEvent({ basis, plan });
  assertRuntimeEvent(applied);

  const projection = deriveRuntimeAggregateProjection(basis, [
    constructVectorTraversalPlannedEvent({ basis, vectorIndex: 0 }),
    constructVectorEvaluatedEvent({ basis, vectorIndex: 0, status: "accepted" }),
    constructVectorClosedEvent({ basis, vectorIndex: 0, closureKind: "assessed" }),
    constructVectorTraversalPlannedEvent({ basis, vectorIndex: 1 }),
    constructVectorEvaluatedEvent({ basis, vectorIndex: 1, status: "accepted" }),
    constructVectorClosedEvent({ basis, vectorIndex: 1, closureKind: "assessed" }),
    constructVectorTraversalPlannedEvent({ basis, vectorIndex: 2 }),
    constructVectorEvaluatedEvent({ basis, vectorIndex: 2, status: "accepted" }),
    constructVectorClosedEvent({ basis, vectorIndex: 2, closureKind: "assessed" }),
    applied
  ]);
  const transition = deriveAdvancementTransitionWithReentry({
    basis,
    runtimeProjection: projection,
    frontier
  });

  assert.deepEqual(projection.closedVectorIndexes, [0]);
  assert.deepEqual(projection.plannedVectorIndexes, [0]);
  assert.deepEqual(projection.evaluatedVectorIndexes, [0]);
  assert.equal(projection.nextVectorIndex, 1);
  assert.equal(transition.kind, "reenter_graph_vector");
  assert.equal(transition.vectorIndex, 1);
});

test("T-103 semantic constitutional reentry does not erase graph-vector projection state", () => {
  const { basis, schedule } = buildSchedule({
    runId: "run://t103/deep/constitutional-no-shadow"
  });
  const assessments = [
    assessmentFor({
      basis,
      span: spanBySource(schedule, 2),
      assessmentId: "assessment://t103/deep/c-d/close/constitutional",
      rows: [fulfilledRow("C-REQ-1")]
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 1),
      assessmentId: "assessment://t103/deep/b-d/close/constitutional",
      rows: [fulfilledRow("B-REQ-1")]
    }),
    assessmentFor({
      basis,
      span: spanBySource(schedule, 0),
      assessmentId: "assessment://t103/deep/a-d/intent-reprice",
      rows: [constitutionalGapRow("A-INTENT-1")],
      constitutionalReentry: constitutionalReentry({
        changeClass: "intent_reprice",
        reEntryPoint: "intent",
        targetVectorIndex: null
      })
    })
  ];
  const foldback = foldFor(basis, schedule, assessments);
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
  assertRuntimeEvent(applied);
  const projection = deriveRuntimeAggregateProjection(basis, [
    constructVectorClosedEvent({ basis, vectorIndex: 0, closureKind: "assessed" }),
    constructVectorClosedEvent({ basis, vectorIndex: 1, closureKind: "assessed" }),
    constructVectorClosedEvent({ basis, vectorIndex: 2, closureKind: "assessed" }),
    applied
  ]);
  const transition = deriveAdvancementTransitionWithReentry({
    basis,
    runtimeProjection: projection,
    frontier
  });

  assert.equal(foldback.decision, "constitutional_reentry");
  assert.deepEqual(projection.closedVectorIndexes, [0, 1, 2]);
  assert.equal(projection.nextVectorIndex, null);
  assert.equal(transition.kind, "reenter_constitutional_route");
  assert.equal(transition.reEntryPoint, "intent");
});

test("T-103 semantic blocked frontier outranks retry pressure and cannot mint a reentry plan", () => {
  const { basis, schedule } = buildSchedule({
    runId: "run://t103/deep/block-priority"
  });
  const retryFoldback = foldFor(basis, schedule, bReentryAssessments(basis, schedule));
  const blockedFoldback = foldFor(
    basis,
    schedule,
    [
      assessmentFor({
        basis,
        span: spanBySource(schedule, 2),
        assessmentId: "assessment://t103/deep/c-d/blocked",
        rows: [blockedRow("C-REQ-1")]
      }),
      assessmentFor({
        basis,
        span: spanBySource(schedule, 1),
        assessmentId: "assessment://t103/deep/b-d/close/blocked",
        rows: [fulfilledRow("B-REQ-1")]
      }),
      assessmentFor({
        basis,
        span: spanBySource(schedule, 0),
        assessmentId: "assessment://t103/deep/a-d/close/blocked",
        rows: [fulfilledRow("A-REQ-1")]
      })
    ],
    1
  );
  const frontier = deriveGraphReentryFrontierProjection({
    basis,
    events: [foldbackEvent(basis, retryFoldback), foldbackEvent(basis, blockedFoldback)]
  });
  const plan = deriveGraphReentryPlan({
    basis,
    runtimeProjection: deriveRuntimeAggregateProjection(basis, []),
    frontier
  });
  const transition = deriveAdvancementTransitionWithReentry({
    basis,
    runtimeProjection: deriveRuntimeAggregateProjection(basis, []),
    frontier
  });

  assert.equal(retryFoldback.decision, "reenter_at_vector");
  assert.equal(blockedFoldback.decision, "blocked");
  assert.equal(frontier.decision, "block");
  assert.equal(plan, null);
  assert.equal(transition.kind, "blocked");
});

test("T-103 semantic stale or contradictory span truth reprices even when carry facts imply a vector", () => {
  for (const [runId, rowFactory, countField] of [
    ["run://t103/deep/stale-reprice", staleInputRow, "staleInputCount"],
    [
      "run://t103/deep/contradictory-reprice",
      contradictoryEvidenceRow,
      "contradictoryCount"
    ]
  ]) {
    const { basis, schedule } = buildSchedule({ runId });
    const assessments = [
      assessmentFor({
        basis,
        span: spanBySource(schedule, 2),
        assessmentId: `${runId}/c-d/close`,
        rows: [fulfilledRow("C-REQ-1")]
      }),
      assessmentFor({
        basis,
        span: spanBySource(schedule, 1),
        assessmentId: `${runId}/b-d/reprice`,
        rows: [rowFactory("B-REQ-1", [dropped(1, 2)])]
      }),
      assessmentFor({
        basis,
        span: spanBySource(schedule, 0),
        assessmentId: `${runId}/a-d/close`,
        rows: [fulfilledRow("A-REQ-1")]
      })
    ];
    const foldback = foldFor(basis, schedule, assessments);
    const frontier = deriveGraphReentryFrontierProjection({
      basis,
      events: materializeEvents(basis, schedule, assessments, foldback)
    });
    const plan = deriveGraphReentryPlan({
      basis,
      runtimeProjection: deriveRuntimeAggregateProjection(basis, []),
      frontier
    });

    assert.equal(foldback[countField], 1);
    assert.deepEqual(foldback.reentryCandidateVectorIndexes, [1]);
    assert.equal(foldback.decision, "reprice_required");
    assert.equal(frontier.decision, "reprice");
    assert.equal(plan, null);
  }
});

test("T-103 semantic event ingress rejects status widening in graph-span rows", () => {
  const { basis, schedule } = buildSchedule({
    runId: "run://t103/deep/event-status-widening"
  });
  const assessment = assessmentFor({
    basis,
    span: spanBySource(schedule, 2),
    assessmentId: "assessment://t103/deep/status-widening",
    rows: [fulfilledRow("C-REQ-1")]
  });
  const event = constructGraphSpanAssessedEvent({ basis, assessment });

  assert.throws(
    () =>
      assertRuntimeEvent({
        ...event,
        obligationRows: [
          {
            ...event.obligationRows[0],
            status: "lexical_match"
          }
        ]
      }),
    /GraphSpanAssessedEvent\.obligationRows\[0\]\.status/
  );
});

test("T-103 semantic event ingress rejects F_D semantic gap rows", () => {
  const { basis, schedule } = buildSchedule({
    runId: "run://t103/deep/event-fd-gap"
  });
  const assessment = assessmentFor({
    basis,
    span: spanBySource(schedule, 2),
    assessmentId: "assessment://t103/deep/event-fd-gap",
    rows: [gapRow("C-REQ-1")]
  });
  const event = constructGraphSpanAssessedEvent({ basis, assessment });

  assert.throws(
    () =>
      assertRuntimeEvent({
        ...event,
        assessmentRegime: "F_D"
      }),
    /assessmentRegime must be F_P/
  );
});

test("T-103 semantic T-100 edge foldbacks participate in graph-span foldback decisions", () => {
  const { basis, schedule } = buildSchedule({
    runId: "run://t103/deep/t100-composition"
  });
  const assessments = closeAssessments(basis, schedule);
  const blocked = foldFor(basis, schedule, assessments, undefined);
  const blockedByEdge = foldGraphSpanAssessments({
    basis,
    terminalVectorIndex: schedule.terminalVectorIndex,
    schedule,
    assessments,
    edgeFoldbacks: [zoomFoldback("blocked", "foldback://edge/blocked")]
  });
  const repricedByEdge = foldGraphSpanAssessments({
    basis,
    terminalVectorIndex: schedule.terminalVectorIndex,
    schedule,
    assessments,
    edgeFoldbacks: [zoomFoldback("reprice_required", "foldback://edge/reprice")]
  });

  assert.equal(blocked.decision, "close");
  assert.equal(blockedByEdge.decision, "blocked");
  assert.deepEqual(blockedByEdge.causingEdgeFoldbackRefs, [
    "foldback://edge/blocked"
  ]);
  assert.equal(repricedByEdge.decision, "reprice_required");
  assert.deepEqual(repricedByEdge.causingEdgeFoldbackRefs, [
    "foldback://edge/reprice"
  ]);
});

test("T-103 semantic stale lower-generation close does not clear newer frontier rows", () => {
  const { basis, schedule } = buildSchedule({
    runId: "run://t103/deep/stale-close-generation"
  });
  const newerRetry = foldFor(
    basis,
    schedule,
    bReentryAssessments(basis, schedule, 2),
    2
  );
  const staleClose = foldFor(
    basis,
    schedule,
    closeAssessments(basis, schedule, 1),
    1
  );
  const frontier = deriveGraphReentryFrontierProjection({
    basis,
    events: [foldbackEvent(basis, newerRetry), foldbackEvent(basis, staleClose)]
  });

  assert.equal(frontier.decision, "reenter");
  assert.equal(frontier.activeTargetVectorIndex, 1);
});

test("T-103 semantic runner consumes active reentry frontier and applies graph reentry before default iteration", () => {
  const { basis, schedule } = buildSchedule({
    runId: "run://t103/deep/runner-reentry",
    defaultRegime: "F_D",
    dispatchRef: null
  });
  const assessments = bReentryAssessments(basis, schedule);
  const foldback = foldFor(basis, schedule, assessments);
  const reentryEvents = materializeEvents(basis, schedule, assessments, foldback);
  const emittedEvents = [];

  const result = runEngineIterate({
    basis,
    runtimeEvents: [
      constructVectorClosedEvent({ basis, vectorIndex: 0, closureKind: "assessed" }),
      constructVectorClosedEvent({ basis, vectorIndex: 1, closureKind: "assessed" }),
      constructVectorClosedEvent({ basis, vectorIndex: 2, closureKind: "assessed" }),
      ...reentryEvents
    ],
    eventSink: (event) => {
      emittedEvents.push(event);
    }
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  assert.deepEqual(
    emittedEvents
      .filter((event) => event.kind === "graph_reentry_planned")
      .map((event) => event.targetVectorIndex),
    [1]
  );
  assert.deepEqual(
    emittedEvents
      .filter((event) => event.kind === "graph_reentry_applied")
      .map((event) => event.shadowedVectorIndexes),
    [[1, 2]]
  );
  assert.deepEqual(
    emittedEvents
      .filter((event) => event.kind === "vector_traversal_planned")
      .map((event) => event.vectorIndex),
    [1, 2]
  );
  assert.deepEqual(result.projection.closedVectorIndexes, [0, 1, 2]);
});
