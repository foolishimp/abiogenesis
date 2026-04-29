// Validates: REQ-P-INSTALL
// Validates: REQ-P-QUAL

import test from "node:test";
import assert from "node:assert/strict";
import {
  access,
  mkdtemp,
  readFile,
  writeFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { installAbiogenesisTypescript } from "../../build/semantic/code/src/app/m04/install_bootstrap/index.js";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function locateRepoRoot() {
  let current = TEST_DIR;
  while (current !== path.dirname(current)) {
    if (
      await pathExists(path.join(current, "specification")) &&
      await pathExists(path.join(current, "build_tenants"))
    ) {
      return current;
    }
    current = path.dirname(current);
  }
  throw new Error("unable to locate abiogenesis repo root");
}

function tenantRoot(repoRoot) {
  return path.join(repoRoot, "build_tenants", "abiogenesis", "typescript");
}

async function makeTargetRoot() {
  return mkdtemp(path.join(tmpdir(), "abiogenesis-ts-t077-public-m05-"));
}

function publicM05ProbeSource() {
  return `
import {
  access,
  mkdir,
  readFile,
  stat,
  writeFile
} from "node:fs/promises";
import path from "node:path";
import {
  buildRunArchiveQualificationRequest,
  constructRunArchiveFinalizationRequest,
  constructRunArchiveFinalizationSourceFileRef,
  constructRunArchiveMetadataRef,
  constructRunArchiveNoteRef,
  constructRunArchiveSummaryRef,
  finalizeRunArchive,
  qualifyRunArchive
} from "@abiogenesis/typescript-tenant/qualification/m05";

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

const writer = {
  ensureDirectory: async (targetPath) => {
    await mkdir(targetPath, { recursive: true });
  },
  writeTextFile: async (targetPath, content) => {
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, content, "utf8");
  },
  readTextFile: async (targetPath) => {
    try {
      return await readFile(targetPath, "utf8");
    } catch {
      return null;
    }
  },
  isDirectory: async (targetPath) => {
    try {
      return (await stat(targetPath)).isDirectory();
    } catch {
      return false;
    }
  },
  isFile: async (targetPath) => {
    try {
      return (await stat(targetPath)).isFile();
    } catch {
      return false;
    }
  }
};

async function writeSource(sourceRoot, relativePath, content) {
  const targetPath = path.join(sourceRoot, relativePath);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, content, "utf8");
  return targetPath;
}

const targetRoot = process.cwd();
const sourceRoot = path.join(targetRoot, ".abiogenesis", "t077-public-m05-source");
const archiveRoot = path.join(
  targetRoot,
  ".ai-workspace",
  "test_runs",
  "t077-public-m05",
  "20260427T000000Z"
);

const eventsPath = await writeSource(sourceRoot, "events/events.jsonl", "{\\"kind\\":\\"basis_admitted\\"}\\n");
const manifestPath = await writeSource(sourceRoot, "manifests/install-manifest.json", "{\\"manifest_id\\":\\"install\\"}\\n");
const resultPath = await writeSource(sourceRoot, "results/result.json", "{\\"result\\":\\"accepted\\"}\\n");
const runtimeIdentityPath = await writeSource(sourceRoot, "runtime/runtime_identity.json", "{\\"runtime_ref\\":\\"runtime://installed-node\\"}\\n");
const commandBindingPath = await writeSource(sourceRoot, "runtime/command_binding.json", "{\\"command\\":\\"abiogenesis-ts start\\"}\\n");
const projectionPath = await writeSource(sourceRoot, "projections/projection.json", "{\\"status\\":\\"converged\\"}\\n");
const postmortemPath = await writeSource(sourceRoot, "postmortem/postmortem.md", "# Public M05 postmortem\\n");
const artifactPath = await writeSource(sourceRoot, "workspace/docs/artifact.md", "# artifact\\n");
const capturedPath = await writeSource(sourceRoot, "captures/raw_response.txt", "raw response\\n");

const finalized = await finalizeRunArchive(
  constructRunArchiveFinalizationRequest({
    scenarioName: "t077_public_m05_archive",
    archiveRoot,
    metadata: constructRunArchiveMetadataRef({
      usecaseId: "t077_public_m05_archive",
      testName: "test_t077_m05_public_sandbox_archive_api_integration",
      timestamp: "20260427T000000Z",
      testPassed: true,
      sourceCommit: "commit://typescript-dev",
      runtimeRef: "runtime://installed-node",
      notes: [
        constructRunArchiveNoteRef({
          label: "public_api",
          timestamp: "2026-04-27T00:00:00Z",
          detail: "downstream package import exercised public M05 archive API"
        })
      ]
    }),
    summary: constructRunArchiveSummaryRef({
      workspacePath: sourceRoot,
      totalEvents: 1,
      eventTypes: ["basis_admitted"],
      manifestFiles: ["install-manifest.json"],
      resultFiles: ["result.json"],
      converged: true,
      totalDelta: 0
    }),
    stdoutLog: "stdout\\n",
    stderrLog: "stderr\\n",
    sourceFiles: [
      constructRunArchiveFinalizationSourceFileRef({
        sourcePath: eventsPath,
        archiveRelativePath: "artifacts/events.jsonl",
        kind: "events"
      }),
      constructRunArchiveFinalizationSourceFileRef({
        sourcePath: manifestPath,
        archiveRelativePath: "artifacts/install-manifest.json",
        kind: "manifest"
      }),
      constructRunArchiveFinalizationSourceFileRef({
        sourcePath: resultPath,
        archiveRelativePath: "artifacts/result.json",
        kind: "result"
      }),
      constructRunArchiveFinalizationSourceFileRef({
        sourcePath: runtimeIdentityPath,
        archiveRelativePath: "artifacts/runtime_identity.json",
        kind: "runtime_identity"
      }),
      constructRunArchiveFinalizationSourceFileRef({
        sourcePath: commandBindingPath,
        archiveRelativePath: "artifacts/command_binding.json",
        kind: "command_binding"
      }),
      constructRunArchiveFinalizationSourceFileRef({
        sourcePath: projectionPath,
        archiveRelativePath: "artifacts/projection.json",
        kind: "projection"
      }),
      constructRunArchiveFinalizationSourceFileRef({
        sourcePath: postmortemPath,
        archiveRelativePath: "postmortem.md",
        kind: "postmortem"
      }),
      constructRunArchiveFinalizationSourceFileRef({
        sourcePath: artifactPath,
        archiveRelativePath: "workspace/docs/artifact.md",
        kind: "workspace_artifact"
      }),
      constructRunArchiveFinalizationSourceFileRef({
        sourcePath: capturedPath,
        archiveRelativePath: "artifacts/raw_response.txt",
        kind: "captured_artifact"
      })
    ]
  }),
  writer
);

if (finalized.kind !== "finalized") {
  console.log(JSON.stringify({ finalized }));
  process.exit(1);
}

const qualification = qualifyRunArchive(buildRunArchiveQualificationRequest(finalized));

console.log(JSON.stringify({
  finalizedKind: finalized.kind,
  qualificationKind: qualification.kind,
  fileKinds: qualification.kind === "passed" ? qualification.fileKinds : [],
  archiveRoot,
  runtimeIdentityExists: await pathExists(path.join(archiveRoot, "artifacts/runtime_identity.json")),
  commandBindingExists: await pathExists(path.join(archiveRoot, "artifacts/command_binding.json")),
  projectionExists: await pathExists(path.join(archiveRoot, "artifacts/projection.json")),
  postmortemExists: await pathExists(path.join(archiveRoot, "postmortem.md"))
}));
`;
}

test("T-077 public M05 sandbox/archive API is package-consumable from an installed runtime", async () => {
  const repoRoot = await locateRepoRoot();
  const sourceRoot = tenantRoot(repoRoot);
  const targetRoot = await makeTargetRoot();

  const installOutcome = await installAbiogenesisTypescript({
    targetRoot: {
      rootPath: targetRoot
    },
    packageSourceRoot: sourceRoot,
    installedPackageName: "abiogenesis-t077-public-m05"
  });

  assert.equal(installOutcome.kind, "installed");

  const probePath = path.join(targetRoot, ".abiogenesis", "t077-public-m05-probe.mjs");
  await writeFile(probePath, publicM05ProbeSource(), "utf8");

  const run = spawnSync("node", [probePath], {
    cwd: targetRoot,
    encoding: "utf8"
  });

  assert.equal(run.status, 0, run.stderr || run.stdout);
  const payload = JSON.parse(run.stdout);

  assert.equal(payload.finalizedKind, "finalized");
  assert.equal(payload.qualificationKind, "passed");
  assert.deepStrictEqual(payload.fileKinds, [
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
  ]);
  assert.equal(payload.runtimeIdentityExists, true);
  assert.equal(payload.commandBindingExists, true);
  assert.equal(payload.projectionExists, true);
  assert.equal(payload.postmortemExists, true);

  assert.equal(await pathExists(path.join(payload.archiveRoot, "run.json")), true);
  assert.equal(
    await readFile(path.join(payload.archiveRoot, "postmortem.md"), "utf8"),
    "# Public M05 postmortem\n"
  );
});
