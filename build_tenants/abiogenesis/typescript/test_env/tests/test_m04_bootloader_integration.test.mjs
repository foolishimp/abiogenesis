import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import {
  deliverBootloader,
  installBootstrap
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  bootloaderPayload,
  installedRuntimePayload
} from "./support/bootloader-fixtures.mjs";
import {
  makeInstallTargetRoot,
  nodeInstallWriter
} from "./support/install-bootstrap-fixtures.mjs";

test("M04 bootloader integration: package export surface stays aligned at root, m04, and bootloader subpath", async () => {
  const root = await import("@abiogenesis/typescript-tenant");
  const m04 = await import("@abiogenesis/typescript-tenant/app/m04");
  const bootloaderModule = await import(
    "@abiogenesis/typescript-tenant/app/m04/bootloader"
  );

  assert.equal(root.deliverBootloader, deliverBootloader);
  assert.equal(m04.deliverBootloader, deliverBootloader);
  assert.equal(bootloaderModule.deliverBootloader, deliverBootloader);
});

test("M04 bootloader integration: bootloader document delivery and instruction-file injection remain explicit and idempotent", async () => {
  const targetRoot = await makeInstallTargetRoot();
  const writer = nodeInstallWriter();
  await installBootstrap(installedRuntimePayload(targetRoot), writer);
  await writer.writeTextFile(path.join(targetRoot, "AGENTS.md"), "# local agents\n");
  await writer.writeTextFile(path.join(targetRoot, "CLAUDE.md"), "# local claude\n");

  const first = await deliverBootloader(bootloaderPayload(targetRoot), writer);
  const second = await deliverBootloader(bootloaderPayload(targetRoot), writer);

  assert.equal(first.kind, "installed");
  assert.equal(second.kind, "installed");
  assert.equal(first.verification.bootloaderDocument, true);
  assert.equal(
    first.verification.instructionTargets.every((entry) => entry.verified),
    true
  );

  const agents = await writer.readTextFile(path.join(targetRoot, "AGENTS.md"));
  const claude = await writer.readTextFile(path.join(targetRoot, "CLAUDE.md"));
  const doc = await writer.readTextFile(
    path.join(targetRoot, "docs/GTL_BOOTLOADER.md")
  );

  assert.match(agents, /GTL_BOOTLOADER_START/);
  assert.match(claude, /GTL_BOOTLOADER_END/);
  assert.match(doc, /# GTL Bootloader/);
});

test("M04 bootloader integration: broken existing marker state stays rejected", async () => {
  const targetRoot = await makeInstallTargetRoot();
  const writer = nodeInstallWriter();
  await installBootstrap(installedRuntimePayload(targetRoot), writer);
  await writer.writeTextFile(
    path.join(targetRoot, "AGENTS.md"),
    "<!-- GTL_BOOTLOADER_START -->\n# broken bootloader\n"
  );
  await writer.writeTextFile(path.join(targetRoot, "CLAUDE.md"), "# local claude\n");

  const outcome = await deliverBootloader(bootloaderPayload(targetRoot), writer);

  assert.deepStrictEqual(outcome, {
    kind: "rejected",
    targetRoot: {
      rootPath: targetRoot
    },
    reason: "AGENTS.md: instruction markers must appear together"
  });
});
