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
  admitPlannedPendingInteraction,
  admitResult,
  admitRecursionRoute,
  admitRuntimeFailure,
  admitRoute,
  completeRejectedCCall,
  deriveProbabilisticTransportEvidence,
  deriveSubTraversalEvidence,
  hasCurrentDeferredApplicationAuthority,
  openCCall,
  openInteractionCCall,
  planPendingInteractionAdmission,
  projectAdmittedLeafCCallOutcome,
  projectCurrentDeferredApplication,
  projectedCCallResultValue,
  replay,
  traversalCursorAdmissionEventRef,
  WORKER_TRANSPORT_FAILURE_CLASS_VALUES,
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
  type CCall,
  type ExecutionBasis,
  type GraphSpanReentryProjection,
  type ContinuationProductBasis,
  type FhInteractionResumeAdmission,
  type FanOutCompletionAdmission,
  type OpenedTraversalScope,
  type ReplayState,
  type RuntimeAdmissionBasis,
  invokeActorProcess,
} from "../abg/index.js";
import {
  admitRuntimeEventTransactionAtExpectedPrefix,
  assertHeldEventStoreAtRuntimeEventPrefix,
  selectHeldEventStoreDurablePrefix,
} from "../abg/event_store.js";
import {
  admitRetryRuntimeFailureTransitionInActiveTransaction,
  projectDeclaredCRetryFrontier,
  type RetryRuntimeFailureTransitionAdmission,
  type RetryStoppedProgressAdmission,
} from "../abg/retry.js";
import {
  selectValidatedRuntimeEventPrefix,
  validatedRuntimeEventPrefixThroughEvent,
} from "../abg/event_prefix.js";
import {
  type CCallRuntimeFailureSource,
} from "../abg/c_call.js";
import type {
  LeafInvocationPort,
  ProbabilisticLeafEffectPort,
  ProbabilisticWorkerRequest,
} from "../implementation/contracts.js";
import { isAdmittedLeafInvocationPort } from "./leaf_invocation_port.js";
import type {
  ClosureContract,
  FanOutApplication,
  GraphFunction,
  GtlGraph,
  GtlProgram,
  RecurseApplication,
} from "../gtl/contracts.js";
import type { CWorkflowNode } from "../gtl/c_algebra.js";
import {
  recursionTerminationDecision,
} from "../gtl/graph_applications.js";
import { deriveCSourceContinuation } from "../gtl/source_path.js";
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
  proposeFailedRoute,
  proposeFanOutRoute,
  proposeGapStopRoute,
  proposeGraphSpanReentryRoute,
  proposeHoldRoute,
  proposeInteractionResumeRoute,
  proposeRecursionRoute,
  proposeWorkflowBlockedRoute,
} from "./traversal_route.js";
import {
  applyAdmittedRoute,
  applyRecursionRoute,
  deriveCompletedTraversalCursor,
  deriveGraphSpanReentryCursor,
  deriveInteractionSuccessorInputCarrierRef,
  deriveRecursionReentryCursor,
  type ExecutableTraversalStopRef,
  type InteractionTraversalStopRef,
  type TraversalCursor,
} from "./traversal.js";
import { admitSuccessfulRetryExitRoute } from "./retry_exit.js";
import { admitProbabilisticResultCandidate } from "./probabilistic_result_admission.js";

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

export type CompleteExecutableTraversalResult =
  | ExecutableTraversalCompletion
  | RetryRuntimeFailureTransitionAdmission;

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

export interface CompleteInteractionTraversalInput {
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
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

export interface CompleteExecutableTraversalInput<
  Input,
  Output,
> {
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly traversalStop: ExecutableTraversalStopRef;
  readonly implementationSet: AdmittedImplementationSet;
  readonly implementationResolution: AdmittedImplementationResolutionRow;
  readonly leafPort: LeafInvocationPort;
  readonly input: Readonly<Input>;
  readonly inputDigest: `sha256:${string}`;
  readonly closureContract: Readonly<ClosureContract>;
  readonly actorRuntimeBinding?: ActorRuntimeBinding;
  readonly deferFailedRunStop?: boolean;
  readonly terminalMode?:
    | "close_run"
    | "return_to_application"
    | "return_to_parent";
  readonly applicationCompletionMode?: "close_run" | "return_to_parent";
  readonly clock: ExecutableTraversalClock;
}

export interface CompleteDeferredRecursionInput {
  readonly completion: ExecutableTraversalCompletion;
  readonly restoration: RestoreDeferredRecursionInput;
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
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly workflowCursor: TraversalCursor;
  readonly workflowTerm: Readonly<CWorkflowNode>;
  readonly parentCCall: CCall;
  readonly terminalMode?: "close_run" | "return_to_parent";
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
  readonly targetCursor: TraversalCursor | null;
}

export interface RestoreDeferredRecursionInput {
  readonly traversalInput: CompleteExecutableTraversalInput<
    Readonly<Record<string, JsonValue>>,
    Readonly<Record<string, JsonValue>>
  >;
  readonly application: Readonly<RecurseApplication>;
  readonly cCallRef: string;
  readonly resultRef: string;
  readonly judgmentRef: string;
}

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
  restoration: RestoreDeferredRecursionInput;
  childExecutionBasis: ExecutionBasis;
  childTraversalScope: OpenedTraversalScope;
  childInput: Readonly<Record<string, JsonValue>>;
  childInputDigest: `sha256:${string}`;
  childCompletion: ExecutableTraversalCompletion;
  terminalMode: "close_run" | "return_to_parent";
}>): ExecutableTraversalCompletion {
  const state = requireDeferredApplicationState(
    input.deferredCompletion,
    input.restoration,
  );
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
    input.graphFunction,
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
  const pendingBasis = basis(input.clock, "fh-pending");
  const pendingPlan = planPendingInteractionAdmission(
    input.store,
    input.graph,
    input.graphFunction,
    input.traversalStop.cursor,
    opened.cCall,
    input.input,
    input.inputDigest,
    pendingBasis,
  );
  const { value: { continuation, pending } } =
    admitRuntimeEventTransactionAtExpectedPrefix(
    input.store,
    pendingPlan.expectedPrefixDigest,
    () => {
      const pending = admitPlannedPendingInteraction(
        input.store,
        input.graph,
        input.graphFunction,
        input.traversalStop.cursor,
        opened.cCall,
        input.input,
        input.inputDigest,
        pendingPlan,
        pendingBasis,
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
          graphFunction: input.graphFunction,
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
  const successorInputContractRef =
    deriveInteractionSuccessorInputCarrierRef(
      input.graph,
      input.heldInteraction.cursor,
    );
  if (
    successorInputContractRef !== input.resume.successorInputContractRef ||
    (successorInputContractRef === null) !==
      (input.resume.successorInputValueKind === null)
  ) {
    throw new TypeError(
      "F_H resume persisted successor carrier differs from direct GTL continuation",
    );
  }
  const continuationCursor = deriveCompletedTraversalCursor(
    input.graph,
    input.successorCursor,
    {
      inputRef: input.resume.successorInputRef,
      inputDigest: input.resume.successorInputDigest,
    },
  );
  if (
    continuationCursor !== null &&
    continuationCursor.kind === "traversal_refusal"
  ) {
    throw new TypeError(
      `F_H resume continuation refused: ${continuationCursor.code}: ${continuationCursor.message}`,
    );
  }
  const successfulRoute = admitSuccessfulRetryExitRoute({
    store: input.store,
    executionBasis: input.executionBasis,
    graphFunction: input.graphFunction,
    graph: input.graph,
    sourceCursor: input.successorCursor,
    targetCursor: continuationCursor,
    variant: {
      completionClass: "fh_resume_success",
      cCall,
      result,
      judgment,
      resume: input.resume,
      transitionContractRef: cCall.transitionContractRef,
      authority: {
        openedTraversalScope: input.openedTraversalScope,
        program: input.program,
        interactionSet: input.interactionSet,
        heldCursor: input.heldInteraction.cursor,
      },
    },
    basis: basis(input.clock, "fh-resume-successful-retry-exit"),
  });
  if (successfulRoute.kind !== "successful_retry_exit_route_admission") {
    throw new TypeError(
      `F_H resume route admission refused: ${successfulRoute.code}`,
    );
  }
  const route = successfulRoute.route;
  if (route.routeKind === "advance") {
    if (successorInputContractRef === null) {
      throw new TypeError("F_H advance has no successor input carrier");
    }
    if (continuationCursor === null) {
      throw new TypeError("F_H advance has no continuation cursor");
    }
    const nextCursor = applyAdmittedRoute(
      input.successorCursor,
      continuationCursor,
      "advance",
      route,
    );
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
        nextInputContractRef: successorInputContractRef,
      },
    );
  }
  if (route.routeKind !== "terminal") {
    throw new TypeError(
      `F_H resume admitted unexpected route ${route.routeKind}`,
    );
  }
  const closure = admitInteractionClosure(
    input.store,
    selectHeldEventStoreDurablePrefix(input.store),
    cCall,
    result,
    judgment,
    input.resume,
    route,
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
    readonly stoppedProgresses?: readonly RetryStoppedProgressAdmission[];
  },
): ExecutableTraversalCompletion {
  const resultValue = projectedCCallResultValue(input.store, {
    runId: cCall.runId,
    cCallRef: cCall.cCallRef,
    resultRef: values.resultRef,
  });
  const currentReplay = replayRun(input);
  const proposal = proposeBlockedRoute(
    input.graph,
    input.traversalStop,
    cCall,
    values.judgmentRef,
    currentReplay,
    cCall.transitionContractRef,
    values.stoppedProgresses?.map((progress) => progress.progressRef) ?? [],
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
        causationEventRefs: [
          values.stoppedProgresses?.at(-1)?.admissionEventRef ??
            values.judgmentEventRef,
        ],
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
      graphFunction: input.graphFunction,
      cCall,
      resultRef: values.resultRef,
      judgmentRef: values.judgmentRef,
      judgmentEventRef: values.judgmentEventRef,
      reasonRef: values.reasonRef,
      ...(values.stoppedProgresses === undefined
        ? {}
        : { stoppedProgresses: values.stoppedProgresses }),
    },
    { terminalizeRun: input.terminalMode !== "return_to_parent" },
  );
  const routePrefix = route.kind === "admitted_traversal_route"
    ? validatedRuntimeEventPrefixThroughEvent(
        selectValidatedRuntimeEventPrefix(input.store.readAll()),
        route.admissionEventRef,
      )
    : null;
  const stoppedProgressConsumed = values.stoppedProgresses === undefined
    ? true
    : routePrefix !== null && values.stoppedProgresses.every((progress) => {
      const frontier = projectDeclaredCRetryFrontier(
        routePrefix,
        input.graph,
        input.traversalStop.cursor,
        input.graphFunction,
        progress.retryPath.length,
      );
      return frontier?.state === "progress_consumed" &&
        sha256Canonical(frontier.consumed.progress as unknown as JsonValue) ===
          sha256Canonical(progress as unknown as JsonValue);
    });
  if (
    route.kind !== "admitted_traversal_route" ||
    !stoppedProgressConsumed ||
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
        causationEventRefs: [
          values.stoppedProgresses?.at(-1)?.admissionEventRef ??
            values.judgmentEventRef,
        ],
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

function completeFailedTraversal<Input, Output>(
  input: CompleteExecutableTraversalInput<Input, Output>,
  cCall: CCall,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
  reasonRef: string,
): ExecutableTraversalCompletion {
  const deferDeclaredFanOutStop =
    input.deferFailedRunStop === true &&
    input.traversalStop.computeRegime === "F_D" &&
    isRecord(result.value) &&
    result.value.failureClass === "implementation_exception";
  const currentReplay = replayRun(input);
  const proposal = proposeFailedRoute(
    input.graph,
    input.traversalStop,
    cCall,
    result,
    judgment,
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
        ...basis(input.clock, "failed-route-proposal-refusal"),
        causationEventRefs: [judgment.admissionEventRef],
      },
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
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
    basis(input.clock, "failed-route"),
    { graphFunction: input.graphFunction, cCall, result, judgment },
    { terminalizeRun: !deferDeclaredFanOutStop },
  );
  if (
    route.kind !== "admitted_traversal_route" ||
    route.routeKind !== "failed" ||
    (!deferDeclaredFanOutStop && route.runStoppedEventRef === null)
  ) {
    const diagnosticRef = route.kind === "admitted_traversal_route"
      ? "diagnostic://abiogenesis/hog/failed-run-stop-absent@5"
      : `diagnostic://abiogenesis/hog/${route.code}@5`;
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "route",
      route as unknown as JsonValue,
      diagnosticRef,
      {
        ...basis(input.clock, "failed-route-admission-refusal"),
        causationEventRefs: [judgment.admissionEventRef],
      },
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      diagnosticRef,
    });
  }
  return completion("failed", replayRun(input), {
    cCallRef: cCall.cCallRef,
    resultRef: result.resultRef,
    judgmentRef: judgment.judgmentRef,
    resultValue: result.value,
    diagnosticRef: reasonRef,
  });
}

class ExecutableTransitionRefusal extends TypeError {
  constructor(
    readonly diagnosticRef: string,
    readonly candidate: JsonValue,
  ) {
    super(`executable transition refused: ${diagnosticRef}`);
  }
}

function completeRuntimeFailureTransition<Input, Output>(
  input: CompleteExecutableTraversalInput<Input, Output>,
  cCall: CCall,
  source: CCallRuntimeFailureSource,
  failureCandidate: JsonValue,
  failureValueKind: string,
) {
  if (
    source.kind === "c_call_admission_rejection" &&
    input.leafPort.validateContractValue(
      cCall.outputContractRef,
      "output",
      failureCandidate,
    )
  ) {
    const diagnosticRef =
      "diagnostic://abiogenesis/hog/result-contract-rejection-not-reproduced@5";
    throw new ExecutableTransitionRefusal(diagnosticRef, {
      cCallRef: cCall.cCallRef,
      contractRef: cCall.outputContractRef,
    });
  }
  const transitionSnapshot = input.store.readAll();
  const transitionPrefix = selectValidatedRuntimeEventPrefix(
    transitionSnapshot,
  );
  const transition = admitRetryRuntimeFailureTransitionInActiveTransaction(
    input.store,
    transitionPrefix,
    input.executionBasis,
    input.graph,
    input.graphFunction,
    input.traversalStop.cursor,
    cCall,
    source,
    failureCandidate,
    failureValueKind,
    basis(input.clock, "retry-runtime-failure-transition"),
  );
  if (transition.kind !== "retry_runtime_failure_transition_admission") {
    const diagnosticRef =
      `diagnostic://abiogenesis/hog/${transition.code}@5`;
    throw new ExecutableTransitionRefusal(
      diagnosticRef,
      transition as unknown as JsonValue,
    );
  }
  if (transition.disposition === "retry") {
    if (transition.progress.progressClass !== "retry") {
      throw new TypeError("admitted retry transition has non-retry progress");
    }
    if (transition.stoppedProgresses.length !== 0) {
      throw new TypeError("admitted retry transition has stopped progress");
    }
    return deepFreeze({
      kind: "staged_retry_runtime_failure_transition" as const,
      transition,
    });
  }
  if (transition.progress.progressClass !== "stopped") {
    throw new TypeError(
      "admitted blocked transition has non-stopped progress",
    );
  }
  const blocked = completeBlockedTraversal(input, cCall, {
    resultRef: transition.close.result.resultRef,
    judgmentRef: transition.close.judgment.judgmentRef,
    judgmentEventRef: transition.close.judgment.admissionEventRef,
    reasonRef: transition.close.judgment.reasonRef,
    stoppedProgresses: transition.stoppedProgresses,
  });
  if (blocked.disposition !== "blocked") {
    const diagnosticRef = blocked.diagnosticRef ??
      "diagnostic://abiogenesis/hog/blocked-route-refusal@5";
    throw new ExecutableTransitionRefusal(
      diagnosticRef,
      blocked as unknown as JsonValue,
    );
  }
  return blocked;
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

export function isLeafCandidate<Output>(
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
): Promise<CompleteExecutableTraversalResult> {
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
    input.graphFunction,
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
  let probabilisticRequest: Readonly<ProbabilisticWorkerRequest> | null = null;
  let dispatchCount = 0;
  const probabilisticEffects: ProbabilisticLeafEffectPort | null = computeRegime === "F_P"
    ? input.actorRuntimeBinding === undefined ||
        probabilisticWorkerContracts === null
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
            probabilisticRequest = request;
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
  const probabilisticAdmission = computeRegime === "F_P" &&
      actorObservation !== null && probabilisticRequest !== null
    ? admitProbabilisticResultCandidate({
        leafPort: input.leafPort,
        occurrence: probabilisticEffects!.occurrence,
        resolution: input.implementationResolution,
        input: input.input as Readonly<Record<string, JsonValue>>,
        request: probabilisticRequest,
        observation: actorObservation,
      })
    : null;
  const probabilisticAdmissionMatchesTarget =
    probabilisticAdmission?.kind ===
      "contract_admitted_probabilistic_result_candidate" &&
    probabilisticAdmission.rawResultContractRef ===
      probabilisticWorkerContracts?.resultContractRef &&
    probabilisticAdmission.targetOutputContractRef === cCall.outputContractRef &&
    probabilisticAdmission.inputDigest === input.inputDigest;
  const stageExecutableTransition = () => {
  const evidenceCandidates: readonly CCallEvidenceCandidate[] = computeRegime === "F_P"
    ? actorObservation === null ||
        probabilisticRequest === null ||
        (actorObservation.disposition === "success" &&
          probabilisticAdmission?.kind !==
            "contract_admitted_probabilistic_result_candidate")
      ? []
        : [deriveProbabilisticTransportEvidence(
          cCall,
          probabilisticRequest,
          actorObservation,
          probabilisticAdmission?.kind ===
              "contract_admitted_probabilistic_result_candidate"
            ? probabilisticAdmission
            : null,
          leaf.resultCandidate as unknown as JsonValue,
          probabilisticWorkerContracts!.instructionContractRef,
          probabilisticWorkerContracts!.resultContractRef,
        )]
    : leaf.evidenceCandidates;
  const evidence: AdmittedCCallEvidence[] = [];
  for (const candidate of evidenceCandidates) {
    const admitted = admitEvidence(
      input.store,
      input.graph,
      input.graphFunction,
      input.traversalStop.cursor,
      cCall,
      candidate,
      cCall.evidenceContractRef,
      input.inputDigest,
      basis(input.clock, "evidence"),
      probabilisticWorkerContracts?.instructionContractRef,
      probabilisticWorkerContracts?.resultContractRef,
      computeRegime === "F_P" &&
          probabilisticRequest !== null &&
          actorObservation !== null
        ? {
            request: probabilisticRequest,
            observation: actorObservation,
            admittedResultCarrier:
              probabilisticAdmission?.kind ===
                  "contract_admitted_probabilistic_result_candidate"
                ? probabilisticAdmission
                : null,
          }
        : null,
    );
    if (admitted.kind === "c_call_admission_rejection") {
      const rejected = completeRejectedCCall(
        input.store,
        input.graph,
        input.graphFunction,
        input.traversalStop.cursor,
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
  const probabilisticFailureSource = evidence.length === 1 &&
      evidence[0]!.evidenceClass === "probabilistic_transport" &&
      evidence[0]!.transportDisposition === "failure" &&
      typeof evidence[0]!.transportFailureClass === "string" &&
      WORKER_TRANSPORT_FAILURE_CLASS_VALUES.some((failureClass) =>
        failureClass === evidence[0]!.transportFailureClass
      )
    ? evidence[0]!
    : null;
  if (
    leaf.disposition === "failure" && cCall.retryPath.length > 0 &&
    probabilisticFailureSource !== null
  ) {
    return completeRuntimeFailureTransition(
      input,
      cCall,
      probabilisticFailureSource,
      leaf.resultCandidate as unknown as JsonValue,
      failureValueKind,
    );
  }
  const result = admitResult(
    input.store,
    input.graph,
    input.graphFunction,
    input.traversalStop.cursor,
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
        (computeRegime !== "F_P" || probabilisticAdmissionMatchesTarget) &&
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
      !validateSuccessCandidate(leaf.resultCandidate) &&
      cCall.retryPath.length > 0
    ) {
      return completeRuntimeFailureTransition(
        input,
        cCall,
        result,
        leaf.resultCandidate as unknown as JsonValue,
        failureValueKind,
      );
    }
    const rejected = completeRejectedCCall(
      input.store,
      input.graph,
      input.graphFunction,
      input.traversalStop.cursor,
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
    input.graph,
    input.graphFunction,
    input.traversalStop.cursor,
    cCall,
    result,
    judgmentCandidate,
    resultReplay,
    basis(input.clock, "judgment"),
  );
  if (judgment.kind === "c_call_admission_rejection") {
    const rejected = completeRejectedCCall(
      input.store,
      input.graph,
      input.graphFunction,
      input.traversalStop.cursor,
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
  if (leaf.disposition === "failure") {
    return completeFailedTraversal(
      input,
      cCall,
      result,
      judgment,
      leaf.diagnosticRef,
    );
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
      { graphFunction: input.graphFunction, cCall, result, judgment },
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
    const targetCursor = application?.relationKind === "re_enter"
      ? deriveGraphSpanReentryCursor(
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
      targetCursor === null ||
      targetInputContractRef === null ||
      targetCursor.kind === "traversal_refusal"
    ) {
      const code = targetCursor === null
        ? "graph_span_reentry_not_declared"
        : targetCursor.kind === "traversal_refusal"
          ? targetCursor.code
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
      input.traversalStop.cursor,
      targetCursor,
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
      targetCursor,
      judgedReplay,
      proposal,
      basis(input.clock, "graph-span-reentry-route"),
      { graphFunction: input.graphFunction, cCall, result, judgment },
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
    const nextCursor = applyAdmittedRoute(
      input.traversalStop.cursor,
      targetCursor,
      "re_enter",
      route,
    );
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
  const continuationCursor = deriveCompletedTraversalCursor(
    input.graph,
    input.traversalStop.cursor,
    {
      inputRef: result.resultRef,
      inputDigest: result.valueDigest,
    },
  );
  if (
    continuationCursor !== null &&
    continuationCursor.kind === "traversal_refusal"
  ) {
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "route",
      continuationCursor as unknown as JsonValue,
      `diagnostic://abiogenesis/hog/${continuationCursor.code}@5`,
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
      diagnosticRef: `diagnostic://abiogenesis/hog/${continuationCursor.code}@5`,
    });
  }
  if (input.terminalMode === "return_to_application") {
    return completion("application_ready", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      resultValue: result.value,
    });
  }
  const successfulRoute = admitSuccessfulRetryExitRoute({
    store: input.store,
    executionBasis: input.executionBasis,
    graphFunction: input.graphFunction,
    graph: input.graph,
    sourceCursor: input.traversalStop.cursor,
    targetCursor: continuationCursor,
    variant: {
      completionClass: "judged_success",
      cCall,
      result,
      judgment,
      transitionContractRef: input.closureContract.transitionContractRef,
    },
    basis: basis(input.clock, "successful-retry-exit"),
  });
  if (successfulRoute.kind !== "successful_retry_exit_route_admission") {
    admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "route",
      successfulRoute.candidate,
      `diagnostic://abiogenesis/hog/${successfulRoute.code}@5`,
      {
        ...basis(input.clock, "successful-route-refusal"),
        causationEventRefs: [judgment.admissionEventRef],
      },
    );
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      diagnosticRef: `diagnostic://abiogenesis/hog/${successfulRoute.code}@5`,
    });
  }
  const route = successfulRoute.route;
  if (route.routeKind === "advance") {
    if (continuationCursor === null) {
      return completion("failed", replayRun(input), {
        cCallRef: cCall.cCallRef,
        resultRef: result.resultRef,
        judgmentRef: judgment.judgmentRef,
        resultValue: result.value,
        diagnosticRef: "diagnostic://abiogenesis/hog/advance-target-absent@5",
      });
    }
    const nextCursor = applyAdmittedRoute(
      input.traversalStop.cursor,
      continuationCursor,
      "advance",
      route,
    );
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
  if (input.terminalMode === "return_to_parent") {
    const childClosure = admitChildClosure(
      input.store,
      selectHeldEventStoreDurablePrefix(input.store),
      input.openedTraversalScope,
      cCall,
      result,
      judgment,
      route,
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
    selectHeldEventStoreDurablePrefix(input.store),
    cCall,
    result,
    judgment,
    route,
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
  };
  const transitionEntryPrefix = selectValidatedRuntimeEventPrefix(
    input.store.readAll(),
  );
  const transitionEntryDigest = sha256Canonical(
    transitionEntryPrefix.events as unknown as JsonValue,
  );
  if (input.store.configuredDurableLogPath() !== null) {
    assertHeldEventStoreAtRuntimeEventPrefix(
      input.store,
      transitionEntryPrefix.events,
    );
  }
  try {
    const transaction = admitRuntimeEventTransactionAtExpectedPrefix(
      input.store,
      transitionEntryDigest,
      () => {
        const staged = stageExecutableTransition();
        if (staged.kind === "staged_retry_runtime_failure_transition") {
          return staged;
        }
        const current = replayRun(input);
        const admittedCCall = current.cCalls.find(
          (candidate) => candidate.cCallRef === cCall.cCallRef,
        );
        const admittedRoute = current.routes.find(
          (candidate) =>
            candidate.cCallRef === cCall.cCallRef &&
            candidate.judgmentRef === staged.judgmentRef,
        );
        const judged = admittedCCall?.status === "judged" &&
          admittedCCall.resultRef === staged.resultRef &&
          admittedCCall.judgmentRef === staged.judgmentRef;
        const consequenceComplete =
          staged.disposition === "application_ready"
            ? judged && admittedRoute === undefined
            : staged.disposition === "advanced"
              ? judged && admittedRoute?.routeKind === "advance"
              : staged.disposition === "closed"
                ? judged && admittedRoute?.routeKind === "terminal" &&
                  staged.closureRef !== null &&
                  (input.terminalMode === "return_to_parent" ||
                    current.runClosedEventRef !== null)
                : staged.disposition === "blocked"
                  ? judged && admittedRoute?.routeKind === "blocked" &&
                    (input.terminalMode === "return_to_parent" ||
                      current.runStoppedEventRef !== null)
                  : staged.disposition === "failed"
                    ? judged && admittedRoute?.routeKind === "failed" &&
                      (input.deferFailedRunStop === true ||
                        current.runStoppedEventRef !== null)
                    : staged.disposition === "gap_stop"
                      ? judged && admittedRoute?.routeKind === "gap_stop" &&
                        current.runStoppedEventRef !== null
                      : false;
        if (!consequenceComplete) {
          throw new ExecutableTransitionRefusal(
            "diagnostic://abiogenesis/hog/transition-consequence-incomplete@5",
            staged as unknown as JsonValue,
          );
        }
        return staged;
      },
    );
    const staged = transaction.value;
    if (staged.kind === "staged_retry_runtime_failure_transition") {
      if (transaction.successorPrefix === null) {
        throw new TypeError(
          "durable retry runtime failure transition produced no successor prefix",
        );
      }
      const transition = staged.transition;
      if (
        transition.disposition !== "retry" ||
        transition.progress.progressClass !== "retry" ||
        transition.stoppedProgresses.length !== 0
      ) {
        throw new TypeError("staged retry transition is not one retry frontier");
      }
      return deepFreeze({
        kind: transition.kind,
        schemaVersion: transition.schemaVersion,
        disposition: "retry" as const,
        close: transition.close,
        progress: transition.progress,
        stoppedProgresses: Object.freeze([]) as readonly [],
        eligibility: transition.eligibility,
        successorPrefix: transaction.successorPrefix,
      });
    }
    return staged;
  } catch (error) {
    if (!(error instanceof ExecutableTransitionRefusal)) throw error;
    return completion("failed", replayRun(input), {
      cCallRef: cCall.cCallRef,
      diagnosticRef: error.diagnosticRef,
    });
  }
}

function reconstructDeferredApplicationState(
  input: RestoreDeferredRecursionInput,
): DeferredApplicationState | null {
  const traversal = input.traversalInput;
  const outcome = projectAdmittedLeafCCallOutcome(traversal.store, {
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
  const targetCursor = deriveCompletedTraversalCursor(
    traversal.graph,
    traversal.traversalStop.cursor,
    {
      inputRef: outcome.result.resultRef,
      inputDigest: outcome.result.valueDigest,
    },
  );
  if (
    (targetCursor !== null && targetCursor.kind === "traversal_refusal") ||
    traversal.terminalMode !== "return_to_application" ||
    traversal.graph.template.applications.find(
      (candidate) =>
        candidate.applicationRef === input.application.applicationRef,
    ) !== input.application ||
    outcome.cCall.compositionRef !== input.application.applicationRef ||
    outcome.cCall.basisId !== traversal.executionBasis.basisRef ||
    outcome.cCall.graphCallId !== traversal.openedTraversalScope.graphCallId ||
    outcome.cCall.frameId !== traversal.openedTraversalScope.frameId ||
    outcome.cCall.programLocusRef !== traversal.traversalStop.programLocusRef ||
    sha256Canonical(traversal.input as unknown as JsonValue) !==
      traversal.inputDigest ||
    traversal.inputDigest !== traversal.traversalStop.cursor.inputDigest
  ) {
    return null;
  }
  return {
    input: traversal,
    cCall: outcome.cCall,
    result: outcome.result,
    judgment: outcome.judgment,
    targetCursor,
  };
}

function applicationReadyCompletion(
  state: DeferredApplicationState,
): ExecutableTraversalCompletion | null {
  if (!hasCurrentDeferredApplicationAuthority(state.input.store, {
    runId: state.cCall.runId,
    frameId: state.cCall.frameId,
    sourceCursorRef: state.input.traversalStop.cursor.cursorRef,
    judgmentRef: state.judgment.judgmentRef,
  })) {
    return null;
  }
  const projected = projectCurrentDeferredApplication(state.input.store, {
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

function requireDeferredApplicationState(
  value: ExecutableTraversalCompletion,
  restoration: RestoreDeferredRecursionInput,
): DeferredApplicationState {
  const state = reconstructDeferredApplicationState(restoration);
  const reconstructed = state === null ? null : applicationReadyCompletion(state);
  if (
    value.disposition !== "application_ready" ||
    state === null ||
    reconstructed === null ||
    sha256Canonical(value as unknown as JsonValue) !==
      sha256Canonical(reconstructed as unknown as JsonValue)
  ) {
    throw new TypeError(
      "application completion requires the exact event-reconstructed deferred fact",
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
  const state = reconstructDeferredApplicationState(input);
  return state === null ? null : applicationReadyCompletion(state);
}

export function completeDeferredApplicationTerminal(
  input: CompleteDeferredRecursionInput,
): ExecutableTraversalCompletion {
  const state = requireDeferredApplicationState(
    input.completion,
    input.restoration,
  );
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
  const successfulRoute = admitSuccessfulRetryExitRoute({
    store: state.input.store,
    executionBasis: state.input.executionBasis,
    graphFunction: state.input.graphFunction,
    graph: state.input.graph,
    sourceCursor: state.input.traversalStop.cursor,
    targetCursor: state.targetCursor,
    variant: {
      completionClass: "judged_success",
      cCall: state.cCall,
      result: state.result,
      judgment: state.judgment,
      transitionContractRef:
        state.input.closureContract.transitionContractRef,
    },
    basis: {
      eventTime: input.clock.eventTime,
      correlationId:
        `${input.clock.correlationId}/application-successful-retry-exit`,
      causationEventRefs: [],
    },
  });
  if (successfulRoute.kind !== "successful_retry_exit_route_admission") {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-successful-retry-exit",
      `diagnostic://abiogenesis/hog/${successfulRoute.code}@5`,
      successfulRoute.candidate,
    );
  }
  const route = successfulRoute.route;
  if (
    !["advance", "terminal"].includes(route.routeKind)
  ) {
    return failDeferredApplication(
      state,
      input.completion,
      input.clock,
      "application-terminal-admission",
      "diagnostic://abiogenesis/hog/application-terminal-route-mismatch@5",
      route as unknown as JsonValue,
    );
  }
  if (route.routeKind === "advance") {
    if (state.targetCursor === null) {
      return completion("failed", replayRun(state.input), {
        cCallRef: state.cCall.cCallRef,
        resultRef: state.result.resultRef,
        judgmentRef: state.judgment.judgmentRef,
        diagnosticRef:
          "diagnostic://abiogenesis/hog/application-advance-target-absent@5",
      });
    }
    const nextCursor = applyAdmittedRoute(
      state.input.traversalStop.cursor,
      state.targetCursor,
      "advance",
      route,
    );
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
  if (state.input.applicationCompletionMode === "return_to_parent") {
    const childClosure = admitChildClosure(
      state.input.store,
      selectHeldEventStoreDurablePrefix(state.input.store),
      state.input.openedTraversalScope,
      state.cCall,
      state.result,
      state.judgment,
      route,
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
    selectHeldEventStoreDurablePrefix(state.input.store),
    state.cCall,
    state.result,
    state.judgment,
    route,
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
  const state = requireDeferredApplicationState(
    input.completion,
    input.restoration,
  );
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
    state.input.store,
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
  const state = requireDeferredApplicationState(
    input.completion,
    input.restoration,
  );
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
  const state = requireDeferredApplicationState(
    input.completion,
    input.restoration,
  );
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
  const terminalizesRun = input.terminalMode !== "return_to_parent";
  const currentReplay = replay(input.store, { runId: input.openedTraversalScope.runId });
  const proposal = proposeWorkflowBlockedRoute(
    input.graph,
    input.workflowCursor,
    input.workflowTerm,
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
    input.workflowCursor,
    null,
    currentReplay,
    proposal,
    basis(input.clock, "workflow-blocked-route"),
    {
      graphFunction: input.graphFunction,
      cCall: input.parentCCall,
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
  sourceCursor: TraversalCursor,
  targetCursor: TraversalCursor | null,
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
  let route: ReturnType<typeof admitRoute>;
  if (replayedCompletion.completionKind === "complete_vector") {
    const successfulRoute = admitSuccessfulRetryExitRoute({
      store: input.store,
      executionBasis: input.executionBasis,
      graphFunction: input.graphFunction,
      graph: input.graph,
      sourceCursor,
      targetCursor,
      variant: {
        completionClass: "fan_out_success",
        cCall: input.parentCCall,
        result,
        judgment,
        application,
        completion: replayedCompletion,
        transitionContractRef: input.closureContract.transitionContractRef,
      },
      basis: basis(input.clock, "fan-out-successful-retry-exit"),
    });
    if (successfulRoute.kind !== "successful_retry_exit_route_admission") {
      return failWorkflowTraversal(
        input,
        "fan-out-route-admission",
        `diagnostic://abiogenesis/hog/${successfulRoute.code}@5`,
        successfulRoute.candidate,
      );
    }
    route = successfulRoute.route;
  } else {
    const proposal = proposeFanOutRoute(
      input.graph,
      application,
      sourceCursor,
      targetCursor,
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
    route = admitRoute(
      input.store,
      input.executionBasis,
      input.graph,
      sourceCursor,
      targetCursor,
      completionReplay,
      proposal,
      basis(input.clock, "fan-out-route"),
      {
        graphFunction: input.graphFunction,
        cCall: input.parentCCall,
        result,
        judgment,
        application,
        completion: replayedCompletion,
      },
      { terminalizeRun: input.terminalMode !== "return_to_parent" },
    );
  }
  if (route.kind !== "admitted_traversal_route") {
    return failWorkflowTraversal(
      input,
      "fan-out-route-admission",
      `diagnostic://abiogenesis/hog/${route.code}@5`,
      route as unknown as JsonValue,
    );
  }
  if (replayedCompletion.completionKind === "partial_stop") {
    const terminalizesRun = input.terminalMode !== "return_to_parent";
    if (
      route.routeKind !== "blocked" ||
      (route.runStoppedEventRef !== null) !== terminalizesRun
    ) {
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
      resultValue: result.value,
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
  if (targetCursor === null) {
    return failWorkflowTraversal(
      input,
      "fan-out-route-application",
      "diagnostic://abiogenesis/hog/fan-out-target-absent@5",
      route as unknown as JsonValue,
    );
  }
  const nextCursor = applyAdmittedRoute(
    sourceCursor,
    targetCursor,
    "advance",
    route,
  );
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
  if (
    input.workflowTerm.kind !== "c_workflow" ||
    input.workflowTerm.graphFunctionRef !== input.parentCCall.childGraphFunctionRef
  ) {
    return failWorkflowTraversal(
      input,
      "workflow-preparation-refusal-step",
      "diagnostic://abiogenesis/hog/workflow-step-mismatch@5",
      input.workflowTerm as unknown as JsonValue,
    );
  }
  const admitted = admitChildPreparationRefusal(
    input.store,
    input.graph,
    input.graphFunction,
    input.workflowCursor,
    input.parentCCall,
    {
      kind: "child_preparation_refusal_candidate",
      schemaVersion: "5.0.0",
      childGraphFunctionRef: input.workflowTerm.graphFunctionRef,
      inputRef: input.workflowCursor.inputRef,
      inputDigest: input.workflowCursor.inputDigest,
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
    input.graph,
    input.graphFunction,
    input.workflowCursor,
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
  const failedFanOutTask =
    input.childCompletion.disposition === "failed" &&
    input.fanOutApplication !== undefined &&
    input.validateFanOutVector !== undefined;
  if (
    input.parentCCall.callClass !== "workflow" ||
    input.workflowTerm.kind !== "c_workflow" ||
    input.workflowTerm.graphFunctionRef !== input.parentCCall.childGraphFunctionRef ||
    input.childCompletion.resultRef === null ||
    input.childCompletion.judgmentRef === null ||
    input.childCompletion.resultValue === null ||
    (input.childCompletion.disposition !== "closed" &&
      input.childCompletion.disposition !== "blocked" &&
      !failedFanOutTask)
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
    input.graph,
    input.graphFunction,
    input.workflowCursor,
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
    input.graph,
    input.graphFunction,
    input.workflowCursor,
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
      input.graph,
      input.graphFunction,
      input.workflowCursor,
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
    input.graph,
    input.graphFunction,
    input.workflowCursor,
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
      input.graph,
      input.graphFunction,
      input.workflowCursor,
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
    input.graph,
    input.graphFunction,
    input.workflowCursor,
    input.parentCCall,
    result,
    judgmentCandidate,
    resultReplay,
    basis(input.clock, "workflow-judgment"),
  );
  if (judgment.kind === "c_call_admission_rejection") {
    const rejected = completeRejectedCCall(
      input.store,
      input.graph,
      input.graphFunction,
      input.workflowCursor,
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
        sourceCursor: input.workflowCursor,
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
        input.workflowCursor,
        null,
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
  const continuationCursor = deriveCompletedTraversalCursor(
    input.graph,
    input.workflowCursor,
    { inputRef: result.resultRef, inputDigest: result.valueDigest },
  );
  if (
    continuationCursor !== null &&
    continuationCursor.kind === "traversal_refusal"
  ) {
    return failWorkflowTraversal(
      input,
      "workflow-continuation",
      `diagnostic://abiogenesis/hog/${continuationCursor.code}@5`,
      continuationCursor as unknown as JsonValue,
    );
  }
  const workflowContinuation = deriveCSourceContinuation(
    input.graph.template,
    input.workflowCursor.currentNodeRef,
    input.workflowCursor.termPath,
  );
  if (
    fanOutEnabled &&
    workflowContinuation.kind === "c_source_continuation" &&
    workflowContinuation.disposition === "advance" &&
    workflowContinuation.relation === "compose_next"
  ) {
    const fanOutCompletion = admitFanOutCompletion({
      store: input.store,
      executionBasis: input.executionBasis,
      graph: input.graph,
      application: input.fanOutApplication!,
      sourceCursor: input.workflowCursor,
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
    const fanInCursor = deriveCompletedTraversalCursor(
      input.graph,
      input.workflowCursor,
      {
        inputRef: fanOutCompletion.outputVectorRef,
        inputDigest: fanOutCompletion.outputVectorDigest,
      },
    );
    if (
      fanInCursor !== null &&
      fanInCursor.kind === "traversal_refusal"
    ) {
      return failWorkflowTraversal(
        input,
        "fan-in-continuation",
        `diagnostic://abiogenesis/hog/${fanInCursor.code}@5`,
        fanInCursor as unknown as JsonValue,
      );
    }
    return completeFanOutWorkflowRoute(
      input,
      result,
      judgment,
      fanOutCompletion,
      input.workflowCursor,
      fanInCursor,
    );
  }
  const successfulRoute = admitSuccessfulRetryExitRoute({
    store: input.store,
    executionBasis: input.executionBasis,
    graphFunction: input.graphFunction,
    graph: input.graph,
    sourceCursor: input.workflowCursor,
    targetCursor: continuationCursor,
    variant: {
      completionClass: "judged_success",
      cCall: input.parentCCall,
      result,
      judgment,
      transitionContractRef: input.closureContract.transitionContractRef,
    },
    basis: basis(input.clock, "workflow-successful-retry-exit"),
  });
  if (successfulRoute.kind !== "successful_retry_exit_route_admission") {
    return failWorkflowTraversal(
      input,
      "workflow-successful-retry-exit",
      `diagnostic://abiogenesis/hog/${successfulRoute.code}@5`,
      successfulRoute.candidate,
    );
  }
  const route = successfulRoute.route;
  if (route.routeKind === "advance") {
    if (continuationCursor === null) {
      return failWorkflowTraversal(
        input,
        "workflow-route-application",
        "diagnostic://abiogenesis/hog/workflow-advance-target-absent@5",
        route as unknown as JsonValue,
      );
    }
    const nextCursor = applyAdmittedRoute(
      input.workflowCursor,
      continuationCursor,
      "advance",
      route,
    );
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
  if (input.terminalMode === "return_to_parent") {
    const childClosure = admitChildClosure(
      input.store,
      selectHeldEventStoreDurablePrefix(input.store),
      input.openedTraversalScope,
      input.parentCCall,
      result,
      judgment,
      route,
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
    selectHeldEventStoreDurablePrefix(input.store),
    input.parentCCall,
    result,
    judgment,
    route,
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
