import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadWorksiteOwner, worksiteFixture } from '../support/t287-generic-job-worksite.mjs';
import { acquireNewEmptyAppendSinkFixture } from '../support/new-empty-append-sink.mjs';
import * as native from '../../build/code/src/product/native_workspace_work.js';
import { constructNativeWorkspaceWorkModulePublication } from '../../build/code/src/gtl/index.js';
import { ABI5_NATIVE_WORKSPACE_WORK_PRODUCT_SEMANTICS as semantics } from '../../build/code/src/product/builtin_semantics.js';
import { realizeNativeWorkspaceWork } from '../../build/code/src/implementation/native_workspace_work.js';
import { constructLeafExecutionAuthority } from '../../build/code/src/implementation/leaf_execution_authority.js';
import { createNewEmptyAppendSink } from '../../build/code/src/abg/index.js';
import { eventCalculusEffect, projectNativeWorkRetiredObservations } from '../../build/code/src/abg/event_calculus.js';
import { rawAdmitValue } from '../../build/code/src/validator/raw_admission.js';
import { validateActorProcessCarrierPair } from '../../build/code/src/abg/actor_process.js';
import { deriveProbabilisticTransportEvidence } from '../../build/code/src/abg/c_call.js';
import { canonicalJson } from '../../build/code/src/shared/canonical_json.js';
import { dirname, resolve } from 'node:path';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import { deepFreeze } from '../../build/code/src/shared/immutable.js';
import { selectValidatedRuntimeEventPrefix } from '../../build/code/src/abg/event_prefix.js';
import { deriveRuntimeEventCalculusProjection, holdsAt, constructRuntimeFluent } from '../../build/code/src/abg/event_calculus.js';
import { ROOT_EVENT_CONTRACT_DIGEST } from '../../build/code/src/abg/event_store.js';
import { projectExactExecutionBasisAtPrefix, projectExactInvocationAdmissionAtPrefix } from '../../build/code/src/abg/invocation_execution_truth.js';
import { rehydrateAdmittedImplementationSetAtPrefix } from '../../build/code/src/abg/execution_basis.js';
const product = await loadWorksiteOwner();
const ids = native.NATIVE_WORKSPACE_WORK_IDS;
const digest = label => product.sha256Canonical({ label });
const publication = constructNativeWorkspaceWorkModulePublication({productId:'product://native-owner/test',
  artifactDigest:digest('artifact'), productContentDigest:digest('content'), productManifestDigest:digest('manifest'),
  packageName:'@abiogenesis/typescript-tenant', packageVersion:'5.0.0-dev.286'});

test('post-effect channel conflict retains admitted native failure scope without a fabricated exchange', async t => {
  const env = await fixture(t), p = await prepare(t, env);
  const requests = [];
  for (const relativePath of ['target.txt', 'keep.txt', 'absent.txt']) {
    const subject = product.constructWorksiteSubject({...env.read,relativePath,subjectUri:pathToFileURL(join(env.canonicalRoot,relativePath)).href});
    const predecessorObservation = await product.observeWorksiteSubject(env.workspaceAuthorityBasis,env.workspaceBinding,subject);
    requests.push(product.constructWorksiteFileReplaceRequest({...env.read,capabilityGrant:env.capabilityGrant,subject,territory:env.territory,
      predecessorObservation,replacementBytes:Buffer.from('future\n')}));
  }
  // Controlled cold admission/installation premises, with actual owner digest
  // projectors, actor implementation and local process/filesystem effects.
  // This is not a Public/native installed Run or semantic assessment claim.
  const rows = [], runId = 'run://native-tail/component', graphCallId = 'graph-call://native-tail/component', frameId = 'frame://native-tail/component';
  let basisId = 'basis://native-tail/setup';
  const append = candidate => {
    const ordinal = rows.length + 1, row = deepFreeze({eventTime:'2026-10-08T00:00:00.000Z',correlationId:'native-tail',workflowVersion:'5.0.0',
      scopeClass:'run',basisId,runId,graphCallId,frameId,causationEventRefs:[],parentAggregateId:null,eventContractDigest:ROOT_EVENT_CONTRACT_DIGEST,...candidate,
      eventId:`event://native-tail/${ordinal}`,admissionOrdinal:ordinal,payloadDigest:product.sha256Canonical(candidate.payload)});
    rows.push(row); return row;
  };
  const authority = p.occurrence.executionAuthority, set = authority.implementationSet;
  const setPayload = {rows:set.rows,implementationSetRef:set.implementationSetRef,implementationSetDigest:set.implementationSetDigest};
  append({kind:'implementation_admitted',aggregateType:'workspace',aggregateId:env.workspaceBinding.bindingId,payload:{...setPayload,implementationSet:setPayload}});
  const invocation = Object.fromEntries(['invocationRef','rawInputAdmissionRef','publicRequestAdmissionRef','publicRequestInvocationRef',
    'catalogBasisRef','catalogViewId','programRef','catalogHandle','graphFunctionRef','selectedDefinitionRef','inputContractRef','inputContractOwner',
    'outputContractRef','outputContractOwner','productExecutionResolutionRef','programValidationRef','policyRef','authorityRef','actorRef']
    .map(key=>[key,`fixture://${key}`]));
  Object.assign(invocation,Object.fromEntries(['invocationDigest','rawInputDigest','publicRequestDigest','workspaceBindingDigest','catalogBasisDigest',
    'catalogViewDigest','programDigest','graphFunctionDigest','selectedDefinitionDigest','inputContractDigest','outputContractDigest',
    'productExecutionResolutionDigest','programValidationDigest','policyDigest','authorityDigest'].map(key=>[key,digest(key)])),
    {invocationVariant:'direct',workspaceId:env.workspaceBinding.workspaceId,workspaceBindingId:env.workspaceBinding.bindingId,
      workspaceBindingDigest:env.workspaceBinding.bindingDigest,catalogApplicationRefs:[],catalogApplicationDigests:[],
      gtlEntryCoordinate:{},gtlEntryTerm:{},capabilityGrants:[env.capabilityGrant],capabilityGrantRefs:[env.capabilityGrant.grantRef],
      actorRef:env.capabilityGrant.actorRef,publicStart:{},reentryBasis:null,sourceResultBasis:null});
  const invDigest=product.sha256Canonical(invocation),invRef=`invocation-admission://abiogenesis/${invDigest.slice(7)}`;
  const pub=append({kind:'public_operation_admitted',aggregateType:'workspace',aggregateId:env.workspaceBinding.bindingId,
    parentAggregateId:invocation.invocationRef,scopeClass:'workspace',basisId:invocation.authorityRef,
    payload:{...invocation,operationId:'abg.operation.run.invoke',memberKey:'invoke',definitionDigest:digest('selected-definition'),variant:'direct'}});
  append({kind:'invocation_admitted',aggregateType:'workspace',aggregateId:env.workspaceBinding.bindingId,parentAggregateId:invocation.invocationRef,
    scopeClass:'workspace',basisId:invRef,causationEventRefs:[pub.eventId],payload:{...invocation,invocationAdmissionRef:invRef,invocationAdmissionDigest:invDigest}});
  for(const rawInputValue of requests)append({kind:'basis_admitted',aggregateType:'workspace',aggregateId:env.workspaceBinding.bindingId,
    payload:{rawInputValue,invocationAdmissionRef:invRef,basisClass:'root',graphFunctionRef:invocation.graphFunctionRef,
      workspaceBindingId:env.workspaceBinding.bindingId,workspaceBindingDigest:env.workspaceBinding.bindingDigest,
      actorRef:env.capabilityGrant.actorRef,programRef:invocation.programRef}});
  const {kind:bk,schemaVersion:bs,disposition:bd,basisRef:br,basisDigest:bh,admissionEventRef:be,...basisBody}=authority.executionBasis;
  Object.assign(basisBody,{invocationAdmissionRef:invRef,rawInputValue:env.task,rawInputDigest:product.sha256Canonical(env.task),
    graphFunctionRef:ids.graphFunctionRef,implementationSetRef:set.implementationSetRef,implementationSetDigest:set.implementationSetDigest});
  const bDigest=product.sha256Canonical(basisBody);basisId=`execution-basis://abiogenesis/${bDigest.slice(7)}`;
  const basis={kind:bk,schemaVersion:bs,disposition:bd,...basisBody,basisRef:basisId,basisDigest:bDigest};
  append({kind:'basis_admitted',aggregateType:'workspace',aggregateId:env.workspaceBinding.bindingId,payload:{...basisBody,basisRef:basisId,basisDigest:bDigest}});
  const call={...p.call,basisId,runId,graphCallId,frameId}, cCallRef=call.cCallRef;
  const opened=append({kind:'c_call_opened',aggregateType:'c_call',aggregateId:cCallRef,payload:{callClass:'leaf',cCallRef,programLocusRef:call.programLocusRef,
    taskOrdinal:call.taskOrdinal,vectorIndex:call.vectorIndex,edgeRef:call.edgeRef??null,attempt:call.attempt}});
  const fibre=append({kind:'c_call_fibre_selected',aggregateType:'c_call',aggregateId:cCallRef,causationEventRefs:[opened.eventId],payload:{callClass:'leaf',regime:'F_P',
    implementationRef:ids.implementationRef,implementationBindingRef:ids.implementationBindingRef}});
  call.fibreSelectedEventRef=fibre.eventId;
  // These rows' common graph coordinate follows the admitted native basis.
  for(let i=rows.length-3;i<rows.length;i++) rows[i]=deepFreeze({...rows[i],graphFunctionRef:ids.graphFunctionRef});
  const preparedPrefix=selectValidatedRuntimeEventPrefix(deepFreeze([...rows]));
  assert.ok(projectExactExecutionBasisAtPrefix(preparedPrefix,basisId),'fixture authenticates its exact native task basis before process launch');
  assert.ok(projectExactInvocationAdmissionAtPrefix(preparedPrefix,invRef),'fixture authenticates its controlled invocation/grant before process launch');
  assert.ok(rehydrateAdmittedImplementationSetAtPrefix(preparedPrefix,set.implementationSetRef),'fixture authenticates the implementation set before process launch');
  const beforeCurrentness=deriveRuntimeEventCalculusProjection(preparedPrefix);
  for(const request of requests)assert.equal(holdsAt(beforeCurrentness,constructRuntimeFluent({name:'worksite_observation_current',identity:request.predecessorObservation.observationRef})),true,
    'prior C0 observation is current before the native physical effect');
  const actorPath=resolve(import.meta.dirname,'../../build/code/src/abg/actor_process.js');
  const worker=join(env.scratch,'conflicting-native.mjs');await fs.writeFile(worker,'');await fs.chmod(worker,0o755);
  const transport=await import('../../build/code/src/abg/worker_transport.js');
  let groupConfirmedBeforeConflict=false,currentProfileArtifactHook=false;
  const prefixAt=()=>deepFreeze({coordinateDigest:digest(String(rows.length)),storeIdentity:{eventContractDigest:ROOT_EVENT_CONTRACT_DIGEST}});
  let currentPrefix=prefixAt();
  const overrides={
    './environment_admission.js':{hasAdmittedWorkspaceBinding:()=>true},
    './execution_basis.js':{authenticateNativeInstructionAssemblyBasis:()=>({call,execution:basis,inputDigest:basis.rawInputDigest,inputValue:env.task})},
    './invocation_admission.js':{rehydrateInvocationAdmissionAtPrefix:()=>null},
    './runtime_liveness.js':{captureNativeFrameBoundary:()=>({}),observeNativeFrameLiveness:()=>{},
      admitRuntimeActivityProbe:input=>({successorPrefix:currentPrefix,value:rows.find(row=>row.eventId===input.observation.underlyingEventRef)??rows.at(-1)})},
    './event_store.js':{readRuntimeEventsAtDurablePrefix:()=>deepFreeze([...rows]),assertHeldEventStoreAtDurablePrefix:()=>{},admitRuntimeEvent:(_store,candidate)=>append(candidate),
      admitNonEmptyRuntimeEventTransactionAtDurablePrefix:(_store,_prefix,fn)=>{const value=fn();currentPrefix=prefixAt();return{value,successorPrefix:currentPrefix};}},
    './worker_transport.js':{prepareWorkerTransport:async input=>{
      const plan=await transport.prepareWorkerTransport(input);
      await fs.writeFile(worker,`#!${process.execPath}\nimport {writeFileSync} from 'node:fs';\nwriteFileSync(${JSON.stringify(join(env.canonicalRoot,'target.txt'))},'partial native work\\n');\nwriteFileSync(${JSON.stringify(plan.paths.output)},JSON.stringify({summary:'file channel',gaps:[]}));\nconsole.log(JSON.stringify({type:'result',subtype:'success',is_error:false,structured_output:{summary:'stdout channel',gaps:[]}}));\n`);
      assert.equal(plan.args.includes('--json-schema'),true,'ordinary native work selects structured_output mode');
      return plan;
    },runPreparedWorkerTransport:async(plan,observer)=>{
      currentProfileArtifactHook=typeof observer.assessNativeResultArtifact==='function';
      try{return await transport.runPreparedWorkerTransport(plan,observer);}
      catch(error){groupConfirmedBeforeConflict=rows.some(row=>row.kind==='actor_process_exited'&&row.payload.status===0)&&
        !rows.some(row=>row.kind==='actor_process_termination_unconfirmed');throw error;}
    }},
  };
  const actor=new SourceTextModule((await fs.readFile(actorPath,'utf8'))+'\nexport {invokeActorProcessWithAssembly};',{identifier:actorPath});
  await actor.link(async specifier=>{const imported=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(actorPath),specifier)).href);
    const values={...imported,...overrides[specifier]};return new SyntheticModule(Object.keys(values),function(){for(const[name,value]of Object.entries(values))this.setExport(name,value);});});
  await actor.evaluate();
  const request={...p.request,actorRef:env.capabilityGrant.actorRef,workerBindingRef:'worker-binding://native-tail',materializationPlanRef:'plan://native-tail',rendererRef:'renderer://native-tail',
    instructionContractRef:ids.taskContractRef,prompt:'Perform only the bounded local edit.'};
  const oldCommand=process.env.ABG_TS_CLAUDE_COMMAND;process.env.ABG_TS_CLAUDE_COMMAND=worker;
  t.after(()=>{if(oldCommand===undefined)delete process.env.ABG_TS_CLAUDE_COMMAND;else process.env.ABG_TS_CLAUDE_COMMAND=oldCommand;});
  const effect=await actor.namespace.invokeActorProcessWithAssembly({store:{readAll:()=>deepFreeze([...rows])},predecessorPrefix:currentPrefix,executionBasis:basis,
    scope:{runId,graphCallId,frameId},cCall:call,expectedInputDigest:basis.rawInputDigest,occurrence:{...call,nativeInstructionAssemblyBasis:{}},
    workerContracts:{instructionContractRef:ids.taskContractRef,resultContractRef:ids.workerReportContractRef},runtime:{workspaceBinding:env.workspaceBinding,artifactTruth:{}},
    request,dispatchOrdinal:1,basis:{correlationId:'native-tail'}},{request});
  assert.equal(effect.kind,'actor_process_effect_refusal');assert.match(effect.message,/distinct worker output channels disagree/);
  assert.equal(currentProfileArtifactHook,true,'the actual ActorProcess current-profile path supplies channel assessment');
  assert.equal(groupConfirmedBeforeConflict,true,'healthy group confirmation precedes post-process channel parsing');
  assert.equal(await fs.readFile(join(env.canonicalRoot,'target.txt'),'utf8'),'partial native work\n');
  const failed=rows.find(row=>row.kind==='actor_invocation_failed');assert.equal(failed.payload.failureClass,'transport_exception');
  assert.equal(rows.some(row=>row.kind==='c_call_result_admitted'),false,'no exchange or native Result is fabricated');
  const prior=deepFreeze(rows.filter(row=>row.admissionOrdinal<failed.admissionOrdinal));
  assert.deepEqual(projectNativeWorkRetiredObservations(failed,prior),[requests[0].predecessorObservation.observationRef]);
  const cold=selectValidatedRuntimeEventPrefix(deepFreeze(JSON.parse(JSON.stringify(rows))));
  const projected=deriveRuntimeEventCalculusProjection(cold);
  assert.equal(holdsAt(projected,constructRuntimeFluent({name:'worksite_observation_current',identity:requests[0].predecessorObservation.observationRef})),false);
  for(const request of requests.slice(1))assert.equal(holdsAt(projected,constructRuntimeFluent({name:'worksite_observation_current',identity:request.predecessorObservation.observationRef})),true);
  for(const kind of ['actor_process_started','actor_transport_binding_admitted','invocation_admitted','c_call_fibre_selected'])
    assert.deepEqual(projectNativeWorkRetiredObservations(failed,prior.filter(row=>row.kind!==kind)),[],kind);
  assert.deepEqual(projectNativeWorkRetiredObservations({...failed,runId:'run://foreign'},prior),[]);
  t.diagnostic('Actual local process/group completion, supported structured_output/file conflict and partial file effects; lower installation/admission recording and liveness admission are controlled doubles. Exact liveness context and cold basis/invocation/implementation/currentness owners exercised; no probe, assessment, full native/Public admission or UAT credit.');
});
async function fixture(t, writeRoots = ['target.txt']) {
  const env = await worksiteFixture(product);
  t.after(() => fs.rm(env.scratch, {recursive:true, force:true}));
  await fs.writeFile(join(env.canonicalRoot,'target.txt'),'before\n');
  await fs.writeFile(join(env.canonicalRoot,'keep.txt'),'unchanged\n');
  const read = {workspaceAuthorityBasis:env.workspaceAuthorityBasis, workspaceBinding:env.workspaceBinding,
    readRoots:['.'], maxFiles:20, maxBytes:10000};
  const context = await product.observeWorksiteContext(read);
  const task = native.constructNativeWorkspaceWorkTask({workspaceAuthorityBasis:env.workspaceAuthorityBasis, workspaceBinding:env.workspaceBinding,
    capabilityGrant:env.capabilityGrant, context, outcome:'Perform the declared local work', instructions:['Read the selected input.'],
    readFirst:['target.txt'],writeRoots,checks:[]});
  return {...env,read,task};
}
// These are cold owner coordinates, not ABG admission or installed/native proof.
async function prepare(t, env) {
  const graphFunctionRef = native.nativeWorkspaceWorkGraphFunctionRef(env.task);
  const sink = await acquireNewEmptyAppendSinkFixture(t, createNewEmptyAppendSink);
  const {kind,schemaVersion,disposition,leafResolutionCandidateRef,leafResolutionCandidateDigest,...oldBody}=env.implementationSet.rows[0];
  const body={...oldBody, publicationDigest:product.sha256Canonical(publication),graphFunctionRef,
    computeRegime:'F_P',implementationRef:ids.implementationRef,implementationBindingRef:ids.implementationBindingRef,
    inputContractRef:ids.taskContractRef,outputContractRef:ids.observationContractRef,failureContractRef:ids.failureContractRef,
    refusalContractRef:ids.refusalContractRef};
  const rd=product.sha256Canonical(body);
  const row={kind,schemaVersion,disposition,leafResolutionCandidateRef:`leaf-resolution-candidate://abiogenesis/${rd.slice(7)}`,leafResolutionCandidateDigest:rd,...body};
  const sd=product.sha256Canonical({rows:[row]});
  const set={...env.implementationSet,rows:[row],implementationSetRef:`implementation-set://abiogenesis/${sd.slice(7)}`,implementationSetDigest:sd};
  const execution={...env.executionBasis,programRef:ids.programRef,graphFunctionRef,
    rawInputValue:env.task,rawInputDigest:product.sha256Canonical(env.task),implementationSetRef:set.implementationSetRef,implementationSetDigest:sd};
  const call={...env.cCall,runId:'run://native-owner/test',regime:'F_P',graphFunctionRef,
    inputContractRef:ids.taskContractRef,outputContractRef:ids.observationContractRef,failureContractRef:ids.failureContractRef,
    refusalContractRef:ids.refusalContractRef,implementationSetRef:set.implementationSetRef,
    implementationRef:ids.implementationRef,implementationBindingRef:ids.implementationBindingRef};
  const resolutionDigest=product.sha256Canonical(row);
  const authority=constructLeafExecutionAuthority({actorRef:execution.actorRef,workspaceBinding:env.workspaceBinding,
    workspaceBindingIdentity:env.workspaceBinding.bindingId,workspaceBindingDigest:env.workspaceBinding.bindingDigest,
    executionBasis:execution,executionBasisRef:execution.basisRef,executionBasisDigest:execution.basisDigest,
    programRef:execution.programRef,programDigest:execution.programDigest,programPublication:publication,
    graphFunctionRef,graphFunctionDigest:execution.graphFunctionDigest,cCall:call,cCallRef:call.cCallRef,cCallDigest:call.cCallDigest,
    predecessorPrefix:sink.prefix,implementationSet:set,implementationSetRef:set.implementationSetRef,implementationSetDigest:sd,
    leafResolutionCandidateRef:row.leafResolutionCandidateRef,leafResolutionCandidateDigest:rd,
    implementationResolution:row,implementationResolutionRef:`implementation-resolution://abiogenesis/${resolutionDigest.slice(7)}`,implementationResolutionDigest:resolutionDigest,
    implementationBindingRef:row.implementationBindingRef,implementationBindingDigest:row.implementationBindingDigest,
    implementationRef:row.implementationRef,implementationOwnerRef:row.implementationOwnerProductId,
    effectUri:ids.effectUri,handlerRef:ids.handlerRef,handlerDigest:native.NATIVE_WORKSPACE_WORK_HANDLER_DIGEST,
    capabilityGrantRef:env.capabilityGrant.grantRef,capabilityGrantDigest:env.capabilityGrant.grantDigest});
  const request={implementationRef:ids.implementationRef,inputDigest:product.sha256Canonical(env.task),transportLane:'worker_executes',
    resultContractRef:native.nativeWorkspaceWorkResultContractRef(env.task),responseJsonSchema:native.nativeWorkspaceWorkResponseSchema(env.task),
    ...(env.task.assessment===undefined?{}:{responsePresentation:'result_text'})};
  const occurrence={...call,executionAuthority:authority};
  const prepared=await realizeNativeWorkspaceWork(env.task,occurrence,()=>({request}));
  const exchange=(finalOutput,disposition='success')=>({request,observation:{implementationRef:ids.implementationRef,
    inputDigest:request.inputDigest,transportLane:'worker_executes',actorInvocationRef:'actor-invocation://native-owner/test',
    transportBindingRef:'transport-binding://native-owner/test',transportBindingDigest:digest('transport-binding'),
    promptDigest:digest('prompt'),transportDigest:digest('transport'),finalOutput,disposition,
    failureClass:disposition==='success'?null:'absolute_timeout'}});
  return {prepared,exchange,occurrence,request,call};
}
test('native work publishes one ordinary callable effect with run and child closure',()=>{
  assert.equal(rawAdmitValue(publication,'module_publication','contract://abiogenesis/gtl/module-publication@5').kind,'raw_admitted_value');
  assert.deepEqual(publication.graphFunctions[0].effects,[ids.effectUri]);
  assert.equal(publication.closureContracts.find(x=>x.closureContractRef===ids.childClosureContractRef).closureScope,'graph_call');
  assert.equal(publication.implementationBindings[0].computeRegime,'F_P');
});
test('native task conserves read-only scope and refuses malformed or wider input',async t=>{
  const env=await fixture(t,[]);
  assert.equal(native.isNativeWorkspaceWorkTask(env.task),true);
  assert.deepEqual(env.task.writeRoots,[]);
  for(const patch of [{writeRoots:['../outside']},{readFirst:['missing']},{workspaceBinding:null},{context:{...env.task.context,maxBytes:1}}])
    assert.equal(native.isNativeWorkspaceWorkTask({...env.task,...patch}),false);
  const scoped=await product.observeWorksiteContext({...env.read,readRoots:['target.txt']});
  assert.equal(native.isNativeWorkspaceWorkTask({...env.task,context:scoped,writeRoots:['keep.txt']}),false);
});
test('owner refuses stale context before assembly/dispatch',async t=>{
  const env=await fixture(t);const p=await prepare(t,env);
  await fs.writeFile(join(env.canonicalRoot,'target.txt'),'outside change\n');let calls=0;
  await assert.rejects(realizeNativeWorkspaceWork(env.task,p.occurrence,()=>{calls++;return {request:p.request};}),/stale/);
  assert.equal(calls,0);
  await assert.rejects(realizeNativeWorkspaceWork(env.task,{...p.occurrence,executionAuthority:null},()=>({request:p.request})),/authority/);
});
test('actual observation remains independent of report and consumer judgment',async t=>{
  const env=await fixture(t);const p=await prepare(t,env);
  await fs.writeFile(join(env.canonicalRoot,'target.txt'),'actual edit\n');
  const exchange=p.exchange(JSON.stringify({summary:'I made no changes',gaps:['consumer assessment remains']}));
  const result=await p.prepared.complete(exchange);const value=result.resultCandidate;
  assert.equal(result.disposition,'success');assert.deepEqual(value.changedPaths,['target.txt']);
  assert.equal(native.isNativeWorkspaceWorkObservation(value),true);
  assert.equal(native.nativeWorkspaceWorkResultMatches(env.task,value,p.call.cCallRef,exchange.observation),true);
  assert.equal(native.resolveNativeWorkspaceWorkJudgmentRelation(ids.judgmentPredicateRef).evaluate(env.task,value),true);
  assert.equal(semantics.validateResultEvidenceLineage({outputContractRef:ids.observationContractRef,value,admittedEvidence:[{
    evidenceClass:'probabilistic_transport',cCallRef:p.call.cCallRef,transportDigest:value.provenance.transportDigest,outputDigest:product.sha256Canonical(value)}]}),true);
  assert.equal(native.isNativeWorkspaceWorkObservation({...value,changedPaths:[]}),false);
});
for (const mode of ['timeout','malformed-report','read-only-change']) test(`native ${mode} retains actual partial edit and refuses success`,async t=>{
  const env=await fixture(t,mode==='read-only-change'?[]:['target.txt']);const p=await prepare(t,env);
  await fs.writeFile(join(env.canonicalRoot,'target.txt'),'partial edit\n');
  const exchange=p.exchange(mode==='malformed-report'?' {"summary":"x","summary":"forged","gaps":[]}':JSON.stringify({summary:'partial',gaps:[]}),mode==='timeout'?'failure':'success');
  const result=await p.prepared.complete(exchange);const value=result.resultCandidate;
  assert.equal(result.disposition,'failure');assert.deepEqual(value.changedPaths,['target.txt']);
  assert.equal(value.failureClass,mode==='timeout'?'absolute_timeout':mode==='malformed-report'?'result_contract_failure':'write_scope_violation');
  assert.equal(native.isNativeWorkspaceWorkFailure(value),true);
  assert.equal(native.nativeWorkspaceWorkResultMatches(env.task,value,p.call.cCallRef,exchange.observation),true);
  assert.equal(native.resolveNativeWorkspaceWorkJudgmentRelation(ids.judgmentPredicateRef).evaluate(env.task,value),false);
  assert.equal(await fs.readFile(join(env.canonicalRoot,'target.txt'),'utf8'),'partial edit\n');
  if(mode==='malformed-report') {
    const request={...p.request,actorRef:ids.workerActorRef,workerBindingRef:ids.workerBindingRef,
      materializationPlanRef:ids.materializationPlanRef,rendererRef:ids.rendererRef,instructionContractRef:ids.taskContractRef,prompt:'declared local work'};
    const outputDigest=product.sha256Bytes(exchange.observation.finalOutput),promptDigest=product.sha256Canonical(request.prompt);
    const observation={...exchange.observation,actorRef:request.actorRef,workerBindingRef:request.workerBindingRef,
      materializationPlanRef:request.materializationPlanRef,rendererRef:request.rendererRef,instructionContractRef:request.instructionContractRef,
      resultContractRef:request.resultContractRef,processRef:'process://native-owner/test',observedOutputDigest:outputDigest,promptDigest,
      processStatus:0,processSignal:null,timeoutClass:null,timedOut:false,exitObserved:true,terminationConfirmed:true,signalSequence:[],
      structuredEventCount:1,progressEventCount:1,toolCallCount:0,toolInvocations:[],apiRetryCount:0,
      stdoutByteLength:exchange.observation.finalOutput.length,stderrByteLength:0,
      artifactDigests:{output:outputDigest,prompt:product.sha256Bytes(request.prompt),stdout:digest('stdout'),stderr:digest('stderr'),transport:exchange.observation.transportDigest}};
    assert.equal(validateActorProcessCarrierPair(request,observation).kind,'actor_process_carrier_validation');
    const evidence=deriveProbabilisticTransportEvidence(p.call,request,observation,null,value,ids.taskContractRef,ids.workerReportContractRef);
    assert.equal(evidence.outputDigest,product.sha256Canonical(value));
    assert.equal(evidence.transportDisposition,'success','native exit remains successful; the report/result failure is separate');
    assert.equal(evidence.candidateRef,null,'malformed raw report is never admitted as a candidate');
    assert.throws(()=>deriveProbabilisticTransportEvidence({...p.call,implementationRef:'implementation://unrelated'},
      {...request,implementationRef:'implementation://unrelated'},{...observation,implementationRef:'implementation://unrelated'},null,value,ids.taskContractRef,ids.workerReportContractRef),/F04-A/);
  }
});
test('read-only native assessment returns observed assets and an empty change set',async t=>{
  const env=await fixture(t,[]);const p=await prepare(t,env);
  const result=await p.prepared.complete(p.exchange(JSON.stringify({summary:'reviewed',gaps:['semantic gap']})));
  assert.equal(result.disposition,'success');assert.deepEqual(result.resultCandidate.changedPaths,[]);
  assert.equal(result.resultCandidate.report.gaps.length,1,'gaps do not select the consumer consequence');
});
test('unavailable after observation retains unknown and original native failure',async t=>{
  const env=await fixture(t);const p=await prepare(t,env);
  await fs.writeFile(join(env.canonicalRoot,'target.txt'),'x'.repeat(10001));
  const result=await p.prepared.complete(p.exchange('', 'failure'));
  assert.equal(result.disposition,'failure');assert.equal(result.resultCandidate.failureClass,'absolute_timeout');
  assert.equal(result.resultCandidate.after,null);assert.equal(result.resultCandidate.changedPaths,null);
  assert.equal(result.resultCandidate.observationFailure.kind,'worksite_effect_refusal');
});
test('unknown native after-state retires only potentially writable C0 facts',async t=>{
  const paths=['target.txt','nested/file.txt','nested/absent.txt','keep.txt','nested-peer.txt','absent.txt'];
  const cases=[
    {name:'unknown exact and subtree',roots:['target.txt','nested'],unknown:true,retired:paths.slice(0,3)},
    {name:'unknown whole root',roots:['.'],unknown:true,retired:paths},
    {name:'unknown read-only',roots:[],unknown:true,retired:[]},
    {name:'known exact change within wider scope',roots:['.'],unknown:false,retired:['target.txt']},
  ];
  for(const scenario of cases) await t.test(scenario.name,async t=>{
    const env=await fixture(t,scenario.roots);
    await fs.mkdir(join(env.canonicalRoot,'nested'));
    await fs.writeFile(join(env.canonicalRoot,'nested/file.txt'),'nested\n');
    await fs.writeFile(join(env.canonicalRoot,'nested-peer.txt'),'peer\n');
    env.task=native.constructNativeWorkspaceWorkTask({...env.task,context:await product.observeWorksiteContext(env.read)});
    const requests=await Promise.all(paths.map(async relativePath=>{
      const subject=product.constructWorksiteSubject({...env.read,relativePath,subjectUri:pathToFileURL(join(env.canonicalRoot,relativePath)).href});
      const predecessorObservation=await product.observeWorksiteSubject(env.workspaceAuthorityBasis,env.workspaceBinding,subject);
      return product.constructWorksiteFileReplaceRequest({...env.read,capabilityGrant:env.capabilityGrant,subject,territory:env.territory,
        predecessorObservation,replacementBytes:Buffer.from('future\n')});
    }));
    assert.ok(requests.every(product.isWorksiteFileReplaceRequest));
    const p=await prepare(t,env);
    assert.equal((await fs.stat(join(env.canonicalRoot,'target.txt'))).size,7);
    // Actual local owner reobservation; transport timeout is an explicit fixture input, not a paid actor.
    // The read-only row deliberately models an unobserved out-of-scope edit; empty declared scope grants no retirement.
    await fs.writeFile(join(env.canonicalRoot,'target.txt'),scenario.unknown?'x'.repeat(10001):'partial\n');
    const exchange=p.exchange('', 'failure'),result=await p.prepared.complete(exchange),value=result.resultCandidate;
    assert.equal(result.disposition,'failure');assert.equal(value.failureClass,'absolute_timeout');
    assert.ok(native.isNativeWorkspaceWorkFailure(value));
    assert.ok(native.nativeWorkspaceWorkResultMatches(env.task,value,p.call.cCallRef,exchange.observation));
    assert.equal(value.after===null,scenario.unknown);
    assert.deepEqual(value.changedPaths,scenario.unknown?null:['target.txt']);
    if(scenario.unknown) assert.equal(value.observationFailure.kind,'worksite_effect_refusal');
    const event={kind:'c_call_result_admitted',aggregateId:p.call.cCallRef,payload:{resultClass:'failure',value,
      contractRef:ids.failureContractRef,valueDigest:product.sha256Canonical(value),evidenceRefs:['evidence://test/unknown-native']}};
    // Existing projection boundary: supplied admitted request/evidence rows; no runtime admission is claimed.
    const prior=requests.map(rawInputValue=>({kind:'basis_admitted',payload:{rawInputValue}}));
    prior.push({kind:'c_call_evidenced',aggregateId:p.call.cCallRef,payload:{evidenceRef:'evidence://test/unknown-native',
      evidenceClass:'probabilistic_transport',implementationRef:ids.implementationRef,transportDigest:value.provenance.transportDigest,
      outputDigest:event.payload.valueDigest}});
    const expected=requests.filter(r=>scenario.retired.includes(r.subject.relativePath)).map(r=>r.predecessorObservation.observationRef);
    assert.deepEqual(projectNativeWorkRetiredObservations(event,prior),expected);
    const effect=eventCalculusEffect(event,prior);
    assert.deepEqual(effect.terminates.filter(f=>f.name==='worksite_observation_current').map(f=>f.identity),expected);
    assert.deepEqual(effect.initiates.filter(f=>f.name==='worksite_observation_current'),[],'no successor currentness is invented');
    for(const patch of [{evidenceRefs:[]},{contractRef:ids.observationContractRef},{valueDigest:digest('crossed-output')}])
      assert.deepEqual(projectNativeWorkRetiredObservations({...event,payload:{...event.payload,...patch}},prior),[]);
    assert.deepEqual(projectNativeWorkRetiredObservations({...event,aggregateId:'c-call:foreign'},prior),[]);
    assert.deepEqual(projectNativeWorkRetiredObservations(event,prior.slice(0,-1)),[]);
    const retainedFailure={...value,failureCandidateDigest:event.payload.valueDigest,
      failureSignalRef:'failure-signal://test/unknown-native',failureSourceRef:'evidence://test/unknown-native'};
    assert.deepEqual(projectNativeWorkRetiredObservations({...event,payload:{...event.payload,value:retainedFailure,
      valueDigest:product.sha256Canonical(retainedFailure)}},prior),expected,'retry envelope retains its original candidate evidence');
  });
});
test('observed partial failure retires touched C0 facts but preserves unchanged and absent paths',async t=>{
  const env=await fixture(t);const p=await prepare(t,env);
  const requestFor=async relativePath=>{
    const subject=product.constructWorksiteSubject({...env.read,relativePath,subjectUri:pathToFileURL(join(env.canonicalRoot,relativePath)).href});
    const predecessorObservation=await product.observeWorksiteSubject(env.workspaceAuthorityBasis,env.workspaceBinding,subject);
    return product.constructWorksiteFileReplaceRequest({...env.read,capabilityGrant:env.capabilityGrant,subject,territory:env.territory,
      predecessorObservation,replacementBytes:Buffer.from('future\n')});
  };
  const requests=await Promise.all(['target.txt','keep.txt','absent.txt'].map(requestFor));
  assert.ok(requests.every(product.isWorksiteFileReplaceRequest));
  await fs.writeFile(join(env.canonicalRoot,'target.txt'),'partial\n');
  const value=(await p.prepared.complete(p.exchange('malformed'))).resultCandidate;
  const event={kind:'c_call_result_admitted',aggregateId:p.call.cCallRef,payload:{value,contractRef:ids.failureContractRef,
    valueDigest:product.sha256Canonical(value),evidenceRefs:['evidence://test/native']}};
  const prior=requests.map(rawInputValue=>({kind:'basis_admitted',payload:{rawInputValue}}));
  prior.push({kind:'c_call_evidenced',aggregateId:p.call.cCallRef,payload:{evidenceRef:'evidence://test/native',
    evidenceClass:'probabilistic_transport',implementationRef:ids.implementationRef,transportDigest:value.provenance.transportDigest,
    outputDigest:event.payload.valueDigest}});
  assert.deepEqual(projectNativeWorkRetiredObservations(event,prior),[requests[0].predecessorObservation.observationRef]);
  const retainedFailure={...value,failureCandidateDigest:event.payload.valueDigest,
    failureSignalRef:'failure-signal://test/native',failureSourceRef:'evidence://test/native'};
  assert.deepEqual(projectNativeWorkRetiredObservations({...event,payload:{...event.payload,
    value:retainedFailure,valueDigest:product.sha256Canonical(retainedFailure)}},prior),[requests[0].predecessorObservation.observationRef]);
  assert.deepEqual(projectNativeWorkRetiredObservations({...event,payload:{...event.payload,evidenceRefs:[]}},prior),[]);
});

// The artifact owns publication identity; this assertion uses its actual built
// manifest rather than repeating a constructor-specific identity formula.
test('native publication agrees with actual generated artifact manifest identity',async()=>{
  const manifest=JSON.parse(await fs.readFile(new URL('../../product-toolchain-manifest.json',import.meta.url),'utf8'));
  const {modulePublicationSemanticDigest}=await import('../../build/code/src/product/index.js');
  const actual=constructNativeWorkspaceWorkModulePublication({productId:manifest.productId,
    artifactDigest:digest('unpacked-build-artifact-coordinate'),productContentDigest:manifest.productContentDigest,
    productManifestDigest:product.sha256Canonical(manifest),packageName:manifest.packageName,packageVersion:manifest.packageVersion});
  assert.equal(actual.owningProductId,manifest.productId);
  assert.equal(actual.productContentDigest,manifest.productContentDigest);
  assert.equal(actual.productManifestDigest,product.sha256Canonical(manifest));
  assert.equal(actual.descriptorRef,manifest.descriptorRef);
  assert.equal(actual.contributionManifestRef,manifest.contributionManifestRef);
  assert.equal(actual.contributionManifestRef,manifest.contributionManifest.contributionManifestRef);
  const binding=manifest.contributionManifest.publicationBindings.find(row=>row.moduleRef===actual.moduleRef);
  assert.ok(binding,'actual manifest must publish this module');
  assert.equal(modulePublicationSemanticDigest(actual),binding.publicationDigest);
});

test('native implementation without physical authority refuses before loading', async t => {
  const { invokeLeafOwnerBoundary } = await import('../../build/code/src/implementation/leaf_invocation_port.js');
  const env = await fixture(t); const p = await prepare(t, env);
  let loads = 0;
  const result = await invokeLeafOwnerBoundary({
    resolution: p.occurrence.executionAuthority.implementationResolution,
    value: env.task, inputDigest: product.sha256Canonical(env.task), failureValueKind: 'native_workspace_work_failure',
    verifyAuthority: () => true, validateSuccess: () => false, resolveWorkerContracts: () => null,
    occurrence: { ...p.occurrence, executionAuthority: null },
    loadImplementation: async () => { loads++; throw new Error('must not load'); },
  });
  assert.equal(result.candidate.disposition, 'failure');
  assert.equal(result.ownerObservation.stage, 'authority_verification');
  assert.equal(result.ownerObservation.reason, 'refused');
  assert.equal(loads, 0);
});

const retainedNativeRoot = process.env.ABI5_NATIVE_WORK_RETAINED_ROOT;
test('admitted pure consumer evaluates a native task as data without physical authority', {
  skip: !retainedNativeRoot && 'requires the retained installed consumer first-leaf failure',
}, async () => {
  const abg = await import('../../build/code/src/abg/index.js');
  const productOwner = await import('../../build/code/src/product/index.js');
  const gtl = await import('../../build/code/src/gtl/index.js');
  const { deepFreeze } = await import('../../build/code/src/shared/immutable.js');
  const { reconstructHistoricalDeclarationCatalog } = await import('../../build/code/src/product/declaration_closure.js');
  const { constructAdmittedLeafInvocationPort } = await import('../../build/code/src/implementation/leaf_invocation_port.js');
  const { projectOpenedCCallCarrierAtPrefix } = await import('../../build/code/src/abg/c_call.js');
  const start = JSON.parse(await fs.readFile(join(retainedNativeRoot, 'run-start.jsonl'), 'utf8')).invocation;
  const receipt = JSON.parse(await fs.readFile(join(retainedNativeRoot, 'native-stdout.json'), 'utf8')).receipt;
  const events = abg.readRuntimeEventsAtDurablePrefix(receipt.resources.eventResource.closeHandoff.prefix);
  const prefix = abg.selectValidatedRuntimeEventPrefix(events);
  const opened = events.find(event => event.kind === 'c_call_opened');
  assert.ok(opened);
  const basis = abg.rehydrateExecutionBasisAtPrefix(prefix, opened.basisId);
  assert.ok(basis);
  assert.equal(native.isNativeWorkspaceWorkTask(basis.rawInputValue), true);
  const implementationSet = abg.rehydrateAdmittedImplementationSetAtPrefix(prefix, basis.implementationSetRef);
  const W = basis.rawInputValue.workspaceBinding;
  const environment = abg.projectExactPrefixWorkspaceEnvironment(start.resources.eventResource.closeHandoff.prefix,
    { ref: W.bindingId, digest: W.bindingDigest });
  assert.equal(environment.kind, 'exact_prefix_workspace_environment');
  const supplied = { catalog: start.resources.catalog, catalogView: start.resources.catalogView };
  const { catalog, catalogView } = reconstructHistoricalDeclarationCatalog(supplied, supplied.catalog.readinessBasis);
  const loaded = await productOwner.ProductExecutionResolutionPort.resolve({
    catalog, catalogView, admittedInstalls: environment.productInstalls,
    verifyInstallAdmission: install => abg.hasAdmittedProductInstall(environment.artifactTruth, install),
    programRef: basis.programRef,
    selection: { kind: 'start', scope: 'program', target: 'next', until: 'converged', rootMode: 'direct' },
  });
  assert.equal(loaded.kind, 'loaded_product_execution_resolution');
  const cursor = events.find(event => event.kind === 'traversal_cursor_entered' && event.basisId === basis.basisRef);
  const graph = gtl.materializeGraph(loaded.graphFunction, { invocationAdmissionRef: basis.invocationAdmissionRef,
    admittedInputRef: cursor.payload.inputRef, admittedInputDigest: basis.rawInputDigest, admittedInput: basis.rawInputValue });
  const cCall = projectOpenedCCallCarrierAtPrefix(prefix, graph, opened.aggregateId);
  assert.ok(cCall);
  const resolution = abg.selectAdmittedImplementationResolution(implementationSet, {
    graphFunctionRef: cCall.graphFunctionRef, nodeRef: graph.template.startNodeRef,
    programLocusRef: cCall.programLocusRef, implementationBindingRef: cCall.implementationBindingRef,
  });
  assert.ok(resolution);
  assert.equal(resolution.computeRegime, 'F_D');
  assert.notEqual(resolution.implementationRef, ids.implementationRef);
  const port = await constructAdmittedLeafInvocationPort({ prefix, artifactTruth: environment.artifactTruth,
    implementationSet, executionResolution: loaded,
    semanticsProjection: productOwner.projectInstalledLeafSemantics(loaded.productSemantics) });
  const occurrence = deepFreeze({ cCallRef: cCall.cCallRef, runId: cCall.runId, graphCallId: cCall.graphCallId,
    frameId: cCall.frameId, programLocusRef: cCall.programLocusRef, taskOrdinal: cCall.taskOrdinal,
    attempt: cCall.attempt, executionAuthority: null });
  const result = await port.invoke({ resolution, input: basis.rawInputValue, inputDigest: basis.rawInputDigest,
    failureContractRef: resolution.failureContractRef, occurrence });
  assert.equal(result.kind, 'closed_leaf_owner_receipt');
  assert.equal(result.candidate.disposition, 'success');
  assert.equal(result.receipt.computeRegime, 'F_D');
  assert.equal(result.receipt.actorProcessExchange, null);
  assert.equal(port.validateContractValue(resolution.outputContractRef, 'output', result.candidate.resultCandidate), true);
  let childProof = null;
  if (process.env.ABI5_NATIVE_WORK_CHECK_CHILD === '1') {
    const childEvent = events.find(event => event.kind === 'basis_admitted' && event.payload.basisClass === 'child');
    assert.ok(childEvent, 'requires the actual admitted child failure');
    const childBasis = abg.rehydrateExecutionBasisAtPrefix(prefix, childEvent.basisId);
    assert.equal(childBasis.graphFunctionRef, ids.graphFunctionRef);
    const nativeResolution = implementationSet.rows.find(row => row.graphFunctionRef === ids.graphFunctionRef);
    assert.ok(nativeResolution);
    assert.equal(port.isAdmittedResolution(nativeResolution), true, 'implementation-set membership stays independent of provider selection');
    const parentPredicate = loaded.graphFunction.declarations['abg.judgment_predicate'];
    const parentRelation = port.resolveJudgmentRelation(parentPredicate);
    assert.ok(parentRelation);
    const childPort = await port.forGraphFunction(ids.graphFunctionRef);
    assert.ok(childPort);
    assert.notEqual(childPort, port);
    assert.equal(childPort.isAdmittedResolution(nativeResolution), true);
    assert.ok(childPort.resolveJudgmentRelation(ids.judgmentPredicateRef));
    assert.equal(childPort.resolveJudgmentRelation(parentPredicate), null, 'no provider union');
    assert.equal(port.resolveJudgmentRelation(ids.judgmentPredicateRef), null);
    assert.equal(port.resolveJudgmentRelation(parentPredicate).predicateRef, parentPredicate, 'foldback keeps its parent predicate');
    assert.equal(await childPort.forGraphFunction(ids.graphFunctionRef), childPort, 'reuse the same exact selection');
    assert.equal(await port.forGraphFunction('graph-function://undeclared'), null);
    await assert.rejects(constructAdmittedLeafInvocationPort({ prefix, artifactTruth: environment.artifactTruth,
      implementationSet, executionResolution: loaded, graphFunctionRef: ids.graphFunctionRef,
      semanticsProjection: productOwner.projectInstalledLeafSemantics(loaded.productSemantics) }), /exact owner-selected/);
    const preimageInput = { resolution: nativeResolution, input: childBasis.rawInputValue,
      inputDigest: childBasis.rawInputDigest, instructionContractRef: ids.taskContractRef,
      rawResultContractRef: ids.workerReportContractRef, rawResult: { summary: 'schema witness only', gaps: [] } };
    const preimage = childPort.verifyProbabilisticResultContractPreimage(preimageInput);
    // The old installed publication remains defective; do not repin historical
    // admission to make this report appear admitted under the successor.
    assert.equal(preimage.code, 'result_contract_refused');
    assert.equal(loaded.declarationClosure.contractOwners.some(owner => owner.declarationRef === ids.workerReportContractRef), false);
    const previousNative = catalog.boundPublications.find(publication => publication.moduleRef === ids.moduleRef);
    const successorNative = constructNativeWorkspaceWorkModulePublication({ productId: previousNative.owningProductId,
      artifactDigest: previousNative.artifactDigest, productContentDigest: previousNative.productContentDigest,
      productManifestDigest: previousNative.productManifestDigest,
      packageName: previousNative.productSemanticsBinding.packageName, packageVersion: previousNative.productSemanticsBinding.packageVersion });
    const successorPublications = catalog.boundPublications.map(publication => publication === previousNative ? successorNative : publication);
    const definitions = productOwner.buildGraphFunctionCatalog(successorPublications);
    assert.equal(definitions.kind, 'graph_function_catalog');
    // Unadmitted declaration fixture for the pure required-closure relation.
    // Retained owner coordinates are test inputs, not a successor install claim.
    const declarationFixture = { ...catalog, ...definitions, boundPublications: successorPublications };
    const fixtureView = productOwner.narrowGraphFunctionCatalog(declarationFixture, catalogView.allowlist);
    const successorClosure = productOwner.resolveExecutionDeclarationClosure(declarationFixture, fixtureView,
      basis.programRef, basis.graphFunctionRef);
    assert.equal(successorClosure.kind, 'resolved_execution_declaration_closure', JSON.stringify(successorClosure));
    const reportOwners = successorClosure.contractOwners.filter(owner => owner.declarationRef === ids.workerReportContractRef);
    assert.equal(reportOwners.length, 1);
    assert.equal(reportOwners[0].moduleRef, ids.moduleRef);
    assert.equal(port.verifyProbabilisticResultContractPreimage(preimageInput).code, 'contract_identity_mismatch');
    childProof = { graphFunctionRef: ids.graphFunctionRef, inputDigest: childBasis.rawInputDigest,
      historicalPreimage: preimage, successorReportOwner: reportOwners[0], successorClosureDigest: product.sha256Canonical(successorClosure),
      parentPredicate, separateChildJudgment: true, wrongOwnerRefused: true,
      actorCalls: 0, limits: 'Exact retained child input and installed ABI worker-contract/judgment selection. Historical raw-report closure refusal preserved. Pure unadmitted successor declaration fixture proves required report ownership, not successor installation, report admission, completion or J.' };
  }
  if (process.env.ABI5_NATIVE_WORK_OWNER_PROOF_PATH) await fs.writeFile(process.env.ABI5_NATIVE_WORK_OWNER_PROOF_PATH,
    JSON.stringify({ disposition: 'pure_consumer_success', retainedPrefix: receipt.resources.eventResource.closeHandoff.prefix,
      inputDigest: basis.rawInputDigest, implementationRef: resolution.implementationRef, executionAuthority: null,
      resultCandidate: result.candidate.resultCandidate, childProof,
      limits: 'Successor compiled leaf port over exact historical admitted ownership and unchanged installed pure consumer. No new runtime admission, physical work or native/provider call.' }, null, 2) + '\n', { flag: 'wx' });
});

// This finite schema is consumer-owned test data; core never assigns criterion meaning.
const assessmentContract = { contractRef: 'contract://native-assessment-fixture/verdict@5', contractVersion: '5.0.0', contractKind: 'output', valueKind: 'fixture_assessment' };
const assessmentSchema = { $schema: 'https://json-schema.org/draft/2020-12/schema', $id: assessmentContract.contractRef,
  type: 'object', additionalProperties: false, required: ['kind', 'criteria', 'residuals'], properties: {
    kind: {const:'fixture_assessment'},
    criteria: {type:'array',items:{type:'object',additionalProperties:false,required:['criterionRef','disposition','explanation'],properties:{
      criterionRef:{const:'criterion://fixture/meaning'},disposition:{enum:['satisfied','falsified','indeterminate']},explanation:{type:'string'}}}},
    residuals: {type:'array',items:{type:'string'}} } };
async function assessmentFixture(t, schema = assessmentSchema) {
  const env = await fixture(t, []);
  await fs.writeFile(join(env.canonicalRoot, 'rubric.md'), 'Assess the actual requested meaning; do not infer it from structure.\n');
  const context = await product.observeWorksiteContext(env.read);
  const selected = path => ({path,digest:context.entries.find(e => e.relativePath === path).digest});
  const assessment = {resultContract:assessmentContract,schemaAsset:{productId:publication.owningProductId,
    contractId:assessmentContract.contractRef,bytesBase64:Buffer.from(JSON.stringify(schema)).toString('base64')},
    sources:[selected('keep.txt')],candidate:selected('target.txt'),rubric:selected('rubric.md'),
    producer:{resultRef:'result://historical-selected/asset',resultDigest:digest('historical-selected-asset'),
      cCallRef:'c-call://historical-author',actorInvocationRef:'actor-invocation://historical-author'}};
  const task = native.constructNativeWorkspaceWorkTask({...env.task, context, readFirst:['keep.txt','target.txt','rubric.md'],assessment});
  return {...env,task};
}
const verdict = () => JSON.stringify({kind:'fixture_assessment',
  criteria:[{criterionRef:'criterion://fixture/meaning',disposition:'satisfied',explanation:'Synthetic judgment for mechanical qualification only.'}],residuals:[]});

test('native and assessment renders preserve scope and explain observation limits', async t => {
  for (const env of [await fixture(t), await assessmentFixture(t)]) {
    const before=structuredClone(env.task), schema=native.nativeWorkspaceWorkResponseSchema(env.task);
    const text=native.renderNativeWorkspaceWorkOrder(env.task);
    assert.match(text,/temporary files, shell redirections and probe fixtures are writes even when deleted/);
    assert.match(text,/process memory, pipes or declared writable paths/);
    assert.match(text,/read-only assessment grants no writable paths/);
    assert.match(text,/Disclose actions outside the declared scope and any uncertainty/);
    assert.match(text,/Platform-owned transport and runtime\/cache files remain the platform's responsibility/);
    assert.match(text,/observations and changedPaths cover selected worksite facts only/);
    assert.match(text,/do not establish the absence of off-scope writes/);
    assert.match(text,/Disclosed contrary actions and unknown scope remain material to independent assessment/);
    assert.deepEqual(env.task,before);assert.deepEqual(native.nativeWorkspaceWorkResponseSchema(env.task),schema);
    if(env.task.assessment) assert.deepEqual(env.task.writeRoots,[]);
    else assert.ok(text.includes(`Permitted write scope: ${JSON.stringify(env.task.writeRoots)}`));
  }
});

test('assessment declaration selects an independent assessor role; ordinary constructor stays unchanged', async () => {
  const {nativeContextLeafFamily,cLeafTerms}=await import('../../build/code/src/gtl/index.js');
  const graph=publication.graphFunctions.find(g=>g.name===ids.assessmentGraphFunctionRef);
  assert.ok(graph);const leaf=cLeafTerms(graph.template.nodes[0].term)[0];
  assert.equal(nativeContextLeafFamily(graph,leaf),'assessor');
  const ordinary=publication.graphFunctions.find(g=>g.name===ids.graphFunctionRef);
  assert.equal(nativeContextLeafFamily(ordinary,cLeafTerms(ordinary.template.nodes[0].term)[0]),'constructor');
  assert.equal(graph.declarations['abg.raw_result_contract'],undefined,'consumer parent must declare its exact result contract');
  assert.deepEqual(publication.programs.find(p=>p.programRef===ids.programRef).callableMembership,[ids.graphFunctionRef],
    'ordinary constructor Program retains its original role membership');
});

test('assessment schema must match its unique declared installed owner and immutable schema asset', async t => {
  const env=await assessmentFixture(t), a=env.task.assessment;
  const {resolveNativeWorkspaceAssessmentSchema}=await import('../../build/code/src/product/native_workspace_assessment.js');
  const schemaPath=join(env.scratch,'assessment.schema.json');const bytes=Buffer.from(a.schemaAsset.bytesBase64,'base64');await fs.writeFile(schemaPath,bytes);
  const declared={...publication,contracts:[...publication.contracts,assessmentContract]};
  const install={productId:publication.owningProductId,installedRoot:env.scratch,publicContracts:[{
    contractKind:'schema_asset',contractId:assessmentContract.contractRef,contractVersion:'5.0.0',owningProduct:publication.owningProductId,
    contractDigest:product.sha256Bytes(bytes),assetLocator:{path:'assessment.schema.json',mediaType:'application/schema+json',contentDigest:product.sha256Bytes(bytes)}}]};
  assert.deepEqual(resolveNativeWorkspaceAssessmentSchema(a,[declared],[install]),assessmentSchema);
  assert.equal(resolveNativeWorkspaceAssessmentSchema(a,[publication],[install]),null,'missing declaration');
  assert.equal(resolveNativeWorkspaceAssessmentSchema(a,[declared,declared],[install]),null,'ambiguous owner');
  assert.equal(resolveNativeWorkspaceAssessmentSchema({...a,schemaAsset:{...a.schemaAsset,productId:'product://wrong'}},[declared],[install]),null);
  await fs.writeFile(schemaPath,'{}');assert.equal(resolveNativeWorkspaceAssessmentSchema(a,[declared],[install]),null,'changed installed schema');
});

test('assessment schema defaults to fixed 2020 without changing declared validation or accepting conflicting markers', async t => {
  const env=await assessmentFixture(t), a=env.task.assessment;
  const owner=await import('../../build/code/src/product/native_workspace_assessment.js');
  const { $schema: marker, ...implicit }=assessmentSchema;
  const select=schema=>({...a,schemaAsset:{...a.schemaAsset,bytesBase64:Buffer.from(JSON.stringify(schema)).toString('base64')}});
  for (const schema of [assessmentSchema,implicit]) {
    const selected=owner.nativeWorkspaceAssessmentSchema(select(schema));
    assert.deepEqual(selected,schema,'admission preserves exact authored schema without marker injection');
    assert.deepEqual(owner.parseNativeWorkspaceAssessmentResult(selected,verdict()),JSON.parse(verdict()));
    for (const output of ['{',JSON.stringify({...JSON.parse(verdict()),kind:'wrong'}),
      JSON.stringify({...JSON.parse(verdict()),extra:true})]) {
      assert.equal(owner.parseNativeWorkspaceAssessmentResult(selected,output),null);
    }
  }
  assert.equal(marker,'https://json-schema.org/draft/2020-12/schema');
  for (const wrong of [null,'http://json-schema.org/draft-07/schema#','https://json-schema.org/draft/2019-09/schema',false]) {
    assert.equal(owner.nativeWorkspaceAssessmentSchema(select({...implicit,$schema:wrong})),null);
  }
  for (const change of [{$id:'contract://wrong'}, {additionalProperties:true}, {required:['criteria','residuals']},
    {properties:{...implicit.properties,kind:{const:'wrong'}}}]) {
    assert.equal(owner.nativeWorkspaceAssessmentSchema(select({...implicit,...change})),null);
  }
});

test('exact assessment resolution, native completion and result checks share one compilation without accepting changed schema or installed bytes', async t => {
  const {Ajv2020}=await import('ajv/dist/2020.js');
  const schemaOwner=await import('../../build/code/src/product/native_workspace_assessment.js');
  const env=await assessmentFixture(t),a=env.task.assessment,declared={...publication,contracts:[...publication.contracts,assessmentContract]};
  const schemaPath=join(env.scratch,'assessment.schema.json');
  const installFor=async selection=>{const bytes=Buffer.from(selection.schemaAsset.bytesBase64,'base64');await fs.writeFile(schemaPath,bytes);
    return {productId:publication.owningProductId,installedRoot:env.scratch,publicContracts:[{
      contractKind:'schema_asset',contractId:assessmentContract.contractRef,contractVersion:'5.0.0',owningProduct:publication.owningProductId,
      contractDigest:product.sha256Bytes(bytes),assetLocator:{path:'assessment.schema.json',mediaType:'application/schema+json',contentDigest:product.sha256Bytes(bytes)}}]};};
  const install=await installFor(a),originalCompile=Ajv2020.prototype.compile;let compiles=0;
  Ajv2020.prototype.compile=function(schema,...args){if(schema?.$id===assessmentContract.contractRef)compiles++;return originalCompile.call(this,schema,...args);};
  t.after(()=>{Ajv2020.prototype.compile=originalCompile;});
  const schema=schemaOwner.resolveNativeWorkspaceAssessmentSchema(a,[declared],[install]);assert(schema);assert.equal(compiles,1);
  assert.equal(native.nativeWorkspaceWorkResponseSchema(env.task),schema,'dependent projection retains the established immutable schema');
  assert.equal(schemaOwner.resolveNativeWorkspaceAssessmentSchema(a,[declared],[install]),schema);
  assert.deepEqual(schemaOwner.parseNativeWorkspaceAssessmentResult(schema,verdict()),JSON.parse(verdict()));
  assert.equal(schemaOwner.parseNativeWorkspaceAssessmentResult(schema,'{"kind":"fixture_assessment","kind":"fixture_assessment"}'),null,'raw duplicate keys remain refused');
  assert.equal(schemaOwner.parseNativeWorkspaceAssessmentResult(schema,'{'),null);
  const p=await prepare(t,env),result=await p.prepared.complete(p.exchange(verdict()));assert.equal(result.disposition,'success');
  assert(native.isNativeWorkspaceWorkObservation(result.resultCandidate));
  assert(native.nativeWorkspaceWorkResultMatches(env.task,result.resultCandidate,p.call.cCallRef,p.exchange(verdict()).observation));
  assert.equal(compiles,1,'resolver, repeated parser, actual native completion and result predicates prepare exactly once');
  const cold=JSON.parse(JSON.stringify(schema));assert(schemaOwner.parseNativeWorkspaceAssessmentResult(cold,verdict()));assert.equal(compiles,2);
  cold.required.push('absent');assert.equal(schemaOwner.parseNativeWorkspaceAssessmentResult(cold,verdict()),null);assert.equal(compiles,3,'mutable standalone schema is not memoized');
  assert(schemaOwner.parseNativeWorkspaceAssessmentResult(schema,verdict()));assert.equal(compiles,3,'caller copy cannot poison the owner preparation');
  assert.equal(schemaOwner.nativeWorkspaceAssessmentSchema({...a,resultContract:{...a.resultContract,valueKind:'changed_kind'}}),null,'warm asset does not replace selector checks');
  await fs.writeFile(schemaPath,'{}');assert.equal(schemaOwner.resolveNativeWorkspaceAssessmentSchema(a,[declared],[install]),null,'warm validator cannot bypass installed-byte checks');
  const changed=JSON.parse(JSON.stringify(assessmentSchema));changed.required.push('counter');changed.properties.counter={type:'integer',default:1};
  changed.$defs={address:{type:'string',format:'email'}};changed.properties.residuals.items={$ref:'#/$defs/address'};
  const select=value=>({...a,schemaAsset:Object.freeze({...a.schemaAsset,bytesBase64:Buffer.from(JSON.stringify(value)).toString('base64')})});
  const changedSelection=select(changed),changedInstall=await installFor(changedSelection);
  const next=schemaOwner.resolveNativeWorkspaceAssessmentSchema(changedSelection,[declared],[changedInstall]);assert(next);assert.notEqual(next,schema);assert.equal(compiles,4);
  const value=JSON.parse(verdict());assert.equal(schemaOwner.parseNativeWorkspaceAssessmentResult(next,JSON.stringify(value)),null,'defaults are not inserted');
  assert.equal(schemaOwner.parseNativeWorkspaceAssessmentResult(next,JSON.stringify({...value,counter:'1'})),null,'no coercion');
  assert.equal(schemaOwner.parseNativeWorkspaceAssessmentResult(next,JSON.stringify({...value,counter:1,extra:true})),null,'additional fields are not removed');
  assert.equal(schemaOwner.parseNativeWorkspaceAssessmentResult(next,JSON.stringify({...value,counter:1,residuals:['not an email']})),null,'full format validation');
  assert.deepEqual(schemaOwner.parseNativeWorkspaceAssessmentResult(next,JSON.stringify({...value,counter:1,residuals:['a@example.com']})),{...value,counter:1,residuals:['a@example.com']});
  assert.equal(compiles,4);
  const unresolved=select({...assessmentSchema,properties:{...assessmentSchema.properties,residuals:{$ref:'schema://unavailable'}}});
  const unresolvedInstall=await installFor(unresolved);assert.equal(schemaOwner.resolveNativeWorkspaceAssessmentSchema(unresolved,[declared],[unresolvedInstall]),null,'no closure or external reference authority is invented');assert.equal(compiles,5);
  t.diagnostic(JSON.stringify({ownerPreparationCount:1,coldAndChangedCompiles:compiles-1,coverage:'Exact installed-byte resolver -> response-schema projection -> result parser -> native completion -> observation/result predicates. Fixture supplies lower authority/assembly/exchange; no provider or native admission claim.'}));
});

test('typed read-only assessment retains F_P source and exact observed basis, not a work report', async t => {
  const schema={...assessmentSchema,properties:{...assessmentSchema.properties,residuals:{type:'array',items:{type:'string',format:'email'}}}};
  const env=await assessmentFixture(t,schema), p=await prepare(t,env);const result=await p.prepared.complete(p.exchange(verdict()));
  assert.equal(p.request.responsePresentation,'result_text');assert.deepEqual(p.request.responseJsonSchema,schema);
  assert.equal(result.disposition,'success');const observation=result.resultCandidate;
  assert.equal(native.isNativeWorkspaceWorkObservation(observation),true);
  assert.equal(observation.report,null);assert.equal(observation.assessment.kind,'fixture_assessment');
  assert.equal(Object.hasOwn(observation.assessment,'basisDigest'),false,'semantic result needs no core digest echo');
  assert.deepEqual(observation.assessment,JSON.parse(verdict()),'owner preserves raw semantic fields exactly');
  assert.deepEqual(observation.task,env.task);assert.deepEqual(observation.before,env.task.context);
  assert.match(native.nativeWorkspaceAssessmentBasisDigest(env.task),/^sha256:[a-f0-9]{64}$/,'public digest helper remains available');
  const changedTask={...env.task,assessment:{...env.task.assessment,producer:{...env.task.assessment.producer,resultDigest:digest('other-producer')}}};
  const retargeted=native.constructNativeWorkspaceWorkObservation(changedTask,observation.after,null,observation.provenance,observation.assessment);
  assert.equal(native.nativeWorkspaceWorkResultMatches(env.task,retargeted,p.call.cCallRef,p.exchange(verdict()).observation),false,'a rehashed observation cannot retarget the admitted task');
  const rewritten=native.constructNativeWorkspaceWorkObservation(env.task,observation.after,null,observation.provenance,{...observation.assessment,residuals:['invented']});
  assert.equal(native.nativeWorkspaceWorkResultMatches(env.task,rewritten,p.call.cCallRef,p.exchange(verdict()).observation),false,'a schema-valid rewrite cannot replace actual native output');
  assert.equal(native.nativeWorkspaceWorkResultMatches(env.task,observation,p.call.cCallRef,{...p.exchange(verdict()).observation,inputDigest:digest('other-task')}),false,'native input identity remains exact');
  const sameCall=native.constructNativeWorkspaceWorkObservation(env.task,observation.after,null,{...observation.provenance,cCallRef:env.task.assessment.producer.cCallRef},observation.assessment);
  assert.equal(native.isNativeWorkspaceWorkObservation(sameCall),false,'the assessor C-call must differ from the producer');
  assert.deepEqual(observation.changedPaths,[]);assert.equal(observation.provenance.actorInvocationRef,'actor-invocation://native-owner/test');
  assert.equal(native.nativeWorkspaceWorkResultMatches(env.task,observation,p.call.cCallRef,p.exchange(verdict()).observation),true);
  assert.equal(native.nativeWorkspaceAssessmentMatchesContext(observation,env.task.context),true);
  assert.equal(native.nativeWorkspaceAssessmentMatchesContext({...observation,report:{summary:'accepted',gaps:[]}},env.task.context),false);
  const wrongFormat=await p.prepared.complete(p.exchange(JSON.stringify({...JSON.parse(verdict()),residuals:['not an email']})));
  assert.equal(wrongFormat.disposition,'failure');assert.equal(wrongFormat.resultCandidate.failureClass,'result_contract_failure','native completion still applies full format validation');
  const {responsePresentation,...omittedPresentation}=p.request;
  await assert.rejects(()=>realizeNativeWorkspaceWork(env.task,p.occurrence,()=>({request:omittedPresentation})),/assembly differs from its owner contract/);
  await assert.rejects(()=>realizeNativeWorkspaceWork(env.task,p.occurrence,()=>({request:{...p.request,responsePresentation:'structured_output'}})),/assembly differs from its owner contract/);
  await fs.writeFile(join(env.canonicalRoot,'target.txt'),'changed after assessment\n');
  const current=await product.observeWorksiteContext(env.read);
  assert.equal(native.nativeWorkspaceAssessmentMatchesContext(observation,current),false,'changed candidate cannot reuse the verdict');
  assert.equal(native.isNativeWorkspaceWorkTask({...env.task,context:current}),false,'stale subject fails task construction');
});

for (const mode of ['ordinary-report','malformed','empty','duplicate-keys','undeclared-field','same-author','failed-transport','mutating'])
  test(`native assessment ${mode} cannot produce semantic success`,async t=>{
    const env=await assessmentFixture(t), p=await prepare(t,env);
    let output=verdict();
    if(mode==='ordinary-report')output=JSON.stringify({summary:'Accepted',gaps:[]});
    if(mode==='malformed')output='{';
    if(mode==='empty')output='';
    if(mode==='duplicate-keys')output='{"kind":"fixture_assessment","kind":"fixture_assessment","criteria":[],"residuals":[]}';
    if(mode==='undeclared-field')output=JSON.stringify({...JSON.parse(output),basisDigest:digest('undeclared-field')});
    if(mode==='mutating')await fs.writeFile(join(env.canonicalRoot,'target.txt'),'unauthorized assessor edit\n');
    const exchange=p.exchange(output,mode==='failed-transport'?'failure':'success');
    if(mode==='same-author')exchange.observation.actorInvocationRef=env.task.assessment.producer.actorInvocationRef;
    const result=await p.prepared.complete(exchange);
    assert.equal(result.disposition,'failure');assert.equal(native.isNativeWorkspaceWorkFailure(result.resultCandidate),true);
    assert.equal(native.isNativeWorkspaceWorkObservation(result.resultCandidate),false);
    assert.equal(native.nativeWorkspaceAssessmentMatchesContext(result.resultCandidate,env.task.context),false);
    assert.equal(result.resultCandidate.failureClass,({ 'ordinary-report':'result_contract_failure',malformed:'result_contract_failure',
      empty:'result_contract_failure','duplicate-keys':'result_contract_failure','undeclared-field':'result_contract_failure','same-author':'assessment_independence_mismatch','failed-transport':'absolute_timeout',mutating:'write_scope_violation'})[mode]);
    if(mode==='mutating')assert.deepEqual(result.resultCandidate.changedPaths,['target.txt']);
    if(mode==='malformed') {
      const request={...p.request,actorRef:ids.workerActorRef,workerBindingRef:ids.workerBindingRef,
        materializationPlanRef:ids.materializationPlanRef,rendererRef:ids.rendererRef,instructionContractRef:ids.taskContractRef,prompt:'independent declared assessment'};
      const outputDigest=product.sha256Bytes(output),promptDigest=product.sha256Canonical(request.prompt);
      const observation={...exchange.observation,actorRef:request.actorRef,workerBindingRef:request.workerBindingRef,
        materializationPlanRef:request.materializationPlanRef,rendererRef:request.rendererRef,instructionContractRef:request.instructionContractRef,
        resultContractRef:request.resultContractRef,processRef:'process://native-owner/test',observedOutputDigest:outputDigest,promptDigest,
        processStatus:0,processSignal:null,timeoutClass:null,timedOut:false,exitObserved:true,terminationConfirmed:true,signalSequence:[],
        structuredEventCount:1,progressEventCount:1,toolCallCount:0,toolInvocations:[],apiRetryCount:0,
        stdoutByteLength:Buffer.byteLength(output),stderrByteLength:0,
        artifactDigests:{output:outputDigest,prompt:product.sha256Bytes(request.prompt),stdout:digest('stdout'),stderr:digest('stderr'),transport:exchange.observation.transportDigest}};
      const evidence=deriveProbabilisticTransportEvidence(p.call,request,observation,null,result.resultCandidate,
        ids.taskContractRef,assessmentContract.contractRef);
      assert.equal(evidence.candidateRef,null,'malformed semantic output is never admitted as a candidate');
      assert.equal(evidence.transportDisposition,'success','report failure does not falsify native process truth');
      assert.equal(evidence.outputDigest,product.sha256Canonical(result.resultCandidate));
    }
  });

test('assessment accepts a different declared verdict shape without core identity fields', async t => {
  const schema={$schema:assessmentSchema.$schema,$id:assessmentContract.contractRef,type:'object',additionalProperties:false,
    required:['kind','decision','evidence'],properties:{kind:{const:assessmentContract.valueKind},decision:{enum:['reviewed','uncertain']},evidence:{type:'array',items:{type:'string'}}}};
  const env=await assessmentFixture(t,schema),p=await prepare(t,env);
  const raw={kind:assessmentContract.valueKind,decision:'uncertain',evidence:['target.txt']};
  const result=await p.prepared.complete(p.exchange(JSON.stringify(raw)));
  assert.equal(result.disposition,'success');assert.deepEqual(result.resultCandidate.assessment,raw);
  assert.equal(native.isNativeWorkspaceWorkObservation(result.resultCandidate),true);
  assert.equal(native.nativeWorkspaceWorkResultMatches(env.task,result.resultCandidate,p.call.cCallRef,p.exchange(JSON.stringify(raw)).observation),true);
  const invalid=await p.prepared.complete(p.exchange(JSON.stringify({...raw,decision:'accepted'})));
  assert.equal(invalid.disposition,'failure');assert.equal(invalid.resultCandidate.failureClass,'result_contract_failure');
});

test('assessment treats a consumer-declared basisDigest as schema-owned data without rewriting it', async t => {
  const schema={...assessmentSchema,required:[...assessmentSchema.required,'basisDigest'],
    properties:{...assessmentSchema.properties,basisDigest:{const:'consumer-owned-revision'}}};
  const env=await assessmentFixture(t,schema),p=await prepare(t,env);
  const raw={...JSON.parse(verdict()),basisDigest:'consumer-owned-revision'};
  const result=await p.prepared.complete(p.exchange(JSON.stringify(raw)));
  assert.equal(result.disposition,'success');assert.deepEqual(result.resultCandidate.assessment,raw);
  assert.equal(native.isNativeWorkspaceWorkObservation(result.resultCandidate),true);
  const absent=await p.prepared.complete(p.exchange(verdict()));
  assert.equal(absent.disposition,'failure');assert.equal(absent.resultCandidate.failureClass,'result_contract_failure');
  assert.equal(native.nativeWorkspaceWorkResultMatches(env.task,result.resultCandidate,p.call.cCallRef,p.exchange(verdict()).observation),false);
});

test('assessment task refuses mutable scope and mismatched source/rubric coordinates before work', async t=>{
  const env=await assessmentFixture(t);
  assert.equal(native.isNativeWorkspaceWorkTask({...env.task,writeRoots:['target.txt']}),false);
  for(const key of ['candidate','rubric'])assert.equal(native.isNativeWorkspaceWorkTask({...env.task,
    assessment:{...env.task.assessment,[key]:{...env.task.assessment[key],digest:digest('wrong')}}}),false);
  assert.equal(native.isNativeWorkspaceWorkTask({...env.task,assessment:{...env.task.assessment,
    sources:[{...env.task.assessment.sources[0],digest:digest('wrong')}]}}),false);
  const p=await prepare(t,env);await fs.writeFile(join(env.canonicalRoot,'rubric.md'),'changed rubric\n');let assemblies=0;
  await assert.rejects(realizeNativeWorkspaceWork(env.task,p.occurrence,()=>{assemblies++;return {request:p.request};}),/stale/);
  assert.equal(assemblies,0);
});

for (const fulfillment of [false,true]) test('complete assessment preparation joins assessor context, declared schema and exact native owner without dispatch'+(fulfillment?' with generated fulfillment':''), async t => {
  // Component frontier: admitted basis/environment facts are supplied; actual
  // assembly, actor preparation, physical reobservation and owner validator run.
  // This is not an installed admission or a manufactured runtime event.
  const {SourceTextModule,SyntheticModule}=await import('node:vm');
  const {dirname,resolve}=await import('node:path');
  const generated=fulfillment ? (await import('../../build/code/src/product/default_library_fulfillment.js')).governanceFulfillmentAssessmentJsonSchema() : null;
  const selectedSchema=generated===null ? assessmentSchema : {...assessmentSchema,required:[...assessmentSchema.required,'fulfillment'],properties:{...assessmentSchema.properties,fulfillment:generated}};
  const env=await assessmentFixture(t,selectedSchema), p=await prepare(t,env), a=env.task.assessment;
  const schemaBytes=Buffer.from(a.schemaAsset.bytesBase64,'base64');await fs.writeFile(join(env.scratch,'schema.json'),schemaBytes);
  const install={productId:publication.owningProductId,installedRoot:env.scratch,publicContracts:[{
    contractKind:'schema_asset',contractId:assessmentContract.contractRef,contractVersion:'5.0.0',owningProduct:publication.owningProductId,
    contractDigest:product.sha256Bytes(schemaBytes),assetLocator:{path:'schema.json',mediaType:'application/schema+json',contentDigest:product.sha256Bytes(schemaBytes)}}]};
  const rootGraph={...publication.graphFunctions[0],declarations:{...publication.graphFunctions[0].declarations,'abg.raw_result_contract':assessmentContract.contractRef}};
  const selectedPublication={...publication,contracts:[...publication.contracts,assessmentContract],graphFunctions:[rootGraph,...publication.graphFunctions.slice(1)]};
  const graphFunction=publication.graphFunctions.find(g=>g.name===ids.assessmentGraphFunctionRef);
  const authority=p.occurrence.executionAuthority;
  const {modulePublicationSemanticDigest}=await import('../../build/code/src/product/publication.js');
  Object.assign(install,{artifactDigest:selectedPublication.artifactDigest,productContentDigest:selectedPublication.productContentDigest,
    manifestDigest:selectedPublication.productManifestDigest,contributionManifest:{publicationBindings:[{moduleRef:selectedPublication.moduleRef,publicationDigest:modulePublicationSemanticDigest(selectedPublication)}]}});
  let assessmentPublication;
  let selectedPublicationForCall=selectedPublication;
  const owner={inputDigest:product.sha256Canonical(env.task),inputValue:env.task,inputRef:'component:assessment-input',
    call:p.call,execution:authority.executionBasis,program:selectedPublication.programs[0],events:[],
    environment:{kind:'exact_prefix_workspace_environment',productInstalls:[install]}};
  const role={frameRefs:['frame://fixture/reviewer'],policy:{policyRef:'policy://fixture/reviewer',text:'Independent assessment',digest:digest('reviewer-policy')},
    contextPolicy:{policyRef:'policy://fixture/read-only',selectors:['current_worksite','current_candidate','full_source']},sourceContent:[],accessContent:[]};
  let roleSelection='assessor',requestedRole=null,dispatches=0,capturedTransport=null,capturedPlan=null;
  const {prepareWorkerTransport}=await import('../../build/code/src/abg/worker_transport.js');
  async function component(name,overrides){
    const path=resolve(import.meta.dirname,'../../build/code/src',name+'.js');
    const module=new SourceTextModule(await fs.readFile(path,'utf8'),{identifier:path});
    await module.link(async specifier=>{const imported=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(path),specifier)).href);
      const values={...imported,...overrides[specifier]};return new SyntheticModule(Object.keys(values),function(){for(const [key,value]of Object.entries(values))this.setExport(key,value);});});
    await module.evaluate();return module.namespace;
  }
  const assembly=await component('abg/instruction_assembly',{
    './execution_basis.js':{authenticateNativeInstructionAssemblyBasis:()=>owner,constructNativeInstructionAssemblyBasis:value=>value},
    './stdo_environment.js':{projectRunEnvironmentRoleEvidence:(...args)=>{requestedRole=args.at(-1);return requestedRole===roleSelection?role:false;}},
  });
  const actor=await component('abg/actor_process',{
    './instruction_assembly.js':assembly,'./execution_basis.js':{constructNativeInstructionAssemblyBasis:value=>value,
      authenticateNativeInstructionAssemblyBasis:()=>owner},
    // Admission is a supplied component fact; preparation below remains real.
    './environment_admission.js':{hasAdmittedWorkspaceBinding:()=>true},
    './worker_transport.js':{prepareWorkerTransport:async input=>{
      capturedTransport=input;capturedPlan=await prepareWorkerTransport(input);
      throw new Error('stopped after local transport preparation');
    },runPreparedWorkerTransport:()=>{dispatches++;throw new Error('provider dispatch prohibited');}},
  });
  const port=await component('implementation/leaf_invocation_port',{'../abg/actor_process.js':actor});
  const occurrence=()=>({...p.occurrence,nativeInstructionAssemblyBasis:{publication:selectedPublicationForCall,
    ...(assessmentPublication===undefined?{}:{assessmentPublication}),graphFunction,executionBasis:authority.executionBasis,cCall:p.call,predecessorPrefix:authority.predecessorPrefix}});
  const invoke=()=>port.invokeLeafOwnerBoundary({resolution:authority.implementationResolution,value:env.task,
    inputDigest:owner.inputDigest,failureValueKind:'native_workspace_work_failure',
    verifyAuthority:()=>native.nativeWorkspaceWorkAuthorityMatches(env.task,authority),validateSuccess:native.isNativeWorkspaceWorkObservation,
    resolveWorkerContracts:(r,input)=>semantics.resolveProbabilisticWorkerContracts({inputContractRef:r.inputContractRef,outputContractRef:r.outputContractRef,input}),
    occurrence:occurrence(),loadImplementation:async()=>realizeNativeWorkspaceWork});
  const prepared=await invoke();assert.equal(prepared.kind,'prepared_probabilistic_leaf_owner_invocation');
  assert.equal(requestedRole,'assessor');assert.equal(prepared.workerRequest.resultContractRef,assessmentContract.contractRef);
  assert.equal(prepared.workerRequest.responsePresentation,'result_text');
  assert.deepEqual(prepared.workerRequest.responseJsonSchema,selectedSchema);
  assert.match(prepared.workerRequest.prompt,/Independent assessment/);
  assert.ok(prepared.workerRequest.prompt.includes(canonicalJson(selectedSchema)));
  assert.equal(prepared.workerRequest.prompt.includes('Return this exact basisDigest'),false);
  assert.equal(prepared.workerRequest.prompt.includes('basisDigest'),false,'core adds no field to the selected digest-free schema');
  assert.equal(prepared.workerRequest.prompt.includes(a.schemaAsset.bytesBase64),false,'schema bytes are not redundantly encoded in native guidance');
  const transportBoundary=await actor.invokeActorProcess({store:null,predecessorPrefix:authority.predecessorPrefix,
    executionBasis:authority.executionBasis,scope:{},cCall:p.call,expectedInputDigest:owner.inputDigest,
    occurrence:occurrence(),workerContracts:{instructionContractRef:ids.taskContractRef,resultContractRef:assessmentContract.contractRef},
    runtime:{workspaceBinding:env.workspaceBinding,artifactTruth:{}},request:prepared.workerRequest,dispatchOrdinal:1,basis:{}});
  assert.equal(transportBoundary.message,'stopped after local transport preparation');
  assert.equal(capturedTransport.responsePresentation,'result_text');
  assert.deepEqual(capturedTransport.responseJsonSchema,selectedSchema);
  assert.equal(capturedPlan.args.includes('--json-schema'),false,'native assessor deliberately selects text before dispatch');
  assert.equal(capturedPlan.responseJsonSchemaDigest,product.sha256Canonical(selectedSchema));
  assert.equal(capturedPlan.promptDigest,product.sha256Canonical(prepared.workerRequest.prompt));
  assert.equal(capturedPlan.cwd,env.canonicalRoot);
  roleSelection='constructor';let refused=await invoke();assert.equal(refused.ownerObservation.stage,'preparation');assert.equal(refused.ownerObservation.reason,'thrown');
  roleSelection='assessor';selectedPublicationForCall={...selectedPublication,graphFunctions:selectedPublication.graphFunctions.map(graph=>
    graph===rootGraph?{...rootGraph,declarations:{...rootGraph.declarations,'abg.raw_result_contract':ids.workerReportContractRef}}:graph)};
  refused=await invoke();assert.equal(refused.ownerObservation.stage,'preparation','unselected raw contract refuses before dispatch');
  // The root consumer declares the raw contract selection, while the exact
  // closure-selected ABI publication owns the installed schema bytes.
  selectedPublicationForCall={...selectedPublication,owningProductId:'product://component/consumer',contracts:publication.contracts};
  assessmentPublication=selectedPublication;
  const delegated=await invoke();assert.equal(delegated.kind,'prepared_probabilistic_leaf_owner_invocation');
  assert.deepEqual(delegated.workerRequest.responseJsonSchema,selectedSchema);
  assessmentPublication={...selectedPublication,owningProductId:'product://component/wrong-owner'};
  refused=await invoke();assert.equal(refused.ownerObservation.stage,'preparation');
  assessmentPublication=undefined;
  refused=await invoke();assert.equal(refused.ownerObservation.stage,'preparation','no implicit foreign schema fallback');
  assert.equal(dispatches,0);
  if(generated!==null){
    assert.deepEqual(capturedTransport.responseJsonSchema.properties.fulfillment,generated);
    const forms=generated.properties.obligations.items.properties.support.items.anyOf;assert.equal(forms.length,2);
    assert.match(prepared.workerRequest.prompt,/commandId/);assert.match(prepared.workerRequest.prompt,/Must be null for realization and verifier_artifact/);
    assert.match(prepared.workerRequest.prompt,/do not establish the absence of off-scope writes/);
    t.diagnostic('Generated support anyOf bytes conserved through exact schema asset resolution, actual owned assembly/render, leaf preparation and explicitly selected result_text transport input. Full schema remains bound; controlled lower occurrence/role admission only; dispatch prohibited.');
  }
});
