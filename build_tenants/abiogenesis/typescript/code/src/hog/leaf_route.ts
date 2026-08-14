import {
  admitChildClosure,
  admitClosure,
  admitRuntimeFailure,
  replay,
  type RuntimeAdmissionBasis,
} from "../abg/index.js";
import { selectHeldEventStoreDurablePrefix } from "../abg/event_store.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { admitSuccessfulRetryExitRoute } from "./retry_exit.js";
import { applyAdmittedRoute, deriveCompletedTraversalCursor } from "./traversal.js";
import {
  basis,
  completeBlockedTraversal,
  completeFailedTraversal,
  completion,
  type CompleteExecutableTraversalInput,
  type ExecutableLeafCandidate,
  type ExecutableTraversalCompletion,
} from "./execute.js";
import type { AdmittedLeafOutcome } from "./leaf_admission.js";
import { completeSpecialAdmittedLeaf } from "./leaf_special_route.js";

function fail(
  input: CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>>,
  outcome: AdmittedLeafOutcome,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): ExecutableTraversalCompletion {
  admitRuntimeFailure(
    input.store,
    input.executionBasis,
    input.openedTraversalScope,
    "route",
    candidate,
    diagnosticRef,
    {
      ...basis(input.clock, stage),
      causationEventRefs: [outcome.judgment.admissionEventRef],
    },
  );
  return completion("failed", replay(input.store, {
    runId: input.openedTraversalScope.runId,
  }), {
    cCallRef: outcome.cCall.cCallRef,
    resultRef: outcome.result.resultRef,
    judgmentRef: outcome.judgment.judgmentRef,
    diagnosticRef,
  });
}

export function completeAdmittedLeaf(
  input: CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>>,
  outcome: AdmittedLeafOutcome,
  candidate: ExecutableLeafCandidate<Readonly<Record<string, JsonValue>>>,
): ExecutableTraversalCompletion {
  const { cCall, result, judgment } = outcome;
  if (candidate.disposition === "failure") {
    return completeFailedTraversal(
      input,
      cCall,
      result,
      judgment,
      candidate.diagnosticRef,
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
  const special = completeSpecialAdmittedLeaf(input, outcome);
  if (special !== null) return special;
  const next = deriveCompletedTraversalCursor(
    input.graph,
    input.traversalStop.cursor,
    { inputRef: result.resultRef, inputDigest: result.valueDigest },
  );
  if (next?.kind === "traversal_refusal") {
    return fail(
      input,
      outcome,
      "continuation-refusal",
      `diagnostic://abiogenesis/hog/${next.code}@5`,
      next as unknown as JsonValue,
    );
  }
  if (input.terminalMode === "return_to_application") {
    return completion("application_ready", replay(input.store, { runId: cCall.runId }), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      resultValue: result.value,
    });
  }
  const admitted = admitSuccessfulRetryExitRoute({
    store: input.store,
    executionBasis: input.executionBasis,
    graphFunction: input.graphFunction,
    graph: input.graph,
    sourceCursor: input.traversalStop.cursor,
    targetCursor: next,
    variant: {
      completionClass: "judged_success",
      cCall,
      result,
      judgment,
      transitionContractRef: input.closureContract.transitionContractRef,
    },
    basis: basis(input.clock, "successful-retry-exit"),
  });
  if (admitted.kind !== "successful_retry_exit_route_admission") {
    return fail(
      input,
      outcome,
      "successful-route-refusal",
      `diagnostic://abiogenesis/hog/${admitted.code}@5`,
      admitted.candidate,
    );
  }
  const route = admitted.route;
  if (route.routeKind === "advance") {
    if (next === null) {
      return fail(
        input,
        outcome,
        "advance-target-absent",
        "diagnostic://abiogenesis/hog/advance-target-absent@5",
        route as unknown as JsonValue,
      );
    }
    const cursor = applyAdmittedRoute(
      input.traversalStop.cursor,
      next,
      "advance",
      route,
    );
    if (cursor.kind === "traversal_refusal") {
      return fail(
        input,
        outcome,
        "route-application-refusal",
        `diagnostic://abiogenesis/hog/${cursor.code}@5`,
        cursor as unknown as JsonValue,
      );
    }
    return completion("advanced", replay(input.store, { runId: cCall.runId }), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      nextCursor: cursor,
      resultValue: result.value,
      continuationKind: "advance",
      nextInputContractRef: cCall.outputContractRef,
    });
  }
  if (route.routeKind !== "terminal") {
    return fail(
      input,
      outcome,
      "unexpected-route",
      "diagnostic://abiogenesis/hog/unexpected-judged-route@5",
      route as unknown as JsonValue,
    );
  }
  const clock = basis(input.clock, input.terminalMode === "return_to_parent"
    ? "child-closure"
    : "closure") satisfies RuntimeAdmissionBasis;
  const closure = input.terminalMode === "return_to_parent"
    ? admitChildClosure(
        input.store,
        selectHeldEventStoreDurablePrefix(input.store),
        input.openedTraversalScope,
        cCall,
        result,
        judgment,
        route,
        input.closureContract,
        clock,
      )
    : admitClosure(
        input.store,
        selectHeldEventStoreDurablePrefix(input.store),
        cCall,
        result,
        judgment,
        route,
        input.closureContract,
        clock,
      );
  if (closure.kind !== "closure_admission" &&
      closure.kind !== "child_closure_admission") {
    return fail(
      input,
      outcome,
      "closure-refusal",
      `diagnostic://abiogenesis/hog/${closure.code}@5`,
      closure as unknown as JsonValue,
    );
  }
  return completion("closed", replay(input.store, { runId: cCall.runId }), {
    cCallRef: cCall.cCallRef,
    resultRef: result.resultRef,
    judgmentRef: judgment.judgmentRef,
    closureRef: closure.closureRef,
    resultValue: result.value,
  });
}
