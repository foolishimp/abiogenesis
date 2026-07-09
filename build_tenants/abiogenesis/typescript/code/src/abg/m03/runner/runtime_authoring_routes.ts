// Implements: T-154
// Implements: REQ-R-ABG3-EVENTS
// Implements: REQ-R-ABG3-PROJECTION
// Implements: REQ-R-ABG3-CONTINUATION

import type {
  CanonicalRuntimeEvent,
  DeclarationRepriceAdmittedEvent,
  ExecutionBasis,
  GraphChangeClass,
  GraphVectorResumeCursorAppliedEvent,
  RuntimeAggregateProjection,
  RuntimeEvent
} from "../contracts/carriers.js";
import {
  constructBasisAdmittedEvent,
  constructDeclarationRepriceAdmittedEvent,
  constructGraphVectorResumeCursorAppliedEvent
} from "../contracts/event_factories.js";
import {
  deriveFrozenLawPredicate,
  type FrozenLawPredicate
} from "../contracts/declaration_reprice.js";
import {
  deriveRuntimeContinuationTransitionProjectionFromDisposition,
  type RuntimeContinuationTransitionProjection
} from "../contracts/continuation_transition.js";
import {
  constructGraphReentryAppliedEvent,
  constructGraphReentryPlannedEvent,
  constructGraphSpanAssessedEvent,
  constructGraphSpanEvaluationScheduledEvent,
  constructGraphSpanFoldbackEvaluatedEvent,
  deriveAdvancementTransitionWithReentry,
  deriveEndpointSpanSchedule,
  deriveGraphReentryFrontierProjection,
  deriveGraphReentryPlan,
  foldGraphSpanAssessments,
  type GraphReentryAdvanceDecision,
  type GraphReentryFrontierProjection,
  type GraphReentryPlan,
  type GraphSpanAssessment,
  type GraphSpanEvaluationSchedule,
  type GraphSpanFoldbackEvaluation,
  type GraphSpanRef
} from "../contracts/graph_span_reentry.js";
import { deriveRuntimeAggregateProjection } from "../contracts/projection.js";
import {
  assertVectorIndexInRange,
  runtimeEventsForBasis
} from "../contracts/runtime_support.js";
import type { ZoomFoldbackEvaluation } from "../contracts/workspace_zoom_foldback.js";
import { emit, type RuntimeEventSink } from "../events/index.js";

export interface ExplicitGraphVectorResumeCursorRequest {
  readonly basis: ExecutionBasis;
  readonly runtimeEvents?: readonly RuntimeEvent[] | undefined;
  readonly eventSink: RuntimeEventSink;
  readonly targetVectorIndex: number;
  readonly reason: string;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}

export interface ExplicitGraphVectorResumeCursorResult {
  readonly kind: "explicit_graph_vector_resume_cursor_result";
  readonly basis: ExecutionBasis;
  readonly cursorEvent: GraphVectorResumeCursorAppliedEvent;
  readonly transitionRef: string;
  readonly targetVectorIndex: number;
  readonly projection: RuntimeAggregateProjection;
  readonly emittedEvents: readonly CanonicalRuntimeEvent[];
  readonly replayEvents: readonly RuntimeEvent[];
}

export interface GraphSpanReentryApplicationRequest {
  readonly basis: ExecutionBasis;
  readonly runtimeEvents?: readonly RuntimeEvent[] | undefined;
  readonly eventSink: RuntimeEventSink;
  readonly terminalVectorIndex: number;
  readonly assessments: readonly GraphSpanAssessment[];
  readonly closedVectorIndexes?: readonly number[] | undefined;
  readonly edgeFoldbacks?: readonly ZoomFoldbackEvaluation[] | undefined;
  readonly generation?: number | undefined;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}

export interface GraphSpanReentryApplicationResult {
  readonly kind: "graph_span_reentry_application_result";
  readonly basis: ExecutionBasis;
  readonly schedule: GraphSpanEvaluationSchedule;
  readonly foldback: GraphSpanFoldbackEvaluation;
  readonly frontier: GraphReentryFrontierProjection;
  readonly plan: GraphReentryPlan | null;
  readonly transition: GraphReentryAdvanceDecision;
  readonly transitionProjection: RuntimeContinuationTransitionProjection;
  readonly transitionRef: string;
  readonly projection: RuntimeAggregateProjection;
  readonly emittedEvents: readonly CanonicalRuntimeEvent[];
  readonly replayEvents: readonly RuntimeEvent[];
}

function hasBasisAdmittedEvent(
  basis: ExecutionBasis,
  events: readonly RuntimeEvent[]
): boolean {
  return events.some(
    (event) => event.kind === "basis_admitted" && event.basisId === basis.id
  );
}

function withBasisAdmission(
  basis: ExecutionBasis,
  replayEvents: readonly RuntimeEvent[],
  events: readonly RuntimeEvent[]
): readonly RuntimeEvent[] {
  if (hasBasisAdmittedEvent(basis, replayEvents)) {
    return events;
  }
  return Object.freeze([constructBasisAdmittedEvent(basis), ...events]);
}

function appendEmittedReplay(
  replayEvents: readonly RuntimeEvent[],
  emittedEvents: readonly CanonicalRuntimeEvent[]
): readonly RuntimeEvent[] {
  return Object.freeze([...replayEvents, ...emittedEvents]);
}

function graphSpanRefFromAssessment(input: {
  readonly basis: ExecutionBasis;
  readonly terminalVectorIndex: number;
  readonly assessment: GraphSpanAssessment;
}): GraphSpanRef {
  assertVectorIndexInRange(input.basis, input.assessment.sourceVectorIndex);
  assertVectorIndexInRange(input.basis, input.assessment.terminalVectorIndex);
  if (input.assessment.terminalVectorIndex !== input.terminalVectorIndex) {
    throw new TypeError("Graph span route assessment terminal must match route terminal");
  }
  return Object.freeze({
    kind: "graph_span_ref",
    spanId: input.assessment.spanId,
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    sourceVectorIndex: input.assessment.sourceVectorIndex,
    terminalVectorIndex: input.assessment.terminalVectorIndex,
    sourceNodeRef: input.assessment.sourceNodeRef,
    terminalNodeRef: input.assessment.terminalNodeRef,
    coveredVectorIndexes: input.assessment.coveredVectorIndexes
  });
}

function deriveAssessmentSpanSchedule(input: {
  readonly basis: ExecutionBasis;
  readonly terminalVectorIndex: number;
  readonly assessments: readonly GraphSpanAssessment[];
  readonly generation: number;
}): GraphSpanEvaluationSchedule {
  if (input.assessments.length === 0) {
    throw new TypeError("Graph span route requires assessment candidates");
  }
  const spanRefsById = new Map<string, GraphSpanRef>();
  for (const assessment of input.assessments) {
    const span = graphSpanRefFromAssessment({
      basis: input.basis,
      terminalVectorIndex: input.terminalVectorIndex,
      assessment
    });
    spanRefsById.set(span.spanId, span);
  }
  const spanRefs = Object.freeze(
    [...spanRefsById.values()].sort(
      (left, right) => right.sourceVectorIndex - left.sourceVectorIndex
    )
  );
  return Object.freeze({
    kind: "graph_span_evaluation_schedule",
    scheduleRef: `graph-span-schedule:${JSON.stringify({
      basisId: input.basis.id,
      terminalVectorIndex: input.terminalVectorIndex,
      generation: input.generation,
      spans: spanRefs.map((span) => span.spanId)
    })}`,
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    terminalVectorIndex: input.terminalVectorIndex,
    spanRefs,
    generation: input.generation
  });
}

function graphSpanTransitionProjection(input: {
  readonly basis: ExecutionBasis;
  readonly runtimeProjection: RuntimeAggregateProjection;
  readonly terminalVectorIndex: number;
  readonly frontier: GraphReentryFrontierProjection;
  readonly transition: GraphReentryAdvanceDecision;
}): RuntimeContinuationTransitionProjection {
  const frontierRefs = Object.freeze([input.frontier.projectionRef]);
  switch (input.transition.kind) {
    case "default_iteration": {
      if (input.transition.decision.kind === "advance_vector") {
        return deriveRuntimeContinuationTransitionProjectionFromDisposition({
          basis: input.basis,
          runtimeProjection: input.runtimeProjection,
          vectorIndex: input.transition.decision.vectorIndex,
          disposition: "advance_vector",
          reason: "default_iteration_advance",
          reasonRefs: frontierRefs,
          sourceProjectionRefs: frontierRefs
        });
      }
      return deriveRuntimeContinuationTransitionProjectionFromDisposition({
        basis: input.basis,
        runtimeProjection: input.runtimeProjection,
        vectorIndex: input.terminalVectorIndex,
        disposition: "close",
        reason: "edge_close",
        reasonRefs: frontierRefs,
        sourceProjectionRefs: frontierRefs
      });
    }
    case "reenter_graph_vector":
      return deriveRuntimeContinuationTransitionProjectionFromDisposition({
        basis: input.basis,
        runtimeProjection: input.runtimeProjection,
        vectorIndex: input.transition.vectorIndex,
        disposition: "retry_same_edge",
        reason: "graph_reentry",
        reasonRefs: frontierRefs,
        evidenceRefs: [input.transition.frontierRef],
        sourceProjectionRefs: frontierRefs
      });
    case "reenter_constitutional_route":
      return deriveRuntimeContinuationTransitionProjectionFromDisposition({
        basis: input.basis,
        runtimeProjection: input.runtimeProjection,
        vectorIndex: input.terminalVectorIndex,
        disposition: "reprice",
        reason: "graph_reentry",
        reasonRefs: frontierRefs,
        evidenceRefs: input.transition.routeContractRefs,
        sourceProjectionRefs: frontierRefs
      });
    case "reprice_required":
      return deriveRuntimeContinuationTransitionProjectionFromDisposition({
        basis: input.basis,
        runtimeProjection: input.runtimeProjection,
        vectorIndex: input.terminalVectorIndex,
        disposition: "reprice",
        reason: "graph_reentry",
        reasonRefs: frontierRefs,
        evidenceRefs: [input.transition.frontierRef],
        sourceProjectionRefs: frontierRefs
      });
    case "blocked":
      return deriveRuntimeContinuationTransitionProjectionFromDisposition({
        basis: input.basis,
        runtimeProjection: input.runtimeProjection,
        vectorIndex: input.terminalVectorIndex,
        disposition: "block",
        reason: "graph_reentry",
        reasonRefs: frontierRefs,
        evidenceRefs: [input.transition.frontierRef],
        sourceProjectionRefs: frontierRefs
      });
    default: {
      const exhaustive: never = input.transition;
      throw new TypeError(`Unsupported graph-span transition ${JSON.stringify(exhaustive)}`);
    }
  }
}

export interface DeclarationRepriceAdmissionRequest {
  readonly basis: ExecutionBasis;
  readonly runtimeEvents?: readonly RuntimeEvent[] | undefined;
  readonly eventSink: RuntimeEventSink;
  readonly declarationRef: string;
  readonly beforeDigest: string;
  readonly afterDigest: string;
  readonly changeClass: GraphChangeClass;
  readonly owningTicketRef: string;
  readonly operatorActorRef: string;
  readonly reason: string;
  readonly causationEventRefs?: readonly string[] | undefined;
  readonly correlationId?: string | undefined;
}

export interface DeclarationRepriceAdmissionResult {
  readonly kind: "declaration_reprice_admission_result";
  readonly basis: ExecutionBasis;
  readonly repriceEvent: DeclarationRepriceAdmittedEvent;
  readonly repriceRef: string;
  readonly frozenLaw: FrozenLawPredicate;
  readonly emittedEvents: readonly CanonicalRuntimeEvent[];
  readonly replayEvents: readonly RuntimeEvent[];
}

// Implements: REQ-R-ABG3-WITNESS-003 — the operator seam that admits a
// declaration reprice ahead of resume. This route is the kernel carrier the
// operator-grammar command adapts (WITNESS-009); the returned predicate is
// the WITNESS-004 frozen-law truth AFTER this admission.
export function admitDeclarationReprice(
  input: DeclarationRepriceAdmissionRequest
): DeclarationRepriceAdmissionResult {
  const replayEvents = runtimeEventsForBasis(
    input.basis,
    input.runtimeEvents ?? Object.freeze([])
  );
  const repriceEvent = constructDeclarationRepriceAdmittedEvent({
    basisId: input.basis.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    declarationRef: input.declarationRef,
    beforeDigest: input.beforeDigest,
    afterDigest: input.afterDigest,
    changeClass: input.changeClass,
    owningTicketRef: input.owningTicketRef,
    operatorActorRef: input.operatorActorRef,
    reason: input.reason,
    causationEventRefs: input.causationEventRefs,
    correlationId: input.correlationId
  });
  const emittedEvents = emit(
    withBasisAdmission(input.basis, replayEvents, Object.freeze([repriceEvent])),
    input.eventSink
  );
  const nextReplayEvents = appendEmittedReplay(replayEvents, emittedEvents);
  return Object.freeze({
    kind: "declaration_reprice_admission_result",
    basis: input.basis,
    repriceEvent,
    repriceRef: repriceEvent.repriceRef,
    frozenLaw: deriveFrozenLawPredicate(nextReplayEvents),
    emittedEvents,
    replayEvents: nextReplayEvents
  } satisfies DeclarationRepriceAdmissionResult);
}

export function applyExplicitGraphVectorResumeCursor(
  input: ExplicitGraphVectorResumeCursorRequest
): ExplicitGraphVectorResumeCursorResult {
  assertVectorIndexInRange(input.basis, input.targetVectorIndex);
  const replayEvents = runtimeEventsForBasis(
    input.basis,
    input.runtimeEvents ?? Object.freeze([])
  );
  const cursorEvent = constructGraphVectorResumeCursorAppliedEvent({
    basis: input.basis,
    targetVectorIndex: input.targetVectorIndex,
    reason: input.reason,
    causationEventRefs: input.causationEventRefs,
    correlationId: input.correlationId
  });
  const emittedEvents = emit(
    withBasisAdmission(input.basis, replayEvents, Object.freeze([cursorEvent])),
    input.eventSink
  );
  const nextReplayEvents = appendEmittedReplay(replayEvents, emittedEvents);
  const projection = deriveRuntimeAggregateProjection(input.basis, nextReplayEvents);
  return Object.freeze({
    kind: "explicit_graph_vector_resume_cursor_result",
    basis: input.basis,
    cursorEvent,
    transitionRef: cursorEvent.resumeCursorRef,
    targetVectorIndex: input.targetVectorIndex,
    projection,
    emittedEvents,
    replayEvents: nextReplayEvents
  } satisfies ExplicitGraphVectorResumeCursorResult);
}

export function applyGraphSpanReentryRoute(
  input: GraphSpanReentryApplicationRequest
): GraphSpanReentryApplicationResult {
  assertVectorIndexInRange(input.basis, input.terminalVectorIndex);
  const replayEvents = runtimeEventsForBasis(
    input.basis,
    input.runtimeEvents ?? Object.freeze([])
  );
  const generation = input.generation ?? 0;
  const schedule =
    input.closedVectorIndexes === undefined
      ? deriveAssessmentSpanSchedule({
          basis: input.basis,
          terminalVectorIndex: input.terminalVectorIndex,
          assessments: input.assessments,
          generation
        })
      : deriveEndpointSpanSchedule({
          basis: input.basis,
          terminalVectorIndex: input.terminalVectorIndex,
          closedVectorIndexes: input.closedVectorIndexes,
          generation
        });
  const foldbackInput = {
    basis: input.basis,
    terminalVectorIndex: input.terminalVectorIndex,
    schedule,
    assessments: input.assessments,
    ...(input.generation === undefined ? {} : { generation })
  };
  const foldback = foldGraphSpanAssessments(
    input.edgeFoldbacks === undefined
      ? foldbackInput
      : {
          ...foldbackInput,
          edgeFoldbacks: input.edgeFoldbacks
        }
  );
  const scheduleAndFoldEvents = Object.freeze([
    constructGraphSpanEvaluationScheduledEvent({
      basis: input.basis,
      schedule,
      causationEventRefs: input.causationEventRefs,
      correlationId: input.correlationId
    }),
    ...input.assessments.map((assessment) =>
      constructGraphSpanAssessedEvent({
        basis: input.basis,
        assessment,
        causationEventRefs: input.causationEventRefs
      })
    ),
    constructGraphSpanFoldbackEvaluatedEvent({
      basis: input.basis,
      foldback,
      causationEventRefs: input.causationEventRefs
    })
  ]);
  const emittedSpanEvents = emit(
    withBasisAdmission(input.basis, replayEvents, scheduleAndFoldEvents),
    input.eventSink
  );
  let nextReplayEvents = appendEmittedReplay(replayEvents, emittedSpanEvents);
  let projection = deriveRuntimeAggregateProjection(input.basis, nextReplayEvents);
  const frontier = deriveGraphReentryFrontierProjection({
    basis: input.basis,
    events: nextReplayEvents
  });
  const plan = deriveGraphReentryPlan({
    basis: input.basis,
    runtimeProjection: projection,
    frontier
  });
  let emittedReentryEvents: readonly CanonicalRuntimeEvent[] = Object.freeze([]);
  if (plan !== null) {
    emittedReentryEvents = emit(
      Object.freeze([
        constructGraphReentryPlannedEvent({ basis: input.basis, plan }),
        constructGraphReentryAppliedEvent({ basis: input.basis, plan })
      ]),
      input.eventSink
    );
    nextReplayEvents = appendEmittedReplay(nextReplayEvents, emittedReentryEvents);
    projection = deriveRuntimeAggregateProjection(input.basis, nextReplayEvents);
  }
  const transition = deriveAdvancementTransitionWithReentry({
    basis: input.basis,
    runtimeProjection: projection,
    frontier
  });
  const transitionProjection = graphSpanTransitionProjection({
    basis: input.basis,
    runtimeProjection: projection,
    terminalVectorIndex: input.terminalVectorIndex,
    frontier,
    transition
  });
  return Object.freeze({
    kind: "graph_span_reentry_application_result",
    basis: input.basis,
    schedule,
    foldback,
    frontier,
    plan,
    transition,
    transitionProjection,
    transitionRef: transitionProjection.projectionRef,
    projection,
    emittedEvents: Object.freeze([...emittedSpanEvents, ...emittedReentryEvents]),
    replayEvents: nextReplayEvents
  } satisfies GraphSpanReentryApplicationResult);
}
