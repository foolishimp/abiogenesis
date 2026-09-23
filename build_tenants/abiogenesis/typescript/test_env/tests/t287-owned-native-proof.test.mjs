// Material-size proof reuse. Lower native admission/R10 selection are explicit
// premises; this never opens the retained Run, logs or physical application.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {performance} from 'node:perf_hooks';
import {privateOwner} from '../support/r10-private-owner-harness.mjs';
import * as p from '../../build/code/src/product/index.js';
import * as gtl from '../../build/code/src/gtl/index.js';
import {RuntimeDerivationSource} from '../../build/code/src/abg/runtime_derivation.js';
import {deepFreeze} from '../../build/code/src/shared/immutable.js';
import {canonicalJson} from '../../build/code/src/shared/canonical_json.js';
import {reconstructHistoricalDeclarationCatalog} from '../../build/code/src/product/declaration_closure.js';
const hash=p.sha256Canonical, clone=x=>JSON.parse(canonicalJson(x)), ids=p.NATIVE_WORK_REACQUISITION_IDS;
const inputPath=process.env.ABI5_OWNED_PROOF_NATIVE_REQUEST;
async function fixture(request){
  request=deepFreeze(request);
  const source=request.sourceNativeWork, sourceBasis={basisRef:'basis://owned-proof/source',graphFunctionRef:p.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef,
    rawInputValue:source.task,workspaceBindingId:source.task.workspaceBinding.bindingId,workspaceBindingDigest:source.task.workspaceBinding.bindingDigest,
    invocationAdmissionRef:'invocation://source',closureContractRef:'closure://source'};
  const gf=gtl.nativeWorkReacquisitionGraphFunction(), counts={task:0,request:0,terminal:0,catalog:0,cold:0,execution:0};
  const execution={basisRef:'basis://owned-proof/current',basisDigest:hash('current basis'),graphFunctionRef:gf.name,graphFunctionDigest:hash(gf),
    invocationAdmissionRef:'invocation://current',invocationRef:'invocation://current',rawInputAdmissionRef:'input://current',rawInputDigest:hash(request),rawInputValue:request,
    workspaceBindingId:request.workspaceBinding.bindingId,workspaceBindingDigest:request.workspaceBinding.bindingDigest,
    rootImplementationSetRef:'set://current',rootImplementationSetDigest:hash('set')};
  const graph=gtl.materializeGraph(gf,{invocationAdmissionRef:execution.invocationAdmissionRef,admittedInputRef:execution.rawInputAdmissionRef,
    admittedInputDigest:execution.rawInputDigest,admittedInput:request});
  Object.assign(execution,{graphRef:graph.materializationRef,graphDigest:graph.materializationDigest});
  const call={cCallRef:'c-call://owned-proof/current',basisId:execution.basisRef,runId:'run://current',callClass:'leaf',regime:'F_D',graphFunctionRef:gf.name,
    programLocusRef:ids.nodeRef,implementationRef:ids.implementationRef,implementationBindingRef:ids.implementationBindingRef,
    inputContractRef:ids.requestContractRef,outputContractRef:p.WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef};
  let events=[],derivation=new RuntimeDerivationSource(),snap=derivation.snapshot([]),cover=true,active=true;
  const coordinates=new Map(),owned=new WeakSet(),prefixSources=new WeakMap();prefixSources.set(snap,derivation);
  const coordinate=()=>{let c=coordinates.get(events.length);if(c)return c;const body={kind:'durable_prefix_coordinate',schemaVersion:'5.0.0',
    eventLogRef:'file:///unadmitted-owned-proof-fixture',storeIdentity:{device:1,inode:2,eventContractDigest:request.source.prefix.storeIdentity.eventContractDigest},
    prefixLength:events.length,prefixDigest:hash(events.map(e=>e.eventId))};c=Object.freeze({...body,coordinateDigest:hash(body)});coordinates.set(events.length,c);owned.add(c);return c;};
  const append=(kind,aggregateId,payload,extra={})=>{const e=deepFreeze({kind,aggregateId,payload,eventId:'event://fixture/'+(events.length+1),
    admissionOrdinal:events.length+1,causationEventRefs:[],...extra});events.push(e);snap=derivation.append(snap,[e]);prefixSources.set(snap,derivation);return e;};
  const old={basisId:sourceBasis.basisRef,runId:'run://source',graphCallId:request.source.graphCallRef,graphFunctionRef:sourceBasis.graphFunctionRef};
  append('c_call_fibre_selected',source.provenance.cCallRef,{regime:'F_P',implementationRef:p.NATIVE_WORKSPACE_WORK_IDS.implementationRef,
    implementationBindingRef:p.NATIVE_WORKSPACE_WORK_IDS.implementationBindingRef},old);
  append('c_call_evidenced',source.provenance.cCallRef,{evidenceRef:'evidence://source',evidenceClass:'probabilistic_transport',
    implementationRef:p.NATIVE_WORKSPACE_WORK_IDS.implementationRef,transportDigest:source.provenance.transportDigest,outputDigest:hash(source)},old);
  const result=append('c_call_result_admitted',source.provenance.cCallRef,{contractRef:p.NATIVE_WORKSPACE_WORK_IDS.observationContractRef,
    resultClass:'success',value:source,valueDigest:hash(source),evidenceRefs:['evidence://source'],resultRef:'result://source',resultDigest:hash('source result')},old);
  const judgment=append('c_call_judged',source.provenance.cCallRef,{judgment:'advance',resultRef:result.payload.resultRef,resultDigest:result.payload.resultDigest},
    {...old,causationEventRefs:[result.eventId]});
  const closed=append('graph_call_closed',request.source.graphCallRef,{closureContractRef:sourceBasis.closureContractRef},old);
  append('c_call_opened',call.cCallRef,call,{basisId:execution.basisRef,runId:call.runId});
  const basis={cCallRef:call.cCallRef,predecessorPrefix:coordinate()};
  function read(c,{requireCurrent=false}={}){
    const known=coordinates.get(c.prefixLength);
    assert.deepEqual(c,known,'exact selected prefix');if(requireCurrent)assert.equal(c.prefixLength,events.length,'current occurrence');
    if(active&&owned.has(c)){const es=derivation.prefix(snap,c.prefixLength);prefixSources.set(es,derivation);return es;}
    counts.cold++;const cold=new RuntimeDerivationSource(),es=cold.snapshot(events.slice(0,c.prefixLength));prefixSources.set(es,cold);return es;
  }
  const prefixOverride={selectValidatedRuntimeEventPrefix:es=>es,runtimeEventsFromValidatedPrefix:es=>es,
    runtimePrefixComputation:(es,key,construct)=>{
      // Uses the real prefix lineage scope; cold acquisition has a fresh source.
      return prefixSources.get(es).scope('fixture',es).owner(key,construct);
    }};
  const storeOverride={readRuntimeEventsAtDurablePrefix:read,authenticateRuntimePrefixAncestry:()=>true,
    reidentifyHistoricalDurablePrefixCoordinate:(current,historical)=>{read(current);
      // Historical source selection is an explicit R10 lookup premise; its
      // physical resource is never opened by this component fixture.
      if(canonicalJson(historical)===canonicalJson(request.source.prefix))return historical;
      const c=coordinates.get(historical.prefixLength);
      assert.deepEqual(historical,c,'historical exact cut');return active&&owned.has(current)?c:historical;}};
  const invocations={projectExactExecutionBasisAtPrefix:(_p,ref)=>{counts.execution++;return ref===execution.basisRef?execution:ref===sourceBasis.basisRef?sourceBasis:null;},
    projectExactInvocationAdmissionAtPrefix:()=>({workspaceBindingId:source.task.workspaceBinding.bindingId,workspaceBindingDigest:source.task.workspaceBinding.bindingDigest,
      workspaceId:request.workspaceAuthorityBasis.workspaceId,capabilityGrants:[request.capabilityGrant]})};
  const nativeSource=await privateOwner('abg/native_worksite_execution.js',[],{'./event_prefix.js':prefixOverride,'./invocation_execution_truth.js':invocations});
  const owner=await privateOwner('abg/native_work_reacquisition.js',[],{
    './event_store.js':storeOverride,'./event_prefix.js':prefixOverride,'./invocation_execution_truth.js':invocations,
    '../product/worksite_command_execution.js':{constructNativeWorksiteCommandExecutionTask:input=>{counts.task++;try{return p.constructNativeWorksiteCommandExecutionTask(input);}catch(e){counts.constructionFailure=e.message;throw e;}},
      isNativeWorksiteCommandReacquisitionRequest:v=>{counts.request++;return p.isNativeWorksiteCommandReacquisitionRequest(v);}},
    './project_read_ports.js':{projectClosedGraphCallTerminalAtDurablePrefix:()=>{counts.terminal++;counts.catalog++;
      reconstructHistoricalDeclarationCatalog(request.source.declarationProof,request.source.declarationProof.catalog.readinessBasis);
      return {value:source,producer:{graphFunction:{ref:sourceBasis.graphFunctionRef},executionBasis:{ref:sourceBasis.basisRef},
        cCallRef:source.provenance.cCallRef,resultAdmissionEventRef:result.eventId,judgmentAdmissionEventRef:judgment.eventId}};}},
    './environment_admission.js':{projectExactPrefixWorkspaceEnvironment:()=>({kind:'exact_prefix_workspace_environment',workspaceAuthorityBasis:request.workspaceAuthorityBasis,workspaceBinding:request.workspaceBinding})},
    './worksite_revision.js':{projectWorksiteRevisionBindingCover:()=>cover?[]:null},
    './c_call.js':{projectOpenedCCallCarrierAtPrefix:()=>call,projectCCallCarrierPhaseAtPrefix:es=>({phase:es.some(e=>e.aggregateId===call.cCallRef&&e.kind==='c_call_result_admitted')?'after_result':'selected_no_evidence'})},
    './execution_basis.js':{rehydrateAdmittedImplementationSetAtPrefix:()=>({implementationSetDigest:execution.rootImplementationSetDigest,rows:[call]})},
    './native_worksite_execution.js':nativeSource});
  return {request,source,sourceBasis,execution,call,basis,owner,nativeSource,counts,append,coordinate,prefix:()=>snap,read,
    cold:()=>{active=false;},warm:()=>{active=true;},cover:v=>{cover=v;},result,judgment,closed};
}
test('20–24 MB native carrier: preparation -> Result clone -> judgment/foldback -> C2 conserves proof and current invalidators', {skip:!inputPath},async t=>{
  const start=performance.now(),packet=JSON.parse(fs.readFileSync(inputPath,'utf8'));
  const request=packet.kind==='native_worksite_command_reacquisition_request'?packet:packet.invocation.invocation.request.input.value;
  const h=await fixture(request),prepared=h.owner.authenticateNativeWorkReacquisition(h.basis,request,true);assert(prepared,JSON.stringify(h.counts));
  const task=prepared.task,bytes=Buffer.byteLength(canonicalJson(task));assert(bytes>=20_000_000&&bytes<=25_000_000,bytes);
  // Returned wrappers retain their historical mutability; only the distinct
  // private retained record owns proof. Large immutable bodies stay shared.
  assert.equal(Object.isFrozen(prepared),false);
  prepared.task={...task,taskDigest:hash('caller-changed task')};
  const next=h.owner.authenticateNativeWorkReacquisition(h.basis,request,true);assert(next);
  assert.notEqual(next,prepared);assert.strictEqual(next.task,task);
  next.task={...task,taskDigest:hash('second changed view')};
  assert.strictEqual(h.owner.authenticateNativeWorkReacquisition(h.basis,request,true).task,task);
  const sourceView=h.nativeSource.projectNativeWorkCommandSourceAtPrefix(h.prefix(),task);assert(sourceView);
  assert.equal(Object.isFrozen(sourceView),true,'source projection already declares a Readonly wrapper');
  assert.throws(()=>{sourceView.sourceResult=null;},TypeError);
  assert.strictEqual(h.nativeSource.projectNativeWorkCommandSourceAtPrefix(h.prefix(),task).sourceResult,h.result);
  const first={...h.counts};assert.equal(first.task,1);assert.equal(first.catalog,1);
  const value=deepFreeze(clone(task));
  const result=h.append('c_call_result_admitted',h.call.cCallRef,{resultClass:'success',value,valueDigest:hash(value),resultRef:'result://current',resultDigest:hash('current result')},
    {basisId:h.execution.basisRef,runId:h.call.runId});
  assert(h.owner.nativeWorkReacquisitionResultMatches(request,value,h.coordinate()));
  const judged=h.append('c_call_judged',h.call.cCallRef,{judgment:'advance',resultRef:result.payload.resultRef,resultDigest:result.payload.resultDigest},
    {basisId:h.execution.basisRef,runId:h.call.runId,causationEventRefs:[result.eventId]});
  h.append('graph_call_closed','graph-call://current',{}, {runId:h.call.runId});
  for(let i=0;i<40;i++)h.append('activity_observed','unrelated:'+i,{}, {runId:'run://unrelated'});
  assert(h.owner.nativeWorkReacquisitionResultMatches(request,clone(value),h.coordinate()));
  const parent={...h.execution,basisRef:'basis://parent'},input={parentBasis:parent,parentCCallRef:'c-call://c2-workflow',runId:h.call.runId,task:value};
  h.append('c_call_opened',input.parentCCallRef,{callClass:'workflow',childGraphFunctionRef:p.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef},
    {basisId:parent.basisRef,runId:h.call.runId});
  assert(h.owner.projectReacquiredNativeWorkCommandSourceAtPrefix(h.prefix(),input,h.coordinate()));
  const warm={...h.counts};assert.equal(warm.task,1);assert.equal(warm.catalog,1);assert.equal(warm.terminal,1);assert.equal(warm.cold,0);
  h.cover(false);assert.equal(h.owner.projectReacquiredNativeWorkCommandSourceAtPrefix(h.prefix(),input,h.coordinate()),null);h.cover(true);
  const changed={...value,taskDigest:hash('wrong')};assert.equal(h.owner.nativeWorkReacquisitionResultMatches(request,changed,h.coordinate()),false);
  assert.equal(h.owner.authenticateNativeWorkReacquisition(h.basis,request,true),null,'stale preparation cut');
  const cold=h.owner.nativeWorkReacquisitionResultMatches(request,clone(value),clone(h.coordinate()));assert(cold);assert(h.counts.cold>0);
  h.cold();assert(h.owner.nativeWorkReacquisitionResultMatches(request,clone(value),h.coordinate()));h.warm();
  const afterCold={...h.counts};
  // Native failed residue invalidates complete read scope, including unselected source paths.
  const entry=request.currentContext.entries.find(e=>e.state==='file'),bytesChanged=Buffer.from('later admitted failure residue');
  const {kind,schemaVersion,observationRef,observationDigest,...body}=request.currentContext;
  const changedBody={...body,entries:body.entries.map(e=>e.relativePath===entry.relativePath?{...e,bytes:bytesChanged.toString('base64'),byteLength:bytesChanged.length,digest:p.sha256Bytes(bytesChanged)}:e)},d=hash(changedBody);
  const after={kind,schemaVersion,...changedBody,observationRef:'worksite-context-observation://abiogenesis/'+d.slice(7),observationDigest:d};
  const failure={kind:'native_workspace_work_failure',schemaVersion:'5.0.0',failureClass:'result_contract_failure',diagnosticRef:'diagnostic://fixture/partial',
    task:p.constructNativeWorkspaceWorkTask({workspaceAuthorityBasis:request.workspaceAuthorityBasis,workspaceBinding:request.workspaceBinding,capabilityGrant:request.capabilityGrant,context:request.currentContext,
      outcome:'Fixture partial failure',instructions:['Read the selected file.'],readFirst:[entry.relativePath],writeRoots:[entry.relativePath],checks:[]}),before:request.currentContext,after,changedPaths:[entry.relativePath],observationFailure:null,report:null,
    provenance:{...h.source.provenance,cCallRef:'c-call://later-failure',actorInvocationRef:'actor://later-failure'}};
  assert(p.isNativeWorkspaceWorkFailure(failure));
  h.append('c_call_result_admitted',failure.provenance.cCallRef,{resultClass:'failure',value:failure},{runId:'run://later',graphFunctionRef:p.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef});
  assert.equal(h.owner.projectReacquiredNativeWorkCommandSourceAtPrefix(h.prefix(),input,h.coordinate()),null);
  t.diagnostic(JSON.stringify({requestBytes:Buffer.byteLength(canonicalJson(request)),taskBytes:bytes,first,warm,afterCold,final:h.counts,
    elapsedMs:performance.now()-start,peakRSS:process.resourceUsage().maxRSS,premises:'Native admission/execution/R10 selection and binding-cover mappings supplied; real catalog reconstruction, Product constructors, prefix lineage scope and current native invalidation executed. No retained history or physical source access.'}));
});
