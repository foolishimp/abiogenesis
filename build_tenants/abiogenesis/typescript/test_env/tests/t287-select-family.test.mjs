import assert from 'node:assert/strict';
import test from 'node:test';

import {
  checkExactRecord,
  exactMatchCardinality,
  exactMatchOutcome,
  onlyExactMatch,
  resolveExactMatch,
} from '../../build/code/src/shared/select/index.js';
import { ok } from '../../build/code/src/shared/refusal.js';
import { sha256Canonical } from '../../build/code/src/shared/value/index.js';

// Module-derived unit lane for the `select` family (design §4.2, §10.2 D2,
// §10.5 P-SELECT and P-RECORD). Expected values come from the module
// contract: cardinality is the classification of the filter length.

const classify = (length) => (length === 0 ? 'absent' : length === 1 ? 'one' : 'many');
const shared = { ref: 'dup' };
const ROWS = [{ ref: 'a' }, { ref: 'b' }, { ref: 'b' }, shared, shared];
const PREDICATES = [
  (row) => row.ref === 'none',
  (row) => row.ref === 'a',
  (row) => row.ref === 'b',
  (row) => row.ref === 'dup',
];
const view = (rows) => Object.freeze({ filter: (predicate) => rows.filter((row) => predicate(row)) });

test('P-SELECT: cardinality equals the filter-length classification for array and view sources', () => {
  for (const source of [ROWS, view(ROWS)]) {
    for (const predicate of PREDICATES) {
      const selected = ROWS.filter(predicate);
      const match = resolveExactMatch(source, predicate);
      assert.equal(match.kind, classify(selected.length));
      assert.equal(exactMatchCardinality(selected.length), match.kind);
      assert.deepEqual(onlyExactMatch(selected), match);
      assert.ok(Object.isFrozen(match));
      if (match.kind === 'one') assert.equal(match.value, selected[0]);
      if (match.kind === 'many') {
        assert.ok(Object.isFrozen(match.values));
        assert.equal(match.values.length, selected.length);
        selected.forEach((row, index) => assert.equal(match.values[index], row));
      }
    }
  }
});

test('P-SELECT: no deduplication, predicate order kept, a throwing predicate propagates', () => {
  const duplicate = resolveExactMatch(ROWS, (row) => row === shared);
  assert.equal(duplicate.kind, 'many');
  assert.deepEqual(duplicate.values, [shared, shared]);
  for (const source of [ROWS, view(ROWS)]) {
    const seen = [];
    resolveExactMatch(source, (row) => { seen.push(row); return false; });
    assert.deepEqual(seen, ROWS);
    const visited = [];
    assert.throws(() => resolveExactMatch(source, (row) => {
      visited.push(row);
      if (row.ref === 'b') throw new Error('predicate defect');
      return true;
    }), /predicate defect/);
    assert.deepEqual(visited, ROWS.slice(0, 2));
  }
});

test('exactMatchOutcome lifts absent and many to select refusals', () => {
  assert.deepEqual(exactMatchOutcome(onlyExactMatch(['x'])), { kind: 'ok', value: 'x' });
  for (const [selected, code] of [[[], 'absent'], [['x', 'x'], 'many']]) {
    const outcome = exactMatchOutcome(onlyExactMatch(selected));
    assert.deepEqual(outcome, {
      kind: 'structural_refusal', stage: 'select', code, path: [], evidence: { matches: selected.length },
    });
    assert.ok(Object.isFrozen(outcome));
  }
});

const event = (payload) => ({ eventId: 'event://one', payload, payloadDigest: sha256Canonical(payload) });
const PAYLOAD_CHECK = Object.freeze({
  project: (row) => (typeof row.payload === 'object' && row.payload !== null && !Array.isArray(row.payload)
    ? ok(row.payload)
    : { kind: 'structural_refusal', stage: 'validate', code: 'not_record', path: [], evidence: {} }),
  digest: Object.freeze({
    expected: (row) => row.payloadDigest,
    actual: (value) => sha256Canonical(value),
  }),
});
const NULL_DIGEST_CHECK = Object.freeze({ project: (row) => ok(row.payload), digest: null });

test('P-RECORD: absent, many and one', () => {
  assert.deepEqual(checkExactRecord(onlyExactMatch([]), PAYLOAD_CHECK), { kind: 'absent' });
  const rows = [event({ a: 1 }), event({ a: 1 })];
  const many = checkExactRecord(onlyExactMatch(rows), PAYLOAD_CHECK);
  assert.equal(many.kind, 'many');
  assert.equal(many.values[0], rows[0]);
  assert.equal(many.values[1], rows[1]);
  const row = event({ a: 1 });
  const one = checkExactRecord(onlyExactMatch([row]), PAYLOAD_CHECK);
  assert.deepEqual(one, { kind: 'one', event: row, value: { a: 1 } });
  assert.equal(one.event, row);
  assert.ok(Object.isFrozen(one));
  assert.equal(checkExactRecord(onlyExactMatch([row]), NULL_DIGEST_CHECK).kind, 'one');
});

test('P-RECORD: a refused projection and a digest mismatch are invalid', () => {
  const nonRecord = event(['a']);
  assert.deepEqual(checkExactRecord(onlyExactMatch([nonRecord]), PAYLOAD_CHECK),
    { kind: 'invalid', event: nonRecord, reason: 'record_projection' });
  const forged = { ...event({ a: 1 }), payloadDigest: sha256Canonical({ a: 2 }) };
  assert.deepEqual(checkExactRecord(onlyExactMatch([forged]), PAYLOAD_CHECK),
    { kind: 'invalid', event: forged, reason: 'record_digest' });
});

test('P-RECORD: both malformed null-digest partitions are invalid', () => {
  const nonRecordSingleton = { eventId: 'event://scalar', payload: 'scalar' };
  assert.deepEqual(checkExactRecord(onlyExactMatch([nonRecordSingleton]), NULL_DIGEST_CHECK),
    { kind: 'invalid', event: nonRecordSingleton, reason: 'record_projection' });
  for (const payload of [{ a: undefined }, { a: Number.NaN }, { a: 10n }]) {
    const unencodable = { eventId: 'event://unencodable', payload };
    assert.deepEqual(checkExactRecord(onlyExactMatch([unencodable]), NULL_DIGEST_CHECK),
      { kind: 'invalid', event: unencodable, reason: 'record_projection' });
  }
});

test('D2: the digest leg receives the projected value, after projection', () => {
  const calls = [];
  const projected = Object.freeze({ projected: true });
  const check = Object.freeze({
    project: (row) => { calls.push(['project', row]); return ok(projected); },
    digest: Object.freeze({
      expected: (row, value) => { calls.push(['expected', row, value]); return sha256Canonical(value); },
      actual: (value) => { calls.push(['actual', value]); return sha256Canonical(value); },
    }),
  });
  const row = event({ raw: true });
  const checked = checkExactRecord(onlyExactMatch([row]), check);
  assert.equal(checked.kind, 'one');
  assert.equal(checked.value, projected);
  assert.deepEqual(calls.map(([step]) => step), ['project', 'expected', 'actual']);
  assert.equal(calls[1][1], row);
  assert.equal(calls[1][2], projected);
  assert.equal(calls[2][1], projected);
});
