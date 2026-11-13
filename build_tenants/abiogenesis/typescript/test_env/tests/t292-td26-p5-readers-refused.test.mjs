import assert from 'node:assert/strict';
import test from 'node:test';
import {resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';

// The same discriminator can be run against the frozen predecessor build.
const tenant=process.env.ABI5_P5_TEST_TENANT ?? fileURLToPath(new URL('../..',import.meta.url));
const mod=path=>import(pathToFileURL(resolve(tenant,'build/code/src',path)).href);
const store=await mod('abg/event_store.js'), prefix=await mod('abg/event_prefix.js');
const ec=await mod('abg/event_calculus.js'), fh=await mod('abg/fh_continuation_projection.js');
const {sha256Canonical:hash}=await mod('shared/digests.js');
const {canonicalJson}=await mod('shared/canonical_json.js');

function candidate(kind,overrides={}) {
  const contract=store.ROOT_EVENT_CONTRACTS[kind],envelope=contract.variants[0];
  const shape=contract.payloadVariants.find(row=>row.expectedPayload?.continuationKind===overrides.continuationKind) ?? contract.payloadVariants[0];
  const payload=Object.fromEntries(shape.requiredPayloadKeys.map(key=>[key,key.endsWith('Digest')?hash(key):key.endsWith('Refs')?[]:`test://td26p5/${key}`]));
  const identities=Object.fromEntries(envelope.requiredEnvelopeIdentities.map(key=>[key,`test://td26p5/${key}`]));
  return {kind,eventTime:'2026-11-13T00:00:00.000Z',aggregateType:envelope.aggregateType,scopeClass:envelope.scopeClass,
    aggregateId:identities[`${envelope.aggregateType}Id`] ?? `test://td26p5/${envelope.aggregateType}`,parentAggregateId:null,causationEventRefs:[],correlationId:'correlation://td26p5',
    workflowVersion:'5.0.0',basisId:'basis://td26p5',...identities,payload:{...payload,...shape.expectedPayload,...overrides}};
}
function admitted(kind,overrides){return store.projectRuntimeEventFromValidatedHistory([],candidate(kind,overrides));}
function read(rows){return prefix.selectValidatedRuntimeEventPrefix(store.validateHistoricalEvents(Buffer.from(rows.map(row=>canonicalJson(row)+'\n').join(''))));}
function changedPayload(row,changes){
  const {eventId,admissionOrdinal,payloadDigest,eventContractDigest,...body}=row;
  const changed={...body,payload:{...body.payload,...changes}},digest=hash(changed.payload);
  return {...changed,eventContractDigest,payloadDigest:digest,admissionOrdinal,
    eventId:`event://abiogenesis/${hash({...changed,eventContractDigest,payloadDigest:digest,admissionOrdinal}).slice(7)}`};
}

for(const kind of ['construction_intent_selected','construction_delta_observed','construction_continuation_opened'])
  test(`${kind} remains decodable but cannot realize an Event Calculus derivation`,()=>{
    const row=admitted(kind,kind==='construction_continuation_opened'?{continuationKind:'construction_intent'}:{});
    const source=read([row]);
    assert.throws(()=>ec.deriveRuntimeHeldFluentProjection(source),new RegExp(`Unknown Event Calculus event kind ${kind}`));
  });

for(const continuationKind of ['construction_intent','selected_action']) for(const kind of ['continuation_superseded','public_operation_admitted'])
  test(`${kind} refuses the retired ${continuationKind} lifecycle instead of the generic calculus fallback`,()=>{
    const row=admitted(kind,{continuationKind,...(kind==='continuation_superseded'?{terminalDisposition:'superseded'}:{})});
    const source=read([row]);
    assert.throws(()=>ec.deriveRuntimeHeldFluentProjection(source),/has an invalid event lifecycle/);
    if(kind==='public_operation_admitted') assert.equal(fh.projectFhEffectfulPublicInvocationFacts(source).disposition,'invalid_history');
  });

for(const [kind,key,values,kept] of [
  ['traversal_route_admitted','routeKind',['gap_stop'],'blocked'],
  ['run_stopped','disposition',['gap_stop','reprice_required','repair','inspect_runtime_archive','reprice','escalate'],'blocked'],
]) for(const value of values) test(`${kind} rejects ${key}=${value} at admission and cold decode`,()=>{
  const control=admitted(kind,{[key]:kept});
  assert.doesNotThrow(()=>read([control]));
  assert.throws(()=>store.projectRuntimeEventFromValidatedHistory([],candidate(kind,{[key]:value})),/unknown (route kind|disposition)/);
  assert.throws(()=>read([changedPayload(control,{[key]:value})]),/unknown (route kind|disposition)/);
});
