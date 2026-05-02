// Implements: T-100-TS
// Implements: REQ-R-ABG3-FRAME
// Implements: REQ-R-ABG3-LINEAGE
// Implements: REQ-R-ABG3-PROVENANCE
// Implements: REQ-R-ABG3-EVENTS

import type {
  ExecutionBasis,
  RuntimeRegime,
  RuntimeEvent,
  RuntimeFailureClass,
  ScheduledSliceAssessedRuntimeEvent,
  ScheduledSliceDispatchedRuntimeEvent,
  WorkspaceObligationLedgerAdmittedEvent,
  WorkspaceObligationScheduleDerivedEvent,
  ZoomFoldbackEvaluatedRuntimeEvent,
  ZoomFrameOpenedRuntimeEvent
} from "./carriers.js";
import type {
  OutputInstanceAllocation,
  OutputPluginHandoffManifest,
  WorkspaceAssetBinding
} from "./output_allocation.js";
import {
  assertBasisEvent,
  assertNonEmptyString,
  assertVectorIndexInRange,
  frameIdForBasis,
  freezeStringArray,
  graphCallIdForBasis,
  vectorEdge
} from "./runtime_support.js";

export type ObligationLedgerRowStatus =
  | "open"
  | "fulfilled"
  | "partial"
  | "blocked";

export type ScheduledSliceAssessmentStatus =
  | "fulfilled"
  | "partial"
  | "blocked"
  | "runtime_failed";

export type ScheduledSliceAssessmentFindingClass =
  | "fulfilled"
  | "semantic_fulfillment_gap"
  | "traceability_reference_gap";

export interface ScheduledSliceFindingClassCounts {
  readonly fulfilled: number;
  readonly semantic_fulfillment_gap: number;
  readonly traceability_reference_gap: number;
}

export const RETRYABLE_RUNTIME_FAILURE_CLASSES: readonly RuntimeFailureClass[] =
  Object.freeze([
    "transport_failure",
    "no_output",
    "contract_failure"
  ]);

export type ZoomFoldbackDecision =
  | "close"
  | "retry_scheduled_slice"
  | "carry_loopback_pressure"
  | "blocked"
  | "reprice_required";

export interface WorkspaceSystemProjection {
  readonly kind: "workspace_system_projection";
  readonly workspaceRoot: string;
  readonly systemRoot: string;
  readonly runtimeRoot: string;
  readonly eventStreamRef: string;
  readonly assetRefs: readonly string[];
}

export interface ObligationLedgerRow {
  readonly kind: "obligation_ledger_row";
  readonly obligationId: string;
  readonly authorityRef: string;
  readonly description: string;
  readonly status: ObligationLedgerRowStatus;
  readonly requiredOutputRefs: readonly string[];
}

export interface ObligationLedgerAsset {
  readonly kind: "obligation_ledger_asset";
  readonly ledgerRef: string;
  readonly workspaceAssetRef: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly authorityDigest: string;
  readonly rows: readonly ObligationLedgerRow[];
}

export interface ObligationScheduleItem {
  readonly kind: "obligation_schedule_item";
  readonly scheduleItemId: string;
  readonly obligationId: string;
  readonly ordinal: number;
  readonly sliceRef: string;
  readonly requiredOutputRefs: readonly string[];
}

export interface ObligationScheduleAsset {
  readonly kind: "obligation_schedule_asset";
  readonly scheduleRef: string;
  readonly ledgerRef: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly items: readonly ObligationScheduleItem[];
}

export interface ZoomFrame {
  readonly kind: "zoom_frame";
  readonly zoomFrameId: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly inputAssetRef: string;
  readonly outputAssetRef: string;
  readonly ledgerRef: string;
  readonly scheduleRef: string;
}

export interface ScheduledSliceDispatch {
  readonly kind: "scheduled_slice_dispatch";
  readonly zoomFrameId: string;
  readonly scheduleItemId: string;
  readonly obligationId: string;
  readonly attemptIndex: number;
  readonly handoffRef: string;
  readonly pluginRef: string;
  readonly outputAssetRef: string;
}

export interface ScheduledSliceAssessment {
  readonly kind: "scheduled_slice_assessment";
  readonly zoomFrameId: string;
  readonly assessmentId: string;
  readonly scheduleItemId: string;
  readonly obligationId: string;
  readonly attemptIndex: number;
  readonly status: ScheduledSliceAssessmentStatus;
  readonly assessmentRegime: RuntimeRegime;
  readonly findingClass: ScheduledSliceAssessmentFindingClass | null;
  readonly evidenceRefs: readonly string[];
  readonly outputRefs: readonly string[];
  readonly runtimeFailureClass: RuntimeFailureClass | null;
  readonly detail: string | null;
}

export interface ZoomFoldbackEvaluation {
  readonly kind: "zoom_foldback_evaluation";
  readonly foldbackRef: string;
  readonly zoomFrameId: string;
  readonly scheduleRef: string;
  readonly decision: ZoomFoldbackDecision;
  readonly carryConverged: boolean;
  readonly fulfillmentConverged: boolean;
  readonly admitted: boolean;
  readonly targetCertificationPassed: boolean;
  readonly fdRecheckPassed: boolean;
  readonly retryAllowlist: readonly RuntimeFailureClass[];
  readonly fulfilledCount: number;
  readonly openCount: number;
  readonly blockedCount: number;
  readonly runtimeFailureCount: number;
  readonly missingAssessmentCount: number;
  readonly conflictingCount: number;
  readonly semanticFulfillmentGapCount: number;
  readonly traceabilityReferenceGapCount: number;
  readonly findingClassCounts: ScheduledSliceFindingClassCounts;
  readonly fulfilledItemRefs: readonly string[];
  readonly openItemRefs: readonly string[];
  readonly blockedItemRefs: readonly string[];
  readonly runtimeFailureItemRefs: readonly string[];
  readonly missingAssessmentItemRefs: readonly string[];
  readonly conflictingItemRefs: readonly string[];
  readonly salvagedItemRefs: readonly string[];
}

export interface OuterTraversalEvaluation {
  readonly kind: "outer_traversal_evaluation";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly edge: string;
  readonly foldbackRef: string;
  readonly closureAllowed: boolean;
  readonly decision: ZoomFoldbackDecision;
  readonly nextAction:
    | "close"
    | "retry_same_edge"
    | "carry_loopback_pressure"
    | "block"
    | "reprice";
}

export type ScheduledSliceDecision =
  | {
      readonly kind: "dispatch_slice";
      readonly item: ObligationScheduleItem;
      readonly attemptIndex: number;
    }
  | { readonly kind: "all_slices_fulfilled" };

export interface WorkspaceZoomProjection {
  readonly kind: "workspace_zoom_projection";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly ledgerRefs: readonly string[];
  readonly scheduleRefs: readonly string[];
  readonly zoomFrameIds: readonly string[];
  readonly dispatchedSliceRefs: readonly string[];
  readonly assessedSliceRefs: readonly string[];
  readonly foldbackRefs: readonly string[];
  readonly foldbackEvaluation?: ZoomFoldbackEvaluation;
}

type LedgerResult =
  | { readonly ok: true; readonly ledger: ObligationLedgerAsset }
  | { readonly ok: false; readonly reason: string; readonly detail: string };

type ScheduleResult =
  | { readonly ok: true; readonly schedule: ObligationScheduleAsset }
  | { readonly ok: false; readonly reason: string; readonly detail: string };

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/g, "");
}

function ledgerFailure(reason: string, detail: string): LedgerResult {
  return Object.freeze({ ok: false, reason, detail } as const);
}

function scheduleFailure(reason: string, detail: string): ScheduleResult {
  return Object.freeze({ ok: false, reason, detail } as const);
}

function sortedStrings(values: Iterable<string>): readonly string[] {
  return freezeStringArray([...values].sort());
}

function isRetryableRuntimeFailureClass(
  failureClass: RuntimeFailureClass | null
): boolean {
  return (
    failureClass !== null &&
    RETRYABLE_RUNTIME_FAILURE_CLASSES.includes(failureClass)
  );
}

function assessmentRefsByItem(
  assessments: readonly ScheduledSliceAssessment[],
  scheduleItemId: string
): readonly ScheduledSliceAssessment[] {
  return Object.freeze(
    assessments
      .filter((assessment) => assessment.scheduleItemId === scheduleItemId)
      .sort((left, right) => left.attemptIndex - right.attemptIndex)
  );
}

function latestAttemptIndex(
  assessments: readonly ScheduledSliceAssessment[]
): number {
  return assessments.reduce(
    (latest, assessment) => Math.max(latest, assessment.attemptIndex),
    -1
  );
}

function latestSemanticAssessments(
  assessments: readonly ScheduledSliceAssessment[]
): readonly ScheduledSliceAssessment[] {
  const semanticAssessments = assessments.filter(
    (assessment) => assessment.status !== "runtime_failed"
  );
  const latest = latestAttemptIndex(semanticAssessments);
  if (latest < 0) {
    return Object.freeze([]);
  }
  return Object.freeze(
    semanticAssessments.filter((assessment) => assessment.attemptIndex === latest)
  );
}

function defaultFindingClassForStatus(
  status: ScheduledSliceAssessmentStatus
): ScheduledSliceAssessmentFindingClass | null {
  if (status === "fulfilled") {
    return "fulfilled";
  }
  if (status === "partial") {
    return "traceability_reference_gap";
  }
  if (status === "blocked") {
    return "semantic_fulfillment_gap";
  }
  return null;
}

function defaultAssessmentRegimeForStatus(
  status: ScheduledSliceAssessmentStatus
): RuntimeRegime {
  return status === "runtime_failed" ? "F_D" : "F_P";
}

function makeFindingClassCounts(): Record<ScheduledSliceAssessmentFindingClass, number> {
  return {
    fulfilled: 0,
    semantic_fulfillment_gap: 0,
    traceability_reference_gap: 0
  };
}

function assertBasisOwnedRecord(
  basis: ExecutionBasis,
  record: { readonly basisId: string; readonly graphFunctionId: string },
  label: string
): void {
  if (record.basisId !== basis.id) {
    throw new TypeError(`${label} must share the execution basis`);
  }
  if (record.graphFunctionId !== basis.graphFunction.id) {
    throw new TypeError(`${label} must share the graph function`);
  }
}

function assertScheduleDerivedFromLedger(
  schedule: ObligationScheduleAsset,
  ledger: ObligationLedgerAsset
): void {
  if (ledger.ledgerRef !== schedule.ledgerRef) {
    throw new TypeError("Obligation schedule must be derived from the ledger");
  }
  if (schedule.basisId !== ledger.basisId) {
    throw new TypeError("Obligation schedule must share the ledger basis");
  }
  if (schedule.graphFunctionId !== ledger.graphFunctionId) {
    throw new TypeError("Obligation schedule must share the ledger graph function");
  }
}

function assertZoomFrameLineage(
  basis: ExecutionBasis,
  zoomFrame: ZoomFrame
): void {
  assertBasisOwnedRecord(basis, zoomFrame, "Zoom frame");
  assertVectorIndexInRange(basis, zoomFrame.vectorIndex);
  if (zoomFrame.edge !== vectorEdge(basis, zoomFrame.vectorIndex)) {
    throw new TypeError("Zoom frame edge must match the execution basis vector");
  }
}

function assertFulfilledAssessmentEvidence(
  item: ObligationScheduleItem,
  assessment: {
    readonly status: ScheduledSliceAssessmentStatus;
    readonly evidenceRefs: readonly string[];
    readonly outputRefs: readonly string[];
  }
): void {
  if (assessment.status !== "fulfilled") {
    return;
  }
  if (assessment.evidenceRefs.length === 0) {
    throw new TypeError("Fulfilled scheduled slice assessment requires evidence refs");
  }
  const outputRefs = new Set(assessment.outputRefs);
  const missingOutputRefs = item.requiredOutputRefs.filter(
    (requiredOutputRef) => !outputRefs.has(requiredOutputRef)
  );
  if (missingOutputRefs.length > 0) {
    throw new TypeError(
      `Fulfilled scheduled slice assessment is missing required output refs: ${missingOutputRefs.join(", ")}`
    );
  }
}

function assertFoldbackEventMatchesProjection(
  event: ZoomFoldbackEvaluatedRuntimeEvent,
  foldback: ZoomFoldbackEvaluation
): void {
  if (
    event.foldbackRef !== foldback.foldbackRef ||
    event.decision !== foldback.decision ||
    event.fulfilledCount !== foldback.fulfilledCount ||
    event.openCount !== foldback.openCount ||
    event.blockedCount !== foldback.blockedCount ||
    event.runtimeFailureCount !== foldback.runtimeFailureCount ||
    event.missingAssessmentCount !== foldback.missingAssessmentCount ||
    event.conflictingCount !== foldback.conflictingCount
  ) {
    throw new TypeError(
      "Zoom foldback evaluated event must match replay-derived foldback truth"
    );
  }
}

export function deriveWorkspaceSystemProjection(input: {
  readonly workspaceRoot: string;
  readonly assetRefs: readonly string[];
}): WorkspaceSystemProjection {
  assertNonEmptyString(input.workspaceRoot, "WorkspaceSystemProjection.workspaceRoot");
  const workspaceRoot = trimTrailingSlashes(input.workspaceRoot);
  const systemRoot = `${workspaceRoot}/.ai-workspace`;
  return Object.freeze({
    kind: "workspace_system_projection",
    workspaceRoot,
    systemRoot,
    runtimeRoot: `${systemRoot}/runtime`,
    eventStreamRef: `${systemRoot}/runtime/events.jsonl`,
    assetRefs: sortedStrings(input.assetRefs)
  });
}

export function deriveObligationLedgerAsset(input: {
  readonly basis: ExecutionBasis;
  readonly sourceAsset: WorkspaceAssetBinding;
  readonly authorityDigest: string;
  readonly rows: readonly ObligationLedgerRow[];
  readonly ledgerRef?: string;
}): LedgerResult {
  if (input.sourceAsset.bindingRole !== "input") {
    return ledgerFailure(
      "missing_input_binding",
      "Obligation ledger requires an admitted input workspace asset"
    );
  }
  if (input.authorityDigest.length === 0) {
    return ledgerFailure(
      "empty_authority_digest",
      "Obligation ledger requires authorityDigest"
    );
  }
  if (input.rows.length === 0) {
    return ledgerFailure("empty_ledger", "Obligation ledger requires at least one row");
  }
  const seen = new Set<string>();
  for (const row of input.rows) {
    if (row.obligationId.length === 0) {
      return ledgerFailure("empty_obligation_id", "Obligation id must be non-empty");
    }
    if (seen.has(row.obligationId)) {
      return ledgerFailure(
        "duplicate_obligation_id",
        `Duplicate obligation ${row.obligationId}`
      );
    }
    seen.add(row.obligationId);
  }
  const ledgerRef =
    input.ledgerRef ??
    `${input.sourceAsset.assetRef}.requirements.ledger:${input.authorityDigest}`;
  return Object.freeze({
    ok: true,
    ledger: Object.freeze({
      kind: "obligation_ledger_asset",
      ledgerRef,
      workspaceAssetRef: input.sourceAsset.assetRef,
      basisId: input.basis.id,
      graphFunctionId: input.basis.graphFunction.id,
      authorityDigest: input.authorityDigest,
      rows: Object.freeze(
        input.rows.map((row) =>
          Object.freeze({
            kind: "obligation_ledger_row",
            obligationId: row.obligationId,
            authorityRef: row.authorityRef,
            description: row.description,
            status: row.status,
            requiredOutputRefs: freezeStringArray(row.requiredOutputRefs)
          })
        )
      )
    })
  } as const);
}

export function deriveObligationSchedule(
  ledger: ObligationLedgerAsset
): ScheduleResult {
  if (ledger.rows.length === 0) {
    return scheduleFailure("empty_ledger", "Schedule requires ledger rows");
  }
  const items = ledger.rows.map((row, index) =>
    Object.freeze({
      kind: "obligation_schedule_item",
      scheduleItemId: `${ledger.ledgerRef}:schedule-item:${index}:${row.obligationId}`,
      obligationId: row.obligationId,
      ordinal: index,
      sliceRef: `${ledger.ledgerRef}:slice:${row.obligationId}`,
      requiredOutputRefs: freezeStringArray(row.requiredOutputRefs)
    } as const)
  );
  return Object.freeze({
    ok: true,
    schedule: Object.freeze({
      kind: "obligation_schedule_asset",
      scheduleRef: `${ledger.ledgerRef}.requirements.schedule`,
      ledgerRef: ledger.ledgerRef,
      basisId: ledger.basisId,
      graphFunctionId: ledger.graphFunctionId,
      items: Object.freeze(items)
    })
  } as const);
}

export function openZoomFrame(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly inputAsset: WorkspaceAssetBinding;
  readonly outputAllocation: OutputInstanceAllocation;
  readonly ledger: ObligationLedgerAsset;
  readonly schedule: ObligationScheduleAsset;
}): ZoomFrame {
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  if (input.inputAsset.bindingRole !== "input") {
    throw new TypeError("Zoom frame requires an admitted input asset binding");
  }
  if (input.inputAsset.workspaceRoot !== input.basis.workspaceRoot) {
    throw new TypeError("Zoom frame input asset must share the execution workspace");
  }
  assertBasisOwnedRecord(input.basis, input.ledger, "Obligation ledger");
  assertBasisOwnedRecord(input.basis, input.schedule, "Obligation schedule");
  assertBasisOwnedRecord(input.basis, input.outputAllocation, "Output allocation");
  if (input.ledger.workspaceAssetRef !== input.inputAsset.assetRef) {
    throw new TypeError("Zoom frame ledger must be admitted for the input asset");
  }
  assertScheduleDerivedFromLedger(input.schedule, input.ledger);
  return Object.freeze({
    kind: "zoom_frame",
    zoomFrameId: `zoom-frame:${input.basis.id}:${input.vectorIndex}:${input.ledger.ledgerRef}`,
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    vectorIndex: input.vectorIndex,
    edge: vectorEdge(input.basis, input.vectorIndex),
    inputAssetRef: input.inputAsset.assetRef,
    outputAssetRef: input.outputAllocation.assetRef,
    ledgerRef: input.ledger.ledgerRef,
    scheduleRef: input.schedule.scheduleRef
  });
}

export function constructScheduledSlicePluginHandoff(input: {
  readonly manifest: OutputPluginHandoffManifest;
  readonly zoomFrame: ZoomFrame;
  readonly item: ObligationScheduleItem;
  readonly pluginRef: string;
  readonly attemptIndex: number;
}): ScheduledSliceDispatch {
  assertNonEmptyString(input.pluginRef, "ScheduledSliceDispatch.pluginRef");
  if (
    !input.manifest.allocatedOutputs.some(
      (allocation) => allocation.assetRef === input.zoomFrame.outputAssetRef
    )
  ) {
    throw new TypeError("Scheduled slice handoff manifest must include zoom output asset");
  }
  return Object.freeze({
    kind: "scheduled_slice_dispatch",
    zoomFrameId: input.zoomFrame.zoomFrameId,
    scheduleItemId: input.item.scheduleItemId,
    obligationId: input.item.obligationId,
    attemptIndex: input.attemptIndex,
    handoffRef: `${input.manifest.manifestRef}:slice:${input.item.scheduleItemId}:attempt:${input.attemptIndex}`,
    pluginRef: input.pluginRef,
    outputAssetRef: input.zoomFrame.outputAssetRef
  });
}

export function admitScheduledSliceAssessment(input: {
  readonly zoomFrame: ZoomFrame;
  readonly schedule: ObligationScheduleAsset;
  readonly assessmentId: string;
  readonly scheduleItemId: string;
  readonly obligationId: string;
  readonly attemptIndex: number;
  readonly status: ScheduledSliceAssessmentStatus;
  readonly assessmentRegime?: RuntimeRegime;
  readonly findingClass?: ScheduledSliceAssessmentFindingClass | null;
  readonly evidenceRefs: readonly string[];
  readonly outputRefs: readonly string[];
  readonly runtimeFailureClass: RuntimeFailureClass | null;
  readonly detail: string | null;
}): ScheduledSliceAssessment {
  assertNonEmptyString(input.assessmentId, "ScheduledSliceAssessment.assessmentId");
  if (input.zoomFrame.scheduleRef !== input.schedule.scheduleRef) {
    throw new TypeError("Scheduled slice assessment schedule must match zoom frame");
  }
  const item = input.schedule.items.find(
    (candidate) => candidate.scheduleItemId === input.scheduleItemId
  );
  if (item === undefined) {
    throw new TypeError("Scheduled slice assessment references unknown schedule item");
  }
  if (item.obligationId !== input.obligationId) {
    throw new TypeError("Scheduled slice assessment obligation does not match item");
  }
  if (input.status === "runtime_failed" && input.runtimeFailureClass === null) {
    throw new TypeError(
      "Scheduled slice runtime failure requires runtimeFailureClass"
    );
  }
  if (
    input.status !== "runtime_failed" &&
    input.runtimeFailureClass !== null &&
    (input.status !== "fulfilled" ||
      !isRetryableRuntimeFailureClass(input.runtimeFailureClass))
  ) {
    throw new TypeError(
      "Scheduled slice semantic assessment can carry runtimeFailureClass only for fulfilled artifact salvage"
    );
  }
  const findingClass =
    input.findingClass ?? defaultFindingClassForStatus(input.status);
  if (input.status === "runtime_failed" && findingClass !== null) {
    throw new TypeError("Runtime failure assessment must not carry findingClass");
  }
  if (input.status === "fulfilled" && findingClass !== "fulfilled") {
    throw new TypeError(
      "Fulfilled scheduled slice assessment requires fulfilled findingClass"
    );
  }
  if (input.status !== "fulfilled" && findingClass === "fulfilled") {
    throw new TypeError(
      "Non-fulfilled scheduled slice assessment must not carry fulfilled findingClass"
    );
  }
  const evidenceRefs = freezeStringArray(input.evidenceRefs);
  const outputRefs = freezeStringArray(input.outputRefs);
  assertFulfilledAssessmentEvidence(item, {
    status: input.status,
    evidenceRefs,
    outputRefs
  });
  return Object.freeze({
    kind: "scheduled_slice_assessment",
    zoomFrameId: input.zoomFrame.zoomFrameId,
    assessmentId: input.assessmentId,
    scheduleItemId: input.scheduleItemId,
    obligationId: input.obligationId,
    attemptIndex: input.attemptIndex,
    status: input.status,
    assessmentRegime:
      input.assessmentRegime ?? defaultAssessmentRegimeForStatus(input.status),
    findingClass,
    evidenceRefs,
    outputRefs,
    runtimeFailureClass: input.runtimeFailureClass,
    detail: input.detail
  });
}

export function deriveNextScheduledSlice(input: {
  readonly schedule: ObligationScheduleAsset;
  readonly assessments: readonly ScheduledSliceAssessment[];
}): ScheduledSliceDecision {
  for (const item of input.schedule.items) {
    const assessments = assessmentRefsByItem(input.assessments, item.scheduleItemId);
    const latestSemantic = latestSemanticAssessments(assessments);
    const fulfilled = latestSemantic.some(
      (assessment) =>
        assessment.status === "fulfilled" &&
        assessment.findingClass === "fulfilled"
    );
    if (!fulfilled) {
      return Object.freeze({
        kind: "dispatch_slice",
        item,
        attemptIndex: latestAttemptIndex(assessments) + 1
      } as const);
    }
  }
  return Object.freeze({ kind: "all_slices_fulfilled" } as const);
}

export function foldScheduledSlices(input: {
  readonly zoomFrame: ZoomFrame;
  readonly schedule: ObligationScheduleAsset;
  readonly assessments: readonly ScheduledSliceAssessment[];
}): ZoomFoldbackEvaluation {
  const findingClassCounts = makeFindingClassCounts();
  const fulfilledItemRefs: string[] = [];
  const openItemRefs: string[] = [];
  const blockedItemRefs: string[] = [];
  const runtimeFailureItemRefs: string[] = [];
  const missingAssessmentItemRefs: string[] = [];
  const conflictingItemRefs: string[] = [];
  const salvagedItemRefs: string[] = [];

  for (const item of input.schedule.items) {
    const assessments = assessmentRefsByItem(input.assessments, item.scheduleItemId);
    for (const assessment of assessments) {
      assertFulfilledAssessmentEvidence(item, assessment);
    }
    const currentSemanticAssessments = latestSemanticAssessments(assessments);
    const runtimeFailures = assessments.filter(
      (assessment) => assessment.status === "runtime_failed"
    );
    const latestRuntimeFailureAttempt = latestAttemptIndex(runtimeFailures);
    const latestRuntimeFailures =
      latestRuntimeFailureAttempt < 0
        ? []
        : runtimeFailures.filter(
            (assessment) => assessment.attemptIndex === latestRuntimeFailureAttempt
          );

    if (assessments.length === 0) {
      openItemRefs.push(item.scheduleItemId);
      missingAssessmentItemRefs.push(item.scheduleItemId);
      continue;
    }
    if (currentSemanticAssessments.length === 0) {
      if (
        latestRuntimeFailures.some((assessment) =>
          isRetryableRuntimeFailureClass(assessment.runtimeFailureClass)
        )
      ) {
        openItemRefs.push(item.scheduleItemId);
        runtimeFailureItemRefs.push(item.scheduleItemId);
        continue;
      }
      blockedItemRefs.push(item.scheduleItemId);
      runtimeFailureItemRefs.push(item.scheduleItemId);
      continue;
    }

    const statusKeys = new Set(
      currentSemanticAssessments.map(
        (assessment) => `${assessment.status}:${assessment.findingClass ?? "none"}`
      )
    );
    if (statusKeys.size > 1) {
      conflictingItemRefs.push(item.scheduleItemId);
      continue;
    }
    const currentSemanticAssessment = currentSemanticAssessments[0];
    if (currentSemanticAssessment === undefined) {
      openItemRefs.push(item.scheduleItemId);
      continue;
    }
    if (currentSemanticAssessment.findingClass !== null) {
      findingClassCounts[currentSemanticAssessment.findingClass] += 1;
    }
    if (
      currentSemanticAssessment.status === "fulfilled" &&
      currentSemanticAssessment.findingClass === "fulfilled"
    ) {
      fulfilledItemRefs.push(item.scheduleItemId);
      if (currentSemanticAssessment.runtimeFailureClass !== null) {
        salvagedItemRefs.push(item.scheduleItemId);
      }
      continue;
    }

    if (
      currentSemanticAssessment.findingClass === "semantic_fulfillment_gap" ||
      currentSemanticAssessment.findingClass === "traceability_reference_gap"
    ) {
      openItemRefs.push(item.scheduleItemId);
      continue;
    }

    if (currentSemanticAssessment.status === "blocked") {
      blockedItemRefs.push(item.scheduleItemId);
      continue;
    }
    openItemRefs.push(item.scheduleItemId);
  }

  const semanticFulfillmentGapCount =
    findingClassCounts.semantic_fulfillment_gap;
  const traceabilityReferenceGapCount =
    findingClassCounts.traceability_reference_gap;
  const carryConverged =
    missingAssessmentItemRefs.length === 0 && conflictingItemRefs.length === 0;
  const fulfillmentConverged =
    fulfilledItemRefs.length === input.schedule.items.length &&
    openItemRefs.length === 0 &&
    blockedItemRefs.length === 0 &&
    runtimeFailureItemRefs.length === 0 &&
    conflictingItemRefs.length === 0;
  const admitted = true;
  const targetCertificationPassed = fulfillmentConverged;
  const fdRecheckPassed = fulfillmentConverged;
  const closeAllowed =
    carryConverged &&
    fulfillmentConverged &&
    admitted &&
    targetCertificationPassed &&
    fdRecheckPassed;
  const decision: ZoomFoldbackDecision =
    closeAllowed
      ? "close"
      : conflictingItemRefs.length > 0
      ? "reprice_required"
      : blockedItemRefs.length > 0
        ? "blocked"
        : runtimeFailureItemRefs.length > 0 ||
            missingAssessmentItemRefs.length > 0 ||
            semanticFulfillmentGapCount > 0
            ? "retry_scheduled_slice"
            : "carry_loopback_pressure";

  return Object.freeze({
    kind: "zoom_foldback_evaluation",
    foldbackRef: `${input.zoomFrame.zoomFrameId}:foldback:${input.schedule.scheduleRef}`,
    zoomFrameId: input.zoomFrame.zoomFrameId,
    scheduleRef: input.schedule.scheduleRef,
    decision,
    carryConverged,
    fulfillmentConverged,
    admitted,
    targetCertificationPassed,
    fdRecheckPassed,
    retryAllowlist: Object.freeze([...RETRYABLE_RUNTIME_FAILURE_CLASSES]),
    fulfilledCount: fulfilledItemRefs.length,
    openCount: openItemRefs.length,
    blockedCount: blockedItemRefs.length,
    runtimeFailureCount: runtimeFailureItemRefs.length,
    missingAssessmentCount: missingAssessmentItemRefs.length,
    conflictingCount: conflictingItemRefs.length,
    semanticFulfillmentGapCount,
    traceabilityReferenceGapCount,
    findingClassCounts: Object.freeze({ ...findingClassCounts }),
    fulfilledItemRefs: sortedStrings(fulfilledItemRefs),
    openItemRefs: sortedStrings(openItemRefs),
    blockedItemRefs: sortedStrings(blockedItemRefs),
    runtimeFailureItemRefs: sortedStrings(runtimeFailureItemRefs),
    missingAssessmentItemRefs: sortedStrings(missingAssessmentItemRefs),
    conflictingItemRefs: sortedStrings(conflictingItemRefs),
    salvagedItemRefs: sortedStrings(salvagedItemRefs)
  });
}

export function deriveOuterTraversalEvaluation(input: {
  readonly basis: ExecutionBasis;
  readonly zoomFrame: ZoomFrame;
  readonly foldback: ZoomFoldbackEvaluation;
}): OuterTraversalEvaluation {
  const nextAction: OuterTraversalEvaluation["nextAction"] =
    input.foldback.decision === "close"
      ? "close"
      : input.foldback.decision === "retry_scheduled_slice"
        ? "retry_same_edge"
        : input.foldback.decision === "carry_loopback_pressure"
          ? "carry_loopback_pressure"
          : input.foldback.decision === "blocked"
            ? "block"
            : "reprice";
  return Object.freeze({
    kind: "outer_traversal_evaluation",
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    edge: input.zoomFrame.edge,
    foldbackRef: input.foldback.foldbackRef,
    closureAllowed: input.foldback.decision === "close",
    decision: input.foldback.decision,
    nextAction
  });
}

export function constructWorkspaceObligationLedgerAdmittedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly ledger: ObligationLedgerAsset;
}): WorkspaceObligationLedgerAdmittedEvent {
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  assertBasisOwnedRecord(input.basis, input.ledger, "Obligation ledger");
  return Object.freeze({
    kind: "workspace_obligation_ledger_admitted",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    vectorIndex: input.vectorIndex,
    edge: vectorEdge(input.basis, input.vectorIndex),
    ledgerRef: input.ledger.ledgerRef,
    workspaceAssetRef: input.ledger.workspaceAssetRef,
    authorityDigest: input.ledger.authorityDigest,
    obligationRefs: freezeStringArray(
      input.ledger.rows.map((row) => row.obligationId)
    )
  });
}

export function constructWorkspaceObligationScheduleDerivedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly schedule: ObligationScheduleAsset;
}): WorkspaceObligationScheduleDerivedEvent {
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  assertBasisOwnedRecord(input.basis, input.schedule, "Obligation schedule");
  return Object.freeze({
    kind: "workspace_obligation_schedule_derived",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    vectorIndex: input.vectorIndex,
    edge: vectorEdge(input.basis, input.vectorIndex),
    scheduleRef: input.schedule.scheduleRef,
    ledgerRef: input.schedule.ledgerRef,
    scheduleItemRefs: freezeStringArray(
      input.schedule.items.map((item) => item.scheduleItemId)
    )
  });
}

export function constructZoomFrameOpenedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly zoomFrame: ZoomFrame;
}): ZoomFrameOpenedRuntimeEvent {
  assertZoomFrameLineage(input.basis, input.zoomFrame);
  return Object.freeze({
    kind: "zoom_frame_opened",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    vectorIndex: input.zoomFrame.vectorIndex,
    edge: input.zoomFrame.edge,
    zoomFrameId: input.zoomFrame.zoomFrameId,
    inputAssetRef: input.zoomFrame.inputAssetRef,
    outputAssetRef: input.zoomFrame.outputAssetRef,
    ledgerRef: input.zoomFrame.ledgerRef,
    scheduleRef: input.zoomFrame.scheduleRef
  });
}

export function constructScheduledSliceDispatchedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly zoomFrame: ZoomFrame;
  readonly dispatch: ScheduledSliceDispatch;
}): ScheduledSliceDispatchedRuntimeEvent {
  assertZoomFrameLineage(input.basis, input.zoomFrame);
  if (input.dispatch.zoomFrameId !== input.zoomFrame.zoomFrameId) {
    throw new TypeError("Scheduled slice dispatch must match zoom frame");
  }
  return Object.freeze({
    kind: "scheduled_slice_dispatched",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    vectorIndex: input.zoomFrame.vectorIndex,
    edge: input.zoomFrame.edge,
    zoomFrameId: input.zoomFrame.zoomFrameId,
    scheduleItemId: input.dispatch.scheduleItemId,
    obligationId: input.dispatch.obligationId,
    attemptIndex: input.dispatch.attemptIndex,
    handoffRef: input.dispatch.handoffRef,
    pluginRef: input.dispatch.pluginRef,
    outputAssetRef: input.dispatch.outputAssetRef
  });
}

export function constructScheduledSliceAssessedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly zoomFrame: ZoomFrame;
  readonly assessment: ScheduledSliceAssessment;
}): ScheduledSliceAssessedRuntimeEvent {
  assertZoomFrameLineage(input.basis, input.zoomFrame);
  if (input.assessment.zoomFrameId !== input.zoomFrame.zoomFrameId) {
    throw new TypeError("Scheduled slice assessment must match zoom frame");
  }
  return Object.freeze({
    kind: "scheduled_slice_assessed",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    vectorIndex: input.zoomFrame.vectorIndex,
    edge: input.zoomFrame.edge,
    zoomFrameId: input.zoomFrame.zoomFrameId,
    assessmentId: input.assessment.assessmentId,
    scheduleItemId: input.assessment.scheduleItemId,
    obligationId: input.assessment.obligationId,
    attemptIndex: input.assessment.attemptIndex,
    status: input.assessment.status,
    assessmentRegime: input.assessment.assessmentRegime,
    findingClass: input.assessment.findingClass,
    evidenceRefs: freezeStringArray(input.assessment.evidenceRefs),
    outputRefs: freezeStringArray(input.assessment.outputRefs),
    runtimeFailureClass: input.assessment.runtimeFailureClass,
    detail: input.assessment.detail
  });
}

export function constructZoomFoldbackEvaluatedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly zoomFrame: ZoomFrame;
  readonly foldback: ZoomFoldbackEvaluation;
}): ZoomFoldbackEvaluatedRuntimeEvent {
  assertZoomFrameLineage(input.basis, input.zoomFrame);
  if (
    input.foldback.zoomFrameId !== input.zoomFrame.zoomFrameId ||
    input.foldback.scheduleRef !== input.zoomFrame.scheduleRef
  ) {
    throw new TypeError("Zoom foldback must match zoom frame lineage");
  }
  return Object.freeze({
    kind: "zoom_foldback_evaluated",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    vectorIndex: input.zoomFrame.vectorIndex,
    edge: input.zoomFrame.edge,
    zoomFrameId: input.zoomFrame.zoomFrameId,
    foldbackRef: input.foldback.foldbackRef,
    decision: input.foldback.decision,
    fulfilledCount: input.foldback.fulfilledCount,
    openCount: input.foldback.openCount,
    blockedCount: input.foldback.blockedCount,
    runtimeFailureCount: input.foldback.runtimeFailureCount,
    missingAssessmentCount: input.foldback.missingAssessmentCount,
    conflictingCount: input.foldback.conflictingCount
  });
}

export function deriveWorkspaceZoomProjection(input: {
  readonly basis: ExecutionBasis;
  readonly events: readonly RuntimeEvent[];
  readonly zoomFrame?: ZoomFrame;
  readonly schedule?: ObligationScheduleAsset;
}): WorkspaceZoomProjection {
  const ledgerRefs = new Set<string>();
  const scheduleRefs = new Set<string>();
  const zoomFrameIds = new Set<string>();
  const dispatchedSliceRefs = new Set<string>();
  const assessedSliceRefs = new Set<string>();
  const foldbackRefs = new Set<string>();
  const foldbackEvents: ZoomFoldbackEvaluatedRuntimeEvent[] = [];

  for (const event of input.events) {
    assertBasisEvent(input.basis, event);
    if (event.kind === "workspace_obligation_ledger_admitted") {
      assertVectorIndexInRange(input.basis, event.vectorIndex);
      ledgerRefs.add(event.ledgerRef);
    }
    if (event.kind === "workspace_obligation_schedule_derived") {
      assertVectorIndexInRange(input.basis, event.vectorIndex);
      scheduleRefs.add(event.scheduleRef);
    }
    if (event.kind === "zoom_frame_opened") {
      assertVectorIndexInRange(input.basis, event.vectorIndex);
      zoomFrameIds.add(event.zoomFrameId);
      ledgerRefs.add(event.ledgerRef);
      scheduleRefs.add(event.scheduleRef);
    }
    if (event.kind === "scheduled_slice_dispatched") {
      assertVectorIndexInRange(input.basis, event.vectorIndex);
      zoomFrameIds.add(event.zoomFrameId);
      dispatchedSliceRefs.add(
        `${event.zoomFrameId}:${event.scheduleItemId}:${event.attemptIndex}`
      );
    }
    if (event.kind === "scheduled_slice_assessed") {
      assertVectorIndexInRange(input.basis, event.vectorIndex);
      zoomFrameIds.add(event.zoomFrameId);
      assessedSliceRefs.add(event.assessmentId);
    }
    if (event.kind === "zoom_foldback_evaluated") {
      assertVectorIndexInRange(input.basis, event.vectorIndex);
      zoomFrameIds.add(event.zoomFrameId);
      foldbackRefs.add(event.foldbackRef);
      foldbackEvents.push(event);
    }
  }

  const projection = {
    kind: "workspace_zoom_projection",
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    ledgerRefs: sortedStrings(ledgerRefs),
    scheduleRefs: sortedStrings(scheduleRefs),
    zoomFrameIds: sortedStrings(zoomFrameIds),
    dispatchedSliceRefs: sortedStrings(dispatchedSliceRefs),
    assessedSliceRefs: sortedStrings(assessedSliceRefs),
    foldbackRefs: sortedStrings(foldbackRefs)
  } as const;
  if (input.zoomFrame === undefined && input.schedule === undefined) {
    return Object.freeze(projection);
  }
  if (input.zoomFrame === undefined || input.schedule === undefined) {
    throw new TypeError(
      "Workspace zoom projection requires zoomFrame and schedule together for foldback replay"
    );
  }
  const foldbackEvaluation = deriveZoomFoldbackEvaluationFromEvents({
    basis: input.basis,
    zoomFrame: input.zoomFrame,
    schedule: input.schedule,
    events: input.events
  });
  for (const event of foldbackEvents.filter(
    (candidate) => candidate.zoomFrameId === input.zoomFrame?.zoomFrameId
  )) {
    assertFoldbackEventMatchesProjection(event, foldbackEvaluation);
  }
  return Object.freeze({
    ...projection,
    foldbackEvaluation
  });
}

export function deriveScheduledSliceAssessmentsFromEvents(input: {
  readonly basis: ExecutionBasis;
  readonly zoomFrame: ZoomFrame;
  readonly schedule: ObligationScheduleAsset;
  readonly events: readonly RuntimeEvent[];
}): readonly ScheduledSliceAssessment[] {
  assertZoomFrameLineage(input.basis, input.zoomFrame);
  if (input.zoomFrame.scheduleRef !== input.schedule.scheduleRef) {
    throw new TypeError("Replay schedule must match zoom frame");
  }
  const assessments: ScheduledSliceAssessment[] = [];
  for (const event of input.events) {
    assertBasisEvent(input.basis, event);
    if (event.kind !== "scheduled_slice_assessed") {
      continue;
    }
    assertVectorIndexInRange(input.basis, event.vectorIndex);
    if (event.zoomFrameId !== input.zoomFrame.zoomFrameId) {
      continue;
    }
    assessments.push(
      admitScheduledSliceAssessment({
        zoomFrame: input.zoomFrame,
        schedule: input.schedule,
        assessmentId: event.assessmentId,
        scheduleItemId: event.scheduleItemId,
        obligationId: event.obligationId,
        attemptIndex: event.attemptIndex,
        status: event.status,
        assessmentRegime: event.assessmentRegime,
        findingClass: event.findingClass,
        evidenceRefs: event.evidenceRefs,
        outputRefs: event.outputRefs,
        runtimeFailureClass: event.runtimeFailureClass,
        detail: event.detail
      })
    );
  }
  return Object.freeze(
    assessments.sort((left, right) => left.assessmentId.localeCompare(right.assessmentId))
  );
}

export function deriveZoomFoldbackEvaluationFromEvents(input: {
  readonly basis: ExecutionBasis;
  readonly zoomFrame: ZoomFrame;
  readonly schedule: ObligationScheduleAsset;
  readonly events: readonly RuntimeEvent[];
}): ZoomFoldbackEvaluation {
  return foldScheduledSlices({
    zoomFrame: input.zoomFrame,
    schedule: input.schedule,
    assessments: deriveScheduledSliceAssessmentsFromEvents(input)
  });
}
