import assert from 'node:assert/strict';
import test from 'node:test';
import { sameCoordinate, sameJson } from '../../build/code/src/shared/definition_binding_mechanics.js';
import { resolveExactMatch } from '../../build/code/src/product/exact_match.js';
import { hasExactKeys, hasUnicodeNulJoinedKeys } from '../../build/code/src/shared/admission_predicates.js';
import { decodeEventBody } from '../../build/code/src/abg/event_body_encoding.js';

test('D02 shared canonical-text equality conserves values and encoding failures without an identity shortcut', () => {
  assert.equal(sameJson({ z: [-0, 2], a: { x: 'value' } }, { a: { x: 'value' }, z: [0, 2] }), true);
  assert.equal(sameJson({ x: [1, 2] }, { x: [2, 1] }), false);
  assert.equal(sameJson({ x: { value: 1 } }, { x: { value: 2 } }), false);
  assert.equal(sameJson(Array(1), []), true, 'retains the source-supported sparse-array encoding');
  assert.equal(sameJson(Array(2), []), false);
  assert.equal(sameJson(Number.MAX_SAFE_INTEGER + 1, 9007199254740992), true, 'does not introduce I-JSON admission');
  for (const value of [NaN, Infinity, -Infinity, undefined, { x: undefined }, { x: [Infinity] }]) {
    assert.equal(sameJson(value, value), false);
  }
  const cycle = {}; cycle.self = cycle;
  assert.equal(sameJson(cycle, cycle), false);
  const trace = [];
  const left = { get x() { trace.push('left'); throw new Error('encoding failed'); } };
  const right = { get x() { trace.push('right'); return 1; } };
  assert.equal(sameJson(left, right), false);
  assert.deepEqual(trace, ['left'], 'left failure does not acquire the right value');
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

test('D04 fixed JSON key domains retain exact names while E01 keeps its distinct legacy relation', () => {
  for (const keys of [['kind', 'codecVersion', 'event', 'bodyReference'],
    ['sourceEventRef', 'sourcePayloadDigest', 'sourceSlot', 'bodyDigest']]) {
    const valid = JSON.parse(JSON.stringify(Object.fromEntries([...keys].reverse().map(key => [key, null]))));
    assert.equal(hasExactKeys(valid, keys), true);
    for (const key of keys) { const missing = { ...valid }; delete missing[key]; assert.equal(hasExactKeys(missing, keys), false); }
    assert.equal(hasExactKeys({ ...valid, extra: 0 }, keys), false);
  }
  assert.equal(hasUnicodeNulJoinedKeys({ 'a\0b': 0 }, ['a', 'b']), true);
  assert.equal(hasExactKeys({ 'a\0b': 0 }, ['a', 'b']), false);
  for (const record of [
    { kind: 'abg_admitted_body_reference_record', codecVersion: 1, event: {}, bodyReference: {}, extra: 0 },
    { kind: 'abg_admitted_body_reference_record', codecVersion: 2, event: {}, bodyReference: { sourceEventRef: 'event:one' } },
  ]) assert.throws(() => decodeEventBody(JSON.parse(JSON.stringify(record)), new Map()),
    { name: 'TypeError', message: 'durable body reference record is malformed' });
});
