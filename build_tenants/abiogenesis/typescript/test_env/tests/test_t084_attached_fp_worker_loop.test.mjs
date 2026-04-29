// Validates: REQ-R-ABG3-INTERPRET
// Validates: REQ-R-ABG3-EVENTS
// Validates: REQ-R-ABG3-RETRY
// Validates: REQ-R-ABG3-CONVERGENCE
// Validates: T-084

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitFpDispatchOutcome,
  constructEnginePluginContract,
  constructFpDispatchOutcome,
  runEngineIterate,
  start
} from "../../build/semantic/code/src/index.js";
import {
  buildThreeStageBasis,
  buildThreeStageStartContext
} from "./support/m03-iteration-fixtures.mjs";

function attachedArtifact(input, options = {}) {
  const fulfillmentStatus = options.fulfillmentStatus ?? "fulfilled";
  const assessmentIds =
    input.expectedAssessmentIds.length > 0
      ? input.expectedAssessmentIds
      : ["runtime_fulfilled"];
  return {
    edge: options.edge ?? input.expectedEdge ?? input.edge,
    actor: "codex",
    fulfillment_assessments: assessmentIds.map((assessmentId) => ({
      id: assessmentId,
      evaluator: assessmentId,
      fulfillment_status: fulfillmentStatus,
      fulfillment_detail:
        fulfillmentStatus === "fulfilled"
          ? "attached worker result accepted"
          : "missing generated asset",
      blocking_reasons:
        fulfillmentStatus === "fulfilled" ? [] : ["missing generated asset"],
      evidence_refs: [`proof://${assessmentId}`]
    })),
    selected_worker_id: "worker://m03-iteration",
    selected_backend: "backend://node",
    role_id: "role://runtime",
    assignment_source: "policy_resolution",
    resolved_runtime_ref: "runtime://typescript/node"
  };
}

function fpDispatchContract(ref) {
  return constructEnginePluginContract({
    ref,
    pluginKind: "fp_dispatch",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpDispatchOutcome"
  });
}

test("T-084 engine runner: attached F_P worker retries from replay state, then continues to convergence", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://attached-worker"
  });
  const events = [];
  const observedInputs = [];
  const attemptByEdge = new Map();
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t084-attached-worker"),
    dispatch: (input) => {
      const nextAttempt = (attemptByEdge.get(input.edge) ?? 0) + 1;
      attemptByEdge.set(input.edge, nextAttempt);
      observedInputs.push(input);

      if (input.edge === "input_set→requirements" && nextAttempt === 2) {
        assert.deepStrictEqual(input.closedVectorIndexes, []);
        assert.equal(input.retryAttemptRefs.length, 1);
        assert.equal(input.retryAttemptRefs[0].attemptIndex, 1);
        assert.equal(input.retryProgressRefs.length, 1);
        assert.ok(
          input.retryProgressRefs[0].progressSignalRefs.some((ref) =>
            ref.includes("missing generated asset")
          )
        );
      }

      const fulfillmentStatus =
        input.edge === "input_set→requirements" && nextAttempt === 1
          ? "blocked"
          : "fulfilled";
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t084/${encodeURIComponent(input.edge)}/${nextAttempt}`,
        attachedResultArtifact: attachedArtifact(input, { fulfillmentStatus }),
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });

  const result = runEngineIterate({
    basis,
    eventSink: (event) => {
      events.push(event);
    },
    plugins: { fpDispatch }
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  assert.equal(result.iterationCount, 3);
  assert.deepStrictEqual(
    observedInputs.map((input) => input.edge),
    [
      "input_set→requirements",
      "input_set→requirements",
      "requirements→design",
      "design→code"
    ]
  );
  assert.deepStrictEqual(result.projection.closedVectorIndexes, [0, 1, 2]);
  assert.deepStrictEqual(result.projection.retryAttemptRefs, [
    {
      vectorIndex: 0,
      retryRunId: "run://m03-iteration:retry:1",
      retryCallId: `graph-call:${basis.id}:retry:1`,
      manifestId: `manifest:fp_retry:${JSON.stringify({
        basisId: basis.id,
        vectorIndex: 0,
        attemptIndex: 1
      })}`,
      attemptIndex: 1,
      sourceProjectionRef: `runtime_projection:${basis.id}:closed=:retry=0:leaf=0`
    }
  ]);
  assert.deepStrictEqual(
    events.map((event) => event.kind),
    [
      "basis_admitted",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "fp_dispatch_requested",
      "actor_invocation_started",
      "actor_result_artifact_observed",
      "actor_invocation_closed",
      "vector_evaluated",
      "retry_repair_planned",
      "retry_attempt_opened",
      "continuation_terminated",
      "continuation_reopened",
      "retry_progress_recorded",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "fp_dispatch_requested",
      "actor_invocation_started",
      "actor_result_artifact_observed",
      "actor_invocation_closed",
      "vector_evaluated",
      "authority_snapshot_admitted",
      "payload_observed",
      "payload_validated",
      "evidence_admitted",
      "vector_closed",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "fp_dispatch_requested",
      "actor_invocation_started",
      "actor_result_artifact_observed",
      "actor_invocation_closed",
      "vector_evaluated",
      "authority_snapshot_admitted",
      "payload_observed",
      "payload_validated",
      "evidence_admitted",
      "vector_closed",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "fp_dispatch_requested",
      "actor_invocation_started",
      "actor_result_artifact_observed",
      "actor_invocation_closed",
      "vector_evaluated",
      "authority_snapshot_admitted",
      "payload_observed",
      "payload_validated",
      "evidence_admitted",
      "vector_closed",
      "terminal_reached"
    ]
  );
});

test("T-084 public start: attached F_P graph converges without caller-owned loop", () => {
  const { input, context } = buildThreeStageStartContext({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://attached-worker"
  });
  const events = [];
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t084-public-start"),
    dispatch: (pluginInput) =>
      constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t084-public/${encodeURIComponent(pluginInput.edge)}`,
        attachedResultArtifact: attachedArtifact(pluginInput),
        evidenceRefs: [pluginInput.sourceProjectionRef]
      })
  });

  const outcome = start(
    input,
    context,
    (event) => {
      events.push(event);
    },
    { fpDispatch }
  );

  assert.equal(outcome.kind, "converged");
  assert.equal(outcome.terminalKind, "converged");
  assert.deepStrictEqual(
    events
      .filter((event) => event.kind === "fp_dispatch_requested")
      .map((event) => event.dispatchRef),
    [
      "dispatch://attached-worker",
      "dispatch://attached-worker",
      "dispatch://attached-worker"
    ]
  );
  assert.deepStrictEqual(
    events.filter((event) => event.kind === "vector_closed").map((event) => event.edge),
    ["input_set→requirements", "requirements→design", "design→code"]
  );
});

test("T-084 negative: F_P plugin output cannot carry hidden traversal authority", () => {
  assert.throws(
    () =>
      admitFpDispatchOutcome({
        kind: "fp_dispatch",
        status: "dispatched",
        resultRef: "result://malicious",
        attachedResultArtifact: {},
        nextVectorIndex: 2
      }),
    /engine authority/i
  );

  assert.throws(
    () =>
      admitFpDispatchOutcome({
        kind: "fp_dispatch",
        status: "dispatched",
        resultRef: "result://malicious",
        attachedResultArtifact: {},
        runtimeEvents: []
      }),
    /engine authority/i
  );
});

test("T-084 negative: wrong-edge attached artifact cannot close a vector", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://attached-worker"
  });
  const events = [];
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t084-wrong-edge"),
    dispatch: (input) =>
      constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t084-wrong/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact: attachedArtifact(input, {
          edge: "wrong_source→wrong_target"
        }),
        evidenceRefs: [input.sourceProjectionRef]
      })
  });

  const result = runEngineIterate({
    basis,
    eventSink: (event) => {
      events.push(event);
    },
    plugins: { fpDispatch },
    maxAttachedFpAttempts: 1
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.deepStrictEqual(result.projection.closedVectorIndexes, []);
  assert.deepStrictEqual(
    events.filter((event) => event.kind === "assessed"),
    []
  );
  assert.equal(
    events.some((event) => event.kind === "retry_attempt_stopped"),
    true
  );
});
