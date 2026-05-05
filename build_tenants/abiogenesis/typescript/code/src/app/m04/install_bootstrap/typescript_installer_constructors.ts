// Implements: REQ-P-QUAL-018G
// Implements: REQ-P-QUAL-018H
// Implements: REQ-P-SCENARIOS
// Implements: REQ-P-INSTALL

import type {
  AbgTypescriptInstallerFileEvidence,
  AbgTypescriptInstallerInstallMode,
  AbgTypescriptInstallerInstalled,
  AbgTypescriptInstallerManifest,
  AbgTypescriptInstallerOutcome,
  AbgTypescriptInstallerRejected,
  AbgTypescriptInstallerRequest,
  AbgTypescriptInstallerRuntimeIdentity,
  AbgTypescriptInstallerTopologyVerification
} from "./typescript_installer_carriers.js";
import type {
  InstallTargetRoot,
  PublicInstallBootstrapInstalled
} from "./carriers.js";

function freezeStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

function freezeFileEvidenceArray(
  values: readonly AbgTypescriptInstallerFileEvidence[]
): readonly AbgTypescriptInstallerFileEvidence[] {
  return Object.freeze(
    values.map((value) =>
      Object.freeze({
        relativePath: value.relativePath,
        bytes: value.bytes,
        sha256: value.sha256
      })
    )
  );
}

function freezeTopologyVerification(
  value: AbgTypescriptInstallerTopologyVerification
): AbgTypescriptInstallerTopologyVerification {
  return Object.freeze({
    kind: value.kind,
    targetRoot: value.targetRoot,
    complete: value.complete,
    targetMode: value.targetMode,
    cleanTargetPolicy: value.cleanTargetPolicy,
    missingPaths: freezeStringArray(value.missingPaths),
    substrateRootPresent: value.substrateRootPresent,
    packageRootPresent: value.packageRootPresent,
    commandBindingsPresent: value.commandBindingsPresent,
    installManifestPresent: value.installManifestPresent,
    installerManifestPresent: value.installerManifestPresent,
    installProvenancePresent: value.installProvenancePresent,
    bootstrapEntryPresent: value.bootstrapEntryPresent,
    eventsPathPresent: value.eventsPathPresent,
    runtimeDirectoryPresent: value.runtimeDirectoryPresent,
    runtimeBindingPresent: value.runtimeBindingPresent,
    fallbackConfigPresent: value.fallbackConfigPresent,
    standardsRootPresent: value.standardsRootPresent,
    standardsSmokeFilesPresent: value.standardsSmokeFilesPresent,
    docsRootPresent: value.docsRootPresent
  });
}

export function constructAbgTypescriptInstallerRequest(input: {
  readonly targetRoot: InstallTargetRoot;
  readonly packageSourceRoot: string;
  readonly standardsSourceRoot: string | null;
  readonly docsSourceRoot: string | null;
  readonly installedPackageName: string;
  readonly cleanTargetPolicy: "no_scaffold";
}): AbgTypescriptInstallerRequest {
  return Object.freeze({
    targetRoot: input.targetRoot,
    packageSourceRoot: input.packageSourceRoot,
    standardsSourceRoot: input.standardsSourceRoot,
    docsSourceRoot: input.docsSourceRoot,
    installedPackageName: input.installedPackageName,
    cleanTargetPolicy: input.cleanTargetPolicy
  });
}

export function constructAbgTypescriptInstallerManifest(input: {
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
  readonly fallbackConfigSourcePath: string;
  readonly fallbackConfigPath: string;
  readonly fallbackConfigFile: AbgTypescriptInstallerFileEvidence;
  readonly runtimeIdentity: AbgTypescriptInstallerRuntimeIdentity;
  readonly runtimeBindingPath: string;
  readonly installManifestPath: string;
  readonly installerManifestPath: string;
  readonly installProvenancePath: string;
  readonly bootstrapEntryPath: string;
  readonly eventsPath: string;
  readonly runtimeDirectory: string;
}): AbgTypescriptInstallerManifest {
  return Object.freeze({
    kind: "abg_typescript_installer_manifest",
    targetRoot: input.targetRoot,
    targetMode: input.targetMode,
    installMode: input.installMode,
    cleanTargetPolicy: input.cleanTargetPolicy,
    installedPackageName: input.installedPackageName,
    packageName: input.packageName,
    packageVersion: input.packageVersion,
    packageSourceRoot: input.packageSourceRoot,
    packageRoot: input.packageRoot,
    tarballPath: input.tarballPath,
    commandPaths: freezeStringArray(input.commandPaths),
    standardsSourceRoot: input.standardsSourceRoot,
    standardsInstallRoot: input.standardsInstallRoot,
    standardsFiles: freezeFileEvidenceArray(input.standardsFiles),
    docsSourceRoot: input.docsSourceRoot,
    docsInstallRoot: input.docsInstallRoot,
    docsFiles: freezeFileEvidenceArray(input.docsFiles),
    fallbackConfigSourcePath: input.fallbackConfigSourcePath,
    fallbackConfigPath: input.fallbackConfigPath,
    fallbackConfigFile: Object.freeze({
      relativePath: input.fallbackConfigFile.relativePath,
      bytes: input.fallbackConfigFile.bytes,
      sha256: input.fallbackConfigFile.sha256
    }),
    runtimeIdentity: Object.freeze({
      workerId: input.runtimeIdentity.workerId,
      backendId: input.runtimeIdentity.backendId,
      buildId: input.runtimeIdentity.buildId,
      resolvedRuntimeRef: input.runtimeIdentity.resolvedRuntimeRef
    }),
    runtimeBindingPath: input.runtimeBindingPath,
    installManifestPath: input.installManifestPath,
    installerManifestPath: input.installerManifestPath,
    installProvenancePath: input.installProvenancePath,
    bootstrapEntryPath: input.bootstrapEntryPath,
    eventsPath: input.eventsPath,
    runtimeDirectory: input.runtimeDirectory
  });
}

export function constructInstalledAbgTypescriptInstallerOutcome(input: {
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
  readonly fallbackConfigSourcePath: string;
  readonly fallbackConfigPath: string;
  readonly fallbackConfigFile: AbgTypescriptInstallerFileEvidence;
  readonly runtimeIdentity: AbgTypescriptInstallerRuntimeIdentity;
  readonly runtimeBindingPath: string;
  readonly installManifestPath: string;
  readonly installerManifestPath: string;
  readonly installProvenancePath: string;
  readonly bootstrapEntryPath: string;
  readonly eventsPath: string;
  readonly runtimeDirectory: string;
  readonly installBootstrapOutcome: PublicInstallBootstrapInstalled;
  readonly topologyVerification: AbgTypescriptInstallerTopologyVerification;
  readonly manifest: AbgTypescriptInstallerManifest;
}): AbgTypescriptInstallerInstalled {
  return Object.freeze({
    kind: "installed",
    targetRoot: input.targetRoot,
    targetMode: input.targetMode,
    installMode: input.installMode,
    cleanTargetPolicy: input.cleanTargetPolicy,
    installedPackageName: input.installedPackageName,
    packageName: input.packageName,
    packageVersion: input.packageVersion,
    packageSourceRoot: input.packageSourceRoot,
    packageRoot: input.packageRoot,
    tarballPath: input.tarballPath,
    commandPaths: freezeStringArray(input.commandPaths),
    standardsSourceRoot: input.standardsSourceRoot,
    standardsInstallRoot: input.standardsInstallRoot,
    standardsFiles: freezeFileEvidenceArray(input.standardsFiles),
    docsSourceRoot: input.docsSourceRoot,
    docsInstallRoot: input.docsInstallRoot,
    docsFiles: freezeFileEvidenceArray(input.docsFiles),
    fallbackConfigSourcePath: input.fallbackConfigSourcePath,
    fallbackConfigPath: input.fallbackConfigPath,
    fallbackConfigFile: Object.freeze({
      relativePath: input.fallbackConfigFile.relativePath,
      bytes: input.fallbackConfigFile.bytes,
      sha256: input.fallbackConfigFile.sha256
    }),
    runtimeIdentity: Object.freeze({
      workerId: input.runtimeIdentity.workerId,
      backendId: input.runtimeIdentity.backendId,
      buildId: input.runtimeIdentity.buildId,
      resolvedRuntimeRef: input.runtimeIdentity.resolvedRuntimeRef
    }),
    runtimeBindingPath: input.runtimeBindingPath,
    installManifestPath: input.installManifestPath,
    installerManifestPath: input.installerManifestPath,
    installProvenancePath: input.installProvenancePath,
    bootstrapEntryPath: input.bootstrapEntryPath,
    eventsPath: input.eventsPath,
    runtimeDirectory: input.runtimeDirectory,
    installBootstrapOutcome: input.installBootstrapOutcome,
    topologyVerification: freezeTopologyVerification(input.topologyVerification),
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
