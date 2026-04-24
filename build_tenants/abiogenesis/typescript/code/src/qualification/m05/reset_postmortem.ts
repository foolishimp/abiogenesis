// Implements: REQ-P-QUAL
// Implements: REQ-P-SCENARIOS

import {
  constructContinuationAbandonedPostmortemRef,
  constructInstalledResetPostmortemGapRef,
  constructInstalledResetPostmortemOutcome,
  constructPassedInstalledResetPostmortemOutcome,
  constructRejectedInstalledResetPostmortemOutcome,
  constructRunSupersededPostmortemRef
} from "./reset_postmortem_constructors.js";
import type {
  InstalledResetPostmortemCaseName,
  InstalledResetPostmortemGapRef,
  InstalledResetPostmortemObservation,
  InstalledResetPostmortemOutcome,
  InstalledResetPostmortemRequest
} from "./reset_postmortem_carriers.js";

const REQUIRED_CASES: readonly InstalledResetPostmortemCaseName[] = Object.freeze([
  "active_run_superseded",
  "open_continuation_abandoned"
]);

function caseObservations(
  request: InstalledResetPostmortemRequest,
  caseName: InstalledResetPostmortemCaseName
): readonly InstalledResetPostmortemObservation[] {
  return request.observations.filter((entry) => entry.caseName === caseName);
}

function continuationIdForManifest(manifestId: string): string {
  return `continuation:${manifestId}`;
}

export function qualifyInstalledResetPostmortem(
  request: InstalledResetPostmortemRequest
): InstalledResetPostmortemOutcome {
  const gaps: InstalledResetPostmortemGapRef[] = [];

  for (const caseName of REQUIRED_CASES) {
    const matches = caseObservations(request, caseName);
    if (matches.length === 0) {
      gaps.push(constructInstalledResetPostmortemGapRef("missing_case", caseName));
      continue;
    }
    if (matches.length > 1) {
      gaps.push(
        constructInstalledResetPostmortemGapRef("duplicate_case", caseName)
      );
    }
  }

  const activeRun = caseObservations(request, "active_run_superseded")[0];
  const continuation = caseObservations(
    request,
    "open_continuation_abandoned"
  )[0];

  if (activeRun !== undefined) {
    if (!activeRun.resetAccepted) {
      gaps.push(
        constructInstalledResetPostmortemGapRef(
          "reset_not_accepted",
          activeRun.caseName
        )
      );
    }
    if (!activeRun.emittedKinds.includes("reset")) {
      gaps.push(
        constructInstalledResetPostmortemGapRef(
          "missing_reset_event",
          activeRun.caseName
        )
      );
    }
    if (activeRun.runId === null) {
      gaps.push(
        constructInstalledResetPostmortemGapRef(
          "missing_run_id",
          activeRun.caseName
        )
      );
    }
    if (
      activeRun.preResetRunStatus !== "active" &&
      activeRun.preResetRunStatus !== "blocked" &&
      activeRun.preResetRunStatus !== "yielded"
    ) {
      gaps.push(
        constructInstalledResetPostmortemGapRef(
          "unexpected_pre_reset_status",
          `${activeRun.caseName}:${activeRun.preResetRunStatus}`
        )
      );
    }
  }

  if (continuation !== undefined) {
    if (!continuation.resetAccepted) {
      gaps.push(
        constructInstalledResetPostmortemGapRef(
          "reset_not_accepted",
          continuation.caseName
        )
      );
    }
    if (!continuation.emittedKinds.includes("reset")) {
      gaps.push(
        constructInstalledResetPostmortemGapRef(
          "missing_reset_event",
          continuation.caseName
        )
      );
    }
    if (continuation.manifestId === null) {
      gaps.push(
        constructInstalledResetPostmortemGapRef(
          "missing_manifest_id",
          continuation.caseName
        )
      );
    }
    if (continuation.publishedLedgerRef === null) {
      gaps.push(
        constructInstalledResetPostmortemGapRef(
          "missing_published_ledger_ref",
          continuation.caseName
        )
      );
    }
    if (
      continuation.assessmentStatus !== "blocked" &&
      continuation.assessmentStatus !== "unfulfilled"
    ) {
      gaps.push(
        constructInstalledResetPostmortemGapRef(
          "unexpected_assessment_status",
          `${continuation.caseName}:${continuation.assessmentStatus}`
        )
      );
    }
  }

  if (
    gaps.length > 0 ||
    activeRun === undefined ||
    continuation === undefined ||
    activeRun.runId === null ||
    continuation.manifestId === null ||
    continuation.publishedLedgerRef === null
  ) {
    return constructInstalledResetPostmortemOutcome(
      constructRejectedInstalledResetPostmortemOutcome({
        reason: "installed reset postmortem parity is incomplete",
        gaps
      })
    );
  }

  return constructInstalledResetPostmortemOutcome(
    constructPassedInstalledResetPostmortemOutcome({
      runPostmortem: constructRunSupersededPostmortemRef({
        runId: activeRun.runId,
        supersededBy: `reset:${activeRun.resetScope}`
      }),
      continuationPostmortem: constructContinuationAbandonedPostmortemRef({
        continuationId: continuationIdForManifest(continuation.manifestId),
        runId: continuation.runId,
        publishedLedgerRef: continuation.publishedLedgerRef
      })
    })
  );
}
