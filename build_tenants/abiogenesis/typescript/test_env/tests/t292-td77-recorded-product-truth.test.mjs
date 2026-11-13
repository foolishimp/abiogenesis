import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {mkdtemp, mkdir, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import * as Effect from 'effect/Effect';
import {evidenceInput} from '../support/evidence-root.mjs';
import {privateOwner} from '../support/r10-private-owner-harness.mjs';
import {createCurrentConformanceFixture, createCurrentTerminalFixture, recordedLockMatchesCurrentRegister} from '../support/t292-current-terminal-fixture.mjs';

// TD-77 (T-292). A recorded Product truth carrier (a resolved lock row, a
// verified artifact, a capability graph) answers the recorded question: it is
// internally established by what is recorded with it and bound by its
// digests. The strict question is the reader's register. The lanes build
// "a Product whose register differs" from a recorded lock (the tracked RC10
// current-owner fixture) and from the reader's own verified artifact, with
// every dependent digest recomputed, and tamper cases that leave one relation
// broken. The recorded question does not recompute the catalog digest, so
// identities altered among the graph's rows with every carried digest
// consistent pass it; the lanes show the door and the read-copy bindings that
// refuse them, and that every value the strict question accepts the recorded
// question accepts. Only the run-read lane at the end reads the evidence root
// (the retained D2 store of r10-child-proof); without the root it skips.
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
const admission = await built('abg/environment_admission.js');
const store = await built('abg/event_store.js');
const prefixOwner = await built('abg/event_prefix.js');
const productIndex = await built('product/index.js');
const authorityOwner = await built('product/admission_authority.js');
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

// P7 withdraws actual register members. RC10 remains the immutable recorded
// population; strict-positive work uses a fresh installed Product environment.
let currentFixture, currentLock, currentConformance;
test.before(async () => {
  currentConformance = await createCurrentConformanceFixture({after: cleanup => test.after(cleanup)});
  const {environment} = currentConformance;
  const bytes = fs.readFileSync(new URL(environment.prefix.eventLogRef));
  const events = bytes.subarray(0, environment.prefix.prefixLength).toString().trimEnd().split('\n').map(JSON.parse);
  assert.deepEqual(events.map(row => row.payload.operationId), [
    'abg.operation.product.install', 'abg.operation.product.install', 'abg.operation.workspace.bind',
  ], 'the current fixture is the actual installed two-Product environment');
  currentFixture = {events, fixture: {eventContractDigest: environment.prefix.storeIdentity.eventContractDigest}};
  currentLock = environment.resolvedProductLock;
  assert.equal(recordedLockMatchesCurrentRegister(currentLock), true);
  assert.equal(env.isResolvedProductLock(currentLock), true);
  assert.equal(recordedLockMatchesCurrentRegister(recordedLock), false);
});
// Select fixture bytes by immutable Product content, never by weakening the
// reader's question or replacing its register.
function sourceEvidenceFor(lock) {
  return currentLock !== undefined && lock.rows.some(row => currentLock.rows.some(current =>
    graphOf(current).rows.length > 0 && row.productId === current.productId && row.productContentDigest === current.productContentDigest))
    ? currentFixture : fixture;
}
test('the current executing Product completes and cold-reopens a real Hello traversal', async t => {
  const current = await createCurrentTerminalFixture(t);
  assert.equal(current.terminal.value.message, 'Hello World');
  const projection = truth.projectOwnedPrefixArtifactTruth(current.prefix);
  const installs = current.rows.filter(row => row.payload.operationId === 'abg.operation.product.install').map(row => row.eventId);
  assert.equal(truth.admittedInstallLocksAnswerStrict(projection, installs), true);
});

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
// `stale` names one dependency, [row, target], whose carried digest is kept.
function resealRows(graph, stale = null) {
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
      if (stale !== null && stale[0] === row.capabilityId && stale[1] === target.capabilityId) continue;
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
function resealCarrier(carrier, kind, skip = [], stale = null) {
  const graph = graphOf(carrier);
  if (carrier.publicContracts.some(row => row.contractId === CATALOG_SCHEMA) && !skip.includes('catalog')) {
    const before = carrier.catalogDigest;
    carrier.catalogDigest = catalogDigestOf(carrier);
    if (!skip.includes('coordinates')) {
      retagCatalog(graph, before, carrier.catalogDigest);
      if (kind === 'verified') retagCatalog(carrier.definitionContractCoordinates, before, carrier.catalogDigest);
    }
  }
  if (!skip.includes('rows')) resealRows(graph, stale);
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
const ADDED = {contractId: 'abg.contract.product.invocation-root', capabilityId: 'abg.capability.gtl.serialize@5'};
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

function lockVariant(change, {skip = [], resealDigest = true, stale = null} = {}, basis = recordedLock) {
  const lock = clone(basis);
  const row = lock.rows.find(row => graphOf(row).rows.length > 0);
  change(row, lock);
  resealCarrier(row, 'lock', skip, stale);
  if (resealDigest) resealLock(lock);
  return lock;
}
const changeRow = carrier => { graphRow(carrier, 'abg.capability.gtl.declare@5').effectRefs = sorted([...graphRow(carrier, 'abg.capability.gtl.declare@5').effectRefs, 'effect://td77/changed']); };
// Identities altered among the rows of the carrier's graph, with the catalog
// digest left as recorded and every digest that carries it consistent. The
// recorded question does not detect this (it does not recompute the catalog
// digest); the strict question refuses it at a door, and a read copy's binding
// to recorded history refuses it in a read.
const UNDETECTED = ['identities altered among the graph rows, catalog digest as recorded, every carried digest consistent', addIdentity, {skip: ['catalog']}];
// `abg.capability.gtl.admit@5` depends on `abg.capability.gtl.declare@5`; the
// slot `abg.operation.run.invoke#invoke` is owned by two rows.
const DECLARE = 'abg.capability.gtl.declare@5';
const ADMIT = 'abg.capability.gtl.admit@5';
const EXECUTE = 'abg.capability.runtime.execute-seven-term-c@5';
const staleDependency = carrier => {
  graphRow(carrier, ADMIT).dependentCapabilities.find(entry => entry.capabilityId === DECLARE).capabilityDefinitionDigest =
    sha256Canonical({td77: 'stale dependency digest'});
};
const dropSlot = carrier => {
  const owned = graphRow(carrier, EXECUTE).owningPublicContracts;
  const index = owned.findIndex(({nestedSelector: selector}) => selector.selectorKind === 'operation_definition_slot' &&
    selector.definitionKey.operationId === 'abg.operation.run.invoke' && selector.definitionKey.memberKey === 'invoke' && selector.slot === 'non_terminal');
  assert.ok(index >= 0);
  assert.ok(graphOf(carrier).rows.some(row => row.capabilityId !== EXECUTE && row.owningPublicContracts.some(owner => canonicalJson(owner) === canonicalJson(owned[index]))),
    'another row owns the slot coordinate');
  owned.splice(index, 1);
};
// Each tamper names the one relation that refuses it.
const TAMPERS = [
  ['identities changed, catalog digest recomputed, graph coordinates stale', addIdentity, {skip: ['coordinates']}, 'owner coordinates'],
  ['an identity that names no row of the graph', carrier => { contract(carrier, ADDED.contractId).capabilityIdentities = ['abg.capability.td77.absent@5']; }, {}, 'identity'],
  ['a graph row changed without its digest', changeRow, {skip: ['rows']}, 'row digest'],
  ['a graph row changed with its row digest but not the graph digest', changeRow, {skip: ['graph']}, 'graph digest'],
  ['a dependency that names no row', carrier => { graphRow(carrier, DECLARE).dependentCapabilities.push({capabilityId: 'abg.capability.td77.absent@5', capabilityDefinitionRef: 'capability-definition://abiogenesis/00', capabilityDefinitionDigest: sha256Canonical('absent')}); }, {}, 'dependency resolution'],
  ['a dependency cycle', carrier => { const declare = graphRow(carrier, DECLARE); const admit = graphRow(carrier, ADMIT); declare.dependentCapabilities = [{capabilityId: admit.capabilityId, capabilityDefinitionRef: admit.capabilityDefinitionRef, capabilityDefinitionDigest: admit.capabilityDefinitionDigest}]; }, {}, 'dependency resolution'],
  ['a dependency digest stale with the row and graph digests resealed and the graph acyclic', staleDependency, {stale: [ADMIT, DECLARE]}, 'dependency resolution'],
  ['a definition-slot coordinate dropped from one owning row with every digest resealed', dropSlot, {}, 'slot ownership'],
  ['a row dropped from the graph while a contract still names it', carrier => removeRow(carrier, true), {}, 'identity'],
];
const tamper = name => {
  const found = TAMPERS.find(([entry]) => entry === name);
  assert.ok(found, name);
  return found;
};

// The probe's carrier: the catalog digest set to a value that does not
// recompute from the carrier's contracts, carried into the contribution
// manifest and every owner coordinate, every digest resealed. The strict
// question does not recompute the catalog digest. On the current Product it
// accepts this carrier; on RC10 the actual register withdrawal refuses it.
const FORGED_CATALOG = sha256Canonical({td77: 'forged catalog digest'});
function forgeCatalog(carrier, kind) {
  const before = carrier.catalogDigest;
  carrier.catalogDigest = FORGED_CATALOG;
  retagCatalog(graphOf(carrier), before, FORGED_CATALOG);
  if (kind === 'verified') retagCatalog(carrier.definitionContractCoordinates, before, FORGED_CATALOG);
}
const forgedLock = (basis = recordedLock) => lockVariant(row => forgeCatalog(row, 'lock'), {skip: ['catalog']}, basis);

test('the unchanged recorded lock remains readable but the withdrawn register refuses it for new work', () => {
  assert.equal(env.isResolvedProductLock(recordedLock), false);
  assert.equal(env.isResolvedProductLock(currentLock), true);
  assert.equal(env.isResolvedProductLock(recordedLock, 'recorded'), true);
  for (const row of recordedLock.rows) {
    assert.equal(vp.recordedCapabilityIdentitiesHold(row), true, row.productId);
    assert.equal(cap.isCapabilityDefinitionGraph(graphOf(row), 'recorded'), true);
    assert.equal(cap.isCapabilityDefinitionGraph(graphOf(row)), row === recordedLock.rows[emptyIndex]);
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

for (const [name, change, options, relation] of TAMPERS) {
  test(`tamper (${relation}): ${name} is refused by the recorded question`, () => {
    const lock = lockVariant(change, options);
    assert.equal(env.isResolvedProductLock(lock, 'recorded'), false);
    assert.equal(env.isResolvedProductLock(lock), false);
  });
}

// The graph relations the lane recomputes itself. Slot ownership and the sort
// and order checks it does not recompute.
const GRAPH_RELATIONS = {
  'row digest': graph => graph.rows.every(row => {
    const {capabilityDefinitionRef: _ref, capabilityDefinitionDigest: digest, ...body} = row;
    return digest === sha256Canonical(body);
  }),
  'graph digest': graph => { const {graphDigest, ...body} = graph; return graphDigest === sha256Canonical(body); },
  'dependency resolution': graph => {
    const byId = new Map(graph.rows.map(row => [row.capabilityId, row]));
    return graph.rows.every(row => row.dependentCapabilities.every(dependency =>
      byId.get(dependency.capabilityId)?.capabilityDefinitionDigest === dependency.capabilityDefinitionDigest &&
      byId.get(dependency.capabilityId)?.capabilityDefinitionRef === dependency.capabilityDefinitionRef));
  },
};
const acyclic = graph => {
  const byId = new Map(graph.rows.map(row => [row.capabilityId, row]));
  const done = new Set();
  const visit = (id, path) => {
    if (path.has(id)) return false;
    if (done.has(id) || !byId.has(id)) return true;
    path.add(id);
    const holds = byId.get(id).dependentCapabilities.every(dependency => visit(dependency.capabilityId, path));
    path.delete(id);
    if (holds) done.add(id);
    return holds;
  };
  return graph.rows.every(row => visit(row.capabilityId, new Set()));
};

test('tamper relations: each tamper is refused by the relation it names, and every other relation the lane recomputes holds', () => {
  const unchanged = graphOf(recordedLock.rows[toolchainIndex]);
  for (const relation of Object.keys(GRAPH_RELATIONS)) assert.equal(GRAPH_RELATIONS[relation](unchanged), true, relation);
  assert.equal(acyclic(unchanged), true);
  for (const [name, change, options, relation] of TAMPERS) {
    const row = lockVariant(change, options).rows[toolchainIndex];
    const graph = graphOf(row);
    if (relation === 'identity') {
      assert.equal(vp.recordedCapabilityIdentitiesHold(row), false, name);
      assert.equal(cap.isCapabilityDefinitionGraph(graph, 'recorded'), true, name);
      continue;
    }
    // Every other tamper keeps each contract's identities on rows of the graph.
    assert.equal(vp.recordedCapabilityIdentitiesHold(row), true, name);
    // The owner coordinates name a catalog digest the row no longer carries;
    // the graph alone holds.
    assert.equal(cap.isCapabilityDefinitionGraph(graph, 'recorded'), relation === 'owner coordinates', name);
    for (const [computed, holds] of Object.entries(GRAPH_RELATIONS))
      assert.equal(holds(graph), computed !== relation, `${name}: ${computed}`);
  }
  // The stale dependency digest leaves the graph acyclic; the resealed cycle
  // is refused by dependency resolution, because resealing one end of a cycle
  // leaves the other end's carried digest stale.
  assert.equal(acyclic(graphOf(lockVariant(staleDependency, {stale: [ADMIT, DECLARE]}).rows[toolchainIndex])), true);
  const [, cycle, cycleOptions] = tamper('a dependency cycle');
  assert.equal(acyclic(graphOf(lockVariant(cycle, cycleOptions).rows[toolchainIndex])), false);
});

test('R1: identities altered among the graph rows with every carried digest consistent pass the recorded question and fail the strict one', () => {
  const [, change, options] = UNDETECTED;
  const lock = lockVariant(change, options);
  const row = lock.rows[toolchainIndex];
  assert.equal(row.catalogDigest, recordedLock.rows[toolchainIndex].catalogDigest, 'the catalog digest is the recorded one');
  assert.notEqual(catalogDigestOf(row), row.catalogDigest, 'and does not recompute from the altered contracts');
  assert.notEqual(lock.lockDigest, recordedLock.lockDigest);
  assert.equal(vp.recordedCapabilityIdentitiesHold(row), true);
  assert.equal(env.isResolvedProductLock(lock, 'recorded'), true);
  assert.equal(env.isResolvedProductLock(lock), false, 'a door asks the strict question');
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
  assert.equal(env.isResolvedProductLock(single), false);
  assert.equal(env.isResolvedProductLock(lockVariant(alone(() => {}), {}, currentLock)), true);
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
function candidateFor(lock, source = sourceEvidenceFor(lock).events[0]) {
  const row = lock.rows.find(entry => entry.productId === source.payload.artifact.productId);
  const installId = `product-install://${row.packageName}/${row.packageVersion}/${digestHex(row.productContentDigest)}/${digestHex(lock.lockDigest)}`;
  return {...row, kind: 'product_install_candidate', schemaVersion: '5.0.0', disposition: 'materialized',
    installId, installedRoot: source.payload.artifact.installedRoot, resolvedLockId: lock.lockId, resolvedLockDigest: lock.lockDigest};
}
function resealEvent(event) {
  const {eventId: _id, admissionOrdinal, payloadDigest: _digest, ...body} = event;
  event.payloadDigest = sha256Canonical(event.payload);
  event.eventId = `event://abiogenesis/${digestHex(sha256Canonical({...body, payloadDigest: event.payloadDigest, admissionOrdinal}))}`;
  return event;
}
// The fixture's install event `source` with its lock replaced: inline, or a
// compact reference to the earlier install event `body`.
function installEvent(lock, source = recordedEvent, body = null) {
  const event = clone(source);
  const candidate = candidateFor(lock, source);
  const installId = candidate.installId;
  const causes = body === null ? [] : [body.eventId];
  const resolvedLock = body === null ? lock : {kind: 'resolved_product_lock_reference', schemaVersion: '5.0.0',
    admissionEventRef: body.eventId, admissionEventDigest: body.payloadDigest, lockId: lock.lockId, lockDigest: lock.lockDigest};
  event.payload = {...event.payload, artifact: {...event.payload.artifact, installId}, resolvedLock,
    authorityScopeRef: installId, artifactRef: installId, artifactDigest: sha256Canonical(candidate), causationEventRefs: causes};
  Object.assign(event, {causationEventRefs: causes, aggregateId: installId, basisId: installId});
  return resealEvent(event);
}
function foldOver(event) {
  const bytes = Buffer.from(canonicalJson(event) + '\n');
  const events = store.validateHistoricalEvents(bytes, fixture.fixture.eventContractDigest);
  return truth.projectArtifactTruth(prefixOwner.selectValidatedRuntimeEventPrefix(events));
}
const productInstall = (candidate, admissionEventRef) => {
  const {kind: _kind, disposition: _disposition, ...body} = candidate;
  return {kind: 'product_install', disposition: 'admitted', ...body, admissionEventRef};
};
// The fixture's first three events (two installs, the second a compact
// reference to the first, and the workspace binding over both) with the lock
// replaced and every digest recomputed.
function recordedHistory(lock) {
  const source = sourceEvidenceFor(lock);
  const first = installEvent(lock, source.events[0]);
  const second = installEvent(lock, source.events[1], first);
  const bind = clone(source.events[2]);
  const installs = [[first, source.events[0]], [second, source.events[1]]]
    .map(([event, source]) => productInstall(candidateFor(lock, source), event.eventId));
  const binding = env.constructWorkspaceBindingInResolvedLock(bind.payload.workspaceAuthorityBasis,
    env.constructProductSet(installs, lock), lock, bind.payload.artifact.roots);
  assert.equal(binding.kind, 'workspace_binding_candidate', JSON.stringify(binding).slice(0, 300));
  const causes = [first.eventId, second.eventId];
  bind.payload = {...bind.payload, artifact: binding, authorityScopeRef: binding.bindingId, authorityScopeDigest: binding.bindingDigest,
    artifactRef: binding.bindingId, artifactDigest: binding.bindingDigest, causationEventRefs: causes};
  Object.assign(bind, {causationEventRefs: causes, aggregateId: binding.bindingId, basisId: binding.bindingId});
  const events = [first, second, resealEvent(bind)];
  return {events, binding, installs, bytes: Buffer.from(events.map(event => canonicalJson(event) + '\n').join(''))};
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
  // The recorded question accepts these, so the fold projects them: the
  // undetected alteration (refused at a door and by a read copy's binding,
  // below) and the forged catalog digest on the old recorded Product.
  for (const lock of [lockVariant(UNDETECTED[1], UNDETECTED[2]), forgedLock()]) {
    const projected = foldOver(installEvent(lock));
    assert.equal(projected.artifacts.length, 1);
    assert.deepEqual(projected.artifacts[0].resolvedLock, lock);
  }
  for (const [name, change, options] of TAMPERS) {
    assert.throws(() => foldOver(installEvent(lockVariant(change, options))),
      /Product install inline body requires one resolved lock and no body cause/, name);
  }
});

// The ./abg door: admitProductInstall asks the strict question of the
// candidate's lock before it appends. What it appends, the fold reads after a
// cold reopen.
async function admitAtDoor(lock) {
  const scratch = await mkdtemp(join(tmpdir(), 'td77-door-'));
  try {
    const eventLogPath = join(scratch, 'events.jsonl');
    const sink = store.createNewEmptyAppendSink({kind: 'new_empty_append_sink_request', schemaVersion: '5.0.0', eventLogPath});
    assert.ok(sink.store, JSON.stringify(sink).slice(0, 300));
    const source = sourceEvidenceFor(lock).events[0];
    const payload = source.payload;
    const candidate = candidateFor(lock, source);
    const basis = {operationId: payload.operationId, memberKey: payload.memberKey, definitionDigest: payload.definitionDigest,
      authorityScopeRef: candidate.installId, authorityScopeDigest: candidate.productContentDigest,
      invocationRef: payload.invocationRef, invocationPayloadDigest: payload.invocationPayloadDigest, invocationDigest: payload.invocationDigest,
      correlationId: source.correlationId, eventTime: source.eventTime, predecessorPrefix: sink.prefix, causationEventRefs: []};
    const result = admission.admitProductInstall(sink.store, candidate, basis, lock);
    const appended = sink.store.readAll().length;
    sink.store.closeDurableLog?.();
    const bytes = new Uint8Array(fs.readFileSync(eventLogPath));
    const cold = appended === 0 ? null
      : truth.projectArtifactTruth(prefixOwner.selectValidatedRuntimeEventPrefix(store.validateHistoricalEvents(bytes)));
    return {result, appended, cold};
  } finally {
    await rm(scratch, {recursive: true, force: true});
  }
}

test('door: admitProductInstall refuses before append what the strict question refuses; the fold reads what it appends after a cold reopen', async () => {
  for (const [label, lock] of [['the current lock', clone(currentLock)], ['the current forged catalog digest', forgedLock(currentLock)]]) {
    assert.equal(env.isResolvedProductLock(lock), true, label);
    const {result, appended, cold} = await admitAtDoor(lock);
    assert.equal(result.kind, 'artifact_owner_result', `${label}: ${JSON.stringify(result).slice(0, 300)}`);
    assert.equal(appended, 1, label);
    assert.equal(cold.artifacts.length, 1, label);
    assert.deepEqual(cold.artifacts[0].resolvedLock, lock, label);
  }
  for (const [label, lock] of [['the recorded lock', recordedLock], ['the recorded forged catalog digest', forgedLock()],
    ['the undetected alteration', lockVariant(UNDETECTED[1], UNDETECTED[2])],
    ...VARIANTS.map(([name, change]) => [name, lockVariant(change)])]) {
    assert.equal(env.isResolvedProductLock(lock, 'recorded'), true, label);
    const {result, appended} = await admitAtDoor(lock);
    assert.equal(result.kind, 'artifact_owner_refusal', label);
    assert.equal(result.refusal.code, 'scope_mismatch', label);
    assert.equal(appended, 0, label);
  }
});

// Reading is not running: the run door's Catalog stage admits the readiness
// basis with the strict question. The basis's workspace binding is built over
// the same lock, so binding and lock agree and the lock question alone decides
// the lock stage: the strict question refuses there, the recorded question
// passes to the verified set (empty here), which refuses after it.
function readinessBasis(lock) {
  return {workspaceBinding: recordedHistory(lock).binding, resolvedLock: lock, verifiedProducts: [], installedProducts: [], publications: []};
}

test('run door: the strict Catalog stage refuses at the lock a register variant whose own binding names it', async () => {
  const fixtureBinding = truth.projectArtifactTruth(fixture.prefix).artifacts.find(row => row.operationId === 'abg.operation.workspace.bind').artifact;
  assert.deepEqual(recordedHistory(recordedLock).binding, fixtureBinding, 'the binding built over the recorded lock is the recorded one');
  assert.equal(catalogOwner.admitGraphFunctionCatalog(readinessBasis(recordedLock)).code, 'binding_lock_mismatch');
  assert.equal(catalogOwner.admitGraphFunctionCatalog(readinessBasis(currentLock)).code, 'verified_product_mismatch',
    'the current lock passes the lock stage');
  for (const [name, change, options] of [...VARIANTS, UNDETECTED]) {
    const lock = lockVariant(change, options);
    assert.equal(catalogOwner.admitGraphFunctionCatalog(readinessBasis(lock), 'recorded').code, 'verified_product_mismatch',
      `${name}: binding and lock agree; the recorded question passes the lock stage`);
    assert.equal(catalogOwner.admitGraphFunctionCatalog(readinessBasis(lock)).code, 'binding_lock_mismatch', name);
    const resolved = await resolution.ProductExecutionResolutionPort.resolve({catalog: {readinessBasis: readinessBasis(lock)}});
    assert.equal(resolved.kind, 'product_execution_resolution_refusal', name);
    assert.equal(resolved.code, 'incompatible_or_unproven', name);
  }
});

// The workspace_status read copy: the packet's binding is a recorded
// admission, and the binding names its lock by digest. A lock that is
// internally established but is not the recorded one is not_ready.
function workspaceStatusPacket(lock, projection = truth.projectArtifactTruth(fixture.prefix), bindingId = null) {
  const bind = projection.artifacts.find(row => row.operationId === 'abg.operation.workspace.bind' && (bindingId === null || row.artifactRef === bindingId));
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
  assert.equal(projectReads.projectWorkspaceStatus(workspaceStatusPacket(recordedLock)).code, 'not_ready');
  const currentHistory = recordedHistory(currentLock);
  const currentProjection = truth.projectArtifactTruth(prefixOwner.selectValidatedRuntimeEventPrefix(
    store.validateHistoricalEvents(currentHistory.bytes, currentFixture.fixture.eventContractDigest)));
  const currentPacket = workspaceStatusPacket(currentLock, currentProjection);
  assert.equal(projectReads.projectWorkspaceStatus(currentPacket).kind, 'product_project_read_result');
  assert.deepEqual(projectReads.projectWorkspaceStatus(currentPacket), projectReads.projectWorkspaceStatus(currentPacket, 'recorded'));
  for (const [name, change, options] of [...VARIANTS, UNDETECTED]) {
    const lock = lockVariant(change, options);
    assert.equal(env.isResolvedProductLock(lock, 'recorded'), true, name);
    const refused = projectReads.projectWorkspaceStatus(workspaceStatusPacket(lock), 'recorded');
    assert.equal(refused.kind, 'product_project_read_refusal', name);
    assert.equal(refused.code, 'not_ready', name);
  }
});

// F1. The fold reads history with the recorded question and retains, with each
// install fact, whether its lock answers the strict question (the accessor
// `admittedInstallLocksAnswerStrict` of abg/artifact_truth). Nothing that
// appends, admits or grants takes a lock from those facts unless it does. The
// stores are the fixture's first three events with the lock replaced and every
// digest recomputed: the forged store's lock is the undetected alteration, the
// variant store's is register variant (i). The mixed store continues the
// variant store with the current executing Product's installs and a new
// binding over them. RC10 itself is also recorded-only after P7.
const RECORDED_ONLY = [
  ['forged', () => lockVariant(UNDETECTED[1], UNDETECTED[2])],
  ['variant', () => lockVariant(VARIANTS[0][1])],
];
function openStore(bytes) {
  const scratch = fs.mkdtempSync(join(tmpdir(), 'td77-store-'));
  const eventLogPath = join(scratch, 'events.jsonl');
  fs.writeFileSync(eventLogPath, bytes);
  const stat = fs.statSync(eventLogPath);
  const body = {kind: 'event_store_reopen_authority', schemaVersion: '5.0.0', eventLogPath, device: stat.dev, inode: stat.ino,
    eventLogDigest: 'sha256:' + createHash('sha256').update(bytes).digest('hex'), durableByteLength: bytes.length,
    eventContractDigest: fixture.fixture.eventContractDigest};
  const reopened = store.reopenEventStore({...body, authorityDigest: sha256Canonical(body)});
  assert.equal(reopened.kind, 'reopened_event_store_context', JSON.stringify(reopened).slice(0, 300));
  return {scratch, eventLogPath, store: reopened.store, prefix: reopened.prefix, count: () => reopened.store.readAll().length};
}
let invocations = 0;
function doorBasis(operationId, memberKey, scope, causationEventRefs, predecessorPrefix) {
  const invocationPayloadDigest = sha256Canonical({});
  const definitionDigest = sha256Canonical({operationId, schemaVersion: '5.0.0'});
  const invocationRef = `invocation://td77/f1/${++invocations}`;
  return {operationId, memberKey, definitionDigest, authorityScopeRef: scope.ref, authorityScopeDigest: scope.digest, invocationRef, invocationPayloadDigest,
    invocationDigest: sha256Canonical({operationId, memberKey, definitionDigest, invocationRef, invocationPayloadDigest}),
    correlationId: 'correlation://td77/f1', eventTime: '2026-11-12T00:00:00.000Z', causationEventRefs, predecessorPrefix};
}
// A new workspace binding over installs the fold admitted at `prefix`, built
// in their lock as `./abg workspace.bind` builds it. The installs are read
// with the recorded question (the internal overload): under the strict default
// a recorded-only install is not handed out, so the lane reads it as history
// to construct the candidate a caller could submit.
function newBinding(opened, prefix, installRefs, name) {
  const projection = truth.projectOwnedPrefixArtifactTruth(prefix);
  const installs = installRefs.map(ref => admission.projectAdmittedProductInstallByAdmissionEventRef(projection, ref, 'recorded'));
  assert.ok(installs.every(install => install !== null), 'the recorded question reads every install');
  const lock = installs[0].resolvedLock;
  const canonicalRoot = join(opened.scratch, name);
  const roots = Object.fromEntries(['toolchainRoot', 'productRoot', 'eventLogRoot', 'runtimeStateRoot', 'projectionRoot', 'archiveRoot']
    .map(key => [key, join(canonicalRoot, key)]));
  Object.values(roots).forEach(path => fs.mkdirSync(path, {recursive: true}));
  const manifest = {workspaceId: `workspace://td77/${name}`, authorityMode: 'trusted_developer', authorizedActorRef: 'actor://abiogenesis/td77', canonicalRoot};
  const authority = productIndex.constructWorkspaceAuthorityBasis({...manifest, authorityManifestRef: `manifest://td77/${name}`,
    authorityManifestDigest: sha256Canonical(manifest)});
  const candidate = env.constructWorkspaceBindingInResolvedLock(authority, env.constructProductSet(installs.map(row => row.install), lock), lock, roots);
  assert.equal(candidate.kind, 'workspace_binding_candidate', JSON.stringify(candidate).slice(0, 300));
  const basis = () => doorBasis('abg.operation.workspace.bind', 'bind', {ref: candidate.bindingId, digest: candidate.bindingDigest}, [...installRefs], prefix);
  return {authority, candidate, basis};
}
const bindingCoordinate = binding => ({ref: binding.bindingId, digest: binding.bindingDigest});
// The admission environment of every withAdmissionAuthority owner that takes a
// bound environment, as its owner-internal outcome.
let privateAuthority;
async function environmentAt(prefix, binding) {
  privateAuthority ??= await privateOwner('product/admission_authority.js', ['admitCapabilityEnvironmentOutcome']);
  return privateAuthority.admitCapabilityEnvironmentOutcome(authorityOwner.admissionEnvironmentSelection(prefix, bindingCoordinate(binding)), null, true);
}
// One withAdmissionAuthority owner end to end: this build's witness.admit
// reprice binding, called with the call the kept witness lane constructs
// (support/witness-reprice-mechanics) with its event resource and bound
// environment pointed at this store's closed log and a binding in it. The
// environment is checked before scope, approval and grants.
let mechanics;
async function witnessAdmission(handoff, binding) {
  mechanics ??= await (await import(new URL('test_env/support/witness-reprice-mechanics.mjs', root).href)).witnessMechanics();
  mechanics.setProjection(prefix => ({...mechanics.environment, prefix}));
  const eventResource = {kind: 'reopen_abg_event_resource', schemaVersion: '5.0.0', closeHandoff: handoff, handoffDigest: sha256Canonical(handoff)};
  const call = await mechanics.call({eventResource, changeBasis: basis => {
    basis.boundEnvironment = authorityOwner.admissionEnvironmentSelection(handoff.prefix, bindingCoordinate(binding));
  }});
  const {WITNESS_DEFINITION_BINDINGS} = await built('abg/witness_definition_bindings.js');
  return Effect.runPromise(Effect.flip(WITNESS_DEFINITION_BINDINGS.admit.reprice(call)));
}
const ENVIRONMENT_UNADMITTED = 'TypeError: admission requires the exact admitted prefix environment';

test('F1: the fold reads each store and retains whether its install lock answers the strict question', () => {
  const recorded = recordedHistory(recordedLock);
  assert.deepEqual(recorded.events, fixture.events.slice(0, 3), 'the construction reproduces the recorded events');
  for (const [label, lock, strict] of [['current', currentLock, true], ['recorded', recordedLock, false], ...RECORDED_ONLY.map(([name, make]) => [name, make(), false])]) {
    assert.equal(env.isResolvedProductLock(lock), strict, label);
    assert.equal(env.isResolvedProductLock(lock, 'recorded'), true, label);
    const history = recordedHistory(lock);
    const opened = openStore(history.bytes);
    try {
      const projection = truth.projectOwnedPrefixArtifactTruth(opened.prefix);
      assert.equal(projection.kind, 'exact_prefix_artifact_truth_projection', `${label}: ${JSON.stringify(projection).slice(0, 300)}`);
      assert.equal(projection.rows.length, 3, label);
      const installs = history.events.slice(0, 2).map(event => event.eventId);
      assert.equal(truth.admittedInstallLocksAnswerStrict(projection, installs), strict, label);
      // A copy equal to the owner's projection of its prefix gets the owner's
      // answer (the actor process receives artifact truth as such a copy); a
      // copy that differs from it gets false.
      assert.equal(truth.admittedInstallLocksAnswerStrict(clone(projection), installs), strict, `${label}: a validated copy gets the owner's answer`);
      const altered = clone(projection);
      altered.rows[0] = {...altered.rows[0], artifactDigest: sha256Canonical({td77: 'altered copy'})};
      assert.equal(truth.admittedInstallLocksAnswerStrict(altered, installs), false, `${label}: an altered copy gets false`);
    } finally {
      fs.rmSync(opened.scratch, {recursive: true, force: true});
    }
  }
});

// Every accessor that hands out an admitted install, an admitted workspace
// binding or a workspace environment from artifact truth asks the strict
// question unless its caller states `recorded` (the internal overload of the
// six that take a question; the four selections by invocation or candidate
// and the worksite binding selection take none and are strict). On a
// recorded-only store each answers as for a fact that is not admitted; on the
// current store each answers the fact. A validated copy gets the owner's
// answer.
test('F1: each accessor of admitted installs, bindings and environments asks the strict question unless its caller states recorded', async () => {
  const worksite = await built('abg/worksite_revision.js');
  for (const [label, lock, strict] of [['current', currentLock, true], ['recorded', recordedLock, false], ...RECORDED_ONLY.map(([name, make]) => [name, make(), false])]) {
    const history = recordedHistory(lock);
    const opened = openStore(history.bytes);
    try {
      const projection = truth.projectOwnedPrefixArtifactTruth(opened.prefix);
      const coordinate = bindingCoordinate(history.binding);
      const [firstEvent, secondEvent, bindEvent] = history.events;
      const recordedEnvironment = admission.projectExactPrefixWorkspaceEnvironment(opened.prefix, coordinate, 'recorded');
      assert.equal(recordedEnvironment.kind, 'exact_prefix_workspace_environment', `${label}: ${JSON.stringify(recordedEnvironment).slice(0, 300)}`);
      const binding = recordedEnvironment.workspaceBinding;
      const validated = prefixOwner.selectValidatedRuntimeEventPrefix(store.validateHistoricalEvents(history.bytes, fixture.fixture.eventContractDigest));
      for (const view of [projection, clone(projection)]) {
        const facts = {
          hasAdmittedProductInstall: question => admission.hasAdmittedProductInstall(view, history.installs[0], ...question),
          hasAdmittedWorkspaceBinding: question => admission.hasAdmittedWorkspaceBinding(view, binding, ...question),
          projectAdmittedWorkspaceProductInstall: question =>
            admission.projectAdmittedWorkspaceProductInstall(view, binding.bindingId, history.installs[1].installId, ...question) !== null,
          projectAdmittedProductInstallByAdmissionEventRef: question =>
            admission.projectAdmittedProductInstallByAdmissionEventRef(view, secondEvent.eventId, ...question) !== null,
          projectWorkspaceEnvironmentFromArtifactTruth: question =>
            admission.projectWorkspaceEnvironmentFromArtifactTruth(view, coordinate, ...question).kind === 'exact_prefix_workspace_environment',
          projectExactPrefixWorkspaceEnvironment: question =>
            admission.projectExactPrefixWorkspaceEnvironment(opened.prefix, coordinate, ...question).kind === 'exact_prefix_workspace_environment',
        };
        for (const [name, answer] of Object.entries(facts)) {
          assert.equal(answer([]), strict, `${label}: ${name} asks strict by default`);
          assert.equal(answer(['recorded']), true, `${label}: ${name} under the stated recorded question`);
        }
        const strictOnly = {
          projectAdmittedProductInstallByInvocationRef: admission.projectAdmittedProductInstallByInvocationRef(view, firstEvent.payload.invocationRef),
          projectAdmittedWorkspaceBindingByInvocationRef: admission.projectAdmittedWorkspaceBindingByInvocationRef(view, bindEvent.payload.invocationRef, lock),
          projectAdmittedProductInstall: admission.projectAdmittedProductInstall(view, candidateFor(lock, sourceEvidenceFor(lock).events[0])),
          projectAdmittedWorkspaceBinding: admission.projectAdmittedWorkspaceBinding(view, history.binding),
          projectAdmittedWorkspaceBindingAtCoordinate: worksite.projectAdmittedWorkspaceBindingAtCoordinate(validated, coordinate.ref, coordinate.digest),
        };
        for (const [name, value] of Object.entries(strictOnly)) assert.equal(value !== null, strict, `${label}: ${name} is strict`);
      }
      const refused = admission.projectExactPrefixWorkspaceEnvironment(opened.prefix, coordinate);
      if (!strict) {
        assert.equal(refused.code, 'causal_install_missing', `${label}: ${JSON.stringify(refused).slice(0, 300)}`);
        assert.equal(admission.isRecordedOnlyEnvironmentRefusal(refused), true, label);
      }
    } finally {
      fs.rmSync(opened.scratch, {recursive: true, force: true});
    }
  }
});

for (const [label, make] of RECORDED_ONLY) {
  test(`F1 (${label} store): no door, candidate or admission environment hands its recorded-only lock to work`, async () => {
    const history = recordedHistory(make());
    const installs = history.events.slice(0, 2).map(event => event.eventId);
    const opened = openStore(history.bytes);
    try {
      // ./abg workspace.bind over the recorded-only installs.
      const bind = newBinding(opened, opened.prefix, installs, 'sibling');
      const refused = admission.admitWorkspaceBinding(opened.store, bind.candidate, bind.basis(), bind.authority);
      assert.equal(refused.kind, 'artifact_owner_refusal', JSON.stringify(refused).slice(0, 300));
      assert.equal(refused.refusal.code, 'scope_mismatch');
      assert.equal(opened.count(), 3, 'nothing appended');
      // The workspace-binding branch of candidate preparation (R2), reached
      // without the door's own scope check.
      const candidate = admission.admitArtifact(opened.store, bind.basis(), 'abg.operation.workspace.bind',
        bind.candidate.bindingId, bind.candidate.bindingDigest, {artifact: bind.candidate, workspaceAuthorityBasis: bind.authority});
      assert.equal(candidate.disposition, 'refused');
      assert.equal(candidate.refusal.code, 'artifact_truth_conflict');
      assert.match(candidate.refusal.message, /causal installs whose lock answers the strict question/);
      assert.equal(opened.count(), 3, 'nothing appended');
      // The admission environment of the recorded binding (R3).
      const outcome = await environmentAt(opened.prefix, history.binding);
      assert.equal(outcome.code, 'environment_unadmitted', JSON.stringify(outcome).slice(0, 300));
      assert.throws(() => authorityOwner.admitCapabilityEnvironment(authorityOwner.admissionEnvironmentSelection(opened.prefix, bindingCoordinate(history.binding))),
        error => String(error) === ENVIRONMENT_UNADMITTED);
      // A withAdmissionAuthority owner end to end: refused before its body.
      const handoff = opened.store.projectReopenAuthorityAndClose();
      const before = fs.readFileSync(opened.eventLogPath);
      const fault = await witnessAdmission(handoff, history.binding);
      assert.equal(fault.stage, 'resource_admission', JSON.stringify(fault).slice(0, 300));
      assert.equal(fault.message, ENVIRONMENT_UNADMITTED);
      assert.deepEqual(fs.readFileSync(opened.eventLogPath), before, 'the log is unchanged');
    } finally {
      fs.rmSync(opened.scratch, {recursive: true, force: true});
    }
  });
}

test('F1: a compact install reference to a recorded-only inline lock is refused at candidate preparation', () => {
  for (const [label, make] of RECORDED_ONLY) {
    const lock = make();
    const [first] = recordedHistory(lock).events;
    const opened = openStore(Buffer.from(canonicalJson(first) + '\n'));
    try {
      const reference = installEvent(lock, fixture.events[1], first);
      const candidate = candidateFor(lock, fixture.events[1]);
      const basis = doorBasis('abg.operation.product.install', 'install', {ref: candidate.installId, digest: candidate.productContentDigest}, [first.eventId], opened.prefix);
      const result = admission.admitArtifact(opened.store, basis, 'abg.operation.product.install', candidate.installId, sha256Canonical(candidate),
        {artifact: reference.payload.artifact, resolvedLock: reference.payload.resolvedLock});
      assert.equal(result.disposition, 'refused', `${label}: ${JSON.stringify(result).slice(0, 300)}`);
      assert.equal(result.refusal.code, 'artifact_truth_conflict', label);
      assert.match(result.refusal.message, /names a lock that does not answer the strict question/, label);
      assert.equal(opened.count(), 1, `${label}: nothing appended`);
    } finally {
      fs.rmSync(opened.scratch, {recursive: true, force: true});
    }
  }
});

test('F1 (mixed store): a binding over the current build\'s installs is admitted and its environment admits work; a binding over the recorded-only installs is not', async () => {
  const history = recordedHistory(RECORDED_ONLY[1][1]());
  const recordedOnly = history.events.slice(0, 2).map(event => event.eventId);
  const opened = openStore(history.bytes);
  try {
    const install = (source, prefix) => {
      const candidate = candidateFor(currentLock, source);
      const result = admission.admitProductInstall(opened.store, candidate,
        doorBasis('abg.operation.product.install', 'install', {ref: candidate.installId, digest: candidate.productContentDigest}, [], prefix), currentLock);
      assert.equal(result.kind, 'artifact_owner_result', JSON.stringify(result).slice(0, 300));
      return result;
    };
    const first = install(currentFixture.events[0], opened.prefix);
    const second = install(currentFixture.events[1], first.successorPrefix);
    const current = [first.admissionEventRef, second.admissionEventRef];
    const bind = newBinding(opened, second.successorPrefix, current, 'current');
    const bound = admission.admitWorkspaceBinding(opened.store, bind.candidate, bind.basis(), bind.authority);
    assert.equal(bound.kind, 'artifact_owner_result', JSON.stringify(bound).slice(0, 300));
    assert.equal(opened.count(), 6);
    const prefix = bound.successorPrefix;
    const projection = truth.projectOwnedPrefixArtifactTruth(prefix);
    assert.equal(projection.rows.length, 6, 'the fold reads the whole store');
    assert.equal(truth.admittedInstallLocksAnswerStrict(projection, current), true);
    assert.equal(truth.admittedInstallLocksAnswerStrict(projection, recordedOnly), false);
    const admitted = await environmentAt(prefix, bound.value);
    assert.equal(admitted.kind, 'ok', JSON.stringify(admitted).slice(0, 300));
    assert.equal(admitted.value.resolvedProductLock.lockDigest, currentLock.lockDigest);
    assert.equal((await environmentAt(prefix, history.binding)).code, 'environment_unadmitted');
    const sibling = newBinding(opened, prefix, recordedOnly, 'sibling');
    const refused = admission.admitWorkspaceBinding(opened.store, sibling.candidate, sibling.basis(), sibling.authority);
    assert.equal(refused.refusal?.code, 'scope_mismatch', JSON.stringify(refused).slice(0, 300));
    assert.equal(opened.count(), 6, 'nothing appended');
    // End to end: the current binding's environment is admitted, and the call
    // is refused later, at scope, because its slots name the witness lane's
    // own workspace; the recorded-only binding is refused at the environment.
    const handoff = opened.store.projectReopenAuthorityAndClose();
    const before = fs.readFileSync(opened.eventLogPath);
    const later = await witnessAdmission(handoff, bound.value);
    assert.equal(later.message, 'TypeError: admission grant requires the exact admitted workspace, Product set and lock', JSON.stringify(later).slice(0, 300));
    assert.equal((await witnessAdmission(handoff, history.binding)).message, ENVIRONMENT_UNADMITTED);
    assert.deepEqual(fs.readFileSync(opened.eventLogPath), before, 'the log is unchanged');
  } finally {
    fs.rmSync(opened.scratch, {recursive: true, force: true});
  }
});

// The worksite execution environment (abg/execution_basis.ts): root and child
// execution-basis admission and the worksite command leaf source take the
// environment of the worksite carrier's binding through it. The carrier is
// the one a worksite task carries: the binding and its authority basis, read
// here from recorded history (the stated recorded question) as a carrier
// recorded before the store was read.
let privateBasis;
async function worksiteEnvironmentAt(prefix, binding) {
  privateBasis ??= await privateOwner('abg/execution_basis.js', ['exactWorksiteEnvironmentAtPrefix']);
  const environment = admission.projectExactPrefixWorkspaceEnvironment(prefix, bindingCoordinate(binding), 'recorded');
  assert.equal(environment.kind, 'exact_prefix_workspace_environment', JSON.stringify(environment).slice(0, 300));
  return privateBasis.exactWorksiteEnvironmentAtPrefix(prefix, {workspaceAuthorityBasis: environment.workspaceAuthorityBasis,
    workspaceBinding: environment.workspaceBinding, workspaceBindingId: binding.bindingId, workspaceBindingDigest: binding.bindingDigest});
}

test('F1: the worksite execution environment of a carrier whose binding names a recorded-only lock is absent', async () => {
  for (const [label, lock, strict] of [['current', currentLock, true], ['recorded', recordedLock, false], ...RECORDED_ONLY.map(([name, make]) => [name, make(), false])]) {
    const history = recordedHistory(lock);
    const opened = openStore(history.bytes);
    try {
      const environment = await worksiteEnvironmentAt(opened.prefix, history.binding);
      assert.equal(environment !== null, strict, label);
      if (strict) assert.equal(environment.resolvedProductLock.lockDigest, lock.lockDigest, label);
    } finally {
      fs.rmSync(opened.scratch, {recursive: true, force: true});
    }
  }
});

// N1 (ruling R5). The six `./abg` entries that admit or continue Run work, each
// called with the same inputs on the current store and all three recorded-only
// stores. Each entry is its emitted module re-linked by the private-owner
// harness. The strict question it asks is the real accessor of
// abg/environment_admission, which is never replaced. The three-event stores
// hold no invocation, basis or C-call, so the preconditions before that
// question that are not Product truth are replaced; each case names them. A
// sentinel after the question shows that the current store passes it. A
// recorded-only store gets the refusal the entry gives for a binding or install
// that is not admitted, and nothing is appended. The actor process, the F_H
// hold and the probabilistic result receive a copy of the projection, as a
// standalone caller passes it (R3).
const STORES = () => [['current', currentLock, true], ['recorded', recordedLock, false], ...RECORDED_ONLY.map(([name, make]) => [name, make(), false])];
const PAST = 'td77: the entry passed the strict question';
function sentinel(real) {
  const stub = (...args) => { if (stub.armed) { stub.reached += 1; throw new Error(PAST); } return real(...args); };
  return Object.assign(stub, {armed: false, reached: 0});
}
function counting(real) {
  const stub = (...args) => { if (stub.armed) stub.reached += 1; return real(...args); };
  return Object.assign(stub, {armed: false, reached: 0});
}
async function armed(stub, call) {
  stub.armed = true;
  stub.reached = 0;
  try { return await call(); } finally { stub.armed = false; }
}
// Opens the store of `lock` and reads its binding and installs as history (the
// stated recorded question): the carriers a caller of the entry holds.
async function withStore(lock, body) {
  const history = recordedHistory(lock);
  const opened = openStore(history.bytes);
  try {
    const projection = truth.projectOwnedPrefixArtifactTruth(opened.prefix);
    const environment = admission.projectExactPrefixWorkspaceEnvironment(opened.prefix, bindingCoordinate(history.binding), 'recorded');
    assert.equal(environment.kind, 'exact_prefix_workspace_environment', JSON.stringify(environment).slice(0, 300));
    return await body({history, opened, projection, environment, binding: environment.workspaceBinding, install: environment.productInstalls[0]});
  } finally {
    fs.rmSync(opened.scratch, {recursive: true, force: true});
  }
}
const thrown = async call => { try { await call(); return null; } catch (error) { return error; } };

test('N1: ./abg admitInvocation refuses a recorded-only workspace as not admitted and appends nothing', async () => {
  // Replaced: the Product boundary's invocation-candidate brand. Sentinel: the
  // held-store check that follows the environment.
  const held = sentinel(store.assertHeldEventStoreAtDurablePrefix);
  const owner = await privateOwner('abg/invocation_admission.js', [], {
    '../product/invocation.js': {isPublicInvocationCandidate: () => true},
    './event_store.js': {assertHeldEventStoreAtDurablePrefix: held},
  });
  for (const [label, lock, strict] of STORES()) {
    await withStore(lock, async ({opened, projection, binding}) => {
      const basis = doorBasis('abg.operation.run.invoke', 'invoke', bindingCoordinate(binding), [], opened.prefix);
      const invocation = {variant: 'direct', publicRequestInvocationRef: basis.invocationRef};
      const result = await armed(held, () => owner.admitInvocation(opened.store,
        {rawRequest: {}, invocation, workspaceBinding: binding, artifactTruth: clone(projection)}, basis));
      assert.equal(held.reached, strict ? 1 : 0, `${label}: ${JSON.stringify(result).slice(0, 300)}`);
      assert.equal(result.kind, 'invocation_admission_refusal', label);
      assert.deepEqual([result.code, result.message], strict
        ? ['authority_mismatch', 'invocation admission requires the exact held artifact-truth predecessor prefix']
        : ['workspace_not_admitted', 'invocation workspace and artifact truth differ from the exact ABG-owned prefix environment'], label);
      assert.equal(opened.count(), 3, `${label}: nothing appended`);
    });
  }
});

let basisOwner;
let rawInput;
let parentDigest;
async function executionBasisOwner() {
  if (basisOwner) return basisOwner;
  const prefixModule = await built('abg/event_prefix.js');
  const admit = await built('shared/admit/index.js');
  rawInput = sentinel(admit.admitJson);
  parentDigest = counting(prefixModule.runtimeEventPrefixDigest);
  // Replaced: whether the invocation is admitted at the prefix (the store holds
  // none). Sentinels: the raw-input ingress that follows the root check, and
  // the store-digest step that follows the child check.
  basisOwner = await privateOwner('abg/execution_basis.js', [], {
    './invocation_admission.js': {hasAdmittedInvocationAtPrefix: () => true},
    '../shared/admit/index.js': {admitJson: rawInput},
    './event_prefix.js': {runtimeEventPrefixDigest: parentDigest},
  });
  return basisOwner;
}
const ROOT_REFUSED = 'TypeError: ExecutionBasis requires one exact admitted invocation';

for (const carrier of [false, true]) {
  test(`N1: ./abg admitExecutionBasis refuses a root basis ${carrier ? 'with' : 'without'} a worksite carrier over a recorded-only workspace and appends nothing`, async () => {
    const owner = await executionBasisOwner();
    for (const [label, lock, strict] of STORES()) {
      await withStore(lock, async ({opened, binding, environment}) => {
        const invocationAdmission = {invocationAdmissionRef: 'invocation-admission://td77/r5', workspaceBindingId: binding.bindingId,
          workspaceBindingDigest: binding.bindingDigest};
        const rawInputValue = carrier
          ? {kind: 'worksite_construction_task', workspaceBinding: binding, workspaceAuthorityBasis: environment.workspaceAuthorityBasis}
          : {td77: 'root'};
        const error = await armed(rawInput, () => thrown(() => owner.admitExecutionBasis(opened.store, opened.prefix, {invocationAdmission, rawInputValue}, {})));
        assert.equal(String(error), strict ? `Error: ${PAST}` : ROOT_REFUSED, label);
        assert.equal(opened.count(), 3, `${label}: nothing appended`);
      });
    }
  });
}

test('N1: ./abg admitChildExecutionBasis refuses a parent over a recorded-only workspace as not current and appends nothing', async () => {
  const owner = await executionBasisOwner();
  for (const [label, lock, strict] of STORES()) {
    await withStore(lock, async ({opened, binding}) => {
      const parentExecutionBasis = {basisRef: 'execution-basis://td77/parent', workspaceBindingId: binding.bindingId, workspaceBindingDigest: binding.bindingDigest};
      const result = await armed(parentDigest, () => owner.admitChildExecutionBasis(opened.store, opened.prefix, {rawInputValue: {td77: 'child'},
        parentExecutionBasis, parentTraversalScope: {runId: 'run://td77/parent'}, rootImplementationSet: {implementationSetRef: 'implementation-set://td77'},
        rootInteractionSet: {interactionSetRef: 'interaction-set://td77'}}, {}));
      // The store holds no parent, so the current store is refused too, after
      // the strict question (the sentinel step ran); the recorded-only stores
      // are refused at it.
      assert.equal(parentDigest.reached, strict ? 1 : 0, label);
      assert.deepEqual([result.kind, result.code, result.message], ['child_execution_basis_refusal', 'parent_basis_mismatch',
        'child traversal requires one exact current workflow or deferred-application parent'], label);
      assert.equal(opened.count(), 3, `${label}: nothing appended`);
    });
  }
});

test('N1: ./abg invokeActorProcess refuses a recorded-only workspace before a process starts and appends nothing', async () => {
  // Nothing replaced before the question. Sentinel: the prefix read that
  // follows it. No worker command is reachable: the variable names none.
  const prefixModule = await built('abg/event_prefix.js');
  const read = sentinel(prefixModule.readOwnedRuntimeEventPrefixAtDurablePrefix);
  const owner = await privateOwner('abg/actor_process.js', [], {'./event_prefix.js': {readOwnedRuntimeEventPrefixAtDurablePrefix: read}});
  const command = process.env.ABG_TS_CLAUDE_COMMAND;
  process.env.ABG_TS_CLAUDE_COMMAND = '/nonexistent/td77-no-worker';
  try {
    for (const [label, lock, strict] of STORES()) {
      await withStore(lock, async ({opened, projection, binding}) => {
        const cCall = {cCallRef: 'c-call://td77/actor', runId: 'run://td77', graphCallId: 'graph-call://td77', frameId: 'frame://td77', programLocusRef: 'locus://td77',
          taskOrdinal: null, attempt: 1, implementationRef: 'implementation://td77', implementationBindingRef: 'implementation-binding://td77'};
        const request = {actorRef: 'actor://td77', implementationRef: cCall.implementationRef, inputDigest: sha256Canonical({td77: 'actor'}),
          instructionContractRef: 'contract://td77/instruction', resultContractRef: 'contract://td77/result', transportLane: 'worker_executes',
          workerBindingRef: 'worker-binding://td77', materializationPlanRef: 'plan://td77', rendererRef: 'renderer://td77', prompt: 'td77'};
        const result = await armed(read, () => owner.invokeActorProcess({store: opened.store, predecessorPrefix: opened.prefix,
          executionBasis: {basisRef: 'execution-basis://td77/actor', invocationAdmissionRef: 'invocation-admission://td77/actor',
            workspaceBindingId: binding.bindingId, workspaceBindingDigest: binding.bindingDigest},
          scope: {}, cCall, expectedInputDigest: request.inputDigest, occurrence: {...cCall},
          workerContracts: {instructionContractRef: request.instructionContractRef, resultContractRef: request.resultContractRef},
          runtime: {workspaceBinding: binding, artifactTruth: clone(projection)}, request, dispatchOrdinal: 1, basis: {}}));
        assert.equal(read.reached, strict ? 1 : 0, label);
        assert.deepEqual([result.kind, result.code, result.message], ['actor_process_effect_refusal', 'actor_process_invocation_refused',
          strict ? PAST : 'actor process request or workspace differs from the admitted execution basis'], label);
        assert.deepEqual(result.successorPrefix, opened.prefix, label);
        assert.equal(opened.count(), 3, `${label}: nothing appended and no process started`);
      });
    }
  } finally {
    if (command === undefined) delete process.env.ABG_TS_CLAUDE_COMMAND; else process.env.ABG_TS_CLAUDE_COMMAND = command;
  }
});

test('N1: ./abg admitFhInteractionHold refuses a recorded-only install and workspace and appends nothing', async () => {
  // Replaced: the admitted execution basis, scope, interaction set, cursor,
  // C-call result and judgment, route, the pending interaction and route
  // admissions staged inside the hold's transaction, construction intent and
  // locus, and the run selection (the store holds no Run). The transaction is
  // the real one. Sentinel: the input digest that follows the question.
  const digests = await built('shared/digests.js');
  const hash = sentinel(digests.sha256Canonical);
  const fh = {};
  const owner = await privateOwner('abg/continuation.js', [], {
    './c_call.js': {isAdmittedCCallJudgment: () => true, isAdmittedCCallResult: () => true, admitOwnedPlannedPendingInteraction: () => fh.pending},
    './execution_basis.js': {hasAdmittedExecutionBasisAtPrefix: () => true, hasAdmittedInteractionSetAtPrefix: () => true, isAdmittedConstructionInteractionLocus: () => false},
    './open_call.js': {hasOpenedTraversalScopeAtPrefix: () => true},
    './traversal_route.js': {isAdmittedRoute: () => true, rehydrateConstructionIntentForCursorAtPrefix: () => null,
      admitTraversalTransitionInActiveTransaction: () => ({kind: 'staged_route_transition_admission', route: fh.route})},
    './traversal_cursor.js': {hasAdmittedTraversalCursorAtPrefix: () => true},
    './event_prefix.js': {selectRuntimeEventPrefixFromAuthority: prefix => prefix},
    '../shared/digests.js': {sha256Canonical: hash},
  });
  const prefixModule = await built('abg/event_prefix.js');
  for (const [label, lock, strict] of STORES()) {
    await withStore(lock, async ({opened, projection, binding, install}) => {
      const inputValue = {td77: 'fh'};
      const cCall = {cCallRef: 'c-call://td77/fh', regime: 'F_H', actorCapabilityRef: 'capability://td77', responseContractRef: 'contract://td77/response',
        basisId: 'execution-basis://td77/fh', programLocusRef: 'locus://td77', compositionRef: null};
      const result = {resultRef: 'result://td77/fh'};
      const judgment = {judgmentRef: 'judgment://td77/fh'};
      const cursor = {cursorRef: 'cursor://td77/fh', cursorDigest: sha256Canonical({td77: 'cursor'}), traversalScopeRef: 'scope://td77/fh',
        inputDigest: sha256Canonical(inputValue), runId: 'run://td77'};
      fh.pending = {cCall, result, judgment, requestRef: 'request://td77/fh'};
      fh.route = {routeKind: 'hold', cCallRef: cCall.cCallRef, judgmentRef: judgment.judgmentRef, sourceCursorRef: cursor.cursorRef};
      const executionBasis = {basisRef: cCall.basisId, graphRef: 'graph://td77', programRef: 'program://td77', workspaceBindingId: binding.bindingId,
        workspaceBindingDigest: binding.bindingDigest};
      const error = await armed(hash, () => thrown(() => owner.admitFhInteractionHold({store: opened.store, predecessorPrefix: opened.prefix,
        pendingPlan: {expectedPrefixDigest: prefixModule.runtimeEventPrefixDigest(prefixModule.selectRuntimeEventPrefixFromStore(opened.store)),
          pending: {cCall, result, judgment}},
        routeCandidate: {transitionClass: 'route', evidence: {evidenceClass: 'hold', cCall, result, judgment}},
        executionBasis, scope: {scopeRef: cursor.traversalScopeRef, runId: 'run://td77'}, program: {programRef: executionBasis.programRef},
        graph: {materializationRef: executionBasis.graphRef}, graphFunction: {}, interactionSet: {}, cursor, request: {}, expectedInputDigest: cursor.inputDigest,
        pendingBasis: {}, routeBasis: {}, continuationBasis: {}, inputValue,
        productBasis: {artifactTruth: clone(projection), install, workspaceBinding: binding, catalogView: {kind: 'graph_function_catalog_view'}}})));
      assert.equal(hash.reached, strict ? 1 : 0, `${label}: ${String(error)}`);
      assert.equal(String(error), strict ? `Error: ${PAST}` : 'TypeError: F_H continuation requires one exact admitted pending interaction basis', label);
      assert.equal(opened.count(), 3, `${label}: nothing appended`);
    });
  }
});

test('N1: ./abg admitProbabilisticResultCandidate refuses an install of a recorded-only workspace as not admitted', async () => {
  // Replaced: the actor carrier validation and whether the execution basis and
  // implementation set are admitted at the prefix (the store holds none).
  // Sentinel: the leaf port's owner-capability question that follows.
  const owner = await privateOwner('abg/probabilistic_result.js', [], {
    './actor_process.js': {validateActorProcessCarrierPair: (request, observation) => ({kind: 'actor_process_carrier_validation', request, observation})},
    './execution_basis.js': {hasAdmittedImplementationSetAtPrefix: () => true, hasAdmittedExecutionBasisAtPrefix: () => true},
  });
  for (const [label, lock, strict] of STORES()) {
    await withStore(lock, async ({opened, projection, binding, install}) => {
      const resolution = {graphFunctionRef: 'graph-function://td77', computeRegime: 'F_P', programLocusRef: 'locus://td77', implementationRef: 'implementation://td77',
        inputContractRef: 'contract://td77/input', outputContractRef: 'contract://td77/output', packageName: install.packageName, packageVersion: install.packageVersion,
        implementationPublicationDigest: sha256Canonical({td77: 'publication'})};
      const implementationSet = {implementationSetRef: 'implementation-set://td77', implementationSetDigest: sha256Canonical({td77: 'implementation set'}),
        invocationAdmissionRef: 'invocation-admission://td77', invocationRef: 'invocation://td77', rows: [resolution]};
      const input = {td77: 'input'};
      const value = {td77: 'result'};
      const finalOutput = canonicalJson(value);
      const request = {actorRef: 'actor://td77', implementationRef: resolution.implementationRef, inputDigest: sha256Canonical(input),
        instructionContractRef: 'contract://td77/instruction', resultContractRef: 'contract://td77/raw', transportLane: 'worker_executes',
        workerBindingRef: 'worker-binding://td77', materializationPlanRef: 'plan://td77', rendererRef: 'renderer://td77', prompt: 'td77'};
      const transportDigest = sha256Canonical({td77: 'transport'});
      const observation = {...request, promptDigest: sha256Canonical(request.prompt), transportDigest, finalOutput, observedOutputDigest: sha256Canonical(value),
        artifactDigests: {prompt: sha256Bytes(request.prompt), output: sha256Bytes(finalOutput), transport: transportDigest}};
      const body = {contractCapabilityBasis: {implementationSetDigest: implementationSet.implementationSetDigest, implementationSetRef: implementationSet.implementationSetRef,
        installId: install.installId, publicationDigest: resolution.implementationPublicationDigest}, implementationRef: resolution.implementationRef,
        implementationResolutionDigest: sha256Canonical(resolution), inputContractRef: resolution.inputContractRef, inputDigest: request.inputDigest,
        instructionContractRef: request.instructionContractRef, rawResultContractRef: request.resultContractRef, rawResultDigest: sha256Canonical(value),
        targetOutputContractRef: resolution.outputContractRef};
      const verificationDigest = sha256Canonical(body);
      const preimage = {kind: 'verified_probabilistic_result_contract_preimage', schemaVersion: '5.0.0', ...body, verificationDigest,
        verificationRef: `probabilistic-result-contract-preimage://abiogenesis/${digestHex(verificationDigest)}`};
      let reached = 0;
      const leafPort = {kind: 'admitted_leaf_invocation_port', verifyProbabilisticResultContractPreimage: () => preimage,
        revalidateProbabilisticResultContractPreimage: () => preimage, hasOwnerCapability: () => { reached += 1; throw new Error(PAST); },
        implementationSetRef: implementationSet.implementationSetRef, implementationSetDigest: implementationSet.implementationSetDigest};
      const outcome = await thrown(async () => { const refused = owner.admitProbabilisticResultCandidate({artifactTruth: clone(projection),
        executionBasis: {implementationSetRef: implementationSet.implementationSetRef, implementationSetDigest: implementationSet.implementationSetDigest,
          invocationAdmissionRef: implementationSet.invocationAdmissionRef, invocationRef: implementationSet.invocationRef,
          graphFunctionRef: resolution.graphFunctionRef, workspaceBindingId: binding.bindingId, workspaceBindingDigest: binding.bindingDigest},
        input, implementationSet, leafPort, observation, prefix: opened.prefix, request, resolution,
        occurrence: {attempt: 1, cCallRef: 'c-call://td77/fp', executionAuthority: null, frameId: 'frame://td77', graphCallId: 'graph-call://td77',
          programLocusRef: resolution.programLocusRef, runId: 'run://td77', taskOrdinal: null}});
        throw Object.assign(new Error('refused'), {refused}); });
      assert.equal(reached, strict ? 1 : 0, `${label}: ${JSON.stringify(outcome.refused ?? String(outcome)).slice(0, 300)}`);
      if (strict) assert.equal(String(outcome), `Error: ${PAST}`, label);
      else assert.deepEqual([outcome.refused.kind, outcome.refused.code, outcome.refused.message], ['probabilistic_result_admission_refusal', 'unadmitted_contract_capability',
        'implementation-owner preimage does not join one admitted workspace install, publication, implementation set, and resolution'], label);
      assert.equal(opened.count(), 3, `${label}: nothing appended`);
    });
  }
});

// N2 (ruling R7). The materialization branch of candidate preparation: one
// context_bootstrap artifact that corresponds in every relation to the store's
// binding, admitted through the module export `admitArtifact` of
// abg/environment_admission (the product.materialize owner checks its bound
// environment first). The recorded store admits it; a recorded-only store
// refuses it with the branch's own text inside the existing code.
function materialization(opened, binding, basis, prefix = opened.prefix) {
  const hex = digest => digest.slice('sha256:'.length);
  const order = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  const memberKey = 'context_bootstrap';
  const bindingPair = {ref: binding.bindingId, digest: binding.bindingDigest};
  const contentRoot = join(binding.roots.projectionRoot, 'product-materializations', memberKey);
  const subject = {workspaceRef: basis.workspaceId, workspaceDigest: basis.authorityBasisDigest, bindingRef: binding.bindingId, bindingDigest: binding.bindingDigest};
  const request = {binding: bindingPair, workspace: {ref: subject.workspaceRef, digest: subject.workspaceDigest}, contextInputs: [{name: 'context://td77/r7', value: {td77: 'r7'}}]};
  const inputs = request.contextInputs.map(entry => ({inputRef: entry.name, inputDigest: sha256Canonical(entry.value), content: entry.value}))
    .sort((a, b) => order(a.inputRef, b.inputRef));
  const rows = inputs.map(entry => {
    const assetDigest = sha256Canonical({kind: 'generated_product_asset', schemaVersion: '5.0.0', materializationKind: memberKey, ...subject, ...entry});
    return {inputRef: entry.inputRef, inputDigest: entry.inputDigest, assetRef: `generated-product-asset://abiogenesis/${hex(assetDigest)}`, assetDigest,
      assetPath: join(contentRoot, 'content', `${hex(assetDigest)}.json`), disposition: 'created'};
  });
  const contentDigest = sha256Canonical(rows.map(row => row.assetDigest));
  const content = {contentRef: `context-bootstrap-content://abiogenesis/${hex(contentDigest)}`, contentDigest, contentPath: contentRoot};
  const provenance = [{provenanceRef: subject.workspaceRef, provenanceDigest: subject.workspaceDigest}, {provenanceRef: subject.bindingRef, provenanceDigest: subject.bindingDigest},
    ...inputs.map(entry => ({provenanceRef: entry.inputRef, provenanceDigest: entry.inputDigest}))].sort((a, b) => order(a.provenanceRef, b.provenanceRef));
  const manifestDigest = sha256Canonical({kind: 'product_materialization_manifest', schemaVersion: '5.0.0', materializationKind: memberKey,
    workspaceRef: subject.workspaceRef, workspaceDigest: subject.workspaceDigest, bindingRef: subject.bindingRef, bindingDigest: subject.bindingDigest,
    contentRef: content.contentRef, contentDigest: content.contentDigest, rows, validationDisposition: 'admitted', residuals: [], provenance});
  const manifest = {manifestRef: `product-materialization-manifest://abiogenesis/${hex(manifestDigest)}`, manifestDigest,
    manifestPath: join(contentRoot, 'manifests', `${hex(manifestDigest)}.json`)};
  const result = {kind: 'product_materialization_result', schemaVersion: '5.0.0', disposition: 'materialized', materializationKind: memberKey, subject, content, manifest,
    rows, validationDisposition: 'admitted', residuals: [], provenance};
  const operationId = 'abg.operation.product.materialize';
  const definitionDigest = sha256Canonical({operationId, memberKey, td77: 'r7'});
  const invocationRef = 'invocation://td77/r7/materialize';
  const invocationPayloadDigest = sha256Canonical(request);
  const invocation = {operationId, memberKey, definitionDigest, invocationRef, invocationPayloadDigest,
    invocationDigest: sha256Canonical({operationId, memberKey, definitionDigest, invocationRef, invocationPayloadDigest})};
  const artifact = {kind: 'product_materialization_artifact', schemaVersion: '5.0.0', memberKey, invocation, entryPrefix: clone(prefix),
    workspaceBinding: bindingPair, request, result};
  return admission.admitArtifact(opened.store, {...invocation, authorityScopeRef: manifest.manifestRef, authorityScopeDigest: manifest.manifestDigest,
    correlationId: 'correlation://td77/r7', eventTime: '2026-11-13T00:00:00.000Z', causationEventRefs: [binding.admissionEventRef], predecessorPrefix: prefix},
  operationId, content.contentRef, content.contentDigest, {artifact});
}

test('N2: the materialization branch refuses an environment whose lock answers only the recorded question, with its own text', async () => {
  for (const [label, lock, strict] of STORES()) {
    await withStore(lock, async ({opened, binding, environment}) => {
      const result = materialization(opened, binding, environment.workspaceAuthorityBasis);
      if (strict) {
        assert.equal(result.disposition, 'admitted', `${label}: ${JSON.stringify(result).slice(0, 300)}`);
        assert.equal(opened.count(), 4, `${label}: one artifact appended`);
      } else {
        assert.equal(result.disposition, 'refused', `${label}: ${JSON.stringify(result).slice(0, 300)}`);
        assert.equal(result.refusal.code, 'artifact_truth_conflict', label);
        assert.equal(result.refusal.message, 'artifact successor semantics refused before append: TypeError: materialization candidate requires an environment whose installs\' lock answers the strict question', label);
        assert.equal(opened.count(), 3, `${label}: nothing appended`);
      }
    });
  }
});

// End to end, on one store: its first lock answers only the recorded question
// (the variant store) and its second install, a pair of installs of the
// current build with a new binding over them, follows. History is read; the
// same work (one product.materialize context_bootstrap artifact through the
// module export `admitArtifact`) is refused over the recorded binding before
// anything is appended and admitted over the current binding.
test('end to end (mixed store): history is read; work over the recorded-only binding is refused before any append; the same work over the current binding is admitted', () => {
  const history = recordedHistory(RECORDED_ONLY[1][1]());
  const opened = openStore(history.bytes);
  try {
    const install = (source, prefix) => {
      const candidate = candidateFor(currentLock, source);
      const result = admission.admitProductInstall(opened.store, candidate,
        doorBasis('abg.operation.product.install', 'install', {ref: candidate.installId, digest: candidate.productContentDigest}, [], prefix), currentLock);
      assert.equal(result.kind, 'artifact_owner_result', JSON.stringify(result).slice(0, 300));
      return result;
    };
    const first = install(currentFixture.events[0], opened.prefix);
    const second = install(currentFixture.events[1], first.successorPrefix);
    const bind = newBinding(opened, second.successorPrefix, [first.admissionEventRef, second.admissionEventRef], 'current');
    const bound = admission.admitWorkspaceBinding(opened.store, bind.candidate, bind.basis(), bind.authority);
    assert.equal(bound.kind, 'artifact_owner_result', JSON.stringify(bound).slice(0, 300));
    const prefix = bound.successorPrefix;
    assert.equal(opened.count(), 6);
    // A read of history: the fold projects the whole store, and the recorded
    // binding's status is read with the recorded question.
    const projection = truth.projectOwnedPrefixArtifactTruth(prefix);
    assert.equal(projection.rows.length, 6, 'the fold reads the whole store');
    const old = admission.projectExactPrefixWorkspaceEnvironment(prefix, bindingCoordinate(history.binding), 'recorded');
    assert.equal(old.kind, 'exact_prefix_workspace_environment', JSON.stringify(old).slice(0, 300));
    assert.equal(admission.hasAdmittedWorkspaceBinding(projection, old.workspaceBinding, 'recorded'), true);
    const status = projectReads.projectWorkspaceStatus(workspaceStatusPacket(history.events[0].payload.resolvedLock, truth.projectArtifactTruth(prefixOwner.readOwnedRuntimeEventPrefixAtDurablePrefix(prefix)),
      history.binding.bindingId), 'recorded');
    assert.equal(status.kind, 'product_project_read_result', JSON.stringify(status).slice(0, 300));
    // Work over the recorded binding: refused before anything is appended.
    const refused = materialization(opened, old.workspaceBinding, old.workspaceAuthorityBasis, prefix);
    assert.equal(refused.disposition, 'refused', JSON.stringify(refused).slice(0, 300));
    assert.equal(refused.refusal.code, 'artifact_truth_conflict');
    assert.match(refused.refusal.message, /materialization candidate requires an environment whose installs' lock answers the strict question/);
    assert.equal(opened.count(), 6, 'nothing appended');
    // The same work over the current binding: admitted.
    const current = admission.projectExactPrefixWorkspaceEnvironment(prefix, bindingCoordinate(bound.value));
    assert.equal(current.kind, 'exact_prefix_workspace_environment', JSON.stringify(current).slice(0, 300));
    const admitted = materialization(opened, current.workspaceBinding, current.workspaceAuthorityBasis, prefix);
    assert.equal(admitted.disposition, 'admitted', JSON.stringify(admitted).slice(0, 300));
    assert.equal(opened.count(), 7, 'one artifact appended');
  } finally {
    fs.rmSync(opened.scratch, {recursive: true, force: true});
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
async function verifiedVariant(change, {skip = [], resealDigest = true, stale = null} = {}) {
  const artifact = clone(await verified());
  change(artifact);
  resealCarrier(artifact, 'verified', skip, stale);
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
  for (const [name, change, options] of [...VARIANTS, UNDETECTED]) {
    const artifact = await verifiedVariant(change, options);
    assert.equal(vp.isVerifiedProductArtifact(artifact, 'recorded'), true, name);
    assert.equal(vp.isVerifiedProductArtifact(artifact), false, name);
  }
  // The forged catalog digest passes both questions, as on the lock.
  const forged = await verifiedVariant(artifact => forgeCatalog(artifact, 'verified'), {skip: ['catalog']});
  assert.notEqual(catalogDigestOf(forged), forged.catalogDigest);
  assert.equal(vp.isVerifiedProductArtifact(forged), true);
  assert.equal(vp.isVerifiedProductArtifact(forged, 'recorded'), true);
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

// Ruling R2: everything the strict question accepts, the recorded question
// accepts. Every lock and verified artifact these lanes construct, the forged
// catalog digest of the door probe among them, and each of their graphs.
test('strict implies recorded: on every lock, verified artifact and graph the lanes construct', async () => {
  const locks = [
    ['the current lock', currentLock],
    ['the resealed current lock', lockVariant(() => {}, {}, currentLock)],
    ['the current toolchain row alone', lockVariant(alone(() => {}), {}, currentLock)],
    ['the current forged catalog digest', forgedLock(currentLock)],
    ['the recorded lock', recordedLock],
    ['the resealed recorded lock', lockVariant(() => {})],
    ['the toolchain row alone', lockVariant(alone(() => {}))],
    ['the toolchain row alone with an empty graph', lockVariant(alone(emptyGraph))],
    ['the toolchain row alone with an empty graph and an identity', lockVariant(alone(carrier => { emptyGraph(carrier); contract(carrier, ADDED.contractId).capabilityIdentities = [ADDED.capabilityId]; }))],
    ['a stale lock digest', lockVariant(addIdentity, {resealDigest: false})],
    ['the forged catalog digest', forgedLock()],
    ...[...VARIANTS, UNDETECTED, ...TAMPERS].map(([name, change, options]) => [name, lockVariant(change, options)]),
  ];
  const artifacts = [
    ['the copied verified artifact', await verified()],
    ['an empty graph', await verifiedVariant(emptyGraph)],
    ['an empty graph with an identity', await verifiedVariant(artifact => { emptyGraph(artifact); contract(artifact, ADDED.contractId).capabilityIdentities = [ADDED.capabilityId]; })],
    ['a stale verification digest', await verifiedVariant(addIdentity, {resealDigest: false})],
    ['the forged catalog digest', await verifiedVariant(artifact => forgeCatalog(artifact, 'verified'), {skip: ['catalog']})],
  ];
  for (const [name, change, options] of [...VARIANTS, UNDETECTED, ...TAMPERS]) artifacts.push([name, await verifiedVariant(change, options)]);
  const strictAccepted = [];
  for (const [name, lock] of locks) {
    const strict = env.isResolvedProductLock(lock);
    if (strict) strictAccepted.push(`lock: ${name}`);
    assert.ok(!strict || env.isResolvedProductLock(lock, 'recorded'), `lock: ${name}`);
    for (const row of lock.rows)
      assert.ok(!cap.isCapabilityDefinitionGraph(graphOf(row)) || cap.isCapabilityDefinitionGraph(graphOf(row), 'recorded'), `lock graph: ${name}`);
  }
  for (const [name, artifact] of artifacts) {
    const strict = vp.isVerifiedProductArtifact(artifact);
    if (strict) strictAccepted.push(`verified: ${name}`);
    assert.ok(!strict || vp.isVerifiedProductArtifact(artifact, 'recorded'), `verified: ${name}`);
    assert.ok(!cap.isCapabilityDefinitionGraph(graphOf(artifact)) || cap.isCapabilityDefinitionGraph(graphOf(artifact), 'recorded'), `verified graph: ${name}`);
  }
  assert.deepEqual(strictAccepted, [
    'lock: the current lock', 'lock: the resealed current lock', 'lock: the current toolchain row alone', 'lock: the current forged catalog digest',
    'verified: the copied verified artifact', 'verified: the forged catalog digest',
  ], 'the strict-accepted values the implication is checked on');
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
    // One identity added to a projected-only contract, naming a row of the
    // carrier's own graph.
    const alterAmongRows = carrier => {
      const projectedOnly = carrier.publicContracts.find(entry =>
        !graphOf(carrier).rows.some(graph => graph.owningPublicContracts.some(owning => owning.flatRow.contractId === entry.contractId)) &&
        graphOf(carrier).rows.some(graph => !entry.capabilityIdentities.includes(graph.capabilityId)));
      const added = graphOf(carrier).rows.find(graph => !projectedOnly.capabilityIdentities.includes(graph.capabilityId)).capabilityId;
      projectedOnly.capabilityIdentities = sorted([...projectedOnly.capabilityIdentities, added]);
    };
    // The register variant (catalog digest recomputed) and the undetected
    // alteration (catalog digest as recorded): both pass the recorded question
    // and fail the strict one, and both differ from the recorded lock that the
    // installs and binding name.
    for (const skip of [[], ['catalog']]) {
      const variant = clone(recordedD2);
      const row = variant.rows[toolchain];
      alterAmongRows(row);
      resealCarrier(row, 'lock', skip);
      resealLock(variant);
      assert.equal(row.catalogDigest === recordedD2.rows[toolchain].catalogDigest, skip.length > 0);
      assert.equal(env.isResolvedProductLock(variant, 'recorded'), true);
      assert.equal(env.isResolvedProductLock(variant), false);
      const lockProof = clone(proof);
      lockProof.catalog.readinessBasis.resolvedLock = variant;
      assert.throws(() => terminal(lockProof), /declaration Catalog differs from its exact admitted workspace, installs or lock/);
      assert.equal(read(lockProof).code, 'invalid_history');
    }

    // The undetected alteration on a verified Product, its lock row as
    // recorded: the Catalog's verified set must equal the lock rows, so the
    // re-admission refuses and the read is invalid_history.
    {
      const altered = clone(proof.catalog.readinessBasis);
      const verifiedRow = altered.verifiedProducts.find(entry => graphOf(entry).rows.length > 0);
      alterAmongRows(verifiedRow);
      resealCarrier(verifiedRow, 'verified', ['catalog']);
      resealVerified(verifiedRow);
      assert.equal(vp.isVerifiedProductArtifact(verifiedRow, 'recorded'), true);
      assert.equal(vp.isVerifiedProductArtifact(verifiedRow), false);
      assert.equal(catalogOwner.admitGraphFunctionCatalog(altered, 'recorded').code, 'verified_product_mismatch');
      const verifiedProof = clone(proof);
      verifiedProof.catalog.readinessBasis = altered;
      assert.throws(() => terminal(verifiedProof), /declaration Catalog differs from its exact admitted workspace, installs or lock/);
      assert.equal(read(verifiedProof).code, 'invalid_history');
    }
    // Strict implies recorded on every carrier of this store's proof.
    assert.equal(recordedLockMatchesCurrentRegister(recordedD2), false);
    assert.equal(env.isResolvedProductLock(recordedD2), false);
    assert.equal(env.isResolvedProductLock(recordedD2, 'recorded'), true);
    for (const product of proof.catalog.readinessBasis.verifiedProducts)
      assert.ok(!vp.isVerifiedProductArtifact(product) || vp.isVerifiedProductArtifact(product, 'recorded'), product.productId);

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
