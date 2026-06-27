// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";
import {
  qualifyInstalledSandbox,
  qualifyInstalledResetPostmortem
} from "../../build/semantic/code/src/qualification/m05/index.js";
import {
  bootstrapExportProbeSource,
  buildInstalledResetPostmortemRequest,
  buildInstalledSandboxRequest,
  installedResetPostmortemSource,
  installPackedTenantPackage,
  provisionInstalledRoot,
  runInstalledNodeScript
} from "./support/m05-installed-fixtures.mjs";

test("M05 installed reset-postmortem integration: installed reset proof derives superseded-run and abandoned-continuation parity from the package surface", async () => {
  const { targetRoot, writer, installerOutcome, installOutcome, bootloaderOutcome } =
    await provisionInstalledRoot();
  await installPackedTenantPackage(targetRoot);

  const importProbe = await runInstalledNodeScript(
    targetRoot,
    bootstrapExportProbeSource()
  );
  assert.equal(importProbe.status, 0, importProbe.stderr);
  const probe = JSON.parse(importProbe.stdout);

  const installedQualification = qualifyInstalledSandbox(
    buildInstalledSandboxRequest({
      lane: "install",
      installOutcome,
      bootloaderOutcome,
      rootPath: targetRoot,
      packageBinding: await writer.isDirectory(installerOutcome.packageRoot),
      bootstrapImportPassed: true,
      exportedSurface: probe.exports,
      liveScenarioPassed: false
    })
  );

  assert.equal(installedQualification.kind, "passed");

  const resetRun = await runInstalledNodeScript(
    targetRoot,
    installedResetPostmortemSource()
  );
  assert.equal(resetRun.status, 0, resetRun.stderr);
  const payload = JSON.parse(resetRun.stdout);

  const outcome = qualifyInstalledResetPostmortem(
    buildInstalledResetPostmortemRequest({
      installedQualification,
      observations: payload.observations
    })
  );

  assert.deepStrictEqual(outcome, {
    kind: "passed",
    runPostmortem: {
      kind: "run_superseded",
      runId: "run://installed-reset-active",
      supersededBy: "reset:workspace",
      status: "superseded"
    },
    continuationPostmortem: {
      kind: "continuation_abandoned",
      continuationId: "continuation:manifest://installed-reset-continuation",
      runId: "run://installed-reset-continuation",
      publishedLedgerRef: "ledger://installed-reset-continuation",
      status: "abandoned"
    }
  });
});
