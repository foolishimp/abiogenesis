import * as Abg from "../abg/index.js";
import type { RuntimeAdmissionBasis } from "../abg/execution_basis.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import * as AbgRetry from "../abg/retry.js";
import type { GraphFunction, GtlGraph } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import type { CCallRetryRequest } from "./ccall_lifecycle.js";
import {
  admissionBasis,
  sameCanonical,
} from "./operator_support.js";
import * as Routes from "./route_proposal.js";
import {
  deriveRetryTraversalCursor,
  rehydrateHeldInteractionCursor,
  traverseFromCursor,
  type TraversalCursor,
} from "./traversal.js";
import type {
  ExecuteGraphTraversalCommonInput,
} from "./traversal_contract.js";
import {
  projectExecutableTraversalCompletion,
  type ExecutableTraversalCompletion,
} from "./traversal_completion.js";
import { failTraversal } from "./traversal_failure.js";

export interface RetryResumeStep {
  readonly kind: "retry_resume";
  readonly resume: AbgRetry.ProjectedRetryResumeSuccess;
  readonly correlationId: string;
}

export interface RetryBlockedStep {
  readonly kind: "retry_blocked";
  readonly completion: ExecutableTraversalCompletion;
  readonly outputValueKind: string;
  readonly outputContractRef: string;
}

export type RetryLifecycleStep = RetryResumeStep | RetryBlockedStep;

export type ResumeProjectedRetryRuntime = Pick<
  ExecuteGraphTraversalCommonInput,
  | "executionBasis"
  | "openedTraversalScope"
  | "program"
  | "graphFunction"
  | "graph"
  | "graphValidation"
  | "eventTime"
  | "correlationId"
>;

export interface ResumeProjectedRetryRequest {
  readonly store: ExecuteGraphTraversalCommonInput["store"];
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly retry: AbgRetry.ExecutableRetryInput;
  readonly runtime: ResumeProjectedRetryRuntime;
}

export type ProjectedRetryResumeRefusalCode =
  | "projection_mismatch"
  | "prefix_mismatch"
  | "runtime_basis_mismatch"
  | "retry_step_refused"
  | "retry_route_refused"
  | "retry_attempt_refused";

export interface ProjectedRetryResumeRefusal {
  readonly kind: "projected_retry_resume_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: ProjectedRetryResumeRefusalCode;
  readonly message: string;
  readonly executableRetryInputRef: string | null;
  readonly executableRetryInputDigest: `sha256:${string}` | null;
  readonly lowerCause: JsonValue;
}

export type ProjectedRetryResumeResult =
  | AbgRetry.ProjectedRetryResumeSuccess
  | ProjectedRetryResumeRefusal;

export type SuccessfulRetryExitPlan =
  | Readonly<{
      kind: "successful_retry_exit_not_applicable";
    }>
  | Readonly<{
      kind: "successful_retry_exit_plan";
      plan: AbgRetry.CompletedRetryProgressPlan;
      completion: AbgRetry.RetrySuccessfulExitEvidence;
      basis: RuntimeAdmissionBasis;
    }>
  | Readonly<{
      kind: "successful_retry_exit_plan_refusal";
      code: AbgRetry.RetryAdmissionRefusal["code"];
      message: string;
      refusal: AbgRetry.RetryAdmissionRefusal;
    }>;

export function planSuccessfulRetryExit(input: Readonly<{
  predecessorPrefix: DurablePrefixCoordinate;
  graph: Readonly<GtlGraph>;
  graphFunction: Readonly<GraphFunction>;
  source: TraversalCursor;
  target: TraversalCursor | null;
  completion: AbgRetry.RetrySuccessfulExitEvidence;
  basis: RuntimeAdmissionBasis;
}>): SuccessfulRetryExitPlan {
  const plan = AbgRetry.planCompletedRetryProgress(
    input.predecessorPrefix,
    input.graph,
    input.graphFunction,
    input.source,
    input.target,
    input.completion,
    input.basis,
  );
  if (plan.kind !== "completed_retry_progress_plan") {
    return Object.freeze({
      kind: "successful_retry_exit_plan_refusal" as const,
      code: plan.code,
      message: plan.message,
      refusal: plan,
    });
  }
  if (plan.progresses.length === 0) {
    return Object.freeze({
      kind: "successful_retry_exit_not_applicable" as const,
    });
  }
  return Object.freeze({
    kind: "successful_retry_exit_plan" as const,
    plan,
    completion: input.completion,
    basis: input.basis,
  });
}

function failRetry(
  request: CCallRetryRequest,
  predecessorPrefix: DurablePrefixCoordinate,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): never {
  const runtime = request.context;
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

function projectedRetryRefusal(
  request: ResumeProjectedRetryRequest,
  code: ProjectedRetryResumeRefusalCode,
  message: string,
  lowerCause: JsonValue,
): ProjectedRetryResumeRefusal {
  const ref = typeof request.retry?.projectionRef === "string" &&
      request.retry.projectionRef.length > 0
    ? request.retry.projectionRef
    : null;
  const digest = typeof request.retry?.projectionDigest === "string" &&
      request.retry.projectionDigest.startsWith("sha256:")
    ? request.retry.projectionDigest
    : null;
  return deepFreeze({
    kind: "projected_retry_resume_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    message,
    executableRetryInputRef: ref,
    executableRetryInputDigest: digest,
    lowerCause,
  });
}

export function resumeProjectedRetry(
  request: ResumeProjectedRetryRequest,
): ProjectedRetryResumeResult {
  let fresh: AbgRetry.ProjectExecutableRetryInputResult;
  try {
    fresh = AbgRetry.projectExecutableRetryInput({
      prefix: request.predecessorPrefix,
      selector: request.retry.selector,
      program: request.runtime.program,
      graphFunction: request.runtime.graphFunction,
      graph: request.runtime.graph,
    });
  } catch (error) {
    return projectedRetryRefusal(
      request,
      "projection_mismatch",
      "projected retry input could not be independently reconstructed",
      { error: String(error) },
    );
  }
  if (
    fresh.kind !== "executable_retry_input" ||
    !sameCanonical(fresh, request.retry)
  ) {
    return projectedRetryRefusal(
      request,
      "projection_mismatch",
      "supplied retry input differs from fresh D17 projection",
      fresh as unknown as JsonValue,
    );
  }
  try {
    AbgRetry.assertFullRetryAttemptFrontier(fresh.retryFrontier);
  } catch (error) {
    return projectedRetryRefusal(
      request,
      "projection_mismatch",
      "fresh retry projection does not carry one full frontier",
      { error: String(error) },
    );
  }

  let truth: ReturnType<typeof Abg.projectRuntimeTruthAtDurablePrefix>;
  try {
    truth = Abg.projectRuntimeTruthAtDurablePrefix(
      request.predecessorPrefix,
      fresh.selector.runId,
    );
  } catch (error) {
    return projectedRetryRefusal(
      request,
      "prefix_mismatch",
      "D17 predecessor prefix cannot be read as immutable runtime truth",
      { error: String(error) },
    );
  }
  let executionBasis;
  let openedTraversalScope;
  let sourceTraversal;
  try {
    executionBasis = Abg.rehydrateExecutionBasisAtPrefix(
      truth.runtimePrefix,
      fresh.executionBasisRef,
    );
    openedTraversalScope = Abg.rehydrateOpenedTraversalScopeAtPrefix(
      truth.runtimePrefix,
      request.runtime.openedTraversalScope as unknown as Readonly<
        Record<string, JsonValue>
      >,
    );
    sourceTraversal = traverseFromCursor({
      program: request.runtime.program,
      graphFunction: request.runtime.graphFunction,
      graph: request.runtime.graph,
      graphValidation: request.runtime.graphValidation,
      executionBasis: request.runtime.executionBasis,
      openedTraversalScope: request.runtime.openedTraversalScope,
    }, fresh.sourceCursor);
  } catch (error) {
    return projectedRetryRefusal(
      request,
      "runtime_basis_mismatch",
      "retry runtime declarations could not be validated at the D17 prefix",
      { error: String(error) },
    );
  }
  if (
    executionBasis === null ||
    openedTraversalScope === null ||
    !sameCanonical(executionBasis, request.runtime.executionBasis) ||
    !sameCanonical(openedTraversalScope, request.runtime.openedTraversalScope) ||
    executionBasis.basisRef !== fresh.executionBasisRef ||
    executionBasis.basisDigest !== fresh.executionBasisDigest ||
    openedTraversalScope.scopeRef !== fresh.traversalScopeRef ||
    openedTraversalScope.scopeDigest !== fresh.traversalScopeDigest ||
    openedTraversalScope.runId !== fresh.selector.runId ||
    openedTraversalScope.graphCallId !== fresh.selector.graphCallId ||
    openedTraversalScope.frameId !== fresh.selector.frameId ||
    sourceTraversal.kind === "traversal_refusal" ||
    typeof request.runtime.eventTime !== "string" ||
    Number.isNaN(Date.parse(request.runtime.eventTime)) ||
    typeof request.runtime.correlationId !== "string" ||
    request.runtime.correlationId.length === 0
  ) {
    return projectedRetryRefusal(
      request,
      "runtime_basis_mismatch",
      "retry runtime declarations differ from the D17 execution basis",
      {
        executionBasisRef: fresh.executionBasisRef,
        traversalScopeRef: fresh.traversalScopeRef,
      },
    );
  }
  const source = rehydrateHeldInteractionCursor(
    truth.runtimePrefix,
    fresh.sourceCursor,
  );
  if (source === null) {
    return projectedRetryRefusal(
      request,
      "runtime_basis_mismatch",
      "D17 source cursor does not rehydrate at the predecessor prefix",
      { sourceCursorRef: fresh.sourceCursor.cursorRef },
    );
  }
  const target = deriveRetryTraversalCursor(request.runtime.graph, source, {
    inputRef: fresh.inputRef,
    inputDigest: fresh.inputDigest,
  });
  if (
    target.kind !== "traversal_cursor" ||
    target.attempt !== fresh.nextAttempt ||
    !sameCanonical(target.retryPath, fresh.nextRetryPath) ||
    target.inputRef !== fresh.inputRef ||
    target.inputDigest !== fresh.inputDigest
  ) {
    return projectedRetryRefusal(
      request,
      "retry_step_refused",
      "HoG could not derive the exact D17 retry successor step",
      target as unknown as JsonValue,
    );
  }
  let targetTraversal;
  try {
    targetTraversal = traverseFromCursor({
      program: request.runtime.program,
      graphFunction: request.runtime.graphFunction,
      graph: request.runtime.graph,
      graphValidation: request.runtime.graphValidation,
      executionBasis: request.runtime.executionBasis,
      openedTraversalScope: request.runtime.openedTraversalScope,
    }, target);
  } catch (error) {
    return projectedRetryRefusal(
      request,
      "retry_step_refused",
      "HoG could not preflight the exact D17 retry successor step",
      { error: String(error) },
    );
  }
  if (targetTraversal.kind === "traversal_refusal") {
    return projectedRetryRefusal(
      request,
      "retry_step_refused",
      "D17 retry successor differs from its current traversal preflight",
      targetTraversal as unknown as JsonValue,
    );
  }
  const projectedTarget = targetTraversal.kind === "traversal_cursor"
    ? targetTraversal
    : targetTraversal.cursor;
  if (!sameCanonical(projectedTarget, target)) {
    return projectedRetryRefusal(
      request,
      "retry_step_refused",
      "D17 retry successor differs from its current traversal preflight",
      targetTraversal as unknown as JsonValue,
    );
  }
  const proposal = Routes.proposeRetryRoute(
    request.runtime.graph,
    source,
    target,
    fresh.cCall,
    fresh.progress,
    truth.replayState,
    fresh.cCall.transitionContractRef,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return projectedRetryRefusal(
      request,
      "retry_route_refused",
      "HoG could not propose the exact D17 retry route",
      proposal as unknown as JsonValue,
    );
  }
  let candidate;
  try {
    candidate = Abg.completeTraversalTransitionCandidate({
      kind: "traversal_transition_candidate",
      schemaVersion: "5.0.0",
      transitionClass: "retry",
      route: proposal,
      evidence: {
        evidenceClass: "retry",
        graphFunction: request.runtime.graphFunction,
        cCall: fresh.cCall,
        progress: fresh.progress,
      },
      retryInput: fresh.inputValue,
      terminalizeRun: false,
    });
  } catch (error) {
    return projectedRetryRefusal(
      request,
      "retry_route_refused",
      "HoG could not close the exact D17 retry transition candidate",
      { error: String(error) },
    );
  }
  try {
    Abg.assertHeldEventStoreAtDurablePrefix(
      request.store,
      request.predecessorPrefix,
    );
  } catch (error) {
    return projectedRetryRefusal(
      request,
      "prefix_mismatch",
      "retry predecessor prefix changed before atomic admission",
      { error: String(error) },
    );
  }
  let transition;
  try {
    transition = Abg.admitTraversalTransition({
      predecessorPrefix: request.predecessorPrefix,
      store: request.store,
      executionBasis: request.runtime.executionBasis,
      graph: request.runtime.graph,
      graphFunction: request.runtime.graphFunction,
      source,
      target,
      candidate,
      basis: admissionBasis(request.runtime, "retry"),
    });
  } catch (error) {
    try {
      Abg.assertHeldEventStoreAtDurablePrefix(
        request.store,
        request.predecessorPrefix,
      );
    } catch (prefixError) {
      return projectedRetryRefusal(
        request,
        "prefix_mismatch",
        "atomic retry admission lost its expected predecessor prefix",
        {
          error: String(error),
          prefixError: String(prefixError),
        },
      );
    }
    return projectedRetryRefusal(
      request,
      "retry_route_refused",
      "atomic retry route admission failed and rolled back",
      { error: String(error) },
    );
  }
  if (transition.kind === "traversal_route_admission_refusal") {
    return projectedRetryRefusal(
      request,
      transition.code === "replay_mismatch"
        ? "prefix_mismatch"
        : "retry_route_refused",
      "ABG refused the exact D17 retry route",
      transition as unknown as JsonValue,
    );
  }
  if (transition.kind === "retry_admission_refusal") {
    return projectedRetryRefusal(
      request,
      "retry_attempt_refused",
      "ABG refused the exact D17 retry attempt",
      transition as unknown as JsonValue,
    );
  }
  const attempt = transition.retryAttempt;
  if (attempt === null) {
    throw new TypeError(
      "ABG admitted a retry transition without its atomic retry attempt",
    );
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
    nextCursor: target,
    retryAttemptAdmissionEventRef: attempt.admissionEventRef,
    retryAttemptRef: attempt.attemptRef,
    retryAttemptDigest: attempt.attemptDigest,
    nextAttempt: attempt.attempt,
    inputContractRef: attempt.inputContractRef,
    inputRef: attempt.inputRef,
    inputDigest: attempt.inputDigest,
    inputValue: attempt.inputValue,
    successorPrefix: transition.successorPrefix,
  });
}

/** @internal */
export function advanceRetryLifecycle(
  request: CCallRetryRequest,
): RetryLifecycleStep {
  const runtime = request.context;
  const admitted = request.outcome;
  const prefix = Abg.projectRuntimeTruthAtDurablePrefix(
    admitted.successorPrefix,
    runtime.stop.cursor.runId,
  ).authorityPrefix;
  const failureBasis = admissionBasis(runtime.clock, "runtime-failure");
  const failurePlan = AbgRetry.planRetryRuntimeFailureTransition(
    runtime.store,
    prefix,
    runtime.executionBasis,
    runtime.graph,
    runtime.graphFunction,
    runtime.stop.cursor,
    admitted.cCall,
    admitted.source,
    admitted.failureCandidate,
    admitted.failureValueKind,
    failureBasis,
  );
  if (failurePlan.kind !== "retry_runtime_failure_transition_plan") {
    return failRetry(
      request,
      admitted.successorPrefix,
      "retry-failure-plan",
      `diagnostic://abiogenesis/hog/${failurePlan.code}@5`,
      failurePlan as unknown as JsonValue,
    );
  }
  const transition = failurePlan.transition;
  if (transition.disposition === "blocked") {
    const proposal = Routes.proposeBlockedRoute(
      runtime.graph,
      runtime.stop,
      admitted.cCall,
      transition.close.judgment.judgmentRef,
      failurePlan.replayState,
      admitted.cCall.transitionContractRef,
      transition.stoppedProgresses.map((progress) => progress.progressRef),
    );
    if (proposal.kind !== "traversal_route_candidate") {
      return failRetry(
        request,
        admitted.successorPrefix,
        "retry-blocked-route",
        `diagnostic://abiogenesis/hog/${proposal.code}@5`,
        proposal as unknown as JsonValue,
      );
    }
    const candidate = Abg.completeTraversalTransitionCandidate({
      kind: "traversal_transition_candidate",
      schemaVersion: "5.0.0",
      transitionClass: "route",
      route: proposal,
      evidence: {
        evidenceClass: "blocked",
        graphFunction: runtime.graphFunction,
        cCall: admitted.cCall,
        resultRef: transition.close.result.resultRef,
        judgmentRef: transition.close.judgment.judgmentRef,
        judgmentEventRef: transition.close.judgment.admissionEventRef,
        reasonRef: transition.close.judgment.reasonRef,
        stoppedProgresses: transition.stoppedProgresses,
      },
      terminalizeRun: runtime.scopeClass === "root",
    });
    const route = Abg.admitBlockedRetryTraversalTransition({
      predecessorPrefix: admitted.successorPrefix,
      store: runtime.store,
      executionBasis: runtime.executionBasis,
      graph: runtime.graph,
      graphFunction: runtime.graphFunction,
      source: runtime.stop.cursor,
      target: null,
      candidate,
      basis: admissionBasis(runtime.clock, "runtime-failure/blocked-route"),
      failureSource: admitted.source,
      failureCandidate: admitted.failureCandidate,
      failureValueKind: admitted.failureValueKind,
      failureBasis,
      failurePlan,
    });
    if (route.kind !== "route_transition_admission") {
      return failRetry(
        request,
        admitted.successorPrefix,
        "retry-blocked-transition",
        `diagnostic://abiogenesis/hog/${route.code}@5`,
        route as unknown as JsonValue,
      );
    }
    const close = transition.close;
    return {
      kind: "retry_blocked",
      completion: projectExecutableTraversalCompletion(
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
      outputValueKind: request.outputValueKind,
      outputContractRef: request.outputContractRef,
    };
  }
  const retryTransition = AbgRetry.admitRetryRuntimeFailureTransition(
    runtime.store,
    prefix,
    runtime.executionBasis,
    runtime.graph,
    runtime.graphFunction,
    runtime.stop.cursor,
    admitted.cCall,
    admitted.source,
    admitted.failureCandidate,
    admitted.failureValueKind,
    failureBasis,
  );
  if (retryTransition.kind !== "retry_runtime_failure_transition_admission") {
    return failRetry(
      request,
      admitted.successorPrefix,
      "retry-failure-transition",
      `diagnostic://abiogenesis/hog/${retryTransition.code}@5`,
      retryTransition as unknown as JsonValue,
    );
  }
  const retry = AbgRetry.projectExecutableRetryInput({
    prefix: retryTransition.successorPrefix,
    selector: {
      kind: "retry_frontier_selector",
      schemaVersion: "5.0.0",
      runId: runtime.openedTraversalScope.runId,
      graphCallId: runtime.openedTraversalScope.graphCallId,
      frameId: runtime.openedTraversalScope.frameId,
      retryBoundaryRef: retryTransition.progress.retryBoundaryRef,
      retryProgressRef: retryTransition.progress.progressRef,
    },
    program: runtime.program,
    graphFunction: runtime.graphFunction,
    graph: runtime.graph,
  });
  if (retry.kind !== "executable_retry_input") {
    return failRetry(
      request,
      retryTransition.successorPrefix,
      "retry-input-projection",
      `diagnostic://abiogenesis/hog/${retry.code}@5`,
      retry as unknown as JsonValue,
    );
  }
  const resume = resumeProjectedRetry({
    store: runtime.store,
    predecessorPrefix: retryTransition.successorPrefix,
    retry,
    runtime: {
      executionBasis: runtime.executionBasis,
      openedTraversalScope: runtime.openedTraversalScope,
      program: runtime.program,
      graphFunction: runtime.graphFunction,
      graph: runtime.graph,
      graphValidation: runtime.graphValidation,
      eventTime: runtime.clock.eventTime,
      correlationId: runtime.clock.correlationId,
    },
  });
  if (resume.kind === "projected_retry_resume_refusal") {
    return failRetry(
      request,
      retryTransition.successorPrefix,
      "retry-resume",
      `diagnostic://abiogenesis/hog/${resume.code}@5`,
      resume as unknown as JsonValue,
    );
  }
  return {
    kind: "retry_resume",
    resume,
    correlationId:
      `${runtime.clock.correlationId}/retry/${retry.nextAttempt}`,
  };
}
