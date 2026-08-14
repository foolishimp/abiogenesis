import {
  admitRoute,
  admitRuntimeFailure,
  replay,
  type GraphSpanReentryProjection,
} from "../abg/index.js";
import type { JsonValue } from "../shared/canonical_json.js";
import {
  basis,
  completion,
  type CompleteExecutableTraversalInput,
  type ExecutableTraversalCompletion,
} from "./execute.js";
import type { AdmittedLeafOutcome } from "./leaf_admission.js";
import {
  applyAdmittedRoute,
  deriveGraphSpanReentryCursor,
} from "./traversal.js";
import {
  proposeGapStopRoute,
  proposeGraphSpanReentryRoute,
} from "./traversal_route.js";

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fail(
  input: CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>>,
  outcome: AdmittedLeafOutcome,
  stage: string,
  code: string,
  candidate: JsonValue,
  causationEventRef = outcome.judgment.admissionEventRef,
): ExecutableTraversalCompletion {
  admitRuntimeFailure(
    input.store,
    input.executionBasis,
    input.openedTraversalScope,
    "route",
    candidate,
    `diagnostic://abiogenesis/hog/${code}@5`,
    {
      ...basis(input.clock, stage),
      causationEventRefs: [causationEventRef],
    },
  );
  return completion("failed", replay(input.store, {
    runId: outcome.cCall.runId,
  }), {
    cCallRef: outcome.cCall.cCallRef,
    resultRef: outcome.result.resultRef,
    judgmentRef: outcome.judgment.judgmentRef,
    diagnosticRef: `diagnostic://abiogenesis/hog/${code}@5`,
  });
}

export function completeSpecialAdmittedLeaf(
  input: CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>>,
  outcome: AdmittedLeafOutcome,
): ExecutableTraversalCompletion | null {
  const { cCall, result, judgment } = outcome;
  const judgedReplay = replay(input.store, { runId: cCall.runId });
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
      return fail(
        input,
        outcome,
        "gap-stop-proposal-refusal",
        proposal.code,
        proposal as unknown as JsonValue,
      );
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
      return fail(
        input,
        outcome,
        "gap-stop-admission-refusal",
        code,
        route as unknown as JsonValue,
      );
    }
    return completion("gap_stop", replay(input.store, { runId: cCall.runId }), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      resultValue: result.value,
    });
  }
  const value = result.value;
  const projection = isRecord(value) && value.kind === "graph_span_selection" &&
      value.schemaVersion === "5.0.0" && value.disposition === "re_enter" &&
      typeof value.projectionRef === "string" &&
      typeof value.projectionDigest === "string" &&
      typeof value.applicationRef === "string" &&
      typeof value.graphFunctionRef === "string" &&
      typeof value.sourceProgramLocusRef === "string" &&
      typeof value.targetProgramLocusRef === "string" &&
      typeof value.targetInputRef === "string" &&
      typeof value.targetInputDigest === "string" && isRecord(value.targetInput)
    ? value as unknown as GraphSpanReentryProjection
    : null;
  if (projection === null) return null;
  const application = input.graph.template.applications.find((candidate) =>
    candidate.relationKind === "re_enter" &&
    candidate.applicationRef === projection.applicationRef
  );
  const targetContract = application?.relationKind === "re_enter"
    ? application.outputContractRef
    : null;
  const target = application?.relationKind === "re_enter"
    ? deriveGraphSpanReentryCursor(
        input.graph,
        input.traversalStop.cursor,
        application,
        { inputRef: projection.targetInputRef, inputDigest: projection.targetInputDigest },
      )
    : null;
  if (target === null || targetContract === null || target.kind === "traversal_refusal") {
    const code = target === null
      ? "graph_span_reentry_not_declared"
      : target.kind === "traversal_refusal"
        ? target.code
        : "graph_span_reentry_target_contract_absent";
    return fail(input, outcome, "graph-span-reentry-derivation-refusal", code, value);
  }
  const proposal = proposeGraphSpanReentryRoute(
    input.graph,
    input.traversalStop.cursor,
    target,
    cCall,
    result,
    judgment,
    judgedReplay,
    input.closureContract.transitionContractRef,
    projection,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return fail(input, outcome, "graph-span-reentry-proposal-refusal", proposal.code,
      proposal as unknown as JsonValue);
  }
  const route = admitRoute(input.store, input.executionBasis, input.graph,
    input.traversalStop.cursor, target, judgedReplay, proposal,
    basis(input.clock, "graph-span-reentry-route"),
    { graphFunction: input.graphFunction, cCall, result, judgment });
  if (route.kind !== "admitted_traversal_route") {
    return fail(input, outcome, "graph-span-reentry-admission-refusal", route.code,
      route as unknown as JsonValue);
  }
  const nextCursor = applyAdmittedRoute(
    input.traversalStop.cursor,
    target,
    "re_enter",
    route,
  );
  if (nextCursor.kind === "traversal_refusal") {
    return fail(input, outcome, "graph-span-reentry-application-refusal",
      nextCursor.code, nextCursor as unknown as JsonValue, route.admissionEventRef);
  }
  return completion("advanced", replay(input.store, { runId: cCall.runId }), {
    cCallRef: cCall.cCallRef,
    resultRef: result.resultRef,
    judgmentRef: judgment.judgmentRef,
    nextCursor,
    resultValue: projection.targetInput as unknown as JsonValue,
    continuationKind: "re_enter",
    nextInputContractRef: targetContract,
  });
}
