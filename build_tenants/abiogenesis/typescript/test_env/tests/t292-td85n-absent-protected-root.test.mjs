// T-293 B-05: prove refusal before filesystem effects, not final-tree rollback.
// Cold owner coordinates do not assert ABG admission or provider qualification.
// Unproved missing-name separation is invalid_coordinate, not an observed alias.
import assert from 'node:assert/strict';
import test from 'node:test';
import { syncBuiltinESMExports } from 'node:module';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { lstatSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadWorksiteOwner, worksiteFixture } from '../support/t287-generic-job-worksite.mjs';

const product = await loadWorksiteOwner();
const NFC = 'café';
const NFD = 'café';

async function volumeAliases(made, lookedUp) {
  const dir = await fs.realpath(await fs.mkdtemp(join(tmpdir(), 'abi5-td85n-volume-')));
  try {
    await fs.mkdir(join(dir, made));
    return await fs.lstat(join(dir, lookedUp)).then(() => true, () => false);
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
}
const aliased = { case: await volumeAliases('Probe', 'pROBE'), normalization: await volumeAliases(NFC, NFD) };
async function watchedEffects(run) {
  const names = ['mkdir', 'link', 'rename', 'rmdir', 'unlink'];
  const originals = Object.fromEntries(names.map(name => [name, fs[name]]));
  const calls = [];
  for (const name of names) fs[name] = async (...args) => {
    calls.push({ syscall: name, paths: args.slice(0, name === 'link' || name === 'rename' ? 2 : 1).map(String) });
    return originals[name](...args);
  };
  syncBuiltinESMExports();
  try { return { result: await run(), calls }; }
  finally { Object.assign(fs, originals); syncBuiltinESMExports(); }
}

const roots = (scratch, root) => ({
  toolchainRoot: join(scratch, 'toolchain'), productRoot: join(scratch, 'product'),
  eventLogRoot: join(root, '.abg', 'events'),
  projectionRoot: join(root, '.abg', 'projection'),
  archiveRoot: join(root, '.abg', NFC),
  runtimeStateRoot: join(root, '.ai-workspace', 'runtime'),
});
async function fixture(t) {
  const env = await worksiteFixture(product, { roots });
  t.after(() => fs.rm(env.scratch, { recursive: true, force: true }));
  await fs.mkdir(join(env.canonicalRoot, '.abg', 'events'), { recursive: true });
  await fs.writeFile(join(env.canonicalRoot, '.abg', 'events', 'runtime.events.jsonl'), 'log\n');
  await fs.mkdir(join(env.canonicalRoot, 'src'));
  await fs.writeFile(join(env.canonicalRoot, 'src', 'kept.txt'), 'kept\n');
  return env;
}

const shown = name => name.replace(/[^\x20-\x7e]/gu, c => `\\u${c.codePointAt(0).toString(16).padStart(4, '0')}`);
function tree(root) {
  const rows = [];
  const walk = (dir, prefix) => {
    for (const name of readdirSync(dir).sort()) {
      const path = join(dir, name);
      const relativePath = prefix === '' ? name : `${prefix}/${name}`;
      const status = lstatSync(path);
      rows.push(status.isDirectory() ? `${shown(relativePath)} dir`
        : `${shown(relativePath)} ${status.isFile() ? 'file' : 'other'} ${createHash('sha256').update(readFileSync(path)).digest('hex').slice(0, 16)}`);
      if (status.isDirectory()) walk(path, relativePath);
    }
  };
  walk(root, '');
  return rows;
}

async function fileParents(env, relativePath, protectedInstallRoots = []) {
  const request = await env.request([relativePath], { protectedInstallRoots });
  return request.kind === 'worksite_file_parents_request' ? env.create(request, { protectedInstallRoots }) : request;
}
async function fileReplace(env, relativePath, protectedInstallRoots = [], cold = false) {
  const { workspaceAuthorityBasis, workspaceBinding, capabilityGrant, executionBasis, cCall, implementationSet } = env;
  const subject = product.constructWorksiteSubject({ workspaceAuthorityBasis, workspaceBinding, relativePath,
    subjectUri: pathToFileURL(resolve(env.canonicalRoot, ...relativePath.split('/'))).href });
  if (subject.kind !== 'worksite_subject') return subject;
  const predecessorObservation = cold ? product.constructWorksiteObservation({ subject, state: 'absent' })
    : await product.observeWorksiteSubject(workspaceAuthorityBasis, workspaceBinding, subject);
  if (predecessorObservation.kind !== 'worksite_observation') return predecessorObservation;
  const request = product.constructWorksiteFileReplaceRequest({ workspaceAuthorityBasis, workspaceBinding, capabilityGrant,
    subject, territory: env.territory, predecessorObservation, replacementBytes: Buffer.from('td85n bytes\n') });
  assert.equal(request.kind, 'worksite_file_replace_request', JSON.stringify(request));
  const authorization = product.constructWorksiteEffectAuthorization({ workspaceBinding, request, executionBasis, cCall, implementationSet });
  assert.equal(authorization.kind, 'worksite_effect_authorization', JSON.stringify(authorization));
  return product.replaceWorksiteFile({ workspaceAuthorityBasis, workspaceBinding, request, executionBasis, cCall, implementationSet, authorization, protectedInstallRoots });
}
const writeRoot = (env, path, protectedInstallRoots = []) => product.checkWorksiteWriteRoots({ workspaceAuthorityBasis: env.workspaceAuthorityBasis,
  workspaceBinding: env.workspaceBinding, writeRoots: [path], protectedInstallRoots });

const sites = {
  'file parents': { run: fileParents, admitted: 'worksite_file_parents_result', refusal: 'invalid_coordinate' },
  'file replace': { run: fileReplace, admitted: 'worksite_file_replace_result', refusal: 'invalid_coordinate' },
  'native write root': { run: writeRoot, admitted: null, refusal: 'invalid_coordinate' },
};
const verdict = value => value === null ? 'admitted' : value.kind === 'worksite_effect_refusal'
  ? `refused ${value.code}${value.phase === undefined ? '' : ` (${value.phase})`}: ${value.message}` : `${value.kind} ${value.disposition}`;

// Stored spelling, beside or under the absent roots.
for (const [site, path] of [
  ['file parents', 'src/new/x.txt'], ['file parents', '.abg/other/x.txt'], ['file parents', '.ai-workspace/other/x.txt'],
  ['file replace', 'src/x.txt'], ['file replace', '.abg/other.txt'],
  ['native write root', 'src'], ['native write root', 'src/new'], ['native write root', '.abg/other'],
  ['native write root', '.ai-workspace/other'],
]) {
  test(`control: ${site} admits ${shown(path)} in stored spelling`, async t => {
    const env = await fixture(t);
    const before = tree(env.canonicalRoot);
    const result = await sites[site].run(env, path);
    t.diagnostic(`${verdict(result)}; before: ${before.join(', ')}; after: ${tree(env.canonicalRoot).join(', ')}`);
    assert.equal(result === null ? null : result.kind, sites[site].admitted, verdict(result));
  });
}

// Another spelling of an absent root, or a path beneath one.
for (const [site, path, kind, code = sites[site].refusal] of [
  ['file parents', '.abg/PROJECTION/x.txt', 'case'],
  ['file parents', '.abg/PROJECTION/a/b/x.txt', 'case'],
  ['file parents', '.AI-WORKSPACE/runtime/x.txt', 'case'],
  ['file parents', '.ai-workspace/RUNTIME/x.txt', 'case'],
  ['file parents', `.abg/${NFD}/x.txt`, 'normalization'],
  ['file replace', '.abg/PROJECTION', 'case'],
  ['file replace', '.abg/Projection', 'case'],
  ['file replace', `.abg/${NFD}`, 'normalization'],
  ['file replace', '.abg/PROJECTION/x.txt', 'case', 'target_parent_missing'],
  ['native write root', '.abg/PROJECTION', 'case'],
  ['native write root', '.abg/Projection', 'case'],
  ['native write root', '.abg/PROJECTION/sub', 'case'],
  ['native write root', '.AI-WORKSPACE', 'case'],
  ['native write root', '.AI-WORKSPACE/runtime', 'case'],
  ['native write root', '.ai-workspace/RUNTIME', 'case'],
  ['native write root', `.abg/${NFD}`, 'normalization'],
  ['native write root', `.abg/${NFD}/sub`, 'normalization'],
]) {
  test(`variant (${kind}): ${site} refuses ${shown(path)} before effects`, async t => {
    const env = await fixture(t);
    const before = tree(env.canonicalRoot);
    const { result, calls } = await watchedEffects(() => sites[site].run(env, path));
    assert.deepEqual(calls, [], 'no mkdir/link/rename or cleanup may precede this refusal');
    const after = tree(env.canonicalRoot);
    t.diagnostic(`${verdict(result)}; before: ${before.join(', ')}; after: ${after.join(', ')}`);
    assert.equal(result?.kind, 'worksite_effect_refusal', verdict(result));
    assert.equal(result.code, code, verdict(result));
    assert.equal(result.phase, undefined, 'no physical outcome is recorded');
    assert.deepEqual(after, before);
  });
}


const bindingNames = ['toolchainRoot', 'productRoot', 'eventLogRoot', 'runtimeStateRoot', 'projectionRoot', 'archiveRoot'];
for (const protectedOwner of [...bindingNames, 'admitted install']) {
  for (const site of Object.keys(sites)) test(`all protected owners: ${protectedOwner}; ${site} pre-effect refusal`, async t => {
    const env = await worksiteFixture(product, { roots: (scratch, root) => Object.fromEntries(bindingNames.map(name =>
      [name, name === protectedOwner ? join(root, 'protected') : join(scratch, name)])) });
    t.after(() => fs.rm(env.scratch, { recursive: true, force: true }));
    const installRoots = protectedOwner === 'admitted install' ? [join(env.canonicalRoot, 'protected')] : [];
    const run = site === 'file parents' ? () => fileParents(env, 'PROTECTED/nested/file.txt', installRoots)
      : site === 'file replace' ? () => fileReplace(env, 'PROTECTED', installRoots, true)
      : () => writeRoot(env, 'PROTECTED', installRoots);
    const { result, calls } = await watchedEffects(run);
    assert.equal(result?.code, 'invalid_coordinate', verdict(result));
    assert.match(result.message, /separation cannot be established/);
    assert.equal(result.phase, undefined);
    assert.deepEqual(calls, [], 'every protected owner is checked before any effect');
    assert.deepEqual(await fs.readdir(env.canonicalRoot), []);
  });
}

for (const [direction, protectedPath, path] of [
  ['equal', 'Σ', 'ς'], ['inside', 'Σ', 'ς/child'], ['enclosing', 'Σ/child', 'ς'],
]) test(`native Sigma/final-sigma ${direction} overlap refuses with uncertainty`, async t => {
  const env = await worksiteFixture(product, { roots: (scratch, root) => Object.fromEntries(bindingNames.map(name =>
    [name, name === 'projectionRoot' ? join(root, protectedPath) : join(scratch, name)])) });
  t.after(() => fs.rm(env.scratch, { recursive: true, force: true }));
  const { result, calls } = await watchedEffects(() => writeRoot(env, path));
  assert.equal(result?.code, 'invalid_coordinate');
  assert.match(result.message, /separation cannot be established/);
  assert.deepEqual(calls, []);
});

test('actual host Sigma/final-sigma alias witnesses the original lowercase/NFC gap', async t => {
  const aliases = await volumeAliases('Σ', 'ς');
  t.diagnostic(JSON.stringify({ platform: process.platform, aliases, ordinaryAliases: aliased }));
  assert.notEqual('Σ'.toLowerCase().normalize('NFC'), 'ς'.toLowerCase().normalize('NFC'));
  if (process.platform === 'darwin' && (await fs.statfs(tmpdir())).type === 26 && aliased.case) assert.equal(aliases, true);
});

test('parent owner rechecks all targets before the first mkdir', async t => {
  const env = await fixture(t);
  const request = await env.request(['src/allowed/one.txt', 'fresh/PROTECTED/two.txt']);
  assert.equal(request.kind, 'worksite_file_parents_request');
  const { result, calls } = await watchedEffects(() => env.create(request,
    { protectedInstallRoots: [join(env.canonicalRoot, 'fresh/protected')] }));
  assert.equal(result.code, 'invalid_coordinate');
  assert.deepEqual(calls, []);
});

for (const mode of ['unknown volume', 'metadata failure', 'Windows trailing-dot', 'Windows short-name']) {
  test(`${mode}: missing-name separation stays indeterminate`, async t => {
    const env = await fixture(t);
    const originalStatfs = fs.statfs;
    const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
    if (mode === 'unknown volume') fs.statfs = async () => ({ type: 0x4d44 });
    if (mode === 'metadata failure') fs.statfs = async () => { throw Object.assign(new Error('metadata unavailable'), { code: 'EIO' }); };
    if (mode.startsWith('Windows')) Object.defineProperty(process, 'platform', { ...originalPlatform, value: 'win32' });
    syncBuiltinESMExports();
    try {
      const path = mode === 'Windows trailing-dot' ? '.abg/projection.'
        : mode === 'Windows short-name' ? '.abg/PROJEC~1' : '.abg/other';
      const { result, calls } = await watchedEffects(() => writeRoot(env, path));
      assert.equal(result?.code, 'invalid_coordinate');
      assert.match(result.message, /separation cannot be established/);
      assert.deepEqual(calls, []);
      assert.equal(await writeRoot(env, 'src/new'), null, 'existing physical branch proves separation without name-model metadata');
    } finally {
      fs.statfs = originalStatfs;
      Object.defineProperty(process, 'platform', originalPlatform);
      syncBuiltinESMExports();
    }
  });
}

test('stronger physical evidence admits distinct Unicode siblings after an uncertain comparison', async t => {
  const env = await worksiteFixture(product);
  t.after(() => fs.rm(env.scratch, { recursive: true, force: true }));
  const protectedInstallRoots = [join(env.canonicalRoot, 'Σ')];
  assert.equal((await writeRoot(env, 'Ω', protectedInstallRoots)).code, 'invalid_coordinate');
  await fs.mkdir(protectedInstallRoots[0]);
  assert.equal(await writeRoot(env, 'Ω', protectedInstallRoots), null);
});

test('a later distinct ASCII branch proves separation after an uncertain Unicode component', async t => {
  const env = await worksiteFixture(product);
  t.after(() => fs.rm(env.scratch, { recursive: true, force: true }));
  assert.equal(await writeRoot(env, 'ς/ordinary', [join(env.canonicalRoot, 'Σ/protected')]), null);
});
