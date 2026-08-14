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
  deriveSubTraversalEvidence,
  hasCurrentDeferredApplicationAuthority,
  openInteractionCCall,
  planPendingInteractionAdmission,
  projectAdmittedLeafCCallOutcome,
  projectCurrentDeferredApplication,
  projectedCCallResultValue,
  replay,
  type AbgEventStore,
  type ActorRuntimeBinding,
  type AdmittedCCallJudgment,
  type AdmittedCCallResult,
  type AdmittedImplementationResolutionRow,
  type AdmittedImplementationSet,
  type AdmittedInteractionContractRow,
  type AdmittedInteractionSet,
  type CCallEvidenceCandidate,
  type CCall,
  type ExecutionBasis,
  type ContinuationProductBasis,
  type FhInteractionResumeAdmission,
  type FanOutCompletionAdmission,
  type OpenedTraversalScope,
  type ReplayState,
  type RuntimeAdmissionBasis,
} from "../abg/index.js";
import {
  admitRuntimeEventTransactionAtExpectedPrefix,
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
} from "../implementation/contracts.js";
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
  proposeHoldRoute,
  proposeRecursionRoute,
  proposeWorkflowBlockedRoute,
} from "./traversal_route.js";
import {
  applyAdmittedRoute,
  applyRecursionRoute,
  deriveCompletedTraversalCursor,
  deriveInteractionSuccessorInputCarrierRef,
  deriveRecursionReentryCursor,
  type ExecutableTraversalStopRef,
  type InteractionTraversalStopRef,
  type TraversalCursor,
} from "./traversal.js";
import { admitSuccessfulRetryExitRoute } from "./retry_exit.js";

interface ExecutableLeafSuccessCandidate<Output> {
  readonly kind: "leaf_realization_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "success";
  readonly evidenceCandidates: readonly CCallEvidenceCandidate[];
  readonly resultCandidate: Output;
}

interface ExecutableLeafFailureCandidate {
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

export interface CompleteExecutableTraversalInput<Input> {
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

interface DeferredApplicationState {
  readonly input: CompleteExecutableTraversalInput<unknown>;
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
  readonly judgment: AdmittedCCallJudgment;
  readonly targetCursor: TraversalCursor | null;
}

export interface RestoreDeferredRecursionInput {
  readonly traversalInput: CompleteExecutableTraversalInput<
    Readonly<Record<string, JsonValue>>
  >;
  readonly application: Readonly<RecurseApplication>;
  readonly cCallRef: string;
  readonly resultRef: string;
  readonly judgmentRef: string;
}

export function basis(
  clock: ExecutableTraversalClock,
  stage: string,
): RuntimeAdmissionBasis {
  return {
    eventTime: clock.eventTime,
    correlationId: `${clock.correlationId}/${stage}`,
    causationEventRefs: [],
  };
}

export function completion(
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

function replayRun(input: Pick<CompleteExecutableTraversalInput<unknown>, "store" | "openedTraversalScope">): ReplayState {
  return replay(input.store, { runId: input.openedTraversalScope.runId });
}

export function completeBlockedTraversal<Input>(
  input: CompleteExecutableTraversalInput<Input>,
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

export function completeFailedTraversal<Input>(
  input: CompleteExecutableTraversalInput<Input>,
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

export function completeRuntimeFailureTransition<Input>(
  input: CompleteExecutableTraversalInput<Input>,
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
  _value: ExecutableTraversalCompletion,
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
