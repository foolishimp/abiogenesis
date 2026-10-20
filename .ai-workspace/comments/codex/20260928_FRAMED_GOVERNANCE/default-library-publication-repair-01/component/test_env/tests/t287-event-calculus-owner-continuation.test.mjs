import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import * as prefixOwner from '../../build/code/src/abg/event_prefix.js';
import * as eventsOwner from '../../build/code/src/abg/event_store.js';
import { RuntimeDerivationSource } from '../../build/code/src/abg/runtime_derivation.js';
import { deepFreeze } from '../../build/code/src/shared/immutable.js';
import { sha256Bytes, sha256Canonical } from '../../build/code/src/shared/digests.js';

// Explicit CLOSED data, never an observation receipt or a resource route.
const root = resolve(import.meta.dirname, '../..');
const evidence = process.env.ABI5_EC_OWNER_EVIDENCE;
const fixture = process.env.ABI5_EC_OWNER_CLOSED_HISTORY;
assert.ok(evidence && fixture && process.env.ABI5_EC_OWNER_CLOSED_SHA256,
  'exact preimage territory and a digest-bound CLOSED JSONL fixture are required');
const bytes = await readFile(fixture);
assert.equal(sha256Bytes(bytes), process.env.ABI5_EC_OWNER_CLOSED_SHA256);
// The cold event owner expands the stored body-reference encoding from these
// bytes alone; it does not acquire a file or follow an embedded resource route.
const history = eventsOwner.validateHistoricalEvents(bytes);
const select = rows => prefixOwner.selectValidatedRuntimeEventPrefix(rows);
const cold = rows => select(deepFreeze(structuredClone(rows)));
const reports = [];

async function variant(name) {
  const counts = { ecProbeGuards: 0, livenessProbeGuards: 0, contextBindingGuards: 0, fluentValidations: 0 };
  const load = async owner => {
    const path = join(root, 'build/code/src/abg', owner + '.js');
    const source = await readFile(name === 'predecessor'
      ? join(evidence, 'preimage/build/code/src/abg', owner + '.js') : path, 'utf8');
    const module = new SourceTextModule(source, { identifier: path });
    await module.link(async spec => {
      const native = await import(spec.startsWith('node:') ? spec : pathToFileURL(resolve(dirname(path), spec)).href);
      const values = { ...native };
      if (spec === './runtime_liveness_contracts.js') {
        values.isRuntimeSystemProbeContract = value => {
          counts.livenessProbeGuards++;
          return native.isRuntimeSystemProbeContract(value);
        };
        values.isRuntimeLivenessBinding = value => { counts.contextBindingGuards++; return native.isRuntimeLivenessBinding(value); };
      }
      return new SyntheticModule(Object.keys(values), function () {
        for (const [key, value] of Object.entries(values)) this.setExport(key, value);
      });
    });
    await module.evaluate();
    return module.namespace;
  };
  const live = await load('runtime_liveness');
  // Keep the counter out of production source and isolated from other variants.
  const ecPath = join(root, 'build/code/src/abg/event_calculus.js');
  let ecSource = await readFile(name === 'predecessor'
    ? join(evidence, 'preimage/build/code/src/abg/event_calculus.js') : ecPath, 'utf8');
  ecSource = "import {count as cost33CountFluent} from 'cost33:diagnostic';\n" +
    ecSource.replace('function validateRuntimeFluent(fluent) {', 'function validateRuntimeFluent(fluent) { cost33CountFluent();');
  const module = new SourceTextModule(ecSource, { identifier: ecPath });
  await module.link(async spec => {
    const native = spec === 'cost33:diagnostic' ? { count: () => counts.fluentValidations++ }
      : spec === './runtime_liveness.js' ? live
      : await import(spec.startsWith('node:') ? spec : pathToFileURL(resolve(dirname(ecPath), spec)).href);
    const values = { ...native };
    if (spec === './runtime_liveness_contracts.js') values.isRuntimeSystemProbeContract = value => {
      counts.ecProbeGuards++; return native.isRuntimeSystemProbeContract(value);
    };
    return new SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    });
  });
  await module.evaluate();
  return { name, ec: module.namespace, live, counts };
}

test('COST33 preserves cold, suffix, reverse historical and scoped EC/liveness values', async () => {
  const before = await variant('predecessor'), after = await variant('successor');
  const probes = history.filter(e => e.kind === 'runtime_activity_probe_observed');
  assert.ok(probes.some(e => e.payload.probeContract.scope.actorInvocationRef !== null));
  assert.ok(probes.some(e => e.payload.probeContract.scope.cCallRef === null));
  const runId = probes[0].runId;
  const closures = history.filter(e => ['c_call_judged', 'frame_closed'].includes(e.kind));
  assert.ok(closures.length > 2 && new Set(probes.map(e => e.payload.observation.scopeDigest)).size > 2);
  const cuts = [...new Set([probes[0].admissionOrdinal, closures[0].admissionOrdinal,
    closures.at(-1).admissionOrdinal, history.length])].sort((a, b) => a - b);
  const source = new RuntimeDerivationSource(), results = [];
  for (const count of [...cuts, ...cuts.toReversed()]) {
    const rows = history.slice(0, count), warm = select(source.snapshot(rows));
    const expected = before.ec.deriveRuntimeEventCalculusProjection(cold(rows));
    const actual = after.ec.deriveRuntimeEventCalculusProjection(warm);
    assert.deepEqual(actual, expected, 'complete effects/holds/clips at ' + count);
    assert.deepEqual(after.ec.deriveRuntimeEventCalculusProjection(cold(rows)), expected, 'cold copy at ' + count);
    assert.deepEqual(after.live.projectRuntimeLivenessForScope(warm, runId),
      before.live.projectRuntimeLivenessForScope(cold(rows), runId), 'dispositions and digests at ' + count);
    const scoped = prefixOwner.selectRuntimeEventPrefixFromAuthority(warm, { runId });
    const oldScoped = prefixOwner.selectRuntimeEventPrefixFromAuthority(cold(rows), { runId });
    assert.deepEqual(after.ec.deriveRuntimeEventCalculusProjection(scoped), before.ec.deriveRuntimeEventCalculusProjection(oldScoped));
    for (const held of actual.holds) assert.equal(after.ec.runtimeFluentHoldsAtPrefix(warm, held), true);
    results.push({ count, calculusDigest: sha256Canonical(actual), livenessDigest: sha256Canonical(after.live.projectRuntimeLivenessForScope(warm, runId)) });
  }
  reports.push({ kind: 'cold_suffix_historical_scoped_conservation', events: history.length,
    independentProbeScopes: new Set(probes.map(e => e.payload.observation.scopeDigest)).size, results });
});

test('COST33 closures consume established scopes without reconstructing unrelated probes or owned fluents', async () => {
  const measures = [];
  for (const name of ['predecessor', 'successor']) {
    const api = await variant(name), source = new RuntimeDerivationSource();
    for (const event of history.filter(row => ['c_call_judged', 'frame_closed'].includes(row.kind))) {
        const rows = history.slice(0, event.admissionOrdinal - 1);
        api.ec.deriveRuntimeEventCalculusProjection(select(source.snapshot(rows)));
        const prior = { ...api.counts };
        api.ec.deriveRuntimeEventCalculusProjection(select(source.snapshot([...rows, event])));
        const priorProbes = rows.filter(row => row.kind === 'runtime_activity_probe_observed');
        const unrelated = priorProbes.filter(row => event.kind === 'c_call_judged'
          ? row.payload.probeContract.scope.cCallRef !== event.aggregateId
          : row.payload.probeContract.scope.cCallRef !== null || row.frameId !== event.frameId).length;
        const guards = api.counts.ecProbeGuards - prior.ecProbeGuards;
        if (name === 'successor') assert.equal(guards, 0, 'closure never re-admits old probe bodies');
        else assert.equal(guards, priorProbes.length, 'predecessor scans every old probe before matching');
        measures.push({ name, kind: event.kind, ordinal: event.admissionOrdinal, priorProbes: priorProbes.length, unrelated, probeGuards: guards });
    }
    api.ec.deriveRuntimeEventCalculusProjection(select(source.snapshot(history)));
    if (name === 'successor') assert.equal(api.counts.fluentValidations, 0, 'constructed internal fluents never re-enter the raw guard');
    else assert.ok(api.counts.fluentValidations > history.length);
    const full = select(source.snapshot(history));
    const actor = history.find(e => e.kind === 'actor_invocation_started');
    const context = api.live.projectActorLivenessContext(full, actor.aggregateId);
    assert.ok(context);
    const sample = api.live.projectRuntimeLivenessAtPrefix(full, actor.aggregateId).asOf;
    assert.ok(api.live.deriveRuntimeLiveness(full, context, sample));
    const prior = { ...api.counts };
    for (let i = 0; i < 3; i++) assert.ok(api.live.deriveRuntimeLiveness(full, context, sample));
    const repeatedContextGuards = api.counts.livenessProbeGuards - prior.livenessProbeGuards;
    assert.equal(repeatedContextGuards, name === 'successor' ? 0 : context.probes.length * 3);
    const copied = structuredClone(context), copyBefore = api.counts.livenessProbeGuards;
    assert.deepEqual(api.live.deriveRuntimeLiveness(full, copied, sample), api.live.deriveRuntimeLiveness(full, context, sample));
    assert.ok(api.counts.livenessProbeGuards > copyBefore, 'copied context retains raw admission');
    measures.push({ name, totals: { ...api.counts }, repeatedContextGuards, contextProbeCount: context.probes.length });
  }
  assert.ok(measures.some(row => row.unrelated > 1));
  reports.push({ kind: 'diagnostic_multiplicities_not_timing', measures });
});

test('COST33 preserves malformed observation/context refusal and duplicate declaration invalidation', async () => {
  const variants = [await variant('predecessor'), await variant('successor')];
  const actor = history.find(e => e.kind === 'actor_invocation_started');
  const activity = history.filter(e => e.kind === 'runtime_activity_probe_observed' && e.payload.actorInvocationRef === actor.aggregateId);
  const target = activity.at(-1), beforeRows = history.slice(0, target.admissionOrdinal - 1);
  const controls = [
    ['source', e => e.payload.observation.sourceDigest = sha256Canonical('foreign')],
    ['contract', e => e.payload.probeContract.sourceRef += '-foreign'],
    ['scope', e => e.payload.observation.scopeDigest = sha256Canonical('foreign')],
    ['clock', e => e.payload.observation.clockOriginRef += '-foreign'],
    ['future cause', e => e.payload.observation.underlyingEventRef = history.at(-1).eventId],
    ['elapsed', e => e.payload.observation.elapsedMs = -1],
    ['causation', e => e.causationEventRefs = []],
  ];
  for (const api of variants) {
    const before = cold(beforeRows);
    assert.equal(api.live.validateRuntimeLivenessEventAtPrefix(before, target), true);
    assert.equal(api.live.validateRuntimeLivenessEventAtPrefix(before, deepFreeze(structuredClone(target))), true);
    for (const [label, mutate] of controls) {
      const changed = structuredClone(target); mutate(changed); deepFreeze(changed);
      assert.equal(api.live.validateRuntimeLivenessEventAtPrefix(before, changed), false, api.name + '/' + label);
      assert.throws(() => api.ec.deriveRuntimeEventCalculusProjection(cold([...beforeRows, changed])), /exact admitted source\/threshold relation/);
    }
    const full = cold(history), context = api.live.projectActorLivenessContext(full, actor.aggregateId);
    const sample = api.live.projectRuntimeLivenessAtPrefix(full, actor.aggregateId).asOf;
    assert.ok(api.live.deriveRuntimeLiveness(full, context, sample));
    for (const mutate of [c => c.probes.push(structuredClone(c.probes[0])), c => c.probes[0].required = !c.probes[0].required,
      c => c.scope.programRef += '-foreign', c => c.declarationEventRef += '-foreign']) {
      const changed = structuredClone(context); mutate(changed);
      assert.equal(api.live.deriveRuntimeLiveness(full, changed, sample), null);
    }
    const source = new RuntimeDerivationSource(), warm = select(source.snapshot(beforeRows));
    assert.ok(api.live.projectActorLivenessContext(warm, actor.aggregateId));
    const duplicate = deepFreeze({ ...structuredClone(actor), admissionOrdinal: target.admissionOrdinal, eventId: actor.eventId + '/duplicate' });
    const delayed = deepFreeze({ ...structuredClone(target), admissionOrdinal: target.admissionOrdinal + 1 });
    const duplicateRows = [...beforeRows, duplicate], duplicateBefore = select(source.snapshot(duplicateRows));
    assert.equal(api.live.projectActorLivenessContext(duplicateBefore, actor.aggregateId), null);
    assert.equal(api.live.validateRuntimeLivenessEventAtPrefix(duplicateBefore, delayed), false);
    const later = select(source.snapshot([...duplicateRows, delayed]));
    assert.throws(() => api.ec.deriveRuntimeEventCalculusProjection(later), /exact admitted source\/threshold relation/);
    assert.ok(api.live.projectActorLivenessContext(warm, actor.aggregateId), 'historical original declaration remains valid');
    const fluent = api.ec.constructRunActiveFluent('run://cost33/raw');
    const forged = { ...fluent, fluentRef: fluent.fluentRef + '-forged' };
    assert.throws(() => api.ec.runtimeFluentKey(forged), /not canonical/);
    assert.throws(() => api.ec.runtimeFluentMatchesPattern(forged, api.ec.constructRuntimeFluentPattern({ name: 'run_active' })), /not canonical/);
    assert.throws(() => api.ec.validateRuntimeEventCalculusEffectForModuleTest({ initiates: [forged], terminates: [], clips: [], declips: [] }), /not canonical/);
    assert.throws(() => api.ec.validateRuntimeEventCalculusEffectForModuleTest({ initiates: [fluent], terminates: [fluent], clips: [], declips: [] }), /both initiate and terminate/);
  }
  reports.push({ kind: 'matched_raw_refusals', controls: controls.map(([label]) => label), copiedContextGuarded: true,
    duplicateInvalidation: true, historicalDeclarationPreserved: true, exportedFluentGuardsPreserved: true });
});

test('COST33 Event Calculus owner facts are discarded with an isolated transaction rollback', async () => {
  const scratch = await mkdtemp(join(tmpdir(), 'cost33-rollback-'));
  const acquired = eventsOwner.createNewEmptyAppendSink({ kind: 'new_empty_append_sink_request', schemaVersion: '5.0.0', eventLogPath: join(scratch, 'events.jsonl') });
  assert.ok('store' in acquired);
  try {
    const api = await variant('successor'), store = acquired.store;
    const candidate = name => ({ kind: 'public_operation_admitted', eventTime: '2026-09-26T00:00:00.000Z', aggregateType: 'workspace',
      aggregateId: 'invocation://cost33/' + name, parentAggregateId: null, causationEventRefs: [], correlationId: 'correlation://cost33',
      workflowVersion: '5.0.0', scopeClass: 'workspace', basisId: 'basis://cost33', payload: {
        invocationDigest: sha256Canonical(name), invocationRef: 'invocation://cost33/' + name, operationId: 'abg.operation.project.read', variant: 'status' } });
    const first = eventsOwner.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(store, acquired.prefix,
      () => eventsOwner.admitRuntimeEvent(store, candidate('first')));
    const original = api.ec.deriveRuntimeEventCalculusProjection(select(store.readAll()));
    let staged;
    assert.throws(() => eventsOwner.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(store, first.successorPrefix, () => {
      eventsOwner.admitRuntimeEvent(store, candidate('cancelled'));
      staged = api.ec.deriveRuntimeEventCalculusProjection(select(store.readAll()));
      throw Error('COST33 rollback');
    }), /COST33 rollback/);
    assert.equal(staged.effectRows.length, 2);
    assert.deepEqual(api.ec.deriveRuntimeEventCalculusProjection(select(store.readAll())), original);
    eventsOwner.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(store, first.successorPrefix,
      () => eventsOwner.admitRuntimeEvent(store, candidate('committed')));
    const committed = api.ec.deriveRuntimeEventCalculusProjection(select(store.readAll()));
    assert.deepEqual(committed, api.ec.deriveRuntimeEventCalculusProjection(cold(store.readAll())));
    assert.notEqual(committed.effectRows.at(-1).sourceEvent.eventId, staged.effectRows.at(-1).sourceEvent.eventId);
  } finally { acquired.store.closeDurableLog(); await rm(scratch, { recursive: true, force: true }); }
  reports.push({ kind: 'isolated_owner_rollback', stagedFactsDiscarded: true, successorEqualsCold: true });
});

test.after(async () => {
  assert.equal(sha256Bytes(await readFile(fixture)), process.env.ABI5_EC_OWNER_CLOSED_SHA256);
  await writeFile(join(evidence, 'owner-continuation-controls.json'), JSON.stringify({ fixture, sha256: process.env.ABI5_EC_OWNER_CLOSED_SHA256, reports }, null, 2) + '\n');
});
