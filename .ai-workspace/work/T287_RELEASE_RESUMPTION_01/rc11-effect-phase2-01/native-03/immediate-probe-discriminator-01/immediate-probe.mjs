import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
const [bindingPath, bindingSha, mode] = process.argv.slice(2);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const bytes = readFileSync(bindingPath); assert.equal(hash(bytes), bindingSha);
const binding = JSON.parse(bytes); assert(mode === 'baseline' || mode === 'candidate');
const selected = binding.subjects[mode];
for (const p of selected.modulePins) {
  const actual = readFileSync(p.path); assert.equal(actual.length, p.bytes); assert.equal(hash(actual), p.sha256);
}
const { createOwnedProcessLifetime } = await import(pathToFileURL(selected.ownerModule).href);
mkdirSync(selected.outputRoot, { recursive: false });
let now = 0n, nextTimer = 0, hostCalls = 0, disposals = 0, completionFacts = null, completionSettled = false;
const timers = new Map(), trace = [], signals = [];
const clock = {
  nowNs: () => now,
  arm: (callback, delayMs) => {
    assert(Number.isInteger(delayMs) && delayMs > 0 && delayMs <= 2_147_483_647);
    const id = ++nextTimer; timers.set(id, { callback, due: now + BigInt(delayMs) * 1_000_000n, delayMs, active: true }); return id;
  },
  cancel: id => { const timer = timers.get(id); if (timer) timer.active = false; },
};
const child = new EventEmitter(); child.pid = 321;
for (const name of ['stdin', 'stdout', 'stderr']) {
  const stream = new EventEmitter(); stream.closed = false;
  stream.destroy = () => { disposals++; stream.destroyed = true; };
  stream.once('close', () => { stream.closed = true; }); child[name] = stream;
}
const host = {
  clock, platform: 'posix',
  signal: (_child, value) => { const event = { kind: 'signal', value, atNs: now }; signals.push(event); trace.push(event); },
  probeGroup: pid => {
    const ordinal = ++hostCalls; assert(hostCalls <= 200, 'finite fixture probe census');
    trace.push({ kind: 'probe_enter', ordinal, pid, atNs: now });
    if (ordinal === 1) { trace.push({ kind: 'inject_exit', status: 0, signal: null, atNs: now }); child.emit('exit', 0, null); }
    trace.push({ kind: 'probe_return', ordinal, absence: 'present', atNs: now }); return 'present';
  },
};
const lifetime = createOwnedProcessLifetime(child, { terminationGraceMs: 100, host });
lifetime.completion.then(facts => { completionFacts = facts; completionSettled = true; });
let callError = null, cleanupError = null;
try { lifetime.requestTermination('immediate'); } catch (error) { callError = error; }
// Capture this cut before any timer or clock advance. No close event is injected.
const beforeAdvance = {
  atNs: now, facts: lifetime.snapshot(), hostCalls, signals: signals.map(x => ({ ...x })),
  trace: trace.map(x => ({ ...x })), disposals,
  activeTimers: [...timers].filter(([, v]) => v.active).map(([id, v]) => ({ id, dueNs: v.due, delayMs: v.delayMs })),
};
// Finite controlled cleanup uses the owner's existing timers and deadlines unchanged.
try {
  const target = 1_000_000_000n;
  for (let step = 0; ; step++) {
    assert(step < 1000, 'finite controlled cleanup steps');
    const due = [...timers].filter(([, v]) => v.active && v.due <= target)
      .sort((a, b) => a[1].due < b[1].due ? -1 : a[1].due > b[1].due ? 1 : a[0] - b[0])[0];
    if (!due) break;
    now = due[1].due; due[1].active = false; due[1].callback();
  }
  now = target;
} catch (error) { cleanupError = error; }
let harnessWait;
const settledWithinBound = await Promise.race([
  lifetime.completion.then(() => true),
  new Promise(resolve => { harnessWait = setTimeout(() => resolve(false), 250); }),
]); clearTimeout(harnessWait);
const observation = {
  mode, owner: selected.modulePins, request: 'immediate', graceMs: 100, injection: 'first probe exit(0,null) only; no close',
  callError, beforeAdvance, cleanupError, completionSettled, settledWithinBound, completionFacts,
  completionFrozen: completionFacts && Object.isFrozen(completionFacts), afterCleanup: lifetime.snapshot(),
  hostCalls, signals, trace, disposals,
  remainingTimers: [...timers].filter(([, v]) => v.active).map(([id, v]) => ({ id, dueNs: v.due })),
  standing: 'Actual imported owner with controlled child/clock/probe/signal. No OS child or OS signal. Immediate cut precedes all clock advances; cleanup facts are separate. No production or qualification claim.',
};
const encode = (_key, value) => typeof value === 'bigint' ? { kind: 'bigint', value: String(value) }
  : value instanceof Error ? { name: value.name, message: value.message, stack: value.stack } : value;
writeFileSync(selected.outputRoot + '/OBSERVATION.json', JSON.stringify(observation, encode, 2) + '\n', { flag: 'wx' });
// Independent immediate-strengthening law; all observations are already durable.
assert.equal(callError, null); assert.equal(cleanupError, null);
assert.equal(settledWithinBound, true); assert.equal(completionSettled, true);
assert.equal(beforeAdvance.atNs, 0n);
assert(beforeAdvance.signals.some(x => x.value === 'SIGKILL'), 'KILL requested before the outer immediate call returns');
assert(beforeAdvance.facts.cleanupDeadlineNs !== null && beforeAdvance.facts.cleanupDeadlineNs <= 200_000_000n,
  'immediate cleanup bound no later than 200ms');
assert.deepEqual(observation.remainingTimers, []);
console.log(JSON.stringify({ status: 'PASS', mode, immediateSignals: beforeAdvance.signals.map(x => x.value) }));
