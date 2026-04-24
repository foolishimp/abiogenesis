import type {
  DeliveryPlan,
  DeliveryVerification,
  DeliveryWriter
} from "../../shared/abg_delivery_library/index.js";
import type {
  RunArchiveFileKind,
  RunArchiveFileRef,
  RunArchiveQualificationRequest
} from "./installed_carriers.js";

export interface RunArchiveNoteRef {
  readonly label: string;
  readonly timestamp: string;
  readonly detail: string;
}

export interface RunArchiveMetadataRef {
  readonly usecaseId: string;
  readonly testName: string;
  readonly timestamp: string;
  readonly testPassed: boolean;
  readonly sourceCommit: string;
  readonly runtimeRef: string;
  readonly notes: readonly RunArchiveNoteRef[];
}

export interface RunArchiveSummaryRef {
  readonly workspacePath: string;
  readonly totalEvents: number;
  readonly eventTypes: readonly string[];
  readonly manifestFiles: readonly string[];
  readonly resultFiles: readonly string[];
  readonly converged: boolean | null;
  readonly totalDelta: number | null;
}

export type RunArchiveMaterializedFileKind =
  | RunArchiveFileKind
  | "captured_artifact";

export interface RunArchiveFinalizationSourceFileRef {
  readonly sourcePath: string;
  readonly archiveRelativePath: string;
  readonly kind: RunArchiveMaterializedFileKind;
}

export interface RunArchiveMaterializedFileRef {
  readonly path: string;
  readonly kind: RunArchiveMaterializedFileKind;
  readonly exists: boolean;
}

export interface RunArchiveFinalizationRequest {
  readonly scenarioName: string;
  readonly archiveRoot: string;
  readonly metadata: RunArchiveMetadataRef;
  readonly summary: RunArchiveSummaryRef;
  readonly stdoutLog: string;
  readonly stderrLog: string;
  readonly sourceFiles: readonly RunArchiveFinalizationSourceFileRef[];
}

export type RunArchiveFinalizationGapKind =
  | "missing_source_file"
  | "materialization_verification_failed";

export interface RunArchiveFinalizationGapRef {
  readonly kind: RunArchiveFinalizationGapKind;
  readonly ref: string;
}

export interface RunArchiveFinalized {
  readonly kind: "finalized";
  readonly scenarioName: string;
  readonly archiveRoot: string;
  readonly plan: DeliveryPlan;
  readonly verification: DeliveryVerification;
  readonly files: readonly RunArchiveMaterializedFileRef[];
}

export interface RunArchiveFinalizationRejected {
  readonly kind: "rejected";
  readonly scenarioName: string;
  readonly archiveRoot: string;
  readonly reason: string;
  readonly gaps: readonly RunArchiveFinalizationGapRef[];
}

export type RunArchiveFinalizationOutcome =
  | RunArchiveFinalized
  | RunArchiveFinalizationRejected;

export type RunArchiveFinalizationWriter = DeliveryWriter;

export type RunArchiveQualificationRequestBuilder = (
  outcome: RunArchiveFinalized
) => RunArchiveQualificationRequest;

export type { RunArchiveFileRef };
