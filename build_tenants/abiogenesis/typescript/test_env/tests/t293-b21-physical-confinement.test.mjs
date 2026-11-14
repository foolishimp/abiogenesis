// T-293 B21 / RC14: physical confinement across aliases.
// Real host observations prove the protected-Data bridge, missing-suffix
// aliases, lawful siblings and installed-root R exclusion; controlled native
// metadata (patched exports of the one loaded observer) proves topology
// uncertainty handling. Refusals are proved before effects by watching the
// effect syscalls, not by final-tree rollback. Cold owner coordinates: no ABG
// admission, provider, installed-package or release-qualification claim.
import assert from 'node:assert/strict';
import test from 'node:test';
import { syncBuiltinESMExports } from 'node:module';
import fs from 'node:fs/promises';
import { closeSync, constants, lstatSync, openSync, realpathSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildRoot, loadWorksiteOwner, worksiteFixture } from '../support/t287-generic-job-worksite.mjs';

const product = await loadWorksiteOwner();
const load = path => import(pathToFileURL(join(buildRoot, path)).href);
const observation = await load('shared/physical_path_observation.js');
const relation = await load('shared/physical_path_relation.js');
const DATA = '/System/Volumes/Data';
const MNT_UNION = 0x20, MNT_LOCAL = 0x1000;
const declaredTarget = process.platform === 'darwin' && process.arch === 'arm64';
const loaded = observation.physicalPathNative();
const native = typeof loaded === 'string' ? null : loaded;

const dataAlias = path => DATA + path;
/** The B21 host premise: the path and its Data spelling are one directory and both are realpath-self-canonical. */
function aliasHolds(path) {
  if (process.platform !== 'darwin') return false;
  try {
    const a = lstatSync(path, { bigint: true }), b = lstatSync(dataAlias(path), { bigint: true });
    return a.dev === b.dev && a.ino === b.ino && realpathSync.native(path) === path && realpathSync.native(dataAlias(path)) === dataAlias(path);
  } catch { return false; }
}

async function watched(run, extra = []) {
  const names = ['mkdir', 'link', 'rename', 'rmdir', 'unlink', ...extra];
  const originals = Object.fromEntries(names.map(name => [name, fs[name]]));
  const calls = [];
  for (const name of names) fs[name] = async (...args) => {
    calls.push({ syscall: name, path: String(args[0]) });
    return originals[name](...args);
  };
  syncBuiltinESMExports();
  try { return { result: await run(), calls }; }
  finally { Object.assign(fs, originals); syncBuiltinESMExports(); }
}
const effects = calls => calls.filter(call => ['mkdir', 'link', 'rename', 'rmdir', 'unlink'].includes(call.syscall));

/** Patches exports of the one loaded native observer for controlled metadata. */
async function withNative(patch, run) {
  const originals = Object.fromEntries(Object.keys(patch).map(name => [name, native[name]]));
  Object.assign(native, patch);
  try { return await run(originals); } finally { Object.assign(native, originals); }
}

async function fixture(t) {
  const env = await worksiteFixture(product);
  t.after(() => fs.rm(env.scratch, { recursive: true, force: true }));
  await fs.mkdir(join(env.canonicalRoot, 'src'));
  await fs.writeFile(join(env.canonicalRoot, 'src', 'kept.txt'), 'kept\n');
  await fs.mkdir(join(env.scratch, 'install'));
  await fs.writeFile(join(env.scratch, 'install', 'payload.js'), 'payload\n');
  return env;
}
const writeRoot = (env, path, protectedInstallRoots) => product.checkWorksiteWriteRoots({ workspaceAuthorityBasis: env.workspaceAuthorityBasis,
  workspaceBinding: env.workspaceBinding, writeRoots: [path], protectedInstallRoots });
async function fileParents(env, relativePath, protectedInstallRoots) {
  const request = await env.request([relativePath], { protectedInstallRoots });
  return request.kind === 'worksite_file_parents_request' ? env.create(request, { protectedInstallRoots }) : request;
}
async function fileReplace(env, relativePath, protectedInstallRoots) {
  const { workspaceAuthorityBasis, workspaceBinding, capabilityGrant, executionBasis, cCall, implementationSet } = env;
  const subject = product.constructWorksiteSubject({ workspaceAuthorityBasis, workspaceBinding, relativePath,
    subjectUri: pathToFileURL(resolve(env.canonicalRoot, ...relativePath.split('/'))).href });
  const predecessorObservation = await product.observeWorksiteSubject(workspaceAuthorityBasis, workspaceBinding, subject);
  assert.equal(predecessorObservation.kind, 'worksite_observation', JSON.stringify(predecessorObservation));
  const request = product.constructWorksiteFileReplaceRequest({ workspaceAuthorityBasis, workspaceBinding, capabilityGrant,
    subject, territory: env.territory, predecessorObservation, replacementBytes: Buffer.from('b21 bytes\n') });
  const authorization = product.constructWorksiteEffectAuthorization({ workspaceBinding, request, executionBasis, cCall, implementationSet });
  return product.replaceWorksiteFile({ workspaceAuthorityBasis, workspaceBinding, request, executionBasis, cCall, implementationSet, authorization, protectedInstallRoots });
}
const context = (env, readRoots, protectedInstallRoots) => product.observeWorksiteContext({ workspaceAuthorityBasis: env.workspaceAuthorityBasis,
  workspaceBinding: env.workspaceBinding, protectedInstallRoots, readRoots, maxFiles: 50, maxBytes: 100000 });
const verdict = value => value === null ? 'admitted' : `${value.kind} ${value.code ?? value.disposition ?? ''}: ${value.message ?? ''}`;

test('the native observer loads lazily from build/native on the declared Darwin arm64 target', { skip: !declaredTarget && 'declared native target is Darwin arm64 only' }, () => {
  assert.notEqual(native, null, String(loaded));
  assert.deepEqual({ ...native.target }, { platform: 'darwin', arch: 'arm64', abi: 'abg-physical-path/1', nodeApiVersion: 8, mountPopulationLimit: 4096 });
  assert.equal(observation.physicalPathNative(), native, 'one cached module');
  const population = native.mountPopulation(observation.PHYSICAL_MOUNT_POPULATION_LIMIT);
  assert.equal(population.complete, true);
  assert.equal(population.count, population.entries.length);
  assert.ok(population.entries.some(row => row.mntonname.toString() === '/'));
});

test('actual protected Data bridge: unmatched lexical ancestors and realpath do not separate', async t => {
  const env = await fixture(t);
  if (!aliasHolds(env.canonicalRoot)) return t.skip('host premise absent: no /System/Volumes/Data alias of the worksite');
  assert.equal(realpathSync.native(DATA), DATA, 'protected Data is realpath-self-canonical');
  assert.equal(realpathSync.native(env.canonicalRoot), env.canonicalRoot, 'the worksite is realpath-self-canonical');
  const ancestors = path => path.split('/').map((_, i, parts) => parts.slice(0, i + 1).join('/') || '/');
  assert.deepEqual(ancestors(env.canonicalRoot).filter(a => ancestors(DATA).includes(a)), ['/'], 'lexical ancestor lists share only /');
  for (const installs of [[DATA], [dataAlias(env.canonicalRoot)], [dataAlias(join(env.canonicalRoot, 'src'))]]) {
    for (const [site, run] of [
      ['native write root', () => writeRoot(env, 'src', installs)],
      ['file parents', () => fileParents(env, 'src/new/x.txt', installs)],
      ['file replace', () => fileReplace(env, 'src/kept.txt', installs)],
    ]) {
      const before = await fs.readFile(join(env.canonicalRoot, 'src', 'kept.txt'), 'utf8');
      const { result, calls } = await watched(run);
      assert.equal(result?.code, 'subject_outside_territory', `${site} ${installs}: ${verdict(result)}`);
      assert.match(result.message, /overlaps a protected install\/runtime root/);
      assert.equal(result.phase, undefined, 'no physical outcome');
      assert.deepEqual(effects(calls), [], `${site}: refusal precedes every effect syscall`);
      assert.equal(await fs.readFile(join(env.canonicalRoot, 'src', 'kept.txt'), 'utf8'), before);
    }
  }
  const sync = observation.runPhysicalSync(relation.physicalSeparationProgram({ targets: [env.canonicalRoot], protectedRoots: [DATA], mode: 'enclosing' }));
  assert.equal(sync?.separation, 'overlap', 'the synchronous C2 driver sees the same bridge');
});

test('missing suffix aliases overlap; distinct missing siblings stay lawful', async t => {
  const env = await fixture(t);
  if (!aliasHolds(env.canonicalRoot)) return t.skip('host premise absent: no /System/Volumes/Data alias of the worksite');
  const installs = [dataAlias(join(env.canonicalRoot, 'fresh', 'protected'))];
  for (const [site, run] of [
    ['file parents', () => fileParents(env, 'fresh/protected/x.txt', installs)],
    ['enclosing write root', () => writeRoot(env, 'fresh', installs)],
    ['equal write root', () => writeRoot(env, 'fresh/protected', installs)],
    ['inner write root', () => writeRoot(env, 'fresh/protected/sub', installs)],
  ]) {
    const { result, calls } = await watched(run);
    assert.equal(result?.code, 'subject_outside_territory', `${site}: ${verdict(result)}`);
    assert.deepEqual(effects(calls), [], site);
  }
  assert.deepEqual(await fs.readdir(env.canonicalRoot), ['src'], 'no fresh/ was created');
  // A case variant of a missing protected name is uncertainty, not an observed alias.
  const caseVariant = await watched(() => fileParents(env, 'fresh/protected/x.txt', [dataAlias(join(env.canonicalRoot, 'fresh', 'PROTECTED'))]));
  assert.equal(caseVariant.result?.code, 'invalid_coordinate', verdict(caseVariant.result));
  assert.match(caseVariant.result.message, /separation cannot be established/);
  assert.deepEqual(effects(caseVariant.calls), []);
  assert.equal(await writeRoot(env, 'fresh/other', installs), null);
  const parents = await fileParents(env, 'fresh/other/x.txt', installs);
  assert.equal(parents.kind, 'worksite_file_parents_result', verdict(parents));
});

test('lawful siblings across the Data alias admit every owner site', async t => {
  const env = await fixture(t);
  if (!aliasHolds(env.canonicalRoot)) return t.skip('host premise absent: no /System/Volumes/Data alias of the worksite');
  const installs = [dataAlias(join(env.scratch, 'install')), dataAlias(join(env.canonicalRoot, 'vendor', 'install'))];
  for (const path of ['src', 'src/new', 'vendor/cache', 'new-branch']) assert.equal(await writeRoot(env, path, installs), null, path);
  const parents = await fileParents(env, 'src/new/x.txt', installs);
  assert.equal(parents.kind, 'worksite_file_parents_result', verdict(parents));
  const replaced = await fileReplace(env, 'src/kept.txt', installs);
  assert.equal(replaced.kind, 'worksite_file_replace_result', verdict(replaced));
  const observed = await context(env, ['src'], installs);
  assert.equal(observed.kind, 'worksite_context_observation', verdict(observed));
});

test('installed-root R exclusion refuses before listing or reading protected content', async t => {
  const env = await fixture(t);
  const installDir = join(env.canonicalRoot, 'vendor', 'install'), secret = join(installDir, 'secret.txt');
  await fs.mkdir(installDir, { recursive: true });
  await fs.writeFile(secret, 'protected\n');
  // Lexical install root: the existing reading already refuses.
  assert.equal((await context(env, ['vendor'], [installDir])).code, 'subject_outside_territory');
  if (!aliasHolds(env.canonicalRoot)) return t.skip('host premise absent: no /System/Volumes/Data alias of the worksite');
  const { result, calls } = await watched(() => context(env, ['vendor'], [dataAlias(installDir)]), ['open', 'readdir', 'readFile']);
  assert.equal(result?.code, 'subject_outside_territory', verdict(result));
  assert.equal(calls.some(call => call.path === secret), false, 'no protected file is opened');
  assert.equal(calls.some(call => call.syscall === 'readdir' && call.path === installDir), false, 'the protected directory is not listed');
  assert.ok(calls.some(call => call.syscall === 'readdir' && call.path === join(env.canonicalRoot, 'vendor')), 'the enclosing read directory may be listed');
  // Empty W: context alone still carries and enforces the install roots.
  const empty = await context(env, ['.'], [dataAlias(installDir)]);
  assert.equal(empty.code, 'subject_outside_territory', verdict(empty));
  const sibling = await context(env, ['src'], [dataAlias(installDir)]);
  assert.equal(sibling.kind, 'worksite_context_observation', verdict(sibling));
});

test('controlled mount topology: relevant uncertainty refuses; unrelated mounts do not', { skip: native === null && 'native observer unavailable on this host' }, async t => {
  const env = await fixture(t);
  await fs.mkdir(join(env.scratch, 'elsewhere'));
  const installs = [join(env.scratch, 'install')];
  assert.equal(await writeRoot(env, 'src', installs), null, 'baseline lawful sibling');
  const fd = openSync(env.canonicalRoot, constants.O_RDONLY | constants.O_DIRECTORY);
  let anchorMount;
  try { anchorMount = native.descriptorMount(fd); } finally { closeSync(fd); }
  let serial = 0;
  const fake = (mntonname, { fstypename = 'smbfs', flags = 0, mntfromname = '//fixture@server/share' } = {}) => ({
    fsid: [0x7ff00000 + (++serial), 77], type: 99, subtype: 0, flags, flagsExt: 0, owner: 501,
    fstypename: Buffer.from(fstypename), mntonname: Buffer.from(mntonname), mntfromname: Buffer.from(mntfromname) });
  const withExtra = (extra, run) => withNative({}, async () => {
    const original = native.mountPopulation;
    native.mountPopulation = limit => { const real = original(limit); return { ...real, count: real.count + extra.length, entries: [...real.entries, ...extra] }; };
    try { return await run(); } finally { native.mountPopulation = original; }
  });
  const refused = async (label, run) => {
    const { result, calls } = await watched(run);
    assert.equal(result?.code, 'invalid_coordinate', `${label}: ${verdict(result)}`);
    assert.match(result.message, /separation cannot be established/, label);
    assert.deepEqual(effects(calls), [], label);
  };
  // Unrelated network and nullfs mounts outside the compared scopes.
  await withExtra([fake(join(env.scratch, 'elsewhere', 'net')), fake('/Volumes/abg-t293-unrelated', { fstypename: 'afpfs' }),
    fake(join(env.scratch, 'elsewhere', 'translocated'), { fstypename: 'nullfs', flags: MNT_LOCAL, mntfromname: join(env.canonicalRoot, 'src') })], async () => {
    assert.equal(await writeRoot(env, 'src', installs), null, 'unrelated mounts do not reject a lawful sibling');
    assert.equal((await context(env, ['src'], installs)).kind, 'worksite_context_observation');
  });
  // A network mount beneath recursive W; an exact file target need not exclude it.
  await withExtra([fake(join(env.canonicalRoot, 'src', 'net'))], async () => {
    await refused('network attachment beneath W', () => writeRoot(env, 'src', installs));
    const parents = await env.request(['src/other.txt'], { protectedInstallRoots: installs });
    assert.equal(parents.kind, 'worksite_file_parents_request', 'exact file effects ignore unrelated descendant mounts');
  });
  await withExtra([fake(join(env.scratch, 'install', 'net'))], () => refused('network attachment beneath a protected install', () => writeRoot(env, 'src', installs)));
  await withExtra([fake(join(env.canonicalRoot, 'src', 'disk'), { fstypename: 'apfs', flags: MNT_LOCAL, mntfromname: '/dev/disk99s1' })],
    async () => assert.equal(await writeRoot(env, 'src', installs), null, 'one unique local block-device APFS attachment is classifiable'));
  await withExtra([fake(join(env.canonicalRoot, 'src', 'union'), { fstypename: 'apfs', flags: MNT_LOCAL | MNT_UNION, mntfromname: '/dev/disk98s1' })],
    () => refused('union attachment beneath W', () => writeRoot(env, 'src', installs)));
  await withExtra([{ ...anchorMount, mntonname: Buffer.from('/Volumes/abg-t293-duplicate') }],
    () => refused('duplicate anchor membership', () => writeRoot(env, 'src', installs)));
  await withNative({ mountPopulation: limit => ({ complete: false, probeCount: limit, count: 0, entries: [] }) },
    () => refused('incomplete population', () => writeRoot(env, 'src', installs)));
  await withNative({}, async () => {
    const original = native.mountPopulation;
    let reads = 0;
    native.mountPopulation = limit => { const real = original(limit); reads += 1;
      return reads % 2 === 0 ? { ...real, count: real.count + 1, entries: [...real.entries, fake('/Volumes/abg-t293-arrived')] } : real; };
    try { await refused('membership changed during acquisition', () => writeRoot(env, 'src', installs)); }
    finally { native.mountPopulation = original; }
  });
  await withNative({ backingPath: () => { throw Object.assign(new Error('controlled'), { code: 'EIO' }); } },
    () => refused('native descriptor failure', () => writeRoot(env, 'src', installs)));
  const unsupported = () => { throw Object.assign(new Error('controlled unsupported API'), { code: 'ENOTSUP' }); };
  await withNative({ backingPath: unsupported, descriptorMount: unsupported, mountPopulation: unsupported }, async () => {
    await refused('unsupported observer: lawful sibling', () => writeRoot(env, 'src', installs));
    await refused('unsupported observer: context node', () => context(env, ['src'], installs));
  });
  // Demonstrated overlap is decided before separation support is required.
  if (aliasHolds(env.canonicalRoot)) {
    await withNative({ mountPopulation: limit => ({ complete: false, probeCount: limit, count: 0, entries: [] }) }, async () => {
      assert.equal((await writeRoot(env, 'src', [DATA])).code, 'subject_outside_territory', 'overlap precedes the population requirement');
    });
  }
});

test('one relation program serves the synchronous C2 and asynchronous C0/helper drivers identically', { skip: native === null && 'native observer unavailable on this host' }, async t => {
  const env = await fixture(t);
  const archive = join(env.scratch, 'archive-root');
  await fs.mkdir(archive);
  const cases = [
    { targets: [archive], protectedRoots: [join(env.scratch, 'install')], mode: 'enclosing' },
    { targets: [archive], protectedRoots: [join(archive, 'nested-product')], mode: 'enclosing' },
    { targets: [join(env.canonicalRoot, 'src', 'kept.txt')], protectedRoots: [join(env.scratch, 'install')], mode: 'contained' },
    { targets: [join(env.scratch, 'state')], protectedRoots: [join(env.scratch, 'install')], mode: 'contained' },
    { targets: [join(env.scratch, 'install', 'inner')], protectedRoots: [join(env.scratch, 'install')], mode: 'contained' },
    { targets: [join(env.canonicalRoot, 'Σ')], protectedRoots: [join(env.canonicalRoot, 'ς')], mode: 'enclosing' },
  ];
  if (aliasHolds(env.canonicalRoot)) {
    cases.push({ targets: [archive], protectedRoots: [dataAlias(join(archive, 'nested-product'))], mode: 'enclosing' });
    cases.push({ targets: [join(env.scratch, 'install', 'inner')], protectedRoots: [dataAlias(join(env.scratch, 'install'))], mode: 'contained' });
  }
  const separations = [];
  for (const request of cases) {
    const sync = observation.runPhysicalSync(relation.physicalSeparationProgram(request));
    const async = await observation.runPhysicalAsync(relation.physicalSeparationProgram(request));
    assert.deepEqual(sync, async, JSON.stringify(request));
    separations.push(sync?.separation ?? 'separate');
  }
  assert.deepEqual(separations.slice(0, 6), ['separate', 'overlap', 'separate', 'separate', 'overlap', 'indeterminate']);
  if (separations.length > 6) assert.deepEqual(separations.slice(6), ['overlap', 'overlap'], 'C2 archive and directional checks see Data aliases');
});
