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
  runtimePrefixAtDurable,
  sameCanonical,
} from "./operator_support.js";
import * as Routes from "./route_proposal.js";
import {
  applyAdmittedRoute,
  deriveRetryTraversalCursor,
  rehydrateHeldInteractionCursor,
  type TraversalCursor,
} from "./traversal.js";
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

function admitRetryResume(input: Readonly<{
  request: CCallRetryRequest;
  predecessorPrefix: DurablePrefixCoordinate;
  retry: AbgRetry.ExecutableRetryInput;
}>): AbgRetry.ProjectedRetryResumeSuccess {
  const runtime = input.request.context;
  const fresh = AbgRetry.projectExecutableRetryInput({
    prefix: input.predecessorPrefix,
    selector: input.retry.selector,
    program: runtime.program,
    graphFunction: runtime.graphFunction,
    graph: runtime.graph,
  });
  if (
    fresh.kind !== "executable_retry_input" ||
    !sameCanonical(fresh, input.retry)
  ) {
    return failRetry(
      input.request,
      input.predecessorPrefix,
      "retry-projection-currentness",
      "diagnostic://abiogenesis/hog/retry-projection-changed@5",
      fresh as unknown as JsonValue,
    );
  }
  try {
    AbgRetry.assertFullRetryAttemptFrontier(fresh.retryFrontier);
  } catch {
    return failRetry(
      input.request,
      input.predecessorPrefix,
      "retry-frontier",
      "diagnostic://abiogenesis/hog/retry-frontier-incomplete@5",
      fresh.retryFrontier as unknown as JsonValue,
    );
  }
  const truth = Abg.projectRuntimeTruthAtDurablePrefix(
    input.predecessorPrefix,
    fresh.selector.runId,
  );
  const source = rehydrateHeldInteractionCursor(
    truth.runtimePrefix,
    fresh.sourceCursor,
  );
  if (source === null) {
    return failRetry(
      input.request,
      input.predecessorPrefix,
      "retry-source",
      "diagnostic://abiogenesis/hog/retry-source-not-admitted@5",
      fresh.sourceCursor as unknown as JsonValue,
    );
  }
  const target = deriveRetryTraversalCursor(runtime.graph, source, {
    inputRef: fresh.inputRef,
    inputDigest: fresh.inputDigest,
  });
  if (target.kind !== "traversal_cursor") {
    return failRetry(
      input.request,
      input.predecessorPrefix,
      "retry-target",
      "diagnostic://abiogenesis/hog/retry-target-not-derivable@5",
      target as unknown as JsonValue,
    );
  }
  const proposal = Routes.proposeRetryRoute(
    runtime.graph,
    source,
    target,
    fresh.cCall,
    fresh.progress,
    truth.replayState,
    fresh.cCall.transitionContractRef,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return failRetry(
      input.request,
      input.predecessorPrefix,
      "retry-route",
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      proposal as unknown as JsonValue,
    );
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
    return failRetry(
      input.request,
      input.predecessorPrefix,
      "retry-transition",
      `diagnostic://abiogenesis/hog/${transition.code}@5`,
      transition as unknown as JsonValue,
    );
  }
  const cursor = applyAdmittedRoute(
    runtimePrefixAtDurable(transition.successorPrefix, source.runId),
    source,
    target,
    "retry",
    transition.route,
  );
  if (cursor.kind !== "traversal_cursor") {
    return failRetry(
      input.request,
      transition.successorPrefix,
      "retry-route-application",
      "diagnostic://abiogenesis/hog/retry-route-application-refused@5",
      cursor as unknown as JsonValue,
    );
  }
  const attempt = transition.retryAttempt;
  if (attempt === null) {
    return failRetry(
      input.request,
      transition.successorPrefix,
      "retry-attempt",
      "diagnostic://abiogenesis/hog/retry-attempt-absent@5",
      transition as unknown as JsonValue,
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
  return {
    kind: "retry_resume",
    resume: admitRetryResume({
      request,
      predecessorPrefix: retryTransition.successorPrefix,
      retry,
    }),
    correlationId:
      `${runtime.clock.correlationId}/retry/${retry.nextAttempt}`,
  };
}
