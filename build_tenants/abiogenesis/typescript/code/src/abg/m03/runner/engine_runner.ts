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
  PluginTraversalKind,
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
  constructPluginTraversalPromptMaterializedEvent,
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
  type EnginePluginContract,
  type EnginePluginInput,
  type EnginePluginMaybePromise,
  type EngineRunnerPluginSet,
  type FdEvaluatorPlugin,
  type FpDispatchOutcome,
  type FhAdmissionPlugin,
  type FpDispatchPlugin
} from "../contracts/plugins.js";
import type { AbgFallbackBundle } from "../contracts/plugin_traversal_observer.js";
import {
  deriveRetryRepairDecision,
  runtimeEventsForRetryRepairDecision
} from "../contracts/retry_repair.js";
import {
  constructAgenticBackendProgressProfile,
  constructTraversalAttemptDispatchedEvent,
  constructTraversalAttemptEnvelopeDerivedEvent,
  constructTraversalAttemptNonProgressClassifiedEvent,
  constructTraversalModulationResolvedEvent,
  deriveTraversalAttemptEnvelope,
  deriveTraversalModulationProfile,
  tryResolveTraversalStrategyDirectiveFromGtl,
  type AgenticBackendKind,
  type TraversalAttemptEnvelope,
  type TraversalModulationProfile,
  type TraversalModulationGtlQualifierResolution
} from "../contracts/traversal_modulation.js";
import {
  assertTraversalContinuationSummaryAgreement,
  deriveTraversalContinuationActionProjection,
  deriveTraversalContinuationSummary,
  deriveTraversalNonProgressCarrier,
  type TraversalContinuationActionProjection,
  type TraversalNonProgressCarrier,
  type TraversalContinuationSummary
} from "../contracts/traversal_non_progress.js";
import { emit, type RuntimeEventSink } from "../events/index.js";
import { dispatchRequestsForTransition } from "../transport/index.js";
import {
  DEFAULT_ATTACHED_FP_MAX_RETRY_ATTEMPTS,
  deriveAttachedFpResultDecision
} from "./attached_fp_worker.js";
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
  readonly abgFallbackBundle?: AbgFallbackBundle | null | undefined;
  readonly pluginTraversalObserverFallbackEnabled?: boolean | undefined;
  readonly pluginTraversalObserverFallbackKinds?:
    | readonly PluginTraversalKind[]
    | undefined;
}

export interface EngineStartRequest extends ExecutionBasisAdmissionInput {
  readonly runtimeEvents?: readonly RuntimeEvent[] | undefined;
  readonly eventSink: RuntimeEventSink;
  readonly plugins?: EngineRunnerPluginSet | undefined;
  readonly maxAttachedFpAttempts?: number | undefined;
  readonly assuranceProvider?: EngineAssuranceProvider | undefined;
  readonly abgFallbackBundle?: AbgFallbackBundle | null | undefined;
  readonly pluginTraversalObserverFallbackEnabled?: boolean | undefined;
  readonly pluginTraversalObserverFallbackKinds?:
    | readonly PluginTraversalKind[]
    | undefined;
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
    graphFunctionId: input.transition.basis.graphFunction.id,
    runId: input.transition.basis.runId,
    workKey: input.transition.basis.workKey,
    graphCallId: graphCallIdForBasis(input.transition.basis),
    frameId: frameIdForBasis(input.transition.basis),
    vectorIndex: input.transition.vectorIndex,
    edge: input.transition.edge,
    attemptIndex,
    dispatchRef: request.dispatchRef,
    workerId: request.workerId,
    backendId: request.backendId,
    resultRef: request.resultRef,
    causationEventRefs: Object.freeze([request.dispatchRef]),
    correlationId: [
      "actor-correlation",
      input.transition.basis.id,
      String(input.transition.vectorIndex),
      String(attemptIndex)
    ].join(":")
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

interface ModulatedFpAttempt {
  readonly resolution: TraversalModulationGtlQualifierResolution;
  readonly profile: TraversalModulationProfile;
  readonly envelope: TraversalAttemptEnvelope;
}

type FpDispatchTransition = Extract<
  AdvancementTransition,
  { readonly kind: "fp_dispatch" }
>;

interface FpDispatchAttemptInput {
  readonly actorInvocation: ActorInvocation;
  readonly modulatedAttempt: ModulatedFpAttempt | null;
  readonly pluginInput: EnginePluginInput;
}

function agenticBackendKindForBasis(basis: ExecutionBasis): AgenticBackendKind {
  const normalized = [
    basis.runtimeIdentity.backendId,
    basis.runtimeIdentity.workerId,
    basis.runtimeIdentity.resolvedRuntimeRef
  ].join(" ").toLowerCase();
  if (normalized.includes("claude")) {
    return "claude";
  }
  if (normalized.includes("codex")) {
    return "codex";
  }
  return "generic_process";
}

function backendProgressProfileForBasis(
  basis: ExecutionBasis
): ReturnType<typeof constructAgenticBackendProgressProfile> {
  const backendKind = agenticBackendKindForBasis(basis);
  return constructAgenticBackendProgressProfile({
    backendKind,
    profileRef: `agentic_backend_progress_profile:${basis.runtimeIdentity.backendId}`,
    processProtocolSignals: Object.freeze(["process_started", "ack"]),
    streamProgressSignals: Object.freeze(["stdout_chunk", "stderr_chunk"]),
    declaredArtifactProgressSignals: Object.freeze(["progress_report"]),
    finalOutputMayBeBuffered: backendKind === "codex",
    progressSignalRequiredBeforeInactivityMs: 30000
  });
}

function deriveModulatedFpAttempt(input: {
  readonly basis: ExecutionBasis;
  readonly transition: FpDispatchTransition;
  readonly actorInvocation: ActorInvocation;
}): ModulatedFpAttempt | null {
  const vector = input.basis.graph.vectors[input.transition.vectorIndex];
  if (vector === undefined) {
    throw new TypeError("Traversal modulation requires a graph vector");
  }
  const resolution = tryResolveTraversalStrategyDirectiveFromGtl({
    vector,
    graphFunction: input.basis.graphFunction,
    roles: input.basis.job.roles
  });
  if (resolution === null) {
    return null;
  }
  const profile = deriveTraversalModulationProfile({
    basis: input.basis,
    vectorIndex: input.transition.vectorIndex,
    directive: resolution.directive,
    backendProfile: backendProgressProfileForBasis(input.basis),
    policyRefs: Object.freeze([input.basis.resolvedPolicy.resolvedPolicyBundleRef])
  });
  const retryBudgetRemaining = Math.max(
    profile.continuation.maxTotalAttempts - input.actorInvocation.attemptIndex,
    0
  );
  const envelope = deriveTraversalAttemptEnvelope({
    basis: input.basis,
    profile,
    actorInvocationId: input.actorInvocation.actorInvocationId,
    retryBudgetRemaining
  });
  return Object.freeze({ resolution, profile, envelope });
}

function deriveFpDispatchAttemptInput(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly transition: FpDispatchTransition;
  readonly contract: EnginePluginContract;
  readonly abgFallbackBundle: AbgFallbackBundle | null;
  readonly pluginTraversalObserverFallbackEnabled: boolean;
  readonly pluginTraversalObserverFallbackKinds: readonly PluginTraversalKind[];
}): FpDispatchAttemptInput {
  const actorInvocation = actorInvocationForTransition({
    projection: input.projection,
    transition: input.transition
  });
  const modulatedAttempt = deriveModulatedFpAttempt({
    basis: input.basis,
    transition: input.transition,
    actorInvocation
  });
  const pluginInput = constructEnginePluginInput({
    contract: input.contract,
    basis: input.basis,
    projection: input.projection,
    replayEvents: input.replayEvents,
    vectorIndex: input.transition.vectorIndex,
    edge: input.transition.edge,
    regime: "F_P",
    actorInvocationRef: actorInvocationRef(actorInvocation),
    traversalAttemptEnvelope: modulatedAttempt?.envelope ?? null,
    abgFallbackBundle: input.abgFallbackBundle,
    pluginTraversalObserverFallbackEnabled:
      input.pluginTraversalObserverFallbackEnabled,
    pluginTraversalObserverFallbackKinds:
      input.pluginTraversalObserverFallbackKinds
  });
  return Object.freeze({
    actorInvocation,
    modulatedAttempt,
    pluginInput
  });
}

function fpDispatchAttemptStartedEvents(input: {
  readonly basis: ExecutionBasis;
  readonly transition: FpDispatchTransition;
  readonly actorInvocation: ActorInvocation;
  readonly modulatedAttempt: ModulatedFpAttempt | null;
  readonly pluginInput: EnginePluginInput;
}): readonly RuntimeEvent[] {
  const events: RuntimeEvent[] = [constructFpDispatchRequestedEvent(input.transition)];
  if (input.pluginInput.pluginTraversalObserverBinding !== null) {
    events.push(
      constructPluginTraversalPromptMaterializedEvent({
        basis: input.basis,
        vectorIndex: input.transition.vectorIndex,
        selection: input.pluginInput.pluginTraversalObserverBinding,
        invocation: input.actorInvocation,
        causationEventRefs: Object.freeze([input.transition.dispatchRef]),
        correlationId: input.actorInvocation.correlationId
      })
    );
  }
  if (input.modulatedAttempt !== null) {
    events.push(
      constructTraversalModulationResolvedEvent({
        basis: input.basis,
        profile: input.modulatedAttempt.profile,
        causationEventRefs: Object.freeze([input.transition.dispatchRef])
      }),
      constructTraversalAttemptEnvelopeDerivedEvent({
        basis: input.basis,
        envelope: input.modulatedAttempt.envelope,
        causationEventRefs: Object.freeze([
          input.modulatedAttempt.profile.profileRef
        ])
      })
    );
  }
  events.push(constructActorInvocationStartedEvent(input.actorInvocation));
  if (input.modulatedAttempt !== null) {
    events.push(
      constructTraversalAttemptDispatchedEvent({
        basis: input.basis,
        envelope: input.modulatedAttempt.envelope,
        dispatchRef: input.actorInvocation.dispatchRef,
        causationEventRefs: Object.freeze([
          input.modulatedAttempt.envelope.envelopeRef,
          input.actorInvocation.actorInvocationId
        ])
      })
    );
  }
  return Object.freeze(events);
}

function fpDispatchAttemptNonProgressEvents(input: {
  readonly basis: ExecutionBasis;
  readonly modulatedAttempt: ModulatedFpAttempt | null;
  readonly continuation: BlockedFpNoArtifactContinuation;
}): readonly RuntimeEvent[] {
  if (input.modulatedAttempt === null) {
    return Object.freeze([]);
  }
  return Object.freeze([
    constructTraversalAttemptNonProgressClassifiedEvent({
      basis: input.basis,
      envelope: input.modulatedAttempt.envelope,
      sourceCarrierRef: input.continuation.carrier.carrierRef,
      actionProjectionRef: input.continuation.action.projectionRef
    })
  ]);
}

function mustExitAfterBoundedAttempt(
  modulatedAttempt: ModulatedFpAttempt | null
): boolean {
  return modulatedAttempt?.envelope.mustExitAfterBoundedAttempt === true;
}

function boundedAttemptExitTransition(input: {
  readonly basis: ExecutionBasis;
  readonly reason: string | null;
}): TerminalTransition {
  return terminalTransition(
    input.basis,
    "gap_stop",
    `bounded_traversal_attempt_exit:${input.reason ?? "blocked"}`
  );
}

function resultRefForActorOutcome(input: {
  readonly invocation: ActorInvocation;
  readonly outcomeResultRef: string | null;
}): string {
  return input.outcomeResultRef ?? input.invocation.resultRef;
}

function candidateNoProgressRetryManifestId(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly vectorIndex: number;
}): string {
  const attemptIndex =
    input.projection.retryAttemptRefs.filter(
      (attempt) => attempt.vectorIndex === input.vectorIndex
    ).length + 1;
  return `manifest:fp_no_progress_retry:${JSON.stringify({
    basisId: input.basis.id,
    vectorIndex: input.vectorIndex,
    attemptIndex
  })}`;
}

function noProgressContinuationRepair(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly vectorIndex: number;
}) {
  const observedAttemptCount = input.projection.retryAttemptRefs.filter(
    (attempt) => attempt.vectorIndex === input.vectorIndex
  ).length;
  const prefix = `continuation:${input.basis.id}:${input.vectorIndex}:no_progress`;
  return Object.freeze({
    terminatedContinuationId: `${prefix}:attempt:${observedAttemptCount}`,
    reopenedContinuationId: `${prefix}:attempt:${observedAttemptCount + 1}`
  });
}

type BlockedFpNoArtifactContinuation =
  | {
      readonly kind: "retry";
      readonly summary: TraversalContinuationSummary;
      readonly carrier: TraversalNonProgressCarrier;
      readonly action: TraversalContinuationActionProjection;
      readonly retryEvents: readonly RuntimeEvent[];
    }
  | {
      readonly kind: "terminal";
      readonly summary: TraversalContinuationSummary;
      readonly carrier: TraversalNonProgressCarrier;
      readonly action: TraversalContinuationActionProjection;
      readonly transition: TerminalTransition;
    };

function deriveBlockedFpNoArtifactContinuation(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly transition: FpDispatchTransition;
  readonly actorInvocation: ActorInvocation;
  readonly outcome: FpDispatchOutcome;
  readonly maxAttempts: number;
}): BlockedFpNoArtifactContinuation {
  const carrier = deriveTraversalNonProgressCarrier({
    basis: input.basis,
    projection: input.projection,
    vectorIndex: input.transition.vectorIndex,
    actorInvocationId: input.actorInvocation.actorInvocationId
  });
  const action = deriveTraversalContinuationActionProjection({
    basis: input.basis,
    projection: input.projection,
    carrier,
    maxAttempts: input.maxAttempts
  });
  const summary = deriveTraversalContinuationSummary(action);
  assertTraversalContinuationSummaryAgreement({
    projection: action,
    summary
  });

  if (summary.action === "retry_same_edge") {
    const retryDecision = deriveRetryRepairDecision({
      basis: input.basis,
      projection: input.projection,
      failedVectorIndex: input.transition.vectorIndex,
      priorManifestId: input.outcome.resultRef ?? input.actorInvocation.resultRef,
      candidateManifestId: candidateNoProgressRetryManifestId({
        basis: input.basis,
        projection: input.projection,
        vectorIndex: input.transition.vectorIndex
      }),
      maxAttempts: input.maxAttempts,
      stationary: false,
      escalationSubjectRef: input.basis.resolvedPolicy.approvalSubjectRef,
      continuationRepair: noProgressContinuationRepair({
        basis: input.basis,
        projection: input.projection,
        vectorIndex: input.transition.vectorIndex
      })
    });
    if (retryDecision.kind !== "retry_planned") {
      throw new TypeError(
        "Traversal no-progress retry projection drifted from retry repair decision"
      );
    }
    return Object.freeze({
      kind: "retry",
      summary,
      carrier,
      action,
      retryEvents: runtimeEventsForRetryRepairDecision(retryDecision)
    });
  }

  const terminalKind: TerminalTransition["terminalKind"] =
    summary.action === "yield_same_edge_continuation" ? "yielded" : "gap_stop";
  return Object.freeze({
    kind: "terminal",
    summary,
    carrier,
    action,
    transition: terminalTransition(
      input.basis,
      terminalKind,
      `traversal_continuation:${summary.action}:${summary.reason}`
    )
  });
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
          regime: "F_D",
          abgFallbackBundle: request.abgFallbackBundle ?? null,
          pluginTraversalObserverFallbackEnabled:
            request.pluginTraversalObserverFallbackEnabled ?? false,
          pluginTraversalObserverFallbackKinds:
            request.pluginTraversalObserverFallbackKinds ?? Object.freeze([])
        });
        if (input.pluginTraversalObserverBinding !== null) {
          emitRunnerEvents(
            constructPluginTraversalPromptMaterializedEvent({
              basis: request.basis,
              vectorIndex: transition.vectorIndex,
              selection: input.pluginTraversalObserverBinding,
              causationEventRefs: Object.freeze([input.sourceProjectionRef]),
              correlationId: [
                "plugin-traversal",
                request.basis.id,
                String(transition.vectorIndex),
                "eval"
              ].join(":")
            })
          );
        }
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
        const attempt = deriveFpDispatchAttemptInput({
          basis: request.basis,
          projection,
          transition,
          replayEvents,
          contract: plugins.fpDispatch.contract,
          abgFallbackBundle: request.abgFallbackBundle ?? null,
          pluginTraversalObserverFallbackEnabled:
            request.pluginTraversalObserverFallbackEnabled ?? false,
          pluginTraversalObserverFallbackKinds:
            request.pluginTraversalObserverFallbackKinds ?? Object.freeze([])
        });
        const { actorInvocation, modulatedAttempt, pluginInput: input } = attempt;
        emitRunnerEvents(
          fpDispatchAttemptStartedEvents({
            basis: request.basis,
            transition,
            actorInvocation,
            modulatedAttempt,
            pluginInput: input
          })
        );
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
          if (
            attachedDecision.kind === "retry_planned" &&
            mustExitAfterBoundedAttempt(modulatedAttempt)
          ) {
            const bounded = boundedAttemptExitTransition({
              basis: request.basis,
              reason: attachedDecision.reason
            });
            emitRunnerEvents(constructTerminalReachedEvent(bounded));
            return constructResult({
              basis: request.basis,
              transition: bounded,
              projection: deriveRuntimeAggregateProjection(request.basis, replayEvents),
              emittedEvents,
              replayEvents,
              iterationCount
            });
          }
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
          const continuation = deriveBlockedFpNoArtifactContinuation({
            basis: request.basis,
            projection: deriveRuntimeAggregateProjection(request.basis, replayEvents),
            transition,
            actorInvocation,
            outcome,
            maxAttempts:
              request.maxAttachedFpAttempts ??
              DEFAULT_ATTACHED_FP_MAX_RETRY_ATTEMPTS
          });
          if (continuation.kind === "retry") {
            emitRunnerEvents(
              fpDispatchAttemptNonProgressEvents({
                basis: request.basis,
                modulatedAttempt,
                continuation
              })
            );
            if (mustExitAfterBoundedAttempt(modulatedAttempt)) {
              const bounded = boundedAttemptExitTransition({
                basis: request.basis,
                reason: continuation.summary.reason
              });
              emitRunnerEvents(constructTerminalReachedEvent(bounded));
              return constructResult({
                basis: request.basis,
                transition: bounded,
                projection: deriveRuntimeAggregateProjection(request.basis, replayEvents),
                emittedEvents,
                replayEvents,
                iterationCount
              });
            }
            emitRunnerEvents(continuation.retryEvents);
            break;
          }
          emitRunnerEvents(
            fpDispatchAttemptNonProgressEvents({
              basis: request.basis,
              modulatedAttempt,
              continuation
            })
          );
          emitRunnerEvents(constructTerminalReachedEvent(continuation.transition));
          return constructResult({
            basis: request.basis,
            transition: continuation.transition,
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
          regime: "F_D",
          abgFallbackBundle: request.abgFallbackBundle ?? null,
          pluginTraversalObserverFallbackEnabled:
            request.pluginTraversalObserverFallbackEnabled ?? false,
          pluginTraversalObserverFallbackKinds:
            request.pluginTraversalObserverFallbackKinds ?? Object.freeze([])
        });
        if (input.pluginTraversalObserverBinding !== null) {
          emitRunnerEvents(
            constructPluginTraversalPromptMaterializedEvent({
              basis: request.basis,
              vectorIndex: transition.vectorIndex,
              selection: input.pluginTraversalObserverBinding,
              causationEventRefs: Object.freeze([input.sourceProjectionRef]),
              correlationId: [
                "plugin-traversal",
                request.basis.id,
                String(transition.vectorIndex),
                "eval"
              ].join(":")
            })
          );
        }
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
        const attempt = deriveFpDispatchAttemptInput({
          basis: request.basis,
          projection,
          transition,
          replayEvents,
          contract: plugins.fpDispatch.contract,
          abgFallbackBundle: request.abgFallbackBundle ?? null,
          pluginTraversalObserverFallbackEnabled:
            request.pluginTraversalObserverFallbackEnabled ?? false,
          pluginTraversalObserverFallbackKinds:
            request.pluginTraversalObserverFallbackKinds ?? Object.freeze([])
        });
        const { actorInvocation, modulatedAttempt, pluginInput: input } = attempt;
        emitRunnerEvents(
          fpDispatchAttemptStartedEvents({
            basis: request.basis,
            transition,
            actorInvocation,
            modulatedAttempt,
            pluginInput: input
          })
        );
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
          if (
            attachedDecision.kind === "retry_planned" &&
            mustExitAfterBoundedAttempt(modulatedAttempt)
          ) {
            const bounded = boundedAttemptExitTransition({
              basis: request.basis,
              reason: attachedDecision.reason
            });
            emitRunnerEvents(constructTerminalReachedEvent(bounded));
            return constructResult({
              basis: request.basis,
              transition: bounded,
              projection: deriveRuntimeAggregateProjection(request.basis, replayEvents),
              emittedEvents,
              replayEvents,
              iterationCount
            });
          }
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
          const continuation = deriveBlockedFpNoArtifactContinuation({
            basis: request.basis,
            projection: deriveRuntimeAggregateProjection(request.basis, replayEvents),
            transition,
            actorInvocation,
            outcome,
            maxAttempts:
              request.maxAttachedFpAttempts ??
              DEFAULT_ATTACHED_FP_MAX_RETRY_ATTEMPTS
          });
          if (continuation.kind === "retry") {
            emitRunnerEvents(
              fpDispatchAttemptNonProgressEvents({
                basis: request.basis,
                modulatedAttempt,
                continuation
              })
            );
            if (mustExitAfterBoundedAttempt(modulatedAttempt)) {
              const bounded = boundedAttemptExitTransition({
                basis: request.basis,
                reason: continuation.summary.reason
              });
              emitRunnerEvents(constructTerminalReachedEvent(bounded));
              return constructResult({
                basis: request.basis,
                transition: bounded,
                projection: deriveRuntimeAggregateProjection(request.basis, replayEvents),
                emittedEvents,
                replayEvents,
                iterationCount
              });
            }
            emitRunnerEvents(continuation.retryEvents);
            break;
          }
          emitRunnerEvents(
            fpDispatchAttemptNonProgressEvents({
              basis: request.basis,
              modulatedAttempt,
              continuation
            })
          );
          emitRunnerEvents(constructTerminalReachedEvent(continuation.transition));
          return constructResult({
            basis: request.basis,
            transition: continuation.transition,
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
    assuranceProvider: request.assuranceProvider,
    abgFallbackBundle: request.abgFallbackBundle,
    pluginTraversalObserverFallbackEnabled:
      request.pluginTraversalObserverFallbackEnabled,
    pluginTraversalObserverFallbackKinds:
      request.pluginTraversalObserverFallbackKinds
  });
}

export async function runEngineStartAsync(
  request: EngineStartRequest
): Promise<EngineIterateResult> {
  const basis = admitExecutionBasis(request);
  return await runEngineIterateAsync({
    basis,
    runtimeEvents: request.runtimeEvents,
    eventSink: request.eventSink,
    plugins: request.plugins,
    maxAttachedFpAttempts: request.maxAttachedFpAttempts,
    assuranceProvider: request.assuranceProvider,
    abgFallbackBundle: request.abgFallbackBundle,
    pluginTraversalObserverFallbackEnabled:
      request.pluginTraversalObserverFallbackEnabled,
    pluginTraversalObserverFallbackKinds:
      request.pluginTraversalObserverFallbackKinds
  });
}
