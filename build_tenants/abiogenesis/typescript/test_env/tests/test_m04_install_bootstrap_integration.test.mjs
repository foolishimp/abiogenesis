// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import { installBootstrap } from "../../build/semantic/code/src/app/m04/index.js";
import {
  installBootstrapPayload,
  makeInstallTargetRoot,
  nodeInstallWriter
} from "./support/install-bootstrap-fixtures.mjs";

test("M04 install/bootstrap integration: package export surface stays aligned at root, m04, and install-bootstrap subpath", async () => {
  const root = await import("@abiogenesis/typescript-tenant");
  const m04 = await import("@abiogenesis/typescript-tenant/app/m04");
  const installModule = await import(
    "@abiogenesis/typescript-tenant/app/m04/install-bootstrap"
  );

  assert.equal(root.installBootstrap, installBootstrap);
  assert.equal(m04.installBootstrap, installBootstrap);
  assert.equal(installModule.installBootstrap, installBootstrap);
});

test("M04 install/bootstrap integration: install materializes package-first installed runtime root", async () => {
  const targetRoot = await makeInstallTargetRoot();
  const writer = nodeInstallWriter();
  const outcome = await installBootstrap(
    installBootstrapPayload(targetRoot),
    writer
  );

  assert.equal(outcome.kind, "installed");
  assert.deepStrictEqual(outcome.verification, {
    packageManifest: true,
    installManifest: true,
    bootstrapEntry: true,
    workspaceEvents: true,
    runtimeDirectory: true
  });

  const packageJson = JSON.parse(
    await writer.readTextFile(path.join(targetRoot, "package.json"))
  );
  const installManifest = JSON.parse(
    await writer.readTextFile(
      path.join(targetRoot, ".abiogenesis/install-manifest.json")
    )
  );
  const bootstrapEntry = await writer.readTextFile(
    path.join(targetRoot, "bootstrap/index.mjs")
  );

  assert.equal(packageJson.name, "abiogenesis-installed-runtime");
  assert.equal(
    packageJson.dependencies["@abiogenesis/typescript-tenant"],
    "file:../../build_tenants/abiogenesis/typescript"
  );
  assert.equal(installManifest.bootstrapEntry, "./bootstrap/index.mjs");
  assert.match(bootstrapEntry, /export \* from "@abiogenesis\/typescript-tenant\/app\/m04";/);
});

test("M04 install/bootstrap integration: reinstall stays idempotent on a matching installed root", async () => {
  const targetRoot = await makeInstallTargetRoot();
  const writer = nodeInstallWriter();
  const request = installBootstrapPayload(targetRoot);

  const first = await installBootstrap(request, writer);
  const second = await installBootstrap(request, writer);

  assert.equal(first.kind, "installed");
  assert.equal(second.kind, "installed");
  assert.deepStrictEqual(second.verification, first.verification);
});
