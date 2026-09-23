import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { genericLifecyclePublicationData } from "./t287-generic-job-lifecycle.mjs";

export const genericRevisionIds = Object.freeze({
  selectionProgramRef: "program://generic-job-mechanics.example/selection@5",
  repairProgramRef: "program://generic-job-mechanics.example/repair@5",
});

/** Reconstruct the actually selected revision bridge with existing native
 * readers. This reads closed evidence; it does not reopen, append or dispatch. */
export async function readRetainedGenericRevisionBridge({ scratch, packageRoot, role = "bridge" }) {
  assert.ok(["bridge", "author", "assessor"].includes(role));
  const load = name => import(pathToFileURL(join(packageRoot, "build/code/src", name + ".js")).href);
  const [product, abg, gtl, calls, cursors, traversal, jobs] = await Promise.all([
    "product/index", "abg/index", "gtl/index", "abg/c_call", "abg/traversal_cursor", "hog/traversal", "abg/semantic_job",
  ].map(load));
  const [call, outcome] = await Promise.all(["correction-repair-call.json", "correction-repair-outcome.json"].map(async name =>
    JSON.parse(await readFile(join(scratch, name), "utf8"))));
  const durable = outcome.resources.eventResource.closeHandoff.prefix;
  const originalBytes = await readFile(fileURLToPath(durable.eventLogRef));
  const events = abg.readRuntimeEventsAtDurablePrefix(durable);
  const selected = events.findLast(e => e.kind === "c_call_fibre_selected" &&
    e.payload.implementationRef === gtl.SEMANTIC_REVISION_IDS[role + "ImplementationRef"]);
  assert.ok(selected);
  const prefixBytes = Buffer.from(originalBytes.subarray(0, durable.prefixLength).toString("utf8").split("\n")
    .slice(0, selected.admissionOrdinal).join("\n") + "\n");
  const body = { kind: "durable_prefix_coordinate", schemaVersion: "5.0.0", eventLogRef: durable.eventLogRef,
    prefixLength: prefixBytes.length, prefixDigest: product.sha256Bytes(prefixBytes), storeIdentity: durable.storeIdentity };
  const cut = { ...body, coordinateDigest: product.sha256Canonical(body) };
  const before = abg.readRuntimeEventsAtDurablePrefix(cut), prefix = abg.selectValidatedRuntimeEventPrefix(before);
  assert.throws(() => abg.readRuntimeEventsAtDurablePrefix(cut, { requireCurrent: true }),
    "the historical cut does not confer current dispatch authority");
  const opened = before.find(e => e.kind === "c_call_opened" && e.aggregateId === selected.aggregateId); assert.ok(opened);
  const executionBasis = abg.rehydrateExecutionBasisAtPrefix(prefix, opened.basisId); assert.ok(executionBasis);
  const publications = call.resources.catalog.boundPublications;
  const publication = publications.find(p => p.programs.some(p => p.programRef === executionBasis.programRef)); assert.ok(publication);
  const declarationGraphFunctions = publications.flatMap(p => p.graphFunctions);
  const graphFunction = declarationGraphFunctions.find(g => g.name === executionBasis.graphFunctionRef); assert.ok(graphFunction);
  const graph = gtl.materializeGraph(graphFunction, { invocationAdmissionRef: executionBasis.invocationAdmissionRef,
    admittedInputRef: executionBasis.rawInputAdmissionRef, admittedInputDigest: executionBasis.rawInputDigest,
    admittedInput: executionBasis.rawInputValue });
  const cCall = calls.projectOpenedCCallCarrierAtPrefix(prefix, graph, opened.aggregateId); assert.ok(cCall);
  const entered = before.find(e => e.kind === "traversal_cursor_entered" && e.basisId === opened.basisId && e.graphCallId === opened.graphCallId);
  assert.ok(entered); const cp = entered.payload;
  let cursor = cursors.constructTraversalCursorCandidate({ programRef: cp.programRef, executionBasisRef: cp.executionBasisRef,
    traversalScopeRef: cp.traversalScopeRef, runId: entered.runId, graphCallId: entered.graphCallId, frameId: entered.frameId,
    graphRef: cp.materializationRef, inputRef: cp.inputRef, inputDigest: cp.inputDigest, currentNodeRef: graph.template.startNodeRef,
    position: "at_term", termPath: cp.termPath, taskOrdinal: cp.taskOrdinal, attempt: cp.attempt, retryPath: cp.retryPath });
  assert.equal(cursor.cursorDigest, cp.cursorDigest);
  if (cursor.cursorDigest !== opened.payload.cursorDigest)
    cursor = traversal.deriveStructuralTargetCursor(graph, cursor, graph.template.nodes[0].term);
  assert.equal(cursor.cursorDigest, opened.payload.cursorDigest);
  const basis = { publication, lifecyclePublication: publication, sourcePublication: publication, graph, graphFunction,
    declarationGraphFunctions, executionBasis, cCall, cursor, predecessorPrefix: cut };
  const owner = jobs.authenticateSemanticJobBasis(basis); assert.ok(owner);
  return { basis, input: owner.inputValue, owner, events, cut, durable, selected, originalBytes,
    eventLogPath: fileURLToPath(durable.eventLogRef), installedRoot: join(scratch, "consumer/node_modules/@abiogenesis/typescript-tenant") };
}

/** Add ordinary native D2 Programs to the same generic installed declaration.
 * No job, requirement, layout or actor answer is an argument or member. */
export function genericRevisionPublicationData({ product, gtl, abiPublication }) {
  const base = genericLifecyclePublicationData({ product, gtl, abiPublication });
  const D = gtl.SEMANTIC_STAGE_IDS, R = gtl.SEMANTIC_REVISION_IDS, W = product.WORKSITE_REVISION_IDS;
  const C1 = product.WORKSITE_CONSTRUCTION_IDS, C2 = product.WORKSITE_COMMAND_EXECUTION_IDS, P = product.WORKSITE_PREPARATION_IDS;
  const ref = (kind, name) => `${kind}://generic-job-mechanics.example/${name}@5`;
  const nativeBasis = { productId: abiPublication.owningProductId, artifactDigest: abiPublication.artifactDigest,
    productContentDigest: abiPublication.productContentDigest, productManifestDigest: abiPublication.productManifestDigest,
    packageName: abiPublication.productSemanticsBinding.packageName, packageVersion: abiPublication.productSemanticsBinding.packageVersion };
  const c1 = gtl.constructWorksiteConstructionModulePublication(nativeBasis), c2 = gtl.constructWorksiteCommandExecutionModulePublication(nativeBasis);
  const closures = [...base.closureContracts];
  const close = (name, predicateRef, resultContractRef, closureScope = "graph_call") => {
    const c = gtl.constructSemanticClosureContract({ closureContractRef: ref("contract", name + "-close"), predicateRef, resultContractRef, closureScope });
    closures.push(c); return c.closureContractRef;
  };
  const call = graph => gtl.workflow.C(gtl.cGraphFunctionRef({ graphFunctionRef: graph.name,
    input: gtl.cCarrier(graph.inputs[0]), output: gtl.cCarrier(graph.outputs[0]) }));
  const c1Graph = c1.graphFunctions.find(g => g.name === C1.graphFunctionRef), c2Graph = c2.graphFunctions.find(g => g.name === W.graphFunctionRef);
  const node = name => ref("node", "repair-worksite-" + name), workClose = ref("contract", "repair-worksite-close");
  closures.push(gtl.closureContract({ ...c2.closureContracts.find(c => c.closureContractRef === C2.closureContractRef), closureContractRef: workClose,
    predicateRef: P.rootPredicateRef, resultContractRef: W.observationContractRef, closureScope: "graph_call",
    eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed"] }));
  const pure = (name, bindingRef, predicateRef) => {
    const b = c2.implementationBindings.find(row => row.bindingRef === bindingRef); assert.ok(b);
    return { nodeRef: node(name), nodeKind: "c_locus", term: gtl.C.of({ input: gtl.cCarrier(b.inputContractRef), output: gtl.cCarrier(b.outputContractRef),
      programLocusRef: node(name), stageRole: name, fibre: "F_D", armId: node(name) + "/arm", compositionRef: null, vectorIndex: 0,
      judgmentPredicateRef: predicateRef, resultBearing: false, requirement: { kind: "executable_leaf_requirement", implementationBindingRef: b.bindingRef,
        inputContractRef: b.inputContractRef, outputContractRef: b.outputContractRef, failureContractRef: b.failureContractRef,
        refusalContractRef: b.refusalContractRef, evidenceContractRef: C2.evidenceContractRef, judgmentContractRef: C2.judgmentContractRef } }) };
  };
  const provided = [C1.taskContractRef, C1.resultContractRef, W.boundInputContractRef, W.taskContractRef, W.observationContractRef];
  const worksite = { kind: "graph_function", name: ref("graph-function", "repair-worksite"), version: "5.0.0", inputs: [W.inputContractRef], outputs: [W.observationContractRef],
    environment: { requires: [W.inputContractRef], provides: provided, carries: [W.inputContractRef, ...provided] },
    effects: [...new Set([...c1Graph.effects, ...c2Graph.effects])], tags: ["mechanical-only"],
    declarations: { "abg.compute_regime": "mixed", "abg.closure_contract": workClose, "abg.child_closure_contract": workClose,
      "abg.failure_contract": C2.failureContractRef, "abg.evidence_contract": C2.evidenceContractRef, "abg.judgment_contract": C2.judgmentContractRef,
      "abg.judgment_predicate": P.rootPredicateRef, "abg.transition_contract": C2.transitionContractRef },
    template: { kind: "inline_graph", graphRef: ref("graph", "repair-worksite"), startNodeRef: node("select"), terminalNodeRefs: [node("execute")], applications: [],
      nodes: [pure("select", W.selectBindingRef, W.selectPredicateRef), { nodeRef: node("construct"), nodeKind: "c_locus", term: call(c1Graph) },
        pure("prepare", W.prepareBindingRef, W.preparePredicateRef), { nodeRef: node("execute"), nodeKind: "c_locus", term: call(c2Graph) }],
      edges: [gtl.graphEdge({ fromNodeRef: node("select"), toNodeRef: node("construct") }),
        gtl.graphEdge({ fromNodeRef: node("construct"), toNodeRef: node("prepare"), inputBinding: product.worksiteRevisionRetentionBinding() }),
        gtl.graphEdge({ fromNodeRef: node("prepare"), toNodeRef: node("execute") })] } };
  const revision = (name, role, predicateRef, output) => gtl.constructSemanticRevisionGraphFunction({ graphFunctionRef: ref("graph-function", name), role,
    closureContractRef: close(name, predicateRef, output), childClosureContractRef: ref("contract", name + "-close") });
  const evidence = base.semanticJobLifecycle.stages.find(s => s.bodyCapabilities.includes("application_assessment")); assert.ok(evidence);
  const evidenceGraph = gtl.constructSemanticRevisionGraphFunction({ graphFunctionRef: ref("graph-function", "repair-assessment"), role: "projection", stage: evidence,
    closureContractRef: close("repair-assessment", R.assessorPredicateRef, R.envelopeContractRef),
    childClosureContractRef: ref("contract", "repair-assessment-close") });
  const chain = [revision("repair-projection", "projection", R.projectionPredicateRef, R.envelopeContractRef),
    revision("repair-bridge", "bridge", R.bridgePredicateRef, W.inputContractRef), worksite,
    revision("repair-evidence", "evidenceInput", R.evidenceInputPredicateRef, R.envelopeContractRef), evidenceGraph,
    revision("repair-terminal", "terminal", R.terminalPredicateRef, R.outputContractRef)];
  const rootClose = close("repair-root", R.projectionPredicateRef, R.outputContractRef, "run"), carries = [...new Set(chain.flatMap(g => [...g.inputs, ...g.outputs]))];
  const nodes = chain.map((g, i) => ({ nodeRef: ref("node", "repair-step-" + i), nodeKind: "c_locus", term: call(g) }));
  const repair = { kind: "graph_function", name: ref("graph-function", "repair"), version: "5.0.0", inputs: [R.requestContractRef], outputs: [R.outputContractRef],
    environment: { requires: [R.requestContractRef], provides: carries, carries }, effects: [...new Set(chain.flatMap(g => g.effects))], tags: ["mechanical-only"],
    declarations: { "abg.compute_regime": "mixed", "abg.closure_contract": rootClose, "abg.evidence_contract": D.evidenceContractRef,
      "abg.judgment_contract": D.judgmentContractRef, "abg.judgment_predicate": R.stepPredicateRef, "abg.transition_contract": D.transitionContractRef },
    template: { kind: "inline_graph", graphRef: ref("graph", "repair"), startNodeRef: nodes[0].nodeRef, terminalNodeRefs: [nodes.at(-1).nodeRef], nodes,
      edges: nodes.slice(1).map((n, i) => gtl.graphEdge({ fromNodeRef: nodes[i].nodeRef, toNodeRef: n.nodeRef })), applications: [] } };
  const selection = gtl.constructSemanticRevisionSelectionGraphFunction({ graphFunctionRef: ref("graph-function", "selection"),
    lifecycleRef: base.semanticJobLifecycle.declarationRef, closureContractRef: close("selection", R.selectionPredicateRef, R.selectionContractRef, "run") });
  const programs = [...base.programs, ...[[genericRevisionIds.selectionProgramRef, selection, [selection.name]],
    [genericRevisionIds.repairProgramRef, repair, [repair.name, ...chain.map(g => g.name), C1.graphFunctionRef,
      C1.vectorApplicationGraphFunctionRef, C1.fileReplaceGraphFunctionRef, C1.reducerGraphFunctionRef, W.graphFunctionRef]]].map(([programRef, graph, callableMembership]) => ({
    ...base.programs[0], programRef, starts: [{ startRef: programRef + "/start", graphFunctionRef: graph.name }], callableMembership,
    closureContractRef: graph.declarations["abg.closure_contract"], policies: { ...base.programs[0].policies,
      "abg.default_start_ref": programRef + "/start", "abg.compute_regime": graph === selection ? "F_P" : "mixed" } }))];
  const graphFunctions = [...base.graphFunctions, selection, repair, ...chain];
  return { ...base, programs, graphFunctions, closureContracts: closures,
    contracts: closures.map(c => ({ contractRef: c.closureContractRef, contractKind: "closure", contractVersion: "5.0.0", valueKind: "semantic_stage_closure" })),
    contributions: graphFunctions.map(graph => { const membership = programs.filter(p => p.callableMembership.includes(graph.name)).map(p => p.programRef);
      return { ...base.contributions[0], handle: graph.name, declarationOrContractRef: graph.name, programMembershipRefs: membership, readinessPrerequisiteRefs: membership }; }) };
}

/** Reads exact current files through the existing Product observation owner;
 * it does not invent target layout or modify the subject. */
export async function observeGenericJobRevisionWorksite({ product, original, workspaceAuthorityBasis, workspaceBinding, capabilityGrant }) {
  const operating = { workspaceAuthorityBasis, workspaceBinding, capabilityGrant };
  const targets = [];
  for (const row of original.targets) {
    const relativePath = row.target.subject.relativePath;
    const subject = product.constructWorksiteSubject({ ...operating, relativePath,
      subjectUri: pathToFileURL(resolve(workspaceAuthorityBasis.canonicalRoot, relativePath)).href });
    const territory = product.constructWorksiteTerritory({ ...operating, relativeRoot: row.target.territory.relativeRoot,
      territoryUri: pathToFileURL(resolve(workspaceAuthorityBasis.canonicalRoot, row.target.territory.relativeRoot)).href });
    assert.equal(subject.kind, "worksite_subject"); assert.equal(territory.kind, "worksite_territory");
    const observation = await product.observeWorksiteSubject(workspaceAuthorityBasis, workspaceBinding, subject);
    assert.equal(observation.kind, "worksite_observation"); assert.equal(observation.state, "file");
    const bytes = await readFile(resolve(workspaceAuthorityBasis.canonicalRoot, relativePath));
    assert.equal(product.sha256Bytes(bytes), observation.fileDigest); assert.equal(bytes.length, observation.byteLength);
    const task = product.constructWorksiteConstructionTask({ ...operating, prompt: "Current revision observation", targets: [{ subject, territory, predecessorObservation: observation }] });
    targets.push({ target: task.targets[0], role: row.role, base64: bytes.toString("base64") });
  }
  return { ...operating, targets, commands: original.commands, outcomePredicates: original.outcomePredicates, allowedWriteTerritories: original.allowedWriteTerritories };
}
