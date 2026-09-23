import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import * as store from '../../build/code/src/abg/event_store.js';
import * as prefix from '../../build/code/src/abg/event_prefix.js';
import {RuntimeDerivationSource} from '../../build/code/src/abg/runtime_derivation.js';
import {sha256Canonical} from '../../build/code/src/shared/digests.js';
import {deepFreeze} from '../../build/code/src/shared/immutable.js';
const counts=()=>({...globalThis.p0Work});
const delta=(a,b,k)=>(b[k]??0)-(a[k]??0);
const history=async()=>deepFreeze((await readFile(process.env.ABI5_OWNER_HISTORY,'utf8')).trimEnd().split('\n').map(JSON.parse));
const candidate=n=>({kind:'public_operation_admitted',eventTime:'2026-09-20T04:00:00.000Z',aggregateType:'workspace',aggregateId:'invocation://d10/'+n,parentAggregateId:null,causationEventRefs:[],correlationId:'correlation://d10/'+n,workflowVersion:'5.0.0',scopeClass:'workspace',basisId:'basis://d10',payload:{invocationDigest:sha256Canonical(n),invocationRef:'invocation://d10/'+n,operationId:'abg.operation.project.read',variant:'status'}});

test('logical prefix hashes conserve cold, copied, foreign, scoped and reverse values without re-encoding an owned history',async()=>{
 const events=await history(),source=new RuntimeDerivationSource();let full;
 for(const cut of [0,1,68,87,104,434,events.length,104,87]){
  const selected=prefix.selectValidatedRuntimeEventPrefix(source.snapshot(events.slice(0,cut)));
  const expected=sha256Canonical(selected.events);assert.equal(prefix.runtimeEventPrefixDigest(selected),expected);
  const before=counts();assert.equal(prefix.runtimeEventPrefixDigest(selected),expected);
  if(globalThis.p0Work)assert.equal(delta(before,counts(),'canonicalPrefixRows'),0);
  assert.equal(prefix.runtimeEventPrefixDigest(prefix.selectValidatedRuntimeEventPrefix(deepFreeze(structuredClone(selected.events)))),expected);
  const foreign=new RuntimeDerivationSource();assert.equal(prefix.runtimeEventPrefixDigest(prefix.selectValidatedRuntimeEventPrefix(foreign.snapshot(selected.events))),expected);
  if(cut===events.length)full=selected;
 }
 const runId=events.find(e=>e.runId!==undefined).runId;
 const scoped=prefix.selectRuntimeEventPrefixFromAuthority(full,{runId});assert.equal(prefix.runtimeEventPrefixDigest(scoped),sha256Canonical(scoped.events));
 const earlier=prefix.validatedRuntimeEventPrefixThroughEvent(full,events[86].eventId);assert.equal(prefix.runtimeEventPrefixDigest(earlier),sha256Canonical(events.slice(0,87)));
 assert.throws(()=>prefix.runtimeEventPrefixDigest({...full}),/nominal validated/);
 assert.throws(()=>prefix.selectValidatedRuntimeEventPrefix(Object.freeze([{...events[0],payload:{mutable:true}}])),/immutable snapshot/);
 console.log(JSON.stringify({kind:'d10_digest_conservation',cuts:9,coldCopiedForeignScopedReverse:true,repeatedOwnedEncodingRows:0}));
});

test('store logical digest preserves staged guards, unrelated-run staleness, rollback and physical mutation refusal',async()=>{
 const scratch=await mkdtemp(join(tmpdir(),'d10-digest-'));const path=join(scratch,'events.jsonl');const acquired=store.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:path});assert.ok('store'in acquired);const s=acquired.store;
 try{
  assert.equal(s.digest(),sha256Canonical([]));
  const template=(await history()).find(e=>e.kind==='run_segment_opened');
  const run=n=>{const {eventId,admissionOrdinal,payloadDigest,eventContractDigest,...row}=structuredClone(template);return {...row,runId:'run://d10/'+n,aggregateId:'run://d10/'+n,causationEventRefs:[],correlationId:'correlation://d10/'+n,payload:{...row.payload,runId:'run://d10/'+n}};};
  const first=store.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(s,acquired.prefix,()=>store.admitRuntimeEvent(s,run('one')));
  const old=s.digest(),selected=s.digest({runId:'run://d10/one'});assert.equal(old,sha256Canonical(s.readAll()));
  const before=counts();for(let i=0;i<4;i++)assert.equal(s.digest(),old);
  if(globalThis.p0Work){assert.equal(delta(before,counts(),'eventArrayCanonicalCalls'),0);assert.equal(delta(before,counts(),'canonicalPrefixRows'),0);assert.equal(delta(before,counts(),'replayMaterializations'),0);}
  const second=store.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(s,first.successorPrefix,()=>store.admitRuntimeEvent(s,run('two')));
  assert.equal(s.digest({runId:'run://d10/one'}),selected,'unrelated run preserves selected run hash');assert.notEqual(s.digest(),old,'full logical predecessor changes');
  const bytes=await readFile(path);assert.throws(()=>store.admitRuntimeEventTransactionAtExpectedPrefix(s,old,()=>assert.fail('stale plan executed')),/exact expected/);assert.deepEqual(await readFile(path),bytes);
  const current=s.digest();let staged;
  assert.throws(()=>store.admitRuntimeEventTransactionAtExpectedPrefix(s,current,()=>{
   store.admitRuntimeEvent(s,candidate('rollback'));staged=s.digest();assert.equal(staged,sha256Canonical(s.readAll()));assert.notEqual(staged,current);
   assert.throws(()=>store.compareAndAppendExpectedPrefix(s,current,[]),/exact expected/);
   throw Error('rollback selected');
  }),/rollback selected/);assert.equal(s.digest(),current);assert.deepEqual(await readFile(path),bytes);
  const third=store.admitRuntimeEventTransactionAtExpectedPrefix(s,current,()=>store.admitRuntimeEvent(s,candidate('committed')));assert.ok(third.successorPrefix);assert.notEqual(s.digest(),staged);assert.equal(s.digest(),sha256Canonical(s.readAll()));
  // Full and scoped logical identities remain distinct; causal selection is unchanged.
  const scope={invocationRef:'invocation://d10/committed'};assert.equal(s.digest(scope),sha256Canonical(s.readScope(scope)));
  const committed=await readFile(path),changed=Buffer.from(committed);changed[0]=91;await writeFile(path,changed);
  assert.throws(()=>store.admitRuntimeEventTransactionAtDurablePrefix(s,third.successorPrefix,()=>assert.fail('physical drift reached effect')));
  assert.throws(()=>store.admitRuntimeEventTransactionAtExpectedPrefix(s,s.digest(),()=>store.admitRuntimeEvent(s,candidate('physical-refusal'))));assert.equal(s.readAll().length,3);assert.deepEqual(await readFile(path),changed);await writeFile(path,committed);
  console.log(JSON.stringify({kind:'d10_transaction_guards',unrelatedRunStalePlan:true,stagedPlanStale:true,rollback:true,physicalMutationRefused:true,prefixOnlyReplayMaterializations:0}));
 }finally{s.closeDurableLog();await rm(scratch,{recursive:true,force:true});}
});
