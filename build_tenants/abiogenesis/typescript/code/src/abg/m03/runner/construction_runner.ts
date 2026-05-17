// Implements: T-128
// Implements: REQ-R-ABG3-FP-CONSCIOUSNESS

import type {
  ConstructionDeltaObservedEvent,
  ConstructionGraphActionInvokedEvent,
  ConstructionPressurePackageMaterializedEvent,
  ExecutionBasis,
  RuntimeEvent
} from "../contracts/carriers.js";
import type { ConstructionActionCatalogProjection } from "../contracts/construction_action_catalog.js";
import type {
  AdmittedConstructionIntent,
  ConstructionIntentAdmission
} from "../contracts/construction_intent.js";
import {
  selectAdmittedConstructionIntentByPriority
} from "../contracts/construction_intent.js";
import type { ConstructionPriorityProjection } from "../contracts/construction_priority.js";
import type { ConstructionProgressLedger } from "../contracts/construction_progress.js";
import {
  deriveConstructionProgressLedgerFromDeltaEvents
} from "../contracts/construction_progress.js";
import type { ConstructionProjection } from "../contracts/construction_projection.js";
import {
  deriveConstructionProjection
} from "../contracts/construction_projection.js";
import {
  constructConstructionDeltaObservedEvent,
  constructConstructionGraphActionInvokedEvent
} from "../contracts/construction_runtime_events.js";
import { admitConstructionRuntimeEvents } from "../contracts/construction_event_causality.js";
import type { ConstructionObservationSnapshot } from "../contracts/construction_observation.js";
import type {
  ConstructionPressurePackage,
  ConstructionPressureProjection
} from "../contracts/construction_pressure_package.js";
import {
  admitConstructionPressurePackage,
  assertConstructionPressurePackageAdmitted,
  constructConstructionPressurePackageMaterializedEvent,
  deriveConstructionPressurePackage,
  deriveConstructionPressureProjection
} from "../contracts/construction_pressure_package.js";
import { deriveRuntimeAggregateProjection } from "../contracts/projection.js";
import { sourceProjectionRef } from "../contracts/projection.js";
import {
  frameIdForBasis,
  graphCallIdForBasis
} from "../contracts/runtime_support.js";
import { emit, type RuntimeEventSink } from "../events/index.js";
import type {
  EngineIterateRequest,
  EngineIterateResult
} from "./engine_runner.js";
import { runEngineIterate } from "./engine_runner.js";

export type ConstructionRunnerStepStatus =
  | "progressed"
  | "closed"
  | "blocked"
  | "stalled";

export interface ConstructionRuntimeEffectPlan {
  readonly kind: "construction_runtime_effect_plan";
  readonly basis: ExecutionBasis;
  readonly graphActionBasis: ExecutionBasis;
  readonly admittedIntent: AdmittedConstructionIntent;
  readonly beforeConstructionProjection: ConstructionProjection;
  readonly beforeRuntimeProjectionRef: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly continuationId: string | null;
  readonly eventSequence: number;
  readonly attemptOrdinal: number;
  readonly pressurePackage: ConstructionPressurePackage;
}

export interface ConstructionRuntimeEffectPlanDerivation {
  readonly kind: "construction_runtime_effect_plan_derivation";
  readonly plan: ConstructionRuntimeEffectPlan;
  readonly constructionReplayEvents: readonly RuntimeEvent[];
}

export interface ConstructionInvocationEvents {
  readonly kind: "construction_invocation_events";
  readonly pressurePackageEvent: ConstructionPressurePackageMaterializedEvent;
  readonly invokedEvent: ConstructionGraphActionInvokedEvent;
  readonly nextCursor: ConstructionEventSequenceCursor;
}

export interface ConstructionRuntimeEffectResult {
  readonly kind: "construction_runtime_effect_result";
  readonly graphActionResult: EngineIterateResult;
  readonly deltaEvent: ConstructionDeltaObservedEvent;
  readonly emittedEvents: readonly RuntimeEvent[];
  readonly constructionReplayEvents: readonly RuntimeEvent[];
}

export interface ConstructionRunnerStepOutcome {
  readonly kind: "construction_runner_step_outcome";
  readonly status: ConstructionRunnerStepStatus;
  readonly admittedIntent: AdmittedConstructionIntent;
  readonly runtimeEffectPlan: ConstructionRuntimeEffectPlan;
  readonly graphActionResult: EngineIterateResult;
  readonly pressurePackage: ConstructionPressurePackage;
  readonly pressurePackageEvent: RuntimeEvent;
  readonly invokedEvent: ConstructionGraphActionInvokedEvent;
  readonly deltaEvent: ConstructionDeltaObservedEvent;
  readonly constructionProjection: ConstructionProjection;
  readonly pressureProjection: ConstructionPressureProjection;
  readonly progressLedger: ConstructionProgressLedger;
  readonly emittedEvents: readonly RuntimeEvent[];
  readonly constructionReplayEvents: readonly RuntimeEvent[];
}

interface ConstructionEventSequenceCursor {
  readonly next: number;
}

export interface ConstructionIntentRunnerRequest {
  readonly basis: ExecutionBasis;
  readonly graphActionBasis: ExecutionBasis;
  readonly observation: ConstructionObservationSnapshot;
  readonly admittedIntent: AdmittedConstructionIntent;
  readonly admissions: readonly ConstructionIntentAdmission[];
  readonly priorityProjection: ConstructionPriorityProjection;
  readonly actionCatalog: ConstructionActionCatalogProjection;
  readonly constructionEvents: readonly RuntimeEvent[];
  readonly eventSink: RuntimeEventSink;
  readonly graphRuntimeEvents?: readonly RuntimeEvent[] | undefined;
  readonly graphRunnerPlugins?: EngineIterateRequest["plugins"] | undefined;
  readonly maxAttachedFpAttempts?: number | undefined;
}

function maxConstructionEventSequence(events: readonly RuntimeEvent[]): number {
  let max = -1;
  for (const event of events) {
    if ("eventSequence" in event && typeof event.eventSequence === "number") {
      max = Math.max(max, event.eventSequence);
    }
  }
  return max;
}

function sequenceCursorAfter(
  events: readonly RuntimeEvent[]
): ConstructionEventSequenceCursor {
  return Object.freeze({ next: maxConstructionEventSequence(events) + 1 });
}

function takeEventSequence(
  cursor: ConstructionEventSequenceCursor
): readonly [number, ConstructionEventSequenceCursor] {
  return Object.freeze([cursor.next, Object.freeze({ next: cursor.next + 1 })]);
}

function nextAttemptOrdinal(input: {
  readonly intentId: string;
  readonly constructionEvents: readonly RuntimeEvent[];
}): number {
  let max = -1;
  for (const event of input.constructionEvents) {
    if (
      event.kind === "construction_delta_observed" &&
      event.intentId === input.intentId
    ) {
      max = Math.max(max, event.attemptOrdinal);
    }
  }
  return max + 1;
}

function runtimeEventRef(event: RuntimeEvent, index: number): string {
  if ("constructionEventRef" in event) {
    return event.constructionEventRef;
  }
  if ("outcomeRef" in event) {
    return event.outcomeRef;
  }
  if ("actorInvocationId" in event) {
    return `${event.kind}:${event.actorInvocationId}`;
  }
  if ("graphCallId" in event && event.graphCallId !== null) {
    return `${event.kind}:${event.graphCallId}:${index}`;
  }
  return `${event.kind}:${index}`;
}

function constructionStatusForProjection(
  projection: ConstructionProjection
): ConstructionRunnerStepStatus {
  switch (projection.publicState) {
    case "construction_closed":
      return "closed";
    case "construction_stalled":
      return "stalled";
    case "construction_blocked":
    case "construction_review_required":
    case "construction_escalated":
    case "fh_input_required":
    case "ticket_created":
    case "reprice_required":
      return "blocked";
    case "construction_progressing_yield":
      return "progressed";
    default:
      {
        const exhaustive: never = projection.publicState;
        throw new TypeError(`Unsupported construction projection state ${exhaustive}`);
      }
  }
}

function assertSelectedIntent(input: {
  readonly admittedIntent: AdmittedConstructionIntent;
  readonly admissions: readonly ConstructionIntentAdmission[];
  readonly priorityProjection: ConstructionPriorityProjection;
}): void {
  const selected = selectAdmittedConstructionIntentByPriority({
    admissions: input.admissions,
    priorityProjection: input.priorityProjection
  });
  if (selected === null || selected.intentId !== input.admittedIntent.intentId) {
    throw new TypeError(
      "Construction runner requires the selected admitted construction intent"
    );
  }
}

export function deriveConstructionEffectPlan(
  request: ConstructionIntentRunnerRequest
): ConstructionRuntimeEffectPlanDerivation {
  if (
    request.admittedIntent.selectedGraphFunctionRef !==
    request.graphActionBasis.graphFunction.id
  ) {
    throw new TypeError(
      "Construction runner graph action basis contradicts admitted construction intent"
    );
  }
  assertSelectedIntent({
    admittedIntent: request.admittedIntent,
    admissions: request.admissions,
    priorityProjection: request.priorityProjection
  });
  const constructionReplayEvents = Object.freeze([
    ...admitConstructionRuntimeEvents({
      episodeId: request.admittedIntent.episodeId,
      events: request.constructionEvents
    })
  ]);
  const beforeProgressLedger = deriveConstructionProgressLedgerFromDeltaEvents({
    episodeId: request.admittedIntent.episodeId,
    events: constructionReplayEvents
  });
  const beforeConstructionProjection = deriveConstructionProjection({
    episodeId: request.admittedIntent.episodeId,
    priorityProjection: request.priorityProjection,
    admissions: request.admissions,
    actionCatalog: request.actionCatalog,
    progressLedger: beforeProgressLedger
  });
  const eventSequence = sequenceCursorAfter(constructionReplayEvents).next;
  const attemptOrdinal = nextAttemptOrdinal({
    intentId: request.admittedIntent.intentId,
    constructionEvents: constructionReplayEvents
  });
  const graphRuntimeProjection = deriveRuntimeAggregateProjection(
    request.graphActionBasis,
    request.graphRuntimeEvents ?? Object.freeze([])
  );
  const beforeRuntimeProjectionRef = sourceProjectionRef(graphRuntimeProjection);
  const pressurePackage = deriveConstructionPressurePackage({
    basis: request.basis,
    observation: request.observation,
    admittedIntent: request.admittedIntent,
    actionCatalog: request.actionCatalog,
    constructionProjection: beforeConstructionProjection,
    runtimeProjection: graphRuntimeProjection,
    runtimeProjectionRef: beforeRuntimeProjectionRef,
    runtimeEvents: request.graphRuntimeEvents ?? Object.freeze([])
  });
  assertConstructionPressurePackageAdmitted(
    admitConstructionPressurePackage({ pressurePackage })
  );
  return Object.freeze({
    kind: "construction_runtime_effect_plan_derivation",
    plan: Object.freeze({
      kind: "construction_runtime_effect_plan",
      basis: request.basis,
      graphActionBasis: request.graphActionBasis,
      admittedIntent: request.admittedIntent,
      beforeConstructionProjection,
      beforeRuntimeProjectionRef,
      graphCallId: graphCallIdForBasis(request.graphActionBasis),
      frameId: frameIdForBasis(request.graphActionBasis),
      continuationId: null,
      eventSequence,
      attemptOrdinal,
      pressurePackage
    } satisfies ConstructionRuntimeEffectPlan),
    constructionReplayEvents
  });
}

export function materializeConstructionInvocationEvents(
  plan: ConstructionRuntimeEffectPlan
): ConstructionInvocationEvents {
  const [pressurePackageSequence, afterPressurePackage] = takeEventSequence(
    Object.freeze({ next: plan.eventSequence })
  );
  const [invokedSequence, nextCursor] = takeEventSequence(afterPressurePackage);
  const pressurePackageEvent = constructConstructionPressurePackageMaterializedEvent({
    constructionEventRef: `construction-event:${plan.admittedIntent.intentId}:pressure-package:${plan.attemptOrdinal}`,
    admittedIntent: plan.admittedIntent,
    pressurePackage: plan.pressurePackage,
    basisId: plan.basis.id,
    graphFunctionId: plan.basis.graphFunction.id,
    runId: plan.basis.runId,
    workKey: plan.basis.workKey,
    eventSequence: pressurePackageSequence
  });
  const invokedEvent = constructConstructionGraphActionInvokedEvent({
    constructionEventRef: `construction-event:${plan.admittedIntent.intentId}:graph-action:${plan.attemptOrdinal}`,
    admittedIntent: plan.admittedIntent,
    basisId: plan.basis.id,
    graphFunctionId: plan.basis.graphFunction.id,
    runId: plan.basis.runId,
    workKey: plan.basis.workKey,
    eventSequence: invokedSequence,
    graphCallId: plan.graphCallId,
    frameId: plan.frameId,
    continuationId: plan.continuationId,
    causationEventRefs: [pressurePackageEvent.constructionEventRef]
  });
  return Object.freeze({
    kind: "construction_invocation_events",
    pressurePackageEvent,
    invokedEvent,
    nextCursor
  });
}

export function deriveConstructionDeltaFromGraphResult(input: {
  readonly plan: ConstructionRuntimeEffectPlan;
  readonly invokedEvent: ConstructionGraphActionInvokedEvent;
  readonly graphActionResult: EngineIterateResult;
  readonly cursor: ConstructionEventSequenceCursor;
}): ConstructionDeltaObservedEvent {
  const { plan, invokedEvent, graphActionResult } = input;
  const [deltaSequence] = takeEventSequence(input.cursor);
  const afterRuntimeProjectionRef = sourceProjectionRef(graphActionResult.projection);
  const graphClosed =
    graphActionResult.transition.kind === "terminal" &&
    graphActionResult.transition.terminalKind === "converged";
  return constructConstructionDeltaObservedEvent({
    constructionEventRef: `construction-event:${plan.admittedIntent.intentId}:delta:${plan.attemptOrdinal}`,
    invokedEvent,
    eventSequence: deltaSequence,
    attemptOrdinal: plan.attemptOrdinal,
    deltaRef: `construction-delta:${plan.admittedIntent.intentId}:${plan.attemptOrdinal}`,
    assetDeltaRefs: graphClosed
      ? [`construction-asset-delta:${plan.admittedIntent.selectedOutcomeRef}`]
      : [],
    runtimeEventRefs: graphActionResult.emittedEvents.map(runtimeEventRef),
    beforeProjectionRef: plan.beforeConstructionProjection.projectionRef,
    afterProjectionRef: afterRuntimeProjectionRef,
    artifactDigestBefore: plan.beforeRuntimeProjectionRef,
    artifactDigestAfter: afterRuntimeProjectionRef,
    fulfilledObligationRefs: graphClosed
      ? [plan.admittedIntent.selectedOutcomeRef]
      : [],
    remainingObligationRefs: graphClosed
      ? []
      : [plan.admittedIntent.selectedOutcomeRef],
    newEvidenceRefs: [afterRuntimeProjectionRef],
    closed: graphClosed
  });
}

export function runConstructionEffectPlan(input: {
  readonly request: ConstructionIntentRunnerRequest;
  readonly planDerivation: ConstructionRuntimeEffectPlanDerivation;
  readonly invocationEvents: ConstructionInvocationEvents;
}): ConstructionRuntimeEffectResult {
  const { request, planDerivation, invocationEvents } = input;
  const initialEmittedEvents = emit(
    [invocationEvents.pressurePackageEvent, invocationEvents.invokedEvent],
    request.eventSink
  );
  const graphActionResult = runEngineIterate({
    basis: request.graphActionBasis,
    runtimeEvents: request.graphRuntimeEvents,
    eventSink: request.eventSink,
    plugins: request.graphRunnerPlugins,
    maxAttachedFpAttempts: request.maxAttachedFpAttempts,
    constructionPressurePackage: planDerivation.plan.pressurePackage
  });
  const deltaEvent = deriveConstructionDeltaFromGraphResult({
    plan: planDerivation.plan,
    invokedEvent: invocationEvents.invokedEvent,
    graphActionResult,
    cursor: invocationEvents.nextCursor
  });
  const deltaEmittedEvents = emit(deltaEvent, request.eventSink);
  return Object.freeze({
    kind: "construction_runtime_effect_result",
    graphActionResult,
    deltaEvent,
    emittedEvents: Object.freeze([
      ...initialEmittedEvents,
      ...graphActionResult.emittedEvents,
      ...deltaEmittedEvents
    ]),
    constructionReplayEvents: Object.freeze([
      ...planDerivation.constructionReplayEvents,
      invocationEvents.pressurePackageEvent,
      invocationEvents.invokedEvent,
      deltaEvent
    ])
  });
}

export function composeConstructionRunnerOutcome(input: {
  readonly request: ConstructionIntentRunnerRequest;
  readonly planDerivation: ConstructionRuntimeEffectPlanDerivation;
  readonly invocationEvents: ConstructionInvocationEvents;
  readonly effectResult: ConstructionRuntimeEffectResult;
}): ConstructionRunnerStepOutcome {
  const { request, planDerivation, invocationEvents, effectResult } = input;
  const plan = planDerivation.plan;
  admitConstructionRuntimeEvents({
    episodeId: request.admittedIntent.episodeId,
    events: effectResult.constructionReplayEvents
  });
  const progressLedger = deriveConstructionProgressLedgerFromDeltaEvents({
    episodeId: request.admittedIntent.episodeId,
    events: effectResult.constructionReplayEvents
  });
  const constructionProjection = deriveConstructionProjection({
    episodeId: request.admittedIntent.episodeId,
    priorityProjection: request.priorityProjection,
    admissions: request.admissions,
    actionCatalog: request.actionCatalog,
    progressLedger,
    sourceProjectionRefs: [
      request.priorityProjection.projectionRef,
      sourceProjectionRef(effectResult.graphActionResult.projection)
    ]
  });
  const pressureProjection = deriveConstructionPressureProjection({
    episodeId: request.admittedIntent.episodeId,
    events: effectResult.constructionReplayEvents
  });
  return Object.freeze({
    kind: "construction_runner_step_outcome",
    status: constructionStatusForProjection(constructionProjection),
    admittedIntent: request.admittedIntent,
    runtimeEffectPlan: plan,
    graphActionResult: effectResult.graphActionResult,
    pressurePackage: plan.pressurePackage,
    pressurePackageEvent: invocationEvents.pressurePackageEvent,
    invokedEvent: invocationEvents.invokedEvent,
    deltaEvent: effectResult.deltaEvent,
    constructionProjection,
    pressureProjection,
    progressLedger,
    emittedEvents: effectResult.emittedEvents,
    constructionReplayEvents: effectResult.constructionReplayEvents
  });
}

export function runConstructionIntentStep(
  request: ConstructionIntentRunnerRequest
): ConstructionRunnerStepOutcome {
  const planDerivation = deriveConstructionEffectPlan(request);
  const invocationEvents = materializeConstructionInvocationEvents(
    planDerivation.plan
  );
  const effectResult = runConstructionEffectPlan({
    request,
    planDerivation,
    invocationEvents
  });
  return composeConstructionRunnerOutcome({
    request,
    planDerivation,
    invocationEvents,
    effectResult
  });
}
