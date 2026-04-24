import test from "node:test";
import assert from "node:assert/strict";

import {
  constructDispatchExpectation
} from "../../build/semantic/code/src/shared/abg_library/index.js";

test("ABG common library negative: duplicate assessment truth fails closed", () => {
  assert.throws(
    () =>
      constructDispatchExpectation({
        expectedEdge: "design→code",
        assessmentIds: ["code_complete", "code_complete"]
      }),
    /duplicate value/i
  );
});

test("ABG common library negative: reusable library internals are not widened into the public package surface", async () => {
  await assert.rejects(
    import("@abiogenesis/typescript-tenant/shared/abg_library"),
    /ERR_PACKAGE_PATH_NOT_EXPORTED|Package subpath .* is not defined/i
  );
});
