// Implements: REQ-R-ABG3-INTERPRET
// Implements: REQ-R-ABG3-EVENTS
// Implements: REQ-R-ABG3-RUN
// Implements: REQ-R-ABG3-CONVERGENCE

import { admitExecutionBasis } from "../admission/index.js";
import type { ExecutionBasisAdmissionInput } from "../admission/index.js";
import type {
  AdvancementTransition,
  ActorInvocation,
  ActorInvocationRef,
  ExecutionBasis,
  RuntimeAggregateProjection,
  RuntimeEvent,
  TerminalTransition
} from "../contracts/carriers.js";
import {
  constructActorInvocationClosedEvent,
  constructActorInvocationStartedEvent,
  constructActorResultArtifactObservedEvent,
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
  runtimeEventsForIterationDecision
} from "../contracts/iteration.js";
import {
  constructGraphReentryAppliedEvent,
  constructGraphReentryPlannedEvent,
  deriveAdvancementTransitionWithReentry,
  deriveGraphReentryFrontierProjection,
  deriveGraphReentryPlan
} from "../contracts/graph_span_reentry.js";
import { deriveRuntimeAggregateProjection } from "../contracts/projection.js";
import {
  frameIdForBasis,
  graphCallIdForBasis
} from "../contracts/runtime_support.js";
import {
  admitFdEvaluationOutcome,
  admitFhAdmissionOutcome,
  admitFpDispatchOutcome,
  constructEnginePluginInput,
  defaultFdEvaluatorPlugin,
  defaultFhAdmissionPlugin,
  defaultFpDispatchPlugin,
  type EnginePluginMaybePromise,
  type EngineRunnerPluginSet,
  type FdEvaluatorPlugin,
  type FhAdmissionPlugin,
  type FpDispatchPlugin
} from "../contracts/plugins.js";
import { emit, type RuntimeEventSink } from "../events/index.js";
import { dispatchRequestsForTransition } from "../transport/index.js";
import { deriveAttachedFpResultDecision } from "./attached_fp_worker.js";
import {
  constructNotEvaluatedAssuranceGate,
  evaluateAssuranceGate,
  type EngineAssuranceGateResult,
  type EngineAssuranceProvider
} from "./assurance_gate.js";

export interface EngineIterateRequest {
  readonly basis: ExecutionBasis;
  readonly runtimeEvents?: readonly RuntimeEvent[] | undefined;
  readonly eventSink: RuntimeEventSink;
  readonly plugins?: EngineRunnerPluginSet | undefined;
  readonly maxAttachedFpAttempts?: number | undefined;
  readonly assuranceProvider?: EngineAssuranceProvider | undefined;
}

export interface EngineStartRequest extends ExecutionBasisAdmissionInput {
  readonly runtimeEvents?: readonly RuntimeEvent[] | undefined;
  readonly eventSink: RuntimeEventSink;
  readonly plugins?: EngineRunnerPluginSet | undefined;
  readonly maxAttachedFpAttempts?: number | undefined;
  readonly assuranceProvider?: EngineAssuranceProvider | undefined;
}

export interface EngineIterateResult {
  readonly kind: "engine_iterate_result";
  readonly basis: ExecutionBasis;
  readonly transition: AdvancementTransition;
  readonly projection: RuntimeAggregateProjection;
  readonly emittedEvents: readonly RuntimeEvent[];
  readonly replayEvents: readonly RuntimeEvent[];
  readonly iterationCount: number;
  readonly assuranceGate: EngineAssuranceGateResult;
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

function isPromiseLike(input: unknown): input is Promise<unknown> {
  return (
    typeof input === "object" &&
    input !== null &&
    "then" in input &&
    typeof input.then === "function"
  );
}

function resolveSyncPluginOutcome<T>(
  outcome: EnginePluginMaybePromise<T>,
  label: string
): T {
  if (isPromiseLike(outcome)) {
    throw new TypeError(`${label} returned a Promise; use runEngineIterateAsync`);
  }
  return outcome;
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

function deriveActiveReentry(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly replayEvents: readonly RuntimeEvent[];
}): ReturnType<typeof deriveAdvancementTransitionWithReentry> {
  const frontier = deriveGraphReentryFrontierProjection({
    basis: input.basis,
    events: input.replayEvents
  });
  return deriveAdvancementTransitionWithReentry({
    basis: input.basis,
    runtimeProjection: input.projection,
    frontier
  });
}

function reentryPlanEvents(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly replayEvents: readonly RuntimeEvent[];
}): readonly RuntimeEvent[] {
  const frontier = deriveGraphReentryFrontierProjection({
    basis: input.basis,
    events: input.replayEvents
  });
  const plan = deriveGraphReentryPlan({
    basis: input.basis,
    runtimeProjection: input.projection,
    frontier
  });
  if (plan === null) {
    throw new TypeError("Active graph reentry frontier requires a reentry plan");
  }
  return Object.freeze([
    constructGraphReentryPlannedEvent({ basis: input.basis, plan }),
    constructGraphReentryAppliedEvent({ basis: input.basis, plan })
  ]);
}

function actorAttemptIndexForProjection(input: {
  readonly projection: RuntimeAggregateProjection;
  readonly vectorIndex: number;
}): number {
  return (
    input.projection.retryAttemptRefs.filter(
      (attempt) => attempt.vectorIndex === input.vectorIndex
    ).length + 1
  );
}

function actorInvocationForTransition(input: {
  readonly projection: RuntimeAggregateProjection;
  readonly transition: Extract<AdvancementTransition, { readonly kind: "fp_dispatch" }>;
}): ActorInvocation {
  const request = dispatchRequestsForTransition(input.transition)[0];
  if (request === undefined) {
    throw new TypeError("actor invocation requires a dispatch request");
  }
  const attemptIndex = actorAttemptIndexForProjection({
    projection: input.projection,
    vectorIndex: input.transition.vectorIndex
  });
  return Object.freeze({
    kind: "actor_invocation",
    actorInvocationId: `actor-invocation:${JSON.stringify({
      basisId: input.transition.basis.id,
      vectorIndex: input.transition.vectorIndex,
      attemptIndex
    })}`,
    basisId: input.transition.basis.id,
    graphCallId: graphCallIdForBasis(input.transition.basis),
    frameId: frameIdForBasis(input.transition.basis),
    vectorIndex: input.transition.vectorIndex,
    edge: input.transition.edge,
    attemptIndex,
    dispatchRef: request.dispatchRef,
    workerId: request.workerId,
    backendId: request.backendId,
    resultRef: request.resultRef
  });
}

function actorInvocationRef(invocation: ActorInvocation): ActorInvocationRef {
  return Object.freeze({
    actorInvocationId: invocation.actorInvocationId,
    attemptIndex: invocation.attemptIndex,
    dispatchRef: invocation.dispatchRef,
    resultRef: invocation.resultRef
  });
}

function resultRefForActorOutcome(input: {
  readonly invocation: ActorInvocation;
  readonly outcomeResultRef: string | null;
}): string {
  return input.outcomeResultRef ?? input.invocation.resultRef;
}

function constructResult(input: {
  readonly basis: ExecutionBasis;
  readonly transition: AdvancementTransition;
  readonly projection: RuntimeAggregateProjection;
  readonly emittedEvents: readonly RuntimeEvent[];
  readonly replayEvents: readonly RuntimeEvent[];
  readonly iterationCount: number;
  readonly assuranceGate?: EngineAssuranceGateResult | undefined;
}): EngineIterateResult {
  return Object.freeze({
    kind: "engine_iterate_result",
    basis: input.basis,
    transition: input.transition,
    projection: input.projection,
    emittedEvents: Object.freeze([...input.emittedEvents]),
    replayEvents: Object.freeze([...input.replayEvents]),
    iterationCount: input.iterationCount,
    assuranceGate:
      input.assuranceGate ??
      constructNotEvaluatedAssuranceGate(
        "assurance gate only evaluates convergence-capable terminal projection"
      )
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
    const reentryTransition = deriveActiveReentry({
      basis: request.basis,
      projection,
      replayEvents
    });
    if (reentryTransition.kind === "reenter_graph_vector") {
      emitRunnerEvents(
        reentryPlanEvents({
          basis: request.basis,
          projection,
          replayEvents
        })
      );
      continue;
    }
    if (reentryTransition.kind === "reenter_constitutional_route") {
      emitRunnerEvents(
        reentryPlanEvents({
          basis: request.basis,
          projection,
          replayEvents
        })
      );
      const yielded = terminalTransition(
        request.basis,
        "yielded",
        `graph reentry yielded to ${reentryTransition.changeClass}:${reentryTransition.reEntryPoint}`
      );
      emitRunnerEvents(constructTerminalReachedEvent(yielded));
      return constructResult({
        basis: request.basis,
        transition: yielded,
        projection: deriveRuntimeAggregateProjection(request.basis, replayEvents),
        emittedEvents,
        replayEvents,
        iterationCount
      });
    }
    if (
      reentryTransition.kind === "blocked" ||
      reentryTransition.kind === "reprice_required"
    ) {
      const blocked = terminalTransition(
        request.basis,
        "gap_stop",
        reentryTransition.reason
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
    const decision = reentryTransition.decision;
    const transition = deriveAdvancementTransition(request.basis, replayEvents);

    if (decision.kind === "converged") {
      if (transition.kind !== "terminal") {
        throw new TypeError("engine iterate expected terminal transition");
      }
      const assuranceGate = evaluateAssuranceGate({
        basis: request.basis,
        projection,
        replayEvents,
        ...(request.assuranceProvider === undefined
          ? {}
          : { provider: request.assuranceProvider })
      });
      if (assuranceGate.kind === "assurance_blocked") {
        const blocked = terminalTransition(
          request.basis,
          "gap_stop",
          `assurance closure blocked: ${assuranceGate.reason}`
        );
        emitRunnerEvents(constructTerminalReachedEvent(blocked));
        return constructResult({
          basis: request.basis,
          transition: blocked,
          projection: deriveRuntimeAggregateProjection(request.basis, replayEvents),
          emittedEvents,
          replayEvents,
          iterationCount,
          assuranceGate
        });
      }
      emitRunnerEvents(constructTerminalReachedEvent(transition));
      return constructResult({
        basis: request.basis,
        transition,
        projection: deriveRuntimeAggregateProjection(request.basis, replayEvents),
        emittedEvents,
        replayEvents,
        iterationCount,
        assuranceGate
      });
    }

    emitRunnerEvents(runtimeEventsForIterationDecision(decision));

    switch (transition.kind) {
      case "fd_advance": {
        const input = constructEnginePluginInput({
          contract: plugins.fdEvaluator.contract,
          basis: request.basis,
          projection,
          replayEvents,
          vectorIndex: transition.vectorIndex,
          edge: transition.edge,
          regime: "F_D"
        });
        const outcome = admitFdEvaluationOutcome(
          resolveSyncPluginOutcome(
            plugins.fdEvaluator.evaluate(input),
            "fd evaluator plugin"
          )
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
        const actorInvocation = actorInvocationForTransition({
          projection,
          transition
        });
        const input = constructEnginePluginInput({
          contract: plugins.fpDispatch.contract,
          basis: request.basis,
          projection,
          replayEvents,
          vectorIndex: transition.vectorIndex,
          edge: transition.edge,
          regime: "F_P",
          actorInvocationRef: actorInvocationRef(actorInvocation)
        });
        emitRunnerEvents(constructFpDispatchRequestedEvent(transition));
        emitRunnerEvents(constructActorInvocationStartedEvent(actorInvocation));
        const outcome = admitFpDispatchOutcome(
          resolveSyncPluginOutcome(
            plugins.fpDispatch.dispatch(input),
            "fp dispatch plugin"
          )
        );
        if (outcome.attachedResultArtifact !== null) {
          const resultRef = resultRefForActorOutcome({
            invocation: actorInvocation,
            outcomeResultRef: outcome.resultRef
          });
          emitRunnerEvents(
            constructActorResultArtifactObservedEvent({
              invocation: actorInvocation,
              artifactRef: resultRef
            })
          );
          if (input.fpTransformRequest === null) {
            throw new TypeError("F_P dispatch requires a transform request carrier");
          }
          const attachedDecision = deriveAttachedFpResultDecision({
            basis: request.basis,
            projection,
            transition,
            outcome,
            transformRequest: input.fpTransformRequest,
            maxAttempts: request.maxAttachedFpAttempts
          });
          emitRunnerEvents(
            constructActorInvocationClosedEvent({
              invocation: actorInvocation,
              closureStatus:
                outcome.status === "blocked"
                  ? "blocked_with_artifact"
                  : "completed",
              resultRef,
              detail: outcome.reason
            })
          );
          if (attachedDecision.kind === "accepted") {
            emitRunnerEvents(
              constructVectorEvaluatedEvent({
                basis: request.basis,
                vectorIndex: transition.vectorIndex,
                status: "accepted"
              })
            );
            emitRunnerEvents(attachedDecision.payloadEvents);
            emitRunnerEvents(
              constructVectorClosedEvent({
                basis: request.basis,
                vectorIndex: transition.vectorIndex,
                closureKind: "assessed"
              })
            );
            iterationCount += 1;
            if (request.basis.startIntent.until === "first_traversal") {
              const applied = terminalTransition(
                request.basis,
                "traversal_applied",
                "attached F_P result assessed"
              );
              emitRunnerEvents(constructTerminalReachedEvent(applied));
              return constructResult({
                basis: request.basis,
                transition: applied,
                projection: deriveRuntimeAggregateProjection(request.basis, replayEvents),
                emittedEvents,
                replayEvents,
                iterationCount
              });
            }
            break;
          }
          emitRunnerEvents(
            constructVectorEvaluatedEvent({
              basis: request.basis,
              vectorIndex: transition.vectorIndex,
              status: "blocked"
            })
          );
          emitRunnerEvents(attachedDecision.retryEvents);
          if (attachedDecision.kind === "retry_planned") {
            break;
          }
          const blocked = terminalTransition(
            request.basis,
            attachedDecision.terminalKind,
            attachedDecision.reason
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
        emitRunnerEvents(
          constructActorInvocationClosedEvent({
            invocation: actorInvocation,
            closureStatus: outcome.status === "blocked" ? "blocked" : "completed",
            resultRef: outcome.resultRef,
            detail: outcome.reason
          })
        );
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
          replayEvents,
          vectorIndex: transition.vectorIndex,
          edge: transition.edge,
          regime: "F_H"
        });
        const outcome = admitFhAdmissionOutcome(
          resolveSyncPluginOutcome(
            plugins.fhAdmission.admit(input),
            "fh admission plugin"
          )
        );
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

export async function runEngineIterateAsync(
  request: EngineIterateRequest
): Promise<EngineIterateResult> {
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
    const reentryTransition = deriveActiveReentry({
      basis: request.basis,
      projection,
      replayEvents
    });
    if (reentryTransition.kind === "reenter_graph_vector") {
      emitRunnerEvents(
        reentryPlanEvents({
          basis: request.basis,
          projection,
          replayEvents
        })
      );
      continue;
    }
    if (reentryTransition.kind === "reenter_constitutional_route") {
      emitRunnerEvents(
        reentryPlanEvents({
          basis: request.basis,
          projection,
          replayEvents
        })
      );
      const yielded = terminalTransition(
        request.basis,
        "yielded",
        `graph reentry yielded to ${reentryTransition.changeClass}:${reentryTransition.reEntryPoint}`
      );
      emitRunnerEvents(constructTerminalReachedEvent(yielded));
      return constructResult({
        basis: request.basis,
        transition: yielded,
        projection: deriveRuntimeAggregateProjection(request.basis, replayEvents),
        emittedEvents,
        replayEvents,
        iterationCount
      });
    }
    if (
      reentryTransition.kind === "blocked" ||
      reentryTransition.kind === "reprice_required"
    ) {
      const blocked = terminalTransition(
        request.basis,
        "gap_stop",
        reentryTransition.reason
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
    const decision = reentryTransition.decision;
    const transition = deriveAdvancementTransition(request.basis, replayEvents);

    if (decision.kind === "converged") {
      if (transition.kind !== "terminal") {
        throw new TypeError("engine iterate expected terminal transition");
      }
      const assuranceGate = evaluateAssuranceGate({
        basis: request.basis,
        projection,
        replayEvents,
        ...(request.assuranceProvider === undefined
          ? {}
          : { provider: request.assuranceProvider })
      });
      if (assuranceGate.kind === "assurance_blocked") {
        const blocked = terminalTransition(
          request.basis,
          "gap_stop",
          `assurance closure blocked: ${assuranceGate.reason}`
        );
        emitRunnerEvents(constructTerminalReachedEvent(blocked));
        return constructResult({
          basis: request.basis,
          transition: blocked,
          projection: deriveRuntimeAggregateProjection(request.basis, replayEvents),
          emittedEvents,
          replayEvents,
          iterationCount,
          assuranceGate
        });
      }
      emitRunnerEvents(constructTerminalReachedEvent(transition));
      return constructResult({
        basis: request.basis,
        transition,
        projection: deriveRuntimeAggregateProjection(request.basis, replayEvents),
        emittedEvents,
        replayEvents,
        iterationCount,
        assuranceGate
      });
    }

    emitRunnerEvents(runtimeEventsForIterationDecision(decision));

    switch (transition.kind) {
      case "fd_advance": {
        const input = constructEnginePluginInput({
          contract: plugins.fdEvaluator.contract,
          basis: request.basis,
          projection,
          replayEvents,
          vectorIndex: transition.vectorIndex,
          edge: transition.edge,
          regime: "F_D"
        });
        const outcome = admitFdEvaluationOutcome(
          await plugins.fdEvaluator.evaluate(input)
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
        const actorInvocation = actorInvocationForTransition({
          projection,
          transition
        });
        const input = constructEnginePluginInput({
          contract: plugins.fpDispatch.contract,
          basis: request.basis,
          projection,
          replayEvents,
          vectorIndex: transition.vectorIndex,
          edge: transition.edge,
          regime: "F_P",
          actorInvocationRef: actorInvocationRef(actorInvocation)
        });
        emitRunnerEvents(constructFpDispatchRequestedEvent(transition));
        emitRunnerEvents(constructActorInvocationStartedEvent(actorInvocation));
        const outcome = admitFpDispatchOutcome(
          await plugins.fpDispatch.dispatch(input)
        );
        if (outcome.attachedResultArtifact !== null) {
          const resultRef = resultRefForActorOutcome({
            invocation: actorInvocation,
            outcomeResultRef: outcome.resultRef
          });
          emitRunnerEvents(
            constructActorResultArtifactObservedEvent({
              invocation: actorInvocation,
              artifactRef: resultRef
            })
          );
          if (input.fpTransformRequest === null) {
            throw new TypeError("F_P dispatch requires a transform request carrier");
          }
          const attachedDecision = deriveAttachedFpResultDecision({
            basis: request.basis,
            projection,
            transition,
            outcome,
            transformRequest: input.fpTransformRequest,
            maxAttempts: request.maxAttachedFpAttempts
          });
          emitRunnerEvents(
            constructActorInvocationClosedEvent({
              invocation: actorInvocation,
              closureStatus:
                outcome.status === "blocked"
                  ? "blocked_with_artifact"
                  : "completed",
              resultRef,
              detail: outcome.reason
            })
          );
          if (attachedDecision.kind === "accepted") {
            emitRunnerEvents(
              constructVectorEvaluatedEvent({
                basis: request.basis,
                vectorIndex: transition.vectorIndex,
                status: "accepted"
              })
            );
            emitRunnerEvents(attachedDecision.payloadEvents);
            emitRunnerEvents(
              constructVectorClosedEvent({
                basis: request.basis,
                vectorIndex: transition.vectorIndex,
                closureKind: "assessed"
              })
            );
            iterationCount += 1;
            if (request.basis.startIntent.until === "first_traversal") {
              const applied = terminalTransition(
                request.basis,
                "traversal_applied",
                "attached F_P result assessed"
              );
              emitRunnerEvents(constructTerminalReachedEvent(applied));
              return constructResult({
                basis: request.basis,
                transition: applied,
                projection: deriveRuntimeAggregateProjection(request.basis, replayEvents),
                emittedEvents,
                replayEvents,
                iterationCount
              });
            }
            break;
          }
          emitRunnerEvents(
            constructVectorEvaluatedEvent({
              basis: request.basis,
              vectorIndex: transition.vectorIndex,
              status: "blocked"
            })
          );
          emitRunnerEvents(attachedDecision.retryEvents);
          if (attachedDecision.kind === "retry_planned") {
            break;
          }
          const blocked = terminalTransition(
            request.basis,
            attachedDecision.terminalKind,
            attachedDecision.reason
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
        emitRunnerEvents(
          constructActorInvocationClosedEvent({
            invocation: actorInvocation,
            closureStatus: outcome.status === "blocked" ? "blocked" : "completed",
            resultRef: outcome.resultRef,
            detail: outcome.reason
          })
        );
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
          replayEvents,
          vectorIndex: transition.vectorIndex,
          edge: transition.edge,
          regime: "F_H"
        });
        const outcome = admitFhAdmissionOutcome(
          await plugins.fhAdmission.admit(input)
        );
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
    plugins: request.plugins,
    maxAttachedFpAttempts: request.maxAttachedFpAttempts,
    assuranceProvider: request.assuranceProvider
  });
}
