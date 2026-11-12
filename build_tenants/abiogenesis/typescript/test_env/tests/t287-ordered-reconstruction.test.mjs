import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import * as storeOwner from '../../build/code/src/abg/event_store.js';
import * as prefixOwner from '../../build/code/src/abg/event_prefix.js';
import * as replay from '../../build/code/src/abg/replay.js';
import { RuntimeDerivationSource, ownedRuntimeDerivationSource, runtimeDerivationSource } from '../../build/code/src/abg/runtime_derivation.js';
import { deepFreeze } from '../../build/code/src/shared/immutable.js';
import { sha256Canonical } from '../../build/code/src/shared/digests.js';
import { admitIJsonValue } from '../../build/code/src/shared/i_json.js';
import { projectRunTruthAtDurablePrefix } from '../../build/code/src/abg/project_read_ports.js';
import { projectOwnedPrefixArtifactTruth, projectExactPrefixArtifactTruth, validateExactPrefixArtifactTruthProjection, runtimePrefixFromOwnedArtifactTruth } from '../../build/code/src/abg/artifact_truth.js';
import { writeRuntimeEventPrefixValue } from '../../build/code/src/abg/event_prefix.js';
// The existing canonical prefix writer is the complete-value boundary; an owned
// handle is never compared through its own JSON.
const completeEvents=prefix=>{let out='';writeRuntimeEventPrefixValue(prefix,part=>{out+=part;});return JSON.parse(out).events;};
const counts=()=>({...globalThis.p0Work});
const delta=(before,after)=>Object.fromEntries([...new Set([...Object.keys(before),...Object.keys(after)])].map(k=>[k,(after[k]??0)-(before[k]??0)]));

test('snapshot proof identity is owner-held while raw and copied histories keep cold fallback',async()=>{
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
    // Retired: the transplanted, inherited and counterfeit descriptor arms. The
    // snapshot proof is now a module-private WeakMap keyed by the owner's frozen
    // array; a snapshot carries no own property to transplant or counterfeit.
    assert.deepEqual(Reflect.ownKeys(appended).filter(key=>typeof key==='symbol'),[]);
    const expected=replay.replayValidatedRuntimeEventPrefix(prefixOwner.selectValidatedRuntimeEventPrefix(appended));
    for(const raw of [[...appended],JSON.parse(JSON.stringify(appended)),structuredClone(appended)]) {
      assert.equal(ownedRuntimeDerivationSource(raw),undefined,'copies carry no nominal source');
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
    console.log(JSON.stringify({kind:'snapshot_identity_conservation',events:rows.length,coldFallbacks:3,appendCutScopeAndInvalidation:true,replayDigest:sha256Canonical(expected)}));
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
    // M05_S06 design :368: "equal prefix reconstructs equal result"; object
    // identity supports mechanics only (constitution :136), so the pure
    // projections are equal to the acquired rows, not the same vector.
    assert.deepEqual(completeEvents(runtimePrefixFromOwnedArtifactTruth(truth)),rows);
    assert.deepEqual(storeOwner.projectRuntimeEventsAtDurablePrefix(captured),rows,'pure projection reconstructs the acquired rows');
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

// Retired (T-292 TD-60): ordered suffixes over the live-UAT-02 observations; holds only against the event contract of those observations

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

// Retired (T-292 TD-60): historical liveness folds agree with a frozen predecessor build; input the historical liveness event log and predecessor not recorded

// Retired (T-292 TD-60): liveness historical-cut answers agree with a predecessor build; input the predecessor build recorded value gone
