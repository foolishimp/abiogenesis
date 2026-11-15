// TD-36 follow-up (T-292), item 5. The workspace bind door applies the
// admitted binding's string rule (`isExactWorkspaceBinding`: nonblank, equal
// to its trim, NUL-free). Before, the bind constructor and the candidate
// predicate checked only nonblank strings, so a padded actor, an actor with a
// NUL and a declared root with a trailing space were bound and admitted, and
// every consumer of the admitted binding then refused it. The three values
// are refused at the constructor: the two actors with the existing
// `invalid_workspace_authority` refusal (Public `workspace_mismatch`, TD-36S),
// the root with the existing `invalid_declared_root` refusal (Public
// `root_mismatch`); a candidate minted by
// the constructor's own formula is refused by the candidate predicate and by
// admission (`scope_mismatch`). The control is a well-formed binding,
// admitted on both builds. Set ABG_WORKSITE_BUILD_ROOT to run another
// tenant's build: the artifact is packed from the tenant that holds it.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import test from 'node:test';
import { packProduct } from '../../scripts/product-payload.mjs';
import { candidateBasisSource, expectedCandidateBasis, expectedVerificationIdentity } from '../support/candidate-basis.mjs';
import { acquireNewEmptyAppendSinkFixture } from '../support/new-empty-append-sink.mjs';
import { buildRoot } from '../support/t287-generic-job-worksite.mjs';

const tenant = resolve(buildRoot, '../../..');
const load = path => import(pathToFileURL(join(buildRoot, path)).href);
const product = await load('product/index.js');
const abg = await load('abg/index.js');
const environment = await load('product/environment.js');
const execFileAsync = promisify(execFile);

const REFUSAL = { kind: 'environment_refusal', schemaVersion: '5.0.0', disposition: 'refused', code: 'invalid_declared_root',
  message: 'workspace authority, ProductSet, and every declared root must be exact' };
const AUTHORITY_REFUSAL = { kind: 'environment_refusal', schemaVersion: '5.0.0', disposition: 'refused',
  code: 'invalid_workspace_authority', message: 'workspace authority fields must be explicit' };

function artifactBasis(operationId, memberKey, scopeRef, scopeDigest, invocationRef, causationEventRefs = []) {
  const invocationPayloadDigest = product.sha256Canonical({});
  const definitionDigest = product.sha256Canonical({ operationId, schemaVersion: '5.0.0' });
  return { operationId, memberKey, definitionDigest, authorityScopeRef: scopeRef, authorityScopeDigest: scopeDigest,
    invocationRef, invocationPayloadDigest,
    invocationDigest: product.sha256Canonical({ operationId, memberKey, definitionDigest, invocationRef, invocationPayloadDigest }),
    correlationId: 'correlation://t292/td36r/door', eventTime: '2026-11-12T00:00:00.000Z', causationEventRefs };
}

// The bind constructor's formula, unchecked: the candidate it returned before.
function mintedCandidate(authority, productSet, lock, roots) {
  const body = { workspaceId: authority.workspaceId, authorityBasisId: authority.authorityBasisId,
    authorityBasisDigest: authority.authorityBasisDigest, authorizedActorRef: authority.authorizedActorRef,
    productSetId: productSet.productSetId, productSetDigest: productSet.productSetDigest,
    lockId: lock.lockId, lockDigest: lock.lockDigest, roots };
  const bindingDigest = product.sha256Canonical(body);
  return { kind: 'workspace_binding_candidate', schemaVersion: '5.0.0',
    bindingId: `workspace-binding://abiogenesis/${bindingDigest.slice('sha256:'.length)}`, bindingDigest, ...body };
}

// One packed, verified and installed tenant and one store; each bind follows the last admitted prefix.
async function bindSetup(t) {
  const scratch = await mkdtemp(join(tmpdir(), 'abi5-td36r-door-'));
  t.after(() => rm(scratch, { force: true, recursive: true }));
  const artifacts = join(scratch, 'artifacts');
  await mkdir(artifacts);
  const [packed] = await packProduct(tenant, artifacts);
  const artifactPath = join(artifacts, packed.filename);
  // T-293 B38: the expected identity is the maintained candidate-basis
  // preparation of this fresh pack: by default its own archive digest and the
  // identity its packed manifest declares; ABI5_CANDIDATE_BASIS_SOURCE=committed
  // still selects the separately committed basis. The persisted basis of an
  // older candidate is not the identity of the archive packed here.
  const bootstrapRoot = join(scratch, 'bootstrap');
  await mkdir(bootstrapRoot);
  await execFileAsync('tar', ['-xzf', artifactPath, '-C', bootstrapRoot]);
  const candidateBasis = await expectedCandidateBasis(tenant, { artifactPath, productRoot: join(bootstrapRoot, 'package'), product });
  t.diagnostic(`candidate basis source: ${candidateBasisSource()}`);
  const verified = await product.verifyProduct({ artifactPath, artifactRef: basename(artifactPath),
    ...expectedVerificationIdentity(candidateBasis) });
  assert.equal(verified.disposition, 'verified', JSON.stringify(verified));
  const lock = product.constructResolvedProductLock([verified]);
  assert.equal(lock.kind, 'resolved_product_lock', JSON.stringify(lock));
  const consumerRoot = join(scratch, 'consumer');
  const install = await product.installProduct({ artifactPath, targetRoot: consumerRoot, verifiedArtifact: verified, resolvedLock: lock });
  assert.equal(install.disposition, 'materialized', JSON.stringify(install));
  const acquired = await acquireNewEmptyAppendSinkFixture(t, abg.createNewEmptyAppendSink, 'abi5-td36r-door-store-');
  const installed = abg.admitProductInstall(acquired.store, install, { ...artifactBasis('abg.operation.product.install', 'install',
    install.installId, install.productContentDigest, 'invocation://t292/td36r/door/install'), predecessorPrefix: acquired.prefix }, lock);
  assert.equal(installed.kind, 'artifact_owner_result', JSON.stringify(installed));
  const productSet = product.constructProductSet([installed.value], lock);
  const workspaceRoot = join(scratch, 'workspace');
  await mkdir(workspaceRoot);
  const authorityFor = (label, authorizedActorRef) => {
    const manifest = { workspaceId: `workspace://t292/td36r/${label}`, authorityMode: 'trusted_developer',
      authorizedActorRef, canonicalRoot: workspaceRoot };
    return product.constructWorkspaceAuthorityBasis({ ...manifest, authorityManifestRef: 'manifest://t292/td36r/door',
      authorityManifestDigest: product.sha256Canonical(manifest) });
  };
  const rootsFor = (eventLogRoot = join(workspaceRoot, 'events')) => ({ toolchainRoot: consumerRoot,
    productRoot: install.installedRoot, eventLogRoot, runtimeStateRoot: join(workspaceRoot, 'runtime'),
    projectionRoot: join(workspaceRoot, 'projections'), archiveRoot: join(workspaceRoot, 'archive') });
  let prefix = installed.successorPrefix;
  const bind = (label, candidate, authority) => {
    const result = abg.admitWorkspaceBinding(acquired.store, candidate, { ...artifactBasis('abg.operation.workspace.bind', 'bind',
      candidate.bindingId, candidate.bindingDigest, `invocation://t292/td36r/door/${label}`, [installed.value.admissionEventRef]),
    predecessorPrefix: prefix }, authority);
    if (result.kind === 'artifact_owner_result') prefix = result.successorPrefix;
    return result;
  };
  return { lock, install, installed, productSet, authorityFor, rootsFor, bind };
}

test('the workspace bind door applies the admitted binding string rule', async t => {
  const s = await bindSetup(t);

  await t.test('control: a well-formed binding is constructed, accepted and admitted', () => {
    const control = s.authorityFor('control', 'actor://t292/td36r/door');
    const controlCandidate = product.constructWorkspaceBinding(control, s.productSet, s.lock, s.rootsFor());
    assert.equal(controlCandidate.kind, 'workspace_binding_candidate', JSON.stringify(controlCandidate));
    assert.deepEqual(controlCandidate, mintedCandidate(control, s.productSet, s.lock, s.rootsFor()));
    assert.equal(environment.isWorkspaceBindingCandidate(controlCandidate, s.lock, s.productSet, control), true);
    assert.equal(s.bind('control', controlCandidate, control).kind, 'artifact_owner_result');
  });

  for (const [label, actor, eventLogRoot, expected] of [
    ['padded-actor', ' actor://t292/td36r/door ', undefined, AUTHORITY_REFUSAL],
    ['nul-actor', 'actor://t292/td36r/\0door', undefined, AUTHORITY_REFUSAL],
    ['padded-root', 'actor://t292/td36r/door-root', s.rootsFor().eventLogRoot + ' ', REFUSAL],
  ]) {
    await t.test(`bind refuses ${label}`, () => {
      const authority = s.authorityFor(label, actor);
      assert.equal(authority.kind, 'workspace_authority_basis', `${label}: the authority basis is unchanged`);
      const roots = s.rootsFor(eventLogRoot);
      assert.deepEqual({ ...product.constructWorkspaceBinding(authority, s.productSet, s.lock, roots) }, expected, `${label}: constructor`);
      const packet = { kind: 'workspace_binding_packet', schemaVersion: '5.0.0', memberKey: 'bind', admittedInstalls: [s.installed.value],
        resolvedLock: s.lock, authority: { workspaceId: authority.workspaceId, canonicalRoot: authority.canonicalRoot,
          authorityMode: authority.authorityMode, authorizedActorRef: authority.authorizedActorRef,
          authorityManifestRef: authority.authorityManifestRef, authorityManifestDigest: authority.authorityManifestDigest }, roots };
      assert.deepEqual({ ...product.ProductEnvironmentPort.bindWorkspace(packet) }, expected, `${label}: the Public bind port`);
      const minted = mintedCandidate(authority, s.productSet, s.lock, roots);
      assert.equal(environment.isWorkspaceBindingCandidate(minted, s.lock, s.productSet, authority), false, `${label}: candidate predicate`);
      const admitted = s.bind(label, minted, authority);
      assert.equal(admitted.kind, 'artifact_owner_refusal', `${label}: admission`);
      assert.equal(admitted.refusal.code, 'scope_mismatch', `${label}: admission refusal`);
    });
  }

  await t.test('the admitted control binding passes isExactWorkspaceBinding and hasAdmittedWorkspaceBinding', () => {
    const authority = s.authorityFor('invariant', 'actor://t292/td36r/door-invariant');
    const candidate = product.constructWorkspaceBinding(authority, s.productSet, s.lock, s.rootsFor());
    assert.equal(candidate.kind, 'workspace_binding_candidate', JSON.stringify(candidate));
    const bound = s.bind('invariant', candidate, authority);
    assert.equal(bound.kind, 'artifact_owner_result', JSON.stringify(bound));
    assert.equal(environment.isExactWorkspaceBinding(bound.value), true);
    assert.equal(abg.hasAdmittedWorkspaceBinding(bound.artifactTruth, bound.value), true);
  });
});
