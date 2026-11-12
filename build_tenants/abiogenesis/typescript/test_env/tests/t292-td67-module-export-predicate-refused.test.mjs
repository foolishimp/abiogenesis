import test from 'node:test';
import assert from 'node:assert/strict';
import { product, componentTask, hash, observationFor } from '../support/c2-observation-carrier.mjs';
import { ABI5_PRODUCT_SEMANTICS as semantics } from '../../build/code/src/product/builtin_semantics.js';
import { realizeWorksiteCommandExecution } from '../../build/code/src/implementation/worksite_command_execution.js';

// TD-67 retired the C2 predicate kind that imported a worksite module into the
// helper. Each door below must give it exactly the outcome of a kind C2 never
// knew; the kept process_exit kind is the control that the door still admits.
const RETIRED = 'module_export_return_exact';
const UNKNOWN = 'td67_never_known_predicate_kind';
const DECLARATION = Object.freeze({ path: 'source.mjs', export: 'value', equals: 'value' });
const KEPT = Object.freeze({ validationCommandId: 'component:command', equals: 0 });
const C2 = product.WORKSITE_COMMAND_EXECUTION_IDS;
const outcome = (run) => { try { return { returned: run() }; } catch (error) { return { refused: `${error.name}: ${error.message}` }; } };
const row = (predicateKind, declaration = DECLARATION) => ({ predicateId: 'predicate://td67/check', predicateKind, declaration });
// The component task with its one predicate replaced and its identity recomputed
// the way the C2 task owner computes it, as a recorded or forged task would carry it.
function taskWith(predicateKind, declaration = DECLARATION) {
  const { kind, schemaVersion, taskRef: _ref, taskDigest: _digest, ...body } = componentTask();
  const next = { ...body, outcomePredicates: [{ kind: 'worksite_outcome_predicate', schemaVersion: '5.0.0', ordinal: 0,
    ...row(predicateKind, declaration) }] };
  const taskDigest = hash(next);
  return { kind, schemaVersion, taskRef: `worksite-command-execution-task://abiogenesis/${taskDigest.slice(7)}`, taskDigest, ...next };
}

test('TD-67: the C2 configuration input schema admits the retired kind no more than an unknown kind', async () => {
  const { default: Ajv } = await import('ajv');
  const schema = product.worksiteCommandConfigurationInputSchema();
  const validate = new Ajv({ strict: false }).compile({ type: 'object', additionalProperties: false,
    required: ['commands', 'outcomePredicates'], properties: schema });
  const command = { commandId: 'component:command', executable: 'node', args: ['--version'], relativeCwd: '.', environment: {},
    timeoutMs: 1000, terminationGraceMs: 100, expectedReports: [] };
  const admits = (predicate) => validate({ commands: [command], outcomePredicates: [predicate] });
  assert.equal(admits(row('process_exit', KEPT)), true, 'control: a kept kind');
  assert.equal(admits(row(UNKNOWN)), false, 'control: an unknown kind');
  assert.equal(admits(row(RETIRED)), false);
  assert.equal(schema.outcomePredicates.items.anyOf.some((arm) => arm.properties.predicateKind.const === RETIRED), false);
});

test('TD-67: the configuration owner and the C2 task constructor refuse the retired kind as an unknown kind', () => {
  const task = componentTask();
  const configure = (predicate) => outcome(() => product.constructWorksiteCommandConfiguration({
    workspaceAuthorityBasis: task.workspaceAuthorityBasis, workspaceBinding: task.workspaceBinding, commands: task.commands,
    outcomePredicates: [predicate], protectedSubjects: task.protectedObservations.map((r) => r.subject),
    allowedWriteTerritories: task.allowedWriteTerritories }, null).predicates.length);
  assert.deepEqual(configure(row('process_exit', KEPT)), { returned: 1 }, 'control: a kept kind');
  assert.deepEqual(configure(row(UNKNOWN)), { refused: 'TypeError: worksite outcome predicate requires exact id and kind' });
  assert.deepEqual(configure(row(RETIRED)), configure(row(UNKNOWN)));
  const construct = (predicate) => outcome(() => product.constructWorksiteCommandExecutionTask({
    workspaceAuthorityBasis: task.workspaceAuthorityBasis, workspaceBinding: task.workspaceBinding, capabilityGrant: task.capabilityGrant,
    sourceConstructionResultRef: task.sourceConstructionResultRef, sourceConstructionResultDigest: task.sourceConstructionResultDigest,
    sourceConstructionResult: task.sourceConstructionResult, commands: task.commands, outcomePredicates: [predicate],
    protectedObservations: task.protectedObservations, allowedWriteTerritories: task.allowedWriteTerritories }, null).taskDigest);
  assert.deepEqual(construct(row('process_exit', KEPT)), { returned: taskWith('process_exit', KEPT).taskDigest }, 'control: a kept kind');
  assert.deepEqual(construct(row(RETIRED)), configure(row(UNKNOWN)));
});

test('TD-67: a task carrying the retired kind fails every task guard, the task contract, the parent and the artifact owner', () => {
  const kept = taskWith('process_exit', KEPT), retired = taskWith(RETIRED), unknown = taskWith(UNKNOWN);
  assert.equal(product.isWorksiteCommandExecutionTask(kept), true, 'control: the identity recomputation is the owner\'s');
  for (const guard of ['isWorksiteCommandExecutionTask', 'isC2WorksiteCommandExecutionTask', 'isWorksiteExecutionTask']) {
    assert.equal(product[guard](retired), false, guard);
    assert.equal(product[guard](unknown), false, guard);
  }
  assert.notEqual(semantics.admitInput(C2.taskContractRef, kept), null, 'control: the C2 task contract');
  assert.equal(semantics.admitInput(C2.taskContractRef, retired), null);
  assert.equal(semantics.admitInput(C2.taskContractRef, unknown), null);
  const occurrence = { cCallRef: 'c-call://t292/td67', runId: 'run://t292/td67', graphCallId: 'graph-call://t292/td67',
    frameId: 'frame://t292/td67', programLocusRef: C2.nodeRef, taskOrdinal: 0, attempt: 1, executionAuthority: null };
  assert.deepEqual(outcome(() => realizeWorksiteCommandExecution(unknown, occurrence)),
    { refused: 'TypeError: command execution requires one exact admitted task' });
  assert.deepEqual(outcome(() => realizeWorksiteCommandExecution(retired, occurrence)),
    outcome(() => realizeWorksiteCommandExecution(unknown, occurrence)));
  assert.equal(observationFor(kept).observation.task.taskDigest, kept.taskDigest, 'control: the artifact and observation owners');
  const refused = outcome(() => observationFor(unknown));
  assert.ok(refused.refused, 'an unknown kind has no helper artifact');
  assert.deepEqual(outcome(() => observationFor(retired)), refused);
});
