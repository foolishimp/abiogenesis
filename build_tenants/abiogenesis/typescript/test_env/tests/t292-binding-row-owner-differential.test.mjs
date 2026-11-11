// TD-36 (T-292). Differential over valid and malformed workspace bindings,
// authority joins, direct grants, binding candidates and admitted
// implementation rows. The oracles below are the pre-TD-36 copies, vendored
// verbatim (types removed) from `main` at 0f77e3976, because TD-36 deletes
// them. For each rule the owner's verdict equals the strictest copy's verdict
// on every case, and every value the owner accepts is accepted by each weaker
// copy (the consolidation tightens and loosens nothing). The cases each weaker
// copy accepted and the owner refuses are listed and pinned.
import assert from 'node:assert/strict';
import test from 'node:test';
import { isAbsolute, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildRoot } from '../support/t287-generic-job-worksite.mjs';

const load = path => import(pathToFileURL(join(buildRoot, path)).href);
const { isRecord, hasExactKeys } = await load('shared/admit/record.js');
const { isNonblankNulFreeString: nonEmptyString } = await load('shared/admission_predicates.js');
const { admitJson } = await load('shared/admit/index.js');
const { isSha256Digest, sha256Canonical } = await load('shared/digests.js');
const environment = await load('product/environment.js');
const invocation = await load('product/invocation.js');
const executionBasis = await load('abg/execution_basis.js');
const { isWorkspaceAuthorityBasis, constructWorkspaceAuthorityBasis } = environment;
const { isCapabilityGrantValue } = invocation;
const exactKeys = hasExactKeys;
const SCHEMA_VERSION = '5.0.0';
const identity = (prefix, digest) => `${prefix}/${digest.slice('sha256:'.length)}`;

// ---- Oracles: the pre-TD-36 copies -------------------------------------

// worksite_command_execution.ts:731-734
function nonempty(value) {
  return typeof value === 'string' && value.trim().length > 0 &&
    value.trim() === value && !value.includes('\0');
}

// worksite_command_execution.ts:835-870 (the strictest binding copy)
function commandExecutionBinding(value) {
  if (!isRecord(value) || !exactKeys(value, [
    'admissionEventRef', 'authorityBasisDigest', 'authorityBasisId',
    'authorizedActorRef', 'bindingDigest', 'bindingId', 'kind', 'lockDigest',
    'lockId', 'productSetDigest', 'productSetId', 'roots', 'schemaVersion',
    'workspaceId',
  ]) || value.kind !== 'workspace_binding' || value.schemaVersion !== SCHEMA_VERSION ||
    !nonempty(value.bindingId) || !isSha256Digest(value.bindingDigest) ||
    !nonempty(value.workspaceId) || !nonempty(value.authorityBasisId) ||
    !isSha256Digest(value.authorityBasisDigest) || !nonempty(value.authorizedActorRef) ||
    !nonempty(value.productSetId) || !isSha256Digest(value.productSetDigest) ||
    !nonempty(value.lockId) || !isSha256Digest(value.lockDigest) ||
    !nonempty(value.admissionEventRef) || !isRecord(value.roots) ||
    !exactKeys(value.roots, [
      'archiveRoot', 'eventLogRoot', 'productRoot', 'projectionRoot',
      'runtimeStateRoot', 'toolchainRoot',
    ]) || Object.values(value.roots).some((root) =>
      !nonempty(root) || !isAbsolute(root)
    )) return false;
  const body = {
    workspaceId: value.workspaceId,
    authorityBasisId: value.authorityBasisId,
    authorityBasisDigest: value.authorityBasisDigest,
    authorizedActorRef: value.authorizedActorRef,
    productSetId: value.productSetId,
    productSetDigest: value.productSetDigest,
    lockId: value.lockId,
    lockDigest: value.lockDigest,
    roots: value.roots,
  };
  const admittedBody = admitJson(body);
  if (admittedBody.kind !== 'ok') return false;
  const digest = sha256Canonical(admittedBody.value);
  return value.bindingDigest === digest &&
    value.bindingId === identity('workspace-binding://abiogenesis', digest);
}

// worksite_construction.ts:201-264
function constructionBinding(value) {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      'admissionEventRef',
      'authorityBasisDigest',
      'authorityBasisId',
      'authorizedActorRef',
      'bindingDigest',
      'bindingId',
      'kind',
      'lockDigest',
      'lockId',
      'productSetDigest',
      'productSetId',
      'roots',
      'schemaVersion',
      'workspaceId',
    ]) ||
    value.kind !== 'workspace_binding' ||
    value.schemaVersion !== SCHEMA_VERSION ||
    !nonEmptyString(value.bindingId) ||
    !isSha256Digest(value.bindingDigest) ||
    !nonEmptyString(value.workspaceId) ||
    !nonEmptyString(value.authorityBasisId) ||
    !isSha256Digest(value.authorityBasisDigest) ||
    !nonEmptyString(value.authorizedActorRef) ||
    !nonEmptyString(value.productSetId) ||
    !isSha256Digest(value.productSetDigest) ||
    !nonEmptyString(value.lockId) ||
    !isSha256Digest(value.lockDigest) ||
    !nonEmptyString(value.admissionEventRef) ||
    !isRecord(value.roots) ||
    !hasExactKeys(value.roots, [
      'archiveRoot',
      'eventLogRoot',
      'productRoot',
      'projectionRoot',
      'runtimeStateRoot',
      'toolchainRoot',
    ]) ||
    Object.values(value.roots).some(
      (root) => !nonEmptyString(root) || !isAbsolute(root),
    )
  ) return false;
  const body = {
    workspaceId: value.workspaceId,
    authorityBasisId: value.authorityBasisId,
    authorityBasisDigest: value.authorityBasisDigest,
    authorizedActorRef: value.authorizedActorRef,
    productSetId: value.productSetId,
    productSetDigest: value.productSetDigest,
    lockId: value.lockId,
    lockDigest: value.lockDigest,
    roots: value.roots,
  };
  const admittedBody = admitJson(body);
  if (admittedBody.kind !== 'ok') return false;
  const digest = sha256Canonical(admittedBody.value);
  return value.bindingDigest === digest &&
    value.bindingId === identity('workspace-binding://abiogenesis', digest);
}

// worksite_effect.ts:445-487
function effectBinding(value) {
  if (
    value.kind !== 'workspace_binding' ||
    value.schemaVersion !== '5.0.0' ||
    !nonEmptyString(value.bindingId) ||
    !isSha256Digest(value.bindingDigest) ||
    !nonEmptyString(value.workspaceId) ||
    !nonEmptyString(value.authorityBasisId) ||
    !isSha256Digest(value.authorityBasisDigest) ||
    !nonEmptyString(value.authorizedActorRef) ||
    !nonEmptyString(value.productSetId) ||
    !isSha256Digest(value.productSetDigest) ||
    !nonEmptyString(value.lockId) ||
    !isSha256Digest(value.lockDigest) ||
    !nonEmptyString(value.admissionEventRef) ||
    !isRecord(value.roots) ||
    !hasExactKeys(value.roots, [
      'archiveRoot',
      'eventLogRoot',
      'productRoot',
      'projectionRoot',
      'runtimeStateRoot',
      'toolchainRoot',
    ]) ||
    Object.values(value.roots).some((root) =>
      !nonEmptyString(root) || !isAbsolute(root)
    )
  ) return false;
  const body = {
    workspaceId: value.workspaceId,
    authorityBasisId: value.authorityBasisId,
    authorityBasisDigest: value.authorityBasisDigest,
    authorizedActorRef: value.authorizedActorRef,
    productSetId: value.productSetId,
    productSetDigest: value.productSetDigest,
    lockId: value.lockId,
    lockDigest: value.lockDigest,
    roots: value.roots,
  };
  const digest = sha256Canonical(body);
  return value.bindingDigest === digest &&
    value.bindingId === identity('workspace-binding://abiogenesis', digest);
}
// As guarded at native_workspace_work.ts:33 and semantic_revision.ts:73.
const guardedEffectBinding = x => x !== null && typeof x === 'object' && effectBinding(x);

// materialization_operations.ts:177-201 and the identity tail of :204-235
function materializationBinding(binding) {
  if (
    !isRecord(binding) ||
    binding.kind !== 'workspace_binding' ||
    binding.schemaVersion !== '5.0.0' ||
    typeof binding.bindingId !== 'string' ||
    !isSha256Digest(binding.bindingDigest) ||
    typeof binding.admissionEventRef !== 'string' ||
    binding.admissionEventRef.length === 0 ||
    !isRecord(binding.roots) ||
    Object.values(binding.roots).some((root) =>
      typeof root !== 'string' || !isAbsolute(root)
    )
  ) return false;
  const digest = sha256Canonical({
    workspaceId: binding.workspaceId,
    authorityBasisId: binding.authorityBasisId,
    authorityBasisDigest: binding.authorityBasisDigest,
    authorizedActorRef: binding.authorizedActorRef,
    productSetId: binding.productSetId,
    productSetDigest: binding.productSetDigest,
    lockId: binding.lockId,
    lockDigest: binding.lockDigest,
    roots: binding.roots,
  });
  return digest === binding.bindingDigest &&
    binding.bindingId === `workspace-binding://abiogenesis/${digest.slice('sha256:'.length)}`;
}

// catalog.ts:467-492, after its unchanged `isResolvedProductLock` premise
function catalogCandidate(workspaceBinding, resolvedLock) {
  const workspaceBindingBody = {
    workspaceId: workspaceBinding.workspaceId,
    authorityBasisId: workspaceBinding.authorityBasisId,
    authorityBasisDigest: workspaceBinding.authorityBasisDigest,
    authorizedActorRef: workspaceBinding.authorizedActorRef,
    productSetId: workspaceBinding.productSetId,
    productSetDigest: workspaceBinding.productSetDigest,
    lockId: workspaceBinding.lockId,
    lockDigest: workspaceBinding.lockDigest,
    roots: workspaceBinding.roots,
  };
  const expectedWorkspaceBindingDigest = sha256Canonical(workspaceBindingBody);
  return !(
    workspaceBinding.kind !== 'workspace_binding_candidate' ||
    workspaceBinding.schemaVersion !== '5.0.0' ||
    workspaceBinding.bindingDigest !== expectedWorkspaceBindingDigest ||
    workspaceBinding.bindingId !==
      `workspace-binding://abiogenesis/${expectedWorkspaceBindingDigest.slice('sha256:'.length)}` ||
    workspaceBinding.lockId !== resolvedLock.lockId ||
    workspaceBinding.lockDigest !== resolvedLock.lockDigest
  );
}

// The join: worksite_command_execution.ts:872-882, worksite_construction.ts:266-276
// and worksite_effect.ts:489-497 differ only in the binding check they call.
const joinWith = exact => (authority, workspace) =>
  isWorkspaceAuthorityBasis(authority) &&
    exact(workspace) &&
    authority.workspaceId === workspace.workspaceId &&
    authority.authorityBasisId === workspace.authorityBasisId &&
    authority.authorityBasisDigest === workspace.authorityBasisDigest &&
    authority.authorizedActorRef === workspace.authorizedActorRef;

// worksite_command_execution.ts:884-895; worksite_construction.ts:278-289 is the same text.
function directGrant(value, workspace) {
  return isCapabilityGrantValue(value) &&
    value.operationId === 'abg.operation.run.invoke' &&
    value.definitionKey.operationId === 'abg.operation.run.invoke' &&
    (value.definitionKey.memberKey === 'invoke' || value.definitionKey.memberKey === 'start') &&
    value.actorRef === workspace.authorizedActorRef &&
    value.scopeRef === workspace.bindingId &&
    value.scopeDigest === workspace.bindingDigest;
}

// implementation/leaf_execution_authority.ts:56-175 (the strictest row copy)
const ADMITTED_IMPLEMENTATION_RESOLUTION_FIELDS = Object.freeze([
  'catalogBasisDigest', 'catalogViewDigest', 'computeRegime', 'disposition',
  'failureContractRef', 'graphFunctionDigest', 'graphFunctionOwnerProductId',
  'graphFunctionPublicationDigest', 'graphFunctionRef', 'implementationBindingDigest',
  'implementationBindingRef', 'implementationDescriptorDigest', 'implementationOwnerProductId',
  'implementationPublicationDigest', 'implementationRef', 'inputContractRef', 'kind',
  'leafResolutionCandidateDigest', 'leafResolutionCandidateRef', 'modulePath', 'namedSymbol',
  'nodeRef', 'outputContractRef', 'packageName', 'packageVersion', 'programLocusRef',
  'programValidationRef', 'publicationDigest', 'refusalContractRef', 'requirementKey',
  'requirementKeyDigest', 'schemaVersion',
]);
function hasExactDataFields(value, fields) {
  const keys = Reflect.ownKeys(value);
  if (keys.some((key) => typeof key !== 'string')) return false;
  const actual = keys.sort();
  const expected = [...fields].sort();
  return actual.length === expected.length &&
    actual.every((key, index) => key === expected[index]) &&
    actual.every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return descriptor !== undefined &&
        Object.hasOwn(descriptor, 'value') &&
        descriptor.enumerable === true;
    });
}
function rowStringFields(value) {
  return [
    value.leafResolutionCandidateRef, value.requirementKey, value.catalogBasisDigest,
    value.catalogViewDigest, value.programValidationRef, value.graphFunctionRef,
    value.graphFunctionOwnerProductId, value.nodeRef, value.programLocusRef,
    value.implementationBindingRef, value.implementationRef, value.packageName,
    value.packageVersion, value.modulePath, value.namedSymbol, value.inputContractRef,
    value.outputContractRef, value.failureContractRef, value.refusalContractRef,
    value.implementationOwnerProductId,
  ];
}
function rowDigestFields(value) {
  return [
    value.leafResolutionCandidateDigest, value.requirementKeyDigest, value.publicationDigest,
    value.graphFunctionDigest, value.graphFunctionPublicationDigest, value.implementationBindingDigest,
    value.implementationDescriptorDigest, value.implementationPublicationDigest,
  ];
}
function leafAuthorityRow(value) {
  if (
    !isRecord(value) ||
    !hasExactDataFields(value, ADMITTED_IMPLEMENTATION_RESOLUTION_FIELDS) ||
    value.kind !== 'admitted_implementation_resolution_row' ||
    value.schemaVersion !== '5.0.0' ||
    value.disposition !== 'admitted' ||
    (value.computeRegime !== 'F_D' && value.computeRegime !== 'F_P')
  ) return false;
  if (!rowStringFields(value).every(nonEmptyString) || !rowDigestFields(value).every(isSha256Digest)) return false;
  const {
    kind: _kind, schemaVersion: _schemaVersion, disposition: _disposition,
    leafResolutionCandidateRef: _candidateRef, leafResolutionCandidateDigest: _candidateDigest,
    ...body
  } = value;
  const admittedBody = admitJson(body);
  if (admittedBody.kind !== 'ok') return false;
  const digest = sha256Canonical(admittedBody.value);
  return value.leafResolutionCandidateDigest === digest &&
    value.leafResolutionCandidateRef ===
      `leaf-resolution-candidate://abiogenesis/${digest.slice('sha256:'.length)}`;
}

// worksite_effect.ts:610-695
function effectRow(value) {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ADMITTED_IMPLEMENTATION_RESOLUTION_FIELDS) ||
    value.kind !== 'admitted_implementation_resolution_row' ||
    value.schemaVersion !== '5.0.0' ||
    value.disposition !== 'admitted' ||
    (value.computeRegime !== 'F_D' && value.computeRegime !== 'F_P')
  ) return false;
  if (!rowStringFields(value).every(nonEmptyString) || !rowDigestFields(value).every(isSha256Digest)) return false;
  const {
    kind: _kind, schemaVersion: _schemaVersion, disposition: _disposition,
    leafResolutionCandidateRef: _leafResolutionCandidateRef,
    leafResolutionCandidateDigest: _leafResolutionCandidateDigest,
    ...body
  } = value;
  const digest = sha256Canonical(body);
  return value.leafResolutionCandidateDigest === digest &&
    value.leafResolutionCandidateRef ===
      identity('leaf-resolution-candidate://abiogenesis', digest);
}

// ---- Cases ---------------------------------------------------------------

const digestOf = label => sha256Canonical({ label });
const safeHash = value => { try { return sha256Canonical(value); } catch { return digestOf('unhashable'); } };
const ROOT_KEYS = ['toolchainRoot', 'productRoot', 'eventLogRoot', 'runtimeStateRoot', 'projectionRoot', 'archiveRoot'];
const manifest = { workspaceId: 'workspace://td36/test', canonicalRoot: '/private/tmp/td36/worksite',
  authorityMode: 'trusted_developer', authorizedActorRef: 'actor://td36/test' };
const authority = constructWorkspaceAuthorityBasis({ ...manifest, authorityManifestRef: 'manifest://td36/authority',
  authorityManifestDigest: sha256Canonical(manifest) });
assert.equal(authority.kind, 'workspace_authority_basis');
const otherManifest = { ...manifest, workspaceId: 'workspace://td36/other' };
const otherAuthority = constructWorkspaceAuthorityBasis({ ...otherManifest, authorityManifestRef: 'manifest://td36/authority',
  authorityManifestDigest: sha256Canonical(otherManifest) });
const baseBody = () => ({ workspaceId: manifest.workspaceId, authorityBasisId: authority.authorityBasisId,
  authorityBasisDigest: authority.authorityBasisDigest, authorizedActorRef: manifest.authorizedActorRef,
  productSetId: 'product-set://td36/test', productSetDigest: digestOf('products'), lockId: 'lock://td36/test',
  lockDigest: digestOf('lock'), roots: Object.fromEntries(ROOT_KEYS.map(key => [key, `/private/tmp/td36/${key}`])) });
// A binding whose digest and identity are recomputed over `body`, so only the
// predicate under test can refuse it.
function bindingOver(body, extra = {}) {
  const bindingDigest = safeHash(body);
  return { kind: 'workspace_binding', schemaVersion: '5.0.0',
    bindingId: identity('workspace-binding://abiogenesis', bindingDigest), bindingDigest,
    ...body, admissionEventRef: 'event://td36/binding', ...extra };
}
const withBody = patch => bindingOver({ ...baseBody(), ...patch });
const withRoots = roots => bindingOver({ ...baseBody(), roots });
const valid = () => bindingOver(baseBody());

function bindingCases() {
  const cases = [];
  const add = (name, value) => cases.push([name, value]);
  add('valid', valid());
  add('valid, other roots', withRoots(Object.fromEntries(ROOT_KEYS.map(key => [key, `/var/td36/${key}`]))));
  add('valid, frozen', Object.freeze({ ...valid(), roots: Object.freeze(valid().roots) }));
  add('valid, null-prototype binding', Object.assign(Object.create(null), valid()));
  add('extra top-level key', { ...valid(), extra: 'x' });
  add('extra top-level key with an empty name', { ...valid(), '': 'x' });
  add('extra non-enumerable top-level key', Object.defineProperty(valid(), 'extra', { value: 'x', enumerable: false }));
  add('extra symbol top-level key', { ...valid(), [Symbol('extra')]: 'x' });
  add('accessor top-level field', (() => { const v = valid(); const id = v.workspaceId; delete v.workspaceId;
    return Object.defineProperty(v, 'workspaceId', { get: () => id, enumerable: true }); })());
  for (const key of Object.keys(valid())) {
    const v = valid(); delete v[key]; add(`missing ${key}`, v);
  }
  add('kind candidate', { ...valid(), kind: 'workspace_binding_candidate' });
  add('schemaVersion 5.0.1', { ...valid(), schemaVersion: '5.0.1' });
  for (const field of ['workspaceId', 'authorityBasisId', 'authorizedActorRef', 'productSetId', 'lockId']) {
    const value = baseBody()[field];
    add(`${field} leading space`, withBody({ [field]: ` ${value}` }));
    add(`${field} trailing space`, withBody({ [field]: `${value} ` }));
    add(`${field} trailing newline`, withBody({ [field]: `${value}\n` }));
    add(`${field} NUL`, withBody({ [field]: `${value}\0` }));
    add(`${field} empty`, withBody({ [field]: '' }));
    add(`${field} blank`, withBody({ [field]: '   ' }));
    add(`${field} lone surrogate`, withBody({ [field]: `${value}\ud800` }));
    add(`${field} number`, withBody({ [field]: 7 }));
  }
  add('admissionEventRef leading space', { ...valid(), admissionEventRef: ' event://td36/binding' });
  add('admissionEventRef trailing space', { ...valid(), admissionEventRef: 'event://td36/binding ' });
  add('admissionEventRef NUL', { ...valid(), admissionEventRef: 'event://td36/binding\0' });
  add('admissionEventRef empty', { ...valid(), admissionEventRef: '' });
  add('admissionEventRef lone surrogate', { ...valid(), admissionEventRef: 'event://td36/\ud800' });
  for (const field of ['authorityBasisDigest', 'productSetDigest', 'lockDigest']) {
    add(`${field} not a digest`, withBody({ [field]: 'sha256:short' }));
  }
  const roots = () => ({ ...baseBody().roots });
  add('root not absolute', withRoots({ ...roots(), archiveRoot: 'relative/archive' }));
  add('root leading space', withRoots({ ...roots(), archiveRoot: ' /private/tmp/td36/archive' }));
  add('root trailing space', withRoots({ ...roots(), archiveRoot: '/private/tmp/td36/archive ' }));
  add('root NUL', withRoots({ ...roots(), archiveRoot: '/private/tmp/td36/archive\0' }));
  add('root lone surrogate', withRoots({ ...roots(), archiveRoot: '/private/tmp/td36/\ud800' }));
  add('root empty', withRoots({ ...roots(), archiveRoot: '' }));
  add('root number', withRoots({ ...roots(), archiveRoot: 7 }));
  add('extra roots key', withRoots({ ...roots(), otherRoot: '/private/tmp/td36/other' }));
  add('missing roots key', withRoots((({ archiveRoot: _a, ...rest }) => rest)(roots())));
  add('roots array', withRoots(ROOT_KEYS.map(key => `/private/tmp/td36/${key}`)));
  add('roots null', withRoots(null));
  add('roots string', withRoots('/private/tmp/td36'));
  add('roots null prototype', withRoots(Object.assign(Object.create(null), roots())));
  add('roots accessor', withRoots(Object.defineProperty(roots(), 'archiveRoot', { get: () => '/private/tmp/td36/archive', enumerable: true })));
  add('roots non-enumerable extra', withRoots(Object.defineProperty(roots(), 'otherRoot', { value: '/x', enumerable: false })));
  add('roots symbol extra', withRoots({ ...roots(), [Symbol('other')]: '/x' }));
  add('roots Proxy', withRoots(new Proxy(roots(), {})));
  add('bindingDigest mismatch', { ...valid(), bindingDigest: digestOf('other') });
  add('bindingId mismatch', { ...valid(), bindingId: 'workspace-binding://abiogenesis/other' });
  add('bindingId candidate prefix', { ...valid(), bindingId: valid().bindingId.replace('workspace-binding', 'workspace-binding-candidate') });
  add('body changed after digest', { ...valid(), lockId: 'lock://td36/changed' });
  for (const value of [null, undefined, [], 'workspace_binding', 7, true]) add(`non-record ${String(value)}`, value);
  add('array with binding fields', Object.assign([], valid()));
  return cases;
}

const verdict = (check, ...args) => {
  try { return check(...args) ? 'accept' : 'refuse'; } catch { return 'throw'; }
};

// The cases a weaker copy accepted and the owner refuses. Each is a tightening.
const TIGHTENED_FROM_CONSTRUCTION = [
  'workspaceId leading space', 'workspaceId trailing space', 'workspaceId trailing newline',
  'authorityBasisId leading space', 'authorityBasisId trailing space', 'authorityBasisId trailing newline',
  'authorizedActorRef leading space', 'authorizedActorRef trailing space', 'authorizedActorRef trailing newline',
  'productSetId leading space', 'productSetId trailing space', 'productSetId trailing newline',
  'lockId leading space', 'lockId trailing space', 'lockId trailing newline',
  'admissionEventRef leading space', 'admissionEventRef trailing space',
  'root trailing space',
].sort();
// worksite_effect.ts also checked no record shape and no top-level key set,
// and digested the body without admitting it as I-JSON.
const TIGHTENED_FROM_EFFECT = [
  ...TIGHTENED_FROM_CONSTRUCTION,
  'extra top-level key', 'extra top-level key with an empty name',
  'roots accessor', 'roots symbol extra', 'roots non-enumerable extra', 'roots Proxy',
  'array with binding fields',
  'workspaceId lone surrogate', 'authorityBasisId lone surrogate', 'authorizedActorRef lone surrogate',
  'productSetId lone surrogate', 'lockId lone surrogate', 'root lone surrogate',
].sort();

test('the workspace-binding owner gives the strictest copy\'s verdict and accepts nothing a copy refused', t => {
  const owner = environment.isExactWorkspaceBinding;
  assert.equal(typeof owner, 'function', 'product/environment.js exports isExactWorkspaceBinding');
  const cases = bindingCases();
  const tightened = { construction: [], effect: [], materialization: [] };
  for (const [name, value] of cases) {
    const ownerVerdict = verdict(owner, value);
    assert.notEqual(ownerVerdict, 'throw', `${name}: the owner never throws`);
    assert.equal(ownerVerdict, verdict(commandExecutionBinding, value), `${name}: owner equals the command-execution copy`);
    const weaker = { construction: verdict(constructionBinding, value), effect: verdict(guardedEffectBinding, value),
      materialization: verdict(materializationBinding, value) };
    for (const [copy, copyVerdict] of Object.entries(weaker)) {
      if (ownerVerdict === 'accept') assert.equal(copyVerdict, 'accept', `${name}: owner accepts only what ${copy} accepted`);
      else if (copyVerdict === 'accept') tightened[copy].push(name);
    }
    if (ownerVerdict === 'accept') {
      const { kind: _k, schemaVersion: _s, bindingId, bindingDigest, admissionEventRef: _a, ...body } = value;
      assert.equal(sha256Canonical(body), bindingDigest, `${name}: accepted digest is the nine-field body digest`);
      assert.equal(bindingId, identity('workspace-binding://abiogenesis', bindingDigest));
    }
  }
  assert.ok(cases.filter(([, value]) => owner(value)).length >= 4, 'the case set holds accepted bindings');
  t.diagnostic(`binding cases ${cases.length}; tightened from construction ${tightened.construction.length}, ` +
    `from worksite_effect ${tightened.effect.length}, from materialization ${tightened.materialization.length}`);
  t.diagnostic(`tightened from worksite_effect: ${tightened.effect.sort().join('; ')}`);
  assert.deepEqual(tightened.construction.sort(), TIGHTENED_FROM_CONSTRUCTION);
  assert.deepEqual(tightened.effect.sort(), TIGHTENED_FROM_EFFECT);
  t.diagnostic(`tightened from materialization: ${tightened.materialization.sort().join('; ')}`);
});

test('the authority join owner gives the strictest copy\'s verdict and accepts nothing a copy refused', () => {
  const owner = environment.exactWorkspaceAuthorityJoin;
  assert.equal(typeof owner, 'function', 'product/environment.js exports exactWorkspaceAuthorityJoin');
  const strict = joinWith(commandExecutionBinding), construction = joinWith(constructionBinding), effect = joinWith(effectBinding);
  const otherBinding = bindingOver({ ...baseBody(), workspaceId: otherAuthority.workspaceId,
    authorityBasisId: otherAuthority.authorityBasisId, authorityBasisDigest: otherAuthority.authorityBasisDigest });
  const authorities = [['authority', authority], ['other authority', otherAuthority],
    ['authority with extra key', { ...authority, extra: 'x' }], ['null authority', null]];
  const bindings = [...bindingCases(), ['other-authority binding', otherBinding],
    ['binding with other workspaceId only', withBody({ workspaceId: 'workspace://td36/other' })],
    ['binding with other actor only', withBody({ authorizedActorRef: 'actor://td36/other' })]];
  let accepted = 0;
  for (const [authorityName, a] of authorities) for (const [bindingName, w] of bindings) {
    const name = `${authorityName} x ${bindingName}`, ownerVerdict = verdict(owner, a, w);
    assert.notEqual(ownerVerdict, 'throw', `${name}: the owner never throws`);
    assert.equal(ownerVerdict, verdict(strict, a, w), `${name}: owner equals the command-execution join`);
    if (ownerVerdict === 'accept') {
      accepted++;
      assert.equal(verdict(construction, a, w), 'accept', `${name}: construction join accepted it`);
      assert.equal(verdict(effect, a, w), 'accept', `${name}: worksite_effect join accepted it`);
    }
  }
  assert.ok(accepted >= 4);
  assert.equal(owner(otherAuthority, otherBinding), true);
  assert.equal(owner(authority, otherBinding), false);
});

function grantOver(patch = {}, definitionKey = { operationId: 'abg.operation.run.invoke', memberKey: 'invoke' }) {
  const workspace = valid();
  const body = {
    definitionKey, definitionRef: 'definition://td36/invoke', definitionDigest: digestOf('definition'),
    capabilityDefinition: { graphId: 'capability-graph://td36/test', graphVersion: '5.0.0', graphDigest: digestOf('capability-graph'),
      capabilityId: 'capability://abiogenesis/run.invoke', capabilityDefinitionRef: 'capability-definition://td36/test',
      capabilityDefinitionDigest: digestOf('capability-definition') },
    operationContract: {
      contractCatalog: { productId: 'product://td36/test', productContentDigest: digestOf('product'), catalogId: 'catalog://td36/test',
        catalogVersion: '5.0.0', catalogDigest: digestOf('catalog') },
      flatRow: { contractId: 'contract://td36/request', contractVersion: '5.0.0', contractDigest: digestOf('contract') },
      nestedSelector: { selectorKind: 'flat_contract', definitionKey: null, slot: null, definitionRef: null },
    }, operationId: definitionKey.operationId, capabilityRef: 'capability://abiogenesis/run.invoke', actorRef: manifest.authorizedActorRef,
    approvalRef: authority.authorityBasisId, approvalDigest: authority.authorityBasisDigest,
    policyRef: 'policy://td36/test', policyDigest: digestOf('policy'), scopeRef: workspace.bindingId, scopeDigest: workspace.bindingDigest,
    authorityBasisRef: authority.authorityBasisId, authorityBasisDigest: authority.authorityBasisDigest, ...patch,
  };
  const grantDigest = sha256Canonical(body);
  return { kind: 'capability_grant', schemaVersion: '5.0.0', grantRef: identity('capability-grant://abiogenesis', grantDigest), grantDigest, ...body };
}

test('the direct-grant owner gives both copies\' verdict', () => {
  const owner = invocation.isExactDirectGrant;
  assert.equal(typeof owner, 'function', 'product/invocation.js exports isExactDirectGrant');
  const grants = [
    ['invoke', grantOver()],
    ['start', grantOver({}, { operationId: 'abg.operation.run.invoke', memberKey: 'start' })],
    ['continue member', grantOver({}, { operationId: 'abg.operation.run.invoke', memberKey: 'continue' })],
    ['other operation', grantOver({}, { operationId: 'abg.operation.run.continue', memberKey: 'invoke' })],
    ['operation and definition key disagree', grantOver({ operationId: 'abg.operation.run.invoke' }, { operationId: 'abg.operation.run.continue', memberKey: 'invoke' })],
    ['other actor', grantOver({ actorRef: 'actor://td36/other' })],
    ['other scope ref', grantOver({ scopeRef: 'workspace-binding://abiogenesis/other' })],
    ['other scope digest', grantOver({ scopeDigest: digestOf('other') })],
    ['grant with extra key', { ...grantOver(), extra: 'x' }],
    ['grant digest mismatch', { ...grantOver(), grantDigest: digestOf('other') }],
    ['null grant', null],
  ];
  const workspaces = [['binding', valid()], ['binding with other actor', withBody({ authorizedActorRef: 'actor://td36/other' })]];
  let accepted = 0;
  for (const [grantName, g] of grants) for (const [workspaceName, w] of workspaces) {
    const name = `${grantName} x ${workspaceName}`, ownerVerdict = verdict(owner, g, w);
    assert.notEqual(ownerVerdict, 'throw', `${name}: the owner never throws`);
    assert.equal(ownerVerdict, verdict(directGrant, g, w), name);
    if (ownerVerdict === 'accept') accepted++;
  }
  assert.equal(accepted, 2, 'invoke and start against the exact binding');
});

test('the binding-candidate owner accepts only what the catalog copy accepted', t => {
  const owner = environment.isWorkspaceBindingCandidateInResolvedLock;
  const lock = { lockId: baseBody().lockId, lockDigest: baseBody().lockDigest };
  const candidates = bindingCases().filter(([, value]) => isRecord(value) && !Array.isArray(value)).map(([name, value]) => {
    const candidate = { ...value };
    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor.enumerable) Object.defineProperty(candidate, key, descriptor);
    }
    delete candidate.admissionEventRef;
    if (candidate.kind === 'workspace_binding') candidate.kind = 'workspace_binding_candidate';
    return [name, candidate];
  });
  candidates.push(['candidate with admissionEventRef kept', { ...valid(), kind: 'workspace_binding_candidate' }]);
  candidates.push(['candidate under other lock', (() => { const v = withBody({ lockId: 'lock://td36/other' });
    delete v.admissionEventRef; return { ...v, kind: 'workspace_binding_candidate' }; })()]);
  let accepted = 0; const tightened = [];
  for (const [name, value] of candidates) {
    const ownerVerdict = verdict(owner, value, lock);
    assert.notEqual(ownerVerdict, 'throw', `${name}: the owner never throws`);
    const copyVerdict = verdict(catalogCandidate, value, lock);
    if (ownerVerdict === 'accept') { accepted++; assert.equal(copyVerdict, 'accept', `${name}: owner accepts only what catalog accepted`); }
    else if (copyVerdict === 'accept') tightened.push(name);
  }
  assert.ok(accepted >= 4);
  assert.ok(tightened.includes('candidate with admissionEventRef kept'));
  t.diagnostic(`candidate cases ${candidates.length}; tightened from catalog ${tightened.length}: ${tightened.sort().join('; ')}`);
});

const ROW_BODY = () => ({
  requirementKey: 'requirement://td36/test', requirementKeyDigest: digestOf('requirement'), catalogBasisDigest: digestOf('catalog-basis'),
  catalogViewDigest: digestOf('catalog-view'), publicationDigest: digestOf('publication'), programValidationRef: 'program-validation://td36/test',
  graphFunctionRef: 'graph-function://abiogenesis/worksite/file-parents@5', graphFunctionDigest: digestOf('graph'),
  graphFunctionOwnerProductId: 'product://td36/test', graphFunctionPublicationDigest: digestOf('graph-publication'),
  nodeRef: 'node://td36/test', programLocusRef: 'program-locus://td36/test', implementationBindingRef: 'implementation-binding://td36/test',
  implementationRef: 'implementation://td36/test', packageName: '@abiogenesis/typescript-tenant', packageVersion: '5.0.0-dev.286',
  modulePath: 'build/code/src/implementation/worksite_file_replace.js', namedSymbol: 'realizeWorksiteFileParents',
  implementationOwnerProductId: 'product://td36/test', computeRegime: 'F_D', inputContractRef: 'contract://td36/input',
  outputContractRef: 'contract://td36/output', failureContractRef: 'contract://td36/failure', refusalContractRef: 'contract://td36/refusal',
  implementationBindingDigest: digestOf('implementation-binding'), implementationDescriptorDigest: digestOf('implementation-descriptor'),
  implementationPublicationDigest: digestOf('implementation-publication'),
});
function rowOver(body, extra = {}) {
  const leafResolutionCandidateDigest = safeHash(body);
  return { kind: 'admitted_implementation_resolution_row', schemaVersion: '5.0.0', disposition: 'admitted',
    leafResolutionCandidateRef: identity('leaf-resolution-candidate://abiogenesis', leafResolutionCandidateDigest),
    leafResolutionCandidateDigest, ...body, ...extra };
}
const validRow = () => rowOver(ROW_BODY());
const rowWith = patch => rowOver({ ...ROW_BODY(), ...patch });

function rowCases() {
  const cases = [];
  const add = (name, value) => cases.push([name, value]);
  add('valid F_D', validRow());
  add('valid F_P', rowWith({ computeRegime: 'F_P' }));
  add('valid, frozen', Object.freeze(validRow()));
  add('valid, null prototype', Object.assign(Object.create(null), validRow()));
  add('padded string field (both copies accept)', rowWith({ nodeRef: ' node://td36/test ' }));
  add('extra key', { ...validRow(), extra: 'x' });
  add('extra non-enumerable key', Object.defineProperty(validRow(), 'extra', { value: 'x', enumerable: false }));
  add('extra symbol key', { ...validRow(), [Symbol('extra')]: 'x' });
  add('accessor field', (() => { const v = validRow(); const value = v.nodeRef; delete v.nodeRef;
    return Object.defineProperty(v, 'nodeRef', { get: () => value, enumerable: true }); })());
  add('non-enumerable field', (() => { const v = validRow(); const value = v.nodeRef; delete v.nodeRef;
    return Object.defineProperty(v, 'nodeRef', { value, enumerable: false }); })());
  for (const key of Object.keys(validRow())) { const v = validRow(); delete v[key]; add(`missing ${key}`, v); }
  add('kind', { ...validRow(), kind: 'leaf_implementation_resolution_candidate' });
  add('schemaVersion', { ...validRow(), schemaVersion: '5.0.1' });
  add('disposition', { ...validRow(), disposition: 'refused' });
  add('computeRegime F_H', rowWith({ computeRegime: 'F_H' }));
  add('string field NUL', rowWith({ nodeRef: 'node://td36/\0' }));
  add('string field empty', rowWith({ nodeRef: '' }));
  add('string field blank', rowWith({ nodeRef: '  ' }));
  add('string field lone surrogate', rowWith({ nodeRef: 'node://td36/\ud800' }));
  add('string field number', rowWith({ nodeRef: 7 }));
  add('digest field not a digest', rowWith({ publicationDigest: 'sha256:short' }));
  add('candidate digest mismatch', { ...validRow(), leafResolutionCandidateDigest: digestOf('other') });
  add('candidate ref mismatch', { ...validRow(), leafResolutionCandidateRef: 'leaf-resolution-candidate://abiogenesis/other' });
  add('body changed after digest', { ...validRow(), nodeRef: 'node://td36/changed' });
  for (const value of [null, [], 'row', 7]) add(`non-record ${String(value)}`, value);
  return cases;
}

test('the admitted-row owner gives the strictest copy\'s verdict and accepts nothing worksite_effect refused', t => {
  const owner = executionBasis.isExactAdmittedImplementationRow;
  assert.equal(typeof owner, 'function', 'abg/execution_basis.js exports isExactAdmittedImplementationRow');
  const cases = rowCases(), tightened = [];
  for (const [name, value] of cases) {
    const ownerVerdict = verdict(owner, value);
    assert.notEqual(ownerVerdict, 'throw', `${name}: the owner never throws`);
    assert.equal(ownerVerdict, verdict(leafAuthorityRow, value), `${name}: owner equals the leaf-authority copy`);
    const effectVerdict = verdict(effectRow, value);
    if (ownerVerdict === 'accept') {
      assert.equal(effectVerdict, 'accept', `${name}: owner accepts only what worksite_effect accepted`);
      const { kind: _k, schemaVersion: _s, disposition: _d, leafResolutionCandidateRef: ref, leafResolutionCandidateDigest: digest, ...body } = value;
      assert.equal(sha256Canonical(body), digest);
      assert.equal(ref, identity('leaf-resolution-candidate://abiogenesis', digest));
    } else if (effectVerdict === 'accept') tightened.push(name);
  }
  assert.equal(cases.filter(([, value]) => owner(value)).length, 5);
  t.diagnostic(`row cases ${cases.length}; tightened from worksite_effect ${tightened.length}: ${tightened.sort().join('; ')}`);
  assert.deepEqual(tightened.sort(), ['accessor field', 'extra non-enumerable key', 'extra symbol key',
    'string field lone surrogate'].sort());
});
