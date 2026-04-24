import test from "node:test";
import assert from "node:assert/strict";

import {
  materializeDeliveryPlan,
  verifyDeliveryPlan
} from "../../build/semantic/code/src/shared/abg_delivery_library/index.js";
import {
  deriveInstallBootstrapPlan,
  installBootstrap
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  installBootstrapPayload,
  makeInstallTargetRoot,
  nodeInstallWriter
} from "./support/install-bootstrap-fixtures.mjs";

test("ABG common delivery library integration: T-019 install/bootstrap still consumes the shared delivery plan helpers", async () => {
  const targetRoot = await makeInstallTargetRoot();
  const writer = nodeInstallWriter();
  const outcome = await installBootstrap(
    installBootstrapPayload(targetRoot),
    writer
  );

  assert.equal(outcome.kind, "installed");
  assert.equal(outcome.verification.packageManifest, true);
  assert.equal(outcome.verification.runtimeDirectory, true);
});

test("ABG common delivery library integration: generic plan materialization and verification stay reusable outside T-019", async () => {
  const targetRoot = await makeInstallTargetRoot();
  const writer = nodeInstallWriter();
  const request = installBootstrapPayload(targetRoot);
  const plan = deriveInstallBootstrapPlan(request);

  await materializeDeliveryPlan(targetRoot, plan, writer);
  const verification = await verifyDeliveryPlan(targetRoot, plan, writer);

  assert.equal(verification.items.every((entry) => entry.verified), true);
  assert.deepStrictEqual(
    verification.items.map((entry) => entry.relativePath),
    [
      ".ai-workspace",
      ".ai-workspace/events",
      ".ai-workspace/runtime",
      ".abiogenesis",
      "bootstrap",
      "package.json",
      ".abiogenesis/install-manifest.json",
      "bootstrap/index.mjs",
      ".ai-workspace/events/events.jsonl"
    ]
  );
});
