// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import assert from "node:assert/strict";
import test from "node:test";

test("M04 result-assessment hard break removes the raw root and M04 package APIs", async () => {
  const root = await import("@abiogenesis/typescript-tenant");
  const m04 = await import("@abiogenesis/typescript-tenant/app/m04");

  assert.equal("resultAssessment" in root, false);
  assert.equal("resultAssessmentFromRequest" in root, false);
  assert.equal("admitPublicResultAssessmentRequest" in root, false);
  assert.equal("resultAssessment" in m04, false);
  assert.equal("resultAssessmentFromRequest" in m04, false);
  assert.equal("admitPublicResultAssessmentRequest" in m04, false);
});

test("M04 result-assessment hard break removes the dedicated package subpath", async () => {
  await assert.rejects(
    import("@abiogenesis/typescript-tenant/app/m04/result-assessment"),
    (error) => {
      assert.equal(error?.code, "ERR_PACKAGE_PATH_NOT_EXPORTED");
      return true;
    }
  );
});
