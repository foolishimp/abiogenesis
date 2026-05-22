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
  constructFdAuthorityOutcomeAdmittedEvent,
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
  admitConsequenceProjectionOutcome,
  constructEnginePluginInput,
  defaultConsequenceProjectionPlugin,
  defaultFdEvaluatorPlugin,
  defaultFhAdmissionPlugin,
  defaultFpDispatchPlugin,
  type ConsequenceProjectionOutcome,
  type ConsequenceProjectionPlugin,
  type EnginePluginContract,
  type EnginePluginInput,
  type EnginePluginMaybePromise,
  type EngineRunnerPluginSet,
  type FdEvaluationOutcome,
  type FdEvaluatorPlugin,
  type FpDispatchOutcome,
  type FhAdmissionOutcome,
  type FhAdmissionPlugin,
  type FpDispatchPlugin
} from "../contracts/plugins.js";
import type { AbgFallbackBundle } from "../contracts/plugin_traversal_observer.js";
import type { EdgeAssuranceDefaultContract } from "../contracts/edge_assurance_contract.js";
import type { ConstructionPressurePackage } from "../contracts/construction_pressure_package.js";
import type { GtlTargetCarrierDefaultsBundle } from "../../../gtl/m01/contracts/index.js";
import { loadGtlTargetCarrierDefaultsBundle } from "../../../gtl/m01/contracts/index.js";
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
  tryDeriveTraversalStrategySelectionFromGtl,
  type AgenticBackendKind,
  type TraversalAttemptEnvelope,
  type TraversalModulationProfile,
  type TraversalStrategySelection
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
  readonly targetCarrierDefaults?: GtlTargetCarrierDefaultsBundle | undefined;
  readonly abgFallbackBundle?: AbgFallbackBundle | null | undefined;
  readonly edgeAssuranceDefaults?:
    | EdgeAssuranceDefaultContract
    | null
    | undefined;
  readonly pluginTraversalObserverFallbackEnabled?: boolean | undefined;
  readonly pluginTraversalObserverFallbackKinds?:
    | readonly PluginTraversalKind[]
    | undefined;
  readonly constructionPressurePackage?:
    | ConstructionPressurePackage
    | null
    | undefined;
}

export interface EngineStartRequest extends ExecutionBasisAdmissionInput {
  readonly runtimeEvents?: readonly RuntimeEvent[] | undefined;
  readonly eventSink: RuntimeEventSink;
  readonly plugins?: EngineRunnerPluginSet | undefined;
  readonly maxAttachedFpAttempts?: number | undefined;
  readonly assuranceProvider?: EngineAssuranceProvider | undefined;
  readonly targetCarrierDefaults?: GtlTargetCarrierDefaultsBundle | undefined;
  readonly abgFallbackBundle?: AbgFallbackBundle | null | undefined;
  readonly edgeAssuranceDefaults?:
    | EdgeAssuranceDefaultContract
    | null
    | undefined;
  readonly pluginTraversalObserverFallbackEnabled?: boolean | undefined;
  readonly pluginTraversalObserverFallbackKinds?:
    | readonly PluginTraversalKind[]
    | undefined;
  readonly constructionPressurePackage?:
    | ConstructionPressurePackage
    | null
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
  readonly consequenceProjection: ConsequenceProjectionPlugin;
}

function resolveRunnerPlugins(
  plugins: EngineRunnerPluginSet | undefined
): ResolvedRunnerPlugins {
  return Object.freeze({
    fdEvaluator: plugins?.fdEvaluator ?? defaultFdEvaluatorPlugin,
    fpDispatch: plugins?.fpDispatch ?? defaultFpDispatchPlugin,
    fhAdmission: plugins?.fhAdmission ?? defaultFhAdmissionPlugin,
    consequenceProjection:
      plugins?.consequenceProjection ?? defaultConsequenceProjectionPlugin
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
  readonly selection: TraversalStrategySelection;
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
  const selection = tryDeriveTraversalStrategySelectionFromGtl({
    basis: input.basis,
    vectorIndex: input.transition.vectorIndex,
    vector,
    graphFunction: input.basis.graphFunction,
    roles: input.basis.job.roles
  });
  if (selection === null) {
    return null;
  }
  const profile = deriveTraversalModulationProfile({
    basis: input.basis,
    vectorIndex: input.transition.vectorIndex,
    directive: {
      kind: "traversal_strategy_directive",
      directiveRef: selection.directiveRef,
      strategyOwnerRef: selection.strategyOwnerRef,
      strategyLabel: selection.strategyLabel,
      enforcementPrimitives: selection.enforcementPrimitives,
      obligationScheduleRefs: selection.obligationScheduleRefs,
      orderingConstraintRefs: selection.orderingConstraintRefs,
      phaseGateRefs: selection.phaseGateRefs,
      batch: selection.batch
    },
    strategySelection: selection,
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
  return Object.freeze({ selection, profile, envelope });
}

function deriveFpDispatchAttemptInput(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly transition: FpDispatchTransition;
  readonly contract: EnginePluginContract;
  readonly abgFallbackBundle: AbgFallbackBundle | null;
  readonly edgeAssuranceDefaults: EdgeAssuranceDefaultContract | null;
  readonly pluginTraversalObserverFallbackEnabled: boolean;
  readonly pluginTraversalObserverFallbackKinds: readonly PluginTraversalKind[];
  readonly constructionPressurePackage: ConstructionPressurePackage | null;
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
    traversalStrategySelection: modulatedAttempt?.selection ?? null,
    traversalAttemptEnvelope: modulatedAttempt?.envelope ?? null,
    abgFallbackBundle: input.abgFallbackBundle,
    edgeAssuranceDefaults: input.edgeAssuranceDefaults,
    constructionPressurePackage: input.constructionPressurePackage,
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

function fdEvaluationEventStatus(
  outcome: FdEvaluationOutcome
): "accepted" | "blocked" {
  return outcome.routingDecision === "block" ||
    outcome.routingDecision === "route_to_fp"
    ? "blocked"
    : "accepted";
}

function fdAuthorityTerminalTransition(input: {
  readonly basis: ExecutionBasis;
  readonly outcome: FdEvaluationOutcome;
}): TerminalTransition | null {
  if (input.outcome.routingDecision === "block") {
    return terminalTransition(
      input.basis,
      "gap_stop",
      input.outcome.reason ??
        `fd authority blocked traversal: ${input.outcome.severityClass ?? "unknown"}`
    );
  }
  if (input.outcome.routingDecision === "route_to_fp") {
    return terminalTransition(
      input.basis,
      "yielded",
      input.outcome.reason ??
        `fd authority routed content pressure to F_P: ${input.outcome.severityClass ?? "unknown"}`
    );
  }
  return null;
}

function fdAuthorityOutcomeEvent(input: {
  readonly basis: ExecutionBasis;
  readonly transition: Extract<AdvancementTransition, { readonly kind: "fd_advance" }>;
  readonly outcome: FdEvaluationOutcome;
}): RuntimeEvent {
  return constructFdAuthorityOutcomeAdmittedEvent({
    basis: input.basis,
    vectorIndex: input.transition.vectorIndex,
    status: input.outcome.status,
    severityClass: input.outcome.severityClass,
    routingDecision: input.outcome.routingDecision,
    affectedFieldRefs: input.outcome.affectedFieldRefs,
    consumedFieldRefs: input.outcome.consumedFieldRefs,
    pressureRefs: input.outcome.pressureRefs,
    diagnosticRefs: input.outcome.diagnosticRefs,
    evidenceRefs: input.outcome.evidenceRefs,
    causationEventRefs: Object.freeze([input.transition.edge])
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

interface EngineEventEmissionState {
  readonly emittedEvents: readonly RuntimeEvent[];
  readonly replayEvents: readonly RuntimeEvent[];
}

function appendEngineRunnerEvents(input: {
  readonly state: EngineEventEmissionState;
  readonly events: RuntimeEvent | readonly RuntimeEvent[];
  readonly sink: RuntimeEventSink;
}): EngineEventEmissionState {
  const emitted = emit(input.events, input.sink);
  return Object.freeze({
    emittedEvents: Object.freeze([...input.state.emittedEvents, ...emitted]),
    replayEvents: Object.freeze([...input.state.replayEvents, ...emitted])
  });
}

type EnginePluginEffect =
  | {
      readonly kind: "fd_evaluate";
      readonly input: EnginePluginInput;
    }
  | {
      readonly kind: "fp_dispatch";
      readonly input: EnginePluginInput;
    }
  | {
      readonly kind: "fh_admit";
      readonly input: EnginePluginInput;
    }
  | {
      readonly kind: "consequence_project";
      readonly input: EnginePluginInput;
    };

type EnginePluginEffectResult =
  | {
      readonly kind: "fd_evaluate";
      readonly outcome: FdEvaluationOutcome;
    }
  | {
      readonly kind: "fp_dispatch";
      readonly outcome: FpDispatchOutcome;
    }
  | {
      readonly kind: "fh_admit";
      readonly outcome: FhAdmissionOutcome;
    }
  | {
      readonly kind: "consequence_project";
      readonly outcome: ConsequenceProjectionOutcome;
    };

function assertEnginePluginEffectKind(
  result: EnginePluginEffectResult,
  expectedKind: EnginePluginEffectResult["kind"]
): void {
  if (result.kind !== expectedKind) {
    throw new TypeError(
      `Engine plugin effect expected ${expectedKind}, got ${result.kind}`
    );
  }
}

function fdEvaluationOutcomeFromEffectResult(
  result: EnginePluginEffectResult
): FdEvaluationOutcome {
  assertEnginePluginEffectKind(result, "fd_evaluate");
  switch (result.kind) {
    case "fd_evaluate":
      return result.outcome;
    case "fp_dispatch":
    case "fh_admit":
      throw new TypeError("Engine plugin effect expected fd_evaluate");
    case "consequence_project":
      throw new TypeError("Engine plugin effect expected fd_evaluate");
  }
}

function fpDispatchOutcomeFromEffectResult(
  result: EnginePluginEffectResult
): FpDispatchOutcome {
  assertEnginePluginEffectKind(result, "fp_dispatch");
  switch (result.kind) {
    case "fp_dispatch":
      return result.outcome;
    case "fd_evaluate":
    case "fh_admit":
      throw new TypeError("Engine plugin effect expected fp_dispatch");
    case "consequence_project":
      throw new TypeError("Engine plugin effect expected fp_dispatch");
  }
}

function fhAdmissionOutcomeFromEffectResult(
  result: EnginePluginEffectResult
): FhAdmissionOutcome {
  assertEnginePluginEffectKind(result, "fh_admit");
  switch (result.kind) {
    case "fh_admit":
      return result.outcome;
    case "fd_evaluate":
    case "fp_dispatch":
    case "consequence_project":
      throw new TypeError("Engine plugin effect expected fh_admit");
  }
}

function consequenceProjectionOutcomeFromEffectResult(
  result: EnginePluginEffectResult
): ConsequenceProjectionOutcome {
  assertEnginePluginEffectKind(result, "consequence_project");
  switch (result.kind) {
    case "consequence_project":
      return result.outcome;
    case "fd_evaluate":
    case "fp_dispatch":
    case "fh_admit":
      throw new TypeError("Engine plugin effect expected consequence_project");
  }
}

function* runEngineIterateMachine(input: {
  readonly request: EngineIterateRequest;
  readonly plugins: ResolvedRunnerPlugins;
  readonly targetCarrierDefaults: GtlTargetCarrierDefaultsBundle;
}): Generator<EnginePluginEffect, EngineIterateResult, EnginePluginEffectResult> {
  const { request, plugins, targetCarrierDefaults } = input;
  let eventState: EngineEventEmissionState = Object.freeze({
    emittedEvents: Object.freeze([]),
    replayEvents: Object.freeze([...(request.runtimeEvents ?? Object.freeze([]))])
  });
  let iterationCount = 0;

  const emitRunnerEvents = (
    state: EngineEventEmissionState,
    events: RuntimeEvent | readonly RuntimeEvent[]
  ): EngineEventEmissionState =>
    appendEngineRunnerEvents({
      state,
      events,
      sink: request.eventSink
    });

  if (!hasBasisAdmittedEvent(request.basis, eventState.replayEvents)) {
    eventState = emitRunnerEvents(
      eventState,
      constructBasisAdmittedEvent(request.basis)
    );
  }

  while (true) {
    if (iterationCount > request.basis.graph.vectors.length) {
      throw new TypeError(
        "engine iterate runner exceeded replay-derived graph traversal bound"
      );
    }

    const projection = deriveRuntimeAggregateProjection(
      request.basis,
      eventState.replayEvents
    );
    const reentryTransition = deriveActiveReentry({
      basis: request.basis,
      projection,
      replayEvents: eventState.replayEvents
    });
    if (reentryTransition.kind === "reenter_graph_vector") {
      eventState = emitRunnerEvents(eventState,
        reentryPlanEvents({
          basis: request.basis,
          projection,
          replayEvents: eventState.replayEvents
        })
      );
      continue;
    }
    if (reentryTransition.kind === "reenter_constitutional_route") {
      eventState = emitRunnerEvents(eventState,
        reentryPlanEvents({
          basis: request.basis,
          projection,
          replayEvents: eventState.replayEvents
        })
      );
      const yielded = terminalTransition(
        request.basis,
        "yielded",
        `graph reentry yielded to ${reentryTransition.changeClass}:${reentryTransition.reEntryPoint}`
      );
      eventState = emitRunnerEvents(eventState, constructTerminalReachedEvent(yielded));
      return constructResult({
        basis: request.basis,
        transition: yielded,
        projection: deriveRuntimeAggregateProjection(request.basis, eventState.replayEvents),
        emittedEvents: eventState.emittedEvents,
        replayEvents: eventState.replayEvents,
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
      eventState = emitRunnerEvents(eventState, constructTerminalReachedEvent(blocked));
      return constructResult({
        basis: request.basis,
        transition: blocked,
        projection: deriveRuntimeAggregateProjection(request.basis, eventState.replayEvents),
        emittedEvents: eventState.emittedEvents,
        replayEvents: eventState.replayEvents,
        iterationCount
      });
    }
    const decision = reentryTransition.decision;
    const transition = deriveAdvancementTransition(request.basis, eventState.replayEvents);

    if (decision.kind === "converged") {
      if (transition.kind !== "terminal") {
        throw new TypeError("engine iterate expected terminal transition");
      }
      const assuranceGate = evaluateAssuranceGate({
        basis: request.basis,
        projection,
        replayEvents: eventState.replayEvents,
        targetCarrierDefaults,
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
        eventState = emitRunnerEvents(eventState, constructTerminalReachedEvent(blocked));
        return constructResult({
          basis: request.basis,
          transition: blocked,
          projection: deriveRuntimeAggregateProjection(request.basis, eventState.replayEvents),
          emittedEvents: eventState.emittedEvents,
          replayEvents: eventState.replayEvents,
          iterationCount,
          assuranceGate
        });
      }
      eventState = emitRunnerEvents(eventState, constructTerminalReachedEvent(transition));
      return constructResult({
        basis: request.basis,
        transition,
        projection: deriveRuntimeAggregateProjection(request.basis, eventState.replayEvents),
        emittedEvents: eventState.emittedEvents,
        replayEvents: eventState.replayEvents,
        iterationCount,
        assuranceGate
      });
    }

    eventState = emitRunnerEvents(eventState, runtimeEventsForIterationDecision(decision));

    switch (transition.kind) {
      case "fd_advance": {
        const input = constructEnginePluginInput({
          contract: plugins.fdEvaluator.contract,
          basis: request.basis,
          projection,
          replayEvents: eventState.replayEvents,
          vectorIndex: transition.vectorIndex,
          edge: transition.edge,
          regime: "F_D",
          abgFallbackBundle: request.abgFallbackBundle ?? null,
          edgeAssuranceDefaults: request.edgeAssuranceDefaults ?? null,
          constructionPressurePackage:
            request.constructionPressurePackage ?? null,
          pluginTraversalObserverFallbackEnabled:
            request.pluginTraversalObserverFallbackEnabled ?? false,
          pluginTraversalObserverFallbackKinds:
            request.pluginTraversalObserverFallbackKinds ?? Object.freeze([])
        });
        if (input.pluginTraversalObserverBinding !== null) {
          eventState = emitRunnerEvents(eventState,
            constructPluginTraversalPromptMaterializedEvent({
              basis: request.basis,
              vectorIndex: transition.vectorIndex,
              selection: input.pluginTraversalObserverBinding,
              causationEventRefs: Object.freeze([input.sourceProjectionRef]),
              correlationId: [
                "plugin-traversal",
                request.basis.id,
                String(transition.vectorIndex),
                "evaluate"
              ].join(":")
            })
          );
        }
        const outcome = fdEvaluationOutcomeFromEffectResult(
          yield Object.freeze({ kind: "fd_evaluate", input }),
        );
        eventState = emitRunnerEvents(eventState,
          fdAuthorityOutcomeEvent({
            basis: request.basis,
            transition,
            outcome
          })
        );
        eventState = emitRunnerEvents(eventState,
          constructVectorEvaluatedEvent({
            basis: request.basis,
            vectorIndex: transition.vectorIndex,
            status: fdEvaluationEventStatus(outcome)
          })
        );
        const fdTerminal = fdAuthorityTerminalTransition({
          basis: request.basis,
          outcome
        });
        if (fdTerminal !== null) {
          eventState = emitRunnerEvents(eventState, constructTerminalReachedEvent(fdTerminal));
          return constructResult({
            basis: request.basis,
            transition: fdTerminal,
            projection: deriveRuntimeAggregateProjection(request.basis, eventState.replayEvents),
            emittedEvents: eventState.emittedEvents,
            replayEvents: eventState.replayEvents,
            iterationCount
          });
        }
        eventState = emitRunnerEvents(eventState, [
          constructVectorClosedEvent({
            basis: request.basis,
            vectorIndex: transition.vectorIndex,
            closureKind: "advanced"
          }),
          constructFdAdvanceReadyEvent(transition)
        ]);
        const consequenceProjection = deriveRuntimeAggregateProjection(
          request.basis,
          eventState.replayEvents
        );
        const consequenceInput = constructEnginePluginInput({
          contract: plugins.consequenceProjection.contract,
          basis: request.basis,
          projection: consequenceProjection,
          replayEvents: eventState.replayEvents,
          vectorIndex: transition.vectorIndex,
          edge: transition.edge,
          regime: "F_D",
          abgFallbackBundle: request.abgFallbackBundle ?? null,
          edgeAssuranceDefaults: request.edgeAssuranceDefaults ?? null,
          constructionPressurePackage:
            request.constructionPressurePackage ?? null,
          pluginTraversalObserverFallbackEnabled:
            request.pluginTraversalObserverFallbackEnabled ?? false,
          pluginTraversalObserverFallbackKinds:
            request.pluginTraversalObserverFallbackKinds ?? Object.freeze([])
        });
        if (consequenceInput.pluginTraversalObserverBinding !== null) {
          eventState = emitRunnerEvents(eventState,
            constructPluginTraversalPromptMaterializedEvent({
              basis: request.basis,
              vectorIndex: transition.vectorIndex,
              selection: consequenceInput.pluginTraversalObserverBinding,
              causationEventRefs: Object.freeze([
                consequenceInput.sourceProjectionRef
              ]),
              correlationId: [
                "plugin-traversal",
                request.basis.id,
                String(transition.vectorIndex),
                "consequence"
              ].join(":")
            })
          );
        }
        const consequenceOutcome = consequenceProjectionOutcomeFromEffectResult(
          yield Object.freeze({
            kind: "consequence_project",
            input: consequenceInput
          })
        );
        if (consequenceOutcome.status === "blocked") {
          const blocked = terminalTransition(
            request.basis,
            "gap_stop",
            consequenceOutcome.reason ?? "consequence projection plugin blocked traversal"
          );
          eventState = emitRunnerEvents(eventState, constructTerminalReachedEvent(blocked));
          return constructResult({
            basis: request.basis,
            transition: blocked,
            projection: deriveRuntimeAggregateProjection(request.basis, eventState.replayEvents),
            emittedEvents: eventState.emittedEvents,
            replayEvents: eventState.replayEvents,
            iterationCount
          });
        }
        iterationCount += 1;
        if (request.basis.startIntent.until === "first_traversal") {
          return constructResult({
            basis: request.basis,
            transition,
            projection: deriveRuntimeAggregateProjection(request.basis, eventState.replayEvents),
            emittedEvents: eventState.emittedEvents,
            replayEvents: eventState.replayEvents,
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
          replayEvents: eventState.replayEvents,
          contract: plugins.fpDispatch.contract,
          abgFallbackBundle: request.abgFallbackBundle ?? null,
          edgeAssuranceDefaults: request.edgeAssuranceDefaults ?? null,
          constructionPressurePackage:
            request.constructionPressurePackage ?? null,
          pluginTraversalObserverFallbackEnabled:
            request.pluginTraversalObserverFallbackEnabled ?? false,
          pluginTraversalObserverFallbackKinds:
            request.pluginTraversalObserverFallbackKinds ?? Object.freeze([])
        });
        const { actorInvocation, modulatedAttempt, pluginInput: input } = attempt;
        eventState = emitRunnerEvents(eventState,
          fpDispatchAttemptStartedEvents({
            basis: request.basis,
            transition,
            actorInvocation,
            modulatedAttempt,
            pluginInput: input
          })
        );
        const outcome = fpDispatchOutcomeFromEffectResult(
          yield Object.freeze({ kind: "fp_dispatch", input }),
        );
        if (outcome.attachedResultArtifact !== null) {
          const resultRef = resultRefForActorOutcome({
            invocation: actorInvocation,
            outcomeResultRef: outcome.resultRef
          });
          eventState = emitRunnerEvents(eventState,
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
          eventState = emitRunnerEvents(eventState,
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
            eventState = emitRunnerEvents(eventState,
              constructVectorEvaluatedEvent({
                basis: request.basis,
                vectorIndex: transition.vectorIndex,
                status: "accepted"
              })
            );
            eventState = emitRunnerEvents(eventState, attachedDecision.payloadEvents);
            eventState = emitRunnerEvents(eventState,
              constructVectorClosedEvent({
                basis: request.basis,
                vectorIndex: transition.vectorIndex,
                closureKind: "assessed"
              })
            );
            const consequenceProjection = deriveRuntimeAggregateProjection(
              request.basis,
              eventState.replayEvents
            );
            const consequenceInput = constructEnginePluginInput({
              contract: plugins.consequenceProjection.contract,
              basis: request.basis,
              projection: consequenceProjection,
              replayEvents: eventState.replayEvents,
              vectorIndex: transition.vectorIndex,
              edge: transition.edge,
              regime: "F_D",
              abgFallbackBundle: request.abgFallbackBundle ?? null,
              edgeAssuranceDefaults: request.edgeAssuranceDefaults ?? null,
              constructionPressurePackage:
                request.constructionPressurePackage ?? null,
              pluginTraversalObserverFallbackEnabled:
                request.pluginTraversalObserverFallbackEnabled ?? false,
              pluginTraversalObserverFallbackKinds:
                request.pluginTraversalObserverFallbackKinds ?? Object.freeze([])
            });
            if (consequenceInput.pluginTraversalObserverBinding !== null) {
              eventState = emitRunnerEvents(eventState,
                constructPluginTraversalPromptMaterializedEvent({
                  basis: request.basis,
                  vectorIndex: transition.vectorIndex,
                  selection: consequenceInput.pluginTraversalObserverBinding,
                  causationEventRefs: Object.freeze([
                    consequenceInput.sourceProjectionRef
                  ]),
                  correlationId: [
                    "plugin-traversal",
                    request.basis.id,
                    String(transition.vectorIndex),
                    "consequence"
                  ].join(":")
                })
              );
            }
            const consequenceOutcome = consequenceProjectionOutcomeFromEffectResult(
              yield Object.freeze({
                kind: "consequence_project",
                input: consequenceInput
              })
            );
            if (consequenceOutcome.status === "blocked") {
              const blocked = terminalTransition(
                request.basis,
                "gap_stop",
                consequenceOutcome.reason ?? "consequence projection plugin blocked traversal"
              );
              eventState = emitRunnerEvents(eventState, constructTerminalReachedEvent(blocked));
              return constructResult({
                basis: request.basis,
                transition: blocked,
                projection: deriveRuntimeAggregateProjection(request.basis, eventState.replayEvents),
                emittedEvents: eventState.emittedEvents,
                replayEvents: eventState.replayEvents,
                iterationCount
              });
            }
            iterationCount += 1;
            if (request.basis.startIntent.until === "first_traversal") {
              const applied = terminalTransition(
                request.basis,
                "traversal_applied",
                "attached F_P result assessed"
              );
              eventState = emitRunnerEvents(eventState, constructTerminalReachedEvent(applied));
              return constructResult({
                basis: request.basis,
                transition: applied,
                projection: deriveRuntimeAggregateProjection(request.basis, eventState.replayEvents),
                emittedEvents: eventState.emittedEvents,
                replayEvents: eventState.replayEvents,
                iterationCount
              });
            }
            break;
          }
          eventState = emitRunnerEvents(eventState,
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
            eventState = emitRunnerEvents(eventState, constructTerminalReachedEvent(bounded));
            return constructResult({
              basis: request.basis,
              transition: bounded,
              projection: deriveRuntimeAggregateProjection(request.basis, eventState.replayEvents),
              emittedEvents: eventState.emittedEvents,
              replayEvents: eventState.replayEvents,
              iterationCount
            });
          }
          eventState = emitRunnerEvents(eventState, attachedDecision.retryEvents);
          if (attachedDecision.kind === "retry_planned") {
            break;
          }
          const blocked = terminalTransition(
            request.basis,
            attachedDecision.terminalKind,
            attachedDecision.reason
          );
          eventState = emitRunnerEvents(eventState, constructTerminalReachedEvent(blocked));
          return constructResult({
            basis: request.basis,
            transition: blocked,
            projection: deriveRuntimeAggregateProjection(request.basis, eventState.replayEvents),
            emittedEvents: eventState.emittedEvents,
            replayEvents: eventState.replayEvents,
            iterationCount
          });
        }
        eventState = emitRunnerEvents(eventState,
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
            projection: deriveRuntimeAggregateProjection(request.basis, eventState.replayEvents),
            transition,
            actorInvocation,
            outcome,
            maxAttempts:
              request.maxAttachedFpAttempts ??
              DEFAULT_ATTACHED_FP_MAX_RETRY_ATTEMPTS
          });
          if (continuation.kind === "retry") {
            eventState = emitRunnerEvents(eventState,
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
              eventState = emitRunnerEvents(eventState, constructTerminalReachedEvent(bounded));
              return constructResult({
                basis: request.basis,
                transition: bounded,
                projection: deriveRuntimeAggregateProjection(request.basis, eventState.replayEvents),
                emittedEvents: eventState.emittedEvents,
                replayEvents: eventState.replayEvents,
                iterationCount
              });
            }
            eventState = emitRunnerEvents(eventState, continuation.retryEvents);
            break;
          }
          eventState = emitRunnerEvents(eventState,
            fpDispatchAttemptNonProgressEvents({
              basis: request.basis,
              modulatedAttempt,
              continuation
            })
          );
          eventState = emitRunnerEvents(eventState, constructTerminalReachedEvent(continuation.transition));
          return constructResult({
            basis: request.basis,
            transition: continuation.transition,
            projection: deriveRuntimeAggregateProjection(request.basis, eventState.replayEvents),
            emittedEvents: eventState.emittedEvents,
            replayEvents: eventState.replayEvents,
            iterationCount
          });
        }
        return constructResult({
          basis: request.basis,
          transition,
          projection: deriveRuntimeAggregateProjection(request.basis, eventState.replayEvents),
          emittedEvents: eventState.emittedEvents,
          replayEvents: eventState.replayEvents,
          iterationCount
        });
      }
      case "fh_escalation": {
        const input = constructEnginePluginInput({
          contract: plugins.fhAdmission.contract,
          basis: request.basis,
          projection,
          replayEvents: eventState.replayEvents,
          vectorIndex: transition.vectorIndex,
          edge: transition.edge,
          regime: "F_H",
          edgeAssuranceDefaults: request.edgeAssuranceDefaults ?? null,
          constructionPressurePackage:
            request.constructionPressurePackage ?? null
        });
        const outcome = fhAdmissionOutcomeFromEffectResult(
          yield Object.freeze({ kind: "fh_admit", input }),
        );
        if (outcome.status === "blocked") {
          const blocked = terminalTransition(
            request.basis,
            "gap_stop",
            outcome.reason ?? "fh admission plugin blocked traversal"
          );
          eventState = emitRunnerEvents(eventState, constructTerminalReachedEvent(blocked));
          return constructResult({
            basis: request.basis,
            transition: blocked,
            projection: deriveRuntimeAggregateProjection(request.basis, eventState.replayEvents),
            emittedEvents: eventState.emittedEvents,
            replayEvents: eventState.replayEvents,
            iterationCount
          });
        }
        eventState = emitRunnerEvents(eventState, constructFhEscalatedEvent(transition));
        return constructResult({
          basis: request.basis,
          transition,
          projection: deriveRuntimeAggregateProjection(request.basis, eventState.replayEvents),
          emittedEvents: eventState.emittedEvents,
          replayEvents: eventState.replayEvents,
          iterationCount
        });
      }
      case "terminal":
        eventState = emitRunnerEvents(eventState, constructTerminalReachedEvent(transition));
        return constructResult({
          basis: request.basis,
          transition,
          projection: deriveRuntimeAggregateProjection(request.basis, eventState.replayEvents),
          emittedEvents: eventState.emittedEvents,
          replayEvents: eventState.replayEvents,
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

function resolveSyncEnginePluginEffect(
  effect: EnginePluginEffect,
  plugins: ResolvedRunnerPlugins
): EnginePluginEffectResult {
  switch (effect.kind) {
    case "fd_evaluate":
      return Object.freeze({
        kind: "fd_evaluate",
        outcome: admitFdEvaluationOutcome(
          resolveSyncPluginOutcome(
            plugins.fdEvaluator.evaluate(effect.input),
            "fd evaluator plugin"
          )
        )
      });
    case "fp_dispatch":
      return Object.freeze({
        kind: "fp_dispatch",
        outcome: admitFpDispatchOutcome(
          resolveSyncPluginOutcome(
            plugins.fpDispatch.dispatch(effect.input),
            "fp dispatch plugin"
          )
        )
      });
    case "fh_admit":
      return Object.freeze({
        kind: "fh_admit",
        outcome: admitFhAdmissionOutcome(
          resolveSyncPluginOutcome(
            plugins.fhAdmission.admit(effect.input),
            "fh admission plugin"
          )
        )
      });
    case "consequence_project":
      return Object.freeze({
        kind: "consequence_project",
        outcome: admitConsequenceProjectionOutcome(
          resolveSyncPluginOutcome(
            plugins.consequenceProjection.project(effect.input),
            "consequence projection plugin"
          )
        )
      });
  }
}

async function resolveAsyncEnginePluginEffect(
  effect: EnginePluginEffect,
  plugins: ResolvedRunnerPlugins
): Promise<EnginePluginEffectResult> {
  switch (effect.kind) {
    case "fd_evaluate":
      return Object.freeze({
        kind: "fd_evaluate",
        outcome: admitFdEvaluationOutcome(
          await plugins.fdEvaluator.evaluate(effect.input)
        )
      });
    case "fp_dispatch":
      return Object.freeze({
        kind: "fp_dispatch",
        outcome: admitFpDispatchOutcome(
          await plugins.fpDispatch.dispatch(effect.input)
        )
      });
    case "fh_admit":
      return Object.freeze({
        kind: "fh_admit",
        outcome: admitFhAdmissionOutcome(
          await plugins.fhAdmission.admit(effect.input)
        )
      });
    case "consequence_project":
      return Object.freeze({
        kind: "consequence_project",
        outcome: admitConsequenceProjectionOutcome(
          await plugins.consequenceProjection.project(effect.input)
        )
      });
  }
}

export function runEngineIterate(
  request: EngineIterateRequest
): EngineIterateResult {
  const plugins = resolveRunnerPlugins(request.plugins);
  const targetCarrierDefaults =
    request.targetCarrierDefaults ?? loadGtlTargetCarrierDefaultsBundle();
  const machine = runEngineIterateMachine({
    request,
    plugins,
    targetCarrierDefaults
  });
  let step = machine.next();
  while (!step.done) {
    step = machine.next(resolveSyncEnginePluginEffect(step.value, plugins));
  }
  return step.value;
}

export async function runEngineIterateAsync(
  request: EngineIterateRequest
): Promise<EngineIterateResult> {
  const plugins = resolveRunnerPlugins(request.plugins);
  const targetCarrierDefaults =
    request.targetCarrierDefaults ?? loadGtlTargetCarrierDefaultsBundle();
  const machine = runEngineIterateMachine({
    request,
    plugins,
    targetCarrierDefaults
  });
  let step = machine.next();
  while (!step.done) {
    step = machine.next(await resolveAsyncEnginePluginEffect(step.value, plugins));
  }
  return step.value;
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
    targetCarrierDefaults: request.targetCarrierDefaults,
    abgFallbackBundle: request.abgFallbackBundle,
    pluginTraversalObserverFallbackEnabled:
      request.pluginTraversalObserverFallbackEnabled,
    pluginTraversalObserverFallbackKinds:
      request.pluginTraversalObserverFallbackKinds,
    constructionPressurePackage: request.constructionPressurePackage
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
    targetCarrierDefaults: request.targetCarrierDefaults,
    abgFallbackBundle: request.abgFallbackBundle,
    pluginTraversalObserverFallbackEnabled:
      request.pluginTraversalObserverFallbackEnabled,
    pluginTraversalObserverFallbackKinds:
      request.pluginTraversalObserverFallbackKinds,
    constructionPressurePackage: request.constructionPressurePackage
  });
}
