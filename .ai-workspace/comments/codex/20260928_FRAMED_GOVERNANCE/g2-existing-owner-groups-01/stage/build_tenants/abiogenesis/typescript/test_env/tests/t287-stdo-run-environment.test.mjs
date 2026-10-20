import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile, realpath } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as product from "../../build/code/src/product/index.js";
import * as gtl from "../../build/code/src/gtl/index.js";
import { observeStdoEnvironment } from "../../build/code/src/product/stdo_environment.js";
import { isStdoEnvironmentEvidence, projectStdoRoleEvidence } from "../../build/code/src/abg/stdo_environment.js";
import { ROOT_EVENT_CONTRACTS, ROOT_EVENT_CONTRACT_DIGEST, ROOT_EVENT_CONTRACT_DESCRIPTOR, LEGACY_ROOT_EVENT_CONTRACTS,
  LEGACY_ROOT_EVENT_CONTRACT_DIGEST, isKnownRootEventContractDigest } from "../../build/code/src/abg/event_store.js";
import { validStdoEnvironmentPublication, validStdoEnvironmentProgram } from "../../build/code/src/gtl/stdo_run_environment.js";
import { prepareStdoNoteProduct, pilotResources } from "../support/stdo-environment-pilot.mjs";
const packageRoot=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
test("construction readiness rederives the exact retained native request and preserves unknown refusal", { timeout: 180_000 }, async t => {
  if (!process.env.ABI5_DESIGN_CONTEXT_OBSERVATIONS || !process.env.ABI5_DESIGN_CONTEXT_PREDECESSOR) {
    t.skip("requires explicit closed observations and frozen predecessor package"); return;
  }
  const load = name => import(pathToFileURL(join(packageRoot, "build/code/src", name + ".js")).href);
  const [store, prefixes, executions, calls, cursors, materialize, semantic, instructions, traversal, meaning] = await Promise.all([
    "abg/event_store", "abg/event_prefix", "abg/execution_basis", "abg/c_call", "abg/traversal_cursor", "gtl/materialize",
    "abg/semantic_stage", "abg/instruction_assembly", "hog/traversal", "product/semantic_stage"].map(load));
  const closed = JSON.parse(await readFile(process.env.ABI5_DESIGN_CONTEXT_OBSERVATIONS, "utf8"));
  const allEvents = store.readRuntimeEventsAtDurablePrefix(closed.validatedPrefix);
  const binding = allEvents.find(e => e.kind === "actor_transport_binding_admitted" && e.payload.instructionAssembly?.plan.role === "author");
  assert.ok(binding, "closed native author binding is present");
  const saved = binding.payload.instructionAssembly, durable = saved.envelope.predecessorPrefix;
  const events = store.readRuntimeEventsAtDurablePrefix(durable), prefix = prefixes.selectValidatedRuntimeEventPrefix(events);
  const opened = events.find(e => e.kind === "c_call_opened" && e.aggregateId === saved.envelope.cCallRef);
  const execution = executions.rehydrateExecutionBasisAtPrefix(prefix, opened.basisId); assert.ok(execution);
  const callBytes = await readFile(closed.artifacts.nativeCall.path);
  assert.equal(product.sha256Bytes(callBytes), "sha256:" + closed.artifacts.nativeCall.sha256);
  const publicCall = JSON.parse(callBytes), publications = publicCall.invocation.resources.catalog.boundPublications;
  const publication = publications.find(p => p.programs.some(row => row.programRef === execution.programRef));
  const lifecyclePublication = publications.find(p => p.semanticLifecycle?.declarationRef === execution.rawInputValue.lifecycle.declarationRef);
  const sourcePublication = publications.find(p => p.requirementHandoffs?.some(row => row.declarationRef === lifecyclePublication.semanticLifecycle.sourceDeclarationRef));
  const declarations = publications.flatMap(p => p.graphFunctions), graphFunction = declarations.find(g => g.name === execution.graphFunctionRef);
  const graph = materialize.materializeGraph(graphFunction, { invocationAdmissionRef: execution.invocationAdmissionRef,
    admittedInputRef: execution.rawInputAdmissionRef, admittedInputDigest: execution.rawInputDigest, admittedInput: execution.rawInputValue });
  const cCall = calls.projectOpenedCCallCarrierAtPrefix(prefix, graph, opened.aggregateId); assert.ok(cCall);
  const route = events.find(e => e.kind === "traversal_route_admitted" && e.payload.targetCursorRef === opened.payload.cursorRef);
  const entered = events.find(e => e.kind === "traversal_cursor_entered" && e.payload.cursorRef === (route?.payload.sourceCursorRef ?? opened.payload.cursorRef));
  assert.ok(entered, "the retained first author uses the admitted initial/structural cursor");
  const cp = entered.payload;
  let cursor = cursors.constructTraversalCursorCandidate({ programRef: cp.programRef, executionBasisRef: cp.executionBasisRef,
    traversalScopeRef: cp.traversalScopeRef, runId: entered.runId, graphCallId: entered.graphCallId, frameId: entered.frameId,
    graphRef: cp.materializationRef, inputRef: cp.inputRef, inputDigest: cp.inputDigest, currentNodeRef: graph.template.startNodeRef,
    position: "at_term", termPath: cp.termPath, taskOrdinal: cp.taskOrdinal, attempt: cp.attempt, retryPath: cp.retryPath });
  assert.equal(cursor.cursorDigest, cp.cursorDigest);
  if (route) cursor = traversal.deriveStructuralTargetCursor(graph, cursor, graph.template.nodes[0].term);
  assert.equal(cursor.cursorDigest, opened.payload.cursorDigest);
  const basis = { publication, lifecyclePublication, sourcePublication, graph, graphFunction, declarationGraphFunctions: declarations,
    executionBasis: execution, cCall, cursor, predecessorPrefix: durable };
  const owner = semantic.authenticateSemanticStageBasis(basis); assert.ok(owner, "actual shared owner authenticates saved native basis");
  const input = execution.rawInputValue;
  assert.equal(semantic.semanticInputMatchesBasis(basis, input), true);
  const predecessor = await import(pathToFileURL(join(process.env.ABI5_DESIGN_CONTEXT_PREDECESSOR, "build/code/src/abg/instruction_assembly.js")).href);
  assert.deepEqual(predecessor.constructNativeInstructionAssembly(basis, input), saved, "complete old request is independently rederived");
  const current = instructions.constructNativeInstructionAssembly(basis, input); assert.ok(current);
  assert.deepEqual(instructions.constructNativeInstructionAssembly(basis, input), current);
  assert.deepEqual(current.plan, saved.plan);
  assert.deepEqual(current.request.responseJsonSchema, saved.request.responseJsonSchema);
  assert.equal(current.request.inputDigest, saved.request.inputDigest);
  assert.deepEqual(current.envelope.sections.role.stdo, saved.envelope.sections.role.stdo);
  for (const section of ["source", "obligations", "predecessors", "worksite", "evidence", "task"])
    assert.deepEqual(current.envelope.sections[section], saved.envelope.sections[section], section + " is conserved");
  assert.match(current.envelope.sections.role.native, /Construction-readiness boundary/u);
  assert.match(current.envelope.sections.role.native, /Preserve unknown when a necessary prerequisite/u);
  assert.match(current.envelope.sections.role.native, /snapshot writes, not the separate construction replacement grant/u);
  assert.doesNotMatch(current.request.prompt, /for the later Requirements stage/u);
  assert.notEqual(current.manifest.promptDigest, saved.manifest.promptDigest);
  for (const row of current.manifest.sections) assert.equal(row.digest, product.sha256Canonical(current.envelope.sections[row.name]));
  assert.equal(current.envelopeDigest, product.sha256Canonical(current.envelope));
  assert.equal(current.manifestDigest, product.sha256Canonical(current.manifest));
  const stale = structuredClone(input); stale.worksite.targets[0].base64 = Buffer.from("not the admitted inventory").toString("base64");
  assert.equal(instructions.constructNativeInstructionAssembly(basis, stale), null);
  const completedDesign = allEvents.find(e => e.kind === "c_call_result_admitted" &&
    e.payload.value?.kind === "semantic_stage_envelope" && e.payload.value.assets.at(-1)?.assessment?.disposition === "satisfied").payload.value;
  assert.equal(completedDesign.assets.at(-1).candidate.worksiteDesign.dependencyDisposition, "unknown");
  assert.equal(meaning.deriveSemanticWorksiteConstructionConfiguration(completedDesign), null, "the actual negative live Design still refuses construction");
  assert.deepEqual(store.readRuntimeEventsAtDurablePrefix(closed.validatedPrefix), allEvents, "retained prefix is unchanged");
  console.log(JSON.stringify({ kind: "native_context_offline_rederivation", oldPromptDigest: saved.manifest.promptDigest,
    promptDigest: current.manifest.promptDigest, manifestDigest: current.manifestDigest, sourceAndTaskConserved: true,
    unknownRefused: true, staleInputRefused: true, newNativeExecution: false }));
});

test("STDO declaration, exact actual access, bounded refusals and immutable profiles",async()=>{
  assert.ok(process.env.ABI5_ENV_PROOF_ROOT);assert.ok(process.env.ABI5_ENV_INPUT_ROOT);
  await mkdir(process.env.ABI5_ENV_PROOF_ROOT,{recursive:true});
  const scratch=await mkdtemp(join(process.env.ABI5_ENV_PROOF_ROOT,"component-"));
  const manifest=JSON.parse(await readFile(join(packageRoot,"product-toolchain-manifest.json"),"utf8"));
  const abiArtifact={...manifest,manifestDigest:product.sha256Canonical(manifest),artifactDigest:"sha256:"+"0".repeat(64)};
  const fixture=await prepareStdoNoteProduct({scratch,product,gtl,abiArtifact,inputRoot:process.env.ABI5_ENV_INPUT_ROOT});
  const pubs=await fixture.loadInstalledPublications({installedRoot:fixture.sourceRoot});
  const publication=pubs.find(p=>p.programs.some(x=>x.programRef===fixture.ids.programRef)),program=publication.programs[0];
  assert.equal(validStdoEnvironmentPublication(publication),true);
  assert.equal(validStdoEnvironmentProgram(publication,program,publication.graphFunctions),true);
  const duplicate=structuredClone(fixture.env.declaration);duplicate.accesses[0].frameIndexRefs.push(duplicate.accesses[0].frameIndexRefs[0]);
  assert.equal(gtl.isStdoRunEnvironmentDeclaration(duplicate),false);
  const missingRole=structuredClone(publication);missingRole.stdoRunEnvironments[0].roles.pop();
  assert.equal(validStdoEnvironmentProgram(missingRole,program,missingRole.graphFunctions),false);
  const archiveRoot=join(scratch,"archive"),temporaryRoot=join(archiveRoot,"support");await mkdir(temporaryRoot,{recursive:true});
  const authority={authorityRef:"authority://stdo-note.example/component-only",authorityDigest:product.sha256Canonical({component:true}),actorRef:"actor://stdo-note.example/component-only"};
  const resources=pilotResources(product,fixture.env,authority,program,await realpath(temporaryRoot));
  const common={publication,program,graphFunctions:publication.graphFunctions,authority,archiveRoot};
  const missing=await observeStdoEnvironment(common);assert.equal(missing.cause,"missing_binding");
  const denied=structuredClone(resources);denied.permission.actorRef+="not-authorized";
  const permission=await observeStdoEnvironment({...common,resources:denied});assert.equal(permission.cause,"access_not_permitted");
  const wrong=structuredClone(resources);wrong.roots.pythonPath=wrong.roots.representationRecordPath;wrong.permission.roots=wrong.roots;
  const mismatch=await observeStdoEnvironment({...common,resources:wrong});assert.equal(mismatch.cause,"identity_mismatch");
  const positive=await observeStdoEnvironment({...common,resources});
  await writeFile(join(scratch,"observations.json"),JSON.stringify({missing,permission,mismatch,positive},null,2)+"\n");
  assert.equal(positive.kind,"stdo_environment_observed",JSON.stringify(positive));
  assert.equal(isStdoEnvironmentEvidence(positive.evidence),true);
  const changed=structuredClone(positive.evidence);changed.accesses[0].stdout.base64=Buffer.from("{}").toString("base64");
  assert.equal(isStdoEnvironmentEvidence(changed),false);
  const receiptAttempt={...resources,projection:positive.evidence.accesses[0].projection};
  assert.equal((await observeStdoEnvironment({...common,resources:receiptAttempt})).cause,"access_not_permitted");
  const nonAdopting=pubs.find(p=>p.programs.some(x=>x.programRef===fixture.ids.sourceProgramRef));
  assert.deepEqual(await observeStdoEnvironment({publication:nonAdopting,program:nonAdopting.programs[0],graphFunctions:nonAdopting.graphFunctions,authority,archiveRoot}),
    {kind:"stdo_environment_observed",evidence:null});
  assert.equal(ROOT_EVENT_CONTRACTS.invocation_admitted.payloadVariants.length,4);
  assert.deepEqual(ROOT_EVENT_CONTRACTS.invocation_admitted.payloadVariants.slice(0,2),LEGACY_ROOT_EVENT_CONTRACTS.invocation_admitted.payloadVariants);
  assert.equal(LEGACY_ROOT_EVENT_CONTRACT_DIGEST,"sha256:fc3a635040a6e3d763740ae54b6390944c7ea8cedfa060de110cb36e31ca6e3c");
  assert.equal(ROOT_EVENT_CONTRACT_DESCRIPTOR.profileRef,"abg.event-contract.root/p4-stdo-run-environment@1");
  const oldDescriptor={...ROOT_EVENT_CONTRACT_DESCRIPTOR,profileRef:"abg.event-contract.root/p3-undispatched-owner-refusal@1",
    eventContracts:{...ROOT_EVENT_CONTRACTS,invocation_admitted:LEGACY_ROOT_EVENT_CONTRACTS.invocation_admitted}};
  const predecessorDigest=product.sha256Canonical(oldDescriptor);
  assert.notEqual(predecessorDigest,ROOT_EVENT_CONTRACT_DIGEST);assert.equal(isKnownRootEventContractDigest(predecessorDigest),false);
  await writeFile(join(scratch,"result.json"),JSON.stringify({kind:"stdo_component_check",checks:"passed",nativeSemanticQualification:false,
    actualAccess:positive.evidence.accesses.map(a=>({accessRef:a.accessRef,projectionDigest:a.projectionDigest,command:a.command,durationMs:a.durationMs})),
    profiles:{legacy:LEGACY_ROOT_EVENT_CONTRACT_DIGEST,predecessor:predecessorDigest,current:ROOT_EVENT_CONTRACT_DIGEST}},null,2)+"\n");
  console.log(JSON.stringify({kind:"stdo_component_check",scratch,disposition:"passed"}));
});
