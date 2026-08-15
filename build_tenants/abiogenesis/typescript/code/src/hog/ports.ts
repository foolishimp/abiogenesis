import type * as Effect from "effect/Effect";

import type {
  CCall,
  CCallAdmission,
  CCallLocusCandidate,
  ChildFoldbackAdmission,
  ExecutableCCallLocusCandidate,
  InteractionCCallLocusCandidate,
  JudgmentCandidate,
  PendingInteractionAdmissionPlan,
  WorkflowCCallProposal,
} from "../abg/c_call.js";
import type {
  BlockedCCallOutcomeReceipt,
  CCallCompletionAdmission,
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
  ExecutableRetryInput,
  ProjectExecutableRetryInputRequest,
  RetryRuntimeFailureTransitionAdmission,
  RetryRuntimeFailureTransitionPlan,
  RetrySuccessfulExitEvidence,
} from "../abg/retry.js";
import type { ReplayState } from "../abg/replay.js";
import type { RouteTransitionAdmission } from "../abg/traversal_route.js";
import type {
  TraversalCursorAdmission,
  TraversalCursorCandidate,
} from "../abg/traversal_cursor.js";
import type { TraversalTransitionCandidate } from "../abg/traversal_transition.js";
import type {
  ChildTraversalPreparationRequest,
  PreparedChildTraversal,
} from "./child_traversal.js";
import type {
  CompleteInteractionResumeInput,
} from "./interaction_resume.js";
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
  RecurseApplication,
} from "../gtl/contracts.js";
import type {
  ClosedLeafOwnerReceipt,
  LeafInvocationPort,
  ProbabilisticLeafEffectPort,
} from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";

type TraversalValue = Readonly<Record<string, JsonValue>>;

export type ProjectReplayPort<Error> = (
  predecessorPrefix: DurablePrefixCoordinate,
  cursor: TraversalCursorCandidate,
) => Effect.Effect<ReplayState, Error>;

export type ResolveTraversalValuePort<Error> = (
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursorCandidate,
) => Effect.Effect<TraversalValue, Error>;

export type ResolveInitialChildCursorPort<Error> = (
  prepared: PreparedChildTraversal,
) => Effect.Effect<TraversalCursorCandidate, Error>;

export type ResolveCCallLocusPort<Error> = (
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursorCandidate,
  term: Readonly<COfNode>,
) => Effect.Effect<CCallLocusCandidate, Error>;

export type AdmitInitialTraversalCursorPort<Error> = (
  cursor: TraversalCursorCandidate,
  predecessorPrefix: DurablePrefixCoordinate,
) => Effect.Effect<TraversalCursorAdmission, Error>;

export type AdmitTraversalTransitionPort<Error> = (
  source: TraversalCursorCandidate,
  target: TraversalCursorCandidate | null,
  candidate: TraversalTransitionCandidate,
  predecessorPrefix: DurablePrefixCoordinate,
) => Effect.Effect<RouteTransitionAdmission, Error>;

export type ResolveExecutableImplementationPort<Error> = (
  locus: ExecutableCCallLocusCandidate,
) => Effect.Effect<AdmittedImplementationResolutionRow, Error>;

export type ResolveInteractionContractPort<Error> = (
  locus: InteractionCCallLocusCandidate,
) => Effect.Effect<AdmittedInteractionContractRow, Error>;

export type OpenExecutableCCallPort<Error> = (
  locus: ExecutableCCallLocusCandidate,
  resolution: AdmittedImplementationResolutionRow,
  predecessorPrefix: DurablePrefixCoordinate,
) => Effect.Effect<CCallAdmission, Error>;

export type OpenInteractionCCallPort<Error> = (
  locus: InteractionCCallLocusCandidate,
  interaction: AdmittedInteractionContractRow,
  predecessorPrefix: DurablePrefixCoordinate,
) => Effect.Effect<CCallAdmission, Error>;

export type OpenWorkflowCCallPort<Error> = (
  term: Readonly<CWorkflowNode>,
  proposal: WorkflowCCallProposal,
  cursor: TraversalCursorCandidate,
  predecessorPrefix: DurablePrefixCoordinate,
) => Effect.Effect<CCallAdmission, Error>;

export type BindProbabilisticLeafEffectsPort<Error> = (
  locus: ExecutableCCallLocusCandidate & Readonly<{ computeRegime: "F_P" }>,
  opened: CCallAdmission,
) => Effect.Effect<ProbabilisticLeafEffectPort, Error>;

export type InvokeLeafOwnerPort<Error> = (
  locus: ExecutableCCallLocusCandidate,
  opened: CCallAdmission,
  resolution: AdmittedImplementationResolutionRow,
  leafPort: LeafInvocationPort,
  input: TraversalValue,
  probabilisticEffects: ProbabilisticLeafEffectPort | null,
) => Effect.Effect<ClosedLeafOwnerReceipt, Error>;

export type AdmitLeafResultPort<Error> = (
  locus: ExecutableCCallLocusCandidate,
  opened: CCallAdmission,
  resolution: AdmittedImplementationResolutionRow,
  leafPort: LeafInvocationPort,
  input: TraversalValue,
  ownerReceipt: ClosedLeafOwnerReceipt,
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
) => Effect.Effect<RetryRuntimeFailureTransitionPlan, Error>;

export type AdmitRetryRuntimeFailurePort<Error> = (
  locus: ExecutableCCallLocusCandidate,
  outcome: RetryCCallOutcomeReceipt,
  plan: RetryRuntimeFailureTransitionPlan,
) => Effect.Effect<RetryRuntimeFailureTransitionAdmission, Error>;

export type ProjectExecutableRetryInputPort<Error> = (
  request: ProjectExecutableRetryInputRequest,
) => Effect.Effect<ExecutableRetryInput, Error>;

export type AdmitBlockedRetryTraversalTransitionPort<Error> = (
  locus: ExecutableCCallLocusCandidate,
  outcome: RetryCCallOutcomeReceipt,
  plan: RetryRuntimeFailureTransitionPlan,
  candidate: TraversalTransitionCandidate,
  predecessorPrefix: DurablePrefixCoordinate,
) => Effect.Effect<RouteTransitionAdmission, Error>;

export type ResolveTraversalCursorAdmissionEventRefPort<Error> = (
  predecessorPrefix: DurablePrefixCoordinate,
  cursor: TraversalCursorCandidate,
) => Effect.Effect<string | null, Error>;

export type PlanCompletedRetryProgressPort<Error> = (
  predecessorPrefix: DurablePrefixCoordinate,
  source: TraversalCursorCandidate,
  target: TraversalCursorCandidate,
  completion: RetrySuccessfulExitEvidence,
) => Effect.Effect<CompletedRetryProgressPlan, Error>;

export type AdmitCompletedRetryTraversalTransitionPort<Error> = (
  predecessorPrefix: DurablePrefixCoordinate,
  source: TraversalCursorCandidate,
  target: TraversalCursorCandidate,
  candidate: TraversalTransitionCandidate,
  progressPlan: CompletedRetryProgressPlan,
  completion: RetrySuccessfulExitEvidence,
) => Effect.Effect<RouteTransitionAdmission, Error>;

export type AdmitCCallCompletionPort<Error> = (
  source: TraversalCursorCandidate,
  target: TraversalCursorCandidate | null,
  outcome: JudgedCCallOutcomeReceipt | BlockedCCallOutcomeReceipt,
  candidate: TraversalTransitionCandidate,
  predecessorPrefix: DurablePrefixCoordinate,
) => Effect.Effect<CCallCompletionAdmission, Error>;

export type PrepareChildTraversalPort<Error> = (
  request: ChildTraversalPreparationRequest,
) => Effect.Effect<PreparedChildTraversal, Error>;

export type AdmitWorkflowChildFoldbackPort<Error> = (
  parentCursor: TraversalCursorCandidate,
  parentCall: CCall,
  childExecutionBasis: ExecutionBasis,
  childTraversalScope: OpenedTraversalScope,
  childCompletion: ExecutableTraversalCompletion,
) => Effect.Effect<ChildFoldbackAdmission, Error>;

export type AdmitWorkflowResultPort<Error> = (
  parentCursor: TraversalCursorCandidate,
  parentCall: CCall,
  parentInput: TraversalValue,
  foldback: ChildFoldbackAdmission,
) => Effect.Effect<ResultCCallOutcomeReceipt, Error>;

export type AdmitRecursionChildFoldbackPort<Error> = (
  application: Readonly<RecurseApplication>,
  parentCursor: TraversalCursorCandidate,
  parentOutcome: JudgedCCallOutcomeReceipt,
  childExecutionBasis: ExecutionBasis,
  childTraversalScope: OpenedTraversalScope,
  childCompletion: ExecutableTraversalCompletion,
) => Effect.Effect<ApplicationChildFoldbackReceipt, Error>;

export type AdmitRecursionCompletionPort<Error> = (
  application: Readonly<RecurseApplication>,
  source: TraversalCursorCandidate,
  target: TraversalCursorCandidate | null,
  parentOutcome: JudgedCCallOutcomeReceipt,
  foldback: ApplicationChildFoldbackReceipt,
  candidate: TraversalTransitionCandidate,
) => Effect.Effect<CCallCompletionAdmission, Error>;

export type ProjectCCallCompletionPort<Error> = (
  source: TraversalCursorCandidate,
  admission: CCallCompletionAdmission,
  target: TraversalCursorCandidate | null,
) => Effect.Effect<ExecutableTraversalCompletion, Error>;

export type ResumeInteractionOwnerPort<Error> = (
  input: CompleteInteractionResumeInput,
) => Effect.Effect<ExecutableTraversalCompletion, Error>;

export type StructuralTerm = Exclude<
  CProgramNode,
  Readonly<{ kind: "c_of" | "c_workflow" }>
>;
