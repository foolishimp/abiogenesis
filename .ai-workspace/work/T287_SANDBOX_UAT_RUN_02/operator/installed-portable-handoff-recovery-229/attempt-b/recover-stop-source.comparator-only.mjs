import assert from 'node:assert/strict';
import {readFile,writeFile,lstat,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {installedModules} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/public-setup.mjs';
import {verifyExpectedArtifacts} from './verify-artifacts.mjs';
import {borrowCurrentOperationResource} from './operation-resource.mjs';

const root=fileURLToPath(new URL('.',import.meta.url));
const read=async path=>JSON.parse(await readFile(path,'utf8'));
const record=(name,value)=>writeFile(join(root,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const pin=async path=>{const s=await lstat(path);assert(s.isFile()&&!s.isSymbolicLink());const b=await readFile(path);return {path,sha256:createHash('sha256').update(b).digest('hex'),byteCount:b.length};};
const t0=performance.now();let serial=0,stage='preflight',runtime,resource=null,selection=null,completed=false;
const pulse=async(name,data={})=>{stage=name;const value={stage:name,at:new Date().toISOString(),wallMs:performance.now()-t0,pid:process.pid,memory:process.memoryUsage(),maxRSSKiB:process.resourceUsage().maxRSS,...data};await record(String(serial++).padStart(3,'0')+'-'+name+'.json',value);process.stdout.write(JSON.stringify(value)+'\n');};
const logStat=async path=>{const s=await stat(path,{bigint:true});return {path,device:Number(s.dev),inode:Number(s.ino),byteCount:Number(s.size),mtimeNs:String(s.mtimeNs)};};
async function physical(previous){
 const facts=[];
 for(const row of previous.physicalRows){const path=join(previous.workspaceRoot,row.relativePath);assert(path.startsWith(previous.workspaceRoot+'/'));
  if(row.state==='absent'){await assert.rejects(lstat(path),e=>e.code==='ENOENT');facts.push({...row});}
  else{const s=await lstat(path);assert(s.isFile()&&!s.isSymbolicLink());const observed=await pin(path);assert.equal(observed.sha256,row.sha256);assert.equal(observed.byteCount,row.byteCount);assert.equal(s.dev,row.device);assert.equal(s.ino,row.inode);facts.push({...row});}}
 return facts;
}
function quiescence(previous){
 const processFacts=[];
 for(const {pid} of previous.pids){let absent=false;try{process.kill(pid,0);}catch(e){assert.equal(e.code,'ESRCH');absent=true;}assert(absent,'Previously owned PID still exists: '+pid);processFacts.push({pid,state:'ESRCH'});}
 const all=execFileSync('/bin/ps',['-axo','pid=,pgid='],{encoding:'utf8'}).trim().split('\n').filter(Boolean).map(line=>line.trim().split(/\s+/).map(Number));
 const groups=all.filter(([,pgid])=>previous.pids.some(({pid})=>pid===pgid));assert.equal(groups.length,0,'Previously owned process group remains');return {processFacts,ownedGroups:groups};
}

try{
 const inputs=await read(join(root,'inputs.json'));
 for(const row of [inputs.sourceFreeze,inputs.conservation,inputs.firstCause,inputs.lineageFirstCause,inputs.interruption,inputs.handoff,inputs.setup,inputs.host,inputs.maintenanceHost,inputs.maintenanceArchive])assert.deepEqual(await pin(row.path),row);
 const previous=await read(inputs.conservation.path),setup=await read(inputs.setup.path),handoff=await read(inputs.handoff.path),firstCause=await read(inputs.lineageFirstCause.path);
 assert.equal((await pin(inputs.sourceFreeze.path)).sha256,'baf196fde8704193f059389ae402a5a06cd2fbf8b8f2486546be00d84e74a0ad');
 assert.equal(firstCause.signal,'SIGABRT');assert.equal(firstCause.lastAdmittedParent.resultRef,inputs.sourceResultRef);assert.equal(firstCause.lastAdmittedParent.observations,41);
 const physicalBefore=await physical(previous),quiet=quiescence(previous),logPath=fileURLToPath(handoff.prefix.eventLogRef),before=await logStat(logPath);
 assert.deepEqual({...before,path:undefined},{...inputs.expectedPhysical,path:undefined});assert.equal(logPath,previous.logStat.path);
 const lock=await lstat(previous.lock.path),lockBytes=await readFile(previous.lock.path);assert(lock.isFile()&&!lock.isSymbolicLink());
 assert.equal(lock.dev,previous.lock.device);assert.equal(lock.ino,previous.lock.inode);assert.equal(lockBytes.length,previous.lock.byteCount);assert.equal(lockBytes.toString('base64'),previous.lock.base64);assert.equal(createHash('sha256').update(lockBytes).digest('hex'),previous.lock.sha256);assert.equal(previous.lock.owner.ownerPid,inputs.deadOwnerPid);
 await record('quiescence.json',{at:new Date().toISOString(),...quiet,logStat:before,selectedLock:previous.lock,physicalReference:inputs.conservation,physicalRows:physicalBefore,workspaceRoot:previous.workspaceRoot,exclusiveMaintenance:true});
 await pulse('preflight-complete',{logStat:before,physicalRows:physicalBefore.length,ownedProcessesAbsent:true,deadOwner:inputs.deadOwnerPid});

 runtime=await installedModules(setup.installedRoot);const {product:p,abg:a,api}=runtime,hash=p.sha256Canonical;
 const replay=await import(pathToFileURL(join(setup.installedRoot,'build/code/src/abg/replay.js')).href);
 const store29=await import(pathToFileURL(join(setup.installedRoot,'build/code/src/abg/event_store.js')).href);assert.equal(typeof store29.validateEventStoreCloseHandoff,'function');assert.equal(typeof a.isAcquiredAbgEventResourceSelection,'function');
 for(const name of ['abgEventRecoveryScope','recoverInterruptedAbgEventResource','acquireAbgEventResource','selectAcquiredAbgEventResource','selectHeldEventStoreDurablePrefix','closeAbgEventResource','readRuntimeEventsAtDurablePrefix','selectValidatedRuntimeEventPrefix','projectOwnedPrefixArtifactTruth','projectWorkspaceEnvironmentFromArtifactTruth','rehydrateExecutionBasisAtPrefix','rehydrateInvocationAdmissionAtPrefix','deriveInvocationSourceResultBasisAtPrefix'])assert.equal(typeof a[name],'function',name);
 for(const name of ['constructAdmissionCapabilityGrants','admissionAuthoritySlots','admissionEnvironmentSelection','admissionAuthorityScope','selectOwnedProductVerification'])assert.equal(typeof p[name],'function',name);
 for(const name of ['constructInstalledPublicDefinitionCall','runInstalledDefinitionCallWithResource'])assert.equal(typeof api[name],'function',name);
 assert.equal(typeof replay.projectRunIdentityAtPrefix,'function');
 const packet=a.WITNESS_OPERATION_CONTRACTS.admit['run-stopped'],contentContract=a.WITNESS_CONTENT_CONTRACTS['run-stopped'];assert.ok(packet);assert.ok(contentContract);assert.ok(a.WITNESS_DEFINITION_BINDINGS.admit['run-stopped']);
 const maintenanceHost=await read(inputs.maintenanceHost.path),maintenanceRuntime=await installedModules(maintenanceHost.installedRoot);
 for(const name of ['abgEventRecoveryScope','recoverInterruptedAbgEventResource'])assert.equal(typeof maintenanceRuntime.abg[name],'function',name);
 const [maintenanceNative]=await verifyExpectedArtifacts({product:maintenanceRuntime.product,acquisitionRows:[{label:'maintenance31',pin:inputs.maintenanceAcquisition}],pulse});
 assert.equal(maintenanceNative.verified.productContentDigest,inputs.maintenanceContentDigest);assert.equal(maintenanceNative.verified.manifestDigest,inputs.maintenanceManifestDigest);assert.equal(maintenanceNative.verified.artifactDigest,'sha256:'+inputs.maintenanceArchive.sha256);
 assert.equal(maintenanceRuntime.abg.ROOT_EVENT_CONTRACT_DIGEST,a.ROOT_EVENT_CONTRACT_DIGEST);assert.equal(a.ROOT_EVENT_CONTRACT_DIGEST,handoff.prefix.storeIdentity.eventContractDigest);
 const witnessDefinition=owner=>owner.api.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d=>d.definitionKey.operationId===packet.definitionKey.operationId&&d.definitionKey.memberKey===packet.definitionKey.memberKey);
 const witnessDefinition29=witnessDefinition(runtime),witnessDefinition31=witnessDefinition(maintenanceRuntime);assert.ok(witnessDefinition29);assert.ok(witnessDefinition31);
 assert.deepEqual({ref:witnessDefinition31.definitionRef,digest:witnessDefinition31.definitionDigest},{ref:witnessDefinition29.definitionRef,digest:witnessDefinition29.definitionDigest});
 const maintenanceContent=maintenanceRuntime.abg.WITNESS_CONTENT_CONTRACTS['run-stopped'];assert.deepEqual({ref:maintenanceContent.ref,digest:maintenanceContent.digest},{ref:contentContract.ref,digest:contentContract.digest});
 const [native,consumer]=await verifyExpectedArtifacts({product:p,acquisitionRows:[{label:'native29',pin:inputs.acquisition},{label:'consumer29',pin:inputs.consumerAcquisition}],pulse});
 const host=await read(inputs.host.path);assert.equal(native.verified.productContentDigest,host.productContentDigest);assert.equal(native.verified.artifactDigest,'sha256:'+host.artifactSha256);
 let sourceCall=(await read(inputs.sourceCallPath)).invocation;const publicAuthorityDigest=sourceCall.invocation.invocationDigest,originalDigest=hash(sourceCall.invocation.request.input.value.original);sourceCall=null;
 await record('owner-bindings.json',{installedRoot:setup.installedRoot,native:{artifactDigest:native.verified.artifactDigest,productContentDigest:native.verified.productContentDigest,verificationRef:native.verified.verificationRef,verificationDigest:native.verified.verificationDigest},consumer:{artifactDigest:consumer.verified.artifactDigest,productContentDigest:consumer.verified.productContentDigest},sourcePublicAuthorityDigest:publicAuthorityDigest,originalDigest,operation:packet.definitionKey,contentContract:{ref:contentContract.ref,digest:contentContract.digest},nominalVerifierResultsRetained:true,maintenance:{installedRoot:maintenanceHost.installedRoot,artifactDigest:maintenanceNative.verified.artifactDigest,productContentDigest:maintenanceNative.verified.productContentDigest,manifestDigest:maintenanceNative.verified.manifestDigest},nominalOwnerSeparation:true});

 const expectedCurrent=inputs.expectedCurrent;assert.deepEqual(await logStat(logPath),before);
 await record('current-log-identity.json',{...before,expectedCurrent,acquisition:'Exact223 digest reused under unchanged fresh file facts; canonical maintenance owner validates full physical bytes. No external hash/read.'});
 await pulse('current-log-identity-bound',{expectedCurrent,noExternalHash:true});
 const request={kind:'abg_interrupted_event_resource_recovery',schemaVersion:'5.0.0',lastCloseHandoff:handoff,expectedCurrent,abandonedLock:{path:previous.lock.path,device:lock.dev,inode:lock.ino,bytesBase64:lockBytes.toString('base64'),digest:'sha256:'+previous.lock.sha256},interruption:{ownerPid:inputs.deadOwnerPid,evidence:{ref:pathToFileURL(inputs.interruption.path).href,digest:'sha256:'+inputs.interruption.sha256},quiescenceEvidence:{ref:pathToFileURL(join(root,'quiescence.json')).href,digest:'sha256:'+(await pin(join(root,'quiescence.json'))).sha256},exclusiveMaintenance:true},ownerArtifact:{request:maintenanceNative.request,verified:maintenanceNative.verified}};
 const scope=maintenanceRuntime.abg.abgEventRecoveryScope(request),maintenanceActor='actor://abiogenesis/T287/executive-root',authorityValue={actorRef:maintenanceActor,authorityMode:'trusted_developer'},approvalValue={decision:'allow',actorRef:maintenanceActor,definitionRef:maintenanceRuntime.abg.ABG_EVENT_RESOURCE_RECOVERY.definitionRef,definitionDigest:maintenanceRuntime.abg.ABG_EVENT_RESOURCE_RECOVERY_DIGEST,requestDigest:hash(request),scopeDigest:scope.digest};
 assert.equal(approvalValue.definitionRef,'native-maintenance://abiogenesis/event-resource/recover@5');
 const approval={kind:'resolved_admission_authority',schemaVersion:'5.0.0',actorRef:maintenanceActor,authorityMode:'trusted_developer',authority:{ref:'authority://abiogenesis/T287/executive-root/229',digest:hash(authorityValue),value:authorityValue},approval:{ref:'approval://abiogenesis/T287/interrupted-run-recovery-229',digest:hash(approvalValue),value:approvalValue}};
 await record('maintenance-request-scope.json',{requestDigest:hash(request),scope,expectedCurrent,lastCloseHandoff:inputs.handoff,abandonedLock:request.abandonedLock,interruption:request.interruption,ownerArtifactReference:inputs.maintenanceAcquisition});await record('maintenance-approval.json',approval);
 await pulse('maintenance-recovery-start',{requestDigest:hash(request),expectedCurrent});
 const recovery=await maintenanceRuntime.abg.recoverInterruptedAbgEventResource(request,approval);await record('recovery-receipt.json',recovery);await pulse('maintenance-recovery-returned',{kind:recovery.kind,outcomeKind:recovery.outcome?.kind??null});
 assert.equal(recovery.kind,'abg_event_resource_recovery_receipt');assert.equal(recovery.outcome.kind,'recovered','Canonical maintenance owner refused');
 const recoveredHandoff=recovery.outcome.closeHandoff;assert(store29.validateEventStoreCloseHandoff(recoveredHandoff));assert.equal(a.isAcquiredAbgEventResourceSelection(recoveredHandoff),false);await record('recovered-close-handoff.json',recoveredHandoff);
 assert.equal(recoveredHandoff.prefix.prefixLength,expectedCurrent.byteLength);assert.equal(recoveredHandoff.prefix.prefixDigest,expectedCurrent.digest);assert.deepEqual(await logStat(logPath),before);await assert.rejects(lstat(previous.lock.path),e=>e.code==='ENOENT');

 await pulse('reopen-current-resource-start',{prefix:recoveredHandoff.prefix});
 const acquired=a.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:recoveredHandoff,handoffDigest:hash(recoveredHandoff)});assert.equal(acquired.kind,'acquired_abg_event_resource');resource=acquired.resource;
 const refreshSelection=()=>a.selectAcquiredAbgEventResource(resource,a.selectHeldEventStoreDurablePrefix(resource.store));selection=refreshSelection();
 const prefixAt=()=>a.selectValidatedRuntimeEventPrefix(a.readRuntimeEventsAtDurablePrefix(selection.prefix,{requireCurrent:true}));
 const identity=replay.projectRunIdentityAtPrefix(prefixAt(),inputs.sourceRunRef);assert.ok(identity,'Current owner did not authenticate actual219 Run identity');
 const basis=a.rehydrateExecutionBasisAtPrefix(prefixAt(),identity.executionBasis.ref);assert.ok(basis,'Actual219 root ExecutionBasis refused');
 const sourceAdmission=a.rehydrateInvocationAdmissionAtPrefix(prefixAt(),basis.invocationAdmissionRef);assert.ok(sourceAdmission,'Actual219 invocation admission refused');
 assert.equal(sourceAdmission.actorRef,setup.workspaceAuthority.authorizedActorRef);assert.equal(sourceAdmission.programRef,setup.program.ref);assert.equal(sourceAdmission.programDigest,setup.program.digest);
 const bindingCoordinate={ref:setup.workspaceBinding.bindingId,digest:setup.workspaceBinding.bindingDigest};
 const environment=a.projectWorkspaceEnvironmentFromArtifactTruth(a.projectOwnedPrefixArtifactTruth(selection.prefix),bindingCoordinate);assert.equal(environment?.kind,'exact_prefix_workspace_environment');assert.deepEqual(environment.workspaceBinding,setup.workspaceBinding);assert.deepEqual(environment.workspaceAuthorityBasis,setup.workspaceAuthority);
 await record('current-run-context.json',{prefix:selection.prefix,runIdentity:identity,executionBasis:{ref:basis.basisRef,digest:basis.basisDigest,invocationAdmissionRef:basis.invocationAdmissionRef},invocationAdmission:Object.fromEntries(['invocationAdmissionRef','invocationAdmissionDigest','invocationRef','invocationDigest','workspaceId','workspaceBindingId','workspaceBindingDigest','actorRef','programRef','programDigest','graphFunctionRef','graphFunctionDigest'].map(k=>[k,sourceAdmission[k]])),workspaceBinding:bindingCoordinate,publicAuthorityDigest});
 await pulse('current-run-context-complete',{run:identity.run,executionBasis:identity.executionBasis,workspaceBinding:bindingCoordinate});

 const actorRef=environment.workspaceAuthorityBasis.authorizedActorRef,coord=(ref,value)=>({ref,digest:hash(value)});
 const slots=Object.fromEntries(['workspace_binding','product_set','dependency_lock','catalog_scope','execution_program','graph_function','input_contract','session_policy','capability_grants','actor','transport_steering','verification_references','execution_basis'].map(k=>[k,null]));
 Object.assign(slots,{workspace_binding:bindingCoordinate,product_set:environment.productInstalls.map(p.productInstallCoordinate),dependency_lock:{ref:environment.resolvedProductLock.lockId,digest:environment.resolvedProductLock.lockDigest},actor:{actor:coord(actorRef,{actorRef}),attribution:coord(actorRef+'/test-owner',{ref:actorRef+'/test-owner'})},execution_basis:identity.executionBasis});
 const stopRequest={subjectKind:'run',subject:identity.run,act:'run-stopped',content:{kind:'typed_reason',contentContract:{ref:contentContract.ref,digest:contentContract.digest},value:{reasonKind:'external_interruption',reasonDetail:'Root-authorized preserving stop after actual219 native process73363 SIGABRT/heap exhaustion and subsequent223 resource worker75903 SIGABRT; unchanged authenticated history and completed work are conserved. Fresh scoped process/group quiescence and canonical recovery authenticate interruption; valid completed work is retained. No success or application-failure judgment is asserted.'}},context:{kind:'run',run:identity.run,basis:identity.executionBasis},evidence:[{ref:pathToFileURL(inputs.interruption.path).href,digest:'sha256:'+inputs.interruption.sha256},{ref:pathToFileURL(join(root,'quiescence.json')).href,digest:'sha256:'+(await pin(join(root,'quiescence.json'))).sha256}],provenance:[{ref:pathToFileURL(join(root,'activation.json')).href,digest:'sha256:'+(await pin(join(root,'activation.json'))).sha256},{ref:pathToFileURL(inputs.sourceFreeze.path).href,digest:'sha256:'+inputs.sourceFreeze.sha256}]};
 const resources={kind:'witness_run_stopped_resource_assertion',schemaVersion:'5.0.0',eventResource:selection},definition=api.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d=>d.definitionKey.operationId===packet.definitionKey.operationId&&d.definitionKey.memberKey===packet.definitionKey.memberKey);assert.ok(definition);
 const data={kind:'admission_capability_data',schemaVersion:'5.0.0',definition:{definitionKey:definition.definitionKey,definitionRef:definition.definitionRef,definitionDigest:definition.definitionDigest,owner:{ref:packet.owner.authorityRef,digest:packet.owner.authorityDigest}},ownerArtifact:{request:native.request,verified:native.verified},request:stopRequest,resourceScope:{resourcesDigest:hash(resources),authoritySlots:p.admissionAuthoritySlots(slots)},boundEnvironment:p.admissionEnvironmentSelection(selection.prefix,slots.workspace_binding)};
 const stopAuthorityValue={actorRef,authorityMode:'trusted_developer'},stopApprovalValue={decision:'allow',actorRef,definitionRef:definition.definitionRef,definitionDigest:definition.definitionDigest,requestDigest:hash(stopRequest),scopeDigest:p.admissionAuthorityScope(data).digest};
 const stopAuthority={kind:'resolved_admission_authority',schemaVersion:'5.0.0',actorRef,authorityMode:'trusted_developer',authority:{...coord(actorRef+'/229/authority',stopAuthorityValue),value:stopAuthorityValue},approval:{...coord(actorRef+'/229/approval',stopApprovalValue),value:stopApprovalValue}};
 await record('stop-request.json',stopRequest);await record('stop-authority.json',stopAuthority);await pulse('run-stopped-grant-start',{requestDigest:hash(stopRequest)});
 const admitted=await p.constructAdmissionCapabilityGrants(stopAuthority,actorRef,{kind:'admission_capability_grant_construction_basis',fixedPacket:packet,data},borrowCurrentOperationResource(a,resource,selection));assert.strictEqual(admitted.data.ownerArtifact.verified,native.verified);
 slots.capability_grants={requiredCapabilityRefs:[...definition.capabilityRefs],grants:admitted.grants.map(v=>({ref:v.grantRef,digest:v.grantDigest}))};
 const operation=native.verified.definitionContractCoordinates.operations.find(v=>v.operationId===packet.definitionKey.operationId),member=operation.members.find(v=>v.memberKey===packet.definitionKey.memberKey);
 const call=api.constructInstalledPublicDefinitionCall({product:p,installedPublic:api,definitionContractCoordinates:native.verified.definitionContractCoordinates,contractCatalog:member.slots.request.contractCatalog,...packet.definitionKey,request:stopRequest,slots,resources:{...resources,admissionAuthority:{basis:admitted.data,authority:stopAuthority,grants:admitted.grants}},requestRef:'request://abi5-tests/sandbox-uat/interrupted-run-stop-229',correlationRef:'correlation://abi5-tests/sandbox-uat/interrupted-run-stop-229',eventTime:new Date().toISOString(),provenanceRefs:[pathToFileURL(join(root,'activation.json')).href]});
 await record('stop-call-projection.json',{invocation:call.invocation,entryPrefix:selection.prefix,resourceKind:resources.kind,resourcesDigest:hash(call.resources),grants:admitted.grants,nominalOwnerArtifactReference:inputs.acquisition});
 await pulse('run-stopped-public-invoke-start',{invocationRef:call.invocation.invocationRef});
 const outcome=await api.runInstalledDefinitionCallWithResource(selection,call);await record('stop-outcome.json',outcome);await pulse('run-stopped-public-invoke-returned',{kind:outcome.kind,ownerOutput:outcome.receipt?.ownerOutput??null});
 assert.equal(outcome.kind,'installed_definition_call_transport_result');assert.equal(outcome.receipt.ownerOutput?.outcomeKind,'result','Published stop owner refused');
 assert.equal(outcome.receipt.resources?.eventResource?.kind,'abg_event_resource_completion');selection=outcome.receipt.resources.eventResource.successor;

 await pulse('source41-derive-start',{sourceResultRef:inputs.sourceResultRef,prefix:selection.prefix});
 const source=a.deriveInvocationSourceResultBasisAtPrefix(prefixAt(),{publicAuthorityDigest,runtimeInvocationRef:sourceAdmission.invocationRef,invocationAdmissionRef:sourceAdmission.invocationAdmissionRef,runId:inputs.sourceRunRef,resultRef:inputs.sourceResultRef});
 const input=source===null?null:p.retainedGovernanceWorkInput(source.sourceResultValue);
 await record('source41-discriminator.json',{returned:source===null?null:{basisRef:source.basisRef,basisDigest:source.basisDigest,publicAuthorityDigest:source.publicAuthorityDigest,sourceInvocationAdmissionRef:source.sourceInvocationAdmissionRef,sourceInvocationRef:source.sourceInvocationRef,sourceRunId:source.sourceRunId,sourceGraphCallId:source.sourceGraphCallId,sourceGraphFunctionRef:source.sourceGraphFunctionRef,sourceCCallRef:source.sourceCCallRef,sourceResultRef:source.sourceResultRef,sourceResultDigest:source.sourceResultDigest,sourceResultValueDigest:source.sourceResultValueDigest,sourceResultAdmissionEventRef:source.sourceResultAdmissionEventRef,sourceResultJudgmentEventRef:source.sourceResultJudgmentEventRef,observations:input?.observations.length??null,terminal:input?.terminal??null,inputDigest:input===null?null:hash(input),originalDigest:input===null?null:hash(input.original)},sourceRun:inputs.sourceRunRef,selectedResult:inputs.sourceResultRef,actualLatestJudgmentAdmissionOrdinal:inputs.judgmentAdmissionOrdinal,prior219Counter271559IsPreservedDiagnosticOnly:true,prefix:selection.prefix});
 assert.ok(source,'Canonical Source41 owner returned null');assert.ok(input);assert.equal(input.observations.length,41);assert.equal(input.terminal,false);assert.equal(hash(input.original),originalDigest);
 await pulse('source41-derive-complete',{basisRef:source.basisRef,basisDigest:source.basisDigest,observations:41,inputDigest:hash(input)});
 await pulse('normal-close-start');const close=a.closeAbgEventResource(resource);resource=null;await record('final-resource-receipt.json',close);assert.equal(close.kind,'abg_event_resource_receipt');await record('final-close-handoff.json',close.closeHandoff);
 await assert.rejects(lstat(previous.lock.path),e=>e.code==='ENOENT');const physicalAfter=await physical(previous);const after=await logStat(logPath);assert.equal(after.device,before.device);assert.equal(after.inode,before.inode);assert.equal(after.byteCount,close.closeHandoff.prefix.prefixLength);assert(after.byteCount>=before.byteCount);
 await record('conservation.json',{entryLogStat:before,exitLogStat:after,entryExpectedCurrent:expectedCurrent,exitPrefix:close.closeHandoff.prefix,workspaceRoot:previous.workspaceRoot,physicalRows:physicalAfter,physicalRowsUnchanged:true,oldOwnedProcesses:quiescence(previous),selectedLockAbsent:true,onlyRuntimeEffects:'Canonical maintenance adoption/close and Root-approved published preserving run-stopped Witness; no new Run/model/app/Source/Git effect',observations:41,distinctDetections:16,exactRestores:16,laterRestoredSuite:{tests:44,pass:44,fail:0,error:0,skipped:0},fullUAT:'OPEN'});
 completed=true;await pulse('complete',{prefix:close.closeHandoff.prefix,sourceBasisRef:source.basisRef,sourceBasisDigest:source.basisDigest,observations:41,noNativeDispatch:true});
}catch(error){
 await record('first-cause.json',{stage,name:error.name,message:error.message,stack:error.stack,at:new Date().toISOString(),wallMs:performance.now()-t0,memory:process.memoryUsage(),actualOwnerReceipt:error.actualReceipt??null,stop:'First failure; no retry, fallback34, private writer, direct unlink, model or application effects'});
 process.stderr.write(String(error.stack??error)+'\n');process.exitCode=1;
}finally{
 if(resource!==null){try{const close=runtime.abg.closeAbgEventResource(resource);resource=null;await record('failure-resource-close.json',close);if(close.kind==='abg_event_resource_receipt')await record('failure-close-handoff.json',close.closeHandoff);}catch(error){await record('close-first-cause.json',{name:error.name,message:error.message,stack:error.stack});process.stderr.write(String(error.stack??error)+'\n');}}
 if(!completed)process.exitCode=1;
}
