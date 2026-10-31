import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {verifyInputs,root,sha,json} from './verify-inputs.mjs';
const custody=await json(join(root,'SUCCESSOR_RECOVERY_CUSTODY.json'));
for(const pin of custody.inputs){const b=await readFile(join(root,pin.path));assert.equal(b.length,pin.bytes,pin.path);assert.equal(sha(b),pin.sha256,pin.path);}
const config=await verifyInputs(),proof=join(config.root,'runtime','proof');
const original=await json(join(proof,'prepared-checkpoint.json')),relation=await json(join(proof,'prepared-relation.json'));
const physicalBefore=await json(join(proof,'PREPARED_CUSTODY.json')),context=await json(join(proof,'read-environment.json'));
const receipt=(await json(join(proof,'continue-receipt.json'))).output.receipt;
assert.equal(receipt.failure,null);assert.equal(receipt.ownerOutput.outcomeKind,'result');assert.equal(receipt.ownerOutput.value.disposition,'completed');
assert.equal(receipt.ownerOutput.value.continuationKind,'current_intent');assert.equal(receipt.ownerOutput.value.admittedIntent,null);
const handoff=receipt.resources.eventResource.closeHandoff,oldRun=original.run,newRun=receipt.resources.run;
assert.deepEqual(receipt.ownerOutput.value.run,newRun);assert.notEqual(oldRun.ref,newRun.ref);
const eventPath=fileURLToPath(handoff.prefix.eventLogRef),beforeStat=await stat(eventPath,{bigint:true}),beforeBytes=await readFile(eventPath);
assert.equal(eventPath,physicalBefore.eventFile.path);assert.equal(String(beforeStat.dev),physicalBefore.eventFile.device);assert.equal(String(beforeStat.ino),physicalBefore.eventFile.inode);
assert.equal(Number(beforeStat.size),handoff.prefix.prefixLength);assert.equal('sha256:'+sha(beforeBytes),handoff.prefix.prefixDigest);
assert.equal(sha(beforeBytes.subarray(0,physicalBefore.eventFile.bytes)),physicalBefore.eventFile.sha256,'original physical prefix changed');
const load=name=>import(pathToFileURL(join(context.installedRoot,'build/code/src',name+'.js')).href);
const product=await load('product/index'),abg=await load('abg/index'),publicApi=await load('public/index');
const owner=await load('abg/construction_continuation'),readContracts=await load('abg/project_read_operation_contracts');
const {constructInstalledRunReadCall,runInstalledCliRequest}=await import('./frozen/test_env/support/registered-graph-selection.mjs');
const rows=abg.readRuntimeEventsAtDurablePrefix(handoff.prefix),prefix=abg.selectValidatedRuntimeEventPrefix(rows);
const exact=(xs,label)=>{assert.equal(xs.length,1,label);return xs[0];};
const selected=rows.filter(e=>e.kind==='c_call_fibre_selected'&&e.payload.implementationRef==='implementation://exact-intent/producer@5');assert.equal(selected.length,1);
const producer=exact(rows.filter(e=>e.eventId===relation.producer.eventId),'retained original producer');assert.deepEqual(producer,relation.producer);assert.equal(producer.runId,oldRun.ref);
const actor=exact(rows.filter(e=>e.kind==='actor_invocation_started'),'one actual actor');assert.equal(actor.runId,newRun.ref);
assert.equal(rows.filter(e=>e.kind==='construction_intent_selected').length,1);
const closed=exact(rows.filter(e=>e.kind==='run_closed'),'one terminal Run');assert.equal(closed.runId,newRun.ref);
const link=exact(rows.filter(e=>e.kind==='continuation_reentry_link_admitted'&&e.payload.predecessorContinuationId===original.pending.continuationRef),'old to new link');
assert.equal(link.payload.predecessorRunId,oldRun.ref);assert.equal(link.payload.successorRunId,newRun.ref);assert.equal(link.payload.predecessorDisposition,'superseded');
assert.equal(link.payload.plannedContinuationId,receipt.ownerOutput.value.successor.ref);
const prior=exact(owner.projectConstructionIntentContinuations(prefix,oldRun.ref).filter(c=>c.continuationRef===original.pending.continuationRef),'old continuation');assert.equal(prior.status,'superseded');
const successor=exact(owner.projectConstructionIntentContinuations(prefix,newRun.ref).filter(c=>c.continuationRef===receipt.ownerOutput.value.successor.ref),'successor continuation');assert.equal(successor.status,'resolved');
assert.equal(successor.predecessorContinuationRef,prior.continuationRef);assert.equal(successor.constructionIntentRef,original.intent.constructionIntentRef);assert.equal(successor.constructionIntentDigest,original.intent.constructionIntentDigest);
assert.equal(successor.intentAdmissionEventRef,original.pending.intentAdmissionEventRef);assert.equal(successor.cCallRef,original.pending.cCallRef);
const oldReplay=abg.projectRunSemanticReplayProjection(prefix,oldRun.ref),newReplay=abg.projectRunSemanticReplayProjection(prefix,newRun.ref);
assert.equal(oldReplay.lifecycle.runStopped,true);assert.equal(oldReplay.lifecycle.runClosed,false);assert.equal(newReplay.lifecycle.runClosed,true);
assert.equal(rows.filter(e=>e.kind==='child_foldback_admitted'&&e.runId===newRun.ref).length,1);assert.equal(rows.filter(e=>e.kind==='construction_delta_observed'&&e.runId===newRun.ref).length,1);
const consumed=exact(rows.filter(e=>e.kind==='c_call_result_admitted'&&e.runId===newRun.ref&&e.payload.valueKind==='fixture_consumed'),'actual consumed result');assert.equal(consumed.payload.value.payload,producer.payload.value.payload);
const output=join(config.root,'successor-observation-001');await mkdir(output,{recursive:false});
const save=(name,value)=>writeFile(join(output,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
await save('STARTED.json',{at:new Date().toISOString(),originalRun:oldRun,successorRun:newRun,returnedPrefix:handoff.prefix,classification:'post-execution observation only; no native continuation rerun'});
const unchanged=async()=>{const s=await stat(eventPath,{bigint:true});assert.equal(s.dev,beforeStat.dev);assert.equal(s.ino,beforeStat.ino);assert.equal(s.size,beforeStat.size);assert.equal(sha(await readFile(eventPath)),sha(beforeBytes));};
const environment={...context,product},readbacks=[];
for(const [label,source,memberKey] of [['successor-result',newRun,'run_result'],['successor-replay',newRun,'run_replay']]){
 const eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)};
 const {call}=constructInstalledRunReadCall({environment,publicApi,projectReadContracts:readContracts,memberKey,selector:memberKey==='run_result'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:4096},source,eventResource,identity:'successor-observation-'+label});
 const result=await runInstalledCliRequest({scratch:output,installedRoot:context.installedRoot,identity:label,acquisition:{kind:'reopen',closeHandoff:handoff},call,expectedExitCode:null});
 await save(label+'.json',result);const r=result.output.receipt;assert.equal(r.ownerOutput.outcomeKind,'result');assert.deepEqual(r.ownerOutput.value.source,source);
 assert.deepEqual(r.resources.eventResource.closeHandoff.prefix,handoff.prefix);await unchanged();
 if(source.ref===newRun.ref){const terminal=r.ownerOutput.value.projection.terminalResult;assert(abg.isAbgTypedTerminalResult(terminal));assert.equal(terminal.producer.runRef,newRun.ref);assert.equal(terminal.producer.graphCallRef,receipt.ownerOutput.value.graphCall.ref);readbacks.push({label,terminal});}
}
assert.equal(product.sha256Canonical(readbacks[0].terminal),product.sha256Canonical(readbacks[1].terminal));
// Request the original, now-superseded frontier under the actual current handoff.
// Its owner checks supersession before preparing any leaf. A false command also
// prevents a paid provider launch if that checked relation unexpectedly regresses.
const template=await json(join(proof,'consumed-call.json')),eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)};
assert.deepEqual(template.invocation.request.run,oldRun);assert.equal(template.invocation.request.continuation.ref,prior.continuationRef);
const steering=product.sha256Canonical(eventResource),repeat=publicApi.constructInstalledPublicDefinitionCall({product,installedPublic:publicApi,definitionContractCoordinates:context.verified.definitionContractCoordinates,
 contractCatalog:template.invocation.contractCatalog,...template.invocation.definitionKey,request:template.invocation.request,
 slots:{...template.invocation.invocationAuthority.slots,transport_steering:{ref:'transport-steering://abiogenesis/'+steering.slice(7),digest:steering}},resources:{...template.resources,eventResource},
 requestRef:'request://abi5-tests/recovery-001/superseded-observation',correlationRef:'correlation://abi5-tests/recovery-001/superseded-observation',eventTime:new Date().toISOString(),provenanceRefs:template.invocation.provenanceRefs});
const refusal=await runInstalledCliRequest({scratch:output,installedRoot:context.installedRoot,identity:'superseded-refusal',acquisition:{kind:'reopen',closeHandoff:handoff},call:repeat,expectedExitCode:null,environment:{ABG_TS_CLAUDE_COMMAND:'/usr/bin/false'}});
await save('superseded-refusal.json',refusal);assert.equal(refusal.output.receipt.ownerOutput.outcomeKind,'refusal');assert.equal(refusal.output.receipt.ownerOutput.value.code,'resolved_continuation');await unchanged();
// Identical complete bytes prove that no additional actor or event was admitted.
await save('result.json',{status:'passed',claim:'cold event-log recovery of conserved intent and producer through explicit replacement-Run lineage',originalRun:oldRun,successorRun:newRun,originalContinuation:prior,successorContinuation:successor,
 linkEvent:{ref:link.eventId,ordinal:link.admissionOrdinal},producer:{eventRef:producer.eventId,resultRef:producer.payload.resultRef,resultDigest:producer.payload.resultDigest},actualProducerCount:1,actualActorCount:1,
 oldLifecycle:oldReplay.lifecycle,newLifecycle:newReplay.lifecycle,terminal:readbacks[0].terminal,closeHandoff:handoff,eventFile:{path:eventPath,device:String(beforeStat.dev),inode:String(beforeStat.ino),bytes:beforeBytes.length,sha256:sha(beforeBytes)},
 noNewProviderInvocation:true,physicalCrashRecovery:false,originalSameRunPredicate:'withdrawn by Root; failed frozen witness retained unchanged'});
console.log(JSON.stringify({status:'passed',output,originalRun:oldRun.ref,successorRun:newRun.ref}));
