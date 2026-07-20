// Implements: T-270; REQ-R-ABG3-FP-CONSCIOUSNESS-004B, 005, 006.
// Internal replay projection only. It does not select work, append events, or
// authorize effects.

import type {
  CanonicalRuntimeEvent,
  ConstructionObservationSnapshotMaterializedEvent,
  ConstructionRuntimeEventScope,
  RuntimeEvent
} from "./carriers.js";
import {
  assertCanonicalRuntimeEventSequence
} from "./event_admission.js";
import {
  sortReplayByAdmissionOrdinalFailClosed
} from "./admission_hygiene.js";
import {
  constructConstructionObservationSnapshot,
  type ConstructionObservationSnapshot
} from "./construction_observation.js";
import {
  assertNonEmptyString,
  assertNonNegativeInteger
} from "./runtime_support.js";
import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";

interface RefDigest {
  readonly ref: string;
  readonly digest: string;
}

type CanonicalObservationMaterializedEvent =
  CanonicalRuntimeEvent & ConstructionObservationSnapshotMaterializedEvent;

function assertConstructionObservationSnapshotSeal(
  snapshot: ConstructionObservationSnapshot
): void {
  const expected = constructConstructionObservationSnapshot(snapshot);
  if (
    snapshot.kind !== "construction_observation_snapshot" ||
    !stableJsonEquals(snapshot, expected)
  ) {
    throw new TypeError("ConstructionObservationSnapshot seal differs");
  }
}

export interface CurrentObservationBasisProjection {
  readonly kind: "current_observation_basis_projection";
  readonly projectionRef: string;
  readonly projectionDigest: `sha256:${string}`;
  readonly episodeId: string;
  readonly workspaceBindingRef: string;
  readonly workspaceBindingDigest: string;
  readonly admittedProgramRef: string;
  readonly admittedProgramDigest: string;
  readonly observationId: string;
  readonly snapshotDigest: `sha256:${string}`;
  readonly materializedEventRef: string;
  readonly materializedEventDigest: `sha256:${string}`;
  readonly materializedEventAdmissionOrdinal: number;
}

export function constructCurrentObservationMaterializedEvent(input: {
  readonly scope: ConstructionRuntimeEventScope;
  readonly admittedProgram: RefDigest;
  readonly workspaceBinding: RefDigest;
  readonly observation: ConstructionObservationSnapshot;
}): ConstructionObservationSnapshotMaterializedEvent {
  assertConstructionObservationSnapshotSeal(input.observation);
  assertNonEmptyString(
    input.admittedProgram.ref,
    "CurrentObservationMaterializedEvent.admittedProgram.ref"
  );
  assertNonEmptyString(
    input.admittedProgram.digest,
    "CurrentObservationMaterializedEvent.admittedProgram.digest"
  );
  assertNonEmptyString(
    input.workspaceBinding.ref,
    "CurrentObservationMaterializedEvent.workspaceBinding.ref"
  );
  assertNonEmptyString(
    input.workspaceBinding.digest,
    "CurrentObservationMaterializedEvent.workspaceBinding.digest"
  );
  if (
    input.scope.episodeId !== input.observation.episodeId ||
    input.scope.graphFunctionId !== input.admittedProgram.ref ||
    input.scope.basisProjectionRef !== input.observation.basisProjectionRef ||
    input.scope.iterationOrdinal !== input.observation.iterationOrdinal ||
    input.scope.priorIntentId !== input.observation.priorIntentId ||
    input.scope.correlationId !== input.observation.correlationId ||
    !input.scope.causationEventRefs.includes(input.observation.causationRef)
  ) {
    throw new TypeError(
      "Current observation materialization scope differs from the admitted snapshot"
    );
  }
  return Object.freeze({
    ...input.scope,
    kind: "construction_observation_snapshot_materialized",
    observationId: input.observation.observationId,
    snapshotDigest: input.observation.snapshotDigest,
    admittedProgramRef: input.admittedProgram.ref,
    admittedProgramDigest: input.admittedProgram.digest,
    workspaceBindingRef: input.workspaceBinding.ref,
    workspaceBindingDigest: input.workspaceBinding.digest,
    currentProjectionRef: input.observation.currentProjectionRef,
    observedStateRefs: input.observation.observedStateRefs,
    linkedAssetRefs: input.observation.linkedAssetRefs,
    authorityDigest: input.observation.authorityDigest
  });
}

function projectionBasis(input: Omit<
  CurrentObservationBasisProjection,
  "projectionRef" | "projectionDigest"
>) {
  return Object.freeze({
    kind: input.kind,
    episodeId: input.episodeId,
    workspaceBindingRef: input.workspaceBindingRef,
    workspaceBindingDigest: input.workspaceBindingDigest,
    admittedProgramRef: input.admittedProgramRef,
    admittedProgramDigest: input.admittedProgramDigest,
    observationId: input.observationId,
    snapshotDigest: input.snapshotDigest,
    materializedEventRef: input.materializedEventRef,
    materializedEventDigest: input.materializedEventDigest,
    materializedEventAdmissionOrdinal: input.materializedEventAdmissionOrdinal
  });
}

export function assertCurrentObservationBasisProjection(
  projection: CurrentObservationBasisProjection
): void {
  [
    projection.episodeId,
    projection.workspaceBindingRef,
    projection.workspaceBindingDigest,
    projection.admittedProgramRef,
    projection.admittedProgramDigest,
    projection.observationId,
    projection.snapshotDigest,
    projection.materializedEventRef,
    projection.materializedEventDigest
  ].forEach((value, index) =>
    assertNonEmptyString(value, `CurrentObservationBasisProjection.authority[${String(index)}]`)
  );
  assertNonNegativeInteger(
    projection.materializedEventAdmissionOrdinal,
    "CurrentObservationBasisProjection.materializedEventAdmissionOrdinal"
  );
  const digest = stableSha256Digest(projectionBasis(projection));
  if (
    projection.kind !== "current_observation_basis_projection" ||
    projection.projectionDigest !== digest ||
    projection.projectionRef !==
      `abg://one-surface/current-observation/${digest.slice("sha256:".length)}`
  ) {
    throw new TypeError("CurrentObservationBasisProjection seal differs");
  }
}

export function deriveCurrentObservationBasisProjection(input: {
  readonly episodeId: string;
  readonly admittedProgram: RefDigest;
  readonly workspaceBinding: RefDigest;
  readonly observation: ConstructionObservationSnapshot;
  readonly replayEvents: readonly RuntimeEvent[];
}): CurrentObservationBasisProjection {
  assertNonEmptyString(input.episodeId, "CurrentObservation.episodeId");
  assertNonEmptyString(input.admittedProgram.ref, "CurrentObservation.admittedProgram.ref");
  assertNonEmptyString(
    input.admittedProgram.digest,
    "CurrentObservation.admittedProgram.digest"
  );
  assertNonEmptyString(input.workspaceBinding.ref, "CurrentObservation.workspaceBinding.ref");
  assertNonEmptyString(
    input.workspaceBinding.digest,
    "CurrentObservation.workspaceBinding.digest"
  );
  assertConstructionObservationSnapshotSeal(input.observation);
  if (
    input.observation.episodeId !== input.episodeId ||
    input.observation.basisRef !== input.workspaceBinding.ref
  ) {
    throw new TypeError("Current observation snapshot is outside the supplied stable scope");
  }

  const canonicalReplay: readonly unknown[] = input.replayEvents;
  assertCanonicalRuntimeEventSequence(
    canonicalReplay,
    "CurrentObservation.canonicalReplay"
  );
  const orderedReplay = sortReplayByAdmissionOrdinalFailClosed(
    canonicalReplay,
    "CurrentObservation.canonicalReplay"
  );
  const scopedEvents = orderedReplay.filter(
    (event): event is CanonicalObservationMaterializedEvent =>
      event.kind === "construction_observation_snapshot_materialized" &&
      event.episodeId === input.episodeId &&
      event.admittedProgramRef === input.admittedProgram.ref &&
      event.admittedProgramDigest === input.admittedProgram.digest &&
      event.workspaceBindingRef === input.workspaceBinding.ref &&
      event.workspaceBindingDigest === input.workspaceBinding.digest
  );
  const decisiveEvent = scopedEvents.at(-1);
  if (decisiveEvent === undefined) {
    throw new TypeError("Current observation replay contains no event in the supplied stable scope");
  }
  if (
    decisiveEvent.observationId !== input.observation.observationId ||
    decisiveEvent.snapshotDigest !== input.observation.snapshotDigest ||
    decisiveEvent.graphFunctionId !== input.admittedProgram.ref ||
    decisiveEvent.currentProjectionRef !==
      input.observation.currentProjectionRef ||
    decisiveEvent.iterationOrdinal !== input.observation.iterationOrdinal ||
    decisiveEvent.basisProjectionRef !==
      input.observation.basisProjectionRef ||
    decisiveEvent.priorIntentId !== input.observation.priorIntentId ||
    decisiveEvent.correlationId !== input.observation.correlationId ||
    !decisiveEvent.causationEventRefs.includes(input.observation.causationRef) ||
    !stableJsonEquals(
      decisiveEvent.observedStateRefs,
      input.observation.observedStateRefs
    ) ||
    !stableJsonEquals(
      decisiveEvent.linkedAssetRefs,
      input.observation.linkedAssetRefs
    ) ||
    decisiveEvent.authorityDigest !== input.observation.authorityDigest
  ) {
    throw new TypeError(
      "Current observation snapshot differs from the decisive replay event"
    );
  }
  const materializedEventDigest = stableSha256Digest(decisiveEvent);
  const basis = projectionBasis({
    kind: "current_observation_basis_projection",
    episodeId: input.episodeId,
    workspaceBindingRef: input.workspaceBinding.ref,
    workspaceBindingDigest: input.workspaceBinding.digest,
    admittedProgramRef: input.admittedProgram.ref,
    admittedProgramDigest: input.admittedProgram.digest,
    observationId: input.observation.observationId,
    snapshotDigest: input.observation.snapshotDigest,
    materializedEventRef: decisiveEvent.eventId,
    materializedEventDigest,
    materializedEventAdmissionOrdinal: decisiveEvent.eventAdmissionOrdinal
  });
  const projectionDigest = stableSha256Digest(basis);
  const projection = Object.freeze({
    ...basis,
    projectionRef:
      `abg://one-surface/current-observation/${projectionDigest.slice("sha256:".length)}`,
    projectionDigest
  });
  assertCurrentObservationBasisProjection(projection);
  return projection;
}
