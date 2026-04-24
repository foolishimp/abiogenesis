// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import { qualifyInstalledSandbox } from "../../build/semantic/code/src/qualification/m05/index.js";
import {
  buildInstalledSandboxRequest,
  installedLiveLaneSource,
  linkInstalledTenantPackage,
  provisionInstalledRoot,
  runInstalledNodeScript
} from "./support/m05-installed-fixtures.mjs";

test("M05 installed live-lane integration: installed runtime executes one bounded public scenario through the installed package surface", async () => {
  const { targetRoot, writer, installOutcome, bootloaderOutcome } =
    await provisionInstalledRoot();
  await linkInstalledTenantPackage(targetRoot);

  const liveRun = await runInstalledNodeScript(
    targetRoot,
    installedLiveLaneSource()
  );

  assert.equal(liveRun.status, 0, liveRun.stderr);
  const payload = JSON.parse(liveRun.stdout);
  assert.equal(payload.liveScenarioPassed, true);

  const outcome = qualifyInstalledSandbox(
    buildInstalledSandboxRequest({
      lane: "live_lane",
      installOutcome,
      bootloaderOutcome,
      rootPath: targetRoot,
      packageBinding: await writer.isDirectory(
        path.join(targetRoot, "node_modules/@abiogenesis")
      ),
      bootstrapImportPassed: true,
      exportedSurface: payload.exports,
      liveScenarioPassed: payload.liveScenarioPassed
    })
  );

  assert.equal(outcome.kind, "passed");
  assert.equal(outcome.lane, "live_lane");
});
