// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import assert from "node:assert/strict";
import test from "node:test";

import {
  admitPublicResultAssessmentRequest
} from "../../build/semantic/code/src/app/m04/result_assessment/admission.js";
import {
  constructRuntimeEventsForResultAssessment
} from "../../build/semantic/code/src/app/m04/result_assessment/constructors.js";
import {
  fpDispatchRequest,
  resultAssessmentPayload
} from "./support/m04-fixtures.mjs";

test("M04 result-assessment unit: request admission preserves contract and obligation identity", () => {
  const request = admitPublicResultAssessmentRequest(
    resultAssessmentPayload(fpDispatchRequest())
  );

  assert.equal(request.kind, "fp_assessed");
  assert.equal(request.manifestProvenance.specHash, "spec://typescript-dev");
  assert.equal(
    request.manifestProvenance.manifestId,
    "manifest://m04-result-profile"
  );
  assert.equal(request.publishedLedgerRef.ref, "ledger://m04-result-profile");
  assert.deepEqual(
    request.fulfillmentRefs.map((entry) => entry.obligationId),
    ["code_complete"]
  );
});

test("M04 result-assessment unit: public F_P evidence cannot bypass replay-bound assessment truth", () => {
  const request = admitPublicResultAssessmentRequest(
    resultAssessmentPayload(fpDispatchRequest())
  );
  const fabricatedAuthority = {
    kind: "replay_admitted_result_assessment_evidence_authority",
    basisId: request.dispatchRequest.basisId,
    graphCallId: request.dispatchRequest.graphCallId,
    frameId: request.dispatchRequest.frameId,
    vectorIndex: request.dispatchRequest.vectorIndex,
    runtimeResultRef: request.dispatchRequest.resultRef,
    runtimeResultDigest: "sha256:" + "0".repeat(64),
    rows: [],
    evidenceEventRefs: [],
    causationEventRefs: []
  };

  assert.throws(
    () => constructRuntimeEventsForResultAssessment(
      request,
      fabricatedAuthority
    ),
    /requires one replay-bound semantic request/u
  );
});
