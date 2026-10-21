import assert from "node:assert/strict";
import { readFile, lstat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const root = process.env.ABI5_GENERIC_JOB_BUILD_ROOT ?? resolve(import.meta.dirname, "../..");
const load = (base, name) => import(pathToFileURL(join(base, "build/code/src", name + ".js")).href);

test("actual parent effect is conserved by workflow foldback; downstream projection remains prospective", {
  skip: !process.env.ABI5_GENERIC_JOB_PARENT_FOLDBACK_ROOT, timeout: 180000,
}, async () => {
  const scratch = process.env.ABI5_GENERIC_JOB_PARENT_FOLDBACK_ROOT;
  const installed = join(scratch, "consumer/node_modules/@abiogenesis/typescript-tenant");
  const [product, gtl, abg, calls, effects, operations, jobs, semantics, preparation, validator, parentsOwner, cursors] = await Promise.all([
    "product/index", "gtl/index", "abg/index", "abg/c_call", "product/worksite_effect", "product/worksite_operations",
    "abg/semantic_job", "abg/semantic_stage", "product/worksite_preparation", "validator/index", "implementation/worksite_file_replace", "abg/traversal_cursor",
  ].map(name => load(root, name)));
  const [outcome, invocation] = await Promise.all(["full-outcome.json", "full-call.json"].map(async name =>
    JSON.parse(await readFile(join(scratch, name), "utf8"))));
  const durable = outcome.resources.eventResource.closeHandoff.prefix;
  const originalBytes = await readFile(fileURLToPath(durable.eventLogRef));
  const events = abg.readRuntimeEventsAtDurablePrefix(durable), prefix = abg.selectValidatedRuntimeEventPrefix(events);
  const parentResult = events.find(e => e.kind === "c_call_result_admitted" && effects.isWorksiteFileParentsSuccess(e.payload.value)); assert.ok(parentResult);
  const value = parentResult.payload.value, request = value.request, hash = product.sha256Canonical;
  const foldbackEvent = events.find(e => e.kind === "child_foldback_admitted" && e.payload.childResultRef === parentResult.payload.resultRef); assert.ok(foldbackEvent);
  const publications = invocation.resources.catalog.boundPublications, graphs = publications.flatMap(p => p.graphFunctions);
  const publication = publications.find(p => p.semanticJobLifecycle); assert.ok(publication);
  const physical = semantics.projectSemanticPredecessorAtPrefix(prefix, events, publication, parentResult.aggregateId, graphs); assert.ok(physical);
  assert.equal(physical.cCall.implementationRef, parentsOwner.WORKSITE_FILE_PARENTS_IMPLEMENTATION.implementationRef);
  assert.equal(physical.result.resultClass, "success"); assert.equal(physical.judgment.judgment, "advance");
  assert.equal(jobs.validateWorksiteFileParentsPlanAtPrefix(prefix, request, publication), true);
  const execution = abg.rehydrateExecutionBasisAtPrefix(prefix, foldbackEvent.basisId); assert.ok(execution);
  const graphFunction = graphs.find(g => g.name === execution.graphFunctionRef); assert.ok(graphFunction);
  const graph = gtl.materializeGraph(graphFunction, { invocationAdmissionRef: execution.invocationAdmissionRef,
    admittedInputRef: execution.rawInputAdmissionRef, admittedInputDigest: execution.rawInputDigest, admittedInput: execution.rawInputValue });
  const childExecution = abg.rehydrateExecutionBasisAtPrefix(prefix, foldbackEvent.payload.childExecutionBasisRef); assert.ok(childExecution);
  const opened = events.find(e => e.kind === "c_call_opened" && e.aggregateId === foldbackEvent.payload.parentCCallRef); assert.ok(opened);
  const entered = events.find(e => e.kind === "traversal_cursor_entered" && e.graphCallId === opened.graphCallId); assert.ok(entered);
  const node = graph.template.nodes.find(n => n.term?.graphFunctionRef === childExecution.graphFunctionRef); assert.ok(node);
  const cursor = cursors.constructTraversalCursorCandidate({ programRef: execution.programRef, executionBasisRef: execution.basisRef,
    traversalScopeRef: entered.payload.traversalScopeRef, runId: opened.runId, graphCallId: opened.graphCallId, frameId: opened.frameId,
    graphRef: graph.materializationRef, inputRef: childExecution.rawInputAdmissionRef, inputDigest: childExecution.rawInputDigest,
    currentNodeRef: node.nodeRef, position: "at_term", termPath: ["node", node.nodeRef, "c"],
    taskOrdinal: opened.payload.taskOrdinal, attempt: opened.payload.attempt, retryPath: opened.payload.retryPath });
  assert.equal(cursor.cursorDigest, opened.payload.cursorDigest);
  const call = calls.projectOpenedCCallCarrierAtPrefix(prefix, graph, opened.aggregateId, cursor, graphFunction); assert.ok(call);
  const foldBytes = Buffer.from(originalBytes.toString("utf8").split("\n").slice(0, foldbackEvent.admissionOrdinal).join("\n") + "\n");
  const cutBody = { ...durable, prefixLength: foldBytes.length, prefixDigest: product.sha256Bytes(foldBytes) };
  delete cutBody.coordinateDigest;
  const cut = { ...cutBody, coordinateDigest: hash(cutBody) };
  abg.readRuntimeEventsAtDurablePrefix(cut);
  const foldback = { kind: "child_foldback_admission", schemaVersion: "5.0.0", disposition: "admitted",
    ...foldbackEvent.payload, admissionEventRef: foldbackEvent.eventId, successorPrefix: cut };
  const subTraversal = calls.deriveSubTraversalEvidence(call, foldback, hash(request), hash(value));
  assert.equal(subTraversal.childResultRef, physical.result.resultRef);
  assert.equal(subTraversal.childOutputDigest, hash(value));
  const terminal = events.find(e => e.kind === "terminal_reached" && e.payload.closureRef === subTraversal.childClosureRef); assert.ok(terminal);
  const frameClosed = events.find(e => e.kind === "frame_closed" && e.payload.terminalReachedEventRef === terminal.eventId); assert.ok(frameClosed);
  assert.ok(events.some(e => e.kind === "graph_call_closed" && e.payload.frameClosedEventRef === frameClosed.eventId));
  assert.throws(() => calls.deriveSubTraversalEvidence(call, { ...foldback, childResultRef: "result://crossed" }, hash(request), hash(value)));

  // Evaluate only the unchanged compiled guard block, never its transaction,
  // evidence admission or a writer. These inputs are actual saved carriers.
  const guard = async base => {
    const code = await readFile(join(base, "build/code/src/abg/c_call_outcome.js"), "utf8");
    const start = code.indexOf("const parentsPhysical ="), end = code.indexOf("const evidenceCandidates", start);
    assert.ok(start > 0 && end > start);
    const scope = { ...effects, ...gtl, sha256Canonical: hash };
    return Function(...Object.keys(scope), "input", "resultCandidate", "worksiteEvidence", "postPublication",
      `"use strict";${code.slice(start, end)}return {parentsPhysical, committedWorksiteOutput};`).bind(null, ...Object.values(scope));
  };
  const before = await guard(installed), after = await guard(root), workflow = { outcomeClass: "workflow", cCall: call, executionBasis: execution, inputDigest: hash(request) };
  assert.throws(() => before(workflow, value, null, false), /file-parent physical result differs/);
  assert.deepEqual(after(workflow, value, null, false), { parentsPhysical: null, committedWorksiteOutput: false });
  const leafExecution = abg.rehydrateExecutionBasisAtPrefix(prefix, physical.cCall.basisId); assert.ok(leafExecution);
  const set = abg.rehydrateAdmittedImplementationSetAtPrefix(prefix, leafExecution.implementationSetRef); assert.ok(set);
  const resolution = set.rows.find(row => row.leafResolutionCandidateDigest === value.authorization.leafResolutionCandidateDigest); assert.ok(resolution);
  const leaf = { outcomeClass: "leaf", cCall: physical.cCall, executionBasis: leafExecution, resolution, inputDigest: hash(request) };
  assert.deepEqual(after(leaf, value, null, false), before(leaf, value, null, false));
  assert.equal(after(leaf, value, null, false).committedWorksiteOutput, true);
  for (const changed of [{ ...leaf, inputDigest: hash("wrong-input") },
    { ...leaf, cCall: { ...leaf.cCall, cCallRef: "crossed-call" } },
    { ...leaf, executionBasis: { ...leaf.executionBasis, basisRef: "crossed-basis" } },
    { ...leaf, resolution: { ...resolution, leafResolutionCandidateDigest: hash("wrong-leaf") } }]) {
    assert.throws(() => after(changed, value, null, false), /file-parent physical result differs/);
  }

  // The failed prefix has no next bridge admission. Check the actual declared
  // edge and pure owner projections without inventing that missing occurrence.
  const source = events.find(e => e.kind === "c_call_result_admitted" && e.payload.resultRef === request.sourceEnvelopeRef && e.payload.resultDigest === request.sourceEnvelopeDigest);
  assert.ok(source); const original = source.payload.value, design = original.assets.at(-1).candidate.design;
  const environment = abg.projectExactPrefixWorkspaceEnvironment(durable, { ref: execution.workspaceBindingId, digest: execution.workspaceBindingDigest });
  assert.equal(environment.kind, "exact_prefix_workspace_environment");
  const operating = { workspaceAuthorityBasis: environment.workspaceAuthorityBasis, workspaceBinding: environment.workspaceBinding, capabilityGrant: request.capabilityGrant };
  const bridge = graphs.find(g => g.declarations["abg.semantic_job_operation"] === "worksite_bridge") ??
    graphs.find(g => g.template.nodes?.some(n => n.term?.requirement?.implementationBindingRef === gtl.SEMANTIC_STAGE_IDS.jobBridgeBindingRef));
  assert.ok(bridge); assert.equal(bridge.inputs[0], call.outputContractRef);
  const targets = [];
  for (const target of request.targets) {
    const subject = product.constructWorksiteSubject({ ...operating, relativePath: target.relativePath,
      subjectUri: pathToFileURL(resolve(operating.workspaceAuthorityBasis.canonicalRoot, target.relativePath)).href });
    assert.equal(subject.kind, "worksite_subject");
    const observation = await operations.observeWorksiteSubject(operating.workspaceAuthorityBasis, operating.workspaceBinding, subject);
    assert.equal(observation.kind, "worksite_observation"); assert.equal(observation.state, "absent");
    const task = product.constructWorksiteConstructionTask({ ...operating, prompt: "Native assessed target identity",
      targets: [{ subject, territory: target.territory, predecessorObservation: observation }] });
    targets.push({ target: task.targets[0], base64: "", role: design.targets.find(t => t.relativePath === target.relativePath).role });
  }
  const worksite = { ...operating, targets, commands: design.commands, outcomePredicates: design.outcomePredicates,
    allowedWriteTerritories: original.job.worksiteScope.evidenceWriteRoots.map(relativePath => ({ pathKind: "subtree", relativePath })) };
  const entry = product.deriveSemanticJobPreparation(original, worksite); assert.ok(entry);
  assert.equal(preparation.isWorksitePreparationInput(entry), true);
  const raw = validator.rawAdmitValue(entry, "worksite_command_preparation_input", bridge.outputs[0]); assert.equal(raw.kind, "raw_admitted_value");
  assert.deepEqual(preparation.selectWorksiteConstructionTask(entry), entry.constructionTask);
  assert.deepEqual(entry.constructionTask.targets.map(t => t.subject.relativePath), ["app/main.mjs", "app/check.mjs"]);
  assert.deepEqual(entry.readDependencyBasis.members.map(t => t.subject.relativePath), ["shared/lib.mjs"]);
  for (const member of entry.readDependencyBasis.members) assert.deepEqual(await operations.observeWorksiteSubject(
    operating.workspaceAuthorityBasis, operating.workspaceBinding, member.subject), member.observation);
  assert.equal(jobs.semanticJobConstructionSourceAtPrefix(prefix, original), null, "the missing native bridge is not invented");
  assert.equal(jobs.semanticJobReadDependenciesAtPrefix(prefix, entry.readDependencyBasis), null);
  const app = await lstat(resolve(operating.workspaceAuthorityBasis.canonicalRoot, "app"));
  assert.equal(`${app.dev}:${app.ino}`, value.receipt.outcomes.find(row => row.relativePath === "app").fileIdentity);
  assert.deepEqual(await readFile(fileURLToPath(durable.eventLogRef)), originalBytes);
  console.log(JSON.stringify({ scope: "actual parent effect/foldback and prospective bridge/C1 contract only", events: events.length,
    parentResult: parentResult.admissionOrdinal, foldback: foldbackEvent.admissionOrdinal, physicalWriters: 0, bridgeAdmitted: false }));
});
