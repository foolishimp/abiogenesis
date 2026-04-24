import type {
  ContinuationAbandonedPostmortemRef,
  InstalledResetPostmortemGapKind,
  InstalledResetPostmortemGapRef,
  InstalledResetPostmortemObservation,
  InstalledResetPostmortemOutcome,
  InstalledResetPostmortemPassed,
  InstalledResetPostmortemRejected,
  InstalledResetPostmortemRequest,
  RunSupersededPostmortemRef
} from "./reset_postmortem_carriers.js";

function freezeStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

function freezeObservations(
  values: readonly InstalledResetPostmortemObservation[]
): readonly InstalledResetPostmortemObservation[] {
  return Object.freeze([...values]);
}

function freezeGaps(
  values: readonly InstalledResetPostmortemGapRef[]
): readonly InstalledResetPostmortemGapRef[] {
  return Object.freeze([...values]);
}

export function constructInstalledResetPostmortemObservation(
  input: InstalledResetPostmortemObservation
): InstalledResetPostmortemObservation {
  return Object.freeze({
    caseName: input.caseName,
    resetScope: input.resetScope,
    resetAccepted: input.resetAccepted,
    emittedKinds: freezeStringArray(input.emittedKinds),
    runId: input.runId,
    workKey: input.workKey,
    preResetRunStatus: input.preResetRunStatus,
    assessmentStatus: input.assessmentStatus,
    manifestId: input.manifestId,
    publishedLedgerRef: input.publishedLedgerRef
  });
}

export function constructInstalledResetPostmortemRequest(input: {
  readonly installedQualification: InstalledResetPostmortemRequest["installedQualification"];
  readonly observations: readonly InstalledResetPostmortemObservation[];
}): InstalledResetPostmortemRequest {
  return Object.freeze({
    installedQualification: input.installedQualification,
    observations: freezeObservations(
      input.observations.map((entry) =>
        constructInstalledResetPostmortemObservation(entry)
      )
    )
  });
}

export function constructInstalledResetPostmortemGapRef(
  kind: InstalledResetPostmortemGapKind,
  ref: string
): InstalledResetPostmortemGapRef {
  return Object.freeze({
    kind,
    ref
  });
}

export function constructRunSupersededPostmortemRef(input: {
  readonly runId: string;
  readonly supersededBy: string;
}): RunSupersededPostmortemRef {
  return Object.freeze({
    kind: "run_superseded",
    runId: input.runId,
    supersededBy: input.supersededBy,
    status: "superseded"
  });
}

export function constructContinuationAbandonedPostmortemRef(input: {
  readonly continuationId: string;
  readonly runId: string | null;
  readonly publishedLedgerRef: string;
}): ContinuationAbandonedPostmortemRef {
  return Object.freeze({
    kind: "continuation_abandoned",
    continuationId: input.continuationId,
    runId: input.runId,
    publishedLedgerRef: input.publishedLedgerRef,
    status: "abandoned"
  });
}

export function constructPassedInstalledResetPostmortemOutcome(input: {
  readonly runPostmortem: RunSupersededPostmortemRef;
  readonly continuationPostmortem: ContinuationAbandonedPostmortemRef;
}): InstalledResetPostmortemPassed {
  return Object.freeze({
    kind: "passed",
    runPostmortem: input.runPostmortem,
    continuationPostmortem: input.continuationPostmortem
  });
}

export function constructRejectedInstalledResetPostmortemOutcome(input: {
  readonly reason: string;
  readonly gaps: readonly InstalledResetPostmortemGapRef[];
}): InstalledResetPostmortemRejected {
  return Object.freeze({
    kind: "rejected",
    reason: input.reason,
    gaps: freezeGaps(input.gaps)
  });
}

export function constructInstalledResetPostmortemOutcome(
  outcome: InstalledResetPostmortemOutcome
): InstalledResetPostmortemOutcome {
  return Object.freeze({
    ...outcome
  });
}
