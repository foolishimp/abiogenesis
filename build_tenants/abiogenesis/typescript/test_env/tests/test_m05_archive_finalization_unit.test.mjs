// Validates: REQ-P-QUAL

import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRunArchiveQualificationRequest,
  constructRunArchiveFinalizedOutcome,
  constructRunArchiveMaterializedFileRef
} from "../../build/semantic/code/src/qualification/m05/index.js";
import {
  constructDeliveryPlan,
  constructDeliveryVerification
} from "../../build/semantic/code/src/shared/abg_delivery_library/index.js";

test("M05 archive-finalization unit: downstream qualification request preserves required archive kinds and drops captured-only artifacts", () => {
  const outcome = constructRunArchiveFinalizedOutcome({
    scenarioName: "installed_live_lane",
    archiveRoot: "/tmp/archive",
    plan: constructDeliveryPlan({
      directories: [],
      files: []
    }),
    verification: constructDeliveryVerification([]),
    files: [
      constructRunArchiveMaterializedFileRef({
        path: "/tmp/archive/run.json",
        kind: "run_meta",
        exists: true
      }),
      constructRunArchiveMaterializedFileRef({
        path: "/tmp/archive/summary.json",
        kind: "summary",
        exists: true
      }),
      constructRunArchiveMaterializedFileRef({
        path: "/tmp/archive/stdout.log",
        kind: "stdout",
        exists: true
      }),
      constructRunArchiveMaterializedFileRef({
        path: "/tmp/archive/stderr.log",
        kind: "stderr",
        exists: true
      }),
      constructRunArchiveMaterializedFileRef({
        path: "/tmp/archive/artifacts/events.jsonl",
        kind: "events",
        exists: true
      }),
      constructRunArchiveMaterializedFileRef({
        path: "/tmp/archive/artifacts/manifest_m.json",
        kind: "manifest",
        exists: true
      }),
      constructRunArchiveMaterializedFileRef({
        path: "/tmp/archive/artifacts/result_m.json",
        kind: "result",
        exists: true
      }),
      constructRunArchiveMaterializedFileRef({
        path: "/tmp/archive/artifacts/runtime_identity.json",
        kind: "runtime_identity",
        exists: true
      }),
      constructRunArchiveMaterializedFileRef({
        path: "/tmp/archive/artifacts/command_binding.json",
        kind: "command_binding",
        exists: true
      }),
      constructRunArchiveMaterializedFileRef({
        path: "/tmp/archive/artifacts/projection.json",
        kind: "projection",
        exists: true
      }),
      constructRunArchiveMaterializedFileRef({
        path: "/tmp/archive/postmortem.md",
        kind: "postmortem",
        exists: true
      }),
      constructRunArchiveMaterializedFileRef({
        path: "/tmp/archive/workspace/docs/artifact.md",
        kind: "workspace_artifact",
        exists: true
      }),
      constructRunArchiveMaterializedFileRef({
        path: "/tmp/archive/artifacts/raw_response.txt",
        kind: "captured_artifact",
        exists: true
      })
    ]
  });

  const request = buildRunArchiveQualificationRequest(outcome);

  assert.deepStrictEqual(
    request.files.map((entry) => entry.kind),
    [
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
  );
});
