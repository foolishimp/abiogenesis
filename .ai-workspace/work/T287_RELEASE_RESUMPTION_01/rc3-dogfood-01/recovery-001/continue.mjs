import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile,stat,access} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {verifyInputs,sha,json} from './verify-inputs.mjs';
const config=await verifyInputs(),proof=join(config.root,'runtime','proof');
const save=async(name,value)=>writeFile(join(proof,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const custody=await json(join(proof,'PREPARED_CUSTODY.json'));
for(const pin of custody.files){const b=await readFile(join(proof,pin.path));assert.equal(b.length,pin.bytes);assert.equal(sha(b),pin.sha256);}
const checkpoint=await json(join(proof,'prepared-checkpoint.json')),file=custody.eventFile,physical=await stat(file.path,{bigint:true});
assert.equal(String(physical.dev),file.device);assert.equal(String(physical.ino),file.inode);assert.equal(Number(physical.size),file.bytes);assert.equal(sha(await readFile(file.path)),file.sha256);
assert(checkpoint.readyPath.startsWith(join(config.root,'runtime')+'/'));
await assert.rejects(access(checkpoint.readyPath),e=>e.code==='ENOENT');
// A permanent local dispatch marker prevents accidental repeat execution. No cleanup.
await save('CONTINUATION_DISPATCH_STARTED.json',{at:new Date().toISOString(),originalRun:checkpoint.run,claim:'controlled undispatched preparation continuation; genuine selected provider intended'});
await writeFile(checkpoint.readyPath,Buffer.from(checkpoint.expectedReadyBytesBase64,'base64'),{flag:'wx'});
const context=await json(join(proof,'read-environment.json'));
const load=name=>import(pathToFileURL(join(context.installedRoot,'build/code/src',name+'.js')).href);
const product=await load('product/index'),abg=await load('abg/index'),publicApi=await load('public/index'),projectReadContracts=await load('abg/project_read_operation_contracts');
const {constructInstalledRunReadCall,runInstalledCliRequest}=await import('./frozen/test_env/support/registered-graph-selection.mjs');
const environment={...context,product};
const inherited=keys=>Object.fromEntries(keys.filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
const provider=config.provider,launch={...inherited(config.inheritEnvironment),...config.toolchainEnvironment,...inherited(provider.inheritEnvironment),
 ABG_TS_CLAUDE_COMMAND:provider.command,ABG_TS_WORKER_SANDBOX:'agent_default',
 ABG_TS_CLAUDE_APPEND_ARGS:JSON.stringify(['--model',provider.model,...(provider.maxTurns===undefined?[]:['--max-turns',String(provider.maxTurns)]),...(provider.maxBudgetUsd===undefined?[]:['--max-budget-usd',String(provider.maxBudgetUsd)]),...(provider.appendArgs??[])]),
 ABG_TS_FP_TIMEOUT_MS:String(provider.inactivityTimeoutMs),ABG_TS_FP_ABSOLUTE_TIMEOUT_MS:String(provider.absoluteTimeoutMs),ABG_TS_FP_TERMINATION_GRACE_MS:'5000'};
let handoff=checkpoint.closeHandoff;
const call=await json(join(proof,'continue-call.json'));
const execution=await runInstalledCliRequest({scratch:proof,installedRoot:context.installedRoot,identity:'recovery-continue',acquisition:{kind:'reopen',closeHandoff:handoff},call,expectedExitCode:null,environment:launch});
await save('continue-receipt.json',execution);
const receipt=execution.output.receipt;
assert(receipt);assert.equal(receipt.failure,null);assert.equal(receipt.ownerOutput.outcomeKind,'result');assert.equal(receipt.ownerOutput.value.disposition,'completed');assert.deepEqual(receipt.resources.run,checkpoint.run);
handoff=receipt.resources.eventResource.closeHandoff;await save('continued-handoff.json',handoff);
const completed=await stat(new URL(handoff.prefix.eventLogRef),{bigint:true}),completedBytes=await readFile(new URL(handoff.prefix.eventLogRef));
for(const memberKey of ['run_result','run_replay']){
 const eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)};
 const {call:readCall}=constructInstalledRunReadCall({environment,publicApi,projectReadContracts,memberKey,selector:memberKey==='run_result'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:4096},source:receipt.resources.run,eventResource,identity:'recovery-'+memberKey});
 const read=await runInstalledCliRequest({scratch:proof,installedRoot:context.installedRoot,identity:'recovery-'+memberKey,acquisition:{kind:'reopen',closeHandoff:handoff},call:readCall,expectedExitCode:null});
 await save(memberKey+'.json',read);assert.equal(read.output.receipt.ownerOutput.outcomeKind,'result');
 assert.equal(read.output.receipt.ownerOutput.value.source.ref,receipt.resources.run.ref);
 assert.equal(read.output.receipt.ownerOutput.value.source.digest,receipt.resources.run.digest);
 if(memberKey==='run_replay') assert.equal(read.output.receipt.ownerOutput.value.projection.status,'closed');
 assert.deepEqual(read.output.receipt.resources.eventResource.closeHandoff.prefix,handoff.prefix);
}
assert.equal(sha(await readFile(new URL(handoff.prefix.eventLogRef))),sha(completedBytes));
const afterReads=await stat(new URL(handoff.prefix.eventLogRef),{bigint:true});assert.equal(afterReads.ino,completed.ino);assert.equal(afterReads.size,completed.size);
const rows=abg.readRuntimeEventsAtDurablePrefix(handoff.prefix),runId=checkpoint.run.ref;
assert.equal(rows.filter(e=>e.kind==='c_call_fibre_selected'&&e.payload.implementationRef==='implementation://exact-intent/producer@5').length,1);
assert.equal(rows.filter(e=>e.kind==='actor_invocation_started').length,1);
assert.equal(rows.filter(e=>e.kind==='construction_intent_selected').length,1);
assert.equal(rows.filter(e=>e.kind==='run_closed').length,1);
assert.equal(rows.find(e=>e.kind==='run_closed').runId,runId);
assert.equal(rows.filter(e=>e.kind==='child_foldback_admitted'&&e.runId===runId).length,1);
assert.equal(rows.filter(e=>e.kind==='construction_delta_observed'&&e.runId===runId).length,1);
const replay=abg.projectRunSemanticReplayProjection(abg.selectValidatedRuntimeEventPrefix(rows),runId);
assert.equal(replay.lifecycle.runClosed,true);assert.equal(replay.eventAtoms.some(e=>e.runId!==null&&e.runId!==runId),false);
const continued=replay.ownerFacts.find(e=>e.owner==='construction_continuation');assert.equal(continued.status,'resolved');assert.equal(continued.intentAdmissionEventRef,checkpoint.pending.intentAdmissionEventRef);
await save('closed-correspondence.json',{run:checkpoint.run,originalIntent:checkpoint.intent,continued,semanticReplayDigest:replay.viewDigest,lifecycle:replay.lifecycle});
// Existing consumed-frontier negative case, using its distinct prebuilt request.
const consumedOriginal=await json(join(proof,'consumed-call.json'));
const consumedResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)};
const steering=product.sha256Canonical(consumedResource);
const consumedCall=publicApi.constructInstalledPublicDefinitionCall({product,installedPublic:publicApi,definitionContractCoordinates:context.verified.definitionContractCoordinates,
 contractCatalog:consumedOriginal.invocation.contractCatalog,...consumedOriginal.invocation.definitionKey,request:consumedOriginal.invocation.request,
 slots:{...consumedOriginal.invocation.invocationAuthority.slots,transport_steering:{ref:'transport-steering://abiogenesis/'+steering.slice(7),digest:steering}},
 resources:{...consumedOriginal.resources,eventResource:consumedResource},requestRef:consumedOriginal.invocation.requestRef,correlationRef:consumedOriginal.invocation.correlationRef,eventTime:new Date().toISOString(),provenanceRefs:consumedOriginal.invocation.provenanceRefs});
const consumed=await runInstalledCliRequest({scratch:proof,installedRoot:context.installedRoot,identity:'recovery-consumed',acquisition:{kind:'reopen',closeHandoff:handoff},call:consumedCall,expectedExitCode:null,environment:launch});
await save('consumed-receipt.json',consumed);assert.equal(consumed.output.receipt.ownerOutput.outcomeKind,'refusal');
const finalHandoff=consumed.output.receipt.resources?.eventResource?.closeHandoff??handoff;
const finalRows=abg.readRuntimeEventsAtDurablePrefix(finalHandoff.prefix);
assert.equal(finalRows.filter(e=>e.kind==='actor_invocation_started').length,1,'consumed continuation dispatched no second actor');
await save('result.json',{status:'passed',classification:'same-Run cold continuation after controlled undispatched consumer preparation failure',run:checkpoint.run,originalLog:file.path,closeHandoff:finalHandoff,provider:{command:provider.command,model:provider.model},actualNativeActorCount:1,arbitraryCrashRecovery:false,semanticApplicationQualification:false,paidCost:'derive from retained actual provider usage; not assumed',priorSunnyDayRunReopened:false});
console.log(JSON.stringify({status:'passed',runId,proof}));
