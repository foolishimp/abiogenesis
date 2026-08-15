import {
  admitInitialTraversalCursor,
  admitRuntimeFailure,
  deriveGraphFunctionActionEvaluationBasis,
  hasAdmittedTraversalCursor,
  isExecutionBasis,
  isTraversalCursorCandidate,
  rehydrateExecutionBasisAtPrefix,
  rehydrateConstructionIntentForCursor,
  selectAdmittedImplementationResolution,
  traversalCursorAdmissionEventRef,
  type AbgEventStore,
  type ActorRuntimeBinding,
  type AdmittedCCallJudgment,
  type AdmittedCCallResult,
  type AdmittedImplementationResolutionRow,
  type AdmittedImplementationSet,
  type AdmittedInteractionContractRow,
  type AdmittedInteractionSet,
  type CCall,
  type ContinuationProductBasis,
  type ExecutionBasis,
  type FhInteractionResumeAdmission,
  type OpenedTraversalScope,
  type ReplayState,
  type RuntimeAdmissionBasis,
} from "../abg/index.js";
import {
  selectValidatedRuntimeEventPrefix,
  validatedRuntimeEventPrefixThroughEvent,
} from "../abg/event_prefix.js";
import {
  projectDeclaredCRetryFrontier,
} from "../abg/retry.js";
import type { CCallRuntimeFailureSource } from "../abg/c_call.js";
import {
  admitRuntimeEventTransactionAtExpectedPrefix,
  assertHeldEventStoreAtDurablePrefix,
  assertHeldEventStoreAtRuntimeEventPrefix,
  isRuntimeEventTransactionActive,
  readRuntimeEventsAtDurablePrefix,
  selectHeldEventStoreDurablePrefix,
  validateDurablePrefixCoordinate,
  type DurablePrefixCoordinate,
} from "../abg/event_store.js";
import { projectAdmittedRetryRouteAtPrefix } from "../abg/traversal_route.js";
import type {
  ClosureContract,
  FanOutApplication,
  GraphFunction,
  GtlGraph,
  GtlProgram,
  RecurseApplication,
} from "../gtl/contracts.js";
import { recursionTerminationDecision } from "../gtl/graph_applications.js";
import { deriveCSourceContinuation } from "../gtl/source_path.js";
import { isAdmittedLeafInvocationPort } from "../implementation/leaf_invocation_port.js";
import type {
  ClosedLeafOwnerReceipt,
  LeafInvocationPort,
  LeafRealizationCandidate,
} from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { GraphValidation } from "../validator/graph.js";
import {
  deriveDirectCStepFromGraph,
  type DirectCTraversalStep,
} from "./direct_fold.js";
import {
  completeDirectEffectFold,
  directEffectFold,
  evaluateDirectEffectFold,
  returnDirectEffectFold,
  type DirectEffectFoldEvaluate,
  type DirectEffectFoldOpenState,
} from "./effect_fold_core.js";
import {
  isChildTraversalPreparationPort,
  type ChildTraversalPreparationPort,
  type ChildTraversalPreparationRefusal,
  type PreparedChildTraversal,
} from "./child_traversal.js";
import {
  applyAdmittedRoute,
  applyRecursionRoute,
  deriveCompletedTraversalCursor,
  deriveGraphSpanReentryCursor,
  deriveInteractionSuccessorInputCarrierRef,
  deriveRecursionReentryCursor,
  deriveRetryTraversalCursor,
  deriveStructuralTargetCursor,
  rehydrateHeldInteractionCursor,
  resolveTraversalTerm,
  traverse,
  traverseFromDirectStep,
  traverseFromCursor,
  type TraversalCursor,
  type TraversalStopRef,
  type TraverseResult,
} from "./traversal.js";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import { runEffectProgram } from "../shared/effect_definition.js";
import * as Abg from "../abg/index.js";
import * as AbgRetry from "../abg/retry.js";
import * as Routes from "./traversal_route.js";
import { proposeFailureJudgment, proposeJudgment } from "./judgment.js";

export interface ProjectedRetryResumeSuccess {
  readonly kind: "projected_retry_resume";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "resumed";
  readonly executableRetryInputRef: string;
  readonly executableRetryInputDigest: `sha256:${string}`;
  readonly retryFrontierRef: string;
  readonly retryFrontierDigest: `sha256:${string}`;
  readonly selectedFrontierRowRef: string;
  readonly progressEventRef: string;
  readonly routeAdmissionEventRef: string;
  readonly routeRef: string;
  readonly routeDigest: `sha256:${string}`;
  readonly nextCursor: TraversalCursor;
  readonly retryAttemptAdmissionEventRef: string;
  readonly retryAttemptRef: string;
  readonly retryAttemptDigest: `sha256:${string}`;
  readonly nextAttempt: number;
  readonly inputContractRef: string;
  readonly inputRef: string;
  readonly inputDigest: `sha256:${string}`;
  readonly inputValue: Readonly<Record<string, JsonValue>>;
  readonly successorPrefix: DurablePrefixCoordinate;
}

function sameCanonical(left: unknown, right: unknown): boolean {
  try {
    return sha256Canonical(left as JsonValue) ===
      sha256Canonical(right as JsonValue);
  } catch {
    return false;
  }
}

function canonicalDigest(value: unknown): `sha256:${string}` | null {
  try {
    return sha256Canonical(value as JsonValue);
  } catch {
    return null;
  }
}

export interface ExecuteGraphTraversalCommonInput {
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly graphValidation: GraphValidation;
  readonly implementationSet: AdmittedImplementationSet;
  readonly interactionSet: AdmittedInteractionSet;
  readonly continuationProductBasis?: ContinuationProductBasis;
  readonly leafPort: LeafInvocationPort;
  readonly childTraversalPreparationPort?: ChildTraversalPreparationPort;
  readonly closureContract: Readonly<ClosureContract>;
  readonly actorRuntimeBinding: ActorRuntimeBinding;
  readonly deferFailedRunStop?: boolean;
  readonly eventTime: string;
  readonly correlationId: string;
  readonly terminalMode?: "close_run" | "return_to_parent";
}

export interface ExecutableTraversalCompletion {
  readonly kind: "executable_traversal_completion";
  readonly schemaVersion: "5.0.0";
  readonly disposition:
    | "advanced"
    | "application_ready"
    | "blocked"
    | "closed"
    | "failed"
    | "gap_stop"
    | "held"
    | "refused";
  readonly cCallRef: string | null;
  readonly resultRef: string | null;
  readonly judgmentRef: string | null;
  readonly closureRef: string | null;
  readonly nextCursor: TraversalCursor | null;
  readonly resultValue: JsonValue | null;
  readonly continuationKind: "advance" | "re_enter" | "retry" | null;
  readonly nextInputContractRef: string | null;
  readonly replayState: ReplayState;
  readonly diagnosticRef: string | null;
  readonly continuationRef: string | null;
  readonly heldCursor: TraversalCursor | null;
  readonly heldInteraction: HeldInteractionTraversal | null;
  readonly heldGraph: Readonly<GtlGraph> | null;
  readonly heldClosureContract: Readonly<ClosureContract> | null;
  readonly parentSuspensions: readonly HeldParentTraversalSuspension[];
}

interface ExecutableTraversalClock {
  readonly eventTime: string;
  readonly correlationId: string;
}

interface CompleteExecutableTraversalInput<Input> {
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly traversalStop: Extract<TraversalStopRef, { readonly stopClass: "executable" }>;
  readonly implementationSet: AdmittedImplementationSet;
  readonly implementationResolution: AdmittedImplementationResolutionRow;
  readonly leafPort: LeafInvocationPort;
  readonly input: Readonly<Input>;
  readonly inputDigest: `sha256:${string}`;
  readonly closureContract: Readonly<ClosureContract>;
  readonly actorRuntimeBinding?: ActorRuntimeBinding;
  readonly deferFailedRunStop?: boolean;
  readonly terminalMode?: "close_run" | "return_to_application" | "return_to_parent";
  readonly applicationCompletionMode?: "close_run" | "return_to_parent";
  readonly clock: ExecutableTraversalClock;
}

interface CompleteInteractionResumeInput {
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly interactionSet: AdmittedInteractionSet;
  readonly heldInteraction: HeldInteractionTraversal;
  readonly successorCursor: TraversalCursor;
  readonly resume: FhInteractionResumeAdmission;
  readonly closureContract: Readonly<ClosureContract>;
  readonly clock: ExecutableTraversalClock;
}

interface RestoreDeferredRecursionInput {
  readonly traversalInput: CompleteExecutableTraversalInput<
    Readonly<Record<string, JsonValue>>
  >;
  readonly application: Readonly<RecurseApplication>;
  readonly cCallRef: string;
  readonly resultRef: string;
  readonly judgmentRef: string;
}

export interface HeldInteractionTraversal {
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
  readonly judgment: AdmittedCCallJudgment;
  readonly cursor: TraversalCursor;
}

export interface HeldWorkflowSuspension {
  readonly kind: "held_workflow_suspension";
  readonly schemaVersion: "5.0.0";
  readonly parentExecutionBasisRef: string;
  readonly parentTraversalScope: OpenedTraversalScope;
  readonly parentGraph: Readonly<GtlGraph>;
  readonly parentClosureContract: Readonly<ClosureContract>;
  readonly parentCCall: CCall;
  readonly sourceCursor: TraversalCursor;
  readonly parentGraphInput: Readonly<Record<string, JsonValue>>;
  readonly parentGraphInputDigest: `sha256:${string}`;
  readonly parentInput: Readonly<Record<string, JsonValue>>;
  readonly parentInputDigest: `sha256:${string}`;
  readonly childExecutionBasisRef: string;
  readonly childTraversalScopeRef: string;
  readonly childInput: Readonly<Record<string, JsonValue>>;
  readonly childInputDigest: `sha256:${string}`;
  readonly terminalMode: "close_run" | "return_to_parent";
}

export interface HeldRecursionSuspension {
  readonly kind: "held_recursion_suspension";
  readonly schemaVersion: "5.0.0";
  readonly parentExecutionBasisRef: string;
  readonly parentTraversalScope: OpenedTraversalScope;
  readonly parentGraph: Readonly<GtlGraph>;
  readonly parentClosureContract: Readonly<ClosureContract>;
  readonly parentGraphInput: Readonly<Record<string, JsonValue>>;
  readonly parentGraphInputDigest: `sha256:${string}`;
  readonly application: Readonly<RecurseApplication>;
  readonly evaluatorCCall: CCall;
  readonly evaluatorResult: AdmittedCCallResult;
  readonly evaluatorJudgment: AdmittedCCallJudgment;
  readonly sourceCursor: TraversalCursor;
  readonly evaluatorInput: Readonly<Record<string, JsonValue>>;
  readonly evaluatorInputDigest: `sha256:${string}`;
  readonly childExecutionBasisRef: string;
  readonly childTraversalScopeRef: string;
  readonly childInput: Readonly<Record<string, JsonValue>>;
  readonly childInputDigest: `sha256:${string}`;
  readonly terminalMode: "close_run" | "return_to_parent";
}

export type HeldParentTraversalSuspension =
  | HeldRecursionSuspension
  | HeldWorkflowSuspension;

export interface InitialOrNonRetryResumeEntry {
  readonly input: Readonly<Record<string, JsonValue>>;
  readonly inputDigest: `sha256:${string}`;
  readonly resume?: {
    readonly cursor: TraversalCursor;
    readonly input: Readonly<Record<string, JsonValue>>;
    readonly inputDigest: `sha256:${string}`;
  };
  readonly projectedRetryResume?: never;
}

export interface ProjectedRetryResumeEntry {
  readonly projectedRetryResume: ProjectedRetryResumeSuccess;
  readonly input?: never;
  readonly inputDigest?: never;
  readonly resume?: never;
}

export type InitialOrNonRetryExecuteGraphTraversalInput =
  ExecuteGraphTraversalCommonInput & InitialOrNonRetryResumeEntry;

export type ExecuteGraphTraversalInput = ExecuteGraphTraversalCommonInput &
  (InitialOrNonRetryResumeEntry | ProjectedRetryResumeEntry);

export interface ResumeHeldParentFrameInput {
  readonly parent: InitialOrNonRetryExecuteGraphTraversalInput;
  readonly suspension: HeldRecursionSuspension | HeldWorkflowSuspension;
  readonly parentCCall: import("../abg/index.js").CCall | null;
  readonly sourceCursor: TraversalCursor;
  readonly childExecutionBasis: ExecutionBasis;
  readonly childTraversalScope: OpenedTraversalScope;
}

export interface ResumeHeldInteractionInput {
  readonly parent: InitialOrNonRetryExecuteGraphTraversalInput;
  readonly interaction: CompleteInteractionResumeInput;
  readonly parents: readonly ResumeHeldParentFrameInput[];
}

function fail(
  input: ExecuteGraphTraversalCommonInput,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): never {
  admitRuntimeFailure(
    input.store,
    input.executionBasis,
    input.openedTraversalScope,
    "hog_traversal",
    { stage, candidate },
    diagnosticRef,
    {
      eventTime: input.eventTime,
      correlationId: `${input.correlationId}/${stage}`,
      causationEventRefs: [],
    },
  );
  throw new TypeError(diagnosticRef);
}

function admissionBasis(
  clock: ExecutableTraversalClock,
  stage: string,
): RuntimeAdmissionBasis {
  return {
    eventTime: clock.eventTime,
    correlationId: `${clock.correlationId}/${stage}`,
    causationEventRefs: [],
  };
}

function completion(
  disposition: ExecutableTraversalCompletion["disposition"],
  replayState: ReplayState,
  values: Partial<Readonly<{
    cCallRef: string;
    resultRef: string;
    judgmentRef: string;
    closureRef: string;
    nextCursor: TraversalCursor;
    resultValue: JsonValue;
    continuationKind: "advance" | "re_enter" | "retry";
    nextInputContractRef: string;
    diagnosticRef: string;
    continuationRef: string;
    heldCursor: TraversalCursor;
    heldInteraction: HeldInteractionTraversal;
    heldGraph: Readonly<GtlGraph>;
    heldClosureContract: Readonly<ClosureContract>;
    parentSuspensions: readonly HeldParentTraversalSuspension[];
  }>> = {},
): ExecutableTraversalCompletion {
  return deepFreeze({
    kind: "executable_traversal_completion" as const,
    schemaVersion: "5.0.0" as const,
    disposition,
    cCallRef: values.cCallRef ?? null,
    resultRef: values.resultRef ?? null,
    judgmentRef: values.judgmentRef ?? null,
    closureRef: values.closureRef ?? null,
    nextCursor: values.nextCursor ?? null,
    resultValue: values.resultValue ?? null,
    continuationKind: values.continuationKind ?? null,
    nextInputContractRef: values.nextInputContractRef ?? null,
    replayState,
    diagnosticRef: values.diagnosticRef ?? null,
    continuationRef: values.continuationRef ?? null,
    heldCursor: values.heldCursor ?? null,
    heldInteraction: values.heldInteraction ?? null,
    heldGraph: values.heldGraph ?? null,
    heldClosureContract: values.heldClosureContract ?? null,
    parentSuspensions: values.parentSuspensions ?? [],
  }) as ExecutableTraversalCompletion;
}

type StructuralTraversalResult = Readonly<{ kind: string }>;

function advanceStructuralTraversal(input: Readonly<{
  store: AbgEventStore;
  program: Readonly<GtlProgram>;
  graphFunction: Readonly<GraphFunction>;
  graph: Readonly<GtlGraph>;
  graphValidation: GraphValidation;
  executionBasis: ExecutionBasis;
  openedTraversalScope: OpenedTraversalScope;
  initial: TraversalCursor;
  step: DirectCTraversalStep;
  inputValue: Readonly<Record<string, JsonValue>>;
  inputAuthority: LeafInvocationPort;
  routeOrdinal: number;
  clock: ExecutableTraversalClock;
}>): Effect.Effect<StructuralTraversalResult> {
  return Effect.sync(() => {
    const { initial: source, step } = input;
    if (
      !isAdmittedLeafInvocationPort(input.inputAuthority) ||
      input.inputAuthority.implementationSetRef !==
        input.executionBasis.implementationSetRef ||
      input.inputAuthority.implementationSetDigest !==
        input.executionBasis.implementationSetDigest ||
      step.stepKind === "open_leaf" ||
      step.stepKind === "enter_child" ||
      step.stepKind === "complete_term" ||
      step.stepKind === "continue_term"
    ) return { kind: "structural_traversal_refusal" };
    const target = deriveStructuralTargetCursor(input.graph, source, step);
    if (target === null || target.kind === "traversal_refusal") {
      return target ?? { kind: "structural_traversal_refusal" };
    }
    const retryValue = step.stepKind === "retry"
      ? materializedInputAtCursor(input.graph, target)?.value ?? input.inputValue
      : null;
    if (
      step.stepKind === "retry" &&
      (retryValue === null ||
        target.inputDigest !== sha256Canonical(retryValue) ||
        !input.inputAuthority.validateContractValueByRef(
          step.inputCarrierRef,
          retryValue,
        ))
    ) return { kind: "structural_traversal_refusal" };
    const clock = (stage: string) => admissionBasis(
      input.clock,
      `route/${input.routeOrdinal}/${stage}`,
    );
    const exitsRetry = step.stepKind === "pass_identity" &&
      target.retryPath.length < source.retryPath.length;
    const witness = exitsRetry
      ? traversalCursorAdmissionEventRef(input.store, source)
      : null;
    if (exitsRetry && witness === null) {
      return { kind: "structural_traversal_refusal" };
    }
    const snapshot = input.store.readAll();
    const expectedPrefixDigest = sha256Canonical(snapshot as unknown as JsonValue);
    const admit = () => {
      const progresses = exitsRetry
        ? AbgRetry.admitCompletedRetryProgress(
            input.store,
            input.graph,
            input.graphFunction,
            source,
            target,
            {
              completionClass: "structural_identity_success",
              completionWitnessEventRef: witness!,
            },
            clock("progress"),
          )
        : [];
      if ("kind" in progresses) return progresses;
      const replayState = Abg.replay(input.store, {
        runId: input.openedTraversalScope.runId,
      });
      const proposal = Routes.proposeStructuralRoute(
        input.graph,
        source,
        target,
        step.stepKind === "retry" ? "retry" : "advance",
        replayState,
        progresses,
      );
      if (proposal.kind !== "traversal_route_candidate") return proposal;
      const route = Abg.admitRoute(
        input.store,
        input.executionBasis,
        input.graph,
        source,
        target,
        replayState,
        proposal,
        clock("admit"),
        exitsRetry
          ? {
              graphFunction: input.graphFunction,
              completionClass: "structural_identity_success",
              completionWitnessEventRef: witness!,
              completedProgresses: progresses,
            }
          : undefined,
      );
      if (route.kind !== "admitted_traversal_route") return route;
      if (step.stepKind === "retry") {
        const attempt = AbgRetry.admitRetryAttempt(
          input.store,
          input.executionBasis,
          input.graph,
          input.graphFunction,
          target,
          retryValue!,
          route.admissionEventRef,
          clock("attempt"),
        );
        if (attempt.kind !== "retry_attempt_admission") return attempt;
      }
      return applyAdmittedRoute(
        source,
        target,
        step.stepKind === "retry" ? "retry" : "advance",
        route,
      );
    };
    if (!exitsRetry || isRuntimeEventTransactionActive(input.store)) {
      return admit();
    }
    try {
      return admitRuntimeEventTransactionAtExpectedPrefix(
        input.store,
        expectedPrefixDigest,
        admit,
      ).value;
    } catch {
      return { kind: "structural_traversal_refusal" };
    }
  });
}

type FoldSuccess =
  | Readonly<{
      kind: "judged";
      cCall: CCall;
      result: AdmittedCCallResult;
      judgment: AdmittedCCallJudgment;
      transitionContractRef: string;
    }>
  | Readonly<{
      kind: "interaction";
      cCall: CCall;
      result: AdmittedCCallResult;
      judgment: AdmittedCCallJudgment;
      resume: FhInteractionResumeAdmission;
      transitionContractRef: string;
    }>
  | Readonly<{
      kind: "fan_out";
      cCall: CCall;
      result: AdmittedCCallResult;
      judgment: AdmittedCCallJudgment;
      application: Readonly<FanOutApplication>;
      completion: Abg.CompleteFanOutAdmission;
      transitionContractRef: string;
    }>;

function admitFoldSuccessRoute(input: Readonly<{
  store: AbgEventStore;
  executionBasis: ExecutionBasis;
  graphFunction: Readonly<GraphFunction>;
  graph: Readonly<GtlGraph>;
  source: TraversalCursor;
  target: TraversalCursor | null;
  success: FoldSuccess;
  basis: RuntimeAdmissionBasis;
}>): Abg.AdmittedRoute {
  const snapshot = input.store.readAll();
  const expectedPrefixDigest = sha256Canonical(snapshot as unknown as JsonValue);
  const admit = () => {
    const retryEvidence: AbgRetry.RetrySuccessfulExitEvidence =
      input.success.kind === "fan_out"
        ? {
            completionClass: "fan_out_success",
            cCall: input.success.cCall,
            result: input.success.result,
            judgment: input.success.judgment,
            completion: input.success.completion,
          }
        : input.success.kind === "interaction"
          ? {
              completionClass: "fh_resume_success",
              cCall: input.success.cCall,
              result: input.success.result,
              judgment: input.success.judgment,
              resume: input.success.resume,
            }
          : {
              completionClass: "judged_success",
              cCall: input.success.cCall,
              result: input.success.result,
              judgment: input.success.judgment,
            };
    const progresses = AbgRetry.admitCompletedRetryProgress(
      input.store,
      input.graph,
      input.graphFunction,
      input.source,
      input.target,
      retryEvidence,
      { ...input.basis, correlationId: `${input.basis.correlationId}/progress` },
    );
    if ("kind" in progresses) {
      throw new TypeError(`retry progress refused: ${progresses.code}`);
    }
    const replayState = Abg.replay(input.store, {
      runId: input.source.runId,
    });
    const proposal = input.success.kind === "fan_out"
      ? Routes.proposeFanOutRoute(
          input.graph,
          input.success.application,
          input.source,
          input.target,
          input.success.cCall,
          input.success.completion,
          replayState,
          input.success.transitionContractRef,
          progresses,
        )
      : input.success.kind === "interaction"
        ? Routes.proposeInteractionResumeRoute(
            input.graph,
            input.source,
            input.target,
            input.success.cCall,
            input.success.judgment,
            input.success.resume,
            replayState,
            input.success.transitionContractRef,
            progresses,
          )
        : Routes.proposeJudgedRoute(
            input.graph,
            input.source,
            input.target,
            input.success.cCall,
            input.success.result,
            input.success.judgment,
            replayState,
            input.success.transitionContractRef,
            progresses,
          );
    if (proposal.kind !== "traversal_route_candidate") {
      throw new TypeError(`route proposal refused: ${proposal.code}`);
    }
    const evidence = input.success.kind === "fan_out"
      ? {
          graphFunction: input.graphFunction,
          cCall: input.success.cCall,
          result: input.success.result,
          judgment: input.success.judgment,
          application: input.success.application,
          completion: input.success.completion,
          completedProgresses: progresses,
        }
      : input.success.kind === "interaction"
        ? {
            graphFunction: input.graphFunction,
            cCall: input.success.cCall,
            result: input.success.result,
            judgment: input.success.judgment,
            resume: input.success.resume,
            completedProgresses: progresses,
          }
        : {
            graphFunction: input.graphFunction,
            cCall: input.success.cCall,
            result: input.success.result,
            judgment: input.success.judgment,
            completedProgresses: progresses,
          };
    const route = Abg.admitRoute(
      input.store,
      input.executionBasis,
      input.graph,
      input.source,
      input.target,
      replayState,
      proposal,
      { ...input.basis, correlationId: `${input.basis.correlationId}/route` },
      evidence,
    );
    if (route.kind !== "admitted_traversal_route") {
      throw new TypeError(`route admission refused: ${route.code}`);
    }
    return route;
  };
  return isRuntimeEventTransactionActive(input.store)
    ? admit()
    : admitRuntimeEventTransactionAtExpectedPrefix(
        input.store,
        expectedPrefixDigest,
        admit,
      ).value;
}

function activeCursor(
  value: StructuralTraversalResult | TraverseResult,
): TraversalCursor | null {
  if (value.kind === "traversal_stop_ref") {
    return (value as TraversalStopRef).cursor;
  }
  return value.kind === "traversal_cursor" &&
      isTraversalCursorCandidate(value as TraversalCursor)
    ? value as TraversalCursor
    : null;
}

function traversalAtCursor(
  input: ExecuteGraphTraversalCommonInput,
  cursor: TraversalCursor,
  directStep?: DirectCTraversalStep,
): ReturnType<typeof traverseFromCursor> {
  const traversalInput = {
    program: input.program,
    graphFunction: input.graphFunction,
    graph: input.graph,
    graphValidation: input.graphValidation,
    executionBasis: input.executionBasis,
    openedTraversalScope: input.openedTraversalScope,
  };
  return directStep === undefined
    ? traverseFromCursor(traversalInput, cursor)
    : traverseFromDirectStep(traversalInput, cursor, directStep);
}

function isExactLocusStep(
  stop: TraversalStopRef | TraversalCursor,
  step: DirectCTraversalStep,
): boolean {
  if (stop.kind === "traversal_cursor") {
    return step.stepKind === "enter_child";
  }
  return step.stepKind === "open_leaf" &&
    step.fibre === stop.computeRegime &&
    step.programLocusRef === stop.programLocusRef &&
    step.armId === stop.armId &&
    step.compositionRef === stop.compositionRef &&
    step.inputCarrierRef === (stop.stopClass === "executable"
      ? stop.inputContractRef
      : stop.requestContractRef) &&
    step.outputCarrierRef === (stop.stopClass === "executable"
      ? stop.outputContractRef
      : stop.responseContractRef);
}

function preparedChildTraversalInput(
  parent: ExecuteGraphTraversalCommonInput,
  prepared: PreparedChildTraversal,
  correlationId: string,
  deferFailedRunStop: boolean,
): InitialOrNonRetryExecuteGraphTraversalInput {
  return {
    store: parent.store,
    executionBasis: prepared.executionBasis,
    openedTraversalScope: prepared.openedTraversalScope,
    program: prepared.program,
    graphFunction: prepared.graphFunction,
    graph: prepared.graph,
    graphValidation: prepared.graphValidation,
    implementationSet: prepared.implementationSet,
    interactionSet: prepared.interactionSet,
    ...(parent.continuationProductBasis === undefined
      ? {}
      : {
          continuationProductBasis: {
            ...parent.continuationProductBasis,
            programValidation: prepared.programValidation,
            graphValidation: prepared.graphValidation,
          },
        }),
    leafPort: parent.leafPort,
    ...(parent.childTraversalPreparationPort === undefined
      ? {}
      : {
          childTraversalPreparationPort:
            parent.childTraversalPreparationPort,
        }),
    closureContract: prepared.closureContract,
    actorRuntimeBinding: parent.actorRuntimeBinding,
    ...(deferFailedRunStop ? { deferFailedRunStop: true } : {}),
    input: prepared.input,
    inputDigest: prepared.inputDigest,
    eventTime: parent.eventTime,
    correlationId,
    terminalMode: "return_to_parent",
  };
}

function projectedRetryTraversalInput(
  parent: ExecuteGraphTraversalCommonInput,
  projectedRetryResume: ProjectedRetryResumeSuccess,
  correlationId: string,
): ExecuteGraphTraversalInput {
  return {
    store: parent.store,
    executionBasis: parent.executionBasis,
    openedTraversalScope: parent.openedTraversalScope,
    program: parent.program,
    graphFunction: parent.graphFunction,
    graph: parent.graph,
    graphValidation: parent.graphValidation,
    implementationSet: parent.implementationSet,
    interactionSet: parent.interactionSet,
    ...(parent.continuationProductBasis === undefined
      ? {}
      : { continuationProductBasis: parent.continuationProductBasis }),
    leafPort: parent.leafPort,
    ...(parent.childTraversalPreparationPort === undefined
      ? {}
      : { childTraversalPreparationPort: parent.childTraversalPreparationPort }),
    closureContract: parent.closureContract,
    actorRuntimeBinding: parent.actorRuntimeBinding,
    ...(parent.deferFailedRunStop === true ? { deferFailedRunStop: true } : {}),
    eventTime: parent.eventTime,
    correlationId,
    ...(parent.terminalMode === undefined
      ? {}
      : { terminalMode: parent.terminalMode }),
    projectedRetryResume,
  };
}

function fanOutApplicationForBatch(
  graph: Readonly<GtlGraph>,
  batchRef: string | null,
): Readonly<FanOutApplication> | null {
  if (batchRef === null) return null;
  const application = graph.template.applications.find(
    (candidate) =>
      candidate.relationKind === "fan_out" &&
      candidate.batchRef === batchRef,
  );
  return application?.relationKind === "fan_out" ? application : null;
}

function materializedInputAtCursor(
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursor | null,
): {
  readonly inputContractRef: string;
  readonly value: Readonly<Record<string, JsonValue>>;
} | null {
  if (cursor === null) return null;
  for (const materialization of graph.fanOutMaterializations) {
    const member = materialization.members.find(
      (candidate) =>
        candidate.ordinal === cursor.taskOrdinal &&
        candidate.memberRef === cursor.inputRef &&
        candidate.memberDigest === cursor.inputDigest,
    );
    if (member !== undefined) {
      return {
        inputContractRef: materialization.inputMemberContractRef,
        value: member.value,
      };
    }
  }
  return null;
}

function evaluateInteractionLocus(input: Readonly<{
  runtime: ExecuteGraphTraversalCommonInput;
  stop: Extract<TraversalStopRef, { readonly stopClass: "interaction" }>;
  value: Readonly<Record<string, JsonValue>>;
  ordinal: number;
  fail: TraversalLocusFailure;
}>): TraversalLocusEvaluation {
  const { runtime, stop } = input;
  const productBasis = runtime.continuationProductBasis;
  const row = Abg.selectAdmittedInteractionContract(runtime.interactionSet, {
    graphFunctionRef: runtime.graph.graphFunctionRef,
    nodeRef: stop.nodeRef,
    programLocusRef: stop.programLocusRef,
    interactionKind: stop.interactionKind,
    actorCapabilityRef: stop.actorCapabilityRef,
    requestContractRef: stop.requestContractRef,
    responseContractRef: stop.responseContractRef,
    continuationContractRef: stop.continuationContractRef,
  });
  if (
    productBasis === undefined ||
    row === null ||
    sha256Canonical(input.value) !== stop.cursor.inputDigest
  ) {
    return input.fail(
      `interaction-${input.ordinal}`,
      "diagnostic://abiogenesis/interaction/admitted-basis-absent@5",
      stop as unknown as JsonValue,
    );
  }
  const clock = { eventTime: runtime.eventTime, correlationId: runtime.correlationId };
  const opened = Abg.openInteractionCCall(
    runtime.store,
    runtime.executionBasis,
    runtime.openedTraversalScope,
    runtime.program,
    runtime.graphFunction,
    runtime.graph,
    stop,
    runtime.interactionSet,
    row,
    admissionBasis(clock, `interaction/${input.ordinal}/open`),
  );
  if (opened.kind !== "c_call_admission") {
    return input.fail(
      `interaction-open-${input.ordinal}`,
      `diagnostic://abiogenesis/interaction/${opened.code}@5`,
      opened as unknown as JsonValue,
    );
  }
  const pendingBasis = admissionBasis(clock, `interaction/${input.ordinal}/pending`);
  const plan = Abg.planPendingInteractionAdmission(
    runtime.store,
    runtime.graph,
    runtime.graphFunction,
    stop.cursor,
    opened.cCall,
    input.value,
    stop.cursor.inputDigest,
    pendingBasis,
  );
  const admitted = admitRuntimeEventTransactionAtExpectedPrefix(
    runtime.store,
    plan.expectedPrefixDigest,
    () => {
      const pending = Abg.admitPlannedPendingInteraction(
        runtime.store,
        runtime.graph,
        runtime.graphFunction,
        stop.cursor,
        opened.cCall,
        input.value,
        stop.cursor.inputDigest,
        plan,
        pendingBasis,
      );
      const replayState = Abg.replay(runtime.store, {
        runId: runtime.openedTraversalScope.runId,
      });
      const proposal = Routes.proposeHoldRoute(
        runtime.graph,
        stop,
        opened.cCall,
        pending.judgment,
        replayState,
        stop.continuationContractRef,
      );
      if (proposal.kind !== "traversal_route_candidate") {
        throw new TypeError(`interaction hold refused: ${proposal.code}`);
      }
      const route = Abg.admitRoute(
        runtime.store,
        runtime.executionBasis,
        runtime.graph,
        stop.cursor,
        null,
        replayState,
        proposal,
        admissionBasis(clock, `interaction/${input.ordinal}/hold`),
        {
          graphFunction: runtime.graphFunction,
          cCall: opened.cCall,
          result: pending.result,
          judgment: pending.judgment,
        },
      );
      if (route.kind !== "admitted_traversal_route") {
        throw new TypeError(`interaction hold admission refused: ${route.code}`);
      }
      return {
        pending,
        continuation: Abg.admitFhInteractionOpen(
          runtime.store,
          runtime.executionBasis,
          runtime.openedTraversalScope,
          runtime.program,
          runtime.graph,
          runtime.interactionSet,
          stop.cursor,
          pending,
          route,
          productBasis,
          input.value,
          admissionBasis(clock, `interaction/${input.ordinal}/continuation`),
        ),
      };
    },
  ).value;
  return {
    completion: completion(
      "held",
      Abg.replay(runtime.store, { runId: runtime.openedTraversalScope.runId }),
      {
        cCallRef: opened.cCall.cCallRef,
        resultRef: admitted.pending.result.resultRef,
        judgmentRef: admitted.pending.judgment.judgmentRef,
        resultValue: admitted.pending.result.value,
        continuationRef: admitted.continuation.continuationRef,
        heldCursor: stop.cursor,
        heldGraph: runtime.graph,
        heldClosureContract: runtime.closureContract,
        heldInteraction: deepFreeze({
          cCall: opened.cCall,
          result: admitted.pending.result,
          judgment: admitted.pending.judgment,
          cursor: stop.cursor,
        }),
      },
    ),
    outputValueKind: null,
    outputContractRef: null,
  };
}

function resumeInteractionOwner(
  input: CompleteInteractionResumeInput,
): ExecutableTraversalCompletion {
  const { cCall, result, judgment } = input.heldInteraction;
  const successorContract = deriveInteractionSuccessorInputCarrierRef(
    input.graph,
    input.heldInteraction.cursor,
  );
  if (successorContract !== input.resume.successorInputContractRef) {
    throw new TypeError("interaction successor differs from GTL");
  }
  const target = deriveCompletedTraversalCursor(input.graph, input.successorCursor, {
    inputRef: input.resume.successorInputRef,
    inputDigest: input.resume.successorInputDigest,
  });
  if (target?.kind === "traversal_refusal") {
    throw new TypeError(`interaction continuation refused: ${target.code}`);
  }
  const route = admitFoldSuccessRoute({
    store: input.store,
    executionBasis: input.executionBasis,
    graphFunction: input.graphFunction,
    graph: input.graph,
    source: input.successorCursor,
    target,
    success: {
      kind: "interaction",
      cCall,
      result,
      judgment,
      resume: input.resume,
      transitionContractRef: cCall.transitionContractRef,
    },
    basis: admissionBasis(input.clock, "interaction/resume"),
  });
  if (route.routeKind === "advance" && target !== null && successorContract !== null) {
    const nextCursor = applyAdmittedRoute(input.successorCursor, target, "advance", route);
    if (nextCursor.kind === "traversal_refusal") {
      throw new TypeError(`interaction route refused: ${nextCursor.code}`);
    }
    return completion("advanced", Abg.replay(input.store, { runId: cCall.runId }), {
      cCallRef: cCall.cCallRef,
      resultRef: input.resume.successorInputRef,
      judgmentRef: judgment.judgmentRef,
      nextCursor,
      resultValue: input.resume.successorInputValue,
      continuationKind: "advance",
      nextInputContractRef: successorContract,
    });
  }
  if (route.routeKind !== "terminal") {
    throw new TypeError(`interaction admitted ${route.routeKind}`);
  }
  const closure = Abg.admitInteractionClosure(
    input.store,
    selectHeldEventStoreDurablePrefix(input.store),
    cCall,
    result,
    judgment,
    input.resume,
    route,
    input.closureContract,
    admissionBasis(input.clock, "interaction/closure"),
  );
  if (closure.kind !== "closure_admission") {
    throw new TypeError(`interaction closure refused: ${closure.code}`);
  }
  return completion("closed", Abg.replay(input.store, { runId: cCall.runId }), {
    cCallRef: cCall.cCallRef,
    resultRef: input.resume.responseRef,
    judgmentRef: judgment.judgmentRef,
    closureRef: closure.closureRef,
    resultValue: input.resume.responseValue,
  });
}

function replayLeaf(
  input: Pick<CompleteExecutableTraversalInput<unknown>, "store" | "openedTraversalScope">,
): ReplayState {
  return Abg.replay(input.store, { runId: input.openedTraversalScope.runId });
}

function blockedLeaf(
  input: CompleteExecutableTraversalInput<unknown>,
  cCall: CCall,
  resultRef: string,
  judgmentRef: string,
  judgmentEventRef: string,
  reasonRef: string,
  stoppedProgresses: readonly AbgRetry.RetryStoppedProgressAdmission[] = [],
): ExecutableTraversalCompletion {
  const replayState = replayLeaf(input);
  const proposal = Routes.proposeBlockedRoute(
    input.graph,
    input.traversalStop,
    cCall,
    judgmentRef,
    replayState,
    cCall.transitionContractRef,
    stoppedProgresses.map((row) => row.progressRef),
  );
  if (proposal.kind !== "traversal_route_candidate") {
    throw new TypeError(`blocked route refused: ${proposal.code}`);
  }
  const route = Abg.admitRoute(
    input.store,
    input.executionBasis,
    input.graph,
    input.traversalStop.cursor,
    null,
    replayState,
    proposal,
    admissionBasis(input.clock, "blocked-route"),
    {
      graphFunction: input.graphFunction,
      cCall,
      resultRef,
      judgmentRef,
      judgmentEventRef,
      reasonRef,
      ...(stoppedProgresses.length === 0 ? {} : { stoppedProgresses }),
    },
    { terminalizeRun: input.terminalMode !== "return_to_parent" },
  );
  if (route.kind !== "admitted_traversal_route") {
    throw new TypeError(`blocked route admission refused: ${route.code}`);
  }
  return completion("blocked", replayLeaf(input), {
    cCallRef: cCall.cCallRef,
    resultRef,
    judgmentRef,
    resultValue: Abg.projectedCCallResultValue(input.store, {
      runId: cCall.runId,
      cCallRef: cCall.cCallRef,
      resultRef,
    }),
    diagnosticRef: reasonRef,
  });
}

function failedLeaf(
  input: CompleteExecutableTraversalInput<unknown>,
  cCall: CCall,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
  reasonRef: string,
): ExecutableTraversalCompletion {
  const replayState = replayLeaf(input);
  const proposal = Routes.proposeFailedRoute(
    input.graph,
    input.traversalStop,
    cCall,
    result,
    judgment,
    replayState,
    cCall.transitionContractRef,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    throw new TypeError(`failed route refused: ${proposal.code}`);
  }
  const deferStop = input.deferFailedRunStop === true &&
    input.traversalStop.computeRegime === "F_D" &&
    isJsonRecord(result.value) &&
    result.value.failureClass === "implementation_exception";
  const route = Abg.admitRoute(
    input.store,
    input.executionBasis,
    input.graph,
    input.traversalStop.cursor,
    null,
    replayState,
    proposal,
    admissionBasis(input.clock, "failed-route"),
    { graphFunction: input.graphFunction, cCall, result, judgment },
    { terminalizeRun: !deferStop },
  );
  if (route.kind !== "admitted_traversal_route") {
    throw new TypeError(`failed route admission refused: ${route.code}`);
  }
  return completion("failed", replayLeaf(input), {
    cCallRef: cCall.cCallRef,
    resultRef: result.resultRef,
    judgmentRef: judgment.judgmentRef,
    resultValue: result.value,
    diagnosticRef: reasonRef,
  });
}

interface AdmittedLeaf {
  readonly kind: "admitted_leaf";
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
  readonly judgment: AdmittedCCallJudgment;
}

interface RetryLeaf {
  readonly kind: "retry_leaf";
  readonly cCall: CCall;
  readonly source: CCallRuntimeFailureSource;
  readonly failureCandidate: JsonValue;
  readonly failureValueKind: string;
}

function rejectedLeaf(
  input: CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>>,
  cCall: CCall,
  rejection: Abg.CCallAdmissionRejection,
): ExecutableTraversalCompletion {
  const closed = Abg.completeRejectedCCall(
    input.store,
    input.graph,
    input.graphFunction,
    input.traversalStop.cursor,
    cCall,
    rejection,
    admissionBasis(input.clock, "rejected-call"),
  );
  return blockedLeaf(
    input,
    cCall,
    closed.refusalResultRef,
    closed.rejectionJudgmentRef,
    closed.judgmentEventRef,
    rejection.diagnosticRef,
  );
}

function admitLeafCandidate(
  input: CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>>,
  cCall: CCall,
  invocation: ClosedLeafOwnerReceipt,
  failureValueKind: string,
  outputValueKind: string,
): AdmittedLeaf | RetryLeaf | ExecutableTraversalCompletion {
  const candidate = invocation.candidate;
  const exchange = invocation.receipt?.computeRegime === "F_P"
    ? invocation.receipt.actorProcessExchange
    : null;
  const request = exchange?.request ?? null;
  const observation = exchange?.observation ?? null;
  const probabilistic = request !== null &&
      observation !== null &&
      input.actorRuntimeBinding !== undefined
    ? Abg.admitProbabilisticResultCandidate({
        artifactTruth: input.actorRuntimeBinding.artifactTruth,
        executionBasis: input.executionBasis,
        implementationSet: input.implementationSet,
        leafPort: input.leafPort,
        occurrence: {
          cCallRef: cCall.cCallRef,
          runId: cCall.runId,
          graphCallId: cCall.graphCallId,
          frameId: cCall.frameId,
          programLocusRef: cCall.programLocusRef,
          taskOrdinal: cCall.taskOrdinal,
          attempt: cCall.attempt,
        },
        prefix: selectValidatedRuntimeEventPrefix(input.store.readAll()),
        resolution: input.implementationResolution,
        input: input.input,
        request,
        observation,
      })
    : null;
  const evidenceCandidates: readonly Abg.CCallEvidenceCandidate[] =
    input.traversalStop.computeRegime === "F_D"
      ? candidate.evidenceCandidates
      : request === null || observation === null || invocation.workerContracts === null
        ? []
        : [Abg.deriveProbabilisticTransportEvidence(
            cCall,
            request,
            observation,
            probabilistic?.kind === "contract_admitted_probabilistic_result_candidate"
              ? probabilistic
              : null,
            candidate.resultCandidate,
            invocation.workerContracts.instructionContractRef,
            invocation.workerContracts.resultContractRef,
          )];
  const evidence: Abg.AdmittedCCallEvidence[] = [];
  for (const row of evidenceCandidates) {
    const admitted = Abg.admitEvidence(
      input.store,
      input.graph,
      input.graphFunction,
      input.traversalStop.cursor,
      cCall,
      row,
      cCall.evidenceContractRef,
      input.inputDigest,
      admissionBasis(input.clock, "evidence"),
      invocation.workerContracts?.instructionContractRef,
      invocation.workerContracts?.resultContractRef,
      request === null || observation === null
        ? null
        : {
            request,
            observation,
            admittedResultCarrier:
              probabilistic?.kind === "contract_admitted_probabilistic_result_candidate"
                ? probabilistic
                : null,
          },
    );
    if (admitted.kind === "c_call_admission_rejection") {
      return rejectedLeaf(input, cCall, admitted);
    }
    evidence.push(admitted);
  }
  const retrySource = evidence.length === 1 &&
      evidence[0]!.evidenceClass === "probabilistic_transport" &&
      evidence[0]!.transportDisposition === "failure"
    ? evidence[0]!
    : null;
  if (
    candidate.disposition === "failure" &&
    cCall.retryPath.length > 0 &&
    retrySource !== null
  ) {
    return deepFreeze({
      kind: "retry_leaf" as const,
      cCall,
      source: retrySource,
      failureCandidate: candidate.resultCandidate as JsonValue,
      failureValueKind,
    });
  }
  const result = Abg.admitResult(
    input.store,
    input.graph,
    input.graphFunction,
    input.traversalStop.cursor,
    cCall,
    candidate.resultCandidate,
    candidate.disposition,
    candidate.disposition === "success"
      ? cCall.outputContractRef
      : cCall.failureContractRef,
    candidate.disposition === "success" ? outputValueKind : failureValueKind,
    candidate.disposition === "success"
      ? (value) =>
          (input.traversalStop.computeRegime !== "F_P" ||
            probabilistic?.kind === "contract_admitted_probabilistic_result_candidate") &&
          input.leafPort.validateContractValue(
            cCall.outputContractRef,
            "output",
            value,
          ) &&
          input.leafPort.validateResultEvidenceLineage(
            cCall.outputContractRef,
            value as Readonly<Record<string, JsonValue>>,
            evidence.map((row) => deepFreeze({
              cCallRef: cCall.cCallRef,
              cCallAttempt: cCall.attempt,
              evidenceRef: row.evidenceRef,
              evidenceDigest: row.evidenceDigest,
              evidenceClass: row.evidenceClass,
              outputDigest: row.outputDigest,
              transportDigest:
                row.evidenceClass === "probabilistic_transport" &&
                  "transportDigest" in row
                  ? row.transportDigest
                  : null,
            })),
          )
      : (value) => isJsonRecord(value) &&
          value.kind === failureValueKind &&
          value.schemaVersion === "5.0.0" &&
          value.diagnosticRef === candidate.diagnosticRef,
    evidence,
    admissionBasis(input.clock, "result"),
  );
  if (result.kind === "c_call_admission_rejection") {
    return rejectedLeaf(input, cCall, result);
  }
  const relation = input.leafPort.resolveJudgmentRelation(
    cCall.judgmentPredicateRef,
  );
  if (relation === null) {
    throw new TypeError("admitted leaf lacks judgment relation");
  }
  const replayState = replayLeaf(input);
  const proposed = candidate.disposition === "success"
    ? proposeJudgment(
        cCall,
        result,
        replayState,
        input.input,
        relation,
        cCall.judgmentContractRef,
      )
    : proposeFailureJudgment(
        cCall,
        result,
        replayState,
        candidate.diagnosticRef,
        cCall.judgmentContractRef,
      );
  const judgment = Abg.admitJudgment(
    input.store,
    input.graph,
    input.graphFunction,
    input.traversalStop.cursor,
    cCall,
    result,
    proposed,
    replayState,
    admissionBasis(input.clock, "judgment"),
  );
  return judgment.kind === "c_call_admission_rejection"
    ? rejectedLeaf(input, cCall, judgment)
    : deepFreeze({ kind: "admitted_leaf" as const, cCall, result, judgment });
}

function admitRetryResume(input: Readonly<{
  runtime: CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>>;
  predecessorPrefix: DurablePrefixCoordinate;
  retry: AbgRetry.ExecutableRetryInput;
}>): ProjectedRetryResumeSuccess {
  const { runtime } = input;
  const fresh = AbgRetry.projectExecutableRetryInput({
    prefix: input.predecessorPrefix,
    selector: input.retry.selector,
    program: runtime.program,
    graphFunction: runtime.graphFunction,
    graph: runtime.graph,
  });
  if (fresh.kind !== "executable_retry_input" || !sameCanonical(fresh, input.retry)) {
    throw new TypeError("retry projection changed before admission");
  }
  AbgRetry.assertFullRetryAttemptFrontier(fresh.retryFrontier);
  const events = readRuntimeEventsAtDurablePrefix(input.predecessorPrefix);
  const authorityPrefix = selectValidatedRuntimeEventPrefix(events);
  const prefix = selectValidatedRuntimeEventPrefix(events, {
    runId: fresh.selector.runId,
  });
  const source = rehydrateHeldInteractionCursor(prefix, fresh.sourceCursor);
  if (source === null) throw new TypeError("retry source cursor is not admitted");
  const target = deriveRetryTraversalCursor(runtime.graph, source, {
    inputRef: fresh.inputRef,
    inputDigest: fresh.inputDigest,
  });
  if (target.kind !== "traversal_cursor") {
    throw new TypeError("retry target is not derivable from GTL");
  }
  const replayState = Abg.replayValidatedRuntimeEventPrefix(prefix, authorityPrefix);
  const proposal = Routes.proposeRetryRoute(
    runtime.graph,
    source,
    target,
    fresh.cCall,
    fresh.progress,
    replayState,
    fresh.cCall.transitionContractRef,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    throw new TypeError(`retry route refused: ${proposal.code}`);
  }
  assertHeldEventStoreAtDurablePrefix(runtime.store, input.predecessorPrefix);
  const transaction = admitRuntimeEventTransactionAtExpectedPrefix(
    runtime.store,
    runtime.store.digest(),
    () => {
      const route = Abg.admitRoute(
        runtime.store,
        runtime.executionBasis,
        runtime.graph,
        source,
        target,
        replayState,
        proposal,
        admissionBasis(runtime.clock, "retry/route"),
        {
          graphFunction: runtime.graphFunction,
          cCall: fresh.cCall,
          progress: fresh.progress,
        },
      );
      if (route.kind !== "admitted_traversal_route") {
        throw new TypeError(`retry route admission refused: ${route.code}`);
      }
      const cursor = applyAdmittedRoute(source, target, "retry", route);
      if (cursor.kind !== "traversal_cursor") {
        throw new TypeError("retry route cannot be applied");
      }
      const attempt = AbgRetry.admitRetryAttempt(
        runtime.store,
        runtime.executionBasis,
        runtime.graph,
        runtime.graphFunction,
        cursor,
        fresh.inputValue,
        route.admissionEventRef,
        admissionBasis(runtime.clock, "retry/attempt"),
      );
      if (attempt.kind !== "retry_attempt_admission") {
        throw new TypeError(`retry attempt refused: ${attempt.code}`);
      }
      return { route, cursor, attempt };
    },
  );
  if (transaction.successorPrefix === null) {
    throw new TypeError("retry admission has no durable successor");
  }
  return deepFreeze({
    kind: "projected_retry_resume" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "resumed" as const,
    executableRetryInputRef: fresh.projectionRef,
    executableRetryInputDigest: fresh.projectionDigest,
    retryFrontierRef: fresh.retryFrontier.frontierRef,
    retryFrontierDigest: fresh.retryFrontier.frontierDigest,
    selectedFrontierRowRef: fresh.selectedFrontierRowRef,
    progressEventRef: fresh.progressEventRef,
    routeAdmissionEventRef: transaction.value.route.admissionEventRef,
    routeRef: transaction.value.route.routeRef,
    routeDigest: transaction.value.route.routeDigest,
    nextCursor: transaction.value.cursor,
    retryAttemptAdmissionEventRef: transaction.value.attempt.admissionEventRef,
    retryAttemptRef: transaction.value.attempt.attemptRef,
    retryAttemptDigest: transaction.value.attempt.attemptDigest,
    nextAttempt: fresh.nextAttempt,
    inputContractRef: fresh.inputContractRef,
    inputRef: fresh.inputRef,
    inputDigest: fresh.inputDigest,
    inputValue: fresh.inputValue,
    successorPrefix: transaction.successorPrefix,
  });
}

function completeAdmittedLeaf(
  input: CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>>,
  admitted: AdmittedLeaf,
  candidate: Readonly<LeafRealizationCandidate>,
): ExecutableTraversalCompletion {
  const { cCall, result, judgment } = admitted;
  if (candidate.disposition === "failure") {
    return failedLeaf(input, cCall, result, judgment, candidate.diagnosticRef);
  }
  if (judgment.judgment !== "advance") {
    return blockedLeaf(
      input,
      cCall,
      result.resultRef,
      judgment.judgmentRef,
      judgment.admissionEventRef,
      judgment.reasonRef,
    );
  }
  if (input.terminalMode === "return_to_application") {
    return completion("application_ready", replayLeaf(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      resultValue: result.value,
    });
  }
  const target = deriveCompletedTraversalCursor(
    input.graph,
    input.traversalStop.cursor,
    { inputRef: result.resultRef, inputDigest: result.valueDigest },
  );
  if (target?.kind === "traversal_refusal") {
    throw new TypeError(`leaf continuation refused: ${target.code}`);
  }
  const route = admitFoldSuccessRoute({
    store: input.store,
    executionBasis: input.executionBasis,
    graphFunction: input.graphFunction,
    graph: input.graph,
    source: input.traversalStop.cursor,
    target,
    success: {
      kind: "judged",
      cCall,
      result,
      judgment,
      transitionContractRef: input.closureContract.transitionContractRef,
    },
    basis: admissionBasis(input.clock, "leaf/success"),
  });
  if (route.routeKind === "advance" && target !== null) {
    const nextCursor = applyAdmittedRoute(
      input.traversalStop.cursor,
      target,
      "advance",
      route,
    );
    if (nextCursor.kind === "traversal_refusal") {
      throw new TypeError(`leaf route application refused: ${nextCursor.code}`);
    }
    return completion("advanced", replayLeaf(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      nextCursor,
      resultValue: result.value,
      continuationKind: "advance",
      nextInputContractRef: cCall.outputContractRef,
    });
  }
  if (route.routeKind !== "terminal") {
    throw new TypeError(`leaf admitted unexpected ${route.routeKind} route`);
  }
  const basis = admissionBasis(
    input.clock,
    input.terminalMode === "return_to_parent" ? "child/closure" : "closure",
  );
  const closure = input.terminalMode === "return_to_parent"
    ? Abg.admitChildClosure(
        input.store,
        selectHeldEventStoreDurablePrefix(input.store),
        input.openedTraversalScope,
        cCall,
        result,
        judgment,
        route,
        input.closureContract,
        basis,
      )
    : Abg.admitClosure(
        input.store,
        selectHeldEventStoreDurablePrefix(input.store),
        cCall,
        result,
        judgment,
        route,
        input.closureContract,
        basis,
      );
  if (
    closure.kind !== "closure_admission" &&
    closure.kind !== "child_closure_admission"
  ) {
    throw new TypeError(`leaf closure refused: ${closure.code}`);
  }
  return completion("closed", replayLeaf(input), {
    cCallRef: cCall.cCallRef,
    resultRef: result.resultRef,
    judgmentRef: judgment.judgmentRef,
    closureRef: closure.closureRef,
    resultValue: result.value,
  });
}

function workflowBasis(
  context: WorkflowParentContext,
  stage: string,
): RuntimeAdmissionBasis {
  return admissionBasis(
    {
      eventTime: context.runtime.eventTime,
      correlationId:
        `${context.runtime.correlationId}/workflow/${context.ordinal}`,
    },
    stage,
  );
}

function workflowFailure(
  context: WorkflowParentContext,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): ExecutableTraversalCompletion {
  const { runtime } = context;
  Abg.admitRuntimeFailure(
    runtime.store,
    runtime.executionBasis,
    runtime.openedTraversalScope,
    "hog_traversal",
    { stage, candidate },
    diagnosticRef,
    workflowBasis(context, stage),
  );
  return completion(
    "failed",
    Abg.replay(runtime.store, { runId: runtime.openedTraversalScope.runId }),
    { cCallRef: context.parentCCall.cCallRef, diagnosticRef },
  );
}

function completeBlockedWorkflow(
  context: WorkflowParentContext,
  resultRef: string,
  judgmentRef: string,
  judgmentEventRef: string,
  reasonRef: string,
): ExecutableTraversalCompletion {
  const { runtime } = context;
  const replayState = Abg.replay(runtime.store, {
    runId: runtime.openedTraversalScope.runId,
  });
  const proposal = Routes.proposeWorkflowBlockedRoute(
    runtime.graph,
    context.cursor,
    context.workflowTerm,
    context.parentCCall,
    judgmentRef,
    replayState,
    context.parentCCall.transitionContractRef,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return workflowFailure(
      context,
      "blocked-route-proposal",
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      proposal as unknown as JsonValue,
    );
  }
  const terminalizesRun = runtime.terminalMode !== "return_to_parent";
  const route = Abg.admitRoute(
    runtime.store,
    runtime.executionBasis,
    runtime.graph,
    context.cursor,
    null,
    replayState,
    proposal,
    workflowBasis(context, "blocked-route"),
    {
      graphFunction: runtime.graphFunction,
      cCall: context.parentCCall,
      resultRef,
      judgmentRef,
      judgmentEventRef,
      reasonRef,
    },
    { terminalizeRun: terminalizesRun },
  );
  if (
    route.kind !== "admitted_traversal_route" ||
    route.routeKind !== "blocked" ||
    (route.runStoppedEventRef !== null) !== terminalizesRun
  ) {
    return workflowFailure(
      context,
      "blocked-route-admission",
      route.kind === "admitted_traversal_route"
        ? "diagnostic://abiogenesis/hog/run-stop-absent@5"
        : `diagnostic://abiogenesis/hog/${route.code}@5`,
      route as unknown as JsonValue,
    );
  }
  return completion(
    "blocked",
    Abg.replay(runtime.store, { runId: runtime.openedTraversalScope.runId }),
    {
      cCallRef: context.parentCCall.cCallRef,
      resultRef,
      judgmentRef,
      diagnosticRef: reasonRef,
    },
  );
}

function rejectWorkflowAdmission(
  context: WorkflowParentContext,
  rejection: Abg.CCallAdmissionRejection,
  stage: string,
): ExecutableTraversalCompletion {
  const { runtime } = context;
  const rejected = Abg.completeRejectedCCall(
    runtime.store,
    runtime.graph,
    runtime.graphFunction,
    context.cursor,
    context.parentCCall,
    rejection,
    workflowBasis(context, `${stage}-rejection`),
  );
  return completeBlockedWorkflow(
    context,
    rejected.refusalResultRef,
    rejected.rejectionJudgmentRef,
    rejected.judgmentEventRef,
    rejection.diagnosticRef,
  );
}

function beginWorkflowLocus(input: Readonly<{
  runtime: ExecuteGraphTraversalCommonInput;
  cursor: TraversalCursor;
  value: Readonly<Record<string, JsonValue>>;
  graphEntryInput: Readonly<Record<string, JsonValue>>;
  graphEntryInputDigest: `sha256:${string}`;
  ordinal: number;
  fail: TraversalLocusFailure;
}>): Effect.Effect<WorkflowLocusStep> {
  return Effect.gen(function* () {
    const { runtime, cursor, ordinal } = input;
    const term = resolveTraversalTerm(runtime.graph, cursor);
    const childPort = runtime.childTraversalPreparationPort;
    if (
      term.kind !== "c_workflow" || childPort === undefined ||
      !isChildTraversalPreparationPort(childPort)
    ) {
      return input.fail(
        `workflow-step-${ordinal}`,
        "diagnostic://abiogenesis/hog/workflow-step-mismatch@5",
        term as unknown as JsonValue,
      );
    }
    const failureContracts = [
      ...new Set(runtime.implementationSet.rows
        .filter((row) => row.graphFunctionRef === term.graphFunctionRef)
        .map((row) => row.failureContractRef)),
    ];
    if (failureContracts.length !== 1) {
      return input.fail(
        `workflow-contract-${ordinal}`,
        "diagnostic://abiogenesis/hog/workflow-failure-contract-ambiguous@5",
        failureContracts as unknown as JsonValue,
      );
    }
    const opened = Abg.openWorkflowCCall(
      runtime.store,
      runtime.executionBasis,
      runtime.implementationSet,
      runtime.openedTraversalScope,
      runtime.program,
      runtime.graphFunction,
      runtime.graph,
      {
        kind: "workflow_c_call_proposal",
        schemaVersion: "5.0.0",
        cursor,
        traversalScopeRef: runtime.openedTraversalScope.scopeRef,
        runId: runtime.openedTraversalScope.runId,
        graphCallId: runtime.openedTraversalScope.graphCallId,
        frameId: runtime.openedTraversalScope.frameId,
        childGraphFunctionRef: term.graphFunctionRef,
        inputContractRef: term.inputCarrierRef,
        outputContractRef: term.outputCarrierRef,
        failureContractRef: failureContracts[0]!,
        judgmentPredicateRef:
          runtime.graphFunction.declarations["abg.judgment_predicate"] ?? "",
      },
      admissionBasis(
        {
          eventTime: runtime.eventTime,
          correlationId: `${runtime.correlationId}/workflow/${ordinal}`,
        },
        "parent",
      ),
    );
    if (opened.kind !== "c_call_admission") {
      return input.fail(
        `workflow-parent-${ordinal}`,
        `diagnostic://abiogenesis/hog/${opened.code}@5`,
        opened as unknown as JsonValue,
      );
    }
    const context: WorkflowParentContext = {
      kind: "workflow_child_fold_frame",
      runtime,
      cursor,
      value: input.value,
      graphEntryInput: input.graphEntryInput,
      graphEntryInputDigest: input.graphEntryInputDigest,
      ordinal,
      workflowTerm: term,
      parentCCall: opened.cCall,
      application: fanOutApplicationForBatch(runtime.graph, opened.cCall.batchRef),
    };
    const intent = rehydrateConstructionIntentForCursor(runtime.store, cursor);
    const selectedValue = intent?.actionKind === "invoke_graph_function"
      ? intent.targetInput
      : input.value;
    const selectedRef = intent?.actionKind === "invoke_graph_function"
      ? intent.targetInputRef
      : cursor.inputRef;
    const selectedDigest = intent?.actionKind === "invoke_graph_function"
      ? intent.targetInputDigest
      : cursor.inputDigest;
    if (
      selectedValue === null || selectedRef === null || selectedDigest === null ||
      sha256Canonical(selectedValue) !== selectedDigest ||
      (intent?.actionKind === "invoke_graph_function" &&
        (intent.selectedGraphFunctionRef !== term.graphFunctionRef ||
          intent.targetProgramLocusRef !== term.graphFunctionRef))
    ) {
      return input.fail(
        `workflow-input-${ordinal}`,
        "diagnostic://abiogenesis/hog/workflow-selected-input-mismatch@5",
        term as unknown as JsonValue,
      );
    }
    const prepared = yield* Effect.promise(() => Promise.resolve(childPort.prepare({
      parentExecutionBasis: runtime.executionBasis,
      parentTraversalScope: runtime.openedTraversalScope,
      parentCCallRef: opened.cCall.cCallRef,
      childGraphFunctionRef: term.graphFunctionRef,
      inputRef: selectedRef,
      inputDigest: selectedDigest,
      input: selectedValue,
      eventTime: runtime.eventTime,
      correlationId: `${runtime.correlationId}/workflow/${ordinal}/prepare`,
    })));
    if (prepared.kind !== "prepared_child_traversal") {
      const admission = Abg.admitChildPreparationRefusal(
        runtime.store,
        runtime.graph,
        runtime.graphFunction,
        cursor,
        opened.cCall,
        {
          kind: "child_preparation_refusal_candidate",
          schemaVersion: "5.0.0",
          childGraphFunctionRef: term.graphFunctionRef,
          inputRef: selectedRef,
          inputDigest: selectedDigest,
          stage: prepared.stage,
          diagnosticRef: prepared.diagnosticRef,
          message: prepared.message,
        },
        workflowBasis(context, "preparation-refusal"),
      );
      return {
        kind: "locus_evaluation",
        evaluation: {
          completion: admission.kind === "child_preparation_refusal_admission"
            ? rejectWorkflowAdmission(
                context,
                admission.admissionRejection,
                "preparation",
              )
            : workflowFailure(
                context,
                "preparation-refusal-admission",
                `diagnostic://abiogenesis/hog/${admission.code}@5`,
                admission as unknown as JsonValue,
              ),
          outputValueKind: null,
          outputContractRef: null,
        },
      };
    }
    return {
      kind: "workflow_child_request",
      frame: {
        ...context,
        childExecutionBasis: prepared.executionBasis,
        childTraversalScope: prepared.openedTraversalScope,
        childInput: prepared.input,
        childInputDigest: prepared.inputDigest,
        foldbackCorrelationId:
          `${runtime.correlationId}/workflow/${ordinal}/foldback`,
      },
      prepared,
      correlationId: `${runtime.correlationId}/workflow/${ordinal}/child`,
      deferFailedRunStop: runtime.deferFailedRunStop === true ||
        context.application?.elementGraphFunctionRef === term.graphFunctionRef,
    };
  });
}

function completeWorkflowLocus(
  frame: WorkflowChildFoldFrame,
  child: ExecutableTraversalCompletion,
  failLocus: TraversalLocusFailure,
): TraversalLocusEvaluation {
  const { runtime, cursor, workflowTerm, parentCCall, ordinal } = frame;
  if (child.disposition === "held") {
    if (
      child.continuationRef === null || child.heldInteraction === null ||
      child.heldGraph === null || child.heldClosureContract === null ||
      frame.childExecutionBasis.parentExecutionBasisRef !==
        runtime.executionBasis.basisRef ||
      frame.childTraversalScope.executionBasisRef !==
        frame.childExecutionBasis.basisRef ||
      sha256Canonical(frame.childInput) !== frame.childInputDigest
    ) {
      return failLocus(
        `workflow-hold-${ordinal}`,
        "diagnostic://abiogenesis/hog/workflow-hold-lineage-mismatch@5",
        child as unknown as JsonValue,
      );
    }
    const suspension: HeldWorkflowSuspension = deepFreeze({
      kind: "held_workflow_suspension",
      schemaVersion: "5.0.0",
      parentExecutionBasisRef: runtime.executionBasis.basisRef,
      parentTraversalScope: runtime.openedTraversalScope,
      parentGraph: runtime.graph,
      parentClosureContract: runtime.closureContract,
      parentCCall,
      sourceCursor: cursor,
      parentGraphInput: frame.graphEntryInput,
      parentGraphInputDigest: frame.graphEntryInputDigest,
      parentInput: frame.value,
      parentInputDigest: cursor.inputDigest,
      childExecutionBasisRef: frame.childExecutionBasis.basisRef,
      childTraversalScopeRef: frame.childTraversalScope.scopeRef,
      childInput: frame.childInput,
      childInputDigest: frame.childInputDigest,
      terminalMode: runtime.terminalMode ?? "close_run",
    });
    return {
      completion: deepFreeze({
        ...child,
        parentSuspensions: [...child.parentSuspensions, suspension],
      }),
      outputValueKind: null,
      outputContractRef: null,
    };
  }
  if (child.disposition === "failed" && child.replayState.runtimeStatus === "failed") {
    return { completion: child, outputValueKind: null, outputContractRef: null };
  }
  const failedFanOutTask = child.disposition === "failed" && frame.application !== null;
  if (
    child.resultRef === null || child.judgmentRef === null ||
    child.resultValue === null ||
    (!failedFanOutTask && child.disposition !== "closed" &&
      child.disposition !== "blocked")
  ) {
    return {
      completion: workflowFailure(
        frame,
        "child-completion",
        "diagnostic://abiogenesis/hog/child-completion-incomplete@5",
        child as unknown as JsonValue,
      ),
      outputValueKind: null,
      outputContractRef: null,
    };
  }
  const outputKind = runtime.leafPort.contractValueKind(
    workflowTerm.outputCarrierRef,
    "output",
  );
  const failureKind = runtime.leafPort.contractValueKind(
    parentCCall.failureContractRef,
    "failure",
  );
  const judgmentRelation = runtime.leafPort.resolveJudgmentRelation(
    parentCCall.judgmentPredicateRef,
  );
  if (outputKind === null || failureKind === null || judgmentRelation === null) {
    return failLocus(
      `workflow-contract-${ordinal}`,
      "diagnostic://abiogenesis/hog/workflow-result-contract-absent@5",
      workflowTerm as unknown as JsonValue,
    );
  }
  const intent = rehydrateConstructionIntentForCursor(runtime.store, cursor);
  const actionValue = intent?.actionKind === "invoke_graph_function" &&
      child.disposition === "closed" && child.closureRef !== null &&
      isJsonRecord(child.resultValue)
    ? deriveGraphFunctionActionEvaluationBasis(
        runtime.store,
        runtime.executionBasis,
        cursor,
        {
          childGraphFunctionRef: workflowTerm.graphFunctionRef,
          childResultRef: child.resultRef,
          childResultValue: child.resultValue,
          childJudgmentRef: child.judgmentRef,
          childClosureRef: child.closureRef,
        },
      )
    : null;
  if (intent?.actionKind === "invoke_graph_function" &&
      child.disposition === "closed" && actionValue === null) {
    return failLocus(
      `workflow-action-${ordinal}`,
      "diagnostic://abiogenesis/hog/workflow-action-evaluation-basis-absent@5",
      workflowTerm as unknown as JsonValue,
    );
  }
  const foldback = Abg.admitChildFoldback(
    runtime.store,
    runtime.graph,
    runtime.graphFunction,
    cursor,
    parentCCall,
    frame.childExecutionBasis,
    frame.childTraversalScope,
    {
      childResultRef: child.resultRef,
      childJudgmentRef: child.judgmentRef,
      childClosureRef: child.closureRef,
    },
    workflowBasis(frame, "child-foldback"),
  );
  if (foldback.kind !== "child_foldback_admission") {
    return {
      completion: workflowFailure(
        frame,
        "child-foldback",
        `diagnostic://abiogenesis/hog/${foldback.code}@5`,
        foldback as unknown as JsonValue,
      ),
      outputValueKind: null,
      outputContractRef: null,
    };
  }
  const childSucceeded = child.disposition === "closed";
  const childValue = childSucceeded ? actionValue ?? child.resultValue : child.resultValue;
  const evidence = Abg.admitEvidence(
    runtime.store,
    runtime.graph,
    runtime.graphFunction,
    cursor,
    parentCCall,
    Abg.deriveSubTraversalEvidence(
      parentCCall,
      foldback,
      cursor.inputDigest,
      sha256Canonical(childValue),
    ),
    parentCCall.evidenceContractRef,
    cursor.inputDigest,
    workflowBasis(frame, "evidence"),
  );
  if (evidence.kind === "c_call_admission_rejection") {
    return {
      completion: rejectWorkflowAdmission(frame, evidence, "evidence"),
      outputValueKind: outputKind,
      outputContractRef: workflowTerm.outputCarrierRef,
    };
  }
  const result = Abg.admitResult(
    runtime.store,
    runtime.graph,
    runtime.graphFunction,
    cursor,
    parentCCall,
    childValue,
    childSucceeded ? "success" : "failure",
    childSucceeded ? parentCCall.outputContractRef : parentCCall.failureContractRef,
    childSucceeded ? outputKind : failureKind,
    childSucceeded
      ? (value) => runtime.leafPort.validateContractValue(
          workflowTerm.outputCarrierRef,
          "output",
          value,
        ) && judgmentRelation.evaluate(frame.value, value)
      : (value) => isJsonRecord(value) && value.kind === failureKind &&
          value.schemaVersion === "5.0.0",
    [evidence],
    workflowBasis(frame, "result"),
  );
  if (result.kind === "c_call_admission_rejection") {
    return {
      completion: rejectWorkflowAdmission(frame, result, "result"),
      outputValueKind: outputKind,
      outputContractRef: workflowTerm.outputCarrierRef,
    };
  }
  const replayState = Abg.replay(runtime.store, {
    runId: runtime.openedTraversalScope.runId,
  });
  const judgmentCandidate = childSucceeded
    ? proposeJudgment(
        parentCCall,
        result,
        replayState,
        frame.value,
        judgmentRelation,
        parentCCall.judgmentContractRef,
      )
    : proposeFailureJudgment(
        parentCCall,
        result,
        replayState,
        child.diagnosticRef ??
          "diagnostic://abiogenesis/hog/child-traversal-blocked@5",
        parentCCall.judgmentContractRef,
      );
  const judgment = Abg.admitJudgment(
    runtime.store,
    runtime.graph,
    runtime.graphFunction,
    cursor,
    parentCCall,
    result,
    judgmentCandidate,
    replayState,
    workflowBasis(frame, "judgment"),
  );
  if (judgment.kind === "c_call_admission_rejection") {
    return {
      completion: rejectWorkflowAdmission(frame, judgment, "judgment"),
      outputValueKind: outputKind,
      outputContractRef: workflowTerm.outputCarrierRef,
    };
  }
  const fanOut = frame.application;
  if (judgment.judgment !== "advance" && fanOut === null) {
    return {
      completion: completeBlockedWorkflow(
        frame,
        result.resultRef,
        judgment.judgmentRef,
        judgment.admissionEventRef,
        judgment.reasonRef,
      ),
      outputValueKind: outputKind,
      outputContractRef: workflowTerm.outputCarrierRef,
    };
  }
  let target = deriveCompletedTraversalCursor(runtime.graph, cursor, {
    inputRef: result.resultRef,
    inputDigest: result.valueDigest,
  });
  if (target?.kind === "traversal_refusal") {
    return failLocus(
      `workflow-continuation-${ordinal}`,
      `diagnostic://abiogenesis/hog/${target.code}@5`,
      target as unknown as JsonValue,
    );
  }
  let route: Abg.AdmittedRoute;
  let routedValue: JsonValue = result.value;
  let routedResultRef = result.resultRef;
  let nextInputContractRef = parentCCall.outputContractRef;
  if (fanOut !== null) {
    const sourceContinuation = deriveCSourceContinuation(
      runtime.graph.template,
      cursor.currentNodeRef,
      cursor.termPath,
    );
    const completeVector = judgment.judgment === "advance" &&
      sourceContinuation.kind === "c_source_continuation" &&
      sourceContinuation.disposition === "advance" &&
      sourceContinuation.relation === "compose_next";
    const fanOutCompletion = Abg.admitFanOutCompletion({
      store: runtime.store,
      executionBasis: runtime.executionBasis,
      graph: runtime.graph,
      application: fanOut,
      sourceCursor: cursor,
      replayState: Abg.replay(runtime.store, {
        runId: runtime.openedTraversalScope.runId,
      }),
      completionKind: completeVector ? "complete_vector" : "partial_stop",
      validateOutputVector: (value): value is Readonly<Record<string, JsonValue>> =>
        runtime.leafPort.validateContractValue(
          fanOut.outputVectorRef,
          "output",
          value,
        ),
      basis: workflowBasis(frame, "fan-out-completion"),
    });
    if (fanOutCompletion.kind !== "fan_out_completion_admission") {
      return failLocus(
        `fan-out-${ordinal}`,
        `diagnostic://abiogenesis/hog/${fanOutCompletion.code}@5`,
        fanOutCompletion as unknown as JsonValue,
      );
    }
    const projected = Abg.replay(runtime.store, {
      runId: runtime.openedTraversalScope.runId,
    }).fanOutCompletions.find(
      (candidate) => candidate.completionRef === fanOutCompletion.completionRef,
    );
    if (projected === undefined) {
      return failLocus(
        `fan-out-replay-${ordinal}`,
        "diagnostic://abiogenesis/hog/fan-out-completion-replay-absent@5",
        fanOutCompletion as unknown as JsonValue,
      );
    }
    if (projected.completionKind === "partial_stop") {
      const proposal = Routes.proposeFanOutRoute(
        runtime.graph,
        fanOut,
        cursor,
        null,
        parentCCall,
        projected,
        Abg.replay(runtime.store, { runId: cursor.runId }),
        runtime.closureContract.transitionContractRef,
      );
      if (proposal.kind !== "traversal_route_candidate") {
        return failLocus(
          `fan-out-route-${ordinal}`,
          `diagnostic://abiogenesis/hog/${proposal.code}@5`,
          proposal as unknown as JsonValue,
        );
      }
      const admitted = Abg.admitRoute(
        runtime.store,
        runtime.executionBasis,
        runtime.graph,
        cursor,
        null,
        Abg.replay(runtime.store, { runId: cursor.runId }),
        proposal,
        workflowBasis(frame, "fan-out-route"),
        {
          graphFunction: runtime.graphFunction,
          cCall: parentCCall,
          result,
          judgment,
          application: fanOut,
          completion: projected,
        },
        { terminalizeRun: runtime.terminalMode !== "return_to_parent" },
      );
      if (admitted.kind !== "admitted_traversal_route") {
        return failLocus(
          `fan-out-route-${ordinal}`,
          `diagnostic://abiogenesis/hog/${admitted.code}@5`,
          admitted as unknown as JsonValue,
        );
      }
      return {
        completion: completion("blocked", Abg.replay(runtime.store, {
          runId: cursor.runId,
        }), {
          cCallRef: parentCCall.cCallRef,
          resultRef: result.resultRef,
          judgmentRef: judgment.judgmentRef,
          resultValue: result.value,
          diagnosticRef: judgment.reasonRef,
        }),
        outputValueKind: outputKind,
        outputContractRef: workflowTerm.outputCarrierRef,
      };
    }
    target = deriveCompletedTraversalCursor(runtime.graph, cursor, {
      inputRef: projected.outputVectorRef,
      inputDigest: projected.outputVectorDigest,
    });
    if (target?.kind === "traversal_refusal") {
      return failLocus(
        `fan-out-continuation-${ordinal}`,
        `diagnostic://abiogenesis/hog/${target.code}@5`,
        target as unknown as JsonValue,
      );
    }
    route = admitFoldSuccessRoute({
      store: runtime.store,
      executionBasis: runtime.executionBasis,
      graphFunction: runtime.graphFunction,
      graph: runtime.graph,
      source: cursor,
      target,
      success: {
        kind: "fan_out",
        cCall: parentCCall,
        result,
        judgment,
        application: fanOut,
        completion: projected,
        transitionContractRef: runtime.closureContract.transitionContractRef,
      },
      basis: workflowBasis(frame, "fan-out-success"),
    });
    routedValue = projected.outputVector;
    nextInputContractRef = projected.outputVectorContractRef;
    routedResultRef = projected.outputVectorRef;
  } else {
    route = admitFoldSuccessRoute({
      store: runtime.store,
      executionBasis: runtime.executionBasis,
      graphFunction: runtime.graphFunction,
      graph: runtime.graph,
      source: cursor,
      target,
      success: {
        kind: "judged",
        cCall: parentCCall,
        result,
        judgment,
        transitionContractRef: runtime.closureContract.transitionContractRef,
      },
      basis: workflowBasis(frame, "success"),
    });
  }
  if (route.routeKind === "advance" && target !== null) {
    const nextCursor = applyAdmittedRoute(cursor, target, "advance", route);
    if (nextCursor.kind === "traversal_refusal") {
      return failLocus(
        `workflow-route-${ordinal}`,
        `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
        nextCursor as unknown as JsonValue,
      );
    }
    return {
      completion: completion("advanced", Abg.replay(runtime.store, {
        runId: cursor.runId,
      }), {
        cCallRef: parentCCall.cCallRef,
        resultRef: routedResultRef,
        judgmentRef: judgment.judgmentRef,
        nextCursor,
        resultValue: routedValue,
        continuationKind: "advance",
        nextInputContractRef,
      }),
      outputValueKind: outputKind,
      outputContractRef: workflowTerm.outputCarrierRef,
    };
  }
  if (route.routeKind !== "terminal") {
    return failLocus(
      `workflow-route-${ordinal}`,
      "diagnostic://abiogenesis/hog/unexpected-workflow-route@5",
      route as unknown as JsonValue,
    );
  }
  const closure = runtime.terminalMode === "return_to_parent"
    ? Abg.admitChildClosure(
        runtime.store,
        selectHeldEventStoreDurablePrefix(runtime.store),
        runtime.openedTraversalScope,
        parentCCall,
        result,
        judgment,
        route,
        runtime.closureContract,
        workflowBasis(frame, "child-closure"),
      )
    : Abg.admitClosure(
        runtime.store,
        selectHeldEventStoreDurablePrefix(runtime.store),
        parentCCall,
        result,
        judgment,
        route,
        runtime.closureContract,
        workflowBasis(frame, "closure"),
      );
  if (closure.kind !== "child_closure_admission" &&
      closure.kind !== "closure_admission") {
    return failLocus(
      `workflow-closure-${ordinal}`,
      `diagnostic://abiogenesis/hog/${closure.code}@5`,
      closure as unknown as JsonValue,
    );
  }
  return {
    completion: completion("closed", Abg.replay(runtime.store, {
      runId: cursor.runId,
    }), {
      cCallRef: parentCCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      closureRef: closure.closureRef,
      resultValue: result.value,
    }),
    outputValueKind: outputKind,
    outputContractRef: workflowTerm.outputCarrierRef,
  };
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

interface DeferredApplicationState {
  readonly input: CompleteExecutableTraversalInput<unknown>;
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
  readonly judgment: AdmittedCCallJudgment;
  readonly targetCursor: TraversalCursor | null;
}

function deferredApplicationState(
  input: RestoreDeferredRecursionInput,
): DeferredApplicationState | null {
  const traversal = input.traversalInput;
  const outcome = Abg.projectAdmittedLeafCCallOutcome(traversal.store, {
    executionBasis: traversal.executionBasis,
    implementationSet: traversal.implementationSet,
    openedTraversalScope: traversal.openedTraversalScope,
    graph: traversal.graph,
    traversalStop: traversal.traversalStop,
    implementationResolution: traversal.implementationResolution,
    cCallRef: input.cCallRef,
    resultRef: input.resultRef,
    judgmentRef: input.judgmentRef,
  });
  if (outcome === null) return null;
  const target = deriveCompletedTraversalCursor(
    traversal.graph,
    traversal.traversalStop.cursor,
    {
      inputRef: outcome.result.resultRef,
      inputDigest: outcome.result.valueDigest,
    },
  );
  if (
    target?.kind === "traversal_refusal" ||
    traversal.terminalMode !== "return_to_application" ||
    traversal.graph.template.applications.find(
      (candidate) => candidate.applicationRef === input.application.applicationRef,
    ) !== input.application ||
    outcome.cCall.compositionRef !== input.application.applicationRef ||
    outcome.cCall.basisId !== traversal.executionBasis.basisRef ||
    outcome.cCall.graphCallId !== traversal.openedTraversalScope.graphCallId ||
    outcome.cCall.frameId !== traversal.openedTraversalScope.frameId ||
    outcome.cCall.programLocusRef !== traversal.traversalStop.programLocusRef ||
    sha256Canonical(traversal.input as unknown as JsonValue) !==
      traversal.inputDigest ||
    traversal.inputDigest !== traversal.traversalStop.cursor.inputDigest
  ) return null;
  return {
    input: traversal,
    cCall: outcome.cCall,
    result: outcome.result,
    judgment: outcome.judgment,
    targetCursor: target,
  };
}

function restoreDeferredRecursion(
  input: RestoreDeferredRecursionInput,
): ExecutableTraversalCompletion | null {
  const state = deferredApplicationState(input);
  if (state === null || !Abg.hasCurrentDeferredApplicationAuthority(
    state.input.store,
    {
      runId: state.cCall.runId,
      frameId: state.cCall.frameId,
      sourceCursorRef: state.input.traversalStop.cursor.cursorRef,
      judgmentRef: state.judgment.judgmentRef,
    },
  )) return null;
  const projected = Abg.projectCurrentDeferredApplication(state.input.store, {
    runId: state.cCall.runId,
    cCallRef: state.cCall.cCallRef,
    resultRef: state.result.resultRef,
    judgmentRef: state.judgment.judgmentRef,
  });
  return projected === null ? null : completion(
    "application_ready",
    projected.replayState,
    {
      cCallRef: projected.cCallRef,
      resultRef: projected.resultRef,
      judgmentRef: projected.judgmentRef,
      resultValue: projected.resultValue,
    },
  );
}

function recursionFailure(
  state: DeferredApplicationState,
  clock: ExecutableTraversalClock,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): ExecutableTraversalCompletion {
  Abg.admitRuntimeFailure(
    state.input.store,
    state.input.executionBasis,
    state.input.openedTraversalScope,
    "route",
    { stage, candidate },
    diagnosticRef,
    {
      ...admissionBasis(clock, stage),
      causationEventRefs: [state.judgment.admissionEventRef],
    },
  );
  return completion("failed", replayLeaf(state.input), {
    cCallRef: state.cCall.cCallRef,
    resultRef: state.result.resultRef,
    judgmentRef: state.judgment.judgmentRef,
    resultValue: state.result.value,
    diagnosticRef,
  });
}

function requireDeferredApplication(
  completionValue: ExecutableTraversalCompletion,
  restoration: RestoreDeferredRecursionInput,
): DeferredApplicationState {
  const state = deferredApplicationState(restoration);
  const projected = restoreDeferredRecursion(restoration);
  if (state === null || projected === null ||
      !sameCanonical(completionValue, projected)) {
    throw new TypeError("deferred application differs from admitted truth");
  }
  return state;
}

function finishRecursionTerminal(
  state: DeferredApplicationState,
  application: Readonly<RecurseApplication>,
  clock: ExecutableTraversalClock,
): ExecutableTraversalCompletion {
  if (recursionTerminationDecision(application, state.result.value) !== true) {
    return recursionFailure(
      state,
      clock,
      "terminal",
      "diagnostic://abiogenesis/hog/application-terminal-not-declared@5",
      application as unknown as JsonValue,
    );
  }
  const route = admitFoldSuccessRoute({
    store: state.input.store,
    executionBasis: state.input.executionBasis,
    graphFunction: state.input.graphFunction,
    graph: state.input.graph,
    source: state.input.traversalStop.cursor,
    target: state.targetCursor,
    success: {
      kind: "judged",
      cCall: state.cCall,
      result: state.result,
      judgment: state.judgment,
      transitionContractRef: state.input.closureContract.transitionContractRef,
    },
    basis: admissionBasis(clock, "terminal-route"),
  });
  if (route.routeKind === "advance" && state.targetCursor !== null) {
    const nextCursor = applyAdmittedRoute(
      state.input.traversalStop.cursor,
      state.targetCursor,
      "advance",
      route,
    );
    if (nextCursor.kind === "traversal_refusal") {
      return recursionFailure(
        state,
        clock,
        "terminal-route",
        `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
        nextCursor as unknown as JsonValue,
      );
    }
    return completion("advanced", replayLeaf(state.input), {
      cCallRef: state.cCall.cCallRef,
      resultRef: state.result.resultRef,
      judgmentRef: state.judgment.judgmentRef,
      nextCursor,
      resultValue: state.result.value,
      continuationKind: "advance",
      nextInputContractRef: application.outputContractRef,
    });
  }
  if (route.routeKind !== "terminal") {
    return recursionFailure(
      state,
      clock,
      "terminal-route",
      "diagnostic://abiogenesis/hog/application-terminal-route-mismatch@5",
      route as unknown as JsonValue,
    );
  }
  const basis = admissionBasis(clock, "terminal-closure");
  const closure = state.input.applicationCompletionMode === "return_to_parent"
    ? Abg.admitChildClosure(
        state.input.store,
        selectHeldEventStoreDurablePrefix(state.input.store),
        state.input.openedTraversalScope,
        state.cCall,
        state.result,
        state.judgment,
        route,
        state.input.closureContract,
        basis,
      )
    : Abg.admitClosure(
        state.input.store,
        selectHeldEventStoreDurablePrefix(state.input.store),
        state.cCall,
        state.result,
        state.judgment,
        route,
        state.input.closureContract,
        basis,
      );
  if (closure.kind !== "child_closure_admission" &&
      closure.kind !== "closure_admission") {
    return recursionFailure(
      state,
      clock,
      "terminal-closure",
      `diagnostic://abiogenesis/hog/${closure.code}@5`,
      closure as unknown as JsonValue,
    );
  }
  return completion("closed", replayLeaf(state.input), {
    cCallRef: state.cCall.cCallRef,
    resultRef: state.result.resultRef,
    judgmentRef: state.judgment.judgmentRef,
    closureRef: closure.closureRef,
    resultValue: state.result.value,
  });
}

function blockRecursion(
  state: DeferredApplicationState,
  application: Readonly<RecurseApplication>,
  clock: ExecutableTraversalClock,
  preparation?: ChildTraversalPreparationRefusal,
): ExecutableTraversalCompletion {
  const preparationAdmission = preparation === undefined
    ? null
    : Abg.admitApplicationChildPreparationRefusal(
        state.input.store,
        state.input.executionBasis,
        state.input.graph,
        application,
        state.cCall,
        state.result,
        state.judgment,
        state.input.traversalStop.cursor,
        {
          childGraphFunctionRef: application.graphFunctionRef,
          inputRef: state.result.resultRef,
          inputDigest: state.result.valueDigest,
          stage: preparation.stage,
          diagnosticRef: preparation.diagnosticRef,
          message: preparation.message,
        },
        admissionBasis(clock, "preparation-refusal"),
      );
  if (preparationAdmission !== null &&
      preparationAdmission.kind !==
        "application_child_preparation_refusal_admission") {
    return recursionFailure(
      state,
      clock,
      "preparation-refusal",
      `diagnostic://abiogenesis/hog/${preparationAdmission.code}@5`,
      preparationAdmission as unknown as JsonValue,
    );
  }
  const replayState = replayLeaf(state.input);
  const proposal = Routes.proposeRecursionRoute(
    state.input.graph,
    application,
    state.input.traversalStop.cursor,
    null,
    state.cCall,
    state.judgment,
    null,
    replayState,
    state.cCall.transitionContractRef,
    "blocked",
    preparationAdmission ?? undefined,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return recursionFailure(
      state,
      clock,
      "blocked-route",
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      proposal as unknown as JsonValue,
    );
  }
  const route = Abg.admitRecursionRoute(
    state.input.store,
    state.input.executionBasis,
    state.input.graph,
    application,
    state.input.traversalStop.cursor,
    null,
    replayState,
    proposal,
    admissionBasis(clock, "blocked-route"),
    {
      cCall: state.cCall,
      result: state.result,
      judgment: state.judgment,
      foldback: null,
      ...(preparationAdmission === null
        ? {}
        : { preparationRefusal: preparationAdmission }),
    },
  );
  if (route.kind !== "admitted_traversal_route" ||
      route.routeKind !== "blocked" || route.runStoppedEventRef === null) {
    return recursionFailure(
      state,
      clock,
      "blocked-route",
      route.kind === "admitted_traversal_route"
        ? "diagnostic://abiogenesis/hog/application-run-stop-absent@5"
        : `diagnostic://abiogenesis/hog/${route.code}@5`,
      route as unknown as JsonValue,
    );
  }
  return completion("blocked", replayLeaf(state.input), {
    cCallRef: state.cCall.cCallRef,
    resultRef: state.result.resultRef,
    judgmentRef: state.judgment.judgmentRef,
    resultValue: state.result.value,
    diagnosticRef: preparation?.diagnosticRef ??
      "reason://abiogenesis/recursion/bound-exhausted@5",
  });
}

function beginRecursionApplication(input: Readonly<{
  parent: ExecuteGraphTraversalCommonInput;
  traversalInput: CompleteExecutableTraversalInput<
    Readonly<Record<string, JsonValue>>
  >;
  application: Readonly<RecurseApplication>;
  completion: ExecutableTraversalCompletion;
  graphEntryInput: Readonly<Record<string, JsonValue>>;
  graphEntryInputDigest: `sha256:${string}`;
  leafOrdinal: number;
  fail: TraversalLocusFailure;
}>): Effect.Effect<
  | Readonly<{ kind: "recursion_completion"; completion: ExecutableTraversalCompletion }>
  | Readonly<{
      kind: "recursion_child_request";
      frame: RecursionChildFoldFrame;
      prepared: PreparedChildTraversal;
      correlationId: string;
    }>
> {
  return Effect.gen(function* () {
    const { parent, application, traversalInput, leafOrdinal } = input;
    const coordinates = input.completion;
    if (coordinates.cCallRef === null || coordinates.resultRef === null ||
        coordinates.judgmentRef === null) {
      return input.fail(
        `recursion-restoration-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/recursion-restoration-coordinates-absent@5",
        coordinates as unknown as JsonValue,
      );
    }
    const restoration: RestoreDeferredRecursionInput = {
      traversalInput,
      application,
      cCallRef: coordinates.cCallRef,
      resultRef: coordinates.resultRef,
      judgmentRef: coordinates.judgmentRef,
    };
    const restored = restoreDeferredRecursion(restoration);
    if (restored === null || !sameCanonical(restored, coordinates)) {
      return input.fail(
        `recursion-restoration-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/recursion-restoration-mismatch@5",
        coordinates as unknown as JsonValue,
      );
    }
    const state = requireDeferredApplication(restored, restoration);
    const clock = (stage: string): ExecutableTraversalClock => ({
      eventTime: parent.eventTime,
      correlationId: `${parent.correlationId}/recursion/${leafOrdinal}/${stage}`,
    });
    const termination = restored.resultValue === null
      ? null
      : recursionTerminationDecision(application, restored.resultValue);
    if (termination === null) {
      return input.fail(
        `recursion-termination-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/recursion-termination-value-invalid@5",
        application as unknown as JsonValue,
      );
    }
    if (termination) {
      return {
        kind: "recursion_completion",
        completion: finishRecursionTerminal(state, application, clock("terminal")),
      };
    }
    if (traversalInput.traversalStop.cursor.attempt >= application.bound) {
      return {
        kind: "recursion_completion",
        completion: blockRecursion(state, application, clock("bound")),
      };
    }
    const childPort = parent.childTraversalPreparationPort;
    if (childPort === undefined || !isChildTraversalPreparationPort(childPort) ||
        restored.cCallRef === null || restored.resultRef === null ||
        !isJsonRecord(restored.resultValue)) {
      return input.fail(
        `recursion-child-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/recursion-child-preparation-absent@5",
        application as unknown as JsonValue,
      );
    }
    const childInput = restored.resultValue;
    const prepared = yield* Effect.promise(() => Promise.resolve(childPort.prepare({
      parentExecutionBasis: parent.executionBasis,
      parentTraversalScope: parent.openedTraversalScope,
      parentCCallRef: restored.cCallRef!,
      childGraphFunctionRef: application.graphFunctionRef,
      inputRef: restored.resultRef!,
      inputDigest: sha256Canonical(childInput),
      input: childInput,
      eventTime: parent.eventTime,
      correlationId: clock("prepare").correlationId,
    })));
    if (prepared.kind !== "prepared_child_traversal") {
      return {
        kind: "recursion_completion",
        completion: blockRecursion(
          state,
          application,
          clock("prepare-refusal"),
          prepared,
        ),
      };
    }
    return {
      kind: "recursion_child_request",
      frame: {
        kind: "recursion_child_fold_frame",
        parent,
        traversalInput,
        application,
        restored,
        restoration,
        graphEntryInput: input.graphEntryInput,
        graphEntryInputDigest: input.graphEntryInputDigest,
        leafOrdinal,
        childExecutionBasis: prepared.executionBasis,
        childTraversalScope: prepared.openedTraversalScope,
        childInput: prepared.input,
        childInputDigest: prepared.inputDigest,
      },
      prepared,
      correlationId: clock("child").correlationId,
    };
  });
}

function completeRecursionChild(
  frame: RecursionChildFoldFrame,
  child: ExecutableTraversalCompletion,
): ExecutableTraversalCompletion {
  const state = requireDeferredApplication(frame.restored, frame.restoration);
  const clock: ExecutableTraversalClock = {
    eventTime: frame.parent.eventTime,
    correlationId:
      `${frame.parent.correlationId}/recursion/${frame.leafOrdinal}/foldback`,
  };
  if (child.disposition === "held") {
    if (
      child.continuationRef === null || child.heldInteraction === null ||
      child.heldGraph === null || child.heldClosureContract === null ||
      frame.childExecutionBasis.parentExecutionBasisRef !==
        state.input.executionBasis.basisRef ||
      frame.childTraversalScope.executionBasisRef !==
        frame.childExecutionBasis.basisRef
    ) throw new TypeError("held recursion has inconsistent lineage");
    const suspension: HeldRecursionSuspension = deepFreeze({
      kind: "held_recursion_suspension",
      schemaVersion: "5.0.0",
      parentExecutionBasisRef: state.input.executionBasis.basisRef,
      parentTraversalScope: state.input.openedTraversalScope,
      parentGraph: state.input.graph,
      parentClosureContract: state.input.closureContract,
      parentGraphInput: frame.graphEntryInput,
      parentGraphInputDigest: frame.graphEntryInputDigest,
      application: frame.application,
      evaluatorCCall: state.cCall,
      evaluatorResult: state.result,
      evaluatorJudgment: state.judgment,
      sourceCursor: state.input.traversalStop.cursor,
      evaluatorInput: state.input.input as Readonly<Record<string, JsonValue>>,
      evaluatorInputDigest: state.input.inputDigest,
      childExecutionBasisRef: frame.childExecutionBasis.basisRef,
      childTraversalScopeRef: frame.childTraversalScope.scopeRef,
      childInput: frame.childInput,
      childInputDigest: frame.childInputDigest,
      terminalMode: frame.parent.terminalMode ?? "close_run",
    });
    return deepFreeze({
      ...child,
      parentSuspensions: [...child.parentSuspensions, suspension],
    });
  }
  if (child.disposition === "failed" && child.replayState.runtimeStatus === "failed") {
    return child;
  }
  if (
    (child.disposition !== "closed" && child.disposition !== "blocked") ||
    child.resultRef === null || child.judgmentRef === null ||
    child.resultValue === null || !isJsonRecord(child.resultValue)
  ) {
    return recursionFailure(
      state,
      clock,
      "child-completion",
      "diagnostic://abiogenesis/hog/application-foldback-mismatch@5",
      child as unknown as JsonValue,
    );
  }
  const foldback = Abg.admitApplicationChildFoldback(
    state.input.store,
    state.input.executionBasis,
    state.input.graph,
    frame.application,
    state.cCall,
    state.judgment.judgmentRef,
    state.input.traversalStop.cursor,
    frame.childExecutionBasis,
    frame.childTraversalScope,
    {
      resultRef: child.resultRef,
      judgmentRef: child.judgmentRef,
      closureRef: child.closureRef,
    },
    admissionBasis(clock, "foldback"),
  );
  if (foldback.kind !== "application_child_foldback_admission") {
    return recursionFailure(
      state,
      clock,
      "foldback",
      `diagnostic://abiogenesis/hog/${foldback.code}@5`,
      foldback as unknown as JsonValue,
    );
  }
  const blocked = foldback.childDisposition === "blocked";
  const target = blocked
    ? null
    : deriveRecursionReentryCursor(
        state.input.graph,
        frame.application,
        state.input.traversalStop.cursor,
        {
          inputRef: foldback.childResultRef,
          inputDigest: foldback.outputDigest,
        },
      );
  if (target?.kind === "traversal_refusal") {
    return recursionFailure(
      state,
      clock,
      "reentry",
      `diagnostic://abiogenesis/hog/${target.code}@5`,
      target as unknown as JsonValue,
    );
  }
  const replayState = replayLeaf(state.input);
  const proposal = Routes.proposeRecursionRoute(
    state.input.graph,
    frame.application,
    state.input.traversalStop.cursor,
    target,
    state.cCall,
    state.judgment,
    foldback,
    replayState,
    state.cCall.transitionContractRef,
    blocked ? "blocked" : "advance",
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return recursionFailure(
      state,
      clock,
      "route",
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      proposal as unknown as JsonValue,
    );
  }
  const route = Abg.admitRecursionRoute(
    state.input.store,
    state.input.executionBasis,
    state.input.graph,
    frame.application,
    state.input.traversalStop.cursor,
    target,
    replayState,
    proposal,
    admissionBasis(clock, "route"),
    {
      cCall: state.cCall,
      result: state.result,
      judgment: state.judgment,
      foldback,
    },
  );
  if (route.kind !== "admitted_traversal_route") {
    return recursionFailure(
      state,
      clock,
      "route",
      `diagnostic://abiogenesis/hog/${route.code}@5`,
      route as unknown as JsonValue,
    );
  }
  if (blocked) {
    if (route.routeKind !== "blocked" || route.runStoppedEventRef === null) {
      return recursionFailure(
        state,
        clock,
        "blocked-route",
        "diagnostic://abiogenesis/hog/application-run-stop-absent@5",
        route as unknown as JsonValue,
      );
    }
    return completion("blocked", replayLeaf(state.input), {
      cCallRef: state.cCall.cCallRef,
      resultRef: foldback.childResultRef,
      judgmentRef: state.judgment.judgmentRef,
      resultValue: child.resultValue,
      diagnosticRef: foldback.childReasonRef ??
        "diagnostic://abiogenesis/hog/child-traversal-blocked@5",
    });
  }
  if (target === null || route.routeKind !== "advance") {
    return recursionFailure(
      state,
      clock,
      "advance-route",
      "diagnostic://abiogenesis/hog/application-advance-route-absent@5",
      route as unknown as JsonValue,
    );
  }
  const nextCursor = applyRecursionRoute(
    state.input.store,
    state.input.traversalStop.cursor,
    target,
    route,
  );
  if (nextCursor.kind === "traversal_refusal") {
    return recursionFailure(
      state,
      clock,
      "advance-route",
      `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
      nextCursor as unknown as JsonValue,
    );
  }
  return completion("advanced", replayLeaf(state.input), {
    cCallRef: state.cCall.cCallRef,
    resultRef: foldback.childResultRef,
    judgmentRef: state.judgment.judgmentRef,
    nextCursor,
    resultValue: child.resultValue,
    continuationKind: "advance",
    nextInputContractRef: frame.application.outputContractRef,
  });
}

function beginExecutableLocus(input: Readonly<{
  runtime: ExecuteGraphTraversalCommonInput;
  stop: Extract<TraversalStopRef, { readonly stopClass: "executable" }>;
  value: Readonly<Record<string, JsonValue>>;
  graphEntryInput: Readonly<Record<string, JsonValue>>;
  graphEntryInputDigest: `sha256:${string}`;
  ordinal: number;
  fail: TraversalLocusFailure;
}>): Effect.Effect<ExecutableLocusStep> {
  return Effect.gen(function* () {
    const { runtime, stop } = input;
    const resolution = selectAdmittedImplementationResolution(
      runtime.implementationSet,
      {
        graphFunctionRef: runtime.graph.graphFunctionRef,
        nodeRef: stop.nodeRef,
        programLocusRef: stop.programLocusRef,
        implementationBindingRef: stop.implementationBindingRef,
      },
    );
    const outputValueKind = runtime.leafPort.contractValueKind(
      stop.outputContractRef,
      "output",
    );
    const failureValueKind = runtime.leafPort.contractValueKind(
      stop.failureContractRef,
      "failure",
    );
    if (resolution === null || outputValueKind === null || failureValueKind === null) {
      return input.fail(
        `leaf-resolution-${input.ordinal}`,
        "diagnostic://abiogenesis/implementation/admitted-row-absent@5",
        stop as unknown as JsonValue,
      );
    }
    const application = recursionApplication(runtime.graph, stop.compositionRef);
    const leaf: CompleteExecutableTraversalInput<
      Readonly<Record<string, JsonValue>>
    > = {
      store: runtime.store,
      executionBasis: runtime.executionBasis,
      openedTraversalScope: runtime.openedTraversalScope,
      program: runtime.program,
      graphFunction: runtime.graphFunction,
      graph: runtime.graph,
      traversalStop: stop,
      implementationSet: runtime.implementationSet,
      implementationResolution: resolution,
      leafPort: runtime.leafPort,
      input: input.value,
      inputDigest: stop.cursor.inputDigest,
      closureContract: runtime.closureContract,
      actorRuntimeBinding: runtime.actorRuntimeBinding,
      ...(runtime.deferFailedRunStop === true ? { deferFailedRunStop: true } : {}),
      terminalMode: application === null
        ? runtime.terminalMode ?? "close_run"
        : "return_to_application",
      ...(application === null
        ? {}
        : { applicationCompletionMode: runtime.terminalMode ?? "close_run" }),
      clock: {
        eventTime: runtime.eventTime,
        correlationId: `${runtime.correlationId}/leaf/${input.ordinal}`,
      },
    };
    const opened = Abg.openCCall(
      leaf.store,
      leaf.executionBasis,
      leaf.openedTraversalScope,
      leaf.program,
      leaf.graphFunction,
      leaf.graph,
      stop,
      leaf.implementationSet,
      resolution,
      admissionBasis(leaf.clock, "open"),
    );
    if (opened.kind !== "c_call_admission") {
      return input.fail(
        `leaf-open-${input.ordinal}`,
        `diagnostic://abiogenesis/c-call/${opened.code}@5`,
        opened as unknown as JsonValue,
      );
    }
    const bindProbabilisticEffects = stop.computeRegime === "F_P"
      ? (contracts: Readonly<{
          instructionContractRef: string;
          resultContractRef: string;
        }>) => Abg.bindActorProcessLeafEffectPort({
          store: leaf.store,
          executionBasis: leaf.executionBasis,
          scope: leaf.openedTraversalScope,
          cCall: opened.cCall,
          inputDigest: leaf.inputDigest,
          workerContracts: contracts,
          runtime: leaf.actorRuntimeBinding!,
          basis: admissionBasis(leaf.clock, "actor-process"),
        })
      : null;
    const invocation = yield* Effect.promise(() => Promise.resolve(
      leaf.leafPort.invoke({
      resolution,
      input: leaf.input,
      inputDigest: leaf.inputDigest,
      failureContractRef: stop.failureContractRef,
      bindProbabilisticEffects,
      }),
    ));
    if (invocation.kind === "leaf_invocation_owner_refusal") {
      return input.fail(
        `leaf-owner-${input.ordinal}`,
        invocation.diagnosticRef,
        invocation as unknown as JsonValue,
      );
    }
    const admitted = admitLeafCandidate(
      leaf,
      opened.cCall,
      invocation,
      failureValueKind,
      outputValueKind,
    );
    if (admitted.kind === "retry_leaf") {
      const snapshot = leaf.store.readAll();
      const prefix = selectValidatedRuntimeEventPrefix(snapshot);
      const transaction = admitRuntimeEventTransactionAtExpectedPrefix(
        leaf.store,
        sha256Canonical(snapshot as unknown as JsonValue),
        () => {
          const transition = AbgRetry.admitRetryRuntimeFailureTransitionInActiveTransaction(
            leaf.store,
            prefix,
            leaf.executionBasis,
            leaf.graph,
            leaf.graphFunction,
            stop.cursor,
            admitted.cCall,
            admitted.source,
            admitted.failureCandidate,
            admitted.failureValueKind,
            admissionBasis(leaf.clock, "runtime-failure"),
          );
          if (transition.kind !== "retry_runtime_failure_transition_admission") {
            throw new TypeError(`retry transition refused: ${transition.code}`);
          }
          return transition.disposition === "blocked"
            ? blockedLeaf(
                leaf,
                admitted.cCall,
                transition.close.result.resultRef,
                transition.close.judgment.judgmentRef,
                transition.close.judgment.admissionEventRef,
                transition.close.judgment.reasonRef,
                transition.stoppedProgresses,
              )
            : transition;
        },
      );
      if (transaction.value.kind === "executable_traversal_completion") {
        return { kind: "locus_evaluation" as const, evaluation: {
          completion: transaction.value,
          outputValueKind,
          outputContractRef: stop.outputContractRef,
        } };
      }
      if (transaction.successorPrefix === null) {
        throw new TypeError("retry transition has no durable successor");
      }
      const retry = AbgRetry.projectExecutableRetryInput({
        prefix: transaction.successorPrefix,
        selector: {
          kind: "retry_frontier_selector",
          schemaVersion: "5.0.0",
          runId: leaf.openedTraversalScope.runId,
          graphCallId: leaf.openedTraversalScope.graphCallId,
          frameId: leaf.openedTraversalScope.frameId,
          retryBoundaryRef: transaction.value.progress.retryBoundaryRef,
          retryProgressRef: transaction.value.progress.progressRef,
        },
        program: leaf.program,
        graphFunction: leaf.graphFunction,
        graph: leaf.graph,
      });
      if (retry.kind !== "executable_retry_input") {
        throw new TypeError(`retry projection refused: ${retry.code}`);
      }
      return {
        kind: "retry_request" as const,
        resume: admitRetryResume({
          runtime: leaf,
          predecessorPrefix: transaction.successorPrefix,
          retry,
        }),
        correlationId: `${runtime.correlationId}/retry/${retry.nextAttempt}`,
      };
    }
    if (admitted.kind === "executable_traversal_completion") {
      return {
        kind: "locus_evaluation" as const,
        evaluation: {
          completion: admitted,
          outputValueKind,
          outputContractRef: stop.outputContractRef,
        },
      };
    }
    let completed = completeAdmittedLeaf(leaf, admitted, invocation.candidate);
    if (application !== null && completed.disposition === "application_ready") {
      const recursion = yield* beginRecursionApplication({
        parent: runtime,
        traversalInput: leaf,
        application,
        completion: completed,
        graphEntryInput: input.graphEntryInput,
        graphEntryInputDigest: input.graphEntryInputDigest,
        leafOrdinal: input.ordinal,
        fail: input.fail,
      });
      if (recursion.kind === "recursion_child_request") {
        return {
          ...recursion,
          outputValueKind,
          outputContractRef: stop.outputContractRef,
        };
      }
      completed = recursion.completion;
    }
    return {
      kind: "locus_evaluation" as const,
      evaluation: {
        completion: completed,
        outputValueKind,
        outputContractRef: stop.outputContractRef,
      },
    };
  });
}

const PROJECTED_RETRY_RESUME_KEYS = Object.freeze([
  "disposition",
  "executableRetryInputDigest",
  "executableRetryInputRef",
  "inputContractRef",
  "inputDigest",
  "inputRef",
  "inputValue",
  "kind",
  "nextAttempt",
  "nextCursor",
  "progressEventRef",
  "retryAttemptAdmissionEventRef",
  "retryAttemptDigest",
  "retryAttemptRef",
  "retryFrontierDigest",
  "retryFrontierRef",
  "routeAdmissionEventRef",
  "routeDigest",
  "routeRef",
  "schemaVersion",
  "selectedFrontierRowRef",
  "successorPrefix",
].sort());

function isJsonRecord(
  value: unknown,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSha256Digest(value: unknown): value is `sha256:${string}` {
  return typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isProjectedRetryResumeCarrier(
  value: unknown,
): value is ProjectedRetryResumeSuccess {
  try {
    if (!isJsonRecord(value)) return false;
    const keys = Object.keys(value).sort();
    const nextCursor = value.nextCursor as unknown as TraversalCursor;
    if (
      keys.length !== PROJECTED_RETRY_RESUME_KEYS.length ||
      keys.some((key, index) => key !== PROJECTED_RETRY_RESUME_KEYS[index]) ||
      value.kind !== "projected_retry_resume" ||
      value.schemaVersion !== "5.0.0" ||
      value.disposition !== "resumed" ||
      !isSha256Digest(value.executableRetryInputDigest) ||
      value.executableRetryInputRef !==
        `executable-retry-input://abiogenesis/${value.executableRetryInputDigest.slice("sha256:".length)}` ||
      !isSha256Digest(value.retryFrontierDigest) ||
      value.retryFrontierRef !==
        `retry-attempt-frontier://abiogenesis/${value.retryFrontierDigest.slice("sha256:".length)}` ||
      !isNonEmptyString(value.selectedFrontierRowRef) ||
      !isNonEmptyString(value.progressEventRef) ||
      !isNonEmptyString(value.routeAdmissionEventRef) ||
      !isSha256Digest(value.routeDigest) ||
      value.routeRef !==
        `traversal-route://abiogenesis/${value.routeDigest.slice("sha256:".length)}` ||
      !isNonEmptyString(value.retryAttemptAdmissionEventRef) ||
      !isSha256Digest(value.retryAttemptDigest) ||
      value.retryAttemptRef !==
        `retry-attempt://abiogenesis/${value.retryAttemptDigest.slice("sha256:".length)}` ||
      !Number.isSafeInteger(value.nextAttempt) || Number(value.nextAttempt) < 2 ||
      !isNonEmptyString(value.inputContractRef) ||
      !isNonEmptyString(value.inputRef) ||
      !isSha256Digest(value.inputDigest) ||
      !isJsonRecord(value.inputValue) ||
      sha256Canonical(value.inputValue) !== value.inputDigest ||
      typeof value.nextCursor !== "object" || value.nextCursor === null ||
      !isTraversalCursorCandidate(nextCursor) ||
      nextCursor.attempt !== value.nextAttempt ||
      nextCursor.retryPath.at(-1) !== value.nextAttempt ||
      nextCursor.inputRef !== value.inputRef ||
      nextCursor.inputDigest !== value.inputDigest ||
      !validateDurablePrefixCoordinate(value.successorPrefix)
    ) return false;
    return true;
  } catch {
    return false;
  }
}

interface ReprojectedProjectedRetryResume {
  readonly cursor: TraversalCursor;
  readonly executionBasis: ExecutionBasis;
}

interface TraversalEvaluationFrame {
  readonly runtime: ExecuteGraphTraversalInput;
  readonly graphEntryInput: Readonly<Record<string, JsonValue>>;
  readonly graphEntryInputDigest: `sha256:${string}`;
  readonly cursor: TraversalCursor;
  readonly input: Readonly<Record<string, JsonValue>>;
  readonly ordinal: number;
  readonly structuralOrdinal: number;
}

interface TraversalLocusEvaluation {
  readonly completion: ExecutableTraversalCompletion;
  readonly outputValueKind: string | null;
  readonly outputContractRef: string | null;
}

type TraversalLocusFailure = (
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
) => never;

type WorkflowTerm = Extract<
  ReturnType<typeof resolveTraversalTerm>,
  Readonly<{ kind: "c_workflow" }>
>;

interface WorkflowChildFoldFrame {
  readonly kind: "workflow_child_fold_frame";
  readonly runtime: ExecuteGraphTraversalCommonInput;
  readonly cursor: TraversalCursor;
  readonly value: Readonly<Record<string, JsonValue>>;
  readonly graphEntryInput: Readonly<Record<string, JsonValue>>;
  readonly graphEntryInputDigest: `sha256:${string}`;
  readonly ordinal: number;
  readonly workflowTerm: WorkflowTerm;
  readonly parentCCall: CCall;
  readonly application: Readonly<FanOutApplication> | null;
  readonly childExecutionBasis: PreparedChildTraversal["executionBasis"];
  readonly childTraversalScope: PreparedChildTraversal["openedTraversalScope"];
  readonly childInput: PreparedChildTraversal["input"];
  readonly childInputDigest: PreparedChildTraversal["inputDigest"];
  readonly foldbackCorrelationId: string;
}

type WorkflowParentContext = Omit<
  WorkflowChildFoldFrame,
  | "childExecutionBasis"
  | "childTraversalScope"
  | "childInput"
  | "childInputDigest"
  | "foldbackCorrelationId"
>;

interface RecursionChildFoldFrame {
  readonly kind: "recursion_child_fold_frame";
  readonly parent: ExecuteGraphTraversalCommonInput;
  readonly traversalInput: CompleteExecutableTraversalInput<
    Readonly<Record<string, JsonValue>>
  >;
  readonly application: Readonly<RecurseApplication>;
  readonly restored: ExecutableTraversalCompletion;
  readonly restoration: RestoreDeferredRecursionInput;
  readonly graphEntryInput: Readonly<Record<string, JsonValue>>;
  readonly graphEntryInputDigest: `sha256:${string}`;
  readonly leafOrdinal: number;
  readonly childExecutionBasis: PreparedChildTraversal["executionBasis"];
  readonly childTraversalScope: PreparedChildTraversal["openedTraversalScope"];
  readonly childInput: PreparedChildTraversal["input"];
  readonly childInputDigest: PreparedChildTraversal["inputDigest"];
}

type WorkflowLocusStep =
  | Readonly<{ kind: "locus_evaluation"; evaluation: TraversalLocusEvaluation }>
  | Readonly<{
      kind: "workflow_child_request";
      frame: WorkflowChildFoldFrame;
      prepared: PreparedChildTraversal;
      correlationId: string;
      deferFailedRunStop: boolean;
    }>;

type ExecutableLocusStep =
  | Readonly<{ kind: "locus_evaluation"; evaluation: TraversalLocusEvaluation }>
  | Readonly<{
      kind: "retry_request";
      resume: ProjectedRetryResumeSuccess;
      correlationId: string;
    }>
  | Readonly<{
      kind: "recursion_child_request";
      frame: RecursionChildFoldFrame;
      prepared: PreparedChildTraversal;
      correlationId: string;
      outputValueKind: string;
      outputContractRef: string;
    }>;

interface WorkflowReturnFoldFrame {
  readonly kind: "workflow_return";
  readonly parent: TraversalEvaluationFrame;
  readonly workflow: WorkflowChildFoldFrame;
}

interface RecursionReturnFoldFrame {
  readonly kind: "recursion_return";
  readonly parent: TraversalEvaluationFrame;
  readonly recursion: RecursionChildFoldFrame;
  readonly outputValueKind: string;
  readonly outputContractRef: string;
}

type TraversalReturnFoldFrame =
  | WorkflowReturnFoldFrame
  | RecursionReturnFoldFrame;

interface TraversalFoldCoordinate {
  readonly runtimeSlot: number;
  readonly cursor: TraversalCursor;
  readonly ordinal: number;
  readonly structuralOrdinal: number;
}

interface TraversalFoldValue {
  readonly current: Readonly<Record<string, JsonValue>>;
  readonly graphEntry: Readonly<Record<string, JsonValue>>;
  readonly graphEntryDigest: `sha256:${string}`;
}

interface TraversalFoldReturnCoordinate {
  readonly kind: "workflow_return" | "recursion_return";
  readonly ownerFrameSlot: number;
  readonly parentCoordinate: TraversalFoldCoordinate;
  readonly parentValue: TraversalFoldValue;
  readonly outputValueKind: string | null;
  readonly outputContractRef: string | null;
}

interface TraversalFoldReceiptCoordinate {
  readonly ownerReceiptSlot: number;
}

type TraversalFoldOwnerReceipt =
  | Readonly<{ kind: "structural_advance"; cursor: TraversalCursor }>
  | TraversalLocusStep
  | Readonly<{
      kind: "seed_completion";
      completion: ExecutableTraversalCompletion;
    }>;

interface EvaluateTraversalFoldSeed {
  readonly stateKind: "evaluate";
  readonly frame: TraversalEvaluationFrame;
  readonly returns: readonly TraversalReturnFoldFrame[];
}

interface ReturnTraversalFoldSeed {
  readonly stateKind: "return";
  readonly completion: ExecutableTraversalCompletion;
  readonly returns: readonly TraversalReturnFoldFrame[];
}

type TraversalFoldSeed =
  | EvaluateTraversalFoldSeed
  | ReturnTraversalFoldSeed;

type TraversalLocusStep = WorkflowLocusStep | ExecutableLocusStep;

function reprojectProjectedRetryResume(
  input: ExecuteGraphTraversalCommonInput,
  carrier: ProjectedRetryResumeSuccess,
): ReprojectedProjectedRetryResume | null {
  try {
    const durableEvents = readRuntimeEventsAtDurablePrefix(
      carrier.successorPrefix,
    );
    const routeEvent = durableEvents.at(-2);
    const attemptEvent = durableEvents.at(-1);
    if (
      routeEvent?.kind !== "traversal_route_admitted" ||
      routeEvent.eventId !== carrier.routeAdmissionEventRef ||
      attemptEvent?.kind !== "retry_attempt_opened" ||
      attemptEvent.eventId !== carrier.retryAttemptAdmissionEventRef ||
      routeEvent.admissionOrdinal + 1 !== attemptEvent.admissionOrdinal
    ) return null;
    const authorityPrefix = selectValidatedRuntimeEventPrefix(durableEvents);
    const prefix = selectValidatedRuntimeEventPrefix(
      durableEvents,
      { runId: carrier.nextCursor.runId },
    );
    const executionBasis = rehydrateExecutionBasisAtPrefix(
      prefix,
      carrier.nextCursor.executionBasisRef,
    );
    if (
      executionBasis === null ||
      !sameCanonical(executionBasis, input.executionBasis) ||
      executionBasis.graphRef !== input.graph.materializationRef ||
      executionBasis.graphDigest !== input.graph.materializationDigest ||
      executionBasis.rawInputAdmissionRef !== input.graph.admittedInputRef ||
      executionBasis.rawInputDigest !== input.graph.admittedInputDigest ||
      canonicalDigest(executionBasis.rawInputValue) !==
        executionBasis.rawInputDigest
    ) return null;
    const frontier = projectDeclaredCRetryFrontier(
      prefix,
      input.graph,
      carrier.nextCursor,
      input.graphFunction,
      carrier.nextCursor.retryPath.length,
      authorityPrefix,
    );
    const active = frontier?.state === "attempt_active"
      ? frontier.active
      : null;
    const prior = frontier?.rows.at(-2);
    if (
      active === null ||
      prior?.kind !== "declared_c_retry_retry_progress" ||
      prior.consumption.kind !== "progress_consumed_by_retry"
    ) return null;
    const progress = prior.progress;
    const ownedRoute = prior.consumption.route;
    const route = projectAdmittedRetryRouteAtPrefix(
      prefix,
      ownedRoute.admissionEventRef,
      authorityPrefix,
    );
    const sourceCursor = rehydrateHeldInteractionCursor(
      prefix,
      prior.failureCCall.sourceCursor,
    );
    if (route === null || sourceCursor === null) {
      return null;
    }
    const targetCursor = deriveRetryTraversalCursor(input.graph, sourceCursor, {
      inputRef: carrier.inputRef,
      inputDigest: carrier.inputDigest,
    });
    if (targetCursor.kind !== "traversal_cursor") return null;
    const applied = applyAdmittedRoute(
      sourceCursor,
      targetCursor,
      "retry",
      route,
    );
    if (
      applied.kind === "traversal_refusal" ||
      !sameCanonical(applied, carrier.nextCursor) ||
      route.admissionEventRef !== carrier.routeAdmissionEventRef ||
      route.routeRef !== carrier.routeRef ||
      route.routeDigest !== carrier.routeDigest ||
      route.sourceCursorRef !== sourceCursor.cursorRef ||
      route.sourceCursorDigest !== sourceCursor.cursorDigest ||
      route.targetCursorRef !== carrier.nextCursor.cursorRef ||
      route.targetCursorDigest !== carrier.nextCursor.cursorDigest ||
      route.cCallRef !== progress.cCallRef ||
      route.judgmentRef !== progress.judgmentRef ||
      !sameCanonical(route.consumedAvailabilityRefs, [
        progress.judgmentRef,
        progress.progressRef,
      ])
    ) return null;
    const attempt = active.attempt;
    if (
      attempt.admissionEventRef !== carrier.retryAttemptAdmissionEventRef ||
      attempt.attemptRef !== carrier.retryAttemptRef ||
      attempt.attemptDigest !== carrier.retryAttemptDigest ||
      attempt.attempt !== carrier.nextAttempt ||
      attempt.retryBoundaryRef !== progress.retryBoundaryRef ||
      attempt.priorJudgmentRef !== progress.judgmentRef ||
      attempt.priorRouteRef !== route.routeRef ||
      attempt.inputContractRef !== carrier.inputContractRef ||
      attempt.inputRef !== carrier.inputRef ||
      attempt.inputDigest !== carrier.inputDigest ||
      !sameCanonical(attempt.inputValue, carrier.inputValue) ||
      !sameCanonical(attempt.retryPath, carrier.nextCursor.retryPath) ||
      !sameCanonical(active.cursor, carrier.nextCursor) ||
      !sameCanonical(active.currentCursor, carrier.nextCursor) ||
      progress.admissionEventRef !== carrier.progressEventRef
    ) return null;
    return { cursor: applied, executionBasis };
  } catch {
    return null;
  }
}

function initializeTraversalEvaluationFrame(
  input: ExecuteGraphTraversalInput,
): TraversalEvaluationFrame {
  const projectedBranch = Object.hasOwn(input, "projectedRetryResume");
  const initialInput = projectedBranch
    ? null
    : input as InitialOrNonRetryExecuteGraphTraversalInput;
  if (
    initialInput !== null &&
    (
      !isExecutionBasis(input.executionBasis) ||
      input.graph.admittedInputRef !==
        input.executionBasis.rawInputAdmissionRef ||
      input.graph.admittedInputDigest !== input.executionBasis.rawInputDigest ||
      input.graphValidation.admittedInputRef !==
        input.executionBasis.rawInputAdmissionRef ||
      input.graphValidation.admittedInputDigest !==
        input.executionBasis.rawInputDigest ||
      initialInput.inputDigest !== input.executionBasis.rawInputDigest ||
      canonicalDigest(initialInput.input) !== initialInput.inputDigest ||
      canonicalDigest(input.executionBasis.rawInputValue) !==
        input.executionBasis.rawInputDigest ||
      !sameCanonical(
        initialInput.input,
        input.executionBasis.rawInputValue,
      )
    )
  ) {
    throw new TypeError(
      "diagnostic://abiogenesis/hog/execution-basis-input-mismatch@5",
    );
  }
  let projectedStop: TraverseResult | null = null;
  let projectedInput: Readonly<Record<string, JsonValue>> | null = null;
  let projectedCursor: TraversalCursor | null = null;
  let projectedExecutionBasis: ExecutionBasis | null = null;
  if (projectedBranch) {
    const candidate = (input as unknown as Readonly<Record<string, unknown>>)
      .projectedRetryResume;
    if (
      Object.hasOwn(input, "input") ||
      Object.hasOwn(input, "inputDigest") ||
      Object.hasOwn(input, "resume") ||
      !isProjectedRetryResumeCarrier(candidate)
    ) {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-carrier-mismatch@5",
      );
    }
    try {
      assertHeldEventStoreAtDurablePrefix(input.store, candidate.successorPrefix);
    } catch {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-prefix-mismatch@5",
      );
    }
    const reprojected = reprojectProjectedRetryResume(input, candidate);
    if (reprojected === null) {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-projection-mismatch@5",
      );
    }
    let traversal;
    try {
      traversal = traversalAtCursor(input, candidate.nextCursor);
    } catch {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-traversal-mismatch@5",
      );
    }
    if (
      traversal.kind !== "traversal_stop_ref" ||
      traversal.stopClass !== "executable" ||
      !sameCanonical(traversal.cursor, candidate.nextCursor) ||
      !sameCanonical(reprojected.cursor, candidate.nextCursor) ||
      traversal.cursor.inputRef !== candidate.inputRef ||
      traversal.cursor.inputDigest !== candidate.inputDigest ||
      traversal.inputContractRef !== candidate.inputContractRef ||
      sha256Canonical(candidate.inputValue as unknown as JsonValue) !==
        candidate.inputDigest
    ) {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-traversal-mismatch@5",
      );
    }
    projectedStop = traversal;
    projectedInput = candidate.inputValue;
    projectedCursor = candidate.nextCursor;
    projectedExecutionBasis = reprojected.executionBasis;
  }
  if (
    !isAdmittedLeafInvocationPort(input.leafPort) ||
    input.leafPort.implementationSetRef !== input.implementationSet.implementationSetRef ||
    input.leafPort.implementationSetDigest !== input.implementationSet.implementationSetDigest
  ) {
    return fail(
      input,
      "leaf-port",
      "diagnostic://abiogenesis/implementation/admitted-leaf-port-mismatch@5",
      { implementationSetRef: input.implementationSet.implementationSetRef },
    );
  }
  let stop: TraverseResult;
  let resumedCursor: TraversalCursor | undefined = projectedCursor ?? undefined;
  let currentInput: Readonly<Record<string, JsonValue>>;
  if (projectedStop !== null && projectedInput !== null) {
    stop = projectedStop;
    currentInput = projectedInput;
  } else if (initialInput?.resume !== undefined) {
    resumedCursor = initialInput.resume.cursor;
    if (
      !hasAdmittedTraversalCursor(input.store, initialInput.resume.cursor) ||
      initialInput.resume.cursor.executionBasisRef !== input.executionBasis.basisRef ||
      initialInput.resume.cursor.traversalScopeRef !==
        input.openedTraversalScope.scopeRef ||
      initialInput.resume.cursor.graphRef !== input.graph.materializationRef ||
      initialInput.resume.cursor.inputDigest !== initialInput.resume.inputDigest ||
      initialInput.resume.cursor.retryPath.length !== 0 ||
      sha256Canonical(initialInput.resume.input as unknown as JsonValue) !==
        initialInput.resume.inputDigest
    ) {
      return fail(
        input,
        "resume-basis",
        "diagnostic://abiogenesis/hog/resume-basis-mismatch@5",
        {
          cursorRef: initialInput.resume.cursor.cursorRef,
          inputDigest: initialInput.resume.inputDigest,
        },
      );
    }
    stop = traversalAtCursor(input, initialInput.resume.cursor);
    currentInput =
      materializedInputAtCursor(input.graph, activeCursor(stop))?.value ??
        initialInput.resume.input;
  } else {
    if (initialInput === null) {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-carrier-mismatch@5",
      );
    }
    try {
      stop = traverse({
        program: input.program,
        graphFunction: input.graphFunction,
        graph: input.graph,
        graphValidation: input.graphValidation,
        executionBasis: input.executionBasis,
        openedTraversalScope: input.openedTraversalScope,
      });
    } catch {
      return fail(
        input,
        "initial-traversal",
        "diagnostic://abiogenesis/hog/traversal-exception@5",
        { errorClass: "traversal_exception" },
      );
    }
    currentInput =
      materializedInputAtCursor(input.graph, activeCursor(stop))?.value ??
        initialInput.input;
  }
  const graphEntryBasis = projectedExecutionBasis ?? input.executionBasis;
  const graphEntryInput = graphEntryBasis.rawInputValue;
  const graphEntryInputDigest = graphEntryBasis.rawInputDigest;
  if (stop.kind === "traversal_refusal") {
    return fail(
      input,
      "initial-traversal-refusal",
      `diagnostic://abiogenesis/hog/${stop.code}@5`,
      stop as unknown as JsonValue,
    );
  }
  const initialCursor = stop.kind === "traversal_stop_ref" ? stop.cursor : stop;
  if (resumedCursor === undefined) {
    const cursorAdmission = admitInitialTraversalCursor(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      input.graph,
      input.graphValidation,
      initialCursor,
      {
        eventTime: input.eventTime,
        correlationId: `${input.correlationId}/cursor`,
        causationEventRefs: [],
      },
    );
    if (cursorAdmission.kind !== "traversal_cursor_admission") {
      return fail(
        input,
        "cursor-refusal",
        `diagnostic://abiogenesis/hog/${cursorAdmission.code}@5`,
        cursorAdmission as unknown as JsonValue,
      );
    }
  }

  return {
    runtime: input,
    graphEntryInput,
    graphEntryInputDigest,
    cursor: initialCursor,
    input: currentInput,
    ordinal: 0,
    structuralOrdinal: 0,
  };
}

function traversalFoldProgram(
  initialFoldState: TraversalFoldSeed,
  failureRuntime: ExecuteGraphTraversalCommonInput,
): Effect.Effect<ExecutableTraversalCompletion> {
  return Effect.suspend(() => {
    /*
     * Transitional Step-1 bridge. These immutable positional environments are
     * private to this one Effect program. They are neither identity registries
     * nor runtime truth, and Step 2 deletes the giant owner frames behind them.
     */
    let runtimes: readonly ExecuteGraphTraversalInput[] = Object.freeze([]);
    let ownerFrames: readonly TraversalReturnFoldFrame[] = Object.freeze([]);
    let ownerReceipts: readonly TraversalFoldOwnerReceipt[] = Object.freeze([]);

    const storeRuntime = (runtime: ExecuteGraphTraversalInput): number => {
      const slot = runtimes.length;
      runtimes = Object.freeze([...runtimes, runtime]);
      return slot;
    };
    const requireRuntime = (slot: number): ExecuteGraphTraversalInput => {
      const runtime = runtimes[slot];
      return runtime ?? fail(
        failureRuntime,
        "fold-runtime-slot",
        "diagnostic://abiogenesis/hog/fold-runtime-slot-absent@5",
        { slot },
      );
    };
    const storeOwnerReceipt = (
      receipt: TraversalFoldOwnerReceipt,
    ): TraversalFoldReceiptCoordinate => {
      const ownerReceiptSlot = ownerReceipts.length;
      ownerReceipts = Object.freeze([...ownerReceipts, receipt]);
      return Object.freeze({ ownerReceiptSlot });
    };
    const requireOwnerReceipt = (
      coordinate: TraversalFoldReceiptCoordinate,
    ): TraversalFoldOwnerReceipt => {
      const receipt = ownerReceipts[coordinate.ownerReceiptSlot];
      return receipt ?? fail(
        failureRuntime,
        "fold-owner-receipt-slot",
        "diagnostic://abiogenesis/hog/fold-owner-receipt-slot-absent@5",
        { ownerReceiptSlot: coordinate.ownerReceiptSlot },
      );
    };
    const coordinateFromFrame = (
      frame: TraversalEvaluationFrame,
    ): TraversalFoldCoordinate => Object.freeze({
      runtimeSlot: storeRuntime(frame.runtime),
      cursor: frame.cursor,
      ordinal: frame.ordinal,
      structuralOrdinal: frame.structuralOrdinal,
    });
    const valueFromFrame = (
      frame: TraversalEvaluationFrame,
    ): TraversalFoldValue => Object.freeze({
      current: frame.input,
      graphEntry: frame.graphEntryInput,
      graphEntryDigest: frame.graphEntryInputDigest,
    });
    const frameFromCore = (
      coordinate: TraversalFoldCoordinate,
      value: TraversalFoldValue,
    ): TraversalEvaluationFrame => ({
      runtime: requireRuntime(coordinate.runtimeSlot),
      graphEntryInput: value.graphEntry,
      graphEntryInputDigest: value.graphEntryDigest,
      cursor: coordinate.cursor,
      input: value.current,
      ordinal: coordinate.ordinal,
      structuralOrdinal: coordinate.structuralOrdinal,
    });
    const directStepFor = (
      coordinate: TraversalFoldCoordinate,
    ): DirectCTraversalStep => {
      const runtime = requireRuntime(coordinate.runtimeSlot);
      const directStep = deriveDirectCStepFromGraph(runtime.graph.template, {
        nodeRef: coordinate.cursor.currentNodeRef,
        termPath: coordinate.cursor.termPath,
        taskOrdinal: coordinate.cursor.taskOrdinal,
        attempt: coordinate.cursor.attempt,
        retryPath: coordinate.cursor.retryPath,
      });
      return directStep.kind === "direct_c_traversal_refusal"
        ? fail(
            runtime,
            `direct-step-${coordinate.ordinal}`,
            `diagnostic://abiogenesis/hog/${directStep.code}@5`,
            directStep as unknown as JsonValue,
          )
        : directStep;
    };
    const evaluateFromFrame = (
      frame: TraversalEvaluationFrame,
      returns: readonly TraversalFoldReturnCoordinate[],
    ): DirectEffectFoldEvaluate<
      TraversalFoldCoordinate,
      TraversalFoldValue,
      TraversalFoldReturnCoordinate,
      DirectCTraversalStep
    > => {
      const coordinate = coordinateFromFrame(frame);
      return evaluateDirectEffectFold<
        TraversalFoldCoordinate,
        TraversalFoldValue,
        TraversalFoldReturnCoordinate,
        DirectCTraversalStep
      >({
        coordinate,
        value: valueFromFrame(frame),
        returns,
        step: directStepFor(coordinate),
      });
    };
    const storeOwnerFrame = (
      frame: TraversalReturnFoldFrame,
    ): TraversalFoldReturnCoordinate => {
      const ownerFrameSlot = ownerFrames.length;
      ownerFrames = Object.freeze([...ownerFrames, frame]);
      return Object.freeze({
        kind: frame.kind,
        ownerFrameSlot,
        parentCoordinate: coordinateFromFrame(frame.parent),
        parentValue: valueFromFrame(frame.parent),
        outputValueKind: frame.kind === "recursion_return"
          ? frame.outputValueKind
          : null,
        outputContractRef: frame.kind === "recursion_return"
          ? frame.outputContractRef
          : null,
      });
    };
    const requireOwnerFrame = (
      coordinate: TraversalFoldReturnCoordinate,
    ): TraversalReturnFoldFrame => {
      const frame = ownerFrames[coordinate.ownerFrameSlot];
      return frame ?? fail(
        failureRuntime,
        "fold-owner-frame-slot",
        "diagnostic://abiogenesis/hog/fold-owner-frame-slot-absent@5",
        { ownerFrameSlot: coordinate.ownerFrameSlot },
      );
    };
    const initialReturns = initialFoldState.returns.map(storeOwnerFrame);
    let initialCore: DirectEffectFoldOpenState<
      TraversalFoldCoordinate,
      TraversalFoldValue,
      TraversalFoldReturnCoordinate,
      DirectCTraversalStep,
      TraversalFoldReceiptCoordinate
    >;
    if (initialFoldState.stateKind === "evaluate") {
      initialCore = evaluateFromFrame(initialFoldState.frame, initialReturns);
    } else {
      const parent = initialReturns.at(-1);
      if (parent === undefined) {
        return Effect.succeed(initialFoldState.completion);
      }
      initialCore = returnDirectEffectFold({
        coordinate: parent.parentCoordinate,
        value: parent.parentValue,
        returns: initialReturns,
        receipt: storeOwnerReceipt({
          kind: "seed_completion",
          completion: initialFoldState.completion,
        }),
      });
    }

    const evaluateLocusOnce = (
      frame: TraversalEvaluationFrame,
      directStep: DirectCTraversalStep,
    ): Effect.Effect<TraversalLocusStep> => Effect.suspend(() => {
      const runtime = frame.runtime;
      const failLocus = (
        stage: string,
        diagnosticRef: string,
        candidate: JsonValue,
      ): never => fail(runtime, stage, diagnosticRef, candidate);
      if (directStep.stepKind === "enter_child") {
        if (!isExactLocusStep(frame.cursor, directStep)) {
          return failLocus(
            `workflow-step-${frame.ordinal}`,
            "diagnostic://abiogenesis/hog/workflow-step-mismatch@5",
            frame.cursor as unknown as JsonValue,
          );
        }
        return beginWorkflowLocus({
          runtime,
          cursor: frame.cursor,
          value: frame.input,
          graphEntryInput: frame.graphEntryInput,
          graphEntryInputDigest: frame.graphEntryInputDigest,
          ordinal: frame.ordinal,
          fail: failLocus,
        }) as Effect.Effect<TraversalLocusStep>;
      }
      if (directStep.stepKind !== "open_leaf") {
        return failLocus(
          `direct-step-${frame.ordinal}`,
          "diagnostic://abiogenesis/hog/direct-c-step-mismatch@5",
          frame.cursor as unknown as JsonValue,
        );
      }
      const currentStop = traversalAtCursor(
        runtime,
        frame.cursor,
        directStep,
      );
      if (
        currentStop.kind !== "traversal_stop_ref" ||
        !isExactLocusStep(currentStop, directStep)
      ) {
        return failLocus(
          `direct-step-${frame.ordinal}`,
          "diagnostic://abiogenesis/hog/direct-c-step-mismatch@5",
          currentStop as unknown as JsonValue,
        );
      }
      if (directStep.leafKind === "interaction") {
        if (currentStop.stopClass !== "interaction") {
          return failLocus(
            `interaction-step-${frame.ordinal}`,
            "diagnostic://abiogenesis/hog/interaction-step-mismatch@5",
            currentStop as unknown as JsonValue,
          );
        }
        return Effect.sync(() => ({
          kind: "locus_evaluation" as const,
          evaluation: evaluateInteractionLocus({
            runtime,
            stop: currentStop,
            value: frame.input,
            ordinal: frame.ordinal,
            fail: failLocus,
          }),
        }));
      }
      if (currentStop.stopClass !== "executable") {
        return failLocus(
          `executable-step-${frame.ordinal}`,
          "diagnostic://abiogenesis/hog/executable-step-mismatch@5",
          currentStop as unknown as JsonValue,
        );
      }
      return beginExecutableLocus({
        runtime,
        stop: currentStop,
        value: frame.input,
        graphEntryInput: frame.graphEntryInput,
        graphEntryInputDigest: frame.graphEntryInputDigest,
        ordinal: frame.ordinal,
        fail: failLocus,
      });
    });

    const program = directEffectFold<
      TraversalFoldCoordinate,
      TraversalFoldValue,
      TraversalFoldReturnCoordinate,
      DirectCTraversalStep,
      TraversalFoldReceiptCoordinate
    >(
      initialCore,
      (state) => Effect.suspend(() => Effect.gen(function* () {
        if (state.stateKind === "evaluate") {
          const frame = frameFromCore(state.coordinate, state.value);
          const runtime = frame.runtime;
          let ownerReceipt: TraversalFoldOwnerReceipt;
          if (
            state.step.stepKind !== "open_leaf" &&
            state.step.stepKind !== "enter_child"
          ) {
            const structural = yield* advanceStructuralTraversal({
              store: runtime.store,
              program: runtime.program,
              graphFunction: runtime.graphFunction,
              graph: runtime.graph,
              graphValidation: runtime.graphValidation,
              executionBasis: runtime.executionBasis,
              openedTraversalScope: runtime.openedTraversalScope,
              initial: frame.cursor,
              step: state.step,
              inputValue: frame.input,
              inputAuthority: runtime.leafPort,
              routeOrdinal: frame.structuralOrdinal,
              clock: {
                eventTime: runtime.eventTime,
                correlationId:
                  `${runtime.correlationId}/structural/${frame.ordinal}`,
              },
            });
            if (
              structural.kind !== "traversal_cursor" ||
              !isTraversalCursorCandidate(structural as TraversalCursor) ||
              (structural as TraversalCursor).cursorRef === frame.cursor.cursorRef
            ) {
              return fail(
                runtime,
                `structural-step-${frame.ordinal}`,
                "diagnostic://abiogenesis/hog/structural-step-refused@5",
                structural as unknown as JsonValue,
              );
            }
            ownerReceipt = {
              kind: "structural_advance",
              cursor: structural as TraversalCursor,
            };
          } else {
            ownerReceipt = yield* evaluateLocusOnce(frame, state.step);
          }
          return returnDirectEffectFold({
            coordinate: state.coordinate,
            value: state.value,
            returns: state.returns,
            receipt: storeOwnerReceipt(ownerReceipt),
          });
        }

        const ownerReceipt = requireOwnerReceipt(state.receipt);
        if (ownerReceipt.kind === "structural_advance") {
          const runtime = requireRuntime(state.coordinate.runtimeSlot);
          const coordinate = Object.freeze({
            ...state.coordinate,
            cursor: ownerReceipt.cursor,
            structuralOrdinal: state.coordinate.structuralOrdinal + 1,
          });
          return evaluateDirectEffectFold<
            TraversalFoldCoordinate,
            TraversalFoldValue,
            TraversalFoldReturnCoordinate,
            DirectCTraversalStep
          >({
            coordinate,
            value: Object.freeze({
              ...state.value,
              current: materializedInputAtCursor(
                runtime.graph,
                ownerReceipt.cursor,
              )?.value ?? state.value.current,
            }),
            returns: state.returns,
            step: directStepFor(coordinate),
          });
        }
        if (ownerReceipt.kind === "retry_request") {
          const runtime = requireRuntime(state.coordinate.runtimeSlot);
          const frame = initializeTraversalEvaluationFrame(
            projectedRetryTraversalInput(
              runtime,
              ownerReceipt.resume,
              ownerReceipt.correlationId,
            ),
          );
          return evaluateFromFrame(frame, state.returns);
        }
        if (ownerReceipt.kind === "workflow_child_request") {
          const runtime = requireRuntime(state.coordinate.runtimeSlot);
          const parent = frameFromCore(state.coordinate, state.value);
          const child = initializeTraversalEvaluationFrame(
            preparedChildTraversalInput(
              runtime,
              ownerReceipt.prepared,
              ownerReceipt.correlationId,
              ownerReceipt.deferFailedRunStop,
            ),
          );
          const returns = Object.freeze([
            ...state.returns,
            storeOwnerFrame({
              kind: "workflow_return",
              parent,
              workflow: ownerReceipt.frame,
            }),
          ]);
          return evaluateFromFrame(child, returns);
        }
        if (ownerReceipt.kind === "recursion_child_request") {
          const runtime = requireRuntime(state.coordinate.runtimeSlot);
          const parent = frameFromCore(state.coordinate, state.value);
          const child = initializeTraversalEvaluationFrame(
            preparedChildTraversalInput(
              runtime,
              ownerReceipt.prepared,
              ownerReceipt.correlationId,
              runtime.deferFailedRunStop === true,
            ),
          );
          const returns = Object.freeze([
            ...state.returns,
            storeOwnerFrame({
              kind: "recursion_return",
              parent,
              recursion: ownerReceipt.frame,
              outputValueKind: ownerReceipt.outputValueKind,
              outputContractRef: ownerReceipt.outputContractRef,
            }),
          ]);
          return evaluateFromFrame(child, returns);
        }

        const evaluation = ownerReceipt.kind === "seed_completion"
          ? {
              completion: ownerReceipt.completion,
              outputValueKind: null,
              outputContractRef: null,
            }
          : ownerReceipt.evaluation;
        const completion = evaluation.completion;
        if (completion.disposition !== "advanced") {
          const continuation = state.returns.at(-1);
          if (continuation === undefined) {
            return completeDirectEffectFold(storeOwnerReceipt({
              kind: "seed_completion",
              completion,
            }));
          }
          const ownerFrame = requireOwnerFrame(continuation);
          const remaining = state.returns.slice(0, -1);
          const parentRuntime = requireRuntime(
            continuation.parentCoordinate.runtimeSlot,
          );
          const failLocus = (
            stage: string,
            diagnosticRef: string,
            candidate: JsonValue,
          ): never => fail(parentRuntime, stage, diagnosticRef, candidate);
          const parentEvaluation = ownerFrame.kind === "workflow_return"
            ? completeWorkflowLocus(
                ownerFrame.workflow,
                completion,
                failLocus,
              )
            : {
                completion: completeRecursionChild(
                  ownerFrame.recursion,
                  completion,
                ),
                outputValueKind: continuation.outputValueKind,
                outputContractRef: continuation.outputContractRef,
              };
          return returnDirectEffectFold({
            coordinate: continuation.parentCoordinate,
            value: continuation.parentValue,
            returns: remaining,
            receipt: storeOwnerReceipt({
              kind: "locus_evaluation",
              evaluation: parentEvaluation,
            }),
          });
        }

        const runtime = requireRuntime(state.coordinate.runtimeSlot);
        const nextMaterializedInput = materializedInputAtCursor(
          runtime.graph,
          completion.nextCursor,
        );
        if (
          completion.nextCursor === null ||
          completion.continuationKind === null ||
          completion.nextInputContractRef === null ||
          evaluation.outputValueKind === null ||
          evaluation.outputContractRef === null ||
          (nextMaterializedInput === null &&
            (typeof completion.resultValue !== "object" ||
              completion.resultValue === null ||
              Array.isArray(completion.resultValue))) ||
          (nextMaterializedInput === null &&
            (completion.continuationKind === "retry"
              ? completion.nextCursor.inputRef.length === 0 ||
                completion.nextCursor.inputDigest !==
                  sha256Canonical(completion.resultValue)
              : !runtime.leafPort.validateContractValue(
                  completion.nextInputContractRef,
                  "output",
                  completion.resultValue,
                )))
        ) {
          return fail(
            runtime,
            `advanced-result-${state.coordinate.ordinal}`,
            "diagnostic://abiogenesis/hog/advanced-result-basis-absent@5",
            {
              leafOrdinal: state.coordinate.ordinal,
              completionDisposition: completion.disposition,
            },
          );
        }
        const coordinate = Object.freeze({
          ...state.coordinate,
          cursor: completion.nextCursor,
          ordinal: state.coordinate.ordinal + 1,
          structuralOrdinal: 0,
        });
        return evaluateDirectEffectFold<
          TraversalFoldCoordinate,
          TraversalFoldValue,
          TraversalFoldReturnCoordinate,
          DirectCTraversalStep
        >({
          coordinate,
          value: Object.freeze({
            ...state.value,
            current: nextMaterializedInput?.value ??
              completion.resultValue as Readonly<Record<string, JsonValue>>,
          }),
          returns: state.returns,
          step: directStepFor(coordinate),
        });
      })),
    );
    return Effect.map(program, (finalCoordinate) => {
      const finalReceipt = requireOwnerReceipt(finalCoordinate);
      return finalReceipt.kind === "seed_completion"
        ? finalReceipt.completion
        : fail(
            failureRuntime,
            "fold-final-receipt",
            "diagnostic://abiogenesis/hog/fold-final-receipt-mismatch@5",
            { ownerReceiptSlot: finalCoordinate.ownerReceiptSlot },
          );
    });
  });
}

function graphTraversalEffect(
  input: ExecuteGraphTraversalInput,
): Effect.Effect<ExecutableTraversalCompletion> {
  return traversalFoldProgram(
    {
      stateKind: "evaluate",
      frame: initializeTraversalEvaluationFrame(input),
      returns: [],
    },
    input,
  );
}

async function runGraphTraversalProgram(
  program: Effect.Effect<ExecutableTraversalCompletion>,
): Promise<ExecutableTraversalCompletion> {
  const exit = await runEffectProgram(program);
  if (Exit.isSuccess(exit)) return exit.value;
  throw Cause.squash(exit.cause);
}

function seedParentContinuation(
  parent: InitialOrNonRetryExecuteGraphTraversalInput,
  parentGraphInput: Readonly<Record<string, JsonValue>>,
  parentGraphInputDigest: `sha256:${string}`,
  completion: ExecutableTraversalCompletion,
  returns: readonly TraversalReturnFoldFrame[],
  stage: "interaction-resume" | "workflow-resume" | "recursion-resume",
): TraversalFoldSeed {
  if (completion.disposition !== "advanced") {
    return { stateKind: "return", completion, returns };
  }
  if (
      completion.nextCursor === null ||
      completion.resultValue === null ||
      typeof completion.resultValue !== "object" ||
      Array.isArray(completion.resultValue)
  ) {
    return fail(
        parent,
        `${stage}-advance`,
        `diagnostic://abiogenesis/hog/${stage}-advance-incomplete@5`,
        completion as unknown as JsonValue,
    );
  }
  const nextInput = completion.resultValue as Readonly<
    Record<string, JsonValue>
  >;
  const nextInputDigest = sha256Canonical(nextInput);
  if (completion.nextCursor.inputDigest !== nextInputDigest) {
    return fail(
        parent,
        `${stage}-advance-digest`,
        `diagnostic://abiogenesis/hog/${stage}-advance-digest-mismatch@5`,
        completion as unknown as JsonValue,
    );
  }
  return {
    stateKind: "evaluate",
    frame: initializeTraversalEvaluationFrame({
      ...parent,
      input: parentGraphInput,
      inputDigest: parentGraphInputDigest,
      resume: {
        cursor: completion.nextCursor,
        input: nextInput,
        inputDigest: nextInputDigest,
      },
    }),
    returns,
  };
}

export type ExecuteGraphTraversalRequest =
  | ExecuteGraphTraversalInput
  | ResumeHeldInteractionInput;

function rehydrateWorkflowReturnFrame(
  input: ResumeHeldParentFrameInput & Readonly<{
    suspension: HeldWorkflowSuspension;
    parentCCall: CCall;
  }>,
): WorkflowReturnFoldFrame {
  const parent = input.parent;
  const suspension = input.suspension;
  if (
    suspension.parentExecutionBasisRef !== parent.executionBasis.basisRef ||
    suspension.parentTraversalScope.scopeRef !==
      parent.openedTraversalScope.scopeRef ||
    suspension.parentGraph.materializationRef !==
      parent.graph.materializationRef ||
    suspension.parentCCall.cCallRef !== input.parentCCall.cCallRef ||
    suspension.sourceCursor.cursorRef !== input.sourceCursor.cursorRef ||
    suspension.childExecutionBasisRef !== input.childExecutionBasis.basisRef ||
    suspension.childTraversalScopeRef !== input.childTraversalScope.scopeRef ||
    suspension.terminalMode !== (parent.terminalMode ?? "close_run") ||
    input.childExecutionBasis.parentExecutionBasisRef !==
      parent.executionBasis.basisRef ||
    input.childExecutionBasis.parentTraversalScopeRef !==
      parent.openedTraversalScope.scopeRef ||
    input.childTraversalScope.executionBasisRef !==
      input.childExecutionBasis.basisRef ||
    sha256Canonical(suspension.parentGraphInput as unknown as JsonValue) !==
      suspension.parentGraphInputDigest ||
    sha256Canonical(parent.input as unknown as JsonValue) !==
      parent.inputDigest ||
    parent.inputDigest !== suspension.parentGraphInputDigest ||
    sha256Canonical(suspension.parentInput as unknown as JsonValue) !==
      suspension.parentInputDigest ||
    sha256Canonical(suspension.childInput as unknown as JsonValue) !==
      suspension.childInputDigest
  ) {
    return fail(
      parent,
      "workflow-resume-lineage",
      "diagnostic://abiogenesis/hog/workflow-resume-lineage-mismatch@5",
      suspension as unknown as JsonValue,
    );
  }
  const traversal = traversalAtCursor(parent, input.sourceCursor);
  if (traversal.kind !== "traversal_cursor") {
    return fail(
      parent,
      "workflow-resume-step",
      "diagnostic://abiogenesis/hog/workflow-resume-step-mismatch@5",
      traversal as unknown as JsonValue,
    );
  }
  const workflowTerm = resolveTraversalTerm(parent.graph, traversal);
  if (
    workflowTerm.kind !== "c_workflow" ||
    workflowTerm.graphFunctionRef !== input.childExecutionBasis.graphFunctionRef
  ) {
    return fail(
      parent,
      "workflow-resume-child",
      "diagnostic://abiogenesis/hog/workflow-resume-child-mismatch@5",
      workflowTerm as unknown as JsonValue,
    );
  }
  return {
    kind: "workflow_return",
    parent: {
      runtime: parent,
      graphEntryInput: suspension.parentGraphInput,
      graphEntryInputDigest: suspension.parentGraphInputDigest,
      cursor: input.sourceCursor,
      input: suspension.parentInput,
      ordinal: input.sourceCursor.taskOrdinal ?? 0,
      structuralOrdinal: 0,
    },
    workflow: {
      kind: "workflow_child_fold_frame",
      runtime: parent,
      cursor: input.sourceCursor,
      value: suspension.parentInput,
      graphEntryInput: suspension.parentGraphInput,
      graphEntryInputDigest: suspension.parentGraphInputDigest,
      ordinal: input.sourceCursor.taskOrdinal ?? 0,
      workflowTerm,
      parentCCall: input.parentCCall,
      application: fanOutApplicationForBatch(
        parent.graph,
        input.parentCCall.batchRef,
      ),
      childExecutionBasis: input.childExecutionBasis,
      childTraversalScope: input.childTraversalScope,
      childInput: suspension.childInput,
      childInputDigest: suspension.childInputDigest,
      foldbackCorrelationId:
        `${parent.correlationId}/workflow/resume-foldback`,
    },
  };
}

function rehydrateRecursionReturnFrame(
  input: ResumeHeldParentFrameInput & Readonly<{
    suspension: HeldRecursionSuspension;
  }>,
): RecursionReturnFoldFrame {
  const parent = input.parent;
  const suspension = input.suspension;
  const application = parent.graph.template.applications.find(
    (candidate): candidate is RecurseApplication =>
      candidate.relationKind === "recurse" &&
      candidate.applicationRef === suspension.application.applicationRef,
  );
  if (
    application === undefined ||
    sha256Canonical(application as unknown as JsonValue) !==
      sha256Canonical(suspension.application as unknown as JsonValue) ||
    suspension.parentExecutionBasisRef !== parent.executionBasis.basisRef ||
    suspension.parentTraversalScope.scopeRef !==
      parent.openedTraversalScope.scopeRef ||
    suspension.parentGraph.materializationRef !==
      parent.graph.materializationRef ||
    suspension.sourceCursor.cursorRef !== input.sourceCursor.cursorRef ||
    suspension.childExecutionBasisRef !== input.childExecutionBasis.basisRef ||
    suspension.childTraversalScopeRef !== input.childTraversalScope.scopeRef ||
    suspension.terminalMode !== (parent.terminalMode ?? "close_run") ||
    input.childExecutionBasis.parentExecutionBasisRef !==
      parent.executionBasis.basisRef ||
    input.childExecutionBasis.parentTraversalScopeRef !==
      parent.openedTraversalScope.scopeRef ||
    input.childTraversalScope.executionBasisRef !==
      input.childExecutionBasis.basisRef ||
    sha256Canonical(suspension.parentGraphInput as unknown as JsonValue) !==
      suspension.parentGraphInputDigest ||
    parent.inputDigest !== suspension.parentGraphInputDigest ||
    sha256Canonical(parent.input as unknown as JsonValue) !==
      parent.inputDigest ||
    sha256Canonical(suspension.evaluatorInput as unknown as JsonValue) !==
      suspension.evaluatorInputDigest ||
    sha256Canonical(suspension.childInput as unknown as JsonValue) !==
      suspension.childInputDigest
  ) {
    return fail(
      parent,
      "recursion-resume-lineage",
      "diagnostic://abiogenesis/hog/recursion-resume-lineage-mismatch@5",
      suspension as unknown as JsonValue,
    );
  }
  const traversalStop = traversalAtCursor(parent, input.sourceCursor);
  if (
    traversalStop.kind !== "traversal_stop_ref" ||
    traversalStop.stopClass !== "executable"
  ) {
    return fail(
      parent,
      "recursion-resume-stop",
      "diagnostic://abiogenesis/hog/recursion-resume-stop-mismatch@5",
      traversalStop as unknown as JsonValue,
    );
  }
  const resolution = selectAdmittedImplementationResolution(
    parent.implementationSet,
    {
      graphFunctionRef: parent.graph.graphFunctionRef,
      nodeRef: traversalStop.nodeRef,
      programLocusRef: traversalStop.programLocusRef,
      implementationBindingRef: traversalStop.implementationBindingRef,
    },
  );
  const outputValueKind = parent.leafPort.contractValueKind(
    traversalStop.outputContractRef,
    "output",
  );
  if (resolution === null || outputValueKind === null) {
    return fail(
      parent,
      "recursion-resume-resolution",
      "diagnostic://abiogenesis/hog/recursion-resume-resolution-absent@5",
      traversalStop as unknown as JsonValue,
    );
  }
  const traversalInput: CompleteExecutableTraversalInput<
    Readonly<Record<string, JsonValue>>
  > = {
    store: parent.store,
    executionBasis: parent.executionBasis,
    openedTraversalScope: parent.openedTraversalScope,
    program: parent.program,
    graphFunction: parent.graphFunction,
    graph: parent.graph,
    traversalStop,
    implementationSet: parent.implementationSet,
    implementationResolution: resolution,
    leafPort: parent.leafPort,
    input: suspension.evaluatorInput,
    inputDigest: suspension.evaluatorInputDigest,
    closureContract: parent.closureContract,
    actorRuntimeBinding: parent.actorRuntimeBinding,
    ...(parent.deferFailedRunStop === true ? { deferFailedRunStop: true } : {}),
    terminalMode: "return_to_application",
    applicationCompletionMode: suspension.terminalMode,
    clock: {
      eventTime: parent.eventTime,
      correlationId: `${parent.correlationId}/recursion/restore`,
    },
  };
  const restoration: RestoreDeferredRecursionInput = {
    traversalInput,
    application,
    cCallRef: suspension.evaluatorCCall.cCallRef,
    resultRef: suspension.evaluatorResult.resultRef,
    judgmentRef: suspension.evaluatorJudgment.judgmentRef,
  };
  const deferred = restoreDeferredRecursion(restoration);
  if (
    deferred === null ||
    deferred.cCallRef !== suspension.evaluatorCCall.cCallRef ||
    deferred.resultRef !== suspension.evaluatorResult.resultRef ||
    deferred.judgmentRef !== suspension.evaluatorJudgment.judgmentRef ||
    sha256Canonical(deferred.resultValue as JsonValue) !==
      suspension.evaluatorResult.valueDigest
  ) {
    return fail(
      parent,
      "recursion-resume-deferred",
      "diagnostic://abiogenesis/hog/recursion-resume-deferred-mismatch@5",
      suspension as unknown as JsonValue,
    );
  }
  return {
    kind: "recursion_return",
    parent: {
      runtime: parent,
      graphEntryInput: suspension.parentGraphInput,
      graphEntryInputDigest: suspension.parentGraphInputDigest,
      cursor: input.sourceCursor,
      input: suspension.evaluatorInput,
      ordinal: input.sourceCursor.taskOrdinal ?? 0,
      structuralOrdinal: 0,
    },
    recursion: {
      kind: "recursion_child_fold_frame",
      parent,
      traversalInput,
      application,
      restored: deferred,
      restoration,
      graphEntryInput: suspension.parentGraphInput,
      graphEntryInputDigest: suspension.parentGraphInputDigest,
      leafOrdinal: input.sourceCursor.taskOrdinal ?? 0,
      childExecutionBasis: input.childExecutionBasis,
      childTraversalScope: input.childTraversalScope,
      childInput: suspension.childInput,
      childInputDigest: suspension.childInputDigest,
    },
    outputValueKind,
    outputContractRef: traversalStop.outputContractRef,
  };
}

function rehydrateParentReturnFrames(
  inputs: readonly ResumeHeldParentFrameInput[],
): readonly TraversalReturnFoldFrame[] {
  return Object.freeze(inputs.map((input) => {
    if (input.suspension.kind === "held_workflow_suspension") {
      if (input.parentCCall === null) {
        return fail(
          input.parent,
          "workflow-resume-parent-call",
          "diagnostic://abiogenesis/hog/workflow-resume-parent-call-absent@5",
          input.suspension as unknown as JsonValue,
        );
      }
      return rehydrateWorkflowReturnFrame({
        ...input,
        suspension: input.suspension,
        parentCCall: input.parentCCall,
      });
    }
    return rehydrateRecursionReturnFrame({
      ...input,
      suspension: input.suspension,
    });
  }).reverse());
}

function traversalProgram(
  input: ExecuteGraphTraversalRequest,
): Effect.Effect<ExecutableTraversalCompletion> {
  if ("interaction" in input) {
    return traversalFoldProgram(
      seedParentContinuation(
        input.parent,
        input.parent.input,
        input.parent.inputDigest,
        resumeInteractionOwner(input.interaction),
        rehydrateParentReturnFrames(input.parents),
        "interaction-resume",
      ),
      input.parent,
    );
  }
  return graphTraversalEffect(input);
}

export function executeGraphTraversal(
  input: ExecuteGraphTraversalRequest,
): Promise<ExecutableTraversalCompletion> {
  return runGraphTraversalProgram(traversalProgram(input));
}
