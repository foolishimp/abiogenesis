import {
  admitInitialTraversalCursor,
  admitRuntimeFailure,
  deriveGraphFunctionActionEvaluationBasis,
  hasAdmittedTraversalCursorAtPrefix,
  isExecutionBasis,
  isTraversalCursorCandidate,
  rehydrateConstructionIntentForCursorAtDurablePrefix,
  selectAdmittedImplementationResolution,
  traversalCursorAdmissionEventRefAtPrefix,
  type AbgEventStore,
  type ActorRuntimeBinding,
  type AdmittedCCallJudgment,
  type AdmittedCCallResult,
  type AdmittedImplementationResolutionRow,
  type AdmittedImplementationSet,
  type AdmittedInteractionContractRow,
  type AdmittedInteractionSet,
  type CCall,
  type CCallLocusCandidate,
  type ContinuationProductBasis,
  type ExecutableCCallLocusCandidate,
  type ExecutionBasis,
  type InteractionCCallLocusCandidate,
  type OpenedTraversalScope,
  type ReplayState,
  type RuntimeAdmissionBasis,
  type RuntimeFailureAdmissionReceipt,
} from "../abg/index.js";
import {
  assertHeldEventStoreAtDurablePrefix,
  type DurablePrefixCoordinate,
} from "../abg/event_store.js";
import type {
  ClosureContract,
  FanOutApplication,
  GraphFunction,
  GtlGraph,
  GtlProgram,
  RecurseApplication,
} from "../gtl/contracts.js";
import type { CProgramNode } from "../gtl/c_algebra.js";
import { recursionTerminationDecision } from "../gtl/graph_applications.js";
import { deriveCSourceContinuation } from "../gtl/source_path.js";
import { isAdmittedLeafInvocationPort } from "../implementation/leaf_invocation_port.js";
import type {
  LeafInvocationPort,
} from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { GraphValidation } from "../validator/graph.js";
import {
  prepareChildTraversal,
  type ChildTraversalBasis,
  type ChildTraversalPreparationRefusal,
  type PreparedChildTraversal,
} from "./child_traversal.js";
import {
  completeInteractionResume as resumeInteractionOwner,
  type CompleteInteractionResumeInput,
} from "./interaction_resume.js";
import {
  projectExecutableTraversalCompletion as completion,
  type ExecutableTraversalCompletion,
  type HeldInteractionTraversal,
  type HeldParentTraversalSuspension,
  type HeldRecursionSuspension,
  type HeldWorkflowSuspension,
} from "./traversal_completion.js";
export type {
  ExecutableTraversalCompletion,
  HeldInteractionTraversal,
  HeldParentTraversalSuspension,
  HeldRecursionSuspension,
  HeldWorkflowSuspension,
} from "./traversal_completion.js";
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
  traverseFromCursor,
  type TraversalCursor,
  type TraverseInput,
  type TraverseResult,
} from "./traversal.js";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import { runEffectProgram } from "../shared/effect_definition.js";
import * as Abg from "../abg/index.js";
import * as AbgRetry from "../abg/retry.js";
import * as Routes from "./route_proposal.js";
import { proposeJudgmentCandidate } from "./judgment.js";

export type ProjectedRetryResumeSuccess =
  AbgRetry.ProjectedRetryResumeSuccess;

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

function runtimePrefixAtDurable(
  prefix: DurablePrefixCoordinate,
  runId: string,
) {
  return Abg.projectRuntimeTruthAtDurablePrefix(prefix, runId).runtimePrefix;
}

function replayAtDurable(
  prefix: DurablePrefixCoordinate,
  runId: string,
): ReplayState {
  return Abg.projectRuntimeTruthAtDurablePrefix(prefix, runId).replayState;
}

export interface ExecuteGraphTraversalCommonInput {
  readonly store: AbgEventStore;
  readonly predecessorPrefix: DurablePrefixCoordinate;
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
  readonly childTraversalBasis: ChildTraversalBasis;
  readonly closureContract: Readonly<ClosureContract>;
  readonly actorRuntimeBinding: ActorRuntimeBinding;
  readonly deferFailedRunStop?: boolean;
  readonly eventTime: string;
  readonly correlationId: string;
  readonly terminalMode?: "close_run" | "return_to_parent";
}

interface InteractionLocusAuthority {
  readonly store: AbgEventStore;
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly interactionSet: AdmittedInteractionSet;
  readonly continuationProductBasis?: ContinuationProductBasis;
  readonly closureContract: Readonly<ClosureContract>;
  readonly eventTime: string;
  readonly correlationId: string;
}

interface WorkflowLocusAuthority {
  readonly store: AbgEventStore;
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly implementationSet: AdmittedImplementationSet;
  readonly leafPort: LeafInvocationPort;
  readonly childTraversalBasis: ChildTraversalBasis;
  readonly closureContract: Readonly<ClosureContract>;
  readonly deferFailedRunStop?: boolean;
  readonly eventTime: string;
  readonly correlationId: string;
  readonly terminalMode?: "close_run" | "return_to_parent";
}

interface ExecutableLocusAuthority {
  readonly store: AbgEventStore;
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly implementationSet: AdmittedImplementationSet;
  readonly leafPort: LeafInvocationPort;
  readonly childTraversalBasis: ChildTraversalBasis;
  readonly closureContract: Readonly<ClosureContract>;
  readonly actorRuntimeBinding: ActorRuntimeBinding;
  readonly deferFailedRunStop?: boolean;
  readonly eventTime: string;
  readonly correlationId: string;
  readonly terminalMode?: "close_run" | "return_to_parent";
}

interface ExecutableTraversalClock {
  readonly eventTime: string;
  readonly correlationId: string;
}

interface CompleteExecutableTraversalInput<Input> {
  readonly store: AbgEventStore;
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly traversalStop: ExecutableCCallLocusCandidate;
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

interface RestoreDeferredRecursionInput {
  readonly traversalInput: CompleteExecutableTraversalInput<
    Readonly<Record<string, JsonValue>>
  >;
  readonly application: Readonly<RecurseApplication>;
  readonly cCallRef: string;
  readonly resultRef: string;
  readonly judgmentRef: string;
}

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

export class GraphTraversalFailure extends TypeError {
  readonly kind = "graph_traversal_failure" as const;
  readonly schemaVersion = "5.0.0" as const;

  constructor(
    readonly diagnosticRef: string,
    readonly receipt: RuntimeFailureAdmissionReceipt,
  ) {
    super(diagnosticRef);
  }
}

function fail(
  input: ExecuteGraphTraversalCommonInput,
  predecessorPrefix: DurablePrefixCoordinate,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): never {
  const receipt = admitRuntimeFailure({
    store: input.store,
    predecessorPrefix,
    executionBasis: input.executionBasis,
    scope: input.openedTraversalScope,
    stage: "hog_traversal",
    subject: { stage, candidate },
    diagnosticRef,
    basis: {
      eventTime: input.eventTime,
      correlationId: `${input.correlationId}/${stage}`,
      causationEventRefs: [],
    },
  });
  throw new GraphTraversalFailure(diagnosticRef, receipt);
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

function isExactLocusStep(
  stop: CCallLocusCandidate | TraversalCursor,
  term: Readonly<CProgramNode>,
): boolean {
  if (stop.kind === "traversal_cursor") {
    return term.kind === "c_workflow";
  }
  return term.kind === "c_of" &&
    term.fibre === stop.computeRegime &&
    term.programLocusRef === stop.programLocusRef &&
    term.armId === stop.armId &&
    term.compositionRef === stop.compositionRef &&
    term.inputCarrierRef === (stop.stopClass === "executable"
      ? stop.inputContractRef
      : stop.requestContractRef) &&
    term.outputCarrierRef === (stop.stopClass === "executable"
      ? stop.outputContractRef
      : stop.responseContractRef);
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

function traversalBasis(
  input: ExecuteGraphTraversalCommonInput,
): TraverseInput {
  return Object.freeze({
    program: input.program,
    graphFunction: input.graphFunction,
    graph: input.graph,
    graphValidation: input.graphValidation,
    executionBasis: input.executionBasis,
    openedTraversalScope: input.openedTraversalScope,
  });
}

function interactionLocusAuthority(
  input: ExecuteGraphTraversalCommonInput,
): InteractionLocusAuthority {
  return Object.freeze({
    store: input.store,
    predecessorPrefix: input.predecessorPrefix,
    executionBasis: input.executionBasis,
    openedTraversalScope: input.openedTraversalScope,
    program: input.program,
    graphFunction: input.graphFunction,
    graph: input.graph,
    interactionSet: input.interactionSet,
    ...(input.continuationProductBasis === undefined
      ? {}
      : { continuationProductBasis: input.continuationProductBasis }),
    closureContract: input.closureContract,
    eventTime: input.eventTime,
    correlationId: input.correlationId,
  });
}

function workflowLocusAuthority(
  input: ExecuteGraphTraversalCommonInput,
): WorkflowLocusAuthority {
  return Object.freeze({
    store: input.store,
    predecessorPrefix: input.predecessorPrefix,
    executionBasis: input.executionBasis,
    openedTraversalScope: input.openedTraversalScope,
    program: input.program,
    graphFunction: input.graphFunction,
    graph: input.graph,
    implementationSet: input.implementationSet,
    leafPort: input.leafPort,
    childTraversalBasis: input.childTraversalBasis,
    closureContract: input.closureContract,
    ...(input.deferFailedRunStop === undefined
      ? {}
      : { deferFailedRunStop: input.deferFailedRunStop }),
    eventTime: input.eventTime,
    correlationId: input.correlationId,
    ...(input.terminalMode === undefined
      ? {}
      : { terminalMode: input.terminalMode }),
  });
}

function executableLocusAuthority(
  input: ExecuteGraphTraversalCommonInput,
): ExecutableLocusAuthority {
  return Object.freeze({
    store: input.store,
    predecessorPrefix: input.predecessorPrefix,
    executionBasis: input.executionBasis,
    openedTraversalScope: input.openedTraversalScope,
    program: input.program,
    graphFunction: input.graphFunction,
    graph: input.graph,
    implementationSet: input.implementationSet,
    leafPort: input.leafPort,
    childTraversalBasis: input.childTraversalBasis,
    closureContract: input.closureContract,
    actorRuntimeBinding: input.actorRuntimeBinding,
    ...(input.deferFailedRunStop === undefined
      ? {}
      : { deferFailedRunStop: input.deferFailedRunStop }),
    eventTime: input.eventTime,
    correlationId: input.correlationId,
    ...(input.terminalMode === undefined
      ? {}
      : { terminalMode: input.terminalMode }),
  });
}

function evaluateInteractionLocus(input: Readonly<{
  authority: InteractionLocusAuthority;
  stop: InteractionCCallLocusCandidate;
  value: Readonly<Record<string, JsonValue>>;
  ordinal: number;
  fail: TraversalLocusFailure;
}>): TraversalLocusEvaluation {
  const { authority: runtime, stop } = input;
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
      runtime.predecessorPrefix,
      `interaction-${input.ordinal}`,
      "diagnostic://abiogenesis/interaction/admitted-basis-absent@5",
      stop as unknown as JsonValue,
    );
  }
  const clock = { eventTime: runtime.eventTime, correlationId: runtime.correlationId };
  const opened = Abg.openCCall({
    locusClass: "interaction",
    store: runtime.store,
    predecessorPrefix: runtime.predecessorPrefix,
    executionBasis: runtime.executionBasis,
    scope: runtime.openedTraversalScope,
    program: runtime.program,
    graphFunction: runtime.graphFunction,
    graph: runtime.graph,
    stop,
    interactionSet: runtime.interactionSet,
    interaction: row,
    basis: admissionBasis(clock, `interaction/${input.ordinal}/open`),
  });
  if (opened.kind !== "c_call_admission") {
    return input.fail(
      runtime.predecessorPrefix,
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
  const proposal = Routes.proposeHoldRoute(
    runtime.graph,
    stop,
    opened.cCall,
    plan.pending.judgment,
    plan.replayState,
    stop.continuationContractRef,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    throw new TypeError(`interaction hold refused: ${proposal.code}`);
  }
  const candidate = Abg.completeTraversalTransitionCandidate({
    kind: "traversal_transition_candidate",
    schemaVersion: "5.0.0",
    transitionClass: "route",
    route: proposal,
    evidence: {
      evidenceClass: "hold",
      graphFunction: runtime.graphFunction,
      cCall: opened.cCall,
      result: plan.pending.result,
      judgment: plan.pending.judgment,
    },
    terminalizeRun: false,
  });
  const admitted = Abg.admitFhInteractionHold({
    predecessorPrefix: opened.successorPrefix,
    store: runtime.store,
    executionBasis: runtime.executionBasis,
    scope: runtime.openedTraversalScope,
    program: runtime.program,
    graphFunction: runtime.graphFunction,
    graph: runtime.graph,
    interactionSet: runtime.interactionSet,
    cursor: stop.cursor,
    request: input.value,
    expectedInputDigest: stop.cursor.inputDigest,
    pendingPlan: plan,
    routeCandidate: candidate,
    productBasis,
    inputValue: input.value,
    pendingBasis,
    routeBasis: admissionBasis(clock, `interaction/${input.ordinal}/hold`),
    continuationBasis: admissionBasis(
      clock,
      `interaction/${input.ordinal}/continuation`,
    ),
  });
  return {
    completion: completion(
      "held",
      replayAtDurable(
        admitted.successorPrefix,
        runtime.openedTraversalScope.runId,
      ),
      admitted.successorPrefix,
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

function projectBlockedCCallCompletion(
  replayState: ReplayState,
  successorPrefix: DurablePrefixCoordinate,
  cCall: CCall,
  resultRef: string,
  judgmentRef: string,
  reasonRef: string,
  resultValue: JsonValue,
): ExecutableTraversalCompletion {
  return completion("blocked", replayState, successorPrefix, {
    cCallRef: cCall.cCallRef,
    resultRef,
    judgmentRef,
    resultValue,
    diagnosticRef: reasonRef,
  });
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
  const truth = Abg.projectRuntimeTruthAtDurablePrefix(
    input.predecessorPrefix,
    fresh.selector.runId,
  );
  const prefix = truth.runtimePrefix;
  const source = rehydrateHeldInteractionCursor(prefix, fresh.sourceCursor);
  if (source === null) throw new TypeError("retry source cursor is not admitted");
  const target = deriveRetryTraversalCursor(runtime.graph, source, {
    inputRef: fresh.inputRef,
    inputDigest: fresh.inputDigest,
  });
  if (target.kind !== "traversal_cursor") {
    throw new TypeError("retry target is not derivable from GTL");
  }
  const replayState = truth.replayState;
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
  const candidate = Abg.completeTraversalTransitionCandidate({
    kind: "traversal_transition_candidate",
    schemaVersion: "5.0.0",
    transitionClass: "retry",
    route: proposal,
    evidence: {
      evidenceClass: "retry",
      graphFunction: runtime.graphFunction,
      cCall: fresh.cCall,
      progress: fresh.progress,
    },
    retryInput: fresh.inputValue,
    terminalizeRun: false,
  });
  const transition = Abg.admitTraversalTransition({
    predecessorPrefix: input.predecessorPrefix,
    store: runtime.store,
    executionBasis: runtime.executionBasis,
    graph: runtime.graph,
    graphFunction: runtime.graphFunction,
    source,
    target,
    candidate,
    basis: admissionBasis(runtime.clock, "retry"),
  });
  if (transition.kind !== "route_transition_admission") {
    throw new TypeError(`retry transition refused: ${transition.code}`);
  }
  const cursor = applyAdmittedRoute(
    runtimePrefixAtDurable(transition.successorPrefix, source.runId),
    source,
    target,
    "retry",
    transition.route,
  );
  if (cursor.kind !== "traversal_cursor") {
    throw new TypeError("retry route cannot be applied");
  }
  const attempt = transition.retryAttempt;
  if (attempt === null) {
    throw new TypeError("retry attempt is absent from the admitted transition");
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
    routeAdmissionEventRef: transition.route.admissionEventRef,
    routeRef: transition.route.routeRef,
    routeDigest: transition.route.routeDigest,
    nextCursor: cursor,
    retryAttemptAdmissionEventRef: attempt.admissionEventRef,
    retryAttemptRef: attempt.attemptRef,
    retryAttemptDigest: attempt.attemptDigest,
    nextAttempt: fresh.nextAttempt,
    inputContractRef: fresh.inputContractRef,
    inputRef: fresh.inputRef,
    inputDigest: fresh.inputDigest,
    inputValue: fresh.inputValue,
    successorPrefix: transition.successorPrefix,
  });
}

function projectCCallCompletion(
  input: Readonly<{
    source: TraversalCursor;
  }>,
  admitted: Abg.CCallCompletionAdmission,
  target: TraversalCursor | null,
): ExecutableTraversalCompletion {
  if (admitted.disposition === "blocked") {
    const outcome = admitted.outcome;
    const cCall = outcome.disposition === "blocked"
      ? outcome.cCall
      : outcome.admitted.cCall;
    const result = outcome.disposition === "blocked"
      ? outcome.result
      : outcome.admitted.result;
    const resultRef = result.resultRef;
    const judgmentRef = outcome.disposition === "blocked"
      ? outcome.completion.rejectionJudgmentRef
      : outcome.admitted.judgment.judgmentRef;
    const reasonRef = outcome.disposition === "blocked"
      ? outcome.diagnosticRef
      : outcome.admitted.judgment.reasonRef;
    return projectBlockedCCallCompletion(
      admitted.transition.replayState,
      admitted.transition.successorPrefix,
      cCall,
      resultRef,
      judgmentRef,
      reasonRef,
      result.value,
    );
  }
  const { cCall, result, judgment } = admitted.outcome.admitted;
  if (admitted.disposition === "failed") {
    if (result.resultClass !== "failure") {
      throw new TypeError("failed CCall completion lacks a failure candidate");
    }
    return completion(
      "failed",
      admitted.transition.replayState,
      admitted.transition.successorPrefix,
      {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      resultValue: result.value,
      diagnosticRef: judgment.reasonRef,
      },
    );
  }
  if (admitted.disposition === "application_ready") {
    return completion(
      "application_ready",
      admitted.replayState,
      admitted.outcome.successorPrefix,
      {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      resultValue: result.value,
      },
    );
  }
  if (admitted.disposition === "advanced") {
    if (target === null) {
      throw new TypeError("advanced CCall completion lacks its HoG target");
    }
    const nextCursor = applyAdmittedRoute(
      runtimePrefixAtDurable(
        admitted.transition.successorPrefix,
        input.source.runId,
      ),
      input.source,
      target,
      "advance",
      admitted.transition.route,
    );
    if (nextCursor.kind === "traversal_refusal") {
      throw new TypeError(`leaf route application refused: ${nextCursor.code}`);
    }
    return completion(
      "advanced",
      admitted.transition.replayState,
      admitted.transition.successorPrefix,
      {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      nextCursor,
      resultValue: result.value,
      continuationKind: "advance",
      nextInputContractRef: cCall.outputContractRef,
      },
    );
  }
  if (admitted.disposition !== "closed") {
    throw new TypeError("unknown CCall completion");
  }
  return completion(
    "closed",
    admitted.closure.replayState,
    admitted.transition.successorPrefix,
    {
    cCallRef: cCall.cCallRef,
    resultRef: result.resultRef,
    judgmentRef: judgment.judgmentRef,
    closureRef: admitted.closure.closureRef,
    resultValue: result.value,
    },
  );
}

function workflowBasis(
  context: WorkflowParentContext,
  stage: string,
): RuntimeAdmissionBasis {
  return admissionBasis(
    {
      eventTime: context.authority.eventTime,
      correlationId:
        `${context.authority.correlationId}/workflow/${context.ordinal}`,
    },
    stage,
  );
}

function workflowFailure(
  context: WorkflowParentContext,
  predecessorPrefix: DurablePrefixCoordinate,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): ExecutableTraversalCompletion {
  const { authority: runtime } = context;
  const admitted = Abg.admitRuntimeFailure({
    store: runtime.store,
    predecessorPrefix,
    executionBasis: runtime.executionBasis,
    scope: runtime.openedTraversalScope,
    stage: "hog_traversal",
    subject: { stage, candidate },
    diagnosticRef,
    basis: workflowBasis(context, stage),
  });
  return completion(
    "failed",
    admitted.replayState,
    admitted.successorPrefix,
    { cCallRef: context.parentCCall.cCallRef, diagnosticRef },
  );
}

function completeBlockedWorkflowOutcome(
  context: WorkflowParentContext,
  outcome: Abg.BlockedCCallOutcomeReceipt,
  stage: string,
): ExecutableTraversalCompletion {
  const { authority: runtime } = context;
  const candidate = Routes.proposeCCallOutcomeTransition({
    graph: runtime.graph,
    graphFunction: runtime.graphFunction,
    sourceCursor: context.cursor,
    targetCursor: null,
    outcome,
    terminalizeNonAdvance: runtime.terminalMode !== "return_to_parent",
  });
  if (candidate.kind !== "traversal_transition_candidate") {
    return workflowFailure(
      context,
      outcome.successorPrefix,
      `${stage}-route-proposal`,
      `diagnostic://abiogenesis/hog/${candidate.code}@5`,
      candidate as unknown as JsonValue,
    );
  }
  const admitted = Abg.admitCCallCompletion({
    store: runtime.store,
    predecessorPrefix: outcome.successorPrefix,
    executionBasis: runtime.executionBasis,
    graph: runtime.graph,
    graphFunction: runtime.graphFunction,
    source: context.cursor,
    target: null,
    outcome,
    candidate,
    openedTraversalScope: runtime.openedTraversalScope,
    closureContract: runtime.closureContract,
    basis: workflowBasis(context, `${stage}-completion`),
    terminalMode: runtime.terminalMode ?? "close_run",
  });
  return admitted.kind === "c_call_completion_admission"
    ? projectCCallCompletion(
        { source: context.cursor },
        admitted,
        null,
      )
    : workflowFailure(
        context,
        outcome.successorPrefix,
        `${stage}-completion`,
        `diagnostic://abiogenesis/hog/${admitted.code}@5`,
        admitted as unknown as JsonValue,
      );
}

function rejectWorkflowAdmission(
  context: WorkflowParentContext,
  rejection: Abg.CCallAdmissionRejection,
  predecessorPrefix: DurablePrefixCoordinate,
  stage: string,
): ExecutableTraversalCompletion {
  const { authority: runtime } = context;
  return completeBlockedWorkflowOutcome(
    context,
    Abg.admitCCallRejection({
      store: runtime.store,
      predecessorPrefix,
      graph: runtime.graph,
      graphFunction: runtime.graphFunction,
      cursor: context.cursor,
      cCall: context.parentCCall,
      rejection,
      basis: workflowBasis(context, `${stage}-rejection`),
    }),
    stage,
  );
}

function beginWorkflowLocus(input: Readonly<{
  authority: WorkflowLocusAuthority;
  cursor: TraversalCursor;
  value: Readonly<Record<string, JsonValue>>;
  graphEntryInput: Readonly<Record<string, JsonValue>>;
  graphEntryInputDigest: `sha256:${string}`;
  ordinal: number;
  fail: TraversalLocusFailure;
}>): WorkflowLocusStep {
    const { authority: runtime, cursor, ordinal } = input;
    const term = resolveTraversalTerm(runtime.graph, cursor);
    if (term.kind !== "c_workflow") {
      return input.fail(
        runtime.predecessorPrefix,
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
        runtime.predecessorPrefix,
        `workflow-contract-${ordinal}`,
        "diagnostic://abiogenesis/hog/workflow-failure-contract-ambiguous@5",
        failureContracts as unknown as JsonValue,
      );
    }
    const opened = Abg.openCCall({
      locusClass: "workflow",
      store: runtime.store,
      predecessorPrefix: runtime.predecessorPrefix,
      executionBasis: runtime.executionBasis,
      implementationSet: runtime.implementationSet,
      scope: runtime.openedTraversalScope,
      program: runtime.program,
      graphFunction: runtime.graphFunction,
      graph: runtime.graph,
      proposal: {
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
      basis: admissionBasis(
        {
          eventTime: runtime.eventTime,
          correlationId: `${runtime.correlationId}/workflow/${ordinal}`,
        },
        "parent",
      ),
    });
    if (opened.kind !== "c_call_admission") {
      return input.fail(
        runtime.predecessorPrefix,
        `workflow-parent-${ordinal}`,
        `diagnostic://abiogenesis/hog/${opened.code}@5`,
        opened as unknown as JsonValue,
      );
    }
    const context: WorkflowParentContext = {
      kind: "workflow_child_fold_frame",
      authority: runtime,
      cursor,
      value: input.value,
      graphEntryInput: input.graphEntryInput,
      graphEntryInputDigest: input.graphEntryInputDigest,
      ordinal,
      workflowTerm: term,
      parentCCall: opened.cCall,
      application: fanOutApplicationForBatch(runtime.graph, opened.cCall.batchRef),
    };
    const intent = rehydrateConstructionIntentForCursorAtDurablePrefix(
      opened.successorPrefix,
      cursor,
    );
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
        opened.successorPrefix,
        `workflow-input-${ordinal}`,
        "diagnostic://abiogenesis/hog/workflow-selected-input-mismatch@5",
        term as unknown as JsonValue,
      );
    }
    const prepared = prepareChildTraversal(
      runtime.store,
      runtime.childTraversalBasis,
      {
      predecessorPrefix: opened.successorPrefix,
      parentExecutionBasis: runtime.executionBasis,
      parentTraversalScope: runtime.openedTraversalScope,
      parentCCallRef: opened.cCall.cCallRef,
      childGraphFunctionRef: term.graphFunctionRef,
      inputRef: selectedRef,
      inputDigest: selectedDigest,
      input: selectedValue,
      eventTime: runtime.eventTime,
      correlationId: `${runtime.correlationId}/workflow/${ordinal}/prepare`,
      },
    );
    if (prepared.kind !== "prepared_child_traversal") {
      const admission = Abg.admitChildPreparationRefusal({
        relationClass: "workflow",
        store: runtime.store,
        predecessorPrefix: prepared.successorPrefix,
        graph: runtime.graph,
        graphFunction: runtime.graphFunction,
        cursor,
        parentCCall: opened.cCall,
        candidate: {
          kind: "child_preparation_refusal_candidate",
          schemaVersion: "5.0.0",
          childGraphFunctionRef: term.graphFunctionRef,
          inputRef: selectedRef,
          inputDigest: selectedDigest,
          stage: prepared.stage,
          diagnosticRef: prepared.diagnosticRef,
          message: prepared.message,
        },
        basis: workflowBasis(context, "preparation-refusal"),
      });
      return {
        kind: "locus_evaluation",
        evaluation: {
          completion: admission.kind === "child_preparation_refusal_admission"
            ? rejectWorkflowAdmission(
                context,
                admission.admissionRejection,
                admission.successorPrefix,
                "preparation",
              )
            : workflowFailure(
                context,
                prepared.successorPrefix,
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
}

function completeWorkflowLocus(
  frame: WorkflowChildFoldFrame,
  child: ExecutableTraversalCompletion,
  failLocus: TraversalLocusFailure,
): TraversalLocusEvaluation {
  const {
    authority: runtime,
    cursor,
    workflowTerm,
    parentCCall,
    ordinal,
  } = frame;
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
        child.successorPrefix,
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
      application: frame.application,
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
        child.successorPrefix,
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
  if (outputKind === null || failureKind === null) {
    return failLocus(
      child.successorPrefix,
      `workflow-contract-${ordinal}`,
      "diagnostic://abiogenesis/hog/workflow-result-contract-absent@5",
      workflowTerm as unknown as JsonValue,
    );
  }
  const intent = rehydrateConstructionIntentForCursorAtDurablePrefix(
    child.successorPrefix,
    cursor,
  );
  const actionValue = intent?.actionKind === "invoke_graph_function" &&
      child.disposition === "closed" && child.closureRef !== null &&
      isJsonRecord(child.resultValue)
    ? deriveGraphFunctionActionEvaluationBasis(
        child.successorPrefix,
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
      child.successorPrefix,
      `workflow-action-${ordinal}`,
      "diagnostic://abiogenesis/hog/workflow-action-evaluation-basis-absent@5",
      workflowTerm as unknown as JsonValue,
    );
  }
  const foldback = Abg.admitChildFoldback({
    relationClass: "workflow",
    store: runtime.store,
    predecessorPrefix: child.successorPrefix,
    graph: runtime.graph,
    graphFunction: runtime.graphFunction,
    cursor,
    parentCCall,
    childExecutionBasis: frame.childExecutionBasis,
    childScope: frame.childTraversalScope,
    child: {
      childResultRef: child.resultRef,
      childJudgmentRef: child.judgmentRef,
      childClosureRef: child.closureRef,
    },
    basis: workflowBasis(frame, "child-foldback"),
  });
  if (foldback.kind !== "child_foldback_admission") {
    return {
      completion: workflowFailure(
        frame,
        child.successorPrefix,
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
  if (!isJsonRecord(childValue)) {
    return failLocus(
      foldback.successorPrefix,
      `workflow-result-${ordinal}`,
      "diagnostic://abiogenesis/hog/workflow-result-carrier-mismatch@5",
      childValue,
    );
  }
  const failureDiagnosticRef = child.diagnosticRef ??
    "diagnostic://abiogenesis/hog/child-traversal-blocked@5";
  const resultOutcome = Abg.admitCCallResult({
    outcomeClass: "workflow",
    resultDisposition: childSucceeded ? "success" : "failure",
    ...(childSucceeded ? {} : { failureDiagnosticRef }),
    store: runtime.store,
    predecessorPrefix: foldback.successorPrefix,
    executionBasis: runtime.executionBasis,
    graph: runtime.graph,
    graphFunction: runtime.graphFunction,
    cursor,
    cCall: parentCCall,
    leafPort: runtime.leafPort,
    input: frame.value,
    inputDigest: cursor.inputDigest,
    outputValueKind: outputKind,
    failureValueKind: failureKind,
    resultCandidate: childValue,
    foldback,
    basis: workflowBasis(frame, "result"),
  } as Abg.AdmitCCallResultInput);
  if (resultOutcome.disposition === "retry") {
    return failLocus(
      resultOutcome.successorPrefix,
      `workflow-outcome-${ordinal}`,
      "diagnostic://abiogenesis/hog/workflow-retry-outcome-invalid@5",
      resultOutcome as unknown as JsonValue,
    );
  }
  if (resultOutcome.disposition === "blocked") {
    return {
      completion: completeBlockedWorkflowOutcome(
        frame,
        resultOutcome,
        "result-rejection",
      ),
      outputValueKind: outputKind,
      outputContractRef: workflowTerm.outputCarrierRef,
    };
  }
  const judgmentRelation = runtime.leafPort.resolveJudgmentRelation(
    parentCCall.judgmentPredicateRef,
  );
  if (judgmentRelation === null) {
    return failLocus(
      resultOutcome.successorPrefix,
      `workflow-judgment-${ordinal}`,
      "diagnostic://abiogenesis/hog/workflow-judgment-relation-absent@5",
      parentCCall as unknown as JsonValue,
    );
  }
  const judgmentCandidate = proposeJudgmentCandidate({
    cCall: parentCCall,
    result: resultOutcome.result,
    replayState: resultOutcome.replayState,
    contractRef: parentCCall.judgmentContractRef,
    decision: childSucceeded
      ? {
          decisionClass: "evaluate",
          input: frame.value,
          relation: judgmentRelation,
        }
      : {
          decisionClass: "refuse",
          predicateRef: parentCCall.judgmentPredicateRef,
          reasonRef: failureDiagnosticRef,
        },
  });
  const outcome = Abg.admitCCallJudgment({
    store: runtime.store,
    graph: runtime.graph,
    graphFunction: runtime.graphFunction,
    cursor,
    outcome: resultOutcome,
    candidate: judgmentCandidate,
    basis: workflowBasis(frame, "judgment"),
  });
  if (outcome.disposition === "blocked") {
    return {
      completion: completeBlockedWorkflowOutcome(
        frame,
        outcome,
        "judgment-rejection",
      ),
      outputValueKind: outputKind,
      outputContractRef: workflowTerm.outputCarrierRef,
    };
  }
  const { result, judgment } = outcome.admitted;
  const fanOut = frame.application;
  if (fanOut === null) {
    let target: TraversalCursor | null = null;
    if (result.resultClass === "success" && judgment.judgment === "advance") {
      const derived = deriveCompletedTraversalCursor(runtime.graph, cursor, {
        inputRef: result.resultRef,
        inputDigest: result.valueDigest,
      });
      if (derived?.kind === "traversal_refusal") {
        return failLocus(
          outcome.successorPrefix,
          `workflow-continuation-${ordinal}`,
          `diagnostic://abiogenesis/hog/${derived.code}@5`,
          derived as unknown as JsonValue,
        );
      }
      target = derived;
    }
    const candidate = Routes.proposeCCallOutcomeTransition({
      graph: runtime.graph,
      graphFunction: runtime.graphFunction,
      sourceCursor: cursor,
      targetCursor: target,
      outcome,
      terminalizeNonAdvance: runtime.terminalMode !== "return_to_parent",
    });
    if (candidate.kind !== "traversal_transition_candidate") {
      return failLocus(
        outcome.successorPrefix,
        `workflow-route-${ordinal}`,
        `diagnostic://abiogenesis/hog/${candidate.code}@5`,
        candidate as unknown as JsonValue,
      );
    }
    const admitted = Abg.admitCCallCompletion({
      store: runtime.store,
      predecessorPrefix: outcome.successorPrefix,
      executionBasis: runtime.executionBasis,
      graph: runtime.graph,
      graphFunction: runtime.graphFunction,
      source: cursor,
      target,
      outcome,
      candidate,
      openedTraversalScope: runtime.openedTraversalScope,
      closureContract: runtime.closureContract,
      basis: workflowBasis(frame, "completion"),
      terminalMode: runtime.terminalMode ?? "close_run",
    });
    if (admitted.kind !== "c_call_completion_admission") {
      return failLocus(
        outcome.successorPrefix,
        `workflow-completion-${ordinal}`,
        `diagnostic://abiogenesis/hog/${admitted.code}@5`,
        admitted as unknown as JsonValue,
      );
    }
    return {
      completion: projectCCallCompletion(
        { source: cursor },
        admitted,
        target,
      ),
      outputValueKind: outputKind,
      outputContractRef: workflowTerm.outputCarrierRef,
    };
  }
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
    predecessorPrefix: outcome.successorPrefix,
    executionBasis: runtime.executionBasis,
    graph: runtime.graph,
    application: fanOut,
    sourceCursor: cursor,
    replayState: outcome.replayState,
    completionKind: completeVector ? "complete_vector" : "partial_stop",
    validateOutputVector: (value): value is Readonly<Record<string, JsonValue>> =>
      runtime.leafPort.validateContractValue(
        fanOut.outputVectorRef,
        "output",
        value,
      ),
    basis: workflowBasis(frame, "fan-out-completion"),
  });
  if (fanOutCompletion.kind !== "fan_out_completion_receipt") {
    return failLocus(
      outcome.successorPrefix,
      `fan-out-${ordinal}`,
      `diagnostic://abiogenesis/hog/${fanOutCompletion.code}@5`,
      fanOutCompletion as unknown as JsonValue,
    );
  }
  const fanOutAdmission = fanOutCompletion.admission;
  let target: TraversalCursor | null = null;
  if (fanOutAdmission.completionKind === "complete_vector") {
    const derived = deriveCompletedTraversalCursor(runtime.graph, cursor, {
      inputRef: fanOutAdmission.outputVectorRef,
      inputDigest: fanOutAdmission.outputVectorDigest,
    });
    if (derived?.kind === "traversal_refusal") {
      return failLocus(
        fanOutCompletion.successorPrefix,
        `fan-out-continuation-${ordinal}`,
        `diagnostic://abiogenesis/hog/${derived.code}@5`,
        derived as unknown as JsonValue,
      );
    }
    target = derived;
  }
  const fanOutReplay = Abg.projectRuntimeTruthAtDurablePrefix(
    fanOutCompletion.successorPrefix,
    runtime.openedTraversalScope.runId,
  ).replayState;
  const route = Routes.proposeFanOutRoute(
    runtime.graph,
    fanOut,
    cursor,
    target,
    parentCCall,
    fanOutAdmission,
    fanOutReplay,
    parentCCall.transitionContractRef,
  );
  if (route.kind !== "traversal_route_candidate") {
    return failLocus(
      fanOutCompletion.successorPrefix,
      `fan-out-route-${ordinal}`,
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
      evidenceClass: "fan_out",
      graphFunction: runtime.graphFunction,
      cCall: parentCCall,
      result,
      judgment,
      application: fanOut,
      completion: fanOutAdmission,
      completedProgresses: [],
    },
    terminalizeRun: route.routeKind !== "advance" &&
      runtime.terminalMode !== "return_to_parent",
  });
  const admitted = Abg.admitCCallCompletion({
    store: runtime.store,
    predecessorPrefix: fanOutCompletion.successorPrefix,
    executionBasis: runtime.executionBasis,
    graph: runtime.graph,
    graphFunction: runtime.graphFunction,
    source: cursor,
    target,
    outcome,
    candidate,
    openedTraversalScope: runtime.openedTraversalScope,
    closureContract: runtime.closureContract,
    basis: workflowBasis(frame, "fan-out-completion-route"),
    terminalMode: runtime.terminalMode ?? "close_run",
  });
  if (admitted.kind !== "c_call_completion_admission") {
    return failLocus(
      fanOutCompletion.successorPrefix,
      `fan-out-route-${ordinal}`,
      `diagnostic://abiogenesis/hog/${admitted.code}@5`,
      admitted as unknown as JsonValue,
    );
  }
  if (admitted.disposition === "advanced") {
    if (fanOutAdmission.completionKind !== "complete_vector" || target === null) {
      return failLocus(
        admitted.transition.successorPrefix,
        `fan-out-route-${ordinal}`,
        "diagnostic://abiogenesis/hog/fan-out-advance-without-vector@5",
        admitted as unknown as JsonValue,
      );
    }
    const nextCursor = applyAdmittedRoute(
      runtimePrefixAtDurable(
        admitted.transition.successorPrefix,
        cursor.runId,
      ),
      cursor,
      target,
      "advance",
      admitted.transition.route,
    );
    if (nextCursor.kind === "traversal_refusal") {
      return failLocus(
        admitted.transition.successorPrefix,
        `workflow-route-${ordinal}`,
        `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
        nextCursor as unknown as JsonValue,
      );
    }
    return {
      completion: completion(
        "advanced",
        admitted.transition.replayState,
        admitted.transition.successorPrefix,
        {
        cCallRef: parentCCall.cCallRef,
        resultRef: fanOutAdmission.outputVectorRef,
        judgmentRef: judgment.judgmentRef,
        nextCursor,
        resultValue: fanOutAdmission.outputVector,
        continuationKind: "advance",
        nextInputContractRef: fanOutAdmission.outputVectorContractRef,
        },
      ),
      outputValueKind: outputKind,
      outputContractRef: workflowTerm.outputCarrierRef,
    };
  }
  return {
    completion: projectCCallCompletion(
      { source: cursor },
      admitted,
      target,
    ),
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
  clock: ExecutableTraversalClock,
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
  clock: ExecutableTraversalClock,
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
  const route = Routes.proposeJudgedRoute(
    state.input.graph,
    state.input.traversalStop.cursor,
    state.targetCursor,
    state.cCall,
    state.result,
    state.judgment,
    outcome.replayState,
    state.cCall.transitionContractRef,
  );
  if (route.kind !== "traversal_route_candidate") {
    return recursionFailure(
      state,
      outcome.successorPrefix,
      clock,
      "terminal-route",
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
      evidenceClass: "judged",
      graphFunction: state.input.graphFunction,
      cCall: state.cCall,
      result: state.result,
      judgment: state.judgment,
      completedProgresses: [],
    },
    terminalizeRun: route.routeKind !== "advance" &&
      state.input.applicationCompletionMode !== "return_to_parent",
  });
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
    terminalMode: state.input.applicationCompletionMode ?? "close_run",
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
    { source: state.input.traversalStop.cursor },
    admitted,
    state.targetCursor,
  );
}

function blockRecursion(
  state: DeferredApplicationState,
  application: Readonly<RecurseApplication>,
  clock: ExecutableTraversalClock,
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
    terminalizeRun:
      state.input.applicationCompletionMode !== "return_to_parent",
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
    terminalMode: state.input.applicationCompletionMode ?? "close_run",
  });
  const requiresRunStop =
    state.input.applicationCompletionMode !== "return_to_parent";
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

function beginRecursionApplication(input: Readonly<{
  traversalInput: CompleteExecutableTraversalInput<
    Readonly<Record<string, JsonValue>>
  >;
  childTraversalBasis: ChildTraversalBasis;
  parentClock: ExecutableTraversalClock;
  application: Readonly<RecurseApplication>;
  completion: ExecutableTraversalCompletion;
  graphEntryInput: Readonly<Record<string, JsonValue>>;
  graphEntryInputDigest: `sha256:${string}`;
  leafOrdinal: number;
  fail: TraversalLocusFailure;
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
      return input.fail(
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
      return input.fail(
        coordinates.successorPrefix,
        `recursion-restoration-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/recursion-restoration-mismatch@5",
        coordinates as unknown as JsonValue,
      );
    }
    const state = requireDeferredApplication(restored, restoration);
    const clock = (stage: string): ExecutableTraversalClock => ({
      eventTime: input.parentClock.eventTime,
      correlationId:
        `${input.parentClock.correlationId}/recursion/${leafOrdinal}/${stage}`,
    });
    const termination = restored.resultValue === null
      ? null
      : recursionTerminationDecision(application, restored.resultValue);
    if (termination === null) {
      return input.fail(
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
      return input.fail(
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
        parentTerminalMode:
          traversalInput.applicationCompletionMode ?? "close_run",
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

function completeRecursionChild(
  frame: RecursionChildFoldFrame,
  child: ExecutableTraversalCompletion,
): ExecutableTraversalCompletion {
  const state = requireDeferredApplication(frame.restored, frame.restoration);
  const clock: ExecutableTraversalClock = {
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
      terminalMode: frame.parentTerminalMode,
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
      state.input.applicationCompletionMode !== "return_to_parent",
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
    terminalMode: state.input.applicationCompletionMode ?? "close_run",
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
    if (
      admitted.disposition !== "blocked" ||
      admitted.transition.route.runStoppedEventRef === null
    ) {
      return recursionFailure(
        state,
        admitted.disposition === "blocked"
          ? admitted.transition.successorPrefix
          : foldbackReceipt.successorPrefix,
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

function beginExecutableLocus(input: Readonly<{
  authority: ExecutableLocusAuthority;
  stop: ExecutableCCallLocusCandidate;
  value: Readonly<Record<string, JsonValue>>;
  graphEntryInput: Readonly<Record<string, JsonValue>>;
  graphEntryInputDigest: `sha256:${string}`;
  ordinal: number;
  fail: TraversalLocusFailure;
}>): Effect.Effect<ExecutableLocusStep> {
  return Effect.gen(function* () {
    const { authority: runtime, stop } = input;
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
        runtime.predecessorPrefix,
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
      predecessorPrefix: runtime.predecessorPrefix,
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
    const opened = Abg.openCCall({
      locusClass: "implementation",
      store: leaf.store,
      predecessorPrefix: leaf.predecessorPrefix,
      executionBasis: leaf.executionBasis,
      scope: leaf.openedTraversalScope,
      program: leaf.program,
      graphFunction: leaf.graphFunction,
      graph: leaf.graph,
      stop,
      implementationSet: leaf.implementationSet,
      resolution,
      basis: admissionBasis(leaf.clock, "open"),
    });
    if (opened.kind !== "c_call_admission") {
      return input.fail(
        runtime.predecessorPrefix,
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
    const invocation = yield* Effect.promise(() =>
      leaf.leafPort.invoke({
      resolution,
      input: leaf.input,
      inputDigest: leaf.inputDigest,
      failureContractRef: stop.failureContractRef,
      bindProbabilisticEffects,
      }),
    );
    if (invocation.kind === "leaf_invocation_owner_refusal") {
      return input.fail(
        opened.successorPrefix,
        `leaf-owner-${input.ordinal}`,
        invocation.diagnosticRef,
        invocation as unknown as JsonValue,
      );
    }
    const outcomeInput = {
      outcomeClass: "leaf",
      store: leaf.store,
      predecessorPrefix: opened.successorPrefix,
      executionBasis: leaf.executionBasis,
      implementationSet: leaf.implementationSet,
      graph: leaf.graph,
      graphFunction: leaf.graphFunction,
      cursor: stop.cursor,
      cCall: opened.cCall,
      resolution,
      leafPort: leaf.leafPort,
      input: leaf.input,
      inputDigest: leaf.inputDigest,
      ownerReceipt: invocation,
      outputValueKind,
      failureValueKind,
      basis: admissionBasis(leaf.clock, "outcome"),
    } as const;
    const resultOutcome = stop.computeRegime === "F_P"
      ? Abg.admitCCallResult({
          ...outcomeInput,
          regime: "F_P",
          actorRuntimeBinding: runtime.actorRuntimeBinding,
        })
      : Abg.admitCCallResult({
          ...outcomeInput,
          regime: "F_D",
        });
    const admitted = resultOutcome.disposition !== "result"
      ? resultOutcome
      : (() => {
          const relation = leaf.leafPort.resolveJudgmentRelation(
            resultOutcome.cCall.judgmentPredicateRef,
          );
          if (relation === null) {
            throw new TypeError("admitted leaf lacks its declared judgment relation");
          }
          const candidate = proposeJudgmentCandidate({
            cCall: resultOutcome.cCall,
            result: resultOutcome.result,
            replayState: resultOutcome.replayState,
            contractRef: resultOutcome.cCall.judgmentContractRef,
            decision: invocation.candidate.disposition === "success"
              ? {
                  decisionClass: "evaluate",
                  input: leaf.input,
                  relation,
                }
              : {
                  decisionClass: "refuse",
                  predicateRef: resultOutcome.cCall.judgmentPredicateRef,
                  reasonRef: invocation.candidate.diagnosticRef,
                },
          });
          return Abg.admitCCallJudgment({
            store: leaf.store,
            graph: leaf.graph,
            graphFunction: leaf.graphFunction,
            cursor: stop.cursor,
            outcome: resultOutcome,
            candidate,
            basis: admissionBasis(leaf.clock, "judgment"),
          });
        })();
    if (admitted.disposition === "retry") {
      const prefix = Abg.projectRuntimeTruthAtDurablePrefix(
        admitted.successorPrefix,
        stop.cursor.runId,
      ).authorityPrefix;
      const failureBasis = admissionBasis(leaf.clock, "runtime-failure");
      const failurePlan = AbgRetry.planRetryRuntimeFailureTransition(
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
        failureBasis,
      );
      if (failurePlan.kind !== "retry_runtime_failure_transition_plan") {
        throw new TypeError(`retry transition refused: ${failurePlan.code}`);
      }
      const transition = failurePlan.transition;
      if (transition.disposition === "blocked") {
        const proposal = Routes.proposeBlockedRoute(
          leaf.graph,
          stop,
          admitted.cCall,
          transition.close.judgment.judgmentRef,
          failurePlan.replayState,
          admitted.cCall.transitionContractRef,
          transition.stoppedProgresses.map((progress) => progress.progressRef),
        );
        if (proposal.kind !== "traversal_route_candidate") {
          throw new TypeError(`retry blocked route refused: ${proposal.code}`);
        }
        const candidate = Abg.completeTraversalTransitionCandidate({
          kind: "traversal_transition_candidate",
          schemaVersion: "5.0.0",
          transitionClass: "route",
          route: proposal,
          evidence: {
            evidenceClass: "blocked",
            graphFunction: leaf.graphFunction,
            cCall: admitted.cCall,
            resultRef: transition.close.result.resultRef,
            judgmentRef: transition.close.judgment.judgmentRef,
            judgmentEventRef: transition.close.judgment.admissionEventRef,
            reasonRef: transition.close.judgment.reasonRef,
            stoppedProgresses: transition.stoppedProgresses,
          },
          terminalizeRun: leaf.terminalMode !== "return_to_parent",
        });
        const route = Abg.admitBlockedRetryTraversalTransition({
          predecessorPrefix: admitted.successorPrefix,
          store: leaf.store,
          executionBasis: leaf.executionBasis,
          graph: leaf.graph,
          graphFunction: leaf.graphFunction,
          source: stop.cursor,
          target: null,
          candidate,
          basis: admissionBasis(leaf.clock, "runtime-failure/blocked-route"),
          failureSource: admitted.source,
          failureCandidate: admitted.failureCandidate,
          failureValueKind: admitted.failureValueKind,
          failureBasis,
          failurePlan,
        });
        if (route.kind !== "route_transition_admission") {
          throw new TypeError(`retry blocked route refused: ${route.code}`);
        }
        const close = transition.close;
        return { kind: "locus_evaluation" as const, evaluation: {
          completion: completion(
            "blocked",
            route.replayState,
            route.successorPrefix,
            {
              cCallRef: admitted.cCall.cCallRef,
              resultRef: close.result.resultRef,
              judgmentRef: close.judgment.judgmentRef,
              resultValue: close.result.value,
              diagnosticRef: close.judgment.reasonRef,
            },
          ),
          outputValueKind,
          outputContractRef: stop.outputContractRef,
        } };
      }
      const retryTransition = AbgRetry.admitRetryRuntimeFailureTransition(
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
        failureBasis,
      );
      if (
        retryTransition.kind !==
          "retry_runtime_failure_transition_admission"
      ) {
        throw new TypeError(
          `retry transition refused: ${retryTransition.code}`,
        );
      }
      const retry = AbgRetry.projectExecutableRetryInput({
        prefix: retryTransition.successorPrefix,
        selector: {
          kind: "retry_frontier_selector",
          schemaVersion: "5.0.0",
          runId: leaf.openedTraversalScope.runId,
          graphCallId: leaf.openedTraversalScope.graphCallId,
          frameId: leaf.openedTraversalScope.frameId,
          retryBoundaryRef: retryTransition.progress.retryBoundaryRef,
          retryProgressRef: retryTransition.progress.progressRef,
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
          predecessorPrefix: retryTransition.successorPrefix,
          retry,
        }),
        correlationId: `${runtime.correlationId}/retry/${retry.nextAttempt}`,
      };
    }
    let target: TraversalCursor | null = null;
    if (
      admitted.disposition === "judged" &&
      admitted.admitted.result.resultClass === "success" &&
      admitted.admitted.judgment.judgment === "advance" &&
      leaf.terminalMode !== "return_to_application"
    ) {
      const derived = deriveCompletedTraversalCursor(
        leaf.graph,
        stop.cursor,
        {
          inputRef: admitted.admitted.result.resultRef,
          inputDigest: admitted.admitted.result.valueDigest,
        },
      );
      if (derived?.kind === "traversal_refusal") {
        throw new TypeError(`leaf continuation refused: ${derived.code}`);
      }
      target = derived;
    }
    const terminalMode = leaf.terminalMode ?? "close_run";
    const applicationReady = admitted.disposition === "judged" &&
      terminalMode === "return_to_application" &&
      admitted.admitted.result.resultClass === "success" &&
      admitted.admitted.judgment.judgment === "advance";
    const proposedTransition = applicationReady
      ? null
      : Routes.proposeCCallOutcomeTransition({
          graph: leaf.graph,
          graphFunction: leaf.graphFunction,
          sourceCursor: stop.cursor,
          targetCursor: admitted.disposition === "blocked" ? null : target,
          outcome: admitted,
          terminalizeNonAdvance: terminalMode !== "return_to_parent",
        });
    if (
      proposedTransition !== null &&
      proposedTransition.kind !== "traversal_transition_candidate"
    ) {
      throw new TypeError(
        `CCall route proposal refused: ${proposedTransition.code}`,
      );
    }
    const transitionCandidate = proposedTransition;
    const completionAdmission = Abg.admitCCallCompletion({
      store: leaf.store,
      predecessorPrefix: admitted.successorPrefix,
      executionBasis: leaf.executionBasis,
      graph: leaf.graph,
      graphFunction: leaf.graphFunction,
      source: stop.cursor,
      target: admitted.disposition === "blocked" ? null : target,
      outcome: admitted,
      candidate: transitionCandidate,
      openedTraversalScope: leaf.openedTraversalScope,
      closureContract: leaf.closureContract,
      basis: admissionBasis(leaf.clock, "completion"),
      terminalMode,
    });
    if (completionAdmission.kind !== "c_call_completion_admission") {
      throw new TypeError(
        `CCall completion refused: ${completionAdmission.code}`,
      );
    }
    let completed = projectCCallCompletion(
      { source: stop.cursor },
      completionAdmission,
      target,
    );
    if (application !== null && completed.disposition === "application_ready") {
      const recursion = beginRecursionApplication({
        traversalInput: {
          ...leaf,
          predecessorPrefix: completed.successorPrefix,
        },
        childTraversalBasis: runtime.childTraversalBasis,
        parentClock: {
          eventTime: runtime.eventTime,
          correlationId: runtime.correlationId,
        },
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

function isJsonRecord(
  value: unknown,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

interface TraversalEvaluationFrame {
  readonly runtime: ExecuteGraphTraversalCommonInput;
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
  predecessorPrefix: DurablePrefixCoordinate,
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
  readonly authority: WorkflowLocusAuthority;
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
  readonly parentClock: ExecutableTraversalClock;
  readonly parentTerminalMode: "close_run" | "return_to_parent";
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

interface WorkflowReturnFrame {
  readonly kind: "workflow_return";
  readonly parent: TraversalEvaluationFrame;
  readonly workflow: WorkflowChildFoldFrame;
}

interface RecursionReturnFrame {
  readonly kind: "recursion_return";
  readonly parent: TraversalEvaluationFrame;
  readonly recursion: RecursionChildFoldFrame;
  readonly outputValueKind: string;
  readonly outputContractRef: string;
}

type TraversalReturnFrame =
  | WorkflowReturnFrame
  | RecursionReturnFrame;

interface StructuralTraversalAdvance {
  readonly kind: "structural_advance";
  readonly cursor: TraversalCursor;
  readonly successorPrefix: DurablePrefixCoordinate;
}

interface TraversalEvaluationSeed {
  readonly stateKind: "evaluate";
  readonly frame: TraversalEvaluationFrame;
  readonly returns: readonly TraversalReturnFrame[];
}

interface TraversalReturnSeed {
  readonly stateKind: "return";
  readonly completion: ExecutableTraversalCompletion;
  readonly returns: readonly TraversalReturnFrame[];
}

type TraversalProgramSeed =
  | TraversalEvaluationSeed
  | TraversalReturnSeed;

type TraversalMachineState =
  | Readonly<{
      stateKind: "evaluate";
      frame: TraversalEvaluationFrame;
      returns: readonly TraversalReturnFrame[];
    }>
  | Readonly<{
      stateKind: "return";
      completion: ExecutableTraversalCompletion;
      returns: readonly TraversalReturnFrame[];
    }>
  | Readonly<{
      stateKind: "done";
      completion: ExecutableTraversalCompletion;
    }>;

type TraversalLocusStep = WorkflowLocusStep | ExecutableLocusStep;

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
      !AbgRetry.isProjectedRetryResumeCarrier(candidate)
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
    const reprojected = AbgRetry.projectRetryResumeAtDurablePrefix(
      candidate,
      input.executionBasis,
      input.graph,
      input.graphFunction,
    );
    if (reprojected === null) {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-projection-mismatch@5",
      );
    }
    let traversal;
    try {
      traversal = traverseFromCursor(traversalBasis(input), candidate.nextCursor);
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
      input.predecessorPrefix,
      "leaf-port",
      "diagnostic://abiogenesis/implementation/admitted-leaf-port-mismatch@5",
      { implementationSetRef: input.implementationSet.implementationSetRef },
    );
  }
  let stop: TraverseResult;
  let resumedCursor: TraversalCursor | undefined = projectedCursor ?? undefined;
  let fallbackInput: Readonly<Record<string, JsonValue>>;
  if (projectedStop !== null && projectedInput !== null) {
    stop = projectedStop;
    fallbackInput = projectedInput;
  } else if (initialInput?.resume !== undefined) {
    resumedCursor = initialInput.resume.cursor;
    if (
      !hasAdmittedTraversalCursorAtPrefix(
        runtimePrefixAtDurable(
          input.predecessorPrefix,
          initialInput.resume.cursor.runId,
        ),
        initialInput.resume.cursor,
      ) ||
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
        input.predecessorPrefix,
        "resume-basis",
        "diagnostic://abiogenesis/hog/resume-basis-mismatch@5",
        {
          cursorRef: initialInput.resume.cursor.cursorRef,
          inputDigest: initialInput.resume.inputDigest,
        },
      );
    }
    stop = traverseFromCursor(
      traversalBasis(input),
      initialInput.resume.cursor,
    );
    fallbackInput = initialInput.resume.input;
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
        input.predecessorPrefix,
        "initial-traversal",
        "diagnostic://abiogenesis/hog/traversal-exception@5",
        { errorClass: "traversal_exception" },
      );
    }
    fallbackInput = initialInput.input;
  }
  const active = stop.kind === "traversal_stop_ref"
    ? stop.cursor
    : stop.kind === "traversal_cursor" && isTraversalCursorCandidate(stop)
      ? stop
      : null;
  const currentInput = materializedInputAtCursor(input.graph, active)?.value ??
    fallbackInput;
  const graphEntryBasis = projectedExecutionBasis ?? input.executionBasis;
  const graphEntryInput = graphEntryBasis.rawInputValue;
  const graphEntryInputDigest = graphEntryBasis.rawInputDigest;
  if (stop.kind === "traversal_refusal") {
    return fail(
      input,
      input.predecessorPrefix,
      "initial-traversal-refusal",
      `diagnostic://abiogenesis/hog/${stop.code}@5`,
      stop as unknown as JsonValue,
    );
  }
  const initialCursor = stop.kind === "traversal_stop_ref" ? stop.cursor : stop;
  let activeRuntime: ExecuteGraphTraversalCommonInput = input;
  if (resumedCursor === undefined) {
    const cursorAdmission = admitInitialTraversalCursor(
      input.store,
      input.predecessorPrefix,
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
        input.predecessorPrefix,
        "cursor-refusal",
        `diagnostic://abiogenesis/hog/${cursorAdmission.code}@5`,
        cursorAdmission as unknown as JsonValue,
      );
    }
    activeRuntime = {
      ...input,
      predecessorPrefix: cursorAdmission.successorPrefix,
    };
  }

  return {
    runtime: activeRuntime,
    graphEntryInput,
    graphEntryInputDigest,
    cursor: initialCursor,
    input: currentInput,
    ordinal: 0,
    structuralOrdinal: 0,
  };
}

function evaluateTraversalProgram(
  initialState: TraversalProgramSeed,
): Effect.Effect<ExecutableTraversalCompletion> {
  return Effect.suspend(() => {
    const termFor = (
      frame: TraversalEvaluationFrame,
    ): Readonly<CProgramNode> => {
      const runtime = frame.runtime;
      const term = resolveTraversalTerm(runtime.graph, frame.cursor);
      return term.kind === "traversal_refusal"
        ? fail(
            runtime,
            runtime.predecessorPrefix,
            `term-${frame.ordinal}`,
            `diagnostic://abiogenesis/hog/${term.code}@5`,
            term as unknown as JsonValue,
          )
        : term;
    };

    const evaluateLocusOnce = (
      frame: TraversalEvaluationFrame,
      term: Readonly<CProgramNode>,
    ): Effect.Effect<TraversalLocusStep> => Effect.suspend(
      (): Effect.Effect<TraversalLocusStep> => {
        const runtime = frame.runtime;
        const failLocus = (
          predecessorPrefix: DurablePrefixCoordinate,
          stage: string,
          diagnosticRef: string,
          candidate: JsonValue,
        ): never => fail(
          runtime,
          predecessorPrefix,
          stage,
          diagnosticRef,
          candidate,
        );
        if (term.kind === "c_workflow") {
          if (!isExactLocusStep(frame.cursor, term)) {
            return failLocus(
              runtime.predecessorPrefix,
              `workflow-step-${frame.ordinal}`,
              "diagnostic://abiogenesis/hog/workflow-step-mismatch@5",
              frame.cursor as unknown as JsonValue,
            );
          }
          return Effect.sync(() => beginWorkflowLocus({
            authority: workflowLocusAuthority(runtime),
            cursor: frame.cursor,
            value: frame.input,
            graphEntryInput: frame.graphEntryInput,
            graphEntryInputDigest: frame.graphEntryInputDigest,
            ordinal: frame.ordinal,
            fail: failLocus,
          }));
        }
        if (term.kind !== "c_of") {
          return failLocus(
            runtime.predecessorPrefix,
            `direct-step-${frame.ordinal}`,
            "diagnostic://abiogenesis/hog/direct-c-step-mismatch@5",
            frame.cursor as unknown as JsonValue,
          );
        }
        const currentStop = traverseFromCursor(
          traversalBasis(runtime),
          frame.cursor,
          term,
        );
        if (
          currentStop.kind !== "traversal_stop_ref" ||
          !isExactLocusStep(currentStop, term)
        ) {
          return failLocus(
            runtime.predecessorPrefix,
            `direct-step-${frame.ordinal}`,
            "diagnostic://abiogenesis/hog/direct-c-step-mismatch@5",
            currentStop as unknown as JsonValue,
          );
        }
        if (term.fibre === "F_H") {
          if (currentStop.stopClass !== "interaction") {
            return failLocus(
              runtime.predecessorPrefix,
              `interaction-step-${frame.ordinal}`,
              "diagnostic://abiogenesis/hog/interaction-step-mismatch@5",
              currentStop as unknown as JsonValue,
            );
          }
          return Effect.sync(() => ({
            kind: "locus_evaluation" as const,
            evaluation: evaluateInteractionLocus({
              authority: interactionLocusAuthority(runtime),
              stop: currentStop,
              value: frame.input,
              ordinal: frame.ordinal,
              fail: failLocus,
            }),
          }));
        }
        if (currentStop.stopClass !== "executable") {
          return failLocus(
            runtime.predecessorPrefix,
            `executable-step-${frame.ordinal}`,
            "diagnostic://abiogenesis/hog/executable-step-mismatch@5",
            currentStop as unknown as JsonValue,
          );
        }
        return beginExecutableLocus({
          authority: executableLocusAuthority(runtime),
          stop: currentStop,
          value: frame.input,
          graphEntryInput: frame.graphEntryInput,
          graphEntryInputDigest: frame.graphEntryInputDigest,
          ordinal: frame.ordinal,
          fail: failLocus,
        });
      },
    );

    const evaluateStructuralOnce = (
      frame: TraversalEvaluationFrame,
      step: Exclude<Readonly<CProgramNode>, Readonly<{ kind: "c_of" | "c_workflow" }>>,
    ): StructuralTraversalAdvance => {
      const runtime = frame.runtime;
            if (
              !isAdmittedLeafInvocationPort(runtime.leafPort) ||
              runtime.leafPort.implementationSetRef !==
                runtime.executionBasis.implementationSetRef ||
              runtime.leafPort.implementationSetDigest !==
                runtime.executionBasis.implementationSetDigest
            ) {
              return fail(
                runtime,
                runtime.predecessorPrefix,
                `structural-step-${frame.ordinal}`,
                "diagnostic://abiogenesis/hog/structural-step-refused@5",
                step as unknown as JsonValue,
              );
            }
            const target = deriveStructuralTargetCursor(
              runtime.graph,
              frame.cursor,
              step,
            );
            if (target === null || target.kind === "traversal_refusal") {
              return fail(
                runtime,
                runtime.predecessorPrefix,
                `structural-step-${frame.ordinal}`,
                "diagnostic://abiogenesis/hog/structural-step-refused@5",
                (target ?? step) as unknown as JsonValue,
              );
            }
            const retryInput = step.kind === "c_retry"
              ? materializedInputAtCursor(runtime.graph, target)?.value ??
                frame.input
              : null;
            if (
              step.kind === "c_retry" &&
              (retryInput === null ||
                target.inputDigest !== sha256Canonical(retryInput) ||
                !runtime.leafPort.validateContractValueByRef(
                  step.inputCarrierRef,
                  retryInput,
                ))
            ) {
              return fail(
                runtime,
                runtime.predecessorPrefix,
                `structural-step-${frame.ordinal}`,
                "diagnostic://abiogenesis/hog/structural-step-refused@5",
                step as unknown as JsonValue,
              );
            }
            const exitsRetry = step.kind === "c_identity" &&
              target.retryPath.length < frame.cursor.retryPath.length;
            const predecessorRunPrefix = runtimePrefixAtDurable(
              runtime.predecessorPrefix,
              frame.cursor.runId,
            );
            const completionWitnessEventRef = exitsRetry
              ? traversalCursorAdmissionEventRefAtPrefix(
                  predecessorRunPrefix,
                  frame.cursor,
                )
              : null;
            if (exitsRetry && completionWitnessEventRef === null) {
              return fail(
                runtime,
                runtime.predecessorPrefix,
                `structural-step-${frame.ordinal}`,
                "diagnostic://abiogenesis/hog/structural-step-refused@5",
                step as unknown as JsonValue,
              );
            }
            const progressBasis = admissionBasis(
              {
                eventTime: runtime.eventTime,
                correlationId:
                  `${runtime.correlationId}/structural/${frame.ordinal}`,
              },
              `progress/${frame.structuralOrdinal}`,
            );
            const completion = {
              completionClass: "structural_identity_success" as const,
              completionWitnessEventRef: completionWitnessEventRef!,
            };
            const progressPlan = exitsRetry
              ? AbgRetry.planCompletedRetryProgress(
                  runtime.predecessorPrefix,
                  runtime.graph,
                  runtime.graphFunction,
                  frame.cursor,
                  target,
                  completion,
                  progressBasis,
                )
              : null;
            if (
              progressPlan !== null &&
              progressPlan.kind !== "completed_retry_progress_plan"
            ) {
              return fail(
                runtime,
                runtime.predecessorPrefix,
                `structural-progress-${frame.ordinal}`,
                `diagnostic://abiogenesis/hog/${progressPlan.code}@5`,
                progressPlan as unknown as JsonValue,
              );
            }
            const replayState = progressPlan?.replayState ??
              replayAtDurable(
                runtime.predecessorPrefix,
                frame.cursor.runId,
              );
            const progresses = progressPlan?.progresses ?? [];
            const routeKind = step.kind === "c_retry"
              ? "retry" as const
              : "advance" as const;
            const proposal = Routes.proposeStructuralRoute(
              runtime.graph,
              frame.cursor,
              target,
              routeKind,
              replayState,
              progresses,
            );
            if (proposal.kind !== "traversal_route_candidate") {
              return fail(
                runtime,
                runtime.predecessorPrefix,
                `structural-route-${frame.ordinal}`,
                `diagnostic://abiogenesis/hog/${proposal.code}@5`,
                proposal as unknown as JsonValue,
              );
            }
            const candidate = routeKind === "retry"
              ? Abg.completeTraversalTransitionCandidate({
                  kind: "traversal_transition_candidate",
                  schemaVersion: "5.0.0",
                  transitionClass: "retry",
                  route: proposal,
                  evidence: null,
                  retryInput: retryInput!,
                  terminalizeRun: false,
                })
              : Abg.completeTraversalTransitionCandidate({
                  kind: "traversal_transition_candidate",
                  schemaVersion: "5.0.0",
                  transitionClass: "route",
                  route: proposal,
                  evidence: exitsRetry
                    ? {
                        evidenceClass: "structural_identity",
                        graphFunction: runtime.graphFunction,
                        completionClass: "structural_identity_success",
                        completionWitnessEventRef:
                          completionWitnessEventRef!,
                        completedProgresses: progresses,
                      }
                    : null,
                  terminalizeRun: false,
                });
            const routeBasis = admissionBasis(
              {
                eventTime: runtime.eventTime,
                correlationId:
                  `${runtime.correlationId}/structural/${frame.ordinal}`,
              },
              `route/${frame.structuralOrdinal}`,
            );
            const committed = progressPlan === null
              ? Abg.admitTraversalTransition({
                  predecessorPrefix: runtime.predecessorPrefix,
                  store: runtime.store,
                  executionBasis: runtime.executionBasis,
                  graph: runtime.graph,
                  graphFunction: runtime.graphFunction,
                  source: frame.cursor,
                  target,
                  candidate,
                  basis: routeBasis,
                })
              : Abg.admitCompletedRetryTraversalTransition({
                  predecessorPrefix: runtime.predecessorPrefix,
                  store: runtime.store,
                  executionBasis: runtime.executionBasis,
                  graph: runtime.graph,
                  graphFunction: runtime.graphFunction,
                  source: frame.cursor,
                  target,
                  candidate,
                  basis: routeBasis,
                  progressPlan,
                  completion,
                  progressBasis,
                });
            if (committed.kind !== "route_transition_admission") {
              return fail(
                runtime,
                runtime.predecessorPrefix,
                `structural-transition-${frame.ordinal}`,
                `diagnostic://abiogenesis/hog/${committed.code}@5`,
                committed as unknown as JsonValue,
              );
            }
            if (committed.successorPrefix === null) {
              return fail(
                runtime,
                runtime.predecessorPrefix,
                `structural-step-${frame.ordinal}`,
                "diagnostic://abiogenesis/hog/structural-successor-absent@5",
                step as unknown as JsonValue,
              );
            }
            const structural = applyAdmittedRoute(
              runtimePrefixAtDurable(
                committed.successorPrefix,
                frame.cursor.runId,
              ),
              frame.cursor,
              target,
              step.kind === "c_retry" ? "retry" : "advance",
              committed.route,
            );
            if (
              structural.kind !== "traversal_cursor" ||
              !isTraversalCursorCandidate(structural) ||
              structural.cursorRef === frame.cursor.cursorRef
            ) {
              return fail(
                runtime,
                committed.successorPrefix,
                `structural-step-${frame.ordinal}`,
                "diagnostic://abiogenesis/hog/structural-step-refused@5",
                structural as unknown as JsonValue,
              );
            }
            return {
              kind: "structural_advance",
              cursor: structural,
              successorPrefix: committed.successorPrefix,
            };
    };

    const nextFromEvaluation = (
      frame: TraversalEvaluationFrame,
      evaluation: TraversalLocusEvaluation,
      returns: readonly TraversalReturnFrame[],
    ): TraversalMachineState => {
      const runtime = frame.runtime;
      const completionValue = evaluation.completion;
      if (completionValue.disposition !== "advanced") {
        return Object.freeze({
          stateKind: "return" as const,
          completion: completionValue,
          returns: Object.freeze([...returns]),
        });
      }
      const nextMaterializedInput = materializedInputAtCursor(
        runtime.graph,
        completionValue.nextCursor,
      );
      if (
        completionValue.nextCursor === null ||
        completionValue.continuationKind === null ||
        completionValue.nextInputContractRef === null ||
        evaluation.outputValueKind === null ||
        evaluation.outputContractRef === null ||
        (nextMaterializedInput === null &&
          (typeof completionValue.resultValue !== "object" ||
            completionValue.resultValue === null ||
            Array.isArray(completionValue.resultValue))) ||
        (nextMaterializedInput === null &&
          (completionValue.continuationKind === "retry"
            ? completionValue.nextCursor.inputRef.length === 0 ||
              completionValue.nextCursor.inputDigest !==
                sha256Canonical(completionValue.resultValue)
            : !runtime.leafPort.validateContractValue(
                completionValue.nextInputContractRef,
                "output",
                completionValue.resultValue,
              )))
      ) {
        return fail(
          runtime,
          completionValue.successorPrefix,
          `advanced-result-${frame.ordinal}`,
          "diagnostic://abiogenesis/hog/advanced-result-basis-absent@5",
          {
            leafOrdinal: frame.ordinal,
            completionDisposition: completionValue.disposition,
          },
        );
      }
      return Object.freeze({
        stateKind: "evaluate" as const,
        frame: Object.freeze({
          ...frame,
          runtime: Object.freeze({
            ...runtime,
            predecessorPrefix: completionValue.successorPrefix,
          }),
          cursor: completionValue.nextCursor,
          input: nextMaterializedInput?.value ??
            completionValue.resultValue as Readonly<Record<string, JsonValue>>,
          ordinal: frame.ordinal + 1,
          structuralOrdinal: 0,
        }),
        returns: Object.freeze([...returns]),
      });
    };

    const initial: TraversalMachineState =
      initialState.stateKind === "evaluate"
        ? Object.freeze({
            stateKind: "evaluate" as const,
            frame: initialState.frame,
            returns: Object.freeze([...initialState.returns]),
          })
        : Object.freeze({
            stateKind: "return" as const,
            completion: initialState.completion,
            returns: Object.freeze([...initialState.returns]),
          });

    const program = Effect.iterate<
      TraversalMachineState,
      Exclude<TraversalMachineState, Readonly<{ stateKind: "done" }>>,
      never,
      never
    >(initial, {
      while: (
        state,
      ): state is Exclude<
        TraversalMachineState,
        Readonly<{ stateKind: "done" }>
      > => state.stateKind !== "done",
      body: (state) => Effect.suspend(() => Effect.gen(function* () {
        if (state.stateKind === "return") {
          const ownerFrame = state.returns.at(-1);
          if (ownerFrame === undefined) {
            return Object.freeze({
              stateKind: "done" as const,
              completion: state.completion,
            });
          }
          const parentRuntime = ownerFrame.parent.runtime;
          const failLocus = (
            predecessorPrefix: DurablePrefixCoordinate,
            stage: string,
            diagnosticRef: string,
            candidate: JsonValue,
          ): never => fail(
            parentRuntime,
            predecessorPrefix,
            stage,
            diagnosticRef,
            candidate,
          );
          const parentEvaluation = ownerFrame.kind === "workflow_return"
            ? completeWorkflowLocus(
                ownerFrame.workflow,
                state.completion,
                failLocus,
              )
            : {
                completion: completeRecursionChild(
                  ownerFrame.recursion,
                  state.completion,
                ),
                outputValueKind: ownerFrame.outputValueKind,
                outputContractRef: ownerFrame.outputContractRef,
              };
          return nextFromEvaluation(
            {
              ...ownerFrame.parent,
              runtime: {
                ...ownerFrame.parent.runtime,
                predecessorPrefix: state.completion.successorPrefix,
              },
            },
            parentEvaluation,
            state.returns.slice(0, -1),
          );
        }

        const frame = state.frame;
        const runtime = frame.runtime;
        const step = termFor(frame);
        if (step.kind !== "c_of" && step.kind !== "c_workflow") {
          const advance = evaluateStructuralOnce(frame, step);
          return Object.freeze({
            stateKind: "evaluate" as const,
            frame: Object.freeze({
              ...frame,
              runtime: Object.freeze({
                ...runtime,
                predecessorPrefix: advance.successorPrefix,
              }),
              cursor: advance.cursor,
              input: materializedInputAtCursor(
                runtime.graph,
                advance.cursor,
              )?.value ?? frame.input,
              structuralOrdinal: frame.structuralOrdinal + 1,
            }),
            returns: Object.freeze([...state.returns]),
          });
        }

        const owner = yield* evaluateLocusOnce(frame, step);
        if (owner.kind === "retry_request") {
          return Object.freeze({
            stateKind: "evaluate" as const,
            frame: initializeTraversalEvaluationFrame({
              ...runtime,
              correlationId: owner.correlationId,
              projectedRetryResume: owner.resume,
            }),
            returns: Object.freeze([...state.returns]),
          });
        }
        if (
          owner.kind === "workflow_child_request" ||
          owner.kind === "recursion_child_request"
        ) {
          const prepared = owner.prepared;
          const deferFailedRunStop = owner.kind === "workflow_child_request"
            ? owner.deferFailedRunStop
            : runtime.deferFailedRunStop === true;
          const child = initializeTraversalEvaluationFrame({
            ...runtime,
            ...prepared,
            predecessorPrefix: prepared.successorPrefix,
            ...(runtime.continuationProductBasis === undefined
              ? {}
              : {
                  continuationProductBasis: {
                    ...runtime.continuationProductBasis,
                    programValidation: prepared.programValidation,
                    graphValidation: prepared.graphValidation,
                  },
                }),
            ...(deferFailedRunStop ? { deferFailedRunStop: true } : {}),
            correlationId: owner.correlationId,
            terminalMode: "return_to_parent",
          });
          const returnFrame: TraversalReturnFrame =
            owner.kind === "workflow_child_request"
              ? {
                  kind: "workflow_return",
                  parent: frame,
                  workflow: owner.frame,
                }
              : {
                  kind: "recursion_return",
                  parent: frame,
                  recursion: owner.frame,
                  outputValueKind: owner.outputValueKind,
                  outputContractRef: owner.outputContractRef,
                };
          return Object.freeze({
            stateKind: "evaluate" as const,
            frame: child,
            returns: Object.freeze([...state.returns, returnFrame]),
          });
        }
        return nextFromEvaluation(frame, owner.evaluation, state.returns);
      })),
    });
    return Effect.map(program, (state) => {
      if (state.stateKind !== "done") {
        throw new TypeError(
          "diagnostic://abiogenesis/hog/fold-final-state-mismatch@5",
        );
      }
      return state.completion;
    });
  });
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
  returns: readonly TraversalReturnFrame[],
  stage: "interaction-resume" | "workflow-resume" | "recursion-resume",
): TraversalProgramSeed {
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
        completion.successorPrefix,
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
        completion.successorPrefix,
        `${stage}-advance-digest`,
        `diagnostic://abiogenesis/hog/${stage}-advance-digest-mismatch@5`,
        completion as unknown as JsonValue,
    );
  }
  return {
    stateKind: "evaluate",
    frame: initializeTraversalEvaluationFrame({
      ...parent,
      predecessorPrefix: completion.successorPrefix,
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
): WorkflowReturnFrame {
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
      parent.predecessorPrefix,
      "workflow-resume-lineage",
      "diagnostic://abiogenesis/hog/workflow-resume-lineage-mismatch@5",
      suspension as unknown as JsonValue,
    );
  }
  const traversal = traverseFromCursor(
    traversalBasis(parent),
    input.sourceCursor,
  );
  if (traversal.kind !== "traversal_cursor") {
    return fail(
      parent,
      parent.predecessorPrefix,
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
      parent.predecessorPrefix,
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
      authority: workflowLocusAuthority(parent),
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
): RecursionReturnFrame {
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
      parent.predecessorPrefix,
      "recursion-resume-lineage",
      "diagnostic://abiogenesis/hog/recursion-resume-lineage-mismatch@5",
      suspension as unknown as JsonValue,
    );
  }
  const traversalStop = traverseFromCursor(
    traversalBasis(parent),
    input.sourceCursor,
  );
  if (
    traversalStop.kind !== "traversal_stop_ref" ||
    traversalStop.stopClass !== "executable"
  ) {
    return fail(
      parent,
      parent.predecessorPrefix,
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
      parent.predecessorPrefix,
      "recursion-resume-resolution",
      "diagnostic://abiogenesis/hog/recursion-resume-resolution-absent@5",
      traversalStop as unknown as JsonValue,
    );
  }
  const traversalInput: CompleteExecutableTraversalInput<
    Readonly<Record<string, JsonValue>>
  > = {
    store: parent.store,
    predecessorPrefix: parent.predecessorPrefix,
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
      parent.predecessorPrefix,
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
      parentClock: {
        eventTime: parent.eventTime,
        correlationId: parent.correlationId,
      },
      parentTerminalMode: suspension.terminalMode,
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
): readonly TraversalReturnFrame[] {
  return Object.freeze(inputs.map((input) => {
    if (input.suspension.kind === "held_workflow_suspension") {
      if (input.parentCCall === null) {
        return fail(
          input.parent,
          input.parent.predecessorPrefix,
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
  return Effect.suspend(() => {
    if ("interaction" in input) {
      return evaluateTraversalProgram(
        seedParentContinuation(
          input.parent,
          input.parent.input,
          input.parent.inputDigest,
          resumeInteractionOwner(input.interaction),
          rehydrateParentReturnFrames(input.parents),
          "interaction-resume",
        ),
      );
    }
    return evaluateTraversalProgram(
      {
        stateKind: "evaluate",
        frame: initializeTraversalEvaluationFrame(input),
        returns: [],
      },
    );
  });
}

export function executeGraphTraversal(
  input: ExecuteGraphTraversalRequest,
): Promise<ExecutableTraversalCompletion> {
  return runGraphTraversalProgram(traversalProgram(input));
}
