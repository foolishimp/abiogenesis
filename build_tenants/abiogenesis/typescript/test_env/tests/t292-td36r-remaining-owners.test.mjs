// TD-36 follow-up (T-292). The remaining copies of the workspace join, the
// direct-grant rule and the implementation-set check now call their owners.
// Each tightened lane is red on the pre-change build and green after; each
// carries an exact control that is admitted on both. Every forged value below
// keeps its own digest and identity valid, so only the rule under test can
// refuse it. Set ABG_WORKSITE_BUILD_ROOT to run the file against another build.
//   - native work input admission: the owner join adds the `workspaceId`
//     equality, the owner grant adds `memberKey` in {invoke, start};
//   - the file-replace request: the owner grant replaces the inline rule with
//     the same verdict (an equivalence lane against the vendored old rule);
//   - the implementation set: its body is admitted as I-JSON before its digest,
//     and every set admitted as I-JSON keeps the digest it had;
//   - the uncalled `exactWorkspaceBinding` export is gone.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildRoot, loadWorksiteOwner, worksiteFixture } from '../support/t287-generic-job-worksite.mjs';

const load = path => import(pathToFileURL(join(buildRoot, path)).href);
const product = await loadWorksiteOwner();
const native = await load('product/native_workspace_work.js');
const worksiteEffect = await load('product/worksite_effect.js');
const { isCapabilityGrantValue } = await load('product/invocation.js');
const { admitJson } = await load('shared/admit/index.js');
const hash = product.sha256Canonical;
const id = (scheme, digest) => `${scheme}://abiogenesis/${digest.slice('sha256:'.length)}`;

async function fixture(t) {
  const env = await worksiteFixture(product);
  t.after(() => fs.rm(env.scratch, { recursive: true, force: true }));
  await fs.writeFile(join(env.canonicalRoot, 'target.txt'), 'before\n');
  return env;
}

// One re-minted value: the changed fields, then the value's own digest and identity.
function remintGrant(grant, changes) {
  const { kind, schemaVersion, grantRef: _r, grantDigest: _d, ...body } = grant;
  const next = { ...body, ...changes };
  const grantDigest = hash(next);
  return { kind, schemaVersion, grantRef: id('capability-grant', grantDigest), grantDigest, ...next };
}
function remintBinding(binding, changes) {
  const { kind, schemaVersion, bindingId: _i, bindingDigest: _d, admissionEventRef, ...body } = binding;
  const next = { ...body, ...changes };
  const bindingDigest = hash(next);
  return { kind, schemaVersion, bindingId: id('workspace-binding', bindingDigest), bindingDigest, ...next, admissionEventRef };
}
function remintContext(context, changes) {
  const { kind, schemaVersion, observationRef: _r, observationDigest: _d, ...body } = context;
  const next = { ...body, ...changes };
  const observationDigest = product.worksiteContextIdentityDigest(next);
  return { kind, schemaVersion, observationRef: product.worksiteContextObservationRef(observationDigest), observationDigest, ...next };
}

async function nativeTask(env) {
  const context = await product.observeWorksiteContext({ workspaceAuthorityBasis: env.workspaceAuthorityBasis,
    workspaceBinding: env.workspaceBinding, readRoots: ['.'], maxFiles: 20, maxBytes: 10000 });
  assert.equal(context.kind, 'worksite_context_observation');
  return native.constructNativeWorkspaceWorkTask({ workspaceAuthorityBasis: env.workspaceAuthorityBasis,
    workspaceBinding: env.workspaceBinding, capabilityGrant: env.capabilityGrant, context,
    outcome: 'Perform the declared local work', instructions: ['Read the selected input.'],
    readFirst: ['target.txt'], writeRoots: ['target.txt'], checks: [] });
}

test('native work input admission refuses a binding whose workspaceId differs from its authority', async t => {
  const env = await fixture(t);
  const task = await nativeTask(env);
  assert.equal(native.isNativeWorkspaceWorkTask(task), true, 'control: the exact task is admitted');
  const other = remintBinding(env.workspaceBinding, { workspaceId: 'workspace://generic-worksite/other' });
  const grant = remintGrant(env.capabilityGrant, { scopeRef: other.bindingId, scopeDigest: other.bindingDigest });
  const context = remintContext(task.context, { workspaceBindingIdentity: other.bindingId, workspaceBindingDigest: other.bindingDigest });
  // Every coordinate except workspaceId still agrees, and each value is exact on its own.
  assert.notEqual(other.workspaceId, env.workspaceAuthorityBasis.workspaceId);
  for (const field of ['authorityBasisId', 'authorityBasisDigest', 'authorizedActorRef'])
    assert.equal(other[field], env.workspaceAuthorityBasis[field]);
  assert.equal(product.isExactWorkspaceBinding(other), true);
  assert.equal(product.isWorksiteContextObservation(context), true);
  assert.equal(native.isNativeWorkspaceWorkTask({ ...task, workspaceBinding: other, capabilityGrant: grant, context }), false);
});

test('native work input admission refuses a run-invocation grant whose member is not invoke or start', async t => {
  const env = await fixture(t);
  const task = await nativeTask(env);
  const start = remintGrant(env.capabilityGrant, { definitionKey: { operationId: 'abg.operation.run.invoke', memberKey: 'start' } });
  assert.equal(native.isNativeWorkspaceWorkTask(task), true, 'control: the invoke grant is admitted');
  assert.equal(native.isNativeWorkspaceWorkTask({ ...task, capabilityGrant: start }), true, 'control: the start grant is admitted');
  const resume = remintGrant(env.capabilityGrant, { definitionKey: { operationId: 'abg.operation.run.invoke', memberKey: 'resume' } });
  assert.equal(isCapabilityGrantValue(resume), true);
  assert.equal(native.isNativeWorkspaceWorkTask({ ...task, capabilityGrant: resume }), false);
});

// The file-replace request's grant rule before this package, vendored verbatim
// from `product/worksite_effect.ts` at aaf02dcbb (`isWorksiteFileReplaceRequest`).
function oldFileReplaceGrantRule(value) {
  const authority = value.workspaceAuthorityBasis;
  return value.capabilityGrant.actorRef.length > 0 &&
    value.capabilityGrant.operationId === 'abg.operation.run.invoke' &&
    value.capabilityGrant.definitionKey.operationId === 'abg.operation.run.invoke' &&
    (value.capabilityGrant.definitionKey.memberKey === 'invoke' ||
      value.capabilityGrant.definitionKey.memberKey === 'start') &&
    value.capabilityGrant.scopeRef === value.workspaceBindingIdentity &&
    value.capabilityGrant.scopeDigest === value.workspaceBindingDigest &&
    value.capabilityGrant.actorRef === authority.authorizedActorRef;
}

test('the file-replace request keeps the verdict of its old inline grant rule on every grant variant', async t => {
  const env = await fixture(t);
  const readBasis = { workspaceAuthorityBasis: env.workspaceAuthorityBasis, workspaceBinding: env.workspaceBinding };
  const subject = product.constructWorksiteSubject({ ...readBasis, relativePath: 'target.txt',
    subjectUri: pathToFileURL(join(env.canonicalRoot, 'target.txt')).href });
  const observation = await product.observeWorksiteSubject(env.workspaceAuthorityBasis, env.workspaceBinding, subject);
  const request = product.constructWorksiteFileReplaceRequest({ ...readBasis, capabilityGrant: env.capabilityGrant, subject,
    territory: env.territory, predecessorObservation: observation, replacementBytes: Buffer.from('after\n') });
  assert.equal(request.kind, 'worksite_file_replace_request', JSON.stringify(request));
  const g = env.capabilityGrant;
  const variants = {
    exact: g,
    start: remintGrant(g, { definitionKey: { operationId: 'abg.operation.run.invoke', memberKey: 'start' } }),
    resume: remintGrant(g, { definitionKey: { operationId: 'abg.operation.run.invoke', memberKey: 'resume' } }),
    otherOperation: remintGrant(g, { operationId: 'abg.operation.project.read', definitionKey: { operationId: 'abg.operation.project.read', memberKey: 'invoke' } }),
    otherActor: remintGrant(g, { actorRef: 'actor://generic-worksite/other' }),
    otherScopeRef: remintGrant(g, { scopeRef: 'workspace-binding://abiogenesis/other' }),
    otherScopeDigest: remintGrant(g, { scopeDigest: hash({ other: 'scope' }) }),
  };
  const verdicts = {};
  for (const [name, capabilityGrant] of Object.entries(variants)) {
    const value = { ...request, capabilityGrant };
    verdicts[name] = product.isWorksiteFileReplaceRequest(value);
    assert.equal(verdicts[name], oldFileReplaceGrantRule(value), name);
  }
  assert.deepEqual(verdicts, { exact: true, start: true, resume: false, otherOperation: false, otherActor: false,
    otherScopeRef: false, otherScopeDigest: false });
});

// The implementation-set body as `exactImplementationSet` digests it.
function setBody(set) {
  const { kind: _k, schemaVersion: _s, disposition: _d, implementationSetRef: _r, implementationSetDigest: _g, admissionEventRef: _a, ...body } = set;
  return body;
}

// One file-replace and one file-parents request over the fixture, and the two
// authorizations that check the implementation set.
async function authorizations(env) {
  const readBasis = { workspaceAuthorityBasis: env.workspaceAuthorityBasis, workspaceBinding: env.workspaceBinding };
  const subject = product.constructWorksiteSubject({ ...readBasis, relativePath: 'target.txt',
    subjectUri: pathToFileURL(join(env.canonicalRoot, 'target.txt')).href });
  const observation = await product.observeWorksiteSubject(env.workspaceAuthorityBasis, env.workspaceBinding, subject);
  const replace = product.constructWorksiteFileReplaceRequest({ ...readBasis, capabilityGrant: env.capabilityGrant, subject,
    territory: env.territory, predecessorObservation: observation, replacementBytes: Buffer.from('after\n') });
  const parents = await env.request(['src/nested/main.js']);
  assert.equal(parents.kind, 'worksite_file_parents_request');
  return ({ implementationSet, executionBasis = env.executionBasis, cCall = env.cCall }) => ({
    replace: product.constructWorksiteEffectAuthorization({ workspaceBinding: env.workspaceBinding, request: replace,
      executionBasis, cCall, implementationSet }).kind,
    parents: product.constructWorksiteFileParentsAuthorization({ workspaceAuthorityBasis: env.workspaceAuthorityBasis,
      workspaceBinding: env.workspaceBinding, capabilityGrant: env.capabilityGrant, executionBasis, cCall,
      implementationSet, request: parents }).kind,
  });
}
const REFUSED = { replace: 'worksite_effect_refusal', parents: 'worksite_effect_refusal' };
const AUTHORIZED = { replace: 'worksite_effect_authorization', parents: 'worksite_file_parents_authorization' };

// A set with one further body member, and the execution basis and C call
// re-minted over its new identity.
function remintSetChain(env, note) {
  const body = { ...setBody(env.implementationSet), note };
  const digest = hash(body);
  const implementationSet = { kind: 'admitted_implementation_set', schemaVersion: '5.0.0', disposition: 'admitted',
    implementationSetRef: id('implementation-set', digest), implementationSetDigest: digest, ...body,
    admissionEventRef: env.implementationSet.admissionEventRef };
  const { kind, schemaVersion, disposition, basisRef: _r, basisDigest: _d, admissionEventRef, ...basisBody } = env.executionBasis;
  const nextBasis = { ...basisBody, implementationSetRef: implementationSet.implementationSetRef, implementationSetDigest: digest };
  const basisDigest = hash(nextBasis);
  const executionBasis = { kind, schemaVersion, disposition, basisRef: id('execution-basis', basisDigest), basisDigest,
    ...nextBasis, admissionEventRef };
  const c = env.cCall;
  const callBody = { basisId: executionBasis.basisRef, graphCallId: c.graphCallId, frameId: c.frameId, vectorIndex: c.vectorIndex,
    stageRole: c.stageRole, taskOrdinal: c.taskOrdinal, attempt: c.attempt, programLocusRef: c.programLocusRef, retryPath: c.retryPath };
  const cCallDigest = hash(callBody);
  const cCall = { ...c, ...callBody, cCallRef: `c-call:${cCallDigest}`, cCallDigest,
    implementationSetRef: implementationSet.implementationSetRef };
  return { body, implementationSet, executionBasis, cCall };
}

test('both worksite authorizations refuse an implementation set that carries an enumerable symbol member', async t => {
  const env = await fixture(t);
  const authorize = await authorizations(env);
  // Control: the exact set is authorized, and admitting its body as I-JSON keeps its digest.
  assert.deepEqual(authorize({ implementationSet: env.implementationSet }), AUTHORIZED);
  const admitted = admitJson(setBody(env.implementationSet));
  assert.equal(admitted.kind, 'ok');
  assert.equal(hash(admitted.value), hash(setBody(env.implementationSet)));
  assert.equal(hash(admitted.value), env.implementationSet.implementationSetDigest);
  // The canonical writer ignores the symbol, so the raw digest and the identity
  // are unchanged; I-JSON admission refuses it.
  const symbolSet = { ...env.implementationSet, [Symbol('extra')]: 'x' };
  assert.equal(hash(setBody(symbolSet)), env.implementationSet.implementationSetDigest);
  assert.notEqual(admitJson(setBody(symbolSet)).kind, 'ok');
  assert.deepEqual(authorize({ implementationSet: symbolSet }), REFUSED);
});

test('both worksite authorizations refuse an implementation set whose body holds a lone surrogate', async t => {
  const env = await fixture(t);
  const authorize = await authorizations(env);
  // Control for the re-mint: the same chain over a well-formed member is
  // authorized, and its admitted digest equals its raw digest.
  const well = remintSetChain(env, 'well-formed');
  assert.equal(hash(admitJson(well.body).value), well.implementationSet.implementationSetDigest);
  assert.deepEqual(authorize(well), AUTHORIZED);
  const lone = remintSetChain(env, '\ud800');
  assert.equal(hash(lone.body), lone.implementationSet.implementationSetDigest);
  assert.notEqual(admitJson(lone.body).kind, 'ok');
  assert.deepEqual(authorize(lone), REFUSED);
});

test('the uncalled exactWorkspaceBinding export is deleted; the binding owner remains', () => {
  assert.equal('exactWorkspaceBinding' in worksiteEffect, false);
  assert.equal(typeof product.isExactWorkspaceBinding, 'function');
});
