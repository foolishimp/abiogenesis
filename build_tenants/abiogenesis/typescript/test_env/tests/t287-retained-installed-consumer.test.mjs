import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile, writeFile, stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {bytesDigest, readPinnedJson, loadRetainedInstalledRuntime, loadQualificationPreparationOwners,
  verificationRequest, nativeCallReport, openRetainedInstalledConsumer, recoverOriginalChild}
  from '../support/retained-installed-consumer.mjs';
import {prepareRetainedSetupBinding, selectQualificationTaskDependencyClosure} from '../../scripts/prepare-retained-setup-binding.mjs';

const cfg = JSON.parse(await readFile(process.env.ABI5_RETAINED_CONSUMER_CONFIG, 'utf8'));
const phase = process.env.ABI5_RETAINED_CONSUMER_PHASE;
const output = async (name, value) => writeFile(join(cfg.outputRoot, name), JSON.stringify(value, null, 2) + '\n', {flag: 'wx'});
async function physical(prefix) {
  const path = fileURLToPath(prefix.eventLogRef), before = await stat(path), bytes = await readFile(path), after = await stat(path);
  assert.equal(before.ino, after.ino); assert.equal(before.size, after.size);
  assert.equal(bytes.length, prefix.prefixLength); assert.equal(bytesDigest(bytes), prefix.prefixDigest);
  assert.equal(after.dev, prefix.storeIdentity.device); assert.equal(after.ino, prefix.storeIdentity.inode);
  return {path, bytes: bytes.length, digest: prefix.prefixDigest, device: after.dev, inode: after.ino, mode: after.mode & 0o777};
}

if (phase === 'current') test('actual native C10 consumer and current-bound canonical successor preparation', async () => {
  const ledger = [], reports = [];
  const setup = await readPinnedJson(cfg.setupAuthority, ledger), handoff = await readPinnedJson(cfg.setupHandoff, ledger);
  const retained = await readPinnedJson(cfg.setupEnvironment, ledger);
  const runtime = await loadRetainedInstalledRuntime(setup.roots.productRoot), {product, abg} = runtime;
  assert.deepEqual(runtime.packageExports, cfg.packageExports);
  const ownerRequest = verificationRequest(cfg.core);
  const verification = await product.ProductVerificationPort.verify({kind: 'product_verification_packet', schemaVersion: '5.0.0',
    memberKey: 'verify', targetKind: 'packed_artifact', request: ownerRequest});
  assert.equal(verification.kind, 'product_verification_success', verification.kind);
  assert.strictEqual(product.selectOwnedProductVerification(ownerRequest, verification.verifiedArtifact), verification.verifiedArtifact);
  assert.equal(product.selectOwnedProductVerification({...ownerRequest, expectedManifestDigest: 'sha256:' + '0'.repeat(64)}, verification.verifiedArtifact), null);
  assert.equal(product.selectOwnedProductVerification(ownerRequest, {...verification.verifiedArtifact}), null);
  const changedRequest = await product.ProductVerificationPort.verify({kind: 'product_verification_packet', schemaVersion: '5.0.0',
    memberKey: 'verify', targetKind: 'packed_artifact', request: {...ownerRequest, expectedArtifactDigest: 'sha256:' + '0'.repeat(64)}});
  assert.equal(changedRequest.kind, 'product_verification_refusal');
  assert.equal(changedRequest.code, 'artifact_digest_mismatch');
  const changedArchivePath = join(cfg.workRoot, 'changed-archive.tgz');
  await writeFile(changedArchivePath, 'changed archive bytes', {flag: 'wx'});
  const changedArchive = await product.ProductVerificationPort.verify({kind: 'product_verification_packet', schemaVersion: '5.0.0',
    memberKey: 'verify', targetKind: 'packed_artifact', request: {...ownerRequest, artifactPath: changedArchivePath,
      artifactRef: new URL('file://' + changedArchivePath).href}});
  assert.equal(changedArchive.kind, 'product_verification_refusal');
  assert.equal(changedArchive.code, 'artifact_unreadable');
  await output('verification-negatives.json', {changedRequest, changedArchive});
  const install = setup.productInstalls.find(x => x.productId === verification.verifiedArtifact.productId);
  assert.equal(await product.installedProductContentMatches(install), true, 'current physical installed population must match');
  const before = await physical(handoff.closeHandoff.prefix);
  const live = openRetainedInstalledConsumer({runtime, ownerRequest, verification, handoff, setup});
  // The setup script receives the exact native verifier request, never a JSON nominal report.
  const binding = {get verified() { return live.verified; }, ownerRequest, get selection() { return live.selection; }};
  let outerClose, releasedSelection, lastCall;
  try {
    const environment = abg.projectExactPrefixWorkspaceEnvironment(live.selection.prefix, setup.workspaceBinding);
    assert.equal(environment.kind, 'exact_prefix_workspace_environment');
    assert.deepEqual({ref: environment.workspaceBinding.bindingId, digest: environment.workspaceBinding.bindingDigest}, setup.workspaceBinding);
    const savedBindingJoin = await readPinnedJson(cfg.setupBindingJoin, ledger);
    assert.equal(savedBindingJoin.equal, true);
    assert.deepEqual(savedBindingJoin.projectedCoordinate, setup.workspaceBinding);
    assert.deepEqual(environment.workspaceBinding, savedBindingJoin.fullProjection);
    const packet = product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist;
    const resources = {kind: 'catalog_view_resource_assertion', schemaVersion: '5.0.0', catalog: retained.catalog};
    const request = {catalog: {ref: 'graph-function-catalog://abiogenesis/' + retained.catalog.basisDigest.slice(7),
      digest: retained.catalog.basisDigest}, allowlist: retained.catalogView.allowlist};
    const first = await live.authorize(packet, request, resources);
    const copiedSelection = {...live.selection};
    const copied = await runtime.public.runInstalledDefinitionCallWithResource(copiedSelection, first);
    assert.equal(copied.kind, 'installed_definition_call_transport_refusal');
    assert.equal(copied.code, 'acquisition_mismatch');
    const crossedPrefixCall = {...first, resources: {...first.resources,
      admissionAuthority: {...first.resources.admissionAuthority, basis: {...first.resources.admissionAuthority.basis,
        boundEnvironment: {...first.resources.admissionAuthority.basis.boundEnvironment,
          prefix: {...live.selection.prefix, prefixDigest: 'sha256:' + '0'.repeat(64)}}}}}};
    const crossedPrefix = await runtime.public.runInstalledDefinitionCallWithResource(live.selection, crossedPrefixCall);
    assert.equal(crossedPrefix.kind, 'installed_definition_call_transport_refusal');
    assert.equal(crossedPrefix.code, 'acquisition_mismatch');
    const originalSelection = live.selection;
    let currentView, currentViewProducer;
    for (let i = 0; i < 2; i++) {
      const call = i === 0 ? first : await live.authorize(packet, request, resources);
      lastCall = call;
      assert.strictEqual(call.resources.admissionAuthority.basis.ownerArtifact.verified, verification.verifiedArtifact);
      const outcome = await live.invoke(call);
      reports.push(nativeCallReport(product, call, outcome, [cfg.setupAuthority, cfg.setupHandoff]));
      assert.equal(outcome.kind, 'installed_definition_call_transport_result', outcome.kind);
      assert.equal(outcome.receipt.ownerOutput.outcomeKind, 'result');
      assert.equal(outcome.receipt.exitCode, 0);
      assert.equal(outcome.receipt.resources.disposition, 'read_only_unchanged');
      assert.strictEqual(live.selection, originalSelection, 'eventless View retains its owner-issued entry selection');
      const value = outcome.receipt.ownerOutput.value;
      currentView = product.narrowGraphFunctionCatalog(retained.catalog, value.effectiveHandles);
      assert.equal(currentView.viewDigest, value.view.digest, 'actual native output must bind the prepared View');
      assert.deepEqual(currentView, retained.catalogView);
      currentViewProducer = reports.at(-1).invocation;
      await output('native-call-' + i + '.json', reports.at(-1));
    }
    const badRequest = await live.authorize(packet, {...request, allowlist: ['graph-function://absent']}, resources);
    const requestRefusal = await live.invoke(badRequest);
    assert.equal(requestRefusal.kind, 'installed_definition_call_transport_result');
    assert.equal(requestRefusal.receipt.ownerOutput.outcomeKind, 'refusal');
    assert.equal(requestRefusal.receipt.ownerOutput.value.code, 'unknown');
    await assert.rejects(() => live.authorize(packet, {...request, unexpected: true}, resources), /request/);
    await assert.rejects(() => live.authorize(packet, request, resources, {actor: {actor: {
      ref: 'actor://crossed', digest: product.sha256Canonical({ref: 'actor://crossed'})},
      attribution: first.invocation.invocationAuthority.slots.actor.attribution}}), /actor/);
    await assert.rejects(() => live.authorize(packet, request, resources, {workspace_binding: {
      ref: setup.workspaceBinding.ref, digest: 'sha256:' + '0'.repeat(64)}}), /workspace|environment|binding/i);
    const owners = await loadQualificationPreparationOwners(runtime, cfg.componentOwners, ledger);
    const originalPacket = await readPinnedJson(cfg.originalPacket, ledger);
    const originalManifest = await readPinnedJson(cfg.originalManifest, ledger);
    const closure = selectQualificationTaskDependencyClosure(originalPacket.assessmentInput, originalManifest);
    assert.equal(closure.report.selectedMaterialCount, 4);
    assert.equal(closure.report.selectedMaterialDecodedBytes, 85591);
    assert.deepEqual(closure.report, cfg.expectedClosure);
    await output('selected-closure.json', closure.report);
    const prepared = prepareRetainedSetupBinding({runtime, owners, live: binding, setup,
      currentCatalog: retained.catalog, currentView,
      originalInput: originalPacket.assessmentInput, originalManifest,
      originalDeclarationProofs: originalPacket.declarationProofs,
      originalPins: [cfg.originalPacket, cfg.originalManifest, cfg.originalWorkerRequest, cfg.originalPositiveAcceptance]});
    const again = prepared.prepareAgain();
    assert.strictEqual(again.view.task, prepared.prepared.view.task, 'native preparation borrows its acquired immutable Task view');
    assert.equal(product.sha256Canonical(again.request), product.sha256Canonical(prepared.prepared.request));
    assert.notEqual(prepared.report.successorTask.ref, prepared.report.originalTask.ref);
    assert.deepEqual(again.view.task.material.map(m => [m.ref, m.path, m.digest, m.byteCount]), prepared.report.material.map(m => [m.ref, m.path, m.digest, m.byteCount]));
    assert.deepEqual(again.view.task.residuals, originalPacket.assessmentInput.task.residuals);
    assert.equal(runtime.validator.isQualificationAssessmentInput({...prepared.input, task: {...prepared.input.task, taskDigest: 'sha256:' + '0'.repeat(64)}}), false);
    assert.throws(() => prepared.resources.manifest({ref: 'qualification-resource://abiogenesis/' + '0'.repeat(64),
      digest: 'sha256:' + '0'.repeat(64)}), /qualification_resource_missing_or_crossed/);
    assert.throws(() => prepared.resources.declarations(prepared.input.task.resource,
      [{...prepared.input.task.declarations.at(-1), proofDigest: 'sha256:' + '0'.repeat(64)}]), /qualification_declaration_selection_unbound/);
    const missingEntry = prepared.resources.assertion.manifests[0].entries.find(e => e.entryKind === 'material');
    assert.throws(() => prepared.resources.value({kind: 'qualification_resource_selection', schemaVersion: '1',
      resource: prepared.input.task.resource, entryKind: 'material', entry: {...missingEntry.coordinate,
        digest: 'sha256:' + '0'.repeat(64)}}, 'material'), /entry_missing_or_crossed/);
    const required = closure.entries[0];
    assert.throws(() => selectQualificationTaskDependencyClosure(originalPacket.assessmentInput,
      {...originalManifest, entries: originalManifest.entries.filter(e => e !== required)}), /missing/);
    assert.throws(() => prepareRetainedSetupBinding({runtime, owners, live: binding,
      setup: {...setup, currentActor: 'actor://crossed'}, currentCatalog: retained.catalog, currentView: retained.catalogView}));
    assert.throws(() => prepareRetainedSetupBinding({runtime, owners, live: binding, setup,
      currentCatalog: {...retained.catalog, workspaceBindingDigest: 'sha256:' + '0'.repeat(64)}, currentView: retained.catalogView}));
    await output('preparation.json', {...prepared.report, currentViewProducer});
    await output('native-calls.json', {reports, nativeSelection: {standing: 'eventless_read_only_unchanged',
      entryPrefix: originalSelection.prefix, advancingResourceTraversal: 'not proved'},
      verification: {requestDigest: product.sha256Canonical(ownerRequest), artifactDigest: live.verified.artifactDigest,
        productContentDigest: live.verified.productContentDigest, manifestDigest: live.verified.manifestDigest},
      privatePreparationVisibility: owners.visibility, requiredIngressLedger: ledger,
      retainedBodyBytes: Buffer.byteLength(JSON.stringify(reports)), serializedNativeCallInputs: 0,
      transportedVerifierBodies: 0, producerReplays: 0, dispatchedTasksOrRuns: 0,
      negativeRelations: ['copied verification', 'crossed verifier request', 'copied native selection', 'crossed native prefix',
        'unknown request allowlist', 'crossed native actor', 'crossed native workspace binding',
        'Task identity', 'missing resource', 'crossed declaration proof', 'crossed current actor', 'crossed current workspace binding']});
  } finally {
    releasedSelection = live.selection;
    outerClose = live.close();
    await output('current-outer-close.json', outerClose);
  }
  assert.deepEqual(await physical(outerClose.closeHandoff.prefix), before);
  assert.throws(() => live.selection, /closed/);
  const released = await runtime.public.runInstalledDefinitionCallWithResource(releasedSelection, lastCall);
  assert.equal(released.kind, 'installed_definition_call_transport_refusal');
  assert.equal(released.code, 'acquisition_mismatch');
  assert.throws(() => abg.assertAcquiredAbgEventResourceSelectionCurrent(releasedSelection));
  await output('current-conservation.json', {before, after: before, eventAppends: 0, outerCloses: 1, nativeCalls: reports.length,
    originalPins: [cfg.setupAuthority, cfg.setupHandoff, cfg.setupEnvironment], status: 'passed'});
});

if (phase === 'historical') test('fresh original child Result/J recovery and nearest crossed-reference refusals', async () => {
  const ledger = [];
  const handoff = await readPinnedJson(cfg.historicalHandoff, ledger);
  const selectionProof = await readPinnedJson(cfg.originalChild, ledger);
  const originalPacket = await readPinnedJson(cfg.originalPacket, ledger);
  const runtime = await loadRetainedInstalledRuntime(cfg.historicalInstalledRoot);
  const prefix = handoff.closeHandoff.prefix, before = await physical(prefix);
  const declarationProof = originalPacket.declarationProofs[0];
  assert.equal(runtime.product.sha256Canonical(declarationProof), selectionProof.proof.declarations[0].proofDigest);
  const terminal = recoverOriginalChild(runtime, {prefix, graphCallRef: cfg.expected.graphCallRef, declarationProof, expected: cfg.expected});
  assert.equal(terminal.valueDigest, selectionProof.terminal.valueDigest);
  assert.deepEqual(terminal.value.source, selectionProof.terminal.value.source);
  assert.deepEqual(terminal.value.raw, selectionProof.terminal.value.raw);
  assert.equal(runtime.abg.projectClosedGraphCallTerminalAtDurablePrefix(prefix, 'graph-call://abiogenesis/' + '0'.repeat(64), declarationProof), null);
  assert.equal(runtime.abg.projectClosedGraphCallTerminalAtDurablePrefix({...prefix, prefixDigest: 'sha256:' + '0'.repeat(64)}, cfg.expected.graphCallRef, declarationProof), null);
  assert.equal(runtime.abg.projectClosedGraphCallTerminalAtDurablePrefix(prefix, cfg.expected.graphCallRef,
    {...declarationProof, catalogView: {...declarationProof.catalogView, viewDigest: 'sha256:' + '0'.repeat(64)}}), null);
  assert.throws(() => recoverOriginalChild(runtime, {prefix, graphCallRef: cfg.expected.graphCallRef, declarationProof,
    expected: {...cfg.expected, resultRef: 'result://abiogenesis/' + '0'.repeat(64)}}), /original|equal/);
  assert.deepEqual(await physical(prefix), before);
  await output('fresh-original-child.json', {standing: 'authenticated_historical_controlled_result; not current qualification',
    originalPins: [cfg.historicalHandoff, cfg.originalChild, cfg.originalPacket, cfg.originalPositiveAcceptance],
    originalResult: terminal.result, producer: terminal.producer, valueDigest: terminal.valueDigest,
    judgment: {ref: terminal.value.judgmentRef, digest: terminal.value.judgmentDigest}, source: terminal.value.source,
    rawDigest: runtime.product.sha256Canonical(terminal.value.raw), residuals: terminal.value.raw.residuals,
    prefix, physical: before, requiredIngressLedger: ledger, originalProducerReruns: 0, eventAppends: 0,
    negatives: ['absent GraphCall', 'crossed prefix digest', 'crossed declaration View', 'crossed selected Result'], status: 'passed'});
});
