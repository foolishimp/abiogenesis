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
