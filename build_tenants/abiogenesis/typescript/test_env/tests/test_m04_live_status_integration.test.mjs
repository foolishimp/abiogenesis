// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";

import {
  projectLiveStatus,
  publicStart,
  resultAssessment
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  fpDispatchRequest,
  liveStatusPayload,
  publicStartContext,
  requestPayload,
  resultAssessmentPayload
} from "./support/m04-fixtures.mjs";

test("M04 live-status integration: package export surface stays aligned at root, m04, and live-status subpath", async () => {
  const projection = projectLiveStatus(liveStatusPayload());

  const root = await import("@abiogenesis/typescript-tenant");
  const m04 = await import("@abiogenesis/typescript-tenant/app/m04");
  const liveStatusModule = await import(
    "@abiogenesis/typescript-tenant/app/m04/live-status"
  );

  assert.equal(root.projectLiveStatus, projectLiveStatus);
  assert.equal(m04.projectLiveStatus, projectLiveStatus);
  assert.equal(liveStatusModule.projectLiveStatus, projectLiveStatus);
  assert.deepStrictEqual(projection, {
    kind: "idle",
    assetType: "run_status",
    runStatus: "not_started",
    targetHandle: null,
    activeEdge: null,
    runtimeIdentity: null,
    resultAssessment: null,
    trace: {
      sourceKinds: []
    }
  });
});

test("M04 live-status integration: public-start truth projects converged ready status without inventing result state", () => {
  const { profile, context } = publicStartContext();
  const start_request = requestPayload(profile.name);
  const start_outcome = publicStart(start_request, context, () => {});

  const projection = projectLiveStatus(
    liveStatusPayload({
      start_request,
      start_outcome
    })
  );

  assert.equal(projection.kind, "ready");
  assert.equal(projection.runStatus, "converged");
  assert.equal(projection.targetHandle, profile.name);
  assert.deepStrictEqual(projection.resultAssessment, null);
});

test("M04 live-status integration: rejected result assessment projects runtime failure class as attention truth", () => {
  const dispatchRequest = fpDispatchRequest();
  const result_assessment_request = resultAssessmentPayload(dispatchRequest, {
    result_artifact: {
      kind: "runtime_failure",
      failureClass: "runtime_unavailable",
      detail: "agent timed out"
    }
  });
  const result_assessment_outcome = resultAssessment(
    result_assessment_request,
    () => {}
  );

  const projection = projectLiveStatus(
    liveStatusPayload({
      result_assessment_request,
      result_assessment_outcome
    })
  );

  assert.deepStrictEqual(projection, {
    kind: "attention",
    assetType: "run_status",
    runStatus: "runtime_unavailable",
    reason: "agent timed out",
    targetHandle: null,
    activeEdge: null,
    runtimeIdentity: null,
    resultAssessment: {
      status: "runtime_failure",
      failureClass: "runtime_unavailable",
      valid: false,
      publishedLedgerRef: "ledger://m04-result-profile",
      assessedCount: null
    },
    trace: {
      sourceKinds: [
        "result_assessment_request",
        "result_assessment_outcome:rejected"
      ]
    }
  });
});
