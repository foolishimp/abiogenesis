// Validates: REQ-P-QUAL

import test from "node:test";
import assert from "node:assert/strict";

import { qualifyRunArchive } from "../../build/semantic/code/src/qualification/m05/index.js";
import {
  materializeArchiveFixture,
  provisionInstalledRoot
} from "./support/m05-installed-fixtures.mjs";

test("M05 run-archive integration: installed qualification preserves a stable archive root and required postmortem files", async () => {
  const { targetRoot } = await provisionInstalledRoot();
  const { request } = await materializeArchiveFixture(
    targetRoot,
    "installed_live_lane"
  );

  const outcome = qualifyRunArchive(request);

  assert.deepStrictEqual(outcome, {
    kind: "passed",
    scenarioName: "installed_live_lane",
    fileKinds: [
      "run_meta",
      "summary",
      "stdout",
      "stderr",
      "events",
      "manifest",
      "result",
      "workspace_artifact"
    ]
  });
});
