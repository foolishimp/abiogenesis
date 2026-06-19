import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync
} from "node:fs";
import path, { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { installAbiogenesisTypescript } from "@abiogenesis/typescript-tenant/app/m04/install-bootstrap";
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

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(TEST_DIR, "../..");
const REPO_ROOT = resolve(PACKAGE_ROOT, "../..");
const ABG_TYPESCRIPT_ROOT = resolve(
  REPO_ROOT,
  "../abiogenesis/build_tenants/abiogenesis/typescript"
);

function stableJson(payload) {
  return `${JSON.stringify(payload, null, 2)}\n`;
}

function sanitizeInstallName(scenarioId) {
  return scenarioId
    .replace(/[^a-zA-Z0-9_-]/gu, "-")
    .replace(/-+/gu, "-")
    .toLowerCase();
}

function commandPath(outcome, commandName) {
  const match = outcome.commandPaths.find(
    (candidate) => basename(candidate) === commandName
  );
  if (match === undefined) {
    throw new Error(`installed ABG command ${commandName} was not bound`);
  }
  return match;
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function writeJson(filePath, payload) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, stableJson(payload), "utf8");
}

function copyTextFile(sourcePath, targetPath) {
  mkdirSync(dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, readFileSync(sourcePath, "utf8"), "utf8");
}

const archiveWriter = {
  ensureDirectory: async (targetPath) => {
    mkdirSync(targetPath, { recursive: true });
  },
  writeTextFile: async (targetPath, content) => {
    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, content, "utf8");
  },
  readTextFile: async (targetPath) => {
    if (!existsSync(targetPath)) {
      return null;
    }
    return readFileSync(targetPath, "utf8");
  },
  isDirectory: async (targetPath) => {
    if (!existsSync(targetPath)) {
      return false;
    }
    return statSync(targetPath).isDirectory();
  },
  isFile: async (targetPath) => {
    if (!existsSync(targetPath)) {
      return false;
    }
    return statSync(targetPath).isFile();
  }
};

function runInstalledCommandProbe(outcome, archiveRoot) {
  const targetRoot = path.join(archiveRoot, "abg_installed_command_probe");
  const genesisCommand = commandPath(outcome, "genesis-ts");
  const args = ["install", "--target", targetRoot];
  const run = spawnSync(genesisCommand, args, {
    cwd: outcome.targetRoot.rootPath,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 10
  });
  let payload = null;
  if (run.stdout.trim().length > 0) {
    try {
      payload = JSON.parse(run.stdout);
    } catch {
      payload = null;
    }
  }
  return {
    command: genesisCommand,
    args,
    cwd: outcome.targetRoot.rootPath,
    status: run.status,
    stdout: run.stdout,
    stderr: run.stderr,
    targetRoot,
    payload
  };
}

export async function provisionAbgInstalledSandbox(input) {
  mkdirSync(input.archiveRoot, { recursive: true });
  const targetRoot = path.join(input.archiveRoot, "abg_installed_workspace");
  const packageSourceRoot = input.packageSourceRoot ?? ABG_TYPESCRIPT_ROOT;
  const outcome = await installAbiogenesisTypescript({
    targetRoot: {
      rootPath: targetRoot
    },
    packageSourceRoot,
    installedPackageName: `odd-sdlc-${sanitizeInstallName(input.scenarioId)}`
  });

  if (outcome.kind !== "installed") {
    throw new Error(`ABG TypeScript installer rejected sandbox: ${outcome.reason}`);
  }

  const commandProbe = runInstalledCommandProbe(outcome, input.archiveRoot);
  const installerManifest = readJson(outcome.installerManifestPath);
  const installManifest = readJson(outcome.installManifestPath);
  const evidenceRoot = path.join(input.archiveRoot, "abg_install");
  const evidence = {
    kind: "odd_sdlc_abg_installed_sandbox_evidence",
    scenarioId: input.scenarioId,
    targetRoot,
    packageName: outcome.packageName,
    packageVersion: outcome.packageVersion,
    packageSourceRoot: outcome.packageSourceRoot,
    packageRoot: outcome.packageRoot,
    commandPaths: outcome.commandPaths,
    runtimeIdentity: outcome.runtimeIdentity,
    installManifestPath: outcome.installManifestPath,
    installerManifestPath: outcome.installerManifestPath,
    eventsPath: outcome.eventsPath,
    runtimeDirectory: outcome.runtimeDirectory,
    commandProbe,
    archiveEvidenceRoot: evidenceRoot
  };

  writeJson(path.join(evidenceRoot, "evidence.json"), evidence);
  writeJson(path.join(evidenceRoot, "runtime_identity.json"), outcome.runtimeIdentity);
  writeJson(path.join(evidenceRoot, "command_probe.json"), commandProbe);
  writeJson(path.join(evidenceRoot, "projection.json"), {
    installerOutcomeKind: outcome.kind,
    packageName: outcome.packageName,
    packageVersion: outcome.packageVersion,
    commandPaths: outcome.commandPaths,
    runtimeIdentity: outcome.runtimeIdentity,
    installVerification: outcome.installBootstrapOutcome.verification,
    commandProbeStatus: commandProbe.status,
    commandProbePackageSourceRoot: commandProbe.payload?.package_source_root ?? null
  });
  writeJson(path.join(evidenceRoot, "result.json"), {
    kind: "odd_sdlc_abg_install_result",
    scenarioId: input.scenarioId,
    installerOutcomeKind: outcome.kind,
    commandProbeStatus: commandProbe.status
  });
  writeFileSync(
    path.join(evidenceRoot, "postmortem.md"),
    [
      "# ABG Installed Sandbox Evidence",
      "",
      `scenario: ${input.scenarioId}`,
      `package: ${outcome.packageName}@${outcome.packageVersion}`,
      `runtime: ${outcome.runtimeIdentity.resolvedRuntimeRef}`,
      `command_probe_status: ${commandProbe.status}`
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(evidenceRoot, "workspace_artifact.md"),
    [
      "# Installed Workspace Artifact",
      "",
      `target_root: ${targetRoot}`,
      `events_path: ${outcome.eventsPath}`
    ].join("\n"),
    "utf8"
  );
  copyTextFile(
    outcome.installerManifestPath,
    path.join(evidenceRoot, "typescript-installer-manifest.json")
  );
  copyTextFile(
    outcome.installManifestPath,
    path.join(evidenceRoot, "install-manifest.json")
  );
  copyTextFile(outcome.eventsPath, path.join(evidenceRoot, "events.jsonl"));

  if (commandProbe.status !== 0) {
    throw new Error(
      `installed genesis-ts command probe failed: ${commandProbe.stderr}`
    );
  }
  if (installerManifest.runtimeIdentity.resolvedRuntimeRef !== outcome.runtimeIdentity.resolvedRuntimeRef) {
    throw new Error("installer manifest runtime identity does not match outcome");
  }
  if (installManifest.runtimePackage.packageName !== outcome.packageName) {
    throw new Error("install manifest runtime package does not match outcome");
  }

  const m05ArchiveRoot = path.join(evidenceRoot, "m05_archive");
  const m05Finalized = await finalizeRunArchive(
    constructRunArchiveFinalizationRequest({
      scenarioName: input.scenarioId,
      archiveRoot: m05ArchiveRoot,
      metadata: constructRunArchiveMetadataRef({
        usecaseId: input.scenarioId,
        testName: "odd_sdlc_abg_installed_sandbox",
        timestamp: new Date().toISOString(),
        testPassed: true,
        sourceCommit: "commit://odd-sdlc-typescript-dev",
        runtimeRef: outcome.runtimeIdentity.resolvedRuntimeRef,
        notes: [
          constructRunArchiveNoteRef({
            label: "public_m05_api",
            timestamp: new Date().toISOString(),
            detail: "odd_sdlc sandbox consumed ABG public M05 archive API"
          })
        ]
      }),
      summary: constructRunArchiveSummaryRef({
        workspacePath: targetRoot,
        totalEvents: 1,
        eventTypes: ["install"],
        manifestFiles: ["install-manifest.json", "typescript-installer-manifest.json"],
        resultFiles: ["result.json"],
        converged: commandProbe.status === 0,
        totalDelta: 0
      }),
      stdoutLog: commandProbe.stdout,
      stderrLog: commandProbe.stderr,
      sourceFiles: [
        constructRunArchiveFinalizationSourceFileRef({
          sourcePath: path.join(evidenceRoot, "events.jsonl"),
          archiveRelativePath: "artifacts/events.jsonl",
          kind: "events"
        }),
        constructRunArchiveFinalizationSourceFileRef({
          sourcePath: path.join(evidenceRoot, "install-manifest.json"),
          archiveRelativePath: "artifacts/install-manifest.json",
          kind: "manifest"
        }),
        constructRunArchiveFinalizationSourceFileRef({
          sourcePath: path.join(evidenceRoot, "result.json"),
          archiveRelativePath: "artifacts/result.json",
          kind: "result"
        }),
        constructRunArchiveFinalizationSourceFileRef({
          sourcePath: path.join(evidenceRoot, "runtime_identity.json"),
          archiveRelativePath: "artifacts/runtime_identity.json",
          kind: "runtime_identity"
        }),
        constructRunArchiveFinalizationSourceFileRef({
          sourcePath: path.join(evidenceRoot, "command_probe.json"),
          archiveRelativePath: "artifacts/command_binding.json",
          kind: "command_binding"
        }),
        constructRunArchiveFinalizationSourceFileRef({
          sourcePath: path.join(evidenceRoot, "projection.json"),
          archiveRelativePath: "artifacts/projection.json",
          kind: "projection"
        }),
        constructRunArchiveFinalizationSourceFileRef({
          sourcePath: path.join(evidenceRoot, "postmortem.md"),
          archiveRelativePath: "postmortem.md",
          kind: "postmortem"
        }),
        constructRunArchiveFinalizationSourceFileRef({
          sourcePath: path.join(evidenceRoot, "workspace_artifact.md"),
          archiveRelativePath: "workspace/docs/installed_workspace_artifact.md",
          kind: "workspace_artifact"
        })
      ]
    }),
    archiveWriter
  );

  if (m05Finalized.kind !== "finalized") {
    throw new Error(
      `ABG public M05 archive finalization failed: ${stableJson(m05Finalized)}`
    );
  }

  const m05ArchiveQualification = qualifyRunArchive(
    buildRunArchiveQualificationRequest(m05Finalized)
  );
  if (m05ArchiveQualification.kind !== "passed") {
    throw new Error(
      `ABG public M05 archive qualification failed: ${stableJson(m05ArchiveQualification)}`
    );
  }

  evidence.m05ArchiveRoot = m05ArchiveRoot;
  evidence.m05ArchiveQualification = m05ArchiveQualification;
  writeJson(path.join(evidenceRoot, "evidence.json"), evidence);

  return evidence;
}

export function assertAbgInstalledSandboxEvidence(evidence) {
  if (evidence.kind !== "odd_sdlc_abg_installed_sandbox_evidence") {
    throw new Error("missing ABG installed sandbox evidence");
  }
  if (evidence.commandProbe.status !== 0) {
    throw new Error("installed ABG command probe did not pass");
  }
  for (const fileName of [
    "evidence.json",
    "runtime_identity.json",
    "command_probe.json",
    "projection.json",
    "result.json",
    "postmortem.md",
    "workspace_artifact.md",
    "typescript-installer-manifest.json",
    "install-manifest.json",
    "events.jsonl",
    "m05_archive/run.json",
    "m05_archive/summary.json",
    "m05_archive/stdout.log",
    "m05_archive/stderr.log",
    "m05_archive/artifacts/events.jsonl",
    "m05_archive/artifacts/install-manifest.json",
    "m05_archive/artifacts/result.json",
    "m05_archive/artifacts/runtime_identity.json",
    "m05_archive/artifacts/command_binding.json",
    "m05_archive/artifacts/projection.json",
    "m05_archive/postmortem.md",
    "m05_archive/workspace/docs/installed_workspace_artifact.md"
  ]) {
    const filePath = path.join(evidence.archiveEvidenceRoot, fileName);
    if (!existsSync(filePath)) {
      throw new Error(`missing ABG install evidence file ${filePath}`);
    }
  }
  if (evidence.m05ArchiveQualification?.kind !== "passed") {
    throw new Error("ABG public M05 archive qualification did not pass");
  }
}

export { ABG_TYPESCRIPT_ROOT, PACKAGE_ROOT, REPO_ROOT };
