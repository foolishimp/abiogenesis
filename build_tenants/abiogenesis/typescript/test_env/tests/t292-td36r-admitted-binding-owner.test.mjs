// TD-36 follow-up (T-292). `hasAdmittedWorkspaceBinding` (the check behind
// the actor process, the F_H continuation and workspace status) uses the
// binding owner `isExactWorkspaceBinding` before it selects the admission row.
// Before, it re-digested the nine-field body and checked nothing else, so a
// binding with one extra top-level key over an admitted row was accepted. The
// extra key leaves the body digest, the identity and the admission event
// reference valid, so only the binding's exact key set can refuse it. The
// control is the admitted binding itself. Set ABG_WORKSITE_BUILD_ROOT to run
// another tenant's build: the artifact is packed from the tenant that holds it.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import test from 'node:test';
import { packProduct } from '../../scripts/product-payload.mjs';
import { expectedVerificationIdentity, readCandidateBasis } from '../support/candidate-basis.mjs';
import { acquireNewEmptyAppendSinkFixture } from '../support/new-empty-append-sink.mjs';
import { buildRoot } from '../support/t287-generic-job-worksite.mjs';

const tenant = resolve(buildRoot, '../../..');
const load = path => import(pathToFileURL(join(buildRoot, path)).href);
const product = await load('product/index.js');
const abg = await load('abg/index.js');
const execFileAsync = promisify(execFile);

// The basis of one artifact admission, as `r3-workspace-binding` builds it.
function artifactBasis(operationId, memberKey, scopeRef, scopeDigest, invocationRef, causationEventRefs = []) {
  const invocationPayloadDigest = product.sha256Canonical({});
  const definitionDigest = product.sha256Canonical({ operationId, schemaVersion: '5.0.0' });
  return { operationId, memberKey, definitionDigest, authorityScopeRef: scopeRef, authorityScopeDigest: scopeDigest,
    invocationRef, invocationPayloadDigest,
    invocationDigest: product.sha256Canonical({ operationId, memberKey, definitionDigest, invocationRef, invocationPayloadDigest }),
    correlationId: 'correlation://t292/td36r', eventTime: '2026-11-12T00:00:00.000Z', causationEventRefs };
}

test('hasAdmittedWorkspaceBinding refuses an admitted binding with one extra top-level key', async t => {
  const scratch = await mkdtemp(join(tmpdir(), 'abi5-td36r-binding-'));
  t.after(() => rm(scratch, { force: true, recursive: true }));
  const artifacts = join(scratch, 'artifacts');
  await mkdir(artifacts);
  const [packed] = await packProduct(tenant, artifacts);
  const artifactPath = join(artifacts, packed.filename);
  const verified = await product.verifyProduct({ artifactPath, artifactRef: basename(artifactPath),
    ...expectedVerificationIdentity(await readCandidateBasis(tenant)) });
  assert.equal(verified.disposition, 'verified', JSON.stringify(verified));
  const lock = product.constructResolvedProductLock([verified]);
  assert.equal(lock.kind, 'resolved_product_lock', JSON.stringify(lock));
  const consumerRoot = join(scratch, 'consumer');
  const install = await product.installProduct({ artifactPath, targetRoot: consumerRoot, verifiedArtifact: verified, resolvedLock: lock });
  assert.equal(install.disposition, 'materialized', JSON.stringify(install));
  const acquired = await acquireNewEmptyAppendSinkFixture(t, abg.createNewEmptyAppendSink, 'abi5-td36r-store-');
  const installed = abg.admitProductInstall(acquired.store, install, { ...artifactBasis('abg.operation.product.install', 'install',
    install.installId, install.productContentDigest, 'invocation://t292/td36r/install'), predecessorPrefix: acquired.prefix }, lock);
  assert.equal(installed.kind, 'artifact_owner_result', JSON.stringify(installed));
  const productSet = product.constructProductSet([installed.value], lock);
  const workspaceRoot = join(scratch, 'workspace');
  await mkdir(workspaceRoot);
  const manifest = { workspaceId: 'workspace://t292/td36r', authorityMode: 'trusted_developer',
    authorizedActorRef: 'actor://abiogenesis/t292/td36r', canonicalRoot: workspaceRoot };
  const authority = product.constructWorkspaceAuthorityBasis({ ...manifest, authorityManifestRef: 'manifest://t292/td36r',
    authorityManifestDigest: product.sha256Canonical(manifest) });
  const roots = { toolchainRoot: consumerRoot, productRoot: install.installedRoot, eventLogRoot: join(workspaceRoot, 'events'),
    runtimeStateRoot: join(workspaceRoot, 'runtime'), projectionRoot: join(workspaceRoot, 'projections'), archiveRoot: join(workspaceRoot, 'archive') };
  const candidate = product.constructWorkspaceBinding(authority, productSet, lock, roots);
  assert.equal(candidate.kind, 'workspace_binding_candidate', JSON.stringify(candidate));
  const bound = abg.admitWorkspaceBinding(acquired.store, candidate, { ...artifactBasis('abg.operation.workspace.bind', 'bind',
    candidate.bindingId, candidate.bindingDigest, 'invocation://t292/td36r/bind', [installed.value.admissionEventRef]),
    predecessorPrefix: installed.successorPrefix }, authority);
  assert.equal(bound.kind, 'artifact_owner_result', JSON.stringify(bound));

  assert.equal(abg.hasAdmittedWorkspaceBinding(bound.artifactTruth, bound.value), true, 'control: the admitted binding');
  const extra = { ...bound.value, extra: 'x' };
  const { kind: _k, schemaVersion: _s, bindingId, bindingDigest, admissionEventRef, extra: _e, ...body } = extra;
  assert.equal(product.sha256Canonical(body), bindingDigest);
  assert.equal(bindingId, `workspace-binding://abiogenesis/${bindingDigest.slice('sha256:'.length)}`);
  assert.equal(admissionEventRef, bound.admissionEventRef);
  assert.equal(abg.hasAdmittedWorkspaceBinding(bound.artifactTruth, extra), false);
});
