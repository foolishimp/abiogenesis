// Root-only staged operator. Existing Product helpers/owners; no automatic retry.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,cp,lstat,stat,realpath,readdir} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {constructRetainedBStart,pendingBRequest,retainedTestingAssetHandle} from './operator.mjs';
const D=dirname(fileURLToPath(import.meta.url)),P=join(D,'proof/v2'),mode=process.argv[2],bindingDigest=process.argv[3];
const stages=['check-a','acquire-a','read-a','prepare-b','interrupt-b','recover-b','prepare-continue','continue-b','read-b','proof'];assert(stages.includes(mode),'No setup or paid A stage exists in v2');
const read=p=>readFile(p,'utf8').then(JSON.parse),hash=b=>createHash('sha256').update(b).digest('hex');
const record=async(n,v)=>writeFile(join(P,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const raw=await readFile(join(D,'BINDING-v2.json'));assert.equal(hash(raw),bindingDigest,'Exact selected packet required');const selection=JSON.parse(raw);
const approval=mode==='check-a'?{bindingSha256:bindingDigest,allowedStages:selection.permittedPureReadiness}:await read(join(D,'ROOT_SELECTION-v2-'+mode+'.json'));assert.equal(approval.bindingSha256,bindingDigest);assert(approval.allowedStages.includes(mode),'Stage not selected by Root');
for(const r of selection.files){const b=await readFile(r.path);assert.equal(b.length,r.bytes);assert.equal(hash(b),r.sha256,r.path);}
const custody=await read(join(D,'CANDIDATE_CUSTODY.json'));
for(const root of selection.operatorRoots){const st=await lstat(root.path);assert(st.isDirectory()&&!st.isSymbolicLink());assert.equal(await realpath(root.path),root.path);assert.equal(st.dev,root.device);assert.equal(st.ino,root.inode);assert.equal(st.uid,root.uid);}
async function checkPackage(root){for(const r of custody.allArchiveMembers){const p=join(root,r.path),s=await lstat(p);assert(s.isFile()&&!s.isSymbolicLink());const b=await readFile(p);assert.equal(b.length,r.bytes);assert.equal(hash(b),r.sha256,p);}}
await checkPackage(custody.installedRoot);
assert(!Object.keys(process.env).some(k=>k.startsWith('ABI5_SCRIPTED_ACTOR')),'Scripted provider forbidden');
process.env.TMPDIR=selection.runtimeTmp;delete process.env.NPM_CONFIG_CACHE;
process.env.PATH=selection.environment.PATH;process.env.HOME=selection.environment.HOME;process.env.LANG='C.UTF-8';process.env.LC_ALL='C.UTF-8';
process.env.ABG_TS_CLAUDE_COMMAND=join(D,'claude-provider.sh');process.env.ABG_TS_WORKER_SANDBOX='agent_default';
process.env.ABG_TS_CLAUDE_APPEND_ARGS=JSON.stringify(['--model',selection.provider.model,'--max-turns',String(selection.provider.maxTurns),'--effort',selection.provider.effort]);
process.env.ABG_TS_FP_TIMEOUT_MS=String(selection.provider.inactivityTimeoutMs);process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS=String(selection.provider.absoluteTimeoutMs);process.env.ABG_TS_FP_TERMINATION_GRACE_MS='5000';
process.env.NODE_OPTIONS='--max-old-space-size=8192';process.env.BASH_DEFAULT_TIMEOUT_MS='4500000';process.env.BASH_MAX_TIMEOUT_MS='4500000';process.env.CLAUDE_CODE_DISABLE_BACKGROUND_TASKS='1';
const support=join(D,'operator-assets/test_env/support');
const helpers=await import(pathToFileURL(join(support,'registered-graph-selection.mjs')).href);
const lib=await import(pathToFileURL(join(support,'default-library.mjs')).href);
const loadAt=(root,n)=>import(pathToFileURL(join(root,'build/code/src',n+'.js')).href);
let env,state,product,abg,api,storeOwner,cc;
const resource=()=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:state.handoff,handoffDigest:product.sha256Canonical(state.handoff)});
const rows=()=>storeOwner.readRuntimeEventsAtDurablePrefix(state.handoff.prefix);
// Exact helper-return relation, checked before any worksite read/write/call preparation.
async function checkedWorkspace(e) {
 assert.equal(typeof e.scratch,'string');assert.equal(typeof e.installedRoot,'string');
 const authority=e.workspaceAuthority,binding=e.workspaceBinding;
 assert.equal(authority?.kind,'workspace_authority_basis');assert.equal(binding?.kind,'workspace_binding');
 for(const field of ['workspaceId','authorityBasisId','authorityBasisDigest','authorizedActorRef'])assert.equal(binding[field],authority[field],'Binding/authority relation: '+field);
 const root=authority.canonicalRoot;assert.equal(typeof root,'string');assert(root.length>0);assert.equal(root,join(e.scratch,'workspace'),'Exact helper-created workspace');
 const st=await lstat(root);assert(st.isDirectory()&&!st.isSymbolicLink());assert.equal(await realpath(root),root);
 for(const name of ['toolchainRoot','productRoot','eventLogRoot','runtimeStateRoot','projectionRoot','archiveRoot'])assert.equal(typeof binding.roots?.[name],'string');
 assert(Array.isArray(e.admittedInstalls)&&e.admittedInstalls.length>0);assert(Array.isArray(e.installedRoots)&&e.installedRoots.includes(e.installedRoot));
 assert(Array.isArray(e.verified?.definitionContractCoordinates?.operations));
 assert.equal(e.catalog?.kind,'graph_function_catalog');assert.equal(e.catalogView?.kind,'graph_function_catalog_view');
 assert(Array.isArray(e.additionalPublications)&&e.additionalPublications.length===1);assert(Array.isArray(e.additionalPublications[0].programs)&&e.additionalPublications[0].programs.length===1);
 assert(Array.isArray(e.additionalProducts)&&e.additionalProducts.length===1);const supplied=e.additionalProducts[0];
 for(const name of ['programRef','graphFunctionRef','startRef'])assert.equal(typeof supplied.ids?.[name],'string');assert.equal(typeof supplied.artifactPath,'string');assert.equal(typeof supplied.basis?.artifactDigest,'string');
 return {canonicalRoot:root,device:st.dev,inode:st.ino,authorityBasisId:authority.authorityBasisId,authorityBasisDigest:authority.authorityBasisDigest,bindingId:binding.bindingId,bindingDigest:binding.bindingDigest};
}
function checkedStart(value) {
 assert(value?.call?.invocation?.request);assert(value.call.resources);assert.equal(typeof value.workAuthority?.authorityRef,'string');assert.equal(typeof value.workAuthority?.authorityDigest,'string');
 assert.equal(typeof value.capabilityBasis?.actorRef,'string');assert(value.capabilityBasis.policy);assert.equal(value.resolution?.kind,'loaded_product_execution_resolution');
 assert(value.resolution.programValidation);assert(Array.isArray(value.resolution.declarationPublications));
 for(const name of ['programRef','programDigest','graphFunctionRef','graphFunctionDigest'])assert.equal(typeof value.resolution.resolution?.[name],'string');
 return value;
}
const checkedFile=async r=>{const bytes=await readFile(r.path);assert.equal(bytes.length,r.bytes);assert.equal(hash(bytes),r.sha256,r.path);return JSON.parse(bytes);};
async function saveState(n){
 const {env:omitEnv,startA:omitA,input:omitInput,accounting:omitAccounting,workspaceRootRelation:omitRelation,startB:omitB,...delta}=state;
 await record(n,{baseline:selection.baselineResume,...delta});
}
async function restore(file=null,{interrupted=false}={}){
 const baseline=await checkedFile(selection.baselineResume);state=baseline;
 if(file){const delta=await read(join(P,file));assert.deepEqual(delta.baseline,selection.baselineResume);state={...baseline,...delta};}
 if(state.startBRef)state.startB=await checkedFile(state.startBRef);
 env=state.env;product=await loadAt(env.installedRoot,'product/index');abg=await loadAt(env.installedRoot,'abg/index');api=await loadAt(env.installedRoot,'public/index');storeOwner=await loadAt(env.installedRoot,'abg/event_store');cc=await loadAt(env.installedRoot,'abg/construction_continuation');
 env.product=product;env.abg=abg;
 if(!interrupted){env.artifactTruth=abg.projectOwnedPrefixArtifactTruth(state.handoff.prefix);assert(abg.validateExactPrefixArtifactTruthProjection(env.artifactTruth,{requireCurrent:true}));}
 else delete env.artifactTruth;
 const relation=await checkedWorkspace(env);assert.deepEqual(relation,state.workspaceRootRelation,'Retained authority/root relation changed');
 process.env.ABG_WITNESS_PROVIDER_TMP=join(relation.canonicalRoot,'operator-scratch/tmp');await checkPackage(env.installedRoot);
}
async function authenticatedAdmission(prefix,coordinate,run,publicInvocation){
 const owner=await loadAt(env.installedRoot,'abg/invocation_admission');
 for(const name of ['rehydrateInvocationAdmissionAtPrefix','hasInvocationRunBindingAtPrefix','deriveInvocationSourceResultBasisAtPrefix'])assert.equal(typeof owner[name],'function',name);
 const admission=owner.rehydrateInvocationAdmissionAtPrefix(prefix,coordinate.ref);assert(admission,'Exact admission unavailable');
 if(coordinate.digest!==undefined)assert.equal(admission.invocationAdmissionDigest,coordinate.digest);
 assert(owner.hasInvocationRunBindingAtPrefix(prefix,admission,run),'Invocation is not bound to selected Run');
 assert.equal(admission.publicRequestInvocationRef,publicInvocation.invocationRef,'Original Public invocation must match');
 return {owner,admission};
}
async function acquireASource(){
 await restore();const transport=await checkedFile(selection.aTransport),receipt=transport.output?.receipt;assert(receipt);assert.equal(receipt.failure,null);assert.equal(receipt.ownerOutput.value.disposition,'blocked');
 assert.deepEqual(receipt.resources.run,receipt.ownerOutput.value.run);assert.deepEqual(receipt.resources.eventResource.closeHandoff,state.handoff);
 const A=receipt.resources.run.ref,current=rows(),prefix=abg.selectValidatedRuntimeEventPrefix(current);
 const {owner,admission}=await authenticatedAdmission(prefix,receipt.resources.invocationAdmission,A,state.startA.call.invocation);
 const natives=current.filter(e=>e.runId===A&&e.kind==='c_call_result_admitted'&&e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef);assert.equal(natives.length,1);assert.equal(natives[0].payload.resultClass,'success');
 const latest=current.filter(e=>e.runId===A&&e.kind==='c_call_result_admitted'&&e.payload.resultClass==='success'&&e.payload.value?.kind==='governance_work_state').at(-1);assert(latest);assert.equal(latest.payload.resultRef,selection.expectedAStateResult);
 const sourceInput={publicAuthorityDigest:state.startA.call.invocation.invocationDigest,runtimeInvocationRef:admission.invocationRef,invocationAdmissionRef:admission.invocationAdmissionRef,runId:A,resultRef:latest.payload.resultRef};
 const source=owner.deriveInvocationSourceResultBasisAtPrefix(prefix,sourceInput);assert(source,'Existing source owner refuses A eligibility');assert.equal(source.basisDigest,selection.expectedABasisDigest,'Selected exact A source basis changed');
 const observed=source.sourceResultValue.observations.find(o=>o.resultRef===natives[0].payload.resultRef);assert.deepEqual(observed&&[observed.purpose,observed.resultDigest,observed.cCallRef],['construction',natives[0].payload.resultDigest,natives[0].aggregateId]);
 assert(!current.some(e=>e.runId===A&&e.kind==='traversal_cursor_entered'&&e.payload.graphFunctionRef===product.governanceRef('graph-function','testing')));
 state.source=source;state.runA=A;state.nativeResult=natives[0];state.eventsAfterA=current.length;state.eventsInA=current.filter(e=>e.runId===A).length;
 state.aAdmission={ref:admission.invocationAdmissionRef,digest:admission.invocationAdmissionDigest};
 return {owner,admission,prefix,sourceInput,source};
}
const command=mode==='check-a'?null:(await import(pathToFileURL(selection.operatorRunner).href)).commandRecorder(P,{timeoutMs:selection.provider.outerTimeoutMs,maxOutputBytes:67108864});
async function cli(identity,call){
 if(identity==='continue')assert(process.env.CLAUDE_CODE_OAUTH_TOKEN,'Real provider credential unavailable');
 const requestPath=join(P,identity+'.request.jsonl');await writeFile(requestPath,JSON.stringify({kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition:{kind:'reopen',closeHandoff:state.handoff},invocation:call})+'\n',{flag:'wx'});
 const execution=await command(identity,process.execPath,[join(env.installedRoot,'build/code/src/public/cli.js'),'--jsonl',requestPath],{environment:{...process.env}});
 const result={execution,wallMs:execution.wallMs,output:null};
 try{result.output=JSON.parse(execution.stdout.trim());}catch{}
 await record(identity+'.transport.json',result);const receipt=result.output?.receipt,handoff=receipt?.resources?.eventResource?.closeHandoff;
 assert(handoff,'Null/fault resources retained; do not reuse stale handoff');state.handoff=handoff;
 await saveState(identity+'.resume.json');assert.equal(receipt.failure,null,'Typed failure retained');return result;
}
async function prepared(name,call){await record(name+'.call.json',call);await record(name+'.identity.json',{sha256:hash(await readFile(join(P,name+'.call.json'))),invocationRef:call.invocation.invocationRef,sourceCommit:selection.sourceCommit,providerCalls:0,RunAdmissions:0});}
async function selectedCall(name){const file=join(P,name+'.call.json'),b=await readFile(file);assert.equal(approval.callSha256,hash(b),'Root must select exact prepared call');return JSON.parse(b);}
try{
 if(mode==='check-a'||mode==='acquire-a'){
  const acquired=await acquireASource();
  if(mode==='check-a'){
   const log=await readFile(fileURLToPath(state.handoff.prefix.eventLogRef));
   await record('A_SOURCE_READINESS.json',{status:'EXISTING_A_SOURCE_ELIGIBLE_PURE_OWNER_READ',baseline:selection.baselineResume,aTransport:selection.aTransport,run:state.runA,invocationAdmission:state.aAdmission,sourceBasisRef:state.source.basisRef,sourceResultRef:state.source.sourceResultRef,nativeResultRef:state.nativeResult.payload.resultRef,sourceResultDigest:state.source.sourceResultDigest,observationCount:state.source.sourceResultValue.observations.length,log:{bytes:log.length,sha256:hash(log),prefix:state.handoff.prefix},priorComparison:selection.sourceComparison,currentPrefixArtifactTruth:true,providerCalls:0,PublicCalls:0,eventMutations:0,limits:'Pure existing owner projection; not B admission or recovery completion.'});
  }else{await record('a-source.json',state.source);await saveState('a-source.resume.json');}
 }else if(mode==='read-a'){
  await restore('a-source.resume.json');const receipt=(await checkedFile(selection.aTransport)).output.receipt,contracts=await loadAt(env.installedRoot,'abg/project_read_operation_contracts');assert(receipt.resources.run,'No genuine A Run coordinate');
  for(const memberKey of ['run_result','run_replay']){const {call}=helpers.constructInstalledRunReadCall({environment:env,publicApi:api,projectReadContracts:contracts,memberKey,selector:memberKey==='run_result'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:4096},source:receipt.resources.run,eventResource:resource(),identity:'real-a-'+memberKey});await cli('a-'+memberKey,call);}
  await saveState('read-a.resume.json');
 }else if(mode==='prepare-b'){
  await restore('read-a.resume.json');const admissions=await loadAt(env.installedRoot,'abg/invocation_admission');const S=state.source;assert.equal(typeof S.sourceInvocationRef,'string','Exact returned source basis coordinate');
  const fresh=admissions.deriveInvocationSourceResultBasisAtPrefix(abg.selectValidatedRuntimeEventPrefix(rows()),{publicAuthorityDigest:S.publicAuthorityDigest,runtimeInvocationRef:S.sourceInvocationRef,invocationAdmissionRef:S.sourceInvocationAdmissionRef,runId:S.sourceRunId,resultRef:S.sourceResultRef});assert(fresh);assert.deepEqual(fresh.sourceResultValue,S.sourceResultValue);
  const selected=await lib.libraryEnvironment({gtl:await loadAt(env.installedRoot,'gtl/index'),product,packageRoot:env.installedRoot});
  state.startB=await constructRetainedBStart({product,publicApi:api,installed:product,env,startA:state.startA,sourceBasis:fresh,eventResource:resource(),identity:'real-b',eventTime:new Date().toISOString(),assetHandle:retainedTestingAssetHandle,constructInstalledStartCall:helpers.constructInstalledStartCall,runEnvironmentResourceFactory:selected.resources});
  checkedStart(state.startB);state.source=fresh;await record('b-start.owner.json',state.startB);const startBytes=await readFile(join(P,'b-start.owner.json'));state.startBRef={path:join(P,'b-start.owner.json'),bytes:startBytes.length,sha256:hash(startBytes)};await prepared('b',state.startB.call);await saveState('b-prepared.resume.json');
 }else if(mode==='interrupt-b'){
  await restore('b-prepared.resume.json');assert(process.env.CLAUDE_CODE_OAUTH_TOKEN);const call=await selectedCall('b');
  const requestPath=join(P,'b.request.jsonl');await writeFile(requestPath,JSON.stringify({kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition:{kind:'reopen',closeHandoff:state.handoff},invocation:call})+'\n',{flag:'wx'});
  const hostInput=join(P,'host-input.json');await record('host-input.json',{installedRoot:env.installedRoot,requestPath,eventLogPath:fileURLToPath(state.handoff.prefix.eventLogRef),proof:P,closeHandoff:state.handoff,profileDigest:state.handoff.prefix.storeIdentity.eventContractDigest,testingGraphFunctionRef:product.governanceRef('graph-function','testing')});
  const execution=await command('b-host',process.execPath,[join(D,'entered-testing-host-v2.mjs')],{environment:{...process.env,ABI5_PENDING_TESTING_HOST:hostInput}});await record('b-host-return.json',execution);assert.equal(execution.signal,'SIGKILL');
  assert.equal(await readFile(join(P,'observer-failure.json'),'utf8').catch(e=>e.code==='ENOENT'?null:Promise.reject(e)),null);
  const interruption=await read(join(P,'interruption.json'));assert.equal(interruption.entered.length,1);assert.equal(interruption.openedAtInterruption,0);
 }else if(mode==='recover-b'){
  assert.equal(approval.quiescenceConfirmed,true,'Root must confirm host/provider quiescence before resource recovery');await restore('b-prepared.resume.json',{interrupted:true});const origin=await read(join(P,'recovery-origin.json'));try{process.kill(origin.ownerPid,0);throw Error('Host remains live')}catch(e){assert.equal(e.code,'ESRCH');}
  const bytes=await readFile(fileURLToPath(state.handoff.prefix.eventLogRef));assert.deepEqual(bytes,await readFile(join(P,'interrupted-prefix.jsonl')));
  const physical=state.handoff.reopenAuthority,lockPath=join(selection.runtimeTmp,'abiogenesis-event-store-locks-v5',physical.device+'-'+physical.inode+'.lock'),lock=await stat(lockPath),lockBytes=await readFile(lockPath);
  const recovered=storeOwner.recoverInterruptedEventStore({...origin,expectedCurrent:{byteLength:bytes.length,digest:product.sha256Bytes(bytes)},abandonedLock:{path:lockPath,device:lock.dev,inode:lock.ino,bytesBase64:lockBytes.toString('base64'),digest:product.sha256Bytes(lockBytes)}});await record('b-resource-recovery.json',recovered);assert.equal(recovered.kind,'recovered');state.handoff=recovered.closeHandoff;env.artifactTruth=abg.projectOwnedPrefixArtifactTruth(state.handoff.prefix);assert(abg.validateExactPrefixArtifactTruthProjection(env.artifactTruth,{requireCurrent:true}));
  const interruption=await read(join(P,'interruption.json'));assert.equal(interruption.entered.length,1);const entered=interruption.entered[0],prefix=abg.selectValidatedRuntimeEventPrefix(rows()),open=await loadAt(env.installedRoot,'abg/open_call'),scope=open.projectOpenedTraversalScopeForFrameAtPrefix(prefix,entered.frameId);assert(scope);assert.equal(scope.runId,entered.runId);const {admission}=await authenticatedAdmission(prefix,{ref:scope.invocationAdmissionRef},scope.runId,state.startB.call.invocation);state.runB=scope.runId;state.bAdmission={ref:admission.invocationAdmissionRef,digest:admission.invocationAdmissionDigest};state.bEntered={runId:entered.runId,frameId:entered.frameId,cursorRef:entered.cursorRef};assert.notEqual(state.runA,state.runB);await saveState('b-recovered.resume.json');
 }else if(mode==='prepare-continue'){
  await restore('b-recovered.resume.json');const prefix=abg.selectValidatedRuntimeEventPrefix(rows()),open=await loadAt(env.installedRoot,'abg/open_call');
  const {request,use,p}=pendingBRequest({continuationOwner:cc,openCallOwner:open,prefix,runB:state.runB,interruption:await read(join(P,'interruption.json'))});state.pending=p;assert.equal(use.invocation.invocationAdmissionRef,state.bAdmission.ref);assert.equal(use.invocation.invocationAdmissionDigest,state.bAdmission.digest);assert.equal(use.rootScope.runId,state.runB);state.pendingOrigin={invocation:{ref:use.invocation.invocationAdmissionRef,digest:use.invocation.invocationAdmissionDigest},publicInvocationRef:use.invocation.publicRequestInvocationRef,rootBasis:{ref:use.rootBasis.basisRef,digest:use.rootBasis.basisDigest},rootScope:{ref:use.rootScope.scopeRef,digest:use.rootScope.scopeDigest},runId:use.rootScope.runId};
  const pubs=state.startB.resolution.declarationPublications,pendingInput=cc.projectPendingExecutionInputAtPrefix(prefix,use,r=>pubs.flatMap(x=>x.graphFunctions).find(g=>g.name===r)??null,state.startB.resolution.programValidation);assert(pendingInput);
  const declaration=pubs.flatMap(x=>x.contracts).find(c=>c.contractRef===pendingInput.inputCarrierRef);assert(declaration);
  const packet=product.RUN_OPERATION_CONTRACTS.continue.current_intent,operationId=packet.definitionKey.operationId,{policy,actorRef}=state.startB.capabilityBasis;
  const grant=product.constructCapabilityGrant(policy,actorRef,operationId,packet.metadata.capabilityRefs[0],{admittedInstalls:env.admittedInstalls,workspaceBinding:env.workspaceBinding,fixedPacket:packet}),r=state.startB.resolution.resolution,eventResource=resource(),steer=product.sha256Canonical(eventResource);
  const slots={workspace_binding:{ref:env.workspaceBinding.bindingId,digest:env.workspaceBinding.bindingDigest},product_set:env.admittedInstalls.map(product.productInstallCoordinate),dependency_lock:{ref:env.workspaceBinding.lockId,digest:env.workspaceBinding.lockDigest},catalog_scope:{catalog:{ref:`graph-function-catalog://abiogenesis/${env.catalog.basisDigest.slice(7)}`,digest:env.catalog.basisDigest},view:{ref:`graph-function-catalog-view://abiogenesis/${env.catalogView.viewDigest.slice(7)}`,digest:env.catalogView.viewDigest},allowlist:env.catalogView.allowlist},execution_program:{ref:r.programRef,digest:r.programDigest},graph_function:{graphFunction:{ref:r.graphFunctionRef,digest:r.graphFunctionDigest},membership:r.programGraphFunctionMembership},input_contract:{contract:{ref:declaration.contractRef,digest:product.sha256Canonical(declaration)},valueRef:pendingInput.input.inputRef,valueDigest:pendingInput.input.inputDigest,value:pendingInput.input.value},session_policy:{ref:policy.policyRef,digest:policy.policyDigest},capability_grants:{requiredCapabilityRefs:packet.metadata.capabilityRefs,grants:[{ref:grant.grantRef,digest:grant.grantDigest}]},actor:{actor:{ref:actorRef,digest:product.sha256Canonical({actorRef})},attribution:{ref:state.startB.workAuthority.authorityRef,digest:state.startB.workAuthority.authorityDigest}},transport_steering:{ref:`transport-steering://abiogenesis/${steer.slice(7)}`,digest:steer},verification_references:null,execution_basis:{ref:p.chain[0].basisRef,digest:p.chain[0].basisDigest}};
  const catalog=env.verified.definitionContractCoordinates.operations.find(o=>o.operationId===operationId).members.find(m=>m.memberKey==='current_intent').slots.request.contractCatalog;
  const call=api.constructInstalledPublicDefinitionCall({product,installedPublic:api,definitionContractCoordinates:env.verified.definitionContractCoordinates,contractCatalog:catalog,operationId,memberKey:'current_intent',request,slots,resources:{kind:'run_invocation_resource_assertion',schemaVersion:'5.0.0',eventResource,catalog:env.catalog,catalogView:env.catalogView,applications:[],source:{kind:'none'},runEnvironmentResources:state.startB.call.resources.runEnvironmentResources},requestRef:'public-request://real-retained-source/continue-b',correlationRef:'correlation://real-retained-source/continue-b',eventTime:new Date().toISOString(),provenanceRefs:['provenance://default-library-witness/retained-source@5']});await prepared('continue',call);await saveState('continue-prepared.resume.json');
 }else if(mode==='continue-b'){
  await restore('continue-prepared.resume.json');const result=await cli('continue',await selectedCall('continue'));assert.equal(result.output.receipt.ownerOutput.value?.disposition,'completed');assert.equal(result.output.receipt.ownerOutput.value?.run?.ref,state.runB);await checkPackage(env.installedRoot);
 }else if(mode==='read-b'){
  await restore('continue.resume.json');const receipt=(await read(join(P,'continue.transport.json'))).output.receipt,contracts=await loadAt(env.installedRoot,'abg/project_read_operation_contracts');
  for(const memberKey of ['run_result','run_replay']){
   const {call}=helpers.constructInstalledRunReadCall({environment:env,publicApi:api,projectReadContracts:contracts,memberKey,selector:memberKey==='run_result'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:4096},source:receipt.resources.run,eventResource:resource(),identity:'real-b-'+memberKey});await cli(memberKey,call);
  }
  await saveState('read-b.resume.json');
 }else if(mode==='proof'){
  await restore('read-b.resume.json');const all=rows(),prefix=abg.selectValidatedRuntimeEventPrefix(all),B=all.filter(e=>e.runId===state.runB),A=all.filter(e=>e.runId===state.runA);
  assert.equal(A.length,state.eventsInA,'A admits nothing after its normal bound stop');
  const results=B.filter(e=>e.kind==='c_call_result_admitted'),choices=results.filter(e=>e.payload.value?.kind==='registered_graph_choice').map(e=>e.payload.value.graphFunctionRef);
  assert.deepEqual(choices,[product.governanceRef('graph-function','testing'),product.governanceRef('graph-function','uat')],'No repeated initial selector; normal post-Testing selection');
  assert(!B.some(e=>e.kind==='c_call_opened'&&e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef),'No repeated Construction');
  assert.equal(B.filter(e=>e.kind==='run_closed').length,1);assert(!B.some(e=>e.kind==='runtime_failure_observed'));
  const commands=results.filter(e=>e.payload.value?.kind==='worksite_command_execution_observation'&&e.graphFunctionRef===product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef);assert.equal(commands.length,1);assert(commands[0].payload.value.commandResults.every(c=>c.exitStatus===0));
  const post=results.filter(e=>e.payload.value?.kind==='framed_synthesis_task'&&e.admissionOrdinal>commands[0].admissionOrdinal);assert.equal(post.length,1);
  const task=post[0].payload.value,started=B.filter(e=>e.kind==='actor_invocation_started'&&e.payload.inputDigest===product.sha256Canonical(task));assert.equal(started.length,1);
  const transport=B.find(e=>e.kind==='actor_transport_binding_admitted'&&e.payload.cCallRef===started[0].payload.cCallRef&&e.payload.promptDigest===started[0].payload.promptDigest);assert(transport?.payload.paths.prompt);
  const bytes=await readFile(transport.payload.paths.prompt),prompt=new TextDecoder('utf-8',{fatal:true}).decode(bytes);assert.equal(product.sha256Canonical(prompt),started[0].payload.promptDigest);await writeFile(join(P,'post-testing-submitted-prompt.txt'),bytes,{flag:'wx'});
  const truth=await loadAt(env.installedRoot,'abg/invocation_execution_truth'),bodies=await loadAt(env.installedRoot,'abg/event_prefix');assert.equal(state.pendingOrigin.runId,state.runB);const {admission}=await authenticatedAdmission(prefix,state.pendingOrigin.invocation,state.runB,state.startB.call.invocation);assert.equal(admission.publicRequestInvocationRef,state.pendingOrigin.publicInvocationRef);const use=truth.governanceContextBodyUse(admission,state.runB);
  assert.deepEqual(admission.sourceResultBasis,state.source);assert(use.sourceResults.some(x=>x.resultRef===state.nativeResult.payload.resultRef));
  const view=JSON.parse(prompt.split('\n\n').find(x=>x.startsWith('## task\n')).slice('## task\n'.length)),lineage=[];
  for(const source of state.input.original.sources){
   const entry=task.context.entries.find(e=>e.relativePath===source.path);assert.equal(entry?.encoding,'admitted_member');const holder=all.find(e=>e.kind==='c_call_result_admitted'&&e.payload.resultRef===entry.member.resultRef);assert.equal(holder?.runId,state.runA);
   const body=bodies.resolveWorksiteContextBodyAtPrefix(prefix,task.context,source.path,use);assert.equal(body.kind,'worksite_context_body');const seed=await readFile(join(D,'seed',source.path));assert.deepEqual(body.bytes,seed);
   const presented=view.worksite.files.find(f=>f.path===source.path);assert.equal(presented?.contentRole,'declared_source');const text=presented.encoding==='utf8'?presented.content:view.originalTask.slice(presented.startCharacter,presented.endCharacter);assert.equal(text,seed.toString('utf8'));
   lineage.push({path:source.path,holderRun:state.runA,holderResult:holder.payload.resultRef,member:entry.member,digest:entry.digest});
  }
  const finalReceipt=(await read(join(P,'continue.transport.json'))).output.receipt;
  const resultRead=(await read(join(P,'run_result.transport.json'))).output.receipt.ownerOutput.value,replayRead=(await read(join(P,'run_replay.transport.json'))).output.receipt.ownerOutput.value;
  assert.equal(resultRead.projection.terminalResult.producer.runRef,state.runB);const parent=results.filter(e=>e.graphFunctionRef===lib.witnessRef('graph-function','executive-b')).at(-1);assert(parent?.payload.value.terminal);assert.deepEqual(resultRead.projection.terminalResult.result,{ref:parent.payload.resultRef,digest:parent.payload.resultDigest});assert.equal(resultRead.projection.terminalResult.producer.graphCallRef,finalReceipt.ownerOutput.value.graphCall.ref);assert.deepEqual(replayRead.projection.replay,finalReceipt.ownerOutput.value.replay);assert.deepEqual(cc.projectPendingExecutionContinuations(prefix,state.runB),[]);
  const operations=all.filter(e=>e.kind==='public_operation_admitted'&&e.payload.continuationKind==='pending_execution');assert.equal(operations.length,1);
  const archiveBytes=await readFile(fileURLToPath(state.handoff.prefix.eventLogRef));await writeFile(join(P,'final-events.jsonl'),archiveBytes,{flag:'wx'});
  const providerUsage=[];
  for(const event of all.filter(e=>e.kind==='actor_transport_binding_admitted')){
   const path=event.payload.paths.stdout,data=await readFile(path);const result=data.toString('utf8').split(/\r?\n/u).flatMap(line=>{try{const v=JSON.parse(line);return v.type==='result'?[v]:[];}catch{return [];}}).at(-1);
   providerUsage.push({eventId:event.eventId,cCallRef:event.payload.cCallRef,path,bytes:data.length,sha256:hash(data),totalCostUsd:result?.total_cost_usd??null,turns:result?.num_turns??null,durationMs:result?.duration_ms??null,usage:result?.usage??null});
  }
  await record('PROVIDER_MEASUREMENTS.json',{roles:providerUsage,knownCostUsd:providerUsage.reduce((n,r)=>n+(typeof r.totalCostUsd==='number'?r.totalCostUsd:0),0),unknownCharges:providerUsage.filter(r=>r.totalCostUsd===null).length,meaning:'Reported provider artifacts; not independent billing or matched comparison.'});
  await record('SUMMARY.json',{status:'BOUNDED_REAL_PROVIDER_WITNESS_OBSERVED',sourceCommit:selection.sourceCommit,candidateArchive:custody.archive,runA:state.runA,runB:state.runB,sourceBasisRef:state.source.basisRef,lineage,postTestingPrompt:{transportEvent:transport.eventId,cCallRef:started[0].payload.cCallRef,startedEvent:started[0].eventId,canonicalDigest:started[0].payload.promptDigest,fileSha256:hash(bytes),bytes:bytes.length,limit:'Exact retained submitted transport input; not independent model/read-side receipt.'},events:all.length,eventBytes:archiveBytes.length,eventFileSha256:hash(archiveBytes),actorStarts:all.filter(e=>e.kind==='actor_invocation_started').map(e=>({runId:e.runId,eventId:e.eventId,at:e.eventTime,cCallRef:e.payload.cCallRef})),providerTransportArchives:all.filter(e=>e.kind==='actor_transport_binding_admitted').map(e=>({eventId:e.eventId,paths:e.payload.paths})),cost:'Read actual retained provider result/usage artifacts; no invented estimate or matched comparison.',qualification:false,release:false});
 }else throw Error('Unknown explicit Root stage');
 console.log(JSON.stringify({stage:mode,status:'returned',proof:P}));
}catch(error){await record('FAULT-'+mode+'.json',{at:new Date().toISOString(),name:error.name,message:String(error.message).slice(0,6000),meaning:'Actual fault retained; no automatic retry, fabricated state, stale handoff or acceptance.'});throw error;}
