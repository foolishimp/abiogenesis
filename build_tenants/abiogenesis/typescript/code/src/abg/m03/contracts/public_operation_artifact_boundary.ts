// Implements: REQ-R-ABG3-EVENTS-032

import type {
  CanonicalRuntimeEvent,
  PublicOperationArtifactAdmittedRuntimeEvent
} from "./carriers.js";
import { sortReplayByAdmissionOrdinalFailClosed } from "./admission_hygiene.js";
import {
  assertCanonicalRuntimeEventSequence,
  assertRuntimeEvent
} from "./event_admission.js";
import {
  constructRuntimeFluent,
  deriveRuntimeEventCalculusProjection,
  holdsAt,
  type RuntimeEventCalculusProjection
} from "./event_calculus.js";
import {
  admitOwnerNativeDefinitionKey,
  type OwnerNativeDefinitionKey
} from "../../../shared/validation/owner_native_operation_contract_source.js";
import { stableJsonEquals } from "../../../shared/runtime_identity.js";

export interface PublicOperationArtifactBoundaryInput {
  readonly operationId: string;
  readonly definitionKey: OwnerNativeDefinitionKey;
  readonly definitionDigest: string;
  readonly scopeRef: string;
  readonly scopeDigest: string;
  readonly invocationRef: string;
  readonly invocationDigest: string;
  readonly disposition: string;
  readonly artifactRef: string;
  readonly artifactDigest: string;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export function constructPublicOperationArtifactAdmittedEvent(
  input: PublicOperationArtifactBoundaryInput
): PublicOperationArtifactAdmittedRuntimeEvent {
  const admittedDefinitionKey = admitOwnerNativeDefinitionKey(
    input.definitionKey
  );
  const event = Object.freeze({
    kind: "public_operation_artifact_admitted",
    operationId: input.operationId,
    definitionKey: Object.freeze({ ...admittedDefinitionKey }),
    definitionDigest: input.definitionDigest,
    scopeRef: input.scopeRef,
    scopeDigest: input.scopeDigest,
    invocationRef: input.invocationRef,
    invocationDigest: input.invocationDigest,
    disposition: input.disposition,
    artifactRef: input.artifactRef,
    artifactDigest: input.artifactDigest,
    causationEventRefs: Object.freeze([...input.causationEventRefs]),
    correlationId: input.correlationId
  } satisfies PublicOperationArtifactAdmittedRuntimeEvent);
  assertRuntimeEvent(event);
  return event;
}

export interface PublicOperationArtifactReplayInput {
  readonly events: readonly CanonicalRuntimeEvent[];
  readonly scopeRef: string;
  readonly scopeDigest: string;
}

export function derivePublicOperationArtifactReplayProjection(
  input: PublicOperationArtifactReplayInput
): RuntimeEventCalculusProjection {
  if (typeof input.scopeRef !== "string" || input.scopeRef.length === 0) {
    throw new TypeError(
      "PublicOperationArtifactReplay.scopeRef must be non-empty"
    );
  }
  if (
    typeof input.scopeDigest !== "string" ||
    !/^sha256:[0-9a-f]{64}$/u.test(input.scopeDigest)
  ) {
    throw new TypeError(
      "PublicOperationArtifactReplay.scopeDigest must be a sha256:<64-hex> digest"
    );
  }
  assertCanonicalRuntimeEventSequence(
    input.events,
    "PublicOperationArtifactReplay.events"
  );
  const canonical = sortReplayByAdmissionOrdinalFailClosed(
    input.events,
    "PublicOperationArtifactReplay.events"
  );
  const scopedEvents = canonical.filter(
    (
      event
    ): event is CanonicalRuntimeEvent &
      PublicOperationArtifactAdmittedRuntimeEvent =>
      event.kind === "public_operation_artifact_admitted" &&
      event.scopeRef === input.scopeRef
  );
  if (
    scopedEvents.some((event) =>
      event.scopeDigest !== input.scopeDigest
    )
  ) {
    throw new TypeError(
      "PublicOperationArtifactReplay.events: scope digest mismatch"
    );
  }
  return deriveRuntimeEventCalculusProjection({
    events: Object.freeze(scopedEvents)
  });
}

export function assertPublicOperationArtifactAvailableInReplay(input: {
  readonly events: readonly CanonicalRuntimeEvent[];
  readonly operationId: string;
  readonly scopeRef: string;
  readonly scopeDigest: string;
  readonly artifactRef: string;
  readonly artifactDigest: string;
}): void {
  const projection = derivePublicOperationArtifactReplayProjection({
    events: input.events,
    scopeRef: input.scopeRef,
    scopeDigest: input.scopeDigest
  });
  const exactBoundaries = projection.effectRows
    .map(({ sourceEvent }) => sourceEvent)
    .filter((
      sourceEvent
    ): sourceEvent is CanonicalRuntimeEvent &
      PublicOperationArtifactAdmittedRuntimeEvent =>
      sourceEvent.kind === "public_operation_artifact_admitted" &&
      sourceEvent.operationId === input.operationId &&
      sourceEvent.artifactRef === input.artifactRef &&
      sourceEvent.artifactDigest === input.artifactDigest
    );
  const causallyAdmitted = exactBoundaries.some((boundary) =>
    input.events.some((event) =>
      event.kind === "public_operation_admitted" &&
      "definitionKey" in event &&
      boundary.causationEventRefs.includes(event.eventId) &&
      stableJsonEquals(event.definitionKey, boundary.definitionKey) &&
      event.definitionDigest === boundary.definitionDigest &&
      event.invocationRef === boundary.invocationRef &&
      event.invocationDigest === boundary.invocationDigest
    )
  );
  if (
    !causallyAdmitted ||
    !holdsAt(
      projection,
      constructRuntimeFluent({
        name: "public_operation_artifact_available",
        scope: "public_operation",
        constraintRef: input.scopeRef,
        ref: input.artifactRef
      })
    )
  ) {
    throw new TypeError(
      `${input.operationId} artifact is not available in admitted replay truth`
    );
  }
}
