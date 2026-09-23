import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '../..');
const historyPath = process.env.ABI5_D16_HISTORY;
const predecessor = process.env.ABI5_D16_PREDECESSOR;
const load = async root => Object.fromEntries(await Promise.all(['abg/event_store', 'abg/event_prefix',
  'abg/runtime_liveness', 'shared/digests'].map(async name => [name.split('/').at(-1),
  await import(pathToFileURL(join(root, 'build/code/src', name + '.js')).href)])));
const count = owner => Object.fromEntries(['Comparisons', 'BodyEncodes', 'BodyBytes'].map(suffix =>
  [suffix, globalThis.p0Work?.[owner + 'Producer' + suffix] ?? 0]));
const delta = (before, after) => Object.fromEntries(Object.keys(after).map(k => [k, after[k] - before[k]]));

test('native producer membership preserves bodies, transactions and clocks with constant indexed comparisons', {
  skip: !historyPath || !predecessor, timeout: 180000,
}, async () => {
  assert.ok(globalThis.p0Work, 'existing owner counters must be loaded');
  const raw = await readFile(historyPath), lines = raw.toString('utf8').trimEnd().split('\n'), history = lines.map(JSON.parse);
  const scratch = await mkdtemp(join(tmpdir(), 'd16-producer-controls-'));
  const modules = [await load(predecessor), await load(root)];
  const report = { scope: 'copied immutable history and direct existing owners; no live continuation or Public qualification',
    historyPath, scratch, measurements: [], controls: [], stagedResults: [] };
  const producers = {
    Frame: history.filter(e => e.kind === 'frame_opened'),
    CCall: history.filter(e => e.kind === 'c_call_fibre_selected' && e.payload.regime !== 'F_P'),
  };
  let serial = 0;
  for (const [variant, m] of modules.entries()) {
    const { event_store: storeOwner, runtime_liveness: live, digests } = m;
    const acquire = async (count, label) => {
      const bytes = Buffer.from(lines.slice(0, count).join('\n') + '\n');
      const path = join(scratch, `${variant}-${++serial}-${label}.jsonl`);
      await writeFile(path, bytes, { flag: 'wx' }); const node = await stat(path);
      const body = { kind: 'event_store_reopen_authority', schemaVersion: '5.0.0', eventLogPath: path,
        device: node.dev, inode: node.ino, eventLogDigest: digests.sha256Bytes(bytes), durableByteLength: bytes.length,
        eventContractDigest: history[count - 1].eventContractDigest };
      const opened = storeOwner.reopenEventStore({ ...body, authorityDigest: digests.sha256Canonical(body) });
      assert.equal(opened.kind, 'reopened_event_store_context');
      return { ...opened, bytes, path };
    };
    const transaction = (fixture, action) => storeOwner.admitRuntimeEventTransactionAtDurablePrefix(fixture.store, fixture.prefix, action);
    const observe = (owner, fixture, event, sample, origin) => owner === 'Frame'
      ? live.observeNativeFrameLiveness(fixture.store, event, sample, origin)
      : live.observeNativeCCallLiveness(fixture.store, event);
    for (const owner of ['Frame', 'CCall']) {
      // Actual accepted producer, separately allocated equivalent body, and a
      // late producer after unrelated native history growth use the same law.
      for (const [label, selected, copied] of [['early', producers[owner][0], false],
        ['early-copy', producers[owner][0], true], ['late', producers[owner].at(-1), false]]) {
        const fixture = await acquire(selected.admissionOrdinal, `${owner}-${label}`);
        try {
          const event = copied ? structuredClone(selected) : fixture.store.readAll().at(-1);
          const sample = owner === 'Frame' ? live.captureNativeFrameBoundary(fixture.store) : undefined;
          const before = count(owner);
          const admitted = transaction(fixture, () => observe(owner, fixture, event, sample, sample));
          const work = delta(before, count(owner));
          assert.equal(work.Comparisons, variant === 0 ? selected.admissionOrdinal : 1);
          assert.equal(work.BodyEncodes, work.Comparisons * 2, 'complete canonical bodies, including identity, are still compared');
          const emitted = fixture.store.readAll().slice(selected.admissionOrdinal);
          assert.equal(emitted.length, owner === 'Frame' ? 1 : 2);
          // The native driver interleaves frame and CCall observations. Compare
          // each owner's payload to its actual native probes, and complete direct
          // owner events across predecessor/successor below.
          for (const probe of emitted) assert.ok(history.some(e => e.kind === probe.kind &&
            e.payloadDigest === probe.payloadDigest && e.payload?.observation?.underlyingEventRef === selected.eventId),
          'zero elapsed probe payload is the actual native observation');
          assert.ok(admitted.successorPrefix);
          assert.throws(() => transaction(fixture, () => observe(owner, fixture, event)), /durable|prefix|current|append/i,
            'stale durable coordinate cannot enter another observation');
          if (owner === 'Frame') {
            assert.throws(() => storeOwner.admitRuntimeEventTransactionAtDurablePrefix(fixture.store, admitted.successorPrefix,
              () => observe(owner, fixture, event, sample, sample)), /first opening sample/);
            live.retainNativeFrameClock(fixture.store, event, sample);
            assert.throws(() => live.retainNativeFrameClock(fixture.store, event, sample), /original opening capability/);
          }
          report.measurements.push({ variant, owner, label, prefixRows: selected.admissionOrdinal,
            prefixBytes: fixture.bytes.length, ...work, emitted: emitted.length, outputDigest: digests.sha256Canonical(emitted) });
        } finally { fixture.store.closeDurableLog(); }
      }

      const selected = producers[owner][0], fixture = await acquire(selected.admissionOrdinal, `${owner}-negative`);
      const stale = await acquire(selected.admissionOrdinal - 1, `${owner}-before-producer`);
      try {
        assert.throws(() => observe(owner, fixture, selected), /active outer transaction/);
        const mutations = [
          ['absent', e => { e.eventId += '/absent'; }],
          ['foreign', e => { e.runId += '/foreign'; }],
          ['same-ID forged body', e => { e.payloadDigest = digests.sha256Canonical('forged'); }],
          ['changed payload', e => { e.payload = { ...e.payload, foreign: true }; }],
          ['changed cause', e => { e.causationEventRefs = []; }],
          ['wrong ordinal', e => { e.admissionOrdinal++; }],
        ];
        for (const [label, mutate] of mutations) {
          const changed = structuredClone(selected); mutate(changed); const before = count(owner);
          assert.throws(() => transaction(fixture, () => observe(owner, fixture, changed)), /admitted.*producer/);
          const work = delta(before, count(owner));
          assert.equal(work.Comparisons, variant === 0 ? selected.admissionOrdinal : label === 'absent' ? 0 : 1);
          assert.deepEqual(await readFile(fixture.path), fixture.bytes, 'refusal has no durable effect');
          report.controls.push({ variant, owner, label, ...work });
        }
        assert.throws(() => transaction(stale, () => observe(owner, stale, selected)), /admitted.*producer/);
        if (owner === 'Frame') {
          const foreign = live.captureNativeFrameBoundary(stale.store);
          assert.throws(() => transaction(fixture, () => observe(owner, fixture, selected, foreign)), /foreign frame clock sample/);
          assert.throws(() => transaction(fixture, () => observe(owner, fixture, selected, { kind: 'native_frame_boundary_sample' })), /foreign frame clock sample/);
          const current = live.captureNativeFrameBoundary(fixture.store), other = live.captureNativeFrameBoundary(fixture.store);
          assert.throws(() => transaction(fixture, () => observe(owner, fixture, selected, current, other)), /first opening sample/);
          transaction(fixture, () => observe(owner, fixture, selected));
          assert.deepEqual(await readFile(fixture.path), fixture.bytes, 'cold acquisition without original frame clock emits no sample');
        }
        const profile = { ...selected, eventContractDigest: digests.sha256Canonical('other profile') };
        transaction(fixture, () => observe(owner, fixture, profile));
        assert.deepEqual(await readFile(fixture.path), fixture.bytes, 'existing profile bypass has no effect');
        const mutated = Buffer.from(fixture.bytes); mutated[0] = 91; await writeFile(fixture.path, mutated);
        try { assert.throws(() => transaction(fixture, () => observe(owner, fixture, selected))); }
        finally { await writeFile(fixture.path, fixture.bytes); }
      } finally { fixture.store.closeDurableLog(); stale.store.closeDurableLog(); }

      // Membership must see an admitted but not-yet-durable producer inside the
      // actual active transaction, and an aborted observation must roll back.
      const staged = await acquire(selected.admissionOrdinal - 1, `${owner}-staged`);
      try {
        const { eventId, admissionOrdinal, payloadDigest, eventContractDigest, ...candidate } = selected;
        const aborted = new Error('controlled rollback');
        assert.throws(() => transaction(staged, () => {
          const sample = owner === 'Frame' ? live.captureNativeFrameBoundary(staged.store) : undefined;
          const producer = storeOwner.admitRuntimeEvent(staged.store, candidate);
          assert.deepEqual(producer, selected);
          observe(owner, staged, producer, sample, sample);
          throw aborted;
        }), e => e === aborted);
        assert.deepEqual(await readFile(staged.path), staged.bytes);
        assert.equal(staged.store.readAll().length, selected.admissionOrdinal - 1);
        const admitted = transaction(staged, () => {
          const sample = owner === 'Frame' ? live.captureNativeFrameBoundary(staged.store) : undefined;
          const producer = storeOwner.admitRuntimeEvent(staged.store, candidate);
          observe(owner, staged, structuredClone(producer), sample, sample);
          return producer;
        });
        assert.ok(admitted.successorPrefix);
        const result = staged.store.readAll().slice(selected.admissionOrdinal - 1);
        assert.deepEqual(result[0], selected);
        assert.equal(result.length, owner === 'Frame' ? 2 : 3);
        report.stagedResults.push({ variant, owner, rows: result.length, digest: digests.sha256Canonical(result) });
      } finally { staged.store.closeDurableLog(); }
    }
  }
  for (const owner of ['Frame', 'CCall']) for (const label of ['early', 'early-copy', 'late'])
    assert.equal(report.measurements.find(x => x.variant === 0 && x.owner === owner && x.label === label).outputDigest,
      report.measurements.find(x => x.variant === 1 && x.owner === owner && x.label === label).outputDigest,
      'complete direct-owner output bodies remain identical');
  for (const owner of ['Frame', 'CCall']) assert.equal(report.stagedResults.find(x => x.variant === 0 && x.owner === owner).digest,
    report.stagedResults.find(x => x.variant === 1 && x.owner === owner).digest);
  assert.deepEqual(await readFile(historyPath), raw, 'original retained history remains byte-exact');
  await writeFile(join(scratch, 'proof.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
});
