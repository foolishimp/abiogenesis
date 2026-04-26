// Implements: REQ-R-ABG3-INTERPRET
// Implements: REQ-R-ABG3-EVENTS
// Implements: REQ-R-ABG3-RUN
// Implements: REQ-R-ABG3-CONVERGENCE

import { admitExecutionBasis } from "../admission/index.js";
import type { ExecutionBasisAdmissionInput } from "../admission/index.js";
import type {
  AdvancementTransition,
  ExecutionBasis,
  RuntimeAggregateProjection,
  RuntimeEvent,
  TerminalTransition
} from "../contracts/carriers.js";
import {
  constructBasisAdmittedEvent,
  constructFdAdvanceReadyEvent,
  constructFhEscalatedEvent,
  constructFpDispatchRequestedEvent,
  constructTerminalReachedEvent,
  constructVectorClosedEvent,
  constructVectorEvaluatedEvent
} from "../contracts/event_factories.js";
import {
  deriveAdvancementTransition,
  deriveIterationAdvanceDecision,
  runtimeEventsForIterationDecision
} from "../contracts/iteration.js";
import { deriveRuntimeAggregateProjection } from "../contracts/projection.js";
import {
  admitFdEvaluationOutcome,
  admitFhAdmissionOutcome,
  admitFpDispatchOutcome,
  constructEnginePluginInput,
  defaultFdEvaluatorPlugin,
  defaultFhAdmissionPlugin,
  defaultFpDispatchPlugin,
  type EngineRunnerPluginSet,
  type FdEvaluatorPlugin,
  type FhAdmissionPlugin,
  type FpDispatchPlugin
} from "../contracts/plugins.js";
import { emit, type RuntimeEventSink } from "../events/index.js";

export interface EngineIterateRequest {
  readonly basis: ExecutionBasis;
  readonly runtimeEvents?: readonly RuntimeEvent[] | undefined;
  readonly eventSink: RuntimeEventSink;
  readonly plugins?: EngineRunnerPluginSet | undefined;
}

export interface EngineStartRequest extends ExecutionBasisAdmissionInput {
  readonly runtimeEvents?: readonly RuntimeEvent[] | undefined;
  readonly eventSink: RuntimeEventSink;
  readonly plugins?: EngineRunnerPluginSet | undefined;
}

export interface EngineIterateResult {
  readonly kind: "engine_iterate_result";
  readonly basis: ExecutionBasis;
  readonly transition: AdvancementTransition;
  readonly projection: RuntimeAggregateProjection;
  readonly emittedEvents: readonly RuntimeEvent[];
  readonly replayEvents: readonly RuntimeEvent[];
  readonly iterationCount: number;
}

interface ResolvedRunnerPlugins {
  readonly fdEvaluator: FdEvaluatorPlugin;
  readonly fpDispatch: FpDispatchPlugin;
  readonly fhAdmission: FhAdmissionPlugin;
}

function resolveRunnerPlugins(
  plugins: EngineRunnerPluginSet | undefined
): ResolvedRunnerPlugins {
  return Object.freeze({
    fdEvaluator: plugins?.fdEvaluator ?? defaultFdEvaluatorPlugin,
    fpDispatch: plugins?.fpDispatch ?? defaultFpDispatchPlugin,
    fhAdmission: plugins?.fhAdmission ?? defaultFhAdmissionPlugin
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

function terminalTransition(
  basis: ExecutionBasis,
  terminalKind: TerminalTransition["terminalKind"],
  reason: string | null
): TerminalTransition {
  return Object.freeze({
    kind: "terminal",
    basis,
    terminalKind,
    reason
  });
}

function constructResult(input: {
  readonly basis: ExecutionBasis;
  readonly transition: AdvancementTransition;
  readonly projection: RuntimeAggregateProjection;
  readonly emittedEvents: readonly RuntimeEvent[];
  readonly replayEvents: readonly RuntimeEvent[];
  readonly iterationCount: number;
}): EngineIterateResult {
  return Object.freeze({
    kind: "engine_iterate_result",
    basis: input.basis,
    transition: input.transition,
    projection: input.projection,
    emittedEvents: Object.freeze([...input.emittedEvents]),
    replayEvents: Object.freeze([...input.replayEvents]),
    iterationCount: input.iterationCount
  });
}

export function runEngineIterate(
  request: EngineIterateRequest
): EngineIterateResult {
  const plugins = resolveRunnerPlugins(request.plugins);
  const emittedEvents: RuntimeEvent[] = [];
  let replayEvents: readonly RuntimeEvent[] = Object.freeze([
    ...(request.runtimeEvents ?? Object.freeze([]))
  ]);
  let iterationCount = 0;

  const emitRunnerEvents = (
    events: RuntimeEvent | readonly RuntimeEvent[]
  ): readonly RuntimeEvent[] => {
    const emitted = emit(events, request.eventSink);
    emittedEvents.push(...emitted);
    replayEvents = Object.freeze([...replayEvents, ...emitted]);
    return emitted;
  };

  if (!hasBasisAdmittedEvent(request.basis, replayEvents)) {
    emitRunnerEvents(constructBasisAdmittedEvent(request.basis));
  }

  while (true) {
    if (iterationCount > request.basis.graph.vectors.length) {
      throw new TypeError(
        "engine iterate runner exceeded replay-derived graph traversal bound"
      );
    }

    const projection = deriveRuntimeAggregateProjection(
      request.basis,
      replayEvents
    );
    const decision = deriveIterationAdvanceDecision(request.basis, projection);
    const transition = deriveAdvancementTransition(request.basis, replayEvents);

    if (decision.kind === "converged") {
      if (transition.kind !== "terminal") {
        throw new TypeError("engine iterate expected terminal transition");
      }
      emitRunnerEvents(constructTerminalReachedEvent(transition));
      return constructResult({
        basis: request.basis,
        transition,
        projection: deriveRuntimeAggregateProjection(request.basis, replayEvents),
        emittedEvents,
        replayEvents,
        iterationCount
      });
    }

    emitRunnerEvents(runtimeEventsForIterationDecision(decision));

    switch (transition.kind) {
      case "fd_advance": {
        const input = constructEnginePluginInput({
          contract: plugins.fdEvaluator.contract,
          basis: request.basis,
          projection,
          vectorIndex: transition.vectorIndex,
          edge: transition.edge,
          regime: "F_D"
        });
        const outcome = admitFdEvaluationOutcome(
          plugins.fdEvaluator.evaluate(input)
        );
        emitRunnerEvents(
          constructVectorEvaluatedEvent({
            basis: request.basis,
            vectorIndex: transition.vectorIndex,
            status: outcome.status === "accepted" ? "accepted" : "blocked"
          })
        );
        if (outcome.status === "blocked") {
          const blocked = terminalTransition(
            request.basis,
            "gap_stop",
            outcome.reason ?? "fd evaluator blocked traversal"
          );
          emitRunnerEvents(constructTerminalReachedEvent(blocked));
          return constructResult({
            basis: request.basis,
            transition: blocked,
            projection: deriveRuntimeAggregateProjection(request.basis, replayEvents),
            emittedEvents,
            replayEvents,
            iterationCount
          });
        }
        emitRunnerEvents([
          constructVectorClosedEvent({
            basis: request.basis,
            vectorIndex: transition.vectorIndex,
            closureKind: "advanced"
          }),
          constructFdAdvanceReadyEvent(transition)
        ]);
        iterationCount += 1;
        if (request.basis.startIntent.until === "first_traversal") {
          return constructResult({
            basis: request.basis,
            transition,
            projection: deriveRuntimeAggregateProjection(request.basis, replayEvents),
            emittedEvents,
            replayEvents,
            iterationCount
          });
        }
        break;
      }
      case "fp_dispatch": {
        const input = constructEnginePluginInput({
          contract: plugins.fpDispatch.contract,
          basis: request.basis,
          projection,
          vectorIndex: transition.vectorIndex,
          edge: transition.edge,
          regime: "F_P"
        });
        emitRunnerEvents(constructFpDispatchRequestedEvent(transition));
        const outcome = admitFpDispatchOutcome(plugins.fpDispatch.dispatch(input));
        if (outcome.status === "blocked") {
          const blocked = terminalTransition(
            request.basis,
            "gap_stop",
            outcome.reason ?? "fp dispatch plugin blocked traversal"
          );
          emitRunnerEvents(constructTerminalReachedEvent(blocked));
          return constructResult({
            basis: request.basis,
            transition: blocked,
            projection: deriveRuntimeAggregateProjection(request.basis, replayEvents),
            emittedEvents,
            replayEvents,
            iterationCount
          });
        }
        return constructResult({
          basis: request.basis,
          transition,
          projection: deriveRuntimeAggregateProjection(request.basis, replayEvents),
          emittedEvents,
          replayEvents,
          iterationCount
        });
      }
      case "fh_escalation": {
        const input = constructEnginePluginInput({
          contract: plugins.fhAdmission.contract,
          basis: request.basis,
          projection,
          vectorIndex: transition.vectorIndex,
          edge: transition.edge,
          regime: "F_H"
        });
        const outcome = admitFhAdmissionOutcome(plugins.fhAdmission.admit(input));
        if (outcome.status === "blocked") {
          const blocked = terminalTransition(
            request.basis,
            "gap_stop",
            outcome.reason ?? "fh admission plugin blocked traversal"
          );
          emitRunnerEvents(constructTerminalReachedEvent(blocked));
          return constructResult({
            basis: request.basis,
            transition: blocked,
            projection: deriveRuntimeAggregateProjection(request.basis, replayEvents),
            emittedEvents,
            replayEvents,
            iterationCount
          });
        }
        emitRunnerEvents(constructFhEscalatedEvent(transition));
        return constructResult({
          basis: request.basis,
          transition,
          projection: deriveRuntimeAggregateProjection(request.basis, replayEvents),
          emittedEvents,
          replayEvents,
          iterationCount
        });
      }
      case "terminal":
        emitRunnerEvents(constructTerminalReachedEvent(transition));
        return constructResult({
          basis: request.basis,
          transition,
          projection: deriveRuntimeAggregateProjection(request.basis, replayEvents),
          emittedEvents,
          replayEvents,
          iterationCount
        });
      default: {
        const exhaustive: never = transition;
        throw new TypeError(
          `Unsupported engine transition ${JSON.stringify(exhaustive)}`
        );
      }
    }
  }
}

export function runEngineStart(request: EngineStartRequest): EngineIterateResult {
  const basis = admitExecutionBasis(request);
  return runEngineIterate({
    basis,
    runtimeEvents: request.runtimeEvents,
    eventSink: request.eventSink,
    plugins: request.plugins
  });
}
