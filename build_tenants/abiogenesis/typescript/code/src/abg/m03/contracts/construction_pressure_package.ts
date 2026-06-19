// Implements: T-139
// Implements: REQ-R-ABG3-FP-CONSCIOUSNESS
// Implements: REQ-R-ABG3-PROJECTION

import type {
  ConstructionPressurePackageMaterializedEvent,
  ExecutionBasis,
  RuntimeAggregateProjection,
  RuntimeEvent
} from "./carriers.js";
import {
  assertNonEmptyString,
  assertNonNegativeInteger,
  freezeStringArray
} from "./runtime_support.js";
import type {
  ConstructionObservationSnapshot,
  ConstructionPressureKind,
  ObservationPressureRow
} from "./construction_observation.js";
import type {
  ConstructionActionCatalogProjection,
  ConstructionActionRow
} from "./construction_action_catalog.js";
import type { AdmittedConstructionIntent } from "./construction_intent.js";
import type { ConstructionProjection } from "./construction_projection.js";
import { stableSha256HexDigest } from "../../../shared/runtime_identity.js";

export interface ConstructionPressureInputBasis {
  readonly kind: "construction_pressure_input_basis";
  readonly episodeId: string;
  readonly observationId: string;
  readonly basisRef: string;
  readonly constructionProjectionRef: string;
  readonly runtimeProjectionRef: string;
  readonly overlayFrameProjectionRef: string;
  readonly selectedIntentId: string;
  readonly selectedActionRef: string;
  readonly selectedOutcomeRef: string;
  readonly executionTargetRef: string;
  readonly observedStateRefs: readonly string[];
  readonly fdOutcomeRefs: readonly string[];
  readonly overlayFrameRefs: readonly string[];
  readonly intentLineageRefs: readonly string[];
  readonly expectedOutputAssetRefs: readonly string[];
  readonly carriedObligationRefs: readonly string[];
  readonly gapRefs: readonly string[];
  readonly targetStateRefs: readonly string[];
  readonly priorEvidenceRefs: readonly string[];
  readonly lawfulBasisRefs: readonly string[];
  readonly obligationPolicyRefs: readonly string[];
}

export interface ConstructionPressureRef {
  readonly kind: "construction_pressure_ref";
  readonly pressureRef: string;
  readonly pressureKind: ConstructionPressureKind;
  readonly sourceRef: string;
  readonly targetOutcomeRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly authorityRefs: readonly string[];
}

export interface ConstructionPressureClearanceEvidence {
  readonly kind: "construction_pressure_clearance_evidence";
  readonly evidenceRef: string;
  readonly sourceEventRef: string;
  readonly pressureRefs: readonly string[];
}

export interface ConstructionPressurePackage {
  readonly kind: "construction_pressure_package";
  readonly packageRef: string;
  readonly packageDigest: string;
  readonly inputBasis: ConstructionPressureInputBasis;
  readonly pressureRefs: readonly ConstructionPressureRef[];
  readonly clearanceEvidence: readonly ConstructionPressureClearanceEvidence[];
}

export interface ConstructionPressurePackageAdmission {
  readonly kind: "construction_pressure_package_admission";
  readonly status: "admitted" | "rejected";
  readonly packageRef: string;
  readonly packageDigest: string;
  readonly diagnosticRefs: readonly string[];
}

export interface ConstructionPressureProjection {
  readonly kind: "construction_pressure_projection";
  readonly episodeId: string;
  readonly projectionRef: string;
  readonly packageRefs: readonly string[];
  readonly latestPackageRef: string | null;
  readonly openPressureRefs: readonly string[];
  readonly clearedPressureRefs: readonly string[];
  readonly clearanceEvidenceRefs: readonly string[];
}

const stableDigest = stableSha256HexDigest;

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

function selectedActionForIntent(input: {
  readonly actionCatalog: ConstructionActionCatalogProjection;
  readonly admittedIntent: AdmittedConstructionIntent;
}): ConstructionActionRow {
  const action = input.actionCatalog.rows.find(
    (row) => row.actionRef === input.admittedIntent.selectedActionRef
  );
  if (action === undefined) {
    throw new TypeError("Construction pressure package requires selected action");
  }
  return action;
}

function selectedPressureRows(input: {
  readonly observation: ConstructionObservationSnapshot;
  readonly admittedIntent: AdmittedConstructionIntent;
}): readonly ObservationPressureRow[] {
  const rows = input.observation.pressureRows.filter((row) =>
    row.targetOutcomeRefs.includes(input.admittedIntent.selectedOutcomeRef)
  );
  if (rows.length === 0) {
    throw new TypeError(
      "Construction pressure package requires pressure for selected outcome"
    );
  }
  return Object.freeze(rows);
}

function fdOutcomeRefsFromEvents(events: readonly RuntimeEvent[]): readonly string[] {
  return uniqueNonEmptyStrings(
    events
      .filter((event) => event.kind === "fd_authority_outcome_admitted")
      .map((event) => event.outcomeRef),
    "ConstructionPressurePackage.fdOutcomeRefs"
  );
}

function fdEvidenceRefsFromEvents(events: readonly RuntimeEvent[]): readonly string[] {
  return uniqueNonEmptyStrings(
    events
      .filter((event) => event.kind === "fd_authority_outcome_admitted")
      .flatMap((event) => event.evidenceRefs),
    "ConstructionPressurePackage.fdEvidenceRefs"
  );
}

function pressureRefRows(
  pressures: readonly ObservationPressureRow[]
): readonly ConstructionPressureRef[] {
  return Object.freeze(
    pressures.map((pressure) => Object.freeze({
      kind: "construction_pressure_ref",
      pressureRef: pressure.pressureRef,
      pressureKind: pressure.pressureKind,
      sourceRef: pressure.sourceRef,
      targetOutcomeRefs: freezeStringArray(pressure.targetOutcomeRefs),
      evidenceRefs: freezeStringArray(pressure.evidenceRefs),
      authorityRefs: freezeStringArray(pressure.authorityRefs)
    }))
  );
}

function constructionPressurePackageDigest(input: {
  readonly inputBasis: ConstructionPressureInputBasis;
  readonly pressureRefs: readonly ConstructionPressureRef[];
  readonly clearanceEvidence: readonly ConstructionPressureClearanceEvidence[];
}): string {
  return stableDigest({
    inputBasis: input.inputBasis,
    pressureRefs: input.pressureRefs,
    clearanceEvidence: input.clearanceEvidence
  });
}

export function deriveConstructionPressurePackage(input: {
  readonly basis: ExecutionBasis;
  readonly observation: ConstructionObservationSnapshot;
  readonly admittedIntent: AdmittedConstructionIntent;
  readonly actionCatalog: ConstructionActionCatalogProjection;
  readonly constructionProjection: ConstructionProjection;
  readonly runtimeProjection: RuntimeAggregateProjection;
  readonly runtimeProjectionRef: string;
  readonly runtimeEvents?: readonly RuntimeEvent[] | undefined;
  readonly priorEvidenceRefs?: readonly string[] | undefined;
  readonly obligationPolicyRefs?: readonly string[] | undefined;
}): ConstructionPressurePackage {
  if (input.observation.episodeId !== input.admittedIntent.episodeId) {
    throw new TypeError("Construction pressure package episode mismatch");
  }
  if (input.observation.basisRef !== input.basis.id) {
    throw new TypeError("Construction pressure package basis mismatch");
  }
  const action = selectedActionForIntent({
    actionCatalog: input.actionCatalog,
    admittedIntent: input.admittedIntent
  });
  const pressures = selectedPressureRows({
    observation: input.observation,
    admittedIntent: input.admittedIntent
  });
  const pressureRefs = pressureRefRows(pressures);
  const runtimeEvents = input.runtimeEvents ?? Object.freeze([]);
  const fdOutcomeRefs = fdOutcomeRefsFromEvents(runtimeEvents);
  const observedStateRefs = uniqueNonEmptyStrings(
    [
      ...input.observation.observedStateRefs,
      ...input.runtimeProjection.observedState.observedStateRefs
    ],
    "ConstructionPressurePackage.observedStateRefs"
  );
  const overlayFrameRefs = freezeStringArray(
    input.runtimeProjection.overlayFrame.activeOverlayFrameRefs
  );
  const expectedOutputAssetRefs = uniqueNonEmptyStrings(
    [
      ...action.expectedOutputAssetRefs,
      ...input.admittedIntent.expectedOutputAssetRefs
    ],
    "ConstructionPressurePackage.expectedOutputAssetRefs"
  );
  const targetStateRefs = uniqueNonEmptyStrings(
    [
      ...input.observation.linkedAssetRefs,
      ...expectedOutputAssetRefs,
      ...input.runtimeProjection.overlayFrame.carriedPressureRefs
    ],
    "ConstructionPressurePackage.targetStateRefs"
  );
  const carriedObligationRefs = uniqueNonEmptyStrings(
    input.admittedIntent.obligationRefs,
    "ConstructionPressurePackage.carriedObligationRefs"
  );
  const intentLineageRefs = uniqueNonEmptyStrings(
    [
      input.admittedIntent.intentId,
      input.admittedIntent.admissionDecisionRef,
      ...input.admittedIntent.lineageRefs,
      ...input.admittedIntent.inputAssetRefs,
      ...input.admittedIntent.expectedOutputAssetRefs,
      ...input.admittedIntent.obligationRefs,
      ...input.admittedIntent.lawfulBasisRefs
    ],
    "ConstructionPressurePackage.intentLineageRefs"
  );
  const priorEvidenceRefs = uniqueNonEmptyStrings(
    [
      ...pressures.flatMap((pressure) => pressure.evidenceRefs),
      ...fdEvidenceRefsFromEvents(runtimeEvents),
      ...input.constructionProjection.sourceProjectionRefs,
      ...(input.priorEvidenceRefs ?? [])
    ],
    "ConstructionPressurePackage.priorEvidenceRefs"
  );
  const lawfulBasisRefs = uniqueNonEmptyStrings(
    [
      ...input.admittedIntent.lawfulBasisRefs,
      ...action.requiredAuthorityRefs,
      ...pressures.flatMap((pressure) => pressure.authorityRefs)
    ],
    "ConstructionPressurePackage.lawfulBasisRefs"
  );
  const obligationPolicyRefs = uniqueNonEmptyStrings(
    [
      input.basis.resolvedPolicy.resolvedPolicyBundleRef,
      ...lawfulBasisRefs,
      ...(input.obligationPolicyRefs ?? [])
    ],
    "ConstructionPressurePackage.obligationPolicyRefs"
  );
  const executionTargetRef =
    input.admittedIntent.selectedGraphFunctionRef ??
    input.admittedIntent.selectedVectorRef ??
    input.admittedIntent.selectedReentryRef ??
    input.admittedIntent.selectedActionRef;
  const inputBasis = Object.freeze({
    kind: "construction_pressure_input_basis",
    episodeId: input.admittedIntent.episodeId,
    observationId: input.observation.observationId,
    basisRef: input.basis.id,
    constructionProjectionRef: input.constructionProjection.projectionRef,
    runtimeProjectionRef: input.runtimeProjectionRef,
    overlayFrameProjectionRef: input.runtimeProjection.overlayFrame.projectionRef,
    selectedIntentId: input.admittedIntent.intentId,
    selectedActionRef: input.admittedIntent.selectedActionRef,
    selectedOutcomeRef: input.admittedIntent.selectedOutcomeRef,
    executionTargetRef,
    observedStateRefs,
    fdOutcomeRefs,
    overlayFrameRefs,
    intentLineageRefs,
    expectedOutputAssetRefs,
    carriedObligationRefs,
    gapRefs: freezeStringArray(input.admittedIntent.gapRefs),
    targetStateRefs,
    priorEvidenceRefs,
    lawfulBasisRefs,
    obligationPolicyRefs
  } satisfies ConstructionPressureInputBasis);
  const clearanceEvidence: readonly ConstructionPressureClearanceEvidence[] =
    Object.freeze([]);
  const packageDigest = constructionPressurePackageDigest({
    inputBasis,
    pressureRefs,
    clearanceEvidence
  });
  return Object.freeze({
    kind: "construction_pressure_package",
    packageRef: `construction-pressure-package:${packageDigest}`,
    packageDigest,
    inputBasis,
    pressureRefs,
    clearanceEvidence
  });
}

export function admitConstructionPressurePackage(input: {
  readonly pressurePackage: ConstructionPressurePackage;
}): ConstructionPressurePackageAdmission {
  const expectedDigest = constructionPressurePackageDigest({
    inputBasis: input.pressurePackage.inputBasis,
    pressureRefs: input.pressurePackage.pressureRefs,
    clearanceEvidence: input.pressurePackage.clearanceEvidence
  });
  const diagnosticRefs: string[] = [];
  if (input.pressurePackage.packageDigest !== expectedDigest) {
    diagnosticRefs.push("construction_pressure_package_digest_mismatch");
  }
  if (input.pressurePackage.inputBasis.observedStateRefs.length === 0) {
    diagnosticRefs.push("construction_pressure_package_missing_observed_state");
  }
  if (input.pressurePackage.pressureRefs.length === 0) {
    diagnosticRefs.push("construction_pressure_package_missing_pressure");
  }
  if (input.pressurePackage.inputBasis.intentLineageRefs.length === 0) {
    diagnosticRefs.push("construction_pressure_package_missing_intent_lineage");
  }
  if (input.pressurePackage.inputBasis.carriedObligationRefs.length === 0) {
    diagnosticRefs.push("construction_pressure_package_missing_carried_obligation");
  }
  if (input.pressurePackage.inputBasis.expectedOutputAssetRefs.length === 0) {
    diagnosticRefs.push("construction_pressure_package_missing_expected_output");
  }
  return Object.freeze({
    kind: "construction_pressure_package_admission",
    status: diagnosticRefs.length === 0 ? "admitted" : "rejected",
    packageRef: input.pressurePackage.packageRef,
    packageDigest: input.pressurePackage.packageDigest,
    diagnosticRefs: freezeStringArray(diagnosticRefs)
  });
}

export function assertConstructionPressurePackageAdmitted(
  admission: ConstructionPressurePackageAdmission
): void {
  if (admission.status !== "admitted") {
    throw new TypeError(
      `Construction pressure package ${admission.packageRef} is rejected`
    );
  }
}

export function constructConstructionPressurePackageMaterializedEvent(input: {
  readonly constructionEventRef: string;
  readonly admittedIntent: AdmittedConstructionIntent;
  readonly pressurePackage: ConstructionPressurePackage;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly eventSequence: number;
  readonly causationEventRefs?: readonly string[] | undefined;
}): ConstructionPressurePackageMaterializedEvent {
  assertConstructionPressurePackageAdmitted(
    admitConstructionPressurePackage({ pressurePackage: input.pressurePackage })
  );
  assertNonEmptyString(
    input.constructionEventRef,
    "ConstructionPressurePackageMaterializedEvent.constructionEventRef"
  );
  assertNonNegativeInteger(
    input.eventSequence,
    "ConstructionPressurePackageMaterializedEvent.eventSequence"
  );
  return Object.freeze({
    kind: "construction_pressure_package_materialized",
    constructionEventRef: input.constructionEventRef,
    basisId: input.basisId,
    graphFunctionId: input.graphFunctionId,
    runId: input.runId,
    workKey: input.workKey,
    episodeId: input.admittedIntent.episodeId,
    iterationOrdinal: input.admittedIntent.iterationOrdinal,
    eventSequence: input.eventSequence,
    basisProjectionRef: input.admittedIntent.basisProjectionRef,
    priorIntentId: input.admittedIntent.priorIntentId,
    causationEventRefs: freezeNonEmptyStrings(
      input.causationEventRefs ?? [input.admittedIntent.admissionDecisionRef],
      "ConstructionPressurePackageMaterializedEvent.causationEventRefs"
    ),
    correlationId: input.admittedIntent.correlationId,
    packageRef: input.pressurePackage.packageRef,
    packageDigest: input.pressurePackage.packageDigest,
    observationId: input.pressurePackage.inputBasis.observationId,
    selectedIntentId: input.pressurePackage.inputBasis.selectedIntentId,
    selectedActionRef: input.pressurePackage.inputBasis.selectedActionRef,
    selectedOutcomeRef: input.pressurePackage.inputBasis.selectedOutcomeRef,
    executionTargetRef: input.pressurePackage.inputBasis.executionTargetRef,
    runtimeProjectionRef: input.pressurePackage.inputBasis.runtimeProjectionRef,
    constructionProjectionRef:
      input.pressurePackage.inputBasis.constructionProjectionRef,
    overlayFrameProjectionRef:
      input.pressurePackage.inputBasis.overlayFrameProjectionRef,
    observedStateRefs: freezeStringArray(
      input.pressurePackage.inputBasis.observedStateRefs
    ),
    pressureRefs: freezeStringArray(
      input.pressurePackage.pressureRefs.map((row) => row.pressureRef)
    ),
    fdOutcomeRefs: freezeStringArray(
      input.pressurePackage.inputBasis.fdOutcomeRefs
    ),
    overlayFrameRefs: freezeStringArray(
      input.pressurePackage.inputBasis.overlayFrameRefs
    ),
    intentLineageRefs: freezeStringArray(
      input.pressurePackage.inputBasis.intentLineageRefs
    ),
    expectedOutputAssetRefs: freezeStringArray(
      input.pressurePackage.inputBasis.expectedOutputAssetRefs
    ),
    carriedObligationRefs: freezeStringArray(
      input.pressurePackage.inputBasis.carriedObligationRefs
    ),
    gapRefs: freezeStringArray(
      input.pressurePackage.inputBasis.gapRefs
    ),
    targetStateRefs: freezeStringArray(
      input.pressurePackage.inputBasis.targetStateRefs
    ),
    priorEvidenceRefs: freezeStringArray(
      input.pressurePackage.inputBasis.priorEvidenceRefs
    ),
    lawfulBasisRefs: freezeStringArray(
      input.pressurePackage.inputBasis.lawfulBasisRefs
    ),
    obligationPolicyRefs: freezeStringArray(
      input.pressurePackage.inputBasis.obligationPolicyRefs
    )
  });
}

export function deriveConstructionPressureProjection(input: {
  readonly episodeId: string;
  readonly events: readonly RuntimeEvent[];
}): ConstructionPressureProjection {
  assertNonEmptyString(input.episodeId, "ConstructionPressureProjection.episodeId");
  const packageRefs: string[] = [];
  const openPressureRefs = new Set<string>();
  const clearedPressureRefs = new Set<string>();
  const clearanceEvidenceRefs = new Set<string>();
  const packagePressureByIntent = new Map<string, readonly string[]>();
  let latestPackageRef: string | null = null;
  for (const event of input.events) {
    if (
      "episodeId" in event &&
      event.episodeId !== undefined &&
      event.episodeId !== input.episodeId
    ) {
      continue;
    }
    if (event.kind === "construction_pressure_package_materialized") {
      packageRefs.push(event.packageRef);
      latestPackageRef = event.packageRef;
      packagePressureByIntent.set(event.selectedIntentId, event.pressureRefs);
      for (const pressureRef of event.pressureRefs) {
        openPressureRefs.add(pressureRef);
      }
    }
    if (event.kind === "construction_delta_observed" && event.closed) {
      const pressureRefs = packagePressureByIntent.get(event.intentId) ?? [];
      for (const pressureRef of pressureRefs) {
        openPressureRefs.delete(pressureRef);
        clearedPressureRefs.add(pressureRef);
      }
      for (const evidenceRef of event.newEvidenceRefs) {
        clearanceEvidenceRefs.add(evidenceRef);
      }
    }
  }
  return Object.freeze({
    kind: "construction_pressure_projection",
    episodeId: input.episodeId,
    projectionRef: `construction-pressure-projection:${stableDigest({
      episodeId: input.episodeId,
      packageRefs,
      openPressureRefs: [...openPressureRefs].sort(),
      clearedPressureRefs: [...clearedPressureRefs].sort()
    })}`,
    packageRefs: freezeStringArray(packageRefs),
    latestPackageRef,
    openPressureRefs: freezeStringArray([...openPressureRefs].sort()),
    clearedPressureRefs: freezeStringArray([...clearedPressureRefs].sort()),
    clearanceEvidenceRefs: freezeStringArray([...clearanceEvidenceRefs].sort())
  });
}
