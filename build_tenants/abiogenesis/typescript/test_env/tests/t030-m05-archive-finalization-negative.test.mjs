// Validates: REQ-P-QUAL

import test from "node:test";
import assert from "node:assert/strict";

import { finalizeRunArchive } from "../../build/semantic/code/src/qualification/m05/index.js";
import {
  buildArchiveFinalizationFixture,
  nodeInstallWriter,
  provisionInstalledRoot
} from "./support/m05-installed-fixtures.mjs";

test("T-030 negative proof: archive finalization rejects missing required source files", async () => {
  const { targetRoot } = await provisionInstalledRoot();
  const writer = nodeInstallWriter();
  const { request } = await buildArchiveFinalizationFixture(
    targetRoot,
    "missing_source"
  );

  const brokenRequest = {
    ...request,
    sourceFiles: [
      ...request.sourceFiles,
      {
        sourcePath: `${targetRoot}/missing/events.jsonl`,
        archiveRelativePath: "artifacts/missing.jsonl",
        kind: "events"
      }
    ]
  };

  const outcome = await finalizeRunArchive(brokenRequest, writer);

  assert.deepStrictEqual(outcome, {
    kind: "rejected",
    scenarioName: "missing_source",
    archiveRoot: request.archiveRoot,
    reason: "archive source files are incomplete",
    gaps: [
      {
        kind: "missing_source_file",
        ref: `${targetRoot}/missing/events.jsonl`
      }
    ]
  });
});
