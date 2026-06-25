// Implements: REQ-P-QUAL-018G
// Implements: REQ-P-QUAL-018H
// Implements: REQ-P-SCENARIOS
// Implements: REQ-P-INSTALL

import type {
  InstallTargetRoot,
  PublicInstallBootstrapInstalled
} from "./carriers.js";
import type {
  ToolchainMutableStateRootInput,
  ToolchainMutableStateRoots,
  ToolchainWorkspaceBinding
} from "../toolchain_binding/index.js";

export interface AbgTypescriptInstallerRequest {
  readonly targetRoot: InstallTargetRoot;
  readonly packageSourceRoot: string;
  readonly standardsSourceRoot: string | null;
  readonly docsSourceRoot: string | null;
  readonly installedPackageName: string;
  readonly cleanTargetPolicy: "no_scaffold";
  readonly toolchainRoot: string | null;
  readonly mutableStateRoots: ToolchainMutableStateRootInput | null;
}

export interface AbgTypescriptInstallerRuntimeIdentity {
  readonly workerId: string;
  readonly backendId: "node";
  readonly buildId: string;
  readonly resolvedRuntimeRef: string;
}

export type AbgTypescriptInstallerInstallMode = "fresh" | "refresh";

export interface AbgTypescriptInstallerManifest {
  readonly kind: "abg_typescript_installer_manifest";
  readonly targetRoot: string;
  readonly targetMode: "imported" | "clean_no_project_authority";
  readonly installMode: AbgTypescriptInstallerInstallMode;
  readonly cleanTargetPolicy: "no_scaffold";
  readonly installedPackageName: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly packageSourceRoot: string;
  readonly packageRoot: string;
  readonly tarballPath: string;
  readonly commandPaths: readonly string[];
  readonly standardsSourceRoot: string;
  readonly standardsInstallRoot: string;
  readonly standardsFiles: readonly AbgTypescriptInstallerFileEvidence[];
  readonly docsSourceRoot: string;
  readonly docsInstallRoot: string;
  readonly docsFiles: readonly AbgTypescriptInstallerFileEvidence[];
  readonly abgConfigSourcePath: string;
  readonly abgConfigPath: string;
  readonly abgConfigFile: AbgTypescriptInstallerFileEvidence;
  readonly runtimeIdentity: AbgTypescriptInstallerRuntimeIdentity;
  readonly runtimeBindingPath: string;
  readonly toolchainBindingPath: string;
  readonly toolchainBinding: ToolchainWorkspaceBinding;
  readonly installManifestPath: string;
  readonly installerManifestPath: string;
  readonly installProvenancePath: string;
  readonly bootstrapEntryPath: string;
  readonly eventsPath: string;
  readonly runtimeDirectory: string;
  readonly projectionDirectory: string;
  readonly archiveDirectory: string;
  readonly mutableStateRoots: ToolchainMutableStateRoots;
}

export interface AbgTypescriptInstallerFileEvidence {
  readonly relativePath: string;
  readonly bytes: number;
  readonly sha256: string;
}

export interface AbgTypescriptInstallerTopologyVerification {
  readonly kind: "abg_typescript_install_topology_verification";
  readonly targetRoot: string;
  readonly complete: boolean;
  readonly targetMode: "imported" | "clean_no_project_authority";
  readonly cleanTargetPolicy: "no_scaffold";
  readonly missingPaths: readonly string[];
  readonly substrateRootPresent: boolean;
  readonly packageRootPresent: boolean;
  readonly commandBindingsPresent: boolean;
  readonly installManifestPresent: boolean;
  readonly installerManifestPresent: boolean;
  readonly installProvenancePresent: boolean;
  readonly bootstrapEntryPresent: boolean;
  readonly eventsPathPresent: boolean;
  readonly runtimeDirectoryPresent: boolean;
  readonly runtimeBindingPresent: boolean;
  readonly toolchainBindingPresent: boolean;
  readonly abgConfigPresent: boolean;
  readonly standardsRootPresent: boolean;
  readonly standardsSmokeFilesPresent: boolean;
  readonly docsRootPresent: boolean;
}

export interface AbgTypescriptInstallerInstalled {
  readonly kind: "installed";
  readonly targetRoot: InstallTargetRoot;
  readonly targetMode: "imported" | "clean_no_project_authority";
  readonly installMode: AbgTypescriptInstallerInstallMode;
  readonly cleanTargetPolicy: "no_scaffold";
  readonly installedPackageName: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly packageSourceRoot: string;
  readonly packageRoot: string;
  readonly tarballPath: string;
  readonly commandPaths: readonly string[];
  readonly standardsSourceRoot: string;
  readonly standardsInstallRoot: string;
  readonly standardsFiles: readonly AbgTypescriptInstallerFileEvidence[];
  readonly docsSourceRoot: string;
  readonly docsInstallRoot: string;
  readonly docsFiles: readonly AbgTypescriptInstallerFileEvidence[];
  readonly abgConfigSourcePath: string;
  readonly abgConfigPath: string;
  readonly abgConfigFile: AbgTypescriptInstallerFileEvidence;
  readonly runtimeIdentity: AbgTypescriptInstallerRuntimeIdentity;
  readonly runtimeBindingPath: string;
  readonly toolchainBindingPath: string;
  readonly toolchainBinding: ToolchainWorkspaceBinding;
  readonly installManifestPath: string;
  readonly installerManifestPath: string;
  readonly installProvenancePath: string;
  readonly bootstrapEntryPath: string;
  readonly eventsPath: string;
  readonly runtimeDirectory: string;
  readonly projectionDirectory: string;
  readonly archiveDirectory: string;
  readonly mutableStateRoots: ToolchainMutableStateRoots;
  readonly installBootstrapOutcome: PublicInstallBootstrapInstalled;
  readonly topologyVerification: AbgTypescriptInstallerTopologyVerification;
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
