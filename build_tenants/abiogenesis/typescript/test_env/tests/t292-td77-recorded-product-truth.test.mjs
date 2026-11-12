import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {mkdtemp, mkdir, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {evidenceInput} from '../support/evidence-root.mjs';
import {privateOwner} from '../support/r10-private-owner-harness.mjs';

// TD-77 (T-292). A recorded Product truth carrier (a resolved lock row, a
// verified artifact, a capability graph) answers the recorded question: it is
// internally established by what is recorded with it and bound by its
// digests. The strict question is the reader's register. The lanes build
// "a Product whose register differs" from a recorded lock (the tracked RC10
// current-owner fixture) and from the reader's own verified artifact, with
// every dependent digest recomputed, and tamper cases that leave one relation
// broken. Only the run-read lane at the end reads the evidence root (the
// retained D2 store of r10-child-proof); without the root it skips.
const root = new URL('../../', import.meta.url);
const built = path => import(new URL(`build/code/src/${path}`, root).href);
const env = await built('product/environment.js');
const vp = await built('product/verify_product.js');
const cap = await built('shared/capability_contracts.js');
const pub = await built('product/public_contract_publication.js');
const catalogOwner = await built('product/catalog.js');
const resolution = await built('product/execution_resolution.js');
const projectReads = await built('product/project_read_ports.js');
const truth = await built('abg/artifact_truth.js');
const store = await built('abg/event_store.js');
const prefixOwner = await built('abg/event_prefix.js');
const {sha256Canonical, sha256Bytes} = await built('shared/digests.js');
const {canonicalJson} = await built('shared/canonical_json.js');
const {loadCurrentOwnerEvidence} = await import(new URL('test_env/support/t287-current-owner-evidence.mjs', root).href);

const CATALOG_SCHEMA = 'abg.schema.public-contract-catalog';
const clone = value => structuredClone(value);
const digestHex = digest => digest.slice('sha256:'.length);
const sorted = values => [...values].sort();
const graphOf = carrier => carrier.capabilityDefinitionGraph;
const contract = (carrier, id) => carrier.publicContracts.find(row => row.contractId === id);
const graphRow = (carrier, id) => graphOf(carrier).rows.find(row => row.capabilityId === id);

// The recorded lock: the first install of the RC10 native-assessment
// population, one toolchain row and one empty-graph consumer row.
const fixture = loadCurrentOwnerEvidence('native-assessment');
const recordedEvent = fixture.events[0];
const recordedLock = recordedEvent.payload.resolvedLock;
assert.equal(recordedLock.kind, 'resolved_product_lock');
const toolchainIndex = recordedLock.rows.findIndex(row => graphOf(row).rows.length > 0);
const emptyIndex = recordedLock.rows.findIndex(row => graphOf(row).rows.length === 0);
assert.ok(toolchainIndex >= 0 && emptyIndex >= 0);

// Recompute the digests a carrier's identities and graph feed, in order. A
// step named in `skip` is left stale.
function catalogDigestOf(carrier) {
  const schemas = carrier.publicContracts.filter(row => row.contractId === CATALOG_SCHEMA);
  assert.equal(schemas.length, 1);
  return pub.productPublicContractCatalogDigest({
    schemaVersion: '5.0.0', catalogId: carrier.catalogId, catalogVersion: '5.0.0',
    catalogSchemaPath: schemas[0].assetLocator.path, catalogSchemaDigest: schemas[0].assetLocator.contentDigest,
    rows: carrier.publicContracts, catalogDigest: carrier.catalogDigest,
  });
}
function retagCatalog(value, from, to) {
  if (Array.isArray(value)) value.forEach(entry => retagCatalog(entry, from, to));
  else if (value !== null && typeof value === 'object') {
    if (value.contractCatalog?.catalogDigest === from) value.contractCatalog.catalogDigest = to;
    Object.values(value).forEach(entry => retagCatalog(entry, from, to));
  }
}
function resealRows(graph) {
  const byId = new Map(graph.rows.map(row => [row.capabilityId, row]));
  const sealed = new Set();
  const seal = id => {
    if (sealed.has(id)) return;
    sealed.add(id);
    const row = byId.get(id);
    for (const dependency of row.dependentCapabilities) {
      const target = byId.get(dependency.capabilityId);
      if (target === undefined) continue;
      seal(target.capabilityId);
      dependency.capabilityDefinitionRef = target.capabilityDefinitionRef;
      dependency.capabilityDefinitionDigest = target.capabilityDefinitionDigest;
    }
    const {capabilityDefinitionRef: _ref, capabilityDefinitionDigest: _digest, ...body} = row;
    row.capabilityDefinitionDigest = sha256Canonical(body);
    row.capabilityDefinitionRef = `capability-definition://abiogenesis/${digestHex(row.capabilityDefinitionDigest)}`;
  };
  graph.rows.forEach(row => seal(row.capabilityId));
}
function resealGraph(graph) {
  const {graphDigest: _digest, ...body} = graph;
  graph.graphDigest = sha256Canonical(body);
}
function resealCarrier(carrier, kind, skip = []) {
  const graph = graphOf(carrier);
  if (carrier.publicContracts.some(row => row.contractId === CATALOG_SCHEMA) && !skip.includes('catalog')) {
    const before = carrier.catalogDigest;
    carrier.catalogDigest = catalogDigestOf(carrier);
    if (!skip.includes('coordinates')) {
      retagCatalog(graph, before, carrier.catalogDigest);
      if (kind === 'verified') retagCatalog(carrier.definitionContractCoordinates, before, carrier.catalogDigest);
    }
  }
  if (!skip.includes('rows')) resealRows(graph);
  if (!skip.includes('graph')) resealGraph(graph);
  carrier.capabilityDefinitionGraphAsset.contentDigest = sha256Bytes(cap.serializeCapabilityDefinitionGraph(graph));
  carrier.contributionManifest.publicContractCatalogDigest = carrier.catalogDigest;
  carrier.contributionManifest.capabilityDefinitionGraph = {graphId: graph.graphId, graphVersion: graph.graphVersion, graphDigest: graph.graphDigest};
  carrier.contributionManifestDigest = sha256Canonical(carrier.contributionManifest);
  const ids = graph.rows.map(row => row.capabilityId);
  carrier.declaredCapabilityRefs = ids;
  carrier.publicCapabilityRefs = kind === 'lock'
    ? sorted(new Set(carrier.publicContracts.flatMap(row => row.capabilityIdentities)))
    : ids;
}
function resealLock(lock) {
  lock.lockDigest = sha256Canonical({rows: lock.rows, dependencyEdges: lock.dependencyEdges, nativeContractClosureDigest: lock.nativeContractClosureDigest});
  lock.lockId = `product-lock://abiogenesis/${digestHex(lock.lockDigest)}`;
}
function resealVerified(artifact) {
  const {verificationDigest: _digest, verificationRef: _ref, ...body} = artifact;
  artifact.verificationDigest = sha256Canonical(body);
  artifact.verificationRef = `product-verification://abiogenesis/${digestHex(artifact.verificationDigest)}`;
}

// The three register differences, applied to one carrier.
const ADDED = {contractId: 'abg.vocabulary.review-ruling-kind', capabilityId: 'abg.capability.gtl.serialize@5'};
const REMOVED_ROW = 'abg.capability.module.publish@5';
const REMOVED_IDENTITY = 'abg.capability.catalog.invoke-graph-function@5';
function addIdentity(carrier) {
  const row = contract(carrier, ADDED.contractId);
  assert.ok(!graphOf(carrier).rows.some(graph => graph.owningPublicContracts.some(owner => owner.flatRow.contractId === ADDED.contractId)),
    'a projected-only contract');
  assert.ok(!row.capabilityIdentities.includes(ADDED.capabilityId));
  assert.ok(graphRow(carrier, ADDED.capabilityId), 'the added identity names a graph row');
  row.capabilityIdentities = sorted([...row.capabilityIdentities, ADDED.capabilityId]);
}
function removeIdentity(carrier) {
  const holders = carrier.publicContracts.filter(row => row.capabilityIdentities.includes(REMOVED_IDENTITY));
  assert.ok(holders.length > 1, 'the capability stays projected by another contract');
  const row = holders.find(entry => !graphOf(carrier).rows.some(graph => graph.owningPublicContracts.some(owner => owner.flatRow.contractId === entry.contractId)));
  assert.ok(row, 'a projected-only holder');
  row.capabilityIdentities = row.capabilityIdentities.filter(id => id !== REMOVED_IDENTITY);
}
function removeRow(carrier, keepIdentity = false) {
  const graph = graphOf(carrier);
  assert.ok(graphRow(carrier, REMOVED_ROW));
  graph.rows = graph.rows.filter(row => row.capabilityId !== REMOVED_ROW);
  graph.rows.forEach(row => { row.dependentCapabilities = row.dependentCapabilities.filter(d => d.capabilityId !== REMOVED_ROW); });
  if (!keepIdentity) carrier.publicContracts.forEach(row => { row.capabilityIdentities = row.capabilityIdentities.filter(id => id !== REMOVED_ROW); });
}
const VARIANTS = [
  ['(i) one identity added to a projected-only contract', addIdentity],
  ['(ii) one identity removed from a contract', removeIdentity],
  ['(iii) one capability row removed with every identity and dependency naming it', carrier => removeRow(carrier)],
];

function lockVariant(change, {skip = [], resealDigest = true} = {}) {
  const lock = clone(recordedLock);
  const row = lock.rows[toolchainIndex];
  change(row, lock);
  resealCarrier(row, 'lock', skip);
  if (resealDigest) resealLock(lock);
  return lock;
}
const changeRow = carrier => { graphRow(carrier, 'abg.capability.gtl.declare@5').effectRefs = sorted([...graphRow(carrier, 'abg.capability.gtl.declare@5').effectRefs, 'effect://td77/changed']); };
const TAMPERS = [
  ['identities changed with the catalog digest stale', addIdentity, {skip: ['catalog']}],
  ['identities changed, catalog digest recomputed, graph coordinates stale', addIdentity, {skip: ['coordinates']}],
  ['an identity that names no row of the graph', carrier => { contract(carrier, ADDED.contractId).capabilityIdentities = ['abg.capability.td77.absent@5']; }, {}],
  ['a graph row changed without its digest', changeRow, {skip: ['rows']}],
  ['a graph row changed with its row digest but not the graph digest', changeRow, {skip: ['graph']}],
  ['a dependency that names no row', carrier => { graphRow(carrier, 'abg.capability.gtl.declare@5').dependentCapabilities.push({capabilityId: 'abg.capability.td77.absent@5', capabilityDefinitionRef: 'capability-definition://abiogenesis/00', capabilityDefinitionDigest: sha256Canonical('absent')}); }, {}],
  ['a dependency cycle', carrier => { const declare = graphRow(carrier, 'abg.capability.gtl.declare@5'); const admit = graphRow(carrier, 'abg.capability.gtl.admit@5'); declare.dependentCapabilities = [{capabilityId: admit.capabilityId, capabilityDefinitionRef: admit.capabilityDefinitionRef, capabilityDefinitionDigest: admit.capabilityDefinitionDigest}]; }, {}],
  ['a row dropped from the graph while a contract still names it', carrier => removeRow(carrier, true), {}],
];

test('the recorded lock answers both questions under the reader\'s unchanged register', () => {
  assert.equal(env.isResolvedProductLock(recordedLock), true);
  assert.equal(env.isResolvedProductLock(recordedLock, 'recorded'), true);
  for (const row of recordedLock.rows) {
    assert.equal(vp.recordedCapabilityIdentitiesHold(row), true, row.productId);
    assert.equal(cap.isCapabilityDefinitionGraph(graphOf(row), 'recorded'), true);
    assert.equal(cap.isCapabilityDefinitionGraph(graphOf(row)), true);
  }
  const resealed = lockVariant(() => {});
  assert.deepEqual(resealed, recordedLock, 'resealing an unchanged lock reproduces every recorded digest');
});

for (const [name, change] of VARIANTS) {
  test(`register variant ${name}: the recorded question accepts the lock, the strict question refuses it`, () => {
    const lock = lockVariant(change);
    assert.notEqual(lock.lockDigest, recordedLock.lockDigest);
    assert.notEqual(lock.rows[toolchainIndex].catalogDigest, recordedLock.rows[toolchainIndex].catalogDigest,
      'the changed identities move the catalog digest');
    assert.equal(env.isResolvedProductLock(lock, 'recorded'), true);
    assert.equal(env.isResolvedProductLock(lock), false);
    assert.equal([lock].every(env.isResolvedProductLock), false, 'a callback index asks the strict question');
  });
}

for (const [name, change, options] of TAMPERS) {
  test(`tamper: ${name} is refused by the recorded question`, () => {
    const lock = lockVariant(change, options);
    assert.equal(env.isResolvedProductLock(lock, 'recorded'), false);
    assert.equal(env.isResolvedProductLock(lock), false);
  });
}

test('tamper relations: each refusal is the named relation', () => {
  const row = index => lockVariant(TAMPERS[index][1], TAMPERS[index][2]).rows[toolchainIndex];
  // identities with a stale catalog digest, an identity naming no row, a row
  // dropped while named: the identity relation
  for (const index of [0, 2, 7]) assert.equal(vp.recordedCapabilityIdentitiesHold(row(index)), false, TAMPERS[index][0]);
  // stale coordinates: identities and graph hold, the flat coordinates do not
  assert.equal(vp.recordedCapabilityIdentitiesHold(row(1)), true);
  assert.equal(cap.isCapabilityDefinitionGraph(graphOf(row(1)), 'recorded'), true);
  // the graph relations
  for (const index of [3, 4, 5, 6]) assert.equal(cap.isCapabilityDefinitionGraph(graphOf(row(index)), 'recorded'), false, TAMPERS[index][0]);
});

// The recorded consumer row has an empty graph and no contract; the toolchain
// row with its graph emptied stands in for an empty-graph row with contracts.
// The consumer is dropped with its edge, because its declared dependency
// requires capabilities the emptied row no longer defines.
const emptyGraph = carrier => {
  graphOf(carrier).rows = [];
  carrier.publicContracts.forEach(row => { row.capabilityIdentities = []; });
  if ('definitionContractCoordinates' in carrier) carrier.definitionContractCoordinates = null;
};
const alone = change => (carrier, lock) => { lock.rows = [carrier]; lock.dependencyEdges = []; change(carrier); };
test('tamper: an empty-graph row whose contract carries an identity is refused by the recorded question', () => {
  assert.equal(recordedLock.rows[emptyIndex].publicContracts.length, 0);
  const single = lockVariant(alone(() => {}));
  assert.equal(env.isResolvedProductLock(single, 'recorded'), true, 'the toolchain row alone is a lock');
  assert.equal(env.isResolvedProductLock(single), true);
  const lock = lockVariant(alone(emptyGraph));
  const row = lock.rows[0];
  assert.equal(vp.recordedCapabilityIdentitiesHold(row), true, 'an empty graph with no identity');
  assert.equal(env.isResolvedProductLock(lock, 'recorded'), true);
  assert.equal(env.isResolvedProductLock(lock), false, 'the register maps these contracts to capabilities');
  const named = lockVariant(alone(carrier => { emptyGraph(carrier); contract(carrier, ADDED.contractId).capabilityIdentities = [ADDED.capabilityId]; }));
  assert.equal(vp.recordedCapabilityIdentitiesHold(named.rows[0]), false);
  assert.equal(env.isResolvedProductLock(named, 'recorded'), false);
  assert.equal(env.isResolvedProductLock(named), false);
});

test('tamper: a stale lock digest is refused by the recorded question', () => {
  const lock = lockVariant(addIdentity, {resealDigest: false});
  assert.equal(env.isResolvedProductLock(lock, 'recorded'), false);
  resealLock(lock);
  assert.equal(env.isResolvedProductLock(lock, 'recorded'), true);
});

// The fold: one recorded install admission whose inline lock is replaced, with
// the compact install body, scope, artifact digest, payload digest and event
// identity recomputed as the recorded cut would have written them.
function installEvent(lock) {
  const event = clone(recordedEvent);
  const row = lock.rows.find(entry => entry.productId === event.payload.artifact.productId);
  const installId = `product-install://${row.packageName}/${row.packageVersion}/${digestHex(row.productContentDigest)}/${digestHex(lock.lockDigest)}`;
  const candidate = {...row, kind: 'product_install_candidate', schemaVersion: '5.0.0', disposition: 'materialized',
    installId, installedRoot: event.payload.artifact.installedRoot, resolvedLockId: lock.lockId, resolvedLockDigest: lock.lockDigest};
  event.payload = {...event.payload, artifact: {...event.payload.artifact, installId}, resolvedLock: lock,
    authorityScopeRef: installId, artifactRef: installId, artifactDigest: sha256Canonical(candidate)};
  event.aggregateId = installId;
  event.basisId = installId;
  const {eventId: _id, admissionOrdinal, payloadDigest: _digest, ...body} = event;
  event.payloadDigest = sha256Canonical(event.payload);
  event.eventId = `event://abiogenesis/${digestHex(sha256Canonical({...body, payloadDigest: event.payloadDigest, admissionOrdinal}))}`;
  return event;
}
function foldOver(event) {
  const bytes = Buffer.from(canonicalJson(event) + '\n');
  const events = store.validateHistoricalEvents(bytes, fixture.fixture.eventContractDigest);
  return truth.projectArtifactTruth(prefixOwner.selectValidatedRuntimeEventPrefix(events));
}

test('fold: artifact truth over an accepted register variant projects; over a tampered lock it throws as today', () => {
  const recorded = foldOver(installEvent(clone(recordedLock)));
  assert.equal(recorded.artifacts.length, 1);
  assert.deepEqual(recorded.artifacts[0].resolvedLock, recordedLock, 'the reseal reproduces the recorded event');
  for (const [name, change] of VARIANTS) {
    const lock = lockVariant(change);
    const projected = foldOver(installEvent(lock));
    assert.equal(projected.artifacts.length, 1, name);
    assert.deepEqual(projected.artifacts[0].resolvedLock, lock, name);
  }
  for (const [name, change, options] of TAMPERS) {
    assert.throws(() => foldOver(installEvent(lockVariant(change, options))),
      /Product install inline body requires one resolved lock and no body cause/, name);
  }
});

// Reading is not running: the run door's Catalog stage admits the readiness
// basis with the strict question. A lock that is internally established but
// is not the reader's is refused there with the same code as on the base.
function readinessBasis(lock) {
  const projection = truth.projectArtifactTruth(fixture.prefix);
  const bind = projection.artifacts.find(row => row.operationId === 'abg.operation.workspace.bind');
  return {workspaceBinding: bind.artifact, resolvedLock: lock, verifiedProducts: [], installedProducts: [], publications: []};
}

test('run door: a readiness basis whose lock is a register variant is refused by the strict Catalog stage', async () => {
  assert.equal(catalogOwner.admitGraphFunctionCatalog(readinessBasis(recordedLock)).code, 'verified_product_mismatch',
    'the recorded lock passes the lock check and the empty verified set is refused after it');
  for (const [name, change] of VARIANTS) {
    const basis = readinessBasis(lockVariant(change));
    assert.equal(catalogOwner.admitGraphFunctionCatalog(basis).code, 'binding_lock_mismatch', name);
    const resolved = await resolution.ProductExecutionResolutionPort.resolve({catalog: {readinessBasis: basis}});
    assert.equal(resolved.kind, 'product_execution_resolution_refusal', name);
    assert.equal(resolved.code, 'incompatible_or_unproven', name);
  }
});

// The workspace_status read copy: the packet's binding is a recorded
// admission, and the binding names its lock by digest. A lock that is
// internally established but is not the recorded one is not_ready.
function workspaceStatusPacket(lock) {
  const projection = truth.projectArtifactTruth(fixture.prefix);
  const bind = projection.artifacts.find(row => row.operationId === 'abg.operation.workspace.bind');
  const {kind: _kind, ...body} = bind.artifact;
  const binding = {kind: 'workspace_binding', ...body, admissionEventRef: bind.admissionEventRef};
  // The recorded binding's ProductSet orders its installs by the binding's causes.
  const installs = bind.causationEventRefs.map(ref =>
    projection.artifacts.find(row => row.admissionEventRef === ref).artifactRef);
  const productSetDigest = sha256Canonical({orderedInstallRefs: installs, lockId: lock.lockId, lockDigest: lock.lockDigest});
  const productSet = {kind: 'product_set', schemaVersion: '5.0.0', productSetId: `product-set://abiogenesis/${digestHex(productSetDigest)}`,
    productSetDigest, orderedInstallRefs: installs, lockId: lock.lockId, lockDigest: lock.lockDigest};
  return {kind: 'product_project_read_packet', schemaVersion: '5.0.0', memberKey: 'workspace_status',
    sourceRef: binding.bindingId, sourceDigest: binding.bindingDigest,
    projectionBasis: {basisRef: 'projection-basis://td77', basisDigest: sha256Canonical({td77: true}), value: {td77: true}},
    binding, resolvedLock: lock, productSet, configurationCoordinates: [], catalogCoordinate: null, selector: {kind: 'none'}};
}

test('workspace_status: the recorded question reads the recorded lock and refuses a variant that is not the recorded value', () => {
  const recorded = projectReads.projectWorkspaceStatus(workspaceStatusPacket(recordedLock), 'recorded');
  assert.equal(recorded.kind, 'product_project_read_result', JSON.stringify(recorded).slice(0, 400));
  assert.deepEqual(projectReads.projectWorkspaceStatus(workspaceStatusPacket(recordedLock)), recorded,
    'under the unchanged register both questions project the same status');
  for (const [name, change] of VARIANTS) {
    const lock = lockVariant(change);
    const refused = projectReads.projectWorkspaceStatus(workspaceStatusPacket(lock), 'recorded');
    assert.equal(refused.kind, 'product_project_read_refusal', name);
    assert.equal(refused.code, 'not_ready', name);
  }
});

// The verified-artifact carrier: the reader's own verification of this
// tenant, copied so that the owner's retained verification does not answer.
let verifiedArtifact;
async function verified() {
  if (verifiedArtifact) return verifiedArtifact;
  const {packProduct} = await import(new URL('scripts/product-payload.mjs', root).href);
  const product = await built('product/index.js');
  const scratch = await mkdtemp(join(tmpdir(), 'td77-verified-'));
  try {
    const artifacts = join(scratch, 'artifacts');
    await mkdir(artifacts);
    const tenant = new URL('.', root).pathname;
    const [packed] = await packProduct(tenant, artifacts);
    const artifactPath = join(artifacts, packed.filename);
    const manifest = JSON.parse(await readFile(new URL('product-toolchain-manifest.json', root), 'utf8'));
    const value = await product.verifyProduct({
      artifactPath, artifactRef: packed.filename, expectedArtifactDigest: await product.sha256File(artifactPath),
      expectedProductContentDigest: manifest.productContentDigest, expectedManifestDigest: product.sha256Canonical(manifest),
      expectedProductId: manifest.productId, expectedPackageName: manifest.packageName, expectedPackageVersion: manifest.packageVersion,
    });
    assert.equal(value.disposition, 'verified', JSON.stringify(value).slice(0, 400));
    verifiedArtifact = clone(value);
    return verifiedArtifact;
  } finally {
    await rm(scratch, {recursive: true, force: true});
  }
}
async function verifiedVariant(change, {skip = [], resealDigest = true} = {}) {
  const artifact = clone(await verified());
  change(artifact);
  resealCarrier(artifact, 'verified', skip);
  if (resealDigest) resealVerified(artifact);
  return artifact;
}

test('verified artifact: the copied carrier answers both questions', async () => {
  const artifact = await verified();
  assert.equal(vp.isVerifiedProductArtifact(artifact), true);
  assert.equal(vp.isVerifiedProductArtifact(artifact, 'recorded'), true);
  assert.deepEqual(await verifiedVariant(() => {}), artifact, 'resealing reproduces every digest of the carrier');
});

test('verified artifact: each register variant is accepted by the recorded question and refused by the strict one', async () => {
  for (const [name, change] of VARIANTS) {
    const artifact = await verifiedVariant(change);
    assert.equal(vp.isVerifiedProductArtifact(artifact, 'recorded'), true, name);
    assert.equal(vp.isVerifiedProductArtifact(artifact), false, name);
  }
});

test('verified artifact: each tamper case is refused by the recorded question', async () => {
  for (const [name, change, options] of TAMPERS) {
    const artifact = await verifiedVariant(change, options);
    assert.equal(vp.isVerifiedProductArtifact(artifact, 'recorded'), false, name);
    assert.equal(vp.isVerifiedProductArtifact(artifact), false, name);
  }
  const emptied = await verifiedVariant(emptyGraph);
  assert.equal(vp.isVerifiedProductArtifact(emptied, 'recorded'), true, 'an empty graph with no identity is established');
  const emptyWithIdentity = await verifiedVariant(artifact => {
    emptyGraph(artifact);
    contract(artifact, ADDED.contractId).capabilityIdentities = [ADDED.capabilityId];
  });
  assert.equal(vp.isVerifiedProductArtifact(emptyWithIdentity, 'recorded'), false, 'an empty graph with an identity');
  const stale = await verifiedVariant(addIdentity, {resealDigest: false});
  assert.equal(vp.isVerifiedProductArtifact(stale, 'recorded'), false, 'a stale verification digest');
});

// The run-read copy: the Public run read asks the recorded question of a
// supplied historical declaration proof, and the proof is bound twice. The
// re-admitted Catalog's lock, workspace and installs equal the environment's
// recorded admissions; the Catalog basis digest equals the recorded root
// basis's. Each binding refuses as invalid_history on the Public read.
const D2 = 'comments/codex/20260911_D2_BOUNDED_REPAIR/installed-continuation-09/installed-frame-01/';
const logInput = evidenceInput({path: D2 + 'events-01/runtime.events.jsonl', sha256: 'f841bba98385cb572a944edf1793634fcf10baf59a74331110042bcb200f8e82', bytes: 19058361});
const readyInput = evidenceInput({path: D2 + 'attempt-01/program-ready-16.json', sha256: '2147862a16f8526d546ca918563b8d8b8094e684d8f629784b256e4803d3fc02', bytes: 12781893});
const absent = [logInput, readyInput].find(input => input.kind === 'absent');
test('run read: the recorded question reads a supplied proof bound to the recorded lock and root basis', {skip: absent?.reason}, async () => {
  const ports = await built('abg/project_read_ports.js');
  const {projectExactExecutionBasisAtPrefix} = await built('abg/invocation_execution_truth.js');
  const {reopenEventStore, closeHeldEventStoreAtDurablePrefix} = store;
  const hash = bytes => createHash('sha256').update(bytes).digest('hex');
  const logBytes = logInput.bytes.subarray(0, 13540472);
  const lines = logBytes.toString('utf8').trimEnd().split('\n');
  const events = lines.map(line => JSON.parse(line));
  const ready = JSON.parse(readyInput.bytes);
  const proof = {kind: 'abg_historical_declaration_proof', schemaVersion: '5.0.0', catalog: ready.call.resources.catalog, catalogView: ready.call.resources.catalogView};
  const scratch = fs.mkdtempSync(join(tmpdir(), 'td77-run-read-'));
  try {
    const log = join(scratch, 'runtime.events.jsonl');
    fs.writeFileSync(log, logBytes);
    const copy = fs.statSync(log);
    const authority = {kind: 'event_store_reopen_authority', schemaVersion: '5.0.0', eventLogPath: log, device: copy.dev, inode: copy.ino,
      eventLogDigest: 'sha256:' + hash(logBytes), durableByteLength: logBytes.length, eventContractDigest: ready.closeHandoff.prefix.storeIdentity.eventContractDigest};
    const reopened = reopenEventStore({...authority, authorityDigest: sha256Canonical(authority)});
    assert.equal(reopened.kind, 'reopened_event_store_context');
    const {prefix: current} = closeHeldEventStoreAtDurablePrefix(reopened.store, reopened.prefix);
    const selected = Buffer.from(lines.slice(0, 67).join('\n') + '\n');
    const {coordinateDigest: _digest, ...base} = clone(current);
    const body = {...base, prefixLength: selected.length, prefixDigest: 'sha256:' + hash(selected)};
    const prefix = {...body, coordinateDigest: sha256Canonical(body)};
    const close = events.find(event => event.admissionOrdinal === 67);
    const read = supplied => ports.prepareRunReadAtDurablePrefix(prefix, 'graph_call_result', close.graphCallId).project(supplied);

    // The recorded proof projects on the Public read, as on the strict port.
    const positive = read(proof);
    assert.equal(positive.kind, 'abg_project_read_projection', JSON.stringify(positive).slice(0, 400));
    const packet = {kind: 'abg_project_read_packet', schemaVersion: '5.0.0', memberKey: 'graph_call_result', prefix, targetRef: close.graphCallId, declarationProof: proof};
    assert.deepEqual(ports.GraphCallProjectionPort.graph_call_result(packet).value, positive.value);
    const owner = await privateOwner('abg/project_read_ports.js', ['prepareRead', 'scopeForBasis', 'terminalContract']);
    const prepared = owner.prepareRead('graph_call_result', packet, undefined, undefined, 'recorded');
    assert.equal(prepared.question, 'recorded');
    const basis = projectExactExecutionBasisAtPrefix(prepared.fullPrefix, close.basisId);
    const scope = owner.scopeForBasis(prepared.fullPrefix, basis);
    const terminal = supplied => owner.terminalContract({...prepared, packet: {...packet, declarationProof: supplied}}, basis, scope);
    assert.equal(terminal(proof).ref, 'contract://abiogenesis/semantic-stage/envelope@5');

    // Lock binding: a register variant of the recorded lock is established
    // (the recorded question accepts it) and differs from the recorded lock
    // its installs and binding name.
    const recordedD2 = proof.catalog.readinessBasis.resolvedLock;
    const toolchain = recordedD2.rows.findIndex(row => graphOf(row).rows.length > 0);
    const variant = clone(recordedD2);
    const row = variant.rows[toolchain];
    const projectedOnly = row.publicContracts.find(entry =>
      !graphOf(row).rows.some(graph => graph.owningPublicContracts.some(owning => owning.flatRow.contractId === entry.contractId)) &&
      graphOf(row).rows.some(graph => !entry.capabilityIdentities.includes(graph.capabilityId)));
    const added = graphOf(row).rows.find(graph => !projectedOnly.capabilityIdentities.includes(graph.capabilityId)).capabilityId;
    projectedOnly.capabilityIdentities = sorted([...projectedOnly.capabilityIdentities, added]);
    resealCarrier(row, 'lock');
    resealLock(variant);
    assert.equal(env.isResolvedProductLock(variant, 'recorded'), true);
    assert.equal(env.isResolvedProductLock(variant), false);
    const lockProof = clone(proof);
    lockProof.catalog.readinessBasis.resolvedLock = variant;
    assert.throws(() => terminal(lockProof), /declaration Catalog differs from its exact admitted workspace, installs or lock/);
    assert.equal(read(lockProof).code, 'invalid_history');

    // Root basis binding: a verified Product changed outside its lock row,
    // resealed, re-admitted under the recorded question with its View narrowed
    // exactly, keeps the lock and installs and changes the Catalog basis digest.
    const changed = clone(proof.catalog.readinessBasis);
    const verifiedRow = changed.verifiedProducts.find(entry => graphOf(entry).rows.length > 0);
    verifiedRow.checkedPayloadFiles += 1;
    resealVerified(verifiedRow);
    assert.equal(vp.isVerifiedProductArtifact(verifiedRow, 'recorded'), true);
    const catalog = catalogOwner.admitGraphFunctionCatalog(changed, 'recorded');
    assert.equal(catalog.kind, 'graph_function_catalog', JSON.stringify(catalog).slice(0, 300));
    assert.notEqual(catalog.basisDigest, proof.catalog.basisDigest);
    const catalogView = catalogOwner.narrowGraphFunctionCatalog(catalog, proof.catalogView.allowlist);
    const basisProof = {...proof, catalog, catalogView};
    assert.throws(() => terminal(basisProof), /historical Catalog\/View differs from the root basis/);
    assert.equal(read(basisProof).code, 'invalid_history');
  } finally {
    fs.rmSync(scratch, {recursive: true, force: true});
  }
});
