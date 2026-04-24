// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import { qualifyInstalledSandbox } from "../../build/semantic/code/src/qualification/m05/index.js";
import {
  bootstrapExportProbeSource,
  buildInstalledSandboxRequest,
  linkInstalledTenantPackage,
  provisionInstalledRoot,
  runInstalledNodeScript
} from "./support/m05-installed-fixtures.mjs";

test("M05 installed-sandbox integration: completed delivery surfaces produce an importable installed runtime root", async () => {
  const { targetRoot, writer, installOutcome, bootloaderOutcome } =
    await provisionInstalledRoot();
  await linkInstalledTenantPackage(targetRoot);

  const importProbe = await runInstalledNodeScript(
    targetRoot,
    bootstrapExportProbeSource()
  );

  assert.equal(installOutcome.kind, "installed");
  assert.equal(bootloaderOutcome.kind, "installed");
  assert.equal(importProbe.status, 0, importProbe.stderr);
  const probe = JSON.parse(importProbe.stdout);

  const outcome = qualifyInstalledSandbox(
    buildInstalledSandboxRequest({
      lane: "install",
      installOutcome,
      bootloaderOutcome,
      rootPath: targetRoot,
      packageBinding: await writer.isDirectory(
        path.join(targetRoot, "node_modules/@abiogenesis")
      ),
      bootstrapImportPassed: true,
      exportedSurface: probe.exports,
      liveScenarioPassed: false
    })
  );

  assert.deepStrictEqual(outcome, {
    kind: "passed",
    lane: "install",
    trace: [
      {
        kind: "delivery_root",
        valid: true,
        detail: "installed delivery root is complete"
      },
      {
        kind: "bootloader",
        valid: true,
        detail: "bootloader document and instruction targets are present"
      },
      {
        kind: "package_binding",
        valid: true,
        detail: "installed package binding is present"
      },
      {
        kind: "bootstrap_import",
        valid: true,
        detail: "bootstrap import exposed the required operator surface"
      },
      {
        kind: "live_lane",
        valid: true,
        detail: "install lane does not require a live scenario run"
      }
    ]
  });
});
