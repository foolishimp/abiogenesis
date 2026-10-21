import assert from 'node:assert/strict';
import test from 'node:test';

import {
  canonicalEquals,
  canonicalJson,
  canonicalRecordDigest,
  sha256Canonical,
  writeCanonicalJson,
  writeCanonicalRecord,
} from '../../build/code/src/shared/value/index.js';
import { admitJson } from '../../build/code/src/shared/admit/index.js';
import {
  admitNonEmptyRuntimeEventTransactionAtDurablePrefix,
  admitRuntimeEvent,
  createNewEmptyAppendSink,
  durableRuntimeEventPrefixThroughEvent,
  readRuntimeEventsAtDurablePrefix,
  validateDurablePrefixCoordinate,
} from '../../build/code/src/abg/event_store.js';
import {
  runtimeEventBodiesAtPrefix,
  selectRuntimeEventPrefixFromStore,
  validatedRuntimeEventPrefixThroughEvent,
} from '../../build/code/src/abg/event_prefix.js';
import { acquireNewEmptyAppendSinkFixture } from '../support/new-empty-append-sink.mjs';

// Module-derived unit lane for the `derive` value family (design §4.3, §6,
// §10.5 P-EQUAL). Expected values come from the module contract: equality is
// equality of canonical text, so it agrees with `sha256Canonical` equality.

const PAIRS = [
  [0, -0],
  [{ z: [-0, 2], a: { x: 'value' } }, { a: { x: 'value' }, z: [0, 2] }],
  [{ b: 1, a: 2 }, { a: 2, b: 1 }],
  [{ x: [1, 2] }, { x: [2, 1] }],
  [{ x: { value: 1 } }, { x: { value: 2 } }],
  [{}, []],
  [[], [[]]],
  [{}, { a: {} }],
  ['a', 'ab'],
  ['1', 1],
  [null, false],
  [{ 'é': 1, 'é': 2 }, { 'é': 2, 'é': 1 }],
  [{ '😀': 1, '￿': 2 }, { '￿': 2, '😀': 1 }],
  [{ '😀': 1 }, { '😀': 1 }],
  [{ a: 'x' }, { a: 'x', b: null }],
  [['a\0b'], ['a', 'b']],
  [[''], []],
];

// A seeded generated corpus of JsonValues with -0, out-of-order nested keys
// and empty containers (P-EQUAL).
function generatedCorpus(seed, count) {
  let state = seed >>> 0;
  const next = () => (state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 2 ** 32;
  const keys = ['a', 'b', 'é', 'z', '😀', '￿', ''];
  const leaf = () => [null, true, false, 0, -0, 1, 1.5, -2, 'x', '', 'é', '😀'][Math.floor(next() * 12)];
  const value = (depth) => {
    const roll = next();
    if (depth === 0 || roll < 0.4) return leaf();
    if (roll < 0.7) return Array.from({ length: Math.floor(next() * 3) }, () => value(depth - 1));
    const entries = Array.from({ length: Math.floor(next() * 4) },
      () => [keys[Math.floor(next() * keys.length)], value(depth - 1)]);
    return Object.fromEntries(next() < 0.5 ? entries : entries.reverse());
  };
  return Array.from({ length: count }, () => value(3));
}

test('P-EQUAL canonicalEquals is equality of canonical text and agrees with sha256Canonical equality', () => {
  const corpus = generatedCorpus(287, 120);
  const pairs = [...PAIRS];
  for (let index = 0; index + 1 < corpus.length; index += 2) {
    pairs.push([corpus[index], corpus[index + 1]]);
    pairs.push([corpus[index], JSON.parse(JSON.stringify(corpus[index]))]);
  }
  let equalCount = 0;
  for (const [left, right] of pairs) {
    const expected = canonicalJson(left) === canonicalJson(right);
    assert.equal(canonicalEquals(left, right), expected, JSON.stringify([left, right]));
    assert.equal(canonicalEquals(right, left), expected);
    assert.equal(sha256Canonical(left) === sha256Canonical(right), expected);
    if (expected) equalCount += 1;
  }
  assert.ok(equalCount > 60 && equalCount < pairs.length, 'the corpus holds both equal and unequal pairs');
  assert.equal(canonicalEquals(0, -0), true);
  assert.equal(canonicalEquals({ b: 1, a: 2 }, { a: 2, b: 1 }), true);
  assert.equal(canonicalEquals({ '😀': 1, '￿': 2 }, { '￿': 2, '😀': 1 }), true);
  assert.equal(canonicalEquals(['a\0b'], ['a', 'b']), false, 'no NUL-joined collision');
  assert.equal(canonicalEquals([''], []), false, 'no empty-join collision');
});

test('canonicalEquals writes both sides in full: an encoding failure on either side propagates', () => {
  for (const [left, right] of [[NaN, 1], [1, NaN], [{ a: 1 }, { a: Infinity }], [{ a: 1, b: 2 }, { a: 2, b: Infinity }]]) {
    assert.throws(() => canonicalEquals(left, right), TypeError);
  }
  assert.throws(() => canonicalEquals(NaN, NaN), TypeError, 'no identity shortcut');
});

test('canonicalRecordDigest and writeCanonicalRecord are the canonical record encoding', () => {
  for (const value of [{}, { b: [1, { d: -0, c: null }], a: 'é' }, { '😀': 1, '￿': 2, '': true }]) {
    assert.equal(canonicalRecordDigest(value), sha256Canonical(value));
    const parts = [];
    writeCanonicalRecord(Object.entries(value), (member, _key, sink) => writeCanonicalJson(member, sink),
      (part) => { parts.push(part); });
    assert.equal(parts.join(''), canonicalJson(value));
  }
  const keysSeen = [];
  const parts = [];
  writeCanonicalRecord([['b', 2], ['a', 1]], (member, key, sink) => { keysSeen.push(key); sink(String(member)); },
    (part) => { parts.push(part); });
  assert.deepEqual(keysSeen, ['a', 'b']);
  assert.equal(parts.join(''), '{"a":1,"b":2}');
  const partial = [];
  const failure = new Error('sink failed');
  assert.throws(() => writeCanonicalRecord([['a', 1], ['b', 2]], (member, _key, sink) => {
    if (member === 2) throw failure;
    sink(String(member));
  }, (part) => { partial.push(part); }), (error) => error === failure);
  assert.equal(partial.join(''), '{"a":1,"b":', 'a member-writer failure propagates after partial output');
});

function workspaceEvent(index, causationEventRefs) {
  const invocationRef = `invocation://t287/value-equality/${index}`;
  const correlationId = `correlation://t287/value-equality/${index}`;
  return {
    kind: 'public_operation_admitted',
    eventTime: '2026-10-22T00:00:00.000Z',
    aggregateType: 'workspace',
    aggregateId: invocationRef,
    parentAggregateId: null,
    causationEventRefs,
    correlationId,
    workflowVersion: '5.0.0',
    scopeClass: 'workspace',
    basisId: 'basis://abiogenesis/t287/value-equality',
    payload: {
      invocationDigest: sha256Canonical({ invocationRef, correlationId }),
      invocationRef,
      operationId: 'abg.operation.project.read',
      variant: 'status',
    },
  };
}

// The C2 currentness sequence of `exactC2SourceEnvironment` over one recorded
// prefix: cut the validated prefix and the durable prefix through one event,
// materialize the body view, admit both sides, compare.
function c2SourceCurrent(store, durablePrefix, eventId, view) {
  const sourcePrefix = validatedRuntimeEventPrefixThroughEvent(selectRuntimeEventPrefixFromStore(store), eventId);
  const sourceEvents = view ?? runtimeEventBodiesAtPrefix(sourcePrefix).materialize();
  const sourceDurablePrefix = durableRuntimeEventPrefixThroughEvent(durablePrefix, eventId);
  if (!validateDurablePrefixCoordinate(sourceDurablePrefix)) return { current: false, stage: 'coordinate' };
  const durableEvents = admitJson(readRuntimeEventsAtDurablePrefix(sourceDurablePrefix));
  const viewEvents = admitJson(sourceEvents);
  if (durableEvents.kind !== 'ok') return { current: false, stage: 'admit_durable', refusal: durableEvents };
  if (viewEvents.kind !== 'ok') return { current: false, stage: 'admit_view', refusal: viewEvents };
  return { current: canonicalEquals(durableEvents.value, viewEvents.value), stage: 'compared',
    durable: durableEvents.value, view: viewEvents.value };
}

test('P-EQUAL C2 positive and negative over one recorded prefix', async (context) => {
  const acquired = await acquireNewEmptyAppendSinkFixture(context, createNewEmptyAppendSink, 'abi5-value-equality-');
  const { store } = acquired;
  let durablePrefix = acquired.prefix;
  const eventIds = [];
  for (let index = 0; index < 3; index += 1) {
    const admitted = admitNonEmptyRuntimeEventTransactionAtDurablePrefix(store, durablePrefix,
      () => admitRuntimeEvent(store, workspaceEvent(index, eventIds.slice(-1))));
    eventIds.push(admitted.value.eventId);
    durablePrefix = admitted.successorPrefix;
  }
  const throughSecond = eventIds[1];
  const prefix = validatedRuntimeEventPrefixThroughEvent(selectRuntimeEventPrefixFromStore(store), throughSecond);
  const first = runtimeEventBodiesAtPrefix(prefix).materialize();
  const second = runtimeEventBodiesAtPrefix(prefix).materialize();
  assert.equal(first.length, 2);

  // Positive: two materialized sequences from one recorded prefix each equal
  // the durable read, and the C2 reuse branch proceeds.
  for (const view of [first, second]) {
    const result = c2SourceCurrent(store, durablePrefix, throughSecond, view);
    assert.equal(result.stage, 'compared');
    assert.equal(result.current, true);
    assert.equal(result.durable.length, 2);
  }
  assert.equal(c2SourceCurrent(store, durablePrefix, throughSecond).current, true);
  const admittedFirst = admitJson(first), admittedSecond = admitJson(second);
  assert.equal(admittedFirst.kind, 'ok');
  assert.equal(canonicalEquals(admittedFirst.value, admittedSecond.value), true);

  // The comparison is not vacuous: a view through another event differs.
  const longer = runtimeEventBodiesAtPrefix(
    validatedRuntimeEventPrefixThroughEvent(selectRuntimeEventPrefixFromStore(store), eventIds[2])).materialize();
  const differing = c2SourceCurrent(store, durablePrefix, throughSecond, longer);
  assert.equal(differing.stage, 'compared');
  assert.equal(differing.current, false);

  // Negative: the unmaterialized view has a custom prototype; admitJson
  // refuses it before any comparison, so the source is not current.
  const lazy = runtimeEventBodiesAtPrefix(prefix);
  assert.notEqual(Object.getPrototypeOf(lazy), Object.prototype);
  const refusal = admitJson(lazy);
  assert.equal(refusal.kind, 'structural_refusal');
  assert.equal(refusal.code, 'non_ijson_value');
  const refused = c2SourceCurrent(store, durablePrefix, throughSecond, lazy);
  assert.equal(refused.current, false);
  assert.equal(refused.stage, 'admit_view');
});
