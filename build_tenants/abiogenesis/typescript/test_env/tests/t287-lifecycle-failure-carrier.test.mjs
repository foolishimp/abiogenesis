import assert from 'node:assert/strict';
import test from 'node:test';
import { EventEmitter } from 'node:events';
import { mkdir, mkdtemp, readFile, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import * as events from '../../build/code/src/abg/event_store.js';
import * as prefixes from '../../build/code/src/abg/event_prefix.js';
import * as calculus from '../../build/code/src/abg/event_calculus.js';
import * as physical from '../../build/code/src/shared/owned_process_lifetime.js';
import { classifyOwnedProcessTerminal, encodeOwnedProcessFacts } from '../../build/code/src/shared/process/index.js';
import { sha256Bytes, sha256Canonical as hash } from '../../build/code/src/shared/digests.js';
import { deepFreeze } from '../../build/code/src/shared/immutable.js';
import { acquireNewEmptyAppendSinkFixture } from '../support/new-empty-append-sink.mjs';
import { projectAdmittedTransportEvidenceLifecycle, projectAdmittedTransportEvidenceSelection } from '../../build/code/src/abg/c_call.js';
import { actorRuntimeProbeSources } from '../../build/code/src/abg/runtime_liveness_contracts.js';
import { FROZEN_S2_EVENT_CONTRACT_DIGEST, INSTALLED_RC6_EVENT_CONTRACT_DIGEST } from '../../build/code/src/abg/event_contract_profiles.js';

// Component harness of t287-f04a-probabilistic-result-candidate (finalized
// artifact cases) over this tenant's build, without the installed environment:
// built owners are linked in a VM with named lower premises replaced. The
// physical child, the group probe, prefix acquisition and event recording are
// controlled premises; the lifetime, the worker transport, the actor's
// reporting and refusal carrier, the fold and the failure owner are real.
// This is not an installed Run or OS-process proof. Case b does not show one
// store: the actor runs over controlled prefixes and failure retention runs in
// a second, real append sink; and failActorProcessEffect is called directly,
// not from evaluateOwnedExecutableCCall.

const root = resolve(import.meta.dirname, '../..');
const built = name => join(root, 'build/code/src', name + '.js');
const time = '2026-10-22T00:00:00.000Z';

async function component(name, overrides = {}, suffix = '', transform = source => source) {
  const path = built(name);
  const module = new SourceTextModule(transform(await readFile(path, 'utf8')) + suffix, { identifier: path });
  await module.link(async specifier => {
    const actual = await import(specifier.startsWith('.') ? pathToFileURL(resolve(dirname(path), specifier)).href : specifier);
    const values = { ...actual, ...overrides[specifier] };
    return new SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    });
  });
  await module.evaluate();
  return module.namespace;
}

// The physical premise: the group probe answers unknown, signals are inert,
// and the grace is short. A no-child launch failure needs no probe.
const unknownGroupLifetime = {
  createOwnedProcessLifetime: (child, bounds, observers) => physical.createOwnedProcessLifetime(child, {
    ...bounds, terminationGraceMs: 5, host: {
      clock: { nowNs: () => process.hrtime.bigint(), arm: (f, ms) => setTimeout(f, ms), cancel: clearTimeout },
      platform: 'posix', signal: () => {}, probeGroup: () => 'unknown',
    },
  }, observers),
};

// The helper's Effect command reaches these Promise-facing cases through its own host projection.
const runCommandOnHost = '\nconst runCommandOnHost = (...args) => runHelperProgram(runCommand(...args));' +
  '\nexport { runCommandOnHost as runCommand };';

const holds = (rows, name, identity) => calculus.holdsAt(
  calculus.deriveRuntimeEventCalculusProjection(prefixes.selectValidatedRuntimeEventPrefix(deepFreeze([...rows]))),
  calculus.constructRuntimeFluent({ name, identity }));
const json = value => JSON.parse(JSON.stringify(value));
// Case b's error after launch: a stream error after the direct exit.
const afterExitStreamError = Object.assign(new Error('fixture stdout read failure after exit'), { code: 'EIO' });

// Recorder rows. Without a stamp they are L rows (no eventContractDigest
// member), as recorded L stores hold them; the actor drive stamps every row
// with the current profile W, the only profile an actor invocation runs on.
function recorder(label, stamp = null) {
  const rows = [];
  let ordinal = 0;
  const append = candidate => {
    ordinal += 1;
    const row = deepFreeze({ ...candidate, ...(stamp === null ? {} : { eventContractDigest: stamp }),
      eventId: `event://t287/carrier/${label}/${ordinal}`, admissionOrdinal: ordinal, payloadDigest: hash(candidate.payload) });
    rows.push(row);
    return row;
  };
  return { rows, append };
}

const scope = { runId: 'run://t287/carrier', graphCallId: 'graph-call://t287/carrier', frameId: 'frame://t287/carrier' };
const common = { correlationId: 'correlation://t287/carrier', workflowVersion: '5.0.0', scopeClass: 'run',
  basisId: 'basis://t287/carrier', eventTime: time, ...scope };

async function driveActor(t, mode, stamp = events.ROOT_EVENT_CONTRACT_DIGEST) {
  const scratch = await realpath(await mkdtemp(join(tmpdir(), `abi5-carrier-${mode}-`)));
  t.after(() => rm(scratch, { recursive: true, force: true }));
  const archiveRoot = join(scratch, 'workspace', '.abg', 'archives');
  await mkdir(archiveRoot, { recursive: true });
  const { rows, append } = recorder(mode, stamp === events.LEGACY_ROOT_EVENT_CONTRACT_DIGEST ? null : stamp);
  let currentPrefix = { storeIdentity: { eventContractDigest: stamp }, coordinateDigest: hash(`${mode}:0`) };
  let spawned = 0;
  const probes = [];
  let plan = null, finalFacts = null, transportError = null;
  const child = new EventEmitter();
  child.pid = mode === 'spawn_failed' ? undefined : 4242;
  for (const name of ['stdin', 'stdout', 'stderr']) {
    const stream = new EventEmitter();
    stream.closed = false;
    stream.setEncoding = () => stream;
    stream.destroy = () => { stream.destroyed = true; };
    child[name] = stream;
  }
  child.stdin.end = () => setImmediate(() => {
    if (mode === 'spawn_failed') {
      child.emit('error', Object.assign(new Error('spawn fixture-worker ENOENT'),
        { code: 'ENOENT', errno: -2, syscall: 'spawn fixture-worker', path: 'fixture-worker' }));
      child.emit('close', -2, null);
    } else {
      child.emit('spawn');
      child.emit('exit', 0, null);
      child.stdout.emit('error', afterExitStreamError);
      child.emit('close', 0, null);
    }
  });
  const worker = await component('abg/worker_transport', {
    'node:child_process': { spawn: () => { spawned += 1; return child; } },
    '../shared/owned_process_lifetime.js': unknownGroupLifetime,
  });
  const cCallRef = `c-call://t287/carrier/${mode}`;
  const fibre = append({ ...common, kind: 'c_call_fibre_selected', aggregateType: 'c_call', aggregateId: cCallRef,
    parentAggregateId: scope.frameId, causationEventRefs: [], payload: { cCallRef } });
  // Current-profile premises: the liveness context and probe admission are
  // named premises (the probe signals are recorded, no probe row is written);
  // the binding row carries the actor's real liveness binding. The store's
  // committed prefix is the recorder rows, and no stdout window is bound.
  const actor = await component('abg/actor_process', {
    './event_prefix.js': { readOwnedRuntimeEventPrefixAtDurablePrefix: () => null,
      selectRuntimeEventPrefixFromStore: () => prefixes.selectValidatedRuntimeEventPrefix(deepFreeze([...rows])) },
    './invocation_admission.js': { rehydrateInvocationAdmissionAtPrefix: () => null },
    './environment_admission.js': { hasAdmittedWorkspaceBinding: () => true },
    '../implementation/leaf_invocation_port.js': { isAdmittedLeafInvocationPort: () => true },
    './event_store.js': { assertHeldEventStoreAtDurablePrefix: () => {}, admitRuntimeEvent: (_store, candidate) => append(candidate),
      bindNativeStdoutWindow: () => () => {},
      admitNonEmptyRuntimeEventTransactionAtDurablePrefix: (_store, _prefix, action) => {
        const value = action();
        currentPrefix = { ...currentPrefix, coordinateDigest: hash(`${mode}:${rows.length}`) };
        return { value, successorPrefix: currentPrefix };
      } },
    './runtime_liveness.js': { captureNativeFrameBoundary: () => ({}), observeNativeFrameLiveness: () => {},
      projectActorLivenessContext: (_prefix, actorInvocationRef) => ({ scope: { actorInvocationRef },
        binding: { clockOriginRef: 'runtime-clock://t287/carrier' }, declarationEventRef: null,
        probes: actorRuntimeProbeSources(plan.parser).map(source => ({ source, probeRef: `runtime-probe://t287/carrier/${source}` })) }),
      admitRuntimeActivityProbe: input => {
        probes.push({ source: input.source, signal: input.observation.signal });
        return { successorPrefix: currentPrefix, value: rows.find(row => row.eventId === input.observation.underlyingEventRef) };
      } },
    './worker_transport.js': {
      prepareWorkerTransport: async input => (plan = await worker.prepareWorkerTransport(input)),
      runPreparedWorkerTransport: async (prepared, observer) => {
        try {
          return await worker.runPreparedWorkerTransport(prepared, { ...observer, onProcessFinalized: facts => {
            finalFacts = facts; observer.onProcessFinalized(facts);
          } });
        } catch (error) { transportError = error; throw error; }
      },
    },
  }, '\nexport { invokeActorProcessWithAssembly };');
  const request = { actorRef: 'actor://t287/carrier', workerBindingRef: 'worker-binding://t287/carrier',
    implementationRef: 'implementation://t287/carrier', inputDigest: hash({ subject: mode }),
    materializationPlanRef: 'materialization-plan://t287/carrier', rendererRef: 'renderer://t287/carrier',
    instructionContractRef: 'contract://t287/carrier/instruction', resultContractRef: 'contract://t287/carrier/result',
    transportLane: 'closed_prompt_proof', prompt: 'Return the fixed fixture payload.', responseJsonSchema: { type: 'object' } };
  const occurrence = { cCallRef, ...scope, programLocusRef: 'locus://t287/carrier', taskOrdinal: null, attempt: 1 };
  const workspaceBinding = { bindingId: 'workspace-binding://t287/carrier', bindingDigest: hash('binding'), roots: { archiveRoot } };
  const effect = await actor.invokeActorProcessWithAssembly({
    store: {}, predecessorPrefix: currentPrefix, scope, occurrence, request, dispatchOrdinal: 1,
    executionBasis: { basisRef: common.basisId, workspaceBindingId: workspaceBinding.bindingId,
      workspaceBindingDigest: workspaceBinding.bindingDigest, invocationAdmissionRef: 'invocation-admission://t287/carrier',
      graphFunctionRef: 'graph-function://t287/carrier', graphRef: 'graph://t287/carrier' },
    cCall: { ...occurrence, implementationRef: request.implementationRef, outputContractRef: request.resultContractRef,
      implementationBindingRef: 'implementation-binding://t287/carrier', fibreSelectedEventRef: fibre.eventId },
    expectedInputDigest: request.inputDigest,
    workerContracts: { instructionContractRef: request.instructionContractRef, resultContractRef: request.resultContractRef },
    runtime: { workspaceBinding, artifactTruth: {} }, basis: { correlationId: common.correlationId },
    rawResultOwner: { port: { isAdmittedResolution: () => true },
      resolution: { implementationRef: request.implementationRef, outputContractRef: request.resultContractRef },
      input: { subject: mode } },
  });
  return { rows, effect, finalFacts, transportError, plan, probes, spawned };
}

test('worker no-child launch failure: spawn_failed admitted; the bound transport artifact carries processFacts', async t => {
  const { rows, effect, finalFacts, plan, probes } = await driveActor(t, 'spawn_failed');
  assert.notEqual(finalFacts, null);
  assert.equal(rows.find(row => row.kind === 'actor_transport_binding_admitted').payload.livenessBinding.kind, 'runtime_liveness_binding');
  assert.deepEqual(probes, [], 'no process start, so no start probe');
  assert.equal(finalFacts.noChildEstablished, true);
  assert.equal(classifyOwnedProcessTerminal(finalFacts), 'spawn_failed');
  const kinds = rows.map(row => row.kind);
  assert.equal(kinds.filter(kind => kind === 'actor_process_spawn_failed').length, 1);
  for (const kind of ['actor_process_started', 'actor_process_exited', 'actor_process_termination_unconfirmed'])
    assert.equal(kinds.includes(kind), false, kind);
  const terminal = rows.find(row => row.kind === 'actor_process_spawn_failed');
  assert.equal(terminal.payload.diagnosticDigest, hash(finalFacts.launchFailure.message));
  // Receipt path: the observation binds the transport artifact by digest;
  // the artifact, not the event payload, carries the encoded facts.
  const observed = rows.filter(row => row.kind === 'actor_result_artifact_observed');
  assert.equal(observed.length, 1);
  assert.equal(Object.hasOwn(observed[0].payload, 'processFacts'), false, 'payload key list unchanged');
  const bytes = await readFile(plan.paths.transport);
  assert.equal(sha256Bytes(bytes), observed[0].payload.transportDigest);
  assert.equal(observed[0].payload.artifactDigests.transport, observed[0].payload.transportDigest);
  const body = JSON.parse(bytes.toString('utf8'));
  assert.deepEqual(body.processFacts, json(encodeOwnedProcessFacts(finalFacts)));
  assert.equal(body.processFacts.launchFailure.code, 'ENOENT');
  assert.equal(body.processFacts.launchFailure.errno, '-2');
  assert.equal(Object.hasOwn(body.processFacts.launchFailure, 'stack'), false);
  // D5: the archive omits the lifecycle copies; its own timeoutClass and
  // encoded facts determine them. The artifact event records no copy either:
  // the fold over the process rows supplies them.
  for (const key of ['timedOut', 'exitObserved', 'terminationConfirmed'])
    assert.equal(Object.hasOwn(body, key), false, `the archive omits ${key}`);
  assert.equal(body.timeoutClass, null);
  assert.equal(classifyOwnedProcessTerminal(body.processFacts), 'spawn_failed');
  for (const key of ['timedOut', 'exitObserved', 'terminationConfirmed', 'signalSequence'])
    assert.equal(Object.hasOwn(observed[0].payload, key), false, `the current artifact event records no ${key}`);
  assert.equal(observed[0].payload.nativeResultAssessment.disposition, 'absent', 'empty output assesses as absent');
  assert.equal(rows.some(row => row.kind === 'actor_invocation_failed'), true);
  assert.equal(effect.kind, 'actor_process_effect_receipt');
  // Derived state over the fold of W.
  const processRef = terminal.aggregateId;
  assert.equal(holds(rows, 'actor_process_spawn_failed', processRef), true);
  assert.equal(holds(rows, 'actor_process_terminated', processRef), false);
  assert.equal(holds(rows, 'actor_process_live', processRef), false);
  assert.equal(holds(rows, 'terminationConfirmed_copy_disagrees', processRef), false, 'no copy disagrees with the fold');
});

async function retainAtFailCCall(t, refusal) {
  const acquired = await acquireNewEmptyAppendSinkFixture(t, events.createNewEmptyAppendSink, 'abi5-carrier-failure-');
  const store = acquired.store;
  const failureScope = { runId: 'run://t287/carrier/failure', graphCallId: 'graph-call://t287/carrier/failure',
    frameId: 'frame://t287/carrier/failure', frameLineageId: 'lineage://t287/carrier/failure',
    executionBasisRef: 'basis://t287/carrier/failure' };
  const executionBasis = { basisRef: failureScope.executionBasisRef, graphFunctionRef: 'graph-function://t287/carrier',
    graphRef: 'graph://t287/carrier' };
  const candidate = (kind, payload, extra) => ({ kind, payload, eventTime: time, aggregateType: 'frame',
    aggregateId: failureScope.frameId, parentAggregateId: failureScope.graphCallId, causationEventRefs: [],
    correlationId: 'correlation://t287/carrier/failure', workflowVersion: '5.0.0', scopeClass: 'run',
    basisId: failureScope.executionBasisRef, runId: failureScope.runId, graphCallId: failureScope.graphCallId,
    frameId: failureScope.frameId, frameLineageId: failureScope.frameLineageId,
    graphFunctionRef: executionBasis.graphFunctionRef, materializationRef: executionBasis.graphRef, ...extra });
  const run = events.admitRuntimeEvent(store, candidate('run_segment_opened', {
    executionBasisDigest: hash('basis'), executionBasisRef: failureScope.executionBasisRef, graphDigest: hash('graph'),
    graphFunctionRef: executionBasis.graphFunctionRef, graphRef: executionBasis.graphRef,
    invocationAdmissionRef: 'invocation-admission://t287/carrier', invocationRef: 'invocation://t287/carrier',
    programRef: 'program://t287/carrier', runDigest: hash('run'), runId: failureScope.runId,
    workspaceBindingId: 'workspace-binding://t287/carrier',
  }, { aggregateType: 'run', aggregateId: failureScope.runId, parentAggregateId: null }));
  const opened = events.admitRuntimeEvent(store, candidate('frame_opened', {
    frameId: failureScope.frameId, frameDigest: hash('frame'), frameLineageId: failureScope.frameLineageId,
    attempt: 1, parentFrameId: null,
  }, { causationEventRefs: [run.eventId] }));
  failureScope.frameOpenEventRef = opened.eventId;
  // Lower admission premises of the failure owner, as in
  // t287-runtime-failure-diagnostic; the owner's retention check is real.
  const owner = await component('abg/runtime_failure', {
    './execution_basis.js': { hasAdmittedExecutionBasisAtPrefix: (_p, basis) => basis === executionBasis },
    './open_call.js': { hasOpenedTraversalScopeAtPrefix: (_p, value) => value === failureScope },
    './replay.js': { replayValidatedRuntimeEventPrefix: prefix => ({ runtimeStatus: 'failed',
      runtimeFailureEventRef: prefixes.indexedRuntimeEvents(prefix, 'kind:runtime_failure_observed')[0]?.eventId }) },
  });
  // failTraversal and failCCall are the real built bodies; only their owner
  // binding is this owner instance.
  const traversal = await component('hog/traversal_failure', { '../abg/index.js': { admitRuntimeFailure: owner.admitRuntimeFailure } });
  const lifecycle = await component('hog/ccall_lifecycle', { './traversal_failure.js': traversal },
    '\nexport { failActorProcessEffect };');
  // The actor ran over controlled prefix coordinates; the refusal is rebased
  // onto this store's held prefix, every other member unchanged.
  const held = events.selectHeldEventStoreDurablePrefix(store);
  const rebased = deepFreeze({ ...refusal, predecessorPrefix: held, successorPrefix: held });
  const ordinal = 3;
  let thrown = null;
  try {
    lifecycle.failActorProcessEffect({ store, executionBasis, openedTraversalScope: failureScope, ordinal,
      clock: { eventTime: time, correlationId: 'correlation://t287/carrier/failure' } }, rebased);
  } catch (error) { thrown = error; }
  assert.equal(thrown instanceof traversal.GraphTraversalFailure, true, String(thrown));
  const handoff = store.projectReopenAuthorityAndClose();
  const rows = events.readRuntimeEventsAtDurablePrefix(json(handoff.prefix));
  const prefix = prefixes.selectValidatedRuntimeEventPrefix(rows, { runId: failureScope.runId });
  return { rebased, ordinal, rows, evidence: owner.projectRuntimeFailureEvidenceAtPrefix(prefix),
    diagnosticRef: owner.constructRuntimeFailureDiagnosticRef };
}

// T-292 TD-32: the actor records a liveness binding, probes and stdout
// windows; only the current profile admits the probes and windows. On L, RC6
// and S2 it refuses before its binding or any start. (The RC6 and S2 tables
// admit the binding row itself, so this check is their refusal before a
// spawn; on L the event store's door also refuses any binding row. This
// recorder applies no event contract.)
test('an actor invocation runs only on the current profile: on L, RC6 and S2 it is refused before its binding or any start', async t => {
  for (const [label, stamp] of [['L', events.LEGACY_ROOT_EVENT_CONTRACT_DIGEST], ['RC6', INSTALLED_RC6_EVENT_CONTRACT_DIGEST],
    ['S2', FROZEN_S2_EVENT_CONTRACT_DIGEST]]) {
    const { rows, effect, probes, spawned } = await driveActor(t, `refused-${label}`, stamp);
    console.log(JSON.stringify({ kind: 'td32_actor_profile_row', profile: label, effect: effect.kind, code: effect.code ?? null,
      message: effect.message ?? null, kinds: rows.map(row => row.kind), spawned }));
    assert.equal(effect.kind, 'actor_process_effect_refusal', label);
    assert.equal(effect.code, 'actor_process_invocation_refused', label);
    assert.match(effect.message, /liveness admission requires one held current-profile owner context/u, label);
    assert.deepEqual(rows.map(row => row.kind), ['c_call_fibre_selected'], `${label}: no binding or start row`);
    assert.equal(spawned, 0, `${label}: no process is spawned`);
    assert.deepEqual(probes, [], label);
  }
});

test('worker error after launch with unresolved cleanup: termination_unconfirmed admitted; the refusal carries processFacts; failCCall retains it', async t => {
  const { rows, effect, finalFacts, transportError, probes } = await driveActor(t, 'unconfirmed');
  assert.notEqual(finalFacts, null);
  assert.deepEqual(probes.find(probe => probe.source === 'process_lifecycle'), { source: 'process_lifecycle', signal: 'activity' },
    'the start probe reaches the liveness owner');
  assert.equal(classifyOwnedProcessTerminal(finalFacts), 'unconfirmed');
  assert.equal(finalFacts.scopeAbsence, 'unknown');
  assert.deepEqual(finalFacts.directExit, { status: 0, signal: null });
  assert.match(String(transportError), /fixture stdout read failure after exit/u);
  const kinds = rows.map(row => row.kind);
  assert.equal(kinds.filter(kind => kind === 'actor_process_started').length, 1);
  assert.equal(kinds.filter(kind => kind === 'actor_process_termination_unconfirmed').length, 1);
  for (const kind of ['actor_process_exited', 'actor_process_spawn_failed', 'actor_result_artifact_observed', 'actor_invocation_failed'])
    assert.equal(kinds.includes(kind), false, kind);
  assert.equal(effect.kind, 'actor_process_effect_refusal');
  assert.equal(effect.code, 'actor_process_invocation_refused');
  assert.doesNotMatch(effect.diagnosticRef, /^data:/u, 'the refusal keeps its own class reference');
  assert.deepEqual(effect.processFacts, encodeOwnedProcessFacts(finalFacts));
  assert.equal(effect.processFacts.scopeAbsence, 'unknown');
  assert.equal(effect.processFacts.firstError.message, afterExitStreamError.message);
  assert.equal(Object.isFrozen(effect.processFacts), true);
  const processRef = rows.find(row => row.kind === 'actor_process_started').aggregateId;
  assert.equal(holds(rows, 'actor_process_termination_unconfirmed', processRef), true);
  assert.equal(holds(rows, 'actor_process_terminated', processRef), false);
  assert.equal(holds(rows, 'actor_cleanup_pending', processRef), true);

  // C-call failure branch: the retained subject is the refusal, processFacts included.
  const retained = await retainAtFailCCall(t, effect);
  const failures = retained.rows.filter(row => row.kind === 'runtime_failure_observed');
  assert.equal(failures.length, 1);
  const stage = `leaf-effect-${retained.ordinal}`;
  const subject = { stage, candidate: json(retained.rebased) };
  assert.equal(retained.evidence.length, 1);
  assert.equal(retained.evidence[0].availability, 'retained');
  assert.equal(failures[0].payload.diagnosticRef, retained.diagnosticRef(subject));
  assert.match(failures[0].payload.diagnosticRef, /^data:application\/json;charset=utf-8,/u);
  assert.equal(retained.evidence[0].subjectDigest, hash(subject));
  assert.equal(retained.evidence[0].diagnosticClassRef, null, 'the class reference is the candidate member, not a subject member');
  assert.deepEqual(retained.evidence[0].subject, subject);
  assert.deepEqual(retained.evidence[0].subject.candidate.processFacts, json(effect.processFacts));
  assert.equal(retained.evidence[0].subject.candidate.diagnosticRef, effect.diagnosticRef, 'the class reference stays on the refusal');
});

test('helper route: the classifier reports spawn failure as confirmed and unresolved cleanup with processFacts', {
  skip: process.platform === 'win32' && 'win32 platform: the helper route runs over POSIX process groups and signals', timeout: 20_000,
}, async t => {
  const scratch = await realpath(await mkdtemp(join(tmpdir(), 'abi5-carrier-helper-')));
  t.after(() => rm(scratch, { recursive: true, force: true }));
  const priorSignals = new Map(['SIGTERM', 'SIGINT'].map(signal => [signal, process.listeners(signal)]));
  t.after(() => { for (const [signal, prior] of priorSignals) for (const listener of process.listeners(signal))
    if (!prior.includes(listener)) process.removeListener(signal, listener); });
  const exposeRunCommand = source => {
    const replaced = source.replace(/await main\(\);\s*$/u, '');
    assert.notEqual(replaced, source, 'helper main is not run');
    return replaced;
  };
  const task = executable => ({ taskRef: 'task://t287/carrier', taskDigest: hash('task'), commands: [{
    commandId: 'command://t287/carrier', executable, args: executable === process.execPath ? ['-e', ''] : [],
    relativeCwd: '.', environment: [], timeoutMs: 10_000, terminationGraceMs: 50, expectedReports: [] }] });

  const real = await component('implementation/worksite_command_helper', {}, runCommandOnHost, exposeRunCommand);
  const launched = await real.runCommand(task(join(scratch, 'absent-executable')), scratch, 0);
  assert.equal(launched.exitStatus, 127);
  assert.equal(launched.terminationConfirmed, true, 'a no-child launch failure has nothing to clean up');
  assert.equal(Buffer.from(launched.stderr.payload, 'base64').toString('utf8').includes('cleanup unresolved'), false);

  const unknown = await component('implementation/worksite_command_helper',
    { '../shared/owned_process_lifetime.js': unknownGroupLifetime }, runCommandOnHost, exposeRunCommand);
  let thrown = null;
  try { await unknown.runCommand(task(process.execPath), scratch, 0); }
  catch (error) { thrown = error; }
  assert.equal(thrown instanceof TypeError, true, String(thrown));
  assert.match(thrown.message, /^worksite command cleanup unresolved; dependent work stopped: /u);
  const detail = JSON.parse(thrown.message.slice(thrown.message.indexOf('{')));
  assert.equal(detail.command.terminationConfirmed, false);
  assert.equal(detail.command.exitStatus, 0);
  assert.match(detail.diagnostic, /ABI owned process cleanup unresolved/u);
  assert.equal(detail.processFacts.scopeAbsence, 'unknown');
  assert.deepEqual(detail.processFacts.directExit, { status: 0, signal: null });
  assert.equal(detail.processFacts.noChildEstablished, false);
});

test('helper route: an error after launch with unresolved cleanup throws the command failure with processFacts', {
  skip: process.platform === 'win32' && 'win32 platform: the helper route runs over POSIX process groups and signals', timeout: 20_000,
}, async t => {
  const scratch = await realpath(await mkdtemp(join(tmpdir(), 'abi5-carrier-helper-error-')));
  t.after(() => rm(scratch, { recursive: true, force: true }));
  const priorSignals = new Map(['SIGTERM', 'SIGINT'].map(signal => [signal, process.listeners(signal)]));
  t.after(() => { for (const [signal, prior] of priorSignals) for (const listener of process.listeners(signal))
    if (!prior.includes(listener)) process.removeListener(signal, listener); });
  const exposeRunCommand = source => {
    const replaced = source.replace(/await main\(\);\s*$/u, '');
    assert.notEqual(replaced, source, 'helper main is not run');
    return replaced;
  };
  // The lifetime stub hands back facts with an unresolved scope and a first
  // error; the child is a controlled emitter, so no real process is unowned.
  const failure = Object.assign(new Error('fixture command stream failure'), { code: 'EIO' });
  const facts = Object.freeze({ directExit: Object.freeze({ status: 0, signal: null }), launchFailure: null,
    noChildEstablished: false, scopeKind: 'posix_process_group', scopeAbsence: 'unknown', closeObserved: true,
    streamsDisposed: true, drainExpired: false, firstError: failure, cleanupDeadlineNs: null, cleanupElapsedMs: 0,
    probeCount: 1, signalAttempts: 1 });
  const child = new EventEmitter();
  child.pid = 4243;
  for (const name of ['stdout', 'stderr']) child[name] = Object.assign(new EventEmitter(), { destroy: () => {} });
  const stubLifetime = { createOwnedProcessLifetime: () => ({ completion: Promise.resolve(facts),
    observe: () => undefined, fail: () => {}, requestTermination: () => {}, snapshot: () => facts }) };
  const helper = await component('implementation/worksite_command_helper',
    { 'node:child_process': { spawn: () => child }, '../shared/owned_process_lifetime.js': stubLifetime },
    runCommandOnHost, exposeRunCommand);
  const task = { taskRef: 'task://t287/carrier', taskDigest: hash('task'), commands: [{
    commandId: 'command://t287/carrier', executable: 'fixture-command', args: [], relativeCwd: '.', environment: [],
    timeoutMs: 10_000, terminationGraceMs: 50, expectedReports: [] }] };
  let thrown = null;
  try { await helper.runCommand(task, scratch, 0, 'attempt://t287/carrier'); }
  catch (error) { thrown = error; }
  assert.equal(thrown instanceof TypeError, true, String(thrown));
  assert.match(thrown.message, /^worksite command failed; dependent work stopped: /u);
  const detail = JSON.parse(thrown.message.slice(thrown.message.indexOf('{')));
  assert.equal(detail.taskRef, task.taskRef);
  assert.equal(detail.attemptRef, 'attempt://t287/carrier');
  assert.equal(detail.command.commandId, task.commands[0].commandId);
  assert.equal(detail.processFacts.scopeAbsence, 'unknown');
  assert.equal(detail.processFacts.firstError.message, failure.message);
  assert.equal(detail.diagnostic.message, failure.message);
  assert.deepEqual(detail.processFacts, json(encodeOwnedProcessFacts(facts)));
});

test('D5: a terminationConfirmed copy that disagrees with the fold initiates the diagnostic fluent; no prefix is refused', () => {
  const { rows, append } = recorder('d5');
  const processEvent = (kind, processRef, payload, causes = []) => append({ ...common, kind, aggregateType: 'process',
    aggregateId: processRef, parentAggregateId: 'actor-invocation://t287/carrier', causationEventRefs: causes,
    payload: { actorInvocationRef: 'actor-invocation://t287/carrier', processRef, ...payload } });
  const artifact = (processRef, terminationConfirmed, causes) => append({ ...common, kind: 'actor_result_artifact_observed',
    aggregateType: 'actor_invocation', aggregateId: 'actor-invocation://t287/carrier', parentAggregateId: 'c-call://t287/carrier',
    causationEventRefs: causes, payload: { cCallRef: 'c-call://t287/carrier', processRef, terminationConfirmed, exitObserved: terminationConfirmed } });
  const evidenced = (processRef, evidenceClass, terminationConfirmed) => append({ ...common, kind: 'c_call_evidenced',
    aggregateType: 'c_call', aggregateId: 'c-call://t287/carrier', parentAggregateId: scope.frameId, causationEventRefs: [],
    payload: { cCallRef: 'c-call://t287/carrier', evidenceClass, processRef, terminationConfirmed } });
  const disagreeing = 'process://t287/carrier/disagrees';
  const agreeing = 'process://t287/carrier/agrees';
  const started = processEvent('actor_process_started', disagreeing, { processId: 1, cCallRef: 'c-call://t287/carrier' });
  artifact(disagreeing, true, [started.eventId]);
  const startedAgreeing = processEvent('actor_process_started', agreeing, { processId: 2, cCallRef: 'c-call://t287/carrier' });
  const exited = processEvent('actor_process_exited', agreeing, { status: 0, signal: null }, [startedAgreeing.eventId]);
  artifact(agreeing, true, [exited.eventId]);
  evidenced('process://t287/carrier/transport', 'probabilistic_transport', true);
  evidenced('process://t287/carrier/other-class', 'deterministic_value', true);
  // D5 current evidence: no copy, so nothing is checked and the fluent answers.
  append({ ...common, kind: 'c_call_evidenced', aggregateType: 'c_call', aggregateId: 'c-call://t287/carrier',
    parentAggregateId: scope.frameId, causationEventRefs: [],
    payload: { cCallRef: 'c-call://t287/carrier', evidenceClass: 'probabilistic_transport', processRef: 'process://t287/carrier/copy-free' } });
  assert.equal(holds(rows, 'terminationConfirmed_copy_disagrees', 'process://t287/carrier/copy-free'), false,
    'copy-free evidence derives no diagnostic');
  assert.equal(holds(rows, 'actor_process_terminated', 'process://t287/carrier/copy-free'), false);
  assert.equal(holds(rows, 'actor_process_terminated', agreeing), true);
  assert.equal(holds(rows, 'actor_process_terminated', disagreeing), false);
  assert.equal(holds(rows, 'terminationConfirmed_copy_disagrees', disagreeing), true);
  assert.equal(holds(rows, 'terminationConfirmed_copy_disagrees', agreeing), false);
  assert.equal(holds(rows, 'terminationConfirmed_copy_disagrees', 'process://t287/carrier/transport'), true);
  assert.equal(holds(rows, 'terminationConfirmed_copy_disagrees', 'process://t287/carrier/other-class'), false,
    'only probabilistic_transport evidence carries the checked copy');
});

// D5 cold evidence projection, component premise: one synthetic immutable
// prefix holds the binding, actor start, process, signal, artifact and actor
// terminal rows the real projection joins. It is not an owner-created store,
// Run or archive, and holds no timeout row: a current timeout needs its native
// liveness relation, which this premise does not construct. `terminal` selects
// the process terminal: an exit, a no-child spawn failure, or an exit whose
// scope stays unresolved (no actor terminal follows).
const RETIRED_COPIES = ['exitObserved', 'signalSequence', 'terminationConfirmed', 'timedOut'];
function evidenceProjectionFixture({ profile, signalled = false, terminal = 'exited', artifactOverrides = {}, artifactOmit = [] }) {
  const rows = [];
  const add = (kind, aggregateType, aggregateId, parentAggregateId, payload, causationEventRefs = []) => {
    const ordinal = rows.length + 1;
    const row = deepFreeze({ ...common, kind, aggregateType, aggregateId, parentAggregateId, causationEventRefs, payload,
      ...(profile === undefined ? {} : { eventContractDigest: profile }),
      eventId: `event://t287/carrier/d5-evidence/${ordinal}`, admissionOrdinal: ordinal, payloadDigest: hash(payload) });
    rows.push(row);
    return row;
  };
  const current = profile !== undefined;
  const cCallRef = 'c-call://t287/carrier/d5-evidence', actorInvocationRef = 'actor-invocation://t287/carrier/d5-evidence';
  const processRef = 'process://t287/carrier/d5-evidence';
  const ids = { actorRef: 'actor://t287/carrier', workerBindingRef: 'worker-binding://t287/carrier',
    implementationRef: 'implementation://t287/carrier', inputDigest: hash('d5-input'), promptDigest: hash('d5-prompt') };
  const requestDigest = hash('d5-request'), requestRef = `probabilistic-request://abiogenesis/${requestDigest.slice(7)}`;
  const bindingBody = { cCallRef, agentKey: 'claude', parser: 'plain_text', workerBindingRef: ids.workerBindingRef,
    implementationBindingRef: 'implementation-binding://t287/carrier', implementationRef: ids.implementationRef,
    timeoutMs: 1000, absoluteTimeoutMs: 5000 };
  const transportBindingDigest = hash(bindingBody);
  const transportBindingRef = `transport-binding://abiogenesis/${transportBindingDigest.slice(7)}`;
  const bindingRefs = { transportBindingRef, transportBindingDigest };
  add('c_call_fibre_selected', 'c_call', cCallRef, scope.frameId,
    { cCallRef, implementationBindingRef: bindingBody.implementationBindingRef });
  const binding = add('actor_transport_binding_admitted', 'transport_binding', transportBindingRef, cCallRef,
    { ...bindingBody, ...bindingRefs });
  add('actor_invocation_started', 'actor_invocation', actorInvocationRef, cCallRef,
    { cCallRef, actorInvocationRef, ...ids, requestRef, requestDigest, ...bindingRefs }, [binding.eventId]);
  if (terminal !== 'spawn_failed') add('actor_process_started', 'process', processRef, actorInvocationRef, { actorInvocationRef, processRef, processId: 4244 });
  if (signalled) add('actor_process_signal_requested', 'process', processRef, actorInvocationRef, { actorInvocationRef, processRef, signal: 'SIGTERM' });
  // A direct exit reports one status or signal; a spawn failure reports none.
  const status = terminal === 'spawn_failed' || signalled ? null : 0, signal = signalled ? 'SIGTERM' : null;
  if (terminal === 'exited') add('actor_process_exited', 'process', processRef, actorInvocationRef, { actorInvocationRef, processRef, status, signal });
  if (terminal === 'spawn_failed') add('actor_process_spawn_failed', 'process', processRef, actorInvocationRef,
    { actorInvocationRef, processRef, diagnosticDigest: hash('spawn ENOENT') });
  if (terminal === 'unconfirmed') add('actor_process_termination_unconfirmed', 'process', processRef, actorInvocationRef, { actorInvocationRef, processRef });
  const finalOutput = '{"kind":"d5_fixture_output"}';
  // An admitted native result decides the current class of a confirmed exit;
  // L classifies the signalled exit; no other boundary succeeds.
  const failureClass = terminal !== 'exited' || (signalled && !current) ? 'transport_failure' : null;
  const disposition = failureClass === null ? 'success' : 'failure';
  const evidence = {
    cCallRef, evidenceClass: 'probabilistic_transport', ...ids, requestRef, requestDigest,
    rawOutputDigest: sha256Bytes(finalOutput), observedOutputDigest: hash(finalOutput), actorInvocationRef, processRef,
    ...bindingRefs, materializationPlanRef: 'materialization-plan://t287/carrier', rendererRef: 'renderer://t287/carrier',
    instructionContractRef: 'contract://t287/carrier/instruction', resultContractRef: 'contract://t287/carrier/result',
    transportDigest: hash('d5-transport'), transportLane: 'closed_prompt_proof', transportDisposition: disposition,
    transportFailureClass: failureClass, processStatus: status, processSignal: signal, timeoutClass: null,
    structuredEventCount: 0, progressEventCount: 0, toolCallCount: 0, apiRetryCount: 0, stdoutByteLength: 0, stderrByteLength: 0,
    artifactDigests: { output: sha256Bytes(finalOutput), stdout: sha256Bytes(''), stderr: sha256Bytes('') },
    ...(current ? { nativeResultAssessment: { disposition: 'admitted' } } : {}),
  };
  // The live physical values: a direct exit is observed unless no child was
  // established; termination is confirmed only for the exit terminal.
  const copies = { timedOut: false, exitObserved: terminal !== 'spawn_failed', terminationConfirmed: terminal === 'exited',
    signalSequence: signalled ? ['SIGTERM'] : [] };
  const { cCallRef: _c, evidenceClass: _e, rawOutputDigest: _r, transportDisposition: _d, transportFailureClass: _f,
    ...artifactBody } = evidence;
  // The writer's profile representation: L records the copies, current none.
  const artifactPayload = { cCallRef, ...artifactBody, finalOutput, disposition, failureClass, ...(current ? {} : copies), ...artifactOverrides };
  const artifact = add('actor_result_artifact_observed', 'actor_invocation', actorInvocationRef, cCallRef,
    Object.fromEntries(Object.entries(artifactPayload).filter(([key]) => !artifactOmit.includes(key))));
  const actorTerminal = terminal === 'unconfirmed' ? null : add(failureClass === null ? 'actor_invocation_closed' : 'actor_invocation_failed',
    'actor_invocation', actorInvocationRef, cCallRef,
    { cCallRef, actorInvocationRef, processRef, ...bindingRefs, disposition, failureClass, consumedArtifactEventRef: artifact.eventId },
    [artifact.eventId]);
  return { cCallRef, rows, processRef, artifact, actorTerminalEventRef: actorTerminal?.eventId ?? null, copies: deepFreeze(copies),
    prefix: prefixes.selectValidatedRuntimeEventPrefix(deepFreeze([...rows])),
    evidence: deepFreeze(evidence), withCopies: deepFreeze({ ...evidence, ...copies }) };
}

test('D5 cold evidence projection: current evidence and artifacts without copies read them from the owner lifecycle; partial, reinserted, crossed and L-without-copies refuse', () => {
  const P = events.ROOT_EVENT_CONTRACT_DIGEST, selection = { agentKey: 'claude', identity: null };
  const selected = (fixture, evidence) => projectAdmittedTransportEvidenceSelection(fixture.prefix, fixture.cCallRef, evidence);
  const lifecycle = (fixture, evidence) => projectAdmittedTransportEvidenceLifecycle(fixture.prefix, fixture.cCallRef, evidence);
  for (const signalled of [false, true]) {
    const label = signalled ? 'signalled' : 'ordinary';
    const current = evidenceProjectionFixture({ profile: P, signalled });
    assert.equal(holds(current.rows, 'actor_process_terminated', current.processRef), true);
    assert.deepEqual(RETIRED_COPIES.filter(key => Object.hasOwn(current.artifact.payload, key)), [], `${label}: the current artifact records no copy`);
    assert.deepEqual(selected(current, current.evidence), selection, `${label}: copy-free current evidence`);
    assert.deepEqual(selected(current, current.withCopies), selection, `${label}: live copies agreeing with the owner lifecycle`);
    assert.deepEqual(lifecycle(current, current.evidence), { actorTerminalEventRef: current.actorTerminalEventRef, ...current.copies },
      `${label}: the owner lifecycle values`);
    for (const key of RETIRED_COPIES)
      assert.equal(selected(current, { ...current.evidence, [key]: current.withCopies[key] }), null, `${label}: partial copy ${key} refuses`);
    assert.equal(selected(current, { ...current.withCopies, signalSequence: signalled ? [] : ['SIGTERM'] }), null,
      `${label}: a signal copy against the signal rows refuses`);
    // Direct exit and confirmed termination each meet their own owner fact.
    for (const key of ['exitObserved', 'terminationConfirmed'])
      assert.equal(selected(current, { ...current.withCopies, [key]: false }), null, `${label}: a live ${key} copy against the owner lifecycle refuses`);
    // A current artifact records no copy: a reinserted copy refuses even when it agrees.
    for (const key of RETIRED_COPIES) {
      const reinserted = evidenceProjectionFixture({ profile: P, signalled, artifactOverrides: { [key]: current.copies[key] } });
      assert.equal(selected(reinserted, reinserted.evidence), null, `${label}: a reinserted current artifact ${key} refuses`);
      assert.equal(selected(reinserted, reinserted.withCopies), null, `${label}: a reinserted current artifact ${key} refuses the live candidate`);
    }
    const legacy = evidenceProjectionFixture({ signalled });
    assert.deepEqual(RETIRED_COPIES.filter(key => Object.hasOwn(legacy.artifact.payload, key)), RETIRED_COPIES, `${label}: the L artifact keeps its copies`);
    assert.deepEqual(selected(legacy, legacy.withCopies), selection, `${label}: L evidence with its copies`);
    assert.equal(selected(legacy, legacy.evidence), null, `${label}: copy-free evidence over an L artifact refuses`);
    // An L artifact keeps its original agreement with its evidence copies.
    for (const [key, value] of [['timedOut', true], ['exitObserved', false], ['terminationConfirmed', false],
      ['signalSequence', signalled ? [] : ['SIGKILL']]]) {
      const crossed = evidenceProjectionFixture({ signalled, artifactOverrides: { [key]: value } });
      assert.equal(selected(crossed, crossed.withCopies), null, `${label}: L artifact ${key} against its evidence refuses`);
    }
    for (const key of RETIRED_COPIES) {
      const partial = evidenceProjectionFixture({ signalled, artifactOmit: [key] });
      assert.equal(selected(partial, partial.withCopies), null, `${label}: an L artifact missing ${key} refuses`);
    }
  }
  // A spawn failure records no direct exit and the fold confirms no termination.
  const spawnFailed = evidenceProjectionFixture({ profile: P, terminal: 'spawn_failed' });
  assert.equal(holds(spawnFailed.rows, 'actor_process_terminated', spawnFailed.processRef), false);
  assert.deepEqual(lifecycle(spawnFailed, spawnFailed.evidence), { actorTerminalEventRef: spawnFailed.actorTerminalEventRef,
    timedOut: false, exitObserved: false, terminationConfirmed: false, signalSequence: [] }, 'spawn failure: no direct exit, no confirmed termination');
  assert.deepEqual(selected(spawnFailed, spawnFailed.withCopies), selection, 'spawn failure: agreeing live copies');
  assert.equal(selected(spawnFailed, { ...spawnFailed.withCopies, exitObserved: true }), null, 'spawn failure: a direct-exit copy refuses');
  assert.equal(selected(spawnFailed, { ...spawnFailed.withCopies, terminationConfirmed: true }), null, 'spawn failure: a confirmed-termination copy refuses');
  // An observed exit with unresolved scope has no actor terminal, so it is
  // outside the admitted lifecycle domain: no values, no default.
  const unconfirmed = evidenceProjectionFixture({ profile: P, terminal: 'unconfirmed' });
  assert.equal(holds(unconfirmed.rows, 'actor_process_terminated', unconfirmed.processRef), false);
  assert.equal(unconfirmed.copies.exitObserved && !unconfirmed.copies.terminationConfirmed, true, 'the live premise: exit observed, termination unconfirmed');
  assert.equal(lifecycle(unconfirmed, unconfirmed.evidence), null, 'unconfirmed: copy-free evidence has no lifecycle values');
  assert.equal(lifecycle(unconfirmed, unconfirmed.withCopies), null, 'unconfirmed: live copies have no lifecycle values');
  assert.equal(selected(unconfirmed, unconfirmed.withCopies), null, 'unconfirmed: no configured selection');
});

// RC7 HS03 (design §10.10 E-D/E-E): the actual invokeActorProcessWithAssembly
// over a real W store, real event prefixes and the real runtime_liveness
// threshold relation. Premises replaced in the VM: the invocation admission
// (none), the workspace-binding admission (accepted) and the transport run,
// which captures the actual observer the actor passes and drives it: one
// pending qualifying window, one supervision wakeup, then one turn-boundary
// window referenced outside any transaction. The deciding store, prefix,
// flush, threshold and window staging owners are not replaced.
import * as hs03Liveness from '../../build/code/src/abg/runtime_liveness.js';
import { canonicalRecordDigest as hs03RecordDigest } from '../../build/code/src/shared/value/index.js';
import { appendFileSync as hs03Append, writeFileSync as hs03Write } from 'node:fs';

test('RC7 HS03 actor successor: a not_reached decision that commits the pending window returns its durable successor, and the actor admits its next window there', async t => {
  const scratch = await realpath(await mkdtemp(join(tmpdir(), 'abi5-hs03-actor-')));
  t.after(() => rm(scratch, { recursive: true, force: true }));
  const archiveRoot = join(scratch, 'workspace', '.abg', 'archives');
  await mkdir(archiveRoot, { recursive: true });
  const { store } = await acquireNewEmptyAppendSinkFixture(t, events.createNewEmptyAppendSink, 'abi5-hs03-actor-store-');
  assert.equal(events.selectHeldEventStoreDurablePrefix(store).storeIdentity.eventContractDigest, events.ROOT_EVENT_CONTRACT_DIGEST, 'a fresh store is W');
  const time = '2026-11-07T00:00:00.000Z', correlationId = 'correlation://rc7-hs03/actor';
  const admit = candidate => events.admitRuntimeEvent(store, { eventTime: time, correlationId, workflowVersion: '5.0.0', causationEventRefs: [], ...candidate });
  const atDurable = action => events.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(store, events.selectHeldEventStoreDurablePrefix(store), action);
  // The admitted scope the actor's liveness context authenticates.
  const rawInputValue = { kind: 'rc7_hs03_actor_input' };
  const basisBody = { basisClass: 'root', programRef: 'program://rc7-hs03/actor', graphFunctionRef: 'graph-function://rc7-hs03/actor',
    invocationRef: 'invocation://rc7-hs03/actor', rawInputValue, rawInputDigest: hs03RecordDigest(rawInputValue) };
  const basisDigest = hash(basisBody), basisRef = `execution-basis://abiogenesis/${basisDigest.slice(7)}`;
  atDurable(() => admit({ kind: 'basis_admitted', scopeClass: 'workspace', basisId: basisRef, aggregateType: 'workspace',
    aggregateId: 'workspace-binding://rc7-hs03/actor', parentAggregateId: basisBody.invocationRef, payload: { basisRef, basisDigest, ...basisBody } }));
  const runId = 'run://rc7-hs03/actor', graphCallId = 'graph-call://rc7-hs03/actor';
  const run = { scopeClass: 'run', basisId: basisRef, runId, graphFunctionRef: basisBody.graphFunctionRef };
  const graph = atDurable(() => admit({ ...run, graphCallId, kind: 'graph_call_opened', aggregateType: 'graph_call', aggregateId: graphCallId,
    parentAggregateId: runId, payload: { graphCallId, graphCallDigest: hash({ graphCallId }) } })).value;
  const frameBody = { frameLineageId: 'frame-lineage://rc7-hs03/actor', attempt: 1, parentFrameId: null, runId, graphCallId,
    executionBasisRef: basisRef, invocationRef: basisBody.invocationRef, admittedInputRef: 'input://rc7-hs03/actor', admittedInputDigest: hash(rawInputValue) };
  const frameDigest = hash(frameBody), frameId = `frame://abiogenesis/${frameDigest.slice(7)}`;
  const actorScope = { ...run, graphCallId, frameId };
  const frameOrigin = hs03Liveness.captureNativeFrameBoundary(store);
  const frameOpened = atDurable(() => {
    const event = admit({ ...actorScope, frameLineageId: frameBody.frameLineageId, kind: 'frame_opened', aggregateType: 'frame', aggregateId: frameId,
      parentAggregateId: graphCallId, causationEventRefs: [graph.eventId], payload: { frameId, frameDigest, ...frameBody } });
    hs03Liveness.observeNativeFrameLiveness(store, event, frameOrigin, frameOrigin);
    return event;
  }).value;
  hs03Liveness.retainNativeFrameClock(store, frameOpened, frameOrigin);
  const cCallRef = 'c-call://rc7-hs03/actor', implementationRef = 'implementation://rc7-hs03/actor',
    implementationBindingRef = 'implementation-binding://rc7-hs03/actor';
  const opened = atDurable(() => admit({ ...actorScope, kind: 'c_call_opened', aggregateType: 'c_call', aggregateId: cCallRef, parentAggregateId: frameId,
    payload: { cCallRef, cCallDigest: hash({ cCallRef }), callClass: 'leaf', attempt: 1, programLocusRef: 'locus://rc7-hs03/actor',
      taskOrdinal: null, vectorIndex: null, edgeRef: null } })).value;
  const fibre = atDurable(() => admit({ ...actorScope, kind: 'c_call_fibre_selected', aggregateType: 'c_call', aggregateId: cCallRef, parentAggregateId: frameId,
    causationEventRefs: [opened.eventId], payload: { cCallRef, callClass: 'leaf', armId: 'arm://rc7-hs03/actor', regime: 'F_P',
      implementationRef, implementationBindingRef } })).value;

  // The transport premise: the captured actual observer is driven in order.
  const DELTA = `${JSON.stringify({ type: 'stream_event', event: { type: 'content_block_delta' } })}\n`;
  const ASSISTANT = `${JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: 'a' }] } })}\n`;
  const sentinel = new Error('rc7 hs03 actor successor fixture stop');
  const observed = { flushed: 0, decision: null, beforeWakeup: null, afterWakeup: null, nextRow: null, nextPredecessor: null };
  const worker = await component('abg/worker_transport');
  const actor = await component('abg/actor_process', {
    './invocation_admission.js': { rehydrateInvocationAdmissionAtPrefix: () => null },
    './environment_admission.js': { hasAdmittedWorkspaceBinding: () => true },
    './worker_transport.js': {
      prepareWorkerTransport: input => worker.prepareWorkerTransport(input),
      runPreparedWorkerTransport: async (prepared, observer) => {
        assert.equal(typeof observer.classifyStdoutChunk, 'function', 'a W actor declares window mode');
        let pending = null;
        observer.bindStdoutWindow(() => {
          if (pending === null) return null;
          const taken = pending; pending = null; observed.flushed++;
          observer.onStdoutObserved(taken.text, taken.window);
          return () => { pending = taken; };
        });
        observer.onProcessStarted(4242);
        const first = observer.classifyStdoutChunk(DELTA);
        assert.deepEqual([first.progress, first.turnBoundary], [true, false], 'a content record is qualifying and completes no turn');
        hs03Write(prepared.paths.stdout, DELTA);
        pending = { text: DELTA, window: { archiveOffset: 0, byteLength: Buffer.byteLength(DELTA), firstCaptureElapsedMs: first.elapsedMs,
          lastCaptureElapsedMs: first.elapsedMs, lastQualifyingElapsedMs: first.elapsedMs, resultElapsedMs: null, closure: 'flush' } };
        observed.beforeWakeup = events.selectHeldEventStoreDurablePrefix(store);
        observed.decision = observer.onNativeSupervisionWakeup();
        observed.afterWakeup = events.selectHeldEventStoreDurablePrefix(store);
        // The next actual admission: a closed turn window outside any transaction,
        // which the actor admits at its own local successor.
        const second = observer.classifyStdoutChunk(ASSISTANT);
        hs03Append(prepared.paths.stdout, ASSISTANT);
        observed.nextPredecessor = events.selectHeldEventStoreDurablePrefix(store);
        observer.onStdoutObserved(ASSISTANT, { archiveOffset: Buffer.byteLength(DELTA), byteLength: Buffer.byteLength(ASSISTANT),
          firstCaptureElapsedMs: second.elapsedMs, lastCaptureElapsedMs: second.elapsedMs, lastQualifyingElapsedMs: second.elapsedMs,
          resultElapsedMs: null, closure: 'turn_boundary' });
        observed.nextRow = store.readAll().findLast(e => e.kind === 'actor_process_stdout_observed');
        throw sentinel;
      },
    },
  }, '\nexport { invokeActorProcessWithAssembly };');
  const request = { actorRef: 'actor://rc7-hs03/actor', workerBindingRef: 'worker-binding://rc7-hs03/actor', implementationRef,
    inputDigest: hash({ subject: 'rc7-hs03-actor' }), materializationPlanRef: 'materialization-plan://rc7-hs03/actor', rendererRef: 'renderer://rc7-hs03/actor',
    instructionContractRef: 'contract://rc7-hs03/actor/instruction', resultContractRef: 'contract://rc7-hs03/actor/result',
    transportLane: 'closed_prompt_proof', prompt: 'Return the fixed fixture payload.', responseJsonSchema: { type: 'object' } };
  const occurrence = { cCallRef, runId, graphCallId, frameId, programLocusRef: 'locus://rc7-hs03/actor', taskOrdinal: null, attempt: 1 };
  const workspaceBinding = { bindingId: 'workspace-binding://rc7-hs03/actor', bindingDigest: hash('rc7-hs03-binding'), roots: { archiveRoot } };
  // The stopped transport ends the actor through its ordinary failure carrier;
  // that outcome is not the subject here.
  await actor.invokeActorProcessWithAssembly({
    store, predecessorPrefix: events.selectHeldEventStoreDurablePrefix(store), scope: { runId, graphCallId, frameId }, occurrence, request, dispatchOrdinal: 1,
    executionBasis: { basisRef, workspaceBindingId: workspaceBinding.bindingId, workspaceBindingDigest: workspaceBinding.bindingDigest,
      invocationAdmissionRef: 'invocation-admission://rc7-hs03/actor', graphFunctionRef: basisBody.graphFunctionRef, graphRef: 'graph://rc7-hs03/actor' },
    cCall: { ...occurrence, implementationRef, outputContractRef: request.resultContractRef, implementationBindingRef, fibreSelectedEventRef: fibre.eventId },
    expectedInputDigest: request.inputDigest,
    workerContracts: { instructionContractRef: request.instructionContractRef, resultContractRef: request.resultContractRef },
    runtime: { workspaceBinding, artifactTruth: {} }, basis: { correlationId },
  }).catch(error => error);
  assert.notEqual(observed.nextRow, null, 'the driven observer reached the next admission');
  // The real threshold relation flushed the pending window once, committed it and decided not_reached.
  assert.equal(observed.flushed, 1, 'the wakeup drained the pending window exactly once');
  assert.equal(observed.decision?.admittedThresholdEventRef, null, 'no threshold was admitted');
  assert.equal(observed.decision?.timeoutClass, null);
  assert.notEqual(observed.afterWakeup.coordinateDigest, observed.beforeWakeup.coordinateDigest, 'the flush advanced the durable successor');
  const rows = store.readAll();
  const windows = rows.filter(e => e.kind === 'actor_process_stdout_observed');
  assert.equal(windows.length, 2, 'the flushed window and the next window');
  assert.deepEqual(windows.map(e => [e.payload.byteLength, e.payload.chunkDigest, e.payload.stdoutWindow.archiveOffset]),
    [[Buffer.byteLength(DELTA), hash(DELTA), 0], [Buffer.byteLength(ASSISTANT), hash(ASSISTANT), Buffer.byteLength(DELTA)]]);
  assert.equal(rows.some(e => e.kind === 'actor_process_timeout_observed'), false, 'not_reached admitted no timeout');
  // The decisive relation: the next admission's predecessor is the not_reached
  // successor; a stale local successor would refuse it.
  assert.deepEqual(observed.nextPredecessor, observed.afterWakeup, 'nothing else was admitted between the decision and the next window');
  assert.equal(observed.nextRow?.eventId, windows[1].eventId, 'the actor admitted its next window at the adopted successor');
  assert.equal(windows[1].admissionOrdinal > windows[0].admissionOrdinal, true);
});
