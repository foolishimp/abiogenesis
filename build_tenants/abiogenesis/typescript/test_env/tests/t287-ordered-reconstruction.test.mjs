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
import { RuntimeDerivationSource, ownedRuntimeDerivationSource, runtimeDerivationSource } from '../../build/code/src/abg/runtime_derivation.js';
import { deepFreeze } from '../../build/code/src/shared/immutable.js';
import { sha256Canonical } from '../../build/code/src/shared/digests.js';
import { admitIJsonValue } from '../../build/code/src/shared/i_json.js';
import { projectRunTruthAtDurablePrefix } from '../../build/code/src/abg/project_read_ports.js';
import { projectOwnedPrefixArtifactTruth, projectExactPrefixArtifactTruth, validateExactPrefixArtifactTruthProjection, runtimePrefixFromArtifactTruth } from '../../build/code/src/abg/artifact_truth.js';
const counts=()=>({...globalThis.p0Work});
const delta=(before,after)=>Object.fromEntries([...new Set([...Object.keys(before),...Object.keys(after)])].map(k=>[k,(after[k]??0)-(before[k]??0)]));
const select=(events,runId)=>{const authority=prefixOwner.selectValidatedRuntimeEventPrefix(events);return {authority,run:prefixOwner.selectRuntimeEventPrefixFromAuthority(authority,{runId})};};
const retained={skip:!process.env.ABI5_PREFIX_REUSE_OBSERVATIONS,timeout:180000};

test('snapshot proof identity rejects transplanted descriptors while raw and copied histories keep cold fallback',async()=>{
  const scratch=await mkdtemp(join(tmpdir(),'ordered-snapshot-identity-'));
  const acquired=storeOwner.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:join(scratch,'events.jsonl')});
  assert.ok('store'in acquired);
  const candidate=n=>({kind:'public_operation_admitted',eventTime:'2026-09-19T20:00:00.000Z',aggregateType:'workspace',aggregateId:'invocation://snapshot/'+n,parentAggregateId:null,causationEventRefs:[],correlationId:'correlation://snapshot/'+n,workflowVersion:'5.0.0',scopeClass:'workspace',basisId:'basis://snapshot',payload:{invocationDigest:sha256Canonical(n),invocationRef:'invocation://snapshot/'+n,operationId:'abg.operation.project.read',variant:'status'}});
  try {
    let durable=acquired.prefix;
    for(const name of ['first','second','third']) durable=storeOwner.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(acquired.store,durable,()=>storeOwner.admitRuntimeEvent(acquired.store,candidate(name))).successorPrefix;
    const rows=acquired.store.readAll(),source=new RuntimeDerivationSource();
    const first=source.snapshot(rows.slice(0,2)),appended=source.append(first,rows.slice(2)),cut=source.prefix(appended,1);
    for(const snapshot of [first,appended,cut]) {
      assert.equal(ownedRuntimeDerivationSource(snapshot),source);
      assert.equal(runtimeDerivationSource(snapshot),source);
      assert.equal(source.snapshot(snapshot),snapshot);
      assert.ok(Object.isFrozen(snapshot));
    }
    assert.equal(source.append(appended,[]),appended);
    assert.equal(source.prefix(appended,appended.length),appended);
    assert.equal(source.hasPrefix(appended,first),true);
    assert.equal(source.hasPrefix(appended,cut),true);
    const key=Reflect.ownKeys(appended).find(key=>typeof key==='symbol'&&key.description==='owner_runtime_derivation_snapshot');
    assert.ok(key);
    const descriptor=Object.getOwnPropertyDescriptor(appended,key);
    const transplanted=[...appended];Object.defineProperty(transplanted,key,descriptor);Object.freeze(transplanted);
    const inherited=[...appended];Object.setPrototypeOf(inherited,Object.create(Array.prototype,{[key]:descriptor}));Object.freeze(inherited);
    const counterfeit=[...appended];Object.defineProperty(counterfeit,key,{value:Object.freeze(Object.create(Object.getPrototypeOf(descriptor.value)))});Object.freeze(counterfeit);
    const expected=replay.replayValidatedRuntimeEventPrefix(prefixOwner.selectValidatedRuntimeEventPrefix(appended));
    for(const raw of [[...appended],JSON.parse(JSON.stringify(appended)),structuredClone(appended),transplanted,inherited,counterfeit]) {
      assert.equal(ownedRuntimeDerivationSource(raw),undefined,'copies and reflected proof transplants carry no nominal source');
      const cold=runtimeDerivationSource(raw);assert.notEqual(cold,source);
      deepFreeze(raw); // Copied event values must satisfy the unchanged immutable-prefix guard.
      const admitted=cold.snapshot(raw);assert.equal(ownedRuntimeDerivationSource(admitted),cold);
      const value=replay.replayValidatedRuntimeEventPrefix(prefixOwner.selectValidatedRuntimeEventPrefix(admitted));
      assert.deepEqual(value,expected,'valid copied history retains cold projection fallback');
      assert.equal(sha256Canonical(value),sha256Canonical(expected));
    }
    const fact=Symbol('snapshot-guard-fact'),scope=source.scope('same',first),marker={};
    scope.owner(fact,()=>marker);
    assert.equal(source.scope('same',appended),scope,'authentic append reuses its scope');
    assert.equal(source.scope('same',cut),scope,'historical common prefix reuses its scope');
    const divergent=source.snapshot([rows[0],rows[2]]);
    assert.equal(source.hasPrefix(appended,divergent),false);
    const replaced=source.scope('same',divergent);assert.notEqual(replaced,scope);
    source.invalidate();const rebuilt=source.scope('same',appended);
    assert.notEqual(rebuilt,replaced);assert.notEqual(rebuilt.owner(fact,()=>({})),marker);
    assert.equal(ownedRuntimeDerivationSource(appended),source,'invalidation clears disposable facts, not authentic snapshot provenance');
    assert.throws(()=>source.prefix(appended,-1),/invalid snapshot prefix length/);
    assert.throws(()=>source.prefix(appended,appended.length+1),/invalid snapshot prefix length/);
    console.log(JSON.stringify({kind:'snapshot_identity_conservation',events:rows.length,coldFallbacks:6,transplantsUnowned:true,appendCutScopeAndInvalidation:true,replayDigest:sha256Canonical(expected)}));
  } finally {acquired.store.closeDurableLog();await rm(scratch,{recursive:true,force:true});}
});

test('cold acquisition receipt detaches caller input and preserves pure, copied, explicit-fresh and current-prefix distinctions',async()=>{
  const scratch=await mkdtemp(join(tmpdir(),'ordered-cold-source-'));
  const acquired=storeOwner.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:join(scratch,'events.jsonl')});
  assert.ok('store'in acquired);
  const candidate=n=>({kind:'public_operation_admitted',eventTime:'2026-09-19T20:00:00.000Z',aggregateType:'workspace',aggregateId:'invocation://cold/'+n,parentAggregateId:null,causationEventRefs:[],correlationId:'correlation://cold/'+n,workflowVersion:'5.0.0',scopeClass:'workspace',basisId:'basis://cold',payload:{invocationDigest:sha256Canonical(n),invocationRef:'invocation://cold/'+n,operationId:'abg.operation.project.read',variant:'status'}});
  try {
    const first=storeOwner.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(acquired.store,acquired.prefix,()=>storeOwner.admitRuntimeEvent(acquired.store,candidate('first'))).successorPrefix;
    const raw=structuredClone(first),captured=storeOwner.captureDurablePrefixCoordinate(raw);
    assert.notEqual(captured,raw);assert.equal(Object.isFrozen(captured.storeIdentity),true);
    raw.prefixLength=0;assert.equal(captured.prefixLength,first.prefixLength,'caller mutation is detached');
    const rows=storeOwner.readRuntimeEventsAtDurablePrefix(captured,{requireCurrent:true});
    const truth=projectOwnedPrefixArtifactTruth(captured);assert.equal(truth.kind,'exact_prefix_artifact_truth_projection');
    assert.equal(runtimePrefixFromArtifactTruth(truth).events,rows);
    assert.equal(storeOwner.projectRuntimeEventsAtDurablePrefix(captured),rows,'pure projection borrows the acquired vector');
    const fresh=storeOwner.readRuntimeEventsAtDurablePrefix(captured,{requireCurrent:true});
    assert.deepEqual(fresh,rows);assert.notEqual(fresh,rows,'explicit physical read reacquires');
    assert.notEqual(storeOwner.readRuntimeEventsAtDurablePrefix(structuredClone(captured)),fresh,'copied coordinate has no acquired source');
    const second=storeOwner.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(acquired.store,first,()=>storeOwner.admitRuntimeEvent(acquired.store,candidate('second'))).successorPrefix;
    assert.equal(validateExactPrefixArtifactTruthProjection(truth,{requireCurrent:true}),false,'append invalidates currentness');
    assert.throws(()=>storeOwner.readRuntimeEventsAtDurablePrefix(captured,{requireCurrent:true}),error=>error.code==='prefix_length_mismatch');
    assert.deepEqual(projectOwnedPrefixArtifactTruth(captured),truth,'historical pure facts remain historical');
    const bytes=await readFile(join(scratch,'events.jsonl')),changed=Buffer.from(bytes);changed[0]=91;await writeFile(join(scratch,'events.jsonl'),changed);
    assert.throws(()=>storeOwner.readRuntimeEventsAtDurablePrefix(captured),error=>error.code==='prefix_digest_mismatch');
    assert.equal(projectExactPrefixArtifactTruth(captured).code,'prefix_digest_mismatch','explicit acquisition detects byte drift');
    await writeFile(join(scratch,'events.jsonl'),bytes);
    assert.deepEqual(storeOwner.readRuntimeEventsAtDurablePrefix(structuredClone(second)),acquired.store.readAll());
  }finally {acquired.store.closeDurableLog();await rm(scratch,{recursive:true,force:true});}
});

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
    assert.throws(()=>storeOwner.reidentifyHistoricalDurablePrefixCoordinate(structuredClone(second),structuredClone(first)),error=>error.code==='prefix_digest_mismatch');await writeFile(join(scratch,'a.jsonl'),bytes);
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
    assert.throws(()=>storeOwner.readRuntimeEventsAtDurablePrefix(structuredClone(second.successorPrefix)),error=>error.code==='prefix_digest_mismatch');await writeFile(join(scratch,'events.jsonl'),bytes);
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


// Read-only inspector handles expose cache size, never an owner mutation or a
// test-only production API. Every handle and temporary global is released.
async function inspectLivenessCutRetention(source) {
  const { Session } = await import('node:inspector');
  const session = new Session(); session.connect();
  const group = 'liveness-cut-retention';
  const post = (method, params) => new Promise((resolve, reject) =>
    session.post(method, params, (error, value) => error ? reject(error) : resolve(value)));
  globalThis.__livenessCutDiagnosticSource = source;
  const get = id => post('Runtime.getProperties', { objectId: id, ownProperties: true });
  const values = async id => {
    const array = await post('Runtime.callFunctionOn', { objectId: id,
      functionDeclaration: 'function() { return Array.from(this.values()); }', objectGroup: group });
    assert.equal(array.exceptionDetails, undefined);
    return (await get(array.result.objectId)).result
      .filter(row => /^\d+$/.test(row.name)).map(row => row.value.objectId);
  };
  try {
    const root = await post('Runtime.evaluate', { expression: 'globalThis.__livenessCutDiagnosticSource', objectGroup: group });
    const scopes = (await get(root.result.objectId)).privateProperties.find(row => row.name === '#scopes');
    assert.ok(scopes?.value.objectId, 'actual owner source private scope map');
    const facts = [];
    for (const scopeId of await values(scopes.value.objectId)) {
      const owners = (await get(scopeId)).privateProperties.find(row => row.name === '#owners');
      assert.ok(owners?.value.objectId);
      const owned = await post('Runtime.callFunctionOn', { objectId: owners.value.objectId,
        functionDeclaration: "function() { return this.get([...this.keys()].find(key => key.description === 'ordered_runtime_liveness_derivation')); }",
        objectGroup: group });
      assert.equal(owned.exceptionDetails, undefined);
      if (owned.result.objectId === undefined) continue;
      const result = await post('Runtime.callFunctionOn', { objectId: owned.result.objectId, returnByValue: true,
        functionDeclaration: `function() {
          const current = new Set(), historical = new Set(), structural = new Set(), paths = [];
          const eventRows = rows => Array.isArray(rows) && rows.length > 0 &&
            rows.every(row => row && typeof row.eventId === 'string' && Number.isSafeInteger(row.admissionOrdinal));
          for (const key of ['events', 'structural', 'declarations']) current.add(this[key]);
          for (const key of ['byKind', 'declarationsByIdentity', 'observations'])
            for (const rows of this[key].values()) current.add(rows);
          const profileKey = value => Reflect.ownKeys(value).find(key =>
            typeof key === 'symbol' && key.description === 'validated_runtime_profile_source');
          const currentProfile = profileKey(this.prefix);
          if (currentProfile === undefined) throw Error('missing current owned profile vector');
          current.add(this.prefix.events); current.add(this.prefix[currentProfile]);
          const visited = new Set(); let historicalCutCount = 0;
          const inspect = (value, path) => {
            if (!value || typeof value !== 'object' || visited.has(value)) return;
            visited.add(value);
            if (value === this.prefix || current.has(value)) return;
            if (typeof value.eventId === 'string' && Number.isSafeInteger(value.admissionOrdinal)) return;
            const profile = profileKey(value);
            if (profile !== undefined && Array.isArray(value.events)) {
              historicalCutCount++;
              for (const [label, rows] of [['events', value.events], ['profile', value[profile]]]) {
                if (!Array.isArray(rows)) throw Error('wrong owned historical vector');
                if (!current.has(rows)) { historical.add(rows); paths.push({path:path+'/'+label,length:rows.length}); }
              }
              return;
            }
            if (Array.isArray(value)) {
              if (eventRows(value)) { structural.add(value); paths.push({path,length:value.length}); return; }
              if (value.length && typeof value[0] !== 'object') return;
              for (let i=0;i<value.length;i++) inspect(value[i],path+'/'+i);
              return;
            }
            if (value instanceof Map) {
              let i=0; for (const entry of value.values()) inspect(entry,path+'/value'+i++);
              return;
            }
            for (const key of Reflect.ownKeys(value)) {
              const descriptor = Object.getOwnPropertyDescriptor(value,key);
              if (descriptor && 'value' in descriptor) inspect(descriptor.value,path+'/'+String(key));
            }
          };
          // Walk actual retained owner roots, without traversing event bodies,
          // source backreferences or substituting a cache-name assertion.
          for (const key of Reflect.ownKeys(this)) {
            const descriptor=Object.getOwnPropertyDescriptor(this,key);
            if (descriptor && 'value' in descriptor) inspect(descriptor.value,String(key));
          }
          const total = rows => [...rows].reduce((sum,vector)=>sum+vector.length,0);
          return {historicalCutCount, historicalVectorCount:historical.size,
            historicalVectorSlots:total(historical), structuralIntermediateVectorCount:structural.size,
            structuralIntermediateVectorSlots:total(structural), retainedIntermediatePaths:paths,
            currentVectorCount:current.size,currentVectorSlots:total(current),
            completedFactCounts:{contexts:this.contexts.size,budgets:this.budgets.size,
              folds:this.folds.size,historicalFolds:this.historicalFolds.size}};
        }`, objectGroup: group });
      assert.equal(result.exceptionDetails, undefined);
      facts.push(result.result.value);
    }
    return facts;
  } finally {
    delete globalThis.__livenessCutDiagnosticSource;
    await post('Runtime.releaseObjectGroup', { objectGroup: group });
    session.disconnect();
  }
}

test('liveness historical-cut intermediates are call-local while authentic current, older, lease and refusal answers agree',
  { skip: !process.env.ABI5_LIVENESS_CUT_HISTORY, timeout: 180000 }, async () => {
  const { pathToFileURL } = await import('node:url');
  const { sha256Bytes } = await import('../../build/code/src/shared/digests.js');
  const oldRoot = process.env.ABI5_LIVENESS_CUT_PREDECESSOR;
  assert.ok(oldRoot && process.env.ABI5_LIVENESS_CUT_SHA256, 'explicit predecessor and authentic fixture digest');
  const bytes = await readFile(process.env.ABI5_LIVENESS_CUT_HISTORY);
  assert.equal(sha256Bytes(bytes), process.env.ABI5_LIVENESS_CUT_SHA256);
  const old = {};
  for (const name of ['event_store', 'event_prefix', 'runtime_derivation', 'runtime_liveness', 'replay'])
    old[name] = await import(pathToFileURL(join(oldRoot, 'build/code/src/abg', name + '.js')));
  const variants = [
    { name: 'predecessor', store: old.event_store, prefix: old.event_prefix, live: old.runtime_liveness, replay:old.replay,
      Source: old.runtime_derivation.RuntimeDerivationSource },
    { name: 'successor', store: storeOwner, prefix: prefixOwner, live, replay, Source: RuntimeDerivationSource },
  ];
  if(process.env.ABI5_SNAPSHOT_PREDECESSOR) {
    const prior={};
    for(const name of ['event_store','event_prefix','runtime_derivation','runtime_liveness','replay'])
      prior[name]=await import(pathToFileURL(join(process.env.ABI5_SNAPSHOT_PREDECESSOR,'build/code/src/abg',name+'.js')));
    variants.push({name:'snapshot-predecessor',store:prior.event_store,prefix:prior.event_prefix,live:prior.runtime_liveness,replay:prior.replay,Source:prior.runtime_derivation.RuntimeDerivationSource});
  }
  const results = [];
  for (const api of variants) {
    // Owner-decoded genuine history; changed controls below are explicitly
    // unadmitted counterexamples, never new native event evidence.
    const rows = api.store.validateHistoricalEvents(bytes), source = new api.Source();
    const full = api.prefix.selectValidatedRuntimeEventPrefix(source.snapshot(rows));
    const probes = rows.filter(row => row.kind === 'runtime_activity_probe_observed');
    assert.ok(probes.length > 3);
    const validate = api.live.createRuntimeLivenessEventValidator(full);
    const accepted = probes.map(event => validate(event));
    assert.ok(accepted.every(Boolean));
    const cache = await inspectLivenessCutRetention(source);
    assert.ok(cache.length > 0);
    const occurrences = [...new Set(probes.map(event => {
      const scope = event.payload.probeContract.scope;
      return scope.actorInvocationRef ?? scope.cCallRef ?? scope.frameId;
    }))];
    const project = () => occurrences.map(ref => api.live.projectRuntimeLivenessAtPrefix(full, ref));
    const projections = project();
    const replayValue=api.replay.replayValidatedRuntimeEventPrefix(full);
    const distinct = [...new Set(probes.map(event => event.admissionOrdinal))];
    const selectedCuts = [distinct[0], distinct[Math.floor(distinct.length / 2)], distinct.at(-1)];
    const historicalProjections = selectedCuts.map(ordinal => {
      const prefix = api.prefix.validatedRuntimeEventPrefixThroughEvent(full, rows[ordinal-1].eventId);
      assert.equal(prefix.events.at(-1), rows[ordinal-1], 'exact original event identity at historical boundary');
      return {ordinal,values:occurrences.map(ref=>api.live.projectRuntimeLivenessAtPrefix(prefix,ref)),replay:api.replay.replayValidatedRuntimeEventPrefix(prefix)};
    });
    for (const cut of historicalProjections.toReversed()) {
      const prefix=api.prefix.validatedRuntimeEventPrefixThroughEvent(full,rows[cut.ordinal-1].eventId);
      assert.deepEqual(occurrences.map(ref=>api.live.projectRuntimeLivenessAtPrefix(prefix,ref)),cut.values);
      assert.deepEqual(api.replay.replayValidatedRuntimeEventPrefix(prefix),cut.replay);
    }
    for (const event of probes.toReversed()) assert.equal(validate(event), true, 'older authentic answer');
    const repeated = project(); assert.deepEqual(repeated, projections, 'current lease and retry budget unchanged');
    assert.deepEqual(api.replay.replayValidatedRuntimeEventPrefix(full),replayValue,'historical and reverse queries conserve full replay');
    const repeatedCache = await inspectLivenessCutRetention(source);
    const count = facts => facts.reduce((sum, row) => sum + row.historicalVectorCount + row.structuralIntermediateVectorCount, 0);
    const target = probes.at(-1);
    assert.equal(validate(deepFreeze(structuredClone(target))), false, 'identity cannot borrow admitted validator');
    const before = api.prefix.validatedRuntimeEventPrefixThroughEvent(full, rows[target.admissionOrdinal - 2].eventId);
    const changed = structuredClone(target); changed.payload.observation.sourceDigest = 'sha256:' + '0'.repeat(64); deepFreeze(changed);
    assert.equal(api.live.validateRuntimeLivenessEventAtPrefix(before, changed), false, 'raw source guard unchanged');
    const historical = api.prefix.validatedRuntimeEventPrefixThroughEvent(full, probes[0].eventId);
    const historicalValidator = api.live.createRuntimeLivenessEventValidator(historical);
    assert.equal(historicalValidator(probes.at(-1)), false, 'future event cannot borrow old prefix');
    assert.equal(validate(probes[0]), true, 'older query remains valid after later queries');
    source.invalidate();
    assert.deepEqual(await inspectLivenessCutRetention(source), [], 'disposable source invalidation removes owned cache');
    const rebuilt = api.prefix.selectValidatedRuntimeEventPrefix(source.snapshot(rows));
    const rebuiltValidator = api.live.createRuntimeLivenessEventValidator(rebuilt);
    for (const event of probes) assert.equal(rebuiltValidator(event), true);
    assert.deepEqual(occurrences.map(ref => api.live.projectRuntimeLivenessAtPrefix(rebuilt, ref)), projections);
    assert.deepEqual(api.replay.replayValidatedRuntimeEventPrefix(rebuilt),replayValue);
    results.push({ name: api.name, rowCount: rows.length, accepted, projections, replayValue, historicalProjections, cache, repeatedCache, count: count(repeatedCache) });
  }
  assert.deepEqual(results[1].accepted, results[0].accepted);
  assert.deepEqual(results[1].projections, results[0].projections, 'complete currentness, budget, lease, identity and digest equivalence');
  assert.deepEqual(results[1].historicalProjections,results[0].historicalProjections,'exact historical context/budget/lease/refusal equivalence');
  assert.deepEqual(results[1].replayValue,results[0].replayValue,'full replay conservation');
  if(results[2]) {
    for(const field of ['accepted','projections','historicalProjections','replayValue']) {
      assert.deepEqual(results[1][field],results[2][field],field+' exact snapshot-predecessor equivalence');
      assert.equal(sha256Canonical(results[1][field]),sha256Canonical(results[2][field]),field+' digest equivalence');
    }
    assert.equal(results[2].count,0,'snapshot predecessor already has call-local historical cuts');
  }
  assert.ok(results[0].count > 0, 'actual predecessor roots retain historical event/profile and structural vectors');
  assert.equal(results[1].count,0,'successor roots retain zero historical intermediate vectors');
  for (const facts of [results[1].cache, results[1].repeatedCache])
    for (const row of facts) {
      assert.equal(row.historicalCutCount,0);
      assert.equal(row.historicalVectorCount,0);
      assert.equal(row.historicalVectorSlots,0);
      assert.equal(row.structuralIntermediateVectorCount,0);
      assert.equal(row.structuralIntermediateVectorSlots,0);
      assert.deepEqual(row.retainedIntermediatePaths,[]);
      assert.ok(row.currentVectorCount>0,'current source vectors and indexes remain');
      assert.ok(row.completedFactCounts.contexts>0,'completed context facts remain');
    }
  assert.equal(sha256Bytes(await readFile(process.env.ABI5_LIVENESS_CUT_HISTORY)), process.env.ABI5_LIVENESS_CUT_SHA256);
  console.log(JSON.stringify({ kind: 'liveness_transient_view_conservation',
    rows: results[1].rowCount, accepted: results[1].accepted.length,
    oldCache: results[0].cache, newCache: results[1].cache, oldRepeatedCache: results[0].repeatedCache,
    newRepeatedCache: results[1].repeatedCache, projectionDigest: sha256Canonical(results[1].projections),
    invalidationRebuiltExact: true, rawAndNominalRefusalsRetained: true,
    snapshotPredecessorCompared:results.length===3,replayDigest:sha256Canonical(results[1].replayValue) }));
});
