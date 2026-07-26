import {
  admitApplicationChildPreparationRefusal,
  admitApplicationChildFoldback,
  admitChildClosure,
  admitChildFoldback,
  admitChildPreparationRefusal,
  admitClosure,
  admitEvidence,
  admitFanOutCompletion,
  admitFhInteractionOpen,
  admitInteractionClosure,
  admitJudgment,
  admitPendingInteraction,
  admitResult,
  admitRetryAttempt,
  admitRetryProgress,
  admitRecursionRoute,
  admitRuntimeFailure,
  admitRuntimeEventTransaction,
  admitRoute,
  completeRejectedCCall,
  deriveProbabilisticTransportEvidence,
  deriveSubTraversalEvidence,
  openCCall,
  openInteractionCCall,
  isAdmittedCCallJudgment,
  isAdmittedCCallResult,
  isCCall,
  projectRetryEligibility,
  replay,
  traversalCursorAdmissionEventRef,
  type AbgEventStore,
  type ActorRuntimeBinding,
  type ActorProcessObservation,
  type AdmittedCCallEvidence,
  type AdmittedCCallJudgment,
  type AdmittedCCallResult,
  type AdmittedImplementationResolutionRow,
  type AdmittedImplementationSet,
  type AdmittedInteractionContractRow,
  type AdmittedInteractionSet,
  type CCallEvidenceCandidate,
  type CCallAdmissionRejection,
  type CCall,
  type ExecutionBasis,
  type GraphSpanReentryProjection,
  type ContinuationProductBasis,
  type FhInteractionResumeAdmission,
  type FanOutCompletionAdmission,
  type OpenedTraversalScope,
  type ReplayState,
  type RetryInputBasis,
  type RuntimeAdmissionBasis,
  invokeActorProcess,
} from "../abg/index.js";
import type {
  LeafInvocationPort,
  ProbabilisticLeafEffectPort,
} from "../implementation/contracts.js";
import { isAdmittedLeafInvocationPort } from "./leaf_invocation_port.js";
import type {
  ClosureContract,
  FanOutApplication,
  GtlGraph,
  GtlProgram,
  RecurseApplication,
} from "../gtl/contracts.js";
import {
  recursionTerminationDecision,
} from "../gtl/graph_applications.js";
import type {
  DeterministicEvidenceCandidate,
  ProbabilisticTransportEvidenceCandidate,
} from "../abg/c_call.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { JsonValue } from "../shared/canonical_json.js";
import {
  proposeFailureJudgment,
  proposeJudgment,
  type DeclaredJudgmentRelation,
} from "./judgment.js";
import {
  proposeBlockedRoute,
  proposeFanOutRoute,
  proposeGapStopRoute,
  proposeGraphSpanReentryRoute,
  proposeHoldRoute,
  proposeInteractionResumeRoute,
  proposeJudgedRoute,
  proposeRecursionRoute,
  proposeRetryRoute,
  proposeWorkflowBlockedRoute,
} from "./traversal_route.js";
import {
  applyRoute,
  applyRecursionRoute,
  deriveCompletedTraversalStep,
  deriveGraphSpanReentryStep,
  deriveRecursionReentryCursor,
  deriveRetryTraversalStep,
  type ExecutableTraversalStopRef,
  type InteractionTraversalStopRef,
  type TraversalCursor,
  type TraversalStep,
} from "./traversal.js";

export interface DeterministicLeafSuccessCandidate<Output> {
  readonly kind: "leaf_realization_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "success";
  readonly evidenceCandidates: readonly DeterministicEvidenceCandidate[];
  readonly resultCandidate: Output;
}

export interface DeterministicLeafFailureCandidate {
  readonly kind: "leaf_realization_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "failure";
  readonly evidenceCandidates: readonly DeterministicEvidenceCandidate[];
  readonly resultCandidate: Readonly<Record<string, JsonValue>>;
  readonly diagnosticRef: string;
}

export type DeterministicLeafCandidate<Output> =
  | DeterministicLeafFailureCandidate
  | DeterministicLeafSuccessCandidate<Output>;

export interface ExecutableLeafSuccessCandidate<Output> {
  readonly kind: "leaf_realization_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "success";
  readonly evidenceCandidates: readonly CCallEvidenceCandidate[];
  readonly resultCandidate: Output;
}

export interface ExecutableLeafFailureCandidate {
  readonly kind: "leaf_realization_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "failure";
  readonly evidenceCandidates: readonly CCallEvidenceCandidate[];
  readonly resultCandidate: Readonly<Record<string, JsonValue>>;
  readonly diagnosticRef: string;
}

export type ExecutableLeafCandidate<Output> =
  | ExecutableLeafFailureCandidate
  | ExecutableLeafSuccessCandidate<Output>;

export interface ExecutableTraversalClock {
  readonly eventTime: string;
  readonly correlationId: string;
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

export interface RetainedRetryInput extends RetryInputBasis {
  readonly value: Readonly<Record<string, JsonValue>>;
}

export interface CompleteInteractionTraversalInput {
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graph: Readonly<GtlGraph>;
  readonly traversalStop: InteractionTraversalStopRef;
  readonly interactionSet: AdmittedInteractionSet;
  readonly interaction: AdmittedInteractionContractRow;
  readonly productBasis: ContinuationProductBasis;
  readonly input: Readonly<Record<string, JsonValue>>;
  readonly inputDigest: `sha256:${string}`;
  readonly closureContract: Readonly<ClosureContract>;
  readonly clock: ExecutableTraversalClock;
}

export interface CompleteInteractionResumeInput {
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly graph: Readonly<GtlGraph>;
  readonly heldInteraction: HeldInteractionTraversal;
  readonly successorCursor: TraversalCursor;
  readonly resume: FhInteractionResumeAdmission;
  readonly closureContract: Readonly<ClosureContract>;
  readonly clock: ExecutableTraversalClock;
}

export interface CompleteExecutableTraversalInput<
  Input,
  Output,
> {
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graph: Readonly<GtlGraph>;
  readonly traversalStop: ExecutableTraversalStopRef;
  readonly implementationSet: AdmittedImplementationSet;
  readonly implementationResolution: AdmittedImplementationResolutionRow;
  readonly leafPort: LeafInvocationPort;
  readonly input: Readonly<Input>;
  readonly inputDigest: `sha256:${string}`;
  readonly retryInput?: RetainedRetryInput;
  readonly closureContract: Readonly<ClosureContract>;
  readonly actorRuntimeBinding?: ActorRuntimeBinding;
  readonly terminalMode?:
    | "close_run"
    | "return_to_application"
    | "return_to_parent";
  readonly applicationCompletionMode?: "close_run" | "return_to_parent";
  readonly clock: ExecutableTraversalClock;
}

export interface CompleteDeferredRecursionInput {
  readonly completion: ExecutableTraversalCompletion;
  readonly application: Readonly<RecurseApplication>;
  readonly clock: ExecutableTraversalClock;
}

export interface AdvanceDeferredRecursionInput
  extends CompleteDeferredRecursionInput {
  readonly childExecutionBasis: ExecutionBasis;
  readonly childTraversalScope: OpenedTraversalScope;
  readonly childCompletion: ExecutableTraversalCompletion;
}

export interface BlockDeferredRecursionPreparationInput
  extends CompleteDeferredRecursionInput {
  readonly preparationRefusal: {
    readonly stage:
      | "basis_admission"
      | "graph_materialization"
      | "graph_validation"
      | "membership"
      | "scope_open";
    readonly diagnosticRef: string;
    readonly message: string;
  };
}

interface WorkflowParentTraversalInput {
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly graph: Readonly<GtlGraph>;
  readonly workflowStep: TraversalStep;
  readonly parentCCall: CCall;
  readonly clock: ExecutableTraversalClock;
}

export interface CompleteWorkflowPreparationRefusalInput
  extends WorkflowParentTraversalInput {
  readonly preparationRefusal: {
    readonly kind: "child_traversal_preparation_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly stage:
      | "basis_admission"
      | "graph_materialization"
      | "graph_validation"
      | "membership"
      | "scope_open";
    readonly diagnosticRef: string;
    readonly message: string;
  };
}

export interface CompleteWorkflowTraversalInput
  extends WorkflowParentTraversalInput {
  readonly program: Readonly<GtlProgram>;
  readonly childExecutionBasis: ExecutionBasis;
  readonly childTraversalScope: OpenedTraversalScope;
  readonly childCompletion: ExecutableTraversalCompletion;
  readonly input: Readonly<Record<string, JsonValue>>;
  readonly inputDigest: `sha256:${string}`;
  readonly resultValueKind: string;
  readonly failureValueKind: string;
  readonly validateSuccessResult: (
    value: unknown,
  ) => value is Readonly<Record<string, JsonValue>>;
  readonly successResultValue?: Readonly<Record<string, JsonValue>>;
  readonly closureContract: Readonly<ClosureContract>;
  readonly terminalMode?: "close_run" | "return_to_parent";
  readonly judgmentRelation: DeclaredJudgmentRelation<
    Readonly<Record<string, JsonValue>>,
    Readonly<Record<string, JsonValue>>
  >;
  readonly fanOutApplication?: Readonly<FanOutApplication>;
  readonly validateFanOutVector?: (
    value: unknown,
  ) => value is Readonly<Record<string, JsonValue>>;
}

export type DeterministicTraversalClock = ExecutableTraversalClock;
export type DeterministicTraversalCompletion = ExecutableTraversalCompletion;
export type CompleteDeterministicTraversalInput<Input, Output> =
  CompleteExecutableTraversalInput<Input, Output>;

interface DeferredApplicationState {
  readonly input: CompleteExecutableTraversalInput<unknown, unknown>;
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
  readonly judgment: AdmittedCCallJudgment;
  readonly continuationStep: TraversalStep;
}

export interface RestoreDeferredRecursionInput {
  readonly traversalInput: CompleteExecutableTraversalInput<
    Readonly<Record<string, JsonValue>>,
    Readonly<Record<string, JsonValue>>
  >;
  readonly application: Readonly<RecurseApplication>;
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
  readonly judgment: AdmittedCCallJudgment;
}

const deferredApplicationStates = new WeakMap<
  object,
  DeferredApplicationState
>();

function basis(
  clock: ExecutableTraversalClock,
  stage: string,
): RuntimeAdmissionBasis {
  return {
    eventTime: clock.eventTime,
    correlationId: `${clock.correlationId}/${stage}`,
    causationEventRefs: [],
  };
}

function cursorBasis(
  input: {
    readonly store: AbgEventStore;
    readonly traversalStop: { readonly cursor: TraversalCursor };
    readonly clock: ExecutableTraversalClock;
  },
  stage: string,
): RuntimeAdmissionBasis {
  const eventRef = traversalCursorAdmissionEventRef(
    input.store,
    input.traversalStop.cursor,
  );
  return {
    ...basis(input.clock, stage),
    causationEventRefs: eventRef === null ? [] : [eventRef],
  };
}

function completion(
  disposition: ExecutableTraversalCompletion["disposition"],
  replayState: ReplayState,
  values: {
    readonly cCallRef?: string;
    readonly resultRef?: string;
    readonly judgmentRef?: string;
    readonly closureRef?: string;
    readonly nextCursor?: TraversalCursor;
    readonly resultValue?: JsonValue;
    readonly continuationKind?: "advance" | "re_enter" | "retry";
    readonly nextInputContractRef?: string;
    readonly diagnosticRef?: string;
    readonly continuationRef?: string;
    readonly heldCursor?: TraversalCursor;
    readonly heldInteraction?: HeldInteractionTraversal;
    readonly heldGraph?: Readonly<GtlGraph>;
    readonly heldClosureContract?: Readonly<ClosureContract>;
    readonly parentSuspensions?: readonly HeldParentTraversalSuspension[];
  } = {},
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

export function suspendHeldWorkflowTraversal(input: Readonly<{
  parentExecutionBasis: ExecutionBasis;
  parentTraversalScope: OpenedTraversalScope;
  parentGraph: Readonly<GtlGraph>;
  parentClosureContract: Readonly<ClosureContract>;
  parentCCall: CCall;
  sourceCursor: TraversalCursor;
  parentGraphInput: Readonly<Record<string, JsonValue>>;
  parentGraphInputDigest: `sha256:${string}`;
  parentInput: Readonly<Record<string, JsonValue>>;
  parentInputDigest: `sha256:${string}`;
  childExecutionBasis: ExecutionBasis;
  childTraversalScope: OpenedTraversalScope;
  childInput: Readonly<Record<string, JsonValue>>;
  childInputDigest: `sha256:${string}`;
  childCompletion: ExecutableTraversalCompletion;
  terminalMode: "close_run" | "return_to_parent";
}>): ExecutableTraversalCompletion {
  if (
    input.childCompletion.disposition !== "held" ||
    input.childCompletion.continuationRef === null ||
    input.childCompletion.heldInteraction === null ||
    input.childCompletion.heldGraph === null ||
    input.childCompletion.heldClosureContract === null ||
    input.parentTraversalScope.executionBasisRef !==
      input.parentExecutionBasis.basisRef ||
    input.childExecutionBasis.parentExecutionBasisRef !==
      input.parentExecutionBasis.basisRef ||
    input.childExecutionBasis.parentTraversalScopeRef !==
      input.parentTraversalScope.scopeRef ||
    input.childTraversalScope.executionBasisRef !==
      input.childExecutionBasis.basisRef ||
    sha256Canonical(input.childInput as unknown as JsonValue) !==
      input.childInputDigest ||
    input.parentCCall.callClass !== "workflow" ||
    input.parentCCall.basisId !== input.parentExecutionBasis.basisRef ||
    input.sourceCursor.executionBasisRef !==
      input.parentExecutionBasis.basisRef ||
    input.sourceCursor.traversalScopeRef !== input.parentTraversalScope.scopeRef ||
    sha256Canonical(input.parentGraphInput as unknown as JsonValue) !==
      input.parentGraphInputDigest ||
    input.parentGraph.admittedInputDigest !==
      input.parentGraphInputDigest ||
    sha256Canonical(input.parentInput as unknown as JsonValue) !==
      input.parentInputDigest
  ) {
    throw new TypeError(
      "held workflow suspension requires one exact admitted parent and child lineage",
    );
  }
  const suspension = deepFreeze({
    kind: "held_workflow_suspension" as const,
    schemaVersion: "5.0.0" as const,
    parentExecutionBasisRef: input.parentExecutionBasis.basisRef,
    parentTraversalScope: input.parentTraversalScope,
    parentGraph: input.parentGraph,
    parentClosureContract: input.parentClosureContract,
    parentCCall: input.parentCCall,
    sourceCursor: input.sourceCursor,
    parentGraphInput: input.parentGraphInput,
    parentGraphInputDigest: input.parentGraphInputDigest,
    parentInput: input.parentInput,
    parentInputDigest: input.parentInputDigest,
    childExecutionBasisRef: input.childExecutionBasis.basisRef,
    childTraversalScopeRef: input.childTraversalScope.scopeRef,
    childInput: input.childInput,
    childInputDigest: input.childInputDigest,
    terminalMode: input.terminalMode,
  });
  return deepFreeze({
    ...input.childCompletion,
    parentSuspensions: [
      ...input.childCompletion.parentSuspensions,
      suspension,
    ],
  });
}

export function suspendHeldRecursionTraversal(input: Readonly<{
  parentGraphInput: Readonly<Record<string, JsonValue>>;
  parentGraphInputDigest: `sha256:${string}`;
  application: Readonly<RecurseApplication>;
  deferredCompletion: ExecutableTraversalCompletion;
  childExecutionBasis: ExecutionBasis;
  childTraversalScope: OpenedTraversalScope;
  childInput: Readonly<Record<string, JsonValue>>;
  childInputDigest: `sha256:${string}`;
  childCompletion: ExecutableTraversalCompletion;
  terminalMode: "close_run" | "return_to_parent";
}>): ExecutableTraversalCompletion {
  const state = requireDeferredApplicationState(input.deferredCompletion);
  if (
    input.childCompletion.disposition !== "held" ||
    input.childCompletion.continuationRef === null ||
    input.childCompletion.heldInteraction === null ||
    input.childCompletion.heldGraph === null ||
    input.childCompletion.heldClosureContract === null ||
    !exactDeferredApplication(state, input.application) ||
    recursionTerminationDecision(input.application, state.result.value) !==
      false ||
    input.childExecutionBasis.parentExecutionBasisRef !==
      state.input.executionBasis.basisRef ||
    input.childExecutionBasis.parentTraversalScopeRef !==
      state.input.openedTraversalScope.scopeRef ||
    input.childTraversalScope.executionBasisRef !==
      input.childExecutionBasis.basisRef ||
    state.input.applicationCompletionMode !== input.terminalMode ||
    sha256Canonical(input.parentGraphInput as unknown as JsonValue) !==
      input.parentGraphInputDigest ||
    state.input.graph.admittedInputDigest !==
      input.parentGraphInputDigest ||
    sha256Canonical(input.childInput as unknown as JsonValue) !==
      input.childInputDigest ||
    !isRecord(state.input.input) ||
    sha256Canonical(state.input.input as unknown as JsonValue) !==
      state.input.inputDigest
  ) {
    throw new TypeError(
      "held recursion suspension requires one exact deferred application lineage",
    );
  }
  const suspension = deepFreeze({
    kind: "held_recursion_suspension" as const,
    schemaVersion: "5.0.0" as const,
    parentExecutionBasisRef: state.input.executionBasis.basisRef,
    parentTraversalScope: state.input.openedTraversalScope,
    parentGraph: state.input.graph,
    parentClosureContract: state.input.closureContract,
    parentGraphInput: input.parentGraphInput,
    parentGraphInputDigest: input.parentGraphInputDigest,
    application: input.application,
    evaluatorCCall: state.cCall,
    evaluatorResult: state.result,
    evaluatorJudgment: state.judgment,
    sourceCursor: state.input.traversalStop.cursor,
    evaluatorInput: state.input.input,
    evaluatorInputDigest: state.input.inputDigest,
    childExecutionBasisRef: input.childExecutionBasis.basisRef,
    childTraversalScopeRef: input.childTraversalScope.scopeRef,
    childInput: input.childInput,
    childInputDigest: input.childInputDigest,
    terminalMode: input.terminalMode,
  }) as HeldRecursionSuspension;
  deferredApplicationStates.delete(input.deferredCompletion);
  return deepFreeze({
    ...input.childCompletion,
    parentSuspensions: [
      ...input.childCompletion.parentSuspensions,
      suspension,
    ],
  });
}

export function completeInteractionTraversal(
  input: CompleteInteractionTraversalInput,
): ExecutableTraversalCompletion {
  if (
    sha256Canonical(input.input as unknown as JsonValue) !== input.inputDigest ||
    input.inputDigest !== input.traversalStop.cursor.inputDigest
  ) {
    throw new TypeError(
      "F_H interaction input differs from the admitted traversal cursor",
    );
  }
  const opened = openInteractionCCall(
    input.store,
    input.executionBasis,
    input.openedTraversalScope,
    input.program,
    input.graph,
    input.traversalStop,
    input.interactionSet,
    input.interaction,
    basis(input.clock, "fh-c-call-open"),
  );
  if (opened.kind !== "c_call_admission") {
    throw new TypeError(
      `F_H CCall admission refused: ${opened.code}: ${opened.message}`,
    );
  }
  const { continuation, pending } = admitRuntimeEventTransaction(
    input.store,
    () => {
      const pending = admitPendingInteraction(
        input.store,
        opened.cCall,
        input.input,
        input.inputDigest,
        basis(input.clock, "fh-pending"),
      );
      const pendingReplay = replay(input.store, {
        runId: input.openedTraversalScope.runId,
      });
      const routeCandidate = proposeHoldRoute(
        input.graph,
        input.traversalStop,
        opened.cCall,
        pending.judgment,
        pendingReplay,
        input.traversalStop.continuationContractRef,
      );
      if (routeCandidate.kind !== "traversal_route_candidate") {
        throw new TypeError(
          `F_H hold route refused: ${routeCandidate.code}: ${routeCandidate.message}`,
        );
      }
      const route = admitRoute(
        input.store,
        input.executionBasis,
        input.graph,
        input.traversalStop.cursor,
        null,
        pendingReplay,
        routeCandidate,
        basis(input.clock, "fh-hold-route"),
        {
          cCall: opened.cCall,
          result: pending.result,
          judgment: pending.judgment,
        },
      );
      if (route.kind !== "admitted_traversal_route") {
        throw new TypeError(
          `F_H hold route admission refused: ${route.code}: ${route.message}`,
        );
      }
      const continuation = admitFhInteractionOpen(
        input.store,
        input.executionBasis,
        input.openedTraversalScope,
        input.program,
        input.graph,
        input.interactionSet,
        input.traversalStop.cursor,
        pending,
        route,
        input.productBasis,
        input.input,
        basis(input.clock, "fh-continuation-open"),
      );
      return { continuation, pending };
    },
  );
  return completion(
    "held",
    replay(input.store, { runId: input.openedTraversalScope.runId }),
    {
      cCallRef: opened.cCall.cCallRef,
      resultRef: pending.result.resultRef,
      judgmentRef: pending.judgment.judgmentRef,
      resultValue: pending.result.value,
      continuationRef: continuation.continuationRef,
      heldCursor: input.traversalStop.cursor,
      heldGraph: input.graph,
      heldClosureContract: input.closureContract,
      heldInteraction: deepFreeze({
        cCall: opened.cCall,
        result: pending.result,
        judgment: pending.judgment,
        cursor: input.traversalStop.cursor,
      }),
    },
  );
}

export function completeInteractionResume(
  input: CompleteInteractionResumeInput,
): ExecutableTraversalCompletion {
  const { cCall, result, judgment } = input.heldInteraction;
  const beforeRoute = replay(input.store, { runId: cCall.runId });
  const continuationStep = deriveCompletedTraversalStep(
    input.graph,
    input.successorCursor,
    {
      inputRef: input.resume.successorInputRef,
      inputDigest: input.resume.successorInputDigest,
    },
  );
  if (continuationStep.kind !== "traversal_step") {
    throw new TypeError(
      `F_H resume continuation refused: ${continuationStep.code}: ${continuationStep.message}`,
    );
  }
  const routeCandidate = proposeInteractionResumeRoute(
    input.graph,
    continuationStep,
    cCall,
    judgment,
    input.resume,
    beforeRoute,
    cCall.transitionContractRef,
  );
  if (routeCandidate.kind !== "traversal_route_candidate") {
    throw new TypeError(
      `F_H resume route refused: ${routeCandidate.code}: ${routeCandidate.message}`,
    );
  }
  const route = admitRoute(
    input.store,
    input.executionBasis,
    input.graph,
    input.successorCursor,
    continuationStep.targetCursor,
    beforeRoute,
    routeCandidate,
    basis(input.clock, "fh-resume-route"),
    {
      cCall,
      result,
      judgment,
      resume: input.resume,
    },
  );
  if (route.kind !== "admitted_traversal_route") {
    throw new TypeError(
      `F_H resume route admission refused: ${route.code}: ${route.message}`,
    );
  }
  if (route.routeKind === "advance") {
    const nextCursor = applyRoute(continuationStep, route);
    if (nextCursor.kind === "traversal_refusal") {
      throw new TypeError(
        `F_H resume route application refused: ${nextCursor.code}: ${nextCursor.message}`,
      );
    }
    return completion(
      "advanced",
      replay(input.store, { runId: cCall.runId }),
      {
        cCallRef: cCall.cCallRef,
        resultRef: input.resume.successorInputRef,
        judgmentRef: judgment.judgmentRef,
        nextCursor,
        resultValue: input.resume.successorInputValue,
        continuationKind: "advance",
        nextInputContractRef: cCall.outputContractRef,
      },
    );
  }
  if (route.routeKind !== "terminal") {
    throw new TypeError(
      `F_H resume admitted unexpected route ${route.routeKind}`,
    );
  }
  const afterRoute = replay(input.store, { runId: cCall.runId });
  const closure = admitInteractionClosure(
    input.store,
    cCall,
    result,
    judgment,
    input.resume,
    route,
    afterRoute,
    input.closureContract,
    basis(input.clock, "fh-closure"),
  );
  if (closure.kind !== "closure_admission") {
    throw new TypeError(
      `F_H closure refused: ${closure.code}: ${closure.message}`,
    );
  }
  return completion(
    "closed",
    replay(input.store, { runId: cCall.runId }),
    {
      cCallRef: cCall.cCallRef,
      resultRef: input.resume.responseRef,
      judgmentRef: judgment.judgmentRef,
      closureRef: closure.closureRef,
      resultValue: input.resume.responseValue,
    },
  );
}

function replayRun(input: Pick<CompleteExecutableTraversalInput<unknown, unknown>, "store" | "openedTraversalScope">): ReplayState {
  return replay(input.store, { runId: input.openedTraversalScope.runId });
}

function completeBlockedTraversal<Input, Output>(
  input: CompleteExecutableTraversalInput<Input, Output>,
  cCall: CCall,
  values: {
    readonly judgmentRef: string;
    readonly judgmentEventRef: string;
    readonly reasonRef: string;
    readonly resultRef: string;
  },
): ExecutableTraversalCompletion {
  const resultEvent = input.store.readAll().find(
    (event) =>
      event.kind === "c_call_result_admitted" &&
      isRecord(event.payload) &&
      event.payload.resultRef === values.resultRef,
  );
  const resultValue =
    resultEvent !== undefined &&
      isRecord(resultEvent.payload) &&
      Object.hasOwn(resultEvent.payload, "value")
      ? resultEvent.payload.value as JsonValue
      : null;
  const currentReplay = replayRun(input);
  const proposal = proposeBlockedRoute(
    input.graph,
    input.traversalStop,
    cCall,
    values.judgmentRef,
    currentReplay,
    cCall.transitionContractRef,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    const diagnosticRef = `diagnostic://abiogenesis/hog/${proposal.code}@5`;
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "route",
      proposal as unknown as JsonValue,
      diagnosticRef,
      {
        ...basis(input.clock, "blocked-route-proposal-refusal"),
        causationEventRefs: [values.judgmentEventRef],
      },
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: values.resultRef,
      judgmentRef: values.judgmentRef,
      diagnosticRef,
    });
  }
  const route = admitRoute(
    input.store,
    input.executionBasis,
    input.graph,
    input.traversalStop.cursor,
    null,
    currentReplay,
    proposal,
    basis(input.clock, "blocked-route"),
    {
      cCall,
      judgmentRef: values.judgmentRef,
      judgmentEventRef: values.judgmentEventRef,
      reasonRef: values.reasonRef,
    },
    { terminalizeRun: input.terminalMode !== "return_to_parent" },
  );
  if (
    route.kind !== "admitted_traversal_route" ||
    (input.terminalMode !== "return_to_parent" && route.runStoppedEventRef === null)
  ) {
    const diagnosticRef = route.kind === "admitted_traversal_route"
      ? "diagnostic://abiogenesis/hog/run-stop-absent@5"
      : `diagnostic://abiogenesis/hog/${route.code}@5`;
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "route",
      route as unknown as JsonValue,
      diagnosticRef,
      {
        ...basis(input.clock, "blocked-route-admission-refusal"),
        causationEventRefs: [values.judgmentEventRef],
      },
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: values.resultRef,
      judgmentRef: values.judgmentRef,
      diagnosticRef,
    });
  }
  return completion("blocked", replayRun(input), {
    cCallRef: cCall.cCallRef,
    resultRef: values.resultRef,
    judgmentRef: values.judgmentRef,
    resultValue,
    diagnosticRef: values.reasonRef,
  });
}

function completeRetryTraversal<Input, Output>(
  input: CompleteExecutableTraversalInput<Input, Output>,
  cCall: CCall,
  rejection: CCallAdmissionRejection,
  failureClass: "contract_failure" | "no_output" | "transport_failure",
): ExecutableTraversalCompletion | null {
  const eligibility = projectRetryEligibility(
    input.store,
    input.graph,
    input.traversalStop.cursor,
    failureClass,
    rejection.diagnosticRef,
  );
  if (eligibility.disposition !== "retry") return null;
  const retryInput = input.retryInput;
  if (
    retryInput === undefined ||
    retryInput.inputContractRef.length === 0 ||
    sha256Canonical(retryInput.value as unknown as JsonValue) !==
      retryInput.inputDigest
  ) {
    const diagnosticRef =
      "diagnostic://abiogenesis/hog/retry-input-basis-absent@5";
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "route",
      eligibility as unknown as JsonValue,
      diagnosticRef,
      cursorBasis(input, "retry-input-refusal"),
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      diagnosticRef,
    });
  }
  const rejected = completeRejectedCCall(
    input.store,
    cCall,
    rejection,
    basis(input.clock, "retry-judgment"),
    "retry",
  );
  const progress = admitRetryProgress(
    input.store,
    input.graph,
    input.traversalStop.cursor,
    cCall,
    rejected,
    failureClass,
    rejection.diagnosticRef,
    basis(input.clock, "retry-progress"),
  );
  if (progress.kind !== "retry_progress_admission") {
    const diagnosticRef =
      `diagnostic://abiogenesis/hog/${progress.code}@5`;
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "route",
      progress as unknown as JsonValue,
      diagnosticRef,
      {
        ...basis(input.clock, "retry-progress-refusal"),
        causationEventRefs: [rejected.judgmentEventRef],
      },
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: rejected.refusalResultRef,
      judgmentRef: rejected.rejectionJudgmentRef,
      diagnosticRef,
    });
  }
  const retryStep = deriveRetryTraversalStep(
    input.graph,
    input.traversalStop.cursor,
    retryInput,
  );
  if (retryStep.kind !== "traversal_step" || retryStep.targetCursor === null) {
    const diagnosticRef = retryStep.kind === "traversal_refusal"
      ? `diagnostic://abiogenesis/hog/${retryStep.code}@5`
      : "diagnostic://abiogenesis/hog/retry-target-absent@5";
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "route",
      retryStep as unknown as JsonValue,
      diagnosticRef,
      {
        ...basis(input.clock, "retry-step-refusal"),
        causationEventRefs: [progress.admissionEventRef],
      },
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: rejected.refusalResultRef,
      judgmentRef: rejected.rejectionJudgmentRef,
      diagnosticRef,
    });
  }
  const progressReplay = replayRun(input);
  const proposal = proposeRetryRoute(
    input.graph,
    retryStep,
    cCall,
    progress,
    progressReplay,
    cCall.transitionContractRef,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    const diagnosticRef =
      `diagnostic://abiogenesis/hog/${proposal.code}@5`;
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "route",
      proposal as unknown as JsonValue,
      diagnosticRef,
      {
        ...basis(input.clock, "retry-route-proposal-refusal"),
        causationEventRefs: [progress.admissionEventRef],
      },
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: rejected.refusalResultRef,
      judgmentRef: rejected.rejectionJudgmentRef,
      diagnosticRef,
    });
  }
  const route = admitRoute(
    input.store,
    input.executionBasis,
    input.graph,
    input.traversalStop.cursor,
    retryStep.targetCursor,
    progressReplay,
    proposal,
    basis(input.clock, "retry-route"),
    { cCall, progress },
  );
  if (route.kind !== "admitted_traversal_route") {
    const diagnosticRef =
      `diagnostic://abiogenesis/hog/${route.code}@5`;
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "route",
      route as unknown as JsonValue,
      diagnosticRef,
      {
        ...basis(input.clock, "retry-route-admission-refusal"),
        causationEventRefs: [progress.admissionEventRef],
      },
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: rejected.refusalResultRef,
      judgmentRef: rejected.rejectionJudgmentRef,
      diagnosticRef,
    });
  }
  const nextCursor = applyRoute(retryStep, route);
  if (nextCursor.kind === "traversal_refusal") {
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: rejected.refusalResultRef,
      judgmentRef: rejected.rejectionJudgmentRef,
      diagnosticRef: `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
    });
  }
  const attempt = admitRetryAttempt(
    input.store,
    input.executionBasis,
    input.graph,
    nextCursor,
    route.admissionEventRef,
    basis(input.clock, "retry-attempt"),
  );
  if (attempt.kind !== "retry_attempt_admission") {
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: rejected.refusalResultRef,
      judgmentRef: rejected.rejectionJudgmentRef,
      diagnosticRef: `diagnostic://abiogenesis/hog/${attempt.code}@5`,
    });
  }
  return completion("advanced", replayRun(input), {
    cCallRef: cCall.cCallRef,
    resultRef: rejected.refusalResultRef,
    judgmentRef: rejected.rejectionJudgmentRef,
    nextCursor,
    resultValue: retryInput.value as unknown as JsonValue,
    continuationKind: "retry",
    nextInputContractRef: retryInput.inputContractRef,
  });
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEvidenceCandidate(
  value: unknown,
  regime: "F_D" | "F_P",
): value is DeterministicEvidenceCandidate | ProbabilisticTransportEvidenceCandidate {
  if (!isRecord(value) ||
    value.schemaVersion !== "5.0.0" ||
    typeof value.implementationRef !== "string" || value.implementationRef.length === 0 ||
    typeof value.inputDigest !== "string" || !/^sha256:[a-f0-9]{64}$/u.test(value.inputDigest) ||
    typeof value.outputDigest !== "string" || !/^sha256:[a-f0-9]{64}$/u.test(value.outputDigest)) {
    return false;
  }
  return regime === "F_D"
    ? value.kind === "deterministic_evidence_candidate"
    : value.kind === "probabilistic_transport_evidence_candidate";
}

function isLeafCandidate<Output>(
  value: unknown,
  regime: "F_D" | "F_P",
  validateSuccessResult: (candidate: unknown) => candidate is Readonly<Output>,
  failureValueKind: string,
): value is ExecutableLeafCandidate<Output> {
  if (!isRecord(value) || !Array.isArray(value.evidenceCandidates)) return false;
  const evidence = Array.from(value.evidenceCandidates);
  return value.kind === "leaf_realization_candidate" &&
    value.schemaVersion === "5.0.0" &&
    (value.disposition === "success" || value.disposition === "failure") &&
    (regime === "F_D" ? evidence.length > 0 : evidence.length === 0) &&
    evidence.every((candidate) => isEvidenceCandidate(candidate, regime)) &&
    isRecord(value.resultCandidate) &&
    value.resultCandidate.schemaVersion === "5.0.0" &&
    (value.disposition === "success"
      ? regime === "F_P" || validateSuccessResult(value.resultCandidate)
      : value.resultCandidate.kind === failureValueKind &&
        typeof value.diagnosticRef === "string" &&
        value.resultCandidate.diagnosticRef === value.diagnosticRef);
}

function totalizedFailureCandidate<Input, Output>(
  input: CompleteExecutableTraversalInput<Input, Output>,
  failureClass: "implementation_exception" | "malformed_return",
  failureValueKind: string,
): DeterministicLeafFailureCandidate {
  const diagnosticRef = `diagnostic://abiogenesis/implementation/${failureClass.replaceAll("_", "-")}@5`;
  const resultCandidate = deepFreeze({
    kind: failureValueKind,
    schemaVersion: "5.0.0" as const,
    failureClass,
    diagnosticRef,
  }) as Readonly<Record<string, JsonValue>>;
  const outputDigest = sha256Canonical(resultCandidate);
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "failure" as const,
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate" as const,
      schemaVersion: "5.0.0" as const,
      implementationRef: input.implementationResolution.implementationRef,
      inputDigest: input.inputDigest,
      outputDigest,
    }],
    resultCandidate,
    diagnosticRef,
  }) as DeterministicLeafFailureCandidate;
}

export async function completeExecutableTraversal<
  Input,
  Output,
>(
  input: CompleteExecutableTraversalInput<Input, Output>,
): Promise<ExecutableTraversalCompletion> {
  const computeRegime = input.traversalStop.computeRegime;
  if (
    !isAdmittedLeafInvocationPort(input.leafPort) ||
    input.leafPort.implementationSetRef !== input.implementationSet.implementationSetRef ||
    input.leafPort.implementationSetDigest !== input.implementationSet.implementationSetDigest ||
    input.leafPort.publicationDigest !== input.implementationSet.publicationDigest
  ) {
    const diagnosticRef =
      "diagnostic://abiogenesis/implementation/admitted-leaf-port-mismatch@5";
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "c_call_open",
      { implementationSetRef: input.implementationSet.implementationSetRef },
      diagnosticRef,
      cursorBasis(input, "leaf-port-refusal"),
    );
    return completion("failed", replayRun(input), { diagnosticRef });
  }
  const failureValueKind = input.leafPort.contractValueKind(
    input.traversalStop.failureContractRef,
    "failure",
  );
  const resultValueKind = input.leafPort.contractValueKind(
    input.traversalStop.outputContractRef,
    "output",
  );
  const judgmentRelation = input.leafPort.resolveJudgmentRelation(
    input.traversalStop.judgmentPredicateRef,
  );
  if (
    failureValueKind === null ||
    resultValueKind === null ||
    judgmentRelation === null
  ) {
    const diagnosticRef =
      "diagnostic://abiogenesis/implementation/result-contract-absent@5";
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "c_call_open",
      {
        failureContractRef: input.traversalStop.failureContractRef,
        judgmentPredicateRef: input.traversalStop.judgmentPredicateRef,
        outputContractRef: input.traversalStop.outputContractRef,
      },
      diagnosticRef,
      cursorBasis(input, "leaf-contract-refusal"),
    );
    return completion("failed", replayRun(input), { diagnosticRef });
  }
  const validateSuccessCandidate = (value: unknown): value is Readonly<Output> =>
    input.leafPort.validateContractValue(
      input.traversalStop.outputContractRef,
      "output",
      value,
    );
  const validateSuccessResult = (value: unknown): value is Readonly<Output> =>
    validateSuccessCandidate(value) &&
    (computeRegime !== "F_P" || judgmentRelation.evaluate(input.input, value));
  if (
    sha256Canonical(input.input as unknown as JsonValue) !== input.inputDigest ||
    input.inputDigest !== input.traversalStop.cursor.inputDigest
  ) {
    const diagnosticRef = "diagnostic://abiogenesis/hog/input-basis-mismatch@5";
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "c_call_open",
      {
        admittedInputDigest: input.traversalStop.cursor.inputDigest,
        suppliedInputDigest: input.inputDigest,
      },
      diagnosticRef,
      cursorBasis(input, "input-basis-refusal"),
    );
    return completion("failed", replayRun(input), { diagnosticRef });
  }
  const opened = openCCall(
    input.store,
    input.executionBasis,
    input.openedTraversalScope,
    input.program,
    input.graph,
    input.traversalStop,
    input.implementationSet,
    input.implementationResolution,
    basis(input.clock, "c-call-open"),
  );
  if (opened.kind !== "c_call_admission") {
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "c_call_open",
      opened as unknown as JsonValue,
      `diagnostic://abiogenesis/hog/${opened.code}@5`,
      cursorBasis(input, "c-call-open-refusal"),
    );
    return completion("failed", replayRun(input), {
      diagnosticRef: `diagnostic://abiogenesis/hog/${opened.code}@5`,
    });
  }
  const cCall = opened.cCall;
  const probabilisticWorkerContracts = computeRegime === "F_P"
    ? input.leafPort.resolveProbabilisticWorkerContracts(
        input.implementationResolution,
        input.input as Readonly<Record<string, JsonValue>>,
      )
    : null;
  let actorObservation: ActorProcessObservation | null = null;
  let dispatchCount = 0;
  const probabilisticEffects: ProbabilisticLeafEffectPort | null = computeRegime === "F_P"
    ? input.actorRuntimeBinding === undefined ||
        probabilisticWorkerContracts === null ||
        probabilisticWorkerContracts.resultContractRef !==
          cCall.outputContractRef
      ? null
      : {
          occurrence: {
            cCallRef: cCall.cCallRef,
            runId: cCall.runId,
            graphCallId: cCall.graphCallId,
            frameId: cCall.frameId,
            programLocusRef: cCall.programLocusRef,
            taskOrdinal: cCall.taskOrdinal,
            attempt: cCall.attempt,
          },
          invokeWorker: async (request) => {
            if (dispatchCount !== 0) {
              throw new TypeError("one F_P C-call may dispatch exactly one actor invocation");
            }
            dispatchCount += 1;
            const observation = await invokeActorProcess({
              store: input.store,
              executionBasis: input.executionBasis,
              scope: input.openedTraversalScope,
              cCall,
              expectedInputDigest: input.inputDigest,
              expectedInstructionContractRef:
                probabilisticWorkerContracts.instructionContractRef,
              expectedResultContractRef:
                probabilisticWorkerContracts.resultContractRef,
              runtime: input.actorRuntimeBinding!,
              request,
              dispatchOrdinal: dispatchCount,
              basis: basis(input.clock, "actor-process"),
            });
            actorObservation = observation;
            return observation;
          },
        }
    : null;
  let realized: unknown;
  let leaf: ExecutableLeafCandidate<Output>;
  try {
    if (computeRegime === "F_P" && probabilisticEffects === null) {
      throw new TypeError("F_P traversal requires an ABG-owned actor runtime binding");
    }
    realized = await input.leafPort.invoke(
      input.implementationResolution,
      input.input as Readonly<Record<string, JsonValue>>,
      probabilisticEffects,
    );
    leaf = isLeafCandidate<Output>(
      realized,
      computeRegime,
      validateSuccessCandidate,
      failureValueKind,
    )
      ? realized
      : totalizedFailureCandidate(input, "malformed_return", failureValueKind);
  } catch {
    leaf = totalizedFailureCandidate(input, "implementation_exception", failureValueKind);
  }
  const evidenceCandidates: readonly CCallEvidenceCandidate[] = computeRegime === "F_P"
    ? actorObservation === null
      ? []
        : [deriveProbabilisticTransportEvidence(
          cCall,
          actorObservation,
          leaf.resultCandidate as unknown as JsonValue,
          probabilisticWorkerContracts!.instructionContractRef,
        )]
    : leaf.evidenceCandidates;
  const evidence: AdmittedCCallEvidence[] = [];
  for (const candidate of evidenceCandidates) {
    const admitted = admitEvidence(
      input.store,
      cCall,
      candidate,
      cCall.evidenceContractRef,
      input.inputDigest,
      basis(input.clock, "evidence"),
      probabilisticWorkerContracts?.instructionContractRef,
    );
    if (admitted.kind === "c_call_admission_rejection") {
      const rejected = completeRejectedCCall(
        input.store,
        cCall,
        admitted,
        basis(input.clock, "evidence-rejection"),
      );
      return completeBlockedTraversal(input, cCall, {
        resultRef: rejected.refusalResultRef,
        judgmentRef: rejected.rejectionJudgmentRef,
        judgmentEventRef: rejected.judgmentEventRef,
        reasonRef: admitted.diagnosticRef,
      });
    }
    evidence.push(admitted);
  }
  const result = admitResult(
    input.store,
    cCall,
    leaf.resultCandidate as unknown as JsonValue,
    leaf.disposition,
    leaf.disposition === "success"
      ? cCall.outputContractRef
      : cCall.failureContractRef,
    leaf.disposition === "success"
      ? resultValueKind
      : failureValueKind,
    leaf.disposition === "success"
      ? (value) =>
        validateSuccessResult(value) &&
        input.leafPort.validateResultEvidenceLineage(
          cCall.outputContractRef,
          value as unknown as Readonly<Record<string, JsonValue>>,
          evidence.map((row) => deepFreeze({
            cCallRef: cCall.cCallRef,
            cCallAttempt: cCall.attempt,
            evidenceRef: row.evidenceRef,
            evidenceDigest: row.evidenceDigest,
            evidenceClass: row.evidenceClass,
            outputDigest: row.outputDigest,
            transportDigest: row.evidenceClass === "probabilistic_transport" &&
                "transportDigest" in row &&
                typeof row.transportDigest === "string"
              ? row.transportDigest
              : null,
          })),
        )
      : (value) => isRecord(value) &&
        value.kind === failureValueKind &&
        value.schemaVersion === "5.0.0" &&
        value.diagnosticRef === leaf.diagnosticRef,
    evidence,
    basis(input.clock, "result"),
  );
  if (result.kind === "c_call_admission_rejection") {
    if (
      leaf.disposition === "success" &&
      !validateSuccessCandidate(leaf.resultCandidate)
    ) {
      const retry = completeRetryTraversal(
        input,
        cCall,
        result,
        "contract_failure",
      );
      if (retry !== null) return retry;
    }
    const rejected = completeRejectedCCall(
      input.store,
      cCall,
      result,
      basis(input.clock, "result-rejection"),
    );
    return completeBlockedTraversal(input, cCall, {
      resultRef: rejected.refusalResultRef,
      judgmentRef: rejected.rejectionJudgmentRef,
      judgmentEventRef: rejected.judgmentEventRef,
      reasonRef: result.diagnosticRef,
    });
  }
  const resultReplay = replayRun(input);
  const judgmentCandidate = leaf.disposition === "success"
    ? proposeJudgment(
      cCall,
      result,
      resultReplay,
      input.input,
      judgmentRelation,
      cCall.judgmentContractRef,
    )
    : proposeFailureJudgment(
      cCall,
      result,
      resultReplay,
      leaf.diagnosticRef,
      cCall.judgmentContractRef,
    );
  const judgment = admitJudgment(
    input.store,
    cCall,
    result,
    judgmentCandidate,
    resultReplay,
    basis(input.clock, "judgment"),
  );
  if (judgment.kind === "c_call_admission_rejection") {
    const rejected = completeRejectedCCall(
      input.store,
      cCall,
      judgment,
      basis(input.clock, "judgment-rejection"),
    );
    return completeBlockedTraversal(input, cCall, {
      resultRef: rejected.refusalResultRef,
      judgmentRef: rejected.rejectionJudgmentRef,
      judgmentEventRef: rejected.judgmentEventRef,
      reasonRef: judgment.diagnosticRef,
    });
  }
  if (judgment.judgment !== "advance") {
    return completeBlockedTraversal(input, cCall, {
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      judgmentEventRef: judgment.admissionEventRef,
      reasonRef: judgment.reasonRef,
    });
  }
  const judgedReplay = replayRun(input);
  if (
    isRecord(result.value) &&
    result.value.kind === "next_action_projection" &&
    result.value.disposition === "no_action" &&
    [
      "gap_stop",
      "reprice_required",
      "repair",
      "inspect_runtime_archive",
      "reprice",
      "escalate",
    ].includes(String(result.value.noActionDisposition))
  ) {
    const proposal = proposeGapStopRoute(
      input.graph,
      input.traversalStop,
      cCall,
      result,
      judgment,
      judgedReplay,
      input.closureContract.transitionContractRef,
    );
    if (proposal.kind !== "traversal_route_candidate") {
      admitRuntimeFailure(
        input.store,
        input.executionBasis,
        input.openedTraversalScope,
        "route",
        proposal as unknown as JsonValue,
        `diagnostic://abiogenesis/hog/${proposal.code}@5`,
        {
          ...basis(input.clock, "gap-stop-proposal-refusal"),
          causationEventRefs: [judgment.admissionEventRef],
        },
      );
      return completion("failed", replayRun(input), {
        cCallRef: cCall.cCallRef,
        resultRef: result.resultRef,
        judgmentRef: judgment.judgmentRef,
        diagnosticRef: `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      });
    }
    const route = admitRoute(
      input.store,
      input.executionBasis,
      input.graph,
      input.traversalStop.cursor,
      null,
      judgedReplay,
      proposal,
      basis(input.clock, "gap-stop-route"),
      { cCall, result, judgment },
    );
    if (
      route.kind !== "admitted_traversal_route" ||
      route.routeKind !== "gap_stop" ||
      route.runStoppedEventRef === null
    ) {
      const code = route.kind === "admitted_traversal_route"
        ? "gap-stop-not-terminalized"
        : route.code;
      admitRuntimeFailure(
        input.store,
        input.executionBasis,
        input.openedTraversalScope,
        "route",
        route as unknown as JsonValue,
        `diagnostic://abiogenesis/hog/${code}@5`,
        {
          ...basis(input.clock, "gap-stop-admission-refusal"),
          causationEventRefs: [judgment.admissionEventRef],
        },
      );
      return completion("failed", replayRun(input), {
        cCallRef: cCall.cCallRef,
        resultRef: result.resultRef,
        judgmentRef: judgment.judgmentRef,
        diagnosticRef: `diagnostic://abiogenesis/hog/${code}@5`,
      });
    }
    return completion("gap_stop", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      resultValue: result.value,
    });
  }
  const graphSpanProjection =
    isRecord(result.value) &&
      result.value.kind === "graph_span_selection" &&
      result.value.schemaVersion === "5.0.0" &&
      result.value.disposition === "re_enter" &&
      typeof result.value.projectionRef === "string" &&
      typeof result.value.projectionDigest === "string" &&
      typeof result.value.applicationRef === "string" &&
      typeof result.value.graphFunctionRef === "string" &&
      typeof result.value.sourceProgramLocusRef === "string" &&
      typeof result.value.targetProgramLocusRef === "string" &&
      typeof result.value.targetInputRef === "string" &&
      typeof result.value.targetInputDigest === "string" &&
      isRecord(result.value.targetInput)
      ? result.value as unknown as GraphSpanReentryProjection
      : null;
  if (graphSpanProjection !== null) {
    const application = input.graph.template.applications.find(
      (candidate) =>
        candidate.relationKind === "re_enter" &&
        candidate.applicationRef === graphSpanProjection.applicationRef,
    );
    const targetInputContractRef =
      application?.relationKind === "re_enter"
        ? application.outputContractRef
        : null;
    const step = application?.relationKind === "re_enter"
      ? deriveGraphSpanReentryStep(
          input.graph,
          input.traversalStop.cursor,
          application,
          {
            inputRef: graphSpanProjection.targetInputRef,
            inputDigest: graphSpanProjection.targetInputDigest,
          },
        )
      : null;
    if (
      step === null ||
      targetInputContractRef === null ||
      step.kind !== "traversal_step"
    ) {
      const code = step === null
        ? "graph_span_reentry_not_declared"
        : step.kind === "traversal_refusal"
          ? step.code
          : "graph_span_reentry_target_contract_absent";
      admitRuntimeFailure(
        input.store,
        input.executionBasis,
        input.openedTraversalScope,
        "route",
        result.value,
        `diagnostic://abiogenesis/hog/${code}@5`,
        {
          ...basis(input.clock, "graph-span-reentry-derivation-refusal"),
          causationEventRefs: [judgment.admissionEventRef],
        },
      );
      return completion("failed", replayRun(input), {
        cCallRef: cCall.cCallRef,
        resultRef: result.resultRef,
        judgmentRef: judgment.judgmentRef,
        diagnosticRef: `diagnostic://abiogenesis/hog/${code}@5`,
      });
    }
    const proposal = proposeGraphSpanReentryRoute(
      input.graph,
      step,
      cCall,
      result,
      judgment,
      judgedReplay,
      input.closureContract.transitionContractRef,
      graphSpanProjection,
    );
    if (proposal.kind !== "traversal_route_candidate") {
      admitRuntimeFailure(
        input.store,
        input.executionBasis,
        input.openedTraversalScope,
        "route",
        proposal as unknown as JsonValue,
        `diagnostic://abiogenesis/hog/${proposal.code}@5`,
        {
          ...basis(input.clock, "graph-span-reentry-proposal-refusal"),
          causationEventRefs: [judgment.admissionEventRef],
        },
      );
      return completion("failed", replayRun(input), {
        cCallRef: cCall.cCallRef,
        resultRef: result.resultRef,
        judgmentRef: judgment.judgmentRef,
        diagnosticRef: `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      });
    }
    const route = admitRoute(
      input.store,
      input.executionBasis,
      input.graph,
      input.traversalStop.cursor,
      step.targetCursor,
      judgedReplay,
      proposal,
      basis(input.clock, "graph-span-reentry-route"),
      { cCall, result, judgment },
    );
    if (route.kind !== "admitted_traversal_route") {
      admitRuntimeFailure(
        input.store,
        input.executionBasis,
        input.openedTraversalScope,
        "route",
        route as unknown as JsonValue,
        `diagnostic://abiogenesis/hog/${route.code}@5`,
        {
          ...basis(input.clock, "graph-span-reentry-admission-refusal"),
          causationEventRefs: [judgment.admissionEventRef],
        },
      );
      return completion("failed", replayRun(input), {
        cCallRef: cCall.cCallRef,
        resultRef: result.resultRef,
        judgmentRef: judgment.judgmentRef,
        diagnosticRef: `diagnostic://abiogenesis/hog/${route.code}@5`,
      });
    }
    const nextCursor = applyRoute(step, route);
    if (nextCursor.kind === "traversal_refusal") {
      admitRuntimeFailure(
        input.store,
        input.executionBasis,
        input.openedTraversalScope,
        "route",
        nextCursor as unknown as JsonValue,
        `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
        {
          ...basis(input.clock, "graph-span-reentry-application-refusal"),
          causationEventRefs: [route.admissionEventRef],
        },
      );
      return completion("failed", replayRun(input), {
        cCallRef: cCall.cCallRef,
        resultRef: result.resultRef,
        judgmentRef: judgment.judgmentRef,
        diagnosticRef:
          `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
      });
    }
    return completion("advanced", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      nextCursor,
      resultValue:
        graphSpanProjection.targetInput as unknown as JsonValue,
      continuationKind: "re_enter",
      nextInputContractRef: targetInputContractRef,
    });
  }
  const continuationStep = deriveCompletedTraversalStep(
    input.graph,
    input.traversalStop.cursor,
    {
      inputRef: result.resultRef,
      inputDigest: result.valueDigest,
    },
  );
  if (continuationStep.kind !== "traversal_step") {
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "route",
      continuationStep as unknown as JsonValue,
      `diagnostic://abiogenesis/hog/${continuationStep.code}@5`,
      {
        ...basis(input.clock, "continuation-refusal"),
        causationEventRefs: [judgment.admissionEventRef],
      },
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      resultValue: result.value,
      diagnosticRef: `diagnostic://abiogenesis/hog/${continuationStep.code}@5`,
    });
  }
  if (input.terminalMode === "return_to_application") {
    const ready = completion("application_ready", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      resultValue: result.value,
    });
    deferredApplicationStates.set(ready, {
      input: input as CompleteExecutableTraversalInput<unknown, unknown>,
      cCall,
      result,
      judgment,
      continuationStep,
    });
    return ready;
  }
  const proposal = proposeJudgedRoute(
    input.graph,
    continuationStep,
    cCall,
    result,
    judgment,
    judgedReplay,
    input.closureContract.transitionContractRef,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "route",
      proposal as unknown as JsonValue,
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      {
        ...basis(input.clock, "route-proposal-refusal"),
        causationEventRefs: [judgment.admissionEventRef],
      },
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      diagnosticRef: `diagnostic://abiogenesis/hog/${proposal.code}@5`,
    });
  }
  const route = admitRoute(
    input.store,
    input.executionBasis,
    input.graph,
    input.traversalStop.cursor,
    continuationStep.targetCursor,
    judgedReplay,
    proposal,
    basis(input.clock, "route"),
    { cCall, result, judgment },
  );
  if (route.kind !== "admitted_traversal_route") {
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "route",
      route as unknown as JsonValue,
      `diagnostic://abiogenesis/hog/${route.code}@5`,
      {
        ...basis(input.clock, "route-admission-refusal"),
        causationEventRefs: [judgment.admissionEventRef],
      },
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      diagnosticRef: `diagnostic://abiogenesis/hog/${route.code}@5`,
    });
  }
  if (route.routeKind === "advance") {
    const nextCursor = applyRoute(continuationStep, route);
    if (nextCursor.kind === "traversal_refusal") {
      admitRuntimeFailure(
        input.store,
        input.executionBasis,
        input.openedTraversalScope,
        "route",
        nextCursor as unknown as JsonValue,
        `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
        {
          ...basis(input.clock, "route-application-refusal"),
          causationEventRefs: [route.admissionEventRef],
        },
      );
      return completion("failed", replayRun(input), {
        cCallRef: cCall.cCallRef,
        resultRef: result.resultRef,
        judgmentRef: judgment.judgmentRef,
        resultValue: result.value,
        diagnosticRef: `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
      });
    }
    return completion("advanced", replayRun(input), {
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
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      resultValue: result.value,
      diagnosticRef: "diagnostic://abiogenesis/hog/unexpected-judged-route@5",
    });
  }
  const routeReplay = replayRun(input);
  if (input.terminalMode === "return_to_parent") {
    const childClosure = admitChildClosure(
      input.store,
      input.openedTraversalScope,
      cCall,
      result,
      judgment,
      route,
      routeReplay,
      input.closureContract,
      basis(input.clock, "child-closure"),
    );
    if (childClosure.kind !== "child_closure_admission") {
      return completion("failed", replayRun(input), {
        cCallRef: cCall.cCallRef,
        resultRef: result.resultRef,
        judgmentRef: judgment.judgmentRef,
        diagnosticRef:
          `diagnostic://abiogenesis/hog/${childClosure.code}@5`,
      });
    }
    return completion("closed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      closureRef: childClosure.closureRef,
      resultValue: result.value,
    });
  }
  const closure = admitClosure(
    input.store,
    cCall,
    result,
    judgment,
    route,
    routeReplay,
    input.closureContract,
    basis(input.clock, "closure"),
  );
  if (closure.kind !== "closure_admission") {
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      diagnosticRef: `diagnostic://abiogenesis/hog/${closure.code}@5`,
    });
  }
  return completion("closed", replayRun(input), {
    cCallRef: cCall.cCallRef,
    resultRef: result.resultRef,
    judgmentRef: judgment.judgmentRef,
    closureRef: closure.closureRef,
    resultValue: result.value,
  });
}

function requireDeferredApplicationState(
  value: ExecutableTraversalCompletion,
): DeferredApplicationState {
  const state = deferredApplicationStates.get(value);
  if (value.disposition !== "application_ready" || state === undefined) {
    throw new TypeError(
      "application completion requires the exact HoG-issued deferred capability",
    );
  }
  return state;
}

function failDeferredApplication(
  state: DeferredApplicationState,
  value: ExecutableTraversalCompletion,
  clock: ExecutableTraversalClock,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): ExecutableTraversalCompletion {
  deferredApplicationStates.delete(value);
  admitRuntimeFailure(
    state.input.store,
    state.input.executionBasis,
    state.input.openedTraversalScope,
    "route",
    { stage, candidate },
    diagnosticRef,
    {
      eventTime: clock.eventTime,
      correlationId: `${clock.correlationId}/${stage}`,
      causationEventRefs: [state.judgment.admissionEventRef],
    },
  );
  return completion("failed", replayRun(state.input), {
    cCallRef: state.cCall.cCallRef,
    resultRef: state.result.resultRef,
    judgmentRef: state.judgment.judgmentRef,
    resultValue: state.result.value,
    diagnosticRef,
  });
}

function exactDeferredApplication(
  state: DeferredApplicationState,
  application: Readonly<RecurseApplication>,
): boolean {
  return state.input.graph.template.applications.find(
    (candidate) => candidate.applicationRef === application.applicationRef,
  ) === application &&
    state.cCall.compositionRef === application.applicationRef;
}

export function restoreDeferredRecursion(
  input: RestoreDeferredRecursionInput,
): ExecutableTraversalCompletion | null {
  const traversal = input.traversalInput;
  const continuationStep = deriveCompletedTraversalStep(
    traversal.graph,
    traversal.traversalStop.cursor,
    {
      inputRef: input.result.resultRef,
      inputDigest: input.result.valueDigest,
    },
  );
  if (
    !isCCall(input.cCall) ||
    !isAdmittedCCallResult(input.result) ||
    !isAdmittedCCallJudgment(input.judgment) ||
    continuationStep.kind !== "traversal_step" ||
    traversal.terminalMode !== "return_to_application" ||
    recursionTerminationDecision(input.application, input.result.value) !==
      false ||
    traversal.graph.template.applications.find(
      (candidate) =>
        candidate.applicationRef === input.application.applicationRef,
    ) !== input.application ||
    input.cCall.compositionRef !== input.application.applicationRef ||
    input.cCall.basisId !== traversal.executionBasis.basisRef ||
    input.cCall.graphCallId !== traversal.openedTraversalScope.graphCallId ||
    input.cCall.frameId !== traversal.openedTraversalScope.frameId ||
    input.cCall.programLocusRef !==
      traversal.traversalStop.programLocusRef ||
    input.result.cCallRef !== input.cCall.cCallRef ||
    input.judgment.cCallRef !== input.cCall.cCallRef ||
    input.judgment.resultRef !== input.result.resultRef ||
    sha256Canonical(traversal.input as unknown as JsonValue) !==
      traversal.inputDigest ||
    traversal.inputDigest !== traversal.traversalStop.cursor.inputDigest
  ) {
    return null;
  }
  const ready = completion("application_ready", replayRun(traversal), {
    cCallRef: input.cCall.cCallRef,
    resultRef: input.result.resultRef,
    judgmentRef: input.judgment.judgmentRef,
    resultValue: input.result.value,
  });
  deferredApplicationStates.set(ready, {
    input: traversal,
    cCall: input.cCall,
    result: input.result,
    judgment: input.judgment,
    continuationStep,
  });
  return ready;
}

export function completeDeferredApplicationTerminal(
  input: CompleteDeferredRecursionInput,
): ExecutableTraversalCompletion {
  const state = requireDeferredApplicationState(input.completion);
  if (
    !exactDeferredApplication(state, input.application) ||
    recursionTerminationDecision(input.application, state.result.value) !== true
  ) {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-terminal-refusal",
      "diagnostic://abiogenesis/hog/application-terminal-not-declared@5",
      input.application as unknown as JsonValue,
    );
  }
  const judgedReplay = replayRun(state.input);
  const proposal = proposeJudgedRoute(
    state.input.graph,
    state.continuationStep,
    state.cCall,
    state.result,
    state.judgment,
    judgedReplay,
    state.input.closureContract.transitionContractRef,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-terminal-proposal",
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      proposal as unknown as JsonValue,
    );
  }
  const route = admitRoute(
    state.input.store,
    state.input.executionBasis,
    state.input.graph,
    state.input.traversalStop.cursor,
    state.continuationStep.targetCursor,
    judgedReplay,
    proposal,
    {
      eventTime: input.clock.eventTime,
      correlationId: `${input.clock.correlationId}/application-terminal-route`,
      causationEventRefs: [],
    },
    {
      cCall: state.cCall,
      result: state.result,
      judgment: state.judgment,
    },
  );
  if (
    route.kind !== "admitted_traversal_route" ||
    !["advance", "terminal"].includes(route.routeKind)
  ) {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-terminal-admission",
      route.kind === "admitted_traversal_route"
        ? "diagnostic://abiogenesis/hog/application-terminal-route-mismatch@5"
        : `diagnostic://abiogenesis/hog/${route.code}@5`,
      route as unknown as JsonValue,
    );
  }
  deferredApplicationStates.delete(input.completion);
  if (route.routeKind === "advance") {
    const nextCursor = applyRoute(state.continuationStep, route);
    if (nextCursor.kind === "traversal_refusal") {
      return completion("failed", replayRun(state.input), {
        cCallRef: state.cCall.cCallRef,
        resultRef: state.result.resultRef,
        judgmentRef: state.judgment.judgmentRef,
        diagnosticRef:
          `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
      });
    }
    return completion("advanced", replayRun(state.input), {
      cCallRef: state.cCall.cCallRef,
      resultRef: state.result.resultRef,
      judgmentRef: state.judgment.judgmentRef,
      nextCursor,
      resultValue: state.result.value,
      continuationKind: "advance",
      nextInputContractRef: input.application.outputContractRef,
    });
  }
  const routeReplay = replayRun(state.input);
  if (state.input.applicationCompletionMode === "return_to_parent") {
    const childClosure = admitChildClosure(
      state.input.store,
      state.input.openedTraversalScope,
      state.cCall,
      state.result,
      state.judgment,
      route,
      routeReplay,
      state.input.closureContract,
      {
        eventTime: input.clock.eventTime,
        correlationId:
          `${input.clock.correlationId}/application-child-closure`,
        causationEventRefs: [],
      },
    );
    if (childClosure.kind !== "child_closure_admission") {
      return completion("failed", replayRun(state.input), {
        cCallRef: state.cCall.cCallRef,
        resultRef: state.result.resultRef,
        judgmentRef: state.judgment.judgmentRef,
        diagnosticRef:
          `diagnostic://abiogenesis/hog/${childClosure.code}@5`,
      });
    }
    return completion("closed", replayRun(state.input), {
      cCallRef: state.cCall.cCallRef,
      resultRef: state.result.resultRef,
      judgmentRef: state.judgment.judgmentRef,
      closureRef: childClosure.closureRef,
      resultValue: state.result.value,
    });
  }
  const closure = admitClosure(
    state.input.store,
    state.cCall,
    state.result,
    state.judgment,
    route,
    routeReplay,
    state.input.closureContract,
    {
      eventTime: input.clock.eventTime,
      correlationId: `${input.clock.correlationId}/application-closure`,
      causationEventRefs: [],
    },
  );
  if (closure.kind !== "closure_admission") {
    return completion("failed", replayRun(state.input), {
      cCallRef: state.cCall.cCallRef,
      resultRef: state.result.resultRef,
      judgmentRef: state.judgment.judgmentRef,
      diagnosticRef: `diagnostic://abiogenesis/hog/${closure.code}@5`,
    });
  }
  return completion("closed", replayRun(state.input), {
    cCallRef: state.cCall.cCallRef,
    resultRef: state.result.resultRef,
    judgmentRef: state.judgment.judgmentRef,
    closureRef: closure.closureRef,
    resultValue: state.result.value,
  });
}

export function advanceDeferredRecursion(
  input: AdvanceDeferredRecursionInput,
): ExecutableTraversalCompletion {
  const state = requireDeferredApplicationState(input.completion);
  const childValue = input.childCompletion.resultValue;
  if (
    !exactDeferredApplication(state, input.application) ||
    recursionTerminationDecision(input.application, state.result.value) !== false ||
    input.application.foldback.binding !== "$" ||
    (
      input.childCompletion.disposition !== "closed" &&
      input.childCompletion.disposition !== "blocked"
    ) ||
    (
      input.childCompletion.disposition === "closed"
        ? input.childCompletion.closureRef === null
        : input.childCompletion.closureRef !== null
    ) ||
    input.childCompletion.resultRef === null ||
    input.childCompletion.judgmentRef === null ||
    typeof childValue !== "object" ||
    childValue === null ||
    Array.isArray(childValue)
  ) {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-foldback-refusal",
      "diagnostic://abiogenesis/hog/application-foldback-mismatch@5",
      input.application as unknown as JsonValue,
    );
  }
  const foldback = admitApplicationChildFoldback(
    state.input.store,
    state.input.executionBasis,
    state.input.graph,
    input.application,
    state.cCall,
    state.judgment.judgmentRef,
    state.input.traversalStop.cursor,
    input.childExecutionBasis,
    input.childTraversalScope,
    {
      resultRef: input.childCompletion.resultRef,
      judgmentRef: input.childCompletion.judgmentRef,
      closureRef: input.childCompletion.closureRef,
    },
    {
      eventTime: input.clock.eventTime,
      correlationId: `${input.clock.correlationId}/application-foldback`,
      causationEventRefs: [],
    },
  );
  if (foldback.kind !== "application_child_foldback_admission") {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-foldback-admission",
      `diagnostic://abiogenesis/hog/${foldback.code}@5`,
      foldback as unknown as JsonValue,
    );
  }
  if (foldback.childDisposition === "blocked") {
    const foldbackReplay = replayRun(state.input);
    const proposal = proposeRecursionRoute(
      state.input.graph,
      input.application,
      state.input.traversalStop.cursor,
      null,
      state.cCall,
      state.judgment,
      foldback,
      foldbackReplay,
      state.cCall.transitionContractRef,
      "blocked",
    );
    if (proposal.kind !== "traversal_route_candidate") {
      return failDeferredApplication(
        state,
        input.completion,
        input.clock,
        "application-child-stop-proposal",
        `diagnostic://abiogenesis/hog/${proposal.code}@5`,
        proposal as unknown as JsonValue,
      );
    }
    const route = admitRecursionRoute(
      state.input.store,
      state.input.executionBasis,
      state.input.graph,
      input.application,
      state.input.traversalStop.cursor,
      null,
      foldbackReplay,
      proposal,
      {
        eventTime: input.clock.eventTime,
        correlationId:
          `${input.clock.correlationId}/application-child-stop-route`,
        causationEventRefs: [],
      },
      {
        cCall: state.cCall,
        result: state.result,
        judgment: state.judgment,
        foldback,
      },
    );
    deferredApplicationStates.delete(input.completion);
    if (
      route.kind !== "admitted_traversal_route" ||
      route.routeKind !== "blocked" ||
      route.runStoppedEventRef === null
    ) {
      return completion("failed", replayRun(state.input), {
        cCallRef: state.cCall.cCallRef,
        resultRef: state.result.resultRef,
        judgmentRef: state.judgment.judgmentRef,
        diagnosticRef: route.kind === "admitted_traversal_route"
          ? "diagnostic://abiogenesis/hog/application-run-stop-absent@5"
          : `diagnostic://abiogenesis/hog/${route.code}@5`,
      });
    }
    return completion("blocked", replayRun(state.input), {
      cCallRef: state.cCall.cCallRef,
      resultRef: foldback.childResultRef,
      judgmentRef: state.judgment.judgmentRef,
      resultValue: childValue as JsonValue,
      diagnosticRef: foldback.childReasonRef ??
        "diagnostic://abiogenesis/hog/child-traversal-blocked@5",
    });
  }
  const targetCursor = deriveRecursionReentryCursor(
    state.input.graph,
    input.application,
    state.input.traversalStop.cursor,
    {
      inputRef: foldback.childResultRef,
      inputDigest: foldback.outputDigest,
    },
  );
  if (targetCursor.kind === "traversal_refusal") {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-reentry-derivation",
      `diagnostic://abiogenesis/hog/${targetCursor.code}@5`,
      targetCursor as unknown as JsonValue,
    );
  }
  const foldbackReplay = replayRun(state.input);
  const proposal = proposeRecursionRoute(
    state.input.graph,
    input.application,
    state.input.traversalStop.cursor,
    targetCursor,
    state.cCall,
    state.judgment,
    foldback,
    foldbackReplay,
    state.cCall.transitionContractRef,
    "advance",
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-route-proposal",
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      proposal as unknown as JsonValue,
    );
  }
  const route = admitRecursionRoute(
    state.input.store,
    state.input.executionBasis,
    state.input.graph,
    input.application,
    state.input.traversalStop.cursor,
    targetCursor,
    foldbackReplay,
    proposal,
    {
      eventTime: input.clock.eventTime,
      correlationId: `${input.clock.correlationId}/application-route`,
      causationEventRefs: [],
    },
    {
      cCall: state.cCall,
      result: state.result,
      judgment: state.judgment,
      foldback,
    },
  );
  if (route.kind !== "admitted_traversal_route") {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-route-admission",
      `diagnostic://abiogenesis/hog/${route.code}@5`,
      route as unknown as JsonValue,
    );
  }
  const nextCursor = applyRecursionRoute(
    state.input.traversalStop.cursor,
    targetCursor,
    route,
  );
  if (nextCursor.kind === "traversal_refusal") {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-route-application",
      `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
      nextCursor as unknown as JsonValue,
    );
  }
  deferredApplicationStates.delete(input.completion);
  return completion("advanced", replayRun(state.input), {
    cCallRef: state.cCall.cCallRef,
    resultRef: foldback.childResultRef,
    judgmentRef: state.judgment.judgmentRef,
    nextCursor,
    resultValue: childValue as JsonValue,
    continuationKind: "advance",
    nextInputContractRef: input.application.outputContractRef,
  });
}

export function blockDeferredRecursion(
  input: CompleteDeferredRecursionInput,
): ExecutableTraversalCompletion {
  const state = requireDeferredApplicationState(input.completion);
  if (
    !exactDeferredApplication(state, input.application) ||
    recursionTerminationDecision(input.application, state.result.value) !== false
  ) {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-bound-refusal",
      "diagnostic://abiogenesis/hog/application-bound-mismatch@5",
      input.application as unknown as JsonValue,
    );
  }
  const judgedReplay = replayRun(state.input);
  const proposal = proposeRecursionRoute(
    state.input.graph,
    input.application,
    state.input.traversalStop.cursor,
    null,
    state.cCall,
    state.judgment,
    null,
    judgedReplay,
    state.cCall.transitionContractRef,
    "blocked",
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-bound-proposal",
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      proposal as unknown as JsonValue,
    );
  }
  const route = admitRecursionRoute(
    state.input.store,
    state.input.executionBasis,
    state.input.graph,
    input.application,
    state.input.traversalStop.cursor,
    null,
    judgedReplay,
    proposal,
    {
      eventTime: input.clock.eventTime,
      correlationId: `${input.clock.correlationId}/application-bound`,
      causationEventRefs: [],
    },
    {
      cCall: state.cCall,
      result: state.result,
      judgment: state.judgment,
      foldback: null,
    },
  );
  deferredApplicationStates.delete(input.completion);
  if (
    route.kind !== "admitted_traversal_route" ||
    route.routeKind !== "blocked" ||
    route.runStoppedEventRef === null
  ) {
    return completion("failed", replayRun(state.input), {
      cCallRef: state.cCall.cCallRef,
      resultRef: state.result.resultRef,
      judgmentRef: state.judgment.judgmentRef,
      diagnosticRef: route.kind === "admitted_traversal_route"
        ? "diagnostic://abiogenesis/hog/application-run-stop-absent@5"
        : `diagnostic://abiogenesis/hog/${route.code}@5`,
    });
  }
  return completion("blocked", replayRun(state.input), {
    cCallRef: state.cCall.cCallRef,
    resultRef: state.result.resultRef,
    judgmentRef: state.judgment.judgmentRef,
    resultValue: state.result.value,
    diagnosticRef: "reason://abiogenesis/recursion/bound-exhausted@5",
  });
}

export function blockDeferredRecursionPreparation(
  input: BlockDeferredRecursionPreparationInput,
): ExecutableTraversalCompletion {
  const state = requireDeferredApplicationState(input.completion);
  if (
    !exactDeferredApplication(state, input.application) ||
    recursionTerminationDecision(input.application, state.result.value) !== false
  ) {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-preparation-refusal",
      "diagnostic://abiogenesis/hog/application-preparation-mismatch@5",
      input.application as unknown as JsonValue,
    );
  }
  const refusalAdmission = admitApplicationChildPreparationRefusal(
    state.input.store,
    state.input.executionBasis,
    state.input.graph,
    input.application,
    state.cCall,
    state.result,
    state.judgment,
    state.input.traversalStop.cursor,
    {
      childGraphFunctionRef: input.application.graphFunctionRef,
      inputRef: state.result.resultRef,
      inputDigest: state.result.valueDigest,
      ...input.preparationRefusal,
    },
    {
      eventTime: input.clock.eventTime,
      correlationId: `${input.clock.correlationId}/preparation-refusal`,
      causationEventRefs: [],
    },
  );
  if (
    refusalAdmission.kind !==
      "application_child_preparation_refusal_admission"
  ) {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-preparation-admission",
      `diagnostic://abiogenesis/hog/${refusalAdmission.code}@5`,
      refusalAdmission as unknown as JsonValue,
    );
  }
  const refusalReplay = replayRun(state.input);
  const proposal = proposeRecursionRoute(
    state.input.graph,
    input.application,
    state.input.traversalStop.cursor,
    null,
    state.cCall,
    state.judgment,
    null,
    refusalReplay,
    state.cCall.transitionContractRef,
    "blocked",
    refusalAdmission,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-preparation-route-proposal",
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      proposal as unknown as JsonValue,
    );
  }
  const route = admitRecursionRoute(
    state.input.store,
    state.input.executionBasis,
    state.input.graph,
    input.application,
    state.input.traversalStop.cursor,
    null,
    refusalReplay,
    proposal,
    {
      eventTime: input.clock.eventTime,
      correlationId:
        `${input.clock.correlationId}/preparation-blocked-route`,
      causationEventRefs: [],
    },
    {
      cCall: state.cCall,
      result: state.result,
      judgment: state.judgment,
      foldback: null,
      preparationRefusal: refusalAdmission,
    },
  );
  deferredApplicationStates.delete(input.completion);
  if (
    route.kind !== "admitted_traversal_route" ||
    route.routeKind !== "blocked" ||
    route.runStoppedEventRef === null
  ) {
    return completion("failed", replayRun(state.input), {
      cCallRef: state.cCall.cCallRef,
      resultRef: state.result.resultRef,
      judgmentRef: state.judgment.judgmentRef,
      diagnosticRef: route.kind === "admitted_traversal_route"
        ? "diagnostic://abiogenesis/hog/application-run-stop-absent@5"
        : `diagnostic://abiogenesis/hog/${route.code}@5`,
    });
  }
  return completion("blocked", replayRun(state.input), {
    cCallRef: state.cCall.cCallRef,
    resultRef: state.result.resultRef,
    judgmentRef: state.judgment.judgmentRef,
    resultValue: state.result.value,
    diagnosticRef: input.preparationRefusal.diagnosticRef,
  });
}

function failWorkflowTraversal(
  input: WorkflowParentTraversalInput,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): ExecutableTraversalCompletion {
  admitRuntimeFailure(
    input.store,
    input.executionBasis,
    input.openedTraversalScope,
    "hog_traversal",
    { stage, candidate },
    diagnosticRef,
    {
      eventTime: input.clock.eventTime,
      correlationId: `${input.clock.correlationId}/${stage}`,
      causationEventRefs: [],
    },
  );
  return completion("failed", replay(input.store, {
    runId: input.openedTraversalScope.runId,
  }), { cCallRef: input.parentCCall.cCallRef, diagnosticRef });
}

function completeBlockedWorkflowTraversal(
  input: WorkflowParentTraversalInput,
  resultRef: string,
  judgmentRef: string,
  judgmentEventRef: string,
  reasonRef: string,
): ExecutableTraversalCompletion {
  const currentReplay = replay(input.store, { runId: input.openedTraversalScope.runId });
  const proposal = proposeWorkflowBlockedRoute(
    input.graph,
    input.workflowStep,
    input.parentCCall,
    judgmentRef,
    currentReplay,
    input.parentCCall.transitionContractRef,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return failWorkflowTraversal(
      input,
      "workflow-blocked-route-proposal",
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      proposal as unknown as JsonValue,
    );
  }
  const route = admitRoute(
    input.store,
    input.executionBasis,
    input.graph,
    input.workflowStep.sourceCursor,
    null,
    currentReplay,
    proposal,
    basis(input.clock, "workflow-blocked-route"),
    {
      cCall: input.parentCCall,
      judgmentRef,
      judgmentEventRef,
      reasonRef,
    },
  );
  if (route.kind !== "admitted_traversal_route" || route.runStoppedEventRef === null) {
    return failWorkflowTraversal(
      input,
      "workflow-blocked-route-admission",
      route.kind === "admitted_traversal_route"
        ? "diagnostic://abiogenesis/hog/run-stop-absent@5"
        : `diagnostic://abiogenesis/hog/${route.code}@5`,
      route as unknown as JsonValue,
    );
  }
  return completion("blocked", replay(input.store, {
    runId: input.openedTraversalScope.runId,
  }), {
    cCallRef: input.parentCCall.cCallRef,
    resultRef,
    judgmentRef,
    diagnosticRef: reasonRef,
  });
}

function completeFanOutWorkflowRoute(
  input: CompleteWorkflowTraversalInput,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
  fanOutCompletion: FanOutCompletionAdmission,
  continuationStep: TraversalStep,
): ExecutableTraversalCompletion {
  const application = input.fanOutApplication;
  if (application === undefined) {
    return failWorkflowTraversal(
      input,
      "fan-out-application",
      "diagnostic://abiogenesis/hog/fan-out-application-absent@5",
      fanOutCompletion as unknown as JsonValue,
    );
  }
  const completionReplay = replay(input.store, {
    runId: input.openedTraversalScope.runId,
  });
  const replayedCompletion = completionReplay.fanOutCompletions.find(
    (completionTruth) =>
      completionTruth.completionRef === fanOutCompletion.completionRef &&
      completionTruth.admissionEventRef ===
        fanOutCompletion.admissionEventRef,
  );
  if (replayedCompletion === undefined) {
    return failWorkflowTraversal(
      input,
      "fan-out-completion-replay",
      "diagnostic://abiogenesis/hog/fan-out-completion-replay-absent@5",
      fanOutCompletion as unknown as JsonValue,
    );
  }
  const proposal = proposeFanOutRoute(
    input.graph,
    application,
    continuationStep,
    input.parentCCall,
    replayedCompletion,
    completionReplay,
    input.closureContract.transitionContractRef,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return failWorkflowTraversal(
      input,
      "fan-out-route-proposal",
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      proposal as unknown as JsonValue,
    );
  }
  const route = admitRoute(
    input.store,
    input.executionBasis,
    input.graph,
    continuationStep.sourceCursor,
    continuationStep.targetCursor,
    completionReplay,
    proposal,
    basis(input.clock, "fan-out-route"),
    {
      cCall: input.parentCCall,
      application,
      completion: replayedCompletion,
    },
  );
  if (route.kind !== "admitted_traversal_route") {
    return failWorkflowTraversal(
      input,
      "fan-out-route-admission",
      `diagnostic://abiogenesis/hog/${route.code}@5`,
      route as unknown as JsonValue,
    );
  }
  if (replayedCompletion.completionKind === "partial_stop") {
    if (route.routeKind !== "blocked" || route.runStoppedEventRef === null) {
      return failWorkflowTraversal(
        input,
        "fan-out-partial-stop",
        "diagnostic://abiogenesis/hog/fan-out-run-stop-absent@5",
        route as unknown as JsonValue,
      );
    }
    return completion("blocked", replay(input.store, {
      runId: input.openedTraversalScope.runId,
    }), {
      cCallRef: input.parentCCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      diagnosticRef: judgment.reasonRef,
    });
  }
  if (route.routeKind !== "advance") {
    return failWorkflowTraversal(
      input,
      "fan-out-complete-route",
      "diagnostic://abiogenesis/hog/fan-out-advance-absent@5",
      route as unknown as JsonValue,
    );
  }
  const nextCursor = applyRoute(continuationStep, route);
  if (nextCursor.kind === "traversal_refusal") {
    return failWorkflowTraversal(
      input,
      "fan-out-route-application",
      `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
      nextCursor as unknown as JsonValue,
    );
  }
  return completion("advanced", replay(input.store, {
    runId: input.openedTraversalScope.runId,
  }), {
    cCallRef: input.parentCCall.cCallRef,
    resultRef: replayedCompletion.outputVectorRef,
    judgmentRef: judgment.judgmentRef,
    nextCursor,
    resultValue: replayedCompletion.outputVector,
    continuationKind: "advance",
    nextInputContractRef: replayedCompletion.outputVectorContractRef,
  });
}

export function completeWorkflowPreparationRefusal(
  input: CompleteWorkflowPreparationRefusalInput,
): ExecutableTraversalCompletion {
  if (input.workflowStep.directStep.stepKind !== "enter_child") {
    return failWorkflowTraversal(
      input,
      "workflow-preparation-refusal-step",
      "diagnostic://abiogenesis/hog/workflow-step-mismatch@5",
      input.workflowStep as unknown as JsonValue,
    );
  }
  const admitted = admitChildPreparationRefusal(
    input.store,
    input.parentCCall,
    {
      kind: "child_preparation_refusal_candidate",
      schemaVersion: "5.0.0",
      childGraphFunctionRef: input.workflowStep.directStep.graphFunctionRef,
      inputRef: input.workflowStep.sourceCursor.inputRef,
      inputDigest: input.workflowStep.sourceCursor.inputDigest,
      stage: input.preparationRefusal.stage,
      diagnosticRef: input.preparationRefusal.diagnosticRef,
      message: input.preparationRefusal.message,
    },
    basis(input.clock, "child-preparation-refusal"),
  );
  if (admitted.kind !== "child_preparation_refusal_admission") {
    return failWorkflowTraversal(
      input,
      "workflow-preparation-refusal-admission",
      `diagnostic://abiogenesis/hog/${admitted.code}@5`,
      admitted as unknown as JsonValue,
    );
  }
  const rejected = completeRejectedCCall(
    input.store,
    input.parentCCall,
    admitted.admissionRejection,
    {
      ...basis(input.clock, "child-preparation-rejection"),
      causationEventRefs: [admitted.admissionEventRef],
    },
  );
  return completeBlockedWorkflowTraversal(
    input,
    rejected.refusalResultRef,
    rejected.rejectionJudgmentRef,
    rejected.judgmentEventRef,
    input.preparationRefusal.diagnosticRef,
  );
}

export function completeWorkflowTraversal(
  input: CompleteWorkflowTraversalInput,
): ExecutableTraversalCompletion {
  if (
    input.parentCCall.callClass !== "workflow" ||
    input.workflowStep.directStep.stepKind !== "enter_child" ||
    input.childCompletion.resultRef === null ||
    input.childCompletion.judgmentRef === null ||
    input.childCompletion.resultValue === null ||
    (input.childCompletion.disposition !== "closed" &&
      input.childCompletion.disposition !== "blocked")
  ) {
    return failWorkflowTraversal(
      input,
      "workflow-child-completion",
      "diagnostic://abiogenesis/hog/child-completion-incomplete@5",
      input.childCompletion as unknown as JsonValue,
    );
  }
  const foldback = admitChildFoldback(
    input.store,
    input.parentCCall,
    input.childExecutionBasis,
    input.childTraversalScope,
    {
      childResultRef: input.childCompletion.resultRef,
      childJudgmentRef: input.childCompletion.judgmentRef,
      childClosureRef: input.childCompletion.closureRef,
    },
    basis(input.clock, "child-foldback"),
  );
  if (foldback.kind !== "child_foldback_admission") {
    return failWorkflowTraversal(
      input,
      "workflow-child-foldback",
      `diagnostic://abiogenesis/hog/${foldback.code}@5`,
      foldback as unknown as JsonValue,
    );
  }
  const childSucceeded = input.childCompletion.disposition === "closed";
  const childValue = childSucceeded
    ? input.successResultValue ?? input.childCompletion.resultValue
    : input.childCompletion.resultValue;
  const evidence = admitEvidence(
    input.store,
    input.parentCCall,
    deriveSubTraversalEvidence(
      input.parentCCall,
      foldback,
      input.inputDigest,
      sha256Canonical(childValue),
    ),
    input.parentCCall.evidenceContractRef,
    input.inputDigest,
    basis(input.clock, "sub-traversal-evidence"),
  );
  if (evidence.kind === "c_call_admission_rejection") {
    const rejected = completeRejectedCCall(
      input.store,
      input.parentCCall,
      evidence,
      basis(input.clock, "sub-traversal-evidence-rejection"),
    );
    return completeBlockedWorkflowTraversal(
      input,
      rejected.refusalResultRef,
      rejected.rejectionJudgmentRef,
      rejected.judgmentEventRef,
      evidence.diagnosticRef,
    );
  }
  const result = admitResult(
    input.store,
    input.parentCCall,
    childValue,
    childSucceeded ? "success" : "failure",
    childSucceeded
      ? input.parentCCall.outputContractRef
      : input.parentCCall.failureContractRef,
    childSucceeded ? input.resultValueKind : input.failureValueKind,
    childSucceeded
      ? input.validateSuccessResult
      : (value) => isRecord(value) &&
        value.kind === input.failureValueKind &&
        value.schemaVersion === "5.0.0",
    [evidence],
    basis(input.clock, "workflow-result"),
  );
  if (result.kind === "c_call_admission_rejection") {
    const rejected = completeRejectedCCall(
      input.store,
      input.parentCCall,
      result,
      basis(input.clock, "workflow-result-rejection"),
    );
    return completeBlockedWorkflowTraversal(
      input,
      rejected.refusalResultRef,
      rejected.rejectionJudgmentRef,
      rejected.judgmentEventRef,
      result.diagnosticRef,
    );
  }
  const resultReplay = replay(input.store, { runId: input.openedTraversalScope.runId });
  const judgmentCandidate = childSucceeded
    ? proposeJudgment(
        input.parentCCall,
        result,
        resultReplay,
        input.input,
        input.judgmentRelation,
        input.parentCCall.judgmentContractRef,
      )
    : proposeFailureJudgment(
        input.parentCCall,
        result,
        resultReplay,
        input.childCompletion.diagnosticRef ??
          "diagnostic://abiogenesis/hog/child-traversal-blocked@5",
        input.parentCCall.judgmentContractRef,
      );
  const judgment = admitJudgment(
    input.store,
    input.parentCCall,
    result,
    judgmentCandidate,
    resultReplay,
    basis(input.clock, "workflow-judgment"),
  );
  if (judgment.kind === "c_call_admission_rejection") {
    const rejected = completeRejectedCCall(
      input.store,
      input.parentCCall,
      judgment,
      basis(input.clock, "workflow-judgment-rejection"),
    );
    return completeBlockedWorkflowTraversal(
      input,
      rejected.refusalResultRef,
      rejected.rejectionJudgmentRef,
      rejected.judgmentEventRef,
      judgment.diagnosticRef,
    );
  }
  const fanOutEnabled =
    input.fanOutApplication !== undefined &&
    input.validateFanOutVector !== undefined;
  if (
    (input.fanOutApplication === undefined) !==
      (input.validateFanOutVector === undefined)
  ) {
    return failWorkflowTraversal(
      input,
      "fan-out-context",
      "diagnostic://abiogenesis/hog/fan-out-context-incomplete@5",
      { cCallRef: input.parentCCall.cCallRef },
    );
  }
  if (judgment.judgment !== "advance") {
    if (fanOutEnabled) {
      const fanOutCompletion = admitFanOutCompletion({
        store: input.store,
        executionBasis: input.executionBasis,
        graph: input.graph,
        application: input.fanOutApplication!,
        sourceCursor: input.workflowStep.sourceCursor,
        replayState: replay(input.store, {
          runId: input.openedTraversalScope.runId,
        }),
        completionKind: "partial_stop",
        validateOutputVector: input.validateFanOutVector!,
        basis: basis(input.clock, "fan-out-partial-stop"),
      });
      if (fanOutCompletion.kind !== "fan_out_completion_admission") {
        return failWorkflowTraversal(
          input,
          "fan-out-partial-stop-admission",
          `diagnostic://abiogenesis/hog/${fanOutCompletion.code}@5`,
          fanOutCompletion as unknown as JsonValue,
        );
      }
      return completeFanOutWorkflowRoute(
        input,
        result,
        judgment,
        fanOutCompletion,
        input.workflowStep,
      );
    }
    return completeBlockedWorkflowTraversal(
      input,
      result.resultRef,
      judgment.judgmentRef,
      judgment.admissionEventRef,
      judgment.reasonRef,
    );
  }
  const continuationStep = deriveCompletedTraversalStep(
    input.graph,
    input.workflowStep.sourceCursor,
    { inputRef: result.resultRef, inputDigest: result.valueDigest },
  );
  if (continuationStep.kind !== "traversal_step") {
    return failWorkflowTraversal(
      input,
      "workflow-continuation",
      `diagnostic://abiogenesis/hog/${continuationStep.code}@5`,
      continuationStep as unknown as JsonValue,
    );
  }
  if (
    fanOutEnabled &&
    continuationStep.directStep.stepKind === "continue_term" &&
    continuationStep.directStep.relation === "compose_next"
  ) {
    const fanOutCompletion = admitFanOutCompletion({
      store: input.store,
      executionBasis: input.executionBasis,
      graph: input.graph,
      application: input.fanOutApplication!,
      sourceCursor: input.workflowStep.sourceCursor,
      replayState: replay(input.store, {
        runId: input.openedTraversalScope.runId,
      }),
      completionKind: "complete_vector",
      validateOutputVector: input.validateFanOutVector!,
      basis: basis(input.clock, "fan-out-complete-vector"),
    });
    if (
      fanOutCompletion.kind !== "fan_out_completion_admission" ||
      fanOutCompletion.completionKind !== "complete_vector"
    ) {
      return failWorkflowTraversal(
        input,
        "fan-out-complete-vector-admission",
        fanOutCompletion.kind === "fan_out_completion_admission"
          ? "diagnostic://abiogenesis/hog/fan-out-completion-kind-mismatch@5"
          : `diagnostic://abiogenesis/hog/${fanOutCompletion.code}@5`,
        fanOutCompletion as unknown as JsonValue,
      );
    }
    const fanInStep = deriveCompletedTraversalStep(
      input.graph,
      input.workflowStep.sourceCursor,
      {
        inputRef: fanOutCompletion.outputVectorRef,
        inputDigest: fanOutCompletion.outputVectorDigest,
      },
    );
    if (fanInStep.kind !== "traversal_step") {
      return failWorkflowTraversal(
        input,
        "fan-in-continuation",
        `diagnostic://abiogenesis/hog/${fanInStep.code}@5`,
        fanInStep as unknown as JsonValue,
      );
    }
    return completeFanOutWorkflowRoute(
      input,
      result,
      judgment,
      fanOutCompletion,
      fanInStep,
    );
  }
  const judgedReplay = replay(input.store, { runId: input.openedTraversalScope.runId });
  const routeCandidate = proposeJudgedRoute(
    input.graph,
    continuationStep,
    input.parentCCall,
    result,
    judgment,
    judgedReplay,
    input.closureContract.transitionContractRef,
  );
  if (routeCandidate.kind !== "traversal_route_candidate") {
    return failWorkflowTraversal(
      input,
      "workflow-route-proposal",
      `diagnostic://abiogenesis/hog/${routeCandidate.code}@5`,
      routeCandidate as unknown as JsonValue,
    );
  }
  const route = admitRoute(
    input.store,
    input.executionBasis,
    input.graph,
    input.workflowStep.sourceCursor,
    continuationStep.targetCursor,
    judgedReplay,
    routeCandidate,
    basis(input.clock, "workflow-route"),
    { cCall: input.parentCCall, result, judgment },
  );
  if (route.kind !== "admitted_traversal_route") {
    return failWorkflowTraversal(
      input,
      "workflow-route-admission",
      `diagnostic://abiogenesis/hog/${route.code}@5`,
      route as unknown as JsonValue,
    );
  }
  if (route.routeKind === "advance") {
    const nextCursor = applyRoute(continuationStep, route);
    if (nextCursor.kind === "traversal_refusal") {
      return failWorkflowTraversal(
        input,
        "workflow-route-application",
        `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
        nextCursor as unknown as JsonValue,
      );
    }
    return completion("advanced", replay(input.store, {
      runId: input.openedTraversalScope.runId,
    }), {
      cCallRef: input.parentCCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      nextCursor,
      resultValue: result.value,
      continuationKind: "advance",
      nextInputContractRef: input.parentCCall.outputContractRef,
    });
  }
  if (route.routeKind !== "terminal") {
    return failWorkflowTraversal(
      input,
      "workflow-route-kind",
      "diagnostic://abiogenesis/hog/unexpected-workflow-route@5",
      route as unknown as JsonValue,
    );
  }
  const closureReplay = replay(input.store, {
    runId: input.openedTraversalScope.runId,
  });
  if (input.terminalMode === "return_to_parent") {
    const childClosure = admitChildClosure(
      input.store,
      input.openedTraversalScope,
      input.parentCCall,
      result,
      judgment,
      route,
      closureReplay,
      input.closureContract,
      basis(input.clock, "workflow-child-closure"),
    );
    if (childClosure.kind !== "child_closure_admission") {
      return failWorkflowTraversal(
        input,
        "workflow-child-closure",
        `diagnostic://abiogenesis/hog/${childClosure.code}@5`,
        childClosure as unknown as JsonValue,
      );
    }
    return completion("closed", replay(input.store, {
      runId: input.openedTraversalScope.runId,
    }), {
      cCallRef: input.parentCCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      closureRef: childClosure.closureRef,
      resultValue: result.value,
    });
  }
  const closure = admitClosure(
    input.store,
    input.parentCCall,
    result,
    judgment,
    route,
    closureReplay,
    input.closureContract,
    basis(input.clock, "workflow-closure"),
  );
  if (closure.kind !== "closure_admission") {
    return failWorkflowTraversal(
      input,
      "workflow-closure",
      `diagnostic://abiogenesis/hog/${closure.code}@5`,
      closure as unknown as JsonValue,
    );
  }
  return completion("closed", replay(input.store, {
    runId: input.openedTraversalScope.runId,
  }), {
    cCallRef: input.parentCCall.cCallRef,
    resultRef: result.resultRef,
    judgmentRef: judgment.judgmentRef,
    closureRef: closure.closureRef,
    resultValue: result.value,
  });
}
