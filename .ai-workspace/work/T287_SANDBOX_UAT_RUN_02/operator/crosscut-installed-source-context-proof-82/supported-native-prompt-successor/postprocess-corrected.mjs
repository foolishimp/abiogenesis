import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {eventResourceIdentity} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
const phase=dirname(fileURLToPath(import.meta.url)),tenant='/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript';
const post=join(phase,'postprocess-corrected');await mkdir(post,{recursive:false});
const evidence=post;
const load=(root,name)=>import(pathToFileURL(join(root,'build/code/src',name+'.js')));
const support=name=>import(pathToFileURL(join(tenant,'test_env/support',name+'.mjs')));
const save=(root,name,value)=>writeFile(join(root,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const literal='\uFEFF[error] *** exact Ω😀 diagnostic '+'Ω😀'.repeat(2400)+'\n';
const started=performance.now();
let stage='authentic-owned-prefix';
try {
  const old=join(phase,'execution-authority-root'),setup=JSON.parse(await readFile(join(old,'setup.json'),'utf8')),
    execution=JSON.parse(await readFile(join(old,'execution.json'),'utf8')),handoff=JSON.parse(await readFile(join(old,'handoff.json'),'utf8'));
  const request=JSON.parse((await readFile(execution.requestPath,'utf8')).trim());
  const receipt=execution.output.receipt;
  const [product,abg,publicApi]=await Promise.all(['product/index','abg/index','public/index'].map(n=>load(setup.installedRoot,n)));
  const source=abg.captureDurablePrefixCoordinate(handoff.prefix);
  const log=fileURLToPath(source.eventLogRef),identityBefore=await eventResourceIdentity(log);
  const events=abg.readRuntimeEventsAtDurablePrefix(source,{requireCurrent:true});
  const artifactTruth=abg.projectOwnedPrefixArtifactTruth(source);
  const workspace=abg.projectWorkspaceEnvironmentFromArtifactTruth(artifactTruth,{ref:setup.workspaceBinding.bindingId,digest:setup.workspaceBinding.bindingDigest});
  assert.equal(workspace.kind,'exact_prefix_workspace_environment');assert.deepEqual(workspace.workspaceBinding,setup.workspaceBinding);
  assert.deepEqual(workspace.workspaceAuthorityBasis,setup.workspaceAuthority);
  const hostAcquisition=JSON.parse(await readFile(join(dirname(dirname(phase)),'crosscut-installed-host-83/host20-acquisition.json'),'utf8'));
  const verified=hostAcquisition.verification.verifiedArtifact;assert.ok(product.isVerifiedProductArtifact(verified));
  const env={product,abg,publicApi,installedRoot:setup.installedRoot,workspaceAuthority:workspace.workspaceAuthorityBasis,
    workspaceBinding:workspace.workspaceBinding,admittedInstalls:workspace.productInstalls,verified};
  assert.equal(workspace.productInstalls.find(i=>i.installedRoot===setup.installedRoot).productContentDigest,verified.productContentDigest);
  const catalog=product.admitGraphFunctionCatalog(request.invocation.resources.catalog.readinessBasis);assert.equal(catalog.kind,'graph_function_catalog');
  env.catalog=catalog;const refs=request.invocation.resources.catalogView.allowlist;
  const library=await support('default-library');
  const input=JSON.parse(await readFile(join(phase,'input.json'),'utf8'));
  const frozenArtifact=JSON.parse(await readFile(join(dirname(dirname(phase)),'crosscut-installed-host-83/exacthost-identity.json'),'utf8'));
  stage='same-run-pure-source-context-checks';
  const results=events.filter(e=>e.kind==='c_call_result_admitted'&&e.payload.resultClass==='success');
  const parent=results.filter(e=>product.isGovernanceWorkState(e.payload.value)).at(-1);assert.ok(parent,'authentic folded parent');
  const state=parent.payload.value;assert.deepEqual(state.original,input.original);assert.equal(state.terminal,false);assert.deepEqual(state.unresolvedSupportRefs,input.unresolvedSupportRefs);
  assert.deepEqual(state.observations.map(o=>o.purpose),['testing','construction','testing','uat']);
  const commands=state.observations.filter(o=>o.purpose==='testing');
  for(const row of commands){const stream=row.value.commandResults[0].stdout;assert.equal(stream.text,literal);assert.equal(stream.digest,product.sha256Bytes(Buffer.from(literal)));assert.equal(stream.byteLength,Buffer.byteLength(literal));assert.equal(row.value.commandResults[0].exitStatus,7);const source=results.find(e=>e.payload.resultRef===row.resultRef&&e.payload.resultDigest===row.resultDigest);assert.ok(source,'exact parent observation Result coordinate');assert.equal(source.aggregateId,row.cCallRef);assert.equal(source.payload.value.provenance.actorInvocationRef,row.actorInvocationRef);assert.ok(product.isObservedWorksiteCommandExecutionObservation(source.payload.value)||product.isNativeWorksiteCommandExecutionObservation(source.payload.value));const ownedPlan=product.worksiteCommandExecutionHelperPlan(source.payload.value.task,source.payload.value.provenance.helperPlan.attemptRef);assert.deepEqual(ownedPlan,source.payload.value.provenance.helperPlan);assert.equal((await readFile(join(ownedPlan.sandboxRoot,'evidence/literal.txt'))).equals(Buffer.from(literal)),true,'real evidence bytes at canonical task/attempt helper plan');}
  const taskRows=results.filter(e=>product.isFramedSynthesisTask(e.payload.value));
  const taskEvent=taskRows.find(e=>e.payload.value.state.observations.length===1);assert.ok(taskEvent,'actual C2-bearing framed task Result');
  const task=taskEvent.payload.value;
  const synthesis=results.find(e=>product.isFramedSynthesisResult(e.payload.value)&&e.payload.value.state.observations.length===1);assert.ok(synthesis);
  const targets=env.catalog.boundPublications.flatMap(p=>p.graphFunctions).filter(g=>refs.includes(g.name)&&g.declarations['abg.default_library_purpose']).map(g=>({graphFunctionRef:g.name,definitionDigest:product.sha256Canonical(g),purpose:g.declarations['abg.default_library_purpose']}));
  const testing=targets.find(t=>t.purpose==='testing'),raw=structuredClone(synthesis.payload.value.judgment),c2Ref=task.state.observations[0].resultRef;
  raw.nextGraphFunctionRef=testing.graphFunctionRef;raw.subjectEvidenceRef=c2Ref;raw.contributions=[{...raw.contributions[0],graphFunctionRef:testing.graphFunctionRef}];
  const Ajv=(await import(pathToFileURL(join(env.installedRoot,'node_modules/ajv/dist/2020.js')))).default;
  assert.equal(new Ajv({strict:false}).compile(product.framedSynthesisResponseSchema(task,targets))(raw),false);
  assert.equal(product.bindFramedSynthesisResult(task,targets,synthesis.payload.value.basis,raw),null);
  const assemblies=events.filter(e=>e.kind==='actor_transport_binding_admitted').map(e=>({event:e,assembly:e.payload.instructionAssembly}));
  const parseSections=prompt=>Object.fromEntries(prompt.split(/^## /m).slice(1).map(part=>{
    const cut=part.indexOf('\n');return [part.slice(0,cut),JSON.parse(part.slice(cut+1).trim())];}));
  const planning=assemblies.map(({event,assembly})=>({event,sections:parseSections(assembly.request.prompt)})).filter(r=>Array.isArray(r.sections.task?.observations));
  assert.ok(planning.length>=4,'actual owned selector assemblies');
  const projected=planning.find(r=>r.sections.task.observations.length===1).sections.task;
  const planningStream=projected.observations[0].observed.commandResults[0].stdout;
  assert.equal(planningStream.rawBody.resultRef,c2Ref);assert.equal(planningStream.rawBody.resultDigest,task.state.observations[0].resultDigest);
  assert.deepEqual(planningStream.rawBody.fieldPath,['commandResults',0,'stdout']);
  const sourceResult=results.find(e=>e.payload.resultRef===c2Ref);assert.ok(sourceResult);
  const sourceStream=planningStream.rawBody.fieldPath.reduce((value,key)=>value[key],sourceResult.payload.value);
  const bytes=sourceStream.encoding==='base64'?Buffer.from(sourceStream.payload,'base64'):Buffer.from(sourceStream.text);
  assert.equal(bytes.equals(Buffer.from(literal)),true);assert.equal(planningStream.digest,product.sha256Bytes(bytes));
  assert.ok(planningStream.omittedCandidates>0,'real clipped display');assert.ok(planningStream.displayedByteCount<=8192);
  assert.ok(planningStream.excerpts.some(e=>e.text.startsWith('\uFEFF')&&e.text.includes('Ω😀')),'BOM/Unicode remain in actual display');
  for(const excerpt of planningStream.excerpts){
    const expected=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes.subarray(excerpt.startByte,excerpt.endByte));
    assert.equal(excerpt.text,expected,'literal UTF-8 byte citation');
  }
  const declaredEntry=projected.worksite.files.find(e=>e.path==='source/original-basic-cli.txt');assert.ok(declaredEntry);
  const text=declaredEntry.contentIn==='originalTask'?projected.originalTask.slice(declaredEntry.startCharacter,declaredEntry.endCharacter):declaredEntry.content;
  assert.equal(Buffer.from(text).equals(await readFile(join(phase,'fixture/source/original-basic-cli.txt'))),true,'actual declared source retains BOM/Unicode');
  const nativePrepared=results.find(e=>e.payload.value?.kind==='native_workspace_work_task'&&e.payload.value.assessment===undefined);assert.ok(nativePrepared);
  assert.equal(nativePrepared.payload.value.outcome,synthesis.payload.value.judgment.contributions.find(c=>c.graphFunctionRef===synthesis.payload.value.judgment.nextGraphFunctionRef).contribution);
  const nativeContext=JSON.parse(nativePrepared.payload.value.instructions.find(i=>i.startsWith('Actual admitted observations: ')).slice('Actual admitted observations: '.length));
  assert.equal(nativeContext[0].value.commandResults[0].stdout.text,literal);assert.equal(nativeContext[0].resultRef,c2Ref);
  const c2Tasks=results.filter(e=>e.payload.value?.kind==='worksite_command_execution_task');assert.equal(c2Tasks.length,2);
  assert.ok(c2Tasks[0].payload.value.sourceObservedInput);assert.ok(c2Tasks[1].payload.value.sourceNativeWork);
  assert.deepEqual(c2Tasks[1].payload.value.commands,c2Tasks[0].payload.value.commands);
  const assessment=results.find(e=>e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.assessmentGraphFunctionRef);assert.ok(assessment);
  assert.equal(assessment.payload.value.task.assessment.producer.resultRef,commands[1].resultRef);
  assert.notEqual(assessment.payload.value.provenance.actorInvocationRef,sourceResult.payload.value.provenance.actorInvocationRef);
  assert.equal(state.observations.at(-1).value.disposition,'unmet');
  const {constructInstalledRunReadCall,runInstalledCliRequest}=await support('registered-graph-selection'),projectReadContracts=await load(env.installedRoot,'abg/project_read_operation_contracts');
  const fresh=[];
  for(const memberKey of ['run_result','run_replay']){
    stage='eventless-'+memberKey;
    const resource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)};
    const read=constructInstalledRunReadCall({environment:env,publicApi,projectReadContracts,memberKey,selector:memberKey==='run_result'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:2048},source:receipt.resources.run,eventResource:resource,identity:'source-context82-'+memberKey});
    const actual=await runInstalledCliRequest({scratch:post,installedRoot:env.installedRoot,identity:'source-context82-post-'+memberKey,acquisition:{kind:'reopen',closeHandoff:handoff},call:read.call,expectedExitCode:null,environment:process.env});
    await save(evidence,memberKey+'.json',actual);assert.deepEqual(actual.output.receipt.resources.eventResource.closeHandoff.prefix,handoff.prefix);fresh.push(memberKey);
  }
  await save(evidence,'proof.json',{installedRoot:env.installedRoot,archive:frozenArtifact.artifactPath,prefix:handoff.prefix,
    parent:{eventId:parent.eventId,ordinal:parent.admissionOrdinal,resultRef:parent.payload.resultRef,resultDigest:parent.payload.resultDigest},
    observations:state.observations.map(o=>({purpose:o.purpose,resultRef:o.resultRef,resultDigest:o.resultDigest,cCallRef:o.cCallRef,actorInvocationRef:o.actorInvocationRef})),
    testingC2Refused:true,invalidTestingDispatched:false,planningByteCitations:planningStream.excerpts.map(e=>({startByte:e.startByte,endByte:e.endByte})),fresh,
    unmet:true,terminal:false,modelCredit:false});

  const identityAfter=await eventResourceIdentity(log);assert.deepEqual(identityAfter,identityBefore);
  await save(post,'conservation.json',{before:identityBefore,after:identityAfter,exactSameRun:receipt.resources.run,eventCount:events.length,noNativeRepeat:true});
  console.log(JSON.stringify({status:'completed-same-run-pure-checks-and-fresh-reads',elapsedMs:performance.now()-started,eventCount:events.length,observations:state.observations.map(o=>o.purpose),terminal:state.terminal,unmet:state.observations.at(-1).value.disposition,fresh}));
} catch(error) {
  await save(post,'first-error.json',{stage,name:error.name,message:error.message,stack:error.stack,elapsedMs:performance.now()-started});
  console.error(error.stack);process.exitCode=1;
}
