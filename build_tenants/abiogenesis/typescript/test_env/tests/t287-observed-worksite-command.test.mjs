import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import * as p from '../../build/code/src/product/index.js';
import * as events from '../../build/code/src/abg/event_store.js';
import { constructNativeWorkspaceWorkObservation, isNativeWorkspaceWorkFailure } from '../../build/code/src/product/native_workspace_work.js';
import { ABI5_WORKSITE_COMMAND_EXECUTION_PRODUCT_SEMANTICS as semantics } from '../../build/code/src/product/builtin_semantics.js';
import { worksiteCommandExecutionHelperPlan, renderWorksiteCommandExecutionPrompt, worksiteCommandExecutionWorkerResultSchema, constructWorksiteExecutionHelperArtifact, constructWorksiteExecutionObservation } from '../../build/code/src/product/worksite_command_execution.js';
import { realizeWorksiteCommandExecution } from '../../build/code/src/implementation/worksite_command_execution.js';
import { loadWorksiteOwner, worksiteFixture } from '../support/t287-generic-job-worksite.mjs';
const ids = p.WORKSITE_COMMAND_EXECUTION_IDS, hash = p.sha256Canonical, owner = await loadWorksiteOwner();
const time = '2026-09-22T00:00:00.000Z';
function event(kind, payload, scope = {}) {
  return { kind, payload, eventTime: time, aggregateType: 'workspace', aggregateId: 'workspace://observed/component',
    parentAggregateId: null, causationEventRefs: [], correlationId: 'correlation://observed/component', workflowVersion: '5.0.0',
    scopeClass: 'workspace', basisId: 'basis://observed/component', ...scope };
}
async function fixture(t) {
  const env = await worksiteFixture(owner);
  t.after(() => fs.rmSync(env.scratch, { recursive: true, force: true }));
  const observedFiles = [];
  for (const relativePath of ['source.txt', 'retained.txt']) {
    fs.writeFileSync(join(env.canonicalRoot, relativePath), `exact retained ${relativePath}\n`);
    const subject = owner.constructWorksiteSubject({ ...env, relativePath, subjectUri: pathToFileURL(join(env.canonicalRoot, relativePath)).href });
    const observation = await owner.observeWorksiteSubject(env.workspaceAuthorityBasis, env.workspaceBinding, subject);
    assert.equal(observation.state, 'file'); observedFiles.push({ subject, observation });
  }
  const input = { workspaceAuthorityBasis: env.workspaceAuthorityBasis, workspaceBinding: env.workspaceBinding, capabilityGrant: env.capabilityGrant,
    observedFiles, commands: [{ commandId: 'command://observed/check', executable: 'node', args: ['--version'], relativeCwd: '.',
      environment: {}, timeoutMs: 1000, terminationGraceMs: 100, expectedReports: [] }], outcomePredicates: [],
    allowedWriteTerritories: [{ pathKind: 'subtree', relativePath: 'verification' }] };
  return { ...env, input, task: p.constructObservedWorksiteCommandExecutionTask(input) };
}
function invocation(task) {
  return { input: task, sourceResultBasis: null, workspaceId: task.workspaceBinding.workspaceId,
    workspaceBindingId: task.workspaceBinding.bindingId, workspaceBindingDigest: task.workspaceBinding.bindingDigest };
}

test('observed C2 has an exact cold source arm, direct semantics and unchanged helper protocol', async t => {
  const f = await fixture(t), task = JSON.parse(JSON.stringify(f.task));
  assert(p.isObservedWorksiteCommandExecutionTask(task)); assert(p.isC2WorksiteCommandExecutionTask(task));
  assert.equal(p.isWorksiteCommandExecutionTask(task), false); assert.equal(p.isNativeWorksiteCommandExecutionTask(task), false);
  assert.equal('sourceConstructionResult' in task, false); assert.equal('sourceNativeWork' in task, false);
  assert.equal(semantics.validateInvocationBasis(invocation(task)), true);
  assert.equal(semantics.validateInvocationBasis({ ...invocation(task), sourceResultBasis: {} }), false);
  assert.equal(semantics.validateInvocationBasis({ ...invocation(task), workspaceBindingId: 'workspace-binding://foreign' }), false);
  assert.deepEqual(semantics.resolveProbabilisticWorkerContracts({ inputContractRef: ids.taskContractRef,
    outputContractRef: ids.observationContractRef, input: task }), { instructionContractRef: ids.taskContractRef, resultContractRef: ids.workerResultContractRef });
  const plan = worksiteCommandExecutionHelperPlan(task, 'attempt://observed/component');
  const prompt = renderWorksiteCommandExecutionPrompt(task, plan);
  assert(prompt.includes(task.sourceObservedInput.sourceSetRef)); assert(!prompt.includes('sourceConstructionResultRef'));
  const schema = worksiteCommandExecutionWorkerResultSchema(task, plan);
  assert.equal(schema.properties.taskDigest.const, task.taskDigest);
  assert.equal(schema.properties.attemptRef.const, plan.attemptRef);
  assert.deepEqual(Object.keys(schema.properties).sort(), ['attemptRef', 'helperArtifactDigest', 'helperArtifactRef', 'kind', 'schemaVersion', 'taskDigest', 'taskRef']);
});

test('observed C2 refuses foreign, absent, duplicate, mixed and writable source claims', async t => {
  const f = await fixture(t);
  const other = await worksiteFixture(owner); t.after(() => fs.rmSync(other.scratch, { recursive: true, force: true }));
  for (const patch of [{ observedFiles: [] }, { observedFiles: [...f.input.observedFiles, f.input.observedFiles[0]] },
    { observedFiles: [{ ...f.input.observedFiles[0], observation: owner.constructWorksiteObservation({ subject: f.input.observedFiles[0].subject, state: 'absent' }) }] },
    { workspaceAuthorityBasis: other.workspaceAuthorityBasis, workspaceBinding: other.workspaceBinding, capabilityGrant: other.capabilityGrant },
    { allowedWriteTerritories: [{ pathKind: 'file', relativePath: 'source.txt' }] }]) {
    assert.throws(() => p.constructObservedWorksiteCommandExecutionTask({ ...f.input, ...patch }));
  }
  assert.equal(p.isObservedWorksiteCommandExecutionTask({ ...f.task, sourceConstructionResult: {} }), false);
  assert.equal(p.isObservedWorksiteCommandExecutionTask({ ...f.task, sourceObservedInput: { ...f.task.sourceObservedInput, sourceSetDigest: hash('crossed') } }), false);
});

async function sourceGate(f, t) {
  const acquired = events.createNewEmptyAppendSink({ kind: 'new_empty_append_sink_request', schemaVersion: '5.0.0', eventLogPath: join(f.scratch, 'events.jsonl') });
  assert(acquired.store); const store = acquired.store; t.after(() => store.closeDurableLog());
  const inv = { ...invocation(f.task), programRef: ids.programRef, graphFunctionRef: ids.graphFunctionRef, inputContractRef: ids.taskContractRef,
    rawInputDigest: hash(f.task), invocationAdmissionRef: 'invocation-admission://observed/component', capabilityGrants: [f.capabilityGrant] };
  const admitted = events.admitRuntimeEvent(store, event('invocation_admitted', { invocationAdmissionRef: inv.invocationAdmissionRef, invocationAdmissionDigest: hash(inv), invocationRef: 'invocation://observed/component',
    catalogBasisRef: 'catalog-basis://observed/component', catalogApplicationDigests: [], catalogApplicationRefs: [], rawInputDigest: inv.rawInputDigest, reentryBasis: null, sourceResultBasis: null }));
  inv.admissionEventRef = admitted.eventId;
  const basis = { basisRef: 'execution-basis://observed/component', basisClass: 'root', rawInputValue: f.task, invocationAdmissionRef: inv.invocationAdmissionRef };
  const scope = { aggregateType: 'c_call', aggregateId: 'c-call://observed/component', parentAggregateId: 'frame://observed/component',
    scopeClass: 'run', runId: 'run://observed/component', graphCallId: 'graph-call://observed/component', frameId: 'frame://observed/component',
    graphFunctionRef: ids.graphFunctionRef, basisId: basis.basisRef };
  events.admitRuntimeEventBatch(store, [() => event('c_call_opened', { cCallRef: scope.aggregateId, cCallDigest: hash(scope), callClass: 'leaf' }, scope),
    prior => event('c_call_fibre_selected', { cCallRef: scope.aggregateId, callClass: 'leaf', armId: ids.armId, regime: 'F_P', implementationRef: ids.implementationRef,
      implementationBindingRef: ids.implementationBindingRef }, { ...scope, causationEventRefs: [prior.at(-1).eventId] })]);
  // Exact environment/invocation/execution rehydration are explicit supplied lower-owner premises.
  // Real held-prefix acquisition, Product predicates, gate, admitted invalidators and files execute.
  const file = resolve(import.meta.dirname, '../../build/code/src/abg/execution_basis.js');
  const m = new SourceTextModule(fs.readFileSync(file, 'utf8'), { identifier: file });
  const replacements = {
    './invocation_execution_truth.js': { projectExactExecutionBasisAtPrefix: (_prefix, ref) => ref === basis.basisRef ? basis : null },
    './invocation_admission.js': { rehydrateInvocationAdmissionAtPrefix: (_prefix, ref) => ref === inv.invocationAdmissionRef ? inv : null },
    './environment_admission.js': { projectExactPrefixWorkspaceEnvironment: () => ({ kind: 'exact_prefix_workspace_environment', workspaceAuthorityBasis: f.workspaceAuthorityBasis, workspaceBinding: f.workspaceBinding }) },
  };
  await m.link(async specifier => {
    const actual = await import(specifier.startsWith('node:') ? specifier : pathToFileURL(resolve(dirname(file), specifier)).href);
    const values = { ...actual, ...replacements[specifier] };
    return new SyntheticModule(Object.keys(values), function () { for (const [k, v] of Object.entries(values)) this.setExport(k, v); });
  }); await m.evaluate();
  const check = (task = f.task, prefix = events.selectHeldEventStoreDurablePrefix(store)) => m.namespace.hasExactWorksiteCommandLeafSourceAtDurablePrefix(prefix, scope.aggregateId, task);
  return { store, inv, basis, check, scope };
}

test('observed root source gate binds actual input and refuses stale, crossed and child authority', async t => {
  const f = await fixture(t), g = await sourceGate(f, t);
  assert.equal(g.check(), true);
  g.inv.programRef = 'program://foreign'; assert.equal(g.check(), false); g.inv.programRef = ids.programRef;
  assert.equal(g.check(), true, 'only the unchanged core root Program owns the observed source arm');
  assert.equal(g.check({ ...f.task, taskDigest: hash('different-input') }), false);
  g.inv.sourceResultBasis = {}; assert.equal(g.check(), false); g.inv.sourceResultBasis = null;
  const binding = g.inv.workspaceBindingId;
  g.inv.workspaceBindingId = 'workspace-binding://foreign'; assert.equal(g.check(), false); g.inv.workspaceBindingId = binding;
  g.basis.basisClass = 'child'; assert.equal(g.check(), false); g.basis.basisClass = 'root';
  const admission = g.inv.admissionEventRef;
  g.inv.admissionEventRef = 'event://not-admitted'; assert.equal(g.check(), false); g.inv.admissionEventRef = admission;
  const stale = events.selectHeldEventStoreDurablePrefix(g.store);
  events.admitRuntimeEvent(g.store, event('basis_admitted', { basisClass: 'root', basisRef: 'basis://later', basisDigest: hash('later'), rawInputValue: {} }));
  assert.equal(g.check(f.task, stale), false); assert.equal(g.check(), true, 'unrelated newer facts do not invalidate the source');
});

test('later admitted failed native residue invalidates observed inputs without requiring physical mismatch', async t => {
  const f = await fixture(t), g = await sourceGate(f, t);
  const context = await owner.observeWorksiteContext({ ...f, readRoots: ['source.txt', 'retained.txt'], maxFiles: 2, maxBytes: 1000 });
  const nativeTask = p.constructNativeWorkspaceWorkTask({ workspaceAuthorityBasis: f.workspaceAuthorityBasis, workspaceBinding: f.workspaceBinding, capabilityGrant: f.capabilityGrant, context, outcome: 'component edit', instructions: ['Preserve other files.'],
    readFirst: ['source.txt'], writeRoots: ['source.txt'], checks: [] });
  const provenance = { cCallRef: 'c-call://observed/later', executionAuthorityRef: 'authority://component', executionAuthorityDigest: hash('authority'),
    actorInvocationRef: 'actor-invocation://component', transportBindingRef: 'transport://component', transportBindingDigest: hash('transport-binding'),
    promptDigest: hash('prompt'), transportDigest: hash('transport') };
  const source = constructNativeWorkspaceWorkObservation(nativeTask, context, { summary: 'component only', gaps: [] }, provenance);
  const failure = { kind: 'native_workspace_work_failure', schemaVersion: '5.0.0', failureClass: 'result_contract_failure', diagnosticRef: 'diagnostic://observed/residue',
    task: nativeTask, before: source.after, after: null, changedPaths: null, observationFailure: owner.worksiteRefusal('filesystem_refused', 'component after-state unavailable'), report: null, provenance };
  assert(isNativeWorkspaceWorkFailure(failure)); assert.equal(g.check(), true);
  events.admitRuntimeEvent(g.store, event('c_call_result_admitted', { cCallRef: provenance.cCallRef, resultRef: 'result://observed/later', resultDigest: hash(failure),
    resultClass: 'failure', contractRef: p.NATIVE_WORKSPACE_WORK_IDS.failureContractRef, evidenceRefs: [], value: failure, valueDigest: hash(failure), valueKind: failure.kind },
    { ...g.scope, aggregateId: provenance.cCallRef, graphFunctionRef: p.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef }));
  assert.equal(g.check(), false);
  assert.equal(fs.readFileSync(join(f.canonicalRoot, 'source.txt'), 'utf8'), 'exact retained source.txt\n');
});

test('changed physical observed source refuses before archive creation or command dispatch', async t => {
  const f = await fixture(t);
  fs.writeFileSync(join(f.canonicalRoot, 'retained.txt'), 'changed after task construction\n');
  assert.throws(() => realizeWorksiteCommandExecution(f.task, { cCallRef: 'c-call://observed/physical', runId: 'run://observed/physical',
    graphCallId: 'graph-call://observed/physical', frameId: 'frame://observed/physical', programLocusRef: ids.nodeRef,
    taskOrdinal: null, attempt: 1, executionAuthority: null }), /protected worksite observation changed/);
  assert.equal(fs.existsSync(f.workspaceBinding.roots.archiveRoot), false);
});

// Product result composition only: command/actor observations are declared lower-owner
// fixture facts, never runtime receipts or claimed executions. Use red exit 7 to check
// that C2 admission observes an outcome rather than asserting semantic success.
test('observed C2 result, native acknowledgment and closure bind the same task without turning red execution green', async t => {
  const f = await fixture(t), task = f.task, plan = worksiteCommandExecutionHelperPlan(task, 'attempt://observed/result');
  const { kind: _k, schemaVersion: _s, expectedReports: _r, ...command } = task.commands[0];
  const empty = { kind: 'worksite_observed_stream', schemaVersion: '5.0.0', encoding: 'base64', payload: '', byteLength: 0, digest: p.sha256Bytes(Buffer.alloc(0)) };
  const commandBody = { ...command, exitStatus: 7, timedOut: false, processSignal: null, signalSequence: [], terminationConfirmed: true,
    stdout: empty, stderr: empty, reports: [], reportCount: 0 };
  const commandDigest = hash(commandBody);
  const commandResult = { kind: 'worksite_command_result', schemaVersion: '5.0.0', ...commandBody,
    observationRef: 'worksite-command-observation://abiogenesis/' + commandDigest.slice(7), observationDigest: commandDigest };
  const snapshotMembers = task.protectedObservations.map(row => ({ kind: 'worksite_snapshot_member', schemaVersion: '5.0.0',
    ordinal: row.ordinal, sourceMemberRef: row.sourceMemberRef, sourceObservationRef: row.observation.observationRef,
    sourceObservationDigest: row.observation.observationDigest, relativePath: row.subject.relativePath,
    byteLength: row.observation.byteLength, digest: row.observation.fileDigest }));
  const snapshotDigest = hash(snapshotMembers);
  const artifact = constructWorksiteExecutionHelperArtifact({ task, disposition: 'success', commandResults: [commandResult], predicateObservations: [],
    worksiteDelta: [], productDelta: [], snapshotRoot: plan.sandboxRoot, snapshotRef: 'worksite-command-snapshot://abiogenesis/' + snapshotDigest.slice(7),
    snapshotDigest, snapshotMembers, protectedBefore: task.protectedObservations.map(r => r.observation), protectedAfter: task.protectedObservations.map(r => r.observation) });
  const acknowledgment = { kind: 'worksite_command_execution_worker_result', schemaVersion: '5.0.0', taskRef: task.taskRef, taskDigest: task.taskDigest,
    attemptRef: plan.attemptRef, helperArtifactRef: artifact.artifactRef, helperArtifactDigest: artifact.artifactDigest };
  const actor = { actorRef: task.workerActorRef, workerBindingRef: task.workerBindingRef, implementationRef: ids.implementationRef,
    inputDigest: hash(task), transportLane: 'worker_executes', disposition: 'success', toolCallCount: 1,
    toolInvocations: [{ kind: 'worker_tool_invocation_evidence', schemaVersion: '5.0.0', ordinal: 0, toolName: 'Bash', toolUseRef: 'tool-use://component',
      inputDigest: plan.toolInputDigest, inputByteLength: plan.toolInputByteLength }], actorInvocationRef: 'actor-invocation://component',
    processRef: 'process://component', transportBindingRef: 'transport-binding://component', transportBindingDigest: hash('binding'), transportDigest: hash('transport') };
  const value = constructWorksiteExecutionObservation(task, acknowledgment, actor, artifact, plan);
  assert(p.isObservedWorksiteCommandExecutionObservation(value));
  assert.equal(semantics.validateContractValue(value.kind, value), true);
  const relation = semantics.resolveJudgmentRelation(ids.judgmentPredicateRef);
  assert(relation); assert.equal(relation.evaluate(task, value), true);
  assert.equal(value.commandResults[0].exitStatus, 7);
  assert.equal(relation.evaluate(p.constructObservedWorksiteCommandExecutionTask({ ...f.input, observedFiles: [f.input.observedFiles[0]] }), value), false);
  assert.throws(() => constructWorksiteExecutionObservation(task, { ...acknowledgment, taskDigest: hash('crossed') }, actor, artifact, plan));
});
