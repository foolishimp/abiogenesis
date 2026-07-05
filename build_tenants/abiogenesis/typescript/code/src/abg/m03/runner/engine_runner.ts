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
  EvidenceAdmittedRuntimeEvent,
  GraphReentryPoint,
  PayloadAmbiguityStatus,
  PayloadClosureDecisionKind,
  PluginTraversalKind,
  RuntimeAggregateProjection,
  RuntimeEvent,
  TerminalTransition
} from "../contracts/carriers.js";
import { GRAPH_REENTRY_POINT_VALUES } from "../contracts/carriers.js";
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
  constructInstructionCausalContextBoundEvent,
  constructInstructionPromptManifestProjectedEvent,
  constructInstructionResponseContractAdmittedEvent,
  constructPayloadObservedEvent,
  constructPayloadRejectedEvent,
  constructPayloadValidatedEvent,
  constructPluginTraversalPromptMaterializedEvent,
  constructTerminalReachedEvent,
  constructVectorClosedEvent,
  constructVectorEvaluatedEvent
} from "../contracts/event_factories.js";
import { assertCanonicalRuntimeEventSequence } from "../contracts/event_admission.js";
import {
  deriveAdvancementTransition,
  deriveIterationOutcomeFromRows,
  runtimeEventsForIterationDecision
} from "../contracts/iteration_state_action.js";
import {
  constructGraphReentryAppliedEvent,
  constructGraphReentryPlannedEvent,
  deriveAdvancementTransitionWithReentry,
  deriveGraphReentryFrontierProjection,
  deriveGraphReentryPlan
} from "../contracts/graph_span_reentry.js";
import {
  deriveRuntimeAggregateProjection,
  sourceProjectionRef
} from "../contracts/projection.js";
import {
  frameIdForBasis,
  graphCallIdForBasis,
  runtimeEventsForBasis,
  vectorEdge
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
  type ComposedStageProjection,
  type ComposedStageRole,
  type ComposedStageSetPlan,
  type ComposedStageTaskDeclaration,
  type ComposedStageTaskOutcome
} from "../contracts/composed_stage_set.js";
import {
  constructConstructionActionCatalogProjection,
  deriveObservationToActionBindingProjection
} from "../contracts/construction_action_catalog.js";
import {
  admitConstructionIntentCandidate
} from "../contracts/construction_intent.js";
import {
  admitPluginResultEnvelope,
  type AdmittedPluginResultEnvelope
} from "../contracts/plugin_result_envelope.js";
import type {
  AdmittedPluginResultInterfaceCatalog,
  AdmittedPluginResultInterfaceContract
} from "../contracts/plugin_result_interface_contract.js";
import {
  constructConstructionObservationSnapshot,
  constructConstructionRepairSurfaceTriageRow,
  constructObservationPressureRow
} from "../contracts/construction_observation.js";
import {
  constructConstructionPriorityScheme,
  deriveConstructionPriorityProjection
} from "../contracts/construction_priority.js";
import {
  admitConsequenceTraversalActionForAllowedCatalog,
  constructConstructionActionRowFromConsequenceTraversalAction,
  constructConstructionIntentCandidateFromConsequenceTraversalAction,
  type ConsequenceTraversalAction
} from "../contracts/consequence_traversal_action.js";
import type {
  AllowedConsequenceTraversalCatalog
} from "../contracts/allowed_consequence_traversal_catalog.js";
import type { AbgFallbackBundle } from "../contracts/plugin_traversal_observer.js";
import type { EdgeAssuranceDefaultContract } from "../contracts/edge_assurance_contract.js";
import type { ConstructionPressurePackage } from "../contracts/construction_pressure_package.js";
import type {
  GtlRequirementsAlgebraDeclarationBundle,
  GtlTargetCarrierDefaultsBundle
} from "../../../gtl/m01/contracts/index.js";
import {
  loadGtlTargetCarrierDefaultsBundle,
  resolveTargetCarrierContractBinding
} from "../../../gtl/m01/contracts/index.js";
import {
  constructAssuranceAuthoritySnapshot,
  deriveAssuranceClosureDecision,
  deriveAssuranceProjection,
  deriveAssuranceScopeRef,
  type AssuranceClosureDecision
} from "../contracts/assurance.js";
import {
  deriveAdmittedOutputAuthorityProjection,
  deriveAssuranceAuthoritySnapshotFromPayloadLedger,
  deriveAssuranceEvidenceRowsFromPayloadLedger,
  derivePayloadLedgerProjection
} from "../contracts/payload_ledger.js";
import {
  buildRequirementRouteRuntimeContextFromDeclarations,
  emitRequirementRouteFactsForEdgeClose,
  mintRuntimeScopeRef,
  type RequirementRouteRuntimeContext,
  type RouteReplayFact
} from "../contracts/requirements_route.js";
import {
  admitRuntimeGraphFunctionRegistryStartup,
  assertGraphFunctionInvocationSelected,
  constructRegistryLookupRequest,
  lookupRuntimeGraphFunctionRegistry,
  projectRuntimeGraphFunctionRegistry,
  selectGraphFunctionFromRegistry,
  type GraphFunctionSelectionEvent,
  type RuntimeRegistryEntryProjection,
  type RuntimeRegistryStartupAdmissionResult,
  type RuntimeRegistryStartupInput
} from "../contracts/runtime_graph_function_registry.js";
import {
  admitCompiledPromptPlanAtStartup,
  bindInstructionEnvelope,
  renderPromptManifest,
  type CompiledPromptPlan,
  type CompiledPromptPlanStartupAdmission,
  type PromptManifest,
  type RuntimeBindingFact
} from "../contracts/instruction_assembly.js";
import {
  constructExecutivePressureFactProjectedEvent,
  type ExecutiveContinuationInputProjection,
  type ProjectExecutiveObservationViewInput
} from "../contracts/executive_observer.js";
import { runExecutiveObserverProjection } from "./executive_observer_runner.js";
import type {
  RequirementEdgeRef
} from "../contracts/requirements_algebra.js";
import {
  constructRetryProgressRecordedEvent,
  deriveRetryRepairDecision,
  runtimeEventsForRetryRepairDecision
} from "../contracts/retry_repair.js";
import { deriveFreshRetryContextProjection } from "../contracts/retry_frontier.js";
import {
  deriveRuntimeContinuationTransitionProjection,
  deriveRuntimeContinuationTransitionProjectionFromDisposition,
  terminalTransitionForRuntimeContinuationProjection,
  type RuntimeContinuationTransitionProjection
} from "../contracts/continuation_transition.js";
import {
  constructAgenticBackendProgressProfile,
  constructTraversalAttemptDispatchedEvent,
  constructTraversalAttemptEnvelopeDerivedEvent,
  constructTraversalAttemptNonProgressClassifiedEvent,
  constructTraversalModulationResolvedEvent,
  deriveTraversalAttemptEnvelope,
  deriveTraversalModulationProfile,
  tryDeriveTraversalStrategySelectionFromRuntimeStart,
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
import {
  runConstructionIntentStep,
  runConstructionIntentStepAsync,
  type ConstructionIntentRunnerRequest,
  type ConstructionRunnerStepOutcome
} from "./construction_runner.js";
import { stableJson, stableSha256Digest } from "../../../shared/runtime_identity.js";

export interface EngineIterateRequest {
  readonly basis: ExecutionBasis;
  readonly runtimeEvents?: readonly RuntimeEvent[] | undefined;
  readonly eventSink: RuntimeEventSink;
  readonly runtimeRegistryStartup?: RuntimeRegistryStartupInput | undefined;
  readonly instructionAssemblyStartup?:
    | EngineInstructionAssemblyStartupInput
    | undefined;
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
  readonly pluginResultInterfaceCatalog?:
    | AdmittedPluginResultInterfaceCatalog
    | undefined;
  readonly requirementRouteDeclarationBundle?:
    | GtlRequirementsAlgebraDeclarationBundle
    | undefined;
  readonly executiveObserver?:
    | {
        readonly observation: ProjectExecutiveObservationViewInput;
        readonly priorResidualPressureRefs?: readonly string[] | undefined;
      }
    | undefined;
}

export interface EngineStartRequest extends ExecutionBasisAdmissionInput {
  readonly runtimeEvents?: readonly RuntimeEvent[] | undefined;
  readonly eventSink: RuntimeEventSink;
  readonly runtimeRegistryStartup?: RuntimeRegistryStartupInput | undefined;
  readonly instructionAssemblyStartup?:
    | EngineInstructionAssemblyStartupInput
    | undefined;
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
  readonly pluginResultInterfaceCatalog?:
    | AdmittedPluginResultInterfaceCatalog
    | undefined;
  readonly requirementRouteDeclarationBundle?:
    | GtlRequirementsAlgebraDeclarationBundle
    | undefined;
  readonly executiveObserver?:
    | {
        readonly observation: ProjectExecutiveObservationViewInput;
        readonly priorResidualPressureRefs?: readonly string[] | undefined;
      }
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

export interface EngineInstructionAssemblyStartupInput {
  readonly compiledPromptPlans: readonly CompiledPromptPlan[];
  readonly rendererRef: string;
}

interface EngineInstructionAssemblyPlanAdmission {
  readonly plan: CompiledPromptPlan;
  readonly admission: CompiledPromptPlanStartupAdmission;
}

interface EngineInstructionAssemblyRuntime {
  readonly rendererRef: string;
  readonly plans: readonly EngineInstructionAssemblyPlanAdmission[];
  readonly startupRejectedPlanRefs: readonly string[];
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

interface InstructionAssemblyTransitionScope {
  readonly vectorIndex: number;
  readonly edge: string;
  readonly dispatchRef: string;
}

function instructionAssemblyTransitionScopeFor(input: {
  readonly basis: ExecutionBasis;
  readonly transition: Exclude<AdvancementTransition, { readonly kind: "terminal" }>;
}): InstructionAssemblyTransitionScope | null {
  const dispatchRef =
    "dispatchRef" in input.transition
      ? input.transition.dispatchRef
      : input.basis.resolvedPolicy.dispatchRef;
  return dispatchRef === null
    ? null
    : Object.freeze({
        vectorIndex: input.transition.vectorIndex,
        edge: input.transition.edge,
        dispatchRef
      });
}

function actorInvocationForComposedStageTask(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly transition: InstructionAssemblyTransitionScope;
  readonly stageRole: "transform" | "evaluate" | "consequence";
  readonly taskRef: string;
  readonly pluginIndex: number;
}): ActorInvocation {
  const attemptIndex = actorAttemptIndexForProjection({
    projection: input.projection,
    vectorIndex: input.transition.vectorIndex
  });
  const dispatchScope = {
    basisId: input.basis.id,
    vectorIndex: input.transition.vectorIndex,
    stageRole: input.stageRole,
    taskRef: input.taskRef,
    pluginIndex: input.pluginIndex,
    attemptIndex
  };
  const scopedDigest = stableSha256Digest(dispatchScope);
  const dispatchRef = [
    input.transition.dispatchRef,
    "composed-stage",
    input.stageRole,
    scopedDigest
  ].join(":");
  return Object.freeze({
    kind: "actor_invocation",
    actorInvocationId: `actor-invocation:${JSON.stringify(dispatchScope)}`,
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    vectorIndex: input.transition.vectorIndex,
    edge: input.transition.edge,
    attemptIndex,
    dispatchRef,
    workerId: input.basis.runtimeIdentity.workerId,
    backendId: input.basis.runtimeIdentity.backendId,
    resultRef: `${dispatchRef}:result`,
    causationEventRefs: Object.freeze([input.transition.dispatchRef]),
    correlationId: [
      "actor-correlation",
      input.basis.id,
      String(input.transition.vectorIndex),
      input.stageRole,
      input.taskRef,
      String(input.pluginIndex),
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

function instructionAssemblyRuntimeForStartup(input: {
  readonly startup: EngineInstructionAssemblyStartupInput | undefined;
  readonly registryStartup: RuntimeRegistryStartupAdmissionResult | null;
}): EngineInstructionAssemblyRuntime | null {
  if (input.startup === undefined) {
    return null;
  }
  const startupEventRefs = Object.freeze(
    input.registryStartup?.admissionEvents.map((event) =>
      event.kind === "registry_entry_admitted"
        ? event.entryRef
        : event.declarationRef
    ) ?? []
  );
  const registryEntryRefs =
    input.registryStartup?.admittedEntryRefs ?? Object.freeze([]);
  const plans = Object.freeze(
    input.startup.compiledPromptPlans.map((plan) =>
      Object.freeze({
        plan,
        admission: admitCompiledPromptPlanAtStartup({
          plan,
          registryEntryRefs,
          startupEventRefs
        })
      })
    )
  );
  return Object.freeze({
    rendererRef: input.startup.rendererRef,
    plans: Object.freeze(
      plans.filter((row) => row.admission.admitted)
    ),
    startupRejectedPlanRefs: Object.freeze(
      plans
        .filter((row) => !row.admission.admitted)
        .map((row) => row.plan.planRef)
    )
  });
}

function instructionAssemblyPlanForTransition(input: {
  readonly runtime: EngineInstructionAssemblyRuntime | null;
  readonly basis: ExecutionBasis;
  readonly transition: InstructionAssemblyTransitionScope;
  readonly computeStageRole: "transform" | "evaluate" | "consequence" | "human_callout";
}): EngineInstructionAssemblyPlanAdmission | null {
  if (input.runtime === null) {
    return null;
  }
  return (
    input.runtime.plans.find(
      (row) =>
        selectedGraphFunctionRefMatchesBasis({
          selectedGraphFunctionRef: row.plan.graphFunctionRef,
          basis: input.basis
        }) &&
        row.plan.vectorRef === input.transition.edge &&
        row.plan.computeStageRole === input.computeStageRole
    ) ?? null
  );
}

function runtimeBindingFact(input: {
  readonly slotClass: RuntimeBindingFact["slotClass"];
  readonly ref: string;
  readonly sourceEventRefs: readonly string[];
  readonly payloadDigest?: string | null | undefined;
  readonly contentRef?: string | null | undefined;
  readonly contentDigest?: string | null | undefined;
  readonly contentExcerpt?: string | null | undefined;
}): RuntimeBindingFact {
  return Object.freeze({
    kind: "runtime_binding_fact",
    slotClass: input.slotClass,
    ref: input.ref,
    digest: stableSha256Digest({
      slotClass: input.slotClass,
      ref: input.ref,
      sourceEventRefs: input.sourceEventRefs,
      payloadDigest: input.payloadDigest ?? null,
      contentRef: input.contentRef ?? null,
      contentDigest: input.contentDigest ?? null,
      contentExcerpt: input.contentExcerpt ?? null
    }),
    sourceEventRefs: Object.freeze([...input.sourceEventRefs]),
    admitted: true,
    payloadDigest: input.payloadDigest ?? null,
    contentRef: input.contentRef ?? null,
    contentDigest: input.contentDigest ?? null,
    contentExcerpt: input.contentExcerpt ?? null
  });
}

function latestSelectedGraphFunctionEvent(input: {
  readonly basis: ExecutionBasis;
  readonly replayEvents: readonly RuntimeEvent[];
}): Extract<RuntimeEvent, { readonly kind: "graph_function_selected" }> | null {
  for (const event of [...input.replayEvents].reverse()) {
    if (
      event.kind === "graph_function_selected" &&
      selectedGraphFunctionRefMatchesBasis({
        selectedGraphFunctionRef: event.selectedGraphFunctionRef,
        basis: input.basis
      })
    ) {
      return event;
    }
  }
  return null;
}

function runtimeBindingFactsForInstructionAssembly(input: {
  readonly basis: ExecutionBasis;
  readonly transition: InstructionAssemblyTransitionScope;
  readonly actorInvocation: ActorInvocation;
  readonly pluginInput: EnginePluginInput;
  readonly plan: CompiledPromptPlan;
  readonly projection: RuntimeAggregateProjection;
  readonly replayEvents: readonly RuntimeEvent[];
}): readonly RuntimeBindingFact[] {
  const facts: RuntimeBindingFact[] = [
    runtimeBindingFact({
      slotClass: "graph_call",
      ref: graphCallIdForBasis(input.basis),
      sourceEventRefs: [input.pluginInput.sourceProjectionRef]
    }),
    runtimeBindingFact({
      slotClass: "frame",
      ref: frameIdForBasis(input.basis),
      sourceEventRefs: [input.pluginInput.sourceProjectionRef]
    }),
    runtimeBindingFact({
      slotClass: "vector",
      ref: input.transition.edge,
      sourceEventRefs: [input.transition.dispatchRef]
    }),
    runtimeBindingFact({
      slotClass: "event_log",
      ref: input.pluginInput.sourceProjectionRef,
      sourceEventRefs: [input.pluginInput.sourceProjectionRef]
    }),
    runtimeBindingFact({
      slotClass: "worker_invocation",
      ref: input.actorInvocation.actorInvocationId,
      sourceEventRefs: [input.transition.dispatchRef]
    })
  ];
  const selection = latestSelectedGraphFunctionEvent({
    basis: input.basis,
    replayEvents: input.replayEvents
  });
  if (selection !== null) {
    facts.push(
      runtimeBindingFact({
        slotClass: "selected_graph_function",
        ref: selection.selectedGraphFunctionRef,
        sourceEventRefs: [selection.selectionRef, selection.lookupResultRef]
      })
    );
  }
  const vector = input.basis.graph.vectors[input.transition.vectorIndex];
  if (vector !== undefined) {
    for (const source of vector.source) {
      facts.push(
        runtimeBindingFact({
          slotClass: "source_node",
          ref: source.id,
          sourceEventRefs: [input.pluginInput.sourceProjectionRef]
        })
      );
    }
    facts.push(
      runtimeBindingFact({
        slotClass: "target_node",
        ref: vector.target.id,
        sourceEventRefs: [input.pluginInput.sourceProjectionRef]
      })
    );
  }
  if (input.pluginInput.attachedResultArtifact !== null) {
    const content = stableJson(input.pluginInput.attachedResultArtifact);
    facts.push(
      runtimeBindingFact({
        slotClass: "payload",
        ref: [
          "candidate-payload",
          input.basis.id,
          String(input.transition.vectorIndex),
          input.actorInvocation.actorInvocationId
        ].join(":"),
        sourceEventRefs: [input.pluginInput.sourceProjectionRef],
        payloadDigest: stableSha256Digest(input.pluginInput.attachedResultArtifact),
        contentRef: input.pluginInput.actorInvocationRef?.resultRef ?? null,
        contentDigest: stableSha256Digest(content),
        contentExcerpt:
          content.length > 2400 ? `${content.slice(0, 2400)}...` : content
      })
    );
  }
  const context = input.pluginInput.instructionCausalContext;
  if (context !== null) {
    const prerequisiteEdgeRefs = new Set(
      input.plan.dependencyInstructionTruth?.prerequisiteEdgeRefs ?? []
    );
    const selectedBindings = context.bindings.filter((binding) => {
      if (binding.bindingRole === "same_vector_retry_repair") {
        return true;
      }
      if (prerequisiteEdgeRefs.size === 0) {
        return binding.required;
      }
      return prerequisiteEdgeRefs.has(binding.sourceEdge);
    });
    for (const binding of selectedBindings) {
      facts.push(
        runtimeBindingFact({
          slotClass: "prior_artifact",
          ref: binding.payloadRef,
          sourceEventRefs: [
            binding.sourceProjectionRef,
            ...binding.evidenceRefs
          ],
          payloadDigest: binding.payloadDigest,
          contentRef: binding.contentRef,
          contentDigest: binding.contentDigest,
          contentExcerpt:
            binding.contentMode === "excerpt" ? binding.contentExcerpt : null
        })
      );
    }
    const selectedEvidenceRefs = Object.freeze(
      [...new Set(selectedBindings.flatMap((binding) => binding.evidenceRefs))].sort(
        (left, right) => (left < right ? -1 : left > right ? 1 : 0)
      )
    );
    for (const evidenceRef of selectedEvidenceRefs) {
      facts.push(
        runtimeBindingFact({
          slotClass: "evidence",
          ref: evidenceRef,
          sourceEventRefs: selectedBindings.map((binding) => binding.sourceProjectionRef)
        })
      );
    }
  }
  for (const projectionRow of input.pluginInput.outputAuthorityProjections) {
    facts.push(
      runtimeBindingFact({
        slotClass: "policy",
        ref: projectionRow.projectionRef,
        sourceEventRefs: [input.pluginInput.sourceProjectionRef]
      })
    );
  }
  return Object.freeze(facts);
}

type InstructionAssemblyFpBinding =
  | {
      readonly kind: "not_configured";
    }
  | {
      readonly kind: "blocked";
      readonly reason: string;
    }
  | {
      readonly kind: "manifest_projected";
      readonly event: RuntimeEvent;
      readonly manifest: PromptManifest;
    };

function instructionAssemblyBindingBlockReason(
  binding: Extract<InstructionAssemblyFpBinding, { readonly kind: "blocked" | "not_configured" }>
): string {
  return binding.kind === "not_configured"
    ? "instruction assembly startup is absent for F_P dispatch"
    : binding.reason;
}

function bindInstructionAssemblyForFpEffect(input: {
  readonly runtime: EngineInstructionAssemblyRuntime | null;
  readonly basis: ExecutionBasis;
  readonly transition: InstructionAssemblyTransitionScope;
  readonly computeStageRole: "transform" | "evaluate" | "consequence" | "human_callout";
  readonly actorInvocation: ActorInvocation;
  readonly pluginInput: EnginePluginInput;
  readonly projection: RuntimeAggregateProjection;
  readonly replayEvents: readonly RuntimeEvent[];
}): InstructionAssemblyFpBinding {
  const row = instructionAssemblyPlanForTransition({
    runtime: input.runtime,
    basis: input.basis,
    transition: input.transition,
    computeStageRole: input.computeStageRole
  });
  if (row === null) {
    return input.runtime === null
      ? Object.freeze({ kind: "not_configured" })
      : Object.freeze({
          kind: "blocked",
          reason: `instruction assembly startup has no admitted plan for ${input.computeStageRole} ${input.transition.edge}`
        });
  }
  const bindResult = bindInstructionEnvelope({
    envelopeRef: [
      "instruction-envelope",
      input.basis.id,
      String(input.transition.vectorIndex),
      input.computeStageRole,
      input.actorInvocation.actorInvocationId
    ].join(":"),
    plan: row.plan,
    startupAdmission: row.admission,
    runtimeFacts: runtimeBindingFactsForInstructionAssembly({
      ...input,
      plan: row.plan
    })
  });
  if (!bindResult.accepted) {
    const issueSummary = bindResult.issues
      .map((issue) => `${issue.issueKind}:${issue.message}`)
      .join(",");
    return Object.freeze({
      kind: "blocked",
      reason: `instruction envelope binding failed: ${issueSummary}`
    });
  }
  const renderResult = renderPromptManifest({
    manifestRef: [
      "prompt-manifest",
      input.basis.id,
      String(input.transition.vectorIndex),
      input.computeStageRole,
      input.actorInvocation.actorInvocationId
    ].join(":"),
    plan: row.plan,
    envelope: bindResult.envelope,
    rendererRef: input.runtime?.rendererRef ?? "renderer://abg/instruction-assembly/default"
  });
  if (!renderResult.accepted) {
    return Object.freeze({
      kind: "blocked",
      reason: `prompt manifest render blocked: ${renderResult.issues.map((issue) => issue.issueKind).join(",")}`
    });
  }
  return Object.freeze({
    kind: "manifest_projected",
    manifest: renderResult.manifest,
    event: constructInstructionPromptManifestProjectedEvent({
      invocation: input.actorInvocation,
      manifest: renderResult.manifest,
      causationEventRefs: Object.freeze([
        input.transition.dispatchRef,
        row.admission.planRef
      ]),
      correlationId: [
        "instruction-prompt-manifest",
        input.basis.id,
        String(input.transition.vectorIndex),
        input.computeStageRole,
        input.actorInvocation.actorInvocationId
      ].join(":")
    })
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
  const selection =
    tryDeriveTraversalStrategySelectionFromRuntimeStart({
      basis: input.basis,
      vectorIndex: input.transition.vectorIndex
    }) ??
    tryDeriveTraversalStrategySelectionFromGtl({
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
      batch: selection.batch,
      continuation: selection.continuation
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
  readonly targetCarrierDefaults: GtlTargetCarrierDefaultsBundle;
  readonly priorStageProjectionRefs: readonly string[];
  readonly priorStageFoldInputRefs: readonly string[];
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
    targetCarrierDefaults: input.targetCarrierDefaults,
    pluginTraversalObserverFallbackEnabled:
      input.pluginTraversalObserverFallbackEnabled,
    pluginTraversalObserverFallbackKinds:
      input.pluginTraversalObserverFallbackKinds,
    priorStageProjectionRefs: input.priorStageProjectionRefs,
    priorStageFoldInputRefs: input.priorStageFoldInputRefs
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
  if (
    input.pluginInput.instructionCausalContext !== null &&
    input.pluginInput.instructionCausalContext.status !== "empty"
  ) {
    events.push(
      constructInstructionCausalContextBoundEvent({
        basis: input.basis,
        context: input.pluginInput.instructionCausalContext,
        invocation: input.actorInvocation,
        causationEventRefs: Object.freeze([
          input.transition.dispatchRef,
          input.pluginInput.sourceProjectionRef
        ]),
        correlationId: [
          "instruction-causal-context",
          input.basis.id,
          String(input.transition.vectorIndex),
          input.actorInvocation.actorInvocationId
        ].join(":")
      })
    );
  }
  if (input.pluginInput.instructionCausalContext?.status === "blocked") {
    return Object.freeze(events);
  }
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
  readonly vectorIndex: number;
  readonly reason: string | null;
}): TerminalTransition {
  const outcome = deriveIterationOutcomeFromRows({
    vectorIndex: input.vectorIndex,
    runtimeRows: [
      {
        boundary: "worker",
        status: "failed",
        reason: "retry_exhausted",
        retryable: false,
        evidenceRefs: input.reason === null ? [] : [input.reason]
      }
    ]
  });
  if (outcome.kind !== "terminate" || outcome.disposition !== "blocked") {
    throw new TypeError("Bounded attempt exit drifted from iteration fold");
  }
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

function candidateAssuranceRetryManifestId(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly vectorIndex: number;
}): string {
  const attemptIndex =
    input.projection.retryAttemptRefs.filter(
      (attempt) => attempt.vectorIndex === input.vectorIndex
    ).length + 1;
  return `manifest:assurance_retry:${JSON.stringify({
    basisId: input.basis.id,
    vectorIndex: input.vectorIndex,
    attemptIndex
  })}`;
}

function candidateEvaluationSetRetryManifestId(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly vectorIndex: number;
  readonly outcomes: readonly EvaluationRuleOutcome[];
}): string {
  const attemptIndex =
    input.projection.retryAttemptRefs.filter(
      (attempt) => attempt.vectorIndex === input.vectorIndex
    ).length + 1;
  return `manifest:evaluation_set_retry:${JSON.stringify({
    basisId: input.basis.id,
    vectorIndex: input.vectorIndex,
    attemptIndex,
    ruleRefs: input.outcomes.map((outcome) => outcome.ruleRef)
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

function assuranceRetryContinuationRepair(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly vectorIndex: number;
}) {
  const observedAttemptCount = input.projection.retryAttemptRefs.filter(
    (attempt) => attempt.vectorIndex === input.vectorIndex
  ).length;
  const prefix = `continuation:${input.basis.id}:${input.vectorIndex}:assurance_retry`;
  return Object.freeze({
    terminatedContinuationId: `${prefix}:attempt:${observedAttemptCount}`,
    reopenedContinuationId: `${prefix}:attempt:${observedAttemptCount + 1}`
  });
}

function evaluationSetRetryContinuationRepair(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly vectorIndex: number;
}) {
  const observedAttemptCount = input.projection.retryAttemptRefs.filter(
    (attempt) => attempt.vectorIndex === input.vectorIndex
  ).length;
  const prefix = `continuation:${input.basis.id}:${input.vectorIndex}:evaluation_set_retry`;
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
      readonly transitionProjection: RuntimeContinuationTransitionProjection;
      readonly retryEvents: readonly RuntimeEvent[];
    }
  | {
      readonly kind: "terminal";
      readonly summary: TraversalContinuationSummary;
      readonly carrier: TraversalNonProgressCarrier;
      readonly action: TraversalContinuationActionProjection;
      readonly transitionProjection: RuntimeContinuationTransitionProjection;
      readonly transition: TerminalTransition;
    };

function deriveBlockedFpNoArtifactContinuation(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly replayEvents: readonly RuntimeEvent[];
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
  const transitionProjection = deriveRuntimeContinuationTransitionProjection({
    basis: input.basis,
    runtimeProjection: input.projection,
    vectorIndex: input.transition.vectorIndex,
    traversalContinuationAction: action
  });

  if (transitionProjection.disposition === "retry_same_edge") {
    const retryContext = deriveFreshRetryContextProjection({
      basis: input.basis,
      runtimeProjection: input.projection,
      events: input.replayEvents,
      vectorIndex: input.transition.vectorIndex
    });
    if (retryContext.status !== "fresh") {
      throw new TypeError(
        `Traversal no-progress retry rejects ${retryContext.status}: ${retryContext.reason ?? "retry context is not fresh"}`
      );
    }
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
      transitionProjection,
      retryEvents: runtimeEventsForRetryRepairDecision(retryDecision)
    });
  }

  const transition = terminalTransitionForRuntimeContinuationProjection({
    basis: input.basis,
    projection: transitionProjection
  });
  if (transition === null) {
    throw new TypeError(
      "Runtime continuation transition produced no terminal for non-retry disposition"
    );
  }
  return Object.freeze({
    kind: "terminal",
    summary,
    carrier,
    action,
    transitionProjection,
    transition
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
  readonly vectorIndex: number;
  readonly outcome: FdEvaluationOutcome;
}): TerminalTransition | null {
  const reasonRefs = [
    input.outcome.reason ?? null,
    input.outcome.severityClass ?? null
  ].filter((ref): ref is string => ref !== null && ref.length > 0);
  const outcome =
    input.outcome.routingDecision === "block"
      ? deriveIterationOutcomeFromRows({
          vectorIndex: input.vectorIndex,
          runtimeRows: [
            {
              boundary: "worker",
              status: "failed",
              reason: "runtime_failure",
              retryable: false,
              evidenceRefs: reasonRefs
            }
          ]
        })
      : input.outcome.routingDecision === "route_to_fp"
        ? deriveIterationOutcomeFromRows({
            vectorIndex: input.vectorIndex,
            runtimeRows: [
              {
                boundary: "worker",
                status: "handoff",
                reason: null,
                retryable: false,
                evidenceRefs: reasonRefs
              }
            ]
          })
        : null;
  if (
    outcome !== null &&
    outcome.kind === "terminate" &&
    outcome.disposition === "blocked"
  ) {
    return terminalTransition(
      input.basis,
      "gap_stop",
      input.outcome.reason ??
        `fd authority blocked traversal: ${input.outcome.severityClass ?? "unknown"}`
    );
  }
  if (outcome !== null && outcome.kind === "suspend") {
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
  readonly pluginInput: EnginePluginInput;
  readonly outcome: FdEvaluationOutcome;
  readonly resultInterfaces: readonly AdmittedPluginResultInterfaceContract[];
}): readonly RuntimeEvent[] {
  return Object.freeze([
    constructFdAuthorityOutcomeAdmittedEvent({
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
    }),
    ...pluginResultEnvelopeEvents({
      basis: input.basis,
      pluginInput: input.pluginInput,
      envelope: admittedPluginResultEnvelopeForOutcome({
        pluginInput: input.pluginInput,
        resultInterfaces: input.resultInterfaces,
        stageRole: "evaluate",
        computeMeans: "F_D",
        outputCarrierRefs: Object.freeze(["FdEvaluationOutcome"]),
        evidenceRefs: input.outcome.evidenceRefs,
        outcomeKind: input.outcome.kind,
        outcomeStatus: input.outcome.status
      })
    })
  ]);
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

function evaluationRuleOutcomeHasRetryContinuation(
  outcome: EvaluationRuleOutcome
): boolean {
  return outcome.status === "blocked" && outcome.continuationRefs.length > 0;
}

function fpEvaluationContinuationRefs(
  outcome: FpEvaluationOutcome
): readonly string[] {
  if (outcome.status !== "evaluated") {
    return Object.freeze([]);
  }
  return uniqueStrings(
    outcome.findings.flatMap((finding) => finding.continuationRefs)
  );
}

function pluginInputLedgerRefs(input: EnginePluginInput): readonly string[] {
  return uniqueStrings([
    input.sourceProjectionRef,
    ...input.priorStageFoldInputRefs,
    ...input.stageSetDependencyRefs
  ]);
}

function pluginInputIdentity(input: EnginePluginInput): Readonly<Record<string, unknown>> {
  return Object.freeze({
    sourceProjectionRef: input.sourceProjectionRef,
    selectedCompositionRef: input.selectedCompositionRef,
    selectedCompositionDigest: input.selectedCompositionDigest,
    selectedCompositionSelectionRef: input.selectedCompositionSelectionRef,
    selectedRegimeBindingRef: input.selectedRegimeBindingRef,
    priorStageProjectionRefs: input.priorStageProjectionRefs,
    priorStageFoldInputRefs: input.priorStageFoldInputRefs,
    stageSetDependencyRefs: input.stageSetDependencyRefs,
    computeStageBindingPredecessorRefs:
      input.computeStageBinding?.predecessorRefs ?? Object.freeze([])
  });
}

function resultInterfaceMatchesOutputCarriers(input: {
  readonly row: AdmittedPluginResultInterfaceContract;
  readonly outputCarrierRefs: readonly string[];
}): boolean {
  if (input.outputCarrierRefs.length === 0) {
    return true;
  }
  return input.outputCarrierRefs.every((ref) =>
    input.row.outputCarrierRefs.includes(ref)
  );
}

function selectPluginResultInterface(input: {
  readonly pluginInput: EnginePluginInput;
  readonly resultInterfaces: readonly AdmittedPluginResultInterfaceContract[];
  readonly stageRole: AdmittedPluginResultInterfaceContract["stageRole"];
  readonly computeMeans: AdmittedPluginResultInterfaceContract["computeMeans"];
  readonly outputCarrierRefs: readonly string[];
}): AdmittedPluginResultInterfaceContract | null {
  if (input.resultInterfaces.length === 0) {
    return null;
  }
  const matches = input.resultInterfaces.filter(
    (row) =>
      row.compositionRef === input.pluginInput.selectedCompositionRef &&
      row.compositionDigest === input.pluginInput.selectedCompositionDigest &&
      row.stageRole === input.stageRole &&
      row.computeMeans === input.computeMeans &&
      resultInterfaceMatchesOutputCarriers({
        row,
        outputCarrierRefs: input.outputCarrierRefs
      })
  );
  const match = matches[0];
  if (matches.length !== 1 || match === undefined) {
    throw new TypeError(
      [
        "plugin result interface admission expected exactly one admitted GTL contract",
        `stage=${input.computeMeans}.${input.stageRole}`,
        `composition=${input.pluginInput.selectedCompositionRef}`,
        `outputCarriers=${input.outputCarrierRefs.join(",") || "none"}`,
        `matches=${matches.length}`
      ].join(" ")
    );
  }
  return match;
}

function admittedPluginResultEnvelopeForOutcome(input: {
  readonly pluginInput: EnginePluginInput;
  readonly resultInterfaces: readonly AdmittedPluginResultInterfaceContract[];
  readonly stageRole: AdmittedPluginResultInterfaceContract["stageRole"];
  readonly computeMeans: AdmittedPluginResultInterfaceContract["computeMeans"];
  readonly outputCarrierRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly outcomeKind: string;
  readonly outcomeStatus: string;
  readonly resultRef?: string | null | undefined;
}): AdmittedPluginResultEnvelope | null {
  const resultInterface = selectPluginResultInterface({
    pluginInput: input.pluginInput,
    resultInterfaces: input.resultInterfaces,
    stageRole: input.stageRole,
    computeMeans: input.computeMeans,
    outputCarrierRefs: input.outputCarrierRefs
  });
  if (resultInterface === null) {
    return null;
  }
  const resultRef =
    input.resultRef ??
    `plugin-result:${stableSha256Digest({
      basisId: input.pluginInput.basisId,
      graphFunctionId: input.pluginInput.graphFunctionId,
      vectorIndex: input.pluginInput.vectorIndex,
      edge: input.pluginInput.edge,
      outcomeKind: input.outcomeKind,
      outcomeStatus: input.outcomeStatus,
      resultInterfaceRef: resultInterface.resultInterfaceRef
    })}`;
  return admitPluginResultEnvelope({
    resultInterface,
    resultRef,
    result: Object.freeze({
      kind: "abg_plugin_result_envelope_source",
      stage: `${input.computeMeans}.${input.stageRole}`,
      computeNotationStage: `${input.stageRole}.C`,
      outcomeKind: input.outcomeKind,
      outcomeStatus: input.outcomeStatus,
      compositionRef: input.pluginInput.selectedCompositionRef,
      compositionDigest: input.pluginInput.selectedCompositionDigest,
      compositionSelectionRef:
        input.pluginInput.selectedCompositionSelectionRef,
      selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef,
      evidenceRefs: input.evidenceRefs
    }),
    label: "EnginePluginResultEnvelope"
  });
}

function pluginResultEnvelopeEvents(input: {
  readonly basis: ExecutionBasis;
  readonly pluginInput: EnginePluginInput;
  readonly envelope: AdmittedPluginResultEnvelope | null;
}): readonly RuntimeEvent[] {
  if (input.envelope === null) {
    return Object.freeze([]);
  }
  const envelope = input.envelope;
  const digest = `digest:plugin_result_envelope:${fpEvaluationDigest(envelope)}`;
  const inputDigest = `input:plugin_result_envelope:${fpEvaluationDigest({
    pluginInput: pluginInputIdentity(input.pluginInput),
    resultInterfaceRef: envelope.resultInterfaceRef,
    resultInterfaceContractDigest: envelope.resultInterfaceContractDigest,
    resultRef: envelope.resultRef
  })}`;
  const policyRefs = Object.freeze([
    input.basis.resolvedPolicy.resolvedPolicyBundleRef
  ]);
  return Object.freeze([
    constructPayloadObservedEvent({
      basis: input.basis,
      vectorIndex: input.pluginInput.vectorIndex,
      payloadRef: envelope.envelopeRef,
      payloadClass: "admitted_plugin_result_envelope",
      schemaRef: "schema://abg/plugin-result-envelope",
      contractRef: envelope.resultEnvelopeContractRef,
      digest,
      producerRef: input.pluginInput.contract.ref,
      sourceEventRef: input.pluginInput.sourceProjectionRef,
      actorInvocationId:
        input.pluginInput.actorInvocationRef?.actorInvocationId ?? null,
      authorityRef: envelope.resultInterfaceRef,
      inputDigest,
      policyRefs
    }),
    constructPayloadValidatedEvent({
      basis: input.basis,
      vectorIndex: input.pluginInput.vectorIndex,
      payloadRef: envelope.envelopeRef,
      schemaRef: "schema://abg/plugin-result-envelope",
      contractRef: envelope.resultEnvelopeContractRef,
      contractDigest: envelope.resultInterfaceContractDigest,
      digest,
      validationRef: `validation:plugin_result_envelope:${envelope.envelopeRef}`,
      evidenceRef: envelope.evidenceRefs[0] ?? null,
      policyRefs
    }),
    ...envelope.evidenceRefs.map((evidenceRef) =>
      constructEvidenceAdmittedEvent({
        basis: input.basis,
        vectorIndex: input.pluginInput.vectorIndex,
        evidenceRef,
        payloadRef: envelope.envelopeRef,
        authorityRef: envelope.resultInterfaceRef,
        authorityDigest: envelope.resultInterfaceContractDigest,
        inputDigest,
        providerRefs: [input.pluginInput.contract.ref],
        policyRefs,
        complete: true,
        shallow: false,
        contradictsAuthority: false,
        deferred: false
      })
    )
  ]);
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

function stageProjectionRefs(
  projection: ComposedStageProjection | EvaluationSetProjection | null
): readonly string[] {
  if (projection === null) {
    return Object.freeze([]);
  }
  return Object.freeze([projection.projectionRef]);
}

function stageProjectionFoldInputRefs(
  projection: ComposedStageProjection | EvaluationSetProjection | null
): readonly string[] {
  if (projection === null) {
    return Object.freeze([]);
  }
  return projection.foldInputRefs;
}

function composedStageProjectionForCurrentOutcomes(
  plan: ComposedStageSetPlan,
  outcomes: readonly ComposedStageTaskOutcome[]
): ComposedStageProjection | null {
  if (outcomes.length === 0) {
    return null;
  }
  return constructComposedStageProjection({
    plan,
    admission: constructComposedStageAdmission({ plan, outcomes })
  });
}

function evaluationSetProjectionForCurrentOutcomes(
  plan: EvaluationSetPlan,
  outcomes: readonly EvaluationRuleOutcome[]
): EvaluationSetProjection | null {
  if (outcomes.length === 0) {
    return null;
  }
  return constructEvaluationSetProjection({
    plan,
    admission: constructEvaluationSetAdmission({ plan, outcomes })
  });
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
      input.plugin.inputLedgerRefs ??
      pluginInputLedgerRefs(input.pluginInput),
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
    inputLedgerRefs: pluginInputLedgerRefs(pluginInput),
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
    inputLedgerRefs: pluginInputLedgerRefs(pluginInput),
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
  readonly outputCarrierRefs: readonly string[];
  readonly resultInterfaces: readonly AdmittedPluginResultInterfaceContract[];
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
        pluginInput: pluginInputIdentity(input.pluginInput),
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
    }),
    ...pluginResultEnvelopeEvents({
      basis: input.basis,
      pluginInput: input.pluginInput,
      envelope: admittedPluginResultEnvelopeForOutcome({
        pluginInput: input.pluginInput,
        resultInterfaces: input.resultInterfaces,
        stageRole: input.outcome.stageRole,
        computeMeans: input.outcome.computeMeans,
        outputCarrierRefs: input.outputCarrierRefs,
        evidenceRefs: input.outcome.evidenceRefs,
        outcomeKind: input.outcome.kind,
        outcomeStatus: input.outcome.status
      })
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
      input.plugin.inputLedgerRefs ??
      pluginInputLedgerRefs(input.pluginInput),
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
    inputLedgerRefs: pluginInputLedgerRefs(pluginInput),
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
    inputLedgerRefs: pluginInputLedgerRefs(pluginInput),
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
  readonly outputCarrierRefs: readonly string[];
  readonly resultInterfaces: readonly AdmittedPluginResultInterfaceContract[];
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
        pluginInput: pluginInputIdentity(input.pluginInput)
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
    }),
    ...pluginResultEnvelopeEvents({
      basis: input.basis,
      pluginInput: input.pluginInput,
      envelope: admittedPluginResultEnvelopeForOutcome({
        pluginInput: input.pluginInput,
        resultInterfaces: input.resultInterfaces,
        stageRole: "evaluate",
        computeMeans: input.outcome.computeMeans,
        outputCarrierRefs: input.outputCarrierRefs,
        evidenceRefs: input.outcome.evidenceRefs,
        outcomeKind: input.outcome.kind,
        outcomeStatus: input.outcome.status
      })
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

function evaluationSetRetryableBlockedRequiredOutcomes(input: {
  readonly admission: ReturnType<typeof constructEvaluationSetAdmission>;
  readonly requiredRuleRefs: readonly string[];
  readonly ignoreMissingRuleRefs?: readonly string[] | undefined;
}): readonly EvaluationRuleOutcome[] {
  const ignoredMissing = new Set(input.ignoreMissingRuleRefs ?? Object.freeze([]));
  const missingRequiredRuleRefs = input.admission.missingRequiredRuleRefs.filter(
    (ruleRef) => !ignoredMissing.has(ruleRef)
  );
  if (missingRequiredRuleRefs.length > 0) {
    return Object.freeze([]);
  }
  const requiredRuleRefs = new Set(input.requiredRuleRefs);
  const rejectedRequired = input.admission.rejectedRuleOutcomes.filter(
    (ruleOutcome) => requiredRuleRefs.has(ruleOutcome.ruleRef)
  );
  if (rejectedRequired.length === 0) {
    return Object.freeze([]);
  }
  if (
    rejectedRequired.some(
      (ruleOutcome) => !evaluationRuleOutcomeHasRetryContinuation(ruleOutcome)
    )
  ) {
    return Object.freeze([]);
  }
  return Object.freeze(rejectedRequired);
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

function evaluationSetRetryPriorManifestId(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly outcomes: readonly EvaluationRuleOutcome[];
}): string {
  return `manifest:evaluation_set_block:${JSON.stringify({
    basisId: input.basis.id,
    vectorIndex: input.vectorIndex,
    ruleRefs: input.outcomes.map((outcome) => outcome.ruleRef),
    reasons: input.outcomes.map((outcome) => outcome.reason ?? "blocked")
  })}`;
}

function evaluationSetRetryProgressSignalRefs(input: {
  readonly outcomes: readonly EvaluationRuleOutcome[];
}): readonly string[] {
  return uniqueStrings(
    input.outcomes.flatMap((outcome) => [
      `blocking_reason:${outcome.reason ?? "evaluation_rule_blocked"}`,
      `evaluation_rule:${outcome.ruleRef}`,
      ...outcome.residualPressureRefs,
      ...outcome.continuationRefs,
      ...outcome.diagnosticRefs,
      ...outcome.evidenceRefs
    ])
  );
}

function evaluationSetRetryEvents(input: {
  readonly basis: ExecutionBasis;
  readonly runtimeProjection: RuntimeAggregateProjection;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly vectorIndex: number;
  readonly outcomes: readonly EvaluationRuleOutcome[];
  readonly maxAttempts: number;
}): readonly RuntimeEvent[] | TerminalTransition {
  const retryContext = deriveFreshRetryContextProjection({
    basis: input.basis,
    runtimeProjection: input.runtimeProjection,
    events: input.replayEvents,
    vectorIndex: input.vectorIndex
  });
  if (retryContext.status !== "fresh") {
    throw new TypeError(
      `Evaluation-set retry rejects ${retryContext.status}: ${retryContext.reason ?? "retry context is not fresh"}`
    );
  }
  const retryDecision = deriveRetryRepairDecision({
    basis: input.basis,
    projection: input.runtimeProjection,
    failedVectorIndex: input.vectorIndex,
    priorManifestId: evaluationSetRetryPriorManifestId({
      basis: input.basis,
      vectorIndex: input.vectorIndex,
      outcomes: input.outcomes
    }),
    candidateManifestId: candidateEvaluationSetRetryManifestId({
      basis: input.basis,
      projection: input.runtimeProjection,
      vectorIndex: input.vectorIndex,
      outcomes: input.outcomes
    }),
    maxAttempts: input.maxAttempts,
    stationary: false,
    escalationSubjectRef: input.basis.resolvedPolicy.approvalSubjectRef,
    continuationRepair: evaluationSetRetryContinuationRepair({
      basis: input.basis,
      projection: input.runtimeProjection,
      vectorIndex: input.vectorIndex
    })
  });
  const retryEvents = runtimeEventsForRetryRepairDecision(retryDecision);
  switch (retryDecision.kind) {
    case "retry_planned":
      return Object.freeze([
        ...retryEvents,
        constructRetryProgressRecordedEvent({
          decision: retryDecision,
          progressSignalRefs: evaluationSetRetryProgressSignalRefs({
            outcomes: input.outcomes
          }),
          stationary: false
        })
      ]);
    case "retry_escalated":
      return terminalTransition(input.basis, "yielded", retryDecision.gateReason);
    case "retry_stopped":
      return terminalTransition(input.basis, "gap_stop", retryDecision.reason);
    default: {
      const exhaustive: never = retryDecision;
      throw new TypeError(
        `Unsupported evaluation-set retry decision ${JSON.stringify(exhaustive)}`
      );
    }
  }
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
    const scope = finding.evaluationScopeRef;
    if (scope !== null) {
      if (scope.graphCallRef !== input.pluginInput.graphCallId) {
        throw new TypeError(
          "FpEvaluationFinding.evaluationScopeRef.graphCallRef does not match current graph call"
        );
      }
      if (scope.frameRef !== input.pluginInput.frameId) {
        throw new TypeError(
          "FpEvaluationFinding.evaluationScopeRef.frameRef does not match current frame"
        );
      }
      if (scope.graphFunctionRef !== input.pluginInput.graphFunctionId) {
        throw new TypeError(
          "FpEvaluationFinding.evaluationScopeRef.graphFunctionRef does not match current graph function"
        );
      }
      if (scope.vectorIndex !== input.pluginInput.vectorIndex) {
        throw new TypeError(
          "FpEvaluationFinding.evaluationScopeRef.vectorIndex does not match current vector"
        );
      }
      if (scope.compositionRef !== input.pluginInput.selectedCompositionRef) {
        throw new TypeError(
          "FpEvaluationFinding.evaluationScopeRef.compositionRef does not match selected abg.fn_composition"
        );
      }
      if (
        scope.compositionDigest !== input.pluginInput.selectedCompositionDigest
      ) {
        throw new TypeError(
          "FpEvaluationFinding.evaluationScopeRef.compositionDigest does not match selected abg.fn_composition"
        );
      }
    }
  }
}

function targetCarrierPayloadForFpEvaluation(input: {
  readonly basis: ExecutionBasis;
  readonly pluginInput: EnginePluginInput;
  readonly targetCarrierDefaults: GtlTargetCarrierDefaultsBundle;
}): {
  readonly payloadRef: string;
  readonly contractRef: string;
  readonly contractDigest: string;
  readonly digest: string;
} | null {
  const artifact = input.pluginInput.attachedResultArtifact;
  const invocationRef = input.pluginInput.actorInvocationRef;
  if (artifact === null || invocationRef === null) {
    return null;
  }
  const vector = input.basis.graph.vectors[input.pluginInput.vectorIndex];
  if (vector === undefined) {
    return null;
  }
  const targetCarrierContract = resolveTargetCarrierContractBinding({
    vector,
    defaults: input.targetCarrierDefaults
  });
  const targetPayloadDigest = stableSha256Digest({
    resultRef: invocationRef.resultRef,
    artifactPayload: artifact,
    targetCarrierContractRef: targetCarrierContract.contractRef,
    targetCarrierContractDigest: targetCarrierContract.configDigest
  });
  const digest = `digest:target_carrier:${targetPayloadDigest}`;
  return Object.freeze({
    payloadRef: `payload:target_carrier:${targetPayloadDigest}`,
    contractRef: targetCarrierContract.contractRef,
    contractDigest: targetCarrierContract.configDigest,
    digest
  });
}

function fpEvaluationCoreEvents(input: {
  readonly basis: ExecutionBasis;
  readonly pluginInput: EnginePluginInput;
  readonly outcome: FpEvaluationOutcome;
  readonly resultInterfaces: readonly AdmittedPluginResultInterfaceContract[];
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
  const contradictoryAuthority = input.outcome.findings.some(
    (finding) => finding.closeDisposition === "reprice"
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
    pluginInput: pluginInputIdentity(input.pluginInput)
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
      inputRefs: pluginInputLedgerRefs(input.pluginInput),
      authorityDigest,
      inputDigest,
      contradictoryAuthority,
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

  events.push(
    ...pluginResultEnvelopeEvents({
      basis: input.basis,
      pluginInput: input.pluginInput,
      envelope: admittedPluginResultEnvelopeForOutcome({
        pluginInput: input.pluginInput,
        resultInterfaces: input.resultInterfaces,
        stageRole: "evaluate",
        computeMeans: "F_P",
        outputCarrierRefs: Object.freeze(["FpEvaluationOutcome"]),
        evidenceRefs: uniqueStrings([
          ...input.outcome.evidenceRefs,
          ...input.outcome.findings.flatMap((finding) => finding.evidenceRefs)
        ]),
        outcomeKind: input.outcome.kind,
        outcomeStatus: input.outcome.status
      })
    })
  );

  return Object.freeze(events);
}

function fpEvaluationTargetPayloadRejectionEvents(input: {
  readonly basis: ExecutionBasis;
  readonly pluginInput: EnginePluginInput;
  readonly outcome: FpEvaluationOutcome;
  readonly targetCarrierDefaults: GtlTargetCarrierDefaultsBundle;
}): readonly RuntimeEvent[] {
  const targetCarrierPayload = targetCarrierPayloadForFpEvaluation({
    basis: input.basis,
    pluginInput: input.pluginInput,
    targetCarrierDefaults: input.targetCarrierDefaults
  });
  if (targetCarrierPayload === null) {
    return Object.freeze([]);
  }
  const policyRefs = Object.freeze([
    input.basis.resolvedPolicy.resolvedPolicyBundleRef
  ]);
  return Object.freeze(
    input.outcome.findings
      .filter((finding) => finding.closeDisposition !== "close")
      .map((finding) =>
        constructPayloadRejectedEvent({
          basis: input.basis,
          vectorIndex: input.pluginInput.vectorIndex,
          payloadRef: targetCarrierPayload.payloadRef,
          rejectionClass: "contradictory",
          contractRef: targetCarrierPayload.contractRef,
          contractDigest: targetCarrierPayload.contractDigest,
          digest: targetCarrierPayload.digest,
          reason:
            input.outcome.reason ??
            [
              `fp_evaluation_${finding.closeDisposition}`,
              finding.findingRef,
              ...finding.residualPressureRefs,
              ...finding.continuationRefs,
              ...finding.diagnosticRefs
            ].join(":"),
          policyRefs
        })
      )
  );
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
  const outputAuthority = deriveAdmittedOutputAuthorityProjection({
    ledger: payloadLedger
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
  const closureDecision: AssuranceClosureDecision =
    outputAuthority.status === "admitted"
      ? deriveAssuranceClosureDecision(assuranceProjection)
      : Object.freeze({
          kind: "assurance_closure_decision" as const,
          decision: "block",
          scope: assuranceProjection.scope,
          projectionRef: assuranceProjection.projectionRef,
          blockingStatuses: Object.freeze(["missing" as const]),
          rowIds: Object.freeze([]),
          reason:
            outputAuthority.reason ??
            "target carrier output payload is not admitted"
        });
  return Object.freeze({
    payloadLedger,
    outputAuthority,
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

function assuranceRetryProgressSignalRefs(input: {
  readonly fold: ReturnType<typeof assuranceDecisionForCurrentVector>;
}): readonly string[] {
  return Object.freeze([
    input.fold.closureDecision.reason,
    input.fold.assuranceProjection.projectionRef,
    input.fold.payloadLedger.projectionRef,
    ...input.fold.closureDecision.rowIds,
    ...input.fold.closureDecision.blockingStatuses
  ]);
}

function assuranceRetryEvents(input: {
  readonly basis: ExecutionBasis;
  readonly runtimeProjection: RuntimeAggregateProjection;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly vectorIndex: number;
  readonly priorManifestId: string;
  readonly assuranceFold: ReturnType<typeof assuranceDecisionForCurrentVector>;
  readonly maxAttempts: number;
  readonly executiveContinuationInput?:
    | ExecutiveContinuationInputProjection
    | null
    | undefined;
}): readonly RuntimeEvent[] | TerminalTransition {
  const transitionProjection = deriveRuntimeContinuationTransitionProjection({
    basis: input.basis,
    runtimeProjection: input.runtimeProjection,
    vectorIndex: input.vectorIndex,
    assuranceClosureDecision: input.assuranceFold.closureDecision,
    ...continuationTypedRefsFromExecutive(input.executiveContinuationInput)
  });
  if (transitionProjection.disposition !== "retry_same_edge") {
    const transition = terminalTransitionForRuntimeContinuationProjection({
      basis: input.basis,
      projection: transitionProjection
    });
    if (transition === null) {
      throw new TypeError(
        "Assurance continuation transition produced no terminal for non-retry disposition"
      );
    }
    return transition;
  }
  const retryContext = deriveFreshRetryContextProjection({
    basis: input.basis,
    runtimeProjection: input.runtimeProjection,
    events: input.replayEvents,
    vectorIndex: input.vectorIndex
  });
  if (retryContext.status !== "fresh") {
    throw new TypeError(
      `Assurance retry rejects ${retryContext.status}: ${retryContext.reason ?? "retry context is not fresh"}`
    );
  }
  const retryDecision = deriveRetryRepairDecision({
    basis: input.basis,
    projection: input.runtimeProjection,
    failedVectorIndex: input.vectorIndex,
    priorManifestId: input.priorManifestId,
    candidateManifestId: candidateAssuranceRetryManifestId({
      basis: input.basis,
      projection: input.runtimeProjection,
      vectorIndex: input.vectorIndex
    }),
    maxAttempts: input.maxAttempts,
    stationary: false,
    escalationSubjectRef: input.basis.resolvedPolicy.approvalSubjectRef,
    continuationRepair: assuranceRetryContinuationRepair({
      basis: input.basis,
      projection: input.runtimeProjection,
      vectorIndex: input.vectorIndex
    })
  });
  const retryEvents = runtimeEventsForRetryRepairDecision(retryDecision);
  switch (retryDecision.kind) {
    case "retry_planned":
      return Object.freeze([
        ...retryEvents,
        constructRetryProgressRecordedEvent({
          decision: retryDecision,
          progressSignalRefs: assuranceRetryProgressSignalRefs({
            fold: input.assuranceFold
          }),
          stationary: false
        })
      ]);
    case "retry_escalated":
      return terminalTransition(input.basis, "yielded", retryDecision.gateReason);
    case "retry_stopped":
      return terminalTransition(input.basis, "gap_stop", retryDecision.reason);
    default: {
      const exhaustive: never = retryDecision;
      throw new TypeError(
        `Unsupported assurance retry decision ${JSON.stringify(exhaustive)}`
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
  readonly requirementRouteReplayFacts: readonly RouteReplayFact[];
}

function appendEngineRunnerEvents(input: {
  readonly state: EngineEventEmissionState;
  readonly events: RuntimeEvent | readonly RuntimeEvent[];
  readonly sink: RuntimeEventSink;
}): EngineEventEmissionState {
  const emitted = emit(input.events, input.sink);
  return Object.freeze({
    emittedEvents: Object.freeze([...input.state.emittedEvents, ...emitted]),
    replayEvents: Object.freeze([...input.state.replayEvents, ...emitted]),
    requirementRouteReplayFacts: input.state.requirementRouteReplayFacts
  });
}

function appendAlreadyEmittedEngineRunnerEvents(input: {
  readonly state: EngineEventEmissionState;
  readonly events: readonly RuntimeEvent[];
}): EngineEventEmissionState {
  return Object.freeze({
    emittedEvents: Object.freeze([...input.state.emittedEvents, ...input.events]),
    replayEvents: Object.freeze([...input.state.replayEvents, ...input.events]),
    requirementRouteReplayFacts: input.state.requirementRouteReplayFacts
  });
}

function appendRequirementRouteEvents(input: {
  readonly state: EngineEventEmissionState;
  readonly runtimeEvents: readonly RuntimeEvent[];
  readonly replayFacts: readonly RouteReplayFact[];
  readonly sink: RuntimeEventSink;
}): EngineEventEmissionState {
  const emitted = emit(input.runtimeEvents, input.sink);
  return Object.freeze({
    emittedEvents: Object.freeze([...input.state.emittedEvents, ...emitted]),
    replayEvents: Object.freeze([...input.state.replayEvents, ...emitted]),
    requirementRouteReplayFacts: input.replayFacts
  });
}

function requirementRouteEdgeRef(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly runtimeEvents?: readonly RuntimeEvent[] | undefined;
}): RequirementEdgeRef {
  const vector = input.basis.graph.vectors[input.vectorIndex];
  if (vector === undefined) {
    throw new TypeError(`Requirement route vector ${input.vectorIndex} is outside graph range`);
  }
  const edge = vectorEdge(input.basis, input.vectorIndex);
  const scopedRuntimeEvents = runtimeEventsForBasis(
    input.basis,
    input.runtimeEvents ?? Object.freeze([])
  );
  const frameRefs = uniqueStrings([
    frameIdForBasis(input.basis),
    ...scopedRuntimeEvents
      .filter((event) => event.kind === "frame_opened")
      .map((event) => event.frameId)
  ]);
  const zoomRefs = uniqueStrings(
    scopedRuntimeEvents.flatMap((event) =>
      (event.kind === "zoom_frame_opened" ||
        event.kind === "zoom_foldback_evaluated") &&
      event.vectorIndex === input.vectorIndex
        ? [event.zoomFrameId]
        : []
    )
  );
  const foldbackRefs = uniqueStrings(
    scopedRuntimeEvents.flatMap((event) => {
      if (
        event.kind === "zoom_foldback_evaluated" &&
        event.vectorIndex === input.vectorIndex
      ) {
        return [event.foldbackRef];
      }
      if (
        event.kind === "graph_span_foldback_evaluated" &&
        event.terminalVectorIndex >= input.vectorIndex
      ) {
        return [
          event.foldbackRef,
          ...event.edgeFoldbackRefs,
          ...event.causingEdgeFoldbackRefs
        ];
      }
      return [];
    })
  );
  return Object.freeze({
    graphFunctionRef: input.basis.graphFunction.id,
    graphVectorRef: vector.id,
    vectorIndex: input.vectorIndex,
    edge,
    sourceNodeRef: vector.source[0]?.id,
    targetNodeRef: vector.target.id,
    frameRefs,
    ...(zoomRefs.length === 0 ? {} : { zoomRefs }),
    ...(foldbackRefs.length === 0 ? {} : { foldbackRefs }),
    aliasRefs: Object.freeze([edge])
  });
}

function requirementRouteScopeRef(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
}): ReturnType<typeof mintRuntimeScopeRef> {
  const vector = input.basis.graph.vectors[input.vectorIndex];
  if (vector === undefined) {
    throw new TypeError(`Requirement route scope vector ${input.vectorIndex} is outside graph range`);
  }
  return mintRuntimeScopeRef({
    runRef: input.basis.id,
    graphCallRef: graphCallIdForBasis(input.basis),
    frameRef: frameIdForBasis(input.basis),
    continuationRef: null,
    graphFunctionRef: input.basis.graphFunction.id,
    graphVectorRef: vector.id,
    spanRef: vector.id
  });
}

function requirementRouteContextForRequest(
  request: EngineIterateRequest
): RequirementRouteRuntimeContext | undefined {
  if (request.requirementRouteDeclarationBundle === undefined) {
    return undefined;
  }
  if (request.basis.graph.vectors.length === 0) {
    return undefined;
  }
  const edges: RequirementEdgeRef[] = [];
  for (const [vectorIndex] of request.basis.graph.vectors.entries()) {
    edges.push(
      requirementRouteEdgeRef({
        basis: request.basis,
        vectorIndex,
        runtimeEvents: request.runtimeEvents
      })
    );
  }
  const context = buildRequirementRouteRuntimeContextFromDeclarations({
    bundle: request.requirementRouteDeclarationBundle,
    runtimeScope: requirementRouteScopeRef({
      basis: request.basis,
      vectorIndex: 0
    }),
    edges
  });
  if (context.status === "rejected") {
    throw new TypeError(
      `Requirement route declaration admission rejected: ${context.reason}: ${context.diagnostics.join("; ")}`
    );
  }
  return context.value;
}

function executiveObserverRuntimeEventsForProjection(input: {
  readonly request: EngineIterateRequest;
  readonly vectorIndex: number;
  readonly projection: ReturnType<typeof runExecutiveObserverProjection> | null;
}): readonly RuntimeEvent[] {
  if (input.projection === null) {
    return Object.freeze([]);
  }
  const projection = input.projection;
  return Object.freeze(
    projection.pressureFacts.map((pressureFact) =>
      constructExecutivePressureFactProjectedEvent({
        basis: input.request.basis,
        vectorIndex: input.vectorIndex,
        observation: projection.observation,
        pressureFact,
        sourceEventRefs: projection.observation.replayEventRefs,
        sourceProjectionRefs: projection.observation.payloadLedgerRefs,
        causationEventRefs: projection.observation.replayEventRefs
      })
    )
  );
}

function runtimeEventProjectionRef(event: RuntimeEvent): string {
  const eventRef = "eventRef" in event ? event.eventRef : undefined;
  const routeEventRef = "routeEventRef" in event ? event.routeEventRef : undefined;
  const correlationId = "correlationId" in event ? event.correlationId : undefined;
  return (
    eventRef ??
    routeEventRef ??
    correlationId ??
    `runtime-event:${stableSha256Digest(event)}`
  );
}

function defaultExecutiveObserverObservation(input: {
  readonly request: EngineIterateRequest;
  readonly fpEvaluationOutcome: FpEvaluationOutcome;
  readonly vectorIndex: number;
  readonly replayEvents: readonly RuntimeEvent[];
}): ProjectExecutiveObservationViewInput | null {
  if (
    input.fpEvaluationOutcome.status !== "evaluated" ||
    input.fpEvaluationOutcome.findings.length === 0
  ) {
    return null;
  }
  const vector = input.request.basis.graph.vectors[input.vectorIndex];
  if (vector === undefined) {
    return null;
  }
  const firstFinding = input.fpEvaluationOutcome.findings[0];
  if (firstFinding === undefined) {
    return null;
  }
  const runtimeProjection = deriveRuntimeAggregateProjection(
    input.request.basis,
    input.replayEvents
  );
  return Object.freeze({
    observerGraphFunctionRef: "graph-function://abg/executive/default-observer",
    targetWorkspaceContextRef: [
      "context://abg/executive/default",
      encodeURIComponent(input.request.basis.id)
    ].join("/"),
    targetWorkspaceLocator: `workspace://${encodeURIComponent(input.request.basis.workspaceRoot)}`,
    targetWorkspaceDigest: `sha256:${stableSha256Digest({
      basisId: input.request.basis.id,
      workspaceRoot: input.request.basis.workspaceRoot,
      workKey: input.request.basis.workKey
    })}`,
    targetWorkRef:
      input.request.basis.workKey ??
      input.request.basis.startIntent.target.handle ??
      vectorEdge(input.request.basis, input.vectorIndex) ??
      input.request.basis.graphFunction.id,
    selectedCompositionRef: firstFinding.compositionRef,
    selectedCompositionDigest: firstFinding.compositionDigest,
    graphFunctionRef: input.request.basis.graphFunction.id,
    graphVectorRef: vector.id,
    frameRefs: [frameIdForBasis(input.request.basis)],
    replayEventRefs: uniqueStrings(input.replayEvents.map(runtimeEventProjectionRef)),
    payloadLedgerRefs: [sourceProjectionRef(runtimeProjection)],
    evidenceRefs: uniqueStrings(
      input.fpEvaluationOutcome.findings.flatMap((finding) => finding.evidenceRefs)
    ),
    residualPressureRefs: uniqueStrings(
      input.fpEvaluationOutcome.findings.flatMap(
        (finding) => finding.residualPressureRefs
      )
    ),
    continuationRefs: uniqueStrings(
      input.fpEvaluationOutcome.findings.flatMap(
        (finding) => finding.continuationRefs
      )
    ),
    requirementIds: uniqueStrings(
      input.fpEvaluationOutcome.findings.flatMap((finding) =>
        finding.authorityRefs.filter((ref) => ref.startsWith("REQ-"))
      )
    ),
    spanLineage: [],
    policyRefs: ["policy://abg/executive/default-observer"],
    hookRefs: ["hook://abg/fp-consciousness/default"]
  });
}

function executiveObserverProjectionForFpEvaluation(input: {
  readonly request: EngineIterateRequest;
  readonly fpEvaluationOutcome: FpEvaluationOutcome;
  readonly vectorIndex: number;
  readonly replayEvents: readonly RuntimeEvent[];
}): ReturnType<typeof runExecutiveObserverProjection> | null {
  const executiveObserver = input.request.executiveObserver;
  const observation =
    executiveObserver?.observation ??
    defaultExecutiveObserverObservation(input);
  if (observation === null) {
    return null;
  }
  return runExecutiveObserverProjection({
    observation,
    fpEvaluationOutcome: input.fpEvaluationOutcome,
    priorResidualPressureRefs: executiveObserver?.priorResidualPressureRefs
  });
}

function continuationTypedRefsFromExecutive(
  input: ExecutiveContinuationInputProjection | null | undefined
): {
  readonly typedBlockRefs?: readonly string[] | undefined;
  readonly typedRepriceRefs?: readonly string[] | undefined;
  readonly typedYieldRefs?: readonly string[] | undefined;
  readonly typedRetryRefs?: readonly string[] | undefined;
} {
  if (input === null || input === undefined) {
    return {};
  }
  switch (input.decision) {
    case "yield_reentry":
      return { typedYieldRefs: input.reentryRefs };
    case "reprice":
      return { typedRepriceRefs: input.repriceRefs };
    case "block":
      return { typedBlockRefs: input.blockedRefs };
    case "retry_or_repair":
      return { typedRetryRefs: input.continuationRefs };
    case "close_candidate":
      return {};
    default: {
      const exhaustive: never = input.decision;
      throw new TypeError(
        `Unsupported executive continuation decision ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

function runtimeContinuationTransitionFromExecutive(input: {
  readonly basis: ExecutionBasis;
  readonly runtimeProjection: RuntimeAggregateProjection;
  readonly vectorIndex: number;
  readonly executiveContinuationInput:
    | ExecutiveContinuationInputProjection
    | null
    | undefined;
}): RuntimeContinuationTransitionProjection | null {
  const executiveInput = input.executiveContinuationInput;
  if (executiveInput === null || executiveInput === undefined) {
    return null;
  }
  switch (executiveInput.decision) {
    case "yield_reentry":
      return deriveRuntimeContinuationTransitionProjectionFromDisposition({
        basis: input.basis,
        runtimeProjection: input.runtimeProjection,
        vectorIndex: input.vectorIndex,
        disposition: "yield_continuation",
        reason: "typed_yield",
        reasonRefs: executiveInput.reentryRefs,
        evidenceRefs: executiveInput.pressureFactRefs,
        sourceProjectionRefs: [executiveInput.continuationInputRef]
      });
    case "reprice":
      return deriveRuntimeContinuationTransitionProjectionFromDisposition({
        basis: input.basis,
        runtimeProjection: input.runtimeProjection,
        vectorIndex: input.vectorIndex,
        disposition: "reprice",
        reason: "typed_reprice",
        reasonRefs: executiveInput.repriceRefs,
        evidenceRefs: executiveInput.pressureFactRefs,
        sourceProjectionRefs: [executiveInput.continuationInputRef]
      });
    case "block":
      return deriveRuntimeContinuationTransitionProjectionFromDisposition({
        basis: input.basis,
        runtimeProjection: input.runtimeProjection,
        vectorIndex: input.vectorIndex,
        disposition: "block",
        reason: "typed_block",
        reasonRefs: executiveInput.blockedRefs,
        evidenceRefs: executiveInput.pressureFactRefs,
        sourceProjectionRefs: [executiveInput.continuationInputRef]
      });
    case "retry_or_repair":
    case "close_candidate":
      return null;
    default: {
      const exhaustive: never = executiveInput.decision;
      throw new TypeError(
        `Unsupported executive continuation decision ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

function runtimeContinuationTransitionFromFpEvaluation(input: {
  readonly basis: ExecutionBasis;
  readonly runtimeProjection: RuntimeAggregateProjection;
  readonly vectorIndex: number;
  readonly fpEvaluationOutcome: FpEvaluationOutcome;
}): RuntimeContinuationTransitionProjection | null {
  const continuationRefs = fpEvaluationContinuationRefs(input.fpEvaluationOutcome);
  if (continuationRefs.length === 0) {
    return null;
  }
  const activeFindings = input.fpEvaluationOutcome.findings.filter(
    (finding) =>
      (finding.closeDisposition === "retry" ||
        finding.closeDisposition === "no_close") &&
      finding.continuationRefs.length > 0
  );
  if (activeFindings.length === 0) {
    return null;
  }
  return deriveRuntimeContinuationTransitionProjectionFromDisposition({
    basis: input.basis,
    runtimeProjection: input.runtimeProjection,
    vectorIndex: input.vectorIndex,
    disposition: "retry_same_edge",
    reason: "typed_retry",
    reasonRefs: continuationRefs,
    evidenceRefs: uniqueStrings(
      activeFindings.flatMap((finding) => finding.evidenceRefs)
    ),
    sourceProjectionRefs: uniqueStrings(
      activeFindings.map((finding) => finding.findingRef)
    )
  });
}

function isEvidenceAdmittedRuntimeEvent(
  event: RuntimeEvent
): event is EvidenceAdmittedRuntimeEvent {
  return event.kind === "evidence_admitted";
}

function emitRequirementRouteForEdgeClose(input: {
  readonly state: EngineEventEmissionState;
  readonly request: EngineIterateRequest;
  readonly context: RequirementRouteRuntimeContext | undefined;
  readonly vectorIndex: number;
  readonly closureDecision: AssuranceClosureDecision;
  readonly continuationTransitions?:
    | readonly RuntimeContinuationTransitionProjection[]
    | undefined;
}): EngineEventEmissionState {
  if (input.context === undefined) {
    return input.state;
  }
  const reentryFrontier = deriveGraphReentryFrontierProjection({
    basis: input.request.basis,
    events: input.state.replayEvents
  });
  const route = emitRequirementRouteFactsForEdgeClose({
    runtimeScope: requirementRouteScopeRef({
      basis: input.request.basis,
      vectorIndex: input.vectorIndex
    }),
    context: Object.freeze({
      ledger: input.context.ledger,
      replayFacts: input.state.requirementRouteReplayFacts,
      requirementProjectionRefsByVectorIndex:
        input.context.requirementProjectionRefsByVectorIndex
    }),
    edge: requirementRouteEdgeRef({
      basis: input.request.basis,
      vectorIndex: input.vectorIndex,
      runtimeEvents: input.state.replayEvents
    }),
    runtimeEvents: input.state.replayEvents.filter(isEvidenceAdmittedRuntimeEvent),
    closureDecision: input.closureDecision,
    continuationTransitions: input.continuationTransitions ?? Object.freeze([]),
    reentryPoints: reentryFrontier.activeReEntryPoint === null
      ? Object.freeze([])
      : Object.freeze([reentryFrontier.activeReEntryPoint]),
    policyRefs: Object.freeze([
      input.request.basis.resolvedPolicy.resolvedPolicyBundleRef
    ])
  });
  if (route.status === "rejected") {
    if (route.reason === "not_ready") {
      return input.state;
    }
    throw new TypeError(
      `Requirement route edge-close emission rejected: ${route.reason}: ${route.diagnostics.join("; ")}`
    );
  }
  return appendRequirementRouteEvents({
    state: input.state,
    runtimeEvents: route.value.emittedRuntimeEvents,
    replayFacts: route.value.replayFacts,
    sink: input.request.eventSink
  });
}

function canonicalReplayEvents(
  events: readonly RuntimeEvent[]
): readonly RuntimeEvent[] {
  assertCanonicalRuntimeEventSequence(
    events,
    "EngineIterateRequest.runtimeEvents"
  );
  return Object.freeze([...events]);
}

interface ParsedConsequenceReentryTarget {
  readonly graphReentryPoint: GraphReentryPoint;
  readonly targetVectorIndex: number;
}

interface ConsequenceTraversalConstructionWorld {
  readonly episodeId: string;
  readonly observation: ReturnType<typeof constructConstructionObservationSnapshot>;
  readonly actionCatalog: ReturnType<typeof constructConstructionActionCatalogProjection>;
  readonly priorityProjection: ReturnType<typeof deriveConstructionPriorityProjection>;
  readonly admission: ReturnType<typeof admitConstructionIntentCandidate>;
  readonly constructionEvents: readonly RuntimeEvent[];
}

type ConsequenceTraversalConstructionBuildResult =
  | {
      readonly status: "ready";
      readonly world: ConsequenceTraversalConstructionWorld;
    }
  | {
      readonly status: "blocked";
      readonly reason: string;
    };

function consequenceTraversalBlockedResult(input: {
  readonly request: EngineIterateRequest;
  readonly eventState: EngineEventEmissionState;
  readonly reason: string;
  readonly iterationCount: number;
}): {
  readonly eventState: EngineEventEmissionState;
  readonly result: EngineIterateResult;
} {
  const blocked = terminalTransition(input.request.basis, "gap_stop", input.reason);
  const eventState = appendEngineRunnerEvents({
    state: input.eventState,
    events: constructTerminalReachedEvent(blocked),
    sink: input.request.eventSink
  });
  return Object.freeze({
    eventState,
    result: constructResult({
      basis: input.request.basis,
      transition: blocked,
      projection: deriveRuntimeAggregateProjection(
        input.request.basis,
        eventState.replayEvents
      ),
      emittedEvents: eventState.emittedEvents,
      replayEvents: eventState.replayEvents,
      iterationCount: input.iterationCount
    })
  });
}

function graphReentryPointFromString(input: string): GraphReentryPoint | null {
  return GRAPH_REENTRY_POINT_VALUES.find((value) => value === input) ?? null;
}

function parseConsequenceReentryTarget(input: {
  readonly basis: ExecutionBasis;
  readonly action: ConsequenceTraversalAction;
}): ParsedConsequenceReentryTarget | null {
  if (input.action.reentryTargetRef === null) {
    return null;
  }
  const match = /^graph-reentry-point:\/\/([^/]+)\/([0-9]+)$/u.exec(
    input.action.reentryTargetRef
  );
  if (match === null) {
    return null;
  }
  const graphReentryPoint = graphReentryPointFromString(match[1] ?? "");
  if (graphReentryPoint === null) {
    return null;
  }
  const targetVectorIndex = Number(match[2]);
  if (!Number.isSafeInteger(targetVectorIndex) || targetVectorIndex < 0) {
    return null;
  }
  if (input.basis.graph.vectors[targetVectorIndex] === undefined) {
    return null;
  }
  return Object.freeze({ graphReentryPoint, targetVectorIndex });
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

function runtimeRegistrySelectionBasisRef(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
}): string {
  return [
    "runtime-registry-selection",
    input.basis.id,
    String(input.vectorIndex)
  ].join(":");
}

function registryEntryForExecutionBasis(input: {
  readonly entries: readonly RuntimeRegistryEntryProjection[];
  readonly basis: ExecutionBasis;
}): RuntimeRegistryEntryProjection | null {
  return (
    input.entries.find(
      (entry) =>
        entry.entryKind === "graph_function" &&
        selectedGraphFunctionRefMatchesBasis({
          selectedGraphFunctionRef: entry.graphFunctionRef,
          basis: input.basis
        })
    ) ?? null
  );
}

function graphVectorDeclarationScalar(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly key: string;
}): string | null {
  const entry = input.basis.graph.vectors[input.vectorIndex]?.declarations.entries.find(
    (candidate) => candidate.key === input.key
  );
  if (entry === undefined || entry.value.kind !== "scalar") {
    return null;
  }
  return typeof entry.value.value === "string" ? entry.value.value : null;
}

function graphVectorDeclarationStringList(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly key: string;
}): readonly string[] | null {
  const entry = input.basis.graph.vectors[input.vectorIndex]?.declarations.entries.find(
    (candidate) => candidate.key === input.key
  );
  if (entry === undefined || entry.value.kind !== "string_list") {
    return null;
  }
  return Object.freeze([...entry.value.value]);
}

function runtimeRegistryLookupBoundary(input: {
  readonly basis: ExecutionBasis;
  readonly transition: Exclude<AdvancementTransition, { readonly kind: "terminal" }>;
}): Omit<Parameters<typeof constructRegistryLookupRequest>[0], "lookupRef" | "entryKinds"> {
  const vectorIndex = input.transition.vectorIndex;
  const scalar = (key: string): string | null =>
    graphVectorDeclarationScalar({
      basis: input.basis,
      vectorIndex,
      key
    });
  const stringList = (key: string): readonly string[] =>
    graphVectorDeclarationStringList({
      basis: input.basis,
      vectorIndex,
      key
    }) ?? Object.freeze([]);
  return Object.freeze({
    candidateIdentityRefs: stringList("runtime_registry_candidate_refs"),
    interfaceRef: scalar("runtime_registry_interface_ref"),
    sourceContractRef: scalar("runtime_registry_source_contract_ref"),
    targetContractRef: scalar("runtime_registry_target_contract_ref"),
    contextRefs: stringList("runtime_registry_context_refs"),
    authorityRefs: stringList("runtime_registry_authority_refs"),
    overlayRefs: stringList("runtime_registry_overlay_refs"),
    namespaceRefs: stringList("runtime_registry_namespace_refs"),
    acceptedVersions: stringList("runtime_registry_accepted_versions"),
    provenanceRefs: stringList("runtime_registry_provenance_refs"),
    readinessRefs: stringList("runtime_registry_readiness_refs"),
    proofRefs: stringList("runtime_registry_proof_refs"),
    policyRefs: stringList("runtime_registry_policy_refs")
  });
}

function runtimeRegistrySelectionForTransition(input: {
  readonly basis: ExecutionBasis;
  readonly transition: AdvancementTransition;
  readonly replayEvents: readonly RuntimeEvent[];
}): GraphFunctionSelectionEvent {
  if (input.transition.kind === "terminal") {
    throw new TypeError("Runtime registry selection requires a traversal transition");
  }
  const projection = projectRuntimeGraphFunctionRegistry(input.replayEvents);
  const selectedEntry = registryEntryForExecutionBasis({
    entries: projection.entries,
    basis: input.basis
  });
  if (selectedEntry === null) {
    throw new TypeError(
      `Runtime registry startup requires a registered graph_function entry for ${input.basis.graphFunction.id}`
    );
  }

  const runtimeBasisRef = runtimeRegistrySelectionBasisRef({
    basis: input.basis,
    vectorIndex: input.transition.vectorIndex
  });
  const lookupBoundary = runtimeRegistryLookupBoundary({
    basis: input.basis,
    transition: input.transition
  });
  const digest = stableSha256Digest({
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    vectorIndex: input.transition.vectorIndex,
    edge: input.transition.edge,
    selectedEntryRef: selectedEntry.entryRef,
    lookupBoundary,
    registryProjectionRef: projection.projectionRef
  });
  const lookupRequest = constructRegistryLookupRequest({
    lookupRef: `registry-lookup:runner:${digest}`,
    entryKinds: ["graph_function"],
    ...lookupBoundary
  });
  const lookupResult = lookupRuntimeGraphFunctionRegistry({
    projection,
    request: lookupRequest
  });
  const selection = selectGraphFunctionFromRegistry({
    lookupResult,
    projection,
    selectionRef: `graph-function-selection:runner:${digest}`,
    runtimeBasisRef,
    rationaleRef: "rationale://abg/runtime-registry/current-basis",
    abgSelectedCandidateRef: selectedEntry.entryRef,
    causationEventRefs: projection.sourceEventRefs,
    correlationId: `correlation://runtime-registry-selection/${digest}`
  });
  if (selection.kind === "graph_function_selected") {
    assertGraphFunctionInvocationSelected({
      events: [...input.replayEvents, selection],
      runtimeBasisRef,
      graphFunctionRef: selectedEntry.graphFunctionRef,
      selectionRef: selection.selectionRef
    });
  }
  return selection;
}

function consequenceConstructionEventScope(input: {
  readonly basis: ExecutionBasis;
  readonly episodeId: string;
  readonly eventRef: string;
  readonly eventSequence: number;
  readonly basisProjectionRef: string;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}): {
  readonly constructionEventRef: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly episodeId: string;
  readonly iterationOrdinal: number;
  readonly eventSequence: number;
  readonly basisProjectionRef: string;
  readonly priorIntentId: null;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
} {
  return Object.freeze({
    constructionEventRef: input.eventRef,
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    episodeId: input.episodeId,
    iterationOrdinal: 0,
    eventSequence: input.eventSequence,
    basisProjectionRef: input.basisProjectionRef,
    priorIntentId: null,
    causationEventRefs: input.causationEventRefs,
    correlationId: input.correlationId
  });
}

function consequenceConstructionPreludeEvents(input: {
  readonly basis: ExecutionBasis;
  readonly action: ConsequenceTraversalAction;
  readonly observation: ReturnType<typeof constructConstructionObservationSnapshot>;
  readonly actionCatalog: ReturnType<typeof constructConstructionActionCatalogProjection>;
  readonly admission: ReturnType<typeof admitConstructionIntentCandidate>;
  readonly candidateId: string;
  readonly evaluatorOutcomeRef: string;
  readonly priorityPolicyRef: string;
  readonly digest: string;
}): readonly RuntimeEvent[] {
  const admittedIntent = input.admission.admittedIntent;
  if (admittedIntent === null) {
    throw new TypeError("Consequence traversal construction prelude requires admitted intent");
  }
  const prefix = `construction-event:consequence:${input.digest}`;
  const basisProjectionRef = input.observation.basisProjectionRef;
  const causationEventRefs = Object.freeze([
    input.action.consequenceRef,
    input.action.actionRef
  ]);
  const correlationId = input.observation.correlationId;
  const scope = (eventSequence: number, suffix: string) =>
    consequenceConstructionEventScope({
      basis: input.basis,
      episodeId: input.observation.episodeId,
      eventRef: `${prefix}:${suffix}`,
      eventSequence,
      basisProjectionRef,
      causationEventRefs,
      correlationId
    });

  return Object.freeze([
    Object.freeze({
      ...scope(0, "episode-started"),
      kind: "construction_episode_started",
      startProjectionRef: input.observation.currentProjectionRef
    }),
    Object.freeze({
      ...scope(1, "observation-materialized"),
      kind: "construction_observation_snapshot_materialized",
      observationId: input.observation.observationId,
      currentProjectionRef: input.observation.currentProjectionRef,
      observedStateRefs: input.observation.observedStateRefs,
      linkedAssetRefs: input.observation.linkedAssetRefs,
      authorityDigest: input.observation.authorityDigest
    }),
    Object.freeze({
      ...scope(2, "action-catalog-projected"),
      kind: "construction_action_catalog_projected",
      catalogRef: input.actionCatalog.catalogRef,
      hookResolutionRef: input.actionCatalog.hookResolutionRef,
      fallbackConfigDigest: input.actionCatalog.fallbackConfigDigest,
      traversalPublicationRefs: uniqueStrings(
        input.actionCatalog.rows.flatMap((row) => [
          row.graphFunctionRef,
          row.graphVectorRef,
          row.refinementBoundaryRef,
          row.candidateFamilyRef,
          row.publishedTraversalTargetRef,
          ...row.hookSourceRefs
        ].filter((ref): ref is string => ref !== null))
      )
    }),
    Object.freeze({
      ...scope(3, "evaluator-invoked"),
      kind: "construction_evaluator_invoked",
      observationId: input.observation.observationId,
      catalogRef: input.actionCatalog.catalogRef,
      evaluatorPluginRef: "consequence_projection",
      inputDigest: `consequence-construction-input:${input.digest}`
    }),
    Object.freeze({
      ...scope(4, "candidate-returned"),
      kind: "construction_intent_candidate_returned",
      evaluatorPluginRef: "consequence_projection",
      evaluatorOutcomeRef: input.evaluatorOutcomeRef,
      candidateSetDigest: `consequence-construction-candidates:${input.digest}`,
      candidateRefs: [input.candidateId]
    }),
    Object.freeze({
      ...scope(5, "candidate-admitted"),
      kind: "construction_intent_candidate_admitted",
      candidateId: input.candidateId,
      admissionRef: input.admission.admissionRef,
      intentId: admittedIntent.intentId,
      authorityRefs: admittedIntent.authorityRefs
    }),
    Object.freeze({
      ...scope(6, "intent-selected"),
      kind: "construction_intent_selected",
      intentId: admittedIntent.intentId,
      selectedActionRef: admittedIntent.selectedActionRef,
      selectedBindingRef: admittedIntent.selectedBindingRef,
      selectionPolicyRef: input.priorityPolicyRef
    })
  ] satisfies readonly RuntimeEvent[]);
}

function buildConsequenceTraversalConstructionWorld(input: {
  readonly request: EngineIterateRequest;
  readonly runtimeProjection: RuntimeAggregateProjection;
  readonly action: ConsequenceTraversalAction;
  readonly allowedTraversalCatalog: AllowedConsequenceTraversalCatalog;
  readonly outcome: ConsequenceProjectionOutcome;
  readonly vectorIndex: number;
  readonly replayEventCount: number;
}): ConsequenceTraversalConstructionBuildResult {
  try {
    admitConsequenceTraversalActionForAllowedCatalog({
      catalog: input.allowedTraversalCatalog,
      action: input.action
    });
  } catch (error) {
    return Object.freeze({
      status: "blocked",
      reason:
        error instanceof Error
          ? error.message
          : "consequence traversal action was not admitted by the allowed traversal catalog"
    });
  }
  if (input.action.actionKind === "non_admit") {
    return Object.freeze({
      status: "blocked",
      reason: `consequence traversal action ${input.action.actionRef} was not admitted for execution`
    });
  }
  if (
    !selectedGraphFunctionRefMatchesBasis({
      selectedGraphFunctionRef: input.action.selectedGraphFunctionRef,
      basis: input.request.basis
    })
  ) {
    return Object.freeze({
      status: "blocked",
      reason: "consequence traversal action targets a graph function outside the current engine basis"
    });
  }
  if (input.action.expectedOutputAssetRefs.length === 0) {
    return Object.freeze({
      status: "blocked",
      reason: "consequence traversal action execution requires expected output asset refs"
    });
  }
  const reentryTarget = parseConsequenceReentryTarget({
    basis: input.request.basis,
    action: input.action
  });
  const reentryGraphVectorRef =
    input.action.actionKind === "reenter_graph_span"
      ? input.action.graphVectorRef
      : null;
  if (
    input.action.actionKind === "reenter_graph_span" &&
    (reentryTarget === null || reentryGraphVectorRef === null)
  ) {
    return Object.freeze({
      status: "blocked",
      reason: "consequence traversal action has no admitted graph reentry target"
    });
  }

  const digest = fpEvaluationDigest({
    basisId: input.request.basis.id,
    graphFunctionId: input.request.basis.graphFunction.id,
    vectorIndex: input.vectorIndex,
    replayEventCount: input.replayEventCount,
    actionRef: input.action.actionRef,
    consequenceRef: input.action.consequenceRef,
    strategyDecisionRef: input.action.strategyDecisionRef
  });
  const episodeId = `construction-episode:consequence:${digest}`;
  const runtimeProjectionRef = sourceProjectionRef(input.runtimeProjection);
  const action = constructConstructionActionRowFromConsequenceTraversalAction(
    input.action
  );
  const actionCatalog = constructConstructionActionCatalogProjection({
    catalogRef: `construction-catalog:consequence:${digest}`,
    episodeId,
    hookResolutionRef: `construction-hook-resolution:consequence:${digest}`,
    fallbackConfigDigest: `construction-hook-digest:${fpEvaluationDigest({
      actionRef: input.action.actionRef,
      evidencePolicyRef: input.action.evidencePolicyRef,
      foldbackPolicyRef: input.action.foldbackPolicyRef,
      hookSourceRefs: action.hookSourceRefs
    })}`,
    rows: [action]
  });
  const pressure = constructObservationPressureRow({
    pressureRef: `pressure:consequence-traversal:${digest}`,
    pressureKind:
      input.action.actionKind === "reenter_graph_span"
        ? "reentry_frontier"
        : "gap_row",
    sourceRef: input.outcome.consequenceRef ?? input.action.consequenceRef,
    affectedAssetRefs: input.action.expectedOutputAssetRefs,
    targetOutcomeRefs: [input.action.targetOutcomeRef],
    evidenceRefs: input.outcome.evidenceRefs,
    severity: 5,
    ambiguityClass: "none",
    authorityRefs: input.action.requiredAuthorityRefs
  });
  const triage =
    reentryTarget === null || reentryGraphVectorRef === null
      ? null
      : constructConstructionRepairSurfaceTriageRow({
          triageRef: `repair-surface-triage:consequence-traversal:${digest}`,
          pressureRef: pressure.pressureRef,
          repairSurfaceDisposition: "upstream_reentry",
          graphReentryPoint: reentryTarget.graphReentryPoint,
          repairGraphFunctionRef:
            input.action.selectedGraphFunctionRef ??
            input.request.basis.graphFunction.id,
          repairGraphVectorRef: reentryGraphVectorRef,
          reentryTargetVectorIndex: reentryTarget.targetVectorIndex,
          repairAssetRef: input.action.expectedOutputAssetRefs[0] ?? "",
          targetOutcomeRef: input.action.targetOutcomeRef,
          evidenceRefs: uniqueStrings([
            input.action.consequenceRef,
            input.action.strategyDecisionRef,
            ...input.action.proportionalityBasisRefs,
            ...input.outcome.evidenceRefs
          ]),
          authorityRefs: input.action.requiredAuthorityRefs
        });
  const observation = constructConstructionObservationSnapshot({
    episodeId,
    observationId: `construction-observation:consequence:${digest}`,
    basisRef: input.request.basis.id,
    currentProjectionRef: runtimeProjectionRef,
    iterationOrdinal: 0,
    basisProjectionRef: runtimeProjectionRef,
    priorIntentId: null,
    causationRef: input.action.consequenceRef,
    correlationId: `correlation:consequence-construction:${digest}`,
    observedStateRefs: uniqueStrings([
      runtimeProjectionRef,
      input.outcome.consequenceRef ?? input.action.consequenceRef,
      ...input.outcome.domainReadModelRefs
    ]),
    runtimeAggregateRefs: [runtimeProjectionRef],
    linkedAssetRefs: input.action.inputAssetRefs,
    gapProjectionRefs: uniqueStrings([
      input.action.consequenceRef,
      input.action.strategyDecisionRef,
      ...[input.action.graphSpanRef].filter((ref): ref is string => ref !== null)
    ]),
    foldbackRefs: uniqueStrings([
      input.action.foldbackPolicyRef,
      ...[input.action.graphSpanRef].filter((ref): ref is string => ref !== null)
    ]),
    reentryFrontierRefs:
      input.action.reentryTargetRef === null ? [] : [input.action.reentryTargetRef],
    actionCatalogRef: actionCatalog.catalogRef,
    authorityDigest: `authority:consequence-traversal:${fpEvaluationDigest({
      actionRef: input.action.actionRef,
      requiredAuthorityRefs: input.action.requiredAuthorityRefs
    })}`,
    pressureRows: [pressure],
    repairSurfaceTriageRows: triage === null ? [] : [triage]
  });
  const bindingProjection = deriveObservationToActionBindingProjection({
    observation,
    actionCatalog
  });
  const bindingRow = bindingProjection.rows.find(
    (row) =>
      row.actionRef === input.action.actionRef &&
      row.targetOutcomeRef === input.action.targetOutcomeRef
  );
  if (bindingRow === undefined) {
    return Object.freeze({
      status: "blocked",
      reason: `consequence traversal action ${input.action.actionRef} produced no lawful construction binding`
    });
  }
  const priorityScheme = constructConstructionPriorityScheme({
    schemeRef: `priority-scheme:consequence:${digest}`,
    sourcePolicyRef: input.action.evidencePolicyRef,
    rules: []
  });
  const priorityProjection = deriveConstructionPriorityProjection({
    observation,
    actionCatalog,
    bindingProjection,
    priorityScheme,
    affectPolicies: []
  });
  const priorityRow = priorityProjection.rows.find(
    (row) => row.bindingRef === bindingRow.bindingRef
  );
  if (priorityRow === undefined) {
    return Object.freeze({
      status: "blocked",
      reason: `consequence traversal action ${input.action.actionRef} produced no construction priority row`
    });
  }
  const candidateId = `candidate:consequence:${digest}`;
  const candidate = constructConstructionIntentCandidateFromConsequenceTraversalAction({
    action: input.action,
    episodeId,
    bindingRow,
    priorityRow,
    candidateId
  });
  const admission = admitConstructionIntentCandidate({
    candidate,
    observation,
    actionCatalog,
    bindingProjection,
    priorityProjection
  });
  if (admission.admittedIntent === null) {
    return Object.freeze({
      status: "blocked",
      reason: `consequence traversal action ${input.action.actionRef} rejected by construction intent admission: ${admission.rejectionReasonRefs.join(",")}`
    });
  }
  const constructionEvents = consequenceConstructionPreludeEvents({
    basis: input.request.basis,
    action: input.action,
    observation,
    actionCatalog,
    admission,
    candidateId,
    evaluatorOutcomeRef: input.outcome.consequenceRef ?? input.action.consequenceRef,
    priorityPolicyRef: priorityRow.sourcePolicyRef,
    digest
  });
  return Object.freeze({
    status: "ready",
    world: Object.freeze({
      episodeId,
      observation,
      actionCatalog,
      priorityProjection,
      admission,
      constructionEvents
    })
  });
}

function consumeConsequenceTraversalAction(input: {
  readonly request: EngineIterateRequest;
  readonly eventState: EngineEventEmissionState;
  readonly runtimeProjection: RuntimeAggregateProjection;
  readonly outcome: ConsequenceProjectionOutcome;
  readonly allowedTraversalCatalog: AllowedConsequenceTraversalCatalog;
  readonly vectorIndex: number;
  readonly iterationCount: number;
}): {
  readonly eventState: EngineEventEmissionState;
  readonly result: EngineIterateResult;
} | {
  readonly eventState: EngineEventEmissionState;
  readonly effect: {
    readonly kind: "construction_intent_step";
    readonly request: ConstructionIntentRunnerRequest;
  };
  readonly iterationCount: number;
} | null {
  if (input.outcome.traversalAction === null) {
    return null;
  }
  const action = input.outcome.traversalAction;
  const build = buildConsequenceTraversalConstructionWorld({
    request: input.request,
    runtimeProjection: input.runtimeProjection,
    action,
    allowedTraversalCatalog: input.allowedTraversalCatalog,
    outcome: input.outcome,
    vectorIndex: input.vectorIndex,
    replayEventCount: input.eventState.replayEvents.length
  });
  if (build.status === "blocked") {
    return consequenceTraversalBlockedResult({
      request: input.request,
      eventState: input.eventState,
      reason: build.reason,
      iterationCount: input.iterationCount
    });
  }

  const preludeState = appendEngineRunnerEvents({
    state: input.eventState,
    events: build.world.constructionEvents,
    sink: input.request.eventSink
  });
  const admittedIntent = build.world.admission.admittedIntent;
  if (admittedIntent === null) {
    throw new TypeError("Consequence traversal construction world lost admitted intent");
  }
  return Object.freeze({
    eventState: preludeState,
    effect: Object.freeze({
      kind: "construction_intent_step" as const,
      request: Object.freeze({
        basis: input.request.basis,
        graphActionBasis: input.request.basis,
        observation: build.world.observation,
        admittedIntent,
        admissions: [build.world.admission],
        priorityProjection: build.world.priorityProjection,
        actionCatalog: build.world.actionCatalog,
        constructionEvents: build.world.constructionEvents,
        graphRuntimeEvents: input.eventState.replayEvents,
        eventSink: input.request.eventSink,
        graphRunnerPlugins: input.request.plugins,
        graphRuntimeRegistryStartup: input.request.runtimeRegistryStartup,
        graphInstructionAssemblyStartup: input.request.instructionAssemblyStartup,
        maxAttachedFpAttempts: input.request.maxAttachedFpAttempts,
        graphAssuranceProvider: input.request.assuranceProvider,
        graphTargetCarrierDefaults: input.request.targetCarrierDefaults,
        graphAbgFallbackBundle: input.request.abgFallbackBundle,
        graphEdgeAssuranceDefaults: input.request.edgeAssuranceDefaults,
        graphPluginTraversalObserverFallbackEnabled:
          input.request.pluginTraversalObserverFallbackEnabled,
        graphPluginTraversalObserverFallbackKinds:
          input.request.pluginTraversalObserverFallbackKinds
      } satisfies ConstructionIntentRunnerRequest)
    }),
    iterationCount: input.iterationCount
  });
}

function finishConsequenceTraversalActionConsumption(input: {
  readonly request: EngineIterateRequest;
  readonly preludeState: EngineEventEmissionState;
  readonly constructionOutcome: ConstructionRunnerStepOutcome;
  readonly iterationCount: number;
}): {
  readonly eventState: EngineEventEmissionState;
  readonly result: EngineIterateResult;
} {
  const eventState = appendAlreadyEmittedEngineRunnerEvents({
    state: input.preludeState,
    events: input.constructionOutcome.emittedEvents
  });
  const projection = deriveRuntimeAggregateProjection(
    input.request.basis,
    eventState.replayEvents
  );
  return Object.freeze({
    eventState,
    result: constructResult({
      basis: input.request.basis,
      transition: input.constructionOutcome.graphActionResult.transition,
      projection,
      emittedEvents: eventState.emittedEvents,
      replayEvents: eventState.replayEvents,
      iterationCount:
        input.iterationCount +
        1 +
        input.constructionOutcome.graphActionResult.iterationCount,
      assuranceGate: input.constructionOutcome.graphActionResult.assuranceGate
    })
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
    }
  | {
      readonly kind: "construction_intent_step";
      readonly request: ConstructionIntentRunnerRequest;
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
    }
  | {
      readonly kind: "construction_intent_step";
      readonly outcome: ConstructionRunnerStepOutcome;
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
    case "construction_intent_step":
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
    case "construction_intent_step":
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
    case "construction_intent_step":
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
    case "construction_intent_step":
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
    case "construction_intent_step":
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
    case "construction_intent_step":
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
    case "construction_intent_step":
      throw new TypeError("Engine plugin effect expected consequence_project");
  }
}

function constructionRunnerOutcomeFromEffectResult(
  result: EnginePluginEffectResult
): ConstructionRunnerStepOutcome {
  assertEnginePluginEffectKind(result, "construction_intent_step");
  switch (result.kind) {
    case "construction_intent_step":
      return result.outcome;
    case "fd_evaluate":
    case "composed_stage_task_batch_run":
    case "evaluation_rule_evaluate":
    case "evaluation_rule_batch_evaluate":
    case "fp_evaluate":
    case "fp_dispatch":
    case "fh_admit":
    case "consequence_project":
      throw new TypeError("Engine plugin effect expected construction_intent_step");
  }
}

function* runEngineIterateMachine(input: {
  readonly request: EngineIterateRequest;
  readonly plugins: ResolvedRunnerPlugins;
  readonly targetCarrierDefaults: GtlTargetCarrierDefaultsBundle;
}): Generator<EnginePluginEffect, EngineIterateResult, EnginePluginEffectResult> {
  const { request, plugins, targetCarrierDefaults } = input;
  const requirementRouteContext = requirementRouteContextForRequest(request);
  let eventState: EngineEventEmissionState = Object.freeze({
    emittedEvents: Object.freeze([]),
    replayEvents: canonicalReplayEvents(
      runtimeEventsForBasis(request.basis, request.runtimeEvents ?? Object.freeze([]))
    ),
    requirementRouteReplayFacts:
      requirementRouteContext?.replayFacts ?? Object.freeze([])
  });
  if (
    requirementRouteContext?.admissionRuntimeEvents !== undefined &&
    requirementRouteContext.admissionRuntimeEvents.length > 0
  ) {
    eventState = appendRequirementRouteEvents({
      state: eventState,
      runtimeEvents: requirementRouteContext.admissionRuntimeEvents,
      replayFacts: requirementRouteContext.replayFacts,
      sink: request.eventSink
    });
  }
  let iterationCount = 0;
  let continuationStageProjectionRefs: readonly string[] = Object.freeze([]);
  let continuationStageFoldInputRefs: readonly string[] = Object.freeze([]);

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
  let registryStartup: RuntimeRegistryStartupAdmissionResult | null = null;
  if (request.runtimeRegistryStartup !== undefined) {
    registryStartup = admitRuntimeGraphFunctionRegistryStartup(
      request.runtimeRegistryStartup
    );
    if (registryStartup.admissionEvents.length > 0) {
      eventState = emitRunnerEvents(eventState, registryStartup.admissionEvents);
    }
  }
  const instructionAssemblyRuntime = instructionAssemblyRuntimeForStartup({
    startup: request.instructionAssemblyStartup,
    registryStartup
  });

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

    if (request.runtimeRegistryStartup !== undefined && transition.kind !== "terminal") {
      const registrySelection = runtimeRegistrySelectionForTransition({
        basis: request.basis,
        transition,
        replayEvents: eventState.replayEvents
      });
      eventState = emitRunnerEvents(eventState, registrySelection);
      if (registrySelection.kind === "graph_function_selection_rejected") {
        const blocked = terminalTransition(
          request.basis,
          "gap_stop",
          `runtime registry selection rejected: ${registrySelection.rejectionReason}`
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
          targetCarrierDefaults,
          pluginTraversalObserverFallbackEnabled:
            request.pluginTraversalObserverFallbackEnabled ?? false,
          pluginTraversalObserverFallbackKinds:
            request.pluginTraversalObserverFallbackKinds ?? Object.freeze([]),
          priorStageProjectionRefs: continuationStageProjectionRefs,
          priorStageFoldInputRefs: continuationStageFoldInputRefs
        });
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
          targetCarrierDefaults,
              pluginTraversalObserverFallbackEnabled:
                request.pluginTraversalObserverFallbackEnabled ?? false,
              pluginTraversalObserverFallbackKinds:
                request.pluginTraversalObserverFallbackKinds ?? Object.freeze([]),
              priorStageProjectionRefs: continuationStageProjectionRefs,
              priorStageFoldInputRefs: continuationStageFoldInputRefs
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
          const batchEvaluationProjection = deriveRuntimeAggregateProjection(
            request.basis,
            eventState.replayEvents
          );
          const priorEvaluationSetProjection =
            evaluationSetProjectionForCurrentOutcomes(
              evaluationSetPlan,
              evaluationRuleOutcomes
            );
          const plannedBatchWithInputs: {
            readonly declaration: EvaluationRuleDeclaration;
            readonly plannedRule: PlannedEvaluationRule;
            readonly ruleInput: EnginePluginInput;
            readonly actorInvocation: ActorInvocation | null;
          }[] = [];
          for (const { declaration, plannedRule } of plannedBatch) {
            const resolvedRegime =
              plannedRule.plugin.contract.computeMeans ?? "F_D";
            const ruleActorInvocation =
              resolvedRegime === "F_P"
                ? (() => {
                    const instructionTransition =
                      instructionAssemblyTransitionScopeFor({
                        basis: request.basis,
                        transition
                      });
                    if (instructionTransition === null) {
                      return null;
                    }
                    return actorInvocationForComposedStageTask({
                      basis: request.basis,
                      projection: batchEvaluationProjection,
                      transition: instructionTransition,
                      stageRole: "evaluate",
                      taskRef: declaration.ruleRef,
                      pluginIndex: plannedRule.pluginIndex
                    });
                  })()
                : null;
            if (resolvedRegime === "F_P" && ruleActorInvocation === null) {
              const blocked = terminalTransition(
                request.basis,
                "gap_stop",
                "F_P evaluation rule requires dispatchRef for instruction assembly"
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
            let ruleInput = constructEnginePluginInput({
                contract: plannedRule.plugin.contract,
                basis: request.basis,
                projection: batchEvaluationProjection,
                replayEvents: eventState.replayEvents,
                vectorIndex: transition.vectorIndex,
                edge: transition.edge,
                regime: resolvedRegime,
                actorInvocationRef:
                  ruleActorInvocation === null
                    ? null
                    : actorInvocationRef(ruleActorInvocation),
                abgFallbackBundle: request.abgFallbackBundle ?? null,
                edgeAssuranceDefaults: request.edgeAssuranceDefaults ?? null,
                constructionPressurePackage:
                  request.constructionPressurePackage ?? null,
          targetCarrierDefaults,
                pluginTraversalObserverFallbackEnabled:
                  request.pluginTraversalObserverFallbackEnabled ?? false,
                pluginTraversalObserverFallbackKinds:
                  request.pluginTraversalObserverFallbackKinds ?? Object.freeze([]),
                priorStageProjectionRefs: continuationStageProjectionRefs,
                priorStageFoldInputRefs: continuationStageFoldInputRefs,
                stageSetDependencyRefs: stageProjectionFoldInputRefs(
                  priorEvaluationSetProjection
                )
              });
            if (ruleActorInvocation !== null) {
              const ruleInstructionBinding = bindInstructionAssemblyForFpEffect({
                runtime: instructionAssemblyRuntime,
                basis: request.basis,
                transition: {
                  vectorIndex: transition.vectorIndex,
                  edge: transition.edge,
                  dispatchRef: ruleActorInvocation.dispatchRef
                },
                computeStageRole: "evaluate",
                actorInvocation: ruleActorInvocation,
                pluginInput: ruleInput,
                projection: batchEvaluationProjection,
                replayEvents: eventState.replayEvents
              });
              if (ruleInstructionBinding.kind !== "manifest_projected") {
                const blocked = terminalTransition(
                  request.basis,
                  "gap_stop",
                  instructionAssemblyBindingBlockReason(ruleInstructionBinding)
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
              eventState = emitRunnerEvents(
                eventState,
                [
                  ruleInstructionBinding.event,
                  constructActorInvocationStartedEvent(ruleActorInvocation)
                ]
              );
              ruleInput = Object.freeze({
                ...ruleInput,
                instructionPromptManifest: ruleInstructionBinding.manifest
              });
            }
            plannedBatchWithInputs.push({
              declaration,
              plannedRule,
              ruleInput,
              actorInvocation: ruleActorInvocation
            });
          }
          const batchOutcomes = evaluationRuleBatchOutcomesFromEffectResult({
            result: yield Object.freeze({
              kind: "evaluation_rule_batch_evaluate",
              items: plannedBatchWithInputs.map(({ plannedRule, ruleInput }) =>
                Object.freeze({
                  pluginIndex: plannedRule.pluginIndex,
                  input: ruleInput
                })
              )
            }),
            pluginIndexes: plannedBatchWithInputs.map(
              ({ plannedRule }) => plannedRule.pluginIndex
            )
          });
          for (const [
            index,
            { declaration, ruleInput }
          ] of plannedBatchWithInputs.entries()) {
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
                pluginInput: ruleInput,
                outcome: ruleOutcome,
                outputCarrierRefs: declaration.outputCarrierRefs,
                resultInterfaces:
                  request.pluginResultInterfaceCatalog?.interfaces ?? Object.freeze([])
              })
            );
            const invocation = plannedBatchWithInputs[index]?.actorInvocation;
            if (invocation !== undefined && invocation !== null) {
              eventState = emitRunnerEvents(
                eventState,
                constructActorInvocationClosedEvent({
                  invocation,
                  closureStatus:
                    ruleOutcome.status === "blocked" ? "blocked" : "completed",
                  resultRef: invocation.resultRef,
                  detail: ruleOutcome.reason
                })
              );
            }
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
          const retryableOutcomes = evaluationSetRetryableBlockedRequiredOutcomes({
            admission: preScalarAdmission,
            requiredRuleRefs: evaluationSetPlan.requiredRuleRefs,
            ignoreMissingRuleRefs: [scalarFdRule.ruleRef]
          });
          if (retryableOutcomes.length > 0) {
            const retryEvents = evaluationSetRetryEvents({
              basis: request.basis,
              runtimeProjection: deriveRuntimeAggregateProjection(
                request.basis,
                eventState.replayEvents
              ),
              replayEvents: eventState.replayEvents,
              vectorIndex: transition.vectorIndex,
              outcomes: retryableOutcomes,
              maxAttempts:
                request.maxAttachedFpAttempts ??
                DEFAULT_ATTACHED_FP_MAX_RETRY_ATTEMPTS
            });
            if (!("kind" in retryEvents)) {
              eventState = emitRunnerEvents(eventState, retryEvents);
              break;
            }
            eventState = emitRunnerEvents(
              eventState,
              constructTerminalReachedEvent(retryEvents)
            );
            return constructResult({
              basis: request.basis,
              transition: retryEvents,
              projection: deriveRuntimeAggregateProjection(
                request.basis,
                eventState.replayEvents
              ),
              emittedEvents: eventState.emittedEvents,
              replayEvents: eventState.replayEvents,
              iterationCount
            });
          }
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
        const preScalarEvaluationSetProjection =
          evaluationSetProjectionForCurrentOutcomes(
            evaluationSetPlan,
            evaluationRuleOutcomes
          );
        const scalarFdEvaluationProjection = deriveRuntimeAggregateProjection(
          request.basis,
          eventState.replayEvents
        );
        const scalarFdEvaluationInput = constructEnginePluginInput({
          contract: plugins.fdEvaluator.contract,
          basis: request.basis,
          projection: scalarFdEvaluationProjection,
          replayEvents: eventState.replayEvents,
          vectorIndex: transition.vectorIndex,
          edge: transition.edge,
          regime: "F_D",
          abgFallbackBundle: request.abgFallbackBundle ?? null,
          edgeAssuranceDefaults: request.edgeAssuranceDefaults ?? null,
          constructionPressurePackage:
            request.constructionPressurePackage ?? null,
          targetCarrierDefaults,
          pluginTraversalObserverFallbackEnabled:
            request.pluginTraversalObserverFallbackEnabled ?? false,
          pluginTraversalObserverFallbackKinds:
            request.pluginTraversalObserverFallbackKinds ?? Object.freeze([]),
          priorStageProjectionRefs: continuationStageProjectionRefs,
          priorStageFoldInputRefs: continuationStageFoldInputRefs,
          stageSetDependencyRefs: stageProjectionFoldInputRefs(
            preScalarEvaluationSetProjection
          )
        });
        if (scalarFdEvaluationInput.pluginTraversalObserverBinding !== null) {
          eventState = emitRunnerEvents(eventState,
            constructPluginTraversalPromptMaterializedEvent({
              basis: request.basis,
              vectorIndex: transition.vectorIndex,
              selection: scalarFdEvaluationInput.pluginTraversalObserverBinding,
              causationEventRefs: Object.freeze([
                scalarFdEvaluationInput.sourceProjectionRef
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
        const outcome = fdEvaluationOutcomeFromEffectResult(
          yield Object.freeze({
            kind: "fd_evaluate",
            input: scalarFdEvaluationInput
          }),
        );
        const fdEvaluationRuleOutcome = evaluationRuleOutcomeFromFdEvaluation({
          declaration: scalarFdRule,
          pluginInput: scalarFdEvaluationInput,
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
            pluginInput: scalarFdEvaluationInput,
            outcome: fdEvaluationRuleOutcome,
            outputCarrierRefs: scalarFdRule.outputCarrierRefs,
            resultInterfaces:
              request.pluginResultInterfaceCatalog?.interfaces ?? Object.freeze([])
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
        eventState = emitRunnerEvents(eventState,
          fdAuthorityOutcomeEvent({
            basis: request.basis,
            transition,
            pluginInput: scalarFdEvaluationInput,
            resultInterfaces:
              request.pluginResultInterfaceCatalog?.interfaces ?? Object.freeze([]),
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
          vectorIndex: transition.vectorIndex,
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
          const retryableOutcomes = evaluationSetRetryableBlockedRequiredOutcomes({
            admission: evaluationSetAdmission,
            requiredRuleRefs: evaluationSetPlan.requiredRuleRefs
          });
          if (retryableOutcomes.length > 0) {
            const retryEvents = evaluationSetRetryEvents({
              basis: request.basis,
              runtimeProjection: deriveRuntimeAggregateProjection(
                request.basis,
                eventState.replayEvents
              ),
              replayEvents: eventState.replayEvents,
              vectorIndex: transition.vectorIndex,
              outcomes: retryableOutcomes,
              maxAttempts:
                request.maxAttachedFpAttempts ??
                DEFAULT_ATTACHED_FP_MAX_RETRY_ATTEMPTS
            });
            if (!("kind" in retryEvents)) {
              eventState = emitRunnerEvents(eventState, retryEvents);
              break;
            }
            eventState = emitRunnerEvents(eventState, constructTerminalReachedEvent(retryEvents));
            return constructResult({
              basis: request.basis,
              transition: retryEvents,
              projection: deriveRuntimeAggregateProjection(request.basis, eventState.replayEvents),
              emittedEvents: eventState.emittedEvents,
              replayEvents: eventState.replayEvents,
              iterationCount
            });
          }
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
          targetCarrierDefaults,
          pluginTraversalObserverFallbackEnabled:
            request.pluginTraversalObserverFallbackEnabled ?? false,
          pluginTraversalObserverFallbackKinds:
            request.pluginTraversalObserverFallbackKinds ?? Object.freeze([]),
          priorStageProjectionRefs: stageProjectionRefs(evaluationSetProjection),
          priorStageFoldInputRefs:
            stageProjectionFoldInputRefs(evaluationSetProjection)
        });
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
          targetCarrierDefaults,
              pluginTraversalObserverFallbackEnabled:
                request.pluginTraversalObserverFallbackEnabled ?? false,
              pluginTraversalObserverFallbackKinds:
                request.pluginTraversalObserverFallbackKinds ?? Object.freeze([]),
              priorStageProjectionRefs: stageProjectionRefs(evaluationSetProjection),
              priorStageFoldInputRefs:
                stageProjectionFoldInputRefs(evaluationSetProjection)
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
          const batchConsequenceProjection = deriveRuntimeAggregateProjection(
            request.basis,
            eventState.replayEvents
          );
          const priorConsequenceStageProjection =
            composedStageProjectionForCurrentOutcomes(
              consequenceStagePlan,
              consequenceStageOutcomes
            );
          const plannedBatchWithInputs: {
            readonly declaration: ComposedStageTaskDeclaration;
            readonly plannedTask: PlannedComposedStageTask;
            readonly taskInput: EnginePluginInput;
            readonly actorInvocation: ActorInvocation | null;
          }[] = [];
          for (const { declaration, plannedTask } of plannedBatch) {
            const resolvedRegime =
              plannedTask.plugin.contract.computeMeans ?? "F_D";
            const taskActorInvocation =
              resolvedRegime === "F_P"
                ? (() => {
                    const instructionTransition =
                      instructionAssemblyTransitionScopeFor({
                        basis: request.basis,
                        transition
                      });
                    if (instructionTransition === null) {
                      return null;
                    }
                    return actorInvocationForComposedStageTask({
                      basis: request.basis,
                      projection: batchConsequenceProjection,
                      transition: instructionTransition,
                      stageRole: "consequence",
                      taskRef: declaration.taskRef,
                      pluginIndex: plannedTask.pluginIndex
                    });
                  })()
                : null;
            if (resolvedRegime === "F_P" && taskActorInvocation === null) {
              const blocked = terminalTransition(
                request.basis,
                "gap_stop",
                "F_P composed consequence task requires dispatchRef for instruction assembly"
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
            let taskInput = constructEnginePluginInput({
                contract: plannedTask.plugin.contract,
                basis: request.basis,
                projection: batchConsequenceProjection,
                replayEvents: eventState.replayEvents,
                vectorIndex: transition.vectorIndex,
                edge: transition.edge,
                regime: resolvedRegime,
                actorInvocationRef:
                  taskActorInvocation === null
                    ? null
                    : actorInvocationRef(taskActorInvocation),
                abgFallbackBundle: request.abgFallbackBundle ?? null,
                edgeAssuranceDefaults: request.edgeAssuranceDefaults ?? null,
                constructionPressurePackage:
                  request.constructionPressurePackage ?? null,
          targetCarrierDefaults,
                pluginTraversalObserverFallbackEnabled:
                  request.pluginTraversalObserverFallbackEnabled ?? false,
                pluginTraversalObserverFallbackKinds:
                  request.pluginTraversalObserverFallbackKinds ?? Object.freeze([]),
                priorStageProjectionRefs:
                  stageProjectionRefs(evaluationSetProjection),
                priorStageFoldInputRefs:
                  stageProjectionFoldInputRefs(evaluationSetProjection),
                stageSetDependencyRefs: stageProjectionFoldInputRefs(
                  priorConsequenceStageProjection
                )
              });
            if (taskActorInvocation !== null) {
              const taskInstructionBinding = bindInstructionAssemblyForFpEffect({
                runtime: instructionAssemblyRuntime,
                basis: request.basis,
                transition: {
                  vectorIndex: transition.vectorIndex,
                  edge: transition.edge,
                  dispatchRef: taskActorInvocation.dispatchRef
                },
                computeStageRole: "consequence",
                actorInvocation: taskActorInvocation,
                pluginInput: taskInput,
                projection: batchConsequenceProjection,
                replayEvents: eventState.replayEvents
              });
              if (taskInstructionBinding.kind !== "manifest_projected") {
                const blocked = terminalTransition(
                  request.basis,
                  "gap_stop",
                  instructionAssemblyBindingBlockReason(taskInstructionBinding)
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
              eventState = emitRunnerEvents(
                eventState,
                [
                  taskInstructionBinding.event,
                  constructActorInvocationStartedEvent(taskActorInvocation)
                ]
              );
              taskInput = Object.freeze({
                ...taskInput,
                instructionPromptManifest: taskInstructionBinding.manifest
              });
            }
            plannedBatchWithInputs.push({
              declaration,
              plannedTask,
              taskInput,
              actorInvocation: taskActorInvocation
            });
          }
          const batchOutcomes = composedStageTaskBatchOutcomesFromEffectResult({
            result: yield Object.freeze({
              kind: "composed_stage_task_batch_run",
              stageRole: "consequence",
              items: plannedBatchWithInputs.map(({ plannedTask, taskInput }) =>
                Object.freeze({
                  pluginIndex: plannedTask.pluginIndex,
                  input: taskInput
                })
              )
            }),
            pluginIndexes: plannedBatchWithInputs.map(
              ({ plannedTask }) => plannedTask.pluginIndex
            )
          });
          for (const [
            index,
            { declaration, taskInput }
          ] of plannedBatchWithInputs.entries()) {
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
                pluginInput: taskInput,
                outcome: taskOutcome,
                outputCarrierRefs: declaration.outputCarrierRefs,
                resultInterfaces:
                  request.pluginResultInterfaceCatalog?.interfaces ?? Object.freeze([])
              })
            );
            const invocation = plannedBatchWithInputs[index]?.actorInvocation;
            if (invocation !== undefined && invocation !== null) {
              eventState = emitRunnerEvents(
                eventState,
                constructActorInvocationClosedEvent({
                  invocation,
                  closureStatus:
                    taskOutcome.status === "blocked" ? "blocked" : "completed",
                  resultRef: invocation.resultRef,
                  detail: taskOutcome.reason
                })
              );
            }
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
        const preProjectionConsequenceProjection =
          composedStageProjectionForCurrentOutcomes(
            consequenceStagePlan,
            consequenceStageOutcomes
          );
        const scalarConsequenceProjection = deriveRuntimeAggregateProjection(
          request.basis,
          eventState.replayEvents
        );
        const scalarConsequenceInput = constructEnginePluginInput({
          contract: plugins.consequenceProjection.contract,
          basis: request.basis,
          projection: scalarConsequenceProjection,
          replayEvents: eventState.replayEvents,
          vectorIndex: transition.vectorIndex,
          edge: transition.edge,
          regime: "F_D",
          abgFallbackBundle: request.abgFallbackBundle ?? null,
          edgeAssuranceDefaults: request.edgeAssuranceDefaults ?? null,
          constructionPressurePackage:
            request.constructionPressurePackage ?? null,
          targetCarrierDefaults,
          pluginTraversalObserverFallbackEnabled:
            request.pluginTraversalObserverFallbackEnabled ?? false,
          pluginTraversalObserverFallbackKinds:
            request.pluginTraversalObserverFallbackKinds ?? Object.freeze([]),
          priorStageProjectionRefs: stageProjectionRefs(evaluationSetProjection),
          priorStageFoldInputRefs:
            stageProjectionFoldInputRefs(evaluationSetProjection),
          stageSetDependencyRefs: stageProjectionFoldInputRefs(
            preProjectionConsequenceProjection
          )
        });
        if (scalarConsequenceInput.pluginTraversalObserverBinding !== null) {
          eventState = emitRunnerEvents(eventState,
            constructPluginTraversalPromptMaterializedEvent({
              basis: request.basis,
              vectorIndex: transition.vectorIndex,
              selection: scalarConsequenceInput.pluginTraversalObserverBinding,
              causationEventRefs: Object.freeze([
                scalarConsequenceInput.sourceProjectionRef
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
            input: scalarConsequenceInput
          })
        );
        const scalarConsequenceOutcome = composedStageTaskOutcomeFromConsequence({
          declaration: scalarConsequenceTask,
          pluginInput: scalarConsequenceInput,
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
            pluginInput: scalarConsequenceInput,
            outcome: scalarConsequenceOutcome,
            outputCarrierRefs: scalarConsequenceTask.outputCarrierRefs,
            resultInterfaces:
              request.pluginResultInterfaceCatalog?.interfaces ?? Object.freeze([])
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
        const consequenceTraversalConsumption = consumeConsequenceTraversalAction({
          request,
          eventState,
          runtimeProjection: deriveRuntimeAggregateProjection(
            request.basis,
            eventState.replayEvents
          ),
          outcome: consequenceOutcome,
          allowedTraversalCatalog:
            scalarConsequenceInput.allowedConsequenceTraversalCatalog,
          vectorIndex: transition.vectorIndex,
          iterationCount
        });
        if (consequenceTraversalConsumption !== null) {
          if ("result" in consequenceTraversalConsumption) {
            return consequenceTraversalConsumption.result;
          }
          const constructionOutcome = constructionRunnerOutcomeFromEffectResult(
            yield consequenceTraversalConsumption.effect
          );
          return finishConsequenceTraversalActionConsumption({
            request,
            preludeState: consequenceTraversalConsumption.eventState,
            constructionOutcome,
            iterationCount: consequenceTraversalConsumption.iterationCount
          }).result;
        }
        eventState = emitRunnerEvents(eventState, [
          constructVectorClosedEvent({
            basis: request.basis,
            vectorIndex: transition.vectorIndex,
            closureKind: "advanced"
          }),
          constructFdAdvanceReadyEvent(transition)
        ]);
        continuationStageProjectionRefs = stageProjectionRefs(consequenceStageProjection);
        continuationStageFoldInputRefs =
          stageProjectionFoldInputRefs(consequenceStageProjection);
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
          targetCarrierDefaults,
          pluginTraversalObserverFallbackEnabled:
            request.pluginTraversalObserverFallbackEnabled ?? false,
          pluginTraversalObserverFallbackKinds:
            request.pluginTraversalObserverFallbackKinds ?? Object.freeze([]),
          priorStageProjectionRefs: continuationStageProjectionRefs,
          priorStageFoldInputRefs: continuationStageFoldInputRefs
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
          targetCarrierDefaults,
              pluginTraversalObserverFallbackEnabled:
                request.pluginTraversalObserverFallbackEnabled ?? false,
              pluginTraversalObserverFallbackKinds:
                request.pluginTraversalObserverFallbackKinds ?? Object.freeze([]),
              priorStageProjectionRefs: continuationStageProjectionRefs,
              priorStageFoldInputRefs: continuationStageFoldInputRefs
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
          const batchTransformProjection = deriveRuntimeAggregateProjection(
            request.basis,
            eventState.replayEvents
          );
          const priorTransformStageProjection =
            composedStageProjectionForCurrentOutcomes(
              transformStagePlan,
              transformStageOutcomes
            );
          const plannedBatchWithInputs: {
            readonly declaration: ComposedStageTaskDeclaration;
            readonly plannedTask: PlannedComposedStageTask;
            readonly taskInput: EnginePluginInput;
            readonly actorInvocation: ActorInvocation | null;
          }[] = [];
          for (const { declaration, plannedTask } of plannedBatch) {
            const resolvedRegime =
              plannedTask.plugin.contract.computeMeans ?? "F_D";
            const taskActorInvocation =
              resolvedRegime === "F_P"
                ? (() => {
                    const instructionTransition =
                      instructionAssemblyTransitionScopeFor({
                        basis: request.basis,
                        transition
                      });
                    if (instructionTransition === null) {
                      return null;
                    }
                    return actorInvocationForComposedStageTask({
                      basis: request.basis,
                      projection: batchTransformProjection,
                      transition: instructionTransition,
                      stageRole: "transform",
                      taskRef: declaration.taskRef,
                      pluginIndex: plannedTask.pluginIndex
                    });
                  })()
                : null;
            if (resolvedRegime === "F_P" && taskActorInvocation === null) {
              const blocked = terminalTransition(
                request.basis,
                "gap_stop",
                "F_P composed transform task requires dispatchRef for instruction assembly"
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
            let taskInput = constructEnginePluginInput({
                contract: plannedTask.plugin.contract,
                basis: request.basis,
                projection: batchTransformProjection,
                replayEvents: eventState.replayEvents,
                vectorIndex: transition.vectorIndex,
                edge: transition.edge,
                regime: resolvedRegime,
                actorInvocationRef:
                  taskActorInvocation === null
                    ? null
                    : actorInvocationRef(taskActorInvocation),
                traversalStrategySelection: modulatedAttempt?.selection ?? null,
                traversalAttemptEnvelope: modulatedAttempt?.envelope ?? null,
                abgFallbackBundle: request.abgFallbackBundle ?? null,
                edgeAssuranceDefaults: request.edgeAssuranceDefaults ?? null,
                constructionPressurePackage:
                  request.constructionPressurePackage ?? null,
          targetCarrierDefaults,
                pluginTraversalObserverFallbackEnabled:
                  request.pluginTraversalObserverFallbackEnabled ?? false,
                pluginTraversalObserverFallbackKinds:
                  request.pluginTraversalObserverFallbackKinds ?? Object.freeze([]),
                priorStageProjectionRefs: continuationStageProjectionRefs,
                priorStageFoldInputRefs: continuationStageFoldInputRefs,
                stageSetDependencyRefs: stageProjectionFoldInputRefs(
                  priorTransformStageProjection
                )
              });
            if (taskActorInvocation !== null) {
              const taskInstructionBinding = bindInstructionAssemblyForFpEffect({
                runtime: instructionAssemblyRuntime,
                basis: request.basis,
                transition: {
                  vectorIndex: transition.vectorIndex,
                  edge: transition.edge,
                  dispatchRef: taskActorInvocation.dispatchRef
                },
                computeStageRole: "transform",
                actorInvocation: taskActorInvocation,
                pluginInput: taskInput,
                projection: batchTransformProjection,
                replayEvents: eventState.replayEvents
              });
              if (taskInstructionBinding.kind !== "manifest_projected") {
                const blocked = terminalTransition(
                  request.basis,
                  "gap_stop",
                  instructionAssemblyBindingBlockReason(taskInstructionBinding)
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
              eventState = emitRunnerEvents(
                eventState,
                [
                  taskInstructionBinding.event,
                  constructActorInvocationStartedEvent(taskActorInvocation)
                ]
              );
              taskInput = Object.freeze({
                ...taskInput,
                instructionPromptManifest: taskInstructionBinding.manifest
              });
            }
            plannedBatchWithInputs.push({
              declaration,
              plannedTask,
              taskInput,
              actorInvocation: taskActorInvocation
            });
          }
          const batchOutcomes = composedStageTaskBatchOutcomesFromEffectResult({
            result: yield Object.freeze({
              kind: "composed_stage_task_batch_run",
              stageRole: "transform",
              items: plannedBatchWithInputs.map(({ plannedTask, taskInput }) =>
                Object.freeze({
                  pluginIndex: plannedTask.pluginIndex,
                  input: taskInput
                })
              )
            }),
            pluginIndexes: plannedBatchWithInputs.map(
              ({ plannedTask }) => plannedTask.pluginIndex
            )
          });
          for (const [
            index,
            { declaration, taskInput }
          ] of plannedBatchWithInputs.entries()) {
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
                pluginInput: taskInput,
                outcome: taskOutcome,
                outputCarrierRefs: declaration.outputCarrierRefs,
                resultInterfaces:
                  request.pluginResultInterfaceCatalog?.interfaces ?? Object.freeze([])
              })
            );
            if (plannedBatchWithInputs[index]?.actorInvocation !== null) {
              const invocation = plannedBatchWithInputs[index]?.actorInvocation;
              if (invocation !== undefined && invocation !== null) {
                eventState = emitRunnerEvents(
                  eventState,
                  constructActorInvocationClosedEvent({
                    invocation,
                    closureStatus:
                      taskOutcome.status === "blocked" ? "blocked" : "completed",
                    resultRef: invocation.resultRef,
                    detail: taskOutcome.reason
                  })
                );
              }
            }
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
        const preDispatchTransformProjection =
          composedStageProjectionForCurrentOutcomes(
            transformStagePlan,
            transformStageOutcomes
          );
        const scalarTransformProjection = deriveRuntimeAggregateProjection(
          request.basis,
          eventState.replayEvents
        );
        let scalarTransformInput = constructEnginePluginInput({
          contract: plugins.fpDispatch.contract,
          basis: request.basis,
          projection: scalarTransformProjection,
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
          targetCarrierDefaults,
          pluginTraversalObserverFallbackEnabled:
            request.pluginTraversalObserverFallbackEnabled ?? false,
          pluginTraversalObserverFallbackKinds:
            request.pluginTraversalObserverFallbackKinds ?? Object.freeze([]),
          priorStageProjectionRefs: continuationStageProjectionRefs,
          priorStageFoldInputRefs: continuationStageFoldInputRefs,
          stageSetDependencyRefs: stageProjectionFoldInputRefs(
            preDispatchTransformProjection
          )
        });
        const instructionBinding = bindInstructionAssemblyForFpEffect({
          runtime: instructionAssemblyRuntime,
          basis: request.basis,
          transition,
          computeStageRole: "transform",
          actorInvocation,
          pluginInput: scalarTransformInput,
          projection: scalarTransformProjection,
          replayEvents: eventState.replayEvents
        });
        if (instructionBinding.kind !== "manifest_projected") {
          const blocked = terminalTransition(
            request.basis,
            "gap_stop",
            instructionAssemblyBindingBlockReason(instructionBinding)
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
        eventState = emitRunnerEvents(eventState, instructionBinding.event);
        scalarTransformInput = Object.freeze({
          ...scalarTransformInput,
          instructionPromptManifest: instructionBinding.manifest
        });
        eventState = emitRunnerEvents(eventState,
          fpDispatchAttemptStartedEvents({
            basis: request.basis,
            transition,
            actorInvocation,
            modulatedAttempt,
            pluginInput: scalarTransformInput
          })
        );
        if (scalarTransformInput.instructionCausalContext?.status === "blocked") {
          const blocked = terminalTransition(
            request.basis,
            "gap_stop",
            scalarTransformInput.instructionCausalContext.reason ??
              "instruction causal context blocked"
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
        const outcome = fpDispatchOutcomeFromEffectResult(
          yield Object.freeze({ kind: "fp_dispatch", input: scalarTransformInput }),
        );
        const scalarTransformOutcome = composedStageTaskOutcomeFromFpDispatch({
          declaration: scalarTransformTask,
          pluginInput: scalarTransformInput,
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
            pluginInput: scalarTransformInput,
            outcome: scalarTransformOutcome,
            outputCarrierRefs: scalarTransformTask.outputCarrierRefs,
            resultInterfaces:
              request.pluginResultInterfaceCatalog?.interfaces ?? Object.freeze([])
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
          const artifactObservedEvent = constructActorResultArtifactObservedEvent({
            invocation: actorInvocation,
            artifactRef: resultRef,
            artifactPayload: outcome.attachedResultArtifact
          });
          eventState = emitRunnerEvents(eventState, artifactObservedEvent);
          if (instructionBinding.kind === "manifest_projected") {
            eventState = emitRunnerEvents(
              eventState,
              constructInstructionResponseContractAdmittedEvent({
                invocation: actorInvocation,
                manifest: instructionBinding.manifest,
                artifactEvent: artifactObservedEvent,
                causationEventRefs: Object.freeze([
                  instructionBinding.manifest.manifestRef,
                  artifactObservedEvent.artifactRef
                ]),
                correlationId: [
                  "instruction-response-admission",
                  request.basis.id,
                  String(transition.vectorIndex),
                  actorInvocation.actorInvocationId
                ].join(":")
              })
            );
          }
          if (scalarTransformInput.fpTransformRequest === null) {
            throw new TypeError("F_P dispatch requires a transform request carrier");
          }
          const attachedDecision = deriveAttachedFpResultDecision({
            basis: request.basis,
            projection,
            replayEvents: eventState.replayEvents,
            transition,
            outcome,
            transformRequest: scalarTransformInput.fpTransformRequest,
            targetCarrierDefaults,
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
                  actorInvocationRef: actorInvocationRef(actorInvocation),
                  traversalStrategySelection: modulatedAttempt?.selection ?? null,
                  traversalAttemptEnvelope: modulatedAttempt?.envelope ?? null,
                  abgFallbackBundle: request.abgFallbackBundle ?? null,
                  edgeAssuranceDefaults: request.edgeAssuranceDefaults ?? null,
                  constructionPressurePackage:
                    request.constructionPressurePackage ?? null,
          targetCarrierDefaults,
                  pluginTraversalObserverFallbackEnabled:
                    request.pluginTraversalObserverFallbackEnabled ?? false,
                  pluginTraversalObserverFallbackKinds:
                    request.pluginTraversalObserverFallbackKinds ?? Object.freeze([]),
                  priorStageProjectionRefs:
                    stageProjectionRefs(transformStageProjection),
                  priorStageFoldInputRefs:
                    stageProjectionFoldInputRefs(transformStageProjection)
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
              attachedResultArtifact: outcome.attachedResultArtifact,
              traversalStrategySelection: modulatedAttempt?.selection ?? null,
              traversalAttemptEnvelope: modulatedAttempt?.envelope ?? null,
              abgFallbackBundle: request.abgFallbackBundle ?? null,
              edgeAssuranceDefaults: request.edgeAssuranceDefaults ?? null,
              constructionPressurePackage:
                request.constructionPressurePackage ?? null,
          targetCarrierDefaults,
              pluginTraversalObserverFallbackEnabled:
                request.pluginTraversalObserverFallbackEnabled ?? false,
              pluginTraversalObserverFallbackKinds:
                request.pluginTraversalObserverFallbackKinds ?? Object.freeze([]),
              priorStageProjectionRefs: stageProjectionRefs(transformStageProjection),
              priorStageFoldInputRefs:
                stageProjectionFoldInputRefs(transformStageProjection)
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
              const batchEvaluationProjection = deriveRuntimeAggregateProjection(
                request.basis,
                eventState.replayEvents
              );
              const priorEvaluationSetProjection =
                evaluationSetProjectionForCurrentOutcomes(
                  evaluationSetPlan,
                  evaluationRuleOutcomes
                );
              const plannedBatchWithInputs: {
                readonly declaration: EvaluationRuleDeclaration;
                readonly plannedRule: PlannedEvaluationRule;
                readonly ruleInput: EnginePluginInput;
                readonly actorInvocation: ActorInvocation | null;
              }[] = [];
              for (const { declaration, plannedRule } of plannedBatch) {
                const resolvedRegime =
                  plannedRule.plugin.contract.computeMeans ?? "F_D";
                const ruleActorInvocation =
                  resolvedRegime === "F_P"
                    ? (() => {
                        const instructionTransition =
                          instructionAssemblyTransitionScopeFor({
                            basis: request.basis,
                            transition
                          });
                        if (instructionTransition === null) {
                          return null;
                        }
                        return actorInvocationForComposedStageTask({
                          basis: request.basis,
                          projection: batchEvaluationProjection,
                          transition: instructionTransition,
                          stageRole: "evaluate",
                          taskRef: declaration.ruleRef,
                          pluginIndex: plannedRule.pluginIndex
                        });
                      })()
                    : null;
                if (resolvedRegime === "F_P" && ruleActorInvocation === null) {
                  const blocked = terminalTransition(
                    request.basis,
                    "gap_stop",
                    "F_P evaluation rule requires dispatchRef for instruction assembly"
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
                let ruleInput = constructEnginePluginInput({
                    contract: plannedRule.plugin.contract,
                    basis: request.basis,
                    projection: batchEvaluationProjection,
                    replayEvents: eventState.replayEvents,
                    vectorIndex: transition.vectorIndex,
                    edge: transition.edge,
                    regime: resolvedRegime,
                    actorInvocationRef:
                      ruleActorInvocation === null
                        ? null
                        : actorInvocationRef(ruleActorInvocation),
                    traversalStrategySelection: modulatedAttempt?.selection ?? null,
                    traversalAttemptEnvelope: modulatedAttempt?.envelope ?? null,
                    abgFallbackBundle: request.abgFallbackBundle ?? null,
                    edgeAssuranceDefaults: request.edgeAssuranceDefaults ?? null,
                    constructionPressurePackage:
                      request.constructionPressurePackage ?? null,
          targetCarrierDefaults,
                    pluginTraversalObserverFallbackEnabled:
                      request.pluginTraversalObserverFallbackEnabled ?? false,
                    pluginTraversalObserverFallbackKinds:
                      request.pluginTraversalObserverFallbackKinds ?? Object.freeze([]),
                    priorStageProjectionRefs:
                      stageProjectionRefs(transformStageProjection),
                    priorStageFoldInputRefs:
                      stageProjectionFoldInputRefs(transformStageProjection),
                    stageSetDependencyRefs: stageProjectionFoldInputRefs(
                      priorEvaluationSetProjection
                    )
                  });
                if (ruleActorInvocation !== null) {
                  const ruleInstructionBinding = bindInstructionAssemblyForFpEffect({
                    runtime: instructionAssemblyRuntime,
                    basis: request.basis,
                    transition: {
                      vectorIndex: transition.vectorIndex,
                      edge: transition.edge,
                      dispatchRef: ruleActorInvocation.dispatchRef
                    },
                    computeStageRole: "evaluate",
                    actorInvocation: ruleActorInvocation,
                    pluginInput: ruleInput,
                    projection: batchEvaluationProjection,
                    replayEvents: eventState.replayEvents
                  });
                  if (ruleInstructionBinding.kind !== "manifest_projected") {
                    const blocked = terminalTransition(
                      request.basis,
                      "gap_stop",
                      instructionAssemblyBindingBlockReason(ruleInstructionBinding)
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
                  eventState = emitRunnerEvents(
                    eventState,
                    [
                      ruleInstructionBinding.event,
                      constructActorInvocationStartedEvent(ruleActorInvocation)
                    ]
                  );
                  ruleInput = Object.freeze({
                    ...ruleInput,
                    instructionPromptManifest: ruleInstructionBinding.manifest
                  });
                }
                plannedBatchWithInputs.push({
                  declaration,
                  plannedRule,
                  ruleInput,
                  actorInvocation: ruleActorInvocation
                });
              }
              const batchOutcomes = evaluationRuleBatchOutcomesFromEffectResult({
                result: yield Object.freeze({
                  kind: "evaluation_rule_batch_evaluate",
                  items: plannedBatchWithInputs.map(({ plannedRule, ruleInput }) =>
                    Object.freeze({
                      pluginIndex: plannedRule.pluginIndex,
                      input: ruleInput
                    })
                  )
                }),
                pluginIndexes: plannedBatchWithInputs.map(
                  ({ plannedRule }) => plannedRule.pluginIndex
                )
              });
              for (const [
                index,
                { declaration, ruleInput }
              ] of plannedBatchWithInputs.entries()) {
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
                    pluginInput: ruleInput,
                    outcome: ruleOutcome,
                    outputCarrierRefs: declaration.outputCarrierRefs,
                    resultInterfaces:
                      request.pluginResultInterfaceCatalog?.interfaces ?? Object.freeze([])
                  })
                );
                const invocation = plannedBatchWithInputs[index]?.actorInvocation;
                if (invocation !== undefined && invocation !== null) {
                  eventState = emitRunnerEvents(
                    eventState,
                    constructActorInvocationClosedEvent({
                      invocation,
                      closureStatus:
                        ruleOutcome.status === "blocked" ? "blocked" : "completed",
                      resultRef: invocation.resultRef,
                      detail: ruleOutcome.reason
                    })
                  );
                }
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
              const retryableOutcomes = evaluationSetRetryableBlockedRequiredOutcomes({
                admission: preSemanticAdmission,
                requiredRuleRefs: evaluationSetPlan.requiredRuleRefs,
                ignoreMissingRuleRefs: [scalarFpRule.ruleRef]
              });
              if (retryableOutcomes.length > 0) {
                const retryEvents = evaluationSetRetryEvents({
                  basis: request.basis,
                  runtimeProjection: deriveRuntimeAggregateProjection(
                    request.basis,
                    eventState.replayEvents
                  ),
                  replayEvents: eventState.replayEvents,
                  vectorIndex: transition.vectorIndex,
                  outcomes: retryableOutcomes,
                  maxAttempts:
                    request.maxAttachedFpAttempts ??
                    DEFAULT_ATTACHED_FP_MAX_RETRY_ATTEMPTS
                });
                if (!("kind" in retryEvents)) {
                  eventState = emitRunnerEvents(eventState, retryEvents);
                  break;
                }
                eventState = emitRunnerEvents(
                  eventState,
                  constructTerminalReachedEvent(retryEvents)
                );
                return constructResult({
                  basis: request.basis,
                  transition: retryEvents,
                  projection: deriveRuntimeAggregateProjection(
                    request.basis,
                    eventState.replayEvents
                  ),
                  emittedEvents: eventState.emittedEvents,
                  replayEvents: eventState.replayEvents,
                  iterationCount
                });
              }
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
            const preSemanticEvaluationSetProjection =
              evaluationSetProjectionForCurrentOutcomes(
                evaluationSetPlan,
                evaluationRuleOutcomes
              );
            const fpSemanticEvaluationProjection = deriveRuntimeAggregateProjection(
              request.basis,
              eventState.replayEvents
            );
            let fpEvaluationInput = constructEnginePluginInput({
              contract: plugins.fpEvaluator.contract,
              basis: request.basis,
              projection: fpSemanticEvaluationProjection,
              replayEvents: eventState.replayEvents,
              vectorIndex: transition.vectorIndex,
              edge: transition.edge,
              regime: "F_P",
              actorInvocationRef: actorInvocationRef(actorInvocation),
              attachedResultArtifact: outcome.attachedResultArtifact,
              traversalStrategySelection: modulatedAttempt?.selection ?? null,
              traversalAttemptEnvelope: modulatedAttempt?.envelope ?? null,
              abgFallbackBundle: request.abgFallbackBundle ?? null,
              edgeAssuranceDefaults: request.edgeAssuranceDefaults ?? null,
              constructionPressurePackage:
                request.constructionPressurePackage ?? null,
          targetCarrierDefaults,
              pluginTraversalObserverFallbackEnabled:
                request.pluginTraversalObserverFallbackEnabled ?? false,
              pluginTraversalObserverFallbackKinds:
                request.pluginTraversalObserverFallbackKinds ?? Object.freeze([]),
              priorStageProjectionRefs: stageProjectionRefs(transformStageProjection),
              priorStageFoldInputRefs:
                stageProjectionFoldInputRefs(transformStageProjection),
              stageSetDependencyRefs: stageProjectionFoldInputRefs(
                preSemanticEvaluationSetProjection
              )
            });
            const evaluationInstructionBinding = bindInstructionAssemblyForFpEffect({
              runtime: instructionAssemblyRuntime,
              basis: request.basis,
              transition,
              computeStageRole: "evaluate",
              actorInvocation,
              pluginInput: fpEvaluationInput,
              projection: fpSemanticEvaluationProjection,
              replayEvents: eventState.replayEvents
            });
            if (evaluationInstructionBinding.kind !== "manifest_projected") {
              const blocked = terminalTransition(
                request.basis,
                "gap_stop",
                instructionAssemblyBindingBlockReason(evaluationInstructionBinding)
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
            eventState = emitRunnerEvents(
              eventState,
              evaluationInstructionBinding.event
            );
            fpEvaluationInput = Object.freeze({
              ...fpEvaluationInput,
              instructionPromptManifest: evaluationInstructionBinding.manifest
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
                outcome: fpEvaluationRuleOutcome,
                outputCarrierRefs: scalarFpRule.outputCarrierRefs,
                resultInterfaces:
                  request.pluginResultInterfaceCatalog?.interfaces ?? Object.freeze([])
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
              const retryableOutcomes = evaluationSetRetryableBlockedRequiredOutcomes({
                admission: evaluationSetAdmission,
                requiredRuleRefs: evaluationSetPlan.requiredRuleRefs
              });
              if (retryableOutcomes.length > 0) {
                const retryEvents = evaluationSetRetryEvents({
                  basis: request.basis,
                  runtimeProjection: deriveRuntimeAggregateProjection(
                    request.basis,
                    eventState.replayEvents
                  ),
                  replayEvents: eventState.replayEvents,
                  vectorIndex: transition.vectorIndex,
                  outcomes: retryableOutcomes,
                  maxAttempts:
                    request.maxAttachedFpAttempts ??
                    DEFAULT_ATTACHED_FP_MAX_RETRY_ATTEMPTS
                });
                if (!("kind" in retryEvents)) {
                  eventState = emitRunnerEvents(eventState, retryEvents);
                  break;
                }
                eventState = emitRunnerEvents(eventState, constructTerminalReachedEvent(retryEvents));
                return constructResult({
                  basis: request.basis,
                  transition: retryEvents,
                  projection: deriveRuntimeAggregateProjection(request.basis, eventState.replayEvents),
                  emittedEvents: eventState.emittedEvents,
                  replayEvents: eventState.replayEvents,
                  iterationCount
                });
              }
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
                outcome: fpEvaluationOutcome,
                resultInterfaces:
                  request.pluginResultInterfaceCatalog?.interfaces ?? Object.freeze([])
              })
            );
            const executiveProjection = executiveObserverProjectionForFpEvaluation({
              request,
              fpEvaluationOutcome,
              vectorIndex: transition.vectorIndex,
              replayEvents: eventState.replayEvents
            });
            eventState = emitRunnerEvents(
              eventState,
              executiveObserverRuntimeEventsForProjection({
                request,
                vectorIndex: transition.vectorIndex,
                projection: executiveProjection
              })
            );
            const executiveContinuationInput =
              executiveProjection?.continuationInput ?? null;
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
                  transformStageProjection.projectionRef,
                  evaluationSetProjection.projectionRef,
                  assuranceFold.payloadLedger.projectionRef
                ],
                policyRefs: [
                  request.basis.resolvedPolicy.resolvedPolicyBundleRef
                ]
              })
            );
            eventState = emitRunnerEvents(
              eventState,
              fpEvaluationTargetPayloadRejectionEvents({
                basis: request.basis,
                pluginInput: fpEvaluationInput,
                outcome: fpEvaluationOutcome,
                targetCarrierDefaults
              })
            );
            const assuranceTerminal = terminalForAssuranceDecision({
              basis: request.basis,
              decision: assuranceFold.closureDecision.decision,
              reason: assuranceFold.closureDecision.reason
            });
            if (assuranceFold.closureDecision.decision === "retry") {
              eventState = emitRunnerEvents(eventState,
                constructVectorEvaluatedEvent({
                  basis: request.basis,
                  vectorIndex: transition.vectorIndex,
                  status: "blocked"
                })
              );
              if (
                fpEvaluationContinuationRefs(fpEvaluationOutcome).length > 0 &&
                plugins.consequenceTasks.length === 0 &&
                plugins.requiredConsequenceTaskRefs.length === 0
              ) {
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
                  targetCarrierDefaults,
                  pluginTraversalObserverFallbackEnabled:
                    request.pluginTraversalObserverFallbackEnabled ?? false,
                  pluginTraversalObserverFallbackKinds:
                    request.pluginTraversalObserverFallbackKinds ?? Object.freeze([]),
                  priorStageProjectionRefs: stageProjectionRefs(evaluationSetProjection),
                  priorStageFoldInputRefs:
                    stageProjectionFoldInputRefs(evaluationSetProjection)
                });
                if (consequenceInput.pluginTraversalObserverBinding !== null) {
                  eventState = emitRunnerEvents(eventState,
                    constructPluginTraversalPromptMaterializedEvent({
                      basis: request.basis,
                      vectorIndex: transition.vectorIndex,
                      selection: consequenceInput.pluginTraversalObserverBinding,
                      invocation: actorInvocation,
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
                    consequenceOutcome.reason ??
                      "consequence projection plugin blocked traversal"
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
                const consequenceTraversalConsumption =
                  consumeConsequenceTraversalAction({
                    request,
                    eventState,
                    runtimeProjection: deriveRuntimeAggregateProjection(
                      request.basis,
                      eventState.replayEvents
                    ),
                    outcome: consequenceOutcome,
                    allowedTraversalCatalog:
                      consequenceInput.allowedConsequenceTraversalCatalog,
                    vectorIndex: transition.vectorIndex,
                    iterationCount
                });
                if (consequenceTraversalConsumption !== null) {
                  if ("result" in consequenceTraversalConsumption) {
                    return consequenceTraversalConsumption.result;
                  }
                  const constructionOutcome = constructionRunnerOutcomeFromEffectResult(
                    yield consequenceTraversalConsumption.effect
                  );
                  return finishConsequenceTraversalActionConsumption({
                    request,
                    preludeState: consequenceTraversalConsumption.eventState,
                    constructionOutcome,
                    iterationCount: consequenceTraversalConsumption.iterationCount
                  }).result;
                }
              }
              const retryProjection = deriveRuntimeAggregateProjection(
                request.basis,
                eventState.replayEvents
              );
              const executiveRetryTransition =
                runtimeContinuationTransitionFromExecutive({
                  basis: request.basis,
                  runtimeProjection: retryProjection,
                  vectorIndex: transition.vectorIndex,
                  executiveContinuationInput
                });
              const fpEvaluationRetryTransition =
                runtimeContinuationTransitionFromFpEvaluation({
                  basis: request.basis,
                  runtimeProjection: retryProjection,
                  vectorIndex: transition.vectorIndex,
                  fpEvaluationOutcome
                });
              const requirementRouteContinuationTransition =
                executiveRetryTransition ??
                fpEvaluationRetryTransition ??
                deriveRuntimeContinuationTransitionProjection({
                  basis: request.basis,
                  runtimeProjection: retryProjection,
                  vectorIndex: transition.vectorIndex,
                  assuranceClosureDecision: assuranceFold.closureDecision,
                  ...continuationTypedRefsFromExecutive(executiveContinuationInput)
                });
              eventState = emitRequirementRouteForEdgeClose({
                state: eventState,
                request,
                context: requirementRouteContext,
                vectorIndex: transition.vectorIndex,
                closureDecision: assuranceFold.closureDecision,
                continuationTransitions: Object.freeze([
                  requirementRouteContinuationTransition
                ])
              });
              const assuranceRetry =
                executiveRetryTransition === null
                  ? assuranceRetryEvents({
                      basis: request.basis,
                      runtimeProjection: retryProjection,
                      replayEvents: eventState.replayEvents,
                      vectorIndex: transition.vectorIndex,
                      priorManifestId: resultRef,
                      assuranceFold,
                      maxAttempts:
                        request.maxAttachedFpAttempts ??
                        DEFAULT_ATTACHED_FP_MAX_RETRY_ATTEMPTS,
                      executiveContinuationInput
                    })
                  : terminalTransitionForRuntimeContinuationProjection({
                      basis: request.basis,
                      projection: executiveRetryTransition
                    }) ??
                    assuranceRetryEvents({
                      basis: request.basis,
                      runtimeProjection: retryProjection,
                      replayEvents: eventState.replayEvents,
                      vectorIndex: transition.vectorIndex,
                      priorManifestId: resultRef,
                      assuranceFold,
                      maxAttempts:
                        request.maxAttachedFpAttempts ??
                        DEFAULT_ATTACHED_FP_MAX_RETRY_ATTEMPTS,
                      executiveContinuationInput
                    });
              if (!("kind" in assuranceRetry)) {
                if (mustExitAfterBoundedAttempt(modulatedAttempt)) {
                  const bounded = boundedAttemptExitTransition({
                    basis: request.basis,
                    vectorIndex: transition.vectorIndex,
                    reason: assuranceFold.closureDecision.reason
                  });
                  eventState = emitRunnerEvents(
                    eventState,
                    constructTerminalReachedEvent(bounded)
                  );
                  return constructResult({
                    basis: request.basis,
                    transition: bounded,
                    projection: deriveRuntimeAggregateProjection(
                      request.basis,
                      eventState.replayEvents
                    ),
                    emittedEvents: eventState.emittedEvents,
                    replayEvents: eventState.replayEvents,
                    iterationCount
                  });
                }
                eventState = emitRunnerEvents(eventState, assuranceRetry);
                break;
              }
              eventState = emitRunnerEvents(
                eventState,
                constructTerminalReachedEvent(assuranceRetry)
              );
              return constructResult({
                basis: request.basis,
                transition: assuranceRetry,
                projection: deriveRuntimeAggregateProjection(request.basis, eventState.replayEvents),
                emittedEvents: eventState.emittedEvents,
                replayEvents: eventState.replayEvents,
                iterationCount
              });
            }
            if (assuranceTerminal !== null) {
              eventState = emitRunnerEvents(eventState,
                constructVectorEvaluatedEvent({
                  basis: request.basis,
                  vectorIndex: transition.vectorIndex,
                  status: "blocked"
                })
              );
              const requirementRouteProjection = deriveRuntimeAggregateProjection(
                request.basis,
                eventState.replayEvents
              );
              const executiveTerminalTransition =
                runtimeContinuationTransitionFromExecutive({
                  basis: request.basis,
                  runtimeProjection: requirementRouteProjection,
                  vectorIndex: transition.vectorIndex,
                  executiveContinuationInput
                });
              const fpEvaluationTerminalTransition =
                runtimeContinuationTransitionFromFpEvaluation({
                  basis: request.basis,
                  runtimeProjection: requirementRouteProjection,
                  vectorIndex: transition.vectorIndex,
                  fpEvaluationOutcome
                });
              const requirementRouteContinuationTransition =
                executiveTerminalTransition ??
                fpEvaluationTerminalTransition ??
                deriveRuntimeContinuationTransitionProjection({
                  basis: request.basis,
                  runtimeProjection: requirementRouteProjection,
                  vectorIndex: transition.vectorIndex,
                  assuranceClosureDecision: assuranceFold.closureDecision,
                  ...continuationTypedRefsFromExecutive(executiveContinuationInput)
                });
              eventState = emitRequirementRouteForEdgeClose({
                state: eventState,
                request,
                context: requirementRouteContext,
                vectorIndex: transition.vectorIndex,
                closureDecision: assuranceFold.closureDecision,
                continuationTransitions: Object.freeze([
                  requirementRouteContinuationTransition
                ])
              });
              const continuationTerminal =
                terminalTransitionForRuntimeContinuationProjection({
                  basis: request.basis,
                  projection: requirementRouteContinuationTransition
                });
              const terminalTransitionToEmit =
                continuationTerminal ?? assuranceTerminal;
              eventState = emitRunnerEvents(
                eventState,
                constructTerminalReachedEvent(terminalTransitionToEmit)
              );
              return constructResult({
                basis: request.basis,
                transition: terminalTransitionToEmit,
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
          targetCarrierDefaults,
              pluginTraversalObserverFallbackEnabled:
                request.pluginTraversalObserverFallbackEnabled ?? false,
              pluginTraversalObserverFallbackKinds:
                request.pluginTraversalObserverFallbackKinds ?? Object.freeze([]),
              priorStageProjectionRefs: stageProjectionRefs(evaluationSetProjection),
              priorStageFoldInputRefs:
                stageProjectionFoldInputRefs(evaluationSetProjection)
            });
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
          targetCarrierDefaults,
                  pluginTraversalObserverFallbackEnabled:
                    request.pluginTraversalObserverFallbackEnabled ?? false,
                  pluginTraversalObserverFallbackKinds:
                    request.pluginTraversalObserverFallbackKinds ?? Object.freeze([]),
                  priorStageProjectionRefs:
                    stageProjectionRefs(evaluationSetProjection),
                  priorStageFoldInputRefs:
                    stageProjectionFoldInputRefs(evaluationSetProjection)
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
              const batchConsequenceProjection = deriveRuntimeAggregateProjection(
                request.basis,
                eventState.replayEvents
              );
              const priorConsequenceStageProjection =
                composedStageProjectionForCurrentOutcomes(
                  consequenceStagePlan,
                  consequenceStageOutcomes
                );
              const plannedBatchWithInputs: {
                readonly declaration: ComposedStageTaskDeclaration;
                readonly plannedTask: PlannedComposedStageTask;
                readonly taskInput: EnginePluginInput;
                readonly actorInvocation: ActorInvocation | null;
              }[] = [];
              for (const { declaration, plannedTask } of plannedBatch) {
                const resolvedRegime =
                  plannedTask.plugin.contract.computeMeans ?? "F_D";
                const taskActorInvocation =
                  resolvedRegime === "F_P"
                    ? (() => {
                        const instructionTransition =
                          instructionAssemblyTransitionScopeFor({
                            basis: request.basis,
                            transition
                          });
                        if (instructionTransition === null) {
                          return null;
                        }
                        return actorInvocationForComposedStageTask({
                          basis: request.basis,
                          projection: batchConsequenceProjection,
                          transition: instructionTransition,
                          stageRole: "consequence",
                          taskRef: declaration.taskRef,
                          pluginIndex: plannedTask.pluginIndex
                        });
                      })()
                    : null;
                if (resolvedRegime === "F_P" && taskActorInvocation === null) {
                  const blocked = terminalTransition(
                    request.basis,
                    "gap_stop",
                    "F_P composed consequence task requires dispatchRef for instruction assembly"
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
                let taskInput = constructEnginePluginInput({
                    contract: plannedTask.plugin.contract,
                    basis: request.basis,
                    projection: batchConsequenceProjection,
                    replayEvents: eventState.replayEvents,
                    vectorIndex: transition.vectorIndex,
                    edge: transition.edge,
                    regime: resolvedRegime,
                    actorInvocationRef:
                      taskActorInvocation === null
                        ? null
                        : actorInvocationRef(taskActorInvocation),
                    traversalStrategySelection: modulatedAttempt?.selection ?? null,
                    traversalAttemptEnvelope: modulatedAttempt?.envelope ?? null,
                    abgFallbackBundle: request.abgFallbackBundle ?? null,
                    edgeAssuranceDefaults: request.edgeAssuranceDefaults ?? null,
                    constructionPressurePackage:
                      request.constructionPressurePackage ?? null,
          targetCarrierDefaults,
                    pluginTraversalObserverFallbackEnabled:
                      request.pluginTraversalObserverFallbackEnabled ?? false,
                    pluginTraversalObserverFallbackKinds:
                      request.pluginTraversalObserverFallbackKinds ?? Object.freeze([]),
                    priorStageProjectionRefs:
                      stageProjectionRefs(evaluationSetProjection),
                    priorStageFoldInputRefs:
                      stageProjectionFoldInputRefs(evaluationSetProjection),
                    stageSetDependencyRefs: stageProjectionFoldInputRefs(
                      priorConsequenceStageProjection
                    )
                  });
                if (taskActorInvocation !== null) {
                  const taskInstructionBinding = bindInstructionAssemblyForFpEffect({
                    runtime: instructionAssemblyRuntime,
                    basis: request.basis,
                    transition: {
                      vectorIndex: transition.vectorIndex,
                      edge: transition.edge,
                      dispatchRef: taskActorInvocation.dispatchRef
                    },
                    computeStageRole: "consequence",
                    actorInvocation: taskActorInvocation,
                    pluginInput: taskInput,
                    projection: batchConsequenceProjection,
                    replayEvents: eventState.replayEvents
                  });
                  if (taskInstructionBinding.kind !== "manifest_projected") {
                    const blocked = terminalTransition(
                      request.basis,
                      "gap_stop",
                      instructionAssemblyBindingBlockReason(taskInstructionBinding)
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
                  eventState = emitRunnerEvents(
                    eventState,
                    [
                      taskInstructionBinding.event,
                      constructActorInvocationStartedEvent(taskActorInvocation)
                    ]
                  );
                  taskInput = Object.freeze({
                    ...taskInput,
                    instructionPromptManifest: taskInstructionBinding.manifest
                  });
                }
                plannedBatchWithInputs.push({
                  declaration,
                  plannedTask,
                  taskInput,
                  actorInvocation: taskActorInvocation
                });
              }
              const batchOutcomes = composedStageTaskBatchOutcomesFromEffectResult({
                result: yield Object.freeze({
                  kind: "composed_stage_task_batch_run",
                  stageRole: "consequence",
                  items: plannedBatchWithInputs.map(({ plannedTask, taskInput }) =>
                    Object.freeze({
                      pluginIndex: plannedTask.pluginIndex,
                      input: taskInput
                    })
                  )
                }),
                pluginIndexes: plannedBatchWithInputs.map(
                  ({ plannedTask }) => plannedTask.pluginIndex
                )
              });
              for (const [
                index,
                { declaration, taskInput }
              ] of plannedBatchWithInputs.entries()) {
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
                    pluginInput: taskInput,
                    outcome: taskOutcome,
                    outputCarrierRefs: declaration.outputCarrierRefs,
                    resultInterfaces:
                      request.pluginResultInterfaceCatalog?.interfaces ?? Object.freeze([])
                  })
                );
                const invocation = plannedBatchWithInputs[index]?.actorInvocation;
                if (invocation !== undefined && invocation !== null) {
                  eventState = emitRunnerEvents(
                    eventState,
                    constructActorInvocationClosedEvent({
                      invocation,
                      closureStatus:
                        taskOutcome.status === "blocked" ? "blocked" : "completed",
                      resultRef: invocation.resultRef,
                      detail: taskOutcome.reason
                    })
                  );
                }
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
            const preProjectionConsequenceProjection =
              composedStageProjectionForCurrentOutcomes(
                consequenceStagePlan,
                consequenceStageOutcomes
              );
            const scalarConsequenceProjection = deriveRuntimeAggregateProjection(
              request.basis,
              eventState.replayEvents
            );
            const scalarConsequenceInput = constructEnginePluginInput({
              contract: plugins.consequenceProjection.contract,
              basis: request.basis,
              projection: scalarConsequenceProjection,
              replayEvents: eventState.replayEvents,
              vectorIndex: transition.vectorIndex,
              edge: transition.edge,
              regime: "F_D",
              abgFallbackBundle: request.abgFallbackBundle ?? null,
              edgeAssuranceDefaults: request.edgeAssuranceDefaults ?? null,
              constructionPressurePackage:
                request.constructionPressurePackage ?? null,
          targetCarrierDefaults,
              pluginTraversalObserverFallbackEnabled:
                request.pluginTraversalObserverFallbackEnabled ?? false,
              pluginTraversalObserverFallbackKinds:
                request.pluginTraversalObserverFallbackKinds ?? Object.freeze([]),
              priorStageProjectionRefs: stageProjectionRefs(evaluationSetProjection),
              priorStageFoldInputRefs:
                stageProjectionFoldInputRefs(evaluationSetProjection),
              stageSetDependencyRefs: stageProjectionFoldInputRefs(
                preProjectionConsequenceProjection
              )
            });
            if (scalarConsequenceInput.pluginTraversalObserverBinding !== null) {
              eventState = emitRunnerEvents(eventState,
                constructPluginTraversalPromptMaterializedEvent({
                  basis: request.basis,
                  vectorIndex: transition.vectorIndex,
                  selection: scalarConsequenceInput.pluginTraversalObserverBinding,
                  causationEventRefs: Object.freeze([
                    scalarConsequenceInput.sourceProjectionRef
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
                input: scalarConsequenceInput
              })
            );
            const scalarConsequenceOutcome =
              composedStageTaskOutcomeFromConsequence({
                declaration: scalarConsequenceTask,
                pluginInput: scalarConsequenceInput,
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
                  pluginInput: scalarConsequenceInput,
                  outcome: scalarConsequenceOutcome,
                  outputCarrierRefs: scalarConsequenceTask.outputCarrierRefs,
                  resultInterfaces:
                    request.pluginResultInterfaceCatalog?.interfaces ?? Object.freeze([])
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
            const consequenceTraversalConsumption = consumeConsequenceTraversalAction({
              request,
              eventState,
              runtimeProjection: deriveRuntimeAggregateProjection(
                request.basis,
                eventState.replayEvents
              ),
              outcome: consequenceOutcome,
              allowedTraversalCatalog:
                scalarConsequenceInput.allowedConsequenceTraversalCatalog,
              vectorIndex: transition.vectorIndex,
              iterationCount
            });
            if (consequenceTraversalConsumption !== null) {
              if ("result" in consequenceTraversalConsumption) {
                return consequenceTraversalConsumption.result;
              }
              const constructionOutcome = constructionRunnerOutcomeFromEffectResult(
                yield consequenceTraversalConsumption.effect
              );
              return finishConsequenceTraversalActionConsumption({
                request,
                preludeState: consequenceTraversalConsumption.eventState,
                constructionOutcome,
                iterationCount: consequenceTraversalConsumption.iterationCount
              }).result;
            }
            const requirementRouteProjection = deriveRuntimeAggregateProjection(
              request.basis,
              eventState.replayEvents
            );
            const executiveCloseTransition =
              runtimeContinuationTransitionFromExecutive({
                basis: request.basis,
                runtimeProjection: requirementRouteProjection,
                vectorIndex: transition.vectorIndex,
                executiveContinuationInput
              });
            const fpEvaluationCloseTransition =
              runtimeContinuationTransitionFromFpEvaluation({
                basis: request.basis,
                runtimeProjection: requirementRouteProjection,
                vectorIndex: transition.vectorIndex,
                fpEvaluationOutcome
              });
            const requirementRouteContinuationTransition =
              executiveCloseTransition ??
              fpEvaluationCloseTransition ??
              deriveRuntimeContinuationTransitionProjection({
                basis: request.basis,
                runtimeProjection: requirementRouteProjection,
                vectorIndex: transition.vectorIndex,
                assuranceClosureDecision: assuranceFold.closureDecision,
                ...continuationTypedRefsFromExecutive(executiveContinuationInput)
              });
            eventState = emitRequirementRouteForEdgeClose({
              state: eventState,
              request,
              context: requirementRouteContext,
              vectorIndex: transition.vectorIndex,
              closureDecision: assuranceFold.closureDecision,
              continuationTransitions: Object.freeze([
                requirementRouteContinuationTransition
              ])
            });
            eventState = emitRunnerEvents(eventState,
              constructVectorClosedEvent({
                basis: request.basis,
                vectorIndex: transition.vectorIndex,
                closureKind: "assessed"
              })
            );
            continuationStageProjectionRefs = stageProjectionRefs(
              consequenceStageProjection
            );
            continuationStageFoldInputRefs =
              stageProjectionFoldInputRefs(consequenceStageProjection);
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
              vectorIndex: transition.vectorIndex,
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
            replayEvents: eventState.replayEvents,
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
                vectorIndex: transition.vectorIndex,
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
            request.constructionPressurePackage ?? null,
          targetCarrierDefaults,
          priorStageProjectionRefs: continuationStageProjectionRefs,
          priorStageFoldInputRefs: continuationStageFoldInputRefs
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
    case "construction_intent_step":
      return Object.freeze({
        kind: "construction_intent_step",
        outcome: runConstructionIntentStep(effect.request)
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
    case "construction_intent_step":
      return Object.freeze({
        kind: "construction_intent_step",
        outcome: await runConstructionIntentStepAsync(effect.request)
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
    runtimeRegistryStartup: request.runtimeRegistryStartup,
    instructionAssemblyStartup: request.instructionAssemblyStartup,
    plugins: request.plugins,
    maxAttachedFpAttempts: request.maxAttachedFpAttempts,
    assuranceProvider: request.assuranceProvider,
    targetCarrierDefaults: request.targetCarrierDefaults,
    abgFallbackBundle: request.abgFallbackBundle,
    pluginTraversalObserverFallbackEnabled:
      request.pluginTraversalObserverFallbackEnabled,
    pluginTraversalObserverFallbackKinds:
      request.pluginTraversalObserverFallbackKinds,
    constructionPressurePackage: request.constructionPressurePackage,
    pluginResultInterfaceCatalog: request.pluginResultInterfaceCatalog,
    requirementRouteDeclarationBundle: request.requirementRouteDeclarationBundle,
    executiveObserver: request.executiveObserver
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
    runtimeRegistryStartup: request.runtimeRegistryStartup,
    instructionAssemblyStartup: request.instructionAssemblyStartup,
    plugins: request.plugins,
    maxAttachedFpAttempts: request.maxAttachedFpAttempts,
    assuranceProvider: request.assuranceProvider,
    targetCarrierDefaults: request.targetCarrierDefaults,
    abgFallbackBundle: request.abgFallbackBundle,
    pluginTraversalObserverFallbackEnabled:
      request.pluginTraversalObserverFallbackEnabled,
    pluginTraversalObserverFallbackKinds:
      request.pluginTraversalObserverFallbackKinds,
    constructionPressurePackage: request.constructionPressurePackage,
    pluginResultInterfaceCatalog: request.pluginResultInterfaceCatalog,
    requirementRouteDeclarationBundle: request.requirementRouteDeclarationBundle,
    executiveObserver: request.executiveObserver
  });
}
