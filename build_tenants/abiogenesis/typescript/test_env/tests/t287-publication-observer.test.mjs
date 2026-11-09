import assert from 'node:assert/strict';
import test from 'node:test';
import { Effect } from 'effect';
import { observeOwnerCall, observePublication } from '../support/t287-publication-observer.mjs';

// Model-free controls for the test-owned publication observer. A controlled
// host supplies one explicit monotonic domain and Effect suspension with
// cancellation; it controls no Node I/O. Real-host cases use real timers.

function controlledHost() {
  let now = 0, next = 0;
  const timers = new Map(), arms = [];
  const host = {
    now: () => now,
    sleep: ms => Effect.async(resume => {
      const id = ++next; timers.set(id, { due: now + ms, resume }); arms.push(ms);
      return Effect.sync(() => { timers.delete(id); });
    }),
  };
  const set = at => { now = at; };
  const fire = at => {
    now = at;
    for (const [id, row] of [...timers].sort((a, b) => a[1].due - b[1].due)) if (row.due <= at) { timers.delete(id); row.resume(Effect.void); }
  };
  return { host, timers, arms, set, fire };
}
function deferred() { let resolve, reject; const promise = new Promise((ok, no) => { resolve = ok; reject = no; }); return { promise, resolve, reject }; }
const turn = async () => { for (let i = 0; i < 12; i++) await new Promise(resolveTurn => setImmediate(resolveTurn)); };
const timeouts = () => process.getActiveResourcesInfo().filter(name => name === 'Timeout').length;
const frozenDeep = value => value === null || typeof value !== 'object' || Object.isFrozen(value) && Object.values(value).every(frozenDeep);

test('observer: stop during a pending read seals once, starts no next probe and ignores the late resolution', async () => {
  const c = controlledHost(), first = deferred(), calls = [];
  const observation = observePublication(0, 10, {
    first: () => { calls.push('first'); return first.promise; },
    next: () => { calls.push('next'); return Promise.resolve('next-value'); },
  }, { host: c.host });
  await turn(); assert.deepEqual(calls, ['first']);
  const snapshot = await observation.stop();
  assert.deepEqual(snapshot, { end: 'owner_returned', sealedAtMs: 0, setupMs: 10, observed: {}, unobserved: ['first', 'next'],
    errors: {}, attempts: { first: 1, next: 0 }, inFlight: 'first' });
  assert.equal(frozenDeep(snapshot), true);
  const copy = structuredClone(snapshot);
  c.set(1); first.resolve('first-value'); await turn(); c.fire(100); await turn();
  assert.deepEqual(calls, ['first'], 'no probe after the seal');
  assert.deepEqual(snapshot, copy, 'late resolution never mutates the sealed snapshot');
  assert.equal(await observation.sealed, snapshot); assert.equal(await observation.stop(), snapshot, 'stop is idempotent');
  assert.equal(observation.fibersDone(), true); assert.equal(c.timers.size, 0, 'no owned wait remains');
});

test('observer: cutoff 10 seals at the deadline while a read is pending; its resolution at 11 is not credited', async () => {
  const c = controlledHost(), read = deferred(); let calls = 0;
  const observation = observePublication(0, 10, { one: () => { calls++; return read.promise; } }, { host: c.host });
  await turn(); assert.deepEqual(c.arms, [10], 'one deadline wait at the original cutoff');
  c.fire(10); await turn();
  const snapshot = await observation.sealed;
  assert.deepEqual([snapshot.end, snapshot.sealedAtMs, snapshot.inFlight, snapshot.observed], ['setup_deadline', 10, 'one', {}]);
  c.set(11); read.resolve('value'); await turn();
  assert.deepEqual(snapshot.observed, {}); assert.equal(calls, 1);
  assert.equal(await observation.stop(), snapshot, 'owner return after the deadline keeps the deadline snapshot');
  assert.equal(observation.fibersDone(), true); assert.equal(c.timers.size, 0);
});

test('observer: a read settling at 11 or exactly 10 before any deadline wakeup is rejected by its own settlement check', async () => {
  for (const at of [11, 10]) {
    const c = controlledHost(), read = deferred(); let calls = 0;
    const observation = observePublication(0, 10, { one: () => { calls++; return read.promise; } }, { host: c.host });
    await turn(); c.set(at); read.resolve('value'); await turn();
    const snapshot = await observation.sealed;
    assert.deepEqual([snapshot.end, snapshot.observed, snapshot.unobserved, calls], ['setup_deadline', {}, ['one'], 1], `settled at ${at}`);
    assert.equal(await observation.stop(), snapshot); assert.equal(observation.fibersDone(), true); assert.equal(c.timers.size, 0);
  }
  const c = controlledHost(), read = deferred();
  const observation = observePublication(0, 10, { one: () => read.promise }, { host: c.host });
  await turn(); c.set(9.999); read.resolve('value'); await turn();
  const snapshot = await observation.sealed;
  assert.deepEqual([snapshot.end, snapshot.observed], ['complete', { one: { atMs: 9.999, value: 'value' } }], 'strictly before the cutoff is credited');
  await observation.stop(); assert.equal(c.timers.size, 0);
});

test('observer: read errors and null are retained as not observed; polling continues until a timely value completes', async () => {
  const c = controlledHost(); let calls = 0;
  const denied = Object.assign(new Error('denied'), { code: 'EACCES' });
  const observation = observePublication(0, 100, {
    file: () => { calls++; return calls === 1 ? Promise.reject(denied) : calls === 2 ? Promise.resolve(null) : Promise.resolve({ pid: 7 }); },
    sync: () => { throw new TypeError('synchronous probe failure'); },
  }, { host: c.host });
  await turn(); c.fire(10); await turn(); c.fire(20); await turn();
  const snapshot = await observation.stop();
  assert.equal(snapshot.end, 'owner_returned');
  assert.deepEqual(snapshot.observed, { file: { atMs: 20, value: { pid: 7 } } });
  assert.deepEqual(snapshot.errors.file, { atMs: 0, name: 'Error', code: 'EACCES', message: 'denied' });
  assert.deepEqual(snapshot.errors.sync, { atMs: 20, name: 'TypeError', code: null, message: 'synchronous probe failure' });
  assert.deepEqual(snapshot.attempts, { file: 3, sync: 3 }); assert.deepEqual(snapshot.unobserved, ['sync']);
  assert.equal(observation.fibersDone(), true); assert.equal(c.timers.size, 0);
});

test('observer: timely completion seals complete without stop; later owner return keeps that snapshot', async () => {
  const c = controlledHost(); c.set(3);
  const observation = observePublication(0, 10, { a: () => Promise.resolve('A'), b: () => Promise.resolve('B') }, { host: c.host });
  const snapshot = await observation.sealed;
  assert.deepEqual([snapshot.end, snapshot.observed, snapshot.attempts], ['complete',
    { a: { atMs: 3, value: 'A' }, b: { atMs: 3, value: 'B' } }, { a: 1, b: 1 }]);
  c.set(50); assert.equal(await observation.stop(), snapshot);
  assert.equal(observation.fibersDone(), true); assert.equal(c.timers.size, 0);
});

test('observer: a huge finite cutoff arms chunked host waits and still seals on stop', async () => {
  const c = controlledHost();
  const observation = observePublication(0, Number.MAX_SAFE_INTEGER, { never: () => new Promise(() => {}) }, { host: c.host });
  await turn(); assert.deepEqual(c.arms, [2_147_483_647]);
  c.fire(2_147_483_647); await turn(); assert.deepEqual(c.arms, [2_147_483_647, 2_147_483_647]);
  const snapshot = await observation.stop();
  assert.equal(snapshot.end, 'owner_returned'); assert.equal(c.timers.size, 0); assert.equal(observation.fibersDone(), true);
});

test('observer: owner call keeps its settle instant and original result or thrown value before stopping', async () => {
  const c = controlledHost(), original = new Error('owner failed'), owner = deferred();
  const running = observeOwnerCall(0, 100, { never: () => new Promise(() => {}) }, () => owner.promise, { host: c.host });
  await turn(); c.set(5); owner.reject(original);
  const failed = await running;
  assert.equal(failed.failure, original); assert.equal(failed.threw, true); assert.equal(failed.result, null);
  assert.equal(failed.ownerReturnMs, 5); assert.equal(failed.readiness.end, 'owner_returned'); assert.equal(failed.readiness.inFlight, 'never');
  const value = { kind: 'owner-result' };
  const returned = await observeOwnerCall(0, 100, {}, () => value, { host: controlledHost().host });
  assert.equal(returned.result, value); assert.equal(returned.failure, null); assert.equal(returned.threw, false);
  const thrown = await observeOwnerCall(0, 100, { p: () => null }, () => { throw undefined; }, { host: controlledHost().host });
  assert.equal(thrown.threw, true); assert.equal(thrown.failure, undefined);
});

test('observer: real host never-resolving read hands back boundedly on stop and at its deadline with no timer residue', async () => {
  const baseline = timeouts();
  let start = performance.now();
  const stopped = observePublication(start, 60_000, { never: () => new Promise(() => {}) });
  await new Promise(resolveWait => setTimeout(resolveWait, 20));
  const before = performance.now(), snapshot = await stopped.stop(), handbackMs = performance.now() - before;
  assert.equal(snapshot.end, 'owner_returned'); assert.equal(snapshot.inFlight, 'never'); assert.equal(snapshot.attempts.never, 1);
  assert.equal(handbackMs < 1_000, true, `bounded handback ${handbackMs}ms`); assert.equal(stopped.fibersDone(), true);
  start = performance.now();
  const expiring = observePublication(start, 30, { never: () => new Promise(() => {}) });
  const expired = await expiring.sealed, expiredMs = performance.now() - start;
  assert.equal(expired.end, 'setup_deadline'); assert.equal(expired.sealedAtMs >= 30, true);
  assert.equal(expiredMs < 2_000, true, `deadline seal ${expiredMs}ms`);
  assert.equal(await expiring.stop(), expired); assert.equal(expiring.fibersDone(), true);
  await turn(); assert.equal(timeouts() <= baseline, true, 'no observer timer remains');
});
