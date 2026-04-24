import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import {
  admitPublicInstallBootstrapRequest,
  installBootstrap
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  installBootstrapPayload,
  makeInstallTargetRoot,
  nodeInstallWriter
} from "./support/install-bootstrap-fixtures.mjs";

test("T-019 negative proof: install/bootstrap rejects a relative target root", () => {
  assert.throws(
    () =>
      admitPublicInstallBootstrapRequest(
        installBootstrapPayload("/tmp/will-be-overridden", {
          targetRoot: {
            rootPath: "relative/install-root"
          }
        })
      ),
    /absolute path/i
  );
});

test("T-019 negative proof: install/bootstrap rejects a runtime package contract without the canonical app export", () => {
  assert.throws(
    () =>
      admitPublicInstallBootstrapRequest(
        installBootstrapPayload("/tmp/abiogenesis-install-root", {
          runtimePackage: {
            packageName: "@abiogenesis/typescript-tenant",
            packageVersion: "0.0.0-test",
            dependencyRef: "file:../../build_tenants/abiogenesis/typescript",
            appExportSubpath: "./app/m04/control",
            requiredExports: [".", "./app/m04/control"]
          }
        })
      ),
    /appExportSubpath/i
  );
});

test("T-019 negative proof: install/bootstrap rejects a mismatched existing installed root", async () => {
  const targetRoot = await makeInstallTargetRoot();
  const writer = nodeInstallWriter();
  await writer.writeTextFile(
    path.join(targetRoot, "package.json"),
    JSON.stringify(
      {
        name: "wrong-installed-runtime",
        type: "module",
        dependencies: {
          "@abiogenesis/typescript-tenant": "file:../../build_tenants/abiogenesis/typescript"
        }
      },
      null,
      2
    )
  );

  const outcome = await installBootstrap(
    installBootstrapPayload(targetRoot),
    writer
  );

  assert.deepStrictEqual(outcome, {
    kind: "rejected",
    targetRoot: {
      rootPath: targetRoot
    },
    reason: "existing package.json name does not match installedPackageName"
  });
});
