import assert from 'node:assert/strict';
import test from 'node:test';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createU1Fixture, paths, hash, clone, prefixOf, current } from '../support/t287-native-work-currentness-consumers.mjs';
import { constructNativeWorksiteCommandExecutionTask } from '../../build/code/src/product/worksite_command_execution.js';
import { selectHeldEventStoreDurablePrefix } from '../../build/code/src/abg/event_store.js';
import { selectOwnedRuntimeEventPrefix, readOwnedRuntimeEventPrefixAtDurablePrefix,
  indexedRuntimeEvents } from '../../build/code/src/abg/event_prefix.js';
import { deriveRuntimeEventCalculusProjection, holdsAt, constructRuntimeFluent,
  projectNativeWorkRetiredObservations, eventCalculusDependencies } from '../../build/code/src/abg/event_calculus.js';
import { projectNativeWorkUnknownEffectTask, nativeWorkUnknownEffectDependencies } from '../../build/code/src/abg/native_work_effect.js';
import { worksiteCommandSourcesInvalidatedAfter, projectNativeWorkspaceWorkSourceAtPrefix,
  projectNativeWorkCommandSourceAtPrefix } from '../../build/code/src/abg/native_worksite_execution.js';
import { deepFreeze } from '../../build/code/src/shared/immutable.js';

// Both observations of the physically changed file are immutable predecessors.
// The shared fixture's default consumers retain their unchanged-file setup.
const fixture = (t, roots, options = {}) => createU1Fixture(t, roots,
  { ...options, priorSuccessorBytes: Buffer.from('prior successor\n') });

test('U1 fixture event handoffs match the exported owner contracts before effectful proof', async t => {
  const f = await fixture(t, ['target.txt', 'nested', 'nested/file.txt'], { withSource: true, preflight: true });
  f.cause(); f.cause('actor_invocation_failed'); f.exit();
  assert.equal(f.store.readAll().length, 0, 'preflight admits no synthetic preview rows');
  assert.ok(f.candidates.length > 25);
  t.diagnostic(`Closed-shape preflight covered ${f.candidates.length} candidates across ${new Set(f.candidates.map(row => row.kind)).size} existing event kinds; no runtime outcome credit.`);
});

test('U1 scope, currentness and cleanup agree at full, indexed, incremental and cold prefixes', async t => {
  const cases = [
    { roots: ['target.txt'], affected: ['target.txt'] },
    { roots: ['nested'], affected: ['nested/file.txt', 'nested/absent.txt'] },
    { roots: ['.'], affected: paths },
    { roots: [], affected: [] },
    { roots: ['target.txt', 'nested', 'nested/file.txt'], affected: ['target.txt', 'nested/file.txt', 'nested/absent.txt'] },
  ];
  for (const scenario of cases) await t.test(JSON.stringify(scenario.roots), async t => {
    const f = await fixture(t, scenario.roots), all = [...f.requests, f.successor, f.foreign];
    const prior = f.requests.find(r => r.subject.relativePath === 'target.txt').predecessorObservation;
    assert.equal(prior.state, 'file'); assert.equal(f.successor.predecessorObservation.state, 'file');
    assert.notEqual(prior.fileDigest, f.successor.predecessorObservation.fileDigest, 'the successor observes actually changed content');
    assert.notEqual(prior.observationRef, f.successor.predecessorObservation.observationRef, 'both distinct predecessor identities remain covered');
    const before = deriveRuntimeEventCalculusProjection(f.before);
    for (const r of all) assert.equal(current(before, r.predecessorObservation), true);
    const cause = f.cause(), owned = selectOwnedRuntimeEventPrefix(f.store), rows = f.store.readAll();
    assert.deepEqual(projectNativeWorkUnknownEffectTask(cause, f.beforeRows), f.task);
    const dependencies = eventCalculusDependencies(owned, cause, []);
    assert.deepEqual(projectNativeWorkUnknownEffectTask(cause, dependencies, f.before), f.task);
    const expected = [...f.requests, f.successor].filter(r => scenario.affected.includes(r.subject.relativePath))
      .map(r => r.predecessorObservation.observationRef);
    assert.deepEqual(projectNativeWorkRetiredObservations(cause, dependencies, f.before), expected);
    const warm = deriveRuntimeEventCalculusProjection(owned), full = deriveRuntimeEventCalculusProjection(prefixOf(rows));
    assert.deepEqual(warm, full);
    for (const r of all) assert.equal(current(warm, r.predecessorObservation), !expected.includes(r.predecessorObservation.observationRef));
    for (const name of ['actor_process_live', 'actor_cleanup_live', 'actor_cleanup_pending', 'actor_process_termination_unconfirmed'])
      assert.equal(holdsAt(warm, constructRuntimeFluent({ name, identity: f.processRef })), true);
    assert.equal(rows.some(row => row.kind === 'c_call_result_admitted'), false, 'unknown effect creates no Result or successor');
    assert.deepEqual(deriveRuntimeEventCalculusProjection(f.before), before, 'historical selection remains exact');
    f.exit(); // Existing Process event means confirmed owned-scope absence.
    const later = deriveRuntimeEventCalculusProjection(selectOwnedRuntimeEventPrefix(f.store)), laterRows = f.store.readAll();
    assert.deepEqual(later, deriveRuntimeEventCalculusProjection(prefixOf(laterRows)), 'indexed incremental confirmation agrees with a full prefix');
    for (const r of all) assert.equal(current(later, r.predecessorObservation), !expected.includes(r.predecessorObservation.observationRef),
      'confirmed cleanup cannot restore withdrawn C0 currentness');
    for (const name of ['actor_process_live', 'actor_cleanup_live'])
      assert.equal(holdsAt(later, constructRuntimeFluent({ name, identity: f.processRef })), false, 'confirmed absence ends physical liveness');
    assert.equal(holdsAt(later, constructRuntimeFluent({ name: 'actor_cleanup_pending', identity: f.processRef })), true,
      'Process confirmation does not complete Actor cleanup');
    assert.equal(holdsAt(later, constructRuntimeFluent({ name: 'actor_process_termination_unconfirmed', identity: f.processRef })), true,
      'historical uncertainty remains recorded');
    assert.deepEqual(laterRows.find(row => row.eventId === cause.eventId), cause, 'the original unknown-effect event is preserved');
    const coordinate = clone(selectHeldEventStoreDurablePrefix(f.store)); f.store.closeDurableLog();
    const cold = readOwnedRuntimeEventPrefixAtDurablePrefix(coordinate, { requireCurrent: true });
    assert.deepEqual(deriveRuntimeEventCalculusProjection(cold), later, 'cold lazy body read agrees with warm suffix');
    for (const path of paths) assert.equal(worksiteCommandSourcesInvalidatedAfter(cold, f.process.admissionOrdinal,
      f.canonicalRoot, [path]), scenario.affected.includes(path));
    assert.equal(worksiteCommandSourcesInvalidatedAfter(cold, f.process.admissionOrdinal, f.canonicalRoot + '/other', paths), false);
    assert.equal(worksiteCommandSourcesInvalidatedAfter(cold, cause.admissionOrdinal, f.canonicalRoot, paths), false);
    assert.equal(worksiteCommandSourcesInvalidatedAfter(cold, f.process.admissionOrdinal, f.canonicalRoot, [], ['.']), scenario.roots.length !== 0);
    assert.equal(worksiteCommandSourcesInvalidatedAfter(cold, f.process.admissionOrdinal, f.canonicalRoot, ['nested']), scenario.roots.includes('.') || scenario.roots.includes('nested'));
    assert.equal(worksiteCommandSourcesInvalidatedAfter(cold, f.process.admissionOrdinal, f.canonicalRoot, [], ['nested']),
      scenario.affected.includes('nested/file.txt'));
  });
});

test('U1 both unknown causes share authentication and preserve the transport failure', async t => {
  const f = await fixture(t), failure = f.cause('actor_invocation_failed'), prefix = selectOwnedRuntimeEventPrefix(f.store);
  assert.deepEqual(projectNativeWorkUnknownEffectTask(failure, f.beforeRows), f.task);
  const projection = deriveRuntimeEventCalculusProjection(prefix);
  assert.equal(holdsAt(projection, constructRuntimeFluent({ name: 'actor_invocation_failed', identity: f.actorRef })), true);
  assert.equal(current(projection, f.requests[0].predecessorObservation), false);
  assert.equal(worksiteCommandSourcesInvalidatedAfter(prefix, f.process.admissionOrdinal, f.canonicalRoot, ['target.txt']), true);
  assert.deepEqual(indexedRuntimeEvents(prefix, 'worksite-observation-dependency').filter(e => e.kind === failure.kind), [failure]);
});

test('U1 rejects absent, ambiguous, foreign, changed or causally late prerequisites and substituted causes', async t => {
  const f = await fixture(t), cause = f.cause(), prior = clone(f.beforeRows);
  const resign = event => ({ ...event, payloadDigest: hash(event.payload) });
  const check = (name, change, changedCause = cause) => {
    const rows = clone(prior); change(rows);
    assert.equal(projectNativeWorkUnknownEffectTask(deepFreeze(clone(changedCause)), deepFreeze(rows)), null, name);
  };
  for (const kind of ['actor_process_started', 'actor_invocation_started', 'actor_transport_binding_admitted',
    'c_call_opened', 'c_call_fibre_selected', 'invocation_admitted', 'implementation_admitted'])
    check(`missing ${kind}`, rows => { for (let i = rows.length - 1; i >= 0; i--) if (rows[i].kind === kind) rows.splice(i, 1); });
  check('no established child', rows => { const row = rows.find(e => e.kind === 'actor_process_started'); row.payload.processId = null; Object.assign(row, resign(row)); });
  for (const kind of ['actor_invocation_started', 'actor_transport_binding_admitted', 'actor_process_started', 'c_call_fibre_selected']) {
    const rows = clone(prior), original = rows.find(e => e.kind === kind), duplicate = clone(original);
    duplicate.eventId += '-duplicate'; rows.splice(rows.indexOf(original), 0, duplicate);
    rows.forEach((e, i) => { e.admissionOrdinal = i + 1; });
    assert.equal(projectNativeWorkUnknownEffectTask(deepFreeze({ ...cause, admissionOrdinal: cause.admissionOrdinal + 1 }), deepFreeze(rows)), null, `duplicate ${kind}`);
  }
  for (const field of ['basisId', 'runId', 'graphCallId', 'frameId', 'graphFunctionRef'])
    check(`foreign ${field}`, rows => { rows.find(e => e.kind === 'actor_process_started')[field] = 'foreign://scope'; });
  for (const [kind, field] of [['actor_invocation_started', 'actorRef'], ['actor_process_started', 'cCallRef'],
    ['actor_process_started', 'processRef'], ['actor_transport_binding_admitted', 'inputDigest'], ['actor_invocation_started', 'transportBindingRef']])
    check(`wrong ${kind}.${field}`, rows => { const row = rows.find(e => e.kind === kind); row.payload[field] = 'foreign://value'; Object.assign(row, resign(row)); });
  check('altered native task', rows => { rows.find(e => e.payload.basisRef === f.basis.basisRef).payload.rawInputValue.writeRoots = ['.']; });
  check('wrong admitted grant', rows => { rows.find(e => e.kind === 'invocation_admitted').payload.capabilityGrants = []; });
  check('wrong binding digest', rows => { rows.find(e => e.payload.basisRef === f.basis.basisRef).payload.workspaceBindingDigest = hash('foreign'); });
  check('altered digest', rows => { rows.find(e => e.kind === 'actor_invocation_started').payloadDigest = hash('foreign'); });
  check('missing cause relation', rows => { rows.find(e => e.kind === 'actor_transport_binding_admitted').causationEventRefs = []; });
  check('prerequisite after cause', rows => { rows.find(e => e.kind === 'actor_process_started').admissionOrdinal = cause.admissionOrdinal + 1; });
  check('wrong prerequisite order', rows => { const a = rows.find(e => e.kind === 'actor_invocation_started'), p = rows.find(e => e.kind === 'actor_process_started'); [a.admissionOrdinal, p.admissionOrdinal] = [p.admissionOrdinal, a.admissionOrdinal]; });
  const prefix = selectOwnedRuntimeEventPrefix(f.store);
  for (const forged of [{ ...cause, eventId: 'event://foreign' }, { ...cause, runId: 'run://foreign' },
    { ...cause, payload: { ...cause.payload, processRef: 'process://foreign' } }, { ...cause, payloadDigest: hash('foreign') }]) {
    assert.deepEqual(nativeWorkUnknownEffectDependencies(prefix, forged), []);
    assert.deepEqual(eventCalculusDependencies(prefix, forged, f.beforeRows), []);
  }
  assert.equal(projectNativeWorkUnknownEffectTask(cause, f.beforeRows, prefix), null, 'the optional prerequisite cut must precede the cause');
  assert.equal(worksiteCommandSourcesInvalidatedAfter(f.before, 0, f.canonicalRoot, ['target.txt']), false, 'an unselected cause has no effect');
  assert.equal(projectNativeWorkUnknownEffectTask(cause, deepFreeze([...f.beforeRows].reverse())), null,
    'an unordered carrier is not a total, gap-free admitted prefix');
});

test('U1 C2 current-source gate rejects affected input while immutable native provenance remains reusable', async t => {
  const f = await fixture(t, ['target.txt'], { withSource: true });
  const taskFor = relativePath => constructNativeWorksiteCommandExecutionTask({ workspaceAuthorityBasis: f.workspaceAuthorityBasis,
    workspaceBinding: f.workspaceBinding, capabilityGrant: f.capabilityGrant, sourceNativeWork: f.source,
    selectedSources: [{ relativePath, subjectUri: pathToFileURL(join(f.canonicalRoot, relativePath)).href }],
    commands: [{ commandId: 'command://u1', executable: 'node', args: ['--version'], relativeCwd: '.', environment: {},
      timeoutMs: 1000, terminationGraceMs: 100, expectedReports: [] }],
    outcomePredicates: [{ predicateId: 'predicate://u1', predicateKind: 'process_exit', declaration: { equals: 0, validationCommandId: 'command://u1' } }],
    allowedWriteTerritories: [{ pathKind: 'subtree', relativePath: 'evidence' }] });
  const affected = taskFor('target.txt'), sibling = taskFor('keep.txt');
  const provenance = projectNativeWorkspaceWorkSourceAtPrefix(f.before, f.source); assert.ok(provenance);
  assert.ok(projectNativeWorkCommandSourceAtPrefix(f.before, affected)); assert.ok(projectNativeWorkCommandSourceAtPrefix(f.before, sibling));
  f.cause();
  for (const prefix of [selectOwnedRuntimeEventPrefix(f.store), prefixOf(f.store.readAll())]) {
    assert.deepEqual(projectNativeWorkspaceWorkSourceAtPrefix(prefix, f.source), provenance);
    assert.equal(projectNativeWorkCommandSourceAtPrefix(prefix, affected), null);
    assert.ok(projectNativeWorkCommandSourceAtPrefix(prefix, sibling));
  }
  const coordinate = clone(selectHeldEventStoreDurablePrefix(f.store)); f.store.closeDurableLog();
  const cold = readOwnedRuntimeEventPrefixAtDurablePrefix(coordinate);
  assert.deepEqual(projectNativeWorkspaceWorkSourceAtPrefix(cold, f.source), provenance);
  assert.equal(projectNativeWorkCommandSourceAtPrefix(cold, affected), null);
  assert.ok(projectNativeWorkCommandSourceAtPrefix(cold, sibling));
});
