// Live-style local package-surface proof for T-151.
// Validates: REQ-R-ABG3-ITERATION
// Validates: REQ-L-GTL3-EVALUATOR

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitFpEvaluationOutcome,
  constructFpEvaluationFinding,
  constructFrameOpenedEvent,
  constructGraphCallOpenedEvent,
  constructGtlEvaluationScopeRef,
  constructVectorTraversalPlannedEvent,
  deriveIterationOutcomeProjection,
  deriveRuntimeAggregateProjection
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "../tests/support/m03-iteration-fixtures.mjs";

function vectorEdge(basis, vectorIndex) {
  const vector = basis.graph.vectors[vectorIndex];
  assert.notEqual(vector, undefined);
  return vector.name;
}

function scopeFor(runtime, segmentRef, dimensionRef) {
  return constructGtlEvaluationScopeRef({
    graphCallRef: runtime.projection.graphCallId,
    frameRef: runtime.projection.frameId,
    graphFunctionRef: runtime.basis.graphFunction.id,
    graphVectorRef: vectorEdge(runtime.basis, runtime.vectorIndex),
    vectorIndex: runtime.vectorIndex,
    compositionRef: "composition://t151/live-style",
    compositionDigest: "digest://t151/live-style",
    scopeTopologyRef: "scope-topology://t151/live-style-grid",
    scopeKind: "dimension_cell",
    segmentRef,
    dimensionRef
  });
}

function runtimeFixture() {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t151/live-style"
  });
  const vectorIndex = 1;
  const events = [
    constructGraphCallOpenedEvent(basis),
    constructFrameOpenedEvent(basis),
    constructVectorTraversalPlannedEvent({ basis, vectorIndex })
  ];
  const projection = deriveRuntimeAggregateProjection(basis, events);
  return { basis, vectorIndex, projection };
}

function row(authorityRef, status, evaluationScopeRef, reason = null) {
  return {
    authorityRef,
    status,
    reason,
    lifecycle: "active",
    evidenceRefs: [`evidence://${authorityRef}`],
    evaluationScopeRef
  };
}

test("T-151 live-style package surface preserves scoped finding and folds localized redispatch", () => {
  const runtime = runtimeFixture();
  const satisfiedScope = scopeFor(
    runtime,
    "segment://t151/live-style/a",
    "dimension://t151/live-style/depth"
  );
  const failedScope = scopeFor(
    runtime,
    "segment://t151/live-style/b",
    "dimension://t151/live-style/authority"
  );

  const finding = constructFpEvaluationFinding({
    findingRef: "finding://t151/live-style/b-authority",
    evaluatorRef: "evaluator://t151/live-style",
    closeDisposition: "retry",
    residualPressureRefs: ["pressure://t151/live-style/b-authority"],
    evidenceRefs: ["evidence://t151/live-style/b-authority"],
    authorityRefs: ["authority://t151/live-style/b-authority"],
    compositionContributionRef: "composition-contribution://t151/live-style",
    compositionRef: failedScope.compositionRef,
    compositionDigest: failedScope.compositionDigest,
    evaluationScopeRef: failedScope
  });
  const admitted = admitFpEvaluationOutcome({
    kind: "fp_evaluation",
    status: "evaluated",
    findings: [finding],
    ambiguityStatus: "partial",
    evidenceRefs: ["evidence://t151/live-style/outcome"]
  });

  const projection = deriveIterationOutcomeProjection({
    basis: runtime.basis,
    runtimeProjection: runtime.projection,
    vectorIndex: runtime.vectorIndex,
    satisfactionRows: [
      row("authority://t151/live-style/a-depth", "satisfied", satisfiedScope),
      row(
        "authority://t151/live-style/b-authority",
        "unsatisfied",
        admitted.findings[0].evaluationScopeRef,
        "partial_evidence"
      )
    ]
  });

  assert.equal(admitted.findings[0].evaluationScopeRef.scopeRef, failedScope.scopeRef);
  assert.equal(projection.outcome.kind, "redispatch");
  assert.equal(projection.outcome.target.targetVectorIndex, runtime.vectorIndex);
  assert.equal(projection.outcome.target.evaluationScopeRef.scopeRef, failedScope.scopeRef);
  assert.equal(
    projection.satisfactionRows.some(
      (satisfaction) =>
        satisfaction.status === "satisfied" &&
        satisfaction.evaluationScopeRef.scopeRef === satisfiedScope.scopeRef
    ),
    true
  );
});
