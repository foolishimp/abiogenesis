import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const phase=dirname(fileURLToPath(import.meta.url)),old=join(phase,'execution-authority-root'),post=join(phase,'postprocess-corrected');
const save=(name,value)=>writeFile(join(phase,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const setup=JSON.parse(await readFile(join(old,'setup.json'),'utf8')),handoff=JSON.parse(await readFile(join(old,'handoff.json'),'utf8'));
const load=name=>import(pathToFileURL(join(setup.installedRoot,'build/code/src',name+'.js')));
const [product,abg]=await Promise.all(['product/index','abg/index'].map(load));
const events=abg.readRuntimeEventsAtDurablePrefix(handoff.prefix,{requireCurrent:true});
const results=events.filter(e=>e.kind==='c_call_result_admitted'&&e.payload.resultClass==='success');
const proof=JSON.parse(await readFile(join(post,'proof.json'),'utf8'));
const parent=results.find(e=>e.payload.resultRef===proof.parent.resultRef);assert.ok(parent);
const input=JSON.parse(await readFile(join(phase,'input.json'),'utf8'));assert.deepEqual(parent.payload.value.original,input.original);
const coord=e=>({ordinal:e.admissionOrdinal,eventId:e.eventId,resultRef:e.payload.resultRef,resultDigest:e.payload.resultDigest,cCallRef:e.aggregateId,graphFunctionRef:e.graphFunctionRef});
const c2=[],observations=[];
for(const row of parent.payload.value.observations){
 const source=results.find(e=>e.payload.resultRef===row.resultRef);assert.ok(source);assert.equal(source.payload.resultDigest,row.resultDigest);assert.equal(source.aggregateId,row.cCallRef);
 observations.push({...coord(source),purpose:row.purpose,actorInvocationRef:row.actorInvocationRef,valueKind:source.payload.value.kind});
 if(row.purpose==='testing'){
  const v=source.payload.value;assert.ok(product.isObservedWorksiteCommandExecutionObservation(v)||product.isNativeWorksiteCommandExecutionObservation(v));
  assert.equal(v.provenance.actorInvocationRef,row.actorInvocationRef);
  const plan=product.worksiteCommandExecutionHelperPlan(v.task,v.provenance.helperPlan.attemptRef);assert.deepEqual(plan,v.provenance.helperPlan);
  const path=join(plan.sandboxRoot,'evidence/literal.txt'),bytes=await readFile(path);
  c2.push({...coord(source),actorInvocationRef:row.actorInvocationRef,taskRef:v.task.taskRef,taskDigest:v.task.taskDigest,sourceArm:v.task.sourceObservedInput?'observed_files':'native_work',
    nativeSourceActor:v.task.sourceNativeWork?.provenance.actorInvocationRef??null,helperArtifactPath:v.provenance.helperArtifactPath,
    evidenceFile:{path,digest:product.sha256Bytes(bytes),byteCount:bytes.length},commandResults:v.commandResults.map(r=>({commandId:r.commandId,exitStatus:r.exitStatus,timedOut:r.timedOut,processSignal:r.processSignal,terminationConfirmed:r.terminationConfirmed,stdoutDigest:r.stdout.digest,stdoutBytes:r.stdout.byteLength})),productDelta:v.productDelta,worksiteDelta:v.worksiteDelta});
 }
}
const truth=abg.projectOwnedPrefixArtifactTruth(handoff.prefix),env=abg.projectWorkspaceEnvironmentFromArtifactTruth(truth,{ref:setup.workspaceBinding.bindingId,digest:setup.workspaceBinding.bindingDigest});
assert.equal(env.kind,'exact_prefix_workspace_environment');
const installed=[];
for(const install of env.productInstalls){const matches=await product.installedProductContentMatches(install);assert.equal(matches,true);installed.push({installId:install.installId,installedRoot:install.installedRoot,productContentDigest:install.productContentDigest,contentMatches:true});}
const protectedSources=[];
for(const s of input.original.sources){const path=join(env.workspaceAuthorityBasis.canonicalRoot,s.path),digest=await product.sha256File(path);assert.equal(digest,s.digest);protectedSources.push({path,digest});}
const readbacks=[];
for(const name of ['run_result','run_replay']){const r=JSON.parse(await readFile(join(post,name+'.json'),'utf8'));assert.deepEqual(r.output.receipt.resources.eventResource.closeHandoff.prefix,handoff.prefix);readbacks.push({memberKey:name,wallMs:r.wallMs,exitCode:r.output.receipt.exitCode,ownerOutput:r.output.receipt.ownerOutput});}
await save('closed-evidence.json',{status:'BOUNDED_INSTALLED_SOURCE_CONTEXT_CHECKS_PASS',run:JSON.parse(await readFile(join(old,'execution.json'),'utf8')).output.receipt.resources.run,prefix:handoff.prefix,eventCount:events.length,
 parent:{...coord(parent),terminal:parent.payload.value.terminal,unresolvedSupportRefs:parent.payload.value.unresolvedSupportRefs},observations,c2,
 preparations:results.filter(e=>e.payload.value?.kind==='worksite_command_execution_task'||e.payload.value?.kind==='native_workspace_work_task').map(e=>({...coord(e),kind:e.payload.value.kind,taskDigest:e.payload.value.taskDigest,outcome:e.payload.value.outcome,assessment:e.payload.value.assessment??null})),
 actorStarts:events.filter(e=>e.kind==='actor_process_started').map(e=>({ordinal:e.admissionOrdinal,eventId:e.eventId,...e.payload})),actorExits:events.filter(e=>e.kind==='actor_process_exited').map(e=>({ordinal:e.admissionOrdinal,eventId:e.eventId,...e.payload})),nativeFailures:events.filter(e=>e.kind==='actor_invocation_failed'||e.kind==='runtime_failure_observed').map(e=>({ordinal:e.admissionOrdinal,...e.payload})),
 sourceDomainAndCitationChecks:proof,installed,protectedSources,readbacks,limits:'Declared finite local protocol actor, zero real-model/semantic-adequacy/DataMapper credit; actual C2 effects, owner admissions and reads are genuine.'});
console.log(JSON.stringify({status:'closed-evidence-acquired',eventCount:events.length,observations:observations.length,c2:c2.length,installed:installed.length,protectedSources:protectedSources.length}));
