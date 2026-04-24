// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS
// Validates: REQ-R-ABG3-SELFHOSTING-002

import test from "node:test";
import assert from "node:assert/strict";

import { qualifyMethodTrace } from "../../build/semantic/code/src/qualification/m05/index.js";
import { buildMethodTraceRequest } from "./support/m05-fixtures.mjs";

test("M05 method-trace unit: qualification design, proof lanes, and Python reference assets are all declared and present", async () => {
  const request = await buildMethodTraceRequest();
  const outcome = qualifyMethodTrace(request);

  assert.deepStrictEqual(outcome, {
    kind: "passed",
    moduleName: "M05-qualification-scenarios",
    designKinds: [
      "derivation",
      "iacs",
      "structural_carrier_diagram",
      "test_surface_map"
    ],
    proofKinds: ["unit", "integration", "negative"]
  });
});
