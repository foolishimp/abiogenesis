import assert from 'node:assert/strict';
import test from 'node:test';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {appendFile, cp, mkdir, mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {SourceTextModule, SyntheticModule} from 'node:vm';
import {Effect} from 'effect';
import {installTenantOnce, openCaseEnvironment, setupInstalledRootExecutionBasis, publicOperationBasis} from '../support/root-installed-environment.mjs';
import {pendingExecutionUseRequest, constructInstalledPendingCall} from '../support/registered-graph-selection.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const run = promisify(execFile);
const at = (env, member) => import(pathToFileURL(join(env.installedRoot, 'build/code/src', member + '.js')).href);
const coord = binding => ({ref: binding.bindingId, digest: binding.bindingDigest});
const time = '2026-11-13T00:00:00.000Z';
const runtime = label => ({eventTime: time, correlationId: `correlation://td78/${label}`, causationEventRefs: []});
const resource = (product, handoff) => ({kind: 'reopen_abg_event_resource', schemaVersion: '5.0.0',
  closeHandoff: handoff, handoffDigest: product.sha256Canonical(handoff)});
const envelope = (env, label) => ({definitionContractCoordinates: env.verified.definitionContractCoordinates,
  requestRef: `request://td78/${label}`, correlationRef: `correlation://td78/${label}`,
  eventTime: time, provenanceRefs: ['provenance://td78/model-free']});

// Two fully regenerated, verified and installed Products have the same name,
// version, capability register and behavior, and different payload bytes. The
// second has a comment in a shipped JS file; neither manifest is forged.
async function otherProduct(t) {
  const destination = await mkdtemp(join(tmpdir(), 'td78-other-product-'));
  t.after(() => rm(destination, {recursive: true, force: true}));
  for (const name of ['build', 'contracts', 'scripts', 'node_modules', 'package.json', 'package-lock.json'])
    await cp(join(root, name), join(destination, name), {recursive: true});
  await mkdir(join(destination, 'test_env/fixtures'), {recursive: true});
  await cp(join(root, 'test_env/fixtures/abi5-root-candidate-basis.json'), join(destination, 'test_env/fixtures/abi5-root-candidate-basis.json'));
  await appendFile(join(destination, 'build/code/src/index.js'), '\n// TD-78 distinct Product payload, same package version.\n');
  await run(process.execPath, ['scripts/generate-product-manifest.mjs'], {cwd: destination, maxBuffer: 16 * 1024 * 1024});
  return destination;
}

async function start(env, memberKey, handoff, label) {
  const api = await at(env, 'public/index');
  const built = await api.constructInstalledStartCall({
    selection: memberKey === 'start'
      ? {memberKey, target: {kind: 'next'}, rootMode: 'direct', fhMode: 'direct'}
      : {memberKey, catalogHandle: env.additionalProducts[0].ids.graphFunctionRef},
    programRef: env.selectedProgramRef, catalog: env.catalog, catalogView: env.catalogView,
    applications: [], admittedInstalls: env.admittedInstalls, workspaceBinding: env.workspaceBinding,
    verifyInstallAdmission: install => env.abg.hasAdmittedProductInstall(env.artifactTruth, install),
    actorRef: env.workspaceBinding.authorizedActorRef,
    input: {value: {kind: 'hello_world_input', schemaVersion: '5.0.0', subject: 'World'}},
    inputValueRef: `value://td78/${label}`, source: {kind: 'none'},
    eventResource: resource(env.product, handoff), envelope: envelope(env, label),
  });
  assert.equal(built.kind, 'installed_start_call', JSON.stringify(built));
  return built.call;
}

function reencode(executor, api, call, label) {
  const verified = executor.verified;
  return api.constructInstalledPublicDefinitionCall({
    product: executor.product, installedPublic: api,
    ...envelope(executor, label),
    contractCatalog: {productId: verified.productId, productContentDigest: verified.productContentDigest,
      catalogId: verified.catalogId, catalogVersion: '5.0.0', catalogDigest: verified.catalogDigest},
    operationId: call.invocation.definitionKey.operationId, memberKey: call.invocation.definitionKey.memberKey,
    request: call.invocation.request, slots: call.invocation.invocationAuthority.slots, resources: call.resources,
  });
}

async function submit(executor, handoff, call) {
  const api = await at(executor, 'public/index');
  return api.runInstalledDefinitionCallTransport({kind: 'reopen', closeHandoff: handoff}, call);
}

async function noAppend(env, action) {
  const file = join(env.scratch, 'runtime/events.jsonl');
  const before = await readFile(file);
  const result = await action();
  assert.deepEqual(await readFile(file), before, 'refusal appends no bytes or rows');
  return result;
}

function traversalInput(env, opened, store = env.store, predecessorPrefix = opened.successorPrefix) {
  return {
    store, predecessorPrefix, executionBasis: env.executionBasis,
    openedTraversalScope: opened.scope, program: env.program, programPublication: env.publication,
    graphFunction: env.graphFunction, graph: env.graph, graphValidation: env.graphValidation,
    programValidation: env.programValidation, implementationSet: env.implementationSet,
    interactionSet: env.executionBasisAdmission.interactionSet, leafPort: env.leafPort,
    closureContract: env.closureContract, actorRuntimeBinding: {workspaceBinding: env.workspaceBinding, artifactTruth: env.artifactTruth},
    input: env.input, inputDigest: env.rawInput.subjectDigest, ...runtime('direct-traversal'),
  };
}

async function admissionBasis(executor, environment, prefix, effectful) {
  const {product, verified} = executor;
  const owner = await at(executor, 'product/admission_authority');
  const packets = await at(executor, effectful ? 'product/materialization_operation_contracts' : 'product/catalog_operation_contracts');
  const packet = effectful ? packets.MATERIALIZATION_OPERATION_CONTRACTS.context_bootstrap : packets.CATALOG_OPERATION_CONTRACTS.admit;
  const hash = product.sha256Canonical, actorRef = environment.workspaceBinding.authorizedActorRef;
  const pair = ref => ({ref, digest: hash({ref})});
  const binding = coord(environment.workspaceBinding), lock = {ref: environment.lock.lockId, digest: environment.lock.lockDigest};
  const request = effectful ? {
    workspace: {ref: environment.workspaceAuthority.workspaceId, digest: environment.workspaceAuthority.authorityBasisDigest},
    binding, contextInputs: [{name: 'td78', contract: pair('contract://td78/context'), value: {fixture: true}}],
  } : {workspaceBinding: binding, descriptors: [pair('descriptor://td78')], contributionManifests: [pair('contribution://td78')], resolvedLock: lock};
  const data = owner.constructAdmissionCapabilityData({fixedPacket: packet, request, resources: {},
    ownerArtifact: {verified, request: {artifactPath: executor.artifactPath, artifactRef: verified.artifactRef,
      expectedArtifactDigest: verified.artifactDigest, expectedProductContentDigest: verified.productContentDigest,
      expectedManifestDigest: verified.manifestDigest, expectedProductId: verified.productId,
      expectedPackageName: verified.packageName, expectedPackageVersion: verified.packageVersion}},
    authoritySlots: {capability_grants: null, workspace_binding: binding, dependency_lock: lock,
      product_set: environment.admittedInstalls.map(product.productInstallCoordinate),
      actor: {actor: pair(actorRef), attribution: pair('attribution://td78')}},
    boundEnvironment: owner.admissionEnvironmentSelection(prefix, binding),
  });
  const authorityValue = {actorRef, authorityMode: 'trusted_developer'};
  const approvalValue = {decision: 'allow', actorRef, definitionRef: data.definition.definitionRef,
    definitionDigest: data.definition.definitionDigest, requestDigest: hash(request), scopeDigest: owner.admissionAuthorityScope(data).digest};
  const authority = {kind: 'resolved_admission_authority', schemaVersion: '5.0.0', actorRef, authorityMode: 'trusted_developer',
    authority: {ref: 'authority://td78', digest: hash(authorityValue), value: authorityValue},
    approval: {ref: 'approval://td78', digest: hash(approvalValue), value: approvalValue}};
  return owner.validateAdmissionCapabilityBasis(authority, actorRef, packet.metadata.capabilityRefs[0],
    {kind: 'admission_capability_grant_construction_basis', fixedPacket: packet, data});
}

// Controlled process interruption before the sole F_D leaf starts. All events
// before the interruption and all continuation execution are the installed
// owners. This avoids any actor or provider while retaining an exact pending
// occurrence, rather than a synthetic continuation body.
async function pendingFixture(t, install) {
  const env = await setupInstalledRootExecutionBasis(t, root, {install});
  const opened = env.abg.openTraversalScope(env.store, env.durablePrefix,
    {kind: 'root', executionBasis: env.executionBasis}, runtime('pending-open'));
  assert.equal(opened.kind, 'traversal_scope_open_admission');
  const file = join(env.installedRoot, 'build/code/src/hog/graph_execute.js');
  const module = new SourceTextModule(await readFile(file, 'utf8'), {identifier: file});
  let interrupted = 0;
  await module.link(async specifier => {
    const actual = await import(specifier.startsWith('.') ? pathToFileURL(resolve(dirname(file), specifier)).href : specifier);
    const values = specifier === './ccall_lifecycle.js' ? {...actual,
      evaluateOwnedExecutableCCall() { interrupted++; throw new Error('TD78 controlled interruption'); }} : actual;
    return new SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    });
  });
  await module.evaluate();
  await assert.rejects(module.namespace.executeGraphTraversal(traversalInput(env, opened)), /TD78 controlled interruption/);
  assert.equal(interrupted, 1);
  const continuation = await at(env, 'abg/construction_continuation');
  const prefix = env.abg.selectValidatedRuntimeEventPrefix(env.store.readAll());
  const [pending, ...extra] = continuation.projectPendingExecutionContinuations(prefix, opened.run.runId);
  assert.equal(extra.length, 0); assert.equal(pending.phase, 'undispatched');
  const request = await pendingExecutionUseRequest({environment: env, prefix, runId: opened.run.runId, pending});
  const handoff = env.store.projectReopenAuthorityAndClose();
  const api = await at(env, 'public/index');
  const populated = await constructInstalledPendingCall({environment: env, publicApi: api, continuation, prefix, request,
    expectedAuthority: env.invocationAuthority, eventResource: () => resource(env.product, handoff),
    identityScope: 'td78/pending', eventTime: time, provenanceRef: 'provenance://td78/pending'});
  return {env, opened, pending, handoff, call: await populated.call('continue')};
}

test('TD78 selects the operation binding, refuses different Product bytes and preserves reads', async t => {
  const otherRoot = await otherProduct(t);
  const installed = await installTenantOnce(root);
  t.after(() => installed.dispose());
  const otherInstalled = await installTenantOnce(otherRoot);
  t.after(() => otherInstalled.dispose());
  const other = await openCaseEnvironment(t, otherInstalled);
  const otherApi = await at(other, 'public/index');
  other.store.projectReopenAuthorityAndClose();
  assert.equal(installed.verified.packageName, other.verified.packageName);
  assert.equal(installed.verified.packageVersion, other.verified.packageVersion);
  assert.notEqual(installed.verified.productContentDigest, other.verified.productContentDigest);
  for (const memberKey of ['start', 'invoke']) await t.test(`${memberKey}: mismatched refuses, same-bound completes`, async st => {
    const env = await openCaseEnvironment(st, installed);
    const handoff = env.store.projectReopenAuthorityAndClose();
    const call = await start(env, memberKey, handoff, memberKey);
    const refused = await noAppend(env, () => submit(other, handoff, reencode(other, otherApi, call, `wrong-${memberKey}`)));
    assert.equal(refused.receipt?.ownerOutput?.outcomeKind, 'refusal', JSON.stringify(refused));
    assert.equal(refused.receipt.ownerOutput.value.code, 'invalid_program');
    const accepted = await submit(env, handoff, call);
    assert.equal(accepted.receipt?.ownerOutput?.value.disposition, 'completed', JSON.stringify(accepted));
    const next = accepted.receipt.resources.eventResource.closeHandoff;
    const read = otherApi.constructInstalledRunReadCall({memberKey: 'run_status', workspaceBinding: coord(env.workspaceBinding),
      sourceRef: accepted.receipt.ownerOutput.value.run.ref, selector: {kind: 'none'},
      eventResource: resource(other.product, next), envelope: envelope(other, `read-${memberKey}`)});
    assert.equal(read.kind, 'installed_run_read_call', JSON.stringify(read));
    const readResult = await noAppend(env, () => submit(other, next, read.call));
    assert.equal(readResult.receipt?.ownerOutput?.outcomeKind, 'result', JSON.stringify(readResult));
  });
  await t.test('bound effect admission checks identity; pure catalog admission keeps its existing strict question', async st => {
    const env = await openCaseEnvironment(st, installed);
    const handoff = env.store.projectReopenAuthorityAndClose();
    await noAppend(env, async () => {
      assert.ok((await admissionBasis(env, env, handoff.prefix, true)).boundEnvironment);
      await assert.rejects(admissionBasis(other, env, handoff.prefix, true), /admission requires the exact admitted prefix environment/);
      assert.ok((await admissionBasis(other, env, handoff.prefix, false)).boundEnvironment);
    });
  });
  await t.test('direct ABG traversal opening cannot bypass selected Product identity', async st => {
    const env = await setupInstalledRootExecutionBasis(st, root, {install: installed});
    const handoff = env.store.projectReopenAuthorityAndClose();
    await noAppend(env, async () => {
      const acquired = other.abg.reopenEventStore(handoff.reopenAuthority);
      assert.equal(acquired.kind, 'reopened_event_store_context');
      try {
        const result = other.abg.openTraversalScope(acquired.store, acquired.prefix,
          {kind: 'root', executionBasis: env.executionBasis}, runtime('wrong-direct-open'));
        assert.equal(result.code, 'execution_basis_not_admitted', JSON.stringify(result));
      } finally { acquired.store.projectReopenAuthorityAndClose(); }
    });
  });
  await t.test('direct HoG Promise and Effect entries refuse before the leaf; same-bound traversal completes', async st => {
    const env = await setupInstalledRootExecutionBasis(st, root, {install: installed});
    const opened = env.abg.openTraversalScope(env.store, env.durablePrefix,
      {kind: 'root', executionBasis: env.executionBasis}, runtime('hog-open'));
    assert.equal(opened.kind, 'traversal_scope_open_admission');
    const handoff = env.store.projectReopenAuthorityAndClose();
    const wrongHog = await at(other, 'hog/index');
    let leafReads = 0;
    await noAppend(env, async () => {
      const acquired = other.abg.reopenEventStore(handoff.reopenAuthority);
      assert.equal(acquired.kind, 'reopened_event_store_context');
      try {
        const input = {...traversalInput(env, opened, acquired.store, acquired.prefix),
          leafPort: new Proxy(env.leafPort, {get() { leafReads++; throw new Error('mismatched entry reached leaf'); }})};
        for (const result of [await wrongHog.executeGraphTraversal(input),
          await Effect.runPromise(wrongHog.executeGraphTraversalEffect(input))]) {
          assert.equal(result.kind, 'graph_traversal_entry_refusal');
          assert.equal(result.code, 'owner_refusal');
          assert.equal(result.diagnosticRef, 'diagnostic://abiogenesis/hog/bound-toolchain-mismatch@5');
        }
        // Identity is established before even attempting retry reconstruction.
        // This is a mismatch-entry proof, not a fabricated successful retry.
        const retry = wrongHog.resumeProjectedRetry({store: acquired.store, predecessorPrefix: acquired.prefix,
          retry: {selector: {}}, runtime: input});
        assert.equal(retry.code, 'runtime_basis_mismatch');
        assert.equal(retry.message, 'retry resume requires the selected bound toolchain');
        assert.equal(leafReads, 0);
      } finally { acquired.store.projectReopenAuthorityAndClose(); }
    });
    const acquired = env.abg.reopenEventStore(handoff.reopenAuthority);
    assert.equal(acquired.kind, 'reopened_event_store_context');
    try {
      const hog = await at(env, 'hog/index');
      const result = await hog.executeGraphTraversal(traversalInput(env, opened, acquired.store, acquired.prefix));
      assert.equal(result.kind, 'executable_traversal_completion');
      assert.equal(result.disposition, 'closed');
      assert.deepEqual(result.resultValue, {kind: 'hello_world_output', schemaVersion: '5.0.0', message: 'Hello World'});
    } finally { acquired.store.projectReopenAuthorityAndClose(); }
  });
  await t.test('current_intent: mismatched pending continuation refuses; bound continuation closes the exact Run', async st => {
    const {env, opened, pending, handoff, call} = await pendingFixture(st, installed);
    await noAppend(env, async () => {
      const acquired = other.abg.reopenEventStore(handoff.reopenAuthority);
      assert.equal(acquired.kind, 'reopened_event_store_context');
      try {
        const hog = await at(other, 'hog/index');
        const result = await hog.executeGraphTraversal({pendingExecutionResume: true,
          root: traversalInput(env, opened, acquired.store, acquired.prefix), continuation: pending});
        assert.equal(result.code, 'owner_refusal');
        assert.equal(result.diagnosticRef, 'diagnostic://abiogenesis/hog/bound-toolchain-mismatch@5');
      } finally { acquired.store.projectReopenAuthorityAndClose(); }
    });
    const refused = await noAppend(env, () => submit(other, handoff, reencode(other, otherApi, call, 'wrong-continuation')));
    assert.equal(refused.receipt?.ownerOutput?.outcomeKind, 'refusal', JSON.stringify(refused));
    assert.equal(refused.receipt.ownerOutput.value.code, 'basis_mismatch');
    const accepted = await submit(env, handoff, call);
    assert.equal(accepted.receipt?.ownerOutput?.value.disposition, 'completed', JSON.stringify(accepted));
    assert.equal(accepted.receipt.ownerOutput.value.run.ref, opened.run.runId);
    const rows = env.abg.readRuntimeEventsAtDurablePrefix(accepted.receipt.resources.eventResource.closeHandoff.prefix);
    assert.equal(rows.filter(row => row.kind === 'run_closed').length, 1);
    assert.equal(rows.some(row => row.kind === 'actor_invocation_started'), false);
  });
  await t.test('one store legally holds both bindings; another matching binding cannot satisfy the selection', async st => {
    const env = await openCaseEnvironment(st, installed), {abg, product, store} = env;
    const eventOwner = await at(env, 'abg/event_store');
    const admitted = [];
    for (const [index, candidate] of otherInstalled.installCandidates.entries()) {
      const result = abg.admitProductInstall(store, candidate, {...publicOperationBasis(product,
        'abg.operation.product.install', candidate.installId, candidate.productContentDigest, `invocation://td78/mixed-install/${index}`),
        predecessorPrefix: eventOwner.selectHeldEventStoreDurablePrefix(store)}, other.lock);
      assert.equal(result.kind, 'artifact_owner_result', JSON.stringify(result)); admitted.push(result.value);
    }
    const set = product.constructProductSet(admitted, other.lock);
    const candidate = product.constructWorkspaceBinding(other.workspaceAuthority, set, other.lock, other.workspaceBinding.roots);
    assert.equal(candidate.kind, 'workspace_binding_candidate', JSON.stringify(candidate));
    const bound = abg.admitWorkspaceBinding(store, candidate, {...publicOperationBasis(product,
      'abg.operation.workspace.bind', candidate.bindingId, candidate.bindingDigest, 'invocation://td78/mixed-binding',
      admitted.map(install => install.admissionEventRef)), predecessorPrefix: eventOwner.selectHeldEventStoreDurablePrefix(store)}, other.workspaceAuthority);
    assert.equal(bound.kind, 'artifact_owner_result', JSON.stringify(bound));
    const handoff = store.projectReopenAuthorityAndClose();
    const owner = await at(env, 'abg/environment_admission');
    const wrongOwner = await at(other, 'abg/environment_admission');
    assert.equal(owner.boundWorkspaceMatchesExecutingToolchain(handoff.prefix, coord(env.workspaceBinding)), true);
    assert.equal(owner.boundWorkspaceMatchesExecutingToolchain(handoff.prefix, coord(bound.value)), false);
    assert.equal(wrongOwner.boundWorkspaceMatchesExecutingToolchain(handoff.prefix, coord(bound.value)), true);
    assert.equal(wrongOwner.boundWorkspaceMatchesExecutingToolchain(handoff.prefix, coord(env.workspaceBinding)), false);
    const call = await start(env, 'start', handoff, 'mixed-wrong');
    const refused = await noAppend(env, () => submit(other, handoff, reencode(other, otherApi, call, 'mixed-wrong')));
    assert.equal(refused.receipt?.ownerOutput?.value.code, 'invalid_program', JSON.stringify(refused));
    const accepted = await submit(env, handoff, call);
    assert.equal(accepted.receipt?.ownerOutput?.value.disposition, 'completed', JSON.stringify(accepted));
  });
});
