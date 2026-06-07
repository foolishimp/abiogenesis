// Implements: REQ-R-ABG3-ITERATION
// Implements: REQ-R-ABG3-PROJECTION

import type {
  GtlEvaluationScopeRef
} from "../../../gtl/m02/contracts/compute_notation.js";
import type {
  AdvancementTransition,
  ExecutionBasis,
  FdAdvanceTransition,
  FhEscalationTransition,
  FpDispatchTransition,
  GraphChangeClass,
  GraphReentryPoint,
  IterationAdvanceDecision,
  RuntimeAggregateProjection,
  RuntimeEvent,
  TerminalTransition
} from "./carriers.js";
import {
  constructFrameOpenedEvent,
  constructGraphCallOpenedEvent,
  constructTerminalReachedEvent,
  constructVectorTraversalPlannedEvent
} from "./event_factories.js";
import { deriveRuntimeAggregateProjection } from "./projection.js";
import { deriveEffectiveVectorRegime } from "./regime_resolution.js";
import {
  assertProjectionBasis,
  assertVectorIndexInRange,
  frameIdForBasis,
  graphCallIdForBasis,
  vectorEdge
} from "./runtime_support.js";

export const ITERATION_EVIDENCE_LIFECYCLE_VALUES = Object.freeze([
  "active",
  "preserved_rebased",
  "superseded"
] as const);

export type IterationEvidenceLifecycle =
  (typeof ITERATION_EVIDENCE_LIFECYCLE_VALUES)[number];

export const ITERATION_SATISFACTION_STATUS_VALUES = Object.freeze([
  "satisfied",
  "unsatisfied",
  "deferred"
] as const);

export type IterationSatisfactionStatus =
  (typeof ITERATION_SATISFACTION_STATUS_VALUES)[number];

export const ITERATION_REASON_VALUES = Object.freeze([
  "missing_evidence",
  "partial_evidence",
  "stale_input",
  "missing_authority",
  "contradiction",
  "runtime_failure",
  "evaluator_failure",
  "retry_exhausted",
  "orphan_current_binding",
  "unsupported_state",
  "terminal_retry_fallback"
] as const);

export type IterationReason = (typeof ITERATION_REASON_VALUES)[number];

export const ITERATION_RUNTIME_BOUNDARY_VALUES = Object.freeze([
  "worker",
  "evaluator",
  "transport",
  "liveness"
] as const);

export type IterationRuntimeBoundary =
  (typeof ITERATION_RUNTIME_BOUNDARY_VALUES)[number];

export const ITERATION_RUNTIME_STATUS_VALUES = Object.freeze([
  "progressing",
  "awaiting_observer",
  "handoff",
  "failed"
] as const);

export type IterationRuntimeStatus =
  (typeof ITERATION_RUNTIME_STATUS_VALUES)[number];

export const ITERATION_TERMINATE_DISPOSITION_VALUES = Object.freeze([
  "converged",
  "blocked",
  "deferred"
] as const);

export type IterationTerminateDisposition =
  (typeof ITERATION_TERMINATE_DISPOSITION_VALUES)[number];

export const ITERATION_SUSPEND_REASON_VALUES = Object.freeze([
  "progressing",
  "awaiting_observer",
  "handoff"
] as const);

export type IterationSuspendReason =
  (typeof ITERATION_SUSPEND_REASON_VALUES)[number];

export interface IterationSatisfactionRow {
  readonly authorityRef: string;
  readonly status: IterationSatisfactionStatus;
  readonly reason: IterationReason | null;
  readonly lifecycle: IterationEvidenceLifecycle;
  readonly evidenceRefs: readonly string[];
  readonly sourceProjectionRefs?: readonly string[] | undefined;
  readonly reEntryPoint?: GraphReentryPoint | null | undefined;
  readonly evaluationScopeRef?: GtlEvaluationScopeRef | null | undefined;
}

export interface IterationRuntimeRow {
  readonly boundary: IterationRuntimeBoundary;
  readonly status: IterationRuntimeStatus;
  readonly reason: IterationReason | null;
  readonly retryable: boolean;
  readonly evidenceRefs?: readonly string[] | undefined;
  readonly sourceProjectionRefs?: readonly string[] | undefined;
  readonly evaluationScopeRef?: GtlEvaluationScopeRef | null | undefined;
}

export interface IterationBindingGuardRow {
  readonly status: "current_binding" | "orphan";
  readonly authorityRef: string | null;
  readonly evidenceRef: string | null;
  readonly failedCondition: string | null;
  readonly eventRefs?: readonly string[] | undefined;
  readonly sourceProjectionRefs?: readonly string[] | undefined;
  readonly evaluationScopeRef?: GtlEvaluationScopeRef | null | undefined;
}

export interface IterationRedispatchTarget {
  readonly reEntryPoint: GraphReentryPoint;
  readonly targetVectorIndex: number | null;
  readonly evaluationScopeRef?: GtlEvaluationScopeRef | null | undefined;
}

export interface IterationRedispatchTargetRow {
  readonly target: IterationRedispatchTarget;
  readonly reason: IterationReason;
  readonly retryable: boolean;
  readonly provenanceChangeClass: GraphChangeClass | null;
  readonly evidenceRefs?: readonly string[] | undefined;
  readonly sourceProjectionRefs?: readonly string[] | undefined;
}

export type IterationOutcome =
  | {
      readonly kind: "terminate";
      readonly disposition: IterationTerminateDisposition;
      readonly reason: IterationReason | null;
      readonly reEntryPoint: GraphReentryPoint | null;
    }
  | {
      readonly kind: "redispatch";
      readonly target: IterationRedispatchTarget;
      readonly reason: IterationReason;
      readonly provenanceChangeClass: GraphChangeClass | null;
    }
  | {
      readonly kind: "suspend";
      readonly reason: IterationSuspendReason;
    };

export interface IterationRowProjection {
  readonly kind: "iteration_row_projection";
  readonly projectionRef: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly satisfactionRows: readonly IterationSatisfactionRow[];
  readonly runtimeRows: readonly IterationRuntimeRow[];
  readonly bindingGuardRows: readonly IterationBindingGuardRow[];
  readonly redispatchTargetRows: readonly IterationRedispatchTargetRow[];
  readonly terminalFallbackRefs: readonly string[];
  readonly sourceProjectionRefs: readonly string[];
}

export interface IterationOutcomeProjection {
  readonly kind: "iteration_outcome_projection";
  readonly projectionRef: string;
  readonly rowProjectionRef: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly outcome: IterationOutcome;
  readonly reasonRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly sourceProjectionRefs: readonly string[];
  readonly satisfactionRows: readonly IterationSatisfactionRow[];
  readonly runtimeRows: readonly IterationRuntimeRow[];
  readonly bindingGuardRows: readonly IterationBindingGuardRow[];
}

export interface IterationOutcomeProjectionInput {
  readonly basis: ExecutionBasis;
  readonly runtimeProjection: RuntimeAggregateProjection;
  readonly vectorIndex: number;
  readonly satisfactionRows?: readonly IterationSatisfactionRow[] | undefined;
  readonly runtimeRows?: readonly IterationRuntimeRow[] | undefined;
  readonly bindingGuardRows?: readonly IterationBindingGuardRow[] | undefined;
  readonly redispatchTargetRows?:
    | readonly IterationRedispatchTargetRow[]
    | undefined;
  readonly terminalFallbackRefs?: readonly string[] | undefined;
  readonly sourceProjectionRefs?: readonly string[] | undefined;
}

export interface IterationOutcomeFoldInput {
  readonly basis?: ExecutionBasis | undefined;
  readonly runtimeProjection?: RuntimeAggregateProjection | undefined;
  readonly vectorIndex: number;
  readonly satisfactionRows?: readonly IterationSatisfactionRow[] | undefined;
  readonly runtimeRows?: readonly IterationRuntimeRow[] | undefined;
  readonly bindingGuardRows?: readonly IterationBindingGuardRow[] | undefined;
  readonly redispatchTargetRows?:
    | readonly IterationRedispatchTargetRow[]
    | undefined;
  readonly terminalFallbackRefs?: readonly string[] | undefined;
  readonly sourceProjectionRefs?: readonly string[] | undefined;
}

function uniqueStrings(values: readonly (string | null | undefined)[]): readonly string[] {
  return Object.freeze(
    [
      ...new Set(
        values.filter(
          (value): value is string =>
            value !== null && value !== undefined && value.length > 0
        )
      )
    ]
  );
}

function sourceProjectionRefForRuntime(
  projection: RuntimeAggregateProjection
): string {
  return `runtime-projection:${JSON.stringify({
    basisId: projection.basisId,
    graphFunctionId: projection.graphFunctionId,
    graphCallId: projection.graphCallId,
    frameId: projection.frameId,
    nextVectorIndex: projection.nextVectorIndex
  })}`;
}

function rowProjectionRef(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly reasonRefs: readonly string[];
}): string {
  return `iteration-row-projection:${JSON.stringify({
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    vectorIndex: input.vectorIndex,
    reasonRefs: input.reasonRefs
  })}`;
}

function outcomeProjectionRef(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly outcome: IterationOutcome;
  readonly reasonRefs: readonly string[];
}): string {
  return `iteration-outcome-projection:${JSON.stringify({
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    vectorIndex: input.vectorIndex,
    outcome: input.outcome,
    reasonRefs: input.reasonRefs
  })}`;
}

function refsFromSatisfactionRows(
  rows: readonly IterationSatisfactionRow[]
): readonly string[] {
  return uniqueStrings(
    rows.flatMap((row) => [
      row.authorityRef,
      row.reason,
      row.evaluationScopeRef?.scopeRef,
      ...row.evidenceRefs,
      ...(row.sourceProjectionRefs ?? Object.freeze([]))
    ])
  );
}

function refsFromRuntimeRows(rows: readonly IterationRuntimeRow[]): readonly string[] {
  return uniqueStrings(
    rows.flatMap((row) => [
      row.reason,
      row.evaluationScopeRef?.scopeRef,
      ...(row.evidenceRefs ?? Object.freeze([])),
      ...(row.sourceProjectionRefs ?? Object.freeze([]))
    ])
  );
}

function refsFromBindingRows(
  rows: readonly IterationBindingGuardRow[]
): readonly string[] {
  return uniqueStrings(
    rows.flatMap((row) => [
      row.authorityRef,
      row.evidenceRef,
      row.failedCondition,
      row.evaluationScopeRef?.scopeRef,
      ...(row.eventRefs ?? Object.freeze([])),
      ...(row.sourceProjectionRefs ?? Object.freeze([]))
    ])
  );
}

function refsFromRedispatchRows(
  rows: readonly IterationRedispatchTargetRow[]
): readonly string[] {
  return uniqueStrings(
    rows.flatMap((row) => [
      row.reason,
      row.target.reEntryPoint,
      row.target.targetVectorIndex === null
        ? null
        : String(row.target.targetVectorIndex),
      row.target.evaluationScopeRef?.scopeRef,
      row.provenanceChangeClass,
      ...(row.evidenceRefs ?? Object.freeze([])),
      ...(row.sourceProjectionRefs ?? Object.freeze([]))
    ])
  );
}

function assertTargetVector(input: {
  readonly basis: ExecutionBasis;
  readonly graphCallRef: string;
  readonly frameRef: string;
  readonly target: IterationRedispatchTarget;
}): void {
  if (input.target.targetVectorIndex === null) {
    if (input.target.evaluationScopeRef !== null && input.target.evaluationScopeRef !== undefined) {
      throw new TypeError(
        "IterationRedispatchTarget.evaluationScopeRef requires targetVectorIndex"
      );
    }
    return;
  }
  assertVectorIndexInRange(input.basis, input.target.targetVectorIndex);
  assertEvaluationScopeRef({
    basis: input.basis,
    graphCallRef: input.graphCallRef,
    frameRef: input.frameRef,
    vectorIndex: input.target.targetVectorIndex,
    evaluationScopeRef: input.target.evaluationScopeRef
  });
}

function assertEvaluationScopeRef(input: {
  readonly basis: ExecutionBasis;
  readonly graphCallRef: string;
  readonly frameRef: string;
  readonly vectorIndex: number;
  readonly evaluationScopeRef?: GtlEvaluationScopeRef | null | undefined;
}): void {
  const scope = input.evaluationScopeRef;
  if (scope === undefined || scope === null) {
    return;
  }
  assertVectorIndexInRange(input.basis, scope.vectorIndex);
  if (scope.graphCallRef !== input.graphCallRef) {
    throw new TypeError(
      "GtlEvaluationScopeRef.graphCallRef does not match iteration graph call"
    );
  }
  if (scope.frameRef !== input.frameRef) {
    throw new TypeError(
      "GtlEvaluationScopeRef.frameRef does not match iteration frame"
    );
  }
  if (scope.graphFunctionRef !== input.basis.graphFunction.id) {
    throw new TypeError(
      "GtlEvaluationScopeRef.graphFunctionRef does not match iteration graph function"
    );
  }
  if (scope.vectorIndex !== input.vectorIndex) {
    throw new TypeError(
      "GtlEvaluationScopeRef.vectorIndex does not match iteration vector"
    );
  }
  if (scope.graphVectorRef !== vectorEdge(input.basis, input.vectorIndex)) {
    throw new TypeError(
      "GtlEvaluationScopeRef.graphVectorRef does not match iteration edge"
    );
  }
}

export function iterationReasonToReEntryPoint(input: {
  readonly reason: IterationReason;
  readonly preferred?: GraphReentryPoint | null | undefined;
}): GraphReentryPoint | null {
  if (input.preferred !== undefined && input.preferred !== null) {
    return input.preferred;
  }
  switch (input.reason) {
    case "missing_authority":
      return "requirements";
    case "contradiction":
      return "requirements";
    case "missing_evidence":
    case "partial_evidence":
    case "stale_input":
    case "terminal_retry_fallback":
      return "realization";
    case "evaluator_failure":
      return "proof";
    case "runtime_failure":
    case "retry_exhausted":
    case "orphan_current_binding":
    case "unsupported_state":
      return null;
    default: {
      const exhaustive: never = input.reason;
      throw new TypeError(`Unsupported iteration reason ${JSON.stringify(exhaustive)}`);
    }
  }
}

export function deriveIterationRowProjection(
  input: IterationOutcomeProjectionInput
): IterationRowProjection {
  assertProjectionBasis(input.basis, input.runtimeProjection, "IterationRowProjection");
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  const graphCallRef =
    input.runtimeProjection.graphCallId ?? graphCallIdForBasis(input.basis);
  const frameRef = input.runtimeProjection.frameId ?? frameIdForBasis(input.basis);
  for (const row of input.satisfactionRows ?? Object.freeze([])) {
    assertEvaluationScopeRef({
      basis: input.basis,
      graphCallRef,
      frameRef,
      vectorIndex: input.vectorIndex,
      evaluationScopeRef: row.evaluationScopeRef
    });
  }
  for (const row of input.runtimeRows ?? Object.freeze([])) {
    assertEvaluationScopeRef({
      basis: input.basis,
      graphCallRef,
      frameRef,
      vectorIndex: input.vectorIndex,
      evaluationScopeRef: row.evaluationScopeRef
    });
  }
  for (const row of input.bindingGuardRows ?? Object.freeze([])) {
    assertEvaluationScopeRef({
      basis: input.basis,
      graphCallRef,
      frameRef,
      vectorIndex: input.vectorIndex,
      evaluationScopeRef: row.evaluationScopeRef
    });
  }
  for (const row of input.redispatchTargetRows ?? Object.freeze([])) {
    assertTargetVector({ basis: input.basis, graphCallRef, frameRef, target: row.target });
  }
  const satisfactionRows = Object.freeze([
    ...(input.satisfactionRows ?? Object.freeze([]))
  ]);
  const runtimeRows = Object.freeze([...(input.runtimeRows ?? Object.freeze([]))]);
  const bindingGuardRows = Object.freeze([
    ...(input.bindingGuardRows ?? Object.freeze([]))
  ]);
  const redispatchTargetRows = Object.freeze([
    ...(input.redispatchTargetRows ?? Object.freeze([]))
  ]);
  const terminalFallbackRefs = uniqueStrings(
    input.terminalFallbackRefs ?? Object.freeze([])
  );
  const sourceProjectionRefs = uniqueStrings([
    sourceProjectionRefForRuntime(input.runtimeProjection),
    ...(input.sourceProjectionRefs ?? Object.freeze([])),
    ...refsFromSatisfactionRows(satisfactionRows),
    ...refsFromRuntimeRows(runtimeRows),
    ...refsFromBindingRows(bindingGuardRows),
    ...refsFromRedispatchRows(redispatchTargetRows),
    ...terminalFallbackRefs
  ]);
  const edge = vectorEdge(input.basis, input.vectorIndex);
  return Object.freeze({
    kind: "iteration_row_projection" as const,
    projectionRef: rowProjectionRef({
      basis: input.basis,
      vectorIndex: input.vectorIndex,
      reasonRefs: sourceProjectionRefs
    }),
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    graphCallId: graphCallRef,
    frameId: frameRef,
    vectorIndex: input.vectorIndex,
    edge,
    satisfactionRows,
    runtimeRows,
    bindingGuardRows,
    redispatchTargetRows,
    terminalFallbackRefs,
    sourceProjectionRefs
  } satisfies IterationRowProjection);
}

function terminate(
  disposition: IterationTerminateDisposition,
  reason: IterationReason | null,
  reEntryPoint: GraphReentryPoint | null
): IterationOutcome {
  return Object.freeze({
    kind: "terminate" as const,
    disposition,
    reason,
    reEntryPoint
  });
}

function redispatch(
  target: IterationRedispatchTarget,
  reason: IterationReason,
  provenanceChangeClass: GraphChangeClass | null
): IterationOutcome {
  return Object.freeze({
    kind: "redispatch" as const,
    target,
    reason,
    provenanceChangeClass
  });
}

function suspend(reason: IterationSuspendReason): IterationOutcome {
  return Object.freeze({ kind: "suspend" as const, reason });
}

function currentSatisfactionRows(
  rows: readonly IterationSatisfactionRow[]
): readonly IterationSatisfactionRow[] {
  return Object.freeze(rows.filter((row) => row.lifecycle !== "superseded"));
}

function firstUnsatisfiedByReason(
  rows: readonly IterationSatisfactionRow[],
  reasons: readonly IterationReason[]
): IterationSatisfactionRow | null {
  return (
    rows.find(
      (row) =>
        row.status === "unsatisfied" &&
        row.reason !== null &&
        reasons.includes(row.reason)
    ) ?? null
  );
}

function firstRuntimeFailure(
  rows: readonly IterationRuntimeRow[]
): IterationRuntimeRow | null {
  return rows.find((row) => row.status === "failed") ?? null;
}

function firstRuntimeStatus(
  rows: readonly IterationRuntimeRow[],
  status: IterationRuntimeStatus
): IterationRuntimeRow | null {
  return rows.find((row) => row.status === status) ?? null;
}

function currentVectorTarget(input: {
  readonly reEntryPoint: GraphReentryPoint;
  readonly vectorIndex: number;
  readonly evaluationScopeRef?: GtlEvaluationScopeRef | null | undefined;
}): IterationRedispatchTarget {
  const target: IterationRedispatchTarget = {
    reEntryPoint: input.reEntryPoint,
    targetVectorIndex: input.vectorIndex
  };
  if (input.evaluationScopeRef !== undefined && input.evaluationScopeRef !== null) {
    return Object.freeze({
      ...target,
      evaluationScopeRef: input.evaluationScopeRef
    });
  }
  return Object.freeze(target);
}

function hasEvaluationScopeRef(
  rows: readonly (
    | IterationSatisfactionRow
    | IterationRuntimeRow
    | IterationBindingGuardRow
  )[]
): boolean {
  return rows.some(
    (row) => row.evaluationScopeRef !== undefined && row.evaluationScopeRef !== null
  );
}

function assertFoldInputHasProjectionForScopedRows(input: {
  readonly satisfactionRows: readonly IterationSatisfactionRow[];
  readonly runtimeRows: readonly IterationRuntimeRow[];
  readonly bindingGuardRows: readonly IterationBindingGuardRow[];
  readonly redispatchTargetRows: readonly IterationRedispatchTargetRow[];
}): void {
  if (
    hasEvaluationScopeRef(input.satisfactionRows) ||
    hasEvaluationScopeRef(input.runtimeRows) ||
    hasEvaluationScopeRef(input.bindingGuardRows) ||
    input.redispatchTargetRows.some(
      (row) =>
        row.target.evaluationScopeRef !== undefined &&
        row.target.evaluationScopeRef !== null
    )
  ) {
    throw new TypeError(
      "deriveIterationOutcomeFromRows with evaluationScopeRef requires basis and runtimeProjection"
    );
  }
}

function deriveOutcomeFromRows(input: {
  readonly rowProjection: Pick<
    IterationRowProjection,
    | "vectorIndex"
    | "satisfactionRows"
    | "runtimeRows"
    | "bindingGuardRows"
    | "redispatchTargetRows"
    | "terminalFallbackRefs"
  >;
}): IterationOutcome {
  const rows = currentSatisfactionRows(input.rowProjection.satisfactionRows);
  const orphan = input.rowProjection.bindingGuardRows.find(
    (row) => row.status === "orphan"
  );
  if (orphan !== undefined) {
    return terminate("blocked", "orphan_current_binding", null);
  }

  const runtimeFailure = firstRuntimeFailure(input.rowProjection.runtimeRows);
  if (
    runtimeFailure !== null &&
    (!runtimeFailure.retryable || runtimeFailure.reason === "retry_exhausted")
  ) {
    return terminate(
      "blocked",
      runtimeFailure.reason ?? "runtime_failure",
      null
    );
  }

  const unsupported = firstUnsatisfiedByReason(rows, ["unsupported_state"]);
  if (unsupported !== null) {
    return terminate("blocked", "unsupported_state", null);
  }

  const missingAuthority = firstUnsatisfiedByReason(rows, ["missing_authority"]);
  if (missingAuthority !== null) {
    return terminate(
      "blocked",
      "missing_authority",
      iterationReasonToReEntryPoint({
        reason: "missing_authority",
        preferred: missingAuthority.reEntryPoint
      })
    );
  }

  const contradiction = firstUnsatisfiedByReason(rows, ["contradiction"]);
  if (contradiction !== null) {
    return terminate(
      "blocked",
      "contradiction",
      iterationReasonToReEntryPoint({
        reason: "contradiction",
        preferred: contradiction.reEntryPoint
      })
    );
  }

  if (firstRuntimeStatus(input.rowProjection.runtimeRows, "progressing") !== null) {
    return suspend("progressing");
  }
  if (
    firstRuntimeStatus(input.rowProjection.runtimeRows, "awaiting_observer") !==
    null
  ) {
    return suspend("awaiting_observer");
  }
  if (firstRuntimeStatus(input.rowProjection.runtimeRows, "handoff") !== null) {
    return suspend("handoff");
  }

  const redispatchTarget = input.rowProjection.redispatchTargetRows.find(
    (row) => row.retryable
  );
  if (redispatchTarget !== undefined) {
    return redispatch(
      redispatchTarget.target,
      redispatchTarget.reason,
      redispatchTarget.provenanceChangeClass
    );
  }

  if (runtimeFailure !== null && runtimeFailure.retryable) {
    return redispatch(
      currentVectorTarget({
        reEntryPoint:
          runtimeFailure.boundary === "evaluator" ? "proof" : "realization",
        vectorIndex: input.rowProjection.vectorIndex,
        evaluationScopeRef: runtimeFailure.evaluationScopeRef
      }),
      runtimeFailure.reason ?? "runtime_failure",
      "realization_refactor"
    );
  }

  const evidenceGap = firstUnsatisfiedByReason(rows, [
    "missing_evidence",
    "partial_evidence",
    "stale_input"
  ]);
  if (evidenceGap !== null && evidenceGap.reason !== null) {
    return redispatch(
      currentVectorTarget({
        reEntryPoint: iterationReasonToReEntryPoint({
          reason: evidenceGap.reason,
          preferred: evidenceGap.reEntryPoint
        }) ?? "realization",
        vectorIndex: input.rowProjection.vectorIndex,
        evaluationScopeRef: evidenceGap.evaluationScopeRef
      }),
      evidenceGap.reason,
      "realization_refactor"
    );
  }

  if (
    rows.length > 0 &&
    rows.every((row) => row.status === "satisfied" || row.status === "deferred") &&
    rows.some((row) => row.status === "deferred")
  ) {
    return terminate("deferred", null, null);
  }

  if (rows.length > 0 && rows.every((row) => row.status === "satisfied")) {
    return terminate("converged", null, null);
  }

  if (input.rowProjection.terminalFallbackRefs.length > 0) {
    return redispatch(
      currentVectorTarget({
        reEntryPoint: "realization",
        vectorIndex: input.rowProjection.vectorIndex
      }),
      "terminal_retry_fallback",
      "realization_refactor"
    );
  }

  return terminate("blocked", "unsupported_state", null);
}

export function deriveIterationOutcomeProjection(
  input: IterationOutcomeProjectionInput
): IterationOutcomeProjection {
  const rowProjection = deriveIterationRowProjection(input);
  const outcome = deriveOutcomeFromRows({ rowProjection });
  const reasonRefs = uniqueStrings([
    outcome.kind === "terminate" ? outcome.reason : outcome.reason,
    ...rowProjection.sourceProjectionRefs
  ]);
  const evidenceRefs = uniqueStrings([
    ...rowProjection.satisfactionRows.flatMap((row) => row.evidenceRefs),
    ...rowProjection.runtimeRows.flatMap(
      (row) => row.evidenceRefs ?? Object.freeze([])
    ),
    ...rowProjection.bindingGuardRows.flatMap((row) => [
      row.evidenceRef,
      ...(row.eventRefs ?? Object.freeze([]))
    ])
  ]);
  return Object.freeze({
    kind: "iteration_outcome_projection" as const,
    projectionRef: outcomeProjectionRef({
      basis: input.basis,
      vectorIndex: input.vectorIndex,
      outcome,
      reasonRefs
    }),
    rowProjectionRef: rowProjection.projectionRef,
    basisId: rowProjection.basisId,
    graphFunctionId: rowProjection.graphFunctionId,
    runId: rowProjection.runId,
    workKey: rowProjection.workKey,
    graphCallId: rowProjection.graphCallId,
    frameId: rowProjection.frameId,
    vectorIndex: rowProjection.vectorIndex,
    edge: rowProjection.edge,
    outcome,
    reasonRefs,
    evidenceRefs,
    sourceProjectionRefs: rowProjection.sourceProjectionRefs,
    satisfactionRows: rowProjection.satisfactionRows,
    runtimeRows: rowProjection.runtimeRows,
    bindingGuardRows: rowProjection.bindingGuardRows
  } satisfies IterationOutcomeProjection);
}

export function deriveIterationOutcomeFromRows(
  input: IterationOutcomeFoldInput
): IterationOutcome {
  if (
    (input.basis === undefined) !==
    (input.runtimeProjection === undefined)
  ) {
    throw new TypeError(
      "deriveIterationOutcomeFromRows requires basis and runtimeProjection together"
    );
  }
  if (input.basis !== undefined && input.runtimeProjection !== undefined) {
    return deriveOutcomeFromRows({
      rowProjection: deriveIterationRowProjection({
        basis: input.basis,
        runtimeProjection: input.runtimeProjection,
        vectorIndex: input.vectorIndex,
        satisfactionRows: input.satisfactionRows,
        runtimeRows: input.runtimeRows,
        bindingGuardRows: input.bindingGuardRows,
        redispatchTargetRows: input.redispatchTargetRows,
        terminalFallbackRefs: input.terminalFallbackRefs,
        sourceProjectionRefs: input.sourceProjectionRefs
      })
    });
  }
  const satisfactionRows = Object.freeze([
    ...(input.satisfactionRows ?? Object.freeze([]))
  ]);
  const runtimeRows = Object.freeze([...(input.runtimeRows ?? Object.freeze([]))]);
  const bindingGuardRows = Object.freeze([
    ...(input.bindingGuardRows ?? Object.freeze([]))
  ]);
  const redispatchTargetRows = Object.freeze([
    ...(input.redispatchTargetRows ?? Object.freeze([]))
  ]);
  assertFoldInputHasProjectionForScopedRows({
    satisfactionRows,
    runtimeRows,
    bindingGuardRows,
    redispatchTargetRows
  });
  return deriveOutcomeFromRows({
    rowProjection: {
      vectorIndex: input.vectorIndex,
      satisfactionRows,
      runtimeRows,
      bindingGuardRows,
      redispatchTargetRows,
      terminalFallbackRefs: uniqueStrings(
        input.terminalFallbackRefs ?? Object.freeze([])
      )
    }
  });
}

export function deriveIterationAdvanceDecision(
  basis: ExecutionBasis,
  projection: RuntimeAggregateProjection
): IterationAdvanceDecision {
  if (projection.basisId !== basis.id) {
    throw new TypeError("IterationAdvanceDecision requires matching basis projection");
  }
  if (basis.graph.vectors.length === 0) {
    return Object.freeze({
      kind: "converged",
      basis,
      terminalKind: "nothing_to_do",
      reason: "materialized graph has no vectors"
    });
  }
  if (projection.nextVectorIndex === null) {
    return Object.freeze({
      kind: "converged",
      basis,
      terminalKind: "converged",
      reason: "all graph-function vectors are closed by replay"
    });
  }
  const effectiveRegime = deriveEffectiveVectorRegime({
    basis,
    vectorIndex: projection.nextVectorIndex
  });
  return Object.freeze({
    kind: "advance_vector",
    basis,
    vectorIndex: projection.nextVectorIndex,
    edge: vectorEdge(basis, projection.nextVectorIndex),
    regime: effectiveRegime.regime,
    effectiveRegime
  });
}

export function deriveAdvancementTransition(
  basis: ExecutionBasis,
  events: readonly RuntimeEvent[] = Object.freeze([])
): AdvancementTransition {
  const projection = deriveRuntimeAggregateProjection(basis, events);
  const decision = deriveIterationAdvanceDecision(basis, projection);

  if (decision.kind === "converged") {
    return Object.freeze({
      kind: "terminal",
      basis,
      terminalKind: decision.terminalKind,
      reason: decision.reason
    } satisfies TerminalTransition);
  }

  switch (decision.regime) {
    case "F_D":
      return Object.freeze({
        kind: "fd_advance",
        basis,
        vectorIndex: decision.vectorIndex,
        edge: decision.edge,
        effectiveRegime: decision.effectiveRegime,
        status: "ready"
      } satisfies FdAdvanceTransition);
    case "F_P": {
      const dispatchRef = basis.resolvedPolicy.dispatchRef;
      if (dispatchRef === null) {
        throw new TypeError(
          `ExecutionBasis(${JSON.stringify(basis.id)}) requires dispatchRef for F_P`
        );
      }
      return Object.freeze({
        kind: "fp_dispatch",
        basis,
        vectorIndex: decision.vectorIndex,
        edge: decision.edge,
        effectiveRegime: decision.effectiveRegime,
        dispatchRef
      } satisfies FpDispatchTransition);
    }
    case "F_H":
      if (basis.resolvedPolicy.approvalSubjectRef === null) {
        throw new TypeError(
          `ExecutionBasis(${JSON.stringify(basis.id)}) requires approvalSubjectRef for F_H`
        );
      }
      return Object.freeze({
        kind: "fh_escalation",
        basis,
        vectorIndex: decision.vectorIndex,
        edge: decision.edge,
        effectiveRegime: decision.effectiveRegime,
        approvalSubjectRef: basis.resolvedPolicy.approvalSubjectRef,
        gateReason: "fh_gate"
      } satisfies FhEscalationTransition);
    default: {
      const exhaustive: never = decision.regime;
      throw new TypeError(`Unsupported runtime regime ${JSON.stringify(exhaustive)}`);
    }
  }
}

export function runtimeEventsForIterationDecision(
  decision: IterationAdvanceDecision
): readonly RuntimeEvent[] {
  if (decision.kind === "converged") {
    return Object.freeze([
      constructTerminalReachedEvent({
        kind: "terminal",
        basis: decision.basis,
        terminalKind: decision.terminalKind,
        reason: decision.reason
      })
    ]);
  }
  return Object.freeze([
    constructGraphCallOpenedEvent(decision.basis),
    constructFrameOpenedEvent(decision.basis),
    constructVectorTraversalPlannedEvent({
      basis: decision.basis,
      vectorIndex: decision.vectorIndex,
      effectiveRegime: decision.effectiveRegime
    })
  ]);
}
