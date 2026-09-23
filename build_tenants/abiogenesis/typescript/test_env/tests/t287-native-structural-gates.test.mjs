// Actual qualification owner composition with explicit lower native-owner
// assumptions in nativeJoinFixture. This is not installed/runtime qualification.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import * as gtl from '../../build/code/src/gtl/index.js';
import { nativeJoinFixture, inputFixture, coverage, ids, hash, publication } from '../support/malformed-gtl-native-fixture.mjs';
import { STRUCTURAL_EXPECTATIONS as expected, selectFlatHelloPublication, selectEdgeHelloPublication } from '../support/native-runtime-structural-cases.mjs';
import { realizeHelloWorld } from '../../build/code/src/implementation/hello_world.js';
import { normalizeHelloInput, renderNormalizedHello, passNormalizedHello } from '../../build/code/src/implementation/hello_compose.js';
import { isNativeRuntimeAssessmentInput, evaluateMalformedGtlAssessment } from '../../build/code/src/validator/qualification.js';
const plain = x => JSON.parse(JSON.stringify(x));
async function fixture(kind, alterPublication = x => x) {
  const edge = kind === 'edge_program', composed = kind !== 'atomic_call';
  const f = await nativeJoinFixture({ runtime: true, configureHello: pub => alterPublication(
    (edge ? selectEdgeHelloPublication : selectFlatHelloPublication)(gtl, pub)) });
  const graphRef = composed ? gtl.COMPOSED_HELLO_IDS.graphFunctionRef : f.helloIds.graphFunctionRef;
  const gf = f.hello.graphFunctions.find(g => g.name === graphRef), node = gf.template.nodes[0];
  const raw = composed ? expected.flatInput : expected.atomicInput;
  // Every expected intermediate and final value is fixed before execution.
  const implementations = edge ? [normalizeHelloInput, passNormalizedHello, renderNormalizedHello]
    : composed ? [normalizeHelloInput, renderNormalizedHello] : [realizeHelloWorld];
  const expectedValues = edge ? [expected.normalized, expected.normalized, expected.output]
    : composed ? [expected.normalized, expected.output] : [expected.output];
  const occurrences = [], results = [], values = [], inputs = [];
  for (const [i, implementation] of implementations.entries()) {
    const input = i === 0 ? raw : values[i - 1];
    const occurrence = f.open(graphRef, raw, 'step-' + i, { termIndex: i, prior: occurrences[0] });
    const value = implementation(input).resultCandidate; assert.deepEqual(value, expectedValues[i]);
    occurrences.push(occurrence); values.push(value); inputs.push(input);
    results.push(f.complete(occurrence, value, { deterministic: true, inputDigest: hash(input) }));
  }
  const first = occurrences[0];
  const bytes = Buffer.from('Mechanical fixture of 4.6 source witness selection; case adequacy remains unassessed.');
  const input = { kind: 'native_runtime_assessment_input', schemaVersion: '5.0.0',
    basis: structuredClone(f.input.basis), coverage, proof: f.proof(), applicability: 'retained_5_0',
    applicabilitySourceRefs: coverage.claims.find(c => c.coverageRef.includes('/conservation/')).requirementRefs,
    predecessorWitness: { ref: 'witness://mechanical/4.6', path: 'fixture/witness.txt', digest: 'sha256:' + createHash('sha256').update(bytes).digest('hex'), byteCount: bytes.length, contentBase64: bytes.toString('base64') },
    cases: [{ caseRef: `case://structural/${kind}`, programRef: first.execution.programRef, invocationAdmissionRef: first.execution.invocationAdmissionRef,
      graphFunction: { ref: graphRef, digest: first.execution.graphFunctionDigest }, structure: { kind, nodeRef: node.nodeRef, termDigest: hash(node.term) },
      steps: occurrences.map((o, i) => ({ slotRef: o.call.programLocusRef, implementationRef: o.call.implementationRef,
        inputDigest: hash(inputs[i]), result: { ref: results[i].resultRef, digest: results[i].resultDigest },
        expectedValueDigest: hash(expectedValues[i]), substituteResultDigest: hash('unequal result digest') })) }] };
  assert(isNativeRuntimeAssessmentInput(input));
  return { ...f, input, occurrences, results, values, raw, gf };
}
function assess(f, suffix = 'assess') {
  const opened = f.open(ids.runtimeAssessGraph, f.input, suffix);
  const candidate = f.implementation.realizeNativeRuntimeAssessment(f.input, { cCallRef: opened.call.cCallRef, qualificationOwnerBasis: opened.basis });
  return { opened, candidate };
}
for (const kind of ['atomic_call', 'flat_composition', 'edge_program']) test(`${kind}: actual assessment owner remains evidence; no duplicate result leaf`, async () => {
  const f = await fixture(kind), a = assess(f);
  assert.equal(a.candidate.disposition, 'success'); const assessment = a.candidate.resultCandidate;
  assert.equal(assessment.disposition, 'green'); assert.equal(assessment.cases[0].steps.length, kind === 'atomic_call' ? 1 : kind === 'edge_program' ? 3 : 2);
  f.complete(a.opened, assessment); assert(f.owner.nativeRuntimeAssessmentHasNativeOwner(f.proof(), assessment));
  assert(f.semantics.qualificationResultRelation(ids.runtimeAssessPredicate, f.input, assessment));
  assert(!publication.graphFunctions.some(g => g.name.includes('native-runtime-result')));

});
for (const kind of ['flat_composition', 'edge_program']) test(`${kind}: finite declaration passes actual raw/Program validation`, async () => {
  const f = await fixture(kind), base = inputFixture(), program = f.hello.programs.find(p => p.starts[0].graphFunctionRef === f.gf.name);
  const input = { ...base.input, cases: [base.input.cases[0], { caseRef: 'case://flat/program', operation: 'program', publication: f.hello, program,
    expected: { boundary: 'program_validation', disposition: 'accepted', diagnostics: [] } }] };
  const outcome = evaluateMalformedGtlAssessment(input, f.occurrences[0].basis);
  assert.deepEqual(plain(outcome.cases.map(c => c.actual)), input.cases.map(c => c.expected));
});
test('same final value does not hide a missing first step, wrong composition or foreign Result', async () => {
  const missing = await fixture('flat_composition'); missing.input.cases[0].steps[0].result = { ref: 'result://missing-first', digest: hash(missing.values[0]) };
  assert.equal(assess(missing).candidate.disposition, 'failure');
  const wrong = await fixture('flat_composition'); wrong.input.cases[0].structure.termDigest = hash(wrong.gf.template.nodes[0].term.terms[1]);
  assert.equal(assess(wrong).candidate.disposition, 'failure');
  const foreign = await fixture('flat_composition');
  const other = foreign.open(foreign.helloIds.graphFunctionRef, expected.atomicInput, 'foreign', { invocationRef: 'invocation://foreign' });
  const r = foreign.complete(other, expected.output, { deterministic: true });
  foreign.input.cases[0].steps[1].result = { ref: r.resultRef, digest: r.resultDigest }; foreign.input.proof = foreign.proof();
  assert.equal(hash(foreign.values[1]), hash(expected.output)); assert.equal(assess(foreign).candidate.disposition, 'failure');
});
test('order, value chain, declared coverage and intermediate expectations remain material', async () => {
  const omitted = await fixture('flat_composition'); omitted.input.cases[0].steps.shift(); assert(!isNativeRuntimeAssessmentInput(omitted.input));
  const wrongKind = await fixture('atomic_call'); wrongKind.input.cases[0].structure.kind = 'edge_program'; assert(!isNativeRuntimeAssessmentInput(wrongKind.input));
  const chain = await fixture('flat_composition'); chain.input.cases[0].steps[1].inputDigest = hash(chain.raw); assert.equal(assess(chain).candidate.disposition, 'failure');
  const order = await fixture('flat_composition');
  const firstJudgment = order.events.find(e => e.kind === 'c_call_judged' && e.aggregateId === order.occurrences[0].call.cCallRef);
  firstJudgment.admissionOrdinal = order.events.length + 1; order.input.proof = order.proof(); assert.equal(assess(order).candidate.disposition, 'failure');
  const red = await fixture('flat_composition'); red.input.cases[0].steps[0].expectedValueDigest = hash('wrong first expected value');
  const a = assess(red); assert.equal(a.candidate.disposition, 'success'); assert.equal(a.candidate.resultCandidate.disposition, 'red');
  assert.equal(a.candidate.resultCandidate.cases[0].steps[1].matched, true); assert.equal(a.candidate.resultCandidate.cases[0].matched, false);
});


test('edge: the same final value cannot replace declared kind, role order or intermediate provenance', async () => {
  const replaceTerm = modify => pub => gtl.modulePublication({ ...pub, graphFunctions: pub.graphFunctions.map(g =>
    g.name !== gtl.COMPOSED_HELLO_IDS.graphFunctionRef ? g : { ...g, template: { ...g.template,
      nodes: [{ ...g.template.nodes[0], term: modify(g.template.nodes[0].term) }] } }) });
  const of = t => gtl.C.of({ ...t, input: gtl.cCarrier(t.inputCarrierRef), output: gtl.cCarrier(t.outputCarrierRef) });
  const wrongKind = await fixture('edge_program', replaceTerm(t => gtl.C.compose(gtl.C.compose(of(t.transform), of(t.evaluate)), of(t.consequence))));
  assert.deepEqual(wrongKind.values.at(-1), expected.output);
  assert.equal(assess(wrongKind).candidate.disposition, 'failure');
  // Deliberately invalid declaration under the fixture's lower-owner premise:
  // the qualification owner must not silently treat the role as cosmetic.
  const wrongRole = await fixture('edge_program', replaceTerm(t => ({ ...t, evaluate: { ...t.evaluate, stageRole: 'transform' } })));
  assert.deepEqual(wrongRole.values.at(-1), expected.output);
  assert.equal(assess(wrongRole).candidate.disposition, 'failure');
  const order = await fixture('edge_program');
  [order.input.cases[0].steps[0], order.input.cases[0].steps[1]] = [order.input.cases[0].steps[1], order.input.cases[0].steps[0]];
  assert.equal(assess(order).candidate.disposition, 'failure');
  const missing = await fixture('edge_program'); missing.input.cases[0].steps[1].result.ref = 'result://missing-evaluation';
  assert.equal(assess(missing).candidate.disposition, 'failure');
  const omitted = await fixture('edge_program'); omitted.input.cases[0].steps.splice(1, 1);
  assert.equal(isNativeRuntimeAssessmentInput(omitted.input), false);
  const chain = await fixture('edge_program'); chain.input.cases[0].steps[1].inputDigest = hash(chain.raw);
  assert.equal(assess(chain).candidate.disposition, 'failure');
  const judged = await fixture('edge_program'); judged.states.get(judged.occurrences[1].call.cCallRef).judgment.judgment = 'blocked';
  judged.input.proof = judged.proof(); assert.equal(assess(judged).candidate.disposition, 'failure');
});
test('edge: foreign source, stale frontier and a later equal-valued competitor refuse; wrong intermediate expectation is red', async () => {
  const foreign = await fixture('edge_program');
  const other = foreign.open(foreign.helloIds.graphFunctionRef, expected.atomicInput, 'foreign-edge-source', { invocationRef: 'invocation://foreign' });
  const r = foreign.complete(other, expected.output, { deterministic: true });
  foreign.input.cases[0].steps[2].result = { ref: r.resultRef, digest: r.resultDigest }; foreign.input.proof = foreign.proof();
  assert.equal(assess(foreign).candidate.disposition, 'failure');
  const stale = await fixture('edge_program'), opened = stale.open(ids.runtimeAssessGraph, stale.input, 'stale-edge');
  stale.event('activity_observed', 'activity://later', {});
  assert.equal(stale.implementation.realizeNativeRuntimeAssessment(stale.input,
    { cCallRef: opened.call.cCallRef, qualificationOwnerBasis: opened.basis }).disposition, 'failure');
  const duplicate = await fixture('edge_program'), a = assess(duplicate); assert.equal(a.candidate.disposition, 'success');
  duplicate.complete(a.opened, a.candidate.resultCandidate);
  const peer = duplicate.open(duplicate.gf.name, duplicate.raw, 'late-edge-evaluation', { termIndex: 1, prior: duplicate.occurrences[0] });
  duplicate.complete(peer, expected.normalized, { deterministic: true, inputDigest: hash(expected.normalized) });
  assert.equal(duplicate.owner.nativeRuntimeAssessmentHasNativeOwner(duplicate.proof(), a.candidate.resultCandidate), false);
  const red = await fixture('edge_program'); red.input.cases[0].steps[1].expectedValueDigest = hash('wrong evaluation expectation');
  const assessed = assess(red); assert.equal(assessed.candidate.resultCandidate.disposition, 'red');
  assert.equal(assessed.candidate.resultCandidate.cases[0].steps[2].matched, true);
});
