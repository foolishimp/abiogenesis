import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import test from "node:test";
import * as product from "../../build/code/src/product/index.js";
import * as abg from "../../build/code/src/abg/index.js";
import * as gtl from "../../build/code/src/gtl/index.js";
import { exactProgramOwnerInstall } from "../../build/code/src/abg/execution_basis.js";
import { projectOpenedCCallCarrierAtPrefix } from "../../build/code/src/abg/c_call.js";
import { constructLeafExecutionAuthority, isLeafExecutionAuthority } from "../../build/code/src/implementation/leaf_execution_authority.js";
import { constructAdmittedLeafInvocationPort } from "../../build/code/src/implementation/leaf_invocation_port.js";
import { selectWorksiteConstruction } from "../../build/code/src/implementation/worksite_command_execution.js";
import { projectExactFanOutCompletion } from "../../build/code/src/abg/fan_out_projection.js";
import { constructTraversalCursorCandidate, hasAdmittedTraversalCursorAtPrefix } from "../../build/code/src/abg/traversal_cursor.js";
import { projectAdmittedCCallStateAtPrefix } from "../../build/code/src/abg/c_call.js";
import { planCompletedRetryProgress } from "../../build/code/src/abg/retry.js";
import { deriveCompletedTraversalCursor, deriveStructuralTargetCursor, resolveTraversalTerm } from "../../build/code/src/hog/traversal.js";
import { projectRuntimeEventFromValidatedHistory } from "../../build/code/src/abg/event_store.js";
import { replayValidatedRuntimeEventPrefix, projectRunSemanticReplayProjection } from "../../build/code/src/abg/replay.js";
import { deriveSameRunWorksiteCommandSourceBasisAtPrefix } from "../../build/code/src/abg/invocation_admission.js";
import { deepFreeze } from "../../build/code/src/shared/immutable.js";
import { projectAdmittedRouteAtPrefix } from "../../build/code/src/abg/traversal_route.js";
import { projectRetainedWorksiteInputAtPrefix } from "../../build/code/src/abg/worksite_input_provenance.js";
import { routeCandidateBody } from "../../build/code/src/abg/traversal_transition.js";
import { proposeJudgedRoute } from "../../build/code/src/hog/route_proposal.js";
import { rawAdmitValue } from "../../build/code/src/validator/raw_admission.js";

const retainedC2Root = process.env.ABI5_STEEL03_RETAINED_C2_ROOT;
test("same-Run C2 source and failed semantic replay preserve immutable historical cuts", {
  skip: !retainedC2Root && "requires the retained installed C2 pre-actor failure",
}, async () => {
  const events = deepFreeze((await readFile(`${retainedC2Root}/events/runtime.events.jsonl`, "utf8"))
    .trimEnd().split("\n").map(JSON.parse));
  const prefix = abg.selectValidatedRuntimeEventPrefix(events);
  const basisEvent = events.find(event => event.kind === "basis_admitted" &&
    event.payload.basisClass === "child" && product.isWorksiteCommandExecutionTask(event.payload.rawInputValue));
  assert.ok(basisEvent);
  const basis = abg.rehydrateExecutionBasisAtPrefix(prefix, basisEvent.basisId);
  assert.ok(basis);
  const parent = abg.rehydrateExecutionBasisAtPrefix(prefix, basis.parentExecutionBasisRef);
  assert.ok(parent);
  const before = abg.selectValidatedRuntimeEventPrefix(Object.freeze(events.filter(event =>
    event.admissionOrdinal < basisEvent.admissionOrdinal)));
  const input = { parentBasis: parent, parentCCallRef: basis.parentCCallRef,
    runId: basisEvent.runId, task: basis.rawInputValue };
  const source = deriveSameRunWorksiteCommandSourceBasisAtPrefix(before, input);
  assert.ok(source);
  assert.equal(source.sourceGraphFunctionRef, product.WORKSITE_CONSTRUCTION_IDS.graphFunctionRef);
  assert.deepEqual(source.sourceResultValue, input.task.sourceConstructionResult);
  assert.equal(deriveSameRunWorksiteCommandSourceBasisAtPrefix(before,
    { ...input, parentCCallRef: "c-call:missing-source" }), null);
  assert.equal(deriveSameRunWorksiteCommandSourceBasisAtPrefix(before,
    { ...input, runId: "run://other/source" }), null);
  assert.equal(deriveSameRunWorksiteCommandSourceBasisAtPrefix(before,
    { ...input, task: { ...input.task, sourceConstructionResultDigest: `sha256:${"0".repeat(64)}` } }), null);
  const sourceEvent = events.find(event => event.eventId === source.sourceResultAdmissionEventRef);
  const withoutSource = abg.selectValidatedRuntimeEventPrefix(Object.freeze(events.filter(event =>
    event.admissionOrdinal < sourceEvent.admissionOrdinal)));
  assert.equal(deriveSameRunWorksiteCommandSourceBasisAtPrefix(withoutSource, input), null);
  const state = replayValidatedRuntimeEventPrefix(
    abg.selectValidatedRuntimeEventPrefix(events, { runId: basisEvent.runId }), prefix);
  assert.equal(state.runStoppedDisposition, "failed");
  assert.ok(state.cCalls.some(call => call.resultRef === source.sourceResultRef));
  assert.ok(state.cCalls.some(call => call.resultValue?.kind === "worksite_file_replace_output" && call.resultValue.receipt.committed));
  assert.ok(state.cCalls.some(call => call.resultValue?.kind === "worksite_command_execution_refusal"));
  const semantic = projectRunSemanticReplayProjection(prefix, basisEvent.runId);
  const facts = semantic.ownerFacts.filter(fact => fact.owner === "same_run_source_result");
  assert.equal(facts.length, 1);
  assert.deepEqual(facts[0].sourceResultBasis, source);
  assert.equal(semantic.eventCount, state.eventCount);
  if (process.env.ABI5_STEEL03_SOURCE_REPLAY_PROOF_PATH) await writeFile(
    process.env.ABI5_STEEL03_SOURCE_REPLAY_PROOF_PATH,
    JSON.stringify({ disposition: "retained_source_and_failed_semantic_replay_passed",
      history: "Unchanged retained event content; no new admission or durable handoff.",
      eventCount: events.length, preparationCutCount: before.events.length,
      sourceResultRef: source.sourceResultRef, sourceBasisDigest: source.basisDigest,
      semanticViewDigest: semantic.viewDigest, runStoppedDisposition: state.runStoppedDisposition,
      controls: ["missing source", "crossed parent call", "crossed Run", "altered source digest"],
      retained: ["C0 committed result/O1", "C1 root result", "C2 refusal", "failed Run"] }, null, 2) + "\n",
    { flag: "wx" });
});

const retainedContinuationRoot = process.env.ABI5_STEEL03_RETAINED_CONTINUATION_ROOT;
test("retry continuation preserves the admitted retained C1 input and ordinary terminal input", {
  skip: !retainedContinuationRoot && "requires the retained installed completed C1 prefix",
}, async () => {
  const preflight = JSON.parse(await readFile(`${retainedContinuationRoot}/preflight.json`, "utf8"));
  const receipt = JSON.parse(await readFile(`${retainedContinuationRoot}/receipt-12.json`, "utf8")).receipt;
  const durable = receipt.resources.eventResource.closeHandoff.prefix;
  const events = abg.readRuntimeEventsAtDurablePrefix(durable);
  const prefix = abg.selectValidatedRuntimeEventPrefix(events);
  const failure = events.find(event => event.kind === "runtime_failure_observed");
  assert.ok(["diagnostic://abiogenesis/hog/attempt_mismatch@5", "diagnostic://abiogenesis/hog/traversal-defect@5"].includes(failure.payload.diagnosticRef));
  const W = preflight.environment.workspaceBinding;
  const environment = abg.projectExactPrefixWorkspaceEnvironment(preflight.closeHandoff.prefix, { ref: W.bindingId, digest: W.bindingDigest });
  assert.equal(environment.kind, "exact_prefix_workspace_environment");
  const loaded = await product.ProductExecutionResolutionPort.resolve({
    catalog: preflight.catalog, catalogView: preflight.catalogView, admittedInstalls: environment.productInstalls,
    verifyInstallAdmission: install => abg.hasAdmittedProductInstall(environment.artifactTruth, install),
    programRef: preflight.resolution.programRef,
    selection: { kind: "start", scope: "program", target: "next", until: "converged", rootMode: "direct" },
  });
  assert.equal(loaded.kind, "loaded_product_execution_resolution");
  assert.deepEqual(loaded.resolution, preflight.resolution);
  const graphFunctions = loaded.declarationPublications.flatMap(row => row.graphFunctions);
  function projectCompletion(resultEvent) {
    const basis = abg.rehydrateExecutionBasisAtPrefix(prefix, resultEvent.basisId);
    const graphFunction = graphFunctions.find(row => row.name === basis.graphFunctionRef);
    const initial = events.find(event => event.kind === "traversal_cursor_entered" && event.basisId === basis.basisRef);
    const graph = gtl.materializeGraph(graphFunction, { invocationAdmissionRef: basis.invocationAdmissionRef,
      admittedInputRef: initial.payload.inputRef, admittedInputDigest: basis.rawInputDigest, admittedInput: basis.rawInputValue });
    assert.equal(graph.materializationRef, basis.graphRef);
    let source = constructTraversalCursorCandidate({
      programRef: basis.programRef, executionBasisRef: basis.basisRef, traversalScopeRef: initial.payload.traversalScopeRef,
      runId: initial.runId, graphCallId: initial.graphCallId, frameId: initial.frameId, graphRef: basis.graphRef,
      inputRef: initial.payload.inputRef, inputDigest: initial.payload.inputDigest,
      currentNodeRef: initial.payload.termPath[1], position: "at_term", termPath: initial.payload.termPath,
      taskOrdinal: initial.payload.taskOrdinal, attempt: initial.payload.attempt, retryPath: initial.payload.retryPath,
    });
    assert.equal(source.cursorRef, initial.payload.cursorRef);
    function followAdmittedStructure() {
      for (let next = deriveStructuralTargetCursor(graph, source, resolveTraversalTerm(graph, source)); next !== null;
        next = deriveStructuralTargetCursor(graph, source, resolveTraversalTerm(graph, source))) {
        assert.equal(next.kind, "traversal_cursor");
        assert.equal(hasAdmittedTraversalCursorAtPrefix(prefix, next), true);
        source = next;
      }
    }
    for (const prior of events.filter(event => event.kind === "c_call_result_admitted" &&
      event.basisId === basis.basisRef && event.admissionOrdinal < resultEvent.admissionOrdinal)) {
      followAdmittedStructure();
      assert.equal(hasAdmittedTraversalCursorAtPrefix(prefix, source), true);
      source = deriveCompletedTraversalCursor(graph, source, { inputRef: prior.payload.resultRef, inputDigest: prior.payload.valueDigest });
    }
    followAdmittedStructure();
    assert.equal(hasAdmittedTraversalCursorAtPrefix(prefix, source), true);
    const opened = events.find(event => event.kind === "c_call_opened" && event.payload.cCallRef === resultEvent.payload.cCallRef);
    assert.equal(source.cursorRef, opened.payload.cursorRef);
    const child = graphFunctions.find(row => row.name === opened.payload.childGraphFunctionRef);
    const cCall = projectOpenedCCallCarrierAtPrefix(prefix, graph, opened.payload.cCallRef, source, graphFunction, child, loaded.programValidation);
    assert.ok(cCall);
    const judgment = events.find(event => event.kind === "c_call_judged" && event.payload.cCallRef === cCall.cCallRef);
    const state = projectAdmittedCCallStateAtPrefix(prefix, cCall,
      { ...resultEvent.payload, kind: "admitted_c_call_result", schemaVersion: "5.0.0", disposition: "admitted", admissionEventRef: resultEvent.eventId },
      { ...judgment.payload, kind: "admitted_c_call_judgment", schemaVersion: "5.0.0", disposition: "admitted", admissionEventRef: judgment.eventId });
    assert.ok(state);
    return { basis, graph, graphFunction, source, completion: { completionClass: "judged_success", ...state } };
  }
  const retainedResult = events.find(event => event.kind === "c_call_result_admitted" && event.basisId === failure.basisId &&
    event.payload.valueKind === "worksite_construction_result");
  const selected = projectCompletion(retainedResult);
  const { basis, graph, graphFunction, source, completion } = selected;
  const retained = abg.deriveRetainedCCallInputAtPrefix(prefix, basis, graph, source, completion.cCall, completion.result, completion.judgment);
  assert.ok(retained);
  const target = deriveCompletedTraversalCursor(graph, source, { inputRef: retained.input.admissionRef, inputDigest: retained.input.subjectDigest });
  assert.equal(source.attempt, 1);
  assert.equal(target.attempt, 1);
  assert.deepEqual(source.retryPath, []);
  assert.deepEqual(target.retryPath, []);
  const admissionBasis = { eventTime: failure.eventTime, correlationId: failure.correlationId };
  const plan = (next, evidence = completion) => planCompletedRetryProgress(durable, graph, graphFunction, source, next, evidence, admissionBasis);
  const accepted = plan(target);
  assert.equal(accepted.kind, "completed_retry_progress_plan");
  assert.equal(accepted.progresses.length, 0);
  assert.equal(accepted.eventCandidates.length, 0);
  for (const change of [
    { inputRef: completion.result.resultRef, inputDigest: completion.result.valueDigest },
    { inputDigest: "sha256:" + "0".repeat(64) },
    { currentNodeRef: source.currentNodeRef, termPath: source.termPath },
  ]) {
    const crossed = constructTraversalCursorCandidate({ ...target, ...change });
    assert.equal(plan(crossed).kind, "retry_admission_refusal");
  }
  assert.equal(plan(target, { ...completion, result: { ...completion.result,
    admissionEventRef: "event://unknown/source-result" } }).kind, "retry_admission_refusal");
  assert.equal(plan(target, { ...completion, cCall: { ...completion.cCall,
    childGraphFunctionRef: "graph-function://unknown/source@5" } }).kind, "retry_admission_refusal");
  const before = Object.freeze(events.filter(event => event.admissionOrdinal < failure.admissionOrdinal));
  const beforePrefix = abg.selectValidatedRuntimeEventPrefix(before);
  const beforeRun = abg.selectValidatedRuntimeEventPrefix(before, { runId: source.runId });
  const beforeReplay = replayValidatedRuntimeEventPrefix(beforeRun, beforePrefix);
  const proposedRoute = proposeJudgedRoute(graph, source, target, completion.cCall, completion.result, completion.judgment,
    beforeReplay, completion.cCall.transitionContractRef, [], retained.input);
  assert.equal(proposedRoute.kind, "traversal_route_candidate");
  const routeBody = routeCandidateBody(proposedRoute);
  function projectRouteBody(body) {
    const routeDigest = product.sha256Canonical(body);
    const judgmentEvent = events.find(event => event.eventId === completion.judgment.admissionEventRef);
    const projectedEvent = projectRuntimeEventFromValidatedHistory(before, {
      kind: "traversal_route_admitted", eventTime: judgmentEvent.eventTime,
      aggregateType: "frame", aggregateId: source.frameId, parentAggregateId: source.graphCallId,
      causationEventRefs: [completion.judgment.admissionEventRef, ...retained.causationEventRefs.filter(ref => ref !== completion.judgment.admissionEventRef)],
      correlationId: judgmentEvent.correlationId.replace(/\/judgment$/, "/completion/transition/route"),
      workflowVersion: "5.0.0", scopeClass: "run", basisId: basis.basisRef, runId: source.runId,
      graphFunctionRef: basis.graphFunctionRef, materializationRef: graph.materializationRef,
      graphCallId: source.graphCallId, frameId: source.frameId,
      payload: { routeRef: `traversal-route://abiogenesis/${routeDigest.slice(7)}`, routeDigest, ...body },
    });
    const hypothetical = Object.freeze([...before, projectedEvent]);
    const authority = abg.selectValidatedRuntimeEventPrefix(hypothetical);
    const run = abg.selectValidatedRuntimeEventPrefix(hypothetical, { runId: source.runId });
    return { projectedEvent, authority, run, route: projectAdmittedRouteAtPrefix(run, projectedEvent.eventId, authority) };
  }
  const projected = projectRouteBody(routeBody);
  assert.ok(projected.route);
  const expectedRoute = { kind: "admitted_traversal_route", schemaVersion: "5.0.0", disposition: "admitted",
    routeRef: projected.projectedEvent.payload.routeRef, routeDigest: projected.projectedEvent.payload.routeDigest, ...routeBody,
    constructionIntentRef: null, constructionIntentDigest: null, constructionIntentAdmissionEventRef: null,
    admissionEventRef: projected.projectedEvent.eventId, runStoppedEventRef: null };
  assert.equal(product.sha256Canonical(projected.route), product.sha256Canonical(expectedRoute), "staged projection preserves the entire route carrier");
  assert.deepEqual(projected.route.boundInput, retained.input);
  assert.equal(hasAdmittedTraversalCursorAtPrefix(projected.authority, target), true);
  const resolvedTarget = projectRetainedWorksiteInputAtPrefix(projected.authority, projected.projectedEvent);
  assert.equal(resolvedTarget.input.admissionRef, target.inputRef);
  assert.equal(resolvedTarget.input.subjectDigest, target.inputDigest);
  assert.deepEqual(resolvedTarget.input.value, projected.route.boundInput.value);
  assert.equal(resolvedTarget.input.contractRef, projected.route.boundInput.contractRef);
  const crossedContract = rawAdmitValue(retained.input.value, "invocation_input", completion.cCall.outputContractRef);
  assert.equal(crossedContract.kind, "raw_admitted_value");
  for (const boundInput of [{ ...retained.input, subjectDigest: "sha256:" + "0".repeat(64) }, crossedContract]) {
    assert.equal(projectRouteBody({ ...routeBody, boundInput }).route, null, "tampered raw identity or crossed retention contract is not an admitted route");
  }
  const ordinaryResult = events.find(event => event.kind === "c_call_result_admitted" &&
    event.graphFunctionRef === "graph-function://abiogenesis/worksite/construction@5" &&
    event.payload.valueKind === "worksite_construction_result");
  const ordinary = projectCompletion(ordinaryResult);
  assert.equal(abg.deriveRetainedCCallInputAtPrefix(prefix, ordinary.basis, ordinary.graph, ordinary.source,
    ordinary.completion.cCall, ordinary.completion.result, ordinary.completion.judgment), null);
  const ordinaryTarget = deriveCompletedTraversalCursor(ordinary.graph, ordinary.source, {
    inputRef: ordinary.completion.result.resultRef, inputDigest: ordinary.completion.result.valueDigest });
  assert.equal(ordinaryTarget, null);
  const ordinaryPlan = planCompletedRetryProgress(durable, ordinary.graph, ordinary.graphFunction, ordinary.source,
    ordinaryTarget, ordinary.completion, admissionBasis);
  assert.equal(ordinaryPlan.kind, "completed_retry_progress_plan");
  assert.equal(ordinaryPlan.progresses.length, 0);
  const ordinaryRouteEvent = events.find(event => event.kind === "traversal_route_admitted" &&
    event.payload.cCallRef === ordinary.completion.cCall.cCallRef);
  const ordinaryRoute = projectAdmittedRouteAtPrefix(beforeRun, ordinaryRouteEvent.eventId, beforePrefix);
  assert.ok(ordinaryRoute);
  assert.equal(Object.hasOwn(ordinaryRoute, "boundInput"), false);
  if (process.env.ABI5_STEEL03_CONTINUATION_PROOF_PATH) await writeFile(process.env.ABI5_STEEL03_CONTINUATION_PROOF_PATH,
    JSON.stringify({ disposition: "retained_continuation_checks_passed", prefix: durable,
      c1ResultRef: ordinaryResult.payload.resultRef, parentResultRef: retainedResult.payload.resultRef,
      retainedInputRef: target.inputRef, retainedInputDigest: target.inputDigest, sourceAttempt: source.attempt,
      targetAttempt: target.attempt, sourceRetryPath: source.retryPath, targetRetryPath: target.retryPath,
      authoritativeRetentionAccepted: true, crossedTargetAndDigestRefused: true, missingAndCrossedSourceWitnessRefused: true,
      unboundTerminalContinuationConserved: true, fullRouteCarrierEquality: true, targetInputResolved: true,
      crossedOrTamperedRetainedRouteRefused: true, ordinaryRouteHasNoBoundInput: true,
      retryEventsProposed: accepted.eventCandidates.length,
      limits: "Pure owner/planner projections plus in-memory route candidates over the unchanged retained predecessor. Candidate extensions are unadmitted component evidence, not current runtime truth. No event append, physical effects, model calls or continued Run. The subsequent installed thread exercises actual completion admission." }, null, 2) + "\n", { flag: "wx" });
});

const fanOutRoot = process.env.ABI5_STEEL03_RETAINED_FANOUT_ROOT;
test("declared fan-out output validates independently of leaf output slots", {
  skip: !fanOutRoot && "requires the retained installed successful C0 prefix",
}, async () => {
  const preflight = JSON.parse(await readFile(`${fanOutRoot}/preflight.json`, "utf8"));
  const receipt = JSON.parse(await readFile(`${fanOutRoot}/receipt-12.json`, "utf8")).receipt;
  const all = abg.readRuntimeEventsAtDurablePrefix(receipt.resources.eventResource.closeHandoff.prefix);
  const failure = all.find(event => event.kind === "runtime_failure_observed");
  assert.equal(failure.payload.diagnosticRef, "diagnostic://abiogenesis/hog/task_census_mismatch@5");
  const events = Object.freeze(all.filter(event => event.admissionOrdinal < failure.admissionOrdinal));
  const prefix = abg.selectValidatedRuntimeEventPrefix(events);
  const basis = abg.rehydrateExecutionBasisAtPrefix(prefix, failure.basisId);
  const implementationSet = abg.rehydrateAdmittedImplementationSetAtPrefix(prefix, basis.implementationSetRef);
  const W = preflight.environment.workspaceBinding;
  const environment = abg.projectExactPrefixWorkspaceEnvironment(preflight.closeHandoff.prefix, { ref: W.bindingId, digest: W.bindingDigest });
  assert.equal(environment.kind, "exact_prefix_workspace_environment");
  const loaded = await product.ProductExecutionResolutionPort.resolve({
    catalog: preflight.catalog, catalogView: preflight.catalogView, admittedInstalls: environment.productInstalls,
    verifyInstallAdmission: install => abg.hasAdmittedProductInstall(environment.artifactTruth, install),
    programRef: preflight.resolution.programRef,
    selection: { kind: "start", scope: "program", target: "next", until: "converged", rootMode: "direct" },
  });
  assert.equal(loaded.kind, "loaded_product_execution_resolution");
  assert.deepEqual(loaded.resolution, preflight.resolution);
  const graphFunction = loaded.declarationPublications.flatMap(publication => publication.graphFunctions).find(row => row.name === basis.graphFunctionRef);
  const cursor = events.find(event => event.kind === "traversal_cursor_entered" && event.basisId === basis.basisRef);
  const graph = gtl.materializeGraph(graphFunction, { invocationAdmissionRef: basis.invocationAdmissionRef,
    admittedInputRef: cursor.payload.inputRef, admittedInputDigest: basis.rawInputDigest, admittedInput: basis.rawInputValue });
  assert.equal(graph.materializationRef, basis.graphRef);
  const application = graph.template.applications.find(row => row.relationKind === "fan_out");
  const port = await constructAdmittedLeafInvocationPort({ prefix, artifactTruth: environment.artifactTruth,
    implementationSet, executionResolution: loaded, semanticsProjection: product.projectInstalledLeafSemantics(loaded.productSemantics) });
  const authority = { graph, application, basisId: basis.basisRef, runId: failure.runId, graphCallId: failure.graphCallId, frameId: failure.frameId };
  const request = { mode: "candidate", expectedPrefixDigest: product.sha256Canonical(events), authority, completionKind: "complete_vector",
    validateOutputVector: value => port.validateContractValueByRef(application.outputVectorRef, value) };
  const candidate = projectExactFanOutCompletion(prefix, request);
  assert.equal(candidate.kind, "fan_out_completion_candidate_projection");
  assert.equal(candidate.completionBody.taskRows.length, 1);
  const vector = candidate.completionBody.outputVector;
  assert.equal(vector.members.length, 1);
  assert.equal(port.validateContractValueByRef(application.outputVectorRef, vector), true);
  assert.equal(port.contractValueKind(application.outputVectorRef, "output"), null, "application output does not acquire leaf-output authority");
  const malformed = { ...vector, members: [{ ...vector.members[0], value: { kind: "worksite_file_replace_output" } }] };
  assert.equal(port.validateContractValueByRef(application.outputVectorRef, malformed), false);
  for (const ref of ["contract://unknown/fan-out-output@5", application.inputVectorRef]) {
    assert.equal(port.validateContractValueByRef(ref, vector), false);
    assert.equal(projectExactFanOutCompletion(prefix, { ...request, authority: { ...authority,
      application: { ...application, outputVectorRef: ref } } }), null, "crossed application cannot replace the graph-owned declaration");
  }
  if (process.env.ABI5_STEEL03_FANOUT_PROOF_PATH) await writeFile(process.env.ABI5_STEEL03_FANOUT_PROOF_PATH,
    JSON.stringify({ disposition: "retained_fan_out_projection_passed", prefix: receipt.resources.eventResource.closeHandoff.prefix,
      applicationRef: application.applicationRef, outputContractRef: application.outputVectorRef,
      expectedTasks: graph.fanOutMaterializations.find(row => row.applicationRef === application.applicationRef).members.length,
      completedRows: candidate.completionBody.taskRows.length, outputVectorDigest: product.sha256Canonical(vector),
      exactOwnedOutputAccepted: true, leafOutputSlotUnchanged: true, malformedValueRefused: true,
      unknownAndCrossedContractRefused: true,
      limits: "Pure candidate projection and exact installed owner value checks over the retained successful C0 history. No event append, physical effect or live continuation; the next installed thread exercises the changed HoG caller." }, null, 2) + "\n", { flag: "wx" });
});

const callPath = process.env.ABI5_STEEL03_RETAINED_CALL_PATH;
const c0Root = process.env.ABI5_STEEL03_RETAINED_C0_ROOT;

test("C0 authentic immutable Program publication witness binds raw and installed semantic identities", {
  skip: !c0Root && "requires the retained installed C0 prefix",
}, async () => {
  const preflight = JSON.parse(await readFile(`${c0Root}/preflight.json`, "utf8"));
  const receipt = JSON.parse(await readFile(`${c0Root}/receipt-12.json`, "utf8")).receipt;
  const durable = receipt.resources.eventResource.closeHandoff.prefix;
  const allEvents = abg.readRuntimeEventsAtDurablePrefix(durable);
  const failure = allEvents.find(event => event.kind === "c_call_result_admitted" &&
    event.graphFunctionRef === "graph-function://abiogenesis/worksite/file-replace@5");
  const fibre = allEvents.find(event => event.kind === "c_call_fibre_selected" && event.payload.cCallRef === failure.payload.cCallRef);
  const events = Object.freeze(allEvents.filter(event => event.admissionOrdinal <= fibre.admissionOrdinal));
  const prefix = abg.selectValidatedRuntimeEventPrefix(events);
  const runtimePrefix = abg.selectValidatedRuntimeEventPrefix(events, { runId: failure.runId });
  const basis = abg.rehydrateExecutionBasisAtPrefix(prefix, fibre.basisId);
  const implementationSet = abg.rehydrateAdmittedImplementationSetAtPrefix(prefix, basis.implementationSetRef);
  const selected = implementationSet.rows.find(row => row.requirementKey === fibre.payload.implementationRequirementKey);
  const value = basis.rawInputValue;
  const W = preflight.environment.workspaceBinding;
  const environment = abg.projectExactPrefixWorkspaceEnvironment(preflight.closeHandoff.prefix, { ref: W.bindingId, digest: W.bindingDigest });
  assert.equal(environment.kind, "exact_prefix_workspace_environment");
  const loaded = await product.ProductExecutionResolutionPort.resolve({
    catalog: preflight.catalog, catalogView: preflight.catalogView, admittedInstalls: environment.productInstalls,
    verifyInstallAdmission: install => abg.hasAdmittedProductInstall(environment.artifactTruth, install),
    programRef: preflight.resolution.programRef,
    selection: { kind: "start", scope: "program", target: "next", until: "converged", rootMode: "direct" },
  });
  assert.equal(loaded.kind, "loaded_product_execution_resolution");
  assert.deepEqual(loaded.resolution, preflight.resolution);
  let rootBasis = basis;
  while (rootBasis.parentExecutionBasisRef !== null) rootBasis = abg.rehydrateExecutionBasisAtPrefix(prefix, rootBasis.parentExecutionBasisRef);
  const owner = publication => exactProgramOwnerInstall(environment, implementationSet.rows, rootBasis.graphFunctionRef,
    loaded.program.moduleRef, rootBasis.programRef, selected.publicationDigest, rootBasis.programDigest, publication);
  assert.deepEqual(owner(loaded.programPublication), loaded.programInstall);
  assert.equal(owner(undefined), null);
  const crossed = { ...loaded.programPublication, artifactDigest: "sha256:" + "0".repeat(64) };
  assert.equal(product.modulePublicationSemanticDigest(crossed), product.modulePublicationSemanticDigest(loaded.programPublication));
  assert.equal(owner(crossed), null, "same semantic identity cannot replace the admitted raw publication");
  const cursor = events.find(event => event.kind === "traversal_cursor_entered" && event.basisId === basis.basisRef);
  const graphFunction = loaded.declarationPublications.flatMap(row => row.graphFunctions).find(row => row.name === basis.graphFunctionRef);
  const graph = gtl.materializeGraph(graphFunction, { invocationAdmissionRef: basis.invocationAdmissionRef,
    admittedInputRef: cursor.payload.inputRef, admittedInputDigest: basis.rawInputDigest, admittedInput: value });
  const cCall = projectOpenedCCallCarrierAtPrefix(runtimePrefix, graph, failure.payload.cCallRef);
  assert.ok(cCall);
  // This historical coordinate is read-only proof input, never opened as live authority.
  const rawLines = (await readFile(`${c0Root}/events/runtime.events.jsonl`, "utf8")).split("\n");
  const historicalBytes = Buffer.from(rawLines.slice(0, fibre.admissionOrdinal).join("\n") + "\n");
  const { coordinateDigest: _digest, ...coordinateBody } = durable;
  const historicalBody = { ...coordinateBody, prefixLength: historicalBytes.byteLength, prefixDigest: product.sha256Bytes(historicalBytes) };
  const historicalPrefix = { ...historicalBody, coordinateDigest: product.sha256Canonical(historicalBody) };
  const resolutionDigest = product.sha256Canonical(selected);
  const body = {
    actorRef: basis.actorRef, workspaceBinding: W, workspaceBindingIdentity: W.bindingId, workspaceBindingDigest: W.bindingDigest,
    executionBasis: basis, executionBasisRef: basis.basisRef, executionBasisDigest: basis.basisDigest,
    programRef: basis.programRef, programDigest: basis.programDigest, programPublication: loaded.programPublication,
    graphFunctionRef: basis.graphFunctionRef, graphFunctionDigest: basis.graphFunctionDigest,
    cCall, cCallRef: cCall.cCallRef, cCallDigest: cCall.cCallDigest, predecessorPrefix: historicalPrefix,
    implementationSet, implementationSetRef: implementationSet.implementationSetRef, implementationSetDigest: implementationSet.implementationSetDigest,
    leafResolutionCandidateRef: selected.leafResolutionCandidateRef, leafResolutionCandidateDigest: selected.leafResolutionCandidateDigest,
    implementationResolutionRef: `implementation-resolution://abiogenesis/${resolutionDigest.slice("sha256:".length)}`,
    implementationResolutionDigest: resolutionDigest, implementationResolution: selected,
    implementationBindingRef: selected.implementationBindingRef, implementationBindingDigest: selected.implementationBindingDigest,
    implementationRef: selected.implementationRef, implementationOwnerRef: selected.implementationOwnerProductId,
    effectUri: product.WORKSITE_FILE_REPLACE_EFFECT_URI, handlerRef: product.WORKSITE_FILE_REPLACE_HANDLER_REF,
    handlerDigest: product.WORKSITE_FILE_REPLACE_HANDLER_DIGEST,
    capabilityGrantRef: value.capabilityGrant.grantRef, capabilityGrantDigest: value.capabilityGrant.grantDigest,
  };
  assert.equal(isLeafExecutionAuthority(constructLeafExecutionAuthority(body)), true);
  assert.throws(() => constructLeafExecutionAuthority({ ...body, programPublication: crossed }), /closed exact carrier/);
  const { programPublication: _publication, ...missing } = body;
  assert.throws(() => constructLeafExecutionAuthority(missing), /closed exact carrier/);
  if (process.env.ABI5_STEEL03_C0_WITNESS_PROOF_PATH) await writeFile(process.env.ABI5_STEEL03_C0_WITNESS_PROOF_PATH,
    JSON.stringify({ disposition: "retained_c0_publication_witness_passed", preflightSha256: await product.sha256File(`${c0Root}/preflight.json`),
      rawPublicationDigest: selected.publicationDigest, semanticPublicationDigest: product.modulePublicationSemanticDigest(loaded.programPublication),
      authenticOwnerAccepted: true, authenticLeafWitnessAccepted: true, crossedRawRefused: true, missingWitnessRefused: true,
      limits: "Pure owner and closed-carrier checks over retained admitted evidence. No owner invocation, physical effect, live prefix reopening or event append." }, null, 2) + "\n", { flag: "wx" });
});

const preflightPath = process.env.ABI5_STEEL03_RETAINED_PREFLIGHT_PATH;
const leafRoot = process.env.ABI5_STEEL03_RETAINED_LEAF_ROOT;
test("admitted stage output preserves the exact C1 task carrier and distinct failure slot", {
  skip: !leafRoot && "requires the retained installed first-leaf prefix",
}, async () => {
  const preflight = JSON.parse(await readFile(`${leafRoot}/preflight.json`, "utf8"));
  const receipt = JSON.parse(await readFile(`${leafRoot}/receipt-12.json`, "utf8")).receipt;
  const prefix = abg.selectValidatedRuntimeEventPrefix(abg.readRuntimeEventsAtDurablePrefix(receipt.resources.eventResource.closeHandoff.prefix));
  const basis = abg.rehydrateExecutionBasisAtPrefix(prefix, receipt.resources.replay.executionBasisRef ??
    abg.readRuntimeEventsAtDurablePrefix(receipt.resources.eventResource.closeHandoff.prefix).find(row => row.kind === "basis_admitted").payload.basisRef);
  assert.ok(basis);
  const implementationSet = abg.rehydrateAdmittedImplementationSetAtPrefix(prefix, basis.implementationSetRef);
  const W = preflight.input.constructionTask.workspaceBinding;
  const environment = abg.projectExactPrefixWorkspaceEnvironment(preflight.closeHandoff.prefix, { ref: W.bindingId, digest: W.bindingDigest });
  assert.equal(environment.kind, "exact_prefix_workspace_environment");
  const loaded = await product.ProductExecutionResolutionPort.resolve({
    catalog: preflight.catalog, catalogView: preflight.catalogView, admittedInstalls: environment.productInstalls,
    verifyInstallAdmission: install => abg.hasAdmittedProductInstall(environment.artifactTruth, install),
    programRef: preflight.resolution.programRef,
    selection: { kind: "start", scope: "program", target: "next", until: "converged", rootMode: "direct" },
  });
  assert.equal(loaded.kind, "loaded_product_execution_resolution");
  assert.deepEqual(loaded.resolution, preflight.resolution);
  const port = await constructAdmittedLeafInvocationPort({ prefix, artifactTruth: environment.artifactTruth,
    implementationSet, executionResolution: loaded, semanticsProjection: product.projectInstalledLeafSemantics(loaded.productSemantics) });
  const node = loaded.graphFunction.template.nodes.find(row => row.nodeRef === loaded.graphFunction.template.startNodeRef);
  const row = abg.selectAdmittedImplementationResolution(implementationSet, { graphFunctionRef: loaded.graphFunction.name,
    nodeRef: node.nodeRef, programLocusRef: node.term.programLocusRef, implementationBindingRef: node.term.requirement.implementationBindingRef });
  assert.ok(row);
  const selected = selectWorksiteConstruction(preflight.input);
  assert.equal(selected.disposition, "success");
  assert.deepEqual(selected.resultCandidate, preflight.input.constructionTask);
  assert.equal(port.contractValueKind(row.outputContractRef, "output"), "worksite_construction_task");
  assert.equal(port.validateContractValue(row.outputContractRef, "output", selected.resultCandidate), true);
  assert.equal(port.validateContractValue(row.outputContractRef, "output", { kind: "worksite_construction_task" }), false);
  assert.equal(port.contractValueKind("contract://unknown/not-owned@5", "output"), null);
  assert.equal(port.contractValueKind(row.inputContractRef, "output"), null, "owned input ref is not an admitted output slot");
  assert.equal(port.validateContractValue(product.WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef, "output", selected.resultCandidate), false);
  assert.equal(port.contractValueKind(row.outputContractRef, "failure"), null);
  assert.equal(port.contractValueKind(row.failureContractRef, "failure"), "worksite_command_execution_failure");
  assert.equal(port.contractValueKind(row.failureContractRef, "output"), null);
  assert.equal(port.validateContractValue(row.failureContractRef, "failure", selected.resultCandidate), false);
  const judgment = port.resolveJudgmentRelation(node.term.judgmentPredicateRef);
  assert.ok(judgment);
  assert.equal(judgment.evaluate(preflight.input, selected.resultCandidate), true);
  assert.equal(judgment.evaluate(preflight.input, { kind: "worksite_construction_task" }), false);
  if (process.env.ABI5_STEEL03_OUTPUT_PROOF_PATH) {
    await writeFile(process.env.ABI5_STEEL03_OUTPUT_PROOF_PATH, JSON.stringify({
      disposition: "retained_output_carrier_discriminator_passed", preflightSha256: await product.sha256File(`${leafRoot}/preflight.json`),
      outputContractRef: row.outputContractRef, outputValueKind: "worksite_construction_task", requirementKey: row.requirementKey,
      exactSelection: true, concreteOutput: true, exactJudgment: true, unknownAndCrossedRefRefused: true,
      malformedValueRefused: true, failureSlotDistinct: true,
      limits: "Candidate owning-port and pure selector/judgment checks over retained admitted evidence; no new CCall, judgment admission, model or worksite effect. The shared row-based relation also applies to a selected C3 task output; no C3 execution claimed.",
    }, null, 2) + "\n", { flag: "wx" });
  }
});
test("worksite Program owner binds raw publication separately from installed semantic identity", {
  skip: !preflightPath && "requires the authentic installed preflight and original prefix",
}, async () => {
  const preflight = JSON.parse(await readFile(preflightPath, "utf8"));
  const W = preflight.input.constructionTask.workspaceBinding;
  const environment = abg.projectExactPrefixWorkspaceEnvironment(preflight.closeHandoff.prefix, {
    ref: W.bindingId, digest: W.bindingDigest,
  });
  assert.equal(environment.kind, "exact_prefix_workspace_environment");
  assert.deepEqual(environment.workspaceBinding, W);
  const loaded = await product.ProductExecutionResolutionPort.resolve({
    catalog: preflight.catalog, catalogView: preflight.catalogView,
    admittedInstalls: environment.productInstalls,
    verifyInstallAdmission: install => abg.hasAdmittedProductInstall(environment.artifactTruth, install),
    programRef: preflight.resolution.programRef,
    selection: { kind: "start", scope: "program", target: "next", until: "converged", rootMode: "direct" },
  });
  assert.equal(loaded.kind, "loaded_product_execution_resolution");
  assert.deepEqual(loaded.resolution, preflight.resolution);
  const rawDigest = loaded.programValidation.publicationDigest;
  const semanticDigest = product.modulePublicationSemanticDigest(loaded.programPublication);
  assert.notEqual(rawDigest, semanticDigest, "retained case distinguishes the two identities");
  const select = (env, publication) => exactProgramOwnerInstall(env,
    loaded.implementationSetCandidate.rows, loaded.resolution.graphFunctionRef,
    loaded.program.moduleRef, loaded.program.programRef, rawDigest,
    loaded.resolution.programDigest, publication);
  const owner = select(environment, loaded.programPublication);
  assert.deepEqual(owner, loaded.programInstall);

  const rawCross = structuredClone(loaded.programPublication);
  rawCross.artifactDigest = "sha256:" + "0".repeat(64);
  assert.equal(product.modulePublicationSemanticDigest(rawCross), semanticDigest);
  assert.notEqual(product.sha256Canonical(rawCross), rawDigest);
  assert.equal(select(environment, rawCross), null, "same semantics cannot replace admitted raw bytes");

  // Untrusted negative input, never projected or admitted as an environment.
  const semanticCross = structuredClone(environment);
  const crossedOwner = semanticCross.productInstalls.find(row => row.installId === owner.installId);
  const binding = crossedOwner.contributionManifest.publicationBindings.find(row => row.moduleRef === loaded.program.moduleRef);
  binding.publicationDigest = rawDigest;
  assert.equal(select(semanticCross, loaded.programPublication), null,
    "authentic raw bytes cannot satisfy a crossed installed semantic binding");
  assert.equal(select(environment, undefined), null, "missing full publication supplies no owner witness");
  if (process.env.ABI5_STEEL03_OWNER_PROOF_PATH) {
    await writeFile(process.env.ABI5_STEEL03_OWNER_PROOF_PATH, JSON.stringify({
      disposition: "retained_owner_publication_discriminator_passed",
      preflightSha256: await product.sha256File(preflightPath),
      rawDigest, semanticDigest, ownerInstallId: owner.installId,
      exactOwner: true, crossedRawRefused: true, crossedSemanticRefused: true, missingWitnessRefused: true,
      limits: "The shared root/child pure gate uses authentic retained environment and resolution; crossed inputs are unadmitted negatives. No event append or installed execution.",
    }, null, 2) + "\n", { flag: "wx" });
  }
});

test("consumer callable membership resolves exact borrowed owners without contributor membership rewriting", {
  skip: !callPath && "requires the retained installed conformance call",
}, async () => {
  const call = JSON.parse(await readFile(callPath, "utf8")).invocation;
  const resources = call.resources;
  const supplied = resources.declarationCatalog;
  const catalog = product.CatalogOperationPort.admit({ kind: "catalog_admit_packet", schemaVersion: "5.0.0",
    memberKey: "admit", readinessBasis: supplied.catalog.readinessBasis });
  assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));
  const view = product.narrowGraphFunctionCatalog(catalog, supplied.catalogView.allowlist);
  assert.deepEqual(catalog, supplied.catalog);
  assert.deepEqual(view, supplied.catalogView);
  const program = resources.packet.program;
  const consumer = resources.packet.publication.owningProductId;
  const borrowed = catalog.entries.filter(row => program.callableMembership.includes(row.definitionRef) && row.owningProductId !== consumer);
  assert.equal(borrowed.length, 5);
  assert.ok(borrowed.every(row => !row.programMembershipRefs.includes(program.programRef)));
  const closure = product.resolveProgramDeclarationClosure(catalog, view, program.programRef);
  assert.equal(closure.kind, "resolved_program_declaration_closure", JSON.stringify(closure));
  assert.deepEqual(closure.programPublication, resources.packet.publication);
  const rootRef = program.starts[0].graphFunctionRef;
  const root = product.resolveExecutionDeclarationClosure(catalog, view, program.programRef, rootRef);
  assert.equal(root.kind, "resolved_execution_declaration_closure", JSON.stringify(root));
  const refusedView = product.narrowGraphFunctionCatalog(catalog, []);
  const missingRoot = product.resolveExecutionDeclarationClosure(catalog, refusedView, program.programRef, rootRef);
  assert.equal(missingRoot.kind, "execution_declaration_closure_refusal");
  assert.equal(missingRoot.code, "absent");
  assert.match(missingRoot.message, /Program-aware CatalogView/);

  // These are untrusted negative carrier mutations of the retained Catalog,
  // never new admitted catalogs, locks or dependency authority.
  const refused = [];
  for (const variant of ["missing_dependency", "crossed_dependency"]) {
    const candidate = structuredClone(catalog);
    const edges = candidate.readinessBasis.resolvedLock.dependencyEdges;
    const edge = edges.find(row => row.fromProductId === consumer && row.toProductId === borrowed[0].owningProductId);
    assert.ok(edge, "retained compatible dependency must exist");
    if (variant === "missing_dependency") edges.splice(edges.indexOf(edge), 1);
    else edge.toProductId = "product://unrelated.example/foreign@5.0.0";
    const result = product.resolveProgramDeclarationClosure(candidate, view, program.programRef);
    assert.equal(result.kind, "execution_declaration_closure_refusal", JSON.stringify(result));
    assert.equal(result.code, "missing_dependency", JSON.stringify(result));
    assert.match(result.message, /exact compatible publication owner/);
    refused.push({ variant, result });
  }
  if (process.env.ABI5_STEEL03_CLOSURE_PROOF_PATH) {
    await writeFile(process.env.ABI5_STEEL03_CLOSURE_PROOF_PATH, JSON.stringify({
      disposition: "retained_closure_discriminator_passed", callSha256: await product.sha256File(callPath),
      catalogExact: true, viewExact: true, borrowedMembers: borrowed.map(row => ({
        definitionRef: row.definitionRef, owningProductId: row.owningProductId, programMembershipRefs: row.programMembershipRefs })),
      closure, selectedRootClosure: root, missingRoot, refused,
      limits: "Pure closure projection over retained installed data; no new event or installed runtime execution.",
    }, null, 2) + "\n", { flag: "wx" });
  }
});

const resourceCallPath = process.env.ABI5_STEEL03_RETAINED_START_CALL_PATH;
test("run resources preserve the accepted retention carrier and reject wrong kind or extra fields", {
  skip: !resourceCallPath && "requires the retained exact start resource assertion",
}, async () => {
  const call = JSON.parse(await readFile(resourceCallPath, "utf8")).invocation;
  assert.equal(product.isRunInvocationResourceAssertion(call.resources), true);
  const results = [];
  for (const variant of ["wrong_kind", "extra_binding_field", "extra_edge_field"]) {
    const resources = structuredClone(call.resources);
    const edge = resources.catalog.boundPublications.flatMap(row => row.graphFunctions)
      .flatMap(row => row.template.edges).find(row => row.inputBinding !== undefined);
    assert.ok(edge);
    if (variant === "wrong_kind") edge.inputBinding.kind = "caller_mapping";
    else if (variant === "extra_binding_field") edge.inputBinding.unownedField = true;
    else edge.unownedField = true;
    assert.equal(product.isRunInvocationResourceAssertion(resources), false, variant);
    results.push({ variant, accepted: false });
  }
  if (process.env.ABI5_STEEL03_RESOURCE_PROOF_PATH) {
    await writeFile(process.env.ABI5_STEEL03_RESOURCE_PROOF_PATH, JSON.stringify({
      disposition: "retained_resource_schema_discriminator_passed",
      callSha256: await product.sha256File(resourceCallPath), exactResourcesAccepted: true, results,
      limits: "The owner structural guard supplies no prefix, tuple, owner or invocation admission authority.",
    }, null, 2) + "\n", { flag: "wx" });
  }
});
