import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdir,mkdtemp,readFile,writeFile,readdir,copyFile} from 'node:fs/promises';
import {join,basename} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import * as gtl from '../../build/code/src/gtl/index.js';
import * as product from '../../build/code/src/product/index.js';
import * as validator from '../../build/code/src/validator/index.js';
import {setupInstalledRootCatalog} from '../support/root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct,constructInstalledStartCall,constructInstalledRunReadCall,runInstalledCliRequest} from '../support/registered-graph-selection.mjs';
import {nativeSelectionEnvironment} from '../support/native-registered-selection.mjs';
import {declarations,initialState,validState,evaluatedState,selectionTask,executeA,executeB,SEMANTICS,ref,contract,hash} from '../fixtures/registered-selection-product/recursive.mjs';
const packageRoot=new URL('../..',import.meta.url).pathname;

function environmentDeclaration(){
  const text='Use the declared frame.',digest=product.sha256Bytes(Buffer.from(text)),member={path:'frame.txt',type:'file',digest,target:null};
  const contextMember={memberRef:'member:frame',path:member.path,byteCount:Buffer.byteLength(text),digest};
  return gtl.constructRunEnvironmentDeclaration({kind:'run_environment_declaration',schemaVersion:'5.0.0',declarationRef:'environment:fixture',dependencies:[{dependencyRef:'dependency:frame',basisRef:'generic://frame/',recordRef:'record:frame',recordDigest:digest,recordFormat:'member_inventory@1',inventoryDigest:gtl.stdoInventoryDigest([member]),members:[member]}],
    contexts:[{contextRef:'context:frame',sourceLocator:'generic://frame/',inventoryDigest:hash([contextMember]),members:[contextMember]}],corpusAccess:null,accesses:[],
    roles:[{graphFunctionRef:ref('graph-function','root'),programLocusRef:ref('node','select'),role:'selector',frameRefs:['frame:executive'],policy:{policyRef:'policy:frame',text,digest},contextPolicy:{policyRef:'policy:context',selectors:['full_source','active_binding_semantics']},accessRefs:[],sourceBindings:[{contextRef:'context:frame',memberRef:contextMember.memberRef,memberDigest:digest,startByte:0,endByte:Buffer.byteLength(text),spanDigest:digest}]}]});
}
test('recursive fixture declares a valid bounded Program with one native selector',()=>{
  const digest='sha256:'+'1'.repeat(64),d=declarations(gtl,environmentDeclaration());
  const publication=gtl.modulePublication({kind:'module_publication',moduleVersion:'5.0.0',...d,artifactDigest:digest,productContentDigest:digest,productManifestDigest:digest,contributions:d.contributions.map(c=>({...c,provenanceRefs:[digest]}))});
  const raw=(v,k)=>{const result=validator.rawAdmitValue(v,k,'contract:fixture');assert.equal(result.kind,'raw_admitted_value',JSON.stringify(result));return result;};
  const admitted=raw(publication,'module_publication');
  const validation=validator.validateProgram({declarationBasisDigest:admitted.subjectDigest,programPublication:admitted,program:raw(publication.programs[0],'gtl_program'),graphFunctions:publication.graphFunctions.map(v=>raw(v,'graph_function')),contracts:publication.contracts.map(v=>raw(v,'contract_declaration')),evaluators:publication.evaluators,rules:publication.rules,implementationBindings:publication.implementationBindings.map(v=>raw(v,'implementation_binding')),closureContracts:publication.closureContracts.map(v=>raw(v,'closure_contract'))});
  assert.equal(validation.kind,'program_validation',JSON.stringify(validation));
  assert.equal(validation.executableLeafRows.filter(r=>r.fibre==='F_P').length,1);
  const app=d.graphFunctions.at(-1).template.applications[0];assert.equal(app.bound,3);assert.equal(app.foldback.requiresParentEvaluation,true);
  assert.equal(gtl.recursionTerminationDecision(app,initialState()),false);
  assert.equal(gtl.recursionTerminationDecision(app,{kind:'missing-state'}),null);
});
test('receiver counterevidence and unresolved task survive child returns until parent evaluation',()=>{
  const initial=initialState(),first=executeA(initial).resultCandidate;
  assert.equal(SEMANTICS.resolveJudgmentRelation(ref('predicate','workflow')).evaluate(initial,first),true);
  assert.equal(first.measurements[0].accepted,false);assert.equal(first.terminal,false);assert.deepEqual(first.unresolvedSupportRefs,initial.requiredSupportRefs);
  const secondInput=evaluatedState(first),task=selectionTask(secondInput);
  assert.deepEqual(task.childInput.value,secondInput);assert.deepEqual(task.observations.at(-1).value,first.measurements[0]);
  const second=executeB(secondInput).resultCandidate;assert.equal(second.measurements[1].accepted,true);assert.equal(second.terminal,false);
  assert.deepEqual(second.unresolvedSupportRefs,initial.requiredSupportRefs);
  const terminal=evaluatedState(second);assert.equal(terminal.terminal,true);assert.deepEqual(terminal.unresolvedSupportRefs,[]);
  for(const s of [first,secondInput,second,terminal]){assert.equal(validState(s),true);assert.deepEqual(s.task,initial.task);assert.equal(s.taskDigest,initial.taskDigest);assert.deepEqual(s.requiredSupportRefs,initial.requiredSupportRefs);}
  const childRelation=SEMANTICS.resolveJudgmentRelation(ref('predicate','B'));
  assert.equal(childRelation.evaluate(secondInput,terminal),false,'child cannot clear obligations or certify parent completion');
  for(const alter of [s=>{delete s.taskDigest;},s=>{s.requiredSupportRefs=[];},s=>{s.measurements[0].accepted=true;},s=>{s.measurements[0].diagnostic='fabricated';}]){
    const bad=structuredClone(first);alter(bad);assert.equal(validState(bad),false);assert.throws(()=>selectionTask(bad),/invalid recursive/);
  }
});

test('one installed Public start revises native choice from child evidence and reevaluates its parent',{skip:process.env.ABI5_RECURSIVE_SELECTION_LIVE!=='1'},async()=>{
  const evidence=process.env.ABI5_RECURSIVE_SELECTION_EVIDENCE_ROOT??await mkdtemp(join(tmpdir(),'abi5-recursive-selection-'));
  await mkdir(evidence,{recursive:true});const save=(n,v)=>writeFile(join(evidence,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
  const provider=JSON.parse(await readFile(process.env.ABI5_NATIVE_SELECTION_PROVIDER,'utf8'));
  assert.equal(provider.requestedModel,'claude-opus-5-5');assert.equal(provider.requestedEffort,'xhigh');assert.equal(await product.sha256File(provider.executable),provider.sha256);
  await save('provider.json',provider);
  let selectedEnvironment;const accounting={wallMs:{}};
  const env=await setupInstalledRootCatalog({after:()=>{}},packageRoot,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,setupAccounting:accounting,
    prepareAdditionalProducts:async basis=>{
      selectedEnvironment=await nativeSelectionEnvironment(basis);
      const abiPackageArchivePath=join(basis.scratch,'artifacts',(await readdir(join(basis.scratch,'artifacts'))).find(p=>p.endsWith('.tgz')));
      return [await prepareRegisteredSelectionProduct({...basis,abiPackageArchivePath,declarationFactory:g=>declarations(g,selectedEnvironment.declaration),fixtureFiles:['index','native','recursive'].map(n=>({path:`build/${n}.mjs`,source:new URL(`../fixtures/registered-selection-product/${n}.mjs`,import.meta.url)}))})];
    }});
  await save('setup.json',{scratch:env.scratch,installedRoots:env.installedRoots,artifactPaths:env.artifactPaths,accounting});
  await save('archive.json',{path:env.artifactPath,sha256:await product.sha256File(env.artifactPath),consumer:env.additionalProducts[0].basis});
  await save('run-environment.json',selectedEnvironment.declaration);
  await copyFile(env.artifactPath,join(evidence,'core.tgz'));await copyFile(env.additionalProducts[0].artifactPath,join(evidence,'consumer.tgz'));
  const publication=env.additionalPublications[0];await save('publication.json',publication);
  env.catalogView=env.product.narrowGraphFunctionCatalog(env.catalog,['recursive-parent','root','A','B'].map(n=>ref('graph-function',n)));
  assert.equal(env.catalogView.kind,'graph_function_catalog_view');
  const load=async path=>import(pathToFileURL(join(env.installedRoot,`build/code/src/${path}.js`)).href);
  const publicApi=await load('public/index'),readContracts=await load('abg/project_read_operation_contracts'),storeOwner=await load('abg/event_store');
  let handoff=env.store.projectReopenAuthorityAndClose();const before=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).length;
  const resource=()=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)});
  const input=initialState();await save('input.json',input);
  const start=await constructInstalledStartCall({environment:env,publicApi,eventResource:resource(),input,identity:'recursive',runEnvironmentResourceFactory:selectedEnvironment.resources});
  const execution=await runInstalledCliRequest({scratch:env.scratch,installedRoot:env.installedRoot,identity:'recursive',acquisition:{kind:'reopen',closeHandoff:handoff},call:start.call,expectedExitCode:null,
    environment:{...process.env,ABG_TS_CLAUDE_COMMAND:provider.executable,ABG_TS_CLAUDE_APPEND_ARGS:JSON.stringify(provider.appendArgs)}});
  await save('execution.json',execution);const receipt=execution.output.receipt;assert.ok(receipt,JSON.stringify(execution.output));
  handoff=receipt.resources.eventResource.closeHandoff;await save('handoff.json',handoff);
  const allEvents=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix),events=allEvents.slice(before);await save('events.json',events);
  await writeFile(join(evidence,'events.jsonl'),await readFile(new URL(handoff.prefix.eventLogRef)),{flag:'wx'});
  const bindings=events.filter(e=>e.kind==='actor_transport_binding_admitted');
  for(const [i,binding] of bindings.entries()){
    await save(`assembly-${i+1}.json`,binding.payload.instructionAssembly);
    for(const [name,path] of Object.entries(binding.payload.paths))if(typeof path==='string')try{await copyFile(path,join(evidence,`actor-${i+1}-${name}-${basename(path)}`));}catch(error){if(error.code!=='ENOENT')throw error;}
  }
  assert.equal(receipt.ownerOutput.outcomeKind,'result',JSON.stringify(receipt.ownerOutput));
  assert.equal(receipt.ownerOutput.value.disposition,'completed',JSON.stringify(receipt.ownerOutput));
  assert.equal(bindings.length,2,'exactly two native decisions in one invocation');
  const observations=events.filter(e=>e.kind==='actor_result_artifact_observed'),choices=events.filter(e=>e.kind==='c_call_result_admitted'&&e.payload.value?.kind==='registered_graph_choice');
  const parentCalls=events.filter(e=>e.kind==='c_call_opened'&&e.graphFunctionRef===ref('graph-function','recursive-parent'));
  const parentResults=events.filter(e=>e.kind==='c_call_result_admitted'&&e.graphFunctionRef===ref('graph-function','recursive-parent'));
  const measured=events.filter(e=>e.kind==='c_call_result_admitted'&&['A','B'].some(n=>e.graphFunctionRef===ref('graph-function',n)));
  assert.deepEqual(parentCalls.map(e=>e.payload.attempt),[1,2,3]);assert.equal(new Set(parentCalls.map(e=>e.frameId)).size,1);
  assert.deepEqual(parentResults.map(e=>e.payload.value.terminal),[false,false,true]);assert.deepEqual(measured.map(e=>e.payload.value.measurements.at(-1).accepted),[false,true]);
  assert.ok(parentResults[2].admissionOrdinal>measured[1].admissionOrdinal);
  const targets=['A','B'].map(n=>env.catalogView.entries.find(e=>e.definitionRef===ref('graph-function',n))).map(e=>({graphFunctionRef:e.definitionRef,definitionDigest:e.definitionDigest}));
  const projected=events.filter(e=>e.kind==='c_call_result_admitted'&&e.payload.value?.kind==='registered_selection_task');
  const timings=[];
  for(const [i,binding] of bindings.entries()){
    assert.equal(binding.payload.command,provider.executable);assert.equal(binding.payload.args[binding.payload.args.indexOf('--model')+1],'claude-opus-5-5');assert.equal(binding.payload.args[binding.payload.args.indexOf('--effort')+1],'xhigh');assert.ok(!binding.payload.args.includes('--fallback-model'));
    const rows=(await readFile(binding.payload.paths.stdoutPath??binding.payload.paths.stdout,'utf8')).trim().split('\n').filter(Boolean).map(l=>JSON.parse(l));
    const models=[...new Set(rows.flatMap(r=>[r.model,r.message?.model,...Object.keys(r.modelUsage??{})]).filter(Boolean))];assert.ok(models.length>0&&models.every(m=>m==='claude-opus-5-5'));
    const raw=JSON.parse(observations[i].payload.finalOutput);assert.equal(observations[i].payload.toolCallCount,0);
    assert.equal(raw.graphFunctionRef,ref('graph-function',i===0?'A':'B'),'unexpected native answer stops the proof; no oracle repair');
    assert.deepEqual(choices[i].payload.value,product.materializeNativeRegisteredChoice(projected[i].payload.value,targets,raw));
    const prompt=binding.payload.instructionAssembly.request.prompt;assert.ok(!prompt.includes('readinessBasis'));assert.ok(Buffer.byteLength(prompt)<=65_536);
    const started=events.find(e=>e.kind==='actor_invocation_started'&&e.parentAggregateId===binding.parentAggregateId),closed=events.find(e=>e.kind==='actor_invocation_closed'&&e.parentAggregateId===binding.parentAggregateId);
    assert.ok(started&&closed);timings.push({actor:i+1,nativeIntervalMs:Date.parse(closed.eventTime)-Date.parse(started.eventTime),promptBytes:Buffer.byteLength(prompt),raw,models});
  }
  assert.deepEqual(projected[1].payload.value.observations.at(-1).value,measured[0].payload.value.measurements[0]);
  assert.ok(bindings[1].payload.instructionAssembly.request.prompt.includes(measured[0].payload.value.measurements[0].diagnostic));
  for(const e of [...parentResults,...measured]){assert.deepEqual(e.payload.value.task,input.task);assert.equal(e.payload.value.taskDigest,input.taskDigest);assert.deepEqual(e.payload.value.requiredSupportRefs,input.requiredSupportRefs);}
  const foldbacks=events.filter(e=>e.kind==='child_foldback_admitted'),recursive=foldbacks.filter(e=>e.payload.applicationRef!==undefined);
  assert.equal(foldbacks.length,4);assert.equal(recursive.length,2);
  for(const foldback of recursive){const route=events.find(e=>e.kind==='traversal_route_admitted'&&e.payload.consumedAvailabilityRefs?.includes(foldback.payload.foldbackRef));assert.ok(route?.causationEventRefs.includes(foldback.eventId));assert.ok(route.admissionOrdinal>foldback.admissionOrdinal);}
  const closed=events.filter(e=>e.kind==='run_closed');assert.equal(closed.length,1);assert.ok(closed[0].admissionOrdinal>parentResults[2].admissionOrdinal);
  await save('timing.json',{setup:accounting,totalExecutionMs:execution.wallMs,native:timings,frameworkOutsideNativeIntervalsMs:execution.wallMs-timings.reduce((n,t)=>n+t.nativeIntervalMs,0),publicRequestBytes:(await readFile(execution.requestPath)).length,eventCount:events.length,eventBytes:Buffer.byteLength(JSON.stringify(events))});
  for(const memberKey of ['run_result','run_replay']){
    const call=constructInstalledRunReadCall({environment:env,publicApi,projectReadContracts:readContracts,memberKey,selector:memberKey==='run_result'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:2048},source:receipt.resources.run,eventResource:resource(),identity:`recursive-${memberKey}`});
    const read=await runInstalledCliRequest({scratch:env.scratch,installedRoot:env.installedRoot,identity:`recursive-${memberKey}`,acquisition:{kind:'reopen',closeHandoff:handoff},call:call.call,expectedExitCode:0});await save(`read-${memberKey}.json`,read);
    assert.deepEqual(read.output.receipt.resources.eventResource.closeHandoff.prefix,handoff.prefix);assert.deepEqual(read.output.receipt.ownerOutput.value.projection.terminalResult,receipt.ownerOutput.value.terminalResult);assert.deepEqual(read.output.receipt.ownerOutput.value.projection.replay,receipt.resources.replay);
  }
});
