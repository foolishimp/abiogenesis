import type { PublicBootloaderOutcome } from "../../app/m04/bootloader/index.js";
import type { PublicInstallBootstrapOutcome } from "../../app/m04/install_bootstrap/index.js";

export type InstalledQualificationLane = "install" | "live_lane";

export interface InstalledRootObservation {
  readonly rootPath: string;
  readonly packageBinding: boolean;
  readonly bootstrapImportPassed: boolean;
  readonly exportedSurface: readonly string[];
  readonly liveScenarioPassed: boolean;
}

export interface InstalledSandboxQualificationRequest {
  readonly lane: InstalledQualificationLane;
  readonly installOutcome: PublicInstallBootstrapOutcome;
  readonly bootloaderOutcome: PublicBootloaderOutcome;
  readonly runtimeRoot: InstalledRootObservation;
}

export type InstalledSandboxStepKind =
  | "delivery_root"
  | "bootloader"
  | "package_binding"
  | "bootstrap_import"
  | "live_lane";

export interface InstalledSandboxStepRef {
  readonly kind: InstalledSandboxStepKind;
  readonly valid: boolean;
  readonly detail: string;
}

export interface InstalledSandboxQualificationPassed {
  readonly kind: "passed";
  readonly lane: InstalledQualificationLane;
  readonly trace: readonly InstalledSandboxStepRef[];
}

export interface InstalledSandboxQualificationRejected {
  readonly kind: "rejected";
  readonly lane: InstalledQualificationLane;
  readonly reason: string;
  readonly trace: readonly InstalledSandboxStepRef[];
}

export type InstalledSandboxQualificationOutcome =
  | InstalledSandboxQualificationPassed
  | InstalledSandboxQualificationRejected;

export type RunArchiveFileKind =
  | "run_meta"
  | "summary"
  | "stdout"
  | "stderr"
  | "events"
  | "manifest"
  | "result"
  | "workspace_artifact";

export interface RunArchiveFileRef {
  readonly path: string;
  readonly kind: RunArchiveFileKind;
  readonly exists: boolean;
}

export interface RunArchiveQualificationRequest {
  readonly scenarioName: string;
  readonly archiveRoot: string;
  readonly immutablePath: boolean;
  readonly files: readonly RunArchiveFileRef[];
}

export type RunArchiveGapKind =
  | "unstable_archive_path"
  | "missing_archive_file"
  | "missing_archive_kind";

export interface RunArchiveGapRef {
  readonly kind: RunArchiveGapKind;
  readonly ref: string;
}

export interface RunArchiveQualificationPassed {
  readonly kind: "passed";
  readonly scenarioName: string;
  readonly fileKinds: readonly RunArchiveFileKind[];
}

export interface RunArchiveQualificationRejected {
  readonly kind: "rejected";
  readonly scenarioName: string;
  readonly reason: string;
  readonly gaps: readonly RunArchiveGapRef[];
}

export type RunArchiveQualificationOutcome =
  | RunArchiveQualificationPassed
  | RunArchiveQualificationRejected;
