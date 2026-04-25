// Validates: REQ-P-POLICY
// Validates: REQ-R-ABG3-RUN

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitPublicCallableStartRequest,
  projectPublicStopClass
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  publicStartContext,
  requestPayload
} from "./support/m04-fixtures.mjs";

test("M04 complete-start unit: bare callable start admits maximum lawful defaults", () => {
  const { profile } = publicStartContext();
  const { until: _until, ...bareStart } = requestPayload(profile.name);
  const request = admitPublicCallableStartRequest(bareStart);

  assert.equal(request.kind, "callable_start_request");
  assert.equal(request.startRequest.startIntent.until, "converged");
  assert.equal(request.startRequest.controlModes.fhMode, "direct");
  assert.equal(request.startRequest.controlModes.rootMode, "supervised");
  assert.equal(request.startRequest.startIntent.target.handle, profile.name);
});

test("M04 complete-start unit: non-converged callable starts default to direct root mode", () => {
  const { profile } = publicStartContext();
  const request = admitPublicCallableStartRequest(
    requestPayload(profile.name, {
      until: "first_traversal"
    })
  );

  assert.equal(request.startRequest.startIntent.until, "first_traversal");
  assert.equal(request.startRequest.controlModes.rootMode, "direct");
});

test("M04 complete-start unit: stop-class projection preserves runtime failure class over reason text", () => {
  const stopClass = projectPublicStopClass({
    kind: "attention",
    assetType: "run_status",
    runStatus: "runtime_unavailable",
    reason: "capability_missing runtime_failure",
    targetHandle: null,
    activeEdge: null,
    runtimeIdentity: null,
    resultAssessment: {
      status: "runtime_failure",
      failureClass: "runtime_unavailable",
      valid: false,
      publishedLedgerRef: "ledger://failure",
      assessedCount: null
    },
    trace: {
      sourceKinds: ["result_assessment_outcome:rejected"]
    }
  });

  assert.deepStrictEqual(stopClass, {
    kind: "runtime_unavailable",
    detail: "capability_missing runtime_failure",
    source: "live_status",
    runtimeFailureClass: "runtime_unavailable"
  });
});

test("M04 complete-start unit: stop-class projection hides raw public-control stop labels", () => {
  const dispatchStop = projectPublicStopClass({
    kind: "attention",
    assetType: "run_status",
    runStatus: "blocked",
    reason: "dispatch_required",
    targetHandle: "demo",
    activeEdge: null,
    runtimeIdentity: null,
    resultAssessment: null,
    trace: {
      sourceKinds: ["control_outcome:dispatch_required"]
    }
  });
  const humanStop = projectPublicStopClass({
    kind: "attention",
    assetType: "run_status",
    runStatus: "blocked",
    reason: "human_gate_required",
    targetHandle: "demo",
    activeEdge: null,
    runtimeIdentity: null,
    resultAssessment: null,
    trace: {
      sourceKinds: ["control_outcome:human_gate_required"]
    }
  });

  assert.equal(dispatchStop.kind, "worker_dispatch_required");
  assert.equal(humanStop.kind, "human_decision_required");
});
