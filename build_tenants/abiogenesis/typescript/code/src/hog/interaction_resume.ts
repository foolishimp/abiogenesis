import { admitInteractionClosure, replay } from "../abg/index.js";
import { selectHeldEventStoreDurablePrefix } from "../abg/event_store.js";
import { admitSuccessfulRetryExitRoute } from "./retry_exit.js";
import {
  applyAdmittedRoute,
  deriveCompletedTraversalCursor,
  deriveInteractionSuccessorInputCarrierRef,
} from "./traversal.js";
import {
  basis,
  completion,
  type CompleteInteractionResumeInput,
  type ExecutableTraversalCompletion,
} from "./execute.js";

export function resumeInteractionOwner(
  input: CompleteInteractionResumeInput,
): ExecutableTraversalCompletion {
  const { cCall, result, judgment } = input.heldInteraction;
  const successorInputContractRef = deriveInteractionSuccessorInputCarrierRef(
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
    if (successorInputContractRef === null || continuationCursor === null) {
      throw new TypeError("F_H advance has no successor input carrier or cursor");
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
    throw new TypeError(`F_H resume admitted unexpected route ${route.routeKind}`);
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
