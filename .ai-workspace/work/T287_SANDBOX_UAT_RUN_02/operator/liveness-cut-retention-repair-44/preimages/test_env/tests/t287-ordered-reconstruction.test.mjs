import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import * as storeOwner from '../../build/code/src/abg/event_store.js';
import * as prefixOwner from '../../build/code/src/abg/event_prefix.js';
import * as ec from '../../build/code/src/abg/event_calculus.js';
import * as replay from '../../build/code/src/abg/replay.js';
import * as live from '../../build/code/src/abg/runtime_liveness.js';
import { RuntimeDerivationSource } from '../../build/code/src/abg/runtime_derivation.js';
import { deepFreeze } from '../../build/code/src/shared/immutable.js';
import { sha256Canonical } from '../../build/code/src/shared/digests.js';
import { admitIJsonValue } from '../../build/code/src/shared/i_json.js';
import { projectRunTruthAtDurablePrefix } from '../../build/code/src/abg/project_read_ports.js';
const counts=()=>({...globalThis.p0Work});
const delta=(before,after)=>Object.fromEntries([...new Set([...Object.keys(before),...Object.keys(after)])].map(k=>[k,(after[k]??0)-(before[k]??0)]));
const select=(events,runId)=>{const authority=prefixOwner.selectValidatedRuntimeEventPrefix(events);return {authority,run:prefixOwner.selectRuntimeEventPrefixFromAuthority(authority,{runId})};};
const retained={skip:!process.env.ABI5_PREFIX_REUSE_OBSERVATIONS,timeout:180000};

test('historical durable cuts reidentify only exact owner history after physical authentication',async()=>{
  const scratch=await mkdtemp(join(tmpdir(),'ordered-history-'));
  const acquire=name=>storeOwner.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:join(scratch,name)});
  const a=acquire('a.jsonl'),b=acquire('b.jsonl');assert.ok('store'in a&&'store'in b);
  const candidate=n=>({kind:'public_operation_admitted',eventTime:'2026-09-19T20:00:00.000Z',aggregateType:'workspace',aggregateId:'invocation://history/'+n,parentAggregateId:null,causationEventRefs:[],correlationId:'correlation://history/'+n,workflowVersion:'5.0.0',scopeClass:'workspace',basisId:'basis://history',payload:{invocationDigest:sha256Canonical(n),invocationRef:'invocation://history/'+n,operationId:'abg.operation.project.read',variant:'status'}});
  try{
    const first=storeOwner.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(a.store,a.prefix,()=>storeOwner.admitRuntimeEvent(a.store,candidate('first'))).successorPrefix;
    const oldState=replay.replayValidatedRuntimeEventPrefix(prefixOwner.selectValidatedRuntimeEventPrefix(a.store.readAll()));
    const second=storeOwner.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(a.store,first,()=>storeOwner.admitRuntimeEvent(a.store,candidate('second'))).successorPrefix;
    replay.replayValidatedRuntimeEventPrefix(prefixOwner.selectValidatedRuntimeEventPrefix(a.store.readAll()));
    const before=counts(),historical=storeOwner.reidentifyHistoricalDurablePrefixCoordinate(second,structuredClone(first));
    const rows=storeOwner.readRuntimeEventsAtDurablePrefix(historical);
    assert.equal(rows[0],a.store.readAll()[0]);assert.equal(rows.length,1);
    assert.deepEqual(replay.replayValidatedRuntimeEventPrefix(prefixOwner.selectValidatedRuntimeEventPrefix(rows)),oldState);
    if(globalThis.p0Work){assert.equal((counts().ecSuffixRows??0)-(before.ecSuffixRows??0),0);assert.equal((counts().historicalDecodes??0)-(before.historicalDecodes??0),0);assert.equal((counts().physicalReads??0)-(before.physicalReads??0),2);}
    const cold=storeOwner.reidentifyHistoricalDurablePrefixCoordinate(structuredClone(second),structuredClone(first));
    assert.notEqual(storeOwner.readRuntimeEventsAtDurablePrefix(cold)[0],rows[0],'untrusted current coordinate cannot lend historical facts');
    const other=storeOwner.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(b.store,b.prefix,()=>storeOwner.admitRuntimeEvent(b.store,candidate('first'))).successorPrefix;
    const foreign=storeOwner.reidentifyHistoricalDurablePrefixCoordinate(second,structuredClone(other));
    assert.notEqual(storeOwner.readRuntimeEventsAtDurablePrefix(foreign)[0],b.store.readAll()[0],'equal ordinals in another store stay cold');
    const bytes=await readFile(join(scratch,'a.jsonl')),changed=Buffer.from(bytes);changed[0]=91;await writeFile(join(scratch,'a.jsonl'),changed);
    assert.throws(()=>storeOwner.reidentifyHistoricalDurablePrefixCoordinate(second,structuredClone(first)),error=>error.code==='prefix_digest_mismatch');await writeFile(join(scratch,'a.jsonl'),bytes);
    console.log(JSON.stringify({kind:'historical_cut_derivation_controls',exactOutput:true,ordinalAloneRejected:true,physicalDriftRefused:true}));
  }finally{a.store.closeDurableLog();b.store.closeDurableLog();await rm(scratch,{recursive:true,force:true});}
});

test('ordered owner advances exact suffixes and preserves historical, cold and unrelated-growth outputs',retained,async()=>{
  const observation=JSON.parse(await readFile(process.env.ABI5_PREFIX_REUSE_OBSERVATIONS));
  const events=storeOwner.readRuntimeEventsAtDurablePrefix(observation.observedPrefix,{requireCurrent:true});
  const source=new RuntimeDerivationSource(),results=[];
  const cuts=[2852,2899,4875,4922,6464,4922,2852];
  let high=0;
  for(const ordinal of cuts){
    const {authority,run}=select(source.snapshot(events.slice(0,ordinal)),observation.runId);
    const before=counts(),calculus=ec.deriveRuntimeEventCalculusProjection(run),after=counts();
    const expected=Math.max(0,run.events.length-high); high=Math.max(high,run.events.length);
    if(globalThis.p0Work)assert.equal((after.ecSuffixRows??0)-(before.ecSuffixRows??0),expected,`only suffix ${ordinal}`);
    const state=replay.replayValidatedRuntimeEventPrefix(run,authority);
    const liveness=live.projectRuntimeLivenessForScope(authority,observation.runId);
    if(process.env.P0_SAVED_OUTPUTS)for(const [name,value]of [['calculus',calculus],['replay',state],['liveness',liveness]])
      assert.deepEqual(value,JSON.parse(await readFile(join(process.env.P0_SAVED_OUTPUTS,`${ordinal}-${name}.json`))),`${ordinal} exact ${name}`);
    const repeated=counts();assert.equal(replay.replayValidatedRuntimeEventPrefix(run,authority),state);
    if(globalThis.p0Work)assert.equal((counts().ecSuffixRows??0)-(repeated.ecSuffixRows??0),0);
    results.push({ordinal,expectedSuffixRows:expected,work:delta(before,counts()),replayDigest:state.replayDigest});
  }
  const cold=select(deepFreeze(structuredClone(events)),observation.runId),beforeCold=counts();
  const coldState=replay.replayValidatedRuntimeEventPrefix(cold.run,cold.authority);
  assert.equal(coldState.replayDigest,results.find(r=>r.ordinal===6464).replayDigest);
  const workspace=storeOwner.projectRuntimeEventFromValidatedHistory(events,{kind:'public_operation_admitted',eventTime:'2026-09-19T20:00:00.000Z',aggregateType:'workspace',aggregateId:'invocation://ordered/unrelated',parentAggregateId:null,causationEventRefs:[],correlationId:'correlation://ordered/unrelated',workflowVersion:'5.0.0',scopeClass:'workspace',basisId:'basis://ordered/unrelated',payload:{invocationDigest:sha256Canonical('unrelated'),invocationRef:'invocation://ordered/unrelated',operationId:'abg.operation.project.read',variant:'status'}});
  const grown=select(source.snapshot([...events,workspace]),observation.runId),beforeGrowth=counts();
  assert.deepEqual(ec.deriveRuntimeEventCalculusProjection(grown.run),ec.deriveRuntimeEventCalculusProjection(cold.run));
  if(globalThis.p0Work)assert.equal((counts().ecSuffixRows??0)-(beforeGrowth.ecSuffixRows??0),0,'unrelated workspace growth changes no selected EC fact');
  console.log(JSON.stringify({kind:'ordered_retained_conservation',results,coldWork:delta(beforeCold,beforeGrowth),unrelatedGrowthWork:delta(beforeGrowth,counts())}));
});

test('held derivation preserves physical authentication and discards staged facts on rollback',async()=>{
  const scratch=await mkdtemp(join(tmpdir(),'ordered-held-'));
  const acquired=storeOwner.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:join(scratch,'events.jsonl')});
  assert.ok('store'in acquired);const store=acquired.store;
  const candidate=suffix=>({kind:'public_operation_admitted',eventTime:'2026-09-19T20:00:00.000Z',aggregateType:'workspace',aggregateId:'invocation://ordered/'+suffix,parentAggregateId:null,causationEventRefs:[],correlationId:'correlation://ordered/'+suffix,workflowVersion:'5.0.0',scopeClass:'workspace',basisId:'basis://ordered/held',payload:{invocationDigest:sha256Canonical(suffix),invocationRef:'invocation://ordered/'+suffix,operationId:'abg.operation.project.read',variant:'status'}});
  const project=()=>replay.replayValidatedRuntimeEventPrefix(prefixOwner.selectValidatedRuntimeEventPrefix(store.readAll()));
  try{
    const first=storeOwner.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(store,acquired.prefix,()=>storeOwner.admitRuntimeEvent(store,candidate('first')));
    const state=project(),beforeRead=counts();
    const rows=storeOwner.readRuntimeEventsAtDurablePrefix(first.successorPrefix);
    assert.equal(rows[0],store.readAll()[0],'exact held object, after physical byte authentication');
    if(globalThis.p0Work){assert.equal((counts().historicalDecodes??0)-(beforeRead.historicalDecodes??0),0);assert.equal((counts().physicalReads??0)-(beforeRead.physicalReads??0),1);}
    const cold=storeOwner.readRuntimeEventsAtDurablePrefix(structuredClone(first.successorPrefix));assert.deepEqual(cold,rows);assert.notEqual(cold[0],rows[0]);
    assert.deepEqual(admitIJsonValue(first.successorPrefix),structuredClone(first.successorPrefix),'owner coordinate remains exact I-JSON');
    const ownedTruth=projectRunTruthAtDurablePrefix(first.successorPrefix,'run://ordered/absent');
    assert.equal(ownedTruth.code,'target_absent');
    assert.deepEqual(ownedTruth,projectRunTruthAtDurablePrefix(structuredClone(first.successorPrefix),'run://ordered/absent'));
    const copied=deepFreeze({...first.successorPrefix});
    assert.notEqual(storeOwner.readRuntimeEventsAtDurablePrefix(copied)[0],rows[0],'a copied coordinate cannot carry the derivation');
    let staged;
    assert.throws(()=>storeOwner.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(store,first.successorPrefix,()=>{storeOwner.admitRuntimeEvent(store,candidate('cancel'));staged=project();throw Error('rollback discriminator');}),/rollback discriminator/);
    assert.equal(staged.eventCount,2);assert.deepEqual(project(),state,'cancelled semantic facts cannot survive rollback');
    const beforeNext=counts();const second=storeOwner.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(store,first.successorPrefix,()=>storeOwner.admitRuntimeEvent(store,candidate('second')));
    const secondState=project();assert.equal(secondState.eventCount,2);assert.notEqual(secondState.replayDigest,staged.replayDigest);
    const coldState=replay.replayValidatedRuntimeEventPrefix(prefixOwner.selectValidatedRuntimeEventPrefix(deepFreeze(structuredClone(store.readAll()))));assert.deepEqual(secondState,coldState);
    const bytes=await readFile(join(scratch,'events.jsonl')),changed=Buffer.from(bytes);changed[0]=91;await writeFile(join(scratch,'events.jsonl'),changed);
    assert.throws(()=>storeOwner.readRuntimeEventsAtDurablePrefix(second.successorPrefix),error=>error.code==='prefix_digest_mismatch');await writeFile(join(scratch,'events.jsonl'),bytes);
    assert.deepEqual(storeOwner.readRuntimeEventsAtDurablePrefix(second.successorPrefix),store.readAll());
    console.log(JSON.stringify({kind:'held_suffix_rollback_conservation',work:delta(beforeNext,counts()),physicalDriftRefused:true,copiedProofCold:true}));
  }finally{store.closeDurableLog();await rm(scratch,{recursive:true,force:true});}
});


test('historical liveness folds conserve full/scoped/reverse reads and declaration refusals',
  {skip:!process.env.ABI5_HISTORICAL_LIVENESS_LOG,timeout:180000},async()=>{
  const {pathToFileURL}=await import('node:url');
  const predecessor=process.env.ABI5_HISTORICAL_LIVENESS_PREDECESSOR;
  assert.ok(predecessor,'explicit frozen predecessor');
  const oldPrefix=await import(pathToFileURL(join(predecessor,'build/code/src/abg/event_prefix.js')));
  const oldEc=await import(pathToFileURL(join(predecessor,'build/code/src/abg/event_calculus.js')));
  const oldLive=await import(pathToFileURL(join(predecessor,'build/code/src/abg/runtime_liveness.js')));
  const raw=await readFile(process.env.ABI5_HISTORICAL_LIVENESS_LOG,'utf8');
  const {sha256Bytes}=await import('../../build/code/src/shared/digests.js');
  assert.equal(sha256Bytes(Buffer.from(raw)),process.env.ABI5_HISTORICAL_LIVENESS_DIGEST,'exact retained regression input');
  const events=deepFreeze(raw.trimEnd().split('\n').map(row=>JSON.parse(row)));
  const runId=events.find(e=>e.runId!==undefined).runId;
  const fresh=(owner,rows=events)=>owner.selectValidatedRuntimeEventPrefix(Object.freeze([...rows]));
  const measured=fn=>{const before={...globalThis.read02Work},start=performance.now(),value=fn();return {value,durationMs:performance.now()-start,work:delta(before,{...globalThis.read02Work})};};
  const oldFull=fresh(oldPrefix),oldRun=oldPrefix.selectRuntimeEventPrefixFromAuthority(oldFull,{runId});
  const expectedRun=oldEc.deriveRuntimeEventCalculusProjection(oldRun);
  const expectedFull=oldEc.deriveRuntimeEventCalculusProjection(fresh(oldPrefix));
  const sdkFull=fresh(prefixOwner),sdkRun=prefixOwner.selectRuntimeEventPrefixFromAuthority(sdkFull,{runId});
  const cold=measured(()=>ec.deriveRuntimeEventCalculusProjection(sdkRun));assert.deepEqual(cold.value,expectedRun);
  const full=fresh(prefixOwner),fullWork=measured(()=>ec.deriveRuntimeEventCalculusProjection(full));assert.deepEqual(fullWork.value,expectedFull);
  const scoped=prefixOwner.selectRuntimeEventPrefixFromAuthority(full,{runId});
  const historical=measured(()=>ec.deriveRuntimeEventCalculusProjection(scoped));assert.deepEqual(historical.value,expectedRun);
  if(globalThis.read02Work){
    assert.equal(historical.work.validationCalls,cold.work.validationCalls,'no event validation omitted');
    assert.ok(historical.work.rowVisits<=cold.work.rowVisits,'historical traversal does no more row-relation work than cold traversal');
    assert.ok(historical.work.historicalCalls>0,'the prior advanced lane actually exists');
  }
  const later=live.projectRuntimeLivenessForScope(full,runId);
  assert.deepEqual(later,oldLive.projectRuntimeLivenessForScope(fresh(oldPrefix),runId));
  const cuts=[10000,1500,2500,73,74,76,2978,1500,10000],cutResults=[];
  for(const ordinal of cuts){
    const cut=prefixOwner.validatedRuntimeEventPrefixThroughEvent(full,events[ordinal-1].eventId);
    const coldCut=fresh(oldPrefix,events.slice(0,ordinal));
    assert.deepEqual(ec.deriveRuntimeEventCalculusProjection(cut),oldEc.deriveRuntimeEventCalculusProjection(coldCut),`exact EC cut ${ordinal}`);
    const projected=live.projectRuntimeLivenessForScope(cut,runId);
    assert.deepEqual(projected,oldLive.projectRuntimeLivenessForScope(coldCut,runId),`exact liveness cut ${ordinal}`);
    cutResults.push({ordinal,digest:sha256Canonical(projected)});
  }
  const preserved=measured(()=>live.projectRuntimeLivenessForScope(full,runId));assert.deepEqual(preserved.value,later,'historical/reverse reads cannot mutate later-cut state');
  if(globalThis.read02Work)assert.equal(preserved.work.rowVisits??0,0,'later-cut observation fold is retained');
  const actor=events.find(e=>e.kind==='actor_invocation_started'),probe=events.find(e=>e.kind==='runtime_activity_probe_observed'&&e.payload.actorInvocationRef===actor.aggregateId);
  assert.equal(live.projectRuntimeLivenessAtPrefix(prefixOwner.validatedRuntimeEventPrefixThroughEvent(full,events[actor.admissionOrdinal-2].eventId),actor.aggregateId),null,'absence before declaration remains absence after warm later read');
  const foreign=fresh(prefixOwner,deepFreeze(structuredClone(events.slice(0,probe.admissionOrdinal))));
  assert.equal(live.createRuntimeLivenessEventValidator(foreign)(probe),false,'foreign equal-value event cannot borrow exact source membership');
  const refusals=[];
  for(const [name,change]of [
    ['changed_transport_declaration',e=>e.admissionOrdinal===actor.admissionOrdinal?{...e,payload:{...e.payload,transportBindingRef:'transport-binding://unadmitted/changed'}}:e],
    ['changed_probe_scope',e=>e.admissionOrdinal===probe.admissionOrdinal?{...e,payload:{...e.payload,observation:{...e.payload.observation,scopeDigest:'sha256:'+'0'.repeat(64)}}}:e],
  ]){
    // Deliberately unadmitted negative inputs, never written to an event store.
    const altered=deepFreeze(events.slice(0,probe.admissionOrdinal).map(change));
    const changedSource=new RuntimeDerivationSource();
    const originalContext=prefixOwner.selectValidatedRuntimeEventPrefix(changedSource.snapshot(events.slice(0,probe.admissionOrdinal)));
    assert.ok(live.projectRuntimeLivenessAtPrefix(originalContext,actor.aggregateId),'valid source context before replacement');
    const candidate=prefixOwner.selectValidatedRuntimeEventPrefix(changedSource.snapshot(altered)),prior=fresh(oldPrefix,altered);
    const candidateResult=live.createRuntimeLivenessEventValidator(candidate)(altered.at(-1));
    assert.equal(candidateResult,false,name);assert.equal(candidateResult,oldLive.createRuntimeLivenessEventValidator(prior)(altered.at(-1)),name+' exact refusal');
    const warmResult=live.projectRuntimeLivenessAtPrefix(candidate,actor.aggregateId);
    assert.deepEqual(warmResult,oldLive.projectRuntimeLivenessAtPrefix(prior,actor.aggregateId),name+' projection conservation');
    refusals.push({name,validation:candidateResult,projection: warmResult===null?'null':'conserved'});
  }
  const beforeDuplicate=events.slice(0,probe.admissionOrdinal);
  const {eventId,admissionOrdinal,payloadDigest,eventContractDigest,...actorCandidate}=actor;
  const duplicate=storeOwner.projectRuntimeEventFromValidatedHistory(beforeDuplicate,actorCandidate);
  const duplicateRows=deepFreeze([...beforeDuplicate,duplicate]);
  const declarationSource=new RuntimeDerivationSource();
  const declared=prefixOwner.selectValidatedRuntimeEventPrefix(declarationSource.snapshot(beforeDuplicate));
  assert.ok(live.projectRuntimeLivenessAtPrefix(declared,actor.aggregateId),'original declaration is valid before extension');
  const candidateDuplicate=prefixOwner.selectValidatedRuntimeEventPrefix(declarationSource.snapshot(duplicateRows)),oldDuplicate=fresh(oldPrefix,duplicateRows);
  assert.equal(live.projectRuntimeLivenessAtPrefix(candidateDuplicate,actor.aggregateId),null,'duplicate actor declaration invalidates context');
  assert.deepEqual(live.projectRuntimeLivenessAtPrefix(candidateDuplicate,actor.aggregateId),oldLive.projectRuntimeLivenessAtPrefix(oldDuplicate,actor.aggregateId));
  console.log(JSON.stringify({kind:'historical_liveness_fold_conservation',eventCount:events.length,runId,cold:{durationMs:cold.durationMs,work:cold.work},full:{durationMs:fullWork.durationMs,work:fullWork.work},historical:{durationMs:historical.durationMs,work:historical.work},preservedLaterWork:preserved.work,cuts:cutResults,refusals,duplicateDeclarationRefused:true,foreignEventRefused:true}));
});
