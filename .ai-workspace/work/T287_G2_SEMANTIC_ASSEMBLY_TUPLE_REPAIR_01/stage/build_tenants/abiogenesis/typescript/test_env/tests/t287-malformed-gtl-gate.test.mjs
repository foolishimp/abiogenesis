// Validates: REQ-P-QUAL-064. No native Run, full-vector or release claim.
import test from 'node:test';
import assert from 'node:assert/strict';
import { inputFixture, nativeJoinFixture, coverage, ids, hash, identity } from '../support/malformed-gtl-native-fixture.mjs';
import { isMalformedGtlAssessmentInput, evaluateMalformedGtlAssessment } from '../../build/code/src/validator/qualification.js';
import { qualificationResultRelation } from '../../build/code/src/validator/self_conformance_semantics.js';
const plain = value => JSON.parse(JSON.stringify(value));
const reidentifyBasis = basis => { const { basisRef, basisDigest, ...body } = basis; return identity(body, 'basisRef', 'basisDigest', 'qualification-basis://abiogenesis/'); };
const synthetic = { cCallRef: 'c-call://unadmitted', predecessorPrefix: { kind: 'durable_prefix_coordinate', schemaVersion: '5.0.0', eventLogRef: 'file:///unadmitted',
  prefixLength: 0, prefixDigest: hash([]), storeIdentity: { device: 1, inode: 2, eventContractDigest: hash('none') }, coordinateDigest: hash('none') } };
test('actual raw admission and Program validation compute declared diagnostics and a control; development subject stays blocked', () => {
  const { input } = inputFixture(); assert(isMalformedGtlAssessmentInput(input));
  const assessment = evaluateMalformedGtlAssessment(input, synthetic);
  assert.deepEqual(assessment.cases.map(c => c.actual), input.cases.map(c => c.expected));
  assert.equal(assessment.disposition, 'green');
  assert(qualificationResultRelation(ids.malformedAssessPredicate, input, assessment) === false, 'computed fixture has no native owner');

});
test('different expected diagnostics compute red and cannot close as green; foreign law and duplicate case IDs refuse', () => {
  const { input } = inputFixture(), changed = structuredClone(input); changed.cases[0].expected.diagnostics[0].code = 'invalid_contract';
  const result = evaluateMalformedGtlAssessment(changed, synthetic); assert.equal(result.disposition, 'red');
  const foreign = structuredClone(input); foreign.basis.lawBasis = { ref: 'law://foreign', digest: hash('foreign') }; foreign.basis = reidentifyBasis(foreign.basis);
  assert(!isMalformedGtlAssessmentInput(foreign));
  const duplicate = structuredClone(input); duplicate.cases.push(duplicate.cases[0]); assert(!isMalformedGtlAssessmentInput(duplicate));
});
async function assessedFixture(options) {
  const f = await nativeJoinFixture(options), assess = f.open(ids.malformedAssessGraph, f.input, 'assessment');
  const candidate = f.implementation.realizeMalformedGtlAssessment(f.input, { cCallRef: assess.call.cCallRef, qualificationOwnerBasis: assess.basis });
  assert.equal(candidate.disposition, 'success'); const assessment = candidate.resultCandidate; f.complete(assess, assessment);
  return { ...f, assess, assessment };
}
test('actual F_D assessment and native producer remain reusable without owning-result minting', async () => {
  const f = await assessedFixture(); assert(f.owner.malformedGtlAssessmentHasNativeOwner(f.proof(), f.assessment));
  assert(f.semantics.qualificationResultRelation(ids.malformedAssessPredicate, f.input, f.assessment));
});
test('closed lower-native assumptions: foreign installed subject refuses before computation; old owner frontier refuses', async () => {
  const f = await nativeJoinFixture({ changeInput: input => { input.basis.productContentDigest = hash('foreign'); input.basis = reidentifyBasis(input.basis); return input; } });
  const a = f.open(ids.malformedAssessGraph, f.input, 'foreign');
  assert.equal(f.implementation.realizeMalformedGtlAssessment(f.input, { cCallRef: a.call.cCallRef, qualificationOwnerBasis: a.basis }).disposition, 'failure');
  const g = await nativeJoinFixture(), p = g.open(ids.malformedAssessGraph, g.input, 'first');
  g.open(ids.malformedAssessGraph, g.input, 'later');
  assert.equal(g.implementation.realizeMalformedGtlAssessment(g.input, { cCallRef: p.call.cCallRef, qualificationOwnerBasis: p.basis }).disposition, 'failure');

});
test('closed lower-native assumptions: invented assessment, foreign prefix and later duplicate producer cannot project', async () => {
  const f = await assessedFixture(), invented = evaluateMalformedGtlAssessment(f.input, synthetic);
  assert(!f.owner.malformedGtlAssessmentHasNativeOwner(f.proof(), invented));
  const foreign = structuredClone(f.proof()); foreign.prefix.storeIdentity.inode = 99;
  assert(!f.owner.malformedGtlAssessmentHasNativeOwner(foreign, f.assessment));
  const prior = f.proof(), duplicate = f.open(ids.malformedAssessGraph, f.input, 'duplicate');
  f.complete(duplicate, evaluateMalformedGtlAssessment(f.input, duplicate.basis));
  assert(f.owner.malformedGtlAssessmentHasNativeOwner(prior, f.assessment));
  assert(!f.owner.malformedGtlAssessmentHasNativeOwner(f.proof(), f.assessment));

});

// Public conformance projection with closed admission/currentness premises.
// Raw admission, Program validation, authority matching and result schemas are
// real owners. This fixture supplies no installed/native qualification claim.
test('Public conformance conserves dual-kind closure authorities and rejects missing or conflicting ownership', async t => {
  const Effect = await import('effect/Effect');
  const { privateOwner } = await import('../support/r10-private-owner-harness.mjs');
  const { constructHelloWorldModulePublication, HELLO_WORLD_IDS } = await import('../../build/code/src/gtl/hello_world.js');
  const { ConformancePort } = await import('../../build/code/src/validator/conformance_operation.js');
  const { rawAdmitValue } = await import('../../build/code/src/validator/raw_admission.js');
  const publication = constructHelloWorldModulePublication({ productId:'product://component/conformance', artifactDigest:hash('artifact'),
    productContentDigest:hash('content'), productManifestDigest:hash('manifest'), packageName:'@abiogenesis/typescript-tenant', packageVersion:'5.0.0-rc.1' });
  const program = publication.programs.find(p => p.programRef === HELLO_WORLD_IDS.programRef);
  assert.ok(program);
  const coord = (ref, value = {ref}) => ({ref, digest:hash(value)});
  const law = coord('law://abiogenesis/validator/gtl-program@5');
  const workspace = coord('workspace-binding://component/conformance'), install = coord('product-install://component/conformance');
  const lock = {lockId:'lock://component/conformance',lockDigest:hash('lock')};
  const authority = {fixture:'supplied workspace authority',authorizedActorRef:'actor://component/conformance'};
  const truth = {rows:[{operationId:'abg.operation.workspace.bind',artifactRef:workspace.ref,artifactDigest:workspace.digest,
    workspaceAuthorityBasis:authority,causationEventRefs:['event://component/install'],invocationRef:'invocation://component/bind'}]};
  const environment = {artifactTruth:truth};
  let emittedRef = null;
  const owner = await privateOwner('validator/conformance_definition_bindings.js', [], {
    '../product/admission_authority.js':{withAdmissionAuthority:(_packet,fn)=>call=>fn(call,environment)},
    '../abg/index.js':{
      validateExactPrefixArtifactTruthProjection:value=>value===truth,
      projectAdmittedProductInstallByAdmissionEventRef:()=>({resolvedLock:lock,install}),
      projectAdmittedWorkspaceBindingByInvocationRef:()=>({binding:{bindingId:workspace.ref,bindingDigest:workspace.digest}}),
    },
    '../product/environment.js':{isWorkspaceAuthorityBasis:value=>value===authority,productInstallCoordinate:value=>value},
    '../shared/definition_binding_mechanics.js':{exactDefinitionCallMatches:()=>true},
    './conformance_operation.js':{ConformancePort:{evaluateGtlProgram:packet=>{
      const actual=ConformancePort.evaluateGtlProgram(packet);
      return emittedRef===null ? actual : {...actual,violatedContractRefs:[...actual.violatedContractRefs,emittedRef]};
    }}},
  });
  const packetFor = supplied => ({kind:'conformance_evaluate_packet',schemaVersion:'5.0.0',memberKey:'gtl_program',publication:supplied,
    program:supplied.programs.find(p=>p.programRef===program.programRef)});
  const invoke = (supplied, selectedLaw=law) => {
    const packet=packetFor(supplied);
    const call={invocation:{definitionKey:{operationId:'abg.operation.conformance.evaluate',memberKey:'gtl_program'},
      request:{program:coord(packet.program.programRef,packet.program),conformanceLaw:selectedLaw,inventoryBasis:{kind:'program_only'}},
      invocationAuthority:{slots:{workspace_binding:workspace,product_set:[install],dependency_lock:{ref:lock.lockId,digest:lock.lockDigest},
        actor:{actor:coord(authority.authorizedActorRef)}}}},
      resources:{kind:'conformance_evaluation_resource_assertion',schemaVersion:'5.0.0',packet,conformanceLaw:selectedLaw,declaredInventory:[publication]}};
    return Effect.runPromise(owner.CONFORMANCE_DEFINITION_BINDINGS.evaluate.gtl_program(call));
  };
  const invalid=structuredClone(publication), graph=invalid.graphFunctions.find(g=>g.name===program.starts[0].graphFunctionRef);
  graph.template.nodes[0].term={kind:'c_controller',inputCarrierRef:graph.inputs[0],outputCarrierRef:graph.outputs[0]};
  const native=ConformancePort.evaluateGtlProgram(packetFor(invalid));
  assert.equal(native.code,'validation_failed');assert.equal(native.diagnostics[0].code,'invalid_constructor');
  assert.equal(native.diagnostics[0].path,`$.graphFunctions[${graph.name}].template.nodes[${graph.template.nodes[0].nodeRef}].term.kind`);
  const failed=(await invoke(invalid)).ownerOutput;
  assert.equal(failed.outcomeKind,'result');assert.equal(failed.value.disposition,'failed');
  assert.deepEqual(failed.value.diagnostics,native.diagnostics);
  assert.deepEqual(failed.value.assessment,{ref:native.diagnosticRef,digest:hash(native)});
  const expected=[...invalid.contracts.map(value=>({ref:value.contractRef,digest:hash(value)})),
    ...invalid.closureContracts.map(value=>({ref:value.closureContractRef,digest:hash(value)}))];
  const sorted=values=>values.map(value=>JSON.stringify(value)).sort();
  assert.deepEqual(sorted(failed.value.violatedAuthorities),sorted(expected),'complete exact authority population, including both typed closure bodies');
  assert.deepEqual([...new Set(failed.value.violatedAuthorities.map(x=>x.ref))].sort(),native.violatedContractRefs);
  const closure=invalid.closureContracts.find(c=>invalid.contracts.some(d=>d.contractRef===c.closureContractRef&&d.contractKind==='closure'));
  assert.ok(closure);
  const pair=failed.value.violatedAuthorities.filter(x=>x.ref===closure.closureContractRef);
  assert.equal(pair.length,2);assert.notEqual(pair[0].digest,pair[1].digest);
  const evidence=[rawAdmitValue(invalid,'module_publication','contract://abiogenesis/gtl/module-publication@5'),
    rawAdmitValue(packetFor(invalid).program,'gtl_program','contract://abiogenesis/gtl/program@5')];
  for(const admitted of evidence)assert.ok(failed.value.evidence.some(row=>row.ref===admitted.admissionRef));
  assert.equal(failed.value.evidence.length,3);assert.deepEqual(failed.value.repairAffordances,[]);
  const passed=(await invoke(publication)).ownerOutput;
  assert.equal(passed.outcomeKind,'result');assert.equal(passed.value.disposition,'passed');assert.deepEqual(passed.value.violatedAuthorities,[]);
  const rawInvalid=structuredClone(publication);rawInvalid.programs.find(p=>p.programRef===program.programRef).kind='not_a_program';
  assert.equal((await invoke(rawInvalid)).ownerOutput.value.code,'invalid_program');
  assert.equal((await invoke(invalid,coord('law://component/foreign'))).ownerOutput.value.code,'law_mismatch');
  const singleton=structuredClone(invalid);singleton.contracts=singleton.contracts.filter(c=>c.contractKind!=='closure');
  const one=(await invoke(singleton)).ownerOutput.value;
  assert.equal(one.disposition,'failed');assert.equal(one.violatedAuthorities.filter(x=>x.ref===closure.closureContractRef).length,1);
  for(const mutate of [
    p=>p.closureContracts.push({...closure,predicateRef:'predicate://component/conflict'}),
    p=>p.contracts.find(c=>c.contractRef===closure.closureContractRef).contractKind='output',
  ]){const conflict=structuredClone(invalid);mutate(conflict);await assert.rejects(invoke(conflict),/conflicting violated authority definitions/);}
  emittedRef='contract://component/absent';
  await assert.rejects(invoke(invalid),/unbound violated authority reference: contract:\/\/component\/absent/);
  t.diagnostic(JSON.stringify({scope:'actual conformance projection; supplied admission/currentness premises',
    programDigest:hash(packetFor(invalid).program),publicationDigest:hash(invalid),
    violatedReferences:native.violatedContractRefs.length,authorityCoordinates:failed.value.violatedAuthorities.length,
    failedOutputDigest:hash(failed),ordinaryFailureDiagnostic:native.diagnostics[0]}));
});
