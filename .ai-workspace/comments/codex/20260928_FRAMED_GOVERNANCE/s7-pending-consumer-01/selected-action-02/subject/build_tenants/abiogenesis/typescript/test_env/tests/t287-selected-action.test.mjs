import assert from 'node:assert/strict';
import test from 'node:test';
import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile,stat} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {constructInstalledRunReadCall,runInstalledCliRequest} from '../support/registered-graph-selection.mjs';
import {ref,hash} from '../fixtures/t287-selected-action-product/index.mjs';
const proof=process.env.ABI5_SELECTED_ACTION_EVIDENCE_ROOT;
assert.ok(proof,'explicit disposable evidence root required');
const save=async(name,value)=>writeFile(join(proof,name),JSON.stringify(value,null,2)+'\n');
const read=async name=>JSON.parse(await readFile(join(proof,name),'utf8'));
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const digest=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
test('installed post-disposition selected action survives actual host interruption and continues once',async()=>{
 await mkdir(join(proof,'disposable'),{recursive:true});
 const started=performance.now();
 try {
  const host=spawn(process.execPath,[new URL('../support/t287-selected-action-host.mjs',import.meta.url).pathname],{env:{...process.env,TMPDIR:join(proof,'disposable')}});
  let stdout='',stderr='';host.stdout.on('data',b=>stdout+=b);host.stderr.on('data',b=>stderr+=b);
  const termination=await new Promise((resolve,reject)=>{host.once('error',reject);host.once('exit',(code,signal)=>resolve({code,signal,pid:host.pid}));});
  await save('host-termination.json',{...termination,stdout,stderr,wallMs:performance.now()-started});assert.equal(termination.signal,'SIGKILL',stderr);
  const e=freeze(await read('environment.json')),origin=await read('initial-origin.json'),opened=await read('opened.json');
  const load=p=>import(pathToFileURL(join(e.installedRoot,`build/code/src/${p}.js`)).href);
  const product=await load('product/index'),abg=await load('abg/index'),owner=await load('abg/construction_continuation'),eventOwner=await load('abg/event_store'),publicApi=await load('public/index'),projectReadContracts=await load('abg/project_read_operation_contracts');
  const bytes=await readFile(origin.initialOrigin.newResourceRequest.eventLogPath),initialEvents=bytes.toString().trim().split('\n').map(JSON.parse);
  assert.deepEqual(bytes,await readFile(join(proof,'interrupted-prefix.jsonl')),'complete fsynced prefix preserved');
  const lockPath=join(proof,'disposable/abiogenesis-event-store-locks-v5',`${origin.initialOrigin.device}-${origin.initialOrigin.inode}.lock`),lock=await stat(lockPath),lockBytes=await readFile(lockPath);
  const recoverySelection={...origin,expectedCurrent:{byteLength:bytes.length,digest:digest(bytes)},abandonedLock:{path:lockPath,device:lock.dev,inode:lock.ino,bytesBase64:lockBytes.toString('base64'),digest:digest(lockBytes)}};
  await save('recovery-selection.json',recoverySelection);
  // The same task-specific TMPDIR selects the unchanged event owner's lock namespace.
  process.env.TMPDIR=join(proof,'disposable');
  const recovery=eventOwner.recoverInterruptedEventStore(recoverySelection);await save('recovery.json',recovery);assert.equal(recovery.kind,'recovered',JSON.stringify(recovery));
  let handoff=recovery.closeHandoff;
  const prefix=abg.selectValidatedRuntimeEventPrefix(freeze(eventOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix)));
  const pending=owner.projectSelectedActionContinuations(prefix,opened.scope.runId);await save('pending.json',pending);
  assert.deepEqual(pending.map(p=>p.status),['resolved','open']);
  const occurrence=pending[1],request={run:{ref:opened.scope.runId,digest:opened.scope.runDigest},continuation:{ref:occurrence.continuationRef,digest:occurrence.continuationDigest},selectedAction:{ref:occurrence.selectedActionRef,digest:occurrence.selectedActionDigest},basisRelation:{kind:'same_basis'}};
  const use=owner.selectPendingActionUse(prefix,request);assert.equal(use.kind,'selected_action_use',JSON.stringify(use));
  const artifactTruth=abg.projectExactPrefixArtifactTruth(handoff.prefix),environmentAdmission=await load('abg/environment_admission');
  const resolution=await (await load('product/execution_resolution')).ProductExecutionResolutionPort.resolve({catalog:e.catalog,catalogView:e.catalogView,admittedInstalls:e.admittedInstalls,verifyInstallAdmission:i=>environmentAdmission.hasAdmittedProductInstall(artifactTruth,i),programRef:use.currentBasis.programRef,selection:{kind:'admitted',graphFunctionRef:use.currentBasis.graphFunctionRef}});
  assert.equal(resolution.kind,'loaded_product_execution_resolution',JSON.stringify(resolution));
  const prepared=owner.prepareSelectedActionContinuation(prefix,use,resolution);assert.ok(prepared,'current installed Program, cursor and input preparation');
  assert.equal(prepared.intent.selectedActionRef,ref('action','consumer'));assert.equal(prepared.intent.targetInput.payload,'selected second action');
  assert.equal(initialEvents.filter(v=>v.kind==='construction_intent_selected').length,2);assert.equal(initialEvents.filter(v=>v.kind==='construction_delta_observed').length,1);assert.equal(initialEvents.filter(v=>v.kind==='traversal_route_admitted'&&v.payload.routeKind==='re_enter').length,1);
  assert.equal(initialEvents.some(v=>v.kind==='c_call_opened'&&v.payload.cursorRef===occurrence.heldCursorRef),false);
  await save('prepared-relation.json',{request,occurrence,currentBasis:use.currentBasis,invocation:use.invocation,cursor:prepared.cursor,input:prepared.input,intent:prepared.intent,program:resolution.program,policy:e.policy});
  const packet=product.RUN_OPERATION_CONTRACTS.continue.selected_action,operationId=packet.definitionKey.operationId;
  const grant=product.constructCapabilityGrant(e.policy,e.actorRef,operationId,packet.metadata.capabilityRefs[0],{admittedInstalls:e.admittedInstalls,workspaceBinding:e.workspaceBinding,fixedPacket:packet});
  function makeCall(identity,patch={},slotPatch={}) {
   const eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)},r=resolution.resolution,steering=product.sha256Canonical(eventResource),inputDeclaration=resolution.declarationPublications.flatMap(p=>p.contracts).find(c=>c.contractRef===prepared.term.inputCarrierRef);
   const slots={workspace_binding:{ref:e.workspaceBinding.bindingId,digest:e.workspaceBinding.bindingDigest},product_set:e.admittedInstalls.map(i=>({ref:i.installId,digest:i.productContentDigest})),dependency_lock:{ref:e.workspaceBinding.lockId,digest:e.workspaceBinding.lockDigest},catalog_scope:{catalog:{ref:`graph-function-catalog://abiogenesis/${e.catalog.basisDigest.slice(7)}`,digest:e.catalog.basisDigest},view:{ref:`graph-function-catalog-view://abiogenesis/${e.catalogView.viewDigest.slice(7)}`,digest:e.catalogView.viewDigest},allowlist:e.catalogView.allowlist},execution_program:{ref:r.programRef,digest:r.programDigest},graph_function:{graphFunction:{ref:r.graphFunctionRef,digest:r.graphFunctionDigest},membership:r.programGraphFunctionMembership},input_contract:{contract:{ref:inputDeclaration.contractRef,digest:product.sha256Canonical(inputDeclaration)},valueRef:prepared.input.inputRef,valueDigest:prepared.input.inputDigest,value:prepared.input.value},session_policy:{ref:e.policy.policyRef,digest:e.policy.policyDigest},capability_grants:{requiredCapabilityRefs:packet.metadata.capabilityRefs,grants:[{ref:grant.grantRef,digest:grant.grantDigest}]},actor:{actor:{ref:e.actorRef,digest:product.sha256Canonical({actorRef:e.actorRef})},attribution:{ref:e.invocationAuthority.authorityRef,digest:e.invocationAuthority.authorityDigest}},transport_steering:{ref:`transport-steering://abiogenesis/${steering.slice(7)}`,digest:steering},verification_references:null,execution_basis:{ref:prepared.root.basisRef,digest:prepared.root.basisDigest},...slotPatch};
   const contractCatalog=e.verified.definitionContractCoordinates.operations.find(o=>o.operationId===operationId).members.find(m=>m.memberKey==='selected_action').slots.request.contractCatalog;
   return publicApi.constructInstalledPublicDefinitionCall({product,installedPublic:publicApi,definitionContractCoordinates:e.verified.definitionContractCoordinates,contractCatalog,operationId,memberKey:'selected_action',request:{...request,...patch},slots,resources:{kind:'run_invocation_resource_assertion',schemaVersion:'5.0.0',eventResource,catalog:e.catalog,catalogView:e.catalogView,applications:[],source:{kind:'none'}},requestRef:`public-request://selected-action/${identity}`,correlationRef:`correlation://selected-action/${identity}`,eventTime:'2026-09-30T00:01:00.000Z',provenanceRefs:[ref('provenance','fixture')]});
  }
  const results=[];
  for(const [name,patch,slotPatch]of [['crossed-selection',{selectedAction:{ref:pending[0].selectedActionRef,digest:pending[0].selectedActionDigest}}],['crossed-run',{run:{...request.run,digest:'sha256:'+'0'.repeat(64)}}],['crossed-basis',{}, {execution_basis:{ref:prepared.root.basisRef,digest:'sha256:'+'0'.repeat(64)}}],['continue',{}],['duplicate',{}]]){
   const call=makeCall(name,patch,slotPatch);await save(`${name}-call.json`,call);
   const outcome=await runInstalledCliRequest({scratch:e.scratch,installedRoot:e.installedRoot,identity:`selected-${name}`,acquisition:{kind:'reopen',closeHandoff:handoff},call,expectedExitCode:null,environment:{TMPDIR:join(proof,'disposable')}});await save(`${name}-receipt.json`,outcome);
   const receipt=outcome.output.receipt;assert.ok(receipt,JSON.stringify(outcome));if(receipt.resources?.eventResource?.closeHandoff)handoff=receipt.resources.eventResource.closeHandoff;await save('latest-handoff.json',handoff);assert.equal(receipt.failure,null,JSON.stringify(receipt));
   results.push({name,wallMs:outcome.wallMs,ownerOutput:receipt.ownerOutput});
   if(name==='continue'){assert.equal(receipt.ownerOutput.value.disposition,'completed',JSON.stringify(receipt.ownerOutput));
    for(const memberKey of ['run_result','run_replay']){const eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)};const{call:readCall}=constructInstalledRunReadCall({environment:{...e,product},publicApi,projectReadContracts,memberKey,selector:memberKey==='run_result'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:1024},source:receipt.resources.run,eventResource,identity:`selected-${memberKey}`});const outcome=await runInstalledCliRequest({scratch:e.scratch,installedRoot:e.installedRoot,identity:`selected-${memberKey}`,acquisition:{kind:'reopen',closeHandoff:handoff},call:readCall,expectedExitCode:null,environment:{TMPDIR:join(proof,'disposable')}});await save(`${memberKey}.json`,outcome);assert.equal(outcome.output.receipt.ownerOutput.outcomeKind,'result',JSON.stringify(outcome));}
   }else assert.equal(receipt.ownerOutput.outcomeKind,'refusal',JSON.stringify(receipt.ownerOutput));
  }
  const events=eventOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix),finalPrefix=abg.selectValidatedRuntimeEventPrefix(freeze(events)),continued=owner.projectSelectedActionContinuations(finalPrefix,opened.scope.runId);
  assert.deepEqual(continued.map(p=>p.status),['resolved','resolved']);assert.equal(events.filter(v=>v.kind==='public_operation_admitted'&&v.payload.continuationKind==='selected_action').length,1);assert.equal(events.filter(v=>v.kind==='run_closed').length,1);assert.equal(events.filter(v=>v.kind==='construction_intent_selected').length,2);assert.equal(events.filter(v=>v.kind==='construction_delta_observed').length,2);
  assert.equal(events.filter(v=>v.kind==='c_call_fibre_selected'&&v.payload.implementationRef===ref('implementation','producer')).length,2,'one child execution per distinct admitted action');
  await save('same-basis-result.json',{status:'passed',results,continued,run:opened.scope.runId,finalPrefix:handoff.prefix,totalMs:performance.now()-started,proofClass:'installed model-free F_D only'});
 }catch(error){await save('failure.json',{message:error.message,stack:error.stack,totalMs:performance.now()-started});throw error;}
});
