// Implements: REQ-P-QUAL-018G
// Implements: REQ-P-QUAL-018H
// Implements: REQ-P-SCENARIOS

import type {
  InstallTargetRoot,
  PublicInstallBootstrapInstalled
} from "./carriers.js";

export interface AbgTypescriptInstallerRequest {
  readonly targetRoot: InstallTargetRoot;
  readonly packageSourceRoot: string;
  readonly installedPackageName: string;
}

export interface AbgTypescriptInstallerRuntimeIdentity {
  readonly workerId: string;
  readonly backendId: "node";
  readonly buildId: string;
  readonly resolvedRuntimeRef: string;
}

export interface AbgTypescriptInstallerManifest {
  readonly kind: "abg_typescript_installer_manifest";
  readonly targetRoot: string;
  readonly installedPackageName: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly packageSourceRoot: string;
  readonly packageRoot: string;
  readonly tarballPath: string;
  readonly commandPaths: readonly string[];
  readonly runtimeIdentity: AbgTypescriptInstallerRuntimeIdentity;
  readonly installManifestPath: string;
  readonly installerManifestPath: string;
  readonly bootstrapEntryPath: string;
  readonly eventsPath: string;
  readonly runtimeDirectory: string;
}

export interface AbgTypescriptInstallerInstalled {
  readonly kind: "installed";
  readonly targetRoot: InstallTargetRoot;
  readonly installedPackageName: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly packageSourceRoot: string;
  readonly packageRoot: string;
  readonly tarballPath: string;
  readonly commandPaths: readonly string[];
  readonly runtimeIdentity: AbgTypescriptInstallerRuntimeIdentity;
  readonly installManifestPath: string;
  readonly installerManifestPath: string;
  readonly bootstrapEntryPath: string;
  readonly eventsPath: string;
  readonly runtimeDirectory: string;
  readonly installBootstrapOutcome: PublicInstallBootstrapInstalled;
  readonly manifest: AbgTypescriptInstallerManifest;
}

export interface AbgTypescriptInstallerRejected {
  readonly kind: "rejected";
  readonly targetRoot: InstallTargetRoot;
  readonly reason: string;
}

export type AbgTypescriptInstallerOutcome =
  | AbgTypescriptInstallerInstalled
  | AbgTypescriptInstallerRejected;
