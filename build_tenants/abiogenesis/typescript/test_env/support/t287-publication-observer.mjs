import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { Deferred, Effect, Exit, Fiber, Ref } from 'effect';

// Test-owned publication observation. It reads only fixture publications,
// touches no owner clock, ChildProcess, callback or capture, and grants no
// runtime authority. One scoped Effect computation per observation; the
// terminal snapshot is sealed once and frozen.

const HOST_MAX_MS = 2_147_483_647;

// One parent monotonic domain. Effect's Clock.currentTimeMillis is Date.now,
// so observation instants come from this host, and sleeps above the host
// timer maximum are chunked rather than handed to Effect as infinite.
export const nodeObservationHost = Object.freeze({
  now: () => performance.now(),
  sleep: ms => Effect.sleep(ms),
});

export const sinceMs = (start, at) => Math.round((at - start) * 1000) / 1000;

function deepFreeze(value) {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const member of Object.values(value)) deepFreeze(member);
  }
  return value;
}
const errorFact = error => error instanceof Error
  ? { name: error.name, code: error.code ?? null, message: error.message }
  : { name: typeof error, code: null, message: String(error) };

// Snapshots are rebuilt from immutable state rows; a sealed state never changes.
function snapshotOf(state, end, sealedAtMs) {
  return deepFreeze({
    end, sealedAtMs, setupMs: state.setupMs,
    observed: structuredClone(state.observed), unobserved: state.names.filter(name => !Object.hasOwn(state.observed, name)),
    errors: structuredClone(state.errors), attempts: { ...state.attempts }, inFlight: state.inFlight,
  });
}

/**
 * Observe fixture publications from `start` until the first of: every probe
 * observed (`complete`), the strict setup cutoff (`setup_deadline`) or
 * `stop()` (`owner_returned`). Eligibility is checked before each probe and
 * again at each read settlement; a read settling at or after the cutoff or
 * after the seal is never credited and starts no further probe. `stop()` never
 * awaits an unresolved read; it seals synchronously and then closes the scope,
 * whose fibers are suspended only on Deferred awaits or sleeps.
 */
export function observePublication(start, setupMs, probes, { host = nodeObservationHost, intervalMs = 10 } = {}) {
  if (!Number.isFinite(start) || !(setupMs > 0) || !(intervalMs > 0)) throw new TypeError('observation bounds must be positive');
  const names = Object.keys(probes);
  const elapsed = () => host.now() - start;
  const state = Effect.runSync(Ref.make(deepFreeze({ setupMs, names, observed: {}, errors: {},
    attempts: Object.fromEntries(names.map(name => [name, 0])), inFlight: null, sealed: null })));
  const sealed = Effect.runSync(Deferred.make());
  // The single sealing transition; later calls return the first snapshot.
  const sealWith = (end, s) => {
    const snapshot = snapshotOf(s, s.names.every(name => Object.hasOwn(s.observed, name)) ? 'complete' : end, sinceMs(start, host.now()));
    return [snapshot, deepFreeze({ ...s, sealed: snapshot })];
  };
  const seal = end => Ref.modify(state, s => s.sealed !== null ? [s.sealed, s] : sealWith(end, s)).pipe(
    Effect.tap(snapshot => Deferred.succeed(sealed, snapshot)));
  const settle = (name, outcome) => Effect.runSync(Ref.modify(state, s => {
    if (s.sealed !== null) return [null, s];
    const atMs = sinceMs(start, outcome.at);
    let next = { ...s, inFlight: null };
    if (!(outcome.at - start < setupMs)) return [null, deepFreeze(next)];
    if ('error' in outcome) next = { ...next, errors: { ...s.errors, [name]: { atMs, ...errorFact(outcome.error) } } };
    else if (outcome.value !== null) next = { ...next, observed: { ...s.observed, [name]: { atMs, value: outcome.value } } };
    if (names.every(member => Object.hasOwn(next.observed, member))) {
      const [snapshot, done] = sealWith('complete', next); return [snapshot, done];
    }
    return [null, deepFreeze(next)];
  }).pipe(Effect.tap(snapshot => snapshot === null ? Effect.void : Deferred.succeed(sealed, snapshot))));
  // Eligibility: unsealed and strictly before the cutoff; reaching the cutoff seals.
  const admit = Effect.flatMap(Ref.get(state), s => s.sealed !== null ? Effect.succeed(false)
    : elapsed() < setupMs ? Effect.succeed(true) : Effect.as(seal('setup_deadline'), false));
  const read = name => Effect.gen(function* () {
    const settled = yield* Deferred.make();
    yield* Ref.update(state, s => deepFreeze({ ...s, inFlight: name, attempts: { ...s.attempts, [name]: s.attempts[name] + 1 } }));
    yield* Effect.sync(() => {
      let pending;
      try { pending = Promise.resolve(probes[name]()); } catch (error) { pending = Promise.reject(error); }
      pending.then(value => ({ at: host.now(), value }), error => ({ at: host.now(), error })).then(outcome => {
        settle(name, outcome); Deferred.unsafeDone(settled, Exit.void);
      });
    });
    yield* Effect.raceFirst(Deferred.await(settled), Deferred.await(sealed));
  });
  const loop = Effect.gen(function* () {
    for (;;) {
      for (const name of names) {
        if (!(yield* admit)) return;
        if (Object.hasOwn((yield* Ref.get(state)).observed, name)) continue;
        yield* read(name);
      }
      if (!(yield* admit)) return;
      yield* Effect.raceFirst(host.sleep(intervalMs), Deferred.await(sealed));
    }
  });
  const deadline = Effect.gen(function* () {
    for (;;) {
      const remaining = setupMs - elapsed();
      if (!(remaining > 0)) { yield* seal('setup_deadline'); return; }
      yield* host.sleep(Math.min(HOST_MAX_MS, Math.max(1, Math.ceil(remaining))));
    }
  });
  const fibers = [];
  const main = Effect.runFork(Effect.scoped(Effect.gen(function* () {
    fibers.push(yield* Effect.forkScoped(loop), yield* Effect.forkScoped(deadline));
    return yield* Deferred.await(sealed);
  })));
  fibers.unshift(main);
  return Object.freeze({
    sealed: Effect.runPromise(Deferred.await(sealed)),
    stop: () => { const snapshot = Effect.runSync(seal('owner_returned')); return Effect.runPromise(Fiber.join(main)).then(() => snapshot); },
    // Proof-only view: every owned fiber has an exit after stop().
    fibersDone: () => fibers.every(fiber => Effect.runSync(Fiber.poll(fiber))._tag === 'Some'),
  });
}

/**
 * Run one owner call under observation. The owner's settle instant is taken in
 * its settlement callback, its result or thrown value is retained unchanged,
 * and only then is the observation stopped.
 */
export async function observeOwnerCall(start, setupMs, probes, call, options = {}) {
  const host = options.host ?? nodeObservationHost, observation = observePublication(start, setupMs, probes, options);
  let pending;
  try { pending = Promise.resolve(call()); } catch (error) { pending = Promise.reject(error); }
  const settled = await pending.then(result => ({ result, failure: null, threw: false, at: host.now() }),
    failure => ({ result: null, failure, threw: true, at: host.now() }));
  const readiness = await observation.stop();
  return { result: settled.result, failure: settled.failure, threw: settled.threw, ownerReturnMs: sinceMs(start, settled.at), readiness };
}

// Bounded explicit evidence for external proof: one TAP diagnostic per record
// and, when ABI5_TEST_EVIDENCE_DIR names an existing directory, one create-only
// JSON file. Long strings keep their byte length and SHA-256 when truncated.
const EVIDENCE_TEXT_BYTES = 65_536;
export function boundedText(text) {
  if (typeof text !== 'string') return text ?? null;
  const bytes = Buffer.from(text, 'utf8');
  return bytes.byteLength <= EVIDENCE_TEXT_BYTES ? text : { truncated: true, byteLength: bytes.byteLength,
    sha256: createHash('sha256').update(bytes).digest('hex'), head: bytes.subarray(0, EVIDENCE_TEXT_BYTES).toString('utf8') };
}
export const failureFact = failure => failure === null || failure === undefined ? null
  : { ...errorFact(failure), stack: failure?.stack ?? null };
export function retainEvidence(t, file, caseId, record) {
  const text = JSON.stringify({ evidence: file, caseId, ...record }, (_key, value) =>
    typeof value === 'bigint' ? value.toString() : typeof value === 'string' ? boundedText(value) : value);
  t.diagnostic(`evidence ${text}`);
  const directory = process.env.ABI5_TEST_EVIDENCE_DIR;
  if (directory) writeFileSync(join(directory, `${file}--${caseId.replace(/[^A-Za-z0-9._-]/gu, '_')}--${process.pid}.json`), text + '\n', { flag: 'wx' });
}
