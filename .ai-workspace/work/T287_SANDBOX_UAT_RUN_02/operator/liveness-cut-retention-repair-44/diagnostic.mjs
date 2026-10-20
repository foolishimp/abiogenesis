import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, lstatSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import v8 from 'node:v8';
import { inspectLivenessCutRetention } from './inspect-cut-retention.mjs';

const phase = fileURLToPath(new URL('.', import.meta.url));
const variant = process.argv[2]; assert(['old', 'new'].includes(variant));
const prep = JSON.parse(readFileSync(phase + 'diagnostic.input.json', 'utf8'));
const root = variant === 'old' ? prep.oldRoot : prep.newRoot;
function checked(pin) {
  const st = lstatSync(pin.path); assert(st.isFile() && !st.isSymbolicLink());
  const b = readFileSync(pin.path); assert.equal(b.length, pin.byteCount);
  assert.equal(createHash('sha256').update(b).digest('hex'), pin.sha256); return b;
}
checked(variant === 'old' ? prep.oldLiveness : prep.newLiveness);
const owner = name => import(pathToFileURL(join(root, 'build/code/src', name + '.js')));
const eventsOwner = await owner('abg/event_store'), prefixOwner = await owner('abg/event_prefix');
const live = await owner('abg/runtime_liveness'), derivation = await owner('abg/runtime_derivation');
const { sha256Canonical } = await owner('shared/digests');
const coordinate = eventsOwner.captureDurablePrefixCoordinate(JSON.parse(checked(prep.coordinate)));
assert(eventsOwner.validateDurablePrefixCoordinate(coordinate));
assert.equal(typeof global.gc, 'function');
const started = new Date().toISOString(), start = performance.now(), samples = [];
const sample = label => {
  const row = { label, elapsedMs: performance.now() - start, ...process.memoryUsage(),
    heapSizeLimit: v8.getHeapStatistics().heap_size_limit }; samples.push(row); return row;
};
async function collect(label) {
  await new Promise(resolve => setImmediate(resolve)); global.gc(); global.gc(); return sample(label);
}
function progress(stage, facts = {}) {
  const row = { stage, at: new Date().toISOString(), variant, ...facts };
  writeFileSync(phase + variant + '.progress.jsonl', JSON.stringify(row) + '\n', { flag: 'a' });
  console.log(JSON.stringify(row));
}

// Authentic event vectors never escape this closed scope except through the
// deliberately held owner source. Returned facts contain scalars/digests only.
async function exercise() {
  await collect('before_one_cold_read');
  const at = performance.now();
  const events = eventsOwner.readRuntimeEventsAtDurablePrefix(coordinate, { requireCurrent: true });
  const coldWallMs = performance.now() - at;
  assert.equal(events.length, 200571);
  const coldReturned = sample('cold_read_returned');
  const coldHeld = await collect('cold_events_retained');
  progress('cold_read_closed', { eventCount: events.length, coldWallMs, memory: coldHeld });
  const source = new derivation.RuntimeDerivationSource();
  const full = prefixOwner.selectValidatedRuntimeEventPrefix(source.snapshot(events));
  const validate = live.createRuntimeLivenessEventValidator(full);
  const initial = await collect('liveness_reconstruction_without_cut_queries');
  const initialCache = await inspectLivenessCutRetention(source);
  const lastByActor = new Map();
  for (const event of events) {
    if (event.kind !== 'runtime_activity_probe_observed') continue;
    const scope = event.payload.probeContract?.scope;
    if (scope?.actorInvocationRef !== null && scope?.actorInvocationRef !== undefined)
      lastByActor.set(scope.actorInvocationRef, event);
  }
  const candidates = [...lastByActor.values()];
  assert(candidates.length >= prep.actorScopesSampled);
  const ordinals = [...new Set(Array.from({ length: prep.actorScopesSampled }, (_, i) =>
    Math.floor(i * (candidates.length - 1) / (prep.actorScopesSampled - 1))))];
  const selected = ordinals.map(index => candidates[index]);
  const acceptedFacts = [], steps = [];
  const projectionStart = performance.now();
  for (const event of selected) {
    const valid = validate(event);
    assert.equal(valid, true, 'authentic historical liveness relation at ' + event.admissionOrdinal);
    acceptedFacts.push({ eventRef: event.eventId, ordinal: event.admissionOrdinal,
      payloadDigest: event.payloadDigest, actorInvocationRef: event.payload.probeContract.scope.actorInvocationRef,
      underlyingEventRef: event.payload.observation.underlyingEventRef,
      elapsedMs: event.payload.observation.elapsedMs, accepted: valid });
    if ([1, 4, 8, 16].includes(acceptedFacts.length)) {
      const memory = await collect('after_' + acceptedFacts.length + '_distinct_actor_cuts');
      const cache = await inspectLivenessCutRetention(source);
      steps.push({ requestedActors: acceptedFacts.length, cache, memory });
      progress('cut_queries_closed', { requestedActors: acceptedFacts.length, cache, memory });
    }
  }
  const queryWallMs = performance.now() - projectionStart;
  for (const event of selected.toReversed()) assert.equal(validate(event), true, 'older result conserved');
  const repeatedCache = await inspectLivenessCutRetention(source);
  const held = await collect('completed_queries_owner_and_inputs_held');
  return { source, weakEvents: new WeakRef(events), weakAuthorityEvents: new WeakRef(full.events),
    weakLastEvent: new WeakRef(events.at(-1)), facts: { coldWallMs, queryWallMs, eventCount: events.length,
      initial, initialCache, coldReturned, coldHeld, steps, repeatedCache, held,
      acceptedFacts, acceptedFactDigest: sha256Canonical(acceptedFacts),
      lastEventRef: events.at(-1).eventId, lastOrdinal: events.at(-1).admissionOrdinal } };
}

let lease, report;
try {
  lease = await exercise();
  const ownerHeld = await collect('closed_caller_scope_owner_source_held');
  lease.source.invalidate();
  const afterInvalidate = await collect('disposable_source_invalidated');
  const invalidatedCache = await inspectLivenessCutRetention(lease.source);
  lease.source = undefined;
  const afterRelease = await collect('source_reference_released');
  const weakFacts = { eventsReachable: lease.weakEvents.deref() !== undefined,
    authorityEventsReachable: lease.weakAuthorityEvents.deref() !== undefined,
    lastEventReachable: lease.weakLastEvent.deref() !== undefined };
  const st = lstatSync(fileURLToPath(coordinate.eventLogRef), { bigint: true });
  assert.equal(st.dev, BigInt(prep.sourceLogStat.device)); assert.equal(st.ino, BigInt(prep.sourceLogStat.inode));
  assert.equal(st.size, BigInt(prep.sourceLogStat.byteCount)); assert.equal(st.mtimeNs.toString(), prep.sourceLogStat.mtimeNs);
  report = { kind: 'authentic_liveness_cut_cache_cost', variant, started, completed: new Date().toISOString(),
    wallMs: performance.now() - start, coordinate, facts: lease.facts, ownerHeld, afterInvalidate, afterRelease,
    invalidatedCache, weakFacts, samples, defaultHeap: true, noReplayOrRuntimeEffects: true,
    limitations: 'One cold pure-owner query pattern; retained vector counts are exact cache facts. Heap/RSS deltas include other owner facts and collector effects, not dominant native4GB attribution or whole-run closure.' };
  lease = undefined;
  progress('complete', { weakFacts, memory: afterRelease });
} catch (error) {
  report = { kind: 'authentic_liveness_cut_cache_cost_stopped', variant, started,
    completed: new Date().toISOString(), wallMs: performance.now() - start,
    failure: { name: error.name, message: String(error), stack: error.stack }, samples,
    noRetry: true, defaultHeap: true, noReplayOrRuntimeEffects: true };
  process.exitCode = 1; progress('stopped', { failure: report.failure });
}
writeFileSync(phase + variant + '.measurement.json', JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
