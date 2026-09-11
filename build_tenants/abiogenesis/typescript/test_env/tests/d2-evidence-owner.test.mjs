import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {packageRoot,priorRoot,retainedNativeBasis,retainedRows,load} from '../support/d2-evidence-owner-harness.mjs';

test('actual immutable07 prefix: predecessor refuses alias pair; corrected native projection returns 22 artifacts and preserves exit1 (diagnostic only)',async()=>{
  const before=await retainedNativeBasis(priorRoot),after=await retainedNativeBasis(packageRoot);
  assert.equal(before.stage.projectSemanticEvidenceInput(before.basis,before.input),null);
  const value=after.stage.projectSemanticEvidenceInput(after.basis,after.input);
  assert.ok(value,'corrected native evidence collector accepts the actual producer with its lawful nested alias');
  assert.ok(after.product.isSemanticStageEnvelope(value));
  assert.equal(value.evidence.artifacts.length,22);
  assert.deepEqual(value.evidence.executionObservation,after.input);
  assert.equal(value.evidence.executionObservation.commandResults[0].exitStatus,1);
  assert.equal(value.evidence.executionResultRef,after.events.find(e=>e.admissionOrdinal===769).payload.resultRef);
  assert.equal(value.evidence.constructionResultRef,after.events.find(e=>e.admissionOrdinal===719).payload.resultRef);
  const basisBefore=before.events.filter(e=>e.kind==='c_call_result_admitted'&&e.payload.value?.kind==='worksite_command_preparation_input');
  assert.deepEqual(basisBefore.map(e=>e.admissionOrdinal),[211,219]);
  const {SEMANTIC_STAGE_IDS}=await load(priorRoot,'gtl/semantic_stage_identity');
  const sources=basisBefore.map(e=>before.stage.selectedSemanticPredecessor(before.basis,SEMANTIC_STAGE_IDS.bridgeImplementationRef,e.payload.value));
  assert.deepEqual(sources.map(s=>s?.event.admissionOrdinal),[211,211]);
  assert.equal(new Set(sources.map(s=>s?.event.payload.cCallRef)).size,1);
  assert.equal(retainedRows().events.length,800,'diagnostic did not author native events');
});

test('08 source delta is only the two candidate guards and revision immutable-prefix allocation',()=>{
  const pairs=[
    ['semantic_stage.ts',[
      ['      if (source === null || source.event.eventId !== event.eventId ||\n        source.event.admissionOrdinal >= construction.event.admissionOrdinal) return null;',
       '      if (source === null || source.event.admissionOrdinal >= construction.event.admissionOrdinal) return null;']]],
    ['semantic_revision.ts',[
      ['      if (bridge === null || bridge.event.eventId !== event.eventId ||\n        bridge.event.admissionOrdinal >= construction.event.admissionOrdinal) return null;',
       '      if (bridge === null || bridge.event.admissionOrdinal >= construction.event.admissionOrdinal) return null;'],
      ['        selectValidatedRuntimeEventPrefix(Object.freeze(owner.events.filter(e => e.admissionOrdinal < bridge.event.admissionOrdinal))));',
       '        selectValidatedRuntimeEventPrefix(owner.events.filter(e => e.admissionOrdinal < bridge.event.admissionOrdinal)));']]],
  ];
  for(const [name,changes]of pairs){let after=readFileSync(resolve(packageRoot,'code/src/abg',name),'utf8');const before=readFileSync(resolve(priorRoot,'code/src/abg',name),'utf8');
    for(const [next,old]of changes){assert.equal(after.split(next).length,2);after=after.replace(next,old);}assert.equal(after,before,name);}
});
