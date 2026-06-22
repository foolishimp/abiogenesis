// Validates: REQ-R-ABG3-INTERPRET
// Validates: REQ-R-ABG3-EVENTS
// Validates: REQ-R-ABG3-GRAPHCALL
// Validates: REQ-R-ABG3-FRAME

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructVectorClosedEvent,
  deriveAdvancementTransition,
  deriveIterationAdvanceDecision,
  deriveRuntimeAggregateProjection
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function assessedEvent(edge, obligationId = "obligation://test") {
  return {
    kind: "assessed",
    assessmentKind: "fp",
    edge,
    obligationId,
    publishedLedgerRef: "ledger://test",
    actor: "codex",
    specHash: "spec://test",
    manifestId: "manifest://test",
    workflowVersion: "wf://test",
    runId: "run://m03-iteration",
    workKey: "wk://m03-iteration",
    selectedWorkerId: "worker://m03-iteration",
    selectedBackend: "backend://node",
    roleId: "role://runtime",
    authorityRef: "authority://runtime",
    assignmentSource: "policy_resolution",
    resolvedRuntimeRef: "runtime://typescript/node"
  };
}

test("M03 iteration unit: aggregate projection selects the first unclosed vector from replay", () => {
  const basis = buildThreeStageBasis();
  const firstProjection = deriveRuntimeAggregateProjection(basis, []);
  const firstDecision = deriveIterationAdvanceDecision(basis, firstProjection);

  assert.equal(firstProjection.nextVectorIndex, 0);
  assert.deepStrictEqual(firstProjection.run, {
    kind: "run_projection",
    basisId: basis.id,
    graphFunctionId: basis.graphFunction.id,
    runId: basis.runId,
    workKey: basis.workKey,
    vectorCount: 3,
    nextVectorIndex: 0
  });
  assert.deepStrictEqual(firstProjection.graphCall, {
    kind: "graph_call_projection",
    graphCallId: null,
    graphFunctionId: basis.graphFunction.id
  });
  assert.deepStrictEqual(firstProjection.frame, {
    kind: "frame_projection",
    frameId: null,
    frameLineageId: basis.frameLineageId,
    plannedVectorIndexes: [],
    evaluatedVectorIndexes: [],
    closedVectorIndexes: [],
    assessedEdges: []
  });
  assert.deepStrictEqual(firstProjection.continuation, {
    kind: "continuation_projection",
    retryAttemptRunIds: [],
    retryAttemptManifestIds: [],
    retryAttemptRefs: [],
    retryProgressRefs: [],
    leafTaskIds: [],
    completedLeafTaskIds: [],
    failedLeafTaskIds: []
  });
  assert.equal(firstDecision.kind, "advance_vector");
  assert.equal(firstDecision.edge, "input_set→requirements");

  const secondProjection = deriveRuntimeAggregateProjection(basis, [
    constructVectorClosedEvent({
      basis,
      vectorIndex: 0,
      closureKind: "assessed"
    })
  ]);
  const secondDecision = deriveIterationAdvanceDecision(basis, secondProjection);

  assert.deepStrictEqual(secondProjection.closedVectorIndexes, [0]);
  assert.equal(secondProjection.nextVectorIndex, 1);
  assert.equal(secondDecision.kind, "advance_vector");
  assert.equal(secondDecision.edge, "requirements→design");
});

test("M03 iteration unit: assessed F_P result truth is read-model only and vector closure advances re-entry", () => {
  const basis = buildThreeStageBasis();
  const projection = deriveRuntimeAggregateProjection(basis, [
    assessedEvent("input_set→requirements", "requirements_complete"),
    assessedEvent("input_set→requirements", "trace_complete"),
    constructVectorClosedEvent({
      basis,
      vectorIndex: 0,
      closureKind: "assessed"
    })
  ]);
  const decision = deriveIterationAdvanceDecision(basis, projection);

  assert.deepStrictEqual(projection.assessedEdges, [
    "input_set→requirements",
    "input_set→requirements"
  ]);
  assert.deepStrictEqual(projection.closedVectorIndexes, [0]);
  assert.equal(projection.nextVectorIndex, 1);
  assert.equal(decision.kind, "advance_vector");
  assert.equal(decision.edge, "requirements→design");
});

test("M03 iteration unit: aggregate projection converges after all vectors close", () => {
  const basis = buildThreeStageBasis();
  const projection = deriveRuntimeAggregateProjection(basis, [
    constructVectorClosedEvent({
      basis,
      vectorIndex: 0,
      closureKind: "assessed"
    }),
    constructVectorClosedEvent({
      basis,
      vectorIndex: 1,
      closureKind: "assessed"
    }),
    constructVectorClosedEvent({
      basis,
      vectorIndex: 2,
      closureKind: "assessed"
    })
  ]);
  const decision = deriveIterationAdvanceDecision(basis, projection);

  assert.equal(projection.nextVectorIndex, null);
  assert.equal(decision.kind, "converged");
  assert.equal(decision.terminalKind, "converged");
});

test("M03 iteration unit: unconsumed gap-stop terminal blocks replay convergence", () => {
  const basis = buildThreeStageBasis();
  const closedEvents = [
    constructVectorClosedEvent({
      basis,
      vectorIndex: 0,
      closureKind: "assessed"
    }),
    constructVectorClosedEvent({
      basis,
      vectorIndex: 1,
      closureKind: "assessed"
    }),
    constructVectorClosedEvent({
      basis,
      vectorIndex: 2,
      closureKind: "assessed"
    })
  ];
  const gapStop = {
    kind: "terminal_reached",
    basisId: basis.id,
    terminalKind: "gap_stop",
    reason: "consequence_stage_set_incomplete"
  };
  const projection = deriveRuntimeAggregateProjection(basis, [
    ...closedEvents,
    gapStop
  ]);
  const rawDecision = deriveIterationAdvanceDecision(basis, projection);
  const replayTransition = deriveAdvancementTransition(basis, [
    ...closedEvents,
    gapStop,
    {
      kind: "terminal_reached",
      basisId: basis.id,
      terminalKind: "converged",
      reason: "all graph-function vectors are closed by replay"
    }
  ]);

  assert.equal(rawDecision.kind, "converged");
  assert.equal(replayTransition.kind, "terminal");
  assert.equal(replayTransition.terminalKind, "gap_stop");

  const reentryTransition = deriveAdvancementTransition(basis, [
    ...closedEvents,
    gapStop,
    {
      kind: "graph_reentry_applied",
      basisId: basis.id,
      graphCallId: "graph-call://m03/gap-stop-repair",
      frameId: "frame://m03/gap-stop-repair",
      frameLineageId: basis.frameLineageId,
      graphFunctionId: basis.graphFunction.id,
      runId: basis.runId,
      workKey: basis.workKey,
      planRef: "graph-reentry-plan://m03/gap-stop-repair",
      targetVectorIndex: 1,
      changeClass: "realization_refactor",
      reEntryPoint: "realization",
      routeContractRefs: ["route-contract://m03/gap-stop-repair"],
      causingFrontierRowRefs: ["gap-stop://m03/consequence"],
      shadowedVectorIndexes: [1, 2],
      causationEventRefs: ["gap-stop://m03/consequence"],
      correlationId: "graph-reentry-plan://m03/gap-stop-repair",
      generation: 1
    }
  ]);

  assert.equal(reentryTransition.kind, "fp_dispatch");
  assert.equal(reentryTransition.vectorIndex, 1);
});
