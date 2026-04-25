// Implements: REQ-P-POLICY
// Implements: REQ-P-POLICY-004
// Implements: REQ-P-POLICY-008
// Implements: REQ-P-POLICY-009
// Implements: REQ-P-POLICY-011
// Implements: REQ-P-POLICY-012
// Implements: REQ-P-POLICY-013

import type {
  RuntimeAggregateProjection,
  RuntimeEvent,
  RuntimeEventSink
} from "../../../abg/m03/index.js";
import {
  admitExecutionBasis,
  deriveRuntimeAggregateProjection
} from "../../../abg/m03/index.js";
import { assertRuntimeEventSink, publicStartFromRequest } from "../public_start.js";
import type { PublicStartContext } from "../public_start.js";
import { admitPublicControlLoopRequest } from "./admission.js";
import { constructPublicControlLoopOutcome } from "./constructors.js";
import type {
  PublicControlLoopOutcome,
  PublicControlLoopRequest
} from "./carriers.js";
import { constructRejectedPublicStartOutcome } from "../contracts/index.js";
import type {
  PublicControlModes,
  PublicStartOutcome
} from "../contracts/carriers.js";

interface ControlLoopRouteBinding {
  readonly controlModes: PublicControlModes;
}

function constructControlLoopRouteBinding(
  controlModes: PublicControlModes
): ControlLoopRouteBinding {
  return Object.freeze({
    controlModes
  });
}

interface PublicStartStep {
  readonly outcome: PublicStartOutcome;
  readonly replayEvents: readonly RuntimeEvent[];
}

interface ControlLoopState {
  readonly outcomes: readonly PublicStartOutcome[];
  readonly replayEvents: readonly RuntimeEvent[];
  readonly projection: RuntimeAggregateProjection;
  readonly callCount: number;
}

function runtimeProjectionForControlLoop(
  request: PublicControlLoopRequest,
  context: PublicStartContext,
  replayEvents: readonly RuntimeEvent[]
): RuntimeAggregateProjection {
  const basis = admitExecutionBasis({
    startIntent: request.startRequest.startIntent,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runId: context.runId ?? null,
    workKey: context.workKey ?? null,
    frameId: context.frameId ?? null,
    frameLineageId: context.frameLineageId ?? null
  });
  return deriveRuntimeAggregateProjection(basis, replayEvents);
}

function rejectControlLoop(
  outcomes: readonly PublicStartOutcome[],
  context: PublicStartContext,
  reason: string
): readonly PublicStartOutcome[] {
  return Object.freeze([
    ...outcomes,
    constructRejectedPublicStartOutcome(reason, context.runtimeIdentity)
  ]);
}

function runPublicStartStep(
  request: PublicControlLoopRequest,
  context: PublicStartContext,
  replayEvents: readonly RuntimeEvent[],
  eventSink: RuntimeEventSink
): PublicStartStep {
  const emitted: RuntimeEvent[] = [];
  const stepSink: RuntimeEventSink = (event) => {
    emitted.push(event);
    eventSink(event);
  };
  const outcome = publicStartFromRequest(
    request.startRequest,
    {
      ...context,
      runtimeEvents: replayEvents
    },
    stepSink
  );
  return Object.freeze({
    outcome,
    replayEvents: Object.freeze([...replayEvents, ...emitted])
  });
}

function requireProgressForAdvancedStep(
  prior: RuntimeAggregateProjection,
  next: RuntimeAggregateProjection,
  outcome: PublicStartOutcome
): void {
  if (
    outcome.kind === "advanced" &&
    next.closedVectorIndexes.length <= prior.closedVectorIndexes.length
  ) {
    throw new TypeError(
      "control loop rejects advanced public-start outcome without replay-derived vector progress"
    );
  }
}

function continueSupervisedControlLoop(
  request: PublicControlLoopRequest,
  context: PublicStartContext,
  eventSink: RuntimeEventSink,
  state: ControlLoopState,
  maxPublicStartCalls: number
): readonly PublicStartOutcome[] {
  const last = state.outcomes.at(-1);
  if (last?.kind !== "advanced") {
    return state.outcomes;
  }
  if (state.callCount >= maxPublicStartCalls) {
    return rejectControlLoop(
      state.outcomes,
      context,
      "control loop exceeded replay-derived graph traversal bound"
    );
  }
  const next = runPublicStartStep(
    request,
    context,
    state.replayEvents,
    eventSink
  );
  const nextProjection = runtimeProjectionForControlLoop(
    request,
    context,
    next.replayEvents
  );
  requireProgressForAdvancedStep(state.projection, nextProjection, next.outcome);
  return continueSupervisedControlLoop(
    request,
    context,
    eventSink,
    Object.freeze({
      outcomes: Object.freeze([...state.outcomes, next.outcome]),
      replayEvents: next.replayEvents,
      projection: nextProjection,
      callCount: state.callCount + 1
    }),
    maxPublicStartCalls
  );
}

function runControlLoop(
  request: PublicControlLoopRequest,
  context: PublicStartContext,
  eventSink: RuntimeEventSink
): readonly PublicStartOutcome[] {
  const binding = constructControlLoopRouteBinding(request.startRequest.controlModes);
  const initialReplayEvents = Object.freeze([...(context.runtimeEvents ?? [])]);
  const initialProjection = runtimeProjectionForControlLoop(
    request,
    context,
    initialReplayEvents
  );
  const first = runPublicStartStep(
    request,
    context,
    initialReplayEvents,
    eventSink
  );
  const firstProjection = runtimeProjectionForControlLoop(
    request,
    context,
    first.replayEvents
  );
  const firstOutcomes = Object.freeze([first.outcome]);
  requireProgressForAdvancedStep(initialProjection, firstProjection, first.outcome);

  if (binding.controlModes.rootMode !== "supervised") {
    return firstOutcomes;
  }

  const remainingAdvanceCount =
    initialProjection.vectorCount - initialProjection.closedVectorIndexes.length;
  return continueSupervisedControlLoop(
    request,
    context,
    eventSink,
    Object.freeze({
      outcomes: firstOutcomes,
      replayEvents: first.replayEvents,
      projection: firstProjection,
      callCount: 1
    }),
    remainingAdvanceCount + 1
  );
}

export function publicControlLoopFromRequest(
  request: PublicControlLoopRequest,
  context: PublicStartContext,
  eventSink: RuntimeEventSink
): PublicControlLoopOutcome {
  const sink = assertRuntimeEventSink(eventSink);
  const outcomes = runControlLoop(request, context, sink);
  return constructPublicControlLoopOutcome(
    outcomes,
    request.startRequest.controlModes
  );
}

export function publicControlLoop(
  input: unknown,
  context: PublicStartContext,
  eventSink: RuntimeEventSink
): PublicControlLoopOutcome {
  const request = admitPublicControlLoopRequest(input);
  return publicControlLoopFromRequest(request, context, eventSink);
}
