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

const holds = (rows, name, identity) => calculus.holdsAt(
  calculus.deriveRuntimeEventCalculusProjection(prefixes.selectValidatedRuntimeEventPrefix(deepFreeze([...rows]))),
  calculus.constructRuntimeFluent({ name, identity }));
const json = value => JSON.parse(JSON.stringify(value));
// Case b's error after launch: a stream error after the direct exit.
const afterExitStreamError = Object.assign(new Error('fixture stdout read failure after exit'), { code: 'EIO' });

// Legacy-profile rows: no eventContractDigest member, so the prefix carries no
// liveness binding, probes or native result assessment.
function recorder(label) {
  const rows = [];
  let ordinal = 0;
  const append = candidate => {
    ordinal += 1;
    const row = deepFreeze({ ...candidate, eventId: `event://t287/carrier/${label}/${ordinal}`,
      admissionOrdinal: ordinal, payloadDigest: hash(candidate.payload) });
    rows.push(row);
    return row;
  };
  return { rows, append };
}

const scope = { runId: 'run://t287/carrier', graphCallId: 'graph-call://t287/carrier', frameId: 'frame://t287/carrier' };
const common = { correlationId: 'correlation://t287/carrier', workflowVersion: '5.0.0', scopeClass: 'run',
  basisId: 'basis://t287/carrier', eventTime: time, ...scope };

async function driveActor(t, mode) {
  const scratch = await realpath(await mkdtemp(join(tmpdir(), `abi5-carrier-${mode}-`)));
  t.after(() => rm(scratch, { recursive: true, force: true }));
  const archiveRoot = join(scratch, 'workspace', '.abg', 'archives');
  await mkdir(archiveRoot, { recursive: true });
  const { rows, append } = recorder(mode);
  let currentPrefix = { storeIdentity: { eventContractDigest: events.LEGACY_ROOT_EVENT_CONTRACT_DIGEST },
    coordinateDigest: hash(`${mode}:0`) };
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
    'node:child_process': { spawn: () => child },
    '../shared/owned_process_lifetime.js': unknownGroupLifetime,
  });
  const cCallRef = `c-call://t287/carrier/${mode}`;
  const fibre = append({ ...common, kind: 'c_call_fibre_selected', aggregateType: 'c_call', aggregateId: cCallRef,
    parentAggregateId: scope.frameId, causationEventRefs: [], payload: { cCallRef } });
  const actor = await component('abg/actor_process', {
    './event_prefix.js': { readOwnedRuntimeEventPrefixAtDurablePrefix: () => null, selectRuntimeEventPrefixFromStore: () => null },
    './invocation_admission.js': { rehydrateInvocationAdmissionAtPrefix: () => null },
    './environment_admission.js': { hasAdmittedWorkspaceBinding: () => true },
    './event_store.js': { assertHeldEventStoreAtDurablePrefix: () => {}, admitRuntimeEvent: (_store, candidate) => append(candidate),
      admitNonEmptyRuntimeEventTransactionAtDurablePrefix: (_store, _prefix, action) => {
        const value = action();
        currentPrefix = { ...currentPrefix, coordinateDigest: hash(`${mode}:${rows.length}`) };
        return { value, successorPrefix: currentPrefix };
      } },
    './runtime_liveness.js': { captureNativeFrameBoundary: () => ({}), observeNativeFrameLiveness: () => {} },
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
  });
  return { rows, effect, finalFacts, transportError, plan };
}

test('worker no-child launch failure: spawn_failed admitted; the bound transport artifact carries processFacts', async t => {
  const { rows, effect, finalFacts, plan } = await driveActor(t, 'spawn_failed');
  assert.notEqual(finalFacts, null);
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
  assert.equal(observed[0].payload.terminationConfirmed, false);
  assert.equal(rows.some(row => row.kind === 'actor_invocation_failed'), true);
  assert.equal(effect.kind, 'actor_process_effect_receipt');
  // Derived state over the fold of L.
  const processRef = terminal.aggregateId;
  assert.equal(holds(rows, 'actor_process_spawn_failed', processRef), true);
  assert.equal(holds(rows, 'actor_process_terminated', processRef), false);
  assert.equal(holds(rows, 'actor_process_live', processRef), false);
  assert.equal(holds(rows, 'terminationConfirmed_copy_disagrees', processRef), false, 'the false copy agrees with the fold');
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

test('worker error after launch with unresolved cleanup: termination_unconfirmed admitted; the refusal carries processFacts; failCCall retains it', async t => {
  const { rows, effect, finalFacts, transportError } = await driveActor(t, 'unconfirmed');
  assert.notEqual(finalFacts, null);
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

  const real = await component('implementation/worksite_command_helper', {}, '\nexport { runCommand };', exposeRunCommand);
  const launched = await real.runCommand(task(join(scratch, 'absent-executable')), scratch, 0);
  assert.equal(launched.exitStatus, 127);
  assert.equal(launched.terminationConfirmed, true, 'a no-child launch failure has nothing to clean up');
  assert.equal(Buffer.from(launched.stderr.payload, 'base64').toString('utf8').includes('cleanup unresolved'), false);

  const unknown = await component('implementation/worksite_command_helper',
    { '../shared/owned_process_lifetime.js': unknownGroupLifetime }, '\nexport { runCommand };', exposeRunCommand);
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
    '\nexport { runCommand };', exposeRunCommand);
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
  assert.equal(holds(rows, 'actor_process_terminated', agreeing), true);
  assert.equal(holds(rows, 'actor_process_terminated', disagreeing), false);
  assert.equal(holds(rows, 'terminationConfirmed_copy_disagrees', disagreeing), true);
  assert.equal(holds(rows, 'terminationConfirmed_copy_disagrees', agreeing), false);
  assert.equal(holds(rows, 'terminationConfirmed_copy_disagrees', 'process://t287/carrier/transport'), true);
  assert.equal(holds(rows, 'terminationConfirmed_copy_disagrees', 'process://t287/carrier/other-class'), false,
    'only probabilistic_transport evidence carries the checked copy');
});
