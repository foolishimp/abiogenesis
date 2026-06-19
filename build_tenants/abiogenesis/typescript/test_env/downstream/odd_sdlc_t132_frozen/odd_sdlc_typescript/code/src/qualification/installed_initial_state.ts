// Implements: REQ-F-ODDSDLC-051
// Implements: REQ-F-ODDSDLC-053
// Implements: REQ-F-ODDSDLC-056

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import path from "node:path";
import { oddSdlcTypescriptProductInstallRoot } from "../install/index.js";
import {
  deriveSdlcConformProjectProfileFromWorkspace,
  type SdlcConformProjectProfile
} from "../workspace/index.js";

export type SdlcInstalledInitialStateStatus = "valid" | "invalid";

export interface SdlcInstalledInitialStatePathCheck {
  readonly kind: "sdlc_installed_initial_state_path_check";
  readonly label: string;
  readonly path: string;
  readonly present: boolean;
}

export interface SdlcInstalledInitialStateCommandCheck {
  readonly kind: "sdlc_installed_initial_state_command_check";
  readonly commandName: "odd-sdlc-ts" | "abiogenesis-ts" | "genesis-ts";
  readonly path: string;
  readonly present: boolean;
}

export interface SdlcInstalledQualificationInitialState {
  readonly kind: "sdlc_installed_qualification_initial_state";
  readonly workspaceRoot: string;
  readonly validationPhase: "before_graph_traversal";
  readonly status: SdlcInstalledInitialStateStatus;
  readonly productInstallRoot: string;
  readonly pathChecks: readonly SdlcInstalledInitialStatePathCheck[];
  readonly commandChecks: readonly SdlcInstalledInitialStateCommandCheck[];
  readonly missingPaths: readonly string[];
  readonly missingCommands: readonly string[];
  readonly oddSdlcRuntimeRef: string | null;
  readonly abgRuntimeRef: string | null;
  readonly conformedProject: SdlcConformProjectProfile;
}

export interface SdlcInstalledInitialStateArchive {
  readonly kind: "sdlc_installed_initial_state_archive";
  readonly archiveRoot: string;
  readonly validationPath: string;
  readonly conformedProjectPath: string;
}

function stableJson(payload: unknown): string {
  return `${JSON.stringify(payload, null, 2)}\n`;
}

interface JsonRecord {
  readonly [key: string]: unknown;
}

function isJsonRecord(input: unknown): input is JsonRecord {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function readJsonRecordIfPresent(filePath: string): JsonRecord | null {
  if (!existsSync(filePath)) {
    return null;
  }
  const parsed: unknown = JSON.parse(readFileSync(filePath, "utf8"));
  return isJsonRecord(parsed) ? parsed : null;
}

function nestedStringField(
  input: JsonRecord | null,
  outerKey: string,
  innerKey: string
): string | null {
  const outerValue = input?.[outerKey];
  if (!isJsonRecord(outerValue)) {
    return null;
  }
  const innerValue = outerValue[innerKey];
  return typeof innerValue === "string" ? innerValue : null;
}

function pathCheck(
  label: string,
  filePath: string
): SdlcInstalledInitialStatePathCheck {
  return Object.freeze({
    kind: "sdlc_installed_initial_state_path_check" as const,
    label,
    path: filePath,
    present: existsSync(filePath)
  });
}

function commandCheck(
  workspaceRoot: string,
  commandName: SdlcInstalledInitialStateCommandCheck["commandName"]
): SdlcInstalledInitialStateCommandCheck {
  const commandPath = path.join(workspaceRoot, "node_modules", ".bin", commandName);
  return Object.freeze({
    kind: "sdlc_installed_initial_state_command_check" as const,
    commandName,
    path: commandPath,
    present: existsSync(commandPath)
  });
}

export function deriveSdlcInstalledQualificationInitialState(input: {
  readonly workspaceRoot: string;
}): SdlcInstalledQualificationInitialState {
  const productInstallRoot = oddSdlcTypescriptProductInstallRoot(input.workspaceRoot);
  const oddSdlcInstallManifestPath = path.join(
    productInstallRoot,
    "install-manifest.json"
  );
  const abgInstallManifestPath = path.join(
    input.workspaceRoot,
    ".abiogenesis",
    "install-manifest.json"
  );
  const abgInstallerManifestPath = path.join(
    input.workspaceRoot,
    ".abiogenesis",
    "typescript-installer-manifest.json"
  );
  const normalizationPath = path.join(
    input.workspaceRoot,
    ".ai-workspace",
    "runtime",
    "odd_sdlc-typescript-installation.json"
  );
  const bootstrapGuidePath = path.join(
    input.workspaceRoot,
    ".ai-workspace",
    "context",
    "odd_sdlc_typescript_bootstrap.md"
  );
  const pathChecks = Object.freeze([
    pathCheck("abg_install_manifest", abgInstallManifestPath),
    pathCheck("abg_installer_manifest", abgInstallerManifestPath),
    pathCheck("odd_sdlc_install_manifest", oddSdlcInstallManifestPath),
    pathCheck("odd_sdlc_normalization", normalizationPath),
    pathCheck("odd_sdlc_bootstrap_guide", bootstrapGuidePath),
    pathCheck("agents_bootstrap", path.join(input.workspaceRoot, "AGENTS.md")),
    pathCheck("claude_bootstrap", path.join(input.workspaceRoot, "CLAUDE.md"))
  ]);
  const commandChecks = Object.freeze([
    commandCheck(input.workspaceRoot, "odd-sdlc-ts"),
    commandCheck(input.workspaceRoot, "abiogenesis-ts"),
    commandCheck(input.workspaceRoot, "genesis-ts")
  ]);
  const missingPaths = Object.freeze(
    pathChecks.filter((check) => !check.present).map((check) => check.path)
  );
  const missingCommands = Object.freeze(
    commandChecks
      .filter((check) => !check.present)
      .map((check) => check.commandName)
  );
  const oddSdlcInstallManifest = readJsonRecordIfPresent(
    oddSdlcInstallManifestPath
  );
  const abgInstallManifest = readJsonRecordIfPresent(abgInstallManifestPath);
  const abgInstallerManifest = readJsonRecordIfPresent(abgInstallerManifestPath);
  const conformedProject = deriveSdlcConformProjectProfileFromWorkspace(
    input.workspaceRoot
  );
  const profileValid =
    conformedProject.activeTenant.length > 0 &&
    conformedProject.selectedOutputRoot.startsWith("build_tenants/") &&
    conformedProject.buildExecutionContract.length > 0 &&
    conformedProject.testExecutionContract.length > 0;
  return Object.freeze({
    kind: "sdlc_installed_qualification_initial_state" as const,
    workspaceRoot: input.workspaceRoot,
    validationPhase: "before_graph_traversal" as const,
    status:
      missingPaths.length === 0 && missingCommands.length === 0 && profileValid
        ? "valid"
        : "invalid",
    productInstallRoot,
    pathChecks,
    commandChecks,
    missingPaths,
    missingCommands,
    oddSdlcRuntimeRef: nestedStringField(
      oddSdlcInstallManifest,
      "runtimeIdentity",
      "resolvedRuntimeRef"
    ),
    abgRuntimeRef:
      nestedStringField(abgInstallerManifest, "runtimeIdentity", "resolvedRuntimeRef") ??
      nestedStringField(abgInstallManifest, "runtimePackage", "packageName"),
    conformedProject
  });
}

export function writeSdlcInstalledQualificationInitialStateArchive(input: {
  readonly archiveRoot: string;
  readonly validation: SdlcInstalledQualificationInitialState;
}): SdlcInstalledInitialStateArchive {
  mkdirSync(input.archiveRoot, { recursive: true });
  const validationPath = path.join(input.archiveRoot, "initial_state_validation.json");
  const conformedProjectPath = path.join(input.archiveRoot, "conformed_project.json");
  writeFileSync(validationPath, stableJson(input.validation), "utf8");
  writeFileSync(conformedProjectPath, stableJson(input.validation.conformedProject), "utf8");
  return Object.freeze({
    kind: "sdlc_installed_initial_state_archive" as const,
    archiveRoot: input.archiveRoot,
    validationPath,
    conformedProjectPath
  });
}
