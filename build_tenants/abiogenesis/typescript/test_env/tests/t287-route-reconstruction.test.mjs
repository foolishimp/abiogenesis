import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import fs from 'node:fs';
import {dirname,resolve} from 'node:path';
import os from 'node:os';
import {getHeapSnapshot} from 'node:v8';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import * as store from '../../build/code/src/abg/event_store.js';
import * as prefix from '../../build/code/src/abg/event_prefix.js';
import * as replay from '../../build/code/src/abg/replay.js';
import * as calculus from '../../build/code/src/abg/event_calculus.js';
import * as provenance from '../../build/code/src/abg/worksite_input_provenance.js';
import {RuntimeDerivationSource} from '../../build/code/src/abg/runtime_derivation.js';
import {deepFreeze} from '../../build/code/src/shared/immutable.js';
import {sha256Canonical} from '../../build/code/src/shared/digests.js';
import {canonicalJson} from '../../build/code/src/shared/canonical_json.js';
import {RuntimeHistorySelection} from '../../build/code/src/abg/runtime_history.js';
import {syncBuiltinESMExports} from 'node:module';
import {constructTraversalCursorCandidate} from '../../build/code/src/abg/traversal_cursor.js';
import {projectTraversalRouteBody} from '../../build/code/src/abg/traversal_transition.js';
import {proposeJudgmentCandidate} from '../../build/code/src/hog/judgment.js';
const enabled={skip:!process.env.P0_RETAINED_NATIVE_SCRATCH,timeout:180000};
const work=()=>({...globalThis.p0Work});
const diff=(a,b)=>Object.fromEntries([...new Set([...Object.keys(a),...Object.keys(b)])].map(k=>[k,(b[k]??0)-(a[k]??0)]));
async function retained(){
 const outcome=JSON.parse(await readFile(join(process.env.P0_RETAINED_NATIVE_SCRATCH,'full-outcome.json')));
 const rows=store.readRuntimeEventsAtDurablePrefix(outcome.resources.eventResource.closeHandoff.prefix,{requireCurrent:true});
 return {rows,runId:rows.find(e=>e.runId!==undefined).runId};
}
const select=(source,rows,runId)=>{const authority=prefix.selectValidatedRuntimeEventPrefix(source.snapshot(rows));return {authority,run:prefix.selectRuntimeEventPrefixFromAuthority(authority,{runId})};};
const outcome=fn=>{try{return {value:fn()};}catch(e){return {error:e.name,message:e.message};}};
const cold=rows=>prefix.selectValidatedRuntimeEventPrefix(deepFreeze(structuredClone(rows)));

// Controlled declaration/outcome premises, current canonical event envelopes,
// genuine disposable append owner and the actual replay/route consumers. These
// rows do not claim invocation, installed leaf or scope-closure admission proof.
const terminalOptions={};
function terminalOwner(t, history=0){
 const scratch=fs.mkdtempSync(join(process.env.ABI5_ROUTE_PROJECTION_SCRATCH??os.tmpdir(),'terminal-route-'));
 const acquired=store.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:join(scratch,'events.jsonl')});
 assert.ok(acquired.store,JSON.stringify(acquired));
 t.after(()=>{acquired.store.closeDurableLog();fs.rmSync(scratch,{recursive:true,force:true});});
 const ref=(kind,value)=>`${kind}://component/${sha256Canonical(value).slice('sha256:'.length)}`;
 const basisId=ref('execution-basis','terminal'),graphFunctionRef='graph-function://component/terminal',
  materializationRef=ref('materialization','terminal'),runId=ref('run','terminal'),graphCallId=ref('graph-call','terminal'),frameId=ref('frame','terminal');
 const common={eventTime:'2026-10-10T00:00:00.000Z',correlationId:'correlation://component/terminal',workflowVersion:'5.0.0',
  scopeClass:'run',basisId,runId,graphCallId,frameId,graphFunctionRef,materializationRef};
 const append=(kind,aggregateType,aggregateId,parentAggregateId,payload,causationEventRefs=[])=>store.admitRuntimeEvent(acquired.store,
  {...common,kind,aggregateType,aggregateId,parentAggregateId,payload,causationEventRefs});
 // Current canonical basis envelopes with controlled lower declaration premises.
 // Large bodies belong on disk; half share this Run, half are unrelated workspace history.
 for(let i=0;i<history;i++) {
  const value=deepFreeze({kind:'body_fixture_input',text:('history '+i+';').padEnd(65536,'x')});
  const body={basisClass:i%2?'child':'root',rawInputValue:value,rawInputDigest:sha256Canonical(value),invocationRef:'invocation://component/history/'+i};
  const basisDigest=sha256Canonical(body),basisRef='execution-basis://abiogenesis/'+basisDigest.slice(7);
  store.admitRuntimeEvent(acquired.store,{eventTime:common.eventTime,correlationId:common.correlationId,workflowVersion:'5.0.0',kind:'basis_admitted',
   aggregateType:i%2?'frame':'workspace',aggregateId:i%2?frameId:'workspace://component/history',parentAggregateId:null,
   causationEventRefs:[],scopeClass:i%2?'run':'workspace',basisId:basisRef,...(i%2?{runId,graphCallId,frameId}:{}),
   payload:{...body,basisRef,basisDigest}});
 }
 const runOpen=append('run_segment_opened','run',runId,null,{executionBasisRef:basisId,executionBasisDigest:sha256Canonical('basis'),
  graphDigest:sha256Canonical('graph'),graphFunctionRef,graphRef:materializationRef,invocationAdmissionRef:'admission://component',
  invocationRef:'invocation://component',programRef:'program://component',runId,runDigest:sha256Canonical('run'),workspaceBindingId:'workspace-binding://component'});
 const graphOpen=append('graph_call_opened','graph_call',graphCallId,runId,{graphCallId,graphCallDigest:sha256Canonical('graph-call')},[runOpen.eventId]);
 const frameOpen=append('frame_opened','frame',frameId,graphCallId,{frameId,frameDigest:sha256Canonical('frame'),
  frameLineageId:'frame-lineage://component',attempt:1,parentFrameId:null},[graphOpen.eventId]);
 const cursor=constructTraversalCursorCandidate({programRef:'program://component',executionBasisRef:basisId,traversalScopeRef:'scope://component',
  runId,graphCallId,frameId,graphRef:materializationRef,inputRef:'input://component',inputDigest:sha256Canonical({kind:'component_input'}),
  currentNodeRef:'node://component',position:'at_term',termPath:['node','node://component','c'],taskOrdinal:null,attempt:1,retryPath:[]});
 const cursorEvent=append('traversal_cursor_entered','frame',frameId,graphCallId,{cursorRef:cursor.cursorRef,cursorDigest:cursor.cursorDigest},[frameOpen.eventId]);
 const identity={basisId,graphCallId,frameId,vectorIndex:0,stageRole:'result',taskOrdinal:null,attempt:1,programLocusRef:'node://component',retryPath:[]};
 const cCallDigest=sha256Canonical(identity),cCallRef=`c-call:${cCallDigest}`;
 const opened=append('c_call_opened','c_call',cCallRef,frameId,{...identity,cCallRef,cCallDigest,callClass:'leaf',graphFunctionRef,
  edgeRef:'start://component',batchRef:null,cursorRef:cursor.cursorRef,cursorDigest:cursor.cursorDigest},[cursorEvent.eventId]);
 const fibre=append('c_call_fibre_selected','c_call',cCallRef,frameId,{cCallRef,callClass:'leaf',armId:'arm://component',regime:'F_D'},[opened.eventId]);
 const value=deepFreeze({kind:'component_result',schemaVersion:'5.0.0',answer:42}),valueDigest=sha256Canonical(value);
 const evidenceBody={cCallRef,evidenceClass:'deterministic',contractRef:'contract://component/evidence',implementationRef:'implementation://component',
  inputDigest:cursor.inputDigest,outputDigest:valueDigest};
 const evidenceDigest=sha256Canonical(evidenceBody),evidenceRef=ref('evidence',evidenceBody);
 const evidence=append('c_call_evidenced','c_call',cCallRef,frameId,{...evidenceBody,evidenceRef,evidenceDigest},[fibre.eventId]);
 const resultBody={cCallRef,contractRef:'contract://component/result',evidenceRefs:[evidenceRef],resultClass:'success',value,valueDigest,valueKind:value.kind};
 const resultDigest=sha256Canonical(resultBody),resultRef=ref('result',resultBody);
 const resultEvent=append('c_call_result_admitted','c_call',cCallRef,frameId,{...resultBody,resultDigest,resultRef},[evidence.eventId]);
 const current=prefix.selectValidatedRuntimeEventPrefix(acquired.store.readAll()),run=prefix.selectRuntimeEventPrefixFromAuthority(current,{runId});
 const beforeJudgment=replay.replayValidatedRuntimeEventPrefix(run,current);
 const candidate=proposeJudgmentCandidate({cCall:{cCallRef},result:{...resultBody,resultRef,resultDigest},replayState:beforeJudgment,
  contractRef:'contract://component/judgment',decision:{decisionClass:'evaluate',input:{expected:42},relation:{
   predicateRef:'predicate://component/answer',advanceReasonRef:'reason://component/answer',rejectionReasonRef:'reason://component/reject',
   evaluate:(input,result)=>input.expected===result.answer}}});
 assert.equal(candidate.judgment,'advance');
 const {kind:_kind,schemaVersion:_version,candidateDigest:_digest,candidateRef:_ref,...judgmentBody}=candidate;
 const judgmentDigest=sha256Canonical(judgmentBody),judgmentRef=ref('judgment',judgmentBody);
 const judgment=append('c_call_judged','c_call',cCallRef,frameId,{...judgmentBody,judgmentRef,judgmentDigest,retryAttemptRef:null},[resultEvent.eventId]);
 const routeBody=projectTraversalRouteBody({routeKind:'terminal',declarationRef:'transition://component/terminal',declarationDigest:sha256Canonical('terminal declaration'),
  sourceCursorRef:cursor.cursorRef,sourceCursorDigest:cursor.cursorDigest,targetCursorRef:null,targetCursorDigest:null,
  cCallRef,judgmentRef,consumedAvailabilityRefs:[],contractRef:'contract://component/transition',replayStateDigest:beforeJudgment.replayDigest});
 assert.ok(routeBody);const routeDigest=sha256Canonical(routeBody),routeRef=`traversal-route://abiogenesis/${routeDigest.slice('sha256:'.length)}`;
 const route=append('traversal_route_admitted','frame',frameId,graphCallId,{...routeBody,routeRef,routeDigest},[judgment.eventId]);
 const terminal=append('terminal_reached','frame',frameId,graphCallId,{closureRef:'closure://component',closureDigest:sha256Canonical('closure'),
  routeRef,terminalKind:'completed'},[route.eventId]);
 const frameClosed=append('frame_closed','frame',frameId,graphCallId,{frameId,terminalReachedEventRef:terminal.eventId},[terminal.eventId]);
 const graphClosed=append('graph_call_closed','graph_call',graphCallId,runId,{graphCallId,frameClosedEventRef:frameClosed.eventId},[frameClosed.eventId]);
 append('run_closed','run',runId,null,{runId,graphCallClosedEventRef:graphClosed.eventId},[graphClosed.eventId]);
 const rows=acquired.store.readAll(),close=acquired.store.projectReopenAuthorityAndClose();
 assert.equal(close.prefix.storeIdentity.eventContractDigest,store.ROOT_EVENT_CONTRACT_DIGEST);
 const authority=prefix.selectValidatedRuntimeEventPrefix(rows);
 return {...acquired,close,prefix:close.prefix,rows,route,cursor,authority,run:prefix.selectRuntimeEventPrefixFromAuthority(authority,{runId})};
}
async function observedReplay(file){
 const built=resolve(import.meta.dirname,'../../build/code/src/abg/replay.js');
 const counts={wholeHistoryFilterRows:0,indexedPopulationMapRows:0};
 const traced=(rows,key)=>new Proxy(rows,{get(target,name,receiver){
  if(name==='filter'&&key==='history')return (...args)=>{counts.wholeHistoryFilterRows+=target.length;return target.filter(...args);};
  if(name==='map'&&['type:c_call','type:actor_invocation','kind:traversal_route_admitted','kind:fan_out_completion_admitted','kind:construction_delta_observed'].includes(key))
   return (...args)=>{counts.indexedPopulationMapRows+=target.length;return target.map(...args);};
  return Reflect.get(target,name,receiver);
 }});
 const module=new SourceTextModule(fs.readFileSync(file??built,'utf8'),{identifier:built});
 await module.link(async spec=>{
  const values={...await import(spec.startsWith('.')?pathToFileURL(resolve(dirname(built),spec)).href:spec)};
  if(spec==='./event_prefix.js'){
   values.runtimeEventsFromValidatedPrefix=p=>traced(prefix.runtimeEventsFromValidatedPrefix(p),'history');
   values.indexedRuntimeEvents=(p,key)=>traced(prefix.indexedRuntimeEvents(p,key),key);
  }
  return new SyntheticModule(Object.keys(values),function(){for(const [k,v]of Object.entries(values))this.setExport(k,v);});
 });await module.evaluate();return {api:module.namespace,counts};
}
// Inspect the actual private plan writer with its genuine imported owners.
// This checks the complete canonical carrier law, not retry admission premises.
async function ownedRetryPlanDigest(){
 const built=resolve(import.meta.dirname,'../../build/code/src/abg/retry.js');
 const module=new SourceTextModule(fs.readFileSync(built,'utf8')+'\nexport {completedRetryProgressPlanDigest,ownedCompletedRetryProgressPlansCorrespond};',{identifier:built});
 await module.link(async spec=>{
  const values=await import(spec.startsWith('.')?pathToFileURL(resolve(dirname(built),spec)).href:spec);
  return new SyntheticModule(Object.keys(values),function(){for(const [k,v]of Object.entries(values))this.setExport(k,v);});
 });await module.evaluate();return module.namespace;
}
function appendControl(rows,template,patch){
 const {eventId,admissionOrdinal,payloadDigest,eventContractDigest,...candidate}=template;
 const row=store.projectRuntimeEventFromValidatedHistory(rows,{...candidate,...patch});rows.push(row);return row;
}

test('terminal route-only projection preserves complete replay and avoids nonreturned populations',terminalOptions,async t=>{
 const f=terminalOwner(t),before=await observedReplay(process.env.ABI5_ROUTE_REPLAY_PREIMAGE),after=await observedReplay();
 const through=prefix.validatedRuntimeEventPrefixThroughEvent(f.run,f.route.eventId);
 const authorityThrough=prefix.validatedRuntimeEventPrefixThroughEvent(f.authority,f.route.eventId);
 const oldRoute=before.api.projectValidatedReplayRouteAtPrefix(through,f.route.eventId,authorityThrough);
 const newRoute=after.api.projectValidatedReplayRouteAtPrefix(through,f.route.eventId,authorityThrough);
 assert.deepEqual(newRoute,oldRoute);
 const measured={before:{...before.counts},after:{...after.counts}};
 const oldFull=before.api.replayValidatedRuntimeEventPrefix(f.run,f.authority);
 const newFull=after.api.replayValidatedRuntimeEventPrefix(f.run,f.authority);
 assert.deepEqual(newFull,oldFull);assert.equal(newFull.replayDigest,oldFull.replayDigest);
 assert.deepEqual(newRoute,newFull.routes.find(r=>r.admissionEventRef===f.route.eventId));
 assert.equal(newFull.cCalls.at(-1).judgment,'advance');
 const {projectHistoricalTraversalRouteAtPrefix}=await import('../../build/code/src/abg/traversal_route.js');
 const authenticated=projectHistoricalTraversalRouteAtPrefix(f.run,f.route.eventId,f.authority);
 assert.ok(authenticated,'the actual terminal-route authentication call-through succeeds');
 for(const raw of [{...through},structuredClone(through)])
  assert.throws(()=>after.api.projectValidatedReplayRouteAtPrefix(raw,f.route.eventId,authorityThrough),/nominal/);
 const freshAuthority=cold(f.rows),freshRun=prefix.selectRuntimeEventPrefixFromAuthority(freshAuthority,{runId:f.route.runId});
 assert.deepEqual(after.api.replayValidatedRuntimeEventPrefix(freshRun,freshAuthority),newFull);
 if(process.env.ABI5_ROUTE_REPLAY_PREIMAGE){
  assert.ok(measured.before.wholeHistoryFilterRows>0);
  assert.equal(measured.after.wholeHistoryFilterRows,0,'successful observations need only their CCall evidence');
  assert.ok(measured.before.indexedPopulationMapRows>measured.after.indexedPopulationMapRows);
  assert.equal(measured.after.indexedPopulationMapRows,0);
 }
 t.diagnostic(JSON.stringify({eventCount:f.rows.length,routeEvent:f.route.eventId,replayDigest:newFull.replayDigest,measured,
  limit:'Current event-store/envelope/prefix and route consumers; controlled declaration/outcome premises. No installed invocation/leaf/closure or capacity qualification.'}));
});

test('terminal route-only retains cold and hot malformed-history refusals',terminalOptions,async t=>{
 const f=terminalOwner(t),before=await observedReplay(process.env.ABI5_ROUTE_REPLAY_PREIMAGE),after=await observedReplay();
 const opened=f.rows.find(e=>e.kind==='c_call_opened'&&e.runId===f.route.runId);
 const fibre=f.rows.find(e=>e.kind==='c_call_fibre_selected'&&e.aggregateId===opened.aggregateId);
 const runClosed=f.rows.find(e=>e.kind==='run_closed'&&e.runId===f.route.runId);
 const controls=[
  ['unrelated malformed CCall',rows=>{
   const cCallRef='c-call:sha256:'+sha256Canonical('unrelated terminal test').slice('sha256:'.length);
   const open=appendControl(rows,opened,{aggregateId:cCallRef,payload:{...opened.payload,cCallRef,attempt:0}});
   appendControl(rows,fibre,{aggregateId:cCallRef,causationEventRefs:[open.eventId],payload:{...fibre.payload,cCallRef}});
  }],
  ['foreign retained provenance',rows=>{
   const at=rows.findIndex(e=>e.eventId===f.route.eventId),original=rows[at];
   rows[at]=deepFreeze({...original,payload:{...original.payload,boundInput:{contractRef:'contract://foreign',value:{kind:'retained_graph_input'}}}});
  }],
  ['unrelated malformed fan-out',rows=>appendControl(rows,f.route,{kind:'fan_out_completion_admitted',payload:{
   completionRef:'fan-out-completion://foreign',completionDigest:sha256Canonical('foreign'),completionKind:'complete_vector',
   outputVector:[],outputVectorRef:'output-vector://foreign',outputVectorDigest:sha256Canonical([]),taskRows:[]}})],
  ['contradictory Run stop',rows=>appendControl(rows,runClosed,{kind:'run_stopped',payload:{
   disposition:'blocked',routeRef:f.route.payload.routeRef,reasonRef:'reason://contradictory-stop'}})],
 ];
 const reports=[];
 for(const [name,change]of controls){
  const rows=[...f.rows];change(rows);
  const oldAuthority=cold(rows),oldRun=prefix.selectRuntimeEventPrefixFromAuthority(oldAuthority,{runId:f.route.runId});
  const source=new RuntimeDerivationSource(),initial=select(source,f.rows,f.route.runId);
  after.api.projectValidatedReplayRouteAtPrefix(initial.run,f.route.eventId,initial.authority);
  const warm=select(source,deepFreeze(rows),f.route.runId);
  const coldTarget=outcome(()=>after.api.projectValidatedReplayRouteAtPrefix(oldRun,f.route.eventId,oldAuthority));
  const warmTarget=outcome(()=>after.api.projectValidatedReplayRouteAtPrefix(warm.run,f.route.eventId,warm.authority));
  const oldTarget=outcome(()=>before.api.projectValidatedReplayRouteAtPrefix(oldRun,f.route.eventId,oldAuthority));
  const complete=outcome(()=>after.api.replayValidatedRuntimeEventPrefix(oldRun,oldAuthority));
  assert.ok(coldTarget.error,name+' must refuse rather than just find the selected route');
  assert.deepEqual(coldTarget,oldTarget,name+' existing refusal');
  assert.deepEqual(warmTarget,coldTarget,name+' dependency invalidation');
  assert.deepEqual(complete,coldTarget,name+' full replay validation');
  reports.push({name,...coldTarget});
 }
 t.diagnostic(JSON.stringify({controls:reports,limit:'Controlled malformed histories use canonical envelopes/prefix owners; no rejected row is an admitted current UAT fact.'}));
});

test('retained native outputs and exact pre-basis historical owner facts are conserved',enabled,async()=>{
 const {rows,runId}=await retained(),source=new RuntimeDerivationSource();
 const oldRoot=process.env.P0_PREDECESSOR_INSTALLED_ROOT;
 const oldPrefix=await import(pathToFileURL(join(oldRoot,'build/code/src/abg/event_prefix.js')));
 const oldReplay=await import(pathToFileURL(join(oldRoot,'build/code/src/abg/replay.js')));
 const reports=[];
 for(const ordinal of [654,886,894,1144]){
  const selected=select(source,rows.slice(0,ordinal),runId), oldAuthority=oldPrefix.selectValidatedRuntimeEventPrefix(Object.freeze(rows.slice(0,ordinal)));
  const before=work(),state=replay.replayValidatedRuntimeEventPrefix(selected.run,selected.authority);
  const expected=oldReplay.replayValidatedRuntimeEventPrefix(oldPrefix.selectRuntimeEventPrefixFromAuthority(oldAuthority,{runId}),oldAuthority);
  assert.deepEqual(state,expected,'exact native replay at '+ordinal);
  reports.push({ordinal,replayDigest:state.replayDigest,work:diff(before,work())});
 }
 const full=select(source,rows,runId);
 calculus.deriveRuntimeEventCalculusProjection(full.authority);calculus.deriveRuntimeEventCalculusProjection(full.run);
 const basis=rows.find(e=>e.kind==='basis_admitted'&&e.payload.rawInputValue?.kind==='worksite_command_execution_task');assert.ok(basis);
 const before=work(),cut=prefix.validatedRuntimeEventPrefixBeforeEvent(full.authority,basis.eventId);
 assert.equal(cut.events.at(-1).admissionOrdinal,basis.admissionOrdinal-1);
 const projected=calculus.deriveRuntimeEventCalculusProjection(cut);
 const scoped=prefix.selectRuntimeEventPrefixFromAuthority(cut,{runId});
 calculus.deriveRuntimeEventCalculusProjection(scoped);
 const historicalWork=diff(before,work());
 if(globalThis.p0Work){assert.equal(historicalWork.ecOwners??0,0);assert.equal(historicalWork.ecSuffixRows??0,0);}
 assert.deepEqual(projected,calculus.deriveRuntimeEventCalculusProjection(cold(rows.slice(0,basis.admissionOrdinal-1))));
 const beforeFirst=prefix.validatedRuntimeEventPrefixBeforeEvent(full.authority,rows[0].eventId);assert.equal(beforeFirst.events.length,0);
 assert.throws(()=>prefix.validatedRuntimeEventPrefixBeforeEvent(full.authority,'event://foreign'));
 console.log(JSON.stringify({kind:'retained_native_historical_conservation',reports,historicalWork,cutOrdinal:cut.events.at(-1).admissionOrdinal}));
});

test('route facts ignore unrelated growth and preserve relevant source, cursor and intent changes',enabled,async()=>{
 const {rows,runId}=await retained(),route=rows.find(e=>e.kind==='traversal_route_admitted'&&e.payload.boundInput);assert.ok(route);
 const early=select(new RuntimeDerivationSource(),rows.slice(0,105),runId);
 const earlyRoutes=replay.replayValidatedRuntimeEventPrefix(early.run,early.authority).routes,beforeScope=work();
 assert.deepEqual(replay.replayValidatedRuntimeEventPrefix(early.run,early.run).routes,earlyRoutes);
 const scopeWork=diff(beforeScope,work());if(globalThis.p0Work)assert.equal(scopeWork['fact:route']??0,0,'plain routes read no authority provenance');
 const source=new RuntimeDerivationSource(),full=select(source,rows,runId);
 const beforeState=replay.replayValidatedRuntimeEventPrefix(full.run,full.authority);
 const relation=provenance.retainedWorksiteInputRelationVersion(full.authority,route);
 const related=provenance.projectRetainedWorksiteInputAtPrefix(full.authority,route);assert.ok(related);
 const unrelated=store.projectRuntimeEventFromValidatedHistory(rows,{kind:'public_operation_admitted',eventTime:'2026-09-19T21:30:00.000Z',aggregateType:'workspace',aggregateId:'invocation://route-growth/unrelated',parentAggregateId:null,causationEventRefs:[],correlationId:'correlation://route-growth',workflowVersion:'5.0.0',scopeClass:'workspace',basisId:'basis://route-growth/unrelated',payload:{invocationDigest:sha256Canonical('unrelated'),invocationRef:'invocation://route-growth/unrelated',operationId:'abg.operation.project.read',variant:'status'}});
 const grown=select(source,[...rows,unrelated],runId),before=work();
 assert.equal(provenance.retainedWorksiteInputRelationVersion(grown.authority,route),relation);
 assert.deepEqual(replay.replayValidatedRuntimeEventPrefix(grown.run,grown.authority).routes,beforeState.routes);
 const growthWork=diff(before,work());if(globalThis.p0Work)assert.equal(growthWork['fact:route']??0,0);
 const template=rows.find(e=>e.kind==='traversal_cursor_entered'&&e.basisId===route.basisId);assert.ok(template);
 const cursor={...template,runId:route.runId,basisId:route.basisId,graphCallId:route.graphCallId,frameId:route.frameId,payload:{...template.payload,cursorRef:route.payload.targetCursorRef,cursorDigest:route.payload.targetCursorDigest,inputRef:related.input.admissionRef,inputDigest:related.input.subjectDigest}};
 const firstCursor=deepFreeze({...cursor,eventId:cursor.eventId+'/first-target',admissionOrdinal:rows.length+1});
 const firstTarget=select(new RuntimeDerivationSource(),[...rows,firstCursor],runId);
 assert.notEqual(provenance.retainedWorksiteInputRelationVersion(firstTarget.authority,route),relation);
 assert.deepEqual(provenance.projectRetainedWorksiteInputAtPrefix(firstTarget.authority,route),related,'first exact target retains provenance');
 const sourceOpen=rows.find(e=>e.kind==='c_call_opened'&&e.aggregateId===route.payload.cCallRef);
 const sourceResult=rows.find(e=>e.kind==='c_call_result_admitted'&&e.aggregateId===route.payload.cCallRef);
 const sourceJudgment=rows.find(e=>e.kind==='c_call_judged'&&e.aggregateId===route.payload.cCallRef);
 const entry=rows.find(e=>e.eventId===related.entryBasis.admissionEventRef);
 const controls=[['duplicate entry basis',entry],['duplicate source open',sourceOpen],['duplicate source result',sourceResult],['duplicate source judgment',sourceJudgment],['duplicate foldback',related.foldback],['duplicate target cursor',[cursor,cursor]],['conflicting target input',{...cursor,payload:{...cursor.payload,inputDigest:'sha256:'+'0'.repeat(64)}}]];
 const results=[];
 for(const [name,original]of controls){
  assert.ok(original,name);const scopedSource=new RuntimeDerivationSource(),start=select(scopedSource,rows,runId);
  replay.replayValidatedRuntimeEventPrefix(start.run,start.authority);
  const changes=(Array.isArray(original)?original:[original]).map((e,i)=>deepFreeze({...structuredClone(e),eventId:e.eventId+'/control/'+name+'/'+i,admissionOrdinal:rows.length+1+i}));
  const appended=select(scopedSource,[...rows,...changes],runId),coldAuthority=cold([...rows,...changes]);
  assert.notEqual(provenance.retainedWorksiteInputRelationVersion(appended.authority,route),relation,name+' dependency invalidates');
  assert.equal(provenance.projectRetainedWorksiteInputAtPrefix(appended.authority,route),null,name+' owner refusal');
  assert.equal(provenance.projectRetainedWorksiteInputAtPrefix(coldAuthority,route),null,name+' cold refusal');
  const warmResult=outcome(()=>replay.replayValidatedRuntimeEventPrefix(appended.run,appended.authority));
  const coldResult=outcome(()=>replay.replayValidatedRuntimeEventPrefix(prefix.selectRuntimeEventPrefixFromAuthority(coldAuthority,{runId}),coldAuthority));
  assert.deepEqual(warmResult,coldResult,name+' cold equivalence');assert.ok(warmResult.error,name+' replay refusal');
  results.push({name,error:warmResult.error,message:warmResult.message});
 }
 // The exact route's later intent association remains live. Deliberately
 // incomplete unadmitted control data must fail identically in both paths.
 const intent=deepFreeze({...route,kind:'construction_intent_selected',eventId:route.eventId+'/intent-control',admissionOrdinal:rows.length+1,payload:{routeRef:route.payload.routeRef,nextActionProjectionRef:'next-action://incomplete-control'}});
 const intentSource=new RuntimeDerivationSource(),initial=select(intentSource,rows,runId);replay.replayValidatedRuntimeEventPrefix(initial.run,initial.authority);
 const updated=select(intentSource,[...rows,intent],runId),coldIntent=cold([...rows,intent]);
 const warmIntent=outcome(()=>replay.replayValidatedRuntimeEventPrefix(updated.run,updated.authority));
 const coldIntentResult=outcome(()=>replay.replayValidatedRuntimeEventPrefix(prefix.selectRuntimeEventPrefixFromAuthority(coldIntent,{runId}),coldIntent));
 assert.deepEqual(warmIntent,coldIntentResult);assert.ok(warmIntent.error);
 console.log(JSON.stringify({kind:'route_relation_conservation',growthWork,scopeWork,firstTargetValid:true,controls:results,intent:warmIntent}));
});


// These component operations use genuine disposable durable owners. Lower
// declaration/outcome premises are those of terminalOwner, not a native Run proof.
async function observedBodies(action,selection) {
 const locations=selection===undefined?undefined:new Map(Array.from(selection.rows(),row=>[row.body.offset,row]));
 const original=fs.readSync;let calls=0,bytes=0;const reads=[];
 fs.readSync=(...args)=>{const n=original(...args);calls++;bytes+=n;
  if(locations!==undefined){const row=locations.get(args[4]);assert.ok(row,'read selects an exact admitted row offset');
   assert.equal(n,row.body.byteLength,'read has the exact selected physical-row extent');
   reads.push({eventRef:row.envelope.eventId,kind:row.envelope.kind,ordinal:row.envelope.admissionOrdinal,position:args[4],bytes:n});}
  return n;};syncBuiltinESMExports();
 try{return {value:await action(),calls,bytes,reads};}finally{fs.readSync=original;syncBuiltinESMExports();}
}
function ownedTerminal(t,f) {
 const reopened=store.reopenEventStore(f.close.reopenAuthority);assert.equal(reopened.kind,'reopened_event_store_context',JSON.stringify(reopened));
 t.after(()=>reopened.store.closeDurableLog());
 const authority=prefix.selectRuntimeEventPrefixFromStore(reopened.store),run=prefix.selectRuntimeEventPrefixFromAuthority(authority,{runId:f.route.runId});
 return {...reopened,authority,run};
}
// Actual deferred/cut/replay and recursion computations. The finite fixture
// controls only leaf selection, cursor decision and child preparation; it does
// not claim installed GTL/native/child admission or the actual08 inner branch.
async function deferredRecursionOwner(leaf,prepare) {
 const built=resolve(import.meta.dirname,'../../build/code/src/hog/recursion_lifecycle.js');
 const module=new SourceTextModule(fs.readFileSync(built,'utf8')+'\nexport {deferredRecursionCompletionsMatch};',{identifier:built});
 await module.link(async spec=>{
  const values={...await import(spec.startsWith('.')?pathToFileURL(resolve(dirname(built),spec)).href:spec)};
  if(spec==='../abg/c_call.js')values.projectOwnedAdmittedLeafCCallOutcomeAtPrefix=leaf;
  if(spec==='./traversal.js')values.deriveCompletedTraversalCursor=()=>null;
  if(spec==='../gtl/graph_applications.js')values.recursionTerminationDecision=()=>false;
  if(spec==='./child_traversal.js')values.prepareChildTraversal=prepare;
  return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});
 });await module.evaluate();return module.namespace;
}
test('owned deferred recursion restores and begins at the exact cut while Public wrappers keep complete values',async t=>{
 const f=terminalOwner(t),o=ownedTerminal(t,f);
 const deferred=await import('../../build/code/src/abg/deferred_application.js');
 const completion=await import('../../build/code/src/hog/traversal_completion.js');
 const outcomes=await import('../../build/code/src/abg/c_call_outcome.js');
 const ccall=await import('../../build/code/src/hog/ccall_lifecycle.js');
 const opened=f.rows.find(e=>e.kind==='c_call_opened'),resultEvent=f.rows.find(e=>e.kind==='c_call_result_admitted'),
  judgmentEvent=f.rows.find(e=>e.kind==='c_call_judged');
 const cut=store.durableRuntimeEventPrefixThroughEvent(o.prefix,judgmentEvent.eventId);
 const beforeJudgment=store.durableRuntimeEventPrefixThroughEvent(o.prefix,resultEvent.eventId);
 const coordinates={runId:opened.runId,frameId:opened.frameId,sourceCursorRef:f.cursor.cursorRef,
  cCallRef:opened.payload.cCallRef,resultRef:resultEvent.payload.resultRef,judgmentRef:judgmentEvent.payload.judgmentRef};
 const selected=deferred.projectOwnedDeferredApplicationAtPrefix(cut,coordinates),full=deferred.projectDeferredApplicationAtPrefix(cut,coordinates);
 assert.ok(selected);assert.ok(full);
 const explicitAuthority=cold(f.rows.filter(e=>e.admissionOrdinal<=judgmentEvent.admissionOrdinal));
 const explicitRun=prefix.selectRuntimeEventPrefixFromAuthority(explicitAuthority,{runId:coordinates.runId});
 const explicitReplay=replay.replayValidatedRuntimeEventPrefix(explicitRun,explicitAuthority);
 assert.deepEqual(full,{...selected,replayState:explicitReplay});assert.equal(sha256Canonical(full),sha256Canonical({...selected,replayState:explicitReplay}));
 assert.deepEqual(replay.materializeRuntimeReplayGuard(selected.replayState),explicitReplay);
 assert.equal(Object.hasOwn(selected.replayState,'cCalls'),false);
 const application=deepFreeze({applicationRef:'application://component/recursion',relationKind:'recurse',graphFunctionRef:'graph-function://component/child',
  inputContractRef:'contract://component/child-input',outputContractRef:'contract://component/child-output',bound:3});
 const cCall={...opened.payload,runId:opened.runId,compositionRef:application.applicationRef,admissionEventRef:opened.eventId};
 const result={...resultEvent.payload,admissionEventRef:resultEvent.eventId},judgment={...judgmentEvent.payload,admissionEventRef:judgmentEvent.eventId};
 const graph=deepFreeze({template:{applications:[application]}}),scope=deepFreeze({scopeRef:'scope://component',runId:opened.runId,
  graphCallId:opened.graphCallId,frameId:opened.frameId,executionBasisRef:opened.basisId});
 const input=deepFreeze({kind:'component_input'}),clock=deepFreeze({eventTime:'2026-10-10T00:00:00.000Z',correlationId:'correlation://component/recursion'});
 const traversalInput={store:o.store,predecessorPrefix:cut,executionBasis:{basisRef:opened.basisId},openedTraversalScope:scope,
  program:{},graphFunction:{},graph,traversalStop:{cursor:f.cursor,programLocusRef:opened.payload.programLocusRef},
  implementationSet:{},implementationResolution:{},leafPort:{},input,inputDigest:sha256Canonical(input),closureContract:{},
  deferToApplication:true,completionScopeClass:'root',clock};
 const restoration={traversalInput,application,cCallRef:coordinates.cCallRef,resultRef:coordinates.resultRef,judgmentRef:coordinates.judgmentRef};
 let selectedLeaf=0,preparedChild=0;
 const recursion=await deferredRecursionOwner((predecessor,request)=>{
  selectedLeaf++;assert.equal(predecessor,cut);
  return request.cCallRef===cCall.cCallRef&&request.resultRef===result.resultRef&&request.judgmentRef===judgment.judgmentRef
   ?{cCall,result,judgment}:null;
 },(owner,basis,request)=>{
  preparedChild++;assert.equal(owner,o.store);assert.equal(request.predecessorPrefix,cut);
  assert.equal(request.parentCCallRef,cCall.cCallRef);assert.equal(request.inputRef,result.resultRef);assert.deepEqual(request.input,result.value);
  return {kind:'prepared_child_traversal',schemaVersion:'5.0.0',disposition:'prepared',
   executionBasis:{basisRef:'basis://component/controlled-child',parentExecutionBasisRef:opened.basisId},
   openedTraversalScope:{scopeRef:'scope://component/controlled-child',executionBasisRef:'basis://component/controlled-child'},
   input:request.input,inputDigest:request.inputDigest,successorPrefix:cut};
 });
 const retained=ccall.projectOwnedCCallCompletion(f.cursor,{kind:'c_call_completion_admission',disposition:'application_ready',
  replayState:selected.replayState,outcome:{successorPrefix:cut,admitted:{cCall,result,judgment}}},null);
 const restored=recursion.restoreOwnedDeferredRecursion(restoration);assert.ok(restored);
 assert.equal(recursion.deferredRecursionCompletionsMatch(retained,restored,false),true);
 const publicRetained=outcomes.completePublicOutcome(retained),publicRestored=recursion.restoreDeferredRecursion(restoration);
 assert.deepEqual(publicRestored,publicRetained);assert.equal(sha256Canonical(publicRestored),sha256Canonical(publicRetained));
 assert.equal(recursion.deferredRecursionCompletionsMatch(publicRetained,restored,true),true);
 assert.equal(recursion.deferredRecursionCompletionsMatch(publicRetained,restored,false),false,'complete Public replay is not a private guard receipt');
 const begin={traversalInput,childTraversalBasis:{},parentClock:clock,application,completion:retained,
  graphEntryInput:input,graphEntryInputDigest:sha256Canonical(input),leafOrdinal:0};
 const ownedStep=recursion.beginOwnedRecursionApplication(begin);assert.equal(ownedStep.kind,'recursion_child_request');
 const publicStep=recursion.beginRecursionApplication({...begin,completion:publicRetained});
 assert.deepEqual(publicStep,outcomes.completePublicOutcome(ownedStep));assert.equal(preparedChild,2);
 const held=completion.projectOwnedExecutableTraversalCompletion('held',restored.replayState,cut,{continuationRef:'continuation://component/held',
  heldInteraction:{cCall,result,judgment,cursor:f.cursor},heldGraph:graph,heldClosureContract:{}});
 const ownedFold=recursion.completeOwnedRecursionChild(ownedStep.frame,held);
 const publicFold=recursion.completeRecursionChild(publicStep.frame,outcomes.completePublicOutcome(held));
 assert.equal(ownedFold.disposition,'held');assert.equal(ownedFold.parentSuspensions.length,1);
 assert.deepEqual(publicFold,outcomes.completePublicOutcome(ownedFold));assert.equal(sha256Canonical(publicFold),sha256Canonical(outcomes.completePublicOutcome(ownedFold)));
 const foreign=ownedTerminal(t,terminalOwner(t));
 const foreignCut=store.durableRuntimeEventPrefixThroughEvent(foreign.prefix,judgmentEvent.eventId);
 const foreignGuard=deferred.projectOwnedDeferredApplicationAtPrefix(foreignCut,coordinates).replayState;
 assert.equal(foreignGuard.replayDigest,restored.replayState.replayDigest,'equal logical history does not replace actual owner provenance');
 const changed=replay.projectRuntimeReplayGuard(o.run,o.authority);
 for(const crossed of [{...restored,replayState:{...restored.replayState}},{...restored,replayState:foreignGuard},
  {...restored,replayState:changed},{...restored,resultRef:'result://crossed'},{...restored,resultValue:{answer:0}},
  {...restored,successorPrefix:foreignCut}])assert.equal(recursion.deferredRecursionCompletionsMatch(crossed,restored,false),false);
 assert.equal(deferred.projectOwnedDeferredApplicationAtPrefix(beforeJudgment,coordinates),null);
 assert.equal(deferred.projectDeferredApplicationAtPrefix(beforeJudgment,coordinates),null);
 assert.equal(deferred.projectOwnedDeferredApplicationAtPrefix(o.prefix,coordinates),null,'closed Run/frame/locus is not a current deferred application');
 for(const field of Object.keys(coordinates)){
  const crossed={...coordinates,[field]:'crossed://component'};
  assert.equal(deferred.projectOwnedDeferredApplicationAtPrefix(cut,crossed),null,field);
  assert.equal(deferred.projectDeferredApplicationAtPrefix(cut,crossed),null,field);
 }
 assert.equal(recursion.restoreOwnedDeferredRecursion({...restoration,resultRef:'result://crossed'}),null);
 assert.equal(o.store.readAll().length,f.rows.length,'restore/begin/held comparison admitted no new runtime event under controlled preparation');
 t.diagnostic(JSON.stringify({events:f.rows.length,cutOrdinal:judgmentEvent.admissionOrdinal,originalResultRef:result.resultRef,
  originalJudgmentRef:judgment.judgmentRef,replayDigest:restored.replayState.replayDigest,selectedLeaf,preparedChild,
  controlledPremises:['leaf/installed selection','cursor decision','termination decision','child preparation/held child'],
  proved:'genuine deferred cut/current fluent checks; owned restore/begin/held fold comparison; complete Public values/digests; copied/foreign/changed producer/cut refusals',
  excluded:'actual08 null-versus-inequality branch; genuine GTL/native/child admission, Source41, capacity and UAT'}));
});
test('selected replay guard streams the exact complete Result, route and replay digest',async t=>{
 const f=terminalOwner(t),o=ownedTerminal(t,f),full=replay.replayValidatedRuntimeEventPrefix(f.run,f.authority);
 const guard=replay.projectRuntimeReplayGuard(o.run,o.authority);assert.equal(guard.replayDigest,full.replayDigest);
 assert.equal(Object.hasOwn(guard,'cCalls'),false);assert.equal(Object.hasOwn(guard,'routes'),false);
 const chunks=[];replay.writeRuntimeReplayGuardValue(guard,s=>chunks.push(s));
 assert.equal(chunks.join(''),canonicalJson(full));assert.deepEqual(replay.materializeRuntimeReplayGuard(guard),full);
 assert.throws(()=>replay.writeRuntimeReplayGuardValue({...guard},()=>{}),/owner receipt/);
 const all=[];prefix.writeRuntimeEventPrefixValue(o.authority,s=>all.push(s));assert.equal(all.join(''),canonicalJson(f.authority));
 const retry=await ownedRetryPlanDigest(),digest=retry.completedRetryProgressPlanDigest,common={kind:'completed_retry_progress_plan',schemaVersion:'5.0.0',
  predecessorEventDigest:prefix.runtimeEventPrefixDigest(o.authority),eventCandidates:[],projectedEvents:[],progresses:[]};
 const complete={...common,projectedPrefix:f.authority,replayState:full},owned={...common,projectedPrefix:o.authority,replayState:guard};
 assert.equal(digest(owned),sha256Canonical(complete),'private retry admission compares the original complete plan extent');
 assert.equal(digest(complete),sha256Canonical(complete),'explicit Public plan keeps the same hash law');
 assert.notEqual(digest({...owned,progresses:[{guard:'changed'}]}),sha256Canonical(complete));
 t.diagnostic(JSON.stringify({eventCount:f.rows.length,replayDigest:guard.replayDigest,completeBytes:Buffer.byteLength(chunks.join('')),
  limit:'Selected Result/route fields on genuine durable owner; native/continuation coverage remains the genuine owner composition proof.'}));
});
test('finite pure candidate plan equals complete-array construction without advancing the accepted base',async t=>{
 const f=terminalOwner(t),o=ownedTerminal(t,f),baseDigest=prefix.runtimeEventPrefixDigest(o.authority),baseExtent=prefix.runtimeEventPrefixExtent(o.authority);
 const accepted=calculus.deriveRuntimeHeldFluentProjection(o.authority);let selected=o.authority,second=o.authority,explicit=f.authority;const events=[],candidates=[];
 for(let i=0;i<3;i++) {
  const value=deepFreeze({kind:'plan_input',step:i}),body={basisClass:'root',rawInputValue:value,rawInputDigest:sha256Canonical(value),invocationRef:'invocation://component/plan/'+i};
  const basisDigest=sha256Canonical(body),basisRef='execution-basis://abiogenesis/'+basisDigest.slice(7);
  const candidate={kind:'basis_admitted',eventTime:'2026-10-10T00:00:00.000Z',aggregateType:'workspace',aggregateId:'workspace://component/plan',parentAggregateId:null,
   causationEventRefs:i===0?[]:[events.at(-1).eventId],correlationId:'correlation://component/plan',workflowVersion:'5.0.0',scopeClass:'workspace',basisId:basisRef,
   payload:{...body,basisRef,basisDigest}};
  const row=store.projectRuntimeEventFromValidatedHistory(prefix.runtimeEventBodiesAtPrefix(selected),candidate);
  const expected=store.projectRuntimeEventFromValidatedHistory(prefix.runtimeEventsFromValidatedPrefix(explicit),candidate);assert.deepEqual(row,expected);
  selected=prefix.extendRuntimeEventPlanPrefixForValidation(selected,row);explicit=prefix.extendRuntimeEventPrefixForValidation(explicit,expected);events.push(row);
  second=prefix.extendRuntimeEventPlanPrefixForValidation(second,row);candidates.push(deepFreeze(candidate));
  assert.equal(prefix.isOwnedRuntimeEventPrefix(selected),false);assert.equal(prefix.isValidationRuntimeEventPrefix(selected),true);
  assert.deepEqual(calculus.deriveRuntimeHeldFluentProjection(selected),calculus.deriveRuntimeHeldFluentProjection(explicit));
  assert.equal(prefix.runtimeEventPrefixDigest(selected),prefix.runtimeEventPrefixDigest(explicit));
 }
 assert.deepEqual(prefix.runtimeEventPrefixExtent(o.authority),baseExtent);assert.equal(prefix.runtimeEventPrefixDigest(o.authority),baseDigest);
 assert.deepEqual(calculus.deriveRuntimeHeldFluentProjection(o.authority),accepted);assert.equal(o.store.readAll().length,f.rows.length);
 assert.throws(()=>prefix.extendRuntimeEventPrefixForValidation(selected,events.at(-1)),/prospective/);
 assert.throws(()=>prefix.selectOwnedRuntimeEventPrefix(selected.selection),/owner|history/);
 assert.throws(()=>prefix.extendRuntimeEventPlanPrefixForValidation({...selected},events.at(-1)),/genuine/);
 assert.throws(()=>store.projectRuntimeEventFromValidatedHistory(prefix.runtimeEventBodiesAtPrefix(o.authority),{
  kind:'basis_admitted',eventTime:'2026-10-10T00:00:00.000Z',aggregateType:'workspace',aggregateId:'workspace://component/plan',parentAggregateId:null,
  causationEventRefs:[events.at(-1).eventId],correlationId:'correlation://component/plan',workflowVersion:'5.0.0',scopeClass:'workspace',basisId:'basis://future',
  payload:{basisClass:'root',rawInputValue:null,rawInputDigest:sha256Canonical(null),invocationRef:'invocation://future',basisRef:'basis://future',basisDigest:sha256Canonical(null)}}),/causation/);
 const retry=await ownedRetryPlanDigest(),run=p=>prefix.selectRuntimeEventPrefixFromAuthority(p,{runId:f.route.runId});
 const guard=replay.projectRuntimeReplayGuard(run(selected),selected),otherGuard=replay.projectRuntimeReplayGuard(run(second),second);
 const common={kind:'completed_retry_progress_plan',schemaVersion:'5.0.0',predecessorEventDigest:baseDigest,eventCandidates:candidates,projectedEvents:events,progresses:[]};
 const left={...common,projectedPrefix:selected,replayState:guard},right={...common,projectedPrefix:second,replayState:otherGuard};
 const complete={...common,projectedPrefix:explicit,replayState:replay.replayValidatedRuntimeEventPrefix(run(explicit),explicit)};
 assert.equal(retry.completedRetryProgressPlanDigest(left),sha256Canonical(complete));
 const foreign=ownedTerminal(t,terminalOwner(t)),foreignPlan={...common,projectedPrefix:foreign.authority,replayState:replay.projectRuntimeReplayGuard(foreign.run,foreign.authority)};
 assert.equal(foreign.authority.selection.sharesSource(o.authority.selection),false,'the foreign cut has its own actual append owner');
 const before={...RuntimeHistorySelection.owner(o.authority.selection).work};
 assert.equal(retry.ownedCompletedRetryProgressPlansCorrespond(left,right),true);
 for(const changed of [{...right,projectedPrefix:{...second}},{...right,replayState:{...otherGuard}},
  {...right,projectedPrefix:o.authority},{...right,eventCandidates:[{...candidates[0],correlationId:'crossed'},...candidates.slice(1)]},
  {...right,projectedEvents:events.slice(1)},foreignPlan])assert.equal(retry.ownedCompletedRetryProgressPlansCorrespond(left,changed),false);
 const comparisonWork=diff(before,RuntimeHistorySelection.owner(o.authority.selection).work);
 assert.equal(comparisonWork.bodyRows,0,'authentic private plan comparison never reads historical bodies');
 assert.equal(prefix.isOwnedRuntimeEventPrefix(selected),false);assert.equal(o.store.readAll().length,f.rows.length);
 t.diagnostic(JSON.stringify({acceptedEvents:baseExtent.count,prospectiveEvents:events.length,acceptedDigest:baseDigest,pure:true,comparisonWork,
  limit:'Finite carrier/cut authentication only; basis candidates do not claim completed retry admission or genuine HoG execution.'}));
});
test('ordinary selected route and scoped extent avoid growing historical bodies; explicit snapshots have their own lifetime',async t=>{
 const measured=[];
 for(const history of [0,64]) {
  const f=terminalOwner(t,history),o=ownedTerminal(t,f),historyOwner=RuntimeHistorySelection.owner(o.run.selection);
  const route=()=>replay.projectValidatedReplayRouteAtPrefix(o.run,f.route.eventId,o.authority);
  assert.deepEqual(route(),replay.projectValidatedReplayRouteAtPrefix(f.run,f.route.eventId,f.authority));
  prefix.runtimeEventSelectorExtent(o.run,'kind:basis_admitted');const before={...historyOwner.work};
  const selectedKinds=[],select=RuntimeHistorySelection.prototype.select;
  RuntimeHistorySelection.prototype.select=function(key){selectedKinds.push(key);return select.call(this,key);};
  let warm;try{warm=await observedBodies(()=>route(),o.authority.selection);}finally{RuntimeHistorySelection.prototype.select=select;}
  const warmWork=diff(before,historyOwner.work);
  assert.equal(selectedKinds.includes('kind:basis_admitted'),false,'unchanged checked cut does not enumerate prior basis rows');
  assert.equal(warmWork.bodyRows,1,'only the named canonical route body is consumed');
  // The comparison read above decoded this cut's bodies once; the held store
  // keeps them for its current generation, so the warm read decodes none.
  assert.equal(warmWork.bodyDecodes,0,'the warm route reads its one body from the kept generation projection');
  assert.equal(warm.reads.length,0,'the warm route reads no row from the log');
  assert.throws(()=>replay.projectValidatedReplayRouteAtPrefix({...o.run},f.route.eventId,o.authority),/nominal/);
  const extentBefore={...historyOwner.work};for(let i=0;i<16;i++)prefix.runtimeEventSelectorExtent(o.run,'kind:basis_admitted');
  const extentWork=diff(extentBefore,historyOwner.work);assert.equal(extentWork.scopeRows,0);assert.equal(extentWork.selectorRows,0);assert.equal(extentWork.bodyRows,0);
  const heapBefore=process.memoryUsage();let snapshot=o.store.readAll();const explicit=prefix.selectValidatedRuntimeEventPrefix(snapshot);
  assert.deepEqual(replay.replayValidatedRuntimeEventPrefix(prefix.selectRuntimeEventPrefixFromAuthority(explicit,{runId:f.route.runId}),explicit),
    replay.replayValidatedRuntimeEventPrefix(f.run,f.authority));
  const snapshotHeap=process.memoryUsage();snapshot=undefined;
  // The retained explicit snapshot above intentionally remains usable; it never
  // changes which selected owner computation an ordinary route consumes.
  const afterRead={...historyOwner.work};const selected=await observedBodies(()=>route());
  assert.deepEqual(selected.value,warm.value);assert.deepEqual(diff(afterRead,historyOwner.work),warmWork);
  measured.push({history,events:prefix.runtimeEventPrefixExtent(o.authority).count,physicalBytes:o.prefix.prefixLength,
   warmWork,warmBytes:warm.bytes,warmReads:warm.reads,selectedKinds,scopedExtentWork:extentWork,afterExplicitWork:diff(afterRead,historyOwner.work),
   heapBefore:heapBefore.heapUsed,heapWithExplicitSnapshot:snapshotHeap.heapUsed,rss:snapshotHeap.rss});
  // A genuine appended cut cannot borrow the completed checks of its prior
  // cut. The current envelope is lawful; the contradictory Run relation must
  // still be rejected by replay rather than hidden behind selected-route reuse.
  const closed=f.rows.find(e=>e.kind==='run_closed');
  const {eventId:_event,admissionOrdinal:_ordinal,payloadDigest:_payload,eventContractDigest:_profile,...candidate}=closed;
  store.admitRuntimeEvent(o.store,{...candidate,kind:'run_stopped',causationEventRefs:[f.route.eventId],payload:{
   disposition:'blocked',routeRef:f.route.payload.routeRef,reasonRef:'reason://contradictory-checked-cut'}});
  const changedAuthority=prefix.selectRuntimeEventPrefixFromStore(o.store),changedRun=prefix.selectRuntimeEventPrefixFromAuthority(changedAuthority,{runId:f.route.runId});
  const changedKeys=[];RuntimeHistorySelection.prototype.select=function(key){changedKeys.push(key);return select.call(this,key);};
  try{assert.deepEqual(replay.projectValidatedReplayRouteAtPrefix(o.run,f.route.eventId,changedAuthority),warm.value);}
  finally{RuntimeHistorySelection.prototype.select=select;}
  assert.ok(changedKeys.includes('kind:basis_admitted'),'changed authority cut re-enters all global checks');
  assert.throws(()=>replay.projectValidatedReplayRouteAtPrefix(changedRun,f.route.eventId,changedAuthority),/contradictory|disagree/);
  assert.deepEqual(route(),warm.value,'the prior immutable cut remains its own exact completed truth');
 }
 assert.equal(measured[1].warmWork.bodyRows,measured[0].warmWork.bodyRows);
 assert.equal(measured[1].warmReads.length,measured[0].warmReads.length);
 // Neither history's warm route decodes a body, historical or selected: the
 // added history changes no warm read, in rows or in bytes.
 for(const row of measured){
  assert.equal(row.warmReads.length,0,'selected route decodes no added historical basis body');
  assert.equal(row.warmBytes,0,'the warm route reads no log bytes');
 }
 t.diagnostic(JSON.stringify({measured,limit:'Selected-route/body extent discriminator, controlled lower declarations. Full explicit replay has complete cost; no campaign capacity/native qualification.'}));
});

test('drop complete output then selected route does not retain decoded historical bodies',async t=>{
 const f=terminalOwner(t,64),routeEventRef=f.route.eventId,runId=f.route.runId;
 f.rows=undefined;f.authority=undefined;f.run=undefined;
 // The reopened owner is held here, not by a test hook, so that closing it and
 // dropping these references leaves nothing holding its history.
 let held=store.reopenEventStore(f.close.reopenAuthority);assert.equal(held.kind,'reopened_event_store_context',JSON.stringify(held));
 t.after(()=>held?.store.closeDurableLog());
 let authority=prefix.selectRuntimeEventPrefixFromStore(held.store),run=prefix.selectRuntimeEventPrefixFromAuthority(authority,{runId});
 if(global.gc)global.gc();const operationalHeap=process.memoryUsage().heapUsed;
 const requested=()=>new Promise(resolve=>setImmediate(()=>{
  let full=held.store.readAll(),explicit=prefix.selectValidatedRuntimeEventPrefix(full),input=full.find(e=>e.kind==='basis_admitted').payload.rawInputValue;
  // Requested immutable complete output remains exact until this caller drops
  // all of it. Only the weak reference and scalar measurements leave this scope.
  assert.equal(prefix.runtimeEventsFromValidatedPrefix(explicit).length,78);
  const result={weak:new WeakRef(input),heap:process.memoryUsage().heapUsed};
  full=undefined;explicit=undefined;input=undefined;resolve(result);
 }));
 const {weak,heap:snapshotHeap}=await requested();
 // A single explicit GC does not guarantee V8 weak processing. Observe one
 // full collection in a later callback, discarding every diagnostic chunk;
 // neither a debugger target handle nor raw snapshot survives the operation.
 const collect=()=>new Promise((resolve,reject)=>setImmediate(async()=>{
  try{let bytes=0;for await(const chunk of getHeapSnapshot())bytes+=chunk.length;resolve(bytes);}catch(error){reject(error);}
 }));
 const collectionBytes=await collect();
 await new Promise(resolve=>setImmediate(resolve));
 // The open owner keeps the verified bodies of its current generation: the
 // dropped complete output's bodies stay held by the store, not by the caller.
 assert.notEqual(weak.deref(),undefined,'the open store keeps the verified bodies of its current generation');
 const work=RuntimeHistorySelection.owner(run.selection).work,before={...work};
 let observed=await observedBodies(()=>replay.projectValidatedReplayRouteAtPrefix(run,routeEventRef,authority));
 assert.equal(observed.value.admissionEventRef,routeEventRef);
 const selectedWork=diff(before,work),selectedBytes=observed.bytes,openHeap=process.memoryUsage().heapUsed;
 held.store.closeDurableLog();held=undefined;authority=undefined;run=undefined;observed=undefined;
 await new Promise(resolve=>setImmediate(resolve));
 const closedCollectionBytes=await collect();
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(weak.deref(),undefined,'a closed and dropped store owner retains no dropped complete output bodies');
 t.diagnostic(JSON.stringify({operationalHeap,snapshotHeap,openHeap,afterCloseHeap:process.memoryUsage().heapUsed,collectionBytes,closedCollectionBytes,collector:'V8 full snapshot stream discarded; no debugger handle',selectedWork,selectedBytes,
  limit:'Dropped complete output stays in the open owner\'s current generation and is collectible once the owner is closed and dropped. Controlled finite history; heap records are evidence, not a quota or campaign-capacity proof.'}));
});

// O-4. The held store keeps the verified bodies of its current generation and
// reads them by row location and digest. A rollback changes the generation and
// drops them; a reopened store has a fresh history and reads cold. The fold law
// is the proof: a cold read and a cold fold at every cut equal the warm read.
test('held history generation projection: verified bodies decode once per generation; cold reads and folds at every cut equal the warm read',async t=>{
 const f=terminalOwner(t,4),o=ownedTerminal(t,f),owner=RuntimeHistorySelection.owner(o.authority.selection);
 const read=async(action,selection)=>{const before={...owner.work};const observed=await observedBodies(action,selection);return {...observed,work:diff(before,owner.work)};};
 const current=()=>prefix.selectRuntimeEventPrefixFromStore(o.store);
 const basis=label=>{const value=deepFreeze({kind:'body_fixture_input',text:'generation '+label});
  const body={basisClass:'root',rawInputValue:value,rawInputDigest:sha256Canonical(value),invocationRef:'invocation://component/generation/'+label};
  const basisDigest=sha256Canonical(body),basisRef='execution-basis://abiogenesis/'+basisDigest.slice(7);
  return {eventTime:'2026-10-10T00:00:00.000Z',correlationId:'correlation://component/generation',workflowVersion:'5.0.0',kind:'basis_admitted',
   aggregateType:'workspace',aggregateId:'workspace://component/history',parentAggregateId:null,causationEventRefs:[],scopeClass:'workspace',basisId:basisRef,
   payload:{...body,basisRef,basisDigest}};};
 // (1) A selected route: the first read runs the global checks and decodes each
 // body it reads once; a warm read twice gives equal values and body rows and
 // decodes nothing.
 const route=()=>replay.projectValidatedReplayRouteAtPrefix(o.run,f.route.eventId,o.authority);
 const first=await read(route,o.authority.selection),second=await read(route,o.authority.selection),third=await read(route,o.authority.selection);
 assert.deepEqual(second.value,first.value);assert.deepEqual(third.value,second.value);
 assert.ok(first.work.bodyDecodes>0);assert.equal(first.reads.length,first.work.bodyDecodes,'each decode reads its one row');
 assert.equal(new Set(first.reads.map(row=>row.ordinal)).size,first.reads.length,'a committed row decodes at most once in its generation');
 assert.equal(second.work.bodyRows,1);assert.equal(second.work.bodyDecodes,0,'the warm read decodes no body');assert.equal(second.reads.length,0);
 assert.deepEqual(third.work,second.work,'the repeat read consumes the same body rows and decodes nothing');assert.equal(third.reads.length,0);
 // (2) Complete output: a fresh frozen vector per call over the same kept events.
 const all=await read(()=>o.store.readAll(),o.authority.selection),again=await read(()=>o.store.readAll(),o.authority.selection);
 assert.equal(first.work.bodyDecodes+all.work.bodyDecodes,all.value.length,'every committed row decodes once in this generation');
 assert.equal(again.work.bodyDecodes,0);assert.equal(again.reads.length,0);
 assert.notEqual(again.value,all.value);assert.deepEqual(again.value,all.value);
 assert.ok(Object.isFrozen(again.value)&&again.value.every((event,index)=>event===all.value[index]&&Object.isFrozen(event)));
 const materialized=o.authority.selection.materialize(),rematerialized=o.authority.selection.materialize();
 assert.notEqual(rematerialized,materialized);assert.equal(RuntimeHistorySelection.fromMaterialized(rematerialized),o.authority.selection);
 // (3) A rolled-back transaction that staged events changes the generation and
 // drops its kept bodies: the committed rows decode once more, then not again.
 const generation=owner.generation;
 let tentative;
 assert.throws(()=>store.admitRuntimeEventTransactionAtDurablePrefix(o.store,store.selectHeldEventStoreDurablePrefix(o.store),()=>{
  store.admitRuntimeEvent(o.store,basis('refused'));
  const before={...owner.work};const rows=o.store.readAll();tentative={rows:rows.length,work:diff(before,owner.work)};
  throw new Error('fixed rollback discriminator');}),/fixed rollback discriminator/);
 assert.equal(tentative.rows,all.value.length+1);assert.equal(tentative.work.bodyDecodes,0,'a tentative row reads from its staged body');
 assert.equal(owner.generation,generation+1);
 assert.throws(()=>o.authority.selection.materialize(),/invalidated by rollback/);
 const afterRollback=await read(()=>o.store.readAll(),current().selection),settled=await read(()=>o.store.readAll(),current().selection);
 assert.deepEqual(afterRollback.value,all.value);
 assert.equal(afterRollback.work.bodyDecodes,all.value.length,'the new generation decodes each committed row once');
 assert.equal(settled.work.bodyDecodes,0);
 // (4) Staged again and committed: after commitLocation the row reads from the
 // log once, at its committed location, and then from the kept projection.
 const committedBefore={...owner.work};
 const admitted=store.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(o.store,store.selectHeldEventStoreDurablePrefix(o.store),
  ()=>store.admitRuntimeEvent(o.store,basis('committed')));
 const transactionWork=diff(committedBefore,owner.work);
 const located=current().selection,row=located.row(located.length-1);
 assert.equal(row.envelope.eventId,admitted.value.eventId);assert.notEqual(row.body.offset,-1);
 const once=await read(()=>o.store.readAll(),located),twice=await read(()=>o.store.readAll(),current().selection);
 assert.equal(transactionWork.bodyDecodes+once.work.bodyDecodes,1,'the committed row decodes once');
 assert.deepEqual(once.reads.map(read=>[read.eventRef,read.position]),once.work.bodyDecodes===0?[]:[[row.envelope.eventId,row.body.offset]]);
 assert.equal(twice.work.bodyDecodes,0);assert.deepEqual(twice.value,once.value);
 assert.deepEqual(once.value.at(-1),admitted.value);
 // (5) The fold law: at every cut, the warm read and the warm calculus fold
 // equal a cold read and a cold fold over an independent copy of the rows.
 const warm=current(),rows=once.value,coldAuthority=cold(rows);
 const eventsAt=cut=>Array.from({length:prefix.runtimeEventPrefixExtent(cut).count},(_,index)=>prefix.runtimeEventAtPrefixIndex(cut,index));
 for(const event of rows){
  const warmCut=prefix.validatedRuntimeEventPrefixThroughEvent(warm,event.eventId),coldCut=prefix.validatedRuntimeEventPrefixThroughEvent(coldAuthority,event.eventId);
  assert.deepEqual(eventsAt(warmCut),eventsAt(coldCut),event.eventId);
  assert.deepEqual(calculus.deriveRuntimeEventCalculusProjection(warmCut),calculus.deriveRuntimeEventCalculusProjection(coldCut),event.eventId);
  assert.equal(prefix.runtimeEventPrefixDigest(warmCut),prefix.runtimeEventPrefixDigest(coldCut),event.eventId);
 }
 assert.equal(prefix.runtimeEventPrefixDigest(warm),prefix.runtimeEventPrefixDigest(coldAuthority));
 const warmReplay=replay.replayValidatedRuntimeEventPrefix(prefix.selectRuntimeEventPrefixFromAuthority(warm,{runId:f.route.runId}),warm);
 assert.deepEqual(warmReplay,replay.replayValidatedRuntimeEventPrefix(prefix.selectRuntimeEventPrefixFromAuthority(coldAuthority,{runId:f.route.runId}),coldAuthority));
 // (6) A reopened store has a fresh history: it decodes every row once, cold.
 const closed=o.store.projectReopenAuthorityAndClose(),reopened=store.reopenEventStore(closed.reopenAuthority);
 assert.equal(reopened.kind,'reopened_event_store_context',JSON.stringify(reopened));t.after(()=>reopened.store.closeDurableLog());
 const reopenedAuthority=prefix.selectRuntimeEventPrefixFromStore(reopened.store),reopenedOwner=RuntimeHistorySelection.owner(reopenedAuthority.selection);
 const coldBefore={...reopenedOwner.work},coldRead=await observedBodies(()=>reopened.store.readAll(),reopenedAuthority.selection);
 assert.deepEqual(coldRead.value,rows);assert.equal(diff(coldBefore,reopenedOwner.work).bodyDecodes,rows.length);assert.equal(coldRead.reads.length,rows.length);
 t.diagnostic(JSON.stringify({events:rows.length,routeFirst:first.work,routeWarm:second.work,routeRepeat:third.work,completeFirst:all.work,completeRepeat:again.work,
  tentative:tentative.work,afterRollback:afterRollback.work,afterRollbackRepeat:settled.work,transaction:transactionWork,committedFirst:once.work,committedRepeat:twice.work,
  coldReopen:diff(coldBefore,reopenedOwner.work),limit:'Controlled terminal history with four basis bodies; counters of the held owner, not a capacity proof.'}));
});

// TD-15. The three canonical record writers route their envelope through
// writeCanonicalRecord. Head's writers, transcribed from cf630b55c with each
// writer's hash replaced by its sink (abg/retry.ts:6657-6668; abg/c_call.ts
// :5948-5961 and :7340-7355; abg/replay.ts:2317-2328), are the reference. The
// built private writers run in module copies over the genuine owners: the
// copy's node:crypto hash records each part and, with a limit k, refuses part
// k+1; the replay copy also records each (body, selected) its owner passes.
const td15={parts:null,limit:Infinity,failure:new Error('TD-15 sink refused a part')};
const td15Sink=(parts,limit)=>part=>{if(parts.length>=limit)throw td15.failure;parts.push(part);};
async function td15Copy(name,names,suffix=''){
 const built=resolve(import.meta.dirname,'../../build/code/src/abg/'+name+'.js'),crypto=await import('node:crypto');
 const module=new SourceTextModule(fs.readFileSync(built,'utf8')+'\nexport {'+names.join(',')+'};'+suffix,{identifier:built});
 await module.link(async spec=>{
  const values={...await import(spec.startsWith('.')?pathToFileURL(resolve(dirname(built),spec)).href:spec)};
  if(spec==='node:crypto')values.createHash=(...args)=>{
   const real=crypto.createHash(...args);if(td15.parts===null)return real;
   const sink=td15Sink(td15.parts,td15.limit);td15.parts=null;
   return {update(part,encoding){sink(part);real.update(part,encoding);return this;},digest:format=>real.digest(format)};
  };
  return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});
 });await module.evaluate();return module.namespace;
}
// The private writer under a recording or refusing hash: the parts before the
// refusal, whether the refusal propagated, and the digest when none was refused.
function td15Probe(run){
 return (parts,limit)=>{td15.parts=parts;td15.limit=limit;
  try{return {digest:run(),threw:false};}catch(error){if(error!==td15.failure)throw error;return {digest:null,threw:true};}
  finally{td15.parts=null;td15.limit=Infinity;}};
}
// Head's bytes and digest equal the new writer's, and for every k from 0 to the
// part count a sink refusing part k+1 leaves the same k parts from both.
function td15Parity(label,head,probe,{every=true}={}){
 const expected=[];head(td15Sink(expected,Infinity));
 const hash=createHashForTd15('sha256');for(const part of expected)hash.update(part,'utf8');const digest='sha256:'+hash.digest('hex');
 const actual=[],observed=probe(actual,Infinity);
 assert.deepEqual(actual,expected,label+': parts');assert.equal(observed.threw,false);
 if(observed.digest!==undefined)assert.equal(observed.digest,digest,label+': digest');
 const ks=every?[...Array(expected.length+1).keys()]:[...new Set([0,1,2,3,Math.floor(expected.length/2),expected.length-1,expected.length])];
 for(const k of ks){
  const left=[];let leftThrew=false;try{head(td15Sink(left,k));}catch(error){if(error!==td15.failure)throw error;leftThrew=true;}
  const right=[],result=probe(right,k);
  assert.deepEqual(right,left,label+': k='+k);assert.equal(result.threw,leftThrew,label+': k='+k);assert.equal(leftThrew,k<expected.length);
 }
 return {parts:expected.length,bytes:Buffer.byteLength(expected.join('')),digest,ks:ks.length};
}
let createHashForTd15;
test('TD-15: the three record writers through writeCanonicalRecord keep head bytes, digests and partial-sink parts',async t=>{
 ({createHash:createHashForTd15}=await import('node:crypto'));
 const {compareUnicodeCodeUnits,writeCanonicalJson}=await import('../../build/code/src/shared/canonical_json.js');
 const head={
  retry(plan,write){
   write('{');let comma=false;
   for(const key of Object.keys(plan).sort(compareUnicodeCodeUnits)){
    if(comma)write(',');comma=true;
    writeCanonicalJson(key,write);write(':');
    if(key==='projectedPrefix')prefix.writeRuntimeEventPrefixValue(plan.projectedPrefix,write);
    else if(key==='replayState')replay.writeRuntimeReplayGuardValue(plan.replayState,write);
    else writeCanonicalJson(plan[key],write);
   }
   write('}');
  },
  pending(plan,write){
   let finite;
   if('planRef' in plan){const {kind:_k,schemaVersion:_s,planRef:_r,planDigest:_d,projectedPrefix:_p,replayState:_g,...body}=plan;finite=body;}
   else{const {projectedPrefix:_p,replayState:_g,...rest}=plan;finite=rest;}
   write('{');let comma=false;
   for(const key of [...Object.keys(finite),'projectedPrefix','replayState'].sort(compareUnicodeCodeUnits)){
    if(comma)write(',');comma=true;writeCanonicalJson(key,write);write(':');
    if(key==='projectedPrefix'){if(plan.projectedPrefix.kind==='validated_runtime_event_prefix')writeCanonicalJson(plan.projectedPrefix,write);else prefix.writeRuntimeEventPrefixValue(plan.projectedPrefix,write);}
    else if(key==='replayState'){if('kind' in plan.replayState&&plan.replayState.kind==='replay_state')writeCanonicalJson(plan.replayState,write);else replay.writeRuntimeReplayGuardValue(plan.replayState,write);}
    else writeCanonicalJson(finite[key],write);
   }
   write('}');
  },
  replay(body,selected,write){
   write('{');let comma=false;
   for(const key of Object.keys(body).sort(compareUnicodeCodeUnits)){
    if(comma)write(',');comma=true;writeCanonicalJson(key,write);write(':');
    const rows=selected?.[key];
    if(rows===undefined)writeCanonicalJson(body[key],write);
    else{write('[');let rowComma=false;for(const row of rows()){
     if(rowComma)write(',');rowComma=true;writeCanonicalJson(row,write);
    }write(']');}
   }
   write('}');
  },
 };
 const f=terminalOwner(t),o=ownedTerminal(t,f),full=replay.replayValidatedRuntimeEventPrefix(f.run,f.authority);
 const guard=replay.projectRuntimeReplayGuard(o.run,o.authority);assert.equal(guard.replayDigest,full.replayDigest);
 const envelope=({eventId:_i,admissionOrdinal:_o,payloadDigest:_p,eventContractDigest:_c,...candidate})=>candidate;
 const unusual={kind:'td15_member',text:'é \u{1F600} "quoted" \\   \uD800',zero:-0,rows:[1,2.5,null,true,{b:[],a:{}}],'key with space':'','\u{1F600}':'astral key'};
 const measured={};

 // Retry: Object.keys(plan); an owned and a materialized projectedPrefix and replayState.
 const retry=await td15Copy('retry',['completedRetryProgressPlanDigest']);
 const retryFinite={kind:'completed_retry_progress_plan',schemaVersion:'5.0.0',predecessorEventDigest:prefix.runtimeEventPrefixDigest(o.authority),
  eventCandidates:f.rows.slice(-3).map(envelope),projectedEvents:f.rows.slice(-3),progresses:[unusual]};
 const retryPlans={owned:{...retryFinite,projectedPrefix:o.authority,replayState:guard},materialized:{...retryFinite,projectedPrefix:f.authority,replayState:full}};
 for(const [name,plan] of Object.entries(retryPlans))
  measured['retry '+name]=td15Parity('retry '+name,write=>head.retry(plan,write),td15Probe(()=>retry.completedRetryProgressPlanDigest(plan)));
 assert.equal(measured['retry owned'].digest,measured['retry materialized'].digest);assert.equal(measured['retry owned'].digest,sha256Canonical(retryPlans.materialized));

 // C_Call: the finite keys plus projectedPrefix and replayState; the body (destructure) path and the
 // plan (planRef) path; both sides of the projectedPrefix and replayState branches. Finite members are controlled.
 const calls=await td15Copy('c_call',['pendingInteractionBodyDigest']);
 const pendingValue={kind:'fh_pending_result',schemaVersion:'5.0.0',interactionKind:'review',requestRef:'request://td15',
  requestDigest:sha256Canonical('request'),responseContractRef:'contract://td15/response',continuationContractRef:'contract://td15/continuation'};
 const pendingFinite={expectedPrefixDigest:prefix.runtimeEventPrefixDigest(o.authority),admissionBasisDigest:sha256Canonical('basis'),
  cCallRef:'c-call:'+sha256Canonical('td15'),requestRef:'request://td15',requestDigest:sha256Canonical('request'),retryAttemptRef:null,
  pendingValue,pendingValueDigest:sha256Canonical(pendingValue),evidenceRef:'evidence://td15',evidenceDigest:sha256Canonical('evidence'),
  resultRef:'result://td15',resultDigest:sha256Canonical('result'),judgmentReasonRef:'reason://td15',
  eventCandidates:f.rows.slice(-2).map(envelope),projectedEvents:f.rows.slice(-2),pending:{cCall:{cCallRef:'c-call:td15'},result:unusual,judgment:{judgment:'pending'}}};
 const planHeader={kind:'pending_interaction_admission_plan',schemaVersion:'5.0.0',planRef:'pending-interaction-plan://abiogenesis/td15',planDigest:sha256Canonical('td15')};
 const pendingPlans={};
 for(const [cut,members] of Object.entries({owned:{projectedPrefix:o.authority,replayState:guard},materialized:{projectedPrefix:f.authority,replayState:full},
  'validated prefix, owned guard':{projectedPrefix:f.authority,replayState:guard},'owned prefix, complete state':{projectedPrefix:o.authority,replayState:full}})){
  pendingPlans['body '+cut]={...pendingFinite,...members};pendingPlans['plan '+cut]={...planHeader,...pendingFinite,...members};
 }
 for(const [name,plan] of Object.entries(pendingPlans))
  measured['pending '+name]=td15Parity('pending '+name,write=>head.pending(plan,write),td15Probe(()=>calls.pendingInteractionBodyDigest(plan)));
 assert.equal(new Set(Object.keys(pendingPlans).map(name=>measured['pending '+name].digest)).size,1,'one body digest on every path and branch');

 // Replay: Object.keys(body); without selected (complete replay) and with selected (guard), through
 // digestReplayBody and through the streaming path of writeRuntimeReplayGuardValue.
 const owner=await td15Copy('replay',['digestReplayBody'],'\nexport const td15Calls=[];const td15WriteReplayBody=writeReplayBody;'+
  '\nwriteReplayBody=function(body,selected,write){td15Calls.push({body,selected});return td15WriteReplayBody(body,selected,write);};\nexport {td15WriteReplayBody};');
 const captured=(run)=>{owner.td15Calls.length=0;const value=run();return {value,calls:[...owner.td15Calls]};};
 const complete=captured(()=>owner.replayValidatedRuntimeEventPrefix(f.run,f.authority));
 assert.deepEqual(complete.value,full);assert.equal(complete.calls.length,1);assert.equal(complete.calls[0].selected,undefined);
 const selectedGuard=captured(()=>owner.projectRuntimeReplayGuard(o.run,o.authority));
 assert.equal(selectedGuard.value.replayDigest,full.replayDigest);assert.equal(selectedGuard.calls.length,1);assert.notEqual(selectedGuard.calls[0].selected,undefined);
 const {kind:_kind,schemaVersion:_version,replayRef:_ref,replayDigest:_digest,...fullBody}=full;
 for(const [name,{body,selected}] of [['without selected',complete.calls[0]],['with selected',selectedGuard.calls[0]]]){
  measured['replay digest '+name]=td15Parity('replay digest '+name,write=>head.replay(body,selected,write),td15Probe(()=>owner.digestReplayBody(body,selected)));
  assert.equal(measured['replay digest '+name].digest,full.replayDigest);
  // Rows are pulled from the selected iterables at the same parts on both writers.
  if(selected!==undefined)for(const k of [0,7,measured['replay digest '+name].parts>>1]){
   const pulls=writer=>{let count=0;const counted=Object.fromEntries(Object.entries(selected).map(([key,rows])=>[key,function*(){for(const row of rows()){count++;yield row;}}]));
    try{writer(counted,td15Sink([],k));}catch(error){if(error!==td15.failure)throw error;}return count;};
   assert.equal(pulls((rows,sink)=>owner.td15WriteReplayBody(body,rows,sink)),pulls((rows,sink)=>head.replay(body,rows,sink)),'row pulls at k='+k);
  }
 }
 assert.deepEqual(Object.keys(complete.calls[0].body).sort(),Object.keys(fullBody).sort());
 const streamed=captured(()=>{const chunks=[];owner.writeRuntimeReplayGuardValue(selectedGuard.value,s=>chunks.push(s));return chunks;});
 assert.equal(streamed.calls.length,1);assert.equal(streamed.value.join(''),canonicalJson(full));
 const streamInput=streamed.calls[0];
 measured['replay stream']=td15Parity('replay stream',write=>head.replay(streamInput.body,streamInput.selected,write),
  (parts,limit)=>{try{owner.writeRuntimeReplayGuardValue(selectedGuard.value,td15Sink(parts,limit));return {threw:false};}
   catch(error){if(error!==td15.failure)throw error;return {threw:true};}});
 const oracle=[];head.replay(full,undefined,td15Sink(oracle,Infinity));assert.deepEqual(streamed.value,oracle,'the complete ReplayState written without selected is the streamed part sequence');

 // Persisted: the two replayStateDigest values of the packaged S01 store (ordinals 15 and 16) are the
 // complete replay digests at cuts 14 and 15; the transcription and the new writer recompute both.
 const s01=deepFreeze(fs.readFileSync(join(import.meta.dirname,'../fixtures/r10-projection-family/s01-attempt-01/events-01/runtime.events.jsonl'),'utf8')
  .trim().split('\n').map(line=>JSON.parse(line)));
 const persisted=s01.filter(event=>typeof event.payload?.replayStateDigest==='string');
 assert.deepEqual(persisted.map(event=>[event.admissionOrdinal,event.kind]),[[15,'c_call_judged'],[16,'traversal_route_admitted']]);
 for(const event of persisted){
  const cut=prefix.selectValidatedRuntimeEventPrefix(Object.freeze(s01.slice(0,event.admissionOrdinal-1)));
  const recomputed=captured(()=>owner.replayValidatedRuntimeEventPrefix(prefix.selectRuntimeEventPrefixFromAuthority(cut,{runId:event.runId}),cut));
  assert.equal(recomputed.value.replayDigest,event.payload.replayStateDigest);
  const {body}=recomputed.calls.at(-1),bytes=[];head.replay(body,undefined,td15Sink(bytes,Infinity));
  assert.equal('sha256:'+createHashForTd15('sha256').update(bytes.join(''),'utf8').digest('hex'),event.payload.replayStateDigest);
  measured['persisted ordinal '+event.admissionOrdinal]={digest:event.payload.replayStateDigest,cut:event.admissionOrdinal-1};
 }
 t.diagnostic(JSON.stringify(measured));
});
