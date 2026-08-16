import * as Abg from "../abg/index.js";
import type {
  AbgEventStore,
  ActorRuntimeBinding,
  AdmittedCCallJudgment,
  AdmittedCCallResult,
  AdmittedImplementationResolutionRow,
  AdmittedImplementationSet,
  CCall,
  ExecutionBasis,
  OpenedTraversalScope,
} from "../abg/index.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type {
  ClosureContract,
  GraphFunction,
  GtlGraph,
  GtlProgram,
  RecurseApplication,
} from "../gtl/contracts.js";
import { recursionTerminationDecision } from "../gtl/graph_applications.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  prepareChildTraversal,
  type ChildTraversalBasis,
  type ChildTraversalPreparationRefusal,
  type PreparedChildTraversal,
} from "./child_traversal.js";
import { projectCCallCompletion } from "./ccall_lifecycle.js";
import {
  admissionBasis,
  replayAtDurable,
  runtimePrefixAtDurable,
  sameCanonical,
  type ExecutionClock,
} from "./operator_support.js";
import * as Routes from "./route_proposal.js";
import { planSuccessfulRetryExit } from "./retry_lifecycle.js";
import {
  applyRecursionRoute,
  deriveCompletedTraversalCursor,
  deriveRecursionReentryCursor,
  type TraversalCursor,
} from "./traversal.js";
import {
  projectExecutableTraversalCompletion as completion,
  type ExecutableTraversalCompletion,
  type HeldRecursionSuspension,
} from "./traversal_completion.js";
import { failTraversal } from "./traversal_failure.js";

export interface CompleteExecutableTraversalInput<Input> {
  readonly store: AbgEventStore;
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly traversalStop: Abg.ExecutableCCallLocusCandidate;
  readonly implementationSet: AdmittedImplementationSet;
  readonly implementationResolution: AdmittedImplementationResolutionRow;
  readonly leafPort: LeafInvocationPort;
  readonly input: Readonly<Input>;
  readonly inputDigest: `sha256:${string}`;
  readonly closureContract: Readonly<ClosureContract>;
  readonly actorRuntimeBinding?: ActorRuntimeBinding;
  readonly deferFailedRunStop?: boolean;
  readonly deferToApplication?: true;
  readonly completionScopeClass: "root" | "child";
  readonly clock: ExecutionClock;
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

export interface RecursionChildFoldFrame {
  readonly kind: "recursion_child_fold_frame";
  readonly parentClock: ExecutionClock;
  readonly parentScopeClass: "root" | "child";
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

export type RecursionApplicationStep =
  | Readonly<{
      kind: "recursion_completion";
      completion: ExecutableTraversalCompletion;
    }>
  | Readonly<{
      kind: "recursion_child_request";
      frame: RecursionChildFoldFrame;
      prepared: PreparedChildTraversal;
      correlationId: string;
    }>;

function isJsonRecord(
  value: unknown,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function failRecursionInput(
  input: Readonly<{
    traversalInput: CompleteExecutableTraversalInput<
      Readonly<Record<string, JsonValue>>
    >;
    leafOrdinal: number;
  }>,
  predecessorPrefix: DurablePrefixCoordinate,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): never {
  const runtime = input.traversalInput;
  return failTraversal({
    store: runtime.store,
    predecessorPrefix,
    executionBasis: runtime.executionBasis,
    openedTraversalScope: runtime.openedTraversalScope,
    eventTime: runtime.clock.eventTime,
    correlationId: runtime.clock.correlationId,
    stage,
    diagnosticRef,
    candidate,
  });
}

export function recursionApplication(
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

function admittedDeferredCCallOutcome(
  state: DeferredApplicationState,
): Abg.JudgedCCallOutcomeReceipt {
  const projected = Abg.projectCCallOutcomeReceiptAtPrefix(
    state.input.predecessorPrefix,
    {
      disposition: "judged",
      admitted: {
      cCall: state.cCall,
      result: state.result,
      judgment: state.judgment,
      },
    },
  );
  if (projected?.disposition !== "judged") {
    throw new TypeError("deferred application lacks its exact admitted CCall");
  }
  return projected;
}

function deferredApplicationState(
  input: RestoreDeferredRecursionInput,
): DeferredApplicationState | null {
  const traversal = input.traversalInput;
  const outcome = Abg.projectAdmittedLeafCCallOutcomeAtPrefix(
    traversal.predecessorPrefix,
    {
    executionBasis: traversal.executionBasis,
    implementationSet: traversal.implementationSet,
    openedTraversalScope: traversal.openedTraversalScope,
    graph: traversal.graph,
    traversalStop: traversal.traversalStop,
    implementationResolution: traversal.implementationResolution,
    cCallRef: input.cCallRef,
    resultRef: input.resultRef,
    judgmentRef: input.judgmentRef,
    },
  );
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
    traversal.deferToApplication !== true ||
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

export function restoreDeferredRecursion(
  input: RestoreDeferredRecursionInput,
): ExecutableTraversalCompletion | null {
  const state = deferredApplicationState(input);
  if (state === null) return null;
  const projected = Abg.projectDeferredApplicationAtPrefix(
    state.input.predecessorPrefix,
    {
    runId: state.cCall.runId,
    frameId: state.cCall.frameId,
    sourceCursorRef: state.input.traversalStop.cursor.cursorRef,
    cCallRef: state.cCall.cCallRef,
    resultRef: state.result.resultRef,
    judgmentRef: state.judgment.judgmentRef,
    },
  );
  return projected === null ? null : completion(
    "application_ready",
    projected.replayState,
    state.input.predecessorPrefix,
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
  predecessorPrefix: DurablePrefixCoordinate,
  clock: ExecutionClock,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): ExecutableTraversalCompletion {
  const admitted = Abg.admitRuntimeFailure({
    store: state.input.store,
    predecessorPrefix,
    executionBasis: state.input.executionBasis,
    scope: state.input.openedTraversalScope,
    stage: "route",
    subject: { stage, candidate },
    diagnosticRef,
    basis: {
      ...admissionBasis(clock, stage),
      causationEventRefs: [state.judgment.admissionEventRef],
    },
  });
  return completion("failed", admitted.replayState, admitted.successorPrefix, {
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
  clock: ExecutionClock,
): ExecutableTraversalCompletion {
  if (recursionTerminationDecision(application, state.result.value) !== true) {
    return recursionFailure(
      state,
      state.input.predecessorPrefix,
      clock,
      "terminal",
      "diagnostic://abiogenesis/hog/application-terminal-not-declared@5",
      application as unknown as JsonValue,
    );
  }
  const outcome = admittedDeferredCCallOutcome(state);
  const retryProgressBasis = admissionBasis(
    clock,
    "terminal-retry-progress",
  );
  const retryExit = state.result.resultClass === "success" &&
      state.judgment.judgment === "advance"
    ? planSuccessfulRetryExit({
        predecessorPrefix: outcome.successorPrefix,
        graph: state.input.graph,
        graphFunction: state.input.graphFunction,
        source: state.input.traversalStop.cursor,
        target: state.targetCursor,
        completion: {
          completionClass: "judged_success",
          cCall: state.cCall,
          result: state.result,
          judgment: state.judgment,
        },
        basis: retryProgressBasis,
      })
    : null;
  if (retryExit?.kind === "successful_retry_exit_plan_refusal") {
    return recursionFailure(
      state,
      outcome.successorPrefix,
      clock,
      "terminal-retry-progress",
      `diagnostic://abiogenesis/hog/${retryExit.code}@5`,
      retryExit as unknown as JsonValue,
    );
  }
  const candidate = Routes.proposeCCallOutcomeTransition({
    graph: state.input.graph,
    graphFunction: state.input.graphFunction,
    sourceCursor: state.input.traversalStop.cursor,
    targetCursor: state.targetCursor,
    outcome,
    ...(retryExit?.kind === "successful_retry_exit_plan"
      ? { completedRetryProgress: retryExit.plan }
      : {}),
    terminalizeNonAdvance: state.input.completionScopeClass === "root",
  });
  if (candidate.kind !== "traversal_transition_candidate") {
    return recursionFailure(
      state,
      outcome.successorPrefix,
      clock,
      "terminal-route",
      `diagnostic://abiogenesis/hog/${candidate.code}@5`,
      candidate as unknown as JsonValue,
    );
  }
  const admitted = Abg.admitCCallCompletion({
    store: state.input.store,
    predecessorPrefix: outcome.successorPrefix,
    executionBasis: state.input.executionBasis,
    graph: state.input.graph,
    graphFunction: state.input.graphFunction,
    source: state.input.traversalStop.cursor,
    target: state.targetCursor,
    outcome,
    candidate,
    openedTraversalScope: state.input.openedTraversalScope,
    closureContract: state.input.closureContract,
    basis: admissionBasis(clock, "terminal-completion"),
    ...(retryExit?.kind === "successful_retry_exit_plan"
      ? { completedRetryProgress: retryExit }
      : {}),
  });
  if (admitted.kind !== "c_call_completion_admission") {
    return recursionFailure(
      state,
      outcome.successorPrefix,
      clock,
      "terminal-completion",
      `diagnostic://abiogenesis/hog/${admitted.code}@5`,
      admitted as unknown as JsonValue,
    );
  }
  return projectCCallCompletion(
    state.input.traversalStop.cursor,
    admitted,
    state.targetCursor,
  );
}

function blockRecursion(
  state: DeferredApplicationState,
  application: Readonly<RecurseApplication>,
  clock: ExecutionClock,
  preparation?: ChildTraversalPreparationRefusal,
): ExecutableTraversalCompletion {
  const outcome = admittedDeferredCCallOutcome(state);
  const preparationReceipt = preparation === undefined
    ? null
    : Abg.admitChildPreparationRefusal({
        relationClass: "recursive_application",
        store: state.input.store,
        predecessorPrefix: preparation.successorPrefix,
        executionBasis: state.input.executionBasis,
        graph: state.input.graph,
        application,
        parentCCall: state.cCall,
        parentResult: state.result,
        parentJudgment: state.judgment,
        sourceCursor: state.input.traversalStop.cursor,
        candidate: {
          kind: "child_preparation_refusal_candidate",
          schemaVersion: "5.0.0",
          childGraphFunctionRef: application.graphFunctionRef,
          inputRef: state.result.resultRef,
          inputDigest: state.result.valueDigest,
          stage: preparation.stage,
          diagnosticRef: preparation.diagnosticRef,
          message: preparation.message,
        },
        basis: admissionBasis(clock, "preparation-refusal"),
      });
  if (preparationReceipt !== null &&
      preparationReceipt.kind !==
        "application_child_preparation_refusal_receipt") {
    return recursionFailure(
      state,
      preparation?.successorPrefix ?? outcome.successorPrefix,
      clock,
      "preparation-refusal",
      `diagnostic://abiogenesis/hog/${preparationReceipt.code}@5`,
      preparationReceipt as unknown as JsonValue,
    );
  }
  const preparationAdmission = preparationReceipt?.admission ?? null;
  const predecessorPrefix = preparationReceipt?.successorPrefix ??
    outcome.successorPrefix;
  const route = Routes.proposeRecursionRoute(
    state.input.graph,
    application,
    state.input.traversalStop.cursor,
    null,
    state.cCall,
    state.judgment,
    null,
    replayAtDurable(predecessorPrefix, state.cCall.runId),
    state.cCall.transitionContractRef,
    "blocked",
    preparationAdmission,
  );
  if (route.kind !== "traversal_route_candidate") {
    return recursionFailure(
      state,
      predecessorPrefix,
      clock,
      "blocked-route",
      `diagnostic://abiogenesis/hog/${route.code}@5`,
      route as unknown as JsonValue,
    );
  }
  const candidate = Abg.completeTraversalTransitionCandidate({
    kind: "traversal_transition_candidate",
    schemaVersion: "5.0.0",
    transitionClass: "route",
    route,
    evidence: {
      evidenceClass: "recursion",
      application,
      cCall: state.cCall,
      result: state.result,
      judgment: state.judgment,
      foldback: null,
      preparationRefusal: preparationAdmission,
    },
    terminalizeRun: state.input.completionScopeClass === "root",
  });
  const admitted = Abg.admitCCallCompletion({
    store: state.input.store,
    predecessorPrefix,
    executionBasis: state.input.executionBasis,
    graph: state.input.graph,
    graphFunction: state.input.graphFunction,
    source: state.input.traversalStop.cursor,
    target: null,
    outcome,
    candidate,
    openedTraversalScope: state.input.openedTraversalScope,
    closureContract: state.input.closureContract,
    basis: admissionBasis(clock, "blocked-completion"),
  });
  const requiresRunStop = state.input.completionScopeClass === "root";
  if (
    admitted.kind !== "c_call_completion_admission" ||
    admitted.disposition !== "blocked" ||
    (requiresRunStop && admitted.transition.route.runStoppedEventRef === null)
  ) {
    return recursionFailure(
      state,
      predecessorPrefix,
      clock,
      "blocked-completion",
      admitted.kind === "c_call_completion_admission"
        ? "diagnostic://abiogenesis/hog/application-run-stop-absent@5"
        : `diagnostic://abiogenesis/hog/${admitted.code}@5`,
      admitted as unknown as JsonValue,
    );
  }
  return completion(
    "blocked",
    admitted.transition.replayState,
    admitted.transition.successorPrefix,
    {
    cCallRef: state.cCall.cCallRef,
    resultRef: state.result.resultRef,
    judgmentRef: state.judgment.judgmentRef,
    resultValue: state.result.value,
    diagnosticRef: preparation?.diagnosticRef ??
      "reason://abiogenesis/recursion/bound-exhausted@5",
    },
  );
}

export function beginRecursionApplication(input: Readonly<{
  traversalInput: CompleteExecutableTraversalInput<
    Readonly<Record<string, JsonValue>>
  >;
  childTraversalBasis: ChildTraversalBasis;
  parentClock: ExecutionClock;
  application: Readonly<RecurseApplication>;
  completion: ExecutableTraversalCompletion;
  graphEntryInput: Readonly<Record<string, JsonValue>>;
  graphEntryInputDigest: `sha256:${string}`;
  leafOrdinal: number;
}>):
  | Readonly<{ kind: "recursion_completion"; completion: ExecutableTraversalCompletion }>
  | Readonly<{
      kind: "recursion_child_request";
      frame: RecursionChildFoldFrame;
      prepared: PreparedChildTraversal;
      correlationId: string;
    }> {
    const { application, traversalInput, leafOrdinal } = input;
    const coordinates = input.completion;
    if (coordinates.cCallRef === null || coordinates.resultRef === null ||
        coordinates.judgmentRef === null) {
      return failRecursionInput(input,
        coordinates.successorPrefix,
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
      return failRecursionInput(input,
        coordinates.successorPrefix,
        `recursion-restoration-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/recursion-restoration-mismatch@5",
        coordinates as unknown as JsonValue,
      );
    }
    const state = requireDeferredApplication(restored, restoration);
    const clock = (stage: string): ExecutionClock => ({
      eventTime: input.parentClock.eventTime,
      correlationId:
        `${input.parentClock.correlationId}/recursion/${leafOrdinal}/${stage}`,
    });
    const termination = restored.resultValue === null
      ? null
      : recursionTerminationDecision(application, restored.resultValue);
    if (termination === null) {
      return failRecursionInput(input,
        coordinates.successorPrefix,
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
    if (restored.cCallRef === null || restored.resultRef === null ||
        !isJsonRecord(restored.resultValue)) {
      return failRecursionInput(input,
        restored.successorPrefix,
        `recursion-child-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/recursion-child-preparation-absent@5",
        application as unknown as JsonValue,
      );
    }
    const childInput = restored.resultValue;
    const prepared = prepareChildTraversal(
      traversalInput.store,
      input.childTraversalBasis,
      {
        predecessorPrefix: restored.successorPrefix,
        parentExecutionBasis: traversalInput.executionBasis,
        parentTraversalScope: traversalInput.openedTraversalScope,
        parentCCallRef: restored.cCallRef,
        childGraphFunctionRef: application.graphFunctionRef,
        inputRef: restored.resultRef,
        inputDigest: sha256Canonical(childInput),
        input: childInput,
        eventTime: input.parentClock.eventTime,
        correlationId: clock("prepare").correlationId,
      },
    );
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
        parentClock: input.parentClock,
        parentScopeClass: traversalInput.completionScopeClass,
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
}

export function completeRecursionChild(
  frame: RecursionChildFoldFrame,
  child: ExecutableTraversalCompletion,
): ExecutableTraversalCompletion {
  const state = requireDeferredApplication(frame.restored, frame.restoration);
  const clock: ExecutionClock = {
    eventTime: frame.parentClock.eventTime,
    correlationId:
      `${frame.parentClock.correlationId}/recursion/${frame.leafOrdinal}/foldback`,
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
      terminalMode: frame.parentScopeClass === "root"
        ? "close_run"
        : "return_to_parent",
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
      child.successorPrefix,
      clock,
      "child-completion",
      "diagnostic://abiogenesis/hog/application-foldback-mismatch@5",
      child as unknown as JsonValue,
    );
  }
  const foldbackReceipt = Abg.admitChildFoldback({
    relationClass: "recursive_application",
    store: state.input.store,
    predecessorPrefix: child.successorPrefix,
    parentExecutionBasis: state.input.executionBasis,
    graph: state.input.graph,
    application: frame.application,
    parentCCall: state.cCall,
    parentJudgmentRef: state.judgment.judgmentRef,
    sourceCursor: state.input.traversalStop.cursor,
    childExecutionBasis: frame.childExecutionBasis,
    childScope: frame.childTraversalScope,
    child: {
      resultRef: child.resultRef,
      judgmentRef: child.judgmentRef,
      closureRef: child.closureRef,
    },
    basis: admissionBasis(clock, "foldback"),
  });
  if (foldbackReceipt.kind !== "application_child_foldback_receipt") {
    return recursionFailure(
      state,
      child.successorPrefix,
      clock,
      "foldback",
      `diagnostic://abiogenesis/hog/${foldbackReceipt.code}@5`,
      foldbackReceipt as unknown as JsonValue,
    );
  }
  const foldback = foldbackReceipt.admission;
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
      foldbackReceipt.successorPrefix,
      clock,
      "reentry",
      `diagnostic://abiogenesis/hog/${target.code}@5`,
      target as unknown as JsonValue,
    );
  }
  const route = Routes.proposeRecursionRoute(
    state.input.graph,
    frame.application,
    state.input.traversalStop.cursor,
    target,
    state.cCall,
    state.judgment,
    foldback,
    replayAtDurable(foldbackReceipt.successorPrefix, state.cCall.runId),
    state.cCall.transitionContractRef,
    blocked ? "blocked" : "advance",
  );
  if (route.kind !== "traversal_route_candidate") {
    return recursionFailure(
      state,
      foldbackReceipt.successorPrefix,
      clock,
      "child-route",
      `diagnostic://abiogenesis/hog/${route.code}@5`,
      route as unknown as JsonValue,
    );
  }
  const candidate = Abg.completeTraversalTransitionCandidate({
    kind: "traversal_transition_candidate",
    schemaVersion: "5.0.0",
    transitionClass: "route",
    route,
    evidence: {
      evidenceClass: "recursion",
      application: frame.application,
      cCall: state.cCall,
      result: state.result,
      judgment: state.judgment,
      foldback,
      preparationRefusal: null,
    },
    terminalizeRun: blocked &&
      state.input.completionScopeClass === "root",
  });
  const outcome = admittedDeferredCCallOutcome(state);
  const admitted = Abg.admitCCallCompletion({
    store: state.input.store,
    predecessorPrefix: foldbackReceipt.successorPrefix,
    executionBasis: state.input.executionBasis,
    graph: state.input.graph,
    graphFunction: state.input.graphFunction,
    source: state.input.traversalStop.cursor,
    target,
    outcome,
    candidate,
    openedTraversalScope: state.input.openedTraversalScope,
    closureContract: state.input.closureContract,
    basis: admissionBasis(clock, "child-completion"),
  });
  if (admitted.kind !== "c_call_completion_admission") {
    return recursionFailure(
      state,
      foldbackReceipt.successorPrefix,
      clock,
      "child-completion",
      `diagnostic://abiogenesis/hog/${admitted.code}@5`,
      admitted as unknown as JsonValue,
    );
  }
  if (blocked) {
    const requiresRunStop =
      state.input.completionScopeClass === "root";
    if (
      admitted.disposition !== "blocked" ||
      (requiresRunStop &&
        admitted.transition.route.runStoppedEventRef === null)
    ) {
      const successorPrefix = admitted.disposition === "application_ready"
        ? admitted.outcome.successorPrefix
        : admitted.transition.successorPrefix;
      return recursionFailure(
        state,
        successorPrefix,
        clock,
        "blocked-route",
        "diagnostic://abiogenesis/hog/application-run-stop-absent@5",
        admitted as unknown as JsonValue,
      );
    }
    return completion(
      "blocked",
      admitted.transition.replayState,
      admitted.transition.successorPrefix,
      {
      cCallRef: state.cCall.cCallRef,
      resultRef: foldback.childResultRef,
      judgmentRef: state.judgment.judgmentRef,
      resultValue: child.resultValue,
      diagnosticRef: foldback.childReasonRef ??
        "diagnostic://abiogenesis/hog/child-traversal-blocked@5",
      },
    );
  }
  if (target === null || admitted.disposition !== "advanced") {
    return recursionFailure(
      state,
      admitted.disposition === "advanced"
        ? admitted.transition.successorPrefix
        : foldbackReceipt.successorPrefix,
      clock,
      "advance-route",
      "diagnostic://abiogenesis/hog/application-advance-route-absent@5",
      admitted as unknown as JsonValue,
    );
  }
  const nextCursor = applyRecursionRoute(
    runtimePrefixAtDurable(
      admitted.transition.successorPrefix,
      state.input.traversalStop.cursor.runId,
    ),
    state.input.traversalStop.cursor,
    target,
    admitted.transition.route,
  );
  if (nextCursor.kind === "traversal_refusal") {
    return recursionFailure(
      state,
      admitted.transition.successorPrefix,
      clock,
      "advance-route",
      `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
      nextCursor as unknown as JsonValue,
    );
  }
  return completion(
    "advanced",
    admitted.transition.replayState,
    admitted.transition.successorPrefix,
    {
    cCallRef: state.cCall.cCallRef,
    resultRef: foldback.childResultRef,
    judgmentRef: state.judgment.judgmentRef,
    nextCursor,
    resultValue: child.resultValue,
    continuationKind: "advance",
    nextInputContractRef: frame.application.outputContractRef,
    },
  );
}
