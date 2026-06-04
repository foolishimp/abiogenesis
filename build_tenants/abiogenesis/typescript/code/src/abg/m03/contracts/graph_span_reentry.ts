// Implements: T-103
// Implements: REQ-R-ABG3-EVENTS
// Implements: REQ-R-ABG3-PROJECTION
// Implements: REQ-R-ABG3-LINEAGE
// Implements: REQ-R-ABG3-CORRECTION

import type {
  ExecutionBasis,
  GraphChangeClass,
  GraphConstitutionalReentryEventPayload,
  GraphReentryAppliedEvent,
  GraphReentryFrontierDecision,
  GraphReentryPlannedEvent,
  GraphReentryPoint,
  GraphSpanAssessedEvent,
  GraphSpanAssessmentEventRow,
  GraphSpanCarryObservationEventRow,
  GraphSpanEvaluationScheduledEvent,
  GraphSpanFoldbackDecision,
  GraphSpanFoldbackEvaluatedEvent,
  GraphSpanObligationAssessmentStatus,
  IterationAdvanceDecision,
  RuntimeAggregateProjection,
  RuntimeEvent,
  RuntimeRegime
} from "./carriers.js";
import {
  deriveIterationAdvanceDecision,
  deriveIterationOutcomeFromRows
} from "./iteration_state_action.js";
import {
  assertBasisEvent,
  assertNonEmptyString,
  assertNonNegativeInteger,
  assertVectorIndexInRange,
  frameIdForBasis,
  freezeNumberArray,
  freezeStringArray,
  graphCallIdForBasis,
  vectorEdge
} from "./runtime_support.js";
import type { ZoomFoldbackEvaluation } from "./workspace_zoom_foldback.js";

export type {
  GraphChangeClass,
  GraphConstitutionalReentryEventPayload as GraphConstitutionalReentry,
  GraphReentryPoint,
  GraphSpanCarryObservationEventRow as GraphSpanCarryObservation,
  GraphSpanFoldbackDecision,
  GraphSpanObligationAssessmentStatus
} from "./carriers.js";

export interface GraphSpanRef {
  readonly kind: "graph_span_ref";
  readonly spanId: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly sourceVectorIndex: number;
  readonly terminalVectorIndex: number;
  readonly sourceNodeRef: string;
  readonly terminalNodeRef: string;
  readonly coveredVectorIndexes: readonly number[];
}

export interface GraphSpanEvaluationSchedule {
  readonly kind: "graph_span_evaluation_schedule";
  readonly scheduleRef: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly terminalVectorIndex: number;
  readonly spanRefs: readonly GraphSpanRef[];
  readonly generation: number;
}

export interface GraphSpanObligationAssessmentRow {
  readonly obligationId: string;
  readonly sourceAuthorityRef: string;
  readonly status: GraphSpanObligationAssessmentStatus;
  readonly terminalEvidenceRefs: readonly string[];
  readonly carryObservations: readonly GraphSpanCarryObservationEventRow[];
  readonly detail: string | null;
}

export interface GraphSpanAssessment {
  readonly kind: "graph_span_assessment";
  readonly spanId: string;
  readonly assessmentId: string;
  readonly sourceNodeRef: string;
  readonly terminalNodeRef: string;
  readonly sourceVectorIndex: number;
  readonly terminalVectorIndex: number;
  readonly coveredVectorIndexes: readonly number[];
  readonly attemptIndex: number;
  readonly assessmentRegime: RuntimeRegime;
  readonly obligationRows: readonly GraphSpanObligationAssessmentRow[];
  readonly constitutionalReentry: GraphConstitutionalReentryEventPayload | null;
  readonly evidenceRefs: readonly string[];
  readonly edgeFoldbackRefs: readonly string[];
  readonly detail: string | null;
  readonly generation: number;
}

export interface GraphSpanFoldbackEvaluation {
  readonly kind: "graph_span_foldback_evaluation";
  readonly foldbackRef: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly terminalVectorIndex: number;
  readonly spanAssessmentRefs: readonly string[];
  readonly edgeFoldbackRefs: readonly string[];
  readonly causingEdgeFoldbackRefs: readonly string[];
  readonly decision: GraphSpanFoldbackDecision;
  readonly fulfilledCount: number;
  readonly gapCount: number;
  readonly staleInputCount: number;
  readonly blockedCount: number;
  readonly contradictoryCount: number;
  readonly reentryCandidateVectorIndexes: readonly number[];
  readonly earliestReentryVectorIndex: number | null;
  readonly constitutionalReentries: readonly GraphConstitutionalReentryEventPayload[];
  readonly causingObligationRefs: readonly string[];
  readonly generation: number;
}

export interface GraphReentryFrontierRow {
  readonly kind: "graph_reentry_frontier_row";
  readonly rowId: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly terminalVectorIndex: number;
  readonly targetVectorIndex: number | null;
  readonly changeClass: GraphChangeClass | null;
  readonly reEntryPoint: GraphReentryPoint | null;
  readonly constitutionalReentry: GraphConstitutionalReentryEventPayload | null;
  readonly routeContractRefs: readonly string[];
  readonly spanFoldbackRef: string;
  readonly causingSpanAssessmentRefs: readonly string[];
  readonly causingObligationRefs: readonly string[];
  readonly severity: "retry" | "constitutional_reentry" | "reprice" | "block";
  readonly generation: number;
  readonly clearedByGeneration: number | null;
}

export interface GraphReentryFrontierProjection {
  readonly kind: "graph_reentry_frontier_projection";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly generation: number;
  readonly activeRows: readonly GraphReentryFrontierRow[];
  readonly activeTargetVectorIndex: number | null;
  readonly activeReEntryPoint: GraphReentryPoint | null;
  readonly activeChangeClass: GraphChangeClass | null;
  readonly decision: GraphReentryFrontierDecision;
  readonly projectionRef: string;
}

export interface GraphReentryPlan {
  readonly kind: "graph_reentry_plan";
  readonly planRef: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly fromTerminalVectorIndex: number;
  readonly targetVectorIndex: number | null;
  readonly changeClass: GraphChangeClass | null;
  readonly reEntryPoint: GraphReentryPoint | null;
  readonly routeContractRefs: readonly string[];
  readonly generation: number;
  readonly causingFrontierRowRefs: readonly string[];
  readonly shadowedVectorIndexes: readonly number[];
  readonly reason: string;
}

export type GraphReentryAdvanceDecision =
  | {
      readonly kind: "reenter_graph_vector";
      readonly basis: ExecutionBasis;
      readonly vectorIndex: number;
      readonly edge: string;
      readonly generation: number;
      readonly frontierRef: string;
    }
  | {
      readonly kind: "reenter_constitutional_route";
      readonly basis: ExecutionBasis;
      readonly changeClass: GraphChangeClass;
      readonly reEntryPoint: GraphReentryPoint;
      readonly routeContractRefs: readonly string[];
      readonly generation: number;
      readonly frontierRef: string;
    }
  | {
      readonly kind: "reprice_required";
      readonly basis: ExecutionBasis;
      readonly frontierRef: string;
      readonly reason: string;
    }
  | {
      readonly kind: "blocked";
      readonly basis: ExecutionBasis;
      readonly frontierRef: string;
      readonly reason: string;
    }
  | {
      readonly kind: "default_iteration";
      readonly decision: IterationAdvanceDecision;
    };

function assertBasisOwned(
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

function vectorNodeRef(
  basis: ExecutionBasis,
  vectorIndex: number,
  role: "source" | "target"
): string {
  const vector = basis.graph.vectors[vectorIndex];
  if (vector === undefined) {
    throw new TypeError(`Missing vector ${vectorIndex}`);
  }
  const node = role === "source" ? vector.source[0] : vector.target;
  if (node === undefined) {
    throw new TypeError(`Vector ${vectorIndex} has no source node`);
  }
  return node.id;
}

function rangeInclusive(start: number, end: number): readonly number[] {
  const indexes: number[] = [];
  for (let index = start; index <= end; index += 1) {
    indexes.push(index);
  }
  return freezeNumberArray(indexes);
}

function sortedUniqueNumbers(values: Iterable<number>): readonly number[] {
  return freezeNumberArray([...new Set(values)].sort((left, right) => left - right));
}

function sortedUniqueStrings(values: Iterable<string>): readonly string[] {
  return freezeStringArray([...new Set(values)].sort());
}

function runtimeLineageFields(input: {
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
  assertNonEmptyString(input.correlationId, "Runtime event correlationId");
  return Object.freeze({
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    frameLineageId: input.basis.frameLineageId,
    causationEventRefs: freezeStringArray(input.causationEventRefs ?? []),
    correlationId: input.correlationId
  });
}

function spanRefFor(input: {
  readonly basis: ExecutionBasis;
  readonly sourceVectorIndex: number;
  readonly terminalVectorIndex: number;
}): GraphSpanRef {
  assertVectorIndexInRange(input.basis, input.sourceVectorIndex);
  assertVectorIndexInRange(input.basis, input.terminalVectorIndex);
  if (input.sourceVectorIndex > input.terminalVectorIndex) {
    throw new TypeError("Graph span source cannot be after terminal vector");
  }
  return Object.freeze({
    kind: "graph_span_ref",
    spanId: `graph-span:${input.basis.id}:${input.sourceVectorIndex}->${input.terminalVectorIndex}`,
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    sourceVectorIndex: input.sourceVectorIndex,
    terminalVectorIndex: input.terminalVectorIndex,
    sourceNodeRef: vectorNodeRef(input.basis, input.sourceVectorIndex, "source"),
    terminalNodeRef: vectorNodeRef(input.basis, input.terminalVectorIndex, "target"),
    coveredVectorIndexes: rangeInclusive(
      input.sourceVectorIndex,
      input.terminalVectorIndex
    )
  });
}

function assertSpanMatchesBasis(
  basis: ExecutionBasis,
  span: GraphSpanRef,
  label: string
): void {
  assertBasisOwned(basis, span, label);
  assertVectorIndexInRange(basis, span.sourceVectorIndex);
  assertVectorIndexInRange(basis, span.terminalVectorIndex);
  if (
    span.sourceNodeRef !== vectorNodeRef(basis, span.sourceVectorIndex, "source") ||
    span.terminalNodeRef !== vectorNodeRef(basis, span.terminalVectorIndex, "target")
  ) {
    throw new TypeError(`${label} node refs must match graph topology`);
  }
  const expected = rangeInclusive(span.sourceVectorIndex, span.terminalVectorIndex);
  if (JSON.stringify(span.coveredVectorIndexes) !== JSON.stringify(expected)) {
    throw new TypeError(`${label} covered vectors must be contiguous`);
  }
}

function assertAssessmentRow(
  span: GraphSpanRef,
  row: GraphSpanObligationAssessmentRow,
  constitutionalReentry: GraphConstitutionalReentryEventPayload | null
): GraphSpanAssessmentEventRow {
  assertNonEmptyString(row.obligationId, "GraphSpanAssessmentRow.obligationId");
  assertNonEmptyString(
    row.sourceAuthorityRef,
    "GraphSpanAssessmentRow.sourceAuthorityRef"
  );
  if (row.status === "fulfilled" && row.terminalEvidenceRefs.length === 0) {
    throw new TypeError("Fulfilled graph span row requires terminal evidence refs");
  }
  if (row.status === "constitutional_gap" && constitutionalReentry === null) {
    throw new TypeError(
      "Constitutional graph span row requires constitutional reentry"
    );
  }
  for (const observation of row.carryObservations) {
    assertCarryObservation(span, observation);
  }
  return Object.freeze({
    obligationId: row.obligationId,
    sourceAuthorityRef: row.sourceAuthorityRef,
    status: row.status,
    terminalEvidenceRefs: freezeStringArray(row.terminalEvidenceRefs),
    carryObservations: Object.freeze(row.carryObservations.map((observation) => (
      Object.freeze({
        fromVectorIndex: observation.fromVectorIndex,
        toVectorIndex: observation.toVectorIndex,
        status: observation.status,
        evidenceRefs: freezeStringArray(observation.evidenceRefs)
      })
    ))),
    detail: row.detail
  });
}

function assertCarryObservation(
  span: GraphSpanRef,
  observation: GraphSpanCarryObservationEventRow
): void {
  assertNonNegativeInteger(
    observation.fromVectorIndex,
    "GraphSpanCarryObservation.fromVectorIndex"
  );
  assertNonNegativeInteger(
    observation.toVectorIndex,
    "GraphSpanCarryObservation.toVectorIndex"
  );
  if (
    observation.fromVectorIndex < span.sourceVectorIndex ||
    observation.toVectorIndex > span.terminalVectorIndex ||
    observation.fromVectorIndex > observation.toVectorIndex
  ) {
    throw new TypeError("Carry observation must stay inside the graph span");
  }
}

function assertConstitutionalReentry(
  basis: ExecutionBasis,
  reentry: GraphConstitutionalReentryEventPayload | null
): GraphConstitutionalReentryEventPayload | null {
  if (reentry === null) {
    return null;
  }
  if (reentry.kind !== "graph_constitutional_reentry") {
    throw new TypeError("Constitutional reentry kind must be graph_constitutional_reentry");
  }
  if (reentry.routeContractRefs.length === 0) {
    throw new TypeError("Constitutional reentry requires route contract refs");
  }
  if (reentry.authorityRefs.length === 0) {
    throw new TypeError("Constitutional reentry requires authority refs");
  }
  if (reentry.rationale.length === 0) {
    throw new TypeError("Constitutional reentry requires rationale");
  }
  if (reentry.targetVectorIndex !== null) {
    assertVectorIndexInRange(basis, reentry.targetVectorIndex);
  }
  return Object.freeze({
    kind: reentry.kind,
    changeClass: reentry.changeClass,
    reEntryPoint: reentry.reEntryPoint,
    targetGraphFunctionRef: reentry.targetGraphFunctionRef,
    targetVectorIndex: reentry.targetVectorIndex,
    routeContractRefs: freezeStringArray(reentry.routeContractRefs),
    authorityRefs: freezeStringArray(reentry.authorityRefs),
    rationale: reentry.rationale
  });
}

function assessmentEventRows(
  assessment: GraphSpanAssessment
): readonly GraphSpanAssessmentEventRow[] {
  return Object.freeze(
    assessment.obligationRows.map((row) => (
      Object.freeze({
        obligationId: row.obligationId,
        sourceAuthorityRef: row.sourceAuthorityRef,
        status: row.status,
        terminalEvidenceRefs: freezeStringArray(row.terminalEvidenceRefs),
        carryObservations: Object.freeze(row.carryObservations.map((observation) => (
          Object.freeze({
            fromVectorIndex: observation.fromVectorIndex,
            toVectorIndex: observation.toVectorIndex,
            status: observation.status,
            evidenceRefs: freezeStringArray(observation.evidenceRefs)
          })
        ))),
        detail: row.detail
      })
    ))
  );
}

function assessmentFromEvent(event: GraphSpanAssessedEvent): GraphSpanAssessment {
  return Object.freeze({
    kind: "graph_span_assessment",
    spanId: event.spanId,
    assessmentId: event.assessmentId,
    sourceNodeRef: event.sourceNodeRef,
    terminalNodeRef: event.terminalNodeRef,
    sourceVectorIndex: event.sourceVectorIndex,
    terminalVectorIndex: event.terminalVectorIndex,
    coveredVectorIndexes: freezeNumberArray(event.coveredVectorIndexes),
    attemptIndex: event.attemptIndex,
    assessmentRegime: event.assessmentRegime,
    obligationRows: Object.freeze(event.obligationRows.map((row) => (
      Object.freeze({
        obligationId: row.obligationId,
        sourceAuthorityRef: row.sourceAuthorityRef,
        status: row.status,
        terminalEvidenceRefs: freezeStringArray(row.terminalEvidenceRefs),
        carryObservations: Object.freeze(row.carryObservations.map((observation) => (
          Object.freeze({
            fromVectorIndex: observation.fromVectorIndex,
            toVectorIndex: observation.toVectorIndex,
            status: observation.status,
            evidenceRefs: freezeStringArray(observation.evidenceRefs)
          })
        ))),
        detail: row.detail
      })
    ))),
    constitutionalReentry: event.constitutionalReentry,
    evidenceRefs: freezeStringArray(event.evidenceRefs),
    edgeFoldbackRefs: freezeStringArray(event.edgeFoldbackRefs),
    detail: event.detail,
    generation: event.generation
  });
}

function foldbackRefFor(input: {
  readonly basis: ExecutionBasis;
  readonly terminalVectorIndex: number;
  readonly generation: number;
  readonly assessmentRefs: readonly string[];
  readonly edgeFoldbackRefs: readonly string[];
  readonly causingEdgeFoldbackRefs: readonly string[];
}): string {
  return `graph-span-foldback:${JSON.stringify({
    basisId: input.basis.id,
    terminalVectorIndex: input.terminalVectorIndex,
    generation: input.generation,
    assessmentRefs: [...input.assessmentRefs].sort(),
    edgeFoldbackRefs: [...input.edgeFoldbackRefs].sort(),
    causingEdgeFoldbackRefs: [...input.causingEdgeFoldbackRefs].sort()
  })}`;
}

function frontierRowId(input: {
  readonly basis: ExecutionBasis;
  readonly foldbackRef: string;
  readonly severity: GraphReentryFrontierRow["severity"];
  readonly targetVectorIndex: number | null;
  readonly changeClass: GraphChangeClass | null;
  readonly reEntryPoint: GraphReentryPoint | null;
  readonly generation: number;
}): string {
  return `graph-reentry-frontier-row:${JSON.stringify({
    basisId: input.basis.id,
    foldbackRef: input.foldbackRef,
    severity: input.severity,
    targetVectorIndex: input.targetVectorIndex,
    changeClass: input.changeClass,
    reEntryPoint: input.reEntryPoint,
    generation: input.generation
  })}`;
}

function frontierRef(input: {
  readonly basis: ExecutionBasis;
  readonly rows: readonly GraphReentryFrontierRow[];
  readonly generation: number;
}): string {
  return `graph-reentry-frontier:${JSON.stringify({
    basisId: input.basis.id,
    generation: input.generation,
    activeRows: input.rows.map((row) => row.rowId)
  })}`;
}

function planRefFor(input: {
  readonly basis: ExecutionBasis;
  readonly frontier: GraphReentryFrontierProjection;
  readonly rowRefs: readonly string[];
}): string {
  return `graph-reentry-plan:${JSON.stringify({
    basisId: input.basis.id,
    frontierRef: input.frontier.projectionRef,
    rowRefs: input.rowRefs
  })}`;
}

function shadowedVectorIndexes(
  basis: ExecutionBasis,
  targetVectorIndex: number | null
): readonly number[] {
  if (basis.graph.vectors.length === 0) {
    return Object.freeze([]);
  }
  if (targetVectorIndex === null) {
    return rangeInclusive(0, basis.graph.vectors.length - 1);
  }
  return rangeInclusive(targetVectorIndex, basis.graph.vectors.length - 1);
}

function rowPriority(row: GraphReentryFrontierRow): number {
  if (row.severity === "block") {
    return 0;
  }
  if (row.severity === "constitutional_reentry") {
    return 1;
  }
  if (row.severity === "reprice") {
    return 2;
  }
  return 3;
}

function sortRows(
  rows: readonly GraphReentryFrontierRow[]
): readonly GraphReentryFrontierRow[] {
  return Object.freeze(
    [...rows].sort((left, right) => {
      const priority = rowPriority(left) - rowPriority(right);
      if (priority !== 0) {
        return priority;
      }
      const leftTarget = left.targetVectorIndex ?? Number.POSITIVE_INFINITY;
      const rightTarget = right.targetVectorIndex ?? Number.POSITIVE_INFINITY;
      if (leftTarget !== rightTarget) {
        return leftTarget - rightTarget;
      }
      return left.rowId.localeCompare(right.rowId);
    })
  );
}

export function deriveEndpointSpanSchedule(input: {
  readonly basis: ExecutionBasis;
  readonly terminalVectorIndex: number;
  readonly closedVectorIndexes: readonly number[];
  readonly generation?: number;
  readonly scheduleRef?: string;
}): GraphSpanEvaluationSchedule {
  assertVectorIndexInRange(input.basis, input.terminalVectorIndex);
  const closed = new Set(input.closedVectorIndexes);
  for (let index = 0; index <= input.terminalVectorIndex; index += 1) {
    if (!closed.has(index)) {
      throw new TypeError("Endpoint span schedule requires every covered vector closed");
    }
  }
  const generation = input.generation ?? 0;
  const spanRefs: GraphSpanRef[] = [];
  for (
    let sourceVectorIndex = input.terminalVectorIndex;
    sourceVectorIndex >= 0;
    sourceVectorIndex -= 1
  ) {
    spanRefs.push(
      spanRefFor({
        basis: input.basis,
        sourceVectorIndex,
        terminalVectorIndex: input.terminalVectorIndex
      })
    );
  }
  const scheduleRef =
    input.scheduleRef ??
    `graph-span-schedule:${JSON.stringify({
      basisId: input.basis.id,
      terminalVectorIndex: input.terminalVectorIndex,
      generation,
      spans: spanRefs.map((span) => span.spanId)
    })}`;
  return Object.freeze({
    kind: "graph_span_evaluation_schedule",
    scheduleRef,
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    terminalVectorIndex: input.terminalVectorIndex,
    spanRefs: Object.freeze(spanRefs),
    generation
  });
}

export function admitGraphSpanAssessment(input: {
  readonly basis: ExecutionBasis;
  readonly span: GraphSpanRef;
  readonly assessmentId: string;
  readonly attemptIndex: number;
  readonly assessmentRegime: RuntimeRegime;
  readonly obligationRows: readonly GraphSpanObligationAssessmentRow[];
  readonly constitutionalReentry: GraphConstitutionalReentryEventPayload | null;
  readonly evidenceRefs: readonly string[];
  readonly edgeFoldbackRefs: readonly string[];
  readonly detail: string | null;
  readonly generation?: number;
}): GraphSpanAssessment {
  assertSpanMatchesBasis(input.basis, input.span, "Graph span assessment");
  assertNonEmptyString(input.assessmentId, "GraphSpanAssessment.assessmentId");
  assertNonNegativeInteger(input.attemptIndex, "GraphSpanAssessment.attemptIndex");
  if (input.obligationRows.length === 0) {
    throw new TypeError("Graph span assessment requires obligation rows");
  }
  const constitutionalReentry = assertConstitutionalReentry(
    input.basis,
    input.constitutionalReentry
  );
  const rows = Object.freeze(
    input.obligationRows.map((row) =>
      assertAssessmentRow(input.span, row, constitutionalReentry)
    )
  );
  if (
    rows.some((row) => row.status !== "fulfilled") &&
    input.assessmentRegime !== "F_P"
  ) {
    throw new TypeError("Semantic graph span gaps require F_P assessment");
  }
  return Object.freeze({
    kind: "graph_span_assessment",
    spanId: input.span.spanId,
    assessmentId: input.assessmentId,
    sourceNodeRef: input.span.sourceNodeRef,
    terminalNodeRef: input.span.terminalNodeRef,
    sourceVectorIndex: input.span.sourceVectorIndex,
    terminalVectorIndex: input.span.terminalVectorIndex,
    coveredVectorIndexes: freezeNumberArray(input.span.coveredVectorIndexes),
    attemptIndex: input.attemptIndex,
    assessmentRegime: input.assessmentRegime,
    obligationRows: rows,
    constitutionalReentry,
    evidenceRefs: freezeStringArray(input.evidenceRefs),
    edgeFoldbackRefs: freezeStringArray(input.edgeFoldbackRefs),
    detail: input.detail,
    generation: input.generation ?? 0
  });
}

export function deriveFirstBadVector(input: {
  readonly span: GraphSpanRef;
  readonly row: GraphSpanObligationAssessmentRow;
}): number | null {
  if (input.row.status === "fulfilled") {
    return null;
  }
  if (input.row.status === "constitutional_gap") {
    return null;
  }
  const observations = [...input.row.carryObservations].sort(
    (left, right) => left.fromVectorIndex - right.fromVectorIndex
  );
  for (const observation of observations) {
    assertCarryObservation(input.span, observation);
    if (observation.status !== "carried") {
      return observation.fromVectorIndex;
    }
  }
  if (input.span.sourceVectorIndex === input.span.terminalVectorIndex) {
    return input.span.terminalVectorIndex;
  }
  return null;
}

export function foldGraphSpanAssessments(input: {
  readonly basis: ExecutionBasis;
  readonly terminalVectorIndex: number;
  readonly schedule: GraphSpanEvaluationSchedule;
  readonly assessments: readonly GraphSpanAssessment[];
  readonly edgeFoldbacks?: readonly ZoomFoldbackEvaluation[];
  readonly generation?: number;
}): GraphSpanFoldbackEvaluation {
  assertBasisOwned(input.basis, input.schedule, "Graph span schedule");
  assertVectorIndexInRange(input.basis, input.terminalVectorIndex);
  if (input.schedule.terminalVectorIndex !== input.terminalVectorIndex) {
    throw new TypeError("Graph span foldback terminal vector must match schedule");
  }
  const scheduleSpanIds = new Set(input.schedule.spanRefs.map((span) => span.spanId));
  const assessmentsBySpan = new Map<string, GraphSpanAssessment>();
  for (const assessment of input.assessments) {
    if (!scheduleSpanIds.has(assessment.spanId)) {
      throw new TypeError("Graph span foldback assessment is outside schedule");
    }
    const previous = assessmentsBySpan.get(assessment.spanId);
    if (previous === undefined || assessment.attemptIndex >= previous.attemptIndex) {
      assessmentsBySpan.set(assessment.spanId, assessment);
    }
  }
  const generation = input.generation ?? input.schedule.generation;
  const assessmentRefs = sortedUniqueStrings(
    [...assessmentsBySpan.values()].map((assessment) => assessment.assessmentId)
  );
  const edgeFoldbackRefs = sortedUniqueStrings(
    input.edgeFoldbacks?.map((foldback) => foldback.foldbackRef) ?? []
  );
  const blockingEdgeFoldbackRefs = sortedUniqueStrings(
    input.edgeFoldbacks
      ?.filter(
        (foldback) =>
          foldback.decision === "blocked" ||
          foldback.decision === "retry_scheduled_slice" ||
          foldback.decision === "carry_loopback_pressure"
      )
      .map((foldback) => foldback.foldbackRef) ?? []
  );
  const repricingEdgeFoldbackRefs = sortedUniqueStrings(
    input.edgeFoldbacks
      ?.filter((foldback) => foldback.decision === "reprice_required")
      .map((foldback) => foldback.foldbackRef) ?? []
  );
  const causingEdgeFoldbackRefs = sortedUniqueStrings([
    ...blockingEdgeFoldbackRefs,
    ...repricingEdgeFoldbackRefs
  ]);
  const reentryCandidates: number[] = [];
  const constitutionalReentries: GraphConstitutionalReentryEventPayload[] = [];
  const causingObligationRefs: string[] = [];
  let fulfilledCount = 0;
  let gapCount = 0;
  let staleInputCount = 0;
  let blockedCount = 0;
  let contradictoryCount = 0;

  for (const span of input.schedule.spanRefs) {
    const assessment = assessmentsBySpan.get(span.spanId);
    if (assessment === undefined) {
      blockedCount += 1;
      continue;
    }
    if (assessment.constitutionalReentry !== null) {
      constitutionalReentries.push(assessment.constitutionalReentry);
    }
    for (const row of assessment.obligationRows) {
      if (row.status === "fulfilled") {
        fulfilledCount += 1;
        continue;
      }
      causingObligationRefs.push(row.obligationId);
      if (row.status === "stale_input") {
        staleInputCount += 1;
      } else if (row.status === "contradictory_evidence") {
        contradictoryCount += 1;
      } else if (row.status === "blocked") {
        blockedCount += 1;
      } else {
        gapCount += 1;
      }
      const firstBadVector = deriveFirstBadVector({ span, row });
      if (firstBadVector !== null) {
        reentryCandidates.push(firstBadVector);
      }
    }
  }
  blockedCount += blockingEdgeFoldbackRefs.length;
  staleInputCount += repricingEdgeFoldbackRefs.length;

  const sortedReentryCandidates = sortedUniqueNumbers(reentryCandidates);
  const earliestReentryVectorIndex = sortedReentryCandidates[0] ?? null;
  const missingAssessment =
    input.schedule.spanRefs.length !== assessmentsBySpan.size;
  const decision: GraphSpanFoldbackDecision =
    blockedCount > 0
      ? "blocked"
      : staleInputCount > 0 || contradictoryCount > 0
        ? "reprice_required"
        : constitutionalReentries.length > 0
          ? "constitutional_reentry"
          : gapCount === 0 && !missingAssessment
            ? "close"
            : earliestReentryVectorIndex === null
              ? "reprice_required"
              : earliestReentryVectorIndex === input.terminalVectorIndex
                ? "retry_terminal_edge"
                : "reenter_at_vector";

  return Object.freeze({
    kind: "graph_span_foldback_evaluation",
    foldbackRef: foldbackRefFor({
      basis: input.basis,
      terminalVectorIndex: input.terminalVectorIndex,
      generation,
      assessmentRefs,
      edgeFoldbackRefs,
      causingEdgeFoldbackRefs
    }),
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    terminalVectorIndex: input.terminalVectorIndex,
    spanAssessmentRefs: assessmentRefs,
    edgeFoldbackRefs,
    causingEdgeFoldbackRefs,
    decision,
    fulfilledCount,
    gapCount,
    staleInputCount,
    blockedCount,
    contradictoryCount,
    reentryCandidateVectorIndexes: sortedReentryCandidates,
    earliestReentryVectorIndex,
    constitutionalReentries: Object.freeze(constitutionalReentries),
    causingObligationRefs: sortedUniqueStrings(causingObligationRefs),
    generation
  });
}

export function constructGraphSpanEvaluationScheduledEvent(input: {
  readonly basis: ExecutionBasis;
  readonly schedule: GraphSpanEvaluationSchedule;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}): GraphSpanEvaluationScheduledEvent {
  assertBasisOwned(input.basis, input.schedule, "Graph span schedule");
  assertVectorIndexInRange(input.basis, input.schedule.terminalVectorIndex);
  const lineage = runtimeLineageFields({
    basis: input.basis,
    causationEventRefs: input.causationEventRefs,
    correlationId: input.correlationId ?? input.schedule.scheduleRef
  });
  return Object.freeze({
    kind: "graph_span_evaluation_scheduled",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    frameLineageId: lineage.frameLineageId,
    graphFunctionId: input.basis.graphFunction.id,
    runId: lineage.runId,
    workKey: lineage.workKey,
    terminalVectorIndex: input.schedule.terminalVectorIndex,
    terminalEdge: vectorEdge(input.basis, input.schedule.terminalVectorIndex),
    scheduleRef: input.schedule.scheduleRef,
    spanIds: freezeStringArray(
      input.schedule.spanRefs.map((span) => span.spanId)
    ),
    causationEventRefs: lineage.causationEventRefs,
    correlationId: lineage.correlationId,
    generation: input.schedule.generation
  });
}

export function constructGraphSpanAssessedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly assessment: GraphSpanAssessment;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}): GraphSpanAssessedEvent {
  assertVectorIndexInRange(input.basis, input.assessment.sourceVectorIndex);
  assertVectorIndexInRange(input.basis, input.assessment.terminalVectorIndex);
  const lineage = runtimeLineageFields({
    basis: input.basis,
    causationEventRefs: input.causationEventRefs ?? input.assessment.evidenceRefs,
    correlationId: input.correlationId ?? input.assessment.assessmentId
  });
  return Object.freeze({
    kind: "graph_span_assessed",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    frameLineageId: lineage.frameLineageId,
    graphFunctionId: input.basis.graphFunction.id,
    runId: lineage.runId,
    workKey: lineage.workKey,
    terminalVectorIndex: input.assessment.terminalVectorIndex,
    terminalEdge: vectorEdge(input.basis, input.assessment.terminalVectorIndex),
    sourceVectorIndex: input.assessment.sourceVectorIndex,
    spanId: input.assessment.spanId,
    sourceNodeRef: input.assessment.sourceNodeRef,
    terminalNodeRef: input.assessment.terminalNodeRef,
    coveredVectorIndexes: freezeNumberArray(input.assessment.coveredVectorIndexes),
    assessmentId: input.assessment.assessmentId,
    attemptIndex: input.assessment.attemptIndex,
    assessmentRegime: input.assessment.assessmentRegime,
    obligationRows: assessmentEventRows(input.assessment),
    constitutionalReentry: input.assessment.constitutionalReentry,
    evidenceRefs: freezeStringArray(input.assessment.evidenceRefs),
    edgeFoldbackRefs: freezeStringArray(input.assessment.edgeFoldbackRefs),
    causationEventRefs: lineage.causationEventRefs,
    correlationId: lineage.correlationId,
    detail: input.assessment.detail,
    generation: input.assessment.generation
  });
}

export function constructGraphSpanFoldbackEvaluatedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly foldback: GraphSpanFoldbackEvaluation;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}): GraphSpanFoldbackEvaluatedEvent {
  assertBasisOwned(input.basis, input.foldback, "Graph span foldback");
  assertVectorIndexInRange(input.basis, input.foldback.terminalVectorIndex);
  const lineage = runtimeLineageFields({
    basis: input.basis,
    causationEventRefs: input.causationEventRefs ?? [
      ...input.foldback.spanAssessmentRefs,
      ...input.foldback.causingEdgeFoldbackRefs
    ],
    correlationId: input.correlationId ?? input.foldback.foldbackRef
  });
  return Object.freeze({
    kind: "graph_span_foldback_evaluated",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    frameLineageId: lineage.frameLineageId,
    graphFunctionId: input.basis.graphFunction.id,
    runId: lineage.runId,
    workKey: lineage.workKey,
    terminalVectorIndex: input.foldback.terminalVectorIndex,
    terminalEdge: vectorEdge(input.basis, input.foldback.terminalVectorIndex),
    foldbackRef: input.foldback.foldbackRef,
    spanAssessmentRefs: freezeStringArray(input.foldback.spanAssessmentRefs),
    edgeFoldbackRefs: freezeStringArray(input.foldback.edgeFoldbackRefs),
    causingEdgeFoldbackRefs: freezeStringArray(
      input.foldback.causingEdgeFoldbackRefs
    ),
    decision: input.foldback.decision,
    fulfilledCount: input.foldback.fulfilledCount,
    gapCount: input.foldback.gapCount,
    staleInputCount: input.foldback.staleInputCount,
    blockedCount: input.foldback.blockedCount,
    contradictoryCount: input.foldback.contradictoryCount,
    reentryCandidateVectorIndexes: freezeNumberArray(
      input.foldback.reentryCandidateVectorIndexes
    ),
    earliestReentryVectorIndex: input.foldback.earliestReentryVectorIndex,
    constitutionalReentries: Object.freeze(input.foldback.constitutionalReentries),
    causingObligationRefs: freezeStringArray(input.foldback.causingObligationRefs),
    causationEventRefs: lineage.causationEventRefs,
    correlationId: lineage.correlationId,
    generation: input.foldback.generation
  });
}

export function deriveGraphSpanAssessmentsFromEvents(input: {
  readonly basis: ExecutionBasis;
  readonly events: readonly RuntimeEvent[];
  readonly terminalVectorIndex?: number;
}): readonly GraphSpanAssessment[] {
  const assessments: GraphSpanAssessment[] = [];
  for (const event of input.events) {
    assertBasisEvent(input.basis, event);
    if (event.kind !== "graph_span_assessed") {
      continue;
    }
    assertVectorIndexInRange(input.basis, event.sourceVectorIndex);
    assertVectorIndexInRange(input.basis, event.terminalVectorIndex);
    if (
      input.terminalVectorIndex !== undefined &&
      event.terminalVectorIndex !== input.terminalVectorIndex
    ) {
      continue;
    }
    assessments.push(assessmentFromEvent(event));
  }
  return Object.freeze(
    assessments.sort((left, right) => left.assessmentId.localeCompare(right.assessmentId))
  );
}

function rowsForFoldbackEvent(input: {
  readonly basis: ExecutionBasis;
  readonly event: GraphSpanFoldbackEvaluatedEvent;
}): readonly GraphReentryFrontierRow[] {
  const base = {
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    terminalVectorIndex: input.event.terminalVectorIndex,
    spanFoldbackRef: input.event.foldbackRef,
    causingSpanAssessmentRefs: freezeStringArray(input.event.spanAssessmentRefs),
    causingObligationRefs: freezeStringArray(input.event.causingObligationRefs),
    generation: input.event.generation,
    clearedByGeneration: null
  } as const;
  if (input.event.decision === "blocked") {
    const severity = "block" as const;
    return Object.freeze([
      Object.freeze({
        kind: "graph_reentry_frontier_row",
        rowId: frontierRowId({
          basis: input.basis,
          foldbackRef: input.event.foldbackRef,
          severity,
          targetVectorIndex: null,
          changeClass: null,
          reEntryPoint: null,
          generation: input.event.generation
        }),
        ...base,
        targetVectorIndex: null,
        changeClass: null,
        reEntryPoint: null,
        constitutionalReentry: null,
        routeContractRefs: Object.freeze([]),
        severity
      })
    ]);
  }
  if (input.event.decision === "reprice_required") {
    const severity = "reprice" as const;
    return Object.freeze([
      Object.freeze({
        kind: "graph_reentry_frontier_row",
        rowId: frontierRowId({
          basis: input.basis,
          foldbackRef: input.event.foldbackRef,
          severity,
          targetVectorIndex: null,
          changeClass: null,
          reEntryPoint: null,
          generation: input.event.generation
        }),
        ...base,
        targetVectorIndex: null,
        changeClass: null,
        reEntryPoint: null,
        constitutionalReentry: null,
        routeContractRefs: Object.freeze([]),
        severity
      })
    ]);
  }
  if (input.event.decision === "constitutional_reentry") {
    const severity = "constitutional_reentry" as const;
    return Object.freeze(
      input.event.constitutionalReentries.map((reentry) => (
        Object.freeze({
          kind: "graph_reentry_frontier_row",
          rowId: frontierRowId({
            basis: input.basis,
            foldbackRef: input.event.foldbackRef,
            severity,
            targetVectorIndex: reentry.targetVectorIndex,
            changeClass: reentry.changeClass,
            reEntryPoint: reentry.reEntryPoint,
            generation: input.event.generation
          }),
          ...base,
          targetVectorIndex: reentry.targetVectorIndex,
          changeClass: reentry.changeClass,
          reEntryPoint: reentry.reEntryPoint,
          constitutionalReentry: reentry,
          routeContractRefs: freezeStringArray(reentry.routeContractRefs),
          severity
        })
      ))
    );
  }
  if (
    input.event.decision === "retry_terminal_edge" ||
    input.event.decision === "reenter_at_vector"
  ) {
    const severity = "retry" as const;
    const targetVectorIndex = input.event.earliestReentryVectorIndex;
    if (targetVectorIndex === null) {
      return Object.freeze([]);
    }
    return Object.freeze([
      Object.freeze({
        kind: "graph_reentry_frontier_row",
        rowId: frontierRowId({
          basis: input.basis,
          foldbackRef: input.event.foldbackRef,
          severity,
          targetVectorIndex,
          changeClass: null,
          reEntryPoint: null,
          generation: input.event.generation
        }),
        ...base,
        targetVectorIndex,
        changeClass: null,
        reEntryPoint: null,
        constitutionalReentry: null,
        routeContractRefs: Object.freeze([]),
        severity
      })
    ]);
  }
  return Object.freeze([]);
}

export function deriveGraphReentryFrontierProjection(input: {
  readonly basis: ExecutionBasis;
  readonly events: readonly RuntimeEvent[];
}): GraphReentryFrontierProjection {
  const rows = new Map<string, GraphReentryFrontierRow>();
  let generation = 0;
  for (const event of input.events) {
    assertBasisEvent(input.basis, event);
    if (event.kind === "graph_span_foldback_evaluated") {
      assertBasisOwned(input.basis, event, "Graph span foldback event");
      generation = Math.max(generation, event.generation);
      if (event.decision === "close") {
        for (const [rowId, row] of rows.entries()) {
          if (
            row.terminalVectorIndex === event.terminalVectorIndex &&
            row.clearedByGeneration === null &&
            row.generation <= event.generation
          ) {
            rows.set(rowId, Object.freeze({ ...row, clearedByGeneration: event.generation }));
          }
        }
        continue;
      }
      for (const row of rowsForFoldbackEvent({ basis: input.basis, event })) {
        rows.set(row.rowId, row);
      }
    }
    if (event.kind === "graph_reentry_applied") {
      assertBasisOwned(input.basis, event, "Graph reentry applied event");
      generation = Math.max(generation, event.generation);
      for (const rowId of event.causingFrontierRowRefs) {
        const row = rows.get(rowId);
        if (row !== undefined && row.clearedByGeneration === null) {
          rows.set(rowId, Object.freeze({ ...row, clearedByGeneration: event.generation }));
        }
      }
    }
  }
  const activeRows = sortRows(
    [...rows.values()].filter((row) => row.clearedByGeneration === null)
  );
  const activeRow = activeRows[0] ?? null;
  const retryRows = activeRows.filter((row) => row.severity === "retry");
  const activeTargetVectorIndex =
    activeRow?.severity === "retry"
      ? activeRow.targetVectorIndex
      : activeRow?.severity === "constitutional_reentry"
        ? activeRow.targetVectorIndex
        : retryRows[0]?.targetVectorIndex ?? null;
  const decision: GraphReentryFrontierDecision =
    activeRow === null
      ? "advance"
      : activeRow.severity === "block"
        ? "block"
        : activeRow.severity === "constitutional_reentry"
          ? "constitutional_reentry"
          : activeRow.severity === "reprice"
            ? "reprice"
            : "reenter";
  const projection = {
    kind: "graph_reentry_frontier_projection",
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    generation,
    activeRows,
    activeTargetVectorIndex,
    activeReEntryPoint: activeRow?.reEntryPoint ?? null,
    activeChangeClass: activeRow?.changeClass ?? null,
    decision,
    projectionRef: ""
  } as const;
  return Object.freeze({
    ...projection,
    projectionRef: frontierRef({
      basis: input.basis,
      rows: activeRows,
      generation
    })
  });
}

export function deriveGraphReentryPlan(input: {
  readonly basis: ExecutionBasis;
  readonly runtimeProjection: RuntimeAggregateProjection;
  readonly frontier: GraphReentryFrontierProjection;
}): GraphReentryPlan | null {
  assertBasisOwned(input.basis, input.frontier, "Graph reentry frontier");
  if (input.runtimeProjection.basisId !== input.basis.id) {
    throw new TypeError("Graph reentry plan requires matching runtime projection");
  }
  const activeRows = input.frontier.activeRows;
  const activeRow = activeRows[0] ?? null;
  if (
    activeRow === null ||
    input.frontier.decision === "advance" ||
    input.frontier.decision === "block" ||
    input.frontier.decision === "reprice"
  ) {
    return null;
  }
  const causingFrontierRowRefs = freezeStringArray(
    activeRows
      .filter((row) => row.severity === activeRow.severity)
      .map((row) => row.rowId)
  );
  const plan: Omit<GraphReentryPlan, "planRef"> = Object.freeze({
    kind: "graph_reentry_plan",
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    fromTerminalVectorIndex: activeRow.terminalVectorIndex,
    targetVectorIndex: activeRow.targetVectorIndex,
    changeClass: activeRow.changeClass,
    reEntryPoint: activeRow.reEntryPoint,
    routeContractRefs: freezeStringArray(activeRow.routeContractRefs),
    generation: input.frontier.generation + 1,
    causingFrontierRowRefs,
    shadowedVectorIndexes: shadowedVectorIndexes(
      input.basis,
      activeRow.targetVectorIndex
    ),
    reason:
      activeRow.severity === "constitutional_reentry"
        ? "constitutional reentry frontier"
        : "graph span reentry frontier"
  });
  return Object.freeze({
    ...plan,
    planRef: planRefFor({
      basis: input.basis,
      frontier: input.frontier,
      rowRefs: causingFrontierRowRefs
    })
  });
}

export function constructGraphReentryPlannedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly plan: GraphReentryPlan;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}): GraphReentryPlannedEvent {
  assertBasisOwned(input.basis, input.plan, "Graph reentry plan");
  const lineage = runtimeLineageFields({
    basis: input.basis,
    causationEventRefs:
      input.causationEventRefs ?? input.plan.causingFrontierRowRefs,
    correlationId: input.correlationId ?? input.plan.planRef
  });
  return Object.freeze({
    kind: "graph_reentry_planned",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    frameLineageId: lineage.frameLineageId,
    graphFunctionId: input.basis.graphFunction.id,
    runId: lineage.runId,
    workKey: lineage.workKey,
    planRef: input.plan.planRef,
    fromTerminalVectorIndex: input.plan.fromTerminalVectorIndex,
    targetVectorIndex: input.plan.targetVectorIndex,
    changeClass: input.plan.changeClass,
    reEntryPoint: input.plan.reEntryPoint,
    routeContractRefs: freezeStringArray(input.plan.routeContractRefs),
    causingFrontierRowRefs: freezeStringArray(input.plan.causingFrontierRowRefs),
    shadowedVectorIndexes: freezeNumberArray(input.plan.shadowedVectorIndexes),
    causationEventRefs: lineage.causationEventRefs,
    correlationId: lineage.correlationId,
    reason: input.plan.reason,
    generation: input.plan.generation
  });
}

export function constructGraphReentryAppliedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly plan: GraphReentryPlan;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}): GraphReentryAppliedEvent {
  assertBasisOwned(input.basis, input.plan, "Graph reentry plan");
  const lineage = runtimeLineageFields({
    basis: input.basis,
    causationEventRefs:
      input.causationEventRefs ?? input.plan.causingFrontierRowRefs,
    correlationId: input.correlationId ?? input.plan.planRef
  });
  return Object.freeze({
    kind: "graph_reentry_applied",
    basisId: input.basis.id,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    frameLineageId: lineage.frameLineageId,
    graphFunctionId: input.basis.graphFunction.id,
    runId: lineage.runId,
    workKey: lineage.workKey,
    planRef: input.plan.planRef,
    targetVectorIndex: input.plan.targetVectorIndex,
    changeClass: input.plan.changeClass,
    reEntryPoint: input.plan.reEntryPoint,
    routeContractRefs: freezeStringArray(input.plan.routeContractRefs),
    causingFrontierRowRefs: freezeStringArray(input.plan.causingFrontierRowRefs),
    shadowedVectorIndexes: freezeNumberArray(input.plan.shadowedVectorIndexes),
    causationEventRefs: lineage.causationEventRefs,
    correlationId: lineage.correlationId,
    generation: input.plan.generation
  });
}

export function deriveAdvancementTransitionWithReentry(input: {
  readonly basis: ExecutionBasis;
  readonly runtimeProjection: RuntimeAggregateProjection;
  readonly frontier: GraphReentryFrontierProjection;
}): GraphReentryAdvanceDecision {
  if (input.frontier.decision === "advance") {
    return Object.freeze({
      kind: "default_iteration",
      decision: deriveIterationAdvanceDecision(input.basis, input.runtimeProjection)
    });
  }
  const activeRow = input.frontier.activeRows[0] ?? null;
  const frontierRefs = freezeStringArray([
    input.frontier.projectionRef,
    ...(activeRow?.rowId === undefined
      ? []
      : [activeRow.rowId])
  ]);
  if (input.frontier.decision === "block") {
    const outcome = deriveIterationOutcomeFromRows({
      vectorIndex: input.runtimeProjection.nextVectorIndex ?? 0,
      runtimeRows: [
        {
          boundary: "worker",
          status: "failed",
          reason: "runtime_failure",
          retryable: false,
          sourceProjectionRefs: frontierRefs
        }
      ]
    });
    if (outcome.kind !== "terminate" || outcome.disposition !== "blocked") {
      throw new TypeError("Graph reentry block frontier did not fold to block");
    }
    return Object.freeze({
      kind: "blocked",
      basis: input.basis,
      frontierRef: input.frontier.projectionRef,
      reason: "active graph reentry frontier is blocked"
    });
  }
  if (input.frontier.decision === "reprice") {
    const outcome = deriveIterationOutcomeFromRows({
      vectorIndex: input.runtimeProjection.nextVectorIndex ?? 0,
      satisfactionRows: [
        {
          authorityRef: input.frontier.projectionRef,
          status: "unsatisfied",
          reason: "missing_authority",
          lifecycle: "active",
          evidenceRefs: frontierRefs,
          sourceProjectionRefs: frontierRefs,
          reEntryPoint: "requirements"
        }
      ]
    });
    if (
      outcome.kind !== "terminate" ||
      outcome.disposition !== "blocked" ||
      outcome.reEntryPoint === null
    ) {
      throw new TypeError("Graph reentry reprice frontier did not fold to reprice");
    }
    return Object.freeze({
      kind: "reprice_required",
      basis: input.basis,
      frontierRef: input.frontier.projectionRef,
      reason: "active graph reentry frontier requires repricing"
    });
  }
  if (input.frontier.decision === "constitutional_reentry") {
    const changeClass = input.frontier.activeChangeClass;
    const reEntryPoint = input.frontier.activeReEntryPoint;
    if (changeClass === null || reEntryPoint === null) {
      throw new TypeError("Constitutional reentry frontier requires change class");
    }
    const activeRow = input.frontier.activeRows.find(
      (row) => row.severity === "constitutional_reentry"
    );
    const outcome = deriveIterationOutcomeFromRows({
      vectorIndex: input.runtimeProjection.nextVectorIndex ?? 0,
      redispatchTargetRows: [
        {
          target: {
            reEntryPoint,
            targetVectorIndex: null
          },
          reason: "missing_authority",
          retryable: true,
          provenanceChangeClass: changeClass,
          sourceProjectionRefs: frontierRefs
        }
      ]
    });
    if (outcome.kind !== "redispatch" || outcome.target.reEntryPoint !== reEntryPoint) {
      throw new TypeError(
        "Graph constitutional reentry frontier did not fold to redispatch"
      );
    }
    return Object.freeze({
      kind: "reenter_constitutional_route",
      basis: input.basis,
      changeClass,
      reEntryPoint,
      routeContractRefs: freezeStringArray(activeRow?.routeContractRefs ?? []),
      generation: input.frontier.generation,
      frontierRef: input.frontier.projectionRef
    });
  }
  if (input.frontier.decision === "reenter") {
    const targetVectorIndex = input.frontier.activeTargetVectorIndex;
    if (targetVectorIndex === null) {
      throw new TypeError("Graph reentry frontier requires target vector");
    }
    assertVectorIndexInRange(input.basis, targetVectorIndex);
    const outcome = deriveIterationOutcomeFromRows({
      vectorIndex: input.runtimeProjection.nextVectorIndex ?? targetVectorIndex,
      redispatchTargetRows: [
        {
          target: {
            reEntryPoint: "realization",
            targetVectorIndex
          },
          reason: "missing_evidence",
          retryable: true,
          provenanceChangeClass: "realization_refactor",
          sourceProjectionRefs: frontierRefs
        }
      ]
    });
    if (
      outcome.kind !== "redispatch" ||
      outcome.target.targetVectorIndex !== targetVectorIndex
    ) {
      throw new TypeError("Graph vector reentry frontier did not fold to redispatch");
    }
    return Object.freeze({
      kind: "reenter_graph_vector",
      basis: input.basis,
      vectorIndex: targetVectorIndex,
      edge: vectorEdge(input.basis, targetVectorIndex),
      generation: input.frontier.generation,
      frontierRef: input.frontier.projectionRef
    });
  }
  const exhaustive: never = input.frontier.decision;
  throw new TypeError(`Unsupported graph reentry frontier ${JSON.stringify(exhaustive)}`);
}

export function deriveGraphSpanFoldbackEvaluationFromEvents(input: {
  readonly basis: ExecutionBasis;
  readonly schedule: GraphSpanEvaluationSchedule;
  readonly events: readonly RuntimeEvent[];
  readonly edgeFoldbacks?: readonly ZoomFoldbackEvaluation[];
}): GraphSpanFoldbackEvaluation {
  const foldInput = {
    basis: input.basis,
    terminalVectorIndex: input.schedule.terminalVectorIndex,
    schedule: input.schedule,
    assessments: deriveGraphSpanAssessmentsFromEvents({
      basis: input.basis,
      events: input.events,
      terminalVectorIndex: input.schedule.terminalVectorIndex
    })
  };
  if (input.edgeFoldbacks === undefined) {
    return foldGraphSpanAssessments(foldInput);
  }
  return foldGraphSpanAssessments({
    ...foldInput,
    edgeFoldbacks: input.edgeFoldbacks
  });
}
