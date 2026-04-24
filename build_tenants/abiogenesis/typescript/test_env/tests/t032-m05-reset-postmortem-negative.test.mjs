// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructPassedInstalledSandboxQualificationOutcome,
  qualifyInstalledResetPostmortem
} from "../../build/semantic/code/src/qualification/m05/index.js";
import { buildInstalledResetPostmortemRequest } from "./support/m05-installed-fixtures.mjs";

test("T-032 negative proof: continuation parity rejects missing manifest provenance", () => {
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
          manifestId: null,
          publishedLedgerRef: "ledger://reset-continuation"
        }
      ]
    })
  );

  assert.deepStrictEqual(outcome, {
    kind: "rejected",
    reason: "installed reset postmortem parity is incomplete",
    gaps: [
      {
        kind: "missing_manifest_id",
        ref: "open_continuation_abandoned"
      }
    ]
  });
});
