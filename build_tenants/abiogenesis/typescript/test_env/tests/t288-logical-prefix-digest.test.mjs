import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import * as store from '../../build/code/src/abg/event_store.js';
import {sha256Bytes,sha256Canonical} from '../../build/code/src/shared/digests.js';
import {deepFreeze} from '../../build/code/src/shared/immutable.js';
import {evidenceGate} from '../support/evidence-root.mjs';
import {eventStoreLockPathOf} from '../support/event-store-lock.mjs';
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
// checks that the file at its path and behind its descriptor is the regular
// file it holds (device and inode) at the length it retains: before a
// transaction's action, before it writes, and after the write and its fsync,
// where the length must also count the bytes written. It reads no byte and no
// time field. A change of length or identity is refused there with the codes
// of the currentness owner (assertDurableRuntimePrefixCurrent); a same-length
// change in place is not, and is refused at a cold read and at reopen instead.
// A store whose ownership is closed or released refuses a transaction before
// its action.
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
// Every transaction entry, with a durable predecessor selected while the store
// still held its log, so that a closed store meets the entry itself.
const TRANSACTION_ENTRIES=prefix=>({
  plain:(s,action)=>store.admitRuntimeEventTransaction(s,action),
  'expected-prefix':(s,action)=>store.admitRuntimeEventTransactionAtExpectedPrefix(s,s.digest(),action),
  'durable-prefix':(s,action)=>store.admitRuntimeEventTransactionAtDurablePrefix(s,prefix,action),
  'non-empty durable-prefix':(s,action)=>store.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(s,prefix,action),
});
const LENGTH={code:'prefix_length_mismatch',message:/^ABG durable prefix is not the current durable event-log prefix$/u};
const IDENTITY={code:'file_identity_mismatch',message:/^ABG durable prefix file identity differs from coordinate$/u};
const NOT_OPEN={message:/^ABG durable event sink is not open for append$/u};
const RELEASED='ABG durable event append failed and its owned prefix could not be restored';
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
// A store whose ownership is released refuses every transaction entry before
// its action, and refuses an admission and a close.
function assertReleased(s,prefix,label) {
  for(const [entry,admit] of Object.entries(TRANSACTION_ENTRIES(prefix))) {
    let ran=false;
    assert.throws(()=>admit(s,()=>{ran=true;return store.admitRuntimeEvent(s,candidate('after-release'));}),NOT_OPEN,`${label}: the ${entry} entry`);
    assert.equal(ran,false,`${label}: the ${entry} entry refuses before its action`);
  }
  assert.throws(()=>store.admitRuntimeEvent(s,candidate('after-release')),NOT_OPEN,`${label}: an admission`);
  assert.throws(()=>s.projectReopenAuthorityAndClose(),NOT_OPEN,`${label}: close`);
}
// A failure inside the write's rollback-protected section, produced without a
// seam in the store: the store's node:fs binding is replaced for the call
// (syncBuiltinESMExports), as the owned-append I/O case of
// m5-event-store-reopen does. Each hook receives its call number, the call's
// arguments, the original functions and the log path.
function withNative(hooks,run) {
  const originals={writeSync:fs.writeSync,fsyncSync:fs.fsyncSync};let writes=0,syncs=0;
  if(hooks.writeSync)fs.writeSync=(...args)=>hooks.writeSync(++writes,args,originals);
  if(hooks.fsyncSync)fs.fsyncSync=descriptor=>hooks.fsyncSync(++syncs,descriptor,originals);
  syncBuiltinESMExports();
  try{return run();}finally{Object.assign(fs,originals);syncBuiltinESMExports();}
}
const failure=run=>{try{run();}catch(error){return error;}assert.fail('the append was accepted');};

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

// A basis row whose raw input is large enough that a later basis with the same
// input is written as a reference to it. Encoding that later row reads the
// shared row from the file by its recorded location and digest.
const sharedInput={kind:'body_fixture_input',text:'selected complete input; '.repeat(1500),metadata:{sources:['source://body-fixture/input']}};
const basisEvent=(label,child=false)=>{
  const body={basisClass:child?'child':'root',rawInputValue:sharedInput,rawInputDigest:sha256Canonical(sharedInput),invocationRef:'invocation://body-fixture/'+label};
  const basisDigest=sha256Canonical(body),basisRef='execution-basis://abiogenesis/'+basisDigest.slice(7);
  return {kind:'basis_admitted',payload:{...body,basisRef,basisDigest},eventTime:'2026-09-22T00:00:00.000Z',aggregateType:'workspace',aggregateId:'workspace://body-fixture',
    parentAggregateId:null,causationEventRefs:[],correlationId:'correlation://body-fixture',workflowVersion:'5.0.0',scopeClass:'workspace',basisId:basisRef,
    ...(child?{aggregateType:'frame',aggregateId:'frame://child',scopeClass:'run',runId:'run://body-fixture',graphCallId:'graph-call://child',frameId:'frame://child'}:{})};
};
const SHARED_ROW_CHANGED={code:'prefix_digest_mismatch',message:/^selected body bytes differ from their authenticated location$/u};

test('after a same-length change in a row whose body a later append shares, a plain append is accepted and the body-sharing append reads the row by location and refuses it',async t=>{
  const scratch=fs.mkdtempSync(join(tmpdir(),'td80-shared-')),path=join(scratch,'events.jsonl');
  const acquired=store.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:path});assert.ok('store' in acquired,JSON.stringify(acquired));
  const s=acquired.store;t.after(()=>{s.closeDurableLog();fs.rmSync(scratch,{recursive:true,force:true});});
  store.admitRuntimeEvent(s,basisEvent('root'));
  // One byte of the shared raw input changed in place: 'e' becomes 'E'.
  const bytes=fs.readFileSync(path),at=bytes.indexOf('selected complete input')+1;assert.equal(bytes[at],0x65);
  const fd=fs.openSync(path,'r+');try{fs.writeSync(fd,Buffer.from('E'),0,1,at);}finally{fs.closeSync(fd);}
  assert.equal(fs.statSync(path).size,bytes.length);
  let ran=false;
  const plain=ENTRIES['expected-prefix'](s,()=>{ran=true;return store.admitRuntimeEvent(s,candidate('plain-after-change'));});
  assert.equal(ran,true);assert.ok(plain.successorPrefix,'a plain append reads no byte and is accepted');
  const afterPlain=fs.readFileSync(path),digest=s.digest();
  assert.throws(()=>store.admitRuntimeEvent(s,basisEvent('shared-bare',true)),refusedBy(SHARED_ROW_CHANGED),'the body-sharing admission outside a transaction');
  let sharedRan=false;
  assert.throws(()=>ENTRIES['expected-prefix'](s,()=>{sharedRan=true;return store.admitRuntimeEvent(s,basisEvent('shared-transaction',true));}),refusedBy(SHARED_ROW_CHANGED),'the body-sharing admission inside a transaction');
  assert.equal(sharedRan,true,'the same-length change passes the check before the action');
  assert.deepEqual(fs.readFileSync(path),afterPlain,'the refused appends write nothing');assert.equal(s.digest(),digest);
});

// T-292 TD-82: the lock namespace follows no environment variable. A second
// process that opens a held log is refused at reopen with the refusal for a
// held log, whatever its TMPDIR, and writes nothing; the child appends only if
// its reopen succeeds. A lock abandoned by a process with another TMPDIR is
// found at the path the store's owner gives and is recovered from it. A lock
// for the log in the namespace of an earlier build, under this TMPDIR, still
// refuses the reopen.
const CHILD=`const [module,authority,mode]=process.argv.slice(1);const S=await import(module);
const {sha256Canonical}=await import(new URL('../shared/digests.js',module).href);
const candidate=${candidate.toString()};
const re=S.reopenEventStore(JSON.parse(authority));if(re.kind!=='reopened_event_store_context'){console.log(JSON.stringify({reopen:re.code,message:re.message}));process.exit(0);}
const r=S.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(re.store,re.prefix,()=>S.admitRuntimeEvent(re.store,candidate('second-process')));
if(mode==='abandon')process.stdout.write(JSON.stringify({reopen:'reopened',ordinal:r.value.admissionOrdinal,pid:process.pid}),()=>process.kill(process.pid,'SIGKILL'));
else console.log(JSON.stringify({reopen:'reopened',ordinal:r.value.admissionOrdinal,handoff:re.store.projectReopenAuthorityAndClose()}));`;
const runChild=(authority,env,mode='append')=>spawnSync(process.execPath,['--input-type=module','-e',CHILD,
  new URL('../../build/code/src/abg/event_store.js',import.meta.url).href,JSON.stringify(authority),mode],{env,encoding:'utf8'});
const anotherTmpdir=t=>{const dir=fs.mkdtempSync(join(tmpdir(),'td82-alt-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));return {...process.env,TMPDIR:dir};};
const HELD_REOPEN=/^durable event sink cannot acquire exact append ownership: TypeError: ABG durable event sink already has an exclusive append lock; abandoned locks require explicit operator recovery$/u;
const ordinals=path=>fs.readFileSync(path,'utf8').trimEnd().split('\n').map(line=>JSON.parse(line).admissionOrdinal);

test('a second process is refused at reopen while the log is held, with another TMPDIR or the same one, and writes nothing',async t=>{
  for(const [label,environment] of [['another TMPDIR',anotherTmpdir],['the same TMPDIR',()=>process.env]]) await t.test(label,st=>{
    const {s:seed,path}=heldStore(st,['one','two','three']);
    const authority=seed.projectReopenAuthorityAndClose().reopenAuthority;
    const holder=store.reopenEventStore(authority);assert.equal(holder.kind,'reopened_event_store_context');
    const s=holder.store;st.after(()=>s.closeDurableLog());
    const before=fs.readFileSync(path);
    const child=runChild(authority,environment(st));
    assert.equal(child.status,0,child.stderr);
    const second=JSON.parse(child.stdout.trim());
    assert.equal(second.reopen,'sink_unavailable',JSON.stringify(second));assert.match(second.message,HELD_REOPEN);
    assert.deepEqual(fs.readFileSync(path),before,'a refused reopen writes nothing');
    assert.ok(ENTRIES['durable-prefix'](s,()=>store.admitRuntimeEvent(s,candidate('holder'))).successorPrefix,'the holder appends');
    assert.deepEqual(ordinals(path),[1,2,3,4]);
  });
});

test('a lock abandoned by a process with another TMPDIR refuses the reopen and is recovered from the owner\'s lock path; the recovered log reopens',async t=>{
  const {s:seed,path}=heldStore(t,['one','two','three']);
  const handoff=seed.projectReopenAuthorityAndClose();
  const child=runChild(handoff.reopenAuthority,anotherTmpdir(t),'abandon');
  assert.equal(child.signal,'SIGKILL',child.stderr);
  const {ordinal,pid}=JSON.parse(child.stdout);assert.equal(ordinal,4);
  const lockPath=eventStoreLockPathOf(fs.statSync(path));t.after(()=>fs.rmSync(lockPath,{force:true}));
  const lock=fs.statSync(lockPath),lockBytes=fs.readFileSync(lockPath),bytes=fs.readFileSync(path);
  const refused=store.reopenEventStore(handoff.reopenAuthority);
  assert.equal(refused.code,'sink_unavailable',JSON.stringify(refused));assert.match(refused.message,HELD_REOPEN);
  const recovered=store.recoverInterruptedEventStore({lastCloseHandoff:handoff,expectedCurrent:{byteLength:bytes.length,digest:sha256Bytes(bytes)},
    abandonedLock:{path:lockPath,device:lock.dev,inode:lock.ino,bytesBase64:lockBytes.toString('base64'),digest:sha256Bytes(lockBytes)},ownerPid:pid});
  assert.equal(recovered.kind,'recovered',JSON.stringify(recovered));assert.equal(recovered.validatedEventCount,4);
  assert.equal(fs.existsSync(lockPath),false,'close releases the adopted lock');assert.deepEqual(fs.readFileSync(path),bytes);
  const next=store.reopenEventStore(recovered.closeHandoff.reopenAuthority);
  assert.equal(next.kind,'reopened_event_store_context',JSON.stringify(next));assert.equal(next.historicalEventCount,4);next.store.closeDurableLog();
  assert.deepEqual(ordinals(path),[1,2,3,4]);
});

// The lock path of a build before TD-82, as that build wrote it.
const previousNamespaceLock=status=>join(tmpdir(),'abiogenesis-event-store-locks-v5',`${status.dev}-${status.ino}.lock`);
test('a lock for the log in the previous namespace under this TMPDIR refuses the reopen, which leaves no lock of its own',async t=>{
  const {s:seed,path}=heldStore(t,['one']);
  const authority=seed.projectReopenAuthorityAndClose().reopenAuthority,status=fs.statSync(path),previous=previousNamespaceLock(status);
  fs.mkdirSync(dirname(previous),{recursive:true});t.after(()=>fs.rmSync(previous,{force:true}));
  fs.writeFileSync(previous,JSON.stringify({device:status.dev,inode:status.ino,kind:'abiogenesis_event_store_append_lock',ownerPid:2_147_483_647,schemaVersion:'5.0.0'})+'\n',{flag:'wx'});
  const before=fs.readFileSync(path);
  const refused=store.reopenEventStore(authority);
  assert.equal(refused.code,'sink_unavailable',JSON.stringify(refused));assert.match(refused.message,HELD_REOPEN);
  assert.equal(fs.existsSync(eventStoreLockPathOf(status)),false,'the refused reopen releases its own lock');assert.deepEqual(fs.readFileSync(path),before);
  fs.rmSync(previous);
  const reopened=store.reopenEventStore(authority);assert.equal(reopened.kind,'reopened_event_store_context',JSON.stringify(reopened));reopened.store.closeDurableLog();
});

// The store checks the file again after its write and fsync: the held file at
// the prior length plus the bytes its writeSync calls returned. A foreign row
// appended between the check before the write and the write itself shifts the
// store's row, so the append fails and returns no successor. The rollback then
// finds a length that is not the prior length plus its own bytes, does not
// truncate and releases ownership.
test('a foreign write between the check before the write and the store\'s own write is refused after the write; the file is left as it is and ownership is released',async t=>{
  const {s,path}=heldStore(t,['one','two','three']);
  const committed=fs.readFileSync(path),digest=s.digest(),held=store.selectHeldEventStoreDurablePrefix(s),inode=fs.statSync(path).ino;
  const foreign='{"foreign":"race"}\n';let raced=false,ran=false;
  const error=failure(()=>withNative({writeSync:(n,args,originals)=>{
    if(!raced&&fs.fstatSync(args[0]).ino===inode){raced=true;fs.appendFileSync(path,foreign);}
    return originals.writeSync(...args);
  }},()=>ENTRIES['expected-prefix'](s,()=>{ran=true;return store.admitRuntimeEvent(s,candidate('race'));})));
  assert.equal(raced,true,'the foreign row was written before the store\'s write');assert.equal(ran,true,'the check before the action passed');
  assert.ok(error instanceof AggregateError,String(error));assert.equal(error.message,RELEASED);
  assert.ok(refusedBy(LENGTH)(error.errors[0]),`the check after the write: ${error.errors[0]}`);
  assert.ok(refusedBy(LENGTH)(error.errors[1]),`the rollback: ${error.errors[1]}`);
  // Not truncated: the committed rows, the foreign row, then the store's row.
  const file=fs.readFileSync(path);
  assert.deepEqual(file.subarray(0,committed.length),committed);
  assert.equal(file.subarray(committed.length,committed.length+foreign.length).toString('utf8'),foreign);
  assert.equal(JSON.parse(file.subarray(committed.length+foreign.length).toString('utf8')).aggregateId,'invocation://d10/race');
  assert.equal(s.digest(),digest,'the row is not committed in memory');
  assertReleased(s,held,'after the refused write');
});

// The rollback truncates to the prior length only when the file is the held
// file and its length equals the prior length plus the bytes this attempt's
// writeSync calls returned. Any other length means bytes that are not the
// attempt's: the store does not truncate, releases ownership and reports both
// causes. The arms change the file during the write (truncated, extended by
// fewer or more bytes than the attempt, replaced), or truncate it before a
// write that lands whole and whose fsync then fails.
test('a failed append whose file changed during the write is not truncated; ownership is released with both causes',async t=>{
  const WRITE_FAILS='injected native write failure',FSYNC_FAILS='injected native fsync failure';
  const changeThenFail=apply=>({cause:WRITE_FAILS,hooks:record=>({writeSync:(n,args,originals)=>{apply(record.path);record.changed=snapshot(record.path);throw Error(WRITE_FAILS);}})});
  const DURING={
    truncated:{expected:LENGTH,...changeThenFail(truncate)},
    'extended by fewer bytes than the attempt':{expected:LENGTH,...changeThenFail(path=>fs.appendFileSync(path,'FOREIGN-10'))},
    'extended beyond the attempt':{expected:LENGTH,...changeThenFail(path=>fs.appendFileSync(path,'{"foreign":"'+'x'.repeat(4096)+'"}\n'))},
    replaced:{expected:IDENTITY,...changeThenFail(CHANGES.replaced.apply)},
    'truncated before a write that lands whole, then fsync fails':{expected:LENGTH,cause:FSYNC_FAILS,hooks:record=>({
      writeSync:(n,args,originals)=>{if(n===1)fs.truncateSync(record.path,fs.statSync(record.path).size-10);return originals.writeSync(...args);},
      fsyncSync:(n,descriptor,originals)=>{if(n===1){record.changed=snapshot(record.path);throw Error(FSYNC_FAILS);}return originals.fsyncSync(descriptor);}})},
  };
  for(const [change,{expected,cause,hooks}] of Object.entries(DURING)) await t.test(change,async st=>{
    const {s,path}=heldStore(st,['one','two']);
    fs.linkSync(path,path+'.held');
    const held=store.selectHeldEventStoreDurablePrefix(s),record={path};
    // The expected-prefix entry rethrows the append's own failure; the
    // durable-prefix entry wraps it once more after ownership is released.
    const error=failure(()=>withNative(hooks(record),()=>ENTRIES['expected-prefix'](s,()=>store.admitRuntimeEvent(s,candidate('during')))));
    assert.ok(record.changed,`${change}: the injected call ran`);
    assert.ok(error instanceof AggregateError,`${change}: ${error}`);
    assert.equal(error.message,RELEASED);
    assert.equal(error.errors[0].message,cause);
    assert.ok(refusedBy(expected)(error.errors[1]),`${change}: the rollback cause is ${error.errors[1]}`);
    assert.deepEqual(snapshot(path),record.changed,`${change}: the file is not truncated`);
    assertReleased(s,held,change);
  });
});

test('a failed append that wrote only its own bytes is truncated back to the prior length and the store stays open',async t=>{
  const ARMS={
    'a short write, then a failed write':{cause:'injected native write failure',hooks:{writeSync:(n,args,originals)=>{
      if(n===1)return originals.writeSync(args[0],args[1],args[2],Math.min(17,args[3]));throw Error('injected native write failure');}}},
    'a failed first fsync':{cause:'injected native fsync failure',hooks:{fsyncSync:(n,descriptor,originals)=>{
      if(n===1)throw Error('injected native fsync failure');return originals.fsyncSync(descriptor);}}},
  };
  for(const [arm,{cause,hooks}] of Object.entries(ARMS)) await t.test(arm,async st=>{
    const {s,path}=heldStore(st,['one','two']);
    const committed=fs.readFileSync(path),digest=s.digest(),held=store.selectHeldEventStoreDurablePrefix(s);
    const error=failure(()=>withNative(hooks,()=>ENTRIES['expected-prefix'](s,()=>store.admitRuntimeEvent(s,candidate('failed')))));
    assert.ok(!(error instanceof AggregateError),`${arm}: ${error}`);assert.equal(error.message,cause);
    assert.deepEqual(fs.readFileSync(path),committed,`${arm}: truncated to the prior length`);
    assert.equal(s.digest(),digest);assert.equal(store.selectHeldEventStoreDurablePrefix(s),held);
    const next=ENTRIES['expected-prefix'](s,()=>store.admitRuntimeEvent(s,candidate('after-truncate')));
    assert.equal(next.successorPrefix.prefixLength,fs.statSync(path).size,`${arm}: the store stays open`);
    assert.equal(coldRead(next.successorPrefix).length,3);
  });
});

test('a store whose ownership is closed refuses every transaction entry before its action',async t=>{
  for(const entry of Object.keys(TRANSACTION_ENTRIES(null))) await t.test(entry,async st=>{
    const {s}=heldStore(st,['one','two']);
    const held=store.selectHeldEventStoreDurablePrefix(s);
    s.closeDurableLog();
    let ran=false;
    assert.throws(()=>TRANSACTION_ENTRIES(held)[entry](s,()=>{ran=true;return store.admitRuntimeEvent(s,candidate('closed'));}),NOT_OPEN,`the ${entry} entry`);
    assert.equal(ran,false,`the ${entry} entry refuses before its action`);
  });
});
