import test from "node:test";
import assert from "node:assert/strict";

import {
  admitPublicResultAssessmentRequest
} from "../../build/semantic/code/src/app/m04/result_assessment/admission.js";
import {
  runAbiogenesisCli
} from "../../build/semantic/code/src/cli/command.js";
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

test("T-017 negative proof: legacy assess-result command is removed", async () => {
  const stdout = [];
  const stderr = [];
  const exitCode = await runAbiogenesisCli(
    ["assess-result", "--workspace", ".", "--result", "result.json"],
    {
      cwd: () => process.cwd(),
      stdout: (value) => stdout.push(value),
      stderr: (value) => stderr.push(value)
    }
  );

  assert.equal(exitCode, 1);
  assert.match(stdout[0], /unsupported command/u);
  assert.match(stderr[0], /unsupported command/u);
});
