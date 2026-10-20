import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { syncBuiltinESMExports } from 'node:module';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import { performance } from 'node:perf_hooks';
import * as p from '../../build/code/src/product/index.js';
import { constructNativeWorkspaceWorkObservation, isNativeWorkspaceWorkFailure } from '../../build/code/src/product/native_workspace_work.js';
import * as gtl from '../../build/code/src/gtl/index.js';
import * as events from '../../build/code/src/abg/event_store.js';
import * as prefixes from '../../build/code/src/abg/event_prefix.js';
import { deepFreeze } from '../../build/code/src/shared/immutable.js';
import { loadWorksiteOwner, worksiteFixture } from '../support/t287-generic-job-worksite.mjs';
const root=resolve(import.meta.dirname,'../..'),hash=p.sha256Canonical;
const ids=p.NATIVE_WORK_REACQUISITION_IDS,native=p.NATIVE_WORKSPACE_WORK_IDS,c2=p.WORKSITE_COMMAND_EXECUTION_IDS;
async function instrument(name,overrides={}){
 const file=join(root,'build/code/src/abg',name+'.js'),m=new SourceTextModule(fs.readFileSync(file,'utf8'),{identifier:file});
 await m.link(async spec=>{const real=await import(spec.startsWith('node:')?spec:pathToFileURL(resolve(dirname(file),spec)).href),v={...real,...overrides[spec]};
  return new SyntheticModule(Object.keys(v),function(){for(const[k,value]of Object.entries(v))this.setExport(k,value);});});
 await m.evaluate();return m.namespace;
}
const time='2026-09-22T00:00:00.000Z';
function event(kind,payload,extra={}){return {kind,payload,eventTime:time,aggregateType:'workspace',aggregateId:'workspace://coordinate-fixture',
 parentAggregateId:null,causationEventRefs:[],correlationId:'correlation://coordinate-fixture',workflowVersion:'5.0.0',scopeClass:'workspace',basisId:'basis://coordinate-fixture',...extra};}
function callScope(call,gf,basis,run='run://coordinate/current'){return {aggregateType:'c_call',aggregateId:call,parentAggregateId:'frame://'+call,
 scopeClass:'run',runId:run,graphCallId:'graph-call://'+call,frameId:'frame://'+call,graphFunctionRef:gf,basisId:basis};}
function openPair(store,scope,regime,impl,child){return events.admitRuntimeEventBatch(store,[
 ()=>event('c_call_opened',{cCallRef:scope.aggregateId,cCallDigest:hash(scope.aggregateId),callClass:child?'workflow':'leaf',
 batchRef:null,taskOrdinal:null,attempt:1,programLocusRef:'node://coordinate/'+scope.aggregateId,retryPath:[],
 ...(child?{childGraphFunctionRef:child,failureContractRef:'contract://failure',judgmentPredicateRef:'predicate://child'}:{})},scope),
 prior=>event('c_call_fibre_selected',{cCallRef:scope.aggregateId,callClass:child?'workflow':'leaf',armId:'arm://fixture',regime,
 ...(child?{}:{implementationRef:impl,implementationBindingRef:impl===native.implementationRef?native.implementationBindingRef:ids.implementationBindingRef}),
 ...(child?{childGraphFunctionRef:child}:{})},{...scope,causationEventRefs:[prior.at(-1).eventId]})]);}
function result(store,scope,value,contract,evidence=[]){return events.admitRuntimeEvent(store,event('c_call_result_admitted',{
 cCallRef:scope.aggregateId,resultRef:'result://'+scope.aggregateId,resultDigest:hash({call:scope.aggregateId,value}),resultClass:'success',
 contractRef:contract,evidenceRefs:evidence,value,valueDigest:hash(value),valueKind:value.kind},
 {...scope,causationEventRefs:store.readAll().filter(e=>e.kind==='c_call_evidenced'&&evidence.includes(e.payload.evidenceRef)).map(e=>e.eventId)}));}
function judge(store,scope,row){return events.admitRuntimeEvent(store,event('c_call_judged',{cCallRef:scope.aggregateId,
 judgmentRef:'judgment://'+scope.aggregateId,judgmentDigest:hash(row.eventId),resultRef:row.payload.resultRef,resultDigest:row.payload.resultDigest,
 judgment:'advance',retryAttemptRef:null},{...scope,causationEventRefs:[row.eventId]}));}
// Real Product task/value predicates, event-store writes/codec/cold reads, and
// native source invalidation. Terminal/environment/CCall lookup premises are
// supplied lower-owner facts, as in the existing reacquisition component proof.
async function fixture(t,{prepareOnly=false,materialBytes=0}={}){
 const owner=await loadWorksiteOwner(),env=await worksiteFixture(owner);t.after(()=>fs.rmSync(env.scratch,{force:true,recursive:true}));
 for(const name of ['source.txt','context.txt'])fs.writeFileSync(join(env.canonicalRoot,name),'retained fixture '+name+'\n');
 const context=await owner.observeWorksiteContext({...env,readRoots:['source.txt','context.txt'],maxFiles:2,maxBytes:1000});
 const scope={workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,capabilityGrant:env.capabilityGrant};
 const task=p.constructNativeWorkspaceWorkTask({...scope,context,outcome:'fixture work',instructions:['Retain selected source.'+'x'.repeat(materialBytes)],readFirst:['source.txt'],writeRoots:['source.txt','context.txt'],checks:[]});
 const source=constructNativeWorkspaceWorkObservation(task,context,{summary:'fixture observation',gaps:[]},{cCallRef:'c-call://coordinate/source',
 executionAuthorityRef:'authority://coordinate/source',executionAuthorityDigest:hash('authority'),actorInvocationRef:'actor://coordinate/source',
 transportBindingRef:'transport://coordinate/source',transportBindingDigest:hash('binding'),promptDigest:hash('prompt'),transportDigest:hash('transport')});
 const acquired=events.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:join(env.scratch,'events.jsonl')});
 assert(acquired.store);let store=acquired.store;t.after(()=>store.closeDurableLog());
 const originalBasis={basisRef:'execution-basis://coordinate/source',graphFunctionRef:native.graphFunctionRef,rawInputValue:source.task,
 workspaceBindingId:env.workspaceBinding.bindingId,workspaceBindingDigest:env.workspaceBinding.bindingDigest,closureContractRef:'closure://source',invocationAdmissionRef:'invocation-admission://source'};
 const sourceScope=callScope(source.provenance.cCallRef,native.graphFunctionRef,originalBasis.basisRef,'run://coordinate/source');
 openPair(store,sourceScope,'F_P',native.implementationRef);
 const evidence=events.admitRuntimeEvent(store,event('c_call_evidenced',{cCallRef:sourceScope.aggregateId,contractRef:'contract://evidence',evidenceClass:'probabilistic_transport',
 evidenceRef:'evidence://source',evidenceDigest:hash('evidence'),implementationRef:native.implementationRef,inputDigest:hash(source.task),outputDigest:hash(source),nativeResultAssessment:{kind:'component_supplied_transport_assessment'},transportDigest:source.provenance.transportDigest},sourceScope));
 const original=result(store,sourceScope,source,native.observationContractRef,[evidence.payload.evidenceRef]),originalJudgment=judge(store,sourceScope,original);
 const closed=events.admitRuntimeEvent(store,event('graph_call_closed',{graphCallId:sourceScope.graphCallId,frameClosedEventRef:originalJudgment.eventId,closureContractRef:'closure://source'},
 {...sourceScope,aggregateType:'graph_call',aggregateId:sourceScope.graphCallId,causationEventRefs:[originalJudgment.eventId]}));
 const originalCut=events.selectHeldEventStoreDurablePrefix(store);
 const request=p.constructNativeWorksiteCommandReacquisitionRequest({...scope,sourceNativeWork:source,currentContext:source.after,
 source:{prefix:originalCut,graphCallRef:sourceScope.graphCallId,declarationProof:{kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog:{fixture:true},catalogView:{fixture:true}}},
 selectedSources:[{relativePath:'source.txt',subjectUri:pathToFileURL(join(env.canonicalRoot,'source.txt')).href}],
 commands:[{commandId:'command://fixture',executable:'node',args:['--version'],relativeCwd:'.',environment:{},timeoutMs:1000,terminationGraceMs:100,expectedReports:[]}],
 outcomePredicates:[],allowedWriteTerritories:[{pathKind:'subtree',relativePath:'evidence'}]});
 const gf=gtl.nativeWorkReacquisitionGraphFunction(),execution={basisRef:'execution-basis://coordinate/preparation',invocationAdmissionRef:'invocation-admission://current',
 invocationRef:'invocation://current',rootImplementationSetRef:'implementation-set://current',rootImplementationSetDigest:hash('set'),graphFunctionRef:gf.name,
 graphFunctionDigest:hash(gf),rawInputValue:request,rawInputDigest:hash(request),rawInputAdmissionRef:'input://preparation',workspaceBindingId:env.workspaceBinding.bindingId,workspaceBindingDigest:env.workspaceBinding.bindingDigest};
 const graph=gtl.materializeGraph(gf,{invocationAdmissionRef:execution.invocationAdmissionRef,admittedInputRef:execution.rawInputAdmissionRef,admittedInputDigest:execution.rawInputDigest,admittedInput:request});
 Object.assign(execution,{graphRef:graph.materializationRef,graphDigest:graph.materializationDigest});
 for(const label of ['root','child'])events.admitRuntimeEvent(store,event('basis_admitted',{basisClass:'root',basisRef:'basis://'+label,basisDigest:hash(label),rawInputValue:request}));
 const prepScope=callScope('c-call://coordinate/preparation',gf.name,execution.basisRef);
 openPair(store,prepScope,'F_D',ids.implementationRef);
 const nativeBasis={predecessorPrefix:events.selectHeldEventStoreDurablePrefix(store),cCallRef:prepScope.aggregateId};
 const constructed=p.constructNativeWorksiteCommandExecutionTask({...request,sourceReacquisition:{request,nativeBasis,bindingCoverEventRefs:[]}});
 const admitted=prepareOnly?null:result(store,prepScope,constructed,c2.taskContractRef),judged=prepareOnly?null:judge(store,prepScope,admitted);
 const parent={...execution,basisRef:'execution-basis://coordinate/parent'};
 const parentScope=callScope('c-call://coordinate/c2','graph-function://consumer',parent.basisRef);
 if(!prepareOnly)openPair(store,parentScope,'F_D',null,c2.graphFunctionRef);
 const call={cCallRef:prepScope.aggregateId,basisId:execution.basisRef,runId:prepScope.runId,callClass:'leaf',regime:'F_D',implementationRef:ids.implementationRef,
 implementationBindingRef:ids.implementationBindingRef,graphFunctionRef:gf.name,programLocusRef:ids.nodeRef,inputContractRef:ids.requestContractRef,outputContractRef:c2.taskContractRef};
 let covers=true,coldDecodes=0;
 const inv={capabilityGrants:[env.capabilityGrant],workspaceBindingId:env.workspaceBinding.bindingId,workspaceBindingDigest:env.workspaceBinding.bindingDigest,workspaceId:env.workspaceAuthorityBasis.workspaceId};
 const truth={'./invocation_execution_truth.js':{projectExactExecutionBasisAtPrefix:(_prefix,ref)=>ref===execution.basisRef?execution:ref===originalBasis.basisRef?originalBasis:null,
 projectExactInvocationAdmissionAtPrefix:()=>inv}};
 const sourceOwner=await instrument('native_worksite_execution',truth);
 const reacquire=await instrument('native_work_reacquisition',{...truth,
 './event_store.js':{readRuntimeEventsAtDurablePrefix:(...args)=>{
  const observed=measure(()=>events.readRuntimeEventsAtDurablePrefix(...args));
  if(observed.reads>0)coldDecodes++; // Each successful cold reader authenticates and decodes once.
  return observed.value;
 }},
 './project_read_ports.js':{projectClosedGraphCallTerminalAtDurablePrefix:()=>({value:source,producer:{graphFunction:{ref:native.graphFunctionRef},executionBasis:{ref:originalBasis.basisRef},
 cCallRef:source.provenance.cCallRef,resultAdmissionEventRef:original.eventId,judgmentAdmissionEventRef:originalJudgment.eventId}})},
 './environment_admission.js':{projectExactPrefixWorkspaceEnvironment:()=>({kind:'exact_prefix_workspace_environment',workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding})},
 './worksite_revision.js':{projectWorksiteRevisionBindingCover:()=>covers?[]:null},
 './c_call.js':{projectOpenedCCallCarrierAtPrefix:()=>call,projectCCallCarrierPhaseAtPrefix:()=>({phase:'selected_no_evidence'})},
 './execution_basis.js':{rehydrateAdmittedImplementationSetAtPrefix:()=>({implementationSetDigest:execution.rootImplementationSetDigest,rows:[call]})},
 './native_worksite_execution.js':{projectNativeWorkCommandSourceAtPrefix:sourceOwner.projectNativeWorkCommandSourceAtPrefix},
 });
 const consumer=await instrument('native_worksite_execution',{'./native_work_reacquisition.js':reacquire});
 const input={parentBasis:parent,parentCCallRef:parentScope.aggregateId,runId:prepScope.runId,task:JSON.parse(JSON.stringify(constructed))};
 const latest=()=>({coordinate:events.selectHeldEventStoreDurablePrefix(store),prefix:prefixes.selectValidatedRuntimeEventPrefix(store.readAll())});
 return {env,parent,execution,originalBasis,parentScope,get store(){return store;},get coldDecodes(){return coldDecodes;},source,sourceScope,original,closed,request,nativeBasis,constructed,admitted,judged,input,consumer,reacquire,latest,call,prepScope,
 reopen:()=>{const handoff=store.projectReopenAuthorityAndClose(),opened=events.reopenEventStore(structuredClone(handoff.reopenAuthority));
  assert.equal(opened.kind,'reopened_event_store_context');store=opened.store;return opened.prefix;},
 completePreparation:value=>{const r=result(store,prepScope,value,c2.taskContractRef);judge(store,prepScope,r);return r;},setCover:v=>{covers=v;}};
}
function measure(callback){
 const original=fs.readSync;let reads=0,bytes=0;
 fs.readSync=(...args)=>{const n=original(...args);reads++;bytes+=n;return n;};syncBuiltinESMExports();const start=performance.now();
 try{return {value:callback(),reads,bytes,elapsedMs:performance.now()-start};}finally{fs.readSync=original;syncBuiltinESMExports();}
}
test('post-stop Run and Workspace replay retain the JSON-cloned preparation owner and identical cold semantics',async t=>{
 const {privateOwner}=await import('../support/r10-private-owner-harness.mjs');
 const material=process.env.ABI5_C10_MATERIAL==='1';
 const f=await fixture(t,{materialBytes:material?10_000_000:0}),run=f.prepScope.runId;
 const roots=new Map();
 for(const runId of ['run://coordinate/source',run]){
  const basis={...f.parent,basisClass:'root',basisRef:'basis://readback/'+runId};roots.set(basis.basisRef,basis);
  events.admitRuntimeEvent(f.store,event('run_segment_opened',{runId,runDigest:hash(runId),executionBasisRef:basis.basisRef,
   executionBasisDigest:hash(basis.basisRef),graphRef:basis.graphRef,graphDigest:basis.graphDigest,graphFunctionRef:basis.graphFunctionRef,
   invocationAdmissionRef:basis.invocationAdmissionRef,invocationRef:basis.invocationRef,programRef:'program://readback',workspaceBindingId:basis.workspaceBindingId},
   {aggregateType:'run',aggregateId:runId,
   parentAggregateId:basis.workspaceBindingId,scopeClass:'run',runId,basisId:basis.basisRef}));
 }
 const child={...f.execution,basisClass:'child',basisRef:'basis://readback/c2',basisDigest:hash('child'),parentExecutionBasisRef:f.parent.basisRef,
  parentCCallRef:f.input.parentCCallRef,rawInputValue:f.input.task};
 const childEvent=events.admitRuntimeEvent(f.store,event('basis_admitted',child,{scopeClass:'run',runId:run,basisId:child.basisRef,aggregateType:'frame',aggregateId:'frame://readback',frameId:'frame://readback',graphCallId:'graph-call://readback'}));
 const route=events.admitRuntimeEvent(f.store,event('traversal_route_admitted',{routeKind:'blocked',routeRef:'route://readback/blocked',
  routeDigest:hash('route'),declarationRef:'declaration://readback/blocked',declarationDigest:hash('declaration'),
  sourceCursorRef:'cursor://readback',sourceCursorDigest:hash('cursor'),consumedAvailabilityRefs:[],replayStateDigest:hash('replay')},
  {scopeClass:'run',runId:run,aggregateType:'frame',aggregateId:'frame://readback',graphCallId:'graph-call://readback',frameId:'frame://readback',causationEventRefs:[childEvent.eventId]}));
 events.admitRuntimeEvent(f.store,event('run_stopped',{disposition:'blocked',routeRef:route.payload.routeRef,reasonRef:'reason://retained-residual'},
  {scopeClass:'run',runId:run,aggregateType:'run',aggregateId:run,causationEventRefs:[route.eventId]}));
 const lookup=(_prefix,ref)=>roots.get(ref)??(ref===child.basisRef?child:ref===f.parent.basisRef?f.parent:null);
 const ownerCalls=[];
 // As in the original component fixture, exact execution/source-basis lookup
 // is supplied. The replay, historical cut, storage/codec, reacquisition proof,
 // source uniqueness and currentness owners execute their real emitted code.
 const replay=await privateOwner('abg/replay.js',[],{
  './invocation_execution_truth.js':{projectExactExecutionBasisAtPrefix:lookup},
  './invocation_admission.js':{deriveSameRunWorksiteCommandSourceBasisAtPrefix:(cut,input,current)=>{
   ownerCalls.push({current,cut});
   const source=f.consumer.projectSameRunNativeWorkCommandSourceAtPrefix(cut,input,current);
   return source===null?null:{sourceResultRef:source.sourceResult.payload.resultRef,sourceResultDigest:source.sourceResult.payload.resultDigest,
    sourceResultAdmissionEventRef:source.sourceResult.eventId,sourceResultJudgmentEventRef:source.sourceJudgment.eventId,
    sourceGraphCallId:source.sourceResult.graphCallId,sourceRunId:source.sourceResult.runId};
  }}
 });
 const reads=await privateOwner('abg/project_read_ports.js',['prepareRead','projectWorkspaceReplay','projectPreparedRead'],{
  './replay.js':replay,'./invocation_execution_truth.js':{projectExactExecutionBasisAtPrefix:lookup}
 });
 const {prefix,coordinate}=f.latest(),taskBytes=Buffer.byteLength(JSON.stringify(f.input.task));
 if(material)assert(taskBytes>=20_000_000&&taskBytes<=26_000_000,taskBytes);
 const cold=measure(()=>replay.projectRunSemanticReplayProjection(prefix,run));assert(cold.reads>0);const coldDecodes=f.coldDecodes;assert.equal(coldDecodes,1);
 const warm=measure(()=>{
  const truth=reads.projectRunTruthAtDurablePrefix(coordinate,run);
  const result=reads.prepareRunReadAtDurablePrefix(coordinate,'run_result',run)?.project();
  const runReplay=reads.prepareRunReadAtDurablePrefix(coordinate,'run_replay',run)?.project();
  const packet={kind:'abg_project_read_packet',schemaVersion:'5.0.0',memberKey:'workspace_replay',prefix:coordinate,targetRef:'workspace://coordinate-fixture'};
  const prepared=reads.prepareRead('workspace_replay',packet,coordinate);
  const workspace=reads.projectPreparedRead(prepared,()=>reads.projectWorkspaceReplay(prepared,packet.targetRef)).value;
  return {truth,result,runReplay,workspace};
 });
 assert.equal(warm.value.truth.kind,'abg_run_truth_projection',JSON.stringify(warm.value.truth));
 assert.equal(warm.value.truth.runtimeStatus,'blocked');assert.equal(warm.value.truth.terminalResult,null);
 assert.equal(warm.value.result.kind,'abg_project_read_refusal');assert.equal(warm.value.result.code,'target_absent');
 assert.equal(warm.value.runReplay.kind,'abg_project_read_projection');
 assert.deepEqual(warm.value.runReplay.value,{...cold.value,runtimeStatus:'blocked',terminalResult:null});
 assert.deepEqual(warm.value.workspace.runReplays.find(r=>r.runId===run),cold.value);
 assert.equal(warm.reads,0);assert.equal(f.coldDecodes,coldDecodes);assert(ownerCalls.some(row=>row.current===coordinate));
 const cut=prefixes.validatedRuntimeEventPrefixBeforeEvent(prefix,childEvent.eventId);
 for(const row of ownerCalls)assert.deepEqual(prefixes.runtimeEventsFromValidatedPrefix(row.cut),prefixes.runtimeEventsFromValidatedPrefix(cut));
 const copied=measure(()=>replay.projectRunSemanticReplayProjection(prefix,run,JSON.parse(JSON.stringify(coordinate))));
 assert.deepEqual(copied.value,cold.value);assert(copied.reads>0);
 const rawWorkspace=measure(()=>reads.WorkspaceProjectionPort.workspace_replay({kind:'abg_project_read_packet',schemaVersion:'5.0.0',
  memberKey:'workspace_replay',prefix:JSON.parse(JSON.stringify(coordinate)),targetRef:'workspace://coordinate-fixture'}));
 assert.equal(rawWorkspace.value.kind,'abg_project_read_projection');assert.deepEqual(rawWorkspace.value.value,warm.value.workspace);assert(rawWorkspace.reads>0);
 const viewDigest=cold.value.viewDigest;
 f.store.projectReopenAuthorityAndClose();
 const closed=measure(()=>replay.projectRunSemanticReplayProjection(prefix,run,coordinate));
 assert.deepEqual(closed.value,cold.value);assert(closed.reads>0);
 t.diagnostic(JSON.stringify({taskBytes,historyBytes:coordinate.prefixLength,viewDigest,
  ordinary:{reads:cold.reads,bytes:cold.bytes,nativeHistoryDecodes:coldDecodes},held:{reads:warm.reads,bytes:warm.bytes,nativeHistoryDecodes:0},copied:{reads:copied.reads,bytes:copied.bytes},
  rawWorkspace:{reads:rawWorkspace.reads,bytes:rawWorkspace.bytes},closed:{reads:closed.reads,bytes:closed.bytes},
  limits:'Disposable admitted event fixtures with supplied lower execution/source-basis/terminal lookups; actual replay/read ports and native historical owner. No installed C10 readback, assessment adequacy or OOM cure.'}));
});
test('C2 consumer reidentifies its copied preparation cut while preserving source/output and cold fallback',async t=>{
 const f=await fixture(t),{coordinate,prefix}=f.latest();
 assert.notEqual(f.input.task.sourceReacquisition.nativeBasis.predecessorPrefix,f.nativeBasis.predecessorPrefix);
 assert(fs.readFileSync(f.store.configuredDurableLogPath(),'utf8').includes('abg_admitted_body_reference_record'),'accepted body codec participates');
 const ordinary=measure(()=>f.consumer.projectSameRunNativeWorkCommandSourceAtPrefix(prefix,f.input));assert(ordinary.value);assert(ordinary.reads>0);
 const warm=measure(()=>f.consumer.projectSameRunNativeWorkCommandSourceAtPrefix(prefix,f.input,coordinate));
 assert.deepEqual(warm.value,ordinary.value);assert.equal(warm.reads,0);assert.equal(warm.bytes,0);
 assert.deepEqual(f.input.task,f.constructed,'no task/basis identity rewritten');
 const copy=measure(()=>f.consumer.projectSameRunNativeWorkCommandSourceAtPrefix(prefix,f.input,structuredClone(coordinate)));
 assert.deepEqual(copy.value,ordinary.value);assert(copy.reads>0,'unbound current hint retains cold authentication');
 f.store.projectReopenAuthorityAndClose();
 const cold=measure(()=>f.consumer.projectSameRunNativeWorkCommandSourceAtPrefix(prefix,f.input,coordinate));
 assert.deepEqual(cold.value,ordinary.value);assert(cold.reads>0,'closed owner cannot reuse active correspondence');
 t.diagnostic(JSON.stringify({ordinary:{reads:ordinary.reads,bytes:ordinary.bytes,elapsedMs:ordinary.elapsedMs},warm:{reads:warm.reads,bytes:warm.bytes,elapsedMs:warm.elapsedMs},
 copied:{reads:copy.reads,bytes:copy.bytes,elapsedMs:copy.elapsedMs},closed:{reads:cold.reads,bytes:cold.bytes,elapsedMs:cold.elapsedMs},taskDigest:hash(f.input.task),
 limit:'Exact compiled C2 native-source consumer and real storage/codec; declared terminal/environment/CCall lookup premises supplied. No installed Run or OOM cure.'}));
});
test('reopened C2 consumer retains the original native and preparation cuts without another physical read',async t=>{
 const f=await fixture(t),before=f.latest();
 const expected=f.consumer.projectSameRunNativeWorkCommandSourceAtPrefix(before.prefix,f.input,before.coordinate);assert(expected);
 const acquisition=measure(()=>f.reopen());assert(acquisition.bytes>0);
 const reopened=f.latest();
 const first=measure(()=>f.consumer.projectSameRunNativeWorkCommandSourceAtPrefix(reopened.prefix,f.input,reopened.coordinate));
 assert.deepEqual(first.value,expected);assert.equal(first.reads,0);
 const next=measure(()=>f.consumer.projectSameRunNativeWorkCommandSourceAtPrefix(reopened.prefix,structuredClone(f.input),reopened.coordinate));
 assert.deepEqual(next.value,expected);assert.equal(next.reads,0);
 f.store.projectReopenAuthorityAndClose();
 const cold=measure(()=>f.consumer.projectSameRunNativeWorkCommandSourceAtPrefix(reopened.prefix,f.input,reopened.coordinate));
 assert.deepEqual(cold.value,expected);assert(cold.bytes>0);
 t.diagnostic(JSON.stringify({acquisitionReads:acquisition.reads,firstConsumerReads:first.reads,nextConsumerReads:next.reads,closedReads:cold.reads,
  limit:'Real storage, cold decoder, native source and C2/reacquisition predicates; existing terminal/environment/CCall facts remain explicit component premises.'}));
});
test('a later duplicate producer invalidates current C2 consumption while its historical cut remains valid',async t=>{
 const f=await fixture(t),before=f.latest();
 const consume=prefix=>f.consumer.projectSameRunNativeWorkCommandSourceAtPrefix(prefix,f.input,before.coordinate);
 const expected=consume(before.prefix);assert(expected);
 const history=prefixes.runtimeEventsFromValidatedPrefix(before.prefix);
 const {eventId,admissionOrdinal,payloadDigest,eventContractDigest,...candidate}=f.admitted;
 const duplicate=events.projectRuntimeEventFromValidatedHistory(history,{...candidate,causationEventRefs:[history.at(-1).eventId]});
 const diagnostic=prefixes.selectValidatedRuntimeEventPrefix(deepFreeze([...history,duplicate]));
 assert.equal(consume(diagnostic),null,'two eligible preparation Results cannot reuse one producer proof');
 assert.deepEqual(consume(before.prefix),expected,'the exact earlier cut preserves its source');
});
test('C2 coordinate reuse preserves wrong/foreign cut, absent advancing producer, binding-cover and latest failed-mutation refusal',async t=>{
 const f=await fixture(t),before=f.latest();
 const consume=(prefix=before.prefix,input=f.input,coordinate=before.coordinate)=>f.consumer.projectSameRunNativeWorkCommandSourceAtPrefix(prefix,input,coordinate);
 assert(consume());
 const badInput=mutate=>{const task=structuredClone(f.input.task);mutate(task.sourceReacquisition.nativeBasis);return {...f.input,task};};
 assert.equal(consume(before.prefix,badInput(b=>{b.cCallRef='c-call://foreign';})),null);
 assert.equal(consume(before.prefix,badInput(b=>{b.predecessorPrefix.prefixDigest=hash('wrong');})),null);
 const foreign=events.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:join(f.env.scratch,'foreign.jsonl')});assert(foreign.store);t.after(()=>foreign.store.closeDurableLog());
 assert.equal(consume(before.prefix,badInput(b=>{b.predecessorPrefix=foreign.prefix;})),null);
 const beforeJudgment=prefixes.validatedRuntimeEventPrefixBeforeEvent(before.prefix,f.judged.eventId);
 assert.equal(consume(beforeJudgment),null,'task cannot replace admitted advancing producer');
 f.setCover(false);assert.equal(consume(),null);f.setCover(true);
 // Actual native invalidator consumes a later admitted failed-write observation
 // outside the C2 selected snapshot member but inside complete read context.
 const {kind,schemaVersion,observationRef,observationDigest,...body}=f.source.after,bytes=Buffer.from('later failed write\n');
 const changed={...body,entries:body.entries.map(row=>row.relativePath==='context.txt'?{...row,bytes:bytes.toString('base64'),byteLength:bytes.length,digest:p.sha256Bytes(bytes)}:row)};
 const digest=hash(changed),after={kind,schemaVersion,...changed,observationRef:'worksite-context-observation://abiogenesis/'+digest.slice(7),observationDigest:digest};
 const failure={kind:'native_workspace_work_failure',schemaVersion:'5.0.0',failureClass:'result_contract_failure',diagnosticRef:'diagnostic://coordinate/residue',
 task:f.source.task,before:f.source.after,after,changedPaths:['context.txt'],observationFailure:null,report:null,
 provenance:{...f.source.provenance,cCallRef:'c-call://coordinate/later',actorInvocationRef:'actor://coordinate/later'}};
 assert(isNativeWorkspaceWorkFailure(failure));
 events.admitRuntimeEvent(f.store,event('c_call_result_admitted',{...f.original.payload,cCallRef:failure.provenance.cCallRef,resultClass:'failure',
 contractRef:native.failureContractRef,valueKind:failure.kind,value:failure,valueDigest:hash(failure)},
 {...f.sourceScope,aggregateId:failure.provenance.cCallRef,causationEventRefs:[f.closed.eventId]}));
 const latest=f.latest();assert(consume(before.prefix),'the historical valid source is still valid history');
 assert.equal(consume(latest.prefix,f.input,latest.coordinate),null,'latest admitted residue invalidates complete context');
});

test('separate installed reacquisition realization and judgment use exact original owner; C2 occurrence stays owner-bound',async t=>{
 const {privateOwner}=await import('../support/r10-private-owner-harness.mjs');
 const {isolatedCompiledCopy}=await import('../support/isolated-compiled-copy.mjs');
 const f=await fixture(t,{prepareOnly:true}),copy=isolatedCompiledCopy(t);
 const implementation=await copy.load('implementation/native_work_reacquisition.js');
 const semantics=(await copy.load('product/builtin_semantics.js')).ABI5_WORKSITE_COMMAND_EXECUTION_PRODUCT_SEMANTICS;
 const port=await privateOwner('implementation/leaf_invocation_port.js',['nativeLeafProofOperations','nativeJudgmentProofOperations','nativeOccurrenceVerifier'],{
  '../abg/native_work_reacquisition.js':f.reacquire,
  // Exact C2 assembly lookup is supplied here; its physical/closure relation is
  // covered by the existing C2 preparation checks, not reminted by this fixture.
  '../abg/execution_basis.js':{authenticateNativeInstructionAssemblyBasis:b=>b===occurrence.nativeInstructionAssemblyBasis?{call:occurrence}:null}
 });
 const occurrence={cCallRef:f.call.cCallRef,runId:f.prepScope.runId,graphCallId:f.prepScope.graphCallId,frameId:f.prepScope.frameId,
  programLocusRef:ids.nodeRef,taskOrdinal:null,attempt:1,executionAuthority:null,nativeWorkReacquisitionBasis:f.nativeBasis};
 const operations=port.nativeLeafProofOperations(ids.implementationRef,f.request,occurrence);
 const warm=measure(()=>operations.nativeWorkReacquisition(f.request,occurrence));assert(warm.value);assert.equal(warm.reads,0);
 const out=await implementation.prepareNativeWorksiteCommandReacquisition(f.request,occurrence,undefined,undefined,operations);
 assert.equal(out.disposition,'success');assert.deepEqual(out.resultCandidate,f.constructed);
 await assert.rejects(()=>implementation.prepareNativeWorksiteCommandReacquisition(f.request,{...occurrence},undefined,undefined,operations),/exact admitted/);
 f.completePreparation(out.resultCandidate);const prefix=f.latest().coordinate;
 const cloned=structuredClone(out.resultCandidate),relation=semantics.resolveJudgmentRelation(ids.predicateRef);
 const judged=measure(()=>relation.evaluate(f.request,cloned,prefix,port.nativeJudgmentProofOperations(ids.predicateRef,f.request,cloned,prefix)));
 assert(judged.value);assert.equal(judged.reads,0);
 assert.equal(operations.nativeWorkReacquisition(f.request,occurrence),null,'stale preparation cannot redispatch');
 const changed={...cloned,taskDigest:hash('changed')};
 assert.equal(relation.evaluate(f.request,changed,prefix,port.nativeJudgmentProofOperations(ids.predicateRef,f.request,changed,prefix)),false);
 // Copied-module cold fallback remains available and agrees on unchanged proof.
 const cold=measure(()=>f.reacquire.nativeWorkReacquisitionResultMatches(f.request,cloned,structuredClone(prefix)));
 assert(cold.value);assert(cold.reads>0);
 const c2Occurrence={cCallRef:'c-call://c2',runId:'run://c2',graphCallId:'graph-call://c2',frameId:'frame://c2',
  programLocusRef:c2.nodeRef,taskOrdinal:null,attempt:1,executionAuthority:null,nativeInstructionAssemblyBasis:{fixture:'exact current owner'}};
 const checker=await privateOwner('implementation/leaf_invocation_port.js',['nativeOccurrenceVerifier'],{
  '../abg/execution_basis.js':{authenticateNativeInstructionAssemblyBasis:b=>b===c2Occurrence.nativeInstructionAssemblyBasis?{call:c2Occurrence}:null}});
 const c2module=await privateOwner(copy.path('implementation/worksite_command_execution.js'),['exactAuthorityFreeOccurrence']);
 const verify=checker.nativeOccurrenceVerifier(c2Occurrence),{nativeInstructionAssemblyBasis,...coordinates}=c2Occurrence;
 assert.deepEqual(c2module.exactAuthorityFreeOccurrence(c2Occurrence,verify),coordinates);
 assert.throws(()=>c2module.exactAuthorityFreeOccurrence({...c2Occurrence,attempt:2},verify),/differs from admitted/);
 assert.throws(()=>c2module.exactAuthorityFreeOccurrence(c2Occurrence),/differs from admitted/,'raw/cold caller cannot replace authenticated owner');
 f.store.projectReopenAuthorityAndClose();
 const closed=measure(()=>relation.evaluate(f.request,cloned,prefix,port.nativeJudgmentProofOperations(ids.predicateRef,f.request,cloned,prefix)));
 assert(closed.value);assert(closed.reads>0,'operation retains cold behavior after original store closes');
 t.diagnostic(JSON.stringify({warmReads:warm.reads,judgmentReads:judged.reads,copiedReads:cold.reads,closedReads:closed.reads,
  limit:'Actual disposable physical store, context and separately loaded realization/predicate; existing native admission/R10 lookup and C2 assembly selection premises supplied. No helper/provider dispatch.'}));
});
