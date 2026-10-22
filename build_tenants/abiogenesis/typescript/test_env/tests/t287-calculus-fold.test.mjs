// T-287 step 6: the pure Event Calculus fold, ROOT_DERIVED_RULES and the
// actor process lifecycle rule, over the built modules.
import assert from 'node:assert/strict';
import test from 'node:test';
import { createU1Fixture, prefixOf } from '../support/t287-native-work-currentness-consumers.mjs';
import { emptyFoldState, foldStep, ROOT_DERIVED_RULES } from '../../build/code/src/abg/calculus/index.js';
import { constructRuntimeFluent, deriveRuntimeEventCalculusProjection, eventCalculusDependencies, eventCalculusEffect,
  forkRuntimeEventCalculusAtForModuleTest } from '../../build/code/src/abg/event_calculus.js';
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
