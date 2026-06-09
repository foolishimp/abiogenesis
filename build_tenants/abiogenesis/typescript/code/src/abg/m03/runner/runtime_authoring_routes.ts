// Implements: T-154
// Implements: REQ-R-ABG3-EVENTS
// Implements: REQ-R-ABG3-PROJECTION
// Implements: REQ-R-ABG3-CONTINUATION

import type {
  CanonicalRuntimeEvent,
  ExecutionBasis,
  GraphVectorResumeCursorAppliedEvent,
  RuntimeAggregateProjection,
  RuntimeEvent
} from "../contracts/carriers.js";
import {
  constructBasisAdmittedEvent,
  constructGraphVectorResumeCursorAppliedEvent
} from "../contracts/event_factories.js";
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
  type GraphSpanFoldbackEvaluation
} from "../contracts/graph_span_reentry.js";
import { deriveRuntimeAggregateProjection } from "../contracts/projection.js";
import { assertVectorIndexInRange } from "../contracts/runtime_support.js";
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

export function applyExplicitGraphVectorResumeCursor(
  input: ExplicitGraphVectorResumeCursorRequest
): ExplicitGraphVectorResumeCursorResult {
  assertVectorIndexInRange(input.basis, input.targetVectorIndex);
  const replayEvents = Object.freeze([...(input.runtimeEvents ?? Object.freeze([]))]);
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
  const replayEvents = Object.freeze([...(input.runtimeEvents ?? Object.freeze([]))]);
  const currentProjection = deriveRuntimeAggregateProjection(
    input.basis,
    replayEvents
  );
  const schedule = deriveEndpointSpanSchedule({
    basis: input.basis,
    terminalVectorIndex: input.terminalVectorIndex,
    closedVectorIndexes:
      input.closedVectorIndexes ?? currentProjection.closedVectorIndexes,
    generation: input.generation ?? 0
  });
  const foldbackInput = {
    basis: input.basis,
    terminalVectorIndex: input.terminalVectorIndex,
    schedule,
    assessments: input.assessments,
    ...(input.generation === undefined ? {} : { generation: input.generation })
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
  const transitionRef =
    plan?.planRef ??
    ("frontierRef" in transition
      ? transition.frontierRef
      : `default-iteration:${JSON.stringify({
          basisId: input.basis.id,
          nextVectorIndex: projection.nextVectorIndex
        })}`);
  return Object.freeze({
    kind: "graph_span_reentry_application_result",
    basis: input.basis,
    schedule,
    foldback,
    frontier,
    plan,
    transition,
    transitionRef,
    projection,
    emittedEvents: Object.freeze([...emittedSpanEvents, ...emittedReentryEvents]),
    replayEvents: nextReplayEvents
  } satisfies GraphSpanReentryApplicationResult);
}
