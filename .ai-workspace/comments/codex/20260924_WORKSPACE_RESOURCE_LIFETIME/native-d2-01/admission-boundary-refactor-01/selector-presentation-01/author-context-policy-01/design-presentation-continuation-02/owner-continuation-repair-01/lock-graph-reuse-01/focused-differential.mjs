import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import { createRequire } from 'node:module';
import { Session } from 'node:inspector';
import { createHash } from 'node:crypto';
const evidence = dirname(fileURLToPath(import.meta.url)), root = resolve(process.argv[2]);
const requireFromTenant = createRequire(join(root, 'package.json'));
const load = name => import(pathToFileURL(join(root, 'build/code/src', name + '.js')).href);
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const current = await load('product/environment'), graphs = await load('shared/capability_contracts');
const digest = await load('shared/digests'), verify = await load('product/verify_product');
async function previous(name, overrides = {}) {
  const path = join(evidence, 'preimages/build/code/src', name + '.js');
  const module = new SourceTextModule(readFileSync(path, 'utf8'), { identifier: path });
  await module.link(async spec => {
    const value = overrides[spec] ?? await import(spec.startsWith('node:') ? spec :
      spec.startsWith('.') ? pathToFileURL(resolve(root, 'build/code/src', dirname(name), spec)).href :
      pathToFileURL(requireFromTenant.resolve(spec)).href);
    return new SyntheticModule(Object.keys(value), function () {
      for (const [key, item] of Object.entries(value)) this.setExport(key, item);
    });
  });
  await module.evaluate(); return module.namespace;
}
const oldGraphs = await previous('shared/capability_contracts');
const prior = await previous('product/environment', { '../shared/capability_contracts.js': oldGraphs });
const events = readFileSync(join(evidence, 'fixture-history.jsonl'), 'utf8').trimEnd().split('\n').map(JSON.parse);
const lock = events[0].payload.resolvedLock, candidate = events[0].payload.artifact;
const authority = events[2].payload.workspaceAuthorityBasis, binding = events[2].payload.artifact;
const installs = events.slice(0, 2).map(e => ({ ...e.payload.artifact, kind: 'product_install', disposition: 'admitted', admissionEventRef: e.eventId }));
const productSet = current.constructProductSet(installs, lock);
assert.equal(productSet.kind, 'product_set');
const report = { claim: 'bounded exact-preimage semantic differential; no installed/package/runtime qualification', cases: [], work: [], inheritedAssertions: [] };
const outcome = action => { try { return { value: action() }; } catch (error) { return { error: error.name, message: error.message }; } };
function compare(name, action, expected) {
  const before = outcome(() => action(prior)), after = outcome(() => action(current));
  assert.equal(JSON.stringify(after), JSON.stringify(before), name);
  if (expected !== undefined) assert.deepEqual(after, { value: expected }, name);
  report.cases.push({ name, result: 'error' in after ? after : typeof after.value === 'boolean' ? after.value : after.value?.kind });
}
compare('raw valid lock', p => p.isResolvedProductLock(structuredClone(lock)), true);
compare('raw valid candidate', p => p.isProductInstallCandidate(structuredClone(candidate), structuredClone(lock)), true);
compare('raw valid ProductSet', p => p.isProductSet(productSet, lock), true);
compare('binding construction', p => p.constructWorkspaceBinding(authority, productSet, lock, binding.roots), binding);
for (const extras of [[], [productSet], [undefined, authority], [productSet, authority]])
  compare('binding raw optional relation ' + extras.length + ':' + Boolean(extras[0]), p => p.isWorkspaceBindingCandidate(binding, lock, ...extras), true);
const zero = 'sha256:' + '0'.repeat(64);
function rehash(value) {
  value.lockDigest = digest.sha256Canonical({ rows: value.rows, dependencyEdges: value.dependencyEdges, nativeContractClosureDigest: value.nativeContractClosureDigest });
  value.lockId = 'product-lock://abiogenesis/' + value.lockDigest.slice(7); return value;
}
const malformed = [
  ['lock identity', x => { x.lockId += '/foreign'; }],
  ['unvalidated claimed digest', x => { x.rows[0].catalogDigest = zero; }],
  ['graph digest', x => { x.rows[0].capabilityDefinitionGraph.graphDigest = zero; rehash(x); }],
  ['graph asset', x => { x.rows[0].capabilityDefinitionGraphAsset.contentDigest = zero; rehash(x); }],
  ['catalog correspondence after complete rehash', x => {
    x.rows[0].catalogDigest = zero;
    x.rows[0].contributionManifest.publicContractCatalogDigest = zero;
    x.rows[0].contributionManifestDigest = digest.sha256Canonical(x.rows[0].contributionManifest); rehash(x);
  }],
  ['owner contract correspondence after lock rehash', x => {
    const owner = x.rows[0].capabilityDefinitionGraph.rows[0].owningPublicContracts.find(c => c.nestedSelector.selectorKind === 'flat_contract');
    x.rows[0].publicContracts.find(c => c.contractId === owner.flatRow.contractId).contractDigest = zero; rehash(x);
  }],
  ['dependency mismatch after rehash', x => { x.dependencyEdges[0].compatibilityRef += '/foreign'; rehash(x); }],
];
for (const [name, mutate] of malformed) {
  const value = structuredClone(lock); mutate(value);
  compare(name, p => p.isResolvedProductLock(value), false);
  compare('candidate refuses ' + name, p => p.isProductInstallCandidate(candidate, value), false);
}
for (const raw of [null, {}, [], 42]) {
  compare('raw malformed lock ' + JSON.stringify(raw), p => p.isResolvedProductLock(raw), false);
  compare('raw malformed candidate ' + JSON.stringify(raw), p => p.isProductInstallCandidate(raw, lock), false);
  compare('raw malformed optional set ' + JSON.stringify(raw), p => p.isWorkspaceBindingCandidate(binding, lock, raw, authority), false);
}
compare('candidate exception precedence', p => p.isProductInstallCandidate({ ...candidate, productContentDigest: null }, lock));
compare('candidate shape refusal precedes malformed lock', p => p.isProductInstallCandidate({}, null), false);
compare('binding authority/root refusal', p => p.constructWorkspaceBinding(authority, productSet, lock, { ...binding.roots, eventLogRoot: 'relative' }));
for (const graph of lock.rows.map(row => row.capabilityDefinitionGraph)) {
  assert.equal(oldGraphs.isCapabilityDefinitionGraph(graph), graphs.isCapabilityDefinitionGraph(graph));
  assert.deepEqual(oldGraphs.capabilityDefinitionGraphAssetBytes(graph), graphs.capabilityDefinitionGraphAssetBytes(graph));
  assert.deepEqual(graphs.serializeCapabilityDefinitionGraph(graph), graphs.capabilityDefinitionGraphAssetBytes(graph));
  const bad = { ...graph, graphDigest: zero };
  assert.deepEqual(outcome(() => oldGraphs.capabilityDefinitionGraphAssetBytes(bad)), outcome(() => graphs.capabilityDefinitionGraphAssetBytes(bad)));
}
const session = new Session(); session.connect();
const post = (method, params = {}) => new Promise((resolve, reject) => session.post(method, params, (error, result) => error ? reject(error) : resolve(result)));
try {
  await post('Profiler.enable'); await post('Profiler.startPreciseCoverage', { callCount: true, detailed: false });
  for (const [variant, owner] of [['preimage', prior], ['successor', current]]) {
    assert.equal(owner.isResolvedProductLock(lock), true);
    const coverage = await post('Profiler.takePreciseCoverage');
    const calls = (suffix, name) => coverage.result.filter(row => row.url.endsWith(suffix)).flatMap(row => row.functions)
      .filter(row => row.functionName === name).reduce((sum, row) => sum + row.ranges[0].count, 0);
    report.work.push({ variant, lockChecks: calls('/product/environment.js', 'isResolvedProductLock'),
      graphConstructions: calls('/shared/capability_contracts.js', 'constructCapabilityDefinitionGraph') });
  }
} finally { session.disconnect(); }
// Reproduce precisely the two failed assertions against their unchanged input
// and preimage code/dependency. They are retained failures, not waived passes.
const manifestPath = join(root, 'product-toolchain-manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const missing = manifest.publicContractCatalog.rows.find(row => row.capabilityIdentities.length === 0);
assert.equal(missing.contractId, 'abg.asset.qualification.rule-catalog');
assert.deepEqual([...oldGraphs.capabilityRefsForContract(missing.contractId)], [...graphs.capabilityRefsForContract(missing.contractId)]);
report.inheritedAssertions.push({ source: 'test_env/tests/t287-st2a-g-capability-definition-graph.test.mjs:260',
  assertion: 'every manifest catalog row has capabilityIdentities.length > 0',
  manifestSha256: hash(manifestPath), contractId: missing.contractId, preimageProjection: [...oldGraphs.capabilityRefsForContract(missing.contractId)],
  successorProjection: [...graphs.capabilityRefsForContract(missing.contractId)], actualManifestProjection: missing.capabilityIdentities, assertionPasses: false });
const verifyPath = join(root, 'build/code/src/product/verify_product.js');
assert.equal(hash(verifyPath), 'f1998352ac6e08919246a9b3c8b6af59a018e4936e43576b283c4525f6e6de18', 'verification owner exactly matches COST32 closed preimage');
const native = structuredClone(manifest.publicContractCatalog.rows.find(row => row.contractId === 'abg.contract.product.verification'));
native.capabilityIdentities = [];
assert.notEqual(verify.parseProductPublicContract(native, manifest.productId), null);
report.inheritedAssertions.push({ source: 'test_env/tests/t287-st2a-g-capability-definition-graph.test.mjs:370',
  assertion: 'parseProductPublicContract(native product.verification with empty capabilityIdentities) === null',
  verificationOwnerSha256: hash(verifyPath), closedPreimage: '../setup-cost-review-02/evidence-refs.json', samePreimageAndSuccessorOwner: true,
  returned: 'ProductPublicContract', assertionPasses: false });
writeFileSync(join(evidence, 'focused-differential.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ cases: report.cases.length, work: report.work, inheritedAssertions: report.inheritedAssertions }));
