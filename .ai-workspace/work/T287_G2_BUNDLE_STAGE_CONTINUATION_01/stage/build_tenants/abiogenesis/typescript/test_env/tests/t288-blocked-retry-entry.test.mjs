import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';

test('blocked retry keeps fresh physical refusal before dynamic selection and semantic rollback',async()=>{
  const roots=[process.env.ABI5_COMPOSITION_PREDECESSOR,resolve(import.meta.dirname,'../..')];
  assert.ok(roots[0]);assert.ok(process.env.ABI5_OWNER_HISTORY);
  const seed=(await readFile(process.env.ABI5_OWNER_HISTORY,'utf8')).trimEnd().split('\n').map(JSON.parse)
    .find(e=>e.kind==='public_operation_admitted');
  const {eventId,admissionOrdinal,payloadDigest,eventContractDigest,...candidate}=seed;
  const outputs=[];
  for(const root of roots){
    const store=await import(pathToFileURL(join(root,'build/code/src/abg/event_store.js')));
    const route=await import(pathToFileURL(join(root,'build/code/src/abg/traversal_route.js')));
    const scratch=await mkdtemp(join(tmpdir(),'blocked-retry-entry-')),path=join(scratch,'events.jsonl');
    const acquired=store.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:path});
    assert.ok('store'in acquired);let selected=0;
    try{
      const committed=store.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(acquired.store,acquired.prefix,
        ()=>store.admitRuntimeEvent(acquired.store,candidate));
      const bytes=await readFile(path),prefix=committed.successorPrefix;
      const invoke=predecessorPrefix=>route.admitBlockedRetryTraversalTransition({store:acquired.store,predecessorPrefix,
        target:null,candidate:{transitionClass:'route',evidence:null},selectRouteCandidate:()=>{selected++;throw Error('selection must not be reached');}});
      const pristine=invoke(prefix);assert.equal(pristine.code,'candidate_mismatch');
      assert.deepEqual(await readFile(path),bytes);assert.equal(acquired.store.readAll().length,1);
      const stale=invoke(acquired.prefix);assert.equal(stale.code,'replay_mismatch');
      const changed=Buffer.from(bytes);changed[0]=91;await writeFile(path,changed);
      const drift=invoke(prefix);assert.equal(drift.code,'replay_mismatch');
      assert.deepEqual(await readFile(path),changed);assert.equal(selected,0);assert.equal(acquired.store.readAll().length,1);
      await writeFile(path,bytes);assert.deepEqual(invoke(prefix),pristine);
      outputs.push({pristine,stale,drift});
    }finally{acquired.store.closeDurableLog();await rm(scratch,{recursive:true,force:true});}
  }
  assert.deepEqual(outputs[1],outputs[0]);
});
