// REQ-P-QUAL-064: bounded source readiness; lower admitted-owner fixtures are
// explicit assumptions, not an installed Run, case-adequacy or qualification claim.
import test from 'node:test';
import fs from 'node:fs';
import { join } from 'node:path';
import {performance} from 'node:perf_hooks';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { nativeJoinFixture, inputFixture, coverage, ids, hash, identity, publication } from '../support/malformed-gtl-native-fixture.mjs';
import { constructLanguageTestInput } from '../support/language-test-gtl.mjs';
import { evidenceGate } from '../support/evidence-root.mjs';
import { render as renderLanguageTest } from '../fixtures/language-smoke/leaf.mjs';
import { setupInstalledRootCatalog } from '../support/root-installed-environment.mjs';
import { isNativeRuntimeAssessmentInput, evaluateMalformedGtlAssessment, parseQualificationCatalogs } from '../../build/code/src/validator/qualification.js';
import { admitGraphFunctionCatalog } from '../../build/code/src/product/index.js';
import { reconstructHistoricalDeclarationCatalog } from '../../build/code/src/product/declaration_closure.js';
import { isAbgHistoricalDeclarationProof } from '../../build/code/src/abg/terminal_result_contracts.js';
const packageRoot = new URL('../..', import.meta.url).pathname;
// Each complete candidate is retained under ABG_REGRESSION_PROOF_ROOT, one file
// per case, before its assertions run. Retained evidence is only read.
const regressionRoot = process.env.ABG_REGRESSION_PROOF_ROOT;
async function retainCandidate(name, value) {
  if (!regressionRoot) return;
  const directory = join(regressionRoot, 't287-native-runtime-gate');
  await fs.promises.mkdir(directory, { recursive: true });
  await fs.promises.writeFile(join(directory, name + '.json'), JSON.stringify(value) + '\n');
}
const catalogs = parseQualificationCatalogs(fs.readFileSync(new URL('../../contracts/qualification/coverage.json', import.meta.url)),
  fs.readFileSync(new URL('../../contracts/qualification/rule-catalog.json', import.meta.url)));
const plain = x => JSON.parse(JSON.stringify(x));
// The complete returned value, or the complete thrown failure, of one owner call.
const outcome = call => { try { return { kind: 'returned', value: call() }; }
  catch (error) { return { kind: 'thrown', name: error?.name, message: String(error?.message ?? error) }; } };
const reidentify = basis => { const { basisRef, basisDigest, ...body } = basis; return identity(body, 'basisRef', 'basisDigest', 'qualification-basis://abiogenesis/'); };
async function witnessFixture(options = {}) {
  const f = await nativeJoinFixture({ runtime: true, ...options });
  const helloInput = constructLanguageTestInput('Qualification'), witness = f.open(f.helloIds.graphFunctionRef, helloInput, 'hello');
  const value = renderLanguageTest(helloInput).resultCandidate;
  const result = f.complete(witness, value, { deterministic: true });
  const bytes = Buffer.from('Mechanical fixture of preserved 4.6 witness material; no case adequacy claim.');
  const input = { kind: 'native_runtime_assessment_input', schemaVersion: '5.0.0', basis: structuredClone(f.input.basis), coverage, proof: f.proof(),
    predecessorWitness: { ref: 'witness://mechanical/4.6', path: 'fixture/witness.txt', digest: 'sha256:' + createHash('sha256').update(bytes).digest('hex'), byteCount: bytes.length, contentBase64: bytes.toString('base64') },
    applicability: 'retained_5_0', applicabilitySourceRefs: coverage.claims.find(c => c.coverageRef.includes('/conservation/')).requirementRefs,
    cases: [{ caseRef: 'case://fd/hello', programRef: witness.execution.programRef, invocationAdmissionRef: witness.execution.invocationAdmissionRef,
      slotRef: witness.call.programLocusRef, graphFunction: { ref: witness.execution.graphFunctionRef, digest: witness.execution.graphFunctionDigest },
      implementationRef: witness.call.implementationRef, inputDigest: hash(helloInput), result: { ref: result.resultRef, digest: result.resultDigest },
      expectedValueDigest: hash(value), substituteResultDigest: hash('declared-unequal-result-digest') }] };
  assert(isNativeRuntimeAssessmentInput(input, catalogs));
  return { ...f, input, witness, value, helloInput };
}
function assess(f, suffix = 'assessment') {
  const opened = f.open(ids.runtimeAssessGraph, f.input, suffix);
  return { opened, candidate: f.implementation.realizeNativeRuntimeAssessment(f.input,
    { cCallRef: opened.call.cCallRef, qualificationOwnerBasis: opened.basis }) };
}
test('ordinary native runtime declaration passes the existing raw/Program owner', () => {
  const f = inputFixture(), program = publication.programs.find(p => p.starts[0].graphFunctionRef === ids.runtimeAssessGraph);
  const input = { ...f.input, cases: [f.input.cases[0], { caseRef: 'case://runtime/program', operation: 'program', publication, program,
    expected: { boundary: 'program_validation', disposition: 'accepted', diagnostics: [] } }] };
  const { nativeBasis } = { nativeBasis: { cCallRef: 'c-call://unadmitted', predecessorPrefix: {
    kind: 'durable_prefix_coordinate', schemaVersion: '5.0.0', eventLogRef: 'file:///unadmitted', prefixLength: 0,
    prefixDigest: hash([]), storeIdentity: { device: 1, inode: 2, eventContractDigest: hash('none') }, coordinateDigest: hash('none') } } };
  const assessed = evaluateMalformedGtlAssessment(input, nativeBasis);
  assert.deepEqual(assessed.cases.map(c => c.actual), input.cases.map(c => c.expected));
});
test('native source joins and cloned judgment retain their actual assessment; no owning adapter', async () => {
  const f = await witnessFixture(), a = assess(f);
  assert.equal(a.candidate.disposition, 'success'); const value = a.candidate.resultCandidate;
  assert.equal(value.disposition, 'green'); assert(value.cases[0].matched && value.cases[0].substituteRefused);
  f.complete(a.opened, value); assert(f.owner.nativeRuntimeAssessmentHasNativeOwner(f.proof(), value));
  const ambiguous=f.proof();ambiguous.declarations=[...ambiguous.declarations,plain(ambiguous.declarations[0])];
  assert.equal(f.owner.nativeRuntimeAssessmentHasNativeOwner(ambiguous,value),false);
  assert(f.semantics.qualificationResultRelation(ids.runtimeAssessPredicate, f.input, plain(value), f.proof().prefix));
  assert(!publication.graphFunctions.some(g => g.name.includes('native-runtime-result')));
});
test('caller-editable qualification owner views cannot mutate retained input authority; warm and cold agree', async () => {
  const f=await witnessFixture(),opened=f.open(ids.runtimeAssessGraph,f.input,'editable-owner');
  const originalDigest=hash(opened.execution.rawInputValue);
  const returned=f.owner.projectQualificationConsumer(opened.basis,f.input,true);assert(returned);
  assert.equal(Object.isFrozen(returned),false);assert.equal(Object.getOwnPropertyDescriptor(returned,'input').writable,true);
  const altered=plain(f.input);altered.cases[0].expectedValueDigest=hash('different declared expected value');
  assert(isNativeRuntimeAssessmentInput(altered, catalogs));returned.input=altered;
  assert.equal(f.owner.projectQualificationConsumer(opened.basis,altered,true),null);
  const warm=f.owner.projectQualificationConsumer(opened.basis,f.input,true);assert(warm);
  assert.notEqual(warm,returned);assert.equal(warm.input,f.input);
  warm.input=altered;assert.equal(f.owner.projectQualificationConsumer(opened.basis,altered,true),null);
  assert.equal(hash(opened.execution.rawInputValue),originalDigest);
  f.cold();assert.equal(f.owner.projectQualificationConsumer(opened.basis,altered,true),null);
  assert(f.owner.projectQualificationConsumer(opened.basis,f.input,true));
});
test('declared wrong value computes red; foreign law, changed installed subject, stale frontier and result substitute refuse', async () => {
  const mismatch = await witnessFixture(); mismatch.input.cases[0].expectedValueDigest = hash('different declared expected value');
  assert.equal(assess(mismatch).candidate.resultCandidate.disposition, 'red');
  const foreign = await witnessFixture(); foreign.input.basis.lawBasis = { ref: 'law://foreign', digest: hash('foreign') };
  foreign.input.basis = reidentify(foreign.input.basis); assert(!isNativeRuntimeAssessmentInput(foreign.input, catalogs));
  const subject = await witnessFixture(); subject.input.basis.productContentDigest = hash('foreign subject'); subject.input.basis = reidentify(subject.input.basis);
  assert.equal(assess(subject).candidate.disposition, 'failure');
  const substituted = await witnessFixture(); substituted.input.cases[0].result.digest = hash('substituted result');
  assert.equal(assess(substituted).candidate.disposition, 'failure');
  const stale = await witnessFixture(), a = stale.open(ids.runtimeAssessGraph, stale.input, 'old-frontier');
  stale.open(ids.runtimeAssessGraph, stale.input, 'new-frontier');
  assert.equal(stale.implementation.realizeNativeRuntimeAssessment(stale.input, { cCallRef: a.call.cCallRef, qualificationOwnerBasis: a.basis }).disposition, 'failure');
});
test('same-valued duplicate witness after assessment invalidates current consumption; supplied prefix substitution refuses', async () => {
  const f = await witnessFixture(), a = assess(f); assert.equal(a.candidate.disposition, 'success');
  f.complete(a.opened, a.candidate.resultCandidate);
  const duplicate = f.open(f.helloIds.graphFunctionRef, f.helloInput, 'hello-duplicate'); f.complete(duplicate, f.value, { deterministic: true });
  assert.equal(f.owner.nativeRuntimeAssessmentHasNativeOwner(f.proof(), a.candidate.resultCandidate), false);
  const altered = await witnessFixture(); altered.input.proof.prefix.prefixDigest = hash('changed source prefix');
  assert.equal(assess(altered).candidate.disposition, 'failure');
});

// The retained full declaration body resolves through evidence gate catalogue
// row owned-proof-declaration under ABI5_EVIDENCE_ROOT.
const ownedDeclaration=evidenceGate('owned-proof-declaration');
// Full retained declaration body; native install/admission/terminal lookup facts
// remain the fixture's explicit lower-owner assumptions. No runtime is opened.
test('material native proof survives Result clone, successor foldback and next consumer without irrelevant owner reconstruction',
  {skip:ownedDeclaration.kind==='absent'&&ownedDeclaration.reason}, async t => {
  const donor=JSON.parse(ownedDeclaration.inputs.declaration.bytes.toString('utf8'));
  // The retained dev286 declaration (16 capabilities, including the retired
  // Consensus capability) is recorded history. Offered as new work it asks the
  // strict question and the current 15-capability register refuses it: by the
  // Catalog owner, by the declaration reconstruction owner and by the native
  // assessment owner. It is never rewritten or reused as a current positive.
  const donorProof=donor.proof.declarations[0];
  const donorStrictAdmission=outcome(()=>admitGraphFunctionCatalog(donorProof.catalog.readinessBasis));
  const donorStrictReconstruction=outcome(()=>reconstructHistoricalDeclarationCatalog(donorProof,donorProof.catalog.readinessBasis));
  let donorAssessment;
  try { const donorFixture=await witnessFixture({declarationProof:donorProof});
    donorAssessment={kind:'returned',value:assess(donorFixture,'donor-new-work').candidate}; }
  catch(error){ donorAssessment={kind:'thrown',name:error?.name,message:String(error?.message??error)}; }
  // Retention never copies the retained declaration: a refused or failed
  // outcome is kept whole, an unexpected success only by its disposition.
  const donorAssessmentRetained=donorAssessment.kind==='returned'&&donorAssessment.value?.disposition==='success'
    ?{kind:'returned',value:{disposition:'success'}}:donorAssessment;
  await retainCandidate('material-native-proof-donor-new-work',{donorProofIdentity:{
    catalogBasisDigest:donorProof.catalog?.basisDigest??null,catalogViewDigest:donorProof.catalogView?.viewDigest??null},
    donorStrictAdmission:donorStrictAdmission.kind==='returned'&&donorStrictAdmission.value?.kind==='graph_function_catalog'
      ?{kind:'returned',value:{kind:'graph_function_catalog',basisDigest:donorStrictAdmission.value.basisDigest}}:donorStrictAdmission,
    donorStrictReconstruction:donorStrictReconstruction.kind==='returned'?{kind:'returned'}:donorStrictReconstruction,
    donorAssessment:donorAssessmentRetained});
  // The current positive: an actual current-register Catalog and CatalogView,
  // built by the installed Product owners of the maintained fixture API over
  // its own verified artifacts, lock, workspace binding and installs. Its
  // declaration proof is the plain JSON carrier the proof schema requires; the
  // real owner reconstructs it under the strict question.
  const current=await setupInstalledRootCatalog(t,packageRoot);
  const declarationProof=plain({kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',
    catalog:current.catalog,catalogView:current.catalogView});
  const currentStrictReconstruction=outcome(()=>reconstructHistoricalDeclarationCatalog(declarationProof,declarationProof.catalog.readinessBasis));
  const begin=performance.now();
  const f=await witnessFixture({declarationProof}),a=assess(f);
  await retainCandidate('material-native-proof-survives-result-clone',{
    currentProofIdentity:{catalogBasisDigest:declarationProof.catalog.basisDigest,catalogViewDigest:declarationProof.catalogView.viewDigest},
    currentStrictReconstruction:currentStrictReconstruction.kind==='returned'?{kind:'returned',
      catalogBasisDigest:currentStrictReconstruction.value.catalog.basisDigest,
      catalogViewDigest:currentStrictReconstruction.value.catalogView.viewDigest}:currentStrictReconstruction,
    candidate:a.candidate,counts:{...f.counts}});
  assert.equal(donorStrictAdmission.kind,'returned',JSON.stringify(donorStrictAdmission).slice(0,4000));
  assert.equal(donorStrictAdmission.value.kind,'catalog_construction_refusal',JSON.stringify(donorStrictAdmission).slice(0,4000));
  assert.equal(donorStrictAdmission.value.disposition,'refused',JSON.stringify(donorStrictAdmission).slice(0,4000));
  assert.equal(donorStrictReconstruction.kind,'thrown',JSON.stringify(donorStrictReconstruction).slice(0,4000));
  assert.equal(donorStrictReconstruction.name,'TypeError',JSON.stringify(donorStrictReconstruction).slice(0,4000));
  assert.ok(donorAssessment.kind==='thrown'||donorAssessment.value.disposition!=='success',JSON.stringify(donorAssessment).slice(0,4000));
  assert.equal(isAbgHistoricalDeclarationProof(declarationProof),true);
  assert.notEqual(declarationProof.catalog.basisDigest,donorProof.catalog.basisDigest,'the current positive is not the retained donor');
  assert.equal(currentStrictReconstruction.kind,'returned',JSON.stringify(currentStrictReconstruction).slice(0,4000));
  assert.equal(currentStrictReconstruction.value.catalog.basisDigest,declarationProof.catalog.basisDigest);
  assert.equal(currentStrictReconstruction.value.catalogView.viewDigest,declarationProof.catalogView.viewDigest);
  assert.equal(a.candidate.disposition,'success',JSON.stringify(a.candidate).slice(0,4000));const value=a.candidate.resultCandidate;
  const initial={...f.counts}; assert.equal(initial.catalog,1);assert.equal(initial.assessment,1);
  f.complete(a.opened,plain(value));
  for(let i=0;i<80;i++)f.event('c_call_opened','c-call://irrelevant/'+i,{callClass:'workflow',programLocusRef:'locus://unrelated'}, {runId:'run://other'});
  const copied=plain(value),before={...f.counts};
  assert(f.semantics.qualificationResultRelation(ids.runtimeAssessPredicate,f.input,copied,f.proof().prefix));
  assert(f.owner.nativeRuntimeAssessmentHasNativeOwner(f.proof(),copied));
  assert.equal(f.counts.catalog,1);assert.equal(f.counts.assessment,1);
  assert.equal(f.counts.terminal,initial.terminal);assert.equal(f.counts.replay,initial.replay);
  const warm={...f.counts};f.cold();
  assert(f.owner.nativeRuntimeAssessmentHasNativeOwner(f.proof(),plain(value)));
  assert(f.counts.catalog>warm.catalog);assert(f.counts.assessment>warm.assessment);
  const cold={...f.counts};
  const competitor=f.open(f.helloIds.graphFunctionRef,f.helloInput,'late-eligible');f.complete(competitor,f.value,{deterministic:true});
  assert.equal(f.owner.nativeRuntimeAssessmentHasNativeOwner(f.proof(),copied),false);
  const changed=plain(value);changed.input.proof.declarations[0].catalog.basisDigest=hash('wrong catalog');
  assert.equal(f.semantics.qualificationResultRelation(ids.runtimeAssessPredicate,f.input,changed,f.proof().prefix),false);
  t.diagnostic(JSON.stringify({inputBytes:Buffer.byteLength(JSON.stringify(f.input)),assessmentBytes:Buffer.byteLength(JSON.stringify(value)),
    initial,warm,cold,final:f.counts,elapsedMs:performance.now()-begin,peakRSS:process.resourceUsage().maxRSS,
    donorStrictRefusal:donorStrictAdmission.value?.code??null,
    premises:'Complete current-register installed Catalog reconstructed by real strict owner once per derivation scope; retained dev286 declaration refused as new work; native lower admission/closure/environment mappings assumed. No installed qualification.'}));
});

test('different installed module URLs retain the invoking proof owner through realization, cloned judgment and owning continuation',async t=>{
 const {privateOwner}=await import('../support/r10-private-owner-harness.mjs');
 const {isolatedCompiledCopy}=await import('../support/isolated-compiled-copy.mjs');
 const copied=isolatedCompiledCopy(t),implementation=await copied.load('implementation/qualification.js');
 const semantics=await copied.load('validator/self_conformance_semantics.js');
 // Normal installed ESM modules share the native realm; separate URLs still
 // own separate private proof maps. Do not introduce the fixture VM realm at
 // the strict ordinary I-JSON boundary.
 const f=await witnessFixture({sameRealm:true}),port=await privateOwner('implementation/leaf_invocation_port.js',['nativeLeafProofOperations','nativeJudgmentProofOperations'],{
  '../abg/qualification_proof.js':f.owner,
  '../abg/event_store.js':{reidentifyHistoricalDurablePrefixCoordinate:(current,historical)=>{
   assert.deepEqual(current,f.proof().prefix);assert.deepEqual(historical,f.coordinate(historical.prefixLength));return historical;}}
 });
 const opened=f.open(ids.runtimeAssessGraph,f.input,'separate-copy');
 const occurrence={...opened.call,executionAuthority:null,qualificationOwnerBasis:opened.basis};
 assert.equal(implementation.realizeNativeRuntimeAssessment(f.input,occurrence).disposition,'failure','unbound copied module retains its real cold authentication');
 const invoke=async(value,occurrence,implementationRef,fn)=>port.invokeLeafOwnerBoundary({
  resolution:{implementationRef,computeRegime:'F_D',inputContractRef:'fixture://input',outputContractRef:'fixture://output'},
  value,inputDigest:hash(value),occurrence,failureValueKind:'self_conformance_failure',verifyAuthority:()=>true,
  validateSuccess:v=>v?.kind==='native_runtime_assessment',resolveWorkerContracts:()=>null,loadImplementation:async()=>fn});
 const receipt=await invoke(f.input,occurrence,ids.runtimeAssessImplementation,implementation.realizeNativeRuntimeAssessment);
 assert.equal(receipt.candidate.disposition,'success',JSON.stringify(receipt));
 const value=receipt.candidate.resultCandidate;assert.equal(value.disposition,'green');
 const operations=port.nativeLeafProofOperations(ids.runtimeAssessImplementation,f.input,occurrence);
 assert.throws(()=>operations.qualificationAssessment(plain(f.input),occurrence),/exact admitted/);
 assert.throws(()=>operations.qualificationAssessment(f.input,{...occurrence}),/exact admitted/);
 f.complete(opened,value);for(let i=0;i<4;i++)f.event('activity_observed','unrelated/'+i,{});
 const prefix=f.proof().prefix,cloned=plain(value),before={...f.counts};
 assert.equal(semantics.qualificationResultRelation(ids.runtimeAssessPredicate,f.input,cloned,prefix),false,'copied consumer does not magically own another module prefix');
 assert(semantics.qualificationResultRelation(ids.runtimeAssessPredicate,f.input,cloned,prefix,
  port.nativeJudgmentProofOperations(ids.runtimeAssessPredicate,f.input,cloned,prefix)));
 assert.equal(f.counts.assessment,before.assessment);assert.equal(f.counts.catalog,before.catalog);
 const duplicate=f.open(f.helloIds.graphFunctionRef,f.helloInput,'late-copy-competitor');f.complete(duplicate,f.value,{deterministic:true});
 assert.equal(f.owner.nativeRuntimeAssessmentHasNativeOwner(f.proof(),cloned),false);
 t.diagnostic(JSON.stringify({distinctModuleRoot:copied.path(''),before,after:f.counts,premises:'Native admission/environment/terminal mappings supplied by existing fixture. Actual invoking leaf boundary, Result clone, separately loaded implementation/semantics and unchanged native proof owner executed; no installed qualification claim.'}));
});
