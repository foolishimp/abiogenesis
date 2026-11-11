import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Readable, Writable } from 'node:stream';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import test from 'node:test';
import * as Cause from 'effect/Cause';
import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';
import * as Fiber from 'effect/Fiber';
import { failureFact, observeOwnerCall, retainEvidence } from '../support/t287-publication-observer.mjs';

// Explicit package selection also lets later proof consume exact packaged bytes.
// Private function exposure below is component evidence, never installed Public proof.
const packageRoot = process.env.ABI5_OWNED_PROCESS_PACKAGE_ROOT ?? resolve(import.meta.dirname, '../..');
const load = name => import(pathToFileURL(join(packageRoot, 'build/code/src', name + '.js')).href);
const { createMonotonicDeadline, createOwnedProcessLifetime } = await load('shared/owned_process_lifetime');
const MAX = 2_147_483_647;
const ns = ms => BigInt(Math.floor(ms)) * 1_000_000n + BigInt(Math.ceil((ms - Math.floor(ms)) * 1_000_000));

function controlledClock() {
  let now = 0n, next = 0;
  const timers = new Map(), arms = [], cancelled = [];
  const clock = {
    nowNs: () => now,
    arm: (callback, delay) => {
      assert(Number.isInteger(delay) && delay > 0 && delay <= MAX, `host delay ${delay}`);
      const id = ++next;
      timers.set(id, { callback, due: now + ns(delay), active: true }); arms.push({ id, delay }); return id;
    },
    cancel: id => { if (timers.has(id)) timers.get(id).active = false; cancelled.push(id); },
  };
  const fire = (id = next, at = now) => {
    now = at;
    const row = timers.get(id); assert(row, `unknown timer ${id}`); row.active = false; row.callback();
  };
  const advance = milliseconds => {
    const target = now + ns(milliseconds);
    for (let count = 0; ; count++) {
      assert(count < 10000, 'controlled callback population bounded');
      const row = [...timers].filter(([, timer]) => timer.active && timer.due <= target)
        .sort((a, b) => a[1].due < b[1].due ? -1 : a[1].due > b[1].due ? 1 : a[0] - b[0])[0];
      if (!row) break;
      fire(row[0], row[1].due);
    }
    now = target;
  };
  return { clock, arms, cancelled, timers, fire, advance, now: () => now,
    active: () => [...timers.values()].filter(row => row.active).length };
}

class ControlledChild extends EventEmitter {
  constructor(pid = 321) {
    super(); this.pid = pid; this.disposals = 0;
    for (const name of ['stdin', 'stdout', 'stderr']) {
      const stream = new EventEmitter();
      stream.closed = false;
      stream.destroy = () => { this.disposals++; stream.destroyed = true; };
      stream.once('close', () => { stream.closed = true; });
      this[name] = stream;
    }
  }
}
function controlledLifetime({ grace = 100, platform = 'posix', probe = () => 'present', observations = {}, pid = 321, signalError = false, childOverride = null } = {}) {
  const timer = controlledClock(), child = childOverride ?? new ControlledChild(pid), signals = [];
  const lifetime = createOwnedProcessLifetime(child, { terminationGraceMs: grace, host: {
    clock: timer.clock, platform, probeGroup: probe,
    signal: (_child, value) => { signals.push({ value, time: timer.now() }); if (signalError) throw new Error('controlled signal error'); },
  } }, observations);
  return { timer, child, signals, lifetime };
}

test('controlled timing: host boundaries, finite huge and fractional delays never become early actions', () => {
  for (const duration of [MAX - 1, MAX, MAX + 1, Number.MAX_SAFE_INTEGER, Number.MAX_VALUE, 0.125, Number.MIN_VALUE]) {
    const t = controlledClock(), deadline = createMonotonicDeadline(t.clock); let calls = 0;
    const due = ns(duration); deadline.after(duration, () => calls++);
    const first = t.arms[0].id;
    t.fire(first, 0n); assert.equal(calls, 0, `premature first chunk ${duration}`);
    t.fire(t.arms.at(-1).id, due - 1n); assert.equal(calls, 0, `one clock tick before ${duration}`);
    const final = t.arms.at(-1).id;
    t.fire(final, due); assert.equal(calls, 1);
    t.fire(final, due + 1n); assert.equal(calls, 1, 'one active action exactly once');
    assert.equal(t.active(), 0);
  }
  const t = controlledClock(), d = createMonotonicDeadline(t.clock); let calls = 0;
  d.after(MAX + 1, () => calls++); t.fire(t.arms.at(-1).id, ns(MAX));
  assert.equal(calls, 0); assert.equal(t.arms.at(-1).delay, 1);
  t.fire(t.arms.at(-1).id, ns(MAX + 1)); assert.equal(calls, 1);
  for (const invalid of [0, -1, Infinity, NaN]) assert.throws(() => d.after(invalid, () => {}), TypeError);
});

test('controlled timing: independently literal nanosecond boundaries forbid fractional and long early firing', () => {
  // These expected deadlines are literals, not the production conversion or ns().
  for (const [delay, due, firstArm] of [
    [Number.MIN_VALUE, 1n, 1], [0.0000005, 1n, 1], [0.0000015, 2n, 1],
    [0.125, 125000n, 1], [1.125, 1125000n, 2],
    [2147483646, 2147483646000000n, 2147483646],
    [2147483647, 2147483647000000n, 2147483647],
    [2147483648, 2147483648000000n, 2147483647],
    [Number.MAX_SAFE_INTEGER, 9007199254740991000000n, 2147483647],
  ]) {
    const t = controlledClock(), wait = createMonotonicDeadline(t.clock); let calls = 0;
    wait.after(delay, () => calls++); assert.equal(t.arms[0].delay, firstArm);
    t.fire(t.arms.at(-1).id, due - 1n); assert.equal(calls, 0, `not due at ${due - 1n}`);
    const final = t.arms.at(-1).id; t.fire(final, due); assert.equal(calls, 1);
    t.fire(final, due + 1n); assert.equal(calls, 1); assert.equal(t.active(), 0);
  }
});

test('controlled timing: cancellation, chunk replacement and renewal cannot renew the absolute limit', () => {
  const t = controlledClock(), lease = createMonotonicDeadline(t.clock), absolute = createMonotonicDeadline(t.clock);
  let leaseCalls = 0, absoluteCalls = 0;
  lease.after(MAX + 1, () => leaseCalls++); const cancelled = t.arms.at(-1).id;
  lease.cancel(); t.fire(cancelled, ns(MAX + 1)); assert.equal(leaseCalls, 0);
  lease.after(MAX + 1, () => leaseCalls++); t.fire(t.arms.at(-1).id, t.now() + ns(MAX));
  const betweenChunks = t.arms.at(-1).id; lease.cancel(); t.fire(betweenChunks, t.now() + ns(1)); assert.equal(leaseCalls, 0);
  absolute.after(100, () => absoluteCalls++); const absoluteId = t.arms.at(-1).id, origin = t.now();
  lease.after(20, () => leaseCalls++); const stale = t.arms.at(-1).id;
  t.fire(stale, origin + ns(10)); // early host callback rechecks the same lease
  lease.after(200, () => leaseCalls++); const renewed = t.arms.at(-1).id;
  t.fire(stale, origin + ns(100)); assert.equal(leaseCalls, 0);
  t.fire(absoluteId, origin + ns(100)); assert.equal(absoluteCalls, 1); assert.equal(leaseCalls, 0);
  lease.cancel(); t.fire(renewed, origin + ns(210)); assert.equal(leaseCalls, 0);
});

test('controlled lifetime: strengthening before and during confirmation preserves the final bound and first failure', async () => {
  for (const when of [10, 130]) {
    const first = new Error(`first-${when}`), second = new Error('second');
    const x = controlledLifetime(); let completions = 0;
    x.lifetime.completion.then(() => completions++);
    x.lifetime.requestTermination(); const initial = x.lifetime.snapshot().cleanupDeadlineNs;
    x.timer.advance(when); x.lifetime.fail(first);
    const strengthened = x.lifetime.snapshot().cleanupDeadlineNs;
    assert(strengthened <= initial); x.lifetime.fail(second); x.lifetime.requestTermination('immediate');
    assert.equal(x.lifetime.snapshot().cleanupDeadlineNs, strengthened);
    x.timer.advance(400); const facts = await x.lifetime.completion;
    assert.equal(facts.firstError, first); assert.equal(facts.scopeAbsence, 'present');
    assert.equal(facts.directExit, null); assert.equal(facts.closeObserved, false); assert.equal(facts.drainExpired, true);
    assert.equal(completions, 1); assert.equal(x.timer.active(), 0);
    assert.deepEqual(x.child.eventNames().sort(), ['close', 'error'], 'inert tail guard until terminal child close');
    x.child.emit('close'); assert.equal(x.child.eventNames().length, 0);
    assert.equal(x.child.disposals, 3); assert.equal(x.signals.filter(row => row.value === 'SIGKILL').length, 1);
  }
});

test('controlled lifetime: every owned stdio error keeps the first error and finalizes once before owner rejection', async () => {
  for (const name of ['stdin', 'stdout', 'stderr']) for (const ownerFirst of [false, true]) {
    const streamError = Object.assign(new Error(`owned-${name}`), { code: 'EPIPE' });
    const first = ownerFirst ? new Error('earlier owner failure') : streamError;
    let absent = false, launchErrors = 0, ordinary = 0, completions = 0;
    const x = controlledLifetime({ probe: () => absent ? 'absent' : 'present', observations: {
      onError: () => launchErrors++, onExit: () => ordinary++, onSignalRequested: () => ordinary++,
    } });
    x.lifetime.completion.then(() => completions++);
    if (ownerFirst) x.lifetime.fail(first);
    x.child[name].emit('error', streamError);
    const deadline = x.lifetime.snapshot().cleanupDeadlineNs;
    x.child[name].emit('error', new Error('second stream failure'));
    x.lifetime.observe(() => ordinary++);
    assert.equal(x.lifetime.snapshot().cleanupDeadlineNs, deadline);
    assert.equal(x.lifetime.snapshot().firstError, first); assert.equal(launchErrors, 0);
    absent = true; x.child.emit('exit', null, 'SIGKILL'); x.child.emit('close');
    const facts = await x.lifetime.completion;
    assert.equal(facts.firstError, first); assert.equal(facts.launchFailure, null);
    assert.equal(facts.scopeAbsence, 'absent'); assert.equal(facts.directExit.signal, 'SIGKILL');
    assert.equal(facts.signalAttempts, 1); assert.equal(completions, 1); assert.equal(ordinary, 0);
    assert.equal(x.timer.active(), 0); assert.equal(facts.streamsDisposed, true);
    for (const stream of [x.child.stdin, x.child.stdout, x.child.stderr]) {
      assert.equal(stream.listenerCount('error'), 1);
      stream.emit('error', new Error('delayed disposal error'));
      assert.equal(x.lifetime.snapshot().firstError, first);
      stream.emit('close'); assert.equal(stream.listenerCount('error'), 0);
    }
  }
});

test('controlled worker handback: final facts survive exit/error order, uncertainty and final-observer failure', async t => {
  const path = join(packageRoot, 'build/code/src/abg/worker_transport.js');
  // The enclosing transport creates both empty archives before runProcess opens stdout.
  const archives = await scratch(t);
  for (const order of ['exit-error', 'error-exit']) for (const scope of ['absent', 'present', 'unknown'])
    for (const observerFails of [false, true]) {
      const clock = controlledClock(), child = new ControlledChild();
      const first = Object.assign(new Error('original stream error'), { code: 'EPIPE' });
      const observerError = new Error('later final observer error');
      let absence = 'present', lifetime, finalized = 0, handedBack = null;
      child.stdin.end = () => {};
      child.stdout.setEncoding = child.stderr.setEncoding = () => {};
      const module = new SourceTextModule((await readFile(path, 'utf8')) + '\nexport { runProcess };', { identifier: path });
      const overrides = {
        'node:child_process': { spawn: () => child },
        '../shared/owned_process_lifetime.js': {
          createMonotonicDeadline: () => createMonotonicDeadline(clock.clock),
          createOwnedProcessLifetime: (actualChild, bounds, observations) => {
            assert.equal(actualChild, child);
            lifetime = createOwnedProcessLifetime(child, { ...bounds, host: {
              clock: clock.clock, platform: 'posix', probeGroup: () => absence, signal: () => {},
            } }, observations);
            return lifetime;
          },
        },
      };
      await module.link(async specifier => {
        const imported = await import(specifier.startsWith('node:') ? specifier : pathToFileURL(resolve(dirname(path), specifier)).href);
        const values = { ...imported, ...overrides[specifier] };
        return new SyntheticModule(Object.keys(values), function () {
          for (const [name, value] of Object.entries(values)) this.setExport(name, value);
        });
      });
      await module.evaluate();
      const stdoutPath = join(archives, `${order}-${scope}-${observerFails}-stdout.log`);
      const stderrPath = join(archives, `${order}-${scope}-${observerFails}-stderr.log`);
      await writeFile(stdoutPath, '', { flag: 'wx' }); await writeFile(stderrPath, '', { flag: 'wx' });
      const pending = module.namespace.runProcess({ command: '/controlled/no-launch', args: [], cwd: '/controlled', env: {},
        stdin: '', timeoutMs: 1000, absoluteTimeoutMs: 2000, terminationGraceMs: 100,
        stdoutPath, stderrPath, observer: {
          onProcessFinalized: facts => { finalized++; handedBack = facts; if (observerFails) throw observerError; },
          onSpawnFailed: () => assert.fail('an established child cannot become a no-child failure'),
        } });
      assert(lifetime, 'owned lifetime guards installed before synthetic child events');
      child.emit('spawn');
      if (order === 'error-exit') child.stderr.emit('error', first);
      child.emit('exit', 0, null);
      if (order === 'exit-error') child.stderr.emit('error', first);
      assert.equal(finalized, 0, 'raw exit supplies no final or semantic confirmation');
      absence = scope; child.emit('close'); clock.advance(300);
      const observation = await pending;
      assert.equal(finalized, 1); assert.equal(observation.facts, handedBack);
      assert.equal(observation.facts, await lifetime.completion, 'same canonical completion object');
      assert.equal(observation.facts.firstError, first);
      assert.equal(observation.finalizationError, observerFails ? observerError : undefined);
      assert.equal(observation.facts.scopeAbsence, scope);
      assert.deepEqual(observation.facts.directExit, { status: 0, signal: null });
      assert.equal(observation.terminationConfirmed, scope === 'absent');
      assert.equal(observation.facts.noChildEstablished, false); assert.equal(clock.active(), 0);
    }
});

test('controlled lifetime: launch errors, repeated postlaunch child errors and close guards remain distinct', async () => {
  const launch = Object.assign(new Error('no executable'), { code: 'ENOENT' });
  let projected = null;
  const missing = controlledLifetime({ observations: { onError: error => { projected = error; } } });
  missing.child.pid = undefined; missing.child.emit('error', launch); missing.child.emit('close');
  const noChild = await missing.lifetime.completion;
  assert.equal(projected, launch); assert.equal(noChild.launchFailure, launch);
  assert.equal(noChild.firstError, null); assert.equal(noChild.noChildEstablished, true);
  const first = Object.assign(new Error('postlaunch child error'), { code: 'EIO' });
  const live = controlledLifetime({ observations: { onError: () => assert.fail('postlaunch error is not a launch failure') } });
  live.child.emit('error', first); live.child.emit('error', new Error('later child error'));
  live.timer.advance(300); const facts = await live.lifetime.completion;
  assert.equal(facts.firstError, first); assert.equal(facts.launchFailure, null);
  assert.equal(facts.scopeAbsence, 'present'); assert.equal(facts.closeObserved, false);
  live.child.emit('error', new Error('inert postcompletion child error'));
  live.child.emit('close'); assert.equal(live.child.listenerCount('error'), 0);
  assert.equal(live.lifetime.snapshot().firstError, first); assert.equal(facts.closeObserved, false);
});

test('controlled lifetime: disposal errors preserve publication cut and detach only at natural stream close', async () => {
  for (const name of ['stdin', 'stdout', 'stderr']) {
    const error = Object.assign(new Error(`queued-${name}`), { code: 'EIO' });
    const stream = name === 'stdin' ? new Writable({ write(_chunk, _encoding, done) { done(); },
      destroy(_error, done) { queueMicrotask(() => done(error)); } })
      : new Readable({ read() {}, destroy(_error, done) { queueMicrotask(() => done(error)); } });
    const closed = new Promise(resolveClose => stream.once('close', resolveClose));
    const child = new ControlledChild(); child[name] = stream;
    const x = controlledLifetime({ childOverride: child, probe: () => 'absent' });
    child.emit('exit', 0, null); x.timer.advance(100);
    const facts = await x.lifetime.completion;
    assert.equal(facts.firstError, null); assert.equal(facts.closeObserved, false);
    assert.equal(facts.streamsDisposed, true); assert.equal(facts.drainExpired, true);
    await closed; assert.equal(stream.closed, true); assert.equal(stream.listenerCount('error'), 0);
    assert.equal(x.lifetime.snapshot().firstError, null, 'delayed error cannot rewrite published outcome');
    child.emit('close'); assert.equal(child.listenerCount('error'), 0);
  }
  for (const throws of [false, true]) {
    const first = new Error('synchronous dispose failure'), child = new ControlledChild();
    child.stdout.destroy = () => { child.disposals++; if (throws) throw first; child.stdout.emit('error', first); };
    const x = controlledLifetime({ childOverride: child, probe: () => 'absent' });
    child.emit('exit', 0, null); child.emit('close'); const facts = await x.lifetime.completion;
    assert.equal(facts.firstError, first); assert.equal(child.disposals, 3, 'all three disposal attempts occur');
    assert.equal(facts.streamsDisposed, !throws); assert.equal(facts.scopeAbsence, 'absent');
  }
  const alreadyClosed = new ControlledChild(); alreadyClosed.stdout.emit('close');
  const x = controlledLifetime({ childOverride: alreadyClosed, probe: () => 'absent' });
  assert.equal(alreadyClosed.stdout.listenerCount('error'), 0);
  alreadyClosed.emit('exit', 0, null); alreadyClosed.emit('close'); await x.lifetime.completion;
});

test('controlled lifetime: callback errors stop ordinary observations and retain the first error', async () => {
  for (const origin of ['spawn', 'exit', 'signal', 'unconfirmed', 'output', 'timeout']) {
    const first = new Error(`observer-${origin}`), calls = [];
    const fail = name => { calls.push(name); if (origin === name) throw first; };
    const x = controlledLifetime({ observations: {
      onSpawn: () => fail('spawn'), onExit: () => fail('exit'),
      onSignalRequested: () => fail('signal'), onUnconfirmed: () => fail('unconfirmed'),
    } });
    if (origin === 'spawn') x.child.emit('spawn');
    else if (origin === 'exit') x.child.emit('exit', 17, null);
    else if (origin === 'output' || origin === 'timeout') x.lifetime.observe(() => { throw first; });
    else x.lifetime.requestTermination();
    x.timer.advance(400); const facts = await x.lifetime.completion;
    assert.equal(facts.firstError, first); const retained = [...calls];
    x.lifetime.observe(() => fail('late')); x.child.emit('exit', 0, null);
    assert.deepEqual(calls, retained); assert.equal(facts.streamsDisposed, true);
  }
});

test('controlled lifetime: no launch, close without exit, probe errors and Windows scope stay distinct', async () => {
  const missing = controlledLifetime({ pid: undefined });
  // Default parameters distinguish an omitted constructor argument from a Node no-PID child.
  missing.child.pid = undefined; missing.child.emit('error', new Error('ENOENT')); missing.child.emit('close', -2, null);
  const failed = await missing.lifetime.completion;
  assert.equal(failed.noChildEstablished, true); assert.equal(failed.directExit, null); assert.equal(failed.scopeAbsence, 'absent');
  assert.deepEqual(missing.signals, []);
  for (const probe of [() => 'unknown', () => { throw Object.assign(new Error('EPERM'), { code: 'EPERM' }); }]) {
    const x = controlledLifetime({ probe, signalError: true }); x.child.emit('close', 0, null); x.timer.advance(300);
    const facts = await x.lifetime.completion;
    assert.equal(facts.directExit, null); assert.equal(facts.closeObserved, true); assert.equal(facts.scopeAbsence, 'unknown');
    assert.equal(facts.firstError, null); assert.equal(facts.signalAttempts, 2);
  }
  let probes = 0;
  const windows = controlledLifetime({ platform: 'win32', probe: () => { probes++; return 'present'; } });
  windows.child.emit('exit', 0, null); windows.child.emit('close', 0, null);
  const facts = await windows.lifetime.completion;
  assert.equal(facts.scopeKind, 'windows_direct_child'); assert.equal(facts.scopeAbsence, 'absent');
  assert.equal(probes, 0); assert.equal(facts.closeObserved, true);
});

test('controlled lifetime: synchronous calls return fresh recomputed snapshots while one sealed completion never changes', async () => {
  const x = controlledLifetime(); let completions = 0;
  x.lifetime.completion.then(() => completions++);
  assert.equal(x.lifetime.requestTermination(), undefined);
  assert.deepEqual(x.signals, [{ value: 'SIGTERM', time: 0n }], 'TERM is requested before the call returns');
  assert.equal(x.lifetime.observe(() => 'inline'), 'inline');
  x.timer.advance(25);
  const early = x.lifetime.snapshot(), again = x.lifetime.snapshot();
  assert.notEqual(early, again); assert.deepEqual(early, again);
  assert.equal(early.cleanupElapsedMs, 25); assert.equal(Object.isFrozen(early), false);
  x.timer.advance(275); const facts = await x.lifetime.completion;
  assert(Object.isFrozen(facts)); assert.equal(facts.cleanupElapsedMs, 300); assert.equal(facts.cleanupDeadlineNs, 300_000_000n);
  x.timer.advance(50); const after = x.lifetime.snapshot();
  assert.notEqual(after, facts); assert.notEqual(after, x.lifetime.snapshot());
  assert.equal(after.cleanupElapsedMs, 350); assert.equal(facts.cleanupElapsedMs, 300);
  const late = new Error('late failure');
  x.lifetime.fail(late); x.lifetime.requestTermination('immediate');
  x.child.stdout.emit('error', late); x.child.emit('error', late);
  assert.equal(x.lifetime.observe(() => 'late'), undefined);
  assert.equal(facts.firstError, null); assert.equal(x.lifetime.snapshot().firstError, null);
  assert.equal(await x.lifetime.completion, facts); assert.equal(completions, 1);
  assert.deepEqual(x.signals.map(row => row.value), ['SIGTERM', 'SIGKILL']); assert.equal(x.timer.active(), 0);
});

test('controlled lifetime: re-entrant signal notices strengthen or finish the attempt and no obsolete signal follows', async () => {
  const notices = [];
  const strengthened = controlledLifetime({ observations: { onSignalRequested: value => {
    notices.push(value); if (value === 'SIGTERM') strengthened.lifetime.requestTermination('immediate');
  } } });
  strengthened.lifetime.requestTermination();
  assert.deepEqual(notices, ['SIGTERM', 'SIGKILL']);
  assert.deepEqual(strengthened.signals, [{ value: 'SIGKILL', time: 0n }], 'no TERM after strengthening');
  assert.equal(strengthened.lifetime.snapshot().cleanupDeadlineNs, 200_000_000n);
  strengthened.timer.advance(200); const kept = await strengthened.lifetime.completion;
  assert.equal(kept.signalAttempts, 1); assert.equal(kept.firstError, null); assert.equal(kept.drainExpired, true);
  assert.deepEqual(strengthened.signals.map(row => row.value), ['SIGKILL']); assert.equal(strengthened.timer.active(), 0);

  const first = new Error('TERM notice failure');
  const failed = controlledLifetime({ observations: { onSignalRequested: value => { if (value === 'SIGTERM') throw first; } } });
  failed.lifetime.requestTermination();
  assert.deepEqual(failed.signals.map(row => row.value), ['SIGKILL']);
  assert.equal(failed.lifetime.snapshot().firstError, first);
  failed.timer.advance(200); assert.equal((await failed.lifetime.completion).firstError, first);
  assert.equal(failed.timer.active(), 0);

  let absent = false;
  const finished = controlledLifetime({ probe: () => absent ? 'absent' : 'present', observations: { onSignalRequested: value => {
    if (value !== 'SIGKILL') return;
    absent = true; finished.child.emit('exit', 0, null); finished.child.emit('close');
  } } });
  finished.lifetime.requestTermination('immediate');
  const facts = await finished.lifetime.completion;
  assert.deepEqual(finished.signals, [], 'no KILL after the attempt finished during its own notice');
  assert.equal(finished.timer.active(), 0, 'no wait armed after completion');
  assert.equal(facts.signalAttempts, 0); assert.equal(facts.closeObserved, true); assert.equal(facts.scopeAbsence, 'absent');
  assert.equal(facts.drainExpired, false); assert.equal(facts.cleanupDeadlineNs, 300_000_000n);
});

test('controlled lifetime: first error and disposal faults are recorded before the one completion publication', async () => {
  const owner = new Error('owner failure'), stdoutFault = new Error('stdout dispose');
  for (const origin of ['owner', 'stdout', 'stderr']) {
    const child = new ControlledChild(), attempts = [];
    child.stdout.destroy = () => { child.disposals++; attempts.push('stdout'); if (origin !== 'stderr') throw stdoutFault; };
    child.stderr.destroy = () => { child.disposals++; attempts.push('stderr'); throw 'stderr dispose'; };
    const x = controlledLifetime({ childOverride: child, probe: () => 'absent' });
    let published = null; x.lifetime.completion.then(facts => { published = facts; });
    if (origin === 'owner') x.lifetime.fail(owner);
    child.emit('exit', 0, null); child.emit('close');
    assert.deepEqual(attempts, ['stdout', 'stderr']); assert.equal(child.disposals, 3);
    const facts = await x.lifetime.completion;
    assert.equal(published, facts); assert(Object.isFrozen(facts)); assert.equal(facts.streamsDisposed, false);
    if (origin === 'owner') assert.equal(facts.firstError, owner);
    else if (origin === 'stdout') assert.equal(facts.firstError, stdoutFault);
    else { assert(facts.firstError instanceof TypeError); assert.equal(facts.firstError.message, 'stderr dispose'); }
    x.lifetime.fail(new Error('after publication'));
    assert.equal(x.lifetime.snapshot().firstError, facts.firstError); assert.equal(x.timer.active(), 0);
  }
});

// One independent census of every host call; a fixture may re-enter the actual owner from either call.
function censusLifetime({ probe = () => 'present', signal = () => {}, platform = 'posix', observations = {} } = {}) {
  const timer = controlledClock(), child = new ControlledChild(), calls = [];
  const enters = () => calls.filter(row => row[0] === 'enter').length;
  const lifetime = createOwnedProcessLifetime(child, { terminationGraceMs: 100, host: {
    clock: timer.clock, platform,
    probeGroup: () => {
      const ordinal = enters() + 1; calls.push(['enter', ordinal]);
      const absence = probe(ordinal); calls.push(['return', ordinal, absence]); return absence;
    },
    signal: (_child, value) => { calls.push(['signal', value]); signal(value); },
  } }, observations);
  return { timer, child, calls, enters, lifetime };
}

test('controlled lifetime: exit and close re-entering a probe seal both entered assessments and drop its stale result', async () => {
  let completions = 0;
  const x = censusLifetime({ probe: ordinal => {
    if (ordinal !== 1) return 'absent';
    x.calls.push(['exit']); x.child.emit('exit', 0, null);
    x.calls.push(['close']); x.child.emit('close');
    return 'present';
  } });
  x.lifetime.completion.then(() => completions++);
  x.lifetime.requestTermination();
  assert.deepEqual(x.calls, [['enter', 1], ['exit'], ['enter', 2], ['return', 2, 'absent'], ['close'], ['return', 1, 'present']]);
  const immediate = x.lifetime.snapshot(), facts = await x.lifetime.completion;
  assert(Object.isFrozen(facts)); assert.notEqual(immediate, facts); assert.equal(facts.cleanupElapsedMs, 0);
  for (const view of [facts, immediate]) {
    assert.equal(view.scopeAbsence, 'absent'); assert.equal(view.probeCount, 2); assert.equal(view.signalAttempts, 0);
    assert.deepEqual(view.directExit, { status: 0, signal: null }); assert.equal(view.closeObserved, true);
    assert.equal(view.streamsDisposed, true); assert.equal(view.drainExpired, false); assert.equal(view.cleanupDeadlineNs, 300_000_000n);
  }
  assert.equal(x.child.disposals, 3); assert.equal(x.timer.active(), 0);
  x.timer.advance(25); const later = x.lifetime.snapshot();
  assert.notEqual(later, immediate); assert.equal(later.cleanupElapsedMs, 25); assert.equal(facts.cleanupElapsedMs, 0);
  assert.equal(later.scopeAbsence, 'absent'); assert.equal(later.probeCount, 2); assert.equal(later.signalAttempts, 0);
  assert.equal(await x.lifetime.completion, facts); assert.equal(completions, 1);
  assert.equal(x.calls.length, 6, 'no later probe or signal'); assert.equal(x.child.disposals, 3); assert.equal(x.timer.active(), 0);
});

test('controlled lifetime: exit re-entering a probe drains its nested absence and rejects the stale result before close', async () => {
  let published = null;
  const x = censusLifetime({ probe: ordinal => {
    if (ordinal !== 1) return 'absent';
    x.calls.push(['exit']); x.child.emit('exit', 0, null);
    return 'present';
  } });
  x.lifetime.completion.then(facts => { published = facts; });
  x.lifetime.requestTermination();
  assert.deepEqual(x.calls, [['enter', 1], ['exit'], ['enter', 2], ['return', 2, 'absent'], ['return', 1, 'present']]);
  await Promise.resolve();
  const pending = x.lifetime.snapshot();
  assert.equal(published, null, 'the drain is still pending');
  assert.equal(pending.scopeAbsence, 'absent'); assert.equal(pending.probeCount, 2); assert.equal(pending.signalAttempts, 0);
  assert.equal(pending.closeObserved, false); assert.equal(pending.streamsDisposed, false); assert.equal(pending.drainExpired, false);
  assert.equal(x.child.disposals, 0); assert.equal(x.timer.active(), 1, 'only the bounded drain wait');
  x.child.emit('close');
  const facts = await x.lifetime.completion;
  assert.equal(published, facts); assert(Object.isFrozen(facts));
  assert.equal(facts.scopeAbsence, 'absent'); assert.equal(facts.probeCount, 2); assert.equal(facts.signalAttempts, 0);
  assert.equal(facts.closeObserved, true); assert.equal(facts.streamsDisposed, true); assert.equal(facts.drainExpired, false);
  assert.equal(x.calls.length, 5); assert.equal(x.child.disposals, 3); assert.equal(x.timer.active(), 0);
});

test('controlled lifetime: immediate strengthening inside a probe keeps its tightened bounds and drops the stale graceful result', async () => {
  let tightened = null;
  const x = censusLifetime({ probe: ordinal => {
    if (ordinal !== 1) return 'present';
    x.lifetime.requestTermination('immediate'); tightened = x.lifetime.snapshot().cleanupDeadlineNs;
    return 'absent';
  } });
  x.lifetime.requestTermination();
  assert.deepEqual(x.calls, [['enter', 1], ['enter', 2], ['return', 2, 'present'], ['enter', 3], ['return', 3, 'present'],
    ['signal', 'SIGKILL'], ['enter', 4], ['return', 4, 'present'], ['return', 1, 'absent']]);
  const active = x.lifetime.snapshot();
  assert.equal(active.scopeAbsence, 'present', 'the stale absent result never becomes current');
  assert.equal(active.probeCount, 4); assert.equal(active.signalAttempts, 1);
  assert.equal(tightened, 200_000_000n); assert.equal(active.cleanupDeadlineNs, tightened);
  assert.deepEqual(x.timer.arms.map(row => row.delay), [100, 10], 'KILL scope and re-check waits only');
  x.timer.advance(200); const facts = await x.lifetime.completion;
  assert.equal(facts.scopeAbsence, 'present'); assert.equal(facts.drainExpired, true); assert.equal(facts.cleanupDeadlineNs, tightened);
  assert.equal(facts.probeCount, x.enters()); assert.equal(facts.signalAttempts, 1);
  assert.deepEqual(x.calls.filter(row => row[0] === 'signal'), [['signal', 'SIGKILL']]);
  assert.equal(x.child.disposals, 3); assert.equal(x.timer.active(), 0);
});

test('controlled lifetime: a re-check requested inside a kill probe leaves that probe current and its KILL bound intact', async () => {
  const x = censusLifetime({ probe: ordinal => {
    if (ordinal === 2) { x.calls.push(['exit']); x.child.emit('exit', 0, null); }
    return 'present';
  } });
  x.lifetime.requestTermination('immediate');
  assert.deepEqual(x.calls, [['enter', 1], ['return', 1, 'present'], ['enter', 2], ['exit'], ['return', 2, 'present'],
    ['signal', 'SIGKILL'], ['enter', 3], ['return', 3, 'present']]);
  const active = x.lifetime.snapshot();
  assert.equal(active.probeCount, 3); assert.equal(active.signalAttempts, 1); assert.equal(active.cleanupDeadlineNs, 200_000_000n);
  assert.deepEqual(x.timer.arms.map(row => row.delay), [100, 10], 'KILL scope and re-check waits only');
  x.timer.advance(200); const facts = await x.lifetime.completion;
  assert.deepEqual(facts.directExit, { status: 0, signal: null }); assert.equal(facts.scopeAbsence, 'present');
  assert.equal(facts.drainExpired, true); assert.equal(facts.probeCount, x.enters()); assert.equal(facts.signalAttempts, 1);
  assert.equal(x.child.disposals, 3); assert.equal(x.timer.active(), 0);
});

test('controlled lifetime: exit inside the first immediate probe keeps KILL and its bound before handback and drops the stale result', async () => {
  for (const stale of ['present', 'absent']) {
    const x = censusLifetime({ probe: ordinal => {
      if (ordinal !== 1) return 'present';
      x.calls.push(['exit']); x.child.emit('exit', 0, null);
      return stale;
    } });
    x.lifetime.requestTermination('immediate');
    const handback = x.calls.slice(), active = x.lifetime.snapshot();
    assert.deepEqual(handback.slice(0, 2), [['enter', 1], ['exit']]);
    assert(handback.some(row => row[0] === 'signal' && row[1] === 'SIGKILL'), 'KILL requested before the outer immediate call returns');
    assert(active.cleanupDeadlineNs !== null && active.cleanupDeadlineNs <= 200_000_000n, 'immediate cleanup bound no later than 200ms');
    assert.equal(active.scopeAbsence, 'present', `the stale ${stale} result never becomes current`);
    assert.equal(active.probeCount, x.enters());
    assert.equal(handback.filter(row => row[0] === 'return').length, x.enters(), 'every entered assessment returned');
    assert.equal(active.signalAttempts, handback.filter(row => row[0] === 'signal').length);
    x.timer.advance(200); const facts = await x.lifetime.completion;
    assert(Object.isFrozen(facts)); assert.equal(facts.cleanupDeadlineNs, active.cleanupDeadlineNs); assert(facts.cleanupElapsedMs <= 200);
    assert.deepEqual(facts.directExit, { status: 0, signal: null }); assert.equal(facts.scopeAbsence, 'present');
    assert.equal(facts.drainExpired, true); assert.equal(facts.probeCount, x.enters());
    assert.equal(facts.signalAttempts, x.calls.filter(row => row[0] === 'signal').length);
    assert.equal(x.calls.filter(row => row[0] === 'signal' && row[1] === 'SIGKILL').length, 1);
    assert.equal(x.child.disposals, 3); assert.equal(x.timer.active(), 0);
  }
});

test('controlled lifetime: an immediate request completed by nested absence, exit and close is not resurrected by its stale result', async () => {
  let completions = 0;
  const x = censusLifetime({ probe: ordinal => {
    if (ordinal !== 1) return 'absent';
    x.calls.push(['exit']); x.child.emit('exit', 0, null);
    x.calls.push(['close']); x.child.emit('close');
    return 'present';
  } });
  x.lifetime.completion.then(() => completions++);
  x.lifetime.requestTermination('immediate');
  const handback = x.calls.slice(), disposed = x.child.disposals;
  const immediate = x.lifetime.snapshot(), facts = await x.lifetime.completion;
  assert.deepEqual(handback.at(-1), ['return', 1, 'present'], 'the stale outer result returns after completion');
  assert(!handback.some(row => row[0] === 'signal'), 'no signal for an already completed cleanup');
  assert(Object.isFrozen(facts)); assert.notEqual(immediate, facts); assert.deepEqual(immediate, { ...facts });
  for (const view of [facts, immediate]) {
    assert.equal(view.scopeAbsence, 'absent'); assert.equal(view.probeCount, x.enters()); assert.equal(view.signalAttempts, 0);
    assert.deepEqual(view.directExit, { status: 0, signal: null }); assert.equal(view.closeObserved, true);
    assert.equal(view.streamsDisposed, true); assert.equal(view.drainExpired, false); assert.equal(view.cleanupDeadlineNs, 300_000_000n);
  }
  assert.equal(disposed, 3); assert.equal(x.timer.active(), 0);
  x.timer.advance(25); x.lifetime.requestTermination('immediate'); const later = x.lifetime.snapshot();
  assert.notEqual(later, immediate); assert.equal(later.cleanupElapsedMs, 25); assert.equal(facts.cleanupElapsedMs, 0);
  assert.equal(later.scopeAbsence, 'absent'); assert.equal(later.probeCount, facts.probeCount); assert.equal(later.signalAttempts, 0);
  assert.equal(await x.lifetime.completion, facts); assert.equal(completions, 1);
  assert.deepEqual(x.calls, handback, 'no later probe or signal'); assert.equal(x.child.disposals, 3); assert.equal(x.timer.active(), 0);
});

test('controlled lifetime: ordinary, throwing and fast-path assessments count at entry; a probe cancelled before entry is not counted', async () => {
  const ordinary = censusLifetime({ probe: () => 'absent' });
  ordinary.child.emit('exit', 0, null); ordinary.child.emit('close');
  const done = await ordinary.lifetime.completion;
  assert.deepEqual(ordinary.calls, [['enter', 1], ['return', 1, 'absent']]);
  assert.equal(done.probeCount, 1); assert.equal(done.scopeAbsence, 'absent'); assert.equal(done.signalAttempts, 0);

  const throwing = censusLifetime({ probe: () => { throw Object.assign(new Error('EPERM'), { code: 'EPERM' }); } });
  throwing.child.emit('exit', 0, null);
  assert.deepEqual(throwing.calls, [['enter', 1], ['signal', 'SIGTERM'], ['enter', 2], ['enter', 3]]);
  assert.equal(throwing.lifetime.snapshot().probeCount, 3); assert.equal(throwing.lifetime.snapshot().scopeAbsence, 'unknown');
  throwing.timer.advance(300); const unknown = await throwing.lifetime.completion;
  assert.equal(unknown.probeCount, throwing.enters()); assert.equal(unknown.scopeAbsence, 'unknown'); assert.equal(unknown.firstError, null);

  const noChild = censusLifetime(); noChild.child.pid = undefined;
  noChild.child.emit('error', new Error('ENOENT')); noChild.child.emit('close');
  const missing = await noChild.lifetime.completion;
  assert.equal(missing.noChildEstablished, true); assert.equal(missing.probeCount, 1); assert.equal(missing.scopeAbsence, 'absent');
  assert.deepEqual(noChild.calls, []);
  const windows = censusLifetime({ platform: 'win32' });
  windows.child.emit('exit', 0, null); windows.child.emit('close');
  const direct = await windows.lifetime.completion;
  assert.equal(direct.probeCount, 1); assert.equal(direct.scopeAbsence, 'absent'); assert.deepEqual(windows.calls, []);
  const unlaunched = censusLifetime(); unlaunched.child.pid = undefined;
  unlaunched.lifetime.requestTermination();
  assert.deepEqual(unlaunched.calls, [['signal', 'SIGTERM']]);
  assert.equal(unlaunched.lifetime.snapshot().probeCount, 2); assert.equal(unlaunched.lifetime.snapshot().scopeAbsence, 'unknown');

  // TERM itself ends the group; the re-check proposed with that signal never enters.
  let absent = false;
  const bySignal = censusLifetime({ probe: () => absent ? 'absent' : 'present', signal: value => {
    if (value !== 'SIGTERM') return;
    absent = true; bySignal.calls.push(['exit']); bySignal.child.emit('exit', null, 'SIGTERM');
    bySignal.calls.push(['close']); bySignal.child.emit('close');
  } });
  bySignal.lifetime.requestTermination();
  assert.deepEqual(bySignal.calls, [['enter', 1], ['return', 1, 'present'], ['signal', 'SIGTERM'], ['exit'],
    ['enter', 2], ['return', 2, 'absent'], ['close']]);
  const signalled = await bySignal.lifetime.completion;
  assert.equal(signalled.probeCount, 2); assert.equal(signalled.signalAttempts, 1); assert.equal(signalled.scopeAbsence, 'absent');
  assert.equal(bySignal.child.disposals, 3); assert.equal(bySignal.timer.active(), 0);

  // A slow TERM notice makes the grace wait already due; that wait re-enters and the re-check never enters.
  let slow = true;
  const byWait = censusLifetime({ observations: { onSignalRequested: value => {
    if (value === 'SIGTERM' && slow) { slow = false; byWait.timer.advance(150); }
  } } });
  byWait.lifetime.requestTermination();
  assert.deepEqual(byWait.calls, [['enter', 1], ['return', 1, 'present'], ['signal', 'SIGTERM'], ['enter', 2], ['return', 2, 'present'],
    ['signal', 'SIGKILL'], ['enter', 3], ['return', 3, 'present']]);
  assert.equal(byWait.lifetime.snapshot().probeCount, 3);
  byWait.timer.advance(200); const waited = await byWait.lifetime.completion;
  assert.equal(waited.probeCount, byWait.enters()); assert.equal(waited.signalAttempts, 2); assert.equal(waited.drainExpired, true);
  assert.equal(byWait.timer.active(), 0);
});

async function helperModule(t, control = false, overrides = {}) {
  const path = join(packageRoot, 'build/code/src/implementation/worksite_command_helper.js');
  let source = (await readFile(path, 'utf8')).replace(/^#!.*\n/u, '');
  // Promise-facing callers run the actual Effect command through the helper's own host projection.
  const onHost = 'const runCommandOnHost = (...args) => runHelperProgram(runCommand(...args));';
  const suffix = control ? `${onHost}
  const production = { confinedExistingPath, reportObservation, commandScopeClosed, runCommand,
    canonicalExistingPathWithinRoot, acknowledge };
  function controlledBindings(c) {
    confinedExistingPath = c.confinedPath === undefined ? production.confinedExistingPath : c.confinedPath;
    reportObservation = c.report === undefined ? production.reportObservation : c.report;
    commandScopeClosed = c.closed === undefined ? production.commandScopeClosed
      : (used, closed) => { c.closed(used, closed); production.commandScopeClosed(used, closed); };
  }
  export async function controlledMain(c) {
    admitLaunchManifest=c.admit; observations=c.observations; filesystemInventory=c.inventory;
    materializeSnapshot=c.snapshot; predicateObservation=c.predicate;
    worksiteDelta=c.delta; publishCreateOnly=c.publish; controlledBindings(c);
    runCommand = c.command === undefined ? production.runCommand : (...args) => attempt(() => c.command(...args));
    canonicalExistingPathWithinRoot = c.path === undefined ? production.canonicalExistingPathWithinRoot : c.path;
    acknowledge = c.output === undefined ? production.acknowledge : line => production.acknowledge(line, c.output);
    return main();
  }
  export function controlledCommandEffect(c, task) {
    controlledBindings(c); return production.runCommand(task, '/controlled', 0, 'attempt://selected');
  }
  export const controlledCommand = (c, task) => runHelperProgram(controlledCommandEffect(c, task));
  export const activeCommandOf = () => activeCommand;
  export { runHttpProbe, runHelperProgram, WorksiteHelperFailure };` : `${onHost}
  export { runCommandOnHost as runCommand, runHttpProbe };`;
  assert.match(source, /await main\(\);\s*$/u); source = source.replace(/await main\(\);\s*$/u, suffix);
  const previous = new Map(['SIGTERM', 'SIGINT'].map(signal => [signal, process.listeners(signal)]));
  const mod = new SourceTextModule(source, { identifier: path });
  await mod.link(async specifier => {
    // Relative owners load from the selected package; bare Effect modules resolve as package dependencies.
    const imported = { ...await import(specifier.startsWith('.') ? pathToFileURL(resolve(dirname(path), specifier)).href : specifier) };
    if (control && specifier.endsWith('/worksite_command_forward.js')) {
      imported.isExecutableWorksiteCommandTask = () => true; imported.executableWorksiteCommandSources = () => [];
    }
    Object.assign(imported, overrides[specifier]);
    return new SyntheticModule(Object.keys(imported), function () {
      for (const [name, value] of Object.entries(imported)) this.setExport(name, value);
    });
  });
  await mod.evaluate();
  t.after(() => { for (const [signal, prior] of previous) for (const listener of process.listeners(signal))
    if (!prior.includes(listener)) process.removeListener(signal, listener); });
  return mod.namespace;
}

test('controlled helper continuation: uncertainty preserves diagnostics and stops dependent launches, reads and publication', async t => {
  const helper = await helperModule(t, true);
  const stream = { payload: Buffer.from('original inner scope is unknown').toString('base64') };
  for (const origin of ['command', 'http', 'owner-error']) {
    const calls = [], original = new Error('first owner failure');
    const task = { taskRef: 'task://selected', taskDigest: 'sha256:' + '1'.repeat(64),
      commands: [1, 2], outcomePredicates: [1, 2], workspaceBinding: { roots: { productRoot: '/controlled' } } };
    const result = { commandId: 'command://selected', exitStatus: 0, timedOut: false, processSignal: null,
      signalSequence: ['SIGTERM', 'SIGKILL'], terminationConfirmed: origin === 'http', stderr: stream };
    await assert.rejects(helper.controlledMain({
      admit: async () => ({ task, sandboxRoot: '/controlled-sandbox', artifactPath: '/controlled-artifact', manifest: { attemptRef: 'attempt://selected' } }),
      observations: async () => { calls.push('observations'); return []; },
      inventory: async () => { calls.push('inventory'); return []; },
      snapshot: async () => { calls.push('snapshot'); return {}; },
      command: async () => { calls.push('command'); if (origin === 'owner-error') throw original; return result; },
      predicate: async () => { calls.push('predicate'); return { predicateId: 'predicate://selected', predicateKind: 'http_response_exact',
        observedValue: { process: { ...result, terminationConfirmed: false } } }; },
      delta: () => { calls.push('delta'); return []; }, publish: async () => { calls.push('publication'); },
    }), error => {
      if (origin === 'owner-error') assert.equal(error, original);
      else for (const needle of ['cleanup unresolved', 'task://selected', 'attempt://selected', 'SIGKILL', 'original inner scope is unknown']) assert(error.message.includes(needle), needle);
      return true;
    });
    assert.deepEqual(calls, origin === 'http'
      ? ['observations', 'inventory', 'snapshot', 'inventory', 'command', 'command', 'predicate']
      : ['observations', 'inventory', 'snapshot', 'inventory', 'command']);
  }
});

// A helper owner's first error stops dependent work: the failure names the
// task and carries the error's description and the encoded process facts.
function assertDependentFailure(error, prefix, first) {
  assert.equal(error.name, 'TypeError'); assert(error.message.startsWith(prefix), error.message);
  const body = JSON.parse(error.message.slice(prefix.length));
  if (first instanceof RegExp) assert.match(body.diagnostic.message, first);
  else assert.equal(body.diagnostic.message, first.message);
  assert.equal(body.processFacts.firstError.message, body.diagnostic.message);
}

// Explicit acquisition readiness: the helper command reads its lifetime's
// completion only after its last acquisition. Every other member is the same lifetime.
function awaitedCompletion(lifetime, notify) {
  return { ...lifetime, get completion() { notify(); return lifetime.completion; } };
}

test('controlled command continuation: unresolved cleanup stops before expected-report reads and preserves first error', async t => {
  for (const ownerFailure of [false, true]) {
    const clock = controlledClock(), child = new EventEmitter(), first = new Error('first report-owner failure');
    let notifyReady; const ready = new Promise(resolveReady => { notifyReady = resolveReady; });
    child.pid = 321;
    for (const name of ['stdin', 'stdout', 'stderr']) {
      child[name] = new EventEmitter(); child[name].destroy = () => {};
    }
    let lifetime, reports = 0;
    const helper = await helperModule(t, true, {
      'node:child_process': { spawn: () => child },
      '../shared/owned_process_lifetime.js': {
        createOwnedProcessLifetime: (process, bounds, observations) => awaitedCompletion(lifetime = createOwnedProcessLifetime(process, {
          ...bounds, host: { clock: clock.clock, platform: 'posix', probeGroup: () => 'unknown', signal: () => {} },
        }, observations), notifyReady),
      },
    });
    const task = { taskRef: 'task://selected', taskDigest: 'sha256:' + '1'.repeat(64), commands: [{
      ordinal: 0, commandId: 'command://selected', executable: 'controlled', args: [], environment: [],
      relativeCwd: '.', timeoutMs: 10000, terminationGraceMs: 100,
      expectedReports: [{ ordinal: 0, reportIdentity: 'report://forbidden', relativePath: 'report.xml' }],
    }] };
    const result = helper.controlledCommand({ confinedPath: async () => '/controlled',
      report: async () => { reports++; throw new Error('unexpected report filesystem access'); } }, task);
    await ready;
    assert(lifetime);
    child.stdout.emit('data', Buffer.from('original stdout'));
    child.stderr.emit('data', Buffer.from('original inner diagnostic'));
    if (ownerFailure) lifetime.fail(first);
    child.emit('exit', 17, 'SIGTERM');
    clock.advance(400);
    await assert.rejects(result, error => {
      if (ownerFailure) assertDependentFailure(error, 'worksite command failed; dependent work stopped: ', first);
      else for (const needle of ['cleanup unresolved', 'task://selected', 'attempt://selected', 'command://selected',
        '"exitStatus":17', '"processSignal":"SIGTERM"', 'SIGKILL', 'original inner diagnostic', 'scopeAbsence', 'unknown'])
        assert(error.message.includes(needle), needle);
      return true;
    });
    assert.equal(reports, 0); assert.equal(clock.active(), 0);
  }
});

async function scratch(t) {
  const path = await realpath(await mkdtemp(join(tmpdir(), 'abi5-lifetime-')));
  t.after(() => rm(path, { recursive: true, force: true })); return path;
}
const decode = stream => Buffer.from(stream.payload, 'base64').toString();
const alive = pid => { try { process.kill(pid, 0); return true; } catch (error) { if (error.code === 'ESRCH') return false; throw error; } };
function httpDeclaration(file, port = 'port.txt', overrides = {}, request = {}) {
  return { launch: { executable: process.execPath, args: [file, '{port_file}'], environment: [], relativeCwd: '.',
    timeoutMs: 600, terminationGraceMs: 120, portFile: { relativePath: port }, ...overrides },
    request: { hostname: '127.0.0.1', method: 'GET', path: '/', timeoutMs: 300, ...request } };
}
async function httpInput(file, port, overrides, request) {
  const { WORKSITE_COMMAND_EXECUTION_IDS } = await load('product/worksite_command_execution');
  const declaration = httpDeclaration(file, port, overrides, request);
  declaration.launch.args[1] = WORKSITE_COMMAND_EXECUTION_IDS.httpPortFileArgumentPlaceholder;
  return declaration;
}

test('controlled owners: command and HTTP reject the original stream error before reports or a dependent request', async t => {
  const root = await scratch(t);
  for (const owner of ['command', 'http']) {
    const child = new ControlledChild(); child.stdin = null;
    const clock = controlledClock(), first = Object.assign(new Error(`${owner} readable failure`), { code: 'EIO' });
    const port = join(root, 'selected.port');
    let lifetime, absent = false, reports = 0, requests = 0, notifyStarted, notifyRead;
    const started = new Promise(resolveStarted => { notifyStarted = resolveStarted; });
    const read = new Promise(resolveRead => { notifyRead = resolveRead; });
    const helper = await helperModule(t, true, {
      'node:child_process': { spawn: () => {
        if (owner === 'http') writeFileSync(port, '12345'); return child;
      } },
      'node:fs/promises': { readFile: async (...args) => {
        const bytes = await readFile(...args);
        if (args[0] === port) { child.stdout.emit('error', first); notifyRead(); }
        return bytes;
      } },
      'node:http': { request: () => { requests++; throw new Error('dependent HTTP request must not begin'); } },
      '../shared/owned_process_lifetime.js': {
        createOwnedProcessLifetime: (process, bounds, observations) => {
          lifetime = createOwnedProcessLifetime(process, { ...bounds, host: { clock: clock.clock,
            platform: 'posix', probeGroup: () => absent ? 'absent' : 'present', signal: () => {} } }, observations);
          notifyStarted(); return lifetime;
        },
      },
    });
    const task = { taskRef: 'task://stream-failure', taskDigest: 'sha256:' + '2'.repeat(64), commands: [{ commandId: 'command://stream-failure', executable: 'controlled',
      args: [], environment: [], relativeCwd: '.', timeoutMs: 1000, terminationGraceMs: 100, expectedReports: [{}] }] };
    const pending = owner === 'command'
      ? helper.controlledCommand({ confinedPath: async () => root, report: async () => { reports++; } }, task)
      : helper.runHttpProbe(task, root, httpDeclaration('controlled', 'selected.port', { terminationGraceMs: 100 }));
    // Install the rejection observer before the controlled failure is emitted.
    const outcome = pending.then(value => ({ value }), error => ({ error }));
    await started;
    if (owner === 'command') child.stderr.emit('error', first);
    else {
      await read;
      // Let the HTTP loop advance while the owned process has not exited or
      // closed: firstError itself must prevent the dependent request.
      await new Promise(resolveTurn => setImmediate(resolveTurn));
      assert.equal(lifetime.snapshot().directExit, null); assert.equal(lifetime.snapshot().closeObserved, false);
      assert.equal(requests, 0);
    }
    assert.equal(lifetime.snapshot().firstError, first); assert.equal(lifetime.snapshot().launchFailure, null);
    absent = true; child.emit('exit', null, 'SIGKILL'); child.emit('close');
    const observed = await outcome;
    assertDependentFailure(observed.error, owner === 'command' ? 'worksite command failed; dependent work stopped: '
      : 'worksite HTTP probe failed; dependent work stopped: ', first);
    assert.equal(reports, 0); assert.equal(requests, 0);
    assert.equal(lifetime.snapshot().scopeAbsence, 'absent'); assert.equal(clock.active(), 0);
    assert.equal(lifetime.snapshot().signalAttempts, 1);
  }
});

// B command fixture: the actual helper Effect command over a controlled child,
// clock and group host. The group ends at its first requested signal; the log
// orders signals, the canonical completion and capture-listener detachment.
const bTask = (timeoutMs = 10000) => ({ taskRef: 'task://b-command', taskDigest: 'sha256:' + '5'.repeat(64),
  outcomePredicates: [], workspaceBinding: { roots: { productRoot: '/controlled' } },
  commands: [{ ordinal: 0, commandId: 'command://b-command', executable: 'controlled', args: [], environment: [],
    relativeCwd: '.', timeoutMs, terminationGraceMs: 100, expectedReports: [] }] });
const bPaths = { confinedPath: async () => '/controlled', report: async () => assert.fail('no expected-report read') };
const realTimers = () => process.getActiveResourcesInfo().filter(name => name === 'Timeout').length;
function bRow({ spawned = () => new ControlledChild(), faults = {} } = {}) {
  const clock = controlledClock(), log = [];
  let child = null, lifetime = null, absent = false, notifyReady;
  const ready = new Promise(resolveReady => { notifyReady = resolveReady; });
  const fault = (name, stage) => { if (Object.hasOwn(faults, `${name}-${stage}`)) throw faults[`${name}-${stage}`]; };
  return { clock, log, ready, get child() { return child; }, get lifetime() { return lifetime; },
    end: (status = 0, afterExit = () => {}) => { absent = true; child.emit('exit', status, null); afterExit(); child.emit('close'); },
    spawn: () => {
      child = spawned();
      for (const name of ['stdout', 'stderr']) {
        const stream = child[name], on = stream.on.bind(stream), off = stream.off.bind(stream);
        stream.on = (event, listener) => { if (event === 'data') fault(name, 'attach'); return on(event, listener); };
        stream.off = (event, listener) => {
          off(event, listener); if (event === 'data') { log.push(['detach', name]); fault(name, 'detach'); } return stream;
        };
      }
      return child;
    },
    own: (owned, bounds, observations) => {
      lifetime = createOwnedProcessLifetime(owned, { ...bounds, host: { clock: clock.clock, platform: 'posix',
        probeGroup: () => absent ? 'absent' : 'present',
        signal: (_child, value) => { log.push(['signal', value]); absent = true; owned.emit('exit', null, value); owned.emit('close'); },
      } }, observations);
      lifetime.completion.then(() => log.push(['completion']));
      return awaitedCompletion(lifetime, notifyReady);
    } };
}
async function bHelper(t, overrides = {}) {
  let row = null;
  const helper = await helperModule(t, true, {
    'node:child_process': { spawn: () => row.spawn() },
    '../shared/owned_process_lifetime.js': {
      createMonotonicDeadline: () => createMonotonicDeadline(row.clock.clock),
      createOwnedProcessLifetime: (child, bounds, observations) => row.own(child, bounds, observations),
    },
    ...overrides,
  });
  return { helper, start: options => (row = bRow(options)) };
}
const settledThenDetached = log => {
  const settled = log.findIndex(([kind]) => kind === 'completion');
  assert(settled >= 0 && log.slice(settled + 1).every(([kind]) => kind === 'detach'), JSON.stringify(log));
  assert.deepEqual(log.slice(settled + 1), [['detach', 'stderr'], ['detach', 'stdout']], 'every capture release follows settlement');
  return log.slice(0, settled);
};
const noResidue = (b, row, timers) => {
  for (const name of ['stdout', 'stderr']) assert.equal(row.child[name].listenerCount('data'), 0, `${name} listener detached`);
  assert.equal(row.clock.active(), 0, 'no lifetime or command deadline armed');
  assert.equal(realTimers(), timers, 'heartbeat interval released');
  assert.equal(b.helper.activeCommandOf(), null, 'emergency target cleared after settlement');
};

test('controlled B command: partial setup failures settle before disposal', async t => {
  const b = await bHelper(t), captureFault = new Error('stderr capture attach failure');
  // A capture attach fault after stdout attached, and the actual deadline refusing 0 after both captures.
  for (const [setup, faults, timeoutMs] of [['capture', { 'stderr-attach': captureFault }, 10000], ['timeout', {}, 0]]) {
    const timers = realTimers(), row = b.start({ faults });
    const outcome = await b.helper.controlledCommand(bPaths, bTask(timeoutMs)).then(value => ({ value }), error => ({ error }));
    const first = row.lifetime.snapshot().firstError;
    if (setup === 'capture') assert.equal(first, captureFault, 'the setup failure reaches the existing lifetime.fail');
    else assert.equal(first.message, 'owned process wait must be positive and finite');
    assertDependentFailure(outcome.error, 'worksite command failed; dependent work stopped: ', first);
    assert.deepEqual(settledThenDetached(row.log), [['signal', 'SIGKILL']], `${setup}: finite cleanup requested before any wait`);
    noResidue(b, row, timers);
  }
});

test('controlled B command: interruption settles before capture disposal', async t => {
  const b = await bHelper(t);
  for (const ending of ['interrupt', 'direct exit']) {
    const timers = realTimers(), row = b.start();
    let caught = false, observed;
    const value = await b.helper.runHelperProgram(Effect.gen(function* () {
      const fiber = yield* Effect.fork(b.helper.controlledCommandEffect(bPaths, bTask()));
      yield* Effect.promise(() => row.ready);
      const chunk = Buffer.from('before-exit');
      row.child.stdout.emit('data', chunk); chunk.fill(0);
      if (ending === 'interrupt') yield* Fiber.interrupt(fiber);
      else row.end(0, () => row.child.stdout.emit('data', Buffer.from('after-exit')));
      return yield* Fiber.join(fiber);
    })).catch(error => { caught = true; observed = error; });
    if (ending === 'interrupt') {
      assert.equal(caught, true, 'interruption is not success');
      assert(Cause.isCause(observed) && Cause.isInterruptedOnly(observed), 'the host keeps the actual interruption Cause');
      assert.deepEqual(settledThenDetached(row.log), [['signal', 'SIGTERM']], 'interruption requests finite cleanup first');
      assert.deepEqual(row.lifetime.snapshot().directExit, { status: null, signal: 'SIGTERM' });
    } else {
      assert.equal(caught, false);
      assert.equal(decode(value.stdout), 'before-exit', 'copied bytes before the direct-exit capture cut only');
      assert.equal(value.exitStatus, 0); assert.equal(value.terminationConfirmed, true); assert.deepEqual(value.signalSequence, []);
      assert.deepEqual(settledThenDetached(row.log), []);
    }
    noResidue(b, row, timers);
  }
});

test('controlled B command: primary use and cleanup-only failures retain exact outcomes', async t => {
  const b = await bHelper(t), first = new Error('primary command failure');
  const stdoutFault = new Error('stdout release fault'), stderrFault = new Error('stderr release fault');
  for (const [name, primary, faults, releaseOrder] of [
    ['primary use with a secondary release fault', first, { 'stdout-detach': stdoutFault }, [stdoutFault]],
    ['cleanup-only Error', null, { 'stdout-detach': stdoutFault }, [stdoutFault]],
    ['cleanup-only undefined', null, { 'stdout-detach': undefined }, [undefined]],
    ['two cleanup faults', null, { 'stdout-detach': stdoutFault, 'stderr-detach': stderrFault }, [stderrFault, stdoutFault]],
  ]) {
    const row = b.start({ faults }), scopes = [];
    let caught = false, observed;
    const pending = b.helper.controlledCommand({ ...bPaths, closed: (used, closed) => scopes.push({ used, closed }) }, bTask())
      .catch(error => { caught = true; observed = error; });
    await row.ready;
    if (primary !== null) row.lifetime.fail(primary); else row.end(0);
    await pending;
    assert.equal(caught, true, `${name}: failure present whatever its value`);
    assert.equal(scopes.length, 1); const [{ used, closed }] = scopes;
    settledThenDetached(row.log);
    // The closed Scope keeps every release fault, in release order, as a defect.
    assert(Exit.isFailure(closed)); assert.equal([...Cause.failures(closed.cause)].length, 0);
    const defects = [...Cause.defects(closed.cause)];
    assert.equal(defects.length, releaseOrder.length); defects.forEach((defect, index) => assert(Object.is(defect, releaseOrder[index]), name));
    if (primary !== null) {
      assert(Exit.isFailure(used)); assert.equal([...Cause.defects(used.cause)].length, 0);
      const failures = [...Cause.failures(used.cause)];
      assert(failures.length === 1 && Object.is(failures[0], observed), 'the identical primary use failure is the outcome');
      assertDependentFailure(observed, 'worksite command failed; dependent work stopped: ', first);
    } else {
      assert(Exit.isSuccess(used));
      assert(Object.is(observed, releaseOrder[0]), `${name}: the first release fault in release order is the outcome`);
    }
    assert.equal(b.helper.activeCommandOf(), null); assert.equal(row.clock.active(), 0);
  }
});

test('controlled B helper: raw failures survive actual lifts and host projection', async t => {
  const b = await bHelper(t);
  const preflight = (admit, calls) => b.helper.controlledMain({ admit,
    observations: async () => { calls.push('observations'); return []; }, inventory: async () => { calls.push('inventory'); return []; },
    snapshot: async () => { calls.push('snapshot'); return {}; }, command: async () => { calls.push('command'); },
    predicate: async () => { calls.push('predicate'); }, delta: () => { calls.push('delta'); return []; },
    publish: async () => { calls.push('publication'); } });
  for (const value of [new Error('raw error'), { raw: 'object' }, 'raw string', null, false, undefined]) {
    for (const lift of ['promise rejection', 'synchronous invocation throw', 'synchronous spawn throw', 'release defect']) {
      const calls = [];
      let pending;
      if (lift === 'promise rejection') pending = preflight(() => Promise.reject(value), calls);
      else if (lift === 'synchronous invocation throw') pending = preflight(() => { throw value; }, calls);
      else if (lift === 'synchronous spawn throw') {
        b.start({ spawned: () => { throw value; } }); pending = b.helper.controlledCommand(bPaths, bTask());
      } else {
        const row = b.start({ faults: { 'stdout-detach': value } });
        pending = b.helper.controlledCommand(bPaths, bTask()); await row.ready; row.end(0);
      }
      let caught = false, observed;
      try { await pending; } catch (error) { caught = true; observed = error; }
      assert.equal(caught, true, `${lift}: failure present whatever its value`);
      assert(Object.is(observed, value), `${lift}: the exact raw value, never a wrapper`);
      assert.deepEqual(calls, [], 'a preflight failure launches and publishes nothing');
      assert.equal(b.helper.activeCommandOf(), null);
    }
  }
  // API counterexamples, not observed helper Causes: sequential order, not a
  // preferred category, selects the raw value; a parallel Cause has none.
  const primary = new Error('primary defect'), secondary = new Error('secondary failure');
  for (const [shape, cause] of [['sequential', Cause.sequential(Cause.die(primary), Cause.fail(secondary))],
    ['parallel', Cause.parallel(Cause.fail(primary), Cause.fail(secondary))]]) {
    let caught = false, observed;
    try { await b.helper.runHelperProgram(Effect.failCause(cause)); } catch (error) { caught = true; observed = error; }
    assert.equal(caught, true, shape);
    if (shape === 'sequential') assert(Object.is(observed, primary), 'no category-priority squash');
    else assert(Cause.isCause(observed) && !(observed instanceof Error), 'an ambiguous Cause stays a Cause');
  }
});

// D15 through main: the injected constructor stands in for Product artifact
// construction; every helper step, lift, command and the drain are actual.
const bArtifact = log => ({ '../product/worksite_command_execution.js': { constructWorksiteExecutionHelperArtifact: input => {
  log.push(['artifact', input]); return { artifactRef: 'artifact://b-selected', artifactDigest: 'sha256:' + '6'.repeat(64) };
} } });
const bMain = (log, overrides) => ({
  admit: async () => ({ task: bTask(), sandboxRoot: '/controlled-sandbox', artifactPath: '/controlled-artifact',
    manifest: { attemptRef: 'attempt://selected', archiveRoot: '/controlled-archive' } }),
  observations: async () => { log.push(['observations']); return []; }, inventory: async () => { log.push(['inventory']); return []; },
  snapshot: async () => ({ snapshotRef: 'snapshot://b', snapshotDigest: 'sha256:' + '7'.repeat(64), snapshotMembers: [] }),
  predicate: async () => assert.fail('no predicate after a command failure'), delta: () => [],
  publish: async (path, bytes) => { log.push(['publication', path, JSON.parse(bytes)]); },
  path: async (root, path, kind) => { log.push(['path', root, path, kind]); return path; },
  ...bPaths, ...overrides,
});

test('controlled B helper: command failure reaches artifact and drained acknowledgment', async t => {
  const log = [], scopes = [], b = await bHelper(t, bArtifact(log));
  const first = new Error('primary command failure'), releaseFault = new Error('secondary release fault');
  const row = b.start({ faults: { 'stdout-detach': releaseFault } });
  let drain, notifyWritten, caught = false, observed;
  const written = new Promise(resolveWritten => { notifyWritten = resolveWritten; });
  const output = { write: (line, callback) => {
    log.push(['acknowledgment', JSON.parse(line)]); drain = () => { log.push(['drained']); callback(); }; notifyWritten(); return true;
  } };
  const outcome = b.helper.controlledMain(bMain(log, { output, closed: (used, closed) => scopes.push({ used, closed }) }))
    .catch(error => { caught = true; observed = error; log.push(['rejected']); });
  await row.ready; row.lifetime.fail(first);
  await Promise.race([written, outcome]);
  await new Promise(resolveTurn => setImmediate(resolveTurn));
  assert.equal(caught, false, 'no rethrow before the acknowledgment drains'); assert(drain, 'acknowledgment written');
  drain(); await outcome;
  assert.equal(caught, true);
  assertDependentFailure(observed, 'worksite command failed; dependent work stopped: ', first);
  assert.equal(scopes.length, 1); const [{ used, closed }] = scopes;
  const failures = [...Cause.failures(used.cause)], defects = [...Cause.defects(closed.cause)];
  assert(failures.length === 1 && Object.is(failures[0], observed), 'the identical command failure was retained');
  assert(defects.length === 1 && Object.is(defects[0], releaseFault), 'the secondary release fault stays in the closed Scope');
  assert.deepEqual(log.map(([kind]) => kind), ['observations', 'inventory', 'inventory', 'observations', 'inventory', 'inventory',
    'artifact', 'publication', 'path', 'acknowledgment', 'drained', 'rejected']);
  const artifact = log.find(([kind]) => kind === 'artifact')[1];
  assert.equal(artifact.disposition, 'failure'); assert.deepEqual(artifact.commandResults, []);
  assert.deepEqual(artifact.failure, { ...observed.subject, attemptRef: 'attempt://selected' });
  assert.equal(artifact.failure.processFacts.firstError.message, first.message);
  assert.deepEqual(log.find(([kind]) => kind === 'publication').slice(1),
    ['/controlled-artifact', { artifactDigest: 'sha256:' + '6'.repeat(64), artifactRef: 'artifact://b-selected' }]);
  assert.deepEqual(log.find(([kind]) => kind === 'path').slice(1), ['/controlled-archive', '/controlled-artifact', 'file']);
  const acknowledgment = log.find(([kind]) => kind === 'acknowledgment')[1];
  assert.equal(acknowledgment.helperArtifactRef, 'artifact://b-selected'); assert.equal(acknowledgment.attemptRef, 'attempt://selected');
});

test('controlled B helper: later publication path and acknowledgment failures retain precedence', async t => {
  const log = [], b = await bHelper(t, bArtifact(log));
  const steps = ['observations', 'inventory', 'inventory', 'command', 'observations', 'inventory', 'inventory',
    'artifact', 'publication', 'path', 'acknowledgment'];
  for (const [stage, later, through] of [
    ['after observation', new Error('after observation refused'), 5], ['after inventory', 'after inventory refused', 6],
    ['publication', null, 9], ['path validation', undefined, 10],
    ['acknowledgment', Object.assign(new Error('write EPIPE'), { code: 'EPIPE' }), 11], ['none', null, 11],
  ]) {
    log.length = 0;
    const retained = new b.helper.WorksiteHelperFailure('worksite command failed; dependent work stopped', { stage },
      { failureClass: 'command_failed', taskRef: 'task://b-command', attemptRef: null });
    const count = kind => log.filter(([logged]) => logged === kind).length;
    const fail = (at, selected = true) => { if (stage === at && selected) throw later; };
    let caught = false, observed;
    await b.helper.controlledMain(bMain(log, {
      command: async () => { log.push(['command']); throw retained; },
      observations: async () => { log.push(['observations']); fail('after observation', count('observations') === 2); return []; },
      inventory: async () => { log.push(['inventory']); fail('after inventory', count('inventory') === 3); return []; },
      publish: async () => { log.push(['publication']); fail('publication'); },
      path: async () => { log.push(['path']); fail('path validation'); },
      output: { write: (_line, callback) => { log.push(['acknowledgment']); callback(stage === 'acknowledgment' ? later : null); return true; } },
    })).catch(error => { caught = true; observed = error; });
    assert.equal(caught, true, stage);
    assert(Object.is(observed, stage === 'none' ? retained : later), `${stage}: the later exact failure supersedes the retained one`);
    assert.deepEqual(log.map(([kind]) => kind), steps.slice(0, through), `${stage}: nothing later runs`);
  }
});

test('physical lifetime: actual direct exit, stdio close, disposal and group absence are separately observed', { timeout: 5000 }, async t => {
  const child = spawn(process.execPath, ['-e', 'process.stdout.write("actual-output")'], { detached: process.platform !== 'win32', stdio: ['pipe', 'pipe', 'pipe'] });
  t.after(() => { if (alive(process.platform === 'win32' ? child.pid : -child.pid)) { try { process.platform === 'win32' ? child.kill('SIGKILL') : process.kill(-child.pid, 'SIGKILL'); } catch (error) { if (error.code !== 'ESRCH') throw error; } } });
  const lifetime = createOwnedProcessLifetime(child, { terminationGraceMs: 120 });
  let stdout = ''; child.stdout.on('data', chunk => { stdout += chunk; });
  const facts = await lifetime.completion;
  assert.deepEqual(facts.directExit, { status: 0, signal: null }); assert.equal(stdout, 'actual-output');
  assert.equal(facts.closeObserved, true); assert.equal(facts.streamsDisposed, true); assert.equal(facts.scopeAbsence, 'absent');
  assert.equal(facts.firstError, null); assert.equal(child.eventNames().filter(name => ['spawn','error','exit','close'].includes(name)).length, 0);
  t.diagnostic(JSON.stringify({ scope: facts.scopeKind, probes: facts.probeCount, signals: facts.signalAttempts,
    cleanupMs: facts.cleanupElapsedMs, closeObserved: facts.closeObserved, bufferedBytes: Buffer.byteLength(stdout) }));
});

// Physical populations add one explicit prospective setup allowance to the
// original behavior margins: finite supported-test provisioning, not an
// observed startup bound. Owner clocks still start at spawn; nothing is
// rebased, renewed, retried or skipped. SETUP_MS covers one cold Node with its
// ps and PID/port publication; CAPTURE_SETUP_MS two cold Nodes and the leader's
// 5ms ready poll. Controlled cases keep the declaration defaults.
const SETUP_MS = 5_000, CAPTURE_SETUP_MS = 2 * SETUP_MS + 5, ADMINISTRATIVE_MS = 5_000;
const cleanupMs = grace => 2 * grace + Math.min(grace, 250);
// HTTP launch 5600, request 5300, grace 120.
const PHYSICAL_HTTP = { launchMs: SETUP_MS + 600, requestMs: SETUP_MS + 300, graceMs: 120 };
// Capture worker inactivity 11005 and absolute 12005, command and HTTP launch
// 11005, HTTP request 10305, grace 150.
const PHYSICAL_CAPTURE = { inactivityMs: CAPTURE_SETUP_MS + 1000, absoluteMs: CAPTURE_SETUP_MS + 2000,
  launchMs: CAPTURE_SETUP_MS + 1000, requestMs: CAPTURE_SETUP_MS + 300, graceMs: 150 };
const PHYSICAL_HTTP_MODES = ['response', 'invalid', 'missing', 'request-failure', 'owner-error'];
const HTTP_MODE_CEILING_MS = PHYSICAL_HTTP.launchMs + PHYSICAL_HTTP.requestMs + cleanupMs(PHYSICAL_HTTP.graceMs);
const CAPTURE_CEILING_MS = {
  worker: PHYSICAL_CAPTURE.absoluteMs + cleanupMs(PHYSICAL_CAPTURE.graceMs),
  command: PHYSICAL_CAPTURE.launchMs + cleanupMs(PHYSICAL_CAPTURE.graceMs),
  http: PHYSICAL_CAPTURE.launchMs + PHYSICAL_CAPTURE.requestMs + cleanupMs(PHYSICAL_CAPTURE.graceMs),
};
// Serial population ceilings plus a separate file/setup/diagnostic allowance,
// rounded up to the second: HTTP 62000, capture 51000.
const testCapMs = ceilings => Math.ceil((ADMINISTRATIVE_MS + ceilings.reduce((sum, ms) => sum + ms, 0)) / 1000) * 1000;
const HTTP_TEST_CAP_MS = testCapMs(PHYSICAL_HTTP_MODES.map(() => HTTP_MODE_CEILING_MS));
const CAPTURE_TEST_CAP_MS = testCapMs(Object.values(CAPTURE_CEILING_MS));

// Observation-only physical evidence in parent monotonic milliseconds from the
// case start; child clocks are never compared with it. The test-owned observer
// (support/t287-publication-observer.mjs) reads only files the fixtures
// publish, credits a read only when it settles unsealed and strictly before the
// explicit setup cutoff, seals once at owner return or that cutoff without
// awaiting a pending read, and touches no owner clock, ChildProcess, callback
// or capture. The owner's settle instant and original result/error are taken
// before the observation stops.
const sinceMs = (start, at = performance.now()) => Math.round((at - start) * 1000) / 1000;
const publishedText = path => readFile(path, 'utf8').then(bytes => bytes === '' ? null : bytes);
const publishedJson = path => publishedText(path).then(bytes => bytes === null ? null : JSON.parse(bytes));
// Returns the original ChildProcess unchanged; records only the parent
// monotonic time at which spawn returned and the actual child PID.
function spawnObserver() {
  const observer = { last: null, spawn: (...args) => {
    const child = spawn(...args); observer.last = { at: performance.now(), pid: child.pid ?? null }; return child;
  } };
  return observer;
}
function physicalFacts(start, spawned, readiness, ownerReturnMs, absenceCheckMs, bounds) {
  const launched = spawned === null ? null : { atMs: sinceMs(start, spawned.at), pid: spawned.pid };
  return { bounds, spawn: launched, readiness, spawnToPublicationMs: launched === null ? null : Object.fromEntries(
    Object.entries(readiness.observed).map(([name, row]) => [name, Math.round((row.atMs - launched.atMs) * 1000) / 1000])),
  ownerReturnMs, absenceCheckMs };
}

test('physical HTTP owner: response, invalid/missing port, failed request and exceptional owner path finalize', { timeout: HTTP_TEST_CAP_MS }, async t => {
  const spawns = spawnObserver();
  const root = await scratch(t), helper = await helperModule(t, false, { 'node:child_process': { spawn: spawns.spawn } });
  for (const mode of PHYSICAL_HTTP_MODES) {
    const file = join(root, `${mode}.mjs`), pidFile = join(root, `${mode}.pid`);
    await writeFile(file, `import {writeFileSync} from 'node:fs'; import http from 'node:http'; import {execFileSync} from 'node:child_process';
      writeFileSync(${JSON.stringify(pidFile)},JSON.stringify({pid:process.pid,pgid:process.platform==='win32'?null:Number(execFileSync('/bin/ps',['-o','pgid=','-p',String(process.pid)],{encoding:'utf8'}).trim())}));
      ${mode === 'response' ? `const server=http.createServer((q,r)=>{r.setHeader('Connection','close');r.once('finish',()=>server.close());r.end('actual-http');});server.listen(0,'127.0.0.1',()=>writeFileSync(process.argv[2],String(server.address().port),{flag:'wx'}));`
        : `${mode === 'missing' ? '' : `writeFileSync(process.argv[2],${JSON.stringify(mode === 'invalid' ? 'invalid' : '1')},{flag:'wx'});`}setInterval(()=>{},1000);`}`);
    let identity = null;
    t.after(() => { if (identity !== null) {
      const scope = process.platform === 'win32' ? identity.pid : -identity.pgid;
      try { if (alive(scope)) process.kill(scope, 'SIGKILL'); } catch (error) { if (error.code !== 'ESRCH') throw error; }
    } });
    const declaration = await httpInput(file, `${mode}.port`, { timeoutMs: PHYSICAL_HTTP.launchMs, terminationGraceMs: PHYSICAL_HTTP.graceMs },
      { timeoutMs: PHYSICAL_HTTP.requestMs });
    if (mode === 'owner-error') declaration.request.method = 'bad\nmethod';
    let identityFailure = null;
    spawns.last = null; const start = performance.now();
    const owned = await observeOwnerCall(start, SETUP_MS,
      { identity: () => publishedJson(pidFile), port: () => publishedText(join(root, `${mode}.port`)) },
      () => helper.runHttpProbe({ taskRef: `task://physical-http/${mode}`, taskDigest: 'sha256:' + '3'.repeat(64) }, root, declaration));
    const { result, failure, ownerReturnMs, readiness } = owned;
    // A missing PID observation must not erase the owner's caught result or error.
    try { identity = JSON.parse(await readFile(pidFile, 'utf8')); } catch (error) { identityFailure = error; }
    const scope = identity === null ? null : process.platform === 'win32' ? identity.pid : -identity.pgid;
    const scopeAbsent = scope === null ? null : !alive(scope);
    const physical = physicalFacts(start, spawns.last, readiness, ownerReturnMs, sinceMs(start),
      { ...PHYSICAL_HTTP, ceilingMs: HTTP_MODE_CEILING_MS });
    t.diagnostic(JSON.stringify({ owner: 'http', mode, fixtureRoot: root, ...identity, scopeAbsent, physical,
      identityFailure: identityFailure === null ? null : { name: identityFailure.name, code: identityFailure.code ?? null, message: identityFailure.message },
      stdout: result?.process ? decode(result.process.stdout) : null, stderr: result?.process ? decode(result.process.stderr) : null,
      observation: result, failure: failure === null ? null : { name: failure.name, code: failure.code ?? null, message: failure.message, stack: failure.stack ?? null } }));
    retainEvidence(t, 't287-owned-process-lifetime', `physical-http-${mode}`, { owner: 'http', mode, identity, scopeAbsent, physical,
      threw: owned.threw, failure: failureFact(failure), observation: result, identityFailure: failureFact(identityFailure) });
    if (identityFailure !== null) throw identityFailure;
    assert.equal(scopeAbsent, true, 'owned scope absent before next case');
    assert.equal(physical.spawn?.pid, identity.pid, 'published PID is the spawned owned child');
    if (process.platform !== 'win32') assert.equal(identity.pgid, identity.pid, 'actual detached owned process group');
    if (mode === 'owner-error') {
      assert.notEqual(failure, null);
      assertDependentFailure(failure, 'worksite HTTP probe failed; dependent work stopped: ',
        /HTTP token|valid HTTP token|ERR_INVALID_HTTP_TOKEN/u);
    } else {
      assert.equal(failure, null);
      assert.equal(result.process.terminationConfirmed, true); assert.equal(result.process.timedOut, mode === 'request-failure');
      if (mode === 'response') { assert.equal(result.response.body, 'actual-http'); assert.equal(result.portFile.state, 'observed'); }
      else if (mode === 'invalid') assert.equal(result.portFile.issue, 'noncanonical_decimal_port');
      else if (mode === 'missing') assert.equal(result.portFile.issue, 'port_file_timeout');
      else assert.equal(result.response, null);
    }
  }
});

test('physical owner capture: finite inherited-pipe late output stays HTTP diagnostic and never worker/command result', { skip: process.platform === 'win32' && 'win32 platform: owned POSIX process groups and inherited pipes are unavailable', timeout: CAPTURE_TEST_CAP_MS }, async t => {
  const spawns = spawnObserver();
  const root = await scratch(t), helper = await helperModule(t, false, { 'node:child_process': { spawn: spawns.spawn } });
  const { constructKnownWorkerTransportContract } = await load('abg/transport_contracts');
  const { runWorkerTransport } = await load('abg/worker_transport');
  for (const owner of ['worker', 'command', 'http']) {
    const leader = join(root, `${owner}-leader.mjs`), descendant = join(root, `${owner}-descendant.mjs`), ready = join(root, `${owner}.ready`);
    // The descendant publishes its actual ps group identity before readiness.
    const identityFile = join(root, `${owner}.identity.json`);
    await writeFile(descendant, `import {writeFileSync} from 'node:fs'; import {execFileSync} from 'node:child_process'; process.on('SIGTERM',()=>setTimeout(()=>process.stdout.write('late-diagnostic\\n',()=>process.exit(0)),35)); writeFileSync(${JSON.stringify(identityFile)},JSON.stringify({pid:process.pid,pgid:Number(execFileSync('/bin/ps',['-o','pgid=','-p',String(process.pid)],{encoding:'utf8'}).trim())})); writeFileSync(${JSON.stringify(ready)},String(process.pid)); setInterval(()=>{},1000);`);
    await writeFile(leader, `import {spawn} from 'node:child_process';import {existsSync} from 'node:fs'; const c=spawn(process.execPath,[${JSON.stringify(descendant)}],{stdio:['ignore','inherit','inherit']});c.unref(); const t=setInterval(()=>{if(existsSync(${JSON.stringify(ready)})){clearInterval(t);process.stdout.write('leader-output\\n',()=>process.exit(0));}},5);`);
    t.after(async () => { try { const pid = Number(await readFile(ready, 'utf8')); if (alive(pid)) process.kill(pid, 'SIGKILL'); } catch (error) { if (!['ESRCH', 'ENOENT'].includes(error.code)) throw error; } });
    spawns.last = null; const start = performance.now();
    const owned = await observeOwnerCall(start, CAPTURE_SETUP_MS, { identity: () => publishedJson(identityFile),
      ready: () => publishedText(ready).then(bytes => bytes === null ? null : Number(bytes)) }, async () => {
      if (owner === 'worker') {
        const result = await runWorkerTransport({ contract: constructKnownWorkerTransportContract('generic', { command: process.execPath, prefixArgs: [leader], environment: {} }),
          prompt: 'capture boundary', lane: 'worker_executes', cwd: root, archiveRoot: join(root, 'archive'), label: owner,
          timeoutMs: PHYSICAL_CAPTURE.inactivityMs, absoluteTimeoutMs: PHYSICAL_CAPTURE.absoluteMs, terminationGraceMs: PHYSICAL_CAPTURE.graceMs, environment: {},
          // The owner's declared process-start observation; it records spawn evidence only.
          observer: { onProcessStarted: pid => { spawns.last = { at: performance.now(), pid }; } } });
        return { observed: result, result, text: result.stdout };
      } else if (owner === 'command') {
        const result = await helper.runCommand({ commands: [{ commandId: 'command://capture', executable: process.execPath, args: [leader],
          relativeCwd: '.', environment: [], timeoutMs: PHYSICAL_CAPTURE.launchMs, terminationGraceMs: PHYSICAL_CAPTURE.graceMs, expectedReports: [] }] }, root, 0);
        return { observed: result, result, text: decode(result.stdout) };
      }
      const observed = await helper.runHttpProbe({}, root, await httpInput(leader, `${owner}.port`,
        { timeoutMs: PHYSICAL_CAPTURE.launchMs, terminationGraceMs: PHYSICAL_CAPTURE.graceMs }, { timeoutMs: PHYSICAL_CAPTURE.requestMs }));
      return { observed, result: observed.process, text: decode(observed.process.stdout) };
    });
    const { failure, ownerReturnMs, readiness } = owned;
    const { observed = null, result, text } = owned.result ?? {};
    // Retain the owner's result or error, readiness and worker archive before assertions or scratch cleanup.
    const readyPid = await readFile(ready, 'utf8').then(Number, error => ({ code: error.code ?? null }));
    const archived = owner !== 'worker' ? null : Object.fromEntries(await Promise.all(['stdout', 'stderr'].map(async name =>
      [name, await readFile(join(root, 'archive', `${owner}-${name}.log`), 'utf8').catch(error => ({ code: error.code ?? null }))])));
    const identity = await publishedJson(identityFile).catch(error => ({ code: error.code ?? null, message: error.message }));
    const group = Number.isSafeInteger(identity?.pgid) && identity.pgid > 1 ? identity.pgid : null;
    const groupAbsent = group === null ? null : !alive(-group);
    const physical = physicalFacts(start, spawns.last, readiness, ownerReturnMs, sinceMs(start),
      { ...PHYSICAL_CAPTURE, ceilingMs: CAPTURE_CEILING_MS[owner] });
    t.diagnostic(JSON.stringify({ owner, fixtureRoot: root, readyPid, descendantAlive: Number.isSafeInteger(readyPid) ? alive(readyPid) : null,
      identity, groupAbsent, physical, stdout: text ?? null, stderr: result === undefined ? null : owner === 'worker' ? result.stderr : decode(result.stderr), archived,
      observation: observed, failure: failure === null ? null : { name: failure.name, code: failure.code ?? null, message: failure.message, stack: failure.stack ?? null } }));
    retainEvidence(t, 't287-owned-process-lifetime', `physical-capture-${owner}`, { owner, readyPid, identity, groupAbsent, physical,
      stdout: text ?? null, archived, threw: owned.threw, failure: failureFact(failure), observation: observed });
    if (owned.threw) throw failure;
    if (owner === 'worker') assert.doesNotMatch(result.finalOutput, /late-diagnostic/u);
    else if (owner === 'http') assert.equal(observed.response, null);
    assert.equal(result.terminationConfirmed, true, `${owner} owned scope absence`);
    assert.match(text, /leader-output/u);
    if (owner === 'http') assert.match(text, /late-diagnostic/u); else assert.doesNotMatch(text, /late-diagnostic/u);
    assert.equal(alive(Number(await readFile(ready, 'utf8'))), false, `${owner} descendant gone before next case`);
    assert.equal(identity?.pid, readyPid, `${owner} published identity is the ready descendant`);
    assert.equal(identity.pgid, physical.spawn?.pid, `${owner} descendant is in the actual owned leader group`);
    assert.equal(groupAbsent, true, `${owner} owned group absent before next case`);
    t.diagnostic(JSON.stringify({ owner, capturedBytes: Buffer.byteLength(text), lateDiagnosticRetained: owner === 'http' }));
  }
});

test('controlled lifetime: both long grace phases and final drain recheck their exact monotonic bounds', async () => {
  const grace = Number.MAX_SAFE_INTEGER;
  const x = controlledLifetime({ grace }); x.lifetime.requestTermination();
  const total = 2n * ns(grace) + ns(250);
  assert.equal(x.lifetime.snapshot().cleanupDeadlineNs, total);
  x.timer.fire(x.timer.arms.find(row => row.delay === MAX).id, ns(MAX));
  assert.deepEqual(x.signals.map(row => row.value), ['SIGTERM']);
  x.timer.fire(x.timer.arms.at(-1).id, ns(grace));
  assert.deepEqual(x.signals.map(row => row.value), ['SIGTERM', 'SIGKILL']);
  const confirmation = x.timer.arms.findLast(row => row.delay === MAX).id;
  x.timer.fire(confirmation, 2n * ns(grace) - 1n);
  assert.equal(x.lifetime.snapshot().streamsDisposed, false);
  x.timer.fire(x.timer.arms.at(-1).id, 2n * ns(grace));
  const drain = x.timer.arms.at(-1).id;
  x.timer.fire(drain, total - 1n); assert.equal(x.lifetime.snapshot().streamsDisposed, false);
  x.timer.fire(x.timer.arms.at(-1).id, total);
  const facts = await x.lifetime.completion;
  assert.equal(facts.cleanupDeadlineNs, total); assert.equal(facts.streamsDisposed, true); assert.equal(facts.drainExpired, true);
});

test('physical lifetime: an escaped finite pipe holder is outside owned-group absence and drain remains bounded', { skip: process.platform === 'win32' && 'win32 platform: detached POSIX process groups are unavailable', timeout: 5000 }, async t => {
  const root = await scratch(t), leaderFile = join(root, 'leader.mjs'), escapedFile = join(root, 'escaped.mjs'), ready = join(root, 'escaped.json');
  await writeFile(escapedFile, `import {writeFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';
    writeFileSync(${JSON.stringify(ready)},JSON.stringify({pid:process.pid,pgid:Number(execFileSync('/bin/ps',['-o','pgid=','-p',String(process.pid)],{encoding:'utf8'}).trim())}));
    setTimeout(()=>process.exit(0),300);`);
  await writeFile(leaderFile, `import {spawn} from 'node:child_process';import {existsSync} from 'node:fs';
    const child=spawn(process.execPath,[${JSON.stringify(escapedFile)}],{detached:true,stdio:['ignore','inherit','inherit']});child.unref();
    const wait=setInterval(()=>{if(existsSync(${JSON.stringify(ready)})){clearInterval(wait);process.stdout.write('before-exit',()=>process.exit(0));}},5);`);
  const child = spawn(process.execPath, [leaderFile], { detached: true, stdio: ['ignore','pipe','pipe'] });
  t.after(async () => { for (const pid of [child.pid, ...await readFile(ready,'utf8').then(bytes=>[JSON.parse(bytes).pid],()=>[])])
    if (alive(-pid)) { try { process.kill(-pid,'SIGKILL'); } catch(error) { if(error.code!=='ESRCH') throw error; } } });
  const lifetime = createOwnedProcessLifetime(child, { terminationGraceMs: 30 });
  let output='';child.stdout.on('data',chunk=>{output+=chunk;});
  const facts=await lifetime.completion, escaped=JSON.parse(await readFile(ready,'utf8'));
  assert.equal(escaped.pgid,escaped.pid);assert.notEqual(escaped.pgid,child.pid);
  assert.equal(facts.scopeAbsence,'absent');assert.equal(facts.directExit.status,0);assert.equal(facts.closeObserved,false);
  assert.equal(facts.streamsDisposed,true);assert.equal(facts.drainExpired,true);assert.equal(output,'before-exit');
  assert.equal(alive(escaped.pid),true,'outside-scope pipe holder still exists at bounded completion');
  for(let i=0;i<80&&alive(escaped.pid);i++) await new Promise(resolve=>setTimeout(resolve,25));
  assert.equal(alive(escaped.pid),false,'finite escaped child physically absent before next case');
  t.diagnostic(JSON.stringify({ownedGroupAbsent:true,escapedGroup:escaped.pgid,closeObserved:facts.closeObserved,
    disposed:facts.streamsDisposed,cleanupMs:facts.cleanupElapsedMs,signals:facts.signalAttempts,probes:facts.probeCount}));
});
