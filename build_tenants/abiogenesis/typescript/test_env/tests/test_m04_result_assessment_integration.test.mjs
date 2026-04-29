// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS
// Validates: REQ-R-ABG3-EVENTS

import test from "node:test";
import assert from "node:assert/strict";

import { resultAssessment } from "../../build/semantic/code/src/app/m04/index.js";
import {
  fpDispatchRequest,
  resultAssessmentPayload
} from "./support/m04-fixtures.mjs";

test("M04 result-assessment integration: package export surface stays aligned at root, m04, and result-assessment subpath", async () => {
  const dispatchRequest = fpDispatchRequest();
  const events = [];
  const outcome = resultAssessment(
    resultAssessmentPayload(dispatchRequest),
    (event) => {
      events.push(event);
    }
  );

  const root = await import("@abiogenesis/typescript-tenant");
  const m04 = await import("@abiogenesis/typescript-tenant/app/m04");
  const resultAssessmentModule = await import(
    "@abiogenesis/typescript-tenant/app/m04/result-assessment"
  );

  assert.equal(root.resultAssessment, resultAssessment);
  assert.equal(m04.resultAssessment, resultAssessment);
  assert.equal(resultAssessmentModule.resultAssessment, resultAssessment);
  assert.equal(outcome.kind, "accepted");
  assert.deepStrictEqual(events.map((event) => event.kind), [
    "authority_snapshot_admitted",
    "payload_observed",
    "payload_validated",
    "evidence_admitted",
    "assessed"
  ]);
});

test("M04 result-assessment integration: identity mismatch stays rejected without assessed-event emission", () => {
  const dispatchRequest = fpDispatchRequest();
  const events = [];

  const outcome = resultAssessment(
    resultAssessmentPayload(dispatchRequest, {
      result_artifact: {
        edge: "design→docs",
        actor: "codex",
        fulfillment_assessments: [
          {
            id: "code_complete",
            evaluator: "code_complete",
            fulfillment_status: "fulfilled",
            fulfillment_detail: "wrong edge",
            blocking_reasons: [],
            evidence_refs: ["proof://runtime"]
          }
        ]
      }
    }),
    (event) => {
      events.push(event);
    }
  );

  assert.equal(outcome.kind, "rejected");
  assert.equal(outcome.ingestKind, "rejected");
  assert.match(outcome.reason, /expected edge/i);
  assert.deepStrictEqual(events, []);
});

test("M04 result-assessment integration: canonical rejection preserves runtime failure class without app-side closure repair", () => {
  const dispatchRequest = fpDispatchRequest();
  const events = [];

  const outcome = resultAssessment(
    resultAssessmentPayload(dispatchRequest, {
      result_artifact: {
        kind: "runtime_failure",
        failureClass: "payload_contract_failure",
        detail: "agent returned no output"
      }
    }),
    (event) => {
      events.push(event);
    }
  );

  assert.deepStrictEqual(events, []);
  assert.deepStrictEqual(outcome, {
    kind: "rejected",
    ingestKind: "runtime_failure",
    failureClass: "payload_contract_failure",
    reason: "agent returned no output",
    trace: null
  });
});

test("M04 result-assessment integration: failure class is carried, not derived from reason text", () => {
  const dispatchRequest = fpDispatchRequest();

  const outcome = resultAssessment(
    resultAssessmentPayload(dispatchRequest, {
      result_artifact: {
        kind: "runtime_failure",
        failureClass: "runtime_unavailable",
        detail: "capability_missing runtime_failure payload_contract_failure"
      }
    }),
    () => {}
  );

  assert.deepStrictEqual(outcome, {
    kind: "rejected",
    ingestKind: "runtime_failure",
    failureClass: "runtime_unavailable",
    reason: "capability_missing runtime_failure payload_contract_failure",
    trace: null
  });
});
