import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import * as store from '../../build/code/src/abg/event_store.js';
import {admitInitialTraversalCursor} from '../../build/code/src/abg/traversal_cursor.js';
test('initial cursor validates from its checked entry and retains stale/physical refusal precedence',async()=>{
 const root=await mkdtemp(join(tmpdir(),'d15-cursor-')),path=join(root,'events.jsonl');
 const acquired=store.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:path});assert.ok('store'in acquired);
 try{
  const first=(await readFile(process.env.ABI5_OWNER_HISTORY,'utf8')).trimEnd().split('\n').map(JSON.parse).find(event=>event.kind==='public_operation_admitted');
  const {eventId,admissionOrdinal,payloadDigest,eventContractDigest,...candidate}=first;
  const committed=store.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(acquired.store,acquired.prefix,()=>store.admitRuntimeEvent(acquired.store,candidate));
  const invoke=coordinate=>admitInitialTraversalCursor(acquired.store,coordinate,{},null,null,null,null,null);
  const bytes=await readFile(path),before={...globalThis.p0Work};
  const refused=invoke(committed.successorPrefix);
  assert.equal(refused.kind,'traversal_cursor_admission_refusal');assert.equal(refused.code,'basis_mismatch');
  if(globalThis.p0Work){assert.equal((globalThis.p0Work.descriptorReads??0)-(before.descriptorReads??0),1);assert.equal((globalThis.p0Work.physicalReads??0)-(before.physicalReads??0),0);}
  assert.deepEqual(await readFile(path),bytes);assert.equal(acquired.store.readAll().length,1);
  assert.throws(()=>invoke(acquired.prefix));
  const changed=Buffer.from(bytes);changed[0]=91;await writeFile(path,changed);
  assert.throws(()=>invoke(committed.successorPrefix),'physical entry failure precedes semantic basis refusal');
  assert.deepEqual(await readFile(path),changed);assert.equal(acquired.store.readAll().length,1);
  await writeFile(path,bytes);assert.deepEqual(invoke(committed.successorPrefix),refused);
  console.log(JSON.stringify({kind:'d15_initial_cursor_boundary',entryDescriptorReads:1,duplicatePhysicalReads:0,semanticRefusal:'basis_mismatch',staleAndSameLengthMutationRefusedBeforeSemanticValidation:true,admittedEffects:0}));
 }finally{acquired.store.closeDurableLog();await rm(root,{recursive:true,force:true});}
});
