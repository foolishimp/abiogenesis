// Validates: REQ-R-ABG3-INTERPRET
// Investigates: T-060

import test from "node:test";
import assert from "node:assert/strict";

import {
  COMPUTE_BASIS_FAILURE_CLASS_VALUES,
  admitResolvedPolicyIdentity
} from "../../build/semantic/code/src/index.js";

test("T-060 taxonomy: missing runtime compute basis is named no_compute_basis", () => {
  assert.deepStrictEqual(COMPUTE_BASIS_FAILURE_CLASS_VALUES, [
    "no_compute_basis"
  ]);

  assert.throws(
    () =>
      admitResolvedPolicyIdentity({
        resolvedPolicyBundleRef: "policy://t060/no-basis"
      }),
    /no_compute_basis/
  );
});

test("T-060 taxonomy: invalid declared runtime regime remains a separate admission error", () => {
  assert.throws(
    () =>
      admitResolvedPolicyIdentity({
        resolvedPolicyBundleRef: "policy://t060/invalid",
        defaultRegime: "identity"
      }),
    /expected one of "F_D", "F_P", "F_H"/
  );
});
