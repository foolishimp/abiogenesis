import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, lstat } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import v8 from 'node:v8';

const phase = new URL('.', import.meta.url);
const preparation = JSON.parse(await readFile(new URL('preparation.json', phase), 'utf8'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
async function checkedFile(pin) {
  const stat = await lstat(pin.path);
  assert(stat.isFile() && !stat.isSymbolicLink(), pin.path);
  const bytes = await readFile(pin.path);
  assert.equal(bytes.length, pin.byteCount, pin.path);
  assert.equal(sha(bytes), pin.sha256, pin.path);
  return bytes;
}
for (const row of preparation.ownerPins) {
  const source = await checkedFile(row.source);
  const built = await checkedFile(row.built);
  const installed = await checkedFile(row.installed);
  assert(built.equals(installed), row.source.path);
  assert(source.length > 0);
}
const owner = suffix => preparation.ownerPins.find(row => row.source.path.endsWith('/' + suffix + '.ts')).installed.path;
const { canonicalJson } = await import(pathToFileURL(owner('shared/canonical_json')));
const { sha256Canonical } = await import(pathToFileURL(owner('shared/digests')));
const { deepFreeze, isDeeplyFrozen } = await import(pathToFileURL(owner('shared/immutable')));
const { rawAdmitValue, isRawAdmittedValue } = await import(pathToFileURL(owner('validator/raw_admission')));
const { RuntimeDerivationSource } = await import(pathToFileURL(owner('abg/runtime_derivation')));
const {
  selectValidatedRuntimeEventPrefix, selectRuntimeEventPrefixFromAuthority,
  runtimeEventsFromValidatedPrefix, runtimeEventPrefixDigest,
} = await import(pathToFileURL(owner('abg/event_prefix')));
assert.equal(typeof global.gc, 'function', 'controlled diagnostic GC requires --expose-gc');
const started = new Date().toISOString();
const startWall = performance.now();
const samples = [];
function sample(label, details = {}) {
  const memory = process.memoryUsage();
  const heap = v8.getHeapStatistics();
  const row = { label, elapsedMs: performance.now() - startWall, ...memory,
    heapSizeLimit: heap.heap_size_limit, totalAvailableSize: heap.total_available_size, ...details };
  samples.push(row);
  return row;
}
async function collect(label, details = {}) {
  await new Promise(resolve => setImmediate(resolve));
  global.gc(); global.gc();
  return sample(label, details);
}
await collect('owners_loaded');
let states = [];
for (const input of preparation.authenticStateInputs) {
  let bytes = await checkedFile(input.value);
  const value = deepFreeze(JSON.parse(bytes));
  assert.equal(sha256Canonical(value), input.valueDigest);
  assert.equal(value.observations.length, input.observationCount);
  states.push({ input, value });
  bytes = undefined;
}
const stateLoaded = await collect('authentic_27_parent_values_retained', {
  count: states.length, physicalJsonBytes: preparation.authenticStateInputs.reduce((sum, row) => sum + row.value.byteCount, 0),
});
const canonicalRows = [];
for (const { input, value } of states) {
  const before = await collect('canonical_before', { ordinal: input.event.ordinal });
  const t = performance.now();
  let text = canonicalJson(value);
  const textWallMs = performance.now() - t;
  const textBytes = Buffer.byteLength(text);
  const digest = 'sha256:' + sha(text);
  assert.equal(digest, input.valueDigest);
  const textHeld = sample('canonical_text_held', { ordinal: input.event.ordinal, textBytes });
  text = undefined;
  const textReleased = await collect('canonical_text_released', { ordinal: input.event.ordinal });
  const ht = performance.now();
  assert.equal(sha256Canonical(value), digest);
  const hashWallMs = performance.now() - ht;
  const hashReturned = sample('incremental_hash_returned', { ordinal: input.event.ordinal });
  const hashCollected = await collect('incremental_hash_collected', { ordinal: input.event.ordinal });
  canonicalRows.push({ ordinal: input.event.ordinal, observationCount: input.observationCount, textBytes,
    textWallMs, hashWallMs, digest, before, textHeld, textReleased, hashReturned, hashCollected });
}

// This lane matches the current owner's one `facts.last` output policy. It does
// not claim the late runtime's other prefix/scope owners release earlier values.
const rawRows = [];
let lastRaw;
for (const { input, value } of states) {
  lastRaw = undefined;
  const before = await collect('raw_last_only_before', { ordinal: input.event.ordinal });
  const t = performance.now();
  lastRaw = rawAdmitValue(value, 'invocation_input', input.contractRef);
  const wallMs = performance.now() - t;
  assert(isRawAdmittedValue(lastRaw));
  assert.equal(lastRaw.subjectDigest, input.valueDigest);
  assert.equal(lastRaw.contractRef, input.contractRef);
  assert.equal(lastRaw.admissionRef, 'raw-admission://abiogenesis/' + sha256Canonical({
    contractRef: input.contractRef, expectedKind: 'invocation_input', subjectDigest: input.valueDigest,
  }).slice(7));
  assert.deepEqual(lastRaw.value, value);
  assert.notEqual(lastRaw.value, value);
  assert(isDeeplyFrozen(lastRaw.value));
  const returned = sample('raw_last_only_returned', { ordinal: input.event.ordinal });
  const collected = await collect('raw_last_only_collected', { ordinal: input.event.ordinal });
  rawRows.push({ ordinal: input.event.ordinal, observationCount: input.observationCount,
    wallMs, subjectDigest: lastRaw.subjectDigest, admissionRef: lastRaw.admissionRef,
    before, returned, collected });
}
lastRaw = undefined;
const rawReleased = await collect('raw_last_only_output_released');
// Counterfactual retained-output lane quantifies ownership, not actual live
// retainer identity. Every value is authentic; no RuntimeEvent is fabricated.
let heldRaw = states.map(({ input, value }) => rawAdmitValue(value, 'invocation_input', input.contractRef));
assert(heldRaw.every(isRawAdmittedValue));
const holdAll = await collect('controlled_all_27_raw_outputs_retained');
heldRaw = undefined;
const holdAllReleased = await collect('controlled_all_27_raw_outputs_released');
const caller = JSON.parse(await readFile(preparation.authenticStateInputs[0].value.path, 'utf8'));
const detached = rawAdmitValue(caller, 'invocation_input', preparation.authenticStateInputs[0].contractRef);
const priorKind = caller.kind;
caller.kind = 'diagnostic_caller_mutation';
assert.equal(detached.value.kind, priorKind);
assert.equal(detached.subjectDigest, preparation.authenticStateInputs[0].valueDigest);
const callerIsolation = true;
states = undefined;
await collect('parent_values_released');

const descriptor = JSON.parse(await checkedFile(preparation.boundedOwnerHistory));
let logicalBytes = await checkedFile(descriptor.logicalFixture);
let events = deepFreeze(logicalBytes.toString('utf8').trimEnd().split('\n').map(line => JSON.parse(line)));
logicalBytes = undefined;
assert.equal(events.length, 434);
assert.equal(sha256Canonical(events), descriptor.logicalFixture.eventVectorDigest);
const eventWeak = new WeakRef(events[events.length - 1]);
const scopes = [...new Set(events.map(event => event.runId).filter(value => typeof value === 'string'))]
  .map(runId => ({ runId }));
for (const invocationRef of new Set(events.map(event => event.payload?.invocationRef).filter(value => typeof value === 'string'))) {
  scopes.push({ invocationRef });
}
let cold = selectValidatedRuntimeEventPrefix(events);
const coldDigest = runtimeEventPrefixDigest(cold);
const coldScopeFacts = scopes.map(scope => {
  const selected = selectRuntimeEventPrefixFromAuthority(cold, scope);
  return { scope, eventIds: runtimeEventsFromValidatedPrefix(selected).map(event => event.eventId),
    digest: runtimeEventPrefixDigest(selected) };
});
cold = undefined;
const prefixLoaded = await collect('434_logical_events_and_cold_scalar_facts');
let source = new RuntimeDerivationSource();
let snapshot = source.snapshot(events.slice(0, 87));
let warm;
const prefixRows = [];
for (const length of [87, 174, 261, 348, 434]) {
  if (snapshot.length < length) snapshot = source.append(snapshot, events.slice(snapshot.length, length));
  const t = performance.now();
  warm = selectValidatedRuntimeEventPrefix(snapshot);
  const selectedFacts = scopes.map(scope => {
    const selected = selectRuntimeEventPrefixFromAuthority(warm, scope);
    return { scope, eventIds: runtimeEventsFromValidatedPrefix(selected).map(event => event.eventId),
      digest: runtimeEventPrefixDigest(selected) };
  });
  const wallMs = performance.now() - t;
  assert.equal(runtimeEventsFromValidatedPrefix(warm).length, length);
  if (length === events.length) {
    assert.equal(runtimeEventPrefixDigest(warm), coldDigest);
    assert.deepEqual(selectedFacts, coldScopeFacts);
  }
  prefixRows.push({ length, wallMs, selectedCounts: selectedFacts.map(row => ({ scope: row.scope, count: row.eventIds.length })),
    sample: await collect('warm_prefix_scope_owners_retained', { length }) });
}
const identityShared = runtimeEventsFromValidatedPrefix(warm).every((event, i) => event === events[i]);
assert(identityShared);
// Releasing snapshots leaves the source's exact ordinary scope/index facts.
// Invalidation is a diagnostic release operation, not runtime recovery.
events = undefined; snapshot = undefined; warm = undefined;
const sourceOnly = await collect('only_derivation_source_retained');
const sourceKeepsLastEvent = eventWeak.deref() !== undefined;
source.invalidate();
const invalidated = await collect('source_invalidated');
const invalidatedKeepsLastEvent = eventWeak.deref() !== undefined;
source = undefined;
const sourceReleased = await collect('source_released');
const releasedKeepsLastEvent = eventWeak.deref() !== undefined;

const report = {
  kind: 'bounded_existing_owner_memory_diagnostic', started, completed: new Date().toISOString(),
  wallMs: performance.now() - startWall,
  command: { executable: process.execPath, argv: process.execArgv.concat(process.argv.slice(1)),
    controlledGcOnly: true, heapLimitOverride: false },
  subject: { preparation: 'preparation.json', ownerCount: preparation.ownerPins.length,
    authenticParentCount: canonicalRows.length, boundedLogicalHistory: descriptor.logicalFixture,
    inputSourceCut: descriptor.cut },
  canonical: { stateLoaded, rows: canonicalRows },
  rawAdmission: { policy: 'last-only, then explicitly counterfactual hold-all', rows: rawRows,
    rawReleased, holdAll, holdAllReleased, callerIsolation },
  prefixScopes: { eventCount: 434, scopes, prefixLoaded, rows: prefixRows, coldWarmDigest: coldDigest,
    coldWarmValueAndIdentityAgreement: identityShared, sourceOnly, sourceKeepsLastEvent,
    invalidated, invalidatedKeepsLastEvent, sourceReleased, releasedKeepsLastEvent },
  samples,
  limits: { noCompleteLatePrefixRouteReproduction: true, noDominantFullRunRetainerClaim: true,
    noNativeRuntimeCurrentnessRecoveryOrUatCredit: true, noProductionChanges: true,
    actualLatePrefixPrerequisite: preparation.latePrefixApplicabilityLimit,
    rawHoldAllIsCounterfactualOnly: true, rssAndHeapSamplesAreNotContinuousPeaks: true,
    initialFixtureAllocationIncludesIndependentParsedParentCopies: true },
};
await writeFile(new URL('measurement.json', phase), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ kind: report.kind, parentCount: canonicalRows.length, eventCount: 434,
  scopeCount: scopes.length, wallMs: report.wallMs, ownerCorrespondencePassed: true,
  callerIsolation, sourceKeepsLastEvent, invalidatedKeepsLastEvent, releasedKeepsLastEvent }));
