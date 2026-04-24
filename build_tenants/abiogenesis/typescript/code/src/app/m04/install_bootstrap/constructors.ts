import type {
  InstallTargetRoot,
  InstallVerification,
  InstalledRuntimePackageContract,
  PublicInstallBootstrapInstalled,
  PublicInstallBootstrapOutcome,
  PublicInstallBootstrapRejected,
  PublicInstallBootstrapRequest
} from "./carriers.js";
import {
  constructDeliveryPlan
} from "../../../shared/abg_delivery_library/index.js";
import type {
  DeliveryDirectoryRef,
  DeliveryFileRef,
  DeliveryPlan
} from "../../../shared/abg_delivery_library/index.js";

function freezeStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

export function constructInstallTargetRoot(rootPath: string): InstallTargetRoot {
  return Object.freeze({ rootPath });
}

export function constructInstalledRuntimePackageContract(input: {
  readonly packageName: string;
  readonly packageVersion: string;
  readonly dependencyRef: string;
  readonly appExportSubpath: "./app/m04";
  readonly requiredExports: readonly string[];
}): InstalledRuntimePackageContract {
  return Object.freeze({
    packageName: input.packageName,
    packageVersion: input.packageVersion,
    dependencyRef: input.dependencyRef,
    appExportSubpath: input.appExportSubpath,
    requiredExports: freezeStringArray(input.requiredExports)
  });
}

export function constructPublicInstallBootstrapRequest(input: {
  readonly targetRoot: InstallTargetRoot;
  readonly installedPackageName: string;
  readonly runtimePackage: InstalledRuntimePackageContract;
}): PublicInstallBootstrapRequest {
  return Object.freeze({
    targetRoot: input.targetRoot,
    installedPackageName: input.installedPackageName,
    runtimePackage: input.runtimePackage
  });
}

export function constructInstallBootstrapPlan(input: {
  readonly directories: readonly DeliveryDirectoryRef[];
  readonly files: readonly DeliveryFileRef[];
}): DeliveryPlan {
  return constructDeliveryPlan({
    directories: input.directories,
    files: input.files
  });
}

export function constructInstallVerification(
  input: InstallVerification
): InstallVerification {
  return Object.freeze({
    packageManifest: input.packageManifest,
    installManifest: input.installManifest,
    bootstrapEntry: input.bootstrapEntry,
    workspaceEvents: input.workspaceEvents,
    runtimeDirectory: input.runtimeDirectory
  });
}

export function constructInstalledPublicInstallBootstrapOutcome(input: {
  readonly targetRoot: InstallTargetRoot;
  readonly installedPackageName: string;
  readonly runtimePackage: InstalledRuntimePackageContract;
  readonly plan: DeliveryPlan;
  readonly verification: InstallVerification;
}): PublicInstallBootstrapInstalled {
  return Object.freeze({
    kind: "installed",
    targetRoot: input.targetRoot,
    installedPackageName: input.installedPackageName,
    runtimePackage: input.runtimePackage,
    plan: input.plan,
    verification: input.verification
  });
}

export function constructRejectedPublicInstallBootstrapOutcome(input: {
  readonly targetRoot: InstallTargetRoot;
  readonly reason: string;
}): PublicInstallBootstrapRejected {
  return Object.freeze({
    kind: "rejected",
    targetRoot: input.targetRoot,
    reason: input.reason
  });
}

export function constructPublicInstallBootstrapOutcome(
  outcome: PublicInstallBootstrapOutcome
): PublicInstallBootstrapOutcome {
  return outcome;
}
