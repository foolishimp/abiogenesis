// Implements: T-128
// Implements: T-152
// Implements: REQ-R-ABG3-FP-CONSCIOUSNESS

import type {
  ConstructionDeltaObservedEvent,
  ConstructionGraphActionInvokedEvent,
  ConstructionPressurePackageMaterializedEvent,
  ExecutionBasis,
  GraphReentryAppliedEvent,
  GraphReentryPoint,
  RuntimeEvent
} from "../contracts/carriers.js";
import {
  GRAPH_REENTRY_POINT_VALUES
} from "../contracts/carriers.js";
import {
  constructBasisAdmittedEvent
} from "../contracts/event_factories.js";
import {
  constructGraphReentryAppliedEvent,
  constructGraphReentryPlannedEvent,
  type GraphReentryPlan
} from "../contracts/graph_span_reentry.js";
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
  assertVectorIndexInRange,
  frameIdForBasis,
  graphCallIdForBasis
} from "../contracts/runtime_support.js";
import { emit, type RuntimeEventSink } from "../events/index.js";
import type {
  EngineIterateRequest,
  EngineIterateResult
} from "./engine_runner.js";
import {
  runEngineIterate,
  runEngineIterateAsync
} from "./engine_runner.js";

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
  readonly preRunRuntimeEvents: readonly RuntimeEvent[];
  readonly reentryAppliedEvent: GraphReentryAppliedEvent | null;
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
  readonly reentryAppliedEvent: GraphReentryAppliedEvent | null;
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
  readonly graphRuntimeRegistryStartup?:
    | EngineIterateRequest["runtimeRegistryStartup"]
    | undefined;
  readonly graphInstructionAssemblyStartup?:
    | EngineIterateRequest["instructionAssemblyStartup"]
    | undefined;
  // T-195 P0-1: the remaining passthrough-family fields — a consequence
  // sub-run carries the SAME declared law as its parent (temporal
  // properties, carry-through, route bundle), never a subset.
  readonly graphTemporalPropertyStartup?:
    | EngineIterateRequest["temporalPropertyStartup"]
    | undefined;
  readonly graphRequirementProofCarryThroughStartup?:
    | EngineIterateRequest["requirementProofCarryThroughStartup"]
    | undefined;
  readonly graphRequirementRouteDeclarationBundle?:
    | EngineIterateRequest["requirementRouteDeclarationBundle"]
    | undefined;
  readonly maxAttachedFpAttempts?: number | undefined;
  readonly graphAssuranceProvider?:
    | EngineIterateRequest["assuranceProvider"]
    | undefined;
  readonly graphTargetCarrierDefaults?:
    | EngineIterateRequest["targetCarrierDefaults"]
    | undefined;
  readonly graphAbgFallbackBundle?:
    | EngineIterateRequest["abgFallbackBundle"]
    | undefined;
  readonly graphEdgeAssuranceDefaults?:
    | EngineIterateRequest["edgeAssuranceDefaults"]
    | undefined;
  readonly graphPluginTraversalObserverFallbackEnabled?:
    | EngineIterateRequest["pluginTraversalObserverFallbackEnabled"]
    | undefined;
  readonly graphPluginTraversalObserverFallbackKinds?:
    | EngineIterateRequest["pluginTraversalObserverFallbackKinds"]
    | undefined;
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
  // T-200: spine events key on the C-call identity (REQ-R-ABG3-CCALL-004)
  // — kind alone would collide across the calls of one edge program.
  if ("cCallRef" in event) {
    return `${event.kind}:${event.cCallRef}:${index}`;
  }
  if ("outcomeRef" in event) {
    return event.outcomeRef;
  }
  if ("validationRef" in event) {
    return `${event.kind}:${event.validationRef}`;
  }
  if ("authoritySnapshotRef" in event) {
    return `${event.kind}:${event.authoritySnapshotRef}`;
  }
  if ("ambiguityRef" in event) {
    return `${event.kind}:${event.ambiguityRef}`;
  }
  if ("evidenceRef" in event && "payloadRef" in event) {
    return `${event.kind}:${event.payloadRef}:${event.authorityRef ?? "none"}:${event.evidenceRef}`;
  }
  if ("closureInputRef" in event) {
    return `${event.kind}:${event.closureInputRef}`;
  }
  if ("manifestRef" in event) {
    return `${event.kind}:${event.manifestRef}`;
  }
  if ("payloadRef" in event) {
    return `${event.kind}:${event.payloadRef}`;
  }
  if ("actorInvocationId" in event) {
    return `${event.kind}:${event.actorInvocationId}:${index}`;
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

const GRAPH_REENTRY_TARGET_REF_PATTERN =
  /^graph-reentry-point:\/\/([^/]+)\/([0-9]+)$/u;

function isGraphReentryPoint(value: string): value is GraphReentryPoint {
  return GRAPH_REENTRY_POINT_VALUES.some((candidate) => candidate === value);
}

function parseConstructionReentryTargetRef(ref: string): {
  readonly graphReentryPoint: GraphReentryPoint;
  readonly targetVectorIndex: number;
} {
  const match = GRAPH_REENTRY_TARGET_REF_PATTERN.exec(ref);
  if (match === null) {
    throw new TypeError(
      `Construction re-entry target ref must be graph-reentry-point://<point>/<vectorIndex>, got ${JSON.stringify(ref)}`
    );
  }
  const graphReentryPoint = match[1] ?? "";
  if (!isGraphReentryPoint(graphReentryPoint)) {
    throw new TypeError(
      `Construction re-entry target ref names unsupported GraphReentryPoint ${JSON.stringify(graphReentryPoint)}`
    );
  }
  return Object.freeze({
    graphReentryPoint,
    targetVectorIndex: Number(match[2])
  });
}

function hasBasisAdmittedEvent(
  basis: ExecutionBasis,
  events: readonly RuntimeEvent[]
): boolean {
  return events.some(
    (event) => event.kind === "basis_admitted" && event.basisId === basis.id
  );
}

function shadowedVectorIndexes(
  basis: ExecutionBasis,
  targetVectorIndex: number
): readonly number[] {
  const indexes: number[] = [];
  for (
    let index = targetVectorIndex;
    index < basis.graph.vectors.length;
    index += 1
  ) {
    indexes.push(index);
  }
  return Object.freeze(indexes);
}

function constructionReentryPlan(input: {
  readonly request: ConstructionIntentRunnerRequest;
  readonly invocationEvents: ConstructionInvocationEvents;
  readonly targetVectorIndex: number;
  readonly graphReentryPoint: GraphReentryPoint;
}): GraphReentryPlan {
  assertVectorIndexInRange(input.request.graphActionBasis, input.targetVectorIndex);
  const lastVectorIndex = input.request.graphActionBasis.graph.vectors.length - 1;
  assertVectorIndexInRange(input.request.graphActionBasis, lastVectorIndex);
  return Object.freeze({
    kind: "graph_reentry_plan",
    planRef: `graph-reentry-plan:construction:${input.request.admittedIntent.intentId}:${input.targetVectorIndex}`,
    basisId: input.request.graphActionBasis.id,
    graphFunctionId: input.request.graphActionBasis.graphFunction.id,
    fromTerminalVectorIndex: lastVectorIndex,
    targetVectorIndex: input.targetVectorIndex,
    changeClass: null,
    reEntryPoint: input.graphReentryPoint,
    routeContractRefs: Object.freeze([
      input.request.admittedIntent.selectedActionRef
    ]),
    generation: 1,
    causingFrontierRowRefs: Object.freeze([
      input.invocationEvents.invokedEvent.constructionEventRef
    ]),
    shadowedVectorIndexes: shadowedVectorIndexes(
      input.request.graphActionBasis,
      input.targetVectorIndex
    ),
    reason: "construction reenter_graph_span"
  });
}

function applySelectedConstructionReentry(input: {
  readonly request: ConstructionIntentRunnerRequest;
  readonly invocationEvents: ConstructionInvocationEvents;
}): {
  readonly runtimeEvents: readonly RuntimeEvent[];
  readonly emittedEvents: readonly RuntimeEvent[];
  readonly reentryAppliedEvent: GraphReentryAppliedEvent | null;
} {
  const graphRuntimeEvents = Object.freeze([
    ...(input.request.graphRuntimeEvents ?? Object.freeze([]))
  ]);
  const selectedAction = input.request.actionCatalog.rows.find(
    (row) =>
      row.actionRef === input.request.admittedIntent.selectedActionRef
  );
  if (selectedAction?.actionKind !== "reenter_graph_span") {
    return Object.freeze({
      runtimeEvents: graphRuntimeEvents,
      emittedEvents: Object.freeze([]),
      reentryAppliedEvent: null
    });
  }
  const targetReentryRef = input.request.admittedIntent.selectedReentryRef;
  if (targetReentryRef === null) {
    throw new TypeError(
      "Construction reenter_graph_span action requires an admitted target re-entry ref"
    );
  }
  const reentryTarget = parseConstructionReentryTargetRef(targetReentryRef);
  const targetVector =
    input.request.graphActionBasis.graph.vectors[reentryTarget.targetVectorIndex];
  if (targetVector === undefined) {
    throw new TypeError(
      `Construction re-entry target vector index ${reentryTarget.targetVectorIndex} is outside graph vector range`
    );
  }
  if (
    input.request.admittedIntent.selectedVectorRef !== targetVector.id &&
    input.request.admittedIntent.selectedVectorRef !== targetVector.name
  ) {
    throw new TypeError(
      "Construction re-entry target vector contradicts admitted graph vector identity"
    );
  }
  const plan = constructionReentryPlan({
    request: input.request,
    invocationEvents: input.invocationEvents,
    targetVectorIndex: reentryTarget.targetVectorIndex,
    graphReentryPoint: reentryTarget.graphReentryPoint
  });
  const plannedEvent = constructGraphReentryPlannedEvent({
    basis: input.request.graphActionBasis,
    plan,
    causationEventRefs: [input.invocationEvents.invokedEvent.constructionEventRef],
    correlationId: input.invocationEvents.invokedEvent.correlationId
  });
  const appliedEvent = constructGraphReentryAppliedEvent({
    basis: input.request.graphActionBasis,
    plan,
    causationEventRefs: [plannedEvent.planRef],
    correlationId: input.invocationEvents.invokedEvent.correlationId
  });
  const preRunEvents = Object.freeze([
    ...(hasBasisAdmittedEvent(input.request.graphActionBasis, graphRuntimeEvents)
      ? []
      : [constructBasisAdmittedEvent(input.request.graphActionBasis)]),
    plannedEvent,
    appliedEvent
  ]);
  const emittedEvents = emit(preRunEvents, input.request.eventSink);
  return Object.freeze({
    runtimeEvents: Object.freeze([...graphRuntimeEvents, ...emittedEvents]),
    emittedEvents,
    reentryAppliedEvent: appliedEvent
  });
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

function selectedGraphFunctionRefMatchesBasis(input: {
  readonly selectedGraphFunctionRef: string | null;
  readonly basis: ExecutionBasis;
}): boolean {
  return (
    input.selectedGraphFunctionRef === input.basis.graphFunction.id ||
    input.selectedGraphFunctionRef === input.basis.graphFunction.name
  );
}

export function deriveConstructionEffectPlan(
  request: ConstructionIntentRunnerRequest
): ConstructionRuntimeEffectPlanDerivation {
  if (
    !selectedGraphFunctionRefMatchesBasis({
      selectedGraphFunctionRef: request.admittedIntent.selectedGraphFunctionRef,
      basis: request.graphActionBasis
    })
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
  readonly preRunEmittedEvents?: readonly RuntimeEvent[] | undefined;
  readonly reentryMoved?: boolean | undefined;
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
    runtimeEventRefs: [
      ...(input.preRunEmittedEvents ?? Object.freeze([])),
      ...graphActionResult.emittedEvents
    ].map(runtimeEventRef),
    reentryMoved:
      input.reentryMoved ??
      graphActionResult.emittedEvents.some(
        (event) => event.kind === "graph_reentry_applied"
      ),
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
  const selectedReentry = applySelectedConstructionReentry({
    request,
    invocationEvents
  });
  const runtimeEventsForEngine =
    selectedReentry.runtimeEvents.length === 0
      ? undefined
      : selectedReentry.runtimeEvents;
  const graphActionResult = runEngineIterate({
    basis: request.graphActionBasis,
    ...(runtimeEventsForEngine === undefined
      ? {}
      : { runtimeEvents: runtimeEventsForEngine }),
    ...(request.graphRuntimeRegistryStartup === undefined
      ? {}
      : { runtimeRegistryStartup: request.graphRuntimeRegistryStartup }),
    ...(request.graphInstructionAssemblyStartup === undefined
      ? {}
      : { instructionAssemblyStartup: request.graphInstructionAssemblyStartup }),
    ...(request.graphTemporalPropertyStartup === undefined
      ? {}
      : { temporalPropertyStartup: request.graphTemporalPropertyStartup }),
    ...(request.graphRequirementProofCarryThroughStartup === undefined
      ? {}
      : {
          requirementProofCarryThroughStartup:
            request.graphRequirementProofCarryThroughStartup
        }),
    ...(request.graphRequirementRouteDeclarationBundle === undefined
      ? {}
      : {
          requirementRouteDeclarationBundle:
            request.graphRequirementRouteDeclarationBundle
        }),
    eventSink: request.eventSink,
    plugins: request.graphRunnerPlugins,
    maxAttachedFpAttempts: request.maxAttachedFpAttempts,
    assuranceProvider: request.graphAssuranceProvider,
    targetCarrierDefaults: request.graphTargetCarrierDefaults,
    abgFallbackBundle: request.graphAbgFallbackBundle,
    edgeAssuranceDefaults: request.graphEdgeAssuranceDefaults,
    pluginTraversalObserverFallbackEnabled:
      request.graphPluginTraversalObserverFallbackEnabled,
    pluginTraversalObserverFallbackKinds:
      request.graphPluginTraversalObserverFallbackKinds,
    constructionPressurePackage: planDerivation.plan.pressurePackage
  });
  const deltaEvent = deriveConstructionDeltaFromGraphResult({
    plan: planDerivation.plan,
    invokedEvent: invocationEvents.invokedEvent,
    preRunEmittedEvents: selectedReentry.emittedEvents,
    reentryMoved: selectedReentry.reentryAppliedEvent !== null,
    graphActionResult,
    cursor: invocationEvents.nextCursor
  });
  const deltaEmittedEvents = emit(deltaEvent, request.eventSink);
  return Object.freeze({
    kind: "construction_runtime_effect_result",
    graphActionResult,
    preRunRuntimeEvents: selectedReentry.runtimeEvents,
    reentryAppliedEvent: selectedReentry.reentryAppliedEvent,
    deltaEvent,
    emittedEvents: Object.freeze([
      ...initialEmittedEvents,
      ...selectedReentry.emittedEvents,
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

export async function runConstructionEffectPlanAsync(input: {
  readonly request: ConstructionIntentRunnerRequest;
  readonly planDerivation: ConstructionRuntimeEffectPlanDerivation;
  readonly invocationEvents: ConstructionInvocationEvents;
}): Promise<ConstructionRuntimeEffectResult> {
  const { request, planDerivation, invocationEvents } = input;
  const initialEmittedEvents = emit(
    [invocationEvents.pressurePackageEvent, invocationEvents.invokedEvent],
    request.eventSink
  );
  const selectedReentry = applySelectedConstructionReentry({
    request,
    invocationEvents
  });
  const runtimeEventsForEngine =
    selectedReentry.runtimeEvents.length === 0
      ? undefined
      : selectedReentry.runtimeEvents;
  const graphActionResult = await runEngineIterateAsync({
    basis: request.graphActionBasis,
    ...(runtimeEventsForEngine === undefined
      ? {}
      : { runtimeEvents: runtimeEventsForEngine }),
    ...(request.graphRuntimeRegistryStartup === undefined
      ? {}
      : { runtimeRegistryStartup: request.graphRuntimeRegistryStartup }),
    ...(request.graphInstructionAssemblyStartup === undefined
      ? {}
      : { instructionAssemblyStartup: request.graphInstructionAssemblyStartup }),
    eventSink: request.eventSink,
    plugins: request.graphRunnerPlugins,
    maxAttachedFpAttempts: request.maxAttachedFpAttempts,
    assuranceProvider: request.graphAssuranceProvider,
    targetCarrierDefaults: request.graphTargetCarrierDefaults,
    abgFallbackBundle: request.graphAbgFallbackBundle,
    edgeAssuranceDefaults: request.graphEdgeAssuranceDefaults,
    pluginTraversalObserverFallbackEnabled:
      request.graphPluginTraversalObserverFallbackEnabled,
    pluginTraversalObserverFallbackKinds:
      request.graphPluginTraversalObserverFallbackKinds,
    constructionPressurePackage: planDerivation.plan.pressurePackage
  });
  const deltaEvent = deriveConstructionDeltaFromGraphResult({
    plan: planDerivation.plan,
    invokedEvent: invocationEvents.invokedEvent,
    preRunEmittedEvents: selectedReentry.emittedEvents,
    reentryMoved: selectedReentry.reentryAppliedEvent !== null,
    graphActionResult,
    cursor: invocationEvents.nextCursor
  });
  const deltaEmittedEvents = emit(deltaEvent, request.eventSink);
  return Object.freeze({
    kind: "construction_runtime_effect_result",
    graphActionResult,
    preRunRuntimeEvents: selectedReentry.runtimeEvents,
    reentryAppliedEvent: selectedReentry.reentryAppliedEvent,
    deltaEvent,
    emittedEvents: Object.freeze([
      ...initialEmittedEvents,
      ...selectedReentry.emittedEvents,
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
    reentryAppliedEvent: effectResult.reentryAppliedEvent,
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

export async function runConstructionIntentStepAsync(
  request: ConstructionIntentRunnerRequest
): Promise<ConstructionRunnerStepOutcome> {
  const planDerivation = deriveConstructionEffectPlan(request);
  const invocationEvents = materializeConstructionInvocationEvents(
    planDerivation.plan
  );
  const effectResult = await runConstructionEffectPlanAsync({
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
