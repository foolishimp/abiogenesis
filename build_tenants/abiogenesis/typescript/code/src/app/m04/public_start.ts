// Implements: REQ-P-POLICY
// Implements: REQ-P-POLICY-004
// Implements: REQ-P-POLICY-008
// Implements: REQ-P-POLICY-009
// Implements: REQ-P-POLICY-011
// Implements: REQ-P-POLICY-012
// Implements: REQ-P-POLICY-013

import {
  admitExecutionBasis,
  constructVectorClosedEvent,
  constructVectorEvaluatedEvent,
  deriveAdvancementTransition,
  deriveIterationAdvanceDecision,
  deriveRuntimeAggregateProjection,
  emit,
  runtimeEventsForIterationDecision,
  runtimeEventsForTransition,
  type ExecutionBasisAdmissionInput,
  type RuntimeEvent,
  type RuntimeEventSink
} from "../../abg/m03/index.js";
import type { Module } from "../../gtl/m02/contracts/carriers.js";
import { admitPublicStartRequest } from "./admission/index.js";
import {
  constructPublicStartOutcome,
  constructRejectedPublicStartOutcome
} from "./contracts/index.js";
import type { PublicStartOutcome, PublicStartRequest } from "./contracts/carriers.js";

interface KernelRouteBinding {
  readonly startIntent: PublicStartRequest["startIntent"];
  readonly module: Module;
  readonly runtimeIdentity: ExecutionBasisAdmissionInput["runtimeIdentity"];
  readonly resolvedPolicy: ExecutionBasisAdmissionInput["resolvedPolicy"];
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly frameId: string | null;
  readonly frameLineageId: string | null;
}

export interface PublicStartContext {
  readonly module: Module;
  readonly runtimeIdentity: ExecutionBasisAdmissionInput["runtimeIdentity"];
  readonly resolvedPolicy: ExecutionBasisAdmissionInput["resolvedPolicy"];
  readonly runtimeEvents?: readonly RuntimeEvent[];
  readonly runId?: string | null;
  readonly workKey?: string | null;
  readonly frameId?: string | null;
  readonly frameLineageId?: string | null;
}

export function assertRuntimeEventSink(
  eventSink: RuntimeEventSink | undefined
): RuntimeEventSink {
  if (typeof eventSink !== "function") {
    throw new TypeError(
      "publicStart.eventSink must be provided explicitly to preserve runtime observability"
    );
  }
  return eventSink;
}

function selectorMismatchReason(
  request: PublicStartRequest,
  runtimeIdentity: PublicStartContext["runtimeIdentity"]
): string | null {
  const selector = request.runtimeSelector;
  if (selector === null) {
    return null;
  }
  if (
    selector.workerRef !== null &&
    selector.workerRef !== runtimeIdentity.workerId
  ) {
    return "configured worker selector does not match resolved runtime identity";
  }
  if (
    selector.runtimeRef !== null &&
    selector.runtimeRef !== runtimeIdentity.resolvedRuntimeRef
  ) {
    return "configured runtime selector does not match resolved runtime identity";
  }
  return null;
}

function bindKernelRoute(
  request: PublicStartRequest,
  context: PublicStartContext
): KernelRouteBinding {
  return Object.freeze({
    startIntent: request.startIntent,
    module: context.module,
    runtimeIdentity: context.runtimeIdentity,
    resolvedPolicy: context.resolvedPolicy,
    runId: context.runId ?? null,
    workKey: context.workKey ?? null,
    frameId: context.frameId ?? null,
    frameLineageId: context.frameLineageId ?? null
  });
}

function runtimeEventsForPublicExecution(
  basis: ReturnType<typeof admitExecutionBasis>,
  transition: ReturnType<typeof deriveAdvancementTransition>,
  replayEvents: readonly RuntimeEvent[]
): readonly RuntimeEvent[] {
  const transitionEvents = runtimeEventsForTransition(basis, transition);
  const projection = deriveRuntimeAggregateProjection(basis, replayEvents);
  const decision = deriveIterationAdvanceDecision(basis, projection);

  if (decision.kind === "converged") {
    return transitionEvents;
  }

  const iterationEvents = runtimeEventsForIterationDecision(decision);
  const basisEvent = transitionEvents[0];
  if (basisEvent === undefined) {
    throw new TypeError("public execution requires basis admission event");
  }
  const transitionFacts = transitionEvents.slice(1);
  if (transition.kind !== "fd_advance") {
    return Object.freeze([
      basisEvent,
      ...iterationEvents,
      ...transitionFacts
    ]);
  }

  return Object.freeze([
    basisEvent,
    ...iterationEvents,
    constructVectorEvaluatedEvent({
      basis,
      vectorIndex: transition.vectorIndex,
      status: "accepted"
    }),
    constructVectorClosedEvent({
      basis,
      vectorIndex: transition.vectorIndex,
      closureKind: "advanced"
    }),
    ...transitionFacts
  ]);
}

export function publicStartFromRequest(
  request: PublicStartRequest,
  context: PublicStartContext,
  eventSink: RuntimeEventSink
): PublicStartOutcome {
  const sink = assertRuntimeEventSink(eventSink);
  const mismatchReason = selectorMismatchReason(request, context.runtimeIdentity);

  if (mismatchReason !== null) {
    return constructRejectedPublicStartOutcome(
      mismatchReason,
      context.runtimeIdentity
    );
  }

  const binding = bindKernelRoute(request, context);
  const basis = admitExecutionBasis(binding);
  const replayEvents = context.runtimeEvents ?? Object.freeze([]);
  const transition = deriveAdvancementTransition(basis, replayEvents);
  const emitted = emit(
    runtimeEventsForPublicExecution(basis, transition, replayEvents),
    sink
  );

  return constructPublicStartOutcome(
    basis,
    transition,
    emitted,
    request.startIntent.until
  );
}

export function publicStart(
  input: unknown,
  context: PublicStartContext,
  eventSink: RuntimeEventSink
): PublicStartOutcome {
  const request = admitPublicStartRequest(input);
  return publicStartFromRequest(request, context, eventSink);
}
