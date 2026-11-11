import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as p from '../../build/code/src/product/index.js';
import { worksiteCommandExecutionHelperPlan, constructWorksiteExecutionHelperArtifact, constructWorksiteExecutionObservation } from '../../build/code/src/product/worksite_command_execution.js';
import { worksiteCommandSourcesInvalidatedAfter as invalidated } from '../../build/code/src/abg/native_worksite_execution.js';
import { runtimeHistorySelectorKeys } from '../../build/code/src/abg/runtime_history.js';
import { selectValidatedRuntimeEventPrefix, indexedRuntimeEvents } from '../../build/code/src/abg/event_prefix.js';
import { deepFreeze } from '../../build/code/src/shared/immutable.js';
import { loadWorksiteOwner, worksiteFixture } from '../support/t287-generic-job-worksite.mjs';
// The worksite-causality owner reads an admitted C2 command Result's own delta.
// Product command observations are constructed by their owners over an actual
// fixture worksite; the admitted Result rows are controlled cold-prefix rows.
const ids = p.WORKSITE_COMMAND_EXECUTION_IDS, hash = p.sha256Canonical, owner = await loadWorksiteOwner(), KEY = 'worksite-observation-dependency';
const time = '2026-11-11T00:00:00.000Z', REVIEWED = 'verification/review.md';
async function commandFixture(t) {
  const env = await worksiteFixture(owner);
  t.after(() => fs.rmSync(env.scratch, { recursive: true, force: true }));
  const observedFiles = [];
  for (const relativePath of ['source.txt', 'retained.txt']) {
    fs.writeFileSync(join(env.canonicalRoot, relativePath), `exact ${relativePath}\n`);
    const subject = owner.constructWorksiteSubject({ ...env, relativePath, subjectUri: pathToFileURL(join(env.canonicalRoot, relativePath)).href });
    observedFiles.push({ subject, observation: await owner.observeWorksiteSubject(env.workspaceAuthorityBasis, env.workspaceBinding, subject) });
  }
  const task = p.constructObservedWorksiteCommandExecutionTask({ workspaceAuthorityBasis: env.workspaceAuthorityBasis, workspaceBinding: env.workspaceBinding,
    capabilityGrant: env.capabilityGrant, observedFiles, commands: [{ commandId: 'command://delta/write', executable: 'node', args: ['--version'], relativeCwd: '.',
      environment: {}, timeoutMs: 1000, terminationGraceMs: 100, expectedReports: [] }], outcomePredicates: [],
    allowedWriteTerritories: [{ pathKind: 'subtree', relativePath: 'verification' }] });
  // One success observation per written path set, through the Product constructors.
  const observe = (written, attempt) => {
    const plan = worksiteCommandExecutionHelperPlan(task, 'attempt://delta/' + attempt);
    const { kind: _k, schemaVersion: _s, expectedReports: _r, ...command } = task.commands[0];
    const empty = { kind: 'worksite_observed_stream', schemaVersion: '5.0.0', encoding: 'base64', payload: '', byteLength: 0, digest: p.sha256Bytes(Buffer.alloc(0)) };
    const body = { ...command, exitStatus: 0, timedOut: false, processSignal: null, signalSequence: [], terminationConfirmed: true, stdout: empty, stderr: empty, reports: [], reportCount: 0 };
    const commandResult = { kind: 'worksite_command_result', schemaVersion: '5.0.0', ...body,
      observationRef: 'worksite-command-observation://abiogenesis/' + hash(body).slice(7), observationDigest: hash(body) };
    const snapshotMembers = task.protectedObservations.map(row => ({ kind: 'worksite_snapshot_member', schemaVersion: '5.0.0', ordinal: row.ordinal,
      sourceMemberRef: row.sourceMemberRef, sourceObservationRef: row.observation.observationRef, sourceObservationDigest: row.observation.observationDigest,
      relativePath: row.subject.relativePath, byteLength: row.observation.byteLength, digest: row.observation.fileDigest }));
    const worksiteDelta = written.map((relativePath, ordinal) => ({ kind: 'worksite_path_delta', schemaVersion: '5.0.0', ordinal, changeKind: 'created', relativePath, before: null,
      after: { kind: 'worksite_path_observation', schemaVersion: '5.0.0', relativePath, nodeKind: 'file', digest: p.sha256Bytes(Buffer.from(relativePath)), byteLength: relativePath.length, symlinkTarget: null },
      matchedTerritoryRef: task.allowedWriteTerritories[0].territoryRef }));
    const snapshotDigest = hash(snapshotMembers);
    const artifact = constructWorksiteExecutionHelperArtifact({ task, disposition: 'success', commandResults: [commandResult], predicateObservations: [], worksiteDelta, productDelta: [],
      snapshotRoot: plan.sandboxRoot, snapshotRef: 'worksite-command-snapshot://abiogenesis/' + snapshotDigest.slice(7), snapshotDigest, snapshotMembers,
      protectedBefore: task.protectedObservations.map(r => r.observation), protectedAfter: task.protectedObservations.map(r => r.observation) });
    const acknowledgment = { kind: 'worksite_command_execution_worker_result', schemaVersion: '5.0.0', taskRef: task.taskRef, taskDigest: task.taskDigest,
      attemptRef: plan.attemptRef, helperArtifactRef: artifact.artifactRef, helperArtifactDigest: artifact.artifactDigest };
    const actor = { actorRef: task.workerActorRef, workerBindingRef: task.workerBindingRef, implementationRef: ids.implementationRef, inputDigest: hash(task),
      transportLane: 'worker_executes', disposition: 'success', toolCallCount: 1, toolInvocations: [{ kind: 'worker_tool_invocation_evidence', schemaVersion: '5.0.0', ordinal: 0,
        toolName: 'Bash', toolUseRef: 'tool-use://delta', inputDigest: plan.toolInputDigest, inputByteLength: plan.toolInputByteLength }], actorInvocationRef: 'actor-invocation://delta/' + attempt,
      processRef: 'process://delta', transportBindingRef: 'transport-binding://delta', transportBindingDigest: hash('binding'), transportDigest: hash('transport') };
    const value = constructWorksiteExecutionObservation(task, acknowledgment, actor, artifact, plan);
    assert.equal(p.isObservedWorksiteCommandExecutionObservation(value), true);
    return value;
  };
  return { env, root: env.canonicalRoot, written: observe([REVIEWED], 'written'), unchanged: observe([], 'unchanged') };
}
const admitted = (value, over = {}, payload = {}) => ({ eventId: 'event://delta/pending', kind: 'c_call_result_admitted', aggregateType: 'c_call', aggregateId: 'call://delta/c2',
  parentAggregateId: null, causationEventRefs: [], eventTime: time, correlationId: 'correlation://delta', workflowVersion: '5.0.0', scopeClass: 'run', runId: 'run://delta',
  basisId: 'basis://delta/c2', graphCallId: 'graph-call://delta', graphFunctionRef: ids.graphFunctionRef, ...over,
  payload: { resultRef: 'result://delta/' + (over.aggregateId ?? 'c2'), resultDigest: hash(value), resultClass: 'success', contractRef: ids.observationContractRef, value, valueDigest: hash(value), ...payload } });
const prefixOf = rows => selectValidatedRuntimeEventPrefix(deepFreeze(rows.map((row, i) => ({ ...row, eventId: 'event://delta/' + (i + 1), admissionOrdinal: i + 1 }))));

test('a C2 command Result enters the worksite dependency index only when its admitted delta changed the worksite', async t => {
  const f = await commandFixture(t), written = admitted(f.written), unchanged = admitted(f.unchanged, { aggregateId: 'call://delta/unchanged' });
  assert.equal(runtimeHistorySelectorKeys(written).includes(KEY), true);
  assert.equal(runtimeHistorySelectorKeys(unchanged).includes(KEY), false, 'a command that changed nothing is no dependency');
  const prefix = prefixOf([unchanged, written]);
  assert.deepEqual(indexedRuntimeEvents(prefix, KEY).map(e => e.payload.value.observationRef), [f.written.observationRef]);
});

test('an admitted command delta invalidates a queried path or a path under a queried root after its ordinal, under its own root and producer', async t => {
  const f = await commandFixture(t), prefix = prefixOf([admitted(f.written)]);
  assert.equal(invalidated(prefix, 0, f.root, [REVIEWED]), true, 'selected exact path');
  assert.equal(invalidated(prefix, 0, f.root, [], ['verification']), true, 'read-roots form: a change under a directory dependency');
  assert.equal(invalidated(prefix, 0, f.root, [], [REVIEWED]), true, 'read-roots form: the exact path');
  assert.equal(invalidated(prefix, 0, f.root, ['verification']), false, 'the selected-paths form matches exactly; directory dependencies need the read-roots form');
  assert.equal(invalidated(prefix, 0, f.root, ['source.txt'], ['source.txt']), false, 'an unaffected path');
  assert.equal(invalidated(prefix, 1, f.root, [], ['.']), false, 'nothing after the Result ordinal');
  assert.equal(invalidated(prefix, 0, f.root + '-other', [], ['.']), false, 'another root');
  const tampered = { ...f.written, worksiteDelta: f.written.worksiteDelta.map(r => ({ ...r, relativePath: 'verification/other.md', after: { ...r.after, relativePath: 'verification/other.md' } })) };
  for (const [label, row] of [['wrapper foldback carrying the same value', admitted(f.written, { graphFunctionRef: p.governanceRef('graph-function', 'testing') })],
    ['failure class', admitted(f.written, {}, { resultClass: 'failure' })], ['other contract', admitted(f.written, {}, { contractRef: ids.failureContractRef })],
    ['unsealed delta', admitted(tampered)]]) {
    const other = prefixOf([row]);
    assert.equal(indexedRuntimeEvents(other, KEY).length, 1, label + ' is a keyed candidate');
    assert.equal(invalidated(other, 0, f.root, [], ['.']), false, label + ' is no admitted command effect');
  }
  assert.equal(invalidated(prefixOf([admitted(f.unchanged)]), 0, f.root, [], ['.']), false, 'a command that wrote nothing invalidates nothing');
});

test('a Testing command writing a reviewed artifact inside its permitted territory makes that review stale; an unaffected review stays current', async t => {
  const f = await commandFixture(t), order = { outcome: 'Review', instructions: [], readFirst: ['source.txt'], writeRoots: [], checks: [] };
  const reviewed = p.governanceAssessmentDependencies(order, { sources: ['source.txt'], candidatePath: REVIEWED, rubricPath: 'retained.txt' });
  const unaffected = p.governanceAssessmentDependencies(order, { sources: ['source.txt'], candidatePath: 'retained.txt', rubricPath: 'rubric.md' });
  assert.deepEqual(reviewed, ['source.txt', REVIEWED, 'retained.txt']);
  // The parent's review currentness query: the read-roots form over the dependency set.
  const current = (rows, dependencies) => !invalidated(prefixOf(rows), 0, f.root, [], dependencies);
  assert.equal(current([admitted(f.written)], reviewed), false, 'the written reviewed artifact retires the review');
  assert.equal(current([admitted(f.written)], unaffected), true);
  assert.equal(current([admitted(f.unchanged)], reviewed), true, 'a command that wrote nothing keeps the review current');
});
