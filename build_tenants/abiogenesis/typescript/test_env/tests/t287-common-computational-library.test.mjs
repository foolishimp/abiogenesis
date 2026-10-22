import assert from 'node:assert/strict';
import test from 'node:test';
import { sameCoordinate, sameJson } from '../../build/code/src/public/binding/definition_binding_mechanics.js';
import { resolveExactMatch } from '../../build/code/src/shared/select/exact_match.js';
import { admitJson, hasExactKeys } from '../../build/code/src/shared/admit/index.js';
import { canonicalEquals } from '../../build/code/src/shared/value/index.js';
import { decodeEventBody } from '../../build/code/src/abg/event_body_encoding.js';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as product from '../../build/code/src/product/index.js';
import { inspectProductLeafSemanticsProjection, productSemanticsFromModules } from '../../build/code/src/product/semantics.js';
import { witnessInput } from '../support/default-library.mjs';

test('D02 canonical equality is canonical text over JsonValue; unknown values are admitted first', () => {
  assert.equal(canonicalEquals({ z: [-0, 2], a: { x: 'value' } }, { a: { x: 'value' }, z: [0, 2] }), true);
  assert.equal(canonicalEquals({ x: [1, 2] }, { x: [2, 1] }), false);
  assert.equal(canonicalEquals({ x: { value: 1 } }, { x: { value: 2 } }), false);
  for (const value of [NaN, Infinity, -Infinity, { x: [Infinity] }]) {
    assert.throws(() => canonicalEquals(value, value), TypeError, 'encoding failure propagates; no identity shortcut');
  }
  for (const value of [NaN, Infinity, -Infinity, undefined, { x: undefined }, { x: [Infinity] }, Array(1),
    Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(admitJson(value).kind, 'structural_refusal', 'a non-I-JSON value is refused before comparison');
  }
  const trace = [];
  const left = { get x() { trace.push('left'); throw new Error('encoding failed'); } };
  assert.equal(admitJson(left).kind, 'structural_refusal');
  assert.deepEqual(trace, [], 'admission refuses an accessor member without reading it');
});

test('D02 coordinate equality retains both strict coordinates and property faults', () => {
  const original = { ref: 'coordinate:one', digest: 'sha256:' + '1'.repeat(64) };
  assert.equal(sameCoordinate(original, { ...original }), true);
  assert.equal(sameCoordinate(original, { ...original, ref: 'coordinate:two' }), false);
  assert.equal(sameCoordinate(original, { ...original, digest: 'sha256:' + '2'.repeat(64) }), false);
  const failure = new Error('coordinate access');
  assert.throws(() => sameCoordinate({ get ref() { throw failure; } }, original), error => error === failure);
});

test('D03 finite selection preserves duplicate occurrences, identities, total scan and thrown predicates', () => {
  const first = { key: 'one' }, equal = { key: 'one' }, other = { key: 'other' };
  assert.deepEqual(resolveExactMatch([], () => true), { kind: 'absent' });
  assert.deepEqual(resolveExactMatch([other], value => value.key === 'one'), { kind: 'absent' });
  const one = resolveExactMatch([other, first], value => value.key === 'one');
  assert.equal(one.kind, 'one'); assert.strictEqual(one.value, first);
  for (const values of [[first, first], [first, equal]]) {
    const trace = [], selected = resolveExactMatch([other, ...values], value => { trace.push(value); return value.key === 'one'; });
    assert.equal(selected.kind, 'many'); assert.deepEqual(trace, [other, ...values]);
    assert.equal(selected.values.length, 2);
    selected.values.forEach((value, index) => assert.strictEqual(value, values[index]));
    assert.ok(Object.isFrozen(selected)); assert.ok(Object.isFrozen(selected.values));
    assert.equal(Object.isFrozen(first), false, 'candidate values are not captured or frozen');
  }
  const failure = new Error('predicate failure'), trace = [];
  assert.throws(() => resolveExactMatch([first, equal, other], value => {
    trace.push(value); if (value === equal) throw failure; return true;
  }), error => error === failure);
  assert.deepEqual(trace, [first, equal]);
});

test('D04 fixed JSON key domains retain exact names; a NUL-containing key never matches split keys', () => {
  for (const keys of [['kind', 'codecVersion', 'event', 'bodyReference'],
    ['sourceEventRef', 'sourcePayloadDigest', 'sourceSlot', 'bodyDigest']]) {
    const valid = JSON.parse(JSON.stringify(Object.fromEntries([...keys].reverse().map(key => [key, null]))));
    assert.equal(hasExactKeys(valid, keys), true);
    for (const key of keys) { const missing = { ...valid }; delete missing[key]; assert.equal(hasExactKeys(missing, keys), false); }
    assert.equal(hasExactKeys({ ...valid, extra: 0 }, keys), false);
  }
  // P-KEYS counterexample: the retired NUL-joined bodies returned true here.
  assert.equal(hasExactKeys({ 'a\0b': 0 }, ['a', 'b']), false);
  assert.equal(hasExactKeys({ a: 0, b: 0 }, ['a\0b']), false);
  for (const record of [
    { kind: 'abg_admitted_body_reference_record', codecVersion: 1, event: {}, bodyReference: {}, extra: 0 },
    { kind: 'abg_admitted_body_reference_record', codecVersion: 2, event: {}, bodyReference: { sourceEventRef: 'event:one' } },
  ]) assert.throws(() => decodeEventBody(JSON.parse(JSON.stringify(record)), new Map()),
    { name: 'TypeError', message: 'durable body reference record is malformed' });
});

// O-SCHEMA at the raw owner boundary (D10). The default-library provider is
// loaded through its owner from a supplied module record; no install is read.
test('O-SCHEMA: the Product boundary admits input and contract values to I-JSON before the provider guard', async () => {
  const provider = product.ABI5_DEFAULT_LIBRARY_PRODUCT_SEMANTICS;
  const install = { installId: 'install://t287/o-schema', packageName: provider.packageName, packageVersion: provider.packageVersion,
    productContentDigest: 'sha256:' + '1'.repeat(64), manifestDigest: 'sha256:' + '2'.repeat(64) };
  const binding = { kind: 'product_semantics_binding', bindingRef: provider.bindingRef, packageName: provider.packageName,
    packageVersion: provider.packageVersion, modulePath: 'build/index.mjs', namedSymbol: 'SEMANTICS' };
  const loaded = await productSemanticsFromModules({ install, verifyInstallAdmission: () => true,
    publicationDigest: 'sha256:' + '3'.repeat(64), productSemanticsBinding: binding },
  { kind: 'installed_product_module_loading', install, load: async () => ({ kind: 'loaded', module: { SEMANTICS: provider } }) });
  const leaf = inspectProductLeafSemanticsProjection(product.projectInstalledLeafSemantics(loaded)).runtime;
  const witnessRoot = new URL('../../../../../.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/default-library-witness/', import.meta.url).pathname;
  const selection = JSON.parse(await readFile(join(witnessRoot, 'selection.json'), 'utf8'));
  const parsed = JSON.parse(JSON.stringify(await witnessInput({ product, selection, seedRoot: join(witnessRoot, 'seed') })));
  const contractRef = product.governanceContract('state');
  const admitted = product.admitInstalledProductInput(loaded, contractRef, parsed);
  assert.deepEqual(admitted, parsed, 'the complete state as parsed JSON is admitted');
  assert.notStrictEqual(admitted, parsed, 'the provider receives the detached admitted value');
  assert.ok(Object.isFrozen(admitted));
  assert.equal(leaf.validateContractValue('governance_work_state', parsed), true);
  // The reviewer's probe: a function member inside original.testing.commands.
  const hidden = structuredClone(parsed);
  hidden.original.testing.commands.push({ hidden: () => 7 });
  assert.equal(provider.validateContractValue('governance_work_state', hidden), true, 'the shallow provider guard alone accepts it');
  assert.equal(product.admitInstalledProductInput(loaded, contractRef, hidden), null, 'admitInput refuses through its null channel');
  assert.equal(leaf.validateContractValue('governance_work_state', hidden), false, 'validateContractValue refuses');
  // Post-close repair C: an unsafe integer is not I-JSON; the leaf refuses it before the Product's guard.
  const unsafe = structuredClone(parsed);
  unsafe.original.testing.commands.push({ count: Number.MAX_SAFE_INTEGER + 1 });
  assert.equal(provider.validateContractValue('governance_work_state', unsafe), true, 'the shallow provider guard alone accepts it');
  assert.equal(leaf.validateContractValue('governance_work_state', unsafe), false, 'validateContractValue refuses an unsafe integer');
});

test('O-TYPE: sameJson admits both sides; a function member or a cycle is never equal', () => {
  const member = () => 7;
  assert.equal(sameJson({ a: 1, b: [2] }, { b: [2], a: 1 }), true, 'positive control: canonical equality of I-JSON values');
  assert.equal(sameJson({ a: 1, f: member }, { a: 1, f: member }), false, 'a function member is refused, not encoded as {}');
  assert.equal(sameJson({ a: 1, f: member }, { a: 1, f: {} }), false);
  const cycle = { a: 1 };
  cycle.self = cycle;
  assert.doesNotThrow(() => sameJson(cycle, cycle));
  assert.equal(sameJson(cycle, cycle), false, 'a cycle is refused, with no identity shortcut');
});

test('O-SCHEMA: the Product boundary admits an interaction response candidate to I-JSON before the provider evaluates it', async () => {
  const seen = [];
  const provider = Object.freeze({ ...product.ABI5_DEFAULT_LIBRARY_PRODUCT_SEMANTICS,
    evaluateInteractionResponse(_basis, candidate) { seen.push(candidate); return candidate; } });
  const install = { installId: 'install://t287/o-schema-response', packageName: provider.packageName, packageVersion: provider.packageVersion,
    productContentDigest: 'sha256:' + '4'.repeat(64), manifestDigest: 'sha256:' + '5'.repeat(64) };
  const binding = { kind: 'product_semantics_binding', bindingRef: provider.bindingRef, packageName: provider.packageName,
    packageVersion: provider.packageVersion, modulePath: 'build/index.mjs', namedSymbol: 'SEMANTICS' };
  const loaded = await productSemanticsFromModules({ install, verifyInstallAdmission: () => true,
    publicationDigest: 'sha256:' + '6'.repeat(64), productSemanticsBinding: binding },
  { kind: 'installed_product_module_loading', install, load: async () => ({ kind: 'loaded', module: { SEMANTICS: provider } }) });
  const basis = { requestContractRef: 'contract://t287/request', responseContractRef: 'contract://t287/response',
    requestValue: {}, actingActorRef: 'actor://t287/human', constructionIntent: null, nextActionBasis: null };
  const parsed = JSON.parse('{"decision":"accept","notes":["a",{"n":1}]}');
  const answered = product.evaluateInstalledInteractionResponse(loaded, basis, parsed);
  assert.equal(seen.length, 1);
  assert.notStrictEqual(seen[0], parsed, 'the provider receives the detached admitted value');
  assert.ok(Object.isFrozen(seen[0]) && Object.isFrozen(seen[0].notes[1]));
  assert.deepEqual(answered, parsed);
  const hidden = { decision: 'accept', notes: ['a', { hidden: () => 7 }] };
  assert.equal(product.evaluateInstalledInteractionResponse(loaded, basis, hidden), null, 'a refused candidate takes the null channel');
  assert.equal(seen.length, 1, 'a refused candidate never reaches the provider');
});
