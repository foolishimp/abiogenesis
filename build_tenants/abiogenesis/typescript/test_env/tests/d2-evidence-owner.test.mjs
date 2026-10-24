import test from 'node:test';
import assert from 'node:assert/strict';
import {packageRoot,priorRoot,priorSkip,retainedNativeBasis,retainedRows,load} from '../support/d2-evidence-owner-harness.mjs';

test('actual immutable07 prefix: predecessor refuses alias pair; corrected native projection returns 22 artifacts and preserves exit1 (diagnostic only)',{skip:priorSkip},async()=>{
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

// Retired (T-290 C-5): '08 source delta is only the two candidate guards and
// revision immutable-prefix allocation'. Its inputs are the implementation-03
// sources comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-03/work/
// code/src/abg/semantic_stage.ts (sha256:1c53604dd39a…, 27773 bytes) and
// semantic_revision.ts (sha256:5d9ef6007204…, 30449 bytes). The claim is false
// today: semantic_stage.ts differs from that source beyond the 08 delta. A
// source-delta claim against a superseded cut cannot be met without weakening
// it.
