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

async function helperModule(t, control = false, overrides = {}) {
  const path = join(packageRoot, 'build/code/src/implementation/worksite_command_helper.js');
  let source = (await readFile(path, 'utf8')).replace(/^#!.*\n/u, '');
  const suffix = control ? `export async function controlledMain(c) {
    admitLaunchManifest=c.admit; observations=c.observations; filesystemInventory=c.inventory;
    materializeSnapshot=c.snapshot; runCommand=c.command; predicateObservation=c.predicate;
    worksiteDelta=c.delta; publishCreateOnly=c.publish; return main();
  }
  export async function controlledCommand(c, task) {
    confinedExistingPath=c.confinedPath; reportObservation=c.report;
    return runCommand(task, '/controlled', 0, 'attempt://selected');
  }
  export { runHttpProbe };` : 'export { runCommand, runHttpProbe };';
  assert.match(source, /await main\(\);\s*$/u); source = source.replace(/await main\(\);\s*$/u, suffix);
  const previous = new Map(['SIGTERM', 'SIGINT'].map(signal => [signal, process.listeners(signal)]));
  const mod = new SourceTextModule(source, { identifier: path });
  await mod.link(async specifier => {
    const imported = { ...await import(specifier.startsWith('node:') ? specifier : pathToFileURL(resolve(dirname(path), specifier)).href) };
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

test('controlled command continuation: unresolved cleanup stops before expected-report reads and preserves first error', async t => {
  for (const ownerFailure of [false, true]) {
    const clock = controlledClock(), child = new EventEmitter(), first = new Error('first report-owner failure');
    child.pid = 321;
    for (const name of ['stdin', 'stdout', 'stderr']) {
      child[name] = new EventEmitter(); child[name].destroy = () => {};
    }
    let lifetime, reports = 0;
    const helper = await helperModule(t, true, {
      'node:child_process': { spawn: () => child },
      '../shared/owned_process_lifetime.js': {
        createOwnedProcessLifetime: (process, bounds, observations) => lifetime = createOwnedProcessLifetime(process, {
          ...bounds, host: { clock: clock.clock, platform: 'posix', probeGroup: () => 'unknown', signal: () => {} },
        }, observations),
      },
    });
    const task = { taskRef: 'task://selected', taskDigest: 'sha256:' + '1'.repeat(64), commands: [{
      ordinal: 0, commandId: 'command://selected', executable: 'controlled', args: [], environment: [],
      relativeCwd: '.', timeoutMs: 10000, terminationGraceMs: 100,
      expectedReports: [{ ordinal: 0, reportIdentity: 'report://forbidden', relativePath: 'report.xml' }],
    }] };
    const result = helper.controlledCommand({ confinedPath: async () => '/controlled',
      report: async () => { reports++; throw new Error('unexpected report filesystem access'); } }, task);
    await Promise.resolve();
    assert(lifetime);
    child.stdout.emit('data', Buffer.from('original stdout'));
    child.stderr.emit('data', Buffer.from('original inner diagnostic'));
    if (ownerFailure) lifetime.fail(first);
    child.emit('exit', 17, 'SIGTERM');
    clock.advance(400);
    await assert.rejects(result, error => {
      if (ownerFailure) assert.equal(error, first);
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
function httpDeclaration(file, port = 'port.txt', overrides = {}) {
  return { launch: { executable: process.execPath, args: [file, '{port_file}'], environment: [], relativeCwd: '.',
    timeoutMs: 600, terminationGraceMs: 120, portFile: { relativePath: port }, ...overrides },
    request: { hostname: '127.0.0.1', method: 'GET', path: '/', timeoutMs: 300 } };
}
async function httpInput(file, port, overrides) {
  const { WORKSITE_COMMAND_EXECUTION_IDS } = await load('product/worksite_command_execution');
  const declaration = httpDeclaration(file, port, overrides);
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
    const task = { taskRef: 'task://stream-failure', commands: [{ commandId: 'command://stream-failure', executable: 'controlled',
      args: [], environment: [], relativeCwd: '.', timeoutMs: 1000, terminationGraceMs: 100, expectedReports: [{}] }] };
    const pending = owner === 'command'
      ? helper.controlledCommand({ confinedPath: async () => root, report: async () => { reports++; } }, task)
      : helper.runHttpProbe({}, root, httpDeclaration('controlled', 'selected.port', { terminationGraceMs: 100 }));
    // Install the rejection observer before the controlled failure is emitted.
    const outcome = pending.then(value => ({ value }), error => ({ error }));
    await started;
    if (owner === 'command') child.stderr.emit('error', first); else await read;
    assert.equal(lifetime.snapshot().firstError, first); assert.equal(lifetime.snapshot().launchFailure, null);
    absent = true; child.emit('exit', null, 'SIGKILL'); child.emit('close');
    const observed = await outcome;
    assert.equal(observed.error, first); assert.equal(reports, 0); assert.equal(requests, 0);
    assert.equal(lifetime.snapshot().scopeAbsence, 'absent'); assert.equal(clock.active(), 0);
    assert.equal(lifetime.snapshot().signalAttempts, 1);
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

test('physical HTTP owner: response, invalid/missing port, failed request and exceptional owner path finalize', { timeout: 10000 }, async t => {
  const root = await scratch(t), helper = await helperModule(t);
  for (const mode of ['response', 'invalid', 'missing', 'request-failure', 'owner-error']) {
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
    const declaration = await httpInput(file, `${mode}.port`);
    if (mode === 'owner-error') declaration.request.method = 'bad\nmethod';
    let result = null, failure = null;
    try { result = await helper.runHttpProbe({}, root, declaration); } catch (error) { failure = error; }
    identity = JSON.parse(await readFile(pidFile, 'utf8'));
    const scope = process.platform === 'win32' ? identity.pid : -identity.pgid, scopeAbsent = !alive(scope);
    t.diagnostic(JSON.stringify({ owner: 'http', mode, fixtureRoot: root, ...identity, scopeAbsent,
      observation: result, failure: failure === null ? null : { name: failure.name, code: failure.code ?? null, message: failure.message } }));
    assert.equal(scopeAbsent, true, 'owned scope absent before next case');
    if (process.platform !== 'win32') assert.equal(identity.pgid, identity.pid, 'actual detached owned process group');
    if (mode === 'owner-error') {
      assert.notEqual(failure, null); assert.match(failure.message, /HTTP token|valid HTTP token|ERR_INVALID_HTTP_TOKEN/u);
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

test('physical owner capture: finite inherited-pipe late output stays HTTP diagnostic and never worker/command result', { skip: process.platform === 'win32', timeout: 10000 }, async t => {
  const root = await scratch(t), helper = await helperModule(t);
  const { constructKnownWorkerTransportContract } = await load('abg/transport_contracts');
  const { runWorkerTransport } = await load('abg/worker_transport');
  for (const owner of ['worker', 'command', 'http']) {
    const leader = join(root, `${owner}-leader.mjs`), descendant = join(root, `${owner}-descendant.mjs`), ready = join(root, `${owner}.ready`);
    await writeFile(descendant, `import {writeFileSync} from 'node:fs'; process.on('SIGTERM',()=>setTimeout(()=>process.stdout.write('late-diagnostic\\n',()=>process.exit(0)),35)); writeFileSync(${JSON.stringify(ready)},String(process.pid)); setInterval(()=>{},1000);`);
    await writeFile(leader, `import {spawn} from 'node:child_process';import {existsSync} from 'node:fs'; const c=spawn(process.execPath,[${JSON.stringify(descendant)}],{stdio:['ignore','inherit','inherit']});c.unref(); const t=setInterval(()=>{if(existsSync(${JSON.stringify(ready)})){clearInterval(t);process.stdout.write('leader-output\\n',()=>process.exit(0));}},5);`);
    t.after(async () => { try { const pid = Number(await readFile(ready, 'utf8')); if (alive(pid)) process.kill(pid, 'SIGKILL'); } catch (error) { if (!['ESRCH', 'ENOENT'].includes(error.code)) throw error; } });
    let result, text;
    if (owner === 'worker') {
      result = await runWorkerTransport({ contract: constructKnownWorkerTransportContract('generic', { command: process.execPath, prefixArgs: [leader], environment: {} }),
        prompt: 'capture boundary', lane: 'worker_executes', cwd: root, archiveRoot: join(root, 'archive'), label: owner,
        timeoutMs: 1000, absoluteTimeoutMs: 2000, terminationGraceMs: 150, environment: {} }); text = result.stdout;
      assert.doesNotMatch(result.finalOutput, /late-diagnostic/u);
    } else if (owner === 'command') {
      result = await helper.runCommand({ commands: [{ commandId: 'command://capture', executable: process.execPath, args: [leader],
        relativeCwd: '.', environment: [], timeoutMs: 1000, terminationGraceMs: 150, expectedReports: [] }] }, root, 0); text = decode(result.stdout);
    } else {
      const probe = await helper.runHttpProbe({}, root, await httpInput(leader, `${owner}.port`, { timeoutMs: 1000, terminationGraceMs: 150 }));
      result = probe.process; text = decode(result.stdout); assert.equal(probe.response, null);
    }
    assert.equal(result.terminationConfirmed, true, `${owner} owned scope absence`);
    assert.match(text, /leader-output/u);
    if (owner === 'http') assert.match(text, /late-diagnostic/u); else assert.doesNotMatch(text, /late-diagnostic/u);
    assert.equal(alive(Number(await readFile(ready, 'utf8'))), false, `${owner} descendant gone before next case`);
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

test('physical lifetime: an escaped finite pipe holder is outside owned-group absence and drain remains bounded', { skip: process.platform === 'win32', timeout: 5000 }, async t => {
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
