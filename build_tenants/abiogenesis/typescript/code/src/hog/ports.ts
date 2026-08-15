import type * as Effect from "effect/Effect";

import type {
  AdmittedCCallJudgment,
  AdmittedCCallResult,
  CCall,
  CCallAdmission,
  CCallOpenRefusal,
  CCallLocusCandidate,
  ChildFoldbackAdmission,
  ChildFoldbackRefusal,
  ChildPreparationRefusalAdmission,
  ChildPreparationRefusalCandidate,
  ChildPreparationRefusalRefusal,
  ExecutableCCallLocusCandidate,
  InteractionCCallLocusCandidate,
  JudgmentCandidate,
  PendingInteractionAdmissionPlan,
  WorkflowCCallProposal,
} from "../abg/c_call.js";
import type {
  BlockedCCallOutcomeReceipt,
  CCallCompletionAdmission,
  CCallCompletionResult,
  JudgedCCallOutcomeReceipt,
  ResultCCallOutcomeReceipt,
  RetryCCallOutcomeReceipt,
} from "../abg/c_call_outcome.js";
import type { FhInteractionHoldAdmission } from "../abg/continuation.js";
import type {
  AdmittedImplementationResolutionRow,
  AdmittedInteractionContractRow,
} from "../abg/execution_basis.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type { ApplicationChildFoldbackReceipt } from "../abg/graph_application.js";
import type {
  CompletedRetryProgressPlan,
  ProjectExecutableRetryInputResult,
  ProjectExecutableRetryInputRequest,
  RetryAdmissionRefusal,
  RetryAttemptFrontier,
  RetryRuntimeFailureTransitionPlan,
  RetryRuntimeFailureTransitionResult,
  RetrySuccessfulExitEvidence,
} from "../abg/retry.js";
import type { ReplayState } from "../abg/replay.js";
import type {
  AdmittedRoute,
  ConstructionIntentAdmission,
  RouteTransitionResult,
} from "../abg/traversal_route.js";
import type {
  TraversalCursorAdmission,
  TraversalCursorAdmissionRefusal,
  TraversalCursorCandidate,
} from "../abg/traversal_cursor.js";
import type { TraversalTransitionCandidate } from "../abg/traversal_transition.js";
import type {
  ChildTraversalPreparationRequest,
  ChildTraversalPreparationResult,
  PreparedChildTraversal,
} from "./child_traversal.js";
import type {
  ExecutableTraversalCompletion,
} from "./traversal_completion.js";
import type {
  ExecutionBasis,
} from "../abg/execution_basis.js";
import type { OpenedTraversalScope } from "../abg/open_call.js";
import type {
  COfNode,
  CProgramNode,
  CWorkflowNode,
} from "../gtl/c_algebra.js";
import type {
  GraphFunction,
  GtlGraph,
  FanOutApplication,
  RecurseApplication,
} from "../gtl/contracts.js";
import type {
  LeafInvocationOwnerResult,
  LeafInvocationPort,
  ProbabilisticLeafEffectPort,
} from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type {
  ApplicationChildFoldbackResult,
  ApplicationChildPreparationRefusalResult,
} from "../abg/graph_application.js";
import type { FanOutCompletionResult } from "../abg/fan_out.js";
import type { RuntimeFailureAdmissionReceipt } from "../abg/runtime_failure.js";
import type { DeferredApplicationProjection } from "../abg/deferred_application.js";
import type { TraversalRefusal } from "./traversal.js";

type TraversalValue = Readonly<Record<string, JsonValue>>;

export type ProjectReplayPort<Error> = (
  predecessorPrefix: DurablePrefixCoordinate,
  cursor: TraversalCursorCandidate,
) => Effect.Effect<ReplayState, Error>;

export type MaterializedInputAtCursorPort = (
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursorCandidate | null,
) => Readonly<{
  inputContractRef: string;
  value: TraversalValue;
}> | null;

export type ResolveConstructionIntentPort<Error> = (
  predecessorPrefix: DurablePrefixCoordinate,
  cursor: TraversalCursorCandidate,
) => Effect.Effect<ConstructionIntentAdmission | null, Error>;

export type ResolveInitialChildCursorPort<Error> = (
  prepared: PreparedChildTraversal,
) => Effect.Effect<TraversalCursorCandidate | TraversalRefusal, Error>;

export type ResolveCCallLocusPort<Error> = (
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursorCandidate,
  term: Readonly<COfNode>,
) => Effect.Effect<CCallLocusCandidate | TraversalRefusal, Error>;

export type AdmitInitialTraversalCursorPort<Error> = (
  cursor: TraversalCursorCandidate,
  predecessorPrefix: DurablePrefixCoordinate,
) => Effect.Effect<
  TraversalCursorAdmission | TraversalCursorAdmissionRefusal,
  Error
>;

export type AdmitTraversalTransitionPort<Error> = (
  source: TraversalCursorCandidate,
  target: TraversalCursorCandidate | null,
  candidate: TraversalTransitionCandidate,
  predecessorPrefix: DurablePrefixCoordinate,
) => Effect.Effect<RouteTransitionResult, Error>;

export type ApplyAdmittedRoutePort<Error> = (
  successorPrefix: DurablePrefixCoordinate,
  source: TraversalCursorCandidate,
  target: TraversalCursorCandidate,
  expectedKind: "advance" | "retry",
  route: AdmittedRoute,
) => Effect.Effect<TraversalCursorCandidate | TraversalRefusal, Error>;

export type ResolveExecutableImplementationPort<Error> = (
  locus: ExecutableCCallLocusCandidate,
) => Effect.Effect<AdmittedImplementationResolutionRow | null, Error>;

export type ResolveInteractionContractPort<Error> = (
  locus: InteractionCCallLocusCandidate,
) => Effect.Effect<AdmittedInteractionContractRow | null, Error>;

export type OpenExecutableCCallPort<Error> = (
  locus: ExecutableCCallLocusCandidate,
  resolution: AdmittedImplementationResolutionRow,
  predecessorPrefix: DurablePrefixCoordinate,
) => Effect.Effect<CCallAdmission | CCallOpenRefusal, Error>;

export type OpenInteractionCCallPort<Error> = (
  locus: InteractionCCallLocusCandidate,
  interaction: AdmittedInteractionContractRow,
  predecessorPrefix: DurablePrefixCoordinate,
) => Effect.Effect<CCallAdmission | CCallOpenRefusal, Error>;

export type OpenWorkflowCCallPort<Error> = (
  term: Readonly<CWorkflowNode>,
  proposal: WorkflowCCallProposal,
  cursor: TraversalCursorCandidate,
  predecessorPrefix: DurablePrefixCoordinate,
) => Effect.Effect<CCallAdmission | CCallOpenRefusal, Error>;

export type BindProbabilisticLeafEffectsPort = (
  locus: ExecutableCCallLocusCandidate & Readonly<{ computeRegime: "F_P" }>,
  opened: CCallAdmission,
  workerContracts: Readonly<{
    instructionContractRef: string;
    resultContractRef: string;
  }>,
) => ProbabilisticLeafEffectPort;

export type InvokeLeafOwnerPort<Error> = (
  locus: ExecutableCCallLocusCandidate,
  opened: CCallAdmission,
  resolution: AdmittedImplementationResolutionRow,
  leafPort: LeafInvocationPort,
  input: TraversalValue,
  bindProbabilisticEffects: ((workerContracts: Readonly<{
    instructionContractRef: string;
    resultContractRef: string;
  }>) => ProbabilisticLeafEffectPort) | null,
) => Effect.Effect<LeafInvocationOwnerResult, Error>;

export type AdmitLeafResultPort<Error> = (
  locus: ExecutableCCallLocusCandidate,
  opened: CCallAdmission,
  resolution: AdmittedImplementationResolutionRow,
  leafPort: LeafInvocationPort,
  input: TraversalValue,
  ownerReceipt: Exclude<LeafInvocationOwnerResult, Readonly<{
    kind: "leaf_invocation_owner_refusal";
  }>>,
) => Effect.Effect<
  ResultCCallOutcomeReceipt | RetryCCallOutcomeReceipt |
    BlockedCCallOutcomeReceipt,
  Error
>;

export type AdmitCCallJudgmentPort<Error> = (
  graph: Readonly<GtlGraph>,
  graphFunction: Readonly<GraphFunction>,
  cursor: TraversalCursorCandidate,
  outcome: ResultCCallOutcomeReceipt,
  candidate: JudgmentCandidate,
) => Effect.Effect<
  JudgedCCallOutcomeReceipt | BlockedCCallOutcomeReceipt,
  Error
>;

export type PlanInteractionPort<Error> = (
  locus: InteractionCCallLocusCandidate,
  opened: CCallAdmission,
  request: TraversalValue,
) => Effect.Effect<PendingInteractionAdmissionPlan, Error>;

export type AdmitInteractionHoldPort<Error> = (
  locus: InteractionCCallLocusCandidate,
  opened: CCallAdmission,
  request: TraversalValue,
  plan: PendingInteractionAdmissionPlan,
  candidate: TraversalTransitionCandidate,
) => Effect.Effect<FhInteractionHoldAdmission, Error>;

export type PlanRetryRuntimeFailurePort<Error> = (
  locus: ExecutableCCallLocusCandidate,
  outcome: RetryCCallOutcomeReceipt,
) => Effect.Effect<
  RetryRuntimeFailureTransitionPlan | RetryAdmissionRefusal,
  Error
>;

export type AdmitRetryRuntimeFailurePort<Error> = (
  locus: ExecutableCCallLocusCandidate,
  outcome: RetryCCallOutcomeReceipt,
  plan: RetryRuntimeFailureTransitionPlan,
) => Effect.Effect<RetryRuntimeFailureTransitionResult, Error>;

export type ProjectExecutableRetryInputPort<Error> = (
  request: ProjectExecutableRetryInputRequest,
) => Effect.Effect<ProjectExecutableRetryInputResult, Error>;

export type AssertFullRetryAttemptFrontierPort<Error> = (
  frontier: RetryAttemptFrontier,
) => Effect.Effect<void, Error>;

export type AdmitBlockedRetryTraversalTransitionPort<Error> = (
  locus: ExecutableCCallLocusCandidate,
  outcome: RetryCCallOutcomeReceipt,
  plan: RetryRuntimeFailureTransitionPlan,
  candidate: TraversalTransitionCandidate,
  predecessorPrefix: DurablePrefixCoordinate,
) => Effect.Effect<RouteTransitionResult, Error>;

export type ResolveTraversalCursorAdmissionEventRefPort<Error> = (
  predecessorPrefix: DurablePrefixCoordinate,
  cursor: TraversalCursorCandidate,
) => Effect.Effect<string | null, Error>;

export type PlanCompletedRetryProgressPort<Error> = (
  predecessorPrefix: DurablePrefixCoordinate,
  source: TraversalCursorCandidate,
  target: TraversalCursorCandidate,
  completion: RetrySuccessfulExitEvidence,
) => Effect.Effect<CompletedRetryProgressPlan | RetryAdmissionRefusal, Error>;

export type AdmitCompletedRetryTraversalTransitionPort<Error> = (
  predecessorPrefix: DurablePrefixCoordinate,
  source: TraversalCursorCandidate,
  target: TraversalCursorCandidate,
  candidate: TraversalTransitionCandidate,
  progressPlan: CompletedRetryProgressPlan,
  completion: RetrySuccessfulExitEvidence,
) => Effect.Effect<RouteTransitionResult, Error>;

export type AdmitCCallCompletionPort<Error> = (
  source: TraversalCursorCandidate,
  target: TraversalCursorCandidate | null,
  outcome: JudgedCCallOutcomeReceipt | BlockedCCallOutcomeReceipt,
  candidate: TraversalTransitionCandidate,
  predecessorPrefix: DurablePrefixCoordinate,
  terminalMode: "close_run" | "return_to_parent",
) => Effect.Effect<CCallCompletionResult, Error>;

export type PrepareChildTraversalPort<Error> = (
  request: ChildTraversalPreparationRequest,
) => Effect.Effect<ChildTraversalPreparationResult, Error>;

export type AdmitWorkflowChildPreparationRefusalPort<Error> = (
  parentCursor: TraversalCursorCandidate,
  parentCall: CCall,
  candidate: ChildPreparationRefusalCandidate,
  predecessorPrefix: DurablePrefixCoordinate,
) => Effect.Effect<
  ChildPreparationRefusalAdmission | ChildPreparationRefusalRefusal,
  Error
>;

export type AdmitCCallRejectionPort<Error> = (
  parentCursor: TraversalCursorCandidate,
  parentCall: CCall,
  rejection: ChildPreparationRefusalAdmission["admissionRejection"],
  predecessorPrefix: DurablePrefixCoordinate,
) => Effect.Effect<BlockedCCallOutcomeReceipt, Error>;

export type AdmitWorkflowChildFoldbackPort<Error> = (
  parentCursor: TraversalCursorCandidate,
  parentCall: CCall,
  childExecutionBasis: ExecutionBasis,
  childTraversalScope: OpenedTraversalScope,
  childCompletion: ExecutableTraversalCompletion,
) => Effect.Effect<ChildFoldbackAdmission | ChildFoldbackRefusal, Error>;

export type AdmitWorkflowResultPort<Error> = (
  parentCursor: TraversalCursorCandidate,
  parentCall: CCall,
  parentInput: TraversalValue,
  foldback: ChildFoldbackAdmission,
  childCompletion: ExecutableTraversalCompletion,
) => Effect.Effect<
  ResultCCallOutcomeReceipt | RetryCCallOutcomeReceipt |
    BlockedCCallOutcomeReceipt,
  Error
>;

export type ResolveFanOutApplicationPort = (
  graph: Readonly<GtlGraph>,
  batchRef: string | null,
) => Readonly<FanOutApplication> | null;

export type AdmitFanOutCompletionPort<Error> = (
  application: Readonly<FanOutApplication>,
  source: TraversalCursorCandidate,
  outcome: JudgedCCallOutcomeReceipt,
  completionKind: "complete_vector" | "partial_stop",
) => Effect.Effect<FanOutCompletionResult, Error>;

export type ProjectJudgedCCallOutcomePort<Error> = (
  predecessorPrefix: DurablePrefixCoordinate,
  cCall: CCall,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
) => Effect.Effect<JudgedCCallOutcomeReceipt | null, Error>;

export type ProjectDeferredApplicationPort<Error> = (
  predecessorPrefix: DurablePrefixCoordinate,
  coordinates: Readonly<{
    runId: string;
    frameId: string;
    sourceCursorRef: string;
    cCallRef: string;
    resultRef: string;
    judgmentRef: string;
  }>,
) => Effect.Effect<DeferredApplicationProjection | null, Error>;

export type AdmitRecursionChildPreparationRefusalPort<Error> = (
  application: Readonly<RecurseApplication>,
  source: TraversalCursorCandidate,
  parentOutcome: JudgedCCallOutcomeReceipt,
  candidate: ChildPreparationRefusalCandidate,
  predecessorPrefix: DurablePrefixCoordinate,
) => Effect.Effect<ApplicationChildPreparationRefusalResult, Error>;

export type AdmitRecursionChildFoldbackPort<Error> = (
  application: Readonly<RecurseApplication>,
  parentCursor: TraversalCursorCandidate,
  parentOutcome: JudgedCCallOutcomeReceipt,
  childExecutionBasis: ExecutionBasis,
  childTraversalScope: OpenedTraversalScope,
  childCompletion: ExecutableTraversalCompletion,
) => Effect.Effect<ApplicationChildFoldbackResult, Error>;

export type AdmitRecursionCompletionPort<Error> = (
  application: Readonly<RecurseApplication>,
  source: TraversalCursorCandidate,
  target: TraversalCursorCandidate | null,
  parentOutcome: JudgedCCallOutcomeReceipt,
  foldback: ApplicationChildFoldbackReceipt,
  candidate: TraversalTransitionCandidate,
) => Effect.Effect<CCallCompletionResult, Error>;

export type ProjectCCallCompletionPort<Error> = (
  source: TraversalCursorCandidate,
  admission: CCallCompletionAdmission,
  appliedTarget: TraversalCursorCandidate | null,
) => Effect.Effect<ExecutableTraversalCompletion, Error>;

export type AdmitRuntimeFailurePort<Error> = (
  executionBasis: ExecutionBasis,
  scope: OpenedTraversalScope,
  predecessorPrefix: DurablePrefixCoordinate,
  stage: "c_call_open" | "hog_traversal" | "implementation_load" |
    "operation_application" | "output_contract" | "route",
  subject: JsonValue,
  diagnosticRef: string,
  causationEventRefs: readonly string[],
) => Effect.Effect<RuntimeFailureAdmissionReceipt, Error>;

export type StructuralTerm = Exclude<
  CProgramNode,
  Readonly<{ kind: "c_of" | "c_workflow" }>
>;
