import assert from 'node:assert/strict';
import test from 'node:test';
import {projectCCallRuntimeFailureSignal} from '../../build/code/src/abg/c_call.js';
import {
  runtimeEventPrefixExtent,runtimeEventPrefixLastEnvelope,selectValidatedRuntimeEventPrefix,
  validatedRuntimeEventPrefixBeforeEvent,validatedRuntimeEventPrefixThroughEvent,
} from '../../build/code/src/abg/event_prefix.js';
import {classifyWorkerTransportFailure} from '../../build/code/src/abg/transport_contracts.js';
import {deepFreeze} from '../../build/code/src/shared/immutable.js';
import {loadCurrentOwnerEvidence} from '../support/t287-current-owner-evidence.mjs';

// The actual readonly RC10 native-assessment population
// (fixtures/t287-current-owner/README.md): 79 original rows decoded only by the
// current owner, including the admitted body reference at physical row 72. Two
// scripted actors returned the literal `{not-json`; the first CCall is the
// subject. Its expected signal, request, observation, source events and terminal
// cut come from the independent owner extraction in the manifest, never from
// the projectors under test. This is component evidence, not native admission.
const {fixture:native,events:decoded,prefix:authentic}=loadCurrentOwnerEvidence('native-assessment');
const {expected}=native;
const byId=new Map(decoded.map(event=>[event.eventId,event]));
const at=ref=>{const event=byId.get(ref);assert(event,`admitted ${ref}`);return event;};

// Negative clones are explicit unadmitted component assumptions over the
// authentic decoded rows. The unchanged clone reaches the authentic signal, so
// a changed clone's refusal belongs to the projector guard, not to fixture
// integrity.
function project(change) {
  let prefix=authentic;
  if(change!==undefined) {
    const events=decoded.map(event=>structuredClone(event));
    change(events);
    prefix=selectValidatedRuntimeEventPrefix(deepFreeze(events));
  }
  return projectCCallRuntimeFailureSignal(prefix,expected.cCallRef,expected.resultRef,expected.judgmentRef);
}

test('CCall failure projection conserves the authenticated malformed-result assessment',()=>{
  assert.equal(decoded.length,native.eventCount);
  const artifacts=decoded.filter(e=>e.kind==='actor_result_artifact_observed');
  assert.equal(artifacts.length,2,'two actual scripted actors, no third');
  for(const e of artifacts) {
    assert.equal(e.payload.finalOutput,'{not-json');
    assert.equal(e.payload.processStatus,0);
    assert.equal(e.payload.nativeResultAssessment.disposition,'rejected');
  }
  assert.deepEqual(decoded.filter(e=>e.kind==='c_call_judged').map(e=>e.payload.judgment),['retry','blocked']);
  assert.equal(decoded.at(-1).kind,'run_stopped');
  const artifact=at(native.sourceEvidence.artifactEventRef),evidence=at(native.sourceEvidence.evidenceEventRef);
  const result=at(native.sourceEvidence.resultEventRef),judgment=at(native.sourceEvidence.judgmentEventRef);
  assert.equal(artifact,artifacts[0]);
  // Physical row 72 references row 40's admitted result value; only the owner
  // decoder restores it into the logical event.
  const referenced=decoded[71];
  assert.equal(referenced.admissionOrdinal,72);assert.equal(referenced.kind,'c_call_result_admitted');
  assert.notEqual(referenced.payload.cCallRef,expected.cCallRef);
  assert.deepEqual(referenced.payload.value,result.payload.value);
  // Independent admitted-field extraction of the expected signal.
  for(const e of [artifact,evidence,result,judgment]) assert.equal(e.payload.cCallRef,expected.cCallRef);
  assert.equal(result.payload.resultRef,expected.resultRef);assert.equal(judgment.payload.judgmentRef,expected.judgmentRef);
  assert(evidence.causationEventRefs.includes(native.actorTerminalEventRef));
  assert(result.causationEventRefs.includes(evidence.eventId));assert.deepEqual(judgment.causationEventRefs,[result.eventId]);
  assert(result.payload.evidenceRefs.includes(evidence.payload.evidenceRef));
  assert.equal(judgment.payload.judgment,'retry');assert.equal(judgment.payload.reasonRef,result.payload.value.failureSignalRef);
  const digestOf=(ref,scheme)=>{assert(ref.startsWith(scheme),ref);return 'sha256:'+ref.slice(scheme.length);};
  assert.deepEqual({
    kind:'c_call_runtime_failure_signal',schemaVersion:'5.0.0',
    failureClass:result.payload.value.failureClass,sourceClass:evidence.payload.evidenceClass,
    sourceDigest:digestOf(result.payload.value.failureSourceRef,'runtime-failure-source://abiogenesis/'),
    failureSignalDigest:digestOf(result.payload.value.failureSignalRef,'retry-failure-signal://abiogenesis/'),
    failureSignalRef:result.payload.value.failureSignalRef,
  },expected.signal);
  assert.deepEqual(project(),expected.signal);
});

test('CCall failure projection refuses foreign producer, assessment and artifact correspondence',()=>{
  assert.deepEqual(project(()=>{}),expected.signal,'unchanged clone reaches the authentic signal');
  const changes=[
    ['foreign producer',e=>e.actorInvocationRef='actor-invocation://abiogenesis/foreign'],
    ['foreign assessment input',e=>e.nativeResultAssessment.inputDigest='sha256:'+'f'.repeat(64)],
    ['changed assessment disposition',e=>e.nativeResultAssessment.disposition='absent'],
    ['missing current assessment',e=>delete e.nativeResultAssessment],
  ];
  for(const [label,change] of changes) {
    assert.equal(project(events=>change(events.find(e=>e.eventId===native.sourceEvidence.artifactEventRef).payload)),null,label);
  }
  assert.equal(project(events=>{
    const terminal=events.find(e=>e.eventId===native.actorTerminalEventRef);
    terminal.payload.consumedArtifactEventRef=terminal.payload.consumedStdoutEventRefs[0];
  }),null,'a different admitted producer event cannot become the result artifact');
});

test('historical absent-assessment classification and ordinary failure classes retain their meaning',()=>{
  const base={parser:'claude_stream_json',lane:'closed_prompt_proof',processStatus:0,timedOut:false,terminationConfirmed:true,processSpawnFailed:false,structuredEventCount:3,toolCallCount:0,apiRetryCount:0,finalOutput:'{not-json'};
  assert.equal(base.finalOutput,native.observation.finalOutput,'the actual rejected literal');
  assert.equal(classifyWorkerTransportFailure(base),null,'legacy unassessed text is not retrospectively payload-assessed');
  assert.equal(classifyWorkerTransportFailure({...base,finalOutput:''}),'no_output');
  assert.equal(classifyWorkerTransportFailure({...base,processStatus:1}),'transport_failure');
  assert.equal(classifyWorkerTransportFailure({...base,toolCallCount:1}),'contract_failure');
  assert.equal(classifyWorkerTransportFailure({...base,nativeResultDisposition:'rejected'}),'contract_failure');
  assert.equal(classifyWorkerTransportFailure({...base,processStatus:1,nativeResultDisposition:'admitted'}),null,'existing admitted-result salvage policy is unchanged');
});

test('actor transport authentication is available before candidate association and refuses crossed facts',async()=>{
  const {projectActorTransportForResult}=await import('../../build/code/src/abg/c_call.js');
  const {sha256Canonical:hash,sha256Bytes}=await import('../../build/code/src/shared/digests.js');
  const {request,observation}=native,call={cCallRef:expected.cCallRef};
  const artifact=at(native.sourceEvidence.artifactEventRef),terminal=at(native.actorTerminalEventRef);
  // The extracted request and observation are checked against the admitted
  // artifact directly, not through the projector.
  assert.equal(hash(request),artifact.payload.requestDigest);
  for(const key of ['actorInvocationRef','processRef','inputDigest','finalOutput','observedOutputDigest','transportDigest'])
    assert.equal(observation[key],artifact.payload[key],key);
  assert.equal(sha256Bytes(observation.finalOutput),artifact.payload.nativeResultAssessment.rawOutputDigest);
  // Exact owner cuts: through the actual terminal, and immediately before it.
  assert.equal(terminal.kind,'actor_invocation_failed');assert.equal(terminal.admissionOrdinal,native.transportPrefixCount);
  assert.equal(terminal.payload.consumedArtifactEventRef,artifact.eventId);
  const prefix=validatedRuntimeEventPrefixThroughEvent(authentic,terminal.eventId);
  const preterminal=validatedRuntimeEventPrefixBeforeEvent(authentic,terminal.eventId);
  assert.deepEqual(runtimeEventPrefixExtent(prefix),{count:native.transportPrefixCount,lastOrdinal:native.transportPrefixCount});
  assert.deepEqual(runtimeEventPrefixExtent(preterminal),{count:native.preterminalPrefixCount,lastOrdinal:native.preterminalPrefixCount});
  assert.equal(runtimeEventPrefixLastEnvelope(prefix).eventId,native.actorTerminalEventRef);
  const projected=projectActorTransportForResult(prefix,call,request,observation);
  assert(projected);assert.equal(projected.failureClass,'contract_failure');
  assert.equal(projected.nativeResultAssessment.disposition,'rejected');
  assert.equal(projected.actorTerminalEventRef,native.actorTerminalEventRef);
  assert(!Object.hasOwn(projected,'candidateRef'),'artifact truth does not invent a result candidate');
  for(const [key,value]of [['actorInvocationRef','actor://foreign'],['inputDigest',hash('other input')],['finalOutput','{}'],['processRef','process://foreign']])
    assert.equal(projectActorTransportForResult(prefix,call,request,{...observation,[key]:value}),null,key);
  assert.equal(projectActorTransportForResult(prefix,{cCallRef:'c-call://foreign'},request,observation),null);
  assert.equal(projectActorTransportForResult(preterminal,call,request,observation),null,'preterminal prefix cannot supply completed actor truth');
});
