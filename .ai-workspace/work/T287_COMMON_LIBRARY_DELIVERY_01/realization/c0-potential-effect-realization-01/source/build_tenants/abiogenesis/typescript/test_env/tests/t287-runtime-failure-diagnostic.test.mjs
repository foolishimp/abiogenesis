import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import ts from 'typescript';
import * as Cause from 'effect/Cause';
import * as Effect from 'effect/Effect';
import * as events from '../../build/code/src/abg/event_store.js';
import * as prefixes from '../../build/code/src/abg/event_prefix.js';
import * as calculus from '../../build/code/src/abg/event_calculus.js';
import { sha256Canonical as hash } from '../../build/code/src/shared/digests.js';
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
  assert.equal(malformed.candidate.resultCandidate.failureClass, 'malformed_return');
  assert.equal(malformed.candidate.diagnosticRef, 'diagnostic://abiogenesis/implementation/malformed-return@5');assert.ok(malformed.receipt);
});
