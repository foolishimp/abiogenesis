// Implements: T-136
// Implements: REQ-R-ABG3-EVENTS
// Implements: REQ-R-ABG3-PROJECTION
// Implements: REQ-R-ABG3-FP-CONSCIOUSNESS

import type {
  ObservedStateAdmissionOutcome,
  ObservedStateAdmittedRuntimeEvent,
  ObservedStateProjection,
  ObservedStateRecord,
  ObservedStateSourceKind,
  RuntimeEvent
} from "./carriers.js";
import type { ConstructionObservationSnapshot } from "./construction_observation.js";
import { OBSERVED_STATE_SOURCE_KIND_VALUES } from "./carriers.js";
import {
  assertNonEmptyString,
  assertNonNegativeInteger,
  freezeStringArray
} from "./runtime_support.js";
import {
  sha256HexForText,
  stableSha256HexDigest
} from "../../../shared/runtime_identity.js";

export interface ObservedStateAdmissionExpectation {
  readonly expectedDigest?: string | undefined;
  readonly expectedVersion?: string | null | undefined;
  readonly minimumEventWatermark?: number | undefined;
  readonly requiredSourceKind?: ObservedStateSourceKind | undefined;
}

export class ObservedStateAdmissionRejectedError extends TypeError {
  readonly outcome: ObservedStateAdmissionOutcome;

  constructor(outcome: ObservedStateAdmissionOutcome) {
    super(`Observed state ${outcome.record.observedStateRef} is ${outcome.status}`);
    this.outcome = outcome;
  }
}

export interface ConstructionSnapshotObservedStateCoverageOutcome {
  readonly kind: "construction_snapshot_observed_state_coverage_outcome";
  readonly status: "admitted" | "rejected";
  readonly snapshotObservationId: string;
  readonly admittedObservedStateRefs: readonly string[];
  readonly snapshotObservedStateRefs: readonly string[];
  readonly missingObservedStateRefs: readonly string[];
  readonly diagnosticRefs: readonly string[];
}

export class ObservedStateSnapshotCoverageRejectedError extends TypeError {
  readonly outcome: ConstructionSnapshotObservedStateCoverageOutcome;

  constructor(outcome: ConstructionSnapshotObservedStateCoverageOutcome) {
    super(
      `Construction observation snapshot ${outcome.snapshotObservationId} references unadmitted observed state`
    );
    this.outcome = outcome;
  }
}

function assertObservedStateSourceKind(
  value: ObservedStateSourceKind,
  label: string
): void {
  for (const allowed of OBSERVED_STATE_SOURCE_KIND_VALUES) {
    if (value === allowed) {
      return;
    }
  }
  throw new TypeError(`${label}: unsupported observed state source kind ${value}`);
}

function normalizedRecordDigest(record: ObservedStateRecord): string {
  // Keep this field list in lockstep with ObservedStateRecord identity fields.
  return stableSha256HexDigest({
    observedStateRef: record.observedStateRef,
    source: record.source,
    digest: record.digest,
    version: record.version,
    freshnessPolicyRef: record.freshnessPolicyRef,
    derivationBasis: record.derivationBasis
  });
}

export function observedStateProjectionRef(
  records: readonly ObservedStateRecord[]
): string {
  return `observed_state_projection:${sha256HexForText(
    records.map(normalizedRecordDigest).sort().join("\n")
  )}`;
}

export function constructObservedStateRecord(input: {
  readonly observedStateRef: string;
  readonly sourceKind: ObservedStateSourceKind;
  readonly scopeRef: string;
  readonly sourceRef: string;
  readonly digest: string;
  readonly version?: string | null | undefined;
  readonly freshnessPolicyRef: string;
  readonly derivationBasisRef: string;
  readonly basisProjectionRef: string;
  readonly eventWatermark: number;
  readonly derivedFromRefs: readonly string[];
}): ObservedStateRecord {
  assertNonEmptyString(input.observedStateRef, "ObservedStateRecord.observedStateRef");
  assertObservedStateSourceKind(input.sourceKind, "ObservedStateRecord.sourceKind");
  assertNonEmptyString(input.scopeRef, "ObservedStateRecord.scopeRef");
  assertNonEmptyString(input.sourceRef, "ObservedStateRecord.sourceRef");
  assertNonEmptyString(input.digest, "ObservedStateRecord.digest");
  if (input.version !== undefined && input.version !== null) {
    assertNonEmptyString(input.version, "ObservedStateRecord.version");
  }
  assertNonEmptyString(
    input.freshnessPolicyRef,
    "ObservedStateRecord.freshnessPolicyRef"
  );
  assertNonEmptyString(
    input.derivationBasisRef,
    "ObservedStateRecord.derivationBasisRef"
  );
  assertNonEmptyString(
    input.basisProjectionRef,
    "ObservedStateRecord.basisProjectionRef"
  );
  assertNonNegativeInteger(
    input.eventWatermark,
    "ObservedStateRecord.eventWatermark"
  );
  const derivedFromRefs = freezeStringArray(input.derivedFromRefs);
  if (derivedFromRefs.length === 0) {
    throw new TypeError("ObservedStateRecord requires derivation basis refs");
  }
  return Object.freeze({
    kind: "observed_state_record",
    observedStateRef: input.observedStateRef,
    source: Object.freeze({
      kind: input.sourceKind,
      scopeRef: input.scopeRef,
      sourceRef: input.sourceRef
    }),
    digest: input.digest,
    version: input.version ?? null,
    freshnessPolicyRef: input.freshnessPolicyRef,
    derivationBasis: Object.freeze({
      derivationBasisRef: input.derivationBasisRef,
      basisProjectionRef: input.basisProjectionRef,
      eventWatermark: input.eventWatermark,
      derivedFromRefs
    })
  } satisfies ObservedStateRecord);
}

export function observedStateRecordFromEvent(
  event: ObservedStateAdmittedRuntimeEvent
): ObservedStateRecord {
  return constructObservedStateRecord({
    observedStateRef: event.observedStateRef,
    sourceKind: event.sourceKind,
    scopeRef: event.scopeRef,
    sourceRef: event.sourceRef,
    digest: event.digest,
    version: event.version,
    freshnessPolicyRef: event.freshnessPolicyRef,
    derivationBasisRef: event.derivationBasisRef,
    basisProjectionRef: event.basisProjectionRef,
    eventWatermark: event.eventWatermark,
    derivedFromRefs: event.derivedFromRefs
  });
}

export function admitObservedStateRecord(input: {
  readonly record: ObservedStateRecord;
  readonly expectation?: ObservedStateAdmissionExpectation | undefined;
}): ObservedStateAdmissionOutcome {
  const diagnostics: string[] = [];
  const expectation = input.expectation;
  if (
    expectation?.expectedDigest !== undefined &&
    expectation.expectedDigest !== input.record.digest
  ) {
    diagnostics.push("observed_state_digest_mismatch");
  }
  if (
    expectation?.expectedVersion !== undefined &&
    expectation.expectedVersion !== input.record.version
  ) {
    diagnostics.push("observed_state_version_mismatch");
  }
  if (
    expectation?.minimumEventWatermark !== undefined &&
    input.record.derivationBasis.eventWatermark < expectation.minimumEventWatermark
  ) {
    diagnostics.push("observed_state_event_watermark_stale");
  }
  if (
    expectation?.requiredSourceKind !== undefined &&
    input.record.source.kind !== expectation.requiredSourceKind
  ) {
    diagnostics.push("observed_state_source_kind_mismatch");
  }
  return Object.freeze({
    kind: "observed_state_admission_outcome",
    status: diagnostics.length === 0 ? "admitted" : "rejected",
    record: input.record,
    diagnosticRefs: freezeStringArray(diagnostics)
  } satisfies ObservedStateAdmissionOutcome);
}

export function assertObservedStateAdmitted(
  outcome: ObservedStateAdmissionOutcome
): void {
  if (outcome.status !== "admitted") {
    throw new ObservedStateAdmissionRejectedError(outcome);
  }
}

export function deriveObservedStateProjection(
  events: readonly RuntimeEvent[]
): ObservedStateProjection {
  const byRef = new Map<string, ObservedStateRecord>();
  for (const event of events) {
    if (event.kind === "observed_state_admitted") {
      const record = observedStateRecordFromEvent(event);
      byRef.set(record.observedStateRef, record);
    }
  }
  const records = Object.freeze(
    [...byRef.values()].sort((left, right) =>
      left.observedStateRef.localeCompare(right.observedStateRef)
    )
  );
  const latestEventWatermark =
    records.length === 0
      ? 0
      : Math.max(...records.map((record) => record.derivationBasis.eventWatermark));
  return Object.freeze({
    kind: "observed_state_projection",
    projectionRef: observedStateProjectionRef(records),
    records,
    observedStateRefs: freezeStringArray(
      records.map((record) => record.observedStateRef)
    ),
    latestEventWatermark
  } satisfies ObservedStateProjection);
}

export function deriveConstructionSnapshotObservedStateCoverage(input: {
  readonly snapshot: ConstructionObservationSnapshot;
  readonly projection: ObservedStateProjection;
}): ConstructionSnapshotObservedStateCoverageOutcome {
  // Coverage is intentionally one-way: every snapshot ref must be admitted.
  // Admitted state outside the snapshot remains available for later predicates.
  const available = new Set(input.projection.observedStateRefs);
  const missing: string[] = [];
  for (const observedStateRef of input.snapshot.observedStateRefs) {
    if (!available.has(observedStateRef)) {
      missing.push(observedStateRef);
    }
  }
  const missingObservedStateRefs = freezeStringArray(missing);
  return Object.freeze({
    kind: "construction_snapshot_observed_state_coverage_outcome",
    status: missingObservedStateRefs.length === 0 ? "admitted" : "rejected",
    snapshotObservationId: input.snapshot.observationId,
    admittedObservedStateRefs: freezeStringArray(input.projection.observedStateRefs),
    snapshotObservedStateRefs: freezeStringArray(input.snapshot.observedStateRefs),
    missingObservedStateRefs,
    diagnosticRefs:
      missingObservedStateRefs.length === 0
        ? Object.freeze([])
        : freezeStringArray(["observed_state_snapshot_unadmitted_ref"])
  } satisfies ConstructionSnapshotObservedStateCoverageOutcome);
}

export function assertConstructionSnapshotObservedStateCoverage(input: {
  readonly snapshot: ConstructionObservationSnapshot;
  readonly projection: ObservedStateProjection;
}): void {
  const outcome = deriveConstructionSnapshotObservedStateCoverage(input);
  if (outcome.status !== "admitted") {
    throw new ObservedStateSnapshotCoverageRejectedError(outcome);
  }
}
