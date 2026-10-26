// T-291 M-6 (binding row 8): capability admission's refusals surface as the
// exported functions and the fixed owners surfaced them. Fixture-free arms:
// the undeclared authority slots, the invalid data basis, a non-object
// environment selection, and a call that differs from its fixed owner.
import test from 'node:test';
import assert from 'node:assert/strict';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import * as Effect from 'effect/Effect';
import {privateOwner} from '../support/r10-private-owner-harness.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const load=name=>import(pathToFileURL(join(root,'build/code/src',name+'.js')));
const [product,authority,contracts]=await Promise.all([
  load('product/index'),load('product/admission_authority'),load('product/verification_operation_contracts')]);
const [digests,canonical]=await Promise.all([load('shared/digests'),load('shared/canonical_json')]);

test('the exported slots selection throws the refusal as its TypeError',()=>{
  for(const slots of [null,{},{actor:null}]) assert.throws(()=>product.admissionAuthoritySlots(slots),
    e=>e instanceof TypeError&&String(e)==='TypeError: admission authority requires the declared authority slots');
  assert.deepEqual(product.admissionAuthoritySlots({capability_grants:{},actor:null}),{actor:null});
});

test('capability basis validation rejects an invalid data basis with its TypeError',async()=>{
  const packet=contracts.PRODUCT_VERIFICATION_CONTRACTS.verify;
  await assert.rejects(authority.validateAdmissionCapabilityBasis({},'actor://m6',packet.metadata.capabilityRefs[0],
    {kind:'admission_capability_grant_construction_basis',fixedPacket:packet,data:{}}),
    e=>e instanceof TypeError&&String(e)==='TypeError: admission grant requires valid external authority and closed data basis');
});

test('environment admission keeps its structural parse failure',()=>{
  assert.throws(()=>authority.admitCapabilityEnvironment({kind:'admission_environment_selection'}),
    e=>!(e instanceof TypeError)&&e.name==='ValiError');
});

test('a fixed owner surfaces a differing call as its resource_admission fault',async()=>{
  const packet=contracts.PRODUCT_VERIFICATION_CONTRACTS.verify;
  let entered=false;
  const callable=authority.withAdmissionAuthority(packet,()=>{entered=true;return Effect.succeed(null);});
  for(const call of [{invocation:{},resources:{}},{invocation:{request:null},resources:null}]) {
    const fault=await Effect.runPromise(Effect.flip(callable(call)));
    assert.deepEqual(fault,{kind:'definition_execution_fault',schemaVersion:'5.0.0',definitionKey:packet.definitionKey,
      stage:'resource_admission',code:'resource_relation_mismatch',message:'TypeError: definition call differs from its fixed owner',evidence:{}});
  }
  assert.equal(entered,false);
});

test('a definition fault thrown inside admission rides in the resource_admission message as its stage, code and message',async()=>{
  // Controlled component case: the call admission, the structural parse and the event resource owner are
  // substituted so that the acquisition refuses; the catch under test is the module's own.
  const packet=contracts.PRODUCT_VERIFICATION_CONTRACTS.verify;
  const refusal={kind:'abg_event_resource_refusal',code:'event_resource_unavailable',message:'the selected event log is absent'};
  const owner=await privateOwner('product/admission_authority.js',[],{
    '../public/binding/definition_binding_mechanics.js':{admitExactDefinitionCall:call=>call},
    'valibot':{parse:(_schema,value)=>value},
    '../abg/definition_event_resource.js':{isAcquiredAbgEventResourceSelection:()=>true,validateAbgEventResourceInput:()=>true,acquireAbgEventResource:()=>refusal}});
  const resources={eventResource:{kind:'reopen_abg_event_resource'}},request={};
  const call={invocation:{request,invocationAuthority:{slots:{capability_grants:{},actor:null}}},
    resources:{...resources,admissionAuthority:{basis:{request,boundEnvironment:null,
      resourceScope:{resourcesDigest:digests.sha256Canonical(resources),authoritySlots:{actor:null}}}}}};
  let entered=false;
  const callable=owner.withAdmissionAuthority(packet,()=>{entered=true;return Effect.succeed(null);});
  const fault=await Effect.runPromise(Effect.flip(callable(call)));
  assert.deepEqual(fault,{kind:'definition_execution_fault',schemaVersion:'5.0.0',definitionKey:packet.definitionKey,
    stage:'resource_admission',code:'resource_relation_mismatch',
    message:canonical.canonicalJson({stage:'resource_acquisition',code:refusal.code,message:refusal.message}),evidence:{}});
  assert.equal(entered,false);
});
