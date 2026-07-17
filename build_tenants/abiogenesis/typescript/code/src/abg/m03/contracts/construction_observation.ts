// Implements: T-139
// Implements: T-152
// Implements: REQ-R-ABG3-FP-CONSCIOUSNESS

import type {
  ExecutionBasis,
  GraphReentryPoint,
  RuntimeAggregateProjection
} from "./carriers.js";
import { GRAPH_REENTRY_POINT_VALUES } from "./carriers.js";
import {
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  assertNonEmptyString,
  assertNonNegativeInteger,
  freezeStringArray
} from "./runtime_support.js";

export const CONSTRUCTION_PRESSURE_KIND_VALUES = Object.freeze([
  "open_obligation",
  "admitted_error",
  "gap_row",
  "retry_frontier",
  "reentry_frontier",
  "workspace_delta",
  "temporal_pressure",
  "fh_feedback",
  "affect_signal"
] as const);

export type ConstructionPressureKind =
  (typeof CONSTRUCTION_PRESSURE_KIND_VALUES)[number];

export const CONSTRUCTION_REPAIR_SURFACE_DISPOSITION_VALUES = Object.freeze([
  "current_edge_repair",
  "upstream_reentry",
  "downstream_deferred",
  "external_blocked"
] as const);

export type ConstructionRepairSurfaceDisposition =
  (typeof CONSTRUCTION_REPAIR_SURFACE_DISPOSITION_VALUES)[number];

export const CONSTRUCTION_AMBIGUITY_CLASS_VALUES = Object.freeze([
  "none",
  "source_undisambiguated",
  "authority_missing",
  "contradictory_authority",
  "semantic_identity_ambiguous",
  "requires_fp_judgment"
] as const);

export type ConstructionAmbiguityClass =
  (typeof CONSTRUCTION_AMBIGUITY_CLASS_VALUES)[number];

export const CONSTRUCTION_AFFECT_SIGNAL_KIND_VALUES = Object.freeze([
  "concern",
  "urgency",
  "danger",
  "fear",
  "operator_distress",
  "risk",
  "confidence"
] as const);

export type ConstructionAffectSignalKind =
  (typeof CONSTRUCTION_AFFECT_SIGNAL_KIND_VALUES)[number];

export interface ConstructionObservationSnapshot {
  readonly kind: "construction_observation_snapshot";
  readonly episodeId: string;
  readonly observationId: string;
  readonly snapshotDigest: `sha256:${string}`;
  readonly basisRef: string;
  readonly currentProjectionRef: string;
  readonly iterationOrdinal: number;
  readonly basisProjectionRef: string;
  readonly priorIntentId: string | null;
  readonly causationRef: string;
  readonly correlationId: string;
  readonly observedStateRefs: readonly string[];
  readonly runtimeAggregateRefs: readonly string[];
  readonly linkedAssetRefs: readonly string[];
  readonly passedInputRefs: readonly string[];
  readonly gapProjectionRefs: readonly string[];
  readonly foldbackRefs: readonly string[];
  readonly retryFrontierRefs: readonly string[];
  readonly reentryFrontierRefs: readonly string[];
  readonly assuranceRefs: readonly string[];
  readonly fhInputRefs: readonly string[];
  readonly priorIntentRefs: readonly string[];
  readonly priorProgressRefs: readonly string[];
  readonly actionCatalogRef: string;
  readonly authorityDigest: string;
  readonly pressureRows: readonly ObservationPressureRow[];
  readonly repairSurfaceTriageRows: readonly ConstructionRepairSurfaceTriageRow[];
}

export interface ConstructionObservationAssetRefs {
  readonly linkedAssetRefs: readonly string[];
  readonly passedInputRefs: readonly string[];
}

export interface ObservationPressureRow {
  readonly kind: "observation_pressure_row";
  readonly pressureRef: string;
  readonly pressureKind: ConstructionPressureKind;
  readonly sourceRef: string;
  readonly affectedAssetRefs: readonly string[];
  readonly targetOutcomeRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly severity: number;
  readonly ambiguityClass: ConstructionAmbiguityClass;
  readonly authorityRefs: readonly string[];
  readonly affectSignalKind: ConstructionAffectSignalKind | null;
}

export interface ConstructionRepairSurfaceTriageRow {
  readonly kind: "construction_repair_surface_triage_row";
  readonly triageRef: string;
  readonly pressureRef: string;
  readonly repairSurfaceDisposition: ConstructionRepairSurfaceDisposition;
  readonly graphReentryPoint: GraphReentryPoint;
  readonly repairGraphFunctionRef: string;
  readonly repairGraphVectorRef: string;
  readonly reentryTargetVectorIndex: number;
  readonly repairAssetRef: string;
  readonly targetOutcomeRef: string;
  readonly evidenceRefs: readonly string[];
  readonly authorityRefs: readonly string[];
}

function assertAllowedString<T extends string>(
  value: string,
  allowed: readonly T[],
  label: string
): T {
  for (const candidate of allowed) {
    if (candidate === value) {
      return candidate;
    }
  }
  throw new TypeError(`${label} has unsupported value ${JSON.stringify(value)}`);
}

function assertNonNegativeFiniteNumber(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`${label} must be a non-negative finite number`);
  }
}

function freezeNonEmptyStrings(
  values: readonly string[],
  label: string
): readonly string[] {
  const seen = new Set<string>();
  for (const [index, value] of values.entries()) {
    assertNonEmptyString(value, `${label}[${index}]`);
    if (seen.has(value)) {
      throw new TypeError(`${label} contains duplicate value ${JSON.stringify(value)}`);
    }
    seen.add(value);
  }
  return freezeStringArray(values);
}

function uniqueNonEmptyStrings(
  values: readonly string[],
  label: string
): readonly string[] {
  values.forEach((value, index) =>
    assertNonEmptyString(value, `${label}[${index}]`)
  );
  return freezeStringArray([...new Set(values)].sort());
}

function nullableString(value: string | null, label: string): string | null {
  if (value === null) {
    return null;
  }
  assertNonEmptyString(value, label);
  return value;
}

export function constructObservationPressureRow(input: {
  readonly pressureRef: string;
  readonly pressureKind: ConstructionPressureKind;
  readonly sourceRef: string;
  readonly affectedAssetRefs?: readonly string[];
  readonly targetOutcomeRefs: readonly string[];
  readonly evidenceRefs?: readonly string[];
  readonly severity?: number;
  readonly ambiguityClass?: ConstructionAmbiguityClass;
  readonly authorityRefs?: readonly string[];
  readonly affectSignalKind?: ConstructionAffectSignalKind | null;
}): ObservationPressureRow {
  assertNonEmptyString(input.pressureRef, "ObservationPressureRow.pressureRef");
  assertAllowedString(
    input.pressureKind,
    CONSTRUCTION_PRESSURE_KIND_VALUES,
    "ObservationPressureRow.pressureKind"
  );
  assertNonEmptyString(input.sourceRef, "ObservationPressureRow.sourceRef");
  const severity = input.severity ?? 1;
  assertNonNegativeFiniteNumber(severity, "ObservationPressureRow.severity");
  const ambiguityClass = input.ambiguityClass ?? "none";
  assertAllowedString(
    ambiguityClass,
    CONSTRUCTION_AMBIGUITY_CLASS_VALUES,
    "ObservationPressureRow.ambiguityClass"
  );
  const affectSignalKind = input.affectSignalKind ?? null;
  if (input.pressureKind === "affect_signal") {
    if (affectSignalKind === null) {
      throw new TypeError("affect_signal pressure requires affectSignalKind");
    }
    assertAllowedString(
      affectSignalKind,
      CONSTRUCTION_AFFECT_SIGNAL_KIND_VALUES,
      "ObservationPressureRow.affectSignalKind"
    );
  } else if (affectSignalKind !== null) {
    throw new TypeError("affectSignalKind is only valid for affect_signal pressure");
  }
  return Object.freeze({
    kind: "observation_pressure_row",
    pressureRef: input.pressureRef,
    pressureKind: input.pressureKind,
    sourceRef: input.sourceRef,
    affectedAssetRefs: freezeNonEmptyStrings(
      input.affectedAssetRefs ?? [],
      "ObservationPressureRow.affectedAssetRefs"
    ),
    targetOutcomeRefs: freezeNonEmptyStrings(
      input.targetOutcomeRefs,
      "ObservationPressureRow.targetOutcomeRefs"
    ),
    evidenceRefs: freezeNonEmptyStrings(
      input.evidenceRefs ?? [],
      "ObservationPressureRow.evidenceRefs"
    ),
    severity,
    ambiguityClass,
    authorityRefs: freezeNonEmptyStrings(
      input.authorityRefs ?? [],
      "ObservationPressureRow.authorityRefs"
    ),
    affectSignalKind
  });
}

export function constructConstructionRepairSurfaceTriageRow(input: {
  readonly triageRef: string;
  readonly pressureRef: string;
  readonly repairSurfaceDisposition: ConstructionRepairSurfaceDisposition;
  readonly graphReentryPoint: GraphReentryPoint;
  readonly repairGraphFunctionRef: string;
  readonly repairGraphVectorRef: string;
  readonly reentryTargetVectorIndex: number;
  readonly repairAssetRef: string;
  readonly targetOutcomeRef: string;
  readonly evidenceRefs?: readonly string[];
  readonly authorityRefs?: readonly string[];
}): ConstructionRepairSurfaceTriageRow {
  assertNonEmptyString(
    input.triageRef,
    "ConstructionRepairSurfaceTriageRow.triageRef"
  );
  assertNonEmptyString(
    input.pressureRef,
    "ConstructionRepairSurfaceTriageRow.pressureRef"
  );
  assertAllowedString(
    input.repairSurfaceDisposition,
    CONSTRUCTION_REPAIR_SURFACE_DISPOSITION_VALUES,
    "ConstructionRepairSurfaceTriageRow.repairSurfaceDisposition"
  );
  assertAllowedString(
    input.graphReentryPoint,
    GRAPH_REENTRY_POINT_VALUES,
    "ConstructionRepairSurfaceTriageRow.graphReentryPoint"
  );
  assertNonEmptyString(
    input.repairGraphFunctionRef,
    "ConstructionRepairSurfaceTriageRow.repairGraphFunctionRef"
  );
  assertNonEmptyString(
    input.repairGraphVectorRef,
    "ConstructionRepairSurfaceTriageRow.repairGraphVectorRef"
  );
  assertNonNegativeInteger(
    input.reentryTargetVectorIndex,
    "ConstructionRepairSurfaceTriageRow.reentryTargetVectorIndex"
  );
  assertNonEmptyString(
    input.repairAssetRef,
    "ConstructionRepairSurfaceTriageRow.repairAssetRef"
  );
  assertNonEmptyString(
    input.targetOutcomeRef,
    "ConstructionRepairSurfaceTriageRow.targetOutcomeRef"
  );
  return Object.freeze({
    kind: "construction_repair_surface_triage_row",
    triageRef: input.triageRef,
    pressureRef: input.pressureRef,
    repairSurfaceDisposition: input.repairSurfaceDisposition,
    graphReentryPoint: input.graphReentryPoint,
    repairGraphFunctionRef: input.repairGraphFunctionRef,
    repairGraphVectorRef: input.repairGraphVectorRef,
    reentryTargetVectorIndex: input.reentryTargetVectorIndex,
    repairAssetRef: input.repairAssetRef,
    targetOutcomeRef: input.targetOutcomeRef,
    evidenceRefs: freezeNonEmptyStrings(
      input.evidenceRefs ?? [],
      "ConstructionRepairSurfaceTriageRow.evidenceRefs"
    ),
    authorityRefs: freezeNonEmptyStrings(
      input.authorityRefs ?? [],
      "ConstructionRepairSurfaceTriageRow.authorityRefs"
    )
  });
}

export function constructConstructionObservationSnapshot(input: {
  readonly episodeId: string;
  readonly observationId: string;
  readonly basisRef: string;
  readonly currentProjectionRef: string;
  readonly iterationOrdinal: number;
  readonly basisProjectionRef: string;
  readonly priorIntentId: string | null;
  readonly causationRef: string;
  readonly correlationId: string;
  readonly observedStateRefs?: readonly string[];
  readonly runtimeAggregateRefs?: readonly string[];
  readonly linkedAssetRefs?: readonly string[];
  readonly passedInputRefs?: readonly string[];
  readonly gapProjectionRefs?: readonly string[];
  readonly foldbackRefs?: readonly string[];
  readonly retryFrontierRefs?: readonly string[];
  readonly reentryFrontierRefs?: readonly string[];
  readonly assuranceRefs?: readonly string[];
  readonly fhInputRefs?: readonly string[];
  readonly priorIntentRefs?: readonly string[];
  readonly priorProgressRefs?: readonly string[];
  readonly actionCatalogRef: string;
  readonly authorityDigest: string;
  readonly pressureRows: readonly ObservationPressureRow[];
  readonly repairSurfaceTriageRows?: readonly ConstructionRepairSurfaceTriageRow[];
}): ConstructionObservationSnapshot {
  assertNonEmptyString(input.episodeId, "ConstructionObservationSnapshot.episodeId");
  assertNonEmptyString(input.observationId, "ConstructionObservationSnapshot.observationId");
  assertNonEmptyString(input.basisRef, "ConstructionObservationSnapshot.basisRef");
  assertNonEmptyString(
    input.currentProjectionRef,
    "ConstructionObservationSnapshot.currentProjectionRef"
  );
  assertNonNegativeInteger(
    input.iterationOrdinal,
    "ConstructionObservationSnapshot.iterationOrdinal"
  );
  assertNonEmptyString(
    input.basisProjectionRef,
    "ConstructionObservationSnapshot.basisProjectionRef"
  );
  nullableString(input.priorIntentId, "ConstructionObservationSnapshot.priorIntentId");
  assertNonEmptyString(
    input.causationRef,
    "ConstructionObservationSnapshot.causationRef"
  );
  assertNonEmptyString(
    input.correlationId,
    "ConstructionObservationSnapshot.correlationId"
  );
  assertNonEmptyString(
    input.actionCatalogRef,
    "ConstructionObservationSnapshot.actionCatalogRef"
  );
  assertNonEmptyString(
    input.authorityDigest,
    "ConstructionObservationSnapshot.authorityDigest"
  );
  const pressureRefs = new Set<string>();
  for (const row of input.pressureRows) {
    if (pressureRefs.has(row.pressureRef)) {
      throw new TypeError(
        `ConstructionObservationSnapshot has duplicate pressureRef ${JSON.stringify(row.pressureRef)}`
      );
    }
    pressureRefs.add(row.pressureRef);
  }
  const triageRefs = new Set<string>();
  const triagePressureRefs = new Set<string>();
  for (const row of input.repairSurfaceTriageRows ?? []) {
    if (triageRefs.has(row.triageRef)) {
      throw new TypeError(
        `ConstructionObservationSnapshot has duplicate triageRef ${JSON.stringify(row.triageRef)}`
      );
    }
    if (triagePressureRefs.has(row.pressureRef)) {
      throw new TypeError(
        `ConstructionObservationSnapshot has duplicate repair-surface triage pressureRef ${JSON.stringify(row.pressureRef)}`
      );
    }
    if (!pressureRefs.has(row.pressureRef)) {
      throw new TypeError(
        `ConstructionObservationSnapshot repair-surface triage ${JSON.stringify(row.triageRef)} references unknown pressureRef ${JSON.stringify(row.pressureRef)}`
      );
    }
    triageRefs.add(row.triageRef);
    triagePressureRefs.add(row.pressureRef);
  }
  const basis = Object.freeze({
    kind: "construction_observation_snapshot",
    episodeId: input.episodeId,
    observationId: input.observationId,
    basisRef: input.basisRef,
    currentProjectionRef: input.currentProjectionRef,
    iterationOrdinal: input.iterationOrdinal,
    basisProjectionRef: input.basisProjectionRef,
    priorIntentId: nullableString(
      input.priorIntentId,
      "ConstructionObservationSnapshot.priorIntentId"
    ),
    causationRef: input.causationRef,
    correlationId: input.correlationId,
    observedStateRefs: freezeNonEmptyStrings(
      input.observedStateRefs ?? [],
      "ConstructionObservationSnapshot.observedStateRefs"
    ),
    runtimeAggregateRefs: freezeNonEmptyStrings(
      input.runtimeAggregateRefs ?? [],
      "ConstructionObservationSnapshot.runtimeAggregateRefs"
    ),
    linkedAssetRefs: freezeNonEmptyStrings(
      input.linkedAssetRefs ?? [],
      "ConstructionObservationSnapshot.linkedAssetRefs"
    ),
    passedInputRefs: freezeNonEmptyStrings(
      input.passedInputRefs ?? [],
      "ConstructionObservationSnapshot.passedInputRefs"
    ),
    gapProjectionRefs: freezeNonEmptyStrings(
      input.gapProjectionRefs ?? [],
      "ConstructionObservationSnapshot.gapProjectionRefs"
    ),
    foldbackRefs: freezeNonEmptyStrings(
      input.foldbackRefs ?? [],
      "ConstructionObservationSnapshot.foldbackRefs"
    ),
    retryFrontierRefs: freezeNonEmptyStrings(
      input.retryFrontierRefs ?? [],
      "ConstructionObservationSnapshot.retryFrontierRefs"
    ),
    reentryFrontierRefs: freezeNonEmptyStrings(
      input.reentryFrontierRefs ?? [],
      "ConstructionObservationSnapshot.reentryFrontierRefs"
    ),
    assuranceRefs: freezeNonEmptyStrings(
      input.assuranceRefs ?? [],
      "ConstructionObservationSnapshot.assuranceRefs"
    ),
    fhInputRefs: freezeNonEmptyStrings(
      input.fhInputRefs ?? [],
      "ConstructionObservationSnapshot.fhInputRefs"
    ),
    priorIntentRefs: freezeNonEmptyStrings(
      input.priorIntentRefs ?? [],
      "ConstructionObservationSnapshot.priorIntentRefs"
    ),
    priorProgressRefs: freezeNonEmptyStrings(
      input.priorProgressRefs ?? [],
      "ConstructionObservationSnapshot.priorProgressRefs"
    ),
    actionCatalogRef: input.actionCatalogRef,
    authorityDigest: input.authorityDigest,
    pressureRows: Object.freeze([...input.pressureRows]),
    repairSurfaceTriageRows: Object.freeze([
      ...(input.repairSurfaceTriageRows ?? [])
    ])
  });
  return Object.freeze({
    ...basis,
    snapshotDigest: stableSha256Digest(basis)
  });
}

export function deriveConstructionObservationAssetRefsFromRuntimeTruth(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
}): ConstructionObservationAssetRefs {
  const passedInputRefs = uniqueNonEmptyStrings(
    input.basis.startIntent.inputBindings?.map((binding) => binding.assetRef) ?? [],
    "ConstructionObservationAssetRefs.passedInputRefs"
  );
  const passed = new Set(passedInputRefs);
  const targetRefs = new Set(
    input.basis.graph.vectors.map((vector) => vector.target.id)
  );
  const declaredInputRefs = input.basis.graph.inputs?.map((node) => node.id) ?? [];
  const derivedRootInputRefs = input.basis.graph.vectors.flatMap((vector) =>
    vector.source
      .map((node) => node.id)
      .filter((nodeRef) => !targetRefs.has(nodeRef))
  );
  const rootInputRefs =
    declaredInputRefs.length > 0 ? declaredInputRefs : derivedRootInputRefs;
  const closedTargetRefs = input.projection.closedVectorIndexes.flatMap((index) =>
    input.basis.graph.vectors[index] === undefined
      ? []
      : [input.basis.graph.vectors[index].target.id]
  );
  const linkedAssetRefs = uniqueNonEmptyStrings(
    [...rootInputRefs, ...closedTargetRefs].filter((ref) => !passed.has(ref)),
    "ConstructionObservationAssetRefs.linkedAssetRefs"
  );
  return Object.freeze({
    linkedAssetRefs,
    passedInputRefs
  });
}
