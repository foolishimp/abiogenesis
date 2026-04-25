// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitPublicResultAssessmentRequest,
  resultAssessmentFromRequest
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  fpDispatchRequest,
  resultAssessmentPayload
} from "./support/m04-fixtures.mjs";

test("M04 result-assessment unit: admitted request preserves manifest, ledger, and fulfillment reference truth", () => {
  const dispatchRequest = fpDispatchRequest();
  const request = admitPublicResultAssessmentRequest(
    resultAssessmentPayload(dispatchRequest)
  );

  assert.equal(request.kind, "fp_assessed");
  assert.equal(request.manifestProvenance.specHash, "spec://typescript-dev");
  assert.equal(
    request.manifestProvenance.manifestId,
    "manifest://m04-result-profile"
  );
  assert.equal(request.publishedLedgerRef.ref, "ledger://m04-result-profile");
  assert.deepStrictEqual(
    request.fulfillmentRefs.map((entry) => entry.obligationId),
    ["code_complete"]
  );
});

test("M04 result-assessment unit: accepted route emits one assessed event per admitted fulfillment obligation", () => {
  const dispatchRequest = fpDispatchRequest();
  const request = admitPublicResultAssessmentRequest(
    resultAssessmentPayload(dispatchRequest)
  );
  const events = [];

  const outcome = resultAssessmentFromRequest(request, (event) => {
    events.push(event);
  });

  assert.equal(outcome.kind, "accepted");
  assert.equal(outcome.assessedCount, 1);
  assert.deepStrictEqual(events, [
    {
      kind: "assessed",
      assessmentKind: "fp",
      edge: "design→code",
      obligationId: "code_complete",
      publishedLedgerRef: "ledger://m04-result-profile",
      actor: "codex",
      specHash: "spec://typescript-dev",
      manifestId: "manifest://m04-result-profile",
      workflowVersion: "wf://typescript-dev",
      runId: "run://m04-result",
      workKey: "wk://m04-result",
      selectedWorkerId: dispatchRequest.workerId,
      selectedBackend: dispatchRequest.backendId,
      roleId: "role://runtime",
      authorityRef: "authority://runtime",
      assignmentSource: "policy_resolution",
      resolvedRuntimeRef: "runtime://typescript/node"
    }
  ]);
});

test("M04 result-assessment unit: runtime failure stays rejected with canonical class and emits nothing", () => {
  const dispatchRequest = fpDispatchRequest();
  const request = admitPublicResultAssessmentRequest(
    resultAssessmentPayload(dispatchRequest, {
      result_artifact: {
        kind: "runtime_failure",
        failureClass: "runtime_failure",
        detail: "agent timed out under transport lease"
      }
    })
  );
  const events = [];

  const outcome = resultAssessmentFromRequest(request, (event) => {
    events.push(event);
  });

  assert.deepStrictEqual(events, []);
  assert.deepStrictEqual(outcome, {
    kind: "rejected",
    ingestKind: "runtime_failure",
    failureClass: "runtime_failure",
    reason: "agent timed out under transport lease",
    trace: null
  });
});
