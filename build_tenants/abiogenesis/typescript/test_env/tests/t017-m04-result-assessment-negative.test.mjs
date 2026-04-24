import test from "node:test";
import assert from "node:assert/strict";

import {
  admitPublicResultAssessmentRequest,
  resultAssessment
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  fpDispatchRequest,
  resultAssessmentPayload
} from "./support/m04-fixtures.mjs";

test("T-017 negative proof: result-assessment rejects non-F_P assessment kind in the first slice", () => {
  const dispatchRequest = fpDispatchRequest();

  assert.throws(
    () =>
      admitPublicResultAssessmentRequest(
        resultAssessmentPayload(dispatchRequest, {
          kind: "fh_assessed"
        })
      ),
    /fp_assessed/i
  );
});

test("T-017 negative proof: result-assessment rejects malformed artifact input before kernel routing", () => {
  const dispatchRequest = fpDispatchRequest();

  assert.throws(
    () =>
      admitPublicResultAssessmentRequest(
        resultAssessmentPayload(dispatchRequest, {
          result_artifact: {
            edge: "design→code",
            actor: "codex"
          }
        })
      ),
    /fulfillment_assessments/i
  );
});

test("T-017 negative proof: result-assessment requires an explicit event sink", () => {
  const dispatchRequest = fpDispatchRequest();

  assert.throws(
    () => resultAssessment(resultAssessmentPayload(dispatchRequest)),
    /eventSink must be provided explicitly/i
  );
});
