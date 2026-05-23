// Validates: REQ-R-ABG3-RETRY
// Validates: REQ-R-ABG3-PROJECTION
// Validates: REQ-R-ABG3-PAYLOAD
// Validates: T-098

import test from "node:test";
import assert from "node:assert/strict";

import {
  assertFullRetryFrontierProjection,
  constructEnginePluginContract,
  constructFpDispatchOutcome,
  defaultFpEvaluatorPlugin,
  deriveRetryFrontierProjection,
  runEngineIterate
} from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

function fpDispatchContract(ref) {
  return constructEnginePluginContract({
    ref,
    pluginKind: "fp_dispatch",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpDispatchOutcome"
  });
}

function artifact(input, options) {
  return {
    edge: input.expectedEdge ?? input.edge,
    actor: "codex",
    fulfillment_assessments: [
      {
        id: input.expectedAssessmentIds[0] ?? "runtime_fulfilled",
        evaluator: input.expectedAssessmentIds[0] ?? "runtime_fulfilled",
        fulfillment_status: options.status,
        fulfillment_detail: options.detail,
        blocking_reasons: options.blockingReasons ?? [],
        evidence_refs: options.evidenceRefs ?? [`proof://${input.edge}`]
      }
    ],
    selected_worker_id: "worker://t098",
    selected_backend: "backend://node",
    role_id: "role://runtime",
    assignment_source: "policy_resolution",
    resolved_runtime_ref: "runtime://typescript/node"
  };
}

test("T-098 retry frontier: next F_P input receives full prior failure frontier", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t098-frontier"
  });
  const events = [];
  const inputs = [];
  const attemptsByEdge = new Map();

  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t098-frontier"),
    dispatch: (input) => {
      inputs.push(input);
      const nextAttempt = (attemptsByEdge.get(input.edge) ?? 0) + 1;
      attemptsByEdge.set(input.edge, nextAttempt);

      if (input.edge === "input_set→requirements" && nextAttempt === 1) {
        return constructFpDispatchOutcome({
          status: "dispatched",
          resultRef: "result://t098/attempt-1",
          attachedResultArtifact: artifact(input, {
            status: "blocked",
            detail: "execution evidence was missing",
            blockingReasons: ["test_execution_evidence_missing"],
            evidenceRefs: ["evidence://t098/attempt-1/missing"]
          })
        });
      }

      if (input.edge === "input_set→requirements" && nextAttempt === 2) {
        assert.equal(input.retryFrontier.kind, "retry_frontier_projection");
        assert.equal(input.retryFrontier.rows.length > 0, true);
        assert.equal(
          input.retryFrontier.rows.some((row) =>
            row.detail.includes("test_execution_evidence_missing")
          ),
          true
        );
        return constructFpDispatchOutcome({
          status: "dispatched",
          resultRef: "result://t098/attempt-2",
          attachedResultArtifact: artifact(input, {
            status: "blocked",
            detail: "product materialization violated surface edge",
            blockingReasons: ["unexpected_product_materialization"],
            evidenceRefs: ["evidence://t098/attempt-2/materialization"]
          })
        });
      }

      if (input.edge === "input_set→requirements" && nextAttempt === 3) {
        const details = input.retryFrontier.rows.map((row) => row.detail);
        assert.equal(
          details.some((detail) =>
            detail.includes("test_execution_evidence_missing")
          ),
          true
        );
        assert.equal(
          details.some((detail) =>
            detail.includes("unexpected_product_materialization")
          ),
          true
        );
        assert.deepStrictEqual(
          input.retryFrontier.rows
            .filter((row) => row.reasonClass === "blocking_reason")
            .map((row) => row.attemptIndex),
          [1, 2]
        );
      }

      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t098/${encodeURIComponent(input.edge)}/${nextAttempt}`,
        attachedResultArtifact: artifact(input, {
          status: "fulfilled",
          detail: "fulfilled after full frontier"
        })
      });
    }
  });

  const result = runEngineIterate({
    basis,
    eventSink: (event) => events.push(event),
    plugins: { fpDispatch, fpEvaluator: defaultFpEvaluatorPlugin },
    maxAttachedFpAttempts: 3
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  assert.equal(inputs.filter((input) => input.edge === "input_set→requirements").length, 3);

  const frontier = deriveRetryFrontierProjection({
    basis,
    runtimeProjection: result.projection,
    events: result.replayEvents,
    vectorIndex: 0
  });

  assertFullRetryFrontierProjection({
    projection: frontier,
    requiredReasonClasses: ["blocking_reason", "retry_planned"]
  });
  assert.equal(frontier.attemptCount, 2);
  assert.equal(frontier.latestAttemptIndex, 2);
  assert.equal(
    frontier.rows.every((row) => row.clearedByClosure === true),
    true
  );
  assert.equal(
    events.filter((event) => event.kind === "retry_progress_recorded").length,
    2
  );
});

test("T-098 negative: latest-only objects are not full retry frontier projections", () => {
  assert.throws(
    () =>
      assertFullRetryFrontierProjection({
        projection: {
          kind: "latest_gap_dossier",
          rows: []
        }
      }),
    /full retry frontier/i
  );

  assert.throws(
    () =>
      assertFullRetryFrontierProjection({
        projection: {
          kind: "retry_frontier_projection",
          basisId: "basis://spoof",
          graphFunctionId: "graph-function://spoof",
          graphCallId: "graph-call://spoof",
          frameId: "frame://spoof",
          vectorIndex: 0,
          edge: "input→output",
          frontierRef:
            'retry-frontier:{"basisId":"basis://spoof","vectorIndex":0,"rows":[]}',
          isFullFrontier: true,
          rows: [],
          reasonClasses: ["blocking_reason"],
          attemptCount: 1,
          latestAttemptIndex: 1
        }
      }),
    /reason classes|attempt 1/i
  );
});
