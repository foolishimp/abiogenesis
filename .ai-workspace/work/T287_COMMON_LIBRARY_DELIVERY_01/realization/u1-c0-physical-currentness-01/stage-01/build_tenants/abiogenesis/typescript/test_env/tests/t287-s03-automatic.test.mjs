import test from 'node:test';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {read,purePreflight,save,runInstalledProof} from '../support/t287-s03-automatic.mjs';
const proof=process.env.ABI5_S03_EVIDENCE_ROOT;
assert.ok(proof,'Exact S03 evidence directory is required');
test('S03 Phase A pure declaration and finite domain construction',async()=>{
 const prior=await read(join(proof,'../s7-pending-consumer-01/selected-action-09/same-basis/environment.json'));
 const result=await purePreflight({prior,oracle:await read(join(proof,'oracle.json'))});
 await save(proof,'pure-preflight.json',result);
});

test('S03 Phase B ordinary installed positive and no-action', {skip:process.env.ABI5_S03_PHASE_B_RELEASE!=='ROOT_RELEASED_PHASE_B'},async()=>{
 const prior=await read(join(proof,'../s7-pending-consumer-01/selected-action-09/same-basis/environment.json'));
 await runInstalledProof({proof,prior,oracle:await read(join(proof,'oracle.json')),release:process.env.ABI5_S03_PHASE_B_RELEASE});
});
