import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL, fileURLToPath } from 'node:url';

const predecessor = process.env.ABI5_D17_PREDECESSOR;
const retained = process.env.ABI5_D17_SCRATCH;
const root = resolve(import.meta.dirname, '../..');
const names = ['resolvedLockValidationEntries', 'resolvedLockCompleteChecks', 'resolvedLockCompleteRows',
  'productSetValidationEntries', 'workspaceBindingConstructions', 'workspaceBindingValidationEntries'];
const counts = () => Object.fromEntries(names.map(k => [k, globalThis.p0Work?.[k] ?? 0]));
const diff = (a, b) => Object.fromEntries(names.map(k => [k, b[k] - a[k]]));
const load = async root => Object.fromEntries(await Promise.all(['product/environment', 'abg/environment_admission',
  'shared/digests'].map(async name => [name.split('/').at(-1), await import(pathToFileURL(join(root, 'build/code/src', name + '.js')))])));
const outcome = action => { try { return { returned: action() }; } catch (error) { return { error: error.name, message: error.message }; } };

test('environment predicates and projection conserve raw meanings with one sufficient lock guard', {
  skip: !predecessor || !retained, timeout: 180000,
}, async () => {
  assert.ok(globalThis.p0Work, 'existing entry/completion counters required');
  const modules = [await load(predecessor), await load(root)];
  const scratch = await mkdtemp(join(tmpdir(), 'd17-environment-controls-'));
  const call = JSON.parse(await readFile(join(retained, 'full-call.json')));
  const prefix = JSON.parse(await readFile(join(retained, 'full-outcome.json'))).resources.eventResource.closeHandoff.prefix;
  const original = fileURLToPath(prefix.eventLogRef), bytes = await readFile(original), path = join(scratch, 'events.jsonl');
  await writeFile(path, bytes); const node = await stat(path);
  const { coordinateDigest, ...prefixBody } = prefix;
  Object.assign(prefixBody, { eventLogRef: pathToFileURL(path).href,
    storeIdentity: { ...prefix.storeIdentity, device: node.dev, inode: node.ino } });
  const copiedPrefix = { ...prefixBody, coordinateDigest: modules[1].digests.sha256Canonical(prefixBody) };
  const selected = call.invocation.invocationAuthority.slots.workspace_binding;
  const report = { scope: 'raw guards and existing owners on immutable copied history; no live continuation or Public qualification',
    scratch, original, historySha256: modules[1].digests.sha256Bytes(bytes), measurements: [], cases: [] };
  const environments = [];
  for (const [variant, m] of modules.entries()) {
    const before = counts(), value = m.environment_admission.projectExactPrefixWorkspaceEnvironment(copiedPrefix, selected);
    assert.equal(value.kind, 'exact_prefix_workspace_environment'); environments.push(value);
    report.measurements.push({ variant, owner: 'raw exact environment including history admission', ...diff(before, counts()) });
    const pureBefore = counts();
    assert.deepEqual(m.environment_admission.projectWorkspaceEnvironmentFromArtifactTruth(value.artifactTruth, selected), value);
    const work = diff(pureBefore, counts());
    assert.equal(work.resolvedLockCompleteChecks, variant === 0 ? 2 * value.productInstalls.length + 6 : value.productInstalls.length + 2);
    assert.equal(work.workspaceBindingConstructions, variant === 0 ? 2 : 0);
    report.measurements.push({ variant, owner: 'pure environment over authenticated artifact truth', ...work });
  }
  assert.deepEqual(environments[1], environments[0]);
  const { resolvedProductLock: lock, productSet: set, workspaceAuthorityBasis: authority,
    workspaceBindingCandidate: binding, artifactTruth } = environments[0];
  const installRow = artifactTruth.rows.find(x => x.operationId === 'abg.operation.product.install');
  const workspaceRow = artifactTruth.rows.find(x => x.operationId === 'abg.operation.workspace.bind');
  const candidate = installRow.artifact;
  const check = (label, action, expected) => {
    const values = modules.map((m, i) => outcome(() => action(m, environments[i])));
    assert.deepEqual(values[1], values[0], label);
    if (expected !== undefined) assert.deepEqual(values[1], { returned: expected }, label);
    report.cases.push({ label, outcome: 'error' in values[1] ? values[1].error :
      typeof values[1].returned === 'boolean' ? values[1].returned : values[1].returned?.code ?? values[1].returned?.kind ?? null });
    return values[1].returned;
  };
  for (const [variant, m] of modules.entries()) {
    const p = m.environment;
    for (const [label, args, oldCount] of [['neither', [], 1], ['set only', [set], 2],
      ['authority only', [undefined, authority], 1], ['both', [set, authority], 3]]) {
      const before = counts(); assert.equal(p.isWorkspaceBindingCandidate(binding, lock, ...args), true);
      const work = diff(before, counts()); assert.equal(work.resolvedLockCompleteChecks, variant === 0 ? oldCount : 1);
      assert.equal(work.workspaceBindingConstructions, variant === 0 && label === 'both' ? 1 : 0);
      report.measurements.push({ variant, owner: 'binding ' + label, ...work });
    }
    for (const [label, action] of [
      ['install rehydration', () => m.environment_admission.projectAdmittedProductInstallByInvocationRef(environments[variant].artifactTruth, installRow.invocationRef)],
      ['binding rehydration', () => m.environment_admission.projectAdmittedWorkspaceBindingByInvocationRef(environments[variant].artifactTruth, workspaceRow.invocationRef, lock)],
    ]) {
      const before = counts(); assert.ok(action()); const work = diff(before, counts());
      assert.equal(work.resolvedLockCompleteChecks, variant === 0 ? 2 : 1);
      report.measurements.push({ variant, owner: label, ...work });
    }
  }
  check('raw lock valid', m => m.environment.isResolvedProductLock(structuredClone(lock)), true);
  check('raw install valid', m => m.environment.isProductInstallCandidate(structuredClone(candidate), structuredClone(lock)), true);
  check('raw set valid', m => m.environment.isProductSet(structuredClone(set), structuredClone(lock)), true);
  check('raw binding constructor', m => m.environment.constructWorkspaceBinding(authority, set, lock, binding.roots), binding);
  const hash = modules[1].digests.sha256Canonical, zero = 'sha256:' + '0'.repeat(64);
  const rehashLock = value => {
    value.lockDigest = hash({ rows: value.rows, dependencyEdges: value.dependencyEdges, nativeContractClosureDigest: value.nativeContractClosureDigest });
    value.lockId = 'product-lock://abiogenesis/' + value.lockDigest.slice(7); return value;
  };
  const lockMutations = [
    ['extra key', x => { x.extra = true; }], ['missing rows', x => { delete x.rows; }],
    ['identity', x => { x.lockId += '/foreign'; }], ['digest', x => { x.lockDigest = zero; }],
    ['duplicate Product', x => { x.rows.push(structuredClone(x.rows[0])); rehashLock(x); }],
    ['catalog coordinate', x => { x.rows[0].catalogDigest = zero; rehashLock(x); }],
    ['graph coordinate', x => { x.rows[0].capabilityDefinitionGraph.graphDigest = zero; rehashLock(x); }],
    ['graph asset', x => { x.rows[0].capabilityDefinitionGraphAsset.contentDigest = zero; rehashLock(x); }],
    ['contribution coordinate', x => { x.rows[0].contributionManifestDigest = zero; rehashLock(x); }],
    ['public contract coordinate', x => { x.rows[0].publicContractRefs.push('contract://foreign'); rehashLock(x); }],
    ['foreign edge', x => { x.dependencyEdges.push({ kind: 'requires', fromProductId: 'foreign', toProductId: 'absent' }); rehashLock(x); }],
  ];
  for (const [label, mutate] of lockMutations) {
    const forged = structuredClone(lock); mutate(forged);
    check('raw lock ' + label, m => m.environment.isResolvedProductLock(forged), false);
    check('binding with lock ' + label, m => m.environment.isWorkspaceBindingCandidate(binding, forged, set, authority), false);
    check('install with lock ' + label, m => m.environment.isProductInstallCandidate(candidate, forged), false);
  }
  for (const key of ['installId', 'catalogDigest', 'contributionManifestDigest', 'productContentDigest', 'resolvedLockDigest']) {
    const forged = structuredClone(candidate); forged[key] = key.endsWith('Digest') ? zero : forged[key] + '/foreign';
    check('forged install ' + key, m => m.environment.isProductInstallCandidate(forged, lock), false);
  }
  check('relative install root', m => m.environment.isProductInstallCandidate({ ...candidate, installedRoot: 'relative' }, lock), false);
  if (lock.dependencyEdges.length) {
    const forged = structuredClone(lock); forged.dependencyEdges[0].compatibilityRef += '/foreign'; rehashLock(forged);
    check('well-shaped mismatched dependency edge', m => m.environment.isWorkspaceBindingCandidate(binding, forged, set, authority), false);
  }
  for (const raw of [null, {}, [], 42, 'raw']) {
    check('malformed lock ' + JSON.stringify(raw), m => m.environment.isWorkspaceBindingCandidate(binding, raw, set, authority), false);
    check('malformed optional set ' + JSON.stringify(raw), m => m.environment.isWorkspaceBindingCandidate(binding, lock, raw, authority), false);
    check('malformed optional authority ' + JSON.stringify(raw), m => m.environment.isWorkspaceBindingCandidate(binding, lock, set, raw), false);
    check('malformed install ' + JSON.stringify(raw), m => m.environment.isProductInstallCandidate(raw, lock), false);
  }
  for (const key of Object.keys(binding)) {
    const forged = structuredClone(binding); delete forged[key];
    check('binding missing ' + key, m => m.environment.isWorkspaceBindingCandidate(forged, lock, set, authority), false);
  }
  const rehashBinding = value => {
    const { kind, schemaVersion, bindingId, bindingDigest, ...body } = value;
    value.bindingDigest = hash(body); value.bindingId = 'workspace-binding://abiogenesis/' + value.bindingDigest.slice(7); return value;
  };
  for (const key of ['workspaceId', 'authorityBasisId', 'authorityBasisDigest', 'authorizedActorRef',
    'productSetId', 'productSetDigest', 'lockId', 'lockDigest']) {
    const forged = structuredClone(binding); forged[key] = key.endsWith('Digest') ? zero : forged[key] + '/foreign'; rehashBinding(forged);
    check('self-consistent foreign binding ' + key, m => m.environment.isWorkspaceBindingCandidate(forged, lock, set, authority), false);
    check('optional-free foreign binding ' + key, m => m.environment.isWorkspaceBindingCandidate(forged, lock));
  }
  for (const [label, forged] of [['empty set', { ...set, orderedInstallRefs: [] }],
    ['duplicate set', { ...set, orderedInstallRefs: [set.orderedInstallRefs[0], set.orderedInstallRefs[0]] }],
    ['foreign set lock', { ...set, lockDigest: zero }], ['forged set digest', { ...set, productSetDigest: zero }]]) {
    check(label, m => m.environment.isWorkspaceBindingCandidate(binding, lock, forged, authority), false);
  }
  const changedRoots = { ...binding, roots: { ...binding.roots, eventLogRoot: 'relative' } };
  check('relative declared root', m => m.environment.isWorkspaceBindingCandidate(changedRoots, lock, set, authority), false);
  check('extra binding field', m => m.environment.isWorkspaceBindingCandidate({ ...binding, extra: true }, lock, set, authority), false);
  for (const coordinate of [null, { ref: selected.ref, digest: zero }, { ref: 'workspace-binding://absent', digest: selected.digest }]) {
    const result = check('projection coordinate ' + JSON.stringify(coordinate), (m, env) =>
      m.environment_admission.projectWorkspaceEnvironmentFromArtifactTruth(env.artifactTruth, coordinate));
    assert.equal(result.kind, 'exact_prefix_workspace_environment_refusal');
  }
  check('cold copied projection', (m, env) => m.environment_admission.projectWorkspaceEnvironmentFromArtifactTruth(structuredClone(env.artifactTruth), selected), environments[0]);
  const forgedTruth = structuredClone(artifactTruth); forgedTruth.rows[0].artifactDigest = zero;
  assert.equal(check('forged admitted row', m => m.environment_admission.projectWorkspaceEnvironmentFromArtifactTruth(forgedTruth, selected)).code, 'artifact_truth_invalid');
  const changed = Buffer.from(bytes); changed[0] = 91; await writeFile(path, changed);
  try {
    check('owned pure projection after physical mutation', (m, env) =>
      m.environment_admission.projectWorkspaceEnvironmentFromArtifactTruth(env.artifactTruth, selected), environments[0]);
    assert.equal(check('same-length physical mutation', m => m.environment_admission.projectExactPrefixWorkspaceEnvironment(copiedPrefix, selected)).code, 'artifact_truth_invalid');
    check('copied projection after physical mutation', (m, env) =>
      m.environment_admission.projectAdmittedProductInstallByAdmissionEventRef(structuredClone(env.artifactTruth), installRow.admissionEventRef), null);
  } finally { await writeFile(path, bytes); }
  assert.deepEqual(await readFile(original), bytes);
  await writeFile(join(scratch, 'proof.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
});
