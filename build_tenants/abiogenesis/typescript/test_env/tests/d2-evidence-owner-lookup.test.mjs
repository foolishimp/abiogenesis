import test from 'node:test';
import assert from 'node:assert/strict';
import {collectorHarness,retainedSkip} from '../support/d2-evidence-owner-harness.mjs';
import {capturedEnvelopeSkip} from '../support/d2-bounded-harness.mjs';

// Lookup assumptions only, never admitted event history. The initial-arm cases
// (their producer is the ic-07 store's admitted preparation, which predates the
// current stage context contract, so the current collector re-derives another
// prompt and refuses it) and the predecessor-collector half of the frozen-prefix
// case are retired (T-290 C-18b).
const skip=retainedSkip||capturedEnvelopeSkip;
test('revision collector: actual producer plus nested aliases yields one source and retains nonzero observation (lookup assumptions)',{skip},async()=>{
  const h=await collectorHarness();
  h.state('another-parent-alias',h.entry,'lookup-only:other-parent');
  const value=h.project();assert.ok(value);
  const evidence=value.current.evidence;
  assert.equal(evidence.artifacts.length,22);
  assert.equal(evidence.executionObservation.commandResults[0].exitStatus,1);
  assert.deepEqual(evidence.executionObservation,h.input);
  assert.equal(evidence.constructionResultRef,h.construction.previous.result.resultRef);
  assert.equal(evidence.executionResultRef,h.command.previous.result.resultRef);
});
test('revision collector: one producer without any alias remains accepted (lookup assumptions)',{skip},async()=>{
  const h=await collectorHarness();h.removeAlias();assert.ok(h.project());
});
test('revision collector: distinct same-valued producing CCalls remain ambiguous (lookup assumptions)',{skip},async()=>{
  const h=await collectorHarness();
  h.state('competing-bridge',h.entry,h.bridgeRef,h.original,11);
  assert.equal(h.project(),null,'no value-based owner deduplication');
});
test('revision collector: spliced, wrong, foreign, nonadvancing and stale producer each refuse (lookup assumptions)',{skip},async()=>{
  const mutations={
    spliced:h=>{h.owner.events=Object.freeze(h.owner.events.filter(e=>e!==h.bridge.event));},
    wrongImplementation:h=>{h.bridge.previous.cCall.implementationRef='lookup-only:foreign-implementation';},
    wrongEnvelope:h=>{h.bridge.execution.rawInputValue={kind:'lookup-only:forged-envelope'};},
    foreignInvocation:h=>{h.bridge.execution.invocationAdmissionRef='lookup-only:foreign-invocation';},
    nonadvancing:h=>{h.bridge.previous.judgment.judgment='block';},
    stale:h=>{h.bridge.event.admissionOrdinal=h.construction.event.admissionOrdinal;},
  };
  for(const [name,mutate]of Object.entries(mutations)){const h=await collectorHarness();mutate(h);assert.equal(h.project(),null,name);}
});
test('revision collector: the historical prefix it prepares from is strict and immutable (lookup assumptions)',{skip},async()=>{
  const h=await collectorHarness();h.removeAlias();
  assert.ok(h.project());assert.equal(h.prefixCalls.length,1);
  assert.equal(Object.isFrozen(h.prefixCalls[0]),true);
  assert.ok(h.prefixCalls[0].every(Object.isFrozen));
  assert.equal(h.preparationCalls.length,1);
});
