import { realpathSync } from "node:fs";
import { registerHooks } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Expose the actual private owner gates only in this test process. No admission
// predicate is copied, no dependency is mocked, and production exports stay closed.
const buildRoot = pathToFileURL(`${realpathSync(
  process.env.ABG_MULTI_CANDIDATE_BUILD_ROOT === undefined
    ? fileURLToPath(new URL("../../build/code/src/", import.meta.url))
    : resolve(process.env.ABG_MULTI_CANDIDATE_BUILD_ROOT),
)}/`);
const ownerUrl = new URL("abg/traversal_route.js", buildRoot).href;
const packageUrl = process.env.ABG_MULTI_CANDIDATE_DEPENDENCIES_ROOT === undefined
  ? new URL("../../package.json", import.meta.url).href
  : pathToFileURL(resolve(process.env.ABG_MULTI_CANDIDATE_DEPENDENCIES_ROOT, "package.json")).href;
const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      context.parentURL?.startsWith(buildRoot.href) &&
      !specifier.startsWith(".") && !specifier.startsWith("/") &&
      !specifier.includes(":")
    ) {
      return nextResolve(specifier, { ...context, parentURL: packageUrl });
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    const loaded = nextLoad(url, context);
    if (url !== ownerUrl) return loaded;
    return {
      ...loaded,
      format: "module",
      source: `${loaded.source}\nexport { constructionIntentForAdvance, noActionProjectionForStopRoute, hasGovernedConstructionClosure };\n`,
    };
  },
});

export const owner = await import(ownerUrl);
export const { sha256Canonical } = await import(
  new URL("shared/digests.js", buildRoot)
);
export const { deepFreeze } = await import(
  new URL("shared/immutable.js", buildRoot)
);
export const { selectValidatedRuntimeEventPrefix } = await import(
  new URL("abg/event_prefix.js", buildRoot)
);
hook.deregister();

export const ids = Object.freeze({
  actionA: "action://multi-candidate/a",
  actionB: "action://multi-candidate/b",
  actionC: "action://multi-candidate/c",
  obligationA: "obligation://multi-candidate/a",
  obligationB: "obligation://multi-candidate/b",
  unknown: "ref://multi-candidate/unknown",
});
const digest = `sha256:${"1".repeat(64)}`;

export function canonical(value, refField, digestField, prefix) {
  const { [refField]: _ref, [digestField]: _digest, ...body } = value;
  const bodyDigest = sha256Canonical(body);
  return {
    ...body,
    [refField]: `${prefix}${bodyDigest.slice("sha256:".length)}`,
    [digestField]: bodyDigest,
  };
}

export function fixture({ candidates = 2, obligations = 2, workflow = false, separateAlternatives = false } = {}) {
  const obligationRefs = [ids.obligationA, ids.obligationB].slice(0, obligations);
  const actionRefs = [ids.actionA, ids.actionB, ids.actionC].slice(0, candidates);
  const graphFunctionRef = "graph-function://multi-candidate/construction";
  const programRef = "program://multi-candidate/construction";
  const compositionRef = "construction-composition://multi-candidate/construction";
  const targetRef = workflow
    ? "graph-function://multi-candidate/child"
    : "locus://multi-candidate/interaction";
  const closurePolicy = { policyRef: "policy://multi-candidate/closure" };
  const compositionBody = {
    kind: "construction_composition",
    schemaVersion: "5.0.0",
    compositionRef,
    graphFunctionRef,
    interactionProgramLocusRef: targetRef,
    closurePolicy,
    authorities: ["synthesizeModel", "evalGap", "evaluateNext", "evaluateAction"]
      .map((semanticAuthority) => ({
        semanticAuthority,
        authorityRef: `authority://multi-candidate/${semanticAuthority}`,
        initialProgramLocusRef: `locus://multi-candidate/${semanticAuthority}`,
        refreshProgramLocusRef: `locus://multi-candidate/${semanticAuthority}/refresh`,
      })),
  };
  const composition = {
    ...compositionBody,
    compositionDigest: sha256Canonical(compositionBody),
  };
  const actions = actionRefs.map((actionRef, ordinal) => ({
    kind: "action_catalog_row",
    actionRef,
    actionKind: workflow ? "invoke_graph_function" : "request_human_input",
    programRef,
    graphFunctionRef: workflow ? targetRef : graphFunctionRef,
    targetProgramLocusRef: targetRef,
    targetObligationRefs: separateAlternatives && ordinal > 0
      ? [obligationRefs[ordinal - 1]] : [...obligationRefs],
    inputAssetRefs: ["asset://multi-candidate/input"],
    outputAssetRefs: ["asset://multi-candidate/output"],
    expectedDeltaRef: "delta://multi-candidate/expected",
    progressConditionRef: "condition://multi-candidate/progress",
    stopConditionRef: "condition://multi-candidate/stop",
  }));
  const actionCatalog = {
    catalogRef: "action-catalog://multi-candidate/catalog",
    catalogDigest: sha256Canonical(actions),
    rows: actions,
  };
  const executionBasis = {
    actionCatalogRef: actionCatalog.catalogRef,
    actionCatalogDigest: actionCatalog.catalogDigest,
    actionCatalogRows: actions,
    constructionComposition: composition,
    constructionCompositionRef: composition.compositionRef,
    constructionCompositionDigest: composition.compositionDigest,
    workspaceBindingId: "workspace-binding://multi-candidate/workspace",
    workspaceBindingDigest: digest,
    invocationAdmissionRef: "invocation-admission://multi-candidate/invocation",
    invocationRef: "invocation://multi-candidate/invocation",
    invocationDigest: digest,
    programRef,
    programDigest: digest,
    graphFunctionRef,
    graphFunctionDigest: digest,
    basisRef: "execution-basis://multi-candidate/basis",
    basisDigest: digest,
  };
  const workspaceBinding = {
    workspaceBindingId: executionBasis.workspaceBindingId,
    workspaceBindingDigest: executionBasis.workspaceBindingDigest,
  };
  const nextBasisBody = {
    kind: "next_action_basis",
    schemaVersion: "5.0.0",
    observationSnapshot: { workspaceBinding, actionCatalog },
    admittedActionCatalog: actionCatalog,
    declaredPolicy: closurePolicy,
    targetObligationRefs: obligationRefs,
    priorityScheme: {
      kind: "construction_priority_scheme",
      schemeRef: "priority-scheme://multi-candidate/declared",
    },
    runtimeFrontier: { phase: "initial" },
    gapProjection: {
      gapRef: "gap://multi-candidate/gap",
      targetOutcomeRef: "outcome://multi-candidate/outcome",
      missingAssetRefs: [],
    },
    ...(workflow ? {
      targetInput: { kind: "child_input", value: "declared" },
      targetInputRef: "input://multi-candidate/child",
      targetInputDigest: sha256Canonical({ kind: "child_input", value: "declared" }),
    } : {}),
  };
  const nextBasis = canonical(
    nextBasisBody, "basisRef", "basisDigest", "next-action-basis://product/",
  );
  const { kind: _kind, actionRef: _actionRef, ...selectedFields } = actions[0];
  const projection = {
    ...selectedFields,
    kind: "next_action_projection",
    schemaVersion: "5.0.0",
    disposition: "selected",
    selectedActionRef: ids.actionA,
    targetOutcomeRef: nextBasis.gapProjection.targetOutcomeRef,
    gapRef: nextBasis.gapProjection.gapRef,
    nextActionBasisRef: nextBasis.basisRef,
    nextActionBasisDigest: nextBasis.basisDigest,
    targetObligationBindings: obligationRefs.map((obligationRef) => ({
      kind: "target_obligation_binding",
      disposition: "bound",
      obligationRef,
      eligibleActionRefs: actions.filter((row) => row.targetObligationRefs.includes(obligationRef))
        .map((row) => row.actionRef),
    })),
    priorityProjection: {
      kind: "deterministic_priority_projection",
      schemeRef: nextBasis.priorityScheme.schemeRef,
      orderedActionRefs: [...actionRefs],
    },
    lawfulBasisRefs: [nextBasis.basisRef, programRef, nextBasis.gapProjection.gapRef],
    rejectedAlternativeRefs: [],
  };
  const node = (nodeRef, term) => ({ nodeRef, term });
  const nextTerm = (refresh = false) => ({
    kind: "c_of",
    compositionRef,
    programLocusRef: `locus://multi-candidate/evaluateNext${refresh ? "/refresh" : ""}`,
  });
  const graph = {
    graphFunctionRef,
    template: {
      nodes: [
        node("node://multi-candidate/next", nextTerm()),
        node("node://multi-candidate/refresh", nextTerm(true)),
        node("node://multi-candidate/target", workflow ? {
          kind: "c_workflow", graphFunctionRef: targetRef,
        } : {
          kind: "c_of", compositionRef, programLocusRef: targetRef,
          fibre: "F_H", requirement: { kind: "interaction_leaf_requirement" },
        }),
      ],
    },
  };
  const cursor = (name) => ({
    runId: "run://multi-candidate/run",
    graphCallId: "graph-call://multi-candidate/graph-call",
    frameId: "frame://multi-candidate/frame",
    currentNodeRef: `node://multi-candidate/${name}`,
    termPath: ["node", `node://multi-candidate/${name}`, "c"],
    cursorRef: `cursor://multi-candidate/${name}`,
    cursorDigest: digest,
    inputRef: "result://multi-candidate/basis",
    inputDigest: sha256Canonical(nextBasis),
  });
  return {
    nextBasis, projection, executionBasis, graph,
    source: cursor("next"), target: cursor("target"), refresh: cursor("refresh"),
  };
}

export function prefix(events) {
  return selectValidatedRuntimeEventPrefix(deepFreeze(events.map((event, ordinal) => ({
    eventId: `event://multi-candidate/${ordinal + 1}`,
    admissionOrdinal: ordinal + 1,
    causationEventRefs: [],
    runId: "run://multi-candidate/run",
    graphCallId: "graph-call://multi-candidate/graph-call",
    frameId: "frame://multi-candidate/frame",
    ...event,
  }))));
}

export function basisEvent(f) {
  return {
    kind: "c_call_result_admitted",
    payload: { resultRef: f.source.inputRef, value: f.nextBasis },
  };
}

export function evidence(value) {
  const projection = canonical(
    value, "projectionRef", "projectionDigest", "next-action-projection://product/",
  );
  return {
    evidenceClass: "c_call",
    cCall: { cCallRef: "c-call://multi-candidate/next" },
    result: {
      resultRef: "result://multi-candidate/next",
      resultDigest: sha256Canonical(projection),
      admissionEventRef: "event://multi-candidate/4",
      value: projection,
    },
    judgment: { judgmentRef: "judgment://multi-candidate/next" },
  };
}

export function select(f) {
  return owner.constructionIntentForAdvance(
    prefix([basisEvent(f)]), f.executionBasis, f.graph,
    f.source, f.target, evidence(f.projection),
  );
}

export function noAction(f, correction = false) {
  f.projection = {
    kind: "next_action_projection", schemaVersion: "5.0.0",
    disposition: "no_action", noActionDisposition: correction ? "repair" : "gap_stop",
    programRef: f.executionBasis.programRef,
    targetOutcomeRef: f.nextBasis.gapProjection.targetOutcomeRef,
    gapRef: f.nextBasis.gapProjection.gapRef,
    nextActionBasisRef: f.nextBasis.basisRef,
    nextActionBasisDigest: f.nextBasis.basisDigest,
    targetObligationRefs: f.nextBasis.targetObligationRefs,
    targetObligationBindings: f.projection.targetObligationBindings.map((binding) => ({
      ...binding, disposition: correction ? "fulfilled" : "unbound", eligibleActionRefs: [],
    })),
    priorityProjection: { ...f.projection.priorityProjection, orderedActionRefs: [] },
    missingAssetRefs: [], reasonRef: "reason://multi-candidate/no-action",
    rejectedActionRefs: correction ? [] : f.projection.priorityProjection.orderedActionRefs,
    lawfulBasisRefs: [f.nextBasis.basisRef, f.executionBasis.programRef, f.nextBasis.gapProjection.gapRef],
  };
  if (!correction) return;
  const closureRef = "closure-decision://multi-candidate/correction";
  f.nextBasis = canonical({
    ...f.nextBasis,
    runtimeFrontier: { phase: "post_evidence" },
    observationSnapshot: {
      ...f.nextBasis.observationSnapshot,
      constructionState: { edgeClosureDecisionRef: closureRef, correctionDisposition: "repair" },
    },
    gapProjection: {
      ...f.nextBasis.gapProjection, pressure: "governed_correction", correctionDisposition: "repair",
    },
  }, "basisRef", "basisDigest", "next-action-basis://product/");
  f.projection.nextActionBasisRef = f.nextBasis.basisRef;
  f.projection.nextActionBasisDigest = f.nextBasis.basisDigest;
  f.projection.lawfulBasisRefs[0] = f.nextBasis.basisRef;
  f.source = { ...f.refresh, inputDigest: sha256Canonical(f.nextBasis) };
  f.correctionEvent = {
    kind: "construction_delta_observed",
    payload: {
      edgeClosureDecisionRef: closureRef,
      edgeClosureDecision: { disposition: "continue_candidate", correctionDisposition: "repair" },
    },
  };
}

export function stop(f) {
  return owner.noActionProjectionForStopRoute(
    prefix([...(f.correctionEvent === undefined ? [] : [f.correctionEvent]), basisEvent(f)]),
    f.executionBasis, f.graph, f.source, evidence(f.projection),
  );
}

export function converge(f) {
  const selected = select(f);
  if (selected?.intent === undefined) throw new Error(JSON.stringify(selected));
  const intent = selected.intent;
  const closureRef = "closure-decision://multi-candidate/fulfilled";
  const nextBasis = canonical({
    ...f.nextBasis, runtimeFrontier: { phase: "post_evidence" },
  }, "basisRef", "basisDigest", "next-action-basis://product/");
  f.projection = {
    kind: "next_action_projection", schemaVersion: "5.0.0", disposition: "converged",
    constructionIntentRef: intent.constructionIntentRef,
    targetOutcomeRef: intent.targetOutcomeRef,
    gapRef: nextBasis.gapProjection.gapRef,
    edgeClosureDecisionRef: closureRef,
    nextActionBasisRef: nextBasis.basisRef, nextActionBasisDigest: nextBasis.basisDigest,
    targetObligationBindings: f.projection.targetObligationBindings.map((binding) => ({
      ...binding, disposition: "fulfilled", eligibleActionRefs: [],
    })),
    priorityProjection: { ...f.projection.priorityProjection, orderedActionRefs: [] },
    lawfulBasisRefs: [intent.constructionIntentRef, closureRef, nextBasis.gapProjection.gapRef],
  };
  f.nextBasis = nextBasis;
  f.source = { ...f.refresh, inputDigest: sha256Canonical(nextBasis) };
  f.closureEvents = [
    {
      kind: "construction_intent_selected",
      payload: {
        constructionIntentRef: intent.constructionIntentRef,
        constructionIntentDigest: intent.constructionIntentDigest,
        constructionIntent: intent,
      },
    },
    {
      kind: "construction_delta_observed",
      payload: {
        constructionIntentRef: intent.constructionIntentRef,
        constructionIntentDigest: intent.constructionIntentDigest,
        constructionCompositionRef: intent.constructionCompositionRef,
        constructionCompositionDigest: intent.constructionCompositionDigest,
        actionEvaluationAdmissionRef: "action-evaluation-admission://multi-candidate/fulfilled",
        actionEvaluationAdmissionDigest: digest,
        edgeClosureDecisionRef: closureRef,
        targetOutcomeRef: intent.targetOutcomeRef,
      },
    },
    basisEvent(f),
  ];
}

export function closes(f) {
  const candidateEvidence = evidence(f.projection);
  return owner.hasGovernedConstructionClosure(
    prefix([...f.closureEvents, {
      kind: "c_call_result_admitted",
      payload: candidateEvidence.result,
    }]),
    f.executionBasis, f.graph, f.source, candidateEvidence,
  );
}
