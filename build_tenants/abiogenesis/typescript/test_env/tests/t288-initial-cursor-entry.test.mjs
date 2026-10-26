import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import * as store from '../../build/code/src/abg/event_store.js';
import {admitInitialTraversalCursor} from '../../build/code/src/abg/traversal_cursor.js';
import {sha256Canonical} from '../../build/code/src/shared/digests.js';
// The entry is any admitted workspace fact: the lane writes its own through the
// store owner (the former ABI5_OWNER_HISTORY input supplied only this first row).
// RETIRED: the held-store byte mutation arm ("physical entry failure precedes
// semantic basis refusal"). A held open store's derivation is current by its
// own head and is not rehashed (design T287_D4_D5 :262-271, T287_W2_R2 :88-95);
// cold and copied ingress still authenticate. The claim was the superseded cut's.
test('initial cursor validates from its checked entry and refuses a stale prefix before semantic validation',async()=>{
 const root=await mkdtemp(join(tmpdir(),'d15-cursor-')),path=join(root,'events.jsonl');
 const acquired=store.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:path});assert.ok('store'in acquired);
 try{
  const invocationRef='invocation://abiogenesis/t288/initial-cursor',correlationId='correlation://abiogenesis/t288/initial-cursor';
  const candidate={kind:'public_operation_admitted',eventTime:'2026-10-27T00:00:00.000Z',aggregateType:'workspace',aggregateId:invocationRef,
   parentAggregateId:null,causationEventRefs:[],correlationId,workflowVersion:'5.0.0',scopeClass:'workspace',basisId:'basis://abiogenesis/t288/initial-cursor',
   payload:{invocationDigest:sha256Canonical({invocationRef,correlationId}),invocationRef,operationId:'abg.operation.project.read',variant:'status'}};
  const committed=store.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(acquired.store,acquired.prefix,()=>store.admitRuntimeEvent(acquired.store,candidate));
  const invoke=coordinate=>admitInitialTraversalCursor(acquired.store,coordinate,{},null,null,null,null,null);
  const bytes=await readFile(path),before={...globalThis.p0Work};
  const refused=invoke(committed.successorPrefix);
  assert.equal(refused.kind,'traversal_cursor_admission_refusal');assert.equal(refused.code,'basis_mismatch');
  if(globalThis.p0Work){assert.equal((globalThis.p0Work.descriptorReads??0)-(before.descriptorReads??0),1);assert.equal((globalThis.p0Work.physicalReads??0)-(before.physicalReads??0),0);}
  assert.deepEqual(await readFile(path),bytes);assert.equal(acquired.store.readAll().length,1);
  assert.throws(()=>invoke(acquired.prefix),/held store differs from the selected durable prefix/);
  assert.deepEqual(await readFile(path),bytes);assert.equal(acquired.store.readAll().length,1);
  assert.deepEqual(invoke(committed.successorPrefix),refused);
  console.log(JSON.stringify({kind:'d15_initial_cursor_boundary',semanticRefusal:'basis_mismatch',staleRefusedBeforeSemanticValidation:true,admittedEffects:0}));
 }finally{acquired.store.closeDurableLog();await rm(root,{recursive:true,force:true});}
});
