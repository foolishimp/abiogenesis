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
  extendRuntimeEventPlanPrefixForValidation, isValidationRuntimeEventPrefix, isOwnedRuntimeEventPrefix } from '../../build/code/src/abg/event_prefix.js';
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

// D5: current probabilistic evidence carries no lifecycle copy, so the copy
// check derives nothing and the lifecycle fluent alone answers; an L copy keeps
// its check and its diagnostic on disagreement.
test('D5 fold: copy-free current evidence derives no copy diagnostic; an L copy keeps its check', () => {
  const DIAGNOSTIC = 'terminationConfirmed_copy_disagrees';
  const evidence = (n, copies) => row('c_call_evidenced', n, 'c_call', cCallRef, 'frame://t287/fold', {
    cCallRef, evidenceClass: 'probabilistic_transport', processRef, actorInvocationRef: actorRef, timeoutClass: null, ...copies });
  // A current case stamps every row with the one current profile.
  const atProfile = (event, profile) => profile === undefined ? event : Object.freeze({ ...event, eventContractDigest: profile });
  const legacyCopies = terminationConfirmed => ({ timedOut: false, exitObserved: terminationConfirmed, terminationConfirmed,
    signalSequence: Object.freeze([]) });
  const cases = [
    { name: 'current, exited', steps: ['S', 'exit'], copies: {}, profile: LIVENESS_CONTRACT, terminated: true, diagnostic: false },
    { name: 'current, live', steps: ['S'], copies: {}, profile: LIVENESS_CONTRACT, terminated: false, diagnostic: false },
    { name: 'L agreeing copy', steps: ['S', 'exit'], copies: legacyCopies(true), terminated: true, diagnostic: false },
    { name: 'L disagreeing copy', steps: ['S', 'exit'], copies: legacyCopies(false), terminated: true, diagnostic: true },
  ];
  for (const scenario of cases) {
    const rows = [...scenario.steps.map((step, index) => STEP[step](index + 1)),
      evidence(scenario.steps.length + 1, scenario.copies)].map(event => atProfile(event, scenario.profile));
    const prefix = selectValidatedRuntimeEventPrefix(Object.freeze(rows));
    let state = emptyFoldState(prefix);
    rows.forEach((event, index) => { state = foldStep(state, event, rows.slice(0, index)); });
    const effectNames = state.transition.effect.initiates.map(fluent => fluent.name);
    assert.equal(effectNames.includes(DIAGNOSTIC), scenario.diagnostic, `${scenario.name}: diagnostic effect`);
    assert.equal(runtimeFluentHoldsAtPrefix(prefix, constructRuntimeFluent({ name: DIAGNOSTIC, identity: processRef })),
      scenario.diagnostic, `${scenario.name}: diagnostic fluent at the prefix`);
    assert.equal(runtimeFluentHoldsAtPrefix(prefix, constructRuntimeFluent({ name: 'actor_process_terminated', identity: processRef })),
      scenario.terminated, `${scenario.name}: the fluent the copy-free read derives`);
    assert.deepEqual(stateView(state), projectionView(deriveRuntimeEventCalculusProjection(prefix)), `${scenario.name}: fold equals project`);
  }
});

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
// `attempts`/`progress` repeat the exact matching record; `related` adds
// attempt and progress rows of other Runs under the same basis, and
// `unrelated` adds workspace rows under another basis.
const BUDGET_SIGNAL = 'signal://t290/c12b-budget';
const WELL_FORMED_BUDGET = { remaining: 1, retryEligible: true, continuationRef: null, terminalPolicy: 'block', resultRejectionRef: BUDGET_SIGNAL };
const ABSENT_BUDGET = { remaining: null, retryEligible: false, continuationRef: null, terminalPolicy: 'block' };

function budgetLivenessFixture({ fault = null, cite = 'derived', attempts = 1, progress = 1, related = 0, unrelated = 0 } = {}) {
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
  for (let i = 0; i < attempts; i++) add(scope, 'retry_attempt_opened', 'retry_attempt', attemptRef, scope.frameId, { attemptRef, attemptDigest, ...attemptBody });
  for (let i = 0; i < related; i++) {
    const other = { ...scope, runId: `run://t290/${tag}/related-${i}`, frameId: `frame://t290/${tag}/related-${i}` };
    add(other, 'retry_attempt_opened', 'retry_attempt', attemptRef, other.frameId, { attemptRef, attemptDigest, ...attemptBody });
    add(other, 'retry_progress_recorded', 'retry_progress', `retry-progress://t290/${tag}/related-${i}`, other.frameId,
      { progressRef: `retry-progress://t290/${tag}/related-${i}`, progressDigest: hash(i), attemptRef, cCallRef: cCall });
  }
  for (let i = 0; i < unrelated; i++) add({ scopeClass: 'workspace', basisId: `basis://t290/${tag}/unrelated` }, 'public_operation_admitted',
    'workspace', `invocation://t290/${tag}/unrelated-${i}`, null, { invocationRef: `invocation://t290/${tag}/unrelated-${i}`,
      invocationDigest: hash(['unrelated', i]), operationId: 'abg.operation.project.read', variant: 'status' });
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
  for (let i = 0; i < progress; i++) add(scope, 'retry_progress_recorded', 'retry_progress', progressRef, scope.frameId, { progressRef, progressDigest, ...progressBody });
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
  return { rows, context, actor, processRef, timeout, derived, cited, absent, opened };
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
import { projectRuntimeRetryBudgetFacts as budgetOwner } from '../../build/code/src/abg/calculus/liveness.js';
import { runtimeEventSelectorExtent as selectorExtent } from '../../build/code/src/abg/event_prefix.js';
import { openMeasurer } from '../support/single-address-space-consolidation.mjs';

// R1 budget discriminators over the actual liveness owner. The synthetic rows
// are the explicit lower-owner premise; no installed history is claimed.
test('C-12b budget owner: null, missing, valid, many-match, irrelevant, stale and foreign scopes agree cold, warm, streaming and forked; unrelated growth visits no further rows', async t => {
  const select = fixture => selectValidatedRuntimeEventPrefix(livenessFreeze([...fixture.rows]));
  const base = budgetLivenessFixture(), source = select(base), scope = base.context.scope;
  assert.equal(typeof scope.cCallRef, 'string', 'the actor scope names its CCall');
  const PROGRESS_UNSET = { remaining: 1, retryEligible: false, continuationRef: null, terminalPolicy: 'block', resultRejectionRef: null };
  const variants = {
    valid: [base, scope, WELL_FORMED_BUDGET],
    nullScope: [base, { ...scope, cCallRef: null }, ABSENT_BUDGET],
    missingCall: [base, { ...scope, cCallRef: 'c-call://t290/c12b-budget/absent' }, ABSENT_BUDGET],
    foreignRun: [base, { ...scope, runId: 'run://t290/c12b-budget/foreign' }, ABSENT_BUDGET],
    foreignBasis: [base, { ...scope, basisRef: 'execution-basis://abiogenesis/' + '0'.repeat(64) }, ABSENT_BUDGET],
    otherAttempt: [base, { ...scope, attempt: 2 }, ABSENT_BUDGET],
    manyAttempts: [budgetLivenessFixture({ attempts: 2 }), scope, ABSENT_BUDGET],
    manyProgress: [budgetLivenessFixture({ progress: 2 }), scope, PROGRESS_UNSET],
    irrelevantScopes: [budgetLivenessFixture({ related: 8 }), scope, WELL_FORMED_BUDGET],
    unrelatedGrowth: [budgetLivenessFixture({ unrelated: 8 }), scope, WELL_FORMED_BUDGET],
  };
  const folded = new Set();
  for (const [label, [fixture, query, expected]] of Object.entries(variants)) {
    const warm = select(fixture), cold = select(fixture);
    assert.deepEqual(budgetOwner(warm, query), expected, `${label}: the owner value`);
    assert.deepEqual(budgetOwner(warm, query), budgetOwner(cold, query), `${label}: warm equals cold`);
    assert.deepEqual(budgetOwner(throughEach(select(fixture)).at(-1), query), expected, `${label}: streaming equals warm`);
    if (!folded.has(fixture)) { assertFoldAgreement(warm, label); folded.add(fixture); }
  }
  // N6-R1-PROOF-01: each finite query and its full expected result asked on the
  // actual validation-prefix extension forks and on successive streaming cuts.
  // The rows are the explicit synthetic lower premise, so every prefix is the
  // validated kind: neither an owned handle nor a validation receipt is claimed.
  // Each answer must equal the cold answer of a fresh selection of the same rows.
  const forkTally = {};
  for (const [label, [fixture, query, expected]] of Object.entries(variants)) {
    const rows = fixture.rows, n = rows.length;
    const coldAt = rows.map((_, index) => budgetOwner(select({ rows: rows.slice(0, index + 1) }), query));
    assert.deepEqual(coldAt.at(-1), expected, `${label}: the fresh full cut answers the expected result`);
    const kindOf = prefix => [prefix.kind, isOwnedRuntimeEventPrefix(prefix), isValidationRuntimeEventPrefix(prefix)];
    const streaming = select(fixture), streamed = throughEach(streaming);
    streamed.forEach((cut, index) => {
      assert.deepEqual(kindOf(cut), ['validated_runtime_event_prefix', false, false], `${label}: streaming cut ${index + 1} kind`);
      assert.deepEqual(budgetOwner(cut, query), coldAt[index], `${label}: streaming cut ${index + 1}`);
    });
    assert.deepEqual(budgetOwner(streaming, query), expected, `${label}: the streamed whole selection`);
    // One-row forks from every warm cut, then one chained fork from the middle.
    const warm = select(fixture), cuts = throughEach(warm);
    let forks = 0, changed = 0;
    for (let index = 0; index < n - 1; index++) {
      const base = cuts[index], before = budgetOwner(base, query);
      const fork = extendRuntimeEventPlanPrefixForValidation(base, rows[index + 1]);
      assert.deepEqual(kindOf(fork), ['validated_runtime_event_prefix', false, false], `${label}: fork ${index + 1}->${index + 2} kind`);
      assert.equal(runtimeEventPrefixExtent(fork).count, index + 2);
      const answer = budgetOwner(fork, query);
      assert.deepEqual(answer, coldAt[index + 1], `${label}: fork ${index + 1}->${index + 2}`);
      assert.deepEqual(budgetOwner(base, query), before, `${label}: the fork leaves its base answer unchanged at ${index + 1}`);
      forks++; if (JSON.stringify(answer) !== JSON.stringify(before)) changed++;
    }
    let chained = cuts[Math.floor(n / 2) - 1];
    for (let index = Math.floor(n / 2); index < n; index++) {
      chained = extendRuntimeEventPlanPrefixForValidation(chained, rows[index]);
      assert.deepEqual(kindOf(chained), ['validated_runtime_event_prefix', false, false]);
      assert.deepEqual(budgetOwner(chained, query), coldAt[index], `${label}: chained fork through ${index + 1}`);
    }
    assert.deepEqual(budgetOwner(chained, query), expected, `${label}: the chained fork answers the expected result`);
    forkTally[label] = { rows: n, streamingCuts: streamed.length, oneRowForks: forks, answerChanges: changed,
      chainedFrom: Math.floor(n / 2) };
  }
  // Stale cuts: before the progress record the progress facts are unset; before
  // the CCall opens there is no budget. Each cut answers for itself.
  const cuts = throughEach(source), rows = events(source);
  const progressAt = rows.findIndex(row => row.kind === 'retry_progress_recorded'), openedAt = rows.findIndex(row => row.kind === 'c_call_opened');
  assert.deepEqual(budgetOwner(cuts[progressAt - 1], scope), PROGRESS_UNSET, 'the cut before the progress record');
  assert.deepEqual(budgetOwner(cuts[openedAt - 1], scope), ABSENT_BUDGET, 'the cut before the CCall opens');
  // Authenticity: a copied prefix is not an owned selection, null scope included.
  for (const query of [scope, { ...scope, cCallRef: null }])
    assert.throws(() => budgetOwner(structuredClone(source), query), `a copied prefix refuses for ${query.cCallRef}`);

  // Visited work: the owner reads the CCall's related bucket and the basis
  // bucket of its scope. Unrelated growth adds no bucket row, body read or
  // index selection; related growth adds exactly its rows to the basis bucket.
  const meter = openMeasurer([new URL('../../build', import.meta.url).pathname]);
  t.after(() => meter.close());
  const visited = async (label, fixture) => {
    const prefix = select(fixture);
    const buckets = { related: selectorExtent(prefix, 'related:' + scope.cCallRef).count, basis: selectorExtent(prefix, 'basis:' + scope.basisRef).count,
      history: runtimeEventPrefixExtent(prefix).count };
    const { value, measurement } = await meter.measure(label, () => budgetOwner(prefix, scope));
    const calls = measurement.ownerCalls;
    return { value, buckets, bodyReads: calls['abg/event_prefix.js#runtimeEventAtPrefix'], selections: calls['abg/event_prefix.js#indexedRuntimeEventEnvelopes'],
      heapUsedDelta: measurement.heapUsedDelta };
  };
  const [baseWork, relatedWork, unrelatedWork] = [await visited('budget_base', base), await visited('budget_related_growth', variants.irrelevantScopes[0]),
    await visited('budget_unrelated_growth', variants.unrelatedGrowth[0])];
  assert.equal(unrelatedWork.buckets.history, baseWork.buckets.history + 8);
  assert.deepEqual([unrelatedWork.buckets, unrelatedWork.bodyReads, unrelatedWork.selections], [{ ...baseWork.buckets, history: unrelatedWork.buckets.history },
    baseWork.bodyReads, baseWork.selections], 'unrelated growth visits no further row');
  assert.equal(relatedWork.buckets.basis, baseWork.buckets.basis + 16, 'related growth enters the scope basis bucket');
  // Other Runs' rows are excluded at their envelopes, before any body read.
  assert.deepEqual([relatedWork.bodyReads, relatedWork.selections], [baseWork.bodyReads, baseWork.selections], 'related rows are visited within the same selections');
  assert.deepEqual([relatedWork.value, unrelatedWork.value], [baseWork.value, baseWork.value]);
  t.diagnostic(JSON.stringify({ variants: Object.keys(variants), forkQueries: forkTally, base: baseWork, related: relatedWork, unrelated: unrelatedWork }));
});

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

// RC7 HS03 (design §10.10): bounded stdout windows and the pre-decision flush.
// The actual-stream cases read the pinned historical metadata projection, named
// under ABI5_EVIDENCE_ROOT by path, sha256 and bytes (evidence-root.mjs; without
// the root both cases skip with the reason), as an external oracle only: recorded chunk byte
// lengths, qualifying stdout and result probe instants, start probes, policies,
// parsers and decisions. No historical row is admitted or relabelled; each
// replay admits its own events through the current owners. The oracle has no
// noise capture instant and no structured turn boundary: a noise chunk is held
// at the latest replayed actor-clock instant before it, and no turn closes a
// replayed window. Chunk bytes are synthesized lines of the recorded lengths.
import * as hs03Store from '../../build/code/src/abg/event_store.js';
import * as hs03Liveness from '../../build/code/src/abg/runtime_liveness.js';
import * as hs03Contracts from '../../build/code/src/abg/runtime_liveness_contracts.js';
import * as hs03Prefix from '../../build/code/src/abg/event_prefix.js';
import * as hs03Abg from '../../build/code/src/abg/index.js';
import { acquireNewEmptyAppendSinkFixture as hs03Sink } from '../support/new-empty-append-sink.mjs';
import { closeSync as hs03Close, mkdtempSync as hs03Mkdtemp, openSync as hs03Open, readFileSync as hs03Read, readSync as hs03ReadAt,
  rmSync as hs03Rm, writeFileSync as hs03Write } from 'node:fs';
import { createHash as hs03CreateHash } from 'node:crypto';
import { tmpdir as hs03Tmpdir } from 'node:os';
import { join as hs03Join } from 'node:path';
import hs03Process from 'node:process';
import { fileURLToPath as hs03FilePath } from 'node:url';
import { evidenceInput as hs03EvidenceInput } from '../support/evidence-root.mjs';

const HS03_METADATA_PIN = Object.freeze({ bytes: 46_684_229, sha256: '2c9328e4abb8e25f8fbfc7a1e4574e481fb5889bf17bc04108f2571d2d3536b9' });
// The RC12 H liveness oracle (an identical copy is under liveness-l2/oracle/).
const HS03_METADATA = hs03EvidenceInput({ path: 'work/T287_RELEASE_RESUMPTION_01/rc12-executive-01-evidence/liveness-h/oracle/hs03-metadata.json',
  ...HS03_METADATA_PIN });
const HS03_ACTUAL_STREAM = { skip: HS03_METADATA.kind === 'absent' ? HS03_METADATA.reason : false };
const HS03_WINDOW_MS = 30_000;
const HS03_TIME = '2026-11-07T00:00:00.000Z';
const hs03Hash = value => hs03Contracts.runtimeLivenessDigest(value);
// One synthesized line per recorded chunk: its marker, then padding, then a newline.
const hs03Line = (byteLength, qualifying) => (qualifying ? 'Q' : 'N') + '.'.repeat(byteLength - 2) + '\n';

// The oracle's per-actor chronology. A chunk qualifies when the recorded
// runtime admitted a stdout activity probe for it; its capture instant is
// that probe's elapsed time. A recorded structured_output artifact_pending
// probe marks a result chunk.
function hs03Chronology(m) {
  const actorClock = new Map(), probesByUnderlying = new Map();
  for (const contract of m.probeContracts)
    if (typeof contract.scope?.actorInvocationRef === 'string') actorClock.set(contract.scope.actorInvocationRef, contract.clockOriginRef);
  for (const [admissionOrdinal, eventId, , contractIndex, elapsedMs, signal, coverage, underlyingEventRef] of m.probes) {
    if (underlyingEventRef === null) continue;
    const contract = m.probeContracts[contractIndex];
    const list = probesByUnderlying.get(underlyingEventRef) ?? [];
    list.push({ admissionOrdinal, eventId, source: contract.source, actor: contract.scope?.actorInvocationRef ?? null, elapsedMs, signal, coverage });
    probesByUnderlying.set(underlyingEventRef, list);
  }
  const bindings = new Map(m.livenessBindings.map(b => [b.livenessBinding.clockOriginRef, b]));
  const scopes = m.scopes.map((scope, index) => {
    const actor = scope.actorInvocationRef, decisions = m.decisions.filter(d => d.payload.actorInvocationRef === actor);
    const started = decisions.filter(d => d.kind === 'actor_process_started');
    const timeouts = decisions.filter(d => d.kind === 'actor_process_timeout_observed');
    const binding = bindings.get(actorClock.get(actor)) ?? null;
    const startProbes = started.length !== 1 ? [] : (probesByUnderlying.get(started[0].eventId) ?? [])
      .filter(p => p.actor === actor).sort((a, b) => a.admissionOrdinal - b.admissionOrdinal);
    return { index, actor, processRef: scope.processRef, binding, decisions, started: started[0] ?? null, timeout: timeouts[0] ?? null,
      timeouts: timeouts.length, startProbes, chunks: [] };
  });
  for (const [admissionOrdinal, eventId, , scopeIndex, streamOrdinal, byteLength] of m.stdout) {
    const probes = (probesByUnderlying.get(eventId) ?? []).filter(p => p.actor === scopes[scopeIndex].actor);
    const activity = probes.filter(p => p.source === 'stdout' && p.signal === 'activity');
    const result = probes.filter(p => p.source === 'structured_output' && p.signal === 'artifact_pending');
    scopes[scopeIndex].chunks.push({ admissionOrdinal, eventId, streamOrdinal, byteLength, activityProbes: activity.length, resultProbes: result.length,
      qualifyingElapsedMs: activity[0]?.elapsedMs ?? null, resultElapsedMs: result[0]?.elapsedMs ?? null });
  }
  for (const scope of scopes) {
    scope.chunks.sort((a, b) => a.admissionOrdinal - b.admissionOrdinal);
    const activity = scope.startProbes.filter(p => p.signal !== 'coverage' && p.signal !== 'external_interruption' && p.coverage !== 'unavailable');
    scope.startActivity = activity.length === 0 ? null : Math.max(...activity.map(p => p.elapsedMs));
    let carry = scope.startProbes.length === 0 ? 0 : Math.max(...scope.startProbes.map(p => p.elapsedMs));
    scope.monotone = true;
    for (const chunk of scope.chunks) {
      const recorded = chunk.qualifyingElapsedMs;
      if (recorded !== null && recorded < carry) scope.monotone = false;
      chunk.qualifying = recorded !== null;
      chunk.result = chunk.resultElapsedMs;
      chunk.capture = recorded ?? carry;
      chunk.turnBoundary = false;
      carry = Math.max(carry, chunk.capture);
    }
    const policy = scope.binding?.livenessBinding.policy;
    scope.parser = scope.binding?.parser ?? null;
    scope.policy = policy === undefined ? null : hs03Contracts.constructRuntimeWatchdogPolicy({ startupMs: policy.startupMs,
      inactivityMs: policy.inactivityMs, hardCapMs: policy.hardCapMs, terminationGraceMs: policy.terminationGraceMs });
  }
  return { manifest: { physicalRows: m.physicalRows, stdoutRows: m.stdout.length, probeRows: m.probes.length, decisionRows: m.decisions.length,
    scopeCount: m.scopes.length, bindingCount: m.livenessBindings.length, eventKindCounts: m.eventKindCounts }, scopes };
}
let hs03Loaded = null;
function hs03Metadata() {
  if (hs03Loaded !== null) return hs03Loaded;
  const bytes = HS03_METADATA.bytes;
  assert.equal(bytes.length, HS03_METADATA_PIN.bytes, 'the metadata oracle keeps its pinned length');
  assert.equal(hs03CreateHash('sha256').update(bytes).digest('hex'), HS03_METADATA_PIN.sha256, 'the metadata oracle keeps its pinned digest');
  const m = JSON.parse(bytes.toString('utf8'));
  assert.deepEqual(m.stdoutColumns, ['admissionOrdinal', 'eventId', 'eventTime', 'scopeIndex', 'streamOrdinal', 'byteLength', 'chunkDigest']);
  assert.deepEqual(m.probeColumns, ['admissionOrdinal', 'eventId', 'eventTime', 'probeContractIndex', 'elapsedMs', 'signal', 'coverage',
    'underlyingEventRef', 'sourceDigest', 'sourceRevisionDigest']);
  hs03Loaded = hs03Chronology(m);
  return hs03Loaded;
}

// The documented window rule over capture instants: a chunk at or after the
// open window's first capture plus 30000 ms closes it first; a turn boundary
// closes the window holding it; the final window drains.
function hs03ModelWindows(chunks, finalClosure = 'drain') {
  const windows = [];
  let open = null;
  const close = closure => { windows.push(Object.freeze({ ...open, text: open.parts.join(''), closure })); open = null; };
  for (const chunk of chunks) {
    if (open !== null && chunk.capture - open.first >= HS03_WINDOW_MS) close('interval');
    open ??= { first: chunk.capture, last: chunk.capture, lastQualifying: null, result: null, byteLength: 0, count: 0, parts: [] };
    open.last = chunk.capture; open.byteLength += Buffer.byteLength(chunk.text); open.count += 1; open.parts.push(chunk.text);
    if (chunk.qualifying) open.lastQualifying = chunk.capture;
    if (chunk.result !== null) open.result = chunk.result;
    if (chunk.turnBoundary) close('turn_boundary');
  }
  if (open !== null) close(finalClosure);
  return windows;
}
const hs03RecordedText = chunk => hs03Line(chunk.byteLength, chunk.qualifying);

// One declared actor on a real current-profile store, built as the existing
// owners build it: execution basis, graph call, frame opening with its origin
// clock, the F_P CCall and fibre, transport binding with its native liveness
// declaration, invocation start and process start.
function hs03DeclareActor(store, { tag, policy, parser, archive = null }) {
  const time = HS03_TIME, correlationId = `correlation://rc7-hs03/${tag}`;
  const durable = () => hs03Store.selectHeldEventStoreDurablePrefix(store);
  const atDurable = (action, prefix = durable()) => hs03Store.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(store, prefix, action);
  const admit = candidate => hs03Store.admitRuntimeEvent(store, { eventTime: time, correlationId, workflowVersion: '5.0.0',
    causationEventRefs: [], ...candidate });
  const rawInputValue = { kind: 'rc7_hs03_input', tag };
  const basisBody = { basisClass: 'root', programRef: `program://rc7-hs03/${tag}`, graphFunctionRef: `graph-function://rc7-hs03/${tag}`,
    invocationRef: `invocation://rc7-hs03/${tag}`, rawInputValue, rawInputDigest: livenessRecordDigest(rawInputValue) };
  const basisDigest = hs03Hash(basisBody), basisRef = `execution-basis://abiogenesis/${basisDigest.slice(7)}`;
  admit({ kind: 'basis_admitted', scopeClass: 'workspace', basisId: basisRef, aggregateType: 'workspace',
    aggregateId: `workspace-binding://rc7-hs03/${tag}`, parentAggregateId: basisBody.invocationRef, payload: { basisRef, basisDigest, ...basisBody } });
  const runId = `run://rc7-hs03/${tag}`, graphCallId = `graph-call://rc7-hs03/${tag}`;
  const run = { scopeClass: 'run', basisId: basisRef, runId, graphFunctionRef: basisBody.graphFunctionRef };
  const graph = admit({ ...run, graphCallId, kind: 'graph_call_opened', aggregateType: 'graph_call', aggregateId: graphCallId,
    parentAggregateId: runId, payload: { graphCallId, graphCallDigest: hs03Hash({ tag, graphCallId }) } });
  const frameBody = { frameLineageId: `frame-lineage://rc7-hs03/${tag}`, attempt: 1, parentFrameId: null, runId, graphCallId,
    executionBasisRef: basisRef, invocationRef: basisBody.invocationRef, admittedInputRef: `input://rc7-hs03/${tag}`,
    admittedInputDigest: hs03Hash(rawInputValue) };
  const frameDigest = hs03Hash(frameBody), frameId = `frame://abiogenesis/${frameDigest.slice(7)}`;
  const scope = { ...run, graphCallId, frameId };
  const frameOrigin = hs03Liveness.captureNativeFrameBoundary(store);
  const frameOpened = atDurable(() => {
    const event = admit({ ...scope, frameLineageId: frameBody.frameLineageId, kind: 'frame_opened', aggregateType: 'frame', aggregateId: frameId,
      parentAggregateId: graphCallId, causationEventRefs: [graph.eventId], payload: { frameId, frameDigest, ...frameBody } });
    hs03Liveness.observeNativeFrameLiveness(store, event, frameOrigin, frameOrigin);
    return event;
  }).value;
  hs03Liveness.retainNativeFrameClock(store, frameOpened, frameOrigin);
  const cCallRef = `c-call://rc7-hs03/${tag}/actor`;
  const opened = admit({ ...scope, kind: 'c_call_opened', aggregateType: 'c_call', aggregateId: cCallRef, parentAggregateId: frameId,
    payload: { cCallRef, cCallDigest: hs03Hash({ tag, cCallRef }), callClass: 'leaf', attempt: 1, programLocusRef: `locus://rc7-hs03/${tag}`,
      taskOrdinal: null, vectorIndex: null, edgeRef: null } });
  const ids = { actorRef: `actor://rc7-hs03/${tag}`, workerBindingRef: `worker-binding://rc7-hs03/${tag}`,
    implementationRef: `implementation://rc7-hs03/${tag}`, implementationBindingRef: `implementation-binding://rc7-hs03/${tag}`,
    inputDigest: hs03Hash({ tag, input: true }), promptDigest: hs03Hash({ tag, prompt: true }), dispatchOrdinal: 1 };
  const fibre = admit({ ...scope, kind: 'c_call_fibre_selected', aggregateType: 'c_call', aggregateId: cCallRef, parentAggregateId: frameId,
    causationEventRefs: [opened.eventId], payload: { cCallRef, callClass: 'leaf', armId: `arm://rc7-hs03/${tag}`, regime: 'F_P',
      implementationRef: ids.implementationRef, implementationBindingRef: ids.implementationBindingRef } });
  const attemptDigest = hs03Hash({ basisRef, cCallRef, attempt: 1, dispatchOrdinal: ids.dispatchOrdinal, actorRef: ids.actorRef,
    workerBindingRef: ids.workerBindingRef, implementationBindingRef: ids.implementationBindingRef, implementationRef: ids.implementationRef,
    inputDigest: ids.inputDigest, promptDigest: ids.promptDigest });
  const transportPlanDigest = hs03Hash({ tag, plan: true });
  const bindingBody = { cCallRef, actorRef: ids.actorRef, workerBindingRef: ids.workerBindingRef, implementationRef: ids.implementationRef,
    implementationBindingRef: ids.implementationBindingRef, inputDigest: ids.inputDigest, dispatchOrdinal: ids.dispatchOrdinal,
    timeoutMs: policy.inactivityMs, absoluteTimeoutMs: policy.hardCapMs, terminationGraceMs: policy.terminationGraceMs, parser,
    agentKey: 'claude', transportPlanDigest,
    paths: { output: `file:///nonexistent/rc7-hs03/${tag}/output.json`, transport: `file:///nonexistent/rc7-hs03/${tag}/transport.json`,
      ...(archive === null ? {} : { stdout: archive.stdout }) },
    ...(archive === null ? {} : { archiveRoot: archive.root }),
    livenessBinding: { kind: 'runtime_liveness_binding', schemaVersion: '5.0.0', clockKind: 'native_monotonic_elapsed', policy,
      clockOriginRef: `runtime-clock://abiogenesis/${hs03Hash({ attemptDigest, transportPlanDigest }).slice(7)}`, sources: [...livenessSources(parser)] } };
  const transportBindingDigest = hs03Hash(bindingBody), transportBindingRef = `transport-binding://abiogenesis/${transportBindingDigest.slice(7)}`;
  const actorInvocationRef = `actor-invocation://abiogenesis/${hs03Hash({ attemptDigest, transportBindingRef, transportBindingDigest }).slice(7)}`;
  const processRef = `process://rc7-hs03/${tag}`;
  const started = atDurable(() => {
    const binding = admit({ ...scope, kind: 'actor_transport_binding_admitted', aggregateType: 'transport_binding', aggregateId: transportBindingRef,
      parentAggregateId: cCallRef, causationEventRefs: [fibre.eventId], payload: { transportBindingRef, transportBindingDigest, ...bindingBody } });
    return admit({ ...scope, kind: 'actor_invocation_started', aggregateType: 'actor_invocation', aggregateId: actorInvocationRef,
      parentAggregateId: cCallRef, causationEventRefs: [binding.eventId], payload: { actorInvocationRef, cCallRef, actorRef: ids.actorRef,
        workerBindingRef: ids.workerBindingRef, implementationRef: ids.implementationRef, inputDigest: ids.inputDigest,
        dispatchOrdinal: ids.dispatchOrdinal, promptDigest: ids.promptDigest, transportBindingRef, transportBindingDigest } });
  }).value;
  const processStarted = admit({ ...scope, kind: 'actor_process_started', aggregateType: 'process', aggregateId: processRef,
    parentAggregateId: actorInvocationRef, causationEventRefs: [started.eventId], payload: { actorInvocationRef, processRef, processId: 4242, cCallRef } });
  const context = () => hs03Liveness.projectActorLivenessContext(hs03Prefix.selectRuntimeEventPrefixFromStore(store), actorInvocationRef);
  assert.notEqual(context(), null, `${tag}: the declared actor context authenticates on the real store`);
  const observation = (source, underlying, signal, elapsedMs, coverage = 'observed') => {
    const c = context(), declaration = c.probes.find(row => row.source === source);
    return { kind: 'runtime_probe_observation', schemaVersion: '5.0.0', probeRef: declaration.probeRef, scopeDigest: hs03Hash(c.scope),
      clockOriginRef: c.binding.clockOriginRef, elapsedMs, underlyingObservationRef: underlying.eventId, underlyingEventRef: underlying.eventId,
      sourceDigest: underlying.payloadDigest, sourceRevisionDigest: null, evidenceRefs: [underlying.eventId], coverage, signal };
  };
  // The actor's own probe route: one transaction per observation at the durable head.
  const probe = (source, underlying, signal, elapsedMs, coverage = 'observed', predecessorPrefix = durable()) =>
    hs03Liveness.admitRuntimeActivityProbe({ store, predecessorPrefix, actorInvocationRef, source, eventTime: time, correlationId,
      observation: observation(source, underlying, signal, elapsedMs, coverage) });
  const envelope = { ...scope, eventTime: time, correlationId, workflowVersion: '5.0.0', causationEventRefs: [processStarted.eventId] };
  let streamOrdinal = 0;
  // The retained per-chunk row: one row per captured chunk, numbered by the caller.
  const chunkRow = (text, kind = 'actor_process_stdout_observed') => admit({ ...scope, kind, aggregateType: 'process', aggregateId: processRef,
    parentAggregateId: actorInvocationRef, causationEventRefs: [processStarted.eventId],
    payload: { actorInvocationRef, processRef, streamOrdinal: ++streamOrdinal, byteLength: Buffer.byteLength(text), chunkDigest: hs03Hash(text) } });
  // The current window route: the liveness owner stages one row and its probes in the active transaction.
  // Its W witness starts where the process's admitted stdout rows end and
  // keeps the window's capture clocks; a controlled window without modelled
  // first/last instants is captured at its qualifying instant.
  const stageWindow = window => {
    const captured = window.capturedQualifying !== undefined ? window.capturedQualifying : window.lastQualifying;
    const first = window.first ?? captured ?? 0, last = window.last ?? captured ?? first;
    return hs03Liveness.stageNativeStdoutWindow({ store, envelope, actorInvocationRef, processRef, text: window.text,
      window: { archiveOffset: hs03Liveness.nextNativeStdoutArchiveOffset(hs03Prefix.selectRuntimeEventPrefixFromStore(store), processRef),
        firstCaptureElapsedMs: first, lastCaptureElapsedMs: last, capturedQualifyingElapsedMs: captured },
      lastQualifyingElapsedMs: window.lastQualifying, resultElapsedMs: window.result });
  };
  const commitWindow = (window, prefix = durable()) => atDurable(() => stageWindow(window), prefix);
  const threshold = (elapsedMs, predecessorPrefix = durable()) => hs03Liveness.admitRuntimeThreshold({ store, predecessorPrefix,
    actorInvocationRef, processRef, elapsedMs, eventTime: time, correlationId });
  const projection = () => hs03Liveness.projectRuntimeLivenessAtPrefix(hs03Prefix.selectOwnedRuntimeEventPrefix(store), actorInvocationRef);
  const exit = (prefix = durable()) => atDurable(() => admit({ ...scope, kind: 'actor_process_exited', aggregateType: 'process', aggregateId: processRef,
    parentAggregateId: actorInvocationRef, causationEventRefs: [processStarted.eventId],
    payload: { actorInvocationRef, processRef, status: 0, signal: null } }), prefix);
  // An F_D CCall in the same frame: the frame producer and the CCall producer, as c_call admits its fibre.
  const deterministicCall = label => {
    const ref = `c-call://rc7-hs03/${tag}/${label}`;
    const callOpened = admit({ ...scope, kind: 'c_call_opened', aggregateType: 'c_call', aggregateId: ref, parentAggregateId: frameId,
      payload: { cCallRef: ref, cCallDigest: hs03Hash({ tag, ref }), callClass: 'leaf', attempt: 1, programLocusRef: `locus://rc7-hs03/${tag}/${label}`,
        taskOrdinal: null, vectorIndex: null, edgeRef: null } });
    const captured = hs03Liveness.captureNativeFrameBoundary(store);
    return { ref, callOpened, select: (inTransaction = false) => {
      const action = () => {
        const selected = admit({ ...scope, kind: 'c_call_fibre_selected', aggregateType: 'c_call', aggregateId: ref, parentAggregateId: frameId,
          causationEventRefs: [callOpened.eventId], payload: { cCallRef: ref, callClass: 'leaf', armId: `arm://rc7-hs03/${tag}/${label}`, regime: 'F_D',
            implementationRef: `implementation://rc7-hs03/${tag}/${label}` } });
        hs03Liveness.observeNativeFrameLiveness(store, selected, captured);
        hs03Liveness.observeNativeCCallLiveness(store, selected);
        return selected;
      };
      return inTransaction ? action() : atDurable(action).value;
    } };
  };
  return { store, tag, scope, frameOpened, processStarted, actorInvocationRef, processRef, cCallRef, durable, atDurable, admit, context,
    observation, probe, chunkRow, stageWindow, commitWindow, threshold, projection, exit, deterministicCall, envelope };
}

test('RC7 HS03 actual-stream: the pinned metadata declares each recorded actor, policy, start and qualifying chronology, and a recorded per-chunk prefix admits through the current owners', HS03_ACTUAL_STREAM, async t => {
  const loading = performance.now();
  const chronology = hs03Metadata();
  const loadedMs = performance.now() - loading;
  const { manifest, scopes } = chronology;
  assert.deepEqual([manifest.physicalRows, manifest.stdoutRows, manifest.probeRows, manifest.decisionRows, manifest.scopeCount, manifest.bindingCount],
    [170_487, 84_498, 85_006, 53, 24, 24], 'the oracle keeps its manifest counts');
  const chunks = scopes.flatMap(s => s.chunks);
  assert.equal(chunks.filter(c => c.qualifying).length, 83_866, 'recorded stdout rows with a qualifying activity probe');
  assert.equal(chunks.filter(c => !c.qualifying).length, 632, 'recorded stdout rows without one');
  assert.equal(chunks.every(c => c.activityProbes <= 1 && c.resultProbes <= 1), true, 'at most one qualifying and one result probe per recorded row');
  assert.equal(chunks.every(c => c.resultElapsedMs === null || c.resultElapsedMs === c.qualifyingElapsedMs), true,
    'a recorded result probe shares its row\'s qualifying instant');
  assert.equal(chunks.every(c => Number.isSafeInteger(c.byteLength) && c.byteLength >= 1), true, 'recorded byte lengths are positive');
  for (const scope of scopes) {
    const where = `scope ${scope.index}`;
    assert.notEqual(scope.binding, null, `${where}: its liveness binding joins by clock`);
    assert.notEqual(scope.policy, null, `${where}: its policy reconstructs`);
    assert.equal(scope.started !== null && scope.startProbes.length > 0, true, `${where}: its recorded process start and start probes`);
    assert.notEqual(scope.startActivity, null, `${where}: its recorded start activity`);
    assert.equal(scope.monotone, true, `${where}: recorded qualifying instants never regress`);
    assert.equal(scope.timeouts <= 1, true, `${where}: at most one recorded threshold`);
  }
  const timed = scopes.filter(s => s.timeout !== null);
  assert.equal(timed.length, 1, 'one recorded actor reached a threshold');
  assert.deepEqual([timed[0].timeout.payload.timeoutClass, timed[0].timeout.payload.timeoutMs], ['absolute', timed[0].policy.hardCapMs]);
  const kinds = scopes.flatMap(s => s.decisions).reduce((tally, d) => ({ ...tally, [d.kind]: (tally[d.kind] ?? 0) + 1 }), {});
  // Per-scope chronology and the documented window model over it.
  const perScope = scopes.map(s => {
    const windows = hs03ModelWindows(s.chunks.map(c => ({ ...c, text: 'x'.repeat(c.byteLength) })));
    return { scope: s.index, parser: s.parser, chunks: s.chunks.length, qualifying: s.chunks.filter(c => c.qualifying).length,
      results: s.chunks.filter(c => c.result !== null).length, bytes: s.chunks.reduce((n, c) => n + c.byteLength, 0),
      spanMs: s.chunks.length === 0 ? 0 : Math.round(s.chunks.at(-1).capture - s.chunks[0].capture), windows: windows.length,
      maxWindowChunks: Math.max(0, ...windows.map(w => w.count)), timeout: s.timeout?.payload.timeoutClass ?? null };
  });
  // One recorded actor on a real store: its policy, parser and start probes,
  // then a bounded recorded prefix through the retained per-chunk route.
  const scope = timed[0];
  const store = await hs03NewStore(t, 'oracle');
  const setupStarted = performance.now();
  const a = hs03DeclareActor(store, { tag: 'oracle', policy: scope.policy, parser: scope.parser });
  for (const p of scope.startProbes) a.probe(p.source, a.processStarted, p.signal, p.elapsedMs, p.coverage);
  const setupMs = performance.now() - setupStarted;
  assert.equal(a.projection()?.lastActivityElapsedMs, scope.startActivity, 'the replayed start probes give the recorded start activity');
  const prefix = scope.chunks.slice(0, 64);
  let oracle = scope.startActivity, admissionMs = 0, projectionMs = 0, transactions = 0;
  for (const chunk of prefix) {
    const admitting = performance.now();
    const row = a.chunkRow(hs03RecordedText(chunk)); transactions++;
    if (chunk.qualifying) { a.probe('stdout', row, 'activity', chunk.capture); transactions++; oracle = chunk.capture; }
    if (chunk.result !== null) { a.probe('structured_output', row, 'artifact_pending', chunk.result); transactions++; }
    admissionMs += performance.now() - admitting;
    const projecting = performance.now();
    assert.equal(a.projection()?.lastActivityElapsedMs, oracle, `per-chunk lastActivity after recorded row ${chunk.streamOrdinal}`);
    projectionMs += performance.now() - projecting;
  }
  const decision = a.threshold(scope.timeout.payload.thresholdObservation.elapsedMs);
  assert.equal(decision.kind, 'runtime_threshold_admitted', 'the recorded absolute instant admits its threshold');
  assert.equal(decision.timeoutClass, 'absolute');
  // The frame producer and the CCall producer on a second declared actor.
  const other = hs03DeclareActor(await hs03NewStore(t, 'producers'), { tag: 'producers', policy: scope.policy, parser: scope.parser });
  const call = other.deterministicCall('fd');
  const selected = call.select();
  const produced = other.store.readAll().filter(e => e.kind === 'runtime_activity_probe_observed' && e.causationEventRefs.includes(selected.eventId));
  assert.deepEqual(produced.map(e => e.payload.probeContract.source).sort(), ['event_log', 'frame_progress', 'frame_progress'],
    'the F_D fibre admits its frame probe and its two CCall probes');
  t.diagnostic(JSON.stringify({ loadedMs: Math.round(loadedMs), decisions: kinds, perScope }));
  t.diagnostic(JSON.stringify({ setupMs: Math.round(setupMs), rows: prefix.length, transactions, admissionMsPerTransaction: +(admissionMs / transactions).toFixed(3),
    projectionMsPerRead: +(projectionMs / prefix.length).toFixed(3) }));
});

// A bounded recorded run that holds a noise chunk and spans an interval window.
function hs03SelectReplay(scopes) {
  for (const minimumSpan of [2 * HS03_WINDOW_MS + 5_000, HS03_WINDOW_MS + 5_000]) for (const scope of scopes) {
    const chunks = scope.chunks;
    for (let start = 0; start < chunks.length; start++) {
      if (!chunks[start].qualifying) continue;
      let bytes = 0, noise = 0;
      for (let end = start; end < chunks.length && end - start < 2_000; end++) {
        const chunk = chunks[end];
        if (chunk.byteLength < 2 || (bytes += chunk.byteLength) > 8 * 1024 * 1024) break;
        if (!chunk.qualifying) noise++;
        if (noise > 0 && chunk.qualifying && chunk.capture - chunks[start].capture >= minimumSpan)
          return { scope, chunks: chunks.slice(start, end + 1), minimumSpan };
      }
    }
  }
  return null;
}
// The replay's capture classifier: each completed synthesized line is one
// recorded chunk, captured at its recorded (or held) actor-clock instant.
function hs03ReplayClassifier(planned) {
  let buffer = '', cursor = 0, capture = planned[0].capture, mismatches = 0;
  const classify = chunk => {
    buffer += chunk;
    let progress = false, newline;
    while ((newline = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, newline + 1);
      buffer = buffer.slice(newline + 1);
      const expected = planned[cursor++];
      if (expected === undefined || line !== hs03RecordedText(expected)) { mismatches++; continue; }
      capture = expected.capture;
      progress ||= expected.qualifying;
    }
    return { elapsedMs: capture, progress, result: false, turnBoundary: false };
  };
  return { classify, state: () => ({ cursor, mismatches, partial: buffer.length }) };
}
function hs03Range(path, offset, length) {
  const descriptor = hs03Open(path, 'r');
  try {
    const bytes = Buffer.alloc(length);
    assert.equal(hs03ReadAt(descriptor, bytes, 0, length, offset), length, 'the referenced archive range is complete');
    return bytes.toString('utf8');
  } finally { hs03Close(descriptor); }
}
const hs03NewStore = async (t, label) => (await hs03Sink(t, hs03Store.createNewEmptyAppendSink, `abi5-hs03-${label}-`)).store;

// One recorded actor through the current owners: its recorded start probes,
// every committed window (lastActivity checked after each), then its decision
// with the last window still pending, so only the shared pre-decision flush
// can make that window's activity visible to the durable decision.
async function hs03ReplayDecisions(t, scope, tally) {
  const where = `recorded scope ${scope.index}`;
  const a = hs03DeclareActor(await hs03NewStore(t, `decision-${scope.index}`), { tag: `decision-${scope.index}`, policy: scope.policy, parser: scope.parser });
  for (const p of scope.startProbes) { a.probe(p.source, a.processStarted, p.signal, p.elapsedMs, p.coverage); tally.probes++; }
  const cut = scope.timeout?.admissionOrdinal ?? Infinity;
  const withText = chunk => ({ ...chunk, text: hs03RecordedText(chunk) });
  const windows = hs03ModelWindows(scope.chunks.filter(c => c.admissionOrdinal < cut).map(withText), 'flush');
  const pending = windows.pop();
  let oracle = scope.startActivity;
  for (const window of windows) {
    const staged = a.commitWindow(window).value;
    tally.windows++; tally.rows++; tally.probes += staged.probes.length;
    assert.equal(staged.probes.length, (window.lastQualifying === null ? 0 : 1) + (window.result === null ? 0 : 1),
      `${where}: one activity probe and at most one result probe per window`);
    if (window.lastQualifying !== null) oracle = window.lastQualifying;
    assert.equal(a.projection()?.lastActivityElapsedMs, oracle, `${where}: lastActivity after committed window ${tally.windows}`);
  }
  const durableActivity = a.projection()?.lastActivityElapsedMs ?? null;
  const decisionOracle = pending.lastQualifying ?? oracle;
  let current = pending, flushed = 0;
  const unbind = hs03Store.bindNativeStdoutWindow(a.store, a.actorInvocationRef, () => {
    if (current === null) return null;
    const window = current;
    current = null; flushed++;
    a.stageWindow(window);
    return () => { current = window; };
  });
  const predecessor = a.durable(), elapsedMs = scope.timeout?.payload.thresholdObservation.elapsedMs ?? pending.last;
  let decision;
  try { decision = a.threshold(elapsedMs, predecessor); } finally { unbind(); }
  tally.windows++; tally.rows++; tally.flushes += flushed;
  assert.equal(flushed, 1, `${where}: the decision drains the pending window once`);
  assert.equal(current, null, `${where}: the committed flush leaves nothing pending`);
  const rows = a.store.readAll(), flushedRow = rows.findLast(e => e.kind === 'actor_process_stdout_observed');
  const flushedProbes = rows.filter(e => e.admissionOrdinal > flushedRow.admissionOrdinal && e.kind === 'runtime_activity_probe_observed' &&
    e.payload.observation.underlyingEventRef === flushedRow.eventId);
  tally.probes += flushedProbes.length;
  assert.deepEqual([flushedRow.payload.byteLength, flushedRow.payload.chunkDigest], [pending.byteLength, hs03Hash(pending.text)],
    `${where}: the flushed row carries exactly the pending window's bytes`);
  assert.equal(decision.projection.lastActivityElapsedMs, decisionOracle, `${where}: the decision sees the flushed window's last qualifying activity`);
  if (scope.timeout === null) {
    assert.equal(decision.kind, 'runtime_threshold_not_reached', `${where}: no recorded threshold and none derived`);
    assert.notEqual(decision.successorPrefix.coordinateDigest, predecessor.coordinateDigest, `${where}: the flush advanced the durable successor`);
    assert.deepEqual(decision.successorPrefix, a.durable(), `${where}: not_reached returns the durable head`);
    assert.equal(rows.every(e => e.admissionOrdinal <= flushedRow.admissionOrdinal || flushedProbes.includes(e)), true,
      `${where}: the not-reached decision admitted nothing after the flushed window`);
  } else {
    assert.equal(decision.kind, 'runtime_threshold_admitted', `${where}: the recorded absolute instant admits its threshold`);
    assert.deepEqual([decision.timeoutClass, decision.value.payload.timeoutClass, decision.value.payload.timeoutMs],
      [scope.timeout.payload.timeoutClass, scope.timeout.payload.timeoutClass, scope.timeout.payload.timeoutMs], `${where}: the recorded decision`);
    // The relation admits a threshold only over the exact cut before it, so
    // this places the committed flushed window inside the evaluated prefix.
    assert.deepEqual(rows.filter(e => e.admissionOrdinal > flushedRow.admissionOrdinal && e.admissionOrdinal < decision.value.admissionOrdinal),
      flushedProbes, `${where}: the flushed window ends the cut the threshold evaluated`);
    a.probe('process_lifecycle', decision.value, 'external_interruption', elapsedMs, 'observed', decision.successorPrefix);
    tally.probes++;
    for (const window of hs03ModelWindows(scope.chunks.filter(c => c.admissionOrdinal > cut).map(withText))) {
      const staged = a.commitWindow({ ...window, lastQualifying: null, result: null }).value;
      tally.windows++; tally.rows++;
      assert.equal(staged.probes.length, 0, `${where}: an interrupted window admits its row and no activity probe`);
    }
  }
  assert.throws(() => a.exit(predecessor), `${where}: the stale predecessor is refused`);
  a.exit();
  return { scope: scope.index, windows: windows.length + 1, decision: decision.kind, timeoutClass: decision.timeoutClass ?? null,
    discriminating: decisionOracle !== durableActivity };
}

test('RC7 HS03 actual-stream: recorded chunk cadence closes bounded archive windows in the real transport, and each recorded actor keeps its qualifying lastActivity, decision and durable successor', HS03_ACTUAL_STREAM, async t => {
  const chronology = hs03Metadata();
  // (A) The real transport over a bounded recorded chunk run.
  const replay = hs03SelectReplay(chronology.scopes);
  assert.notEqual(replay, null, 'a bounded recorded run holds a noise chunk and spans an interval');
  const scratch = hs03Mkdtemp(hs03Join(hs03Tmpdir(), 'abi5-hs03-stream-'));
  t.after(() => hs03Rm(scratch, { recursive: true, force: true }));
  const planPath = hs03Join(scratch, 'plan.json'), workerPath = hs03Join(scratch, 'replay-worker.mjs');
  const archivePath = hs03Join(scratch, 'archive', 'hs03-replay-stdout.log');
  hs03Write(planPath, JSON.stringify(replay.chunks.map(hs03RecordedText)));
  hs03Write(workerPath, ["import { readFileSync } from 'node:fs';", "const lines = JSON.parse(readFileSync(process.argv[2], 'utf8'));",
    'for (const line of lines) {', '  await new Promise(done => process.stdout.write(line, done));',
    '  await new Promise(done => setTimeout(done, 1));', '}', ''].join('\n'));
  const live = hs03ReplayClassifier(replay.chunks), classified = [], observations = [], flushes = [];
  const replayStarted = performance.now();
  const result = await hs03Abg.runWorkerTransport({
    contract: hs03Abg.constructKnownWorkerTransportContract('generic', { command: hs03Process.execPath, prefixArgs: [workerPath, planPath], environment: {} }),
    prompt: 'replay recorded chunk lengths', lane: 'worker_executes', cwd: scratch, archiveRoot: hs03Join(scratch, 'archive'),
    label: 'hs03-replay', timeoutMs: 60_000, absoluteTimeoutMs: 120_000, terminationGraceMs: 1_000, environment: {},
    observer: {
      classifyStdoutChunk: chunk => { const value = live.classify(chunk); classified.push({ ...value, text: chunk }); return value; },
      bindStdoutWindow: flush => { flushes.push(flush); },
      onStdoutObserved: (text, window) => {
        observations.push({ text, window: window ?? null, archived: window === undefined ? null : hs03Range(archivePath, window.archiveOffset, window.byteLength) });
        return true;
      },
    },
  });
  const replayMs = performance.now() - replayStarted;
  // The captured chunk sequence: as classified at capture, or, for a transport
  // that classifies nothing, as its per-chunk references.
  const after = hs03ReplayClassifier(replay.chunks);
  const received = classified.length > 0 ? classified : observations.map(o => ({ ...after.classify(o.text), text: o.text }));
  const expected = hs03ModelWindows(received.map(c => ({ capture: c.elapsedMs, qualifying: c.progress || c.result,
    result: c.result ? c.elapsedMs : null, turnBoundary: c.turnBoundary, text: c.text })));
  assert.equal(expected.length < received.length, true, `the recorded run gathers ${received.length} captured chunks into fewer windows`);
  assert.equal(observations.length, expected.length,
    `one stdout reference per closed window (${expected.length} windows), not per captured chunk (${received.length} chunks)`);
  assert.equal(result.disposition, 'success');
  assert.equal(flushes.length, 1, 'the transport hands its one scope flush capability at start');
  assert.deepEqual(live.state(), { cursor: replay.chunks.length, mismatches: 0, partial: 0 }, 'every recorded chunk was captured in order');
  let offset = 0;
  for (const [index, o] of observations.entries()) {
    const w = expected[index];
    assert.deepEqual(o.window, { archiveOffset: offset, byteLength: w.byteLength, firstCaptureElapsedMs: w.first, lastCaptureElapsedMs: w.last,
      lastQualifyingElapsedMs: w.lastQualifying, resultElapsedMs: w.result, closure: w.closure }, `window ${index + 1}`);
    assert.equal(o.text, w.text, `window ${index + 1} carries its captured text`);
    assert.equal(o.archived, w.text, `window ${index + 1}: its archive range is written before its one reference`);
    offset += w.byteLength;
  }
  const archived = hs03Read(archivePath, 'utf8');
  assert.equal(offset, Buffer.byteLength(archived), 'the windows partition the archive');
  assert.equal(archived, result.stdout);
  assert.equal(archived, replay.chunks.map(hs03RecordedText).join(''), 'the archive holds the replayed bytes once, in order');
  assert.equal(expected.some(w => w.closure === 'interval') && expected.at(-1).closure === 'drain', true, 'interval windows and one final drain');
  assert.equal(flushes[0](), null, 'after the drain nothing is pending');
  // (B) Every recorded actor's qualifying chronology and decision through the current store owners.
  const tally = { windows: 0, rows: 0, probes: 0, flushes: 0 }, decisions = [];
  const deciding = performance.now();
  for (const scope of chronology.scopes) decisions.push(await hs03ReplayDecisions(t, scope, tally));
  const decidingMs = performance.now() - deciding;
  assert.equal(decisions.length, chronology.scopes.length);
  assert.deepEqual(decisions.filter(d => d.decision === 'runtime_threshold_admitted').map(d => d.timeoutClass), ['absolute'],
    'the one recorded absolute decision is the one derived');
  assert.equal(decisions.some(d => d.discriminating), true, 'at least one decision depends on the flushed window');
  t.diagnostic(JSON.stringify({ replay: { scope: replay.scope.index, chunks: replay.chunks.length, received: received.length,
    noise: replay.chunks.filter(c => !c.qualifying).length, bytes: offset, windows: expected.map(w => ({ chunks: w.count, closure: w.closure })),
    minimumSpanMs: replay.minimumSpan, ms: Math.round(replayMs) } }));
  t.diagnostic(JSON.stringify({ decisions: { ...tally, discriminating: decisions.filter(d => d.discriminating).length, ms: Math.round(decidingMs),
    perScope: decisions.map(d => [d.scope, d.windows, d.decision === 'runtime_threshold_admitted' ? d.timeoutClass : 'not_reached']) } }));
});

// The actor's own start probes: process lifecycle activity, observed stream
// coverage, and the other declared sources unavailable.
function hs03StartProbes(a, parser, elapsedMs = 0) {
  for (const source of livenessSources(parser)) a.probe(source, a.processStarted, source === 'process_lifecycle' ? 'activity' : 'coverage', elapsedMs,
    ['process_lifecycle', 'stdout', 'stderr'].includes(source) ? 'observed' : 'unavailable');
}
// A transport stand-in for one actor scope: at most one pending window, taken
// by the scope flush and returned by its restore, as the transport holds it.
function hs03PendingScope(a) {
  const state = { current: null, flushed: 0, restored: 0 };
  const unbind = hs03Store.bindNativeStdoutWindow(a.store, a.actorInvocationRef, () => {
    if (state.current === null) return null;
    const window = state.current;
    state.current = null; state.flushed++;
    a.stageWindow(window);
    return () => { state.restored++; state.current = window; };
  });
  return { state, unbind, pend: window => { assert.equal(state.current, null, `${a.tag}: one pending window`); state.current = window; } };
}
const hs03Window = (lines, lastQualifying, result = null) => Object.freeze({ text: lines.join(''), lastQualifying, result });
// The actor's stderr row, numbered from the admitted stream rows as a windowed actor numbers it.
const hs03StderrRow = (a, text) => a.admit({ ...a.scope, kind: 'actor_process_stderr_observed', aggregateType: 'process', aggregateId: a.processRef,
  parentAggregateId: a.actorInvocationRef, causationEventRefs: [a.processStarted.eventId], payload: { actorInvocationRef: a.actorInvocationRef,
    processRef: a.processRef, streamOrdinal: hs03Liveness.nextNativeProcessStreamOrdinal(hs03Prefix.selectRuntimeEventPrefixFromStore(a.store), a.processRef),
    byteLength: Buffer.byteLength(text), chunkDigest: hs03Hash(text) } });
const hs03StreamRows = a => a.store.readAll().filter(e => e.aggregateId === a.processRef &&
  (e.kind === 'actor_process_stdout_observed' || e.kind === 'actor_process_stderr_observed'));
const hs03StagedWindowRows = a => hs03Prefix.indexedRuntimeEvents(hs03Prefix.selectRuntimeEventPrefixFromStore(a.store), 'aggregate:process:' + a.processRef)
  .filter(e => e.kind === 'actor_process_stdout_observed');
const HS03_SCOPE_POLICY = hs03Contracts.constructRuntimeWatchdogPolicy({ startupMs: 10_000, inactivityMs: 10_000, hardCapMs: 600_000, terminationGraceMs: 1_000 });

test('RC7 HS03 scopes: interleaved actor scopes on one store; frame and CCall producers drain no window, an actor probe and a threshold drain only their own scope, and a refused decision keeps its committed window', async t => {
  const store = await hs03NewStore(t, 'scopes');
  const a = hs03DeclareActor(store, { tag: 'scope-a', policy: HS03_SCOPE_POLICY, parser: 'claude_stream_json' });
  const b = hs03DeclareActor(store, { tag: 'scope-b', policy: HS03_SCOPE_POLICY, parser: 'claude_stream_json' });
  hs03StartProbes(a, 'claude_stream_json'); hs03StartProbes(b, 'claude_stream_json');
  const pa = hs03PendingScope(a), pb = hs03PendingScope(b);
  t.after(() => { pa.unbind(); pb.unbind(); });
  const windowRows = () => store.readAll().filter(e => e.kind === 'actor_process_stdout_observed');
  // Both scopes hold a pending window; the frame and CCall producers run.
  pa.pend(hs03Window([hs03Line(40, true), hs03Line(30, false)], 1_000));
  pb.pend(hs03Window([hs03Line(50, true)], 1_500));
  const selected = a.deterministicCall('scopes').select();
  const produced = store.readAll().filter(e => e.kind === 'runtime_activity_probe_observed' && e.causationEventRefs.includes(selected.eventId));
  assert.deepEqual(produced.map(e => e.payload.probeContract.source).sort(), ['event_log', 'frame_progress', 'frame_progress'],
    'the frame and CCall producers admit their own probes');
  assert.deepEqual([pa.state.flushed, pb.state.flushed, windowRows().length], [0, 0, 0], 'frame and CCall candidates carry no actor scope and drain no window');
  // The actor probe route: B's stderr probe drains B's window first, and only B's.
  const stderrB = hs03StderrRow(b, 'warn\n');
  assert.equal(stderrB.payload.streamOrdinal, 1);
  const probedB = b.probe('stderr', stderrB, 'activity', 1_600);
  assert.deepEqual([pa.state.flushed, pb.state.flushed, pb.state.restored], [0, 1, 0], 'the probe ingress drains only its own actor scope, once');
  const afterStderr = store.readAll().filter(e => e.admissionOrdinal > stderrB.admissionOrdinal);
  assert.deepEqual(afterStderr.map(e => [e.kind, e.payload.probeContract?.source ?? null]), [['actor_process_stdout_observed', null],
    ['runtime_activity_probe_observed', 'stdout'], ['runtime_activity_probe_observed', 'stderr']],
    'B\'s window row and its re-entrant probe precede the probe that drained them, in its transaction');
  assert.deepEqual([afterStderr[0].aggregateId, afterStderr[0].payload.streamOrdinal, afterStderr[1].payload.observation.elapsedMs],
    [b.processRef, 2, 1_500]);
  assert.deepEqual(probedB.successorPrefix, b.durable());
  assert.equal(b.projection().lastActivityElapsedMs, 1_600);
  // The threshold entry: A's pending window commits before A's durable decision, which sees it.
  assert.equal(a.projection().lastActivityElapsedMs, 0, 'A\'s durable activity before its decision');
  const predA = a.durable();
  const decidedA = a.threshold(2_000, predA);
  assert.equal(decidedA.kind, 'runtime_threshold_not_reached');
  assert.deepEqual([pa.state.flushed, pa.state.restored, pb.state.flushed], [1, 0, 1], 'the threshold drains A once; its own candidate ingress finds nothing pending');
  assert.equal(decidedA.projection.lastActivityElapsedMs, 1_000, 'the durable decision sees the flushed window\'s last qualifying activity');
  assert.notEqual(decidedA.successorPrefix.coordinateDigest, predA.coordinateDigest, 'the flush advanced the durable predecessor');
  assert.deepEqual(decidedA.successorPrefix, a.durable(), 'not_reached returns the actual durable successor');
  const flushedA = windowRows().at(-1);
  assert.deepEqual([flushedA.aggregateId, flushedA.payload.streamOrdinal, flushedA.payload.byteLength], [a.processRef, 1, 70]);
  // B's decision with nothing pending: no flush, no event, its own predecessor.
  const predB = b.durable();
  const decidedB = b.threshold(2_100, predB);
  assert.equal(decidedB.kind, 'runtime_threshold_not_reached');
  assert.deepEqual(decidedB.successorPrefix, predB, 'with nothing pending the decision returns its own predecessor');
  assert.deepEqual([decidedB.projection.lastActivityElapsedMs, pb.state.flushed], [1_600, 1]);
  // A decision refused after its flush keeps the window that flush committed.
  pa.pend(hs03Window([hs03Line(25, true)], 3_000));
  const predRefused = a.durable();
  assert.throws(() => a.threshold(2_500, predRefused), /threshold scope, clock, or source history refused/u,
    'a sample before the flushed window\'s activity refuses the decision');
  assert.deepEqual([pa.state.flushed, pa.state.restored, pa.state.current], [2, 0, null], 'the committed flush is not restored');
  assert.notEqual(a.durable().coordinateDigest, predRefused.coordinateDigest, 'the flush was durable before the decision');
  assert.equal(windowRows().at(-1).payload.chunkDigest, hs03Hash(hs03Line(25, true)));
  assert.equal(a.projection().lastActivityElapsedMs, 3_000);
  assert.deepEqual(hs03StreamRows(a).map(e => e.payload.streamOrdinal), [1, 2]);
  assert.deepEqual(hs03StreamRows(b).map(e => [e.kind, e.payload.streamOrdinal]), [['actor_process_stderr_observed', 1], ['actor_process_stdout_observed', 2]]);
});

test('RC7 HS03 scopes: an enclosing transaction owns a flushed window; rollback restores it and commit keeps it, then noise-only and result windows keep exact lastActivity', async t => {
  const store = await hs03NewStore(t, 'enclosing');
  const a = hs03DeclareActor(store, { tag: 'enclosing', policy: HS03_SCOPE_POLICY, parser: 'claude_stream_json' });
  hs03StartProbes(a, 'claude_stream_json');
  const pa = hs03PendingScope(a);
  t.after(pa.unbind);
  const windowRows = () => store.readAll().filter(e => e.kind === 'actor_process_stdout_observed');
  const committedTexts = [];
  // Rollback: the enclosing action fails after the scope flush staged the window.
  const pending = hs03Window([hs03Line(30, true), hs03Line(20, false)], 4_000);
  pa.pend(pending);
  const head = a.durable(), count = store.readAll().length;
  assert.throws(() => a.atDurable(() => {
    assert.equal(hs03Store.flushNativeStdoutWindow(store, a.actorInvocationRef), true);
    assert.equal(hs03StagedWindowRows(a).length, 1, 'the flush stages inside the enclosing transaction');
    throw new Error('rc7-hs03 enclosing refusal');
  }), /rc7-hs03 enclosing refusal/u);
  assert.deepEqual([pa.state.flushed, pa.state.restored], [1, 1]);
  assert.equal(pa.state.current, pending, 'rollback returns the taken window to its scope');
  assert.deepEqual([a.durable(), store.readAll().length, hs03StagedWindowRows(a).length], [head, count, 0], 'nothing of the rolled-back window remains');
  assert.equal(a.projection().lastActivityElapsedMs, 0);
  assert.throws(() => hs03Store.flushNativeStdoutWindow(store, a.actorInvocationRef), /active outer transaction/u, 'a flush never opens a transaction');
  // Commit: the frame and CCall producers and the scope flush in one enclosing transaction.
  const call = a.deterministicCall('enclosing');
  const committed = a.atDurable(() => ({ selected: call.select(true), flushed: hs03Store.flushNativeStdoutWindow(store, a.actorInvocationRef) }));
  committedTexts.push(pending.text);
  assert.equal(committed.value.flushed, true);
  assert.deepEqual([pa.state.flushed, pa.state.restored, pa.state.current], [2, 1, null], 'commit discards the restore');
  assert.deepEqual(committed.successorPrefix, a.durable());
  assert.equal(a.projection().lastActivityElapsedMs, 4_000);
  // A noise-only window admits its row and no probe; lastActivity holds.
  const noise = hs03Window([hs03Line(20, false), hs03Line(25, false)], null);
  pa.pend(noise);
  const predNoise = a.durable();
  const noiseDecision = a.threshold(4_100, predNoise);
  committedTexts.push(noise.text);
  const noiseRow = windowRows().at(-1);
  assert.equal(noiseDecision.kind, 'runtime_threshold_not_reached');
  assert.deepEqual([noiseRow.payload.byteLength, store.readAll().filter(e => e.payload?.observation?.underlyingEventRef === noiseRow.eventId).length], [45, 0]);
  assert.equal(noiseDecision.projection.lastActivityElapsedMs, 4_000, 'noise is not qualifying activity');
  assert.notEqual(noiseDecision.successorPrefix.coordinateDigest, predNoise.coordinateDigest);
  assert.deepEqual(noiseDecision.successorPrefix, a.durable());
  // A result window: both probes observe its one row at its last qualifying instant.
  const stderr = hs03StderrRow(a, 'note\n');
  const result = hs03Window([hs03Line(30, true), hs03Line(40, true)], 4_300, 4_200);
  pa.pend(result);
  a.probe('stderr', stderr, 'activity', 4_400);
  committedTexts.push(result.text);
  const resultRow = windowRows().at(-1);
  const resultProbes = store.readAll().filter(e => e.kind === 'runtime_activity_probe_observed' && e.payload.observation.underlyingEventRef === resultRow.eventId);
  assert.deepEqual(resultProbes.map(e => [e.payload.probeContract.source, e.payload.observation.signal, e.payload.observation.elapsedMs]),
    [['stdout', 'activity', 4_300], ['structured_output', 'artifact_pending', 4_300]]);
  const decided = a.threshold(4_500);
  assert.deepEqual([decided.kind, decided.projection.artifactState, decided.projection.disposition.disposition, decided.projection.lastActivityElapsedMs],
    ['runtime_threshold_not_reached', 'pending', 'inspect_archive', 4_400]);
  assert.throws(() => a.atDurable(() => hs03Liveness.stageNativeStdoutWindow({ store, envelope: a.envelope, actorInvocationRef: a.actorInvocationRef,
    processRef: a.processRef, text: hs03Line(10, true), window: { archiveOffset: 0, firstCaptureElapsedMs: 4_600, lastCaptureElapsedMs: 4_700,
      capturedQualifyingElapsedMs: 4_600 }, lastQualifyingElapsedMs: 4_600, resultElapsedMs: 4_700 })), /result lies outside its qualifying activity/u);
  // The stream relation worksite recovery checks: ordinals follow admission and stdout rows partition the stdout bytes.
  const stream = hs03StreamRows(a);
  assert.deepEqual(stream.map(e => e.payload.streamOrdinal), [1, 2, 3, 4]);
  assert.deepEqual(stream.filter(e => e.kind === 'actor_process_stdout_observed').map(e => [e.payload.byteLength, e.payload.chunkDigest]),
    committedTexts.map(text => [Buffer.byteLength(text), hs03Hash(text)]));
});

import { appendFileSync as hs03Append, realpathSync as hs03Realpath } from 'node:fs';

// W keeps its unwitnessed per-chunk stdout variant for direct stream owners
// and adds one declared window variant that carries the archive witness. A W
// store with retained per-chunk rows therefore takes window rows under the
// same W table, and no retained row is restamped or migrated.
test('RC7 HS03 historical: retained per-chunk rows keep their bytes, identities and W profile across cold reopen, and window rows after them add one archive witness under the declared W window variant', async t => {
  assert.equal(hs03Store.rootEventContractProfile(hs03Store.ROOT_EVENT_CONTRACT_DIGEST)?.name, 'window', 'new stores use W');
  assert.equal(hs03Store.LEGACY_ROOT_EVENT_CONTRACT_DIGEST, 'sha256:fc3a635040a6e3d763740ae54b6390944c7ea8cedfa060de110cb36e31ca6e3c', 'the legacy event contract is unchanged');
  const scratch = hs03Realpath(hs03Mkdtemp(hs03Join(hs03Tmpdir(), 'abi5-hs03-historical-archive-')));
  t.after(() => hs03Rm(scratch, { recursive: true, force: true }));
  const archive = { root: scratch, stdout: hs03Join(scratch, 'stdout.log') };
  const acquired = await hs03Sink(t, hs03Store.createNewEmptyAppendSink, 'abi5-hs03-historical-');
  const eventLogPath = hs03FilePath(acquired.prefix.eventLogRef);
  const a = hs03DeclareActor(acquired.store, { tag: 'historical', policy: HS03_SCOPE_POLICY, parser: 'claude_stream_json', archive });
  hs03StartProbes(a, 'claude_stream_json');
  // The retained per-chunk route: one archived chunk, its row, then its probe.
  const retained = [];
  for (const [index, elapsedMs] of [100, 200, 300].entries()) {
    const text = hs03Line(40 + index, true);
    hs03Append(archive.stdout, text);
    const row = a.chunkRow(text);
    a.probe('stdout', row, 'activity', elapsedMs);
    retained.push(row);
  }
  assert.deepEqual(retained.map(row => [row.eventContractDigest, Object.hasOwn(row.payload, 'stdoutWindow')]),
    retained.map(() => [hs03Store.ROOT_EVENT_CONTRACT_DIGEST, false]), 'retained per-chunk rows are unwitnessed W rows');
  const retainedRows = a.store.readAll(), retainedBytes = hs03Read(eventLogPath);
  const handoff = a.store.projectReopenAuthorityAndClose();
  const reopened = hs03Store.reopenEventStore(JSON.parse(JSON.stringify(handoff.reopenAuthority)));
  assert.equal(reopened.kind, 'reopened_event_store_context', JSON.stringify(reopened));
  const store = reopened.store;
  assert.deepEqual(store.readAll(), retainedRows, 'cold reopen keeps every retained row, eventId and payload digest');
  assert.equal(hs03Prefix.selectOwnedRuntimeEventPrefix(store) !== null, true);
  assert.equal(hs03Liveness.projectRuntimeLivenessAtPrefix(hs03Prefix.selectOwnedRuntimeEventPrefix(store), a.actorInvocationRef)?.lastActivityElapsedMs, 300,
    'the retained per-chunk probes replay cold');
  // A window row on the reopened store: its range starts after the retained chunks.
  const text = hs03Line(50, true) + hs03Line(30, false);
  const archiveOffset = retained.reduce((total, row) => total + row.payload.byteLength, 0);
  assert.equal(hs03Liveness.nextNativeStdoutArchiveOffset(hs03Prefix.selectRuntimeEventPrefixFromStore(store), a.processRef), archiveOffset);
  hs03Append(archive.stdout, text);
  const window = hs03Store.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(store, hs03Store.selectHeldEventStoreDurablePrefix(store),
    () => hs03Liveness.stageNativeStdoutWindow({ store, envelope: a.envelope, actorInvocationRef: a.actorInvocationRef, processRef: a.processRef,
      text, window: { archiveOffset, firstCaptureElapsedMs: 390, lastCaptureElapsedMs: 410, capturedQualifyingElapsedMs: 400 },
      lastQualifyingElapsedMs: 400, resultElapsedMs: null }));
  const row = window.value.row;
  assert.deepEqual([row.kind, row.eventContractDigest, Object.keys(row.payload).sort()],
    [retained[0].kind, retained[0].eventContractDigest, [...Object.keys(retained[0].payload), 'stdoutWindow'].sort()],
    'a window row adds only its witness to the retained W row shape');
  assert.deepEqual(row.payload.stdoutWindow, { kind: 'stdout_archive_window', archiveOffset, firstCaptureElapsedMs: 390,
    lastCaptureElapsedMs: 410, lastQualifyingElapsedMs: 400 });
  assert.deepEqual([row.payload.streamOrdinal, row.payload.byteLength, row.payload.chunkDigest], [retained.length + 1, Buffer.byteLength(text), hs03Hash(text)]);
  assert.deepEqual(window.value.probes.map(e => [e.payload.probeContract.source, e.payload.observation.elapsedMs]), [['stdout', 400]]);
  const extendedBytes = hs03Read(eventLogPath);
  assert.equal(extendedBytes.subarray(0, retainedBytes.length).equals(retainedBytes), true, 'the retained log bytes are a prefix of the extended log');
  // A second cold reopen replays retained per-chunk rows and adopts the window range.
  const extended = store.readAll();
  const again = hs03Store.reopenEventStore(store.projectReopenAuthorityAndClose().reopenAuthority);
  assert.equal(again.kind, 'reopened_event_store_context', JSON.stringify(again));
  t.after(() => again.store.closeDurableLog());
  assert.deepEqual(again.store.readAll(), extended);
  assert.deepEqual(again.store.readAll().slice(0, retainedRows.length), retainedRows, 'no retained row is migrated or relabelled');
  const cold = hs03Prefix.selectOwnedRuntimeEventPrefix(again.store);
  assert.equal(hs03Liveness.projectRuntimeLivenessAtPrefix(cold, a.actorInvocationRef)?.lastActivityElapsedMs, 400, 'window activity replays cold');
  const source = selectValidatedRuntimeEventPrefix(livenessFreeze([...again.store.readAll()]));
  const stdoutProbes = again.store.readAll().filter(e => e.kind === 'runtime_activity_probe_observed' && e.payload.probeContract.source === 'stdout');
  assert.deepEqual(stdoutProbes.map(e => e.payload.observation.signal), ['coverage', ...retained.map(() => 'activity'), 'activity'],
    'the startup coverage probe, one activity probe per retained chunk and one for the window');
  for (const event of stdoutProbes)
    assert.equal(livenessValidator(validatedRuntimeEventPrefixBeforeEvent(source, event.eventId), event), true, `stdout probe ${event.admissionOrdinal} validates cold at its cut`);
  const stdout = again.store.readAll().filter(e => e.kind === 'actor_process_stdout_observed');
  assert.deepEqual(stdout.map(e => e.payload.streamOrdinal), [1, 2, 3, 4]);
});
