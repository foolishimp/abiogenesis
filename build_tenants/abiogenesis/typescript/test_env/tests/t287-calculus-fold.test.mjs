// T-287 step 6: the pure Event Calculus fold, ROOT_DERIVED_RULES and the
// actor process lifecycle rule, over the built modules.
import assert from 'node:assert/strict';
import test from 'node:test';
import { createU1Fixture, prefixOf } from '../support/t287-native-work-currentness-consumers.mjs';
import { constructRuntimeFluentPattern, emptyFoldState, foldStep, ROOT_DERIVED_RULES } from '../../build/code/src/abg/calculus/index.js';
import { applyClip, applyStep, workingFoldState } from '../../build/code/src/abg/calculus/fold.js';
import { constructRuntimeFluent, deriveRuntimeEventCalculusProjection, eventCalculusDependencies, eventCalculusEffect,
  forkRuntimeEventCalculusAtForModuleTest, runtimeEventCalculusStateForModuleTest } from '../../build/code/src/abg/event_calculus.js';
import { selectValidatedRuntimeEventPrefix, selectOwnedRuntimeEventPrefix, validatedRuntimeEventPrefixThroughEvent,
  runtimeEventAtPrefixIndex, runtimeEventPrefixExtent } from '../../build/code/src/abg/event_prefix.js';
import { projectActorProcessLifecycle } from '../../build/code/src/abg/actor_process.js';

const LIFECYCLE = ['actor_cleanup_pending', 'actor_process_live', 'actor_process_spawn_failed',
  'actor_process_terminated', 'actor_process_termination_unconfirmed'];
const RULE_OWNED = ['actor_cleanup_pending', 'actor_process_live', 'actor_process_terminated',
  'actor_process_termination_unconfirmed'];

function events(prefix) {
  return Array.from({ length: runtimeEventPrefixExtent(prefix).count }, (_, index) => runtimeEventAtPrefixIndex(prefix, index));
}

// The cold fold: from the empty state, foldStep over every event of the cut,
// with the dependencies the class supplies.
function coldFold(cut) {
  let state = emptyFoldState(cut);
  const prior = [];
  for (const event of events(cut)) {
    state = foldStep(state, event, eventCalculusDependencies(cut, event, prior));
    if (cut.kind === 'validated_runtime_event_prefix') prior.push(event);
  }
  return state;
}

const stateView = state => ({ holds: [...state.holds.keys()].sort(),
  clippedFluentRefs: [...state.clippedFluentRefs], declippedPatternRefs: [...state.declippedPatternRefs] });
const projectionView = projection => ({ holds: projection.holds.map(fluent => fluent.fluentRef).sort(),
  clippedFluentRefs: [...projection.clippedFluentRefs], declippedPatternRefs: [...projection.declippedPatternRefs] });

// P-FOLD at every cut: cold fold, the class's project and the warm fork agree.
function assertFoldAgreement(source, label) {
  const rows = events(source);
  for (const row of rows) {
    const cut = validatedRuntimeEventPrefixThroughEvent(source, row.eventId);
    assert.equal(cut.kind, source.kind, `${label}: the cut keeps the prefix kind`);
    const warm = projectionView(deriveRuntimeEventCalculusProjection(cut));
    assert.deepEqual(stateView(coldFold(cut)), warm, `${label}: cold fold equals project at ${row.admissionOrdinal} ${row.kind}`);
    assert.deepEqual(projectionView(forkRuntimeEventCalculusAtForModuleTest(source, cut)), warm,
      `${label}: forkAt equals project at ${row.admissionOrdinal} ${row.kind}`);
  }
  return rows.length;
}

test('P-FOLD: the U1 recorded store folds cold, warm and forked to the same holds at every cut', async t => {
  // createU1Fixture admits start, then termination unconfirmed, the confirmed
  // exit and the actor failure through the actual EventStore.
  const f = await createU1Fixture(t, ['target.txt']);
  f.cause();
  f.exit();
  f.cause('actor_invocation_failed');
  const owned = selectOwnedRuntimeEventPrefix(f.store), validated = prefixOf(f.store.readAll());
  const count = assertFoldAgreement(validated, 'validated');
  assert.equal(assertFoldAgreement(owned, 'owned'), count);
  for (const row of events(owned)) {
    const cut = validatedRuntimeEventPrefixThroughEvent(owned, row.eventId);
    assert.deepEqual(projectionView(forkRuntimeEventCalculusAtForModuleTest(owned, cut, owned)),
      projectionView(deriveRuntimeEventCalculusProjection(owned)), `fork at ${row.admissionOrdinal} advanced to the end equals warm`);
  }
  // The store carries an exit after termination unconfirmed for the same
  // process: the exit initiates terminated given the start, unguarded.
  const ref = name => constructRuntimeFluent({ name, identity: f.processRef }).fluentRef;
  const at = kind => coldFold(validatedRuntimeEventPrefixThroughEvent(owned, events(owned).find(row => row.kind === kind).eventId));
  const unconfirmed = at('actor_process_termination_unconfirmed'), exited = at('actor_process_exited'), end = coldFold(owned);
  assert.deepEqual(['actor_process_live', 'actor_process_termination_unconfirmed', 'actor_cleanup_pending']
    .map(name => unconfirmed.holds.has(ref(name))), [true, true, true], 'S then U: live, unconfirmed, cleanup pending');
  assert.deepEqual(['actor_process_exited', 'actor_process_live', 'actor_process_termination_unconfirmed', 'actor_process_terminated',
    'actor_cleanup_pending'].map(name => exited.holds.has(ref(name))), [true, false, false, true, true],
  'the exit after U ends live and unconfirmed and initiates termination');
  assert.deepEqual(['actor_process_exited', 'actor_process_terminated', 'actor_cleanup_pending'].map(name => end.holds.has(ref(name))),
    [true, true, false], 'the actor terminal completes cleanup');
  t.diagnostic(JSON.stringify({ store: 'createU1Fixture (t287-native-work-currentness-consumers.mjs) + cause, exit, actor failure',
    cuts: count, prefixes: ['validated', 'owned'] }));
});

test('P-FOLD streaming: single-event advances agree with one batched advance and the cold fold at every cut; one owned state', async t => {
  const f = await createU1Fixture(t, ['target.txt']);
  f.cause();
  f.exit();
  f.cause('actor_invocation_failed');
  // Successive cuts of one source share one derivation, so projecting cut 1,
  // 2, ... N of `streaming` advances it one event at a time. `batched` is a
  // separately selected copy of the same rows, advanced once to the end.
  const rows = f.store.readAll(), streaming = prefixOf(rows), batched = prefixOf(rows);
  deriveRuntimeEventCalculusProjection(batched);
  const states = [];
  for (const row of events(streaming)) {
    const cut = validatedRuntimeEventPrefixThroughEvent(streaming, row.eventId);
    const warm = projectionView(deriveRuntimeEventCalculusProjection(cut));
    states.push(runtimeEventCalculusStateForModuleTest(cut));
    assert.deepEqual(warm, projectionView(deriveRuntimeEventCalculusProjection(
      validatedRuntimeEventPrefixThroughEvent(batched, row.eventId))), `streaming equals batched at ${row.admissionOrdinal} ${row.kind}`);
    assert.deepEqual(stateView(coldFold(cut)), warm, `streaming equals the cold fold at ${row.admissionOrdinal} ${row.kind}`);
  }
  assert.ok(states.length > 1);
  assert.equal(new Set(states).size, 1, 'the derivation keeps one working state across the advances: no per-advance copy');
  assert.equal(Object.isFrozen(states[0]), false, 'the owned state is the working state, not a frozen copy');
  // The fork is the one copy: it reads the cut and leaves the source's state as it was.
  const middle = validatedRuntimeEventPrefixThroughEvent(streaming, events(streaming)[1].eventId);
  assert.deepEqual(projectionView(forkRuntimeEventCalculusAtForModuleTest(streaming, middle)),
    projectionView(deriveRuntimeEventCalculusProjection(middle)), 'forkAt equals project at the cut');
  assert.equal(runtimeEventCalculusStateForModuleTest(streaming), states[0], 'forking does not replace the source state');
  t.diagnostic(JSON.stringify({ cuts: states.length, ownedStates: new Set(states).size }));
});

const runId = 'run://t287/fold', actorRef = 'actor-invocation://t287/fold', processRef = 'process://t287/fold';
const cCallRef = 'c-call:sha256:t287-fold';
function row(kind, ordinal, aggregateType, aggregateId, parentAggregateId, payload) {
  return Object.freeze({ kind, eventTime: '2026-10-22T00:00:00.000Z', aggregateType, aggregateId, parentAggregateId,
    causationEventRefs: Object.freeze([]), correlationId: 'correlation://t287/fold', workflowVersion: '5.0.0',
    scopeClass: 'run', basisId: 'basis://t287/fold', runId, graphCallId: 'graph-call://t287/fold',
    frameId: 'frame://t287/fold', payload: Object.freeze(payload), eventId: `event://t287/fold/${ordinal}`,
    admissionOrdinal: ordinal, payloadDigest: `sha256:${'0'.repeat(64)}` });
}
const process = { actorInvocationRef: actorRef, processRef };
const STEP = {
  S: n => row('actor_process_started', n, 'process', processRef, actorRef, process),
  exit: n => row('actor_process_exited', n, 'process', processRef, actorRef, { ...process, status: 0, signal: null }),
  spawnFailed: n => row('actor_process_spawn_failed', n, 'process', processRef, actorRef, process),
  U: n => row('actor_process_termination_unconfirmed', n, 'process', processRef, actorRef, process),
  A: n => row('actor_invocation_failed', n, 'actor_invocation', actorRef, cCallRef, process),
  R: n => row('run_stopped', n, 'run', runId, null, {}),
};

// Expected-effect tables: per step, the lifecycle fluents the step initiates
// and terminates, and the lifecycle fluents that hold after it.
const CASES = [
  { name: 'counterexample A: exit, no actor terminal, then the Run stop',
    steps: [
      ['S', { initiates: ['actor_process_live'], terminates: [], holds: ['actor_process_live'] }],
      ['exit', { initiates: ['actor_cleanup_pending', 'actor_process_terminated'], terminates: ['actor_process_live'],
        holds: ['actor_cleanup_pending', 'actor_process_terminated'] }],
      ['R', { initiates: [], terminates: [], holds: ['actor_cleanup_pending', 'actor_process_terminated'] }],
    ],
    actor: { processLive: false, terminationUnconfirmed: false, cleanupPending: true, cleanupDisposition: 'pending' } },
  { name: 'counterexample B: no exit, then the Run stop',
    steps: [
      ['S', { initiates: ['actor_process_live'], terminates: [], holds: ['actor_process_live'] }],
      ['R', { initiates: ['actor_cleanup_pending'], terminates: [], holds: ['actor_cleanup_pending', 'actor_process_live'] }],
    ],
    actor: { processLive: true, terminationUnconfirmed: false, cleanupPending: true, cleanupDisposition: 'pending' } },
  { name: 'negative: spawn failure without start, then the actor terminal',
    steps: [
      ['spawnFailed', { initiates: ['actor_cleanup_pending', 'actor_process_spawn_failed'], terminates: ['actor_process_live'],
        holds: ['actor_cleanup_pending', 'actor_process_spawn_failed'] }],
      ['A', { initiates: [], terminates: ['actor_cleanup_pending'], holds: ['actor_process_spawn_failed'] }],
    ],
    actor: { processLive: false, terminationUnconfirmed: false, cleanupPending: false, cleanupDisposition: 'complete' } },
  { name: 'late confirmation: termination unconfirmed, then an exit',
    steps: [
      ['S', { initiates: ['actor_process_live'], terminates: [], holds: ['actor_process_live'] }],
      ['U', { initiates: ['actor_cleanup_pending', 'actor_process_termination_unconfirmed'], terminates: [],
        holds: ['actor_cleanup_pending', 'actor_process_live', 'actor_process_termination_unconfirmed'] }],
      ['exit', { initiates: ['actor_cleanup_pending', 'actor_process_terminated'],
        terminates: ['actor_process_live', 'actor_process_termination_unconfirmed'],
        holds: ['actor_cleanup_pending', 'actor_process_terminated'] }],
    ],
    actor: { processLive: false, terminationUnconfirmed: false, cleanupPending: true, cleanupDisposition: 'pending' } },
];

const lifecycleNames = fluents => fluents.filter(fluent => LIFECYCLE.includes(fluent.name) && fluent.identity === processRef)
  .map(fluent => fluent.name).sort();

for (const scenario of CASES) {
  test(`P-LIFECYCLE ${scenario.name}`, () => {
    const rows = scenario.steps.map(([step], index) => STEP[step](index + 1));
    const prefix = selectValidatedRuntimeEventPrefix(Object.freeze(rows));
    let state = emptyFoldState(prefix);
    scenario.steps.forEach(([step, expected], index) => {
      state = foldStep(state, rows[index], rows.slice(0, index));
      assert.deepEqual({
        initiates: lifecycleNames(state.transition.effect.initiates),
        terminates: lifecycleNames(state.transition.effect.terminates),
        holds: lifecycleNames([...state.holds.values()]),
      }, expected, `${scenario.name}: after ${step}`);
      const cut = validatedRuntimeEventPrefixThroughEvent(prefix, rows[index].eventId);
      assert.deepEqual(stateView(state), projectionView(deriveRuntimeEventCalculusProjection(cut)), `${step}: fold equals project`);
    });
    const { processLive, terminationUnconfirmed, cleanupPending, cleanupDisposition } = projectActorProcessLifecycle(prefix, actorRef);
    assert.deepEqual({ processLive, terminationUnconfirmed, cleanupPending, cleanupDisposition }, scenario.actor,
      'the actor projection reads the rule through holdsAt');
  });
}

test('one producer: only actor_process_lifecycle initiates or terminates the four rule-owned fluents', () => {
  assert.deepEqual(ROOT_DERIVED_RULES.map(rule => rule.ruleRef),
    ['terminal_run_census', 'process_cleanup', 'liveness', 'actor_process_lifecycle']);
  assert.ok(Object.isFrozen(ROOT_DERIVED_RULES) && ROOT_DERIVED_RULES.every(Object.isFrozen));
  const rows = ['S', 'U', 'exit', 'A', 'R', 'spawnFailed'].map((step, index) => STEP[step](index + 1));
  const prefix = selectValidatedRuntimeEventPrefix(Object.freeze(rows.slice(0, 5)));
  let state = emptyFoldState(prefix);
  rows.forEach((event, index) => {
    const owned = effect => [...effect.initiates, ...effect.terminates].filter(fluent => RULE_OWNED.includes(fluent.name));
    assert.deepEqual(owned(eventCalculusEffect(event, rows.slice(0, index))), [], `the axiom effect of ${event.kind}`);
    for (const rule of ROOT_DERIVED_RULES.filter(rule => rule.ruleRef !== 'actor_process_lifecycle' && rule.appliesTo.includes(event.kind)))
      assert.deepEqual(owned(rule.derive(state, event, rows.slice(0, index))), [], `${rule.ruleRef} on ${event.kind}`);
    if (index < 5) state = foldStep(state, event, rows.slice(0, index));
  });
});

// TD-06: the clip visit counter. `holds` counts every entry an applyStep or
// applyClip visits: each `get` or `has`, and each entry an iteration yields.
class CountingHolds extends Map {
  visits = 0;
  get(key) { this.visits += 1; return super.get(key); }
  has(key) { this.visits += 1; return super.has(key); }
  *entries() { for (const entry of super.entries()) { this.visits += 1; yield entry; } }
  *keys() { for (const [key] of this.entries()) yield key; }
  *values() { for (const [, value] of this.entries()) yield value; }
  [Symbol.iterator]() { return this.entries(); }
  forEach(callback, self) { for (const [key, value] of this.entries()) callback.call(self, value, key, this); }
}
const sha = n => `sha256:${n.toString(16).padStart(64, '0')}`;
const TARGET = sha(0xabc), ABSENT = sha(0xdef), INACTIVITY = 'runtime_inactivity_asserted';
const inactivity = identity => constructRuntimeFluent({ name: INACTIVITY, identity });
// N unrelated held fluents and the target `runtime_inactivity_asserted(TARGET)`
// at position N / 2: stdout fluents keyed by event id, as the native stdout
// producer initiates them, and every fourth one a same-name sibling
// `runtime_inactivity_asserted(other)`. Nothing in code/src initiates
// `runtime_inactivity_asserted`, so a held target exists only by seeding.
function seededWorking(n) {
  const holds = new CountingHolds();
  for (let i = 0; i < n; i += 1) {
    if (i === n / 2) holds.set(inactivity(TARGET).fluentRef, inactivity(TARGET));
    const fluent = i % 4 === 1 ? inactivity(sha(0x10000 + i))
      : constructRuntimeFluent({ name: 'actor_stdout_available', identity: `event://t287/fold/stdout/${i}` });
    holds.set(fluent.fluentRef, fluent);
  }
  holds.visits = 0;
  return { ...workingFoldState(emptyFoldState(null)), holds };
}
// An observed probe of `scopeDigest` outside the root event contract over no
// source prefix: the liveness rule derives nothing, and the axiom effect clips
// `runtime_inactivity_asserted(scopeDigest)` exactly (calculus/axioms.ts).
const probe = scopeDigest => row('runtime_activity_probe_observed', 1, 'frame', 'frame://t287/fold', null, {
  observation: Object.freeze({ kind: 'runtime_probe_observation', schemaVersion: '5.0.0', probeRef: 'probe://t287/fold',
    scopeDigest, clockOriginRef: 'clock://t287/fold', elapsedMs: 1, underlyingObservationRef: 'observation://t287/fold',
    underlyingEventRef: null, sourceDigest: sha(1), sourceRevisionDigest: null, evidenceRefs: Object.freeze([]),
    coverage: 'observed', signal: 'activity' }) });
const transitionView = transition => ({
  fluents: transition.fluents.map(entry => [entry.fluent.fluentRef, entry.held, entry.runId ?? null]),
  clipped: [...transition.clipped],
  effect: { initiates: transition.effect.initiates.map(fluent => fluent.fluentRef),
    terminates: transition.effect.terminates.map(fluent => fluent.fluentRef),
    clips: transition.effect.clips.map(pattern => [pattern.name, pattern.identity]),
    declips: transition.effect.declips.map(pattern => [pattern.name, pattern.identity]) },
});
// The transitions the enumerating fold gave at head cff4f9dcd, before TD-06.
const ref = (name, identity) => constructRuntimeFluent({ name, identity }).fluentRef;
const headTransition = (digest, held) => ({
  fluents: [...(held ? [[ref(INACTIVITY, digest), false, null]] : []),
    [ref('runtime_activity_recent', digest), true, runId], [ref('runtime_invocation_active', digest), true, runId]],
  clipped: held ? [ref(INACTIVITY, digest)] : [],
  effect: { initiates: [ref('runtime_activity_recent', digest), ref('runtime_invocation_active', digest)], terminates: [],
    clips: [[INACTIVITY, digest]], declips: [] },
});

test('TD-06: an exact clip reads its one held fluent; its visits are independent of the unrelated held population', t => {
  const visits = {};
  for (const n of [8, 2048]) {
    const working = seededWorking(n), before = [...working.holds.keys()];
    working.holds.visits = 0;
    const transition = applyStep(working, probe(TARGET), []);
    visits[n] = working.holds.visits;
    assert.deepEqual(transitionView(transition), headTransition(TARGET, true), `N = ${n}: the transition the enumerating fold gave`);
    assert.deepEqual(working.clippedFluentRefs, [ref(INACTIVITY, TARGET)], `N = ${n}: clippedFluentRefs`);
    assert.deepEqual([...working.holds.keys()], [...before.filter(key => key !== ref(INACTIVITY, TARGET)),
      ref('runtime_activity_recent', TARGET), ref('runtime_invocation_active', TARGET)], `N = ${n}: only the target leaves holds`);
  }
  assert.equal(visits[8], visits[2048], 'the exact clip visits a count independent of N');
  assert.ok(visits[8] <= 1, `the exact clip visits at most one entry (${visits[8]})`);
  t.diagnostic(JSON.stringify({ exactVisits: visits }));
});

test('TD-06 negative: a wildcard clip enumerates, its visits grow with N, and it clips every match in held order', t => {
  const visits = {};
  const wildcard = constructRuntimeFluentPattern({ name: INACTIVITY });
  for (const n of [8, 2048]) {
    const working = seededWorking(n), before = [...working.holds.entries()];
    working.holds.visits = 0;
    const fluents = [], clipped = [];
    applyClip(working.holds, wildcard, fluents, clipped);
    visits[n] = working.holds.visits;
    const matches = before.filter(([, fluent]) => fluent.name === INACTIVITY);
    assert.ok(matches.length > 1 && matches.some(([key]) => key === ref(INACTIVITY, TARGET)));
    assert.deepEqual(clipped, matches.map(([key]) => key), `N = ${n}: every match, in held order`);
    assert.deepEqual(fluents, matches.map(([, fluent]) => ({ fluent, held: false })), `N = ${n}: one transition per match`);
    assert.deepEqual([...working.holds.entries()], before.filter(([, fluent]) => fluent.name !== INACTIVITY), `N = ${n}: the rest held`);
  }
  assert.deepEqual(visits, { 8: 9, 2048: 2049 }, 'the wildcard visits every held entry once');
  t.diagnostic(JSON.stringify({ wildcardVisits: visits }));
});

test('TD-06: an exact clip of a fluent not held clips nothing, records nothing and keeps the step effect', t => {
  const visits = {};
  for (const n of [8, 2048]) {
    const working = seededWorking(n), before = [...working.holds.keys()];
    working.holds.visits = 0;
    const transition = applyStep(working, probe(ABSENT), []);
    visits[n] = working.holds.visits;
    assert.deepEqual(transitionView(transition), headTransition(ABSENT, false), `N = ${n}: the transition the enumerating fold gave`);
    assert.deepEqual(working.clippedFluentRefs, [], `N = ${n}: nothing in clippedFluentRefs`);
    assert.deepEqual([...working.holds.keys()], [...before, ref('runtime_activity_recent', ABSENT),
      ref('runtime_invocation_active', ABSENT)], `N = ${n}: every held fluent stays`);
  }
  assert.equal(visits[8], visits[2048]);
  assert.ok(visits[8] <= 1);
  t.diagnostic(JSON.stringify({ absentExactVisits: visits }));
});
