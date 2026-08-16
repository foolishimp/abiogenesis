import * as Abg from "../abg/index.js";

import type {
  ExecutionBasis,
  RuntimeAdmissionBasis,
} from "../abg/execution_basis.js";
import type { FhInteractionResumeAdmission } from "../abg/continuation.js";
import type {
  AbgEventStore,
  DurablePrefixCoordinate,
} from "../abg/event_store.js";
import type { OpenedTraversalScope } from "../abg/open_call.js";
import type {
  ClosureContract,
  GraphFunction,
  GtlGraph,
} from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import {
  applyAdmittedRoute,
  deriveCompletedTraversalCursor,
  deriveInteractionSuccessorInputCarrierRef,
  type TraversalCursor,
} from "./traversal.js";
import {
  proposeInteractionResumeRoute,
} from "./route_proposal.js";
import { planSuccessfulRetryExit } from "./retry_lifecycle.js";
import {
  projectExecutableTraversalCompletion,
  type ExecutableTraversalCompletion,
  type HeldInteractionTraversal,
} from "./traversal_completion.js";
import {
  failTraversal,
} from "./traversal_failure.js";

export interface CompleteInteractionResumeInput {
  readonly store: AbgEventStore;
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly heldInteraction: HeldInteractionTraversal;
  readonly successorCursor: TraversalCursor;
  readonly resume: FhInteractionResumeAdmission;
  readonly closureContract: Readonly<ClosureContract>;
  readonly clock: Readonly<{
    eventTime: string;
    correlationId: string;
  }>;
}

function admissionBasis(
  clock: CompleteInteractionResumeInput["clock"],
  stage: string,
): RuntimeAdmissionBasis {
  return {
    eventTime: clock.eventTime,
    correlationId: `${clock.correlationId}/${stage}`,
    causationEventRefs: [],
  };
}

export function completeInteractionResume(
  input: CompleteInteractionResumeInput,
): ExecutableTraversalCompletion {
  const fail = (
    stage: string,
    diagnosticRef: string,
    candidate: JsonValue,
  ): never => failTraversal({
    store: input.store,
    predecessorPrefix: input.predecessorPrefix,
    executionBasis: input.executionBasis,
    openedTraversalScope: input.openedTraversalScope,
    eventTime: input.clock.eventTime,
    correlationId: input.clock.correlationId,
    stage,
    diagnosticRef,
    candidate,
  });
  const { cCall, result, judgment } = input.heldInteraction;
  const successorContract = deriveInteractionSuccessorInputCarrierRef(
    input.graph,
    input.heldInteraction.cursor,
  );
  if (successorContract !== input.resume.successorInputContractRef) {
    return fail(
      "interaction-resume-successor",
      "diagnostic://abiogenesis/hog/interaction-resume-successor@5",
      { successorContract },
    );
  }
  const target = deriveCompletedTraversalCursor(
    input.graph,
    input.successorCursor,
    {
      inputRef: input.resume.successorInputRef,
      inputDigest: input.resume.successorInputDigest,
    },
  );
  if (target?.kind === "traversal_refusal") {
    return fail(
      "interaction-resume-continuation",
      `diagnostic://abiogenesis/hog/${target.code}@5`,
      target as unknown as JsonValue,
    );
  }
  const outcome = Abg.projectCCallOutcomeReceiptAtPrefix(
    input.predecessorPrefix,
    {
      disposition: "judged",
      admitted: { cCall, result, judgment },
    },
  );
  if (outcome?.disposition !== "judged") {
    return fail(
      "interaction-resume-outcome",
      "diagnostic://abiogenesis/hog/interaction-resume-outcome@5",
      { cCallRef: cCall.cCallRef },
    );
  }
  const retryProgressBasis = admissionBasis(
    input.clock,
    "interaction/retry-progress",
  );
  const retryExit = planSuccessfulRetryExit({
    predecessorPrefix: input.predecessorPrefix,
    graph: input.graph,
    graphFunction: input.graphFunction,
    source: input.successorCursor,
    target,
    completion: {
      completionClass: "fh_resume_success",
      cCall,
      result,
      judgment,
      resume: input.resume,
    },
    basis: retryProgressBasis,
  });
  if (retryExit.kind === "successful_retry_exit_plan_refusal") {
    return fail(
      "interaction-resume-retry-progress",
      `diagnostic://abiogenesis/hog/${retryExit.code}@5`,
      retryExit as unknown as JsonValue,
    );
  }
  const proposal = proposeInteractionResumeRoute(
    input.graph,
    input.successorCursor,
    target,
    cCall,
    judgment,
    input.resume,
    retryExit.kind === "successful_retry_exit_plan"
      ? retryExit.plan.replayState
      : outcome.replayState,
    cCall.transitionContractRef,
    retryExit.kind === "successful_retry_exit_plan"
      ? retryExit.plan.progresses
      : [],
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return fail(
      "interaction-resume-route",
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
        evidenceClass: "interaction_resume",
        graphFunction: input.graphFunction,
        cCall,
        result,
        judgment,
        resume: input.resume,
        completedProgresses: retryExit.kind === "successful_retry_exit_plan"
          ? retryExit.plan.progresses
          : [],
      },
      terminalizeRun: false,
    });
  const admitted = Abg.admitCCallCompletion({
      store: input.store,
      predecessorPrefix: input.predecessorPrefix,
      executionBasis: input.executionBasis,
      graph: input.graph,
      graphFunction: input.graphFunction,
      source: input.successorCursor,
      target,
      outcome,
      candidate,
      openedTraversalScope: input.openedTraversalScope,
      closureContract: input.closureContract,
      basis: admissionBasis(input.clock, "interaction/resume"),
      ...(retryExit.kind === "successful_retry_exit_plan"
        ? { completedRetryProgress: retryExit }
        : {}),
    });
  if (admitted.kind !== "c_call_completion_admission") {
    return fail(
      "interaction-resume-transition",
      `diagnostic://abiogenesis/hog/${admitted.code}@5`,
      admitted as unknown as JsonValue,
    );
  }
  if (admitted.disposition === "application_ready") {
    throw new TypeError("interaction transition cannot defer an application");
  }
  const route = admitted.transition.route;
  if (
    route.routeKind === "advance" && target !== null &&
    successorContract !== null
  ) {
    const runtimePrefix = Abg.projectRuntimeTruthAtDurablePrefix(
      admitted.transition.successorPrefix,
      cCall.runId,
    ).runtimePrefix;
    const nextCursor = applyAdmittedRoute(
      runtimePrefix,
      input.successorCursor,
      target,
      "advance",
      route,
    );
    if (nextCursor.kind === "traversal_refusal") {
      throw new TypeError(`interaction route refused: ${nextCursor.code}`);
    }
    return projectExecutableTraversalCompletion(
      "advanced",
      admitted.transition.replayState,
      admitted.transition.successorPrefix,
      {
        cCallRef: cCall.cCallRef,
        resultRef: input.resume.successorInputRef,
        judgmentRef: judgment.judgmentRef,
        nextCursor,
        resultValue: input.resume.successorInputValue,
        continuationKind: "advance",
        nextInputContractRef: successorContract,
      },
    );
  }
  if (route.routeKind !== "terminal") {
    throw new TypeError(`interaction admitted ${route.routeKind}`);
  }
  if (admitted.disposition !== "closed") {
    throw new TypeError(
      "terminal interaction transition did not close its admitted scope",
    );
  }
  return projectExecutableTraversalCompletion(
    "closed",
    admitted.closure.replayState,
    admitted.transition.successorPrefix,
    {
      cCallRef: cCall.cCallRef,
      resultRef: input.resume.responseRef,
      judgmentRef: judgment.judgmentRef,
      closureRef: admitted.closure.closureRef,
      resultValue: input.resume.responseValue,
    },
  );
}
