// Implements: T-137
// Implements: REQ-R-ABG3-INTERPRET
// Implements: REQ-R-ABG3-PROJECTION

import type {
  ExecutionBasis,
  ObservedStateProjection,
  OverlayFrameContract,
  OverlayFrameDeclaredEvent,
  OverlayFrameEvaluatedEvent,
  OverlayFrameFoldbackOutcome,
  OverlayFramePredicateEvaluationEventRow,
  OverlayFramePredicateEventRow,
  OverlayFramePredicateRole,
  OverlayFramePressureDecisionKind,
  OverlayFrameProjection,
  OverlayFrameProjectionRow,
  OverlayFrameScopeEventRow,
  OverlayFrameScopeKind,
  RuntimeEvent
} from "./carriers.js";
import {
  OVERLAY_FRAME_PREDICATE_ROLE_VALUES,
  OVERLAY_FRAME_PRESSURE_DECISION_VALUES,
  OVERLAY_FRAME_SCOPE_KIND_VALUES
} from "./carriers.js";
import { deriveObservedStateProjection } from "./observed_state.js";
import {
  assertBasisEvent,
  assertNonEmptyString,
  assertNonNegativeInteger,
  assertVectorIndexInRange,
  frameIdForBasis,
  freezeStringArray,
  graphCallIdForBasis,
  vectorEdge
} from "./runtime_support.js";

function assertOptionalNonEmptyString(
  value: string | null,
  label: string
): void {
  if (value !== null) {
    assertNonEmptyString(value, label);
  }
}

function assertScopeKind(value: OverlayFrameScopeKind, label: string): void {
  for (const allowed of OVERLAY_FRAME_SCOPE_KIND_VALUES) {
    if (value === allowed) {
      return;
    }
  }
  throw new TypeError(`${label}: unsupported overlay-frame scope kind ${value}`);
}

function assertPredicateRole(
  value: OverlayFramePredicateRole,
  label: string
): void {
  for (const allowed of OVERLAY_FRAME_PREDICATE_ROLE_VALUES) {
    if (value === allowed) {
      return;
    }
  }
  throw new TypeError(`${label}: unsupported overlay-frame predicate role ${value}`);
}

function assertPressureDecision(
  value: OverlayFramePressureDecisionKind,
  label: string
): void {
  for (const allowed of OVERLAY_FRAME_PRESSURE_DECISION_VALUES) {
    if (value === allowed) {
      return;
    }
  }
  throw new TypeError(`${label}: unsupported overlay-frame pressure decision ${value}`);
}

function sortedUniqueStrings(values: Iterable<string>): readonly string[] {
  return freezeStringArray([...new Set(values)].sort());
}

function optionalVectorIndex(
  basis: ExecutionBasis,
  value: number | null,
  label: string
): number | null {
  if (value === null) {
    return null;
  }
  assertNonNegativeInteger(value, label);
  assertVectorIndexInRange(basis, value);
  return value;
}

function defaultAnchorRef(input: {
  readonly basis: ExecutionBasis;
  readonly scopeKind: OverlayFrameScopeKind;
  readonly vectorIndex: number | null;
  readonly spanId: string | null;
}): string {
  if (input.scopeKind === "graph_function") {
    return `graph-function:${input.basis.graphFunction.id}`;
  }
  if (input.scopeKind === "job") {
    return `job:${input.basis.job.id}`;
  }
  if (input.scopeKind === "module") {
    return `module:${input.basis.moduleName}`;
  }
  if (input.scopeKind === "graph_vector") {
    if (input.vectorIndex === null) {
      throw new TypeError("graph_vector overlay scope requires vectorIndex");
    }
    return `graph-vector:${input.basis.id}:${input.vectorIndex}:${vectorEdge(input.basis, input.vectorIndex)}`;
  }
  if (input.scopeKind === "graph_span") {
    if (input.spanId === null) {
      throw new TypeError("graph_span overlay scope requires spanId");
    }
    return input.spanId;
  }
  return `rule:${input.basis.graphFunction.id}`;
}

export function constructOverlayFrameScopeRef(input: {
  readonly basis: ExecutionBasis;
  readonly scopeKind: OverlayFrameScopeKind;
  readonly scopeRef?: string | undefined;
  readonly anchorRef?: string | undefined;
  readonly vectorIndex?: number | null | undefined;
  readonly spanId?: string | null | undefined;
}): OverlayFrameScopeEventRow {
  assertScopeKind(input.scopeKind, "OverlayFrameScope.scopeKind");
  const vectorIndex = optionalVectorIndex(
    input.basis,
    input.vectorIndex ?? null,
    "OverlayFrameScope.vectorIndex"
  );
  const spanId = input.spanId ?? null;
  assertOptionalNonEmptyString(spanId, "OverlayFrameScope.spanId");
  const anchorRef =
    input.anchorRef ??
    defaultAnchorRef({
      basis: input.basis,
      scopeKind: input.scopeKind,
      vectorIndex,
      spanId
    });
  assertNonEmptyString(anchorRef, "OverlayFrameScope.anchorRef");
  const scopeRef =
    input.scopeRef ??
    `overlay-scope:${input.scopeKind}:${anchorRef}`;
  assertNonEmptyString(scopeRef, "OverlayFrameScope.scopeRef");
  return Object.freeze({
    scopeKind: input.scopeKind,
    scopeRef,
    anchorRef,
    vectorIndex,
    spanId
  });
}

export function constructOverlayFramePredicateBinding(input: {
  readonly predicateRef: string;
  readonly role: OverlayFramePredicateRole;
  readonly expressionRef: string;
  readonly observedStateRefs: readonly string[];
}): OverlayFramePredicateEventRow {
  assertNonEmptyString(input.predicateRef, "OverlayFramePredicate.predicateRef");
  assertPredicateRole(input.role, "OverlayFramePredicate.role");
  assertNonEmptyString(input.expressionRef, "OverlayFramePredicate.expressionRef");
  const observedStateRefs = sortedUniqueStrings(input.observedStateRefs);
  if (observedStateRefs.length === 0) {
    throw new TypeError("Overlay-frame predicate requires observedStateRefs");
  }
  return Object.freeze({
    predicateRef: input.predicateRef,
    role: input.role,
    expressionRef: input.expressionRef,
    observedStateRefs
  });
}

export function constructOverlayFrameContract(input: {
  readonly basis: ExecutionBasis;
  readonly overlayFrameRef: string;
  readonly contractRef?: string | undefined;
  readonly scopeRefs: readonly OverlayFrameScopeEventRow[];
  readonly fireWhen: OverlayFramePredicateEventRow;
  readonly terminateWhen: OverlayFramePredicateEventRow;
  readonly pressureRefs?: readonly string[] | undefined;
  readonly foldbackTargetRef?: string | null | undefined;
  readonly reentryTargetVectorIndex?: number | null | undefined;
  readonly noClosePolicyRef?: string | null | undefined;
}): OverlayFrameContract {
  assertNonEmptyString(input.overlayFrameRef, "OverlayFrameContract.overlayFrameRef");
  const contractRef =
    input.contractRef ?? `overlay-frame-contract:${input.overlayFrameRef}`;
  assertNonEmptyString(contractRef, "OverlayFrameContract.contractRef");
  if (input.scopeRefs.length === 0) {
    throw new TypeError("Overlay-frame contract requires scope refs");
  }
  if (input.fireWhen.role !== "fire_when") {
    throw new TypeError("Overlay-frame fire predicate must use fire_when role");
  }
  if (input.terminateWhen.role !== "terminate_when") {
    throw new TypeError(
      "Overlay-frame terminate predicate must use terminate_when role"
    );
  }
  const reentryTargetVectorIndex = optionalVectorIndex(
    input.basis,
    input.reentryTargetVectorIndex ?? null,
    "OverlayFrameContract.reentryTargetVectorIndex"
  );
  const foldbackTargetRef = input.foldbackTargetRef ?? null;
  const noClosePolicyRef = input.noClosePolicyRef ?? null;
  assertOptionalNonEmptyString(
    foldbackTargetRef,
    "OverlayFrameContract.foldbackTargetRef"
  );
  assertOptionalNonEmptyString(
    noClosePolicyRef,
    "OverlayFrameContract.noClosePolicyRef"
  );
  return Object.freeze({
    kind: "overlay_frame_contract",
    overlayFrameRef: input.overlayFrameRef,
    contractRef,
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    scopeRefs: Object.freeze(input.scopeRefs.map((scope) => Object.freeze({ ...scope }))),
    fireWhen: Object.freeze({ ...input.fireWhen }),
    terminateWhen: Object.freeze({ ...input.terminateWhen }),
    pressureRefs: sortedUniqueStrings(input.pressureRefs ?? Object.freeze([])),
    foldbackTargetRef,
    reentryTargetVectorIndex,
    noClosePolicyRef
  });
}

function assertContractBasis(
  basis: ExecutionBasis,
  contract: OverlayFrameContract
): void {
  if (contract.basisId !== basis.id) {
    throw new TypeError("Overlay-frame contract must share execution basis");
  }
  if (contract.graphFunctionId !== basis.graphFunction.id) {
    throw new TypeError("Overlay-frame contract must share graph function");
  }
}

function evaluatePredicate(
  predicate: OverlayFramePredicateEventRow,
  observedState: ObservedStateProjection
): OverlayFramePredicateEvaluationEventRow {
  const available = new Set(observedState.observedStateRefs);
  const missingObservedStateRefs = predicate.observedStateRefs.filter(
    (observedStateRef) => !available.has(observedStateRef)
  );
  return Object.freeze({
    predicateRef: predicate.predicateRef,
    role: predicate.role,
    satisfied: missingObservedStateRefs.length === 0,
    observedStateRefs: freezeStringArray(predicate.observedStateRefs),
    missingObservedStateRefs: freezeStringArray(missingObservedStateRefs)
  });
}

function outcomeRefFor(input: {
  readonly contract: OverlayFrameContract;
  readonly predicateEvaluations: readonly OverlayFramePredicateEvaluationEventRow[];
  readonly pressureDecision: OverlayFramePressureDecisionKind;
  readonly clearingEvidenceRefs: readonly string[];
}): string {
  return `overlay-frame-outcome:${JSON.stringify({
    overlayFrameRef: input.contract.overlayFrameRef,
    contractRef: input.contract.contractRef,
    predicateEvaluations: input.predicateEvaluations.map((row) => ({
      predicateRef: row.predicateRef,
      role: row.role,
      satisfied: row.satisfied,
      missingObservedStateRefs: row.missingObservedStateRefs
    })),
    pressureDecision: input.pressureDecision,
    clearingEvidenceRefs: input.clearingEvidenceRefs
  })}`;
}

export function evaluateOverlayFrameContract(input: {
  readonly basis: ExecutionBasis;
  readonly contract: OverlayFrameContract;
  readonly observedState: ObservedStateProjection;
  readonly clearingEvidenceRefs?: readonly string[] | undefined;
}): OverlayFrameFoldbackOutcome {
  assertContractBasis(input.basis, input.contract);
  const fire = evaluatePredicate(input.contract.fireWhen, input.observedState);
  const terminate = evaluatePredicate(
    input.contract.terminateWhen,
    input.observedState
  );
  const predicateEvaluations = Object.freeze([fire, terminate]);
  const clearingEvidenceRefs = sortedUniqueStrings(
    input.clearingEvidenceRefs ?? Object.freeze([])
  );
  const diagnosticRefs: string[] = [];
  for (const row of predicateEvaluations) {
    if (row.missingObservedStateRefs.length > 0) {
      diagnosticRefs.push("overlay_frame_observed_state_missing");
      break;
    }
  }
  let pressureDecision: OverlayFramePressureDecisionKind = "carry_pressure";
  if (fire.satisfied && terminate.satisfied) {
    if (
      input.contract.pressureRefs.length === 0 ||
      clearingEvidenceRefs.length > 0
    ) {
      pressureDecision = "clear_pressure";
    } else if (input.contract.noClosePolicyRef !== null) {
      pressureDecision = "no_close";
    } else {
      diagnosticRefs.push("overlay_frame_pressure_clearance_missing");
    }
  }
  assertPressureDecision(pressureDecision, "OverlayFrameOutcome.pressureDecision");
  const clearedPressureRefs =
    pressureDecision === "clear_pressure"
      ? freezeStringArray(input.contract.pressureRefs)
      : Object.freeze([]);
  const carriedPressureRefs =
    pressureDecision === "carry_pressure" || pressureDecision === "no_close"
      ? freezeStringArray(input.contract.pressureRefs)
      : Object.freeze([]);
  const outcomeRef = outcomeRefFor({
    contract: input.contract,
    predicateEvaluations,
    pressureDecision,
    clearingEvidenceRefs
  });
  return Object.freeze({
    kind: "overlay_frame_foldback_outcome",
    outcomeRef,
    overlayFrameRef: input.contract.overlayFrameRef,
    contractRef: input.contract.contractRef,
    fireSatisfied: fire.satisfied,
    terminateSatisfied: terminate.satisfied,
    predicateEvaluations,
    pressureDecision,
    pressureRefs: freezeStringArray(input.contract.pressureRefs),
    carriedPressureRefs,
    clearedPressureRefs,
    clearingEvidenceRefs,
    foldbackTargetRef: input.contract.foldbackTargetRef,
    reentryTargetVectorIndex: input.contract.reentryTargetVectorIndex,
    diagnosticRefs: sortedUniqueStrings(diagnosticRefs)
  });
}

function lineageFields(input: {
  readonly basis: ExecutionBasis;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId: string;
}): {
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly frameLineageId: string | null;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
} {
  assertNonEmptyString(input.correlationId, "Overlay-frame correlationId");
  return Object.freeze({
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    frameLineageId: input.basis.frameLineageId,
    causationEventRefs: freezeStringArray(input.causationEventRefs ?? []),
    correlationId: input.correlationId
  });
}

export function constructOverlayFrameDeclaredEvent(input: {
  readonly basis: ExecutionBasis;
  readonly contract: OverlayFrameContract;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}): OverlayFrameDeclaredEvent {
  assertContractBasis(input.basis, input.contract);
  const lineage = lineageFields({
    basis: input.basis,
    causationEventRefs: input.causationEventRefs,
    correlationId: input.correlationId ?? input.contract.contractRef
  });
  return Object.freeze({
    kind: "overlay_frame_declared",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    frameLineageId: lineage.frameLineageId,
    graphFunctionId: input.basis.graphFunction.id,
    runId: lineage.runId,
    workKey: lineage.workKey,
    overlayFrameRef: input.contract.overlayFrameRef,
    contractRef: input.contract.contractRef,
    scopeRefs: Object.freeze(input.contract.scopeRefs.map((scope) => Object.freeze({ ...scope }))),
    fireWhen: Object.freeze({ ...input.contract.fireWhen }),
    terminateWhen: Object.freeze({ ...input.contract.terminateWhen }),
    pressureRefs: freezeStringArray(input.contract.pressureRefs),
    foldbackTargetRef: input.contract.foldbackTargetRef,
    reentryTargetVectorIndex: input.contract.reentryTargetVectorIndex,
    noClosePolicyRef: input.contract.noClosePolicyRef,
    causationEventRefs: lineage.causationEventRefs,
    correlationId: lineage.correlationId
  });
}

export function constructOverlayFrameEvaluatedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly outcome: OverlayFrameFoldbackOutcome;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}): OverlayFrameEvaluatedEvent {
  const reentryTargetVectorIndex = optionalVectorIndex(
    input.basis,
    input.outcome.reentryTargetVectorIndex,
    "OverlayFrameEvaluatedEvent.reentryTargetVectorIndex"
  );
  const lineage = lineageFields({
    basis: input.basis,
    causationEventRefs:
      input.causationEventRefs ?? [
        ...input.outcome.predicateEvaluations.flatMap(
          (row) => row.observedStateRefs
        ),
        ...input.outcome.clearingEvidenceRefs
      ],
    correlationId: input.correlationId ?? input.outcome.outcomeRef
  });
  return Object.freeze({
    kind: "overlay_frame_evaluated",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    frameLineageId: lineage.frameLineageId,
    graphFunctionId: input.basis.graphFunction.id,
    runId: lineage.runId,
    workKey: lineage.workKey,
    overlayFrameRef: input.outcome.overlayFrameRef,
    contractRef: input.outcome.contractRef,
    outcomeRef: input.outcome.outcomeRef,
    fireSatisfied: input.outcome.fireSatisfied,
    terminateSatisfied: input.outcome.terminateSatisfied,
    predicateEvaluations: Object.freeze(
      input.outcome.predicateEvaluations.map((row) => Object.freeze({
        predicateRef: row.predicateRef,
        role: row.role,
        satisfied: row.satisfied,
        observedStateRefs: freezeStringArray(row.observedStateRefs),
        missingObservedStateRefs: freezeStringArray(row.missingObservedStateRefs)
      }))
    ),
    pressureDecision: input.outcome.pressureDecision,
    pressureRefs: freezeStringArray(input.outcome.pressureRefs),
    carriedPressureRefs: freezeStringArray(input.outcome.carriedPressureRefs),
    clearedPressureRefs: freezeStringArray(input.outcome.clearedPressureRefs),
    clearingEvidenceRefs: freezeStringArray(input.outcome.clearingEvidenceRefs),
    foldbackTargetRef: input.outcome.foldbackTargetRef,
    reentryTargetVectorIndex,
    diagnosticRefs: freezeStringArray(input.outcome.diagnosticRefs),
    causationEventRefs: lineage.causationEventRefs,
    correlationId: lineage.correlationId
  });
}

function rowFromContract(contract: OverlayFrameContract): OverlayFrameProjectionRow {
  return Object.freeze({
    kind: "overlay_frame_projection_row",
    overlayFrameRef: contract.overlayFrameRef,
    contractRef: contract.contractRef,
    status: "declared",
    scopeRefs: Object.freeze(contract.scopeRefs.map((scope) => Object.freeze({ ...scope }))),
    fireWhen: Object.freeze({ ...contract.fireWhen }),
    terminateWhen: Object.freeze({ ...contract.terminateWhen }),
    pressureRefs: freezeStringArray(contract.pressureRefs),
    carriedPressureRefs: Object.freeze([]),
    clearedPressureRefs: Object.freeze([]),
    diagnosticRefs: Object.freeze([]),
    foldbackTargetRef: contract.foldbackTargetRef,
    reentryTargetVectorIndex: contract.reentryTargetVectorIndex,
    latestOutcomeRef: null
  });
}

function rowFromEvaluation(
  row: OverlayFrameProjectionRow,
  event: OverlayFrameEvaluatedEvent
): OverlayFrameProjectionRow {
  if (row.contractRef !== event.contractRef) {
    throw new TypeError("Overlay-frame evaluation contractRef does not match declaration");
  }
  const status =
    event.pressureDecision === "clear_pressure"
      ? "closed"
      : event.pressureDecision === "no_close"
        ? "no_close"
        : event.fireSatisfied
          ? "active"
          : "waiting";
  return Object.freeze({
    kind: "overlay_frame_projection_row",
    overlayFrameRef: row.overlayFrameRef,
    contractRef: row.contractRef,
    status,
    scopeRefs: row.scopeRefs,
    fireWhen: row.fireWhen,
    terminateWhen: row.terminateWhen,
    pressureRefs: freezeStringArray(event.pressureRefs),
    carriedPressureRefs: freezeStringArray(event.carriedPressureRefs),
    clearedPressureRefs: freezeStringArray(event.clearedPressureRefs),
    diagnosticRefs: freezeStringArray(event.diagnosticRefs),
    foldbackTargetRef: event.foldbackTargetRef,
    reentryTargetVectorIndex: event.reentryTargetVectorIndex,
    latestOutcomeRef: event.outcomeRef
  });
}

function assertEvaluationDerivedFromObservedState(input: {
  readonly event: OverlayFrameEvaluatedEvent;
  readonly observedState: ObservedStateProjection;
}): void {
  const available = new Set(input.observedState.observedStateRefs);
  for (const row of input.event.predicateEvaluations) {
    const replayMissing = freezeStringArray(
      row.observedStateRefs
        .filter((observedStateRef) => !available.has(observedStateRef))
        .sort()
    );
    const eventMissing = freezeStringArray([...row.missingObservedStateRefs].sort());
    if (JSON.stringify(replayMissing) !== JSON.stringify(eventMissing)) {
      throw new TypeError(
        "Overlay-frame predicate evaluation must derive missing refs from admitted observed state"
      );
    }
    if (row.satisfied !== (replayMissing.length === 0)) {
      throw new TypeError(
        "Overlay-frame predicate satisfaction must derive from admitted observed state"
      );
    }
  }
}

function projectionRefFor(input: {
  readonly basis: ExecutionBasis;
  readonly rows: readonly OverlayFrameProjectionRow[];
}): string {
  return `overlay-frame-projection:${JSON.stringify({
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    rows: input.rows.map((row) => ({
      overlayFrameRef: row.overlayFrameRef,
      status: row.status,
      latestOutcomeRef: row.latestOutcomeRef,
      carriedPressureRefs: row.carriedPressureRefs,
      clearedPressureRefs: row.clearedPressureRefs
    }))
  })}`;
}

export function deriveOverlayFrameProjection(input: {
  readonly basis: ExecutionBasis;
  readonly events: readonly RuntimeEvent[];
  readonly observedState?: ObservedStateProjection | undefined;
}): OverlayFrameProjection {
  const rowsByFrame = new Map<string, OverlayFrameProjectionRow>();
  const replayedEvents: RuntimeEvent[] = [];
  for (const event of input.events) {
    assertBasisEvent(input.basis, event);
    if (event.kind === "overlay_frame_declared") {
      const contract = constructOverlayFrameContract({
        basis: input.basis,
        overlayFrameRef: event.overlayFrameRef,
        contractRef: event.contractRef,
        scopeRefs: event.scopeRefs,
        fireWhen: event.fireWhen,
        terminateWhen: event.terminateWhen,
        pressureRefs: event.pressureRefs,
        foldbackTargetRef: event.foldbackTargetRef,
        reentryTargetVectorIndex: event.reentryTargetVectorIndex,
        noClosePolicyRef: event.noClosePolicyRef
      });
      rowsByFrame.set(event.overlayFrameRef, rowFromContract(contract));
    }
    if (event.kind === "overlay_frame_evaluated") {
      const existing = rowsByFrame.get(event.overlayFrameRef);
      if (existing === undefined) {
        throw new TypeError("Overlay-frame evaluation requires prior declaration");
      }
      const observedState = deriveObservedStateProjection(replayedEvents);
      assertEvaluationDerivedFromObservedState({ event, observedState });
      rowsByFrame.set(event.overlayFrameRef, rowFromEvaluation(existing, event));
    }
    replayedEvents.push(event);
  }
  const rows = Object.freeze(
    [...rowsByFrame.values()].sort((left, right) => (
      left.overlayFrameRef.localeCompare(right.overlayFrameRef)
    ))
  );
  const activeRows = Object.freeze(
    rows.filter((row) => row.status !== "closed")
  );
  const carriedPressureRefs = sortedUniqueStrings(
    activeRows.flatMap((row) => row.carriedPressureRefs)
  );
  const clearedPressureRefs = sortedUniqueStrings(
    rows.flatMap((row) => row.clearedPressureRefs)
  );
  return Object.freeze({
    kind: "overlay_frame_projection",
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    projectionRef: projectionRefFor({ basis: input.basis, rows }),
    rows,
    activeRows,
    activeOverlayFrameRefs: freezeStringArray(
      activeRows.map((row) => row.overlayFrameRef)
    ),
    carriedPressureRefs,
    clearedPressureRefs
  });
}
