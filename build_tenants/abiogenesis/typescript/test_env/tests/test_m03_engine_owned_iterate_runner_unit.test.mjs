// Validates: REQ-R-ABG3-INTERPRET
// Validates: REQ-R-ABG3-EVENTS
// Validates: REQ-R-ABG3-GRAPHCALL
// Validates: REQ-R-ABG3-FRAME
// Validates: T-072

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructEnginePluginContract,
  constructFdEvaluationOutcome,
  deriveRetryRepairDecision,
  deriveRuntimeAggregateProjection,
  runtimeEventsForRetryRepairDecision,
  runEngineIterate
} from "../../build/semantic/code/src/index.js";
import { canonicalRuntimeEvents } from "./support/canonical-runtime-events.mjs";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

test("T-072 engine runner: ABG owns F_D iteration over a three-stage graph function", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: null
  });
  const events = [];

  const result = runEngineIterate({
    basis,
    eventSink: (event) => {
      events.push(event);
    }
  });

  assert.equal(result.kind, "engine_iterate_result");
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  assert.equal(result.iterationCount, 3);
  assert.deepStrictEqual(
    events.map((event) => event.kind),
    [
      "basis_admitted",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "payload_observed",
      "payload_validated",
      "fd_authority_outcome_admitted",
      "vector_evaluated",
      "payload_observed",
      "payload_validated",
      "vector_closed",
      "fd_advance_ready",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "payload_observed",
      "payload_validated",
      "fd_authority_outcome_admitted",
      "vector_evaluated",
      "payload_observed",
      "payload_validated",
      "vector_closed",
      "fd_advance_ready",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "payload_observed",
      "payload_validated",
      "fd_authority_outcome_admitted",
      "vector_evaluated",
      "payload_observed",
      "payload_validated",
      "vector_closed",
      "fd_advance_ready",
      "terminal_reached"
    ]
  );
  assert.deepStrictEqual(
    events
      .filter((event) => event.kind === "vector_traversal_planned")
      .map((event) => event.edge),
    ["input_set→requirements", "requirements→design", "design→code"]
  );
});

test("T-072 engine runner: F_D evaluator is a substitutable plugin, not loop authority", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: null
  });
  const observedInputs = [];
  const fdEvaluator = Object.freeze({
    contract: constructEnginePluginContract({
      ref: "plugin://test/fd-evaluator",
      pluginKind: "fd_evaluator",
      authority: "effect_plugin",
      inputCarrier: "EnginePluginInput",
      outputCarrier: "FdEvaluationOutcome"
    }),
    evaluate: (input) => {
      observedInputs.push(input);
      return constructFdEvaluationOutcome({
        status: "accepted",
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });

  const result = runEngineIterate({
    basis,
    eventSink: () => {},
    plugins: { fdEvaluator }
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.iterationCount, 3);
  assert.deepStrictEqual(
    observedInputs.map((input) => input.edge),
    ["input_set→requirements", "requirements→design", "design→code"]
  );
  assert.deepStrictEqual(
    observedInputs.map((input) => input.closedVectorIndexes),
    [[], [0], [0, 1]]
  );
});

test("T-072 engine runner: retry and continuation replay facts remain ABG projection truth during iteration", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_D",
    dispatchRef: null
  });
  const retryDecision = deriveRetryRepairDecision({
    basis,
    projection: deriveRuntimeAggregateProjection(basis, []),
    failedVectorIndex: 0,
    priorManifestId: "manifest://prior",
    candidateManifestId: "manifest://candidate",
    maxAttempts: 3,
    stationary: false,
    continuationRepair: {
      terminatedContinuationId: "continuation://old",
      reopenedContinuationId: "continuation://new"
    }
  });
  const replayEvents = canonicalRuntimeEvents(
    runtimeEventsForRetryRepairDecision(retryDecision)
  );

  const result = runEngineIterate({
    basis,
    runtimeEvents: replayEvents,
    eventSink: () => {}
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  assert.deepStrictEqual(result.projection.retryAttemptManifestIds, [
    "manifest://candidate"
  ]);
  assert.deepStrictEqual(result.projection.retryAttemptRunIds, [
    "run://m03-iteration:retry:1"
  ]);
  assert.deepStrictEqual(result.projection.retryAttemptRefs, [
    {
      vectorIndex: 0,
      retryRunId: "run://m03-iteration:retry:1",
      retryCallId: `graph-call:${basis.id}:retry:1`,
      manifestId: "manifest://candidate",
      priorManifestId: "manifest://prior",
      attemptIndex: 1,
      sourceProjectionRef: `runtime_projection:${basis.id}:closed=:retry=0:leaf=0`
    }
  ]);
});
