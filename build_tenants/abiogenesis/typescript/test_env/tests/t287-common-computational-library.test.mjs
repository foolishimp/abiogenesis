import assert from 'node:assert/strict';
import test from 'node:test';
import { sameCoordinate, sameJson } from '../../build/code/src/public/binding/definition_binding_mechanics.js';
import { resolveExactMatch } from '../../build/code/src/shared/select/exact_match.js';
import { admitJson, hasExactKeys } from '../../build/code/src/shared/admit/index.js';
import { canonicalEquals } from '../../build/code/src/shared/value/index.js';
import { canonicalJson } from '../../build/code/src/shared/canonical_json.js';
import { decodeEventBody } from '../../build/code/src/abg/event_body_encoding.js';
import { readFile } from 'node:fs/promises';
import { runInNewContext, SourceTextModule, SyntheticModule } from 'node:vm';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { SEMANTIC_REVISION_IDS } from '../../build/code/src/gtl/semantic_revision_identity.js';
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

test('D12: a plain record or array of another realm is admitted by structure; a class instance of that realm is refused', () => {
  const record = runInNewContext('({ a: [1, { b: 2 }] })'), array = runInNewContext('[1, { b: 2 }]');
  assert.notEqual(Object.getPrototypeOf(record), Object.prototype, 'the record is of another realm');
  assert.notEqual(Object.getPrototypeOf(array), Array.prototype, 'the array is of another realm');
  for (const [foreign, twin] of [[record, { a: [1, { b: 2 }] }], [array, [1, { b: 2 }]]]) {
    const admitted = admitJson(foreign);
    assert.equal(admitted.kind, 'ok', JSON.stringify(admitted));
    assert.equal(canonicalEquals(admitted.value, twin), true, 'equal to its same-realm twin');
    assert.equal(sameJson(foreign, twin), true, 'an (A) comparison holds across realms');
  }
  const instance = admitJson(runInNewContext('new (class Point { constructor() { this.x = 1; } })()'));
  assert.equal(instance.kind, 'structural_refusal');
  assert.equal(instance.code, 'non_ijson_value');
  class Points extends Array {}
  assert.equal(admitJson(Points.from([1])).code, 'non_ijson_value', 'a subclass prototype is not an array prototype');
  assert.equal(admitJson(runInNewContext('class Points extends Array {}; Points.from([1])')).code, 'non_ijson_value');
  assert.equal(admitJson(Object.assign(Object.create(null), { a: 1 })).kind, 'ok');
  const trace = [];
  const forged = Object.create(Object.defineProperty(Object.create(null), 'constructor',
    { get() { trace.push('constructor'); return Object; } }));
  assert.equal(admitJson(forged).code, 'non_ijson_value', 'an accessor constructor is not a realm Object.prototype');
  assert.deepEqual(trace, [], 'no getter runs');
  // A prototype counts only when its own constructor's own prototype is that
  // same object; an array prototype also needs a realm Object.prototype above it.
  assert.equal(admitJson(Object.setPrototypeOf([1], [9])).code, 'non_ijson_value', 'an array prototype that is a plain array');
  const synthetic = Object.create(null);
  synthetic.constructor = function Object() {};
  assert.equal(admitJson(Object.setPrototypeOf({ x: 1 }, synthetic)).code, 'non_ijson_value',
    'a null-prototype object with an own constructor named Object');
});

// C-3. admitJson is total: a cycle, nesting past the bound and a throw from an
// inspection read are refused non_ijson_value where they occur; a value it
// admitted before is admitted byte for byte. The bound is 512 containers, the
// root container being 1 (stated at admitJson).
test('C-3: admitJson refuses a cycle, nesting past 512 and a throwing proxy trap at the member, and throws for none', () => {
  const refusal = (path, at, reason) => ({ kind: 'structural_refusal', stage: 'validate', code: 'non_ijson_value', path, evidence: { at, reason } });
  const cycle = 'a container that encloses itself (a cycle) is not I-JSON';
  const record = { a: 1 };record.self = record;
  assert.deepEqual(admitJson(record), refusal(['self'], '.self', cycle));
  const array = [1];array.push(array);
  assert.deepEqual(admitJson(array), refusal(['1'], '[1]', cycle));
  const outer = { inner: { items: [0] } };outer.inner.items.push(outer);
  assert.deepEqual(admitJson(outer), refusal(['inner', 'items', '1'], '.inner.items[1]', cycle));
  const shared = { s: [1] };
  assert.equal(canonicalJson(admitJson({ a: shared, b: shared, c: [shared, shared] }).value),
    '{"a":{"s":[1]},"b":{"s":[1]},"c":[{"s":[1]},{"s":[1]}]}', 'a container shared by two members is not a cycle');
  const nest = (depth, wrap) => { let value = 1; for (let index = 0; index < depth; index += 1) value = wrap(value); return value; };
  const bound = 'containers nested more than 512 deep exceed the admission bound';
  for (const [wrap, segment, at] of [[value => [value], '0', '[0]'], [value => ({ k: value }), 'k', '.k']]) {
    const admitted = admitJson(nest(512, wrap));
    assert.equal(admitted.kind, 'ok', 'nested 512 containers deep is admitted');
    assert.equal(canonicalJson(admitted.value), JSON.stringify(nest(512, wrap)));
    assert.deepEqual(admitJson(nest(513, wrap)), refusal(Array(512).fill(segment), at.repeat(512), bound), 'one past the bound');
  }
  assert.deepEqual(admitJson(JSON.parse('['.repeat(200000) + ']'.repeat(200000))), refusal(Array(512).fill('0'), '[0]'.repeat(512), bound));
  for (const trap of ['ownKeys', 'getOwnPropertyDescriptor', 'getPrototypeOf']) {
    const proxied = new Proxy({ a: 1 }, { [trap]() { throw new TypeError(`${trap} trap`); } });
    assert.deepEqual(admitJson({ member: proxied }), refusal(['member'], '.member', 'inspecting the value threw TypeError'), trap);
    const proxiedArray = new Proxy([1], { [trap]() { throw new RangeError(`${trap} trap`); } });
    assert.deepEqual(admitJson([proxiedArray]), refusal(['0'], '[0]', 'inspecting the value threw RangeError'), trap);
  }
  const { proxy: revoked, revoke } = Proxy.revocable([], {});revoke();
  assert.deepEqual(admitJson({ member: revoked }), refusal(['member'], '.member', 'inspecting the value threw TypeError'), 'Array.isArray of a revoked proxy');
  let reads = 0;
  const thrownProxy = new Proxy({}, { get() { reads++; }, getPrototypeOf() { reads++;return null; }, getOwnPropertyDescriptor() { reads++; } });
  for (const thrown of ['a string', thrownProxy, { message: 'plain' }]) {
    const proxied = new Proxy({}, { ownKeys() { throw thrown; } });
    assert.deepEqual(admitJson({ member: proxied }), refusal(['member'], '.member', 'inspecting the value threw a value that is not a native error'));
  }
  assert.equal(reads, 0, 'the thrown value is not inspected');
  class SubclassError extends RangeError {}
  const subclassed = new Proxy({}, { ownKeys() { throw new SubclassError('subclass'); } });
  assert.deepEqual(admitJson({ member: subclassed }), refusal(['member'], '.member', 'inspecting the value threw RangeError'),
    'a subclass is named by its native ancestor');
  const foreign = new Proxy({}, { ownKeys() { throw runInNewContext('new TypeError("other realm")'); } });
  assert.deepEqual(admitJson({ member: foreign }), refusal(['member'], '.member', 'inspecting the value threw a value that is not a native error'),
    'another realm\'s error is not this realm\'s native error');
  const today = { z: [-0, 1.5, 'é\u{1F600}', null, true, { b: [], a: {} }], a: runInNewContext('({ k: [1, { j: "x" }] })'),
    n: Object.assign(Object.create(null), { y: 2 }), s: 'line\nbreak\u0000' };
  assert.equal(canonicalJson(admitJson(today).value), '{"a":{"k":[1,{"j":"x"}]},"n":{"y":2},"s":"line\\nbreak\\u0000","z":[0,1.5,"é\u{1F600}",null,true,{"a":{},"b":[]}]}',
    'the canonical text admitJson gave this value before C-3');
});

// A built owner linked in a VM with named lower premises replaced; the owner
// function itself is the built code.
async function component(name, overrides) {
  const path = join(import.meta.dirname, '../../build/code/src', name + '.js');
  const module = new SourceTextModule(await readFile(path, 'utf8'), { identifier: path });
  await module.link(async specifier => {
    const actual = await import(specifier.startsWith('.') ? pathToFileURL(resolve(dirname(path), specifier)).href : specifier);
    const values = { ...actual, ...overrides[specifier] };
    return new SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    });
  });
  await module.evaluate();
  return module.namespace;
}

test('D13: a valueless result event beside the matching one is not a candidate; the lookup answers the match', async () => {
  const lifecycle = { stage: 'revision' }, declaration = { ref: 'source' };
  const input = { current: { lifecycle, sourceHandoff: { declaration } } };
  const match = { kind: 'c_call_result_admitted', aggregateId: 'match', payload: { resultClass: 'success', value: input } };
  const valueless = { kind: 'c_call_result_admitted', aggregateId: 'valueless', payload: { resultClass: 'success' } };
  let events = [];
  const revision = await component('abg/semantic_revision', {
    './semantic_stage.js': {
      authenticateOwnedSemanticStageBasis: () => ({ events, prefix: {}, lifecycle, source: declaration }),
      semanticInputAtBasisEquals: () => true,
      projectSemanticPredecessorAtPrefix: (_prefix, _events, _publication, aggregateId) => aggregateId === 'match'
        ? { result: { resultClass: 'success' }, judgment: { judgment: 'advance' }, cCall: { implementationRef: SEMANTIC_REVISION_IDS.projectionImplementationRef } }
        : null,
    },
    '../product/semantic_revision.js': { isSemanticRevisionEnvelope: () => true },
  });
  const basis = { publication: {}, declarationGraphFunctions: [] };
  events = [match];
  assert.equal(revision.semanticRevisionInputMatchesBasis(basis, input), true, 'control: the match alone is the one source');
  events = [valueless, match];
  assert.equal(revision.semanticRevisionInputMatchesBasis(basis, input), true,
    'a c_call_result_admitted event without value is not a candidate; it neither drops the match nor answers false');
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
  // O-KEY duplicate-key decision: an expected list with a repeated key never
  // matches. artifact_truth's retired private body (length and Object.hasOwn)
  // returned true here; no caller's expected list carries a duplicate.
  assert.equal(hasExactKeys({ a: 1, b: 2 }, ['a', 'a']), false);
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
