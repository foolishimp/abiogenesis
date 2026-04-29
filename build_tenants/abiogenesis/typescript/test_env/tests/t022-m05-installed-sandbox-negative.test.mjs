// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructInstalledRootObservation,
  constructInstalledSandboxQualificationRequest,
  constructRunArchiveFileRef,
  constructRunArchiveQualificationRequest,
  qualifyInstalledSandbox,
  qualifyRunArchive
} from "../../build/semantic/code/src/qualification/m05/index.js";

test("M05 installed-sandbox negative: missing bootloader delivery fails installed-line qualification", () => {
  const outcome = qualifyInstalledSandbox(
    constructInstalledSandboxQualificationRequest({
      lane: "install",
      installOutcome: {
        kind: "installed",
        targetRoot: {
          rootPath: "/tmp/abiogenesis-installed"
        },
        installedPackageName: "@abiogenesis/typescript-tenant",
        runtimePackage: {
          packageName: "@abiogenesis/typescript-tenant",
          packageVersion: "0.0.0-test",
          dependencyRef: "workspace://typescript",
          appExportSubpath: "./app/m04",
          requiredExports: ["publicStart"]
        },
        plan: {
          directories: [],
          files: []
        },
        verification: {
          packageManifest: true,
          installManifest: true,
          bootstrapEntry: true,
          workspaceEvents: true,
          runtimeDirectory: true
        }
      },
      bootloaderOutcome: {
        kind: "rejected",
        targetRoot: {
          rootPath: "/tmp/abiogenesis-installed"
        },
        reason: "bootloader delivery is incomplete"
      },
      runtimeRoot: constructInstalledRootObservation({
        rootPath: "/tmp/abiogenesis-installed",
        packageBinding: true,
        bootstrapImportPassed: true,
        exportedSurface: [
          "deliverBootloader",
          "installBootstrap",
          "projectLiveStatus",
          "publicStart",
          "resultAssessment"
        ],
        liveScenarioPassed: false
      })
    })
  );

  assert.deepStrictEqual(outcome, {
    kind: "rejected",
    lane: "install",
    reason: "bootloader delivery is incomplete",
    trace: [
      {
        kind: "delivery_root",
        valid: true,
        detail: "installed delivery root is complete"
      },
      {
        kind: "bootloader",
        valid: false,
        detail: "bootloader delivery is incomplete"
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

test("M05 installed-sandbox negative: archive proof fails on unstable path and missing summary", () => {
  const outcome = qualifyRunArchive(
    constructRunArchiveQualificationRequest({
      scenarioName: "broken_archive",
      archiveRoot: "/tmp/archive",
      immutablePath: false,
      files: [
        constructRunArchiveFileRef({
          path: "/tmp/archive/run.json",
          kind: "run_meta",
          exists: true
        }),
        constructRunArchiveFileRef({
          path: "/tmp/archive/stdout.log",
          kind: "stdout",
          exists: true
        }),
        constructRunArchiveFileRef({
          path: "/tmp/archive/stderr.log",
          kind: "stderr",
          exists: true
        }),
        constructRunArchiveFileRef({
          path: "/tmp/archive/events.jsonl",
          kind: "events",
          exists: true
        }),
        constructRunArchiveFileRef({
          path: "/tmp/archive/manifest_m.json",
          kind: "manifest",
          exists: true
        }),
        constructRunArchiveFileRef({
          path: "/tmp/archive/result_m.json",
          kind: "result",
          exists: true
        }),
        constructRunArchiveFileRef({
          path: "/tmp/archive/runtime_identity.json",
          kind: "runtime_identity",
          exists: true
        }),
        constructRunArchiveFileRef({
          path: "/tmp/archive/command_binding.json",
          kind: "command_binding",
          exists: true
        }),
        constructRunArchiveFileRef({
          path: "/tmp/archive/projection.json",
          kind: "projection",
          exists: true
        }),
        constructRunArchiveFileRef({
          path: "/tmp/archive/postmortem.md",
          kind: "postmortem",
          exists: true
        }),
        constructRunArchiveFileRef({
          path: "/tmp/archive/workspace/docs/artifact.md",
          kind: "workspace_artifact",
          exists: true
        })
      ]
    })
  );

  assert.deepStrictEqual(outcome, {
    kind: "rejected",
    scenarioName: "broken_archive",
    reason: "installed run archive is incomplete",
    gaps: [
      {
        kind: "unstable_archive_path",
        ref: "/tmp/archive"
      },
      {
        kind: "missing_archive_kind",
        ref: "summary"
      }
    ]
  });
});
