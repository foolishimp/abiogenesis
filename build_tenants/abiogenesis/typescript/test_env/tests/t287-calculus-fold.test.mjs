// T-287 step 6: the pure Event Calculus fold, ROOT_DERIVED_RULES and the
// actor process lifecycle rule, over the built modules.
import assert from 'node:assert/strict';
import test from 'node:test';
import { createU1Fixture, prefixOf } from '../support/t287-native-work-currentness-consumers.mjs';
import { constructRuntimeFluentPattern, emptyFoldState, foldStep, ROOT_DERIVED_RULES } from '../../build/code/src/abg/calculus/index.js';
import { applyClip, applyStep, workingFoldState } from '../../build/code/src/abg/calculus/fold.js';
import { constructRuntimeFluent, deriveRuntimeEventCalculusProjection, deriveRuntimeHeldFluentProjection, eventCalculusDependencies,
  eventCalculusEffect, forkRuntimeEventCalculusAtForModuleTest, holdsAt, runtimeEventCalculusStateForModuleTest,
  runtimeFluentHoldsAtPrefix } from '../../build/code/src/abg/event_calculus.js';
import { selectValidatedRuntimeEventPrefix, selectOwnedRuntimeEventPrefix, validatedRuntimeEventPrefixThroughEvent,
  runtimeEventAtPrefixIndex, runtimeEventPrefixExtent, validatedRuntimeEventPrefixBeforeEvent,
  extendRuntimeEventPlanPrefixForValidation, isValidationRuntimeEventPrefix } from '../../build/code/src/abg/event_prefix.js';
import { projectActorProcessLifecycle } from '../../build/code/src/abg/actor_process.js';

const LIFECYCLE = ['actor_cleanup_pending', 'actor_process_live', 'actor_process_spawn_failed',
  'actor_process_terminated', 'actor_process_termination_unconfirmed'];
const RULE_OWNED = ['actor_cleanup_pending', 'actor_process_live', 'actor_process_terminated',
  'actor_process_termination_unconfirmed'];

function events(prefix) {
  return Array.from({ length: runtimeEventPrefixExtent(prefix).count }, (_, index) => runtimeEventAtPrefixIndex(prefix, index));
}

// The cold fold: from the empty state, foldStep over every event of the cut,
// with the exact dependencies the class reads from the cut before the event.
function coldFold(cut) {
  let state = emptyFoldState(cut);
  for (const event of events(cut)) state = foldStep(state, event, eventCalculusDependencies(cut, event));
  return state;
}

// The reference fold: foldStep over every event of the cut with every prior
// event as its dependencies, and the effect of each step. The exact selection
// must give the same transitions: holds, clipped, declipped and effect rows.
function referenceFold(cut) {
  const rows = events(cut), effects = [];
  let state = emptyFoldState(cut);
  rows.forEach((event, index) => {
    state = foldStep(state, event, rows.slice(0, index));
    effects.push(state.transition.effect);
  });
  return { state, effects };
}

const stateView = state => ({ holds: [...state.holds.keys()].sort(),
  clippedFluentRefs: [...state.clippedFluentRefs], declippedPatternRefs: [...state.declippedPatternRefs] });
const projectionView = projection => ({ holds: projection.holds.map(fluent => fluent.fluentRef).sort(),
  clippedFluentRefs: [...projection.clippedFluentRefs], declippedPatternRefs: [...projection.declippedPatternRefs] });
// The fork law compares the whole projection: the view and every effect row.
const forkView = projection => ({ ...projectionView(projection), effectRows: projection.effectRows });
const rowEffect = ({ kind: _kind, eventKind: _eventKind, sourceEvent: _sourceEvent, ...effect }) => effect;

// P-FOLD at every cut: cold fold, the class's project and the warm fork agree.
function assertFoldAgreement(source, label) {
  const rows = events(source);
  for (const row of rows) {
    const cut = validatedRuntimeEventPrefixThroughEvent(source, row.eventId);
    assert.equal(cut.kind, source.kind, `${label}: the cut keeps the prefix kind`);
    const projection = deriveRuntimeEventCalculusProjection(cut), warm = projectionView(projection);
    assert.deepEqual(stateView(coldFold(cut)), warm, `${label}: cold fold equals project at ${row.admissionOrdinal} ${row.kind}`);
    const reference = referenceFold(cut);
    assert.deepEqual(stateView(reference.state), warm, `${label}: the fold over every prior event equals project at ${row.admissionOrdinal} ${row.kind}`);
    assert.deepEqual(reference.effects, projection.effectRows.map(rowEffect),
      `${label}: the exact dependencies give the effect rows of every prior event at ${row.admissionOrdinal} ${row.kind}`);
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
  // The fork law: a fork at any cut, advanced to the end or to any later
  // middle cut, equals the warm projection there, effect rows included.
  for (const [label, source] of [['validated', validated], ['owned', owned]]) {
    const rows = events(source), cuts = rows.map(row => validatedRuntimeEventPrefixThroughEvent(source, row.eventId));
    const end = forkView(deriveRuntimeEventCalculusProjection(source));
    cuts.forEach((cut, index) => {
      assert.deepEqual(forkView(forkRuntimeEventCalculusAtForModuleTest(source, cut, source)), end,
        `${label}: fork at ${rows[index].admissionOrdinal} advanced to the end equals warm`);
      for (const [later, through] of cuts.entries()) if (later > index && later < cuts.length - 1)
        assert.deepEqual(forkView(forkRuntimeEventCalculusAtForModuleTest(source, cut, through)),
          forkView(deriveRuntimeEventCalculusProjection(through)),
          `${label}: fork at ${rows[index].admissionOrdinal} advanced to ${rows[later].admissionOrdinal} equals warm there`);
    });
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
  const end = forkView(deriveRuntimeEventCalculusProjection(streaming));
  for (const row of events(streaming))
    assert.deepEqual(forkView(forkRuntimeEventCalculusAtForModuleTest(streaming,
      validatedRuntimeEventPrefixThroughEvent(streaming, row.eventId), streaming)), end,
    `streaming: fork at ${row.admissionOrdinal} advanced to the end equals warm`);
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

// TD-07: the exact read. The point query `holdsAt(deriveRuntimeHeldFluentProjection(cut), q)`,
// with q one fluent (a boolean) or an exact pattern (`.length !== 0`), equals
// runtimeFluentHoldsAtPrefix(cut, fluent), the derivation's fluentAt, at every
// cut, for every key ever held and for absent keys.
const ABSENT_NAME = 'td07_absent_fluent', ABSENT_IDENTITY = 'absent://t290/td-07';
// Every fluent an effect row of the complete history initiates or terminates;
// each real name with an absent identity; the absent name with each real
// identity and with none. Derived from a separate copy of the rows.
function askedKeys(rows) {
  const held = new Map();
  for (const effect of deriveRuntimeEventCalculusProjection(prefixOf(rows)).effectRows)
    for (const fluent of [...effect.initiates, ...effect.terminates]) held.set(fluent.fluentRef, fluent);
  const real = [...held.values()];
  return { real: new Set(held.keys()), keys: [...real,
    ...[...new Set(real.map(fluent => fluent.name))].map(name => constructRuntimeFluent({ name, identity: ABSENT_IDENTITY })),
    ...[...new Set(real.flatMap(fluent => fluent.identity === null ? [] : [fluent.identity]))]
      .map(identity => constructRuntimeFluent({ name: ABSENT_NAME, identity })),
    constructRuntimeFluent({ name: ABSENT_NAME })] };
}
// One cut. The exact read of every key is asked first, so it is the call that
// advances the derivation; it equals the held projection's fluent query and,
// for a key with an identity, the exact-pattern query. Every held fluent is an
// asked key. Returns the refs the exact read holds.
function agreeAt(cut, asked, label, tally) {
  const exact = asked.keys.map(fluent => runtimeFluentHoldsAtPrefix(cut, fluent));
  const projection = deriveRuntimeHeldFluentProjection(cut);
  asked.keys.forEach((fluent, index) => {
    assert.equal(exact[index], holdsAt(projection, fluent), `${label}: ${fluent.fluentRef}`);
    if (fluent.identity !== null) assert.equal(exact[index], holdsAt(projection,
      constructRuntimeFluentPattern({ name: fluent.name, identity: fluent.identity })).length !== 0, `${label}: pattern ${fluent.fluentRef}`);
  });
  assert.ok(projection.holds.every(fluent => asked.real.has(fluent.fluentRef)), `${label}: every held fluent is an asked key`);
  tally.cuts += 1; tally.keys += asked.keys.length; tally.held += exact.filter(Boolean).length;
  return new Set(asked.keys.filter((_, index) => exact[index]).map(fluent => fluent.fluentRef));
}
const throughRow = (source, row) => validatedRuntimeEventPrefixThroughEvent(source, row.eventId);
const beforeRow = (source, row) => validatedRuntimeEventPrefixBeforeEvent(source, row.eventId);

// Cold, warm, streaming and, over an owned store, a fork at the middle cut;
// at each, the through-event cut and the before-event cut runtime_liveness
// selects. The fast path of held() (count equal to the folded count, reading
// the owned state) is the streaming case; the slow path (fluentAt over every
// key) is the warm case below the end; the fork reads through its base.
function exactReadAgreement(t, fixture, rows, owned) {
  const asked = askedKeys(rows), table = {};
  const tally = kind => (table[kind] ??= { cuts: 0, keys: 0, held: 0 });
  let boundary = 0;
  rows.forEach((row, index) => {
    agreeAt(prefixOf(rows.slice(0, index + 1)), asked, `${fixture} cold through ${row.admissionOrdinal}`, tally('cold through'));
    agreeAt(beforeRow(prefixOf(rows.slice(0, index + 1)), row), asked, `${fixture} cold before ${row.admissionOrdinal}`, tally('cold before'));
  });
  for (const [kind, source] of [['warm validated', prefixOf(rows)], ...(owned === undefined ? [] : [['warm owned', owned]])]) {
    deriveRuntimeEventCalculusProjection(source);
    for (const row of rows) {
      const at = agreeAt(throughRow(source, row), asked, `${fixture} ${kind} through ${row.admissionOrdinal}`, tally(`${kind} through`));
      const before = agreeAt(beforeRow(source, row), asked, `${fixture} ${kind} before ${row.admissionOrdinal}`, tally(`${kind} before`));
      boundary += [...at].filter(key => !before.has(key)).length;
    }
  }
  // Streaming: before each step the derivation stands at the folded count,
  // which is the state a nested read of the before-event cut during that step
  // reads; the exact read at the through-event cut then advances it one event.
  const streaming = prefixOf(rows), states = new Set();
  for (const row of rows) {
    const before = beforeRow(streaming, row), folded = runtimeEventCalculusStateForModuleTest(before);
    assert.equal(folded.ordinal, runtimeEventPrefixExtent(before).lastOrdinal, `${fixture}: streaming stands at the folded count`);
    states.add(folded);
    agreeAt(before, asked, `${fixture} streaming before ${row.admissionOrdinal}`, tally('streaming before'));
    agreeAt(throughRow(streaming, row), asked, `${fixture} streaming through ${row.admissionOrdinal}`, tally('streaming through'));
  }
  assert.equal(states.size, 1, `${fixture}: one owned state across the streaming advances`);
  if (owned !== undefined) {
    const middle = Math.floor(rows.length / 2);
    let fork = throughRow(owned, rows[middle - 1]);
    for (const row of rows.slice(middle)) {
      fork = extendRuntimeEventPlanPrefixForValidation(fork, row);
      assert.equal(isValidationRuntimeEventPrefix(fork), true, `${fixture}: the extension is a validation prefix`);
      agreeAt(beforeRow(fork, row), asked, `${fixture} fork before ${row.admissionOrdinal}`, tally('fork before'));
      agreeAt(fork, asked, `${fixture} fork through ${row.admissionOrdinal}`, tally('fork through'));
      assert.notEqual(runtimeEventCalculusStateForModuleTest(fork), runtimeEventCalculusStateForModuleTest(owned),
        `${fixture}: the validation prefix reads a fork, not the owned derivation`);
    }
  }
  assert.ok(boundary > 0, `${fixture}: some boundary event initiates a key the before-event cut does not hold`);
  t.diagnostic(JSON.stringify({ fixture, events: rows.length, keys: asked.keys.length, realKeys: asked.real.size, boundary, table }));
}

test('TD-07: the exact read equals the held-projection point query at every cut of the U1 store', async t => {
  const f = await createU1Fixture(t, ['target.txt']);
  f.cause();
  f.exit();
  f.cause('actor_invocation_failed');
  exactReadAgreement(t, 'U1', f.store.readAll(), selectOwnedRuntimeEventPrefix(f.store));
});

test('TD-07: the exact read equals the held-projection point query at every cut of the actor process lifecycle rows', t => {
  for (const [name, steps] of [...CASES.map(scenario => [scenario.name, scenario.steps.map(([step]) => step)]),
    ['start, termination unconfirmed, exit, actor terminal, Run stop', ['S', 'U', 'exit', 'A', 'R']]])
    exactReadAgreement(t, name, steps.map((step, index) => STEP[step](index + 1)));
});

// C-2: the seven lifecycle point queries outside abg/calculus/ read
// runtimeFluentHoldsAtPrefix(prefix, constructRuntimeFluent({ name, identity })).
// Over TD-07's lifecycle row lists, at every at-prefix cut and at the
// before-event cut runtime_liveness builds from it, cold (a fresh prefix per
// row, its before-event cut asked first) and warm (cuts of one prefix already
// advanced to its end), for each
// §4.4 lifecycle name with the fixture's processRef and with an absent
// identity, the exact read equals the holdsAt pattern read. Every held
// lifecycle fluent is an asked key, and each of the five holds at some cut.
test('C-2: the lifecycle exact read equals the holdsAt pattern read at every at-prefix and before-event cut', t => {
  const heldNames = new Set(), tally = { cuts: 0, reads: 0, held: 0 };
  const agree = (prefix, label) => {
    for (const name of LIFECYCLE) for (const identity of [processRef, ABSENT_IDENTITY]) {
      const exact = runtimeFluentHoldsAtPrefix(prefix, constructRuntimeFluent({ name, identity }));
      const pattern = holdsAt(deriveRuntimeHeldFluentProjection(prefix),
        constructRuntimeFluentPattern({ name, identity })).length !== 0;
      assert.equal(exact, pattern, `${label}: ${name}(${identity})`);
      tally.reads += 1;
      if (exact) { tally.held += 1; heldNames.add(name); }
    }
    assert.ok(deriveRuntimeHeldFluentProjection(prefix).holds.every(fluent =>
      !LIFECYCLE.includes(fluent.name) || fluent.identity === processRef), `${label}: every held lifecycle fluent is an asked key`);
    tally.cuts += 1;
  };
  for (const steps of [...CASES.map(scenario => scenario.steps.map(([step]) => step)), ['S', 'U', 'exit', 'A', 'R']]) {
    const rows = steps.map((step, index) => STEP[step](index + 1)), source = prefixOf(rows);
    rows.forEach((row, index) => {
      const at = prefixOf(rows.slice(0, index + 1));
      agree(beforeRow(at, row), `${steps} cold before-event ${row.admissionOrdinal}`);
      agree(at, `${steps} cold at-prefix ${row.admissionOrdinal}`);
    });
    deriveRuntimeEventCalculusProjection(source);
    for (const row of rows) {
      const at = throughRow(source, row);
      agree(at, `${steps} warm at-prefix ${row.admissionOrdinal}`);
      agree(beforeRow(at, row), `${steps} warm before-event ${row.admissionOrdinal}`);
    }
  }
  assert.deepEqual([...heldNames].sort(), [...LIFECYCLE].sort(), 'each §4.4 lifecycle fluent holds at some cut');
  t.diagnostic(JSON.stringify(tally));
});

// T-290 C-12: the fold law over the three native liveness kinds. The fixture
// is one declared actor (its execution basis, CCall, fibre, transport binding,
// invocation and process start) with probe, threshold and interruption
// observations built through the liveness owner's own projections, as its
// admission owners build them. The liveness rule evaluates each native event
// against the cut before it; the fold law holds over them as over every kind.
import { projectActorLivenessContext as livenessActorContext, deriveRuntimeLiveness as livenessProjection,
  validateRuntimeLivenessEventAtPrefix as livenessValidator } from '../../build/code/src/abg/runtime_liveness.js';
import { actorRuntimeProbeSources as livenessSources, constructRuntimeWatchdogPolicy as livenessPolicy,
  runtimeLivenessDigest as livenessDigest } from '../../build/code/src/abg/runtime_liveness_contracts.js';
import { ROOT_EVENT_CONTRACT_DIGEST as LIVENESS_CONTRACT } from '../../build/code/src/abg/event_store.js';
import { canonicalRecordDigest as livenessRecordDigest } from '../../build/code/src/shared/value/index.js';
import { deepFreeze as livenessFreeze } from '../../build/code/src/shared/immutable.js';
import { runtimeEventPrefixDigest as livenessPrefixDigest } from '../../build/code/src/abg/event_prefix.js';

const LIVENESS_REFUSAL = 'native liveness effect has no exact admitted source/threshold relation';
const LIVENESS_KINDS = ['runtime_activity_probe_observed', 'runtime_external_interruption_observed', 'actor_process_timeout_observed'];

function livenessFixture() {
  const rows = [], hash = livenessDigest;
  const at = rows => selectValidatedRuntimeEventPrefix(livenessFreeze([...rows]));
  const add = (target, envelope, kind, aggregateType, aggregateId, parentAggregateId, payload, causationEventRefs = []) => {
    const ordinal = target.length + 1;
    const event = livenessFreeze({ eventTime: '2026-10-25T00:00:00.000Z', correlationId: 'correlation://t290/c12-liveness',
      workflowVersion: '5.0.0', ...envelope, kind, aggregateType, aggregateId, parentAggregateId, causationEventRefs, payload,
      eventContractDigest: LIVENESS_CONTRACT, eventId: `event://t290/c12-liveness/${ordinal}/${kind}`, admissionOrdinal: ordinal,
      payloadDigest: hash(payload) });
    target.push(event);
    return event;
  };
  // The execution basis: one admitted basis_admitted row whose body digests to its reference.
  const rawInputValue = { kind: 't290_c12_liveness_input', value: 1 };
  const basisBody = { programRef: 'program://t290/c12-liveness', graphFunctionRef: 'graph-function://t290/c12-liveness',
    invocationRef: 'invocation://t290/c12-liveness', rawInputValue, rawInputDigest: livenessRecordDigest(rawInputValue) };
  const basisDigest = hash(basisBody), basisRef = `execution-basis://abiogenesis/${basisDigest.slice(7)}`;
  add(rows, { scopeClass: 'workspace', basisId: basisRef }, 'basis_admitted', 'workspace', 'workspace-binding://t290/c12-liveness',
    basisBody.invocationRef, { basisRef, basisDigest, ...basisBody });
  const scope = { scopeClass: 'run', basisId: basisRef, runId: 'run://t290/c12-liveness', graphCallId: 'graph-call://t290/c12-liveness',
    frameId: 'frame://t290/c12-liveness', graphFunctionRef: basisBody.graphFunctionRef };
  const cCall = 'c-call://t290/c12-liveness', processRef = 'process://t290/c12-liveness', parser = 'plain_text';
  const ids = { actorRef: 'actor://t290/c12-liveness', workerBindingRef: 'worker-binding://t290/c12-liveness',
    implementationRef: 'implementation://t290/c12-liveness', implementationBindingRef: 'implementation-binding://t290/c12-liveness',
    inputDigest: hash('input'), promptDigest: hash('prompt'), dispatchOrdinal: 1 };
  const opened = add(rows, scope, 'c_call_opened', 'c_call', cCall, scope.frameId, { cCallRef: cCall, attempt: 1,
    programLocusRef: 'locus://t290/c12-liveness', taskOrdinal: null, vectorIndex: null, edgeRef: null });
  const fibre = add(rows, scope, 'c_call_fibre_selected', 'c_call', cCall, scope.frameId, { cCallRef: cCall, callClass: 'leaf',
    regime: 'F_P', implementationRef: ids.implementationRef, implementationBindingRef: ids.implementationBindingRef }, [opened.eventId]);
  const attemptDigest = hash({ basisRef, cCallRef: cCall, attempt: 1, dispatchOrdinal: ids.dispatchOrdinal, actorRef: ids.actorRef,
    workerBindingRef: ids.workerBindingRef, implementationBindingRef: ids.implementationBindingRef, implementationRef: ids.implementationRef,
    inputDigest: ids.inputDigest, promptDigest: ids.promptDigest });
  const transportPlanDigest = hash('transport-plan');
  const policy = livenessPolicy({ startupMs: 1000, inactivityMs: 1000, hardCapMs: 5000, terminationGraceMs: 100 });
  const bindingBody = { cCallRef: cCall, actorRef: ids.actorRef, workerBindingRef: ids.workerBindingRef,
    implementationRef: ids.implementationRef, implementationBindingRef: ids.implementationBindingRef, inputDigest: ids.inputDigest,
    dispatchOrdinal: ids.dispatchOrdinal, timeoutMs: 1000, absoluteTimeoutMs: 5000, terminationGraceMs: 100, parser,
    agentKey: 'backend://t290/c12-liveness', transportPlanDigest,
    paths: { output: 'file:///t290/c12-liveness/output.json', transport: 'file:///t290/c12-liveness/transport.json' },
    livenessBinding: { kind: 'runtime_liveness_binding', schemaVersion: '5.0.0', clockKind: 'native_monotonic_elapsed', policy,
      clockOriginRef: `runtime-clock://abiogenesis/${hash({ attemptDigest, transportPlanDigest }).slice(7)}`, sources: [...livenessSources(parser)] } };
  const transportBindingDigest = hash(bindingBody), transportBindingRef = `transport-binding://abiogenesis/${transportBindingDigest.slice(7)}`;
  const binding = add(rows, scope, 'actor_transport_binding_admitted', 'transport_binding', transportBindingRef, cCall,
    { ...bindingBody, transportBindingRef, transportBindingDigest }, [fibre.eventId]);
  const actor = `actor-invocation://abiogenesis/${hash({ attemptDigest, transportBindingRef, transportBindingDigest }).slice(7)}`;
  const actorStarted = add(rows, scope, 'actor_invocation_started', 'actor_invocation', actor, cCall, { actorInvocationRef: actor,
    cCallRef: cCall, actorRef: ids.actorRef, workerBindingRef: ids.workerBindingRef, implementationRef: ids.implementationRef,
    inputDigest: ids.inputDigest, dispatchOrdinal: ids.dispatchOrdinal, promptDigest: ids.promptDigest, transportBindingRef,
    transportBindingDigest }, [binding.eventId]);
  const started = add(rows, scope, 'actor_process_started', 'process', processRef, actor,
    { actorInvocationRef: actor, processRef, processId: 4242, cCallRef: cCall }, [actorStarted.eventId]);
  const context = livenessActorContext(at(rows), actor);
  assert.notEqual(context, null, 'the declared actor context authenticates');
  const contract = source => context.probes.find(probe => probe.source === source);
  const observation = (source, underlying, elapsedMs, signal = 'activity', scopeDigest = hash(context.scope)) => ({
    kind: 'runtime_probe_observation', schemaVersion: '5.0.0', probeRef: contract(source).probeRef, scopeDigest,
    clockOriginRef: context.binding.clockOriginRef, elapsedMs, underlyingObservationRef: underlying.eventId,
    underlyingEventRef: underlying.eventId, sourceDigest: underlying.payloadDigest, sourceRevisionDigest: null,
    evidenceRefs: [underlying.eventId], coverage: 'observed', signal });
  const probe = (target, source, underlying, elapsedMs, options = {}) => {
    const observed = observation(source, underlying, elapsedMs, options.signal, options.scopeDigest);
    return add(target, scope, options.signal === 'external_interruption' ? 'runtime_external_interruption_observed' : 'runtime_activity_probe_observed',
      'actor_invocation', actor, cCall, { actorInvocationRef: actor, probeContract: contract(source), observation: observed },
      [binding.eventId, underlying.eventId]);
  };
  const stdout = (target, n) => add(target, scope, 'actor_process_stdout_observed', 'process', processRef, actor,
    { actorInvocationRef: actor, processRef, chunkOrdinal: n, chunkDigest: hash(`chunk-${n}`) }, [started.eventId]);
  probe(rows, 'process_lifecycle', started, 0);
  const firstOut = stdout(rows, 1);
  probe(rows, 'stdout', firstOut, 200);
  const branch = rows.length;
  // The threshold: the liveness owner's projection at the cut before it, as admitRuntimeThreshold builds it.
  const before = at(rows), sample = { clockOriginRef: context.binding.clockOriginRef, elapsedMs: policy.hardCapMs, eventRef: null };
  const projection = livenessProjection(before, context, sample);
  assert.equal(projection?.disposition.disposition, 'controlled_terminate', 'the hard cap terminates the live process');
  const timeout = add(rows, scope, 'actor_process_timeout_observed', 'process', processRef, actor, { actorInvocationRef: actor, processRef,
    timeoutClass: 'absolute', timeoutMs: policy.hardCapMs, thresholdObservation: { kind: 'runtime_threshold_observation',
      schemaVersion: '5.0.0', clockOriginRef: sample.clockOriginRef, elapsedMs: sample.elapsedMs, policyRef: policy.policyRef,
      scopeDigest: hash(context.scope), evaluatedPrefixDigest: livenessPrefixDigest(before), projectionDigest: projection.projectionDigest } },
  [started.eventId, ...projection.evidenceRefs]);
  probe(rows, 'process_lifecycle', timeout, policy.hardCapMs, { signal: 'external_interruption' });
  add(rows, scope, 'actor_process_exited', 'process', processRef, actor, { actorInvocationRef: actor, processRef, status: null, signal: 'SIGTERM' },
    [started.eventId]);
  const close = target => add(target, scope, 'actor_invocation_closed', 'actor_invocation', actor, cCall,
    { actorInvocationRef: actor, cCallRef: cCall, processRef }, [actorStarted.eventId]);
  close(rows);
  // Three malformed observations, each branching from the cut after the
  // second probe and followed by two rows the liveness rule does not read.
  // Each differs from an accepted observation only in its named fault.
  const variant = (length, build) => {
    const target = rows.slice(0, length), malformed = build(target);
    stdout(target, 90); stdout(target, 91);
    return { rows: target, malformed, shared: length };
  };
  const malformed = {
    'a wrong scope digest': variant(branch, target => probe(target, 'stdout', stdout(target, 2), 300,
      { scopeDigest: hash({ ...context.scope, attempt: 2 }) })),
    'an earlier elapsed sample': variant(branch, target => probe(target, 'stdout', stdout(target, 2), 100)),
    'a probe after the actor closed': variant(branch, target => { close(target); return probe(target, 'stdout', stdout(target, 2), 300); }),
  };
  return { rows, malformed, context, processRef, actor };
}

const throughEach = source => events(source).map(row => validatedRuntimeEventPrefixThroughEvent(source, row.eventId));

test('C-12 fold law: a declared actor with probe, threshold and interruption observations folds cold, warm, streaming and forked alike at every cut', t => {
  const fixture = livenessFixture(), source = selectValidatedRuntimeEventPrefix(livenessFreeze([...fixture.rows]));
  // Every native row is accepted by the liveness owner at the cut before it.
  const native = events(source).filter(row => LIVENESS_KINDS.includes(row.kind));
  assert.deepEqual(LIVENESS_KINDS.map(kind => native.filter(row => row.kind === kind).length), [2, 1, 1]);
  for (const row of native)
    assert.equal(livenessValidator(validatedRuntimeEventPrefixBeforeEvent(source, row.eventId), row), true,
      `the liveness owner accepts ${row.admissionOrdinal} ${row.kind}`);
  // Cold, reference, warm and forkAt at every cut.
  const count = assertFoldAgreement(source, 'liveness');
  // Streaming: single-event advances of one source equal one batched advance and the cold fold.
  const streaming = selectValidatedRuntimeEventPrefix(livenessFreeze([...fixture.rows]));
  const batched = selectValidatedRuntimeEventPrefix(livenessFreeze([...fixture.rows]));
  deriveRuntimeEventCalculusProjection(batched);
  for (const [index, cut] of throughEach(streaming).entries()) {
    const warm = projectionView(deriveRuntimeEventCalculusProjection(cut));
    assert.deepEqual(warm, projectionView(deriveRuntimeEventCalculusProjection(throughEach(batched)[index])),
      `streaming equals batched at ${index + 1}`);
    assert.deepEqual(stateView(coldFold(cut)), warm, `streaming equals the cold fold at ${index + 1}`);
  }
  // The fork law from every middle cut, advanced to the end and to every later middle cut, effect rows included.
  const cuts = throughEach(source), end = forkView(deriveRuntimeEventCalculusProjection(source));
  let forks = 0;
  cuts.forEach((cut, index) => {
    if (index === 0 || index === cuts.length - 1) return;
    assert.deepEqual(forkView(forkRuntimeEventCalculusAtForModuleTest(source, cut, source)), end, `fork at ${index + 1} advanced to the end`);
    forks++;
    for (const [later, through] of cuts.entries()) if (later > index && later < cuts.length - 1) {
      assert.deepEqual(forkView(forkRuntimeEventCalculusAtForModuleTest(source, cut, through)),
        forkView(deriveRuntimeEventCalculusProjection(through)), `fork at ${index + 1} advanced to ${later + 1}`);
      forks++;
    }
  });
  // The fold's own probe and interruption facts for the scope.
  const state = coldFold(source), scopeDigest = livenessDigest(fixture.context.scope);
  assert.equal(state.interruptedScopes.has(scopeDigest), true, 'the interruption fact is the scope digest');
  assert.equal(state.actorProbeScopes.get(fixture.actor)?.has(scopeDigest), true, 'the actor probe fact is the scope digest');
  assert.equal(state.holds.has(constructRuntimeFluent({ name: 'actor_process_timed_out', identity: fixture.processRef }).fluentRef), true);
  assert.equal(state.holds.has(constructRuntimeFluent({ name: 'runtime_externally_interrupted', identity: scopeDigest }).fluentRef), true);
  t.diagnostic(JSON.stringify({ cuts: count, nativeRows: native.length, forks }));
});

test('C-12 fold law: a malformed native observation is refused by the fold with one message at every cut that holds it', t => {
  const fixture = livenessFixture(), valid = selectValidatedRuntimeEventPrefix(livenessFreeze([...fixture.rows]));
  const tally = {};
  for (const [label, { rows, malformed, shared }] of Object.entries(fixture.malformed)) {
    const source = selectValidatedRuntimeEventPrefix(livenessFreeze([...rows])), cuts = throughEach(source);
    assert.equal(livenessValidator(validatedRuntimeEventPrefixBeforeEvent(source, malformed.eventId), malformed), false,
      `${label}: the liveness owner refuses the observation`);
    const middle = cuts[Math.floor((malformed.admissionOrdinal - 1) / 2)];
    const streaming = selectValidatedRuntimeEventPrefix(livenessFreeze([...rows]));
    const streamed = throughEach(streaming);
    let refused = 0, accepted = 0;
    for (const [index, cut] of cuts.entries()) {
      const ordinal = index + 1, where = `${label} at ${ordinal}`;
      if (ordinal < malformed.admissionOrdinal) {
        // Before the malformed row the variant folds by the fold law; through
        // its shared rows it is the valid fixture's prefix.
        const warm = projectionView(deriveRuntimeEventCalculusProjection(cut));
        assert.deepEqual(stateView(coldFold(cut)), warm, `${where}: cold equals warm`);
        assert.deepEqual(projectionView(deriveRuntimeEventCalculusProjection(streamed[index])), warm, `${where}: streaming equals warm`);
        if (ordinal <= shared) assert.deepEqual(warm, projectionView(deriveRuntimeEventCalculusProjection(
          validatedRuntimeEventPrefixThroughEvent(valid, events(valid)[index].eventId))), `${where}: the valid fixture's prefix`);
        accepted++;
        continue;
      }
      assert.throws(() => coldFold(cut), { message: LIVENESS_REFUSAL }, `${where}: cold`);
      assert.throws(() => deriveRuntimeEventCalculusProjection(cut), { message: LIVENESS_REFUSAL }, `${where}: warm`);
      assert.throws(() => deriveRuntimeEventCalculusProjection(streamed[index]), { message: LIVENESS_REFUSAL }, `${where}: streaming`);
      assert.throws(() => forkRuntimeEventCalculusAtForModuleTest(cuts[malformed.admissionOrdinal - 2], middle, cut),
        { message: LIVENESS_REFUSAL }, `${where}: a fork at ${Math.floor((malformed.admissionOrdinal - 1) / 2) + 1} advanced here`);
      refused++;
    }
    assert.ok(refused >= 3 && accepted >= 1, `${label}: the variant reaches cuts on both sides`);
    tally[label] = { malformedAt: malformed.admissionOrdinal, accepted, refused };
  }
  t.diagnostic(JSON.stringify(tally));
});

// T-290 C-12b: the budget enters the threshold's persisted projection digest.
// The declared actor's CCall opens under an admitted retry attempt (attempt 1
// of a budget of 2) whose progress is recorded before the threshold, so the
// liveness owner derives the retry budget facts from admitted rows and the
// threshold cites a projection digest over them. `fault: 'attempt-digest'`
// gives the attempt a wrong digest, so its record does not authenticate and
// the derived budget is absent; `cite` names the budget whose projection the
// threshold records: the one derived from the rows, or the well-formed one.
const BUDGET_SIGNAL = 'signal://t290/c12b-budget';
const WELL_FORMED_BUDGET = { remaining: 1, retryEligible: true, continuationRef: null, terminalPolicy: 'block', resultRejectionRef: BUDGET_SIGNAL };
const ABSENT_BUDGET = { remaining: null, retryEligible: false, continuationRef: null, terminalPolicy: 'block' };

function budgetLivenessFixture({ fault = null, cite = 'derived' } = {}) {
  const rows = [], hash = livenessDigest, tag = 'c12b-budget';
  const at = rows => selectValidatedRuntimeEventPrefix(livenessFreeze([...rows]));
  const add = (envelope, kind, aggregateType, aggregateId, parentAggregateId, payload, causationEventRefs = []) => {
    const ordinal = rows.length + 1;
    const event = livenessFreeze({ eventTime: '2026-10-25T00:00:00.000Z', correlationId: `correlation://t290/${tag}`,
      workflowVersion: '5.0.0', ...envelope, kind, aggregateType, aggregateId, parentAggregateId, causationEventRefs, payload,
      eventContractDigest: LIVENESS_CONTRACT, eventId: `event://t290/${tag}/${ordinal}/${kind}`, admissionOrdinal: ordinal,
      payloadDigest: hash(payload) });
    rows.push(event);
    return event;
  };
  const rawInputValue = { kind: 't290_c12b_budget_input', value: 1 };
  const basisBody = { programRef: `program://t290/${tag}`, graphFunctionRef: `graph-function://t290/${tag}`,
    invocationRef: `invocation://t290/${tag}`, rawInputValue, rawInputDigest: livenessRecordDigest(rawInputValue) };
  const basisDigest = hash(basisBody), basisRef = `execution-basis://abiogenesis/${basisDigest.slice(7)}`;
  add({ scopeClass: 'workspace', basisId: basisRef }, 'basis_admitted', 'workspace', `workspace-binding://t290/${tag}`,
    basisBody.invocationRef, { basisRef, basisDigest, ...basisBody });
  const scope = { scopeClass: 'run', basisId: basisRef, runId: `run://t290/${tag}`, graphCallId: `graph-call://t290/${tag}`,
    frameId: `frame://t290/${tag}`, graphFunctionRef: basisBody.graphFunctionRef };
  const cCall = `c-call://t290/${tag}`, processRef = `process://t290/${tag}`, parser = 'plain_text';
  const retryBoundaryRef = `retry-boundary://t290/${tag}`, retryPath = [{ retryBoundaryRef }];
  // The retry attempt the CCall opens under: its body digests to its reference, or, with the fault, it does not.
  const attemptBody = { attempt: 1, taskOrdinal: null, retryPath, budget: 2, retryBoundaryRef };
  const attemptDigest = fault === 'attempt-digest' ? hash({ ...attemptBody, budget: 3 }) : hash(attemptBody);
  const attemptRef = `retry-attempt://abiogenesis/${attemptDigest.slice(7)}`;
  add(scope, 'retry_attempt_opened', 'retry_attempt', attemptRef, scope.frameId, { attemptRef, attemptDigest, ...attemptBody });
  const ids = { actorRef: `actor://t290/${tag}`, workerBindingRef: `worker-binding://t290/${tag}`,
    implementationRef: `implementation://t290/${tag}`, implementationBindingRef: `implementation-binding://t290/${tag}`,
    inputDigest: hash('input'), promptDigest: hash('prompt'), dispatchOrdinal: 1 };
  const opened = add(scope, 'c_call_opened', 'c_call', cCall, scope.frameId, { cCallRef: cCall, attempt: 1,
    programLocusRef: `locus://t290/${tag}`, taskOrdinal: null, vectorIndex: null, edgeRef: null, retryPath });
  const fibre = add(scope, 'c_call_fibre_selected', 'c_call', cCall, scope.frameId, { cCallRef: cCall, callClass: 'leaf',
    regime: 'F_P', implementationRef: ids.implementationRef, implementationBindingRef: ids.implementationBindingRef }, [opened.eventId]);
  const actorAttempt = hash({ basisRef, cCallRef: cCall, attempt: 1, dispatchOrdinal: ids.dispatchOrdinal, actorRef: ids.actorRef,
    workerBindingRef: ids.workerBindingRef, implementationBindingRef: ids.implementationBindingRef, implementationRef: ids.implementationRef,
    inputDigest: ids.inputDigest, promptDigest: ids.promptDigest });
  const transportPlanDigest = hash('transport-plan');
  const policy = livenessPolicy({ startupMs: 1000, inactivityMs: 1000, hardCapMs: 5000, terminationGraceMs: 100 });
  const bindingBody = { cCallRef: cCall, actorRef: ids.actorRef, workerBindingRef: ids.workerBindingRef,
    implementationRef: ids.implementationRef, implementationBindingRef: ids.implementationBindingRef, inputDigest: ids.inputDigest,
    dispatchOrdinal: ids.dispatchOrdinal, timeoutMs: 1000, absoluteTimeoutMs: 5000, terminationGraceMs: 100, parser,
    agentKey: `backend://t290/${tag}`, transportPlanDigest,
    paths: { output: `file:///t290/${tag}/output.json`, transport: `file:///t290/${tag}/transport.json` },
    livenessBinding: { kind: 'runtime_liveness_binding', schemaVersion: '5.0.0', clockKind: 'native_monotonic_elapsed', policy,
      clockOriginRef: `runtime-clock://abiogenesis/${hash({ attemptDigest: actorAttempt, transportPlanDigest }).slice(7)}`, sources: [...livenessSources(parser)] } };
  const transportBindingDigest = hash(bindingBody), transportBindingRef = `transport-binding://abiogenesis/${transportBindingDigest.slice(7)}`;
  const binding = add(scope, 'actor_transport_binding_admitted', 'transport_binding', transportBindingRef, cCall,
    { ...bindingBody, transportBindingRef, transportBindingDigest }, [fibre.eventId]);
  const actor = `actor-invocation://abiogenesis/${hash({ attemptDigest: actorAttempt, transportBindingRef, transportBindingDigest }).slice(7)}`;
  const actorStarted = add(scope, 'actor_invocation_started', 'actor_invocation', actor, cCall, { actorInvocationRef: actor,
    cCallRef: cCall, actorRef: ids.actorRef, workerBindingRef: ids.workerBindingRef, implementationRef: ids.implementationRef,
    inputDigest: ids.inputDigest, dispatchOrdinal: ids.dispatchOrdinal, promptDigest: ids.promptDigest, transportBindingRef,
    transportBindingDigest }, [binding.eventId]);
  const started = add(scope, 'actor_process_started', 'process', processRef, actor,
    { actorInvocationRef: actor, processRef, processId: 4243, cCallRef: cCall }, [actorStarted.eventId]);
  const context = livenessActorContext(at(rows), actor);
  assert.notEqual(context, null, 'the declared actor context authenticates');
  const contract = source => context.probes.find(probe => probe.source === source);
  const probe = (source, underlying, elapsedMs, signal = 'activity') => add(scope,
    signal === 'external_interruption' ? 'runtime_external_interruption_observed' : 'runtime_activity_probe_observed',
    'actor_invocation', actor, cCall, { actorInvocationRef: actor, probeContract: contract(source), observation: {
      kind: 'runtime_probe_observation', schemaVersion: '5.0.0', probeRef: contract(source).probeRef, scopeDigest: hash(context.scope),
      clockOriginRef: context.binding.clockOriginRef, elapsedMs, underlyingObservationRef: underlying.eventId,
      underlyingEventRef: underlying.eventId, sourceDigest: underlying.payloadDigest, sourceRevisionDigest: null,
      evidenceRefs: [underlying.eventId], coverage: 'observed', signal } }, [binding.eventId, underlying.eventId]);
  probe('process_lifecycle', started, 0);
  // The attempt's progress: a contract failure with one retry remaining.
  const progressBody = { attemptRef, cCallRef: cCall, remainingBudget: 1, budget: 2, retryBoundaryRef, progressClass: 'retry',
    failureClass: 'contract_failure', failureSignalRef: BUDGET_SIGNAL };
  const progressDigest = hash(progressBody), progressRef = `retry-progress://abiogenesis/${progressDigest.slice(7)}`;
  add(scope, 'retry_progress_recorded', 'retry_progress', progressRef, scope.frameId, { progressRef, progressDigest, ...progressBody });
  const out = add(scope, 'actor_process_stdout_observed', 'process', processRef, actor,
    { actorInvocationRef: actor, processRef, chunkOrdinal: 1, chunkDigest: hash('chunk-1') }, [started.eventId]);
  probe('stdout', out, 200);
  // The threshold at the hard cap: the projection at the cut before it, over the cited budget.
  const before = at(rows), sample = { clockOriginRef: context.binding.clockOriginRef, elapsedMs: policy.hardCapMs, eventRef: null };
  const derived = livenessProjection(before, context, sample);
  const cited = cite === 'well-formed' ? livenessProjection(before, context, sample, WELL_FORMED_BUDGET) : derived;
  assert.equal(cited?.disposition.disposition, 'controlled_terminate', 'the hard cap terminates the live process');
  const timeout = add(scope, 'actor_process_timeout_observed', 'process', processRef, actor, { actorInvocationRef: actor, processRef,
    timeoutClass: 'absolute', timeoutMs: policy.hardCapMs, thresholdObservation: { kind: 'runtime_threshold_observation',
      schemaVersion: '5.0.0', clockOriginRef: sample.clockOriginRef, elapsedMs: sample.elapsedMs, policyRef: policy.policyRef,
      scopeDigest: hash(context.scope), evaluatedPrefixDigest: livenessPrefixDigest(before), projectionDigest: cited.projectionDigest } },
  [started.eventId, ...cited.evidenceRefs]);
  probe('process_lifecycle', timeout, policy.hardCapMs, 'external_interruption');
  add(scope, 'actor_process_exited', 'process', processRef, actor, { actorInvocationRef: actor, processRef, status: null, signal: 'SIGTERM' },
    [started.eventId]);
  add(scope, 'actor_invocation_closed', 'actor_invocation', actor, cCall, { actorInvocationRef: actor, cCallRef: cCall, processRef },
    [actorStarted.eventId]);
  const absent = livenessProjection(before, context, sample, ABSENT_BUDGET);
  return { rows, context, actor, processRef, timeout, derived, cited, absent };
}

test('C-12b fold law: a threshold whose scope has an opened retry attempt and its progress carries the budget in its persisted digest and folds cold, warm, streaming and forked alike at every cut', t => {
  const fixture = budgetLivenessFixture(), source = selectValidatedRuntimeEventPrefix(livenessFreeze([...fixture.rows]));
  // The owner derives the budget from the admitted attempt and progress; it enters the recorded projection digest.
  assert.deepEqual(fixture.derived.retryBudget, WELL_FORMED_BUDGET, 'the budget derived from the admitted retry rows');
  assert.notEqual(fixture.derived.projectionDigest, fixture.absent.projectionDigest, 'the budget changes the projection digest');
  assert.equal(fixture.timeout.payload.thresholdObservation.projectionDigest, fixture.derived.projectionDigest,
    'the threshold records the digest over the derived budget');
  const native = events(source).filter(row => LIVENESS_KINDS.includes(row.kind));
  assert.deepEqual(LIVENESS_KINDS.map(kind => native.filter(row => row.kind === kind).length), [2, 1, 1]);
  for (const row of native)
    assert.equal(livenessValidator(validatedRuntimeEventPrefixBeforeEvent(source, row.eventId), row), true,
      `the liveness owner accepts ${row.admissionOrdinal} ${row.kind}`);
  const count = assertFoldAgreement(source, 'budget');
  const streaming = selectValidatedRuntimeEventPrefix(livenessFreeze([...fixture.rows]));
  const batched = selectValidatedRuntimeEventPrefix(livenessFreeze([...fixture.rows]));
  deriveRuntimeEventCalculusProjection(batched);
  for (const [index, cut] of throughEach(streaming).entries()) {
    const warm = projectionView(deriveRuntimeEventCalculusProjection(cut));
    assert.deepEqual(warm, projectionView(deriveRuntimeEventCalculusProjection(throughEach(batched)[index])),
      `streaming equals batched at ${index + 1}`);
    assert.deepEqual(stateView(coldFold(cut)), warm, `streaming equals the cold fold at ${index + 1}`);
  }
  const cuts = throughEach(source), end = forkView(deriveRuntimeEventCalculusProjection(source));
  let forks = 0;
  cuts.forEach((cut, index) => {
    if (index === 0 || index === cuts.length - 1) return;
    assert.deepEqual(forkView(forkRuntimeEventCalculusAtForModuleTest(source, cut, source)), end, `fork at ${index + 1} advanced to the end`);
    forks++;
    for (const [later, through] of cuts.entries()) if (later > index && later < cuts.length - 1) {
      assert.deepEqual(forkView(forkRuntimeEventCalculusAtForModuleTest(source, cut, through)),
        forkView(deriveRuntimeEventCalculusProjection(through)), `fork at ${index + 1} advanced to ${later + 1}`);
      forks++;
    }
  });
  const state = coldFold(source), scopeDigest = livenessDigest(fixture.context.scope);
  assert.equal(state.holds.has(constructRuntimeFluent({ name: 'actor_process_timed_out', identity: fixture.processRef }).fluentRef), true);
  assert.equal(state.holds.has(constructRuntimeFluent({ name: 'runtime_externally_interrupted', identity: scopeDigest }).fluentRef), true);
  t.diagnostic(JSON.stringify({ cuts: count, nativeRows: native.length, forks, thresholdAt: fixture.timeout.admissionOrdinal }));
});

test('C-12b fold law: a threshold citing a budget whose retry attempt has the wrong digest is refused by the fold with one message at every cut that holds it', t => {
  const valid = budgetLivenessFixture({ cite: 'well-formed' });
  const faulty = budgetLivenessFixture({ fault: 'attempt-digest', cite: 'well-formed' });
  const honest = budgetLivenessFixture({ fault: 'attempt-digest', cite: 'derived' });
  // Mutants: with the right digest the well-formed citation is admitted; with the wrong digest the
  // derived budget is absent, and a threshold citing that derivation is admitted.
  assert.deepEqual(valid.derived.retryBudget, WELL_FORMED_BUDGET, 'the right digest derives the well-formed budget');
  assert.deepEqual(faulty.derived.retryBudget, { resultRejectionRef: null, ...ABSENT_BUDGET }, 'the wrong digest derives the absent budget');
  assert.equal(faulty.derived.projectionDigest === faulty.cited.projectionDigest, false, 'the citation differs from the derivation');
  const tally = {};
  for (const [label, fixture, admitted] of [['the right attempt digest', valid, true], ['the wrong attempt digest, citing the derivation', honest, true],
    ['the wrong attempt digest, citing the well-formed budget', faulty, false]]) {
    const source = selectValidatedRuntimeEventPrefix(livenessFreeze([...fixture.rows])), cuts = throughEach(source);
    const threshold = fixture.timeout.admissionOrdinal;
    assert.equal(livenessValidator(validatedRuntimeEventPrefixBeforeEvent(source, fixture.timeout.eventId), fixture.timeout), admitted,
      `${label}: the liveness owner ${admitted ? 'accepts' : 'refuses'} the threshold`);
    const streamed = throughEach(selectValidatedRuntimeEventPrefix(livenessFreeze([...fixture.rows])));
    const half = Math.floor((threshold - 1) / 2), middle = cuts[half];
    // A refused variant's derivation is forked from its cut before the threshold, never from the whole log.
    const forkSource = admitted ? source : cuts[threshold - 2];
    let refused = 0, accepted = 0;
    for (const [index, cut] of cuts.entries()) {
      const ordinal = index + 1, where = `${label} at ${ordinal}`;
      if (admitted || ordinal < threshold) {
        const warm = projectionView(deriveRuntimeEventCalculusProjection(cut));
        assert.deepEqual(stateView(coldFold(cut)), warm, `${where}: cold equals warm`);
        assert.deepEqual(projectionView(deriveRuntimeEventCalculusProjection(streamed[index])), warm, `${where}: streaming equals warm`);
        assert.deepEqual(projectionView(forkRuntimeEventCalculusAtForModuleTest(forkSource, cuts[Math.min(index, half)], cut)), warm,
          `${where}: a fork at ${Math.min(index, half) + 1} advanced here`);
        accepted++;
        continue;
      }
      assert.throws(() => coldFold(cut), { message: LIVENESS_REFUSAL }, `${where}: cold`);
      assert.throws(() => deriveRuntimeEventCalculusProjection(cut), { message: LIVENESS_REFUSAL }, `${where}: warm`);
      assert.throws(() => deriveRuntimeEventCalculusProjection(streamed[index]), { message: LIVENESS_REFUSAL }, `${where}: streaming`);
      assert.throws(() => forkRuntimeEventCalculusAtForModuleTest(cuts[threshold - 2], middle, cut),
        { message: LIVENESS_REFUSAL }, `${where}: a fork at ${half + 1} advanced here`);
      refused++;
    }
    if (!admitted) assert.ok(refused >= 3 && accepted >= 1, `${label}: the variant reaches cuts on both sides`);
    tally[label] = { thresholdAt: threshold, accepted, refused };
  }
  t.diagnostic(JSON.stringify(tally));
});

// T-290 C-12c: the basis law decides in the calculus. The C-12 actor's
// `basis_admitted` row keeps its basisRef and every field the liveness
// contexts read, and records a different well-formed `basisDigest`. A reader
// of those payload fields alone would accept the probes; the execution basis
// record law refuses the record, so no context has a basis and the relation
// refuses the first probe that cites it. Its mutant with the right digest is
// the C-12 fixture itself.
import { projectExactExecutionBasisRecordAtPrefix as basisRecordLaw } from '../../build/code/src/abg/calculus/execution_basis_record.js';
import { projectExactExecutionBasisAtPrefix as basisOwnerRead } from '../../build/code/src/abg/invocation_execution_truth.js';

test('C-12c fold law: a probe citing a basis_admitted whose basisDigest is wrong is refused by the fold with one message at every cut that holds it, and its mutant with the right digest is accepted', t => {
  const fixture = livenessFixture(), basisRow = fixture.rows.find(row => row.kind === 'basis_admitted');
  const faultyRows = fixture.rows.map(row => {
    if (row !== basisRow) return row;
    const payload = { ...row.payload, basisDigest: livenessDigest({ wrong: 'basis://t290/c12c' }) };
    return livenessFreeze({ ...row, payload, payloadDigest: livenessDigest(payload) });
  });
  const faultyBasis = faultyRows.find(row => row.kind === 'basis_admitted');
  // Only the recorded digest differs: every field the contexts read is the same.
  for (const key of ['basisRef', 'programRef', 'graphFunctionRef', 'invocationRef'])
    assert.equal(faultyBasis.payload[key], basisRow.payload[key], `the faulty basis keeps ${key}`);
  assert.notEqual(faultyBasis.payload.basisDigest, basisRow.payload.basisDigest, 'the faulty basis records another digest');
  const tally = {};
  for (const [label, rows, admitted] of [['the right basis digest', fixture.rows, true], ['a wrong basis digest', faultyRows, false]]) {
    const source = selectValidatedRuntimeEventPrefix(livenessFreeze([...rows])), cuts = throughEach(source);
    // The basis record law is the calculus's; the invocation truth owner reads it.
    const law = basisRecordLaw(source, basisRow.payload.basisRef);
    assert.equal(law !== null, admitted, `${label}: the calculus basis law ${admitted ? 'admits' : 'refuses'} the record`);
    assert.deepEqual(basisOwnerRead(source, basisRow.payload.basisRef), law, `${label}: the owner's basis read is the calculus law`);
    const native = events(source).filter(row => LIVENESS_KINDS.includes(row.kind));
    assert.deepEqual(LIVENESS_KINDS.map(kind => native.filter(row => row.kind === kind).length), [2, 1, 1]);
    for (const row of native)
      assert.equal(livenessValidator(validatedRuntimeEventPrefixBeforeEvent(source, row.eventId), row), admitted,
        `${label}: the liveness owner ${admitted ? 'accepts' : 'refuses'} ${row.admissionOrdinal} ${row.kind}`);
    const probeAt = native[0].admissionOrdinal, half = Math.floor((probeAt - 1) / 2), middle = cuts[half];
    const streamed = throughEach(selectValidatedRuntimeEventPrefix(livenessFreeze([...rows])));
    // A refused variant's derivation is forked from its cut before the probe, never from the whole log.
    const forkSource = admitted ? source : cuts[probeAt - 2];
    let refused = 0, accepted = 0;
    for (const [index, cut] of cuts.entries()) {
      const ordinal = index + 1, where = `${label} at ${ordinal}`;
      if (admitted || ordinal < probeAt) {
        const warm = projectionView(deriveRuntimeEventCalculusProjection(cut));
        assert.deepEqual(stateView(coldFold(cut)), warm, `${where}: cold equals warm`);
        assert.deepEqual(projectionView(deriveRuntimeEventCalculusProjection(streamed[index])), warm, `${where}: streaming equals warm`);
        assert.deepEqual(projectionView(forkRuntimeEventCalculusAtForModuleTest(forkSource, cuts[Math.min(index, half)], cut)), warm,
          `${where}: a fork at ${Math.min(index, half) + 1} advanced here`);
        accepted++;
        continue;
      }
      assert.throws(() => coldFold(cut), { message: LIVENESS_REFUSAL }, `${where}: cold`);
      assert.throws(() => deriveRuntimeEventCalculusProjection(cut), { message: LIVENESS_REFUSAL }, `${where}: warm`);
      assert.throws(() => deriveRuntimeEventCalculusProjection(streamed[index]), { message: LIVENESS_REFUSAL }, `${where}: streaming`);
      assert.throws(() => forkRuntimeEventCalculusAtForModuleTest(cuts[probeAt - 2], middle, cut),
        { message: LIVENESS_REFUSAL }, `${where}: a fork at ${half + 1} advanced here`);
      refused++;
    }
    assert.equal(accepted + refused, cuts.length, `${label}: every cut is decided`);
    if (admitted) assert.equal(refused, 0, `${label}: no cut is refused`);
    else assert.ok(refused >= 3 && accepted >= 1, `${label}: the variant reaches cuts on both sides`);
    tally[label] = { probeAt, accepted, refused };
  }
  t.diagnostic(JSON.stringify(tally));
});
