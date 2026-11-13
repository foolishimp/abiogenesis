// TD-85, narrow part (T-293 B-05). A protected root of the binding that does not
// exist yet must not be made by a worksite subject spelled in another letter case
// or normalization form: file parents must not create it, file replace must not
// leave a file at it, and native work's write-root check must not admit it. Each
// owner refuses with the refusal it already gives, and the tree listing (names,
// kinds, file digests) after the call equals the one before.
//   - The volume is tested for each kind of variant; a kind it does not alias is
//     skipped with the reason.
//   - Tests named "variant" are red on the build at 891a39c44 (run with
//     ABG_WORKSITE_BUILD_ROOT set to that build's `build/code/src`), except the
//     file-replace subject beneath the absent root, which has no parent and was
//     refused there too. Tests named "control" pass on both builds.
// Binding: `.abg/events` exists; `.abg/projection`, `.abg/<NFC café>` and
// `.ai-workspace/runtime` (whose parent is absent too) do not.
import assert from 'node:assert/strict';
import test from 'node:test';
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
const skip = kind => aliased[kind] ? false : `this volume does not alias names that differ only in ${kind}`;

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

async function fileParents(env, relativePath) {
  const request = await env.request([relativePath]);
  return request.kind === 'worksite_file_parents_request' ? env.create(request) : request;
}
async function fileReplace(env, relativePath) {
  const { workspaceAuthorityBasis, workspaceBinding, capabilityGrant, executionBasis, cCall, implementationSet } = env;
  const subject = product.constructWorksiteSubject({ workspaceAuthorityBasis, workspaceBinding, relativePath,
    subjectUri: pathToFileURL(resolve(env.canonicalRoot, ...relativePath.split('/'))).href });
  if (subject.kind !== 'worksite_subject') return subject;
  const predecessorObservation = await product.observeWorksiteSubject(workspaceAuthorityBasis, workspaceBinding, subject);
  if (predecessorObservation.kind !== 'worksite_observation') return predecessorObservation;
  const request = product.constructWorksiteFileReplaceRequest({ workspaceAuthorityBasis, workspaceBinding, capabilityGrant,
    subject, territory: env.territory, predecessorObservation, replacementBytes: Buffer.from('td85n bytes\n') });
  assert.equal(request.kind, 'worksite_file_replace_request', JSON.stringify(request));
  const authorization = product.constructWorksiteEffectAuthorization({ workspaceBinding, request, executionBasis, cCall, implementationSet });
  assert.equal(authorization.kind, 'worksite_effect_authorization', JSON.stringify(authorization));
  return product.replaceWorksiteFile({ workspaceAuthorityBasis, workspaceBinding, request, executionBasis, cCall, implementationSet, authorization });
}
const writeRoot = (env, path) => product.checkWorksiteWriteRoots({ workspaceAuthorityBasis: env.workspaceAuthorityBasis,
  workspaceBinding: env.workspaceBinding, writeRoots: [path] });

const sites = {
  'file parents': { run: fileParents, admitted: 'worksite_file_parents_result', refusal: 'aliased_subject' },
  'file replace': { run: fileReplace, admitted: 'worksite_file_replace_result', refusal: 'aliased_subject' },
  'native write root': { run: writeRoot, admitted: null, refusal: 'subject_outside_territory' },
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
  test(`variant (${kind}): ${site} refuses ${shown(path)} and leaves the tree unchanged`, { skip: skip(kind) }, async t => {
    const env = await fixture(t);
    const before = tree(env.canonicalRoot);
    const result = await sites[site].run(env, path);
    const after = tree(env.canonicalRoot);
    t.diagnostic(`${verdict(result)}; before: ${before.join(', ')}; after: ${after.join(', ')}`);
    assert.equal(result?.kind, 'worksite_effect_refusal', verdict(result));
    assert.equal(result.code, code, verdict(result));
    assert.equal(result.phase, undefined, 'no physical outcome is recorded');
    assert.deepEqual(after, before);
  });
}
