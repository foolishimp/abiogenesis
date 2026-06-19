// Implements: REQ-F-ODDSDLC-040

import type { AbgTypescriptInstallerOutcome } from "@abiogenesis/typescript-tenant/app/m04/install-bootstrap";
import type { InstalledNodePackage, NodePackageBinaryBinding } from "../package_binding/index.js";
import type { SdlcBlockingReason } from "../shared/blocking_reason.js";

export interface OddSdlcTypescriptInstallRequest {
  readonly kind: "odd_sdlc_typescript_install_request";
  readonly targetRoot: string;
  readonly packageSourceRoot: string;
  readonly abgPackageSourceRoot: string;
  readonly abgStandardsSourceRoot: string | null;
  readonly abgDocsSourceRoot: string | null;
  readonly installedPackageName: string;
}

export interface OddSdlcTypescriptRuntimeIdentity {
  readonly kind: "odd_sdlc_typescript_runtime_identity";
  readonly packageName: string;
  readonly packageVersion: string;
  readonly resolvedRuntimeRef: string;
  readonly substrateRuntimeRef: string | null;
}

export type OddSdlcInstructionFileAction = "created" | "prepended" | "updated";

export interface OddSdlcBootstrapGovernance {
  readonly kind: "odd_sdlc_bootstrap_governance";
  readonly aliases: readonly string[];
  readonly methodRefs: readonly string[];
  readonly firstMissingLayerOrder: readonly string[];
  readonly uiAlias: "STDO-UX";
  readonly executionContractRule: string;
}

export interface OddSdlcInstructionFileWrite {
  readonly kind: "odd_sdlc_instruction_file_write";
  readonly filename: "AGENTS.md" | "CLAUDE.md";
  readonly path: string;
  readonly action: OddSdlcInstructionFileAction;
  readonly verified: boolean;
}

export interface OddSdlcTypescriptInstallManifest {
  readonly kind: "odd_sdlc_typescript_install_manifest";
  readonly targetRoot: string;
  readonly productInstallRoot: string;
  readonly installedPackageName: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly packageSourceRoot: string;
  readonly packageRoot: string;
  readonly tarballPath: string;
  readonly commandBindings: readonly NodePackageBinaryBinding[];
  readonly abgCommandPaths: readonly string[];
  readonly abgInstallManifestPath: string;
  readonly abgInstallerManifestPath: string;
  readonly abgRuntimeBindingPath: string;
  readonly bootstrapGuidePath: string;
  readonly instructionFiles: readonly OddSdlcInstructionFileWrite[];
  readonly bootstrapGovernance: OddSdlcBootstrapGovernance;
  readonly normalizationPath: string;
  readonly installManifestPath: string;
  readonly runtimeIdentity: OddSdlcTypescriptRuntimeIdentity;
}

export interface OddSdlcTypescriptInstalledOutcome {
  readonly kind: "installed";
  readonly request: OddSdlcTypescriptInstallRequest;
  readonly productInstallRoot: string;
  readonly installedPackage: InstalledNodePackage;
  readonly abgOutcome: AbgTypescriptInstallerOutcome;
  readonly manifest: OddSdlcTypescriptInstallManifest;
  readonly commandPaths: readonly string[];
  readonly bootstrapGuidePath: string;
  readonly instructionFiles: readonly OddSdlcInstructionFileWrite[];
  readonly normalizationPath: string;
  readonly installManifestPath: string;
}

export interface OddSdlcTypescriptRejectedInstallOutcome {
  readonly kind: "rejected";
  readonly request: OddSdlcTypescriptInstallRequest;
  readonly reason: string;
  readonly blockingReason: SdlcBlockingReason;
}

export type OddSdlcTypescriptInstallOutcome =
  | OddSdlcTypescriptInstalledOutcome
  | OddSdlcTypescriptRejectedInstallOutcome;
