import * as Effect from "effect/Effect";

import type {
  AdmittedCCallResult,
  CCall,
  CCallAdmission,
  ExecutableCCallLocusCandidate,
  InteractionCCallLocusCandidate,
  PendingInteractionAdmissionPlan,
  WorkflowCCallProposal,
} from "../abg/c_call.js";
import type {
  BlockedCCallOutcomeReceipt,
  CCallCompletionResult,
  JudgedCCallOutcomeReceipt,
  ResultCCallOutcomeReceipt,
} from "../abg/c_call_outcome.js";
import type {
  AdmittedImplementationSet,
  ExecutionBasis,
} from "../abg/execution_basis.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type {
  ApplicationChildPreparationRefusalAdmission,
} from "../abg/graph_application.js";
import type { DeferredApplicationProjection } from "../abg/deferred_application.js";
import type {
  CompletedRetryProgressPlan,
  RetryCompletedProgressAdmission,
} from "../abg/retry.js";
import type { ReplayState } from "../abg/replay.js";
import type {
  TraversalCursorCandidate,
} from "../abg/traversal_cursor.js";
import {
  completeTraversalTransitionCandidate,
} from "../abg/traversal_transition.js";
import type { CWorkflowNode } from "../gtl/c_algebra.js";
import type {
  ClosureContract,
  FanOutApplication,
  GtlGraph,
  GtlProgram,
  RecurseApplication,
} from "../gtl/contracts.js";
import { recursionTerminationDecision } from "../gtl/graph_applications.js";
import type {
  ClosedLeafOwnerReceipt,
  LeafInvocationPort,
} from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { PreparedChildTraversal } from "./child_traversal.js";
import type { ChildTraversalPreparationRefusal } from "./child_traversal.js";
import type {
  CompleteInteractionResumeInput,
} from "./interaction_resume.js";
import { proposeJudgmentCandidate } from "./judgment.js";
import type {
  AdmitCCallCompletionPort,
  AdmitCCallRejectionPort,
  AdmitCCallJudgmentPort,
  AdmitBlockedRetryTraversalTransitionPort,
  AdmitCompletedRetryTraversalTransitionPort,
  AdmitFanOutCompletionPort,
  AdmitInitialTraversalCursorPort,
  AdmitInteractionHoldPort,
  AdmitLeafResultPort,
  AdmitRecursionChildFoldbackPort,
  AdmitRecursionChildPreparationRefusalPort,
  AdmitRecursionCompletionPort,
  AdmitRetryRuntimeFailurePort,
  AdmitRuntimeFailurePort,
  AdmitTraversalTransitionPort,
  AdmitWorkflowChildFoldbackPort,
  AdmitWorkflowChildPreparationRefusalPort,
  AdmitWorkflowResultPort,
  ApplyAdmittedRoutePort,
  AssertFullRetryAttemptFrontierPort,
  BindProbabilisticLeafEffectsPort,
  InvokeLeafOwnerPort,
  MaterializedInputAtCursorPort,
  OpenExecutableCCallPort,
  OpenInteractionCCallPort,
  OpenWorkflowCCallPort,
  PlanInteractionPort,
  PlanCompletedRetryProgressPort,
  PlanRetryRuntimeFailurePort,
  PrepareChildTraversalPort,
  ProjectDeferredApplicationPort,
  ProjectExecutableRetryInputPort,
  ProjectJudgedCCallOutcomePort,
  ProjectCCallCompletionPort,
  ProjectReplayPort,
  ResolveExecutableImplementationPort,
  ResolveCCallLocusPort,
  ResolveConstructionIntentPort,
  ResolveFanOutApplicationPort,
  ResolveInitialChildCursorPort,
  ResolveInteractionContractPort,
  ResolveTraversalCursorAdmissionEventRefPort,
  StructuralTerm,
} from "./ports.js";
import {
  deriveCompletedTraversalCursor,
  deriveRecursionReentryCursor,
  deriveRetryTraversalCursor,
  deriveStructuralTargetCursor,
  deriveInteractionSuccessorInputCarrierRef,
  resolveTraversalTerm,
  type TraversalRefusal,
  type TraverseInput,
} from "./traversal.js";
import {
  proposeBlockedRoute,
  proposeCCallOutcomeTransition,
  proposeFanOutRoute,
  proposeHoldRoute,
  proposeInteractionResumeRoute,
  proposeRecursionRoute,
  proposeRetryRoute,
  proposeStructuralRoute,
  type RouteProposalRefusal,
} from "./route_proposal.js";
import { deriveCSourceContinuation } from "../gtl/source_path.js";
import type { OpenedTraversalScope } from "../abg/open_call.js";
import type { GraphValidation } from "../validator/graph.js";
import {
  projectBlockedRetryTraversalCompletion,
  projectExecutableTraversalCompletion,
  projectHeldTraversalCompletion,
  type ExecutableTraversalCompletion,
  type HeldParentTraversalSuspension,
  type HeldRecursionSuspension,
  type HeldWorkflowSuspension,
} from "./traversal_completion.js";

type TraversalValue = Readonly<Record<string, JsonValue>>;

interface EvaluationFrame {
  readonly traversal: TraverseInput;
  readonly implementationSet: AdmittedImplementationSet;
  readonly leafPort: LeafInvocationPort;
  readonly closureContract: Readonly<ClosureContract>;
  readonly graphEntryInput: TraversalValue;
  readonly graphEntryInputDigest: `sha256:${string}`;
  readonly cursor: TraversalCursorCandidate;
  readonly input: TraversalValue;
  readonly terminalMode: "close_run" | "return_to_parent";
}

interface WorkflowReturnFrame {
  readonly relation: "workflow";
  readonly parent: EvaluationFrame;
  readonly parentCall: CCall;
  readonly application: Readonly<FanOutApplication> | null;
  readonly childExecutionBasis: ExecutionBasis;
  readonly childTraversalScope: OpenedTraversalScope;
  readonly childInput: TraversalValue;
  readonly childInputDigest: `sha256:${string}`;
}

interface RecursionReturnFrame {
  readonly relation: "recursion";
  readonly parent: EvaluationFrame;
  readonly parentOutcome: JudgedCCallOutcomeReceipt;
  readonly application: Readonly<RecurseApplication>;
  readonly childExecutionBasis: ExecutionBasis;
  readonly childTraversalScope: OpenedTraversalScope;
  readonly childInput: TraversalValue;
  readonly childInputDigest: `sha256:${string}`;
}

export type HogReturnFrame = WorkflowReturnFrame | RecursionReturnFrame;

interface EvaluationInputBase {
  readonly traversal: TraverseInput;
  readonly implementationSet: AdmittedImplementationSet;
  readonly leafPort: LeafInvocationPort;
  readonly closureContract: Readonly<ClosureContract>;
  readonly graphEntryInput: TraversalValue;
  readonly graphEntryInputDigest: `sha256:${string}`;
  readonly cursor: TraversalCursorCandidate;
  readonly input: TraversalValue;
  readonly eventTime: string;
  readonly correlationId: string;
  readonly terminalMode: "close_run" | "return_to_parent";
}

export interface HogFreshEvaluationInput extends EvaluationInputBase {
  readonly entry: "fresh";
  readonly predecessorPrefix: DurablePrefixCoordinate;
}

export interface HogFhInteractionResumeInput {
  readonly entry: "fh_interaction_resume";
  readonly interaction: CompleteInteractionResumeInput;
  readonly program: Readonly<GtlProgram>;
  readonly graphValidation: GraphValidation;
  readonly implementationSet: AdmittedImplementationSet;
  readonly leafPort: LeafInvocationPort;
  readonly graphEntryInput: TraversalValue;
  readonly graphEntryInputDigest: `sha256:${string}`;
  readonly terminalMode: "close_run" | "return_to_parent";
  readonly parentSuspensions: readonly HeldParentTraversalSuspension[];
}

export type HogEvaluationInput =
  | HogFreshEvaluationInput
  | HogFhInteractionResumeInput;

export type HogEvaluationResult = ExecutableTraversalCompletion;

export type HogEvaluationError<OwnerError> =
  | OwnerError
  | RouteProposalRefusal
  | TraversalRefusal;

interface EvaluateState {
  readonly stateKind: "evaluate";
  readonly frame: EvaluationFrame;
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly returns: readonly HogReturnFrame[];
}

interface RehydrateInteractionState {
  readonly stateKind: "rehydrate_interaction";
  readonly input: HogFhInteractionResumeInput;
}

interface PrepareWorkflowState {
  readonly stateKind: "prepare_workflow";
  readonly parent: EvaluationFrame;
  readonly term: Readonly<CWorkflowNode>;
  readonly parentCall: CCallAdmission;
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly returns: readonly HogReturnFrame[];
}

interface PrepareRecursionState {
  readonly stateKind: "prepare_recursion";
  readonly parent: EvaluationFrame;
  readonly application: Readonly<RecurseApplication>;
  readonly parentOutcome: JudgedCCallOutcomeReceipt;
  readonly deferred: DeferredApplicationProjection;
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly returns: readonly HogReturnFrame[];
}

interface FoldbackState {
  readonly stateKind: "foldback";
  readonly parentReturn: HogReturnFrame;
  readonly childCompletion: ExecutableTraversalCompletion;
  readonly returns: readonly HogReturnFrame[];
}

interface DoneState {
  readonly stateKind: "done";
  readonly result: HogEvaluationResult;
}

type OpenState =
  | EvaluateState
  | FoldbackState
  | PrepareRecursionState
  | PrepareWorkflowState
  | RehydrateInteractionState;
type State = DoneState | OpenState;

export type HogEvaluatorServices<OwnerError> = Readonly<{
  projectReplay: ProjectReplayPort<OwnerError>;
  materializedInputAtCursor: MaterializedInputAtCursorPort;
  resolveConstructionIntent: ResolveConstructionIntentPort<OwnerError>;
  resolveInitialChildCursor: ResolveInitialChildCursorPort<OwnerError>;
  resolveCCallLocus: ResolveCCallLocusPort<OwnerError>;
  admitInitialCursor: AdmitInitialTraversalCursorPort<OwnerError>;
  admitTransition: AdmitTraversalTransitionPort<OwnerError>;
  applyAdmittedRoute: ApplyAdmittedRoutePort<OwnerError>;
  resolveExecutable: ResolveExecutableImplementationPort<OwnerError>;
  resolveInteraction: ResolveInteractionContractPort<OwnerError>;
  openExecutable: OpenExecutableCCallPort<OwnerError>;
  openInteraction: OpenInteractionCCallPort<OwnerError>;
  openWorkflow: OpenWorkflowCCallPort<OwnerError>;
  bindProbabilistic: BindProbabilisticLeafEffectsPort;
  invokeLeaf: InvokeLeafOwnerPort<OwnerError>;
  admitLeafResult: AdmitLeafResultPort<OwnerError>;
  admitJudgment: AdmitCCallJudgmentPort<OwnerError>;
  planInteraction: PlanInteractionPort<OwnerError>;
  admitInteractionHold: AdmitInteractionHoldPort<OwnerError>;
  planRetryFailure: PlanRetryRuntimeFailurePort<OwnerError>;
  admitRetryFailure: AdmitRetryRuntimeFailurePort<OwnerError>;
  projectRetryInput: ProjectExecutableRetryInputPort<OwnerError>;
  assertFullRetryFrontier: AssertFullRetryAttemptFrontierPort<OwnerError>;
  admitBlockedRetryTransition:
    AdmitBlockedRetryTraversalTransitionPort<OwnerError>;
  resolveCursorAdmissionEventRef:
    ResolveTraversalCursorAdmissionEventRefPort<OwnerError>;
  planCompletedRetryProgress: PlanCompletedRetryProgressPort<OwnerError>;
  admitCompletedRetryTransition:
    AdmitCompletedRetryTraversalTransitionPort<OwnerError>;
  admitCompletion: AdmitCCallCompletionPort<OwnerError>;
  projectCompletion: ProjectCCallCompletionPort<OwnerError>;
  prepareChild: PrepareChildTraversalPort<OwnerError>;
  admitWorkflowPreparationRefusal:
    AdmitWorkflowChildPreparationRefusalPort<OwnerError>;
  admitCCallRejection: AdmitCCallRejectionPort<OwnerError>;
  admitWorkflowFoldback: AdmitWorkflowChildFoldbackPort<OwnerError>;
  admitWorkflowResult: AdmitWorkflowResultPort<OwnerError>;
  resolveFanOutApplication: ResolveFanOutApplicationPort;
  admitFanOutCompletion: AdmitFanOutCompletionPort<OwnerError>;
  projectJudgedOutcome: ProjectJudgedCCallOutcomePort<OwnerError>;
  projectDeferredApplication: ProjectDeferredApplicationPort<OwnerError>;
  admitRecursionPreparationRefusal:
    AdmitRecursionChildPreparationRefusalPort<OwnerError>;
  admitRecursionFoldback: AdmitRecursionChildFoldbackPort<OwnerError>;
  admitRecursionCompletion: AdmitRecursionCompletionPort<OwnerError>;
  admitRuntimeFailure: AdmitRuntimeFailurePort<OwnerError>;
  rehydrateParentReturns: (
    predecessorPrefix: DurablePrefixCoordinate,
    suspensions: readonly HeldParentTraversalSuspension[],
  ) => Effect.Effect<readonly HogReturnFrame[] | null, OwnerError>;
}>;

function freezeReturns(
  returns: readonly HogReturnFrame[],
): readonly HogReturnFrame[] {
  return Object.freeze([...returns]);
}

function frameFromInput(input: EvaluationInputBase): EvaluationFrame {
  return Object.freeze({
    traversal: input.traversal,
    implementationSet: input.implementationSet,
    leafPort: input.leafPort,
    closureContract: input.closureContract,
    graphEntryInput: input.graphEntryInput,
    graphEntryInputDigest: input.graphEntryInputDigest,
    cursor: input.cursor,
    input: input.input,
    terminalMode: input.terminalMode,
  });
}

function frameFromInteractionResume(
  input: HogFhInteractionResumeInput,
): EvaluationFrame {
  const interaction = input.interaction;
  return Object.freeze({
    traversal: Object.freeze({
      program: input.program,
      graphFunction: interaction.graphFunction,
      graph: interaction.graph,
      graphValidation: input.graphValidation,
      executionBasis: interaction.executionBasis,
      openedTraversalScope: interaction.openedTraversalScope,
    }),
    implementationSet: input.implementationSet,
    leafPort: input.leafPort,
    closureContract: interaction.closureContract,
    graphEntryInput: input.graphEntryInput,
    graphEntryInputDigest: input.graphEntryInputDigest,
    cursor: interaction.successorCursor,
    input: interaction.resume.successorInputValue,
    terminalMode: input.terminalMode,
  });
}

function isTraversalValue(value: JsonValue): value is TraversalValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isProbabilisticLocus(
  locus: ExecutableCCallLocusCandidate,
): locus is ExecutableCCallLocusCandidate &
  Readonly<{ computeRegime: "F_P" }> {
  return locus.computeRegime === "F_P";
}

function resultFromOutcome(
  outcome: JudgedCCallOutcomeReceipt | BlockedCCallOutcomeReceipt,
): AdmittedCCallResult {
  return outcome.disposition === "judged"
    ? outcome.admitted.result
    : outcome.result;
}

function recursionApplication(
  graph: Readonly<GtlGraph>,
  compositionRef: string | null,
): Readonly<RecurseApplication> | null {
  const application = compositionRef === null
    ? undefined
    : graph.template.applications.find(
        (candidate) => candidate.applicationRef === compositionRef,
      );
  return application?.relationKind === "recurse" ? application : null;
}

function terminalState(
  completion: ExecutableTraversalCompletion,
  returns: readonly HogReturnFrame[],
): State {
  const parentReturn = returns.at(-1);
  return parentReturn === undefined
    ? Object.freeze({ stateKind: "done" as const, result: completion })
    : Object.freeze({
        stateKind: "foldback" as const,
        parentReturn,
        childCompletion: completion,
        returns: freezeReturns(returns.slice(0, -1)),
      });
}

function continueAfterCompletion(
  frame: EvaluationFrame,
  target: TraversalCursorCandidate | null,
  completion: ExecutableTraversalCompletion,
  returns: readonly HogReturnFrame[],
  materializedInputAtCursor: MaterializedInputAtCursorPort,
): State | null {
  if (completion.disposition !== "advanced" || target === null) {
    if (completion.disposition === "advanced") return null;
    return terminalState(completion, returns);
  }
  const nextCursor = completion.nextCursor;
  const resultValue = completion.resultValue;
  const materialized = materializedInputAtCursor(
    frame.traversal.graph,
    nextCursor,
  );
  const nextInput = materialized?.value ?? resultValue;
  if (
    nextCursor === null ||
    nextCursor.cursorRef !== target.cursorRef ||
    nextCursor.cursorDigest !== target.cursorDigest ||
    !isTraversalValue(nextInput) ||
    sha256Canonical(nextInput) !== nextCursor.inputDigest ||
    completion.nextInputContractRef === null ||
    (materialized !== null
      ? materialized.inputContractRef !== completion.nextInputContractRef
      : !frame.leafPort.validateContractValueByRef(
          completion.nextInputContractRef,
          nextInput,
        ))
  ) {
    return null;
  }
  return Object.freeze({
    stateKind: "evaluate" as const,
    frame: Object.freeze({
      ...frame,
      cursor: nextCursor,
      input: nextInput,
    }),
    predecessorPrefix: completion.successorPrefix,
    returns: freezeReturns(returns),
  });
}

function preparedFrame(
  prepared: PreparedChildTraversal,
  cursor: TraversalCursorCandidate,
  leafPort: LeafInvocationPort,
): EvaluationFrame {
  return Object.freeze({
    traversal: Object.freeze({
      program: prepared.program,
      graphFunction: prepared.graphFunction,
      graph: prepared.graph,
      graphValidation: prepared.graphValidation,
      executionBasis: prepared.executionBasis,
      openedTraversalScope: prepared.openedTraversalScope,
    }),
    implementationSet: prepared.implementationSet,
    leafPort,
    closureContract: prepared.closureContract,
    graphEntryInput: prepared.input,
    graphEntryInputDigest: prepared.inputDigest,
    cursor,
    input: prepared.input,
    terminalMode: "return_to_parent",
  });
}

export function projectParentSuspensions(
  returns: readonly HogReturnFrame[],
): readonly HeldParentTraversalSuspension[] {
  return Object.freeze([...returns].reverse().map((frame) => {
    const parent = frame.parent;
    if (frame.relation === "workflow") {
      const suspension: HeldWorkflowSuspension = Object.freeze({
        kind: "held_workflow_suspension",
        schemaVersion: "5.0.0",
        parentExecutionBasisRef: parent.traversal.executionBasis.basisRef,
        parentTraversalScope: parent.traversal.openedTraversalScope,
        parentGraph: parent.traversal.graph,
        parentClosureContract: parent.closureContract,
        parentCCall: frame.parentCall,
        application: frame.application,
        sourceCursor: parent.cursor,
        parentGraphInput: parent.graphEntryInput,
        parentGraphInputDigest: parent.graphEntryInputDigest,
        parentInput: parent.input,
        parentInputDigest: parent.cursor.inputDigest,
        childExecutionBasisRef: frame.childExecutionBasis.basisRef,
        childTraversalScopeRef: frame.childTraversalScope.scopeRef,
        childInput: frame.childInput,
        childInputDigest: frame.childInputDigest,
        terminalMode: parent.terminalMode,
      });
      return suspension;
    }
    const admitted = frame.parentOutcome.admitted;
    const suspension: HeldRecursionSuspension = Object.freeze({
      kind: "held_recursion_suspension",
      schemaVersion: "5.0.0",
      parentExecutionBasisRef: parent.traversal.executionBasis.basisRef,
      parentTraversalScope: parent.traversal.openedTraversalScope,
      parentGraph: parent.traversal.graph,
      parentClosureContract: parent.closureContract,
      parentGraphInput: parent.graphEntryInput,
      parentGraphInputDigest: parent.graphEntryInputDigest,
      application: frame.application,
      evaluatorCCall: admitted.cCall,
      evaluatorResult: admitted.result,
      evaluatorJudgment: admitted.judgment,
      sourceCursor: parent.cursor,
      evaluatorInput: parent.input,
      evaluatorInputDigest: parent.cursor.inputDigest,
      childExecutionBasisRef: frame.childExecutionBasis.basisRef,
      childTraversalScopeRef: frame.childTraversalScope.scopeRef,
      childInput: frame.childInput,
      childInputDigest: frame.childInputDigest,
      terminalMode: parent.terminalMode,
    });
    return suspension;
  }));
}

export function evaluateHog<OwnerError>(
  input: HogEvaluationInput,
  services: HogEvaluatorServices<OwnerError>,
): Effect.Effect<HogEvaluationResult, HogEvaluationError<OwnerError>> {
  const {
    projectReplay,
    materializedInputAtCursor,
    resolveConstructionIntent,
    resolveInitialChildCursor,
    resolveCCallLocus,
    admitInitialCursor,
    admitTransition,
    applyAdmittedRoute,
    resolveExecutable,
    resolveInteraction,
    openExecutable,
    openInteraction,
    openWorkflow,
    bindProbabilistic,
    invokeLeaf,
    admitLeafResult,
    admitJudgment,
    planInteraction,
    admitInteractionHold,
    planRetryFailure,
    admitRetryFailure,
    projectRetryInput,
    assertFullRetryFrontier,
    admitBlockedRetryTransition,
    resolveCursorAdmissionEventRef,
    planCompletedRetryProgress,
    admitCompletedRetryTransition,
    admitCompletion,
    projectCompletion,
    prepareChild,
    admitWorkflowPreparationRefusal,
    admitCCallRejection,
    admitWorkflowFoldback,
    admitWorkflowResult,
    resolveFanOutApplication,
    admitFanOutCompletion,
    projectJudgedOutcome,
    projectDeferredApplication,
    admitRecursionPreparationRefusal,
    admitRecursionFoldback,
    admitRecursionCompletion,
    admitRuntimeFailure,
    rehydrateParentReturns,
  } = services;
  const evaluationClock = input.entry === "fresh"
    ? { eventTime: input.eventTime, correlationId: input.correlationId }
    : input.interaction.clock;
  const initial: OpenState = input.entry === "fresh"
    ? Object.freeze({
        stateKind: "evaluate" as const,
        frame: frameFromInput(input),
        predecessorPrefix: input.predecessorPrefix,
        returns: freezeReturns([]),
      })
    : Object.freeze({
        stateKind: "rehydrate_interaction" as const,
        input,
      });

  const failureState = (
    frame: EvaluationFrame,
    predecessorPrefix: DurablePrefixCoordinate,
    stage: string,
    diagnosticRef: string,
    subject: JsonValue,
    causationEventRefs: readonly string[] = [],
  ): Effect.Effect<State, OwnerError> => Effect.map(
    admitRuntimeFailure(
      frame.traversal.executionBasis,
      frame.traversal.openedTraversalScope,
      predecessorPrefix,
      "hog_traversal",
      { stage, candidate: subject },
      diagnosticRef,
      causationEventRefs,
    ),
    (receipt) => Object.freeze({
      stateKind: "done" as const,
      result: projectExecutableTraversalCompletion(
        "failed",
        receipt.replayState,
        receipt.successorPrefix,
        { diagnosticRef },
      ),
    }),
  );

  const continueOrFail = (
    frame: EvaluationFrame,
    target: TraversalCursorCandidate | null,
    completion: ExecutableTraversalCompletion,
    returns: readonly HogReturnFrame[],
    stage: string,
  ): Effect.Effect<State, OwnerError> => {
    const next = continueAfterCompletion(
      frame,
      target,
      completion,
      returns,
      materializedInputAtCursor,
    );
    return next === null
      ? failureState(
          frame,
          completion.successorPrefix,
          stage,
          "diagnostic://abiogenesis/hog/advanced-result-basis-absent@5",
          {
            disposition: completion.disposition,
            cursorRef: completion.nextCursor?.cursorRef ?? null,
          },
        )
      : Effect.succeed(next);
  };

  const completeAdmittedCCall = (
    frame: EvaluationFrame,
    source: TraversalCursorCandidate,
    target: TraversalCursorCandidate | null,
    admission: CCallCompletionResult,
    predecessorPrefix: DurablePrefixCoordinate,
    returns: readonly HogReturnFrame[],
    stage: string,
  ): Effect.Effect<State, OwnerError> => {
    if (admission.kind !== "c_call_completion_admission") {
      return failureState(
        frame,
        predecessorPrefix,
        `${stage}-admission`,
        `diagnostic://abiogenesis/hog/${admission.code}@5`,
        { kind: admission.kind, code: admission.code },
      );
    }
    if (admission.disposition === "application_ready") {
      return failureState(
        frame,
        predecessorPrefix,
        `${stage}-application-return`,
        "diagnostic://abiogenesis/hog/unexpected-application-return@5",
        { disposition: admission.disposition },
      );
    }
    if (admission.disposition !== "advanced") {
      return Effect.flatMap(
        projectCompletion(source, admission, null),
        (completion) => continueOrFail(
          frame,
          null,
          completion,
          returns,
          `${stage}-projection`,
        ),
      );
    }
    if (target === null) {
      return failureState(
        frame,
        admission.transition.successorPrefix,
        `${stage}-target`,
        "diagnostic://abiogenesis/hog/admitted-target-absent@5",
        { disposition: admission.disposition },
      );
    }
    return Effect.flatMap(
      applyAdmittedRoute(
        admission.transition.successorPrefix,
        source,
        target,
        "advance",
        admission.transition.route,
      ),
      (applied) => applied.kind === "traversal_refusal"
        ? failureState(
            frame,
            admission.transition.successorPrefix,
            `${stage}-apply`,
            `diagnostic://abiogenesis/hog/${applied.code}@5`,
            { kind: applied.kind, code: applied.code },
          )
        : Effect.flatMap(
            Effect.succeed(projectExecutableTraversalCompletion(
              "advanced",
              admission.transition.replayState,
              admission.transition.successorPrefix,
              {
                cCallRef: admission.outcome.admitted.cCall.cCallRef,
                resultRef: admission.outcome.admitted.result.resultRef,
                judgmentRef:
                  admission.outcome.admitted.judgment.judgmentRef,
                nextCursor: applied,
                resultValue: admission.outcome.admitted.result.value,
                continuationKind: "advance",
                nextInputContractRef:
                  admission.outcome.admitted.cCall.outputContractRef,
              },
            )),
            (completion) => continueOrFail(
              frame,
              applied,
              completion,
              returns,
              `${stage}-projection`,
            ),
          ),
    );
  };

  const afterOutcome = (
    frame: EvaluationFrame,
    outcome: JudgedCCallOutcomeReceipt | BlockedCCallOutcomeReceipt,
    returns: readonly HogReturnFrame[],
  ): Effect.Effect<State, HogEvaluationError<OwnerError>> => {
    const admitted = outcome.disposition === "judged" ? outcome.admitted : null;
    const result = resultFromOutcome(outcome);
    const target = admitted?.judgment.judgment === "advance"
      ? deriveCompletedTraversalCursor(frame.traversal.graph, frame.cursor, {
          inputRef: result.resultRef,
          inputDigest: result.valueDigest,
        })
      : null;
    if (target?.kind === "traversal_refusal") {
      return failureState(
        frame,
        outcome.successorPrefix,
        "c-call-target",
        `diagnostic://abiogenesis/hog/${target.code}@5`,
        { kind: target.kind, code: target.code },
      );
    }
    const application = admitted === null
      ? null
      : recursionApplication(
          frame.traversal.graph,
          admitted.cCall.compositionRef,
        );
    if (
      outcome.disposition === "judged" && application !== null &&
      outcome.admitted.judgment.judgment === "advance"
    ) {
      const termination = recursionTerminationDecision(application, result.value);
      if (termination === null) {
        return failureState(
          frame,
          outcome.successorPrefix,
          "recursion-termination",
          "diagnostic://abiogenesis/hog/recursion-termination-value-invalid@5",
          {
            applicationRef: application.applicationRef,
            resultRef: result.resultRef,
          },
        );
      }
      if (!termination) {
        const judged = outcome;
        return Effect.flatMap(
          projectJudgedOutcome(
            outcome.successorPrefix,
            judged.admitted.cCall,
            judged.admitted.result,
            judged.admitted.judgment,
          ),
          (exactOutcome) => Effect.flatMap(
            projectDeferredApplication(outcome.successorPrefix, {
              runId: judged.admitted.cCall.runId,
              frameId: judged.admitted.cCall.frameId,
              sourceCursorRef: frame.cursor.cursorRef,
              cCallRef: judged.admitted.cCall.cCallRef,
              resultRef: judged.admitted.result.resultRef,
              judgmentRef: judged.admitted.judgment.judgmentRef,
            }),
            (deferred) => {
              if (
                exactOutcome?.disposition !== "judged" ||
                deferred === null ||
                sha256Canonical(
                  exactOutcome.admitted as unknown as JsonValue,
                ) !== sha256Canonical(
                  judged.admitted as unknown as JsonValue,
                ) ||
                exactOutcome.admitted.cCall.cCallRef !== deferred.cCallRef ||
                exactOutcome.admitted.result.resultRef !== deferred.resultRef ||
                exactOutcome.admitted.judgment.judgmentRef !==
                  deferred.judgmentRef ||
                exactOutcome.admitted.judgment.admissionEventRef !==
                  deferred.judgmentEventRef ||
                sha256Canonical(deferred.resultValue) !==
                  exactOutcome.admitted.result.valueDigest
              ) {
                return failureState(
                  frame,
                  outcome.successorPrefix,
                  "recursion-restoration",
                  "diagnostic://abiogenesis/hog/recursion-restoration-mismatch@5",
                  {
                    cCallRef: judged.admitted.cCall.cCallRef,
                    resultRef: judged.admitted.result.resultRef,
                    judgmentRef: judged.admitted.judgment.judgmentRef,
                  },
                );
              }
              return Effect.succeed(Object.freeze({
                stateKind: "prepare_recursion" as const,
                parent: frame,
                application,
                parentOutcome: exactOutcome,
                deferred,
                predecessorPrefix: outcome.successorPrefix,
                returns: freezeReturns(returns),
              }));
            },
          ),
        );
      }
    }
    const proposal = proposeCCallOutcomeTransition({
      graph: frame.traversal.graph,
      graphFunction: frame.traversal.graphFunction,
      sourceCursor: frame.cursor,
      targetCursor: target,
      outcome,
      terminalizeNonAdvance: frame.terminalMode !== "return_to_parent",
    });
    if (proposal.kind !== "traversal_transition_candidate") {
      return failureState(
        frame,
        outcome.successorPrefix,
        "c-call-route",
        `diagnostic://abiogenesis/hog/${proposal.code}@5`,
        { kind: proposal.kind, code: proposal.code },
      );
    }
    return Effect.flatMap(
      admitCompletion(
        frame.cursor,
        target,
        outcome,
        proposal,
        outcome.successorPrefix,
        frame.terminalMode,
      ),
      (admission) => completeAdmittedCCall(
        frame,
        frame.cursor,
        target,
        admission,
        outcome.successorPrefix,
        returns,
        "c-call-completion",
      ),
    );
  };

  const afterResult = (
    frame: EvaluationFrame,
    locus: ExecutableCCallLocusCandidate,
    ownerReceipt: ClosedLeafOwnerReceipt,
    outcome: ResultCCallOutcomeReceipt,
    returns: readonly HogReturnFrame[],
  ): Effect.Effect<State, HogEvaluationError<OwnerError>> => {
    const relation = frame.leafPort.resolveJudgmentRelation(
      outcome.cCall.judgmentPredicateRef,
    );
    if (relation === null) {
      return failureState(
        frame,
        outcome.successorPrefix,
        "leaf-judgment-relation",
        "diagnostic://abiogenesis/hog/judgment-relation-absent@5",
        { cCallRef: outcome.cCall.cCallRef },
      );
    }
    const candidate = proposeJudgmentCandidate({
      cCall: outcome.cCall,
      result: outcome.result,
      replayState: outcome.replayState,
      contractRef: outcome.cCall.judgmentContractRef,
      decision: ownerReceipt.candidate.disposition === "success"
        ? {
            decisionClass: "evaluate" as const,
            input: frame.input,
            relation,
          }
        : {
            decisionClass: "refuse" as const,
            predicateRef: outcome.cCall.judgmentPredicateRef,
            reasonRef: ownerReceipt.candidate.diagnosticRef,
          },
    });
    return Effect.flatMap(
      admitJudgment(
        frame.traversal.graph,
        frame.traversal.graphFunction,
        locus.cursor,
        outcome,
        candidate,
      ),
      (judged) => afterOutcome(frame, judged, returns),
    );
  };

  const evaluateExecutable = (
    state: EvaluateState,
    locus: ExecutableCCallLocusCandidate,
  ): Effect.Effect<State, HogEvaluationError<OwnerError>> => Effect.gen(
    function* () {
      const resolution = yield* resolveExecutable(locus);
      if (resolution === null) {
        return yield* failureState(
          state.frame,
          state.predecessorPrefix,
          "leaf-resolution",
          "diagnostic://abiogenesis/implementation/admitted-row-absent@5",
          { programLocusRef: locus.programLocusRef },
        );
      }
      const opened = yield* openExecutable(
        locus,
        resolution,
        state.predecessorPrefix,
      );
      if (opened.kind !== "c_call_admission") {
        return yield* failureState(
          state.frame,
          state.predecessorPrefix,
          "leaf-open",
          `diagnostic://abiogenesis/c-call/${opened.code}@5`,
          { kind: opened.kind, code: opened.code },
        );
      }
      const bindProbabilisticEffects = isProbabilisticLocus(locus)
        ? (workerContracts: Readonly<{
            instructionContractRef: string;
            resultContractRef: string;
          }>) => bindProbabilistic(locus, opened, workerContracts)
        : null;
      const ownerReceipt = yield* invokeLeaf(
        locus,
        opened,
        resolution,
        state.frame.leafPort,
        state.frame.input,
        bindProbabilisticEffects,
      );
      if (ownerReceipt.kind === "leaf_invocation_owner_refusal") {
        return yield* failureState(
          state.frame,
          opened.successorPrefix,
          "leaf-owner",
          ownerReceipt.diagnosticRef,
          { kind: ownerReceipt.kind, code: ownerReceipt.code },
        );
      }
      const outcome = yield* admitLeafResult(
        locus,
        opened,
        resolution,
        state.frame.leafPort,
        state.frame.input,
        ownerReceipt,
      );
      if (outcome.disposition === "blocked") {
        return yield* afterOutcome(state.frame, outcome, state.returns);
      }
      if (outcome.disposition === "result") {
        return yield* afterResult(
          state.frame,
          locus,
          ownerReceipt,
          outcome,
          state.returns,
        );
      }
      const plan = yield* planRetryFailure(locus, outcome);
      if (plan.kind !== "retry_runtime_failure_transition_plan") {
        return yield* failureState(
          state.frame,
          outcome.successorPrefix,
          "retry-plan",
          `diagnostic://abiogenesis/hog/${plan.code}@5`,
          { kind: plan.kind, code: plan.code },
        );
      }
      const planned = plan.transition;
      if (planned.disposition === "blocked") {
        const route = proposeBlockedRoute(
          state.frame.traversal.graph,
          locus,
          outcome.cCall,
          planned.close.judgment.judgmentRef,
          plan.replayState,
          outcome.cCall.transitionContractRef,
          planned.stoppedProgresses.map((progress) => progress.progressRef),
        );
        if (route.kind !== "traversal_route_candidate") {
          return yield* failureState(
            state.frame,
            outcome.successorPrefix,
            "retry-blocked-route",
            `diagnostic://abiogenesis/hog/${route.code}@5`,
            { kind: route.kind, code: route.code },
          );
        }
        const candidate = completeTraversalTransitionCandidate({
          kind: "traversal_transition_candidate",
          schemaVersion: "5.0.0",
          transitionClass: "route",
          route,
          evidence: {
            evidenceClass: "blocked",
            graphFunction: state.frame.traversal.graphFunction,
            cCall: outcome.cCall,
            resultRef: planned.close.result.resultRef,
            judgmentRef: planned.close.judgment.judgmentRef,
            judgmentEventRef: planned.close.judgment.admissionEventRef,
            reasonRef: planned.close.judgment.reasonRef,
            stoppedProgresses: planned.stoppedProgresses,
          },
          terminalizeRun: state.frame.terminalMode !== "return_to_parent",
        });
        const admitted = yield* admitBlockedRetryTransition(
          locus,
          outcome,
          plan,
          candidate,
          outcome.successorPrefix,
        );
        if (admitted.kind !== "route_transition_admission") {
          return yield* failureState(
            state.frame,
            outcome.successorPrefix,
            "retry-blocked-admission",
            `diagnostic://abiogenesis/hog/${admitted.code}@5`,
            { kind: admitted.kind, code: admitted.code },
          );
        }
        return terminalState(
          projectBlockedRetryTraversalCompletion({ plan, route: admitted }),
          state.returns,
        );
      }
      if (planned.eligibility.disposition !== "retry") {
        return yield* failureState(
          state.frame,
          outcome.successorPrefix,
          "retry-eligibility",
          "diagnostic://abiogenesis/hog/retry-not-permitted@5",
          {
            disposition: planned.eligibility.disposition,
            retryBoundaryRef: planned.eligibility.retryBoundaryRef,
          },
        );
      }
      const transition = yield* admitRetryFailure(locus, outcome, plan);
      if (transition.kind !== "retry_runtime_failure_transition_admission") {
        return yield* failureState(
          state.frame,
          outcome.successorPrefix,
          "retry-failure-admission",
          `diagnostic://abiogenesis/hog/${transition.code}@5`,
          { kind: transition.kind, code: transition.code },
        );
      }
      const request = {
        prefix: transition.successorPrefix,
        selector: {
          kind: "retry_frontier_selector" as const,
          schemaVersion: "5.0.0" as const,
          runId: state.frame.traversal.openedTraversalScope.runId,
          graphCallId: state.frame.traversal.openedTraversalScope.graphCallId,
          frameId: state.frame.traversal.openedTraversalScope.frameId,
          retryBoundaryRef: transition.progress.retryBoundaryRef,
          retryProgressRef: transition.progress.progressRef,
        },
        program: state.frame.traversal.program,
        graphFunction: state.frame.traversal.graphFunction,
        graph: state.frame.traversal.graph,
      } as const;
      const retryInput = yield* projectRetryInput(request);
      const exactRetryInput = yield* projectRetryInput(request);
      if (
        retryInput.kind !== "executable_retry_input" ||
        exactRetryInput.kind !== "executable_retry_input" ||
        sha256Canonical(retryInput as unknown as JsonValue) !==
          sha256Canonical(exactRetryInput as unknown as JsonValue) ||
        retryInput.projectionRef !== exactRetryInput.projectionRef ||
        retryInput.projectionDigest !== exactRetryInput.projectionDigest ||
        retryInput.retryFrontier.frontierRef !==
          exactRetryInput.retryFrontier.frontierRef ||
        retryInput.retryFrontier.frontierDigest !==
          exactRetryInput.retryFrontier.frontierDigest ||
        retryInput.sourceCursor.cursorRef !== state.frame.cursor.cursorRef ||
        retryInput.sourceCursor.cursorDigest !== state.frame.cursor.cursorDigest ||
        retryInput.inputDigest !== sha256Canonical(retryInput.inputValue) ||
        !state.frame.leafPort.validateContractValueByRef(
          retryInput.inputContractRef,
          retryInput.inputValue,
        )
      ) {
        return yield* failureState(
          state.frame,
          transition.successorPrefix,
          "retry-projection",
          "diagnostic://abiogenesis/hog/projected-retry-carrier-mismatch@5",
          {
            kind: retryInput.kind,
            sourceCursorRef: retryInput.kind === "executable_retry_input"
              ? retryInput.sourceCursor.cursorRef
              : null,
          },
        );
      }
      yield* assertFullRetryFrontier(retryInput.retryFrontier);
      const source = retryInput.sourceCursor;
      const target = deriveRetryTraversalCursor(
        state.frame.traversal.graph,
        source,
        { inputRef: retryInput.inputRef, inputDigest: retryInput.inputDigest },
      );
      if (target.kind === "traversal_refusal") {
        return yield* failureState(
          state.frame,
          transition.successorPrefix,
          "retry-target",
          `diagnostic://abiogenesis/hog/${target.code}@5`,
          { kind: target.kind, code: target.code },
        );
      }
      const replay = yield* projectReplay(transition.successorPrefix, source);
      const route = proposeRetryRoute(
        state.frame.traversal.graph,
        source,
        target,
        retryInput.cCall,
        transition.progress,
        replay,
        retryInput.cCall.transitionContractRef,
      );
      if (route.kind !== "traversal_route_candidate") {
        return yield* failureState(
          state.frame,
          transition.successorPrefix,
          "retry-route",
          `diagnostic://abiogenesis/hog/${route.code}@5`,
          { kind: route.kind, code: route.code },
        );
      }
      const candidate = completeTraversalTransitionCandidate({
        kind: "traversal_transition_candidate",
        schemaVersion: "5.0.0",
        transitionClass: "retry",
        route,
        evidence: {
          evidenceClass: "retry",
          graphFunction: state.frame.traversal.graphFunction,
          cCall: retryInput.cCall,
          progress: transition.progress,
        },
        retryInput: retryInput.inputValue,
        terminalizeRun: false,
      });
      const admission = yield* admitTransition(
        source,
        target,
        candidate,
        transition.successorPrefix,
      );
      if (
        admission.kind !== "route_transition_admission" ||
        admission.retryAttempt === null
      ) {
        return yield* failureState(
          state.frame,
          transition.successorPrefix,
          "retry-route-admission",
          admission.kind === "route_transition_admission"
            ? "diagnostic://abiogenesis/hog/retry-attempt-absent@5"
            : `diagnostic://abiogenesis/hog/${admission.code}@5`,
          { kind: admission.kind },
        );
      }
      const applied = yield* applyAdmittedRoute(
        admission.successorPrefix,
        source,
        target,
        "retry",
        admission.route,
      );
      if (applied.kind === "traversal_refusal") {
        return yield* failureState(
          state.frame,
          admission.successorPrefix,
          "retry-route-apply",
          `diagnostic://abiogenesis/hog/${applied.code}@5`,
          { kind: applied.kind, code: applied.code },
        );
      }
      return Object.freeze({
        stateKind: "evaluate" as const,
        frame: Object.freeze({
          ...state.frame,
          cursor: applied,
          input: retryInput.inputValue,
        }),
        predecessorPrefix: admission.successorPrefix,
        returns: freezeReturns(state.returns),
      });
    },
  );

  const evaluateInteraction = (
    state: EvaluateState,
    locus: InteractionCCallLocusCandidate,
  ): Effect.Effect<State, HogEvaluationError<OwnerError>> => Effect.gen(
    function* () {
      const interaction = yield* resolveInteraction(locus);
      if (interaction === null) {
        return yield* failureState(
          state.frame,
          state.predecessorPrefix,
          "interaction-resolution",
          "diagnostic://abiogenesis/implementation/admitted-interaction-absent@5",
          { programLocusRef: locus.programLocusRef },
        );
      }
      const opened = yield* openInteraction(
        locus,
        interaction,
        state.predecessorPrefix,
      );
      if (opened.kind !== "c_call_admission") {
        return yield* failureState(
          state.frame,
          state.predecessorPrefix,
          "interaction-open",
          `diagnostic://abiogenesis/c-call/${opened.code}@5`,
          { kind: opened.kind, code: opened.code },
        );
      }
      const plan: PendingInteractionAdmissionPlan = yield* planInteraction(
        locus,
        opened,
        state.frame.input,
      );
      const route = proposeHoldRoute(
        state.frame.traversal.graph,
        locus,
        opened.cCall,
        plan.pending.judgment,
        plan.replayState,
        locus.continuationContractRef,
      );
      if (route.kind !== "traversal_route_candidate") {
        return yield* failureState(
          state.frame,
          opened.successorPrefix,
          "interaction-hold-route",
          `diagnostic://abiogenesis/hog/${route.code}@5`,
          { kind: route.kind, code: route.code },
        );
      }
      const candidate = completeTraversalTransitionCandidate({
        kind: "traversal_transition_candidate",
        schemaVersion: "5.0.0",
        transitionClass: "route",
        route,
        evidence: {
          evidenceClass: "hold",
          graphFunction: state.frame.traversal.graphFunction,
          cCall: opened.cCall,
          result: plan.pending.result,
          judgment: plan.pending.judgment,
        },
        terminalizeRun: false,
      });
      const hold = yield* admitInteractionHold(
        locus,
        opened,
        state.frame.input,
        plan,
        candidate,
      );
      const replay = yield* projectReplay(
        hold.successorPrefix,
        state.frame.cursor,
      );
      return Object.freeze({
        stateKind: "done" as const,
        result: projectHeldTraversalCompletion({
          hold,
          cursor: state.frame.cursor,
          graph: state.frame.traversal.graph,
          closureContract: state.frame.closureContract,
          replayState: replay,
          parentSuspensions: projectParentSuspensions(state.returns),
        }),
      });
    },
  );

  const evaluateStructural = (
    state: EvaluateState,
    term: StructuralTerm,
  ): Effect.Effect<State, HogEvaluationError<OwnerError>> => {
    const target = deriveStructuralTargetCursor(
      state.frame.traversal.graph,
      state.frame.cursor,
      term,
    );
    if (target?.kind === "traversal_refusal") {
      return failureState(
        state.frame,
        state.predecessorPrefix,
        "structural-target",
        `diagnostic://abiogenesis/hog/${target.code}@5`,
        { kind: target.kind, code: target.code },
      );
    }
    if (target === null) {
      return failureState(
        state.frame,
        state.predecessorPrefix,
        "structural-target",
        "diagnostic://abiogenesis/hog/structural-step-refused@5",
        { termKind: term.kind },
      );
    }
    const materialized = term.kind === "c_retry"
      ? materializedInputAtCursor(state.frame.traversal.graph, target)
      : null;
    const value = materialized?.value ?? state.frame.input;
    if (
      sha256Canonical(value) !== target.inputDigest ||
      (term.kind === "c_retry" &&
        ((materialized !== null &&
          materialized.inputContractRef !== term.inputCarrierRef) ||
          !state.frame.leafPort.validateContractValueByRef(
            term.inputCarrierRef,
            value,
          )))
    ) {
      return failureState(
        state.frame,
        state.predecessorPrefix,
        "structural-input",
        "diagnostic://abiogenesis/hog/materialized-structural-input-mismatch@5",
        { cursorRef: target.cursorRef, inputRef: target.inputRef },
      );
    }
    return Effect.suspend(
      (): Effect.Effect<State, HogEvaluationError<OwnerError>> => {
        const advance = (
          replay: ReplayState,
          completedProgresses:
            readonly RetryCompletedProgressAdmission[],
          completedRetry: Readonly<{
            plan: CompletedRetryProgressPlan;
            completion: Readonly<{
              completionClass: "structural_identity_success";
              completionWitnessEventRef: string;
            }>;
          }> | null,
        ): Effect.Effect<State, HogEvaluationError<OwnerError>> => {
          const route = proposeStructuralRoute(
            state.frame.traversal.graph,
            state.frame.cursor,
            target,
            term.kind === "c_retry" ? "retry" : "advance",
            replay,
            completedProgresses,
          );
          if (route.kind !== "traversal_route_candidate") {
            return failureState(
              state.frame,
              state.predecessorPrefix,
              "structural-route",
              `diagnostic://abiogenesis/hog/${route.code}@5`,
              { kind: route.kind, code: route.code },
            );
          }
          const candidate = term.kind === "c_retry"
            ? completeTraversalTransitionCandidate({
                kind: "traversal_transition_candidate",
                schemaVersion: "5.0.0",
                transitionClass: "retry",
                route,
                evidence: null,
                retryInput: value,
                terminalizeRun: false,
              })
            : completeTraversalTransitionCandidate({
                kind: "traversal_transition_candidate",
                schemaVersion: "5.0.0",
                transitionClass: "route",
                route,
                evidence: completedRetry === null
                  ? null
                  : {
                      evidenceClass: "structural_identity",
                      graphFunction: state.frame.traversal.graphFunction,
                      completionClass: "structural_identity_success",
                      completionWitnessEventRef:
                        completedRetry.completion.completionWitnessEventRef,
                      completedProgresses,
                    },
                terminalizeRun: false,
              });
          const admitted = completedRetry === null
            ? admitTransition(
                state.frame.cursor,
                target,
                candidate,
                state.predecessorPrefix,
              )
            : admitCompletedRetryTransition(
                state.predecessorPrefix,
                state.frame.cursor,
                target,
                candidate,
                completedRetry.plan,
                completedRetry.completion,
              );
          return Effect.flatMap(admitted, (admission) => {
            if (
              admission.kind !== "route_transition_admission" ||
              (term.kind === "c_retry" && admission.retryAttempt === null)
            ) {
              return failureState(
                state.frame,
                state.predecessorPrefix,
                "structural-route-admission",
                admission.kind === "route_transition_admission"
                  ? "diagnostic://abiogenesis/hog/retry-attempt-absent@5"
                  : `diagnostic://abiogenesis/hog/${admission.code}@5`,
                { kind: admission.kind },
              );
            }
            return Effect.flatMap(
              applyAdmittedRoute(
                admission.successorPrefix,
                state.frame.cursor,
                target,
                term.kind === "c_retry" ? "retry" : "advance",
                admission.route,
              ),
              (applied) => applied.kind === "traversal_refusal"
                ? failureState(
                    state.frame,
                    admission.successorPrefix,
                    "structural-route-apply",
                    `diagnostic://abiogenesis/hog/${applied.code}@5`,
                    { kind: applied.kind, code: applied.code },
                  )
                : Effect.succeed(Object.freeze({
                    stateKind: "evaluate" as const,
                    frame: Object.freeze({
                      ...state.frame,
                      cursor: applied,
                      input: value,
                    }),
                    predecessorPrefix: admission.successorPrefix,
                    returns: freezeReturns(state.returns),
                  })),
            );
          });
        };
        const exitsRetry = term.kind === "c_identity" &&
          target.retryPath.length < state.frame.cursor.retryPath.length;
        if (!exitsRetry) {
          return Effect.flatMap(
            projectReplay(state.predecessorPrefix, state.frame.cursor),
            (replay) => advance(replay, [], null),
          );
        }
        return Effect.flatMap(
          resolveCursorAdmissionEventRef(
            state.predecessorPrefix,
            state.frame.cursor,
          ),
          (completionWitnessEventRef) => {
            if (completionWitnessEventRef === null) return failureState(
              state.frame,
              state.predecessorPrefix,
              "retry-exit-witness",
              "diagnostic://abiogenesis/hog/retry-exit-witness-absent@5",
              { cursorRef: state.frame.cursor.cursorRef },
            );
            const completion = Object.freeze({
              completionClass: "structural_identity_success" as const,
              completionWitnessEventRef,
            });
            return Effect.flatMap(
              planCompletedRetryProgress(
                state.predecessorPrefix,
                state.frame.cursor,
                target,
                completion,
              ),
              (plan) => plan.kind !== "completed_retry_progress_plan"
                ? failureState(
                    state.frame,
                    state.predecessorPrefix,
                    "retry-completion-plan",
                    `diagnostic://abiogenesis/hog/${plan.code}@5`,
                    { kind: plan.kind, code: plan.code },
                  )
                : advance(
                    plan.replayState,
                    plan.progresses,
                    { plan, completion },
                  ),
            );
          },
        );
      },
    );
  };
  const prepareChildFrame = (
    prepared: PreparedChildTraversal,
    parentReturn: HogReturnFrame,
    returns: readonly HogReturnFrame[],
  ): Effect.Effect<State, HogEvaluationError<OwnerError>> => {
    return Effect.flatMap(
      resolveInitialChildCursor(prepared),
      (cursor) => cursor.kind === "traversal_refusal"
        ? failureState(
            parentReturn.parent,
            prepared.successorPrefix,
            "child-initial-cursor",
            `diagnostic://abiogenesis/hog/${cursor.code}@5`,
            { kind: cursor.kind, code: cursor.code },
          )
        : Effect.flatMap(
            admitInitialCursor(cursor, prepared.successorPrefix),
            (admission) => admission.kind !== "traversal_cursor_admission"
              ? failureState(
                  parentReturn.parent,
                  prepared.successorPrefix,
                  "child-initial-cursor-admission",
                  `diagnostic://abiogenesis/hog/${admission.code}@5`,
                  { kind: admission.kind, code: admission.code },
                )
              : Effect.succeed(Object.freeze({
                  stateKind: "evaluate" as const,
                  frame: preparedFrame(
                    prepared,
                    cursor,
                    parentReturn.parent.leafPort,
                  ),
                  predecessorPrefix: admission.successorPrefix,
                  returns: freezeReturns([...returns, parentReturn]),
                })),
          ),
    );
  };

  const completeFanOutOutcome = (
    frame: WorkflowReturnFrame,
    outcome: JudgedCCallOutcomeReceipt,
    returns: readonly HogReturnFrame[],
  ): Effect.Effect<State, HogEvaluationError<OwnerError>> => {
    const sourceContinuation = deriveCSourceContinuation(
      frame.parent.traversal.graph.template,
      frame.parent.cursor.currentNodeRef,
      frame.parent.cursor.termPath,
    );
    const completionKind = outcome.admitted.judgment.judgment === "advance" &&
        sourceContinuation.kind === "c_source_continuation" &&
        sourceContinuation.disposition === "advance" &&
        sourceContinuation.relation === "compose_next"
      ? "complete_vector" as const
      : "partial_stop" as const;
    return Effect.flatMap(
      admitFanOutCompletion(
        frame.application!,
        frame.parent.cursor,
        outcome,
        completionKind,
      ),
      (receipt) => {
        if (receipt.kind !== "fan_out_completion_receipt") {
          return failureState(
            frame.parent,
            outcome.successorPrefix,
            "fan-out-completion",
            `diagnostic://abiogenesis/hog/${receipt.code}@5`,
            { kind: receipt.kind, code: receipt.code },
          );
        }
        const fanOut = receipt.admission;
        const target = fanOut.completionKind === "complete_vector"
          ? deriveCompletedTraversalCursor(
              frame.parent.traversal.graph,
              frame.parent.cursor,
              {
                inputRef: fanOut.outputVectorRef,
                inputDigest: fanOut.outputVectorDigest,
              },
            )
          : null;
        if (target?.kind === "traversal_refusal") {
          return failureState(
            frame.parent,
            receipt.successorPrefix,
            "fan-out-target",
            `diagnostic://abiogenesis/hog/${target.code}@5`,
            { kind: target.kind, code: target.code },
          );
        }
        return Effect.flatMap(
          projectReplay(receipt.successorPrefix, frame.parent.cursor),
          (replay) => {
            const route = proposeFanOutRoute(
              frame.parent.traversal.graph,
              frame.application!,
              frame.parent.cursor,
              target,
              outcome.admitted.cCall,
              fanOut,
              replay,
              outcome.admitted.cCall.transitionContractRef,
            );
            if (route.kind !== "traversal_route_candidate") {
              return failureState(
                frame.parent,
                receipt.successorPrefix,
                "fan-out-route",
                `diagnostic://abiogenesis/hog/${route.code}@5`,
                { kind: route.kind, code: route.code },
              );
            }
            const candidate = completeTraversalTransitionCandidate({
              kind: "traversal_transition_candidate",
              schemaVersion: "5.0.0",
              transitionClass: "route",
              route,
              evidence: {
                evidenceClass: "fan_out",
                graphFunction: frame.parent.traversal.graphFunction,
                cCall: outcome.admitted.cCall,
                result: outcome.admitted.result,
                judgment: outcome.admitted.judgment,
                application: frame.application!,
                completion: fanOut,
                completedProgresses: [],
              },
              terminalizeRun: route.routeKind !== "advance" &&
                frame.parent.terminalMode !== "return_to_parent",
            });
            return Effect.flatMap(
              admitCompletion(
                frame.parent.cursor,
                target,
                outcome,
                candidate,
                receipt.successorPrefix,
                frame.parent.terminalMode,
              ),
              (admission) => {
                if (fanOut.completionKind !== "complete_vector") {
                  return completeAdmittedCCall(
                    frame.parent,
                    frame.parent.cursor,
                    null,
                    admission,
                    receipt.successorPrefix,
                    returns,
                    "fan-out-partial-stop",
                  );
                }
                if (
                  admission.kind !== "c_call_completion_admission" ||
                  admission.disposition !== "advanced" ||
                  target === null
                ) {
                  return failureState(
                    frame.parent,
                    receipt.successorPrefix,
                    "fan-out-advance-admission",
                    admission.kind === "c_call_completion_admission"
                      ? "diagnostic://abiogenesis/hog/fan-out-advance-without-vector@5"
                      : `diagnostic://abiogenesis/hog/${admission.code}@5`,
                    { kind: admission.kind },
                  );
                }
                return Effect.flatMap(
                  applyAdmittedRoute(
                    admission.transition.successorPrefix,
                    frame.parent.cursor,
                    target,
                    "advance",
                    admission.transition.route,
                  ),
                  (applied) => applied.kind === "traversal_refusal"
                    ? failureState(
                        frame.parent,
                        admission.transition.successorPrefix,
                        "fan-out-route-apply",
                        `diagnostic://abiogenesis/hog/${applied.code}@5`,
                        { kind: applied.kind, code: applied.code },
                      )
                    : continueOrFail(
                        frame.parent,
                        applied,
                        projectExecutableTraversalCompletion(
                          "advanced",
                          admission.transition.replayState,
                          admission.transition.successorPrefix,
                          {
                            cCallRef: outcome.admitted.cCall.cCallRef,
                            resultRef: fanOut.outputVectorRef,
                            judgmentRef:
                              outcome.admitted.judgment.judgmentRef,
                            nextCursor: applied,
                            resultValue: fanOut.outputVector,
                            continuationKind: "advance",
                            nextInputContractRef:
                              fanOut.outputVectorContractRef,
                          },
                        ),
                        returns,
                        "fan-out-projection",
                      ),
                );
              },
            );
          },
        );
      },
    );
  };

  const completeBlockedRecursion = (
    state: PrepareRecursionState,
    preparation: ChildTraversalPreparationRefusal | null,
  ): Effect.Effect<State, HogEvaluationError<OwnerError>> => {
    const admitted = state.parentOutcome.admitted;
    const completeAt = (
      predecessorPrefix: DurablePrefixCoordinate,
      preparationRefusal: ApplicationChildPreparationRefusalAdmission | null,
    ): Effect.Effect<State, HogEvaluationError<OwnerError>> =>
      Effect.flatMap(
        projectReplay(predecessorPrefix, state.parent.cursor),
        (replay) => {
          const route = proposeRecursionRoute(
            state.parent.traversal.graph,
            state.application,
            state.parent.cursor,
            null,
            admitted.cCall,
            admitted.judgment,
            null,
            replay,
            admitted.cCall.transitionContractRef,
            "blocked",
            preparationRefusal,
          );
          if (route.kind !== "traversal_route_candidate") {
            return failureState(
              state.parent,
              predecessorPrefix,
              "recursion-blocked-route",
              `diagnostic://abiogenesis/hog/${route.code}@5`,
              { kind: route.kind, code: route.code },
            );
          }
          const candidate = completeTraversalTransitionCandidate({
            kind: "traversal_transition_candidate",
            schemaVersion: "5.0.0",
            transitionClass: "route",
            route,
            evidence: {
              evidenceClass: "recursion",
              application: state.application,
              cCall: admitted.cCall,
              result: admitted.result,
              judgment: admitted.judgment,
              foldback: null,
              preparationRefusal,
            },
            terminalizeRun:
              state.parent.terminalMode !== "return_to_parent",
          });
          return Effect.flatMap(
            admitCompletion(
              state.parent.cursor,
              null,
              state.parentOutcome,
              candidate,
              predecessorPrefix,
              state.parent.terminalMode,
            ),
            (completion) => completeAdmittedCCall(
              state.parent,
              state.parent.cursor,
              null,
              completion,
              predecessorPrefix,
              state.returns,
              "recursion-blocked",
            ),
          );
        },
      );
    if (preparation === null) {
      return completeAt(state.predecessorPrefix, null);
    }
    return Effect.flatMap(
      admitRecursionPreparationRefusal(
        state.application,
        state.parent.cursor,
        state.parentOutcome,
        {
          kind: "child_preparation_refusal_candidate",
          schemaVersion: "5.0.0",
          childGraphFunctionRef: state.application.graphFunctionRef,
          inputRef: admitted.result.resultRef,
          inputDigest: admitted.result.valueDigest,
          stage: preparation.stage,
          diagnosticRef: preparation.diagnosticRef,
          message: preparation.message,
        },
        preparation.successorPrefix,
      ),
      (receipt) => receipt.kind !==
          "application_child_preparation_refusal_receipt"
        ? failureState(
            state.parent,
            preparation.successorPrefix,
            "recursion-preparation-refusal-admission",
            `diagnostic://abiogenesis/hog/${receipt.code}@5`,
            { kind: receipt.kind, code: receipt.code },
          )
        : completeAt(receipt.successorPrefix, receipt.admission),
    );
  };

  const resumeInteraction = (
    state: RehydrateInteractionState,
  ): Effect.Effect<State, HogEvaluationError<OwnerError>> => {
    const frame = frameFromInteractionResume(state.input);
    const interaction = state.input.interaction;
    const { cCall, result, judgment } = interaction.heldInteraction;
    let successorContract: string | null;
    try {
      successorContract = deriveInteractionSuccessorInputCarrierRef(
        interaction.graph,
        interaction.heldInteraction.cursor,
      );
    } catch {
      return failureState(
        frame,
        interaction.predecessorPrefix,
        "interaction-resume-lineage",
        "diagnostic://abiogenesis/hog/interaction-resume-lineage-mismatch@5",
        { cCallRef: cCall.cCallRef },
      );
    }
    if (
      successorContract !== interaction.resume.successorInputContractRef ||
      interaction.successorCursor.cursorRef !==
        interaction.resume.successorCursorRef ||
      interaction.successorCursor.cursorDigest !==
        interaction.resume.successorCursorDigest ||
      interaction.successorCursor.inputRef !==
        interaction.resume.successorInputRef ||
      interaction.successorCursor.inputDigest !==
        interaction.resume.successorInputDigest ||
      sha256Canonical(interaction.resume.successorInputValue) !==
        interaction.resume.successorInputDigest ||
      sha256Canonical(interaction.resume.responseValue) !==
        interaction.resume.responseDigest ||
      (successorContract !== null &&
        !frame.leafPort.validateContractValueByRef(
          successorContract,
          interaction.resume.successorInputValue,
        ))
    ) {
      return failureState(
        frame,
        interaction.predecessorPrefix,
        "interaction-resume-currentness",
        "diagnostic://abiogenesis/hog/interaction-resume-currentness-mismatch@5",
        { cCallRef: cCall.cCallRef },
      );
    }
    return Effect.flatMap(
      rehydrateParentReturns(
        interaction.predecessorPrefix,
        state.input.parentSuspensions,
      ),
      (returns) => {
        if (returns === null) {
          return failureState(
            frame,
            interaction.predecessorPrefix,
            "interaction-parent-rehydration",
            "diagnostic://abiogenesis/hog/parent-rehydration-mismatch@5",
            { cCallRef: cCall.cCallRef },
          );
        }
        return Effect.flatMap(
          projectJudgedOutcome(
            interaction.predecessorPrefix,
            cCall,
            result,
            judgment,
          ),
          (outcome) => {
            if (
              outcome?.disposition !== "judged" ||
              sha256Canonical(
                outcome.admitted as unknown as JsonValue,
              ) !== sha256Canonical(
                { cCall, result, judgment } as unknown as JsonValue,
              ) ||
              outcome.admitted.cCall.cCallRef !== cCall.cCallRef ||
              outcome.admitted.result.resultRef !== result.resultRef ||
              outcome.admitted.judgment.judgmentRef !== judgment.judgmentRef
            ) {
              return failureState(
                frame,
                interaction.predecessorPrefix,
                "interaction-resume-restoration",
                "diagnostic://abiogenesis/hog/interaction-resume-truth-mismatch@5",
                { cCallRef: cCall.cCallRef },
              );
            }
            const target = deriveCompletedTraversalCursor(
              interaction.graph,
              interaction.successorCursor,
              {
                inputRef: interaction.resume.successorInputRef,
                inputDigest: interaction.resume.successorInputDigest,
              },
            );
            if (target?.kind === "traversal_refusal") {
              return failureState(
                frame,
                interaction.predecessorPrefix,
                "interaction-resume-target",
                `diagnostic://abiogenesis/hog/${target.code}@5`,
                { kind: target.kind, code: target.code },
              );
            }
            const route = proposeInteractionResumeRoute(
              interaction.graph,
              interaction.successorCursor,
              target,
              cCall,
              judgment,
              interaction.resume,
              outcome.replayState,
              cCall.transitionContractRef,
            );
            if (route.kind !== "traversal_route_candidate") {
              return failureState(
                frame,
                interaction.predecessorPrefix,
                "interaction-resume-route",
                `diagnostic://abiogenesis/hog/${route.code}@5`,
                { kind: route.kind, code: route.code },
              );
            }
            const candidate = completeTraversalTransitionCandidate({
              kind: "traversal_transition_candidate",
              schemaVersion: "5.0.0",
              transitionClass: "route",
              route,
              evidence: {
                evidenceClass: "interaction_resume",
                graphFunction: interaction.graphFunction,
                cCall,
                result,
                judgment,
                resume: interaction.resume,
                completedProgresses: [],
              },
              terminalizeRun: route.routeKind !== "advance" &&
                frame.terminalMode !== "return_to_parent",
            });
            return Effect.flatMap(
              admitCompletion(
                interaction.successorCursor,
                target,
                outcome,
                candidate,
                interaction.predecessorPrefix,
                frame.terminalMode,
              ),
              (admission) => {
                if (admission.kind !== "c_call_completion_admission") {
                  return failureState(
                    frame,
                    interaction.predecessorPrefix,
                    "interaction-resume-admission",
                    `diagnostic://abiogenesis/hog/${admission.code}@5`,
                    { kind: admission.kind, code: admission.code },
                  );
                }
                if (route.routeKind === "advance") {
                  if (
                    admission.disposition !== "advanced" ||
                    target === null || successorContract === null
                  ) {
                    return failureState(
                      frame,
                      interaction.predecessorPrefix,
                      "interaction-resume-advance",
                      "diagnostic://abiogenesis/hog/interaction-resume-advance-mismatch@5",
                      { disposition: admission.disposition },
                    );
                  }
                  return Effect.flatMap(
                    applyAdmittedRoute(
                      admission.transition.successorPrefix,
                      interaction.successorCursor,
                      target,
                      "advance",
                      admission.transition.route,
                    ),
                    (applied) => applied.kind === "traversal_refusal"
                      ? failureState(
                          frame,
                          admission.transition.successorPrefix,
                          "interaction-resume-apply",
                          `diagnostic://abiogenesis/hog/${applied.code}@5`,
                          { kind: applied.kind, code: applied.code },
                        )
                      : continueOrFail(
                          frame,
                          applied,
                          projectExecutableTraversalCompletion(
                            "advanced",
                            admission.transition.replayState,
                            admission.transition.successorPrefix,
                            {
                              cCallRef: cCall.cCallRef,
                              resultRef:
                                interaction.resume.successorInputRef,
                              judgmentRef: judgment.judgmentRef,
                              nextCursor: applied,
                              resultValue:
                                interaction.resume.successorInputValue,
                              continuationKind: "advance",
                              nextInputContractRef: successorContract,
                            },
                          ),
                          returns,
                          "interaction-resume-projection",
                        ),
                  );
                }
                if (
                  route.routeKind !== "terminal" ||
                  admission.disposition !== "closed"
                ) {
                  return failureState(
                    frame,
                    interaction.predecessorPrefix,
                    "interaction-resume-terminal",
                    "diagnostic://abiogenesis/hog/interaction-resume-terminal-mismatch@5",
                    { disposition: admission.disposition },
                  );
                }
                return continueOrFail(
                  frame,
                  null,
                  projectExecutableTraversalCompletion(
                    "closed",
                    admission.closure.replayState,
                    admission.transition.successorPrefix,
                    {
                      cCallRef: cCall.cCallRef,
                      resultRef: interaction.resume.responseRef,
                      judgmentRef: judgment.judgmentRef,
                      closureRef: admission.closure.closureRef,
                      resultValue: interaction.resume.responseValue,
                    },
                  ),
                  returns,
                  "interaction-resume-terminal-projection",
                );
              },
            );
          },
        );
      },
    );
  };

  const program = Effect.iterate<State, OpenState, never,
    HogEvaluationError<OwnerError>>(initial, {
    while: (state): state is OpenState => state.stateKind !== "done",
    body: (state): Effect.Effect<State, HogEvaluationError<OwnerError>> =>
      Effect.suspend(() => {
        if (state.stateKind === "rehydrate_interaction") {
          return resumeInteraction(state);
        }
        if (state.stateKind === "prepare_workflow") {
          return Effect.flatMap(
            resolveConstructionIntent(
              state.predecessorPrefix,
              state.parent.cursor,
            ),
            (intent) => {
              const invokesGraph = intent?.actionKind ===
                "invoke_graph_function";
              const selectedInput = invokesGraph
                ? intent.targetInput
                : state.parent.input;
              const selectedInputRef = invokesGraph
                ? intent.targetInputRef
                : state.parent.cursor.inputRef;
              const selectedInputDigest = invokesGraph
                ? intent.targetInputDigest
                : state.parent.cursor.inputDigest;
              if (
                selectedInput === null || selectedInputRef === null ||
                selectedInputDigest === null ||
                sha256Canonical(selectedInput) !== selectedInputDigest ||
                (invokesGraph &&
                  (intent.selectedGraphFunctionRef !==
                      state.term.graphFunctionRef ||
                    intent.targetProgramLocusRef !==
                      state.term.graphFunctionRef))
              ) {
                return failureState(
                  state.parent,
                  state.predecessorPrefix,
                  "workflow-selected-input",
                  "diagnostic://abiogenesis/hog/workflow-selected-input-mismatch@5",
                  { graphFunctionRef: state.term.graphFunctionRef },
                );
              }
              const application = resolveFanOutApplication(
                state.parent.traversal.graph,
                state.parentCall.cCall.batchRef,
              );
              if (
                (state.parentCall.cCall.batchRef !== null &&
                  application === null) ||
                (application !== null &&
                  (state.parentCall.cCall.batchRef !== application.batchRef ||
                    state.parent.traversal.graph.template.applications.find(
                      (candidate) => candidate.applicationRef ===
                        application.applicationRef,
                    ) !== application))
              ) {
                return failureState(
                  state.parent,
                  state.predecessorPrefix,
                  "workflow-fan-out-application",
                  "diagnostic://abiogenesis/hog/fan-out-application-absent@5",
                  { batchRef: state.parentCall.cCall.batchRef },
                );
              }
              return Effect.flatMap(prepareChild({
                predecessorPrefix: state.predecessorPrefix,
                parentExecutionBasis: state.parent.traversal.executionBasis,
                parentTraversalScope:
                  state.parent.traversal.openedTraversalScope,
                parentCCallRef: state.parentCall.cCall.cCallRef,
                childGraphFunctionRef: state.term.graphFunctionRef,
                inputRef: selectedInputRef,
                inputDigest: selectedInputDigest,
                input: selectedInput,
                eventTime: evaluationClock.eventTime,
                correlationId:
                  `${evaluationClock.correlationId}/workflow/prepare`,
              }), (prepared) => {
                if (prepared.kind !== "prepared_child_traversal") {
                  return Effect.flatMap(
                    admitWorkflowPreparationRefusal(
                      state.parent.cursor,
                      state.parentCall.cCall,
                      {
                        kind: "child_preparation_refusal_candidate",
                        schemaVersion: "5.0.0",
                        childGraphFunctionRef: state.term.graphFunctionRef,
                        inputRef: selectedInputRef,
                        inputDigest: selectedInputDigest,
                        stage: prepared.stage,
                        diagnosticRef: prepared.diagnosticRef,
                        message: prepared.message,
                      },
                      prepared.successorPrefix,
                    ),
                    (refusal) => refusal.kind !==
                        "child_preparation_refusal_admission"
                      ? failureState(
                          state.parent,
                          prepared.successorPrefix,
                          "workflow-preparation-refusal-admission",
                          `diagnostic://abiogenesis/hog/${refusal.code}@5`,
                          { kind: refusal.kind, code: refusal.code },
                        )
                      : Effect.flatMap(
                          admitCCallRejection(
                            state.parent.cursor,
                            state.parentCall.cCall,
                            refusal.admissionRejection,
                            refusal.successorPrefix,
                          ),
                          (outcome) => afterOutcome(
                            state.parent,
                            outcome,
                            state.returns,
                          ),
                        ),
                  );
                }
                return prepareChildFrame(prepared, Object.freeze({
                  relation: "workflow" as const,
                  parent: state.parent,
                  parentCall: state.parentCall.cCall,
                  application,
                  childExecutionBasis: prepared.executionBasis,
                  childTraversalScope: prepared.openedTraversalScope,
                  childInput: prepared.input,
                  childInputDigest: prepared.inputDigest,
                }), state.returns);
              });
            },
          );
        }
        if (state.stateKind === "prepare_recursion") {
          const admitted = state.parentOutcome.admitted;
          return Effect.flatMap(
            projectJudgedOutcome(
              state.predecessorPrefix,
              admitted.cCall,
              admitted.result,
              admitted.judgment,
            ),
            (exactOutcome) => Effect.flatMap(
              projectDeferredApplication(state.predecessorPrefix, {
                runId: admitted.cCall.runId,
                frameId: admitted.cCall.frameId,
                sourceCursorRef: state.parent.cursor.cursorRef,
                cCallRef: admitted.cCall.cCallRef,
                resultRef: admitted.result.resultRef,
                judgmentRef: admitted.judgment.judgmentRef,
              }),
              (deferred) => {
                if (
                  exactOutcome?.disposition !== "judged" ||
                  deferred === null ||
                  sha256Canonical(
                    exactOutcome.admitted as unknown as JsonValue,
                  ) !== sha256Canonical(
                    state.parentOutcome.admitted as unknown as JsonValue,
                  ) ||
                  deferred.cCallRef !== state.deferred.cCallRef ||
                  deferred.resultRef !== state.deferred.resultRef ||
                  deferred.judgmentRef !== state.deferred.judgmentRef ||
                  deferred.judgmentEventRef !==
                    state.deferred.judgmentEventRef ||
                  deferred.replayState.replayDigest !==
                    state.deferred.replayState.replayDigest ||
                  sha256Canonical(deferred.resultValue) !==
                    admitted.result.valueDigest ||
                  recursionTerminationDecision(
                    state.application,
                    deferred.resultValue,
                  ) !== false
                ) {
                  return failureState(
                    state.parent,
                    state.predecessorPrefix,
                    "recursion-currentness",
                    "diagnostic://abiogenesis/hog/recursion-currentness-mismatch@5",
                    { applicationRef: state.application.applicationRef },
                  );
                }
                if (
                  state.parent.cursor.attempt >= state.application.bound
                ) return completeBlockedRecursion(state, null);
                const result = exactOutcome.admitted.result;
                if (!isTraversalValue(result.value)) {
                  return failureState(
                    state.parent,
                    state.predecessorPrefix,
                    "recursion-child-input",
                    "diagnostic://abiogenesis/hog/recursion-child-input-absent@5",
                    { resultRef: result.resultRef },
                  );
                }
                return Effect.flatMap(prepareChild({
                  predecessorPrefix: state.predecessorPrefix,
                  parentExecutionBasis:
                    state.parent.traversal.executionBasis,
                  parentTraversalScope:
                    state.parent.traversal.openedTraversalScope,
                  parentCCallRef: exactOutcome.admitted.cCall.cCallRef,
                  childGraphFunctionRef: state.application.graphFunctionRef,
                  inputRef: result.resultRef,
                  inputDigest: result.valueDigest,
                  input: result.value,
                  eventTime: evaluationClock.eventTime,
                  correlationId:
                    `${evaluationClock.correlationId}/recursion/prepare`,
                }), (prepared) => prepared.kind !== "prepared_child_traversal"
                  ? completeBlockedRecursion(state, prepared)
                  : prepareChildFrame(prepared, Object.freeze({
                      relation: "recursion" as const,
                      parent: state.parent,
                      parentOutcome: exactOutcome,
                      application: state.application,
                      childExecutionBasis: prepared.executionBasis,
                      childTraversalScope: prepared.openedTraversalScope,
                      childInput: prepared.input,
                      childInputDigest: prepared.inputDigest,
                    }), state.returns));
              },
            ),
          );
        }
        if (state.stateKind === "foldback") {
          const frame = state.parentReturn;
          const child = state.childCompletion;
          if (child.disposition === "held") {
            if (
              child.continuationRef === null ||
              child.heldInteraction === null || child.heldGraph === null ||
              child.heldClosureContract === null ||
              frame.childExecutionBasis.parentExecutionBasisRef !==
                frame.parent.traversal.executionBasis.basisRef ||
              frame.childTraversalScope.executionBasisRef !==
                frame.childExecutionBasis.basisRef ||
              sha256Canonical(frame.childInput) !== frame.childInputDigest
            ) {
              return failureState(
                frame.parent,
                child.successorPrefix,
                `${frame.relation}-hold-lineage`,
                "diagnostic://abiogenesis/hog/child-hold-lineage-mismatch@5",
                { relation: frame.relation },
              );
            }
            return Effect.succeed(terminalState(Object.freeze({
              ...child,
              parentSuspensions: Object.freeze([
                ...child.parentSuspensions,
                ...projectParentSuspensions([frame]),
              ]),
            }), state.returns));
          }
          if (
            child.disposition === "failed" &&
            child.replayState.runtimeStatus === "failed"
          ) {
            return Effect.succeed(Object.freeze({
              stateKind: "done" as const,
              result: child,
            }));
          }
          if (child.disposition === "refused") {
            return Effect.succeed(Object.freeze({
              stateKind: "done" as const,
              result: child,
            }));
          }
          if (frame.relation === "workflow") {
            const failedFanOutTask = child.disposition === "failed" &&
              frame.application !== null;
            if (
              child.resultRef === null || child.judgmentRef === null ||
              child.resultValue === null ||
              (!failedFanOutTask && child.disposition !== "closed" &&
                child.disposition !== "blocked")
            ) {
              return failureState(
                frame.parent,
                child.successorPrefix,
                "workflow-child-completion",
                "diagnostic://abiogenesis/hog/child-completion-incomplete@5",
                { disposition: child.disposition },
              );
            }
            return Effect.flatMap(
              admitWorkflowFoldback(
                frame.parent.cursor,
                frame.parentCall,
                frame.childExecutionBasis,
                frame.childTraversalScope,
                child,
              ),
              (foldback) => {
                if (foldback.kind !== "child_foldback_admission") {
                  return failureState(
                    frame.parent,
                    child.successorPrefix,
                    "workflow-child-foldback",
                    `diagnostic://abiogenesis/hog/${foldback.code}@5`,
                    { kind: foldback.kind, code: foldback.code },
                  );
                }
                return Effect.flatMap(
                  admitWorkflowResult(
                    frame.parent.cursor,
                    frame.parentCall,
                    frame.parent.input,
                    foldback,
                    child,
                  ),
                  (outcome) => {
                    if (outcome.disposition === "retry") {
                      return failureState(
                        frame.parent,
                        outcome.successorPrefix,
                        "workflow-retry-outcome",
                        "diagnostic://abiogenesis/hog/workflow-retry-outcome-invalid@5",
                        { disposition: outcome.disposition },
                      );
                    }
                    if (outcome.disposition === "blocked") {
                      return afterOutcome(
                        frame.parent,
                        outcome,
                        state.returns,
                      );
                    }
                    const relation =
                      frame.parent.leafPort.resolveJudgmentRelation(
                        outcome.cCall.judgmentPredicateRef,
                      );
                    if (relation === null) {
                      return failureState(
                        frame.parent,
                        outcome.successorPrefix,
                        "workflow-judgment-relation",
                        "diagnostic://abiogenesis/hog/workflow-judgment-relation-absent@5",
                        { cCallRef: outcome.cCall.cCallRef },
                      );
                    }
                    const childSucceeded = child.disposition === "closed";
                    const candidate = proposeJudgmentCandidate({
                      cCall: outcome.cCall,
                      result: outcome.result,
                      replayState: outcome.replayState,
                      contractRef: outcome.cCall.judgmentContractRef,
                      decision: childSucceeded
                        ? {
                            decisionClass: "evaluate" as const,
                            input: frame.parent.input,
                            relation,
                          }
                        : {
                            decisionClass: "refuse" as const,
                            predicateRef:
                              outcome.cCall.judgmentPredicateRef,
                            reasonRef: child.diagnosticRef ??
                              "diagnostic://abiogenesis/hog/child-traversal-blocked@5",
                          },
                    });
                    return Effect.flatMap(
                      admitJudgment(
                        frame.parent.traversal.graph,
                        frame.parent.traversal.graphFunction,
                        frame.parent.cursor,
                        outcome,
                        candidate,
                      ),
                      (judged) => judged.disposition === "judged" &&
                          frame.application !== null
                        ? completeFanOutOutcome(
                            frame,
                            judged,
                            state.returns,
                          )
                        : afterOutcome(
                            frame.parent,
                            judged,
                            state.returns,
                          ),
                    );
                  },
                );
              },
            );
          }
          if (
            (child.disposition !== "closed" &&
              child.disposition !== "blocked") ||
            child.resultRef === null || child.judgmentRef === null ||
            child.resultValue === null ||
            !isTraversalValue(child.resultValue)
          ) {
            return failureState(
              frame.parent,
              child.successorPrefix,
              "recursion-child-completion",
              "diagnostic://abiogenesis/hog/application-foldback-mismatch@5",
              { disposition: child.disposition },
            );
          }
          return Effect.flatMap(
            admitRecursionFoldback(
              frame.application,
              frame.parent.cursor,
              frame.parentOutcome,
              frame.childExecutionBasis,
              frame.childTraversalScope,
              child,
            ),
            (foldback) => {
              if (foldback.kind !== "application_child_foldback_receipt") {
                return failureState(
                  frame.parent,
                  child.successorPrefix,
                  "recursion-child-foldback",
                  `diagnostic://abiogenesis/hog/${foldback.code}@5`,
                  { kind: foldback.kind, code: foldback.code },
                );
              }
              const blocked = foldback.admission.childDisposition === "blocked";
              const target = blocked
                ? null
                : deriveRecursionReentryCursor(
                    frame.parent.traversal.graph,
                    frame.application,
                    frame.parent.cursor,
                    {
                      inputRef: foldback.admission.childResultRef,
                      inputDigest: foldback.admission.outputDigest,
                    },
                  );
              if (target?.kind === "traversal_refusal") {
                return failureState(
                  frame.parent,
                  foldback.successorPrefix,
                  "recursion-reentry",
                  `diagnostic://abiogenesis/hog/${target.code}@5`,
                  { kind: target.kind, code: target.code },
                );
              }
              return Effect.flatMap(
                projectReplay(foldback.successorPrefix, frame.parent.cursor),
                (
                  replay: ReplayState,
                ): Effect.Effect<State, HogEvaluationError<OwnerError>> => {
                  const admitted = frame.parentOutcome.admitted;
                  const route = proposeRecursionRoute(
                    frame.parent.traversal.graph,
                    frame.application,
                    frame.parent.cursor,
                    target,
                    admitted.cCall,
                    admitted.judgment,
                    foldback.admission,
                    replay,
                    admitted.cCall.transitionContractRef,
                    blocked ? "blocked" : "advance",
                  );
                  if (route.kind !== "traversal_route_candidate") {
                    return failureState(
                      frame.parent,
                      foldback.successorPrefix,
                      "recursion-child-route",
                      `diagnostic://abiogenesis/hog/${route.code}@5`,
                      { kind: route.kind, code: route.code },
                    );
                  }
                  const candidate = completeTraversalTransitionCandidate({
                    kind: "traversal_transition_candidate",
                    schemaVersion: "5.0.0",
                    transitionClass: "route",
                    route,
                    evidence: {
                      evidenceClass: "recursion",
                      application: frame.application,
                      cCall: admitted.cCall,
                      result: admitted.result,
                      judgment: admitted.judgment,
                      foldback: foldback.admission,
                      preparationRefusal: null,
                    },
                    terminalizeRun: blocked &&
                      frame.parent.terminalMode !== "return_to_parent",
                  });
                  return Effect.flatMap(
                    admitRecursionCompletion(
                      frame.application,
                      frame.parent.cursor,
                      target,
                      frame.parentOutcome,
                      foldback,
                      candidate,
                    ),
                    (admission) => {
                      if (admission.kind !== "c_call_completion_admission") {
                        return failureState(
                          frame.parent,
                          foldback.successorPrefix,
                          "recursion-child-completion-admission",
                          `diagnostic://abiogenesis/hog/${admission.code}@5`,
                          { kind: admission.kind, code: admission.code },
                        );
                      }
                      if (blocked) {
                        if (admission.disposition !== "blocked") {
                          return failureState(
                            frame.parent,
                            foldback.successorPrefix,
                            "recursion-blocked-admission",
                            "diagnostic://abiogenesis/hog/application-blocked-route-absent@5",
                            { disposition: admission.disposition },
                          );
                        }
                        return Effect.succeed(terminalState(
                          projectExecutableTraversalCompletion(
                            "blocked",
                            admission.transition.replayState,
                            admission.transition.successorPrefix,
                            {
                              cCallRef: admitted.cCall.cCallRef,
                              resultRef:
                                foldback.admission.childResultRef,
                              judgmentRef: admitted.judgment.judgmentRef,
                              resultValue: child.resultValue,
                              diagnosticRef:
                                foldback.admission.childReasonRef ??
                                "diagnostic://abiogenesis/hog/child-traversal-blocked@5",
                            },
                          ),
                          state.returns,
                        ));
                      }
                      if (
                        admission.disposition !== "advanced" || target === null
                      ) {
                        return failureState(
                          frame.parent,
                          foldback.successorPrefix,
                          "recursion-advance-admission",
                          "diagnostic://abiogenesis/hog/application-advance-route-absent@5",
                          { disposition: admission.disposition },
                        );
                      }
                      return Effect.flatMap(
                        applyAdmittedRoute(
                          admission.transition.successorPrefix,
                          frame.parent.cursor,
                          target,
                          "advance",
                          admission.transition.route,
                        ),
                        (applied) => applied.kind === "traversal_refusal"
                          ? failureState(
                              frame.parent,
                              admission.transition.successorPrefix,
                              "recursion-route-apply",
                              `diagnostic://abiogenesis/hog/${applied.code}@5`,
                              { kind: applied.kind, code: applied.code },
                            )
                          : continueOrFail(
                              frame.parent,
                              applied,
                              projectExecutableTraversalCompletion(
                                "advanced",
                                admission.transition.replayState,
                                admission.transition.successorPrefix,
                                {
                                  cCallRef: admitted.cCall.cCallRef,
                                  resultRef:
                                    foldback.admission.childResultRef,
                                  judgmentRef:
                                    admitted.judgment.judgmentRef,
                                  nextCursor: applied,
                                  resultValue: child.resultValue,
                                  continuationKind: "advance",
                                  nextInputContractRef:
                                    frame.application.outputContractRef,
                                },
                              ),
                              state.returns,
                              "recursion-route-projection",
                            ),
                      );
                    },
                  );
                },
              );
            },
          );
        }

        const term = resolveTraversalTerm(
          state.frame.traversal.graph,
          state.frame.cursor,
        );
        if (term.kind === "traversal_refusal") return failureState(
          state.frame,
          state.predecessorPrefix,
          "term-resolution",
          `diagnostic://abiogenesis/hog/${term.code}@5`,
          { kind: term.kind, code: term.code },
        );
        if (term.kind === "c_workflow") {
          const failureContracts = [...new Set(
            state.frame.implementationSet.rows
              .filter((row) => row.graphFunctionRef === term.graphFunctionRef)
              .map((row) => row.failureContractRef),
          )];
          if (failureContracts.length !== 1) {
            return failureState(
              state.frame,
              state.predecessorPrefix,
              "workflow-failure-contract",
              "diagnostic://abiogenesis/hog/workflow-failure-contract-ambiguous@5",
              { failureContracts },
            );
          }
          const proposal: WorkflowCCallProposal = Object.freeze({
            kind: "workflow_c_call_proposal",
            schemaVersion: "5.0.0",
            cursor: state.frame.cursor,
            traversalScopeRef:
              state.frame.traversal.openedTraversalScope.scopeRef,
            runId: state.frame.traversal.openedTraversalScope.runId,
            graphCallId:
              state.frame.traversal.openedTraversalScope.graphCallId,
            frameId: state.frame.traversal.openedTraversalScope.frameId,
            childGraphFunctionRef: term.graphFunctionRef,
            inputContractRef: term.inputCarrierRef,
            outputContractRef: term.outputCarrierRef,
            failureContractRef: failureContracts[0]!,
            judgmentPredicateRef:
              state.frame.traversal.graphFunction.declarations[
                "abg.judgment_predicate"
              ] ?? "",
          });
          return Effect.flatMap(
            openWorkflow(
              term,
              proposal,
              state.frame.cursor,
              state.predecessorPrefix,
            ),
            (opened) => opened.kind !== "c_call_admission"
              ? failureState(
                  state.frame,
                  state.predecessorPrefix,
                  "workflow-open",
                  `diagnostic://abiogenesis/c-call/${opened.code}@5`,
                  { kind: opened.kind, code: opened.code },
                )
              : Effect.succeed(Object.freeze({
                  stateKind: "prepare_workflow" as const,
                  parent: state.frame,
                  term,
                  parentCall: opened,
                  predecessorPrefix: opened.successorPrefix,
                  returns: freezeReturns(state.returns),
                })),
          );
        }
        if (term.kind !== "c_of") {
          return evaluateStructural(state, term);
        }
        return Effect.flatMap(resolveCCallLocus(
          state.frame.traversal.graph,
          state.frame.cursor,
          term,
        ), (locus) => locus.kind === "traversal_refusal"
          ? failureState(
              state.frame,
              state.predecessorPrefix,
              "c-call-locus",
              `diagnostic://abiogenesis/hog/${locus.code}@5`,
              { kind: locus.kind, code: locus.code },
            )
          : locus.stopClass === "interaction"
          ? evaluateInteraction(state, locus)
          : evaluateExecutable(state, locus));
      }),
  });

  return Effect.map(program, (state) => {
    if (state.stateKind !== "done") {
      throw new TypeError("HoG Effect fold terminated before its done state");
    }
    return state.result;
  });
}
