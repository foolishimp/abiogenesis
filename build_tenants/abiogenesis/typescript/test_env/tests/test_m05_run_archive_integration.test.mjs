// Validates: REQ-P-QUAL

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import {
  buildRunArchiveQualificationRequest,
  finalizeRunArchive,
  qualifyRunArchive
} from "../../build/semantic/code/src/qualification/m05/index.js";
import {
  buildArchiveFinalizationFixture,
  nodeInstallWriter,
  provisionInstalledRoot
} from "./support/m05-installed-fixtures.mjs";

test("M05 run-archive integration: canonical finalizer writes the installed postmortem shape before archive qualification", async () => {
  const { targetRoot } = await provisionInstalledRoot();
  const writer = nodeInstallWriter();
  const { archiveRoot, request } = await buildArchiveFinalizationFixture(
    targetRoot,
    "installed_live_lane"
  );
  const finalized = await finalizeRunArchive(request, writer);

  assert.equal(finalized.kind, "finalized");
  assert.equal(
    await writer.isFile(path.join(archiveRoot, "run.json")),
    true
  );
  assert.equal(
    await writer.isFile(path.join(archiveRoot, "summary.json")),
    true
  );
  assert.equal(
    await writer.isFile(path.join(archiveRoot, "stdout.log")),
    true
  );
  assert.equal(
    await writer.isFile(path.join(archiveRoot, "stderr.log")),
    true
  );
  assert.equal(
    await writer.isFile(path.join(archiveRoot, "artifacts/raw_response.txt")),
    true
  );
  assert.equal(
    await writer.isFile(path.join(archiveRoot, "artifacts/runtime_identity.json")),
    true
  );
  assert.equal(
    await writer.isFile(path.join(archiveRoot, "artifacts/command_binding.json")),
    true
  );
  assert.equal(
    await writer.isFile(path.join(archiveRoot, "artifacts/projection.json")),
    true
  );
  assert.equal(
    await writer.isFile(path.join(archiveRoot, "postmortem.md")),
    true
  );

  const outcome = qualifyRunArchive(
    buildRunArchiveQualificationRequest(finalized)
  );

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
      "runtime_identity",
      "command_binding",
      "projection",
      "postmortem",
      "workspace_artifact"
    ]
  });
});
