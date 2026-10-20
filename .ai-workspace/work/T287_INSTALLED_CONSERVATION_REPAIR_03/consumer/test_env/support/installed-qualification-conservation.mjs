// Ordinary source-blind caller for one controlled installed conservation test.
// Inputs and transport fixtures are supplied data; ABG alone creates runtime truth.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile, writeFile, mkdir, stat} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import * as product from '@abiogenesis/typescript-tenant/product';
import * as abg from '@abiogenesis/typescript-tenant/abg';
import * as installedPublic from '@abiogenesis/typescript-tenant/public';
import * as gtl from '@abiogenesis/typescript-tenant/gtl';
import * as validator from '@abiogenesis/typescript-tenant/validator';
import * as preparation from '@abiogenesis/typescript-tenant/qualification/m05';

export const runtime = {product, abg, installedPublic, gtl, validator, preparation};
export const schemaVersion = '5.0.0';
export const hash = product.sha256Canonical;
export const digest = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
export const readJson = async path => JSON.parse(await readFile(path, 'utf8'));
export const writeJson = (path, value) => writeFile(path, JSON.stringify(value) + '\n', {flag: 'wx'});
export const coordinate = (ref, value = {ref}) => ({ref, digest: hash(value)});
export const source = ({ref, path, digest: bodyDigest, byteCount}) => ({ref, path, digest: bodyDigest, byteCount});
export const material = (ref, path, bytes) => ({ref, path, digest: digest(bytes), byteCount: bytes.length,
  contentBase64: Buffer.from(bytes).toString('base64')});
const slots = () => Object.fromEntries(['workspace_binding', 'product_set', 'dependency_lock', 'catalog_scope',
  'execution_program', 'graph_function', 'input_contract', 'session_policy', 'capability_grants', 'actor',
  'transport_steering', 'verification_references', 'execution_basis'].map(key => [key, null]));

export async function nativeVerification(packageRoot, archivePath) {
  const manifest = await readJson(join(packageRoot, 'product-toolchain-manifest.json'));
  const archive = await readFile(archivePath);
  assert.equal(digest(archive), 'sha256:c54721805a8adb73c3fa74ee8c3c04126dc5bd7ad2da542967b9292c6a4943e5');
  const request = {artifactPath: archivePath, artifactRef: pathToFileURL(archivePath).href,
    expectedArtifactDigest: digest(archive), expectedProductContentDigest: manifest.productContentDigest,
    expectedManifestDigest: hash(manifest), expectedProductId: manifest.productId,
    expectedPackageName: manifest.packageName, expectedPackageVersion: manifest.packageVersion};
  const verification = await product.ProductVerificationPort.verify({kind: 'product_verification_packet', schemaVersion,
    memberKey: 'verify', targetKind: 'packed_artifact', request});
  assert.equal(verification.kind, 'product_verification_success', verification.code);
  assert.strictEqual(product.selectOwnedProductVerification(request, verification.verifiedArtifact), verification.verifiedArtifact);
  return {manifest, request, verification, verified: verification.verifiedArtifact};
}

export function createCaller({root, native, binding = null, closeHandoff = null, eventLogPath = join(root, 'resources/events/runtime.events.jsonl')}) {
  const {request: ownerRequest, verified} = native;
  const actorRef = 'actor://abiogenesis/t287/installed-conservation/owner';
  const authorityRef = 'authority://abiogenesis/t287/installed-conservation/owner';
  const actor = {actor: coordinate(actorRef), attribution: coordinate(actorRef + '/test')};
  const contractCatalog = {productId: verified.productId, productContentDigest: verified.productContentDigest,
    catalogId: verified.catalogId, catalogVersion: schemaVersion, catalogDigest: verified.catalogDigest};
  const state = {binding, closeHandoff, environment: null, catalog: null, catalogView: null, resolvedLock: null, calls: []};
  const reopen = () => ({kind: 'reopen_abg_event_resource', schemaVersion, closeHandoff: state.closeHandoff,
    handoffDigest: hash(state.closeHandoff)});
  const refresh = () => {
    state.environment = abg.projectExactPrefixWorkspaceEnvironment(state.closeHandoff.prefix, state.binding);
    assert.equal(state.environment.kind, 'exact_prefix_workspace_environment');
    return state.environment;
  };
  const boundSlots = () => ({workspace_binding: state.binding,
    product_set: state.environment.productInstalls.map(product.productInstallCoordinate),
    dependency_lock: {ref: state.resolvedLock.lockId, digest: state.resolvedLock.lockDigest}, actor});
  async function authorize(packet, request, resources, supplied = {}) {
    const definition = installedPublic.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d =>
      d.definitionKey.operationId === packet.definitionKey.operationId && d.definitionKey.memberKey === packet.definitionKey.memberKey);
    assert(definition);
    const selected = {...slots(), capability_grants: {requiredCapabilityRefs: [...definition.capabilityRefs], grants: []}, ...supplied};
    const data = {kind: 'admission_capability_data', schemaVersion,
      definition: {definitionKey: definition.definitionKey, definitionRef: definition.definitionRef,
        definitionDigest: definition.definitionDigest, owner: {ref: packet.owner.authorityRef, digest: packet.owner.authorityDigest}},
      ownerArtifact: {request: ownerRequest, verified}, request,
      resourceScope: {resourcesDigest: hash(resources), authoritySlots: product.admissionAuthoritySlots(selected)},
      boundEnvironment: packet.metadata.workspaceBindingRequirement === 'forbidden' ? null
        : product.admissionEnvironmentSelection(state.closeHandoff.prefix, selected.workspace_binding)};
    const authorityValue = {actorRef, authorityMode: 'trusted_developer'};
    const approvalValue = {decision: 'allow', actorRef, definitionRef: definition.definitionRef,
      definitionDigest: definition.definitionDigest, requestDigest: hash(request), scopeDigest: product.admissionAuthorityScope(data).digest};
    const authority = {kind: 'resolved_admission_authority', schemaVersion, actorRef, authorityMode: 'trusted_developer',
      authority: {...coordinate(authorityRef, authorityValue), value: authorityValue},
      approval: {...coordinate(authorityRef + '/approval/' + state.calls.length, approvalValue), value: approvalValue}};
    const grants = await Promise.all(definition.capabilityRefs.map(cap => product.constructCapabilityGrant(authority,
      actorRef, packet.definitionKey.operationId, cap, {kind: 'admission_capability_grant_construction_basis', fixedPacket: packet, data})));
    return installedPublic.constructInstalledPublicDefinitionCall({product, installedPublic,
      definitionContractCoordinates: verified.definitionContractCoordinates, contractCatalog, ...packet.definitionKey,
      request, slots: {...selected, capability_grants: {requiredCapabilityRefs: [...definition.capabilityRefs],
        grants: grants.map(g => ({ref: g.grantRef, digest: g.grantDigest}))}},
      resources: {...resources, admissionAuthority: {basis: data, authority, grants}},
      requestRef: 'request://abiogenesis/t287/installed-conservation/' + state.calls.length,
      correlationRef: 'correlation://abiogenesis/t287/installed-conservation', eventTime: new Date().toISOString(),
      provenanceRefs: [pathToFileURL(join(root, 'activation.json')).href]});
  }
  async function invoke(label, call) {
    const eventResource = call.resources.eventResource;
    const acquisition = !eventResource ? {kind: 'eventless'} : eventResource.kind === 'new_abg_event_resource'
      ? {kind: 'new', eventLogPath: eventResource.eventLogPath} : {kind: 'reopen', closeHandoff: eventResource.closeHandoff};
    const logPath = eventLogPath;
    const before = await stat(logPath).then(s => s.size, e => {if (e.code === 'ENOENT') return 0; throw e;});
    const diagnosticStarted = performance.now(), selectedBytes = Buffer.byteLength(JSON.stringify(call.invocation.request));
    const diagnosticSerializationMs = performance.now() - diagnosticStarted;
    // Full-call diagnostic serialization creates a second large body; it is not needed for this join.
    const started = performance.now();
    const outcome = await installedPublic.runInstalledDefinitionCallTransport(acquisition, call);
    const receipt = outcome.receipt;
    if (receipt?.resources?.eventResource?.closeHandoff) {
      state.closeHandoff = receipt.resources.eventResource.closeHandoff;
      // Retain the genuine boundary before any later fixture/proof assertion can throw.
      await writeJson(join(root, label + '-handoff.json'), {closeHandoff: state.closeHandoff, handoffDigest: hash(state.closeHandoff)});
    }
    const after = await stat(logPath).then(s => s.size, e => {if (e.code === 'ENOENT') return 0; throw e;});
    const row = {label, definitionKey: call.invocation.definitionKey,
      invocation: {ref: call.invocation.invocationRef, digest: call.invocation.invocationDigest},
      selectedBytes, serializedCallBytes: null, fullCallDiagnosticSerialization: false,
      diagnosticSerializationMs, newEventBytes: after - before, transportAndHandoffRetentionMs: performance.now() - started,
      currentRssBytes: process.memoryUsage().rss, currentHeapUsedBytes: process.memoryUsage().heapUsed,
      peakRssBytes: process.resourceUsage().maxRSS * 1024, rssMeasurement: 'process cumulative high water at phase end',
      outcomeKind: receipt?.ownerOutput?.outcomeKind ?? null, exitCode: receipt?.exitCode ?? null,
      outcomeCode: outcome.code ?? receipt?.ownerOutput?.code ?? null,
      valueDigest: receipt?.ownerOutput?.value === undefined ? null : hash(receipt.ownerOutput.value),
      prefixDigest: state.closeHandoff?.prefix.coordinateDigest ?? null, realProviderCalls: 0};
    state.calls.push(row);
    await writeJson(join(root, label + '-observation.json'), row);
    console.log(JSON.stringify(row));
    assert.equal(outcome.kind, 'installed_definition_call_transport_result', outcome.code);
    assert.equal(receipt?.ownerOutput?.outcomeKind, 'result', JSON.stringify(receipt?.ownerOutput));
    assert.equal(receipt.exitCode, 0);
    return {call, receipt};
  }
  return {state, actorRef, actor, contractCatalog, reopen, refresh, boundSlots, authorize, invoke, native, root, eventLogPath};
}

export async function setup(caller) {
  const {root, native, state, actor, actorRef, authorize, invoke, boundSlots} = caller;
  const {verified: v, verification} = native;
  const started = performance.now();
  const deadline = () => assert(performance.now() - started < 300000, 'setup exceeds complete phase budget');
  const resolvedLock = product.ProductEnvironmentPort.resolve({kind: 'product_resolution_packet', schemaVersion,
    memberKey: 'resolve', verifiedArtifacts: [v]});
  assert.equal(resolvedLock.kind, 'resolved_product_lock', resolvedLock.code);
  state.resolvedLock = resolvedLock;
  const lock = {ref: resolvedLock.lockId, digest: resolvedLock.lockDigest};
  const constructors = ['constructConsensusModulePublication', 'constructHelloWorldModulePublication',
    'constructDefaultGovernanceLibraryModulePublication', 'constructSelfConformanceModulePublication',
    'constructRequirementHandoffModulePublication', 'constructSemanticRevisionModulePublication',
    'constructSemanticStageModulePublication', 'constructWorksiteCommandExecutionModulePublication',
    'constructWorksiteCommandForwardModulePublication', 'constructWorksiteConstructionModulePublication',
    'constructNativeWorkspaceWorkModulePublication'];
  const publications = constructors.map(name => gtl[name]({...v, productManifestDigest: v.manifestDigest}));
  assert.deepEqual(publications.map(p => [p.moduleRef, product.modulePublicationSemanticDigest(p)]).sort(),
    v.contributionManifest.publicationBindings.map(p => [p.moduleRef, p.publicationDigest]).sort());
  const workspaceRoot = join(root, 'resources/worksite');
  await mkdir(join(root, 'resources/events'), {recursive: true});
  const created = await invoke('setup-workspace', await authorize(product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.create.clean,
    {targetRoot: workspaceRoot, createPolicy: 'clean', scaffoldPolicy: 'none'},
    {kind: 'workspace_resource_assertion', schemaVersion, targetRoot: workspaceRoot,
      targetRootDigest: hash({kind: 'workspace_target', targetRoot: workspaceRoot})}, {actor}));
  const workspaceManifest = await readJson(created.receipt.resources.manifest.locator);
  const packed = {kind: 'product_verification_artifact_resource', schemaVersion, artifactPath: native.request.artifactPath,
    artifact: {ref: v.artifactRef, digest: v.artifactDigest},
    productContent: {ref: 'product-content://abiogenesis/' + v.productContentDigest.slice(7), digest: v.productContentDigest},
    descriptor: verification.coordinates.descriptor,
    contributionManifest: {ref: v.contributionManifestRef, digest: v.contributionManifestDigest},
    manifestDigest: v.manifestDigest, productId: v.productId, packageName: v.packageName, packageVersion: v.packageVersion};
  deadline();
  const checked = await invoke('setup-verify', await authorize(product.PRODUCT_VERIFICATION_SOURCE_DECLARATIONS.verify,
    {targetKind: 'packed_artifact', artifact: packed.artifact, productContent: packed.productContent,
      descriptor: packed.descriptor, contributionManifest: packed.contributionManifest,
      declaredDependencies: v.declaredDependencies,
      compatibilityInputs: v.compatibilityRefs.map(compatibilityRef => ({compatibilityRef, subjectRef: packed.productContent.ref}))},
    {kind: 'product_verification_resources', schemaVersion, targetKind: 'packed_artifact', packedArtifact: packed, verifiedArtifact: v}));
  const verificationRef = {invocation: {ref: checked.call.invocation.invocationRef, digest: checked.call.invocation.invocationDigest},
    outcome: checked.receipt.ownerOutput.value.verifiedArtifact};
  assert.deepEqual(verification.pendingExternalSelectors, []);
  assert.deepEqual(checked.receipt.ownerOutput.value.pendingExternalSelectors, []);
  deadline();
  const resolved = await invoke('setup-resolve', await authorize(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.resolve,
    {requirements: [{productId: v.productId, packageVersion: v.packageVersion, requiredContractRefs: [], requiredCapabilityRefs: []}],
      verifiedCandidates: [verificationRef]},
    {kind: 'product_resolution_resource_assertion', schemaVersion,
      verifiedPreimages: [{verification: verificationRef, verifiedArtifact: v, verificationOutput: checked.receipt.ownerOutput}],
      nativeContractClosure: {selectorDispositions: [], occurrences: [], nativeBindings: []}},
    {verification_references: [verificationRef]}));
  assert.deepEqual(resolved.receipt.ownerOutput.value.resolvedLock, lock);
  const eventLogPath = join(root, 'resources/events/runtime.events.jsonl'), installRoot = join(root, 'resources/installed/core');
  const eventResource = {kind: 'new_abg_event_resource', schemaVersion, eventLogPath,
    locatorDigest: hash({kind: 'abg_event_log_locator', eventLogPath: resolve(eventLogPath)})};
  deadline();
  const installed = await invoke('setup-install', await authorize(product.PRODUCT_INSTALL_SOURCE_DECLARATIONS.install,
    {verifiedArtifact: verification.coordinates.verifiedArtifact, descriptor: packed.descriptor,
      contributionManifest: packed.contributionManifest, resolvedLock: lock, targetRoot: installRoot, installPolicy: 'clean'},
    {kind: 'product_install_resource_assertion', schemaVersion, eventResource, packedArtifact: packed,
      verifiedArtifact: v, resolvedLock}, {dependency_lock: lock, verification_references: [verificationRef], actor}));
  const install = abg.projectAdmittedProductInstallByInvocationRef(abg.projectExactPrefixArtifactTruth(state.closeHandoff.prefix),
    installed.call.invocation.invocationRef).install;
  const authorityManifest = {workspaceId: workspaceManifest.workspaceRef, canonicalRoot: workspaceManifest.canonicalRoot,
    authorityMode: 'trusted_developer', authorizedActorRef: actorRef};
  const workspaceAuthority = product.constructWorkspaceAuthorityBasis({...authorityManifest,
    authorityManifestRef: 'authority://abiogenesis/t287/installed-conservation/workspace', authorityManifestDigest: hash(authorityManifest)});
  const roots = {toolchainRoot: dirname(installRoot), productRoot: install.installedRoot, eventLogRoot: dirname(eventLogPath),
    runtimeStateRoot: join(root, 'resources/runtime'), projectionRoot: join(root, 'resources/projections'), archiveRoot: join(root, 'resources/archives')};
  const fields = {toolchain: 'toolchainRoot', product: 'productRoot', event_log: 'eventLogRoot', runtime_state: 'runtimeStateRoot',
    projection: 'projectionRoot', archive: 'archiveRoot'};
  deadline();
  const bound = await invoke('setup-bind', await authorize(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.bind,
    {workspaceAuthority: {ref: workspaceAuthority.authorityBasisId, digest: workspaceAuthority.authorityBasisDigest},
      installedSet: [product.productInstallCoordinate(install)], resolvedLock: lock,
      declaredRoots: Object.entries(fields).map(([rootKind, field]) => ({rootKind, path: roots[field]}))},
    {kind: 'product_workspace_binding_resource_assertion', schemaVersion, eventResource: caller.reopen(), workspaceAuthority,
      workspaceManifest, admittedInstalls: [install], resolvedLock, declaredRoots: roots},
    {product_set: [product.productInstallCoordinate(install)], dependency_lock: lock, actor}));
  state.binding = bound.receipt.ownerOutput.value.binding;
  caller.refresh();
  deadline();
  const published = await invoke('setup-catalog', await authorize(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.admit,
    {workspaceBinding: state.binding, descriptors: [packed.descriptor], contributionManifests: [packed.contributionManifest], resolvedLock: lock},
    {kind: 'catalog_admission_resource_assertion', schemaVersion, eventResource: caller.reopen(),
      workspaceBinding: state.environment.workspaceBinding, resolvedLock, verifiedProducts: [v],
      admittedInstalls: state.environment.productInstalls, publications}, boundSlots()));
  const admitted = abg.projectAdmittedProductInstallByAdmissionEventRef(state.environment.artifactTruth, install.admissionEventRef);
  state.catalog = product.CatalogOperationPort.admit({kind: 'catalog_admit_packet', schemaVersion, memberKey: 'admit',
    readinessBasis: {workspaceBinding: state.environment.workspaceBindingCandidate, resolvedLock, verifiedProducts: [v],
      installedProducts: [admitted.candidate], publications}});
  assert.equal(state.catalog.kind, 'graph_function_catalog', state.catalog.code);
  assert.equal(published.receipt.ownerOutput.value.catalog.digest, state.catalog.basisDigest);
  const programs = publications.flatMap(p => p.programs).filter(p => ['program://abiogenesis/qualification/assess@5',
    gtl.SELF_CONFORMANCE_IDS.programRef, 'program://abiogenesis/qualification/exact-candidate@5'].includes(p.programRef));
  assert.equal(programs.length, 3);
  const allowlist = [...new Set(programs.flatMap(p => p.callableMembership))].sort();
  await invoke('setup-view', await authorize(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,
    {catalog: published.receipt.ownerOutput.value.catalog, allowlist},
    {kind: 'catalog_view_resource_assertion', schemaVersion, catalog: state.catalog}, boundSlots()));
  state.catalogView = product.narrowGraphFunctionCatalog(state.catalog, allowlist);
  for (const p of programs) {
    deadline();
    const publication = publications.find(value => value.programs.some(value => value.programRef === p.programRef));
    const conformanceLaw = coordinate('law://abiogenesis/validator/gtl-program@5');
    const result = await invoke('setup-conformance-' + p.programRef.split('/').at(-1).split('@')[0],
      await authorize(validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,
        {program: coordinate(p.programRef, p), conformanceLaw,
          inventoryBasis: {kind: 'declared_inventory', inventory: state.catalog.boundPublications
            .map(value => coordinate(value.moduleRef, value)).sort((a, b) => a.ref.localeCompare(b.ref))}},
        {kind: 'conformance_evaluation_resource_assertion', schemaVersion,
          packet: {kind: 'conformance_evaluate_packet', schemaVersion, memberKey: 'gtl_program', publication, program: p},
          conformanceLaw, declaredInventory: state.catalog.boundPublications,
          declarationCatalog: {catalog: state.catalog, catalogView: state.catalogView}}, boundSlots()));
    assert.equal(result.receipt.ownerOutput.value.disposition, 'passed');
  }
  caller.refresh();
  return {install, publications, elapsedMs: performance.now() - started};
}

/** Exact authorized native maintenance, then discardable Product projections; no setup replay. */
export async function recoverSetup(caller, {originalRoot, evidenceRoot}) {
  const started = performance.now(), old = await readJson(join(originalRoot, 'setup-observation.json'));
  const prefix = old.prefix, path = caller.eventLogPath;
  assert.equal(pathToFileURL(path).href, prefix.eventLogRef);
  assert.equal(process.env.TMPDIR, join(originalRoot, 'tmp'), 'original owner lock namespace is preserved');
  const physical = await stat(path), originalBytes = await readFile(path);
  assert.equal(physical.dev, prefix.storeIdentity.device);
  assert.equal(physical.ino, prefix.storeIdentity.inode);
  assert.equal(originalBytes.length, prefix.prefixLength);
  assert.equal(digest(originalBytes), prefix.prefixDigest);
  const lockPath = join(process.env.TMPDIR, 'abiogenesis-event-store-locks-v5', physical.dev + '-' + physical.ino + '.lock');
  await stat(lockPath).then(() => {throw Error('selected lock is present');}, e => {if (e.code !== 'ENOENT') throw e;});
  for (const pid of [29688, 29689]) {
    let absent = false;
    try {process.kill(pid, 0);} catch (error) {if (error.code === 'ESRCH') absent = true; else throw error;}
    assert(absent, 'selected original owner/wrapper PID is absent');
  }
  // Immutable byte evidence retains the old cut while the selected live owner can append.
  await writeFile(join(evidenceRoot, 'original-prefix.events.jsonl'), originalBytes, {flag: 'wx', mode: 0o444});
  await writeJson(join(evidenceRoot, 'original-prefix-coordinate.json'), {prefix, snapshot: {
    path: join(evidenceRoot, 'original-prefix.events.jsonl'), bytes: originalBytes.length, digest: digest(originalBytes)},
    classification: 'immutable prefix byte evidence; never a runnable event resource'});
  const origin = {newResourceRequest: {kind: 'new_abg_event_resource', schemaVersion, eventLogPath: path,
    locatorDigest: hash({kind: 'abg_event_log_locator', eventLogPath: resolve(path)})},
    originalActivation: pathToFileURL(join(originalRoot, 'activation.json')).href,
    originalInstallObservation: pathToFileURL(join(originalRoot, 'setup-install-observation.json')).href,
    originalFrozenHelper: pathToFileURL(join(dirname(dirname(originalRoot)), 'evidence/T287_INSTALLED_CONSERVATION_01/installed-qualification-conservation.mjs')).href,
    prefix, initialOriginEstablishedBy: 'Root-selected stopped setup and its actual owner-created install/log'};
  await writeJson(join(caller.root, 'origin-evidence.json'), origin);
  const quiescence = {selectedResource: {path, device: physical.dev, inode: physical.ino, digest: digest(originalBytes)},
    ownerPidsAbsent: [29688, 29689], lockPath, lockAbsent: true, exclusiveMaintenance: true,
    delegatedRootGrant: pathToFileURL(join(caller.root, 'grant.md')).href,
    approvalBasis: 'Root reserved this exact resource and explicitly delegated trusted-developer maintenance approval'};
  await writeJson(join(caller.root, 'quiescence-evidence.json'), quiescence);
  const request = {kind: 'abg_interrupted_event_resource_recovery', schemaVersion,
    initialOrigin: {newResourceRequest: origin.newResourceRequest, device: physical.dev, inode: physical.ino,
      evidence: coordinate(pathToFileURL(join(caller.root, 'origin-evidence.json')).href, origin)},
    recoveryCase: 'lock_absent', lockPath, expectedCurrent: {byteLength: originalBytes.length, digest: digest(originalBytes)},
    interruption: {ownerPid: 29689, evidence: coordinate(pathToFileURL(join(originalRoot, 'first-failure.json')).href,
      await readJson(join(originalRoot, 'first-failure.json'))),
      quiescenceEvidence: coordinate(pathToFileURL(join(caller.root, 'quiescence-evidence.json')).href, quiescence), exclusiveMaintenance: true},
    ownerArtifact: {request: caller.native.request, verified: caller.native.verified}};
  const authorityValue = {actorRef: caller.actorRef, authorityMode: 'trusted_developer'};
  const approvalValue = {decision: 'allow', actorRef: caller.actorRef, definitionRef: abg.ABG_EVENT_RESOURCE_RECOVERY.definitionRef,
    definitionDigest: abg.ABG_EVENT_RESOURCE_RECOVERY_DIGEST, requestDigest: hash(request), scopeDigest: abg.abgEventRecoveryScope(request).digest};
  const approval = {kind: 'resolved_admission_authority', schemaVersion, actorRef: caller.actorRef, authorityMode: 'trusted_developer',
    authority: {...coordinate('authority://abiogenesis/t287/installed-conservation/recovery', authorityValue), value: authorityValue},
    approval: {...coordinate('approval://abiogenesis/t287/installed-conservation/recovery', approvalValue), value: approvalValue}};
  await writeJson(join(caller.root, 'maintenance-approval.json'), {rootDelegation: quiescence.delegatedRootGrant, authority: approval,
    requestDigest: hash(request), origin: request.initialOrigin, expectedCurrent: request.expectedCurrent,
    interruption: request.interruption, lockPath, executingArtifact: {ref: caller.native.verified.artifactRef, digest: caller.native.verified.artifactDigest}});
  const receipt = await abg.recoverInterruptedAbgEventResource(request, approval);
  await writeJson(join(caller.root, 'recovery-receipt.json'), receipt);
  if (receipt.kind === 'abg_event_resource_recovery_receipt' && receipt.outcome.kind === 'recovered') {
    caller.state.closeHandoff = receipt.outcome.closeHandoff;
    await writeJson(join(caller.root, 'recovery-handoff.json'), {closeHandoff: receipt.outcome.closeHandoff,
      handoffDigest: hash(receipt.outcome.closeHandoff)});
  }
  assert.equal(receipt.kind, 'abg_event_resource_recovery_receipt', receipt.code);
  assert.equal(receipt.outcome.kind, 'recovered', receipt.outcome.code);
  assert.equal(receipt.outcome.validatedEventCount, 2);
  assert.deepEqual(caller.state.closeHandoff.prefix, prefix);
  assert((await readFile(path)).equals(originalBytes), 'maintenance did not alter history');
  const after = await stat(path);
  assert.equal(after.dev, physical.dev); assert.equal(after.ino, physical.ino);
  return restoreSetup(caller, {originalRoot, old, started});
}

/** Resume from the retained genuine current boundary without maintenance or producer replay. */
export async function resumeSetup(caller, {originalRoot, retainedHandoffPath}) {
  const started = performance.now(), old = await readJson(join(originalRoot, 'setup-observation.json'));
  const bytes = await readFile(retainedHandoffPath);
  assert.equal(digest(bytes), 'sha256:921ca0fa0c47caf785a0c8ceb707e94cd5cd069e583e07210f5bb9d0846bce22');
  const handoff = JSON.parse(bytes);
  assert.equal(hash(handoff.closeHandoff), handoff.handoffDigest);
  assert.deepEqual(handoff.closeHandoff.prefix, old.prefix);
  assert.equal(process.env.TMPDIR, join(originalRoot, 'tmp'));
  const physical = await stat(caller.eventLogPath), log = await readFile(caller.eventLogPath);
  assert.equal(physical.dev, old.prefix.storeIdentity.device);
  assert.equal(physical.ino, old.prefix.storeIdentity.inode);
  assert.equal(log.length, old.prefix.prefixLength); assert.equal(digest(log), old.prefix.prefixDigest);
  const lock = join(process.env.TMPDIR, 'abiogenesis-event-store-locks-v5', physical.dev + '-' + physical.ino + '.lock');
  await stat(lock).then(() => {throw Error('selected resource is held');}, e => {if (e.code !== 'ENOENT') throw e;});
  caller.state.closeHandoff = handoff.closeHandoff;
  await writeJson(join(caller.root, 'entry-handoff.json'), handoff);
  return restoreSetup(caller, {originalRoot, old, started});
}

async function restoreSetup(caller, {originalRoot, old, started}) {
  const prefix = caller.state.closeHandoff.prefix;
  caller.state.binding = old.binding;
  const environment = caller.refresh();
  assert.equal(environment.productInstalls.length, 1);
  const install = environment.productInstalls[0];
  assert.deepEqual({ref: install.installId, digest: hash(install)}, old.install);
  caller.state.resolvedLock = environment.resolvedProductLock;
  const {verified: v} = caller.native;
  assert.equal(v.artifactDigest, install.artifactDigest);
  assert.equal(v.productContentDigest, install.productContentDigest);
  assert.equal(v.manifestDigest, install.manifestDigest);
  assert.equal(v.productId, install.productId); assert.equal(v.packageVersion, install.packageVersion);
  const constructors = ['constructConsensusModulePublication', 'constructHelloWorldModulePublication',
    'constructDefaultGovernanceLibraryModulePublication', 'constructSelfConformanceModulePublication',
    'constructRequirementHandoffModulePublication', 'constructSemanticRevisionModulePublication',
    'constructSemanticStageModulePublication', 'constructWorksiteCommandExecutionModulePublication',
    'constructWorksiteCommandForwardModulePublication', 'constructWorksiteConstructionModulePublication',
    'constructNativeWorkspaceWorkModulePublication'];
  const publications = constructors.map(name => gtl[name]({...v, productManifestDigest: v.manifestDigest}));
  assert.deepEqual(publications.map(p => [p.moduleRef, product.modulePublicationSemanticDigest(p)]).sort(),
    v.contributionManifest.publicationBindings.map(p => [p.moduleRef, p.publicationDigest]).sort());
  const installed = abg.projectAdmittedProductInstallByAdmissionEventRef(environment.artifactTruth, install.admissionEventRef);
  caller.state.catalog = product.CatalogOperationPort.admit({kind: 'catalog_admit_packet', schemaVersion, memberKey: 'admit',
    readinessBasis: {workspaceBinding: environment.workspaceBindingCandidate, resolvedLock: environment.resolvedProductLock,
      verifiedProducts: [v], installedProducts: [installed.candidate], publications}});
  assert.equal(caller.state.catalog.kind, 'graph_function_catalog', caller.state.catalog.code);
  const programs = publications.flatMap(p => p.programs).filter(p => ['program://abiogenesis/qualification/assess@5',
    gtl.SELF_CONFORMANCE_IDS.programRef, 'program://abiogenesis/qualification/exact-candidate@5'].includes(p.programRef));
  assert.equal(programs.length, 3);
  caller.state.catalogView = product.narrowGraphFunctionCatalog(caller.state.catalog,
    [...new Set(programs.flatMap(p => p.callableMembership))].sort());
  const view = caller.state.catalogView;
  assert.equal(hash({view: {ref: 'graph-function-catalog-view://abiogenesis/' + view.viewDigest.slice(7), digest: view.viewDigest},
    effectiveHandles: [...view.allowlist], residuals: []}),
    (await readJson(join(originalRoot, 'setup-view-observation.json'))).valueDigest, 'restored view agrees with original actual Public result');
  await writeJson(join(caller.root, 'reuse-observation.json'), {status: 'restored_without_setup_replay', elapsedMs: performance.now() - started,
    prefix, install: old.install, binding: old.binding, catalogDigest: caller.state.catalog.basisDigest, viewDigest: view.viewDigest,
    originalInstallAdmissionRef: install.admissionEventRef, programs: programs.map(p => p.programRef), realProviderCalls: 0,
    currentRssBytes: process.memoryUsage().rss, currentHeapUsedBytes: process.memoryUsage().heapUsed,
    cumulativePeakRssBytes: process.resourceUsage().maxRSS * 1024});
  return {install, publications, elapsedMs: performance.now() - started};
}

export async function constructStart(caller, programRef, graphFunctionRef, input, qualificationResources) {
  const {state, native: {verified}} = caller;
  const environment = caller.refresh(), admittedInstalls = environment.productInstalls, workspaceBinding = environment.workspaceBinding;
  const resolution = await product.ProductExecutionResolutionPort.resolve({catalog: state.catalog, catalogView: state.catalogView,
    admittedInstalls, verifyInstallAdmission: install => abg.hasAdmittedProductInstall(environment.artifactTruth, install),
    programRef, selection: {kind: 'start', scope: 'program', target: 'graph_function', graphFunctionHandle: graphFunctionRef,
      until: 'converged', rootMode: 'direct'}});
  assert.equal(resolution.kind, 'loaded_product_execution_resolution', resolution.code);
  const regimes = new Set(resolution.programValidation.executableLeafRows.map(row => row.fibre));
  assert.equal(resolution.programValidation.interactionLeafRows.length, 0);
  const policy = product.constructRootInvocationPolicy(workspaceBinding, resolution.program, [],
    ['F_D', 'F_P', 'F_H'].filter(regime => regimes.has(regime)), []);
  const fixedPacket = product.RUN_OPERATION_CONTRACTS.invoke.start;
  const grants = [product.constructCapabilityGrant(policy, caller.actorRef, fixedPacket.definitionKey.operationId,
    product.DIRECT_INVOKE_CAPABILITY, {admittedInstalls, workspaceBinding, fixedPacket})];
  const authority = product.constructInvocationAuthority(caller.actorRef, workspaceBinding, state.catalogView, programRef,
    resolution.selectedCatalogEntry, policy, grants, {admittedInstalls, workspaceBinding, fixedPacket});
  assert(product.admitInstalledProductInput(resolution.productSemantics, resolution.resolution.inputContract.contractRef, input));
  const boundInput = {contract: {ref: resolution.resolution.inputContract.contractRef, digest: resolution.resolution.inputContractDigest},
    valueRef: 'input://abiogenesis/t287/installed-conservation/' + hash(input).slice(7), valueDigest: hash(input), value: input};
  const program = {ref: resolution.resolution.programRef, digest: resolution.resolution.programDigest};
  const view = {ref: 'graph-function-catalog-view://abiogenesis/' + state.catalogView.viewDigest.slice(7), digest: state.catalogView.viewDigest};
  const eventResource = caller.reopen(), steering = hash(eventResource);
  const request = {program, scope: 'program', target: {kind: 'graph_function', handle: graphFunctionRef}, until: 'converged',
    catalogView: view, allowlist: [...state.catalogView.allowlist], input: boundInput, fhMode: 'direct', rootMode: 'direct', sourceBasis: {kind: 'none'}};
  const selected = {...slots(), workspace_binding: state.binding,
    product_set: admittedInstalls.map(product.productInstallCoordinate),
    dependency_lock: {ref: workspaceBinding.lockId, digest: workspaceBinding.lockDigest},
    catalog_scope: {catalog: {ref: 'graph-function-catalog://abiogenesis/' + state.catalog.basisDigest.slice(7), digest: state.catalog.basisDigest},
      view, allowlist: request.allowlist}, execution_program: program,
    graph_function: {graphFunction: {ref: resolution.resolution.graphFunctionRef, digest: resolution.resolution.graphFunctionDigest},
      membership: resolution.resolution.programGraphFunctionMembership}, input_contract: boundInput,
    session_policy: {ref: policy.policyRef, digest: policy.policyDigest},
    capability_grants: {requiredCapabilityRefs: [...fixedPacket.metadata.capabilityRefs], grants: grants.map(g => ({ref: g.grantRef, digest: g.grantDigest}))},
    actor: {actor: coordinate(caller.actorRef, {actorRef: caller.actorRef}), attribution: {ref: authority.authorityRef, digest: authority.authorityDigest}},
    transport_steering: {ref: 'transport-steering://abiogenesis/' + steering.slice(7), digest: steering}};
  const contractCatalog = verified.definitionContractCoordinates.operations.find(value => value.operationId === fixedPacket.definitionKey.operationId)
    .members.find(value => value.memberKey === 'start').slots.request.contractCatalog;
  return installedPublic.constructInstalledPublicDefinitionCall({product, installedPublic,
    definitionContractCoordinates: verified.definitionContractCoordinates, contractCatalog, ...fixedPacket.definitionKey,
    request, slots: selected, resources: {kind: 'run_invocation_resource_assertion', schemaVersion, eventResource,
      catalog: state.catalog, catalogView: state.catalogView, applications: [], applicationResources: [], qualificationResources, source: {kind: 'none'}},
    requestRef: 'request://abiogenesis/t287/installed-conservation/' + programRef.split('/').at(-1),
    correlationRef: 'correlation://abiogenesis/t287/installed-conservation', eventTime: new Date().toISOString(),
    provenanceRefs: [pathToFileURL(join(caller.root, 'activation.json')).href]});
}

export async function prepareNative(caller, call) {
  const env = caller.refresh();
  const owner = await product.ProductRunInvocationPort.prepare({memberKey: 'start', invocation: call.invocation,
    resources: {catalog: call.resources.catalog, catalogView: call.resources.catalogView, applications: [], source: {kind: 'none'},
      qualificationResources: call.resources.qualificationResources}, admittedInstalls: env.productInstalls,
    workspaceBinding: env.workspaceBinding, verifyInstallAdmission: install => abg.hasAdmittedProductInstall(env.artifactTruth, install),
    transportResourceAssertion: call.resources.eventResource});
  assert.equal(owner.kind, 'prepared_product_run_invocation', owner.code);
  assert(owner.qualificationResources);
  return owner;
}

export function terminal(observation, valueKind) {
  const value = observation.receipt.ownerOutput.value;
  assert.equal(value.disposition, 'completed');
  assert.equal(value.stop, null);
  const result = value.terminalResult;
  assert(abg.isAbgTypedTerminalResult(result));
  assert.equal(result.valueKind, valueKind);
  assert.equal(result.producer.runRef, value.run.ref);
  assert.equal(result.valueDigest, hash(result.value));
  return result;
}

export async function freshRead(caller, selection, memberKey) {
  const env = caller.refresh(), packet = abg.ABG_PROJECT_READ_CONTRACTS[memberKey];
  const grants = packet.metadata.capabilityRefs.map(cap => product.constructCapabilityGrant(env.workspaceAuthorityBasis,
    caller.actorRef, packet.definitionKey.operationId, cap, {admittedInstalls: env.productInstalls,
      workspaceBinding: env.workspaceBinding, fixedPacket: packet}));
  const selected = {...slots(), workspace_binding: selection.slots.workspace_binding, product_set: selection.slots.product_set,
    dependency_lock: selection.slots.dependency_lock,
    capability_grants: {requiredCapabilityRefs: [...packet.metadata.capabilityRefs], grants: grants.map(g => ({ref: g.grantRef, digest: g.grantDigest}))}};
  const before = caller.state.closeHandoff.prefix;
  const request = {caseKey: memberKey, source: {sourceKind: 'run', sourceRef: selection.run.ref, sourceDigest: selection.run.digest},
    projectionBasis: {projectionBasisRef: before.eventLogRef, projectionBasisDigest: before.coordinateDigest},
    selector: memberKey === 'run_replay' ? {kind: 'ordinal_page', fromOrdinal: 0, limit: 1000} : {kind: 'none'}};
  const call = installedPublic.constructInstalledPublicDefinitionCall({product, installedPublic,
    definitionContractCoordinates: caller.native.verified.definitionContractCoordinates, contractCatalog: caller.contractCatalog,
    ...packet.definitionKey, request, slots: selected,
    resources: {kind: 'abg_project_read_resource_assertion', schemaVersion, eventResource: caller.reopen()},
    requestRef: 'request://abiogenesis/t287/installed-conservation/read/' + selection.label + '/' + memberKey,
    correlationRef: 'correlation://abiogenesis/t287/installed-conservation/read', eventTime: new Date().toISOString(),
    provenanceRefs: [pathToFileURL(join(caller.root, 'activation.json')).href]});
  const result = await caller.invoke('read-' + selection.label + '-' + memberKey, call);
  assert.deepEqual(caller.state.closeHandoff.prefix, before);
  const value = result.receipt.ownerOutput.value;
  assert.deepEqual(value.source, selection.run);
  assert.equal(hash(value.projection.terminalResult), selection.terminalDigest);
  if (selection.label === 'assessment') assert.deepEqual(value.projection.terminalResult.value.source, selection.source);
  if (memberKey === 'run_replay') assert.equal(value.projection.status, 'closed');
  return {label: selection.label, memberKey, run: selection.run, terminalDigest: selection.terminalDigest,
    producer: value.projection.terminalResult.producer, source: selection.source ?? null, status: 'preserved'};
}
