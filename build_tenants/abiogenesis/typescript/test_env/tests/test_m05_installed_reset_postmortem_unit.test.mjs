// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructPassedInstalledSandboxQualificationOutcome,
  qualifyInstalledResetPostmortem
} from "../../build/semantic/code/src/qualification/m05/index.js";
import { buildInstalledResetPostmortemRequest } from "./support/m05-installed-fixtures.mjs";

test("M05 installed reset-postmortem unit: qualifier derives superseded run and abandoned continuation from accepted reset observations", () => {
  const outcome = qualifyInstalledResetPostmortem(
    buildInstalledResetPostmortemRequest({
      installedQualification: constructPassedInstalledSandboxQualificationOutcome({
        lane: "install",
        trace: []
      }),
      observations: [
        {
          caseName: "active_run_superseded",
          resetScope: "workspace",
          resetAccepted: true,
          emittedKinds: ["reset"],
          runId: "run://reset-active",
          workKey: "wk://reset-active",
          preResetRunStatus: "blocked",
          assessmentStatus: null,
          manifestId: null,
          publishedLedgerRef: null
        },
        {
          caseName: "open_continuation_abandoned",
          resetScope: "workspace",
          resetAccepted: true,
          emittedKinds: ["reset"],
          runId: "run://reset-continuation",
          workKey: "wk://reset-continuation",
          preResetRunStatus: "rejected",
          assessmentStatus: "unfulfilled",
          manifestId: "manifest://reset-continuation",
          publishedLedgerRef: "ledger://reset-continuation"
        }
      ]
    })
  );

  assert.deepStrictEqual(outcome, {
    kind: "passed",
    runPostmortem: {
      kind: "run_superseded",
      runId: "run://reset-active",
      supersededBy: "reset:workspace",
      status: "superseded"
    },
    continuationPostmortem: {
      kind: "continuation_abandoned",
      continuationId: "continuation:manifest://reset-continuation",
      runId: "run://reset-continuation",
      publishedLedgerRef: "ledger://reset-continuation",
      status: "abandoned"
    }
  });
});
