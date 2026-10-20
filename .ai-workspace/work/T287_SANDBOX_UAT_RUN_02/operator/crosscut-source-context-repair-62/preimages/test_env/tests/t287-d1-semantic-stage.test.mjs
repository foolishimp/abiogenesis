
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";
const packageRoot = process.env.ABI5_D1_BUILD_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const schemaVersion = "5.0.0";
test("D1 native operating-basis projection conserves exact preparation identity", async t => {
  // Opt-in read-only counterexample: supply a closed proof observation record
  // containing its durable prefix and bridgeResult admissionOrdinal. No run,
  // actor, event append, fixture normalization or synthetic admission occurs.
  const evidencePath = process.env.ABI5_D1_NATIVE_PROJECTION_EVIDENCE;
  if (!evidencePath) {
    t.skip("requires an explicit closed native proof observation record"); return;
  }
  const evidence = JSON.parse(await readFile(evidencePath, "utf8"));
  const product = await import(pathToFileURL(join(packageRoot, "build/code/src/product/index.js")).href);
  const semantic = await import(pathToFileURL(join(packageRoot, "build/code/src/product/semantic_stage.js")).href);
  const abg = await import(pathToFileURL(join(packageRoot, "build/code/src/abg/index.js")).href);
  const { ABI5_SEMANTIC_STAGE_PRODUCT_SEMANTICS: semantics } = await import(
    pathToFileURL(join(packageRoot, "build/code/src/product/builtin_semantics.js")).href);
  const events = abg.readRuntimeEventsAtDurablePrefix(evidence.prefix);
  const result = events.find(e => e.admissionOrdinal === evidence.bridgeResult.admissionOrdinal);
  assert.equal(result?.kind, "c_call_result_admitted");
  assert.equal(result.payload.valueDigest, evidence.bridgeResult.valueDigest);
  const bases = events.filter(e => e.kind === "basis_admitted" && e.basisId === result.basisId);
  assert.equal(bases.length, 1, "one exact admitted bridge input basis");
  const envelope = bases[0].payload.rawInputValue, original = result.payload.value;
  assert.equal(product.isSemanticStageEnvelope(envelope), true);
  assert.equal(original.kind, "worksite_command_preparation_input");
  assert.equal(product.sha256Canonical(envelope), bases[0].payload.rawInputDigest);
  assert.equal(product.sha256Canonical(original), result.payload.valueDigest);
  const task = original.constructionTask;
  const picked = { workspaceAuthorityBasis: task.workspaceAuthorityBasis,
    workspaceBinding: task.workspaceBinding, capabilityGrant: task.capabilityGrant };
  assert.ok(Object.keys(task).length > Object.keys(picked).length,
    "the actual complete C1 task, not a fixture-normalized basis, reaches the owner");
  const projected = semantic.projectSemanticWorksiteCoordinates(envelope.worksite, task);
  assert.ok(projected);
  assert.deepEqual(Object.keys(projected).sort(), Object.keys(envelope.worksite).sort(),
    "caller-only task metadata never becomes semantic inventory");
  assert.deepEqual(projected, semantic.projectSemanticWorksiteCoordinates(envelope.worksite, picked));
  for (const target of task.targets) assert.deepEqual(projected.targets.find(row =>
    row.target.subject.relativePath === target.subject.relativePath)?.target, target,
  "actual selected current target identities and their historical observations are preserved");
  for (const [i, row] of projected.targets.entries()) {
    const before = envelope.worksite.targets[i].target.predecessorObservation;
    const after = row.target.predecessorObservation;
    for (const key of ["state", "fileIdentity", "fileDigest", "byteLength"])
      assert.deepEqual(after[key], before[key], "historical physical observation " + key);
  }
  assert.deepEqual(projected.targets.map(row => row.base64), envelope.worksite.targets.map(row => row.base64));
  const derived = semantic.deriveSemanticWorksitePreparation(envelope, task);
  assert.deepEqual(derived, semantic.deriveSemanticWorksitePreparation(envelope, picked));
  assert.deepEqual(derived, original, "full preparation, prompt bytes, digests and refs equal the admitted original");
  const judgment = events.find(e => e.kind === "c_call_judged" && e.payload.cCallRef === result.payload.cCallRef);
  assert.ok(judgment);
  const relation = semantics.resolveJudgmentRelation(judgment.payload.predicateRef);
  assert.ok(relation);
  assert.equal(relation.evaluate(envelope, original), true, "actual unchanged built-in bridge predicate");
  for (const [label, mutate] of [
    ["stale authority", basis => { basis.workspaceAuthorityBasis.authorityBasisDigest = product.sha256Canonical("stale authority"); }],
    ["foreign workspace", basis => { basis.workspaceBinding.workspaceId += "/foreign"; }],
    ["foreign grant actor", basis => { basis.capabilityGrant.actorRef += "/foreign"; }],
    ["malformed authority", basis => { basis.workspaceAuthorityBasis = null; }],
  ]) {
    const crossed = structuredClone(task); mutate(crossed);
    assert.equal(semantic.projectSemanticWorksiteCoordinates(envelope.worksite, crossed), null, label);
    assert.equal(semantic.deriveSemanticWorksitePreparation(envelope, crossed), null, label);
    assert.equal(relation.evaluate(envelope, { ...original, constructionTask: crossed }), false, label);
  }
  const changedPrompt = { ...original, constructionTask: product.constructWorksiteConstructionTask({
    ...task, prompt: task.prompt + "\nDifferent task instruction." }) };
  assert.equal(relation.evaluate(envelope, changedPrompt), false,
    "projection does not weaken full admitted task equality");
  assert.equal(product.sha256Canonical(abg.readRuntimeEventsAtDurablePrefix(evidence.prefix)),
    product.sha256Canonical(events), "the exact closed admitted prefix is unchanged");
});

test("D1 assessor statement domain matches native assembly and preserves strict relation refusals", { timeout: 180_000 }, async t => {
  // Explicit closed evidence, never an implicit dependency on one scratch Run.
  // This regression reads admitted inputs and invokes existing pure owners;
  // its lawful synthetic candidate is not substituted into saved output/history.
  const evidencePath = process.env.ABI5_D1_ASSESSOR_DOMAIN_EVIDENCE;
  const predecessorRoot = process.env.ABI5_D1_ASSESSOR_PREDECESSOR_ROOT;
  if (!evidencePath || !predecessorRoot) { t.skip("requires explicit closed native observations and predecessor package"); return; }
  const load = (root, name) => import(pathToFileURL(join(root, "build/code/src", name + ".js")).href);
  const [store, prefixes, executions, calls, cursors, materialize, native, instructions, traversal, meaning, digests,
    priorMeaning, priorInstructions] = await Promise.all([
    ...["abg/event_store", "abg/event_prefix", "abg/execution_basis", "abg/c_call", "abg/traversal_cursor", "gtl/materialize",
      "abg/semantic_stage", "abg/instruction_assembly", "hog/traversal", "product/semantic_stage", "shared/digests"].map(name => load(packageRoot, name)),
    load(predecessorRoot, "product/semantic_stage"), load(predecessorRoot, "abg/instruction_assembly")]);
  const closed = JSON.parse(await readFile(evidencePath, "utf8"));
  const allEvents = store.readRuntimeEventsAtDurablePrefix(closed.prefix);
  const bindings = allEvents.filter(e => e.kind === "actor_transport_binding_admitted" && e.payload.instructionAssembly);
  const binding = bindings.findLast(e => e.payload.instructionAssembly.plan.role === "assessor" &&
    Array.isArray(e.payload.instructionAssembly.envelope.sections.predecessors) && e.payload.instructionAssembly.envelope.sections.predecessors.length > 1);
  assert.ok(binding, "actual two-asset native assessor request is required");
  const saved = binding.payload.instructionAssembly;
  const inputs = allEvents.filter(e => e.kind === "c_call_result_admitted" && e.payload.resultRef === saved.envelope.inputRef);
  assert.equal(inputs.length, 1);
  const input = inputs[0].payload.value, asset = input.assets.at(-1), stageRef = saved.plan.stageRef;
  const originalInputDigest = digests.sha256Canonical(input);
  assert.equal(originalInputDigest, binding.payload.inputDigest);
  const observations = allEvents.filter(e => e.kind === "actor_result_artifact_observed" && e.payload.cCallRef === binding.payload.cCallRef);
  assert.equal(observations.length, 1);
  const observed = observations[0].payload, raw = JSON.parse(observed.finalOutput);
  const originalRawDigest = digests.sha256Canonical(raw);
  const source = { cCallRef: binding.payload.cCallRef, inputDigest: observed.inputDigest,
    actorInvocationRef: observed.actorInvocationRef, promptDigest: observed.promptDigest, transportDigest: observed.transportDigest };
  assert.equal(source.inputDigest, originalInputDigest);
  const domain = meaning.semanticAssessmentStatementDomain(input);
  assert.deepEqual(domain, { assetRef: asset.assetRef, statementRefs: asset.candidate.statements.map(s => s.statementRef) });
  assert.ok(Object.isFrozen(domain) && Object.isFrozen(domain.statementRefs));
  assert.equal(meaning.semanticAssessmentStatementDomain({ ...input, assets: [] }), null);
  const earlierRefs = new Set(input.assets.slice(0, -1).flatMap(a => a.candidate.statements.map(s => s.statementRef)));
  const invalidRefs = raw.criteria.flatMap(c => c.statementRefs).filter(ref => !domain.statementRefs.includes(ref));
  assert.ok(invalidRefs.length > 0 && invalidRefs.every(ref => earlierRefs.has(ref)), "actual counterexample cites predecessor statements");
  for (const owner of [priorMeaning, meaning]) assert.equal(owner.deriveSemanticAssessment(input, stageRef, raw, source), null,
    "the original mixed-reference response stays refused, never filtered or rescued");
  const stage = input.lifecycle.stages.find(s => s.declarationRef === stageRef);
  const lawful = { kind: "semantic_stage_assessment_candidate", schemaVersion,
    criteria: stage.rubric.map((c, i) => ({ criterionRef: c.criterionRef, disposition: "indeterminate",
      explanation: "Synthetic field-domain conservation witness, not semantic acceptance.",
      sourceQuotes: raw.criteria[i].sourceQuotes, statementRefs: [...domain.statementRefs] })), pressure: [] };
  const admitted = meaning.deriveSemanticAssessment(input, stageRef, lawful, source);
  assert.ok(admitted);
  assert.equal(admitted.assets.at(-1).assessment.disposition, "indeterminate");
  assert.deepEqual(admitted, priorMeaning.deriveSemanticAssessment(input, stageRef, lawful, source), "admission meaning is unchanged");
  const emptyRefs = structuredClone(lawful); for (const criterion of emptyRefs.criteria) criterion.statementRefs = [];
  assert.ok(meaning.deriveSemanticAssessment(input, stageRef, emptyRefs, source), "empty reference arrays remain lawful");
  for (const [label, mutate] of [
    ["predecessor ref", value => { value.criteria[0].statementRefs = [invalidRefs[0]]; }],
    ["unknown ref", value => { value.criteria[0].statementRefs = ["statement://assessor-domain.example/not-in-candidate"]; }],
    ["ungrounded quote", value => { value.criteria[0].sourceQuotes = [{ memberRef: raw.criteria[0].sourceQuotes[0].memberRef, quote: "Not an original source quotation." }]; }],
    ["rubric order", value => { value.criteria.reverse(); }],
    ["rubric cardinality", value => { value.criteria.pop(); }],
  ]) {
    const changed = structuredClone(lawful); mutate(changed);
    assert.equal(meaning.deriveSemanticAssessment(input, stageRef, changed, source), null, label);
    assert.equal(priorMeaning.deriveSemanticAssessment(input, stageRef, changed, source), null, "prior " + label);
  }
  assert.equal(meaning.deriveSemanticAssessment(input, stageRef, lawful, { ...source, actorInvocationRef: asset.source.actorInvocationRef }), null,
    "author cannot assess itself");
  assert.equal(meaning.deriveSemanticAssessment(input, input.assets[0].stageRef, lawful, source), null, "wrong stage refuses");
  assert.equal(meaning.deriveSemanticAssessment(admitted, stageRef, lawful, source), null, "already assessed candidate refuses");

  const callPaths = Object.keys(closed.rawFileHashes).filter(path => /^call-\d+\.jsonl$/u.test(path));
  assert.equal(callPaths.length, 1, "closed packet identifies one native public call");
  const callBytes = await readFile(join(closed.scratch, callPaths[0]));
  assert.equal(digests.sha256Bytes(callBytes), "sha256:" + closed.rawFileHashes[callPaths[0]]);
  const publications = JSON.parse(callBytes).invocation.resources.catalog.boundPublications;
  function rehydrate(savedAssembly) {
    const durable = savedAssembly.envelope.predecessorPrefix;
    const events = store.readRuntimeEventsAtDurablePrefix(durable), prefix = prefixes.selectValidatedRuntimeEventPrefix(events);
    const opened = events.find(e => e.kind === "c_call_opened" && e.aggregateId === savedAssembly.envelope.cCallRef);
    assert.ok(opened);
    const execution = executions.rehydrateExecutionBasisAtPrefix(prefix, opened.basisId); assert.ok(execution);
    const publication = publications.find(p => p.programs.some(row => row.programRef === execution.programRef));
    const lifecyclePublication = publications.find(p => p.semanticLifecycle?.declarationRef === execution.rawInputValue.lifecycle.declarationRef);
    const sourcePublication = publications.find(p => p.requirementHandoffs?.some(row => row.declarationRef === lifecyclePublication.semanticLifecycle.sourceDeclarationRef));
    const declarations = publications.flatMap(p => p.graphFunctions), graphFunction = declarations.find(g => g.name === execution.graphFunctionRef);
    const graph = materialize.materializeGraph(graphFunction, { invocationAdmissionRef: execution.invocationAdmissionRef,
      admittedInputRef: execution.rawInputAdmissionRef, admittedInputDigest: execution.rawInputDigest, admittedInput: execution.rawInputValue });
    const cCall = calls.projectOpenedCCallCarrierAtPrefix(prefix, graph, opened.aggregateId); assert.ok(cCall);
    const entered = events.find(e => e.kind === "traversal_cursor_entered" && e.graphCallId === opened.graphCallId && e.basisId === opened.basisId);
    assert.ok(entered); const cp = entered.payload;
    let cursor = cursors.constructTraversalCursorCandidate({ programRef: cp.programRef, executionBasisRef: cp.executionBasisRef,
      traversalScopeRef: cp.traversalScopeRef, runId: entered.runId, graphCallId: entered.graphCallId, frameId: entered.frameId,
      graphRef: cp.materializationRef, inputRef: cp.inputRef, inputDigest: cp.inputDigest, currentNodeRef: graph.template.startNodeRef,
      position: "at_term", termPath: cp.termPath, taskOrdinal: cp.taskOrdinal, attempt: cp.attempt, retryPath: cp.retryPath });
    assert.equal(cursor.cursorDigest, cp.cursorDigest);
    cursor = traversal.deriveStructuralTargetCursor(graph, cursor, graph.template.nodes[0].term);
    assert.equal(cursor?.kind, "traversal_cursor");
    if (savedAssembly.plan.role === "assessor") cursor = traversal.deriveCompletedTraversalCursor(graph, cursor,
      { inputRef: savedAssembly.envelope.inputRef, inputDigest: savedAssembly.envelope.inputDigest });
    assert.equal(cursor?.cursorDigest, opened.payload.cursorDigest, "existing HoG derivation recreates the exact admitted cursor");
    const basis = { publication, lifecyclePublication, sourcePublication, graph, graphFunction, declarationGraphFunctions: declarations,
      executionBasis: execution, cCall, cursor, predecessorPrefix: durable };
    assert.ok(native.authenticateSemanticStageBasis(basis));
    const exactInput = native.semanticInputValueAtBasis(basis);
    assert.equal(native.semanticInputMatchesBasis(basis, exactInput), true);
    return { basis, exactInput };
  }
  const { basis, exactInput } = rehydrate(saved);
  assert.deepEqual(exactInput, input);
  assert.deepEqual(priorInstructions.constructNativeInstructionAssembly(basis, input), saved, "original full request rederives against saved admitted basis");
  const current = instructions.constructNativeInstructionAssembly(basis, input); assert.ok(current);
  assert.deepEqual(instructions.constructNativeInstructionAssembly(basis, input), current, "complete new assembly rederives deterministically");
  assert.deepEqual(current.plan, saved.plan);
  assert.deepEqual(current.envelope.sections.role.stdo, saved.envelope.sections.role.stdo);
  for (const section of ["source", "obligations", "predecessors", "worksite", "evidence", "task"])
    assert.deepEqual(current.envelope.sections[section], saved.envelope.sections[section], section + " is conserved");
  const role = current.envelope.sections.role.native ?? current.envelope.sections.role;
  assert.ok(role.includes(JSON.stringify(domain.assetRef)));
  assert.ok(role.includes("Eligible current-candidate statement refs: " + JSON.stringify(domain.statementRefs)));
  assert.match(role, /predecessor assets remain contextual evidence/u);
  const projectedSchema = current.request.responseJsonSchema;
  assert.match(projectedSchema.properties.criteria.items.properties.statementRefs.description, /exact current candidate/u);
  const schemaWithoutDescription = structuredClone(projectedSchema);
  delete schemaWithoutDescription.properties.criteria.items.properties.statementRefs.description;
  assert.deepEqual(schemaWithoutDescription, saved.request.responseJsonSchema, "only the existing field's description changes");
  assert.notEqual(current.manifest.promptDigest, saved.manifest.promptDigest);
  assert.equal(current.request.inputDigest, saved.request.inputDigest);
  for (const row of current.manifest.sections) assert.equal(row.digest, digests.sha256Canonical(current.envelope.sections[row.name]));
  assert.equal(current.envelopeDigest, digests.sha256Canonical(current.envelope));
  assert.equal(current.manifestDigest, digests.sha256Canonical(current.manifest));
  assert.ok(instructions.nativeInstructionRequestMatches(basis, input, current.request));
  assert.equal(instructions.nativeInstructionRequestMatches(basis, input, saved.request), false, "old ambiguous request cannot pass as repaired assembly");
  const stale = structuredClone(input); stale.assets.at(-1).candidate.statements[0].statementRef += "/stale";
  assert.equal(instructions.constructNativeInstructionAssembly(basis, stale), null, "same-shaped stale input refuses before dispatch");
  const author = bindings.findLast(e => e.payload.instructionAssembly.plan.role === "author" && e.payload.instructionAssembly.plan.stageRef === stageRef);
  assert.ok(author);
  const authorSaved = author.payload.instructionAssembly, authorBasis = rehydrate(authorSaved);
  assert.deepEqual(instructions.constructNativeInstructionAssembly(authorBasis.basis, authorBasis.exactInput), authorSaved, "author assembly is unchanged");
  assert.equal(digests.sha256Canonical(input), originalInputDigest);
  assert.equal(digests.sha256Canonical(raw), originalRawDigest);
  assert.deepEqual(store.readRuntimeEventsAtDurablePrefix(closed.prefix), allEvents, "closed history is unchanged");
  console.log(JSON.stringify({ kind: "assessor_field_domain_native_rederivation", assetRef: domain.assetRef,
    eligibleStatementCount: domain.statementRefs.length, originalInvalidReferenceCount: invalidRefs.length,
    oldPromptDigest: saved.manifest.promptDigest, newPromptDigest: current.manifest.promptDigest,
    manifestDigest: current.manifestDigest, authorConserved: true, originalMixedResponseRefused: true,
    syntheticCurrentOnlyDisposition: "indeterminate", newNativeExecution: false }));
});
