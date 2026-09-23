import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import { loadWorksiteOwner, worksiteFixture } from '../support/t287-generic-job-worksite.mjs';
import * as p from '../../build/code/src/product/index.js';
import { constructNativeWorkspaceWorkObservation } from '../../build/code/src/product/native_workspace_work.js';
import { worksiteCommandExecutionAttemptRef } from '../../build/code/src/abg/instruction_assembly.js';
import { constructWorksiteCommandExecutionModulePublication } from '../../build/code/src/gtl/worksite_command_execution.js';
import { worksiteCommandExecutionHelperPlan, worksiteCommandExecutionWorkerResultSchema } from '../../build/code/src/product/worksite_command_execution.js';
const owner = await loadWorksiteOwner(), hash = p.sha256Canonical, ids = p.WORKSITE_COMMAND_EXECUTION_IDS;
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

test('declared command-executor assembly accepts native C2 and keeps exact task, owner and context refusals', async t => {
  const env = await fixture(t), task = p.constructNativeWorksiteCommandExecutionTask(env.input);
  const publication = constructWorksiteCommandExecutionModulePublication({ productId: p.ABI5_PRODUCT_ID,
    packageName: p.ABI5_PACKAGE_NAME, packageVersion: p.ABI5_PACKAGE_VERSION,
    artifactDigest: hash('uninstalled-component'), productContentDigest: hash('uninstalled-content'),
    productManifestDigest: hash('uninstalled-manifest') });
  const graphFunction = publication.graphFunctions.find(g => g.name === ids.graphFunctionRef);
  const basis = { publication, graphFunction, predecessorPrefix: { coordinateDigest: hash('component-prefix') } };
  const call = { regime: 'F_P', cCallRef: 'c-call://native-c2/assembly', cCallDigest: hash('call'),
    runId: 'run://native-c2/assembly', graphCallId: 'graph-call://native-c2/assembly', frameId: 'frame://native-c2/assembly',
    taskOrdinal: null, attempt: 1, programLocusRef: ids.nodeRef, graphFunctionRef: ids.graphFunctionRef,
    implementationRef: ids.implementationRef, inputContractRef: ids.taskContractRef, outputContractRef: ids.observationContractRef };
  let ownerValue = { inputRef: 'raw-input://native-c2/component', inputDigest: hash(task), inputValue: task, call,
    execution: { basisRef: 'execution-basis://component', basisDigest: hash('basis'), invocationAdmissionRef: 'invocation://component', programRef: ids.programRef } };
  const selectedContext = { invocationAdmissionRef: 'invocation://component', environmentRef: 'environment://component',
    environmentDigest: hash('environment'), evidenceDigest: hash('evidence'), graphFunctionRef: ids.graphFunctionRef,
    programLocusRef: ids.nodeRef, frameRefs: ['frame://component/command-executor'],
    policy: { policyRef: 'policy://component', digest: hash('policy') },
    contextPolicy: { policyRef: 'context-policy://component', selectors: ['current_worksite', 'admitted_execution_evidence'] },
    contextPolicyDigest: hash('context'), sourceContent: [], accessContent: [] };
  let context = selectedContext;
  // Bounded component seam only: authentication/context dependencies are controlled;
  // real Product predicates, declared leaf role, helper plan, prompt and schema execute.
  // The retained historical discriminator separately checks actual owner authentication.
  const implementationPath = fileURLToPath(new URL('../../build/code/src/abg/instruction_assembly.js', import.meta.url));
  const module = new SourceTextModule(readFileSync(implementationPath, 'utf8'), { identifier: implementationPath });
  await module.link(async specifier => {
    const native = await import(specifier.startsWith('node:') ? specifier : pathToFileURL(resolve(dirname(implementationPath), specifier)).href);
    const values = { ...native,
      ...(specifier === './execution_basis.js' ? { authenticateNativeInstructionAssemblyBasis: () => ownerValue } : {}),
      ...(specifier === './stdo_environment.js' ? { projectRunEnvironmentRoleEvidence: () => context } : {}) };
    return new SyntheticModule(Object.keys(values), function () { for (const [k,v] of Object.entries(values)) this.setExport(k,v); });
  });
  await module.evaluate();
  const construct = module.namespace.constructWorksiteNativeInstructionAssembly;
  assert.equal(p.isWorksiteCommandExecutionTask(task), false, 'native task is not relabelled C1');
  assert.equal(p.isNativeWorksiteCommandExecutionTask(task), true);
  const assembly = construct(basis, task); assert(assembly);
  assert.equal(assembly.plan.role, 'command_executor');
  assert.equal(assembly.request.inputDigest, hash(task));
  assert.deepEqual(assembly.request.responseJsonSchema, worksiteCommandExecutionWorkerResultSchema(task,
    worksiteCommandExecutionHelperPlan(task, worksiteCommandExecutionAttemptRef(call))));
  assert.equal(construct(basis, { ...task, taskDigest: hash('foreign-task') }), null);
  const originalOwner = ownerValue;
  ownerValue = null; assert.equal(construct(basis, task), null, 'stale or absent admitted owner refuses');
  ownerValue = { ...originalOwner, call: { ...call, implementationRef: 'implementation://foreign' } };
  assert.equal(construct(basis, task), null);
  ownerValue = originalOwner; context = false; assert.equal(construct(basis, task), null, 'unavailable role evidence refuses');
  context = { ...selectedContext, contextPolicy: { ...selectedContext.contextPolicy, selectors: ['current_worksite'] } };
  assert.equal(construct(basis, task), null, 'missing admitted execution evidence selector refuses');
});
