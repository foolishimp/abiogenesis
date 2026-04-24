import type {
  InstalledQualificationLane,
  InstalledRootObservation,
  InstalledSandboxQualificationOutcome,
  InstalledSandboxQualificationPassed,
  InstalledSandboxQualificationRejected,
  InstalledSandboxQualificationRequest,
  InstalledSandboxStepKind,
  InstalledSandboxStepRef,
  RunArchiveFileKind,
  RunArchiveFileRef,
  RunArchiveGapKind,
  RunArchiveGapRef,
  RunArchiveQualificationOutcome,
  RunArchiveQualificationPassed,
  RunArchiveQualificationRejected,
  RunArchiveQualificationRequest
} from "./installed_carriers.js";
import type { PublicBootloaderOutcome } from "../../app/m04/bootloader/index.js";
import type { PublicInstallBootstrapOutcome } from "../../app/m04/install_bootstrap/index.js";

function freezeStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

function freezeSteps(
  values: readonly InstalledSandboxStepRef[]
): readonly InstalledSandboxStepRef[] {
  return Object.freeze([...values]);
}

function freezeGaps(
  values: readonly RunArchiveGapRef[]
): readonly RunArchiveGapRef[] {
  return Object.freeze([...values]);
}

export function constructInstalledRootObservation(
  input: InstalledRootObservation
): InstalledRootObservation {
  return Object.freeze({
    rootPath: input.rootPath,
    packageBinding: input.packageBinding,
    bootstrapImportPassed: input.bootstrapImportPassed,
    exportedSurface: freezeStringArray(input.exportedSurface),
    liveScenarioPassed: input.liveScenarioPassed
  });
}

export function constructInstalledSandboxQualificationRequest(input: {
  readonly lane: InstalledQualificationLane;
  readonly installOutcome: PublicInstallBootstrapOutcome;
  readonly bootloaderOutcome: PublicBootloaderOutcome;
  readonly runtimeRoot: InstalledRootObservation;
}): InstalledSandboxQualificationRequest {
  return Object.freeze({
    lane: input.lane,
    installOutcome: input.installOutcome,
    bootloaderOutcome: input.bootloaderOutcome,
    runtimeRoot: input.runtimeRoot
  });
}

export function constructInstalledSandboxStepRef(
  kind: InstalledSandboxStepKind,
  valid: boolean,
  detail: string
): InstalledSandboxStepRef {
  return Object.freeze({
    kind,
    valid,
    detail
  });
}

export function constructPassedInstalledSandboxQualificationOutcome(input: {
  readonly lane: InstalledQualificationLane;
  readonly trace: readonly InstalledSandboxStepRef[];
}): InstalledSandboxQualificationPassed {
  return Object.freeze({
    kind: "passed",
    lane: input.lane,
    trace: freezeSteps(input.trace)
  });
}

export function constructRejectedInstalledSandboxQualificationOutcome(input: {
  readonly lane: InstalledQualificationLane;
  readonly reason: string;
  readonly trace: readonly InstalledSandboxStepRef[];
}): InstalledSandboxQualificationRejected {
  return Object.freeze({
    kind: "rejected",
    lane: input.lane,
    reason: input.reason,
    trace: freezeSteps(input.trace)
  });
}

export function constructInstalledSandboxQualificationOutcome(
  outcome: InstalledSandboxQualificationOutcome
): InstalledSandboxQualificationOutcome {
  return Object.freeze({
    ...outcome
  });
}

export function constructRunArchiveFileRef(
  input: RunArchiveFileRef
): RunArchiveFileRef {
  return Object.freeze({
    path: input.path,
    kind: input.kind,
    exists: input.exists
  });
}

export function constructRunArchiveQualificationRequest(
  input: RunArchiveQualificationRequest
): RunArchiveQualificationRequest {
  return Object.freeze({
    scenarioName: input.scenarioName,
    archiveRoot: input.archiveRoot,
    immutablePath: input.immutablePath,
    files: Object.freeze([...input.files])
  });
}

export function constructRunArchiveGapRef(
  kind: RunArchiveGapKind,
  ref: string
): RunArchiveGapRef {
  return Object.freeze({
    kind,
    ref
  });
}

export function constructPassedRunArchiveQualificationOutcome(input: {
  readonly scenarioName: string;
  readonly fileKinds: readonly RunArchiveFileKind[];
}): RunArchiveQualificationPassed {
  return Object.freeze({
    kind: "passed",
    scenarioName: input.scenarioName,
    fileKinds: Object.freeze([...input.fileKinds])
  });
}

export function constructRejectedRunArchiveQualificationOutcome(input: {
  readonly scenarioName: string;
  readonly reason: string;
  readonly gaps: readonly RunArchiveGapRef[];
}): RunArchiveQualificationRejected {
  return Object.freeze({
    kind: "rejected",
    scenarioName: input.scenarioName,
    reason: input.reason,
    gaps: freezeGaps(input.gaps)
  });
}

export function constructRunArchiveQualificationOutcome(
  outcome: RunArchiveQualificationOutcome
): RunArchiveQualificationOutcome {
  return Object.freeze({
    ...outcome
  });
}
