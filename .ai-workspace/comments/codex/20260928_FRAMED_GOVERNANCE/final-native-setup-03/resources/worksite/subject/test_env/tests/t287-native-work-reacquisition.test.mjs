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
import { constructAbgHistoricalDeclarationReference } from '../../build/code/src/abg/terminal_result_contracts.js';
import { runtimeEventPhysicalPrefix, ROOT_EVENT_CONTRACT_DIGEST } from '../../build/code/src/abg/event_store.js';
import { deepFreeze } from '../../build/code/src/shared/immutable.js';
import { loadWorksiteOwner, worksiteFixture } from '../support/t287-generic-job-worksite.mjs';
const hash=p.sha256Canonical, ids=p.NATIVE_WORK_REACQUISITION_IDS;
const actualRoot=process.env.ABG_NATIVE_REACQUISITION_RETAINED_ROOT;

// Bounded owner controls: exact Product values, physical cuts and CCall
// phase/Result/J reconstruction. Environment/declaration/native producer and
// occurrence lookups are explicit premises; no installed or Run claim follows.
async function declarationFixture(t, inline=false) {
  const product=await loadWorksiteOwner(),env=await worksiteFixture(product);
  t.after(()=>fs.rmSync(env.scratch,{recursive:true,force:true}));
  fs.writeFileSync(path.join(env.canonicalRoot,'source.txt'),'retained source');
  const context=await product.observeWorksiteContext({...env,readRoots:['source.txt'],maxFiles:1,maxBytes:100});
  const nativeTask=p.constructNativeWorkspaceWorkTask({workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,capabilityGrant:env.capabilityGrant,
    context,outcome:'retain source',instructions:['Read source.'],readFirst:['source.txt'],writeRoots:['source.txt'],checks:[]});
  const observation=constructNativeWorkspaceWorkObservation(nativeTask,context,{summary:'retained',gaps:[]},{cCallRef:'c-call://source',executionAuthorityRef:'authority://source',
    executionAuthorityDigest:hash('source authority'),actorInvocationRef:'actor://source',transportBindingRef:'transport://source',transportBindingDigest:hash('transport'),promptDigest:hash('prompt'),transportDigest:hash('delivery')});
  const declaration=deepFreeze({kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog:{basisDigest:hash('constructor'),readinessBasisDigest:hash('constructor ready'),readinessBasis:{retained:'complete proof body'}},
    catalogView:{catalogBasisDigest:hash('constructor'),viewDigest:hash('constructor view'),allowlist:['constructor']}});
  const primary=deepFreeze({...declaration,catalog:{...declaration.catalog,basisDigest:hash('terminal')},catalogView:{...declaration.catalogView,catalogBasisDigest:hash('terminal')}});
  const resource=deepFreeze({kind:'abg_historical_graph_call_source_resource',schemaVersion:'5.0.0',declarationProof:primary,declarationDependencies:[declaration]});
  const event=(kind,ordinal,payload,extra={})=>({eventId:'event://declaration/'+ordinal,admissionOrdinal:ordinal,payloadDigest:hash(payload),eventContractDigest:ROOT_EVENT_CONTRACT_DIGEST,
    aggregateType:'c_call',aggregateId:'unused',parentAggregateId:'frame://prepare',correlationId:'component',eventTime:'2026-09-28T00:00:00.000Z',workflowVersion:'5.0.0',
    scopeClass:'run',basisId:'basis://prepare',runId:'run://prepare',graphCallId:'graph-call://prepare',frameId:'frame://prepare',causationEventRefs:[],kind,payload,...extra});
  const old=event('graph_call_closed',1,{}, {aggregateType:'graph_call',aggregateId:'graph-call://source',runId:'run://source',graphCallId:'graph-call://source'});
  const coordinate=rows=>{const physical=runtimeEventPhysicalPrefix(rows),body={kind:'durable_prefix_coordinate',schemaVersion:'5.0.0',eventLogRef:'file:///unopened/declaration-component.events.jsonl',
    prefixLength:physical.byteLength,prefixDigest:physical.digest,storeIdentity:{device:0,inode:0,eventContractDigest:ROOT_EVENT_CONTRACT_DIGEST}};return deepFreeze({...body,coordinateDigest:hash(body)});};
  const request=p.constructNativeWorksiteCommandReacquisitionRequest({...env,sourceNativeWork:observation,currentContext:context,
    source:{prefix:coordinate([old]),graphCallRef:old.graphCallId,...(inline?{declarationProof:declaration}:{declarationReference:constructAbgHistoricalDeclarationReference(declaration)})},
    selectedSources:[{relativePath:'source.txt',subjectUri:pathToFileURL(path.join(env.canonicalRoot,'source.txt')).href}],
    commands:[{commandId:'command://component',executable:'node',args:['--version'],relativeCwd:'.',environment:{},timeoutMs:1000,terminationGraceMs:100,expectedReports:[]}],outcomePredicates:[],allowedWriteTerritories:[{pathKind:'subtree',relativePath:'evidence'}]});
  const identity={basisId:'basis://prepare',graphCallId:'graph-call://prepare',frameId:'frame://prepare',vectorIndex:0,stageRole:'native-command-reacquisition',taskOrdinal:null,attempt:1,programLocusRef:ids.nodeRef,retryPath:[]};
  const call={kind:'c_call',schemaVersion:'5.0.0',...identity,cCallRef:'c-call:'+hash(identity),cCallDigest:hash(identity),callClass:'leaf',regime:'F_D',armId:'arm://component',compositionRef:null,
    implementationSetRef:'set://prepare',implementationRef:ids.implementationRef,implementationBindingRef:ids.implementationBindingRef,graphFunctionRef:ids.graphFunctionRef,runId:'run://prepare',
    inputContractRef:ids.requestContractRef,outputContractRef:p.WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef,evidenceContractRef:p.WORKSITE_COMMAND_EXECUTION_IDS.evidenceContractRef,
    judgmentContractRef:p.WORKSITE_COMMAND_EXECUTION_IDS.judgmentContractRef,judgmentPredicateRef:ids.predicateRef,openedEventRef:'event://declaration/2',fibreSelectedEventRef:'event://declaration/3'};
  const opened=event('c_call_opened',2,{cCallRef:call.cCallRef,cCallDigest:call.cCallDigest,callClass:'leaf',cursorRef:'cursor://prepare'},{aggregateId:call.cCallRef});
  const fibre=event('c_call_fibre_selected',3,{cCallRef:call.cCallRef,callClass:'leaf',regime:call.regime,armId:call.armId,compositionRef:null,implementationSetRef:call.implementationSetRef},
    {aggregateId:call.cCallRef,causationEventRefs:[opened.eventId]});
  const before=deepFreeze([old,opened,fibre]),nativeBasis={predecessorPrefix:coordinate(before),cCallRef:call.cCallRef};
  const heldPrefix=selectValidatedRuntimeEventPrefix(before);
  const gf=gtl.nativeWorkReacquisitionGraphFunction(),basis={...env.executionBasis,basisRef:identity.basisId,invocationAdmissionRef:'invocation://prepare',invocationRef:'runtime://prepare',
    rootImplementationSetRef:call.implementationSetRef,rootImplementationSetDigest:hash('set'),graphFunctionRef:gf.name,graphFunctionDigest:hash(gf),rawInputValue:request,rawInputDigest:hash(request),rawInputAdmissionRef:'raw://prepare'};
  const graph=gtl.materializeGraph(gf,{invocationAdmissionRef:basis.invocationAdmissionRef,admittedInputRef:basis.rawInputAdmissionRef,admittedInputDigest:basis.rawInputDigest,admittedInput:request});
  Object.assign(basis,{graphRef:graph.materializationRef,graphDigest:graph.materializationDigest});
  const source={sourceBasis:{...env.executionBasis,basisRef:'basis://source'},sourceResult:{eventId:'source-result',runId:'run://source',graphCallId:old.graphCallId},sourceJudgment:{eventId:'source-judgment'},sourceClosedEvent:old};
  const state={source:true,cover:true,current:true,impl:ids.implementationRef,declarationReads:0,reads:0};
  const overrides={
    './event_prefix.js':{selectValidatedRuntimeEventPrefix:rows=>rows===before?heldPrefix:selectValidatedRuntimeEventPrefix(rows)},
    './event_store.js':{readRuntimeEventsAtDurablePrefix:(_p,options)=>{state.reads++;if(options?.requireCurrent&&!state.current)throw Error('stale occurrence');return before;},authenticateRuntimePrefixAncestry:()=>true,reidentifyHistoricalDurablePrefixCoordinate:(_c,h)=>h},
    './project_read_ports.js':{projectClosedGraphCallTerminalAtDurablePrefix:(_p,_g,proof)=>{state.declarationReads++;return JSON.stringify(proof)===JSON.stringify(declaration)?{value:observation,
      producer:{graphFunction:{ref:p.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef},executionBasis:{ref:source.sourceBasis.basisRef},cCallRef:observation.provenance.cCallRef,resultAdmissionEventRef:source.sourceResult.eventId,judgmentAdmissionEventRef:source.sourceJudgment.eventId}}:null;}},
    './invocation_execution_truth.js':{projectExactExecutionBasisAtPrefix:(_p,ref)=>ref===basis.basisRef?basis:ref===source.sourceBasis.basisRef?source.sourceBasis:null,
      projectExactInvocationAdmissionAtPrefix:()=>({capabilityGrants:[request.capabilityGrant]})},
    './environment_admission.js':{projectExactPrefixWorkspaceEnvironment:()=>({kind:'exact_prefix_workspace_environment',workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding})},
    './worksite_revision.js':{projectWorksiteRevisionBindingCover:()=>state.cover?[]:null},
    './c_call.js':{projectOpenedCCallCarrierAtPrefix:()=>({...call,implementationRef:state.impl})},
    './execution_basis.js':{rehydrateAdmittedImplementationSetAtPrefix:()=>({implementationSetDigest:basis.rootImplementationSetDigest,rows:[call]})},
    './native_worksite_execution.js':{projectNativeWorkCommandSourceAtPrefix:()=>state.source?source:null},
  };
  const {SourceTextModule,SyntheticModule}=await import('node:vm');
  async function load(file,extra={},names=[]) {const module=new SourceTextModule(fs.readFileSync(file,'utf8')+(names.length?'\nexport { '+names.join(',')+' };':''),{identifier:file});await module.link(async spec=>{
    const actual=await import(spec.startsWith('node:')?spec:pathToFileURL(path.resolve(path.dirname(file),spec)).href),values={...actual,...overrides[spec],...extra[spec]};
    return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});await module.evaluate();return module.namespace;}
  const owner=await load(path.resolve('build/code/src/abg/native_work_reacquisition.js'));
  const implementation=await load(path.resolve('build/code/src/implementation/native_work_reacquisition.js'),{'../abg/native_work_reacquisition.js':owner});
  const builtin=await load(path.resolve('build/code/src/product/builtin_semantics.js'),{'../abg/native_work_reacquisition.js':owner});
  const leaf=await load(path.resolve('build/code/src/implementation/leaf_invocation_port.js'),{'../abg/native_work_reacquisition.js':owner},['nativeLeafProofOperations','nativeJudgmentProofOperations']);
  const task=p.constructNativeWorksiteCommandExecutionTask({...request,sourceReacquisition:{request,nativeBasis,bindingCoverEventRefs:[]}});
  const evidence=event('c_call_evidenced',4,{cCallRef:call.cCallRef,evidenceRef:'evidence://prepare',evidenceClass:'deterministic',contractRef:call.evidenceContractRef,
    implementationRef:ids.implementationRef,inputDigest:hash(request),outputDigest:hash(task)},{aggregateId:call.cCallRef,causationEventRefs:[fibre.eventId]});
  const resultBody={cCallRef:call.cCallRef,contractRef:call.outputContractRef,resultClass:'success',valueKind:task.kind,value:task,valueDigest:hash(task),evidenceRefs:[evidence.payload.evidenceRef]};
  const result=event('c_call_result_admitted',5,{...resultBody,resultRef:'result://abiogenesis/'+hash(resultBody).slice(7),resultDigest:hash(resultBody)},
    {aggregateId:call.cCallRef,causationEventRefs:[evidence.eventId]});
  const judgmentBody={cCallRef:call.cCallRef,contractRef:call.judgmentContractRef,judgment:'advance',reasonRef:ids.predicateRef,predicateRef:ids.predicateRef,resultRef:result.payload.resultRef,resultDigest:result.payload.resultDigest};
  const judgment=event('c_call_judged',6,{...judgmentBody,judgmentRef:'judgment://abiogenesis/'+hash(judgmentBody).slice(7),judgmentDigest:hash(judgmentBody)},
    {aggregateId:call.cCallRef,causationEventRefs:[result.eventId]});
  const parentBasis={...basis,basisRef:'basis://parent'},parentCCallRef='c-call://parent';
  const parent=event('c_call_opened',7,{callClass:'workflow',childGraphFunctionRef:p.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef},{aggregateId:parentCCallRef,basisId:parentBasis.basisRef});
  const events=deepFreeze([...before,evidence,result,judgment,parent]);
  return {owner,implementation,builtin,leaf,request,task,declaration,resource,nativeBasis,call,basis,state,events,coordinate,source,
    input:{parentBasis,parentCCallRef,runId:call.runId,task},project:rows=>owner.projectReacquiredNativeWorkCommandSourceAtPrefix(selectValidatedRuntimeEventPrefix(deepFreeze(rows)),{parentBasis,parentCCallRef,runId:call.runId,task})};
}

test('reference preparation resolves exact dependencies in leaf and builtin fallbacks before warm reuse',async t=>{
  const f=await declarationFixture(t),occurrence={cCallRef:f.call.cCallRef,nativeWorkReacquisitionBasis:f.nativeBasis};
  assert.equal(f.owner.authenticateNativeWorkReacquisition(f.nativeBasis,f.request),null);
  const candidate=await f.implementation.prepareNativeWorksiteCommandReacquisition(f.request,occurrence,undefined,undefined,undefined,f.resource);
  assert.deepEqual(candidate.resultCandidate,f.task);assert.equal(f.state.declarationReads,1);
  const relation=f.builtin.ABI5_WORKSITE_COMMAND_EXECUTION_PRODUCT_SEMANTICS.resolveJudgmentRelation(ids.predicateRef);
  assert.equal(relation.evaluate(f.request,f.task,undefined,undefined,f.resource),true);
  assert.equal(f.state.declarationReads,1,'same immutable dependency reuses establishment');
  const leafProof=f.leaf.nativeLeafProofOperations(ids.implementationRef,f.request,occurrence,f.resource);
  assert.deepEqual(leafProof.nativeWorkReacquisition(f.request,occurrence).task,f.task);
  assert.throws(()=>leafProof.nativeWorkReacquisition(structuredClone(f.request),occurrence));
  assert.equal(f.leaf.nativeJudgmentProofOperations(ids.predicateRef,f.request,f.task,undefined,f.resource).nativeWorkReacquisition(),true);
  for(const resource of [undefined,{...f.resource,declarationDependencies:[]},{...f.resource,declarationDependencies:[f.declaration,f.declaration]},
    {...f.resource,declarationDependencies:[{...f.declaration,catalogView:{...f.declaration.catalogView,viewDigest:hash('crossed')}}]}]) {
    assert.equal(f.owner.authenticateNativeWorkReacquisition(f.nativeBasis,f.request,false,resource),null);
    assert.equal(relation.evaluate(f.request,f.task,undefined,undefined,resource),false);
    assert.equal(f.leaf.nativeLeafProofOperations(ids.implementationRef,f.request,occurrence,resource).nativeWorkReacquisition(f.request,occurrence),null);
    assert.equal(f.leaf.nativeJudgmentProofOperations(ids.predicateRef,f.request,f.task,undefined,resource).nativeWorkReacquisition(),false);
    await assert.rejects(f.implementation.prepareNativeWorksiteCommandReacquisition(f.request,occurrence,undefined,undefined,undefined,resource));
  }
  const altered={...f.resource,declarationDependencies:[{...f.declaration,catalog:{...f.declaration.catalog,readinessBasis:{retained:'crossed bytes'}}}]};
  assert.equal(relation.evaluate(f.request,f.task,undefined,undefined,altered),false,'equal selectors do not substitute different proof bodies');
  f.state.current=false;
  await assert.rejects(f.implementation.prepareNativeWorksiteCommandReacquisition(f.request,occurrence,undefined,undefined,undefined,f.resource));
  f.state.current=true;fs.writeFileSync(path.join(f.request.workspaceAuthorityBasis.canonicalRoot,'source.txt'),'changed after preparation');
  await assert.rejects(f.implementation.prepareNativeWorksiteCommandReacquisition(f.request,occurrence,undefined,undefined,undefined,f.resource));
});

test('cold admitted preparation consumes Result/J without declaration resolution or history reread',async t=>{
  const f=await declarationFixture(t),cold=()=>JSON.parse(JSON.stringify(f.events));
  assert.deepEqual(f.project(cold()),f.source);
  assert.equal(f.state.declarationReads,0);assert.equal(f.state.reads,0);
  assert.equal(f.project(cold().slice(0,4)),null,'before Result');
  assert.equal(f.project(cold().slice(0,5)),null,'before judgment');
  for(const alter of [rows=>rows[3].payload.inputDigest=hash('crossed input'),rows=>rows[3].payload.outputDigest=hash('crossed output'),
    rows=>rows[3].payload.implementationRef='implementation://foreign',rows=>rows[4].aggregateId='c-call://foreign',
    rows=>rows[5].causationEventRefs=[],rows=>rows[5].payload.judgment='refuse',rows=>rows[6].payload.childGraphFunctionRef='graph-function://foreign']) {
    const rows=cold();alter(rows);assert.equal(f.project(rows),null);
  }
  f.state.source=false;assert.equal(f.project(cold()),null);f.state.source=true;
  f.state.cover=false;assert.equal(f.project(cold()),null);f.state.cover=true;
  f.state.impl='implementation://foreign';assert.equal(f.project(cold()),null);
});

test('inline request and task identities remain unchanged through cold admitted consumption',async t=>{
  const f=await declarationFixture(t,true),request=JSON.parse(JSON.stringify(f.request));
  assert.deepEqual(p.constructNativeWorksiteCommandReacquisitionRequest(request),f.request);
  assert(p.isNativeWorksiteCommandReacquisitionRequest(request));
  assert.deepEqual(f.project(JSON.parse(JSON.stringify(f.events))),f.source);
  assert.equal(f.state.declarationReads,0);assert.equal(f.state.reads,0);
  assert.equal(f.owner.nativeWorkReacquisitionResultMatches(request,f.task),true);
  assert.equal(f.state.declarationReads,1,'new establishment still needs the original inline proof');
});
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
