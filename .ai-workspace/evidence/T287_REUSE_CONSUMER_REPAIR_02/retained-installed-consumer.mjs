import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {dirname, isAbsolute, join, relative, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const schemaVersion = '5.0.0';
export const bytesDigest = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');

/** Pins describe original owners; reading never copies their bodies into a report. */
export async function readPinnedJson(pin, ledger = []) {
  const bytes = await readFile(pin.path);
  assert.equal(bytes.length, pin.bytes, 'retained input extent differs');
  assert.equal(bytesDigest(bytes), 'sha256:' + pin.sha256, 'retained input body differs');
  ledger.push({path: pin.path, bytes: bytes.length, sha256: pin.sha256, duty: 'cold input authentication'});
  return JSON.parse(bytes.toString('utf8'));
}

function confined(root, locator) {
  assert.equal(typeof locator, 'string');
  const path = resolve(root, locator), rel = relative(resolve(root), path);
  assert.ok(rel && !isAbsolute(rel) && rel !== '..' && !rel.startsWith('../'), 'package locator escapes its owner');
  return path;
}

/** Native invocations use only the selected package's declared public exports. */
export async function loadRetainedInstalledRuntime(root) {
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.name, '@abiogenesis/typescript-tenant');
  const exports = {};
  for (const name of ['product', 'abg', 'public', 'validator']) {
    const entry = pkg.exports['./' + name];
    const locator = typeof entry === 'string' ? entry : entry?.import;
    exports[name] = await import(pathToFileURL(confined(root, locator)).href);
  }
  return Object.freeze({...exports, root: resolve(root), packageExports: Object.keys(pkg.exports)});
}

/** Explicit private component boundary; this does not create a Public export. */
export async function loadQualificationPreparationOwners(runtime, pins, ledger = []) {
  const expected = ['qualification.js', 'qualification_resources.js'];
  const modules = [];
  for (let i = 0; i < expected.length; i++) {
    const pin = pins[i], rel = relative(runtime.root, pin.path);
    assert.ok(rel && !isAbsolute(rel) && !rel.startsWith('../'));
    assert.equal(pin.path.split('/').at(-1), expected[i]);
    const bytes = await readFile(pin.path);
    assert.equal(bytes.length, pin.bytes);
    assert.equal(bytesDigest(bytes), 'sha256:' + pin.sha256);
    ledger.push({...pin, duty: 'installed canonical component owner; not Public API'});
    modules.push(await import(pathToFileURL(pin.path).href));
  }
  return Object.freeze({qualification: modules[0], resources: modules[1], visibility: 'installed_private_component_only'});
}

export function verificationRequest(item) {
  return {artifactPath: item.artifactPath, artifactRef: item.artifactRef,
    ...Object.fromEntries(['ArtifactDigest', 'ProductContentDigest', 'ManifestDigest', 'ProductId', 'PackageName', 'PackageVersion']
      .map(k => ['expected' + k, item.basis[k[0].toLowerCase() + k.slice(1)]]))};
}

/** Reports keep coordinates and original pins; the live verified object stays native. */
export function nativeCallReport(product, call, outcome, originalPins = []) {
  const receipt = outcome.receipt;
  return {standing: 'native_consumer_observation', originalPins,
    invocation: {ref: call.invocation.invocationRef, digest: call.invocation.invocationDigest},
    definitionKey: call.invocation.definitionKey, requestDigest: product.sha256Canonical(call.invocation.request),
    outcome: {kind: outcome.kind, code: outcome.code ?? null,
      outcomeKind: receipt?.ownerOutput?.outcomeKind ?? null, exitCode: receipt?.exitCode ?? null,
      valueDigest: receipt?.ownerOutput?.value === undefined ? null : product.sha256Canonical(receipt.ownerOutput.value)},
    resourcePrefix: receipt?.resources?.eventResource === undefined ? null
      : product.sha256Canonical(receipt.resources.eventResource)};
}

/** One outer acquisition, borrowed native successor selections, one outer close. */
export function openRetainedInstalledConsumer({runtime, ownerRequest, verification, handoff, setup}) {
  const {product, abg, public: installedPublic} = runtime, hash = product.sha256Canonical;
  const verified = verification.verifiedArtifact;
  assert.strictEqual(product.selectOwnedProductVerification(ownerRequest, verified), verified,
    'fresh JSON verification is not an owner-issued native artifact');
  assert.equal(setup.workspaceBindingCandidate.authorizedActorRef, setup.currentActor);
  const input = {kind: 'reopen_abg_event_resource', schemaVersion,
    closeHandoff: handoff.closeHandoff, handoffDigest: hash(handoff.closeHandoff)};
  assert.equal(input.handoffDigest, handoff.handoffDigest);
  const acquired = abg.acquireAbgEventResource(input);
  assert.equal(acquired.kind, 'acquired_abg_event_resource', acquired.code ?? 'resource acquisition refused');
  const outer = acquired.resource;
  let selection = abg.selectAcquiredAbgEventResource(outer, outer.entryPrefix), closed = false, callOrdinal = 0;
  const coord = (ref, value = {ref}) => ({ref, digest: hash(value)});
  const actor = {actor: coord(setup.currentActor), attribution: coord(setup.currentActor + '/retained-consumer')};
  const contractCatalog = {productId: verified.productId, productContentDigest: verified.productContentDigest,
    catalogId: verified.catalogId, catalogVersion: schemaVersion, catalogDigest: verified.catalogDigest};
  const alive = () => {
    assert.equal(closed, false, 'retained consumer is closed');
    abg.assertAcquiredAbgEventResourceSelectionCurrent(selection);
    assert.strictEqual(product.selectOwnedProductVerification(ownerRequest, verified), verified);
  };
  return {
    get selection() { alive(); return selection; },
    get verified() { return verified; },
    async authorize(packet, request, resources, supplied = {}) {
      alive();
      const definition = installedPublic.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d =>
        d.definitionKey.operationId === packet.definitionKey.operationId && d.definitionKey.memberKey === packet.definitionKey.memberKey);
      assert.ok(definition);
      const slots = {workspace_binding: setup.workspaceBinding, product_set: setup.productInstalls.map(product.productInstallCoordinate),
        dependency_lock: {ref: setup.resolvedLock.lockId, digest: setup.resolvedLock.lockDigest}, catalog_scope: null,
        execution_program: null, graph_function: null, input_contract: null, session_policy: null,
        capability_grants: {requiredCapabilityRefs: [...definition.capabilityRefs], grants: []}, actor,
        transport_steering: null, verification_references: null, execution_basis: null, ...supplied};
      const basis = {kind: 'admission_capability_data', schemaVersion,
        definition: {definitionKey: definition.definitionKey, definitionRef: definition.definitionRef,
          definitionDigest: definition.definitionDigest, owner: {ref: packet.owner.authorityRef, digest: packet.owner.authorityDigest}},
        ownerArtifact: {request: ownerRequest, verified}, request,
        resourceScope: {resourcesDigest: hash(resources), authoritySlots: product.admissionAuthoritySlots(slots)},
        boundEnvironment: product.admissionEnvironmentSelection(selection.prefix, slots.workspace_binding)};
      const authorityValue = {actorRef: setup.currentActor, authorityMode: 'trusted_developer'};
      const approvalValue = {decision: 'allow', actorRef: setup.currentActor, definitionRef: definition.definitionRef,
        definitionDigest: definition.definitionDigest, requestDigest: hash(request), scopeDigest: product.admissionAuthorityScope(basis).digest};
      const base = setup.currentActor + '/retained-consumer/' + callOrdinal++;
      const authority = {kind: 'resolved_admission_authority', schemaVersion, actorRef: setup.currentActor,
        authorityMode: 'trusted_developer', authority: {...coord(base + '/authority', authorityValue), value: authorityValue},
        approval: {...coord(base + '/approval', approvalValue), value: approvalValue}};
      const grants = await Promise.all(definition.capabilityRefs.map(cap => product.constructCapabilityGrant(authority,
        setup.currentActor, definition.definitionKey.operationId, cap,
        {kind: 'admission_capability_grant_construction_basis', fixedPacket: packet, data: basis})));
      return installedPublic.constructInstalledPublicDefinitionCall({product, installedPublic,
        definitionContractCoordinates: verified.definitionContractCoordinates, contractCatalog, ...packet.definitionKey,
        request, slots: {...slots, capability_grants: {requiredCapabilityRefs: [...definition.capabilityRefs],
          grants: grants.map(g => ({ref: g.grantRef, digest: g.grantDigest}))}},
        resources: {...resources, admissionAuthority: {basis, authority, grants}},
        requestRef: base + '/request', correlationRef: base + '/correlation', eventTime: new Date().toISOString(),
        provenanceRefs: [ownerRequest.artifactRef]});
    },
    async invoke(call) {
      alive();
      const outcome = await installedPublic.runInstalledDefinitionCallWithResource(selection, call);
      const completion = outcome.receipt?.resources?.eventResource;
      if (completion?.kind === 'abg_event_resource_completion') {
        assert.equal(completion.entryPrefix.coordinateDigest, selection.prefix.coordinateDigest);
        assert.equal(abg.isAcquiredAbgEventResourceSelection(completion.successor), true);
        abg.assertAcquiredAbgEventResourceSelectionCurrent(completion.successor);
        assert.strictEqual(abg.abgEventResourceOutcomePrefix(completion), completion.successor.prefix);
        selection = completion.successor;
      }
      return outcome;
    },
    close() {
      alive();
      const receipt = abg.closeAbgEventResource(outer, selection.prefix);
      closed = true;
      return receipt;
    },
  };
}

/** Cold recovery authenticates original bytes/declarations; it never reruns the Result producer. */
export function recoverOriginalChild(runtime, {prefix, graphCallRef, declarationProof, expected}) {
  const terminal = runtime.abg.projectClosedGraphCallTerminalAtDurablePrefix(prefix, graphCallRef, declarationProof);
  assert.ok(terminal, 'original closed child Result is unavailable or its declaration proof differs');
  assert.equal(terminal.result.ref, expected.resultRef);
  assert.equal(terminal.producer.runRef, expected.runRef);
  assert.equal(terminal.producer.graphCallRef, graphCallRef);
  assert.equal(terminal.value.judgmentRef, expected.judgmentRef);
  return terminal;
}
