// Implements: REQ-P-QUAL
// Implements: REQ-P-SCENARIOS

import type { DeliveryPlan } from "../../../shared/abg_delivery_library/index.js";

export interface InstallTargetRoot {
  readonly rootPath: string;
}

export type {
  DeliveryPlan as InstallBootstrapPlan,
  DeliveryVerification as InstallBootstrapVerification,
  DeliveryWriter as InstallBootstrapWriter
} from "../../../shared/abg_delivery_library/index.js";

export interface InstalledRuntimePackageContract {
  readonly packageName: string;
  readonly packageVersion: string;
  readonly dependencyRef: string;
  readonly appExportSubpath: "./app/m04";
  readonly requiredExports: readonly string[];
}

export interface PublicInstallBootstrapRequest {
  readonly targetRoot: InstallTargetRoot;
  readonly installedPackageName: string;
  readonly runtimePackage: InstalledRuntimePackageContract;
}

export interface AbgTypescriptInstallManifest {
  readonly installedPackageName: string;
  readonly targetRoot: string;
  readonly bootstrapEntry: "./bootstrap/index.mjs";
  readonly workspaceRoots: {
    readonly eventsLog: ".ai-workspace/events/events.jsonl";
    readonly runtimeDirectory: ".ai-workspace/runtime";
  };
  readonly runtimePackage: {
    readonly packageName: string;
    readonly packageVersion: string;
    readonly dependencyRef: string;
    readonly appExportSubpath: string;
    readonly requiredExports: readonly string[];
  };
}

export interface InstallVerification {
  readonly packageManifest: boolean;
  readonly installManifest: boolean;
  readonly bootstrapEntry: boolean;
  readonly workspaceEvents: boolean;
  readonly runtimeDirectory: boolean;
}

export interface PublicInstallBootstrapInstalled {
  readonly kind: "installed";
  readonly targetRoot: InstallTargetRoot;
  readonly installedPackageName: string;
  readonly runtimePackage: InstalledRuntimePackageContract;
  readonly plan: DeliveryPlan;
  readonly verification: InstallVerification;
}

export interface PublicInstallBootstrapRejected {
  readonly kind: "rejected";
  readonly targetRoot: InstallTargetRoot;
  readonly reason: string;
}

export type PublicInstallBootstrapOutcome =
  | PublicInstallBootstrapInstalled
  | PublicInstallBootstrapRejected;
