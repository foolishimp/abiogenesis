import {
  constructDeliveryPlan
} from "../../shared/abg_delivery_library/index.js";
import type {
  DeliveryPlan,
  DeliveryVerification
} from "../../shared/abg_delivery_library/index.js";
import type {
  RunArchiveFileKind,
  RunArchiveFileRef,
  RunArchiveQualificationRequest
} from "./installed_carriers.js";
import {
  constructRunArchiveFileRef,
  constructRunArchiveQualificationRequest
} from "./installed_constructors.js";
import type {
  RunArchiveFinalizationGapKind,
  RunArchiveFinalizationGapRef,
  RunArchiveFinalizationOutcome,
  RunArchiveFinalizationRejected,
  RunArchiveFinalizationRequest,
  RunArchiveFinalizationSourceFileRef,
  RunArchiveFinalized,
  RunArchiveMaterializedFileKind,
  RunArchiveMaterializedFileRef,
  RunArchiveMetadataRef,
  RunArchiveNoteRef,
  RunArchiveSummaryRef
} from "./archive_finalization_carriers.js";

function freezeStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...values].sort());
}

function freezeNotes(values: readonly RunArchiveNoteRef[]): readonly RunArchiveNoteRef[] {
  return Object.freeze(values.map((entry) => constructRunArchiveNoteRef(entry)));
}

function freezeSourceFiles(
  values: readonly RunArchiveFinalizationSourceFileRef[]
): readonly RunArchiveFinalizationSourceFileRef[] {
  return Object.freeze(
    values.map((entry) => constructRunArchiveFinalizationSourceFileRef(entry))
  );
}

function freezeMaterializedFiles(
  values: readonly RunArchiveMaterializedFileRef[]
): readonly RunArchiveMaterializedFileRef[] {
  return Object.freeze(
    values.map((entry) => constructRunArchiveMaterializedFileRef(entry))
  );
}

function freezeGaps(
  values: readonly RunArchiveFinalizationGapRef[]
): readonly RunArchiveFinalizationGapRef[] {
  return Object.freeze(
    values.map((entry) => constructRunArchiveFinalizationGapRef(entry.kind, entry.ref))
  );
}

export function constructRunArchiveNoteRef(
  input: RunArchiveNoteRef
): RunArchiveNoteRef {
  return Object.freeze({
    label: input.label,
    timestamp: input.timestamp,
    detail: input.detail
  });
}

export function constructRunArchiveMetadataRef(
  input: RunArchiveMetadataRef
): RunArchiveMetadataRef {
  return Object.freeze({
    usecaseId: input.usecaseId,
    testName: input.testName,
    timestamp: input.timestamp,
    testPassed: input.testPassed,
    sourceCommit: input.sourceCommit,
    runtimeRef: input.runtimeRef,
    notes: freezeNotes(input.notes)
  });
}

export function constructRunArchiveSummaryRef(
  input: RunArchiveSummaryRef
): RunArchiveSummaryRef {
  return Object.freeze({
    workspacePath: input.workspacePath,
    totalEvents: input.totalEvents,
    eventTypes: freezeStringArray(input.eventTypes),
    manifestFiles: freezeStringArray(input.manifestFiles),
    resultFiles: freezeStringArray(input.resultFiles),
    converged: input.converged,
    totalDelta: input.totalDelta
  });
}

export function constructRunArchiveFinalizationSourceFileRef(
  input: RunArchiveFinalizationSourceFileRef
): RunArchiveFinalizationSourceFileRef {
  return Object.freeze({
    sourcePath: input.sourcePath,
    archiveRelativePath: input.archiveRelativePath,
    kind: input.kind
  });
}

export function constructRunArchiveMaterializedFileRef(
  input: RunArchiveMaterializedFileRef
): RunArchiveMaterializedFileRef {
  return Object.freeze({
    path: input.path,
    kind: input.kind,
    exists: input.exists
  });
}

export function constructRunArchiveFinalizationRequest(
  input: RunArchiveFinalizationRequest
): RunArchiveFinalizationRequest {
  return Object.freeze({
    scenarioName: input.scenarioName,
    archiveRoot: input.archiveRoot,
    metadata: constructRunArchiveMetadataRef(input.metadata),
    summary: constructRunArchiveSummaryRef(input.summary),
    stdoutLog: input.stdoutLog,
    stderrLog: input.stderrLog,
    sourceFiles: freezeSourceFiles(input.sourceFiles)
  });
}

export function constructRunArchiveFinalizationGapRef(
  kind: RunArchiveFinalizationGapKind,
  ref: string
): RunArchiveFinalizationGapRef {
  return Object.freeze({
    kind,
    ref
  });
}

export function constructRunArchiveFinalizedOutcome(input: {
  readonly scenarioName: string;
  readonly archiveRoot: string;
  readonly plan: DeliveryPlan;
  readonly verification: DeliveryVerification;
  readonly files: readonly RunArchiveMaterializedFileRef[];
}): RunArchiveFinalized {
  return Object.freeze({
    kind: "finalized",
    scenarioName: input.scenarioName,
    archiveRoot: input.archiveRoot,
    plan: constructDeliveryPlan(input.plan),
    verification: input.verification,
    files: freezeMaterializedFiles(input.files)
  });
}

export function constructRunArchiveFinalizationRejectedOutcome(input: {
  readonly scenarioName: string;
  readonly archiveRoot: string;
  readonly reason: string;
  readonly gaps: readonly RunArchiveFinalizationGapRef[];
}): RunArchiveFinalizationRejected {
  return Object.freeze({
    kind: "rejected",
    scenarioName: input.scenarioName,
    archiveRoot: input.archiveRoot,
    reason: input.reason,
    gaps: freezeGaps(input.gaps)
  });
}

export function constructRunArchiveFinalizationOutcome(
  outcome: RunArchiveFinalizationOutcome
): RunArchiveFinalizationOutcome {
  return Object.freeze({
    ...outcome
  });
}

function isQualificationFileKind(
  kind: RunArchiveMaterializedFileKind
): kind is RunArchiveFileKind {
  return (
    kind === "run_meta" ||
    kind === "summary" ||
    kind === "stdout" ||
    kind === "stderr" ||
    kind === "events" ||
    kind === "manifest" ||
    kind === "result" ||
    kind === "workspace_artifact"
  );
}

export function buildRunArchiveQualificationRequest(
  outcome: RunArchiveFinalized
): RunArchiveQualificationRequest {
  const files: RunArchiveFileRef[] = [];
  for (const file of outcome.files) {
    if (!isQualificationFileKind(file.kind)) {
      continue;
    }
    files.push(
      constructRunArchiveFileRef({
        path: file.path,
        kind: file.kind,
        exists: file.exists
      })
    );
  }
  return constructRunArchiveQualificationRequest({
    scenarioName: outcome.scenarioName,
    archiveRoot: outcome.archiveRoot,
    immutablePath: true,
    files
  });
}
