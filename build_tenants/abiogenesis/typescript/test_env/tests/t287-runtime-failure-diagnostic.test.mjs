import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import ts from 'typescript';
import * as Cause from 'effect/Cause';
import * as Effect from 'effect/Effect';
import * as events from '../../build/code/src/abg/event_store.js';
import * as prefixes from '../../build/code/src/abg/event_prefix.js';
import * as calculus from '../../build/code/src/abg/event_calculus.js';
import { sha256Canonical as hash } from '../../build/code/src/shared/digests.js';
import { validateActorProcessCarrierPair } from '../../build/code/src/abg/actor_process.js';
import { deepFreeze } from '../../build/code/src/shared/immutable.js';
import { acquireNewEmptyAppendSinkFixture } from '../support/new-empty-append-sink.mjs';

const root = resolve(import.meta.dirname, '../..');
// In-memory source evaluation avoids modifying the shared compiler/generator
// output. Dependencies use the frozen built owners; lower admission premises
// are supplied explicitly below, not claimed as an installed lifecycle proof.
async function sourceOwner(relative, overrides = {}, expose = []) {
  const source = join(root, 'code/src', relative + '.ts');
  const built = join(root, 'build/code/src', relative + '.js');
  const code = ts.transpileModule(fs.readFileSync(source, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText + (expose.length ? '\nexport {' + expose.join(',') + '};' : '');
  const module = new SourceTextModule(code, { identifier: built });
  await module.link(async specifier => {
    const target = specifier.startsWith('.') ? pathToFileURL(resolve(dirname(built), specifier)).href : specifier;
    const values = { ...await import(target), ...overrides[specifier] };
    return new SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    });
  });
  await module.evaluate();
  return module.namespace;
}
const time = '2026-09-23T00:00:00.000Z';
const diagnostic = {
  definitionKey: { operationId: 'abg.operation.run.invoke', memberKey: 'start' },
  diagnosticClassRef: 'diagnostic://abiogenesis/hog/traversal-defect@5',
  stage: 'hog_traversal', code: 'defect', message: 'outer transition failed',
  cause: 'TypeError: outer transition failed\n  at transition.ts:10\nCaused by: TypeError: original retained input failure\n  at replay.ts:20',
};
function candidate(kind, payload, scope, extra = {}) {
  return { kind, payload, eventTime: time, aggregateType: 'frame', aggregateId: scope.frameId,
    parentAggregateId: scope.graphCallId, causationEventRefs: [], correlationId: 'correlation://diagnostic',
    workflowVersion: '5.0.0', scopeClass: 'run', basisId: scope.executionBasisRef,
    runId: scope.runId, graphCallId: scope.graphCallId, frameId: scope.frameId,
    frameLineageId: scope.frameLineageId, graphFunctionRef: 'graph-function://diagnostic',
    materializationRef: 'graph://diagnostic', ...extra };
}
async function fixture(t, withFrontier = true) {
  const acquired = await acquireNewEmptyAppendSinkFixture(t, events.createNewEmptyAppendSink, 'abi5-diagnostic-');
  const store = acquired.store;
  const scope = { runId: 'run://diagnostic', graphCallId: 'graph-call://diagnostic', frameId: 'frame://diagnostic',
    frameLineageId: 'lineage://diagnostic', executionBasisRef: 'basis://diagnostic' };
  const executionBasis = { basisRef: scope.executionBasisRef, graphFunctionRef: 'graph-function://diagnostic', graphRef: 'graph://diagnostic' };
  const run = events.admitRuntimeEvent(store, candidate('run_segment_opened', {
    executionBasisDigest: hash('basis'), executionBasisRef: scope.executionBasisRef,
    graphDigest: hash('graph'), graphFunctionRef: executionBasis.graphFunctionRef, graphRef: executionBasis.graphRef,
    invocationAdmissionRef: 'invocation-admission://diagnostic', invocationRef: 'invocation://diagnostic',
    programRef: 'program://diagnostic', runDigest: hash('run'), runId: scope.runId, workspaceBindingId: 'binding://diagnostic',
  }, scope, { aggregateType: 'run', aggregateId: scope.runId, parentAggregateId: null }));
  const opened = events.admitRuntimeEvent(store, candidate('frame_opened', {
    frameId: scope.frameId, frameDigest: hash('frame'), frameLineageId: scope.frameLineageId, attempt: 1, parentFrameId: null,
  }, scope, { causationEventRefs: [run.eventId] }));
  scope.frameOpenEventRef = opened.eventId;
  const frontier = withFrontier ? events.admitRuntimeEvent(store, candidate('c_call_judged', {
    cCallRef: 'c-call://diagnostic/c2', judgmentRef: 'judgment://diagnostic/c2', judgmentDigest: hash('judgment'),
    resultRef: 'result://diagnostic/c2', judgment: 'advance', retryAttemptRef: null,
  }, scope, { aggregateType: 'c_call', aggregateId: 'c-call://diagnostic/c2', parentAggregateId: scope.frameId,
    causationEventRefs: [opened.eventId] })) : opened;
  events.admitRuntimeEvent(store, candidate('actor_process_stdout_observed', {
    actorInvocationRef: 'actor://diagnostic', processRef: 'process://diagnostic', streamOrdinal: 0, chunkDigest: hash('telemetry'),
  }, scope, { aggregateType: 'process', aggregateId: 'process://diagnostic', parentAggregateId: 'actor://diagnostic' }));
  // A later material event in another frame and a later workspace event do not
  // become this scope's failing frontier merely because they were admitted last.
  events.admitRuntimeEvent(store, candidate('traversal_cursor_entered', {
    cursorRef: 'cursor://other', cursorDigest: hash('other'),
  }, { ...scope, frameId: 'frame://other' }));
  events.admitRuntimeEvent(store, { kind: 'public_operation_admitted', eventTime: time, aggregateType: 'workspace',
    aggregateId: 'workspace://other', parentAggregateId: null, causationEventRefs: [], correlationId: 'other',
    workflowVersion: '5.0.0', scopeClass: 'workspace', basisId: 'basis://other',
    payload: { operationId: 'abg.operation.project.read', invocationRef: 'invocation://other', invocationDigest: hash('other'), variant: 'read' } });
  const owner = await sourceOwner('abg/runtime_failure', {
    './execution_basis.js': { hasAdmittedExecutionBasisAtPrefix: (_p, basis) => basis === executionBasis },
    './open_call.js': { hasOpenedTraversalScopeAtPrefix: (_p, value) => value === scope },
    // This component proof does not synthesize a complete GTL/CCall replay.
    './replay.js': { replayValidatedRuntimeEventPrefix: prefix => ({ runtimeStatus: 'failed',
      runtimeFailureEventRef: prefixes.indexedRuntimeEvents(prefix, 'kind:runtime_failure_observed')[0]?.eventId }) },
  });
  const input = () => ({ store, predecessorPrefix: events.selectHeldEventStoreDurablePrefix(store), executionBasis,
    scope, stage: 'hog_traversal', subject: diagnostic, diagnosticRef: owner.constructRuntimeFailureDiagnosticRef(diagnostic),
    basis: { eventTime: time, correlationId: 'correlation://diagnostic/failure', causationEventRefs: [] } });
  return { store, scope, owner, frontier, opened, input };
}

test('caught diagnostic survives owner admission, JSON-cloned cold read, and Public evidence projection', async t => {
  const f = await fixture(t);
  const failure = f.owner.admitRuntimeFailure(f.input());
  const admitted = f.store.readAll().at(-1);
  assert.equal(admitted.kind, 'runtime_failure_observed');
  assert.equal(admitted.eventContractDigest, events.ROOT_EVENT_CONTRACT_DIGEST);
  assert.deepEqual(admitted.causationEventRefs, [f.frontier.eventId]);
  assert.notEqual(admitted.causationEventRefs[0], f.opened.eventId);
  assert.equal(admitted.payload.subjectDigest, hash(diagnostic));
  const handoff = f.store.projectReopenAuthorityAndClose();
  const coordinate = JSON.parse(JSON.stringify(handoff.prefix));
  const rows = events.readRuntimeEventsAtDurablePrefix(coordinate);
  const prefix = prefixes.selectValidatedRuntimeEventPrefix(rows, { runId: f.scope.runId });
  const evidence = f.owner.projectRuntimeFailureEvidenceAtPrefix(prefix);
  assert.equal(evidence[0].availability, 'retained');
  assert.deepEqual(evidence[0].subject, diagnostic);
  assert.equal(evidence[0].failureRef, failure.admission.failureRef);
  assert.deepEqual(evidence[0].causationEventRefs, [f.frontier.eventId]);
  assert.equal(calculus.holdsAt(calculus.deriveRuntimeEventCalculusProjection(prefix), calculus.constructRunActiveFluent(f.scope.runId)), false);
  const adapter = await sourceOwner('abg/project_read_definition_bindings', {}, ['evidenceProjection']);
  const projected = adapter.evidenceProjection('run_evidence', { source: { sourceRef: f.scope.runId, sourceDigest: hash('run') } }, {
    replayRef: 'replay://diagnostic', replayDigest: hash('replay'), evidenceRefs: [], eventAtoms: [], runtimeFailures: evidence,
  });
  assert.equal(projected.evidence.length, 1);
  const coordinateEvidence = projected.evidence[0];
  const decoded = JSON.parse(decodeURIComponent(coordinateEvidence.ref.split(',').slice(1).join(',')));
  assert.deepEqual(decoded, evidence[0]);
  assert.equal(coordinateEvidence.digest, hash(decoded));
  const coldCode = `import fs from 'node:fs'; import {dirname,join,resolve} from 'node:path'; import {pathToFileURL} from 'node:url';
    import {SourceTextModule,SyntheticModule} from 'node:vm'; import ts from 'typescript';
    const root=process.argv[1]; ${sourceOwner.toString()}
    const events=await import(pathToFileURL(join(root,'build/code/src/abg/event_store.js')));
    const prefixes=await import(pathToFileURL(join(root,'build/code/src/abg/event_prefix.js')));
    const owner=await sourceOwner('abg/runtime_failure');
    const rows=events.readRuntimeEventsAtDurablePrefix(JSON.parse(process.argv[2]));
    process.stdout.write(JSON.stringify(owner.projectRuntimeFailureEvidenceAtPrefix(prefixes.selectValidatedRuntimeEventPrefix(rows,{runId:process.argv[3]}))));`;
  const cold = execFileSync(process.execPath, ['--experimental-vm-modules', '--input-type=module', '-e', coldCode,
    root, JSON.stringify(coordinate), f.scope.runId], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  assert.deepEqual(JSON.parse(cold), evidence, 'fresh process recovers original details without process memory');
});

test('digest-only history is explicit not_retained; first failure cannot be overwritten', async t => {
  const f = await fixture(t);
  const input = { ...f.input(), diagnosticRef: diagnostic.diagnosticClassRef };
  const failure = f.owner.admitRuntimeFailure(input);
  const before = fs.readFileSync(new URL(failure.successorPrefix.eventLogRef));
  assert.throws(() => f.owner.admitRuntimeFailure({ ...f.input(), subject: { message: 'cleanup failed' } }), /active admitted traversal scope/);
  assert.deepEqual(fs.readFileSync(new URL(failure.successorPrefix.eventLogRef)), before);
  const evidence = f.owner.projectRuntimeFailureEvidenceAtPrefix(prefixes.selectValidatedRuntimeEventPrefix(f.store.readAll()));
  assert.equal(evidence[0].availability, 'not_retained');
  assert.equal(evidence[0].subject, null);
  assert.equal(evidence[0].subjectDigest, hash(diagnostic));
  assert.equal(evidence[0].diagnosticClassRef, diagnostic.diagnosticClassRef);
});

test('explicit causation remains exact and an absent material frontier falls back to the admitted frame open', async t => {
  for (const withFrontier of [true, false]) {
    const f = await fixture(t, withFrontier);
    const input = f.input();
    const causationEventRefs = withFrontier ? [f.opened.eventId] : [];
    f.owner.admitRuntimeFailure({ ...input, basis: { ...input.basis, causationEventRefs } });
    assert.deepEqual(f.store.readAll().at(-1).causationEventRefs, [f.opened.eventId]);
  }
});

test('malformed or substituted retained body refuses before append; cold projection rejects altered failure binding', async t => {
  const f = await fixture(t);
  const before = f.store.readAll().length;
  for (const diagnosticRef of ['data:application/json;charset=utf-8,%', f.owner.constructRuntimeFailureDiagnosticRef({ message: 'replacement' })]) {
    assert.throws(() => f.owner.admitRuntimeFailure({ ...f.input(), diagnosticRef }));
    assert.equal(f.store.readAll().length, before);
  }
  f.owner.admitRuntimeFailure(f.input());
  const rows = f.store.readAll();
  const first = rows.at(-1);
  for (const change of [{ subjectDigest: hash('wrong') }, { failureDigest: hash('wrong') }, { frameId: 'frame://wrong' },
    { diagnosticRef: 'data:application/json;charset=utf-8,%' }]) {
    const copy = rows.slice(0, -1);
    const { eventId, admissionOrdinal, payloadDigest, eventContractDigest, ...original } = first;
    assert.throws(() => {
      copy.push(events.projectRuntimeEventFromValidatedHistory(copy, { ...original, payload: { ...original.payload, ...change } }));
      f.owner.projectRuntimeFailureEvidenceAtPrefix(prefixes.selectValidatedRuntimeEventPrefix(copy));
    });
  }
});

test('typed sync and async faults conserve original Error cause and stack', async () => {
  const failureOwner = await sourceOwner('abg/runtime_failure');
  const owner = await sourceOwner('owner_bindings/run_invocation', {
    '../abg/runtime_failure.js': failureOwner,
  }, ['syncStage', 'asyncStage', 'causeDiagnostic']);
  const original = new TypeError('original retained input failure');
  const outer = new TypeError('outer transition failed', { cause: original });
  const call = { invocation: { definitionKey: diagnostic.definitionKey } };
  assert.match(owner.causeDiagnostic(Cause.die(outer)), /original retained input failure/);
  for (const operation of [owner.syncStage(call, 'leaf_port', () => { throw outer; }),
    owner.asyncStage(call, 'leaf_port', async () => { throw outer; })]) {
    const exit = await Effect.runPromiseExit(operation);
    const fault = Cause.failureOption(exit.cause).value;
    assert.equal(fault.message, outer.message);
    assert.match(fault.evidence.cause, /outer transition failed/);
    assert.match(fault.evidence.cause, /original retained input failure/);
    assert.match(fault.evidence.cause, /t287-runtime-failure-diagnostic.test.mjs/);
  }
});

test('historical route projection stays nullable while staged projection conserves its replay cause', async t => {
  const f = await fixture(t);
  const original = new TypeError('original retained input provenance failure');
  const owner = await sourceOwner('abg/traversal_route', {
    './replay.js': { projectValidatedReplayRouteAtPrefix: () => { throw original; } },
  }, ['projectHistoricalTraversalRoute']);
  const row = events.admitRuntimeEvent(f.store, candidate('traversal_route_admitted', {
    routeRef: 'route://diagnostic', routeDigest: hash('route'), routeKind: 'advance',
    sourceCursorRef: 'cursor://source', sourceCursorDigest: hash('source'),
  }, f.scope));
  const prefix = prefixes.selectValidatedRuntimeEventPrefix(f.store.readAll());
  assert.equal(owner.projectHistoricalTraversalRouteAtPrefix(prefix, row.eventId, prefix), null);
  assert.throws(() => owner.projectHistoricalTraversalRoute(prefix, row.eventId, prefix, true), error => error === original);
});

// The actual deterministic boundary is called with finite caller callbacks.
// These are not an installed authority/implementation or native Testing proof.
function deterministicBoundaryInput(overrides = {}) {
  const value = { kind: 'diagnostic_input', privateBody: 'input-body-not-diagnostic' };
  return {
    resolution: { computeRegime: 'F_D', implementationRef: 'implementation://diagnostic/deterministic',
      inputContractRef: 'contract://diagnostic/input', outputContractRef: 'contract://diagnostic/output',
      modulePath: 'controlled-fixture-module', namedSymbol: 'controlledDeterministic' },
    value, inputDigest: hash(value), failureValueKind: 'diagnostic_failure', verifyAuthority: () => true,
    validateSuccess: value => value.kind === 'diagnostic_success', resolveWorkerContracts: () => null,
    occurrence: { executionAuthority: null, cCallRef: 'c-call://diagnostic/deterministic', runId: 'run://diagnostic',
      graphCallId: 'graph-call://diagnostic', frameId: 'frame://diagnostic', programLocusRef: 'node://diagnostic', taskOrdinal: null, attempt: 1 },
    loadImplementation: async () => () => null, ...overrides,
  };
}
function deterministicSubject(owner, failureOwner, closed, input, stage, reason) {
  assert.equal(closed.computeRegime, 'F_D');assert.equal(closed.kind, 'closed_leaf_owner_receipt');
  assert.equal(closed.receipt, null);assert.equal(closed.workerContracts, null);
  assert.equal(Object.hasOwn(closed, 'ownerObservation'), false);assert.equal(Object.hasOwn(closed, 'effectDisposition'), false);
  const candidate = closed.candidate;
  assert.equal(candidate.disposition, 'failure');assert.equal(candidate.resultCandidate.failureClass, 'implementation_exception');
  assert.deepEqual(Object.keys(candidate.resultCandidate).sort(), ['diagnosticRef', 'failureClass', 'kind', 'schemaVersion']);
  assert.equal(candidate.resultCandidate.diagnosticRef, candidate.diagnosticRef);
  assert.equal(owner.isLeafRealizationCandidate(candidate, 'F_D', () => false, input.failureValueKind), true);
  assert.deepEqual(candidate.evidenceCandidates, [{ kind: 'deterministic_evidence_candidate', schemaVersion: '5.0.0',
    implementationRef: input.resolution.implementationRef, inputDigest: input.inputDigest, outputDigest: hash(candidate.resultCandidate) }]);
  const subject = failureOwner.readRuntimeFailureDiagnosticSubject(candidate.diagnosticRef);
  assert.equal(subject.diagnosticClassRef, 'diagnostic://abiogenesis/implementation/implementation-exception@5');
  assert.equal(subject.computeRegime, 'F_D');assert.equal(subject.implementationRef, input.resolution.implementationRef);
  assert.equal(subject.inputDigest, input.inputDigest);assert.equal(subject.stage, stage);assert.equal(subject.reason, reason);
  assert.equal(candidate.diagnosticRef, failureOwner.constructRuntimeFailureDiagnosticRef(subject));
  assert.equal(JSON.stringify(subject).includes(input.value.privateBody), false);
  assert.equal(Object.hasOwn(subject.cause, 'stack'), false);
  return subject;
}

test('deterministic boundary retains authority, loading, export and invocation first causes with exact evidence', async () => {
  const owner = await sourceOwner('implementation/leaf_invocation_port', {}, ['isLeafRealizationCandidate']), failureOwner = await sourceOwner('abg/runtime_failure');
  const errors = [new TypeError('authority rejected the current input'), Object.assign(new Error('declared implementation unavailable'), { code: 'ERR_MODULE_NOT_FOUND' }),
    new RangeError('deterministic invocation failed'), new SyntaxError('async deterministic invocation failed')];
  const cases = [
    { stage: 'authority_verification', reason: 'refused', verify: () => false, loads: 0, calls: 0, error: null },
    { stage: 'authority_verification', reason: 'thrown', verify: () => { throw errors[0]; }, loads: 0, calls: 0, error: errors[0] },
    { stage: 'implementation_load', reason: 'thrown', load: () => { throw errors[1]; }, loads: 1, calls: 0, error: errors[1] },
    { stage: 'implementation_load', reason: 'missing_export', load: () => ({ missing: true }), loads: 1, calls: 0, error: null },
    { stage: 'implementation_invocation', reason: 'thrown', invoke: () => { throw errors[2]; }, loads: 1, calls: 1, error: errors[2] },
    { stage: 'implementation_invocation', reason: 'thrown', invoke: async () => { throw errors[3]; }, loads: 1, calls: 1, error: errors[3] },
  ];
  const refs = [];
  for (const c of cases) {
    let loads = 0, calls = 0;
    const input = deterministicBoundaryInput({ verifyAuthority: c.verify ?? (() => true), loadImplementation: async () => {
      loads++;if (c.load) return c.load();return (...args) => { calls++;return c.invoke?.(...args); };
    } });
    const closed = await owner.invokeLeafOwnerBoundary(input), subject = deterministicSubject(owner, failureOwner, closed, input, c.stage, c.reason);
    assert.equal(loads, c.loads);assert.equal(calls, c.calls);
    assert.equal(subject.cause.message, c.error?.message ?? null);assert.equal(subject.cause.messageTruncated, false);
    if (c.error) assert.equal(subject.cause.errorClass, c.error.constructor.name);
    else assert.deepEqual(subject.cause, { errorClass: null, errorCode: null, message: null, messageTruncated: false });
    if (c.stage === 'implementation_load' && c.reason === 'thrown') assert.equal(subject.cause.errorCode, 'ERR_MODULE_NOT_FOUND');
    refs.push(closed.candidate.diagnosticRef);
  }
  assert.equal(new Set(refs).size, cases.length);
});

test('deterministic caught-cause retention never evaluates arbitrary getters or proxies and bounds native messages', async () => {
  const owner = await sourceOwner('implementation/leaf_invocation_port', {}, ['isLeafRealizationCandidate']), failureOwner = await sourceOwner('abg/runtime_failure');
  let reads = 0;
  const accessor = new TypeError();
  for (const name of ['message', 'stack']) Object.defineProperty(accessor, name, { get() { reads++;throw new Error('must not read ' + name); } });
  const unknown = { get message() { reads++;return 'must not capture'; }, get code() { reads++;return 'ENOENT'; } };
  const proxy = new Proxy({}, { get() { reads++;throw new Error('proxy get'); }, getPrototypeOf() { reads++;throw new Error('proxy prototype'); },
    getOwnPropertyDescriptor() { reads++;throw new Error('proxy descriptor'); } });
  for (const error of [accessor, unknown, proxy]) {
    const input = deterministicBoundaryInput({ loadImplementation: async () => () => { throw error; } });
    const subject = deterministicSubject(owner, failureOwner, await owner.invokeLeafOwnerBoundary(input), input, 'implementation_invocation', 'thrown');
    assert.equal(subject.cause.message, null);assert.equal(subject.cause.messageTruncated, false);assert.equal(reads, 0);
  }
  const long = new TypeError('x'.repeat(9000)), input = deterministicBoundaryInput({ loadImplementation: async () => () => { throw long; } });
  const subject = deterministicSubject(owner, failureOwner, await owner.invokeLeafOwnerBoundary(input), input, 'implementation_invocation', 'thrown');
  assert.equal(subject.cause.message, 'x'.repeat(8192));assert.equal(subject.cause.messageTruncated, true);
});

test('deterministic retained cause survives actual failure admission and cold/Public projection; tampering refuses', async t => {
  const owner = await sourceOwner('implementation/leaf_invocation_port', {}, ['isLeafRealizationCandidate']), failureOwner = await sourceOwner('abg/runtime_failure');
  const input = deterministicBoundaryInput({ loadImplementation: async () => () => { throw new TypeError('selected deterministic cause'); } });
  const closed = await owner.invokeLeafOwnerBoundary(input), subject = deterministicSubject(owner, failureOwner, closed, input, 'implementation_invocation', 'thrown');
  const f = await fixture(t), admittedInput = { ...f.input(), subject, diagnosticRef: closed.candidate.diagnosticRef };
  const count = f.store.readAll().length;
  assert.throws(() => f.owner.admitRuntimeFailure({ ...admittedInput, subject: { ...subject, reason: 'refused' } }), /retained subject digest/);
  assert.equal(f.store.readAll().length, count);
  const admitted = f.owner.admitRuntimeFailure(admittedInput), handoff = f.store.projectReopenAuthorityAndClose();
  const cold = prefixes.selectValidatedRuntimeEventPrefix(events.readRuntimeEventsAtDurablePrefix(JSON.parse(JSON.stringify(handoff.prefix))), { runId: f.scope.runId });
  const evidence = failureOwner.projectRuntimeFailureEvidenceAtPrefix(cold);
  assert.equal(evidence[0].availability, 'retained');assert.deepEqual(evidence[0].subject, subject);
  assert.equal(evidence[0].subjectDigest, hash(subject));assert.equal(evidence[0].failureRef, admitted.admission.failureRef);
  const adapter = await sourceOwner('abg/project_read_definition_bindings', {}, ['evidenceProjection']);
  const projected = adapter.evidenceProjection('run_evidence', { source: { sourceRef: f.scope.runId, sourceDigest: hash('run') } }, {
    replayRef: 'replay://diagnostic', replayDigest: hash('replay'), evidenceRefs: [], eventAtoms: [], runtimeFailures: evidence,
  });
  const decoded = JSON.parse(decodeURIComponent(projected.evidence[0].ref.split(',').slice(1).join(',')));
  assert.deepEqual(decoded.subject, subject);assert.equal(projected.evidence[0].digest, hash(decoded));
  t.diagnostic('Controlled basis/frame/replay premises; actual F_D boundary, durable failure admission and cold/Public diagnostic projection. No installed Testing/effect/currentness credit.');
});

test('normal nullable Testing diagnostic agrees with its evidence and survives admitted cold/Public failure readback', async t => {
  const library=await sourceOwner('implementation/default_library'),failureOwner=await sourceOwner('abg/runtime_failure');
  const value={taskRef:'task://missing-testing-basis'},occurrence={cCallRef:'c-call://missing-testing-basis',runId:'run://diagnostic',graphCallId:'graph-call://diagnostic',frameId:'frame://diagnostic',programLocusRef:'locus://prepare-testing',taskOrdinal:null,attempt:1};
  const candidate=await library.prepareObservedTestingTask(value,occurrence),subject=failureOwner.readRuntimeFailureDiagnosticSubject(candidate.diagnosticRef);
  assert.equal(candidate.disposition,'failure');assert.equal(candidate.resultCandidate.kind,'governance_failure');
  assert.equal(candidate.resultCandidate.diagnosticRef,candidate.diagnosticRef);
  assert.equal(candidate.evidenceCandidates[0].outputDigest,hash(candidate.resultCandidate));
  assert.equal(candidate.evidenceCandidates[0].inputDigest,hash(value));
  assert.equal(subject.stage,'testing_basis');assert.equal(subject.relation,'assembly_basis_absent');
  assert.equal(subject.inputDigest,hash(value));assert.equal(subject.occurrence.cCallRef,occurrence.cCallRef);
  const f=await fixture(t),admittedInput={...f.input(),subject,diagnosticRef:candidate.diagnosticRef},count=f.store.readAll().length;
  assert.throws(()=>f.owner.admitRuntimeFailure({...admittedInput,subject:{...subject,relation:'assembly_authentication'}}),/retained subject digest/);
  assert.equal(f.store.readAll().length,count);
  const admitted=f.owner.admitRuntimeFailure(admittedInput),handoff=f.store.projectReopenAuthorityAndClose();
  const cold=prefixes.selectValidatedRuntimeEventPrefix(events.readRuntimeEventsAtDurablePrefix(JSON.parse(JSON.stringify(handoff.prefix))),{runId:f.scope.runId});
  const evidence=failureOwner.projectRuntimeFailureEvidenceAtPrefix(cold);
  assert.equal(evidence[0].availability,'retained');assert.deepEqual(evidence[0].subject,subject);assert.equal(evidence[0].subjectDigest,hash(subject));
  assert.equal(evidence[0].failureRef,admitted.admission.failureRef);
  const adapter=await sourceOwner('abg/project_read_definition_bindings',{},['evidenceProjection']);
  const projected=adapter.evidenceProjection('run_evidence',{source:{sourceRef:f.scope.runId,sourceDigest:hash('run')}},{replayRef:'replay://diagnostic',replayDigest:hash('replay'),evidenceRefs:[],eventAtoms:[],runtimeFailures:evidence});
  const decoded=JSON.parse(decodeURIComponent(projected.evidence[0].ref.split(',').slice(1).join(',')));
  assert.deepEqual(decoded.subject,subject);assert.equal(projected.evidence[0].digest,hash(decoded));
  t.diagnostic('Actual normal governance-failure diagnostic, evidence digest, durable failure admission and cold/Public readback; controlled basis/frame/replay lower premises. No installed Testing/functional-first-cause or no-effects claim.');
});

test('successful deterministic returns and legacy opaque failure totalization remain unchanged', async () => {
  const owner = await sourceOwner('implementation/leaf_invocation_port', {}, ['isLeafRealizationCandidate']), failureOwner = await sourceOwner('abg/runtime_failure');
  const input = deterministicBoundaryInput(), resultCandidate = { kind: 'diagnostic_success', schemaVersion: '5.0.0', answer: 42 };
  const success = { kind: 'leaf_realization_candidate', schemaVersion: '5.0.0', disposition: 'success', resultCandidate,
    evidenceCandidates: [{ kind: 'deterministic_evidence_candidate', schemaVersion: '5.0.0', implementationRef: input.resolution.implementationRef,
      inputDigest: input.inputDigest, outputDigest: hash(resultCandidate) }] };
  const good = await owner.invokeLeafOwnerBoundary({ ...input, loadImplementation: async () => () => success });
  assert.deepEqual(good.candidate, success);assert.deepEqual(good.receipt.candidate, success);assert.equal(good.receipt.computeRegime, 'F_D');
  const legacy = owner.totalizeLeafImplementationFailure({ resolution: input.resolution, inputDigest: input.inputDigest,
    failureValueKind: input.failureValueKind, failureClass: 'implementation_exception' });
  assert.equal(failureOwner.readRuntimeFailureDiagnosticSubject(legacy.diagnosticRef), null);
  const old = await owner.invokeLeafOwnerBoundary({ ...input, loadImplementation: async () => () => legacy });
  assert.deepEqual(old.candidate, legacy);assert.ok(old.receipt);
  const malformed = await owner.invokeLeafOwnerBoundary({ ...input, loadImplementation: async () => () => null });
  assert.equal(malformed.candidate.resultCandidate.failureClass, 'malformed_return');assert.ok(malformed.receipt);
  // C-3 (O-1): the malformed return carries its cause inline, as the F_D failures above do.
  assert.deepEqual(failureOwner.readRuntimeFailureDiagnosticSubject(malformed.candidate.diagnosticRef).cause,
    { at: '', atTruncated: false, reason: 'the admitted output is not an F_D leaf realization candidate' });
});

// TD-17. The actual F_P owner boundary after its effect: the prepared completion
// throws, or returns a Promise that rejects. The exchange is the actual validated
// carrier pair. Admission and cold/Public readback are the deterministic case's:
// the fixture's controlled basis/frame/replay premises, not the installed C-call
// result route (c_call_result_admitted).
async function probabilisticCompletionFailure(complete, failureClass = 'implementation_exception', overrides = {}) {
  const owner = await sourceOwner('implementation/leaf_invocation_port', overrides, ['isLeafRealizationCandidate']);
  const value = deepFreeze({ kind: 'diagnostic_input', privateBody: 'input-body-not-diagnostic' }), inputDigest = hash(value);
  const resolution = deepFreeze({ computeRegime: 'F_P', implementationRef: 'implementation://diagnostic/probabilistic@5',
    inputContractRef: 'contract://diagnostic/input@5', outputContractRef: 'contract://diagnostic/output@5',
    modulePath: 'controlled-fixture-module', namedSymbol: 'controlledProbabilistic' });
  const workerContracts = deepFreeze({ instructionContractRef: 'contract://diagnostic/instruction@5', resultContractRef: 'contract://diagnostic/raw-result@5' });
  const prompt = 'Return one diagnostic result.', rawOutput = JSON.stringify({ kind: 'raw_output', schemaVersion: '5.0.0' });
  const bytes = text => `sha256:${createHash('sha256').update(text).digest('hex')}`, digest = `sha256:${'a'.repeat(64)}`;
  const request = deepFreeze({ actorRef: 'actor://diagnostic/probabilistic@5', workerBindingRef: 'worker-binding://diagnostic/probabilistic@5',
    implementationRef: resolution.implementationRef, inputDigest, materializationPlanRef: 'materialization-plan://diagnostic/probabilistic@5',
    rendererRef: 'renderer://diagnostic/probabilistic@5', ...workerContracts, transportLane: 'closed_prompt_proof', prompt, responseJsonSchema: {} });
  const { transportLane, prompt: _prompt, responseJsonSchema: _schema, ...requested } = request;
  const exchange = validateActorProcessCarrierPair(request, { ...requested, transportLane,
    actorInvocationRef: 'actor-invocation://diagnostic/probabilistic/1', processRef: 'process://diagnostic/probabilistic/1',
    transportBindingRef: 'transport-binding://diagnostic/probabilistic/1', transportBindingDigest: digest,
    observedOutputDigest: hash(JSON.parse(rawOutput)), promptDigest: hash(prompt), transportDigest: digest,
    disposition: 'success', failureClass: null, finalOutput: rawOutput, processStatus: 0, processSignal: null, timeoutClass: null,
    timedOut: false, exitObserved: true, terminationConfirmed: true, signalSequence: [], structuredEventCount: 1, progressEventCount: 0,
    toolCallCount: 0, toolInvocations: [], apiRetryCount: 0, stdoutByteLength: 0, stderrByteLength: 0,
    artifactDigests: { output: bytes(rawOutput), prompt: bytes(prompt), stderr: bytes(''), stdout: bytes(''), transport: digest } });
  assert.equal(exchange.kind, 'actor_process_carrier_validation');
  const input = { resolution, value, inputDigest, failureValueKind: 'diagnostic_failure', verifyAuthority: () => true,
    validateSuccess: () => false, resolveWorkerContracts: () => workerContracts,
    occurrence: deepFreeze({ executionAuthority: null, cCallRef: 'c-call://diagnostic/probabilistic', runId: 'run://diagnostic',
      graphCallId: 'graph-call://diagnostic', frameId: 'frame://diagnostic', programLocusRef: 'node://diagnostic', taskOrdinal: null, attempt: 1 }),
    loadImplementation: async () => () => deepFreeze({ kind: 'prepared_probabilistic_leaf_invocation', schemaVersion: '5.0.0', workerRequest: request, complete }) };
  const prepared = await owner.invokeLeafOwnerBoundary(input);
  assert.equal(prepared.kind, 'prepared_probabilistic_leaf_owner_invocation');
  const closed = await prepared.complete(exchange);
  assert.equal(closed.kind, 'closed_leaf_owner_receipt');assert.equal(closed.computeRegime, 'F_P');
  assert.equal(closed.effectDisposition, 'completed');assert.equal(Object.hasOwn(closed, 'ownerObservation'), false);
  assert.deepEqual(closed.workerContracts, workerContracts);assert.equal(closed.receipt.computeRegime, 'F_P');
  assert.equal(closed.receipt.candidate, closed.candidate);assert.equal(closed.receipt.actorProcessExchange, exchange);
  const candidate = closed.candidate;
  assert.equal(candidate.disposition, 'failure');assert.deepEqual(candidate.evidenceCandidates, []);
  assert.deepEqual(Object.keys(candidate.resultCandidate).sort(), ['diagnosticRef', 'failureClass', 'kind', 'schemaVersion']);
  assert.equal(candidate.resultCandidate.failureClass, failureClass);
  assert.equal(candidate.resultCandidate.diagnosticRef, candidate.diagnosticRef);
  assert.equal(owner.isLeafRealizationCandidate(candidate, 'F_P', () => false, input.failureValueKind), true);
  return { input, candidate };
}
async function probabilisticCompletionCauseSurvivesAdmission(t, reason, error, complete) {
  const { input, candidate } = await probabilisticCompletionFailure(complete);
  const expected = { diagnosticClassRef: 'diagnostic://abiogenesis/implementation/implementation-exception@5', computeRegime: 'F_P',
    implementationRef: input.resolution.implementationRef, inputDigest: input.inputDigest, stage: 'implementation_completion', reason,
    cause: { errorClass: error.constructor.name, errorCode: error.code ?? null, message: error.message, messageTruncated: false } };
  await retainedCauseSurvivesAdmission(t, input, candidate, expected, reason === 'thrown' ? 'rejected' : 'thrown',
    'Actual F_P boundary and completion with a validated carrier pair; controlled basis/frame/replay premises for failure admission and cold/Public readback, as the F_D case. Not the installed C-call result route.');
}
async function retainedCauseSurvivesAdmission(t, input, candidate, expected, substitutedReason, disclosure) {
  const failureOwner = await sourceOwner('abg/runtime_failure');
  const subject = failureOwner.readRuntimeFailureDiagnosticSubject(candidate.diagnosticRef);
  // The cold read decides: the first cause, stage, reason and invocation are in
  // the admitted runtime_failure_observed, read back from a JSON-cloned prefix.
  const f = await fixture(t), admitted = f.owner.admitRuntimeFailure({ ...f.input(), subject, diagnosticRef: candidate.diagnosticRef });
  const handoff = f.store.projectReopenAuthorityAndClose();
  const cold = prefixes.selectValidatedRuntimeEventPrefix(events.readRuntimeEventsAtDurablePrefix(JSON.parse(JSON.stringify(handoff.prefix))), { runId: f.scope.runId });
  const evidence = failureOwner.projectRuntimeFailureEvidenceAtPrefix(cold);
  assert.deepEqual({ availability: evidence[0].availability, diagnosticClassRef: evidence[0].diagnosticClassRef, subject: evidence[0].subject },
    { availability: 'retained', diagnosticClassRef: expected.diagnosticClassRef, subject: expected });
  assert.equal(evidence[0].subjectDigest, hash(expected));assert.equal(evidence[0].failureRef, admitted.admission.failureRef);
  assert.equal(candidate.diagnosticRef, failureOwner.constructRuntimeFailureDiagnosticRef(expected));
  assert.equal(JSON.stringify(subject).includes(input.value.privateBody), false);
  const adapter = await sourceOwner('abg/project_read_definition_bindings', {}, ['evidenceProjection']);
  const projected = adapter.evidenceProjection('run_evidence', { source: { sourceRef: f.scope.runId, sourceDigest: hash('run') } }, {
    replayRef: 'replay://diagnostic', replayDigest: hash('replay'), evidenceRefs: [], eventAtoms: [], runtimeFailures: evidence,
  });
  const decoded = JSON.parse(decodeURIComponent(projected.evidence[0].ref.split(',').slice(1).join(',')));
  assert.deepEqual(decoded.subject, expected);assert.equal(projected.evidence[0].digest, hash(decoded));
  // A substituted subject refuses before append.
  const g = await fixture(t), count = g.store.readAll().length;
  assert.throws(() => g.owner.admitRuntimeFailure({ ...g.input(), subject: { ...subject, reason: substitutedReason },
    diagnosticRef: candidate.diagnosticRef }), /retained subject digest/);
  assert.equal(g.store.readAll().length, count);
  t.diagnostic(disclosure);
}

test('probabilistic completion that throws keeps its first cause through failure admission and cold/Public projection', async t => {
  const error = new TypeError('selected probabilistic completion cause');
  await probabilisticCompletionCauseSurvivesAdmission(t, 'thrown', error, () => { throw error; });
});

test('probabilistic completion that rejects keeps its first cause through failure admission and cold/Public projection', async t => {
  const error = Object.assign(new Error('selected probabilistic rejection cause'), { code: 'ENOENT' });
  await probabilisticCompletionCauseSurvivesAdmission(t, 'rejected', error, () => Promise.reject(error));
});

// C-3 (O-1). A returned candidate that admission refuses (a cycle), that the
// validator rejects (a non-candidate), or whose validation throws is
// malformed_return carrying its cause: the refusal's at and reason, the
// rejection, or the error's class and message. The admission and cold/Public
// readback are TD-17's.
const malformedClassRef = 'diagnostic://abiogenesis/implementation/malformed-return@5';
const validatorError = new RangeError('selected validator cause');
function malformedCases(regime, evidenceCandidates) {
  const answer = { member: 1 };answer.self = answer;
  const success = value => ({ kind: 'leaf_realization_candidate', schemaVersion: '5.0.0', disposition: 'success',
    resultCandidate: { kind: 'diagnostic_success', schemaVersion: '5.0.0', answer: value }, evidenceCandidates });
  return [
    { name: 'cyclic', output: success(answer), reason: 'refused', other: 'thrown',
      cause: { at: '.resultCandidate.answer.self', atTruncated: false, reason: 'a container that encloses itself (a cycle) is not I-JSON' } },
    { name: 'non-candidate', output: { kind: 'diagnostic_success', schemaVersion: '5.0.0', answer: 1 }, reason: 'refused', other: 'thrown',
      cause: { at: '', atTruncated: false, reason: `the admitted output is not an ${regime} leaf realization candidate` } },
    { name: 'validator throws', output: regime === 'F_P' ? { kind: 'validator_throw_probe' } : success(1), reason: 'thrown', other: 'refused',
      cause: { errorClass: 'RangeError', errorCode: null, message: validatorError.message, messageTruncated: false } },
  ];
}
test('probabilistic completion malformed returns keep their cause through failure admission and cold/Public projection', async t => {
  // F_P validation never calls validateSuccess, so an admitted value cannot make it throw: the
  // shape predicate is replaced to throw on one marked value (a controlled premise).
  const { isRecord } = await import('../../build/code/src/shared/admission_predicates.js');
  const overrides = { '../shared/admission_predicates.js': { isRecord: value => {
    if (isRecord(value) && value.kind === 'validator_throw_probe') throw validatorError;
    return isRecord(value);
  } } };
  for (const c of malformedCases('F_P', [])) {
    const { input, candidate } = await probabilisticCompletionFailure(() => c.output, 'malformed_return', overrides);
    const expected = { diagnosticClassRef: malformedClassRef, computeRegime: 'F_P', implementationRef: input.resolution.implementationRef,
      inputDigest: input.inputDigest, stage: 'implementation_completion', reason: c.reason, cause: c.cause };
    await retainedCauseSurvivesAdmission(t, input, candidate, expected, c.other,
      `C-3 F_P ${c.name}: actual F_P boundary and finalize with a validated carrier pair; controlled basis/frame/replay premises, as TD-17.`);
  }
});
test('deterministic malformed returns keep their cause through failure admission and cold/Public projection', async t => {
  const owner = await sourceOwner('implementation/leaf_invocation_port', {}, ['isLeafRealizationCandidate']);
  const base = deterministicBoundaryInput();
  const evidence = [{ kind: 'deterministic_evidence_candidate', schemaVersion: '5.0.0', implementationRef: base.resolution.implementationRef,
    inputDigest: base.inputDigest, outputDigest: hash({ kind: 'diagnostic_success', schemaVersion: '5.0.0', answer: 1 }) }];
  for (const c of malformedCases('F_D', evidence)) {
    const input = deterministicBoundaryInput({ loadImplementation: async () => () => c.output,
      validateSuccess: value => { if (c.reason === 'thrown') throw validatorError; return value.kind === 'diagnostic_success'; } });
    const closed = await owner.invokeLeafOwnerBoundary(input), candidate = closed.candidate;
    assert.equal(closed.computeRegime, 'F_D');assert.equal(closed.receipt.candidate, candidate);
    assert.equal(candidate.disposition, 'failure');assert.equal(candidate.resultCandidate.failureClass, 'malformed_return');
    assert.equal(candidate.resultCandidate.diagnosticRef, candidate.diagnosticRef);
    assert.deepEqual(candidate.evidenceCandidates, [{ ...evidence[0], outputDigest: hash(candidate.resultCandidate) }]);
    assert.equal(owner.isLeafRealizationCandidate(candidate, 'F_D', () => false, input.failureValueKind), true);
    const expected = { diagnosticClassRef: malformedClassRef, computeRegime: 'F_D', implementationRef: input.resolution.implementationRef,
      inputDigest: input.inputDigest, stage: 'implementation_invocation', reason: c.reason, cause: c.cause };
    await retainedCauseSurvivesAdmission(t, input, candidate, expected, c.other,
      `C-3 F_D ${c.name}: actual F_D boundary; controlled basis/frame/replay premises, as the F_D case.`);
  }
});

// D14. An outcome receipt's owned runtime prefix is a selection object the
// canonical writer encodes as {}; the five lifecycle failure subjects carry the
// receipt's own cut instead. The two route owners run from source with
// controlled upstream receipts; the failure admission is the fixture owner's.
test('lifecycle failure subjects carry each outcome receipt\'s own cut through both admission routes', async t => {
  const f = await fixture(t), executionBasis = f.input().executionBasis;
  const { canonicalJson } = await import('../../build/code/src/shared/canonical_json.js');
  const runB = { ...f.scope, runId: 'run://diagnostic-b', graphCallId: 'graph-call://diagnostic-b', frameId: 'frame://diagnostic-b' };
  events.admitRuntimeEvent(f.store, candidate('run_segment_opened', {
    executionBasisDigest: hash('basis'), executionBasisRef: f.scope.executionBasisRef, graphDigest: hash('graph'),
    graphFunctionRef: 'graph-function://diagnostic', graphRef: 'graph://diagnostic', invocationAdmissionRef: 'invocation-admission://diagnostic-b',
    invocationRef: 'invocation://diagnostic-b', programRef: 'program://diagnostic', runDigest: hash('run-b'), runId: runB.runId,
    workspaceBindingId: 'binding://diagnostic',
  }, runB, { aggregateType: 'run', aggregateId: runB.runId, parentAggregateId: null }));
  const cutOf = (store, runId) => ({ runId, coordinate: events.selectHeldEventStoreDurablePrefix(store), prefix: prefixes.selectOwnedRuntimeEventPrefix(store, { runId }) });
  const cut = runId => cutOf(f.store, runId);
  const earlier = cut(f.scope.runId), other = cut(runB.runId);
  events.admitRuntimeEvent(f.store, candidate('traversal_cursor_entered', { cursorRef: 'cursor://later', cursorDigest: hash('later') },
    { ...f.scope, frameId: 'frame://other' }));
  const later = cut(f.scope.runId);
  const guard = { runId: f.scope.runId, runtimeStatus: 'running', activeFluents: [] };
  const cCall = { cCallRef: 'c-call://diagnostic/c2', runId: f.scope.runId, transitionContractRef: 'contract://diagnostic/transition' };
  const result = { resultRef: 'result://diagnostic/c2', value: { kind: 'diagnostic_output' }, valueDigest: hash({ kind: 'diagnostic_output' }) };
  const judgment = { judgmentRef: 'judgment://diagnostic/c2', admissionEventRef: f.frontier.eventId };
  const receipt = (disposition, at, members) => ({ kind: 'admitted_c_call_outcome', schemaVersion: '5.0.0', replayState: guard,
    runtimePrefix: at.prefix, successorPrefix: at.coordinate, disposition, ...members });
  const judged = at => receipt('judged', at, { admitted: { cCall, result, judgment } });
  const retry = at => receipt('retry', at, { cCall, source: { sourceKind: 'diagnostic' }, failureCandidate: { kind: 'diagnostic_failure' }, failureValueKind: 'diagnostic_failure' });
  const transition = { kind: 'route_transition_admission', route: { routeRef: 'route://diagnostic', runStoppedEventRef: null }, retryAttempt: null,
    replayState: guard, successorPrefix: later.coordinate };
  const admission = (disposition, outcome, members) => ({ kind: 'c_call_completion_admission', schemaVersion: '5.0.0', disposition, outcome, ...members });
  const selection = at => {
    const extent = prefixes.runtimeEventPrefixExtent(at.prefix);
    return { kind: 'runtime_prefix_selection', coordinate: at.coordinate, runId: at.runId,
      eventStoreDigest: prefixes.runtimeEventPrefixDigest(at.prefix), eventCount: extent.count, lastAdmissionOrdinal: extent.lastOrdinal };
  };
  const ownedText = '"runtimePrefix":{"kind":"owned_runtime_event_prefix","selection":{}}';
  const project = f.owner.projectRuntimeFailureCandidate;
  // The five sites' shapes: recursion :571 (refusal, or a non-blocked admission),
  // :1028 (application_ready), :1054 (blocked), workflow :727 (retry receipt), :1075 (advanced).
  const refusal = { kind: 'route_transition_refusal', schemaVersion: '5.0.0', code: 'route_refused', message: 'refused' };
  const shapes = {
    'recursion:571': admission('advanced', judged(earlier), { transition, reentryInputContractRef: null }),
    'recursion:1028': admission('application_ready', judged(earlier), { replayState: guard }),
    'recursion:1054': admission('blocked', receipt('blocked', earlier, { cCall, result, completion: { kind: 'diagnostic_rejection' },
      diagnosticRef: 'diagnostic://abiogenesis/hog/child-traversal-blocked@5' }), { transition }),
    'workflow:727': retry(later),
    'workflow:1075': admission('advanced', judged(earlier), { transition, reentryInputContractRef: 'contract://diagnostic/reentry' }),
  };
  assert.deepEqual(project(refusal), refusal);
  for (const [site, value] of Object.entries(shapes)) {
    assert.ok(canonicalJson(value).includes(ownedText), site + ': the unprojected receipt encodes its prefix as {}');
    const projected = project(value), text = canonicalJson(projected);
    assert.equal(text.includes('"selection":{}'), false, site);
    const outcome = projected.kind === 'admitted_c_call_outcome' ? projected : projected.outcome;
    const source = value.kind === 'admitted_c_call_outcome' ? value : value.outcome;
    assert.deepEqual(outcome.runtimePrefix, selection(source === shapes['workflow:727'] ? later : earlier), site);
    const { runtimePrefix: _p, ...rest } = outcome, { runtimePrefix: _s, ...sourceRest } = source;
    assert.deepEqual(rest, JSON.parse(JSON.stringify(sourceRest)), site + ': members other than the prefix unchanged');
    if (projected.kind === 'c_call_completion_admission') {
      // The receipt admitted at the earlier cut keeps that cut inside the later transition.
      assert.deepEqual(projected.outcome.runtimePrefix.coordinate, earlier.coordinate, site);
      if (projected.transition) assert.deepEqual(projected.transition.successorPrefix, later.coordinate, site);
    }
  }
  assert.ok(selection(earlier).eventCount < selection(later).eventCount);
  assert.notDeepEqual(earlier.coordinate, later.coordinate);
  // Two Run selectors over one physical prefix: one coordinate, distinct subjects.
  assert.deepEqual(earlier.coordinate, other.coordinate);
  assert.equal(hash(retry(earlier)), hash(retry(other)), 'the unprojected subjects collapse');
  assert.notEqual(hash(project(retry(earlier))), hash(project(retry(other))));
  assert.equal(project(retry(other)).runtimePrefix.runId, runB.runId);
  assert.equal(project(retry(earlier)).runtimePrefix.runId, f.scope.runId);

  const lastFailure = store => {
    const row = store.readAll().at(-1);
    assert.equal(row.kind, 'runtime_failure_observed');
    return row;
  };
  // Recursion route: the :571 site, through admitRuntimeFailure.
  const blockedCompletion = shapes['recursion:571'];
  const recursion = await sourceOwner('hog/recursion_lifecycle', {
    '../abg/index.js': { admitRuntimeFailure: f.owner.admitRuntimeFailure, completeTraversalTransitionCandidate: value => value },
    '../abg/c_call_outcome.js': { projectOwnedCCallOutcomeReceiptAtPrefix: () => judged(later), admitOwnedCCallCompletion: () => blockedCompletion },
    './route_proposal.js': { proposeRecursionRoute: () => ({ kind: 'traversal_route_candidate' }) },
    './operator_support.js': { ownedReplayAtDurable: () => null },
    './traversal_completion.js': { projectOwnedExecutableTraversalCompletion: (disposition, _replay, successorPrefix, value) => ({ disposition, successorPrefix, value }) },
  }, ['blockRecursion']);
  const state = { input: { store: f.store, predecessorPrefix: later.coordinate, executionBasis, openedTraversalScope: f.scope,
    graph: {}, graphFunction: {}, traversalStop: { cursor: {} }, closureContract: {}, completionScopeClass: 'child' }, cCall, result, judgment };
  const completion = recursion.blockRecursion(state, { applicationRef: 'application://diagnostic' }, { correlationId: 'correlation://diagnostic' });
  assert.equal(completion.disposition, 'failed');
  const recursionRow = lastFailure(f.store);
  assert.equal(recursionRow.payload.diagnosticClassRef ?? recursionRow.payload.diagnosticRef, 'diagnostic://abiogenesis/hog/application-run-stop-absent@5');
  assert.equal(recursionRow.payload.subjectDigest, hash({ stage: 'blocked-completion', candidate: project(blockedCompletion) }));
  assert.notEqual(recursionRow.payload.subjectDigest, hash({ stage: 'blocked-completion', candidate: blockedCompletion }));
  // Workflow route: the :727 site, through failTraversal. A failed scope admits
  // no second failure, so this route uses its own store.
  const g = await fixture(t), gAt = cutOf(g.store, g.scope.runId);
  const workflowReceipt = retry(gAt);
  const failureRoute = await sourceOwner('hog/traversal_failure', { '../abg/index.js': { admitRuntimeFailure: g.owner.admitRuntimeFailure } });
  const workflow = await sourceOwner('hog/workflow_lifecycle', {
    './traversal_failure.js': failureRoute,
    '../abg/c_call.js': { prepareWorkflowChildFoldback: () => ({ intent: null, admit: () => ({ kind: 'child_foldback_admission',
      childDisposition: 'blocked', childReasonRef: null, successorPrefix: gAt.coordinate }) }) },
    '../abg/c_call_outcome.js': { admitOwnedCCallResult: () => workflowReceipt },
  });
  const frame = { authority: { store: g.store, executionBasis: g.input().executionBasis, openedTraversalScope: g.scope, eventTime: time, correlationId: 'correlation://diagnostic',
    graph: {}, graphFunction: {}, leafPort: { contractValueKindByRef: () => 'diagnostic_output', contractValueKind: () => 'diagnostic_failure' } },
    cursor: { inputDigest: hash('input') }, workflowTerm: { outputCarrierRef: 'contract://diagnostic/output', graphFunctionRef: 'graph-function://child' },
    parentCCall: cCall, ordinal: 0, childExecutionBasis: {}, childTraversalScope: {}, value: {} };
  const child = { disposition: 'blocked', resultRef: 'result://child', judgmentRef: 'judgment://child', resultValue: { kind: 'diagnostic_output' },
    closureRef: null, successorPrefix: gAt.coordinate, diagnosticRef: null, replayState: guard };
  assert.throws(() => workflow.completeOwnedWorkflowLocus(frame, child), error => error.kind === 'graph_traversal_failure' &&
    error.diagnosticRef === 'diagnostic://abiogenesis/hog/workflow-retry-outcome-invalid@5');
  const workflowRow = lastFailure(g.store);
  assert.equal(workflowRow.payload.subjectDigest, hash({ stage: 'workflow-outcome-0', candidate: project(workflowReceipt) }));
  assert.notEqual(workflowRow.payload.subjectDigest, hash({ stage: 'workflow-outcome-0', candidate: workflowReceipt }));
  assert.equal(canonicalJson(project(workflowReceipt)).includes('"selection":{}'), false);
  // Nothing is retained for these routes: the cold projection answers not_retained with the projected digest.
  const evidence = f.owner.projectRuntimeFailureEvidenceAtPrefix(prefixes.selectValidatedRuntimeEventPrefix(f.store.readAll(), { runId: f.scope.runId }));
  assert.equal(evidence.length, 1);
  assert.equal(evidence[0].availability, 'not_retained');
  assert.equal(evidence[0].subjectDigest, recursionRow.payload.subjectDigest);
});

// TD-16. Each caller of the I-JSON lift that consumed only its refusal now reads
// admitJson's outcome; the refusal it returns is the one head returned. The
// inputs are the I-JSON refusals (a function member, an unsafe integer, a lone
// surrogate) and the three values admitJson threw on at cf630b55c (a cycle;
// nesting past the stack bound; a proxy trap), which head's catch absorbed and
// admitJson now refuses (C-3). Each value sits one member below the site's
// input; the control is the same input with the member 1. td16Head is each
// site's result at cf630b55c, read from that build and source. Since C-3 (O-1)
// the two leaf sites return that malformed_return with its class reference
// replaced by the inline reference naming the cause.
const td16Head = {
  "conformance": {"kind":"gtl_program_conformance_refusal","schemaVersion":"5.0.0","disposition":"failed","programRef":null,"programDigest":null,"code":"invalid_packet","diagnosticRef":"diagnostic://abiogenesis/conformance/invalid_packet@5","diagnostics":[{"code":"invalid_packet","path":"$","message":"GTL Program conformance requires one exact I-JSON packet"}],"violatedContractRefs":[],"evidenceRefs":[],"repairAffordances":[]},
  "result assessment": {"kind":"result_assessment_refusal","schemaVersion":"5.0.0","disposition":"refused","memberKey":"assess","code":"value_mismatch","message":"result assessment requires one exact canonical I-JSON request","issuePaths":["/"],"evidenceRefs":[]},
  "witness admission": {"kind":"witness_admission_refusal","schemaVersion":"5.0.0","disposition":"refused","memberKey":"attest","subjectRef":null,"code":"content_invalid","message":"witness admission requires one exact canonical I-JSON packet","successorPrefix":null},
  "project read": {"kind":"abg_project_read_refusal","schemaVersion":"5.0.0","disposition":"refused","memberKey":"run_replay","targetRef":null,"code":"invalid_packet","message":"ABG project read requires one exact I-JSON packet"},
  "canonicalObject": null,
  "isPredicateObservation observedValue": false,
  "isPredicateObservation evidence": false,
  "execution basis": null,
  "actor request": {"kind":"actor_process_carrier_validation_refusal","schemaVersion":"5.0.0","disposition":"refused","code":"invalid_actor_process_request","message":"actor process request must contain only exact I-JSON data"},
  "actor observation": {"kind":"actor_process_carrier_validation_refusal","schemaVersion":"5.0.0","disposition":"refused","code":"invalid_actor_process_observation","message":"actor process observation must contain only exact I-JSON data"},
  "F_D output": {"kind":"leaf_realization_candidate","schemaVersion":"5.0.0","disposition":"failure","evidenceCandidates":[{"kind":"deterministic_evidence_candidate","schemaVersion":"5.0.0","implementationRef":"implementation://diagnostic/deterministic","inputDigest":"sha256:f40505b2780f9fded56ccbfb5ae4e97ab7cb3a2020ab82c728e768bad10de653","outputDigest":"sha256:c5c00d4bbd6fb309351198b91e964bbe3dced6665b474c63889101abe589dea2"}],"resultCandidate":{"kind":"diagnostic_failure","schemaVersion":"5.0.0","failureClass":"malformed_return","diagnosticRef":"diagnostic://abiogenesis/implementation/malformed-return@5"},"diagnosticRef":"diagnostic://abiogenesis/implementation/malformed-return@5"},
  "F_P completion": {"kind":"leaf_realization_candidate","schemaVersion":"5.0.0","disposition":"failure","evidenceCandidates":[],"resultCandidate":{"kind":"diagnostic_failure","schemaVersion":"5.0.0","failureClass":"malformed_return","diagnosticRef":"diagnostic://abiogenesis/implementation/malformed-return@5"},"diagnosticRef":"diagnostic://abiogenesis/implementation/malformed-return@5"},
};
function td16Values() {
  const cycle = { member: 1 };cycle.self = cycle;
  const deep = JSON.parse('['.repeat(200000) + ']'.repeat(200000));
  const proxy = new Proxy({}, { ownKeys() { throw new TypeError('TD-16 proxy trap'); } });
  return { functionMember: { f() { return 1; } }, unsafeInteger: 2 ** 60, loneSurrogate: '\uD800', cycle, deep, proxy };
}
function td16Carrier(responseJsonSchema = {}, toolInvocations = []) {
  const digest = `sha256:${'a'.repeat(64)}`, bytes = text => `sha256:${createHash('sha256').update(text).digest('hex')}`;
  const prompt = 'Return one diagnostic result.', rawOutput = JSON.stringify({ kind: 'raw_output', schemaVersion: '5.0.0' });
  const value = deepFreeze({ kind: 'diagnostic_input', privateBody: 'input-body-not-diagnostic' }), inputDigest = hash(value);
  const resolution = deepFreeze({ computeRegime: 'F_P', implementationRef: 'implementation://diagnostic/probabilistic@5',
    inputContractRef: 'contract://diagnostic/input@5', outputContractRef: 'contract://diagnostic/output@5',
    modulePath: 'controlled-fixture-module', namedSymbol: 'controlledProbabilistic' });
  const workerContracts = deepFreeze({ instructionContractRef: 'contract://diagnostic/instruction@5', resultContractRef: 'contract://diagnostic/raw-result@5' });
  const request = { actorRef: 'actor://diagnostic/probabilistic@5', workerBindingRef: 'worker-binding://diagnostic/probabilistic@5',
    implementationRef: resolution.implementationRef, inputDigest, materializationPlanRef: 'materialization-plan://diagnostic/probabilistic@5',
    rendererRef: 'renderer://diagnostic/probabilistic@5', ...workerContracts, transportLane: 'closed_prompt_proof', prompt, responseJsonSchema };
  const { transportLane, prompt: _prompt, responseJsonSchema: _schema, ...requested } = request;
  const observation = { ...requested, transportLane,
    actorInvocationRef: 'actor-invocation://diagnostic/probabilistic/1', processRef: 'process://diagnostic/probabilistic/1',
    transportBindingRef: 'transport-binding://diagnostic/probabilistic/1', transportBindingDigest: digest,
    observedOutputDigest: hash(JSON.parse(rawOutput)), promptDigest: hash(prompt), transportDigest: digest,
    disposition: 'success', failureClass: null, finalOutput: rawOutput, processStatus: 0, processSignal: null, timeoutClass: null,
    timedOut: false, exitObserved: true, terminationConfirmed: true, signalSequence: [], structuredEventCount: 1, progressEventCount: 0,
    toolCallCount: 0, toolInvocations, apiRetryCount: 0, stdoutByteLength: 0, stderrByteLength: 0,
    artifactDigests: { output: bytes(rawOutput), prompt: bytes(prompt), stderr: bytes(''), stdout: bytes(''), transport: digest } };
  return { value, inputDigest, resolution, workerContracts, request, observation };
}
test('TD-16: the lift\'s refusal-only callers keep head\'s refusal for every malformed value', async t => {
  const values = td16Values(), names = Object.keys(values), sites = {};
  const fixed = (label, run, control) => {
    for (const name of names) assert.deepEqual(run(values[name]), td16Head[label], `${label}: ${name}`);
    if (control !== undefined) assert.notDeepEqual(run(1), td16Head[label], `${label}: control`);
    sites[label] = td16Head[label];
    return td16Head[label];
  };
  // validator/conformance_operation.ts evaluateWithValidationInput
  const { evaluateGtlProgramConformance } = await import('../../build/code/src/validator/conformance_operation.js');
  fixed('conformance', bad => evaluateGtlProgramConformance({ kind: 'gtl_program_conformance_evaluate_packet', member: bad }), true);
  // product/result_assessment_operation.ts assessResult
  const { assessResult } = await import('../../build/code/src/product/result_assessment_operation.js');
  fixed('result assessment', bad => assessResult({ kind: 'result_assess_packet', member: bad }), true);
  // abg/witness_admission_operation.ts validatePacket via admitWitnessedAct
  const { admitWitnessedAct } = await import('../../build/code/src/abg/witness_admission_operation.js');
  fixed('witness admission', bad => admitWitnessedAct({ memberKey: 'attest', member: bad }, {}, {}), true);
  // abg/project_read_ports.ts admitReadPacket
  const reads = await sourceOwner('abg/project_read_ports', {}, ['admitReadPacket']);
  fixed('project read', bad => reads.admitReadPacket('run_replay', { kind: 'abg_project_read_packet', member: bad }), true);
  // abg/probabilistic_result.ts canonicalObject
  const probabilistic = await sourceOwner('abg/probabilistic_result', {}, ['canonicalObject']);
  assert.equal(fixed('canonicalObject', bad => probabilistic.canonicalObject({ member: bad }), true), null);
  assert.deepEqual(probabilistic.canonicalObject({ member: 1 }), { member: 1 });
  // product/worksite_command_execution.ts isPredicateObservation (observedValue, then evidence)
  const worksite = await sourceOwner('product/worksite_command_execution', {}, ['isPredicateObservation']);
  const observation = (observedValue, evidence) => ({ kind: 'worksite_predicate_observation', schemaVersion: '5.0.0', ordinal: 0,
    predicateId: 'predicate://diagnostic', predicateKind: 'file_exists', observedValue, evidence, evidenceRefs: [] });
  assert.equal(fixed('isPredicateObservation observedValue', bad => worksite.isPredicateObservation(observation({ member: bad }, []), 0), true), false);
  assert.equal(fixed('isPredicateObservation evidence', bad => worksite.isPredicateObservation(observation(1, [{ member: bad }]), 0), true), false);
  assert.equal(worksite.isPredicateObservation(observation(1, [1]), 0), true);
  // abg/execution_basis.ts constructNativeInstructionAssemblyBasis: a refused basis never reaches the prefix capture
  let captures = 0;
  const basis = await sourceOwner('abg/execution_basis', { './event_store.js': { captureDurablePrefixCoordinate: () => { captures += 1; throw new TypeError('TD-16 capture'); } } });
  assert.equal(fixed('execution basis', bad => basis.constructNativeInstructionAssemblyBasis({ predecessorPrefix: {}, member: bad })), null);
  assert.equal(captures, 0);
  assert.equal(basis.constructNativeInstructionAssemblyBasis({ predecessorPrefix: {}, member: 1 }), null);
  assert.equal(captures, 1);
  // abg/actor_process.ts validateActorProcessCarrierPair, request then observation
  const carrier = td16Carrier();
  assert.equal(validateActorProcessCarrierPair(carrier.request, carrier.observation).kind, 'actor_process_carrier_validation');
  fixed('actor request', bad => { const c = td16Carrier({ member: bad });
    return validateActorProcessCarrierPair(c.request, c.observation); }, true);
  fixed('actor observation', bad => { const c = td16Carrier({}, [{ member: bad }]);
    return validateActorProcessCarrierPair(c.request, c.observation); }, true);
  // implementation/leaf_invocation_port.ts F_D output: the refused output is the null output
  const owner = await sourceOwner('implementation/leaf_invocation_port', {}, ['isLeafRealizationCandidate']);
  const input = deterministicBoundaryInput();
  const success = answer => ({ kind: 'leaf_realization_candidate', schemaVersion: '5.0.0', disposition: 'success',
    resultCandidate: { kind: 'diagnostic_success', schemaVersion: '5.0.0', answer },
    evidenceCandidates: [{ kind: 'deterministic_evidence_candidate', schemaVersion: '5.0.0', implementationRef: input.resolution.implementationRef,
      inputDigest: input.inputDigest, outputDigest: `sha256:${'b'.repeat(64)}` }] });
  const deterministic = async output => owner.invokeLeafOwnerBoundary({ ...input, loadImplementation: async () => () => output });
  const failureOwner = await sourceOwner('abg/runtime_failure');
  const td16Causes = { functionMember: ['.f', 'expected an I-JSON value'], unsafeInteger: ['', 'unsafe integral numbers are not I-JSON'],
    loneSurrogate: ['', 'lone high surrogate is not I-JSON'], cycle: ['.self', 'a container that encloses itself (a cycle) is not I-JSON'],
    deep: ['[0]'.repeat(510), 'containers nested more than 512 deep exceed the admission bound'], proxy: ['', 'a Proxy is not I-JSON'] };
  const refusedAt = name => ({ at: '.resultCandidate.answer' + td16Causes[name][0], atTruncated: false, reason: td16Causes[name][1] });
  const rejected = regime => ({ at: '', atTruncated: false, reason: `the admitted output is not an ${regime} leaf realization candidate` });
  const headWithCause = (label, closed, invocation, stage, cause, message) => {
    const head = td16Head[label], ref = closed.candidate.diagnosticRef;
    assert.deepEqual(failureOwner.readRuntimeFailureDiagnosticSubject(ref), { diagnosticClassRef: head.diagnosticRef,
      computeRegime: invocation.resolution.computeRegime, implementationRef: invocation.resolution.implementationRef,
      inputDigest: invocation.inputDigest, stage, reason: 'refused', cause }, message);
    const resultCandidate = { ...head.resultCandidate, diagnosticRef: ref };
    assert.deepEqual(closed.candidate, { ...head, diagnosticRef: ref, resultCandidate,
      evidenceCandidates: head.evidenceCandidates.map(evidence => ({ ...evidence, outputDigest: hash(resultCandidate) })) }, message);
  };
  const nullOutput = await deterministic(null);
  headWithCause('F_D output', nullOutput, input, 'implementation_invocation', rejected('F_D'), 'F_D output: null');
  assert.deepEqual((await deterministic(success(1))).candidate, success(1));
  for (const name of names) headWithCause('F_D output', await deterministic(success(values[name])), input, 'implementation_invocation',
    refusedAt(name), `F_D output: ${name}`);
  // implementation/leaf_invocation_port.ts F_P finalize: the refused completion is the null completion
  const pair = validateActorProcessCarrierPair(carrier.request, carrier.observation);
  const probabilisticClosed = async output => {
    const prepared = await owner.invokeLeafOwnerBoundary({ resolution: carrier.resolution, value: carrier.value, inputDigest: carrier.inputDigest,
      failureValueKind: 'diagnostic_failure', verifyAuthority: () => true, validateSuccess: () => true,
      resolveWorkerContracts: () => carrier.workerContracts, occurrence: input.occurrence,
      loadImplementation: async () => () => deepFreeze({ kind: 'prepared_probabilistic_leaf_invocation', schemaVersion: '5.0.0',
        workerRequest: deepFreeze(carrier.request), complete: () => output }) });
    assert.equal(prepared.kind, 'prepared_probabilistic_leaf_owner_invocation');
    return prepared.complete(pair);
  };
  const fpSuccess = answer => ({ kind: 'leaf_realization_candidate', schemaVersion: '5.0.0', disposition: 'success',
    resultCandidate: { kind: 'diagnostic_success', schemaVersion: '5.0.0', answer }, evidenceCandidates: [] });
  const fpNull = await probabilisticClosed(null);
  headWithCause('F_P completion', fpNull, carrier, 'implementation_completion', rejected('F_P'), 'F_P completion: null');
  assert.deepEqual((await probabilisticClosed(fpSuccess(1))).candidate, fpSuccess(1));
  for (const name of names) headWithCause('F_P completion', await probabilisticClosed(fpSuccess(values[name])), carrier,
    'implementation_completion', refusedAt(name), `F_P completion: ${name}`);
  sites['F_D output'] = nullOutput.candidate; sites['F_P completion'] = fpNull.candidate;
  t.diagnostic(JSON.stringify({ values: names, sites: Object.keys(sites).length,
    limit: 'abg/actor_process.ts assessNativeResultArtifact is reached only through a native worker exchange; its admission is read, not run.' }));
});
