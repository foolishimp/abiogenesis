import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, lstatSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import inspector from 'node:inspector';
import v8 from 'node:v8';

const phase = fileURLToPath(new URL('.', import.meta.url));
const prep = JSON.parse(readFileSync(phase + 'preparation.json', 'utf8'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
function checked(pin) {
  const st = lstatSync(pin.path); assert(st.isFile() && !st.isSymbolicLink());
  const bytes = readFileSync(pin.path);
  assert.equal(bytes.length, pin.byteCount); assert.equal(sha(bytes), pin.sha256);
  return bytes;
}
const source39 = JSON.parse(checked(prep.source39Preparation));
for (const row of source39.ownerPins) {
  checked(row.source); const built = checked(row.built), installed = checked(row.installed);
  assert(built.equals(installed));
}
checked(prep.closed38Freeze);
checked(prep.coordinateProvenance.handoff);
const owner = suffix => source39.ownerPins.find(row => row.source.path.endsWith('/' + suffix + '.ts')).installed.path;
const { sha256Canonical } = await import(pathToFileURL(owner('shared/digests')));
const { captureDurablePrefixCoordinate, validateDurablePrefixCoordinate, readRuntimeEventsAtDurablePrefix } =
  await import(pathToFileURL(owner('abg/event_store')));
assert.equal(typeof global.gc, 'function');
const body = prep.plainCoordinateBodyWithoutDigest;
const supplied = { ...body, coordinateDigest: sha256Canonical(body) };
const prefix = captureDurablePrefixCoordinate(supplied);
assert(validateDurablePrefixCoordinate(prefix));
assert.deepEqual(prefix, supplied);
writeFileSync(phase + 'selected-coordinate.json', JSON.stringify(prefix, null, 2) + '\n', { flag: 'wx' });

const started = new Date().toISOString(), t0 = performance.now();
const samples = [];
function sample(label) {
  const value = { label, elapsedMs: performance.now() - t0, ...process.memoryUsage(),
    heapSizeLimit: v8.getHeapStatistics().heap_size_limit };
  samples.push(value); return value;
}
async function collect(label) {
  await new Promise(resolve => setImmediate(resolve)); global.gc(); global.gc();
  return sample(label);
}
function checkpoint(stage, details = {}) {
  const row = { stage, at: new Date().toISOString(), ...details };
  writeFileSync(phase + 'progress.jsonl', JSON.stringify(row) + '\n', { flag: 'a' });
  console.log(JSON.stringify(row));
}
const baseline = await collect('owners_loaded_before_sampling');
const session = new inspector.Session(); session.connect();
const post = (method, params = {}) => new Promise((resolve, reject) => session.post(method, params,
  (error, result) => error ? reject(error) : resolve(result)));
const sampler = { samplingInterval: 1048576, includeObjectsCollectedByMajorGC: true,
  includeObjectsCollectedByMinorGC: true, attributionIsSampledAllocationsNotLiveRetainers: true };
let sampling = false;
try {
  await post('HeapProfiler.startSampling', { samplingInterval: sampler.samplingInterval,
    includeObjectsCollectedByMajorGC: true, includeObjectsCollectedByMinorGC: true });
  sampling = true; sampler.available = true;
} catch (error) {
  sampler.available = false; sampler.reason = String(error);
}
async function closeSampling() {
  if (!sampling) { session.disconnect(); return sampler; }
  sampling = false;
  try {
    const { profile } = await post('HeapProfiler.stopSampling');
    const allocations = [];
    function walk(node) {
      if (node.selfSize > 0) allocations.push({ selfSize: node.selfSize, nodeId: node.id,
        functionName: node.callFrame.functionName, url: node.callFrame.url,
        zeroBasedLineNumber: node.callFrame.lineNumber, zeroBasedColumnNumber: node.callFrame.columnNumber });
      for (const child of node.children ?? []) walk(child);
    }
    walk(profile.head); allocations.sort((a, b) => b.selfSize - a.selfSize);
    sampler.sampleCount = profile.samples.length;
    sampler.topAttributions = allocations.slice(0, 40);
    sampler.aggregateSelfSize = allocations.reduce((sum, row) => sum + row.selfSize, 0);
    const text = JSON.stringify({ settings: sampler, profile });
    if (Buffer.byteLength(text) <= 2097152) {
      writeFileSync(phase + 'allocation-sampling.json', text + '\n', { flag: 'wx' });
      sampler.smallRawProfileWritten = true;
    } else {
      writeFileSync(phase + 'allocation-sampling.json', JSON.stringify(sampler, null, 2) + '\n', { flag: 'wx' });
      sampler.smallRawProfileWritten = false; sampler.rawProfileByteCount = Buffer.byteLength(text);
    }
  } catch (error) { sampler.collectionError = String(error); }
  session.disconnect(); return sampler;
}

const before = sample('immediately_before_one_cold_acquisition');
checkpoint('cold_acquisition_start', { coordinateDigest: prefix.coordinateDigest, selectedBytes: prefix.prefixLength,
  samplingAvailable: sampler.available, before });
let events;
let acquisitionWallMs;
try {
  const t = performance.now();
  events = readRuntimeEventsAtDurablePrefix(prefix, { requireCurrent: true });
  acquisitionWallMs = performance.now() - t;
} catch (error) {
  const failure = { name: error?.name, code: error?.code, message: String(error), stack: error?.stack,
    at: new Date().toISOString(), sample: sample('owner_refusal_return') };
  await closeSampling();
  writeFileSync(phase + 'measurement.json', JSON.stringify({ kind: 'one_cold_acquisition_refused', started,
    completed: new Date().toISOString(), prefix, baseline, before, failure, sampler, samples,
    noReplayRecoveryOrRunAuthority: true }, null, 2) + '\n', { flag: 'wx' });
  checkpoint('owner_refusal', { name: failure.name, code: failure.code, message: failure.message });
  process.exitCode = 1;
}
if (events !== undefined) {
  const returned = sample('cold_acquisition_returned_events_retained');
  checkpoint('cold_acquisition_returned', { acquisitionWallMs, eventCount: events.length, returned });
  await closeSampling();
  const collected = await collect('events_retained_after_collection');
  assert.equal(events.length, prep.expectedLastOrdinal);
  let first = events[0], last = events.at(-1);
  assert.equal(first.admissionOrdinal, 1); assert.equal(last.admissionOrdinal, prep.expectedLastOrdinal);
  const lateOrdinals = [182516, 182546, 187573, 187613, 196530, 196560, 200361, 200517, 200547, 200564, 200568, 200571];
  const late = [];
  for (const event of events) {
    if (!lateOrdinals.includes(event.admissionOrdinal)) continue;
    const p = event.payload;
    const row = { ordinal: event.admissionOrdinal, eventId: event.eventId, kind: event.kind,
      eventTime: event.eventTime, payloadDigest: event.payloadDigest, eventContractDigest: event.eventContractDigest };
    for (const key of ['cCallRef', 'contractRef', 'resultRef', 'resultDigest', 'valueDigest', 'valueKind']) {
      if (typeof p?.[key] === 'string') row[key] = p[key];
    }
    if (p?.value?.kind === 'governance_work_state') {
      row.observationCount = p.value.observations.length; row.terminal = p.value.terminal;
      row.unresolvedSupportRefs = [...p.value.unresolvedSupportRefs];
    }
    late.push(row);
  }
  let parent = events.find(event => event.admissionOrdinal === 200547);
  assert.equal(parent.payload.valueDigest, source39.authenticStateInputs.at(-1).valueDigest);
  assert.equal(parent.eventId, source39.authenticStateInputs.at(-1).event.eventId);
  const lastEvent = { ordinal: last.admissionOrdinal, eventId: last.eventId, kind: last.kind,
    payloadDigest: last.payloadDigest, eventContractDigest: last.eventContractDigest };
  const firstEvent = { ordinal: first.admissionOrdinal, eventId: first.eventId, kind: first.kind };
  const vectorFrozen = Object.isFrozen(events), firstFrozen = Object.isFrozen(first), lastFrozen = Object.isFrozen(last);
  const eventWeak = new WeakRef(last);
  // No complete replay/route derivation or full canonical-event serialization.
  first = undefined; last = undefined; parent = undefined; events = undefined;
  const dropped = await collect('event_vector_reference_dropped');
  const stat = lstatSync(fileURLToPath(prefix.eventLogRef), { bigint: true });
  assert.equal(stat.dev, BigInt(prep.storeBefore.device)); assert.equal(stat.ino, BigInt(prep.storeBefore.inode));
  assert.equal(stat.size, BigInt(prep.storeBefore.byteCount));
  assert.equal(stat.mtimeNs.toString(), prep.storeBefore.mtimeNs);
  const report = { kind: 'one_complete_frozen_history_cold_owner_acquisition', started,
    completed: new Date().toISOString(), wallMs: performance.now() - t0, acquisitionWallMs,
    prefix, eventCount: prep.expectedLastOrdinal, firstEvent, lastEvent, lateOwnedIdentifiers: late,
    baseline, before, returned, collected, dropped, samples, sampler,
    vectorFrozen, firstFrozen, lastFrozen, lastEventStillReachableAfterDrop: eventWeak.deref() !== undefined,
    isolationLimit: 'Event vector and first/last/parent local references were dropped; existing owner/module caches and allocator behavior remain part of the process sample.',
    physicalOwnerChecks: 'Existing readRuntimeEventsAtDurablePrefix requireCurrent true authenticated device/inode/full physical SHA/length/envelopes/source bodies/profile/gap-free events.',
    noReplayProjectionAdmissionRecoveryNativeRunOrRuntimeAuthority: true, noHeapOverride: true,
    defaultHeapLimitBytes: baseline.heapSizeLimit, sampledAllocationsAreNotExactLiveRetainers: true,
    noFullCanonicalHistorySerializationOrFullStoreCopy: true,
    sourceStoreAfter: { device: Number(stat.dev), inode: Number(stat.ino), byteCount: Number(stat.size), mtimeNs: stat.mtimeNs.toString() },
  };
  writeFileSync(phase + 'measurement.json', JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  checkpoint('complete', { acquisitionWallMs, eventCount: prep.expectedLastOrdinal,
    retainedHeapUsed: collected.heapUsed, retainedRss: collected.rss, droppedHeapUsed: dropped.heapUsed });
}
