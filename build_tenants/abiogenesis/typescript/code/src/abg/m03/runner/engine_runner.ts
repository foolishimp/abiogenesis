// Implements: REQ-R-ABG3-INTERPRET
// Implements: REQ-R-ABG3-EVENTS
// Implements: REQ-R-ABG3-RUN
// Implements: REQ-R-ABG3-CONVERGENCE

import { constructFpDispatchOutcome, constructFpEvaluationOutcome } from "../contracts/plugins.js";
import { resolveHogProgram, hogStageByRole, assertHogProgramPlanExecutable } from "./hog_program_resolution.js";
import {
  buildCCallSpineClose,
  buildCCallSpineCloseOrResume,
  buildCCallSpineOpen,
  buildCCallSpineOpenOrResume,
  nextCCallAttempt,
  projectResumableCCallSpine
} from "./c_call_spine.js";
import { admitEngineCCallResumeAuthority } from "./c_call_resume_authority.js";
import { resolveHandlerForSelection, executeHandler, executeHandlerAsync, admitHandlerRegistry, assembleHandlerRegistry } from "./c_call_handlers.js";
import { resolveDeclaredPluginSelection, PLUGIN_SELECTION_SEAM_VALUES } from "../contracts/plugin_selection.js";
import { standardPluginCatalogWithCapabilities } from "./standard_live_plugins.js";
import type { EnginePluginCapabilities } from "./standard_live_plugins.js";
import type { CCallHandlerRegistry, CCallHandlerInterior } from "./c_call_handlers.js";
import type { HogProgramStage } from "../contracts/hog_program.js";
import {
  gtlDeclarationValueForKey,
  type GtlRegisteredDeclarationKeyForHostAndKind
} from "../../../gtl/m01/contracts/declaration_law.js";
import { admitExecutionBasis } from "../admission/index.js";
import type { ExecutionBasisAdmissionInput } from "../admission/index.js";
import type {
  AdvancementTransition,
  ActorInvocation,
  ActorInvocationRef,
  ExecutionBasis,
  GraphReentryPoint,
  PluginTraversalKind,
  RuntimeAggregateProjection,
  RuntimeEvent,
  TerminalTransition
} from "../contracts/carriers.js";
import { GRAPH_REENTRY_POINT_VALUES } from "../contracts/carriers.js";
import type { CCallJudgment } from "../contracts/carriers.js";
import {
  constructActorInvocationClosedEvent,
  constructActorInvocationStartedEvent,
  constructActorResultArtifactObservedEvent,
  actorResultArtifactDigestBasis,
  constructBasisAdmittedEvent,
  constructRunSegmentOpenedEvent,
  constructEvidenceAdmittedEvent,
  constructFdAuthorityOutcomeAdmittedEvent,
  constructFdAdvanceReadyEvent,
  constructFhEscalatedEvent,
  constructFpDispatchRequestedEvent,
  constructInstructionCausalContextBoundEvent,
  constructInstructionPromptManifestProjectedEvent,
  constructInstructionResponseContractAdmittedEvent,
  constructPayloadObservedEvent,
  constructPayloadValidatedEvent,
  constructPluginTraversalPromptMaterializedEvent,
  constructRuntimeFailureObservedEvent,
  constructTerminalReachedEvent,
  constructVectorClosedEvent,
  constructVectorEvaluatedEvent
} from "../contracts/event_factories.js";
import { assertCanonicalRuntimeEventSequence } from "../contracts/event_admission.js";
import { sortReplayByAdmissionOrdinalFailClosed } from "../contracts/admission_hygiene.js";
import {
  projectRuntimeCatalog,
  type AdmittedRuntimeCatalogBasis,
  type CatalogExecutionBinding
} from "../contracts/runtime_catalog.js";
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
  admitEnginePluginContract,
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
  type FpEvaluationOutcome,
  type FpEvaluatorPlugin,
  type FpDispatchOutcome,
  type FhAdmissionOutcome,
  type FhAdmissionPlugin,
  type FpDispatchPlugin
} from "../contracts/plugins.js";
import { bindFpTransformRequestResultContract } from "../contracts/fp_stages.js";
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
  loadGtlTargetCarrierDefaultsBundle
} from "../../../gtl/m01/contracts/index.js";
import { parsePlainObject } from "../../../shared/validation/primitives.js";
import {
  buildRequirementRouteRuntimeContextFromDeclarations,
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
  deriveBasisForkObligations,
  deriveDeclarationRepriceObligations
} from "../contracts/declaration_reprice.js";
import {
  deriveGoverningDeclarationSet,
  nextRunSegmentIndex
} from "../contracts/run_segments.js";
import {
  compactRenderedExcerpt,
  admitCompiledPromptPlanAtStartup,
  bindInstructionEnvelope,
  renderPromptManifest,
  type CompiledPromptPlan,
  type CompiledPromptPlanStartupAdmission,
  type PromptManifest,
  type RuntimeBindingFact
} from "../contracts/instruction_assembly.js";
import {
  constructDefaultInstructionAssemblyStartupForBasis
} from "../contracts/default_instruction_startup.js";
import {
  catalogExecutionBindingDeclaresExecutionContext,
  type DeclaredExecutionRequest
} from "../contracts/declared_execution_context.js";
import {
  assertTraversalExecutionRuntimeStart,
  type TraversalExecutionAdmissionRuntimeAddressable
} from "../contracts/traversal_execution_contract.js";
import type {
  ProjectExecutiveObservationViewInput
} from "../contracts/executive_observer.js";
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
import {
  emit,
  seedRuntimeEventAdmissionOrdinal,
  type RuntimeEventSink
} from "../events/index.js";
import {
  admitTemporalPropertyStartup,
  deriveTemporalVerdictEvents,
  temporalDispatchGateBlock,
  type TemporalPropertyStartupInput
} from "../contracts/temporal_property_runtime.js";
import {
  admitRequirementProofCarryThroughStartup,
  deriveRequirementPressureRefsForVector,
  type AdmittedRequirementProofCarryThroughStartup,
  type RequirementProofCarryThroughStartupInput
} from "../contracts/requirement_proof_carry_through_producer.js";
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
import {
  stableJson,
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";


export interface EngineIterateRequest {
  readonly basis: ExecutionBasis;
  readonly runtimeEvents?: readonly RuntimeEvent[] | undefined;
  readonly eventSink: RuntimeEventSink;
  readonly runtimeRegistryStartup?: RuntimeRegistryStartupInput | undefined;
  readonly runtimeCatalogBasis?: AdmittedRuntimeCatalogBasis | undefined;
  readonly declaredExecutionRequest?: DeclaredExecutionRequest | undefined;
  readonly traversalExecutionAdmission?:
    | TraversalExecutionAdmissionRuntimeAddressable
    | undefined;
  readonly temporalPropertyStartup?: TemporalPropertyStartupInput | undefined;
  readonly requirementProofCarryThroughStartup?:
    | RequirementProofCarryThroughStartupInput
    | undefined;
  readonly instructionAssemblyStartup?:
    | EngineInstructionAssemblyStartupInput
    | undefined;
  readonly plugins?: EngineRunnerPluginSet | undefined;
  // operator capability set for DECLARED live plugin selection (S2.3):
  // live catalog refs resolve only when their capability is injected.
  readonly pluginCapabilities?: EnginePluginCapabilities | undefined;
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

// ONE authority for the engine-start passthrough family. Every public seam
// (m04 start context, publicCallableStart, CLI runtime-binding parse) MUST
// consume EngineStartPassthroughFields + engineStartPassthrough() instead of
// hand-listing fields — hand-listed seams manufactured three forwarding
// defects (T-188 P1-b, m04 drop, CLI drop). New passthrough fields are added
// HERE (type + keys) and propagate everywhere.
export interface EngineStartPassthroughFields {
  readonly temporalPropertyStartup?: TemporalPropertyStartupInput | undefined;
  readonly runtimeRegistryStartup?: EngineIterateRequest["runtimeRegistryStartup"];
  readonly runtimeCatalogBasis?: EngineIterateRequest["runtimeCatalogBasis"];
  readonly instructionAssemblyStartup?: EngineIterateRequest["instructionAssemblyStartup"];
  readonly requirementProofCarryThroughStartup?: EngineIterateRequest["requirementProofCarryThroughStartup"];
  readonly requirementRouteDeclarationBundle?: EngineIterateRequest["requirementRouteDeclarationBundle"];
}

export const ENGINE_START_PASSTHROUGH_KEYS = Object.freeze([
  "temporalPropertyStartup",
  "runtimeRegistryStartup",
  "runtimeCatalogBasis",
  "instructionAssemblyStartup",
  "requirementProofCarryThroughStartup",
  "requirementRouteDeclarationBundle"
] as const) satisfies readonly (keyof EngineStartPassthroughFields)[];

export function engineStartPassthrough(
  source: EngineStartPassthroughFields
): EngineStartPassthroughFields {
  const forwarded: Record<string, unknown> = {};
  for (const key of ENGINE_START_PASSTHROUGH_KEYS) {
    if (source[key] !== undefined) {
      forwarded[key] = source[key];
    }
  }
  return forwarded;
}

export interface EngineStartRequest extends ExecutionBasisAdmissionInput {
  readonly runtimeEvents?: readonly RuntimeEvent[] | undefined;
  readonly eventSink: RuntimeEventSink;
  readonly runtimeRegistryStartup?: RuntimeRegistryStartupInput | undefined;
  readonly runtimeCatalogBasis?: AdmittedRuntimeCatalogBasis | undefined;
  readonly declaredExecutionRequest?: DeclaredExecutionRequest | undefined;
  readonly traversalExecutionAdmission?:
    | TraversalExecutionAdmissionRuntimeAddressable
    | undefined;
  readonly temporalPropertyStartup?: TemporalPropertyStartupInput | undefined;
  readonly requirementProofCarryThroughStartup?:
    | RequirementProofCarryThroughStartupInput
    | undefined;
  readonly instructionAssemblyStartup?:
    | EngineInstructionAssemblyStartupInput
    | undefined;
  readonly plugins?: EngineRunnerPluginSet | undefined;
  // operator capability set for DECLARED live plugin selection (S2.3):
  // live catalog refs resolve only when their capability is injected.
  readonly pluginCapabilities?: EnginePluginCapabilities | undefined;
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
  readonly handlerRegistry: CCallHandlerRegistry | null;
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
    handlerRegistry: plugins?.handlerRegistry ?? null,
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
  // campaign #16 (-004 at the invocation layer): attempt identity is
  // REPLAY-GLOBAL — max prior attemptIndex at this locus + 1, so a
  // resumed fresh window CONTINUES the numbering instead of colliding
  // (F7: max, not count — composed-batch vectors run one invocation
  // PER TASK within an attempt; counting rows would inflate).
  let maxAttempt = 0;
  for (const invocation of input.projection.actorInvocationRefs) {
    if (invocation.vectorIndex === input.vectorIndex && invocation.attemptIndex > maxAttempt) {
      maxAttempt = invocation.attemptIndex;
    }
  }
  return maxAttempt + 1;
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
  readonly runtimeCatalogBasis: AdmittedRuntimeCatalogBasis | undefined;
}): EngineInstructionAssemblyRuntime | null {
  if (input.startup === undefined) {
    return null;
  }
  const catalogEntries =
    input.runtimeCatalogBasis?.projection.runtimeRegistryProjection.entries ??
    Object.freeze([]);
  const startupEventRefs = Object.freeze(
    input.registryStartup?.admissionEvents.map((event) =>
      event.kind === "registry_entry_admitted"
        ? event.entryRef
        : event.declarationRef
    ) ?? catalogEntries.flatMap((entry) => entry.sourceEventRefs)
  );
  const registryEntryRefs = input.registryStartup?.admittedEntryRefs ??
    Object.freeze(catalogEntries.map((entry) => entry.entryRef));
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

function canonicalJsonContentFromDataUri(uri: string): string | null {
  const match =
    /^data:application\/json(?:;charset=utf-8)?,(.*)$/u.exec(uri);
  if (match === null) {
    return null;
  }
  const encoded = match[1];
  if (encoded === undefined) {
    return null;
  }
  try {
    return stableJson(JSON.parse(decodeURIComponent(encoded)));
  } catch {
    return null;
  }
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
  readonly carryThroughStartup: AdmittedRequirementProofCarryThroughStartup | undefined;
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
  for (const binding of input.basis.startIntent.inputBindings ?? []) {
    const content = canonicalJsonContentFromDataUri(binding.uri);
    facts.push(
      runtimeBindingFact({
        slotClass: "input_asset",
        ref: binding.assetRef,
        sourceEventRefs: [input.pluginInput.sourceProjectionRef],
        payloadDigest: stableSha256Digest({
          assetRef: binding.assetRef,
          assetType: binding.assetType,
          uri: binding.uri
        }),
        contentRef: binding.assetType,
        contentDigest: content === null ? null : stableSha256Digest(content),
        contentExcerpt: content
      })
    );
  }
  if (input.pluginInput.attachedResultArtifact !== null) {
    const artifactDigestBasis = actorResultArtifactDigestBasis(
      input.pluginInput.attachedResultArtifact
    );
    const content = stableJson(artifactDigestBasis);
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
        payloadDigest: stableSha256Digest(artifactDigestBasis),
        contentRef: input.pluginInput.actorInvocationRef?.resultRef ?? null,
        contentDigest: stableSha256Digest(content),
        // T-030 campaign bug #3a (second ceiling): the fact-construction
        // excerpt cap is PLAN POLICY (causalExcerptMaxChars), not 2400 —
        // the evaluator arm must be able to see candidate evidence
        // (stage/vector metadata, materialized files, post-materialization
        // validation), not just the assessment's opening characters.
        contentExcerpt: compactRenderedExcerpt(
          content,
          input.plan.causalExcerptMaxChars
        )
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
  // -007 (T-030 reopen): ENGINE-derived requirement pressure for the
  // current vector — active requirement ids, obligation projection refs,
  // owed obligation refs, and declared proof obligation refs, from admitted
  // route facts in replay plus the admitted carry-through startup. These
  // facts render into the prompt (abg.runtime.bound_refs) and surface on
  // the manifest as requirementPressureRefs; replay reconstructs them from
  // the same inputs.
  const pressureByRequirementId = deriveRequirementPressureRefsForVector({
    replayEvents: input.replayEvents,
    vectorIndex: input.transition.vectorIndex,
    startup: input.carryThroughStartup
  });
  for (const [, pressureRefs] of pressureByRequirementId) {
    for (const pressureRef of pressureRefs) {
      facts.push(
        runtimeBindingFact({
          slotClass: "requirement_pressure",
          ref: pressureRef,
          sourceEventRefs: [input.pluginInput.sourceProjectionRef]
        })
      );
    }
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
      readonly plan: CompiledPromptPlan;
    };

function instructionAssemblyBindingBlockReason(
  binding: Extract<InstructionAssemblyFpBinding, { readonly kind: "blocked" | "not_configured" }>
): string {
  return binding.kind === "not_configured"
    ? "instruction assembly startup is absent for F_P dispatch"
    : binding.reason;
}

// T-190: the F_P dispatch-arm registry. The census is the BIND PATH —
// every bindInstructionAssemblyForFpEffect call names a registered arm and
// an unregistered armId throws before any manifest can bind; since T-189
// law blocks dispatch without binding, an unregistered arm cannot dispatch
// at all. New F_P-capable arms are added HERE, which forces the runtime
// enumeration test (classification-table set equality) red until the arm
// carries a runtime proof or a typed exemption.
export const ENGINE_FP_DISPATCH_ARM_IDS = Object.freeze([
  "scalar_transform",
  "scalar_evaluate",
  "composed_transform",
  "composed_consequence",
  "evaluation_rule_batch",
  "evaluation_rule_evaluate_singular"
] as const);

export type EngineFpDispatchArmId = (typeof ENGINE_FP_DISPATCH_ARM_IDS)[number];

function assertEngineFpDispatchArmId(armId: string): EngineFpDispatchArmId {
  const match = ENGINE_FP_DISPATCH_ARM_IDS.find(
    (registered): boolean => registered === armId
  );
  if (match === undefined) {
    throw new TypeError(
      `unregistered F_P dispatch arm: ${armId} — register it in ENGINE_FP_DISPATCH_ARM_IDS and add a runtime proof or typed exemption (T-190)`
    );
  }
  return match;
}

function bindInstructionAssemblyForFpEffect(input: {
  readonly armId: EngineFpDispatchArmId;
  readonly runtime: EngineInstructionAssemblyRuntime | null;
  readonly basis: ExecutionBasis;
  readonly transition: InstructionAssemblyTransitionScope;
  readonly computeStageRole: "transform" | "evaluate" | "consequence" | "human_callout";
  readonly actorInvocation: ActorInvocation;
  readonly pluginInput: EnginePluginInput;
  readonly projection: RuntimeAggregateProjection;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly carryThroughStartup: AdmittedRequirementProofCarryThroughStartup | undefined;
}): InstructionAssemblyFpBinding {
  assertEngineFpDispatchArmId(input.armId);
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
    plan: row.plan,
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

function bindInstructionPromptManifest(
  input: EnginePluginInput,
  instructionPromptManifest: PromptManifest
): EnginePluginInput {
  const selectedResultContractRef =
    instructionPromptManifest.selectedOutputContractRef;
  return Object.freeze({
    ...input,
    instructionPromptManifest,
    fpTransformRequest:
      input.fpTransformRequest === null || selectedResultContractRef === null
        ? input.fpTransformRequest
        : bindFpTransformRequestResultContract(
            input.fpTransformRequest,
            selectedResultContractRef
          )
  });
}

function bindPluginInputToCCall(
  input: EnginePluginInput,
  cCallRef: string,
  instructionPromptManifest: PromptManifest,
  resumeExistingCCall: boolean
): EnginePluginInput {
  const manifestBound = bindInstructionPromptManifest(
    input,
    instructionPromptManifest
  );
  const bound = Object.freeze({
    ...manifestBound,
    cCallRef
  });
  return resumeExistingCCall
    ? admitEngineCCallResumeAuthority(bound)
    : bound;
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

function livePluginArchiveRefusalClass(
  outcome: { readonly evidenceRefs: readonly string[] }
): string | null {
  const prefix = "live-plugin-archive-refusal:";
  return (
    outcome.evidenceRefs
      .find((ref) => ref.startsWith(prefix))
      ?.slice(prefix.length) ?? null
  );
}

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


function uniqueStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)]);
}

function evaluationRuleOutcomeHasRetryContinuation(
  outcome: EvaluationRuleOutcome
): boolean {
  return outcome.status === "blocked" && outcome.continuationRefs.length > 0;
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
      input.outcome.status === "dispatched"
        ? uniqueStrings([
            input.outcome.resultRef,
            ...(input.pluginInput.fpTransformRequest === null
              ? []
              : [input.pluginInput.fpTransformRequest.resultRef]),
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










function canonicalReplayEvents(
  events: readonly RuntimeEvent[]
): readonly RuntimeEvent[] {
  assertCanonicalRuntimeEventSequence(
    events,
    "EngineIterateRequest.runtimeEvents"
  );
  // REPLAY INGEST LAW (dual review 2026-07-10): every downstream fold
  // reads array order as admission order — sort here, fail closed on
  // ordinal collisions (unorderable truth from overlapping writers).
  return sortReplayByAdmissionOrdinalFailClosed(
    events,
    "EngineIterateRequest.runtimeEvents"
  );
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
  // T-195 P0-1: terminals in this lane go through the ONE choke point so
  // the temporal property set judges them (verdict batch included).
  readonly emitTerminal: (
    state: EngineEventEmissionState,
    events: RuntimeEvent | readonly RuntimeEvent[]
  ) => EngineEventEmissionState;
}): {
  readonly eventState: EngineEventEmissionState;
  readonly result: EngineIterateResult;
} {
  const blocked = terminalTransition(input.request.basis, "gap_stop", input.reason);
  const eventState = input.emitTerminal(
    input.eventState,
    constructTerminalReachedEvent(blocked)
  );
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

function registryEntriesForExecutionBasis(input: {
  readonly entries: readonly RuntimeRegistryEntryProjection[];
  readonly basis: ExecutionBasis;
}): readonly RuntimeRegistryEntryProjection[] {
  return Object.freeze(
    input.entries.filter(
      (entry) =>
        entry.entryKind === "graph_function" &&
        selectedGraphFunctionRefMatchesBasis({
          selectedGraphFunctionRef: entry.graphFunctionRef,
          basis: input.basis
        })
    )
  );
}

function graphVectorDeclarationScalar(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly key: GtlRegisteredDeclarationKeyForHostAndKind<
    "graph_vector",
    "scalar"
  >;
}): string | null {
  const vector = input.basis.graph.vectors[input.vectorIndex];
  if (vector === undefined) {
    return null;
  }
  const value = gtlDeclarationValueForKey(
    vector.declarations,
    input.key,
    "scalar"
  );
  return value?.kind === "scalar" && typeof value.value === "string"
    ? value.value
    : null;
}

function graphVectorDeclarationStringList(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly key: GtlRegisteredDeclarationKeyForHostAndKind<
    "graph_vector",
    "string_list"
  >;
}): readonly string[] | null {
  const vector = input.basis.graph.vectors[input.vectorIndex];
  if (vector === undefined) {
    return null;
  }
  const value = gtlDeclarationValueForKey(
    vector.declarations,
    input.key,
    "string_list"
  );
  return value?.kind === "string_list"
    ? Object.freeze([...value.value])
    : null;
}

function runtimeRegistryLookupBoundary(input: {
  readonly basis: ExecutionBasis;
  readonly transition: Exclude<AdvancementTransition, { readonly kind: "terminal" }>;
}): Omit<Parameters<typeof constructRegistryLookupRequest>[0], "lookupRef" | "entryKinds"> {
  const vectorIndex = input.transition.vectorIndex;
  const scalar = (
    key: GtlRegisteredDeclarationKeyForHostAndKind<"graph_vector", "scalar">
  ): string | null =>
    graphVectorDeclarationScalar({
      basis: input.basis,
      vectorIndex,
      key
    });
  const stringList = (
    key: GtlRegisteredDeclarationKeyForHostAndKind<"graph_vector", "string_list">
  ): readonly string[] =>
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
  const basisEntries = registryEntriesForExecutionBasis({
    entries: projection.entries,
    basis: input.basis
  });
  if (basisEntries.length === 0) {
    throw new TypeError(
      `Runtime registry startup requires a registered graph_function entry for ${input.basis.graphFunction.id}`
    );
  }
  // AMBIGUITY IS NOT AUTHORITY: with multiple basis-matching entries the
  // runner asserts NO pre-picked candidate — the selection contract's pick
  // law decides (a declared candidate constraint may lawfully resolve to
  // one eligible entry; unauthorized ambiguity fails closed with a
  // replay-visible graph_function_selection_rejected). A single match is
  // asserted as before.
  const selectedEntry = basisEntries.length === 1 ? basisEntries[0] ?? null : null;

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
    selectedEntryRef: selectedEntry?.entryRef ?? basisEntries[0]?.entryRef ?? null,
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
    ...(selectedEntry === null
      ? {}
      : { abgSelectedCandidateRef: selectedEntry.entryRef }),
    causationEventRefs: projection.sourceEventRefs,
    correlationId: `correlation://runtime-registry-selection/${digest}`
  });
  if (selection.kind === "graph_function_selected") {
    assertGraphFunctionInvocationSelected({
      events: [...input.replayEvents, selection],
      runtimeBasisRef,
      graphFunctionRef: selection.selectedGraphFunctionRef,
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

  // This legacy ExecutionBasis-owned path cannot name the admitted One Surface
  // program and workspace-binding digests. It therefore emits no observation
  // materialization event; the One Surface path owns that scoped event.
  return Object.freeze([
    Object.freeze({
      ...scope(0, "episode-started"),
      kind: "construction_episode_started",
      startProjectionRef: input.observation.currentProjectionRef
    }),
    Object.freeze({
      ...scope(1, "action-catalog-projected"),
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
      ...scope(2, "evaluator-invoked"),
      kind: "construction_evaluator_invoked",
      observationId: input.observation.observationId,
      catalogRef: input.actionCatalog.catalogRef,
      evaluatorPluginRef: "consequence_projection",
      inputDigest: `consequence-construction-input:${input.digest}`
    }),
    Object.freeze({
      ...scope(3, "candidate-returned"),
      kind: "construction_intent_candidate_returned",
      evaluatorPluginRef: "consequence_projection",
      evaluatorOutcomeRef: input.evaluatorOutcomeRef,
      candidateSetDigest: `consequence-construction-candidates:${input.digest}`,
      candidateRefs: [input.candidateId]
    }),
    Object.freeze({
      ...scope(4, "candidate-admitted"),
      kind: "construction_intent_candidate_admitted",
      candidateId: input.candidateId,
      admissionRef: input.admission.admissionRef,
      intentId: admittedIntent.intentId,
      authorityRefs: admittedIntent.authorityRefs
    }),
    Object.freeze({
      ...scope(5, "intent-selected"),
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
  readonly emitTerminal: (
    state: EngineEventEmissionState,
    events: RuntimeEvent | readonly RuntimeEvent[]
  ) => EngineEventEmissionState;
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
      iterationCount: input.iterationCount,
      emitTerminal: input.emitTerminal
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
        graphTemporalPropertyStartup: input.request.temporalPropertyStartup,
        graphRequirementProofCarryThroughStartup:
          input.request.requirementProofCarryThroughStartup,
        graphRequirementRouteDeclarationBundle:
          input.request.requirementRouteDeclarationBundle,
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
  readonly vectorIndex: number;
}): {
  readonly eventState: EngineEventEmissionState;
  readonly result: EngineIterateResult;
} {
  let eventState = appendAlreadyEmittedEngineRunnerEvents({
    state: input.preludeState,
    events: input.constructionOutcome.emittedEvents
  });
  // T-200 P2f (REQ-R-ABG3-CCALL-013): the consumed construction traversal
  // is a TRANSPARENT-boundary C call — the child is the same monad one
  // level down; its identity and terminal enter the parent's replay as
  // sub_traversal evidence on a consequence-role spine (taskOrdinal 0
  // distinguishes it from the scalar consequence call at the same locus).
  {
    const innerTransition =
      input.constructionOutcome.graphActionResult.transition;
    const innerTerminalKind =
      "terminalKind" in innerTransition
        ? String(innerTransition.terminalKind)
        : innerTransition.kind;
    const subTraversalSpine = buildCCallSpineOpen({
      basisId: input.request.basis.id,
      graphFunctionId: input.request.basis.graphFunction.id,
      graphCallId: graphCallIdForBasis(input.request.basis),
      frameId: frameIdForBasis(input.request.basis),
      edge: "consequence_traversal",
      vectorIndex: input.vectorIndex,
      stageRole: "consequence",
      taskOrdinal: 0,
      attempt: nextCCallAttempt(input.preludeState.replayEvents, {
        basisId: input.request.basis.id,
        graphCallId: graphCallIdForBasis(input.request.basis),
        frameId: frameIdForBasis(input.request.basis),
        vectorIndex: input.vectorIndex,
        stageRole: "consequence",
        taskOrdinal: 0
      }),
      batchRef: null,
      regime: "F_D",
      armId: "construction_intent_step",
      programRef: resolveHogProgram(
        input.request.basis.compiledExecutionDeclarations.hogProgramPlan
      ).program.programRef
    });
    eventState = appendAlreadyEmittedEngineRunnerEvents({
      state: eventState,
      events: emit(
        [
          ...subTraversalSpine.events,
          ...buildCCallSpineClose({
            cCallRef: subTraversalSpine.cCallRef,
            basisId: input.request.basis.id,
            evidenceClass: "sub_traversal",
            evidenceRefs: [
              `sub-traversal:${input.request.basis.id}`,
              `iteration:${String(input.iterationCount)}:inner:${String(
                input.constructionOutcome.graphActionResult.iterationCount
              )}`,
              `terminal:${innerTerminalKind}`
            ],
            outcomeStatus: innerTerminalKind,
            payloadRef: null,
            responseContractRef: null,
            judgment:
              innerTerminalKind === "converged" ||
              innerTerminalKind === "traversal_applied" ||
              innerTerminalKind === "nothing_to_do"
                ? "advance"
                : "blocked",
            reasonRef: null
          })
        ],
        (event) => {
          void event;
        }
      )
    });
  }
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
    }
  | {
      readonly kind: "c_call_handler_execute";
      readonly programRef: string;
      readonly stage: HogProgramStage;
      readonly declaredConfig: unknown;
      readonly workProjection: unknown;
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
    }
  | {
      readonly kind: "c_call_handler_execute";
      readonly interior: CCallHandlerInterior;
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
    case "c_call_handler_execute":
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
    case "c_call_handler_execute":
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
    case "c_call_handler_execute":
      throw new TypeError(
        "Engine plugin effect expected evaluation_rule_batch_evaluate"
      );
  }
}


// T-200 P4: a throwing plugin is a fibre failure, not an engine death —
// it becomes a blocked outcome whose reason carries the typed class
// (contract_failure: allowlisted, retry law decides) so EVERY arm routes
// identically through the ordinary blocked exits.
function blockedReasonForPluginThrow(label: string, error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return `${label} threw (contract_failure): ${message.slice(0, 300)}`;
}

function guardedSync<T>(label: string, run: () => T, blocked: (reason: string) => T): T {
  try {
    return run();
  } catch (error) {
    return blocked(blockedReasonForPluginThrow(label, error));
  }
}

async function guardedAsync<T>(label: string, run: () => Promise<T> | T, blocked: (reason: string) => T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    return blocked(blockedReasonForPluginThrow(label, error));
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
    case "c_call_handler_execute":
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
    case "c_call_handler_execute":
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
    case "c_call_handler_execute":
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
    case "c_call_handler_execute":
      throw new TypeError("Engine plugin effect expected construction_intent_step");
  }
}

// T-205 B3: extra declared stages run spine-enclosed at their anchor.
// Each: open via the spine authority -> yield the handler effect ->
// close from the interior (executed -> advance; anything else ->
// blocked, and the run stops lawfully at the caller).

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

  // Implements: REQ-L-GTL3-TEMPORAL-PROPERTIES-006/-008 — verdicts for the
  // full declared property set are derived and emitted immediately before
  // ANY terminal event (one choke point covers every terminal site);
  // completed terminals decide future obligations, others leave liveness
  // undetermined (residual interpretation, never a block).
  const temporalStartupAdmission = admitTemporalPropertyStartup(
    request.temporalPropertyStartup ?? { rules: [] }
  );
  const temporalProperties = temporalStartupAdmission.properties;
  const emitRunnerEvents = (
    state: EngineEventEmissionState,
    events: RuntimeEvent | readonly RuntimeEvent[]
  ): EngineEventEmissionState => {
    let toEmit: RuntimeEvent | readonly RuntimeEvent[] = events;
    if (temporalProperties.length > 0) {
      const list: readonly RuntimeEvent[] = Array.isArray(events)
        ? events
        : [events];
      const terminal = list.find((event) => event.kind === "terminal_reached");
      // Yields are pauses, not judgments: no verdict batch per yield
      // (checkpoint-2 noise guard); every non-yield terminal judges.
      if (
        terminal !== undefined &&
        terminal.kind === "terminal_reached" &&
        terminal.terminalKind !== "yielded"
      ) {
        const completed =
          terminal.terminalKind === "traversal_applied" ||
          terminal.terminalKind === "converged";
        toEmit = [
          ...deriveTemporalVerdictEvents({
            properties: temporalProperties,
            events: state.replayEvents,
            completed,
            basis: request.basis,
            runId: request.basis.runId ?? null,
            workKey: request.basis.workKey ?? null,
            evaluationPoint: `terminal:${terminal.terminalKind}`
          }),
          ...list
        ];
      }
    }
    return appendEngineRunnerEvents({
      state,
      events: toEmit,
      sink: request.eventSink
    });
  };
  // ONE fail-closed startup realization (T-205 review round 3): an
  // inadmissible-at-entry surface becomes typed gap_stop truth — never a
  // host exception, never a half-opened spine. Each admission below asks a
  // DIFFERENT question; this helper is the single home for the terminal
  // realization they share (third recurrence forced the extraction).
  const failClosedStartupResult = (
    reason: string,
    extraEvents: readonly RuntimeEvent[] = []
  ): EngineIterateResult => {
    const blocked = terminalTransition(request.basis, "gap_stop", reason);
    eventState = emitRunnerEvents(eventState, [
      ...extraEvents,
      constructTerminalReachedEvent(blocked)
    ]);
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
  };
  // T-205 B2 (HANDLERS-012; codex review HIGH): the run's program is
  // admitted at ENTRY.
  try {
    if (plugins.handlerRegistry !== null) {
      const registryAdmission = admitHandlerRegistry(plugins.handlerRegistry);
      if (!registryAdmission.accepted) {
        throw new TypeError(
          `handler_registry_inadmissible: ${registryAdmission.issues.join("; ")}`
        );
      }
    }
    assertHogProgramPlanExecutable(
      request.basis.compiledExecutionDeclarations.hogProgramPlan,
      plugins.handlerRegistry
    );
  } catch (error) {
    const message = (error instanceof Error ? error.message : String(error)).slice(0, 300);
    return failClosedStartupResult(`hog_program_unresolvable: ${message}`, [
      constructRuntimeFailureObservedEvent({
        basisId: request.basis.id,
        surface: "hog_program_resolution",
        failureClass: "contract_failure",
        message,
        stackExcerpt: null
      })
    ]);
  }
  if (!temporalStartupAdmission.accepted) {
    // REQ -009: an unlawful property set never runs.
    return failClosedStartupResult(
      `temporal property startup rejected: ${temporalStartupAdmission.issues
        .map((row) => row.issueKind)
        .join(",")}`
    );
  }

  const carryThroughStartupAdmission = admitRequirementProofCarryThroughStartup(
    request.requirementProofCarryThroughStartup
  );
  if (!carryThroughStartupAdmission.accepted) {
    // T-205 carry-through applicability: the startup family is deep-admitted
    // ONCE here; producer emission and edge-close owedness accept only the
    // ADMITTED carrier below. The reason joins the CLOSED issueKind
    // vocabulary (locus:kind), not prose.
    return failClosedStartupResult(
      `requirement proof carry-through startup rejected: ${carryThroughStartupAdmission.issues
        .map((row) => `${row.at}:${row.issueKind}`)
        .join(",")}`
    );
  }
  const admittedCarryThroughStartup = carryThroughStartupAdmission.admitted;

  const isResumedInvocation = hasBasisAdmittedEvent(
    request.basis,
    eventState.replayEvents
  );
  if (!isResumedInvocation) {
    // WITNESS-003 (S5, the basis-fork witness): a NEW basis entering a
    // spine that already ran under a different basis identity is a
    // policy/binding fork — inadmissible without a covering reprice
    // (declarationRef = spineRef, digests = the basisId pair). The scan
    // reads the RAW request events: the ingress filter is basis-scoped
    // and prior spines are cross-basis by definition. Blocked BEFORE the
    // new basis_admitted is emitted (no fork laundering).
    const forkObligations = deriveBasisForkObligations({
      priorEvents: request.runtimeEvents ?? Object.freeze([]),
      enteringBasis: {
        basisId: request.basis.id,
        graphFunctionId: request.basis.graphFunction.id,
        jobId: request.basis.job.id,
        runId: request.basis.runId,
        workKey: request.basis.workKey
      }
    });
    if (forkObligations.uncoveredForkRows.length > 0) {
      return failClosedStartupResult(
        `basis_fork_detected: ${forkObligations.uncoveredForkRows
          .map((row) => row.spineRef)
          .join(",")}`
      );
    }
    eventState = emitRunnerEvents(
      eventState,
      constructBasisAdmittedEvent(request.basis)
    );
  }
  let registryStartup: RuntimeRegistryStartupAdmissionResult | null = null;
  if (request.runtimeRegistryStartup !== undefined) {
    const replayEventsBeforeRegistryStartup = eventState.replayEvents;
    registryStartup = admitRuntimeGraphFunctionRegistryStartup(
      request.runtimeRegistryStartup
    );
    // WITNESS-003: resumed declaration drift requires an admitted covering
    // reprice (exact digest pair). The block happens BEFORE the drifted
    // admission events reach the store — emitting first would make the new
    // digest the prior digest and launder the drift on the next resume.
    const repriceObligations = deriveDeclarationRepriceObligations({
      priorEvents: replayEventsBeforeRegistryStartup,
      startupAdmissionEvents: registryStartup.admissionEvents
    });
    if (repriceObligations.identityConflictRows.length > 0) {
      // Review fix (2026-07-09, S1 F1): ambiguous current identity blocks
      // outright — reprice coverage presupposes ONE current digest.
      return failClosedStartupResult(
        `declaration_identity_conflict: ${repriceObligations.identityConflictRows
          .map((row) => row.declarationRef)
          .join(",")}`
      );
    }
    if (repriceObligations.uncoveredDriftRows.length > 0) {
      return failClosedStartupResult(
        `declaration_reprice_required: ${repriceObligations.uncoveredDriftRows
          .map((row) => row.declarationRef)
          .join(",")}`
      );
    }
    if (registryStartup.admissionEvents.length > 0) {
      eventState = emitRunnerEvents(eventState, registryStartup.admissionEvents);
    }
  }
  // WITNESS-005: each RESUMED lawful invocation opens a substrate-stamped
  // segment — runtime identity + the governing declaration digest set —
  // AFTER the reprice guard (a blocked entry is not a segment). A fresh
  // start's substrate is witnessed by its own startup admission events;
  // the stamp exists to decompose MIXED-substrate runs, and mixing begins
  // at the first resume. Segment windows feed the frozen-law predicate
  // per proving span. The governing set derives from the FULL replay so
  // far (S2 review P1: a resume without a fresh startup batch stamps the
  // replay-derived governing truth, never an empty set; latest digest per
  // declarationRef wins, so a covered reprice stamps its new digest).
  if (isResumedInvocation) {
    const governingSet = deriveGoverningDeclarationSet(
      eventState.replayEvents
    );
    eventState = emitRunnerEvents(
      eventState,
      constructRunSegmentOpenedEvent({
        basisId: request.basis.id,
        runId: request.basis.runId,
        workKey: request.basis.workKey,
        segmentIndex: nextRunSegmentIndex(
          eventState.replayEvents,
          request.basis.id
        ),
        workerId: request.basis.runtimeIdentity.workerId,
        backendId: request.basis.runtimeIdentity.backendId,
        buildId: request.basis.runtimeIdentity.buildId,
        resolvedRuntimeRef: request.basis.runtimeIdentity.resolvedRuntimeRef,
        declarationSetDigest: governingSet.declarationSetDigest,
        declarationCount: governingSet.declarationCount
      })
    );
  }
  const instructionAssemblyRuntime = instructionAssemblyRuntimeForStartup({
    startup: request.instructionAssemblyStartup,
    registryStartup,
    runtimeCatalogBasis: request.runtimeCatalogBasis
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
            cCallRef?: string;
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
                armId: "evaluation_rule_batch",
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
                replayEvents: eventState.replayEvents,
          carryThroughStartup: admittedCarryThroughStartup
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
              ruleInput = bindInstructionPromptManifest(
                ruleInput,
                ruleInstructionBinding.manifest
              );
            }
            plannedBatchWithInputs.push({
              declaration,
              plannedRule,
              ruleInput,
              actorInvocation: ruleActorInvocation
            });
            // T-200 P3-C: spine per invoking evaluation-rule task (-005);
            // the rule batch is the evaluate stage's task family.
            {
              const ruleTaskSpine = buildCCallSpineOpen({
                basisId: request.basis.id,
                graphFunctionId: ruleActorInvocation?.graphFunctionId ?? transition.basis.graphFunction.id,
                graphCallId: ruleActorInvocation?.graphCallId ?? graphCallIdForBasis(transition.basis),
                frameId: ruleActorInvocation?.frameId ?? frameIdForBasis(transition.basis),
                edge: transition.edge,
                vectorIndex: transition.vectorIndex,
                stageRole: "evaluate",
                taskOrdinal: plannedRule.pluginIndex,
                attempt: nextCCallAttempt(eventState.replayEvents, {
                  basisId: request.basis.id,
                  graphCallId: ruleActorInvocation?.graphCallId ?? graphCallIdForBasis(transition.basis),
                  frameId: ruleActorInvocation?.frameId ?? frameIdForBasis(transition.basis),
                  vectorIndex: transition.vectorIndex,
                  stageRole: "evaluate",
                  taskOrdinal: plannedRule.pluginIndex
                }),
                batchRef: `batch:${request.basis.id}:${transition.vectorIndex}:evaluate`,
                regime: ruleInput.regime,
                armId: "evaluation_rule_batch",
                programRef: resolveHogProgram(
                  transition.basis.compiledExecutionDeclarations.hogProgramPlan
                ).program.programRef
              });
              eventState = emitRunnerEvents(eventState, ruleTaskSpine.events);
            {
              const plannedEntry = plannedBatchWithInputs[plannedBatchWithInputs.length - 1];
              if (plannedEntry !== undefined) {
                plannedEntry.cCallRef = ruleTaskSpine.cCallRef;
              }
            }
            }
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
            {
              const ruleTaskRef = plannedBatchWithInputs[index]?.cCallRef;
              if (ruleTaskRef === undefined) {
                throw new TypeError("rule task spine ref must be threaded from open");
              }
              eventState = emitRunnerEvents(eventState, buildCCallSpineClose({
                cCallRef: ruleTaskRef,
                basisId: request.basis.id,
                evidenceClass: ruleInput.regime === "F_P" ? "fp_interior" : "fd_interior",
                evidenceRefs: [ruleInput.sourceProjectionRef],
                outcomeStatus: ruleOutcome.status,
                payloadRef: null,
                responseContractRef: null,
                judgment: ruleOutcome.status === "blocked" ? "blocked" : "advance",
                reasonRef: null
              }));
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
        // T-205 B4: the F_D MECHANICAL TRANSFORM C call — on a
        // deterministic edge the transform IS the source-projection
        // derivation (a total function over replay: F_D by the totality
        // law). No worker, no dispatch; the spine makes the degenerate
        // transform visible and accountable. Same stage shape as the
        // F_P bracket — only the fibre differs (-007).
        const fdHogProgram = resolveHogProgram(
          transition.basis.compiledExecutionDeclarations.hogProgramPlan
        );
        {
          const fdTransformStage = hogStageByRole(fdHogProgram, "transform");
          if (fdTransformStage === null) {
            throw new TypeError(`hog program ${fdHogProgram.program.programRef} must declare a transform stage`);
          }
          const fdTransformSpine = buildCCallSpineOpen({
            basisId: request.basis.id,
            graphFunctionId: transition.basis.graphFunction.id,
            graphCallId: graphCallIdForBasis(transition.basis),
            frameId: frameIdForBasis(transition.basis),
            edge: transition.edge,
            vectorIndex: transition.vectorIndex,
            stageRole: fdTransformStage.stageRole,
            taskOrdinal: null,
            attempt: nextCCallAttempt(eventState.replayEvents, {
              basisId: request.basis.id,
              graphCallId: graphCallIdForBasis(transition.basis),
              frameId: frameIdForBasis(transition.basis),
              vectorIndex: transition.vectorIndex,
              stageRole: fdTransformStage.stageRole,
              taskOrdinal: null
            }),
            batchRef: null,
            regime: "F_D",
            armId: fdTransformStage.armId,
            programRef: fdHogProgram.program.programRef
          });
          eventState = emitRunnerEvents(eventState, fdTransformSpine.events);
          eventState = emitRunnerEvents(eventState, buildCCallSpineClose({
            cCallRef: fdTransformSpine.cCallRef,
            basisId: request.basis.id,
            evidenceClass: "fd_interior",
            evidenceRefs: [scalarFdEvaluationInput.sourceProjectionRef],
            outcomeStatus: "executed",
            payloadRef: null,
            responseContractRef: null,
            judgment: "advance",
            reasonRef: null
          }));
        }
        // T-200 P2d: the F_D evaluate C call — the same evaluate stage
        // role running the F_D fibre (live substitution: spine shape
        // identical to the F_P bracket, only the selection row differs).
        const fdEvaluateStage = hogStageByRole(fdHogProgram, "evaluate");
        if (fdEvaluateStage === null) {
          throw new TypeError(`hog program ${fdHogProgram.program.programRef} must declare an evaluate stage`);
        }
        const fdEvaluateSpine = buildCCallSpineOpen({
          basisId: request.basis.id,
          graphFunctionId: transition.basis.graphFunction.id,
          graphCallId: graphCallIdForBasis(transition.basis),
          frameId: frameIdForBasis(transition.basis),
          edge: transition.edge,
          vectorIndex: transition.vectorIndex,
          stageRole: fdEvaluateStage.stageRole,
          taskOrdinal: null,
          attempt: nextCCallAttempt(eventState.replayEvents, {
            basisId: request.basis.id,
            graphCallId: graphCallIdForBasis(transition.basis),
            frameId: frameIdForBasis(transition.basis),
            vectorIndex: transition.vectorIndex,
            stageRole: fdEvaluateStage.stageRole,
            taskOrdinal: null
          }),
          batchRef: null,
          regime: "F_D",
          armId: fdEvaluateStage.armId,
          programRef: fdHogProgram.program.programRef
        });
        const fdEvaluateCCallOpened = fdEvaluateSpine.opened;
        eventState = emitRunnerEvents(eventState, fdEvaluateSpine.events);
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
        eventState = emitRunnerEvents(eventState, buildCCallSpineClose({
          cCallRef: fdEvaluateCCallOpened.cCallRef,
          basisId: request.basis.id,
          evidenceClass: "fd_interior",
          evidenceRefs: [scalarFdEvaluationInput.sourceProjectionRef],
          outcomeStatus: outcome.status,
          payloadRef: null,
          responseContractRef: null,
          judgment: outcome.status === "accepted" ? "advance" : "blocked",
          reasonRef: null
        }));
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
            cCallRef?: string;
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
                armId: "composed_consequence",
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
                replayEvents: eventState.replayEvents,
          carryThroughStartup: admittedCarryThroughStartup
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
              taskInput = bindInstructionPromptManifest(
                taskInput,
                taskInstructionBinding.manifest
              );
            }
            plannedBatchWithInputs.push({
              declaration,
              plannedTask,
              taskInput,
              actorInvocation: taskActorInvocation
            });
            // T-200 P2e: spine per invoking batch task (-005); identity is
            // deterministic (-004) so the close re-mints, no tracker.
            {
              const batchTaskSpine = buildCCallSpineOpen({
                basisId: request.basis.id,
                graphFunctionId: taskActorInvocation?.graphFunctionId ?? transition.basis.graphFunction.id,
                graphCallId: taskActorInvocation?.graphCallId ?? graphCallIdForBasis(transition.basis),
                frameId: taskActorInvocation?.frameId ?? frameIdForBasis(transition.basis),
                edge: transition.edge,
                vectorIndex: transition.vectorIndex,
                stageRole: "consequence",
                taskOrdinal: plannedTask.pluginIndex,
                attempt: nextCCallAttempt(eventState.replayEvents, {
                  basisId: request.basis.id,
                  graphCallId: taskActorInvocation?.graphCallId ?? graphCallIdForBasis(transition.basis),
                  frameId: taskActorInvocation?.frameId ?? frameIdForBasis(transition.basis),
                  vectorIndex: transition.vectorIndex,
                  stageRole: "consequence",
                  taskOrdinal: plannedTask.pluginIndex
                }),
                batchRef: `batch:${request.basis.id}:${transition.vectorIndex}:consequence`,
                regime: taskInput.regime,
                armId: "composed_consequence",
    programRef: resolveHogProgram(
      transition.basis.compiledExecutionDeclarations.hogProgramPlan
    ).program.programRef
              });
              eventState = emitRunnerEvents(eventState, batchTaskSpine.events);
            {
              const plannedEntry = plannedBatchWithInputs[plannedBatchWithInputs.length - 1];
              if (plannedEntry !== undefined) {
                plannedEntry.cCallRef = batchTaskSpine.cCallRef;
              }
            }
            }
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
            {
              const batchTaskRef = plannedBatchWithInputs[index]?.cCallRef;
              if (batchTaskRef === undefined) {
                throw new TypeError("batch task spine ref must be threaded from open");
              }
              eventState = emitRunnerEvents(eventState, buildCCallSpineClose({
                cCallRef: batchTaskRef,
                basisId: request.basis.id,
                evidenceClass: taskInput.regime === "F_P" ? "fp_interior" : "fd_interior",
                evidenceRefs: [taskInput.sourceProjectionRef],
                outcomeStatus: taskOutcome.status,
                payloadRef: null,
                responseContractRef: null,
                judgment: taskOutcome.status === "blocked" ? "blocked" : "advance",
                reasonRef: null
              }));
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
        // T-200 P2d: the consequence C call — the triple's third stage.
        const consequenceHogProgram = resolveHogProgram(
          transition.basis.compiledExecutionDeclarations.hogProgramPlan
        );
        const consequenceCCallStage = hogStageByRole(consequenceHogProgram, "consequence");
        if (consequenceCCallStage === null) {
          throw new TypeError(`hog program ${consequenceHogProgram.program.programRef} must declare a consequence stage`);
        }
        const consequenceSpine = buildCCallSpineOpen({
          basisId: request.basis.id,
          graphFunctionId: transition.basis.graphFunction.id,
          graphCallId: graphCallIdForBasis(transition.basis),
          frameId: frameIdForBasis(transition.basis),
          edge: transition.edge,
          vectorIndex: transition.vectorIndex,
          stageRole: consequenceCCallStage.stageRole,
          taskOrdinal: null,
          attempt: nextCCallAttempt(eventState.replayEvents, {
            basisId: request.basis.id,
            graphCallId: graphCallIdForBasis(transition.basis),
            frameId: frameIdForBasis(transition.basis),
            vectorIndex: transition.vectorIndex,
            stageRole: consequenceCCallStage.stageRole,
            taskOrdinal: null
          }),
          batchRef: null,
          regime: "F_D",
          armId: consequenceCCallStage.armId,
  programRef: consequenceHogProgram.program.programRef
        });
        const consequenceCCallOpened = consequenceSpine.opened;
        eventState = emitRunnerEvents(eventState, consequenceSpine.events);
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
        eventState = emitRunnerEvents(eventState, buildCCallSpineClose({
          cCallRef: consequenceCCallOpened.cCallRef,
          basisId: request.basis.id,
          evidenceClass: "fd_interior",
          evidenceRefs: [scalarConsequenceInput.sourceProjectionRef],
          outcomeStatus: consequenceOutcome.status,
          payloadRef: null,
          responseContractRef: null,
          judgment: consequenceStageBlockingReason === null ? "advance" : "blocked",
          reasonRef: null
        }));
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
          emitTerminal: emitRunnerEvents,
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
            iterationCount: consequenceTraversalConsumption.iterationCount,
            vectorIndex: transition.vectorIndex
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
            cCallRef?: string;
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
                armId: "composed_transform",
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
                replayEvents: eventState.replayEvents,
          carryThroughStartup: admittedCarryThroughStartup
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
              taskInput = bindInstructionPromptManifest(
                taskInput,
                taskInstructionBinding.manifest
              );
            }
            plannedBatchWithInputs.push({
              declaration,
              plannedTask,
              taskInput,
              actorInvocation: taskActorInvocation
            });
            // T-200 P2e: spine per invoking batch task (-005); identity is
            // deterministic (-004) so the close re-mints, no tracker.
            {
              const batchTaskSpine = buildCCallSpineOpen({
                basisId: request.basis.id,
                graphFunctionId: taskActorInvocation?.graphFunctionId ?? transition.basis.graphFunction.id,
                graphCallId: taskActorInvocation?.graphCallId ?? graphCallIdForBasis(transition.basis),
                frameId: taskActorInvocation?.frameId ?? frameIdForBasis(transition.basis),
                edge: transition.edge,
                vectorIndex: transition.vectorIndex,
                stageRole: "transform",
                taskOrdinal: plannedTask.pluginIndex,
                attempt: nextCCallAttempt(eventState.replayEvents, {
                  basisId: request.basis.id,
                  graphCallId: taskActorInvocation?.graphCallId ?? graphCallIdForBasis(transition.basis),
                  frameId: taskActorInvocation?.frameId ?? frameIdForBasis(transition.basis),
                  vectorIndex: transition.vectorIndex,
                  stageRole: "transform",
                  taskOrdinal: plannedTask.pluginIndex
                }),
                batchRef: `batch:${request.basis.id}:${transition.vectorIndex}:transform`,
                regime: taskInput.regime,
                armId: "composed_transform",
    programRef: resolveHogProgram(
      transition.basis.compiledExecutionDeclarations.hogProgramPlan
    ).program.programRef
              });
              eventState = emitRunnerEvents(eventState, batchTaskSpine.events);
            {
              const plannedEntry = plannedBatchWithInputs[plannedBatchWithInputs.length - 1];
              if (plannedEntry !== undefined) {
                plannedEntry.cCallRef = batchTaskSpine.cCallRef;
              }
            }
            }
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
              {
                const batchTaskRef = plannedBatchWithInputs[index]?.cCallRef;
                if (batchTaskRef === undefined) {
                  throw new TypeError("batch task spine ref must be threaded from open");
                }
                eventState = emitRunnerEvents(eventState, buildCCallSpineClose({
                  cCallRef: batchTaskRef,
                  basisId: request.basis.id,
                  evidenceClass: taskInput.regime === "F_P" ? "fp_interior" : "fd_interior",
                  evidenceRefs: [taskInput.sourceProjectionRef],
                  outcomeStatus: taskOutcome.status,
                  payloadRef: null,
                  responseContractRef: null,
                  judgment: taskOutcome.status === "blocked" ? "blocked" : "advance",
                  reasonRef: null
                }));
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
          armId: "scalar_transform",
          runtime: instructionAssemblyRuntime,
          basis: request.basis,
          transition,
          computeStageRole: "transform",
          actorInvocation,
          pluginInput: scalarTransformInput,
          projection: scalarTransformProjection,
          replayEvents: eventState.replayEvents,
          carryThroughStartup: admittedCarryThroughStartup
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
        // T-200 P2c: the transform C call's spine OPENS around the F_P
        // interior (REQ-R-ABG3-CCALL-001/-003; stage from the baked P0
        // triple). Spine minting is engine authority; the interior below
        // is enclosed evidence.
        const scalarTransformLocus = {
          basisId: request.basis.id,
          graphCallId: actorInvocation.graphCallId,
          frameId: actorInvocation.frameId,
          vectorIndex: transition.vectorIndex,
          stageRole: "transform",
          taskOrdinal: null
        } as const;
        const resumableScalarTransform = projectResumableCCallSpine(
          eventState.replayEvents,
          scalarTransformLocus
        );
        const scalarTransformAttempt =
          resumableScalarTransform?.opened.attempt ??
          nextCCallAttempt(eventState.replayEvents, scalarTransformLocus);
        const scalarHogProgram = resolveHogProgram(
          transition.basis.compiledExecutionDeclarations.hogProgramPlan,
          scalarTransformAttempt
        );
        const scalarTransformStage = hogStageByRole(scalarHogProgram, "transform");
        if (scalarTransformStage === null) {
          throw new TypeError(`hog program ${scalarHogProgram.program.programRef} must declare a transform stage`);
        }
        const scalarTransformSpine = buildCCallSpineOpenOrResume(eventState.replayEvents, {
          basisId: request.basis.id,
          graphFunctionId: actorInvocation.graphFunctionId,
          graphCallId: actorInvocation.graphCallId,
          frameId: actorInvocation.frameId,
          edge: transition.edge,
          vectorIndex: transition.vectorIndex,
          stageRole: scalarTransformStage.stageRole,
          taskOrdinal: null,
          attempt: scalarTransformAttempt,
          batchRef: null,
          regime: "F_P",
          armId: scalarTransformStage.armId,
          programRef: scalarHogProgram.program.programRef
        });
        const scalarTransformCCallOpened = scalarTransformSpine.opened;
        const scalarTransformCCallEvidence: string[] = [
          instructionBinding.manifest.manifestRef
        ];
        const closeScalarTransformCCall = (
          state: EngineEventEmissionState,
          close: {
            readonly outcomeStatus: string;
            readonly payloadRef: string | null;
            readonly judgment: CCallJudgment;
          }
          ): EngineEventEmissionState =>
          emitRunnerEvents(state, buildCCallSpineCloseOrResume(state.replayEvents, {
            cCallRef: scalarTransformCCallOpened.cCallRef,
            basisId: request.basis.id,
            evidenceClass: "fp_interior",
            evidenceRefs: scalarTransformCCallEvidence,
            outcomeStatus: close.outcomeStatus,
            payloadRef: close.payloadRef,
            responseContractRef: null,
            judgment: close.judgment,
            reasonRef: null
          }));
        const scalarTransformFibreSelected = scalarTransformSpine.selected;
        // REQ-R-ABG3-CCALL-010 + TEMPORAL -007: the online dispatch gate
        // judges the SELECTION candidate against the trace prefix BEFORE
        // the C call enters truth.
        if (!scalarTransformSpine.selectedAlreadyAdmitted) {
          const gateBlock = temporalDispatchGateBlock({
            properties: temporalProperties,
            events: eventState.replayEvents,
            candidate: scalarTransformFibreSelected,
            basis: request.basis,
            runId: request.basis.runId ?? null,
            workKey: request.basis.workKey ?? null,
            vectorIndex: transition.vectorIndex
          });
          if (gateBlock !== null) {
            eventState = emitRunnerEvents(eventState, gateBlock.verdictEvent);
            const blocked = terminalTransition(
              request.basis,
              "gap_stop",
              gateBlock.reason
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
        if (scalarTransformSpine.events.length > 0) {
          eventState = emitRunnerEvents(eventState, scalarTransformSpine.events);
        }
        scalarTransformInput = bindPluginInputToCCall(
          scalarTransformInput,
          scalarTransformCCallOpened.cCallRef,
          instructionBinding.manifest,
          scalarTransformSpine.resumed
        );
        // T-200 P3: the online gate point moved to the fibre-selection
        // candidate above (REQ-R-ABG3-CCALL-010); the dispatch event is
        // interior evidence and needs no second gate.
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
          eventState = closeScalarTransformCCall(eventState, {
            outcomeStatus: "blocked",
            payloadRef: null,
            judgment: "blocked"
          });
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
        scalarTransformCCallEvidence.push(transition.dispatchRef);
        const outcome = fpDispatchOutcomeFromEffectResult(
          yield Object.freeze({ kind: "fp_dispatch", input: scalarTransformInput }),
        );
        scalarTransformCCallEvidence.push(...outcome.evidenceRefs);
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
        const transformStageBlockingReason = composedStageSetBlockingReason({
          admission: transformStageAdmission,
          requiredTaskRefs: transformStagePlan.requiredTaskRefs
        });
        if (transformStageBlockingReason !== null) {
          eventState = closeScalarTransformCCall(eventState, {
            outcomeStatus: "blocked",
            payloadRef: null,
            judgment: "blocked"
          });
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
        if (outcome.status === "dispatched") {
          const resultRef = resultRefForActorOutcome({
            invocation: actorInvocation,
            outcomeResultRef: outcome.resultRef
          });
          const artifactObservedEvent = constructActorResultArtifactObservedEvent({
            invocation: actorInvocation,
            artifactRef: resultRef,
            artifactPayload: outcome.resultArtifactCandidate
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
            maxAttempts: request.maxAttachedFpAttempts
          });
          eventState = emitRunnerEvents(eventState,
            constructActorInvocationClosedEvent({
              invocation: actorInvocation,
              closureStatus: "completed",
              resultRef,
              detail: outcome.reason
              })
          );
          if (attachedDecision.kind === "target_admission_required") {
            eventState = closeScalarTransformCCall(eventState, {
              outcomeStatus: "blocked",
              payloadRef: null,
              judgment: "blocked"
            });
            const blocked = terminalTransition(
              request.basis,
              "gap_stop",
              attachedDecision.reason
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
          eventState = closeScalarTransformCCall(eventState, {
            outcomeStatus: outcome.status,
            payloadRef: resultRef,
            judgment: attachedDecision.kind === "retry_planned" ? "retry" : "blocked"
          });
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
            closureStatus: "blocked",
            resultRef: outcome.resultRef,
            detail: outcome.reason
          })
        );
        if (outcome.status === "blocked") {
          const archiveRefusalClass = livePluginArchiveRefusalClass(outcome);
          if (archiveRefusalClass !== null) {
            eventState = closeScalarTransformCCall(eventState, {
              outcomeStatus: outcome.status,
              payloadRef: null,
              judgment: "blocked"
            });
            const blocked = terminalTransition(
              request.basis,
              "gap_stop",
              `live F_P archive refused without retry: ${archiveRefusalClass}`
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
          eventState = closeScalarTransformCCall(eventState, {
            outcomeStatus: outcome.status,
            payloadRef: null,
            judgment: continuation.kind === "retry" ? "retry" : "blocked"
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
        throw new TypeError(
          `Unsupported F_P dispatch outcome ${JSON.stringify(outcome)}`
        );
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
        // T-200 P3-C: the F_H C call — escalation is the fibre's judgment.
        {
          const fhHogProgram = resolveHogProgram(
            transition.basis.compiledExecutionDeclarations.hogProgramPlan
          );
          const fhStage = hogStageByRole(fhHogProgram, "transform");
          if (fhStage === null) {
            throw new TypeError(`hog program ${fhHogProgram.program.programRef} must declare a transform stage`);
          }
          if (fhStage === undefined) {
            throw new TypeError("HOG_BOOTSTRAP_TRIPLE must declare a transform stage");
          }
          const fhSpine = buildCCallSpineOpen({
            basisId: request.basis.id,
            graphFunctionId: transition.basis.graphFunction.id,
            graphCallId: graphCallIdForBasis(transition.basis),
            frameId: frameIdForBasis(transition.basis),
            edge: transition.edge,
            vectorIndex: transition.vectorIndex,
            stageRole: fhStage.stageRole,
            taskOrdinal: null,
            attempt: nextCCallAttempt(eventState.replayEvents, {
              basisId: request.basis.id,
              graphCallId: graphCallIdForBasis(transition.basis),
              frameId: frameIdForBasis(transition.basis),
              vectorIndex: transition.vectorIndex,
              stageRole: fhStage.stageRole,
              taskOrdinal: null
            }),
            batchRef: null,
            regime: "F_H",
            armId: "fh_admission",
            programRef: fhHogProgram.program.programRef
          });
          eventState = emitRunnerEvents(eventState, fhSpine.events);
          eventState = emitRunnerEvents(eventState, buildCCallSpineClose({
            cCallRef: fhSpine.cCallRef,
            basisId: request.basis.id,
            evidenceClass: "fh_interior",
            evidenceRefs: [
              `approval-subject:${request.basis.resolvedPolicy.approvalSubjectRef ?? "none"}`
            ],
            outcomeStatus: "escalated",
            payloadRef: null,
            responseContractRef: null,
            judgment: "escalated",
            reasonRef: null
          }));
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

function resolveSyncEnginePluginEffectWithAdmittedPlugins(
  effect: EnginePluginEffect,
  plugins: ResolvedRunnerPlugins
): EnginePluginEffectResult {
  switch (effect.kind) {
    case "c_call_handler_execute": {
      // HANDLERS-012 belt: entry admission guarantees a binding exists;
      // if the invariant breaks, the interior is typed blocked, never a
      // host escape.
      let interior: CCallHandlerInterior;
      try {
        if (plugins.handlerRegistry === null) {
          throw new TypeError("handler_binding_missing: no registry admitted");
        }
        const hit = resolveHandlerForSelection(plugins.handlerRegistry, {
          programRef: effect.programRef,
          stageRole: effect.stage.stageRole,
          armId: effect.stage.armId,
          regime: effect.stage.defaultRegime
        });
        interior = executeHandler(hit.handler, {
          stage: effect.stage,
          binding: hit.binding,
          declaredConfig: effect.declaredConfig,
          workProjection: effect.workProjection
        });
      } catch (error) {
        const message = (error instanceof Error ? error.message : String(error)).slice(0, 200);
        interior = Object.freeze({
          outcomeStatus: "blocked",
          evidenceRefs: Object.freeze([`handler-resolution-error:${effect.stage.armId}`]),
          payloadRef: null,
          responseContractRef: null,
          failureReason: `${message} (contract_failure)`
        });
      }
      return Object.freeze({ kind: "c_call_handler_execute", interior });
    }
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
      // T-190 construct-and-block: the singular effect has no producer in
      // the runner today; if one ever yields it, it shall not run an F_P
      // plugin without an admitted instruction prompt manifest.
      if (effect.input.instructionPromptManifest == null) {
        throw new TypeError(
          "evaluation_rule_evaluate requires an admitted instruction prompt manifest before plugin invocation (T-190 construct-and-block)"
        );
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
      // codex round 4 R4-1 (CRITICAL): an async-only plugin must never be
      // INVOKED on the sync driver — creating its promise starts external
      // work that outlives the recorded blocked outcome. Gate on the
      // plugin's contract identity BEFORE the call; this closes the
      // caller-supplied path the declared-ref guard cannot see.
      return Object.freeze({
        kind: "fp_evaluate",
        outcome: guardedSync(
          "fp evaluator plugin",
          () => admitFpEvaluationOutcome(
            resolveSyncPluginOutcome(
              plugins.fpEvaluator.evaluate(effect.input),
              "fp evaluator plugin"
            )
          ),
          (reason) => constructFpEvaluationOutcome({ status: "blocked", reason })
        )
      });
    case "fp_dispatch":
      return Object.freeze({
        kind: "fp_dispatch",
        outcome: guardedSync(
          "fp dispatch plugin",
          () => admitFpDispatchOutcome(
            resolveSyncPluginOutcome(
              plugins.fpDispatch.dispatch(effect.input),
              "fp dispatch plugin"
            )
          ),
          (reason) => constructFpDispatchOutcome({ status: "blocked", reason })
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
    case "consequence_project": {
      // F5 (self-review; observed live at run-19 #21): a consequence
      // plugin throw must be a TYPED blocked projection, never a host
      // failure — same law as the P4 dispatch/evaluator guards.
      let consequenceOutcome;
      try {
        consequenceOutcome = admitConsequenceProjectionOutcome(
          resolveSyncPluginOutcome(
            plugins.consequenceProjection.project(effect.input),
            "consequence projection plugin"
          )
        );
      } catch (error) {
        const message = (error instanceof Error ? error.message : String(error)).slice(0, 200);
        consequenceOutcome = admitConsequenceProjectionOutcome({
          kind: "consequence_projection",
          status: "blocked",
          consequenceRef: "consequence://abg/plugin-throw",
          domainReadModelRefs: [],
          traversalAction: null,
          evidenceRefs: [`consequence-plugin-error:${message.slice(0, 120)}`],
          reason: `consequence projection plugin threw (contract_failure): ${message}`
        });
      }
      return Object.freeze({
        kind: "consequence_project",
        outcome: consequenceOutcome
      });
    }
    case "construction_intent_step":
      return Object.freeze({
        kind: "construction_intent_step",
        outcome: runConstructionIntentStep(effect.request)
      });
  }
}

// This diagnostic/test-facing resolver cannot bypass the machine-entry
// boundary. Public callers supply an ordinary plugin set, which is resolved
// and admitted exactly as the sync engine would admit it before invocation.
export function resolveSyncEnginePluginEffect(
  effect: EnginePluginEffect,
  plugins: EngineRunnerPluginSet
): EnginePluginEffectResult {
  const admitted = admitResolvedRunnerPluginsForDriver(
    resolveRunnerPlugins(plugins),
    "sync",
    "direct-effect-resolver"
  );
  return resolveSyncEnginePluginEffectWithAdmittedPlugins(effect, admitted);
}

async function resolveAsyncEnginePluginEffect(
  effect: EnginePluginEffect,
  plugins: ResolvedRunnerPlugins
): Promise<EnginePluginEffectResult> {
  switch (effect.kind) {
    case "c_call_handler_execute": {
      let interior: CCallHandlerInterior;
      try {
        if (plugins.handlerRegistry === null) {
          throw new TypeError("handler_binding_missing: no registry admitted");
        }
        const hit = resolveHandlerForSelection(plugins.handlerRegistry, {
          programRef: effect.programRef,
          stageRole: effect.stage.stageRole,
          armId: effect.stage.armId,
          regime: effect.stage.defaultRegime
        });
        interior = await executeHandlerAsync(hit.handler, {
          stage: effect.stage,
          binding: hit.binding,
          declaredConfig: effect.declaredConfig,
          workProjection: effect.workProjection
        });
      } catch (error) {
        const message = (error instanceof Error ? error.message : String(error)).slice(0, 200);
        interior = Object.freeze({
          outcomeStatus: "blocked",
          evidenceRefs: Object.freeze([`handler-resolution-error:${effect.stage.armId}`]),
          payloadRef: null,
          responseContractRef: null,
          failureReason: `${message} (contract_failure)`
        });
      }
      return Object.freeze({ kind: "c_call_handler_execute", interior });
    }
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
      // T-190 construct-and-block: the singular effect has no producer in
      // the runner today; if one ever yields it, it shall not run an F_P
      // plugin without an admitted instruction prompt manifest.
      if (effect.input.instructionPromptManifest == null) {
        throw new TypeError(
          "evaluation_rule_evaluate requires an admitted instruction prompt manifest before plugin invocation (T-190 construct-and-block)"
        );
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
        outcome: await guardedAsync(
          "fp evaluator plugin",
          async () => admitFpEvaluationOutcome(
            await plugins.fpEvaluator.evaluate(effect.input)
          ),
          (reason) => constructFpEvaluationOutcome({ status: "blocked", reason })
        )
      });
    case "fp_dispatch":
      return Object.freeze({
        kind: "fp_dispatch",
        outcome: await guardedAsync(
          "fp dispatch plugin",
          async () => admitFpDispatchOutcome(
            await plugins.fpDispatch.dispatch(effect.input)
          ),
          (reason) => constructFpDispatchOutcome({ status: "blocked", reason })
        )
      });
    case "fh_admit":
      return Object.freeze({
        kind: "fh_admit",
        outcome: admitFhAdmissionOutcome(
          await plugins.fhAdmission.admit(effect.input)
        )
      });
    case "consequence_project": {
      let consequenceOutcome;
      try {
        consequenceOutcome = admitConsequenceProjectionOutcome(
          await plugins.consequenceProjection.project(effect.input)
        );
      } catch (error) {
        const message = (error instanceof Error ? error.message : String(error)).slice(0, 200);
        consequenceOutcome = admitConsequenceProjectionOutcome({
          kind: "consequence_projection",
          status: "blocked",
          consequenceRef: "consequence://abg/plugin-throw",
          domainReadModelRefs: [],
          traversalAction: null,
          evidenceRefs: [`consequence-plugin-error:${message.slice(0, 120)}`],
          reason: `consequence projection plugin threw (contract_failure): ${message}`
        });
      }
      return Object.freeze({
        kind: "consequence_project",
        outcome: consequenceOutcome
      });
    }
    case "construction_intent_step":
      return Object.freeze({
        kind: "construction_intent_step",
        outcome: await runConstructionIntentStepAsync(effect.request)
      });
  }
}

// HANDLERS write surface: declared bindings assemble the EFFECTIVE
// registry before the machine and the effect resolvers see plugins.
// Implementations arrive by ref through the supplied handlers map
// (standard set from the runtime layer, custom via the plugin seam).
function effectiveRunnerPlugins(
  request: EngineIterateRequest,
  plugins: ResolvedRunnerPlugins,
  driver: "sync" | "async"
): ResolvedRunnerPlugins {
  // S2.3 DECLARED PLUGIN SELECTION (T-217 closure campaign, F_H-approved
  // 2026-07-10): the binding may DECLARE which governed substrate plugin
  // serves each effect seam. A declared seam and a caller-supplied
  // plugin for the SAME seam are two authorities — fail closed (the raw
  // request set distinguishes caller-explicit from resolved defaults).
  let merged = plugins;
  const selection =
    request.basis.compiledExecutionDeclarations.pluginSelection;
  if (selection !== null) {
    for (const seam of PLUGIN_SELECTION_SEAM_VALUES) {
      const selectedRef = selection[seam];
      if (selectedRef !== undefined && request.plugins?.[seam] !== undefined) {
        throw new TypeError(
          `plugin_selection_conflict: ${request.basis.graphFunction.name} declares ${JSON.stringify(selectedRef)} for seam ${seam} while the caller supplies a plugin for the same seam — two authorities`
        );
      }
    }
    merged = Object.freeze({
      ...merged,
      ...resolveDeclaredPluginSelection({
        selection,
        sourceRef: request.basis.graphFunction.name,
        catalog: standardPluginCatalogWithCapabilities(request.pluginCapabilities)
      })
    });
  }
  // codex round 5 §1: ONE admission boundary validates EVERY resolved
  // seam plugin — declared, defaulted, OR host-supplied — against the
  // driver, BEFORE any invocation. Driver-compatibility is CONTRACT
  // metadata (fail-closed: unset ⇒ async_required), never a ref
  // denylist, so a plugin wrapping an async body under any contract ref
  // cannot board the sync driver.
  merged = admitResolvedRunnerPluginsForDriver(
    merged,
    driver,
    request.basis.graphFunction.name
  );
  const declaredBindings =
    request.basis.compiledExecutionDeclarations.handlerBindingRows;
  if (declaredBindings === null) {
    return merged;
  }
  const impls = new Map(merged.handlerRegistry?.handlers ?? new Map());
  return Object.freeze({
    ...merged,
    handlerRegistry: assembleHandlerRegistry({
      declaredBindings,
      handlers: impls
    })
  });
}

interface RunnerPluginAdmissionSpec {
  readonly seam: string;
  readonly plugin: unknown;
  readonly methodName: "evaluate" | "dispatch" | "admit" | "project" | "run";
  readonly expectedPluginKinds: readonly string[];
  readonly outputCarrier: string;
  readonly computeStageRole?: "transform" | "evaluate" | "consequence" | undefined;
}

function pluginAdmissionFailure(
  seam: string,
  sourceRef: string,
  detail: string
): TypeError {
  return new TypeError(
    `plugin_admission_failed: seam ${seam} on ${sourceRef}: ${detail}`
  );
}

function asPluginRecord(
  input: unknown,
  seam: string,
  sourceRef: string
): Readonly<Record<string, unknown>> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw pluginAdmissionFailure(seam, sourceRef, "expected plugin object");
  }
  return parsePlainObject(input, `EngineRunnerPluginSet.${seam}`);
}

interface AdmittedRunnerPlugin {
  readonly record: Readonly<Record<string, unknown>>;
  readonly contract: EnginePluginContract;
}

function admitRunnerPlugin(
  spec: RunnerPluginAdmissionSpec,
  driver: "sync" | "async",
  sourceRef: string
): AdmittedRunnerPlugin {
  const plugin = asPluginRecord(spec.plugin, spec.seam, sourceRef);
  let contract: EnginePluginContract;
  try {
    contract = admitEnginePluginContract(
      plugin["contract"],
      `EngineRunnerPluginSet.${spec.seam}.contract`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw pluginAdmissionFailure(spec.seam, sourceRef, message);
  }
  if (!spec.expectedPluginKinds.includes(contract.pluginKind)) {
    throw pluginAdmissionFailure(
      spec.seam,
      sourceRef,
      `contract pluginKind ${JSON.stringify(contract.pluginKind)} is incompatible; expected one of ${JSON.stringify(spec.expectedPluginKinds)}`
    );
  }
  if (contract.authority !== "effect_plugin") {
    throw pluginAdmissionFailure(
      spec.seam,
      sourceRef,
      `contract authority ${JSON.stringify(contract.authority)} must be "effect_plugin"`
    );
  }
  if (contract.inputCarrier !== "EnginePluginInput") {
    throw pluginAdmissionFailure(
      spec.seam,
      sourceRef,
      `contract inputCarrier ${JSON.stringify(contract.inputCarrier)} must be "EnginePluginInput"`
    );
  }
  if (contract.outputCarrier !== spec.outputCarrier) {
    throw pluginAdmissionFailure(
      spec.seam,
      sourceRef,
      `contract outputCarrier ${JSON.stringify(contract.outputCarrier)} must be ${JSON.stringify(spec.outputCarrier)}`
    );
  }
  if (
    spec.computeStageRole !== undefined &&
    contract.computeStageRole !== spec.computeStageRole
  ) {
    throw pluginAdmissionFailure(
      spec.seam,
      sourceRef,
      `contract computeStageRole ${JSON.stringify(contract.computeStageRole)} must be ${JSON.stringify(spec.computeStageRole)}`
    );
  }
  if (typeof plugin[spec.methodName] !== "function") {
    throw pluginAdmissionFailure(
      spec.seam,
      sourceRef,
      `missing callable ${spec.methodName} method`
    );
  }
  if (driver === "sync" && contract.driverRequirement !== "sync_compatible") {
    throw pluginAdmissionFailure(
      spec.seam,
      sourceRef,
      `plugin ${JSON.stringify(contract.ref)} requires ${JSON.stringify(contract.driverRequirement)}; the sync driver admits only "sync_compatible"`
    );
  }
  return Object.freeze({ record: plugin, contract });
}

function admitComposedTaskCollection(
  plugins: readonly ComposedStageTaskPlugin[],
  stageRole: "transform" | "consequence",
  driver: "sync" | "async",
  sourceRef: string
): readonly ComposedStageTaskPlugin[] {
  return Object.freeze(
    plugins.map((plugin, index) => {
      const seam = `${stageRole}Tasks[${index}]`;
      const admitted = admitRunnerPlugin(
        {
          seam,
          plugin,
          methodName: "run",
          expectedPluginKinds: ["hook_ref"],
          outputCarrier: "ComposedStageTaskOutcome",
          computeStageRole: stageRole
        },
        driver,
        sourceRef
      );
      if (
        typeof admitted.record["taskRef"] !== "string" ||
        admitted.record["taskRef"].length === 0
      ) {
        throw pluginAdmissionFailure(seam, sourceRef, "taskRef must be non-empty");
      }
      const taskRole = admitted.record["taskRole"];
      const lawfulTaskRoles =
        stageRole === "transform"
          ? ["candidate"]
          : ["projection"];
      if (typeof taskRole !== "string" || !lawfulTaskRoles.includes(taskRole)) {
        throw pluginAdmissionFailure(
          seam,
          sourceRef,
          `taskRole ${JSON.stringify(taskRole)} is not lawful for ${stageRole}`
        );
      }
      return Object.freeze({ ...plugin, contract: admitted.contract });
    })
  );
}

function admitEvaluationRuleCollection(
  plugins: readonly EvaluationRulePlugin[],
  driver: "sync" | "async",
  sourceRef: string
): readonly EvaluationRulePlugin[] {
  return Object.freeze(
    plugins.map((plugin, index) => {
      const seam = `evaluationRules[${index}]`;
      const admitted = admitRunnerPlugin(
        {
          seam,
          plugin,
          methodName: "evaluate",
          expectedPluginKinds: ["fd_evaluator", "fp_evaluator", "hook_ref"],
          outputCarrier: "EvaluationRuleOutcome",
          computeStageRole: "evaluate"
        },
        driver,
        sourceRef
      );
      if (
        typeof admitted.record["ruleRef"] !== "string" ||
        admitted.record["ruleRef"].length === 0
      ) {
        throw pluginAdmissionFailure(seam, sourceRef, "ruleRef must be non-empty");
      }
      return Object.freeze({ ...plugin, contract: admitted.contract });
    })
  );
}

function admitResolvedRunnerPluginsForDriver(
  plugins: ResolvedRunnerPlugins,
  driver: "sync" | "async",
  sourceRef: string
): ResolvedRunnerPlugins {
  const fdEvaluator = admitRunnerPlugin(
    {
      seam: "fdEvaluator",
      plugin: plugins.fdEvaluator,
      methodName: "evaluate",
      expectedPluginKinds: ["fd_evaluator"],
      outputCarrier: "FdEvaluationOutcome"
    },
    driver,
    sourceRef
  );
  const fpEvaluator = admitRunnerPlugin(
    {
      seam: "fpEvaluator",
      plugin: plugins.fpEvaluator,
      methodName: "evaluate",
      expectedPluginKinds: ["fp_evaluator"],
      outputCarrier: "FpEvaluationOutcome"
    },
    driver,
    sourceRef
  );
  const fpDispatch = admitRunnerPlugin(
    {
      seam: "fpDispatch",
      plugin: plugins.fpDispatch,
      methodName: "dispatch",
      expectedPluginKinds: ["fp_dispatch"],
      outputCarrier: "FpDispatchOutcome"
    },
    driver,
    sourceRef
  );
  const fhAdmission = admitRunnerPlugin(
    {
      seam: "fhAdmission",
      plugin: plugins.fhAdmission,
      methodName: "admit",
      expectedPluginKinds: ["fh_admission"],
      outputCarrier: "FhAdmissionOutcome"
    },
    driver,
    sourceRef
  );
  const consequenceProjection = admitRunnerPlugin(
    {
      seam: "consequenceProjection",
      plugin: plugins.consequenceProjection,
      methodName: "project",
      expectedPluginKinds: ["consequence_projection"],
      outputCarrier: "ConsequenceProjectionOutcome"
    },
    driver,
    sourceRef
  );
  return Object.freeze({
    ...plugins,
    fdEvaluator: Object.freeze({
      ...plugins.fdEvaluator,
      contract: fdEvaluator.contract
    }),
    fpEvaluator: Object.freeze({
      ...plugins.fpEvaluator,
      contract: fpEvaluator.contract
    }),
    fpDispatch: Object.freeze({
      ...plugins.fpDispatch,
      contract: fpDispatch.contract
    }),
    fhAdmission: Object.freeze({
      ...plugins.fhAdmission,
      contract: fhAdmission.contract
    }),
    consequenceProjection: Object.freeze({
      ...plugins.consequenceProjection,
      contract: consequenceProjection.contract
    }),
    transformTasks: admitComposedTaskCollection(
      plugins.transformTasks,
      "transform",
      driver,
      sourceRef
    ),
    evaluationRules: admitEvaluationRuleCollection(
      plugins.evaluationRules,
      driver,
      sourceRef
    ),
    consequenceTasks: admitComposedTaskCollection(
      plugins.consequenceTasks,
      "consequence",
      driver,
      sourceRef
    )
  });
}

// Dual review 2026-07-10 F4: handler-binding ASSEMBLY vocabulary errors
// (unknown regime/handlerClass in a GTL-authored abg.hog_handler_bindings
// declaration) land as the SAME typed fail-closed startup result the
// machine's entry admission produces — never a host escape from the
// engine API. The assembly runs at the entries (the effect resolvers
// need the assembled registry), so the conversion lives here too.
function handlerAssemblyFailClosedResult(
  request: EngineIterateRequest,
  error: unknown
): EngineIterateResult {
  const message = (error instanceof Error ? error.message : String(error)).slice(0, 300);
  // codex round F8: the failure surface tells the truth — selection
  // errors are plugin_selection failures, not hog-program mislabels.
  const isSelectionFailure =
    message.startsWith("plugin_selection") ||
    message.startsWith("abg.plugin_selection") ||
    message.startsWith("plugin_admission_failed");
  const reason = isSelectionFailure
    ? message
    : `hog_program_unresolvable: ${message}`;
  const blocked = terminalTransition(request.basis, "gap_stop", reason);
  const emitted = emit(
    [
      constructRuntimeFailureObservedEvent({
        basisId: request.basis.id,
        surface: isSelectionFailure ? "plugin_selection" : "hog_program_resolution",
        failureClass: "contract_failure",
        message,
        stackExcerpt: null
      }),
      constructTerminalReachedEvent(blocked)
    ],
    request.eventSink
  );
  const replayEvents = Object.freeze([
    ...canonicalReplayEvents(request.runtimeEvents ?? Object.freeze([])),
    ...emitted
  ]);
  return constructResult({
    basis: request.basis,
    transition: blocked,
    projection: deriveRuntimeAggregateProjection(request.basis, replayEvents),
    emittedEvents: emitted,
    replayEvents,
    iterationCount: 0
  });
}

function exactRuntimeCatalogExecutionBinding(input: {
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly targetHandle: string;
  readonly runtimeEvents: readonly RuntimeEvent[];
}): CatalogExecutionBinding {
  const runtimeEvents = [...input.runtimeEvents];
  assertCanonicalRuntimeEventSequence(
    runtimeEvents,
    "EngineRuntimeCatalogBasis.runtimeEvents"
  );
  const projection = projectRuntimeCatalog({
    workspaceId: input.catalogBasis.workspaceId,
    bindingId: input.catalogBasis.bindingId,
    catalogId: input.catalogBasis.catalogId,
    events: runtimeEvents
  });
  if (
    input.catalogBasis.runtimeCatalogProjectionRef !== projection.projectionRef ||
    input.catalogBasis.runtimeRegistryProjectionRef !==
      projection.runtimeRegistryProjection.projectionRef ||
    !stableJsonEquals(input.catalogBasis.projection, projection)
  ) {
    throw new TypeError(
      "runtimeCatalogBasis does not match canonical replay projection truth"
    );
  }
  const bindings = input.catalogBasis.executionBindings.filter(
    (binding) => binding.graphFunctionHandle === input.targetHandle
  );
  const binding = bindings[0];
  if (bindings.length !== 1 || binding === undefined) {
    throw new TypeError(
      "runtimeCatalogBasis must have one exact execution binding for the start target"
    );
  }
  const selected = runtimeEvents.some(
    (event) =>
      event.kind === "graph_function_selected" &&
      event.runtimeBasisRef === input.catalogBasis.basisRef &&
      event.selectedEntryRef === binding.entryRef
  );
  if (!selected) {
    throw new TypeError(
      "runtimeCatalogBasis requires prior exact graph-function selection truth"
    );
  }
  return binding;
}

function assertEngineStartRuntimeCatalogBasis(
  request: EngineStartRequest
): CatalogExecutionBinding | null {
  if (
    request.runtimeRegistryStartup !== undefined &&
    request.runtimeCatalogBasis !== undefined
  ) {
    throw new TypeError(
      "runtimeRegistryStartup and runtimeCatalogBasis are mutually exclusive"
    );
  }
  if (request.runtimeCatalogBasis === undefined) {
    return null;
  }
  const binding = exactRuntimeCatalogExecutionBinding({
    catalogBasis: request.runtimeCatalogBasis,
    targetHandle: request.startIntent.target.handle,
    runtimeEvents: request.runtimeEvents ?? Object.freeze([])
  });
  if (
    binding.moduleName !== request.module.name ||
    binding.moduleDigest !== stableSha256Digest(request.module) ||
    binding.graphFunctionHandle !== request.startIntent.target.handle ||
    binding.moduleName !== request.startIntent.scope.moduleName
  ) {
    throw new TypeError(
      "runtimeCatalogBasis execution binding does not match the engine start request"
    );
  }
  return binding;
}

function assertDeclaredExecutionContextRuntimeStart(input: {
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly binding: CatalogExecutionBinding;
  readonly declaredExecutionRequest: DeclaredExecutionRequest | undefined;
  readonly traversalExecutionAdmission:
    | TraversalExecutionAdmissionRuntimeAddressable
    | undefined;
  readonly instructionAssemblyStartup:
    | EngineInstructionAssemblyStartupInput
    | undefined;
}): void {
  const declaresExecutionContext =
    catalogExecutionBindingDeclaresExecutionContext({
      executionBinding: input.binding,
      catalogBasis: input.catalogBasis
    });
  if (!declaresExecutionContext) {
    if (
      input.declaredExecutionRequest !== undefined ||
      input.traversalExecutionAdmission !== undefined
    ) {
      throw new TypeError(
        "traversal_execution_start_authority_unexpected: catalog entry has no declared execution-context profile"
      );
    }
    return;
  }
  if (
    input.declaredExecutionRequest === undefined ||
    input.traversalExecutionAdmission === undefined
  ) {
    throw new TypeError(
      "declared_execution_context_startup_blocked_awaiting_t267: " +
        "profile-aware catalog work requires one exact declared request and runtime-addressable traversal admission"
    );
  }
  assertTraversalExecutionRuntimeStart({
    request: input.declaredExecutionRequest,
    admission: input.traversalExecutionAdmission
  });
  if (
    input.traversalExecutionAdmission.graphFunctionId !==
      input.binding.graphFunctionId ||
    input.traversalExecutionAdmission.graphFunctionId !==
      input.binding.graphFunctionHandle ||
    input.traversalExecutionAdmission.graphFunctionDigest !==
      input.binding.graphFunctionDigest
  ) {
    throw new TypeError(
      "traversal_execution_start_authority_mismatch: T-267 admission does not belong to the selected catalog GraphFunction"
    );
  }
  const declaredRequest = input.declaredExecutionRequest;
  if (declaredRequest.regime === "F_H") {
    throw new TypeError(
      "declared_fh_execution_requires_public_interaction_entry: F_H work cannot enter the prompt-plan engine path"
    );
  }
  const matchingPlans = input.instructionAssemblyStartup?.compiledPromptPlans.filter(
    (plan) =>
      plan.planRef === declaredRequest.planRef &&
      plan.planDigest === declaredRequest.planDigest
  ) ?? Object.freeze([]);
  if (matchingPlans.length !== 1) {
    throw new TypeError(
      "declared_fp_instruction_plan_mismatch: runtime entry requires the exact T-256 prompt plan"
    );
  }
}

function defaultCatalogInstructionAssemblyStartup(input: {
  readonly basis: ExecutionBasis;
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly binding: CatalogExecutionBinding;
}): EngineInstructionAssemblyStartupInput {
  const entry = input.catalogBasis.projection.runtimeRegistryProjection.entries.find(
    (candidate) =>
      candidate.entryRef === input.binding.entryRef &&
      candidate.declarationRef === input.binding.declarationRef
  );
  if (entry === undefined) {
    throw new TypeError(
      "runtimeCatalogBasis instruction startup requires the exact admitted registry entry"
    );
  }
  const prefix = `catalog-${stableSha256Digest({
    basisRef: input.catalogBasis.basisRef,
    entryRef: input.binding.entryRef,
    declarationRef: input.binding.declarationRef
  }).slice("sha256:".length, "sha256:".length + 16)}`;
  return constructDefaultInstructionAssemblyStartupForBasis(input.basis, {
    prefix,
    namespace: entry.namespace,
    ownerRef: entry.ownerRef,
    version: entry.version,
    registryEntryRef: entry.entryRef,
    declarationRef: input.binding.declarationRef,
    interfaceRef: entry.interfaceRef,
    sourceContractRef: entry.sourceContractRef,
    targetContractRef: entry.targetContractRef,
    contextRefs: entry.contextRefs,
    authorityRefs: entry.authorityRefs,
    overlayRefs: entry.overlayRefs,
    provenanceRefs: entry.provenanceRefs,
    readinessRefs: entry.readinessRefs,
    proofRefs: entry.proofRefs,
    policyRefs: entry.policyRefs,
    declarationSourceRefs: entry.sourceEventRefs
  }).instructionAssemblyStartup;
}

function assertEngineIterateRuntimeCatalogBasis(
  request: EngineIterateRequest
): void {
  if (
    request.runtimeRegistryStartup !== undefined &&
    request.runtimeCatalogBasis !== undefined
  ) {
    throw new TypeError(
      "runtimeRegistryStartup and runtimeCatalogBasis are mutually exclusive"
    );
  }
  if (request.runtimeCatalogBasis === undefined) {
    if (
      request.declaredExecutionRequest !== undefined ||
      request.traversalExecutionAdmission !== undefined
    ) {
      throw new TypeError(
        "traversal_execution_start_authority_unexpected: no admitted runtime catalog basis"
      );
    }
    return;
  }
  const binding = exactRuntimeCatalogExecutionBinding({
    catalogBasis: request.runtimeCatalogBasis,
    targetHandle: request.basis.startIntent.target.handle,
    runtimeEvents: request.runtimeEvents ?? Object.freeze([])
  });
  if (
    binding.moduleName !== request.basis.moduleName ||
    binding.graphFunctionId !== request.basis.graphFunction.id ||
    binding.graphFunctionDigest !== stableSha256Digest(request.basis.graphFunction)
  ) {
    throw new TypeError(
      "runtimeCatalogBasis execution binding does not match the admitted execution basis"
    );
  }
  if (
    catalogExecutionBindingDeclaresExecutionContext({
      executionBinding: binding,
      catalogBasis: request.runtimeCatalogBasis
    })
  ) {
    assertDeclaredExecutionContextRuntimeStart({
      catalogBasis: request.runtimeCatalogBasis,
      binding,
      declaredExecutionRequest: request.declaredExecutionRequest,
      traversalExecutionAdmission: request.traversalExecutionAdmission,
      instructionAssemblyStartup: request.instructionAssemblyStartup
    });
  } else if (
    request.declaredExecutionRequest !== undefined ||
    request.traversalExecutionAdmission !== undefined
  ) {
    throw new TypeError(
      "traversal_execution_start_authority_unexpected: catalog entry has no declared execution-context profile"
    );
  }
}

export function runEngineIterate(
  request: EngineIterateRequest
): EngineIterateResult {
  seedRuntimeEventAdmissionOrdinal(request.runtimeEvents ?? Object.freeze([]));
  let plugins: ResolvedRunnerPlugins;
  try {
    assertEngineIterateRuntimeCatalogBasis(request);
    plugins = effectiveRunnerPlugins(request, resolveRunnerPlugins(request.plugins), "sync");
  } catch (error) {
    return handlerAssemblyFailClosedResult(request, error);
  }
  const targetCarrierDefaults =
    request.targetCarrierDefaults ?? loadGtlTargetCarrierDefaultsBundle();
  const machine = runEngineIterateMachine({
    request,
    plugins,
    targetCarrierDefaults
  });
  let step = machine.next();
  while (!step.done) {
    step = machine.next(
      resolveSyncEnginePluginEffectWithAdmittedPlugins(step.value, plugins)
    );
  }
  return step.value;
}

export async function runEngineIterateAsync(
  request: EngineIterateRequest
): Promise<EngineIterateResult> {
  seedRuntimeEventAdmissionOrdinal(request.runtimeEvents ?? Object.freeze([]));
  let plugins: ResolvedRunnerPlugins;
  try {
    assertEngineIterateRuntimeCatalogBasis(request);
    plugins = effectiveRunnerPlugins(request, resolveRunnerPlugins(request.plugins), "async");
  } catch (error) {
    return handlerAssemblyFailClosedResult(request, error);
  }
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

function prepareEngineStart(request: EngineStartRequest): {
  readonly basis: ExecutionBasis;
  readonly instructionAssemblyStartup:
    | EngineInstructionAssemblyStartupInput
    | undefined;
} {
  const catalogBinding = assertEngineStartRuntimeCatalogBasis(request);
  if (catalogBinding !== null && request.runtimeCatalogBasis !== undefined) {
    assertDeclaredExecutionContextRuntimeStart({
      catalogBasis: request.runtimeCatalogBasis,
      binding: catalogBinding,
      declaredExecutionRequest: request.declaredExecutionRequest,
      traversalExecutionAdmission: request.traversalExecutionAdmission,
      instructionAssemblyStartup: request.instructionAssemblyStartup
    });
  } else if (
    request.declaredExecutionRequest !== undefined ||
    request.traversalExecutionAdmission !== undefined
  ) {
    throw new TypeError(
      "traversal_execution_start_authority_unexpected: no admitted runtime catalog basis"
    );
  }
  const catalogDeclaresExecutionContext =
    catalogBinding !== null && request.runtimeCatalogBasis !== undefined &&
    catalogExecutionBindingDeclaresExecutionContext({
      executionBinding: catalogBinding,
      catalogBasis: request.runtimeCatalogBasis
    });
  const basis = admitExecutionBasis(request);
  const instructionAssemblyStartup = request.instructionAssemblyStartup ??
    (catalogBinding === null ||
      request.runtimeCatalogBasis === undefined ||
      catalogDeclaresExecutionContext
      ? undefined
      : defaultCatalogInstructionAssemblyStartup({
          basis,
          catalogBasis: request.runtimeCatalogBasis,
          binding: catalogBinding
        }));
  return Object.freeze({ basis, instructionAssemblyStartup });
}

export function runEngineStart(request: EngineStartRequest): EngineIterateResult {
  const { basis, instructionAssemblyStartup } = prepareEngineStart(request);
  return runEngineIterate({
    basis,
    runtimeEvents: request.runtimeEvents,
    eventSink: request.eventSink,
    declaredExecutionRequest: request.declaredExecutionRequest,
    traversalExecutionAdmission: request.traversalExecutionAdmission,
    ...engineStartPassthrough(request),
    ...(instructionAssemblyStartup === undefined
      ? {}
      : { instructionAssemblyStartup }),
    plugins: request.plugins,
    pluginCapabilities: request.pluginCapabilities,
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
    executiveObserver: request.executiveObserver
  });
}

export async function runEngineStartAsync(
  request: EngineStartRequest
): Promise<EngineIterateResult> {
  const { basis, instructionAssemblyStartup } = prepareEngineStart(request);
  return await runEngineIterateAsync({
    basis,
    runtimeEvents: request.runtimeEvents,
    eventSink: request.eventSink,
    declaredExecutionRequest: request.declaredExecutionRequest,
    traversalExecutionAdmission: request.traversalExecutionAdmission,
    ...engineStartPassthrough(request),
    ...(instructionAssemblyStartup === undefined
      ? {}
      : { instructionAssemblyStartup }),
    plugins: request.plugins,
    pluginCapabilities: request.pluginCapabilities,
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
    executiveObserver: request.executiveObserver
  });
}
