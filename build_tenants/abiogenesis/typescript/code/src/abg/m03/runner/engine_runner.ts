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
  PayloadAmbiguityStatus,
  PayloadClosureDecisionKind,
  PluginTraversalKind,
  RuntimeAggregateProjection,
  RuntimeEvent,
  TerminalTransition
} from "../contracts/carriers.js";
import {
  constructActorInvocationClosedEvent,
  constructActorInvocationStartedEvent,
  constructActorResultArtifactObservedEvent,
  constructAmbiguityObservationAdmittedEvent,
  constructAuthoritySnapshotAdmittedEvent,
  constructBasisAdmittedEvent,
  constructClosureInputPublishedEvent,
  constructEvidenceAdmittedEvent,
  constructFdAuthorityOutcomeAdmittedEvent,
  constructFdAdvanceReadyEvent,
  constructFhEscalatedEvent,
  constructFpDispatchRequestedEvent,
  constructPayloadObservedEvent,
  constructPayloadValidatedEvent,
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
  admitFpEvaluationOutcome,
  admitFhAdmissionOutcome,
  admitFpDispatchOutcome,
  admitConsequenceProjectionOutcome,
  constructEnginePluginInput,
  defaultConsequenceProjectionPlugin,
  defaultFdEvaluatorPlugin,
  defaultFhAdmissionPlugin,
  defaultFpDispatchPlugin,
  missingFpEvaluatorPlugin,
  type ConsequenceProjectionOutcome,
  type ConsequenceProjectionPlugin,
  type EnginePluginContract,
  type EnginePluginInput,
  type EnginePluginMaybePromise,
  type EngineRunnerPluginSet,
  type ComposedStageTaskPlugin,
  type EvaluationRulePlugin,
  type FdEvaluationOutcome,
  type FdEvaluatorPlugin,
  type FpEvaluationFinding,
  type FpEvaluationOutcome,
  type FpEvaluatorPlugin,
  type FpDispatchOutcome,
  type FhAdmissionOutcome,
  type FhAdmissionPlugin,
  type FpDispatchPlugin
} from "../contracts/plugins.js";
import {
  admitEvaluationRuleOutcome,
  constructEvaluationRuleDeclaration,
  constructEvaluationRuleOutcome,
  constructEvaluationSetAdmission,
  constructEvaluationSetPlan,
  constructEvaluationSetProjection,
  type EvaluationRuleDeclaration,
  type EvaluationRuleOutcome,
  type EvaluationRuleRole,
  type EvaluationSetPlan,
  type EvaluationSetProjection
} from "../contracts/evaluation_set.js";
import {
  admitComposedStageTaskOutcome,
  assertComposedStageTaskOutcomeMatchesDeclaration,
  constructComposedStageAdmission,
  constructComposedStageProjection,
  constructComposedStageSetPlan,
  constructComposedStageTaskDeclaration,
  constructComposedStageTaskOutcome,
  type ComposedStageAdmission,
  type ComposedStageRole,
  type ComposedStageSetPlan,
  type ComposedStageTaskDeclaration,
  type ComposedStageTaskOutcome
} from "../contracts/composed_stage_set.js";
import type { AbgFallbackBundle } from "../contracts/plugin_traversal_observer.js";
import type { EdgeAssuranceDefaultContract } from "../contracts/edge_assurance_contract.js";
import type { ConstructionPressurePackage } from "../contracts/construction_pressure_package.js";
import type { GtlTargetCarrierDefaultsBundle } from "../../../gtl/m01/contracts/index.js";
import { loadGtlTargetCarrierDefaultsBundle } from "../../../gtl/m01/contracts/index.js";
import {
  constructAssuranceAuthoritySnapshot,
  deriveAssuranceClosureDecision,
  deriveAssuranceProjection,
  deriveAssuranceScopeRef
} from "../contracts/assurance.js";
import {
  deriveAssuranceAuthoritySnapshotFromPayloadLedger,
  deriveAssuranceEvidenceRowsFromPayloadLedger,
  derivePayloadLedgerProjection
} from "../contracts/payload_ledger.js";
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
import { stableSha256Digest } from "../../../shared/runtime_identity.js";

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
  readonly fpEvaluator: FpEvaluatorPlugin;
  readonly fpDispatch: FpDispatchPlugin;
  readonly fhAdmission: FhAdmissionPlugin;
  readonly consequenceProjection: ConsequenceProjectionPlugin;
  readonly transformTasks: readonly ComposedStageTaskPlugin[];
  readonly requiredTransformTaskRefs: readonly string[];
  readonly evaluationRules: readonly EvaluationRulePlugin[];
  readonly requiredEvaluationRuleRefs: readonly string[];
  readonly consequenceTasks: readonly ComposedStageTaskPlugin[];
  readonly requiredConsequenceTaskRefs: readonly string[];
}

function resolveRunnerPlugins(
  plugins: EngineRunnerPluginSet | undefined
): ResolvedRunnerPlugins {
  return Object.freeze({
    fdEvaluator: plugins?.fdEvaluator ?? defaultFdEvaluatorPlugin,
    fpEvaluator: plugins?.fpEvaluator ?? missingFpEvaluatorPlugin,
    fpDispatch: plugins?.fpDispatch ?? defaultFpDispatchPlugin,
    fhAdmission: plugins?.fhAdmission ?? defaultFhAdmissionPlugin,
    consequenceProjection:
      plugins?.consequenceProjection ?? defaultConsequenceProjectionPlugin,
    transformTasks: Object.freeze([...(plugins?.transformTasks ?? Object.freeze([]))]),
    requiredTransformTaskRefs: Object.freeze([
      ...(plugins?.requiredTransformTaskRefs ?? Object.freeze([]))
    ]),
    evaluationRules: Object.freeze([...(plugins?.evaluationRules ?? Object.freeze([]))]),
    requiredEvaluationRuleRefs: Object.freeze([
      ...(plugins?.requiredEvaluationRuleRefs ?? Object.freeze([]))
    ]),
    consequenceTasks: Object.freeze([...(plugins?.consequenceTasks ?? Object.freeze([]))]),
    requiredConsequenceTaskRefs: Object.freeze([
      ...(plugins?.requiredConsequenceTaskRefs ?? Object.freeze([]))
    ])
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

function fpEvaluationDigest(input: unknown): string {
  return stableSha256Digest(input);
}

function fpEvaluationFindingPayloadRef(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly finding: FpEvaluationFinding;
}): string {
  return `payload:fp_evaluation:${fpEvaluationDigest({
    basisId: input.basis.id,
    vectorIndex: input.vectorIndex,
    findingRef: input.finding.findingRef
  })}`;
}

function uniqueStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)]);
}

interface PlannedEvaluationRule {
  readonly pluginIndex: number;
  readonly plugin: EvaluationRulePlugin;
  readonly pluginInput: EnginePluginInput;
  readonly declaration: EvaluationRuleDeclaration;
}

interface PlannedComposedStageTask {
  readonly pluginIndex: number;
  readonly plugin: ComposedStageTaskPlugin;
  readonly pluginInput: EnginePluginInput;
  readonly declaration: ComposedStageTaskDeclaration;
}

function plannedComposedStageTaskForPlugin(input: {
  readonly stageRole: ComposedStageRole;
  readonly plugin: ComposedStageTaskPlugin;
  readonly pluginIndex: number;
  readonly pluginInput: EnginePluginInput;
}): PlannedComposedStageTask {
  if (input.plugin.contract.computeStageRole !== input.stageRole) {
    throw new TypeError("Composed stage task plugin contract stage mismatch");
  }
  if (input.plugin.contract.computeMeans === null) {
    throw new TypeError("Composed stage task plugin contract requires compute means");
  }
  const declaration = constructComposedStageTaskDeclaration({
    taskRef: input.plugin.taskRef,
    stageRole: input.stageRole,
    taskRole: input.plugin.taskRole,
    selectedCompositionRef: input.pluginInput.selectedCompositionRef,
    selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
    selectedCompositionSelectionRef:
      input.pluginInput.selectedCompositionSelectionRef,
    selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef,
    computeMeans: input.plugin.contract.computeMeans,
    inputLedgerRefs:
      input.plugin.inputLedgerRefs ?? [input.pluginInput.sourceProjectionRef],
    outputCarrierRefs:
      input.plugin.outputCarrierRefs ?? [input.plugin.contract.outputCarrier],
    required: input.plugin.required ?? true,
    parallelGroupRef: input.plugin.parallelGroupRef ?? null,
    dependencyRefs: input.plugin.dependencyRefs ?? Object.freeze([])
  });
  return Object.freeze({
    pluginIndex: input.pluginIndex,
    plugin: input.plugin,
    pluginInput: input.pluginInput,
    declaration
  });
}

function scalarTransformTaskDeclaration(
  pluginInput: EnginePluginInput
): ComposedStageTaskDeclaration {
  return constructComposedStageTaskDeclaration({
    taskRef: `stage-task:transform:fp-dispatch:${fpEvaluationDigest({
      selectedCompositionRef: pluginInput.selectedCompositionRef,
      selectedRegimeBindingRef: pluginInput.selectedRegimeBindingRef,
      vectorIndex: pluginInput.vectorIndex,
      edge: pluginInput.edge
    })}`,
    stageRole: "transform",
    taskRole: "candidate",
    selectedCompositionRef: pluginInput.selectedCompositionRef,
    selectedCompositionDigest: pluginInput.selectedCompositionDigest,
    selectedCompositionSelectionRef: pluginInput.selectedCompositionSelectionRef,
    selectedRegimeBindingRef: pluginInput.selectedRegimeBindingRef,
    computeMeans: "F_P",
    inputLedgerRefs: [pluginInput.sourceProjectionRef],
    outputCarrierRefs: ["FpDispatchOutcome"],
    required: false,
    parallelGroupRef: null,
    dependencyRefs: Object.freeze([])
  });
}

function scalarConsequenceTaskDeclaration(
  pluginInput: EnginePluginInput
): ComposedStageTaskDeclaration {
  return constructComposedStageTaskDeclaration({
    taskRef: `stage-task:consequence:projection:${fpEvaluationDigest({
      selectedCompositionRef: pluginInput.selectedCompositionRef,
      selectedRegimeBindingRef: pluginInput.selectedRegimeBindingRef,
      vectorIndex: pluginInput.vectorIndex,
      edge: pluginInput.edge
    })}`,
    stageRole: "consequence",
    taskRole: "projection",
    selectedCompositionRef: pluginInput.selectedCompositionRef,
    selectedCompositionDigest: pluginInput.selectedCompositionDigest,
    selectedCompositionSelectionRef: pluginInput.selectedCompositionSelectionRef,
    selectedRegimeBindingRef: pluginInput.selectedRegimeBindingRef,
    computeMeans: "F_D",
    inputLedgerRefs: [pluginInput.sourceProjectionRef],
    outputCarrierRefs: ["ConsequenceProjectionOutcome"],
    required: true,
    parallelGroupRef: null,
    dependencyRefs: Object.freeze([])
  });
}

function composedStageTaskBatches(
  plannedTasks: readonly PlannedComposedStageTask[],
  scalarTask: ComposedStageTaskDeclaration
): readonly (readonly ComposedStageTaskDeclaration[])[] {
  const grouped = new Map<string, ComposedStageTaskDeclaration[]>();
  const order: string[] = [];
  plannedTasks.forEach((plannedTask, index) => {
    const key =
      plannedTask.declaration.parallelGroupRef ?? `serial:${String(index)}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
      order.push(key);
    }
    grouped.get(key)?.push(plannedTask.declaration);
  });
  const batches = order.map((key) =>
    Object.freeze(
      [...(grouped.get(key) ?? [])].sort((left, right) =>
        left.taskRef.localeCompare(right.taskRef)
      )
    )
  );
  return Object.freeze([...batches, Object.freeze([scalarTask])]);
}

function composedStageSetPlanForStage(input: {
  readonly basis: ExecutionBasis;
  readonly stageRole: ComposedStageRole;
  readonly scalarStageInput: EnginePluginInput;
  readonly scalarTask: ComposedStageTaskDeclaration;
  readonly plannedTasks: readonly PlannedComposedStageTask[];
  readonly requiredTaskRefs: readonly string[];
}): ComposedStageSetPlan {
  return constructComposedStageSetPlan({
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    vectorIndex: input.scalarStageInput.vectorIndex,
    edge: input.scalarStageInput.edge,
    stageRole: input.stageRole,
    selectedCompositionRef: input.scalarStageInput.selectedCompositionRef,
    selectedCompositionDigest: input.scalarStageInput.selectedCompositionDigest,
    selectedCompositionSelectionRef:
      input.scalarStageInput.selectedCompositionSelectionRef,
    taskBatches: composedStageTaskBatches(input.plannedTasks, input.scalarTask),
    requiredTaskRefs: input.requiredTaskRefs,
    readOnlyInputRefs: uniqueStrings([
      input.scalarStageInput.sourceProjectionRef,
      ...input.plannedTasks.flatMap(
        (plannedTask) => plannedTask.declaration.inputLedgerRefs
      )
    ])
  });
}

function composedStageTaskOutcomePayloadRef(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly outcome: ComposedStageTaskOutcome;
}): string {
  return `payload:composed_stage_task:${fpEvaluationDigest({
    basisId: input.basis.id,
    vectorIndex: input.vectorIndex,
    stageRole: input.outcome.stageRole,
    taskRef: input.outcome.taskRef,
    status: input.outcome.status
  })}`;
}

function composedStageTaskOutcomeCoreEvents(input: {
  readonly basis: ExecutionBasis;
  readonly pluginInput: EnginePluginInput;
  readonly outcome: ComposedStageTaskOutcome;
}): readonly RuntimeEvent[] {
  const payloadRef = composedStageTaskOutcomePayloadRef({
    basis: input.basis,
    vectorIndex: input.pluginInput.vectorIndex,
    outcome: input.outcome
  });
  const digest = `digest:composed_stage_task:${fpEvaluationDigest(input.outcome)}`;
  return Object.freeze([
    constructPayloadObservedEvent({
      basis: input.basis,
      vectorIndex: input.pluginInput.vectorIndex,
      payloadRef,
      payloadClass: "composed_stage_task_outcome",
      contractRef: "contract://abg/composed-stage-task-outcome",
      digest,
      producerRef: input.pluginInput.contract.ref,
      sourceEventRef: input.pluginInput.sourceProjectionRef,
      actorInvocationId:
        input.pluginInput.actorInvocationRef?.actorInvocationId ?? null,
      authorityRef: input.outcome.taskRef,
      inputDigest: `input:composed_stage_task:${fpEvaluationDigest({
        sourceProjectionRef: input.pluginInput.sourceProjectionRef,
        selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
        stageRole: input.outcome.stageRole
      })}`,
      policyRefs: [input.basis.resolvedPolicy.resolvedPolicyBundleRef]
    }),
    constructPayloadValidatedEvent({
      basis: input.basis,
      vectorIndex: input.pluginInput.vectorIndex,
      payloadRef,
      contractRef: "contract://abg/composed-stage-task-outcome",
      digest,
      validationRef: `validation:composed_stage_task:${payloadRef}`,
      evidenceRef: input.outcome.evidenceRefs[0] ?? null,
      policyRefs: [input.basis.resolvedPolicy.resolvedPolicyBundleRef]
    })
  ]);
}

function composedStageSetBlockingReason(input: {
  readonly admission: ComposedStageAdmission;
  readonly requiredTaskRefs: readonly string[];
  readonly ignoreMissingTaskRefs?: readonly string[] | undefined;
}): string | null {
  const ignoredMissing = new Set(input.ignoreMissingTaskRefs ?? Object.freeze([]));
  const requiredTaskRefs = new Set(input.requiredTaskRefs);
  const missingRequiredTaskRefs = input.admission.missingRequiredTaskRefs.filter(
    (taskRef) => !ignoredMissing.has(taskRef)
  );
  const rejectedRequiredTaskRefs = input.admission.rejectedTaskOutcomes
    .filter((taskOutcome) => requiredTaskRefs.has(taskOutcome.taskRef))
    .map((taskOutcome) =>
      [`blocked:${taskOutcome.taskRef}`, taskOutcome.reason ?? null]
        .filter((part): part is string => part !== null)
        .join(":")
    );
  if (
    missingRequiredTaskRefs.length === 0 &&
    rejectedRequiredTaskRefs.length === 0
  ) {
    return null;
  }
  return [
    `${input.admission.stageRole}_stage_set_incomplete`,
    ...missingRequiredTaskRefs.map((taskRef) => `missing:${taskRef}`),
    ...rejectedRequiredTaskRefs
  ].join(" ");
}

function composedStageTaskOutcomeFromFpDispatch(input: {
  readonly declaration: ComposedStageTaskDeclaration;
  readonly pluginInput: EnginePluginInput;
  readonly outcome: FpDispatchOutcome;
}): ComposedStageTaskOutcome {
  return constructComposedStageTaskOutcome({
    status: input.outcome.status === "dispatched" ? "accepted" : "blocked",
    taskRef: input.declaration.taskRef,
    stageRole: "transform",
    taskRole: "candidate",
    computeMeans: "F_P",
    candidateRefs:
      input.outcome.status === "dispatched" && input.outcome.resultRef !== null
        ? uniqueStrings([
            input.outcome.resultRef,
            ...(input.pluginInput.fpTransformRequest === null
              ? []
              : [input.pluginInput.fpTransformRequest.resultRef]),
            ...(input.pluginInput.actorInvocationRef === null
              ? []
              : [input.pluginInput.actorInvocationRef.resultRef])
          ])
        : input.outcome.status === "dispatched" &&
            input.pluginInput.fpTransformRequest !== null
          ? uniqueStrings([
              input.pluginInput.fpTransformRequest.resultRef,
              ...(input.pluginInput.actorInvocationRef === null
                ? []
                : [input.pluginInput.actorInvocationRef.resultRef])
            ])
        : Object.freeze([]),
    evidenceRefs: input.outcome.evidenceRefs,
    selectedCompositionRef: input.pluginInput.selectedCompositionRef,
    selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
    selectedCompositionSelectionRef:
      input.pluginInput.selectedCompositionSelectionRef,
    selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef,
    compositionContributionRef:
      input.pluginInput.selectedRegimeBindingRef ??
      input.pluginInput.selectedCompositionRef,
    reason: input.outcome.reason
  });
}

function composedStageTaskOutcomeFromConsequence(input: {
  readonly declaration: ComposedStageTaskDeclaration;
  readonly pluginInput: EnginePluginInput;
  readonly outcome: ConsequenceProjectionOutcome;
}): ComposedStageTaskOutcome {
  return constructComposedStageTaskOutcome({
    status: input.outcome.status === "projected" ? "accepted" : "blocked",
    taskRef: input.declaration.taskRef,
    stageRole: "consequence",
    taskRole: "projection",
    computeMeans: "F_D",
    projectionRefs:
      input.outcome.status === "projected"
        ? uniqueStrings([
            ...(input.outcome.consequenceRef === null
              ? []
              : [input.outcome.consequenceRef]),
            ...input.outcome.domainReadModelRefs
          ])
        : Object.freeze([]),
    evidenceRefs: input.outcome.evidenceRefs,
    selectedCompositionRef: input.pluginInput.selectedCompositionRef,
    selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
    selectedCompositionSelectionRef:
      input.pluginInput.selectedCompositionSelectionRef,
    selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef,
    compositionContributionRef:
      input.pluginInput.selectedRegimeBindingRef ??
      input.pluginInput.selectedCompositionRef,
    reason: input.outcome.reason
  });
}

function evaluationRuleRoleForPlugin(
  plugin: EvaluationRulePlugin
): EvaluationRuleRole | undefined {
  if (plugin.ruleRole !== undefined) {
    return plugin.ruleRole;
  }
  switch (plugin.contract.computeMeans) {
    case "F_D":
      return "register";
    case "F_P":
      return "semantic_judgment";
    case "F_H":
      return "external_human_callout";
    case null:
      return undefined;
    default: {
      const exhaustive: never = plugin.contract.computeMeans;
      throw new TypeError(
        `Unsupported evaluation rule compute means ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

function plannedEvaluationRuleForPlugin(input: {
  readonly plugin: EvaluationRulePlugin;
  readonly pluginIndex: number;
  readonly pluginInput: EnginePluginInput;
}): PlannedEvaluationRule {
  if (input.plugin.contract.computeStageRole !== "evaluate") {
    throw new TypeError("Evaluation rule plugin contract must be evaluate.C");
  }
  if (input.plugin.contract.computeMeans === null) {
    throw new TypeError("Evaluation rule plugin contract requires compute means");
  }
  const declaration = constructEvaluationRuleDeclaration({
    ruleRef: input.plugin.ruleRef,
    ruleRole: evaluationRuleRoleForPlugin(input.plugin),
    selectedCompositionRef: input.pluginInput.selectedCompositionRef,
    selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
    selectedCompositionSelectionRef:
      input.pluginInput.selectedCompositionSelectionRef,
    selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef,
    computeMeans: input.plugin.contract.computeMeans,
    inputLedgerRefs:
      input.plugin.inputLedgerRefs ?? [input.pluginInput.sourceProjectionRef],
    outputCarrierRefs:
      input.plugin.outputCarrierRefs ?? [input.plugin.contract.outputCarrier],
    required: input.plugin.required ?? true,
    parallelGroupRef: input.plugin.parallelGroupRef ?? null,
    dependencyRefs: input.plugin.dependencyRefs ?? Object.freeze([])
  });
  return Object.freeze({
    pluginIndex: input.pluginIndex,
    plugin: input.plugin,
    pluginInput: input.pluginInput,
    declaration
  });
}

function scalarFpEvaluationRuleDeclaration(
  pluginInput: EnginePluginInput
): EvaluationRuleDeclaration {
  return constructEvaluationRuleDeclaration({
    ruleRef: `evaluation-rule:fp-semantic:${fpEvaluationDigest({
      selectedCompositionRef: pluginInput.selectedCompositionRef,
      selectedRegimeBindingRef: pluginInput.selectedRegimeBindingRef,
      vectorIndex: pluginInput.vectorIndex,
      edge: pluginInput.edge
    })}`,
    ruleRole: "semantic_judgment",
    selectedCompositionRef: pluginInput.selectedCompositionRef,
    selectedCompositionDigest: pluginInput.selectedCompositionDigest,
    selectedCompositionSelectionRef: pluginInput.selectedCompositionSelectionRef,
    selectedRegimeBindingRef: pluginInput.selectedRegimeBindingRef,
    computeMeans: "F_P",
    inputLedgerRefs: [pluginInput.sourceProjectionRef],
    outputCarrierRefs: ["FpEvaluationOutcome"],
    required: true,
    parallelGroupRef: null,
    dependencyRefs: Object.freeze([])
  });
}

function scalarFdEvaluationRuleDeclaration(
  pluginInput: EnginePluginInput
): EvaluationRuleDeclaration {
  return constructEvaluationRuleDeclaration({
    ruleRef: `evaluation-rule:fd-authority:${fpEvaluationDigest({
      selectedCompositionRef: pluginInput.selectedCompositionRef,
      selectedRegimeBindingRef: pluginInput.selectedRegimeBindingRef,
      vectorIndex: pluginInput.vectorIndex,
      edge: pluginInput.edge
    })}`,
    ruleRole: "register",
    selectedCompositionRef: pluginInput.selectedCompositionRef,
    selectedCompositionDigest: pluginInput.selectedCompositionDigest,
    selectedCompositionSelectionRef: pluginInput.selectedCompositionSelectionRef,
    selectedRegimeBindingRef: pluginInput.selectedRegimeBindingRef,
    computeMeans: "F_D",
    inputLedgerRefs: [pluginInput.sourceProjectionRef],
    outputCarrierRefs: ["FdEvaluationOutcome"],
    required: true,
    parallelGroupRef: null,
    dependencyRefs: Object.freeze([])
  });
}

function evaluationRuleBatches(
  plannedRules: readonly PlannedEvaluationRule[],
  scalarRule: EvaluationRuleDeclaration
): readonly (readonly EvaluationRuleDeclaration[])[] {
  const grouped = new Map<string, EvaluationRuleDeclaration[]>();
  const order: string[] = [];
  plannedRules.forEach((plannedRule, index) => {
    const key =
      plannedRule.declaration.parallelGroupRef ?? `serial:${String(index)}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
      order.push(key);
    }
    grouped.get(key)?.push(plannedRule.declaration);
  });
  const batches = order.map((key) =>
    Object.freeze(
      [...(grouped.get(key) ?? [])].sort((left, right) =>
        left.ruleRef.localeCompare(right.ruleRef)
      )
    )
  );
  return Object.freeze([...batches, Object.freeze([scalarRule])]);
}

function evaluationSetPlanForPhase(input: {
  readonly basis: ExecutionBasis;
  readonly scalarEvaluationInput: EnginePluginInput;
  readonly scalarRule: EvaluationRuleDeclaration;
  readonly plannedRules: readonly PlannedEvaluationRule[];
  readonly requiredRuleRefs: readonly string[];
}): EvaluationSetPlan {
  return constructEvaluationSetPlan({
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    vectorIndex: input.scalarEvaluationInput.vectorIndex,
    edge: input.scalarEvaluationInput.edge,
    selectedCompositionRef: input.scalarEvaluationInput.selectedCompositionRef,
    selectedCompositionDigest: input.scalarEvaluationInput.selectedCompositionDigest,
    selectedCompositionSelectionRef:
      input.scalarEvaluationInput.selectedCompositionSelectionRef,
    ruleBatches: evaluationRuleBatches(input.plannedRules, input.scalarRule),
    requiredRuleRefs: input.requiredRuleRefs,
    readOnlyInputRefs: uniqueStrings([
      input.scalarEvaluationInput.sourceProjectionRef,
      ...input.plannedRules.flatMap(
        (plannedRule) => plannedRule.declaration.inputLedgerRefs
      )
    ])
  });
}

function evaluationRuleOutcomePayloadRef(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly outcome: EvaluationRuleOutcome;
}): string {
  return `payload:evaluation_rule:${fpEvaluationDigest({
    basisId: input.basis.id,
    vectorIndex: input.vectorIndex,
    ruleRef: input.outcome.ruleRef,
    status: input.outcome.status
  })}`;
}

function evaluationRuleOutcomeCoreEvents(input: {
  readonly basis: ExecutionBasis;
  readonly pluginInput: EnginePluginInput;
  readonly outcome: EvaluationRuleOutcome;
}): readonly RuntimeEvent[] {
  const payloadRef = evaluationRuleOutcomePayloadRef({
    basis: input.basis,
    vectorIndex: input.pluginInput.vectorIndex,
    outcome: input.outcome
  });
  const digest = `digest:evaluation_rule:${fpEvaluationDigest(input.outcome)}`;
  return Object.freeze([
    constructPayloadObservedEvent({
      basis: input.basis,
      vectorIndex: input.pluginInput.vectorIndex,
      payloadRef,
      payloadClass: "evaluation_rule_outcome",
      contractRef: "contract://abg/evaluation-rule-outcome",
      digest,
      producerRef: input.pluginInput.contract.ref,
      sourceEventRef: input.pluginInput.sourceProjectionRef,
      actorInvocationId:
        input.pluginInput.actorInvocationRef?.actorInvocationId ?? null,
      authorityRef: input.outcome.ruleRef,
      inputDigest: `input:evaluation_rule:${fpEvaluationDigest({
        sourceProjectionRef: input.pluginInput.sourceProjectionRef,
        selectedCompositionDigest: input.pluginInput.selectedCompositionDigest
      })}`,
      policyRefs: [input.basis.resolvedPolicy.resolvedPolicyBundleRef]
    }),
    constructPayloadValidatedEvent({
      basis: input.basis,
      vectorIndex: input.pluginInput.vectorIndex,
      payloadRef,
      contractRef: "contract://abg/evaluation-rule-outcome",
      digest,
      validationRef: `validation:evaluation_rule:${payloadRef}`,
      evidenceRef: input.outcome.evidenceRefs[0] ?? null,
      policyRefs: [input.basis.resolvedPolicy.resolvedPolicyBundleRef]
    })
  ]);
}

function assertEvaluationRuleOutcomeMatchesDeclaration(input: {
  readonly declaration: EvaluationRuleDeclaration;
  readonly outcome: EvaluationRuleOutcome;
}): void {
  if (input.outcome.ruleRef !== input.declaration.ruleRef) {
    throw new TypeError("EvaluationRuleOutcome.ruleRef does not match declaration");
  }
  if (input.outcome.ruleRole !== input.declaration.ruleRole) {
    throw new TypeError(
      "EvaluationRuleOutcome.ruleRole does not match declaration"
    );
  }
  if (input.outcome.computeMeans !== input.declaration.computeMeans) {
    throw new TypeError(
      "EvaluationRuleOutcome.computeMeans does not match declaration"
    );
  }
  if (
    input.outcome.selectedCompositionRef !==
    input.declaration.selectedCompositionRef
  ) {
    throw new TypeError(
      "EvaluationRuleOutcome.selectedCompositionRef does not match selected abg.fn_composition"
    );
  }
  if (
    input.outcome.selectedCompositionDigest !==
    input.declaration.selectedCompositionDigest
  ) {
    throw new TypeError(
      "EvaluationRuleOutcome.selectedCompositionDigest does not match selected abg.fn_composition"
    );
  }
  if (
    input.outcome.selectedCompositionSelectionRef !==
    input.declaration.selectedCompositionSelectionRef
  ) {
    throw new TypeError(
      "EvaluationRuleOutcome.selectedCompositionSelectionRef does not match selected abg.fn_composition"
    );
  }
  if (
    input.outcome.selectedRegimeBindingRef !==
    input.declaration.selectedRegimeBindingRef
  ) {
    throw new TypeError(
      "EvaluationRuleOutcome.selectedRegimeBindingRef does not match declaration"
    );
  }
  const expectedContributionRef =
    input.declaration.selectedRegimeBindingRef ??
    input.declaration.selectedCompositionRef;
  if (input.outcome.compositionContributionRef !== expectedContributionRef) {
    throw new TypeError(
      "EvaluationRuleOutcome.compositionContributionRef does not match selected regime binding"
    );
  }
}

function evaluationRuleOutcomeFromFpEvaluation(input: {
  readonly declaration: EvaluationRuleDeclaration;
  readonly pluginInput: EnginePluginInput;
  readonly outcome: FpEvaluationOutcome;
}): EvaluationRuleOutcome {
  const blocked = input.outcome.status === "blocked";
  return constructEvaluationRuleOutcome({
    status: blocked ? "blocked" : "accepted",
    ruleRef: input.declaration.ruleRef,
    ruleRole: "semantic_judgment",
    computeMeans: "F_P",
    findingRefs: input.outcome.findings.map((finding) => finding.findingRef),
    evidenceRefs:
      input.outcome.status === "evaluated"
        ? input.outcome.findings.flatMap((finding) => finding.evidenceRefs)
        : Object.freeze([]),
    residualPressureRefs:
      input.outcome.status === "evaluated"
        ? input.outcome.findings.flatMap(
            (finding) => finding.residualPressureRefs
          )
        : Object.freeze([]),
    continuationRefs:
      input.outcome.status === "evaluated"
        ? input.outcome.findings.flatMap((finding) => finding.continuationRefs)
        : Object.freeze([]),
    diagnosticRefs: input.outcome.diagnosticRefs,
    selectedCompositionRef: input.pluginInput.selectedCompositionRef,
    selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
    selectedCompositionSelectionRef:
      input.pluginInput.selectedCompositionSelectionRef,
    selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef,
    compositionContributionRef:
      input.pluginInput.selectedRegimeBindingRef ??
      input.pluginInput.selectedCompositionRef,
    reason: input.outcome.reason
  });
}

function evaluationRuleOutcomeFromFdEvaluation(input: {
  readonly declaration: EvaluationRuleDeclaration;
  readonly pluginInput: EnginePluginInput;
  readonly outcome: FdEvaluationOutcome;
}): EvaluationRuleOutcome {
  const accepted = fdEvaluationEventStatus(input.outcome) === "accepted";
  return constructEvaluationRuleOutcome({
    status: accepted ? "accepted" : "blocked",
    ruleRef: input.declaration.ruleRef,
    ruleRole: "register",
    computeMeans: "F_D",
    producedRegisterRefs: accepted
      ? [
          `register:fd-authority:${fpEvaluationDigest({
            basisId: input.pluginInput.basisId,
            vectorIndex: input.pluginInput.vectorIndex,
            routingDecision: input.outcome.routingDecision
          })}`
        ]
      : Object.freeze([]),
    evidenceRefs: input.outcome.evidenceRefs,
    residualPressureRefs: input.outcome.pressureRefs,
    diagnosticRefs: input.outcome.diagnosticRefs,
    selectedCompositionRef: input.pluginInput.selectedCompositionRef,
    selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
    selectedCompositionSelectionRef:
      input.pluginInput.selectedCompositionSelectionRef,
    selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef,
    compositionContributionRef:
      input.pluginInput.selectedRegimeBindingRef ??
      input.pluginInput.selectedCompositionRef,
    reason: input.outcome.reason
  });
}

function evaluationSetBlockingReason(input: {
  readonly admission: ReturnType<typeof constructEvaluationSetAdmission>;
  readonly requiredRuleRefs: readonly string[];
  readonly ignoreMissingRuleRefs?: readonly string[] | undefined;
}): string | null {
  const ignoredMissing = new Set(input.ignoreMissingRuleRefs ?? Object.freeze([]));
  const requiredRuleRefs = new Set(input.requiredRuleRefs);
  const missingRequiredRuleRefs = input.admission.missingRequiredRuleRefs.filter(
    (ruleRef) => !ignoredMissing.has(ruleRef)
  );
  const rejectedRequiredRuleRefs = input.admission.rejectedRuleOutcomes
    .filter((ruleOutcome) => requiredRuleRefs.has(ruleOutcome.ruleRef))
    .map((ruleOutcome) =>
      [`blocked:${ruleOutcome.ruleRef}`, ruleOutcome.reason ?? null]
        .filter((part): part is string => part !== null)
        .join(":")
    );
  if (
    missingRequiredRuleRefs.length === 0 &&
    rejectedRequiredRuleRefs.length === 0
  ) {
    return null;
  }
  return [
    "evaluation_set_incomplete",
    ...missingRequiredRuleRefs.map((ruleRef) => `missing:${ruleRef}`),
    ...rejectedRequiredRuleRefs
  ].join(" ");
}

function fpEvaluationFindingAmbiguityStatus(input: {
  readonly outcomeStatus: PayloadAmbiguityStatus;
  readonly finding: FpEvaluationFinding;
}): PayloadAmbiguityStatus {
  switch (input.finding.closeDisposition) {
    case "close":
      return input.outcomeStatus;
    case "retry":
    case "no_close":
      return "partial";
    case "qualified_defer":
    case "human_required":
      return "deferred";
    case "reprice":
      return "contradictory_authority";
    case "block":
      return "contradictory_evidence";
    default: {
      const exhaustive: never = input.finding.closeDisposition;
      throw new TypeError(
        `Unsupported F_P evaluation close disposition ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

function assertFpEvaluationOutcomeMatchesSelectedComposition(input: {
  readonly pluginInput: EnginePluginInput;
  readonly outcome: FpEvaluationOutcome;
}): void {
  const expectedContributionRef =
    input.pluginInput.selectedRegimeBindingRef ??
    input.pluginInput.selectedCompositionRef;
  for (const finding of input.outcome.findings) {
    if (finding.compositionRef !== input.pluginInput.selectedCompositionRef) {
      throw new TypeError(
        "FpEvaluationFinding.compositionRef does not match selected abg.fn_composition"
      );
    }
    if (finding.compositionDigest !== input.pluginInput.selectedCompositionDigest) {
      throw new TypeError(
        "FpEvaluationFinding.compositionDigest does not match selected abg.fn_composition"
      );
    }
    if (finding.compositionContributionRef !== expectedContributionRef) {
      throw new TypeError(
        "FpEvaluationFinding.compositionContributionRef does not match selected regime binding"
      );
    }
  }
}

function fpEvaluationCoreEvents(input: {
  readonly basis: ExecutionBasis;
  readonly pluginInput: EnginePluginInput;
  readonly outcome: FpEvaluationOutcome;
}): readonly RuntimeEvent[] {
  const authorityRefs = uniqueStrings(
    input.outcome.findings.flatMap((finding) => finding.authorityRefs)
  );
  const deferredAuthorityRefs = uniqueStrings(
    input.outcome.findings
      .filter((finding) =>
        finding.closeDisposition === "human_required" ||
        finding.closeDisposition === "qualified_defer"
      )
      .flatMap((finding) => finding.authorityRefs)
  );
  const policyRefs = Object.freeze([
    input.basis.resolvedPolicy.resolvedPolicyBundleRef
  ]);
  const authorityDigest = `authority:fp_evaluation:${fpEvaluationDigest({
    basisId: input.basis.id,
    vectorIndex: input.pluginInput.vectorIndex,
    authorityRefs
  })}`;
  const inputDigest = `input:fp_evaluation:${fpEvaluationDigest({
    sourceProjectionRef: input.pluginInput.sourceProjectionRef,
    selectedCompositionDigest: input.pluginInput.selectedCompositionDigest
  })}`;
  const events: RuntimeEvent[] = [
    constructAuthoritySnapshotAdmittedEvent({
      basis: input.basis,
      vectorIndex: input.pluginInput.vectorIndex,
      authoritySnapshotRef: `authority-snapshot:fp_evaluation:${fpEvaluationDigest({
        basisId: input.basis.id,
        vectorIndex: input.pluginInput.vectorIndex,
        authorityRefs
      })}`,
      authorityRefs,
      inputRefs: [input.pluginInput.sourceProjectionRef],
      authorityDigest,
      inputDigest,
      deferredAuthorityRefs,
      providerRefs: [input.pluginInput.contract.ref],
      policyRefs
    })
  ];

  for (const finding of input.outcome.findings) {
    const ambiguityStatus = fpEvaluationFindingAmbiguityStatus({
      outcomeStatus: input.outcome.ambiguityStatus,
      finding
    });
    const payloadRef = fpEvaluationFindingPayloadRef({
      basis: input.basis,
      vectorIndex: input.pluginInput.vectorIndex,
      finding
    });
    const digest = `digest:fp_evaluation:${fpEvaluationDigest(finding)}`;
    const authorityRef = finding.authorityRefs[0] ?? null;
    const evidenceRef = finding.evidenceRefs[0] ?? null;
    events.push(
      constructPayloadObservedEvent({
        basis: input.basis,
        vectorIndex: input.pluginInput.vectorIndex,
        payloadRef,
        payloadClass: "fp_evaluation_finding",
        contractRef: "contract://abg/fp-evaluation-finding",
        digest,
        producerRef: input.pluginInput.contract.ref,
        sourceEventRef: input.pluginInput.sourceProjectionRef,
        actorInvocationId:
          input.pluginInput.actorInvocationRef?.actorInvocationId ?? null,
        authorityRef,
        inputDigest,
        policyRefs
      }),
      constructPayloadValidatedEvent({
        basis: input.basis,
        vectorIndex: input.pluginInput.vectorIndex,
        payloadRef,
        contractRef: "contract://abg/fp-evaluation-finding",
        digest,
        validationRef: `validation:fp_evaluation:${payloadRef}`,
        evidenceRef,
        policyRefs
      })
    );
    for (const candidateAuthorityRef of finding.authorityRefs) {
      for (const candidateEvidenceRef of finding.evidenceRefs) {
        events.push(
          constructEvidenceAdmittedEvent({
            basis: input.basis,
            vectorIndex: input.pluginInput.vectorIndex,
            evidenceRef: candidateEvidenceRef,
            payloadRef,
            authorityRef: candidateAuthorityRef,
            authorityDigest,
            inputDigest,
            providerRefs: [input.pluginInput.contract.ref],
            policyRefs,
            complete: ambiguityStatus === "fulfilled",
            shallow: ambiguityStatus === "partial",
            contradictsAuthority: ambiguityStatus === "contradictory_evidence",
            deferred: ambiguityStatus === "deferred"
          })
        );
      }
    }
    events.push(
      constructAmbiguityObservationAdmittedEvent({
        basis: input.basis,
        vectorIndex: input.pluginInput.vectorIndex,
        ambiguityRef: `ambiguity:fp_evaluation:${fpEvaluationDigest({
          findingRef: finding.findingRef,
          status: ambiguityStatus
        })}`,
        ambiguityStatus,
        authorityRef,
        evidenceRef,
        payloadRef,
        reason:
          input.outcome.reason ??
          `fp_evaluation_${finding.closeDisposition}_${ambiguityStatus}`,
        providerRefs: [input.pluginInput.contract.ref],
        policyRefs
      })
    );
  }

  return Object.freeze(events);
}

function assuranceDecisionForCurrentVector(input: {
  readonly basis: ExecutionBasis;
  readonly runtimeProjection: RuntimeAggregateProjection;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly vectorIndex: number;
  readonly targetCarrierDefaults: GtlTargetCarrierDefaultsBundle;
  readonly evaluationSetProjection?: EvaluationSetProjection | null | undefined;
}) {
  const assuranceScope = deriveAssuranceScopeRef({
    basis: input.basis,
    projection: input.runtimeProjection,
    vectorIndex: input.vectorIndex
  });
  const payloadLedger = derivePayloadLedgerProjection({
    basis: input.basis,
    runtimeProjection: input.runtimeProjection,
    events: input.replayEvents,
    vectorIndex: input.vectorIndex,
    targetCarrierDefaults: input.targetCarrierDefaults
  });
  const baseAuthoritySnapshot = deriveAssuranceAuthoritySnapshotFromPayloadLedger({
    assuranceScope,
    ledger: payloadLedger
  });
  const authoritySnapshot =
    input.evaluationSetProjection === undefined ||
    input.evaluationSetProjection === null
      ? baseAuthoritySnapshot
      : constructAssuranceAuthoritySnapshot({
          scope: baseAuthoritySnapshot.scope,
          authorityRefs: baseAuthoritySnapshot.authorityRefs,
          inputRefs: uniqueStrings([
            ...baseAuthoritySnapshot.inputRefs,
            input.evaluationSetProjection.projectionRef,
            ...input.evaluationSetProjection.foldInputRefs
          ]),
          authorityDigest: baseAuthoritySnapshot.authorityDigest,
          inputDigest: baseAuthoritySnapshot.inputDigest,
          closureCapable: baseAuthoritySnapshot.closureCapable,
          contradictoryAuthority:
            baseAuthoritySnapshot.contradictoryAuthority,
          deferredAuthorityRefs: baseAuthoritySnapshot.deferredAuthorityRefs,
          providerRefs: baseAuthoritySnapshot.providerRefs,
          policyRefs: baseAuthoritySnapshot.policyRefs
        });
  const evidenceRows = deriveAssuranceEvidenceRowsFromPayloadLedger({
    assuranceScope,
    ledger: payloadLedger
  });
  const assuranceProjection = deriveAssuranceProjection({
    basis: input.basis,
    runtimeProjection: input.runtimeProjection,
    authoritySnapshot,
    evidenceRows
  });
  const closureDecision = deriveAssuranceClosureDecision(assuranceProjection);
  return Object.freeze({
    payloadLedger,
    assuranceProjection,
    closureDecision
  });
}

function terminalForAssuranceDecision(input: {
  readonly basis: ExecutionBasis;
  readonly decision: PayloadClosureDecisionKind;
  readonly reason: string;
}): TerminalTransition | null {
  switch (input.decision) {
    case "close":
      return null;
    case "retry":
    case "qualified_defer":
      return terminalTransition(input.basis, "yielded", input.reason);
    case "reprice":
    case "block":
      return terminalTransition(input.basis, "gap_stop", input.reason);
    default: {
      const exhaustive: never = input.decision;
      throw new TypeError(
        `Unsupported assurance closure decision ${JSON.stringify(exhaustive)}`
      );
    }
  }
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
      readonly kind: "composed_stage_task_batch_run";
      readonly stageRole: "transform" | "consequence";
      readonly items: readonly {
        readonly pluginIndex: number;
        readonly input: EnginePluginInput;
      }[];
    }
  | {
      readonly kind: "evaluation_rule_evaluate";
      readonly pluginIndex: number;
      readonly input: EnginePluginInput;
    }
  | {
      readonly kind: "evaluation_rule_batch_evaluate";
      readonly items: readonly {
        readonly pluginIndex: number;
        readonly input: EnginePluginInput;
      }[];
    }
  | {
      readonly kind: "fp_evaluate";
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
      readonly kind: "composed_stage_task_batch_run";
      readonly outcomes: readonly {
        readonly pluginIndex: number;
        readonly outcome: ComposedStageTaskOutcome;
      }[];
    }
  | {
      readonly kind: "evaluation_rule_evaluate";
      readonly pluginIndex: number;
      readonly outcome: EvaluationRuleOutcome;
    }
  | {
      readonly kind: "evaluation_rule_batch_evaluate";
      readonly outcomes: readonly {
        readonly pluginIndex: number;
        readonly outcome: EvaluationRuleOutcome;
      }[];
    }
  | {
      readonly kind: "fp_evaluate";
      readonly outcome: FpEvaluationOutcome;
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
    case "composed_stage_task_batch_run":
      throw new TypeError("Engine plugin effect expected fd_evaluate");
    case "evaluation_rule_evaluate":
      throw new TypeError("Engine plugin effect expected fd_evaluate");
    case "evaluation_rule_batch_evaluate":
      throw new TypeError("Engine plugin effect expected fd_evaluate");
    case "fp_evaluate":
      throw new TypeError("Engine plugin effect expected fd_evaluate");
    case "fp_dispatch":
    case "fh_admit":
      throw new TypeError("Engine plugin effect expected fd_evaluate");
    case "consequence_project":
      throw new TypeError("Engine plugin effect expected fd_evaluate");
  }
}

function composedStageTaskBatchOutcomesFromEffectResult(input: {
  readonly result: EnginePluginEffectResult;
  readonly pluginIndexes: readonly number[];
}): readonly ComposedStageTaskOutcome[] {
  assertEnginePluginEffectKind(input.result, "composed_stage_task_batch_run");
  switch (input.result.kind) {
    case "composed_stage_task_batch_run": {
      if (input.result.outcomes.length !== input.pluginIndexes.length) {
        throw new TypeError(
          "Engine plugin effect returned wrong composed stage task batch length"
        );
      }
      return Object.freeze(
        input.result.outcomes.map((entry, index) => {
          if (entry.pluginIndex !== input.pluginIndexes[index]) {
            throw new TypeError(
              "Engine plugin effect returned wrong composed stage task batch order"
            );
          }
          return entry.outcome;
        })
      );
    }
    case "fd_evaluate":
    case "evaluation_rule_evaluate":
    case "evaluation_rule_batch_evaluate":
    case "fp_evaluate":
    case "fp_dispatch":
    case "fh_admit":
    case "consequence_project":
      throw new TypeError(
        "Engine plugin effect expected composed_stage_task_batch_run"
      );
  }
}

function evaluationRuleBatchOutcomesFromEffectResult(input: {
  readonly result: EnginePluginEffectResult;
  readonly pluginIndexes: readonly number[];
}): readonly EvaluationRuleOutcome[] {
  assertEnginePluginEffectKind(input.result, "evaluation_rule_batch_evaluate");
  switch (input.result.kind) {
    case "evaluation_rule_batch_evaluate": {
      if (input.result.outcomes.length !== input.pluginIndexes.length) {
        throw new TypeError(
          "Engine plugin effect returned wrong evaluation rule batch length"
        );
      }
      return Object.freeze(
        input.result.outcomes.map((entry, index) => {
          if (entry.pluginIndex !== input.pluginIndexes[index]) {
            throw new TypeError(
              "Engine plugin effect returned wrong evaluation rule batch order"
            );
          }
          return entry.outcome;
        })
      );
    }
    case "fd_evaluate":
    case "composed_stage_task_batch_run":
    case "evaluation_rule_evaluate":
    case "fp_evaluate":
    case "fp_dispatch":
    case "fh_admit":
    case "consequence_project":
      throw new TypeError(
        "Engine plugin effect expected evaluation_rule_batch_evaluate"
      );
  }
}

function fpEvaluationOutcomeFromEffectResult(
  result: EnginePluginEffectResult
): FpEvaluationOutcome {
  assertEnginePluginEffectKind(result, "fp_evaluate");
  switch (result.kind) {
    case "fp_evaluate":
      return result.outcome;
    case "fd_evaluate":
    case "composed_stage_task_batch_run":
    case "evaluation_rule_evaluate":
    case "evaluation_rule_batch_evaluate":
    case "fp_dispatch":
    case "fh_admit":
    case "consequence_project":
      throw new TypeError("Engine plugin effect expected fp_evaluate");
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
    case "composed_stage_task_batch_run":
    case "evaluation_rule_evaluate":
    case "evaluation_rule_batch_evaluate":
    case "fp_evaluate":
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
    case "composed_stage_task_batch_run":
    case "evaluation_rule_evaluate":
    case "evaluation_rule_batch_evaluate":
    case "fp_evaluate":
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
    case "composed_stage_task_batch_run":
    case "evaluation_rule_evaluate":
    case "evaluation_rule_batch_evaluate":
    case "fp_evaluate":
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
        const fdEvaluationBaseProjection = deriveRuntimeAggregateProjection(
          request.basis,
          eventState.replayEvents
        );
        const plannedEvaluationRules = plugins.evaluationRules.map(
          (plugin, pluginIndex) => {
            if (plugin.contract.computeMeans === null) {
              throw new TypeError(
                "Evaluation rule plugin contract requires compute means"
              );
            }
            const ruleInput = constructEnginePluginInput({
              contract: plugin.contract,
              basis: request.basis,
              projection: fdEvaluationBaseProjection,
              replayEvents: eventState.replayEvents,
              vectorIndex: transition.vectorIndex,
              edge: transition.edge,
              regime: plugin.contract.computeMeans,
              abgFallbackBundle: request.abgFallbackBundle ?? null,
              edgeAssuranceDefaults: request.edgeAssuranceDefaults ?? null,
              constructionPressurePackage:
                request.constructionPressurePackage ?? null,
              pluginTraversalObserverFallbackEnabled:
                request.pluginTraversalObserverFallbackEnabled ?? false,
              pluginTraversalObserverFallbackKinds:
                request.pluginTraversalObserverFallbackKinds ?? Object.freeze([])
            });
            return plannedEvaluationRuleForPlugin({
              plugin,
              pluginIndex,
              pluginInput: ruleInput
            });
          }
        );
        const scalarFdRule = scalarFdEvaluationRuleDeclaration(input);
        const evaluationSetPlan = evaluationSetPlanForPhase({
          basis: request.basis,
          scalarEvaluationInput: input,
          scalarRule: scalarFdRule,
          plannedRules: plannedEvaluationRules,
          requiredRuleRefs: plugins.requiredEvaluationRuleRefs
        });
        const plannedRuleByRef = new Map<string, PlannedEvaluationRule>();
        for (const plannedRule of plannedEvaluationRules) {
          if (plannedRuleByRef.has(plannedRule.declaration.ruleRef)) {
            throw new TypeError(
              `Duplicate evaluation rule ref ${plannedRule.declaration.ruleRef}`
            );
          }
          plannedRuleByRef.set(plannedRule.declaration.ruleRef, plannedRule);
        }
        const evaluationRuleOutcomes: EvaluationRuleOutcome[] = [];
        for (const batch of evaluationSetPlan.ruleBatches) {
          const plannedBatch = batch.flatMap((declaration) => {
            if (declaration.ruleRef === scalarFdRule.ruleRef) {
              return [];
            }
            const plannedRule = plannedRuleByRef.get(declaration.ruleRef);
            if (plannedRule === undefined) {
              return [];
            }
            return [{ declaration, plannedRule }];
          });
          if (plannedBatch.length === 0) {
            continue;
          }
          const batchOutcomes = evaluationRuleBatchOutcomesFromEffectResult({
            result: yield Object.freeze({
              kind: "evaluation_rule_batch_evaluate",
              items: plannedBatch.map(({ plannedRule }) =>
                Object.freeze({
                  pluginIndex: plannedRule.pluginIndex,
                  input: plannedRule.pluginInput
                })
              )
            }),
            pluginIndexes: plannedBatch.map(
              ({ plannedRule }) => plannedRule.pluginIndex
            )
          });
          for (const [
            index,
            { declaration, plannedRule }
          ] of plannedBatch.entries()) {
            const ruleOutcome = batchOutcomes[index];
            if (ruleOutcome === undefined) {
              throw new TypeError("Evaluation rule batch omitted outcome");
            }
            assertEvaluationRuleOutcomeMatchesDeclaration({
              declaration,
              outcome: ruleOutcome
            });
            evaluationRuleOutcomes.push(ruleOutcome);
            eventState = emitRunnerEvents(
              eventState,
              evaluationRuleOutcomeCoreEvents({
                basis: request.basis,
                pluginInput: plannedRule.pluginInput,
                outcome: ruleOutcome
              })
            );
          }
        }
        const preScalarAdmission = constructEvaluationSetAdmission({
          plan: evaluationSetPlan,
          outcomes: evaluationRuleOutcomes
        });
        const preScalarBlockingReason = evaluationSetBlockingReason({
          admission: preScalarAdmission,
          requiredRuleRefs: evaluationSetPlan.requiredRuleRefs,
          ignoreMissingRuleRefs: [scalarFdRule.ruleRef]
        });
        if (preScalarBlockingReason !== null) {
          const blocked = terminalTransition(
            request.basis,
            "gap_stop",
            preScalarBlockingReason
          );
          eventState = emitRunnerEvents(
            eventState,
            constructTerminalReachedEvent(blocked)
          );
          return constructResult({
            basis: request.basis,
            transition: blocked,
            projection: deriveRuntimeAggregateProjection(
              request.basis,
              eventState.replayEvents
            ),
            emittedEvents: eventState.emittedEvents,
            replayEvents: eventState.replayEvents,
            iterationCount
          });
        }
        const outcome = fdEvaluationOutcomeFromEffectResult(
          yield Object.freeze({ kind: "fd_evaluate", input }),
        );
        const fdEvaluationRuleOutcome = evaluationRuleOutcomeFromFdEvaluation({
          declaration: scalarFdRule,
          pluginInput: input,
          outcome
        });
        assertEvaluationRuleOutcomeMatchesDeclaration({
          declaration: scalarFdRule,
          outcome: fdEvaluationRuleOutcome
        });
        evaluationRuleOutcomes.push(fdEvaluationRuleOutcome);
        eventState = emitRunnerEvents(
          eventState,
          evaluationRuleOutcomeCoreEvents({
            basis: request.basis,
            pluginInput: input,
            outcome: fdEvaluationRuleOutcome
          })
        );
        const evaluationSetAdmission = constructEvaluationSetAdmission({
          plan: evaluationSetPlan,
          outcomes: evaluationRuleOutcomes
        });
        const evaluationSetProjection = constructEvaluationSetProjection({
          plan: evaluationSetPlan,
          admission: evaluationSetAdmission
        });
        void evaluationSetProjection;
        const evaluationSetBlockReason = evaluationSetBlockingReason({
          admission: evaluationSetAdmission,
          requiredRuleRefs: evaluationSetPlan.requiredRuleRefs
        });
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
        if (evaluationSetBlockReason !== null) {
          const blocked = terminalTransition(
            request.basis,
            "gap_stop",
            evaluationSetBlockReason
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
        const plannedConsequenceTasks = plugins.consequenceTasks.map(
          (plugin, pluginIndex) => {
            if (plugin.contract.computeMeans === null) {
              throw new TypeError(
                "Consequence task plugin contract requires compute means"
              );
            }
            const taskInput = constructEnginePluginInput({
              contract: plugin.contract,
              basis: request.basis,
              projection: consequenceProjection,
              replayEvents: eventState.replayEvents,
              vectorIndex: transition.vectorIndex,
              edge: transition.edge,
              regime: plugin.contract.computeMeans,
              abgFallbackBundle: request.abgFallbackBundle ?? null,
              edgeAssuranceDefaults: request.edgeAssuranceDefaults ?? null,
              constructionPressurePackage:
                request.constructionPressurePackage ?? null,
              pluginTraversalObserverFallbackEnabled:
                request.pluginTraversalObserverFallbackEnabled ?? false,
              pluginTraversalObserverFallbackKinds:
                request.pluginTraversalObserverFallbackKinds ?? Object.freeze([])
            });
            return plannedComposedStageTaskForPlugin({
              stageRole: "consequence",
              plugin,
              pluginIndex,
              pluginInput: taskInput
            });
          }
        );
        const scalarConsequenceTask =
          scalarConsequenceTaskDeclaration(consequenceInput);
        const consequenceStagePlan = composedStageSetPlanForStage({
          basis: request.basis,
          stageRole: "consequence",
          scalarStageInput: consequenceInput,
          scalarTask: scalarConsequenceTask,
          plannedTasks: plannedConsequenceTasks,
          requiredTaskRefs: plugins.requiredConsequenceTaskRefs
        });
        const plannedConsequenceTaskByRef = new Map<string, PlannedComposedStageTask>();
        for (const plannedTask of plannedConsequenceTasks) {
          if (plannedConsequenceTaskByRef.has(plannedTask.declaration.taskRef)) {
            throw new TypeError(
              `Duplicate consequence task ref ${plannedTask.declaration.taskRef}`
            );
          }
          plannedConsequenceTaskByRef.set(plannedTask.declaration.taskRef, plannedTask);
        }
        const consequenceStageOutcomes: ComposedStageTaskOutcome[] = [];
        for (const batch of consequenceStagePlan.taskBatches) {
          const plannedBatch = batch.flatMap((declaration) => {
            if (declaration.taskRef === scalarConsequenceTask.taskRef) {
              return [];
            }
            const plannedTask = plannedConsequenceTaskByRef.get(declaration.taskRef);
            if (plannedTask === undefined) {
              return [];
            }
            return [{ declaration, plannedTask }];
          });
          if (plannedBatch.length === 0) {
            continue;
          }
          const batchOutcomes = composedStageTaskBatchOutcomesFromEffectResult({
            result: yield Object.freeze({
              kind: "composed_stage_task_batch_run",
              stageRole: "consequence",
              items: plannedBatch.map(({ plannedTask }) =>
                Object.freeze({
                  pluginIndex: plannedTask.pluginIndex,
                  input: plannedTask.pluginInput
                })
              )
            }),
            pluginIndexes: plannedBatch.map(
              ({ plannedTask }) => plannedTask.pluginIndex
            )
          });
          for (const [
            index,
            { declaration, plannedTask }
          ] of plannedBatch.entries()) {
            const taskOutcome = batchOutcomes[index];
            if (taskOutcome === undefined) {
              throw new TypeError("Composed stage task batch omitted outcome");
            }
            assertComposedStageTaskOutcomeMatchesDeclaration({
              declaration,
              outcome: taskOutcome
            });
            consequenceStageOutcomes.push(taskOutcome);
            eventState = emitRunnerEvents(
              eventState,
              composedStageTaskOutcomeCoreEvents({
                basis: request.basis,
                pluginInput: plannedTask.pluginInput,
                outcome: taskOutcome
              })
            );
          }
        }
        const preProjectionConsequenceAdmission = constructComposedStageAdmission({
          plan: consequenceStagePlan,
          outcomes: consequenceStageOutcomes
        });
        const preProjectionConsequenceBlockingReason =
          composedStageSetBlockingReason({
            admission: preProjectionConsequenceAdmission,
            requiredTaskRefs: consequenceStagePlan.requiredTaskRefs,
            ignoreMissingTaskRefs: [scalarConsequenceTask.taskRef]
          });
        if (preProjectionConsequenceBlockingReason !== null) {
          const blocked = terminalTransition(
            request.basis,
            "gap_stop",
            preProjectionConsequenceBlockingReason
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
        const consequenceOutcome = consequenceProjectionOutcomeFromEffectResult(
          yield Object.freeze({
            kind: "consequence_project",
            input: consequenceInput
          })
        );
        const scalarConsequenceOutcome = composedStageTaskOutcomeFromConsequence({
          declaration: scalarConsequenceTask,
          pluginInput: consequenceInput,
          outcome: consequenceOutcome
        });
        assertComposedStageTaskOutcomeMatchesDeclaration({
          declaration: scalarConsequenceTask,
          outcome: scalarConsequenceOutcome
        });
        consequenceStageOutcomes.push(scalarConsequenceOutcome);
        eventState = emitRunnerEvents(
          eventState,
          composedStageTaskOutcomeCoreEvents({
            basis: request.basis,
            pluginInput: consequenceInput,
            outcome: scalarConsequenceOutcome
          })
        );
        const consequenceStageAdmission = constructComposedStageAdmission({
          plan: consequenceStagePlan,
          outcomes: consequenceStageOutcomes
        });
        const consequenceStageProjection = constructComposedStageProjection({
          plan: consequenceStagePlan,
          admission: consequenceStageAdmission
        });
        void consequenceStageProjection;
        const consequenceStageBlockingReason = composedStageSetBlockingReason({
          admission: consequenceStageAdmission,
          requiredTaskRefs: consequenceStagePlan.requiredTaskRefs
        });
        if (consequenceStageBlockingReason !== null) {
          const blocked = terminalTransition(
            request.basis,
            "gap_stop",
            consequenceStageBlockingReason
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
        const transformBaseProjection = deriveRuntimeAggregateProjection(
          request.basis,
          eventState.replayEvents
        );
        const plannedTransformTasks = plugins.transformTasks.map(
          (plugin, pluginIndex) => {
            if (plugin.contract.computeMeans === null) {
              throw new TypeError(
                "Transform task plugin contract requires compute means"
              );
            }
            const taskInput = constructEnginePluginInput({
              contract: plugin.contract,
              basis: request.basis,
              projection: transformBaseProjection,
              replayEvents: eventState.replayEvents,
              vectorIndex: transition.vectorIndex,
              edge: transition.edge,
              regime: plugin.contract.computeMeans,
              traversalStrategySelection: modulatedAttempt?.selection ?? null,
              traversalAttemptEnvelope: modulatedAttempt?.envelope ?? null,
              abgFallbackBundle: request.abgFallbackBundle ?? null,
              edgeAssuranceDefaults: request.edgeAssuranceDefaults ?? null,
              constructionPressurePackage:
                request.constructionPressurePackage ?? null,
              pluginTraversalObserverFallbackEnabled:
                request.pluginTraversalObserverFallbackEnabled ?? false,
              pluginTraversalObserverFallbackKinds:
                request.pluginTraversalObserverFallbackKinds ?? Object.freeze([])
            });
            return plannedComposedStageTaskForPlugin({
              stageRole: "transform",
              plugin,
              pluginIndex,
              pluginInput: taskInput
            });
          }
        );
        const scalarTransformTask = scalarTransformTaskDeclaration(input);
        const transformStagePlan = composedStageSetPlanForStage({
          basis: request.basis,
          stageRole: "transform",
          scalarStageInput: input,
          scalarTask: scalarTransformTask,
          plannedTasks: plannedTransformTasks,
          requiredTaskRefs: plugins.requiredTransformTaskRefs
        });
        const plannedTransformTaskByRef = new Map<string, PlannedComposedStageTask>();
        for (const plannedTask of plannedTransformTasks) {
          if (plannedTransformTaskByRef.has(plannedTask.declaration.taskRef)) {
            throw new TypeError(
              `Duplicate transform task ref ${plannedTask.declaration.taskRef}`
            );
          }
          plannedTransformTaskByRef.set(plannedTask.declaration.taskRef, plannedTask);
        }
        const transformStageOutcomes: ComposedStageTaskOutcome[] = [];
        for (const batch of transformStagePlan.taskBatches) {
          const plannedBatch = batch.flatMap((declaration) => {
            if (declaration.taskRef === scalarTransformTask.taskRef) {
              return [];
            }
            const plannedTask = plannedTransformTaskByRef.get(declaration.taskRef);
            if (plannedTask === undefined) {
              return [];
            }
            return [{ declaration, plannedTask }];
          });
          if (plannedBatch.length === 0) {
            continue;
          }
          const batchOutcomes = composedStageTaskBatchOutcomesFromEffectResult({
            result: yield Object.freeze({
              kind: "composed_stage_task_batch_run",
              stageRole: "transform",
              items: plannedBatch.map(({ plannedTask }) =>
                Object.freeze({
                  pluginIndex: plannedTask.pluginIndex,
                  input: plannedTask.pluginInput
                })
              )
            }),
            pluginIndexes: plannedBatch.map(
              ({ plannedTask }) => plannedTask.pluginIndex
            )
          });
          for (const [
            index,
            { declaration, plannedTask }
          ] of plannedBatch.entries()) {
            const taskOutcome = batchOutcomes[index];
            if (taskOutcome === undefined) {
              throw new TypeError("Composed stage task batch omitted outcome");
            }
            assertComposedStageTaskOutcomeMatchesDeclaration({
              declaration,
              outcome: taskOutcome
            });
            transformStageOutcomes.push(taskOutcome);
            eventState = emitRunnerEvents(
              eventState,
              composedStageTaskOutcomeCoreEvents({
                basis: request.basis,
                pluginInput: plannedTask.pluginInput,
                outcome: taskOutcome
              })
            );
          }
        }
        const preDispatchTransformAdmission = constructComposedStageAdmission({
          plan: transformStagePlan,
          outcomes: transformStageOutcomes
        });
        const preDispatchTransformBlockingReason = composedStageSetBlockingReason({
          admission: preDispatchTransformAdmission,
          requiredTaskRefs: transformStagePlan.requiredTaskRefs,
          ignoreMissingTaskRefs: [scalarTransformTask.taskRef]
        });
        if (preDispatchTransformBlockingReason !== null) {
          const blocked = terminalTransition(
            request.basis,
            "gap_stop",
            preDispatchTransformBlockingReason
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
        const scalarTransformOutcome = composedStageTaskOutcomeFromFpDispatch({
          declaration: scalarTransformTask,
          pluginInput: input,
          outcome
        });
        assertComposedStageTaskOutcomeMatchesDeclaration({
          declaration: scalarTransformTask,
          outcome: scalarTransformOutcome
        });
        transformStageOutcomes.push(scalarTransformOutcome);
        eventState = emitRunnerEvents(
          eventState,
          composedStageTaskOutcomeCoreEvents({
            basis: request.basis,
            pluginInput: input,
            outcome: scalarTransformOutcome
          })
        );
        const transformStageAdmission = constructComposedStageAdmission({
          plan: transformStagePlan,
          outcomes: transformStageOutcomes
        });
        const transformStageProjection = constructComposedStageProjection({
          plan: transformStagePlan,
          admission: transformStageAdmission
        });
        void transformStageProjection;
        const transformStageBlockingReason = composedStageSetBlockingReason({
          admission: transformStageAdmission,
          requiredTaskRefs: transformStagePlan.requiredTaskRefs
        });
        if (transformStageBlockingReason !== null) {
          const blocked = terminalTransition(
            request.basis,
            "gap_stop",
            transformStageBlockingReason
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
            eventState = emitRunnerEvents(eventState, attachedDecision.payloadEvents);
            const evaluationBaseProjection = deriveRuntimeAggregateProjection(
              request.basis,
              eventState.replayEvents
            );
            const plannedEvaluationRules = plugins.evaluationRules.map(
              (plugin, pluginIndex) => {
                if (plugin.contract.computeMeans === null) {
                  throw new TypeError(
                    "Evaluation rule plugin contract requires compute means"
                  );
                }
                const ruleInput = constructEnginePluginInput({
                  contract: plugin.contract,
                  basis: request.basis,
                  projection: evaluationBaseProjection,
                  replayEvents: eventState.replayEvents,
                  vectorIndex: transition.vectorIndex,
                  edge: transition.edge,
                  regime: plugin.contract.computeMeans,
                  traversalStrategySelection: modulatedAttempt?.selection ?? null,
                  traversalAttemptEnvelope: modulatedAttempt?.envelope ?? null,
                  abgFallbackBundle: request.abgFallbackBundle ?? null,
                  edgeAssuranceDefaults: request.edgeAssuranceDefaults ?? null,
                  constructionPressurePackage:
                    request.constructionPressurePackage ?? null,
                  pluginTraversalObserverFallbackEnabled:
                    request.pluginTraversalObserverFallbackEnabled ?? false,
                  pluginTraversalObserverFallbackKinds:
                    request.pluginTraversalObserverFallbackKinds ?? Object.freeze([])
                });
                return plannedEvaluationRuleForPlugin({
                  plugin,
                  pluginIndex,
                  pluginInput: ruleInput
                });
              }
            );
            const fpEvaluationPlanInput = constructEnginePluginInput({
              contract: plugins.fpEvaluator.contract,
              basis: request.basis,
              projection: evaluationBaseProjection,
              replayEvents: eventState.replayEvents,
              vectorIndex: transition.vectorIndex,
              edge: transition.edge,
              regime: "F_P",
              actorInvocationRef: actorInvocationRef(actorInvocation),
              traversalStrategySelection: modulatedAttempt?.selection ?? null,
              traversalAttemptEnvelope: modulatedAttempt?.envelope ?? null,
              abgFallbackBundle: request.abgFallbackBundle ?? null,
              edgeAssuranceDefaults: request.edgeAssuranceDefaults ?? null,
              constructionPressurePackage:
                request.constructionPressurePackage ?? null,
              pluginTraversalObserverFallbackEnabled:
                request.pluginTraversalObserverFallbackEnabled ?? false,
              pluginTraversalObserverFallbackKinds:
                request.pluginTraversalObserverFallbackKinds ?? Object.freeze([])
            });
            const evaluationSetPlan = evaluationSetPlanForPhase({
              basis: request.basis,
              scalarEvaluationInput: fpEvaluationPlanInput,
              scalarRule:
                scalarFpEvaluationRuleDeclaration(fpEvaluationPlanInput),
              plannedRules: plannedEvaluationRules,
              requiredRuleRefs: plugins.requiredEvaluationRuleRefs
            });
            const plannedRuleByRef = new Map<string, PlannedEvaluationRule>();
            for (const plannedRule of plannedEvaluationRules) {
              if (plannedRuleByRef.has(plannedRule.declaration.ruleRef)) {
                throw new TypeError(
                  `Duplicate evaluation rule ref ${plannedRule.declaration.ruleRef}`
                );
              }
              plannedRuleByRef.set(plannedRule.declaration.ruleRef, plannedRule);
            }
            const scalarFpRule =
              evaluationSetPlan.ruleBatches.at(-1)?.at(0) ?? null;
            if (scalarFpRule === null) {
              throw new TypeError("Evaluation set plan requires scalar F_P rule");
            }
            const evaluationRuleOutcomes: EvaluationRuleOutcome[] = [];
            for (const batch of evaluationSetPlan.ruleBatches) {
              const plannedBatch = batch.flatMap((declaration) => {
                if (declaration.ruleRef === scalarFpRule.ruleRef) {
                  return [];
                }
                const plannedRule = plannedRuleByRef.get(declaration.ruleRef);
                if (plannedRule === undefined) {
                  return [];
                }
                return [{ declaration, plannedRule }];
              });
              if (plannedBatch.length === 0) {
                continue;
              }
              const batchOutcomes = evaluationRuleBatchOutcomesFromEffectResult({
                result: yield Object.freeze({
                  kind: "evaluation_rule_batch_evaluate",
                  items: plannedBatch.map(({ plannedRule }) =>
                    Object.freeze({
                      pluginIndex: plannedRule.pluginIndex,
                      input: plannedRule.pluginInput
                    })
                  )
                }),
                pluginIndexes: plannedBatch.map(
                  ({ plannedRule }) => plannedRule.pluginIndex
                )
              });
              for (const [
                index,
                { declaration, plannedRule }
              ] of plannedBatch.entries()) {
                const ruleOutcome = batchOutcomes[index];
                if (ruleOutcome === undefined) {
                  throw new TypeError("Evaluation rule batch omitted outcome");
                }
                assertEvaluationRuleOutcomeMatchesDeclaration({
                  declaration,
                  outcome: ruleOutcome
                });
                evaluationRuleOutcomes.push(ruleOutcome);
                eventState = emitRunnerEvents(
                  eventState,
                  evaluationRuleOutcomeCoreEvents({
                    basis: request.basis,
                    pluginInput: plannedRule.pluginInput,
                    outcome: ruleOutcome
                  })
                );
              }
            }
            const preSemanticAdmission = constructEvaluationSetAdmission({
              plan: evaluationSetPlan,
              outcomes: evaluationRuleOutcomes
            });
            const preSemanticBlockingReason = evaluationSetBlockingReason({
              admission: preSemanticAdmission,
              requiredRuleRefs: evaluationSetPlan.requiredRuleRefs,
              ignoreMissingRuleRefs: [scalarFpRule.ruleRef]
            });
            if (preSemanticBlockingReason !== null) {
              const blocked = terminalTransition(
                request.basis,
                "gap_stop",
                preSemanticBlockingReason
              );
              eventState = emitRunnerEvents(
                eventState,
                constructTerminalReachedEvent(blocked)
              );
              return constructResult({
                basis: request.basis,
                transition: blocked,
                projection: deriveRuntimeAggregateProjection(
                  request.basis,
                  eventState.replayEvents
                ),
                emittedEvents: eventState.emittedEvents,
                replayEvents: eventState.replayEvents,
                iterationCount
              });
            }
            const fpSemanticEvaluationProjection = deriveRuntimeAggregateProjection(
              request.basis,
              eventState.replayEvents
            );
            const fpEvaluationInput = constructEnginePluginInput({
              contract: plugins.fpEvaluator.contract,
              basis: request.basis,
              projection: fpSemanticEvaluationProjection,
              replayEvents: eventState.replayEvents,
              vectorIndex: transition.vectorIndex,
              edge: transition.edge,
              regime: "F_P",
              actorInvocationRef: actorInvocationRef(actorInvocation),
              traversalStrategySelection: modulatedAttempt?.selection ?? null,
              traversalAttemptEnvelope: modulatedAttempt?.envelope ?? null,
              abgFallbackBundle: request.abgFallbackBundle ?? null,
              edgeAssuranceDefaults: request.edgeAssuranceDefaults ?? null,
              constructionPressurePackage:
                request.constructionPressurePackage ?? null,
              pluginTraversalObserverFallbackEnabled:
                request.pluginTraversalObserverFallbackEnabled ?? false,
              pluginTraversalObserverFallbackKinds:
                request.pluginTraversalObserverFallbackKinds ?? Object.freeze([])
            });
            if (fpEvaluationInput.pluginTraversalObserverBinding !== null) {
              eventState = emitRunnerEvents(eventState,
                constructPluginTraversalPromptMaterializedEvent({
                  basis: request.basis,
                  vectorIndex: transition.vectorIndex,
                  selection: fpEvaluationInput.pluginTraversalObserverBinding,
                  invocation: actorInvocation,
                  causationEventRefs: Object.freeze([
                    fpEvaluationInput.sourceProjectionRef
                  ]),
                  correlationId: [
                    "plugin-traversal",
                    request.basis.id,
                    String(transition.vectorIndex),
                    "evaluate"
                  ].join(":")
                })
              );
            }
            const fpEvaluationOutcome = fpEvaluationOutcomeFromEffectResult(
              yield Object.freeze({
                kind: "fp_evaluate",
                input: fpEvaluationInput
              })
            );
            const fpEvaluationRuleOutcome = evaluationRuleOutcomeFromFpEvaluation({
              declaration: scalarFpRule,
              pluginInput: fpEvaluationInput,
              outcome: fpEvaluationOutcome
            });
            assertEvaluationRuleOutcomeMatchesDeclaration({
              declaration: scalarFpRule,
              outcome: fpEvaluationRuleOutcome
            });
            evaluationRuleOutcomes.push(fpEvaluationRuleOutcome);
            eventState = emitRunnerEvents(
              eventState,
              evaluationRuleOutcomeCoreEvents({
                basis: request.basis,
                pluginInput: fpEvaluationInput,
                outcome: fpEvaluationRuleOutcome
              })
            );
            const evaluationSetAdmission = constructEvaluationSetAdmission({
              plan: evaluationSetPlan,
              outcomes: evaluationRuleOutcomes
            });
            const evaluationSetProjection = constructEvaluationSetProjection({
              plan: evaluationSetPlan,
              admission: evaluationSetAdmission
            });
            const evaluationSetBlockReason = evaluationSetBlockingReason({
              admission: evaluationSetAdmission,
              requiredRuleRefs: evaluationSetPlan.requiredRuleRefs
            });
            if (evaluationSetBlockReason !== null) {
              const blocked = terminalTransition(
                request.basis,
                "gap_stop",
                evaluationSetBlockReason
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
            assertFpEvaluationOutcomeMatchesSelectedComposition({
              pluginInput: fpEvaluationInput,
              outcome: fpEvaluationOutcome
            });
            eventState = emitRunnerEvents(
              eventState,
              fpEvaluationCoreEvents({
                basis: request.basis,
                pluginInput: fpEvaluationInput,
                outcome: fpEvaluationOutcome
              })
            );
            const evaluationProjection = deriveRuntimeAggregateProjection(
              request.basis,
              eventState.replayEvents
            );
            const assuranceFold = assuranceDecisionForCurrentVector({
              basis: request.basis,
              runtimeProjection: evaluationProjection,
              replayEvents: eventState.replayEvents,
              vectorIndex: transition.vectorIndex,
              targetCarrierDefaults,
              evaluationSetProjection
            });
            eventState = emitRunnerEvents(eventState,
              constructClosureInputPublishedEvent({
                basis: request.basis,
                vectorIndex: transition.vectorIndex,
                closureInputRef: `closure-input:fp_evaluation:${fpEvaluationDigest({
                  basisId: request.basis.id,
                  vectorIndex: transition.vectorIndex,
                  projectionRef: assuranceFold.assuranceProjection.projectionRef
                })}`,
                projectionRef: assuranceFold.assuranceProjection.projectionRef,
                closureDecision: assuranceFold.closureDecision.decision,
                rowRefs: assuranceFold.closureDecision.rowIds,
                sourceProjectionRefs: [
                  fpEvaluationInput.sourceProjectionRef,
                  evaluationSetProjection.projectionRef,
                  assuranceFold.payloadLedger.projectionRef
                ],
                policyRefs: [
                  request.basis.resolvedPolicy.resolvedPolicyBundleRef
                ]
              })
            );
            const assuranceTerminal = terminalForAssuranceDecision({
              basis: request.basis,
              decision: assuranceFold.closureDecision.decision,
              reason: assuranceFold.closureDecision.reason
            });
            if (assuranceTerminal !== null) {
              eventState = emitRunnerEvents(eventState,
                constructVectorEvaluatedEvent({
                  basis: request.basis,
                  vectorIndex: transition.vectorIndex,
                  status: "blocked"
                })
              );
              eventState = emitRunnerEvents(
                eventState,
                constructTerminalReachedEvent(assuranceTerminal)
              );
              return constructResult({
                basis: request.basis,
                transition: assuranceTerminal,
                projection: deriveRuntimeAggregateProjection(request.basis, eventState.replayEvents),
                emittedEvents: eventState.emittedEvents,
                replayEvents: eventState.replayEvents,
                iterationCount
              });
            }
            eventState = emitRunnerEvents(eventState,
              constructVectorEvaluatedEvent({
                basis: request.basis,
                vectorIndex: transition.vectorIndex,
                status: "accepted"
              })
            );
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
            const plannedConsequenceTasks = plugins.consequenceTasks.map(
              (plugin, pluginIndex) => {
                if (plugin.contract.computeMeans === null) {
                  throw new TypeError(
                    "Consequence task plugin contract requires compute means"
                  );
                }
                const taskInput = constructEnginePluginInput({
                  contract: plugin.contract,
                  basis: request.basis,
                  projection: consequenceProjection,
                  replayEvents: eventState.replayEvents,
                  vectorIndex: transition.vectorIndex,
                  edge: transition.edge,
                  regime: plugin.contract.computeMeans,
                  traversalStrategySelection: modulatedAttempt?.selection ?? null,
                  traversalAttemptEnvelope: modulatedAttempt?.envelope ?? null,
                  abgFallbackBundle: request.abgFallbackBundle ?? null,
                  edgeAssuranceDefaults: request.edgeAssuranceDefaults ?? null,
                  constructionPressurePackage:
                    request.constructionPressurePackage ?? null,
                  pluginTraversalObserverFallbackEnabled:
                    request.pluginTraversalObserverFallbackEnabled ?? false,
                  pluginTraversalObserverFallbackKinds:
                    request.pluginTraversalObserverFallbackKinds ?? Object.freeze([])
                });
                return plannedComposedStageTaskForPlugin({
                  stageRole: "consequence",
                  plugin,
                  pluginIndex,
                  pluginInput: taskInput
                });
              }
            );
            const scalarConsequenceTask =
              scalarConsequenceTaskDeclaration(consequenceInput);
            const consequenceStagePlan = composedStageSetPlanForStage({
              basis: request.basis,
              stageRole: "consequence",
              scalarStageInput: consequenceInput,
              scalarTask: scalarConsequenceTask,
              plannedTasks: plannedConsequenceTasks,
              requiredTaskRefs: plugins.requiredConsequenceTaskRefs
            });
            const plannedConsequenceTaskByRef = new Map<string, PlannedComposedStageTask>();
            for (const plannedTask of plannedConsequenceTasks) {
              if (plannedConsequenceTaskByRef.has(plannedTask.declaration.taskRef)) {
                throw new TypeError(
                  `Duplicate consequence task ref ${plannedTask.declaration.taskRef}`
                );
              }
              plannedConsequenceTaskByRef.set(plannedTask.declaration.taskRef, plannedTask);
            }
            const consequenceStageOutcomes: ComposedStageTaskOutcome[] = [];
            for (const batch of consequenceStagePlan.taskBatches) {
              const plannedBatch = batch.flatMap((declaration) => {
                if (declaration.taskRef === scalarConsequenceTask.taskRef) {
                  return [];
                }
                const plannedTask = plannedConsequenceTaskByRef.get(declaration.taskRef);
                if (plannedTask === undefined) {
                  return [];
                }
                return [{ declaration, plannedTask }];
              });
              if (plannedBatch.length === 0) {
                continue;
              }
              const batchOutcomes = composedStageTaskBatchOutcomesFromEffectResult({
                result: yield Object.freeze({
                  kind: "composed_stage_task_batch_run",
                  stageRole: "consequence",
                  items: plannedBatch.map(({ plannedTask }) =>
                    Object.freeze({
                      pluginIndex: plannedTask.pluginIndex,
                      input: plannedTask.pluginInput
                    })
                  )
                }),
                pluginIndexes: plannedBatch.map(
                  ({ plannedTask }) => plannedTask.pluginIndex
                )
              });
              for (const [
                index,
                { declaration, plannedTask }
              ] of plannedBatch.entries()) {
                const taskOutcome = batchOutcomes[index];
                if (taskOutcome === undefined) {
                  throw new TypeError("Composed stage task batch omitted outcome");
                }
                assertComposedStageTaskOutcomeMatchesDeclaration({
                  declaration,
                  outcome: taskOutcome
                });
                consequenceStageOutcomes.push(taskOutcome);
                eventState = emitRunnerEvents(
                  eventState,
                  composedStageTaskOutcomeCoreEvents({
                    basis: request.basis,
                    pluginInput: plannedTask.pluginInput,
                    outcome: taskOutcome
                  })
                );
              }
            }
            const preProjectionConsequenceAdmission =
              constructComposedStageAdmission({
                plan: consequenceStagePlan,
                outcomes: consequenceStageOutcomes
              });
            const preProjectionConsequenceBlockingReason =
              composedStageSetBlockingReason({
                admission: preProjectionConsequenceAdmission,
                requiredTaskRefs: consequenceStagePlan.requiredTaskRefs,
                ignoreMissingTaskRefs: [scalarConsequenceTask.taskRef]
              });
            if (preProjectionConsequenceBlockingReason !== null) {
              const blocked = terminalTransition(
                request.basis,
                "gap_stop",
                preProjectionConsequenceBlockingReason
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
            const consequenceOutcome = consequenceProjectionOutcomeFromEffectResult(
              yield Object.freeze({
                kind: "consequence_project",
                input: consequenceInput
              })
            );
            const scalarConsequenceOutcome =
              composedStageTaskOutcomeFromConsequence({
                declaration: scalarConsequenceTask,
                pluginInput: consequenceInput,
                outcome: consequenceOutcome
              });
            assertComposedStageTaskOutcomeMatchesDeclaration({
              declaration: scalarConsequenceTask,
              outcome: scalarConsequenceOutcome
            });
            consequenceStageOutcomes.push(scalarConsequenceOutcome);
            eventState = emitRunnerEvents(
              eventState,
              composedStageTaskOutcomeCoreEvents({
                basis: request.basis,
                pluginInput: consequenceInput,
                outcome: scalarConsequenceOutcome
              })
            );
            const consequenceStageAdmission = constructComposedStageAdmission({
              plan: consequenceStagePlan,
              outcomes: consequenceStageOutcomes
            });
            const consequenceStageProjection = constructComposedStageProjection({
              plan: consequenceStagePlan,
              admission: consequenceStageAdmission
            });
            void consequenceStageProjection;
            const consequenceStageBlockingReason = composedStageSetBlockingReason({
              admission: consequenceStageAdmission,
              requiredTaskRefs: consequenceStagePlan.requiredTaskRefs
            });
            if (consequenceStageBlockingReason !== null) {
              const blocked = terminalTransition(
                request.basis,
                "gap_stop",
                consequenceStageBlockingReason
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
    case "composed_stage_task_batch_run":
      return Object.freeze({
        kind: "composed_stage_task_batch_run",
        outcomes: Object.freeze(
          effect.items.map((item) => {
            const sourcePlugins =
              effect.stageRole === "transform"
                ? plugins.transformTasks
                : plugins.consequenceTasks;
            const plugin = sourcePlugins[item.pluginIndex];
            if (plugin === undefined) {
              throw new TypeError("Unknown composed stage task plugin index");
            }
            return Object.freeze({
              pluginIndex: item.pluginIndex,
              outcome: admitComposedStageTaskOutcome(
                resolveSyncPluginOutcome(
                  plugin.run(item.input),
                  "composed stage task plugin"
                )
              )
            });
          })
        )
      });
    case "evaluation_rule_evaluate": {
      const plugin = plugins.evaluationRules[effect.pluginIndex];
      if (plugin === undefined) {
        throw new TypeError("Unknown evaluation rule plugin index");
      }
      return Object.freeze({
        kind: "evaluation_rule_evaluate",
        pluginIndex: effect.pluginIndex,
        outcome: admitEvaluationRuleOutcome(
          resolveSyncPluginOutcome(
            plugin.evaluate(effect.input),
            "evaluation rule plugin"
          )
        )
      });
    }
    case "evaluation_rule_batch_evaluate":
      return Object.freeze({
        kind: "evaluation_rule_batch_evaluate",
        outcomes: Object.freeze(
          effect.items.map((item) => {
            const plugin = plugins.evaluationRules[item.pluginIndex];
            if (plugin === undefined) {
              throw new TypeError("Unknown evaluation rule plugin index");
            }
            return Object.freeze({
              pluginIndex: item.pluginIndex,
              outcome: admitEvaluationRuleOutcome(
                resolveSyncPluginOutcome(
                  plugin.evaluate(item.input),
                  "evaluation rule plugin"
                )
              )
            });
          })
        )
      });
    case "fp_evaluate":
      return Object.freeze({
        kind: "fp_evaluate",
        outcome: admitFpEvaluationOutcome(
          resolveSyncPluginOutcome(
            plugins.fpEvaluator.evaluate(effect.input),
            "fp evaluator plugin"
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
    case "composed_stage_task_batch_run":
      return Object.freeze({
        kind: "composed_stage_task_batch_run",
        outcomes: Object.freeze(
          await Promise.all(
            effect.items.map(async (item) => {
              const sourcePlugins =
                effect.stageRole === "transform"
                  ? plugins.transformTasks
                  : plugins.consequenceTasks;
              const plugin = sourcePlugins[item.pluginIndex];
              if (plugin === undefined) {
                throw new TypeError("Unknown composed stage task plugin index");
              }
              return Object.freeze({
                pluginIndex: item.pluginIndex,
                outcome: admitComposedStageTaskOutcome(await plugin.run(item.input))
              });
            })
          )
        )
      });
    case "evaluation_rule_evaluate": {
      const plugin = plugins.evaluationRules[effect.pluginIndex];
      if (plugin === undefined) {
        throw new TypeError("Unknown evaluation rule plugin index");
      }
      return Object.freeze({
        kind: "evaluation_rule_evaluate",
        pluginIndex: effect.pluginIndex,
        outcome: admitEvaluationRuleOutcome(await plugin.evaluate(effect.input))
      });
    }
    case "evaluation_rule_batch_evaluate":
      return Object.freeze({
        kind: "evaluation_rule_batch_evaluate",
        outcomes: Object.freeze(
          await Promise.all(
            effect.items.map(async (item) => {
              const plugin = plugins.evaluationRules[item.pluginIndex];
              if (plugin === undefined) {
                throw new TypeError("Unknown evaluation rule plugin index");
              }
              return Object.freeze({
                pluginIndex: item.pluginIndex,
                outcome: admitEvaluationRuleOutcome(
                  await plugin.evaluate(item.input)
                )
              });
            })
          )
        )
      });
    case "fp_evaluate":
      return Object.freeze({
        kind: "fp_evaluate",
        outcome: admitFpEvaluationOutcome(
          await plugins.fpEvaluator.evaluate(effect.input)
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
