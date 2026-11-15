// T-287 single-address-space consolidation: the migrated callers use the
// existing owned prefix, held resource and digest owners. Every case runs the
// actual candidate owners over real history. The six retained-history cases
// read historical evidence under ABI5_EVIDENCE_ROOT and skip with the reason
// without it; every other case has no optional skip.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {access, mkdir, mkdtemp, readFile, realpath, rm} from 'node:fs/promises';
import fs from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {SourceTextModule, SyntheticModule} from 'node:vm';
import test from 'node:test';
import {packProduct} from '../../scripts/product-payload.mjs';
import {runInstalledLanguageTest} from '../support/installed-language-test.mjs';
import {constructInstalledStartCall} from '../support/registered-graph-selection.mjs';
import {prepareLanguageStructuralFixture} from '../support/language-structural-fixture.mjs';
import {GRAPH_EDGE_IDS, STRUCTURAL_IDS, constructStructuralInput} from '../fixtures/language-structural/program.mjs';
import {installedModules, populateSandbox, publicCaller, verifyArtifact} from '../uat/public-setup.mjs';
import {commandRecorder, exclusiveRecord} from '../uat/runner.mjs';
import {fileIdentity, fileSha256, freezeRaw, observeSetupCaller, openMeasurer, rawFhResponseSeed, schemaVersion,
  unrelatedWorkspaceEvent} from '../support/single-address-space-consolidation.mjs';
import {evidenceInput} from '../support/evidence-root.mjs';

const packageRoot = fileURLToPath(new URL('../..', import.meta.url));
// The retained RC5 history (25,016 rows) and the two native-02 records that
// name it and its measured RC4 context are historical evidence under
// ABI5_EVIDENCE_ROOT, each named by path, sha256 and bytes. The records exist
// only in the archived native-02 sandbox of the consolidation work record.
// Without the root the retained-history cases skip with the reason; with it,
// other bytes fail. The log is hashed once per file run, here; the gate keeps
// its path and its file identity (device, inode, size, mtime, ctime) at the
// hash, and each case checks that identity before and after its own reads
// instead of hashing the log again. Nothing is written under the root.
const NATIVE_02 = 'work/T287_RELEASE_RESUMPTION_01/single-address-space-consolidation-01/runtime-001/resources/archives/worksite-command-execution/'
  + '2b3dea4f262c179014aac48d5344bc5daf58762f843c02980fe1ff40bb503097/306d3afdae96a036435944bf0a420e059512a2a5bb0a7f30f42328e1ad073643/'
  + 'sandbox/consolidation-inputs/native-02/';
const RC5_LOG = {path: 'work/T287_RELEASE_RESUMPTION_01/rc5-performance-01/runtime-001/resources/events/runtime.events.jsonl',
  sha256: '532079454749d20def4aa6c02bac7bf591a369ef01cb5152462eaf07fa1cf20c', bytes: 586_361_364};
const retained = (() => {
  const record = (name, sha256, bytes) => {
    const input = evidenceInput({path: NATIVE_02 + name, sha256, bytes});
    return input.kind === 'absent' ? input : {kind: 'present', path: input.path, bytes, sha256, value: JSON.parse(input.bytes)};
  };
  const resources = record('EXTERNAL_READ_RESOURCES.json', '5934e0091ba7a7c0e19c740c4c9d90cbf0ed5c95bece381c5ac7764294cf4eac', 1105);
  const baseline = record('MEASURED_BASELINE.json', '774df7457d5c10945f6d58ea144747bc051bca36e88624680f6f17c056ec5a06', 5575);
  const log = evidenceInput(RC5_LOG);
  const absent = [resources, baseline, log].find(input => input.kind === 'absent');
  if (absent) return {kind: 'absent', reason: absent.reason};
  // The records name the same log bytes by their recorded absolute path.
  assert.equal(resources.value.readOnly, true, 'the retained event log is a read-only resource');
  assert.deepEqual([resources.value.eventLogSha256, resources.value.eventLogBytes], [RC5_LOG.sha256, RC5_LOG.bytes], 'the records name the retained RC5 log');
  const stat = fs.statSync(log.path, {bigint: true});
  const eventLogIdentity = {device: Number(stat.dev), inode: Number(stat.ino), size: Number(stat.size),
    mtimeNs: stat.mtimeNs.toString(), ctimeNs: stat.ctimeNs.toString()};
  assert.equal(eventLogIdentity.size, RC5_LOG.bytes, 'the hashed log is the file the cases read');
  return {kind: 'present', resources, baseline, eventLogPath: log.path, eventLogIdentity};
})();
const RETAINED = {skip: retained.kind === 'absent' ? retained.reason : false};
const proof = {kind: 'single_address_space_consolidation_proof', schemaVersion, sourcePreimage: 'f49e7533ebedff0946383cb0c5380a6ecac7889d',
  packageRoot, startedUtc: new Date().toISOString(), cases: {},
  limits: ['Same-process measurements of the actual candidate owners; inspector coverage perturbs absolute durations.',
    'Counts and bytes discriminate repeated work; wall and CPU values are recorded without a speedup claim.',
    'No release, qualification, publication or independent acceptance is implied.']};
const ownerCount = (row, key) => row.measurement.ownerCalls[key];
const sha256Hex = bytes => createHash('sha256').update(bytes).digest('hex');
// The shared public-operation classification: each consumer's class bucket, as
// event identities. Equal identity lists are the live/cold parity predicate.
const PUBLIC_OPERATION_CLASSES = ['abg.operation.run.invoke', 'abg.operation.interaction.respond', 'abg.operation.run.continue', 'abg.operation.project.read'];
const PUBLIC_CONTINUATION_CLASSES = ['construction_intent', 'selected_action', 'pending_execution'];
const classBuckets = (prefixes, prefix) => Object.fromEntries([
  ...PUBLIC_OPERATION_CLASSES.map(id => ['public-operation:' + id, prefixes.indexedRuntimeEventEnvelopes(prefix, 'public-operation:' + id).map(e => e.eventId)]),
  ...PUBLIC_CONTINUATION_CLASSES.map(kind => ['public-continuation:' + kind, prefixes.indexedRuntimeEventEnvelopes(prefix, 'public-continuation:' + kind).map(e => e.eventId)])]);
const summary = ({measurement}) => measurement;
// Liveness projections bind the evaluated prefix; unrelated growth may change
// only that binding, never the projected body.
const PREFIX_BINDING = new Set(['prefixDigest', 'projectionDigest', 'projectionRef']);
const unbound = value => Array.isArray(value) ? value.map(unbound) : value !== null && typeof value === 'object'
  ? Object.fromEntries(Object.entries(value).filter(([key]) => !PREFIX_BINDING.has(key)).map(([key, item]) => [key, unbound(item)])) : value;
const prefixBindings = (value, out = []) => {
  if (Array.isArray(value)) value.forEach(item => prefixBindings(item, out));
  else if (value !== null && typeof value === 'object') {
    if (typeof value.prefixDigest === 'string') out.push(value.prefixDigest);
    Object.values(value).forEach(item => prefixBindings(item, out));
  }
  return out;
};
// Retained history keeps its own exact profile: the measured coordinate of the
// same log bytes names it. The current W profile never labels these bytes.
// The two records agree on the log's recorded path; the cases read the log at
// its evidence-root path, which holds the same bytes.
const retainedProfile = (resources, baseline, events) => {
  const {eventLogPath: recordedPath, eventLogSha256, eventLogBytes} = resources.value, {logSha256, coordinate} = baseline.value;
  assert.equal(logSha256, eventLogSha256);
  assert.equal(coordinate.eventLogRef, pathToFileURL(recordedPath).href);
  assert.equal(coordinate.prefixLength, eventLogBytes);
  assert.equal(coordinate.prefixDigest, 'sha256:' + eventLogSha256);
  const profile = coordinate.storeIdentity.eventContractDigest;
  assert.equal(events.rootEventContractProfile(profile)?.current, false, 'the retained history keeps its non-current profile');
  return profile;
};

test('retained RC5 history: the owned prefix of the migrated liveness callers preserves the measured context with fewer event-log bytes, no full snapshot and no immutability walk', {...RETAINED, timeout: 600_000}, async t => {
  const {resources, baseline, eventLogPath, eventLogIdentity} = retained;
  const {eventLogSha256, eventLogBytes} = resources.value, measured = baseline.value;
  const identityBefore = await fileIdentity(eventLogPath);
  assert.equal(identityBefore.size, eventLogBytes);
  assert.deepEqual(identityBefore, eventLogIdentity, 'retained log identity before reads: the file the gate hashed');
  const load = name => import(pathToFileURL(join(packageRoot, 'build/code/src', name + '.js')).href);
  const [events, prefixes, liveness, derivation, digests] = await Promise.all(
    ['abg/event_store', 'abg/event_prefix', 'abg/runtime_liveness', 'abg/runtime_derivation', 'shared/digests'].map(load));
  const eventContractDigest = retainedProfile(resources, baseline, events);
  const body = {kind: 'durable_prefix_coordinate', schemaVersion, eventLogRef: pathToFileURL(eventLogPath).href,
    prefixLength: identityBefore.size, prefixDigest: 'sha256:' + eventLogSha256,
    storeIdentity: {device: identityBefore.device, inode: identityBefore.inode, eventContractDigest}};
  assert.equal(body.storeIdentity.eventContractDigest, measured.coordinate.storeIdentity.eventContractDigest);
  const coordinate = {...body, coordinateDigest: digests.sha256Canonical(body)};
  const meter = openMeasurer([join(packageRoot, 'build')]);
  t.after(() => meter.close());
  const watch = {watchPaths: [eventLogPath]};

  // Cold read-only acquisition is the separate raw boundary; it keeps its checks.
  const cold = await meter.measure('cold_readonly_authentication', () => events.readOwnedRuntimeHistoryAtDurablePrefix(coordinate, {requireCurrent: true}), watch);
  const history = cold.value;
  assert.equal(history.length, 25016);
  const cut = history.cut(measured.subject.ordinal), envelope = cut.row(cut.length - 1).envelope;
  assert.equal(envelope.eventId, measured.subject.eventRef);
  assert.equal(envelope.frameId, measured.subject.frameId);
  // Migrated callers: selectRuntimeEventPrefixFromStore/selectOwnedRuntimeEventPrefix.
  const owned = await meter.measure('owned_prefix_and_liveness', () => {
    const prefix = prefixes.selectOwnedRuntimeEventPrefix(cut);
    return {prefix, context: liveness.projectFrameLivenessContext(prefix, envelope.frameId)};
  }, watch);
  // Replaced callers: selectValidatedRuntimeEventPrefix(store.readAll()).
  let expandedPrefix;
  const expanded = await meter.measure('expanded_full_history_prefix', () => {
    expandedPrefix = prefixes.selectValidatedRuntimeEventPrefix(new derivation.RuntimeDerivationSource().snapshot(cut.materialize()));
  }, watch);
  const expandedContext = await meter.measure('expanded_prefix_liveness', () => liveness.projectFrameLivenessContext(expandedPrefix, envelope.frameId), watch);
  assert.notEqual(owned.value.context, null);
  assert.deepEqual(expandedContext.value, owned.value.context, 'owned and expanded prefixes project one exact context');
  const contextDigest = digests.sha256Canonical(owned.value.context);
  assert.equal(contextDigest, measured.contextDigest, 'candidate context equals the measured RC4 runtime context');
  assert.deepEqual(prefixes.runtimeEventPrefixExtent(owned.value.prefix), prefixes.runtimeEventPrefixExtent(expandedPrefix));
  assert.equal(prefixes.runtimeEventPrefixExtent(owned.value.prefix).count, measured.subject.ordinal);
  const expandedEvents = expandedPrefix.events;
  expandedPrefix = null;
  const repeat = await meter.measure('owned_prefix_and_liveness_repeat',
    () => liveness.projectFrameLivenessContext(prefixes.selectOwnedRuntimeEventPrefix(cut), envelope.frameId), watch);
  assert.deepEqual(repeat.value, owned.value.context);
  // Value identity of the whole cut: the owned rows are the expanded bodies.
  const subject = prefixes.runtimeEventAtPrefix(owned.value.prefix, envelope.eventId);
  assert.deepEqual(subject, expandedEvents.at(-1));

  // Reduced repeated work on the same input, not relocated work.
  const ownedWork = summary(owned), expandedWork = summary(expanded);
  t.diagnostic(JSON.stringify([cold, owned, expanded, expandedContext, repeat].map(row => ({name: row.measurement.name,
    wallMs: Math.round(row.measurement.wallMs), io: row.measurement.io, calls: row.measurement.ownerCalls}))));
  // Decoded-row counts are recorded, not compared: the owned path decodes the
  // selected rows it needs, the replaced path decodes every complete body.
  assert.ok(ownedWork.io.watchedReadBytes < expandedWork.io.watchedReadBytes, 'owned path reads fewer event-log bytes');
  assert.equal(ownerCount(owned, 'isImmutableRuntimeValue'), 0, 'owned path repeats no immutability walk');
  assert.ok(ownerCount(expanded, 'isImmutableRuntimeValue') > 0, 'the replaced path walks every materialized body');
  assert.equal(ownerCount(owned, 'snapshot'), 0, 'owned path creates no complete-history snapshot');
  assert.ok(ownerCount(expanded, 'snapshot') >= 1);
  assert.equal(ownerCount(owned, 'selectValidatedRuntimeEventPrefix'), 0);
  assert.equal(ownerCount(owned, 'readAuthenticatedRuntimePrefixBytes'), 0, 'no hidden cold reacquisition inside the owned path');
  assert.equal(summary(repeat).io.watchedReadBytes, 0, 'warm repeat reads no event-log bytes');
  assert.equal(ownerCount(repeat, 'decodeEventBody'), 0, 'warm repeat decodes no body');

  const identityAfter = await fileIdentity(eventLogPath);
  assert.deepEqual(identityAfter, identityBefore);
  assert.deepEqual(identityAfter, eventLogIdentity, 'retained log identity after reads: the file the gate hashed');
  proof.cases.retainedHistory = {eventLog: {path: eventLogPath, bytes: eventLogBytes, sha256Before: eventLogSha256,
    sha256After: eventLogSha256, identityUnchanged: true, appends: 0, storeAcquisitions: 0},
  measuredBaseline: {path: baseline.path, sha256: baseline.sha256, runtime: measured.packageRoot, contextDigest: measured.contextDigest},
  subject: measured.subject, contextDigest, equalContext: true,
  measurements: [cold, owned, expanded, expandedContext, repeat].map(summary)};
});

test('liveness candidate validation forks its admitted base: equal decisions and context, isolated siblings, unchanged base, no per-candidate rebuild', {...RETAINED, timeout: 600_000}, async t => {
  const {resources, baseline, eventLogPath, eventLogIdentity} = retained;
  const {eventLogSha256} = resources.value;
  const load = name => import(pathToFileURL(join(packageRoot, 'build/code/src', name + '.js')).href);
  const [events, prefixes, liveness, digests, immutable] = await Promise.all(
    ['abg/event_store', 'abg/event_prefix', 'abg/runtime_liveness', 'shared/digests', 'shared/immutable'].map(load));
  const bytes = await readFile(eventLogPath);
  assert.deepEqual([bytes.length, await fileIdentity(eventLogPath)], [RC5_LOG.bytes, eventLogIdentity], 'the read bytes are the file the gate hashed');
  // The full log and its physical cut carry the retained profile; each keeps
  // its own file identity, selected length and digest. The full log's digest
  // is the one the gate verified.
  const eventContractDigest = retainedProfile(resources, baseline, events);
  const coordinateOf = async (path, selected, selectedSha256 = sha256Hex(selected)) => {
    const identity = await fileIdentity(path);
    const body = {kind: 'durable_prefix_coordinate', schemaVersion, eventLogRef: pathToFileURL(path).href, prefixLength: selected.length,
      prefixDigest: 'sha256:' + selectedSha256, storeIdentity: {device: identity.device, inode: identity.inode, eventContractDigest}};
    return {...body, coordinateDigest: digests.sha256Canonical(body)};
  };
  const full = prefixes.readOwnedRuntimeEventPrefixAtDurablePrefix(await coordinateOf(eventLogPath, bytes, eventLogSha256));
  // The owner's index selects the earliest admitted actor activity probe.
  const target = prefixes.indexedRuntimeEvents(full, 'kind:runtime_activity_probe_observed')
    .find(event => event.kind === 'runtime_activity_probe_observed' && typeof event.payload.actorInvocationRef === 'string');
  assert.ok(target, 'the retained history carries admitted actor liveness');
  const actor = target.payload.actorInvocationRef, ordinal = target.admissionOrdinal;
  assert.equal(prefixes.runtimeEventAtPrefixIndex(full, ordinal - 1).eventId, target.eventId);
  // The admitted base is a physical cut of the same bytes in a fresh resource,
  // so every candidate is prospective and receives its own validation prefix.
  const scratch = await mkdtemp(join(tmpdir(), 'sas-fork-'));
  t.after(() => rm(scratch, {recursive: true, force: true}));
  let end = 0; for (let line = 0; line < ordinal - 1; line++) end = bytes.indexOf(10, end) + 1;
  const cutPath = join(scratch, 'events.jsonl'), cutBytes = bytes.subarray(0, end);
  fs.writeFileSync(cutPath, cutBytes, {flag: 'wx'});
  const base = prefixes.readOwnedRuntimeEventPrefixAtDurablePrefix(await coordinateOf(cutPath, cutBytes));
  assert.equal(prefixes.runtimeEventPrefixExtent(base).count, ordinal - 1);
  assert.equal(prefixes.isValidationRuntimeEventPrefix(prefixes.extendRuntimeEventPrefixForValidation(base, target)), true);
  // The comparison input: the same complete admitted rows, from the canonical
  // prefix writer, as a fresh validated snapshot with no admitted base.
  let complete = ''; prefixes.writeRuntimeEventPrefixValue(base, part => { complete += part; });
  const beforeRows = JSON.parse(complete).events;
  const fresh = () => prefixes.selectValidatedRuntimeEventPrefix(immutable.deepFreeze(structuredClone(beforeRows)));
  const controls = [
    ['source', e => { e.payload.observation.sourceDigest = digests.sha256Canonical('foreign'); }],
    ['scope', e => { e.payload.observation.scopeDigest = digests.sha256Canonical('foreign'); }],
    ['clock', e => { e.payload.observation.clockOriginRef += '-foreign'; }],
    ['elapsed', e => { e.payload.observation.elapsedMs = -1; }],
    ['causation', e => { e.causationEventRefs = []; }],
  ];
  const candidates = [['admitted', target], ...controls.map(([label, mutate]) => {
    const changed = structuredClone(target); mutate(changed); return [label, immutable.deepFreeze(changed)];
  }), ['admitted again', immutable.deepFreeze(structuredClone(target))]];
  const meter = openMeasurer([join(packageRoot, 'build')]);
  t.after(() => meter.close());
  const contextBefore = (await meter.measure('admitted_base_context', () => liveness.projectActorLivenessContext(base, actor))).value;
  assert.ok(contextBefore);
  const forked = await meter.measure('fork_candidates', () => candidates.map(([label, candidate]) => [label, liveness.validateRuntimeLivenessEventAtPrefix(base, candidate)]));
  const rebuilt = await meter.measure('fresh_candidates', () => candidates.map(([label, candidate]) => [label, liveness.validateRuntimeLivenessEventAtPrefix(fresh(), candidate)]));
  assert.deepEqual(forked.value, rebuilt.value, 'the fork and a fresh reconstruction decide every candidate alike');
  assert.deepEqual(forked.value.map(([, decision]) => decision), [true, ...controls.map(() => false), true]);
  // Refused siblings leave neither the admitted base nor the next sibling changed.
  assert.deepEqual(liveness.projectActorLivenessContext(base, actor), contextBefore, 'the admitted base keeps its context');
  assert.deepEqual(unbound(liveness.projectActorLivenessContext(fresh(), actor)), unbound(contextBefore), 'a fresh reconstruction projects the same context');
  // Envelope-refused candidates stop before liveness; every other candidate
  // receives its own disposable fork of the admitted base, while the
  // comparison has no admitted base and reconstructs from the first event.
  const forks = ownerCount(forked, 'forkAt');
  assert.ok(forks >= 2 && forks <= candidates.length, 'each candidate reaching liveness receives its own fork');
  assert.equal(ownerCount(rebuilt, 'forkAt'), 0, 'the comparison has no admitted base to fork');
  // Index rows the reconstruction writes: a fork writes only its candidate's
  // rows, independent of the base; a rebuild writes every admitted row again.
  const forkRows = ownerCount(forked, 'abg/calculus/liveness.js#add'), freshRows = ownerCount(rebuilt, 'abg/calculus/liveness.js#add');
  assert.ok(forkRows <= 8 * forks, 'fork index work is bounded by its candidates, not the admitted base');
  assert.ok(freshRows >= forks * (ordinal - 1), 'the comparison indexes every admitted row once per candidate');
  // Per-query work a fork shifts into its layered reads: each layered query
  // filters the inherited base rows of its key. forkRows counts index
  // additions and forkLayeredRows counts filter predicate visits; their sum is
  // compared with the rebuild's index additions. It is not total row work,
  // allocation, bytes or CPU.
  const LAYERED_ROWS = 'abg/calculus/liveness.js@row => row.admissionOrdinal <= this.baseOrdinal';
  const forkQueries = ownerCount(forked, 'abg/calculus/liveness.js#layered'), forkLayeredRows = ownerCount(forked, LAYERED_ROWS);
  const freshLayeredRows = ownerCount(rebuilt, LAYERED_ROWS);
  assert.ok(forkQueries > 0, 'the forks answer layered queries');
  assert.equal(freshLayeredRows, 0, 'a rebuild has no inherited layer to visit');
  assert.ok(forkRows + forkLayeredRows < freshRows, 'index additions plus filter predicate visits of the forks stay below the rebuild index additions');
  // Source-derived reference-write bound for the layered filter/merge copies
  // (calculus/liveness.ts layered and add; LAYERED_ALLOCATION_BOUND_TRIAGE).
  // Assumptions: one flat owned admitted base, one candidate per validation
  // fork, V filter predicate visits, at most one fork-own member per queried
  // key (o <= 1) and M <= sum(k) <= V merges. Filter outputs write k <= V
  // references; a merge writes k + o. Each probe candidate adds at most two
  // index memberships (byKind and one observations bucket). The bound is
  // recomputed from these counters; it does not bound warmed base arrays.
  assert.equal(prefixes.isOwnedRuntimeEventPrefix(base), true, 'one flat owned admitted base');
  assert.equal(prefixes.isValidationRuntimeEventPrefix(base), false);
  assert.ok(candidates.every(([, candidate]) => candidate.kind === 'runtime_activity_probe_observed'), 'every candidate is one probe row');
  const V = forkLayeredRows, layeredReferenceWrites = 3 * V, candidateIndexMemberships = 2 * forks;
  const oneBaseLayeredCalls = Math.floor(forkQueries / 2);
  assert.ok(layeredReferenceWrites + candidateIndexMemberships < freshRows,
    'layered reference writes plus candidate index memberships stay below the rebuild index additions');
  const allocationBound = {
    relabel: 'forkIndexRows + forkLayeredRows = index additions plus filter predicate visits; not total row work',
    assumptions: ['one flat owned admitted base', 'one candidate per validation fork', 'V = observed filter predicate visits',
      'o <= 1 fork-own member per queried key', 'M <= sum(k) <= V merges'],
    source: 'calculus/liveness.ts layered/add; consolidation-inputs/native-07/LAYERED_ALLOCATION_BOUND_TRIAGE.md',
    V, forks, filterResultReferenceWrites: V, mergeInheritedReferenceWrites: V, mergeOwnReferenceWrites: V,
    layeredReferenceWritesBound: layeredReferenceWrites, candidateIndexMembershipsBound: candidateIndexMemberships,
    referenceWritesWithMembershipsBound: layeredReferenceWrites + candidateIndexMemberships, freshIndexAdditions: freshRows,
    triageConstants: {applies: V === 14 && forks === 4 && forkQueries === 607, layeredReferenceWrites: 42, withMemberships: 50,
      arrayCreationExpressions: 620, ownBucketArrays: 8},
    // A separate unit: never added to the reference writes above.
    arrayObjects: {layeredCalls: forkQueries, oneBaseLayeredCallsBound: oneBaseLayeredCalls,
      creationExpressionsBound: 2 * oneBaseLayeredCalls + V, ownBucketArraysBound: candidateIndexMemberships,
      note: 'source-expression bounds, not measured heap allocations; no fewer-array-object or byte claim'},
    unclaimed: ['bytes', 'CPU', 'whole allocation', 'complete native-workflow speedup'],
  };
  t.diagnostic(JSON.stringify(allocationBound));
  proof.cases.livenessFork = {baseEvents: ordinal - 1, target: target.eventId, decisions: forked.value, controls: controls.map(([label]) => label),
    work: {forks, forkIndexRows: forkRows, freshIndexRows: freshRows, forkLayeredQueries: forkQueries, forkLayeredRows, freshLayeredRows,
      freshLayeredQueries: ownerCount(rebuilt, 'abg/calculus/liveness.js#layered'), allocationBound, forkHeapUsedDelta: forked.measurement.heapUsedDelta,
      freshHeapUsedDelta: rebuilt.measurement.heapUsedDelta,
      forkBodyDecodes: ownerCount(forked, 'decodeEventBody'), freshBodyDecodes: ownerCount(rebuilt, 'decodeEventBody'),
      // Diagnostic only: function-granularity coverage under-reports class constructors.
      constructorCoverage: {forked: ownerCount(forked, 'RuntimeLivenessReconstruction'), fresh: ownerCount(rebuilt, 'RuntimeLivenessReconstruction')}},
    measurements: [summary(forked), summary(rebuilt)]};
  t.diagnostic(JSON.stringify(proof.cases.livenessFork.work));
});

// Regression proof custody: case3 and case7 below persist their complete
// candidate before any behavioral assertion over it, because the selected
// evidence reporter discards diagnostics (t.diagnostic stays supplementary).
// The operator selects the proof root with ABG_REGRESSION_PROOF_ROOT and each
// candidate file is written there once, exclusively. Without the root nothing
// is written and the case says so; selected proof requires both files.
const persistCandidate = async (t, name, candidate) => {
  const root = process.env.ABG_REGRESSION_PROOF_ROOT;
  if (typeof root !== 'string' || root.length === 0) {
    t.diagnostic(name + ' not persisted: ABG_REGRESSION_PROOF_ROOT is unset');
    return null;
  }
  return exclusiveRecord(root, name, candidate);
};
// An unexpected thrown outcome, kept in the candidate before any assertion.
const thrownValue = error => ({name: error?.name ?? null, typeError: error instanceof TypeError, message: String(error?.message ?? error),
  stack: typeof error?.stack === 'string' ? error.stack : null});

// RC14 native06 retirement (TITLE_MAP.json): this case replaces the title
// "shared public-operation classification equals the complete class predicates
// of the retained history, with orphan and mixed-arm facts kept". TD-26 P5
// deleted the private construction-operation selector and kept the generic
// public-operation and public-continuation classes and every envelope key. The
// retired key is named here only as historical negative evidence: it keys no
// retained or synthetic orphan row and is never an expected class.
test('shared public-operation classification preserves retained-history, orphan-envelope and mixed-arm facts without the retired construction-operation index', {...RETAINED, timeout: 600_000}, async t => {
  const {resources, baseline, eventLogPath, eventLogIdentity} = retained;
  const {eventLogSha256} = resources.value;
  const load = name => import(pathToFileURL(join(packageRoot, 'build/code/src', name + '.js')).href);
  const [events, prefixes, digests] = await Promise.all(['abg/event_store', 'abg/event_prefix', 'shared/digests'].map(load));
  const bytes = await readFile(eventLogPath), identity = await fileIdentity(eventLogPath);
  assert.deepEqual([bytes.length, identity], [RC5_LOG.bytes, eventLogIdentity], 'the read bytes are the file the gate hashed');
  const body = {kind: 'durable_prefix_coordinate', schemaVersion, eventLogRef: pathToFileURL(eventLogPath).href, prefixLength: bytes.length,
    prefixDigest: 'sha256:' + eventLogSha256, storeIdentity: {device: identity.device, inode: identity.inode, eventContractDigest: retainedProfile(resources, baseline, events)}};
  const RETIRED = 'construction-operation:';
  // Every compared identity, bucket and orphan/mixed observation is acquired
  // first; an unexpected thrown outcome is kept as the candidate's failure.
  const observed = {eventLog: {path: eventLogPath, bytes: bytes.length, sha256: eventLogSha256, identity}, retiredSelectorPrefix: RETIRED, failure: null};
  try {
    const cold = prefixes.readOwnedRuntimeEventPrefixAtDurablePrefix({...body, coordinateDigest: digests.sha256Canonical(body)});
    observed.prefixExtent = prefixes.runtimeEventPrefixExtent(cold);
    // Test oracle: every admitted body of the classified kinds, through the
    // pre-existing kind index, with each consumer's own class predicate.
    const bodies = kind => prefixes.indexedRuntimeEventEnvelopes(cold, 'kind:' + kind).map(e => prefixes.runtimeEventAtPrefix(cold, e.eventId));
    const operations = bodies('public_operation_admitted'), bases = bodies('basis_admitted');
    observed.operations = operations.map(e => e.eventId);
    observed.basisRows = bases.map(e => e.eventId);
    observed.expected = Object.fromEntries([
      ...PUBLIC_OPERATION_CLASSES.map(id => ['public-operation:' + id, operations.filter(e => e.payload?.operationId === id).map(e => e.eventId)]),
      ...PUBLIC_CONTINUATION_CLASSES.map(kind => ['public-continuation:' + kind, operations.filter(e => e.payload?.continuationKind === kind).map(e => e.eventId)])]);
    observed.buckets = classBuckets(prefixes, cold);
    const history = await load('abg/runtime_history');
    const keysOf = event => [...history.runtimeHistorySelectorKeys(event)];
    const retiredKeysOf = event => keysOf(event).filter(key => key.startsWith(RETIRED));
    // Historical construction uses keep their raw envelope, whether or not the
    // referenced operation exists or carries a construction arm; the retired
    // index keys none of them, so orphan and mixed-arm facts reach the global
    // refusals through the generic envelope instead of a private join.
    const operationById = new Map(operations.map(e => [e.eventId, e]));
    observed.constructionUses = bases.filter(e => typeof e.payload?.constructionContinuationUse?.operationAdmissionEventRef === 'string').map(use => {
      const ref = use.payload.constructionContinuationUse.operationAdmissionEventRef, operation = operationById.get(ref);
      return {eventRef: use.eventId, operationAdmissionEventRef: ref, operationPresent: operation !== undefined,
        operationContinuationKind: operation?.payload?.continuationKind ?? null,
        retiredBucket: prefixes.indexedRuntimeEvents(cold, RETIRED + ref).map(e => e.eventId),
        envelope: prefixes.indexedRuntimeEventEnvelopes(cold, 'id:' + use.eventId).map(e => e.eventId), retiredKeys: retiredKeysOf(use)};
    });
    observed.orphanUses = observed.constructionUses.filter(row => !row.operationPresent).length;
    observed.mixedArmUses = observed.constructionUses.filter(row => row.operationPresent && !PUBLIC_CONTINUATION_CLASSES.includes(row.operationContinuationKind)).length;
    observed.retiredKeyBasisRows = bases.filter(e => retiredKeysOf(e).length > 0).map(e => e.eventId);
    observed.absentOperationRetiredBucket = prefixes.indexedRuntimeEvents(cold, RETIRED + 'event://abiogenesis/absent').map(e => e.eventId);
    // This history has no construction uses, so the orphan and mixed-arm rows are
    // checked on the shared classifier itself with changed copies of admitted rows.
    const mixedArm = {...operations[0], payload: {...operations[0].payload, operationId: 'abg.operation.run.continue', continuationKind: 'selected_action'}};
    const orphanUse = {...bases[0], payload: {...bases[0].payload, constructionContinuationUse: {operationAdmissionEventRef: 'event://abiogenesis/absent'}}};
    const nonpublic = {...operations[0], kind: 'basis_admitted'};
    observed.synthetic = {
      mixedArm: {sourceEventRef: operations[0].eventId, operationId: mixedArm.payload.operationId, continuationKind: mixedArm.payload.continuationKind,
        keys: keysOf(mixedArm)},
      orphanUse: {sourceEventRef: bases[0].eventId, operationAdmissionEventRef: 'event://abiogenesis/absent', keys: keysOf(orphanUse),
        sourceKeys: keysOf(bases[0]), sourceEnvelope: prefixes.indexedRuntimeEventEnvelopes(cold, 'id:' + bases[0].eventId).map(e => e.eventId)},
      nonpublic: {sourceEventRef: operations[0].eventId, keys: keysOf(nonpublic)}};
  } catch (error) { observed.failure = thrownValue(error); }
  // The complete candidate is persisted before any assertion over it.
  await persistCandidate(t, 'single-address-space-case3.candidate.json', {kind: 'single_address_space_regression_candidate', schemaVersion,
    case: 'case3', title: t.name, recordedUtc: new Date().toISOString(), ...observed});
  assert.equal(observed.failure, null, JSON.stringify(observed.failure));
  const {expected, constructionUses, synthetic} = observed;
  assert.deepEqual(observed.buckets, expected, 'each class bucket is exactly its complete-history predicate');
  for (const use of constructionUses) {
    assert.deepEqual([use.retiredBucket, use.retiredKeys], [[], []], use.eventRef + ': the retired construction-operation index keys no retained use');
    assert.deepEqual(use.envelope, [use.eventRef], use.eventRef + ': the retained use stays visible by its envelope');
  }
  assert.deepEqual(observed.retiredKeyBasisRows, [], 'no retained basis row carries a retired construction-operation key');
  assert.deepEqual(observed.absentOperationRetiredBucket, [], 'a missing operation has no retired construction-operation class');
  assert.deepEqual(synthetic.mixedArm.keys.filter(key => key.startsWith('public-')),
    ['public-operation:abg.operation.run.continue', 'public-continuation:selected_action'],
    'a mixed-arm operation stays in exactly both of its generic classes for the global refusals');
  assert.deepEqual(synthetic.orphanUse.keys.filter(key => key.startsWith(RETIRED)), [], 'an orphan use carries no retired construction-operation key');
  assert.deepEqual(synthetic.orphanUse.keys, synthetic.orphanUse.sourceKeys, 'an orphan use keeps exactly the envelope keys of its admitted source row');
  assert.ok(['id:' + synthetic.orphanUse.sourceEventRef, 'kind:basis_admitted'].every(key => synthetic.orphanUse.keys.includes(key)),
    'an orphan use stays visible by its envelope');
  assert.deepEqual(synthetic.orphanUse.sourceEnvelope, [synthetic.orphanUse.sourceEventRef], 'the raw source row is visible in the retained history by its envelope');
  assert.ok(!synthetic.nonpublic.keys.some(key => key.startsWith('public-')), 'only admitted public operations are classified');
  proof.cases.publicOperationClassification = {operations: observed.operations.length, constructionUses: constructionUses.length,
    orphanUses: observed.orphanUses, mixedArmUses: observed.mixedArmUses,
    retiredConstructionOperationIndex: {basisRows: observed.basisRows.length, keyedRows: observed.retiredKeyBasisRows.length},
    classes: Object.fromEntries(Object.entries(expected).map(([key, refs]) => [key, refs.length]))};
  t.diagnostic(JSON.stringify(proof.cases.publicOperationClassification));
});

test('global run-invocation pairs stay history-wide on real earlier cuts, and a foreign Run stays distinct from a missing one', {...RETAINED, timeout: 600_000}, async t => {
  const {resources, baseline, eventLogPath, eventLogIdentity} = retained;
  const load = name => import(pathToFileURL(join(packageRoot, 'build/code/src', name + '.js')).href);
  const [events, prefixes, digests, invocations] = await Promise.all(
    ['abg/event_store', 'abg/event_prefix', 'shared/digests', 'abg/invocation_execution_truth'].map(load));
  const bytes = await readFile(eventLogPath), identity = await fileIdentity(eventLogPath);
  assert.deepEqual([bytes.length, identity], [RC5_LOG.bytes, eventLogIdentity], 'the read bytes are the file the gate hashed');
  // Every cut is a same-log durable prefix of the read-only retained resource
  // and carries that history's retained profile.
  const eventContractDigest = retainedProfile(resources, baseline, events);
  const cut = end => {
    const selected = bytes.subarray(0, end);
    const body = {kind: 'durable_prefix_coordinate', schemaVersion, eventLogRef: pathToFileURL(eventLogPath).href, prefixLength: selected.length,
      prefixDigest: 'sha256:' + sha256Hex(selected), storeIdentity: {device: identity.device, inode: identity.inode, eventContractDigest}};
    return prefixes.readOwnedRuntimeEventPrefixAtDurablePrefix({...body, coordinateDigest: digests.sha256Canonical(body)});
  };
  const through = ordinal => { let end = 0; for (let line = 0; line < ordinal; line++) end = bytes.indexOf(10, end) + 1; return cut(end); };
  const full = cut(bytes.length);
  const [first, second] = prefixes.indexedRuntimeEvents(full, 'public-operation:abg.operation.run.invoke');
  assert.ok(first && second, 'the retained history carries two admitted invocations');
  const pairOf = op => prefixes.indexedRuntimeEvents(full, 'kind:invocation_admitted').find(e => e.causationEventRefs[0] === op.eventId);
  const runOf = pair => prefixes.indexedRuntimeEvents(full, 'kind:run_segment_opened').find(e => e.payload?.invocationAdmissionRef === pair.payload.invocationAdmissionRef);
  const [firstPair, secondPair] = [pairOf(first), pairOf(second)], [firstRun, secondRun] = [runOf(firstPair), runOf(secondPair)];
  assert.ok(secondPair.admissionOrdinal > second.admissionOrdinal && secondRun.admissionOrdinal > secondPair.admissionOrdinal);
  const before = through(second.admissionOrdinal - 1), orphan = through(second.admissionOrdinal),
    paired = through(secondPair.admissionOrdinal), opened = through(secondRun.admissionOrdinal);
  const facts = prefix => invocations.projectExactRunInvocationFactsAtPrefix(prefix);
  const valid = (prefix, count) => { const r = facts(prefix); assert.equal(r.disposition, 'valid'); assert.equal(r.facts.length, count); return r.facts; };
  // The orphan belongs to no earlier Run, yet its incomplete pair refuses the
  // whole history; the complete pair restores it with the earlier fact unchanged.
  const beforeFacts = valid(before, 1);
  assert.deepEqual(prefixes.indexedRuntimeEvents(orphan, 'public-operation:abg.operation.run.invoke').map(e => e.eventId), [first.eventId, second.eventId]);
  assert.deepEqual(facts(orphan), {disposition: 'invalid_history', eventRefs: [second.eventId]}, 'an out-of-Run orphan refuses history-wide');
  const pairedFacts = valid(paired, 2);
  assert.deepEqual(pairedFacts[0], beforeFacts[0]);
  assert.deepEqual(valid(full, prefixes.indexedRuntimeEvents(full, 'public-operation:abg.operation.run.invoke').length).slice(0, 2), pairedFacts);
  // Identity scope: the second invocation is missing before its admission, while
  // at the opened cut its Run is a real foreign Run for the first invocation.
  const firstAdmission = invocations.projectExactInvocationAdmissionAtPrefix(opened, firstPair.payload.invocationAdmissionRef);
  const secondAdmission = invocations.projectExactInvocationAdmissionAtPrefix(opened, secondPair.payload.invocationAdmissionRef);
  assert.ok(firstAdmission && secondAdmission);
  assert.equal(invocations.projectExactInvocationAdmissionAtPrefix(before, secondPair.payload.invocationAdmissionRef), null, 'missing at the earlier cut');
  const missingRun = 'run://abiogenesis/absent', foreignRun = secondRun.aggregateId;
  const bind = (prefix, admission, runId) => invocations.hasExactInvocationRunBindingAtPrefix(prefix, admission, runId);
  assert.deepEqual([bind(opened, firstAdmission, firstRun.aggregateId), bind(opened, secondAdmission, foreignRun)], [true, true]);
  assert.deepEqual(prefixes.indexedRuntimeEvents(opened, 'related:' + foreignRun).filter(e => e.kind === 'run_segment_opened').map(e => e.eventId),
    [secondRun.eventId], 'the foreign Run exists in the selected history');
  assert.deepEqual(prefixes.indexedRuntimeEvents(opened, 'related:' + missingRun), [], 'the missing Run does not');
  assert.deepEqual([bind(opened, firstAdmission, foreignRun), bind(opened, firstAdmission, missingRun), bind(paired, secondAdmission, foreignRun)], [false, false, false],
    'neither a foreign nor a missing Run binds, and a Run not yet opened at the cut is missing there');
  proof.cases.globalRunInvocationPairs = {cuts: {before: second.admissionOrdinal - 1, orphan: second.admissionOrdinal, paired: secondPair.admissionOrdinal,
    opened: secondRun.admissionOrdinal, full: prefixes.runtimeEventPrefixExtent(full).count}, orphanRefusal: [second.eventId], foreignRun, missingRun};
  t.diagnostic(JSON.stringify(proof.cases.globalRunInvocationPairs));
});

test('installed producer to consumer: borrowed held history keeps exact values, reuses warm selections as unrelated history grows, refuses stale/copied/foreign/rollback input and reopens cold', {timeout: 900_000}, async t => {
  const run = await runInstalledLanguageTest(t, packageRoot, {
    prepareFixture: prepareLanguageStructuralFixture, programRef: GRAPH_EDGE_IDS.programRef,
    catalogHandle: GRAPH_EDGE_IDS.graphFunctionRef, allowlist: [GRAPH_EDGE_IDS.graphFunctionRef],
    input: constructStructuralInput('  Single Address Space  '), identity: 'single-address-space-graph-edge'});
  assert.equal(run.receipt.exitCode, 0);
  assert.equal(run.receipt.ownerOutput.outcomeKind, 'result');
  // Producer node Result feeds the consumer node in the actual installed HoG.
  const results = run.events.filter(event => event.kind === 'c_call_result_admitted');
  assert.deepEqual(results.map(event => event.payload.value), [
    {kind: 'normalized_data', schemaVersion, subject: 'Single Address Space'},
    {kind: 'data_output', schemaVersion, message: 'Single Address Space'}]);
  assert.equal(results[1].payload.contractRef, STRUCTURAL_IDS.outputContractRef);
  assert.deepEqual(run.reads.map(read => [read.memberKey, read.receipt.ownerOutput.outcomeKind]), [['run_result', 'result'], ['run_replay', 'result']]);

  const {installedRoot, scratch} = run.environment, handoff = run.handoff;
  const load = name => import(pathToFileURL(join(installedRoot, 'build/code/src', name + '.js')).href);
  const [abg, resources, store, prefixes, liveness, artifact, digests] = await Promise.all(
    ['abg/index', 'abg/definition_event_resource', 'abg/event_store', 'abg/event_prefix', 'abg/runtime_liveness', 'abg/artifact_truth', 'shared/digests'].map(load));
  const hash = digests.sha256Canonical, eventLogPath = fileURLToPath(handoff.prefix.eventLogRef);
  const meter = openMeasurer([join(installedRoot, 'build')]);
  t.after(() => meter.close());
  const watch = {watchPaths: [eventLogPath]};
  const reopen = closeHandoff => ({kind: 'reopen_abg_event_resource', schemaVersion, closeHandoff, handoffDigest: hash(closeHandoff)});
  const identityBefore = await fileIdentity(eventLogPath), bytesBefore = await fileSha256(eventLogPath);
  let resource = null, foreign = null;
  t.after(() => { for (const held of [resource, foreign]) if (held !== null) abg.abandonAbgEventResource(held); });

  // One genuine cold reopen acquires the installed producer's closed history.
  const acquired = await meter.measure('cold_reopen', () => abg.acquireAbgEventResource(reopen(handoff)), watch);
  assert.equal(acquired.value.kind, 'acquired_abg_event_resource', JSON.stringify(acquired.value));
  resource = acquired.value.resource;
  assert.deepEqual(resource.entryPrefix, handoff.prefix);
  let selection = abg.selectAcquiredAbgEventResource(resource, resource.entryPrefix);
  const runId = run.events.find(event => event.kind === 'run_segment_opened').runId;
  const frames = [...new Set(run.events.map(event => event.frameId).filter(value => typeof value === 'string'))].sort();
  const cCalls = run.events.filter(event => event.kind === 'c_call_opened').map(event => event.aggregateId);
  assert.ok(frames.length > 0 && cCalls.length === 2);
  const project = prefix => ({frames: frames.map(frame => liveness.projectFrameLivenessContext(prefix, frame)),
    cCalls: cCalls.map(ref => liveness.projectCCallLivenessContext(prefix, ref)),
    scope: liveness.projectRuntimeLivenessForScope(prefix, runId)});
  const ownedAt = () => prefixes.selectRuntimeEventPrefixFromStore(resource.store);
  const expandedAt = () => prefixes.selectValidatedRuntimeEventPrefix(resource.store.readAll());

  // Same held input: owned selection versus the replaced readAll selection.
  const owned0 = await meter.measure('held_owned_selection', () => { const prefix = ownedAt(); return {prefix, values: project(prefix)}; }, watch);
  const expanded0 = await meter.measure('held_expanded_readAll_selection', () => { const prefix = expandedAt(); return {prefix, values: project(prefix)}; }, watch);
  assert.deepEqual(owned0.value.values, expanded0.value.values);
  assert.equal(prefixes.runtimeEventPrefixDigest(owned0.value.prefix), hash(run.events), 'owned held prefix names the independently read cold history');
  assert.equal(prefixes.runtimeEventPrefixDigest(expanded0.value.prefix), hash(run.events));
  // Index substitutions used by traversal_route and execution_basis.
  const all = expanded0.value.prefix.events;
  assert.deepEqual(prefixes.indexedRuntimeEvents(owned0.value.prefix, 'run:' + runId).map(event => event.eventId),
    all.filter(event => event.runId === runId).map(event => event.eventId));
  for (const ref of cCalls) assert.deepEqual(prefixes.indexedRuntimeEvents(owned0.value.prefix, 'related:' + ref)
    .filter(event => event.aggregateId === ref).map(event => event.eventId), all.filter(event => event.aggregateId === ref).map(event => event.eventId));
  // public-setup install projection: exact versus owned artifact truth at one prefix.
  const exactTruth = await meter.measure('exact_prefix_artifact_truth', () => artifact.projectExactPrefixArtifactTruth(selection.prefix), watch);
  const ownedTruth = await meter.measure('owned_prefix_artifact_truth', () => artifact.projectOwnedPrefixArtifactTruth(selection.prefix), watch);
  assert.deepEqual(ownedTruth.value, exactTruth.value);
  assert.equal(ownerCount(ownedTruth, 'readAll'), 0);

  // Unrelated workspace history grows through the actual event owner.
  const before = selection, extentBefore = prefixes.runtimeEventPrefixExtent(owned0.value.prefix);
  const sizeBeforeGrowth = (await fileIdentity(eventLogPath)).size;
  for (let i = 0; i < 4; i++) {
    store.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(resource.store, selection.prefix,
      () => store.admitRuntimeEvent(resource.store, unrelatedWorkspaceEvent(hash, 'growth-' + i)));
    selection = abg.selectAcquiredAbgEventResource(resource, abg.selectHeldEventStoreDurablePrefix(resource.store));
  }
  const ownedGrown = await meter.measure('held_owned_selection_after_growth', () => { const prefix = ownedAt(); return {prefix, values: project(prefix)}; }, watch);
  const expandedGrown = await meter.measure('held_expanded_readAll_after_growth', () => { const prefix = expandedAt(); return {prefix, values: project(prefix)}; }, watch);
  const ownedRepeat = await meter.measure('held_owned_selection_repeat', () => project(ownedAt()), watch);
  t.diagnostic(JSON.stringify([acquired, owned0, expanded0, exactTruth, ownedTruth, ownedGrown, expandedGrown, ownedRepeat].map(row => ({
    name: row.measurement.name, wallMs: Math.round(row.measurement.wallMs * 10) / 10, io: row.measurement.io, calls: row.measurement.ownerCalls}))));
  const appendedBytes = (await fileIdentity(eventLogPath)).size - sizeBeforeGrowth, grownDigest = prefixes.runtimeEventPrefixDigest(ownedGrown.value.prefix);
  assert.deepEqual(ownedGrown.value.values, expandedGrown.value.values, 'one grown prefix projects one exact value');
  assert.deepEqual(ownedRepeat.value, ownedGrown.value.values);
  assert.deepEqual(unbound(ownedGrown.value.values), unbound(owned0.value.values), 'unrelated growth changes only the prefix binding');
  const bound = prefixBindings(ownedGrown.value.values);
  assert.ok(bound.length > 0 && bound.every(value => value === grownDigest), 'each projection names the current grown prefix');
  assert.equal(prefixes.runtimeEventPrefixExtent(ownedGrown.value.prefix).count, extentBefore.count + 4);
  assert.equal(grownDigest, prefixes.runtimeEventPrefixDigest(expandedGrown.value.prefix));
  for (const row of [owned0, ownedGrown, ownedRepeat]) {
    assert.equal(ownerCount(row, 'readAll'), 0, row.measurement.name + ' never materializes the store');
    assert.equal(ownerCount(row, 'isImmutableRuntimeValue'), 0, row.measurement.name + ' repeats no immutability walk');
  }
  for (const row of [expanded0, expandedGrown]) {
    assert.equal(ownerCount(row, 'readAll'), 1);
    assert.ok(ownerCount(row, 'isImmutableRuntimeValue') > 0, row.measurement.name + ' walks the complete materialized history');
  }
  assert.ok(ownedGrown.measurement.io.watchedReadBytes <= appendedBytes, 'warm reuse after growth reads at most the appended suffix');
  assert.equal(ownedRepeat.measurement.io.watchedReadBytes, 0, 'warm repeat reads no event-log bytes');
  assert.ok(ownerCount(ownedTruth, 'isImmutableRuntimeValue') < ownerCount(exactTruth, 'isImmutableRuntimeValue'));

  // Stale, copied and foreign selections refuse; copied coordinates read cold.
  assert.throws(() => abg.assertAcquiredAbgEventResourceSelectionCurrent(before), 'stale selection is not current');
  assert.notEqual(abg.acquireAbgEventResource(before).kind, 'acquired_abg_event_resource', 'stale selection cannot be borrowed');
  assert.throws(() => prefixes.readOwnedRuntimeEventPrefixAtDurablePrefix(before.prefix, {requireCurrent: true}), 'stale coordinate is not current');
  const copied = structuredClone(selection);
  assert.equal(abg.isAcquiredAbgEventResourceSelection(copied), false);
  assert.notEqual(abg.acquireAbgEventResource(copied).kind, 'acquired_abg_event_resource', 'copied selection has no acquired owner');
  const copiedRead = await meter.measure('copied_coordinate_cold_read', () => prefixes.projectOwnedRuntimeEventPrefixAtDurablePrefix(structuredClone(selection.prefix)), watch);
  assert.ok(copiedRead.measurement.io.watchedReadBytes > 0, 'a copied coordinate authenticates its bytes cold');
  assert.equal(prefixes.runtimeEventPrefixDigest(copiedRead.value), prefixes.runtimeEventPrefixDigest(ownedGrown.value.prefix));
  const foreignPath = join(scratch, 'foreign', 'runtime.events.jsonl');
  await mkdir(join(scratch, 'foreign'));
  const foreignAcquired = abg.acquireAbgEventResource({kind: 'new_abg_event_resource', schemaVersion, eventLogPath: foreignPath,
    locatorDigest: resources.abgEventLocatorDigest(foreignPath)});
  assert.equal(foreignAcquired.kind, 'acquired_abg_event_resource');
  foreign = foreignAcquired.resource;
  const foreignSelection = abg.selectAcquiredAbgEventResource(foreign, foreign.entryPrefix);
  assert.throws(() => abg.selectAcquiredAbgEventResource(resource, foreignSelection.prefix), 'foreign prefix is not this resource');
  assert.throws(() => abg.closeAbgEventResource(resource, foreignSelection.prefix), 'foreign prefix cannot close this resource');
  abg.abandonAbgEventResource(foreign); foreign = null;

  // A refused transaction rolls back completely; the held resource selection
  // stays current, while history selections taken before it are invalidated.
  const sizeBeforeRollback = (await fileIdentity(eventLogPath)).size;
  const grownExtent = prefixes.runtimeEventPrefixExtent(ownedGrown.value.prefix);
  assert.throws(() => store.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(resource.store, selection.prefix, () => {
    store.admitRuntimeEvent(resource.store, unrelatedWorkspaceEvent(hash, 'rollback'));
    throw new Error('controlled rollback');
  }), /controlled rollback/);
  assert.deepEqual(abg.selectHeldEventStoreDurablePrefix(resource.store), selection.prefix);
  abg.assertAcquiredAbgEventResourceSelectionCurrent(selection);
  assert.equal((await fileIdentity(eventLogPath)).size, sizeBeforeRollback);
  assert.throws(() => prefixes.runtimeEventPrefixExtent(ownedGrown.value.prefix), /invalidated by rollback/,
    'a pre-rollback history selection cannot be reused');
  assert.deepEqual(prefixes.runtimeEventPrefixExtent(ownedAt()), grownExtent);
  assert.equal(prefixes.runtimeEventPrefixDigest(ownedAt()), grownDigest);
  assert.deepEqual(project(ownedAt()), ownedGrown.value.values);

  // The actual installed invocation in this module instance: frame admission
  // and traversal completion borrow the held selection. Equal
  // invocations run after unrelated growth steps of two sizes. Each invocation
  // also adds same-basis history, so the difference between the two steps'
  // body-row growth isolates the owner's passes over unrelated history.
  const [publicApi, history] = await Promise.all(['public/index', 'abg/runtime_history'].map(load));
  const work = () => ({...history.RuntimeHistorySelection.owner(prefixes.selectOwnedRuntimeEventPrefix(resource.store).selection).work});
  const delta = (after, before) => Object.fromEntries(Object.keys(after).map(key => [key, after[key] - before[key]]));
  const STEPS = [0, 32, 256], cliKinds = run.events.filter(event => event.runId === runId).map(event => event.kind);
  const resultValues = prefix => id => prefixes.indexedRuntimeEvents(prefix, 'run:' + id)
    .filter(event => event.kind === 'c_call_result_admitted').map(event => event.payload.value);
  const outcome = value => ({kind: value.kind, code: value.code ?? value.refusal?.code ?? value.receipt?.failure?.fault?.code ?? null,
    exitCode: value.receipt?.exitCode ?? null});
  const startCall = (index, eventResource) => constructInstalledStartCall({environment: run.environment, publicApi, eventResource,
    input: constructStructuralInput('  Single Address Space  '), identity: 'single-address-space-held-' + index, programRef: GRAPH_EDGE_IDS.programRef});
  const invocations = [];
  for (let index = 0; index < 3; index++) {
    for (let i = 0; i < STEPS[index]; i++) {
      store.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(resource.store, selection.prefix,
        () => store.admitRuntimeEvent(resource.store, unrelatedWorkspaceEvent(hash, 'invocation-' + index + '-' + i)));
      selection = abg.selectAcquiredAbgEventResource(resource, abg.selectHeldEventStoreDurablePrefix(resource.store));
    }
    const entry = selection, entryEvents = prefixes.runtimeEventPrefixExtent(ownedAt()).count;
    const constructed = await meter.measure('invocation_construct_' + index, () => startCall(index, entry), watch);
    const before = work();
    const ran = await meter.measure('invocation_run_' + index, () => publicApi.runInstalledDefinitionCallWithResource(entry, constructed.value.call), watch);
    const ownerWork = delta(work(), before), receipt = ran.value.receipt, completion = receipt?.resources?.eventResource;
    assert.equal(ran.value.kind, 'installed_definition_call_transport_result', JSON.stringify(ran.value).slice(0, 2000));
    assert.equal(receipt.exitCode, 0, JSON.stringify(receipt.failure)); assert.equal(receipt.ownerOutput.outcomeKind, 'result');
    assert.equal(completion.kind, 'abg_event_resource_completion');
    selection = completion.successor;
    const current = ownedAt(), opened = prefixes.indexedRuntimeEventEnvelopes(current, 'kind:run_segment_opened').at(-1);
    assert.notEqual(opened.runId, runId);assert.ok(opened.admissionOrdinal > entryEvents, 'the invocation opened its own Run');
    const kinds = prefixes.indexedRuntimeEventEnvelopes(current, 'run:' + opened.runId).map(event => event.kind);
    // Equal outcome: the same traversal and the same producer and consumer values.
    assert.deepEqual(kinds, cliKinds, 'the borrowed invocation traverses exactly as the installed CLI Run');
    assert.deepEqual(resultValues(current)(opened.runId), results.map(event => event.payload.value));
    assert.deepEqual(unbound(project(current)), unbound(owned0.value.values), 'the earlier Run keeps its liveness');
    // Refusals at this size: the consumed entry and a copied successor.
    const refusals = {stale: outcome(await publicApi.runInstalledDefinitionCallWithResource(entry, constructed.value.call)),
      copied: outcome(await publicApi.runInstalledDefinitionCallWithResource(structuredClone(selection), constructed.value.call)),
      crossed: outcome(await publicApi.runInstalledDefinitionCallWithResource(selection, constructed.value.call))};
    assert.equal(abg.selectHeldEventStoreDurablePrefix(resource.store).prefixLength, selection.prefix.prefixLength, 'refusals append nothing');
    invocations.push({index, entryEvents, successorEvents: prefixes.runtimeEventPrefixExtent(current).count, runId: opened.runId,
      events: kinds.length, ownerWork, refusals, construct: constructed.measurement, run: ran.measurement});
  }
  // One replaced full expansion at the final prefix: the per-event body cost of
  // selectValidatedRuntimeEventPrefix(readRuntimeEventsAtDurablePrefix(prefix)).
  const beforeReference = work();
  const reference = await meter.measure('replaced_durable_prefix_expansion', () =>
    prefixes.selectValidatedRuntimeEventPrefix(store.readRuntimeEventsAtDurablePrefix(selection.prefix)), watch);
  const referenceWork = delta(work(), beforeReference), referenceEvents = prefixes.runtimeEventPrefixExtent(reference.value).count;
  const growthRows = invocations.slice(1).map((row, i) => {
    const prior = invocations[i];
    return {from: prior.index, to: row.index, historyEvents: row.entryEvents - prior.entryEvents, unrelatedEvents: STEPS[row.index],
      bodyRows: row.ownerWork.bodyRows - prior.ownerWork.bodyRows,
      isImmutableRuntimeValue: row.run.ownerCalls.isImmutableRuntimeValue - prior.run.ownerCalls.isImmutableRuntimeValue,
      snapshot: row.run.ownerCalls.snapshot - prior.run.ownerCalls.snapshot};
  });
  // Per unrelated event: body rows touched, and the same in units of one
  // replaced expansion (one body row per history event, one walk per body).
  const unrelated = STEPS[2] - STEPS[1], slope = key => (growthRows[1][key] - growthRows[0][key]) / unrelated;
  const perEventWalk = reference.measurement.ownerCalls.isImmutableRuntimeValue / referenceEvents;
  const unrelatedWork = {fullPasses: slope('bodyRows'), immutabilityWalks: slope('isImmutableRuntimeValue') / perEventWalk,
    snapshotsPerEvent: slope('snapshot')};
  // Whole-invocation passes over unrelated history remain in owners outside
  // the migrated callers; they are recorded with their durable-prefix reader
  // calls and returned to Root, not asserted as a bound.
  const fullReaders = row => row.run.ownerCalls.readRuntimeEventsAtDurablePrefix + row.run.ownerCalls.projectRuntimeEventsAtDurablePrefix + row.run.ownerCalls.readAll;
  t.diagnostic(JSON.stringify({invocations: invocations.map(row => ({index: row.index, entryEvents: row.entryEvents, ownerWork: row.ownerWork,
    refusals: row.refusals, wallMs: Math.round(row.run.wallMs), io: row.run.io, calls: row.run.ownerCalls,
    construct: {wallMs: Math.round(row.construct.wallMs), io: row.construct.io, calls: row.construct.ownerCalls}})),
  reference: {events: referenceEvents, ownerWork: referenceWork, calls: reference.measurement.ownerCalls}, growthRows, unrelatedWork}));
  for (const row of invocations) {
    assert.deepEqual(row.refusals, invocations[0].refusals, 'refusals are equal as unrelated history grows');
    for (const [name, refused] of Object.entries(row.refusals)) assert.equal(refused.code, 'acquisition_mismatch', name + ' selection refuses');
    assert.ok(row.run.ownerCalls.admitTraversalFrameCursor > 0, 'the measured invocation reaches cursor admission');
    assert.equal(row.run.ownerCalls.readActiveRuntimeTransactionAtDurablePrefix, 0, 'cursor admission materializes no transaction history');
    assert.equal(fullReaders(row), fullReaders(invocations[0]), 'full-history reader calls do not grow with history');
  }
  assert.equal(referenceWork.bodyRows, referenceEvents, 'one replaced expansion touches every history body once');

  // Final close, stale-handoff refusal and genuine cold reopen.
  const finalDigest = prefixes.runtimeEventPrefixDigest(ownedAt()), finalValues = project(ownedAt());
  const liveClasses = classBuckets(prefixes, prefixes.selectRuntimeEventPrefixFromStore(resource.store));
  assert.ok(liveClasses['public-operation:abg.operation.run.invoke'].length >= 1 && liveClasses['public-operation:abg.operation.project.read'].length >= 4,
    'the live store classifies the installed Run and the appended unrelated operations');
  const closed = abg.closeAbgEventResource(resource, selection.prefix); resource = null;
  assert.deepEqual(closed.closeHandoff.prefix, selection.prefix);
  // Closed-owner acquisition kinds (HOW64/66): the exact coordinate's retained
  // immutable authenticated selection serves pure historical projection after
  // close; an explicit fresh read and a copied coordinate authenticate cold.
  const closedProjection = await meter.measure('closed_owner_pure_projection', () => prefixes.projectOwnedRuntimeEventPrefixAtDurablePrefix(selection.prefix), watch);
  const closedFreshRead = await meter.measure('closed_owner_explicit_fresh_read', () => prefixes.readOwnedRuntimeEventPrefixAtDurablePrefix(selection.prefix), watch);
  const copiedProjection = await meter.measure('copied_coordinate_pure_projection', () => prefixes.projectOwnedRuntimeEventPrefixAtDurablePrefix(structuredClone(selection.prefix)), watch);
  assert.equal(closedProjection.measurement.io.watchedReadBytes, 0, 'pure projection reuses the retained immutable receipt after close');
  assert.equal(closedFreshRead.measurement.io.watchedReadBytes, selection.prefix.prefixLength, 'an explicit fresh read after close authenticates the complete extent cold');
  assert.equal(copiedProjection.measurement.io.watchedReadBytes, selection.prefix.prefixLength, 'a copied coordinate authenticates the complete extent cold');
  for (const projected of [closedFreshRead, copiedProjection]) assert.equal(prefixes.runtimeEventPrefixDigest(projected.value), finalDigest);
  assert.equal(prefixes.runtimeEventPrefixDigest(closedProjection.value), finalDigest);
  const acquisitionKinds = {closedProjection: closedProjection.measurement.io, closedFreshRead: closedFreshRead.measurement.io, copiedProjection: copiedProjection.measurement.io};
  const stale = abg.acquireAbgEventResource(reopen(handoff));
  assert.notEqual(stale.kind, 'acquired_abg_event_resource', 'the pre-growth handoff cannot reopen grown history');
  const reopened = await meter.measure('cold_reopen_after_close', () => abg.acquireAbgEventResource(reopen(closed.closeHandoff)), watch);
  assert.equal(reopened.value.kind, 'acquired_abg_event_resource');
  resource = reopened.value.resource;
  assert.equal(prefixes.runtimeEventPrefixDigest(prefixes.selectRuntimeEventPrefixFromStore(resource.store)), finalDigest);
  assert.deepEqual(project(prefixes.selectRuntimeEventPrefixFromStore(resource.store)), finalValues);
  assert.deepEqual(classBuckets(prefixes, prefixes.selectRuntimeEventPrefixFromStore(resource.store)), liveClasses,
    'cold decode reproduces the live public-operation classification');
  const reclosed = abg.closeAbgEventResource(resource, resource.entryPrefix); resource = null;
  assert.deepEqual(reclosed.closeHandoff.prefix, closed.closeHandoff.prefix, 'a read-only reopen appends nothing');
  const identityAfter = await fileIdentity(eventLogPath);
  assert.equal(identityAfter.inode, identityBefore.inode);
  assert.equal(identityAfter.size, closed.closeHandoff.prefix.prefixLength);
  proof.cases.installedPath = {installedRoot, runId, producerConsumer: results.map(event => ({cCallRef: event.aggregateId, valueDigest: event.payload.valueDigest})),
    coldReads: run.reads.map(read => read.memberKey), initialPrefix: handoff.prefix, finalPrefix: closed.closeHandoff.prefix,
    eventLogSha256Before: bytesBefore, eventLogSha256After: await fileSha256(eventLogPath), unrelatedAppends: 4 + STEPS[1] + STEPS[2], appendedBytes, rolledBackAppends: 1,
    refusals: ['stale_selection', 'stale_coordinate', 'copied_selection', 'foreign_prefix_select', 'foreign_prefix_close', 'controlled_rollback',
      'pre_rollback_history_selection', 'stale_handoff_reopen'],
    invocation: {program: GRAPH_EDGE_IDS.programRef, borrowed: true, unrelatedSteps: STEPS,
      rows: invocations.map(({construct, run: measured, ...row}) => ({...row, construct, run: measured})),
      reference: {name: 'replaced_durable_prefix_expansion', events: referenceEvents, ownerWork: referenceWork, measurement: reference.measurement},
      growthRows, unrelatedWork, remainingDurablePrefixReaderCalls: fullReaders(invocations[0])},
    acquisitionKinds,
    measurements: [acquired, owned0, expanded0, exactTruth, ownedTruth, ownedGrown, expandedGrown, ownedRepeat, copiedRead, reopened].map(summary)};
});

test('qualification material at a genuine owned cut: an invalidating producer fibre refuses warm, copied and cold alike; the historical cut stays valid and unrelated growth reuses declarations', {timeout: 900_000}, async t => {
  const run = await runInstalledLanguageTest(t, packageRoot, {
    prepareFixture: prepareLanguageStructuralFixture, programRef: GRAPH_EDGE_IDS.programRef,
    catalogHandle: GRAPH_EDGE_IDS.graphFunctionRef, allowlist: [GRAPH_EDGE_IDS.graphFunctionRef],
    input: constructStructuralInput('  Qualification Cut  '), identity: 'single-address-space-qualification-cut'});
  assert.equal(run.receipt.exitCode, 0);
  const {installedRoot} = run.environment, handoff = run.handoff;
  const load = name => import(pathToFileURL(join(installedRoot, 'build/code/src', name + '.js')).href);
  const [abg, store, prefixes, cCalls, qualification, contracts, executions, environments, digests] = await Promise.all(
    ['abg/index', 'abg/event_store', 'abg/event_prefix', 'abg/c_call', 'abg/qualification_proof', 'validator/qualification_contracts',
      'abg/invocation_execution_truth', 'abg/environment_admission', 'shared/digests'].map(load));
  const hash = digests.sha256Canonical, eventLogPath = fileURLToPath(handoff.prefix.eventLogRef), watch = {watchPaths: [eventLogPath]};
  const meter = openMeasurer([join(installedRoot, 'build')]);
  t.after(() => meter.close());
  const reopen = closeHandoff => ({kind: 'reopen_abg_event_resource', schemaVersion, closeHandoff, handoffDigest: hash(closeHandoff)});
  let resource = null;
  t.after(() => { if (resource !== null) abg.abandonAbgEventResource(resource); });
  const acquired = abg.acquireAbgEventResource(reopen(handoff));
  assert.equal(acquired.kind, 'acquired_abg_event_resource', JSON.stringify(acquired));
  resource = acquired.resource;
  let selection = abg.selectAcquiredAbgEventResource(resource, resource.entryPrefix);
  const append = candidate => {
    store.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(resource.store, selection.prefix, () => store.admitRuntimeEvent(resource.store, candidate));
    selection = abg.selectAcquiredAbgEventResource(resource, abg.selectHeldEventStoreDurablePrefix(resource.store));
    return selection.prefix;
  };

  // The installed producer node's admitted Result is the selected execution.
  const result = run.events.find(event => event.kind === 'c_call_result_admitted'), producer = result.aggregateId;
  const opened = run.events.find(event => event.kind === 'c_call_opened' && event.aggregateId === producer);
  const fibre = run.events.find(event => event.kind === 'c_call_fibre_selected' && event.aggregateId === producer);
  const execution = executions.projectExactExecutionBasisAtPrefix(prefixes.selectRuntimeEventPrefixFromStore(resource.store), opened.basisId);
  assert.ok(execution, 'the producer execution basis is admitted at the held cut');
  const binding = {ref: execution.workspaceBindingId, digest: execution.workspaceBindingDigest};
  const workspace = environments.projectExactPrefixWorkspaceEnvironment(selection.prefix, binding);
  assert.equal(workspace.kind, 'exact_prefix_workspace_environment');
  // Explicit subject premise: the qualification basis names the admitted
  // install and binding that the material owner checks; no owner value is made.
  const install = workspace.productInstalls.find(row => row.productId === execution.programRef.split('/')[2]) ?? workspace.productInstalls[0];
  const basis = contracts.constructQualificationIdentity({productId: install.productId, productVersion: install.packageVersion,
    artifact: {ref: 'artifact://single-address-space/qualification-cut', digest: install.artifactDigest}, productContentDigest: install.productContentDigest,
    productManifest: {ref: 'manifest://single-address-space/qualification-cut', digest: install.manifestDigest},
    toolchain: {ref: 'toolchain://single-address-space/qualification-cut', digest: install.manifestDigest},
    installedProduct: {ref: install.installId, digest: hash(install)}, workspaceBinding: binding}, 'basisRef', 'basisDigest', 'qualification-basis://abiogenesis/');
  const P0 = selection.prefix, proofResource = {kind: 'qualification_proof_resource', schemaVersion, prefix: P0,
    declarations: [{kind: 'abg_historical_declaration_proof', schemaVersion, catalog: run.environment.catalog, catalogView: run.environment.catalogView}],
    selections: [{kind: 'execution_selection', selectionRef: 'selection://single-address-space/qualification-cut', slotRef: opened.payload.programLocusRef,
      programRef: execution.programRef, invocationAdmissionRef: execution.invocationAdmissionRef,
      result: {ref: result.payload.resultRef, digest: result.payload.resultDigest}}]};
  assert.ok(contracts.isQualificationProofResource(proofResource));
  const consumer = prefix => ({cCallRef: 'c-call://single-address-space/qualification-consumer', predecessorPrefix: prefix});
  const material = (name, prefix, proof = proofResource) => meter.measure(name, () =>
    qualification.resolveQualificationExecutionMaterial(proof, basis, consumer(prefix)), watch);
  const decoded = value => JSON.parse(Buffer.from(value.evidence[0].contentBase64, 'base64'));

  // Genuine owned P: the installed producer's closed history, warmed once.
  const warm0 = await material('qualification_material_P', P0);
  assert.ok(warm0.value, 'the installed producer is qualification material at P');
  assert.equal(warm0.value.evidence.length, 1);
  assert.deepEqual(decoded(warm0.value).result.value, result.payload.value);
  const repeat0 = await material('qualification_material_P_repeat', P0);
  assert.deepEqual(repeat0.value, warm0.value);
  for (const key of ['reconstructHistoricalDeclarationCatalog', 'projectAdmittedCCallStateAtPrefix', 'projectOpenedCCallCarrierAtPrefix'])
    assert.equal(ownerCount(repeat0, key), 0, 'the deciding cut reuses ' + key);

  // Unrelated extension P1: immutable declarations are reused while the
  // basis, carrier and CCall owners decide the producer at the new cut.
  const P1 = append(unrelatedWorkspaceEvent(hash, 'qualification-cut'));
  const warm1 = await material('qualification_material_unrelated_extension', P1);
  assert.deepEqual(warm1.value, warm0.value, 'unrelated growth keeps the exact material');
  assert.equal(ownerCount(warm1, 'reconstructHistoricalDeclarationCatalog'), 0, 'unrelated growth reuses the immutable declaration reconstruction');
  assert.ok(ownerCount(warm1, 'projectAdmittedCCallStateAtPrefix') > 0 && ownerCount(warm1, 'projectOpenedCCallCarrierAtPrefix') > 0,
    'the CCall owners decide the producer at the extended cut');

  // Invalidating suffix P': a second contract-valid fibre for the producer,
  // admitted through the actual Event Store with identical opening, Result
  // and judgment rows. The canonical phase owner refuses that history.
  const {eventId: _id, admissionOrdinal: _ordinal, payloadDigest: _digest, eventContractDigest: _contract, ...fibreBody} = fibre;
  const P2 = append({...fibreBody, eventTime: new Date().toISOString()});
  assert.equal(P2.prefixLength > P1.prefixLength, true);
  const heldP2 = prefixes.selectRuntimeEventPrefixFromStore(resource.store);
  assert.equal(prefixes.indexedRuntimeEvents(heldP2, 'related:' + producer).filter(event => event.kind === 'c_call_fibre_selected').length, 2);
  let phaseRefusal = null;
  try { cCalls.projectCCallPhase(heldP2, producer); } catch (error) { phaseRefusal = String(error.message); }
  assert.ok(phaseRefusal, 'the canonical CCall phase owner refuses the duplicate fibre');
  const warm2 = await material('qualification_material_invalidated_warm', P2);
  assert.equal(warm2.value, null, 'the warm scope refuses the invalidated producer at the invalidating cut');
  assert.ok(ownerCount(warm2, 'projectCCallPhase') > 0, 'the warm refusal is the phase owner refusal, not a retained graph/state');
  const copied2 = await material('qualification_material_invalidated_copied', structuredClone(P2), structuredClone(proofResource));
  assert.equal(copied2.value, null, 'a copied coordinate and proof refuse at the invalidating cut alike');
  // Historical P and P1 remain valid in the same warm scope.
  const historical0 = await material('qualification_material_historical_P', P0), historical1 = await material('qualification_material_historical_P1', P1);
  assert.deepEqual(historical0.value, warm0.value, 'the historical cut P keeps its exact material');
  assert.deepEqual(historical1.value, warm0.value, 'the historical unrelated extension keeps its exact material');
  for (const row of [historical0, historical1]) assert.equal(ownerCount(row, 'projectAdmittedCCallStateAtPrefix'), 0, row.measurement.name + ' reuses its deciding cut');
  assert.ok(ownerCount(copied2, 'reconstructHistoricalDeclarationCatalog') > 0, 'the copied route has no warm scope');

  // Cold: a fresh acquisition of the closed handoff has no warm scope.
  const close = abg.closeAbgEventResource(resource, selection.prefix);
  resource = null;
  const coldAcquired = abg.acquireAbgEventResource(reopen(close.closeHandoff));
  assert.equal(coldAcquired.kind, 'acquired_abg_event_resource', JSON.stringify(coldAcquired));
  resource = coldAcquired.resource;
  selection = abg.selectAcquiredAbgEventResource(resource, resource.entryPrefix);
  assert.deepEqual(selection.prefix, P2);
  const cold2 = await material('qualification_material_invalidated_cold', selection.prefix, structuredClone(proofResource));
  assert.equal(cold2.value, null, 'cold refusal at the invalidating cut equals the warm refusal');
  assert.ok(ownerCount(cold2, 'reconstructHistoricalDeclarationCatalog') > 0, 'the cold acquisition has no warm scope');
  const cold0 = await material('qualification_material_historical_P_cold', P0, structuredClone(proofResource));
  assert.deepEqual(cold0.value, warm0.value, 'cold historical P keeps its exact material');
  const rows = [warm0, repeat0, warm1, warm2, copied2, historical0, historical1, cold2, cold0];
  t.diagnostic(JSON.stringify(rows.map(row => ({name: row.measurement.name, wallMs: Math.round(row.measurement.wallMs * 10) / 10,
    io: row.measurement.io, calls: Object.fromEntries(['reconstructHistoricalDeclarationCatalog', 'projectExactExecutionBasisAtPrefix',
      'projectOpenedCCallCarrierAtPrefix', 'projectAdmittedCCallStateAtPrefix', 'projectCCallPhase'].map(key => [key, ownerCount(row, key)]))}))));
  proof.cases.qualificationCut = {producer, cuts: {P: P0.prefixLength, unrelated: P1.prefixLength, invalidated: P2.prefixLength},
    invalidatingFibre: {copiedFrom: fibre.eventId}, phaseRefusal, materialDigest: warm0.value.evidence[0].digest,
    refusals: {warm: warm2.value, copied: copied2.value, cold: cold2.value}, measurements: rows.map(summary)};
});

// T-293 B36 and RC14 native06 retirement (TITLE_MAP.json): this case replaces
// the retired titles "complete-pair owners refuse orphan F_H,
// construction-intent and selected-action operations by stage and admission
// order, alike warm, copied and cold; a mixed arm is refused at admission; the
// baseline and unrelated growth keep their values" and "complete-pair owners
// refuse retired construction-intent and selected-action continuations and
// orphan F_H operations as one F_H orphan set, alike warm, copied and cold; a
// mixed arm is refused at admission; the baseline and unrelated growth keep
// their values". The fixed 5.0 Product retains only the pending_execution
// realization of run.continue; construction-intent and selected-action
// continuations are retired (TD-26 P5) and native F_H response is reserved to
// 5.1. Contract-valid historical operations still decode and are admitted, but
// Event Calculus explicitly refuses each retired lifecycle ("continuation
// <aggregate> has an invalid event lifecycle"); artifact truth keeps its
// generic event_envelope_invalid boundary, so effectful truth answers
// artifact_truth_invalid before F_H pairing. Read directly, the F_H owner still
// keeps every non-pending run.continue and interaction.respond operation in one
// sorted orphan set. History A admits its orphan F_H response first, so the
// F_H-only prefix keeps a valid fold and the outer F_H pairing refusal.
test('complete-pair owners preserve current Run pairs and F_H orphan refusals while retired construction lifecycles fail closed, alike warm, copied and cold; mixed arms are refused unwritten and unrelated growth preserves each answer', {timeout: 900_000}, async t => {
  // Each history is one actual installed Run; every control row is a
  // contract-valid public operation admitted by the actual Event Store. Each
  // history observes every owner answer first and keeps an unexpected outcome
  // as its failure; the complete candidate is persisted before any assertion.
  const KEYS = {
    fh: 'actorRef authorityDigest authorityRef capabilityGrantRefs capabilityRef catalogBasisDigest catalogBasisRef catalogViewDigest catalogViewId continuationRef definitionDigest graphFunctionDigest graphFunctionRef invocationDigest invocationPayloadDigest invocationRef memberKey operationId policyDigest policyRef programDigest programRef variant workspaceBindingDigest workspaceBindingId',
    construction_intent: 'actorRef authorityDigest authorityRef capabilityGrant capabilityGrantRefs capabilityRef catalogBasisDigest catalogBasisRef catalogViewDigest catalogViewId continuationKind continuationRef continuationDigest currentIntentRef currentIntentDigest definitionDigest graphFunctionDigest graphFunctionRef invocationDigest invocationPayloadDigest invocationRef memberKey operationId policyDigest policyRef programDigest programRef variant workspaceBindingDigest workspaceBindingId',
    selected_action: 'actorRef authorityDigest authorityRef capabilityGrant capabilityGrantRefs capabilityRef catalogBasisDigest catalogBasisRef catalogViewDigest catalogViewId continuationKind continuationRef continuationDigest currentContinuationRef currentContinuationDigest sourceRunId sourceRunDigest currentRunId selectedActionRef selectedActionDigest currentIntentRef currentIntentDigest executionBasisRef executionBasisDigest basisRelation definitionDigest graphFunctionDigest graphFunctionRef invocationDigest invocationPayloadDigest invocationRef memberKey operationId policyDigest policyRef programDigest programRef variant workspaceBindingDigest workspaceBindingId'};
  const history = async (identity, controls, {mixedArm = false} = {}) => {
    const observed = {identity, mixedArm, controls: controls.map(([label, variant, fixed]) => ({label, variant, fixed})), run: null, acquiredKind: null,
      invoke: null, runFacts: null, runFact: null, refs: null, mixedArmObservation: null, mixedArmRefusal: null, admittedRows: {}, admitted: {},
      aggregates: {}, cuts: [], historical: null, closedPrefix: null, staleHandoffKind: null, fresh: null, failure: null};
    try {
      const run = await runInstalledLanguageTest(t, packageRoot, {
        prepareFixture: prepareLanguageStructuralFixture, programRef: GRAPH_EDGE_IDS.programRef,
        catalogHandle: GRAPH_EDGE_IDS.graphFunctionRef, allowlist: [GRAPH_EDGE_IDS.graphFunctionRef],
        input: constructStructuralInput('  Complete Pair  '), identity});
      observed.run = {exitCode: run.receipt.exitCode, outcomeKind: run.receipt.ownerOutput?.outcomeKind ?? null, handoffPrefix: run.handoff.prefix,
        events: run.events.length, lastEventRef: run.events.at(-1)?.eventId ?? null};
      const load = name => import(pathToFileURL(join(run.environment.installedRoot, 'build/code/src', name + '.js')).href);
      const [abg, store, prefixes, effectful, fh, invocations, calculus, digests] = await Promise.all(['abg/index', 'abg/event_store', 'abg/event_prefix',
        'abg/effectful_invocation_truth', 'abg/fh_continuation_projection', 'abg/invocation_execution_truth', 'abg/event_calculus', 'shared/digests'].map(load));
      const hash = digests.sha256Canonical;
      const reopen = closeHandoff => ({kind: 'reopen_abg_event_resource', schemaVersion, closeHandoff, handoffDigest: hash(closeHandoff)});
      const acquired = abg.acquireAbgEventResource(reopen(run.handoff));
      observed.acquiredKind = acquired.kind;
      let resource = acquired.resource ?? null;
      t.after(() => { if (resource !== null) abg.abandonAbgEventResource(resource); });
      let selection = abg.selectAcquiredAbgEventResource(resource, resource.entryPrefix);
      const invoke = run.events.find(event => event.kind === 'public_operation_admitted' && event.payload.operationId === 'abg.operation.run.invoke');
      observed.invoke = invoke;
      // The Run's own complete pair, as its owner names it.
      const runFacts = invocations.projectExactRunInvocationFactsAtPrefix(prefixes.readOwnedRuntimeEventPrefixAtDurablePrefix(selection.prefix));
      observed.runFacts = runFacts;
      observed.runFact = runFacts.facts?.[0] ?? null;
      const refs = [observed.runFact.publicInvocationRef, 'invocation://single-address-space/complete-pair/fresh'];
      observed.refs = refs;
      // Actual Event Calculus over the same owned prefix the F_H owner reads:
      // a summary of its complete fold, or the exact refusal it throws.
      const calculusAt = owned => {
        const events = prefixes.runtimeEventPrefixExtent(owned).count;
        let projection;
        try { projection = calculus.deriveRuntimeEventCalculusProjection(owned); } catch (error) {
          return {outcome: 'refused', events, name: error?.name ?? null, typeError: error instanceof TypeError, message: String(error?.message ?? error)};
        }
        return {outcome: 'folded', events, kind: projection.kind, effectRows: projection.effectRows.length,
          lastEffectEventRef: projection.effectRows.at(-1)?.sourceEvent?.eventId ?? null, holds: projection.holds.length,
          holdsDigest: hash(projection.holds.map(fluent => fluent.fluentRef))};
      };
      const owners = coordinate => {
        const truth = refs.map(ref => effectful.projectEffectfulPublicInvocationTruthAtPrefix(coordinate, ref));
        const owned = prefixes.readOwnedRuntimeEventPrefixAtDurablePrefix(coordinate);
        return {truth, fh: fh.projectFhEffectfulPublicInvocationFacts(owned), calculus: calculusAt(owned)};
      };
      const cuts = observed.cuts;
      cuts.push({label: 'baseline', prefix: selection.prefix, warm: owners(selection.prefix)});
      // Each control carries exactly its contract variant's keys; shared fields
      // repeat the admitted Run invocation's values, the rest name the control.
      const operation = (label, keys, fixed) => ({...unrelatedWorkspaceEvent(hash, label), payload: Object.fromEntries(KEYS[keys].split(' ').map(key =>
        [key, key in fixed ? fixed[key] : key in invoke.payload ? invoke.payload[key] : key.endsWith('Digest') ? hash([label, key])
          : key.endsWith('Refs') ? [] : 'ref://single-address-space/complete-pair/' + label + '/' + key]))});
      if (mixedArm) {
        const eventLogPath = fileURLToPath(selection.prefix.eventLogRef), before = await readFile(eventLogPath);
        const candidate = operation('mixed-arm', 'construction_intent', {operationId: 'abg.operation.run.continue', memberKey: 'current_intent',
          continuationKind: 'selected_action', invocationRef: 'invocation://single-address-space/complete-pair/mixed-arm', invocationDigest: hash('mixed-arm')});
        try { store.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(resource.store, selection.prefix, () => store.admitRuntimeEvent(resource.store, candidate)); }
        catch (error) { observed.mixedArmRefusal = String(error.message); }
        const after = await readFile(eventLogPath);
        observed.mixedArmObservation = {candidate, refusal: observed.mixedArmRefusal, prefixBefore: selection.prefix,
          prefixAfter: abg.selectHeldEventStoreDurablePrefix(resource.store), bytesBefore: {bytes: before.length, sha256: sha256Hex(before)},
          bytesAfter: {bytes: after.length, sha256: sha256Hex(after)}, bytesEqual: before.equals(after)};
      }
      for (const [label, keys, fixed] of [...controls, ['unrelated']]) {
        const candidate = keys === undefined ? unrelatedWorkspaceEvent(hash, identity + '-unrelated') : operation(label, keys, {
          invocationRef: 'invocation://single-address-space/complete-pair/' + label, invocationDigest: hash(label), ...fixed});
        store.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(resource.store, selection.prefix, () => { observed.admittedRows[label] = store.admitRuntimeEvent(resource.store, candidate); });
        observed.admitted[label] = observed.admittedRows[label].eventId;
        observed.aggregates[label] = observed.admittedRows[label].aggregateId;
        selection = abg.selectAcquiredAbgEventResource(resource, abg.selectHeldEventStoreDurablePrefix(resource.store));
        cuts.push({label, prefix: selection.prefix, warm: owners(selection.prefix)});
      }
      for (const cut of cuts) cut.copied = owners(structuredClone(cut.prefix));
      observed.historical = owners(cuts[0].prefix);
      const closed = abg.closeAbgEventResource(resource, selection.prefix); resource = null;
      observed.closedPrefix = closed.closeHandoff.prefix;
      observed.staleHandoffKind = abg.acquireAbgEventResource(reopen(run.handoff)).kind;
      const fresh = abg.acquireAbgEventResource(reopen(closed.closeHandoff));
      observed.fresh = fresh.kind === 'acquired_abg_event_resource' ? {kind: fresh.kind} : fresh;
      resource = fresh.resource ?? null;
      for (const cut of cuts) cut.cold = owners(structuredClone(cut.prefix));
    } catch (error) { observed.failure = thrownValue(error); }
    return observed;
  };
  const refusal = (cut, eventRefs) => {
    assert.deepEqual(cut.warm.truth.map(value => [value.kind, value.disposition, value.code, value.eventRefs, value.artifactTruthCode]),
      cut.warm.truth.map(() => ['effectful_public_invocation_truth_invalid_history', 'invalid_history', 'invocation_pair_invalid', eventRefs, null]), cut.label);
  };
  // A valid fold: one effect row for every admitted row through the prefix's last event.
  const folded = (cut, events, lastEventRef) => {
    const {outcome, events: count, effectRows, lastEffectEventRef} = cut.warm.calculus;
    assert.deepEqual({outcome, count, effectRows, lastEffectEventRef}, {outcome: 'folded', count: events, effectRows: events, lastEffectEventRef: lastEventRef},
      cut.label + ': Event Calculus folds every admitted row of the prefix');
  };
  // A retired lifecycle: the same-prefix calculus cause names the first retired
  // aggregate, and the artifact owner's generic refusal precedes F_H pairing.
  const retired = (cut, aggregate) => {
    const {outcome, name, typeError, message} = cut.warm.calculus;
    assert.deepEqual({outcome, name, typeError, message}, {outcome: 'refused', name: 'TypeError', typeError: true,
      message: 'continuation ' + aggregate + ' has an invalid event lifecycle'}, cut.label + ': Event Calculus refuses the first retired lifecycle');
    assert.deepEqual(cut.warm.truth.map(value => [value.kind, value.disposition, value.code, value.eventRefs, value.artifactTruthCode]),
      cut.warm.truth.map(() => ['effectful_public_invocation_truth_invalid_history', 'invalid_history', 'artifact_truth_invalid', [], 'event_envelope_invalid']),
      cut.label + ': artifact truth refuses before F_H pairing');
  };
  // Every owner answer apart from the evaluated prefix binding.
  const answers = cut => {
    const {events: _events, ...calculusAnswer} = cut.warm.calculus;
    return {truth: cut.warm.truth.map(({prefix: _prefix, ...value}) => value), fh: cut.warm.fh, calculus: calculusAnswer};
  };
  const baseline = ({cuts: [cut], run, runFact, refs, historical}) => {
    const [duplicate, available] = cut.warm.truth;
    assert.equal(duplicate.disposition, 'duplicate');
    assert.deepEqual(duplicate.priorAdmission, runFact, 'the Run invocation is its own complete prior admission');
    assert.equal(runFact.operationId, 'abg.operation.run.invoke');
    assert.deepEqual([available.disposition, available.invocationRef], ['available', refs[1]]);
    assert.deepEqual(cut.warm.fh, {disposition: 'valid', facts: []}, 'no F_H continuation in the baseline');
    folded(cut, run.events, run.lastEventRef);
    assert.deepEqual(historical, cut.warm, 'the historical baseline keeps its exact values after the controls');
  };
  const intent = label => [label, 'construction_intent', {operationId: 'abg.operation.run.continue', memberKey: 'current_intent', continuationKind: 'construction_intent'}];
  const selected = label => [label, 'selected_action', {operationId: 'abg.operation.run.continue', memberKey: 'selected_action', continuationKind: 'selected_action'}];
  const respond = label => [label, 'fh', {operationId: 'abg.operation.interaction.respond', memberKey: 'respond'}];
  const orphanSet = refs => ({disposition: 'invalid_history', eventRefs: [...refs].sort()});
  const record = histories => Object.fromEntries(histories.map(([key, value]) => [key, {admitted: value.admitted, mixedArmRefusal: value.mixedArmRefusal,
    cuts: value.cuts.map(cut => ({label: cut.label, prefixLength: cut.prefix.prefixLength, truth: cut.warm.truth.map(item => ({disposition: item.disposition,
      code: item.code ?? null, eventRefs: item.eventRefs ?? null, artifactTruthCode: item.artifactTruthCode ?? null})), fh: cut.warm.fh,
      calculus: cut.warm.calculus}))}]));
  // History A: the existing orphan F_H response first, at a prefix whose fold is
  // valid; then a retired construction intent and a retired selected action,
  // each refused by Event Calculus while the direct F_H owner keeps one sorted
  // orphan set; unrelated growth changes nothing.
  const a = await history('single-address-space-complete-pair-a', [respond('orphan-respond'), intent('orphan-intent'), selected('orphan-selected')]);
  // History B: the retired selected action alone is the whole orphan set; a
  // mixed arm (construction-intent body under the selected-action kind)
  // matches no contract variant and the Event Store refuses it unwritten.
  const b = await history('single-address-space-complete-pair-b', [selected('orphan-selected')], {mixedArm: true});
  // The complete candidate is persisted before any assertion over it.
  await persistCandidate(t, 'single-address-space-case7.candidate.json', {kind: 'single_address_space_regression_candidate', schemaVersion,
    case: 'case7', title: t.name, recordedUtc: new Date().toISOString(), histories: {a, b}});
  for (const [key, value] of [['a', a], ['b', b]]) {
    assert.equal(value.failure, null, key + ': ' + JSON.stringify(value.failure));
    assert.equal(value.run.exitCode, 0);
    assert.equal(value.runFacts.disposition, 'valid');
    assert.equal(value.runFacts.facts.length, 1);
    if (value.mixedArm) {
      assert.equal(value.mixedArmObservation.bytesEqual, true, 'the refused mixed arm writes nothing');
      assert.deepEqual(value.mixedArmObservation.bytesAfter, value.mixedArmObservation.bytesBefore);
      assert.deepEqual(value.mixedArmObservation.prefixAfter, value.mixedArmObservation.prefixBefore);
    }
    for (const cut of value.cuts) assert.deepEqual(cut.copied, cut.warm, cut.label + ': a copied coordinate equals the warm owners');
    assert.notEqual(value.staleHandoffKind, 'acquired_abg_event_resource', 'the pre-control handoff is stale after admitted controls');
    assert.equal(value.fresh.kind, 'acquired_abg_event_resource', JSON.stringify(value.fresh));
    for (const cut of value.cuts) assert.deepEqual(cut.cold, cut.warm, cut.label + ': a fresh cold acquisition equals warm');
  }
  proof.cases.completePairControls = record([['a', a], ['b', b]]);
  t.diagnostic(JSON.stringify(proof.cases.completePairControls));
  baseline(a);
  assert.deepEqual(a.cuts.map(cut => cut.label), ['baseline', 'orphan-respond', 'orphan-intent', 'orphan-selected', 'unrelated']);
  const [, respondCut, intentCut, selectedCut, unrelatedCut] = a.cuts;
  const respondRef = a.admitted['orphan-respond'], intentRef = a.admitted['orphan-intent'], selectedRef = a.admitted['orphan-selected'];
  // The F_H-only prefix: a valid fold, the outer F_H pairing refusal with the
  // exact response eventRef and the direct F_H orphan set.
  folded(respondCut, a.run.events + 1, respondRef);
  refusal(respondCut, [respondRef]);
  assert.deepEqual(respondCut.warm.fh, orphanSet([respondRef]), 'an orphan F_H response is an F_H-refused orphan at a valid-calculus prefix');
  // The first retired aggregate stays the calculus cause as later rows arrive;
  // the direct F_H owner refuses each retired arm in the same orphan set.
  retired(intentCut, a.aggregates['orphan-intent']);
  assert.deepEqual(intentCut.warm.fh, orphanSet([respondRef, intentRef]), 'a retired construction arm joins the direct F_H orphan set');
  retired(selectedCut, a.aggregates['orphan-intent']);
  assert.deepEqual(selectedCut.warm.fh, orphanSet([respondRef, intentRef, selectedRef]), 'a retired selected action joins the direct F_H orphan set');
  retired(unrelatedCut, a.aggregates['orphan-intent']);
  assert.deepEqual(answers(unrelatedCut), answers(selectedCut), 'unrelated growth keeps every owner answer');
  baseline(b);
  assert.deepEqual(b.cuts.map(cut => cut.label), ['baseline', 'orphan-selected', 'unrelated']);
  retired(b.cuts[1], b.aggregates['orphan-selected']);
  assert.deepEqual(b.cuts[1].warm.fh, orphanSet([b.admitted['orphan-selected']]), 'the retired selected action alone is the whole direct F_H orphan set');
  retired(b.cuts[2], b.aggregates['orphan-selected']);
  assert.deepEqual(answers(b.cuts[2]), answers(b.cuts[1]), 'unrelated growth keeps every owner answer');
  assert.match(b.mixedArmRefusal, /matches no admitted event-contract variant/);
});

test('maintained SDK setup holds one acquired resource, borrows every history call, closes once, owns failure cleanup and reopens cold', {timeout: 900_000}, async t => {
  const scratch = await realpath(await mkdtemp(join(tmpdir(), 'abi5-single-address-setup-')));
  t.after(() => rm(scratch, {recursive: true, force: true}));
  let npm = null;
  for (const directory of (process.env.PATH ?? '').split(':').filter(Boolean)) {
    try { await access(join(directory, 'npm'), fs.constants.X_OK); npm = join(directory, 'npm'); break; } catch {}
  }
  assert.ok(npm, 'setup requires an npm executable on PATH');
  await mkdir(join(scratch, 'artifacts'));
  // The Product archive: exactly the payload rule's members, packed with no lifecycle scripts.
  const [packed] = await packProduct(packageRoot, join(scratch, 'artifacts'));
  const artifactPath = join(scratch, 'artifacts', packed.filename);
  const setupTmp = join(scratch, 'setup-tmp');
  await mkdir(setupTmp);
  const inherited = ['HOME', 'LANG', 'LC_ALL', 'NPM_CONFIG_CACHE', 'npm_config_cache'].filter(key => process.env[key] !== undefined);
  const setupEnvironment = {...Object.fromEntries(inherited.map(key => [key, process.env[key]])), PATH: process.env.PATH, TMPDIR: setupTmp,
    npm_config_update_notifier: 'false'};

  async function prepareCaller(label) {
    const root = join(scratch, label), bootstrapRoot = join(root, 'bootstrap/node_modules/@abiogenesis/typescript-tenant');
    await mkdir(bootstrapRoot, {recursive: true});
    const record = (path, value, raw = false) => exclusiveRecord(root, path, value, raw);
    const command = commandRecorder(root, {environment: setupEnvironment, timeoutMs: 600_000});
    assert.equal((await command('acquire-bootstrap', '/usr/bin/tar', ['-xzf', artifactPath, '--strip-components=1', '-C', bootstrapRoot])).exitCode, 0);
    const runtime = await installedModules(bootstrapRoot);
    const manifest = JSON.parse(await readFile(join(bootstrapRoot, 'product-toolchain-manifest.json'), 'utf8'));
    const native = await verifyArtifact(runtime, {artifactPath, manifest,
      expectedArtifactDigest: 'sha256:' + await fileSha256(artifactPath)}, record, 'abg');
    const caller = publicCaller({root, runtime, native, command, record, config: {runId: 'single-address-space-' + label, bootstrapRoot,
      worksiteRoot: join(root, 'sandbox/worksite'), setupEnvironment, recursionBound: 1000, nodePath: process.execPath,
      toolchains: {npm: {executable: npm}}}});
    return {root, runtime, caller, eventLogPath: join(root, 'resources/events/runtime.events.jsonl')};
  }

  // Ordinary setup: ten installed SDK calls in one module instance.
  const {runtime, caller, eventLogPath} = await prepareCaller('ordinary');
  const {product, abg, api} = runtime, hash = product.sha256Canonical;
  const observation = observeSetupCaller(caller, eventLogPath);
  const setup = await populateSandbox(caller);
  const labels = ['workspace-create', 'product-verify-0', 'product-verify-1', 'product-resolve', 'product-install-0',
    'product-install-1', 'workspace-bind', 'catalog-admit', 'catalog-view', 'program-conformance'];
  assert.deepEqual(observation.rows.map(row => row.label), labels);
  assert.deepEqual(observation.rows.map(row => row.acquisitionKind), ['eventless', 'eventless', 'eventless', 'eventless',
    'borrowed', 'borrowed', 'borrowed', 'borrowed', 'borrowed', 'borrowed']);
  assert.deepEqual(observation.lifecycle, {acquisitions: 1, closes: 1}, 'one outer acquisition and one final close');
  const borrowed = observation.rows.filter(row => row.acquisitionKind === 'borrowed');
  for (let i = 1; i < borrowed.length; i++) assert.equal(borrowed[i].entryPrefixLength, borrowed[i - 1].successorPrefixLength,
    borrowed[i].label + ' borrows the preceding successor selection');
  for (const label of ['product-install-0', 'product-install-1', 'workspace-bind', 'catalog-admit']) {
    const {call, receipt} = observation.observed.get(label);
    assert.equal(receipt.resources.eventResource.kind, 'abg_event_resource_completion', label);
    assert.equal(abg.isAcquiredAbgEventResourceSelection(call.resources.eventResource), true, label + ' carries the held selection');
  }
  // A borrowed call reads back at most the suffix it appended itself; it never
  // re-authenticates history before its entry prefix (catalog admission and
  // both bound calls are read-only by owner contract).
  for (const row of borrowed) assert.ok(row.eventLogReadBytes <= row.successorPrefixLength - row.entryPrefixLength,
    row.label + ' re-authenticates no history before its entry prefix');
  for (const label of ['catalog-admit', 'catalog-view', 'program-conformance']) {
    const row = borrowed.find(value => value.label === label);
    assert.equal(row.successorPrefixLength, row.entryPrefixLength, label + ' appends nothing');
    assert.equal(row.eventLogReadBytes, 0, label + ' reads no event-log bytes');
  }
  const close = caller.state.closeHandoff;
  assert.equal(caller.state.resource, null);
  assert.equal(close.prefix.prefixLength, borrowed.at(-1).successorPrefixLength);
  assert.equal(close.prefix.prefixLength, (await fileIdentity(eventLogPath)).size);
  assert.deepEqual(JSON.parse(await readFile(join(caller.root, 'setup-close.json'), 'utf8')).closeHandoff, close);
  assert.equal(setup.installations.length, 2);
  const environment = caller.refresh();
  for (const install of setup.installations) assert.equal(abg.hasAdmittedProductInstall(environment.artifactTruth, install), true);

  // Same-input comparison of the two lifecycles over one sequence of bound
  // calls: the replaced cold bound-prefix path against one cold reopen whose
  // held resource every call borrows.
  const meter = openMeasurer([join(caller.root, 'bootstrap')]);
  t.after(() => meter.close());
  const watch = {watchPaths: [eventLogPath]};
  const sequence = ['catalog-view', 'program-conformance', 'catalog-view', 'program-conformance'];
  const replay = async (label, suffix) => {
    const call = await caller.authorize(...observation.authorizations.get(label));
    return caller.invoke(label + '-' + suffix, call);
  };
  const coldRows = [];
  for (const [i, label] of sequence.entries()) coldRows.push(await meter.measure(label + '-cold-bound-prefix-' + i, () => replay(label, 'cold-' + i), watch));
  const reopened = await meter.measure('setup-cold-reopen', () => caller.acquire({kind: 'reopen_abg_event_resource', schemaVersion,
    closeHandoff: close, handoffDigest: hash(close)}), watch);
  assert.deepEqual(reopened.value.prefix, close.prefix, 'genuine cold reopen selects the final close prefix');
  const borrowedRows = [];
  for (const [i, label] of sequence.entries()) borrowedRows.push(await meter.measure(label + '-borrowed-' + i, () => replay(label, 'borrowed-' + i), watch));
  const bytes = rows => rows.reduce((total, row) => total + row.measurement.io.watchedReadBytes, 0);
  t.diagnostic(JSON.stringify([...coldRows, reopened, ...borrowedRows].map(row => ({name: row.measurement.name,
    wallMs: Math.round(row.measurement.wallMs), io: row.measurement.io, calls: row.measurement.ownerCalls}))));
  for (const [i, row] of borrowedRows.entries()) {
    assert.deepEqual(row.value.receipt.ownerOutput, coldRows[i].value.receipt.ownerOutput, 'equal owner outputs on both lifecycles');
    assert.ok(coldRows[i].measurement.io.watchedReadBytes > 0, 'the replaced bound-prefix path authenticates the log on every call');
    assert.ok(ownerCount(row, 'canonicalJson') < ownerCount(coldRows[i], 'canonicalJson'), row.measurement.name + ' re-encodes less');
  }
  // After the borrowed resource's first touch, later calls read nothing; the
  // cold path pays its acquisition again on every call.
  for (const row of borrowedRows.slice(1)) assert.equal(row.measurement.io.watchedReadBytes, 0, row.measurement.name + ' reads no event-log bytes');
  assert.ok(bytes([reopened, ...borrowedRows]) < bytes(coldRows), 'one acquisition plus borrowed calls reads fewer event-log bytes than per-call cold authentication');
  const receipt = caller.close();
  assert.deepEqual(receipt.closeHandoff.prefix, close.prefix, 'bound calls append nothing');
  assert.deepEqual(observation.lifecycle, {acquisitions: 2, closes: 2});

  // Failure ownership: a failure after the first install closes at the held
  // durable prefix, retaining the completed owner effect and releasing the lock.
  const failing = await prepareCaller('failure');
  const failureObservation = observeSetupCaller(failing.caller, failing.eventLogPath);
  const invoke = failing.caller.invoke;
  failing.caller.invoke = async (label, call, options) => {
    if (label === 'product-install-1') throw new Error('controlled setup failure');
    return invoke(label, call, options);
  };
  await assert.rejects(populateSandbox(failing.caller), /controlled setup failure/);
  assert.equal(failing.caller.state.resource, null, 'failure cleanup releases the held resource');
  assert.deepEqual(failureObservation.lifecycle, {acquisitions: 1, closes: 1});
  const failedClose = failing.caller.state.closeHandoff;
  const installed = failureObservation.rows.find(row => row.label === 'product-install-0');
  assert.equal(failedClose.prefix.prefixLength, installed.successorPrefixLength, 'completed install is retained');
  assert.equal(failedClose.prefix.prefixLength, (await fileIdentity(failing.eventLogPath)).size);
  const recovered = failing.runtime.abg.acquireAbgEventResource({kind: 'reopen_abg_event_resource', schemaVersion,
    closeHandoff: failedClose, handoffDigest: failing.runtime.product.sha256Canonical(failedClose)});
  assert.equal(recovered.kind, 'acquired_abg_event_resource', 'the failure close handoff reopens cold');
  failing.runtime.abg.closeAbgEventResource(recovered.resource, recovered.resource.entryPrefix);

  proof.cases.maintainedSetup = {artifactSha256: await fileSha256(artifactPath), calls: observation.rows,
    lifecycle: {setupAcquisitions: 1, setupCloses: 1, replacedReopensPerSetup: 3, replacedClosesPerSetup: 4},
    finalClose: close.prefix, failure: {failedAt: 'product-install-1', closePrefix: failedClose.prefix, calls: failureObservation.rows},
    boundCallComparison: [...coldRows, reopened, ...borrowedRows].map(summary)};
});

test('RAW F_H hold seed: an explicit conditional root grant and one exact basis/Run/pending/hold/open seed hold at their actual gates, the open seed has no F_H response fact, and the owners keep their values over repeated reads, a fresh frozen clone and unrelated growth', async t => {
  // Conditional immutable RAW reader data: every row is stamped by the actual
  // projector and selected by the actual validator. This is not Event Store or
  // current root admission, held or owned authority, Public commit, a physical
  // cold reopen or installed F_H qualification. Human response and resumption
  // are reserved to 5.1; the orphan response operation is refused by the
  // complete-pair case above.
  const load = name => import(pathToFileURL(join(packageRoot, 'build/code/src', name + '.js')).href);
  const [abg, store, prefixes, digests, fh, effectful, invocations, calculus, cCalls, cursors, family, runContracts, product, capabilities,
    values] = await Promise.all(['abg/index', 'abg/event_store', 'abg/event_prefix', 'shared/digests', 'abg/fh_continuation_projection',
    'abg/effectful_invocation_truth', 'abg/invocation_execution_truth', 'abg/event_calculus', 'abg/c_call', 'abg/traversal_cursor',
    'public/binding/public_function_family', 'product/run_operation_contracts', 'product/index', 'shared/capability_contracts',
    'shared/value/index'].map(load));
  const hash = digests.sha256Canonical, modules = {store, digests, family, runContracts, capabilities, values, cursors};
  const seed = rawFhResponseSeed(modules);
  const select = rows => prefixes.selectValidatedRuntimeEventPrefix(freezeRaw([...rows]));
  const runCut = rows => prefixes.selectValidatedRuntimeEventPrefix(freezeRaw([...rows]), {runId: seed.runId});
  const fluent = (projection, name, identity) => calculus.holdsAt(projection, calculus.constructRuntimeFluent({name, identity}));
  // Each real gate, in order, is absent one row before its cut and present at it.
  const gates = [
    ['invocation', seed.cuts.invocation, rows => abg.rehydrateInvocationAdmissionAtPrefix(select(rows), seed.invocationAdmissionRef)],
    ['basis', seed.cuts.basis, rows => invocations.projectExactExecutionBasisAtPrefix(select(rows), seed.basisRef)],
    ['run', seed.cuts.run, rows => invocations.hasExactInvocationRunBindingAtPrefix(select(rows),
      abg.rehydrateInvocationAdmissionAtPrefix(select(rows), seed.invocationAdmissionRef), seed.runId) || null],
    ['pending', seed.cuts.pending, rows => cCalls.projectPendingInteractionCarrier(select(rows), seed.cCall, seed.pendingResult, seed.pendingJudgment)],
    ['heldFluent', seed.cuts.opened, rows => { const projection = calculus.deriveRuntimeHeldFluentProjection(runCut(rows));
      return ['continuation_open', 'interaction_pending'].every(name => fluent(projection, name, seed.continuationRef)) &&
        fluent(projection, 'frame_held', seed.frameId) && !fluent(projection, 'continuation_response_available', seed.continuationRef) || null; }],
    ['openContinuation', seed.cuts.opened, rows => { const prefix = runCut(rows);
      const open = fh.projectFhContinuations(prefix, calculus.deriveRuntimeHeldFluentProjection(prefix));
      return open.length === 1 && open[0].status === 'open' ? open[0] : null; }]];
  const gateRows = gates.map(([gate, at, read]) => {
    assert.equal(read(seed.rows.slice(0, at - 1)), null, gate + ' is absent before its last row');
    assert.ok(read(seed.rows.slice(0, at)), gate + ' holds at its cut');
    return {gate, cut: at, before: at - 1};
  });
  const P = select(seed.rows), root = gates[0][2](seed.rows), executionBasis = gates[1][2](seed.rows), continuation = gates[5][2](seed.rows);
  assert.equal(abg.hasAdmittedInvocationAtPrefix(P, root), true);
  assert.deepEqual([executionBasis.invocationAdmissionRef, continuation.continuationRef, continuation.constructionIntentRef, continuation.actorCapabilityRef],
    [seed.invocationAdmissionRef, seed.continuationRef, null, seed.capabilityRef]);
  // The explicit grant passes the actual structural checker and binds the
  // RAW root's actor, workspace and policy; an altered copy is refused.
  const {grant} = seed;
  assert.equal(product.isCapabilityGrantValue(grant), true);
  assert.equal(product.isCapabilityGrantValue({...grant, actorRef: 'actor://single-address-space/raw-fh/foreign'}), false);
  assert.deepEqual([root.capabilityGrants, root.capabilityGrantRefs], [[grant], [grant.grantRef]]);
  assert.deepEqual([grant.definitionKey, grant.definitionDigest, grant.actorRef, grant.scopeRef, grant.scopeDigest, grant.policyRef, grant.policyDigest],
    [seed.definitionKey, seed.definitionDigest, root.actorRef, root.workspaceBindingId, root.workspaceBindingDigest, root.policyRef, root.policyDigest]);
  // The actual combined owners over one RAW prefix: the response ref, an
  // unused ref and the root's own invocation; the F_H and Run fact owners.
  const responseRef = 'invocation://single-address-space/raw-fh/respond', unusedRef = 'invocation://single-address-space/raw-fh/unused';
  const owners = prefix => ({truth: [responseRef, unusedRef, seed.invocationRef].map(ref => effectful.projectEffectfulPublicInvocationTruthAtPrefix(prefix, ref)),
    fh: fh.projectFhEffectfulPublicInvocationFacts(prefix), run: invocations.projectExactRunInvocationFactsAtPrefix(prefix)});
  const before = owners(P);
  assert.equal(before.run.disposition, 'valid');
  assert.equal(before.run.facts.length, 1);
  assert.deepEqual(before.truth.map(value => [value.disposition, value.invocationRef]), [['available', responseRef], ['available', unusedRef], ['duplicate', seed.invocationRef]]);
  assert.deepEqual(before.truth[2].priorAdmission, before.run.facts[0], 'the RAW root pair is its own complete prior admission');
  assert.deepEqual(before.fh, {disposition: 'valid', facts: []}, 'the open seed has no F_H response fact');
  // A root without the response grant still opens the same hold.
  const ungranted = rawFhResponseSeed(modules, {responseGrant: false});
  const ungrantedRoot = abg.rehydrateInvocationAdmissionAtPrefix(select(ungranted.rows), ungranted.invocationAdmissionRef);
  const ungrantedOpen = (prefix => fh.projectFhContinuations(prefix, calculus.deriveRuntimeHeldFluentProjection(prefix)))(
    prefixes.selectValidatedRuntimeEventPrefix(ungranted.rows, {runId: ungranted.runId}));
  assert.deepEqual([ungrantedRoot.capabilityGrants, ungrantedOpen.map(value => value.status)], [[], ['open']]);
  // RAW reconstruction of the seed: a repeated read, a fresh deeply frozen
  // clone and allowed unrelated growth keep the exact owner values.
  assert.deepEqual(owners(select(seed.rows)), before, 'a repeated read is equal');
  const clone = freezeRaw(structuredClone([...seed.rows]));
  assert.notEqual(clone[0], seed.rows[0]);
  assert.deepEqual(owners(select(clone)), before, 'a fresh frozen clone is equal');
  const unrelated = store.projectRuntimeEventFromValidatedHistory(freezeRaw([...seed.rows]), unrelatedWorkspaceEvent(hash, 'raw-fh-unrelated'));
  const grown = owners(select([...seed.rows, unrelated]));
  const withoutPrefix = ({prefix: _prefix, ...value}) => value;
  assert.deepEqual([grown.fh, grown.run, grown.truth.map(withoutPrefix)], [before.fh, before.run, before.truth.map(withoutPrefix)],
    'unrelated RAW growth keeps the exact values');
  const view = cut => ({truth: cut.truth.map(value => ({disposition: value.disposition, code: value.code ?? null, eventRefs: value.eventRefs ?? null,
    priorAdmission: value.priorAdmission ?? null})), fh: cut.fh});
  proof.cases.fhHoldSeed = {premise: 'conditional immutable RAW reader data stamped by the actual projector; the explicit response grant is test-owned',
    limits: ['No Event Store or current root admission produced the seed or its grant.', 'No held or owned resource, Public commit or dispatch.',
      'A fresh frozen clone is RAW reconstruction, not a physical cold reopen.', 'No installed F_H qualification or release claim.'],
    seed: {prefixLength: seed.rows.length, kinds: seed.rows.map(event => event.kind), eventRefs: seed.rows.map(event => event.eventId), grantRef: grant.grantRef,
      grantDigest: grant.grantDigest, invocationAdmissionRef: seed.invocationAdmissionRef, basisRef: seed.basisRef, runId: seed.runId,
      continuationRef: seed.continuationRef, gates: gateRows},
    owners: view(before), unrelatedGrowth: {eventRef: unrelated.eventId, prefixLength: seed.rows.length + 1}};
  t.diagnostic(JSON.stringify(proof.cases.fhHoldSeed));
});

test('RAW F_H hold seed: a hand-built response, resume, abandonment or F_H supersession on the open hold is refused by the fold and the F_H fact owner, never folded as if absent', async t => {
  // The four kinds stay declared for 5.1 and have no 5.0 reader. Each log is
  // the seed plus one contract-valid row stamped by the actual projector.
  const load = name => import(pathToFileURL(join(packageRoot, 'build/code/src', name + '.js')).href);
  const [store, prefixes, digests, fh, calculus, cursors, family, runContracts, capabilities, values] = await Promise.all(['abg/event_store',
    'abg/event_prefix', 'shared/digests', 'abg/fh_continuation_projection', 'abg/event_calculus', 'abg/traversal_cursor',
    'public/binding/public_function_family', 'product/run_operation_contracts', 'shared/capability_contracts', 'shared/value/index'].map(load));
  const hash = digests.sha256Canonical, seed = rawFhResponseSeed({store, digests, family, runContracts, capabilities, values, cursors});
  const select = rows => prefixes.selectValidatedRuntimeEventPrefix(freezeRaw([...rows]));
  const runCut = rows => prefixes.selectValidatedRuntimeEventPrefix(freezeRaw([...rows]), {runId: seed.runId});
  const {opened} = seed.events;
  // The seed alone folds, projects its open hold and has no F_H fact.
  assert.deepEqual(fh.projectFhContinuations(runCut(seed.rows), calculus.deriveRuntimeHeldFluentProjection(runCut(seed.rows))).map(row => row.status), ['open']);
  assert.deepEqual(fh.projectFhEffectfulPublicInvocationFacts(select(seed.rows)), {disposition: 'valid', facts: []});
  const envelope = {eventTime: '2026-11-04T00:00:02.000Z', correlationId: opened.correlationId, workflowVersion: opened.workflowVersion,
    scopeClass: opened.scopeClass, basisId: opened.basisId, runId: opened.runId, graphCallId: opened.graphCallId, frameId: opened.frameId,
    graphFunctionRef: opened.graphFunctionRef, materializationRef: opened.materializationRef, aggregateType: 'continuation',
    aggregateId: seed.continuationRef, parentAggregateId: opened.parentAggregateId, causationEventRefs: [opened.eventId]};
  const responseValue = {responseKind: 'approve', decision: 'approved'}, responseDigest = hash(responseValue);
  const response = {actorRef: seed.actorRef, capabilityRef: seed.capabilityRef, continuationRef: seed.continuationRef, responseDigest,
    responseRef: 'interaction-response://abiogenesis/' + responseDigest.slice(7), responseValue};
  const successorInputValue = {subject: 'resumed'}, terminal = disposition => ({candidateDigest: hash(['candidate', disposition]),
    candidateRef: 'candidate://single-address-space/raw-fh/' + disposition, causedByEventRef: opened.eventId, continuationDigest: opened.payload.continuationDigest,
    continuationKind: 'fh_interaction', continuationRef: seed.continuationRef, terminalDisposition: disposition});
  const kinds = {
    fh_interaction_responded: {...response, publicOperationEventRef: opened.eventId, responseContractRef: seed.responseContractRef},
    fh_interaction_resume_admitted: {...response, closureContract: {closureContractRef: 'closure://single-address-space/raw-fh'},
      durablePrefixDigest: hash('prefix'), openedEventRef: opened.eventId, publicOperationEventRef: opened.eventId, respondedEventRef: opened.eventId,
      successorCursor: opened.payload.heldCursor, successorCursorRef: opened.payload.heldCursorRef, successorCursorDigest: opened.payload.heldCursorDigest,
      successorInputContractRef: null, successorInputValueKind: null, successorInputRef: 'input://single-address-space/raw-fh/resumed',
      successorInputDigest: hash(successorInputValue), successorInputValue},
    continuation_abandoned: terminal('abandoned'),
    continuation_superseded: terminal('superseded')};
  const refused = new RegExp('continuation ' + seed.continuationRef.replace(/[/.]/g, '\\$&') + ' has an invalid event lifecycle');
  const rows = {};
  for (const [kind, payload] of Object.entries(kinds)) await t.test(kind, () => {
    const event = store.projectRuntimeEventFromValidatedHistory(freezeRaw([...seed.rows]), {kind, ...envelope, payload});
    const log = [...seed.rows, event];
    assert.throws(() => calculus.deriveRuntimeHeldFluentProjection(runCut(log)), refused, kind + ': the fold refuses it');
    assert.deepEqual(fh.projectFhEffectfulPublicInvocationFacts(select(log)), {disposition: 'invalid_history', eventRefs: []}, kind);
    rows[kind] = event.eventId;
  });
  t.diagnostic(JSON.stringify({ruling4: {seedLength: seed.rows.length, refused: rows}}));
});

// The owned prefix of the complete retained history, as the revision and
// semantic owners hold it, with the history owner's body-work counters.
async function retainedOwnedPrefix(t) {
  const {resources, baseline, eventLogPath, eventLogIdentity} = retained;
  const {eventLogSha256, eventLogBytes} = resources.value;
  const load = name => import(pathToFileURL(join(packageRoot, 'build/code/src', name + '.js')).href);
  const [events, prefixes, history, digests] = await Promise.all(
    ['abg/event_store', 'abg/event_prefix', 'abg/runtime_history', 'shared/digests'].map(load));
  const identity = await fileIdentity(eventLogPath);
  assert.equal(identity.size, eventLogBytes);
  assert.deepEqual(identity, eventLogIdentity, 'retained log identity before reads: the file the gate hashed');
  const body = {kind: 'durable_prefix_coordinate', schemaVersion, eventLogRef: pathToFileURL(eventLogPath).href,
    prefixLength: identity.size, prefixDigest: 'sha256:' + eventLogSha256,
    storeIdentity: {device: identity.device, inode: identity.inode, eventContractDigest: retainedProfile(resources, baseline, events)}};
  const coordinate = {...body, coordinateDigest: digests.sha256Canonical(body)};
  const owned = prefixes.readOwnedRuntimeEventPrefixAtDurablePrefix(coordinate);
  const meter = openMeasurer([join(packageRoot, 'build')]);
  t.after(() => meter.close());
  const work = () => ({...history.RuntimeHistorySelection.owner(owned.selection).work});
  const measured = async (name, action) => {
    const before = work(), row = await meter.measure(name, action, {watchPaths: [eventLogPath]}), after = work();
    return {...row, ownerWork: Object.fromEntries(Object.keys(after).map(key => [key, after[key] - before[key]]))};
  };
  const unchanged = async () => {
    assert.deepEqual(await fileIdentity(eventLogPath), identity, 'retained log identity after reads: the file the gate hashed');
  };
  return {load, prefixes, history, digests, coordinate, owned, measured, unchanged, eventLog: {path: eventLogPath, bytes: eventLogBytes, sha256: eventLogSha256}};
}
const caseRow = row => ({measurement: row.measurement, ownerWork: row.ownerWork});

test('historical revision cuts: the shared before-event owner selects the replaced full-history filter\'s exact exclusive prefix with no body pass, immutability walk or cold revalidation', {...RETAINED, timeout: 600_000}, async t => {
  const {prefixes, history, owned, measured, unchanged, eventLog} = await retainedOwnedPrefix(t);
  const extent = prefixes.runtimeEventPrefixExtent(owned);
  // Each migrated cut ends before an admitted CCall result: the revision
  // bridge result, or the binding projection result.
  const results = prefixes.indexedRuntimeEvents(owned, 'kind:c_call_result_admitted');
  const boundary = results.at(-1), count = boundary.admissionOrdinal - 1;
  assert.ok(count > 0 && boundary.admissionOrdinal < extent.lastOrdinal, 'a genuine interior cut');
  const cut = await measured('owner_before_event_cut', () => prefixes.validatedRuntimeEventPrefixBeforeEvent(owned, boundary.eventId));
  // The replaced expression of all three sites (IR_PREIMAGES semantic_revision.ts
  // jobRevisionSubjectAtBasis/revisionEvidenceComponentsAtBasis and
  // worksite_revision.ts projectionFacts) over the same owner body view.
  const replaced = await measured('replaced_full_history_filter', () => prefixes.selectValidatedRuntimeEventPrefix(
    Object.freeze(prefixes.runtimeEventBodiesAtPrefix(owned).filter(e => e.admissionOrdinal < boundary.admissionOrdinal))));
  // Equal values and order (the digest is SHA256 of the canonical events),
  // extent and profile; the boundary is excluded from both.
  assert.deepEqual(prefixes.runtimeEventPrefixExtent(cut.value), {count, lastOrdinal: count});
  assert.deepEqual(prefixes.runtimeEventPrefixExtent(replaced.value), prefixes.runtimeEventPrefixExtent(cut.value));
  const digest = prefixes.runtimeEventPrefixDigest(cut.value);
  assert.equal(prefixes.runtimeEventPrefixDigest(replaced.value), digest);
  const profile = prefixes.runtimeEventProfileScheduleFromValidatedPrefix(cut.value);
  assert.deepEqual(prefixes.runtimeEventProfileScheduleFromValidatedPrefix(replaced.value), profile);
  for (const prefix of [cut.value, replaced.value]) assert.equal(prefixes.runtimeEventAtPrefix(prefix, boundary.eventId), undefined, 'exclusive boundary');
  assert.deepEqual(prefixes.runtimeEventAtPrefixIndex(cut.value, count - 1), prefixes.runtimeEventAtPrefixIndex(owned, count - 1));
  const resultRefs = prefix => prefixes.indexedRuntimeEvents(prefix, 'kind:c_call_result_admitted').map(e => e.eventId);
  assert.deepEqual(resultRefs(cut.value), results.slice(0, -1).map(e => e.eventId));
  assert.deepEqual(resultRefs(replaced.value), resultRefs(cut.value));
  // The owner cut keeps the owned source; the replaced copy was a separate cold prefix.
  assert.equal(prefixes.isOwnedRuntimeEventPrefix(cut.value), true);
  assert.equal(history.RuntimeHistorySelection.owner(cut.value.selection), history.RuntimeHistorySelection.owner(owned.selection));
  assert.equal(prefixes.isOwnedRuntimeEventPrefix(replaced.value), false);
  // An absent boundary, including the excluded boundary itself, refuses; the
  // migrated callers' existing catch returns null.
  for (const [prefix, eventId] of [[owned, 'component:absent-event'], [cut.value, boundary.eventId]])
    assert.throws(() => prefixes.validatedRuntimeEventPrefixBeforeEvent(prefix, eventId), /historical event-prefix boundary requires one exact admitted event/);
  // The same owner's cold arm agrees with the replaced filter at an early boundary.
  const early = results[0];
  assert.equal(prefixes.runtimeEventPrefixDigest(prefixes.validatedRuntimeEventPrefixBeforeEvent(replaced.value, early.eventId)),
    prefixes.runtimeEventPrefixDigest(prefixes.selectValidatedRuntimeEventPrefix(Object.freeze(
      prefixes.runtimeEventBodiesAtPrefix(replaced.value).filter(e => e.admissionOrdinal < early.admissionOrdinal)))));
  // Removed work on the same input, not relocated work.
  for (const key of ['materialize', 'snapshot', 'decodeEventBody', 'isImmutableRuntimeValue', 'selectValidatedRuntimeEventPrefix', 'readAuthenticatedRuntimePrefixBytes'])
    assert.equal(ownerCount(cut, key), 0, 'the owner cut runs no ' + key);
  assert.equal(cut.ownerWork.bodyRows, 0, 'the owner cut acquires no body');
  assert.equal(cut.measurement.io.watchedReadBytes, 0, 'the owner cut reads no event-log bytes');
  assert.ok(replaced.ownerWork.bodyRows >= extent.count, 'the replaced filter acquires every owner body, not only the cut');
  assert.ok(ownerCount(replaced, 'isImmutableRuntimeValue') > 0, 'the replaced copy walks its bodies for immutability');
  assert.equal(ownerCount(replaced, 'selectValidatedRuntimeEventPrefix'), 1, 'the replaced copy is revalidated cold');
  await unchanged();
  proof.cases.historicalCut = {eventLog, ownerExtent: extent, boundary: {eventRef: boundary.eventId, admissionOrdinal: boundary.admissionOrdinal},
    cut: {count, digest, profile}, earlyBoundary: {eventRef: early.eventId, admissionOrdinal: early.admissionOrdinal},
    refusals: ['absent event', 'excluded boundary'], measurements: [cut, replaced].map(caseRow)};
  t.diagnostic(JSON.stringify(proof.cases.historicalCut.measurements.map(row => ({name: row.measurement.name, wallMs: Math.round(row.measurement.wallMs),
    io: row.measurement.io, calls: row.measurement.ownerCalls, ownerWork: row.ownerWork}))));
});

test('semantic stage authentication borrows the owned prefix: the retired materializing adapter\'s exact owner facts with no materialization or cold revalidation', {...RETAINED, timeout: 600_000}, async t => {
  const {load, prefixes, digests, coordinate, owned, measured, unchanged, eventLog} = await retainedOwnedPrefix(t);
  const [ids, product] = await Promise.all(['gtl/semantic_stage_identity', 'product/index'].map(load));
  // Component premises: the lower owned assembly authentication returns this
  // owned retained prefix, and program/publication validity is supplied. The
  // shared stage authenticator, its role/stage/environment checks and every
  // prefix owner are the actual candidate code; no event is admitted.
  const zero = 'sha256:' + '0'.repeat(64), publicationDigest = digests.sha256Canonical('component:publication');
  const lifecycle = {declarationRef: 'component:lifecycle', sourceDeclarationRef: 'component:source',
    stages: [{declarationRef: 'component:stage', graphFunctionRef: 'component:graph-function', authorLocusRef: 'component:author', assessorLocusRef: 'component:assessor'}]};
  const publication = {owningProductId: product.ABI5_PRODUCT_ID, artifactDigest: zero, productContentDigest: zero, productManifestDigest: zero,
    moduleRef: 'component:module', programs: [{programRef: 'component:program'}], semanticLifecycle: lifecycle, requirementHandoffs: [{declarationRef: 'component:source'}]};
  const native = {prefix: owned, graph: {component: 'graph'}, resolution: {component: 'resolution'},
    execution: {programRef: 'component:program', invocationAdmissionRef: 'component:invocation', basisRef: 'component:basis', basisDigest: digests.sha256Canonical('component:basis')},
    call: {cCallRef: 'component:call', cCallDigest: digests.sha256Canonical('component:call'), implementationRef: ids.SEMANTIC_STAGE_IDS.authorImplementationRef,
      regime: 'F_P', graphFunctionRef: 'component:graph-function', programLocusRef: 'component:author'},
    environment: {kind: 'exact_prefix_workspace_environment', productInstalls: [{productId: publication.owningProductId, artifactDigest: zero, productContentDigest: zero,
      manifestDigest: zero, contributionManifest: {publicationBindings: [{moduleRef: publication.moduleRef, publicationDigest}]}}]}};
  let lower = native;
  const path = join(packageRoot, 'build/code/src/abg/semantic_stage.js');
  const module = new SourceTextModule(await readFile(path, 'utf8'), {identifier: path});
  const overrides = {'./execution_basis.js': {authenticateOwnedNativeInstructionAssemblyBasis: () => lower},
    '../gtl/semantic_stage.js': {validSemanticProgramOwners: () => true}, '../product/publication.js': {modulePublicationSemanticDigest: () => publicationDigest}};
  await module.link(async specifier => {
    const actual = await import(specifier.startsWith('node:') ? specifier : pathToFileURL(join(dirname(path), specifier)).href);
    const values = {...actual, ...overrides[specifier]};
    return new SyntheticModule(Object.keys(values), function () { for (const [key, value] of Object.entries(values)) this.setExport(key, value); });
  });
  await module.evaluate();
  const stage = module.namespace;
  const basis = {publication, executionBasis: {programRef: 'component:program'}, graphFunction: {declarations: {}},
    cursor: {inputRef: 'component:input', inputDigest: digests.sha256Canonical('component:input')}, predecessorPrefix: coordinate};
  // The retired adapter body (IR_PREIMAGES semantic_stage.ts and semantic_job.ts
  // carry the same body for the stage and job authenticators).
  const retired = authenticate => {
    const owner = authenticate(basis);
    if (owner === null || owner.prefix.kind === 'runtime_validation_event_prefix') return null;
    const events = prefixes.runtimeEventBodiesAtPrefix(owner.prefix).materialize();
    return {...owner, events, prefix: prefixes.selectValidatedRuntimeEventPrefix(events)};
  };
  const current = await measured('owned_semantic_stage_authentication', () => stage.authenticateOwnedSemanticStageBasis(basis));
  const expanded = await measured('retired_materializing_adapter', () => retired(stage.authenticateOwnedSemanticStageBasis));
  assert.ok(current.value && expanded.value);
  assert.equal(current.value.role, 'author');
  assert.equal(current.value.stage, lifecycle.stages[0]);
  for (const key of ['role', 'stage', 'inputRef', 'inputDigest', 'call', 'execution', 'graph', 'resolution', 'environment', 'lifecycle', 'source', 'sourcePublication'])
    assert.deepEqual(current.value[key], expanded.value[key], key + ' is the same owner fact');
  // The owner borrows the exact owned prefix; the adapter rebuilt an equal cold copy.
  assert.equal(current.value.prefix, owned);
  assert.equal(prefixes.isOwnedRuntimeEventPrefix(expanded.value.prefix), false);
  assert.deepEqual(prefixes.runtimeEventPrefixExtent(expanded.value.prefix), prefixes.runtimeEventPrefixExtent(owned));
  assert.equal(prefixes.runtimeEventPrefixDigest(expanded.value.prefix), prefixes.runtimeEventPrefixDigest(owned));
  assert.equal(Array.isArray(current.value.events), false, 'the owner keeps the body view');
  assert.equal(expanded.value.events.length, prefixes.runtimeEventPrefixExtent(owned).count);
  // A role/locus refusal is unchanged.
  lower = {...native, call: {...native.call, programLocusRef: 'component:foreign-locus'}};
  assert.equal(stage.authenticateOwnedSemanticStageBasis(basis), null);
  assert.equal(retired(stage.authenticateOwnedSemanticStageBasis), null);
  lower = native;
  // Removed work on the same input.
  for (const key of ['materialize', 'snapshot', 'decodeEventBody', 'isImmutableRuntimeValue', 'selectValidatedRuntimeEventPrefix', 'readAuthenticatedRuntimePrefixBytes'])
    assert.equal(ownerCount(current, key), 0, 'owned authentication runs no ' + key);
  assert.equal(current.ownerWork.bodyRows, 0, 'owned authentication acquires no body');
  assert.equal(current.measurement.io.watchedReadBytes, 0);
  assert.ok(ownerCount(expanded, 'materialize') >= 1);
  assert.ok(expanded.ownerWork.bodyRows >= prefixes.runtimeEventPrefixExtent(owned).count, 'the adapter acquired every history body');
  assert.equal(ownerCount(expanded, 'selectValidatedRuntimeEventPrefix'), 1, 'the adapter revalidated the copy cold');
  // The four retired exports are absent from the compiled owners.
  const exported = Object.fromEntries(await Promise.all(['abg/semantic_stage', 'abg/semantic_job', 'abg/semantic_revision'].map(async name => [name, Object.keys(await load(name))])));
  for (const name of ['authenticateSemanticStageBasis', 'authenticateSemanticJobBasis', 'projectJobRevisionSubject', 'projectRevisionSelectionSubject'])
    assert.ok(Object.values(exported).every(keys => !keys.includes(name)), name + ' is retired');
  assert.ok(exported['abg/semantic_stage'].includes('authenticateOwnedSemanticStageBasis') && exported['abg/semantic_job'].includes('authenticateOwnedSemanticJobBasis'));
  await unchanged();
  proof.cases.semanticAdapter = {eventLog, premise: 'component lower owned assembly authentication and program/publication validity; actual stage authenticator and prefix owners',
    ownerExtent: prefixes.runtimeEventPrefixExtent(owned), prefixDigest: prefixes.runtimeEventPrefixDigest(owned), refusals: ['foreign author locus'],
    retiredExports: ['authenticateSemanticStageBasis', 'authenticateSemanticJobBasis', 'projectJobRevisionSubject', 'projectRevisionSelectionSubject'],
    measurements: [current, expanded].map(caseRow)};
  t.diagnostic(JSON.stringify(proof.cases.semanticAdapter.measurements.map(row => ({name: row.measurement.name, wallMs: Math.round(row.measurement.wallMs),
    io: row.measurement.io, calls: row.measurement.ownerCalls, ownerWork: row.ownerWork}))));
});

// Every case that ran recorded its result: the installed and RAW cases always,
// the retained-history cases when their evidence is present. The record goes
// to the diagnostics, as each case's measurements do; no proof file is written.
test('single-address-space proof records every measured case', async t => {
  const ran = ['installedPath', 'qualificationCut', 'completePairControls', 'maintainedSetup', 'fhHoldSeed',
    ...(retained.kind === 'present' ? ['retainedHistory', 'livenessFork', 'publicOperationClassification', 'globalRunInvocationPairs',
      'historicalCut', 'semanticAdapter'] : [])];
  for (const key of ran) assert.ok(proof.cases[key], key + ' completed');
  const {cases, ...record} = proof;
  t.diagnostic(JSON.stringify({...record, endedUtc: new Date().toISOString(), cases: Object.keys(cases), retainedEvidence: retained.kind,
    qualified: false, published: false}));
});
