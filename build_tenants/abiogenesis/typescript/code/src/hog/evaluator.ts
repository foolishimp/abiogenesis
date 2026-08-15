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
  JudgedCCallOutcomeReceipt,
  ResultCCallOutcomeReceipt,
  RetryCCallOutcomeReceipt,
} from "../abg/c_call_outcome.js";
import type {
  AdmittedImplementationSet,
  ExecutionBasis,
} from "../abg/execution_basis.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type { ApplicationChildFoldbackReceipt } from "../abg/graph_application.js";
import type {
  CompletedRetryProgressPlan,
  ExecutableRetryInput,
  RetryCompletedProgressAdmission,
} from "../abg/retry.js";
import type { ReplayState } from "../abg/replay.js";
import type { TraversalCursorCandidate } from "../abg/traversal_cursor.js";
import {
  completeTraversalTransitionCandidate,
} from "../abg/traversal_transition.js";
import type { CWorkflowNode } from "../gtl/c_algebra.js";
import type {
  ClosureContract,
  GraphFunction,
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
import type {
  CompleteInteractionResumeInput,
} from "./interaction_resume.js";
import { proposeJudgmentCandidate } from "./judgment.js";
import type {
  AdmitCCallCompletionPort,
  AdmitCCallJudgmentPort,
  AdmitBlockedRetryTraversalTransitionPort,
  AdmitCompletedRetryTraversalTransitionPort,
  AdmitInitialTraversalCursorPort,
  AdmitInteractionHoldPort,
  AdmitLeafResultPort,
  AdmitRecursionChildFoldbackPort,
  AdmitRecursionCompletionPort,
  AdmitRetryRuntimeFailurePort,
  AdmitTraversalTransitionPort,
  AdmitWorkflowChildFoldbackPort,
  AdmitWorkflowResultPort,
  BindProbabilisticLeafEffectsPort,
  InvokeLeafOwnerPort,
  OpenExecutableCCallPort,
  OpenInteractionCCallPort,
  OpenWorkflowCCallPort,
  PlanInteractionPort,
  PlanCompletedRetryProgressPort,
  PlanRetryRuntimeFailurePort,
  PrepareChildTraversalPort,
  ProjectExecutableRetryInputPort,
  ProjectCCallCompletionPort,
  ProjectReplayPort,
  ResolveExecutableImplementationPort,
  ResolveCCallLocusPort,
  ResolveInitialChildCursorPort,
  ResolveInteractionContractPort,
  ResolveTraversalCursorAdmissionEventRefPort,
  ResolveTraversalValuePort,
  ResumeInteractionOwnerPort,
  StructuralTerm,
} from "./ports.js";
import {
  deriveCompletedTraversalCursor,
  deriveRecursionReentryCursor,
  deriveRetryTraversalCursor,
  deriveStructuralTargetCursor,
  resolveTraversalTerm,
  type TraversalRefusal,
  type TraverseInput,
} from "./traversal.js";
import {
  proposeBlockedRoute,
  proposeCCallOutcomeTransition,
  proposeHoldRoute,
  proposeRecursionRoute,
  proposeRetryRoute,
  proposeStructuralRoute,
  type RouteProposalRefusal,
} from "./route_proposal.js";
import type { OpenedTraversalScope } from "../abg/open_call.js";
import type { GraphValidation } from "../validator/graph.js";
import {
  projectBlockedRetryTraversalCompletion,
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
  resolveTraversalValue: ResolveTraversalValuePort<OwnerError>;
  resolveInitialChildCursor: ResolveInitialChildCursorPort<OwnerError>;
  resolveCCallLocus: ResolveCCallLocusPort<OwnerError>;
  admitInitialCursor: AdmitInitialTraversalCursorPort<OwnerError>;
  admitTransition: AdmitTraversalTransitionPort<OwnerError>;
  resolveExecutable: ResolveExecutableImplementationPort<OwnerError>;
  resolveInteraction: ResolveInteractionContractPort<OwnerError>;
  openExecutable: OpenExecutableCCallPort<OwnerError>;
  openInteraction: OpenInteractionCCallPort<OwnerError>;
  openWorkflow: OpenWorkflowCCallPort<OwnerError>;
  bindProbabilistic: BindProbabilisticLeafEffectsPort<OwnerError>;
  invokeLeaf: InvokeLeafOwnerPort<OwnerError>;
  admitLeafResult: AdmitLeafResultPort<OwnerError>;
  admitJudgment: AdmitCCallJudgmentPort<OwnerError>;
  planInteraction: PlanInteractionPort<OwnerError>;
  admitInteractionHold: AdmitInteractionHoldPort<OwnerError>;
  planRetryFailure: PlanRetryRuntimeFailurePort<OwnerError>;
  admitRetryFailure: AdmitRetryRuntimeFailurePort<OwnerError>;
  projectRetryInput: ProjectExecutableRetryInputPort<OwnerError>;
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
  admitWorkflowFoldback: AdmitWorkflowChildFoldbackPort<OwnerError>;
  admitWorkflowResult: AdmitWorkflowResultPort<OwnerError>;
  admitRecursionFoldback: AdmitRecursionChildFoldbackPort<OwnerError>;
  admitRecursionCompletion: AdmitRecursionCompletionPort<OwnerError>;
  resumeInteractionOwner: ResumeInteractionOwnerPort<OwnerError>;
  rehydrateParentReturns: (
    predecessorPrefix: DurablePrefixCoordinate,
    suspensions: readonly HeldParentTraversalSuspension[],
  ) => Effect.Effect<readonly HogReturnFrame[], OwnerError>;
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
): State {
  if (completion.disposition !== "advanced" || target === null) {
    if (completion.disposition === "advanced") {
      throw new TypeError(
        "advanced HoG completion lacks its exact target cursor",
      );
    }
    return terminalState(completion, returns);
  }
  const nextCursor = completion.nextCursor;
  const resultValue = completion.resultValue;
  if (
    nextCursor === null ||
    nextCursor.cursorRef !== target.cursorRef ||
    nextCursor.cursorDigest !== target.cursorDigest ||
    !isTraversalValue(resultValue) ||
    sha256Canonical(resultValue) !== nextCursor.inputDigest ||
    completion.nextInputContractRef === null ||
    !frame.leafPort.validateContractValueByRef(
      completion.nextInputContractRef,
      resultValue,
    )
  ) {
    throw new TypeError(
      "advanced HoG completion lacks its exact cursor/input basis",
    );
  }
  return Object.freeze({
    stateKind: "evaluate" as const,
    frame: Object.freeze({
      ...frame,
      cursor: nextCursor,
      input: resultValue,
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
    resolveTraversalValue,
    resolveInitialChildCursor,
    resolveCCallLocus,
    admitInitialCursor,
    admitTransition,
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
    admitBlockedRetryTransition,
    resolveCursorAdmissionEventRef,
    planCompletedRetryProgress,
    admitCompletedRetryTransition,
    admitCompletion,
    projectCompletion,
    prepareChild,
    admitWorkflowFoldback,
    admitWorkflowResult,
    admitRecursionFoldback,
    admitRecursionCompletion,
    resumeInteractionOwner,
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
    if (target?.kind === "traversal_refusal") return Effect.fail(target);
    const application = admitted === null
      ? null
      : recursionApplication(
          frame.traversal.graph,
          admitted.cCall.compositionRef,
        );
    if (application !== null &&
        admitted!.judgment.judgment === "advance") {
      const termination = recursionTerminationDecision(application, result.value);
      if (termination === null) {
        return Effect.die(new TypeError(
          "admitted recursion termination relation has no exact Boolean result",
        ));
      }
      if (!termination) {
        return Effect.succeed(Object.freeze({
          stateKind: "prepare_recursion" as const,
          parent: frame,
          application,
          parentOutcome: outcome as JudgedCCallOutcomeReceipt,
          predecessorPrefix: outcome.successorPrefix,
          returns: freezeReturns(returns),
        }));
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
      return Effect.fail(proposal);
    }
    return Effect.flatMap(
      admitCompletion(
        frame.cursor,
        target,
        outcome,
        proposal,
        outcome.successorPrefix,
      ),
      (admission) => Effect.map(
        projectCompletion(frame.cursor, admission, target),
        (completion) => continueAfterCompletion(
          frame,
          target,
          completion,
          returns,
        ),
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
      return Effect.die(new TypeError(
        "admitted C leaf lacks its exact declared judgment relation",
      ));
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
  ): Effect.Effect<State, HogEvaluationError<OwnerError>> =>
    Effect.flatMap(resolveExecutable(locus), (resolution) =>
      Effect.flatMap(
        openExecutable(locus, resolution, state.predecessorPrefix),
        (opened) => Effect.flatMap(
          isProbabilisticLocus(locus)
            ? bindProbabilistic(locus, opened)
            : Effect.succeed(null),
          (probabilisticEffects) => Effect.flatMap(
            invokeLeaf(
              locus,
              opened,
              resolution,
              state.frame.leafPort,
              state.frame.input,
              probabilisticEffects,
            ),
            (ownerReceipt) => Effect.flatMap(
              admitLeafResult(
                locus,
                opened,
                resolution,
                state.frame.leafPort,
                state.frame.input,
                ownerReceipt,
              ),
              (outcome) => {
                if (outcome.disposition === "blocked") {
                  return afterOutcome(state.frame, outcome, state.returns);
                }
                if (outcome.disposition === "result") {
                  return afterResult(
                    state.frame,
                    locus,
                    ownerReceipt,
                    outcome,
                    state.returns,
                  );
                }
                return Effect.flatMap(
                  planRetryFailure(locus, outcome),
                  (plan) => {
                    const planned = plan.transition;
                    if (planned.disposition === "blocked") {
                      const route = proposeBlockedRoute(
                        state.frame.traversal.graph,
                        locus,
                        outcome.cCall,
                        planned.close.judgment.judgmentRef,
                        plan.replayState,
                        outcome.cCall.transitionContractRef,
                        planned.stoppedProgresses.map(
                          (progress) => progress.progressRef,
                        ),
                      );
                      if (route.kind !== "traversal_route_candidate") {
                        return Effect.fail(route);
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
                          judgmentEventRef:
                            planned.close.judgment.admissionEventRef,
                          reasonRef: planned.close.judgment.reasonRef,
                          stoppedProgresses: planned.stoppedProgresses,
                        },
                        terminalizeRun:
                          state.frame.terminalMode !== "return_to_parent",
                      });
                      return Effect.map(
                        admitBlockedRetryTransition(
                          locus,
                          outcome,
                          plan,
                          candidate,
                          outcome.successorPrefix,
                        ),
                        (routeAdmission) => terminalState(
                          projectBlockedRetryTraversalCompletion({
                            plan,
                            route: routeAdmission,
                          }),
                          state.returns,
                        ),
                      );
                    }
                    if (planned.eligibility.disposition !== "retry") {
                      return Effect.die(new TypeError(
                        "retry plan has no exact admitted retry disposition",
                      ));
                    }
                    return Effect.flatMap(
                      admitRetryFailure(locus, outcome, plan),
                      (transition) => Effect.flatMap(
                        projectRetryInput({
                          prefix: transition.successorPrefix,
                          selector: {
                            kind: "retry_frontier_selector",
                            schemaVersion: "5.0.0",
                            runId:
                              state.frame.traversal.openedTraversalScope.runId,
                            graphCallId:
                              state.frame.traversal.openedTraversalScope
                                .graphCallId,
                            frameId:
                              state.frame.traversal.openedTraversalScope.frameId,
                            retryBoundaryRef:
                              transition.progress.retryBoundaryRef,
                            retryProgressRef: transition.progress.progressRef,
                          },
                          program: state.frame.traversal.program,
                          graphFunction: state.frame.traversal.graphFunction,
                          graph: state.frame.traversal.graph,
                        }),
                        (
                          retryInput: ExecutableRetryInput,
                        ): Effect.Effect<
                          State,
                          HogEvaluationError<OwnerError>
                        > => {
                          const target = deriveRetryTraversalCursor(
                            state.frame.traversal.graph,
                            state.frame.cursor,
                            {
                              inputRef: retryInput.inputRef,
                              inputDigest: retryInput.inputDigest,
                            },
                          );
                          if (target.kind === "traversal_refusal") {
                            return Effect.fail(target);
                          }
                          return Effect.flatMap(
                            projectReplay(
                              transition.successorPrefix,
                              state.frame.cursor,
                            ),
                            (replay): Effect.Effect<
                              State,
                              HogEvaluationError<OwnerError>
                            > => {
                              const route = proposeRetryRoute(
                                state.frame.traversal.graph,
                                state.frame.cursor,
                                target,
                                outcome.cCall,
                                transition.progress,
                                replay,
                                outcome.cCall.transitionContractRef,
                              );
                              if (route.kind !== "traversal_route_candidate") {
                                return Effect.fail(route);
                              }
                              const candidate =
                                completeTraversalTransitionCandidate({
                                  kind: "traversal_transition_candidate",
                                  schemaVersion: "5.0.0",
                                  transitionClass: "retry",
                                  route,
                                  evidence: {
                                    evidenceClass: "retry",
                                    graphFunction:
                                      state.frame.traversal.graphFunction,
                                    cCall: outcome.cCall,
                                    progress: transition.progress,
                                  },
                                  retryInput: retryInput.inputValue,
                                  terminalizeRun: false,
                                });
                              return Effect.map(
                                admitTransition(
                                  state.frame.cursor,
                                  target,
                                  candidate,
                                  transition.successorPrefix,
                                ),
                                (admission) => {
                                  if (admission.retryAttempt === null) {
                                    throw new TypeError(
                                      "retry route lacks its exact attempt admission",
                                    );
                                  }
                                  return Object.freeze({
                                    stateKind: "evaluate" as const,
                                    frame: Object.freeze({
                                      ...state.frame,
                                      cursor: target,
                                      input: retryInput.inputValue,
                                    }),
                                    predecessorPrefix:
                                      admission.successorPrefix,
                                    returns: freezeReturns(state.returns),
                                  });
                                },
                              );
                            },
                          );
                        },
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ),
      ));

  const evaluateInteraction = (
    state: EvaluateState,
    locus: InteractionCCallLocusCandidate,
  ): Effect.Effect<State, HogEvaluationError<OwnerError>> =>
    Effect.flatMap(resolveInteraction(locus), (interaction) =>
      Effect.flatMap(
        openInteraction(locus, interaction, state.predecessorPrefix),
        (opened) => Effect.flatMap(
          planInteraction(locus, opened, state.frame.input),
          (
            plan: PendingInteractionAdmissionPlan,
          ): Effect.Effect<State, HogEvaluationError<OwnerError>> => {
            const route = proposeHoldRoute(
              state.frame.traversal.graph,
              locus,
              opened.cCall,
              plan.pending.judgment,
              plan.replayState,
              locus.continuationContractRef,
            );
            if (route.kind !== "traversal_route_candidate") {
              return Effect.fail(route);
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
            return Effect.flatMap(
              admitInteractionHold(
                locus,
                opened,
                state.frame.input,
                plan,
                candidate,
              ),
              (hold) => Effect.map(
                projectReplay(hold.successorPrefix, state.frame.cursor),
                (replay) => Object.freeze({
                  stateKind: "done" as const,
                  result: projectHeldTraversalCompletion({
                    hold,
                    cursor: state.frame.cursor,
                    graph: state.frame.traversal.graph,
                    closureContract: state.frame.closureContract,
                    replayState: replay,
                    parentSuspensions:
                      projectParentSuspensions(state.returns),
                  }),
                }),
              ),
            );
          },
        ),
      ));

  const evaluateStructural = (
    state: EvaluateState,
    term: StructuralTerm,
  ): Effect.Effect<State, HogEvaluationError<OwnerError>> => {
    const target = deriveStructuralTargetCursor(
      state.frame.traversal.graph,
      state.frame.cursor,
      term,
    );
    if (target?.kind === "traversal_refusal") return Effect.fail(target);
    if (target === null) {
      return Effect.die(new TypeError(
        "diagnostic://abiogenesis/hog/structural-step-refused@5",
      ));
    }
    return Effect.flatMap(
      resolveTraversalValue(state.frame.traversal.graph, target),
      (value): Effect.Effect<State, HogEvaluationError<OwnerError>> => {
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
            return Effect.fail(route);
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
          return Effect.map(admitted, (admission) => {
            if (term.kind === "c_retry" && admission.retryAttempt === null) {
              throw new TypeError(
                "structural retry route lacks its exact attempt admission",
              );
            }
            return Object.freeze({
              stateKind: "evaluate" as const,
              frame: Object.freeze({
                ...state.frame,
                cursor: target,
                input: value,
              }),
              predecessorPrefix: admission.successorPrefix,
              returns: freezeReturns(state.returns),
            });
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
            if (completionWitnessEventRef === null) {
              return Effect.die(new TypeError(
                "retry exit lacks its exact source cursor admission event",
              ));
            }
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
              (plan) => advance(
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
      (cursor) => Effect.map(
        admitInitialCursor(cursor, prepared.successorPrefix),
        (admission) => Object.freeze({
          stateKind: "evaluate" as const,
          frame: preparedFrame(
            prepared,
            cursor,
            parentReturn.parent.leafPort,
          ),
          predecessorPrefix: admission.successorPrefix,
          returns: freezeReturns([...returns, parentReturn]),
        }),
      ),
    );
  };

  const program = Effect.iterate<State, OpenState, never,
    HogEvaluationError<OwnerError>>(initial, {
    while: (state): state is OpenState => state.stateKind !== "done",
    body: (state): Effect.Effect<State, HogEvaluationError<OwnerError>> =>
      Effect.suspend(() => {
        if (state.stateKind === "rehydrate_interaction") {
          return Effect.flatMap(
            rehydrateParentReturns(
              state.input.interaction.predecessorPrefix,
              state.input.parentSuspensions,
            ),
            (returns) => Effect.map(
              resumeInteractionOwner(state.input.interaction),
              (completion) => continueAfterCompletion(
                frameFromInteractionResume(state.input),
                completion.nextCursor,
                completion,
                returns,
              ),
            ),
          );
        }
        if (state.stateKind === "prepare_workflow") {
          const request = {
            predecessorPrefix: state.predecessorPrefix,
            parentExecutionBasis: state.parent.traversal.executionBasis,
            parentTraversalScope: state.parent.traversal.openedTraversalScope,
            parentCCallRef: state.parentCall.cCall.cCallRef,
            childGraphFunctionRef: state.term.graphFunctionRef,
            inputRef: state.parent.cursor.inputRef,
            inputDigest: state.parent.cursor.inputDigest,
            input: state.parent.input,
            eventTime: evaluationClock.eventTime,
            correlationId:
              `${evaluationClock.correlationId}/workflow/prepare`,
          } as const;
          return Effect.flatMap(prepareChild(request), (prepared) =>
            prepareChildFrame(prepared, Object.freeze({
              relation: "workflow" as const,
              parent: state.parent,
              parentCall: state.parentCall.cCall,
              childExecutionBasis: prepared.executionBasis,
              childTraversalScope: prepared.openedTraversalScope,
              childInput: prepared.input,
              childInputDigest: prepared.inputDigest,
            }), state.returns));
        }
        if (state.stateKind === "prepare_recursion") {
          const result = state.parentOutcome.admitted.result;
          if (!isTraversalValue(result.value)) {
            return Effect.die(new TypeError(
              "admitted recursion result lacks its exact child input preimage",
            ));
          }
          const request = {
            predecessorPrefix: state.predecessorPrefix,
            parentExecutionBasis: state.parent.traversal.executionBasis,
            parentTraversalScope: state.parent.traversal.openedTraversalScope,
            parentCCallRef: state.parentOutcome.admitted.cCall.cCallRef,
            childGraphFunctionRef: state.application.graphFunctionRef,
            inputRef: result.resultRef,
            inputDigest: result.valueDigest,
            input: result.value,
            eventTime: evaluationClock.eventTime,
            correlationId:
              `${evaluationClock.correlationId}/recursion/prepare`,
          } as const;
          return Effect.flatMap(prepareChild(request), (prepared) =>
            prepareChildFrame(prepared, Object.freeze({
              relation: "recursion" as const,
              parent: state.parent,
              parentOutcome: state.parentOutcome,
              application: state.application,
              childExecutionBasis: prepared.executionBasis,
              childTraversalScope: prepared.openedTraversalScope,
              childInput: prepared.input,
              childInputDigest: prepared.inputDigest,
            }), state.returns));
        }
        if (state.stateKind === "foldback") {
          const frame = state.parentReturn;
          if (frame.relation === "workflow") {
            return Effect.flatMap(
              admitWorkflowFoldback(
                frame.parent.cursor,
                frame.parentCall,
                frame.childExecutionBasis,
                frame.childTraversalScope,
                state.childCompletion,
              ),
              (foldback) => Effect.flatMap(
                admitWorkflowResult(
                  frame.parent.cursor,
                  frame.parentCall,
                  frame.parent.input,
                  foldback,
                ),
                (outcome) => {
                  const relation = frame.parent.leafPort.resolveJudgmentRelation(
                    outcome.cCall.judgmentPredicateRef,
                  );
                  if (relation === null) {
                    return Effect.die(new TypeError(
                      "workflow CCall lacks its exact judgment relation",
                    ));
                  }
                  const candidate = proposeJudgmentCandidate({
                    cCall: outcome.cCall,
                    result: outcome.result,
                    replayState: outcome.replayState,
                    contractRef: outcome.cCall.judgmentContractRef,
                    decision: {
                      decisionClass: "evaluate" as const,
                      input: frame.parent.input,
                      relation,
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
                    (judged) => afterOutcome(
                      frame.parent,
                      judged,
                      state.returns,
                    ),
                  );
                },
              ),
            );
          }
          return Effect.flatMap(
            admitRecursionFoldback(
              frame.application,
              frame.parent.cursor,
              frame.parentOutcome,
              frame.childExecutionBasis,
              frame.childTraversalScope,
              state.childCompletion,
            ),
            (foldback: ApplicationChildFoldbackReceipt) => {
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
                return Effect.fail(target);
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
                    return Effect.fail(route);
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
                    (admission) => Effect.map(
                      projectCompletion(
                        frame.parent.cursor,
                        admission,
                        target,
                      ),
                      (completion) => continueAfterCompletion(
                        frame.parent,
                        target,
                        completion,
                        state.returns,
                      ),
                    ),
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
        if (term.kind === "traversal_refusal") return Effect.fail(term);
        if (term.kind === "c_workflow") {
          const failureContracts = [...new Set(
            state.frame.implementationSet.rows
              .filter((row) => row.graphFunctionRef === term.graphFunctionRef)
              .map((row) => row.failureContractRef),
          )];
          if (failureContracts.length !== 1) {
            return Effect.die(new TypeError(
              "workflow CCall requires one exact admitted failure contract",
            ));
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
          return Effect.map(
            openWorkflow(
              term,
              proposal,
              state.frame.cursor,
              state.predecessorPrefix,
            ),
            (opened) => Object.freeze({
              stateKind: "prepare_workflow" as const,
              parent: state.frame,
              term,
              parentCall: opened,
              predecessorPrefix: opened.successorPrefix,
              returns: freezeReturns(state.returns),
            }),
          );
        }
        if (term.kind !== "c_of") {
          return evaluateStructural(state, term);
        }
        return Effect.flatMap(resolveCCallLocus(
          state.frame.traversal.graph,
          state.frame.cursor,
          term,
        ), (locus) => locus.stopClass === "interaction"
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
