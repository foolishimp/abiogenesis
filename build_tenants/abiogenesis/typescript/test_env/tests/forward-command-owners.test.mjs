import test from 'node:test';
import assert from 'node:assert/strict';
import { product as p, componentSource, hash, forward, gtl } from '../support/forward-command-harness.mjs';
import { ownerLookups } from '../support/forward-owner-lookups.mjs';
const F=p.WORKSITE_COMMAND_FORWARD_IDS;

test('synthetic current native lookup maps all controlled retained C0 owners only under exact witness',async()=>{
  const h=await ownerLookups();assert.equal(h.project(),null,'W artifact is not a cover');
  const cover=h.cover(),before=h.transitionReads,projection=h.project();assert.ok(projection);
  assert.equal(projection.snapshotSources.length,h.old.protectedObservations.length);assert.deepEqual([...projection.bindingCoverEventRefs],[cover.eventId]);
  assert.ok(h.transitionReads-before<=h.old.protectedObservations.length,'one C0 transition query per result per immutable-prefix session, not N squared');
  projection.snapshotSources.forEach((row,i)=>{
    assert.equal(row.source.resultAdmissionEventRef,h.c0[i].result.eventId);
    assert.equal(row.source.evidenceEventRef,h.c0[i].evidence.eventId);
    assert.equal(row.observation.fileIdentity,h.old.protectedObservations[i].observation.fileIdentity);
    assert.notEqual(row.observation.observationRef,h.old.protectedObservations[i].observation.observationRef);
  });
  const task=p.constructWorksiteCommandForwardTask({request:h.request,originalTask:h.old,...projection});
  assert.equal(p.isWorksiteCommandForwardTask(task),true);
});

test('synthetic cover wrong direction, scope, missing member and unrelated origin refuse in unchanged native owners',async()=>{
  const h=await ownerLookups(),cover=h.cover();assert.ok(h.project());
  const old=structuredClone(cover);
  for(const mutate of [r=>{r.payload.beforeDigest=hash('foreign');},r=>{r.payload.afterDigest=r.payload.beforeDigest;},
    r=>{r.payload.subjectRef='basis://foreign';},r=>{r.payload.evidence.pop();}]){
    Object.assign(cover,structuredClone(old));mutate(cover);assert.equal(h.project(),null);
  }
  Object.assign(cover,old);
  const c0=h.c0[0],original=c0.basis.invocationAdmissionRef;c0.basis.invocationAdmissionRef='invocation://foreign';
  assert.equal(h.project(),null);c0.basis.invocationAdmissionRef=original;
  const evidence=c0.result.payload.evidenceRefs;c0.result.payload.evidenceRefs=[];assert.equal(h.project(),null);c0.result.payload.evidenceRefs=evidence;
  const missing={...h.request,protectedObservations:h.request.protectedObservations.slice(1)};
  assert.equal(h.owner.projectClosedConstructionRetainedVector(h.snapshot(),h.old,missing,[h.base]),null);
});

test('synthetic workflow alias does not add a C0 owner; distinct same-value producer is ambiguity',async()=>{
  const h=await ownerLookups();h.cover();assert.ok(h.project());
  const original=h.c0[0].result;
  h.event('c_call_result_admitted',structuredClone(original.payload),{aggregateId:'workflow://alias',basisId:original.basisId});
  assert.ok(h.project(),'native C0 transition lookup excludes workflow alias');
  h.addC0(0,'genuine-competing-producer');assert.equal(h.project(),null,'equal bytes do not deduplicate distinct producing CCalls');
});

test('synthetic later cross-W post-publication failure invalidates the old subject alias without fabricating O1',async()=>{
  const h=await ownerLookups();h.cover();assert.ok(h.project());
  const failed=h.addC0(0,'later-failed-publication',{failed:true,afterBinding:true});
  assert.equal(h.transitions.get(failed.result.eventId).successorObservation,null);
  assert.equal(h.project(),null);
});

test('synthetic current-prefix consumption refuses another exact producer, unresolved admission and ignores unrelated scope',async()=>{
  const h=await ownerLookups();assert.equal(h.forward.worksiteCommandForwardUnconsumed(h.snapshot(),h.request,null),true);
  const ref='invocation-admission://mechanical/forward',invocation={invocationAdmissionRef:ref,graphFunctionRef:F.graphFunctionRef,workspaceId:h.request.workspaceBinding.workspaceId};
  h.invocations.set(ref,invocation);h.event('invocation_admitted',{invocationAdmissionRef:ref});
  assert.equal(h.forward.worksiteCommandForwardUnconsumed(h.snapshot(),h.request,null),false,'unresolved forward admission already occupies scope');
  assert.equal(h.forward.worksiteCommandForwardUnconsumed(h.snapshot(),h.request,ref),true,'same current invocation is not a competitor');
  const basis={...h.base,basisRef:'basis://mechanical/forward',admissionEventRef:'event://mechanical/forward',rawInputValue:h.request};
  h.bases.set(basis.basisRef,basis);h.event('basis_admitted',{basisClass:'root',basisRef:basis.basisRef,invocationAdmissionRef:ref},{eventId:basis.admissionEventRef});
  assert.equal(h.forward.worksiteCommandForwardUnconsumed(h.snapshot(),h.request,null),false);
  basis.rawInputValue=p.constructWorksiteCommandForwardRequest({...h.request,source:{...h.request.source,failedCCallRef:'c-call://other-obligation'}});
  assert.equal(h.forward.worksiteCommandForwardUnconsumed(h.snapshot(),h.request,null),true);
});

test('canonical native entry and occurrence owners refuse same-Run transfer, standalone task, foreign GF and missing native basis',()=>{
  const {request,coordinate,originalTask}=componentSource(),root=gtl.worksiteCommandForwardGraphFunctions().find(g=>g.name===F.graphFunctionRef);
  assert.equal(forward.worksiteCommandForwardEntryDisposition(coordinate,root,request,request.workspaceBinding,[request.capabilityGrant],{sourceResultRef:'oldRun'}),'basis_fork_detected');
  assert.equal(forward.worksiteCommandForwardEntryDisposition(coordinate,root,originalTask,request.workspaceBinding,[request.capabilityGrant],null),'basis_fork_detected');
  assert.equal(forward.worksiteCommandForwardEntryDisposition(coordinate,{...root,name:'graph-function://foreign'},request,request.workspaceBinding,[request.capabilityGrant],null),'basis_fork_detected');
  assert.equal(forward.authenticateWorksiteCommandForwardBasis({}),null);
});
