// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitPublicInstallBootstrapRequest,
  deriveInstallBootstrapPlan
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  installBootstrapPayload,
  makeInstallTargetRoot,
  runtimePackageContractPayload
} from "./support/install-bootstrap-fixtures.mjs";

test("M04 install/bootstrap unit: admitted request preserves explicit package/runtime identity", async () => {
  const targetRoot = await makeInstallTargetRoot();
  const request = admitPublicInstallBootstrapRequest(
    installBootstrapPayload(targetRoot)
  );

  assert.equal(request.targetRoot.rootPath, targetRoot);
  assert.equal(request.installedPackageName, "abiogenesis-installed-runtime");
  assert.equal(request.runtimePackage.packageName, "@abiogenesis/typescript-tenant");
  assert.equal(request.runtimePackage.appExportSubpath, "./app/m04");
});

test("M04 install/bootstrap unit: plan derives bounded installed directories and files", async () => {
  const targetRoot = await makeInstallTargetRoot();
  const request = admitPublicInstallBootstrapRequest(
    installBootstrapPayload(targetRoot)
  );
  const plan = deriveInstallBootstrapPlan(request);

  assert.deepStrictEqual(
    plan.directories.map((entry) => entry.relativePath),
    [
      ".ai-workspace",
      ".ai-workspace/events",
      ".ai-workspace/runtime",
      ".abiogenesis",
      "bootstrap"
    ]
  );
  assert.deepStrictEqual(
    plan.files.map((entry) => entry.relativePath),
    [
      "package.json",
      ".abiogenesis/install-manifest.json",
      "bootstrap/index.mjs",
      ".ai-workspace/events/events.jsonl"
    ]
  );
  assert.match(
    plan.files.find((entry) => entry.kind === "bootstrap_entry").content,
    /@abiogenesis\/typescript-tenant\/app\/m04/
  );
});

test("M04 install/bootstrap unit: runtime package contract requires the canonical app export", () => {
  assert.throws(
    () =>
      admitPublicInstallBootstrapRequest(
        installBootstrapPayload("/tmp/abiogenesis-install-contract", {
          runtimePackage: runtimePackageContractPayload({
            requiredExports: Object.freeze([".", "./app/m04/control"])
          })
        })
      ),
    /requiredExports/i
  );
});
