import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import * as p from '../../build/code/src/product/index.js';
import * as gtl from '../../build/code/src/gtl/index.js';
import * as validator from '../../build/code/src/validator/index.js';
import * as reacquire from '../../build/code/src/abg/native_work_reacquisition.js';
import { readRuntimeEventsAtDurablePrefix } from '../../build/code/src/abg/event_store.js';
import { selectValidatedRuntimeEventPrefix } from '../../build/code/src/abg/event_prefix.js';
import { deriveInvocationSourceResultBasisAtPrefix } from '../../build/code/src/abg/invocation_admission.js';
import { projectExactInvocationAdmissionAtPrefix } from '../../build/code/src/abg/invocation_execution_truth.js';
import { projectNativeWorkCommandSourceAtPrefix } from '../../build/code/src/abg/native_worksite_execution.js';
import { constructNativeWorkspaceWorkObservation } from '../../build/code/src/product/native_workspace_work.js';
import { ABI5_WORKSITE_COMMAND_EXECUTION_PRODUCT_SEMANTICS as semantics } from '../../build/code/src/product/builtin_semantics.js';
const hash=p.sha256Canonical, ids=p.NATIVE_WORK_REACQUISITION_IDS;
const actualRoot=process.env.ABG_NATIVE_REACQUISITION_RETAINED_ROOT;
let loaded;
function actual(){
  if(loaded)return loaded;
  const begin=performance.now(),read=n=>JSON.parse(fs.readFileSync(path.join(actualRoot,n),'utf8'));
  const prepared=read('preparation.json'),start=read('run-start.jsonl'),delivery=read('delivery.json');
  const coordinate=delivery.receipt.resources.eventResource.closeHandoff.prefix;
  const events=readRuntimeEventsAtDurablePrefix(coordinate),prefix=selectValidatedRuntimeEventPrefix(events);
  const result=events.find(e=>e.kind==='c_call_result_admitted'&&e.payload.value?.kind==='native_workspace_work_observation');assert(result);
  const source=result.payload.value,resources=start.invocation.resources;
  const request=p.constructNativeWorksiteCommandReacquisitionRequest({workspaceAuthorityBasis:source.task.workspaceAuthorityBasis,
    workspaceBinding:source.task.workspaceBinding,capabilityGrant:source.task.capabilityGrant,sourceNativeWork:source,
    source:{prefix:coordinate,graphCallRef:result.graphCallId,declarationProof:{kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog:resources.catalog,catalogView:resources.catalogView}},
    currentContext:source.after,selectedSources:source.after.entries.filter(e=>e.state==='file').map(e=>({relativePath:e.relativePath,
      subjectUri:pathToFileURL(path.join(source.task.workspaceAuthorityBasis.canonicalRoot,e.relativePath)).href})),
    commands:[{commandId:'command://reacquisition/component',executable:'node',args:['--version'],relativeCwd:'.',environment:{},timeoutMs:1000,terminationGraceMs:100,expectedReports:[]}],
    outcomePredicates:[],allowedWriteTerritories:[{pathKind:'subtree',relativePath:'.reacquisition-component-evidence'}]});
  // Deliberately unadmitted preparation coordinate: pure source projection is
  // useful before admission; actual execution must refuse this absent CCall.
  const nativeBasis={predecessorPrefix:coordinate,cCallRef:'c-call://reacquisition/unadmitted-component'};
  loaded={prepared,coordinate,events,prefix,result,source,request,nativeBasis,readMs:performance.now()-begin};return loaded;
}
test('reacquisition publishes one ordinary F_D with existing C2 output and native owner semantics',()=>{
  const artifact={productId:p.ABI5_PRODUCT_ID,packageName:p.ABI5_PACKAGE_NAME,packageVersion:p.ABI5_PACKAGE_VERSION,
    artifactDigest:hash('uninstalled'),productContentDigest:hash('uninstalled-content'),productManifestDigest:hash('uninstalled-manifest')};
  const publication=gtl.constructWorksiteCommandExecutionModulePublication(artifact),program=publication.programs.find(p=>p.programRef===ids.programRef);
  const raw=(v,k)=>{const r=validator.rawAdmitValue(v,k,'contract://reacquisition/component');assert.equal(r.kind,'raw_admitted_value');return r;};
  const pub=raw(publication,'module_publication');
  const result=validator.validateProgram({declarationBasisDigest:pub.subjectDigest,programPublication:pub,program:raw(program,'gtl_program'),
    graphFunctions:publication.graphFunctions.map(g=>raw(g,'graph_function')),contracts:publication.contracts.map(c=>raw(c,'contract_declaration')),
    implementationBindings:publication.implementationBindings.map(b=>raw(b,'implementation_binding')),
    closureContracts:publication.closureContracts.map(c=>raw(c,'closure_contract')),rules:[],evaluators:[]});
  assert.equal(result.kind,'program_validation',JSON.stringify(result));
  assert.equal(result.disposition,'valid',JSON.stringify(result));
  assert.equal(result.diagnostics.length,0);
  assert.deepEqual(gtl.nativeWorkReacquisitionGraphFunction().effects,[]);
});
test('actual closed child survives blocked parent without acquiring closed-Run source authority', {skip:!actualRoot}, async t=>{
  const a=actual(),begin=performance.now();
  const task=reacquire.projectNativeWorkReacquisitionTask(a.coordinate,a.request,a.nativeBasis);assert(task,'R10 child/source projection');
  assert(p.isNativeWorksiteCommandExecutionTask(task));assert.deepEqual(task.sourceNativeWork,a.source);
  assert.deepEqual(task.sourceReacquisition.request.currentContext,a.source.after);
  assert.equal(a.source.after.entries.filter(e=>e.state==='file').length,35);
  assert.deepEqual(task.sourceReacquisition.bindingCoverEventRefs,[]);
  assert.equal(await reacquire.nativeWorkReacquisitionContextCurrent(a.request),true,'complete actual current physical context');
  const source=projectNativeWorkCommandSourceAtPrefix(a.prefix,task),invocation=projectExactInvocationAdmissionAtPrefix(a.prefix,source.sourceBasis.invocationAdmissionRef);
  assert.equal(deriveInvocationSourceResultBasisAtPrefix(a.prefix,{publicAuthorityDigest:invocation.publicRequestDigest,
    invocationAdmissionRef:invocation.invocationAdmissionRef,runtimeInvocationRef:invocation.invocationRef,runId:a.result.runId,resultRef:a.result.payload.resultRef}),null,
    'legacy Public terminal-Run source law remains closed');
  assert.equal(reacquire.authenticateNativeWorkReacquisition(a.nativeBasis,a.request),null,'caller-created task supplies no admitted F_D occurrence');
  assert.equal(reacquire.nativeWorkReacquisitionResultMatches(a.request,task),false);
  t.diagnostic(JSON.stringify({readParseMs:a.readMs,sourceJoinAnd35FileObservationMs:performance.now()-begin,eventCount:a.events.length,
    originalResult:a.result.eventId,originalValueDigest:a.result.payload.valueDigest,sourceGraphCall:a.result.graphCallId,
    limit:'Actual preserved child/current files. Same W has empty cover. No new invocation, witness, command, result admission or provider.'}));
});
test('actual source rejects absent child, foreign provenance, changed context and uncovered authority',{skip:!actualRoot},async()=>{
  const a=actual();
  const wrong=p.constructNativeWorksiteCommandReacquisitionRequest({...a.request,source:{...a.request.source,graphCallRef:'graph-call://foreign'}});
  assert.equal(reacquire.projectNativeWorkReacquisitionTask(a.coordinate,wrong,a.nativeBasis),null);
  const foreign=constructNativeWorkspaceWorkObservation(a.source.task,a.source.after,a.source.report,{...a.source.provenance,cCallRef:'c-call://foreign'});
  const crossed=p.constructNativeWorksiteCommandReacquisitionRequest({...a.request,sourceNativeWork:foreign});
  assert.equal(reacquire.projectNativeWorkReacquisitionTask(a.coordinate,crossed,a.nativeBasis),null);
  assert.throws(()=>p.constructNativeWorksiteCommandReacquisitionRequest({...a.request,currentContext:{...a.request.currentContext,entries:[]}}));
  const {kind,schemaVersion,bindingId,bindingDigest,admissionEventRef,...body}=a.request.workspaceBinding;
  const changed={...body,lockId:'lock://reacquisition/unadmitted',lockDigest:hash('unadmitted')},digest=hash(changed);
  const binding={kind,schemaVersion,...changed,bindingId:'workspace-binding://abiogenesis/'+digest.slice(7),bindingDigest:digest,admissionEventRef:'event://unadmitted-binding'};
  const {kind:gk,schemaVersion:gs,grantRef,grantDigest,...gb}=a.request.capabilityGrant,grantBody={...gb,scopeRef:binding.bindingId,scopeDigest:binding.bindingDigest},gd=hash(grantBody);
  const grant={kind:gk,schemaVersion:gs,...grantBody,grantRef:'capability-grant://abiogenesis/'+gd.slice(7),grantDigest:gd};
  const {kind:ck,schemaVersion:cs,observationRef,observationDigest,...cb}=a.request.currentContext;
  const currentBody={...cb,workspaceBindingIdentity:binding.bindingId,workspaceBindingDigest:binding.bindingDigest},cd=hash(currentBody);
  const context={kind:ck,schemaVersion:cs,...currentBody,observationRef:'worksite-context-observation://abiogenesis/'+cd.slice(7),observationDigest:cd};
  const uncovered=p.constructNativeWorksiteCommandReacquisitionRequest({...a.request,workspaceBinding:binding,capabilityGrant:grant,currentContext:context});
  assert.equal(reacquire.projectNativeWorkReacquisitionTask(a.coordinate,uncovered,a.nativeBasis),null);
});

// Execute the exact compiled new owner with explicit current-owner lookup
// premises. Historical child/current files are checked above against the real
// resource. These synthetic new CCalls are not admitted events or installed proof.
async function currentOwnerFixture(){
  const { SourceTextModule,SyntheticModule }=await import('node:vm');
  const a=actual(),sourceTask=p.constructNativeWorksiteCommandExecutionTask(a.request),source=projectNativeWorkCommandSourceAtPrefix(a.prefix,sourceTask);assert(source);
  const {coordinateDigest,...pb}=a.coordinate,body={...pb,prefixLength:pb.prefixLength+1,prefixDigest:hash('current lookup only')};
  const coordinate={...body,coordinateDigest:hash(body)},nativeBasis={predecessorPrefix:coordinate,cCallRef:'c-call://reacquisition/current-lookup'};
  const gf=gtl.nativeWorkReacquisitionGraphFunction();
  const execution={...source.sourceBasis,basisRef:'execution-basis://reacquisition/current-lookup',basisDigest:hash('current execution'),
    invocationAdmissionRef:'invocation-admission://reacquisition/current-lookup',invocationRef:'invocation://reacquisition/current-lookup',
    rootImplementationSetRef:'implementation-set://reacquisition/current-lookup',rootImplementationSetDigest:hash('current set'),
    graphFunctionRef:gf.name,graphFunctionDigest:hash(gf),rawInputValue:a.request,rawInputDigest:hash(a.request)};
  const graph=gtl.materializeGraph(gf,{invocationAdmissionRef:execution.invocationAdmissionRef,admittedInputRef:execution.rawInputAdmissionRef,
    admittedInputDigest:execution.rawInputDigest,admittedInput:a.request});
  Object.assign(execution,{graphRef:graph.materializationRef,graphDigest:graph.materializationDigest});
  const call={cCallRef:nativeBasis.cCallRef,basisId:execution.basisRef,runId:'run://reacquisition/current-lookup',callClass:'leaf',regime:'F_D',
    implementationRef:ids.implementationRef,implementationBindingRef:ids.implementationBindingRef,graphFunctionRef:gf.name,programLocusRef:ids.nodeRef,
    inputContractRef:ids.requestContractRef,outputContractRef:p.WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef};
  const events=[{kind:'c_call_opened',aggregateId:call.cCallRef,basisId:execution.basisRef}],prefix={events};
  let sourceCurrent=true,coverCurrent=true,occurrenceCurrent=true,ownerImpl=ids.implementationRef;
  const overrides={
    './event_store.js':{readRuntimeEventsAtDurablePrefix:(_p,opts)=>{if(opts?.requireCurrent&&!occurrenceCurrent)throw Error('stale occurrence');return events;},authenticateRuntimePrefixAncestry:()=>true,reidentifyHistoricalDurablePrefixCoordinate:(_current,historical)=>historical},
    './event_prefix.js':{selectValidatedRuntimeEventPrefix:events=>({events}),runtimeEventsFromValidatedPrefix:p=>p.events,
      runtimePrefixComputation:(_prefix,_key,construct)=>construct()}, // Mutable lookup fixture supplies no retained owner lineage.
    './project_read_ports.js':{projectClosedGraphCallTerminalAtDurablePrefix:()=>({value:a.source,producer:{graphFunction:{ref:p.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef},
      executionBasis:{ref:source.sourceBasis.basisRef},cCallRef:a.source.provenance.cCallRef,resultAdmissionEventRef:a.result.eventId,judgmentAdmissionEventRef:source.sourceJudgment.eventId}})},
    './invocation_execution_truth.js':{projectExactExecutionBasisAtPrefix:(_p,ref)=>ref===execution.basisRef?execution:ref===source.sourceBasis.basisRef?source.sourceBasis:null,
      projectExactInvocationAdmissionAtPrefix:()=>({capabilityGrants:[a.request.capabilityGrant]})},
    './environment_admission.js':{projectExactPrefixWorkspaceEnvironment:()=>({kind:'exact_prefix_workspace_environment',workspaceAuthorityBasis:a.request.workspaceAuthorityBasis,workspaceBinding:a.request.workspaceBinding})},
    './worksite_revision.js':{projectWorksiteRevisionBindingCover:()=>coverCurrent?[]:null},
    './c_call.js':{projectOpenedCCallCarrierAtPrefix:()=>({...call,implementationRef:ownerImpl}),projectCCallCarrierPhaseAtPrefix:()=>({phase:'selected_no_evidence'})},
    './execution_basis.js':{rehydrateAdmittedImplementationSetAtPrefix:()=>({implementationSetDigest:execution.rootImplementationSetDigest,rows:[call]})},
    './native_worksite_execution.js':{projectNativeWorkCommandSourceAtPrefix:()=>sourceCurrent?source:null},
  };
  async function load(file,extra={}){
    const module=new SourceTextModule(fs.readFileSync(file,'utf8'),{identifier:file});
    await module.link(async spec=>{
      const native=await import(spec.startsWith('node:')?spec:pathToFileURL(path.resolve(path.dirname(file),spec)).href),values={...native,...overrides[spec],...extra[spec]};
      return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});
    });await module.evaluate();return module.namespace;
  }
  const owner=await load(path.resolve('build/code/src/abg/native_work_reacquisition.js'));
  const implementation=await load(path.resolve('build/code/src/implementation/native_work_reacquisition.js'),{'../abg/native_work_reacquisition.js':owner});
  return {a,source,owner,implementation,nativeBasis,call,execution,events,prefix,
    setSource:v=>{sourceCurrent=v;},setCover:v=>{coverCurrent=v;},setCurrent:v=>{occurrenceCurrent=v;},setImpl:v=>{ownerImpl=v;}};
}
test('current F_D owner prepares the original result and C2 requires its admitted advancing handoff',{skip:!actualRoot},async()=>{
  const h=await currentOwnerFixture(),occurrence={cCallRef:h.call.cCallRef,nativeWorkReacquisitionBasis:h.nativeBasis};
  const result=await h.implementation.prepareNativeWorksiteCommandReacquisition(h.a.request,occurrence),task=result.resultCandidate;
  assert.equal(result.disposition,'success');assert.deepEqual(task.sourceNativeWork,h.a.source);
  assert.equal(result.evidenceCandidates[0].kind,'deterministic_evidence_candidate');
  assert.equal(h.owner.nativeWorkReacquisitionResultMatches(h.a.request,task),true);
  assert.equal(h.owner.nativeWorkReacquisitionResultMatches({...h.a.request,requestDigest:hash('foreign')},task),false);
  const parent={...h.execution,basisRef:'execution-basis://reacquisition/parent'};
  const input={parentBasis:parent,parentCCallRef:'c-call://reacquisition/c2-workflow',runId:h.call.runId,task};
  assert.equal(h.owner.projectReacquiredNativeWorkCommandSourceAtPrefix(h.prefix,input),null,'task alone cannot supply preparation admission');
  const admitted={kind:'c_call_result_admitted',aggregateId:h.call.cCallRef,basisId:h.execution.basisRef,runId:h.call.runId,eventId:'lookup:result',admissionOrdinal:2,
    payload:{resultClass:'success',value:task,valueDigest:hash(task),resultRef:'result://lookup',resultDigest:hash('lookup-result')}};
  const judged={kind:'c_call_judged',aggregateId:h.call.cCallRef,basisId:h.execution.basisRef,runId:h.call.runId,eventId:'lookup:judgment',admissionOrdinal:3,
    causationEventRefs:[admitted.eventId],payload:{judgment:'advance',resultRef:admitted.payload.resultRef,resultDigest:admitted.payload.resultDigest}};
  h.events.push(admitted,judged,{kind:'c_call_opened',aggregateId:input.parentCCallRef,basisId:parent.basisRef,runId:h.call.runId,admissionOrdinal:4,
    payload:{callClass:'workflow',childGraphFunctionRef:p.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef}});
  assert.equal(h.owner.projectReacquiredNativeWorkCommandSourceAtPrefix(h.prefix,input),h.source);
  judged.payload.judgment='refuse';assert.equal(h.owner.projectReacquiredNativeWorkCommandSourceAtPrefix(h.prefix,input),null);judged.payload.judgment='advance';
  h.setSource(false);assert.equal(h.owner.projectReacquiredNativeWorkCommandSourceAtPrefix(h.prefix,input),null);h.setSource(true);
  h.setCover(false);assert.equal(h.owner.projectReacquiredNativeWorkCommandSourceAtPrefix(h.prefix,input),null);h.setCover(true);
  h.setCurrent(false);await assert.rejects(h.implementation.prepareNativeWorksiteCommandReacquisition(h.a.request,occurrence));h.setCurrent(true);
  h.setImpl('implementation://foreign');await assert.rejects(h.implementation.prepareNativeWorksiteCommandReacquisition(h.a.request,occurrence));
  await assert.rejects(h.implementation.prepareNativeWorksiteCommandReacquisition(h.a.request,{cCallRef:h.call.cCallRef}));
});
test('later admitted failure invalidates full reacquired context beyond the C2 snapshot subset',{skip:!actualRoot},async()=>{
  const a=actual(),{projectRuntimeEventFromValidatedHistory}=await import('../../build/code/src/abg/event_store.js');
  const {deepFreeze}=await import('../../build/code/src/shared/immutable.js');
  const {isNativeWorkspaceWorkFailure}=await import('../../build/code/src/product/native_workspace_work.js');
  const request=p.constructNativeWorksiteCommandReacquisitionRequest({...a.request,selectedSources:a.request.selectedSources.slice(0,1)});
  const task=p.constructNativeWorksiteCommandExecutionTask({...request,sourceReacquisition:{request,nativeBasis:a.nativeBasis,bindingCoverEventRefs:[]}});
  assert(projectNativeWorkCommandSourceAtPrefix(a.prefix,task));
  const selectedPath=a.request.selectedSources[1].relativePath;
  const {kind,schemaVersion,observationRef,observationDigest,...contextBody}=a.source.after,bytes=Buffer.from('later admitted failed-write residue');
  const changedBody={...contextBody,entries:contextBody.entries.map(e=>e.relativePath===selectedPath?{...e,bytes:bytes.toString('base64'),byteLength:bytes.length,digest:p.sha256Bytes(bytes)}:e)},digest=hash(changedBody);
  const after={kind,schemaVersion,observationRef:'worksite-context-observation://abiogenesis/'+digest.slice(7),observationDigest:digest,...changedBody};
  const failure={kind:'native_workspace_work_failure',schemaVersion:'5.0.0',failureClass:'result_contract_failure',diagnosticRef:'diagnostic://reacquisition/residue',
    task:{...a.source.task,context:a.source.after},before:a.source.after,after,changedPaths:[selectedPath],observationFailure:null,report:null,
    provenance:{...a.source.provenance,cCallRef:'c-call://reacquisition/later-failure',actorInvocationRef:'actor://reacquisition/later-failure'}};
  assert(isNativeWorkspaceWorkFailure(failure));
  const {eventId,admissionOrdinal,payloadDigest,eventContractDigest,...old}=a.result;
  const residue=projectRuntimeEventFromValidatedHistory(a.events,{...old,aggregateId:failure.provenance.cCallRef,causationEventRefs:[a.events.at(-1).eventId],
    payload:{...old.payload,cCallRef:failure.provenance.cCallRef,contractRef:p.NATIVE_WORKSPACE_WORK_IDS.failureContractRef,resultClass:'failure',valueKind:failure.kind,value:failure,valueDigest:hash(failure)}});
  assert.equal(projectNativeWorkCommandSourceAtPrefix(selectValidatedRuntimeEventPrefix(deepFreeze([...a.events,residue])),task),null);
});
