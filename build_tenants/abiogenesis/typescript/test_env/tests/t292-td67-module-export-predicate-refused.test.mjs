import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { product, componentTask, hash, observationFor } from '../support/c2-observation-carrier.mjs';
import { loadWorksiteOwner, worksiteFixture } from '../support/t287-generic-job-worksite.mjs';
import { ABI5_PRODUCT_SEMANTICS as semantics } from '../../build/code/src/product/builtin_semantics.js';
import { realizeWorksiteCommandExecution } from '../../build/code/src/implementation/worksite_command_execution.js';
import { constructQualificationVerificationMaterial } from '../../build/code/src/validator/qualification.js';
import { constructQualificationIdentity } from '../../build/code/src/validator/qualification_contracts.js';

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

// One observed C2 observation built by the owners, with the inputs the
// qualification reader needs (the t287-qual056-material fixture, reduced).
const reporter = resolve(import.meta.dirname, '../../scripts/node-test-evidence-reporter.mjs');
const lint = resolve(import.meta.dirname, '../../scripts/lint-verification.mjs');
const stream = (text) => { const bytes = Buffer.from(text); return { kind: 'worksite_observed_stream', schemaVersion: '5.0.0', encoding: 'base64',
  payload: bytes.toString('base64'), byteLength: bytes.length, digest: product.sha256Bytes(bytes) }; };
async function readerFixture(t) {
  const owner = await loadWorksiteOwner(), env = await worksiteFixture(owner);
  t.after(() => fs.rmSync(env.scratch, { recursive: true, force: true }));
  const root = env.canonicalRoot, source = "import test from 'node:test';test('actual',()=>{});\n";
  fs.writeFileSync(join(root, 'a.test.mjs'), source);
  const run = (args) => { const childEnv = { ...process.env }; delete childEnv.NODE_TEST_CONTEXT;
    const out = spawnSync(process.execPath, args, { cwd: root, env: childEnv, encoding: 'utf8', timeout: 5000 }); assert.equal(out.status, 0, out.stderr); return out.stdout; };
  const testOut = run(['--test', '--test-concurrency=1', '--test-reporter=' + reporter, 'a.test.mjs']);
  const roles = ['build', 'lint', 'test', 'compare'];
  const commands = roles.map((role) => ({ commandId: 'command://' + role, executable: process.execPath, args: ['--version'], relativeCwd: '.',
    environment: {}, timeoutMs: 5000, terminationGraceMs: 100, expectedReports: [] }));
  const observed = async (path) => { const subject = owner.constructWorksiteSubject({ ...env, relativePath: path, subjectUri: pathToFileURL(join(root, path)).href });
    return { subject, observation: await owner.observeWorksiteSubject(env.workspaceAuthorityBasis, env.workspaceBinding, subject) }; };
  const input = { workspaceAuthorityBasis: env.workspaceAuthorityBasis, workspaceBinding: env.workspaceBinding, capabilityGrant: env.capabilityGrant,
    observedFiles: [await observed('a.test.mjs')], commands, outcomePredicates: [row('process_exit', { validationCommandId: 'command://test', equals: 0 })],
    allowedWriteTerritories: [{ pathKind: 'subtree', relativePath: 'verification' }] };
  const initial = product.constructObservedWorksiteCommandExecutionTask(input);
  const recipe = { kind: 'qualification_verification_recipe', schemaVersion: '1', sourceInputs: [{ memberRef: 'source://a', relativePath: 'a.test.mjs' }],
    auxiliaryInputs: [], commandConfigurationDigest: hash(initial.commands), predicateConfigurationDigest: hash(initial.outcomePredicates),
    writeTerritoriesDigest: hash(initial.allowedWriteTerritories), commands: roles.map((role) => ({ commandId: 'command://' + role, role })),
    lint: { commandId: 'command://lint', files: [{ path: 'a.test.mjs', kind: 'mjs' }] }, tests: [{ commandId: 'command://test', files: ['a.test.mjs'] }],
    skipPolicy: 'incomplete', reportFormat: 'node-test-events-jsonl@1' };
  const recipeBytes = Buffer.from(JSON.stringify(recipe)); fs.writeFileSync(join(root, 'recipe.json'), recipeBytes);
  input.observedFiles.push(await observed('recipe.json'));
  const task = product.constructObservedWorksiteCommandExecutionTask(input), plan = product.worksiteCommandExecutionHelperPlan(task, 'attempt://td67/reader');
  const lintOut = run([lint, 'recipe.json']);
  const commandResults = task.commands.map((c) => { const { kind, schemaVersion, expectedReports, ...body } = c;
    Object.assign(body, { stdout: stream(c.commandId === 'command://test' ? testOut : c.commandId === 'command://lint' ? lintOut : ''), stderr: stream(''),
      exitStatus: 0, timedOut: false, processSignal: null, signalSequence: [], terminationConfirmed: true, reports: [], reportCount: 0 });
    const digest = hash(body); return { kind: 'worksite_command_result', schemaVersion: '5.0.0', ...body,
      observationRef: 'worksite-command-observation://abiogenesis/' + digest.slice(7), observationDigest: digest }; });
  const testResult = commandResults.find((c) => c.commandId === 'command://test');
  const predicateObservations = [{ kind: 'worksite_predicate_observation', schemaVersion: '5.0.0', ordinal: 0, predicateId: 'predicate://td67/check',
    predicateKind: 'process_exit', observedValue: 0, evidence: [{ kind: 'worksite_command_observation_coordinate', schemaVersion: '5.0.0',
      ref: testResult.observationRef, digest: testResult.observationDigest }], evidenceRefs: [testResult.observationRef] }];
  const snapshotMembers = task.protectedObservations.map((r) => ({ kind: 'worksite_snapshot_member', schemaVersion: '5.0.0', ordinal: r.ordinal,
    sourceMemberRef: r.sourceMemberRef, sourceObservationRef: r.observation.observationRef, sourceObservationDigest: r.observation.observationDigest,
    relativePath: r.subject.relativePath, byteLength: r.observation.byteLength, digest: r.observation.fileDigest }));
  const snapshotDigest = hash(snapshotMembers);
  const artifact = product.constructWorksiteExecutionHelperArtifact({ task, disposition: 'success', commandResults, predicateObservations,
    worksiteDelta: [], productDelta: [], snapshotRoot: plan.sandboxRoot, snapshotRef: 'worksite-command-snapshot://abiogenesis/' + snapshotDigest.slice(7),
    snapshotDigest, snapshotMembers, protectedBefore: task.protectedObservations.map((r) => r.observation),
    protectedAfter: task.protectedObservations.map((r) => r.observation) });
  const actor = { actorRef: task.workerActorRef, workerBindingRef: task.workerBindingRef, implementationRef: C2.implementationRef, inputDigest: hash(task),
    transportLane: 'worker_executes', disposition: 'success', toolCallCount: 1, toolInvocations: [{ kind: 'worker_tool_invocation_evidence', schemaVersion: '5.0.0',
      ordinal: 0, toolName: 'Bash', toolUseRef: 'tool://td67', inputDigest: plan.toolInputDigest, inputByteLength: plan.toolInputByteLength }],
    actorInvocationRef: 'actor://td67', processRef: 'process://td67', transportBindingRef: 'transport://td67', transportBindingDigest: hash('transport'),
    transportDigest: hash('transport') };
  const ack = { kind: 'worksite_command_execution_worker_result', schemaVersion: '5.0.0', taskRef: task.taskRef, taskDigest: task.taskDigest,
    attemptRef: plan.attemptRef, helperArtifactRef: artifact.artifactRef, helperArtifactDigest: artifact.artifactDigest };
  const observation = product.constructWorksiteExecutionObservation(task, ack, actor, artifact, plan);
  const recipeMaterial = { ref: 'source://recipe', path: 'recipe.json', digest: product.sha256Bytes(recipeBytes), byteCount: recipeBytes.length,
    contentBase64: recipeBytes.toString('base64') };
  const inventory = constructQualificationIdentity({ kind: 'qualification_subject_inventory', coverage: 'complete_claim', selectedRoots: ['.'], members: [
    { ref: 'source://a', path: 'a.test.mjs', digest: product.sha256Bytes(Buffer.from(source)), byteCount: Buffer.byteLength(source), surfaceRoles: ['proof'], classificationEvidenceRefs: [] },
    { ref: recipeMaterial.ref, path: recipeMaterial.path, digest: recipeMaterial.digest, byteCount: recipeMaterial.byteCount, surfaceRoles: ['qualification'], classificationEvidenceRefs: [] }] },
  'inventoryRef', 'inventoryDigest', 'qualification-inventory://abiogenesis/');
  return { artifact, reader: { basis: { basisRef: 'basis://td67', basisDigest: hash('basis'), lawBasis: { ref: 'law://td67', digest: hash('law') },
    sourceInventory: { ref: inventory.inventoryRef, digest: inventory.inventoryDigest } }, inventory, observation,
    selection: { executionSelectionRef: 'execution://td67', recipe: recipeMaterial, recipePath: 'recipe.json' },
    execution: { ref: 'result://td67', digest: hash(observation) }, cCall: { ref: 'c-call://td67', digest: hash('call') } } };
}
// The same observation with its one predicate replaced and every identity in the
// chain recomputed as the owners compute it (task, helper plan, helper artifact,
// provenance, observation), as a recorded or forged observation would carry it.
function observationWith(f, predicateKind, declaration, observedValue, evidence) {
  const before = f.reader.observation, plan0 = before.provenance.helperPlan;
  const { kind, schemaVersion, taskRef, taskDigest: oldDigest, ...body } = before.task;
  const nextBody = { ...body, outcomePredicates: [{ ...body.outcomePredicates[0], predicateKind, declaration }] };
  const taskDigest = hash(nextBody), task = { kind, schemaVersion, taskRef: taskRef.slice(0, -64) + taskDigest.slice(7), taskDigest, ...nextBody };
  const swap = (text) => text.replaceAll(oldDigest.slice(7), taskDigest.slice(7));
  const taskBytes = Buffer.from(product.canonicalJson(task) + '\n'), toolCommand = swap(plan0.toolCommand);
  const toolInput = Buffer.from(product.canonicalJson({ command: toolCommand }));
  const plan = { ...plan0, taskManifestPath: swap(plan0.taskManifestPath), artifactPath: swap(plan0.artifactPath), sandboxRoot: swap(plan0.sandboxRoot),
    taskManifestDigest: product.sha256Bytes(taskBytes), taskManifestByteLength: taskBytes.length, toolCommand,
    toolInputDigest: product.sha256Bytes(toolInput), toolInputByteLength: toolInput.length };
  const { kind: artifactKind, schemaVersion: artifactVersion, artifactRef, artifactDigest: _a, ...artifact0 } = f.artifact;
  const artifactBody = { ...artifact0, taskRef: task.taskRef, taskDigest, snapshotRoot: plan.sandboxRoot,
    predicateObservations: [{ ...artifact0.predicateObservations[0], predicateKind, observedValue, evidence, evidenceRefs: evidence.map((e) => e.ref) }] };
  const artifactDigest = hash(artifactBody);
  const artifact = { kind: artifactKind, schemaVersion: artifactVersion, artifactRef: artifactRef.slice(0, -64) + artifactDigest.slice(7), artifactDigest, ...artifactBody };
  const { kind: observationKind, schemaVersion: observationVersion, observationRef, observationDigest: _o, ...observation0 } = before;
  const observationBody = { ...observation0, task, helperArtifactRef: artifact.artifactRef, helperArtifactDigest: artifactDigest,
    predicateObservations: artifact.predicateObservations, provenance: { ...observation0.provenance, helperPlan: plan, helperArtifactPath: plan.artifactPath,
      helperArtifactRef: artifact.artifactRef, helperArtifactDigest: artifactDigest, helperArtifactByteLength: Buffer.byteLength(product.canonicalJson(artifact) + '\n'),
      helperToolInvocation: { ...observation0.provenance.helperToolInvocation, inputDigest: plan.toolInputDigest, inputByteLength: plan.toolInputByteLength } } };
  const observationDigest = hash(observationBody);
  return { ...f.reader, observation: { kind: observationKind, schemaVersion: observationVersion,
    observationRef: observationRef.slice(0, -64) + observationDigest.slice(7), observationDigest, ...observationBody } };
}

test('TD-67: the qualification reader and judge guard give an observation carrying the retired kind no material, as an unknown kind', async (t) => {
  const f = await readerFixture(t);
  assert.notEqual(constructQualificationVerificationMaterial(f.reader), null, 'control: the owners\' observation');
  // The re-identified chain is exact: a kept kind swapped in the same way is admitted.
  const compare = f.reader.observation.commandResults.find((c) => c.commandId === 'command://compare');
  const keptSwap = observationWith(f, 'stdout_exact', { validationCommandId: 'command://compare', equals: '' }, '',
    [{ kind: 'worksite_command_observation_coordinate', schemaVersion: '5.0.0', ref: compare.observationRef, digest: compare.observationDigest }]);
  assert.equal(product.isObservedWorksiteCommandExecutionObservation(keptSwap.observation), true, 'control: a kept kind re-identified');
  assert.notEqual(constructQualificationVerificationMaterial(keptSwap), null, 'control: a kept kind re-identified');
  // The retired kind as the base helper recorded it: the module file's source observation is its evidence.
  const sourceRow = f.reader.observation.task.protectedObservations.find((r) => r.subject.relativePath === 'a.test.mjs');
  const sourceEvidence = [{ kind: 'worksite_observation_coordinate', schemaVersion: '5.0.0', ref: sourceRow.observation.observationRef,
    digest: sourceRow.observation.observationDigest }];
  const declaration = { path: 'a.test.mjs', export: 'value', equals: 'value' };
  const retired = observationWith(f, RETIRED, declaration, 'value', sourceEvidence);
  const unknown = observationWith(f, UNKNOWN, declaration, 'value', sourceEvidence);
  // The judge (abg/qualification_proof.ts) admits verification material only past this same guard.
  assert.equal(product.isObservedWorksiteCommandExecutionObservation(unknown.observation), false);
  assert.equal(product.isObservedWorksiteCommandExecutionObservation(retired.observation), false);
  assert.equal(constructQualificationVerificationMaterial(unknown), null);
  assert.equal(constructQualificationVerificationMaterial(retired), null);
});
