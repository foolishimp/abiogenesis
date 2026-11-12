import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import * as store from '../../build/code/src/abg/event_store.js';
import {sha256Canonical} from '../../build/code/src/shared/digests.js';
import {deepFreeze} from '../../build/code/src/shared/immutable.js';
import {evidenceGate} from '../support/evidence-root.mjs';
const counts=()=>({...globalThis.p0Work});
const delta=(a,b,k)=>(b[k]??0)-(a[k]??0);
const ownerHistory=evidenceGate('owner-history-logical-digest');
const options={skip:ownerHistory.kind==='absent'&&ownerHistory.reason};
const history=()=>deepFreeze(ownerHistory.inputs.history.bytes.toString('utf8').trimEnd().split('\n').map(JSON.parse));
const candidate=n=>({kind:'public_operation_admitted',eventTime:'2026-09-20T04:00:00.000Z',aggregateType:'workspace',aggregateId:'invocation://d10/'+n,parentAggregateId:null,causationEventRefs:[],correlationId:'correlation://d10/'+n,workflowVersion:'5.0.0',scopeClass:'workspace',basisId:'basis://d10',payload:{invocationDigest:sha256Canonical(n),invocationRef:'invocation://d10/'+n,operationId:'abg.operation.project.read',variant:'status'}});

// Retired (T-292 TD-60): logical prefix hashes over the event-memory-repair-35 owner history; holds only against the native profile of that history

test('store logical digest preserves staged guards, unrelated-run staleness and rollback',options,async()=>{
 const scratch=await mkdtemp(join(tmpdir(),'d10-digest-'));const path=join(scratch,'events.jsonl');const acquired=store.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:path});assert.ok('store'in acquired);const s=acquired.store;
 try{
  assert.equal(s.digest(),sha256Canonical([]));
  const template=history().find(e=>e.kind==='run_segment_opened');
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
  console.log(JSON.stringify({kind:'d10_transaction_guards',unrelatedRunStalePlan:true,stagedPlanStale:true,rollback:true,prefixOnlyReplayMaterializations:0}));
 }finally{s.closeDurableLog();await rm(scratch,{recursive:true,force:true});}
});

// T-292 TD-80: the physical arms; they need no recorded input. A held store
// checks, before a transaction's action and again before it writes, that the
// file at its path and behind its descriptor is the regular file it holds
// (device and inode) at the length it retains. It reads no byte and no time
// field. A change of length or identity is refused there with the codes of the
// currentness owner (assertDurableRuntimePrefixCurrent); a same-length change in
// place is not, and is refused at a cold read and at reopen instead.
function heldStore(t,names) {
  const scratch=fs.mkdtempSync(join(tmpdir(),'td80-held-')),path=join(scratch,'events.jsonl');
  const acquired=store.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:path});assert.ok('store' in acquired,JSON.stringify(acquired));
  const s=acquired.store;let prefix=acquired.prefix;
  for(const n of names)prefix=store.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(s,prefix,()=>store.admitRuntimeEvent(s,candidate(n))).successorPrefix;
  t.after(()=>{s.closeDurableLog();fs.rmSync(scratch,{recursive:true,force:true});});
  return {s,path};
}
const ENTRIES={
  'expected-prefix':(s,action)=>store.admitRuntimeEventTransactionAtExpectedPrefix(s,s.digest(),action),
  'durable-prefix':(s,action)=>store.admitRuntimeEventTransactionAtDurablePrefix(s,store.selectHeldEventStoreDurablePrefix(s),action),
};
const LENGTH={code:'prefix_length_mismatch',message:/^ABG durable prefix is not the current durable event-log prefix$/u};
const IDENTITY={code:'file_identity_mismatch',message:/^ABG durable prefix file identity differs from coordinate$/u};
const refusedBy=expected=>error=>error instanceof store.DurablePrefixReadError&&error.code===expected.code&&expected.message.test(error.message);
// The last row cut off; a foreign row appended; the path renamed over by a copy.
const truncate=path=>{const b=fs.readFileSync(path);fs.truncateSync(path,b.lastIndexOf(10,b.length-2)+1);};
const CHANGES={
  truncated:{expected:LENGTH,apply:truncate},
  extended:{expected:LENGTH,apply:path=>fs.appendFileSync(path,'{"foreign":true}\n')},
  replaced:{expected:IDENTITY,apply:path=>{fs.copyFileSync(path,path+'.copy');fs.renameSync(path+'.copy',path);}},
};
// A hard link keeps the held inode reachable, so a refused call can be shown
// to leave both the path's file and the held file unchanged.
const snapshot=path=>({path:fs.readFileSync(path),held:fs.readFileSync(path+'.held')});
const putBack=(change,path,committed)=>{if(change==='replaced')fs.renameSync(path+'.held',path);else{fs.writeFileSync(path,committed);fs.unlinkSync(path+'.held');}};
const coldRead=prefix=>store.readRuntimeEventsAtDurablePrefix(structuredClone(prefix));

test('a truncated, extended or replaced held log is refused at both transaction entries before the action, and the refused call writes nothing',async t=>{
  const observed=[];
  for(const [change,{expected,apply}] of Object.entries(CHANGES)) for(const [entry,admit] of Object.entries(ENTRIES)) {
    const {s,path}=heldStore(t,['one','two','three']);
    const committed=fs.readFileSync(path),digest=s.digest(),held=store.selectHeldEventStoreDurablePrefix(s);
    fs.linkSync(path,path+'.held');apply(path);
    const changed=snapshot(path);let ran=false;
    assert.throws(()=>admit(s,()=>{ran=true;return store.admitRuntimeEvent(s,candidate('refused'));}),refusedBy(expected),`${change} at the ${entry} entry`);
    assert.equal(ran,false,`${change} at the ${entry} entry: the action does not run`);
    assert.deepEqual(snapshot(path),changed,`${change} at the ${entry} entry: the refused call writes nothing`);
    assert.equal(s.digest(),digest);assert.equal(store.selectHeldEventStoreDurablePrefix(s),held);
    // An admission outside a transaction meets the same check before its write.
    assert.throws(()=>store.admitRuntimeEvent(s,candidate('refused-bare')),refusedBy(expected),`${change}: an admission outside a transaction`);
    assert.deepEqual(snapshot(path),changed);assert.equal(s.digest(),digest);
    // An action that changes the file itself meets the check before the write:
    // the action ran, nothing is written and the staged row is rolled back.
    putBack(change,path,committed);fs.linkSync(path,path+'.held');
    let inAction=false,afterAction;
    assert.throws(()=>admit(s,()=>{inAction=true;apply(path);afterAction=snapshot(path);return store.admitRuntimeEvent(s,candidate('refused-in-action'));}),refusedBy(expected),`${change} inside the ${entry} action`);
    assert.equal(inAction,true);assert.deepEqual(snapshot(path),afterAction,`${change} inside the ${entry} action: nothing written`);
    assert.equal(s.digest(),digest,'the staged row is rolled back');
    // With the file put back the same store appends again: the refusal poisons nothing.
    putBack(change,path,committed);
    const next=admit(s,()=>store.admitRuntimeEvent(s,candidate('after-restore')));
    assert.equal(next.successorPrefix.prefixLength,fs.statSync(path).size);
    assert.equal(coldRead(next.successorPrefix).length,4);
    observed.push({change,entry,code:expected.code,actionRan:ran,actionThatChangedTheFileRan:inAction});
  }
  console.log(JSON.stringify({kind:'td80_append_currentness',observed}));
});

test('a same-length change in place is accepted at both entries and refused at a cold read of a copied successor and at reopen; the original byte written back makes the log read again',async t=>{
  for(const timeRestored of [false,true]) {
    const {s,path}=heldStore(t,['one','two','three']);
    const committed=fs.readFileSync(path),before=fs.statSync(path);
    const fd=fs.openSync(path,'r+');try{fs.writeSync(fd,Buffer.from('['),0,1,0);}finally{fs.closeSync(fd);}
    if(timeRestored)fs.utimesSync(path,before.atime,before.mtime);
    assert.equal(fs.statSync(path).size,committed.length);assert.equal(fs.statSync(path).ino,before.ino);
    const ran={};
    const expected=ENTRIES['expected-prefix'](s,()=>{ran.expected=true;return store.admitRuntimeEvent(s,candidate('after-change-expected'));});
    const durable=ENTRIES['durable-prefix'](s,()=>{ran.durable=true;return store.admitRuntimeEvent(s,candidate('after-change-durable'));});
    assert.deepEqual(ran,{expected:true,durable:true},'both entries run their action');
    assert.ok(expected.successorPrefix&&durable.successorPrefix,'both entries return a successor');
    // The new rows land where the store recorded them; only byte 0 differs.
    const appended=fs.readFileSync(path);
    assert.equal(appended.length,durable.successorPrefix.prefixLength);
    assert.equal(appended[0],0x5b);assert.deepEqual(appended.subarray(1,committed.length),committed.subarray(1));
    assert.throws(()=>coldRead(durable.successorPrefix),error=>error.code==='prefix_digest_mismatch'&&/bytes differ from coordinate/u.test(error.message),'a cold read of the copied successor');
    const handoff=s.projectReopenAuthorityAndClose();
    const refused=store.reopenEventStore(handoff.reopenAuthority);
    assert.equal(refused.kind,'event_store_reopen_refusal');assert.equal(refused.code,'durable_log_mismatch');assert.match(refused.message,/bytes differ from coordinate/u);
    // A positional write of the original byte; rewriting the whole committed
    // file would cut off the two new rows.
    const w=fs.openSync(path,'r+');try{fs.writeSync(w,committed,0,1,0);}finally{fs.closeSync(w);}
    assert.equal(coldRead(durable.successorPrefix).length,5,'the copied successor reads cold again');
    const reopened=store.reopenEventStore(handoff.reopenAuthority);
    assert.equal(reopened.kind,'reopened_event_store_context',JSON.stringify(reopened));
    assert.equal(reopened.historicalEventCount,5);reopened.store.closeDurableLog();
  }
});

// The child is started with another TMPDIR, so it finds no lock and reopens the
// log the parent holds (the lock namespace is TD-82). Its append changes the
// length, so the parent's next append is refused before its action.
const CHILD=`const [module,authority]=process.argv.slice(1);const S=await import(module);
const {sha256Canonical}=await import(new URL('../shared/digests.js',module).href);
const candidate=${candidate.toString()};
const re=S.reopenEventStore(JSON.parse(authority));if(re.kind!=='reopened_event_store_context'){console.log(JSON.stringify({reopen:re.code}));process.exit(0);}
const r=S.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(re.store,re.prefix,()=>S.admitRuntimeEvent(re.store,candidate('second-process')));
console.log(JSON.stringify({reopen:'reopened',ordinal:r.value.admissionOrdinal,handoff:re.store.projectReopenAuthorityAndClose()}));`;

test('after a second process appends to a held log, the holder\'s next append is refused at both entries and the log keeps one row per ordinal',async t=>{
  const {s:seed,path}=heldStore(t,['one','two','three']);
  const authority=seed.projectReopenAuthorityAndClose().reopenAuthority;
  const holder=store.reopenEventStore(authority);assert.equal(holder.kind,'reopened_event_store_context');
  const s=holder.store;t.after(()=>s.closeDurableLog());
  const alternate=fs.mkdtempSync(join(tmpdir(),'td80-alt-'));t.after(()=>fs.rmSync(alternate,{recursive:true,force:true}));
  const child=spawnSync(process.execPath,['--input-type=module','-e',CHILD,new URL('../../build/code/src/abg/event_store.js',import.meta.url).href,JSON.stringify(authority)],
    {env:{...process.env,TMPDIR:alternate},encoding:'utf8'});
  assert.equal(child.status,0,child.stderr);
  const second=JSON.parse(child.stdout.trim());
  assert.equal(second.reopen,'reopened','a process with another TMPDIR acquires the held log');assert.equal(second.ordinal,4);
  const afterSecond=fs.readFileSync(path);
  for(const [entry,admit] of Object.entries(ENTRIES)) {
    let ran=false;
    assert.throws(()=>admit(s,()=>{ran=true;return store.admitRuntimeEvent(s,candidate('holder'));}),refusedBy(LENGTH),`the holder at the ${entry} entry`);
    assert.equal(ran,false);assert.deepEqual(fs.readFileSync(path),afterSecond);
  }
  assert.deepEqual(afterSecond.toString('utf8').trimEnd().split('\n').map(line=>JSON.parse(line).admissionOrdinal),[1,2,3,4]);
  const stale=store.reopenEventStore(s.projectReopenAuthorityAndClose().reopenAuthority);
  assert.equal(stale.code,'durable_log_mismatch','the holder\'s handoff names the length before the second append');
  const current=store.reopenEventStore(second.handoff.reopenAuthority);
  assert.equal(current.kind,'reopened_event_store_context',JSON.stringify(current));assert.equal(current.historicalEventCount,4);current.store.closeDurableLog();
});

// A failure inside the write's rollback-protected section, produced without a
// seam in the store: the store's node:fs binding is replaced for one call
// (syncBuiltinESMExports), as the owned-append I/O case of m5-event-store-reopen
// does. The injected write first changes the file behind the store, then fails.
// The rollback truncates only the held file at a length from the prior length
// to the prior length plus this attempt's bytes; here it does not truncate,
// releases ownership and reports both causes.
test('a failed append whose file changed during the write is not truncated; ownership is released with both causes',async t=>{
  const DURING={
    truncated:{expected:LENGTH,apply:truncate},
    'extended beyond the attempt':{expected:LENGTH,apply:path=>fs.appendFileSync(path,'{"foreign":"'+'x'.repeat(4096)+'"}\n')},
    replaced:CHANGES.replaced,
  };
  for(const [change,{expected,apply}] of Object.entries(DURING)) {
    const {s,path}=heldStore(t,['one','two']);
    fs.linkSync(path,path+'.held');
    const originalWrite=fs.writeSync;let changed,failure;
    fs.writeSync=()=>{fs.writeSync=originalWrite;syncBuiltinESMExports();apply(path);changed=snapshot(path);throw Error('injected native write failure');};
    syncBuiltinESMExports();
    // The expected-prefix entry rethrows the append's own failure; the
    // durable-prefix entry wraps it once more after ownership is released.
    try{ENTRIES['expected-prefix'](s,()=>store.admitRuntimeEvent(s,candidate('during')));}
    catch(error){failure=error;}
    finally{fs.writeSync=originalWrite;syncBuiltinESMExports();}
    assert.ok(changed,`${change}: the injected write ran`);
    assert.ok(failure instanceof AggregateError,`${change}: ${failure}`);
    assert.equal(failure.message,'ABG durable event append failed and its owned prefix could not be restored');
    assert.equal(failure.errors[0].message,'injected native write failure');
    assert.ok(refusedBy(expected)(failure.errors[1]),`${change}: the rollback cause is ${failure.errors[1]}`);
    assert.deepEqual(snapshot(path),changed,`${change}: the file is not truncated`);
    assert.throws(()=>store.admitRuntimeEvent(s,candidate('after-release')),/not open/u);
    assert.throws(()=>s.projectReopenAuthorityAndClose(),/not open/u);
  }
});
