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

test("B-030-TS negative proof: callable start rejects downstream control outcome injection", () => {
  const { profile } = publicStartContext();

  assert.throws(
    () =>
      admitPublicCallableStartRequest({
        ...requestPayload(profile.name),
        control_outcome: {
          kind: "converged"
        }
      }),
    /control_outcome|callable-start authority/i
  );
});

test("B-030-TS negative proof: lower-level explicit control law still governs callable admission", () => {
  const { profile } = publicStartContext();

  assert.throws(
    () =>
      admitPublicCallableStartRequest(
        requestPayload(profile.name, {
          until: "first_traversal",
          root_mode: "supervised"
        })
      ),
    /root_mode|converged/i
  );
});

test("B-030-TS negative proof: stop-class projection does not infer capability missing from reason text", () => {
  const stopClass = projectPublicStopClass({
    kind: "attention",
    assetType: "run_status",
    runStatus: "runtime_failure",
    reason: "capability_missing",
    targetHandle: null,
    activeEdge: null,
    runtimeIdentity: null,
    resultAssessment: {
      status: "runtime_failure",
      failureClass: "runtime_failure",
      valid: false,
      publishedLedgerRef: "ledger://failure",
      assessedCount: null
    },
    trace: {
      sourceKinds: ["result_assessment_outcome:rejected"]
    }
  });

  assert.equal(stopClass.kind, "runtime_failure");
  assert.equal(stopClass.runtimeFailureClass, "runtime_failure");
  assert.equal(stopClass.detail, "capability_missing");
});
