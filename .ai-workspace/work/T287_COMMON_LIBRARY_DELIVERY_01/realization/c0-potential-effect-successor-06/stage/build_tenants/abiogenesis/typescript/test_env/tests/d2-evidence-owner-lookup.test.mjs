import test from 'node:test';
import assert from 'node:assert/strict';
import {collectorHarness} from '../support/d2-evidence-owner-harness.mjs';

// Lookup assumptions only, never admitted event history. The native prefix
//795 before/after check is separately retained in d2-evidence-owner.test.mjs.
for(const arm of ['initial','revision']) {
  test(`${arm} collector: actual producer plus nested aliases yields one source and retains nonzero observation (lookup assumptions)`,async()=>{
    const h=await collectorHarness(arm);
    h.state('another-parent-alias',h.entry,'lookup-only:other-parent');
    const value=h.project();assert.ok(value);
    const evidence=arm==='initial'?value.evidence:value.current.evidence;
    assert.equal(evidence.artifacts.length,22);
    assert.equal(evidence.executionObservation.commandResults[0].exitStatus,1);
    assert.deepEqual(evidence.executionObservation,h.input);
    assert.equal(evidence.constructionResultRef,h.construction.previous.result.resultRef);
    assert.equal(evidence.executionResultRef,h.command.previous.result.resultRef);
  });
  test(`${arm} collector: one producer without any alias remains accepted (lookup assumptions)`,async()=>{
    const h=await collectorHarness(arm);h.removeAlias();assert.ok(h.project());
  });
  test(`${arm} collector: distinct same-valued producing CCalls remain ambiguous (lookup assumptions)`,async()=>{
    const h=await collectorHarness(arm);
    h.state('competing-bridge',h.entry,h.bridgeRef,h.original,11);
    assert.equal(h.project(),null,'no value-based owner deduplication');
  });
  test(`${arm} collector: spliced, wrong, foreign, nonadvancing and stale producer each refuse (lookup assumptions)`,async()=>{
    const mutations={
      spliced:h=>{h.owner.events=Object.freeze(h.owner.events.filter(e=>e!==h.bridge.event));},
      wrongImplementation:h=>{h.bridge.previous.cCall.implementationRef='lookup-only:foreign-implementation';},
      wrongEnvelope:h=>{h.bridge.execution.rawInputValue={kind:'lookup-only:forged-envelope'};},
      foreignInvocation:h=>{h.bridge.execution.invocationAdmissionRef='lookup-only:foreign-invocation';},
      nonadvancing:h=>{h.bridge.previous.judgment.judgment='block';},
      stale:h=>{h.bridge.event.admissionOrdinal=h.construction.event.admissionOrdinal;},
    };
    for(const [name,mutate]of Object.entries(mutations)){const h=await collectorHarness(arm);mutate(h);assert.equal(h.project(),null,name);}
  });
}
test('revision collector: old un-frozen filtered prefix refuses; successor supplies strict immutable historical prefix (lookup assumptions)',async()=>{
  const h=await collectorHarness('revision');h.removeAlias();
  assert.equal(h.projectBefore(),null);
  assert.equal(h.prefixCalls.length,1);
  assert.equal(Object.isFrozen(h.prefixCalls[0]),false);
  assert.equal(h.preparationCalls.length,0,'strict selector refuses before historical preparation');
  assert.ok(h.project());assert.equal(h.prefixCalls.length,2);
  assert.equal(Object.isFrozen(h.prefixCalls[1]),true);
  assert.ok(h.prefixCalls[1].every(Object.isFrozen));
  assert.equal(h.preparationCalls.length,1);
});
