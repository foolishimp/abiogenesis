import test from "node:test";
import assert from "node:assert/strict";

import {
  admitPublicLiveStatusRequest,
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

test("T-018 negative proof: live-status rejects start outcome without its admitted start request", () => {
  const { profile, context } = publicStartContext();
  const start_request = requestPayload(profile.name);
  const start_outcome = publicStart(start_request, context, () => {});

  assert.throws(
    () =>
      admitPublicLiveStatusRequest(
        liveStatusPayload({
          start_outcome
        })
      ),
    /start_request/i
  );
});

test("T-018 negative proof: live-status rejects result-assessment outcome without its admitted request", () => {
  const dispatchRequest = fpDispatchRequest();
  const result_assessment_request = resultAssessmentPayload(dispatchRequest);
  const result_assessment_outcome = resultAssessment(
    result_assessment_request,
    () => {}
  );

  assert.throws(
    () =>
      admitPublicLiveStatusRequest(
        liveStatusPayload({
          result_assessment_outcome
        })
      ),
    /result_assessment_request/i
  );
});

test("T-018 negative proof: live-status rejects open-object status bypass in nested upstream truth", () => {
  const { profile } = publicStartContext();
  const start_request = requestPayload(profile.name);

  assert.throws(
    () =>
      admitPublicLiveStatusRequest(
        liveStatusPayload({
          start_request,
          start_outcome: {
            kind: "advanced",
            live_state: "green"
          }
        })
      ),
    /runtimeIdentity|trace/i
  );
});
