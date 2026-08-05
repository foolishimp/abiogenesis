import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  constructRuntimeFluent,
  deriveRuntimeEventCalculusProjection,
  holdsAt,
  type RuntimeEventCalculusEffectRow,
} from "./event_calculus.js";
import type { ValidatedRuntimeEventPrefix } from "./event_prefix.js";

export interface AdmittedArtifactTruth {
  readonly kind: "admitted_artifact_truth";
  readonly admissionEventRef: string;
  readonly admissionOrdinal: number;
  readonly operationId: string;
  readonly artifactRef: string;
  readonly artifactDigest: string;
  readonly authorityScopeRef: string | null;
  readonly authorityScopeDigest: string | null;
  readonly ownerAdmittedDisposition: string | null;
  readonly causationEventRefs: readonly string[];
  readonly available: true;
}

export interface ArtifactTruthProjection {
  readonly kind: "artifact_truth_projection";
  readonly artifacts: readonly AdmittedArtifactTruth[];
}

function recordPayload(
  row: RuntimeEventCalculusEffectRow,
): Readonly<Record<string, JsonValue>> {
  const payload = row.sourceEvent.payload;
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    throw new TypeError("artifact admission requires one closed object payload");
  }
  return payload as Readonly<Record<string, JsonValue>>;
}

function requiredString(
  payload: Readonly<Record<string, JsonValue>>,
  field: string,
): string {
  const value = payload[field];
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`artifact admission requires non-empty ${field}`);
  }
  return value;
}

function optionalString(
  payload: Readonly<Record<string, JsonValue>>,
  field: string,
): string | null {
  const value = payload[field];
  if (value === undefined) return null;
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`artifact admission ${field} must be a non-empty string`);
  }
  return value;
}

function assertsArtifactAvailabilityEffect(
  row: RuntimeEventCalculusEffectRow,
): void {
  if (!row.initiates.some((fluent) =>
    fluent.name === "public_operation_artifact_available" &&
    fluent.identity === null
  )) {
    throw new TypeError(
      "artifact admission lacks its Event Calculus availability effect",
    );
  }
}

export function projectArtifactTruth(
  prefix: ValidatedRuntimeEventPrefix,
): ArtifactTruthProjection {
  const calculus = deriveRuntimeEventCalculusProjection(prefix);
  const availability = constructRuntimeFluent({
    name: "public_operation_artifact_available",
  });
  const artifactRows = calculus.effectRows.filter(
    (row) => row.eventKind === "public_operation_artifact_admitted",
  );
  if (artifactRows.length !== 0 && !holdsAt(calculus, availability)) {
    throw new TypeError(
      "artifact admission history disagrees with Event Calculus availability",
    );
  }

  const artifacts = artifactRows.map((row) => {
    assertsArtifactAvailabilityEffect(row);
    const payload = recordPayload(row);
    return deepFreeze({
      kind: "admitted_artifact_truth" as const,
      admissionEventRef: row.sourceEvent.eventId,
      admissionOrdinal: row.sourceEvent.admissionOrdinal,
      operationId: requiredString(payload, "operationId"),
      artifactRef: requiredString(payload, "artifactRef"),
      artifactDigest: requiredString(payload, "artifactDigest"),
      authorityScopeRef: optionalString(payload, "authorityScopeRef"),
      authorityScopeDigest: optionalString(payload, "authorityScopeDigest"),
      ownerAdmittedDisposition: optionalString(
        payload,
        "ownerAdmittedDisposition",
      ),
      causationEventRefs: [...row.sourceEvent.causationEventRefs],
      available: true as const,
    }) as AdmittedArtifactTruth;
  });

  return deepFreeze({
    kind: "artifact_truth_projection" as const,
    artifacts,
  }) as ArtifactTruthProjection;
}
