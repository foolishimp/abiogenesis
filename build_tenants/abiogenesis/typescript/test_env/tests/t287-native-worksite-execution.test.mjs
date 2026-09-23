import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import { loadWorksiteOwner, worksiteFixture } from '../support/t287-generic-job-worksite.mjs';
import * as p from '../../build/code/src/product/index.js';
import { constructNativeWorkspaceWorkObservation } from '../../build/code/src/product/native_workspace_work.js';
import { deepFreeze } from '../../build/code/src/shared/immutable.js';
import { selectValidatedRuntimeEventPrefix, validatedRuntimeEventPrefixBeforeEvent } from '../../build/code/src/abg/event_prefix.js';
import { projectNativeWorkCommandSourceAtPrefix } from '../../build/code/src/abg/native_worksite_execution.js';
import { deriveInvocationSourceResultBasisAtPrefix } from '../../build/code/src/abg/invocation_admission.js';
import { projectExactInvocationAdmissionAtPrefix } from '../../build/code/src/abg/invocation_execution_truth.js';
import { ABI5_WORKSITE_COMMAND_EXECUTION_PRODUCT_SEMANTICS as semantics } from '../../build/code/src/product/builtin_semantics.js';
import { realizeWorksiteCommandExecution } from '../../build/code/src/implementation/worksite_command_execution.js';
import { worksiteCommandExecutionHelperPlan, renderWorksiteCommandExecutionPrompt,
  worksiteCommandExecutionWorkerResultSchema } from '../../build/code/src/product/worksite_command_execution.js';
const owner = await loadWorksiteOwner();
const ids = p.WORKSITE_COMMAND_EXECUTION_IDS;
const hash = value => owner.sha256Canonical(value);
function inputFor(source, paths) {
  return { workspaceAuthorityBasis: source.task.workspaceAuthorityBasis, workspaceBinding: source.task.workspaceBinding,
    capabilityGrant: source.task.capabilityGrant, sourceNativeWork: source,
    selectedSources: paths.map(relativePath => ({ relativePath,
      subjectUri: pathToFileURL(join(source.task.workspaceAuthorityBasis.canonicalRoot, relativePath)).href })),
    commands: [{ commandId: 'command://native-c2/component', executable: 'node', args: ['--version'], relativeCwd: '.',
      environment: {}, timeoutMs: 1000, terminationGraceMs: 100, expectedReports: [] }],
    outcomePredicates: [{ predicateId: 'predicate://native-c2/exit', predicateKind: 'process_exit',
      declaration: { equals: 0, validationCommandId: 'command://native-c2/component' } }],
    allowedWriteTerritories: [{ pathKind: 'subtree', relativePath: 'evidence' }] };
}
async function fixture(t) {
  const env = await worksiteFixture(owner); t.after(() => fs.rm(env.scratch, { recursive: true, force: true }));
  await fs.writeFile(join(env.canonicalRoot, 'changed.txt'), 'before');
  await fs.writeFile(join(env.canonicalRoot, 'unchanged.txt'), 'retained');
  const observe = () => owner.observeWorksiteContext({ ...env, readRoots: ['changed.txt', 'unchanged.txt'], maxFiles: 2, maxBytes: 1000 });
  const task = p.constructNativeWorkspaceWorkTask({ workspaceAuthorityBasis: env.workspaceAuthorityBasis, workspaceBinding: env.workspaceBinding, capabilityGrant: env.capabilityGrant, context: await observe(), outcome: 'local edit', instructions: ['Preserve retained source.'],
    readFirst: ['changed.txt'], writeRoots: ['changed.txt'], checks: [] });
  await fs.writeFile(join(env.canonicalRoot, 'changed.txt'), 'after');
  // Cold Product value only. The ABG absent-source check below refuses it.
  const source = constructNativeWorkspaceWorkObservation(task, await observe(), { summary: 'edited', gaps: [] }, {
    cCallRef: 'c-call://native-c2/component', executionAuthorityRef: 'authority://native-c2/component', executionAuthorityDigest: hash({ a: 1 }),
    actorInvocationRef: 'actor-invocation://native-c2/component', transportBindingRef: 'transport://native-c2/component',
    transportBindingDigest: hash({ t: 1 }), promptDigest: hash({ p: 1 }), transportDigest: hash({ t: 2 }) });
  return { ...env, source, input: inputFor(source, ['changed.txt', 'unchanged.txt']) };
}
test('native C2 selects changed and unchanged files without acquiring C1 identity', async t => {
  const env = await fixture(t), task = p.constructNativeWorksiteCommandExecutionTask(env.input);
  assert.equal(p.isC2WorksiteCommandExecutionTask(task), true);
  assert.equal(p.isWorksiteCommandExecutionTask(task), false);
  assert.equal('sourceConstructionResult' in task, false);
  assert.deepEqual(task.protectedObservations.map(r => r.subject.relativePath), ['changed.txt', 'unchanged.txt']);
  assert.equal(task.protectedObservations[1].observation.fileDigest, env.source.after.entries.find(e => e.relativePath === 'unchanged.txt').digest);
  assert.equal(p.isNativeWorksiteCommandExecutionTask(JSON.parse(JSON.stringify(task))), true);
  assert.deepEqual(semantics.resolveProbabilisticWorkerContracts({ inputContractRef: ids.taskContractRef,
    outputContractRef: ids.observationContractRef, input: task }), { instructionContractRef: ids.taskContractRef, resultContractRef: ids.workerResultContractRef });
  const plan = worksiteCommandExecutionHelperPlan(task, 'attempt://native-c2/component');
  const prompt = renderWorksiteCommandExecutionPrompt(task, plan);
  assert(prompt.includes(env.source.observationRef)); assert(!prompt.includes('sourceConstructionResultRef'));
  assert.equal(worksiteCommandExecutionWorkerResultSchema(task, plan).properties.taskDigest.const, task.taskDigest);
});
test('native C2 refuses missing, duplicate, crossed and counterfeit source selections', async t => {
  const env = await fixture(t);
  for (const patch of [{ selectedSources: [] }, { selectedSources: [...env.input.selectedSources, env.input.selectedSources[0]] },
    { selectedSources: [{ relativePath: 'missing.txt', subjectUri: pathToFileURL(join(env.canonicalRoot, 'missing.txt')).href }] },
    { workspaceBinding: { ...env.workspaceBinding, bindingId: 'workspace-binding://foreign' } }])
    assert.throws(() => p.constructNativeWorksiteCommandExecutionTask({ ...env.input, ...patch }));
  const task = p.constructNativeWorksiteCommandExecutionTask(env.input);
  assert.equal(p.isNativeWorksiteCommandExecutionTask({ ...task, sourceConstructionResult: {} }), false);
  assert.equal(projectNativeWorkCommandSourceAtPrefix(selectValidatedRuntimeEventPrefix(deepFreeze([])), task), null);
});
test('changed physical source refuses before archive publication or native dispatch', async t => {
  const env = await fixture(t), task = p.constructNativeWorksiteCommandExecutionTask(env.input);
  await fs.writeFile(join(env.canonicalRoot, 'unchanged.txt'), 'later contents');
  assert.throws(() => realizeWorksiteCommandExecution(task, { cCallRef: 'c-call://native-c2/currentness', runId: 'run://native-c2/component',
    graphCallId: 'graph-call://native-c2/component', frameId: 'frame://native-c2/component', programLocusRef: ids.nodeRef,
    taskOrdinal: null, attempt: 1, executionAuthority: null }), /protected worksite observation changed/);
  await assert.rejects(fs.stat(env.workspaceBinding.roots.archiveRoot), { code: 'ENOENT' });
});
const retainedPath = process.env.ABG_NATIVE_EXECUTION_RETAINED_LOG;
test('retained actual native producer joins C2 source admission; absent and foreign origins refuse', { skip: retainedPath === undefined }, async t => {
  const start = performance.now();
  const bytes = await fs.readFile(retainedPath), events = deepFreeze(bytes.toString('utf8').trim().split('\n').map(JSON.parse));
  const prefix = selectValidatedRuntimeEventPrefix(events), parsed = performance.now();
  const result = events.find(e => e.kind === 'c_call_result_admitted' && e.graphFunctionRef === p.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef &&
    e.payload.value?.kind === 'native_workspace_work_observation');
  assert(result);
  const source = result.payload.value;
  const paths = source.after.entries.filter(e => e.state === 'file' && !e.relativePath.startsWith('.abiogenesis/')).map(e => e.relativePath);
  const task = p.constructNativeWorksiteCommandExecutionTask(inputFor(source, paths));
  const projection = projectNativeWorkCommandSourceAtPrefix(prefix, task), projected = performance.now();
  assert(projection); assert.equal(projection.sourceResult.eventId, result.eventId);
  assert.equal(projectNativeWorkCommandSourceAtPrefix(validatedRuntimeEventPrefixBeforeEvent(prefix, result.eventId), task), null);
  const otherSource = constructNativeWorkspaceWorkObservation(source.task, source.after, source.report,
    { ...source.provenance, cCallRef: 'c-call://native-c2/foreign' });
  assert.equal(projectNativeWorkCommandSourceAtPrefix(prefix, p.constructNativeWorksiteCommandExecutionTask(inputFor(otherSource, paths))), null);
  const invocation = projectExactInvocationAdmissionAtPrefix(prefix, projection.sourceBasis.invocationAdmissionRef);
  assert(invocation);
  const basis = deriveInvocationSourceResultBasisAtPrefix(prefix, { publicAuthorityDigest: invocation.publicRequestDigest,
    invocationAdmissionRef: invocation.invocationAdmissionRef, runtimeInvocationRef: invocation.invocationRef,
    runId: result.runId, resultRef: result.payload.resultRef });
  assert(basis);
  const admission = { input: task, sourceResultBasis: basis, workspaceId: task.workspaceBinding.workspaceId,
    workspaceBindingId: task.workspaceBinding.bindingId, workspaceBindingDigest: task.workspaceBinding.bindingDigest };
  assert.equal(semantics.validateInvocationBasis(admission), true);
  assert.equal(semantics.validateInvocationBasis({ ...admission, sourceResultBasis: null }), false);
  assert.equal(semantics.validateInvocationBasis({ ...admission, sourceResultBasis: { ...basis, sourceCCallRef: 'c-call://foreign' } }), false);
  t.diagnostic(JSON.stringify({ retainedPath, bytes: bytes.length, events: events.length, sourceResult: result.eventId,
    sourceTaskDigest: hash(source.task), selectedFiles: paths.length, readParseValidateMs: parsed - start,
    constructionAndSourceProjectionMs: projected - parsed, wholeCheckMs: performance.now() - start,
    limit: 'Historical admitted source and current pure source/admission predicates; no new C2 Run, child admission, helper execution or native call.' }));
});

// Projection counterexample, not a new admitted Run: preserve the real source
// prefix and append canonical event fixtures for the C2 cut and later residue.
test('native source currentness includes admitted failed-write residue after the child basis cut', { skip: retainedPath === undefined }, async t => {
  const { projectRuntimeEventFromValidatedHistory } = await import('../../build/code/src/abg/event_store.js');
  const { isNativeWorkspaceWorkFailure } = await import('../../build/code/src/product/native_workspace_work.js');
  const all = deepFreeze((await fs.readFile(retainedPath, 'utf8')).trim().split('\n').map(JSON.parse));
  const result = all.find(e => e.kind === 'c_call_result_admitted' && e.graphFunctionRef === p.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef &&
    e.payload.value?.kind === 'native_workspace_work_observation');
  const source = result.payload.value;
  const closed = all.find(e => e.kind === 'graph_call_closed' && e.graphCallId === result.graphCallId);
  const history = all.filter(e => e.admissionOrdinal <= closed.admissionOrdinal);
  const selectedPath = source.changedPaths.find(path => source.after.entries.some(e => e.relativePath === path && e.state === 'file'));
  assert(selectedPath);
  const task = p.constructNativeWorksiteCommandExecutionTask(inputFor(source, [selectedPath]));
  const candidateOf = event => {
    const { eventId, admissionOrdinal, payloadDigest, eventContractDigest, ...candidate } = event;
    return candidate;
  };
  const originalBasis = all.find(e => e.eventId === projectNativeWorkCommandSourceAtPrefix(
    selectValidatedRuntimeEventPrefix(deepFreeze(history)), task).sourceBasis.admissionEventRef);
  const childBasisRef = 'execution-basis://native-c2/counterexample-child';
  const childBasis = projectRuntimeEventFromValidatedHistory(history, { ...candidateOf(originalBasis),
    basisId: childBasisRef, causationEventRefs: [closed.eventId],
    payload: { ...originalBasis.payload, basisRef: childBasisRef, rawInputValue: task, rawInputDigest: hash(task) } });
  const beforeResidue = deepFreeze([...history, childBasis]);
  const { kind, schemaVersion, observationRef, observationDigest, ...contextBody } = source.after;
  const replacement = Buffer.from('later failed-write residue\n');
  const changedBody = { ...contextBody, entries: contextBody.entries.map(e => e.relativePath === selectedPath
    ? { ...e, bytes: replacement.toString('base64'), byteLength: replacement.length, digest: owner.sha256Bytes(replacement) } : e) };
  const changedDigest = hash(changedBody);
  const after = { kind, schemaVersion, observationRef: `worksite-context-observation://abiogenesis/${changedDigest.slice(7)}`,
    observationDigest: changedDigest, ...changedBody };
  const failure = { kind: 'native_workspace_work_failure', schemaVersion: '5.0.0', failureClass: 'result_contract_failure',
    diagnosticRef: 'diagnostic://native-c2/counterexample-residue', task: { ...source.task, context: source.after },
    before: source.after, after, changedPaths: [selectedPath], observationFailure: null, report: null,
    provenance: { ...source.provenance, cCallRef: 'c-call://native-c2/later-failed-writer',
      actorInvocationRef: 'actor-invocation://native-c2/later-failed-writer' } };
  assert.equal(isNativeWorkspaceWorkFailure(failure), true);
  const residue = projectRuntimeEventFromValidatedHistory(beforeResidue, { ...candidateOf(result),
    aggregateId: failure.provenance.cCallRef, causationEventRefs: [childBasis.eventId],
    payload: { ...result.payload, cCallRef: failure.provenance.cCallRef, contractRef: p.NATIVE_WORKSPACE_WORK_IDS.failureContractRef,
      resultClass: 'failure', valueKind: failure.kind, value: failure, valueDigest: hash(failure) } });
  const held = selectValidatedRuntimeEventPrefix(deepFreeze([...beforeResidue, residue]));
  const historical = validatedRuntimeEventPrefixBeforeEvent(held, childBasis.eventId);
  // NATIVEEXEC01 supplied this historical cut and therefore missed the residue.
  assert(projectNativeWorkCommandSourceAtPrefix(historical, task));
  // NATIVEEXEC02 supplies the latest held prefix before effects.
  assert.equal(projectNativeWorkCommandSourceAtPrefix(held, task), null);
  t.diagnostic(JSON.stringify({ sourceOrdinal: result.admissionOrdinal, childBasisOrdinal: childBasis.admissionOrdinal,
    laterFailureOrdinal: residue.admissionOrdinal, selectedPath, historicalCutAccepts: true, latestHeldPrefixRefuses: true,
    limit: 'Pure owner projection over canonical counterexample event fixtures; no new runtime admission or physical write.' }));
});
