import { isSha256Digest, type Sha256Digest } from "./digests.js";
import { deepFreeze } from "./immutable.js";
import { isNonBlankRef } from "./references.js";

export interface CanonicalRootedTopologySegment {
  readonly segmentRef: string;
  readonly parentRef: string;
}

export interface CanonicalRootedTopologyWitness {
  readonly kind: "canonical_rooted_topology_witness";
  readonly schemaVersion: "5.0.0";
  readonly topologyRef: string;
  readonly basisRef: string;
  readonly basisDigest: Sha256Digest;
  readonly rootRef: string;
  readonly segments: readonly CanonicalRootedTopologySegment[];
}

export interface CanonicalRootedTopologyPartition {
  readonly kind: "canonical_rooted_topology_partition";
  readonly schemaVersion: "5.0.0";
  readonly topologyRef: string;
  readonly basisRef: string;
  readonly basisDigest: Sha256Digest;
  readonly rootRef: string;
  readonly preserved: readonly string[];
  readonly exited: readonly string[];
  readonly entered: readonly string[];
}

export type CanonicalRootedTopologyPartitionRefusalCode =
  | "invalid_witness"
  | "topology_mismatch"
  | "basis_mismatch"
  | "root_mismatch"
  | "adjacency_mismatch";

export interface CanonicalRootedTopologyPartitionRefusal {
  readonly kind: "canonical_rooted_topology_partition_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: CanonicalRootedTopologyPartitionRefusalCode;
  readonly message: string;
}

type WitnessValidation =
  | Readonly<{ readonly valid: true }>
  | Readonly<{
    readonly valid: false;
    readonly code: "invalid_witness" | "adjacency_mismatch";
    readonly message: string;
  }>;

const WITNESS_KEYS = Object.freeze([
  "basisDigest",
  "basisRef",
  "kind",
  "rootRef",
  "schemaVersion",
  "segments",
  "topologyRef",
]);

const SEGMENT_KEYS = Object.freeze(["parentRef", "segmentRef"]);

function hasExactKeys(value: object, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  return actual.length === keys.length &&
    actual.every((key, index) => key === keys[index]);
}

function validateCanonicalRootedTopologyWitness(
  value: unknown,
  label: "source" | "target",
): WitnessValidation {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    !hasExactKeys(value, WITNESS_KEYS)
  ) {
    return {
      valid: false,
      code: "invalid_witness",
      message: `${label} topology witness has an invalid closed shape`,
    };
  }
  const witness = value as Readonly<Record<string, unknown>>;
  if (
    witness.kind !== "canonical_rooted_topology_witness" ||
    witness.schemaVersion !== "5.0.0" ||
    !isNonBlankRef(witness.topologyRef) ||
    !isNonBlankRef(witness.basisRef) ||
    !isSha256Digest(witness.basisDigest) ||
    !isNonBlankRef(witness.rootRef) ||
    !Array.isArray(witness.segments)
  ) {
    return {
      valid: false,
      code: "invalid_witness",
      message: `${label} topology witness has invalid identity fields`,
    };
  }
  let expectedParentRef = witness.rootRef;
  const seen = new Set<string>([witness.rootRef]);
  for (const segmentValue of witness.segments) {
    if (
      typeof segmentValue !== "object" ||
      segmentValue === null ||
      Array.isArray(segmentValue) ||
      !hasExactKeys(segmentValue, SEGMENT_KEYS)
    ) {
      return {
        valid: false,
        code: "invalid_witness",
        message: `${label} topology witness has an invalid segment shape`,
      };
    }
    const segment = segmentValue as Readonly<Record<string, unknown>>;
    if (
      !isNonBlankRef(segment.segmentRef) ||
      !isNonBlankRef(segment.parentRef)
    ) {
      return {
        valid: false,
        code: "invalid_witness",
        message: `${label} topology witness has invalid segment refs`,
      };
    }
    if (
      seen.has(segment.segmentRef) ||
      segment.parentRef !== expectedParentRef
    ) {
      return {
        valid: false,
        code: "adjacency_mismatch",
        message: `${label} topology witness is not one unique rooted path`,
      };
    }
    seen.add(segment.segmentRef);
    expectedParentRef = segment.segmentRef;
  }
  return { valid: true };
}

function refuseCanonicalRootedTopologyPartition(
  code: CanonicalRootedTopologyPartitionRefusalCode,
  message: string,
): CanonicalRootedTopologyPartitionRefusal {
  return deepFreeze({
    kind: "canonical_rooted_topology_partition_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    message,
  });
}

export function deriveCanonicalRootedTopologyPartition(
  source: CanonicalRootedTopologyWitness,
  target: CanonicalRootedTopologyWitness,
): CanonicalRootedTopologyPartition |
  CanonicalRootedTopologyPartitionRefusal {
  const sourceValidation = validateCanonicalRootedTopologyWitness(
    source,
    "source",
  );
  if (!sourceValidation.valid) {
    return refuseCanonicalRootedTopologyPartition(
      sourceValidation.code,
      sourceValidation.message,
    );
  }
  const targetValidation = validateCanonicalRootedTopologyWitness(
    target,
    "target",
  );
  if (!targetValidation.valid) {
    return refuseCanonicalRootedTopologyPartition(
      targetValidation.code,
      targetValidation.message,
    );
  }
  if (source.topologyRef !== target.topologyRef) {
    return refuseCanonicalRootedTopologyPartition(
      "topology_mismatch",
      "topology witnesses have different topology refs",
    );
  }
  if (
    source.basisRef !== target.basisRef ||
    source.basisDigest !== target.basisDigest
  ) {
    return refuseCanonicalRootedTopologyPartition(
      "basis_mismatch",
      "topology witnesses have different basis identity",
    );
  }
  if (source.rootRef !== target.rootRef) {
    return refuseCanonicalRootedTopologyPartition(
      "root_mismatch",
      "topology witnesses have different roots",
    );
  }

  const parentBySegmentRef = new Map<string, string>();
  for (const segment of [...source.segments, ...target.segments]) {
    const establishedParentRef = parentBySegmentRef.get(segment.segmentRef);
    if (
      establishedParentRef !== undefined &&
      establishedParentRef !== segment.parentRef
    ) {
      return refuseCanonicalRootedTopologyPartition(
        "adjacency_mismatch",
        "topology witnesses assign one segment identity to different parents",
      );
    }
    parentBySegmentRef.set(segment.segmentRef, segment.parentRef);
  }

  let preservedLength = 0;
  const comparedLength = Math.min(
    source.segments.length,
    target.segments.length,
  );
  while (
    preservedLength < comparedLength &&
    source.segments[preservedLength]!.segmentRef ===
      target.segments[preservedLength]!.segmentRef &&
    source.segments[preservedLength]!.parentRef ===
      target.segments[preservedLength]!.parentRef
  ) {
    preservedLength += 1;
  }

  return deepFreeze({
    kind: "canonical_rooted_topology_partition" as const,
    schemaVersion: "5.0.0" as const,
    topologyRef: source.topologyRef,
    basisRef: source.basisRef,
    basisDigest: source.basisDigest,
    rootRef: source.rootRef,
    preserved: source.segments
      .slice(0, preservedLength)
      .map((segment) => segment.segmentRef),
    exited: source.segments
      .slice(preservedLength)
      .map((segment) => segment.segmentRef)
      .reverse(),
    entered: target.segments
      .slice(preservedLength)
      .map((segment) => segment.segmentRef),
  });
}
