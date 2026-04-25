// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitPublicLiveStatusRequest,
  projectLiveStatusFromRequest,
  publicControlLoop,
  publicStart,
  resultAssessment
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  controlLoopPayload,
  fpDispatchRequest,
  liveStatusPayload,
  publicStartContext,
  requestPayload,
  resultAssessmentPayload
} from "./support/m04-fixtures.mjs";

test("M04 live-status unit: admitted request preserves bounded upstream carrier truth", () => {
  const { profile, context } = publicStartContext();
  const start_request = requestPayload(profile.name);
  const start_outcome = publicStart(start_request, context, () => {});
  const dispatchRequest = fpDispatchRequest();
  const result_assessment_request = resultAssessmentPayload(dispatchRequest);
  const result_assessment_outcome = resultAssessment(
    result_assessment_request,
    () => {}
  );

  const request = admitPublicLiveStatusRequest(
    liveStatusPayload({
      start_request,
      start_outcome,
      result_assessment_request,
      result_assessment_outcome
    })
  );

  assert.equal(request.startRequest.startIntent.target.handle, profile.name);
  assert.equal(request.startOutcome.kind, "advanced");
  assert.equal(request.resultAssessmentRequest.kind, "fp_assessed");
  assert.equal(request.resultAssessmentOutcome.kind, "accepted");
});

test("M04 live-status unit: control-loop dispatch requirement projects bounded attention truth", () => {
  const { profile, context } = publicStartContext({
    policyOverrides: {
      defaultRegime: "F_P",
      dispatchRef: "dispatch://codex"
    }
  });
  const control_request = controlLoopPayload(profile.name);
  const control_outcome = publicControlLoop(control_request, context, () => {});

  const projection = projectLiveStatusFromRequest(
    admitPublicLiveStatusRequest(
      liveStatusPayload({
        control_request,
        control_outcome
      })
    )
  );

  assert.deepStrictEqual(projection, {
    kind: "attention",
    assetType: "run_status",
    runStatus: "blocked",
    reason: "dispatch_required",
    targetHandle: profile.name,
    activeEdge: null,
    runtimeIdentity: control_outcome.runtimeIdentity,
    resultAssessment: null,
    trace: {
      sourceKinds: ["control_request", "control_outcome:dispatch_required"]
    }
  });
});

test("M04 live-status unit: accepted result assessment projects assessed status and ledger visibility", () => {
  const { profile, context } = publicStartContext();
  const start_request = requestPayload(profile.name);
  const start_outcome = publicStart(start_request, context, () => {});
  const dispatchRequest = fpDispatchRequest();
  const result_assessment_request = resultAssessmentPayload(dispatchRequest);
  const result_assessment_outcome = resultAssessment(
    result_assessment_request,
    () => {}
  );

  const projection = projectLiveStatusFromRequest(
    admitPublicLiveStatusRequest(
      liveStatusPayload({
        start_request,
        start_outcome,
        result_assessment_request,
        result_assessment_outcome
      })
    )
  );

  assert.equal(projection.kind, "ready");
  assert.equal(projection.runStatus, "assessed");
  assert.equal(projection.targetHandle, profile.name);
  assert.equal(projection.activeEdge, "design→code");
  assert.deepStrictEqual(projection.resultAssessment, {
    status: "accepted",
    failureClass: null,
    valid: true,
    publishedLedgerRef: "ledger://m04-result-profile",
    assessedCount: 1
  });
});
