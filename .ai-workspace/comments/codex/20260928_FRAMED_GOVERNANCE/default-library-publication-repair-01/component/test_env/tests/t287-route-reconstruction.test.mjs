import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import * as store from '../../build/code/src/abg/event_store.js';
import * as prefix from '../../build/code/src/abg/event_prefix.js';
import * as replay from '../../build/code/src/abg/replay.js';
import * as calculus from '../../build/code/src/abg/event_calculus.js';
import * as provenance from '../../build/code/src/abg/worksite_input_provenance.js';
import {RuntimeDerivationSource} from '../../build/code/src/abg/runtime_derivation.js';
import {deepFreeze} from '../../build/code/src/shared/immutable.js';
import {sha256Canonical} from '../../build/code/src/shared/digests.js';
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
