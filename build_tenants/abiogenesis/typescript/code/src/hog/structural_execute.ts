import {
  admitRetryAttempt,
  admitRoute,
  replay,
  type AbgEventStore,
  type RetryAdmissionRefusal,
  type RouteAdmissionRefusal,
} from "../abg/index.js";
import {
  applyRoute,
  traverseFromCursor,
  type TraversalRefusal,
  type TraversalStep,
  type TraversalStopRef,
  type TraverseInput,
} from "./traversal.js";
import {
  proposeStructuralRoute,
  type RouteProposalRefusal,
} from "./traversal_route.js";

export interface StructuralTraversalClock {
  readonly eventTime: string;
  readonly correlationId: string;
}

export interface AdvanceStructuralTraversalInput extends TraverseInput {
  readonly store: AbgEventStore;
  readonly initial: TraversalStep;
  readonly clock: StructuralTraversalClock;
}

export type StructuralTraversalResult =
  | RouteAdmissionRefusal
  | RouteProposalRefusal
  | RetryAdmissionRefusal
  | TraversalRefusal
  | TraversalStep
  | TraversalStopRef;

function isDescendingStructuralStep(step: TraversalStep): boolean {
  return step.directStep.stepKind === "enter_term" ||
    step.directStep.stepKind === "start_task" ||
    step.directStep.stepKind === "retry";
}

export function advanceStructuralTraversal(
  input: AdvanceStructuralTraversalInput,
): StructuralTraversalResult {
  let current: StructuralTraversalResult = input.initial;
  let routeOrdinal = 0;
  while (current.kind === "traversal_step" && isDescendingStructuralStep(current)) {
    const replayState = replay(input.store, {
      runId: input.openedTraversalScope.runId,
    });
    const candidate = proposeStructuralRoute(input.graph, current, replayState);
    if (candidate.kind !== "traversal_route_candidate") return candidate;
    const route = admitRoute(
      input.store,
      input.executionBasis,
      input.graph,
      current.sourceCursor,
      current.targetCursor,
      replayState,
      candidate,
      {
        eventTime: input.clock.eventTime,
        correlationId: `${input.clock.correlationId}/route/${routeOrdinal}`,
        causationEventRefs: [],
      },
    );
    if (route.kind !== "admitted_traversal_route") return route;
    if (current.directStep.stepKind === "retry") {
      if (current.targetCursor === null) {
        return {
          kind: "retry_admission_refusal",
          schemaVersion: "5.0.0",
          disposition: "refused",
          code: "cursor_mismatch",
          message: "structural retry step has no target cursor",
        };
      }
      const attempt = admitRetryAttempt(
        input.store,
        input.executionBasis,
        input.graph,
        current.targetCursor,
        route.admissionEventRef,
        {
          eventTime: input.clock.eventTime,
          correlationId:
            `${input.clock.correlationId}/route/${routeOrdinal}/retry-attempt`,
          causationEventRefs: [],
        },
      );
      if (attempt.kind !== "retry_attempt_admission") return attempt;
    }
    const target = applyRoute(current, route);
    if (target.kind === "traversal_refusal") return target;
    current = traverseFromCursor(input, target);
    routeOrdinal += 1;
  }
  return current;
}
