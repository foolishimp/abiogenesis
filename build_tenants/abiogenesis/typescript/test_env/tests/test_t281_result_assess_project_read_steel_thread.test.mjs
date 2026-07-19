import assert from "node:assert/strict";
import test from "node:test";

import {
  invokeCanonicalResultAssessmentWithoutReplayEvidence
} from "./support/canonical-result-assessment-fixture.mjs";
import {
  fpDispatchRequest,
  resultAssessmentPayload
} from "./support/m04-fixtures.mjs";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";

test("T-281 public SDK refuses fixture-authored result assessment authority", async () => {
  const dispatch = fpDispatchRequest({
    selectedResultContractRef: "contract://abg/system-sunny/result@5"
  });
  const events = [];
  const fixture = await invokeCanonicalResultAssessmentWithoutReplayEvidence({
    assessmentRequest: resultAssessmentPayload(dispatch, {
      assessment_contract: {
        ref: dispatch.selectedResultContractRef,
        digest: stableSha256Digest({
          ref: dispatch.selectedResultContractRef
        })
      }
    }),
    events
  });
  assert.equal(fixture.outcome.outcomeKind, "refusal");
  assert.equal(fixture.outcome.value.code, "result_missing");
  assert.match(fixture.outcome.value.message, /T-271 C-call relation/u);
  assert.deepEqual(
    events.map((event) => event.kind),
    ["public_operation_admitted"],
    "a public request cannot manufacture assessed or project.read truth"
  );
});
