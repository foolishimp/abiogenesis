// Implements: REQ-P-QUAL
// Implements: REQ-P-SCENARIOS

import type {
  AbgTypescriptInstallerInstalled,
  AbgTypescriptInstallerManifest,
  AbgTypescriptInstallerOutcome,
  AbgTypescriptInstallerRejected,
  AbgTypescriptInstallerRequest
} from "./typescript_installer_carriers.js";
import type {
  InstallTargetRoot,
  PublicInstallBootstrapInstalled
} from "./carriers.js";

function freezeStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

export function constructAbgTypescriptInstallerRequest(input: {
  readonly targetRoot: InstallTargetRoot;
  readonly packageSourceRoot: string;
  readonly installedPackageName: string;
}): AbgTypescriptInstallerRequest {
  return Object.freeze({
    targetRoot: input.targetRoot,
    packageSourceRoot: input.packageSourceRoot,
    installedPackageName: input.installedPackageName
  });
}

export function constructAbgTypescriptInstallerManifest(input: {
  readonly targetRoot: string;
  readonly installedPackageName: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly packageSourceRoot: string;
  readonly packageRoot: string;
  readonly tarballPath: string;
  readonly commandPaths: readonly string[];
  readonly installManifestPath: string;
  readonly installerManifestPath: string;
  readonly bootstrapEntryPath: string;
  readonly eventsPath: string;
  readonly runtimeDirectory: string;
}): AbgTypescriptInstallerManifest {
  return Object.freeze({
    kind: "abg_typescript_installer_manifest",
    targetRoot: input.targetRoot,
    installedPackageName: input.installedPackageName,
    packageName: input.packageName,
    packageVersion: input.packageVersion,
    packageSourceRoot: input.packageSourceRoot,
    packageRoot: input.packageRoot,
    tarballPath: input.tarballPath,
    commandPaths: freezeStringArray(input.commandPaths),
    installManifestPath: input.installManifestPath,
    installerManifestPath: input.installerManifestPath,
    bootstrapEntryPath: input.bootstrapEntryPath,
    eventsPath: input.eventsPath,
    runtimeDirectory: input.runtimeDirectory
  });
}

export function constructInstalledAbgTypescriptInstallerOutcome(input: {
  readonly targetRoot: InstallTargetRoot;
  readonly installedPackageName: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly packageSourceRoot: string;
  readonly packageRoot: string;
  readonly tarballPath: string;
  readonly commandPaths: readonly string[];
  readonly installManifestPath: string;
  readonly installerManifestPath: string;
  readonly bootstrapEntryPath: string;
  readonly eventsPath: string;
  readonly runtimeDirectory: string;
  readonly installBootstrapOutcome: PublicInstallBootstrapInstalled;
  readonly manifest: AbgTypescriptInstallerManifest;
}): AbgTypescriptInstallerInstalled {
  return Object.freeze({
    kind: "installed",
    targetRoot: input.targetRoot,
    installedPackageName: input.installedPackageName,
    packageName: input.packageName,
    packageVersion: input.packageVersion,
    packageSourceRoot: input.packageSourceRoot,
    packageRoot: input.packageRoot,
    tarballPath: input.tarballPath,
    commandPaths: freezeStringArray(input.commandPaths),
    installManifestPath: input.installManifestPath,
    installerManifestPath: input.installerManifestPath,
    bootstrapEntryPath: input.bootstrapEntryPath,
    eventsPath: input.eventsPath,
    runtimeDirectory: input.runtimeDirectory,
    installBootstrapOutcome: input.installBootstrapOutcome,
    manifest: input.manifest
  });
}

export function constructRejectedAbgTypescriptInstallerOutcome(input: {
  readonly targetRoot: InstallTargetRoot;
  readonly reason: string;
}): AbgTypescriptInstallerRejected {
  return Object.freeze({
    kind: "rejected",
    targetRoot: input.targetRoot,
    reason: input.reason
  });
}

export function constructAbgTypescriptInstallerOutcome(
  outcome: AbgTypescriptInstallerOutcome
): AbgTypescriptInstallerOutcome {
  return outcome;
}
