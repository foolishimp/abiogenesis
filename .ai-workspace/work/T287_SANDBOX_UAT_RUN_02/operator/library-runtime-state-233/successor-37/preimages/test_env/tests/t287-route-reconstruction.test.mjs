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
 return {...acquired,close,prefix:close.prefix,rows,route,authority,run:prefix.selectRuntimeEventPrefixFromAuthority(authority,{runId})};
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
 let coordinateByteDelta=0;
 measured[1].warmReads.forEach((row,i)=>{const before=measured[0].warmReads[i];
  assert.equal(row.kind,before.kind);assert.equal(row.ordinal,before.ordinal+64);
  assert.ok(row.ordinal>64,'selected route decodes no added historical basis body');
  const ordinalByteDelta=String(row.ordinal).length-String(before.ordinal).length;
  assert.equal(row.bytes-before.bytes,ordinalByteDelta,'only the selected row ordinal width changes');coordinateByteDelta+=ordinalByteDelta;
 });
 assert.equal(measured[1].warmBytes-measured[0].warmBytes,coordinateByteDelta);
 t.diagnostic(JSON.stringify({measured,limit:'Selected-route/body extent discriminator, controlled lower declarations. Full explicit replay has complete cost; no campaign capacity/native qualification.'}));
});

test('drop complete output then selected route does not retain decoded historical bodies',async t=>{
 const f=terminalOwner(t,64),o=ownedTerminal(t,f),routeEventRef=f.route.eventId;
 f.rows=undefined;f.authority=undefined;f.run=undefined;
 if(global.gc)global.gc();const operationalHeap=process.memoryUsage().heapUsed;
 const requested=()=>new Promise(resolve=>setImmediate(()=>{
  let full=o.store.readAll(),explicit=prefix.selectValidatedRuntimeEventPrefix(full),input=full.find(e=>e.kind==='basis_admitted').payload.rawInputValue;
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
 const collectionBytes=await new Promise((resolve,reject)=>setImmediate(async()=>{
  try{let bytes=0;for await(const chunk of getHeapSnapshot())bytes+=chunk.length;resolve(bytes);}catch(error){reject(error);}
 }));
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(weak.deref(),undefined,'ordinary store owner does not retain dropped complete output bodies');
 const work=RuntimeHistorySelection.owner(o.run.selection).work,before={...work};
 const observed=await observedBodies(()=>replay.projectValidatedReplayRouteAtPrefix(o.run,routeEventRef,o.authority));
 assert.equal(observed.value.admissionEventRef,routeEventRef);
 t.diagnostic(JSON.stringify({operationalHeap,snapshotHeap,afterDropHeap:process.memoryUsage().heapUsed,collectionBytes,collector:'V8 full snapshot stream discarded; no debugger handle',selectedWork:diff(before,work),selectedBytes:observed.bytes,
  selectedValueStillRetained:weak.deref()!==undefined,limit:'Dropped complete output is collectible while the same ordinary owner stays open. Controlled finite history; heap records are evidence, not a quota or campaign-capacity proof.'}));
});
