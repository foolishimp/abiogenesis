// TD-36 (T-292). A workspace binding with one extra top-level key is refused
// by every consumer that the weaker `worksite_effect.ts` copy guarded: native
// work input admission, the native semantic revision worksite and the worksite
// territory, subject and file-parents constructors. The extra key leaves the
// nine-field body, its digest, the identity, the grant scope and the context
// coordinates valid, so only the binding's exact key set can refuse it. Each
// lane carries the exact-binding control. Before TD-36 the extra-key values
// were accepted (the Return records that run).
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildRoot, loadWorksiteOwner, worksiteFixture } from '../support/t287-generic-job-worksite.mjs';

const load = path => import(pathToFileURL(join(buildRoot, path)).href);
const product = await loadWorksiteOwner();
const native = await load('product/native_workspace_work.js');
const revision = await load('product/semantic_revision.js');
const { ROOT_EVENT_CONTRACT_DIGEST } = await load('abg/event_store.js');
const hash = product.sha256Canonical;

async function fixture(t) {
  const env = await worksiteFixture(product);
  t.after(() => fs.rm(env.scratch, { recursive: true, force: true }));
  await fs.writeFile(join(env.canonicalRoot, 'target.txt'), 'before\n');
  const context = await product.observeWorksiteContext({ workspaceAuthorityBasis: env.workspaceAuthorityBasis,
    workspaceBinding: env.workspaceBinding, readRoots: ['.'], maxFiles: 20, maxBytes: 10000 });
  assert.equal(context.kind, 'worksite_context_observation');
  const extra = { ...env.workspaceBinding, extra: 'x' };
  // Every coordinate a consumer checks against the binding is unchanged.
  const { kind: _k, schemaVersion: _s, bindingId, bindingDigest, admissionEventRef: _a, extra: _e, ...body } = extra;
  assert.equal(hash(body), bindingDigest);
  assert.equal(bindingId, `workspace-binding://abiogenesis/${bindingDigest.slice('sha256:'.length)}`);
  assert.equal(env.capabilityGrant.scopeRef, bindingId);
  assert.equal(env.capabilityGrant.scopeDigest, bindingDigest);
  assert.equal(context.workspaceBindingIdentity, bindingId);
  assert.equal(context.workspaceBindingDigest, bindingDigest);
  assert.equal(Object.keys(extra).length, Object.keys(env.workspaceBinding).length + 1);
  return { env, context, extra };
}

test('native work input admission refuses a workspace binding with one extra top-level key', async t => {
  const { env, context, extra } = await fixture(t);
  const input = { workspaceAuthorityBasis: env.workspaceAuthorityBasis, workspaceBinding: env.workspaceBinding,
    capabilityGrant: env.capabilityGrant, context, outcome: 'Perform the declared local work',
    instructions: ['Read the selected input.'], readFirst: ['target.txt'], writeRoots: ['target.txt'], checks: [] };
  const task = native.constructNativeWorkspaceWorkTask(input);
  assert.equal(native.isNativeWorkspaceWorkTask(task), true, 'control: the exact binding is admitted');
  assert.equal(native.isNativeWorkspaceWorkTask({ ...task, workspaceBinding: extra }), false);
  assert.throws(() => native.constructNativeWorkspaceWorkTask({ ...input, workspaceBinding: extra }), TypeError);
});

test('the native semantic revision worksite refuses a workspace binding with one extra top-level key', async t => {
  const { env, context, extra } = await fixture(t);
  const prefix = { kind: 'durable_prefix_coordinate', schemaVersion: '5.0.0', eventLogRef: 'file:///component/no-journal',
    prefixLength: 0, prefixDigest: hash('prefix'), storeIdentity: { device: 1, inode: 1, eventContractDigest: ROOT_EVENT_CONTRACT_DIGEST } };
  const source = { kind: 'native_semantic_revision_intake', schemaVersion: '5.0.0',
    sourceRun: { ref: 'component:run', digest: hash('run') }, sourcePrefix: { ...prefix, coordinateDigest: hash(prefix) } };
  const worksite = { kind: 'native_semantic_revision_worksite', workspaceAuthorityBasis: env.workspaceAuthorityBasis,
    workspaceBinding: env.workspaceBinding, capabilityGrant: env.capabilityGrant, context,
    commandExecutionLimits: { inactivityTimeoutMs: 300000, absoluteTimeoutMs: 900000 }, construction: null, source };
  assert.equal(revision.isNativeSemanticRevisionWorksite(worksite), true, 'control: the exact binding is admitted');
  assert.equal(revision.isNativeSemanticRevisionWorksite({ ...worksite, workspaceBinding: extra }), false);
});

test('worksite territory, subject and file-parents construction refuse a workspace binding with one extra top-level key', async t => {
  const { env, extra } = await fixture(t);
  const territoryInput = { workspaceAuthorityBasis: env.workspaceAuthorityBasis, relativeRoot: '.',
    territoryUri: pathToFileURL(env.canonicalRoot).href };
  assert.equal(product.constructWorksiteTerritory({ ...territoryInput, workspaceBinding: env.workspaceBinding }).kind,
    'worksite_territory', 'control: the exact binding is admitted');
  assert.equal(product.constructWorksiteTerritory({ ...territoryInput, workspaceBinding: extra }).kind, 'worksite_effect_refusal');
  const subjectInput = { workspaceAuthorityBasis: env.workspaceAuthorityBasis, relativePath: 'target.txt',
    subjectUri: pathToFileURL(join(env.canonicalRoot, 'target.txt')).href };
  assert.equal(product.constructWorksiteSubject({ ...subjectInput, workspaceBinding: env.workspaceBinding }).kind,
    'worksite_subject', 'control: the exact binding is admitted');
  assert.equal(product.constructWorksiteSubject({ ...subjectInput, workspaceBinding: extra }).kind, 'worksite_effect_refusal');
  const parents = await env.request(['src/nested/main.js']);
  assert.equal(parents.kind, 'worksite_file_parents_request', 'control: the exact binding is admitted');
  const refused = await env.request(['src/nested/main.js'], { workspaceBinding: extra });
  assert.equal(refused.kind, 'worksite_effect_refusal');
});
